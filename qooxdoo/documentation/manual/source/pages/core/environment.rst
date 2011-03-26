Envrionment
***********

Introduction
============

The environment of an application is a set of values that can be queried through a well-defined interface. Values are referenced through unique keys. You can think of this set as a global key:value store for the application. Values were write-once, read-many. A value for a certain key can be set in various ways, e.g. by code, through build configuration, etc., usually during startup of the application, and not changed later. Other environment values are automatically discovered when they are queried at run time, such as the name of the current browser, or the number of allowed server connections. This way, the environment API also implements the browser feature detection.

Environment settings are also used in the framework, among other things to add debug code for additional tests and logging, to provide browser-specific implementations of certain methods, asf. Certain environment keys are pre-defined by qooxdoo, the values of which can be overridden by the application. Applications are also free to define their own environment keys and query their values at run time.



Pre-defined Environment Keys
============================

TODO: Review key list

TODO: Review possible values and defaults

============================== ========================================== ======================
Key                            Possible Values                            Default
============================== ========================================== ======================
qx.allowUrlSettings            true/false                                 false
qx.allowUrlVariants            true/false                                 false
qx.application                 <string>                                   <undefined>
qx.bom.htmlarea.HtmlArea.debug "on"/"off"                                 "off"
qx.disposerDebugLevel          0, 1, ...                                  0
qx.globalErrorHandling         "on"/"off"                                 "on"
qx.ioRemoteDebug               true/false                                 false
qx.ioRemoteDebugData           true/false                                 false
qx.jsonEncodeUndefined         true/false                                 true
qx.jsonDebugging               true/false                                 false
qx.nativeScrollBars            true/false                                 false
qx.propertyDebugLevel          0, 1, ...                                  0
qx.tableResizeDebug            true/false                                 false
qx.aspects                     [ "on", "off" ]                            "off"
qx.client                      [ "gecko", "mshtml", "opera", "webkit" ]   qx.bom.client.Engine.NAME
qx.debug                       [ "on", "off" ]                            "on"
qx.dynlocale                   [ "on", "off" ]                            "off"
check.name
engine.version
engine.name
browser.name
browser.version
browser.documentmode
browser.quirksmode
device.name
locale
locale.variant
os.name
os.version
plugin.gears
plugin.quicktime
plugin.quicktime.version
plugin.windowsmedia
plugin.windowsmedia.version
plugin.divx
plugin.divx.version
plugin.silverlight
plugin.silverlight.version
plugin.flash
plugin.flash.version
plugin.flash.express
plugin.flash.strictsecurity
io.maxrequests
io.ssl
io.xhr
event.touch
event.pointer
ecmascript.objectcount
html.webworker
html.geolocation
html.audio
html.video
html.video.ogg
html.video.h264
html.video.webm
html.storage.local
html.storage.session
html.classlist
html.xpath
html.xul
html.canvas
html.svg
html.vml
html.dataurl
css.textoverflow
css.placeholder
css.borderradius
css.boxshadow
css.gradients
css.boxmodel
css.translate3d
phonegap
phonegap.notification
============================== ========================================== ======================

