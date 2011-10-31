(function(){

if (!window.qx) window.qx = {};

qx.$$start = new Date();
  
if (!qx.$$environment) qx.$$environment = {};
var envinfo = {"engine.name":"webkit","qx.application":"mobiletweets.Application","qx.mobile.emulatetouch":true,"qx.mobile.nativescroll":false,"qx.revision":"","qx.theme":"qx.theme.Modern","qx.version":"1.5"};
for (var k in envinfo) qx.$$environment[k] = envinfo[k];

if (!qx.$$libraries) qx.$$libraries = {};
var libinfo = {"__out__":{"sourceUri":"script"},"mobiletweets":{"resourceUri":"../source/resource","sourceUri":"../source/class"},"qx":{"resourceUri":"../../../../../framework/source/resource","sourceUri":"../../../../../framework/source/class"}};
for (var k in libinfo) qx.$$libraries[k] = libinfo[k];

qx.$$resources = {};
qx.$$translations = {"C":null,"en":null};
qx.$$locales = {"C":null,"en":null};
qx.$$packageData = {};

qx.$$loader = {
  parts : {"boot":[0]},
  packages : {"0":{"uris":["__out__:mobiletweets.9ddfa85636e0.js","qx:qx/Bootstrap.js","qx:qx/core/Environment.js","qx:qx/Mixin.js","qx:qx/Interface.js","qx:qx/core/Aspect.js","qx:qx/lang/Core.js","qx:qx/core/Property.js","qx:qx/Class.js","qx:qx/lang/Generics.js","qx:qx/data/MBinding.js","qx:qx/data/SingleValueBinding.js","qx:qx/lang/String.js","qx:qx/lang/Array.js","qx:qx/bom/client/Engine.js","qx:qx/lang/Type.js","qx:qx/core/Assert.js","qx:qx/type/BaseError.js","qx:qx/core/AssertionError.js","qx:qx/dev/StackTrace.js","qx:qx/lang/Function.js","qx:qx/core/MProperty.js","qx:qx/core/ObjectRegistry.js","qx:qx/core/MAssert.js","qx:qx/lang/RingBuffer.js","qx:qx/log/appender/RingBuffer.js","qx:qx/log/Logger.js","qx:qx/core/MLogging.js","qx:qx/dom/Node.js","qx:qx/bom/Event.js","qx:qx/event/Manager.js","qx:qx/event/GlobalError.js","qx:qx/core/WindowError.js","qx:qx/core/GlobalError.js","qx:qx/event/IEventHandler.js","qx:qx/event/Registration.js","qx:qx/core/MEvents.js","qx:qx/lang/JsonImpl.js","qx:qx/bom/client/Json.js","qx:qx/lang/Json.js","qx:qx/event/IEventDispatcher.js","qx:qx/core/Object.js","qx:qx/util/DisposeUtil.js","qx:qx/event/type/Event.js","qx:qx/util/ObjectPool.js","qx:qx/event/Pool.js","qx:qx/event/dispatch/Direct.js","qx:qx/event/handler/Object.js","qx:qx/event/type/Data.js","qx:qx/lang/Date.js","qx:qx/data/IListData.js","qx:qx/core/ValidationError.js","qx:qx/application/IApplication.js","qx:qx/locale/MTranslation.js","qx:qx/application/Mobile.js","qx:qx/ui/mobile/core/MChildrenHandling.js","qx:qx/event/handler/Application.js","qx:qx/bom/Lifecycle.js","qx:qx/ui/mobile/core/Widget.js","qx:qx/ui/mobile/core/EventHandler.js","qx:qx/bom/Document.js","qx:qx/bom/Viewport.js","qx:qx/bom/client/Html.js","qx:qx/bom/element/Attribute.js","qx:qx/bom/client/EcmaScript.js","qx:qx/lang/Object.js","qx:qx/bom/element/Class.js","qx:qx/bom/client/OperatingSystem.js","qx:qx/event/handler/Orientation.js","qx:qx/event/type/Orientation.js","qx:qx/bom/client/Event.js","qx:qx/event/handler/UserAction.js","qx:qx/event/handler/Touch.js","qx:qx/event/type/Native.js","qx:qx/event/type/Dom.js","qx:qx/event/type/Touch.js","qx:qx/event/type/Tap.js","qx:qx/event/type/Swipe.js","qx:qx/event/handler/Appear.js","qx:qx/ui/mobile/core/DomUpdatedHandler.js","qx:qx/event/dispatch/AbstractBubbling.js","qx:qx/event/dispatch/DomBubbling.js","qx:qx/event/handler/Element.js","qx:qx/event/handler/Capture.js","qx:qx/event/handler/Mouse.js","qx:qx/event/type/Mouse.js","qx:qx/bom/client/Browser.js","qx:qx/event/type/MouseWheel.js","qx:qx/dom/Hierarchy.js","qx:qx/event/handler/Keyboard.js","qx:qx/event/type/KeyInput.js","qx:qx/event/type/KeySequence.js","qx:qx/event/handler/Focus.js","qx:qx/bom/Selection.js","qx:qx/bom/Range.js","qx:qx/util/StringSplit.js","qx:qx/event/handler/DragDrop.js","qx:qx/event/type/Drag.js","qx:qx/event/Timer.js","qx:qx/event/handler/Offline.js","qx:qx/bom/Element.js","qx:qx/event/dispatch/MouseCapture.js","qx:qx/event/handler/Window.js","qx:qx/bom/Selector.js","qx:qx/bom/client/Plugin.js","qx:qx/xml/Document.js","qx:qx/bom/client/Xml.js","qx:qx/event/type/Focus.js","qx:qx/ui/mobile/layout/Abstract.js","qx:qx/bom/element/Cursor.js","qx:qx/bom/client/Css.js","qx:qx/bom/element/Overflow.js","qx:qx/bom/element/BoxSizing.js","qx:qx/bom/element/Clip.js","qx:qx/bom/element/Opacity.js","qx:qx/bom/element/Style.js","qx:qx/ui/mobile/core/Root.js","mobiletweets:mobiletweets/Application.js","qx:qx/log/appender/Util.js","qx:qx/log/appender/Native.js","qx:qx/log/appender/Console.js","qx:qx/bom/client/Transport.js","qx:qx/util/ResourceManager.js","qx:qx/bom/Stylesheet.js","qx:qx/bom/client/Stylesheet.js","qx:qx/util/Uri.js","qx:qx/ui/mobile/page/manager/Simple.js","qx:qx/bom/client/PhoneGap.js","qx:qx/core/BaseInit.js","qx:qx/core/Init.js","qx:qx/ui/mobile/page/manager/Animation.js","qx:qx/event/handler/Transition.js","qx:qx/ui/mobile/core/MLayoutHandling.js","qx:qx/ui/mobile/container/Composite.js","qx:qx/ui/mobile/page/Page.js","qx:qx/ui/mobile/layout/AbstractBox.js","qx:qx/ui/mobile/layout/VBox.js","qx:qx/ui/mobile/page/NavigationPage.js","qx:qx/ui/mobile/container/MIScroll.js","qx:qx/io/ScriptLoader.js","qx:qx/event/message/Message.js","qx:qx/event/message/Bus.js","qx:qx/ui/mobile/container/MNativeScroll.js","qx:qx/ui/mobile/container/Scroll.js","qx:qx/ui/mobile/navigationbar/NavigationBar.js","qx:qx/ui/mobile/layout/HBox.js","qx:qx/ui/mobile/basic/Label.js","qx:qx/ui/mobile/navigationbar/Title.js","qx:qx/ui/mobile/basic/Atom.js","qx:qx/ui/mobile/basic/Image.js","qx:qx/io/ImageLoader.js","qx:qx/ui/mobile/form/Button.js","qx:qx/ui/mobile/navigationbar/Button.js","qx:qx/ui/mobile/navigationbar/BackButton.js","mobiletweets:mobiletweets/page/Input.js","qx:qx/ui/mobile/form/Title.js","qx:qx/ui/form/Form.js","qx:qx/ui/form/validation/Manager.js","qx:qx/type/BaseString.js","qx:qx/locale/LocalizedString.js","qx:qx/locale/Manager.js","qx:qx/bom/client/Locale.js","qx:qx/ui/form/validation/AsyncValidator.js","qx:qx/ui/form/IForm.js","qx:qx/ui/core/ISingleSelection.js","qx:qx/ui/form/Resetter.js","qx:qx/ui/form/IBooleanForm.js","qx:qx/ui/form/IColorForm.js","qx:qx/ui/form/IDateForm.js","qx:qx/ui/form/INumberForm.js","qx:qx/ui/form/IStringForm.js","qx:qx/ui/mobile/form/Form.js","qx:qx/ui/mobile/form/Resetter.js","qx:qx/event/handler/Input.js","qx:qx/ui/mobile/form/MValue.js","qx:qx/ui/mobile/form/MText.js","qx:qx/ui/mobile/form/MState.js","qx:qx/ui/form/IModel.js","qx:qx/ui/form/MForm.js","qx:qx/ui/form/MModelProperty.js","qx:qx/ui/mobile/form/Input.js","qx:qx/ui/mobile/form/TextField.js","qx:qx/ui/form/renderer/IFormRenderer.js","qx:qx/ui/mobile/form/renderer/AbstractRenderer.js","qx:qx/ui/mobile/form/renderer/Single.js","qx:qx/ui/mobile/form/Row.js","qx:qx/dom/Element.js","qx:qx/ui/mobile/form/renderer/SinglePlaceholder.js","mobiletweets:mobiletweets/page/Tweets.js","qx:qx/ui/mobile/list/List.js","qx:qx/ui/mobile/list/provider/Provider.js","qx:qx/util/Delegate.js","qx:qx/ui/mobile/list/renderer/Abstract.js","qx:qx/ui/mobile/list/renderer/Default.js","qx:qx/util/format/IFormat.js","qx:qx/util/format/DateFormat.js","qx:qx/locale/Date.js","mobiletweets:mobiletweets/page/Tweet.js","qx:qx/data/store/Json.js","qx:qx/data/marshal/IMarshaler.js","qx:qx/data/marshal/Json.js","qx:qx/data/marshal/MEventBubbling.js","qx:qx/util/PropertyUtil.js","qx:qx/data/Array.js","qx:qx/util/ValueManager.js","qx:qx/util/AliasManager.js","qx:qx/io/request/AbstractRequest.js","qx:qx/util/Request.js","qx:qx/util/Serializer.js","qx:qx/io/request/Xhr.js","qx:qx/bom/request/Xhr.js","qx:qx/data/store/Jsonp.js","qx:qx/io/request/Jsonp.js","qx:qx/bom/request/Script.js","qx:qx/bom/request/Jsonp.js","qx:qx/ui/mobile/dialog/Manager.js"]}},
  urisBefore : [],
  cssBefore : [],
  boot : "boot",
  closureParts : {},
  bootIsInline : false,
  addNoCacheParam : true,
  
  decodeUris : function(compressedUris)
  {
    var libs = qx.$$libraries;
    var uris = [];
    for (var i=0; i<compressedUris.length; i++)
    {
      var uri = compressedUris[i].split(":");
      var euri;
      if (uri.length==2 && uri[0] in libs) {
        var prefix = libs[uri[0]].sourceUri;
        euri = prefix + "/" + uri[1];
      } else {
        euri = compressedUris[i];
      }
      if (qx.$$loader.addNoCacheParam) {
        euri += "?nocache=" + Math.random();
      }
      
      uris.push(euri);
    }
    return uris;      
  }
};  

function loadScript(uri, callback) {
  var elem = document.createElement("script");
  elem.charset = "utf-8";
  elem.src = uri;
  elem.onreadystatechange = elem.onload = function() {
    if (!this.readyState || this.readyState == "loaded" || this.readyState == "complete") {
      elem.onreadystatechange = elem.onload = null;
      callback();
    }
  };
  var head = document.getElementsByTagName("head")[0];
  head.appendChild(elem);
}

function loadCss(uri) {
  var elem = document.createElement("link");
  elem.rel = "stylesheet";
  elem.type= "text/css";
  elem.href= uri;
  var head = document.getElementsByTagName("head")[0];
  head.appendChild(elem);
}

var isWebkit = /AppleWebKit\/([^ ]+)/.test(navigator.userAgent);

function loadScriptList(list, callback) {
  if (list.length == 0) {
    callback();
    return;
  }
  var item = list.shift();
  loadScript(item,  function() {
    if (isWebkit) {
      // force async, else Safari fails with a "maximum recursion depth exceeded"
      window.setTimeout(function() {
        loadScriptList(list, callback);
      }, 0);
    } else {
      loadScriptList(list, callback);
    }
  });
}

var fireContentLoadedEvent = function() {
  qx.$$domReady = true;
  document.removeEventListener('DOMContentLoaded', fireContentLoadedEvent, false);
};
if (document.addEventListener) {
  document.addEventListener('DOMContentLoaded', fireContentLoadedEvent, false);
}

qx.$$loader.importPackageData = function (dataMap, callback) {
  if (dataMap["resources"]){
    var resMap = dataMap["resources"];
    for (var k in resMap) qx.$$resources[k] = resMap[k];
  }
  if (dataMap["locales"]){
    var locMap = dataMap["locales"];
    var qxlocs = qx.$$locales;
    for (var lang in locMap){
      if (!qxlocs[lang]) qxlocs[lang] = locMap[lang];
      else 
        for (var k in locMap[lang]) qxlocs[lang][k] = locMap[lang][k];
    }
  }
  if (dataMap["translations"]){
    var trMap   = dataMap["translations"];
    var qxtrans = qx.$$translations;
    for (var lang in trMap){
      if (!qxtrans[lang]) qxtrans[lang] = trMap[lang];
      else 
        for (var k in trMap[lang]) qxtrans[lang][k] = trMap[lang][k];
    }
  }
  if (callback){
    callback(dataMap);
  }
}

qx.$$loader.signalStartup = function () 
{
  qx.$$loader.scriptLoaded = true;
  if (window.qx && qx.event && qx.event.handler && qx.event.handler.Application) {
    qx.event.handler.Application.onScriptLoaded();
    qx.$$loader.applicationHandlerReady = true; 
  } else {
    qx.$$loader.applicationHandlerReady = false;
  }
}

// Load all stuff
qx.$$loader.init = function(){
  var l=qx.$$loader;
  if (l.cssBefore.length>0) {
    for (var i=0, m=l.cssBefore.length; i<m; i++) {
      loadCss(l.cssBefore[i]);
    }
  }
  if (l.urisBefore.length>0){
    loadScriptList(l.urisBefore, function(){
      l.initUris();
    });
  } else {
    l.initUris();
  }
}

// Load qooxdoo boot stuff
qx.$$loader.initUris = function(){
  var l=qx.$$loader;
  var bootPackageHash=l.parts[l.boot][0];
  if (l.bootIsInline){
    l.importPackageData(qx.$$packageData[bootPackageHash]);
    l.signalStartup();
  } else {
    loadScriptList(l.decodeUris(l.packages[l.parts[l.boot][0]].uris), function(){
      // Opera needs this extra time to parse the scripts
      window.setTimeout(function(){
        l.importPackageData(qx.$$packageData[bootPackageHash] || {});
        l.signalStartup();
      }, 0);
    });
  }
}
})();



qx.$$loader.init();

