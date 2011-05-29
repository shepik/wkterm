// 
// This file is the part of wkterm, webkit-based terminal emulator
// (C) 2011 Ilya Shapovalov

// This program is free software; you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation; either version 2 of the License, or
// any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA 02111-1307, USA.
//

#include <stdio.h>
#include <stdlib.h>
#include <sys/wait.h>
#include <string.h>
#include <assert.h>
#include <sys/ioctl.h>
#include <iostream>
#include <gio/gio.h>
#include <gio/gunixinputstream.h>
#include <gtk/gtk.h>
#include <webkit/webkit.h>
#include <JavaScriptCore/JSObjectRef.h>
#include <JavaScriptCore/JSContextRef.h>
#include <JavaScriptCore/JSStringRef.h>

WebKitWebView* webView = NULL;

int fdMaster;

static JSValueRef sendToInput(JSContextRef ctx, JSObjectRef /*function*/, JSObjectRef thisObject, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception) {
	assert(argumentCount==1);
//	std::cout << "Bar Called\n";
	JSValueRef ex;
	double num = JSValueToNumber(ctx,arguments[0],&ex);
	char c = (char)num;
	if (c=='\r') c = '\n';
	write(fdMaster, &c, 1);
	std::cout << "writing.." << c << std::endl;
/*	
	JSStringRef str = JSValueToStringCopy(ctx, arguments[0], &ex);
	char buf[4096];
	JSStringGetUTF8CString(str, buf,4096);
	std::cout << "writing.." << buf << std::endl;
	write(fdMaster, buf, strlen(buf));
*/	
	return JSValueMakeUndefined(ctx);
}
static JSValueRef setTerminalSize(JSContextRef ctx, JSObjectRef /*function*/, JSObjectRef thisObject, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception) {
	assert(argumentCount==2);
	JSValueRef ex;
	struct winsize sz;
	sz.ws_row = (int)JSValueToNumber(ctx,arguments[0],&ex);
	sz.ws_col = (int)JSValueToNumber(ctx,arguments[1],&ex);

	int ret = ioctl(fdMaster, TIOCSWINSZ, &sz);
	return JSValueMakeUndefined(ctx);
}

static void window_object_cleared_cb(WebKitWebView *web_view, WebKitWebFrame *web_frame, gpointer context, gpointer arg3, gpointer user_data) {

	JSGlobalContextRef jsContext = webkit_web_frame_get_global_context(web_frame);
	JSObjectRef globalObj = JSContextGetGlobalObject(jsContext);

	JSValueRef exception=0;
	JSValueRef jsfunc;
	jsfunc=JSObjectMakeFunctionWithCallback(jsContext,JSStringCreateWithUTF8CString("sendToInput"),sendToInput);
	JSObjectSetProperty(jsContext, globalObj,JSStringCreateWithUTF8CString("sendToInput"), jsfunc,kJSPropertyAttributeDontDelete | kJSPropertyAttributeReadOnly, &exception);

	jsfunc=JSObjectMakeFunctionWithCallback(jsContext,JSStringCreateWithUTF8CString("setTerminalSize"),setTerminalSize);
	JSObjectSetProperty(jsContext, globalObj,JSStringCreateWithUTF8CString("setTerminalSize"), jsfunc,kJSPropertyAttributeDontDelete | kJSPropertyAttributeReadOnly, &exception);
}

#include "cJSON.h"

char bufInput[4096];

static void onPipeRead(GObject *source, GAsyncResult *res, gpointer user_data) {
	GInputStream *inputStream = G_INPUT_STREAM (source);
	GError *err = NULL;
	int main_len = g_input_stream_read_finish (inputStream, res, &err);
	bufInput[main_len] = 0;
//	size_t size = (size_t)g_async_result_get_user_data(res);
//	std::cout << size << std::endl;
	if (main_len>0) {
		//for (int i=0;i<main_len;i++) std::cout << (bufInput[i]<32?'#':(char)bufInput[i]) << (int)bufInput[i] << ", ";
		//std::cout << std::endl;
		
		cJSON *json = cJSON_CreateString(bufInput);
		char *bufJson = cJSON_Print(json);
		char buf[strlen(bufJson)+100];
//		std::cout << (int)bufJson[0] << ',' << (int)bufJson[1] << std::endl;
		sprintf(buf,"print(%s);",bufJson);
//		std::cout << buf << std::endl;
		free(bufJson);
		webkit_web_view_execute_script(webView, buf);
	}
	g_input_stream_read_async(inputStream, bufInput, 4096, G_PRIORITY_DEFAULT, NULL, onPipeRead,NULL);
	
}
#include <pty.h> /* for openpty and forkpty */
#include <utmp.h> /* for login_tty */ 

void connect_shell() {
	GInputStream * inputStream = g_unix_input_stream_new(fdMaster,false);
	g_input_stream_read_async(inputStream, bufInput, 4096, G_PRIORITY_DEFAULT, NULL, onPipeRead,NULL);
}

void run_shell() {
	termios tio ;
	winsize winp ;
	char buf[1024];
	int pid = forkpty(&fdMaster, buf, NULL,NULL);//&tio, &winp);
	if (pid==0) {
		execlp("/bin/bash","/bin/bash","-i","-l",NULL);
		exit(EXIT_FAILURE);
	}
}

static void load_finished_cb(WebKitWebView *web_view, WebKitWebFrame *web_frame, gpointer data) {
	printf("Finished downloading %s\n", webkit_web_view_get_uri(web_view));
	webView = web_view;
	connect_shell();
}

static void destroy_cb(GtkWidget* widget, gpointer data) {
	gtk_main_quit();
}

int main(int argc, char* argv[]) {
	GtkWidget* window;
	WebKitWebView* web_view = NULL;

	run_shell();
	gtk_init(&argc, &argv);

	char *dir = get_current_dir_name();
	char uri[4096];
	sprintf(uri,"file://%s/terminal.html",dir);
	free(dir);
	
	if(!g_thread_supported())
	g_thread_init(NULL);

	window = gtk_window_new(GTK_WINDOW_TOPLEVEL);
	gtk_window_set_default_size(GTK_WINDOW(window), 600, 400);
	g_signal_connect(window, "destroy", G_CALLBACK(destroy_cb), NULL);

	web_view = web_view = WEBKIT_WEB_VIEW(webkit_web_view_new());
	webkit_web_view_set_transparent(web_view, TRUE);

	g_signal_connect(web_view, "load-finished", G_CALLBACK(load_finished_cb), NULL);
	g_signal_connect (web_view, "window-object-cleared", G_CALLBACK(window_object_cleared_cb), web_view);

	webkit_web_view_load_uri(web_view, uri);

	gtk_container_add(GTK_CONTAINER(window), GTK_WIDGET(web_view));
	gtk_widget_grab_focus(GTK_WIDGET(web_view));
	gtk_widget_show_all(window);
	
	gtk_main();
	//todo: shell cleanup?
	return 0;
}