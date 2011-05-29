#INCLUDE=-I/usr/include/webkit-1.0/ -I/usr/include/libsoup-2.4/ -I/usr/include/gtk-3.0/ -I/usr/include/glib-2.0/ -I/usr/lib/glib-2.0/include/ -I/usr/include/pango-1.0/ -I/usr/include/cairo/ -I/usr/include/gdk-pixbuf-2.0 -I/usr/include/atk-1.0 -I/usr/include/gio-unix-2.0/
#LIBS=-lwebkit-1.0 -lutil
INCLUDE=$(shell pkg-config --cflags webkit-1.0 gio-unix-2.0)
LIBS=$(shell pkg-config --libs webkit-1.0 gio-unix-2.0) -lutil

CXXFLAGS=${LIBS} ${INCLUDE} -O0 -ggdb

all: main.o cJSON.o
	g++ -o main main.o cJSON.o ${CXXFLAGS}
