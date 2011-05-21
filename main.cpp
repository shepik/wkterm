#include <stdio.h>
#include <stdlib.h>
#include <sys/wait.h>
#include <string.h>
#include <assert.h>
			
#include <iostream>
#include <gio/gio.h>
#include <gio/gunixinputstream.h>
#include <gtk/gtk.h>
#include <webkit/webkit.h>
#include <JavaScriptCore/JSObjectRef.h>
#include <JavaScriptCore/JSContextRef.h>
#include <JavaScriptCore/JSStringRef.h>

WebKitWebView* webView = NULL;

static void load_status_cb(GObject* object, GParamSpec* pspec, gpointer data) {
	WebKitWebView *web_view;
	WebKitLoadStatus status;
	const gchar *uri;

	web_view = WEBKIT_WEB_VIEW(object);
	status = webkit_web_view_get_load_status(web_view);
	uri = webkit_web_view_get_uri(web_view);

	switch (status) {
	case WEBKIT_LOAD_PROVISIONAL:
		printf("Load provisional: %s\n", uri);
		break;
	case WEBKIT_LOAD_COMMITTED:
		printf("Load commited: %s\n", uri);
		break;
	case WEBKIT_LOAD_FIRST_VISUALLY_NON_EMPTY_LAYOUT:
		printf("Load first visually non empty layout: %s\n", uri);
		break;
	case WEBKIT_LOAD_FINISHED:
		printf("Load finished: %s\n", uri);
		break;
	case WEBKIT_LOAD_FAILED:
		printf("Load failed: %s\n", uri);
		break;
	default:
		std::cout << status;
		//g_assert_not_reached();
	}
}

int pipeFdIn[2];
int pipeFdOut[2];

static JSValueRef sendToInput(JSContextRef ctx, JSObjectRef /*function*/, JSObjectRef thisObject, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception) {
	assert(argumentCount==1);
//	std::cout << "Bar Called\n";
	JSValueRef ex;
	double num = JSValueToNumber(ctx,arguments[0],&ex);
	char c = (char)num;
	if (c=='\r') c = '\n';
	write(pipeFdIn[1], &c, 1);
	std::cout << "writing.." << c << std::endl;
/*	
	JSStringRef str = JSValueToStringCopy(ctx, arguments[0], &ex);
	char buf[4096];
	JSStringGetUTF8CString(str, buf,4096);
	std::cout << "writing.." << buf << std::endl;
	write(pipeFdIn[1], buf, strlen(buf));
*/	
	return JSValueMakeUndefined(ctx);
}

static gboolean idle_func (gpointer data) {
	if (!webView) return true;
	//webkit_web_view_load_uri(web_view, "javascript:alert(123)");
	return true;
}

static void window_object_cleared_cb(WebKitWebView *web_view, WebKitWebFrame *web_frame, gpointer context, gpointer arg3, gpointer user_data) {

	JSGlobalContextRef jsContext = webkit_web_frame_get_global_context(web_frame);
	JSObjectRef globalObj = JSContextGetGlobalObject(jsContext);

	JSValueRef exception=0;
	JSValueRef jsfoo=JSObjectMakeFunctionWithCallback(jsContext,JSStringCreateWithUTF8CString("sendToInput"),sendToInput);
	JSObjectSetProperty(jsContext, globalObj,JSStringCreateWithUTF8CString("sendToInput"), jsfoo,kJSPropertyAttributeDontDelete | kJSPropertyAttributeReadOnly, &exception);
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
		for (int i=0;i<main_len;i++) std::cout << (int)bufInput[i] << ", ";
		std::cout << std::endl;
		
		cJSON *json = cJSON_CreateString(bufInput);
		char *bufJson = cJSON_Print(json);
		char buf[strlen(bufJson)+100];
		
		sprintf(buf,"print(%s);",bufJson);
		std::cout << buf << std::endl;
		free(bufJson);
		webkit_web_view_execute_script(webView, buf);
	}
	g_input_stream_read_async(inputStream, bufInput, 4096, G_PRIORITY_DEFAULT, NULL, onPipeRead,NULL);
	
}

void run_shell() {
	if (pipe(pipeFdIn) == -1) { perror("pipe"); exit(EXIT_FAILURE); }
	if (pipe(pipeFdOut) == -1) { perror("pipe"); exit(EXIT_FAILURE); }

	printf("pipeFdIn: %d, %d\n",pipeFdIn[0],pipeFdIn[1]);
	printf("pipeFdOut: %d, %d\n",pipeFdOut[0],pipeFdOut[1]);

	char buf;
	pid_t cpid = fork();
	if (cpid == -1) { perror("fork"); exit(EXIT_FAILURE); }
	if (cpid == 0) { /* Child writes argv[1] to pipe */
		//close(pipeFd[0]); /* Close unused read end */
		close(pipeFdIn[1]);
		close(pipeFdOut[0]);
		dup2(pipeFdIn[0],0);
		dup2(pipeFdOut[1],1);
		close(pipeFdIn[0]);
		close(pipeFdOut[1]);
		//std::cout << "hi!!!!!";
		execlp("/bin/bash","/bin/bash","-i","-l",NULL);
		//execlp("/bin/cat","/bin/cat",NULL);
		//write(pipeFd[1], "hi there", 8);
		//close(pipeFd[1]); /* Reader will see EOF */
		std::cout << "fail";
		exit(EXIT_FAILURE);
	} else { /* Parent reads from pipe */
		close(pipeFdIn[0]); /* Close unused write end */
		close(pipeFdOut[1]); /* Close unused write end */
		//while (read(STDIN_FILENO, &buf, 1) > 0) write(pipeFd[0],&buf,1);
		//write(pipeFdIn[0],"ASDF\n",5);close(pipeFdIn[0]);
		//while (read(pipeFdOut[1], &buf, 1) > 0) write(STDOUT_FILENO,&buf,1);
		
		GInputStream * inputStream = g_unix_input_stream_new(pipeFdOut[0],false);
		g_input_stream_read_async(inputStream, bufInput, 4096, G_PRIORITY_DEFAULT, NULL, onPipeRead,NULL);
		/*while (read(pipeFd[0], &buf, 1) > 0)
		write(STDOUT_FILENO, &buf, 1);
		write(STDOUT_FILENO, "\n", 1);
		close(pipeFd[0]);
		wait(NULL); // Wait for child 
		_exit(EXIT_SUCCESS);*/
	}

}

static void load_finished_cb(WebKitWebView *web_view, WebKitWebFrame *web_frame, gpointer data) {
	printf("Finished downloading %s\n", webkit_web_view_get_uri(web_view));
	webView = web_view;
	run_shell();
}

static void destroy_cb(GtkWidget* widget, gpointer data) {
	gtk_main_quit();
}

int main(int argc, char* argv[]) {
	const char *uri;
	GtkWidget* window;
	WebKitWebView* web_view = NULL;

	gtk_init(&argc, &argv);

	if (argc == 1) {
		printf("Usage: URI\n");
		return 1;
	}
	uri = argv[1];

	if(!g_thread_supported())
	g_thread_init(NULL);

	window = gtk_window_new(GTK_WINDOW_TOPLEVEL);
	gtk_window_set_default_size(GTK_WINDOW(window), 600, 400);
	g_signal_connect(window, "destroy", G_CALLBACK(destroy_cb), NULL);

	web_view = web_view = WEBKIT_WEB_VIEW(webkit_web_view_new());
	webkit_web_view_set_transparent(web_view, TRUE);

	/* Register a callback that gets invoked each time that a page is finished downloading */
	g_signal_connect(web_view, "load-finished", G_CALLBACK(load_finished_cb), NULL);
	g_signal_connect (web_view, "window-object-cleared", G_CALLBACK(window_object_cleared_cb), web_view);

	/* Register a callback that gets invoked each time that the load status changes */
	//g_object_connect(web_view, "signal::notify::load-status", G_CALLBACK(load_status_cb), NULL);

	webkit_web_view_load_uri(web_view, uri);

	gtk_container_add(GTK_CONTAINER(window), GTK_WIDGET(web_view));
	gtk_widget_grab_focus(GTK_WIDGET(web_view));
	gtk_widget_show_all(window);
	
	g_idle_add (idle_func, NULL);
	
	gtk_main();
	return 0;
}