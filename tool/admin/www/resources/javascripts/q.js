/** qooxdoo v2.2 | (c) 2013 1&1 Internet AG, http://1und1.de | http://qooxdoo.org/license */
(function(){
if (!window.qx) window.qx = {};
var qx = window.qx;

if (!qx.$$environment) qx.$$environment = {};
var envinfo = {"json":true,"qx.application":"q.websites.Application","qx.debug":false,"qx.debug.databinding":false,"qx.debug.dispose":false,"qx.debug.ui.queue":false,"qx.optimization.basecalls":true,"qx.optimization.comments":true,"qx.optimization.statics":true,"qx.optimization.strings":true,"qx.optimization.variables":true,"qx.optimization.variants":true,"qx.optimization.whitespace":true,"qx.revision":"","qx.theme":"qx.theme.Modern","qx.version":"2.2"};
for (var k in envinfo) qx.$$environment[k] = envinfo[k];

qx.$$packageData = {};

/** qooxdoo v2.2 | (c) 2013 1&1 Internet AG, http://1und1.de | http://qooxdoo.org/license */
qx.$$packageData['0']={"locales":{},"resources":{},"translations":{"C":{},"en":{}}};
(function(){var b=".prototype",c="function",d="Boolean",e="Error",f="Object.keys requires an object as argument.",g="constructor",h="warn",j="default",k="hasOwnProperty",m="string",n="Object",o='"',p="toLocaleString",q="error",r="toString",s="qx.debug",t="()",u="RegExp",v='\", "',w="String",x="'qx.Bootstrap.getKeys' is deprecated. ",y="info",z="BROKEN_IE",A="isPrototypeOf",B="Date",C="",D="qx.Bootstrap",E="Function",F="]",G="Class",H="Array",I="[Class ",J="valueOf",K="Number",L="debug",M="ES5",N=".",O="Please use the native 'Object.keys()' instead.",P="propertyIsEnumerable",Q="object";if(!window.qx){window.qx={};}
;qx.Bootstrap={genericToString:function(){return I+this.classname+F;}
,createNamespace:function(name,R){var U=name.split(N);var T=U[0];var parent=this.__root&&this.__root[T]?this.__root:window;for(var i=0,S=U.length-1;i<S;i++,T=U[i]){if(!parent[T]){parent=parent[T]={};}
else {parent=parent[T];}
;}
;parent[T]=R;return T;}
,setDisplayName:function(W,V,name){W.displayName=V+N+name+t;}
,setDisplayNames:function(Y,X){for(var name in Y){var ba=Y[name];if(ba instanceof Function){ba.displayName=X+N+name+t;}
;}
;}
,define:function(name,bk){if(!bk){var bk={statics:{}};}
;var bh;var bd=null;qx.Bootstrap.setDisplayNames(bk.statics,name);if(bk.members||bk.extend){qx.Bootstrap.setDisplayNames(bk.members,name+b);bh=bk.construct||new Function;if(bk.extend){this.extendClass(bh,bh,bk.extend,name,bf);}
;var bc=bk.statics||{};for(var i=0,be=qx.Bootstrap.keys(bc),l=be.length;i<l;i++){var bb=be[i];bh[bb]=bc[bb];}
;bd=bh.prototype;var bi=bk.members||{};for(var i=0,be=qx.Bootstrap.keys(bi),l=be.length;i<l;i++){var bb=be[i];bd[bb]=bi[bb];}
;}
else {bh=bk.statics||{};if(qx.Bootstrap.$$registry&&qx.Bootstrap.$$registry[name]){var bj=qx.Bootstrap.$$registry[name];if(this.keys(bh).length!==0){for(var bg in bh){bj[bg]=bh[bg];}
;return;}
;}
;}
;bh.$$type=G;if(!bh.hasOwnProperty(r)){bh.toString=this.genericToString;}
;var bf=name?this.createNamespace(name,bh):C;bh.name=bh.classname=name;bh.basename=bf;if(bk.defer){bk.defer(bh,bd);}
;qx.Bootstrap.$$registry[name]=bh;return bh;}
};qx.Bootstrap.define(D,{statics:{__root:null,LOADSTART:qx.$$start||new Date(),DEBUG:(function(){var bl=true;if(qx.$$environment&&qx.$$environment[s]===false){bl=false;}
;return bl;}
)(),getEnvironmentSetting:function(bm){if(qx.$$environment){return qx.$$environment[bm];}
;}
,setEnvironmentSetting:function(bn,bo){if(!qx.$$environment){qx.$$environment={};}
;if(qx.$$environment[bn]===undefined){qx.$$environment[bn]=bo;}
;}
,createNamespace:qx.Bootstrap.createNamespace,setRoot:function(bp){this.__root=bp;}
,define:qx.Bootstrap.define,setDisplayName:qx.Bootstrap.setDisplayName,setDisplayNames:qx.Bootstrap.setDisplayNames,genericToString:qx.Bootstrap.genericToString,extendClass:function(clazz,construct,superClass,name,basename){var superproto=superClass.prototype;var helper=new Function();helper.prototype=superproto;var proto=new helper();clazz.prototype=proto;proto.name=proto.classname=name;proto.basename=basename;construct.base=superClass;clazz.superclass=superClass;construct.self=clazz.constructor=proto.constructor=clazz;}
,getByName:function(name){return qx.Bootstrap.$$registry[name];}
,$$registry:{},objectGetLength:function(bq){return qx.Bootstrap.keys(bq).length;}
,objectMergeWith:function(bs,br,bu){if(bu===undefined){bu=true;}
;for(var bt in br){if(bu||bs[bt]===undefined){bs[bt]=br[bt];}
;}
;return bs;}
,__shadowedKeys:[A,k,p,r,J,P,g],getKeys:function(bv){if(qx.Bootstrap.DEBUG){qx.Bootstrap.warn(x+O);}
;return qx.Bootstrap.keys(bv);}
,keys:({"ES5":Object.keys,"BROKEN_IE":function(bw){if(bw===null||(typeof bw!=Q&&typeof bw!=c)){throw new TypeError(f);}
;var bx=[];var bz=Object.prototype.hasOwnProperty;for(var bA in bw){if(bz.call(bw,bA)){bx.push(bA);}
;}
;var by=qx.Bootstrap.__shadowedKeys;for(var i=0,a=by,l=a.length;i<l;i++){if(bz.call(bw,a[i])){bx.push(a[i]);}
;}
;return bx;}
,"default":function(bB){if(bB===null||(typeof bB!=Q&&typeof bB!=c)){throw new TypeError(f);}
;var bC=[];var bD=Object.prototype.hasOwnProperty;for(var bE in bB){if(bD.call(bB,bE)){bC.push(bE);}
;}
;return bC;}
})[typeof (Object.keys)==c?M:(function(){for(var bF in {toString:1}){return bF;}
;}
)()!==r?z:j],getKeysAsString:function(bH){{}
;var bG=qx.Bootstrap.keys(bH);if(bG.length==0){return C;}
;return o+bG.join(v)+o;}
,__classToTypeMap:{"[object String]":w,"[object Array]":H,"[object Object]":n,"[object RegExp]":u,"[object Number]":K,"[object Boolean]":d,"[object Date]":B,"[object Function]":E,"[object Error]":e},bind:function(bJ,self,bK){var bI=Array.prototype.slice.call(arguments,2,arguments.length);return function(){var bL=Array.prototype.slice.call(arguments,0,arguments.length);return bJ.apply(self,bI.concat(bL));}
;}
,firstUp:function(bM){return bM.charAt(0).toUpperCase()+bM.substr(1);}
,firstLow:function(bN){return bN.charAt(0).toLowerCase()+bN.substr(1);}
,getClass:function(bP){var bO=Object.prototype.toString.call(bP);return (qx.Bootstrap.__classToTypeMap[bO]||bO.slice(8,-1));}
,isString:function(bQ){return (bQ!==null&&(typeof bQ===m||qx.Bootstrap.getClass(bQ)==w||bQ instanceof String||(!!bQ&&!!bQ.$$isString)));}
,isArray:function(bR){return (bR!==null&&(bR instanceof Array||(bR&&qx.data&&qx.data.IListData&&qx.util.OOUtil.hasInterface(bR.constructor,qx.data.IListData))||qx.Bootstrap.getClass(bR)==H||(!!bR&&!!bR.$$isArray)));}
,isObject:function(bS){return (bS!==undefined&&bS!==null&&qx.Bootstrap.getClass(bS)==n);}
,isFunction:function(bT){return qx.Bootstrap.getClass(bT)==E;}
,$$logs:[],debug:function(bV,bU){qx.Bootstrap.$$logs.push([L,arguments]);}
,info:function(bX,bW){qx.Bootstrap.$$logs.push([y,arguments]);}
,warn:function(ca,bY){qx.Bootstrap.$$logs.push([h,arguments]);}
,error:function(cc,cb){qx.Bootstrap.$$logs.push([q,arguments]);}
,trace:function(cd){}
}});}
)();
(function(){var a="qx.bom.client.Xml.getSelectSingleNode",b="qx.bom.client.Stylesheet.getInsertRule",c="qx.bom.client.Html.getDataset",d="qx.bom.client.PhoneGap.getPhoneGap",e="qx.bom.client.EcmaScript.getArrayReduce",f="qx.core.Environment for a list of predefined keys.",g='] found, and no default ("default") given',h="qx.bom.client.Html.getAudioAif",j="qx.bom.client.CssTransform.get3D",k="qx.bom.client.EcmaScript.getArrayLastIndexOf",l=" is not a valid key. Please see the API-doc of ",m=' type)',n="qx.bom.client.EcmaScript.getArrayForEach",o="qx.bom.client.Xml.getAttributeNS",p="qx.bom.client.Stylesheet.getRemoveImport",q="qx.bom.client.Css.getUserModify",r="qx.bom.client.Css.getBoxShadow",s="qx.bom.client.Html.getXul",t="qx.bom.client.Plugin.getWindowsMedia",u=":",v="qx.blankpage",w="The environment key 'css.overflowxy' is deprecated.",x="qx.bom.client.Html.getVideo",y="qx.bom.client.Device.getName",z="qx.bom.client.Event.getTouch",A="qx.optimization.strings",B="qx.debug.property.level",C="qx.bom.client.EcmaScript.getArrayFilter",D="qx.bom.client.EcmaScript.getStringTrim",E="qx.optimization.variables",F="qx.bom.client.EcmaScript.getStackTrace",G="qx.bom.client.EcmaScript.getDateNow",H="qx.bom.client.EcmaScript.getArrayEvery",I="qx.bom.client.Xml.getImplementation",J="qx.bom.client.Html.getConsole",K="qx.bom.client.Engine.getVersion",L="The environment key 'ecmascript.stacktrace' is now 'ecmascript.error.stacktrace'.",M="qx.bom.client.Plugin.getQuicktime",N="qx.bom.client.Html.getNaturalDimensions",O="qx.bom.client.Xml.getSelectNodes",P="qx.bom.client.Xml.getElementsByTagNameNS",Q="qx.nativeScrollBars",R="qx.bom.client.Html.getDataUrl",S="qx.bom.client.Flash.isAvailable",T="qx.bom.client.Html.getCanvas",U="qx.bom.client.Css.getBoxModel",V="qx.bom.client.Plugin.getSilverlight",W="qx/static/blank.html",X="qx.bom.client.EcmaScript.getArrayMap",Y="qx.bom.client.Css.getUserSelect",dY="qx.bom.client.Css.getRadialGradient",dT="module.property",ea="qx.bom.client.Plugin.getWindowsMediaVersion",dV="qx.bom.client.Stylesheet.getCreateStyleSheet",dW='No match for variant "',dS="qx.bom.client.Locale.getLocale",dX="module.events",ee="qx.bom.client.Plugin.getSkype",ef="module.databinding",eg="qx.bom.client.Html.getFileReader",eh="qx.bom.client.Css.getBorderImage",eb="qx.bom.client.Stylesheet.getDeleteRule",ec="qx.bom.client.EcmaScript.getErrorToString",dU="qx.bom.client.Plugin.getDivXVersion",ed="qx.bom.client.Scroll.scrollBarOverlayed",el="qx.bom.client.Plugin.getPdfVersion",eN="qx.bom.client.Xml.getCreateNode",em="qx.bom.client.Css.getLinearGradient",en="qx.bom.client.Transport.getXmlHttpRequest",ei="qx.bom.client.Css.getBorderImageSyntax",ej="qx.bom.client.Html.getClassList",fO="qx.bom.client.Event.getHelp",ek="qx.optimization.comments",eo="qx.bom.client.Locale.getVariant",ep="qx.bom.client.Css.getBoxSizing",eq="qx.bom.client.OperatingSystem.getName",ev="module.logger",ew="qx.bom.client.Css.getOverflowXY",ex="qx.mobile.emulatetouch",er="css.overflowxy",es="qx.bom.client.Html.getAudioWav",et="qx.bom.client.Browser.getName",eu="qx.bom.client.Css.getInlineBlock",eB="qx.bom.client.Plugin.getPdf",eC="qx.dynlocale",eD="ecmascript.error.stacktrace",eE="qx.emulatemouse",ey='" (',ez="qx.bom.client.Html.getAudio",fP="qx.core.Environment",eA="qx.bom.client.EcmaScript.getFunctionBind",eI="qx.bom.client.CssTransform.getSupport",eJ="qx.bom.client.Html.getTextContent",fT="qx.bom.client.Css.getPlaceholder",eK="qx.bom.client.Css.getFloat",eF="default",eG=' in variants [',fR="false",eH="qx.bom.client.Css.getFilterGradient",eL="qx.bom.client.Html.getHistoryState",eM="qxenv",eY="qx.bom.client.Html.getSessionStorage",eX="qx.bom.client.Html.getAudioAu",eW="qx.bom.client.Css.getOpacity",fd="qx.bom.client.Css.getFilterTextShadow",fc="qx.bom.client.Html.getVml",fb="qx.bom.client.Transport.getMaxConcurrentRequestCount",fa="qx.bom.client.Event.getHashChange",eR="qx.bom.client.Css.getRgba",eQ="qx.bom.client.Css.getBorderRadius",eP="qx.bom.client.Event.getPointer",eO="qx.bom.client.EcmaScript.getArraySome",eV="qx.bom.client.Transport.getSsl",eU="qx.bom.client.Html.getWebWorker",eT="qx.bom.client.Json.getJson",eS="qx.bom.client.Browser.getQuirksMode",fk="qx.debug.dispose",fj="qx.bom.client.Css.getTextOverflow",fi="qx.bom.client.EcmaScript.getArrayIndexOf",fh="qx.bom.client.Xml.getQualifiedItem",fo="qx.bom.client.Html.getVideoOgg",fn="&",fm="qx.bom.client.EcmaScript.getArrayReduceRight",fl="qx.bom.client.Device.getType",fg="qx.bom.client.Browser.getDocumentMode",ff="qx.allowUrlVariants",fe="qx.debug.ui.queue",fz="|",fy="qx.bom.client.Html.getContains",fx="qx.bom.client.Plugin.getActiveX",fD=".",fC="qx.bom.client.Xml.getDomProperties",fB="qx.bom.client.CssAnimation.getSupport",fA="qx.debug.databinding",fs="qx.optimization.basecalls",fr="ecmascript.stacktrace",fq="qx.bom.client.Browser.getVersion",fp="qx.bom.client.Css.getUserSelectNone",fw="true",fv="qx.bom.client.Html.getSvg",fu="qx.bom.client.EcmaScript.getObjectKeys",ft="qx.bom.client.Plugin.getDivX",fJ="qx.bom.client.Runtime.getName",fI="qx.bom.client.Html.getLocalStorage",fH="qx.allowUrlSettings",fG="qx.bom.client.Flash.getStrictSecurityModel",fN="qx.aspects",fM="qx.debug",fL="qx.dynamicmousewheel",fK="qx.bom.client.Html.getAudioMp3",fF="qx.bom.client.Engine.getName",fE="qx.bom.client.Html.getUserDataStorage",dI="qx.bom.client.Plugin.getGears",dH="qx.bom.client.Plugin.getQuicktimeVersion",fU="qx.bom.client.Html.getAudioOgg",dF="qx.bom.client.Css.getTextShadow",dG="qx.bom.client.Plugin.getSilverlightVersion",dE="qx.bom.client.Html.getCompareDocumentPosition",fS="qx.bom.client.Flash.getExpressInstall",dC="qx.bom.client.OperatingSystem.getVersion",dD="qx.bom.client.Html.getXPath",dB="qx.bom.client.Html.getGeoLocation",fQ="qx.optimization.privates",dz="qx.bom.client.Css.getAppearance",dA="qx.mobile.nativescroll",dy="qx.bom.client.Xml.getDomParser",dQ="qx.bom.client.Stylesheet.getAddImport",dR="qx.optimization.variants",dO="qx.bom.client.Html.getVideoWebm",dP="qx.bom.client.Flash.getVersion",dM="qx.bom.client.CssAnimation.getRequestAnimationFrame",dN="qx.bom.client.Css.getLegacyWebkitGradient",dK="qx.bom.client.PhoneGap.getNotification",dL="qx.bom.client.Html.getVideoH264",dJ="qx.bom.client.Xml.getCreateElementNS";qx.Bootstrap.define(fP,{statics:{_checks:{},_asyncChecks:{},__cache:{},_checksMap:{"engine.version":K,"engine.name":fF,"browser.name":et,"browser.version":fq,"browser.documentmode":fg,"browser.quirksmode":eS,"runtime.name":fJ,"device.name":y,"device.type":fl,"locale":dS,"locale.variant":eo,"os.name":eq,"os.version":dC,"os.scrollBarOverlayed":ed,"plugin.gears":dI,"plugin.activex":fx,"plugin.skype":ee,"plugin.quicktime":M,"plugin.quicktime.version":dH,"plugin.windowsmedia":t,"plugin.windowsmedia.version":ea,"plugin.divx":ft,"plugin.divx.version":dU,"plugin.silverlight":V,"plugin.silverlight.version":dG,"plugin.flash":S,"plugin.flash.version":dP,"plugin.flash.express":fS,"plugin.flash.strictsecurity":fG,"plugin.pdf":eB,"plugin.pdf.version":el,"io.maxrequests":fb,"io.ssl":eV,"io.xhr":en,"event.touch":z,"event.pointer":eP,"event.help":fO,"event.hashchange":fa,"ecmascript.stacktrace":F,"ecmascript.error.stacktrace":F,"ecmascript.array.indexof":fi,"ecmascript.array.lastindexof":k,"ecmascript.array.foreach":n,"ecmascript.array.filter":C,"ecmascript.array.map":X,"ecmascript.array.some":eO,"ecmascript.array.every":H,"ecmascript.array.reduce":e,"ecmascript.array.reduceright":fm,"ecmascript.function.bind":eA,"ecmascript.object.keys":fu,"ecmascript.date.now":G,"ecmascript.error.toString":ec,"ecmascript.string.trim":D,"html.webworker":eU,"html.filereader":eg,"html.geolocation":dB,"html.audio":ez,"html.audio.ogg":fU,"html.audio.mp3":fK,"html.audio.wav":es,"html.audio.au":eX,"html.audio.aif":h,"html.video":x,"html.video.ogg":fo,"html.video.h264":dL,"html.video.webm":dO,"html.storage.local":fI,"html.storage.session":eY,"html.storage.userdata":fE,"html.classlist":ej,"html.xpath":dD,"html.xul":s,"html.canvas":T,"html.svg":fv,"html.vml":fc,"html.dataset":c,"html.dataurl":R,"html.console":J,"html.stylesheet.createstylesheet":dV,"html.stylesheet.insertrule":b,"html.stylesheet.deleterule":eb,"html.stylesheet.addimport":dQ,"html.stylesheet.removeimport":p,"html.element.contains":fy,"html.element.compareDocumentPosition":dE,"html.element.textcontent":eJ,"html.image.naturaldimensions":N,"html.history.state":eL,"json":eT,"css.textoverflow":fj,"css.placeholder":fT,"css.borderradius":eQ,"css.borderimage":eh,"css.borderimage.standardsyntax":ei,"css.boxshadow":r,"css.gradient.linear":em,"css.gradient.filter":eH,"css.gradient.radial":dY,"css.gradient.legacywebkit":dN,"css.boxmodel":U,"css.rgba":eR,"css.userselect":Y,"css.userselect.none":fp,"css.usermodify":q,"css.appearance":dz,"css.float":eK,"css.boxsizing":ep,"css.animation":fB,"css.animation.requestframe":dM,"css.transform":eI,"css.transform.3d":j,"css.inlineblock":eu,"css.opacity":eW,"css.overflowxy":ew,"css.textShadow":dF,"css.textShadow.filter":fd,"phonegap":d,"phonegap.notification":dK,"xml.implementation":I,"xml.domparser":dy,"xml.selectsinglenode":a,"xml.selectnodes":O,"xml.getelementsbytagnamens":P,"xml.domproperties":fC,"xml.attributens":o,"xml.createnode":eN,"xml.getqualifieditem":fh,"xml.createelementns":dJ},get:function(fY){if(qx.Bootstrap.DEBUG){if(fY==er){qx.Bootstrap.warn(w);}
;if(fY==fr){qx.Bootstrap.warn(L);fY=eD;}
;}
;if(this.__cache[fY]!=undefined){return this.__cache[fY];}
;var gb=this._checks[fY];if(gb){var fW=gb();this.__cache[fY]=fW;return fW;}
;var fV=this._getClassNameFromEnvKey(fY);if(fV[0]!=undefined){var ga=fV[0];var fX=fV[1];var fW=ga[fX]();this.__cache[fY]=fW;return fW;}
;if(qx.Bootstrap.DEBUG){qx.Bootstrap.warn(fY+l+f);qx.Bootstrap.trace(this);}
;}
,_getClassNameFromEnvKey:function(gg){var gi=this._checksMap;if(gi[gg]!=undefined){var gd=gi[gg];var gh=gd.lastIndexOf(fD);if(gh>-1){var gf=gd.slice(0,gh);var gc=gd.slice(gh+1);var ge=qx.Bootstrap.getByName(gf);if(ge!=undefined){return [ge,gc];}
;}
;}
;return [undefined,undefined];}
,select:function(gk,gj){return this.__pickFromValues(this.get(gk),gj);}
,__pickFromValues:function(go,gn){var gm=gn[go];if(gn.hasOwnProperty(go)){return gm;}
;for(var gp in gn){if(gp.indexOf(fz)!=-1){var gl=gp.split(fz);for(var i=0;i<gl.length;i++){if(gl[i]==go){return gn[gp];}
;}
;}
;}
;if(gn[eF]!==undefined){return gn[eF];}
;if(qx.Bootstrap.DEBUG){throw new Error(dW+go+ey+(typeof go)+m+eG+qx.Bootstrap.keys(gn)+g);}
;}
,add:function(gr,gq){if(this._checks[gr]==undefined){if(gq instanceof Function){this._checks[gr]=gq;}
else {this._checks[gr]=this.__createCheck(gq);}
;}
;}
,addAsync:function(gt,gs){if(this._checks[gt]==undefined){this._asyncChecks[gt]=gs;}
;}
,_initDefaultQxValues:function(){this.add(fw,function(){return true;}
);this.add(fH,function(){return false;}
);this.add(ff,function(){return false;}
);this.add(B,function(){return 0;}
);this.add(fM,function(){return true;}
);this.add(fe,function(){return true;}
);this.add(fN,function(){return false;}
);this.add(eC,function(){return true;}
);this.add(ex,function(){return false;}
);this.add(eE,function(){return false;}
);this.add(dA,function(){return false;}
);this.add(v,function(){return W;}
);this.add(fL,function(){return true;}
);this.add(fA,function(){return false;}
);this.add(fk,function(){return false;}
);this.add(fs,function(){return false;}
);this.add(ek,function(){return false;}
);this.add(fQ,function(){return false;}
);this.add(A,function(){return false;}
);this.add(E,function(){return false;}
);this.add(dR,function(){return false;}
);this.add(ef,function(){return true;}
);this.add(ev,function(){return true;}
);this.add(dT,function(){return true;}
);this.add(dX,function(){return true;}
);this.add(Q,function(){return false;}
);}
,__importFromGenerator:function(){if(qx&&qx.$$environment){for(var gu in qx.$$environment){var gv=qx.$$environment[gu];this._checks[gu]=this.__createCheck(gv);}
;}
;}
,__importFromUrl:function(){if(window.document&&window.document.location){var gw=window.document.location.search.slice(1).split(fn);for(var i=0;i<gw.length;i++){var gz=gw[i].split(u);if(gz.length!=3||gz[0]!=eM){continue;}
;var gx=gz[1];var gy=decodeURIComponent(gz[2]);if(gy==fw){gy=true;}
else if(gy==fR){gy=false;}
else if(/^(\d|\.)+$/.test(gy)){gy=parseFloat(gy);}
;this._checks[gx]=this.__createCheck(gy);}
;}
;}
,__createCheck:function(gA){return qx.Bootstrap.bind(function(gB){return gB;}
,null,gA);}
},defer:function(gC){gC._initDefaultQxValues();gC.__importFromGenerator();if(gC.get(fH)===true){gC.__importFromUrl();}
;}
});}
)();
(function(){var a="[object Opera]",b="function",c="[^\\.0-9]",d="4.0",e="gecko",f="1.9.0.0",g="Version/",h="9.0",i="8.0",j="Gecko",k="Maple",l="AppleWebKit/",m="Unsupported client: ",n="",o="opera",p="engine.version",q="! Assumed gecko version 1.9.0.0 (Firefox 3.0).",r="mshtml",s="engine.name",t="webkit",u="5.0",v=".",w="qx.bom.client.Engine";qx.Bootstrap.define(w,{statics:{getVersion:function(){var A=window.navigator.userAgent;var y=n;if(qx.bom.client.Engine.__isOpera()){if(/Opera[\s\/]([0-9]+)\.([0-9])([0-9]*)/.test(A)){if(A.indexOf(g)!=-1){var B=A.match(/Version\/(\d+)\.(\d+)/);y=B[1]+v+B[2].charAt(0)+v+B[2].substring(1,B[2].length);}
else {y=RegExp.$1+v+RegExp.$2;if(RegExp.$3!=n){y+=v+RegExp.$3;}
;}
;}
;}
else if(qx.bom.client.Engine.__isWebkit()){if(/AppleWebKit\/([^ ]+)/.test(A)){y=RegExp.$1;var z=RegExp(c).exec(y);if(z){y=y.slice(0,z.index);}
;}
;}
else if(qx.bom.client.Engine.__isGecko()||qx.bom.client.Engine.__isMaple()){if(/rv\:([^\);]+)(\)|;)/.test(A)){y=RegExp.$1;}
;}
else if(qx.bom.client.Engine.__isMshtml()){if(/MSIE\s+([^\);]+)(\)|;)/.test(A)){y=RegExp.$1;if(y<8&&/Trident\/([^\);]+)(\)|;)/.test(A)){if(RegExp.$1==d){y=i;}
else if(RegExp.$1==u){y=h;}
;}
;}
;}
else {var x=window.qxFail;if(x&&typeof x===b){y=x().FULLVERSION;}
else {y=f;qx.Bootstrap.warn(m+A+q);}
;}
;return y;}
,getName:function(){var name;if(qx.bom.client.Engine.__isOpera()){name=o;}
else if(qx.bom.client.Engine.__isWebkit()){name=t;}
else if(qx.bom.client.Engine.__isGecko()||qx.bom.client.Engine.__isMaple()){name=e;}
else if(qx.bom.client.Engine.__isMshtml()){name=r;}
else {var C=window.qxFail;if(C&&typeof C===b){name=C().NAME;}
else {name=e;qx.Bootstrap.warn(m+window.navigator.userAgent+q);}
;}
;return name;}
,__isOpera:function(){return window.opera&&Object.prototype.toString.call(window.opera)==a;}
,__isWebkit:function(){return window.navigator.userAgent.indexOf(l)!=-1;}
,__isMaple:function(){return window.navigator.userAgent.indexOf(k)!=-1;}
,__isGecko:function(){return window.controllers&&window.navigator.product===j&&window.navigator.userAgent.indexOf(k)==-1;}
,__isMshtml:function(){return window.navigator.cpuClass&&/MSIE\s+([^\);]+)(\)|;)/.test(window.navigator.userAgent);}
},defer:function(D){qx.core.Environment.add(p,D.getVersion);qx.core.Environment.add(s,D.getName);}
});}
)();
(function(){var a="ecmascript.array.lastindexof",b="function",c="stack",d="ecmascript.array.map",f="ecmascript.date.now",g="ecmascript.array.reduce",h="e",i="qx.bom.client.EcmaScript",j="ecmascript.object.keys",k="ecmascript.error.stacktrace",l="ecmascript.string.trim",m="ecmascript.array.indexof",n="stacktrace",o="ecmascript.error.toString",p="[object Error]",q="ecmascript.array.foreach",r="ecmascript.function.bind",s="ecmascript.array.reduceright",t="ecmascript.array.some",u="ecmascript.array.filter",v="ecmascript.array.every";qx.Bootstrap.define(i,{statics:{getStackTrace:function(){var w;var e=new Error(h);w=e.stack?c:e.stacktrace?n:null;if(!w){try{throw e;}
catch(x){e=x;}
;}
;return e.stacktrace?n:e.stack?c:null;}
,getArrayIndexOf:function(){return !!Array.prototype.indexOf;}
,getArrayLastIndexOf:function(){return !!Array.prototype.lastIndexOf;}
,getArrayForEach:function(){return !!Array.prototype.forEach;}
,getArrayFilter:function(){return !!Array.prototype.filter;}
,getArrayMap:function(){return !!Array.prototype.map;}
,getArraySome:function(){return !!Array.prototype.some;}
,getArrayEvery:function(){return !!Array.prototype.every;}
,getArrayReduce:function(){return !!Array.prototype.reduce;}
,getArrayReduceRight:function(){return !!Array.prototype.reduceRight;}
,getErrorToString:function(){return typeof Error.prototype.toString==b&&Error.prototype.toString()!==p;}
,getFunctionBind:function(){return typeof Function.prototype.bind===b;}
,getObjectKeys:function(){return !!Object.keys;}
,getDateNow:function(){return !!Date.now;}
,getStringTrim:function(){return typeof String.prototype.trim===b;}
},defer:function(y){qx.core.Environment.add(m,y.getArrayIndexOf);qx.core.Environment.add(a,y.getArrayLastIndexOf);qx.core.Environment.add(q,y.getArrayForEach);qx.core.Environment.add(u,y.getArrayFilter);qx.core.Environment.add(d,y.getArrayMap);qx.core.Environment.add(t,y.getArraySome);qx.core.Environment.add(v,y.getArrayEvery);qx.core.Environment.add(g,y.getArrayReduce);qx.core.Environment.add(s,y.getArrayReduceRight);qx.core.Environment.add(f,y.getDateNow);qx.core.Environment.add(o,y.getErrorToString);qx.core.Environment.add(k,y.getStackTrace);qx.core.Environment.add(r,y.getFunctionBind);qx.core.Environment.add(j,y.getObjectKeys);qx.core.Environment.add(l,y.getStringTrim);}
});}
)();
(function(){var a="function",b="ecmascript.array.lastindexof",c="ecmascript.array.map",d="ecmascript.array.filter",e="Length is 0 and no second argument given",f="qx.lang.normalize.Array",g="ecmascript.array.indexof",h="First argument is not callable",j="ecmascript.array.reduce",k="ecmascript.array.foreach",m="ecmascript.array.reduceright",n="ecmascript.array.some",o="ecmascript.array.every";qx.Bootstrap.define(f,{defer:function(){if(!qx.core.Environment.get(g)){Array.prototype.indexOf=function(p,q){if(q==null){q=0;}
else if(q<0){q=Math.max(0,this.length+q);}
;for(var i=q;i<this.length;i++){if(this[i]===p){return i;}
;}
;return -1;}
;}
;if(!qx.core.Environment.get(b)){Array.prototype.lastIndexOf=function(r,s){if(s==null){s=this.length-1;}
else if(s<0){s=Math.max(0,this.length+s);}
;for(var i=s;i>=0;i--){if(this[i]===r){return i;}
;}
;return -1;}
;}
;if(!qx.core.Environment.get(k)){Array.prototype.forEach=function(t,u){var l=this.length;for(var i=0;i<l;i++){var v=this[i];if(v!==undefined){t.call(u||window,v,i,this);}
;}
;}
;}
;if(!qx.core.Environment.get(d)){Array.prototype.filter=function(z,w){var x=[];var l=this.length;for(var i=0;i<l;i++){var y=this[i];if(y!==undefined){if(z.call(w||window,y,i,this)){x.push(this[i]);}
;}
;}
;return x;}
;}
;if(!qx.core.Environment.get(c)){Array.prototype.map=function(D,A){var B=[];var l=this.length;for(var i=0;i<l;i++){var C=this[i];if(C!==undefined){B[i]=D.call(A||window,C,i,this);}
;}
;return B;}
;}
;if(!qx.core.Environment.get(n)){Array.prototype.some=function(E,F){var l=this.length;for(var i=0;i<l;i++){var G=this[i];if(G!==undefined){if(E.call(F||window,G,i,this)){return true;}
;}
;}
;return false;}
;}
;if(!qx.core.Environment.get(o)){Array.prototype.every=function(H,I){var l=this.length;for(var i=0;i<l;i++){var J=this[i];if(J!==undefined){if(!H.call(I||window,J,i,this)){return false;}
;}
;}
;return true;}
;}
;if(!qx.core.Environment.get(j)){Array.prototype.reduce=function(K,L){if(typeof K!==a){throw new TypeError(h);}
;if(L===undefined&&this.length===0){throw new TypeError(e);}
;var M=L===undefined?this[0]:L;for(var i=L===undefined?1:0;i<this.length;i++){if(i in this){M=K.call(undefined,M,this[i],i,this);}
;}
;return M;}
;}
;if(!qx.core.Environment.get(m)){Array.prototype.reduceRight=function(N,O){if(typeof N!==a){throw new TypeError(h);}
;if(O===undefined&&this.length===0){throw new TypeError(e);}
;var P=O===undefined?this[this.length-1]:O;for(var i=O===undefined?this.length-2:this.length-1;i>=0;i--){if(i in this){P=N.call(undefined,P,this[i],i,this);}
;}
;return P;}
;}
;}
});}
)();
(function(){var a="mshtml",b="engine.name",c="pop.push.reverse.shift.sort.splice.unshift.join.slice",d="number",e="qx.type.BaseArray",f=".";qx.Bootstrap.define(e,{extend:Array,construct:function(g){}
,members:{toArray:null,valueOf:null,pop:null,push:null,reverse:null,shift:null,sort:null,splice:null,unshift:null,concat:null,join:null,slice:null,toString:null,indexOf:null,lastIndexOf:null,forEach:null,filter:null,map:null,some:null,every:null}});(function(){function h(p){if((qx.core.Environment.get(b)==a)){j.prototype={length:0,$$isArray:true};var n=c.split(f);for(var length=n.length;length;){j.prototype[n[--length]]=Array.prototype[n[length]];}
;}
;var m=Array.prototype.slice;j.prototype.concat=function(){var r=this.slice(0);for(var i=0,length=arguments.length;i<length;i++){var q;if(arguments[i] instanceof j){q=m.call(arguments[i],0);}
else if(arguments[i] instanceof Array){q=arguments[i];}
else {q=[arguments[i]];}
;r.push.apply(r,q);}
;return r;}
;j.prototype.toString=function(){return m.call(this,0).toString();}
;j.prototype.toLocaleString=function(){return m.call(this,0).toLocaleString();}
;j.prototype.constructor=j;j.prototype.indexOf=Array.prototype.indexOf;j.prototype.lastIndexOf=Array.prototype.lastIndexOf;j.prototype.forEach=Array.prototype.forEach;j.prototype.some=Array.prototype.some;j.prototype.every=Array.prototype.every;var o=Array.prototype.filter;var l=Array.prototype.map;j.prototype.filter=function(){var s=new this.constructor;s.push.apply(s,o.apply(this,arguments));return s;}
;j.prototype.map=function(){var t=new this.constructor;t.push.apply(t,l.apply(this,arguments));return t;}
;j.prototype.slice=function(){var u=new this.constructor;u.push.apply(u,Array.prototype.slice.apply(this,arguments));return u;}
;j.prototype.splice=function(){var v=new this.constructor;v.push.apply(v,Array.prototype.splice.apply(this,arguments));return v;}
;j.prototype.toArray=function(){return Array.prototype.slice.call(this,0);}
;j.prototype.valueOf=function(){return this.length;}
;return j;}
;function j(length){if(arguments.length===1&&typeof length===d){this.length=-1<length&&length===length>>.5?length:this.push(length);}
else if(arguments.length){this.push.apply(this,arguments);}
;}
;function k(){}
;k.prototype=[];j.prototype=new k;j.prototype.length=0;qx.type.BaseArray=h(j);}
)();}
)();
(function(){var a="qxWeb";qx.Bootstrap.define(a,{extend:qx.type.BaseArray,statics:{__init:[],$$qx:qx,$init:function(e){var d=[];for(var i=0;i<e.length;i++){var c=!!(e[i]&&e[i].nodeType!=null);if(c){d.push(e[i]);continue;}
;var b=!!(e[i]&&e[i].history&&e[i].location&&e[i].document);if(b){d.push(e[i]);}
;}
;var f=qx.lang.Array.cast(d,qxWeb);for(var i=0;i<qxWeb.__init.length;i++){qxWeb.__init[i].call(f);}
;return f;}
,$attach:function(g){for(var name in g){{}
;qxWeb.prototype[name]=g[name];}
;}
,$attachStatic:function(h){for(var name in h){{}
;qxWeb[name]=h[name];}
;}
,$attachInit:function(j){this.__init.push(j);}
,define:function(name,k){if(k==undefined){k=name;name=null;}
;return qx.Bootstrap.define.call(qx.Bootstrap,name,k);}
},construct:function(m,l){if(!m&&this instanceof qxWeb){return this;}
;if(qx.Bootstrap.isString(m)){if(l instanceof qxWeb){l=l[0];}
;m=qx.bom.Selector.query(m,l);}
else if(!(qx.Bootstrap.isArray(m))){m=[m];}
;return qxWeb.$init(m);}
,members:{filter:function(n){if(qx.lang.Type.isFunction(n)){return qxWeb.$init(Array.prototype.filter.call(this,n));}
;return qxWeb.$init(qx.bom.Selector.matches(n,this));}
,slice:function(o,p){if(p){return qxWeb.$init(Array.prototype.slice.call(this,o,p));}
else {return qxWeb.$init(Array.prototype.slice.call(this,o));}
;}
,splice:function(r,s,t){return qxWeb.$init(Array.prototype.splice.apply(this,arguments));}
,map:function(u,v){return qxWeb.$init(Array.prototype.map.apply(this,arguments));}
,concat:function(x){var w=Array.prototype.slice.call(this,0);for(var i=0;i<arguments.length;i++){if(arguments[i] instanceof qxWeb){w=w.concat(Array.prototype.slice.call(arguments[i],0));}
else {w.push(arguments[i]);}
;}
;return qxWeb.$init(w);}
},defer:function(y){if(window.q==undefined){q=y;}
;}
});}
)();
(function(){var a="qx.lang.normalize.Date",b="ecmascript.date.now";qx.Bootstrap.define(a,{defer:function(){if(!qx.core.Environment.get(b)){Date.now=function(){return +new Date();}
;}
;}
});}
)();
(function(){var a="mshtml",b="engine.name",c="[object Array]",d="qx.lang.Array",e="Cannot clean-up map entry doneObjects[",f="]",g="qx",h="number",j="][",k="string";qx.Bootstrap.define(d,{statics:{toArray:function(m,n){{}
;return this.cast(m,Array,n);}
,cast:function(o,q,r){if(o.constructor===q){return o;}
;if(qx.data&&qx.data.IListData){if(qx.Class&&qx.Class.hasInterface(o,qx.data.IListData)){var o=o.toArray();}
;}
;var p=new q;if((qx.core.Environment.get(b)==a)){if(o.item){for(var i=r||0,l=o.length;i<l;i++){p.push(o[i]);}
;return p;}
;}
;if(Object.prototype.toString.call(o)===c&&r==null){p.push.apply(p,o);}
else {p.push.apply(p,Array.prototype.slice.call(o,r||0));}
;return p;}
,fromArguments:function(s,t){return Array.prototype.slice.call(s,t||0);}
,fromCollection:function(v){if((qx.core.Environment.get(b)==a)){if(v.item){var u=[];for(var i=0,l=v.length;i<l;i++){u[i]=v[i];}
;return u;}
;}
;return Array.prototype.slice.call(v,0);}
,fromShortHand:function(w){var y=w.length;var x=qx.lang.Array.clone(w);switch(y){case 1:x[1]=x[2]=x[3]=x[0];break;case 2:x[2]=x[0];case 3:x[3]=x[1];};return x;}
,clone:function(z){return z.concat();}
,insertAt:function(A,B,i){A.splice(i,0,B);return A;}
,insertBefore:function(C,E,D){var i=C.indexOf(D);if(i==-1){C.push(E);}
else {C.splice(i,0,E);}
;return C;}
,insertAfter:function(F,H,G){var i=F.indexOf(G);if(i==-1||i==(F.length-1)){F.push(H);}
else {F.splice(i+1,0,H);}
;return F;}
,removeAt:function(I,i){return I.splice(i,1)[0];}
,removeAll:function(J){J.length=0;return this;}
,append:function(L,K){{}
;Array.prototype.push.apply(L,K);return L;}
,exclude:function(O,N){{}
;for(var i=0,P=N.length,M;i<P;i++){M=O.indexOf(N[i]);if(M!=-1){O.splice(M,1);}
;}
;return O;}
,remove:function(Q,R){var i=Q.indexOf(R);if(i!=-1){Q.splice(i,1);return R;}
;}
,contains:function(S,T){return S.indexOf(T)!==-1;}
,equals:function(V,U){var length=V.length;if(length!==U.length){return false;}
;for(var i=0;i<length;i++){if(V[i]!==U[i]){return false;}
;}
;return true;}
,sum:function(W){var X=0;for(var i=0,l=W.length;i<l;i++){X+=W[i];}
;return X;}
,max:function(Y){{}
;var i,bb=Y.length,ba=Y[0];for(i=1;i<bb;i++){if(Y[i]>ba){ba=Y[i];}
;}
;return ba===undefined?null:ba;}
,min:function(bc){{}
;var i,be=bc.length,bd=bc[0];for(i=1;i<be;i++){if(bc[i]<bd){bd=bc[i];}
;}
;return bd===undefined?null:bd;}
,unique:function(bh){var br=[],bg={},bk={},bm={};var bl,bf=0;var bp=g+Date.now();var bi=false,bn=false,bq=false;for(var i=0,bo=bh.length;i<bo;i++){bl=bh[i];if(bl===null){if(!bi){bi=true;br.push(bl);}
;}
else if(bl===undefined){}
else if(bl===false){if(!bn){bn=true;br.push(bl);}
;}
else if(bl===true){if(!bq){bq=true;br.push(bl);}
;}
else if(typeof bl===k){if(!bg[bl]){bg[bl]=1;br.push(bl);}
;}
else if(typeof bl===h){if(!bk[bl]){bk[bl]=1;br.push(bl);}
;}
else {var bj=bl[bp];if(bj==null){bj=bl[bp]=bf++;}
;if(!bm[bj]){bm[bj]=bl;br.push(bl);}
;}
;}
;for(var bj in bm){try{delete bm[bj][bp];}
catch(bs){try{bm[bj][bp]=null;}
catch(bt){throw new Error(e+bj+j+bp+f);}
;}
;}
;return br;}
}});}
)();
(function(){var c="-",d="*(?:checked|disabled|ismap|multiple|readonly|selected|value)",f="(^|",g="'] ",h=":active",k=":disabled",l="div",n=")(?:\\((?:(['\"])((?:\\\\.|[^\\\\])*?)\\2|([^()[\\]]*|(?:(?:",o="[selected]",p="'></div>",q="[test!='']:sizzle",r="nth",s="*(?:",t="*(?:(['\"])((?:\\\\.|[^\\\\])*?)\\3|(",u="<a name='",v="option",w="image",x="*([\\x20\\t\\r\\n\\f>+~])",y="~=",z="previousSibling",A="*(even|odd|(([+-]|)(\\d*)n|)",B="only",C="*",D="+|((?:^|[^\\\\])(?:\\\\.)*)",E="i",F="='$1']",G="@",H="w#",I="^=",J="*\\)|)",K="+$",L="=",M=":focus",N="id",O="first",P="'></a><div name='",Q="$=",R="reset",S="string",T="[\\x20\\t\\r\\n\\f]",U="*(?:([+-]|)",V="*((?:-\\d)?\\d*)",W="#",X="input",Y="type",cH="parentNode",cI="(",cJ="w",cD="password",cE="even",cF="TAG",cG="*[>+~]|",cN="*\\]",cO="*(?:\"\"|'')",cT="*\\)|)(?=[^-]|$)",cP="unsupported pseudo: ",cK="w*",cL=" ",cM="*,",dx="text",ef="^",cU=")",cQ=":(",cR="[test^='']",ec="radio",cS="sizcache",cV="button",cW="0",cX="^(",dd="<input type='hidden'/>",de="odd",df="class",cY="*(\\d+)|))",da="<p test=''></p>",db="|=",dc="\\[",dk="<div class='hidden e'></div><div class='hidden'></div>",dl="g",dm="submit",dn="!=",dg="<select><option selected=''></option></select>",dh="e",di="checkbox",dj="*=",ds="|",dt=".",ee="<select></select>",du="object",dp="$1",dq="file",ed="eq",dr="qx.bom.Selector",dv="CHILD",dw="|$)",dI=",",dH=":(even|odd|eq|gt|lt|nth|first|last)(?:\\(",dG=")['\"]?\\]",dM="<a href='#'></a>",dL="empty",dK=":enabled",dJ="[id='",dB="(?:\\\\.|[-\\w]|[^\\x00-\\xa0])+",dA="^#(",dz="[*^$]=",dy="^:(only|nth|first|last)-child(?:\\(",dF="*(",dE="^\\.(",dD="",dC="href",dT="multiple",dS=")|[^:]|\\\\.)*|.*))\\)|)",dR=")|)|)",dQ="POS",dX="boolean",dW="Syntax error, unrecognized expression: ",dV="([*^$|!~]?=)",dU="^\\[name=['\"]?(",dP="\\$&",dO=":checked",dN="undefined",eb="ID",ea="last",dY="HTML";qx.Bootstrap.define(dr,{statics:{query:null,matches:null}});(function(window,undefined){var ep,fg,eR,em,er,eA,fm,eF,es,eg,eK=true,eE=dN,fc=(cS+Math.random()).replace(dt,dD),eW=String,document=window.document,fv=document.documentElement,eJ=0,fs=0,eP=[].pop,fr=[].push,ev=[].slice,eQ=[].indexOf||function(fw){var i=0,fx=this.length;for(;i<fx;i++){if(this[i]===fw){return i;}
;}
;return -1;}
,fi=function(fy,fz){fy[fc]=fz==null||fz;return fy;}
,eo=function(){var fB={},fA=[];return fi(function(fC,fD){if(fA.push(fC)>eR.cacheLength){delete fB[fA.shift()];}
;return (fB[fC]=fD);}
,fB);}
,fj=eo(),fb=eo(),ft=eo(),ex=T,eT=dB,eN=eT.replace(cJ,H),ez=dV,eM=dc+ex+dF+eT+cU+ex+s+ez+ex+t+eN+dR+ex+cN,eS=cQ+eT+n+eM+dS,el=dH+ex+V+ex+cT,ek=new RegExp(ef+ex+D+ex+K,dl),fh=new RegExp(ef+ex+cM+ex+C),ey=new RegExp(ef+ex+x+ex+C),fd=new RegExp(eS),fp=/^(?:#([\w\-]+)|(\w+)|\.([\w\-]+))$/,ff=/^:not/,eO=/[\x20\t\r\n\f]*[+~]/,eu=/:not\($/,ej=/h\d/i,eY=/input|select|textarea|button/i,eq=/\\(?!\\)/g,fl={"ID":new RegExp(dA+eT+cU),"CLASS":new RegExp(dE+eT+cU),"NAME":new RegExp(dU+eT+dG),"TAG":new RegExp(cX+eT.replace(cJ,cK)+cU),"ATTR":new RegExp(ef+eM),"PSEUDO":new RegExp(ef+eS),"POS":new RegExp(el,E),"CHILD":new RegExp(dy+ex+A+ex+U+ex+cY+ex+J,E),"needsContext":new RegExp(ef+ex+cG+el,E)},eV=function(fF){var fE=document.createElement(l);try{return fF(fE);}
catch(e){return false;}
finally{fE=null;}
;}
,en=eV(function(fG){fG.appendChild(document.createComment(dD));return !fG.getElementsByTagName(C).length;}
),eI=eV(function(fH){fH.innerHTML=dM;return fH.firstChild&&typeof fH.firstChild.getAttribute!==eE&&fH.firstChild.getAttribute(dC)===W;}
),fk=eV(function(fI){fI.innerHTML=ee;var fJ=typeof fI.lastChild.getAttribute(dT);return fJ!==dX&&fJ!==S;}
),fq=eV(function(fK){fK.innerHTML=dk;if(!fK.getElementsByClassName||!fK.getElementsByClassName(dh).length){return false;}
;fK.lastChild.className=dh;return fK.getElementsByClassName(dh).length===2;}
),eh=eV(function(fL){fL.id=fc+0;fL.innerHTML=u+fc+P+fc+p;fv.insertBefore(fL,fv.firstChild);var fM=document.getElementsByName&&document.getElementsByName(fc).length===2+document.getElementsByName(fc+0).length;fg=!document.getElementById(fc);fv.removeChild(fL);return fM;}
);try{ev.call(fv.childNodes,0)[0].nodeType;}
catch(e){ev=function(i){var fN,fO=[];for(;(fN=this[i]);i++){fO.push(fN);}
;return fO;}
;}
;function eX(fV,fU,fS,fT){fS=fS||[];fU=fU||document;var fW,fR,fP,m,fQ=fU.nodeType;if(!fV||typeof fV!==S){return fS;}
;if(fQ!==1&&fQ!==9){return [];}
;fP=er(fU);if(!fP&&!fT){if((fW=fp.exec(fV))){if((m=fW[1])){if(fQ===9){fR=fU.getElementById(m);if(fR&&fR.parentNode){if(fR.id===m){fS.push(fR);return fS;}
;}
else {return fS;}
;}
else {if(fU.ownerDocument&&(fR=fU.ownerDocument.getElementById(m))&&eA(fU,fR)&&fR.id===m){fS.push(fR);return fS;}
;}
;}
else if(fW[2]){fr.apply(fS,ev.call(fU.getElementsByTagName(fV),0));return fS;}
else if((m=fW[3])&&fq&&fU.getElementsByClassName){fr.apply(fS,ev.call(fU.getElementsByClassName(m),0));return fS;}
;}
;}
;return et(fV.replace(ek,dp),fU,fS,fT,fP);}
;eX.matches=function(fX,fY){return eX(fX,null,null,fY);}
;eX.matchesSelector=function(gb,ga){return eX(ga,null,null,[gb]).length>0;}
;function fo(gc){return function(gd){var name=gd.nodeName.toLowerCase();return name===X&&gd.type===gc;}
;}
;function ei(ge){return function(gf){var name=gf.nodeName.toLowerCase();return (name===X||name===cV)&&gf.type===ge;}
;}
;function eU(gg){return fi(function(gh){gh=+gh;return fi(function(gk,gi){var j,gj=gg([],gk.length,gh),i=gj.length;while(i--){if(gk[(j=gj[i])]){gk[j]=!(gi[j]=gk[j]);}
;}
;}
);}
);}
;em=eX.getText=function(gn){var gl,go=dD,i=0,gm=gn.nodeType;if(gm){if(gm===1||gm===9||gm===11){if(typeof gn.textContent===S){return gn.textContent;}
else {for(gn=gn.firstChild;gn;gn=gn.nextSibling){go+=em(gn);}
;}
;}
else if(gm===3||gm===4){return gn.nodeValue;}
;}
else {for(;(gl=gn[i]);i++){go+=em(gl);}
;}
;return go;}
;er=eX.isXML=function(gp){var gq=gp&&(gp.ownerDocument||gp).documentElement;return gq?gq.nodeName!==dY:false;}
;eA=eX.contains=fv.contains?function(a,b){var gr=a.nodeType===9?a.documentElement:a,gs=b&&b.parentNode;return a===gs||!!(gs&&gs.nodeType===1&&gr.contains&&gr.contains(gs));}
:fv.compareDocumentPosition?function(a,b){return b&&!!(a.compareDocumentPosition(b)&16);}
:function(a,b){while((b=b.parentNode)){if(b===a){return true;}
;}
;return false;}
;eX.attr=function(gu,name){var gv,gt=er(gu);if(!gt){name=name.toLowerCase();}
;if((gv=eR.attrHandle[name])){return gv(gu);}
;if(gt||fk){return gu.getAttribute(name);}
;gv=gu.getAttributeNode(name);return gv?typeof gu[name]===dX?gu[name]?name:null:gv.specified?gv.value:null:null;}
;eR=eX.selectors={cacheLength:50,createPseudo:fi,match:fl,attrHandle:eI?{}:{"href":function(gw){return gw.getAttribute(dC,2);}
,"type":function(gx){return gx.getAttribute(Y);}
},find:{"ID":fg?function(gz,gA,gy){if(typeof gA.getElementById!==eE&&!gy){var m=gA.getElementById(gz);return m&&m.parentNode?[m]:[];}
;}
:function(gC,gD,gB){if(typeof gD.getElementById!==eE&&!gB){var m=gD.getElementById(gC);return m?m.id===gC||typeof m.getAttributeNode!==eE&&m.getAttributeNode(N).value===gC?[m]:undefined:[];}
;}
,"TAG":en?function(gE,gF){if(typeof gF.getElementsByTagName!==eE){return gF.getElementsByTagName(gE);}
;}
:function(gJ,gK){var gH=gK.getElementsByTagName(gJ);if(gJ===C){var gI,gG=[],i=0;for(;(gI=gH[i]);i++){if(gI.nodeType===1){gG.push(gI);}
;}
;return gG;}
;return gH;}
,"NAME":eh&&function(gL,gM){if(typeof gM.getElementsByName!==eE){return gM.getElementsByName(name);}
;}
,"CLASS":fq&&function(gN,gP,gO){if(typeof gP.getElementsByClassName!==eE&&!gO){return gP.getElementsByClassName(gN);}
;}
},relative:{">":{dir:cH,first:true}," ":{dir:cH},"+":{dir:z,first:true},"~":{dir:z}},preFilter:{"ATTR":function(gQ){gQ[1]=gQ[1].replace(eq,dD);gQ[3]=(gQ[4]||gQ[5]||dD).replace(eq,dD);if(gQ[2]===y){gQ[3]=cL+gQ[3]+cL;}
;return gQ.slice(0,4);}
,"CHILD":function(gR){gR[1]=gR[1].toLowerCase();if(gR[1]===r){if(!gR[2]){eX.error(gR[0]);}
;gR[3]=+(gR[3]?gR[4]+(gR[5]||1):2*(gR[2]===cE||gR[2]===de));gR[4]=+((gR[6]+gR[7])||gR[2]===de);}
else if(gR[2]){eX.error(gR[0]);}
;return gR;}
,"PSEUDO":function(gT){var gS,gU;if(fl[dv].test(gT[0])){return null;}
;if(gT[3]){gT[2]=gT[3];}
else if((gS=gT[4])){if(fd.test(gS)&&(gU=eH(gS,true))&&(gU=gS.indexOf(cU,gS.length-gU)-gS.length)){gS=gS.slice(0,gU);gT[0]=gT[0].slice(0,gU);}
;gT[2]=gS;}
;return gT.slice(0,3);}
},filter:{"ID":fg?function(gV){gV=gV.replace(eq,dD);return function(gW){return gW.getAttribute(N)===gV;}
;}
:function(gX){gX=gX.replace(eq,dD);return function(ha){var gY=typeof ha.getAttributeNode!==eE&&ha.getAttributeNode(N);return gY&&gY.value===gX;}
;}
,"TAG":function(hb){if(hb===C){return function(){return true;}
;}
;hb=hb.replace(eq,dD).toLowerCase();return function(hc){return hc.nodeName&&hc.nodeName.toLowerCase()===hb;}
;}
,"CLASS":function(hd){var he=fj[fc][hd];if(!he){he=fj(hd,new RegExp(f+ex+cU+hd+cI+ex+dw));}
;return function(hf){return he.test(hf.className||(typeof hf.getAttribute!==eE&&hf.getAttribute(df))||dD);}
;}
,"ATTR":function(name,hg,hh){return function(hi,hj){var hk=eX.attr(hi,name);if(hk==null){return hg===dn;}
;if(!hg){return true;}
;hk+=dD;return hg===L?hk===hh:hg===dn?hk!==hh:hg===I?hh&&hk.indexOf(hh)===0:hg===dj?hh&&hk.indexOf(hh)>-1:hg===Q?hh&&hk.substr(hk.length-hh.length)===hh:hg===y?(cL+hk+cL).indexOf(hh)>-1:hg===db?hk===hh||hk.substr(0,hh.length+1)===hh+c:false;}
;}
,"CHILD":function(hl,hn,ho,hm){if(hl===r){return function(hr){var hp,hq,parent=hr.parentNode;if(ho===1&&hm===0){return true;}
;if(parent){hq=0;for(hp=parent.firstChild;hp;hp=hp.nextSibling){if(hp.nodeType===1){hq++;if(hr===hp){break;}
;}
;}
;}
;hq-=hm;return hq===ho||(hq%ho===0&&hq/ho>=0);}
;}
;return function(ht){var hs=ht;switch(hl){case B:case O:while((hs=hs.previousSibling)){if(hs.nodeType===1){return false;}
;}
;if(hl===O){return true;}
;hs=ht;case ea:while((hs=hs.nextSibling)){if(hs.nodeType===1){return false;}
;}
;return true;};}
;}
,"PSEUDO":function(hv,hw){var hu,hx=eR.pseudos[hv]||eR.setFilters[hv.toLowerCase()]||eX.error(cP+hv);if(hx[fc]){return hx(hw);}
;if(hx.length>1){hu=[hv,hv,dD,hw];return eR.setFilters.hasOwnProperty(hv.toLowerCase())?fi(function(hz,hy){var hA,hB=hx(hz,hw),i=hB.length;while(i--){hA=eQ.call(hz,hB[i]);hz[hA]=!(hy[hA]=hB[i]);}
;}
):function(hC){return hx(hC,0,hu);}
;}
;return hx;}
},pseudos:{"not":fi(function(hE){var hD=[],hF=[],hG=fm(hE.replace(ek,dp));return hG[fc]?fi(function(hL,hI,hM,hH){var hJ,hK=hG(hL,null,hH,[]),i=hL.length;while(i--){if((hJ=hK[i])){hL[i]=!(hI[i]=hJ);}
;}
;}
):function(hO,hP,hN){hD[0]=hO;hG(hD,null,hN,hF);return !hF.pop();}
;}
),"has":fi(function(hQ){return function(hR){return eX(hQ,hR).length>0;}
;}
),"contains":fi(function(hS){return function(hT){return (hT.textContent||hT.innerText||em(hT)).indexOf(hS)>-1;}
;}
),"enabled":function(hU){return hU.disabled===false;}
,"disabled":function(hV){return hV.disabled===true;}
,"checked":function(hW){var hX=hW.nodeName.toLowerCase();return (hX===X&&!!hW.checked)||(hX===v&&!!hW.selected);}
,"selected":function(hY){if(hY.parentNode){hY.parentNode.selectedIndex;}
;return hY.selected===true;}
,"parent":function(ia){return !eR.pseudos[dL](ia);}
,"empty":function(ic){var ib;ic=ic.firstChild;while(ic){if(ic.nodeName>G||(ib=ic.nodeType)===3||ib===4){return false;}
;ic=ic.nextSibling;}
;return true;}
,"header":function(ie){return ej.test(ie.nodeName);}
,"text":function(ih){var ig,ii;return ih.nodeName.toLowerCase()===X&&(ig=ih.type)===dx&&((ii=ih.getAttribute(Y))==null||ii.toLowerCase()===ig);}
,"radio":fo(ec),"checkbox":fo(di),"file":fo(dq),"password":fo(cD),"image":fo(w),"submit":ei(dm),"reset":ei(R),"button":function(ij){var name=ij.nodeName.toLowerCase();return name===X&&ij.type===cV||name===cV;}
,"input":function(ik){return eY.test(ik.nodeName);}
,"focus":function(im){var il=im.ownerDocument;return im===il.activeElement&&(!il.hasFocus||il.hasFocus())&&!!(im.type||im.href);}
,"active":function(io){return io===io.ownerDocument.activeElement;}
,"first":eU(function(ip,length,iq){return [0];}
),"last":eU(function(ir,length,is){return [length-1];}
),"eq":eU(function(it,length,iu){return [iu<0?iu+length:iu];}
),"even":eU(function(iv,length,iw){for(var i=0;i<length;i+=2){iv.push(i);}
;return iv;}
),"odd":eU(function(ix,length,iy){for(var i=1;i<length;i+=2){ix.push(i);}
;return ix;}
),"lt":eU(function(iz,length,iA){for(var i=iA<0?iA+length:iA;--i>=0;){iz.push(i);}
;return iz;}
),"gt":eU(function(iB,length,iC){for(var i=iC<0?iC+length:iC;++i<length;){iB.push(i);}
;return iB;}
)}};function eL(a,b,iE){if(a===b){return iE;}
;var iD=a.nextSibling;while(iD){if(iD===b){return -1;}
;iD=iD.nextSibling;}
;return 1;}
;eF=fv.compareDocumentPosition?function(a,b){if(a===b){es=true;return 0;}
;return (!a.compareDocumentPosition||!b.compareDocumentPosition?a.compareDocumentPosition:a.compareDocumentPosition(b)&4)?-1:1;}
:function(a,b){if(a===b){es=true;return 0;}
else if(a.sourceIndex&&b.sourceIndex){return a.sourceIndex-b.sourceIndex;}
;var iJ,iH,iG=[],iL=[],iK=a.parentNode,iI=b.parentNode,iF=iK;if(iK===iI){return eL(a,b);}
else if(!iK){return -1;}
else if(!iI){return 1;}
;while(iF){iG.unshift(iF);iF=iF.parentNode;}
;iF=iI;while(iF){iL.unshift(iF);iF=iF.parentNode;}
;iJ=iG.length;iH=iL.length;for(var i=0;i<iJ&&i<iH;i++){if(iG[i]!==iL[i]){return eL(iG[i],iL[i]);}
;}
;return i===iJ?eL(a,iL[i],-1):eL(iG[i],b,1);}
;[0,0].sort(eF);eK=!es;eX.uniqueSort=function(iM){var iN,i=1;es=eK;iM.sort(eF);if(es){for(;(iN=iM[i]);i++){if(iN===iM[i-1]){iM.splice(i--,1);}
;}
;}
;return iM;}
;eX.error=function(iO){throw new Error(dW+iO);}
;function eH(iS,iR){var iY,iX,iP,iW,iT,iV,iU,iQ=fb[fc][iS];if(iQ){return iR?0:iQ.slice(0);}
;iT=iS;iV=[];iU=eR.preFilter;while(iT){if(!iY||(iX=fh.exec(iT))){if(iX){iT=iT.slice(iX[0].length);}
;iV.push(iP=[]);}
;iY=false;if((iX=ey.exec(iT))){iP.push(iY=new eW(iX.shift()));iT=iT.slice(iY.length);iY.type=iX[0].replace(ek,cL);}
;for(iW in eR.filter){if((iX=fl[iW].exec(iT))&&(!iU[iW]||(iX=iU[iW](iX,document,true)))){iP.push(iY=new eW(iX.shift()));iT=iT.slice(iY.length);iY.type=iW;iY.matches=iX;}
;}
;if(!iY){break;}
;}
;return iR?iT.length:iT?eX.error(iS):fb(iS,iV).slice(0);}
;function eC(ja,jb,jc){var jd=jb.dir,jf=jc&&jb.dir===cH,je=fs++;return jb.first?function(jh,ji,jg){while((jh=jh[jd])){if(jf||jh.nodeType===1){return ja(jh,ji,jg);}
;}
;}
:function(jn,jo,jj){if(!jj){var jl,jm=eJ+cL+je+cL,jk=jm+ep;while((jn=jn[jd])){if(jf||jn.nodeType===1){if((jl=jn[fc])===jk){return jn.sizset;}
else if(typeof jl===S&&jl.indexOf(jm)===0){if(jn.sizset){return jn;}
;}
else {jn[fc]=jk;if(ja(jn,jo,jj)){jn.sizset=true;return jn;}
;jn.sizset=false;}
;}
;}
;}
else {while((jn=jn[jd])){if(jf||jn.nodeType===1){if(ja(jn,jo,jj)){return jn;}
;}
;}
;}
;}
;}
;function eD(jp){return jp.length>1?function(jr,js,jq){var i=jp.length;while(i--){if(!jp[i](jr,js,jq)){return false;}
;}
;return true;}
:jp[0];}
;function eB(jw,ju,jx,jz,jt){var jv,jB=[],i=0,jy=jw.length,jA=ju!=null;for(;i<jy;i++){if((jv=jw[i])){if(!jx||jx(jv,jz,jt)){jB.push(jv);if(jA){ju.push(i);}
;}
;}
;}
;return jB;}
;function ew(jG,jF,jE,jD,jC,jH){if(jD&&!jD[fc]){jD=ew(jD);}
;if(jC&&!jC[fc]){jC=ew(jC,jH);}
;return fi(function(jQ,jL,jR,jI){if(jQ&&jC){return;}
;var i,jN,jJ,jP=[],jT=[],jK=jL.length,jS=jQ||fe(jF||C,jR.nodeType?[jR]:jR,[],jQ),jM=jG&&(jQ||!jF)?eB(jS,jP,jG,jR,jI):jS,jO=jE?jC||(jQ?jG:jK||jD)?[]:jL:jM;if(jE){jE(jM,jO,jR,jI);}
;if(jD){jJ=eB(jO,jT);jD(jJ,[],jR,jI);i=jJ.length;while(i--){if((jN=jJ[i])){jO[jT[i]]=!(jM[jT[i]]=jN);}
;}
;}
;if(jQ){i=jG&&jO.length;while(i--){if((jN=jO[i])){jQ[jP[i]]=!(jL[jP[i]]=jN);}
;}
;}
else {jO=eB(jO===jL?jO.splice(jK,jO.length):jO);if(jC){jC(null,jL,jO,jI);}
else {fr.apply(jL,jO);}
;}
;}
);}
;function fa(ka){var jU,jW,j,jX=ka.length,jV=eR.relative[ka[0].type],kd=jV||eR.relative[cL],i=jV?1:0,kc=eC(function(ke){return ke===jU;}
,kd,true),jY=eC(function(kf){return eQ.call(jU,kf)>-1;}
,kd,true),kb=[function(kh,ki,kg){return (!jV&&(kg||ki!==eg))||((jU=ki).nodeType?kc(kh,ki,kg):jY(kh,ki,kg));}
];for(;i<jX;i++){if((jW=eR.relative[ka[i].type])){kb=[eC(eD(kb),jW)];}
else {jW=eR.filter[ka[i].type].apply(null,ka[i].matches);if(jW[fc]){j=++i;for(;j<jX;j++){if(eR.relative[ka[j].type]){break;}
;}
;return ew(i>1&&eD(kb),i>1&&ka.slice(0,i-1).join(dD).replace(ek,dp),jW,i<j&&fa(ka.slice(i,j)),j<jX&&fa((ka=ka.slice(j))),j<jX&&ka.join(dD));}
;kb.push(jW);}
;}
;return eD(kb);}
;function eG(kn,kk){var kj=kk.length>0,kl=kn.length>0,km=function(kx,kz,ko,kt,kq){var kv,j,ks,kw=[],kp=0,i=cW,ku=kx&&[],kA=kq!=null,kr=eg,kB=kx||kl&&eR.find[cF](C,kq&&kz.parentNode||kz),ky=(eJ+=kr==null?1:Math.E);if(kA){eg=kz!==document&&kz;ep=km.el;}
;for(;(kv=kB[i])!=null;i++){if(kl&&kv){for(j=0;(ks=kn[j]);j++){if(ks(kv,kz,ko)){kt.push(kv);break;}
;}
;if(kA){eJ=ky;ep=++km.el;}
;}
;if(kj){if((kv=!ks&&kv)){kp--;}
;if(kx){ku.push(kv);}
;}
;}
;kp+=i;if(kj&&i!==kp){for(j=0;(ks=kk[j]);j++){ks(ku,kw,kz,ko);}
;if(kx){if(kp>0){while(i--){if(!(ku[i]||kw[i])){kw[i]=eP.call(kt);}
;}
;}
;kw=eB(kw);}
;fr.apply(kt,kw);if(kA&&!kx&&kw.length>0&&(kp+kk.length)>1){eX.uniqueSort(kt);}
;}
;if(kA){eJ=ky;eg=kr;}
;return ku;}
;km.el=0;return kj?fi(km):km;}
;fm=eX.compile=function(kE,kC){var i,kG=[],kD=[],kF=ft[fc][kE];if(!kF){if(!kC){kC=eH(kE);}
;i=kC.length;while(i--){kF=fa(kC[i]);if(kF[fc]){kG.push(kF);}
else {kD.push(kF);}
;}
;kF=ft(kE,eG(kD,kG));}
;return kF;}
;function fe(kK,kH,kI,kL){var i=0,kJ=kH.length;for(;i<kJ;i++){eX(kK,kH[i],kI,kL);}
;return kI;}
;function et(kO,kS,kN,kR,kM){var i,kP,kQ,kT,find,kU=eH(kO),j=kU.length;if(!kR){if(kU.length===1){kP=kU[0]=kU[0].slice(0);if(kP.length>2&&(kQ=kP[0]).type===eb&&kS.nodeType===9&&!kM&&eR.relative[kP[1].type]){kS=eR.find[eb](kQ.matches[0].replace(eq,dD),kS,kM)[0];if(!kS){return kN;}
;kO=kO.slice(kP.shift().length);}
;for(i=fl[dQ].test(kO)?-1:kP.length-1;i>=0;i--){kQ=kP[i];if(eR.relative[(kT=kQ.type)]){break;}
;if((find=eR.find[kT])){if((kR=find(kQ.matches[0].replace(eq,dD),eO.test(kP[0].type)&&kS.parentNode||kS,kM))){kP.splice(i,1);kO=kR.length&&kP.join(dD);if(!kO){fr.apply(kN,ev.call(kR,0));return kN;}
;break;}
;}
;}
;}
;}
;fm(kO,kU)(kR,kS,kM,kN,eO.test(kO));return kN;}
;if(document.querySelectorAll){(function(){var kW,lc=et,lb=/'|\\/g,kY=/\=[\x20\t\r\n\f]*([^'"\]]*)[\x20\t\r\n\f]*\]/g,kX=[M],kV=[h,M],la=fv.matchesSelector||fv.mozMatchesSelector||fv.webkitMatchesSelector||fv.oMatchesSelector||fv.msMatchesSelector;eV(function(ld){ld.innerHTML=dg;if(!ld.querySelectorAll(o).length){kX.push(dc+ex+d);}
;if(!ld.querySelectorAll(dO).length){kX.push(dO);}
;}
);eV(function(le){le.innerHTML=da;if(le.querySelectorAll(cR).length){kX.push(dz+ex+cO);}
;le.innerHTML=dd;if(!le.querySelectorAll(dK).length){kX.push(dK,k);}
;}
);kX=new RegExp(kX.join(ds));et=function(lk,ln,li,lm,lf){if(!lm&&!lf&&(!kX||!kX.test(lk))){var lh,i,lg=true,lj=fc,lo=ln,ll=ln.nodeType===9&&lk;if(ln.nodeType===1&&ln.nodeName.toLowerCase()!==du){lh=eH(lk);if((lg=ln.getAttribute(N))){lj=lg.replace(lb,dP);}
else {ln.setAttribute(N,lj);}
;lj=dJ+lj+g;i=lh.length;while(i--){lh[i]=lj+lh[i].join(dD);}
;lo=eO.test(lk)&&ln.parentNode||ln;ll=lh.join(dI);}
;if(ll){try{fr.apply(li,ev.call(lo.querySelectorAll(ll),0));return li;}
catch(lp){}
finally{if(!lg){ln.removeAttribute(N);}
;}
;}
;}
;return lc(lk,ln,li,lm,lf);}
;if(la){eV(function(lq){kW=la.call(lq,l);try{la.call(lq,q);kV.push(dn,eS);}
catch(e){}
;}
);kV=new RegExp(kV.join(ds));eX.matchesSelector=function(ls,lr){lr=lr.replace(kY,F);if(!er(ls)&&!kV.test(lr)&&(!kX||!kX.test(lr))){try{var lt=la.call(ls,lr);if(lt||kW||ls.document&&ls.document.nodeType!==11){return lt;}
;}
catch(e){}
;}
;return eX(lr,null,null,[ls]).length>0;}
;}
;}
)();}
;eR.pseudos[r]=eR.pseudos[ed];function fu(){}
;eR.filters=fu.prototype=eR.pseudos;eR.setFilters=new fu();qx.bom.Selector.query=function(lv,lu){return eX(lv,lu);}
;qx.bom.Selector.matches=function(lx,lw){return eX(lx,null,null,lw);}
;}
)(window);}
)();
(function(){var a="qx.lang.Type",b="Error",c="RegExp",d="Date",e="Number",f="Boolean";qx.Bootstrap.define(a,{statics:{getClass:qx.Bootstrap.getClass,isString:qx.Bootstrap.isString,isArray:qx.Bootstrap.isArray,isObject:qx.Bootstrap.isObject,isFunction:qx.Bootstrap.isFunction,isRegExp:function(g){return this.getClass(g)==c;}
,isNumber:function(h){return (h!==null&&(this.getClass(h)==e||h instanceof Number));}
,isBoolean:function(i){return (i!==null&&(this.getClass(i)==f||i instanceof Boolean));}
,isDate:function(j){return (j!==null&&(this.getClass(j)==d||j instanceof Date));}
,isError:function(k){return (k!==null&&(this.getClass(k)==b||k instanceof Error));}
}});}
)();
(function(){var a="none",b="qx.module.Css",c="",d="display";qx.Bootstrap.define(b,{statics:{setStyle:function(name,e){if(/\w-\w/.test(name)){name=qx.lang.String.camelCase(name);}
;for(var i=0;i<this.length;i++){qx.bom.element.Style.set(this[i],name,e);}
;return this;}
,getStyle:function(name){if(this[0]){if(/\w-\w/.test(name)){name=qx.lang.String.camelCase(name);}
;return qx.bom.element.Style.get(this[0],name);}
;return null;}
,setStyles:function(f){for(var name in f){this.setStyle(name,f[name]);}
;return this;}
,getStyles:function(h){var g={};for(var i=0;i<h.length;i++){g[h[i]]=this.getStyle(h[i]);}
;return g;}
,addClass:function(name){for(var i=0;i<this.length;i++){qx.bom.element.Class.add(this[i],name);}
;return this;}
,addClasses:function(j){for(var i=0;i<this.length;i++){qx.bom.element.Class.addClasses(this[i],j);}
;return this;}
,removeClass:function(name){for(var i=0;i<this.length;i++){qx.bom.element.Class.remove(this[i],name);}
;return this;}
,removeClasses:function(k){for(var i=0;i<this.length;i++){qx.bom.element.Class.removeClasses(this[i],k);}
;return this;}
,hasClass:function(name){if(!this[0]){return false;}
;return qx.bom.element.Class.has(this[0],name);}
,getClass:function(){if(!this[0]){return c;}
;return qx.bom.element.Class.get(this[0]);}
,toggleClass:function(name){var m=qx.bom.element.Class;for(var i=0,l=this.length;i<l;i++){m.has(this[i],name)?m.remove(this[i],name):m.add(this[i],name);}
;return this;}
,toggleClasses:function(n){for(var i=0,l=n.length;i<l;i++){this.toggleClass(n[i]);}
;return this;}
,replaceClass:function(p,o){for(var i=0,l=this.length;i<l;i++){qx.bom.element.Class.replace(this[i],p,o);}
;return this;}
,getHeight:function(){var q=this[0];if(q){if(qx.dom.Node.isElement(q)){return qx.bom.element.Dimension.getHeight(q);}
else if(qx.dom.Node.isDocument(q)){return qx.bom.Document.getHeight(qx.dom.Node.getWindow(q));}
else if(qx.dom.Node.isWindow(q)){return qx.bom.Viewport.getHeight(q);}
;}
;return null;}
,getWidth:function(){var r=this[0];if(r){if(qx.dom.Node.isElement(r)){return qx.bom.element.Dimension.getWidth(r);}
else if(qx.dom.Node.isDocument(r)){return qx.bom.Document.getWidth(qx.dom.Node.getWindow(r));}
else if(qx.dom.Node.isWindow(r)){return qx.bom.Viewport.getWidth(r);}
;}
;return null;}
,getOffset:function(){var s=this[0];if(s){return qx.bom.element.Location.get(s);}
;return null;}
,getContentHeight:function(){var t=this[0];if(qx.dom.Node.isElement(t)){return qx.bom.element.Dimension.getContentHeight(t);}
;return null;}
,getContentWidth:function(){var u=this[0];if(qx.dom.Node.isElement(u)){return qx.bom.element.Dimension.getContentWidth(u);}
;return null;}
,getPosition:function(){var v=this[0];if(qx.dom.Node.isElement(v)){return qx.bom.element.Location.getPosition(v);}
;return null;}
,includeStylesheet:function(x,w){qx.bom.Stylesheet.includeFile(x,w);}
,hide:function(){for(var i=0,l=this.length;i<l;i++){var y=this.slice(i,i+1);var z=y.getStyle(d);if(z!==a){y[0].$$qPrevDisp=z;y.setStyle(d,a);}
;}
;return this;}
,show:function(){for(var i=0,l=this.length;i<l;i++){var E=this.slice(i,i+1);var D=E.getStyle(d);var C=E[0].$$qPrevDisp;var A;if(D==a){if(C&&C!=a){A=C;}
else {var B=qxWeb.getDocument(E[0]);A=qx.module.Css.__getDisplayDefault(E[0].tagName,B);}
;E.setStyle(d,A);E[0].$$qPrevDisp=a;}
;}
;return this;}
,__displayDefaults:{},__getDisplayDefault:function(I,F){var H=qx.module.Css.__displayDefaults;if(!H[I]){var J=F||document;var G=qxWeb(J.createElement(I)).appendTo(F.body);H[I]=G.getStyle(d);G.remove();}
;return H[I]||c;}
},defer:function(K){qxWeb.$attach({"setStyle":K.setStyle,"getStyle":K.getStyle,"setStyles":K.setStyles,"getStyles":K.getStyles,"addClass":K.addClass,"addClasses":K.addClasses,"removeClass":K.removeClass,"removeClasses":K.removeClasses,"hasClass":K.hasClass,"getClass":K.getClass,"toggleClass":K.toggleClass,"toggleClasses":K.toggleClasses,"replaceClass":K.replaceClass,"getHeight":K.getHeight,"getWidth":K.getWidth,"getOffset":K.getOffset,"getContentHeight":K.getContentHeight,"getContentWidth":K.getContentWidth,"getPosition":K.getPosition,"hide":K.hide,"show":K.show});qxWeb.$attachStatic({"includeStylesheet":K.includeStylesheet});}
});}
)();
(function(){var a='',b="ecmascript.string.trim",c="qx.lang.normalize.String";qx.Bootstrap.define(c,{defer:function(){if(!qx.core.Environment.get(b)){String.prototype.trim=function(d){return this.replace(/^\s+|\s+$/g,a);}
;}
;}
});}
)();
(function(){var a="-",b="]",c='\\u',d="undefined",e="",f='\\$1',g="0041-005A0061-007A00AA00B500BA00C0-00D600D8-00F600F8-02C102C6-02D102E0-02E402EC02EE0370-037403760377037A-037D03860388-038A038C038E-03A103A3-03F503F7-0481048A-05250531-055605590561-058705D0-05EA05F0-05F20621-064A066E066F0671-06D306D506E506E606EE06EF06FA-06FC06FF07100712-072F074D-07A507B107CA-07EA07F407F507FA0800-0815081A082408280904-0939093D09500958-0961097109720979-097F0985-098C098F09900993-09A809AA-09B009B209B6-09B909BD09CE09DC09DD09DF-09E109F009F10A05-0A0A0A0F0A100A13-0A280A2A-0A300A320A330A350A360A380A390A59-0A5C0A5E0A72-0A740A85-0A8D0A8F-0A910A93-0AA80AAA-0AB00AB20AB30AB5-0AB90ABD0AD00AE00AE10B05-0B0C0B0F0B100B13-0B280B2A-0B300B320B330B35-0B390B3D0B5C0B5D0B5F-0B610B710B830B85-0B8A0B8E-0B900B92-0B950B990B9A0B9C0B9E0B9F0BA30BA40BA8-0BAA0BAE-0BB90BD00C05-0C0C0C0E-0C100C12-0C280C2A-0C330C35-0C390C3D0C580C590C600C610C85-0C8C0C8E-0C900C92-0CA80CAA-0CB30CB5-0CB90CBD0CDE0CE00CE10D05-0D0C0D0E-0D100D12-0D280D2A-0D390D3D0D600D610D7A-0D7F0D85-0D960D9A-0DB10DB3-0DBB0DBD0DC0-0DC60E01-0E300E320E330E40-0E460E810E820E840E870E880E8A0E8D0E94-0E970E99-0E9F0EA1-0EA30EA50EA70EAA0EAB0EAD-0EB00EB20EB30EBD0EC0-0EC40EC60EDC0EDD0F000F40-0F470F49-0F6C0F88-0F8B1000-102A103F1050-1055105A-105D106110651066106E-10701075-1081108E10A0-10C510D0-10FA10FC1100-1248124A-124D1250-12561258125A-125D1260-1288128A-128D1290-12B012B2-12B512B8-12BE12C012C2-12C512C8-12D612D8-13101312-13151318-135A1380-138F13A0-13F41401-166C166F-167F1681-169A16A0-16EA1700-170C170E-17111720-17311740-17511760-176C176E-17701780-17B317D717DC1820-18771880-18A818AA18B0-18F51900-191C1950-196D1970-19741980-19AB19C1-19C71A00-1A161A20-1A541AA71B05-1B331B45-1B4B1B83-1BA01BAE1BAF1C00-1C231C4D-1C4F1C5A-1C7D1CE9-1CEC1CEE-1CF11D00-1DBF1E00-1F151F18-1F1D1F20-1F451F48-1F4D1F50-1F571F591F5B1F5D1F5F-1F7D1F80-1FB41FB6-1FBC1FBE1FC2-1FC41FC6-1FCC1FD0-1FD31FD6-1FDB1FE0-1FEC1FF2-1FF41FF6-1FFC2071207F2090-209421022107210A-211321152119-211D212421262128212A-212D212F-2139213C-213F2145-2149214E218321842C00-2C2E2C30-2C5E2C60-2CE42CEB-2CEE2D00-2D252D30-2D652D6F2D80-2D962DA0-2DA62DA8-2DAE2DB0-2DB62DB8-2DBE2DC0-2DC62DC8-2DCE2DD0-2DD62DD8-2DDE2E2F300530063031-3035303B303C3041-3096309D-309F30A1-30FA30FC-30FF3105-312D3131-318E31A0-31B731F0-31FF3400-4DB54E00-9FCBA000-A48CA4D0-A4FDA500-A60CA610-A61FA62AA62BA640-A65FA662-A66EA67F-A697A6A0-A6E5A717-A71FA722-A788A78BA78CA7FB-A801A803-A805A807-A80AA80C-A822A840-A873A882-A8B3A8F2-A8F7A8FBA90A-A925A930-A946A960-A97CA984-A9B2A9CFAA00-AA28AA40-AA42AA44-AA4BAA60-AA76AA7AAA80-AAAFAAB1AAB5AAB6AAB9-AABDAAC0AAC2AADB-AADDABC0-ABE2AC00-D7A3D7B0-D7C6D7CB-D7FBF900-FA2DFA30-FA6DFA70-FAD9FB00-FB06FB13-FB17FB1DFB1F-FB28FB2A-FB36FB38-FB3CFB3EFB40FB41FB43FB44FB46-FBB1FBD3-FD3DFD50-FD8FFD92-FDC7FDF0-FDFBFE70-FE74FE76-FEFCFF21-FF3AFF41-FF5AFF66-FFBEFFC2-FFC7FFCA-FFCFFFD2-FFD7FFDA-FFDC",h="\\\\",j='-',k="g",l="\\\"",m="qx.lang.String",n="(^|[^",o="0",p="%",q='"',r=' ',s='\n',t="])[";qx.Bootstrap.define(m,{statics:{__unicodeLetters:g,__unicodeFirstLetterInWordRegexp:null,__stringsMap:{},camelCase:function(v){var u=this.__stringsMap[v];if(!u){u=v.replace(/\-([a-z])/g,function(x,w){return w.toUpperCase();}
);if(v.indexOf(a)>=0){this.__stringsMap[v]=u;}
;}
;return u;}
,hyphenate:function(z){var y=this.__stringsMap[z];if(!y){y=z.replace(/[A-Z]/g,function(A){return (j+A.charAt(0).toLowerCase());}
);if(z.indexOf(a)==-1){this.__stringsMap[z]=y;}
;}
;return y;}
,capitalize:function(C){if(this.__unicodeFirstLetterInWordRegexp===null){var B=c;this.__unicodeFirstLetterInWordRegexp=new RegExp(n+this.__unicodeLetters.replace(/[0-9A-F]{4}/g,function(D){return B+D;}
)+t+this.__unicodeLetters.replace(/[0-9A-F]{4}/g,function(E){return B+E;}
)+b,k);}
;return C.replace(this.__unicodeFirstLetterInWordRegexp,function(F){return F.toUpperCase();}
);}
,clean:function(G){return G.replace(/\s+/g,r).trim();}
,trimLeft:function(H){return H.replace(/^\s+/,e);}
,trimRight:function(I){return I.replace(/\s+$/,e);}
,trim:function(J){{}
;return J.replace(/^\s+|\s+$/g,e);}
,startsWith:function(L,K){return L.indexOf(K)===0;}
,endsWith:function(N,M){return N.substring(N.length-M.length,N.length)===M;}
,repeat:function(O,P){return O.length>0?new Array(P+1).join(O):e;}
,pad:function(R,length,Q){var S=length-R.length;if(S>0){if(typeof Q===d){Q=o;}
;return this.repeat(Q,S)+R;}
else {return R;}
;}
,firstUp:qx.Bootstrap.firstUp,firstLow:qx.Bootstrap.firstLow,contains:function(U,T){return U.indexOf(T)!=-1;}
,format:function(V,W){var X=V;var i=W.length;while(i--){X=X.replace(new RegExp(p+(i+1),k),W[i]+e);}
;return X;}
,escapeRegexpChars:function(Y){return Y.replace(/([.*+?^${}()|[\]\/\\])/g,f);}
,toArray:function(ba){return ba.split(/\B|\b/g);}
,stripTags:function(bb){return bb.replace(/<\/?[^>]+>/gi,e);}
,stripScripts:function(be,bd){var bf=e;var bc=be.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi,function(){bf+=arguments[1]+s;return e;}
);if(bd===true){qx.lang.Function.globalEval(bf);}
;return bc;}
,quote:function(bg){return q+bg.replace(/\\/g,h).replace(/\"/g,l)+q;}
}});}
)();
(function(){var a="qx.lang.Function";qx.Bootstrap.define(a,{statics:{globalEval:function(data){if(window.execScript){return window.execScript(data);}
else {return eval.call(window,data);}
;}
,listener:function(c,self,d){if(arguments.length<3){return function(event){return c.call(self||this,event||window.event);}
;}
else {var b=qx.lang.Array.fromArguments(arguments,2);return function(event){var e=[event||window.event];e.push.apply(e,b);c.apply(self||this,e);}
;}
;}
}});}
)();
(function(){var a="css.float",b="css.borderimage.standardsyntax",c="borderRadius",d="boxSizing",e="stretch",f="css.borderradius",g="content",h="css.inlineblock",j="css.gradient.filter",k="css.appearance",l="css.opacity",m="div",n="css.gradient.radial",o="input",p="color",q="string",r="borderImage",s="userSelect",t="css.overflowxy",u="styleFloat",v="css.textShadow.filter",w="css.usermodify",x="css.boxsizing",y='url("foo.png") 4 4 4 4 fill stretch',z="css.boxmodel",A="qx.bom.client.Css",B="appearance",C="placeholder",D="-moz-none",E="backgroundImage",F="css.textShadow",G="DXImageTransform.Microsoft.Shadow",H="css.boxshadow",I="css.gradient.legacywebkit",J="linear-gradient(0deg, #fff, #000)",K="textShadow",L="css.borderimage",M="foo.png",N="rgba(1, 2, 3, 0.5)",O="color=#666666,direction=45",P="radial-gradient(0px 0px, cover, red 50%, blue 100%)",Q="rgba",R="(",S='url("foo.png") 4 4 4 4 stretch',T="css.gradient.linear",U="DXImageTransform.Microsoft.Gradient",V="css.userselect",W="span",X="-webkit-gradient(linear,0% 0%,100% 100%,from(white), to(red))",Y="mshtml",bv="css.rgba",bw=");",bx="4 fill",br="none",bs="startColorStr=#550000FF, endColorStr=#55FFFF00",bt="progid:",bu="css.placeholder",bB="css.userselect.none",bC="css.textoverflow",bD="inline-block",bF="-moz-inline-box",by="textOverflow",bz="userModify",bA="boxShadow",bq="cssFloat",bE="border";qx.Bootstrap.define(A,{statics:{__WEBKIT_LEGACY_GRADIENT:null,getBoxModel:function(){var content=qx.bom.client.Engine.getName()!==Y||!qx.bom.client.Browser.getQuirksMode();return content?g:bE;}
,getTextOverflow:function(){return qx.bom.Style.getPropertyName(by);}
,getPlaceholder:function(){var i=document.createElement(o);return C in i;}
,getAppearance:function(){return qx.bom.Style.getPropertyName(B);}
,getBorderRadius:function(){return qx.bom.Style.getPropertyName(c);}
,getBoxShadow:function(){return qx.bom.Style.getPropertyName(bA);}
,getBorderImage:function(){return qx.bom.Style.getPropertyName(r);}
,getBorderImageSyntax:function(){var bH=qx.bom.client.Css.getBorderImage();if(!bH){return null;}
;var bG=document.createElement(m);if(bH===r){bG.style[bH]=y;if(bG.style.borderImageSource.indexOf(M)>=0&&bG.style.borderImageSlice.indexOf(bx)>=0&&bG.style.borderImageRepeat.indexOf(e)>=0){return true;}
;}
else {bG.style[bH]=S;if(bG.style[bH].indexOf(M)>=0){return false;}
;}
;return null;}
,getUserSelect:function(){return qx.bom.Style.getPropertyName(s);}
,getUserSelectNone:function(){var bJ=qx.bom.client.Css.getUserSelect();if(bJ){var bI=document.createElement(W);bI.style[bJ]=D;return bI.style[bJ]===D?D:br;}
;return null;}
,getUserModify:function(){return qx.bom.Style.getPropertyName(bz);}
,getFloat:function(){var bK=document.documentElement.style;return bK.cssFloat!==undefined?bq:bK.styleFloat!==undefined?u:null;}
,getLinearGradient:function(){qx.bom.client.Css.__WEBKIT_LEGACY_GRADIENT=false;var bO=J;var bL=document.createElement(m);var bM=qx.bom.Style.getAppliedStyle(bL,E,bO);if(!bM){bO=X;var bM=qx.bom.Style.getAppliedStyle(bL,E,bO,false);if(bM){qx.bom.client.Css.__WEBKIT_LEGACY_GRADIENT=true;}
;}
;if(!bM){return null;}
;var bN=/(.*?)\(/.exec(bM);return bN?bN[1]:null;}
,getFilterGradient:function(){return qx.bom.client.Css.__isFilterSupported(U,bs);}
,getRadialGradient:function(){var bS=P;var bP=document.createElement(m);var bQ=qx.bom.Style.getAppliedStyle(bP,E,bS);if(!bQ){return null;}
;var bR=/(.*?)\(/.exec(bQ);return bR?bR[1]:null;}
,getLegacyWebkitGradient:function(){if(qx.bom.client.Css.__WEBKIT_LEGACY_GRADIENT===null){qx.bom.client.Css.getLinearGradient();}
;return qx.bom.client.Css.__WEBKIT_LEGACY_GRADIENT;}
,getRgba:function(){var bT;try{bT=document.createElement(m);}
catch(bU){bT=document.createElement();}
;try{bT.style[p]=N;if(bT.style[p].indexOf(Q)!=-1){return true;}
;}
catch(bV){}
;return false;}
,getBoxSizing:function(){return qx.bom.Style.getPropertyName(d);}
,getInlineBlock:function(){var bW=document.createElement(W);bW.style.display=bD;if(bW.style.display==bD){return bD;}
;bW.style.display=bF;if(bW.style.display!==bF){return bF;}
;return null;}
,getOpacity:function(){return (typeof document.documentElement.style.opacity==q);}
,getOverflowXY:function(){return (typeof document.documentElement.style.overflowX==q)&&(typeof document.documentElement.style.overflowY==q);}
,getTextShadow:function(){return !!qx.bom.Style.getPropertyName(K);}
,getFilterTextShadow:function(){return qx.bom.client.Css.__isFilterSupported(G,O);}
,__isFilterSupported:function(cb,bY){var ca=false;var cc=bt+cb+R+bY+bw;var bX=document.createElement(m);document.body.appendChild(bX);bX.style.filter=cc;if(bX.filters&&bX.filters.length>0&&bX.filters.item(cb).enabled==true){ca=true;}
;document.body.removeChild(bX);return ca;}
},defer:function(cd){qx.core.Environment.add(bC,cd.getTextOverflow);qx.core.Environment.add(bu,cd.getPlaceholder);qx.core.Environment.add(f,cd.getBorderRadius);qx.core.Environment.add(H,cd.getBoxShadow);qx.core.Environment.add(T,cd.getLinearGradient);qx.core.Environment.add(j,cd.getFilterGradient);qx.core.Environment.add(n,cd.getRadialGradient);qx.core.Environment.add(I,cd.getLegacyWebkitGradient);qx.core.Environment.add(z,cd.getBoxModel);qx.core.Environment.add(bv,cd.getRgba);qx.core.Environment.add(L,cd.getBorderImage);qx.core.Environment.add(b,cd.getBorderImageSyntax);qx.core.Environment.add(w,cd.getUserModify);qx.core.Environment.add(V,cd.getUserSelect);qx.core.Environment.add(bB,cd.getUserSelectNone);qx.core.Environment.add(k,cd.getAppearance);qx.core.Environment.add(a,cd.getFloat);qx.core.Environment.add(x,cd.getBoxSizing);qx.core.Environment.add(h,cd.getInlineBlock);qx.core.Environment.add(l,cd.getOpacity);qx.core.Environment.add(t,cd.getOverflowXY);qx.core.Environment.add(F,cd.getTextShadow);qx.core.Environment.add(v,cd.getFilterTextShadow);}
});}
)();
(function(){var a="rim_tabletos",b="10.1",c="Darwin",d="10.3",e="os.version",f="10.7",g="2003",h=")",i="iPhone",j="android",k="unix",l="ce",m="7",n="SymbianOS",o="10.5",p="os.name",q="10.9",r="|",s="MacPPC",t="95",u="iPod",v="10.8",w="\.",x="Win64",y="linux",z="me",A="10.2",B="Macintosh",C="Android",D="Windows",E="98",F="ios",G="vista",H="8",I="blackberry",J="2000",K="(",L="",M="win",N="Linux",O="10.6",P="BSD",Q="10.0",R="10.4",S="Mac OS X",T="iPad",U="X11",V="xp",W="symbian",X="qx.bom.client.OperatingSystem",Y="g",bn="Win32",bo="osx",bp="webOS",bj="RIM Tablet OS",bk="BlackBerry",bl="nt4",bm=".",bq="MacIntel",br="webos";qx.Bootstrap.define(X,{statics:{getName:function(){if(!navigator){return L;}
;var bs=navigator.platform||L;var bt=navigator.userAgent||L;if(bs.indexOf(D)!=-1||bs.indexOf(bn)!=-1||bs.indexOf(x)!=-1){return M;}
else if(bs.indexOf(B)!=-1||bs.indexOf(s)!=-1||bs.indexOf(bq)!=-1||bs.indexOf(S)!=-1){return bo;}
else if(bt.indexOf(bj)!=-1){return a;}
else if(bt.indexOf(bp)!=-1){return br;}
else if(bs.indexOf(u)!=-1||bs.indexOf(i)!=-1||bs.indexOf(T)!=-1){return F;}
else if(bt.indexOf(C)!=-1){return j;}
else if(bs.indexOf(N)!=-1){return y;}
else if(bs.indexOf(U)!=-1||bs.indexOf(P)!=-1||bs.indexOf(c)!=-1){return k;}
else if(bs.indexOf(n)!=-1){return W;}
else if(bs.indexOf(bk)!=-1){return I;}
;return L;}
,__ids:{"Windows NT 6.2":H,"Windows NT 6.1":m,"Windows NT 6.0":G,"Windows NT 5.2":g,"Windows NT 5.1":V,"Windows NT 5.0":J,"Windows 2000":J,"Windows NT 4.0":bl,"Win 9x 4.90":z,"Windows CE":l,"Windows 98":E,"Win98":E,"Windows 95":t,"Win95":t,"Mac OS X 10_9":q,"Mac OS X 10.9":q,"Mac OS X 10_8":v,"Mac OS X 10.8":v,"Mac OS X 10_7":f,"Mac OS X 10.7":f,"Mac OS X 10_6":O,"Mac OS X 10.6":O,"Mac OS X 10_5":o,"Mac OS X 10.5":o,"Mac OS X 10_4":R,"Mac OS X 10.4":R,"Mac OS X 10_3":d,"Mac OS X 10.3":d,"Mac OS X 10_2":A,"Mac OS X 10.2":A,"Mac OS X 10_1":b,"Mac OS X 10.1":b,"Mac OS X 10_0":Q,"Mac OS X 10.0":Q},getVersion:function(){var bu=qx.bom.client.OperatingSystem.__getVersionForDesktopOs(navigator.userAgent);if(bu==null){bu=qx.bom.client.OperatingSystem.__getVersionForMobileOs(navigator.userAgent);}
;if(bu!=null){return bu;}
else {return L;}
;}
,__getVersionForDesktopOs:function(bv){var by=[];for(var bx in qx.bom.client.OperatingSystem.__ids){by.push(bx);}
;var bz=new RegExp(K+by.join(r).replace(/\./g,w)+h,Y);var bw=bz.exec(bv);if(bw&&bw[1]){return qx.bom.client.OperatingSystem.__ids[bw[1]];}
;return null;}
,__getVersionForMobileOs:function(bD){var bE=bD.indexOf(C)!=-1;var bA=bD.match(/(iPad|iPhone|iPod)/i)?true:false;if(bE){var bC=new RegExp(/ Android (\d+(?:\.\d+)+)/i);var bF=bC.exec(bD);if(bF&&bF[1]){return bF[1];}
;}
else if(bA){var bG=new RegExp(/(CPU|iPhone|iPod) OS (\d+)_(\d+)\s+/);var bB=bG.exec(bD);if(bB&&bB[2]&&bB[3]){return bB[2]+bm+bB[3];}
;}
;return null;}
},defer:function(bH){qx.core.Environment.add(p,bH.getName);qx.core.Environment.add(e,bH.getVersion);}
});}
)();
(function(){var a="CSS1Compat",b="msie",c="android",d="operamini",e="gecko",f="maple",g="browser.quirksmode",h="browser.name",i="mobile chrome",j=")(/| )([0-9]+\.[0-9])",k="iemobile",l="prism|Fennec|Camino|Kmeleon|Galeon|Netscape|SeaMonkey|Namoroka|Firefox",m="opera mobi",n="Mobile Safari",o="Maple",p="operamobile",q="ie",r="mobile safari",s="IEMobile|Maxthon|MSIE",t="AdobeAIR|Titanium|Fluid|Chrome|Android|Epiphany|Konqueror|iCab|OmniWeb|Maxthon|Pre|PhantomJS|Mobile Safari|Safari",u="qx.bom.client.Browser",v="(Maple )([0-9]+\.[0-9]+\.[0-9]*)",w="",x="opera mini",y="(",z="browser.version",A="opera",B="ce",C="mshtml",D="Opera Mini|Opera Mobi|Opera",E="webkit",F="browser.documentmode",G="5.0",H="Mobile/";qx.Bootstrap.define(u,{statics:{getName:function(){var K=navigator.userAgent;var L=new RegExp(y+qx.bom.client.Browser.__agents+j);var J=K.match(L);if(!J){return w;}
;var name=J[1].toLowerCase();var I=qx.bom.client.Engine.getName();if(I===E){if(name===c){name=i;}
else if(K.indexOf(n)!==-1||K.indexOf(H)!==-1){name=r;}
;}
else if(I===C){if(name===b){name=q;if(qx.bom.client.OperatingSystem.getVersion()===B){name=k;}
;}
;}
else if(I===A){if(name===m){name=p;}
else if(name===x){name=d;}
;}
else if(I===e){if(K.indexOf(o)!==-1){name=f;}
;}
;return name;}
,getVersion:function(){var O=navigator.userAgent;var P=new RegExp(y+qx.bom.client.Browser.__agents+j);var M=O.match(P);if(!M){return w;}
;var name=M[1].toLowerCase();var N=M[3];if(O.match(/Version(\/| )([0-9]+\.[0-9])/)){N=RegExp.$2;}
;if(qx.bom.client.Engine.getName()==C){N=qx.bom.client.Engine.getVersion();if(name===b&&qx.bom.client.OperatingSystem.getVersion()==B){N=G;}
;}
;if(qx.bom.client.Browser.getName()==f){P=new RegExp(v);M=O.match(P);if(!M){return w;}
;N=M[2];}
;return N;}
,getDocumentMode:function(){if(document.documentMode){return document.documentMode;}
;return 0;}
,getQuirksMode:function(){if(qx.bom.client.Engine.getName()==C&&parseFloat(qx.bom.client.Engine.getVersion())>=8){return qx.bom.client.Engine.DOCUMENT_MODE===5;}
else {return document.compatMode!==a;}
;}
,__agents:{"webkit":t,"gecko":l,"mshtml":s,"opera":D}[qx.bom.client.Engine.getName()]},defer:function(Q){qx.core.Environment.add(h,Q.getName),qx.core.Environment.add(z,Q.getVersion),qx.core.Environment.add(F,Q.getDocumentMode),qx.core.Environment.add(g,Q.getQuirksMode);}
});}
)();
(function(){var a="-",b="qx.bom.Style",c="",d='-',e="Webkit",f="ms",g="Moz",h="O",j="string",k="Khtml";qx.Bootstrap.define(b,{statics:{VENDOR_PREFIXES:[e,g,h,f,k],__cssName:{},getPropertyName:function(o){var m=document.documentElement.style;if(m[o]!==undefined){return o;}
;for(var i=0,l=this.VENDOR_PREFIXES.length;i<l;i++){var n=this.VENDOR_PREFIXES[i]+qx.lang.String.firstUp(o);if(m[n]!==undefined){return n;}
;}
;return null;}
,getCssName:function(p){var q=this.__cssName[p];if(!q){q=p.replace(/[A-Z]/g,function(r){return (d+r.charAt(0).toLowerCase());}
);if((/^ms/.test(q))){q=a+q;}
;this.__cssName[p]=q;}
;return q;}
,getAppliedStyle:function(w,u,v,t){var s=(t!==false)?[null].concat(this.VENDOR_PREFIXES):[null];for(var i=0,l=s.length;i<l;i++){var x=s[i]?a+s[i].toLowerCase()+a+v:v;try{w.style[u]=x;if(typeof w.style[u]==j&&w.style[u]!==c){return x;}
;}
catch(y){}
;}
;return null;}
}});}
)();
(function(){var a="engine.name",b=");",c="",d=")",e="zoom:1;filter:alpha(opacity=",f="qx.bom.element.Opacity",g="css.opacity",h=";",i="opacity:",j="alpha(opacity=",k="opacity",l="filter";qx.Bootstrap.define(f,{statics:{SUPPORT_CSS3_OPACITY:false,compile:qx.core.Environment.select(a,{"mshtml":function(m){if(m>=1){m=1;}
;if(m<0.00001){m=0;}
;if(qx.core.Environment.get(g)){return i+m+h;}
else {return e+(m*100)+b;}
;}
,"default":function(n){if(n>=1){return c;}
;return i+n+h;}
}),set:qx.core.Environment.select(a,{"mshtml":function(q,o){if(qx.core.Environment.get(g)){if(o>=1){o=c;}
;q.style.opacity=o;}
else {var p=qx.bom.element.Style.get(q,l,qx.bom.element.Style.COMPUTED_MODE,false);if(o>=1){o=1;}
;if(o<0.00001){o=0;}
;if(!q.currentStyle||!q.currentStyle.hasLayout){q.style.zoom=1;}
;q.style.filter=p.replace(/alpha\([^\)]*\)/gi,c)+j+o*100+d;}
;}
,"default":function(s,r){if(r>=1){r=c;}
;s.style.opacity=r;}
}),reset:qx.core.Environment.select(a,{"mshtml":function(u){if(qx.core.Environment.get(g)){u.style.opacity=c;}
else {var t=qx.bom.element.Style.get(u,l,qx.bom.element.Style.COMPUTED_MODE,false);u.style.filter=t.replace(/alpha\([^\)]*\)/gi,c);}
;}
,"default":function(v){v.style.opacity=c;}
}),get:qx.core.Environment.select(a,{"mshtml":function(z,y){if(qx.core.Environment.get(g)){var w=qx.bom.element.Style.get(z,k,y,false);if(w!=null){return parseFloat(w);}
;return 1.0;}
else {var x=qx.bom.element.Style.get(z,l,y,false);if(x){var w=x.match(/alpha\(opacity=(.*)\)/);if(w&&w[1]){return parseFloat(w[1])/100;}
;}
;return 1.0;}
;}
,"default":function(C,B){var A=qx.bom.element.Style.get(C,k,B,false);if(A!=null){return parseFloat(A);}
;return 1.0;}
})},defer:function(D){D.SUPPORT_CSS3_OPACITY=qx.core.Environment.get(g);}
});{}
;}
)();
(function(){var a="clip:auto;",b="rect(",c=")",d=");",e="",f="px",g="Could not parse clip string: ",h="qx.bom.element.Clip",i="string",j="clip:rect(",k=" ",l="clip",m="rect(auto,auto,auto,auto)",n="rect(auto, auto, auto, auto)",o="auto",p=",";qx.Bootstrap.define(h,{statics:{compile:function(q){if(!q){return a;}
;var v=q.left;var top=q.top;var u=q.width;var t=q.height;var r,s;if(v==null){r=(u==null?o:u+f);v=o;}
else {r=(u==null?o:v+u+f);v=v+f;}
;if(top==null){s=(t==null?o:t+f);top=o;}
else {s=(t==null?o:top+t+f);top=top+f;}
;return j+top+p+r+p+s+p+v+d;}
,get:function(z,D){var x=qx.bom.element.Style.get(z,l,D,false);var C,top,A,E;var w,y;if(typeof x===i&&x!==o&&x!==e){x=x.trim();if(/\((.*)\)/.test(x)){var F=RegExp.$1;if(/,/.test(F)){var B=F.split(p);}
else {var B=F.split(k);}
;top=B[0].trim();w=B[1].trim();y=B[2].trim();C=B[3].trim();if(C===o){C=null;}
;if(top===o){top=null;}
;if(w===o){w=null;}
;if(y===o){y=null;}
;if(top!=null){top=parseInt(top,10);}
;if(w!=null){w=parseInt(w,10);}
;if(y!=null){y=parseInt(y,10);}
;if(C!=null){C=parseInt(C,10);}
;if(w!=null&&C!=null){A=w-C;}
else if(w!=null){A=w;}
;if(y!=null&&top!=null){E=y-top;}
else if(y!=null){E=y;}
;}
else {throw new Error(g+x);}
;}
;return {left:C||null,top:top||null,width:A||null,height:E||null};}
,set:function(L,G){if(!G){L.style.clip=m;return;}
;var M=G.left;var top=G.top;var K=G.width;var J=G.height;var H,I;if(M==null){H=(K==null?o:K+f);M=o;}
else {H=(K==null?o:M+K+f);M=M+f;}
;if(top==null){I=(J==null?o:J+f);top=o;}
else {I=(J==null?o:top+J+f);top=top+f;}
;L.style.clip=b+top+p+H+p+I+p+M+c;}
,reset:function(N){N.style.clip=n;}
}});}
)();
(function(){var a="cursor:",b="engine.name",c="ns-resize",d="",e="mshtml",f="nw-resize",g="n-resize",h="engine.version",i="nesw-resize",j="opera",k="browser.documentmode",l=";",m="nwse-resize",n="ew-resize",o="qx.bom.element.Cursor",p="ne-resize",q="e-resize",r="browser.quirksmode",s="cursor";qx.Bootstrap.define(o,{statics:{__map:{},compile:function(t){return a+(this.__map[t]||t)+l;}
,get:function(v,u){return qx.bom.element.Style.get(v,s,u,false);}
,set:function(x,w){x.style.cursor=this.__map[w]||w;}
,reset:function(y){y.style.cursor=d;}
},defer:function(z){if(qx.core.Environment.get(b)==e&&((parseFloat(qx.core.Environment.get(h))<9||qx.core.Environment.get(k)<9)&&!qx.core.Environment.get(r))){z.__map[i]=p;z.__map[m]=f;if(((parseFloat(qx.core.Environment.get(h))<8||qx.core.Environment.get(k)<8)&&!qx.core.Environment.get(r))){z.__map[n]=q;z.__map[c]=g;}
;}
else if(qx.core.Environment.get(b)==j&&parseInt(qx.core.Environment.get(h))<12){z.__map[i]=p;z.__map[m]=f;}
;}
});}
)();
(function(){var a="ecmascript.object.keys",b="qx.lang.normalize.Object";qx.Bootstrap.define(b,{defer:function(){if(!qx.core.Environment.get(a)){Object.keys=qx.Bootstrap.keys;}
;}
});}
)();
(function(){var a="qx.lang.Object";qx.Bootstrap.define(a,{statics:{empty:function(b){{}
;for(var c in b){if(b.hasOwnProperty(c)){delete b[c];}
;}
;}
,isEmpty:function(d){{}
;for(var e in d){return false;}
;return true;}
,hasMinLength:function(f,h){{}
;if(h<=0){return true;}
;var length=0;for(var g in f){if((++length)>=h){return true;}
;}
;return false;}
,getLength:qx.Bootstrap.objectGetLength,getKeys:qx.Bootstrap.getKeys,getKeysAsString:qx.Bootstrap.getKeysAsString,getValues:function(k){{}
;var m=[];var j=Object.keys(k);for(var i=0,l=j.length;i<l;i++){m.push(k[j[i]]);}
;return m;}
,mergeWith:qx.Bootstrap.objectMergeWith,carefullyMergeWith:function(o,n){{}
;return qx.lang.Object.mergeWith(o,n,false);}
,merge:function(p,r){{}
;var q=arguments.length;for(var i=1;i<q;i++){qx.lang.Object.mergeWith(p,arguments[i]);}
;return p;}
,clone:function(s,v){if(qx.lang.Type.isObject(s)){var t={};for(var u in s){if(v){t[u]=qx.lang.Object.clone(s[u],v);}
else {t[u]=s[u];}
;}
;return t;}
else if(qx.lang.Type.isArray(s)){var t=[];for(var i=0;i<s.length;i++){if(v){t[i]=qx.lang.Object.clone(s[i]);}
else {t[i]=s[i];}
;}
;return t;}
;return s;}
,invert:function(w){{}
;var x={};for(var y in w){x[w[y].toString()]=y;}
;return x;}
,getKeyFromValue:function(z,A){{}
;for(var B in z){if(z.hasOwnProperty(B)&&z[B]===A){return B;}
;}
;return null;}
,contains:function(C,D){{}
;return this.getKeyFromValue(C,D)!==null;}
,select:function(F,E){{}
;{}
;return E[F];}
,fromArray:function(G){{}
;var H={};for(var i=0,l=G.length;i<l;i++){{}
;H[G[i].toString()]=true;}
;return H;}
,toUriParameter:function(J,I){{}
;return qx.util.Uri.toParameter(J,I);}
}});}
)();
(function(){var a="file",b="+",c="strict",d="anchor",e="div",f="query",g="source",h="password",j="host",k="protocol",l="user",n="directory",p="loose",q="relative",r="queryKey",s="qx.util.Uri",t="",u="path",v="authority",w='">0</a>',x="&",y="port",z='<a href="',A="userInfo",B="?",C="=";qx.Bootstrap.define(s,{statics:{parseUri:function(F,E){var G={key:[g,k,v,A,l,h,j,y,q,u,n,a,f,d],q:{name:r,parser:/(?:^|&)([^&=]*)=?([^&]*)/g},parser:{strict:/^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,loose:/^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/}};var o=G,m=G.parser[E?c:p].exec(F),D={},i=14;while(i--){D[o.key[i]]=m[i]||t;}
;D[o.q.name]={};D[o.key[12]].replace(o.q.parser,function(I,J,H){if(J){D[o.q.name][J]=H;}
;}
);return D;}
,appendParamsToUrl:function(K,L){if(L===undefined){return K;}
;{}
;if(qx.lang.Type.isObject(L)){L=qx.util.Uri.toParameter(L);}
;if(!L){return K;}
;return K+=(/\?/).test(K)?x+L:B+L;}
,toParameter:function(M,Q){var P,O=[];for(P in M){if(M.hasOwnProperty(P)){var N=M[P];if(N instanceof Array){for(var i=0;i<N.length;i++){this.__toParameterPair(P,N[i],O,Q);}
;}
else {this.__toParameterPair(P,N,O,Q);}
;}
;}
;return O.join(x);}
,__toParameterPair:function(U,V,T,S){var R=window.encodeURIComponent;if(S){T.push(R(U).replace(/%20/g,b)+C+R(V).replace(/%20/g,b));}
else {T.push(R(U)+C+R(V));}
;}
,getAbsolute:function(X){var W=document.createElement(e);W.innerHTML=z+X+w;return W.firstChild.href;}
}});}
)();
(function(){var a="border-box",b="qx.bom.element.BoxSizing",c="css.boxsizing",d="",e="boxSizing",f="content-box",g=":",h=";";qx.Bootstrap.define(b,{statics:{__nativeBorderBox:{tags:{button:true,select:true},types:{search:true,button:true,submit:true,reset:true,checkbox:true,radio:true}},__usesNativeBorderBox:function(j){var i=this.__nativeBorderBox;return i.tags[j.tagName.toLowerCase()]||i.types[j.type];}
,compile:function(k){if(qx.core.Environment.get(c)){var l=qx.bom.Style.getCssName(qx.core.Environment.get(c));return l+g+k+h;}
else {{}
;}
;}
,get:function(m){if(qx.core.Environment.get(c)){return qx.bom.element.Style.get(m,e,null,false)||d;}
;if(qx.bom.Document.isStandardMode(qx.dom.Node.getWindow(m))){if(!this.__usesNativeBorderBox(m)){return f;}
;}
;return a;}
,set:function(o,n){if(qx.core.Environment.get(c)){try{o.style[qx.core.Environment.get(c)]=n;}
catch(p){{}
;}
;}
else {{}
;}
;}
,reset:function(q){this.set(q,d);}
}});}
)();
(function(){var a="css.float",b="qx.bom.element.Style",c="css.borderimage",d="css.userselect",e="css.boxsizing",f="pixelLeft",g="css.textoverflow",h="Cascaded styles are not supported in this browser!",i="pixelBottom",j="engine.name",k="pixelHeight",l="pixelWidth",m="css.appearance",n="pixelRight",o="css.usermodify",p="float",q="",r="pixelTop",s="px";qx.Bootstrap.define(b,{statics:{__styleNames:null,__cssNames:null,__detectVendorProperties:function(){var u={"appearance":qx.core.Environment.get(m),"userSelect":qx.core.Environment.get(d),"textOverflow":qx.core.Environment.get(g),"borderImage":qx.core.Environment.get(c),"float":qx.core.Environment.get(a),"userModify":qx.core.Environment.get(o),"boxSizing":qx.core.Environment.get(e)};this.__cssNames={};for(var t in qx.lang.Object.clone(u)){if(!u[t]){delete u[t];}
else {this.__cssNames[t]=t==p?p:qx.bom.Style.getCssName(u[t]);}
;}
;this.__styleNames=u;}
,__getStyleName:function(name){var v=qx.bom.Style.getPropertyName(name);if(v){this.__styleNames[name]=v;}
;return v;}
,__mshtmlPixel:{width:l,height:k,left:f,right:n,top:r,bottom:i},__special:{clip:qx.bom.element.Clip,cursor:qx.bom.element.Cursor,opacity:qx.bom.element.Opacity,boxSizing:qx.bom.element.BoxSizing},COMPUTED_MODE:1,CASCADED_MODE:2,LOCAL_MODE:3,set:function(y,name,w,x){{}
;name=this.__styleNames[name]||this.__getStyleName(name)||name;if(x!==false&&this.__special[name]){this.__special[name].set(y,w);}
else {y.style[name]=w!==null?w:q;}
;}
,get:qx.core.Environment.select(j,{"mshtml":function(B,name,C,F){name=this.__styleNames[name]||this.__getStyleName(name)||name;if(F!==false&&this.__special[name]){return this.__special[name].get(B,C);}
;if(!B.currentStyle){return B.style[name]||q;}
;switch(C){case this.LOCAL_MODE:return B.style[name]||q;case this.CASCADED_MODE:return B.currentStyle[name]||q;default:var D=B.currentStyle[name]||B.style[name]||q;if(/^-?[\.\d]+(px)?$/i.test(D)){return D;}
;var E=this.__mshtmlPixel[name];if(E){var A=B.style[name];B.style[name]=D||0;var z=B.style[E]+s;B.style[name]=A;return z;}
;return D;};}
,"default":function(I,name,J,K){name=this.__styleNames[name]||this.__getStyleName(name)||name;if(K!==false&&this.__special[name]){return this.__special[name].get(I,J);}
;switch(J){case this.LOCAL_MODE:return I.style[name]||q;case this.CASCADED_MODE:if(I.currentStyle){return I.currentStyle[name]||q;}
;throw new Error(h);default:var H=qx.dom.Node.getDocument(I);var G=H.defaultView.getComputedStyle(I,null);if(G&&G[name]){return G[name];}
;return I.style[name]||q;};}
})},defer:function(L){L.__detectVendorProperties();}
});}
)();
(function(){var b="qx.dom.Node",c="";qx.Bootstrap.define(b,{statics:{ELEMENT:1,TEXT:3,DOCUMENT:9,getDocument:function(d){return d.nodeType===this.DOCUMENT?d:d.ownerDocument||d.document;}
,getWindow:function(e){if(e.nodeType==null){return e;}
;if(e.nodeType!==this.DOCUMENT){e=e.ownerDocument;}
;return e.defaultView||e.parentWindow;}
,isNode:function(f){return !!(f&&f.nodeType!=null);}
,isElement:function(g){return !!(g&&g.nodeType===this.ELEMENT);}
,isDocument:function(h){return !!(h&&h.nodeType===this.DOCUMENT);}
,isText:function(j){return !!(j&&j.nodeType===this.TEXT);}
,isWindow:function(k){return !!(k&&k.history&&k.location&&k.document);}
,isNodeName:function(l,m){if(!m||!l||!l.nodeName){return false;}
;return m.toLowerCase()==qx.dom.Node.getName(l);}
,getName:function(n){if(!n||!n.nodeName){return null;}
;return n.nodeName.toLowerCase();}
,getText:function(o){if(!o||!o.nodeType){return null;}
;switch(o.nodeType){case 1:var i,a=[],p=o.childNodes,length=p.length;for(i=0;i<length;i++){a[i]=this.getText(p[i]);}
;return a.join(c);case 2:case 3:case 4:return o.nodeValue;};return null;}
,isBlockNode:function(q){if(!qx.dom.Node.isElement(q)){return false;}
;q=qx.dom.Node.getName(q);return /^(body|form|textarea|fieldset|ul|ol|dl|dt|dd|li|div|hr|p|h[1-6]|quote|pre|table|thead|tbody|tfoot|tr|td|th|iframe|address|blockquote)$/.test(q);}
}});}
)();
(function(){var a="engine.name",b="CSS1Compat",c="position:absolute;width:0;height:0;width:1",d="engine.version",e="qx.bom.Document",f="1px",g="div";qx.Bootstrap.define(e,{statics:{isQuirksMode:qx.core.Environment.select(a,{"mshtml":function(h){if(qx.core.Environment.get(d)>=8){return (h||window).document.documentMode===5;}
else {return (h||window).document.compatMode!==b;}
;}
,"webkit":function(i){if(document.compatMode===undefined){var j=(i||window).document.createElement(g);j.style.cssText=c;return j.style.width===f?true:false;}
else {return (i||window).document.compatMode!==b;}
;}
,"default":function(k){return (k||window).document.compatMode!==b;}
}),isStandardMode:function(l){return !this.isQuirksMode(l);}
,getWidth:function(m){var o=(m||window).document;var n=qx.bom.Viewport.getWidth(m);var scroll=this.isStandardMode(m)?o.documentElement.scrollWidth:o.body.scrollWidth;return Math.max(scroll,n);}
,getHeight:function(p){var r=(p||window).document;var q=qx.bom.Viewport.getHeight(p);var scroll=this.isStandardMode(p)?r.documentElement.scrollHeight:r.body.scrollHeight;return Math.max(scroll,q);}
}});}
)();
(function(){var a="undefined",b="qx.bom.Viewport";qx.Bootstrap.define(b,{statics:{getWidth:function(c){var c=c||window;var d=c.document;return qx.bom.Document.isStandardMode(c)?d.documentElement.clientWidth:d.body.clientWidth;}
,getHeight:function(e){var e=e||window;var f=e.document;return qx.bom.Document.isStandardMode(e)?f.documentElement.clientHeight:f.body.clientHeight;}
,getScrollLeft:function(g){var g=g?g:window;if(typeof g.pageXOffset!==a){return g.pageXOffset;}
;var h=g.document;return h.documentElement.scrollLeft||h.body.scrollLeft;}
,getScrollTop:function(i){var i=i?i:window;if(typeof i.pageYOffeset!==a){return i.pageYOffset;}
;var j=i.document;return j.documentElement.scrollTop||j.body.scrollTop;}
,__getOrientationNormalizer:function(k){var m=this.getWidth(k)>this.getHeight(k)?90:0;var l=k.orientation;if(l==null||Math.abs(l%180)==m){return {"-270":90,"-180":180,"-90":-90,"0":0,"90":90,"180":180,"270":-90};}
else {return {"-270":180,"-180":-90,"-90":0,"0":90,"90":180,"180":-90,"270":0};}
;}
,__orientationNormalizer:null,getOrientation:function(n){var n=n||window.top;var o=n.orientation;if(o==null){o=this.getWidth(n)>this.getHeight(n)?90:0;}
else {if(this.__orientationNormalizer==null){this.__orientationNormalizer=this.__getOrientationNormalizer(n);}
;o=this.__orientationNormalizer[o];}
;return o;}
,isLandscape:function(p){return this.getWidth(p)>=this.getHeight(p);}
}});}
)();
(function(){var b="function",c="html.video.h264",d="html.element.contains",f='video/ogg; codecs="theora, vorbis"',g="html.console",h="html.xul",i="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul",j="html.video.ogg",k="http://www.w3.org/TR/SVG11/feature#BasicStructure",l="html.storage.local",m="div",n="qx.bom.client.Html",o='audio',p='video/mp4; codecs="avc1.42E01E, mp4a.40.2"',q="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==",r="html.audio",s="video",t="url(#default#VML)",u="head",w="audio",x="audio/mpeg",y="org.w3c.dom.svg",z="html.classlist",A="html.svg",B="html.video",C="html.geolocation",D="DOMTokenList",E="html.storage.session",F="1.1",G="html.history.state",H="object",I="html.image.naturaldimensions",J="html.audio.aif",K="audio/x-wav",L='<v:shape id="vml_flag1" adj="1" />',M="html.canvas",N="audio/ogg",O="",P="html.storage.userdata",Q="number",R="html.element.compareDocumentPosition",S="audio/x-aiff",T="html.audio.au",U="img",V="html.xpath",W="qxtest",X='video',Y="span",bx="html.element.textcontent",by="geolocation",bz="html.audio.mp3",bt="html.vml",bu="undefined",bv="html.audio.ogg",bw="none",bE="label",bF='video/webm; codecs="vp8, vorbis"',bJ="html.dataurl",bK="html.webworker",bA="html.dataset",bB="1.0",bC="html.audio.wav",bD="html.filereader",bG="audio/basic",bL="#default#userdata",bH="html.video.webm",bI="display";qx.Bootstrap.define(n,{statics:{getWebWorker:function(){return window.Worker!=null;}
,getFileReader:function(){return window.FileReader!=null;}
,getGeoLocation:function(){return by in navigator;}
,getAudio:function(){return !!document.createElement(o).canPlayType;}
,getAudioOgg:function(){if(!qx.bom.client.Html.getAudio()){return O;}
;var a=document.createElement(w);return a.canPlayType(N);}
,getAudioMp3:function(){if(!qx.bom.client.Html.getAudio()){return O;}
;var a=document.createElement(w);return a.canPlayType(x);}
,getAudioWav:function(){if(!qx.bom.client.Html.getAudio()){return O;}
;var a=document.createElement(w);return a.canPlayType(K);}
,getAudioAu:function(){if(!qx.bom.client.Html.getAudio()){return O;}
;var a=document.createElement(w);return a.canPlayType(bG);}
,getAudioAif:function(){if(!qx.bom.client.Html.getAudio()){return O;}
;var a=document.createElement(w);return a.canPlayType(S);}
,getVideo:function(){return !!document.createElement(X).canPlayType;}
,getVideoOgg:function(){if(!qx.bom.client.Html.getVideo()){return O;}
;var v=document.createElement(s);return v.canPlayType(f);}
,getVideoH264:function(){if(!qx.bom.client.Html.getVideo()){return O;}
;var v=document.createElement(s);return v.canPlayType(p);}
,getVideoWebm:function(){if(!qx.bom.client.Html.getVideo()){return O;}
;var v=document.createElement(s);return v.canPlayType(bF);}
,getLocalStorage:function(){try{return window.localStorage!=null;}
catch(bM){return false;}
;}
,getSessionStorage:function(){try{return window.sessionStorage!=null;}
catch(bN){return false;}
;}
,getUserDataStorage:function(){var bO=document.createElement(m);bO.style[bI]=bw;document.getElementsByTagName(u)[0].appendChild(bO);var bP=false;try{bO.addBehavior(bL);bO.load(W);bP=true;}
catch(e){}
;document.getElementsByTagName(u)[0].removeChild(bO);return bP;}
,getClassList:function(){return !!(document.documentElement.classList&&qx.Bootstrap.getClass(document.documentElement.classList)===D);}
,getXPath:function(){return !!document.evaluate;}
,getXul:function(){try{document.createElementNS(i,bE);return true;}
catch(e){return false;}
;}
,getSvg:function(){return document.implementation&&document.implementation.hasFeature&&(document.implementation.hasFeature(y,bB)||document.implementation.hasFeature(k,F));}
,getVml:function(){var bQ=document.createElement(m);document.body.appendChild(bQ);bQ.innerHTML=L;bQ.firstChild.style.behavior=t;var bR=typeof bQ.firstChild.adj==H;document.body.removeChild(bQ);return bR;}
,getCanvas:function(){return !!window.CanvasRenderingContext2D;}
,getDataUrl:function(bS){var bT=new Image();bT.onload=bT.onerror=function(){window.setTimeout(function(){bS.call(null,(bT.width==1&&bT.height==1));}
,0);}
;bT.src=q;}
,getDataset:function(){return !!document.documentElement.dataset;}
,getContains:function(){return (typeof document.documentElement.contains!==bu);}
,getCompareDocumentPosition:function(){return (typeof document.documentElement.compareDocumentPosition===b);}
,getTextContent:function(){var bU=document.createElement(Y);return (typeof bU.textContent!==bu);}
,getConsole:function(){return typeof window.console!==bu;}
,getNaturalDimensions:function(){var bV=document.createElement(U);return typeof bV.naturalHeight===Q&&typeof bV.naturalWidth===Q;}
,getHistoryState:function(){return (typeof window.onpopstate!==bu&&typeof window.history.replaceState!==bu&&typeof window.history.pushState!==bu);}
},defer:function(bW){qx.core.Environment.add(bK,bW.getWebWorker);qx.core.Environment.add(bD,bW.getFileReader);qx.core.Environment.add(C,bW.getGeoLocation);qx.core.Environment.add(r,bW.getAudio);qx.core.Environment.add(bv,bW.getAudioOgg);qx.core.Environment.add(bz,bW.getAudioMp3);qx.core.Environment.add(bC,bW.getAudioWav);qx.core.Environment.add(T,bW.getAudioAu);qx.core.Environment.add(J,bW.getAudioAif);qx.core.Environment.add(B,bW.getVideo);qx.core.Environment.add(j,bW.getVideoOgg);qx.core.Environment.add(c,bW.getVideoH264);qx.core.Environment.add(bH,bW.getVideoWebm);qx.core.Environment.add(l,bW.getLocalStorage);qx.core.Environment.add(E,bW.getSessionStorage);qx.core.Environment.add(P,bW.getUserDataStorage);qx.core.Environment.add(z,bW.getClassList);qx.core.Environment.add(V,bW.getXPath);qx.core.Environment.add(h,bW.getXul);qx.core.Environment.add(M,bW.getCanvas);qx.core.Environment.add(A,bW.getSvg);qx.core.Environment.add(bt,bW.getVml);qx.core.Environment.add(bA,bW.getDataset);qx.core.Environment.addAsync(bJ,bW.getDataUrl);qx.core.Environment.add(d,bW.getContains);qx.core.Environment.add(R,bW.getCompareDocumentPosition);qx.core.Environment.add(bx,bW.getTextContent);qx.core.Environment.add(g,bW.getConsole);qx.core.Environment.add(I,bW.getNaturalDimensions);qx.core.Environment.add(G,bW.getHistoryState);}
});}
)();
(function(){var a='',b="g",c="(^|\\s)",d='function',e="(\\s|$)",f="",g="\\b|\\b",h="qx.bom.element.Class",j='SVGAnimatedString',k="html.classlist",m="default",n=" ",o='object',p="$2",q="native",r="\\b",s='undefined';qx.Bootstrap.define(h,{statics:{__splitter:/\s+/g,__trim:/^\s+|\s+$/g,add:{"native":function(t,name){t.classList.add(name);return name;}
,"default":function(u,name){if(!this.has(u,name)){u.className+=(u.className?n:f)+name;}
;return name;}
}[qx.core.Environment.get(k)?q:m],addClasses:{"native":function(w,v){for(var i=0;i<v.length;i++){w.classList.add(v[i]);}
;return w.className;}
,"default":function(y,A){var z={};var B;var x=y.className;if(x){B=x.split(this.__splitter);for(var i=0,l=B.length;i<l;i++){z[B[i]]=true;}
;for(var i=0,l=A.length;i<l;i++){if(!z[A[i]]){B.push(A[i]);}
;}
;}
else {B=A;}
;return y.className=B.join(n);}
}[qx.core.Environment.get(k)?q:m],get:function(D){var C=D.className;if(typeof C.split!==d){if(typeof C===o){if(qx.Bootstrap.getClass(C)==j){C=C.baseVal;}
else {{}
;C=a;}
;}
;if(typeof C===s){{}
;C=a;}
;}
;return C;}
,has:{"native":function(E,name){return E.classList.contains(name);}
,"default":function(G,name){var F=new RegExp(c+name+e);return F.test(G.className);}
}[qx.core.Environment.get(k)?q:m],remove:{"native":function(H,name){H.classList.remove(name);return name;}
,"default":function(J,name){var I=new RegExp(c+name+e);J.className=J.className.replace(I,p);return name;}
}[qx.core.Environment.get(k)?q:m],removeClasses:{"native":function(L,K){for(var i=0;i<K.length;i++){L.classList.remove(K[i]);}
;return L.className;}
,"default":function(O,M){var N=new RegExp(r+M.join(g)+r,b);return O.className=O.className.replace(N,f).replace(this.__trim,f).replace(this.__splitter,n);}
}[qx.core.Environment.get(k)?q:m],replace:function(R,Q,P){if(!this.has(R,Q)){return f;}
;this.remove(R,Q);return this.add(R,P);}
}});}
)();
(function(){var a="mshtml",b="engine.name",c="qx.bom.element.Dimension",d="0px",e="paddingRight",f="engine.version",g="paddingLeft",h="opera",i="paddingBottom",j="paddingTop",k="overflowX",l="overflowY";qx.Bootstrap.define(c,{statics:{getWidth:function(n){var m=n.getBoundingClientRect();return Math.round(m.right)-Math.round(m.left);}
,getHeight:function(p){var o=p.getBoundingClientRect();return Math.round(o.bottom)-Math.round(o.top);}
,__hiddenScrollbars:{visible:true,hidden:true},getContentWidth:function(t){var q=qx.bom.element.Style;var r=qx.bom.element.Style.get(t,k);var s=parseInt(q.get(t,g)||d,10);var w=parseInt(q.get(t,e)||d,10);if(this.__hiddenScrollbars[r]){var v=t.clientWidth;if((qx.core.Environment.get(b)==h)||qx.dom.Node.isBlockNode(t)){v=v-s-w;}
;return v;}
else {if(t.clientWidth>=t.scrollWidth){return Math.max(t.clientWidth,t.scrollWidth)-s-w;}
else {var u=t.scrollWidth-s;if(qx.core.Environment.get(b)==a&&qx.core.Environment.get(f)>=6){u-=w;}
;return u;}
;}
;}
,getContentHeight:function(C){var x=qx.bom.element.Style;var z=qx.bom.element.Style.get(C,l);var A=parseInt(x.get(C,j)||d,10);var y=parseInt(x.get(C,i)||d,10);if(this.__hiddenScrollbars[z]){return C.clientHeight-A-y;}
else {if(C.clientHeight>=C.scrollHeight){return Math.max(C.clientHeight,C.scrollHeight)-A-y;}
else {var B=C.scrollHeight-A;if(qx.core.Environment.get(b)==a&&qx.core.Environment.get(f)==6){B-=y;}
;return B;}
;}
;}
}});}
)();
(function(){var a="borderBottomWidth",b="scroll",c="qx.bom.element.Location",d="engine.version",e="paddingLeft",f="borderRightWidth",g="auto",h="static",i="borderTopWidth",j="borderLeftWidth",k="marginBottom",l="marginTop",m="overflowY",n="marginLeft",o="border-box",p="padding",q="paddingBottom",r="paddingTop",s="gecko",t="marginRight",u="browser.quirksmode",v="mshtml",w="engine.name",x="position",y="margin",z="paddingRight",A="BODY",B="overflowX",C="border",D="browser.documentmode";qx.Bootstrap.define(c,{statics:{__num:function(F,E){return parseInt(qx.bom.element.Style.get(F,E,qx.bom.element.Style.COMPUTED_MODE,false),10)||0;}
,__computeScroll:function(H){var I=0,top=0;var G=qx.dom.Node.getWindow(H);I-=qx.bom.Viewport.getScrollLeft(G);top-=qx.bom.Viewport.getScrollTop(G);return {left:I,top:top};}
,__computeBody:qx.core.Environment.select(w,{"mshtml":function(L){var K=qx.dom.Node.getDocument(L);var J=K.body;var M=0;var top=0;M-=J.clientLeft+K.documentElement.clientLeft;top-=J.clientTop+K.documentElement.clientTop;if(!qx.core.Environment.get(u)){M+=this.__num(J,j);top+=this.__num(J,i);}
;return {left:M,top:top};}
,"webkit":function(P){var O=qx.dom.Node.getDocument(P);var N=O.body;var Q=N.offsetLeft;var top=N.offsetTop;if(parseFloat(qx.core.Environment.get(d))<530.17){Q+=this.__num(N,j);top+=this.__num(N,i);}
;return {left:Q,top:top};}
,"gecko":function(S){var R=qx.dom.Node.getDocument(S).body;var T=R.offsetLeft;var top=R.offsetTop;if(parseFloat(qx.core.Environment.get(d))<1.9){T+=this.__num(R,n);top+=this.__num(R,l);}
;if(qx.bom.element.BoxSizing.get(R)!==o){T+=this.__num(R,j);top+=this.__num(R,i);}
;return {left:T,top:top};}
,"default":function(V){var U=qx.dom.Node.getDocument(V).body;var W=U.offsetLeft;var top=U.offsetTop;return {left:W,top:top};}
}),__computeOffset:function(X){var Y=X.getBoundingClientRect();return {left:Math.round(Y.left),top:Math.round(Y.top)};}
,get:function(be,bf){if(be.tagName==A){var location=this.__getBodyLocation(be);var bi=location.left;var top=location.top;}
else {var ba=this.__computeBody(be);var bd=this.__computeOffset(be);var scroll=this.__computeScroll(be);var bi=bd.left+ba.left-scroll.left;var top=bd.top+ba.top-scroll.top;}
;var bb=bi+be.offsetWidth;var bc=top+be.offsetHeight;if(bf){if(bf==p||bf==b){var bh=qx.bom.element.Style.get(be,B);if(bh==b||bh==g){bb+=be.scrollWidth-be.offsetWidth+this.__num(be,j)+this.__num(be,f);}
;var bg=qx.bom.element.Style.get(be,m);if(bg==b||bg==g){bc+=be.scrollHeight-be.offsetHeight+this.__num(be,i)+this.__num(be,a);}
;}
;switch(bf){case p:bi+=this.__num(be,e);top+=this.__num(be,r);bb-=this.__num(be,z);bc-=this.__num(be,q);case b:bi-=be.scrollLeft;top-=be.scrollTop;bb-=be.scrollLeft;bc-=be.scrollTop;case C:bi+=this.__num(be,j);top+=this.__num(be,i);bb-=this.__num(be,f);bc-=this.__num(be,a);break;case y:bi-=this.__num(be,n);top-=this.__num(be,l);bb+=this.__num(be,t);bc+=this.__num(be,k);break;};}
;return {left:bi,top:top,right:bb,bottom:bc};}
,__getBodyLocation:function(bj){var top=bj.offsetTop;var bk=bj.offsetLeft;if(qx.core.Environment.get(w)!==v||!((parseFloat(qx.core.Environment.get(d))<8||qx.core.Environment.get(D)<8)&&!qx.core.Environment.get(u))){top+=this.__num(bj,l);bk+=this.__num(bj,n);}
;if(qx.core.Environment.get(w)===s){top+=this.__num(bj,j);bk+=this.__num(bj,i);}
;return {left:bk,top:top};}
,getRelative:function(bo,bn,bm,bl){var bq=this.get(bo,bm);var bp=this.get(bn,bl);return {left:bq.left-bp.left,top:bq.top-bp.top,right:bq.right-bp.right,bottom:bq.bottom-bp.bottom};}
,getPosition:function(br){return this.getRelative(br,this.getOffsetParent(br));}
,getOffsetParent:function(bu){var bt=bu.offsetParent||document.body;var bs=qx.bom.element.Style;while(bt&&(!/^body|html$/i.test(bt.tagName)&&bs.get(bt,x)===h)){bt=bt.offsetParent;}
;return bt;}
}});}
)();
(function(){var a="stylesheet",b="head",c="html.stylesheet.addimport",d="html.stylesheet.insertrule",e="}",f="html.stylesheet.createstylesheet",g='@import "',h="text/css",j="{",k='";',l="html.stylesheet.removeimport",m="html.stylesheet.deleterule",n="qx.bom.Stylesheet",o="link",p="style";qx.Bootstrap.define(n,{statics:{includeFile:function(s,q){if(!q){q=document;}
;var t=q.createElement(o);t.type=h;t.rel=a;t.href=s;var r=q.getElementsByTagName(b)[0];r.appendChild(t);}
,createElement:function(u){if(qx.core.Environment.get(f)){var v=document.createStyleSheet();if(u){v.cssText=u;}
;return v;}
else {var w=document.createElement(p);w.type=h;if(u){w.appendChild(document.createTextNode(u));}
;document.getElementsByTagName(b)[0].appendChild(w);return w.sheet;}
;}
,addRule:function(y,z,x){if(qx.core.Environment.get(d)){y.insertRule(z+j+x+e,y.cssRules.length);}
else {y.addRule(z,x);}
;}
,removeRule:function(B,D){if(qx.core.Environment.get(m)){var A=B.cssRules;var C=A.length;for(var i=C-1;i>=0;--i){if(A[i].selectorText==D){B.deleteRule(i);}
;}
;}
else {var A=B.rules;var C=A.length;for(var i=C-1;i>=0;--i){if(A[i].selectorText==D){B.removeRule(i);}
;}
;}
;}
,removeSheet:function(F){var E=F.ownerNode?F.ownerNode:F.owningElement;qx.dom.Element.removeChild(E,E.parentNode);}
,removeAllRules:function(H){if(qx.core.Environment.get(m)){var G=H.cssRules;var I=G.length;for(var i=I-1;i>=0;i--){H.deleteRule(i);}
;}
else {var G=H.rules;var I=G.length;for(var i=I-1;i>=0;i--){H.removeRule(i);}
;}
;}
,addImport:function(K,J){if(qx.core.Environment.get(c)){K.addImport(J);}
else {K.insertRule(g+J+k,K.cssRules.length);}
;}
,removeImport:function(L,M){if(qx.core.Environment.get(l)){var N=L.imports;var O=N.length;for(var i=O-1;i>=0;i--){if(N[i].href==M||N[i].href==qx.util.Uri.getAbsolute(M)){L.removeImport(i);}
;}
;}
else {var P=L.cssRules;var O=P.length;for(var i=O-1;i>=0;i--){if(P[i].href==M){L.deleteRule(i);}
;}
;}
;}
,removeAllImports:function(R){if(qx.core.Environment.get(l)){var T=R.imports;var S=T.length;for(var i=S-1;i>=0;i--){R.removeImport(i);}
;}
else {var Q=R.cssRules;var S=Q.length;for(var i=S-1;i>=0;i--){if(Q[i].type==Q[i].IMPORT_RULE){R.deleteRule(i);}
;}
;}
;}
}});}
)();
(function(){var a="qx.bom.client.Stylesheet",b="html.stylesheet.deleterule",c="html.stylesheet.insertrule",d="function",e="html.stylesheet.createstylesheet",f="html.stylesheet.addimport",g="html.stylesheet.removeimport",h="object";qx.Bootstrap.define(a,{statics:{__getStylesheet:function(){if(!qx.bom.client.Stylesheet.__stylesheet){qx.bom.client.Stylesheet.__stylesheet=qx.bom.Stylesheet.createElement();}
;return qx.bom.client.Stylesheet.__stylesheet;}
,getCreateStyleSheet:function(){return typeof document.createStyleSheet===h;}
,getInsertRule:function(){return typeof qx.bom.client.Stylesheet.__getStylesheet().insertRule===d;}
,getDeleteRule:function(){return typeof qx.bom.client.Stylesheet.__getStylesheet().deleteRule===d;}
,getAddImport:function(){return (typeof qx.bom.client.Stylesheet.__getStylesheet().addImport===h);}
,getRemoveImport:function(){return (typeof qx.bom.client.Stylesheet.__getStylesheet().removeImport===h);}
},defer:function(i){qx.core.Environment.add(e,i.getCreateStyleSheet);qx.core.Environment.add(c,i.getInsertRule);qx.core.Environment.add(b,i.getDeleteRule);qx.core.Environment.add(f,i.getAddImport);qx.core.Environment.add(g,i.getRemoveImport);}
});}
)();
(function(){var a="engine.name",b="='",c="<",d="",f="none",g="<INPUT TYPE='RADIO' NAME='RADIOTEST' VALUE='Second Choice'>",h="qx.dom.Element",j="webkit",k="The tag name is missing!",m=" ",n="div",o=">",p="' ",q="></";qx.Bootstrap.define(h,{statics:{__initialAttributes:{"onload":true,"onpropertychange":true,"oninput":true,"onchange":true,"name":true,"type":true,"checked":true,"disabled":true},hasChild:function(parent,r){return r.parentNode===parent;}
,hasChildren:function(s){return !!s.firstChild;}
,hasChildElements:function(t){t=t.firstChild;while(t){if(t.nodeType===1){return true;}
;t=t.nextSibling;}
;return false;}
,getParentElement:function(u){return u.parentNode;}
,isInDom:function(x,v){if(!v){v=window;}
;var w=v.document.getElementsByTagName(x.nodeName);for(var i=0,l=w.length;i<l;i++){if(w[i]===x){return true;}
;}
;return false;}
,insertAt:function(y,parent,z){var A=parent.childNodes[z];if(A){parent.insertBefore(y,A);}
else {parent.appendChild(y);}
;return true;}
,insertBegin:function(B,parent){if(parent.firstChild){this.insertBefore(B,parent.firstChild);}
else {parent.appendChild(B);}
;return true;}
,insertEnd:function(C,parent){parent.appendChild(C);return true;}
,insertBefore:function(D,E){E.parentNode.insertBefore(D,E);return true;}
,insertAfter:function(F,G){var parent=G.parentNode;if(G==parent.lastChild){parent.appendChild(F);}
else {return this.insertBefore(F,G.nextSibling);}
;return true;}
,remove:function(H){if(!H.parentNode){return false;}
;H.parentNode.removeChild(H);return true;}
,removeChild:function(I,parent){if(I.parentNode!==parent){return false;}
;parent.removeChild(I);return true;}
,removeChildAt:function(J,parent){var K=parent.childNodes[J];if(!K){return false;}
;parent.removeChild(K);return true;}
,replaceChild:function(M,L){if(!L.parentNode){return false;}
;L.parentNode.replaceChild(M,L);return true;}
,replaceAt:function(O,P,parent){var N=parent.childNodes[P];if(!N){return false;}
;parent.replaceChild(O,N);return true;}
,__helperElement:{},__allowMarkup:{},_allowCreationWithMarkup:function(Q){if(!Q){Q=window;}
;var R=Q.location.href;if(qx.dom.Element.__allowMarkup[R]==undefined){try{Q.document.createElement(g);qx.dom.Element.__allowMarkup[R]=true;}
catch(e){qx.dom.Element.__allowMarkup[R]=false;}
;}
;return qx.dom.Element.__allowMarkup[R];}
,getHelperElement:function(S){if(!S){S=window;}
;var T=S.location.href;if(!qx.dom.Element.__helperElement[T]){var U=qx.dom.Element.__helperElement[T]=S.document.createElement(n);if(qx.core.Environment.get(a)==j){U.style.display=f;S.document.body.appendChild(U);}
;}
;return qx.dom.Element.__helperElement[T];}
,create:function(name,bc,W){if(!W){W=window;}
;if(!name){throw new Error(k);}
;var Y=this.__initialAttributes;var X=d;for(var bb in bc){if(Y[bb]){X+=bb+b+bc[bb]+p;}
;}
;var ba;if(X!=d){if(qx.dom.Element._allowCreationWithMarkup(W)){ba=W.document.createElement(c+name+m+X+o);}
else {var V=qx.dom.Element.getHelperElement(W);V.innerHTML=c+name+m+X+q+name+o;ba=V.firstChild;}
;}
else {ba=W.document.createElement(name);}
;for(var bb in bc){if(!Y[bb]){qx.bom.element.Attribute.set(ba,bb,bc[bb]);}
;}
;return ba;}
,empty:function(bd){return bd.innerHTML=d;}
}});}
)();
(function(){var a="readOnly",b="accessKey",c="qx.bom.element.Attribute",d="rowSpan",e="vAlign",f="className",g="textContent",h="htmlFor",i="longDesc",j="cellSpacing",k="frameBorder",l="",m="useMap",n="innerText",o="innerHTML",p="tabIndex",q="dateTime",r="maxLength",s="html.element.textcontent",t="mshtml",u="engine.name",v="cellPadding",w="browser.documentmode",x="colSpan",y="undefined";qx.Bootstrap.define(c,{statics:{__hints:{names:{"class":f,"for":h,html:o,text:qx.core.Environment.get(s)?g:n,colspan:x,rowspan:d,valign:e,datetime:q,accesskey:b,tabindex:p,maxlength:r,readonly:a,longdesc:i,cellpadding:v,cellspacing:j,frameborder:k,usemap:m},runtime:{"html":1,"text":1},bools:{compact:1,nowrap:1,ismap:1,declare:1,noshade:1,checked:1,disabled:1,readOnly:1,multiple:1,selected:1,noresize:1,defer:1,allowTransparency:1},property:{$$html:1,$$widget:1,disabled:1,checked:1,readOnly:1,multiple:1,selected:1,value:1,maxLength:1,className:1,innerHTML:1,innerText:1,textContent:1,htmlFor:1,tabIndex:1},qxProperties:{$$widget:1,$$html:1},propertyDefault:{disabled:false,checked:false,readOnly:false,multiple:false,selected:false,value:l,className:l,innerHTML:l,innerText:l,textContent:l,htmlFor:l,tabIndex:0,maxLength:qx.core.Environment.select(u,{"mshtml":2147483647,"webkit":524288,"default":-1})},removeableProperties:{disabled:1,multiple:1,maxLength:1},original:{href:1,src:1,type:1}},get:function(B,name){var z=this.__hints;var A;name=z.names[name]||name;if(qx.core.Environment.get(u)==t&&parseInt(qx.core.Environment.get(w),10)<8&&z.original[name]){A=B.getAttribute(name,2);}
else if(z.property[name]){A=B[name];if(typeof z.propertyDefault[name]!==y&&A==z.propertyDefault[name]){if(typeof z.bools[name]===y){return null;}
else {return A;}
;}
;}
else {A=B.getAttribute(name);}
;if(z.bools[name]){return !!A;}
;return A;}
,set:function(E,name,D){if(typeof D===y){return;}
;var C=this.__hints;name=C.names[name]||name;if(C.bools[name]){D=!!D;}
;if(C.property[name]&&(!(E[name]===undefined)||C.qxProperties[name])){if(D==null){if(C.removeableProperties[name]){E.removeAttribute(name);return;}
else if(typeof C.propertyDefault[name]!==y){D=C.propertyDefault[name];}
;}
;E[name]=D;}
else {if(D===true){E.setAttribute(name,name);}
else if(D===false||D===null){E.removeAttribute(name);}
else {E.setAttribute(name,D);}
;}
;}
}});}
)();
(function(){var a="qx.dom.Hierarchy",b="previousSibling",c="nextSibling",d="html.element.contains",e="html.element.compareDocumentPosition";qx.Bootstrap.define(a,{statics:{getNextElementSibling:function(f){while(f&&(f=f.nextSibling)&&!qx.dom.Node.isElement(f)){continue;}
;return f||null;}
,getPreviousElementSibling:function(g){while(g&&(g=g.previousSibling)&&!qx.dom.Node.isElement(g)){continue;}
;return g||null;}
,isRendered:function(i){var h=i.ownerDocument||i.document;if(qx.core.Environment.get(d)){if(!i.parentNode||!i.offsetParent){return false;}
;return h.body.contains(i);}
else if(qx.core.Environment.get(e)){return !!(h.compareDocumentPosition(i)&16);}
else {while(i){if(i==h.body){return true;}
;i=i.parentNode;}
;return false;}
;}
,getChildElements:function(k){k=k.firstChild;if(!k){return [];}
;var j=this.getNextSiblings(k);if(k.nodeType===1){j.unshift(k);}
;return j;}
,getPreviousSiblings:function(l){return this._recursivelyCollect(l,b);}
,getNextSiblings:function(m){return this._recursivelyCollect(m,c);}
,_recursivelyCollect:function(p,n){var o=[];while(p=p[n]){if(p.nodeType==1){o.push(p);}
;}
;return o;}
,getSiblings:function(q){return this.getPreviousSiblings(q).reverse().concat(this.getNextSiblings(q));}
}});}
)();
(function(){var a="getPreviousSiblings",b="getSiblings",c="qx.module.Traversing",d="getNextSiblings";qx.Bootstrap.define(c,{statics:{add:function(e){this.push(e);return this;}
,getChildren:function(h){var g=[];for(var i=0;i<this.length;i++){var f=qx.dom.Hierarchy.getChildElements(this[i]);if(h){f=qx.bom.Selector.matches(h,f);}
;g=g.concat(f);}
;return qxWeb.$init(g);}
,forEach:function(k,j){for(var i=0;i<this.length;i++){k.call(j,this[i],i,this);}
;return this;}
,getParents:function(o){var n=[];for(var i=0;i<this.length;i++){var m=qx.dom.Element.getParentElement(this[i]);if(o){m=qx.bom.Selector.matches(o,[m]);}
;n=n.concat(m);}
;return qxWeb.$init(n);}
,getAncestors:function(p){return this.__getAncestors(null,p);}
,getAncestorsUntil:function(r,q){return this.__getAncestors(r,q);}
,__getAncestors:function(t,u){var s=[];for(var i=0;i<this.length;i++){var parent=qx.dom.Element.getParentElement(this[i]);while(parent){var v=[parent];if(t&&qx.bom.Selector.matches(t,v).length>0){break;}
;if(u){v=qx.bom.Selector.matches(u,v);}
;s=s.concat(v);parent=qx.dom.Element.getParentElement(parent);}
;}
;return qxWeb.$init(s);}
,getClosest:function(y){var x=[];var w=function A(z){var B=qx.bom.Selector.matches(y,z);if(B.length){x.push(B[0]);}
else {z=z.getParents();if(z[0]&&z[0].parentNode){A(z);}
;}
;}
;for(var i=0;i<this.length;i++){w(qxWeb(this[i]));}
;return qxWeb.$init(x);}
,find:function(D){var C=[];for(var i=0;i<this.length;i++){C=C.concat(qx.bom.Selector.query(D,this[i]));}
;return qxWeb.$init(C);}
,getContents:function(){var E=[];for(var i=0;i<this.length;i++){E=E.concat(qx.lang.Array.fromCollection(this[i].childNodes));}
;return qxWeb.$init(E);}
,is:function(F){if(qx.lang.Type.isFunction(F)){return this.filter(F).length>0;}
;return !!F&&qx.bom.Selector.matches(F,this).length>0;}
,eq:function(G){return this.slice(G,+G+1);}
,getFirst:function(){return this.slice(0,1);}
,getLast:function(){return this.slice(this.length-1);}
,has:function(I){var H=[];for(var i=0;i<this.length;i++){var J=qx.bom.Selector.matches(I,this.eq(i).getContents());if(J.length>0){H.push(this[i]);}
;}
;return qxWeb.$init(H);}
,getNext:function(L){var K=this.map(qx.dom.Hierarchy.getNextElementSibling,qx.dom.Hierarchy);if(L){K=qx.bom.Selector.matches(L,K);}
;return K;}
,getNextAll:function(N){var M=qx.module.Traversing.__hierarchyHelper(this,d,N);return qxWeb.$init(M);}
,getNextUntil:function(P){var O=[];this.forEach(function(S,Q){var R=qx.dom.Hierarchy.getNextSiblings(S);for(var i=0,l=R.length;i<l;i++){if(qx.bom.Selector.matches(P,[R[i]]).length>0){break;}
;O.push(R[i]);}
;}
);return qxWeb.$init(O);}
,getPrev:function(U){var T=this.map(qx.dom.Hierarchy.getPreviousElementSibling,qx.dom.Hierarchy);if(U){T=qx.bom.Selector.matches(U,T);}
;return T;}
,getPrevAll:function(W){var V=qx.module.Traversing.__hierarchyHelper(this,a,W);return qxWeb.$init(V);}
,getPrevUntil:function(Y){var X=[];this.forEach(function(bc,ba){var bb=qx.dom.Hierarchy.getPreviousSiblings(bc);for(var i=0,l=bb.length;i<l;i++){if(qx.bom.Selector.matches(Y,[bb[i]]).length>0){break;}
;X.push(bb[i]);}
;}
);return qxWeb.$init(X);}
,getSiblings:function(be){var bd=qx.module.Traversing.__hierarchyHelper(this,b,be);return qxWeb.$init(bd);}
,not:function(bg){if(qx.lang.Type.isFunction(bg)){return this.filter(function(bh,bj,bi){return !bg(bh,bj,bi);}
);}
;var bf=qx.bom.Selector.matches(bg,this);return this.filter(function(bk){return bf.indexOf(bk)===-1;}
);}
,getOffsetParent:function(){return this.map(qx.bom.element.Location.getOffsetParent);}
,isRendered:function(){if(!this[0]){return false;}
;return qx.dom.Hierarchy.isRendered(this[0]);}
,isElement:function(bl){return qx.dom.Node.isElement(bl);}
,isNode:function(bm){return qx.dom.Node.isNode(bm);}
,isNodeName:function(bn,bo){return qx.dom.Node.isNodeName(bn,bo);}
,isDocument:function(bp){return qx.dom.Node.isDocument(bp);}
,getWindow:function(bq){return qx.dom.Node.getWindow(bq);}
,isTextNode:function(br){return qx.dom.Node.isText(br);}
,isWindow:function(bs){return qx.dom.Node.isWindow(bs);}
,getDocument:function(bt){return qx.dom.Node.getDocument(bt);}
,getNodeName:function(bu){return qx.dom.Node.getName(bu);}
,getNodeText:function(bv){return qx.dom.Node.getText(bv);}
,isBlockNode:function(bw){return qx.dom.Node.isBlockNode(bw);}
,__hierarchyHelper:function(bz,bC,bA){var bx=[];var by=qx.dom.Hierarchy;for(var i=0,l=bz.length;i<l;i++){bx.push.apply(bx,by[bC](bz[i]));}
;var bB=qx.lang.Array.unique(bx);if(bA){bB=qx.bom.Selector.matches(bA,bB);}
;return bB;}
},defer:function(bD){qxWeb.$attach({"add":bD.add,"getChildren":bD.getChildren,"forEach":bD.forEach,"getParents":bD.getParents,"getAncestors":bD.getAncestors,"getAncestorsUntil":bD.getAncestorsUntil,"__getAncestors":bD.__getAncestors,"getClosest":bD.getClosest,"find":bD.find,"getContents":bD.getContents,"is":bD.is,"eq":bD.eq,"getFirst":bD.getFirst,"getLast":bD.getLast,"has":bD.has,"getNext":bD.getNext,"getNextAll":bD.getNextAll,"getNextUntil":bD.getNextUntil,"getPrev":bD.getPrev,"getPrevAll":bD.getPrevAll,"getPrevUntil":bD.getPrevUntil,"getSiblings":bD.getSiblings,"not":bD.not,"getOffsetParent":bD.getOffsetParent,"isRendered":bD.isRendered});qxWeb.$attachStatic({"isElement":bD.isElement,"isNode":bD.isNode,"isNodeName":bD.isNodeName,"isDocument":bD.isDocument,"getDocument":bD.getDocument,"getWindow":bD.getWindow,"isWindow":bD.isWindow,"isBlockNode":bD.isBlockNode,"getNodeName":bD.getNodeName,"getNodeText":bD.getNodeText,"isTextNode":bD.isTextNode});}
});}
)();
(function(){var a="event.pointer",b="mshtml",c="onhashchange",d="event.help",e="event.mspointer",f="msPointerEnabled",g="event.touch",h="opera",i="event.hashchange",j="onhelp",k="pointerEvents",l="documentMode",m="qx.bom.client.Event",n="ontouchstart";qx.Bootstrap.define(m,{statics:{getTouch:function(){return (n in window);}
,getPointer:function(){if(k in document.documentElement.style){var o=qx.bom.client.Engine.getName();return o!=h&&o!=b;}
;return false;}
,getMsPointer:function(){if(f in window.navigator){return window.navigator.msPointerEnabled;}
;return false;}
,getHelp:function(){return (j in document);}
,getHashChange:function(){var p=qx.bom.client.Engine.getName();var q=c in window;return (p!==b&&q)||(p===b&&l in document&&document.documentMode>=8&&q);}
},defer:function(r){qx.core.Environment.add(g,r.getTouch);qx.core.Environment.add(a,r.getPointer);qx.core.Environment.add(e,r.getMsPointer);qx.core.Environment.add(d,r.getHelp);qx.core.Environment.add(i,r.getHashChange);}
});}
)();
(function(){var a="ipod",b="tablet",c="g",d="xbox",e="pc",f="\.",g="ps3",h="mobile",i="(",j=")",k="iPhone",l="psp",m="|",n="qx.bom.client.Device",o="wii",p="desktop",q="ipad",r="device.name",s="ds",t="device.type";qx.Bootstrap.define(n,{statics:{__ids:{"iPod":a,"iPad":q,"iPhone":k,"PSP":l,"PLAYSTATION 3":g,"Nintendo Wii":o,"Nintendo DS":s,"XBOX":d,"Xbox":d},getName:function(){var w=[];for(var v in this.__ids){w.push(v);}
;var x=new RegExp(i+w.join(m).replace(/\./g,f)+j,c);var u=x.exec(navigator.userAgent);if(u&&u[1]){return qx.bom.client.Device.__ids[u[1]];}
;return e;}
,getType:function(){return qx.bom.client.Device.detectDeviceType(navigator.userAgent);}
,detectDeviceType:function(y){if(qx.bom.client.Device.detectTabletDevice(y)){return b;}
else if(qx.bom.client.Device.detectMobileDevice(y)){return h;}
;return p;}
,detectMobileDevice:function(z){return /android.+mobile|ip(hone|od)|bada\/|blackberry|maemo|opera m(ob|in)i|fennec|NetFront|phone|psp|symbian|IEMobile|windows (ce|phone)|xda/i.test(z);}
,detectTabletDevice:function(B){var C=(/MSIE 10/i.test(B))&&(/ARM/i.test(B))&&!(/windows phone/i.test(B));var A=(!(/Fennec|HTC.Magic|Nexus|android.+mobile|Tablet PC/i.test(B))&&(/Android|ipad|tablet|playbook|silk|kindle|psp/i.test(B)));return C||A;}
},defer:function(D){qx.core.Environment.add(r,D.getName);qx.core.Environment.add(t,D.getType);}
});}
)();
(function(){var a="engine.name",b="event.mspointer",c="device.type",d="engine.version",e="qx.module.Environment",f="browser.version",g="event.touch",h="browser.quirksmode",i="browser.name",j="browser.documentmode";qx.Bootstrap.define(e,{statics:{get:function(k){return qx.core.Environment.get(k);}
,add:function(l,m){qx.core.Environment.add(l,m);return this;}
},defer:function(n){qx.core.Environment.get(i);qx.core.Environment.get(f);qx.core.Environment.get(h);qx.core.Environment.get(j);qx.core.Environment.get(a);qx.core.Environment.get(d);qx.core.Environment.get(c);qx.core.Environment.get(g);qx.core.Environment.get(b);qxWeb.$attachStatic({"env":{get:n.get,add:n.add}});}
});}
)();
(function(){var a="qx.module.Attribute",b="html";qx.Bootstrap.define(a,{statics:{getHtml:function(){if(this[0]){return qx.bom.element.Attribute.get(this[0],b);}
;return null;}
,setHtml:function(c){for(var i=0;i<this.length;i++){qx.bom.element.Attribute.set(this[i],b,c);}
;return this;}
,setAttribute:function(name,d){for(var i=0;i<this.length;i++){qx.bom.element.Attribute.set(this[i],name,d);}
;return this;}
,getAttribute:function(name){if(this[0]){return qx.bom.element.Attribute.get(this[0],name);}
;return null;}
,removeAttribute:function(name){for(var i=0;i<this.length;i++){qx.bom.element.Attribute.set(this[i],name,null);}
;return this;}
,setAttributes:function(e){for(var name in e){this.setAttribute(name,e[name]);}
;return this;}
,getAttributes:function(g){var f={};for(var i=0;i<g.length;i++){f[g[i]]=this.getAttribute(g[i]);}
;return f;}
,removeAttributes:function(h){for(var i=0,l=h.length;i<l;i++){this.removeAttribute(h[i]);}
;return this;}
,setProperty:function(name,j){for(var i=0;i<this.length;i++){this[i][name]=j;}
;return this;}
,getProperty:function(name){if(this[0]){return this[0][name];}
;return null;}
,setProperties:function(k){for(var name in k){this.setProperty(name,k[name]);}
;return this;}
,getProperties:function(m){var n={};for(var i=0;i<m.length;i++){n[m[i]]=this.getProperty(m[i]);}
;return n;}
,getValue:function(){if(this[0]){return qx.bom.Input.getValue(this[0]);}
;return null;}
,setValue:function(o){for(var i=0,l=this.length;i<l;i++){qx.bom.Input.setValue(this[i],o);}
;return this;}
},defer:function(p){qxWeb.$attach({"getHtml":p.getHtml,"setHtml":p.setHtml,"getAttribute":p.getAttribute,"setAttribute":p.setAttribute,"removeAttribute":p.removeAttribute,"getAttributes":p.getAttributes,"setAttributes":p.setAttributes,"removeAttributes":p.removeAttributes,"getProperty":p.getProperty,"setProperty":p.setProperty,"getProperties":p.getProperties,"setProperties":p.setProperties,"getValue":p.getValue,"setValue":p.setValue});}
});}
)();
(function(){var a="text",b="engine.name",c="",d="mshtml",e="number",f="checkbox",g="select-one",h="option",j="value",k="select",m="radio",n="qx.bom.Input",o="textarea";qx.Bootstrap.define(n,{statics:{setValue:function(u,t){var v=u.nodeName.toLowerCase();var q=u.type;var Array=qx.lang.Array;var w=qx.lang.Type;if(typeof t===e){t+=c;}
;if((q===f||q===m)){if(w.isArray(t)){u.checked=Array.contains(t,u.value);}
else {u.checked=u.value==t;}
;}
else if(v===k){var p=w.isArray(t);var x=u.options;var r,s;for(var i=0,l=x.length;i<l;i++){r=x[i];s=r.getAttribute(j);if(s==null){s=r.text;}
;r.selected=p?Array.contains(t,s):t==s;}
;if(p&&t.length==0){u.selectedIndex=-1;}
;}
else if((q===a||q===o)&&(qx.core.Environment.get(b)==d)){u.$$inValueSet=true;u.value=t;u.$$inValueSet=null;}
else {u.value=t;}
;}
,getValue:function(F){var D=F.nodeName.toLowerCase();if(D===h){return (F.attributes.value||{}).specified?F.value:F.text;}
;if(D===k){var y=F.selectedIndex;if(y<0){return null;}
;var E=[];var H=F.options;var C=F.type==g;var G=qx.bom.Input;var B;for(var i=C?y:0,A=C?y+1:H.length;i<A;i++){var z=H[i];if(z.selected){B=G.getValue(z);if(C){return B;}
;E.push(B);}
;}
;return E;}
else {return (F.value||c).replace(/\r/g,c);}
;}
}});}
)();
(function(){var a="qx.lang.normalize.Function",b="ecmascript.function.bind",c="function",d="Function.prototype.bind called on incompatible ";qx.Bootstrap.define(a,{defer:function(){if(!qx.core.Environment.get(b)){var e=Array.prototype.slice;Function.prototype.bind=function(i){var h=this;if(typeof h!=c){throw new TypeError(d+h);}
;var f=e.call(arguments,1);var g=function(){if(this instanceof g){var F=function(){}
;F.prototype=h.prototype;var self=new F;var j=h.apply(self,f.concat(e.call(arguments)));if(Object(j)===j){return j;}
;return self;}
else {return h.apply(i,f.concat(e.call(arguments)));}
;}
;return g;}
;}
;}
});}
)();
(function(){var a="",b="qx.lang.normalize.Error",c=": ",d="Error",e="ecmascript.error.toString";qx.Bootstrap.define(b,{defer:function(){if(!qx.core.Environment.get(e)){Error.prototype.toString=function(){var name=this.name||d;var f=this.message||a;if(name===a&&f===a){return d;}
;if(name===a){return f;}
;if(f===a){return name;}
;return name+c+f;}
;}
;}
});}
)();
(function(){var a="qx.module.Polyfill";qx.Bootstrap.define(a,{});}
)();
(function(){var a="mshtml",b="engine.name",c="*",d="load",e="left",f="qx.module.Event",g="undefined",h="DOMContentLoaded",n="browser.documentmode",o="complete";qx.Bootstrap.define(f,{statics:{__normalizations:{},__hooks:{on:{},off:{}},on:function(w,t,u){for(var i=0;i<this.length;i++){var p=this[i];var q=u||qxWeb(p);var v=qx.module.Event.__hooks.on;var s=v[c]||[];if(v[w]){s=s.concat(v[w]);}
;for(var j=0,m=s.length;j<m;j++){s[j](p,w,t,u);}
;var r=function(event){var B=qx.module.Event.__normalizations;var A=B[c]||[];if(B[w]){A=A.concat(B[w]);}
;for(var x=0,y=A.length;x<y;x++){event=A[x](event,p,w);}
;t.apply(this,[event]);}
.bind(q);r.original=t;if(qx.bom.Event.supportsEvent(p,w)){qx.bom.Event.addNativeListener(p,w,r);}
;if(!p.__emitter){p.__emitter=new qx.event.Emitter();}
;var z=p.__emitter.on(w,r,q);if(!p.__listener){p.__listener={};}
;if(!p.__listener[w]){p.__listener[w]={};}
;p.__listener[w][z]=r;if(!u){if(!p.__ctx){p.__ctx={};}
;p.__ctx[z]=q;}
;}
;return this;}
,off:function(L,D,I){var H=(D===null&&I===null);for(var j=0;j<this.length;j++){var C=this[j];if(!C.__listener){continue;}
;var N=[];if(L!==null){N.push(L);}
else {for(var F in C.__listener){N.push(F);}
;}
;for(var i=0,l=N.length;i<l;i++){for(var G in C.__listener[N[i]]){var K=C.__listener[N[i]][G];if(H||K==D||K.original==D){var E=typeof C.__ctx!==g&&C.__ctx[G];var O;if(!I&&E){O=C.__ctx[G];}
;C.__emitter.off(N[i],K,O||I);if(H||K.original==D){qx.bom.Event.removeNativeListener(C,N[i],K);}
;delete C.__listener[N[i]][G];if(E){delete C.__ctx[G];}
;}
;}
;var J=qx.module.Event.__hooks.off;var M=J[c]||[];if(J[L]){M=M.concat(J[L]);}
;for(var k=0,m=M.length;k<m;k++){M[k](C,L,D,I);}
;}
;}
;return this;}
,allOff:function(P){return this.off(P||null,null,null);}
,emit:function(Q,R){for(var j=0;j<this.length;j++){var S=this[j];if(S.__emitter){S.__emitter.emit(Q,R);}
;}
;return this;}
,once:function(U,T,W){var self=this;var V=function(X){self.off(U,V,W);T.call(this,X);}
;this.on(U,V,W);return this;}
,hasListener:function(Y){if(!this[0]||!this[0].__emitter||!this[0].__emitter.getListeners()[Y]){return false;}
;return this[0].__emitter.getListeners()[Y].length>0;}
,copyEventsTo:function(bf){var be=this.concat();for(var i=be.length-1;i>=0;i--){var bb=be[i].getElementsByTagName(c);for(var j=0;j<bb.length;j++){be.push(bb[j]);}
;}
;for(var i=bf.length-1;i>=0;i--){var bb=bf[i].getElementsByTagName(c);for(var j=0;j<bb.length;j++){bf.push(bb[j]);}
;}
;bf.forEach(function(bg){bg.__emitter=null;}
);for(var i=0;i<be.length;i++){var ba=be[i];if(!ba.__emitter){continue;}
;var bc=ba.__emitter.getListeners();for(var name in bc){for(var j=bc[name].length-1;j>=0;j--){var bd=bc[name][j].listener;if(bd.original){bd=bd.original;}
;qxWeb(bf[i]).on(name,bd,bc[name][j].ctx);}
;}
;}
;}
,__isReady:false,ready:function(bh){if(document.readyState===o){window.setTimeout(bh,1);return;}
;var bi=function(){qx.module.Event.__isReady=true;bh();}
;qxWeb(window).on(d,bi);var bj=function(){qxWeb(window).off(d,bi);bh();}
;if(qxWeb.env.get(b)!==a||qxWeb.env.get(n)>8){qx.bom.Event.addNativeListener(document,h,bj);}
else {var bk=function(){if(qx.module.Event.__isReady){return;}
;try{document.documentElement.doScroll(e);if(document.body){bj();}
;}
catch(bl){window.setTimeout(bk,100);}
;}
;bk();}
;}
,$registerNormalization:function(bp,bm){if(!qx.lang.Type.isArray(bp)){bp=[bp];}
;var bn=qx.module.Event.__normalizations;for(var i=0,l=bp.length;i<l;i++){var bo=bp[i];if(qx.lang.Type.isFunction(bm)){if(!bn[bo]){bn[bo]=[];}
;bn[bo].push(bm);}
;}
;}
,$unregisterNormalization:function(bt,bq){if(!qx.lang.Type.isArray(bt)){bt=[bt];}
;var br=qx.module.Event.__normalizations;for(var i=0,l=bt.length;i<l;i++){var bs=bt[i];if(br[bs]){qx.lang.Array.remove(br[bs],bq);}
;}
;}
,$getRegistry:function(){return qx.module.Event.__normalizations;}
,$registerEventHook:function(bz,bw,bv){if(!qx.lang.Type.isArray(bz)){bz=[bz];}
;var bx=qx.module.Event.__hooks.on;for(var i=0,l=bz.length;i<l;i++){var by=bz[i];if(qx.lang.Type.isFunction(bw)){if(!bx[by]){bx[by]=[];}
;bx[by].push(bw);}
;}
;if(!bv){return;}
;var bu=qx.module.Event.__hooks.off;for(var i=0,l=bz.length;i<l;i++){var by=bz[i];if(qx.lang.Type.isFunction(bv)){if(!bu[by]){bu[by]=[];}
;bu[by].push(bv);}
;}
;}
,$unregisterEventHook:function(bF,bC,bB){if(!qx.lang.Type.isArray(bF)){bF=[bF];}
;var bD=qx.module.Event.__hooks.on;for(var i=0,l=bF.length;i<l;i++){var bE=bF[i];if(bD[bE]){qx.lang.Array.remove(bD[bE],bC);}
;}
;if(!bB){return;}
;var bA=qx.module.Event.__hooks.off;for(var i=0,l=bF.length;i<l;i++){var bE=bF[i];if(bA[bE]){qx.lang.Array.remove(bA[bE],bB);}
;}
;}
,$getHookRegistry:function(){return qx.module.Event.__hooks;}
},defer:function(bG){qxWeb.$attach({"on":bG.on,"off":bG.off,"allOff":bG.allOff,"once":bG.once,"emit":bG.emit,"hasListener":bG.hasListener,"copyEventsTo":bG.copyEventsTo});qxWeb.$attachStatic({"ready":bG.ready,"$registerEventNormalization":bG.$registerNormalization,"$unregisterEventNormalization":bG.$unregisterNormalization,"$getEventNormalizationRegistry":bG.$getRegistry,"$registerEventHook":bG.$registerEventHook,"$unregisterEventHook":bG.$unregisterEventHook,"$getEventHookRegistry":bG.$getHookRegistry});}
});}
)();
(function(){var a="HTMLEvents",b="engine.name",c="qx.bom.Event",d="return;",f="function",g="mouseover",h="gecko",i="on",j="undefined";qx.Bootstrap.define(c,{statics:{addNativeListener:function(n,m,k,l){if(n.addEventListener){n.addEventListener(m,k,!!l);}
else if(n.attachEvent){n.attachEvent(i+m,k);}
else if(typeof n[i+m]!=j){n[i+m]=k;}
else {{}
;}
;}
,removeNativeListener:function(r,q,o,p){if(r.removeEventListener){r.removeEventListener(q,o,!!p);}
else if(r.detachEvent){try{r.detachEvent(i+q,o);}
catch(e){if(e.number!==-2146828218){throw e;}
;}
;}
else if(typeof r[i+q]!=j){r[i+q]=null;}
else {{}
;}
;}
,getTarget:function(e){return e.target||e.srcElement;}
,getRelatedTarget:function(e){if(e.relatedTarget!==undefined){if((qx.core.Environment.get(b)==h)){try{e.relatedTarget&&e.relatedTarget.nodeType;}
catch(s){return null;}
;}
;return e.relatedTarget;}
else if(e.fromElement!==undefined&&e.type===g){return e.fromElement;}
else if(e.toElement!==undefined){return e.toElement;}
else {return null;}
;}
,preventDefault:function(e){if(e.preventDefault){e.preventDefault();}
else {try{e.keyCode=0;}
catch(t){}
;e.returnValue=false;}
;}
,stopPropagation:function(e){if(e.stopPropagation){e.stopPropagation();}
else {e.cancelBubble=true;}
;}
,fire:function(w,u){if(document.createEvent){var v=document.createEvent(a);v.initEvent(u,true,true);return !w.dispatchEvent(v);}
else {var v=document.createEventObject();return w.fireEvent(i+u,v);}
;}
,supportsEvent:function(A,z){var x=i+z;var y=(x in A);if(!y){y=typeof A[x]==f;if(!y&&A.setAttribute){A.setAttribute(x,d);y=typeof A[x]==f;A.removeAttribute(x);}
;}
;return y;}
}});}
)();
(function(){var a="qx.event.Emitter",b="*";qx.Bootstrap.define(a,{extend:Object,statics:{__storage:[]},members:{__listener:null,__any:null,on:function(name,c,d){var e=qx.event.Emitter.__storage.length;this.__getStorage(name).push({listener:c,ctx:d,id:e});qx.event.Emitter.__storage.push({name:name,listener:c,ctx:d});return e;}
,once:function(name,f,g){var h=qx.event.Emitter.__storage.length;this.__getStorage(name).push({listener:f,ctx:g,once:true,id:h});qx.event.Emitter.__storage.push({name:name,listener:f,ctx:g});return h;}
,off:function(name,l,j){var k=this.__getStorage(name);for(var i=k.length-1;i>=0;i--){var m=k[i];if(m.listener==l&&m.ctx==j){k.splice(i,1);qx.event.Emitter.__storage[m.id]=null;return m.id;}
;}
;return null;}
,offById:function(o){var n=qx.event.Emitter.__storage[o];this.off(n.name,n.listener,n.ctx);}
,addListener:function(name,p,q){return this.on(name,p,q);}
,addListenerOnce:function(name,r,s){return this.once(name,r,s);}
,removeListener:function(name,t,u){this.off(name,t,u);}
,removeListenerById:function(v){this.offById(v);}
,emit:function(name,y){var x=this.__getStorage(name);for(var i=0;i<x.length;i++){var w=x[i];w.listener.call(w.ctx,y);if(w.once){x.splice(i,1);i--;}
;}
;x=this.__getStorage(b);for(var i=x.length-1;i>=0;i--){var w=x[i];w.listener.call(w.ctx,y);}
;}
,getListeners:function(){return this.__listener;}
,__getStorage:function(name){if(this.__listener==null){this.__listener={};}
;if(this.__listener[name]==null){this.__listener[name]=[];}
;return this.__listener[name];}
}});}
)();
(function(){var a="scrollLeft",b="qx.module.Manipulating",c="ease-in",d="",e="scrollTop";qx.Bootstrap.define(b,{statics:{create:function(f){return qxWeb.$init(qx.bom.Html.clean([f]));}
,clone:function(h){var g=[];for(var i=0;i<this.length;i++){g[i]=this[i].cloneNode(true);}
;if(h===true&&this.copyEventsTo){this.copyEventsTo(g);}
;return qxWeb(g);}
,append:function(n){var k=qx.bom.Html.clean([n]);var o=qxWeb.$init(k);for(var i=0,l=this.length;i<l;i++){for(var j=0,m=o.length;j<m;j++){if(i==0){qx.dom.Element.insertEnd(o[j],this[i]);}
else {qx.dom.Element.insertEnd(o.eq(j).clone(true)[0],this[i]);}
;}
;}
;return this;}
,appendTo:function(parent){parent=qx.module.Manipulating.__getElementArray(parent);for(var i=0,l=parent.length;i<l;i++){for(var j=0,m=this.length;j<m;j++){if(i==0){qx.dom.Element.insertEnd(this[j],parent[i]);}
else {qx.dom.Element.insertEnd(this.eq(j).clone(true)[0],parent[i]);}
;}
;}
;return this;}
,insertBefore:function(p){p=qx.module.Manipulating.__getElementArray(p);for(var i=0,l=p.length;i<l;i++){for(var j=0,m=this.length;j<m;j++){if(i==0){qx.dom.Element.insertBefore(this[j],p[i]);}
else {qx.dom.Element.insertBefore(this.eq(j).clone(true)[0],p[i]);}
;}
;}
;return this;}
,insertAfter:function(q){q=qx.module.Manipulating.__getElementArray(q);for(var i=0,l=q.length;i<l;i++){for(var j=this.length-1;j>=0;j--){if(i==0){qx.dom.Element.insertAfter(this[j],q[i]);}
else {qx.dom.Element.insertAfter(this.eq(j).clone(true)[0],q[i]);}
;}
;}
;return this;}
,__getElementArray:function(s){if(!qx.lang.Type.isArray(s)){var r=qxWeb(s);s=r.length>0?r:[s];}
;return s;}
,wrap:function(v){var v=qx.module.Manipulating.__getCollectionFromArgument(v);if(v.length==0||!qx.dom.Node.isElement(v[0])){return this;}
;for(var i=0,l=this.length;i<l;i++){var t=v.eq(0).clone(true);qx.dom.Element.insertAfter(t[0],this[i]);var u=qx.module.Manipulating.__getInnermostElement(t[0]);qx.dom.Element.insertEnd(this[i],u);}
;return this;}
,__getCollectionFromArgument:function(y){var w;if(qx.lang.Type.isArray(y)){w=qxWeb(y);}
else {var x=qx.bom.Html.clean([y]);if(x.length>0&&qx.dom.Node.isElement(x[0])){w=qxWeb(x);}
else {w=qxWeb(y);}
;}
;return w;}
,__getInnermostElement:function(z){if(z.childNodes.length==0){return z;}
;for(var i=0,l=z.childNodes.length;i<l;i++){if(z.childNodes[i].nodeType===1){return this.__getInnermostElement(z.childNodes[i]);}
;}
;return z;}
,remove:function(){for(var i=0;i<this.length;i++){qx.dom.Element.remove(this[i]);}
;return this;}
,empty:function(){for(var i=0;i<this.length;i++){this[i].innerHTML=d;}
;return this;}
,before:function(content){if(!qx.lang.Type.isArray(content)){content=[content];}
;var A=document.createDocumentFragment();qx.bom.Html.clean(content,document,A);this.forEach(function(D,B){var C=qx.lang.Array.cast(A.childNodes,Array);for(var i=0,l=C.length;i<l;i++){var E;if(B<this.length-1){E=C[i].cloneNode(true);}
else {E=C[i];}
;D.parentNode.insertBefore(E,D);}
;}
,this);return this;}
,after:function(content){if(!qx.lang.Type.isArray(content)){content=[content];}
;var F=document.createDocumentFragment();qx.bom.Html.clean(content,document,F);this.forEach(function(J,G){var I=qx.lang.Array.cast(F.childNodes,Array);for(var i=I.length-1;i>=0;i--){var H;if(G<this.length-1){H=I[i].cloneNode(true);}
else {H=I[i];}
;J.parentNode.insertBefore(H,J.nextSibling);}
;}
,this);return this;}
,getScrollLeft:function(){var K=this[0];if(!K){return null;}
;var Node=qx.dom.Node;if(Node.isWindow(K)||Node.isDocument(K)){return qx.bom.Viewport.getScrollLeft();}
;return K.scrollLeft;}
,getScrollTop:function(){var L=this[0];if(!L){return null;}
;var Node=qx.dom.Node;if(Node.isWindow(L)||Node.isDocument(L)){return qx.bom.Viewport.getScrollTop();}
;return L.scrollTop;}
,_animationDescription:{scrollLeft:{duration:700,timing:c,keep:100,keyFrames:{'0':{},'100':{scrollLeft:1}}},scrollTop:{duration:700,timing:c,keep:100,keyFrames:{'0':{},'100':{scrollTop:1}}}},__animateScroll:function(N,O,M){var P=qx.lang.Object.clone(qx.module.Manipulating._animationDescription[N],true);P.keyFrames[100][N]=O;return this.animate(P,M);}
,setScrollLeft:function(R,S){var Node=qx.dom.Node;if(S&&qx.bom.element&&qx.bom.element.AnimationJs){qx.module.Manipulating.__animateScroll.bind(this,a,R,S)();}
;for(var i=0,l=this.length,Q;i<l;i++){Q=this[i];if(Node.isElement(Q)){if(!(S&&qx.bom.element&&qx.bom.element.AnimationJs)){Q.scrollLeft=R;}
;}
else if(Node.isWindow(Q)){Q.scrollTo(R,this.getScrollTop(Q));}
else if(Node.isDocument(Q)){Node.getWindow(Q).scrollTo(R,this.getScrollTop(Q));}
;}
;return this;}
,setScrollTop:function(U,V){var Node=qx.dom.Node;if(V&&qx.bom.element&&qx.bom.element.AnimationJs){qx.module.Manipulating.__animateScroll.bind(this,e,U,V)();}
;for(var i=0,l=this.length,T;i<l;i++){T=this[i];if(Node.isElement(T)){if(!(V&&qx.bom.element&&qx.bom.element.AnimationJs)){T.scrollTop=U;}
;}
else if(Node.isWindow(T)){T.scrollTo(this.getScrollLeft(T),U);}
else if(Node.isDocument(T)){Node.getWindow(T).scrollTo(this.getScrollLeft(T),U);}
;}
;return this;}
,focus:function(){try{this[0].focus();}
catch(W){}
;return this;}
,blur:function(){this.forEach(function(X,Y){try{X.blur();}
catch(ba){}
;}
);return this;}
},defer:function(bb){qxWeb.$attachStatic({"create":bb.create});qxWeb.$attach({"append":bb.append,"appendTo":bb.appendTo,"remove":bb.remove,"empty":bb.empty,"before":bb.before,"insertBefore":bb.insertBefore,"after":bb.after,"insertAfter":bb.insertAfter,"wrap":bb.wrap,"clone":bb.clone,"getScrollLeft":bb.getScrollLeft,"setScrollLeft":bb.setScrollLeft,"getScrollTop":bb.getScrollTop,"setScrollTop":bb.setScrollTop,"focus":bb.focus,"blur":bb.blur});}
});}
)();
(function(){var a="<fieldset>",b="<select multiple='multiple'>",c="</div>",d="</select>",e="</tr></tbody></table>",f="<col",g="div",h="<table><tbody><tr>",k="string",m=">",n="script",o="<table><tbody></tbody><colgroup>",p="<th",q="</tbody></table>",r="<td",s="</colgroup></table>",t="<opt",u="text/javascript",v="",w="<table>",x="</fieldset>",y="<table><tbody>",z="div<div>",A="<table",B="mshtml",C="engine.name",D="qx.bom.Html",E="<leg",F="tbody",G="<tr",H="</table>",I="undefined",J="></";qx.Bootstrap.define(D,{statics:{__fixNonDirectlyClosableHelper:function(L,K,M){return M.match(/^(abbr|br|col|img|input|link|meta|param|hr|area|embed)$/i)?L:K+J+M+m;}
,__convertMap:{opt:[1,b,d],leg:[1,a,x],table:[1,w,H],tr:[2,y,q],td:[3,h,e],col:[2,o,s],def:qx.core.Environment.select(C,{"mshtml":[1,z,c],"default":null})},__convertHtmlString:function(R,S){var U=S.createElement(g);R=R.replace(/(<(\w+)[^>]*?)\/>/g,this.__fixNonDirectlyClosableHelper);var O=R.replace(/^\s+/,v).substring(0,5).toLowerCase();var T,N=this.__convertMap;if(!O.indexOf(t)){T=N.opt;}
else if(!O.indexOf(E)){T=N.leg;}
else if(O.match(/^<(thead|tbody|tfoot|colg|cap)/)){T=N.table;}
else if(!O.indexOf(G)){T=N.tr;}
else if(!O.indexOf(r)||!O.indexOf(p)){T=N.td;}
else if(!O.indexOf(f)){T=N.col;}
else {T=N.def;}
;if(T){U.innerHTML=T[1]+R+T[2];var Q=T[0];while(Q--){U=U.lastChild;}
;}
else {U.innerHTML=R;}
;if((qx.core.Environment.get(C)==B)){var V=/<tbody/i.test(R);var P=!O.indexOf(A)&&!V?U.firstChild&&U.firstChild.childNodes:T[1]==w&&!V?U.childNodes:[];for(var j=P.length-1;j>=0;--j){if(P[j].tagName.toLowerCase()===F&&!P[j].childNodes.length){P[j].parentNode.removeChild(P[j]);}
;}
;if(/^\s/.test(R)){U.insertBefore(S.createTextNode(R.match(/^\s*/)[0]),U.firstChild);}
;}
;return qx.lang.Array.fromCollection(U.childNodes);}
,clean:function(W,bd,ba){bd=bd||document;if(typeof bd.createElement===I){bd=bd.ownerDocument||bd[0]&&bd[0].ownerDocument||document;}
;if(!ba&&W.length===1&&typeof W[0]===k){var bf=/^<(\w+)\s*\/?>$/.exec(W[0]);if(bf){return [bd.createElement(bf[1])];}
;}
;var Y,bb=[];for(var i=0,l=W.length;i<l;i++){Y=W[i];if(typeof Y===k){Y=this.__convertHtmlString(Y,bd);}
;if(Y.nodeType){bb.push(Y);}
else if(Y instanceof qx.type.BaseArray||(typeof qxWeb!==I&&Y instanceof qxWeb)){bb.push.apply(bb,Array.prototype.slice.call(Y,0));}
else if(Y.toElement){bb.push(Y.toElement());}
else {bb.push.apply(bb,Y);}
;}
;if(ba){var be=[],bc;for(var i=0;bb[i];i++){bc=bb[i];if(bc.nodeType==1&&bc.tagName.toLowerCase()===n&&(!bc.type||bc.type.toLowerCase()===u)){if(bc.parentNode){bc.parentNode.removeChild(bb[i]);}
;be.push(bc);}
else {if(bc.nodeType===1){var X=qx.lang.Array.fromCollection(bc.getElementsByTagName(n));bb.splice.apply(bb,[i+1,0].concat(X));}
;ba.appendChild(bc);}
;}
;return be;}
;return bb;}
}});}
)();
(function(){var a="text",b="<label>",c="font-size",d="px",e="css.placeholder",f="font-variant",g="inline",h="auto",j="cursor",k="event.pointer",l="font-family",m="padding-right",n="text-align",o="placeholder",p="padding-left",q="font-weight",r="#989898",s="$qx_placeholder",t="",u="INPUT",v="TEXTAREA",w="keyup",x="display",y="click",z="padding-top",A="none",B="z-index",C="qx.module.Placeholder",D="tagName",E="hidden",F="padding-bottom",G="absolute",H="font-style",I="input[placeholder], textarea[placeholder]";qx.Bootstrap.define(C,{statics:{PLACEHOLDER_NAME:s,update:function(){if(!qxWeb.env.get(e)){qxWeb(I).updatePlaceholder();}
;}
,updatePlaceholder:function(){if(!qxWeb.env.get(e)){for(var i=0;i<this.length;i++){var L=qxWeb(this[i]);var O=L.getAttribute(o);var N=L.getProperty(D);if(!O||(N!=v&&N!=u)){continue;}
;var J=L.getProperty(qx.module.Placeholder.PLACEHOLDER_NAME);if(!J){J=qx.module.Placeholder.__createPlaceholderElement(L);}
;var K=L.isRendered();var M=J.isRendered();if(K&&!M){L.before(J);}
else if(!K&&M){J.remove();return this;}
;qx.module.Placeholder.__syncStyles(L);}
;}
;return this;}
,__syncStyles:function(T){var U=T.getAttribute(o);var Q=T.getProperty(qx.module.Placeholder.PLACEHOLDER_NAME);var S=T.getStyle(B);var P=parseInt(T.getStyle(p))+2*parseInt(T.getStyle(m));var R=parseInt(T.getStyle(z))+2*parseInt(T.getStyle(F));Q.setHtml(U).setStyles({display:T.getValue()==t?g:A,zIndex:S==h?1:S+1,textAlign:T.getStyle(n),width:(T.getWidth()-P-4)+d,height:(T.getHeight()-R-4)+d,left:T.getOffset().left+d,top:T.getOffset().top+d,fontFamily:T.getStyle(l),fontStyle:T.getStyle(H),fontVariant:T.getStyle(f),fontWeight:T.getStyle(q),fontSize:T.getStyle(c),paddingTop:(parseInt(T.getStyle(z))+2)+d,paddingRight:(parseInt(T.getStyle(m))+2)+d,paddingBottom:(parseInt(T.getStyle(F))+2)+d,paddingLeft:(parseInt(T.getStyle(p))+2)+d});}
,__createPlaceholderElement:function(V){var W=qxWeb.create(b).setStyles({position:G,color:r,overflow:E,pointerEvents:A});V.setProperty(qx.module.Placeholder.PLACEHOLDER_NAME,W);V.on(w,function(X){var Y=X.getProperty(qx.module.Placeholder.PLACEHOLDER_NAME);Y.setStyle(x,X.getValue()==t?g:A);}
.bind(this,V));if(!qxWeb.env.get(k)){W.setStyle(j,a).on(y,function(ba){ba.focus();}
.bind(this,V));}
;return W;}
},defer:function(bb){qxWeb.$attachStatic({"placeholder":{update:bb.update}});qxWeb.$attach({"updatePlaceholder":bb.updatePlaceholder});}
});}
)();
(function(){var a="qx.module.Core";qx.Bootstrap.define(a,{});}
)();
(function(){var a="tap",b="swipe",c="qx.module.event.Touch";qx.Bootstrap.define(c,{statics:{TYPES:[a,b],normalize:function(event,e,d){if(!event){return event;}
;event._type=d;return event;}
},defer:function(f){qxWeb.$registerEventNormalization(f.TYPES,f.normalize);}
});}
)();
(function(){var a="function",b="getButton",c="mousedown",d="getScreenLeft",e="ie",f="mouseout",g="browser.name",h="dblclick",j="qx.module.event.Mouse",k="mousemove",m="middle",n="browser.documentmode",o="mouseover",p="mouseup",q="getDocumentLeft",r="getViewportLeft",s="right",t="click",u="getViewportTop",v="none",w="contextmenu",x="getScreenTop",y="left",z="getDocumentTop";qx.Bootstrap.define(j,{statics:{TYPES:[t,h,c,p,o,k,f],BIND_METHODS:[b,r,u,q,z,d,x],BUTTONS_DOM2:{'0':y,'2':s,'1':m},BUTTONS_MSHTML:{'1':y,'2':s,'4':m},getButton:function(){switch(this.type){case w:return s;case t:if(qxWeb.env.get(g)===e&&qxWeb.env.get(n)<9){return y;}
;default:if(this.target!==undefined){return qx.module.event.Mouse.BUTTONS_DOM2[this.button]||v;}
else {return qx.module.event.Mouse.BUTTONS_MSHTML[this.button]||v;}
;};}
,getViewportLeft:function(){return this.clientX;}
,getViewportTop:function(){return this.clientY;}
,getDocumentLeft:function(){if(this.pageX!==undefined){return this.pageX;}
else {var A=qx.dom.Node.getWindow(this.srcElement);return this.clientX+qx.bom.Viewport.getScrollLeft(A);}
;}
,getDocumentTop:function(){if(this.pageY!==undefined){return this.pageY;}
else {var B=qx.dom.Node.getWindow(this.srcElement);return this.clientY+qx.bom.Viewport.getScrollTop(B);}
;}
,getScreenLeft:function(){return this.screenX;}
,getScreenTop:function(){return this.screenY;}
,normalize:function(event,D){if(!event){return event;}
;var C=qx.module.event.Mouse.BIND_METHODS;for(var i=0,l=C.length;i<l;i++){if(typeof event[C[i]]!=a){event[C[i]]=qx.module.event.Mouse[C[i]].bind(event);}
;}
;return event;}
},defer:function(E){qxWeb.$registerEventNormalization(qx.module.event.Mouse.TYPES,E.normalize);}
});}
)();
(function(){var a="function",b="*",c="getRelatedTarget",d="getType",e="qx.module.event.Native",f="preventDefault",g="getTarget",h="stopPropagation";qx.Bootstrap.define(e,{statics:{TYPES:[b],FORWARD_METHODS:[g,c],BIND_METHODS:[f,h,d],preventDefault:function(){try{this.keyCode=0;}
catch(j){}
;this.returnValue=false;}
,stopPropagation:function(){this.cancelBubble=true;}
,getType:function(){return this._type||this.type;}
,normalize:function(event,n){if(!event){return event;}
;var k=qx.module.event.Native.FORWARD_METHODS;for(var i=0,l=k.length;i<l;i++){event[k[i]]=qx.bom.Event[k[i]].bind(null,event);}
;var m=qx.module.event.Native.BIND_METHODS;for(var i=0,l=m.length;i<l;i++){if(typeof event[m[i]]!=a){event[m[i]]=qx.module.event.Native[m[i]].bind(event);}
;}
;event.getCurrentTarget=function(){return event.currentTarget||n;}
;return event;}
},defer:function(o){qxWeb.$registerEventNormalization(o.TYPES,o.normalize);}
});}
)();
(function(){var a="landscape",b="getOrientation",c="portrait",d="orientationchange",e="isLandscape",f="function",g="qx.module.event.Orientation",h="isPortrait";qx.Bootstrap.define(g,{statics:{TYPES:[d],BIND_METHODS:[b,e,h],getOrientation:function(){return this._orientation;}
,isLandscape:function(){return this._mode==a;}
,isPortrait:function(){return this._mode==c;}
,normalize:function(event,k,m){if(!event){return event;}
;event._type=m;var j=qx.module.event.Orientation.BIND_METHODS;for(var i=0,l=j.length;i<l;i++){if(typeof event[j[i]]!=f){event[j[i]]=qx.module.event.Orientation[j[i]].bind(event);}
;}
;return event;}
},defer:function(n){qxWeb.$registerEventNormalization(n.TYPES,n.normalize);}
});}
)();
(function(){var a="touchmove",b="touchend",c="swipe",d="touchcancel",e="tap",f="touchstart",g="qx.module.event.TouchHandler";qx.Bootstrap.define(g,{statics:{TYPES:[e,c,f,b,a,d],register:function(h){if(!h.__touchHandler){if(!h.__emitter){h.__emitter=new qx.event.Emitter();}
;h.__touchHandler=new qx.event.handler.TouchCore(h,h.__emitter);}
;}
,unregister:function(k){if(k.__touchHandler){if(!k.__emitter){k.__touchHandler=null;}
else {var j=false;var i=k.__emitter.getListeners();qx.module.event.TouchHandler.TYPES.forEach(function(l){if(l in i&&i[l].length>0){j=true;}
;}
);if(!j){k.__touchHandler=null;}
;}
;}
;}
},defer:function(m){qxWeb.$registerEventHook(m.TYPES,m.register,m.unregister);}
});}
)();
(function(){var a="touchmove",b="os.name",c="MSPointerDown",d="swipe",e="android",f="qx.event.handler.TouchCore",g="event.mspointer",h="MSPointerCancel",j="y",k="pointer-events",l="touchend",m="MSPointerUp",n="right",o="engine.name",p="x",q="touchcancel",r="MSPointerMove",s="webkit",t="none",u="left",v="tap",w="down",z="undefined",A="up",B="touchstart";qx.Bootstrap.define(f,{extend:Object,statics:{TAP_MAX_DISTANCE:qx.core.Environment.get(b)!=e?10:40,SWIPE_DIRECTION:{x:[u,n],y:[A,w]},SWIPE_MIN_DISTANCE:qx.core.Environment.get(b)!=e?11:41,SWIPE_MIN_VELOCITY:0},construct:function(C,D){this.__target=C;this.__emitter=D;this._initTouchObserver();}
,members:{__target:null,__emitter:null,__onTouchEventWrapper:null,__originalTarget:null,__startPageX:null,__startPageY:null,__startTime:null,__isSingleTouchGesture:null,__onMove:null,__beginScalingDistance:null,__beginRotation:null,_initTouchObserver:function(){this.__onTouchEventWrapper=qx.lang.Function.listener(this._onTouchEvent,this);var Event=qx.bom.Event;Event.addNativeListener(this.__target,B,this.__onTouchEventWrapper);Event.addNativeListener(this.__target,a,this.__onTouchEventWrapper);Event.addNativeListener(this.__target,l,this.__onTouchEventWrapper);Event.addNativeListener(this.__target,q,this.__onTouchEventWrapper);if(qx.core.Environment.get(g)){Event.addNativeListener(this.__target,c,this.__onTouchEventWrapper);Event.addNativeListener(this.__target,r,this.__onTouchEventWrapper);Event.addNativeListener(this.__target,m,this.__onTouchEventWrapper);Event.addNativeListener(this.__target,h,this.__onTouchEventWrapper);}
;}
,_stopTouchObserver:function(){var Event=qx.bom.Event;Event.removeNativeListener(this.__target,B,this.__onTouchEventWrapper);Event.removeNativeListener(this.__target,a,this.__onTouchEventWrapper);Event.removeNativeListener(this.__target,l,this.__onTouchEventWrapper);Event.removeNativeListener(this.__target,q,this.__onTouchEventWrapper);if(qx.core.Environment.get(g)){Event.removeNativeListener(this.__target,c,this.__onTouchEventWrapper);Event.removeNativeListener(this.__target,r,this.__onTouchEventWrapper);Event.removeNativeListener(this.__target,m,this.__onTouchEventWrapper);Event.removeNativeListener(this.__target,h,this.__onTouchEventWrapper);}
;}
,_onTouchEvent:function(E){this._commonTouchEventHandler(E);}
,_getScalingDistance:function(G,F){return (Math.sqrt(Math.pow(G.pageX-F.pageX,2)+Math.pow(G.pageY-F.pageY,2)));}
,_getRotationAngle:function(I,H){var x=I.pageX-H.pageX;var y=I.pageY-H.pageY;return (Math.atan2(y,x)*180/Math.PI);}
,_commonTouchEventHandler:function(L,J){var J=J||L.type;if(qx.core.Environment.get(g)){L.changedTouches=[L];L.targetTouches=[L];L.touches=[L];if(J==c){J=B;}
else if(J==m){J=l;}
else if(J==r){if(this.__onMove==true){J=a;}
;}
else if(J==h){J=q;}
;}
;if(J==B){this.__originalTarget=this._getTarget(L);if(L.touches&&L.touches.length>1){this.__beginScalingDistance=this._getScalingDistance(L.touches[0],L.touches[1]);this.__beginRotation=this._getRotationAngle(L.touches[0],L.touches[1]);}
;}
;if(J==a){if(typeof L.scale==z&&L.changedTouches.length>1){var M=this._getScalingDistance(L.changedTouches[0],L.changedTouches[1]);L.scale=M/this.__beginScalingDistance;}
;if(typeof L.rotation==z&&L.changedTouches.length>1){var K=this._getRotationAngle(L.changedTouches[0],L.changedTouches[1]);L.rotation=K-this.__beginRotation;}
;}
;this._fireEvent(L,J);this.__checkAndFireGesture(L,J);}
,_getTarget:function(O){var P=qx.bom.Event.getTarget(O);if(qx.core.Environment.get(o)==s){if(P&&P.nodeType==3){P=P.parentNode;}
;}
else if(qx.core.Environment.get(g)){var N=this.__evaluateTarget(O);if(N){P=N;}
;}
;return P;}
,__evaluateTarget:function(S){if(S&&S.touches){var Q=S.touches[0].clientX;var R=S.touches[0].clientY;}
;var U=document.msElementsFromPoint(Q,R);if(U){for(var i=0;i<U.length;i++){var V=U[i];var T=qx.bom.element.Style.get(V,k,3);if(T!=t){return V;}
;}
;}
;return null;}
,_fireEvent:function(W,X,Y){if(!Y){Y=this._getTarget(W);}
;var X=X||W.type;if(Y&&Y.nodeType&&this.__emitter){this.__emitter.emit(X,W);}
;}
,__checkAndFireGesture:function(ba,bb,bc){if(!bc){bc=this._getTarget(ba);}
;var bb=bb||ba.type;if(bb==B){this.__gestureStart(ba,bc);}
else if(bb==a){this.__gestureChange(ba,bc);}
else if(bb==l){this.__gestureEnd(ba,bc);}
;}
,__gestureStart:function(be,bf){var bd=be.changedTouches[0];this.__onMove=true;this.__startPageX=bd.screenX;this.__startPageY=bd.screenY;this.__startTime=new Date().getTime();this.__isSingleTouchGesture=be.changedTouches.length===1;}
,__gestureChange:function(bg,bh){if(this.__isSingleTouchGesture&&bg.changedTouches.length>1){this.__isSingleTouchGesture=false;}
;}
,__gestureEnd:function(bi,bj){this.__onMove=false;if(this.__isSingleTouchGesture){var bn=bi.changedTouches[0];var bo={x:bn.screenX-this.__startPageX,y:bn.screenY-this.__startPageY};var bm=qx.event.handler.TouchCore;var bk;if(this.__originalTarget==bj&&Math.abs(bo.x)<=bm.TAP_MAX_DISTANCE&&Math.abs(bo.y)<=bm.TAP_MAX_DISTANCE){if(qx.event&&qx.event.type&&qx.event.type.Tap){bk=qx.event.type.Tap;}
;this._fireEvent(bi,v,bj,bk);}
else {var bl=this.__getSwipeGesture(bi,bj,bo);if(bl){if(qx.event&&qx.event.type&&qx.event.type.Swipe){bk=qx.event.type.Swipe;}
;bi.swipe=bl;this._fireEvent(bi,d,bj,bk);}
;}
;}
;}
,__getSwipeGesture:function(br,bs,bx){var bu=qx.event.handler.TouchCore;var bv=new Date().getTime()-this.__startTime;var by=(Math.abs(bx.x)>=Math.abs(bx.y))?p:j;var bp=bx[by];var bq=bu.SWIPE_DIRECTION[by][bp<0?0:1];var bw=(bv!==0)?bp/bv:0;var bt=null;if(Math.abs(bw)>=bu.SWIPE_MIN_VELOCITY&&Math.abs(bp)>=bu.SWIPE_MIN_DISTANCE){bt={startTime:this.__startTime,duration:bv,axis:by,direction:bq,distance:bp,velocity:bw};}
;return bt;}
,dispose:function(){this._stopTouchObserver();this.__originalTarget=this.__target=this.__emitter=this.__beginScalingDistance=this.__beginRotation=null;}
}});}
)();
(function(){var a="text",b="engine.name",c="password",d="keypress",e="mshtml",f="textarea",g="function",h="input",j="gecko",k="getKeyIdentifier",m="Backspace",n="keydown",o="qx.module.event.Keyboard",p="keyup",q="browser.documentmode";qx.Bootstrap.define(o,{statics:{TYPES:[n,d,p],BIND_METHODS:[k],getKeyIdentifier:function(){if(this.type==d&&(qxWeb.env.get(b)!=j||this.charCode!==0)){return qx.event.util.Keyboard.charCodeToIdentifier(this.charCode||this.keyCode);}
;return qx.event.util.Keyboard.keyCodeToIdentifier(this.keyCode);}
,normalize:function(event,s){if(!event){return event;}
;var r=qx.module.event.Keyboard.BIND_METHODS;for(var i=0,l=r.length;i<l;i++){if(typeof event[r[i]]!=g){event[r[i]]=qx.module.event.Keyboard[r[i]].bind(event);}
;}
;return event;}
,registerInputFix:function(t){if(t.type===a||t.type===c||t.type===f){if(!t.__inputFix){t.__inputFix=qxWeb(t).on(p,qx.module.event.Keyboard._inputFix);}
;}
;}
,unregisterInputFix:function(u){if(u.__inputFix&&!qxWeb(u).hasListener(h)){qxWeb(u).off(p,qx.module.event.Keyboard._inputFix);u.__inputFix=null;}
;}
,_inputFix:function(v){if(v.getKeyIdentifier()!==m){return;}
;var w=v.getTarget();var x=qxWeb(w).getValue();if(!w.__oldInputValue||w.__oldInputValue!==x){w.__oldInputValue=x;v.type=v._type=h;w.__emitter.emit(h,v);}
;}
},defer:function(y){qxWeb.$registerEventNormalization(qx.module.event.Keyboard.TYPES,y.normalize);if(qxWeb.env.get(b)===e&&qxWeb.env.get(q)===9){qxWeb.$registerEventHook(h,y.registerInputFix,y.unregisterInputFix);}
;}
});}
)();
(function(){var a="-",b="PageUp",c="Escape",d="Enter",e="+",f="PrintScreen",g="os.name",h="7",i="A",j="Space",k="Left",l="5",m="F5",n="Down",o="Up",p="3",q="Meta",r="F11",s="0",t="F6",u="PageDown",v="osx",w="CapsLock",x="Insert",y="F8",z="Scroll",A="Control",B="Tab",C="Shift",D="End",E="Pause",F="Unidentified",G="/",H="8",I="Z",J="*",K="cmd",L="F1",M="F4",N="Home",O="qx.event.util.Keyboard",P="F2",Q="6",R="F7",S="Apps",T="4",U="F12",V="Alt",W="2",X="NumLock",Y="Delete",bn="1",bo="Win",bp="Backspace",bj="F9",bk="F10",bl="Right",bm="F3",bq="9",br=",";qx.Bootstrap.define(O,{statics:{specialCharCodeMap:{'8':bp,'9':B,'13':d,'27':c,'32':j},numpadToCharCode:{'96':s.charCodeAt(0),'97':bn.charCodeAt(0),'98':W.charCodeAt(0),'99':p.charCodeAt(0),'100':T.charCodeAt(0),'101':l.charCodeAt(0),'102':Q.charCodeAt(0),'103':h.charCodeAt(0),'104':H.charCodeAt(0),'105':bq.charCodeAt(0),'106':J.charCodeAt(0),'107':e.charCodeAt(0),'109':a.charCodeAt(0),'110':br.charCodeAt(0),'111':G.charCodeAt(0)},keyCodeToIdentifierMap:{'16':C,'17':A,'18':V,'20':w,'224':q,'37':k,'38':o,'39':bl,'40':n,'33':b,'34':u,'35':D,'36':N,'45':x,'46':Y,'112':L,'113':P,'114':bm,'115':M,'116':m,'117':t,'118':R,'119':y,'120':bj,'121':bk,'122':r,'123':U,'144':X,'44':f,'145':z,'19':E,'91':qx.core.Environment.get(g)==v?K:bo,'92':bo,'93':qx.core.Environment.get(g)==v?K:S},charCodeA:i.charCodeAt(0),charCodeZ:I.charCodeAt(0),charCode0:s.charCodeAt(0),charCode9:bq.charCodeAt(0),keyCodeToIdentifier:function(bs){if(this.isIdentifiableKeyCode(bs)){var bt=this.numpadToCharCode[bs];if(bt){return String.fromCharCode(bt);}
;return (this.keyCodeToIdentifierMap[bs]||this.specialCharCodeMap[bs]||String.fromCharCode(bs));}
else {return F;}
;}
,charCodeToIdentifier:function(bu){return this.specialCharCodeMap[bu]||String.fromCharCode(bu).toUpperCase();}
,isIdentifiableKeyCode:function(bv){if(bv>=this.charCodeA&&bv<=this.charCodeZ){return true;}
;if(bv>=this.charCode0&&bv<=this.charCode9){return true;}
;if(this.specialCharCodeMap[bv]){return true;}
;if(this.numpadToCharCode[bv]){return true;}
;if(this.isNonPrintableKeyCode(bv)){return true;}
;return false;}
,isNonPrintableKeyCode:function(bw){return this.keyCodeToIdentifierMap[bw]?true:false;}
},defer:function(bx,by){if(!bx.identifierToKeyCodeMap){bx.identifierToKeyCodeMap={};for(var bz in bx.keyCodeToIdentifierMap){bx.identifierToKeyCodeMap[bx.keyCodeToIdentifierMap[bz]]=parseInt(bz,10);}
;for(var bz in bx.specialCharCodeMap){bx.identifierToKeyCodeMap[bx.specialCharCodeMap[bz]]=parseInt(bz,10);}
;}
;}
});}
)();
(function(){var a="qx.module.event.OrientationHandler",b="The 'orientationchange' event is only available on window objects!",c="orientationchange";qx.Bootstrap.define(a,{statics:{TYPES:[c],register:function(d){if(!qx.dom.Node.isWindow(d)){throw new Error(b);}
;if(!d.__orientationHandler){if(!d.__emitter){d.__emitter=new qx.event.Emitter();}
;d.__orientationHandler=new qx.event.handler.OrientationCore(d,d.__emitter);}
;}
,unregister:function(g){if(g.__orientationHandler){if(!g.__emitter){g.__orientationHandler=null;}
else {var f=false;var e=g.__emitter.getListeners();qx.module.event.OrientationHandler.TYPES.forEach(function(h){if(h in e&&e[h].length>0){f=true;}
;}
);if(!f){g.__orientationHandler=null;}
;}
;}
;}
},defer:function(i){qxWeb.$registerEventHook(i.TYPES,i.register,i.unregister);}
});}
)();
(function(){var a="qx.event.handler.OrientationCore",b="orientationchange",c="landscape",d="resize",e="portrait";qx.Bootstrap.define(a,{extend:Object,construct:function(g,f){this._window=g||window;this.__emitter=f;this._initObserver();}
,members:{__emitter:null,_window:null,_currentOrientation:null,__onNativeWrapper:null,__nativeEventType:null,_initObserver:function(){this.__onNativeWrapper=qx.lang.Function.listener(this._onNative,this);this.__nativeEventType=qx.bom.Event.supportsEvent(this._window,b)?b:d;qx.bom.Event.addNativeListener(this._window,this.__nativeEventType,this.__onNativeWrapper);}
,_stopObserver:function(){qx.bom.Event.removeNativeListener(this._window,this.__nativeEventType,this.__onNativeWrapper);}
,_onNative:function(h){var i=qx.bom.Viewport.getOrientation();if(this._currentOrientation!=i){this._currentOrientation=i;var j=qx.bom.Viewport.isLandscape()?c:e;h._orientation=i;h._mode=j;if(this.__emitter){this.__emitter.emit(b,h);}
;}
;}
},destruct:function(){this._stopObserver();this.__manager=this.__emitter=null;}
});}
)();


var exp = envinfo["qx.export"];
if (exp) {
  for (var name in exp) {
    var c = exp[name].split(".");
    var root = window;
    for (var i=0; i < c.length; i++) {
      root = root[c[i]];
    };
    window[name] = root;
  }
}

window["qx"] = undefined;
try {
  delete window.qx;
} catch(e) {}

})();