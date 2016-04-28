SHELL = /bin/sh
cc = cc
INCLUDE =-I/usr/local/Cellar/mysql/5.7.12/include/mysql
FLAGS = -std=gnu99 -I
CFLAGS = $(INCLUDE) -shared -pedantic -Wall -Wextra
DEBUGFLAGS = -O0 -D _DEBUG
RELEASEFLAGS = -O2 -D NDEBUG -combine -fwhole-program

TARGET = mysql-notification.so
SOURCES = $(shell echo *.c)
HEADERS = $(shell echo *.h)
OBJECTS = $(SOURCES:.c=.o)

PREFIX = $(DESTDIR)/usr/local/Cellar/mysql/5.7.12/lib
BINDIR = $(PREFIX)/plugin

clean:
	rm -f $(OBJECTS)


all: $(TARGET)

$(TARGET): $(OBJECTS)
	$(CC) $(FLAGS) $(CFLAGS) $(DEBUGFLAGS) -o $(TARGET) $(OBJECTS)
	mv $(TARGET) $(BINDIR)/$(TARGET)

