#ifdef STANDARD
/* STANDARD is defined. Don't use any MySQL functions */
#include <stdlib.h>
#include <stdio.h>
#include <string.h>
#ifdef __WIN__
typedef unsigned __int64 ulonglong;     /* Microsoft's 64 bit types */
typedef __int64 longlong;
#else
typedef unsigned long long ulonglong;
typedef long long longlong;
#endif /*__WIN__*/
#else
#include <string.h>
#include <my_global.h>
#include <my_sys.h>
#endif
#include <mysql.h>
#include <ctype.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>

#ifndef LOCAL_ADDRESS
#define LOCAL_ADDRESS "127.0.0.1"
#endif
#ifndef SERVER_PORT
#define SERVER_PORT 2048
#endif
#ifndef SERVER_ADDRESS
#define SERVER_ADDRESS "127.0.0.1"
#endif

// static pthread_mutex_t LOCK_hostname;
// static int _server = -1;

enum TRIGGER_TYPE {
    TRIGGER_CLOSE = 1,
    TRIGGER_UPDATE = 2,
    TRIGGER_INSERT = 3,
    TRIGGER_DELETE = 4
};

my_bool MySQLNotification_init(UDF_INIT *initid,
                               UDF_ARGS *args,
                               char *message) {
    int* server = malloc(sizeof(server));
    struct sockaddr_in remote, saddr;
    initid->ptr = (char*)server;

    // check the arguments format
    if (args->arg_count != 2) {
      strncpy(message, "MySQLNotification() requires two arguments", MYSQL_ERRMSG_SIZE);
      return 1;
    }

    if (args->arg_type[0] != INT_RESULT || args->arg_type[1] != INT_RESULT) {
      strcpy(message, "MySQLNotification() requires two integers");
      return 1;
    }

    // create a socket that will talk to our node server
    *server = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
    if (*server == -1) {
       strcpy(message, "Failed to create socket");
       return 1;
    }

    // bind to local address
    memset(&saddr, 0, sizeof(saddr));
    saddr.sin_family = AF_INET;
    saddr.sin_port = htons(0);
    // saddr.sin_addr.s_addr = inet_addr(LOCAL_ADDRESS);
    saddr.sin_addr.s_addr = INADDR_ANY;
    if (bind(*server, (struct sockaddr*)&saddr, sizeof(saddr)) != 0) {
        sprintf(message, "Failed to bind to %s", LOCAL_ADDRESS);
        return 1;
    }

    // connect to server
    memset(&remote, 0, sizeof(remote));
    remote.sin_family = AF_INET;
    remote.sin_port = htons(SERVER_PORT);
    remote.sin_addr.s_addr = inet_addr(SERVER_ADDRESS);
    if (connect(*server, (struct sockaddr*)&remote, sizeof(remote)) != 0) {
        sprintf(message, "Failed to connect to server %s:%d", SERVER_ADDRESS, SERVER_PORT);
        return 1;
    }

    return 0;
}

void MySQLNotification_deinit(UDF_INIT *initid) {
    // close server socket
    int* server = (int*)initid->ptr;
    if (server && *server != -1) {
        close(*server);
        free(server);
    }
}

longlong MySQLNotification(UDF_INIT *initid,
                           UDF_ARGS *args,
                           char *is_null,
                           char *error) {
    char packet[512];
    int* server = (int*)initid->ptr;

    // format a message containing id of row and type of change
    sprintf(packet, "{\"id\":\"%lld\", \"type\":\"%lld\"}", *((longlong*)args->args[0]), *((longlong*)args->args[1]));

    if (server && *server != -1) {
        send(*server, packet, strlen(packet), 0);
    }

    return 0;
}
