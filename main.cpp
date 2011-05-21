#include <iostream>
#include <gtk/gtk.h>
#include <webkit/webkit.h>
#include <JavaScriptCore/JSObjectRef.h>
#include <JavaScriptCore/JSContextRef.h>
#include <JavaScriptCore/JSStringRef.h>

static void destroy_cb(GtkWidget* widget, gpointer data) {
	gtk_main_quit();
}

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

static JSValueRef sendToInput(JSContextRef ctx, JSObjectRef /*function*/, JSObjectRef thisObject, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception) {
	std::cout << "Bar Called\n";
	
	return JSValueMakeUndefined(ctx);
}
static JSStaticFunction sFooStaticFunctions[] = {
	{ "sendToInput",  sendToInput, kJSPropertyAttributeReadOnly },
	{ 0, 0, 0 }
};
static void myclass_init_cb(JSContextRef ctx, JSObjectRef object)
{
// ...
}

static void myclass_finalize_cb(JSObjectRef object)
{
// ...
}
JSClassDefinition fooDef = {
	0, kJSClassAttributeNone, "foo", 0, 
	0, // currently no foo properties... 
	sFooStaticFunctions,
	myclass_init_cb,
	myclass_finalize_cb,
	0, // has Property
	0, // get Property 
	0, // set Property callback...
	0, 0, 0, 0, 0, 0
};


WebKitWebView* webView = NULL;
static void load_finished_cb(WebKitWebView *web_view, WebKitWebFrame *web_frame, gpointer data) {
	printf("Finished downloading %s\n", webkit_web_view_get_uri(web_view));
	webView = web_view;

//	webkit_web_view_execute_script(webView, "alert(123)");
	
}

//scriptCtx = toRef(coreFrame->script()->globalObject()->globalExec());
//JSObjectRef global = JSContextGetGlobalObject(scriptCtx);
//JSClassRef fooClass = JSClassCreate(&fooDef);
//JSObjectRef  fooScriptObject = JSObjectMake(scriptCtx, fooClass, NULL);
//JSObjectSetProperty(scriptCtx, global, JSStringRef("foo"), fooScriptObject, kJSPropertyAttributeNone, 0);

static gboolean idle_func (gpointer data) {
	if (!webView) return true;
	//webkit_web_view_load_uri(web_view, "javascript:alert(123)");
	return true;
}

static void window_object_cleared_cb(WebKitWebView  *web_view,
                                WebKitWebFrame *web_frame,
                                gpointer        context,
                                gpointer        arg3,
                                gpointer        user_data)

{
//Frame* coreFrame;
//coreFrame = core(web_frame);
//WebKitWebFrame *coreFrame = webView->;
/*
JSGlobalContextRef jsContext = webkit_web_frame_get_global_context(web_frame);
JSObjectRef globalObj = JSContextGetGlobalObject(jsContext);
JSClassRef classDef = JSClassCreate(&fooDef);
JSObjectRef classObj = JSObjectMake(jsContext, classDef, context);
JSStringRef str = JSStringRef("foo");
JSObjectSetProperty(jsContext, globalObj, str, classObj, kJSPropertyAttributeNone, NULL);

	webView = NULL;*/

	JSGlobalContextRef jsContext = webkit_web_frame_get_global_context(web_frame);
	JSObjectRef globalObj = JSContextGetGlobalObject(jsContext);

	JSValueRef exception=0;
	JSValueRef jsfoo=JSObjectMakeFunctionWithCallback(jsContext,JSStringCreateWithUTF8CString("sendToInput"),sendToInput);
	JSObjectSetProperty(jsContext, globalObj,JSStringCreateWithUTF8CString("sendToInput"), jsfoo,kJSPropertyAttributeDontDelete | kJSPropertyAttributeReadOnly, &exception);

//	return true;
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