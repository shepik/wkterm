INCLUDES=-I/usr/include/webkit-1.0/ -I/usr/include/libsoup-2.4/ -I/usr/include/gtk-3.0/ -I/usr/include/glib-2.0/ -I/usr/lib/glib-2.0/include/ -I/usr/include/pango-1.0/ -I/usr/include/cairo/ -I/usr/include/gdk-pixbuf-2.0 -I/usr/include/atk-1.0
LIBS=-lwebkit-1.0
main: main.cpp
	g++ -o main -O0 -ggdb main.cpp ${LIBS} ${INCLUDES}
