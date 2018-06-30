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

static pthread_mutex_t LOCK_hostname;
static int _server = -1;
static int running = 1;

enum TRIGGER_TYPE {
    TRIGGER_CLOSE = 1,
    TRIGGER_UPDATE = 2,
    TRIGGER_INSERT = 3,
    TRIGGER_DELETE = 4
};

my_bool MySQLNotification_init(UDF_INIT *initid, 
                                          UDF_ARGS *args,
                                          char *message) {
    // allocate memory here
    // longlong* i = malloc(sizeof(*i));
    //initid->ptr = (char*)i;
    
    struct sockaddr_in remote, saddr;

    // check the arguments format
    if(args->arg_count != 2) {
      strcpy(message, "MySQLNotification() requires two arguments");
      return 1;
    }

    if(args->arg_type[0] != INT_RESULT || args->arg_type[1] != INT_RESULT) {
      strcpy(message, "MySQLNotification() requires two integers");
      return 1;
    }
   
    // create a socket that will talk to our node server
    _server = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
    if(_server == -1) {
       return -1;
    }
    
    // bind to local address
    memset(&saddr, 0, sizeof(saddr));
    saddr.sin_family = AF_INET;
    saddr.sin_port = htons(0);
    saddr.sin_addr.s_addr = inet_addr("127.0.0.1");
    if(bind(_server, (struct sockaddr*)&saddr, sizeof(saddr)) != 0) {
        return -1;
    }
    
    // connect to server
    memset(&remote, 0, sizeof(remote));
    remote.sin_family = AF_INET;
    remote.sin_port = htons(2048);
    remote.sin_addr.s_addr = inet_addr("127.0.0.1");
    if(connect(_server, (struct sockaddr*)&remote, sizeof(remote)) != 0) {
        strcpy(message, "Failed to connect to server on port 2048");
        return -1;
    }  

    return 0;
}

     
void MySQLNotification_deinit(UDF_INIT *initid) {
    // free any allocated memory here
    //free((longlong*)initid->ptr);
    // close server socket
    if(_server != -1) {
        close(_server);
    }
}

longlong MySQLNotification(UDF_INIT *initid, UDF_ARGS *args,
                           char *is_null, char *error) {
    
    char packet[512];

    // format a message containing id of row and type of change
    sprintf(packet, "{\"id\":\"%lld\", \"type\":\"%lld\"}", *((longlong*)args->args[0]), *((longlong*)args->args[1]));   
    
    send(_server, packet, strlen(packet), 0);
    
    return 0;
}
