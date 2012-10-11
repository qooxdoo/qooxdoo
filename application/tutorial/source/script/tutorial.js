(function(){

if (!window.qx) window.qx = {};

qx.$$start = new Date();

if (!qx.$$environment) qx.$$environment = {};
var envinfo = {"qx.application":"tutorial.Application","qx.debug.ui.queue":true,"qx.mobile.emulatetouch":true,"qx.nativeScrollBars":true,"qx.revision":"","qx.theme":"qx.theme.Indigo","qx.version":"2.1"};
for (var k in envinfo) qx.$$environment[k] = envinfo[k];

if (!qx.$$libraries) qx.$$libraries = {};
var libinfo = {"__out__":{"sourceUri":"script"},"playground":{"resourceUri":"../../playground/source/resource","sourceUri":"../../playground/source/class"},"qx":{"resourceUri":"../../../framework/source/resource","sourceUri":"../../../framework/source/class","sourceViewUri":"https://github.com/qooxdoo/qooxdoo/blob/%{qxGitBranch}/framework/source/class/%{classFilePath}#L%{lineNumber}"},"qxc.ui.logpane":{"resourceUri":"../../../component/library/logpane/source/resource","sourceUri":"../../../component/library/logpane/source/class"},"qxc.ui.versionlabel":{"resourceUri":"../../../component/library/versionlabel/source/resource","sourceUri":"../../../component/library/versionlabel/source/class"},"tutorial":{"resourceUri":"../source/resource","sourceUri":"../source/class"}};
for (var k in libinfo) qx.$$libraries[k] = libinfo[k];

qx.$$resources = {};
qx.$$translations = {"C":null,"en":null};
qx.$$locales = {"C":null,"en":null};
qx.$$packageData = {};

qx.$$loader = {
  parts : {"boot":[0]},
  packages : {"0":{"uris":["__out__:tutorial.ef607e26ebe5.js","qx:qx/Bootstrap.js","qx:qx/core/Environment.js","qx:qx/bom/client/EcmaScript.js","qx:qx/bom/client/Engine.js","qx:qx/lang/normalize/Function.js","qx:qx/util/OOUtil.js","qx:qx/lang/normalize/Array.js","qx:qx/Mixin.js","qx:qx/core/Aspect.js","qx:qx/lang/normalize/String.js","qx:qx/lang/normalize/Object.js","qx:qx/Interface.js","qx:qx/lang/normalize/Error.js","qx:qx/lang/normalize/Date.js","qx:qx/core/Property.js","qx:qx/Class.js","qx:qx/lang/Generics.js","qx:qx/data/MBinding.js","qx:qx/data/SingleValueBinding.js","qx:qx/lang/String.js","qx:qx/lang/Array.js","qx:qx/lang/Type.js","qx:qx/core/Assert.js","qx:qx/type/BaseError.js","qx:qx/dev/StackTrace.js","qx:qx/lang/Function.js","qx:qx/core/ObjectRegistry.js","qx:qx/core/AssertionError.js","qx:qx/bom/client/Json.js","qx:qx/lang/JsonImpl.js","qx:qx/lang/Json.js","qx:qx/data/IListData.js","qx:qx/core/ValidationError.js","qx:qx/util/RingBuffer.js","qx:qx/log/appender/RingBuffer.js","qx:qx/log/Logger.js","qx:qx/core/MLogging.js","qx:qx/dom/Node.js","qx:qx/bom/Event.js","qx:qx/event/Manager.js","qx:qx/event/GlobalError.js","qx:qx/core/WindowError.js","qx:qx/core/GlobalError.js","qx:qx/event/IEventHandler.js","qx:qx/event/Registration.js","qx:qx/core/MEvent.js","qx:qx/event/IEventDispatcher.js","qx:qx/core/MProperty.js","qx:qx/core/MAssert.js","qx:qx/core/Object.js","qx:qx/util/DisposeUtil.js","qx:qx/event/type/Event.js","qx:qx/util/ObjectPool.js","qx:qx/event/Pool.js","qx:qx/event/dispatch/Direct.js","qx:qx/event/handler/Object.js","qx:qx/event/type/Data.js","tutorial:tutorial/tutorial/mobile/Hello_World.js","qx:qx/ui/core/MExecutable.js","qx:qx/util/PropertyUtil.js","qx:qx/locale/MTranslation.js","qx:qx/ui/core/LayoutItem.js","qx:qx/theme/manager/Appearance.js","qx:qx/ui/core/queue/Layout.js","qx:qx/util/DeferredCallManager.js","qx:qx/lang/Object.js","qx:qx/util/Uri.js","qx:q.js","qx:qx/bom/Selector.js","qx:qx/module/Polyfill.js","qx:qx/module/Event.js","qx:qx/event/Emitter.js","qx:qx/bom/client/Css.js","qx:qx/bom/client/OperatingSystem.js","qx:qx/bom/client/Browser.js","qx:qx/bom/Style.js","qx:qx/bom/element/Opacity.js","qx:qx/bom/element/Clip.js","qx:qx/bom/element/Cursor.js","qx:qx/bom/element/BoxSizing.js","qx:qx/bom/element/Style.js","qx:qx/bom/Document.js","qx:qx/bom/Viewport.js","qx:qx/module/Css.js","qx:qx/bom/client/Html.js","qx:qx/bom/element/Class.js","qx:qx/bom/element/Dimension.js","qx:qx/bom/element/Location.js","qx:qx/bom/Stylesheet.js","qx:qx/bom/client/Stylesheet.js","qx:qx/module/Animation.js","qx:qx/bom/element/Animation.js","qx:qx/bom/client/CssAnimation.js","qx:qx/bom/element/AnimationCss.js","qx:qx/bom/element/AnimationHandle.js","qx:qx/bom/client/CssTransform.js","qx:qx/bom/element/Transform.js","qx:qx/bom/element/AnimationJs.js","qx:qx/util/ColorUtil.js","qx:qx/bom/AnimationFrame.js","qx:qx/util/DeferredCall.js","qx:qx/html/Element.js","qx:qx/event/handler/Appear.js","qx:qx/event/dispatch/AbstractBubbling.js","qx:qx/event/dispatch/DomBubbling.js","qx:qx/event/handler/Element.js","qx:qx/event/type/Native.js","qx:qx/event/handler/UserAction.js","qx:qx/event/handler/Mouse.js","qx:qx/event/type/Dom.js","qx:qx/event/type/Mouse.js","qx:qx/event/type/MouseWheel.js","qx:qx/dom/Hierarchy.js","qx:qx/event/util/Keyboard.js","qx:qx/event/handler/Keyboard.js","qx:qx/event/type/KeyInput.js","qx:qx/event/type/KeySequence.js","qx:qx/event/handler/Focus.js","qx:qx/bom/Selection.js","qx:qx/bom/Range.js","qx:qx/util/StringSplit.js","qx:qx/event/type/Touch.js","qx:qx/event/type/Tap.js","qx:qx/event/type/Swipe.js","qx:qx/bom/client/Event.js","qx:qx/event/handler/Orientation.js","qx:qx/event/type/Orientation.js","qx:qx/event/handler/TouchCore.js","qx:qx/event/handler/Touch.js","qx:qx/event/handler/Input.js","qx:qx/event/handler/Capture.js","qx:qx/event/handler/DragDrop.js","qx:qx/event/type/Drag.js","qx:qx/event/Timer.js","qx:qx/event/handler/Offline.js","qx:qx/bom/Element.js","qx:qx/dom/Element.js","qx:qx/bom/element/Attribute.js","qx:qx/event/dispatch/MouseCapture.js","qx:qx/event/handler/Window.js","qx:qx/bom/client/Plugin.js","qx:qx/xml/Document.js","qx:qx/bom/client/Xml.js","qx:qx/event/type/Focus.js","qx:qx/bom/element/Scroll.js","qx:qx/ui/core/queue/Manager.js","qx:qx/ui/core/queue/Widget.js","qx:qx/ui/core/queue/Visibility.js","qx:qx/ui/core/queue/Appearance.js","qx:qx/ui/core/queue/Dispose.js","qx:qx/core/BaseInit.js","qx:qx/event/handler/Application.js","qx:qx/core/Init.js","qx:qx/ui/core/DecoratorFactory.js","qx:qx/theme/manager/Decoration.js","qx:qx/ui/decoration/IDecorator.js","qx:qx/ui/decoration/Abstract.js","qx:qx/ui/decoration/DynamicDecorator.js","qx:qx/util/ValueManager.js","qx:qx/util/AliasManager.js","qx:qx/html/Decorator.js","qx:qx/ui/core/Widget.js","qx:qx/ui/core/EventHandler.js","qx:qx/ui/layout/Abstract.js","qx:qx/util/LibraryManager.js","qx:qx/bom/client/Transport.js","qx:qx/util/ResourceManager.js","qx:qx/type/BaseString.js","qx:qx/locale/LocalizedString.js","qx:qx/locale/Manager.js","qx:qx/bom/client/Locale.js","qx:qx/bom/element/Decoration.js","qx:qx/io/ImageLoader.js","qx:qx/bom/element/Background.js","qx:qx/html/Image.js","qx:qx/theme/manager/Color.js","qx:qx/ui/core/MPlacement.js","qx:qx/event/Idle.js","qx:qx/util/placement/Placement.js","qx:qx/util/placement/AbstractAxis.js","qx:qx/util/placement/DirectAxis.js","qx:qx/util/placement/KeepAlignAxis.js","qx:qx/util/placement/BestFitAxis.js","qx:qx/ui/basic/Image.js","qx:qx/ui/core/DragDropCursor.js","qx:qx/ui/basic/Atom.js","qx:qx/ui/layout/Atom.js","qx:qx/ui/layout/Util.js","qx:qx/ui/form/IStringForm.js","qx:qx/ui/basic/Label.js","qx:qx/html/Label.js","qx:qx/bom/Label.js","qx:qx/theme/manager/Font.js","qx:qx/bom/Font.js","qx:qx/bom/webfonts/WebFont.js","qx:qx/bom/webfonts/Manager.js","qx:qx/bom/webfonts/Validator.js","qx:qx/ui/form/IExecutable.js","qx:qx/ui/form/Button.js","qx:qx/bom/client/PhoneGap.js","qx:qx/ui/mobile/core/MLayoutHandling.js","qx:qx/ui/mobile/core/MChildrenHandling.js","qx:qx/bom/Lifecycle.js","qx:qx/ui/mobile/core/Widget.js","qx:qx/ui/mobile/core/EventHandler.js","qx:qx/ui/mobile/core/DomUpdatedHandler.js","qx:qx/ui/mobile/layout/Abstract.js","qx:qx/ui/mobile/container/Composite.js","qx:qx/ui/mobile/core/MResize.js","qx:qx/ui/mobile/page/Page.js","qx:qx/ui/mobile/layout/AbstractBox.js","qx:qx/ui/mobile/layout/VBox.js","qx:qx/ui/mobile/container/INavigation.js","qx:qx/ui/mobile/page/NavigationPage.js","qx:qx/ui/mobile/basic/Label.js","qx:qx/ui/mobile/navigationbar/Title.js","qx:qx/ui/mobile/layout/HBox.js","qx:qx/ui/mobile/basic/Atom.js","qx:qx/ui/mobile/basic/Image.js","qx:qx/ui/mobile/form/Button.js","qx:qx/ui/mobile/navigationbar/Button.js","qx:qx/ui/mobile/navigationbar/BackButton.js","qx:qx/ui/mobile/container/MIScroll.js","qx:qx/bom/request/Script.js","qx:qx/event/message/Message.js","qx:qx/event/message/Bus.js","qx:qx/ui/mobile/container/MNativeScroll.js","qx:qx/ui/mobile/container/Scroll.js","tutorial:tutorial/tutorial/desktop/Hello_World.js","tutorial:tutorial/tutorial/desktop/Single_Value_Binding.js","qx:qx/module/Attribute.js","qx:qx/bom/Input.js","qx:qx/application/IApplication.js","qx:qx/application/AbstractGui.js","qx:qx/theme/manager/Meta.js","qx:qx/theme/manager/Icon.js","qx:qx/Theme.js","qx:qx/ui/tooltip/Manager.js","qx:qx/ui/core/MLayoutHandling.js","qx:qx/ui/core/MChildrenHandling.js","qx:qx/ui/container/Composite.js","qx:qx/ui/popup/Popup.js","qx:qx/ui/popup/Manager.js","qx:qx/ui/tooltip/ToolTip.js","qx:qx/ui/layout/Grow.js","qx:qx/ui/form/IForm.js","qx:qx/application/Standalone.js","qx:qx/ui/window/MDesktop.js","qx:qx/ui/core/MBlocker.js","qx:qx/ui/core/Blocker.js","qx:qx/ui/root/Abstract.js","qx:qx/ui/core/FocusHandler.js","qx:qx/ui/root/Application.js","qx:qx/ui/layout/Canvas.js","qx:qx/html/Root.js","qx:qx/html/Blocker.js","qx:qx/module/Traversing.js","qx:qx/module/Manipulating.js","qx:qx/bom/Html.js","qx:qx/type/BaseArray.js","tutorial:tutorial/Application.js","qx:qx/log/appender/Util.js","qx:qx/log/appender/Native.js","qx:qx/log/appender/Console.js","qx:qx/ui/layout/VBox.js","tutorial:tutorial/view/Header.js","qx:qx/ui/layout/HBox.js","qxc.ui.versionlabel:qxc/ui/versionlabel/VersionLabel.js","qx:qx/ui/core/Spacer.js","qx:qx/ui/splitpane/Pane.js","qx:qx/ui/splitpane/Slider.js","qx:qx/ui/splitpane/Splitter.js","qx:qx/ui/splitpane/Blocker.js","qx:qx/ui/splitpane/VLayout.js","qx:qx/ui/splitpane/HLayout.js","tutorial:tutorial/view/Description.js","qx:qx/ui/core/MNativeOverflow.js","qx:qx/ui/embed/Html.js","qx:qx/ui/toolbar/Button.js","qx:qx/ui/toolbar/PartContainer.js","playground:playground/view/Editor.js","qx:qx/ui/form/MForm.js","qx:qx/ui/form/AbstractField.js","qx:qx/html/Input.js","qx:qx/ui/form/TextArea.js","qx:qx/bom/Collection.js","qx:qx/bom/Cookie.js","qx:qx/ui/core/MSingleSelectionHandling.js","qx:qx/ui/core/SingleSelectionManager.js","qx:qx/ui/core/ISingleSelectionProvider.js","qx:qx/ui/core/ISingleSelection.js","qx:qx/ui/container/Stack.js","playground:playground/view/PlayArea.js","playground:playground/view/RiaPlayArea.js","qx:qx/ui/core/scroll/MWheelHandling.js","qx:qx/ui/core/scroll/MScrollBarFactory.js","qx:qx/ui/core/scroll/IScrollBar.js","qx:qx/ui/core/scroll/NativeScrollBar.js","qx:qx/ui/core/scroll/ScrollBar.js","qx:qx/ui/form/IRange.js","qx:qx/ui/form/INumberForm.js","qx:qx/ui/form/Slider.js","qx:qx/ui/core/scroll/ScrollSlider.js","qx:qx/ui/form/RepeatButton.js","qx:qx/event/AcceleratingTimer.js","qx:qx/ui/core/scroll/AbstractScrollArea.js","qx:qx/bom/client/Scroll.js","qx:qx/ui/layout/Grid.js","qx:qx/ui/core/scroll/ScrollPane.js","qx:qx/ui/core/MContentPadding.js","qx:qx/ui/container/Scroll.js","qx:qx/ui/root/Inline.js","qx:qx/event/handler/ElementResize.js","qx:qx/ui/layout/Basic.js","playground:playground/view/MobilePlayArea.js","qx:qx/ui/mobile/core/Root.js","qx:qx/application/Mobile.js","qx:qx/ui/mobile/page/Manager.js","qx:qx/bom/client/Device.js","qx:qx/ui/mobile/container/Navigation.js","qx:qx/ui/mobile/layout/Card.js","qx:qx/event/handler/Transition.js","qx:qx/ui/mobile/navigationbar/NavigationBar.js","qx:qx/ui/mobile/container/MasterDetail.js","qx:qx/ui/mobile/dialog/Popup.js","qx:qx/ui/core/MRemoteChildrenHandling.js","qx:qx/ui/core/MRemoteLayoutHandling.js","qx:qx/ui/window/IWindowManager.js","qx:qx/ui/window/IDesktop.js","qx:qx/ui/window/Manager.js","qx:qx/ui/core/MMovable.js","qx:qx/ui/core/MResizable.js","qx:qx/ui/window/Window.js","tutorial:tutorial/view/SelectionWindow.js","qx:qx/io/request/AbstractRequest.js","qx:qx/util/Request.js","qx:qx/util/Serializer.js","qx:qx/io/request/Xhr.js","qx:qx/bom/request/Xhr.js","qx:qx/theme/indigo/Font.js","qx:qx/theme/simple/Appearance.js","qx:qx/theme/simple/Image.js","qx:qx/theme/indigo/Appearance.js","qx:qx/theme/icon/Tango.js","qx:qx/ui/decoration/MBackgroundColor.js","qx:qx/ui/decoration/MBackgroundImage.js","qx:qx/ui/decoration/MSingleBorder.js","qx:qx/ui/decoration/Single.js","qx:qx/ui/decoration/MBorderRadius.js","qx:qx/ui/decoration/Uniform.js","qx:qx/ui/decoration/MBoxShadow.js","qx:qx/ui/decoration/MDoubleBorder.js","qx:qx/ui/decoration/MLinearBackgroundGradient.js","qx:qx/theme/simple/Decoration.js","qx:qx/theme/indigo/Decoration.js","qx:qx/theme/indigo/Color.js","qx:qx/theme/Indigo.js"]}},
  urisBefore : [],
  cssBefore : ["../../../framework/source/resource/qx/mobile/css/android.css"],
  boot : "boot",
  closureParts : {},
  bootIsInline : false,
  addNoCacheParam : false,

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

var readyStateValue = "complete";
if (document.documentMode && document.documentMode < 10 ||
    (typeof window.ActiveXObject !== "undefined" && !document.documentMode)) {
  readyStateValue = "loaded";
}

function loadScript(uri, callback) {
  var elem = document.createElement("script");
  elem.charset = "utf-8";
  elem.src = uri;
  elem.onreadystatechange = elem.onload = function() {
    if (!this.readyState || this.readyState == readyStateValue) {
      elem.onreadystatechange = elem.onload = null;
      if (typeof callback === "function") {
        callback();
      }
    }
  };

  if (isLoadParallel) {
    elem.async = null;
  }

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
var isLoadParallel = 'async' in document.createElement('script');

function loadScriptList(list, callback) {
  if (list.length == 0) {
    callback();
    return;
  }

  var item;

  if (isLoadParallel) {
    while (list.length) {
      item = list.shift();
      if (list.length) {
        loadScript(item);
      } else {
        loadScript(item, callback);
      }
    }
  } else {
    item = list.shift();
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

