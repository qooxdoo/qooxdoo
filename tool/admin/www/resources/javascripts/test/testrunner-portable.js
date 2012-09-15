(function(){

if (!window.qx) window.qx = {};

if (!window.testrunner) window.testrunner = {};
if (!testrunner.testDefinitions) testrunner.testDefinitions = [];
if (!testrunner.define) testrunner.define = function(testDefinition) {
  testrunner.testDefinitions.push(testDefinition);
}

qx.$$start = new Date();
  
if (!qx.$$environment) qx.$$environment = {};
var envinfo = {"qx.allowUrlSettings":true,"qx.application":"testrunner.Application","qx.debug":false,"qx.debug.databinding":false,"qx.debug.dispose":false,"qx.optimization.basecalls":true,"qx.optimization.comments":true,"qx.optimization.privates":true,"qx.optimization.strings":true,"qx.optimization.variables":true,"qx.optimization.variants":true,"qx.revision":"","qx.testNameSpace":"test","qx.theme":"qx.theme.Modern","qx.version":"2.0","testrunner.reportServer":null,"testrunner.testOrigin":"external","testrunner.testParts":false,"testrunner.title":"testrunner","testrunner.view":"testrunner.view.Html"};
for (var k in envinfo) qx.$$environment[k] = envinfo[k];

if (!qx.$$libraries) qx.$$libraries = {};
var libinfo = {"__out__":{"sourceUri":"script"},"qx":{"resourceUri":"resource","sourceUri":"script","sourceViewUri":"https://github.com/qooxdoo/qooxdoo/blob/%{qxGitBranch}/framework/source/class/%{classFilePath}#L%{lineNumber}"},"testrunner":{"resourceUri":"resource","sourceUri":"script"}};
for (var k in libinfo) qx.$$libraries[k] = libinfo[k];

qx.$$resources = {};
qx.$$translations = {"C":null,"en":null};
qx.$$locales = {"C":null,"en":null};
qx.$$packageData = {};

qx.$$loader = {
  parts : {"boot":[0]},
  packages : {"0":{"uris":["__out__:testrunner-portable.39fab140e770.js"]}},
  urisBefore : [],
  cssBefore : [],
  boot : "boot",
  closureParts : {},
  bootIsInline : true,
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

qx.$$packageData['0']={"locales":{"C":{"alternateQuotationEnd":"’","alternateQuotationStart":"‘","cldr_am":"AM","cldr_date_format_full":"EEEE, MMMM d, y","cldr_date_format_long":"MMMM d, y","cldr_date_format_medium":"MMM d, y","cldr_date_format_short":"M/d/yy","cldr_date_time_format_EEEd":"d EEE","cldr_date_time_format_Hm":"HH:mm","cldr_date_time_format_Hms":"HH:mm:ss","cldr_date_time_format_M":"L","cldr_date_time_format_MEd":"E, M/d","cldr_date_time_format_MMM":"LLL","cldr_date_time_format_MMMEd":"E, MMM d","cldr_date_time_format_MMMd":"MMM d","cldr_date_time_format_Md":"M/d","cldr_date_time_format_d":"d","cldr_date_time_format_hm":"h:mm a","cldr_date_time_format_hms":"h:mm:ss a","cldr_date_time_format_ms":"mm:ss","cldr_date_time_format_y":"y","cldr_date_time_format_yM":"M/y","cldr_date_time_format_yMEd":"EEE, M/d/y","cldr_date_time_format_yMMM":"MMM y","cldr_date_time_format_yMMMEd":"EEE, MMM d, y","cldr_date_time_format_yMMMd":"MMM d, y","cldr_date_time_format_yMd":"M/d/y","cldr_date_time_format_yQ":"Q y","cldr_date_time_format_yQQQ":"QQQ y","cldr_day_format_abbreviated_fri":"Fri","cldr_day_format_abbreviated_mon":"Mon","cldr_day_format_abbreviated_sat":"Sat","cldr_day_format_abbreviated_sun":"Sun","cldr_day_format_abbreviated_thu":"Thu","cldr_day_format_abbreviated_tue":"Tue","cldr_day_format_abbreviated_wed":"Wed","cldr_day_format_wide_fri":"Friday","cldr_day_format_wide_mon":"Monday","cldr_day_format_wide_sat":"Saturday","cldr_day_format_wide_sun":"Sunday","cldr_day_format_wide_thu":"Thursday","cldr_day_format_wide_tue":"Tuesday","cldr_day_format_wide_wed":"Wednesday","cldr_day_stand-alone_narrow_fri":"F","cldr_day_stand-alone_narrow_mon":"M","cldr_day_stand-alone_narrow_sat":"S","cldr_day_stand-alone_narrow_sun":"S","cldr_day_stand-alone_narrow_thu":"T","cldr_day_stand-alone_narrow_tue":"T","cldr_day_stand-alone_narrow_wed":"W","cldr_month_format_abbreviated_1":"Jan","cldr_month_format_abbreviated_10":"Oct","cldr_month_format_abbreviated_11":"Nov","cldr_month_format_abbreviated_12":"Dec","cldr_month_format_abbreviated_2":"Feb","cldr_month_format_abbreviated_3":"Mar","cldr_month_format_abbreviated_4":"Apr","cldr_month_format_abbreviated_5":"May","cldr_month_format_abbreviated_6":"Jun","cldr_month_format_abbreviated_7":"Jul","cldr_month_format_abbreviated_8":"Aug","cldr_month_format_abbreviated_9":"Sep","cldr_month_format_wide_1":"January","cldr_month_format_wide_10":"October","cldr_month_format_wide_11":"November","cldr_month_format_wide_12":"December","cldr_month_format_wide_2":"February","cldr_month_format_wide_3":"March","cldr_month_format_wide_4":"April","cldr_month_format_wide_5":"May","cldr_month_format_wide_6":"June","cldr_month_format_wide_7":"July","cldr_month_format_wide_8":"August","cldr_month_format_wide_9":"September","cldr_month_stand-alone_narrow_1":"J","cldr_month_stand-alone_narrow_10":"O","cldr_month_stand-alone_narrow_11":"N","cldr_month_stand-alone_narrow_12":"D","cldr_month_stand-alone_narrow_2":"F","cldr_month_stand-alone_narrow_3":"M","cldr_month_stand-alone_narrow_4":"A","cldr_month_stand-alone_narrow_5":"M","cldr_month_stand-alone_narrow_6":"J","cldr_month_stand-alone_narrow_7":"J","cldr_month_stand-alone_narrow_8":"A","cldr_month_stand-alone_narrow_9":"S","cldr_number_decimal_separator":".","cldr_number_group_separator":",","cldr_number_percent_format":"#,##0%","cldr_pm":"PM","cldr_time_format_full":"h:mm:ss a zzzz","cldr_time_format_long":"h:mm:ss a z","cldr_time_format_medium":"h:mm:ss a","cldr_time_format_short":"h:mm a","day":"Day","dayperiod":"AM/PM","era":"Era","hour":"Hour","minute":"Minute","month":"Month","quotationEnd":"”","quotationStart":"“","second":"Second","week":"Week","weekday":"Day of the Week","year":"Year","zone":"Time Zone"},"en":{"alternateQuotationEnd":"’","alternateQuotationStart":"‘","cldr_am":"AM","cldr_date_format_full":"EEEE, MMMM d, y","cldr_date_format_long":"MMMM d, y","cldr_date_format_medium":"MMM d, y","cldr_date_format_short":"M/d/yy","cldr_date_time_format_EEEd":"d EEE","cldr_date_time_format_Hm":"HH:mm","cldr_date_time_format_Hms":"HH:mm:ss","cldr_date_time_format_M":"L","cldr_date_time_format_MEd":"E, M/d","cldr_date_time_format_MMM":"LLL","cldr_date_time_format_MMMEd":"E, MMM d","cldr_date_time_format_MMMd":"MMM d","cldr_date_time_format_Md":"M/d","cldr_date_time_format_d":"d","cldr_date_time_format_hm":"h:mm a","cldr_date_time_format_hms":"h:mm:ss a","cldr_date_time_format_ms":"mm:ss","cldr_date_time_format_y":"y","cldr_date_time_format_yM":"M/y","cldr_date_time_format_yMEd":"EEE, M/d/y","cldr_date_time_format_yMMM":"MMM y","cldr_date_time_format_yMMMEd":"EEE, MMM d, y","cldr_date_time_format_yMMMd":"MMM d, y","cldr_date_time_format_yMd":"M/d/y","cldr_date_time_format_yQ":"Q y","cldr_date_time_format_yQQQ":"QQQ y","cldr_day_format_abbreviated_fri":"Fri","cldr_day_format_abbreviated_mon":"Mon","cldr_day_format_abbreviated_sat":"Sat","cldr_day_format_abbreviated_sun":"Sun","cldr_day_format_abbreviated_thu":"Thu","cldr_day_format_abbreviated_tue":"Tue","cldr_day_format_abbreviated_wed":"Wed","cldr_day_format_wide_fri":"Friday","cldr_day_format_wide_mon":"Monday","cldr_day_format_wide_sat":"Saturday","cldr_day_format_wide_sun":"Sunday","cldr_day_format_wide_thu":"Thursday","cldr_day_format_wide_tue":"Tuesday","cldr_day_format_wide_wed":"Wednesday","cldr_day_stand-alone_narrow_fri":"F","cldr_day_stand-alone_narrow_mon":"M","cldr_day_stand-alone_narrow_sat":"S","cldr_day_stand-alone_narrow_sun":"S","cldr_day_stand-alone_narrow_thu":"T","cldr_day_stand-alone_narrow_tue":"T","cldr_day_stand-alone_narrow_wed":"W","cldr_month_format_abbreviated_1":"Jan","cldr_month_format_abbreviated_10":"Oct","cldr_month_format_abbreviated_11":"Nov","cldr_month_format_abbreviated_12":"Dec","cldr_month_format_abbreviated_2":"Feb","cldr_month_format_abbreviated_3":"Mar","cldr_month_format_abbreviated_4":"Apr","cldr_month_format_abbreviated_5":"May","cldr_month_format_abbreviated_6":"Jun","cldr_month_format_abbreviated_7":"Jul","cldr_month_format_abbreviated_8":"Aug","cldr_month_format_abbreviated_9":"Sep","cldr_month_format_wide_1":"January","cldr_month_format_wide_10":"October","cldr_month_format_wide_11":"November","cldr_month_format_wide_12":"December","cldr_month_format_wide_2":"February","cldr_month_format_wide_3":"March","cldr_month_format_wide_4":"April","cldr_month_format_wide_5":"May","cldr_month_format_wide_6":"June","cldr_month_format_wide_7":"July","cldr_month_format_wide_8":"August","cldr_month_format_wide_9":"September","cldr_month_stand-alone_narrow_1":"J","cldr_month_stand-alone_narrow_10":"O","cldr_month_stand-alone_narrow_11":"N","cldr_month_stand-alone_narrow_12":"D","cldr_month_stand-alone_narrow_2":"F","cldr_month_stand-alone_narrow_3":"M","cldr_month_stand-alone_narrow_4":"A","cldr_month_stand-alone_narrow_5":"M","cldr_month_stand-alone_narrow_6":"J","cldr_month_stand-alone_narrow_7":"J","cldr_month_stand-alone_narrow_8":"A","cldr_month_stand-alone_narrow_9":"S","cldr_number_decimal_separator":".","cldr_number_group_separator":",","cldr_number_percent_format":"#,##0%","cldr_pm":"PM","cldr_time_format_full":"h:mm:ss a zzzz","cldr_time_format_long":"h:mm:ss a z","cldr_time_format_medium":"h:mm:ss a","cldr_time_format_short":"h:mm a","day":"Day","dayperiod":"AM/PM","era":"Era","hour":"Hour","minute":"Minute","month":"Month","quotationEnd":"”","quotationStart":"“","second":"Second","week":"Week","weekday":"Day of the Week","year":"Year","zone":"Time Zone"}},"resources":{"qx/test/xmlhttp/php_version.php":"qx","testrunner/view/html/css/testrunner.css":"testrunner"},"translations":{"C":{},"en":{}}};
(function(){var m="toString",k=".",j="Object",h='"',g="Array",f="()",e="String",d="Function",c=".prototype",b="function",K="Boolean",J="Error",I="constructor",H="warn",G="default",F="hasOwnProperty",E="string",D="toLocaleString",C="RegExp",B='\", "',t="info",u="BROKEN_IE",r="isPrototypeOf",s="Date",p="",q="qx.Bootstrap",n="]",o="Class",v="error",w="[Class ",y="valueOf",x="Number",A="debug",z="ES5";
if(!window.qx){window.qx={};
}qx.Bootstrap={genericToString:function(){return w+this.classname+n;
},createNamespace:function(name,L){var N=name.split(k);
var parent=window;
var M=N[0];

for(var i=0,O=N.length-1;i<O;i++,M=N[i]){if(!parent[M]){parent=parent[M]={};
}else{parent=parent[M];
}}parent[M]=L;
return M;
},setDisplayName:function(P,Q,name){P.displayName=Q+k+name+f;
},setDisplayNames:function(R,S){for(var name in R){var T=R[name];

if(T instanceof Function){T.displayName=S+k+name+f;
}}},define:function(name,U){if(!U){var U={statics:{}};
}var ba;
var X=null;
qx.Bootstrap.setDisplayNames(U.statics,name);

if(U.members||U.extend){qx.Bootstrap.setDisplayNames(U.members,name+c);
ba=U.construct||new Function;

if(U.extend){this.extendClass(ba,ba,U.extend,name,Y);
}var V=U.statics||{};
for(var i=0,bb=qx.Bootstrap.getKeys(V),l=bb.length;i<l;i++){var bc=bb[i];
ba[bc]=V[bc];
}X=ba.prototype;
var W=U.members||{};
for(var i=0,bb=qx.Bootstrap.getKeys(W),l=bb.length;i<l;i++){var bc=bb[i];
X[bc]=W[bc];
}}else{ba=U.statics||{};
}var Y=this.createNamespace(name,ba);
ba.name=ba.classname=name;
ba.basename=Y;
ba.$$type=o;
if(!ba.hasOwnProperty(m)){ba.toString=this.genericToString;
}if(U.defer){U.defer(ba,X);
}qx.Bootstrap.$$registry[name]=ba;
return ba;
}};
qx.Bootstrap.define(q,{statics:{LOADSTART:qx.$$start||new Date(),DEBUG:(function(){var bd=true;

if(qx.$$environment&&qx.$$environment["qx.debug"]===false){bd=false;
}return bd;
})(),getEnvironmentSetting:function(be){if(qx.$$environment){return qx.$$environment[be];
}},setEnvironmentSetting:function(bf,bg){if(!qx.$$environment){qx.$$environment={};
}
if(qx.$$environment[bf]===undefined){qx.$$environment[bf]=bg;
}},createNamespace:qx.Bootstrap.createNamespace,define:qx.Bootstrap.define,setDisplayName:qx.Bootstrap.setDisplayName,setDisplayNames:qx.Bootstrap.setDisplayNames,genericToString:qx.Bootstrap.genericToString,extendClass:function(bh,bi,bj,name,bk){var bn=bj.prototype;
var bm=new Function;
bm.prototype=bn;
var bl=new bm;
bh.prototype=bl;
bl.name=bl.classname=name;
bl.basename=bk;
bi.base=bh.superclass=bj;
bi.self=bh.constructor=bl.constructor=bh;
},getByName:function(name){return qx.Bootstrap.$$registry[name];
},$$registry:{},objectGetLength:function(bo){var length=0;

for(var bp in bo){length++;
}return length;
},objectMergeWith:function(bq,br,bs){if(bs===undefined){bs=true;
}
for(var bt in br){if(bs||bq[bt]===undefined){bq[bt]=br[bt];
}}return bq;
},__ht:[r,F,D,m,y,I],getKeys:({"ES5":Object.keys,"BROKEN_IE":function(bu){var bv=[];
var bx=Object.prototype.hasOwnProperty;

for(var by in bu){if(bx.call(bu,by)){bv.push(by);
}}var bw=qx.Bootstrap.__ht;

for(var i=0,a=bw,l=a.length;i<l;i++){if(bx.call(bu,a[i])){bv.push(a[i]);
}}return bv;
},"default":function(bz){var bA=[];
var bB=Object.prototype.hasOwnProperty;

for(var bC in bz){if(bB.call(bz,bC)){bA.push(bC);
}}return bA;
}})[typeof (Object.keys)==b?z:(function(){for(var bD in {toString:1}){return bD;
}})()!==m?u:G],getKeysAsString:function(bE){var bF=qx.Bootstrap.getKeys(bE);

if(bF.length==0){return p;
}return h+bF.join(B)+h;
},__hu:{"[object String]":e,"[object Array]":g,"[object Object]":j,"[object RegExp]":C,"[object Number]":x,"[object Boolean]":K,"[object Date]":s,"[object Function]":d,"[object Error]":J},bind:function(bG,self,bH){var bI=Array.prototype.slice.call(arguments,2,arguments.length);
return function(){var bJ=Array.prototype.slice.call(arguments,0,arguments.length);
return bG.apply(self,bI.concat(bJ));
};
},firstUp:function(bK){return bK.charAt(0).toUpperCase()+bK.substr(1);
},firstLow:function(bL){return bL.charAt(0).toLowerCase()+bL.substr(1);
},getClass:function(bM){var bN=Object.prototype.toString.call(bM);
return (qx.Bootstrap.__hu[bN]||bN.slice(8,-1));
},isString:function(bO){return (bO!==null&&(typeof bO===E||qx.Bootstrap.getClass(bO)==e||bO instanceof String||(!!bO&&!!bO.$$isString)));
},isArray:function(bP){return (bP!==null&&(bP instanceof Array||(bP&&qx.data&&qx.data.IListData&&qx.util.OOUtil.hasInterface(bP.constructor,qx.data.IListData))||qx.Bootstrap.getClass(bP)==g||(!!bP&&!!bP.$$isArray)));
},isObject:function(bQ){return (bQ!==undefined&&bQ!==null&&qx.Bootstrap.getClass(bQ)==j);
},isFunction:function(bR){return qx.Bootstrap.getClass(bR)==d;
},classIsDefined:function(name){return qx.Bootstrap.getByName(name)!==undefined;
},getPropertyDefinition:function(bS,name){while(bS){if(bS.$$properties&&bS.$$properties[name]){return bS.$$properties[name];
}bS=bS.superclass;
}return null;
},hasProperty:function(bT,name){return !!qx.Bootstrap.getPropertyDefinition(bT,name);
},getEventType:function(bU,name){var bU=bU.constructor;

while(bU.superclass){if(bU.$$events&&bU.$$events[name]!==undefined){return bU.$$events[name];
}bU=bU.superclass;
}return null;
},supportsEvent:function(bV,name){return !!qx.Bootstrap.getEventType(bV,name);
},getByInterface:function(bW,bX){var bY,i,l;

while(bW){if(bW.$$implements){bY=bW.$$flatImplements;

for(i=0,l=bY.length;i<l;i++){if(bY[i]===bX){return bW;
}}}bW=bW.superclass;
}return null;
},hasInterface:function(ca,cb){return !!qx.Bootstrap.getByInterface(ca,cb);
},getMixins:function(cc){var cd=[];

while(cc){if(cc.$$includes){cd.push.apply(cd,cc.$$flatIncludes);
}cc=cc.superclass;
}return cd;
},$$logs:[],debug:function(ce,cf){qx.Bootstrap.$$logs.push([A,arguments]);
},info:function(cg,ch){qx.Bootstrap.$$logs.push([t,arguments]);
},warn:function(ci,cj){qx.Bootstrap.$$logs.push([H,arguments]);
},error:function(ck,cl){qx.Bootstrap.$$logs.push([v,arguments]);
},trace:function(cm){}}});
})();
(function(){var a="qx.util.OOUtil";
qx.Bootstrap.define(a,{statics:{classIsDefined:qx.Bootstrap.classIsDefined,getPropertyDefinition:qx.Bootstrap.getPropertyDefinition,hasProperty:qx.Bootstrap.hasProperty,getEventType:qx.Bootstrap.getEventType,supportsEvent:qx.Bootstrap.supportsEvent,getByInterface:qx.Bootstrap.getByInterface,hasInterface:qx.Bootstrap.hasInterface,getMixins:qx.Bootstrap.getMixins}});
})();
(function(){var h="qx.Mixin",g=".prototype",f="constructor",e="Array",d="[Mixin ",c="]",b="destruct",a="Mixin";
qx.Bootstrap.define(h,{statics:{define:function(name,j){if(j){if(j.include&&!(qx.Bootstrap.getClass(j.include)===e)){j.include=[j.include];
}var m=j.statics?j.statics:{};
qx.Bootstrap.setDisplayNames(m,name);

for(var k in m){if(m[k] instanceof Function){m[k].$$mixin=m;
}}if(j.construct){m.$$constructor=j.construct;
qx.Bootstrap.setDisplayName(j.construct,name,f);
}
if(j.include){m.$$includes=j.include;
}
if(j.properties){m.$$properties=j.properties;
}
if(j.members){m.$$members=j.members;
qx.Bootstrap.setDisplayNames(j.members,name+g);
}
for(var k in m.$$members){if(m.$$members[k] instanceof Function){m.$$members[k].$$mixin=m;
}}
if(j.events){m.$$events=j.events;
}
if(j.destruct){m.$$destructor=j.destruct;
qx.Bootstrap.setDisplayName(j.destruct,name,b);
}}else{var m={};
}m.$$type=a;
m.name=name;
m.toString=this.genericToString;
m.basename=qx.Bootstrap.createNamespace(name,m);
this.$$registry[name]=m;
return m;
},checkCompatibility:function(n){var q=this.flatten(n);
var r=q.length;

if(r<2){return true;
}var u={};
var t={};
var s={};
var p;

for(var i=0;i<r;i++){p=q[i];

for(var o in p.events){if(s[o]){throw new Error('Conflict between mixin "'+p.name+'" and "'+s[o]+'" in member "'+o+'"!');
}s[o]=p.name;
}
for(var o in p.properties){if(u[o]){throw new Error('Conflict between mixin "'+p.name+'" and "'+u[o]+'" in property "'+o+'"!');
}u[o]=p.name;
}
for(var o in p.members){if(t[o]){throw new Error('Conflict between mixin "'+p.name+'" and "'+t[o]+'" in member "'+o+'"!');
}t[o]=p.name;
}}return true;
},isCompatible:function(v,w){var x=qx.util.OOUtil.getMixins(w);
x.push(v);
return qx.Mixin.checkCompatibility(x);
},getByName:function(name){return this.$$registry[name];
},isDefined:function(name){return this.getByName(name)!==undefined;
},getTotalNumber:function(){return qx.Bootstrap.objectGetLength(this.$$registry);
},flatten:function(y){if(!y){return [];
}var z=y.concat();

for(var i=0,l=y.length;i<l;i++){if(y[i].$$includes){z.push.apply(z,this.flatten(y[i].$$includes));
}}return z;
},genericToString:function(){return d+this.name+c;
},$$registry:{},__go:null,__gq:function(){}}});
})();
(function(){var cq="qx.bom.client.CssTransform.get3D",cp="default",co="|",cn="qx.allowUrlSettings",cm="qx.bom.client.Stylesheet.getInsertRule",cl="css.transform.3d",ck="qx.bom.client.Html.getDataset",cj="qx.bom.client.PhoneGap.getPhoneGap",ci="qx.bom.client.Html.getAudioAif",ch="qx.debug.dispose",bt="qx.bom.client.Xml.getAttributeNS",bs="qx.bom.client.Stylesheet.getRemoveImport",br="qx.bom.client.Css.getUserModify",bq="qx.bom.client.Css.getBoxShadow",bp="qx.bom.client.Event.getHashChange",bo="qx.bom.client.Plugin.getWindowsMedia",bn="qx.bom.client.Html.getVideo",bm="qx.bom.client.Device.getName",bl="qx.bom.client.Event.getTouch",bk="qx.optimization.strings",cx="qx.optimization.variables",cy="qx.bom.client.EcmaScript.getStackTrace",cv="qx.bom.client.EcmaScript.getObjectCount",cw="qx.bom.client.Xml.getSelectSingleNode",ct="css.gradient.linear",cu="qx.bom.client.Xml.getImplementation",cr="qx.bom.client.Html.getConsole",cs="qx.bom.client.Engine.getVersion",cz="qx.bom.client.Plugin.getQuicktime",cA="qx.propertyDebugLevel",bR="qx.bom.client.Html.getNaturalDimensions",bQ="qx.bom.client.Xml.getSelectNodes",bT="qx.bom.client.Xml.getElementsByTagNameNS",bS="qx.bom.client.Html.getDataUrl",bV="qx.bom.client.Flash.isAvailable",bU="qx.bom.client.Html.getCanvas",bX="qx.bom.client.Css.getBoxModel",bW="qx.bom.client.Plugin.getSilverlight",bP="qx.bom.client.Css.getUserSelect",bO="qx.bom.client.Css.getRadialGradient",a="module.property",b="qx.bom.client.Plugin.getWindowsMediaVersion",c="qx.bom.client.Stylesheet.getCreateStyleSheet",d="qx.bom.client.Locale.getLocale",e="module.events",f="module.databinding",g="qx.bom.client.Html.getFileReader",h="qx.bom.client.Css.getBorderImage",j="qx.bom.client.Stylesheet.getDeleteRule",k="qx.bom.client.Plugin.getDivXVersion",cE="qx.bom.client.Scroll.scrollBarOverlayed",cD="qx.bom.client.Plugin.getPdfVersion",cC=":",cB="qx.bom.client.Css.getLinearGradient",cI="qx.bom.client.Transport.getXmlHttpRequest",cH="qx.bom.client.Html.getClassList",cG="qx.bom.client.Event.getHelp",cF="qx.optimization.comments",cK="qx.bom.client.Locale.getVariant",cJ="qx.bom.client.Css.getBoxSizing",J="qx.bom.client.OperatingSystem.getName",K="module.logger",H="qx.bom.client.Css.getOverflowXY",I="qx.mobile.emulatetouch",N="qx.bom.client.Html.getAudioWav",O="qx.bom.client.Browser.getName",L="qx.bom.client.Css.getInlineBlock",M="qx.bom.client.Plugin.getPdf",F="qx.dynlocale",G="qx.bom.client.Html.getAudio",s="qx.core.Environment",r="qx.bom.client.CssTransform.getSupport",u="qx.bom.client.Html.getTextContent",t="qx.bom.client.Css.getPlaceholder",o="qx.bom.client.Css.getFloat",n="false",q="qx.bom.client.Html.getXul",p="qx.bom.client.Xml.getCreateNode",m="qxenv",l="qx.bom.client.Html.getSessionStorage",T="qx.bom.client.Html.getAudioAu",U="qx.bom.client.Css.getOpacity",V="qx.bom.client.Html.getVml",W="qx.bom.client.Css.getRgba",P="qx.bom.client.Transport.getMaxConcurrentRequestCount",Q="qx.bom.client.Css.getBorderRadius",R="qx.bom.client.Event.getPointer",S="qx.bom.client.Css.getGradients",X="qx.bom.client.Transport.getSsl",Y="qx.bom.client.Html.getWebWorker",C="qx.bom.client.Json.getJson",B="qx.bom.client.Browser.getQuirksMode",A="qx.bom.client.Css.getTextOverflow",z="qx.bom.client.Xml.getQualifiedItem",y="qx.bom.client.Html.getVideoOgg",x="&",w="qx.bom.client.Browser.getDocumentMode",v="qx.allowUrlVariants",E="qx.bom.client.Html.getContains",D="qx.bom.client.Plugin.getActiveX",ba=".",bb="qx.bom.client.Xml.getDomProperties",bc="qx.bom.client.CssAnimation.getSupport",bd="qx.debug.databinding",be="qx.optimization.basecalls",bf="qx.bom.client.Browser.getVersion",bg="qx.bom.client.Css.getUserSelectNone",bh="true",bi="qx.bom.client.Html.getSvg",bj="qx.optimization.privates",bx="qx.bom.client.Plugin.getDivX",bw="qx.bom.client.Runtime.getName",bv="qx.bom.client.Html.getLocalStorage",bu="qx.bom.client.Flash.getStrictSecurityModel",bB="qx.aspects",bA="qx.debug",bz="qx.dynamicmousewheel",by="qx.bom.client.Html.getAudioMp3",bD="qx.bom.client.Engine.getName",bC="qx.bom.client.Plugin.getGears",bK="qx.bom.client.Plugin.getQuicktimeVersion",bL="qx.bom.client.Html.getAudioOgg",bI="qx.bom.client.Plugin.getSilverlightVersion",bJ="qx.bom.client.Html.getCompareDocumentPosition",bG="qx.bom.client.Flash.getExpressInstall",bH="qx.bom.client.OperatingSystem.getVersion",bE="qx.bom.client.Html.getXPath",bF="qx.bom.client.Html.getGeoLocation",bM="qx.bom.client.Css.getAppearance",bN="qx.mobile.nativescroll",ca="qx.bom.client.Xml.getDomParser",bY="qx.bom.client.Stylesheet.getAddImport",cc="qx.optimization.variants",cb="qx.bom.client.Html.getVideoWebm",ce="qx.bom.client.Flash.getVersion",cd="qx.bom.client.PhoneGap.getNotification",cg="qx.bom.client.Html.getVideoH264",cf="qx.bom.client.Xml.getCreateElementNS";
qx.Bootstrap.define(s,{statics:{_checks:{},_asyncChecks:{},__cQ:{},_checksMap:{"engine.version":cs,"engine.name":bD,"browser.name":O,"browser.version":bf,"browser.documentmode":w,"browser.quirksmode":B,"runtime.name":bw,"device.name":bm,"locale":d,"locale.variant":cK,"os.name":J,"os.version":bH,"os.scrollBarOverlayed":cE,"plugin.gears":bC,"plugin.activex":D,"plugin.quicktime":cz,"plugin.quicktime.version":bK,"plugin.windowsmedia":bo,"plugin.windowsmedia.version":b,"plugin.divx":bx,"plugin.divx.version":k,"plugin.silverlight":bW,"plugin.silverlight.version":bI,"plugin.flash":bV,"plugin.flash.version":ce,"plugin.flash.express":bG,"plugin.flash.strictsecurity":bu,"plugin.pdf":M,"plugin.pdf.version":cD,"io.maxrequests":P,"io.ssl":X,"io.xhr":cI,"event.touch":bl,"event.pointer":R,"event.help":cG,"event.hashchange":bp,"ecmascript.objectcount":cv,"ecmascript.stacktrace":cy,"html.webworker":Y,"html.filereader":g,"html.geolocation":bF,"html.audio":G,"html.audio.ogg":bL,"html.audio.mp3":by,"html.audio.wav":N,"html.audio.au":T,"html.audio.aif":ci,"html.video":bn,"html.video.ogg":y,"html.video.h264":cg,"html.video.webm":cb,"html.storage.local":bv,"html.storage.session":l,"html.classlist":cH,"html.xpath":bE,"html.xul":q,"html.canvas":bU,"html.svg":bi,"html.vml":V,"html.dataset":ck,"html.dataurl":bS,"html.console":cr,"html.stylesheet.createstylesheet":c,"html.stylesheet.insertrule":cm,"html.stylesheet.deleterule":j,"html.stylesheet.addimport":bY,"html.stylesheet.removeimport":bs,"html.element.contains":E,"html.element.compareDocumentPosition":bJ,"html.element.textcontent":u,"html.image.naturaldimensions":bR,"json":C,"css.textoverflow":A,"css.placeholder":t,"css.borderradius":Q,"css.borderimage":h,"css.boxshadow":bq,"css.gradients":S,"css.gradient.linear":cB,"css.gradient.radial":bO,"css.boxmodel":bX,"css.rgba":W,"css.userselect":bP,"css.userselect.none":bg,"css.usermodify":br,"css.appearance":bM,"css.float":o,"css.boxsizing":cJ,"css.translate3d":cq,"css.animation":bc,"css.transform":r,"css.transform.3d":cq,"css.inlineblock":L,"css.opacity":U,"css.overflowxy":H,"phonegap":cj,"phonegap.notification":cd,"xml.implementation":cu,"xml.domparser":ca,"xml.selectsinglenode":cw,"xml.selectnodes":bQ,"xml.getelementsbytagnamens":bT,"xml.domproperties":bb,"xml.attributens":bt,"xml.createnode":p,"xml.getqualifieditem":z,"xml.createelementns":cf},get:function(cL){if(qx.Bootstrap.DEBUG){var cN={"css.translate3d":cl,"css.gradients":ct,"ecmascript.objectcount":null};

if(cL in cN){qx.Bootstrap.warn("The key '"+cL+"' is deprecated."+(cN[cL]?" Please use '"+cN[cL]+"' instead.":""));
}}if(this.__cQ[cL]!=undefined){return this.__cQ[cL];
}var cP=this._checks[cL];

if(cP){var cO=cP();
this.__cQ[cL]=cO;
return cO;
}var cM=this._getClassNameFromEnvKey(cL);

if(cM[0]!=undefined){var cQ=cM[0];
var cR=cM[1];
var cO=cQ[cR]();
this.__cQ[cL]=cO;
return cO;
}if(qx.Bootstrap.DEBUG){qx.Bootstrap.warn(cL+" is not a valid key. Please see the API-doc of "+"qx.core.Environment for a list of predefined keys.");
qx.Bootstrap.trace(this);
}},_getClassNameFromEnvKey:function(cS){var cY=this._checksMap;

if(cY[cS]!=undefined){var cU=cY[cS];
var cX=cU.lastIndexOf(ba);

if(cX>-1){var cW=cU.slice(0,cX);
var cT=cU.slice(cX+1);
var cV=qx.Bootstrap.getByName(cW);

if(cV!=undefined){return [cV,cT];
}}}return [undefined,undefined];
},getAsync:function(da,db,self){var df=this;

if(this.__cQ[da]!=undefined){window.setTimeout(function(){db.call(self,df.__cQ[da]);
},0);
return;
}var de=this._asyncChecks[da];

if(de){de(function(dh){df.__cQ[da]=dh;
db.call(self,dh);
});
return;
}var dd=this._getClassNameFromEnvKey(da);

if(dd[0]!=undefined){var dg=dd[0];
var dc=dd[1];
dg[dc](function(di){df.__cQ[da]=di;
db.call(self,di);
});
return;
}if(qx.Bootstrap.DEBUG){qx.Bootstrap.warn(da+" is not a valid key. Please see the API-doc of "+"qx.core.Environment for a list of predefined keys.");
qx.Bootstrap.trace(this);
}},select:function(dj,dk){return this.__cR(this.get(dj),dk);
},selectAsync:function(dl,dm,self){this.getAsync(dl,function(dn){var dp=this.__cR(dl,dm);
dp.call(self,dn);
},this);
},__cR:function(dq,dr){var dt=dr[dq];

if(dr.hasOwnProperty(dq)){return dt;
}for(var ds in dr){if(ds.indexOf(co)!=-1){var du=ds.split(co);

for(var i=0;i<du.length;i++){if(du[i]==dq){return dr[ds];
}}}}
if(dr[cp]!==undefined){return dr[cp];
}
if(qx.Bootstrap.DEBUG){throw new Error('No match for variant "'+dq+'" ('+(typeof dq)+' type)'+' in variants ['+qx.Bootstrap.getKeysAsString(dr)+'] found, and no default ("default") given');
}},filter:function(dv){var dx=[];

for(var dw in dv){if(this.get(dw)){dx.push(dv[dw]);
}}return dx;
},invalidateCacheKey:function(dy){delete this.__cQ[dy];
},add:function(dz,dA){if(this._checks[dz]==undefined){if(dA instanceof Function){this._checks[dz]=dA;
}else{this._checks[dz]=this.__cU(dA);
}}},addAsync:function(dB,dC){if(this._checks[dB]==undefined){this._asyncChecks[dB]=dC;
}},getChecks:function(){return this._checks;
},getAsyncChecks:function(){return this._asyncChecks;
},_initDefaultQxValues:function(){this.add(cn,function(){return false;
});
this.add(v,function(){return false;
});
this.add(cA,function(){return 0;
});
this.add(bA,function(){return true;
});
this.add(bB,function(){return false;
});
this.add(F,function(){return true;
});
this.add(I,function(){return false;
});
this.add(bN,function(){return false;
});
this.add(bz,function(){return true;
});
this.add(bd,function(){return false;
});
this.add(ch,function(){return false;
});
this.add(be,function(){return false;
});
this.add(cF,function(){return false;
});
this.add(bj,function(){return false;
});
this.add(bk,function(){return false;
});
this.add(cx,function(){return false;
});
this.add(cc,function(){return false;
});
this.add(f,function(){return true;
});
this.add(K,function(){return true;
});
this.add(a,function(){return true;
});
this.add(e,function(){return true;
});
},__cS:function(){if(qx&&qx.$$environment){for(var dE in qx.$$environment){var dD=qx.$$environment[dE];
this._checks[dE]=this.__cU(dD);
}}},__cT:function(){if(window.document&&window.document.location){var dF=window.document.location.search.slice(1).split(x);

for(var i=0;i<dF.length;i++){var dH=dF[i].split(cC);

if(dH.length!=3||dH[0]!=m){continue;
}var dI=dH[1];
var dG=decodeURIComponent(dH[2]);
if(dG==bh){dG=true;
}else if(dG==n){dG=false;
}else if(/^(\d|\.)+$/.test(dG)){dG=parseFloat(dG);
}this._checks[dI]=this.__cU(dG);
}}},__cU:function(dJ){return qx.Bootstrap.bind(function(dK){return dK;
},null,dJ);
}},defer:function(dL){dL._initDefaultQxValues();
dL.__cS();
if(dL.get(cn)===true){dL.__cT();
}}});
})();
(function(){var d="qx.core.Aspect",c="before",b="*",a="static";
qx.Bootstrap.define(d,{statics:{__hv:[],wrap:function(e,f,g){var m=[];
var h=[];
var l=this.__hv;
var k;

for(var i=0;i<l.length;i++){k=l[i];

if((k.type==null||g==k.type||k.type==b)&&(k.name==null||e.match(k.name))){k.pos==-1?m.push(k.fcn):h.push(k.fcn);
}}
if(m.length===0&&h.length===0){return f;
}var j=function(){for(var i=0;i<m.length;i++){m[i].call(this,e,f,g,arguments);
}var n=f.apply(this,arguments);

for(var i=0;i<h.length;i++){h[i].call(this,e,f,g,arguments,n);
}return n;
};

if(g!==a){j.self=f.self;
j.base=f.base;
}f.wrapper=j;
j.original=f;
return j;
},addAdvice:function(o,p,q,name){this.__hv.push({fcn:o,pos:p===c?-1:1,type:q,name:name});
}}});
})();
(function(){var j="function",h="Boolean",g="qx.Interface",f="Array",e="]",d="toggle",c="Interface",b="is",a="[Interface ";
qx.Bootstrap.define(g,{statics:{define:function(name,k){if(k){if(k.extend&&!(qx.Bootstrap.getClass(k.extend)===f)){k.extend=[k.extend];
}var m=k.statics?k.statics:{};
if(k.extend){m.$$extends=k.extend;
}
if(k.properties){m.$$properties=k.properties;
}
if(k.members){m.$$members=k.members;
}
if(k.events){m.$$events=k.events;
}}else{var m={};
}m.$$type=c;
m.name=name;
m.toString=this.genericToString;
m.basename=qx.Bootstrap.createNamespace(name,m);
qx.Interface.$$registry[name]=m;
return m;
},getByName:function(name){return this.$$registry[name];
},isDefined:function(name){return this.getByName(name)!==undefined;
},getTotalNumber:function(){return qx.Bootstrap.objectGetLength(this.$$registry);
},flatten:function(n){if(!n){return [];
}var o=n.concat();

for(var i=0,l=n.length;i<l;i++){if(n[i].$$extends){o.push.apply(o,this.flatten(n[i].$$extends));
}}return o;
},__kf:function(p,q,r,s){var w=r.$$members;

if(w){for(var v in w){if(qx.Bootstrap.isFunction(w[v])){var u=this.__kg(q,v);
var t=u||qx.Bootstrap.isFunction(p[v]);

if(!t){throw new Error('Implementation of method "'+v+'" is missing in class "'+q.classname+'" required by interface "'+r.name+'"');
}var x=s===true&&!u&&!qx.util.OOUtil.hasInterface(q,r);

if(x){p[v]=this.__kj(r,p[v],v,w[v]);
}}else{if(typeof p[v]===undefined){if(typeof p[v]!==j){throw new Error('Implementation of member "'+v+'" is missing in class "'+q.classname+'" required by interface "'+r.name+'"');
}}}}}},__kg:function(y,z){var D=z.match(/^(is|toggle|get|set|reset)(.*)$/);

if(!D){return false;
}var A=qx.Bootstrap.firstLow(D[2]);
var B=qx.util.OOUtil.getPropertyDefinition(y,A);

if(!B){return false;
}var C=D[0]==b||D[0]==d;

if(C){return qx.util.OOUtil.getPropertyDefinition(y,A).check==h;
}return true;
},__kh:function(E,F){if(F.$$properties){for(var G in F.$$properties){if(!qx.util.OOUtil.getPropertyDefinition(E,G)){throw new Error('The property "'+G+'" is not supported by Class "'+E.classname+'"!');
}}}},__ki:function(H,I){if(I.$$events){for(var J in I.$$events){if(!qx.util.OOUtil.supportsEvent(H,J)){throw new Error('The event "'+J+'" is not supported by Class "'+H.classname+'"!');
}}}},assertObject:function(K,L){var N=K.constructor;
this.__kf(K,N,L,false);
this.__kh(N,L);
this.__ki(N,L);
var M=L.$$extends;

if(M){for(var i=0,l=M.length;i<l;i++){this.assertObject(K,M[i]);
}}},assert:function(O,P,Q){this.__kf(O.prototype,O,P,Q);
this.__kh(O,P);
this.__ki(O,P);
var R=P.$$extends;

if(R){for(var i=0,l=R.length;i<l;i++){this.assert(O,R[i],Q);
}}},genericToString:function(){return a+this.name+e;
},$$registry:{},__kj:function(){},__go:null,__gq:function(){}}});
})();
(function(){var g="emulated",f="native",e='"',d="[object Error]",c="qx.lang.Core",b="\\\\",a="\\\"";
qx.Bootstrap.define(c,{statics:{errorToString:{"native":Error.prototype.toString,"emulated":function(){return this.message;
}}[(!Error.prototype.toString||Error.prototype.toString()==d)?g:f],arrayIndexOf:{"native":Array.prototype.indexOf,"emulated":function(h,j){if(j==null){j=0;
}else if(j<0){j=Math.max(0,this.length+j);
}
for(var i=j;i<this.length;i++){if(this[i]===h){return i;
}}return -1;
}}[Array.prototype.indexOf?f:g],arrayLastIndexOf:{"native":Array.prototype.lastIndexOf,"emulated":function(k,m){if(m==null){m=this.length-1;
}else if(m<0){m=Math.max(0,this.length+m);
}
for(var i=m;i>=0;i--){if(this[i]===k){return i;
}}return -1;
}}[Array.prototype.lastIndexOf?f:g],arrayForEach:{"native":Array.prototype.forEach,"emulated":function(n,o){var l=this.length;

for(var i=0;i<l;i++){var p=this[i];

if(p!==undefined){n.call(o||window,p,i,this);
}}}}[Array.prototype.forEach?f:g],arrayFilter:{"native":Array.prototype.filter,"emulated":function(q,r){var s=[];
var l=this.length;

for(var i=0;i<l;i++){var t=this[i];

if(t!==undefined){if(q.call(r||window,t,i,this)){s.push(this[i]);
}}}return s;
}}[Array.prototype.filter?f:g],arrayMap:{"native":Array.prototype.map,"emulated":function(u,v){var w=[];
var l=this.length;

for(var i=0;i<l;i++){var x=this[i];

if(x!==undefined){w[i]=u.call(v||window,x,i,this);
}}return w;
}}[Array.prototype.map?f:g],arraySome:{"native":Array.prototype.some,"emulated":function(y,z){var l=this.length;

for(var i=0;i<l;i++){var A=this[i];

if(A!==undefined){if(y.call(z||window,A,i,this)){return true;
}}}return false;
}}[Array.prototype.some?f:g],arrayEvery:{"native":Array.prototype.every,"emulated":function(B,C){var l=this.length;

for(var i=0;i<l;i++){var D=this[i];

if(D!==undefined){if(!B.call(C||window,D,i,this)){return false;
}}}return true;
}}[Array.prototype.every?f:g],stringQuote:{"native":String.prototype.quote,"emulated":function(){return e+this.replace(/\\/g,b).replace(/\"/g,a)+e;
}}[String.prototype.quote?f:g]}});
if(!Error.prototype.toString||Error.prototype.toString()==d){Error.prototype.toString=qx.lang.Core.errorToString;
}if(!Array.prototype.indexOf){Array.prototype.indexOf=qx.lang.Core.arrayIndexOf;
}
if(!Array.prototype.lastIndexOf){Array.prototype.lastIndexOf=qx.lang.Core.arrayLastIndexOf;
}
if(!Array.prototype.forEach){Array.prototype.forEach=qx.lang.Core.arrayForEach;
}
if(!Array.prototype.filter){Array.prototype.filter=qx.lang.Core.arrayFilter;
}
if(!Array.prototype.map){Array.prototype.map=qx.lang.Core.arrayMap;
}
if(!Array.prototype.some){Array.prototype.some=qx.lang.Core.arraySome;
}
if(!Array.prototype.every){Array.prototype.every=qx.lang.Core.arrayEvery;
}if(!String.prototype.quote){String.prototype.quote=qx.lang.Core.stringQuote;
}})();
(function(){var cz=';',cy='computed=this.',cx='=value;',cw='this.',cv="set",cu="setThemed",ct="setRuntime",cs="init",cr='if(this.',cq='delete this.',bA='!==undefined)',bz='}',by="resetThemed",bx='else if(this.',bw="string",bv='return this.',bu="reset",bt="boolean",bs="resetRuntime",br='!==undefined){',cG="",cH="refresh",cE='=true;',cF="this.",cC=";",cD='old=this.',cA="();",cB='else ',cI='if(old===undefined)old=this.',cJ='old=computed=this.',bY="return this.",bX="get",cb='(value);',ca="(a[",cd='if(old===computed)return value;',cc='if(old===undefined)old=null;',cf=' of an instance of ',ce=' is not (yet) ready!");',bW="]);",bV='!==inherit){',g='qx.lang.Type.isString(value) && qx.util.ColorUtil.isValidPropertyValue(value)',h='value !== null && qx.theme.manager.Font.getInstance().isDynamic(value)',j='value !== null && value.nodeType === 9 && value.documentElement',k='===value)return value;',m='value !== null && value.$$type === "Mixin"',n='return init;',o='var init=this.',p='value !== null && value.nodeType === 1 && value.attributes',q="var parent = this.getLayoutParent();",r="Error in property ",cX='var a=this._getChildren();if(a)for(var i=0,l=a.length;i<l;i++){',cW="property",cV='.validate.call(this, value);',cU='qx.core.Assert.assertInstance(value, Date, msg) || true',dc='else{',db="if (!parent) return;",da=" in method ",cY='qx.core.Assert.assertInstance(value, Error, msg) || true',de='=computed;',dd='Undefined value is not allowed!',Q='(backup);',R="MSIE 6.0",O='if(computed===inherit){',P="inherit",U='Is invalid!',V='if(value===undefined)prop.error(this,2,"',S='var computed, old=this.',T='else if(computed===undefined)',M="': ",N=" of class ",z='value !== null && value.nodeType !== undefined',y='===undefined)return;',B='value !== null && qx.theme.manager.Decoration.getInstance().isValidPropertyValue(value)',A="')){",v="module.events",u='qx.core.Assert.assertPositiveInteger(value, msg) || true',x='else this.',w='value=this.',t='","',s='if(init==qx.core.Property.$$inherit)init=null;',bb='value !== null && value.$$type === "Interface"',bc='var inherit=prop.$$inherit;',bd="', qx.event.type.Data, [computed, old]",be="var value = parent.",W="$$useinit_",X='computed=undefined;delete this.',Y="(value);",ba='Requires exactly one argument!',bf='",value);',bg='computed=value;',J='}else{',I="$$runtime_",H=';}',G="$$user_",F='){',E='qx.core.Assert.assertArray(value, msg) || true',D='if(computed===undefined||computed===inherit){',C='qx.core.Assert.assertPositiveNumber(value, msg) || true',L=".prototype",K="Boolean",bh=")}",bi='(computed, old, "',bj='return value;',bk='if(init==qx.core.Property.$$inherit)throw new Error("Inheritable property ',bl="if(reg.hasListener(this, '",bm='Does not allow any arguments!',bn=')a[i].',bo="()",bp="var a=arguments[0] instanceof Array?arguments[0]:arguments;",bq='.$$properties.',bE='value !== null && value.$$type === "Theme"',bD="var reg=qx.event.Registration;",bC="())",bB='return null;',bI='qx.core.Assert.assertObject(value, msg) || true',bH='");',bG='qx.core.Assert.assertString(value, msg) || true',bF='var pa=this.getLayoutParent();if(pa)computed=pa.',bK="if (value===undefined) value = parent.",bJ='value !== null && value.$$type === "Class"',bR='qx.core.Assert.assertFunction(value, msg) || true',bS='!==undefined&&',bP='var computed, old;',bQ='var backup=computed;',bN=".",bO="object",bL="$$init_",bM="$$theme_",bT='if(computed===undefined)computed=null;',bU='qx.core.Assert.assertMap(value, msg) || true',cj="qx.aspects",ci='qx.core.Assert.assertNumber(value, msg) || true',cl='if((computed===undefined||computed===inherit)&&',ck="reg.fireEvent(this, '",cn='Null value is not allowed!',cm='qx.core.Assert.assertInteger(value, msg) || true',cp="value",co="rv:1.8.1",ch="shorthand",cg='qx.core.Assert.assertInstance(value, RegExp, msg) || true',cQ='value !== null && value.type !== undefined',cR='value !== null && value.document',cS='throw new Error("Property ',cT="(!this.",cM='qx.core.Assert.assertBoolean(value, msg) || true',cN='if(a[i].',cO="toggle",cP="$$inherit_",cK='var prop=qx.core.Property;',cL=" with incoming value '",f="a=qx.lang.Array.fromShortHand(qx.lang.Array.fromArguments(a));",e='if(computed===undefined||computed==inherit)computed=null;',d="qx.core.Property",c="is",b='Could not change or apply init value after constructing phase!';
qx.Bootstrap.define(d,{statics:{__fQ:function(){if(qx.core.Environment.get(v)){qx.event.type.Data;
qx.event.dispatch.Direct;
}},__fR:{"Boolean":cM,"String":bG,"Number":ci,"Integer":cm,"PositiveNumber":C,"PositiveInteger":u,"Error":cY,"RegExp":cg,"Object":bI,"Array":E,"Map":bU,"Function":bR,"Date":cU,"Node":z,"Element":p,"Document":j,"Window":cR,"Event":cQ,"Class":bJ,"Mixin":m,"Interface":bb,"Theme":bE,"Color":g,"Decorator":B,"Font":h},__fS:{"Node":true,"Element":true,"Document":true,"Window":true,"Event":true},$$inherit:P,$$store:{runtime:{},user:{},theme:{},inherit:{},init:{},useinit:{}},$$method:{get:{},set:{},reset:{},init:{},refresh:{},setRuntime:{},resetRuntime:{},setThemed:{},resetThemed:{}},$$allowedKeys:{name:bw,dereference:bt,inheritable:bt,nullable:bt,themeable:bt,refine:bt,init:null,apply:bw,event:bw,check:null,transform:bw,deferredInit:bt,validate:null},$$allowedGroupKeys:{name:bw,group:bO,mode:bw,themeable:bt},$$inheritable:{},__fT:function(df){var dg=this.__fU(df);

if(!dg.length){var dh=function(){};
}else{dh=this.__fV(dg);
}df.prototype.$$refreshInheritables=dh;
},__fU:function(di){var dk=[];

while(di){var dj=di.$$properties;

if(dj){for(var name in this.$$inheritable){if(dj[name]&&dj[name].inheritable){dk.push(name);
}}}di=di.superclass;
}return dk;
},__fV:function(dl){var dq=this.$$store.inherit;
var dp=this.$$store.init;
var dn=this.$$method.refresh;
var dm=[q,db];

for(var i=0,l=dl.length;i<l;i++){var name=dl[i];
dm.push(be,dq[name],cC,bK,dp[name],cC,cF,dn[name],Y);
}return new Function(dm.join(cG));
},attachRefreshInheritables:function(dr){dr.prototype.$$refreshInheritables=function(){qx.core.Property.__fT(dr);
return this.$$refreshInheritables();
};
},attachMethods:function(ds,name,dt){dt.group?this.__fW(ds,dt,name):this.__fX(ds,dt,name);
},__fW:function(du,dv,name){var dC=qx.Bootstrap.firstUp(name);
var dB=du.prototype;
var dD=dv.themeable===true;
var dE=[];
var dy=[];

if(dD){var dw=[];
var dA=[];
}var dz=bp;
dE.push(dz);

if(dD){dw.push(dz);
}
if(dv.mode==ch){var dx=f;
dE.push(dx);

if(dD){dw.push(dx);
}}
for(var i=0,a=dv.group,l=a.length;i<l;i++){dE.push(cF,this.$$method.set[a[i]],ca,i,bW);
dy.push(cF,this.$$method.reset[a[i]],cA);

if(dD){dw.push(cF,this.$$method.setThemed[a[i]],ca,i,bW);
dA.push(cF,this.$$method.resetThemed[a[i]],cA);
}}this.$$method.set[name]=cv+dC;
dB[this.$$method.set[name]]=new Function(dE.join(cG));
this.$$method.reset[name]=bu+dC;
dB[this.$$method.reset[name]]=new Function(dy.join(cG));

if(dD){this.$$method.setThemed[name]=cu+dC;
dB[this.$$method.setThemed[name]]=new Function(dw.join(cG));
this.$$method.resetThemed[name]=by+dC;
dB[this.$$method.resetThemed[name]]=new Function(dA.join(cG));
}},__fX:function(dF,dG,name){var dI=qx.Bootstrap.firstUp(name);
var dK=dF.prototype;
if(dG.dereference===undefined&&typeof dG.check===bw){dG.dereference=this.__fY(dG.check);
}var dJ=this.$$method;
var dH=this.$$store;
dH.runtime[name]=I+name;
dH.user[name]=G+name;
dH.theme[name]=bM+name;
dH.init[name]=bL+name;
dH.inherit[name]=cP+name;
dH.useinit[name]=W+name;
dJ.get[name]=bX+dI;
dK[dJ.get[name]]=function(){return qx.core.Property.executeOptimizedGetter(this,dF,name,bX);
};
dJ.set[name]=cv+dI;
dK[dJ.set[name]]=function(dL){return qx.core.Property.executeOptimizedSetter(this,dF,name,cv,arguments);
};
dJ.reset[name]=bu+dI;
dK[dJ.reset[name]]=function(){return qx.core.Property.executeOptimizedSetter(this,dF,name,bu);
};

if(dG.inheritable||dG.apply||dG.event||dG.deferredInit){dJ.init[name]=cs+dI;
dK[dJ.init[name]]=function(dM){return qx.core.Property.executeOptimizedSetter(this,dF,name,cs,arguments);
};
}
if(dG.inheritable){dJ.refresh[name]=cH+dI;
dK[dJ.refresh[name]]=function(dN){return qx.core.Property.executeOptimizedSetter(this,dF,name,cH,arguments);
};
}dJ.setRuntime[name]=ct+dI;
dK[dJ.setRuntime[name]]=function(dO){return qx.core.Property.executeOptimizedSetter(this,dF,name,ct,arguments);
};
dJ.resetRuntime[name]=bs+dI;
dK[dJ.resetRuntime[name]]=function(){return qx.core.Property.executeOptimizedSetter(this,dF,name,bs);
};

if(dG.themeable){dJ.setThemed[name]=cu+dI;
dK[dJ.setThemed[name]]=function(dP){return qx.core.Property.executeOptimizedSetter(this,dF,name,cu,arguments);
};
dJ.resetThemed[name]=by+dI;
dK[dJ.resetThemed[name]]=function(){return qx.core.Property.executeOptimizedSetter(this,dF,name,by);
};
}
if(dG.check===K){dK[cO+dI]=new Function(bY+dJ.set[name]+cT+dJ.get[name]+bC);
dK[c+dI]=new Function(bY+dJ.get[name]+bo);
}},__fY:function(dQ){return !!this.__fS[dQ];
},__ga:function(dR){return this.__fS[dR]||qx.util.OOUtil.classIsDefined(dR)||(qx.Interface&&qx.Interface.isDefined(dR));
},__gb:{0:b,1:ba,2:dd,3:bm,4:cn,5:U},error:function(dS,dT,dU,dV,dW){var dX=dS.constructor.classname;
var dY=r+dU+N+dX+da+this.$$method[dV][dU]+cL+dW+M;
throw new Error(dY+(this.__gb[dT]||"Unknown reason: "+dT));
},__gc:function(ea,eb,name,ec,ed,ee){var ef=this.$$method[ec][name];
{eb[ef]=new Function(cp,ed.join(cG));
};
if(qx.core.Environment.get(cj)){eb[ef]=qx.core.Aspect.wrap(ea.classname+bN+ef,eb[ef],cW);
}qx.Bootstrap.setDisplayName(eb[ef],ea.classname+L,ef);
if(ee===undefined){return ea[ef]();
}else{return ea[ef](ee[0]);
}},executeOptimizedGetter:function(eg,eh,name,ei){var ek=eh.$$properties[name];
var em=eh.prototype;
var ej=[];
var el=this.$$store;
ej.push(cr,el.runtime[name],bA);
ej.push(bv,el.runtime[name],cz);

if(ek.inheritable){ej.push(bx,el.inherit[name],bA);
ej.push(bv,el.inherit[name],cz);
ej.push(cB);
}ej.push(cr,el.user[name],bA);
ej.push(bv,el.user[name],cz);

if(ek.themeable){ej.push(bx,el.theme[name],bA);
ej.push(bv,el.theme[name],cz);
}
if(ek.deferredInit&&ek.init===undefined){ej.push(bx,el.init[name],bA);
ej.push(bv,el.init[name],cz);
}ej.push(cB);

if(ek.init!==undefined){if(ek.inheritable){ej.push(o,el.init[name],cz);

if(ek.nullable){ej.push(s);
}else if(ek.init!==undefined){ej.push(bv,el.init[name],cz);
}else{ej.push(bk,name,cf,eh.classname,ce);
}ej.push(n);
}else{ej.push(bv,el.init[name],cz);
}}else if(ek.inheritable||ek.nullable){ej.push(bB);
}else{ej.push(cS,name,cf,eh.classname,ce);
}return this.__gc(eg,em,name,ei,ej);
},executeOptimizedSetter:function(en,eo,name,ep,eq){var ev=eo.$$properties[name];
var eu=eo.prototype;
var es=[];
var er=ep===cv||ep===cu||ep===ct||(ep===cs&&ev.init===undefined);
var et=ev.apply||ev.event||ev.inheritable;
var ew=this.__gd(ep,name);
this.__ge(es,ev,name,ep,er);

if(er){this.__gf(es,eo,ev,name);
}
if(et){this.__gg(es,er,ew,ep);
}
if(ev.inheritable){es.push(bc);
}
if(!et){this.__gi(es,name,ep,er);
}else{this.__gj(es,ev,name,ep,er);
}
if(ev.inheritable){this.__gk(es,ev,name,ep);
}else if(et){this.__gl(es,ev,name,ep);
}
if(et){this.__gm(es,ev,name);
if(ev.inheritable&&eu._getChildren){this.__gn(es,name);
}}if(er){es.push(bj);
}return this.__gc(en,eu,name,ep,es,eq);
},__gd:function(ex,name){if(ex===ct||ex===bs){var ey=this.$$store.runtime[name];
}else if(ex===cu||ex===by){ey=this.$$store.theme[name];
}else if(ex===cs){ey=this.$$store.init[name];
}else{ey=this.$$store.user[name];
}return ey;
},__ge:function(ez,eA,name,eB,eC){{if(!eA.nullable||eA.check||eA.inheritable){ez.push(cK);
}if(eB===cv){ez.push(V,name,t,eB,bf);
}};
},__gf:function(eD,eE,eF,name){if(eF.transform){eD.push(w,eF.transform,cb);
}if(eF.validate){if(typeof eF.validate===bw){eD.push(cw,eF.validate,cb);
}else if(eF.validate instanceof Function){eD.push(eE.classname,bq,name);
eD.push(cV);
}}},__gg:function(eG,eH,eI,eJ){var eK=(eJ===bu||eJ===by||eJ===bs);

if(eH){eG.push(cr,eI,k);
}else if(eK){eG.push(cr,eI,y);
}},__gh:undefined,__gi:function(eL,name,eM,eN){if(eM===ct){eL.push(cw,this.$$store.runtime[name],cx);
}else if(eM===bs){eL.push(cr,this.$$store.runtime[name],bA);
eL.push(cq,this.$$store.runtime[name],cz);
}else if(eM===cv){eL.push(cw,this.$$store.user[name],cx);
}else if(eM===bu){eL.push(cr,this.$$store.user[name],bA);
eL.push(cq,this.$$store.user[name],cz);
}else if(eM===cu){eL.push(cw,this.$$store.theme[name],cx);
}else if(eM===by){eL.push(cr,this.$$store.theme[name],bA);
eL.push(cq,this.$$store.theme[name],cz);
}else if(eM===cs&&eN){eL.push(cw,this.$$store.init[name],cx);
}},__gj:function(eO,eP,name,eQ,eR){if(eP.inheritable){eO.push(S,this.$$store.inherit[name],cz);
}else{eO.push(bP);
}eO.push(cr,this.$$store.runtime[name],br);

if(eQ===ct){eO.push(cy,this.$$store.runtime[name],cx);
}else if(eQ===bs){eO.push(cq,this.$$store.runtime[name],cz);
eO.push(cr,this.$$store.user[name],bA);
eO.push(cy,this.$$store.user[name],cz);
eO.push(bx,this.$$store.theme[name],bA);
eO.push(cy,this.$$store.theme[name],cz);
eO.push(bx,this.$$store.init[name],br);
eO.push(cy,this.$$store.init[name],cz);
eO.push(cw,this.$$store.useinit[name],cE);
eO.push(bz);
}else{eO.push(cJ,this.$$store.runtime[name],cz);
if(eQ===cv){eO.push(cw,this.$$store.user[name],cx);
}else if(eQ===bu){eO.push(cq,this.$$store.user[name],cz);
}else if(eQ===cu){eO.push(cw,this.$$store.theme[name],cx);
}else if(eQ===by){eO.push(cq,this.$$store.theme[name],cz);
}else if(eQ===cs&&eR){eO.push(cw,this.$$store.init[name],cx);
}}eO.push(bz);
eO.push(bx,this.$$store.user[name],br);

if(eQ===cv){if(!eP.inheritable){eO.push(cD,this.$$store.user[name],cz);
}eO.push(cy,this.$$store.user[name],cx);
}else if(eQ===bu){if(!eP.inheritable){eO.push(cD,this.$$store.user[name],cz);
}eO.push(cq,this.$$store.user[name],cz);
eO.push(cr,this.$$store.runtime[name],bA);
eO.push(cy,this.$$store.runtime[name],cz);
eO.push(cr,this.$$store.theme[name],bA);
eO.push(cy,this.$$store.theme[name],cz);
eO.push(bx,this.$$store.init[name],br);
eO.push(cy,this.$$store.init[name],cz);
eO.push(cw,this.$$store.useinit[name],cE);
eO.push(bz);
}else{if(eQ===ct){eO.push(cy,this.$$store.runtime[name],cx);
}else if(eP.inheritable){eO.push(cy,this.$$store.user[name],cz);
}else{eO.push(cJ,this.$$store.user[name],cz);
}if(eQ===cu){eO.push(cw,this.$$store.theme[name],cx);
}else if(eQ===by){eO.push(cq,this.$$store.theme[name],cz);
}else if(eQ===cs&&eR){eO.push(cw,this.$$store.init[name],cx);
}}eO.push(bz);
if(eP.themeable){eO.push(bx,this.$$store.theme[name],br);

if(!eP.inheritable){eO.push(cD,this.$$store.theme[name],cz);
}
if(eQ===ct){eO.push(cy,this.$$store.runtime[name],cx);
}else if(eQ===cv){eO.push(cy,this.$$store.user[name],cx);
}else if(eQ===cu){eO.push(cy,this.$$store.theme[name],cx);
}else if(eQ===by){eO.push(cq,this.$$store.theme[name],cz);
eO.push(cr,this.$$store.init[name],br);
eO.push(cy,this.$$store.init[name],cz);
eO.push(cw,this.$$store.useinit[name],cE);
eO.push(bz);
}else if(eQ===cs){if(eR){eO.push(cw,this.$$store.init[name],cx);
}eO.push(cy,this.$$store.theme[name],cz);
}else if(eQ===cH){eO.push(cy,this.$$store.theme[name],cz);
}eO.push(bz);
}eO.push(bx,this.$$store.useinit[name],F);

if(!eP.inheritable){eO.push(cD,this.$$store.init[name],cz);
}
if(eQ===cs){if(eR){eO.push(cy,this.$$store.init[name],cx);
}else{eO.push(cy,this.$$store.init[name],cz);
}}else if(eQ===cv||eQ===ct||eQ===cu||eQ===cH){eO.push(cq,this.$$store.useinit[name],cz);

if(eQ===ct){eO.push(cy,this.$$store.runtime[name],cx);
}else if(eQ===cv){eO.push(cy,this.$$store.user[name],cx);
}else if(eQ===cu){eO.push(cy,this.$$store.theme[name],cx);
}else if(eQ===cH){eO.push(cy,this.$$store.init[name],cz);
}}eO.push(bz);
if(eQ===cv||eQ===ct||eQ===cu||eQ===cs){eO.push(dc);

if(eQ===ct){eO.push(cy,this.$$store.runtime[name],cx);
}else if(eQ===cv){eO.push(cy,this.$$store.user[name],cx);
}else if(eQ===cu){eO.push(cy,this.$$store.theme[name],cx);
}else if(eQ===cs){if(eR){eO.push(cy,this.$$store.init[name],cx);
}else{eO.push(cy,this.$$store.init[name],cz);
}eO.push(cw,this.$$store.useinit[name],cE);
}eO.push(bz);
}},__gk:function(eS,eT,name,eU){eS.push(D);

if(eU===cH){eS.push(bg);
}else{eS.push(bF,this.$$store.inherit[name],cz);
}eS.push(cl);
eS.push(cw,this.$$store.init[name],bS);
eS.push(cw,this.$$store.init[name],bV);
eS.push(cy,this.$$store.init[name],cz);
eS.push(cw,this.$$store.useinit[name],cE);
eS.push(J);
eS.push(cq,this.$$store.useinit[name],H);
eS.push(bz);
eS.push(cd);
eS.push(O);
eS.push(X,this.$$store.inherit[name],cz);
eS.push(bz);
eS.push(T);
eS.push(cq,this.$$store.inherit[name],cz);
eS.push(x,this.$$store.inherit[name],de);
eS.push(bQ);
if(eT.init!==undefined&&eU!==cs){eS.push(cI,this.$$store.init[name],cC);
}else{eS.push(cc);
}eS.push(e);
},__gl:function(eV,eW,name,eX){if(eX!==cv&&eX!==ct&&eX!==cu){eV.push(bT);
}eV.push(cd);
if(eW.init!==undefined&&eX!==cs){eV.push(cI,this.$$store.init[name],cC);
}else{eV.push(cc);
}},__gm:function(eY,fa,name){if(fa.apply){eY.push(cw,fa.apply,bi,name,bH);
}if(fa.event){eY.push(bD,bl,fa.event,A,ck,fa.event,bd,bh);
}},__gn:function(fb,name){fb.push(cX);
fb.push(cN,this.$$method.refresh[name],bn,this.$$method.refresh[name],Q);
fb.push(bz);
}},defer:function(fc){var fe=navigator.userAgent.indexOf(R)!=-1;
var fd=navigator.userAgent.indexOf(co)!=-1;
if(fe||fd){fc.__fY=fc.__ga;
}}});
})();
(function(){var w="qx.aspects",v=".",u="static",t="constructor",s="Array",r="module.property",q="[Class ",p="]",o="toString",n="$$init_",e=".prototype",m="destructor",h="extend",d="Class",c="destruct",g="qx.Class",f="module.events",j="singleton",b="member",k="qx.event.type.Data";
qx.Bootstrap.define(g,{statics:{__dz:qx.core.Environment.get(r)?qx.core.Property:null,define:function(name,x){if(!x){var x={};
}if(x.include&&!(qx.Bootstrap.getClass(x.include)===s)){x.include=[x.include];
}if(x.implement&&!(qx.Bootstrap.getClass(x.implement)===s)){x.implement=[x.implement];
}var y=false;

if(!x.hasOwnProperty(h)&&!x.type){x.type=u;
y=true;
}var z=this.__gs(name,x.type,x.extend,x.statics,x.construct,x.destruct,x.include);
if(x.extend){if(x.properties){this.__gu(z,x.properties,true);
}if(x.members){this.__gw(z,x.members,true,true,false);
}if(x.events){this.__gt(z,x.events,true);
}if(x.include){for(var i=0,l=x.include.length;i<l;i++){this.__gA(z,x.include[i],false);
}}}if(x.environment){for(var A in x.environment){qx.core.Environment.add(A,x.environment[A]);
}}if(x.implement){for(var i=0,l=x.implement.length;i<l;i++){this.__gy(z,x.implement[i]);
}}if(x.defer){x.defer.self=z;
x.defer(z,z.prototype,{add:function(name,B){var C={};
C[name]=B;
qx.Class.__gu(z,C,true);
}});
}return z;
},undefine:function(name){delete this.$$registry[name];
var D=name.split(v);
var F=[window];

for(var i=0;i<D.length;i++){F.push(F[i][D[i]]);
}for(var i=F.length-1;i>=1;i--){var E=F[i];
var parent=F[i-1];

if(qx.Bootstrap.isFunction(E)||qx.Bootstrap.objectGetLength(E)===0){delete parent[D[i-1]];
}else{break;
}}},isDefined:qx.util.OOUtil.classIsDefined,getTotalNumber:function(){return qx.Bootstrap.objectGetLength(this.$$registry);
},getByName:qx.Bootstrap.getByName,include:function(G,H){qx.Class.__gA(G,H,false);
},patch:function(I,J){qx.Class.__gA(I,J,true);
},isSubClassOf:function(K,L){if(!K){return false;
}
if(K==L){return true;
}
if(K.prototype instanceof L){return true;
}return false;
},getPropertyDefinition:qx.util.OOUtil.getPropertyDefinition,getProperties:function(M){var N=[];

while(M){if(M.$$properties){N.push.apply(N,qx.Bootstrap.getKeys(M.$$properties));
}M=M.superclass;
}return N;
},getByProperty:function(O,name){while(O){if(O.$$properties&&O.$$properties[name]){return O;
}O=O.superclass;
}return null;
},hasProperty:qx.util.OOUtil.hasProperty,getEventType:qx.util.OOUtil.getEventType,supportsEvent:qx.util.OOUtil.supportsEvent,hasOwnMixin:function(P,Q){return P.$$includes&&P.$$includes.indexOf(Q)!==-1;
},getByMixin:function(R,S){var T,i,l;

while(R){if(R.$$includes){T=R.$$flatIncludes;

for(i=0,l=T.length;i<l;i++){if(T[i]===S){return R;
}}}R=R.superclass;
}return null;
},getMixins:qx.util.OOUtil.getMixins,hasMixin:function(U,V){return !!this.getByMixin(U,V);
},hasOwnInterface:function(W,X){return W.$$implements&&W.$$implements.indexOf(X)!==-1;
},getByInterface:qx.util.OOUtil.getByInterface,getInterfaces:function(Y){var ba=[];

while(Y){if(Y.$$implements){ba.push.apply(ba,Y.$$flatImplements);
}Y=Y.superclass;
}return ba;
},hasInterface:qx.util.OOUtil.hasInterface,implementsInterface:function(bb,bc){var bd=bb.constructor;

if(this.hasInterface(bd,bc)){return true;
}
try{qx.Interface.assertObject(bb,bc);
return true;
}catch(be){}
try{qx.Interface.assert(bd,bc,false);
return true;
}catch(bf){}return false;
},getInstance:function(){if(!this.$$instance){this.$$allowconstruct=true;
this.$$instance=new this;
delete this.$$allowconstruct;
}return this.$$instance;
},genericToString:function(){return q+this.classname+p;
},$$registry:qx.Bootstrap.$$registry,__go:null,__gp:null,__gq:function(){},__gr:function(){},__gs:function(name,bg,bh,bi,bj,bk,bl){var bo;

if(!bh&&qx.core.Environment.get(w)==false){bo=bi||{};
qx.Bootstrap.setDisplayNames(bo,name);
}else{var bo={};

if(bh){if(!bj){bj=this.__gB();
}
if(this.__gD(bh,bl)){bo=this.__gE(bj,name,bg);
}else{bo=bj;
}if(bg===j){bo.getInstance=this.getInstance;
}qx.Bootstrap.setDisplayName(bj,name,t);
}if(bi){qx.Bootstrap.setDisplayNames(bi,name);
var bp;

for(var i=0,a=qx.Bootstrap.getKeys(bi),l=a.length;i<l;i++){bp=a[i];
var bm=bi[bp];

if(qx.core.Environment.get(w)){if(bm instanceof Function){bm=qx.core.Aspect.wrap(name+v+bp,bm,u);
}bo[bp]=bm;
}else{bo[bp]=bm;
}}}}var bn=qx.Bootstrap.createNamespace(name,bo);
bo.name=bo.classname=name;
bo.basename=bn;
bo.$$type=d;

if(bg){bo.$$classtype=bg;
}if(!bo.hasOwnProperty(o)){bo.toString=this.genericToString;
}
if(bh){qx.Bootstrap.extendClass(bo,bj,bh,name,bn);
if(bk){if(qx.core.Environment.get(w)){bk=qx.core.Aspect.wrap(name,bk,m);
}bo.$$destructor=bk;
qx.Bootstrap.setDisplayName(bk,name,c);
}}this.$$registry[name]=bo;
return bo;
},__gt:function(bq,br,bs){var bt,bt;

if(bq.$$events){for(var bt in br){bq.$$events[bt]=br[bt];
}}else{bq.$$events=br;
}},__gu:function(bu,bv,bw){if(!qx.core.Environment.get(r)){throw new Error("Property module disabled.");
}var bx;

if(bw===undefined){bw=false;
}var by=bu.prototype;

for(var name in bv){bx=bv[name];
bx.name=name;
if(!bx.refine){if(bu.$$properties===undefined){bu.$$properties={};
}bu.$$properties[name]=bx;
}if(bx.init!==undefined){bu.prototype[n+name]=bx.init;
}if(bx.event!==undefined){if(!qx.core.Environment.get(f)){throw new Error("Events module not enabled.");
}var event={};
event[bx.event]=k;
this.__gt(bu,event,bw);
}if(bx.inheritable){this.__dz.$$inheritable[name]=true;

if(!by.$$refreshInheritables){this.__dz.attachRefreshInheritables(bu);
}}
if(!bx.refine){this.__dz.attachMethods(bu,name,bx);
}}},__gv:null,__gw:function(bz,bA,bB,bC,bD){var bE=bz.prototype;
var bG,bF;
qx.Bootstrap.setDisplayNames(bA,bz.classname+e);

for(var i=0,a=qx.Bootstrap.getKeys(bA),l=a.length;i<l;i++){bG=a[i];
bF=bA[bG];
if(bC!==false&&bF instanceof Function&&bF.$$type==null){if(bD==true){bF=this.__gx(bF,bE[bG]);
}else{if(bE[bG]){bF.base=bE[bG];
}bF.self=bz;
}
if(qx.core.Environment.get(w)){bF=qx.core.Aspect.wrap(bz.classname+v+bG,bF,b);
}}bE[bG]=bF;
}},__gx:function(bH,bI){if(bI){return function(){var bK=bH.base;
bH.base=bI;
var bJ=bH.apply(this,arguments);
bH.base=bK;
return bJ;
};
}else{return bH;
}},__gy:function(bL,bM){var bN=qx.Interface.flatten([bM]);

if(bL.$$implements){bL.$$implements.push(bM);
bL.$$flatImplements.push.apply(bL.$$flatImplements,bN);
}else{bL.$$implements=[bM];
bL.$$flatImplements=bN;
}},__gz:function(bO){var name=bO.classname;
var bP=this.__gE(bO,name,bO.$$classtype);
for(var i=0,a=qx.Bootstrap.getKeys(bO),l=a.length;i<l;i++){bQ=a[i];
bP[bQ]=bO[bQ];
}bP.prototype=bO.prototype;
var bS=bO.prototype;

for(var i=0,a=qx.Bootstrap.getKeys(bS),l=a.length;i<l;i++){bQ=a[i];
var bT=bS[bQ];
if(bT&&bT.self==bO){bT.self=bP;
}}for(var bQ in this.$$registry){var bR=this.$$registry[bQ];

if(!bR){continue;
}
if(bR.base==bO){bR.base=bP;
}
if(bR.superclass==bO){bR.superclass=bP;
}
if(bR.$$original){if(bR.$$original.base==bO){bR.$$original.base=bP;
}
if(bR.$$original.superclass==bO){bR.$$original.superclass=bP;
}}}qx.Bootstrap.createNamespace(name,bP);
this.$$registry[name]=bP;
return bP;
},__gA:function(bU,bV,bW){if(this.hasMixin(bU,bV)){return;
}var ca=bU.$$original;

if(bV.$$constructor&&!ca){bU=this.__gz(bU);
}var bY=qx.Mixin.flatten([bV]);
var bX;

for(var i=0,l=bY.length;i<l;i++){bX=bY[i];
if(bX.$$events){this.__gt(bU,bX.$$events,bW);
}if(bX.$$properties){this.__gu(bU,bX.$$properties,bW);
}if(bX.$$members){this.__gw(bU,bX.$$members,bW,bW,bW);
}}if(bU.$$includes){bU.$$includes.push(bV);
bU.$$flatIncludes.push.apply(bU.$$flatIncludes,bY);
}else{bU.$$includes=[bV];
bU.$$flatIncludes=bY;
}},__gB:function(){function cb(){cb.base.apply(this,arguments);
}return cb;
},__gC:function(){return function(){};
},__gD:function(cc,cd){if(cc&&cc.$$includes){var ce=cc.$$flatIncludes;

for(var i=0,l=ce.length;i<l;i++){if(ce[i].$$constructor){return true;
}}}if(cd){var cf=qx.Mixin.flatten(cd);

for(var i=0,l=cf.length;i<l;i++){if(cf[i].$$constructor){return true;
}}}return false;
},__gE:function(cg,name,ch){var cj=function(){var cm=cj;
var cl=cm.$$original.apply(this,arguments);
if(cm.$$includes){var ck=cm.$$flatIncludes;

for(var i=0,l=ck.length;i<l;i++){if(ck[i].$$constructor){ck[i].$$constructor.apply(this,arguments);
}}}return cl;
};

if(qx.core.Environment.get(w)){var ci=qx.core.Aspect.wrap(name,cj,t);
cj.$$original=cg;
cj.constructor=ci;
cj=ci;
}cj.$$original=cg;
cg.wrapper=cj;
return cj;
}},defer:function(){if(qx.core.Environment.get(w)){for(var cn in qx.Bootstrap.$$registry){var co=qx.Bootstrap.$$registry[cn];

for(var cp in co){if(co[cp] instanceof Function){co[cp]=qx.core.Aspect.wrap(cn+v+cp,co[cp],u);
}}}}}});
})();
(function(){var k="indexOf",j="lastIndexOf",h="slice",g="concat",f="join",e="toLocaleUpperCase",d="shift",c="substr",b="filter",a="unshift",I="match",H="quote",G="qx.lang.Generics",F="localeCompare",E="sort",D="some",C="charAt",B="split",A="substring",z="pop",t="toUpperCase",u="replace",q="push",r="charCodeAt",o="every",p="reverse",m="search",n="forEach",v="map",w="toLowerCase",y="splice",x="toLocaleLowerCase";
qx.Class.define(G,{statics:{__hn:{"Array":[f,p,E,q,z,d,a,y,g,h,k,j,n,v,b,D,o],"String":[H,A,w,t,C,r,k,j,x,e,F,I,m,u,B,c,g,h]},__ho:function(J,K){return function(s){return J.prototype[K].apply(s,Array.prototype.slice.call(arguments,1));
};
},__ds:function(){var L=qx.lang.Generics.__hn;

for(var P in L){var N=window[P];
var M=L[P];

for(var i=0,l=M.length;i<l;i++){var O=M[i];

if(!N[O]){N[O]=qx.lang.Generics.__ho(N,O);
}}}}},defer:function(Q){Q.__ds();
}});
})();
(function(){var a="qx.data.MBinding";
qx.Mixin.define(a,{members:{bind:function(b,c,d,e){return qx.data.SingleValueBinding.bind(this,b,c,d,e);
},removeBinding:function(f){qx.data.SingleValueBinding.removeBindingFromObject(this,f);
},removeAllBindings:function(){qx.data.SingleValueBinding.removeAllBindingsForObject(this);
},getBindings:function(){return qx.data.SingleValueBinding.getAllBindingsForObject(this);
}}});
})();
(function(){var m="get",l="",k="[",h="last",g="change",f="]",d=".",c="Number",b="String",a="set",E="deepBinding",D="item",C="reset",B="' (",A="Boolean",z=") to the object '",y="Integer",x=" of object ",w="qx.data.SingleValueBinding",v="Binding property ",t="Binding from '",u="PositiveNumber",r="PositiveInteger",s="Binding does not exist!",p=").",q="Date",n=" not possible: No event available. ";
qx.Class.define(w,{statics:{__kk:{},bind:function(F,G,H,I,J){var U=this.__km(F,G,H,I,J);
var P=G.split(d);
var L=this.__ks(P);
var T=[];
var Q=[];
var R=[];
var N=[];
var O=F;
try{for(var i=0;i<P.length;i++){if(L[i]!==l){N.push(g);
}else{N.push(this.__kn(O,P[i]));
}T[i]=O;
if(i==P.length-1){if(L[i]!==l){var Y=L[i]===h?O.length-1:L[i];
var K=O.getItem(Y);
this.__kr(K,H,I,J,F);
R[i]=this.__kt(O,N[i],H,I,J,L[i]);
}else{if(P[i]!=null&&O[m+qx.lang.String.firstUp(P[i])]!=null){var K=O[m+qx.lang.String.firstUp(P[i])]();
this.__kr(K,H,I,J,F);
}R[i]=this.__kt(O,N[i],H,I,J);
}}else{var V={index:i,propertyNames:P,sources:T,listenerIds:R,arrayIndexValues:L,targetObject:H,targetPropertyChain:I,options:J,listeners:Q};
var S=qx.lang.Function.bind(this.__kl,this,V);
Q.push(S);
R[i]=O.addListener(N[i],S);
}if(O[m+qx.lang.String.firstUp(P[i])]==null){O=null;
}else if(L[i]!==l){O=O[m+qx.lang.String.firstUp(P[i])](L[i]);
}else{O=O[m+qx.lang.String.firstUp(P[i])]();
}
if(!O){break;
}}}catch(ba){for(var i=0;i<T.length;i++){if(T[i]&&R[i]){T[i].removeListenerById(R[i]);
}}var X=U.targets;
var M=U.listenerIds[i];
for(var i=0;i<X.length;i++){if(X[i]&&M[i]){X[i].removeListenerById(M[i]);
}}throw ba;
}var W={type:E,listenerIds:R,sources:T,targetListenerIds:U.listenerIds,targets:U.targets};
this.__ku(W,F,G,H,I);
return W;
},__kl:function(bb){if(bb.options&&bb.options.onUpdate){bb.options.onUpdate(bb.sources[bb.index],bb.targetObject);
}for(var j=bb.index+1;j<bb.propertyNames.length;j++){var bf=bb.sources[j];
bb.sources[j]=null;

if(!bf){continue;
}bf.removeListenerById(bb.listenerIds[j]);
}var bf=bb.sources[bb.index];
for(var j=bb.index+1;j<bb.propertyNames.length;j++){if(bb.arrayIndexValues[j-1]!==l){bf=bf[m+qx.lang.String.firstUp(bb.propertyNames[j-1])](bb.arrayIndexValues[j-1]);
}else{bf=bf[m+qx.lang.String.firstUp(bb.propertyNames[j-1])]();
}bb.sources[j]=bf;
if(!bf){this.__ko(bb.targetObject,bb.targetPropertyChain);
break;
}if(j==bb.propertyNames.length-1){if(qx.Class.implementsInterface(bf,qx.data.IListData)){var bg=bb.arrayIndexValues[j]===h?bf.length-1:bb.arrayIndexValues[j];
var bd=bf.getItem(bg);
this.__kr(bd,bb.targetObject,bb.targetPropertyChain,bb.options,bb.sources[bb.index]);
bb.listenerIds[j]=this.__kt(bf,g,bb.targetObject,bb.targetPropertyChain,bb.options,bb.arrayIndexValues[j]);
}else{if(bb.propertyNames[j]!=null&&bf[m+qx.lang.String.firstUp(bb.propertyNames[j])]!=null){var bd=bf[m+qx.lang.String.firstUp(bb.propertyNames[j])]();
this.__kr(bd,bb.targetObject,bb.targetPropertyChain,bb.options,bb.sources[bb.index]);
}var be=this.__kn(bf,bb.propertyNames[j]);
bb.listenerIds[j]=this.__kt(bf,be,bb.targetObject,bb.targetPropertyChain,bb.options);
}}else{if(bb.listeners[j]==null){var bc=qx.lang.Function.bind(this.__kl,this,bb);
bb.listeners.push(bc);
}if(qx.Class.implementsInterface(bf,qx.data.IListData)){var be=g;
}else{var be=this.__kn(bf,bb.propertyNames[j]);
}bb.listenerIds[j]=bf.addListener(be,bb.listeners[j]);
}}},__km:function(bh,bi,bj,bk,bl){var bp=bk.split(d);
var bn=this.__ks(bp);
var bu=[];
var bt=[];
var br=[];
var bq=[];
var bo=bj;
for(var i=0;i<bp.length-1;i++){if(bn[i]!==l){bq.push(g);
}else{try{bq.push(this.__kn(bo,bp[i]));
}catch(e){break;
}}bu[i]=bo;
var bs=function(){for(var j=i+1;j<bp.length-1;j++){var bx=bu[j];
bu[j]=null;

if(!bx){continue;
}bx.removeListenerById(br[j]);
}var bx=bu[i];
for(var j=i+1;j<bp.length-1;j++){var bv=qx.lang.String.firstUp(bp[j-1]);
if(bn[j-1]!==l){var by=bn[j-1]===h?bx.getLength()-1:bn[j-1];
bx=bx[m+bv](by);
}else{bx=bx[m+bv]();
}bu[j]=bx;
if(bt[j]==null){bt.push(bs);
}if(qx.Class.implementsInterface(bx,qx.data.IListData)){var bw=g;
}else{try{var bw=qx.data.SingleValueBinding.__kn(bx,bp[j]);
}catch(e){break;
}}br[j]=bx.addListener(bw,bt[j]);
}qx.data.SingleValueBinding.updateTarget(bh,bi,bj,bk,bl);
};
bt.push(bs);
br[i]=bo.addListener(bq[i],bs);
var bm=qx.lang.String.firstUp(bp[i]);
if(bo[m+bm]==null){bo=null;
}else if(bn[i]!==l){bo=bo[m+bm](bn[i]);
}else{bo=bo[m+bm]();
}
if(!bo){break;
}}return {listenerIds:br,targets:bu};
},updateTarget:function(bz,bA,bB,bC,bD){var bE=this.getValueFromObject(bz,bA);
bE=qx.data.SingleValueBinding.__kv(bE,bB,bC,bD,bz);
this.__kp(bB,bC,bE);
},getValueFromObject:function(o,bF){var bJ=this.__kq(o,bF);
var bH;

if(bJ!=null){var bL=bF.substring(bF.lastIndexOf(d)+1,bF.length);
if(bL.charAt(bL.length-1)==f){var bG=bL.substring(bL.lastIndexOf(k)+1,bL.length-1);
var bI=bL.substring(0,bL.lastIndexOf(k));
var bK=bJ[m+qx.lang.String.firstUp(bI)]();

if(bG==h){bG=bK.length-1;
}
if(bK!=null){bH=bK.getItem(bG);
}}else{bH=bJ[m+qx.lang.String.firstUp(bL)]();
}}return bH;
},__kn:function(bM,bN){var bO=this.__kw(bM,bN);
if(bO==null){if(qx.Class.supportsEvent(bM.constructor,bN)){bO=bN;
}else if(qx.Class.supportsEvent(bM.constructor,g+qx.lang.String.firstUp(bN))){bO=g+qx.lang.String.firstUp(bN);
}else{throw new qx.core.AssertionError(v+bN+x+bM+n);
}}return bO;
},__ko:function(bP,bQ){var bR=this.__kq(bP,bQ);

if(bR!=null){var bS=bQ.substring(bQ.lastIndexOf(d)+1,bQ.length);
if(bS.charAt(bS.length-1)==f){this.__kp(bP,bQ,null);
return;
}if(bR[C+qx.lang.String.firstUp(bS)]!=undefined){bR[C+qx.lang.String.firstUp(bS)]();
}else{bR[a+qx.lang.String.firstUp(bS)](null);
}}},__kp:function(bT,bU,bV){var ca=this.__kq(bT,bU);

if(ca!=null){var cb=bU.substring(bU.lastIndexOf(d)+1,bU.length);
if(cb.charAt(cb.length-1)==f){var bW=cb.substring(cb.lastIndexOf(k)+1,cb.length-1);
var bY=cb.substring(0,cb.lastIndexOf(k));
var bX=bT;

if(!qx.Class.implementsInterface(bX,qx.data.IListData)){bX=ca[m+qx.lang.String.firstUp(bY)]();
}
if(bW==h){bW=bX.length-1;
}
if(bX!=null){bX.setItem(bW,bV);
}}else{ca[a+qx.lang.String.firstUp(cb)](bV);
}}},__kq:function(cc,cd){var cg=cd.split(d);
var ch=cc;
for(var i=0;i<cg.length-1;i++){try{var cf=cg[i];
if(cf.indexOf(f)==cf.length-1){var ce=cf.substring(cf.indexOf(k)+1,cf.length-1);
cf=cf.substring(0,cf.indexOf(k));
}if(cf!=l){ch=ch[m+qx.lang.String.firstUp(cf)]();
}if(ce!=null){if(ce==h){ce=ch.length-1;
}ch=ch.getItem(ce);
ce=null;
}}catch(ci){return null;
}}return ch;
},__kr:function(cj,ck,cl,cm,cn){cj=this.__kv(cj,ck,cl,cm,cn);
if(cj===undefined){this.__ko(ck,cl);
}if(cj!==undefined){try{this.__kp(ck,cl,cj);
if(cm&&cm.onUpdate){cm.onUpdate(cn,ck,cj);
}}catch(e){if(!(e instanceof qx.core.ValidationError)){throw e;
}
if(cm&&cm.onSetFail){cm.onSetFail(e);
}else{qx.log.Logger.warn("Failed so set value "+cj+" on "+ck+". Error message: "+e);
}}}},__ks:function(co){var cp=[];
for(var i=0;i<co.length;i++){var name=co[i];
if(qx.lang.String.endsWith(name,f)){var cq=name.substring(name.indexOf(k)+1,name.indexOf(f));
if(name.indexOf(f)!=name.length-1){throw new Error("Please use only one array at a time: "+name+" does not work.");
}
if(cq!==h){if(cq==l||isNaN(parseInt(cq,10))){throw new Error("No number or 'last' value hast been given"+" in an array binding: "+name+" does not work.");
}}if(name.indexOf(k)!=0){co[i]=name.substring(0,name.indexOf(k));
cp[i]=l;
cp[i+1]=cq;
co.splice(i+1,0,D);
i++;
}else{cp[i]=cq;
co.splice(i,1,D);
}}else{cp[i]=l;
}}return cp;
},__kt:function(cr,cs,ct,cu,cv,cw){var cx;
var cz=function(cA,e){if(cA!==l){if(cA===h){cA=cr.length-1;
}var cD=cr.getItem(cA);
if(cD===undefined){qx.data.SingleValueBinding.__ko(ct,cu);
}var cB=e.getData().start;
var cC=e.getData().end;

if(cA<cB||cA>cC){return;
}}else{var cD=e.getData();
}cD=qx.data.SingleValueBinding.__kv(cD,ct,cu,cv,cr);
try{if(cD!==undefined){qx.data.SingleValueBinding.__kp(ct,cu,cD);
}else{qx.data.SingleValueBinding.__ko(ct,cu);
}if(cv&&cv.onUpdate){cv.onUpdate(cr,ct,cD);
}}catch(e){if(!(e instanceof qx.core.ValidationError)){throw e;
}
if(cv&&cv.onSetFail){cv.onSetFail(e);
}else{qx.log.Logger.warn("Failed so set value "+cD+" on "+ct+". Error message: "+e);
}}};
if(!cw){cw=l;
}cz=qx.lang.Function.bind(cz,cr,cw);
var cy=cr.addListener(cs,cz);
return cy;
},__ku:function(cE,cF,cG,cH,cI){if(this.__kk[cF.toHashCode()]===undefined){this.__kk[cF.toHashCode()]=[];
}this.__kk[cF.toHashCode()].push([cE,cF,cG,cH,cI]);
},__kv:function(cJ,cK,cL,cM,cN){if(cM&&cM.converter){var cP;

if(cK.getModel){cP=cK.getModel();
}return cM.converter(cJ,cP,cN,cK);
}else{var cR=this.__kq(cK,cL);
var cS=cL.substring(cL.lastIndexOf(d)+1,cL.length);
if(cR==null){return cJ;
}var cQ=qx.Class.getPropertyDefinition(cR.constructor,cS);
var cO=cQ==null?l:cQ.check;
return this.__kx(cJ,cO);
}},__kw:function(cT,cU){var cV=qx.Class.getPropertyDefinition(cT.constructor,cU);

if(cV==null){return null;
}return cV.event;
},__kx:function(cW,cX){var cY=qx.lang.Type.getClass(cW);
if((cY==c||cY==b)&&(cX==y||cX==r)){cW=parseInt(cW,10);
}if((cY==A||cY==c||cY==q)&&cX==b){cW=cW+l;
}if((cY==c||cY==b)&&(cX==c||cX==u)){cW=parseFloat(cW);
}return cW;
},removeBindingFromObject:function(da,db){if(db.type==E){for(var i=0;i<db.sources.length;i++){if(db.sources[i]){db.sources[i].removeListenerById(db.listenerIds[i]);
}}for(var i=0;i<db.targets.length;i++){if(db.targets[i]){db.targets[i].removeListenerById(db.targetListenerIds[i]);
}}}else{da.removeListenerById(db);
}var dc=this.__kk[da.toHashCode()];
if(dc!=undefined){for(var i=0;i<dc.length;i++){if(dc[i][0]==db){qx.lang.Array.remove(dc,dc[i]);
return;
}}}throw new Error("Binding could not be found!");
},removeAllBindingsForObject:function(dd){var de=this.__kk[dd.toHashCode()];

if(de!=undefined){for(var i=de.length-1;i>=0;i--){this.removeBindingFromObject(dd,de[i][0]);
}}},getAllBindingsForObject:function(df){if(this.__kk[df.toHashCode()]===undefined){this.__kk[df.toHashCode()]=[];
}return this.__kk[df.toHashCode()];
},removeAllBindings:function(){for(var dh in this.__kk){var dg=qx.core.ObjectRegistry.fromHashCode(dh);
if(dg==null){delete this.__kk[dh];
continue;
}this.removeAllBindingsForObject(dg);
}this.__kk={};
},getAllBindings:function(){return this.__kk;
},showBindingInLog:function(di,dj){var dl;
for(var i=0;i<this.__kk[di.toHashCode()].length;i++){if(this.__kk[di.toHashCode()][i][0]==dj){dl=this.__kk[di.toHashCode()][i];
break;
}}
if(dl===undefined){var dk=s;
}else{var dk=t+dl[1]+B+dl[2]+z+dl[3]+B+dl[4]+p;
}qx.log.Logger.debug(dk);
},showAllBindingsInLog:function(){for(var dn in this.__kk){var dm=qx.core.ObjectRegistry.fromHashCode(dn);

for(var i=0;i<this.__kk[dn].length;i++){this.showBindingInLog(dm,this.__kk[dn][i][0]);
}}}}});
})();
(function(){var p="",o="g",n="]",m='\\u',l="undefined",k='\\$1',j="0041-005A0061-007A00AA00B500BA00C0-00D600D8-00F600F8-02C102C6-02D102E0-02E402EC02EE0370-037403760377037A-037D03860388-038A038C038E-03A103A3-03F503F7-0481048A-05250531-055605590561-058705D0-05EA05F0-05F20621-064A066E066F0671-06D306D506E506E606EE06EF06FA-06FC06FF07100712-072F074D-07A507B107CA-07EA07F407F507FA0800-0815081A082408280904-0939093D09500958-0961097109720979-097F0985-098C098F09900993-09A809AA-09B009B209B6-09B909BD09CE09DC09DD09DF-09E109F009F10A05-0A0A0A0F0A100A13-0A280A2A-0A300A320A330A350A360A380A390A59-0A5C0A5E0A72-0A740A85-0A8D0A8F-0A910A93-0AA80AAA-0AB00AB20AB30AB5-0AB90ABD0AD00AE00AE10B05-0B0C0B0F0B100B13-0B280B2A-0B300B320B330B35-0B390B3D0B5C0B5D0B5F-0B610B710B830B85-0B8A0B8E-0B900B92-0B950B990B9A0B9C0B9E0B9F0BA30BA40BA8-0BAA0BAE-0BB90BD00C05-0C0C0C0E-0C100C12-0C280C2A-0C330C35-0C390C3D0C580C590C600C610C85-0C8C0C8E-0C900C92-0CA80CAA-0CB30CB5-0CB90CBD0CDE0CE00CE10D05-0D0C0D0E-0D100D12-0D280D2A-0D390D3D0D600D610D7A-0D7F0D85-0D960D9A-0DB10DB3-0DBB0DBD0DC0-0DC60E01-0E300E320E330E40-0E460E810E820E840E870E880E8A0E8D0E94-0E970E99-0E9F0EA1-0EA30EA50EA70EAA0EAB0EAD-0EB00EB20EB30EBD0EC0-0EC40EC60EDC0EDD0F000F40-0F470F49-0F6C0F88-0F8B1000-102A103F1050-1055105A-105D106110651066106E-10701075-1081108E10A0-10C510D0-10FA10FC1100-1248124A-124D1250-12561258125A-125D1260-1288128A-128D1290-12B012B2-12B512B8-12BE12C012C2-12C512C8-12D612D8-13101312-13151318-135A1380-138F13A0-13F41401-166C166F-167F1681-169A16A0-16EA1700-170C170E-17111720-17311740-17511760-176C176E-17701780-17B317D717DC1820-18771880-18A818AA18B0-18F51900-191C1950-196D1970-19741980-19AB19C1-19C71A00-1A161A20-1A541AA71B05-1B331B45-1B4B1B83-1BA01BAE1BAF1C00-1C231C4D-1C4F1C5A-1C7D1CE9-1CEC1CEE-1CF11D00-1DBF1E00-1F151F18-1F1D1F20-1F451F48-1F4D1F50-1F571F591F5B1F5D1F5F-1F7D1F80-1FB41FB6-1FBC1FBE1FC2-1FC41FC6-1FCC1FD0-1FD31FD6-1FDB1FE0-1FEC1FF2-1FF41FF6-1FFC2071207F2090-209421022107210A-211321152119-211D212421262128212A-212D212F-2139213C-213F2145-2149214E218321842C00-2C2E2C30-2C5E2C60-2CE42CEB-2CEE2D00-2D252D30-2D652D6F2D80-2D962DA0-2DA62DA8-2DAE2DB0-2DB62DB8-2DBE2DC0-2DC62DC8-2DCE2DD0-2DD62DD8-2DDE2E2F300530063031-3035303B303C3041-3096309D-309F30A1-30FA30FC-30FF3105-312D3131-318E31A0-31B731F0-31FF3400-4DB54E00-9FCBA000-A48CA4D0-A4FDA500-A60CA610-A61FA62AA62BA640-A65FA662-A66EA67F-A697A6A0-A6E5A717-A71FA722-A788A78BA78CA7FB-A801A803-A805A807-A80AA80C-A822A840-A873A882-A8B3A8F2-A8F7A8FBA90A-A925A930-A946A960-A97CA984-A9B2A9CFAA00-AA28AA40-AA42AA44-AA4BAA60-AA76AA7AAA80-AAAFAAB1AAB5AAB6AAB9-AABDAAC0AAC2AADB-AADDABC0-ABE2AC00-D7A3D7B0-D7C6D7CB-D7FBF900-FA2DFA30-FA6DFA70-FAD9FB00-FB06FB13-FB17FB1DFB1F-FB28FB2A-FB36FB38-FB3CFB3EFB40FB41FB43FB44FB46-FBB1FBD3-FD3DFD50-FD8FFD92-FDC7FDF0-FDFBFE70-FE74FE76-FEFCFF21-FF3AFF41-FF5AFF66-FFBEFFC2-FFC7FFCA-FFCFFFD2-FFD7FFDA-FFDC",h='-',g="qx.lang.String",f="(^|[^",c="0",e="%",d=' ',b='\n',a="])[";
qx.Bootstrap.define(g,{statics:{__cV:j,__cW:null,__cX:{},camelCase:function(q){var r=this.__cX[q];

if(!r){r=q.replace(/\-([a-z])/g,function(s,t){return t.toUpperCase();
});
}return r;
},hyphenate:function(u){var v=this.__cX[u];

if(!v){v=u.replace(/[A-Z]/g,function(w){return (h+w.charAt(0).toLowerCase());
});
}return v;
},capitalize:function(x){if(this.__cW===null){var y=m;
this.__cW=new RegExp(f+this.__cV.replace(/[0-9A-F]{4}/g,function(z){return y+z;
})+a+this.__cV.replace(/[0-9A-F]{4}/g,function(A){return y+A;
})+n,o);
}return x.replace(this.__cW,function(B){return B.toUpperCase();
});
},clean:function(C){return this.trim(C.replace(/\s+/g,d));
},trimLeft:function(D){return D.replace(/^\s+/,p);
},trimRight:function(E){return E.replace(/\s+$/,p);
},trim:function(F){return F.replace(/^\s+|\s+$/g,p);
},startsWith:function(G,H){return G.indexOf(H)===0;
},endsWith:function(I,J){return I.substring(I.length-J.length,I.length)===J;
},repeat:function(K,L){return K.length>0?new Array(L+1).join(K):p;
},pad:function(M,length,N){var O=length-M.length;

if(O>0){if(typeof N===l){N=c;
}return this.repeat(N,O)+M;
}else{return M;
}},firstUp:qx.Bootstrap.firstUp,firstLow:qx.Bootstrap.firstLow,contains:function(P,Q){return P.indexOf(Q)!=-1;
},format:function(R,S){var T=R;
var i=S.length;

while(i--){T=T.replace(new RegExp(e+(i+1),o),S[i]+p);
}return T;
},escapeRegexpChars:function(U){return U.replace(/([.*+?^${}()|[\]\/\\])/g,k);
},toArray:function(V){return V.split(/\B|\b/g);
},stripTags:function(W){return W.replace(/<\/?[^>]+>/gi,p);
},stripScripts:function(X,Y){var bb=p;
var ba=X.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi,function(){bb+=arguments[1]+b;
return p;
});

if(Y===true){qx.lang.Function.globalEval(bb);
}return ba;
}}});
})();
(function(){var g="mshtml",f="engine.name",e="[object Array]",d="qx.lang.Array",c="qx",b="number",a="string";
qx.Bootstrap.define(d,{statics:{toArray:function(h,j){return this.cast(h,Array,j);
},cast:function(k,m,n){if(k.constructor===m){return k;
}
if(qx.data&&qx.data.IListData){if(qx.Class&&qx.Class.hasInterface(k,qx.data.IListData)){var k=k.toArray();
}}var o=new m;
if((qx.core.Environment.get(f)==g)){if(k.item){for(var i=n||0,l=k.length;i<l;i++){o.push(k[i]);
}return o;
}}if(Object.prototype.toString.call(k)===e&&n==null){o.push.apply(o,k);
}else{o.push.apply(o,Array.prototype.slice.call(k,n||0));
}return o;
},fromArguments:function(p,q){return Array.prototype.slice.call(p,q||0);
},fromCollection:function(r){if((qx.core.Environment.get(f)==g)){if(r.item){var s=[];

for(var i=0,l=r.length;i<l;i++){s[i]=r[i];
}return s;
}}return Array.prototype.slice.call(r,0);
},fromShortHand:function(t){var v=t.length;
var u=qx.lang.Array.clone(t);
switch(v){case 1:u[1]=u[2]=u[3]=u[0];
break;
case 2:u[2]=u[0];
case 3:u[3]=u[1];
}return u;
},clone:function(w){return w.concat();
},insertAt:function(x,y,i){x.splice(i,0,y);
return x;
},insertBefore:function(z,A,B){var i=z.indexOf(B);

if(i==-1){z.push(A);
}else{z.splice(i,0,A);
}return z;
},insertAfter:function(C,D,E){var i=C.indexOf(E);

if(i==-1||i==(C.length-1)){C.push(D);
}else{C.splice(i+1,0,D);
}return C;
},removeAt:function(F,i){return F.splice(i,1)[0];
},removeAll:function(G){G.length=0;
return this;
},append:function(H,I){Array.prototype.push.apply(H,I);
return H;
},exclude:function(J,K){for(var i=0,M=K.length,L;i<M;i++){L=J.indexOf(K[i]);

if(L!=-1){J.splice(L,1);
}}return J;
},remove:function(N,O){var i=N.indexOf(O);

if(i!=-1){N.splice(i,1);
return O;
}},contains:function(P,Q){return P.indexOf(Q)!==-1;
},equals:function(R,S){var length=R.length;

if(length!==S.length){return false;
}
for(var i=0;i<length;i++){if(R[i]!==S[i]){return false;
}}return true;
},sum:function(T){var U=0;

for(var i=0,l=T.length;i<l;i++){U+=T[i];
}return U;
},max:function(V){var i,X=V.length,W=V[0];

for(i=1;i<X;i++){if(V[i]>W){W=V[i];
}}return W===undefined?null:W;
},min:function(Y){var i,bb=Y.length,ba=Y[0];

for(i=1;i<bb;i++){if(Y[i]<ba){ba=Y[i];
}}return ba===undefined?null:ba;
},unique:function(bc){var bm=[],be={},bh={},bj={};
var bi,bd=0;
var bn=c+qx.lang.Date.now();
var bf=false,bl=false,bo=false;
for(var i=0,bk=bc.length;i<bk;i++){bi=bc[i];
if(bi===null){if(!bf){bf=true;
bm.push(bi);
}}else if(bi===undefined){}else if(bi===false){if(!bl){bl=true;
bm.push(bi);
}}else if(bi===true){if(!bo){bo=true;
bm.push(bi);
}}else if(typeof bi===a){if(!be[bi]){be[bi]=1;
bm.push(bi);
}}else if(typeof bi===b){if(!bh[bi]){bh[bi]=1;
bm.push(bi);
}}else{var bg=bi[bn];

if(bg==null){bg=bi[bn]=bd++;
}
if(!bj[bg]){bj[bg]=bi;
bm.push(bi);
}}}for(var bg in bj){try{delete bj[bg][bn];
}catch(bp){try{bj[bg][bn]=null;
}catch(bq){throw new Error("Cannot clean-up map entry doneObjects["+bg+"]["+bn+"]");
}}}return bm;
}}});
})();
(function(){var u=".",t="function",s="",r="gecko",q="Maple",p="[object Opera]",o="mshtml",n="8.0",m="AppleWebKit/",l="9.0",e="[^\\.0-9]",k="Gecko",h="webkit",c="4.0",b="1.9.0.0",g="opera",f="Version/",i="5.0",a="engine.version",j="qx.bom.client.Engine",d="engine.name";
qx.Bootstrap.define(j,{statics:{getVersion:function(){var y=window.navigator.userAgent;
var w=s;

if(qx.bom.client.Engine.__bS()){if(/Opera[\s\/]([0-9]+)\.([0-9])([0-9]*)/.test(y)){if(y.indexOf(f)!=-1){var x=y.match(/Version\/(\d+)\.(\d+)/);
w=x[1]+u+x[2].charAt(0)+u+x[2].substring(1,x[2].length);
}else{w=RegExp.$1+u+RegExp.$2;

if(RegExp.$3!=s){w+=u+RegExp.$3;
}}}}else if(qx.bom.client.Engine.__bT()){if(/AppleWebKit\/([^ ]+)/.test(y)){w=RegExp.$1;
var z=RegExp(e).exec(w);

if(z){w=w.slice(0,z.index);
}}}else if(qx.bom.client.Engine.__bV()||qx.bom.client.Engine.__bU()){if(/rv\:([^\);]+)(\)|;)/.test(y)){w=RegExp.$1;
}}else if(qx.bom.client.Engine.__bW()){if(/MSIE\s+([^\);]+)(\)|;)/.test(y)){w=RegExp.$1;
if(w<8&&/Trident\/([^\);]+)(\)|;)/.test(y)){if(RegExp.$1==c){w=n;
}else if(RegExp.$1==i){w=l;
}}}}else{var v=window.qxFail;

if(v&&typeof v===t){w=v().FULLVERSION;
}else{w=b;
qx.Bootstrap.warn("Unsupported client: "+y+"! Assumed gecko version 1.9.0.0 (Firefox 3.0).");
}}return w;
},getName:function(){var name;

if(qx.bom.client.Engine.__bS()){name=g;
}else if(qx.bom.client.Engine.__bT()){name=h;
}else if(qx.bom.client.Engine.__bV()||qx.bom.client.Engine.__bU()){name=r;
}else if(qx.bom.client.Engine.__bW()){name=o;
}else{var A=window.qxFail;

if(A&&typeof A===t){name=A().NAME;
}else{name=r;
qx.Bootstrap.warn("Unsupported client: "+window.navigator.userAgent+"! Assumed gecko version 1.9.0.0 (Firefox 3.0).");
}}return name;
},__bS:function(){return window.opera&&Object.prototype.toString.call(window.opera)==p;
},__bT:function(){return window.navigator.userAgent.indexOf(m)!=-1;
},__bU:function(){return window.navigator.userAgent.indexOf(q)!=-1;
},__bV:function(){return window.controllers&&window.navigator.product===k&&window.navigator.userAgent.indexOf(q)==-1;
},__bW:function(){return window.navigator.cpuClass&&/MSIE\s+([^\);]+)(\)|;)/.test(window.navigator.userAgent);
}},defer:function(B){qx.core.Environment.add(a,B.getVersion);
qx.core.Environment.add(d,B.getName);
}});
})();
(function(){var a="qx.lang.Date";
qx.Bootstrap.define(a,{statics:{now:function(){return +new Date;
}}});
})();
(function(){var f="()",e=".",d=".prototype.",c='anonymous()',b="qx.lang.Function",a=".constructor()";
qx.Bootstrap.define(b,{statics:{getCaller:function(g){return g.caller?g.caller.callee:g.callee.caller;
},getName:function(h){if(h.displayName){return h.displayName;
}
if(h.$$original||h.wrapper||h.classname){return h.classname+a;
}
if(h.$$mixin){for(var j in h.$$mixin.$$members){if(h.$$mixin.$$members[j]==h){return h.$$mixin.name+d+j+f;
}}for(var j in h.$$mixin){if(h.$$mixin[j]==h){return h.$$mixin.name+e+j+f;
}}}
if(h.self){var k=h.self.constructor;

if(k){for(var j in k.prototype){if(k.prototype[j]==h){return k.classname+d+j+f;
}}for(var j in k){if(k[j]==h){return k.classname+e+j+f;
}}}}var i=h.toString().match(/function\s*(\w*)\s*\(.*/);

if(i&&i.length>=1&&i[1]){return i[1]+f;
}return c;
},globalEval:function(l){if(window.execScript){return window.execScript(l);
}else{return eval.call(window,l);
}},empty:function(){},returnTrue:function(){return true;
},returnFalse:function(){return false;
},returnNull:function(){return null;
},returnThis:function(){return this;
},returnZero:function(){return 0;
},create:function(m,n){if(!n){return m;
}if(!(n.self||n.args||n.delay!=null||n.periodical!=null||n.attempt)){return m;
}return function(event){var p=qx.lang.Array.fromArguments(arguments);
if(n.args){p=n.args.concat(p);
}
if(n.delay||n.periodical){var o=function(){return m.apply(n.self||this,p);
};

if(qx.event&&qx.event.GlobalError){o=qx.event.GlobalError.observeMethod(o);
}
if(n.delay){return window.setTimeout(o,n.delay);
}
if(n.periodical){return window.setInterval(o,n.periodical);
}}else if(n.attempt){var q=false;

try{q=m.apply(n.self||this,p);
}catch(r){}return q;
}else{return m.apply(n.self||this,p);
}};
},bind:function(s,self,t){return this.create(s,{self:self,args:arguments.length>2?qx.lang.Array.fromArguments(arguments,2):null});
},curry:function(u,v){return this.create(u,{args:arguments.length>1?qx.lang.Array.fromArguments(arguments,1):null});
},listener:function(w,self,x){if(arguments.length<3){return function(event){return w.call(self||this,event||window.event);
};
}else{var y=qx.lang.Array.fromArguments(arguments,2);
return function(event){var z=[event||window.event];
z.push.apply(z,y);
w.apply(self||this,z);
};
}},attempt:function(A,self,B){return this.create(A,{self:self,attempt:true,args:arguments.length>2?qx.lang.Array.fromArguments(arguments,2):null})();
},delay:function(C,D,self,E){return this.create(C,{delay:D,self:self,args:arguments.length>3?qx.lang.Array.fromArguments(arguments,3):null})();
},periodical:function(F,G,self,H){return this.create(F,{periodical:G,self:self,args:arguments.length>3?qx.lang.Array.fromArguments(arguments,3):null})();
}}});
})();
(function(){var c="qx.event.type.Data",b="qx.event.type.Event",a="qx.data.IListData";
qx.Interface.define(a,{events:{"change":c,"changeLength":b},members:{getItem:function(d){},setItem:function(e,f){},splice:function(g,h,i){},contains:function(j){},getLength:function(){},toArray:function(){}}});
})();
(function(){var c="",b=": ",a="qx.type.BaseError";
qx.Class.define(a,{extend:Error,construct:function(d,e){var f=Error.call(this,e);
if(f.stack){this.stack=f.stack;
}
if(f.stacktrace){this.stacktrace=f.stacktrace;
}if(!(f.stack||f.stacktrace)){this.__dD=qx.dev.StackTrace.getStackTraceFromCaller(arguments);
}this.__bG=d||c;
this.message=e||qx.type.BaseError.DEFAULTMESSAGE;
},statics:{DEFAULTMESSAGE:"error"},members:{__bG:null,message:null,getComment:function(){return this.__bG;
},getStackTrace:function(){if(this.stack||this.stacktrace){return qx.dev.StackTrace.getStackTraceFromError(this);
}else if(this.__dD){return this.__dD;
}return [];
},toString:function(){return this.__bG+(this.message?b+this.message:c);
}}});
})();
(function(){var p=":",o=".",n="ecmascript.stacktrace",m="Error created at",l="function",k="anonymous",j="...",h="qx.dev.StackTrace",g="",f="\n",c="?",e="/source/class/",d="stack",b="prototype",a="stacktrace";
qx.Bootstrap.define(h,{statics:{FILENAME_TO_CLASSNAME:null,FORMAT_STACKTRACE:null,getStackTrace:function(){var u=[];

try{throw new Error();
}catch(F){if(qx.core.Environment.get(n)){var z=qx.dev.StackTrace.getStackTraceFromError(F);
var x=qx.dev.StackTrace.getStackTraceFromCaller(arguments);
qx.lang.Array.removeAt(z,0);
var u=x.length>z.length?x:z;

for(var i=0;i<Math.min(x.length,z.length);i++){var v=x[i];

if(v.indexOf(k)>=0){continue;
}var t;
var D=v.split(o);
var w=/(.*?)\(/.exec(D[D.length-1]);

if(w&&w.length==2){t=w[1];
D.pop();
}
if(D[D.length-1]==b){D.pop();
}var B=D.join(o);
var s=z[i];
var E=s.split(p);
var A=E[0];
var q=E[1];
var r;

if(E[2]){r=E[2];
}
if(qx.Class.getByName(A)){var y=A;
}else{y=B;
}var C=y+o;

if(t){C+=t+p;
}C+=q;

if(r){C+=p+r;
}u[i]=C;
}}else{u=this.getStackTraceFromCaller(arguments);
}}return u;
},getStackTraceFromCaller:function(G){var L=[];
var K=qx.lang.Function.getCaller(G);
var H={};

while(K){var I=qx.lang.Function.getName(K);
L.push(I);

try{K=K.caller;
}catch(M){break;
}
if(!K){break;
}var J=qx.core.ObjectRegistry.toHashCode(K);

if(H[J]){L.push(j);
break;
}H[J]=K;
}return L;
},getStackTraceFromError:function(N){var R=[];

if(qx.core.Environment.get(n)===d){if(!N.stack){return R;
}var bd=/@(.+):(\d+)$/gm;
var Q;

while((Q=bd.exec(N.stack))!=null){var T=Q[1];
var bb=Q[2];
var Y=this.__dw(T);
R.push(Y+p+bb);
}
if(R.length>0){return this.__dy(R);
}var bd=/at (.*)/gm;
var bc=/\((.*?)(:[^\/].*)\)/;
var X=/(.*?)(:[^\/].*)/;
var Q;

while((Q=bd.exec(N.stack))!=null){var W=bc.exec(Q[1]);

if(!W){W=X.exec(Q[1]);
}
if(W){var Y=this.__dw(W[1]);
R.push(Y+W[2]);
}else{R.push(Q[1]);
}}}else if(qx.core.Environment.get(n)===a){var P=N.stacktrace;

if(!P){return R;
}
if(P.indexOf(m)>=0){P=P.split(m)[0];
}var bd=/line\ (\d+?),\ column\ (\d+?)\ in\ (?:.*?)\ in\ (.*?):[^\/]/gm;
var Q;

while((Q=bd.exec(P))!=null){var bb=Q[1];
var S=Q[2];
var T=Q[3];
var Y=this.__dw(T);
R.push(Y+p+bb+p+S);
}
if(R.length>0){return this.__dy(R);
}var bd=/Line\ (\d+?)\ of\ linked\ script\ (.*?)$/gm;
var Q;

while((Q=bd.exec(P))!=null){var bb=Q[1];
var T=Q[2];
var Y=this.__dw(T);
R.push(Y+p+bb);
}}else if(N.message&&N.message.indexOf("Backtrace:")>=0){var V=qx.lang.String.trim(N.message.split("Backtrace:")[1]);
var U=V.split(f);

for(var i=0;i<U.length;i++){var O=U[i].match(/\s*Line ([0-9]+) of.* (\S.*)/);

if(O&&O.length>=2){var bb=O[1];
var ba=this.__dw(O[2]);
R.push(ba+p+bb);
}}}else if(N.sourceURL&&N.line){R.push(this.__dw(N.sourceURL)+p+N.line);
}return this.__dy(R);
},__dw:function(be){if(typeof qx.dev.StackTrace.FILENAME_TO_CLASSNAME==l){var bf=qx.dev.StackTrace.FILENAME_TO_CLASSNAME(be);

if(false&&!qx.lang.Type.isString(bf)){throw new Error("FILENAME_TO_CLASSNAME must return a string!");
}return bf;
}return qx.dev.StackTrace.__dx(be);
},__dx:function(bg){var bk=e;
var bh=bg.indexOf(bk);
var bj=bg.indexOf(c);

if(bj>=0){bg=bg.substring(0,bj);
}var bi=(bh==-1)?bg:bg.substring(bh+bk.length).replace(/\//g,o).replace(/\.js$/,g);
return bi;
},__dy:function(bl){if(typeof qx.dev.StackTrace.FORMAT_STACKTRACE==l){bl=qx.dev.StackTrace.FORMAT_STACKTRACE(bl);
if(false&&!qx.lang.Type.isArray(bl)){throw new Error("FORMAT_STACKTRACE must return an array of strings!");
}}return bl;
}}});
})();
(function(){var f="ecmascript.objectcount",d="stack",c="ecmascript.stacktrace",b="stacktrace",a="qx.bom.client.EcmaScript";
qx.Bootstrap.define(a,{statics:{getObjectCount:function(){return (({}).__count__==0);
},getStackTrace:function(){var e=new Error();
return e.stacktrace?b:e.stack?d:null;
}},defer:function(g){qx.core.Environment.add(f,g.getObjectCount);
qx.core.Environment.add(c,g.getStackTrace);
}});
})();
(function(){var g="$$hash",f="qx.core.ObjectRegistry",e="-",d="",c="-0";
qx.Class.define(f,{statics:{inShutDown:false,__hv:{},__hw:0,__hx:[],__hy:d,__hz:{},register:function(h){var m=this.__hv;

if(!m){return;
}var k=h.$$hash;

if(k==null){var j=this.__hx;

if(j.length>0&&true){k=j.pop();
}else{k=(this.__hw++)+this.__hy;
}h.$$hash=k;
}m[k]=h;
},unregister:function(n){var o=n.$$hash;

if(o==null){return;
}var p=this.__hv;

if(p&&p[o]){delete p[o];
this.__hx.push(o);
}try{delete n.$$hash;
}catch(q){if(n.removeAttribute){n.removeAttribute(g);
}}},toHashCode:function(r){var t=r.$$hash;

if(t!=null){return t;
}var s=this.__hx;

if(s.length>0){t=s.pop();
}else{t=(this.__hw++)+this.__hy;
}return r.$$hash=t;
},clearHashCode:function(u){var v=u.$$hash;

if(v!=null){this.__hx.push(v);
try{delete u.$$hash;
}catch(w){if(u.removeAttribute){u.removeAttribute(g);
}}}},fromHashCode:function(x){return this.__hv[x]||null;
},shutdown:function(){this.inShutDown=true;
var z=this.__hv;
var B=[];

for(var A in z){B.push(A);
}B.sort(function(a,b){return parseInt(b,10)-parseInt(a,10);
});
var y,i=0,l=B.length;

while(true){try{for(;i<l;i++){A=B[i];
y=z[A];

if(y&&y.dispose){y.dispose();
}}}catch(C){qx.Bootstrap.error(this,"Could not dispose object "+y.toString()+": "+C,C);

if(i!==l){i++;
continue;
}}break;
}qx.Bootstrap.debug(this,"Disposed "+l+" objects");
delete this.__hv;
},getRegistry:function(){return this.__hv;
},getNextHash:function(){return this.__hw;
},getPostId:function(){return this.__hy;
},getStackTraces:function(){return this.__hz;
}},defer:function(D){if(window&&window.top){var frames=window.top.frames;

for(var i=0;i<frames.length;i++){if(frames[i]===window){D.__hy=e+(i+1);
return;
}}}D.__hy=c;
}});
})();
(function(){var f="qx.lang.Type",e="Error",d="RegExp",c="Date",b="Number",a="Boolean";
qx.Bootstrap.define(f,{statics:{getClass:qx.Bootstrap.getClass,isString:qx.Bootstrap.isString,isArray:qx.Bootstrap.isArray,isObject:qx.Bootstrap.isObject,isFunction:qx.Bootstrap.isFunction,isRegExp:function(g){return this.getClass(g)==d;
},isNumber:function(h){return (h!==null&&(this.getClass(h)==b||h instanceof Number));
},isBoolean:function(i){return (i!==null&&(this.getClass(i)==a||i instanceof Boolean));
},isDate:function(j){return (j!==null&&(this.getClass(j)==c||j instanceof Date));
},isError:function(k){return (k!==null&&(this.getClass(k)==e||k instanceof Error));
}}});
})();
(function(){var a="qx.core.AssertionError";
qx.Class.define(a,{extend:qx.type.BaseError,construct:function(b,c){qx.type.BaseError.call(this,b,c);
this.__dD=qx.dev.StackTrace.getStackTrace();
},members:{__dD:null,getStackTrace:function(){return this.__dD;
}}});
})();
(function(){var a="qx.core.ValidationError";
qx.Class.define(a,{extend:qx.type.BaseError});
})();
(function(){var a="qx.lang.RingBuffer";
qx.Class.define(a,{extend:Object,construct:function(b){this.setMaxEntries(b||50);
},members:{__eK:0,__eL:0,__eM:false,__eN:0,__eO:null,__eP:null,setMaxEntries:function(c){this.__eP=c;
this.clear();
},getMaxEntries:function(){return this.__eP;
},addEntry:function(d){this.__eO[this.__eK]=d;
this.__eK=this.__eQ(this.__eK,1);
var e=this.getMaxEntries();

if(this.__eL<e){this.__eL++;
}if(this.__eM&&(this.__eN<e)){this.__eN++;
}},mark:function(){this.__eM=true;
this.__eN=0;
},clearMark:function(){this.__eM=false;
},getAllEntries:function(){return this.getEntries(this.getMaxEntries(),false);
},getEntries:function(f,g){if(f>this.__eL){f=this.__eL;
}if(g&&this.__eM&&(f>this.__eN)){f=this.__eN;
}
if(f>0){var i=this.__eQ(this.__eK,-1);
var h=this.__eQ(i,-f+1);
var j;

if(h<=i){j=this.__eO.slice(h,i+1);
}else{j=this.__eO.slice(h,this.__eL).concat(this.__eO.slice(0,i+1));
}}else{j=[];
}return j;
},clear:function(){this.__eO=new Array(this.getMaxEntries());
this.__eL=0;
this.__eN=0;
this.__eK=0;
},__eQ:function(k,l){var m=this.getMaxEntries();
var n=(k+l)%m;
if(n<0){n+=m;
}return n;
}}});
})();
(function(){var a="qx.log.appender.RingBuffer";
qx.Class.define(a,{extend:qx.lang.RingBuffer,construct:function(b){this.setMaxMessages(b||50);
},members:{setMaxMessages:function(c){this.setMaxEntries(c);
},getMaxMessages:function(){return this.getMaxEntries();
},process:function(d){this.addEntry(d);
},getAllLogEvents:function(){return this.getAllEntries();
},retrieveLogEvents:function(e,f){return this.getEntries(e,f);
},clearHistory:function(){this.clear();
}}});
})();
(function(){var k="node",j="error",h="...(+",g="array",f=")",e="info",d="instance",c="string",b="null",a="class",H="number",G="stringify",F="]",E="date",D="unknown",C="function",B="boolean",A="debug",z="map",y="undefined",s="qx.log.Logger",t="[",q="#",r="warn",o="document",p="{...(",m="text[",n="[...(",u="\n",v=")}",x=")]",w="object";
qx.Class.define(s,{statics:{__jQ:A,setLevel:function(I){this.__jQ=I;
},getLevel:function(){return this.__jQ;
},setTreshold:function(J){this.__jS.setMaxMessages(J);
},getTreshold:function(){return this.__jS.getMaxMessages();
},__jR:{},__dm:0,register:function(K){if(K.$$id){return;
}var M=this.__dm++;
this.__jR[M]=K;
K.$$id=M;
var L=this.__jT;
var N=this.__jS.getAllLogEvents();

for(var i=0,l=N.length;i<l;i++){if(L[N[i].level]>=L[this.__jQ]){K.process(N[i]);
}}},unregister:function(O){var P=O.$$id;

if(P==null){return;
}delete this.__jR[P];
delete O.$$id;
},debug:function(Q,R){qx.log.Logger.__jU(A,arguments);
},info:function(S,T){qx.log.Logger.__jU(e,arguments);
},warn:function(U,V){qx.log.Logger.__jU(r,arguments);
},error:function(W,X){qx.log.Logger.__jU(j,arguments);
},trace:function(Y){qx.log.Logger.__jU(e,[Y,qx.dev.StackTrace.getStackTrace().join(u)]);
},deprecatedMethodWarning:function(ba,bb){var bc;
},deprecatedClassWarning:function(bd,be){var bf;
},deprecatedEventWarning:function(bg,event,bh){var bi;
},deprecatedMixinWarning:function(bj,bk){var bl;
},deprecatedConstantWarning:function(bm,bn,bo){var self,bp;
},deprecateMethodOverriding:function(bq,br,bs,bt){var bu;
},clear:function(){this.__jS.clearHistory();
},__jS:new qx.log.appender.RingBuffer(50),__jT:{debug:0,info:1,warn:2,error:3},__jU:function(bv,bw){var bB=this.__jT;

if(bB[bv]<bB[this.__jQ]){return;
}var by=bw.length<2?null:bw[0];
var bA=by?1:0;
var bx=[];

for(var i=bA,l=bw.length;i<l;i++){bx.push(this.__jW(bw[i],true));
}var bC=new Date;
var bD={time:bC,offset:bC-qx.Bootstrap.LOADSTART,level:bv,items:bx,win:window};
if(by){if(by.$$hash!==undefined){bD.object=by.$$hash;
}else if(by.$$type){bD.clazz=by;
}}this.__jS.process(bD);
var bE=this.__jR;

for(var bz in bE){bE[bz].process(bD);
}},__jV:function(bF){if(bF===undefined){return y;
}else if(bF===null){return b;
}
if(bF.$$type){return a;
}var bG=typeof bF;

if(bG===C||bG==c||bG===H||bG===B){return bG;
}else if(bG===w){if(bF.nodeType){return k;
}else if(bF.classname){return d;
}else if(bF instanceof Array){return g;
}else if(bF instanceof Error){return j;
}else if(bF instanceof Date){return E;
}else{return z;
}}
if(bF.toString){return G;
}return D;
},__jW:function(bH,bI){var bP=this.__jV(bH);
var bL=D;
var bK=[];

switch(bP){case b:case y:bL=bP;
break;
case c:case H:case B:case E:bL=bH;
break;
case k:if(bH.nodeType===9){bL=o;
}else if(bH.nodeType===3){bL=m+bH.nodeValue+F;
}else if(bH.nodeType===1){bL=bH.nodeName.toLowerCase();

if(bH.id){bL+=q+bH.id;
}}else{bL=k;
}break;
case C:bL=qx.lang.Function.getName(bH)||bP;
break;
case d:bL=bH.basename+t+bH.$$hash+F;
break;
case a:case G:bL=bH.toString();
break;
case j:bK=qx.dev.StackTrace.getStackTraceFromError(bH);
bL=bH.toString();
break;
case g:if(bI){bL=[];

for(var i=0,l=bH.length;i<l;i++){if(bL.length>20){bL.push(h+(l-i)+f);
break;
}bL.push(this.__jW(bH[i],false));
}}else{bL=n+bH.length+x;
}break;
case z:if(bI){var bJ;
var bO=[];

for(var bN in bH){bO.push(bN);
}bO.sort();
bL=[];

for(var i=0,l=bO.length;i<l;i++){if(bL.length>20){bL.push(h+(l-i)+f);
break;
}bN=bO[i];
bJ=this.__jW(bH[bN],false);
bJ.key=bN;
bL.push(bJ);
}}else{var bM=0;

for(var bN in bH){bM++;
}bL=p+bM+v;
}break;
}return {type:bP,text:bL,trace:bK};
}},defer:function(bQ){var bR=qx.Bootstrap.$$logs;

for(var i=0;i<bR.length;i++){bQ.__jU(bR[i][0],bR[i][1]);
}qx.Bootstrap.debug=bQ.debug;
qx.Bootstrap.info=bQ.info;
qx.Bootstrap.warn=bQ.warn;
qx.Bootstrap.error=bQ.error;
qx.Bootstrap.trace=bQ.trace;
}});
})();
(function(){var d="set",c="reset",b="get",a="qx.core.MProperty";
qx.Mixin.define(a,{members:{set:function(e,f){var h=qx.core.Property.$$method.set;

if(qx.Bootstrap.isString(e)){if(!this[h[e]]){if(this[d+qx.Bootstrap.firstUp(e)]!=undefined){this[d+qx.Bootstrap.firstUp(e)](f);
return this;
}}return this[h[e]](f);
}else{for(var g in e){if(!this[h[g]]){if(this[d+qx.Bootstrap.firstUp(g)]!=undefined){this[d+qx.Bootstrap.firstUp(g)](e[g]);
continue;
}}this[h[g]](e[g]);
}return this;
}},get:function(i){var j=qx.core.Property.$$method.get;

if(!this[j[i]]){if(this[b+qx.Bootstrap.firstUp(i)]!=undefined){return this[b+qx.Bootstrap.firstUp(i)]();
}}return this[j[i]]();
},reset:function(k){var l=qx.core.Property.$$method.reset;

if(!this[l[k]]){if(this[c+qx.Bootstrap.firstUp(k)]!=undefined){this[c+qx.Bootstrap.firstUp(k)]();
return;
}}this[l[k]]();
}}});
})();
(function(){var e="info",d="debug",c="warn",b="qx.core.MLogging",a="error";
qx.Mixin.define(b,{members:{__bH:qx.log.Logger,debug:function(f){this.__bI(d,arguments);
},info:function(g){this.__bI(e,arguments);
},warn:function(h){this.__bI(c,arguments);
},error:function(i){this.__bI(a,arguments);
},trace:function(){this.__bH.trace(this);
},__bI:function(j,k){var l=qx.lang.Array.fromArguments(k);
l.unshift(this);
this.__bH[j].apply(this.__bH,l);
}}});
})();
(function(){var c="qx.dom.Node",b="";
qx.Bootstrap.define(c,{statics:{ELEMENT:1,ATTRIBUTE:2,TEXT:3,CDATA_SECTION:4,ENTITY_REFERENCE:5,ENTITY:6,PROCESSING_INSTRUCTION:7,COMMENT:8,DOCUMENT:9,DOCUMENT_TYPE:10,DOCUMENT_FRAGMENT:11,NOTATION:12,getDocument:function(d){return d.nodeType===this.DOCUMENT?d:d.ownerDocument||d.document;
},getWindow:function(e){if(e.nodeType==null){return e;
}if(e.nodeType!==this.DOCUMENT){e=e.ownerDocument;
}return e.defaultView||e.parentWindow;
},getDocumentElement:function(f){return this.getDocument(f).documentElement;
},getBodyElement:function(g){return this.getDocument(g).body;
},isNode:function(h){return !!(h&&h.nodeType!=null);
},isElement:function(j){return !!(j&&j.nodeType===this.ELEMENT);
},isDocument:function(k){return !!(k&&k.nodeType===this.DOCUMENT);
},isText:function(l){return !!(l&&l.nodeType===this.TEXT);
},isWindow:function(m){return !!(m&&m.history&&m.location&&m.document);
},isNodeName:function(n,o){if(!o||!n||!n.nodeName){return false;
}return o.toLowerCase()==qx.dom.Node.getName(n);
},getName:function(p){if(!p||!p.nodeName){return null;
}return p.nodeName.toLowerCase();
},getText:function(q){if(!q||!q.nodeType){return null;
}
switch(q.nodeType){case 1:var i,a=[],r=q.childNodes,length=r.length;

for(i=0;i<length;i++){a[i]=this.getText(r[i]);
}return a.join(b);
case 2:case 3:case 4:return q.nodeValue;
}return null;
},isBlockNode:function(s){if(!qx.dom.Node.isElement(s)){return false;
}s=qx.dom.Node.getName(s);
return /^(body|form|textarea|fieldset|ul|ol|dl|dt|dd|li|div|hr|p|h[1-6]|quote|pre|table|thead|tbody|tfoot|tr|td|th|iframe|address|blockquote)$/.test(s);
}}});
})();
(function(){var l="on",k="engine.name",j="gecko",i="engine.version",h="function",g="undefined",f="mousedown",d="qx.bom.Event",c="return;",b="mouseover",a="HTMLEvents";
qx.Bootstrap.define(d,{statics:{addNativeListener:function(m,n,o,p){if(m.addEventListener){m.addEventListener(n,o,!!p);
}else if(m.attachEvent){m.attachEvent(l+n,o);
}else if(typeof m[l+n]!=g){m[l+n]=o;
}else{}},removeNativeListener:function(q,r,s,t){if(q.removeEventListener){q.removeEventListener(r,s,!!t);
}else if(q.detachEvent){try{q.detachEvent(l+r,s);
}catch(e){if(e.number!==-2146828218){throw e;
}}}else if(typeof q[l+r]!=g){q[l+r]=null;
}else{}},getTarget:function(e){return e.target||e.srcElement;
},getRelatedTarget:function(e){if(e.relatedTarget!==undefined){if((qx.core.Environment.get(k)==j)){try{e.relatedTarget&&e.relatedTarget.nodeType;
}catch(e){return null;
}}return e.relatedTarget;
}else if(e.fromElement!==undefined&&e.type===b){return e.fromElement;
}else if(e.toElement!==undefined){return e.toElement;
}else{return null;
}},preventDefault:function(e){if(e.preventDefault){if((qx.core.Environment.get(k)==j)&&parseFloat(qx.core.Environment.get(i))>=1.9&&e.type==f&&e.button==2){return;
}e.preventDefault();
if((qx.core.Environment.get(k)==j)&&parseFloat(qx.core.Environment.get(i))<1.9){try{e.keyCode=0;
}catch(u){}}}else{try{e.keyCode=0;
}catch(v){}e.returnValue=false;
}},stopPropagation:function(e){if(e.stopPropagation){e.stopPropagation();
}else{e.cancelBubble=true;
}},fire:function(w,x){if(document.createEvent){var y=document.createEvent(a);
y.initEvent(x,true,true);
return !w.dispatchEvent(y);
}else{var y=document.createEventObject();
return w.fireEvent(l+x,y);
}},supportsEvent:function(z,A){var B=l+A;
var C=(B in z);

if(!C){C=typeof z[B]==h;

if(!C&&z.setAttribute){z.setAttribute(B,c);
C=typeof z[B]==h;
z.removeAttribute(B);
}}return C;
}}});
})();
(function(){var r="|bubble",q="|capture",p="|",o="",n="_",m="unload",k="UNKNOWN_",j="c",h="__jO",g="__jP",c="DOM_",f="WIN_",e="QX_",b="qx.event.Manager",a="capture",d="DOCUMENT_";
qx.Class.define(b,{extend:Object,construct:function(s,t){this.__cw=s;
this.__jX=qx.core.ObjectRegistry.toHashCode(s);
this.__de=t;
if(s.qx!==qx){var self=this;
qx.bom.Event.addNativeListener(s,m,qx.event.GlobalError.observeMethod(function(){qx.bom.Event.removeNativeListener(s,m,arguments.callee);
self.dispose();
}));
}this.__jY={};
this.__jO={};
this.__jP={};
this.__ka={};
},statics:{__kb:0,getNextUniqueId:function(){return (this.__kb++)+o;
}},members:{__de:null,__jY:null,__jP:null,__kc:null,__jO:null,__ka:null,__cw:null,__jX:null,getWindow:function(){return this.__cw;
},getWindowId:function(){return this.__jX;
},getHandler:function(u){var v=this.__jO[u.classname];

if(v){return v;
}return this.__jO[u.classname]=new u(this);
},getDispatcher:function(w){var x=this.__jP[w.classname];

if(x){return x;
}return this.__jP[w.classname]=new w(this,this.__de);
},getListeners:function(y,z,A){var B=y.$$hash||qx.core.ObjectRegistry.toHashCode(y);
var D=this.__jY[B];

if(!D){return null;
}var E=z+(A?q:r);
var C=D[E];
return C?C.concat():null;
},getAllListeners:function(){return this.__jY;
},serializeListeners:function(F){var M=F.$$hash||qx.core.ObjectRegistry.toHashCode(F);
var O=this.__jY[M];
var K=[];

if(O){var I,N,G,J,L;

for(var H in O){I=H.indexOf(p);
N=H.substring(0,I);
G=H.charAt(I+1)==j;
J=O[H];

for(var i=0,l=J.length;i<l;i++){L=J[i];
K.push({self:L.context,handler:L.handler,type:N,capture:G});
}}}return K;
},toggleAttachedEvents:function(P,Q){var V=P.$$hash||qx.core.ObjectRegistry.toHashCode(P);
var X=this.__jY[V];

if(X){var S,W,R,T;

for(var U in X){S=U.indexOf(p);
W=U.substring(0,S);
R=U.charCodeAt(S+1)===99;
T=X[U];

if(Q){this.__kd(P,W,R);
}else{this.__ke(P,W,R);
}}}},hasListener:function(Y,ba,bb){var bc=Y.$$hash||qx.core.ObjectRegistry.toHashCode(Y);
var be=this.__jY[bc];

if(!be){return false;
}var bf=ba+(bb?q:r);
var bd=be[bf];
return !!(bd&&bd.length>0);
},importListeners:function(bg,bh){var bn=bg.$$hash||qx.core.ObjectRegistry.toHashCode(bg);
var bo=this.__jY[bn]={};
var bk=qx.event.Manager;

for(var bi in bh){var bl=bh[bi];
var bm=bl.type+(bl.capture?q:r);
var bj=bo[bm];

if(!bj){bj=bo[bm]=[];
this.__kd(bg,bl.type,bl.capture);
}bj.push({handler:bl.listener,context:bl.self,unique:bl.unique||(bk.__kb++)+o});
}},addListener:function(bp,bq,br,self,bs){var bw;
var bx=bp.$$hash||qx.core.ObjectRegistry.toHashCode(bp);
var bz=this.__jY[bx];

if(!bz){bz=this.__jY[bx]={};
}var bv=bq+(bs?q:r);
var bu=bz[bv];

if(!bu){bu=bz[bv]=[];
}if(bu.length===0){this.__kd(bp,bq,bs);
}var by=(qx.event.Manager.__kb++)+o;
var bt={handler:br,context:self,unique:by};
bu.push(bt);
return bv+p+by;
},findHandler:function(bA,bB){var bN=false,bF=false,bO=false,bC=false;
var bL;

if(bA.nodeType===1){bN=true;
bL=c+bA.tagName.toLowerCase()+n+bB;
}else if(bA.nodeType===9){bC=true;
bL=d+bB;
}else if(bA==this.__cw){bF=true;
bL=f+bB;
}else if(bA.classname){bO=true;
bL=e+bA.classname+n+bB;
}else{bL=k+bA+n+bB;
}var bH=this.__ka;

if(bH[bL]){return bH[bL];
}var bK=this.__de.getHandlers();
var bG=qx.event.IEventHandler;
var bI,bJ,bE,bD;

for(var i=0,l=bK.length;i<l;i++){bI=bK[i];
bE=bI.SUPPORTED_TYPES;

if(bE&&!bE[bB]){continue;
}bD=bI.TARGET_CHECK;

if(bD){var bM=false;

if(bN&&((bD&bG.TARGET_DOMNODE)!=0)){bM=true;
}else if(bF&&((bD&bG.TARGET_WINDOW)!=0)){bM=true;
}else if(bO&&((bD&bG.TARGET_OBJECT)!=0)){bM=true;
}else if(bC&&((bD&bG.TARGET_DOCUMENT)!=0)){bM=true;
}
if(!bM){continue;
}}bJ=this.getHandler(bK[i]);

if(bI.IGNORE_CAN_HANDLE||bJ.canHandleEvent(bA,bB)){bH[bL]=bJ;
return bJ;
}}return null;
},__kd:function(bP,bQ,bR){var bS=this.findHandler(bP,bQ);

if(bS){bS.registerEvent(bP,bQ,bR);
return;
}},removeListener:function(bT,bU,bV,self,bW){var cb;
var cc=bT.$$hash||qx.core.ObjectRegistry.toHashCode(bT);
var cd=this.__jY[cc];

if(!cd){return false;
}var bX=bU+(bW?q:r);
var bY=cd[bX];

if(!bY){return false;
}var ca;

for(var i=0,l=bY.length;i<l;i++){ca=bY[i];

if(ca.handler===bV&&ca.context===self){qx.lang.Array.removeAt(bY,i);

if(bY.length==0){this.__ke(bT,bU,bW);
}return true;
}}return false;
},removeListenerById:function(ce,cf){var cl;
var cj=cf.split(p);
var co=cj[0];
var cg=cj[1].charCodeAt(0)==99;
var cn=cj[2];
var cm=ce.$$hash||qx.core.ObjectRegistry.toHashCode(ce);
var cp=this.__jY[cm];

if(!cp){return false;
}var ck=co+(cg?q:r);
var ci=cp[ck];

if(!ci){return false;
}var ch;

for(var i=0,l=ci.length;i<l;i++){ch=ci[i];

if(ch.unique===cn){qx.lang.Array.removeAt(ci,i);

if(ci.length==0){this.__ke(ce,co,cg);
}return true;
}}return false;
},removeAllListeners:function(cq){var cu=cq.$$hash||qx.core.ObjectRegistry.toHashCode(cq);
var cw=this.__jY[cu];

if(!cw){return false;
}var cs,cv,cr;

for(var ct in cw){if(cw[ct].length>0){cs=ct.split(p);
cv=cs[0];
cr=cs[1]===a;
this.__ke(cq,cv,cr);
}}delete this.__jY[cu];
return true;
},deleteAllListeners:function(cx){delete this.__jY[cx];
},__ke:function(cy,cz,cA){var cB=this.findHandler(cy,cz);

if(cB){cB.unregisterEvent(cy,cz,cA);
return;
}},dispatchEvent:function(cC,event){var cH;
var cI=event.getType();

if(!event.getBubbles()&&!this.hasListener(cC,cI)){qx.event.Pool.getInstance().poolObject(event);
return true;
}
if(!event.getTarget()){event.setTarget(cC);
}var cG=this.__de.getDispatchers();
var cF;
var cE=false;

for(var i=0,l=cG.length;i<l;i++){cF=this.getDispatcher(cG[i]);
if(cF.canDispatchEvent(cC,event,cI)){cF.dispatchEvent(cC,event,cI);
cE=true;
break;
}}
if(!cE){return true;
}var cD=event.getDefaultPrevented();
qx.event.Pool.getInstance().poolObject(event);
return !cD;
},dispose:function(){this.__de.removeManager(this);
qx.util.DisposeUtil.disposeMap(this,h);
qx.util.DisposeUtil.disposeMap(this,g);
this.__jY=this.__cw=this.__kc=null;
this.__de=this.__ka=null;
}}});
})();
(function(){var b="qx.globalErrorHandling",a="qx.event.GlobalError";
qx.Bootstrap.define(a,{statics:{__il:function(){if(qx.core&&qx.core.Environment){return qx.core.Environment.get(b);
}else{return !!qx.Bootstrap.getEnvironmentSetting(b);
}},setErrorHandler:function(c,d){this.__eI=c||null;
this.__eJ=d||window;

if(this.__il()){if(c&&window.onerror){var e=qx.Bootstrap.bind(this.__in,this);

if(this.__im==null){this.__im=window.onerror;
}var self=this;
window.onerror=function(f,g,h){self.__im(f,g,h);
e(f,g,h);
};
}
if(c&&!window.onerror){window.onerror=qx.Bootstrap.bind(this.__in,this);
}if(this.__eI==null){if(this.__im!=null){window.onerror=this.__im;
this.__im=null;
}else{window.onerror=null;
}}}},__in:function(i,j,k){if(this.__eI){this.handleError(new qx.core.WindowError(i,j,k));
return true;
}},observeMethod:function(l){if(this.__il()){var self=this;
return function(){if(!self.__eI){return l.apply(this,arguments);
}
try{return l.apply(this,arguments);
}catch(m){self.handleError(new qx.core.GlobalError(m,arguments));
}};
}else{return l;
}},handleError:function(n){if(this.__eI){this.__eI.call(this.__eJ,n);
}}},defer:function(o){if(qx.core&&qx.core.Environment){qx.core.Environment.add(b,true);
}else{qx.Bootstrap.setEnvironmentSetting(b,true);
}o.setErrorHandler(null,null);
}});
})();
(function(){var b="",a="qx.core.WindowError";
qx.Bootstrap.define(a,{extend:Error,construct:function(c,d,e){var f=Error.call(this,c);
if(f.stack){this.stack=f.stack;
}
if(f.stacktrace){this.stacktrace=f.stacktrace;
}this.__bX=c;
this.__bY=d||b;
this.__ca=e===undefined?-1:e;
},members:{__bX:null,__bY:null,__ca:null,toString:function(){return this.__bX;
},getUri:function(){return this.__bY;
},getLineNumber:function(){return this.__ca;
}}});
})();
(function(){var b="GlobalError: ",a="qx.core.GlobalError";
qx.Bootstrap.define(a,{extend:Error,construct:function(c,d){if(qx.Bootstrap.DEBUG){qx.core.Assert.assertNotUndefined(c);
}this.__bX=b+(c&&c.message?c.message:c);
var e=Error.call(this,this.__bX);
if(e.stack){this.stack=e.stack;
}
if(e.stacktrace){this.stacktrace=e.stacktrace;
}this.__kM=d;
this.__kN=c;
},members:{__kN:null,__kM:null,__bX:null,toString:function(){return this.__bX;
},getArguments:function(){return this.__kM;
},getSourceException:function(){return this.__kN;
}},destruct:function(){this.__kN=null;
this.__kM=null;
this.__bX=null;
}});
})();
(function(){var p="",o="!",n="'!",m="'",k="Expected '",j="' (rgb(",h=",",g=")), but found value '",f="Event (",d="Expected value to be the CSS color '",bz="' but found ",by="]",bx=", ",bw="The value '",bv=" != ",bu="qx.core.Object",bt="Expected value to be an array but found ",bs=") was fired.",br="Expected value to be an integer >= 0 but found ",bq="' to be not equal with '",w="' to '",x="Expected object '",u="Called assertTrue with '",v="Expected value to be a map but found ",s="The function did not raise an exception!",t="Expected value to be undefined but found ",q="Expected value to be a DOM element but found  '",r="Expected value to be a regular expression but found ",E="' to implement the interface '",F="Expected value to be null but found ",S="Invalid argument 'type'",O="Called assert with 'false'",bb="Assertion error! ",V="null",bm="' but found '",bg="' must must be a key of the map '",J="The String '",bp="Expected value to be a string but found ",bo="Expected value not to be undefined but found undefined!",bn="qx.util.ColorUtil",I=": ",L="The raised exception does not have the expected type! ",N=") not fired.",Q="qx.core.Assert",T="Expected value to be typeof object but found ",W="' (identical) but found '",bd="' must have any of the values defined in the array '",bi="Expected value to be a number but found ",y="Called assertFalse with '",z="qx.ui.core.Widget",K="Expected value to be a qooxdoo object but found ",ba="' arguments.",Y="Expected value '%1' to be in the range '%2'..'%3'!",X="Array[",bf="' does not match the regular expression '",be="' to be not identical with '",U="Expected [",bc="' arguments but found '",a="', which cannot be converted to a CSS color!",bh="qx.core.AssertionError",A="Expected value to be a boolean but found ",B="Expected value not to be null but found null!",P="))!",b="Expected value to be a qooxdoo widget but found ",c="Expected value to be typeof '",H="Expected value to be typeof function but found ",C="Expected value to be an integer but found ",D="Called fail().",G="The parameter 're' must be a string or a regular expression.",R="Expected value to be a number >= 0 but found ",bk="Expected value to be instanceof '",bj="], but found [",M="Wrong number of arguments given. Expected '",bl="object";
qx.Class.define(Q,{statics:{__er:true,__es:function(bA,bB){var bF=p;

for(var i=1,l=arguments.length;i<l;i++){bF=bF+this.__et(arguments[i]);
}var bE=p;

if(bF){bE=bA+I+bF;
}else{bE=bA;
}var bD=bb+bE;

if(qx.Class.isDefined(bh)){var bC=new qx.core.AssertionError(bA,bF);

if(this.__er){qx.Bootstrap.error(bD+"\n Stack trace: \n"+bC.getStackTrace());
}throw bC;
}else{if(this.__er){qx.Bootstrap.error(bD);
}throw new Error(bD);
}},__et:function(bG){var bH;

if(bG===null){bH=V;
}else if(qx.lang.Type.isArray(bG)&&bG.length>10){bH=X+bG.length+by;
}else if((bG instanceof Object)&&(bG.toString==null)){bH=qx.lang.Json.stringify(bG,null,2);
}else{try{bH=bG.toString();
}catch(e){bH=p;
}}return bH;
},assert:function(bI,bJ){bI==true||this.__es(bJ||p,O);
},fail:function(bK,bL){var bM=bL?p:D;
this.__es(bK||p,bM);
},assertTrue:function(bN,bO){(bN===true)||this.__es(bO||p,u,bN,m);
},assertFalse:function(bP,bQ){(bP===false)||this.__es(bQ||p,y,bP,m);
},assertEquals:function(bR,bS,bT){bR==bS||this.__es(bT||p,k,bR,bm,bS,n);
},assertNotEquals:function(bU,bV,bW){bU!=bV||this.__es(bW||p,k,bU,bq,bV,n);
},assertIdentical:function(bX,bY,ca){bX===bY||this.__es(ca||p,k,bX,W,bY,n);
},assertNotIdentical:function(cb,cc,cd){cb!==cc||this.__es(cd||p,k,cb,be,cc,n);
},assertNotUndefined:function(ce,cf){ce!==undefined||this.__es(cf||p,bo);
},assertUndefined:function(cg,ch){cg===undefined||this.__es(ch||p,t,cg,o);
},assertNotNull:function(ci,cj){ci!==null||this.__es(cj||p,B);
},assertNull:function(ck,cl){ck===null||this.__es(cl||p,F,ck,o);
},assertJsonEquals:function(cm,cn,co){this.assertEquals(qx.lang.Json.stringify(cm),qx.lang.Json.stringify(cn),co);
},assertMatch:function(cp,cq,cr){this.assertString(cp);
this.assert(qx.lang.Type.isRegExp(cq)||qx.lang.Type.isString(cq),G);
cp.search(cq)>=0||this.__es(cr||p,J,cp,bf,cq.toString(),n);
},assertArgumentsCount:function(cs,ct,cu,cv){var cw=cs.length;
(cw>=ct&&cw<=cu)||this.__es(cv||p,M,ct,w,cu,bc,arguments.length,ba);
},assertEventFired:function(cx,event,cy,cz,cA){var cC=false;
var cB=function(e){if(cz){cz.call(cx,e);
}cC=true;
};
var cD;

try{cD=cx.addListener(event,cB,cx);
cy.call();
}catch(cE){throw cE;
}finally{try{cx.removeListenerById(cD);
}catch(cF){}}cC===true||this.__es(cA||p,f,event,N);
},assertEventNotFired:function(cG,event,cH,cI){var cK=false;
var cJ=function(e){cK=true;
};
var cL=cG.addListener(event,cJ,cG);
cH.call();
cK===false||this.__es(cI||p,f,event,bs);
cG.removeListenerById(cL);
},assertException:function(cM,cN,cO,cP){var cN=cN||Error;
var cQ;

try{this.__er=false;
cM();
}catch(cR){cQ=cR;
}finally{this.__er=true;
}
if(cQ==null){this.__es(cP||p,s);
}cQ instanceof cN||this.__es(cP||p,L,cN,bv,cQ);

if(cO){this.assertMatch(cQ.toString(),cO,cP);
}},assertInArray:function(cS,cT,cU){cT.indexOf(cS)!==-1||this.__es(cU||p,bw,cS,bd,cT,m);
},assertArrayEquals:function(cV,cW,cX){this.assertArray(cV,cX);
this.assertArray(cW,cX);
cX=cX||U+cV.join(bx)+bj+cW.join(bx)+by;

if(cV.length!==cW.length){this.fail(cX,true);
}
for(var i=0;i<cV.length;i++){if(cV[i]!==cW[i]){this.fail(cX,true);
}}},assertKeyInMap:function(cY,da,db){da[cY]!==undefined||this.__es(db||p,bw,cY,bg,da,m);
},assertFunction:function(dc,dd){qx.lang.Type.isFunction(dc)||this.__es(dd||p,H,dc,o);
},assertString:function(de,df){qx.lang.Type.isString(de)||this.__es(df||p,bp,de,o);
},assertBoolean:function(dg,dh){qx.lang.Type.isBoolean(dg)||this.__es(dh||p,A,dg,o);
},assertNumber:function(di,dj){(qx.lang.Type.isNumber(di)&&isFinite(di))||this.__es(dj||p,bi,di,o);
},assertPositiveNumber:function(dk,dl){(qx.lang.Type.isNumber(dk)&&isFinite(dk)&&dk>=0)||this.__es(dl||p,R,dk,o);
},assertInteger:function(dm,dn){(qx.lang.Type.isNumber(dm)&&isFinite(dm)&&dm%1===0)||this.__es(dn||p,C,dm,o);
},assertPositiveInteger:function(dp,dq){var dr=(qx.lang.Type.isNumber(dp)&&isFinite(dp)&&dp%1===0&&dp>=0);
dr||this.__es(dq||p,br,dp,o);
},assertInRange:function(ds,dt,du,dv){(ds>=dt&&ds<=du)||this.__es(dv||p,qx.lang.String.format(Y,[ds,dt,du]));
},assertObject:function(dw,dx){var dy=dw!==null&&(qx.lang.Type.isObject(dw)||typeof dw===bl);
dy||this.__es(dx||p,T,(dw),o);
},assertArray:function(dz,dA){qx.lang.Type.isArray(dz)||this.__es(dA||p,bt,dz,o);
},assertMap:function(dB,dC){qx.lang.Type.isObject(dB)||this.__es(dC||p,v,dB,o);
},assertRegExp:function(dD,dE){qx.lang.Type.isRegExp(dD)||this.__es(dE||p,r,dD,o);
},assertType:function(dF,dG,dH){this.assertString(dG,S);
typeof (dF)===dG||this.__es(dH||p,c,dG,bz,dF,o);
},assertInstance:function(dI,dJ,dK){var dL=dJ.classname||dJ+p;
dI instanceof dJ||this.__es(dK||p,bk,dL,bz,dI,o);
},assertInterface:function(dM,dN,dO){qx.Class.implementsInterface(dM,dN)||this.__es(dO||p,x,dM,E,dN,n);
},assertCssColor:function(dP,dQ,dR){var dS=qx.Class.getByName(bn);

if(!dS){throw new Error("qx.util.ColorUtil not available! Your code must have a dependency on 'qx.util.ColorUtil'");
}var dU=dS.stringToRgb(dP);

try{var dT=dS.stringToRgb(dQ);
}catch(dW){this.__es(dR||p,d,dP,j,dU.join(h),g,dQ,a);
}var dV=dU[0]==dT[0]&&dU[1]==dT[1]&&dU[2]==dT[2];
dV||this.__es(dR||p,d,dU,j,dU.join(h),g,dQ,j,dT.join(h),P);
},assertElement:function(dX,dY){!!(dX&&dX.nodeType===1)||this.__es(dY||p,q,dX,n);
},assertQxObject:function(ea,eb){this.__eu(ea,bu)||this.__es(eb||p,K,ea,o);
},assertQxWidget:function(ec,ed){this.__eu(ec,z)||this.__es(ed||p,b,ec,o);
},__eu:function(ee,ef){if(!ee){return false;
}var eg=ee.constructor;

while(eg){if(eg.classname===ef){return true;
}eg=eg.superclass;
}return false;
}}});
})();
(function(){var p='',o='"',m=':',l=']',h='null',g=': ',f='object',e='function',d=',',b='\n',ba='\\u',Y=',\n',X='0000',W='string',V="Cannot stringify a recursive object.",U='0',T='-',S='}',R='String',Q='Boolean',x='\\\\',y='\\f',u='\\t',w='{\n',s='[]',t="qx.lang.JsonImpl",q='Z',r='\\n',z='Object',A='{}',H='@',F='.',K='(',J='Array',M='T',L='\\r',C='{',P='JSON.parse',O=' ',N='[',B='Number',D=')',E='[\n',G='\\"',I='\\b';
qx.Class.define(t,{extend:Object,construct:function(){this.stringify=qx.lang.Function.bind(this.stringify,this);
this.parse=qx.lang.Function.bind(this.parse,this);
},members:{__fJ:null,__fK:null,__fL:null,__fM:null,stringify:function(bb,bc,bd){this.__fJ=p;
this.__fK=p;
this.__fM=[];

if(qx.lang.Type.isNumber(bd)){var bd=Math.min(10,Math.floor(bd));

for(var i=0;i<bd;i+=1){this.__fK+=O;
}}else if(qx.lang.Type.isString(bd)){if(bd.length>10){bd=bd.slice(0,10);
}this.__fK=bd;
}if(bc&&(qx.lang.Type.isFunction(bc)||qx.lang.Type.isArray(bc))){this.__fL=bc;
}else{this.__fL=null;
}return this.__fN(p,{'':bb});
},__fN:function(be,bf){var bi=this.__fJ,bg,bj=bf[be];
if(bj&&qx.lang.Type.isFunction(bj.toJSON)){bj=bj.toJSON(be);
}else if(qx.lang.Type.isDate(bj)){bj=this.dateToJSON(bj);
}if(typeof this.__fL===e){bj=this.__fL.call(bf,be,bj);
}
if(bj===null){return h;
}
if(bj===undefined){return undefined;
}switch(qx.lang.Type.getClass(bj)){case R:return this.__fO(bj);
case B:return isFinite(bj)?String(bj):h;
case Q:return String(bj);
case J:this.__fJ+=this.__fK;
bg=[];

if(this.__fM.indexOf(bj)!==-1){throw new TypeError(V);
}this.__fM.push(bj);
var length=bj.length;

for(var i=0;i<length;i+=1){bg[i]=this.__fN(i,bj)||h;
}this.__fM.pop();
if(bg.length===0){var bh=s;
}else if(this.__fJ){bh=E+this.__fJ+bg.join(Y+this.__fJ)+b+bi+l;
}else{bh=N+bg.join(d)+l;
}this.__fJ=bi;
return bh;
case z:this.__fJ+=this.__fK;
bg=[];

if(this.__fM.indexOf(bj)!==-1){throw new TypeError(V);
}this.__fM.push(bj);
if(this.__fL&&typeof this.__fL===f){var length=this.__fL.length;

for(var i=0;i<length;i+=1){var k=this.__fL[i];

if(typeof k===W){var v=this.__fN(k,bj);

if(v){bg.push(this.__fO(k)+(this.__fJ?g:m)+v);
}}}}else{for(var k in bj){if(Object.hasOwnProperty.call(bj,k)){var v=this.__fN(k,bj);

if(v){bg.push(this.__fO(k)+(this.__fJ?g:m)+v);
}}}}this.__fM.pop();
if(bg.length===0){var bh=A;
}else if(this.__fJ){bh=w+this.__fJ+bg.join(Y+this.__fJ)+b+bi+S;
}else{bh=C+bg.join(d)+S;
}this.__fJ=bi;
return bh;
}},dateToJSON:function(bk){var bl=function(n){return n<10?U+n:n;
};
var bm=function(n){var bn=bl(n);
return n<100?U+bn:bn;
};
return isFinite(bk.valueOf())?bk.getUTCFullYear()+T+bl(bk.getUTCMonth()+1)+T+bl(bk.getUTCDate())+M+bl(bk.getUTCHours())+m+bl(bk.getUTCMinutes())+m+bl(bk.getUTCSeconds())+F+bm(bk.getUTCMilliseconds())+q:null;
},__fO:function(bo){var bp={'\b':I,'\t':u,'\n':r,'\f':y,'\r':L,'"':G,'\\':x};
var bq=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
bq.lastIndex=0;

if(bq.test(bo)){return o+bo.replace(bq,function(a){var c=bp[a];
return typeof c===W?c:ba+(X+a.charCodeAt(0).toString(16)).slice(-4);
})+o;
}else{return o+bo+o;
}},parse:function(br,bs){var bt=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
bt.lastIndex=0;
if(bt.test(br)){br=br.replace(bt,function(a){return ba+(X+a.charCodeAt(0).toString(16)).slice(-4);
});
}if(/^[\],:{}\s]*$/.test(br.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,H).replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,l).replace(/(?:^|:|,)(?:\s*\[)+/g,p))){var j=eval(K+br+D);
return typeof bs===e?this.__fP({'':j},p,bs):j;
}throw new SyntaxError(P);
},__fP:function(bu,bv,bw){var bx=bu[bv];

if(bx&&typeof bx===f){for(var k in bx){if(Object.hasOwnProperty.call(bx,k)){var v=this.__fP(bx,k,bw);

if(v!==undefined){bx[k]=v;
}else{delete bx[k];
}}}}return bw.call(bu,bv,bx);
}}});
})();
(function(){var g="repl",f="prop",e="qx.bom.client.Json",d="JSON",c='{"x":1}',b="json",a="val";
qx.Bootstrap.define(e,{statics:{getJson:function(){return (qx.Bootstrap.getClass(window.JSON)==d&&JSON.parse(c).x===1&&JSON.stringify({"prop":a},function(k,v){return k===f?g:v;
}).indexOf(g)>0);
}},defer:function(h){qx.core.Environment.add(b,h.getJson);
}});
})();
(function(){var a="qx.lang.Json";
qx.Class.define(a,{statics:{JSON:qx.core.Environment.get("json")?window.JSON:new qx.lang.JsonImpl(),stringify:null,parse:null},defer:function(b){b.stringify=b.JSON.stringify;
b.parse=b.JSON.parse;
}});
})();
(function(){var a="qx.event.IEventHandler";
qx.Interface.define(a,{statics:{TARGET_DOMNODE:1,TARGET_WINDOW:2,TARGET_OBJECT:4,TARGET_DOCUMENT:8},members:{canHandleEvent:function(b,c){},registerEvent:function(d,e,f){},unregisterEvent:function(g,h,i){}}});
})();
(function(){var c="qx.event.Registration";
qx.Class.define(c,{statics:{__jN:{},getManager:function(d){if(d==null){d=window;
}else if(d.nodeType){d=qx.dom.Node.getWindow(d);
}else if(!qx.dom.Node.isWindow(d)){d=window;
}var f=d.$$hash||qx.core.ObjectRegistry.toHashCode(d);
var e=this.__jN[f];

if(!e){e=new qx.event.Manager(d,this);
this.__jN[f]=e;
}return e;
},removeManager:function(g){var h=g.getWindowId();
delete this.__jN[h];
},addListener:function(i,j,k,self,l){return this.getManager(i).addListener(i,j,k,self,l);
},removeListener:function(m,n,o,self,p){return this.getManager(m).removeListener(m,n,o,self,p);
},removeListenerById:function(q,r){return this.getManager(q).removeListenerById(q,r);
},removeAllListeners:function(s){return this.getManager(s).removeAllListeners(s);
},deleteAllListeners:function(t){var u=t.$$hash;

if(u){this.getManager(t).deleteAllListeners(u);
}},hasListener:function(v,w,x){return this.getManager(v).hasListener(v,w,x);
},serializeListeners:function(y){return this.getManager(y).serializeListeners(y);
},createEvent:function(z,A,B){if(A==null){A=qx.event.type.Event;
}var C=qx.event.Pool.getInstance().getObject(A);
B?C.init.apply(C,B):C.init();
if(z){C.setType(z);
}return C;
},dispatchEvent:function(D,event){return this.getManager(D).dispatchEvent(D,event);
},fireEvent:function(E,F,G,H){var I;
var J=this.createEvent(F,G||null,H);
return this.getManager(E).dispatchEvent(E,J);
},fireNonBubblingEvent:function(K,L,M,N){var O=this.getManager(K);

if(!O.hasListener(K,L,false)){return true;
}var P=this.createEvent(L,M||null,N);
return O.dispatchEvent(K,P);
},PRIORITY_FIRST:-32000,PRIORITY_NORMAL:0,PRIORITY_LAST:32000,__jO:[],addHandler:function(Q){this.__jO.push(Q);
this.__jO.sort(function(a,b){return a.PRIORITY-b.PRIORITY;
});
},getHandlers:function(){return this.__jO;
},__jP:[],addDispatcher:function(R,S){this.__jP.push(R);
this.__jP.sort(function(a,b){return a.PRIORITY-b.PRIORITY;
});
},getDispatchers:function(){return this.__jP;
}}});
})();
(function(){var a="qx.core.MEvents";
qx.Mixin.define(a,{members:{__hq:qx.event.Registration,addListener:function(b,c,self,d){if(!this.$$disposed){return this.__hq.addListener(this,b,c,self,d);
}return null;
},addListenerOnce:function(f,g,self,h){var i=function(e){this.removeListener(f,i,this,h);
g.call(self||this,e);
};
return this.addListener(f,i,this,h);
},removeListener:function(j,k,self,l){if(!this.$$disposed){return this.__hq.removeListener(this,j,k,self,l);
}return false;
},removeListenerById:function(m){if(!this.$$disposed){return this.__hq.removeListenerById(this,m);
}return false;
},hasListener:function(n,o){return this.__hq.hasListener(this,n,o);
},dispatchEvent:function(p){if(!this.$$disposed){return this.__hq.dispatchEvent(this,p);
}return true;
},fireEvent:function(q,r,s){if(!this.$$disposed){return this.__hq.fireEvent(this,q,r,s);
}return true;
},fireNonBubblingEvent:function(t,u,v){if(!this.$$disposed){return this.__hq.fireNonBubblingEvent(this,t,u,v);
}return true;
},fireDataEvent:function(w,x,y,z){if(!this.$$disposed){if(y===undefined){y=null;
}return this.__hq.fireNonBubblingEvent(this,w,qx.event.type.Data,[x,y,!!z]);
}return true;
}}});
})();
(function(){var a="qx.event.IEventDispatcher";
qx.Interface.define(a,{members:{canDispatchEvent:function(b,event,c){this.assertInstance(event,qx.event.type.Event);
this.assertString(c);
},dispatchEvent:function(d,event,e){this.assertInstance(event,qx.event.type.Event);
this.assertString(e);
}}});
})();
(function(){var j="module.property",h="module.events",g="qx.core.Object",f="$$user_",e="]",d="rv:1.8.1",c="[",b="MSIE 6.0",a="Object";
qx.Class.define(g,{extend:Object,include:qx.core.Environment.filter({"module.databinding":qx.data.MBinding,"module.logger":qx.core.MLogging,"module.events":qx.core.MEvents,"module.property":qx.core.MProperty}),construct:function(){qx.core.ObjectRegistry.register(this);
},statics:{$$type:a},members:{__dz:qx.core.Environment.get(j)?qx.core.Property:null,toHashCode:function(){return this.$$hash;
},toString:function(){return this.classname+c+this.$$hash+e;
},base:function(k,m){if(arguments.length===1){return k.callee.base.call(this);
}else{return k.callee.base.apply(this,Array.prototype.slice.call(arguments,1));
}},self:function(n){return n.callee.self;
},clone:function(){if(!qx.core.Environment.get(j)){throw new Error("Cloning only possible with properties.");
}var p=this.constructor;
var o=new p;
var r=qx.Class.getProperties(p);
var q=this.__dz.$$store.user;
var s=this.__dz.$$method.set;
var name;
for(var i=0,l=r.length;i<l;i++){name=r[i];

if(this.hasOwnProperty(q[name])){o[s[name]](this[q[name]]);
}}return o;
},__dA:null,setUserData:function(t,u){if(!this.__dA){this.__dA={};
}this.__dA[t]=u;
},getUserData:function(v){if(!this.__dA){return null;
}var w=this.__dA[v];
return w===undefined?null:w;
},isDisposed:function(){return this.$$disposed||false;
},dispose:function(){var B,z,y,C;
if(this.$$disposed){return;
}this.$$disposed=true;
this.$$instance=null;
this.$$allowconstruct=null;
var A=this.constructor;
var x;

while(A.superclass){if(A.$$destructor){A.$$destructor.call(this);
}if(A.$$includes){x=A.$$flatIncludes;

for(var i=0,l=x.length;i<l;i++){if(x[i].$$destructor){x[i].$$destructor.call(this);
}}}A=A.superclass;
}if(this.__dB){this.__dB();
}},__dB:null,__dC:function(){var D=qx.Class.getProperties(this.constructor);

for(var i=0,l=D.length;i<l;i++){delete this[f+D[i]];
}},_disposeObjects:function(E){qx.util.DisposeUtil.disposeObjects(this,arguments);
},_disposeSingletonObjects:function(F){qx.util.DisposeUtil.disposeObjects(this,arguments,true);
},_disposeArray:function(G){qx.util.DisposeUtil.disposeArray(this,G);
},_disposeMap:function(H){qx.util.DisposeUtil.disposeMap(this,H);
}},environment:{"qx.disposerDebugLevel":0},defer:function(I,J){var L=navigator.userAgent.indexOf(b)!=-1;
var K=navigator.userAgent.indexOf(d)!=-1;
if(L||K){J.__dB=J.__dC;
}},destruct:function(){if(qx.core.Environment.get(h)){if(!qx.core.ObjectRegistry.inShutDown){qx.event.Registration.removeAllListeners(this);
}else{qx.event.Registration.deleteAllListeners(this);
}}qx.core.ObjectRegistry.unregister(this);
this.__dA=null;
if(qx.core.Environment.get(j)){var O=this.constructor;
var S;
var T=this.__dz.$$store;
var Q=T.user;
var R=T.theme;
var M=T.inherit;
var P=T.useinit;
var N=T.init;

while(O){S=O.$$properties;

if(S){for(var name in S){if(S[name].dereference){this[Q[name]]=this[R[name]]=this[M[name]]=this[P[name]]=this[N[name]]=undefined;
}}}O=O.superclass;
}}}});
})();
(function(){var a="qx.util.DisposeUtil";
qx.Class.define(a,{statics:{disposeObjects:function(b,c,d){var name;

for(var i=0,l=c.length;i<l;i++){name=c[i];

if(b[name]==null||!b.hasOwnProperty(name)){continue;
}
if(!qx.core.ObjectRegistry.inShutDown){if(b[name].dispose){if(!d&&b[name].constructor.$$instance){throw new Error("The object stored in key "+name+" is a singleton! Please use disposeSingleton instead.");
}else{b[name].dispose();
}}else{throw new Error("Has no disposable object under key: "+name+"!");
}}b[name]=null;
}},disposeArray:function(e,f){var h=e[f];

if(!h){return;
}if(qx.core.ObjectRegistry.inShutDown){e[f]=null;
return;
}try{var g;

for(var i=h.length-1;i>=0;i--){g=h[i];

if(g){g.dispose();
}}}catch(j){throw new Error("The array field: "+f+" of object: "+e+" has non disposable entries: "+j);
}h.length=0;
e[f]=null;
},disposeMap:function(k,m){var o=k[m];

if(!o){return;
}if(qx.core.ObjectRegistry.inShutDown){k[m]=null;
return;
}try{var n;

for(var p in o){n=o[p];

if(o.hasOwnProperty(p)&&n){n.dispose();
}}}catch(q){throw new Error("The map field: "+m+" of object: "+k+" has non disposable entries: "+q);
}k[m]=null;
},disposeTriggeredBy:function(r,s){var t=s.dispose;
s.dispose=function(){t.call(s);
r.dispose();
};
}}});
})();
(function(){var a="qx.event.type.Event";
qx.Class.define(a,{extend:qx.core.Object,statics:{CAPTURING_PHASE:1,AT_TARGET:2,BUBBLING_PHASE:3},members:{init:function(b,c){this._type=null;
this._target=null;
this._currentTarget=null;
this._relatedTarget=null;
this._originalTarget=null;
this._stopPropagation=false;
this._preventDefault=false;
this._bubbles=!!b;
this._cancelable=!!c;
this._timeStamp=(new Date()).getTime();
this._eventPhase=null;
return this;
},clone:function(d){if(d){var e=d;
}else{var e=qx.event.Pool.getInstance().getObject(this.constructor);
}e._type=this._type;
e._target=this._target;
e._currentTarget=this._currentTarget;
e._relatedTarget=this._relatedTarget;
e._originalTarget=this._originalTarget;
e._stopPropagation=this._stopPropagation;
e._bubbles=this._bubbles;
e._preventDefault=this._preventDefault;
e._cancelable=this._cancelable;
return e;
},stop:function(){if(this._bubbles){this.stopPropagation();
}
if(this._cancelable){this.preventDefault();
}},stopPropagation:function(){this._stopPropagation=true;
},getPropagationStopped:function(){return !!this._stopPropagation;
},preventDefault:function(){this._preventDefault=true;
},getDefaultPrevented:function(){return !!this._preventDefault;
},getType:function(){return this._type;
},setType:function(f){this._type=f;
},getEventPhase:function(){return this._eventPhase;
},setEventPhase:function(g){this._eventPhase=g;
},getTimeStamp:function(){return this._timeStamp;
},getTarget:function(){return this._target;
},setTarget:function(h){this._target=h;
},getCurrentTarget:function(){return this._currentTarget||this._target;
},setCurrentTarget:function(i){this._currentTarget=i;
},getRelatedTarget:function(){return this._relatedTarget;
},setRelatedTarget:function(j){this._relatedTarget=j;
},getOriginalTarget:function(){return this._originalTarget;
},setOriginalTarget:function(k){this._originalTarget=k;
},getBubbles:function(){return this._bubbles;
},setBubbles:function(l){this._bubbles=l;
},isCancelable:function(){return this._cancelable;
},setCancelable:function(m){this._cancelable=m;
}},destruct:function(){this._target=this._currentTarget=this._relatedTarget=this._originalTarget=null;
}});
})();
(function(){var b="qx.util.ObjectPool",a="Integer";
qx.Class.define(b,{extend:qx.core.Object,construct:function(c){qx.core.Object.call(this);
this.__bQ={};

if(c!=null){this.setSize(c);
}},properties:{size:{check:a,init:Infinity}},members:{__bQ:null,getObject:function(d){if(this.$$disposed){return new d;
}
if(!d){throw new Error("Class needs to be defined!");
}var e=null;
var f=this.__bQ[d.classname];

if(f){e=f.pop();
}
if(e){e.$$pooled=false;
}else{e=new d;
}return e;
},poolObject:function(g){if(!this.__bQ){return;
}var h=g.classname;
var j=this.__bQ[h];

if(g.$$pooled){throw new Error("Object is already pooled: "+g);
}
if(!j){this.__bQ[h]=j=[];
}if(j.length>this.getSize()){if(g.destroy){g.destroy();
}else{g.dispose();
}return;
}g.$$pooled=true;
j.push(g);
}},destruct:function(){var n=this.__bQ;
var k,m,i,l;

for(k in n){m=n[k];

for(i=0,l=m.length;i<l;i++){m[i].dispose();
}}delete this.__bQ;
}});
})();
(function(){var b="singleton",a="qx.event.Pool";
qx.Class.define(a,{extend:qx.util.ObjectPool,type:b,construct:function(){qx.util.ObjectPool.call(this,30);
}});
})();
(function(){var a="qx.event.dispatch.Direct";
qx.Class.define(a,{extend:qx.core.Object,implement:qx.event.IEventDispatcher,construct:function(b){this._manager=b;
},statics:{PRIORITY:qx.event.Registration.PRIORITY_LAST},members:{canDispatchEvent:function(c,event,d){return !event.getBubbles();
},dispatchEvent:function(e,event,f){var j,g;
event.setEventPhase(qx.event.type.Event.AT_TARGET);
var k=this._manager.getListeners(e,f,false);

if(k){for(var i=0,l=k.length;i<l;i++){var h=k[i].context||e;
k[i].handler.call(h,event);
}}}},defer:function(m){qx.event.Registration.addDispatcher(m);
}});
})();
(function(){var a="qx.event.handler.Object";
qx.Class.define(a,{extend:qx.core.Object,implement:qx.event.IEventHandler,statics:{PRIORITY:qx.event.Registration.PRIORITY_LAST,SUPPORTED_TYPES:null,TARGET_CHECK:qx.event.IEventHandler.TARGET_OBJECT,IGNORE_CAN_HANDLE:false},members:{canHandleEvent:function(b,c){return qx.Class.supportsEvent(b.constructor,c);
},registerEvent:function(d,e,f){},unregisterEvent:function(g,h,i){}},defer:function(j){qx.event.Registration.addHandler(j);
}});
})();
(function(){var a="qx.event.type.Data";
qx.Class.define(a,{extend:qx.event.type.Event,members:{__dj:null,__ik:null,init:function(b,c,d){qx.event.type.Event.prototype.init.call(this,false,d);
this.__dj=b;
this.__ik=c;
return this;
},clone:function(e){var f=qx.event.type.Event.prototype.clone.call(this,e);
f.__dj=this.__dj;
f.__ik=this.__ik;
return f;
},getData:function(){return this.__dj;
},getOldData:function(){return this.__ik;
}},destruct:function(){this.__dj=this.__ik=null;
}});
})();
(function(){var a="qx.application.IApplication";
qx.Interface.define(a,{members:{main:function(){},finalize:function(){},close:function(){},terminate:function(){}}});
})();
(function(){var g="",f="qx.core.BaseInit",d="engine.name",c="os.name",b="engine.version",a="testrunner.Application";
qx.Class.define(f,{statics:{getApplication:function(){return this.__ej||null;
},ready:function(){if(this.__ej){return;
}
if(qx.core.Environment.get(d)==g){qx.log.Logger.warn("Could not detect engine!");
}
if(qx.core.Environment.get(b)==g){qx.log.Logger.warn("Could not detect the version of the engine!");
}
if(qx.core.Environment.get(c)==g){qx.log.Logger.warn("Could not detect operating system!");
}qx.log.Logger.debug(this,"Load runtime: "+(new Date-qx.Bootstrap.LOADSTART)+"ms");
var i=a;
var j=qx.Class.getByName(i);

if(j){this.__ej=new j;
var h=new Date;
this.__ej.main();
qx.log.Logger.debug(this,"Main runtime: "+(new Date-h)+"ms");
var h=new Date;
this.__ej.finalize();
qx.log.Logger.debug(this,"Finalize runtime: "+(new Date-h)+"ms");
}else{qx.log.Logger.warn("Missing application class: "+i);
}},__ek:function(e){var k=this.__ej;

if(k){k.close();
}},__el:function(){var l=this.__ej;

if(l){l.terminate();
}qx.core.ObjectRegistry.shutdown();
}}});
})();
(function(){var j="",i="10.1",h="10.3",g="10.7",f="10.5",e="95",d="10.2",c="98",b="2000",a="10.6",be="10.0",bd="10.4",bc="rim_tabletos",bb="Darwin",ba="os.version",Y="2003",X=")",W="iPhone",V="android",U="unix",q="ce",r="7",o="SymbianOS",p="os.name",m="|",n="MacPPC",k="iPod",l="\.",u="Win64",v="linux",D="me",B="Macintosh",K="Android",F="Windows",Q="ios",O="vista",x="blackberry",T="(",S="win",R="Linux",w="BSD",z="Mac OS X",A="iPad",C="X11",E="xp",G="symbian",L="qx.bom.client.OperatingSystem",P="g",s="Win32",t="osx",y="webOS",J="RIM Tablet OS",I="BlackBerry",H="nt4",N="MacIntel",M="webos";
qx.Bootstrap.define(L,{statics:{getName:function(){if(!navigator){return j;
}var bf=navigator.platform||j;
var bg=navigator.userAgent||j;

if(bf.indexOf(F)!=-1||bf.indexOf(s)!=-1||bf.indexOf(u)!=-1){return S;
}else if(bf.indexOf(B)!=-1||bf.indexOf(n)!=-1||bf.indexOf(N)!=-1||bf.indexOf(z)!=-1){return t;
}else if(bg.indexOf(J)!=-1){return bc;
}else if(bg.indexOf(y)!=-1){return M;
}else if(bf.indexOf(k)!=-1||bf.indexOf(W)!=-1||bf.indexOf(A)!=-1){return Q;
}else if(bg.indexOf(K)!=-1){return V;
}else if(bf.indexOf(R)!=-1){return v;
}else if(bf.indexOf(C)!=-1||bf.indexOf(w)!=-1||bf.indexOf(bb)!=-1){return U;
}else if(bf.indexOf(o)!=-1){return G;
}else if(bf.indexOf(I)!=-1){return x;
}return j;
},__du:{"Windows NT 6.1":r,"Windows NT 6.0":O,"Windows NT 5.2":Y,"Windows NT 5.1":E,"Windows NT 5.0":b,"Windows 2000":b,"Windows NT 4.0":H,"Win 9x 4.90":D,"Windows CE":q,"Windows 98":c,"Win98":c,"Windows 95":e,"Win95":e,"Mac OS X 10_7":g,"Mac OS X 10.7":g,"Mac OS X 10_6":a,"Mac OS X 10.6":a,"Mac OS X 10_5":f,"Mac OS X 10.5":f,"Mac OS X 10_4":bd,"Mac OS X 10.4":bd,"Mac OS X 10_3":h,"Mac OS X 10.3":h,"Mac OS X 10_2":d,"Mac OS X 10.2":d,"Mac OS X 10_1":i,"Mac OS X 10.1":i,"Mac OS X 10_0":be,"Mac OS X 10.0":be},getVersion:function(){var bj=[];

for(var bi in qx.bom.client.OperatingSystem.__du){bj.push(bi);
}var bk=new RegExp(T+bj.join(m).replace(/\./g,l)+X,P);
var bh=bk.exec(navigator.userAgent);

if(bh&&bh[1]){return qx.bom.client.OperatingSystem.__du[bh[1]];
}return j;
}},defer:function(bl){qx.core.Environment.add(p,bl.getName);
qx.core.Environment.add(ba,bl.getVersion);
}});
})();
(function(){var a="qx.event.type.Native";
qx.Class.define(a,{extend:qx.event.type.Event,members:{init:function(b,c,d,e,f){qx.event.type.Event.prototype.init.call(this,e,f);
this._target=c||qx.bom.Event.getTarget(b);
this._relatedTarget=d||qx.bom.Event.getRelatedTarget(b);

if(b.timeStamp){this._timeStamp=b.timeStamp;
}this._native=b;
this._returnValue=null;
return this;
},clone:function(g){var h=qx.event.type.Event.prototype.clone.call(this,g);
var i={};
h._native=this._cloneNativeEvent(this._native,i);
h._returnValue=this._returnValue;
return h;
},_cloneNativeEvent:function(j,k){k.preventDefault=qx.lang.Function.empty;
return k;
},preventDefault:function(){qx.event.type.Event.prototype.preventDefault.call(this);
qx.bom.Event.preventDefault(this._native);
},getNativeEvent:function(){return this._native;
},setReturnValue:function(l){this._returnValue=l;
},getReturnValue:function(){return this._returnValue;
}},destruct:function(){this._native=this._returnValue=null;
}});
})();
(function(){var a="qx.event.handler.Window";
qx.Class.define(a,{extend:qx.core.Object,implement:qx.event.IEventHandler,construct:function(b){qx.core.Object.call(this);
this._manager=b;
this._window=b.getWindow();
this._initWindowObserver();
},statics:{PRIORITY:qx.event.Registration.PRIORITY_NORMAL,SUPPORTED_TYPES:{error:1,load:1,beforeunload:1,unload:1,resize:1,scroll:1,beforeshutdown:1},TARGET_CHECK:qx.event.IEventHandler.TARGET_WINDOW,IGNORE_CAN_HANDLE:true},members:{canHandleEvent:function(c,d){},registerEvent:function(f,g,h){},unregisterEvent:function(i,j,k){},_initWindowObserver:function(){this._onNativeWrapper=qx.lang.Function.listener(this._onNative,this);
var m=qx.event.handler.Window.SUPPORTED_TYPES;

for(var l in m){qx.bom.Event.addNativeListener(this._window,l,this._onNativeWrapper);
}},_stopWindowObserver:function(){var o=qx.event.handler.Window.SUPPORTED_TYPES;

for(var n in o){qx.bom.Event.removeNativeListener(this._window,n,this._onNativeWrapper);
}},_onNative:qx.event.GlobalError.observeMethod(function(e){if(this.isDisposed()){return;
}var q=this._window;

try{var t=q.document;
}catch(e){return ;
}var r=t.documentElement;
var p=qx.bom.Event.getTarget(e);

if(p==null||p===q||p===t||p===r){var event=qx.event.Registration.createEvent(e.type,qx.event.type.Native,[e,q]);
qx.event.Registration.dispatchEvent(q,event);
var s=event.getReturnValue();

if(s!=null){e.returnValue=s;
return s;
}}})},destruct:function(){this._stopWindowObserver();
this._manager=this._window=null;
},defer:function(u){qx.event.Registration.addHandler(u);
}});
})();
(function(){var n="engine.name",m="ready",l="mshtml",k="load",j="unload",i="qx.event.handler.Application",h="complete",g="webkit",f="gecko",d="opera",a="left",c="DOMContentLoaded",b="shutdown";
qx.Class.define(i,{extend:qx.core.Object,implement:qx.event.IEventHandler,construct:function(o){qx.core.Object.call(this);
this._window=o.getWindow();
this.__cY=false;
this.__da=false;
this.__db=false;
this.__dc=false;
this._initObserver();
qx.event.handler.Application.$$instance=this;
},statics:{PRIORITY:qx.event.Registration.PRIORITY_NORMAL,SUPPORTED_TYPES:{ready:1,shutdown:1},TARGET_CHECK:qx.event.IEventHandler.TARGET_WINDOW,IGNORE_CAN_HANDLE:true,onScriptLoaded:function(){var p=qx.event.handler.Application.$$instance;

if(p){p.__dd();
}}},members:{canHandleEvent:function(q,r){},registerEvent:function(s,t,u){},unregisterEvent:function(v,w,x){},__db:null,__cY:null,__da:null,__dc:null,__dd:function(){if(!this.__db&&this.__cY&&qx.$$loader.scriptLoaded){if((qx.core.Environment.get(n)==l)){if(qx.event.Registration.hasListener(this._window,m)){this.__db=true;
qx.event.Registration.fireEvent(this._window,m);
}}else{this.__db=true;
qx.event.Registration.fireEvent(this._window,m);
}}},isApplicationReady:function(){return this.__db;
},_initObserver:function(){if(qx.$$domReady||document.readyState==h||document.readyState==m){this.__cY=true;
this.__dd();
}else{this._onNativeLoadWrapped=qx.lang.Function.bind(this._onNativeLoad,this);

if(qx.core.Environment.get(n)==f||qx.core.Environment.get(n)==d||qx.core.Environment.get(n)==g){qx.bom.Event.addNativeListener(this._window,c,this._onNativeLoadWrapped);
}else if((qx.core.Environment.get(n)==l)){var self=this;
var y=function(){try{document.documentElement.doScroll(a);

if(document.body){self._onNativeLoadWrapped();
}}catch(z){window.setTimeout(y,100);
}};
y();
}qx.bom.Event.addNativeListener(this._window,k,this._onNativeLoadWrapped);
}this._onNativeUnloadWrapped=qx.lang.Function.bind(this._onNativeUnload,this);
qx.bom.Event.addNativeListener(this._window,j,this._onNativeUnloadWrapped);
},_stopObserver:function(){if(this._onNativeLoadWrapped){qx.bom.Event.removeNativeListener(this._window,k,this._onNativeLoadWrapped);
}qx.bom.Event.removeNativeListener(this._window,j,this._onNativeUnloadWrapped);
this._onNativeLoadWrapped=null;
this._onNativeUnloadWrapped=null;
},_onNativeLoad:qx.event.GlobalError.observeMethod(function(){this.__cY=true;
this.__dd();
}),_onNativeUnload:qx.event.GlobalError.observeMethod(function(){if(!this.__dc){this.__dc=true;

try{qx.event.Registration.fireEvent(this._window,b);
}catch(e){throw e;
}finally{qx.core.ObjectRegistry.shutdown();
}}})},destruct:function(){this._stopObserver();
this._window=null;
},defer:function(A){qx.event.Registration.addHandler(A);
}});
})();
(function(){var d="ready",c="shutdown",b="beforeunload",a="qx.core.Init";
qx.Class.define(a,{statics:{getApplication:qx.core.BaseInit.getApplication,ready:qx.core.BaseInit.ready,__ek:function(e){var f=this.getApplication();

if(f){e.setReturnValue(f.close());
}},__el:function(){var g=this.getApplication();

if(g){g.terminate();
}}},defer:function(h){qx.event.Registration.addListener(window,d,h.ready,h);
qx.event.Registration.addListener(window,c,h.__el,h);
qx.event.Registration.addListener(window,b,h.__ek,h);
}});
})();
(function(){var a="qx.application.Native";
qx.Class.define(a,{extend:qx.core.Object,implement:[qx.application.IApplication],members:{main:function(){},finalize:function(){},close:function(){},terminate:function(){}}});
})();
(function(){var b="testrunner.Application",a="runner";
qx.Class.define(b,{extend:qx.application.Native,members:{main:function(){qx.application.Native.prototype.main.call(this);
this.runner=new testrunner.runner.TestRunner();
}},destruct:function(){this._disposeObjects(a);
}});
})();
(function(){var o="error",n="aborted",k="loading",h="ready",g="skip",f="wait",d="finished",c="failure",b="test",a="stopTests",bd="testSuiteState",bc="testCount",bb="init",ba="external",Y="change",X="start",W="runTests",V="running",U="testModel",T="selectedTests",v=".",w='var argumentsArray = qx.lang.Array.fromArguments(arguments);',t="function",u='try {',r="_applySelectedTests",s="changeTestModel",p='this[arguments.callee.originalName].apply(this, argumentsArray);',q="currentTestData",z="view",A="Integer",H="endTest",F="loader",L="fail",J='this.fireDataEvent("assertionFailed", ex);',P="testsInView",N="type",C="__",S="testrunner.runner.TestRunnerBasic",R=".Test",Q="startTest",B="testList",D="testrunner.view.Html",E="testPackageList",G="success",I="changeTestCount",K="qx.globalErrorHandling",M="assert",O="changeTestSuiteState",x='}',y='} catch(ex) {';
qx.Class.define(S,{extend:qx.core.Object,statics:{start:function(){qx.core.Init.getApplication().runner._loadExternalTests();
}},construct:function(){if(qx.core.Environment.get(K)){qx.event.GlobalError.setErrorHandler(this._handleGlobalError,this);
}this.__vH=[];
var bg=D;
var be=qx.Class.getByName(bg);
this.view=new be();
this.view.addListener(W,this._runTests,this);
this.view.addListener(a,this._stopTests,this);
this.bind(bd,this.view,bd);
this.bind(bc,this.view,bc);
this.bind(U,this.view,U);
qx.data.SingleValueBinding.bind(this.view,T,this,T);
this._testNameSpace=this._getTestNameSpace();
this._loadTests();
this._testParts=[];
var bf=null;

if(bf){this._testParts=this._testParts.concat(bf);
}},properties:{testSuiteState:{init:bb,check:[bb,k,h,V,d,n,o],event:O},testCount:{init:null,nullable:true,check:A,event:I},testModel:{init:null,nullable:true,event:s},selectedTests:{nullable:true,init:null,apply:r}},members:{loader:null,_testParts:null,__vH:null,_testNameSpace:null,_externalTestClasses:0,_getTestNameSpace:function(){return b;
},_loadTests:function(){var bh=ba;

switch(bh){case ba:break;
default:this._loadInlineTests(this._testNameSpace);
}},_loadInlineTests:function(bi){this.setTestSuiteState(k);
this.loader=new qx.dev.unit.TestLoaderBasic(bi);
this._wrapAssertions();
this._getTestModel();
},_addTestClass:function(bj){this.setTestSuiteState(k);
this._externalTestClasses+=1;
var bl=this._testNameSpace||b;
var bk;

if(bj.classname){bk=bj.classname;

if(bk.split(v)[0]!==bl){bk=bl+v+bk;
}delete bj.classname;
}else{bk=bl+R+(this._externalTestClasses);
}var bm=this._defineTestClass(bk,bj);

if(this.loader){this.loader.getSuite().add(bm);
}else{this.loader=new qx.dev.unit.TestLoaderBasic(bl);
}},_defineTestClass:function(bn,bo){var bp=qx.Class;
return bp.define(bn,{extend:qx.dev.unit.TestCase,members:bo});
},define:function(bq){this._addTestClass(bq);
this._getTestModel();
},_loadExternalTests:function(){if(window.testrunner.testDefinitions instanceof Array){for(var i=0,l=testrunner.testDefinitions.length;i<l;i++){this._addTestClass(testrunner.testDefinitions[i]);
}
if(this.loader){this._getTestModel();
}}},__vI:function(){var br=this.loader.getTestDescriptions();

if(!br){this.error("Couldn't get test descriptions from loader!");
return null;
}return qx.lang.Json.parse(br);
},_getTestModel:function(){if(this.currentTestData){this.currentTestData=null;
delete this.currentTestData;
}var bs=this.getTestModel();

if(bs){this.getTestModel().dispose();
this.__vH=[];
}this.setTestModel(null);
var bt=this.__vI();

if(!bt||bt.length===0||(bt.length===1&&bt[0].tests.length===0)){this.setTestSuiteState(o);
return;
}var bv=testrunner.runner.ModelUtil.createModelData(bt);
var bu={getModelSuperClass:function(by){return testrunner.runner.TestItem;
}};
var bx=new qx.data.marshal.Json(bu);
bx.toClass(bv.children[0],true);
var bw=bx.toModel(bv.children[0]);
testrunner.runner.ModelUtil.addDataFields(bw);
this.setTestModel(bw);
this.setTestSuiteState(h);
},_wrapAssertions:function(bz){var bB=bz||window;
var bD=bB.qx.dev.unit.TestCase.prototype;

for(var bE in bD){if((bE.indexOf(M)==0||bE===L)&&typeof bD[bE]==t){var bA=C+bE;
bD[bA]=bD[bE];
var bC=w+u+p+y+J+x;
bD[bE]=new bB.Function(bC);
bD[bE].originalName=bA;
}}},_runTests:function(){if(this.getTestSuiteState()===n){this.setTestSuiteState(h);
}this.runTests();
},_stopTests:function(){this.setTestSuiteState(n);
},runTests:function(){var bI=this.getTestSuiteState();

switch(bI){case k:this.__vH=[];
break;
case h:case d:if(this.testList.length>0){this.setTestSuiteState(V);
break;
}else{return;
}case n:case o:return;
}
if(this.testList.length==0){var self=this;
window.setTimeout(function(){self.setTestSuiteState(d);
},250);
return;
}var bG=this.currentTestData=this.testList.shift();
bG.resetState();
this.setTestCount(this.testList.length);
var bH=bG.parent.fullName;
var bF=bG.getName();
var bJ=this.__vJ(bG);
var self=this;
window.setTimeout(function(){self.loader.runTests(bJ,bH,bF);
},0);
},_getTestResult:function(){return new qx.dev.unit.TestResult();
},__vJ:function(){var bK=this._getTestResult();
bK.addListener(Q,function(e){var bL=e.getData();

if(this.currentTestData&&this.currentTestData.fullName===bL.getFullName()&&this.currentTestData.getState()==f){this.currentTestData.setState(X);
return;
}
if(!qx.lang.Array.contains(this.__vH,this.currentTestData.fullName)){this.view.addTestResult(this.currentTestData);
this.__vH.push(this.currentTestData.fullName);
}},this);
bK.addListener(f,this._onTestWait,this);
bK.addListener(c,this._onTestFailure,this);
bK.addListener(o,this._onTestError,this);
bK.addListener(g,this._onTestSkip,this);
bK.addListener(H,this._onTestEnd,this);
return bK;
},_onTestWait:function(bM){this.currentTestData.setState(f);
},_onTestFailure:function(bN){this.__vK(this.currentTestData,bN.getData());

if(this.currentTestData.getState()===c){this.currentTestData.resetState();
}this.currentTestData.setState(c);
},_onTestError:function(bO){this.__vK(this.currentTestData,bO.getData());

if(this.currentTestData.getState()===o){this.currentTestData.resetState();
}this.currentTestData.setState(o);
},_onTestSkip:function(bP){this.__vK(this.currentTestData,bP.getData());

if(this.currentTestData.getState()===g){this.currentTestData.resetState();
}this.currentTestData.setState(g);
},_onTestEnd:function(bQ){var bR=this.currentTestData.getState();

if(bR==X){this.currentTestData.setState(G);
}qx.event.Timer.once(this.runTests,this,0);
},__vK:function(bS,bT){var bW=bS.getExceptions();
var bY=bW.concat();

for(var i=0,l=bT.length;i<l;i++){var bV=bT[i].exception.toString();
var bX=false;

for(var j=0,m=bW.length;j<m;j++){var bU=bW[j].exception.toString();

if(bV===bU){bX=true;
break;
}}
if(!bX){bY.push(bT[i]);
}}bS.setExceptions(bY);
},_applySelectedTests:function(ca,cb){if(!ca){return;
}
if(cb){cb.removeListener(Y,this._onChangeTestSelection,this);
}ca.addListener(Y,this._onChangeTestSelection,this);
this._onChangeTestSelection();
},_onChangeTestSelection:function(){this.testList=this._getFlatTestList();
if(this.testList.length==this.getTestCount()){this.resetTestCount();
}this.setTestCount(this.testList.length);
},_getFlatTestList:function(){var cc=this.getSelectedTests();

if(cc.length==0){return new qx.data.Array();
}var cd=[];

for(var i=0,l=cc.length;i<l;i++){var cf=cc.getItem(i);
var ce=testrunner.runner.ModelUtil.getItemsByProperty(cf,N,b);
cd=cd.concat(ce);
}return cd;
},_handleGlobalError:function(cg){this.error(cg);
}},destruct:function(){this.view.removeListener(W,this._runTests,this);
this.view.removeListener(a,this._stopTests,this);
this.removeAllBindings();

if(this.getTestModel()){this.getTestModel().dispose();
}this._disposeArray(P);
this._disposeArray(B);
this._disposeArray(E);
this._disposeObjects(z,q,F);
}});
})();
(function(){var f="qx.dev.unit.TestSuite",d="__unknown_class__",c="failure",b="error",a="qx.dev.unit.MTestLoader";
qx.Mixin.define(a,{properties:{suite:{check:f}},members:{_getClassNameFromUrl:function(){var h=window.location.search;
var g=h.match(/[\?&]testclass=([A-Za-z0-9_\.]+)/);

if(g){g=g[1];
}else{g=d;
}return g;
},setTestNamespace:function(k){var l=new qx.dev.unit.TestSuite();
l.add(k);
this.setSuite(l);
},runJsUnit:function(){var m=new qx.dev.unit.JsUnitTestResult();
this.getSuite().run(m);
m.exportToJsUnit();
},runStandAlone:function(){var n=new qx.dev.unit.TestResult();
n.addListener(c,function(e){var p=e.getData()[0].exception;
var o=e.getData()[0].test;
this.error("Test '"+o.getFullName()+"' failed: "+p.message+" - "+p.getComment());

if(p.getStackTrace){this.error("Stack trace: "+p.getStackTrace().join("\n"));
}},this);
n.addListener(b,function(e){var r=e.getData()[0].exception;
var q=e.getData()[0].test;
this.error("The test '"+q.getFullName()+"' had an error: "+r,r);
},this);
this.getSuite().run(n);
},getTestDescriptions:function(){var v=[];
var u=this.getSuite().getTestClasses();

for(var i=0;i<u.length;i++){var w=u[i];
var s={};
s.classname=w.getName();
s.tests=[];
var t=w.getTestMethods();

for(var j=0;j<t.length;j++){s.tests.push(t[j].getName());
}v.push(s);
}return qx.lang.Json.stringify(v);
},runTests:function(x,y,z){var A=this.getSuite().getTestClasses();

for(var i=0;i<A.length;i++){if(y==A[i].getName()){var B=A[i].getTestMethods();

for(var j=0;j<B.length;j++){if(z&&B[j].getName()!=z){continue;
}B[j].run(x);
}return;
}}},runTestsFromNamespace:function(C,D){var E=this.getSuite().getTestClasses();

for(var i=0;i<E.length;i++){if(E[i].getName().indexOf(D)==0){E[i].run(C);
}}}}});
})();
(function(){var c="qx.dev.unit.AbstractTestSuite",b="abstract",a="_tests";
qx.Class.define(c,{extend:qx.core.Object,type:b,construct:function(){qx.core.Object.call(this);
this._tests=[];
},members:{_tests:null,addTestFunction:function(name,d){this._tests.push(new qx.dev.unit.TestFunction(null,name,d));
},addTestMethod:function(e,f){this._tests.push(new qx.dev.unit.TestFunction(e,f));
},addFail:function(g,h){this.addTestFunction(g,function(){this.fail(h);
});
},run:function(j){for(var i=0;i<this._tests.length;i++){(this._tests[i]).run(j);
}},getTestMethods:function(){var l=[];

for(var i=0;i<this._tests.length;i++){var k=this._tests[i];

if(k instanceof qx.dev.unit.TestFunction){l.push(k);
}}return l;
}},destruct:function(){this._disposeArray(a);
}});
})();
(function(){var f="String",e="qx.dev.unit.TestFunction",d="Function",c="",b=":",a="qx.dev.unit.TestCase";
qx.Class.define(e,{extend:qx.core.Object,construct:function(g,h,i){if(i){this.setTestFunction(i);
}
if(g){this.setClassName(g.classname);
this.setTestClass(g);
}this.setName(h);
},properties:{testFunction:{check:d},name:{check:f},className:{check:f,init:c},testClass:{check:a,init:null}},members:{run:function(j){var k=this.getTestClass();
var l=this.getName();
var m=this;
j.run(this,function(){k.setTestFunc(m);
k.setTestResult(j);

try{k[l]();
}catch(n){throw n;
}});
},setUp:function(){var o=this.getTestClass();

if(qx.lang.Type.isFunction(o.setUp)){o.setUp();
}},tearDown:function(){var p=this.getTestClass();

if(qx.lang.Type.isFunction(p.tearDown)){p.tearDown();
}},getFullName:function(){return [this.getClassName(),this.getName()].join(b);
}}});
})();
(function(){var g="'!",f="qx.dev.unit.TestSuite",e="' is undefined!",d="abstract",c="existsCheck",b="Unknown test class '",a="The class/namespace '";
qx.Class.define(f,{extend:qx.dev.unit.AbstractTestSuite,construct:function(h){qx.dev.unit.AbstractTestSuite.call(this);
this._tests=[];

if(h){this.add(h);
}},members:{add:function(j){if(qx.lang.Type.isString(j)){var k=eval(j);

if(!k){this.addFail(j,a+j+e);
}j=k;
}
if(qx.lang.Type.isFunction(j)){this.addTestClass(j);
}else if(qx.lang.Type.isObject(j)){this.addTestNamespace(j);
}else{this.addFail(c,b+j+g);
return;
}},addTestNamespace:function(l){if(qx.lang.Type.isFunction(l)&&l.classname){if(qx.Class.isSubClassOf(l,qx.dev.unit.TestCase)){if(l.$$classtype!==d){this.addTestClass(l);
}return;
}}else if(qx.lang.Type.isObject(l)&&!(l instanceof Array)){for(var m in l){this.addTestNamespace(l[m]);
}}},addTestClass:function(n){this._tests.push(new qx.dev.unit.TestClass(n));
},getTestClasses:function(){var p=[];

for(var i=0;i<this._tests.length;i++){var o=this._tests[i];

if(o instanceof qx.dev.unit.TestClass){p.push(o);
}}return p;
}}});
})();
(function(){var a="qx.core.MAssert";
qx.Mixin.define(a,{members:{assert:function(b,c){qx.core.Assert.assert(b,c);
},fail:function(d,e){qx.core.Assert.fail(d,e);
},assertTrue:function(f,g){qx.core.Assert.assertTrue(f,g);
},assertFalse:function(h,i){qx.core.Assert.assertFalse(h,i);
},assertEquals:function(j,k,l){qx.core.Assert.assertEquals(j,k,l);
},assertNotEquals:function(m,n,o){qx.core.Assert.assertNotEquals(m,n,o);
},assertIdentical:function(p,q,r){qx.core.Assert.assertIdentical(p,q,r);
},assertNotIdentical:function(s,t,u){qx.core.Assert.assertNotIdentical(s,t,u);
},assertNotUndefined:function(v,w){qx.core.Assert.assertNotUndefined(v,w);
},assertUndefined:function(x,y){qx.core.Assert.assertUndefined(x,y);
},assertNotNull:function(z,A){qx.core.Assert.assertNotNull(z,A);
},assertNull:function(B,C){qx.core.Assert.assertNull(B,C);
},assertJsonEquals:function(D,E,F){qx.core.Assert.assertJsonEquals(D,E,F);
},assertMatch:function(G,H,I){qx.core.Assert.assertMatch(G,H,I);
},assertArgumentsCount:function(J,K,L,M){qx.core.Assert.assertArgumentsCount(J,K,L,M);
},assertEventFired:function(N,event,O,P,Q){qx.core.Assert.assertEventFired(N,event,O,P,Q);
},assertEventNotFired:function(R,event,S,T){qx.core.Assert.assertEventNotFired(R,event,S,T);
},assertException:function(U,V,W,X){qx.core.Assert.assertException(U,V,W,X);
},assertInArray:function(Y,ba,bb){qx.core.Assert.assertInArray(Y,ba,bb);
},assertArrayEquals:function(bc,bd,be){qx.core.Assert.assertArrayEquals(bc,bd,be);
},assertKeyInMap:function(bf,bg,bh){qx.core.Assert.assertKeyInMap(bf,bg,bh);
},assertFunction:function(bi,bj){qx.core.Assert.assertFunction(bi,bj);
},assertString:function(bk,bl){qx.core.Assert.assertString(bk,bl);
},assertBoolean:function(bm,bn){qx.core.Assert.assertBoolean(bm,bn);
},assertNumber:function(bo,bp){qx.core.Assert.assertNumber(bo,bp);
},assertPositiveNumber:function(bq,br){qx.core.Assert.assertPositiveNumber(bq,br);
},assertInteger:function(bs,bt){qx.core.Assert.assertInteger(bs,bt);
},assertPositiveInteger:function(bu,bv){qx.core.Assert.assertPositiveInteger(bu,bv);
},assertInRange:function(bw,bx,by,bz){qx.core.Assert.assertInRange(bw,bx,by,bz);
},assertObject:function(bA,bB){qx.core.Assert.assertObject(bA,bB);
},assertArray:function(bC,bD){qx.core.Assert.assertArray(bC,bD);
},assertMap:function(bE,bF){qx.core.Assert.assertMap(bE,bF);
},assertRegExp:function(bG,bH){qx.core.Assert.assertRegExp(bG,bH);
},assertType:function(bI,bJ,bK){qx.core.Assert.assertType(bI,bJ,bK);
},assertInstance:function(bL,bM,bN){qx.core.Assert.assertInstance(bL,bM,bN);
},assertInterface:function(bO,bP,bQ){qx.core.Assert.assertInterface(bO,bP,bQ);
},assertCssColor:function(bR,bS,bT){qx.core.Assert.assertCssColor(bR,bS,bT);
},assertElement:function(bU,bV){qx.core.Assert.assertElement(bU,bV);
},assertQxObject:function(bW,bX){qx.core.Assert.assertQxObject(bW,bX);
},assertQxWidget:function(bY,ca){qx.core.Assert.assertQxWidget(bY,ca);
}}});
})();
(function(){var c="qx.dev.unit.TestCase",b="Called skip()",a="qx.event.type.Data";
qx.Class.define(c,{extend:qx.core.Object,include:[qx.core.MAssert],events:{assertionFailed:a},properties:{testResult:{init:null},testFunc:{init:null}},members:{isDebugOn:function(){return false;
},wait:function(d,e,f){throw new qx.dev.unit.AsyncWrapper(d,e,f);
},resume:function(g,self){this.getTestResult().run(this.getTestFunc(),g||qx.lang.Function.empty,self||this,true);
},skip:function(h){throw new qx.dev.unit.RequirementError(null,h||b);
}}});
})();
(function(){var d="Function",c="qx.dev.unit.AsyncWrapper",b="Integer",a="Object";
qx.Class.define(c,{extend:qx.core.Object,construct:function(e,f,g){for(var i=0;i<2;i++){if(qx.lang.Type.isFunction(arguments[i])){this.setDeferredFunction(arguments[i]);
}else if(qx.lang.Type.isNumber(arguments[i])){this.setDelay(arguments[i]);
}}
if(g){this.setContext(g);
}},properties:{deferredFunction:{check:d,init:false},context:{check:a,init:null},delay:{check:b,nullable:false,init:5000}}});
})();
(function(){var c=": ",b="qx.dev.unit.RequirementError",a="Requirement not met";
qx.Class.define(b,{extend:Error,construct:function(d,e){this.__vL=e||a;
this.__vM=d;
var f=Error.call(this,this.__vL);
if(f.stack){this.stack=f.stack;
}
if(f.stacktrace){this.stacktrace=f.stacktrace;
}},members:{__vL:null,__vM:null,getRequirement:function(){return this.__vM;
},toString:function(){var g=this.__vL;

if(this.__vM){g+=c+this.__vM;
}return g;
}}});
})();
(function(){var h="existsCheck",g="test",f="Unknown test class!",e="Sub class check.",d="String",c="'is not a sub class of 'qx.dev.unit.TestCase'",b="The test class '",a="qx.dev.unit.TestClass";
qx.Class.define(a,{extend:qx.dev.unit.AbstractTestSuite,construct:function(i){qx.dev.unit.AbstractTestSuite.call(this);

if(!i){this.addFail(h,f);
return;
}
if(!qx.Class.isSubClassOf(i,qx.dev.unit.TestCase)){this.addFail(e,b+i.classname+c);
return;
}var l=i.prototype;
var j=new i;

for(var k in l){if(qx.lang.Type.isFunction(l[k])&&k.indexOf(g)==0){this.addTestMethod(j,k);
}}this.setName(i.classname);
},properties:{name:{check:d}}});
})();
(function(){var k="qx.event.type.Data",j="error",h="failure",g="testrunner.unit",f="assertionFailed",e="skip",d="endTest",c="qx.dev.unit.RequirementError",b="failed",a="Error in asynchronous test",y="Asynchronous Test Error",x="tearDown",w="setUp failed",v="wait",u="tearDown failed: ",t="qx.dev.unit.TestResult",s="resume() called before wait()",r="qx.core.AssertionError",q="setUp failed: ",p="tearDown failed",n="Timeout reached before resume() was called.",o="\n",m="startTest";
qx.Class.define(t,{extend:qx.core.Object,events:{startTest:k,endTest:k,error:k,failure:k,wait:k,skip:k},statics:{run:function(z,A,B){z.run(A,B);
}},members:{_timeout:null,run:function(C,D,self,E){if(!this._timeout){this._timeout={};
}var G=C.getTestClass();

if(!G.hasListener(f)){G.addListener(f,function(M){var N=[{exception:M.getData(),test:C}];
this.fireDataEvent(h,N);
},this);
}
if(E&&!this._timeout[C.getFullName()]){this._timeout[C.getFullName()]=b;
var H=new qx.type.BaseError(a,s);
this._createError(h,[H],C);
return;
}this.fireDataEvent(m,C);

if(this._timeout[C.getFullName()]){if(this._timeout[C.getFullName()]!==b){this._timeout[C.getFullName()].stop();
this._timeout[C.getFullName()].dispose();
}delete this._timeout[C.getFullName()];
}else{try{C.setUp();
}catch(O){try{this.tearDown(C);
}catch(P){}if(O.classname==c){this._createError(e,[O],C);
}else{if(O instanceof qx.type.BaseError&&O.message==qx.type.BaseError.DEFAULTMESSAGE){O.message=w;
}else{O.message=q+O.message;
}this._createError(j,[O],C);
}return;
}}
try{D.call(self||window);
}catch(Q){var J=true;

if(Q instanceof qx.dev.unit.AsyncWrapper){if(this._timeout[C.getFullName()]){return ;
}
if(Q.getDelay()){var F=this;
var L=function(){throw new qx.core.AssertionError(y,n);
};
var K=(Q.getDeferredFunction()?Q.getDeferredFunction():L);
var I=(Q.getContext()?Q.getContext():window);
this._timeout[C.getFullName()]=qx.event.Timer.once(function(){this.run(C,K,I);
},F,Q.getDelay());
this.fireDataEvent(v,C);
}}else{try{this.tearDown(C);
}catch(R){}
if(Q.classname==r){this._createError(h,[Q],C);
}else if(Q.classname==c){this._createError(e,[Q],C);
}else{this._createError(j,[Q],C);
}}}
if(!J){try{this.tearDown(C);
this.fireDataEvent(d,C);
}catch(S){if(S instanceof qx.type.BaseError&&S.message==qx.type.BaseError.DEFAULTMESSAGE){S.message=p;
}else{S.message=u+S.message;
}this._createError(j,[S],C);
}}},_createError:function(T,U,V){var W=[];

for(var i=0,l=U.length;i<l;i++){W.push({exception:U[i],test:V});
}this.fireDataEvent(T,W);
this.fireDataEvent(d,V);
},__vN:function(X){X._addedListeners=[];

if(!qx.event.Registration.addListenerOriginal){qx.event.Registration.addListenerOriginal=qx.event.Registration.addListener;
qx.event.Registration.addListener=function(Y,ba,bb,self,bc){var bd=qx.event.Registration.addListenerOriginal(Y,ba,bb,self,bc);
var be=true;

if((Y.classname&&Y.classname.indexOf(g)==0)||(self&&self.classname&&self.classname.indexOf(g)==0)){be=false;
}
if(be){X._addedListeners.push([Y,bd]);
}return bd;
};
}},__vO:function(bf){if(bf._addedListeners){var bg=bf._addedListeners;

for(var i=0,l=bg.length;i<l;i++){var bi=bg[i][0];
var bh=bg[i][1];

try{qx.event.Registration.removeListenerById(bi,bh);
}catch(bj){}}}},tearDown:function(bk){bk.tearDown();
var bo=bk.getTestClass();
var bm=x+qx.lang.String.firstUp(bk.getName());

if(bo[bm]){bo[bm]();
}
if(false&&qx.dev.Debug.disposeProfilingActive){var bp=bk.getFullName();
var bn=qx.dev.Debug.stopDisposeProfiling();

for(var i=0;i<bn.length;i++){var bl;

if(bn[i].stackTrace){bl=bn[i].stackTrace.join(o);
}window.top.qx.log.Logger.warn("Undisposed object in "+bp+": "+bn[i].object.classname+"["+bn[i].object.toHashCode()+"]"+"\n"+bl);
}}}},destruct:function(){this._timeout=null;
}});
})();
(function(){var h="interval",g="qx.event.Timer",f="_applyInterval",d="_applyEnabled",c="Boolean",b="qx.event.type.Event",a="Integer";
qx.Class.define(g,{extend:qx.core.Object,construct:function(i){qx.core.Object.call(this);
this.setEnabled(false);

if(i!=null){this.setInterval(i);
}var self=this;
this.__eo=function(){self._oninterval.call(self);
};
},events:{"interval":b},statics:{once:function(j,k,l){var m=new qx.event.Timer(l);
m.__ep=j;
m.addListener(h,function(e){m.stop();
j.call(k,e);
m.dispose();
k=null;
},k);
m.start();
return m;
}},properties:{enabled:{init:true,check:c,apply:d},interval:{check:a,init:1000,apply:f}},members:{__eq:null,__eo:null,_applyInterval:function(n,o){if(this.getEnabled()){this.restart();
}},_applyEnabled:function(p,q){if(q){window.clearInterval(this.__eq);
this.__eq=null;
}else if(p){this.__eq=window.setInterval(this.__eo,this.getInterval());
}},start:function(){this.setEnabled(true);
},startWith:function(r){this.setInterval(r);
this.start();
},stop:function(){this.setEnabled(false);
},restart:function(){this.stop();
this.start();
},restartWith:function(s){this.stop();
this.startWith(s);
},_oninterval:qx.event.GlobalError.observeMethod(function(){if(this.$$disposed){return;
}
if(this.getEnabled()){this.fireEvent(h);
}})},destruct:function(){if(this.__eq){window.clearInterval(this.__eq);
}this.__eq=this.__eo=null;
}});
})();
(function(){var m=": ",l="",k="construct",h="object",g="-",f=":",d=") ***",c="\r\n",b="px;'>",a="): ",I="</span><br>",H="*** EXCEPTION (",G="============================================================",F="Object",E="<br>",D="null",C="Array",B="members",A="statics",z="get",t="qx.dev.Debug",u=": EXCEPTION expanding property",r="\n",s="*** TOO MUCH RECURSION: not displaying ***",p="Object, count=",q="  ",n="<span style='padding-left:",o=" ",v="------------------------------------------------------------",w="Array, length=",y="undefined",x="index(";
qx.Class.define(t,{statics:{disposeProfilingActive:false,debugObject:function(J,K,L){qx.log.Logger.debug(this,qx.dev.Debug.debugObjectToString(J,K,L,false));
},debugObjectToString:function(M,N,O,P){if(!O){O=10;
}var V=(P?I:r);
var S=function(W){var X;

if(!P){X=l;

for(var i=0;i<W;i++){X+=q;
}}else{X=n+(W*8)+b;
}return X;
};
var U=l;
var R=function(Y,ba,bb){if(ba>bb){U+=(S(ba)+s+V);
return;
}if(typeof (Y)!=h){U+=S(ba)+Y+V;
return;
}for(var bc in Y){if(typeof (Y[bc])==h){try{if(Y[bc] instanceof Array){U+=S(ba)+bc+m+C+V;
}else if(Y[bc]===null){U+=S(ba)+bc+m+D+V;
continue;
}else if(Y[bc]===undefined){U+=S(ba)+bc+m+y+V;
continue;
}else{U+=S(ba)+bc+m+F+V;
}R(Y[bc],ba+1,bb);
}catch(e){U+=S(ba)+bc+u+V;
}}else{U+=S(ba)+bc+m+Y[bc]+V;
}}};
if(N){U+=S(0)+N+V;
}
if(M instanceof Array){U+=S(0)+w+M.length+f+V;
}else if(typeof (M)==h){var Q=0;

for(var T in M){Q++;
}U+=S(0)+p+Q+f+V;
}U+=S(0)+v+V;

try{R(M,0,O);
}catch(bd){U+=S(0)+H+bd+d+V;
}U+=S(0)+G+V;
return U;
},getFunctionName:function(be,bf){var bg=be.self;

if(!bg){return null;
}while(be.wrapper){be=be.wrapper;
}
switch(bf){case k:return be==bg?k:null;
case B:return qx.lang.Object.getKeyFromValue(bg,be);
case A:return qx.lang.Object.getKeyFromValue(bg.prototype,be);
default:if(be==bg){return k;
}return (qx.lang.Object.getKeyFromValue(bg.prototype,be)||qx.lang.Object.getKeyFromValue(bg,be)||null);
}},debugProperties:function(bh,bi,bj,bk){if(bi==null){bi=10;
}if(bk==null){bk=1;
}var bl=l;
bj?bl=E:bl=c;
var bn=l;

if(qx.lang.Type.isNumber(bh)||qx.lang.Type.isString(bh)||qx.lang.Type.isBoolean(bh)||bh==null||bi<=0){return bh;
}else if(qx.Class.hasInterface(bh.constructor,qx.data.IListData)){for(var i=0;i<bh.length;i++){for(var j=0;j<bk;j++){bn+=g;
}bn+=x+i+a+this.debugProperties(bh.getItem(i),bi-1,bj,bk+1)+bl;
}return bn+bl;
}else if(bh.constructor!=null){var bo=bh.constructor.$$properties;

for(var bm in bo){bn+=bl;
for(var j=0;j<bk;j++){bn+=g;
}bn+=o+bm+m+this.debugProperties(bh[z+qx.lang.String.firstUp(bm)](),bi-1,bj,bk+1);
}return bn;
}return l;
},startDisposeProfiling:qx.lang.Function.empty,stopDisposeProfiling:qx.lang.Function.empty}});
})();
(function(){var d="=",c="+",b="&",a="qx.lang.Object";
qx.Bootstrap.define(a,{statics:{empty:function(e){for(var f in e){if(e.hasOwnProperty(f)){delete e[f];
}}},isEmpty:function(g){for(var h in g){return false;
}return true;
},hasMinLength:function(j,k){if(k<=0){return true;
}var length=0;

for(var m in j){if((++length)>=k){return true;
}}return false;
},getLength:qx.Bootstrap.objectGetLength,getKeys:qx.Bootstrap.getKeys,getKeysAsString:qx.Bootstrap.getKeysAsString,getValues:function(n){var p=[];
var o=this.getKeys(n);

for(var i=0,l=o.length;i<l;i++){p.push(n[o[i]]);
}return p;
},mergeWith:qx.Bootstrap.objectMergeWith,carefullyMergeWith:function(q,r){return qx.lang.Object.mergeWith(q,r,false);
},merge:function(s,t){var u=arguments.length;

for(var i=1;i<u;i++){qx.lang.Object.mergeWith(s,arguments[i]);
}return s;
},clone:function(v,w){if(qx.lang.Type.isObject(v)){var x={};

for(var y in v){if(w){x[y]=qx.lang.Object.clone(v[y],w);
}else{x[y]=v[y];
}}return x;
}else if(qx.lang.Type.isArray(v)){var x=[];

for(var i=0;i<v.length;i++){if(w){x[i]=qx.lang.Object.clone(v[i]);
}else{x[i]=v[i];
}}return x;
}return v;
},invert:function(z){var A={};

for(var B in z){A[z[B].toString()]=B;
}return A;
},getKeyFromValue:function(C,D){for(var E in C){if(C.hasOwnProperty(E)&&C[E]===D){return E;
}}return null;
},contains:function(F,G){return this.getKeyFromValue(F,G)!==null;
},select:function(H,I){return I[H];
},fromArray:function(J){var K={};

for(var i=0,l=J.length;i<l;i++){K[J[i].toString()]=true;
}return K;
},toUriParameter:function(L,M){var P,N=[];

for(P in L){if(L.hasOwnProperty(P)){var O=L[P];

if(O instanceof Array){for(var i=0;i<O.length;i++){this.__hm(P,O[i],N,M);
}}else{this.__hm(P,O,N,M);
}}}return N.join(b);
},__hm:function(Q,R,S,T){var U=window.encodeURIComponent;

if(T){S.push(U(Q).replace(/%20/g,c)+d+U(R).replace(/%20/g,c));
}else{S.push(U(Q)+d+U(R));
}}}});
})();
(function(){var c="$test_",b="_",a="qx.dev.unit.JsUnitTestResult";
qx.Class.define(a,{extend:qx.dev.unit.TestResult,construct:function(){qx.dev.unit.TestResult.call(this);
this.__vP=[];
},members:{__vP:null,run:function(d,e){var f=c+d.getFullName().replace(/\W/g,b);
this.__vP.push(f);
window[f]=e;
},exportToJsUnit:function(){var self=this;
window.exposeTestFunctionNames=function(){return self.__vP;
};
window.isTestPageLoaded=true;
}}});
})();
(function(){var a="qx.dev.unit.TestLoaderBasic";
qx.Class.define(a,{extend:qx.core.Object,include:[qx.dev.unit.MTestLoader],construct:function(b){if(b){this.setTestNamespace(b);
}}});
})();
(function(){var r="state",q="get",p=".",o="start",n="error",m="wait",k="ie",j="class",h="browser.version",g="failure",c="testrunner.runner.ModelUtil",f="test",e="browser.name",b="package",a="static",d=":";
qx.Class.define(c,{type:a,statics:{createModelData:function(s){var v={};

for(var i=0,l=s.length;i<l;i++){var u=s[i].classname.split(p);
var t=s[i].tests;
t.sort();

for(var x=0,y=t.length;x<y;x++){testrunner.runner.ModelUtil.addChainToMap(u.concat(t[x]),v);
}}return v;
},getItemsByProperty:function(w,z,A){var C=qx.lang.String.firstUp(z);
var D=[];

if(w[q+C]&&w[q+C]()===A){D.push(w);
}
if(!w.getChildren){return D;
}var B=w.getChildren();

for(var i=0,l=B.length;i<l;i++){var E=B.getItem(i);
D=D.concat(arguments.callee(E,z,A));
}return D;
},getItemByFullName:function(F,G){if(F.fullName==G){return F;
}
if(F.getChildren){var I=F.getChildren();

for(var i=0,l=I.length;i<l;i++){var J=I.getItem(i);
var H=arguments.callee(J,G);

if(H){return H;
}}}return null;
},addDataFields:function(K){if(!K.parent){K.fullName=K.getName();
}
if(K.getChildren){var L=K.getType();

if(L==b||L==j){K.sortChildren();
}var M=K.getChildren();

for(var i=0,l=M.length;i<l;i++){var N=M.getItem(i);
N.parent=K;

if(N.getType()==f){N.fullName=K.fullName+d+N.getName();
}else{N.fullName=K.fullName+p+N.getName();
}arguments.callee(N);
if(!(qx.core.Environment.get(e)===k&&qx.core.Environment.get(h)<9)){N.bind(r,K,r,{converter:function(O,P){if(P.getState()==g||P.getState()==n||O==o||O==m){return P.getState();
}return O;
}});
}}}},addChainToMap:function(Q,R){if(Q.length==0){return;
}var T=Q.concat();
var U=T.shift();

if(!R.children){R.children=[];
}var S=false;

for(var i=0,l=R.children.length;i<l;i++){if(R.children[i].name===U){S=R.children[i];
break;
}}
if(!S){S={name:U};
R.children.push(S);
}arguments.callee(T,S);
},getNextSiblingOf:function(V){if(!V.parent){return null;
}var W=V.parent.getChildren();

if(!W){return null;
}var X=W.indexOf(V);

if(X<W.length-1){return W.getItem(X+1);
}return null;
}}});
})();
(function(){var j="",i="mshtml",h="msie",g="maple",f=")(/| )([0-9]+\.[0-9])",e="(",d="ce",c="CSS1Compat",b="android",a="operamini",H="gecko",G="browser.quirksmode",F="browser.name",E="mobile chrome",D="iemobile",C="prism|Fennec|Camino|Kmeleon|Galeon|Netscape|SeaMonkey|Namoroka|Firefox",B="opera mobi",A="Mobile Safari",z="Maple",y="operamobile",q="ie",r="mobile safari",o="IEMobile|Maxthon|MSIE",p="qx.bom.client.Browser",m="(Maple )([0-9]+\.[0-9]+\.[0-9]*)",n="opera mini",k="browser.version",l="opera",s="Opera Mini|Opera Mobi|Opera",t="AdobeAIR|Titanium|Fluid|Chrome|Android|Epiphany|Konqueror|iCab|OmniWeb|Maxthon|Pre|Mobile Safari|Safari",v="webkit",u="browser.documentmode",x="5.0",w="Mobile/";
qx.Bootstrap.define(p,{statics:{getName:function(){var L=navigator.userAgent;
var K=new RegExp(e+qx.bom.client.Browser.__dE+f);
var J=L.match(K);

if(!J){return j;
}var name=J[1].toLowerCase();
var I=qx.bom.client.Engine.getName();

if(I===v){if(name===b){name=E;
}else if(L.indexOf(A)!==-1||L.indexOf(w)!==-1){name=r;
}}else if(I===i){if(name===h){name=q;
if(qx.bom.client.OperatingSystem.getVersion()===d){name=D;
}}}else if(I===l){if(name===B){name=y;
}else if(name===n){name=a;
}}else if(I===H){if(L.indexOf(z)!==-1){name=g;
}}return name;
},getVersion:function(){var P=navigator.userAgent;
var O=new RegExp(e+qx.bom.client.Browser.__dE+f);
var N=P.match(O);

if(!N){return j;
}var name=N[1].toLowerCase();
var M=N[3];
if(P.match(/Version(\/| )([0-9]+\.[0-9])/)){M=RegExp.$2;
}
if(qx.bom.client.Engine.getName()==i){M=qx.bom.client.Engine.getVersion();

if(name===h&&qx.bom.client.OperatingSystem.getVersion()==d){M=x;
}}
if(qx.bom.client.Browser.getName()==g){O=new RegExp(m);
N=P.match(O);

if(!N){return j;
}M=N[2];
}return M;
},getDocumentMode:function(){if(document.documentMode){return document.documentMode;
}return 0;
},getQuirksMode:function(){if(qx.bom.client.Engine.getName()==i&&parseFloat(qx.bom.client.Engine.getVersion())>=8){return qx.bom.client.Engine.DOCUMENT_MODE===5;
}else{return document.compatMode!==c;
}},__dE:{"webkit":t,"gecko":C,"mshtml":o,"opera":s}[qx.bom.client.Engine.getName()]},defer:function(Q){qx.core.Environment.add(F,Q.getName),qx.core.Environment.add(k,Q.getVersion),qx.core.Environment.add(u,Q.getDocumentMode),qx.core.Environment.add(G,Q.getQuirksMode);
}});
})();
(function(){var u="",t="package",s="class",r="Backtrace:",q="test",p="<br>",o="engine.name",n="start",m="changeExceptions",k="qx.dev.unit.MAssert",e="function",j="script",h="qx.dev.unit.AssertionError",d="testrunner.runner.TestItem",c="qx.Class",g=" ",f="changeState";
qx.Class.define(d,{extend:qx.core.Object,construct:function(){qx.core.Object.call(this);
this.$$test=this;
},properties:{state:{init:n,event:f},exceptions:{init:[],nullable:true,event:m}},statics:{sortFunction:function(v,w){var x=v.getType();
var y=w.getType();
if(x==t&&y==s){return -1;
}
if(x==s&&y==t){return 1;
}var a=v.getName();
var b=w.getName();

if(a<b){return -1;
}
if(a>b){return 1;
}return 0;
}},members:{getModel:function(){return this.$$test;
},getFullName:function(){return this.fullName;
},getType:function(){var z=this.getName();

if(z.indexOf(q)===0&&z.length>4){if(this.getChildren){return t;
}return q;
}
if(z.substr(0,1)===z.substr(0,1).toUpperCase()){return s;
}return t;
},sortChildren:function(){this.getChildren().sort(testrunner.runner.TestItem.sortFunction);
},getMessage:qx.core.Environment.select(o,{"default":function(){if(this.getExceptions()&&this.getExceptions().length>0){var A=this.getExceptions();
var B=u;

for(var i=0,l=A.length;i<l;i++){B+=A[i].exception.toString()+g;
}return B;
}else{return u;
}},"opera":function(){if(this.getExceptions()&&this.getExceptions().length>0){var C=this.getExceptions();
var D=u;

for(var i=0,l=C.length;i<l;i++){var E=C[i].exception.message+u;

if(E.indexOf(r)<0){D+=C[i].exception.toString();
}else{D+=qx.lang.String.trim(E.split(r)[0]);
}}return D;
}else{return u;
}}}),getStackTrace:function(F){var G=[];

if(typeof (F.getStackTrace)==e){G=F.getStackTrace();
}else{G=qx.dev.StackTrace.getStackTraceFromError(F);
}while(G.length>0){var H=G[0];

if(H.indexOf(h)==0||H.indexOf(c)==0||H.indexOf(k)==0||H.indexOf(j)==0){G.shift();
}else{break;
}}return G.join(p);
}}});
})();
(function(){var a="qx.data.marshal.IMarshaler";
qx.Interface.define(a,{members:{toClass:function(b,c){},toModel:function(d){}}});
})();
(function(){var j="qx.data.model.",h="",g="Array",f="_validate",e='"',d="change",c="qx.data.marshal.Json",b="set",a="_applyEventPropagation";
qx.Class.define(c,{extend:qx.core.Object,implement:[qx.data.marshal.IMarshaler],construct:function(k){qx.core.Object.call(this);
this.__nm=k;
},statics:{$$instance:null,createModel:function(l,m){if(this.$$instance===null){this.$$instance=new qx.data.marshal.Json();
}this.$$instance.toClass(l,m);
return this.$$instance.toModel(l);
}},members:{__nm:null,__nn:function(n){return qx.Bootstrap.getKeys(n).sort().join(e);
},toClass:function(o,p){if(!qx.lang.Type.isObject(o)||!!o.$$isString||o instanceof qx.core.Object){if(o instanceof Array||qx.Bootstrap.getClass(o)==g){for(var i=0;i<o.length;i++){this.toClass(o[i],p);
}}return ;
}var r=this.__nn(o);
for(var s in o){this.toClass(o[s],p);
}if(qx.Class.isDefined(j+r)){return;
}if(this.__nm&&this.__nm.getModelClass&&this.__nm.getModelClass(r)!=null){return;
}var y={};
var x={__no:this.__no};

for(var s in o){if(this.__nm&&this.__nm.getPropertyMapping){s=this.__nm.getPropertyMapping(s,r);
}s=s.replace(/-|\.|\s+/g,h);
y[s]={};
y[s].nullable=true;
y[s].event=d+qx.lang.String.firstUp(s);
if(p){y[s].apply=a;
}if(this.__nm&&this.__nm.getValidationRule){var u=this.__nm.getValidationRule(r,s);

if(u){y[s].validate=f+s;
x[f+s]=u;
}}}if(this.__nm&&this.__nm.getModelSuperClass){var w=this.__nm.getModelSuperClass(r)||qx.core.Object;
}else{var w=qx.core.Object;
}var t=[];

if(this.__nm&&this.__nm.getModelMixins){var v=this.__nm.getModelMixins(r);
if(!qx.lang.Type.isArray(v)){if(v!=null){t=[v];
}}}if(p){t.push(qx.data.marshal.MEventBubbling);
}var q={extend:w,include:t,properties:y,members:x,destruct:this.__np};
qx.Class.define(j+r,q);
},__np:function(){var z=qx.util.PropertyUtil.getAllProperties(this.constructor);

for(var A in z){this.__no(this.get(z[A].name));
}},__no:function(B){if(!(B instanceof qx.core.Object)){return ;
}if(B.isDisposed()){return;
}B.dispose();
},__nq:function(C){var D;
if(this.__nm&&this.__nm.getModelClass){D=this.__nm.getModelClass(C);
}
if(D!=null){return (new D());
}else{var E=qx.Class.getByName(j+C);
return (new E());
}},toModel:function(F){var K=qx.lang.Type.isObject(F);
var G=F instanceof Array||qx.Bootstrap.getClass(F)==g;

if((!K&&!G)||!!F.$$isString||F instanceof qx.core.Object){return F;
}else if(G){var M=new qx.data.Array();
M.setAutoDisposeItems(true);

for(var i=0;i<F.length;i++){M.push(this.toModel(F[i]));
}return M;
}else if(K){var H=this.__nn(F);
var N=this.__nq(H);
for(var L in F){var I=L;

if(this.__nm&&this.__nm.getPropertyMapping){I=this.__nm.getPropertyMapping(L,H);
}var O=I.replace(/-|\.|\s+/g,h);
if((false)&&false){if(O!=I){this.warn("The model contained an illegal name: '"+L+"'. Replaced it with '"+I+"'.");
}}I=O;
var J=b+qx.lang.String.firstUp(I);

if(N[J]){N[J](this.toModel(F[L]));
}}return N;
}throw new Error("Unsupported type!");
}},destruct:function(){this.__nm=null;
}});
})();
(function(){var j="[",h="]",g="idBubble-",f=".",d="changeBubble",c="qx.data.marshal.MEventBubbling",b="",a="qx.event.type.Data";
qx.Mixin.define(c,{events:{"changeBubble":a},members:{_applyEventPropagation:function(k,l,name){this.fireDataEvent(d,{value:k,name:name,old:l,item:this});
this._registerEventChaining(k,l,name);
},_registerEventChaining:function(m,n,name){if((m instanceof qx.core.Object)&&qx.Class.hasMixin(m.constructor,qx.data.marshal.MEventBubbling)){var o=qx.lang.Function.bind(this.__mv,this,name);
var q=m.addListener(d,o,this);
var p=m.getUserData(g+this.$$hash);

if(p==null){p=[];
m.setUserData(g+this.$$hash,p);
}p.push(q);
}if(n!=null&&n.getUserData&&n.getUserData(g+this.$$hash)!=null){var p=n.getUserData(g+this.$$hash);

for(var i=0;i<p.length;i++){n.removeListenerById(p[i]);
}n.setUserData(g+this.$$hash,null);
}},__mv:function(name,e){var y=e.getData();
var u=y.value;
var s=y.old;
if(qx.Class.hasInterface(e.getTarget().constructor,qx.data.IListData)){if(y.name.indexOf){var x=y.name.indexOf(f)!=-1?y.name.indexOf(f):y.name.length;
var v=y.name.indexOf(j)!=-1?y.name.indexOf(j):y.name.length;
if(v==0){var t=name+y.name;
}else if(x<v){var r=y.name.substring(0,x);
var w=y.name.substring(x+1,y.name.length);

if(w[0]!=j){w=f+w;
}var t=name+j+r+h+w;
}else if(v<x){var r=y.name.substring(0,v);
var w=y.name.substring(v,y.name.length);
var t=name+j+r+h+w;
}else{var t=name+j+y.name+h;
}}else{var t=name+j+y.name+h;
}}else{if(parseInt(name)==name&&name!==b){name=j+name+h;
}var t=name+f+y.name;
}this.fireDataEvent(d,{value:u,name:t,old:s,item:y.item||e.getTarget()});
}}});
})();
(function(){var d="$$theme_",c="$$user_",b="$$init_",a="qx.util.PropertyUtil";
qx.Class.define(a,{statics:{getProperties:function(e){return e.$$properties;
},getAllProperties:function(f){var i={};
var j=f;
while(j!=qx.core.Object){var h=this.getProperties(j);

for(var g in h){i[g]=h[g];
}j=j.superclass;
}return i;
},getUserValue:function(k,l){return k[c+l];
},setUserValue:function(m,n,o){m[c+n]=o;
},deleteUserValue:function(p,q){delete (p[c+q]);
},getInitValue:function(r,s){return r[b+s];
},setInitValue:function(t,u,v){t[b+u]=v;
},deleteInitValue:function(w,x){delete (w[b+x]);
},getThemeValue:function(y,z){return y[d+z];
},setThemeValue:function(A,B,C){A[d+B]=C;
},deleteThemeValue:function(D,E){delete (D[d+E]);
},setThemed:function(F,G,H){var I=qx.core.Property.$$method.setThemed;
F[I[G]](H);
},resetThemed:function(J,K){var L=qx.core.Property.$$method.resetThemed;
J[L[K]]();
}}});
})();
(function(){var o="change",n="changeBubble",m="",l="add",k="remove",j="0-",h="order",g="-",f="0",e="qx.event.type.Data",b="Boolean",d="qx.data.Array",c="number",a="changeLength";
qx.Class.define(d,{extend:qx.core.Object,include:qx.data.marshal.MEventBubbling,implement:[qx.data.IListData],construct:function(p){qx.core.Object.call(this);
if(p==undefined){this.__mO=[];
}else if(arguments.length>1){this.__mO=[];

for(var i=0;i<arguments.length;i++){this.__mO.push(arguments[i]);
}}else if(typeof p==c){this.__mO=new Array(p);
}else if(p instanceof Array){this.__mO=qx.lang.Array.clone(p);
}else{this.__mO=[];
this.dispose();
throw new Error("Type of the parameter not supported!");
}for(var i=0;i<this.__mO.length;i++){this._applyEventPropagation(this.__mO[i],null,i);
}this.__mP();
},properties:{autoDisposeItems:{check:b,init:false}},events:{"change":e,"changeLength":e},members:{__mO:null,concat:function(q){if(q){var r=this.__mO.concat(q);
}else{var r=this.__mO.concat();
}return new qx.data.Array(r);
},join:function(s){return this.__mO.join(s);
},pop:function(){var t=this.__mO.pop();
this.__mP();
this._registerEventChaining(null,t,this.length-1);
this.fireDataEvent(n,{value:[],name:this.length+m,old:[t],item:this});
this.fireDataEvent(o,{start:this.length-1,end:this.length-1,type:k,items:[t]},null);
return t;
},push:function(u){for(var i=0;i<arguments.length;i++){this.__mO.push(arguments[i]);
this.__mP();
this._registerEventChaining(arguments[i],null,this.length-1);
this.fireDataEvent(n,{value:[arguments[i]],name:(this.length-1)+m,old:[],item:this});
this.fireDataEvent(o,{start:this.length-1,end:this.length-1,type:l,items:[arguments[i]]},null);
}return this.length;
},reverse:function(){if(this.length==0){return;
}var v=this.__mO.concat();
this.__mO.reverse();
this.fireDataEvent(o,{start:0,end:this.length-1,type:h,items:null},null);
this.fireDataEvent(n,{value:this.__mO,name:j+(this.__mO.length-1),old:v,item:this});
},shift:function(){if(this.length==0){return;
}var w=this.__mO.shift();
this.__mP();
this._registerEventChaining(null,w,this.length-1);
this.fireDataEvent(n,{value:[],name:f,old:[w],item:this});
this.fireDataEvent(o,{start:0,end:this.length-1,type:k,items:[w]},null);
return w;
},slice:function(x,y){return new qx.data.Array(this.__mO.slice(x,y));
},splice:function(z,A,B){var J=this.__mO.length;
var F=this.__mO.splice.apply(this.__mO,arguments);
if(this.__mO.length!=J){this.__mP();
}var H=A>0;
var D=arguments.length>2;
var E=null;

if(H||D){if(this.__mO.length>J){var I=l;
}else if(this.__mO.length<J){var I=k;
E=F;
}else{var I=h;
}this.fireDataEvent(o,{start:z,end:this.length-1,type:I,items:E},null);
}for(var i=2;i<arguments.length;i++){this._registerEventChaining(arguments[i],null,z+i);
}var G=[];

for(var i=2;i<arguments.length;i++){G[i-2]=arguments[i];
}var C=(z+Math.max(arguments.length-3,A-1));
var name=z==C?C:z+g+C;
this.fireDataEvent(n,{value:G,name:name+m,old:F,item:this});
for(var i=0;i<F.length;i++){this._registerEventChaining(null,F[i],i);
}return (new qx.data.Array(F));
},sort:function(K){if(this.length==0){return;
}var L=this.__mO.concat();
this.__mO.sort.apply(this.__mO,arguments);
this.fireDataEvent(o,{start:0,end:this.length-1,type:h,items:null},null);
this.fireDataEvent(n,{value:this.__mO,name:j+(this.length-1),old:L,item:this});
},unshift:function(M){for(var i=arguments.length-1;i>=0;i--){this.__mO.unshift(arguments[i]);
this.__mP();
this._registerEventChaining(arguments[i],null,0);
this.fireDataEvent(n,{value:[this.__mO[0]],name:f,old:[this.__mO[1]],item:this});
this.fireDataEvent(o,{start:0,end:this.length-1,type:l,items:[arguments[i]]},null);
}return this.length;
},toArray:function(){return this.__mO;
},getItem:function(N){return this.__mO[N];
},setItem:function(O,P){var Q=this.__mO[O];
if(Q===P){return;
}this.__mO[O]=P;
this._registerEventChaining(P,Q,O);
if(this.length!=this.__mO.length){this.__mP();
}this.fireDataEvent(n,{value:[P],name:O+m,old:[Q],item:this});
this.fireDataEvent(o,{start:O,end:O,type:l,items:[P]},null);
},getLength:function(){return this.length;
},indexOf:function(R){return this.__mO.indexOf(R);
},toString:function(){if(this.__mO!=null){return this.__mO.toString();
}return m;
},contains:function(S){return this.__mO.indexOf(S)!==-1;
},copy:function(){return this.concat();
},insertAt:function(T,U){this.splice(T,0,U).dispose();
},insertBefore:function(V,W){var X=this.indexOf(V);

if(X==-1){this.push(W);
}else{this.splice(X,0,W).dispose();
}},insertAfter:function(Y,ba){var bb=this.indexOf(Y);

if(bb==-1||bb==(this.length-1)){this.push(ba);
}else{this.splice(bb+1,0,ba).dispose();
}},removeAt:function(bc){var be=this.splice(bc,1);
var bd=be.getItem(0);
be.dispose();
return bd;
},removeAll:function(){for(var i=0;i<this.__mO.length;i++){this._registerEventChaining(null,this.__mO[i],i);
}if(this.getLength()==0){return;
}var bg=this.getLength();
var bf=this.__mO.concat();
this.__mO.length=0;
this.__mP();
this.fireDataEvent(n,{value:[],name:j+(bg-1),old:bf,item:this});
this.fireDataEvent(o,{start:0,end:bg-1,type:k,items:bf},null);
return bf;
},append:function(bh){if(bh instanceof qx.data.Array){bh=bh.toArray();
}Array.prototype.push.apply(this.__mO,bh);
for(var i=0;i<bh.length;i++){this._registerEventChaining(bh[i],null,this.__mO.length+i);
}var bi=this.length;
this.__mP();
var name=bi==(this.length-1)?bi:bi+g+(this.length-1);
this.fireDataEvent(n,{value:bh,name:name+m,old:[],item:this});
this.fireDataEvent(o,{start:bi,end:this.length-1,type:l,items:bh},null);
},remove:function(bj){var bk=this.indexOf(bj);

if(bk!=-1){this.splice(bk,1).dispose();
return bj;
}},equals:function(bl){if(this.length!==bl.length){return false;
}
for(var i=0;i<this.length;i++){if(this.getItem(i)!==bl.getItem(i)){return false;
}}return true;
},sum:function(){var bm=0;

for(var i=0;i<this.length;i++){bm+=this.getItem(i);
}return bm;
},max:function(){var bn=this.getItem(0);

for(var i=1;i<this.length;i++){if(this.getItem(i)>bn){bn=this.getItem(i);
}}return bn===undefined?null:bn;
},min:function(){var bo=this.getItem(0);

for(var i=1;i<this.length;i++){if(this.getItem(i)<bo){bo=this.getItem(i);
}}return bo===undefined?null:bo;
},forEach:function(bp,bq){for(var i=0;i<this.__mO.length;i++){bp.call(bq,this.__mO[i],i,this);
}},__mP:function(){var br=this.length;
this.length=this.__mO.length;
this.fireDataEvent(a,this.length,br);
}},destruct:function(){for(var i=0;i<this.__mO.length;i++){var bs=this.__mO[i];
this._applyEventPropagation(null,bs,i);
if(this.isAutoDisposeItems()&&bs&&bs instanceof qx.core.Object){bs.dispose();
}}this.__mO=null;
}});
})();
(function(){var p="loading",o="error",n="load",m="testclass=",l="external",k="file:",j="inline",h="__vQ",g="?testclass=",f="testrunner.testParts",c="__vS",e="iframe",d="testrunner.runner.TestRunner",b="test",a="qx.testPageUri";
qx.Class.define(d,{extend:testrunner.runner.TestRunnerBasic,construct:function(){testrunner.runner.TestRunnerBasic.call(this);
if(this.view.getLogAppenderElement){this.__vQ=new qx.log.appender.Element();
qx.log.Logger.unregister(this.__vQ);
this.__vQ.setElement(this.view.getLogAppenderElement());
{qx.log.Logger.register(this.__vQ);
};
}},members:{__vx:null,frameWindow:null,__vR:null,__vS:null,__vQ:null,_externalTestClasses:null,_getTestNameSpace:function(){var q=location.search;

if(q.indexOf(m)>0){return q.substr(q.indexOf(m)+10);
}return b;
},_loadTests:function(){var r=l;

switch(r){case e:this.__vx=this.view.getIframe();
qx.event.Registration.addListener(this.__vx,n,this._onLoadIframe,this);
var s=qx.core.Environment.get(a);
s+=g+this._testNameSpace;
this.setTestSuiteState(p);
this.view.setAutUri(s);
break;
case j:this._loadInlineTests();
break;
case l:this._loadExternalTests();
break;
}},_loadInlineTests:function(t){t=t||this._testNameSpace;
this.setTestSuiteState(p);
this.loader=new qx.dev.unit.TestLoaderInline();
this.loader.setTestNamespace(t);
this._wrapAssertions();
this._getTestModel();
},_defineTestClass:function(u,v){var x=qx.Class;
return x.define(u,{extend:qx.dev.unit.TestCase,include:[qx.dev.unit.MMock,qx.dev.unit.MRequirements],members:v});
},_runTests:function(){if(this.__vQ){this.__vQ.clear();
}testrunner.runner.TestRunnerBasic.prototype._runTests.call(this);
},_getTestResult:function(){var y;
{var z=new qx.dev.unit.TestResult();
};
return z;
},_onTestEnd:function(A){testrunner.runner.TestRunnerBasic.prototype._onTestEnd.call(this);
},_onLoadIframe:function(B){if(B&&B.getType()==n){this.setTestSuiteState(p);
}
if(!this.__vR){this.__vR=0;
}this.__vR++;
this.frameWindow=qx.bom.Iframe.getWindow(this.__vx);

if(this.__vS){this.__vS.stop();
this.__vS=null;
}
if(this.__vR<=300){if(!this.frameWindow.body){if(this.__vR>=20&&window.location.protocol==k){alert("Failed to load application from the file system.\n\n"+"The security settings of your browser may prohibit to access "+"frames loaded using the file protocol. Please try the http "+"protocol instead.");
this.setTestSuiteState(o);
return;
}}if(!this.frameWindow.testrunner){this.__vS=qx.event.Timer.once(this._onLoadIframe,this,100);
return;
}this.loader=this.frameWindow.testrunner.TestLoader.getInstance();
if(!this.loader){this.__vS=qx.event.Timer.once(this._onLoadIframe,this,100);
return;
}
if(!this.loader.getSuite()){this.__vS=qx.event.Timer.once(this._onLoadIframe,this,100);
return;
}}else{this.setTestSuiteState(o);
this.__vR=0;
return;
}this.__vR=0;
var C=this.frameWindow.qx.core.Environment.get(f);

if(C instanceof this.frameWindow.Boolean){C=C.valueOf();
}
if(C){for(var i=0;i<C.length;i++){this._testParts.push(C[i]);
}}
if(this.__vQ){this.__vQ.clear();
}this._wrapAssertions(this.frameWindow);
this._getTestModel();
},__vT:function(){var w=qx.bom.Iframe.getWindow(this.__vx);
var D;

if(w.qx&&w.qx.log&&w.qx.log.Logger){D=w.qx.log.Logger;

if(this.view.getLogLevel){D.setLevel(this.view.getLogLevel());
}D.register(this.__vQ);
D.clear();
D.unregister(this.__vQ);
}}},destruct:function(){this._disposeObjects(h,c);
this.__vx=null;
delete this.__vx;
this.frameWindow=null;
delete this.frameWindow;
}});
})();
(function(){var q="",p='.qxappender .type-array{color:#CC3E8A;font-weight:bold;}',o='.qxappender .type-instance{color:#565656;font-weight:bold}',n="qx.log.appender.Element",m='.qxappender .level-info{background:#DEEDFA}',l='.qxappender .type-stringify{color:#565656;font-weight:bold}',k='.qxappender .type-number{color:#155791;font-weight:normal;}',j="qxappender",i='.qxappender .type-map{color:#CC3E8A;font-weight:bold;}',h='.qxappender .type-class{color:#5F3E8A;font-weight:bold}',c='.qxappender .type-boolean{color:#15BC91;font-weight:normal;}',g='.qxappender .level-error{background:#FFE2D5}',f='.qxappender .level-debug{background:white}',b='.qxappender .type-key{color:#565656;font-style:italic}',a='.qxappender .level-user{background:#E3EFE9}',e='.qxappender .level-warn{background:#FFF7D5}',d='.qxappender .type-string{color:black;font-weight:normal;}';
qx.Class.define(n,{extend:qx.core.Object,construct:function(r){qx.core.Object.call(this);
var s=[f,m,e,g,a,d,k,c,p,i,b,h,o,l];
qx.bom.Stylesheet.createElement(s.join(q));
qx.log.Logger.register(this);
},members:{__iP:null,setElement:function(t){this.clear();
if(t){qx.bom.element.Class.add(t,j);
}this.__iP=t;
},clear:function(){var u=this.__iP;
if(u){u.innerHTML=q;
}},process:function(v){var w=this.__iP;

if(!w){return;
}w.appendChild(qx.log.appender.Util.toHtml(v));
w.scrollTop=w.scrollHeight;
}},destruct:function(){this.__iP=null;
}});
})();
(function(){var p="head",o="text/css",n="html.stylesheet.removeimport",m="html.stylesheet.deleterule",l="stylesheet",k="html.stylesheet.addimport",j="html.stylesheet.insertrule",h="}",g="html.stylesheet.createstylesheet",f='@import "',c="{",e='";',d="qx.bom.Stylesheet",b="link",a="style";
qx.Bootstrap.define(d,{statics:{includeFile:function(q,r){if(!r){r=document;
}var s=r.createElement(b);
s.type=o;
s.rel=l;
s.href=q;
var t=r.getElementsByTagName(p)[0];
t.appendChild(s);
},createElement:function(u){if(qx.core.Environment.get(g)){var v=document.createStyleSheet();

if(u){v.cssText=u;
}return v;
}else{var w=document.createElement(a);
w.type=o;

if(u){w.appendChild(document.createTextNode(u));
}document.getElementsByTagName(p)[0].appendChild(w);
return w.sheet;
}},addRule:function(x,y,z){if(qx.core.Environment.get(j)){x.insertRule(y+c+z+h,x.cssRules.length);
}else{x.addRule(y,z);
}},removeRule:function(A,B){if(qx.core.Environment.get(m)){var C=A.cssRules;
var D=C.length;

for(var i=D-1;i>=0;--i){if(C[i].selectorText==B){A.deleteRule(i);
}}}else{var C=A.rules;
var D=C.length;

for(var i=D-1;i>=0;--i){if(C[i].selectorText==B){A.removeRule(i);
}}}},removeAllRules:function(E){if(qx.core.Environment.get(m)){var F=E.cssRules;
var G=F.length;

for(var i=G-1;i>=0;i--){E.deleteRule(i);
}}else{var F=E.rules;
var G=F.length;

for(var i=G-1;i>=0;i--){E.removeRule(i);
}}},addImport:function(H,I){if(qx.core.Environment.get(k)){H.addImport(I);
}else{H.insertRule(f+I+e,H.cssRules.length);
}},removeImport:function(J,K){if(qx.core.Environment.get(n)){var L=J.imports;
var N=L.length;

for(var i=N-1;i>=0;i--){if(L[i].href==K||L[i].href==qx.util.Uri.getAbsolute(K)){J.removeImport(i);
}}}else{var M=J.cssRules;
var N=M.length;

for(var i=N-1;i>=0;i--){if(M[i].href==K){J.deleteRule(i);
}}}},removeAllImports:function(O){if(qx.core.Environment.get(n)){var P=O.imports;
var R=P.length;

for(var i=R-1;i>=0;i--){O.removeImport(i);
}}else{var Q=O.cssRules;
var R=Q.length;

for(var i=R-1;i>=0;i--){if(Q[i].type==Q[i].IMPORT_RULE){O.deleteRule(i);
}}}}}});
})();
(function(){var h="object",g="function",f="qx.bom.client.Stylesheet",e="html.stylesheet.deleterule",d="html.stylesheet.insertrule",c="html.stylesheet.createstylesheet",b="html.stylesheet.addimport",a="html.stylesheet.removeimport";
qx.Bootstrap.define(f,{statics:{__fG:function(){if(!qx.bom.client.Stylesheet.__fH){qx.bom.client.Stylesheet.__fH=qx.bom.Stylesheet.createElement();
}return qx.bom.client.Stylesheet.__fH;
},getCreateStyleSheet:function(){return typeof document.createStyleSheet===h;
},getInsertRule:function(){return typeof qx.bom.client.Stylesheet.__fG().insertRule===g;
},getDeleteRule:function(){return typeof qx.bom.client.Stylesheet.__fG().deleteRule===g;
},getAddImport:function(){return (typeof qx.bom.client.Stylesheet.__fG().addImport===h);
},getRemoveImport:function(){return (typeof qx.bom.client.Stylesheet.__fG().removeImport===h);
}},defer:function(i){qx.core.Environment.add(c,i.getCreateStyleSheet);
qx.core.Environment.add(d,i.getInsertRule);
qx.core.Environment.add(e,i.getDeleteRule);
qx.core.Environment.add(b,i.getAddImport);
qx.core.Environment.add(a,i.getRemoveImport);
}});
})();
(function(){var k="file",j="strict",h="anchor",g="div",f="query",e="source",d="password",c="host",b="protocol",a="user",A="directory",z="loose",y="relative",x="queryKey",w="qx.util.Uri",v="",u="path",t="authority",s='">0</a>',r="&",p="port",q='<a href="',l="userInfo",n="?";
qx.Bootstrap.define(w,{statics:{parseUri:function(B,C){var D={key:[e,b,t,l,a,d,c,p,y,u,A,k,f,h],q:{name:x,parser:/(?:^|&)([^&=]*)=?([^&]*)/g},parser:{strict:/^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,loose:/^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/}};
var o=D,m=D.parser[C?j:z].exec(B),E={},i=14;

while(i--){E[o.key[i]]=m[i]||v;
}E[o.q.name]={};
E[o.key[12]].replace(o.q.parser,function(F,G,H){if(G){E[o.q.name][G]=H;
}});
return E;
},appendParamsToUrl:function(I,J){if(J===undefined){return I;
}
if(qx.lang.Type.isObject(J)){J=qx.lang.Object.toUriParameter(J);
}
if(!J){return I;
}return I+=(/\?/).test(I)?r+J:n+J;
},getAbsolute:function(K){var L=document.createElement(g);
L.innerHTML=q+K+s;
return L.firstChild.href;
}}});
})();
(function(){var l="",k="audio",j="video",i="undefined",h="number",g="function",f="html.video.h264",d="html.element.contains",c='video/ogg; codecs="theora, vorbis"',b="html.console",bh="html.xul",bg="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul",bf="html.video.ogg",be="http://www.w3.org/TR/SVG11/feature#BasicStructure",bd="html.storage.local",bc='audio',bb='video/mp4; codecs="avc1.42E01E, mp4a.40.2"',ba="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==",Y="html.audio",X="audio/mpeg",s="org.w3c.dom.svg",t="html.classlist",q="html.video",r="html.geolocation",o="DOMTokenList",p="html.storage.session",m="1.1",n="html.image.naturaldimensions",x="html.audio.aif",y="audio/x-wav",G="html.canvas",E="audio/ogg",N="html.audio.mp3",I="html.element.compareDocumentPosition",T="audio/x-aiff",R="html.audio.au",A="img",W="html.xpath",V="qx.bom.client.Html",U='video',z="span",C="html.element.textcontent",D="mshtml",F="html.vml",H="html.svg",J="html.audio.ogg",O="label",S='video/webm; codecs="vp8, vorbis"',u="html.dataurl",w="html.webworker",B="html.dataset",M="1.0",L="html.audio.wav",K="html.filereader",Q="audio/basic",P="html.video.webm";
qx.Bootstrap.define(V,{statics:{getWebWorker:function(){return window.Worker!=null;
},getFileReader:function(){return window.FileReader!=null;
},getGeoLocation:function(){return navigator.geolocation!=null;
},getAudio:function(){return !!document.createElement(bc).canPlayType;
},getAudioOgg:function(){if(!qx.bom.client.Html.getAudio()){return l;
}var a=document.createElement(k);
return a.canPlayType(E);
},getAudioMp3:function(){if(!qx.bom.client.Html.getAudio()){return l;
}var a=document.createElement(k);
return a.canPlayType(X);
},getAudioWav:function(){if(!qx.bom.client.Html.getAudio()){return l;
}var a=document.createElement(k);
return a.canPlayType(y);
},getAudioAu:function(){if(!qx.bom.client.Html.getAudio()){return l;
}var a=document.createElement(k);
return a.canPlayType(Q);
},getAudioAif:function(){if(!qx.bom.client.Html.getAudio()){return l;
}var a=document.createElement(k);
return a.canPlayType(T);
},getVideo:function(){return !!document.createElement(U).canPlayType;
},getVideoOgg:function(){if(!qx.bom.client.Html.getVideo()){return l;
}var v=document.createElement(j);
return v.canPlayType(c);
},getVideoH264:function(){if(!qx.bom.client.Html.getVideo()){return l;
}var v=document.createElement(j);
return v.canPlayType(bb);
},getVideoWebm:function(){if(!qx.bom.client.Html.getVideo()){return l;
}var v=document.createElement(j);
return v.canPlayType(S);
},getLocalStorage:function(){try{return window.localStorage!=null;
}catch(bi){return false;
}},getSessionStorage:function(){try{return window.sessionStorage!=null;
}catch(bj){return false;
}},getClassList:function(){return !!(document.documentElement.classList&&qx.Bootstrap.getClass(document.documentElement.classList)===o);
},getXPath:function(){return !!document.evaluate;
},getXul:function(){try{document.createElementNS(bg,O);
return true;
}catch(e){return false;
}},getSvg:function(){return document.implementation&&document.implementation.hasFeature&&(document.implementation.hasFeature(s,M)||document.implementation.hasFeature(be,m));
},getVml:function(){return qx.bom.client.Engine.getName()==D;
},getCanvas:function(){return !!window.CanvasRenderingContext2D;
},getDataUrl:function(bk){var bl=new Image();
bl.onload=bl.onerror=function(){window.setTimeout(function(){bk.call(null,(bl.width==1&&bl.height==1));
},0);
};
bl.src=ba;
},getDataset:function(){return !!document.documentElement.dataset;
},getContains:function(){return (typeof document.documentElement.contains!==i);
},getCompareDocumentPosition:function(){return (typeof document.documentElement.compareDocumentPosition===g);
},getTextContent:function(){var bm=document.createElement(z);
return (typeof bm.textContent!==i);
},getConsole:function(){return typeof window.console!==i;
},getNaturalDimensions:function(){var bn=document.createElement(A);
return typeof bn.naturalHeight===h&&typeof bn.naturalWidth===h;
}},defer:function(bo){qx.core.Environment.add(w,bo.getWebWorker);
qx.core.Environment.add(K,bo.getFileReader);
qx.core.Environment.add(r,bo.getGeoLocation);
qx.core.Environment.add(Y,bo.getAudio);
qx.core.Environment.add(J,bo.getAudioOgg);
qx.core.Environment.add(N,bo.getAudioMp3);
qx.core.Environment.add(L,bo.getAudioWav);
qx.core.Environment.add(R,bo.getAudioAu);
qx.core.Environment.add(x,bo.getAudioAif);
qx.core.Environment.add(q,bo.getVideo);
qx.core.Environment.add(bf,bo.getVideoOgg);
qx.core.Environment.add(f,bo.getVideoH264);
qx.core.Environment.add(P,bo.getVideoWebm);
qx.core.Environment.add(bd,bo.getLocalStorage);
qx.core.Environment.add(p,bo.getSessionStorage);
qx.core.Environment.add(t,bo.getClassList);
qx.core.Environment.add(W,bo.getXPath);
qx.core.Environment.add(bh,bo.getXul);
qx.core.Environment.add(G,bo.getCanvas);
qx.core.Environment.add(H,bo.getSvg);
qx.core.Environment.add(F,bo.getVml);
qx.core.Environment.add(B,bo.getDataset);
qx.core.Environment.addAsync(u,bo.getDataUrl);
qx.core.Environment.add(d,bo.getContains);
qx.core.Environment.add(I,bo.getCompareDocumentPosition);
qx.core.Environment.add(C,bo.getTextContent);
qx.core.Environment.add(b,bo.getConsole);
qx.core.Environment.add(n,bo.getNaturalDimensions);
}});
})();
(function(){var s="html.classlist",r="default",q="native",p="",o=" ",n='',m="(^|\\s)",k="(\\s|$)",j="\\b",h="g",c='function',g="\\b|\\b",f="qx.bom.element.Class",b='SVGAnimatedString',a='object',e="$2",d='undefined';
qx.Bootstrap.define(f,{statics:{__rY:/\s+/g,__sa:/^\s+|\s+$/g,add:qx.lang.Object.select(qx.core.Environment.get(s)?q:r,{"native":function(t,name){t.classList.add(name);
return name;
},"default":function(u,name){if(!this.has(u,name)){u.className+=(u.className?o:p)+name;
}return name;
}}),addClasses:qx.lang.Object.select(qx.core.Environment.get(s)?q:r,{"native":function(v,w){for(var i=0;i<w.length;i++){v.classList.add(w[i]);
}return v.className;
},"default":function(x,y){var z={};
var B;
var A=x.className;

if(A){B=A.split(this.__rY);

for(var i=0,l=B.length;i<l;i++){z[B[i]]=true;
}
for(var i=0,l=y.length;i<l;i++){if(!z[y[i]]){B.push(y[i]);
}}}else{B=y;
}return x.className=B.join(o);
}}),get:function(C){var D=C.className;

if(typeof D.split!==c){if(typeof D===a){if(qx.Bootstrap.getClass(D)==b){D=D.baseVal;
}else{D=n;
}}
if(typeof D===d){D=n;
}}return D;
},has:qx.lang.Object.select(qx.core.Environment.get(s)?q:r,{"native":function(E,name){return E.classList.contains(name);
},"default":function(F,name){var G=new RegExp(m+name+k);
return G.test(F.className);
}}),remove:qx.lang.Object.select(qx.core.Environment.get(s)?q:r,{"native":function(H,name){H.classList.remove(name);
return name;
},"default":function(I,name){var J=new RegExp(m+name+k);
I.className=I.className.replace(J,e);
return name;
}}),removeClasses:qx.lang.Object.select(qx.core.Environment.get(s)?q:r,{"native":function(K,L){for(var i=0;i<L.length;i++){K.classList.remove(L[i]);
}return K.className;
},"default":function(M,N){var O=new RegExp(j+N.join(g)+j,h);
return M.className=M.className.replace(O,p).replace(this.__sa,p).replace(this.__rY,o);
}}),replace:function(P,Q,R){this.remove(P,Q);
return this.add(P,R);
},toggle:qx.lang.Object.select(qx.core.Environment.get(s)?q:r,{"native":function(S,name,T){if(T===undefined){S.classList.toggle(name);
}else{T?this.add(S,name):this.remove(S,name);
}return name;
},"default":function(U,name,V){if(V==null){V=!this.has(U,name);
}V?this.add(U,name):this.remove(U,name);
return name;
}})}});
})();
(function(){var l="'>",k="[",h=", ",g="</span>",f="<span class='type-",e="</span> ",d="}",c="",b="]",a="\n",M="{",L="map",K="Use qx.dev.StackTrace.FORMAT_STACKTRACE instead",J="function",I="<span class='object'>",H="]:",G="&gt;",F="<span class='object' title='Object instance with hash code: ",E="FORMAT_STACK",D="string",s="level-",t="0",q="&lt;",r="<span class='offset'>",o=":",p="qx.log.appender.Util",m="&amp;",n="&#39;",u="DIV",v="<span>",y="&quot;",x="<span class='type-key'>",A="</span>:<span class='type-",z="</span>: ",C=" ",B="]</span>: ",w="?";
qx.Class.define(p,{statics:{toHtml:function(N){var X=[];
var U,W,P,R;
X.push(r,this.formatOffset(N.offset,6),e);

if(N.object){var O=N.win.qx.core.ObjectRegistry.fromHashCode(N.object);

if(O){X.push(F+O.$$hash+l,O.classname,k,O.$$hash,B);
}}else if(N.clazz){X.push(I+N.clazz.classname,z);
}var Q=N.items;

for(var i=0,V=Q.length;i<V;i++){U=Q[i];
W=U.text;

if(W instanceof Array){var R=[];

for(var j=0,T=W.length;j<T;j++){P=W[j];

if(typeof P===D){R.push(v+this.escapeHTML(P)+g);
}else if(P.key){R.push(x+P.key+A+P.type+l+this.escapeHTML(P.text)+g);
}else{R.push(f+P.type+l+this.escapeHTML(P.text)+g);
}}X.push(f+U.type+l);

if(U.type===L){X.push(M,R.join(h),d);
}else{X.push(k,R.join(h),b);
}X.push(g);
}else{X.push(f+U.type+l+this.escapeHTML(W)+e);
}}var S=document.createElement(u);
S.innerHTML=X.join(c);
S.className=s+N.level;
return S;
},formatOffset:function(Y,length){var bc=Y.toString();
var ba=(length||6)-bc.length;
var bb=c;

for(var i=0;i<ba;i++){bb+=t;
}return bb+bc;
},FORMAT_STACK:null,escapeHTML:function(bd){return String(bd).replace(/[<>&"']/g,this.__rH);
},__rH:function(be){var bf={"<":q,">":G,"&":m,"'":n,'"':y};
return bf[be]||w;
},toText:function(bg){return this.toTextArray(bg).join(C);
},toTextArray:function(bh){var bp=[];
bp.push(this.formatOffset(bh.offset,6));

if(bh.object){var bi=bh.win.qx.core.ObjectRegistry.fromHashCode(bh.object);

if(bi){bp.push(bi.classname+k+bi.$$hash+H);
}}else if(bh.clazz){bp.push(bh.clazz.classname+o);
}var bj=bh.items;
var bm,bo;

for(var i=0,bn=bj.length;i<bn;i++){bm=bj[i];
bo=bm.text;

if(bm.trace&&bm.trace.length>0){if(typeof (this.FORMAT_STACK)==J){qx.log.Logger.deprecatedConstantWarning(qx.log.appender.Util,E,K);
bo+=a+this.FORMAT_STACK(bm.trace);
}else{bo+=a+bm.trace;
}}
if(bo instanceof Array){var bk=[];

for(var j=0,bl=bo.length;j<bl;j++){bk.push(bo[j].text);
}
if(bm.type===L){bp.push(M,bk.join(h),d);
}else{bp.push(k,bk.join(h),b);
}}else{bp.push(bo);
}}return bp;
}}});
})();
(function(){var c="constructor",b="function",a="qx.dev.unit.MMock";
qx.Mixin.define(a,{construct:function(){var d=this.__vW();
d.assert.expose(this,{includeFail:false});
this.__vU=d.sandbox;
},members:{__vU:null,__vV:null,__vW:function(){return qx.dev.unit.Sinon.getSinon();
},spy:function(e,f){return this.__vU.spy.apply(this.__vU,arguments);
},stub:function(g,h){return this.__vU.stub.apply(this.__vU,arguments);
},mock:function(i){var j=this.__vW();
return j.mock.apply(j,arguments);
},useFakeXMLHttpRequest:function(){return this.__vV=this.__vU.useFakeXMLHttpRequest();
},getRequests:function(){return this.__vV.requests;
},useFakeServer:function(){return this.__vV=this.__vU.useFakeServer();
},getServer:function(){return this.__vU.server;
},getSandbox:function(){return this.__vU;
},deepStub:function(k){this.__vY(k).forEach(function(l){this.__wa(k,l);
},this);
return k;
},shallowStub:function(m,n){this.__vY(m,n).forEach(function(o){this.__wa(m,o);
},this);
return m;
},injectStub:function(p,q,r){var s=r||this.deepStub(new p[q]);
this.stub(p,q).returns(s);
return s;
},revealMock:function(t,u,v){var w=v||this.__vX(new t[u]);
this.stub(t,u).returns(w);
return this.mock(w);
},__vX:function(x){var y={};
for(var z in x){y[z]=x[z];
}return y;
},__vY:function(A,B){var G=A.constructor,F=[],D=[];
if(B){while(G.superclass){F.push(G);
G=G.superclass;

if(G==B.superclass){break;
}}}for(var E in A){if(F.length){var C=F.some(function(H){return H.prototype.hasOwnProperty(E);
});

if(!C){continue;
}}D.push(E);
}return D;
},__wa:function(I,J){if(J===c||typeof I[J]!==b){return;
}this.stub(I,J);
}}});
})();
(function(){var r="function",q="object",p="undefined",n="../sinon",m="",k="Attempted to wrap ",j="./sinon/assert",g="sandbox",f="spy",d="requests",bp="^",bo="stub",bn="_",bm="clock",bl="server",bk="[object Array]",bj="mock",bi="test",bh="Fake server response body should be string, but was ",bg="./sinon/mock",y="Cannot stub non-existent own property ",z="./sinon/collection",w="Method wrapper should be function",x="use strict",u="./util/fake_timers",v="div",s="once",t="string",C="static",D="toString",M="restore",K=" times",U="Should wrap property of object",P=" as function",bc="twice",ba="setInterval",G="qx.dev.unit.Sinon",bf="//",be="clearInterval",bd="sinon fake",E="number",I="sinon.test needs to wrap a test function, got ",J=" which is already ",L="Microsoft.XMLHTTP",N="thrice",Q="clearTimeout",W="./sinon/sandbox",bb="./sinon/stub",A="spied on",B="stubbed",H="./sinon/spy",T=" property ",S="verify",R=" which is already wrapped",Y="./sinon/test_case",X="Date",O="setTimeout",V="sinon.testCase needs an object with test functions",c="./sinon/test";
qx.Class.define(G,{type:C,statics:{getSinon:null}});
(function(){x;
var br=(function(){var bz=typeof document!=p&&document.createElement(v);
function bA(bC){var bD=false;

try{bC.appendChild(bz);
bD=bz.parentNode==bC;
}catch(e){return false;
}finally{try{bC.removeChild(bz);
}catch(e){}}return bD;
}function by(bE){return bz&&bE&&bE.nodeType===1&&bA(bE);
}return {wrapMethod:function bs(bF,bG,bH){if(!bF){throw new TypeError(U);
}
if(typeof bH!=r){throw new TypeError(w);
}var bK=bF[bG];
var bJ=typeof bK;

if(bJ!=r){throw new TypeError(k+bJ+T+bG+P);
}
if(bK.restore&&bK.restore.sinon){throw new TypeError(k+bG+R);
}
if(bK.calledBefore){var bI=!!bK.returns?B:A;
throw new TypeError(k+bG+J+bI);
}var bL=bF.hasOwnProperty(bG);
bF[bG]=bH;
bH.displayName=bG;
bH.restore=function(){if(bL){bF[bG]=bK;
}else{delete bF[bG];
}};
bH.restore.sinon=true;
return bH;
},extend:function bt(bM){for(var i=1,l=arguments.length;i<l;i+=1){for(var bN in arguments[i]){if(arguments[i].hasOwnProperty(bN)){bM[bN]=arguments[i][bN];
}if(arguments[i].hasOwnProperty(D)&&arguments[i].toString!=bM.toString){bM.toString=arguments[i].toString;
}}}return bM;
},create:function bu(bO){var F=function(){};
F.prototype=bO;
return new F();
},deepEqual:function bB(a,b){if(typeof a!=q||typeof b!=q){return a===b;
}
if(by(a)||by(b)){return a===b;
}
if(a===b){return true;
}
if(Object.prototype.toString.call(a)==bk){if(a.length!==b.length){return false;
}
for(var i=0,l=a.length;i<l;i+=1){if(!bB(a[i],b[i])){return false;
}}return true;
}var bR,bQ=0,bP=0;

for(bR in a){bQ+=1;

if(!bB(a[bR],b[bR])){return false;
}}
for(bR in b){bP+=1;
}
if(bQ!=bP){return false;
}return true;
},functionName:function bw(bS){var name=bS.displayName||bS.name;
if(!name){var bT=bS.toString().match(/function ([^\s\(]+)/);
name=bT&&bT[1];
}return name;
},functionToString:function bx(){if(this.getCall&&this.callCount){var bU,bV,i=this.callCount;

while(i--){bU=this.getCall(i).thisValue;

for(bV in bU){if(bU[bV]===this){return bV;
}}}}return this.displayName||bd;
},getConfig:function(bW){var bX={};
bW=bW||{};
var bY=br.defaultConfig;

for(var ca in bY){if(bY.hasOwnProperty(ca)){bX[ca]=bW.hasOwnProperty(ca)?bW[ca]:bY[ca];
}}return bX;
},format:function(cb){return m+cb;
},defaultConfig:{injectIntoThis:true,injectInto:null,properties:[f,bo,bj,bm,bl,d],useFakeTimers:true,useFakeServer:true},timesInWords:function bv(cc){return cc==1&&s||cc==2&&bc||cc==3&&N||(cc||0)+K;
},calledInOrder:function(cd){for(var i=1,l=cd.length;i<l;i++){if(!cd[i-1].calledBefore(cd[i])){return false;
}}return true;
},orderByFirstCall:function(ce){return ce.sort(function(a,b){return a.getCall(0).callId<b.getCall(0).callId?-1:1;
});
}};
}());

if(typeof module==q&&typeof require==r){module.exports=br;
module.exports.spy=require(H);
module.exports.stub=require(bb);
module.exports.mock=require(bg);
module.exports.collection=require(z);
module.exports.assert=require(j);
module.exports.sandbox=require(W);
module.exports.test=require(c);
module.exports.testCase=require(Y);
module.exports.assert=require(j);
}(function(cf){var cg=typeof module=="object"&&typeof require=="function";
var ch;
var ck=0;
var cj=[].push;

if(!cf&&cg){cf=require("../sinon");
}
if(!cf){return;
}function ci(cl,cm){if(!cm&&typeof cl=="function"){return ci.create(cl);
}
if(!cl||!cm){return ci.create(function(){});
}var cn=cl[cm];
return cf.wrapMethod(cl,cm,ci.create(cn));
}cf.extend(ci,(function(){var cq=Array.prototype.slice;
function cx(cy,cz,cA,cB,cC){cy[cz]=function(){if(!this.called){return !!cC;
}var cD;
var cE=0;

for(var i=0,l=this.callCount;i<l;i+=1){cD=this.getCall(i);

if(cD[cB||cz].apply(cD,arguments)){cE+=1;

if(cA){return true;
}}}return cE===this.callCount;
};
}function cw(cF,cG,cH){if(!cF){return;
}var cI=cG.length;

for(var i=0,l=cF.length;i<l;i++){if(cF[i].matches(cG,cH)){return cF[i];
}}}var cr=0;
var co={reset:function(){this.called=false;
this.calledOnce=false;
this.calledTwice=false;
this.calledThrice=false;
this.callCount=0;
this.args=[];
this.returnValues=[];
this.thisValues=[];
this.exceptions=[];
this.callIds=[];
},create:function ct(cJ){var name;

if(typeof cJ!="function"){cJ=function(){};
}else{name=cf.functionName(cJ);
}function cK(){return cK.invoke(cJ,this,cq.call(arguments));
}cf.extend(cK,ci);
delete cK.create;
cf.extend(cK,cJ);
cK.reset();
cK.prototype=cJ.prototype;
cK.displayName=name||"spy";
cK.toString=cf.functionToString;
cK._create=cf.spy.create;
cK.id="spy#"+cr++;
return cK;
},invoke:function cs(cL,cM,cN){var cP=cw(this.fakes,cN);
var cO,cQ;
this.called=true;
this.callCount+=1;
this.calledOnce=this.callCount==1;
this.calledTwice=this.callCount==2;
this.calledThrice=this.callCount==3;
cj.call(this.thisValues,cM);
cj.call(this.args,cN);
cj.call(this.callIds,ck++);

try{if(cP){cQ=cP.invoke(cL,cM,cN);
}else{cQ=(this.func||cL).apply(cM,cN);
}}catch(e){cj.call(this.returnValues,undefined);
cO=e;
throw e;
}finally{cj.call(this.exceptions,cO);
}cj.call(this.returnValues,cQ);
return cQ;
},getCall:function cv(i){if(i<0||i>=this.callCount){return null;
}return ch.create(this,this.thisValues[i],this.args[i],this.returnValues[i],this.exceptions[i],this.callIds[i]);
},calledBefore:function cp(cR){if(!this.called){return false;
}
if(!cR.called){return true;
}return this.callIds[0]<cR.callIds[0];
},calledAfter:function cu(cS){if(!this.called||!cS.called){return false;
}return this.callIds[this.callCount-1]>cS.callIds[cS.callCount-1];
},withArgs:function(){var cT=cq.call(arguments);

if(this.fakes){var cV=cw(this.fakes,cT,true);

if(cV){return cV;
}}else{this.fakes=[];
}var cU=this;
var cW=this._create();
cW.matchingAguments=cT;
cj.call(this.fakes,cW);
cW.withArgs=function(){return cU.withArgs.apply(cU,arguments);
};
return cW;
},matches:function(cX,cY){var da=this.matchingAguments;

if(da.length<=cX.length&&cf.deepEqual(da,cX.slice(0,da.length))){return !cY||da.length==cX.length;
}},printf:function(db){var dc=this;
var dd=[].slice.call(arguments,1);
var de;
return (db||"").replace(/%(.)/g,function(df,dg){de=co.formatters[dg];

if(typeof de=="function"){return de.call(null,dc,dd);
}else if(!isNaN(parseInt(dg),10)){return cf.format(dd[dg-1]);
}return "%"+dg;
});
}};
cx(co,"calledOn",true);
cx(co,"alwaysCalledOn",false,"calledOn");
cx(co,"calledWith",true);
cx(co,"alwaysCalledWith",false,"calledWith");
cx(co,"calledWithExactly",true);
cx(co,"alwaysCalledWithExactly",false,"calledWithExactly");
cx(co,"neverCalledWith",false,"notCalledWith",true);
cx(co,"threw",true);
cx(co,"alwaysThrew",false,"threw");
cx(co,"returned",true);
cx(co,"alwaysReturned",false,"returned");
cx(co,"calledWithNew",true);
cx(co,"alwaysCalledWithNew",false,"calledWithNew");
co.formatters={"c":function(dh){return cf.timesInWords(dh.callCount);
},"n":function(di){return di.toString();
},"C":function(dj){var dk=[];

for(var i=0,l=dj.callCount;i<l;++i){cj.call(dk,"    "+dj.getCall(i).toString());
}return dk.length>0?"\n"+dk.join("\n"):"";
},"t":function(dl){var dm=[];

for(var i=0,l=dl.callCount;i<l;++i){cj.call(dm,cf.format(dl.thisValues[i]));
}return dm.join(", ");
},"*":function(dn,dp){return dp.join(", ");
}};
return co;
}()));
ch=(function(){return {create:function ds(dy,dz,dA,dB,dC,dD){var dE=cf.create(ch);
delete dE.create;
dE.proxy=dy;
dE.thisValue=dz;
dE.args=dA;
dE.returnValue=dB;
dE.exception=dC;
dE.callId=typeof dD=="number"&&dD||ck++;
return dE;
},calledOn:function dw(dF){return this.thisValue===dF;
},calledWith:function dt(){for(var i=0,l=arguments.length;i<l;i+=1){if(!cf.deepEqual(arguments[i],this.args[i])){return false;
}}return true;
},calledWithExactly:function du(){return arguments.length==this.args.length&&this.calledWith.apply(this,arguments);
},notCalledWith:function dv(){for(var i=0,l=arguments.length;i<l;i+=1){if(!cf.deepEqual(arguments[i],this.args[i])){return true;
}}return false;
},returned:function dq(dG){return this.returnValue===dG;
},threw:function dx(dH){if(typeof dH=="undefined"||!this.exception){return !!this.exception;
}
if(typeof dH=="string"){return this.exception.name==dH;
}return this.exception===dH;
},calledWithNew:function dr(dI){return this.thisValue instanceof this.proxy;
},calledBefore:function(dJ){return this.callId<dJ.callId;
},calledAfter:function(dK){return this.callId>dK.callId;
},toString:function(){var dL=this.proxy.toString()+"(";
var dM=[];

for(var i=0,l=this.args.length;i<l;++i){cj.call(dM,cf.format(this.args[i]));
}dL=dL+dM.join(", ")+")";

if(typeof this.returnValue!="undefined"){dL+=" => "+cf.format(this.returnValue);
}
if(this.exception){dL+=" !"+this.exception.name;

if(this.exception.message){dL+="("+this.exception.message+")";
}}return dL;
}};
}());
ci.spyCall=ch;
cf.spyCall=ch;

if(cg){module.exports=ci;
}else{cf.spy=ci;
}}(typeof br=="object"&&br||null));
(function(dN){var dO=typeof module=="object"&&typeof require=="function";

if(!dN&&dO){dN=require("../sinon");
}
if(!dN){return;
}function dR(dV,dW,dX){if(!!dX&&typeof dX!="function"){throw new TypeError("Custom stub should be function");
}var dY;

if(dX){dY=dN.spy&&dN.spy.create?dN.spy.create(dX):dX;
}else{dY=dR.create();
}
if(!dV&&!dW){return dN.stub.create();
}
if(!dW&&!!dV&&typeof dV=="object"){for(var ea in dV){if(dV.hasOwnProperty(ea)&&typeof dV[ea]=="function"){dR(dV,ea);
}}return dV;
}return dN.wrapMethod(dV,dW,dY);
}function dS(eb,ec){if(eb.callArgAt<0){for(var i=0,l=ec.length;i<l;++i){if(!eb.callArgProp&&typeof ec[i]=="function"){return ec[i];
}
if(eb.callArgProp&&ec[i]&&typeof ec[i][eb.callArgProp]=="function"){return ec[i][eb.callArgProp];
}}return null;
}return ec[eb.callArgAt];
}var dP=Array.prototype.join;
function dT(ed,ee,ef){if(ed.callArgAt<0){var eg;

if(ed.callArgProp){eg=dN.functionName(ed)+" expected to yield to '"+ed.callArgProp+"', but no object with such a property was passed.";
}else{eg=dN.functionName(ed)+" expected to yield, but no callback was passed.";
}
if(ef.length>0){eg+=" Received ["+dP.call(ef,", ")+"]";
}return eg;
}return "argument at index "+ed.callArgAt+" is not a function: "+ee;
}function dQ(eh,ei){if(typeof eh.callArgAt=="number"){var ej=dS(eh,ei);

if(typeof ej!="function"){throw new TypeError(dT(eh,ej,ei));
}ej.apply(null,eh.callbackArguments);
}}var dU=0;
dN.extend(dR,(function(){var ek=Array.prototype.slice;
function ep(eq,er){if(typeof eq=="string"){this.exception=new Error(er||"");
this.exception.name=eq;
}else if(!eq){this.exception=new Error("Error");
}else{this.exception=eq;
}return this;
}return {create:function el(){var es=function(){if(es.exception){throw es.exception;
}dQ(es,arguments);
return es.returnValue;
};
es.id="stub#"+dU++;
var et=es;
es=dN.spy.create(es);
es.func=et;
dN.extend(es,dR);
es._create=dN.stub.create;
es.displayName="stub";
es.toString=dN.functionToString;
return es;
},returns:function eo(eu){this.returnValue=eu;
return this;
},"throws":ep,throwsException:ep,callsArg:function en(ev){if(typeof ev!="number"){throw new TypeError("argument index is not number");
}this.callArgAt=ev;
this.callbackArguments=[];
return this;
},callsArgWith:function em(ew){if(typeof ew!="number"){throw new TypeError("argument index is not number");
}this.callArgAt=ew;
this.callbackArguments=ek.call(arguments,1);
return this;
},yields:function(){this.callArgAt=-1;
this.callbackArguments=ek.call(arguments,0);
return this;
},yieldsTo:function(ex){this.callArgAt=-1;
this.callArgProp=ex;
this.callbackArguments=ek.call(arguments,1);
return this;
}};
}()));

if(dO){module.exports=dR;
}else{dN.stub=dR;
}}(typeof br=="object"&&br||null));
(function(ey){var ez=typeof module=="object"&&typeof require=="function";
var eA=[].push;

if(!ey&&ez){ey=require("../sinon");
}
if(!ey){return;
}function eB(eD){if(!eD){return ey.expectation.create("Anonymous mock");
}return eB.create(eD);
}ey.mock=eB;
ey.extend(eB,(function(){function eH(eK,eL){if(!eK){return;
}
for(var i=0,l=eK.length;i<l;i+=1){eL(eK[i]);
}}return {create:function eG(eM){if(!eM){throw new TypeError("object is null");
}var eN=ey.extend({},eB);
eN.object=eM;
delete eN.create;
return eN;
},expects:function eI(eO){if(!eO){throw new TypeError("method is falsy");
}
if(!this.expectations){this.expectations={};
this.proxies=[];
}
if(!this.expectations[eO]){this.expectations[eO]=[];
var eP=this;
ey.wrapMethod(this.object,eO,function(){return eP.invokeMethod(eO,this,arguments);
});
eA.call(this.proxies,eO);
}var eQ=ey.expectation.create(eO);
eA.call(this.expectations[eO],eQ);
return eQ;
},restore:function eE(){var eR=this.object;
eH(this.proxies,function(eS){if(typeof eR[eS].restore=="function"){eR[eS].restore();
}});
},verify:function eF(){var eV=this.expectations||{};
var eU=[],eT=[];
eH(this.proxies,function(eW){eH(eV[eW],function(eX){if(!eX.met()){eA.call(eU,eX.toString());
}else{eA.call(eT,eX.toString());
}});
});
this.restore();

if(eU.length>0){ey.expectation.fail(eU.concat(eT).join("\n"));
}return true;
},invokeMethod:function eJ(eY,fa,fb){var fd=this.expectations&&this.expectations[eY];
var length=fd&&fd.length||0;

for(var i=0;i<length;i+=1){if(!fd[i].met()&&fd[i].allowsCall(fa,fb)){return fd[i].apply(fa,fb);
}}var fc=[];

for(i=0;i<length;i+=1){eA.call(fc,"    "+fd[i].toString());
}fc.unshift("Unexpected call: "+ey.spyCall.toString.call({proxy:eY,args:fb}));
ey.expectation.fail(fc.join("\n"));
}};
}()));
var eC=ey.timesInWords;
ey.expectation=(function(){var fi=Array.prototype.slice;
var fg=ey.spy.invoke;
function ff(fB){if(fB==0){return "never called";
}else{return "called "+eC(fB);
}}function fx(fC){var fF=fC.minCalls;
var fD=fC.maxCalls;

if(typeof fF=="number"&&typeof fD=="number"){var fE=eC(fF);

if(fF!=fD){fE="at least "+fE+" and at most "+eC(fD);
}return fE;
}
if(typeof fF=="number"){return "at least "+eC(fF);
}return "at most "+eC(fD);
}function fh(fG){var fH=typeof fG.minCalls=="number";
return !fH||fG.callCount>=fG.minCalls;
}function fy(fI){if(typeof fI.maxCalls!="number"){return false;
}return fI.callCount==fI.maxCalls;
}return {minCalls:1,maxCalls:1,create:function fk(fJ){var fK=ey.extend(ey.stub.create(),ey.expectation);
delete fK.create;
fK.method=fJ;
return fK;
},invoke:function fs(fL,fM,fN){this.verifyCallAllowed(fM,fN);
return fg.apply(this,arguments);
},atLeast:function fv(fO){if(typeof fO!="number"){throw new TypeError("'"+fO+"' is not number");
}
if(!this.limitsSet){this.maxCalls=null;
this.limitsSet=true;
}this.minCalls=fO;
return this;
},atMost:function fo(fP){if(typeof fP!="number"){throw new TypeError("'"+fP+"' is not number");
}
if(!this.limitsSet){this.minCalls=null;
this.limitsSet=true;
}this.maxCalls=fP;
return this;
},never:function ft(){return this.exactly(0);
},once:function fA(){return this.exactly(1);
},twice:function fz(){return this.exactly(2);
},thrice:function fp(){return this.exactly(3);
},exactly:function fr(fQ){if(typeof fQ!="number"){throw new TypeError("'"+fQ+"' is not a number");
}this.atLeast(fQ);
return this.atMost(fQ);
},met:function fu(){return !this.failed&&fh(this);
},verifyCallAllowed:function fe(fR,fS){if(fy(this)){this.failed=true;
ey.expectation.fail(this.method+" already called "+eC(this.maxCalls));
}
if("expectedThis" in this&&this.expectedThis!==fR){ey.expectation.fail(this.method+" called with "+fR+" as thisValue, expected "+this.expectedThis);
}
if(!("expectedArguments" in this)){return;
}
if(!fS||fS.length===0){ey.expectation.fail(this.method+" received no arguments, expected "+this.expectedArguments.join());
}
if(fS.length<this.expectedArguments.length){ey.expectation.fail(this.method+" received too few arguments ("+fS.join()+"), expected "+this.expectedArguments.join());
}
if(this.expectsExactArgCount&&fS.length!=this.expectedArguments.length){ey.expectation.fail(this.method+" received too many arguments ("+fS.join()+"), expected "+this.expectedArguments.join());
}
for(var i=0,l=this.expectedArguments.length;i<l;i+=1){if(!ey.deepEqual(this.expectedArguments[i],fS[i])){ey.expectation.fail(this.method+" received wrong arguments ("+fS.join()+"), expected "+this.expectedArguments.join());
}}},allowsCall:function fl(fT,fU){if(this.met()){return false;
}
if("expectedThis" in this&&this.expectedThis!==fT){return false;
}
if(!("expectedArguments" in this)){return true;
}fU=fU||[];

if(fU.length<this.expectedArguments.length){return false;
}
if(this.expectsExactArgCount&&fU.length!=this.expectedArguments.length){return false;
}
for(var i=0,l=this.expectedArguments.length;i<l;i+=1){if(!ey.deepEqual(this.expectedArguments[i],fU[i])){return false;
}}return true;
},withArgs:function fm(){this.expectedArguments=fi.call(arguments);
return this;
},withExactArgs:function fq(){this.withArgs.apply(this,arguments);
this.expectsExactArgCount=true;
return this;
},on:function fw(fV){this.expectedThis=fV;
return this;
},toString:function(){var fX=(this.expectedArguments||[]).slice();

if(!this.expectsExactArgCount){eA.call(fX,"[...]");
}var fW=ey.spyCall.toString.call({proxy:this.method,args:fX});
var fY=fW.replace(", [...","[, ...")+" "+fx(this);

if(this.met()){return "Expectation met: "+fY;
}return "Expected "+fY+" ("+ff(this.callCount)+")";
},verify:function fj(){if(!this.met()){ey.expectation.fail(this.toString());
}return true;
},fail:function(ga){var gb=new Error(ga);
gb.name="ExpectationError";
throw gb;
}};
}());

if(ez){module.exports=eB;
}else{ey.mock=eB;
}}(typeof br=="object"&&br||null));
(function(gc){var gd=typeof module==q&&typeof require==r;
var gn=[].push;

if(!gc&&gd){gc=require(n);
}
if(!gc){return;
}function gl(gr){if(!gr.fakes){gr.fakes=[];
}return gr.fakes;
}function gm(gs,gt){var gu=gl(gs);

for(var i=0,l=gu.length;i<l;i+=1){if(typeof gu[i][gt]==r){gu[i][gt]();
}}}function ge(gv){var gw=gl(gv);
var i=0;

while(i<gw.length){gw.splice(i,1);
}}var gh={verify:function gf(){gm(this,S);
},restore:function gg(){gm(this,M);
ge(this);
},verifyAndRestore:function gk(){var gx;

try{this.verify();
}catch(e){gx=e;
}this.restore();

if(gx){throw gx;
}},add:function gj(gy){gn.call(gl(this),gy);
return gy;
},spy:function gi(){return this.add(gc.spy.apply(gc,arguments));
},stub:function go(gz,gA,gB){if(gA){var gC=gz[gA];

if(typeof gC!=r){if(!gz.hasOwnProperty(gA)){throw new TypeError(y+gA);
}gz[gA]=gB;
return this.add({restore:function(){gz[gA]=gC;
}});
}}return this.add(gc.stub.apply(gc,arguments));
},mock:function gp(){return this.add(gc.mock.apply(gc,arguments));
},inject:function gq(gD){var gE=this;
gD.spy=function(){return gE.spy.apply(gE,arguments);
};
gD.stub=function(){return gE.stub.apply(gE,arguments);
};
gD.mock=function(){return gE.mock.apply(gE,arguments);
};
return gD;
}};

if(gd){module.exports=gh;
}else{gc.collection=gh;
}}(typeof br==q&&br||null));
if(typeof br==p){var br={};
}br.clock=(function(){var gL=0;
function gJ(gM,gN){if(gM.length===0){throw new Error("Function requires at least 1 parameter");
}var gO=gL++;
var gP=gM[1]||0;

if(!this.timeouts){this.timeouts={};
}this.timeouts[gO]={id:gO,func:gM[0],callAt:this.now+gP};

if(gN===true){this.timeouts[gO].interval=gP;
}return gO;
}function gK(gQ){if(!gQ){return 0;
}var gS=gQ.split(":");
var l=gS.length,i=l;
var gT=0,gR;

if(l>3||!/^(\d\d:){0,2}\d\d?$/.test(gQ)){throw new Error("tick only understands numbers and 'h:m:s'");
}
while(i--){gR=parseInt(gS[i],10);

if(gR>=60){throw new Error("Invalid time "+gQ);
}gT+=gR*Math.pow(60,(l-i-1));
}return gT*1000;
}function gI(gU){var gV;

if(Object.create){gV=Object.create(gU);
}else{var F=function(){};
F.prototype=gU;
gV=new F();
}gV.Date.clock=gV;
return gV;
}return {now:0,create:function gH(gW){var gX=gI(this);

if(typeof gW=="number"){this.now=gW;
}return gX;
},setTimeout:function setTimeout(gY,ha){return gJ.call(this,arguments,false);
},clearTimeout:function clearTimeout(hb){if(!this.timeouts){this.timeouts=[];
}delete this.timeouts[hb];
},setInterval:function setInterval(hc,hd){return gJ.call(this,arguments,true);
},clearInterval:function clearInterval(he){this.clearTimeout(he);
},tick:function gG(hf){hf=typeof hf=="number"?hf:gK(hf);
var hj=this.now,hg=this.now+hf,hh=this.now;
var hi=this.firstTimerInRange(hj,hg);

while(hi&&hj<=hg){if(this.timeouts[hi.id]){hj=this.now=hi.callAt;
this.callTimer(hi);
}hi=this.firstTimerInRange(hh,hg);
hh=hj;
}this.now=hg;
},firstTimerInRange:function(hk,hl){var hp,hn,hm;

for(var ho in this.timeouts){if(this.timeouts.hasOwnProperty(ho)){if(this.timeouts[ho].callAt<hk||this.timeouts[ho].callAt>hl){continue;
}
if(!hn||this.timeouts[ho].callAt<hn){hm=this.timeouts[ho];
hn=this.timeouts[ho].callAt;
hp={func:this.timeouts[ho].func,callAt:this.timeouts[ho].callAt,interval:this.timeouts[ho].interval,id:this.timeouts[ho].id};
}}}return hp||null;
},callTimer:function(hq){try{if(typeof hq.func=="function"){hq.func.call(null);
}else{eval(hq.func);
}}catch(e){}
if(!this.timeouts[hq.id]){return;
}
if(typeof hq.interval=="number"){this.timeouts[hq.id].callAt+=hq.interval;
}else{delete this.timeouts[hq.id];
}},reset:function gF(){this.timeouts={};
},Date:(function(){var hv=Date;
function ht(hw,hx,hy,hz,hA,hB,hC){switch(arguments.length){case 0:return new hv(ht.clock.now);
case 1:return new hv(hw);
case 2:return new hv(hw,hx);
case 3:return new hv(hw,hx,hy);
case 4:return new hv(hw,hx,hy,hz);
case 5:return new hv(hw,hx,hy,hz,hA);
case 6:return new hv(hw,hx,hy,hz,hA,hB);
default:return new hv(hw,hx,hy,hz,hA,hB,hC);
}}
if(hv.now){ht.now=function hs(){return ht.clock.now;
};
}
if(hv.toSource){ht.toSource=function hu(){return hv.toSource();
};
}ht.toString=function hr(){return hv.toString();
};
ht.prototype=hv.prototype;
ht.parse=hv.parse;
ht.UTC=hv.UTC;
return ht;
}())};
}());
br.timers={setTimeout:setTimeout,clearTimeout:clearTimeout,setInterval:setInterval,clearInterval:clearInterval,Date:Date};
br.useFakeTimers=(function(hD){var hG=[X,O,ba,Q,be];
function hE(){var hI;

for(var i=0,l=this.methods.length;i<l;i++){hI=this.methods[i];
hD[hI]=this[bn+hI];
}}function hF(hJ,hK){hK[bn+hJ]=hD[hJ];
hD[hJ]=function(){return hK[hJ].apply(hK,arguments);
};

for(var hL in hK[hJ]){if(hK[hJ].hasOwnProperty(hL)){hD[hJ][hL]=hK[hJ][hL];
}}hD[hJ].clock=hK;
}return function hH(hM){var hN=br.clock.create(hM);
hN.restore=hE;
hN.methods=Array.prototype.slice.call(arguments,typeof hM==E?1:0);

if(hN.methods.length===0){hN.methods=hG;
}
for(var i=0,l=hN.methods.length;i<l;i++){hF(hN.methods[i],hN);
}return hN;
};
}(typeof global!=p?global:this));

if(typeof module==q&&typeof require==r){module.exports=br;
}if(typeof br==p){this.sinon={};
}(function(){var hO=[].push;
br.Event=function Event(hP,hQ,hR){this.initEvent(hP,hQ,hR);
};
br.Event.prototype={initEvent:function(hS,hT,hU){this.type=hS;
this.bubbles=hT;
this.cancelable=hU;
},stopPropagation:function(){},preventDefault:function(){this.defaultPrevented=true;
}};
br.EventTarget={addEventListener:function addEventListener(event,hV,hW){this.eventListeners=this.eventListeners||{};
this.eventListeners[event]=this.eventListeners[event]||[];
hO.call(this.eventListeners[event],hV);
},removeEventListener:function removeEventListener(event,hX,hY){var ia=this.eventListeners&&this.eventListeners[event]||[];

for(var i=0,l=ia.length;i<l;++i){if(ia[i]==hX){return ia.splice(i,1);
}}},dispatchEvent:function dispatchEvent(event){var ic=event.type;
var ib=this.eventListeners&&this.eventListeners[ic]||[];

for(var i=0;i<ib.length;i++){if(typeof ib[i]==r){ib[i].call(this,event);
}else{ib[i].handleEvent(event);
}}return !!event.defaultPrevented;
}};
}());
if(typeof br==p){this.sinon={};
}br.xhr={XMLHttpRequest:this.XMLHttpRequest};
br.FakeXMLHttpRequest=(function(){var ig={"Accept-Charset":true,"Accept-Encoding":true,"Connection":true,"Content-Length":true,"Cookie":true,"Cookie2":true,"Content-Transfer-Encoding":true,"Date":true,"Expect":true,"Host":true,"Keep-Alive":true,"Referer":true,"TE":true,"Trailer":true,"Transfer-Encoding":true,"Upgrade":true,"User-Agent":true,"Via":true};
function im(){this.readyState=im.UNSENT;
this.requestHeaders={};
this.requestBody=null;
this.status=0;
this.statusText="";

if(typeof im.onCreate=="function"){im.onCreate(this);
}}function ip(it){if(it.readyState!==im.OPENED){throw new Error("INVALID_STATE_ERR");
}
if(it.sendFlag){throw new Error("INVALID_STATE_ERR");
}}br.extend(im.prototype,br.EventTarget,{async:true,open:function open(iu,iv,iw,ix,iy){this.method=iu;
this.url=iv;
this.async=typeof iw=="boolean"?iw:true;
this.username=ix;
this.password=iy;
this.responseText=null;
this.responseXML=null;
this.requestHeaders={};
this.sendFlag=false;
this.readyStateChange(im.OPENED);
},readyStateChange:function io(iz){this.readyState=iz;

if(typeof this.onreadystatechange=="function"){this.onreadystatechange();
}this.dispatchEvent(new br.Event("readystatechange"));
},setRequestHeader:function ik(iA,iB){ip(this);

if(ig[iA]||/^(Sec-|Proxy-)/.test(iA)){throw new Error("Refused to set unsafe header \""+iA+"\"");
}
if(this.requestHeaders[iA]){this.requestHeaders[iA]+=","+iB;
}else{this.requestHeaders[iA]=iB;
}},setResponseHeaders:function ih(iC){this.responseHeaders={};

for(var iD in iC){if(iC.hasOwnProperty(iD)){this.responseHeaders[iD]=iC[iD];
}}
if(this.async){this.readyStateChange(im.HEADERS_RECEIVED);
}},send:function il(iE){ip(this);

if(!/^(get|head)$/i.test(this.method)){if(this.requestHeaders["Content-Type"]){var iF=this.requestHeaders["Content-Type"].split(";");
this.requestHeaders["Content-Type"]=iF[0]+";charset=utf-8";
}else{this.requestHeaders["Content-Type"]="text/plain;charset=utf-8";
}this.requestBody=iE;
}this.errorFlag=false;
this.sendFlag=this.async;
this.readyStateChange(im.OPENED);

if(typeof this.onSend=="function"){this.onSend(this);
}},abort:function ir(){this.aborted=true;
this.responseText=null;
this.errorFlag=true;
this.requestHeaders={};

if(this.readyState>br.FakeXMLHttpRequest.UNSENT&&this.sendFlag){this.readyStateChange(br.FakeXMLHttpRequest.DONE);
this.sendFlag=false;
}this.readyState=br.FakeXMLHttpRequest.UNSENT;
},getResponseHeader:function is(iG){if(this.readyState<im.HEADERS_RECEIVED){return null;
}
if(/^Set-Cookie2?$/i.test(iG)){return null;
}iG=iG.toLowerCase();

for(var h in this.responseHeaders){if(h.toLowerCase()==iG){return this.responseHeaders[h];
}}return null;
},getAllResponseHeaders:function ij(){if(this.readyState<im.HEADERS_RECEIVED){return "";
}var iH="";

for(var iI in this.responseHeaders){if(this.responseHeaders.hasOwnProperty(iI)&&!/^Set-Cookie2?$/i.test(iI)){iH+=iI+": "+this.responseHeaders[iI]+"\r\n";
}}return iH;
},setResponseBody:function iq(iJ){if(this.readyState==im.DONE){throw new Error("Request done");
}
if(this.async&&this.readyState!=im.HEADERS_RECEIVED){throw new Error("No headers received");
}var iM=this.chunkSize||10;
var iK=0;
this.responseText="";

do{if(this.async){this.readyStateChange(im.LOADING);
}this.responseText+=iJ.substring(iK,iK+iM);
iK+=iM;
}while(iK<iJ.length);
var iL=this.getResponseHeader("Content-Type");

if(this.responseText&&(!iL||/(text\/xml)|(application\/xml)|(\+xml)/.test(iL))){try{this.responseXML=im.parseXML(this.responseText);
}catch(e){}}
if(this.async){this.readyStateChange(im.DONE);
}else{this.readyState=im.DONE;
}},respond:function ie(status,iN,iO){this.setResponseHeaders(iN||{});
this.status=typeof status=="number"?status:200;
this.statusText=im.statusCodes[this.status];
this.setResponseBody(iO||"");
}});
br.extend(im,{UNSENT:0,OPENED:1,HEADERS_RECEIVED:2,LOADING:3,DONE:4});
im.parseXML=function ii(iP){var iR;

if(typeof DOMParser!="undefined"){var iQ=new DOMParser();
iR=iQ.parseFromString(iP,"text/xml");
}else{iR=new ActiveXObject("Microsoft.XMLDOM");
iR.async="false";
iR.loadXML(iP);
}return iR;
};
im.statusCodes={100:"Continue",101:"Switching Protocols",200:"OK",201:"Created",202:"Accepted",203:"Non-Authoritative Information",204:"No Content",205:"Reset Content",206:"Partial Content",300:"Multiple Choice",301:"Moved Permanently",302:"Found",303:"See Other",304:"Not Modified",305:"Use Proxy",307:"Temporary Redirect",400:"Bad Request",401:"Unauthorized",402:"Payment Required",403:"Forbidden",404:"Not Found",405:"Method Not Allowed",406:"Not Acceptable",407:"Proxy Authentication Required",408:"Request Timeout",409:"Conflict",410:"Gone",411:"Length Required",412:"Precondition Failed",413:"Request Entity Too Large",414:"Request-URI Too Long",415:"Unsupported Media Type",416:"Requested Range Not Satisfiable",417:"Expectation Failed",422:"Unprocessable Entity",500:"Internal Server Error",501:"Not Implemented",502:"Bad Gateway",503:"Service Unavailable",504:"Gateway Timeout",505:"HTTP Version Not Supported"};
return im;
}());
(function(iS){var iU=iS.XMLHttpRequest;
var iT=iS.ActiveXObject;
var iW=typeof ActiveXObject!=p;
var iV=typeof XMLHttpRequest!=p;
br.useFakeXMLHttpRequest=function(){br.FakeXMLHttpRequest.restore=function iX(iY){if(iV){iS.XMLHttpRequest=iU;
}
if(iW){iS.ActiveXObject=iT;
}delete br.FakeXMLHttpRequest.restore;

if(iY!==true){delete br.FakeXMLHttpRequest.onCreate;
}};

if(iV){iS.XMLHttpRequest=br.FakeXMLHttpRequest;
}
if(iW){iS.ActiveXObject=function ActiveXObject(ja){if(ja==L||/^Msxml2\.XMLHTTP/i.test(ja)){return new br.FakeXMLHttpRequest();
}return new iT(ja);
};
}return br.FakeXMLHttpRequest;
};
}(this));

if(typeof module==q&&typeof require==r){module.exports=br;
}if(typeof br==p){var br={};
}br.fakeServer=(function(){var jl=[].push;
function F(){}function jg(jp){F.prototype=jp;
return new F();
}function jf(jq){var jr=jq;

if(Object.prototype.toString.call(jq)!=bk){jr=[200,{},jq];
}
if(typeof jr[2]!=t){throw new TypeError(bh+typeof jr[2]);
}return jr;
}var jm=window.location;
var jd=new RegExp(bp+jm.protocol+bf+jm.host);
function ji(js,jt,ju){var jw=js.method;
var jy=!jw||jw.toLowerCase()==jt.toLowerCase();
var jv=js.url;
var jx=!jv||jv==ju||(typeof jv.test==r&&jv.test(ju));
return jy&&jx;
}function jo(jz,jA){var jB=this.getHTTPMethod(jA);
var jD=jA.url;

if(!/^https?:\/\//.test(jD)||jd.test(jD)){jD=jD.replace(jd,m);
}
if(ji(jz,this.getHTTPMethod(jA),jD)){if(typeof jz.response==r){var jC=[jA].concat(jD.match(jz.url).slice(1));
return jz.response.apply(jz,jC);
}return true;
}return false;
}return {create:function(){var jE=jg(this);
this.xhr=br.useFakeXMLHttpRequest();
jE.requests=[];
this.xhr.onCreate=function(jF){jE.addRequest(jF);
};
return jE;
},addRequest:function jk(jG){var jH=this;
jl.call(this.requests,jG);
jG.onSend=function(){jH.handleRequest(this);
};

if(this.autoRespond&&!this.responding){setTimeout(function(){jH.responding=false;
jH.respond();
},this.autoRespondAfter||10);
this.responding=true;
}},getHTTPMethod:function jn(jI){if(this.fakeHTTPMethods&&/post/i.test(jI.method)){var jJ=(jI.requestBody||m).match(/_method=([^\b;]+)/);
return !!jJ?jJ[1]:jI.method;
}return jI.method;
},handleRequest:function jj(jK){if(jK.async){if(!this.queue){this.queue=[];
}jl.call(this.queue,jK);
}else{this.processRequest(jK);
}},respondWith:function je(jL,jM,jN){if(arguments.length==1){this.response=jf(jL);
}else{if(!this.responses){this.responses=[];
}
if(arguments.length==2){jN=jM;
jM=jL;
jL=null;
}jl.call(this.responses,{method:jL,url:jM,response:typeof jN==r?jN:jf(jN)});
}},respond:function jb(){var jO=this.queue||[];
var jP;

while(jP=jO.shift()){this.processRequest(jP);
}},processRequest:function jh(jQ){try{if(jQ.aborted){return;
}var jR=this.response||[404,{},m];

if(this.responses){for(var i=0,l=this.responses.length;i<l;i++){if(jo.call(this,this.responses[i],jQ)){jR=this.responses[i].response;
break;
}}}
if(jQ.readyState!=4){jQ.respond(jR[0],jR[1],jR[2]);
}}catch(e){}},restore:function jc(){return this.xhr.restore&&this.xhr.restore.apply(this.xhr,arguments);
}};
}());

if(typeof module==q&&typeof require==r){module.exports=br;
}(function(){function jV(){}jV.prototype=br.fakeServer;
br.fakeServerWithClock=new jV();
br.fakeServerWithClock.addRequest=function jU(jW){if(jW.async){if(typeof setTimeout.clock==q){this.clock=setTimeout.clock;
}else{this.clock=br.useFakeTimers();
this.resetClock=true;
}
if(!this.longestTimeout){var jY=this.clock.setTimeout;
var jX=this.clock.setInterval;
var ka=this;
this.clock.setTimeout=function(kb,kc){ka.longestTimeout=Math.max(kc,ka.longestTimeout||0);
return jY.apply(this,arguments);
};
this.clock.setInterval=function(kd,ke){ka.longestTimeout=Math.max(ke,ka.longestTimeout||0);
return jX.apply(this,arguments);
};
}}return br.fakeServer.addRequest.call(this,jW);
};
br.fakeServerWithClock.respond=function jS(){var kf=br.fakeServer.respond.apply(this,arguments);

if(this.clock){this.clock.tick(this.longestTimeout||0);
this.longestTimeout=0;

if(this.resetClock){this.clock.restore();
this.resetClock=false;
}}return kf;
};
br.fakeServerWithClock.restore=function jT(){if(this.clock){this.clock.restore();
}return br.fakeServer.restore.apply(this,arguments);
};
}());
if(typeof module==q&&typeof require==r){var br=require(n);
br.extend(br,require(u));
}(function(){var kg=[].push;
function kj(kl,km,kn,ko){if(!ko){return;
}
if(km.injectInto){km.injectInto[kn]=ko;
}else{kg.call(kl.args,ko);
}}function kh(kp){var kq=br.create(br.sandbox);

if(kp.useFakeServer){if(typeof kp.useFakeServer==q){kq.serverPrototype=kp.useFakeServer;
}kq.useFakeServer();
}
if(kp.useFakeTimers){if(typeof kp.useFakeTimers==q){kq.useFakeTimers.apply(kq,kp.useFakeTimers);
}else{kq.useFakeTimers();
}}return kq;
}br.sandbox=br.extend(br.create(br.collection),{useFakeTimers:function kk(){this.clock=br.useFakeTimers.apply(br,arguments);
return this.add(this.clock);
},serverPrototype:br.fakeServer,useFakeServer:function ki(){var kr=this.serverPrototype||br.fakeServer;

if(!kr||!kr.create){return null;
}this.server=kr.create();
return this.add(this.server);
},inject:function(ks){br.collection.inject.call(this,ks);

if(this.clock){ks.clock=this.clock;
}
if(this.server){ks.server=this.server;
ks.requests=this.server.requests;
}return ks;
},create:function(kt){if(!kt){return br.create(br.sandbox);
}var kx=kh(kt);
kx.args=kx.args||[];
var kw,kv,ku=kx.inject({});

if(kt.properties){for(var i=0,l=kt.properties.length;i<l;i++){kw=kt.properties[i];
kv=ku[kw]||kw==g&&kx;
kj(kx,kt,kw,kv);
}}else{kj(kx,kt,g,kv);
}return kx;
}});
br.sandbox.useFakeXMLHttpRequest=br.sandbox.useFakeServer;

if(typeof module!=p){module.exports=br.sandbox;
}}());
(function(ky){var kz=typeof module==q&&typeof require==r;

if(!ky&&kz){ky=require(n);
}
if(!ky){return;
}function kA(kB){var kC=typeof kB;

if(kC!=r){throw new TypeError(I+kC);
}return function(){var kF=ky.getConfig(ky.config);
kF.injectInto=kF.injectIntoThis&&this||kF.injectInto;
var kD=ky.sandbox.create(kF);
var kG,kH;
var kE=Array.prototype.slice.call(arguments).concat(kD.args);

try{kH=kB.apply(this,kE);
}catch(e){kG=e;
}kD.verifyAndRestore();

if(kG){throw kG;
}return kH;
};
}kA.config={injectIntoThis:true,injectInto:null,properties:[f,bo,bj,bm,bl,d],useFakeTimers:true,useFakeServer:true};

if(kz){module.exports=kA;
}else{ky.test=kA;
}}(typeof br==q&&br||null));
(function(kI){var kJ=typeof module==q&&typeof require==r;

if(!kI&&kJ){kI=require(n);
}
if(!kI||!Object.prototype.hasOwnProperty){return;
}function kL(kM,kN,kO){return function(){if(kN){kN.apply(this,arguments);
}var kP,kQ;

try{kQ=kM.apply(this,arguments);
}catch(e){kP=e;
}
if(kO){kO.apply(this,arguments);
}
if(kP){throw kP;
}return kQ;
};
}function kK(kR,kS){if(!kR||typeof kR!=q){throw new TypeError(V);
}kS=kS||bi;
var kV=new RegExp(bp+kS);
var kT={},kX,kY,la;
var kW=kR.setUp;
var kU=kR.tearDown;

for(kX in kR){if(kR.hasOwnProperty(kX)){kY=kR[kX];

if(/^(setUp|tearDown)$/.test(kX)){continue;
}
if(typeof kY==r&&kV.test(kX)){la=kY;

if(kW||kU){la=kL(kY,kW,kU);
}kT[kX]=kI.test(la);
}else{kT[kX]=kR[kX];
}}}return kT;
}
if(kJ){module.exports=kK;
}else{kI.testCase=kK;
}}(typeof br==q&&br||null));
(function(lb){var lc=typeof module=="object"&&typeof require=="function";
var ld=Array.prototype.slice;
var lh;

if(!lb&&lc){lb=require("../sinon");
}
if(!lb){return;
}function lj(){var lo;

for(var i=0,l=arguments.length;i<l;++i){lo=arguments[i];

if(!lo){lh.fail("fake is not a spy");
}
if(typeof lo!="function"){lh.fail(lo+" is not a function");
}
if(typeof lo.getCall!="function"){lh.fail(lo+" is not stubbed");
}}}function le(lp,lq){var lr=lp.fail||lh.fail;
lr.call(lp,lq);
}function lk(name,ls,lt){if(arguments.length==2){lt=ls;
ls=name;
}lh[name]=function(lu){lj(lu);
var lw=ld.call(arguments,1);
var lv=false;

if(typeof ls=="function"){lv=!ls(lu);
}else{lv=typeof lu[ls]=="function"?!lu[ls].apply(lu,lw):!lu[ls];
}
if(lv){le(this,lu.printf.apply(lu,[lt].concat(lw)));
}else{lh.pass(name);
}};
}function lf(lx,ly){return !lx||/^fail/.test(ly)?ly:lx+ly.slice(0,1).toUpperCase()+ly.slice(1);
}lh={failException:"AssertError",fail:function ll(lz){var lA=new Error(lz);
lA.name=this.failException||lh.failException;
throw lA;
},pass:function lg(lB){},callOrder:function ln(){lj.apply(null,arguments);
var lC="",lD="";

if(!lb.calledInOrder(arguments)){try{lC=[].join.call(arguments,", ");
lD=lb.orderByFirstCall(ld.call(arguments)).join(", ");
}catch(e){}le(this,"expected "+lC+" to be "+"called in order but were called as "+lD);
}else{lh.pass("callOrder");
}},callCount:function li(lE,lF){lj(lE);

if(lE.callCount!=lF){var lG="expected %n to be called "+lb.timesInWords(lF)+" but was called %c%C";
le(this,lE.printf(lG));
}else{lh.pass("callCount");
}},expose:function lm(lH,lI){if(!lH){throw new TypeError("target is null or undefined");
}var o=lI||{};
var lJ=typeof o.prefix=="undefined"&&"assert"||o.prefix;
var lK=typeof o.includeFail=="undefined"||!!o.includeFail;

for(var lL in this){if(lL!="export"&&(lK||!/^(fail)/.test(lL))){lH[lf(lJ,lL)]=this[lL];
}}return lH;
}};
lk("called","expected %n to have been called at least once but was never called");
lk("notCalled",function(lM){return !lM.called;
},"expected %n to not have been called but was called %c%C");
lk("calledOnce","expected %n to be called once but was called %c%C");
lk("calledTwice","expected %n to be called twice but was called %c%C");
lk("calledThrice","expected %n to be called thrice but was called %c%C");
lk("calledOn","expected %n to be called with %1 as this but was called with %t");
lk("alwaysCalledOn","expected %n to always be called with %1 as this but was called with %t");
lk("calledWith","expected %n to be called with arguments %*%C");
lk("alwaysCalledWith","expected %n to always be called with arguments %*%C");
lk("calledWithExactly","expected %n to be called with exact arguments %*%C");
lk("alwaysCalledWithExactly","expected %n to always be called with exact arguments %*%C");
lk("neverCalledWith","expected %n to never be called with arguments %*%C");
lk("threw","%n did not throw exception%C");
lk("alwaysThrew","%n did not always throw exception%C");

if(lc){module.exports=lh;
}else{lb.assert=lh;
}}(typeof br=="object"&&br||null));
var bq=qx.dev.unit.Sinon;
bq.getSinon=function(){return br;
};
br.assert.fail=function(lN){this.fail(lN,true);
};
}).call(this);
})();
(function(){var k="engine.name",j="browser.name",h="use require([\"io.ssl\"]) instead.",g="selenium",f="use require([\"event.touch\"]) instead.",e="qx.dev.unit.MRequirements",d="http",c="gecko",b="use require([\"plugin.flash\"]) instead.",a="plugin.flash",x="io.ssl",w="chrome",v="firefox",u="event.touch",t="ie",s="has",r="opera",q="POST",p="mshtml",o="webkit",m="undefined",n="qx/test/xmlhttp/php_version.php";
qx.Mixin.define(e,{statics:{__wb:null},members:{require:function(y){for(var i=0,l=y.length;i<l;i++){var B=y[i];
var z=s+qx.lang.String.capitalize(B);

if(this[z]){if(this[z]()===true){continue;
}else{throw new qx.dev.unit.RequirementError(B);
}}
if(qx.core.Environment.getChecks()[B]){var A=qx.core.Environment.get(B);

if(A===true){continue;
}
if(A===false){throw new qx.dev.unit.RequirementError(B);
}else{throw new Error("The Environment key "+B+" cannot be used"+" as a Test Requirement since its value is not boolean!");
}}
if(qx.core.Environment.getAsyncChecks()[B]){throw new Error('Unable to verify requirement '+B+': '+'Asynchronous environment checks are not supported!');
}throw new Error('Unable to verify requirement: No method "'+z+'" or valid Environment key "'+B+'" found');
}},hasSsl:function(){qx.log.Logger.deprecatedMethodWarning(arguments.callee,h);
return this.require([x]);
},hasHttp:function(){return document.location.protocol.indexOf(d)==0;
},hasPhp:function(){if(qx.dev.unit.MRequirements.__wb!=null){return qx.dev.unit.MRequirements.__wb;
}var C=qx.util.ResourceManager.getInstance().toUri(n);
var D=new qx.bom.request.Xhr();
D.onload=qx.lang.Function.bind(function(){try{qx.lang.Json.parse(D.responseText);
qx.dev.unit.MRequirements.__wb=true;
}catch(E){qx.dev.unit.MRequirements.__wb=false;
}},this);
D.onerror=D.abort=qx.lang.Function.bind(function(){qx.dev.unit.MRequirements.__wb=false;
},this);
D.open(q,C,false);

try{D.send();
}catch(F){qx.dev.unit.MRequirements.__wb=false;
}return qx.dev.unit.MRequirements.__wb;
},hasGuiApp:function(){try{return qx.core.Init.getApplication() instanceof qx.application.Standalone;
}catch(G){return false;
}},hasInlineApp:function(){try{return qx.core.Init.getApplication() instanceof qx.application.Inline;
}catch(H){return false;
}},hasNativeApp:function(){try{return qx.core.Init.getApplication() instanceof qx.application.Native;
}catch(I){return false;
}},hasTouch:function(){qx.log.Logger.deprecatedMethodWarning(arguments.callee,f);
return this.require([u]);
},hasFlash:function(){qx.log.Logger.deprecatedMethodWarning(arguments.callee,b);
return this.require([a]);
},hasChrome:function(){return qx.core.Environment.get(j)===w;
},hasFirefox:function(){return qx.core.Environment.get(j)===v;
},hasGecko:function(){return qx.core.Environment.get(k)==c;
},hasIe:function(){return qx.core.Environment.get(j)===t;
},hasMshtml:function(){return qx.core.Environment.get(k)==p;
},hasOpera:function(){return qx.core.Environment.get(k)==r;
},hasWebkit:function(){return qx.core.Environment.get(k)==o;
},hasNoSelenium:function(){var J=window.top||window;
var opener=J.opener||J;

try{return typeof opener.selenium==m;
}catch(K){return J.name.indexOf(g)<0;
}}}});
})();
(function(){var s="undefined",r="function",q="<a></a>",p="xml.implementation",o="xml.attributens",n="xml.selectnodes",m="xml.getqualifieditem",l="SelectionLanguage",k="xml.getelementsbytagnamens",j="qx.bom.client.Xml",d="xml.domproperties",i="xml.selectsinglenode",g="1.0",c="xml.createnode",b="xml.domparser",f="getProperty",e="XML",h="string",a="xml.createelementns";
qx.Bootstrap.define(j,{statics:{getImplementation:function(){return document.implementation&&document.implementation.hasFeature&&document.implementation.hasFeature(e,g);
},getDomParser:function(){return typeof window.DOMParser!==s;
},getSelectSingleNode:function(){return typeof qx.xml.Document.create().selectSingleNode!==s;
},getSelectNodes:function(){return typeof qx.xml.Document.create().selectNodes!==s;
},getElementsByTagNameNS:function(){return typeof qx.xml.Document.create().getElementsByTagNameNS!==s;
},getDomProperties:function(){var t=qx.xml.Document.create();
return (f in t&&typeof t.getProperty(l)===h);
},getAttributeNS:function(){var u=qx.xml.Document.fromString(q).documentElement;
return typeof u.getAttributeNS===r&&typeof u.setAttributeNS===r;
},getCreateElementNS:function(){return typeof qx.xml.Document.create().createElementNS===r;
},getCreateNode:function(){return typeof qx.xml.Document.create().createNode!==s;
},getQualifiedItem:function(){var v=qx.xml.Document.fromString(q).documentElement;
return typeof v.attributes.getQualifiedItem!==s;
}},defer:function(w){qx.core.Environment.add(p,w.getImplementation);
qx.core.Environment.add(b,w.getDomParser);
qx.core.Environment.add(i,w.getSelectSingleNode);
qx.core.Environment.add(n,w.getSelectNodes);
qx.core.Environment.add(k,w.getElementsByTagNameNS);
qx.core.Environment.add(d,w.getDomProperties);
qx.core.Environment.add(o,w.getAttributeNS);
qx.core.Environment.add(a,w.getCreateElementNS);
qx.core.Environment.add(c,w.getCreateNode);
qx.core.Environment.add(m,w.getQualifiedItem);
}});
})();
(function(){var l="",k="pdf",h="wmv",g="divx",f="quicktime",e="mshtml",d="silverlight",c="Silverlight",b="plugin.silverlight.version",a="function",H="QuickTimeCheckObject.QuickTimeCheck.1",G="Adobe Acrobat",F="plugin.windowsmedia",E="QuickTime",D="plugin.silverlight",C="qx.bom.client.Plugin",B="plugin.divx",A="Chrome PDF Viewer",z="Windows Media",y="plugin.gears",s="plugin.quicktime",t="plugin.windowsmedia.version",q="DivX Web Player",r="AgControl.AgControl",o="plugin.pdf",p="plugin.pdf.version",m="plugin.divx.version",n="WMPlayer.OCX.7",u="AcroPDF.PDF",v="plugin.activex",x="plugin.quicktime.version",w="npdivx.DivXBrowserPlugin.1";
qx.Bootstrap.define(C,{statics:{getGears:function(){return !!(window.google&&window.google.gears);
},getActiveX:function(){return (typeof window.ActiveXObject===a);
},__kT:{quicktime:{plugin:[E],control:H},wmv:{plugin:[z],control:n},divx:{plugin:[q],control:w},silverlight:{plugin:[c],control:r},pdf:{plugin:[A,G],control:u}},getQuicktimeVersion:function(){var I=qx.bom.client.Plugin.__kT[f];
return qx.bom.client.Plugin.__kU(I.control,I.plugin);
},getWindowsMediaVersion:function(){var J=qx.bom.client.Plugin.__kT[h];
return qx.bom.client.Plugin.__kU(J.control,J.plugin);
},getDivXVersion:function(){var K=qx.bom.client.Plugin.__kT[g];
return qx.bom.client.Plugin.__kU(K.control,K.plugin);
},getSilverlightVersion:function(){var L=qx.bom.client.Plugin.__kT[d];
return qx.bom.client.Plugin.__kU(L.control,L.plugin);
},getPdfVersion:function(){var M=qx.bom.client.Plugin.__kT[k];
return qx.bom.client.Plugin.__kU(M.control,M.plugin);
},getQuicktime:function(){var N=qx.bom.client.Plugin.__kT[f];
return qx.bom.client.Plugin.__kV(N.control,N.plugin);
},getWindowsMedia:function(){var O=qx.bom.client.Plugin.__kT[h];
return qx.bom.client.Plugin.__kV(O.control,O.plugin);
},getDivX:function(){var P=qx.bom.client.Plugin.__kT[g];
return qx.bom.client.Plugin.__kV(P.control,P.plugin);
},getSilverlight:function(){var Q=qx.bom.client.Plugin.__kT[d];
return qx.bom.client.Plugin.__kV(Q.control,Q.plugin);
},getPdf:function(){var R=qx.bom.client.Plugin.__kT[k];
return qx.bom.client.Plugin.__kV(R.control,R.plugin);
},__kU:function(S,T){var U=qx.bom.client.Plugin.__kV(S,T);
if(!U){return l;
}if(qx.bom.client.Engine.getName()==e){var V=new ActiveXObject(S);

try{var Y=V.versionInfo;

if(Y!=undefined){return Y;
}Y=V.version;

if(Y!=undefined){return Y;
}Y=V.settings.version;

if(Y!=undefined){return Y;
}}catch(bb){return l;
}return l;
}else{var ba=navigator.plugins;
var X=/([0-9]\.[0-9])/g;

for(var i=0;i<ba.length;i++){var W=ba[i];

for(var j=0;j<T.length;j++){if(W.name.indexOf(T[j])!==-1){if(X.test(W.name)||X.test(W.description)){return RegExp.$1;
}}}}return l;
}},__kV:function(bc,bd){if(qx.bom.client.Engine.getName()==e){var be=window.ActiveXObject;

if(!be){return false;
}
try{new ActiveXObject(bc);
}catch(bg){return false;
}return true;
}else{var bf=navigator.plugins;

if(!bf){return false;
}var name;

for(var i=0;i<bf.length;i++){name=bf[i].name;

for(var j=0;j<bd.length;j++){if(name.indexOf(bd[j])!==-1){return true;
}}}return false;
}}},defer:function(bh){qx.core.Environment.add(y,bh.getGears);
qx.core.Environment.add(s,bh.getQuicktime);
qx.core.Environment.add(x,bh.getQuicktimeVersion);
qx.core.Environment.add(F,bh.getWindowsMedia);
qx.core.Environment.add(t,bh.getWindowsMediaVersion);
qx.core.Environment.add(B,bh.getDivX);
qx.core.Environment.add(m,bh.getDivXVersion);
qx.core.Environment.add(D,bh.getSilverlight);
qx.core.Environment.add(b,bh.getSilverlightVersion);
qx.core.Environment.add(o,bh.getPdf);
qx.core.Environment.add(p,bh.getPdfVersion);
qx.core.Environment.add(v,bh.getActiveX);
}});
})();
(function(){var s="plugin.activex",r="MSXML2.DOMDocument.3.0",q="",p='<\?xml version="1.0" encoding="utf-8"?>\n<',o="qx.xml.Document",n=" />",m="xml.domparser",k="SelectionLanguage",j="'",h="MSXML2.XMLHTTP.3.0",c="MSXML2.XMLHTTP.6.0",g="xml.implementation",f=" xmlns='",b="text/xml",a="XPath",e="MSXML2.DOMDocument.6.0",d="HTML";
qx.Class.define(o,{statics:{DOMDOC:null,XMLHTTP:null,isXmlDocument:function(t){if(t.nodeType===9){return t.documentElement.nodeName!==d;
}else if(t.ownerDocument){return this.isXmlDocument(t.ownerDocument);
}else{return false;
}},create:function(u,v){if(qx.core.Environment.get(s)){var w=new ActiveXObject(this.DOMDOC);
if(this.DOMDOC==r){w.setProperty(k,a);
}
if(v){var x=p;
x+=v;

if(u){x+=f+u+j;
}x+=n;
w.loadXML(x);
}return w;
}
if(qx.core.Environment.get(g)){return document.implementation.createDocument(u||q,v||q,null);
}throw new Error("No XML implementation available!");
},fromString:function(y){if(qx.core.Environment.get(s)){var A=qx.xml.Document.create();
A.loadXML(y);
return A;
}
if(qx.core.Environment.get(m)){var z=new DOMParser();
return z.parseFromString(y,b);
}throw new Error("No XML implementation available!");
}},defer:function(B){if(qx.core.Environment.get(s)){var C=[e,r];
var D=[c,h];

for(var i=0,l=C.length;i<l;i++){try{new ActiveXObject(C[i]);
new ActiveXObject(D[i]);
}catch(E){continue;
}B.DOMDOC=C[i];
B.XMLHTTP=D[i];
break;
}}}});
})();
(function(){var l="mshtml",k="event.pointer",j="onhashchange",i="event.help",h="event.touch",g="opera",f="event.hashchange",e="onhelp",d="pointerEvents",c="documentMode",a="qx.bom.client.Event",b="ontouchstart";
qx.Bootstrap.define(a,{statics:{getTouch:function(){return (b in window);
},getPointer:function(){if(d in document.documentElement.style){var m=qx.bom.client.Engine.getName();
return m!=g&&m!=l;
}return false;
},getHelp:function(){return (e in document);
},getHashChange:function(){var n=qx.bom.client.Engine.getName();
var o=j in window;
return (n!==l&&o)||(n===l&&c in document&&document.documentMode>=8&&o);
}},defer:function(p){qx.core.Environment.add(h,p.getTouch);
qx.core.Environment.add(k,p.getPointer);
qx.core.Environment.add(i,p.getHelp);
qx.core.Environment.add(f,p.getHashChange);
}});
})();
(function(){var n="xhr",m="Microsoft.XMLHTTP",l="io.ssl",k="io.xhr",j="",i="file:",h="https:",g="webkit",f="gecko",e="activex",b="opera",d=".",c="io.maxrequests",a="qx.bom.client.Transport";
qx.Bootstrap.define(a,{statics:{getMaxConcurrentRequestCount:function(){var o;
var r=qx.bom.client.Engine.getVersion().split(d);
var p=0;
var s=0;
var q=0;
if(r[0]){p=r[0];
}if(r[1]){s=r[1];
}if(r[2]){q=r[2];
}if(window.maxConnectionsPerServer){o=window.maxConnectionsPerServer;
}else if(qx.bom.client.Engine.getName()==b){o=8;
}else if(qx.bom.client.Engine.getName()==g){o=4;
}else if(qx.bom.client.Engine.getName()==f&&((p>1)||((p==1)&&(s>9))||((p==1)&&(s==9)&&(q>=1)))){o=6;
}else{o=2;
}return o;
},getSsl:function(){return window.location.protocol===h;
},getXmlHttpRequest:function(){var t=window.ActiveXObject?(function(){if(window.location.protocol!==i){try{new window.XMLHttpRequest();
return n;
}catch(u){}}
try{new window.ActiveXObject(m);
return e;
}catch(v){}})():(function(){try{new window.XMLHttpRequest();
return n;
}catch(w){}})();
return t||j;
}},defer:function(x){qx.core.Environment.add(c,x.getMaxConcurrentRequestCount);
qx.core.Environment.add(l,x.getSsl);
qx.core.Environment.add(k,x.getXmlHttpRequest);
}});
})();
(function(){var k="div",j="-moz-none",h="string",g="backgroundImage",f="inline-block",e="-moz-inline-box",d="span",c="color",b="css.float",a="css.inlineblock",bb="css.usermodify",ba="boxSizing",Y="placeholder",X="content",W="css.appearance",V="css.gradient.radial",U="borderImage",T="userSelect",S="css.overflowxy",R="styleFloat",r="css.userselect",s="css.boxsizing",p="css.boxmodel",q="qx.bom.client.Css",n="appearance",o='m11',l="input",m="css.boxshadow",v="css.gradient.legacywebkit",w="css.borderradius",E="linear-gradient(0deg, #fff, #000)",C="css.opacity",J="css.borderimage",G="rgba(1, 2, 3, 0.5)",N="radial-gradient(0px 0px, cover, red 50%, blue 100%)",L="rgba",y="css.gradients",Q="borderRadius",P="css.gradient.linear",O='WebKitCSSMatrix',x="-webkit-gradient(linear,0% 0%,100% 100%,from(white), to(red))",A="mshtml",B="css.rgba",D="none",F="css.placeholder",H="css.userselect.none",K="css.textoverflow",M="textOverflow",t="userModify",u="boxShadow",z="cssFloat",I="border";
qx.Bootstrap.define(q,{statics:{__bJ:null,getBoxModel:function(){var content=qx.bom.client.Engine.getName()!==A||!qx.bom.client.Browser.getQuirksMode();
return content?X:I;
},getTextOverflow:function(){return qx.bom.Style.getPropertyName(M);
},getPlaceholder:function(){var i=document.createElement(l);
return Y in i;
},getAppearance:function(){return qx.bom.Style.getPropertyName(n);
},getBorderRadius:function(){return qx.bom.Style.getPropertyName(Q);
},getBoxShadow:function(){return qx.bom.Style.getPropertyName(u);
},getBorderImage:function(){return qx.bom.Style.getPropertyName(U);
},getUserSelect:function(){return qx.bom.Style.getPropertyName(T);
},getUserSelectNone:function(){var bd=qx.bom.client.Css.getUserSelect();

if(bd){var bc=document.createElement(d);
bc.style[bd]=j;
return bc.style[bd]===j?j:D;
}return null;
},getUserModify:function(){return qx.bom.Style.getPropertyName(t);
},getFloat:function(){var be=document.documentElement.style;
return be.cssFloat!==undefined?z:be.styleFloat!==undefined?R:null;
},getTranslate3d:function(){return O in window&&o in new WebKitCSSMatrix();
},getGradients:function(){return !!(qx.bom.client.Css.getLinearGradient());
},getLinearGradient:function(){qx.bom.client.Css.__bJ=false;
var bi=E;
var bf=document.createElement(k);
var bg=qx.bom.Style.getAppliedStyle(bf,g,bi);

if(!bg){bi=x;
var bg=qx.bom.Style.getAppliedStyle(bf,g,bi,false);

if(bg){qx.bom.client.Css.__bJ=true;
}}if(!bg){return null;
}var bh=/(.*?)\(/.exec(bg);
return bh?bh[1]:null;
},getRadialGradient:function(){var bm=N;
var bj=document.createElement(k);
var bk=qx.bom.Style.getAppliedStyle(bj,g,bm);

if(!bk){return null;
}var bl=/(.*?)\(/.exec(bk);
return bl?bl[1]:null;
},getLegacyWebkitGradient:function(){if(qx.bom.client.Css.__bJ===null){qx.bom.client.Css.getLinearGradient();
}return qx.bom.client.Css.__bJ;
},getRgba:function(){var bn;

try{bn=document.createElement(k);
}catch(bo){bn=document.createElement();
}try{bn.style[c]=G;

if(bn.style[c].indexOf(L)!=-1){return true;
}}catch(bp){}return false;
},getBoxSizing:function(){return qx.bom.Style.getPropertyName(ba);
},getInlineBlock:function(){var bq=document.createElement(d);
bq.style.display=f;

if(bq.style.display==f){return f;
}bq.style.display=e;

if(bq.style.display!==e){return e;
}return null;
},getOpacity:function(){return (typeof document.documentElement.style.opacity==h);
},getOverflowXY:function(){return (typeof document.documentElement.style.overflowX==h)&&(typeof document.documentElement.style.overflowY==h);
}},defer:function(br){qx.core.Environment.add(K,br.getTextOverflow);
qx.core.Environment.add(F,br.getPlaceholder);
qx.core.Environment.add(w,br.getBorderRadius);
qx.core.Environment.add(m,br.getBoxShadow);
qx.core.Environment.add(y,br.getGradients);
qx.core.Environment.add(P,br.getLinearGradient);
qx.core.Environment.add(V,br.getRadialGradient);
qx.core.Environment.add(v,br.getLegacyWebkitGradient);
qx.core.Environment.add(p,br.getBoxModel);
qx.core.Environment.add(B,br.getRgba);
qx.core.Environment.add(J,br.getBorderImage);
qx.core.Environment.add(bb,br.getUserModify);
qx.core.Environment.add(r,br.getUserSelect);
qx.core.Environment.add(H,br.getUserSelectNone);
qx.core.Environment.add(W,br.getAppearance);
qx.core.Environment.add(b,br.getFloat);
qx.core.Environment.add(s,br.getBoxSizing);
qx.core.Environment.add(a,br.getInlineBlock);
qx.core.Environment.add(C,br.getOpacity);
qx.core.Environment.add(S,br.getOverflowXY);
}});
})();
(function(){var d="-",c="qx.bom.Style",b="string",a="";
qx.Bootstrap.define(c,{statics:{VENDOR_PREFIXES:["Webkit","Moz","O","ms","Khtml"],getPropertyName:function(e){var f=document.documentElement.style;

for(var i=0,l=this.VENDOR_PREFIXES.length;i<l;i++){var g=this.VENDOR_PREFIXES[i]+qx.lang.String.firstUp(e);

if(f[g]!==undefined){return g;
}}if(f[e]!==undefined){return e;
}return null;
},getAppliedStyle:function(h,j,k,m){var n=(m!==false)?[null].concat(this.VENDOR_PREFIXES):[null];

for(var i=0,l=n.length;i<l;i++){var o=n[i]?d+n[i].toLowerCase()+d+k:k;
try{h.style[j]=o;

if(typeof h.style[j]==b&&h.style[j]!==a){return o;
}}catch(p){}}return null;
}}});
})();
(function(){var o="css.animation",n="animationend",m="",l="MSAnimationEnd",k="-keyframes",j="animation",h="oAnimationEnd",g="@",f="@keyframes",d="webkitAnimationEnd",a="qx.bom.client.CssAnimation",c=" name",b="AnimationPlayState";
qx.Bootstrap.define(a,{statics:{getSupport:function(){var name=qx.bom.client.CssAnimation.getName();

if(name!=null){return {"name":name,"play-state":qx.bom.client.CssAnimation.getPlayState(),"end-event":qx.bom.client.CssAnimation.getAnimationEnd(),"keyframes":qx.bom.client.CssAnimation.getKeyFrames()};
}return null;
},getPlayState:function(){return qx.bom.Style.getPropertyName(b);
},getName:function(){return qx.bom.Style.getPropertyName(j);
},getAnimationEnd:function(){var p={"MsAnimation":l,"WebkitAnimation":d,"MozAnimation":n,"OAnimation":h};
return p[this.getName()];
},getKeyFrames:function(){var q=qx.bom.Style.VENDOR_PREFIXES;
var s=[];

for(var i=0;i<q.length;i++){s.push(g+qx.lang.String.hyphenate(q[i])+k);
}s.unshift(f);
var r=qx.bom.Stylesheet.createElement();

for(var i=0;i<s.length;i++){try{qx.bom.Stylesheet.addRule(r,s[i]+c,m);
return s[i];
}catch(e){}}return null;
}},defer:function(t){qx.core.Environment.add(o,t.getSupport);
}});
})();
(function(){var k=".",j="$1",h="",g="object",f="Shockwave Flash",e="undefined",d="qx.bom.client.Flash",c="ShockwaveFlash.ShockwaveFlash.7",b="plugin.flash.express",a="plugin.flash.version",w="plugin.flash",v="osx",u="10.0.12",t="win",s="ShockwaveFlash.ShockwaveFlash.6",r="$version",q="plugin.flash.strictsecurity",p="6.0.65",o="always",n="9.0.151",l="ShockwaveFlash.ShockwaveFlash",m=",";
qx.Bootstrap.define(d,{statics:{isAvailable:function(){return parseFloat(qx.bom.client.Flash.getVersion())>0;
},getVersion:function(){if(navigator.plugins&&typeof navigator.plugins[f]===g){var z=[0,0,0];
var B=navigator.plugins[f].description;

if(typeof B!=e){B=B.replace(/^.*\s+(\S+\s+\S+$)/,j);
z[0]=parseInt(B.replace(/^(.*)\..*$/,j),10);
z[1]=parseInt(B.replace(/^.*\.(.*)\s.*$/,j),10);
z[2]=/r/.test(B)?parseInt(B.replace(/^.*r(.*)$/,j),10):0;
}return z.join(k);
}else if(window.ActiveXObject){var z=[0,0,0];
var y=false;

try{var A=new ActiveXObject(c);
}catch(C){try{var A=new ActiveXObject(s);
z=[6,0,21];
A.AllowScriptAccess=o;
}catch(D){if(z[0]==6){y=true;
}}
if(!y){try{A=new ActiveXObject(l);
}catch(E){}}}
if(!y&&typeof A==g){var x=A.GetVariable(r);

if(typeof x!=e){x=x.split(" ")[1].split(m);
z[0]=parseInt(x[0],10);
z[1]=parseInt(x[1],10);
z[2]=parseInt(x[2],10);
}}return z.join(k);
}else{return h;
}},getExpressInstall:function(){var G=qx.bom.client.Flash.getVersion();

if(G==h){return false;
}var F=qx.bom.client.OperatingSystem.getName();
return (F==t||F==v)&&qx.bom.client.Flash.__wc(p,G);
},getStrictSecurityModel:function(){var H=qx.bom.client.Flash.getVersion();

if(H==h){return false;
}var I=H.split(k);

if(I[0]<10){return qx.bom.client.Flash.__wc(n,H);
}else{return qx.bom.client.Flash.__wc(u,H);
}},_cachedSupportsVersion:{},__wc:function(J,K){var N=J.split(k);
var M=K||qx.bom.client.Flash.getVersion();
M=M.split(k);

for(var i=0;i<N.length;i++){var L=parseInt(M[i],10)-parseInt(N[i],10);

if(L>0){return true;
}else if(L<0){return false;
}}return true;
}},defer:function(O){qx.core.Environment.add(w,O.isAvailable);
qx.core.Environment.add(a,O.getVersion);
qx.core.Environment.add(b,O.getExpressInstall);
qx.core.Environment.add(q,O.getStrictSecurityModel);
}});
})();
(function(){var f="-",e="",d="qx.bom.client.Locale",c="locale",b="android",a="locale.variant";
qx.Bootstrap.define(d,{statics:{getLocale:function(){var g=qx.bom.client.Locale.__lS();
var h=g.indexOf(f);

if(h!=-1){g=g.substr(0,h);
}return g;
},getVariant:function(){var i=qx.bom.client.Locale.__lS();
var k=e;
var j=i.indexOf(f);

if(j!=-1){k=i.substr(j+1);
}return k;
},__lS:function(){var l=(navigator.userLanguage||navigator.language||e);
if(qx.bom.client.OperatingSystem.getName()==b){var m=/(\w{2})-(\w{2})/i.exec(navigator.userAgent);

if(m){l=m[0];
}}return l.toLowerCase();
}},defer:function(n){qx.core.Environment.add(c,n.getLocale);
qx.core.Environment.add(a,n.getVariant);
}});
})();
(function(){var f="undefined",e="",d="runtime.name",c="node.js",b="rhino",a="qx.bom.client.Runtime";
qx.Bootstrap.define(a,{statics:{getName:function(){var name=e;
if(typeof environment!==f){name=b;
}else if(typeof process!==f){name=c;
}else{name=qx.bom.client.Browser.getName();
}return name;
}},defer:function(g){qx.core.Environment.add(d,g.getName);
}});
})();
(function(){var e="notification",d="PhoneGap",c="qx.bom.client.PhoneGap",b="phonegap",a="phonegap.notification";
qx.Bootstrap.define(c,{statics:{getPhoneGap:function(){return d in window;
},getNotification:function(){return e in navigator;
}},defer:function(f){qx.core.Environment.add(b,f.getPhoneGap);
qx.core.Environment.add(a,f.getNotification);
}});
})();
(function(){var n="perspectiveProperty",m="css.transform.3d",l="BackfaceVisibility",k="TransformStyle",j="WebkitPerspective",h='div',g="TransformOrigin",f="qx.bom.client.CssTransform",e="Transform",d="MozPerspective",a="Perspective",c="css.transform",b="PerspectiveOrigin";
qx.Bootstrap.define(f,{statics:{getSupport:function(){var name=qx.bom.client.CssTransform.getName();

if(name!=null){return {"name":name,"style":qx.bom.client.CssTransform.getStyle(),"origin":qx.bom.client.CssTransform.getOrigin(),"3d":qx.bom.client.CssTransform.get3D(),"perspective":qx.bom.client.CssTransform.getPerspective(),"perspective-origin":qx.bom.client.CssTransform.getPerspectiveOrigin(),"backface-visibility":qx.bom.client.CssTransform.getBackFaceVisibility()};
}return null;
},getStyle:function(){return qx.bom.Style.getPropertyName(k);
},getPerspective:function(){return qx.bom.Style.getPropertyName(a);
},getPerspectiveOrigin:function(){return qx.bom.Style.getPropertyName(b);
},getBackFaceVisibility:function(){return qx.bom.Style.getPropertyName(l);
},getOrigin:function(){return qx.bom.Style.getPropertyName(g);
},getName:function(){return qx.bom.Style.getPropertyName(e);
},get3D:function(){var o=document.createElement(h);
var q=false;
var p=[n,j,d];

for(var i=p.length-1;i>=0;i--){q=q?q:o.style[p[i]]!=undefined;
}return q;
}},defer:function(r){qx.core.Environment.add(c,r.getSupport);
qx.core.Environment.add(m,r.get3D);
}});
})();
(function(){var d="qx.nativeScrollBars",c="os.scrollBarOverlayed",b="osx",a="qx.bom.client.Scroll";
qx.Bootstrap.define(a,{statics:{scrollBarOverlayed:function(){var e=qx.bom.element.Overflow.getScrollbarWidth();
var f=qx.bom.client.OperatingSystem.getName()===b;
var g=qx.core.Environment.get(d);
return e==0&&f&&g;
}},defer:function(h){qx.core.Environment.add(c,h.scrollBarOverlayed);
}});
})();
(function(){var k="css.overflowxy",j="hidden",i="-moz-scrollbars-none",h="",g="engine.name",f="gecko",e="overflow",d="overflowY",b="engine.version",a="none",B="scroll",A="borderLeftStyle",z="borderRightStyle",y="div",x="borderRightWidth",w="overflow-y",v="borderLeftWidth",u="-moz-scrollbars-vertical",r=":",q="100px",o="overflow:",p="qx.bom.element.Overflow",m="overflow-x",n="overflowX",l=";";
qx.Bootstrap.define(p,{statics:{DEFAULT_SCROLLBAR_WIDTH:14,__dv:null,getScrollbarWidth:function(){if(this.__dv!==null){return this.__dv;
}var C=qx.bom.element.Style;
var E=function(I,J){return parseInt(C.get(I,J),10)||0;
};
var F=function(K){return (C.get(K,z)==a?0:E(K,x));
};
var D=function(L){return (C.get(L,A)==a?0:E(L,v));
};
var H=qx.core.Environment.select(g,{"mshtml":function(M){if(C.get(M,d)==j||M.clientWidth==0){return F(M);
}return Math.max(0,M.offsetWidth-M.clientLeft-M.clientWidth);
},"default":function(N){if(N.clientWidth==0){var O=C.get(N,e);
var P=(O==B||O==u?16:0);
return Math.max(0,F(N)+P);
}return Math.max(0,(N.offsetWidth-N.clientWidth-D(N)));
}});
var G=function(Q){return H(Q)-F(Q);
};
var t=document.createElement(y);
var s=t.style;
s.height=s.width=q;
s.overflow=B;
document.body.appendChild(t);
var c=G(t);
this.__dv=c;
document.body.removeChild(t);
return this.__dv;
},_compile:function(R,S){if(!qx.core.Environment.get(k)){R=o;

if(qx.core.Environment.get(g)===f&&S==j){S=i;
}}return R+r+S+l;
},compileX:function(T){return this._compile(m,T);
},compileY:function(U){return this._compile(w,U);
},getX:function(V,W){if(qx.core.Environment.get(k)){return qx.bom.element.Style.get(V,n,W,false);
}var X=qx.bom.element.Style.get(V,e,W,false);

if(X===i){X=j;
}return X;
},setX:function(Y,ba){if(qx.core.Environment.get(k)){Y.style.overflowX=ba;
}else{if(ba===j&&qx.core.Environment.get(g)===f&&parseFloat(qx.core.Environment.get(b))<1.8){ba=i;
}Y.style.overflow=ba;
}},resetX:function(bb){if(qx.core.Environment.get(k)){bb.style.overflowX=h;
}else{bb.style.overflow=h;
}},getY:function(bc,bd){if(qx.core.Environment.get(k)){return qx.bom.element.Style.get(bc,d,bd,false);
}var be=qx.bom.element.Style.get(bc,e,bd,false);

if(be===i){be=j;
}return be;
},setY:function(bf,bg){if(qx.core.Environment.get(k)){bf.style.overflowY=bg;
}else{if(bg===j&&qx.core.Environment.get(g)===f&&parseFloat(qx.core.Environment.get(b))<1.8){bg=i;
}bf.style.overflow=bg;
}},resetY:function(bh){if(qx.core.Environment.get(k)){bh.style.overflowY=h;
}else{bh.style.overflow=h;
}}}});
})();
(function(){var o="auto",n="px",m=",",l="clip:auto;",k="rect(",j=");",i="",h=")",g="qx.bom.element.Clip",f="string",c="clip:rect(",e=" ",d="clip",b="rect(auto,auto,auto,auto)",a="rect(auto, auto, auto, auto)";
qx.Bootstrap.define(g,{statics:{compile:function(p){if(!p){return l;
}var u=p.left;
var top=p.top;
var t=p.width;
var s=p.height;
var q,r;

if(u==null){q=(t==null?o:t+n);
u=o;
}else{q=(t==null?o:u+t+n);
u=u+n;
}
if(top==null){r=(s==null?o:s+n);
top=o;
}else{r=(s==null?o:top+s+n);
top=top+n;
}return c+top+m+q+m+r+m+u+j;
},get:function(v,w){var y=qx.bom.element.Style.get(v,d,w,false);
var E,top,C,B;
var x,z;

if(typeof y===f&&y!==o&&y!==i){y=qx.lang.String.trim(y);
if(/\((.*)\)/.test(y)){var D=RegExp.$1;
if(/,/.test(D)){var A=D.split(m);
}else{var A=D.split(e);
}top=qx.lang.String.trim(A[0]);
x=qx.lang.String.trim(A[1]);
z=qx.lang.String.trim(A[2]);
E=qx.lang.String.trim(A[3]);
if(E===o){E=null;
}
if(top===o){top=null;
}
if(x===o){x=null;
}
if(z===o){z=null;
}if(top!=null){top=parseInt(top,10);
}
if(x!=null){x=parseInt(x,10);
}
if(z!=null){z=parseInt(z,10);
}
if(E!=null){E=parseInt(E,10);
}if(x!=null&&E!=null){C=x-E;
}else if(x!=null){C=x;
}
if(z!=null&&top!=null){B=z-top;
}else if(z!=null){B=z;
}}else{throw new Error("Could not parse clip string: "+y);
}}return {left:E||null,top:top||null,width:C||null,height:B||null};
},set:function(F,G){if(!G){F.style.clip=b;
return;
}var L=G.left;
var top=G.top;
var K=G.width;
var J=G.height;
var H,I;

if(L==null){H=(K==null?o:K+n);
L=o;
}else{H=(K==null?o:L+K+n);
L=L+n;
}
if(top==null){I=(J==null?o:J+n);
top=o;
}else{I=(J==null?o:top+J+n);
top=top+n;
}F.style.clip=k+top+m+H+m+I+m+L+h;
},reset:function(M){M.style.clip=a;
}}});
})();
(function(){var h="css.boxsizing",g="",f="border-box",e="qx.bom.element.BoxSizing",d="boxSizing",c="content-box",b=":",a=";";
qx.Bootstrap.define(e,{statics:{__iA:{tags:{button:true,select:true},types:{search:true,button:true,submit:true,reset:true,checkbox:true,radio:true}},__iB:function(i){var j=this.__iA;
return j.tags[i.tagName.toLowerCase()]||j.types[i.type];
},compile:function(k){if(qx.core.Environment.get(h)){var l=qx.lang.String.hyphenate(qx.core.Environment.get(h));
return l+b+k+a;
}else{}},get:function(m){if(qx.core.Environment.get(h)){return qx.bom.element.Style.get(m,d,null,false)||g;
}
if(qx.bom.Document.isStandardMode(qx.dom.Node.getWindow(m))){if(!this.__iB(m)){return c;
}}return f;
},set:function(n,o){if(qx.core.Environment.get(h)){try{n.style[qx.core.Environment.get(h)]=o;
}catch(p){}}else{}},reset:function(q){this.set(q,g);
}}});
})();
(function(){var k="n-resize",j="e-resize",i="nw-resize",h="ne-resize",g="engine.name",f="",e="cursor:",d=";",c="qx.bom.element.Cursor",b="cursor",a="hand";
qx.Bootstrap.define(c,{statics:{__hn:qx.core.Environment.select(g,{"mshtml":{"cursor":a,"ew-resize":j,"ns-resize":k,"nesw-resize":h,"nwse-resize":i},"opera":{"col-resize":j,"row-resize":k,"ew-resize":j,"ns-resize":k,"nesw-resize":h,"nwse-resize":i},"default":{}}),compile:function(l){return e+(this.__hn[l]||l)+d;
},get:function(m,n){return qx.bom.element.Style.get(m,b,n,false);
},set:function(o,p){o.style.cursor=this.__hn[p]||p;
},reset:function(q){q.style.cursor=f;
}}});
})();
(function(){var l="",k="engine.name",j=";",i="opacity:",h="opacity",g="filter",f="MozOpacity",e=");",d=")",c="zoom:1;filter:alpha(opacity=",a="qx.bom.element.Opacity",b="alpha(opacity=";
qx.Bootstrap.define(a,{statics:{SUPPORT_CSS3_OPACITY:false,compile:qx.core.Environment.select(k,{"mshtml":function(m){if(m>=1){m=1;
}
if(m<0.00001){m=0;
}
if(qx.bom.element.Opacity.SUPPORT_CSS3_OPACITY){return i+m+j;
}else{return c+(m*100)+e;
}},"gecko":function(n){if(n>=1){n=0.999999;
}return i+n+j;
},"default":function(o){if(o>=1){return l;
}return i+o+j;
}}),set:qx.core.Environment.select(k,{"mshtml":function(p,q){if(qx.bom.element.Opacity.SUPPORT_CSS3_OPACITY){if(q>=1){q=l;
}p.style.opacity=q;
}else{var r=qx.bom.element.Style.get(p,g,qx.bom.element.Style.COMPUTED_MODE,false);

if(q>=1){q=1;
}
if(q<0.00001){q=0;
}if(!p.currentStyle||!p.currentStyle.hasLayout){p.style.zoom=1;
}p.style.filter=r.replace(/alpha\([^\)]*\)/gi,l)+b+q*100+d;
}},"gecko":function(s,t){if(t>=1){t=0.999999;
}
if(!qx.bom.element.Opacity.SUPPORT_CSS3_OPACITY){s.style.MozOpacity=t;
}else{s.style.opacity=t;
}},"default":function(u,v){if(v>=1){v=l;
}u.style.opacity=v;
}}),reset:qx.core.Environment.select(k,{"mshtml":function(w){if(qx.bom.element.Opacity.SUPPORT_CSS3_OPACITY){w.style.opacity=l;
}else{var x=qx.bom.element.Style.get(w,g,qx.bom.element.Style.COMPUTED_MODE,false);
w.style.filter=x.replace(/alpha\([^\)]*\)/gi,l);
}},"gecko":function(y){if(!qx.bom.element.Opacity.SUPPORT_CSS3_OPACITY){y.style.MozOpacity=l;
}else{y.style.opacity=l;
}},"default":function(z){z.style.opacity=l;
}}),get:qx.core.Environment.select(k,{"mshtml":function(A,B){if(qx.bom.element.Opacity.SUPPORT_CSS3_OPACITY){var C=qx.bom.element.Style.get(A,h,B,false);

if(C!=null){return parseFloat(C);
}return 1.0;
}else{var D=qx.bom.element.Style.get(A,g,B,false);

if(D){var C=D.match(/alpha\(opacity=(.*)\)/);

if(C&&C[1]){return parseFloat(C[1])/100;
}}return 1.0;
}},"gecko":function(E,F){var G=qx.bom.element.Style.get(E,!qx.bom.element.Opacity.SUPPORT_CSS3_OPACITY?f:h,F,false);

if(G==0.999999){G=1.0;
}
if(G!=null){return parseFloat(G);
}return 1.0;
},"default":function(H,I){var J=qx.bom.element.Style.get(H,h,I,false);

if(J!=null){return parseFloat(J);
}return 1.0;
}})},defer:function(K){K.SUPPORT_CSS3_OPACITY=qx.core.Environment.get("css.opacity");
}});
})();
(function(){var j="",i="engine.name",h="float",g="browser.documentmode",f="mshtml",e="style",d="css.float",c="px",b="css.appearance",a="pixelRight",w="css.userselect",v="css.boxsizing",u="css.textoverflow",t="pixelHeight",s=":",r="pixelTop",q="css.borderimage",p="pixelLeft",o="css.usermodify",n="qx.bom.element.Style",l="pixelBottom",m="pixelWidth",k=";";
qx.Bootstrap.define(n,{statics:{__gH:function(){var y={"appearance":qx.core.Environment.get(b),"userSelect":qx.core.Environment.get(w),"textOverflow":qx.core.Environment.get(u),"borderImage":qx.core.Environment.get(q),"float":qx.core.Environment.get(d),"userModify":qx.core.Environment.get(o),"boxSizing":qx.core.Environment.get(v)};
this.__gI={};

for(var x in qx.lang.Object.clone(y)){if(!y[x]){delete y[x];
}else{this.__gI[x]=x==h?h:qx.lang.String.hyphenate(y[x]);
}}this.__gJ=y;
},__gL:{width:m,height:t,left:p,right:a,top:r,bottom:l},__gM:{clip:qx.bom.element.Clip,cursor:qx.bom.element.Cursor,opacity:qx.bom.element.Opacity,boxSizing:qx.bom.element.BoxSizing,overflowX:{set:qx.lang.Function.bind(qx.bom.element.Overflow.setX,qx.bom.element.Overflow),get:qx.lang.Function.bind(qx.bom.element.Overflow.getX,qx.bom.element.Overflow),reset:qx.lang.Function.bind(qx.bom.element.Overflow.resetX,qx.bom.element.Overflow),compile:qx.lang.Function.bind(qx.bom.element.Overflow.compileX,qx.bom.element.Overflow)},overflowY:{set:qx.lang.Function.bind(qx.bom.element.Overflow.setY,qx.bom.element.Overflow),get:qx.lang.Function.bind(qx.bom.element.Overflow.getY,qx.bom.element.Overflow),reset:qx.lang.Function.bind(qx.bom.element.Overflow.resetY,qx.bom.element.Overflow),compile:qx.lang.Function.bind(qx.bom.element.Overflow.compileY,qx.bom.element.Overflow)}},compile:function(z){var B=[];
var D=this.__gM;
var C=this.__gI;
var name,A;

for(name in z){A=z[name];

if(A==null){continue;
}name=C[name]||name;
if(D[name]){B.push(D[name].compile(A));
}else{B.push(qx.lang.String.hyphenate(name),s,A,k);
}}return B.join(j);
},setCss:function(E,F){if(qx.core.Environment.get(i)===f&&parseInt(qx.core.Environment.get(g),10)<8){E.style.cssText=F;
}else{E.setAttribute(e,F);
}},getCss:function(G){if(qx.core.Environment.get(i)===f&&parseInt(qx.core.Environment.get(g),10)<8){return G.style.cssText.toLowerCase();
}else{return G.getAttribute(e);
}},isPropertySupported:function(H){return (this.__gM[H]||this.__gJ[H]||H in document.documentElement.style);
},COMPUTED_MODE:1,CASCADED_MODE:2,LOCAL_MODE:3,set:function(I,name,J,K){name=this.__gJ[name]||name;
if(K!==false&&this.__gM[name]){return this.__gM[name].set(I,J);
}else{I.style[name]=J!==null?J:j;
}},setStyles:function(L,M,N){var Q=this.__gJ;
var S=this.__gM;
var O=L.style;

for(var R in M){var P=M[R];
var name=Q[R]||R;

if(P===undefined){if(N!==false&&S[name]){S[name].reset(L);
}else{O[name]=j;
}}else{if(N!==false&&S[name]){S[name].set(L,P);
}else{O[name]=P!==null?P:j;
}}}},reset:function(T,name,U){name=this.__gJ[name]||name;
if(U!==false&&this.__gM[name]){return this.__gM[name].reset(T);
}else{T.style[name]=j;
}},get:qx.core.Environment.select(i,{"mshtml":function(V,name,W,X){name=this.__gJ[name]||name;
if(X!==false&&this.__gM[name]){return this.__gM[name].get(V,W);
}if(!V.currentStyle){return V.style[name]||j;
}switch(W){case this.LOCAL_MODE:return V.style[name]||j;
case this.CASCADED_MODE:return V.currentStyle[name]||j;
default:var bc=V.currentStyle[name]||j;
if(/^-?[\.\d]+(px)?$/i.test(bc)){return bc;
}var bb=this.__gL[name];

if(bb){var Y=V.style[name];
V.style[name]=bc||0;
var ba=V.style[bb]+c;
V.style[name]=Y;
return ba;
}if(/^-?[\.\d]+(em|pt|%)?$/i.test(bc)){throw new Error("Untranslated computed property value: "+name+". Only pixel values work well across different clients.");
}return bc;
}},"default":function(bd,name,be,bf){name=this.__gJ[name]||name;
if(bf!==false&&this.__gM[name]){return this.__gM[name].get(bd,be);
}switch(be){case this.LOCAL_MODE:return bd.style[name]||j;
case this.CASCADED_MODE:if(bd.currentStyle){return bd.currentStyle[name]||j;
}throw new Error("Cascaded styles are not supported in this browser!");
default:var bg=qx.dom.Node.getDocument(bd);
var bh=bg.defaultView.getComputedStyle(bd,null);
return bh?bh[name]:j;
}}})},defer:function(bi){bi.__gH();
}});
})();
(function(){var g="CSS1Compat",f="engine.name",e="position:absolute;width:0;height:0;width:1",d="engine.version",c="qx.bom.Document",b="1px",a="div";
qx.Bootstrap.define(c,{statics:{isQuirksMode:qx.core.Environment.select(f,{"mshtml":function(h){if(qx.core.Environment.get(d)>=8){return (h||window).document.documentMode===5;
}else{return (h||window).document.compatMode!==g;
}},"webkit":function(i){if(document.compatMode===undefined){var j=(i||window).document.createElement(a);
j.style.cssText=e;
return j.style.width===b?true:false;
}else{return (i||window).document.compatMode!==g;
}},"default":function(k){return (k||window).document.compatMode!==g;
}}),isStandardMode:function(l){return !this.isQuirksMode(l);
},getWidth:function(m){var n=(m||window).document;
var o=qx.bom.Viewport.getWidth(m);
var scroll=this.isStandardMode(m)?n.documentElement.scrollWidth:n.body.scrollWidth;
return Math.max(scroll,o);
},getHeight:function(p){var q=(p||window).document;
var r=qx.bom.Viewport.getHeight(p);
var scroll=this.isStandardMode(p)?q.documentElement.scrollHeight:q.body.scrollHeight;
return Math.max(scroll,r);
}}});
})();
(function(){var c="engine.version",b="engine.name",a="qx.bom.Viewport";
qx.Bootstrap.define(a,{statics:{getWidth:qx.core.Environment.select(b,{"opera":function(d){if(parseFloat(qx.core.Environment.get(c))<9.5){return (d||window).document.body.clientWidth;
}else{var e=(d||window).document;
return qx.bom.Document.isStandardMode(d)?e.documentElement.clientWidth:e.body.clientWidth;
}},"webkit":function(f){if(parseFloat(qx.core.Environment.get(c))<523.15){return (f||window).innerWidth;
}else{var g=(f||window).document;
return qx.bom.Document.isStandardMode(f)?g.documentElement.clientWidth:g.body.clientWidth;
}},"default":function(h){var i=(h||window).document;
return qx.bom.Document.isStandardMode(h)?i.documentElement.clientWidth:i.body.clientWidth;
}}),getHeight:qx.core.Environment.select(b,{"opera":function(j){if(parseFloat(qx.core.Environment.get(c))<9.5){return (j||window).document.body.clientHeight;
}else{var k=(j||window).document;
return qx.bom.Document.isStandardMode(j)?k.documentElement.clientHeight:k.body.clientHeight;
}},"webkit":function(l){if(parseFloat(qx.core.Environment.get(c))<523.15){return (l||window).innerHeight;
}else{var m=(l||window).document;
return qx.bom.Document.isStandardMode(l)?m.documentElement.clientHeight:m.body.clientHeight;
}},"default":function(n){var o=(n||window).document;
return qx.bom.Document.isStandardMode(n)?o.documentElement.clientHeight:o.body.clientHeight;
}}),getScrollLeft:function(p){var q=(p||window).document;
return (p||window).pageXOffset||q.documentElement.scrollLeft||q.body.scrollLeft;
},getScrollTop:function(r){var s=(r||window).document;
return (r||window).pageYOffset||s.documentElement.scrollTop||s.body.scrollTop;
},__eF:function(){var t=this.getWidth()>this.getHeight()?90:0;
var u=window.orientation;

if(u==null||Math.abs(u%180)==t){return {"-270":90,"-180":180,"-90":-90,"0":0,"90":90,"180":180,"270":-90};
}else{return {"-270":180,"-180":-90,"-90":0,"0":90,"90":180,"180":-90,"270":0};
}},__eG:null,getOrientation:function(v){var w=(v||window).orientation;

if(w==null){w=this.getWidth(v)>this.getHeight(v)?90:0;
}else{w=this.__eG[w];
}return w;
},isLandscape:function(x){return Math.abs(this.getOrientation(x))==90;
},isPortrait:function(y){return Math.abs(this.getOrientation(y))!==90;
}},defer:function(z){z.__eG=z.__eF();
}});
})();
(function(){var n="ipod",m="g",l="xbox",k="pc",j="\.",i="(",h=")",g="iPhone",f="|",e="qx.bom.client.Device",b="wii",d="ipad",c="device.name",a="ds";
qx.Bootstrap.define(e,{statics:{__du:{"iPod":n,"iPad":d,"iPhone":g,"PSP":"psp","PLAYSTATION 3":"ps3","Nintendo Wii":b,"Nintendo DS":a,"XBOX":"xbox","Xbox":l},getName:function(){var q=[];

for(var p in this.__du){q.push(p);
}var r=new RegExp(i+q.join(f).replace(/\./g,j)+h,m);
var o=r.exec(navigator.userAgent);

if(o&&o[1]){return qx.bom.client.Device.__du[o[1]];
}return k;
}},defer:function(s){qx.core.Environment.add(c,s.getName);
}});
})();
(function(){var b="singleton",a="qx.util.LibraryManager";
qx.Class.define(a,{extend:qx.core.Object,type:b,statics:{__cv:qx.$$libraries||{}},members:{has:function(c){return !!this.self(arguments).__cv[c];
},get:function(d,e){return this.self(arguments).__cv[d][e]?this.self(arguments).__cv[d][e]:null;
},set:function(f,g,h){this.self(arguments).__cv[f][g]=h;
}}});
})();
(function(){var q="",p="/",o="resourceUri",n="mshtml",m="engine.name",l="io.ssl",k="string",j="//",i="encoding",h="?",c="data",g="type",f="data:image/",b=";",a="qx.util.ResourceManager",e="singleton",d=",";
qx.Class.define(a,{extend:qx.core.Object,type:e,construct:function(){qx.core.Object.call(this);
},statics:{__hv:qx.$$resources||{},__iy:{}},members:{has:function(r){return !!this.self(arguments).__hv[r];
},getData:function(s){return this.self(arguments).__hv[s]||null;
},getImageWidth:function(t){var u=this.self(arguments).__hv[t];
return u?u[0]:null;
},getImageHeight:function(v){var w=this.self(arguments).__hv[v];
return w?w[1]:null;
},getImageFormat:function(x){var y=this.self(arguments).__hv[x];
return y?y[2]:null;
},getCombinedFormat:function(z){var C=q;
var B=this.self(arguments).__hv[z];
var A=B&&B.length>4&&typeof (B[4])==k&&this.constructor.__hv[B[4]];

if(A){var E=B[4];
var D=this.constructor.__hv[E];
C=D[2];
}return C;
},toUri:function(F){if(F==null){return F;
}var G=this.self(arguments).__hv[F];

if(!G){return F;
}
if(typeof G===k){var I=G;
}else{var I=G[3];
if(!I){return F;
}}var H=q;

if((qx.core.Environment.get(m)==n)&&qx.core.Environment.get(l)){H=this.self(arguments).__iy[I];
}return H+qx.util.LibraryManager.getInstance().get(I,o)+p+F;
},toDataUri:function(J){var L=this.constructor.__hv[J];
var M=this.constructor.__hv[L[4]];
var N;

if(M){var K=M[4][J];
N=f+K[g]+b+K[i]+d+K[c];
}else{N=this.toUri(J);
}return N;
}},defer:function(O){if((qx.core.Environment.get(m)==n)){if(qx.core.Environment.get(l)){for(var S in qx.$$libraries){var Q;

if(qx.util.LibraryManager.getInstance().get(S,o)){Q=qx.util.LibraryManager.getInstance().get(S,o);
}else{O.__iy[S]=q;
continue;
}if(Q.match(/^\/\//)!=null){O.__iy[S]=window.location.protocol;
}else if(Q.match(/^\//)!=null){O.__iy[S]=window.location.protocol+j+window.location.host;
}else if(Q.match(/^\.\//)!=null){var P=document.URL;
O.__iy[S]=P.substring(0,P.lastIndexOf(p)+1);
}else if(Q.match(/^http/)!=null){O.__iy[S]=q;
}else{var T=window.location.href.indexOf(h);
var R;

if(T==-1){R=window.location.href;
}else{R=window.location.href.substring(0,T);
}O.__iy[S]=R.substring(0,R.lastIndexOf(p)+1);
}}}}}});
})();
(function(){var k="engine.name",j="qx.debug.io",i="",h="undefined",g="mshtml",f="opera",d="gecko",c="file:",b="engine.version",a="onunload",w="activex",v="If-None-Match",u="xhr",t="If-Modified-Since",s="If-Match",r="Microsoft.XMLHTTP",q="browser.version",p="qx.bom.request.Xhr",o="Microsoft.XMLDOM",n="If-Range",l="Content-Type",m="io.xhr";
qx.Bootstrap.define(p,{construct:function(){this.__qy=qx.Bootstrap.bind(this.__qJ,this);
this.__qz=qx.Bootstrap.bind(this.__qI,this);
this.__lW=qx.Bootstrap.bind(this.__qM,this);
this.__qH();
if(window.attachEvent){this.__qA=qx.Bootstrap.bind(this.__qP,this);
window.attachEvent(a,this.__qA);
}},statics:{UNSENT:0,OPENED:1,HEADERS_RECEIVED:2,LOADING:3,DONE:4},members:{readyState:0,responseText:i,responseXML:null,status:0,statusText:i,timeout:0,open:function(x,y,z,A,B){this.__qR();
if(typeof x===h||typeof y===h){throw new Error("Not enough arguments");
}this.__ma=false;
this.__qB=false;
this.__qC=false;
this.__mb=y;

if(typeof z==h){z=true;
}this.__qD=z;
if(!this.__qQ()&&this.readyState>qx.bom.request.Xhr.UNSENT){this.dispose();
this.__qH();
}this.__qF.onreadystatechange=this.__qy;

try{if(qx.core.Environment.get(j)){qx.Bootstrap.debug(qx.bom.request.Xhr,"Open native request with method: "+x+", url: "+y+", async: "+z);
}this.__qF.open(x,y,z,A,B);
}catch(C){if(!qx.util.Request.isCrossDomain(y)){throw C;
}
if(!this.__qD){this.__qE=C;
}
if(this.__qD){if(window.XDomainRequest){this.readyState=4;
this.__qF=new XDomainRequest();
this.__qF.onerror=qx.Bootstrap.bind(function(){this.onreadystatechange();
this.onerror();
this.onloadend();
},this);

if(qx.core.Environment.get(j)){qx.Bootstrap.debug(qx.bom.request.Xhr,"Retry open native request with method: "+x+", url: "+y+", async: "+z);
}this.__qF.open(x,y,z,A,B);
return;
}window.setTimeout(qx.Bootstrap.bind(function(){if(this.__mc){return;
}this.readyState=4;
this.onreadystatechange();
this.onerror();
this.onloadend();
},this));
}}if(qx.core.Environment.get(k)===d&&parseInt(qx.core.Environment.get(b),10)<2&&!this.__qD){this.readyState=qx.bom.request.Xhr.OPENED;
this.onreadystatechange();
}},setRequestHeader:function(D,E){this.__qR();
if(D==s||D==t||D==v||D==n){this.__qC=true;
}this.__qF.setRequestHeader(D,E);
},send:function(F){this.__qR();
if(!this.__qD&&this.__qE){throw this.__qE;
}if(qx.core.Environment.get(k)===f&&this.timeout===0){this.timeout=10000;
}if(this.timeout>0){this.__qG=window.setTimeout(this.__lW,this.timeout);
}F=typeof F==h?null:F;
try{if(qx.core.Environment.get(j)){qx.Bootstrap.debug(qx.bom.request.Xhr,"Send native request");
}this.__qF.send(F);
}catch(H){if(!this.__qD){throw H;
}if(this._getProtocol()===c){this.readyState=2;
this.__mf();
var G=this;
window.setTimeout(function(){if(G.__mc){return;
}G.readyState=3;
G.__mf();
G.readyState=4;
G.__mf();
});
}}if(qx.core.Environment.get(k)===d&&!this.__qD){this.__qJ();
}this.__qB=true;
},abort:function(){this.__qR();
this.__ma=true;
this.__qF.abort();

if(this.__qF){this.readyState=this.__qF.readyState;
}},onreadystatechange:function(){},onload:function(){},onloadend:function(){},onerror:function(){},onabort:function(){},ontimeout:function(){},getResponseHeader:function(I){this.__qR();
return this.__qF.getResponseHeader(I);
},getAllResponseHeaders:function(){this.__qR();
return this.__qF.getAllResponseHeaders();
},getRequest:function(){return this.__qF;
},dispose:function(){if(this.__mc){return false;
}window.clearTimeout(this.__qG);
if(window.detachEvent){window.detachEvent(a,this.__qA);
}try{this.__qF.onreadystatechange;
}catch(K){return;
}var J=function(){};
this.__qF.onreadystatechange=J;
this.__qF.onload=J;
this.__qF.onerror=J;
this.abort();
this.__qF=null;
this.__mc=true;
return true;
},_createNativeXhr:function(){var L=qx.core.Environment.get(m);

if(L===u){return new XMLHttpRequest();
}
if(L==w){return new window.ActiveXObject(r);
}qx.log.Logger.error(this,"No XHR support available.");
},_getProtocol:function(){var M=this.__mb;
var N=/^(\w+:)\/\//;
if(M!==null&&M.match){var O=M.match(N);

if(O&&O[1]){return O[1];
}}return window.location.protocol;
},__qF:null,__qD:null,__qy:null,__qz:null,__qA:null,__lW:null,__qB:null,__mb:null,__ma:null,__cg:null,__mc:null,__qG:null,__qE:null,__qC:null,__qH:function(){this.__qF=this._createNativeXhr();
this.__qF.onreadystatechange=this.__qy;
if(this.__qF.onabort){this.__qF.onabort=this.__qz;
}this.__mc=this.__qB=this.__ma=false;
},__qI:function(){if(!this.__ma){this.abort();
}},__qJ:function(){var P=this.__qF,Q=true;

if(qx.core.Environment.get(j)){qx.Bootstrap.debug(qx.bom.request.Xhr,"Received native readyState: "+P.readyState);
}if(this.readyState==P.readyState){return;
}this.readyState=P.readyState;
if(this.readyState===qx.bom.request.Xhr.DONE&&this.__ma&&!this.__qB){return;
}if(!this.__qD&&(P.readyState==2||P.readyState==3)){return;
}this.status=0;
this.statusText=this.responseText=i;
this.responseXML=null;

if(this.readyState>=qx.bom.request.Xhr.HEADERS_RECEIVED){try{this.status=P.status;
this.statusText=P.statusText;
this.responseText=P.responseText;
this.responseXML=P.responseXML;
}catch(R){Q=false;
}
if(Q){this.__qN();
this.__qO();
}}this.__mf();
if(this.readyState==qx.bom.request.Xhr.DONE){if(P){P.onreadystatechange=function(){};
}}},__mf:function(){var S=this;
if(this.readyState===qx.bom.request.Xhr.DONE){window.clearTimeout(this.__qG);
}if(qx.core.Environment.get(k)==g&&qx.core.Environment.get(b)<8){if(this.__qD&&!this.__qB&&this.readyState>=qx.bom.request.Xhr.LOADING){if(this.readyState==qx.bom.request.Xhr.LOADING){return ;
}
if(this.readyState==qx.bom.request.Xhr.DONE){window.setTimeout(function(){if(S.__mc){return;
}S.readyState=3;
S.onreadystatechange();
S.readyState=4;
S.onreadystatechange();
S.__qK();
});
return;
}}}this.onreadystatechange();

if(this.readyState===qx.bom.request.Xhr.DONE){this.__qK();
}},__qK:function(){if(this.__cg){this.ontimeout();
if(qx.core.Environment.get(k)===f){this.onerror();
}this.__cg=false;
}else{if(this.__ma){this.onabort();
}else{this.__qL()?this.onerror():this.onload();
}}this.onloadend();
},__qL:function(){var T;
if(this._getProtocol()===c){T=!this.responseText;
}else{T=!this.statusText;
}return T;
},__qM:function(){var U=this.__qF;
this.readyState=qx.bom.request.Xhr.DONE;
this.__cg=true;
U.abort();
this.responseText=i;
this.responseXML=null;
this.__mf();
},__qN:function(){var V=this.readyState===qx.bom.request.Xhr.DONE;
if(this._getProtocol()===c&&this.status===0&&V){if(!this.__qL()){this.status=200;
}}if(this.status===1223){this.status=204;
}if(qx.core.Environment.get(k)===f){if(V&&this.__qC&&!this.__ma&&this.status===0){this.status=304;
}}},__qO:function(){if(qx.core.Environment.get(k)==g&&(this.getResponseHeader(l)||i).match(/[^\/]+\/[^\+]+\+xml/)&&this.responseXML&&!this.responseXML.documentElement){var W=new window.ActiveXObject(o);
W.async=false;
W.validateOnParse=false;
W.loadXML(this.responseText);
this.responseXML=W;
}},__qP:function(){try{if(this){this.dispose();
}}catch(e){}},__qQ:function(){var name=qx.core.Environment.get(k);
var X=qx.core.Environment.get(q);
return !(name==g&&X<9||name==d&&X<3.5);
},__qR:function(){if(this.__mc){throw new Error("Already disposed");
}}},defer:function(){qx.core.Environment.add(j,false);
}});
})();
(function(){var b="//",a="qx.util.Request";
qx.Class.define(a,{statics:{isCrossDomain:function(c){var e=qx.util.Uri.parseUri(c),location=window.location;

if(!location){return false;
}var d=location.protocol;
if(!(c.indexOf(b)!==-1)){return false;
}
if(d.substr(0,d.length-1)==e.protocol&&location.host===e.host&&location.port===e.port){return false;
}return true;
},isSuccessful:function(status){return (status>=200&&status<300||status===304);
},methodAllowsRequestBody:function(f){return !((/^(GET)|(HEAD)$/).test(f));
}}});
})();
(function(){var d="qx.event.handler.Iframe",c="load",b="iframe",a="navigate";
qx.Class.define(d,{extend:qx.core.Object,implement:qx.event.IEventHandler,statics:{PRIORITY:qx.event.Registration.PRIORITY_NORMAL,SUPPORTED_TYPES:{load:1,navigate:1},TARGET_CHECK:qx.event.IEventHandler.TARGET_DOMNODE,IGNORE_CAN_HANDLE:false,onevent:qx.event.GlobalError.observeMethod(function(e){var f=qx.bom.Iframe.queryCurrentUrl(e);

if(f!==e.$$url){qx.event.Registration.fireEvent(e,a,qx.event.type.Data,[f]);
e.$$url=f;
}qx.event.Registration.fireEvent(e,c);
})},members:{canHandleEvent:function(g,h){return g.tagName.toLowerCase()===b;
},registerEvent:function(i,j,k){},unregisterEvent:function(l,m,n){}},defer:function(o){qx.event.Registration.addHandler(o);
}});
})();
(function(){var j="load",i="contentDocument",h="engine.name",g="",f="qx.bom.Iframe",e="osx",d="os.name",c="webkit",b="iframe",a="body";
qx.Class.define(f,{statics:{DEFAULT_ATTRIBUTES:{onload:"qx.event.handler.Iframe.onevent(this)",frameBorder:0,frameSpacing:0,marginWidth:0,marginHeight:0,hspace:0,vspace:0,border:0,allowTransparency:true},create:function(k,l){var k=k?qx.lang.Object.clone(k):{};
var m=qx.bom.Iframe.DEFAULT_ATTRIBUTES;

for(var n in m){if(k[n]==null){k[n]=m[n];
}}return qx.bom.Element.create(b,k,l);
},getWindow:function(o){try{return o.contentWindow;
}catch(p){return null;
}},getDocument:function(q){if(i in q){try{return q.contentDocument;
}catch(s){return null;
}}
try{var r=this.getWindow(q);
return r?r.document:null;
}catch(t){return null;
}},getBody:function(u){try{var v=this.getDocument(u);
return v?v.getElementsByTagName(a)[0]:null;
}catch(w){return null;
}},setSource:function(x,y){try{if(this.getWindow(x)&&qx.dom.Hierarchy.isRendered(x)){try{if((qx.core.Environment.get(h)==c)&&qx.core.Environment.get(d)==e){var z=this.getWindow(x);

if(z){z.stop();
}}this.getWindow(x).location.replace(y);
}catch(A){x.src=y;
}}else{x.src=y;
}this.__uT(x);
}catch(B){qx.log.Logger.warn("Iframe source could not be set!");
}},queryCurrentUrl:function(C){var D=this.getDocument(C);

try{if(D&&D.location){return D.location.href;
}}catch(E){}return g;
},__uT:function(F){var G=function(){qx.bom.Event.removeNativeListener(F,j,G);
F.$$url=qx.bom.Iframe.queryCurrentUrl(F);
};
qx.bom.Event.addNativeListener(F,j,G);
}}});
})();
(function(){var c="qx.event.handler.Appear",b="disappear",a="appear";
qx.Class.define(c,{extend:qx.core.Object,implement:qx.event.IEventHandler,construct:function(d){qx.core.Object.call(this);
this.__x=d;
this.__gF={};
qx.event.handler.Appear.__gG[this.$$hash]=this;
},statics:{PRIORITY:qx.event.Registration.PRIORITY_NORMAL,SUPPORTED_TYPES:{appear:true,disappear:true},TARGET_CHECK:qx.event.IEventHandler.TARGET_DOMNODE,IGNORE_CAN_HANDLE:true,__gG:{},refresh:function(){var e=this.__gG;

for(var f in e){e[f].refresh();
}}},members:{__x:null,__gF:null,canHandleEvent:function(g,h){},registerEvent:function(i,j,k){var l=qx.core.ObjectRegistry.toHashCode(i)+j;
var m=this.__gF;

if(m&&!m[l]){m[l]=i;
i.$$displayed=i.offsetWidth>0;
}},unregisterEvent:function(n,o,p){var q=qx.core.ObjectRegistry.toHashCode(n)+o;
var r=this.__gF;

if(!r){return;
}
if(r[q]){delete r[q];
}},refresh:function(){var v=this.__gF;
var w;

for(var u in v){w=v[u];
var s=w.offsetWidth>0;

if((!!w.$$displayed)!==s){w.$$displayed=s;
var t=qx.event.Registration.createEvent(s?a:b);
this.__x.dispatchEvent(w,t);
}}}},destruct:function(){this.__x=this.__gF=null;
delete qx.event.handler.Appear.__gG[this.$$hash];
},defer:function(x){qx.event.Registration.addHandler(x);
}});
})();
(function(){var b="abstract",a="qx.event.dispatch.AbstractBubbling";
qx.Class.define(a,{extend:qx.core.Object,implement:qx.event.IEventDispatcher,type:b,construct:function(c){this._manager=c;
},members:{_getParent:function(d){throw new Error("Missing implementation");
},canDispatchEvent:function(e,event,f){return event.getBubbles();
},dispatchEvent:function(g,event,h){var parent=g;
var s=this._manager;
var p,w;
var n;
var r,u;
var t;
var v=[];
p=s.getListeners(g,h,true);
w=s.getListeners(g,h,false);

if(p){v.push(p);
}
if(w){v.push(w);
}var parent=this._getParent(g);
var l=[];
var k=[];
var m=[];
var q=[];
while(parent!=null){p=s.getListeners(parent,h,true);

if(p){m.push(p);
q.push(parent);
}w=s.getListeners(parent,h,false);

if(w){l.push(w);
k.push(parent);
}parent=this._getParent(parent);
}event.setEventPhase(qx.event.type.Event.CAPTURING_PHASE);

for(var i=m.length-1;i>=0;i--){t=q[i];
event.setCurrentTarget(t);
n=m[i];

for(var j=0,o=n.length;j<o;j++){r=n[j];
u=r.context||t;
r.handler.call(u,event);
}
if(event.getPropagationStopped()){return;
}}event.setEventPhase(qx.event.type.Event.AT_TARGET);
event.setCurrentTarget(g);

for(var i=0,x=v.length;i<x;i++){n=v[i];

for(var j=0,o=n.length;j<o;j++){r=n[j];
u=r.context||g;
r.handler.call(u,event);
}
if(event.getPropagationStopped()){return;
}}event.setEventPhase(qx.event.type.Event.BUBBLING_PHASE);

for(var i=0,x=l.length;i<x;i++){t=k[i];
event.setCurrentTarget(t);
n=l[i];

for(var j=0,o=n.length;j<o;j++){r=n[j];
u=r.context||t;
r.handler.call(u,event);
}
if(event.getPropagationStopped()){return;
}}}}});
})();
(function(){var a="qx.event.dispatch.DomBubbling";
qx.Class.define(a,{extend:qx.event.dispatch.AbstractBubbling,statics:{PRIORITY:qx.event.Registration.PRIORITY_NORMAL},members:{_getParent:function(b){return b.parentNode;
},canDispatchEvent:function(c,event,d){return c.nodeType!==undefined&&event.getBubbles();
}},defer:function(e){qx.event.Registration.addDispatcher(e);
}});
})();
(function(){var d="-",c="qx.event.handler.Element",b="load",a="iframe";
qx.Class.define(c,{extend:qx.core.Object,implement:qx.event.IEventHandler,construct:function(e){qx.core.Object.call(this);
this._manager=e;
this._registeredEvents={};
},statics:{PRIORITY:qx.event.Registration.PRIORITY_NORMAL,SUPPORTED_TYPES:{abort:true,load:true,scroll:true,select:true,reset:true,submit:true},CANCELABLE:{selectstart:true},TARGET_CHECK:qx.event.IEventHandler.TARGET_DOMNODE,IGNORE_CAN_HANDLE:false},members:{canHandleEvent:function(f,g){if(g===b){return f.tagName.toLowerCase()!==a;
}else{return true;
}},registerEvent:function(h,i,j){var m=qx.core.ObjectRegistry.toHashCode(h);
var k=m+d+i;
var l=qx.lang.Function.listener(this._onNative,this,k);
qx.bom.Event.addNativeListener(h,i,l);
this._registeredEvents[k]={element:h,type:i,listener:l};
},unregisterEvent:function(n,o,p){var s=this._registeredEvents;

if(!s){return;
}var t=qx.core.ObjectRegistry.toHashCode(n);
var q=t+d+o;
var r=this._registeredEvents[q];

if(r){qx.bom.Event.removeNativeListener(n,o,r.listener);
}delete this._registeredEvents[q];
},_onNative:qx.event.GlobalError.observeMethod(function(u,v){var x=this._registeredEvents;

if(!x){return;
}var w=x[v];
var y=this.constructor.CANCELABLE[w.type];
qx.event.Registration.fireNonBubblingEvent(w.element,w.type,qx.event.type.Native,[u,undefined,undefined,undefined,y]);
})},destruct:function(){var z;
var A=this._registeredEvents;

for(var B in A){z=A[B];
qx.bom.Event.removeNativeListener(z.element,z.type,z.listener);
}this._manager=this._registeredEvents=null;
},defer:function(C){qx.event.Registration.addHandler(C);
}});
})();
(function(){var a="qx.event.handler.UserAction";
qx.Class.define(a,{extend:qx.core.Object,implement:qx.event.IEventHandler,construct:function(b){qx.core.Object.call(this);
this.__x=b;
this.__cw=b.getWindow();
},statics:{PRIORITY:qx.event.Registration.PRIORITY_NORMAL,SUPPORTED_TYPES:{useraction:1},TARGET_CHECK:qx.event.IEventHandler.TARGET_WINDOW,IGNORE_CAN_HANDLE:true},members:{__x:null,__cw:null,canHandleEvent:function(c,d){},registerEvent:function(e,f,g){},unregisterEvent:function(h,i,j){}},destruct:function(){this.__x=this.__cw=null;
},defer:function(k){qx.event.Registration.addHandler(k);
}});
})();
(function(){var t="mouseup",s="engine.name",r="click",q="mousedown",p="contextmenu",o="mousewheel",n="dblclick",m="os.name",l="mouseover",k="mouseout",d="ios",j="mousemove",g="on",c="engine.version",b="useraction",f="webkit",e="gecko",h="DOMMouseScroll",a="qx.event.handler.Mouse";
qx.Class.define(a,{extend:qx.core.Object,implement:qx.event.IEventHandler,construct:function(u){qx.core.Object.call(this);
this.__x=u;
this.__cw=u.getWindow();
this.__cx=this.__cw.document;
this._initButtonObserver();
this._initMoveObserver();
this._initWheelObserver();
},statics:{PRIORITY:qx.event.Registration.PRIORITY_NORMAL,SUPPORTED_TYPES:{mousemove:1,mouseover:1,mouseout:1,mousedown:1,mouseup:1,click:1,dblclick:1,contextmenu:1,mousewheel:1},TARGET_CHECK:qx.event.IEventHandler.TARGET_DOMNODE+qx.event.IEventHandler.TARGET_DOCUMENT+qx.event.IEventHandler.TARGET_WINDOW,IGNORE_CAN_HANDLE:true},members:{__ev:null,__ew:null,__ex:null,__ey:null,__ez:null,__x:null,__cw:null,__cx:null,canHandleEvent:function(v,w){},registerEvent:qx.core.Environment.get(m)===d?function(x,y,z){x[g+y]=qx.lang.Function.returnNull;
}:qx.lang.Function.returnNull,unregisterEvent:qx.core.Environment.get(m)===d?function(A,B,C){A[g+B]=undefined;
}:qx.lang.Function.returnNull,__cH:function(D,E,F){if(!F){F=qx.bom.Event.getTarget(D);
}if(F&&F.nodeType){qx.event.Registration.fireEvent(F,E||D.type,E==o?qx.event.type.MouseWheel:qx.event.type.Mouse,[D,F,null,true,true]);
}qx.event.Registration.fireEvent(this.__cw,b,qx.event.type.Data,[E||D.type]);
},__eA:function(){var H=[this.__cw,this.__cx,this.__cx.body];
var I=this.__cw;
var G=h;

for(var i=0;i<H.length;i++){if(qx.bom.Event.supportsEvent(H[i],o)){G=o;
I=H[i];
break;
}}return {type:G,target:I};
},_initButtonObserver:function(){this.__ev=qx.lang.Function.listener(this._onButtonEvent,this);
var Event=qx.bom.Event;
Event.addNativeListener(this.__cx,q,this.__ev);
Event.addNativeListener(this.__cx,t,this.__ev);
Event.addNativeListener(this.__cx,r,this.__ev);
Event.addNativeListener(this.__cx,n,this.__ev);
Event.addNativeListener(this.__cx,p,this.__ev);
},_initMoveObserver:function(){this.__ew=qx.lang.Function.listener(this._onMoveEvent,this);
var Event=qx.bom.Event;
Event.addNativeListener(this.__cx,j,this.__ew);
Event.addNativeListener(this.__cx,l,this.__ew);
Event.addNativeListener(this.__cx,k,this.__ew);
},_initWheelObserver:function(){this.__ex=qx.lang.Function.listener(this._onWheelEvent,this);
var J=this.__eA();
qx.bom.Event.addNativeListener(J.target,J.type,this.__ex);
},_stopButtonObserver:function(){var Event=qx.bom.Event;
Event.removeNativeListener(this.__cx,q,this.__ev);
Event.removeNativeListener(this.__cx,t,this.__ev);
Event.removeNativeListener(this.__cx,r,this.__ev);
Event.removeNativeListener(this.__cx,n,this.__ev);
Event.removeNativeListener(this.__cx,p,this.__ev);
},_stopMoveObserver:function(){var Event=qx.bom.Event;
Event.removeNativeListener(this.__cx,j,this.__ew);
Event.removeNativeListener(this.__cx,l,this.__ew);
Event.removeNativeListener(this.__cx,k,this.__ew);
},_stopWheelObserver:function(){var K=this.__eA();
qx.bom.Event.removeNativeListener(K.target,K.type,this.__ex);
},_onMoveEvent:qx.event.GlobalError.observeMethod(function(L){this.__cH(L);
}),_onButtonEvent:qx.event.GlobalError.observeMethod(function(M){var N=M.type;
var O=qx.bom.Event.getTarget(M);
if(qx.core.Environment.get(s)==e||qx.core.Environment.get(s)==f){if(O&&O.nodeType==3){O=O.parentNode;
}}
if(this.__eB){this.__eB(M,N,O);
}
if(this.__eD){this.__eD(M,N,O);
}this.__cH(M,N,O);

if(this.__eC){this.__eC(M,N,O);
}
if(this.__eE){this.__eE(M,N,O);
}this.__ey=N;
}),_onWheelEvent:qx.event.GlobalError.observeMethod(function(P){this.__cH(P,o);
}),__eB:qx.core.Environment.select(s,{"webkit":function(Q,R,S){if(parseFloat(qx.core.Environment.get(c))<530){if(R==p){this.__cH(Q,t,S);
}}},"default":null}),__eC:qx.core.Environment.select(s,{"opera":function(T,U,V){if(U==t&&T.button==2){this.__cH(T,p,V);
}},"default":null}),__eD:qx.core.Environment.select(s,{"mshtml":function(W,X,Y){if(W.target!==undefined){return;
}
if(X==t&&this.__ey==r){this.__cH(W,q,Y);
}else if(X==n){this.__cH(W,r,Y);
}},"default":null}),__eE:qx.core.Environment.select(s,{"mshtml":null,"default":function(ba,bb,bc){switch(bb){case q:this.__ez=bc;
break;
case t:if(bc!==this.__ez){var bd=qx.dom.Hierarchy.getCommonParent(bc,this.__ez);
this.__cH(ba,r,bd);
}}}})},destruct:function(){this._stopButtonObserver();
this._stopMoveObserver();
this._stopWheelObserver();
this.__x=this.__cw=this.__cx=this.__ez=null;
},defer:function(be){qx.event.Registration.addHandler(be);
}});
})();
(function(){var e="os.name",d="opera",c="engine.name",b="qx.event.type.Dom",a="osx";
qx.Class.define(b,{extend:qx.event.type.Native,statics:{SHIFT_MASK:1,CTRL_MASK:2,ALT_MASK:4,META_MASK:8},members:{_cloneNativeEvent:function(f,g){var g=qx.event.type.Native.prototype._cloneNativeEvent.call(this,f,g);
g.shiftKey=f.shiftKey;
g.ctrlKey=f.ctrlKey;
g.altKey=f.altKey;
g.metaKey=f.metaKey;
return g;
},getModifiers:function(){var i=0;
var h=this._native;

if(h.shiftKey){i|=qx.event.type.Dom.SHIFT_MASK;
}
if(h.ctrlKey){i|=qx.event.type.Dom.CTRL_MASK;
}
if(h.altKey){i|=qx.event.type.Dom.ALT_MASK;
}
if(h.metaKey){i|=qx.event.type.Dom.META_MASK;
}return i;
},isCtrlPressed:function(){return this._native.ctrlKey;
},isShiftPressed:function(){return this._native.shiftKey;
},isAltPressed:function(){return this._native.altKey;
},isMetaPressed:function(){return this._native.metaKey;
},isCtrlOrCommandPressed:function(){if(qx.core.Environment.get(e)==a&&qx.core.Environment.get(c)!=d){return this._native.metaKey;
}else{return this._native.ctrlKey;
}}}});
})();
(function(){var j="left",i="right",h="middle",g="none",f="click",e="contextmenu",d="qx.event.type.Mouse",c="browser.documentmode",b="browser.name",a="ie";
qx.Class.define(d,{extend:qx.event.type.Dom,members:{_cloneNativeEvent:function(k,l){var l=qx.event.type.Dom.prototype._cloneNativeEvent.call(this,k,l);
l.button=k.button;
l.clientX=k.clientX;
l.clientY=k.clientY;
l.pageX=k.pageX;
l.pageY=k.pageY;
l.screenX=k.screenX;
l.screenY=k.screenY;
l.wheelDelta=k.wheelDelta;
l.wheelDeltaX=k.wheelDeltaX;
l.wheelDeltaY=k.wheelDeltaY;
l.detail=k.detail;
l.axis=k.axis;
l.wheelX=k.wheelX;
l.wheelY=k.wheelY;
l.HORIZONTAL_AXIS=k.HORIZONTAL_AXIS;
l.srcElement=k.srcElement;
l.target=k.target;
return l;
},__iw:{0:j,2:i,1:h},__ix:{1:j,2:i,4:h},stop:function(){this.stopPropagation();
},getButton:function(){switch(this._type){case e:return i;
case f:if(qx.core.Environment.get(b)===a&&qx.core.Environment.get(c)<9){return j;
}default:if(this._native.target!==undefined){return this.__iw[this._native.button]||g;
}else{return this.__ix[this._native.button]||g;
}}},isLeftPressed:function(){return this.getButton()===j;
},isMiddlePressed:function(){return this.getButton()===h;
},isRightPressed:function(){return this.getButton()===i;
},getRelatedTarget:function(){return this._relatedTarget;
},getViewportLeft:function(){return this._native.clientX;
},getViewportTop:function(){return this._native.clientY;
},getDocumentLeft:function(){if(this._native.pageX!==undefined){return this._native.pageX;
}else{var m=qx.dom.Node.getWindow(this._native.srcElement);
return this._native.clientX+qx.bom.Viewport.getScrollLeft(m);
}},getDocumentTop:function(){if(this._native.pageY!==undefined){return this._native.pageY;
}else{var n=qx.dom.Node.getWindow(this._native.srcElement);
return this._native.clientY+qx.bom.Viewport.getScrollTop(n);
}},getScreenLeft:function(){return this._native.screenX;
},getScreenTop:function(){return this._native.screenY;
}}});
})();
(function(){var l="engine.version",k="os.name",j="engine.name",i="x",h="osx",g="win",f="qx.dynamicmousewheel",d="chrome",c="qx.event.type.MouseWheel",b="browser.name",a="y";
qx.Class.define(c,{extend:qx.event.type.Mouse,statics:{MAXSCROLL:null,MINSCROLL:null,FACTOR:1},members:{stop:function(){this.stopPropagation();
this.preventDefault();
},__bL:function(m){var n=Math.abs(m);
if(qx.event.type.MouseWheel.MINSCROLL==null||qx.event.type.MouseWheel.MINSCROLL>n){qx.event.type.MouseWheel.MINSCROLL=n;
this.__bM();
}if(qx.event.type.MouseWheel.MAXSCROLL==null||qx.event.type.MouseWheel.MAXSCROLL<n){qx.event.type.MouseWheel.MAXSCROLL=n;
this.__bM();
}if(qx.event.type.MouseWheel.MAXSCROLL===n&&qx.event.type.MouseWheel.MINSCROLL===n){return 2*(m/n);
}var o=qx.event.type.MouseWheel.MAXSCROLL-qx.event.type.MouseWheel.MINSCROLL;
var p=(m/o)*Math.log(o)*qx.event.type.MouseWheel.FACTOR;
return p<0?Math.min(p,-1):Math.max(p,1);
},__bM:function(){var q=qx.event.type.MouseWheel.MAXSCROLL||0;
var t=qx.event.type.MouseWheel.MINSCROLL||q;

if(q<=t){return;
}var r=q-t;
var s=(q/r)*Math.log(r);

if(s==0){s=1;
}qx.event.type.MouseWheel.FACTOR=6/s;
},getWheelDelta:function(u){var e=this._native;
if(u===undefined){if(v===undefined){var v=-e.wheelDelta;

if(e.wheelDelta===undefined){v=e.detail;
}}return this.__bN(v);
}if(u===i){var x=0;

if(e.wheelDelta!==undefined){if(e.wheelDeltaX!==undefined){x=e.wheelDeltaX?this.__bN(-e.wheelDeltaX):0;
}}else{if(e.axis&&e.axis==e.HORIZONTAL_AXIS){x=this.__bN(e.detail);
}}return x;
}if(u===a){var y=0;

if(e.wheelDelta!==undefined){if(e.wheelDeltaY!==undefined){y=e.wheelDeltaY?this.__bN(-e.wheelDeltaY):0;
}else{y=this.__bN(-e.wheelDelta);
}}else{if(!(e.axis&&e.axis==e.HORIZONTAL_AXIS)){y=this.__bN(e.detail);
}}return y;
}return 0;
},__bN:function(w){if(qx.core.Environment.get(f)){return this.__bL(w);
}else{var z=qx.core.Environment.select(j,{"default":function(){return w/40;
},"gecko":function(){return w;
},"webkit":function(){if(qx.core.Environment.get(b)==d){if(qx.core.Environment.get(k)==h){return w/60;
}else{return w/120;
}}else{if(qx.core.Environment.get(k)==g){var A=120;
if(parseFloat(qx.core.Environment.get(l))==533.16){A=1200;
}}else{A=40;
if(parseFloat(qx.core.Environment.get(l))==533.16||parseFloat(qx.core.Environment.get(l))==533.17||parseFloat(qx.core.Environment.get(l))==533.18){A=1200;
}}return w/A;
}}});
return z.call(this);
}}}});
})();
(function(){var g="html.element.contains",f="html.element.compareDocumentPosition",e="qx.dom.Hierarchy",d="previousSibling",c="nextSibling",b="parentNode",a="*";
qx.Bootstrap.define(e,{statics:{getNodeIndex:function(h){var i=0;

while(h&&(h=h.previousSibling)){i++;
}return i;
},getElementIndex:function(j){var k=0;
var l=qx.dom.Node.ELEMENT;

while(j&&(j=j.previousSibling)){if(j.nodeType==l){k++;
}}return k;
},getNextElementSibling:function(m){while(m&&(m=m.nextSibling)&&!qx.dom.Node.isElement(m)){continue;
}return m||null;
},getPreviousElementSibling:function(n){while(n&&(n=n.previousSibling)&&!qx.dom.Node.isElement(n)){continue;
}return n||null;
},contains:function(o,p){if(qx.core.Environment.get(g)){if(qx.dom.Node.isDocument(o)){var q=qx.dom.Node.getDocument(p);
return o&&q==o;
}else if(qx.dom.Node.isDocument(p)){return false;
}else{return o.contains(p);
}}else if(qx.core.Environment.get(f)){return !!(o.compareDocumentPosition(p)&16);
}else{while(p){if(o==p){return true;
}p=p.parentNode;
}return false;
}},isRendered:function(r){var s=r.ownerDocument||r.document;

if(qx.core.Environment.get(g)){if(!r.parentNode||!r.offsetParent){return false;
}return s.body.contains(r);
}else if(qx.core.Environment.get(f)){return !!(s.compareDocumentPosition(r)&16);
}else{while(r){if(r==s.body){return true;
}r=r.parentNode;
}return false;
}},isDescendantOf:function(t,u){return this.contains(u,t);
},getCommonParent:function(v,w){if(v===w){return v;
}
if(qx.core.Environment.get(g)){while(v&&qx.dom.Node.isElement(v)){if(v.contains(w)){return v;
}v=v.parentNode;
}return null;
}else{var x=[];

while(v||w){if(v){if(qx.lang.Array.contains(x,v)){return v;
}x.push(v);
v=v.parentNode;
}
if(w){if(qx.lang.Array.contains(x,w)){return w;
}x.push(w);
w=w.parentNode;
}}return null;
}},getAncestors:function(y){return this._recursivelyCollect(y,b);
},getChildElements:function(z){z=z.firstChild;

if(!z){return [];
}var A=this.getNextSiblings(z);

if(z.nodeType===1){A.unshift(z);
}return A;
},getDescendants:function(B){return qx.lang.Array.fromCollection(B.getElementsByTagName(a));
},getFirstDescendant:function(C){C=C.firstChild;

while(C&&C.nodeType!=1){C=C.nextSibling;
}return C;
},getLastDescendant:function(D){D=D.lastChild;

while(D&&D.nodeType!=1){D=D.previousSibling;
}return D;
},getPreviousSiblings:function(E){return this._recursivelyCollect(E,d);
},getNextSiblings:function(F){return this._recursivelyCollect(F,c);
},_recursivelyCollect:function(G,H){var I=[];

while(G=G[H]){if(G.nodeType==1){I.push(G);
}}return I;
},getSiblings:function(J){return this.getPreviousSiblings(J).reverse().concat(this.getNextSiblings(J));
},isEmpty:function(K){K=K.firstChild;

while(K){if(K.nodeType===qx.dom.Node.ELEMENT||K.nodeType===qx.dom.Node.TEXT){return false;
}K=K.nextSibling;
}return true;
},cleanWhitespace:function(L){var M=L.firstChild;

while(M){var N=M.nextSibling;

if(M.nodeType==3&&!/\S/.test(M.nodeValue)){L.removeChild(M);
}M=N;
}}}});
})();
(function(){var m="keydown",l="engine.name",k="keypress",j="NumLock",i="keyup",h="os.name",g="Enter",f="0",e="engine.version",d="9",bx="-",bw="+",bv="PrintScreen",bu="PageUp",bt="gecko",bs="A",br="Space",bq="Left",bp="F5",bo="Down",t="Up",u="F11",r="F6",s="useraction",p="F3",q="keyinput",n="Insert",o="F8",B="End",C="/",Q="Delete",M="*",Y="F1",T="F4",bk="Home",be="F2",H="F12",bn="PageDown",bm="mshtml",bl="F7",F="Win",J="osx",L="F9",O="webkit",R="cmd",U="F10",bb="Right",bg="Z",v="text",w="Escape",I="5",X="3",W="Meta",V="7",bd="Scroll",bc="CapsLock",S="input",ba="Control",a="Tab",bf="Shift",x="Pause",y="Unidentified",N="qx.event.handler.Keyboard",b="win",c="1",E="Apps",z="6",A="off",D="4",P="Alt",bi="2",bh="8",K="Backspace",bj="autoComplete",G=",";
qx.Class.define(N,{extend:qx.core.Object,implement:qx.event.IEventHandler,construct:function(by){qx.core.Object.call(this);
this.__x=by;
this.__cw=by.getWindow();
if((qx.core.Environment.get(l)==bt)){this.__cx=this.__cw;
}else{this.__cx=this.__cw.document.documentElement;
}this.__kE={};
this._initKeyObserver();
},statics:{PRIORITY:qx.event.Registration.PRIORITY_NORMAL,SUPPORTED_TYPES:{keyup:1,keydown:1,keypress:1,keyinput:1},TARGET_CHECK:qx.event.IEventHandler.TARGET_DOMNODE,IGNORE_CAN_HANDLE:true,isValidKeyIdentifier:function(bz){if(this._identifierToKeyCodeMap[bz]){return true;
}
if(bz.length!=1){return false;
}
if(bz>=f&&bz<=d){return true;
}
if(bz>=bs&&bz<=bg){return true;
}
switch(bz){case bw:case bx:case M:case C:return true;
default:return false;
}},isPrintableKeyIdentifier:function(bA){if(bA===br){return true;
}else{return this._identifierToKeyCodeMap[bA]?false:true;
}}},members:{__kF:null,__x:null,__cw:null,__cx:null,__kE:null,__kG:null,__kH:null,__kI:null,canHandleEvent:function(bB,bC){},registerEvent:function(bD,bE,bF){},unregisterEvent:function(bG,bH,bI){},_fireInputEvent:function(bJ,bK){var bL=this.__kJ();
if(bL&&bL.offsetWidth!=0){var event=qx.event.Registration.createEvent(q,qx.event.type.KeyInput,[bJ,bL,bK]);
this.__x.dispatchEvent(bL,event);
}if(this.__cw){qx.event.Registration.fireEvent(this.__cw,s,qx.event.type.Data,[q]);
}},_fireSequenceEvent:function(bM,bN,bO){var bP=this.__kJ();
var bQ=bM.keyCode;
var event=qx.event.Registration.createEvent(bN,qx.event.type.KeySequence,[bM,bP,bO]);
this.__x.dispatchEvent(bP,event);
if(qx.core.Environment.get(l)==bm||qx.core.Environment.get(l)==O){if(bN==m&&event.getDefaultPrevented()){if(!this._isNonPrintableKeyCode(bQ)&&!this._emulateKeyPress[bQ]){this._fireSequenceEvent(bM,k,bO);
}}}if(this.__cw){qx.event.Registration.fireEvent(this.__cw,s,qx.event.type.Data,[bN]);
}},__kJ:function(){var bR=this.__x.getHandler(qx.event.handler.Focus);
var bS=bR.getActive();
if(!bS||bS.offsetWidth==0){bS=bR.getFocus();
}if(!bS||bS.offsetWidth==0){bS=this.__x.getWindow().document.body;
}return bS;
},_initKeyObserver:function(){this.__kF=qx.lang.Function.listener(this.__kK,this);
this.__kI=qx.lang.Function.listener(this.__dK,this);
var Event=qx.bom.Event;
Event.addNativeListener(this.__cx,i,this.__kF);
Event.addNativeListener(this.__cx,m,this.__kF);
Event.addNativeListener(this.__cx,k,this.__kI);
},_stopKeyObserver:function(){var Event=qx.bom.Event;
Event.removeNativeListener(this.__cx,i,this.__kF);
Event.removeNativeListener(this.__cx,m,this.__kF);
Event.removeNativeListener(this.__cx,k,this.__kI);

for(var bU in (this.__kH||{})){var bT=this.__kH[bU];
Event.removeNativeListener(bT.target,k,bT.callback);
}delete (this.__kH);
},__kK:qx.event.GlobalError.observeMethod(qx.core.Environment.select(l,{"mshtml":function(bV){bV=window.event||bV;
var bY=bV.keyCode;
var bW=0;
var bX=bV.type;
if(!(this.__kE[bY]==m&&bX==m)){this._idealKeyHandler(bY,bW,bX,bV);
}if(bX==m){if(this._isNonPrintableKeyCode(bY)||this._emulateKeyPress[bY]){this._idealKeyHandler(bY,bW,k,bV);
}}this.__kE[bY]=bX;
},"gecko":function(ca){var ce=this._keyCodeFix[ca.keyCode]||ca.keyCode;
var cc=0;
var cd=ca.type;
if(qx.core.Environment.get(h)==b){var cb=ce?this._keyCodeToIdentifier(ce):this._charCodeToIdentifier(cc);

if(!(this.__kE[cb]==m&&cd==m)){this._idealKeyHandler(ce,cc,cd,ca);
}this.__kE[cb]=cd;
}else{this._idealKeyHandler(ce,cc,cd,ca);
}this.__kL(ca.target,cd,ce);
},"webkit":function(cf){var ci=0;
var cg=0;
var ch=cf.type;
if(parseFloat(qx.core.Environment.get(e))<525.13){if(ch==i||ch==m){ci=this._charCode2KeyCode[cf.charCode]||cf.keyCode;
}else{if(this._charCode2KeyCode[cf.charCode]){ci=this._charCode2KeyCode[cf.charCode];
}else{cg=cf.charCode;
}}this._idealKeyHandler(ci,cg,ch,cf);
}else{ci=cf.keyCode;
this._idealKeyHandler(ci,cg,ch,cf);
if(ch==m){if(this._isNonPrintableKeyCode(ci)||this._emulateKeyPress[ci]){this._idealKeyHandler(ci,cg,k,cf);
}}this.__kE[ci]=ch;
}},"opera":function(cj){this.__kG=cj.keyCode;
this._idealKeyHandler(cj.keyCode,0,cj.type,cj);
}})),__kL:qx.core.Environment.select(l,{"gecko":function(ck,cl,cm){if(cl===m&&(cm==33||cm==34||cm==38||cm==40)&&ck.type==v&&ck.tagName.toLowerCase()===S&&ck.getAttribute(bj)!==A){if(!this.__kH){this.__kH={};
}var co=qx.core.ObjectRegistry.toHashCode(ck);

if(this.__kH[co]){return;
}var self=this;
this.__kH[co]={target:ck,callback:function(cp){qx.bom.Event.stopPropagation(cp);
self.__dK(cp);
}};
var cn=qx.event.GlobalError.observeMethod(this.__kH[co].callback);
qx.bom.Event.addNativeListener(ck,k,cn);
}},"default":null}),__dK:qx.event.GlobalError.observeMethod(qx.core.Environment.select(l,{"mshtml":function(cq){cq=window.event||cq;

if(this._charCode2KeyCode[cq.keyCode]){this._idealKeyHandler(this._charCode2KeyCode[cq.keyCode],0,cq.type,cq);
}else{this._idealKeyHandler(0,cq.keyCode,cq.type,cq);
}},"gecko":function(cr){var cu=this._keyCodeFix[cr.keyCode]||cr.keyCode;
var cs=cr.charCode;
var ct=cr.type;
this._idealKeyHandler(cu,cs,ct,cr);
},"webkit":function(cv){if(parseFloat(qx.core.Environment.get(e))<525.13){var cy=0;
var cw=0;
var cx=cv.type;

if(cx==i||cx==m){cy=this._charCode2KeyCode[cv.charCode]||cv.keyCode;
}else{if(this._charCode2KeyCode[cv.charCode]){cy=this._charCode2KeyCode[cv.charCode];
}else{cw=cv.charCode;
}}this._idealKeyHandler(cy,cw,cx,cv);
}else{if(this._charCode2KeyCode[cv.keyCode]){this._idealKeyHandler(this._charCode2KeyCode[cv.keyCode],0,cv.type,cv);
}else{this._idealKeyHandler(0,cv.keyCode,cv.type,cv);
}}},"opera":function(cz){var cB=cz.keyCode;
var cA=cz.type;
if(cB!=this.__kG){this._idealKeyHandler(0,this.__kG,cA,cz);
}else{if(this._keyCodeToIdentifierMap[cz.keyCode]){this._idealKeyHandler(cz.keyCode,0,cz.type,cz);
}else{this._idealKeyHandler(0,cz.keyCode,cz.type,cz);
}}}})),_idealKeyHandler:function(cC,cD,cE,cF){var cG;
if(cC||(!cC&&!cD)){cG=this._keyCodeToIdentifier(cC);
this._fireSequenceEvent(cF,cE,cG);
}else{cG=this._charCodeToIdentifier(cD);
this._fireSequenceEvent(cF,k,cG);
this._fireInputEvent(cF,cD);
}},_specialCharCodeMap:{8:K,9:a,13:g,27:w,32:br},_emulateKeyPress:qx.core.Environment.select(l,{"mshtml":{8:true,9:true},"webkit":{8:true,9:true,27:true},"default":{}}),_keyCodeToIdentifierMap:{16:bf,17:ba,18:P,20:bc,224:W,37:bq,38:t,39:bb,40:bo,33:bu,34:bn,35:B,36:bk,45:n,46:Q,112:Y,113:be,114:p,115:T,116:bp,117:r,118:bl,119:o,120:L,121:U,122:u,123:H,144:j,44:bv,145:bd,19:x,91:qx.core.Environment.get(h)==J?R:F,92:F,93:qx.core.Environment.get(h)==J?R:E},_numpadToCharCode:{96:f.charCodeAt(0),97:c.charCodeAt(0),98:bi.charCodeAt(0),99:X.charCodeAt(0),100:D.charCodeAt(0),101:I.charCodeAt(0),102:z.charCodeAt(0),103:V.charCodeAt(0),104:bh.charCodeAt(0),105:d.charCodeAt(0),106:M.charCodeAt(0),107:bw.charCodeAt(0),109:bx.charCodeAt(0),110:G.charCodeAt(0),111:C.charCodeAt(0)},_charCodeA:bs.charCodeAt(0),_charCodeZ:bg.charCodeAt(0),_charCode0:f.charCodeAt(0),_charCode9:d.charCodeAt(0),_isNonPrintableKeyCode:function(cH){return this._keyCodeToIdentifierMap[cH]?true:false;
},_isIdentifiableKeyCode:function(cI){if(cI>=this._charCodeA&&cI<=this._charCodeZ){return true;
}if(cI>=this._charCode0&&cI<=this._charCode9){return true;
}if(this._specialCharCodeMap[cI]){return true;
}if(this._numpadToCharCode[cI]){return true;
}if(this._isNonPrintableKeyCode(cI)){return true;
}return false;
},_keyCodeToIdentifier:function(cJ){if(this._isIdentifiableKeyCode(cJ)){var cK=this._numpadToCharCode[cJ];

if(cK){return String.fromCharCode(cK);
}return (this._keyCodeToIdentifierMap[cJ]||this._specialCharCodeMap[cJ]||String.fromCharCode(cJ));
}else{return y;
}},_charCodeToIdentifier:function(cL){return this._specialCharCodeMap[cL]||String.fromCharCode(cL).toUpperCase();
},_identifierToKeyCode:function(cM){return qx.event.handler.Keyboard._identifierToKeyCodeMap[cM]||cM.charCodeAt(0);
}},destruct:function(){this._stopKeyObserver();
this.__kG=this.__x=this.__cw=this.__cx=this.__kE=null;
},defer:function(cN,cO){qx.event.Registration.addHandler(cN);
if(!cN._identifierToKeyCodeMap){cN._identifierToKeyCodeMap={};

for(var cP in cO._keyCodeToIdentifierMap){cN._identifierToKeyCodeMap[cO._keyCodeToIdentifierMap[cP]]=parseInt(cP,10);
}
for(var cP in cO._specialCharCodeMap){cN._identifierToKeyCodeMap[cO._specialCharCodeMap[cP]]=parseInt(cP,10);
}}
if((qx.core.Environment.get(l)==bm)){cO._charCode2KeyCode={13:13,27:27};
}else if((qx.core.Environment.get(l)==bt)){cO._keyCodeFix={12:cO._identifierToKeyCode(j)};
}else if((qx.core.Environment.get(l)==O)){if(parseFloat(qx.core.Environment.get(e))<525.13){cO._charCode2KeyCode={63289:cO._identifierToKeyCode(j),63276:cO._identifierToKeyCode(bu),63277:cO._identifierToKeyCode(bn),63275:cO._identifierToKeyCode(B),63273:cO._identifierToKeyCode(bk),63234:cO._identifierToKeyCode(bq),63232:cO._identifierToKeyCode(t),63235:cO._identifierToKeyCode(bb),63233:cO._identifierToKeyCode(bo),63272:cO._identifierToKeyCode(Q),63302:cO._identifierToKeyCode(n),63236:cO._identifierToKeyCode(Y),63237:cO._identifierToKeyCode(be),63238:cO._identifierToKeyCode(p),63239:cO._identifierToKeyCode(T),63240:cO._identifierToKeyCode(bp),63241:cO._identifierToKeyCode(r),63242:cO._identifierToKeyCode(bl),63243:cO._identifierToKeyCode(o),63244:cO._identifierToKeyCode(L),63245:cO._identifierToKeyCode(U),63246:cO._identifierToKeyCode(u),63247:cO._identifierToKeyCode(H),63248:cO._identifierToKeyCode(bv),3:cO._identifierToKeyCode(g),12:cO._identifierToKeyCode(j),13:cO._identifierToKeyCode(g)};
}else{cO._charCode2KeyCode={13:13,27:27};
}}}});
})();
(function(){var a="qx.event.type.KeyInput";
qx.Class.define(a,{extend:qx.event.type.Dom,members:{init:function(b,c,d){qx.event.type.Dom.prototype.init.call(this,b,c,null,true,true);
this._charCode=d;
return this;
},clone:function(e){var f=qx.event.type.Dom.prototype.clone.call(this,e);
f._charCode=this._charCode;
return f;
},getCharCode:function(){return this._charCode;
},getChar:function(){return String.fromCharCode(this._charCode);
}}});
})();
(function(){var a="qx.event.type.KeySequence";
qx.Class.define(a,{extend:qx.event.type.Dom,members:{init:function(b,c,d){qx.event.type.Dom.prototype.init.call(this,b,c,null,true,true);
this._keyCode=b.keyCode;
this._identifier=d;
return this;
},clone:function(e){var f=qx.event.type.Dom.prototype.clone.call(this,e);
f._keyCode=this._keyCode;
f._identifier=this._identifier;
return f;
},getKeyIdentifier:function(){return this._identifier;
},getKeyCode:function(){return this._keyCode;
},isPrintable:function(){return qx.event.handler.Keyboard.isPrintableKeyIdentifier(this._identifier);
}}});
})();
(function(){var j="engine.name",i="mousedown",h="mouseup",g="blur",f="focus",e="on",d="selectstart",c="DOMFocusOut",b="focusin",a="focusout",z="DOMFocusIn",y="draggesture",x="qx.event.handler.Focus",w="_applyFocus",v="deactivate",u="textarea",t="_applyActive",s='character',r="input",q="qxSelectable",o="tabIndex",p="off",m="activate",n="mshtml",k="qxKeepFocus",l="qxKeepActive";
qx.Class.define(x,{extend:qx.core.Object,implement:qx.event.IEventHandler,construct:function(A){qx.core.Object.call(this);
this._manager=A;
this._window=A.getWindow();
this._document=this._window.document;
this._root=this._document.documentElement;
this._body=this._document.body;
this._initObserver();
},properties:{active:{apply:t,nullable:true},focus:{apply:w,nullable:true}},statics:{PRIORITY:qx.event.Registration.PRIORITY_NORMAL,SUPPORTED_TYPES:{focus:1,blur:1,focusin:1,focusout:1,activate:1,deactivate:1},IGNORE_CAN_HANDLE:true,FOCUSABLE_ELEMENTS:qx.core.Environment.select("engine.name",{"mshtml|gecko":{a:1,body:1,button:1,frame:1,iframe:1,img:1,input:1,object:1,select:1,textarea:1},"opera|webkit":{button:1,input:1,select:1,textarea:1}})},members:{__fg:null,__fh:null,__fi:null,__fj:null,__fk:null,__fl:null,__fm:null,__fn:null,__fo:null,__fp:null,canHandleEvent:function(B,C){},registerEvent:function(D,E,F){},unregisterEvent:function(G,H,I){},focus:function(J){if((qx.core.Environment.get(j)==n)){window.setTimeout(function(){try{J.focus();
var K=qx.bom.Selection.get(J);

if(K.length==0){var L=J.createTextRange();
L.moveStart(s,J.value.length);
L.collapse();
L.select();
}}catch(M){}},0);
}else{try{J.focus();
}catch(N){}}this.setFocus(J);
this.setActive(J);
},activate:function(O){this.setActive(O);
},blur:function(P){try{P.blur();
}catch(Q){}
if(this.getActive()===P){this.resetActive();
}
if(this.getFocus()===P){this.resetFocus();
}},deactivate:function(R){if(this.getActive()===R){this.resetActive();
}},tryActivate:function(S){var T=this.__fD(S);

if(T){this.setActive(T);
}},__cH:function(U,V,W,X){var ba=qx.event.Registration;
var Y=ba.createEvent(W,qx.event.type.Focus,[U,V,X]);
ba.dispatchEvent(U,Y);
},_windowFocused:true,__fq:function(){if(this._windowFocused){this._windowFocused=false;
this.__cH(this._window,null,g,false);
}},__fr:function(){if(!this._windowFocused){this._windowFocused=true;
this.__cH(this._window,null,f,false);
}},_initObserver:qx.core.Environment.select(j,{"gecko":function(){this.__fg=qx.lang.Function.listener(this.__fx,this);
this.__fh=qx.lang.Function.listener(this.__fy,this);
this.__fi=qx.lang.Function.listener(this.__fw,this);
this.__fj=qx.lang.Function.listener(this.__fv,this);
this.__fk=qx.lang.Function.listener(this.__fs,this);
qx.bom.Event.addNativeListener(this._document,i,this.__fg,true);
qx.bom.Event.addNativeListener(this._document,h,this.__fh,true);
qx.bom.Event.addNativeListener(this._window,f,this.__fi,true);
qx.bom.Event.addNativeListener(this._window,g,this.__fj,true);
qx.bom.Event.addNativeListener(this._window,y,this.__fk,true);
},"mshtml":function(){this.__fg=qx.lang.Function.listener(this.__fx,this);
this.__fh=qx.lang.Function.listener(this.__fy,this);
this.__fm=qx.lang.Function.listener(this.__ft,this);
this.__fn=qx.lang.Function.listener(this.__fu,this);
this.__fl=qx.lang.Function.listener(this.__fA,this);
qx.bom.Event.addNativeListener(this._document,i,this.__fg);
qx.bom.Event.addNativeListener(this._document,h,this.__fh);
qx.bom.Event.addNativeListener(this._document,b,this.__fm);
qx.bom.Event.addNativeListener(this._document,a,this.__fn);
qx.bom.Event.addNativeListener(this._document,d,this.__fl);
},"webkit":function(){this.__fg=qx.lang.Function.listener(this.__fx,this);
this.__fh=qx.lang.Function.listener(this.__fy,this);
this.__fn=qx.lang.Function.listener(this.__fu,this);
this.__fi=qx.lang.Function.listener(this.__fw,this);
this.__fj=qx.lang.Function.listener(this.__fv,this);
this.__fl=qx.lang.Function.listener(this.__fA,this);
qx.bom.Event.addNativeListener(this._document,i,this.__fg,true);
qx.bom.Event.addNativeListener(this._document,h,this.__fh,true);
qx.bom.Event.addNativeListener(this._document,d,this.__fl,false);
qx.bom.Event.addNativeListener(this._window,c,this.__fn,true);
qx.bom.Event.addNativeListener(this._window,f,this.__fi,true);
qx.bom.Event.addNativeListener(this._window,g,this.__fj,true);
},"opera":function(){this.__fg=qx.lang.Function.listener(this.__fx,this);
this.__fh=qx.lang.Function.listener(this.__fy,this);
this.__fm=qx.lang.Function.listener(this.__ft,this);
this.__fn=qx.lang.Function.listener(this.__fu,this);
qx.bom.Event.addNativeListener(this._document,i,this.__fg,true);
qx.bom.Event.addNativeListener(this._document,h,this.__fh,true);
qx.bom.Event.addNativeListener(this._window,z,this.__fm,true);
qx.bom.Event.addNativeListener(this._window,c,this.__fn,true);
}}),_stopObserver:qx.core.Environment.select(j,{"gecko":function(){qx.bom.Event.removeNativeListener(this._document,i,this.__fg,true);
qx.bom.Event.removeNativeListener(this._document,h,this.__fh,true);
qx.bom.Event.removeNativeListener(this._window,f,this.__fi,true);
qx.bom.Event.removeNativeListener(this._window,g,this.__fj,true);
qx.bom.Event.removeNativeListener(this._window,y,this.__fk,true);
},"mshtml":function(){qx.bom.Event.removeNativeListener(this._document,i,this.__fg);
qx.bom.Event.removeNativeListener(this._document,h,this.__fh);
qx.bom.Event.removeNativeListener(this._document,b,this.__fm);
qx.bom.Event.removeNativeListener(this._document,a,this.__fn);
qx.bom.Event.removeNativeListener(this._document,d,this.__fl);
},"webkit":function(){qx.bom.Event.removeNativeListener(this._document,i,this.__fg,true);
qx.bom.Event.removeNativeListener(this._document,h,this.__fh,true);
qx.bom.Event.removeNativeListener(this._document,d,this.__fl,false);
qx.bom.Event.removeNativeListener(this._window,c,this.__fn,true);
qx.bom.Event.removeNativeListener(this._window,f,this.__fi,true);
qx.bom.Event.removeNativeListener(this._window,g,this.__fj,true);
},"opera":function(){qx.bom.Event.removeNativeListener(this._document,i,this.__fg,true);
qx.bom.Event.removeNativeListener(this._document,h,this.__fh,true);
qx.bom.Event.removeNativeListener(this._window,z,this.__fm,true);
qx.bom.Event.removeNativeListener(this._window,c,this.__fn,true);
}}),__fs:qx.event.GlobalError.observeMethod(qx.core.Environment.select(j,{"gecko":function(bb){var bc=qx.bom.Event.getTarget(bb);

if(!this.__fE(bc)){qx.bom.Event.preventDefault(bb);
}},"default":null})),__ft:qx.event.GlobalError.observeMethod(qx.core.Environment.select(j,{"mshtml":function(bd){this.__fr();
var bf=qx.bom.Event.getTarget(bd);
var be=this.__fC(bf);

if(be){this.setFocus(be);
}this.tryActivate(bf);
},"opera":function(bg){var bh=qx.bom.Event.getTarget(bg);

if(bh==this._document||bh==this._window){this.__fr();

if(this.__fo){this.setFocus(this.__fo);
delete this.__fo;
}
if(this.__fp){this.setActive(this.__fp);
delete this.__fp;
}}else{this.setFocus(bh);
this.tryActivate(bh);
if(!this.__fE(bh)){bh.selectionStart=0;
bh.selectionEnd=0;
}}},"default":null})),__fu:qx.event.GlobalError.observeMethod(qx.core.Environment.select(j,{"mshtml":function(bi){var bj=qx.bom.Event.getRelatedTarget(bi);
if(bj==null){this.__fq();
this.resetFocus();
this.resetActive();
}},"webkit":function(bk){var bl=qx.bom.Event.getTarget(bk);

if(bl===this.getFocus()){this.resetFocus();
}
if(bl===this.getActive()){this.resetActive();
}},"opera":function(bm){var bn=qx.bom.Event.getTarget(bm);

if(bn==this._document){this.__fq();
this.__fo=this.getFocus();
this.__fp=this.getActive();
this.resetFocus();
this.resetActive();
}else{if(bn===this.getFocus()){this.resetFocus();
}
if(bn===this.getActive()){this.resetActive();
}}},"default":null})),__fv:qx.event.GlobalError.observeMethod(qx.core.Environment.select(j,{"gecko":function(bo){var bp=qx.bom.Event.getTarget(bo);

if(bp===this._window||bp===this._document){this.__fq();
this.resetActive();
this.resetFocus();
}},"webkit":function(bq){var br=qx.bom.Event.getTarget(bq);

if(br===this._window||br===this._document){this.__fq();
this.__fo=this.getFocus();
this.__fp=this.getActive();
this.resetActive();
this.resetFocus();
}},"default":null})),__fw:qx.event.GlobalError.observeMethod(qx.core.Environment.select(j,{"gecko":function(bs){var bt=qx.bom.Event.getTarget(bs);

if(bt===this._window||bt===this._document){this.__fr();
bt=this._body;
}this.setFocus(bt);
this.tryActivate(bt);
},"webkit":function(bu){var bv=qx.bom.Event.getTarget(bu);

if(bv===this._window||bv===this._document){this.__fr();

if(this.__fo){this.setFocus(this.__fo);
delete this.__fo;
}
if(this.__fp){this.setActive(this.__fp);
delete this.__fp;
}}else{this.setFocus(bv);
this.tryActivate(bv);
}},"default":null})),__fx:qx.event.GlobalError.observeMethod(qx.core.Environment.select(j,{"gecko":function(bw){var by=qx.bom.Event.getTarget(bw);
var bx=this.__fC(by);

if(!bx){qx.bom.Event.preventDefault(bw);
}else if(bx===this._body){this.setFocus(bx);
}},"mshtml":function(bz){var bB=qx.bom.Event.getTarget(bz);
var bA=this.__fC(bB);

if(bA){if(!this.__fE(bB)){bB.unselectable=e;
try{document.selection.empty();
}catch(bC){}try{bA.focus();
}catch(bD){}}}else{qx.bom.Event.preventDefault(bz);
if(!this.__fE(bB)){bB.unselectable=e;
}}},"webkit":function(bE){var bG=qx.bom.Event.getTarget(bE);
var bF=this.__fC(bG);

if(bF){this.setFocus(bF);
}else{qx.bom.Event.preventDefault(bE);
}},"opera":function(bH){var bK=qx.bom.Event.getTarget(bH);
var bI=this.__fC(bK);

if(!this.__fE(bK)){qx.bom.Event.preventDefault(bH);
if(bI){var bJ=this.getFocus();

if(bJ&&bJ.selectionEnd){bJ.selectionStart=0;
bJ.selectionEnd=0;
bJ.blur();
}if(bI){this.setFocus(bI);
}}}else if(bI){this.setFocus(bI);
}},"default":null})),__fy:qx.event.GlobalError.observeMethod(qx.core.Environment.select(j,{"mshtml":function(bL){var bM=qx.bom.Event.getTarget(bL);

if(bM.unselectable){bM.unselectable=p;
}this.tryActivate(this.__fz(bM));
},"gecko":function(bN){var bO=qx.bom.Event.getTarget(bN);

while(bO&&bO.offsetWidth===undefined){bO=bO.parentNode;
}
if(bO){this.tryActivate(bO);
}},"webkit|opera":function(bP){var bQ=qx.bom.Event.getTarget(bP);
this.tryActivate(this.__fz(bQ));
},"default":null})),__fz:qx.event.GlobalError.observeMethod(qx.core.Environment.select(j,{"mshtml|webkit":function(bR){var bS=this.getFocus();

if(bS&&bR!=bS&&(bS.nodeName.toLowerCase()===r||bS.nodeName.toLowerCase()===u)){bR=bS;
}return bR;
},"default":function(bT){return bT;
}})),__fA:qx.event.GlobalError.observeMethod(qx.core.Environment.select(j,{"mshtml|webkit":function(bU){var bV=qx.bom.Event.getTarget(bU);

if(!this.__fE(bV)){qx.bom.Event.preventDefault(bU);
}},"default":null})),__fB:function(bW){var bX=qx.bom.element.Attribute.get(bW,o);

if(bX>=1){return true;
}var bY=qx.event.handler.Focus.FOCUSABLE_ELEMENTS;

if(bX>=0&&bY[bW.tagName]){return true;
}return false;
},__fC:function(ca){while(ca&&ca.nodeType===1){if(ca.getAttribute(k)==e){return null;
}
if(this.__fB(ca)){return ca;
}ca=ca.parentNode;
}return this._body;
},__fD:function(cb){var cc=cb;

while(cb&&cb.nodeType===1){if(cb.getAttribute(l)==e){return null;
}cb=cb.parentNode;
}return cc;
},__fE:function(cd){while(cd&&cd.nodeType===1){var ce=cd.getAttribute(q);

if(ce!=null){return ce===e;
}cd=cd.parentNode;
}return true;
},_applyActive:function(cf,cg){if(cg){this.__cH(cg,cf,v,true);
}
if(cf){this.__cH(cf,cg,m,true);
}},_applyFocus:function(ch,ci){if(ci){this.__cH(ci,ch,a,true);
}
if(ch){this.__cH(ch,ci,b,true);
}if(ci){this.__cH(ci,ch,g,false);
}
if(ch){this.__cH(ch,ci,f,false);
}}},destruct:function(){this._stopObserver();
this._manager=this._window=this._document=this._root=this._body=this.__fF=null;
},defer:function(cj){qx.event.Registration.addHandler(cj);
var ck=cj.FOCUSABLE_ELEMENTS;

for(var cl in ck){ck[cl.toUpperCase()]=1;
}}});
})();
(function(){var k="engine.name",j="character",i="EndToEnd",h="input",g="StartToStart",f="textarea",e='character',d="qx.bom.Selection",c="button",b="#text",a="body";
qx.Class.define(d,{statics:{getSelectionObject:qx.core.Environment.select(k,{"mshtml":function(l){return l.selection;
},"default":function(m){return qx.dom.Node.getWindow(m).getSelection();
}}),get:qx.core.Environment.select(k,{"mshtml":function(n){var o=qx.bom.Range.get(qx.dom.Node.getDocument(n));
return o.text;
},"default":function(p){if(this.__fI(p)){return p.value.substring(p.selectionStart,p.selectionEnd);
}else{return this.getSelectionObject(qx.dom.Node.getDocument(p)).toString();
}}}),getLength:qx.core.Environment.select(k,{"mshtml":function(q){var s=this.get(q);
var r=qx.util.StringSplit.split(s,/\r\n/);
return s.length-(r.length-1);
},"opera":function(t){var y,w,u;

if(this.__fI(t)){var x=t.selectionStart;
var v=t.selectionEnd;
y=t.value.substring(x,v);
w=v-x;
}else{y=qx.bom.Selection.get(t);
w=y.length;
}u=qx.util.StringSplit.split(y,/\r\n/);
return w-(u.length-1);
},"default":function(z){if(this.__fI(z)){return z.selectionEnd-z.selectionStart;
}else{return this.get(z).length;
}}}),getStart:qx.core.Environment.select(k,{"mshtml":function(A){if(this.__fI(A)){var F=qx.bom.Range.get();
if(!A.contains(F.parentElement())){return -1;
}var G=qx.bom.Range.get(A);
var E=A.value.length;
G.moveToBookmark(F.getBookmark());
G.moveEnd(e,E);
return E-G.text.length;
}else{var G=qx.bom.Range.get(A);
var C=G.parentElement();
var H=qx.bom.Range.get();

try{H.moveToElementText(C);
}catch(J){return 0;
}var B=qx.bom.Range.get(qx.dom.Node.getBodyElement(A));
B.setEndPoint(g,G);
B.setEndPoint(i,H);
if(H.compareEndPoints(g,B)==0){return 0;
}var D;
var I=0;

while(true){D=B.moveStart(j,-1);
if(H.compareEndPoints(g,B)==0){break;
}if(D==0){break;
}else{I++;
}}return ++I;
}},"gecko|webkit":function(K){if(this.__fI(K)){return K.selectionStart;
}else{var M=qx.dom.Node.getDocument(K);
var L=this.getSelectionObject(M);
if(L.anchorOffset<L.focusOffset){return L.anchorOffset;
}else{return L.focusOffset;
}}},"default":function(N){if(this.__fI(N)){return N.selectionStart;
}else{return qx.bom.Selection.getSelectionObject(qx.dom.Node.getDocument(N)).anchorOffset;
}}}),getEnd:qx.core.Environment.select(k,{"mshtml":function(O){if(this.__fI(O)){var T=qx.bom.Range.get();
if(!O.contains(T.parentElement())){return -1;
}var U=qx.bom.Range.get(O);
var S=O.value.length;
U.moveToBookmark(T.getBookmark());
U.moveStart(e,-S);
return U.text.length;
}else{var U=qx.bom.Range.get(O);
var Q=U.parentElement();
var V=qx.bom.Range.get();

try{V.moveToElementText(Q);
}catch(X){return 0;
}var S=V.text.length;
var P=qx.bom.Range.get(qx.dom.Node.getBodyElement(O));
P.setEndPoint(i,U);
P.setEndPoint(g,V);
if(V.compareEndPoints(i,P)==0){return S-1;
}var R;
var W=0;

while(true){R=P.moveEnd(j,1);
if(V.compareEndPoints(i,P)==0){break;
}if(R==0){break;
}else{W++;
}}return S-(++W);
}},"gecko|webkit":function(Y){if(this.__fI(Y)){return Y.selectionEnd;
}else{var bb=qx.dom.Node.getDocument(Y);
var ba=this.getSelectionObject(bb);
if(ba.focusOffset>ba.anchorOffset){return ba.focusOffset;
}else{return ba.anchorOffset;
}}},"default":function(bc){if(this.__fI(bc)){return bc.selectionEnd;
}else{return qx.bom.Selection.getSelectionObject(qx.dom.Node.getDocument(bc)).focusOffset;
}}}),__fI:function(bd){return qx.dom.Node.isElement(bd)&&(bd.nodeName.toLowerCase()==h||bd.nodeName.toLowerCase()==f);
},set:qx.core.Environment.select(k,{"mshtml":function(be,bf,bg){var bh;
if(qx.dom.Node.isDocument(be)){be=be.body;
}
if(qx.dom.Node.isElement(be)||qx.dom.Node.isText(be)){switch(be.nodeName.toLowerCase()){case h:case f:case c:if(bg===undefined){bg=be.value.length;
}
if(bf>=0&&bf<=be.value.length&&bg>=0&&bg<=be.value.length){bh=qx.bom.Range.get(be);
bh.collapse(true);
bh.moveStart(j,bf);
bh.moveEnd(j,bg-bf);
bh.select();
return true;
}break;
case b:if(bg===undefined){bg=be.nodeValue.length;
}
if(bf>=0&&bf<=be.nodeValue.length&&bg>=0&&bg<=be.nodeValue.length){bh=qx.bom.Range.get(qx.dom.Node.getBodyElement(be));
bh.moveToElementText(be.parentNode);
bh.collapse(true);
bh.moveStart(j,bf);
bh.moveEnd(j,bg-bf);
bh.select();
return true;
}break;
default:if(bg===undefined){bg=be.childNodes.length-1;
}if(be.childNodes[bf]&&be.childNodes[bg]){bh=qx.bom.Range.get(qx.dom.Node.getBodyElement(be));
bh.moveToElementText(be.childNodes[bf]);
bh.collapse(true);
var bi=qx.bom.Range.get(qx.dom.Node.getBodyElement(be));
bi.moveToElementText(be.childNodes[bg]);
bh.setEndPoint(i,bi);
bh.select();
return true;
}}}return false;
},"default":function(bj,bk,bl){var bp=bj.nodeName.toLowerCase();

if(qx.dom.Node.isElement(bj)&&(bp==h||bp==f)){if(bl===undefined){bl=bj.value.length;
}if(bk>=0&&bk<=bj.value.length&&bl>=0&&bl<=bj.value.length){bj.focus();
bj.select();
bj.setSelectionRange(bk,bl);
return true;
}}else{var bn=false;
var bo=qx.dom.Node.getWindow(bj).getSelection();
var bm=qx.bom.Range.get(bj);
if(qx.dom.Node.isText(bj)){if(bl===undefined){bl=bj.length;
}
if(bk>=0&&bk<bj.length&&bl>=0&&bl<=bj.length){bn=true;
}}else if(qx.dom.Node.isElement(bj)){if(bl===undefined){bl=bj.childNodes.length-1;
}
if(bk>=0&&bj.childNodes[bk]&&bl>=0&&bj.childNodes[bl]){bn=true;
}}else if(qx.dom.Node.isDocument(bj)){bj=bj.body;

if(bl===undefined){bl=bj.childNodes.length-1;
}
if(bk>=0&&bj.childNodes[bk]&&bl>=0&&bj.childNodes[bl]){bn=true;
}}
if(bn){if(!bo.isCollapsed){bo.collapseToStart();
}bm.setStart(bj,bk);
if(qx.dom.Node.isText(bj)){bm.setEnd(bj,bl);
}else{bm.setEndAfter(bj.childNodes[bl]);
}if(bo.rangeCount>0){bo.removeAllRanges();
}bo.addRange(bm);
return true;
}}return false;
}}),setAll:function(bq){return qx.bom.Selection.set(bq,0);
},clear:qx.core.Environment.select(k,{"mshtml":function(br){var bs=qx.bom.Selection.getSelectionObject(qx.dom.Node.getDocument(br));
var bt=qx.bom.Range.get(br);
var parent=bt.parentElement();
var bu=qx.bom.Range.get(qx.dom.Node.getDocument(br));
if(parent==bu.parentElement()&&parent==br){bs.empty();
}},"default":function(bv){var bx=qx.bom.Selection.getSelectionObject(qx.dom.Node.getDocument(bv));
var bz=bv.nodeName.toLowerCase();
if(qx.dom.Node.isElement(bv)&&(bz==h||bz==f)){bv.setSelectionRange(0,0);
qx.bom.Element.blur(bv);
}else if(qx.dom.Node.isDocument(bv)||bz==a){bx.collapse(bv.body?bv.body:bv,0);
}else{var by=qx.bom.Range.get(bv);

if(!by.collapsed){var bA;
var bw=by.commonAncestorContainer;
if(qx.dom.Node.isElement(bv)&&qx.dom.Node.isText(bw)){bA=bw.parentNode;
}else{bA=bw;
}
if(bA==bv){bx.collapse(bv,0);
}}}}})}});
})();
(function(){var l="button",k="qx.bom.Range",j="text",i="engine.name",h="password",g="file",f="submit",e="reset",d="textarea",c="input",a="hidden",b="body";
qx.Class.define(k,{statics:{get:qx.core.Environment.select(i,{"mshtml":function(m){if(qx.dom.Node.isElement(m)){switch(m.nodeName.toLowerCase()){case c:switch(m.type){case j:case h:case a:case l:case e:case g:case f:return m.createTextRange();
break;
default:return qx.bom.Selection.getSelectionObject(qx.dom.Node.getDocument(m)).createRange();
}break;
case d:case b:case l:return m.createTextRange();
break;
default:return qx.bom.Selection.getSelectionObject(qx.dom.Node.getDocument(m)).createRange();
}}else{if(m==null){m=window;
}return qx.bom.Selection.getSelectionObject(qx.dom.Node.getDocument(m)).createRange();
}},"default":function(n){var o=qx.dom.Node.getDocument(n);
var p=qx.bom.Selection.getSelectionObject(o);

if(p.rangeCount>0){return p.getRangeAt(0);
}else{return o.createRange();
}}})}});
})();
(function(){var j="",h="m",g="g",f="^",e="qx.util.StringSplit",d="i",c="$(?!\\s)",b="[object RegExp]",a="y";
qx.Class.define(e,{statics:{split:function(k,l,m){if(Object.prototype.toString.call(l)!==b){return String.prototype.split.call(k,l,m);
}var t=[],n=0,r=(l.ignoreCase?d:j)+(l.multiline?h:j)+(l.sticky?a:j),l=RegExp(l.source,r+g),q,u,o,p,s=/()??/.exec(j)[1]===undefined;
k=k+j;

if(!s){q=RegExp(f+l.source+c,r);
}if(m===undefined||+m<0){m=Infinity;
}else{m=Math.floor(+m);

if(!m){return [];
}}
while(u=l.exec(k)){o=u.index+u[0].length;

if(o>n){t.push(k.slice(n,u.index));
if(!s&&u.length>1){u[0].replace(q,function(){for(var i=1;i<arguments.length-2;i++){if(arguments[i]===undefined){u[i]=undefined;
}}});
}
if(u.length>1&&u.index<k.length){Array.prototype.push.apply(t,u.slice(1));
}p=u[0].length;
n=o;

if(t.length>=m){break;
}}
if(l.lastIndex===u.index){l.lastIndex++;
}}
if(n===k.length){if(p||!l.test(j)){t.push(j);
}}else{t.push(k.slice(n));
}return t.length>m?t.slice(0,m):t;
}}});
})();
(function(){var e="orientationchange",d="resize",c="landscape",b="portrait",a="qx.event.handler.Orientation";
qx.Class.define(a,{extend:qx.core.Object,implement:qx.event.IEventHandler,construct:function(f){qx.core.Object.call(this);
this.__x=f;
this.__cw=f.getWindow();
this._initObserver();
},statics:{PRIORITY:qx.event.Registration.PRIORITY_NORMAL,SUPPORTED_TYPES:{orientationchange:1},TARGET_CHECK:qx.event.IEventHandler.TARGET_WINDOW,IGNORE_CAN_HANDLE:true},members:{__x:null,__cw:null,__kO:null,__kP:null,__iv:null,canHandleEvent:function(g,h){},registerEvent:function(i,j,k){},unregisterEvent:function(l,m,n){},_initObserver:function(){this.__iv=qx.lang.Function.listener(this._onNative,this);
this.__kO=qx.bom.Event.supportsEvent(this.__cw,e)?e:d;
var Event=qx.bom.Event;
Event.addNativeListener(this.__cw,this.__kO,this.__iv);
},_stopObserver:function(){var Event=qx.bom.Event;
Event.removeNativeListener(this.__cw,this.__kO,this.__iv);
},_onNative:qx.event.GlobalError.observeMethod(function(o){var q=qx.bom.Viewport;
var p=q.getOrientation();

if(this.__kP!=p){this.__kP=p;
var r=q.isLandscape()?c:b;
qx.event.Registration.fireEvent(this.__cw,e,qx.event.type.Orientation,[p,r]);
}})},destruct:function(){this._stopObserver();
this.__x=this.__cw=null;
},defer:function(s){qx.event.Registration.addHandler(s);
}});
})();
(function(){var c="landscape",b="qx.event.type.Orientation",a="portrait";
qx.Class.define(b,{extend:qx.event.type.Event,members:{__em:null,__en:null,init:function(d,e){qx.event.type.Event.prototype.init.call(this,false,false);
this.__em=d;
this.__en=e;
return this;
},clone:function(f){var g=qx.event.type.Event.prototype.clone.call(this,f);
g.__em=this.__em;
g.__en=this.__en;
return g;
},getOrientation:function(){return this.__em;
},isLandscape:function(){return this.__en==c;
},isPortrait:function(){return this.__en==a;
}}});
})();
(function(){var t="qx.mobile.emulatetouch",s="touchend",r="touchstart",q="touchmove",p="event.touch",o="mousemove",n="engine.name",m="touchcancel",l="mouseup",k="mousedown",d="mshtml",j="qx.event.handler.Touch",h="useraction",c="swipe",b="qx.mobile.nativescroll",g="webkit",f="tap",i="x",a="y";
qx.Class.define(j,{extend:qx.core.Object,implement:qx.event.IEventHandler,construct:function(u){qx.core.Object.call(this);
this.__x=u;
this.__cw=u.getWindow();
this.__cx=this.__cw.document;
this._initTouchObserver();
this._initMouseObserver();
},statics:{PRIORITY:qx.event.Registration.PRIORITY_NORMAL,SUPPORTED_TYPES:{touchstart:1,touchmove:1,touchend:1,touchcancel:1,tap:1,swipe:1},TARGET_CHECK:qx.event.IEventHandler.TARGET_DOMNODE+qx.event.IEventHandler.TARGET_DOCUMENT,IGNORE_CAN_HANDLE:true,MOUSE_TO_TOUCH_MAPPING:{"mousedown":"touchstart","mousemove":"touchmove","mouseup":"touchend"},SWIPE_DIRECTION:{x:["left","right"],y:["up","down"]},TAP_MAX_DISTANCE:qx.core.Environment.get("os.name")!="android"?10:40,SWIPE_MIN_DISTANCE:qx.core.Environment.get("os.name")!="android"?11:41,SWIPE_MIN_VELOCITY:0},members:{__cy:null,__cz:null,__x:null,__cw:null,__cx:null,__cA:null,__cB:null,__cC:null,__cD:null,__cE:false,__cF:null,canHandleEvent:function(v,w){},registerEvent:function(x,y,z){},unregisterEvent:function(A,B,C){},__cG:function(D){var E=qx.bom.Event.getTarget(D);
if((qx.core.Environment.get(n)==g)){if(E&&E.nodeType==3){E=E.parentNode;
}}return E;
},__cH:function(F,G,H,I){if(!H){H=this.__cG(F);
}var G=G||F.type;

if(H&&H.nodeType){qx.event.Registration.fireEvent(H,G,I||qx.event.type.Touch,[F,H,null,true,true]);
}qx.event.Registration.fireEvent(this.__cw,h,qx.event.type.Data,[G]);
},__cI:function(J,K,L){if(!L){L=this.__cG(J);
}var K=K||J.type;

if(K==r){this.__cJ(J,L);
}else if(K==q){this.__cK(J,L);
}else if(K==s){this.__cL(J,L);
}},__cJ:function(M,N){var O=M.changedTouches[0];
this.__cA=O.screenX;
this.__cB=O.screenY;
this.__cC=new Date().getTime();
this.__cD=M.changedTouches.length===1;
},__cK:function(P,Q){if(this.__cD&&P.changedTouches.length>1){this.__cD=false;
}},__cL:function(R,S){if(this.__cD){var T=R.changedTouches[0];
var V={x:T.screenX-this.__cA,y:T.screenY-this.__cB};
var W=qx.event.handler.Touch;

if(this.__cF==S&&Math.abs(V.x)<=W.TAP_MAX_DISTANCE&&Math.abs(V.y)<=W.TAP_MAX_DISTANCE){this.__cH(R,f,S,qx.event.type.Tap);
}else{var U=this.__cM(R,S,V);

if(U){R.swipe=U;
this.__cH(R,c,S,qx.event.type.Swipe);
}}}},__cM:function(X,Y,ba){var be=qx.event.handler.Touch;
var bf=new Date().getTime()-this.__cC;
var bh=(Math.abs(ba.x)>=Math.abs(ba.y))?i:a;
var bb=ba[bh];
var bc=be.SWIPE_DIRECTION[bh][bb<0?0:1];
var bg=(bf!==0)?bb/bf:0;
var bd=null;

if(Math.abs(bg)>=be.SWIPE_MIN_VELOCITY&&Math.abs(bb)>=be.SWIPE_MIN_DISTANCE){bd={startTime:this.__cC,duration:bf,axis:bh,direction:bc,distance:bb,velocity:bg};
}return bd;
},__cN:qx.core.Environment.select(t,{"true":function(bi){var bj=bi.type;
var bl=qx.event.handler.Touch.MOUSE_TO_TOUCH_MAPPING;

if(bl[bj]){bj=bl[bj];
if(bj==r&&this.__cO(bi)){this.__cE=true;
}else if(bj==s){this.__cE=false;
}var bm=this.__cP(bi);
var bk=(bj==s?[]:[bm]);
bi.touches=bk;
bi.targetTouches=bk;
bi.changedTouches=[bm];
}return bj;
},"default":qx.lang.Function.empty}),__cO:qx.core.Environment.select(t,{"true":function(bn){if((qx.core.Environment.get(n)==d)){var bo=1;
}else{var bo=0;
}return bn.button==bo;
},"default":qx.lang.Function.empty}),__cP:qx.core.Environment.select(t,{"true":function(bp){var bq=this.__cG(bp);
return {clientX:bp.clientX,clientY:bp.clientY,screenX:bp.screenX,screenY:bp.screenY,pageX:bp.pageX,pageY:bp.pageY,identifier:1,target:bq};
},"default":qx.lang.Function.empty}),_initTouchObserver:function(){this.__cy=qx.lang.Function.listener(this._onTouchEvent,this);
var Event=qx.bom.Event;
Event.addNativeListener(this.__cx,r,this.__cy);
Event.addNativeListener(this.__cx,q,this.__cy);
Event.addNativeListener(this.__cx,s,this.__cy);
Event.addNativeListener(this.__cx,m,this.__cy);
},_initMouseObserver:qx.core.Environment.select(t,{"true":function(){if(!qx.core.Environment.get(p)){this.__cz=qx.lang.Function.listener(this._onMouseEvent,this);
var Event=qx.bom.Event;
Event.addNativeListener(this.__cx,k,this.__cz);
Event.addNativeListener(this.__cx,o,this.__cz);
Event.addNativeListener(this.__cx,l,this.__cz);
}},"default":qx.lang.Function.empty}),_stopTouchObserver:function(){var Event=qx.bom.Event;
Event.removeNativeListener(this.__cx,r,this.__cy);
Event.removeNativeListener(this.__cx,q,this.__cy);
Event.removeNativeListener(this.__cx,s,this.__cy);
Event.removeNativeListener(this.__cx,m,this.__cy);
},_stopMouseObserver:qx.core.Environment.select(t,{"true":function(){if(!qx.core.Environment.get(p)){var Event=qx.bom.Event;
Event.removeNativeListener(this.__cx,k,this.__cz);
Event.removeNativeListener(this.__cx,o,this.__cz);
Event.removeNativeListener(this.__cx,l,this.__cz);
}},"default":qx.lang.Function.empty}),_onTouchEvent:qx.event.GlobalError.observeMethod(function(br){this._commonTouchEventHandler(br);
}),_onMouseEvent:qx.core.Environment.select(t,{"true":qx.event.GlobalError.observeMethod(function(bs){if(!qx.core.Environment.get(p)){if(bs.type==o&&!this.__cE){return;
}var bt=this.__cN(bs);
this._commonTouchEventHandler(bs,bt);
}}),"default":qx.lang.Function.empty}),_commonTouchEventHandler:function(bu,bv){var bv=bv||bu.type;

if(bv==r){this.__cF=this.__cG(bu);
}this.__cH(bu,bv);
this.__cI(bu,bv);
}},destruct:function(){this._stopTouchObserver();
this._stopMouseObserver();
this.__x=this.__cw=this.__cx=this.__cF=null;
},defer:function(bw){qx.event.Registration.addHandler(bw);
if(qx.core.Environment.get(p)){if(qx.core.Environment.get(b)==false){document.addEventListener(q,function(e){e.preventDefault();
});
}qx.event.Registration.getManager(document).getHandler(bw);
}}});
})();
(function(){var c="touchcancel",b="qx.event.type.Touch",a="touchend";
qx.Class.define(b,{extend:qx.event.type.Dom,members:{_cloneNativeEvent:function(d,e){var e=qx.event.type.Dom.prototype._cloneNativeEvent.call(this,d,e);
e.pageX=d.pageX;
e.pageY=d.pageY;
e.layerX=d.layerX;
e.layerY=d.layerY;
e.scale=d.scale;
e.rotation=d.rotation;
e.srcElement=d.srcElement;
e.targetTouches=[];

for(var i=0;i<d.targetTouches.length;i++){e.targetTouches[i]=d.targetTouches[i];
}e.changedTouches=[];

for(var i=0;i<d.changedTouches.length;i++){e.changedTouches[i]=d.changedTouches[i];
}e.touches=[];

for(var i=0;i<d.touches.length;i++){e.touches[i]=d.touches[i];
}return e;
},stop:function(){this.stopPropagation();
},getAllTouches:function(){return this._native.touches;
},getTargetTouches:function(){return this._native.targetTouches;
},getChangedTargetTouches:function(){return this._native.changedTouches;
},isMultiTouch:function(){return this.__gQ().length>1;
},getScale:function(){return this._native.scale;
},getRotation:function(){return this._native.rotation;
},getDocumentLeft:function(f){return this.__gP(f).pageX;
},getDocumentTop:function(g){return this.__gP(g).pageY;
},getScreenLeft:function(h){return this.__gP(h).screenX;
},getScreenTop:function(j){return this.__gP(j).screenY;
},getViewportLeft:function(k){return this.__gP(k).clientX;
},getViewportTop:function(l){return this.__gP(l).clientY;
},getIdentifier:function(m){return this.__gP(m).identifier;
},__gP:function(n){n=n==null?0:n;
return this.__gQ()[n];
},__gQ:function(){var o=(this._isTouchEnd()?this.getChangedTargetTouches():this.getTargetTouches());
return o;
},_isTouchEnd:function(){return (this.getType()==a||this.getType()==c);
}}});
})();
(function(){var a="qx.event.type.Tap";
qx.Class.define(a,{extend:qx.event.type.Touch,members:{_isTouchEnd:function(){return true;
}}});
})();
(function(){var a="qx.event.type.Swipe";
qx.Class.define(a,{extend:qx.event.type.Touch,members:{_cloneNativeEvent:function(b,c){var c=qx.event.type.Touch.prototype._cloneNativeEvent.call(this,b,c);
c.swipe=b.swipe;
return c;
},_isTouchEnd:function(){return true;
},getStartTime:function(){return this._native.swipe.startTime;
},getDuration:function(){return this._native.swipe.duration;
},getAxis:function(){return this._native.swipe.axis;
},getDirection:function(){return this._native.swipe.direction;
},getVelocity:function(){return this._native.swipe.velocity;
},getDistance:function(){return this._native.swipe.distance;
}}});
})();
(function(){var a="qx.event.handler.Capture";
qx.Class.define(a,{extend:qx.core.Object,implement:qx.event.IEventHandler,statics:{PRIORITY:qx.event.Registration.PRIORITY_NORMAL,SUPPORTED_TYPES:{capture:true,losecapture:true},TARGET_CHECK:qx.event.IEventHandler.TARGET_DOMNODE,IGNORE_CAN_HANDLE:true},members:{canHandleEvent:function(b,c){},registerEvent:function(d,e,f){},unregisterEvent:function(g,h,i){}},defer:function(j){qx.event.Registration.addHandler(j);
}});
})();
(function(){var k="alias",j="copy",i="blur",h="mouseout",g="keydown",f="Control",d="Shift",c="mousemove",b="move",a="mouseover",D="Alt",C="keyup",B="mouseup",A="keypress",z="dragend",y="on",x="mousedown",w="qxDraggable",v="Escape",u="drag",r="drop",s="qxDroppable",p="qx.event.handler.DragDrop",q="droprequest",n="dragstart",o="dragchange",l="dragleave",m="dragover",t="left";
qx.Class.define(p,{extend:qx.core.Object,implement:qx.event.IEventHandler,construct:function(E){qx.core.Object.call(this);
this.__x=E;
this.__cx=E.getWindow().document.documentElement;
this.__x.addListener(this.__cx,x,this._onMouseDown,this);
this.__id();
},statics:{PRIORITY:qx.event.Registration.PRIORITY_NORMAL,SUPPORTED_TYPES:{dragstart:1,dragend:1,dragover:1,dragleave:1,drop:1,drag:1,dragchange:1,droprequest:1},IGNORE_CAN_HANDLE:true},members:{__x:null,__cx:null,__hT:null,__hU:null,__H:null,__hV:null,__hW:null,__cQ:null,__hX:null,__hY:null,__ia:false,__ib:0,__ic:0,canHandleEvent:function(F,G){},registerEvent:function(H,I,J){},unregisterEvent:function(K,L,M){},addType:function(N){this.__H[N]=true;
},addAction:function(O){this.__hV[O]=true;
},supportsType:function(P){return !!this.__H[P];
},supportsAction:function(Q){return !!this.__hV[Q];
},getData:function(R){if(!this.__ij||!this.__hT){throw new Error("This method must not be used outside the drop event listener!");
}
if(!this.__H[R]){throw new Error("Unsupported data type: "+R+"!");
}
if(!this.__cQ[R]){this.__hX=R;
this.__cH(q,this.__hU,this.__hT,false);
}
if(!this.__cQ[R]){throw new Error("Please use a droprequest listener to the drag source to fill the manager with data!");
}return this.__cQ[R]||null;
},getCurrentAction:function(){return this.__hY;
},addData:function(S,T){this.__cQ[S]=T;
},getCurrentType:function(){return this.__hX;
},isSessionActive:function(){return this.__ia;
},__id:function(){this.__H={};
this.__hV={};
this.__hW={};
this.__cQ={};
},__ie:function(){if(this.__hU==null){return;
}var W=this.__hV;
var U=this.__hW;
var V=null;

if(this.__ij){if(U.Shift&&U.Control&&W.alias){V=k;
}else if(U.Shift&&U.Alt&&W.copy){V=j;
}else if(U.Shift&&W.move){V=b;
}else if(U.Alt&&W.alias){V=k;
}else if(U.Control&&W.copy){V=j;
}else if(W.move){V=b;
}else if(W.copy){V=j;
}else if(W.alias){V=k;
}}
if(V!=this.__hY){this.__hY=V;
this.__cH(o,this.__hU,this.__hT,false);
}},__cH:function(X,Y,ba,bb,bc){var be=qx.event.Registration;
var bd=be.createEvent(X,qx.event.type.Drag,[bb,bc]);

if(Y!==ba){bd.setRelatedTarget(ba);
}return be.dispatchEvent(Y,bd);
},__if:function(bf){while(bf&&bf.nodeType==1){if(bf.getAttribute(w)==y){return bf;
}bf=bf.parentNode;
}return null;
},__ig:function(bg){while(bg&&bg.nodeType==1){if(bg.getAttribute(s)==y){return bg;
}bg=bg.parentNode;
}return null;
},__ih:function(){this.__hU=null;
this.__x.removeListener(this.__cx,c,this._onMouseMove,this,true);
this.__x.removeListener(this.__cx,B,this._onMouseUp,this,true);
qx.event.Registration.removeListener(window,i,this._onWindowBlur,this);
this.__id();
},__ii:function(){if(this.__ia){this.__x.removeListener(this.__cx,a,this._onMouseOver,this,true);
this.__x.removeListener(this.__cx,h,this._onMouseOut,this,true);
this.__x.removeListener(this.__cx,g,this._onKeyDown,this,true);
this.__x.removeListener(this.__cx,C,this._onKeyUp,this,true);
this.__x.removeListener(this.__cx,A,this._onKeyPress,this,true);
this.__cH(z,this.__hU,this.__hT,false);
this.__ia=false;
}this.__ij=false;
this.__hT=null;
this.__ih();
},__ij:false,_onWindowBlur:function(e){this.__ii();
},_onKeyDown:function(e){var bh=e.getKeyIdentifier();

switch(bh){case D:case f:case d:if(!this.__hW[bh]){this.__hW[bh]=true;
this.__ie();
}}},_onKeyUp:function(e){var bi=e.getKeyIdentifier();

switch(bi){case D:case f:case d:if(this.__hW[bi]){this.__hW[bi]=false;
this.__ie();
}}},_onKeyPress:function(e){var bj=e.getKeyIdentifier();

switch(bj){case v:this.__ii();
}},_onMouseDown:function(e){if(this.__ia||e.getButton()!==t){return;
}var bk=this.__if(e.getTarget());

if(bk){this.__ib=e.getDocumentLeft();
this.__ic=e.getDocumentTop();
this.__hU=bk;
this.__x.addListener(this.__cx,c,this._onMouseMove,this,true);
this.__x.addListener(this.__cx,B,this._onMouseUp,this,true);
qx.event.Registration.addListener(window,i,this._onWindowBlur,this);
}},_onMouseUp:function(e){if(this.__ij){this.__cH(r,this.__hT,this.__hU,false,e);
}if(this.__ia){e.stopPropagation();
}this.__ii();
},_onMouseMove:function(e){if(this.__ia){if(!this.__cH(u,this.__hU,this.__hT,true,e)){this.__ii();
}}else{if(Math.abs(e.getDocumentLeft()-this.__ib)>3||Math.abs(e.getDocumentTop()-this.__ic)>3){if(this.__cH(n,this.__hU,this.__hT,true,e)){this.__ia=true;
this.__x.addListener(this.__cx,a,this._onMouseOver,this,true);
this.__x.addListener(this.__cx,h,this._onMouseOut,this,true);
this.__x.addListener(this.__cx,g,this._onKeyDown,this,true);
this.__x.addListener(this.__cx,C,this._onKeyUp,this,true);
this.__x.addListener(this.__cx,A,this._onKeyPress,this,true);
var bl=this.__hW;
bl.Control=e.isCtrlPressed();
bl.Shift=e.isShiftPressed();
bl.Alt=e.isAltPressed();
this.__ie();
}else{this.__cH(z,this.__hU,this.__hT,false);
this.__ih();
}}}},_onMouseOver:function(e){var bm=e.getTarget();
var bn=this.__ig(bm);

if(bn&&bn!=this.__hT){this.__ij=this.__cH(m,bn,this.__hU,true,e);
this.__hT=bn;
this.__ie();
}},_onMouseOut:function(e){var bp=this.__ig(e.getTarget());
var bo=this.__ig(e.getRelatedTarget());

if(bp&&bp!==bo&&bp==this.__hT){this.__cH(l,this.__hT,bo,false,e);
this.__hT=null;
this.__ij=false;
qx.event.Timer.once(this.__ie,this,0);
}}},destruct:function(){this.__hU=this.__hT=this.__x=this.__cx=this.__H=this.__hV=this.__hW=this.__cQ=null;
},defer:function(bq){qx.event.Registration.addHandler(bq);
}});
})();
(function(){var a="qx.event.type.Drag";
qx.Class.define(a,{extend:qx.event.type.Event,members:{init:function(b,c){qx.event.type.Event.prototype.init.call(this,true,b);

if(c){this._native=c.getNativeEvent()||null;
this._originalTarget=c.getTarget()||null;
}else{this._native=null;
this._originalTarget=null;
}return this;
},clone:function(d){var e=qx.event.type.Event.prototype.clone.call(this,d);
e._native=this._native;
return e;
},getDocumentLeft:function(){if(this._native==null){return 0;
}
if(this._native.pageX!==undefined){return this._native.pageX;
}else{var f=qx.dom.Node.getWindow(this._native.srcElement);
return this._native.clientX+qx.bom.Viewport.getScrollLeft(f);
}},getDocumentTop:function(){if(this._native==null){return 0;
}
if(this._native.pageY!==undefined){return this._native.pageY;
}else{var g=qx.dom.Node.getWindow(this._native.srcElement);
return this._native.clientY+qx.bom.Viewport.getScrollTop(g);
}},getManager:function(){return qx.event.Registration.getManager(this.getTarget()).getHandler(qx.event.handler.DragDrop);
},addType:function(h){this.getManager().addType(h);
},addAction:function(i){this.getManager().addAction(i);
},supportsType:function(j){return this.getManager().supportsType(j);
},supportsAction:function(k){return this.getManager().supportsAction(k);
},addData:function(l,m){this.getManager().addData(l,m);
},getData:function(n){return this.getManager().getData(n);
},getCurrentType:function(){return this.getManager().getCurrentType();
},getCurrentAction:function(){return this.getManager().getCurrentAction();
}}});
})();
(function(){var c="offline",b="online",a="qx.event.handler.Offline";
qx.Class.define(a,{extend:qx.core.Object,implement:qx.event.IEventHandler,construct:function(d){qx.core.Object.call(this);
this.__x=d;
this.__cw=d.getWindow();
this._initObserver();
},statics:{PRIORITY:qx.event.Registration.PRIORITY_NORMAL,SUPPORTED_TYPES:{online:true,offline:true},TARGET_CHECK:qx.event.IEventHandler.TARGET_WINDOW,IGNORE_CAN_HANDLE:true},members:{__x:null,__cw:null,__iv:null,canHandleEvent:function(e,f){},registerEvent:function(g,h,i){},unregisterEvent:function(j,k,l){},_initObserver:function(){this.__iv=qx.lang.Function.listener(this._onNative,this);
qx.bom.Event.addNativeListener(this.__cw,c,this.__iv);
qx.bom.Event.addNativeListener(this.__cw,b,this.__iv);
},_stopObserver:function(){qx.bom.Event.removeNativeListener(this.__cw,c,this.__iv);
qx.bom.Event.removeNativeListener(this.__cw,b,this.__iv);
},_onNative:qx.event.GlobalError.observeMethod(function(m){qx.event.Registration.fireEvent(this.__cw,m.type,qx.event.type.Event,[]);
}),isOnline:function(){return !!this.__cw.navigator.onLine;
}},destruct:function(){this.__x=null;
this._stopObserver();
delete qx.event.handler.Appear.__instances[this.$$hash];
},defer:function(n){qx.event.Registration.addHandler(n);
}});
})();
(function(){var r="engine.name",q="mshtml",p="",o=" ",n=">",m="<",k="='",h="none",g="<INPUT TYPE='RADIO' NAME='RADIOTEST' VALUE='Second Choice'>",f="qx.bom.Element",b="webkit",d="' ",c="div",a="></";
qx.Class.define(f,{statics:{__lz:{"onload":true,"onpropertychange":true,"oninput":true,"onchange":true,"name":true,"type":true,"checked":true,"disabled":true},__lA:{},__lB:{},allowCreationWithMarkup:function(s){if(!s){s=window;
}var t=s.location.href;

if(qx.bom.Element.__lB[t]==undefined){try{s.document.createElement(g);
qx.bom.Element.__lB[t]=true;
}catch(e){qx.bom.Element.__lB[t]=false;
}}return qx.bom.Element.__lB[t];
},getHelperElement:function(u){if(!u){u=window;
}var w=u.location.href;

if(!qx.bom.Element.__lA[w]){var v=qx.bom.Element.__lA[w]=u.document.createElement(c);
if(qx.core.Environment.get(r)==b){v.style.display=h;
u.document.body.appendChild(v);
}}return qx.bom.Element.__lA[w];
},create:function(name,x,y){if(!y){y=window;
}
if(!name){throw new Error("The tag name is missing!");
}var A=this.__lz;
var z=p;

for(var C in x){if(A[C]){z+=C+k+x[C]+d;
}}var D;
if(z!=p){if(qx.bom.Element.allowCreationWithMarkup(y)){D=y.document.createElement(m+name+o+z+n);
}else{var B=qx.bom.Element.getHelperElement(y);
B.innerHTML=m+name+o+z+a+name+n;
D=B.firstChild;
}}else{D=y.document.createElement(name);
}
for(var C in x){if(!A[C]){qx.bom.element.Attribute.set(D,C,x[C]);
}}return D;
},empty:function(E){return E.innerHTML=p;
},addListener:function(F,G,H,self,I){return qx.event.Registration.addListener(F,G,H,self,I);
},removeListener:function(J,K,L,self,M){return qx.event.Registration.removeListener(J,K,L,self,M);
},removeListenerById:function(N,O){return qx.event.Registration.removeListenerById(N,O);
},hasListener:function(P,Q,R){return qx.event.Registration.hasListener(P,Q,R);
},focus:function(S){qx.event.Registration.getManager(S).getHandler(qx.event.handler.Focus).focus(S);
},blur:function(T){qx.event.Registration.getManager(T).getHandler(qx.event.handler.Focus).blur(T);
},activate:function(U){qx.event.Registration.getManager(U).getHandler(qx.event.handler.Focus).activate(U);
},deactivate:function(V){qx.event.Registration.getManager(V).getHandler(qx.event.handler.Focus).deactivate(V);
},capture:function(W,X){qx.event.Registration.getManager(W).getDispatcher(qx.event.dispatch.MouseCapture).activateCapture(W,X);
},releaseCapture:function(Y){qx.event.Registration.getManager(Y).getDispatcher(qx.event.dispatch.MouseCapture).releaseCapture(Y);
},matchesSelector:function(ba,bb){if(bb){return qx.bom.Selector.query(bb,ba.parentNode).length>0;
}else{return false;
}},clone:function(bc,bd){var bg;

if(bd||((qx.core.Environment.get(r)==q)&&!qx.xml.Document.isXmlDocument(bc))){var bk=qx.event.Registration.getManager(bc);
var be=qx.dom.Hierarchy.getDescendants(bc);
be.push(bc);
}if((qx.core.Environment.get(r)==q)){for(var i=0,l=be.length;i<l;i++){bk.toggleAttachedEvents(be[i],false);
}}var bg=bc.cloneNode(true);
if((qx.core.Environment.get(r)==q)){for(var i=0,l=be.length;i<l;i++){bk.toggleAttachedEvents(be[i],true);
}}if(bd===true){var bn=qx.dom.Hierarchy.getDescendants(bg);
bn.push(bg);
var bf,bi,bm,bh;

for(var i=0,bl=be.length;i<bl;i++){bm=be[i];
bf=bk.serializeListeners(bm);

if(bf.length>0){bi=bn[i];

for(var j=0,bj=bf.length;j<bj;j++){bh=bf[j];
bk.addListener(bi,bh.type,bh.handler,bh.self,bh.capture);
}}}}return bg;
}}});
})();
(function(){var j="",i="undefined",h="engine.name",g="readOnly",f="accessKey",e="qx.bom.element.Attribute",d="rowSpan",c="vAlign",b="className",a="textContent",A="'",z="htmlFor",y="longDesc",x="cellSpacing",w="frameBorder",v="='",u="useMap",t="innerText",s="innerHTML",r="tabIndex",p="dateTime",q="maxLength",n="html.element.textcontent",o="mshtml",l="cellPadding",m="browser.documentmode",k="colSpan";
qx.Bootstrap.define(e,{statics:{__eH:{names:{"class":b,"for":z,html:s,text:qx.core.Environment.get(n)?a:t,colspan:k,rowspan:d,valign:c,datetime:p,accesskey:f,tabindex:r,maxlength:q,readonly:g,longdesc:y,cellpadding:l,cellspacing:x,frameborder:w,usemap:u},runtime:{"html":1,"text":1},bools:{compact:1,nowrap:1,ismap:1,declare:1,noshade:1,checked:1,disabled:1,readOnly:1,multiple:1,selected:1,noresize:1,defer:1,allowTransparency:1},property:{$$html:1,$$widget:1,disabled:1,checked:1,readOnly:1,multiple:1,selected:1,value:1,maxLength:1,className:1,innerHTML:1,innerText:1,textContent:1,htmlFor:1,tabIndex:1},qxProperties:{$$widget:1,$$html:1},propertyDefault:{disabled:false,checked:false,readOnly:false,multiple:false,selected:false,value:j,className:j,innerHTML:j,innerText:j,textContent:j,htmlFor:j,tabIndex:0,maxLength:qx.core.Environment.select(h,{"mshtml":2147483647,"webkit":524288,"default":-1})},removeableProperties:{disabled:1,multiple:1,maxLength:1},original:{href:1,src:1,type:1}},compile:function(B){var C=[];
var E=this.__eH.runtime;

for(var D in B){if(!E[D]){C.push(D,v,B[D],A);
}}return C.join(j);
},get:function(F,name){var H=this.__eH;
var G;
name=H.names[name]||name;
if(qx.core.Environment.get(h)==o&&parseInt(qx.core.Environment.get(m),10)<8&&H.original[name]){G=F.getAttribute(name,2);
}else if(H.property[name]){G=F[name];

if(typeof H.propertyDefault[name]!==i&&G==H.propertyDefault[name]){if(typeof H.bools[name]===i){return null;
}else{return G;
}}}else{G=F.getAttribute(name);
}if(H.bools[name]){return !!G;
}return G;
},set:function(I,name,J){if(typeof J===i){return;
}var K=this.__eH;
name=K.names[name]||name;
if(K.bools[name]){J=!!J;
}if(K.property[name]&&(!(I[name]===undefined)||K.qxProperties[name])){if(J==null){if(K.removeableProperties[name]){I.removeAttribute(name);
return;
}else if(typeof K.propertyDefault[name]!==i){J=K.propertyDefault[name];
}}I[name]=J;
}else{if(J===true){I.setAttribute(name,name);
}else if(J===false||J===null){I.removeAttribute(name);
}else{I.setAttribute(name,J);
}}},reset:function(L,name){this.set(L,name,null);
}}});
})();
(function(){var i="engine.name",h="losecapture",g="mshtml",f="blur",e="focus",d="click",c="qx.event.dispatch.MouseCapture",b="capture",a="scroll";
qx.Class.define(c,{extend:qx.event.dispatch.AbstractBubbling,construct:function(j,k){qx.event.dispatch.AbstractBubbling.call(this,j);
this.__cw=j.getWindow();
this.__de=k;
j.addListener(this.__cw,f,this.releaseCapture,this);
j.addListener(this.__cw,e,this.releaseCapture,this);
j.addListener(this.__cw,a,this.releaseCapture,this);
},statics:{PRIORITY:qx.event.Registration.PRIORITY_FIRST},members:{__de:null,__df:null,__dg:true,__cw:null,_getParent:function(l){return l.parentNode;
},canDispatchEvent:function(m,event,n){return !!(this.__df&&this.__dh[n]);
},dispatchEvent:function(o,event,p){if(p==d){event.stopPropagation();
this.releaseCapture();
return;
}
if(this.__dg||!qx.dom.Hierarchy.contains(this.__df,o)){o=this.__df;
}qx.event.dispatch.AbstractBubbling.prototype.dispatchEvent.call(this,o,event,p);
},__dh:{"mouseup":1,"mousedown":1,"click":1,"dblclick":1,"mousemove":1,"mouseout":1,"mouseover":1},activateCapture:function(q,r){var r=r!==false;

if(this.__df===q&&this.__dg==r){return;
}
if(this.__df){this.releaseCapture();
}this.nativeSetCapture(q,r);

if(this.hasNativeCapture){var self=this;
qx.bom.Event.addNativeListener(q,h,function(){qx.bom.Event.removeNativeListener(q,h,arguments.callee);
self.releaseCapture();
});
}this.__dg=r;
this.__df=q;
this.__de.fireEvent(q,b,qx.event.type.Event,[true,false]);
},getCaptureElement:function(){return this.__df;
},releaseCapture:function(){var s=this.__df;

if(!s){return;
}this.__df=null;
this.__de.fireEvent(s,h,qx.event.type.Event,[true,false]);
this.nativeReleaseCapture(s);
},hasNativeCapture:qx.core.Environment.get(i)==g,nativeSetCapture:qx.core.Environment.select(i,{"mshtml":function(t,u){t.setCapture(u!==false);
},"default":qx.lang.Function.empty}),nativeReleaseCapture:qx.core.Environment.select(i,{"mshtml":function(v){v.releaseCapture();
},"default":qx.lang.Function.empty})},destruct:function(){this.__df=this.__cw=this.__de=null;
},defer:function(w){qx.event.Registration.addDispatcher(w);
}});
})();
(function(){var c="qx.bom.Selector";
qx.Bootstrap.define(c,{statics:{query:null,matches:null}});
(function(){var o=/((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,v=0,x=Object.prototype.toString,p=false,z=true,t=/\\/g,g=/\W/;
[0,0].sort(function(){z=false;
return 0;
});
var s=function(B,C,D,E){D=D||[];
C=C||document;
var N=C;

if(C.nodeType!==1&&C.nodeType!==9){return [];
}
if(!B||typeof B!=="string"){return D;
}var m,H,F,J,L,I,O,i,P=true,G=s.isXML(C),K=[],M=B;
do{o.exec("");
m=o.exec(M);

if(m){M=m[3];
K.push(m[1]);

if(m[2]){J=m[3];
break;
}}}while(m);

if(K.length>1&&q.exec(B)){if(K.length===2&&k.relative[K[0]]){H=h(K[0]+K[1],C);
}else{H=k.relative[K[0]]?[C]:s(K.shift(),C);

while(K.length){B=K.shift();

if(k.relative[B]){B+=K.shift();
}H=h(B,H);
}}}else{if(!E&&K.length>1&&C.nodeType===9&&!G&&k.match.ID.test(K[0])&&!k.match.ID.test(K[K.length-1])){L=s.find(K.shift(),C,G);
C=L.expr?s.filter(L.expr,L.set)[0]:L.set[0];
}
if(C){L=E?{expr:K.pop(),set:f(E)}:s.find(K.pop(),K.length===1&&(K[0]==="~"||K[0]==="+")&&C.parentNode?C.parentNode:C,G);
H=L.expr?s.filter(L.expr,L.set):L.set;

if(K.length>0){F=f(H);
}else{P=false;
}
while(K.length){I=K.pop();
O=I;

if(!k.relative[I]){I="";
}else{O=K.pop();
}
if(O==null){O=C;
}k.relative[I](F,O,G);
}}else{F=K=[];
}}
if(!F){F=H;
}
if(!F){s.error(I||B);
}
if(x.call(F)==="[object Array]"){if(!P){D.push.apply(D,F);
}else if(C&&C.nodeType===1){for(i=0;F[i]!=null;i++){if(F[i]&&(F[i]===true||F[i].nodeType===1&&s.contains(C,F[i]))){D.push(H[i]);
}}}else{for(i=0;F[i]!=null;i++){if(F[i]&&F[i].nodeType===1){D.push(H[i]);
}}}}else{f(F,D);
}
if(J){s(J,N,D,E);
s.uniqueSort(D);
}return D;
};
s.uniqueSort=function(Q){if(u){p=z;
Q.sort(u);

if(p){for(var i=1;i<Q.length;i++){if(Q[i]===Q[i-1]){Q.splice(i--,1);
}}}}return Q;
};
s.matches=function(R,S){return s(R,null,null,S);
};
s.matchesSelector=function(T,U){return s(U,null,null,[T]).length>0;
};
s.find=function(V,W,X){var Y;

if(!V){return [];
}
for(var i=0,l=k.order.length;i<l;i++){var bb,ba=k.order[i];

if((bb=k.leftMatch[ba].exec(V))){var bc=bb[1];
bb.splice(1,1);

if(bc.substr(bc.length-1)!=="\\"){bb[1]=(bb[1]||"").replace(t,"");
Y=k.find[ba](bb,W,X);

if(Y!=null){V=V.replace(k.match[ba],"");
break;
}}}}
if(!Y){Y=typeof W.getElementsByTagName!=="undefined"?W.getElementsByTagName("*"):[];
}return {set:Y,expr:V};
};
s.filter=function(bd,be,bf,bg){var bt,bs,bh=bd,bn=[],bi=be,bj=be&&be[0]&&s.isXML(be[0]);

while(bd&&be.length){for(var br in k.filter){if((bt=k.leftMatch[br].exec(bd))!=null&&bt[2]){var bq,bm,bk=k.filter[br],bu=bt[1];
bs=false;
bt.splice(1,1);

if(bu.substr(bu.length-1)==="\\"){continue;
}
if(bi===bn){bn=[];
}
if(k.preFilter[br]){bt=k.preFilter[br](bt,bi,bf,bn,bg,bj);

if(!bt){bs=bq=true;
}else if(bt===true){continue;
}}
if(bt){for(var i=0;(bm=bi[i])!=null;i++){if(bm){bq=bk(bm,bt,i,bi);
var bo=bg^!!bq;

if(bf&&bq!=null){if(bo){bs=true;
}else{bi[i]=false;
}}else if(bo){bn.push(bm);
bs=true;
}}}}
if(bq!==undefined){if(!bf){bi=bn;
}bd=bd.replace(k.match[br],"");

if(!bs){return [];
}break;
}}}if(bd===bh){if(bs==null){s.error(bd);
}else{break;
}}bh=bd;
}return bi;
};
s.error=function(bv){throw "Syntax error, unrecognized expression: "+bv;
};
var k=s.selectors={order:["ID","NAME","TAG"],match:{ID:/#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,CLASS:/\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,NAME:/\[name=['"]*((?:[\w\u00c0-\uFFFF\-]|\\.)+)['"]*\]/,ATTR:/\[\s*((?:[\w\u00c0-\uFFFF\-]|\\.)+)\s*(?:(\S?=)\s*(?:(['"])(.*?)\3|(#?(?:[\w\u00c0-\uFFFF\-]|\\.)*)|)|)\s*\]/,TAG:/^((?:[\w\u00c0-\uFFFF\*\-]|\\.)+)/,CHILD:/:(only|nth|last|first)-child(?:\(\s*(even|odd|(?:[+\-]?\d+|(?:[+\-]?\d*)?n\s*(?:[+\-]\s*\d+)?))\s*\))?/,POS:/:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^\-]|$)/,PSEUDO:/:((?:[\w\u00c0-\uFFFF\-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/},leftMatch:{},attrMap:{"class":"className","for":"htmlFor"},attrHandle:{href:function(bw){return bw.getAttribute("href");
},type:function(bx){return bx.getAttribute("type");
}},relative:{"+":function(by,bz){var bA=typeof bz==="string",bC=bA&&!g.test(bz),bD=bA&&!bC;

if(bC){bz=bz.toLowerCase();
}
for(var i=0,l=by.length,bB;i<l;i++){if((bB=by[i])){while((bB=bB.previousSibling)&&bB.nodeType!==1){}by[i]=bD||bB&&bB.nodeName.toLowerCase()===bz?bB||false:bB===bz;
}}
if(bD){s.filter(bz,by,true);
}},">":function(bE,bF){var bH,bG=typeof bF==="string",i=0,l=bE.length;

if(bG&&!g.test(bF)){bF=bF.toLowerCase();

for(;i<l;i++){bH=bE[i];

if(bH){var parent=bH.parentNode;
bE[i]=parent.nodeName.toLowerCase()===bF?parent:false;
}}}else{for(;i<l;i++){bH=bE[i];

if(bH){bE[i]=bG?bH.parentNode:bH.parentNode===bF;
}}
if(bG){s.filter(bF,bE,true);
}}},"":function(bI,bJ,bK){var bN,bL=v++,bM=y;

if(typeof bJ==="string"&&!g.test(bJ)){bJ=bJ.toLowerCase();
bN=bJ;
bM=A;
}bM("parentNode",bJ,bL,bI,bN,bK);
},"~":function(bO,bP,bQ){var bT,bR=v++,bS=y;

if(typeof bP==="string"&&!g.test(bP)){bP=bP.toLowerCase();
bT=bP;
bS=A;
}bS("previousSibling",bP,bR,bO,bT,bQ);
}},find:{ID:function(bU,bV,bW){if(typeof bV.getElementById!=="undefined"&&!bW){var m=bV.getElementById(bU[1]);
return m&&m.parentNode?[m]:[];
}},NAME:function(bX,bY){if(typeof bY.getElementsByName!=="undefined"){var cb=[],ca=bY.getElementsByName(bX[1]);

for(var i=0,l=ca.length;i<l;i++){if(ca[i].getAttribute("name")===bX[1]){cb.push(ca[i]);
}}return cb.length===0?null:cb;
}},TAG:function(cc,cd){if(typeof cd.getElementsByTagName!=="undefined"){return cd.getElementsByTagName(cc[1]);
}}},preFilter:{CLASS:function(ce,cf,cg,ch,ci,cj){ce=" "+ce[1].replace(t,"")+" ";

if(cj){return ce;
}
for(var i=0,ck;(ck=cf[i])!=null;i++){if(ck){if(ci^(ck.className&&(" "+ck.className+" ").replace(/[\t\n\r]/g," ").indexOf(ce)>=0)){if(!cg){ch.push(ck);
}}else if(cg){cf[i]=false;
}}}return false;
},ID:function(cl){return cl[1].replace(t,"");
},TAG:function(cm,cn){return cm[1].replace(t,"").toLowerCase();
},CHILD:function(co){if(co[1]==="nth"){if(!co[2]){s.error(co[0]);
}co[2]=co[2].replace(/^\+|\s*/g,'');
var cp=/(-?)(\d*)(?:n([+\-]?\d*))?/.exec(co[2]==="even"&&"2n"||co[2]==="odd"&&"2n+1"||!/\D/.test(co[2])&&"0n+"+co[2]||co[2]);
co[2]=(cp[1]+(cp[2]||1))-0;
co[3]=cp[3]-0;
}else if(co[2]){s.error(co[0]);
}co[0]=v++;
return co;
},ATTR:function(cq,cr,cs,ct,cu,cv){var name=cq[1]=cq[1].replace(t,"");

if(!cv&&k.attrMap[name]){cq[1]=k.attrMap[name];
}cq[4]=(cq[4]||cq[5]||"").replace(t,"");

if(cq[2]==="~="){cq[4]=" "+cq[4]+" ";
}return cq;
},PSEUDO:function(cw,cx,cy,cz,cA){if(cw[1]==="not"){if((o.exec(cw[3])||"").length>1||/^\w/.test(cw[3])){cw[3]=s(cw[3],null,null,cx);
}else{var cB=s.filter(cw[3],cx,cy,true^cA);

if(!cy){cz.push.apply(cz,cB);
}return false;
}}else if(k.match.POS.test(cw[0])||k.match.CHILD.test(cw[0])){return true;
}return cw;
},POS:function(cC){cC.unshift(true);
return cC;
}},filters:{enabled:function(cD){return cD.disabled===false&&cD.type!=="hidden";
},disabled:function(cE){return cE.disabled===true;
},checked:function(cF){return cF.checked===true;
},selected:function(cG){if(cG.parentNode){cG.parentNode.selectedIndex;
}return cG.selected===true;
},parent:function(cH){return !!cH.firstChild;
},empty:function(cI){return !cI.firstChild;
},has:function(cJ,i,cK){return !!s(cK[3],cJ).length;
},header:function(cL){return (/h\d/i).test(cL.nodeName);
},text:function(cM){return "text"===cM.getAttribute('type');
},radio:function(cN){return "radio"===cN.type;
},checkbox:function(cO){return "checkbox"===cO.type;
},file:function(cP){return "file"===cP.type;
},password:function(cQ){return "password"===cQ.type;
},submit:function(cR){return "submit"===cR.type;
},image:function(cS){return "image"===cS.type;
},reset:function(cT){return "reset"===cT.type;
},button:function(cU){return "button"===cU.type||cU.nodeName.toLowerCase()==="button";
},input:function(cV){return (/input|select|textarea|button/i).test(cV.nodeName);
}},setFilters:{first:function(cW,i){return i===0;
},last:function(cX,i,cY,da){return i===da.length-1;
},even:function(db,i){return i%2===0;
},odd:function(dc,i){return i%2===1;
},lt:function(dd,i,de){return i<de[3]-0;
},gt:function(df,i,dg){return i>dg[3]-0;
},nth:function(dh,i,di){return di[3]-0===i;
},eq:function(dj,i,dk){return dk[3]-0===i;
}},filter:{PSEUDO:function(dl,dm,i,dn){var name=dm[1],dp=k.filters[name];

if(dp){return dp(dl,i,dm,dn);
}else if(name==="contains"){return (dl.textContent||dl.innerText||s.getText([dl])||"").indexOf(dm[3])>=0;
}else if(name==="not"){var dq=dm[3];

for(var j=0,l=dq.length;j<l;j++){if(dq[j]===dl){return false;
}}return true;
}else{s.error(name);
}},CHILD:function(dr,ds){var dy=ds[1],dt=dr;

switch(dy){case "only":case "first":while((dt=dt.previousSibling)){if(dt.nodeType===1){return false;
}}
if(dy==="first"){return true;
}dt=dr;
case "last":while((dt=dt.nextSibling)){if(dt.nodeType===1){return false;
}}return true;
case "nth":var dz=ds[2],dv=ds[3];

if(dz===1&&dv===0){return true;
}var dx=ds[0],parent=dr.parentNode;

if(parent&&(parent.sizcache!==dx||!dr.nodeIndex)){var du=0;

for(dt=parent.firstChild;dt;dt=dt.nextSibling){if(dt.nodeType===1){dt.nodeIndex=++du;
}}parent.sizcache=dx;
}var dw=dr.nodeIndex-dv;

if(dz===0){return dw===0;
}else{return (dw%dz===0&&dw/dz>=0);
}}},ID:function(dA,dB){return dA.nodeType===1&&dA.getAttribute("id")===dB;
},TAG:function(dC,dD){return (dD==="*"&&dC.nodeType===1)||dC.nodeName.toLowerCase()===dD;
},CLASS:function(dE,dF){return (" "+(dE.className||dE.getAttribute("class"))+" ").indexOf(dF)>-1;
},ATTR:function(dG,dH){var name=dH[1],dL=k.attrHandle[name]?k.attrHandle[name](dG):dG[name]!=null?dG[name]:dG.getAttribute(name),dK=dL+"",dJ=dH[2],dI=dH[4];
return dL==null?dJ==="!=":dJ==="="?dK===dI:dJ==="*="?dK.indexOf(dI)>=0:dJ==="~="?(" "+dK+" ").indexOf(dI)>=0:!dI?dK&&dL!==false:dJ==="!="?dK!==dI:dJ==="^="?dK.indexOf(dI)===0:dJ==="$="?dK.substr(dK.length-dI.length)===dI:dJ==="|="?dK===dI||dK.substr(0,dI.length+1)===dI+"-":false;
},POS:function(dM,dN,i,dO){var name=dN[2],dP=k.setFilters[name];

if(dP){return dP(dM,i,dN,dO);
}}}};
var q=k.match.POS,d=function(dQ,dR){return "\\"+(dR-0+1);
};

for(var w in k.match){k.match[w]=new RegExp(k.match[w].source+(/(?![^\[]*\])(?![^\(]*\))/.source));
k.leftMatch[w]=new RegExp(/(^(?:.|\r|\n)*?)/.source+k.match[w].source.replace(/\\(\d+)/g,d));
}var f=function(dS,dT){dS=Array.prototype.slice.call(dS,0);

if(dT){dT.push.apply(dT,dS);
return dT;
}return dS;
};
try{Array.prototype.slice.call(document.documentElement.childNodes,0)[0].nodeType;
}catch(e){f=function(dU,dV){var i=0,dW=dV||[];

if(x.call(dU)==="[object Array]"){Array.prototype.push.apply(dW,dU);
}else{if(typeof dU.length==="number"){for(var l=dU.length;i<l;i++){dW.push(dU[i]);
}}else{for(;dU[i];i++){dW.push(dU[i]);
}}}return dW;
};
}var u,n;

if(document.documentElement.compareDocumentPosition){u=function(a,b){if(a===b){p=true;
return 0;
}
if(!a.compareDocumentPosition||!b.compareDocumentPosition){return a.compareDocumentPosition?-1:1;
}return a.compareDocumentPosition(b)&4?-1:1;
};
}else{u=function(a,b){var ec,ea,ed=[],ee=[],dY=a.parentNode,eb=b.parentNode,dX=dY;
if(a===b){p=true;
return 0;
}else if(dY===eb){return n(a,b);
}else if(!dY){return -1;
}else if(!eb){return 1;
}while(dX){ed.unshift(dX);
dX=dX.parentNode;
}dX=eb;

while(dX){ee.unshift(dX);
dX=dX.parentNode;
}ec=ed.length;
ea=ee.length;
for(var i=0;i<ec&&i<ea;i++){if(ed[i]!==ee[i]){return n(ed[i],ee[i]);
}}return i===ec?n(a,ee[i],-1):n(ed[i],b,1);
};
n=function(a,b,ef){if(a===b){return ef;
}var eg=a.nextSibling;

while(eg){if(eg===b){return -1;
}eg=eg.nextSibling;
}return 1;
};
}s.getText=function(eh){var ej="",ei;

for(var i=0;eh[i];i++){ei=eh[i];
if(ei.nodeType===3||ei.nodeType===4){ej+=ei.nodeValue;
}else if(ei.nodeType!==8){ej+=s.getText(ei.childNodes);
}}return ej;
};
(function(){var em=document.createElement("div"),el="script"+(new Date()).getTime(),ek=document.documentElement;
em.innerHTML="<a name='"+el+"'/>";
ek.insertBefore(em,ek.firstChild);
if(document.getElementById(el)){k.find.ID=function(en,eo,ep){if(typeof eo.getElementById!=="undefined"&&!ep){var m=eo.getElementById(en[1]);
return m?m.id===en[1]||typeof m.getAttributeNode!=="undefined"&&m.getAttributeNode("id").nodeValue===en[1]?[m]:undefined:[];
}};
k.filter.ID=function(eq,er){var es=typeof eq.getAttributeNode!=="undefined"&&eq.getAttributeNode("id");
return eq.nodeType===1&&es&&es.nodeValue===er;
};
}ek.removeChild(em);
ek=em=null;
})();
(function(){var et=document.createElement("div");
et.appendChild(document.createComment(""));
if(et.getElementsByTagName("*").length>0){k.find.TAG=function(eu,ev){var ex=ev.getElementsByTagName(eu[1]);
if(eu[1]==="*"){var ew=[];

for(var i=0;ex[i];i++){if(ex[i].nodeType===1){ew.push(ex[i]);
}}ex=ew;
}return ex;
};
}et.innerHTML="<a href='#'></a>";

if(et.firstChild&&typeof et.firstChild.getAttribute!=="undefined"&&et.firstChild.getAttribute("href")!=="#"){k.attrHandle.href=function(ey){return ey.getAttribute("href",2);
};
}et=null;
})();

if(document.querySelectorAll){(function(){var eA=s,ez=document.createElement("div"),eB="__sizzle__";
ez.innerHTML="<p class='TEST'></p>";
if(ez.querySelectorAll&&ez.querySelectorAll(".TEST").length===0){return;
}s=function(eD,eE,eF,eG){eE=eE||document;
if(!eG&&!s.isXML(eE)){var eL=/^(\w+$)|^\.([\w\-]+$)|^#([\w\-]+$)/.exec(eD);

if(eL&&(eE.nodeType===1||eE.nodeType===9)){if(eL[1]){return f(eE.getElementsByTagName(eD),eF);
}else if(eL[2]&&k.find.CLASS&&eE.getElementsByClassName){return f(eE.getElementsByClassName(eL[2]),eF);
}}
if(eE.nodeType===9){if(eD==="body"&&eE.body){return f([eE.body],eF);
}else if(eL&&eL[3]){var eJ=eE.getElementById(eL[3]);
if(eJ&&eJ.parentNode){if(eJ.id===eL[3]){return f([eJ],eF);
}}else{return f([],eF);
}}
try{return f(eE.querySelectorAll(eD),eF);
}catch(eO){}}else if(eE.nodeType===1&&eE.nodeName.toLowerCase()!=="object"){var eN=eE,eI=eE.getAttribute("id"),eK=eI||eB,eH=eE.parentNode,eM=/^\s*[+~]/.test(eD);

if(!eI){eE.setAttribute("id",eK);
}else{eK=eK.replace(/'/g,"\\$&");
}
if(eM&&eH){eE=eE.parentNode;
}
try{if(!eM||eH){return f(eE.querySelectorAll("[id='"+eK+"'] "+eD),eF);
}}catch(eP){}finally{if(!eI){eN.removeAttribute("id");
}}}}return eA(eD,eE,eF,eG);
};

for(var eC in eA){s[eC]=eA[eC];
}ez=null;
})();
}(function(){var eS=document.documentElement,eQ=eS.matchesSelector||eS.mozMatchesSelector||eS.webkitMatchesSelector||eS.msMatchesSelector,eR=false;

try{eQ.call(document.documentElement,"[test!='']:sizzle");
}catch(eT){eR=true;
}
if(eQ){s.matchesSelector=function(eU,eV){eV=eV.replace(/\=\s*([^'"\]]*)\s*\]/g,"='$1']");

if(!s.isXML(eU)){try{if(eR||!k.match.PSEUDO.test(eV)&&!/!=/.test(eV)){return eQ.call(eU,eV);
}}catch(e){}}return s(eV,null,null,[eU]).length>0;
};
}})();
(function(){var eW=document.createElement("div");
eW.innerHTML="<div class='test e'></div><div class='test'></div>";
if(!eW.getElementsByClassName||eW.getElementsByClassName("e").length===0){return;
}eW.lastChild.className="e";

if(eW.getElementsByClassName("e").length===1){return;
}k.order.splice(1,0,"CLASS");
k.find.CLASS=function(eX,eY,fa){if(typeof eY.getElementsByClassName!=="undefined"&&!fa){return eY.getElementsByClassName(eX[1]);
}};
eW=null;
})();
function A(fb,fc,fd,fe,ff,fg){for(var i=0,l=fe.length;i<l;i++){var fi=fe[i];

if(fi){var fh=false;
fi=fi[fb];

while(fi){if(fi.sizcache===fd){fh=fe[fi.sizset];
break;
}
if(fi.nodeType===1&&!fg){fi.sizcache=fd;
fi.sizset=i;
}
if(fi.nodeName.toLowerCase()===fc){fh=fi;
break;
}fi=fi[fb];
}fe[i]=fh;
}}}function y(fj,fk,fl,fm,fn,fo){for(var i=0,l=fm.length;i<l;i++){var fq=fm[i];

if(fq){var fp=false;
fq=fq[fj];

while(fq){if(fq.sizcache===fl){fp=fm[fq.sizset];
break;
}
if(fq.nodeType===1){if(!fo){fq.sizcache=fl;
fq.sizset=i;
}
if(typeof fk!=="string"){if(fq===fk){fp=true;
break;
}}else if(s.filter(fk,[fq]).length>0){fp=fq;
break;
}}fq=fq[fj];
}fm[i]=fp;
}}}
if(document.documentElement.contains){s.contains=function(a,b){return a!==b&&(a.contains?a.contains(b):true);
};
}else if(document.documentElement.compareDocumentPosition){s.contains=function(a,b){return !!(a.compareDocumentPosition(b)&16);
};
}else{s.contains=function(){return false;
};
}s.isXML=function(fr){var fs=(fr?fr.ownerDocument||fr:0).documentElement;
return fs?fs.nodeName!=="HTML":false;
};
var h=function(ft,fu){var fy,fw=[],fv="",fx=fu.nodeType?[fu]:fu;
while((fy=k.match.PSEUDO.exec(ft))){fv+=fy[0];
ft=ft.replace(k.match.PSEUDO,"");
}ft=k.relative[ft]?ft+"*":ft;

for(var i=0,l=fx.length;i<l;i++){s(ft,fx[i],fw);
}return s.filter(fv,fw);
};
var r=qx.bom.Selector;
r.query=function(fz,fA){return s(fz,fA);
};
r.matches=function(fB,fC){return s(fB,null,null,fC);
};
})();
})();
(function(){var a="qx.event.type.Focus";
qx.Class.define(a,{extend:qx.event.type.Event,members:{init:function(b,c,d){qx.event.type.Event.prototype.init.call(this,d,false);
this._target=b;
this._relatedTarget=c;
return this;
}}});
})();
(function(){var p="String",o="qx.event.type.Event",n="_applyAutUri",m="changeSelectedTests",l="abstract",k="changeAutUri",j="",i="_applyTestCount",h="changeTestCount",g="changeState",c="_applyTestModel",f="changeTestSuiteState",e="init",b="_applyStatus",a="_applyTestSuiteState",d="testrunner.view.Abstract";
qx.Class.define(d,{type:l,extend:qx.core.Object,events:{runTests:o,stopTests:o},properties:{status:{init:j,check:p,apply:b},testSuiteState:{init:e,apply:a,event:f},testCount:{init:null,nullable:true,apply:i,event:h},testModel:{init:null,nullable:true,apply:c},selectedTests:{init:null,nullable:true,event:m},autUri:{check:p,nullable:true,event:k,apply:n}},members:{addTestResult:function(q){q.addListener(g,function(r){this._onTestChangeState(q);
},this);
},_onTestChangeState:function(s){this.error("Missing implementation of _onTestChangeState!");
},_applyStatus:function(t,u){this.info(t);
},_applyTestSuiteState:function(v,w){this.info("Test suite state: "+v);
},_applyTestCount:function(x,y){this.info(x+" tests pending.");
},_applyTestModel:function(z,A){this.error("Missing implementation of _applyTestModel!");
},_applyAutUri:function(B,C){}},destruct:function(){this.removeAllBindings();
}});
})();
(function(){var b="Boolean",a="testrunner.view.MAutoRun";
qx.Mixin.define(a,{construct:function(){var c=qx.util.Uri.parseUri(location.href,true);

if(c.queryKey&&c.queryKey.autorun){this.setAutoRun(true);
}},properties:{autoRun:{check:b,init:false}}});
})();
(function(){var bR="div",bQ="",bP="none",bO="disabled",bN="checked",bM="framelogcontainer",bL="display",bK="change",bJ="block",bI="checkbox",bu="testscontainer",bt="li",bs="input",br="cb_",bq="execute",bp="controls",bo="error",bn="class",bm="click",bl="Integer",bY="skip",ca="#stop",bW="ul",bX="test",bU="ready",bV="testFilter",bS="togglealltests",bT="#",cb="type",cc="success",bB="togglestack",bA="#testfilter,",bD="Boolean",bC="finished",bF="failure",bE="#togglealltests, ",bH="running",bG="togglepassed",bz="selectedTests",by='<p id="status"></p>',a="^.*",b="iframesrc",c='<label for="togglestack">Show stack trace</label>',d="loading",e="<h1>qooxdoo Test Runner</h1>",f="Test suite finished. ",g="testfilter",h="footer",j=" Passed: ",k="testcontrols",cg="t_",cf=" Skipped: ",ce="Invalid test file selected!",cd="resultslist",ck='<label for="togglepassed">Show successful tests</label>',cj='<label for="togglealltests">Select/deselect all listed tests</label>',ci="Running tests...",ch='<ul id="testlist"></ul>',cm='<input type="text" id="iframesrc"></input>',cl='<input type="submit" title="Reload the test suite (Ctrl+Shift+R)" id="setiframesrc" value="Reload"></input>',K='body{margin:0;padding:0;font-family:"Lucida Sans Unicode",Arial,"sans-serif";font-size:.9em}div{margin:0;padding:0}h1{font-size:1.3em;padding:8px 10px;margin:0 0 15px 0;background-color:#E8E8E8;border-bottom:1px solid #B5B5B5;color:#000;font-weight:bold;text-shadow:0 1px 1px #fff}input[type=submit]{color:#fff;background-color:#B5B5B5;font-weight:bold;padding:6px;-moz-border-radius:4px;-webkit-border-radius:4px;border-radius:4px;border-width:0}input[type=text]{border:1px solid #B5B5B5;-moz-border-radius:4px;-webkit-border-radius:4px;border-radius:4px;padding:2px}input[type=checkbox]{margin:5px 8px}.monotype{font-family:Inconsolata,Consolas,"Courier New",Courier,monotype}#controls{margin:0 10px 15px 10px}#run{margin-right:10px;background-color:#007F00}#run:disabled{background-color:#659E67;color:#fff!important}#stop{margin-right:10px;background-color:#9E0000}#stop:disabled{background-color:#9E5E5E;color:#fff!important}#framelogcontainer{height:150px;margin:0 10px 10px 10px}#framecontainer{height:150px;float:left;width:50%}#log{width:49%;height:150px;float:right;overflow:auto;border:1px solid #B5B5B5}#autframe{display:inline-block;border:1px solid #B5B5B5;margin-top:5px;max-height:120px;width:99%}#iframesrc{width:83%;margin-right:10px}#setiframesrc{background-color:#777;padding-top:2px;padding-bottom:2px}#testcontrols{clear:both;padding:0 10px 0 10px;margin-bottom:10px}#testcontrols input{margin-left:10px}#testscontainer{}#tests{float:left;width:50%;padding-bottom:30px}#tests ul{border-top:1px solid #E5E5E5;margin:0;padding:0;list-style-type:none}#tests ul li{border-bottom:1px solid #E5E5E5;border-top:1px solid #fff;background-color:#F4F4F4}#results{float:right;width:49%;margin:0 0 30px 0}#results ul{margin:0;padding:0;list-style-type:none}#results ul li{margin:0 0 2px 0;padding:2px;font-weight:bold;color:#134275}#results ul li ul li{margin:3px 0 3px 10px}.stacktrace{font-weight:normal}.success{background-color:#FAFFED;border-left:2px solid #DEFF83}.t_success{color:#007F00}.wait{background-color:#FFFBC4;border-left:2px solid #FFFFD8}.t_wait{color:#FF7F00}.skip{background-color:#F4F4F4;border-left:2px solid #E5E5E5;color:#6EA4BC}.t_skip{color:#666}.failure,.error{background-color:#FEF4F4;border-left:2px solid #9D1111}.t_failure,.t_error{color:#9E0000}#aut iframe{width:100%}#footer{position:fixed;bottom:0;width:100%;background-color:#E8E8E8;border-top:1px solid #B5B5B5;color:#000}#status{margin:6px 8px}#status .error{color:#F00}',L="#testlist ",I="autframe",J="aborted",O="results",P='<label for="testfilter">Filter tests</label>',M=".success",N="_applyShowStack",G="#testlist input:checkbox",H="ig",t="[for=cb_",s="framecontainer",v="#testlist li label",u="testlist",p="stopTests",o="Ctrl+Shift+R",r=".*",q="Test run stopped",n="testrunner/view/html/css/testrunner.css",m="aut",U="stop",V="run",W="tests",X=".stacktrace",Q="monotype",R="runTests",S=" tests pending",T="#cb_",Y="testrunner.view.Html",ba="#run",D='<ul id="resultslist" class="monotype"></ul>',C="status",B="Test suite ready",A="Ctrl+R",z='<input type="submit" title="Run selected tests (Ctrl+R)" id="run" value="Run Tests"></input>',y="_applyShowPassed",x="init",w=" tests ready to run",F="interval",E="#run, ",bb="setiframesrc",bc='<input type="submit" title="Stop the test suite (Ctrl+S)" id="stop" value="Stop Tests"></input>',bd="]",be="stacktrace",bf="Ctrl+S",bg=" Failed: ",bh='<input type="text" id="testfilter" />',bi='<li><input checked="checked" type="checkbox" id="{{id}}"><label for="{{id}}">{{name}}</label></li>',bj="log",bk='Stack Trace:<br/>',bx="fullName",bw="Waiting for tests",bv="Loading tests...";
qx.Class.define(Y,{extend:testrunner.view.Abstract,include:[testrunner.view.MAutoRun],construct:function(cn){this.__wd={rootElement:cn||document.body};
if(!false&&true){qx.bom.Stylesheet.createElement(K);
}else{var co=qx.util.ResourceManager.getInstance().toUri(n);
qx.bom.Stylesheet.includeFile(co);
}this._attachHeader();
this._attachMainControls();
this._attachTestControls();
this._attachTestList();
this._attachResultsList();
this._attachFooter();
this._makeCommands();
this.__we={};
},properties:{showStack:{check:bD,init:true,apply:N},showPassed:{check:bD,init:null,nullable:true,apply:y},failedTestCount:{check:bl,init:0},successfulTestCount:{check:bl,init:0},skippedTestCount:{check:bl,init:0}},members:{__wd:null,__wf:null,__wg:null,__wh:null,__wi:null,__we:null,_attachHeader:function(){this.__wd.rootElement.innerHTML+=e;
},_attachMainControls:function(){var cq=document.createElement(bR);
cq.id=bp;
cq.innerHTML=z;
cq.innerHTML+=bc;
var cr=qx.bom.Input.create(bI,{id:bB,checked:bN});
cq.appendChild(cr);
cq.innerHTML+=c;
var cp=qx.bom.Input.create(bI,{id:bG,checked:bN});
cq.appendChild(cp);
cq.innerHTML+=ck;
this.__wd.rootElement.appendChild(cq);
this.__wd.runButton=document.getElementById(V);
qx.event.Registration.addListener(this.__wd.runButton,bm,this.__wj,this);
this.__wd.stopButton=document.getElementById(U);
qx.event.Registration.addListener(this.__wd.stopButton,bm,this.__wk,this);
var cr=document.getElementById(bB);
qx.event.Registration.addListener(cr,bK,function(cs){this.setShowStack(cs.getData());
},this);
var cp=document.getElementById(bG);
qx.event.Registration.addListener(cp,bK,function(ct){this.setShowPassed(ct.getData());
},this);
},_attachTestControls:function(){var cu=document.createElement(bR);
cu.id=k;
var cv=qx.bom.Input.create(bI,{id:bS,checked:bN});
cu.innerHTML+=P;
cu.innerHTML+=bh;
cu.appendChild(cv);
cu.innerHTML+=cj;
this.__wd.rootElement.appendChild(cu);
this.__wd.allTestsToggle=document.getElementById(bS);
qx.event.Registration.addListener(this.__wd.allTestsToggle,bK,function(cw){var cx=cw.getTarget().checked;
this.toggleAllTests(cx,true);
},this);
this.__wg=new qx.event.Timer(500);
this.__wg.addListener(F,function(cy){var cz=this.__wd.filterInput.value;
this.__wg.stop();
this.filterTests(cz);
},this);
this.__wd.filterInput=document.getElementById(g);
qx.event.Registration.addListener(this.__wd.filterInput,bs,function(cA){this.__wg.restart();
},this);
},_attachTestList:function(){var parent=document.getElementById(bu);

if(!parent){parent=document.createElement(bR);
parent.id=bu;
this.__wd.rootElement.appendChild(parent);
}var cB=document.createElement(bR);
cB.id=W;
cB.innerHTML+=ch;
parent.appendChild(cB);
this.__wd.elemTestList=document.getElementById(u);
},_attachResultsList:function(){var parent=document.getElementById(bu);

if(!parent){parent=document.createElement(bR);
parent.id=bu;
this.__wd.rootElement.appendChild(parent);
}var cC=document.createElement(bR);
cC.id=O;
cC.innerHTML=D;
parent.appendChild(cC);
this.__wd.elemResultsList=document.getElementById(cd);
},_attachFooter:function(){var cD=document.createElement(bR);
cD.id=h;
cD.innerHTML=by;
this.__wd.rootElement.appendChild(cD);
this.__wd.elemStatus=document.getElementById(C);
},clearResults:function(){this.__wd.elemResultsList.innerHTML=bQ;
$(v).setAttribute(bn,bQ);
},clearTestList:function(){this.__wd.elemTestList.innerHTML=bQ;
},__wj:function(){if(this.getTestSuiteState()==bC){this.reset();
}this.fireEvent(R);
},__wk:function(){this.fireEvent(p);
},__wl:function(){var cE=this.__wd.iframeSourceInput.value;
this.resetAutUri();
this.setAutUri(cE);
},getIframe:function(){if(this.__wd.elemIframe){return this.__wd.elemIframe;
}var parent=document.getElementById(bM);

if(!parent){parent=document.createElement(bR);
parent.id=bM;
var cI=document.getElementById(bp);
qx.dom.Element.insertAfter(parent,cI);
}var cF=document.createElement(bR);
cF.id=s;
parent.appendChild(cF);
cF.innerHTML+=cm;
cF.innerHTML+=cl;
var cG=document.createElement(bR);
cG.id=m;
this.__wd.elemIframe=qx.bom.Iframe.create({id:I});
cF.appendChild(this.__wd.elemIframe);
this.__wd.iframeSourceInput=document.getElementById(b);
var cH=document.getElementById(bb);
qx.event.Registration.addListener(cH,bm,this.__wl,this);
return this.__wd.elemIframe;
},getLogAppenderElement:function(){if(this.__wd.elemLogAppender){return this.__wd.elemLogAppender;
}var parent=document.getElementById(bM);

if(!parent){parent=document.createElement(bR);
parent.id=bM;
var cK=document.getElementById(bp);
qx.dom.Element.insertAfter(parent,cK);
}var cJ=this.__wd.elemLogAppender=document.createElement(bR);
cJ.id=bj;
cJ.className=Q;
parent.appendChild(cJ);
return this.__wd.elemLogAppender;
},toggleAllTests:function(cL,cM){var cO=[];
var cN=document.getElementsByTagName(bs);

for(var i=0,l=cN.length;i<l;i++){if(cN[i].type==bI&&cN[i].id.indexOf(br)==0){if(cM&&cN[i].parentNode.style.display==bP){continue;
}cN[i].checked=cL;
var cP=this.__wf[cN[i].id.substr(3)];
cO.push(cP);
}}this.__wo(cO,cL);
},filterTests:function(cQ){var cV=new RegExp(a+cQ+r,H);
var cT=[];

for(var i=0,l=this.__wi.length;i<l;i++){if(this.__wi[i].match(cV)){cT.push(this.__wi[i]);
}}this.toggleAllTests(false,false);
this.hideAllTestListEntries();

if(cT.length>0){var cW=[];

for(var i=0,l=cT.length;i<l;i++){var cU=this.__wm(cT[i]);
var cS=br+cU;
var cR=document.getElementById(cS);
cR.parentNode.style.display=bJ;

if(this.__wd.allTestsToggle.checked){cR.checked=true;
cW.push(cT[i]);
}}this.__wo(cW,true);
}qx.bom.Cookie.set(bV,cQ);
},hideAllTestListEntries:function(){var cX=qx.bom.Selector.query(bt,this.__wd.elemTestList);

for(var i=0,l=cX.length;i<l;i++){cX[i].style.display=bP;
}},__wm:function(cY){var da=cY.replace(/[\W]/ig,bQ);
return da;
},reset:function(){this.resetFailedTestCount();
this.resetSuccessfulTestCount();
this.resetSkippedTestCount();
this.clearResults();
this.__we={};
var db=this.getSelectedTests();
if(db.length>0){db.push(db.pop());
}},_onTestChangeState:function(dc){var de=dc.getFullName();
var dh=dc.getState();

switch(dh){case bY:if(!this.__we[de]){this.__we[de]=dh;
this.setSkippedTestCount(this.getSkippedTestCount()+1);
}break;
case bo:case bF:if(!this.__we[de]){this.__we[de]=dh;
this.setFailedTestCount(this.getFailedTestCount()+1);
}break;
case cc:if(!this.__we[de]){this.__we[de]=dh;
this.setSuccessfulTestCount(this.getSuccessfulTestCount()+1);
}}var dl=dc.getExceptions();
var dj=this.__wm(de);
this._markTestInList(de,dh);
var di=document.getElementById(dj);

if(di){qx.bom.element.Attribute.set(di,bn,dh);
qx.bom.Collection.create(di).children(bW).destroy();
}else{var dg=qx.bom.Element.create(bt,{id:dj,"class":dh});

if(this.__wd.elemResultsList.firstChild){qx.dom.Element.insertBefore(dg,this.__wd.elemResultsList.firstChild);
}else{this.__wd.elemResultsList.appendChild(dg);
}dg.innerHTML=de;
di=document.getElementById(dj);
}
if(dh==cc&&this.getShowPassed()===false){qx.bom.element.Style.set(di,bL,bP);
}
if((dh==bo||dh==bF||dh==bY)&&dl&&dl.length>0){var df=document.createElement(bW);

for(var i=0,l=dl.length;i<l;i++){var dk=dl[i].exception;
var dp=document.createElement(bt);
dp.innerHTML+=dk;
var dd=dc.getStackTrace(dk);

if(dd.length>0){var dm=document.createElement(bR);
qx.bom.element.Class.add(dm,be);
dm.innerHTML=bk+dd;
var dn=this.getShowStack()?bJ:bP;
qx.bom.element.Style.set(dm,bL,dn);
dp.appendChild(dm);
}df.appendChild(dp);
}di.appendChild(df);
}},_markTestInList:function(dq,dr){var ds=this.__wm(dq);
var dt=t+ds+bd;
$(dt).setAttribute(bn,bQ);
$(dt).addClass(cg+dr);
},__wn:function(du){var dw=this.__wf[du.getTarget().id.substr(3)];
var dv=du.getTarget().checked;
this.__wo([dw],dv);
},__wo:function(dx,dy){var dC=this.getSelectedTests().copy();

for(var i=0,l=dx.length;i<l;i++){var dA=dx[i];
var dB=this._listContainsTest(dC,dA);

if(dy&&!dB){var dz=testrunner.runner.ModelUtil.getItemsByProperty(this.__wh,bx,dA)[0];
dC.push(dz);
}else if(!dy&&dB){this._removeTestFromList(dC,dA);
}}this.setSelectedTests(dC);
this._writeCookie();
},_writeCookie:function(){var dD=this.getSelectedTests();
var dE=[];

for(var i=0,l=dD.length;i<l;i++){dE.push(dD.getItem(i).getFullName());
}qx.bom.Cookie.set(bz,dE.join(bT));
},_applyStatus:function(dF,dG){if(!dF[0]||(dF===dG)){return;
}this.__wd.elemStatus.innerHTML=dF;
},_applyTestSuiteState:function(dH,dI){switch(dH){case x:this.setStatus(bw);
break;
case d:this.setStatus(bv);
$(bA+bE+E+ca).setAttribute(bO,bO);
break;
case bU:this.setStatus(B);
var dK=qx.bom.Cookie.get(bV);

if(dK){this.__wd.filterInput.value=dK;
this.filterTests(dK);
}else{this._applyTestCount(this.getTestCount());
}$(bA+bE+ba).setAttribute(bO,bQ);
$(ca).setAttribute(bO,bO);
this.setFailedTestCount(0);
this.setSuccessfulTestCount(0);

if(this.getAutoRun()){this.__wj();
}break;
case bH:this.setStatus(ci);
this.__wd.filterInput.disabled=true;
this.__wd.allTestsToggle.disabled=true;
this.__wd.runButton.disabled=true;
this.__wd.stopButton.disabled=false;
break;
case bC:var dJ=f;
dJ+=j+this.getSuccessfulTestCount();
dJ+=bg+this.getFailedTestCount();
dJ+=cf+this.getSkippedTestCount();
this.setStatus(dJ);
this.__wd.filterInput.disabled=false;
this.__wd.allTestsToggle.disabled=false;
this.__wd.runButton.disabled=false;
this.__wd.stopButton.disabled=true;
break;
case J:this.setStatus(q);
this.__wd.filterInput.disabled=false;
this.__wd.allTestsToggle.disabled=false;
this.__wd.runButton.disabled=false;
this.__wd.stopButton.disabled=true;
break;
case bo:this.setStatus(ce);
this.__wd.filterInput.disabled=false;
this.__wd.allTestsToggle.disabled=false;
this.__wd.runButton.disabled=false;
this.__wd.stopButton.disabled=true;
break;
}},_applyTestModel:function(dL,dM){if(dL==null){return;
}this.__wh=dL;
var dN=testrunner.runner.ModelUtil.getItemsByProperty(dL,cb,bX);
this.setSelectedTests(new qx.data.Array());
this.__wf={};
this.clearTestList();
this.clearResults();
this.__wi=[];

for(var i=0,l=dN.length;i<l;i++){this.__wi.push(dN[i].getFullName());
}this._createTestList(this.__wi);
this._applyCookieSelection();
},_applyCookieSelection:function(){var dP=qx.bom.Cookie.get(bz);

if(dP){var dP=dP.split(bT);
var dR=[];

for(var i=0,l=dP.length;i<l;i++){var dQ=testrunner.runner.ModelUtil.getItemByFullName(this.__wh,dP[i]);

if(dQ){dR.push(dQ.getFullName());
}}
if(dR.length>0){this.toggleAllTests(false);
this.__wo(dR,true);

for(var i=0,l=dR.length;i<l;i++){this._setTestChecked(dR[i],true);
}}}else{var dO=testrunner.runner.ModelUtil.getItemsByProperty(this.__wh,cb,bX);
this.getSelectedTests().append(dO);
}},_setTestChecked:function(dS,dT){var dV=dT?bN:bQ;
var dU=dS?T+this.__wm(dS):bs;
qx.bom.Collection.query(L+dU).setAttribute(bN,dV);
},_removeTestFromList:function(dW,dX){for(var i=0,l=dW.length;i<l;i++){if(dW.getItem(i).getFullName()===dX){dW.remove(dW.getItem(i));
return;
}}},_listContainsTest:function(dY,ea){for(var i=0,l=dY.length;i<l;i++){if(dY.getItem(i).getFullName()===ea){return true;
}}return false;
},_createTestList:function(eb){var ec=bi;

for(var i=0,l=eb.length;i<l;i++){var ed=eb[i];
var ee=this.__wm(ed);
this.__wf[ee]=ed;
var ef=qx.bom.Template.toHtml(ec,{id:br+ee,name:ed});
this.__wd.elemTestList.innerHTML+=ef;
}$(G).addListener(bK,this.__wn,this);
},_applyTestCount:function(eg,eh){if(eg==null){return;
}var ei=this.getTestSuiteState();

switch(ei){case bU:this.setStatus(eg+w);
break;
case bH:this.setStatus(eg+S);
break;
}},_applyAutUri:function(ej,ek){if(!ej||ej==ek){return;
}this.__wd.iframeSourceInput.value=ej;
qx.bom.Iframe.setSource(this.__wd.elemIframe,ej);
},_applyShowStack:function(el,em){if(el==em){return;
}$(X).setStyle(bL,el?bJ:bP);
},_applyShowPassed:function(en,eo){if(en===null||en===eo){return;
}$(M).setStyle(bL,en?bJ:bP);
},_makeCommands:function(){var er=new qx.ui.core.Command(A);
er.addListener(bq,this.__wj,this);
var eq=new qx.ui.core.Command(bf);
eq.addListener(bq,this.__wk,this);
var ep=new qx.ui.core.Command(o);
ep.addListener(bq,this.__wl,this);
}}});
})();
(function(){var m="input",k="engine.name",j="change",h="text",g="textarea",f="password",d="engine.version",c="radio",b="checkbox",a="keypress",A="browser.documentmode",z="opera",y="keyup",x="mshtml",w="blur",v="keydown",u="propertychange",t="browser.version",s="select-multiple",r="value",p="select",q="qx.event.handler.Input",n="checked";
qx.Class.define(q,{extend:qx.core.Object,implement:qx.event.IEventHandler,construct:function(){qx.core.Object.call(this);
this._onChangeCheckedWrapper=qx.lang.Function.listener(this._onChangeChecked,this);
this._onChangeValueWrapper=qx.lang.Function.listener(this._onChangeValue,this);
this._onInputWrapper=qx.lang.Function.listener(this._onInput,this);
this._onPropertyWrapper=qx.lang.Function.listener(this._onProperty,this);
if((qx.core.Environment.get(k)==z)){this._onKeyDownWrapper=qx.lang.Function.listener(this._onKeyDown,this);
this._onKeyUpWrapper=qx.lang.Function.listener(this._onKeyUp,this);
this._onBlurWrapper=qx.lang.Function.listener(this._onBlur,this);
}},statics:{PRIORITY:qx.event.Registration.PRIORITY_NORMAL,SUPPORTED_TYPES:{input:1,change:1},TARGET_CHECK:qx.event.IEventHandler.TARGET_DOMNODE,IGNORE_CAN_HANDLE:false},members:{__c:false,__d:null,__e:null,__f:null,canHandleEvent:function(B,C){var D=B.tagName.toLowerCase();

if(C===m&&(D===m||D===g)){return true;
}
if(C===j&&(D===m||D===g||D===p)){return true;
}return false;
},registerEvent:function(E,F,G){if(qx.core.Environment.get(k)==x&&(qx.core.Environment.get(d)<9||(qx.core.Environment.get(d)>=9&&qx.core.Environment.get(A)<9))){if(!E.__g){var H=E.tagName.toLowerCase();
var I=E.type;

if(I===h||I===f||H===g||I===b||I===c){qx.bom.Event.addNativeListener(E,u,this._onPropertyWrapper);
}
if(I!==b&&I!==c){qx.bom.Event.addNativeListener(E,j,this._onChangeValueWrapper);
}
if(I===h||I===f){this._onKeyPressWrapped=qx.lang.Function.listener(this._onKeyPress,this,E);
qx.bom.Event.addNativeListener(E,a,this._onKeyPressWrapped);
}E.__g=true;
}}else{if(F===m){this.__h(E);
}else if(F===j){if(E.type===c||E.type===b){qx.bom.Event.addNativeListener(E,j,this._onChangeCheckedWrapper);
}else{qx.bom.Event.addNativeListener(E,j,this._onChangeValueWrapper);
}if((qx.core.Environment.get(k)==z)||(qx.core.Environment.get(k)==x)){if(E.type===h||E.type===f){this._onKeyPressWrapped=qx.lang.Function.listener(this._onKeyPress,this,E);
qx.bom.Event.addNativeListener(E,a,this._onKeyPressWrapped);
}}}}},__h:qx.core.Environment.select(k,{"mshtml":function(J){if(qx.core.Environment.get(d)>=9&&qx.core.Environment.get(A)>=9){qx.bom.Event.addNativeListener(J,m,this._onInputWrapper);

if(J.type===h||J.type===f||J.type===g){this._inputFixWrapper=qx.lang.Function.listener(this._inputFix,this,J);
qx.bom.Event.addNativeListener(J,y,this._inputFixWrapper);
}}},"webkit":function(K){var L=K.tagName.toLowerCase();
if(parseFloat(qx.core.Environment.get(d))<532&&L==g){qx.bom.Event.addNativeListener(K,a,this._onInputWrapper);
}qx.bom.Event.addNativeListener(K,m,this._onInputWrapper);
},"opera":function(M){qx.bom.Event.addNativeListener(M,y,this._onKeyUpWrapper);
qx.bom.Event.addNativeListener(M,v,this._onKeyDownWrapper);
qx.bom.Event.addNativeListener(M,w,this._onBlurWrapper);
qx.bom.Event.addNativeListener(M,m,this._onInputWrapper);
},"default":function(N){qx.bom.Event.addNativeListener(N,m,this._onInputWrapper);
}}),unregisterEvent:function(O,P){if(qx.core.Environment.get(k)==x&&qx.core.Environment.get(d)<9&&qx.core.Environment.get(A)<9){if(O.__g){var Q=O.tagName.toLowerCase();
var R=O.type;

if(R===h||R===f||Q===g||R===b||R===c){qx.bom.Event.removeNativeListener(O,u,this._onPropertyWrapper);
}
if(R!==b&&R!==c){qx.bom.Event.removeNativeListener(O,j,this._onChangeValueWrapper);
}
if(R===h||R===f){qx.bom.Event.removeNativeListener(O,a,this._onKeyPressWrapped);
}
try{delete O.__g;
}catch(S){O.__g=null;
}}}else{if(P===m){this.__i(O);
}else if(P===j){if(O.type===c||O.type===b){qx.bom.Event.removeNativeListener(O,j,this._onChangeCheckedWrapper);
}else{qx.bom.Event.removeNativeListener(O,j,this._onChangeValueWrapper);
}}
if((qx.core.Environment.get(k)==z)||(qx.core.Environment.get(k)==x)){if(O.type===h||O.type===f){qx.bom.Event.removeNativeListener(O,a,this._onKeyPressWrapped);
}}}},__i:qx.core.Environment.select(k,{"mshtml":function(T){if(qx.core.Environment.get(d)>=9&&qx.core.Environment.get(A)>=9){qx.bom.Event.removeNativeListener(T,m,this._onInputWrapper);

if(T.type===h||T.type===f||T.type===g){qx.bom.Event.removeNativeListener(T,y,this._inputFixWrapper);
}}},"webkit":function(U){var V=U.tagName.toLowerCase();
if(parseFloat(qx.core.Environment.get(d))<532&&V==g){qx.bom.Event.removeNativeListener(U,a,this._onInputWrapper);
}qx.bom.Event.removeNativeListener(U,m,this._onInputWrapper);
},"opera":function(W){qx.bom.Event.removeNativeListener(W,y,this._onKeyUpWrapper);
qx.bom.Event.removeNativeListener(W,v,this._onKeyDownWrapper);
qx.bom.Event.removeNativeListener(W,w,this._onBlurWrapper);
qx.bom.Event.removeNativeListener(W,m,this._onInputWrapper);
},"default":function(X){qx.bom.Event.removeNativeListener(X,m,this._onInputWrapper);
}}),_onKeyPress:qx.core.Environment.select(k,{"mshtml|opera":function(e,Y){if(e.keyCode===13){if(Y.value!==this.__e){this.__e=Y.value;
qx.event.Registration.fireEvent(Y,j,qx.event.type.Data,[Y.value]);
}}},"default":null}),_inputFix:qx.core.Environment.select(k,{"mshtml":function(e,ba){if(e.keyCode===46||e.keyCode===8){if(ba.value!==this.__f){this.__f=ba.value;
qx.event.Registration.fireEvent(ba,m,qx.event.type.Data,[ba.value]);
}}},"default":null}),_onKeyDown:qx.core.Environment.select(k,{"opera":function(e){if(e.keyCode===13){this.__c=true;
}},"default":null}),_onKeyUp:qx.core.Environment.select(k,{"opera":function(e){if(e.keyCode===13){this.__c=false;
}},"default":null}),_onBlur:qx.core.Environment.select(k,{"opera":function(e){if(this.__d&&qx.core.Environment.get(t)<10.6){window.clearTimeout(this.__d);
}},"default":null}),_onInput:qx.event.GlobalError.observeMethod(function(e){var bc=qx.bom.Event.getTarget(e);
var bb=bc.tagName.toLowerCase();
if(!this.__c||bb!==m){if((qx.core.Environment.get(k)==z)&&qx.core.Environment.get(t)<10.6){this.__d=window.setTimeout(function(){qx.event.Registration.fireEvent(bc,m,qx.event.type.Data,[bc.value]);
},0);
}else{qx.event.Registration.fireEvent(bc,m,qx.event.type.Data,[bc.value]);
}}}),_onChangeValue:qx.event.GlobalError.observeMethod(function(e){var be=qx.bom.Event.getTarget(e);
var bd=be.value;

if(be.type===s){var bd=[];

for(var i=0,o=be.options,l=o.length;i<l;i++){if(o[i].selected){bd.push(o[i].value);
}}}qx.event.Registration.fireEvent(be,j,qx.event.type.Data,[bd]);
}),_onChangeChecked:qx.event.GlobalError.observeMethod(function(e){var bf=qx.bom.Event.getTarget(e);

if(bf.type===c){if(bf.checked){qx.event.Registration.fireEvent(bf,j,qx.event.type.Data,[bf.value]);
}}else{qx.event.Registration.fireEvent(bf,j,qx.event.type.Data,[bf.checked]);
}}),_onProperty:qx.core.Environment.select(k,{"mshtml":qx.event.GlobalError.observeMethod(function(e){var bg=qx.bom.Event.getTarget(e);
var bh=e.propertyName;

if(bh===r&&(bg.type===h||bg.type===f||bg.tagName.toLowerCase()===g)){if(!bg.$$inValueSet){qx.event.Registration.fireEvent(bg,m,qx.event.type.Data,[bg.value]);
}}else if(bh===n){if(bg.type===b){qx.event.Registration.fireEvent(bg,j,qx.event.type.Data,[bg.checked]);
}else if(bg.checked){qx.event.Registration.fireEvent(bg,j,qx.event.type.Data,[bg.value]);
}}}),"default":function(){}})},defer:function(bi){qx.event.Registration.addHandler(bi);
}});
})();
(function(){var v="",u="select",t="engine.name",s="soft",r="off",q="textarea",p="auto",o="wrap",n="text",m="mshtml",d="number",k="checkbox",g="select-one",c="input",b="option",f="value",e="radio",h="qx.bom.Input",a="nowrap",j="normal";
qx.Class.define(h,{statics:{__H:{text:1,textarea:1,select:1,checkbox:1,radio:1,password:1,hidden:1,submit:1,image:1,file:1,search:1,reset:1,button:1},create:function(w,x,y){var x=x?qx.lang.Object.clone(x):{};
var z;

if(w===q||w===u){z=w;
}else{z=c;
x.type=w;
}return qx.bom.Element.create(z,x,y);
},setValue:function(A,B){var G=A.nodeName.toLowerCase();
var D=A.type;
var Array=qx.lang.Array;
var H=qx.lang.Type;

if(typeof B===d){B+=v;
}
if((D===k||D===e)){if(H.isArray(B)){A.checked=Array.contains(B,A.value);
}else{A.checked=A.value==B;
}}else if(G===u){var C=H.isArray(B);
var I=A.options;
var E,F;

for(var i=0,l=I.length;i<l;i++){E=I[i];
F=E.getAttribute(f);

if(F==null){F=E.text;
}E.selected=C?Array.contains(B,F):B==F;
}
if(C&&B.length==0){A.selectedIndex=-1;
}}else if((D===n||D===q)&&(qx.core.Environment.get(t)==m)){A.$$inValueSet=true;
A.value=B;
A.$$inValueSet=null;
}else{A.value=B;
}},getValue:function(J){var P=J.nodeName.toLowerCase();

if(P===b){return (J.attributes.value||{}).specified?J.value:J.text;
}
if(P===u){var K=J.selectedIndex;
if(K<0){return null;
}var Q=[];
var S=J.options;
var R=J.type==g;
var O=qx.bom.Input;
var N;
for(var i=R?K:0,M=R?K+1:S.length;i<M;i++){var L=S[i];

if(L.selected){N=O.getValue(L);
if(R){return N;
}Q.push(N);
}}return Q;
}else{return (J.value||v).replace(/\r/g,v);
}},setWrap:qx.core.Environment.select(t,{"mshtml":function(T,U){var W=U?s:r;
var V=U?p:v;
T.wrap=W;
T.style.overflowY=V;
},"gecko|webkit":function(X,Y){var bb=Y?s:r;
var ba=Y?v:p;
X.setAttribute(o,bb);
X.style.overflow=ba;
},"default":function(bc,bd){bc.style.whiteSpace=bd?j:a;
}})}});
})();
(function(){var a="qx.dom.Element";
qx.Bootstrap.define(a,{statics:{hasChild:function(parent,b){return b.parentNode===parent;
},hasChildren:function(c){return !!c.firstChild;
},hasChildElements:function(d){d=d.firstChild;

while(d){if(d.nodeType===1){return true;
}d=d.nextSibling;
}return false;
},getParentElement:function(e){return e.parentNode;
},isInDom:function(f,g){if(!g){g=window;
}var h=g.document.getElementsByTagName(f.nodeName);

for(var i=0,l=h.length;i<l;i++){if(h[i]===f){return true;
}}return false;
},insertAt:function(j,parent,k){var m=parent.childNodes[k];

if(m){parent.insertBefore(j,m);
}else{parent.appendChild(j);
}return true;
},insertBegin:function(n,parent){if(parent.firstChild){this.insertBefore(n,parent.firstChild);
}else{parent.appendChild(n);
}},insertEnd:function(o,parent){parent.appendChild(o);
},insertBefore:function(p,q){q.parentNode.insertBefore(p,q);
return true;
},insertAfter:function(r,s){var parent=s.parentNode;

if(s==parent.lastChild){parent.appendChild(r);
}else{return this.insertBefore(r,s.nextSibling);
}return true;
},remove:function(t){if(!t.parentNode){return false;
}t.parentNode.removeChild(t);
return true;
},removeChild:function(u,parent){if(u.parentNode!==parent){return false;
}parent.removeChild(u);
return true;
},removeChildAt:function(v,parent){var w=parent.childNodes[v];

if(!w){return false;
}parent.removeChild(w);
return true;
},replaceChild:function(x,y){if(!y.parentNode){return false;
}y.parentNode.replaceChild(x,y);
return true;
},replaceAt:function(z,A,parent){var B=parent.childNodes[A];

if(!B){return false;
}parent.replaceChild(z,B);
return true;
}}});
})();
(function(){var i="=",h="",g=";path=",f=";domain=",e=";expires=Thu, 01-Jan-1970 00:00:01 GMT",d="qx.bom.Cookie",c=";expires=",b=";",a=";secure";
qx.Class.define(d,{statics:{get:function(j){var k=document.cookie.indexOf(j+i);
var m=k+j.length+1;

if((!k)&&(j!=document.cookie.substring(0,j.length))){return null;
}
if(k==-1){return null;
}var l=document.cookie.indexOf(b,m);

if(l==-1){l=document.cookie.length;
}return unescape(document.cookie.substring(m,l));
},set:function(n,o,p,q,r,s){var t=[n,i,escape(o)];

if(p){var u=new Date();
u.setTime(u.getTime());
t.push(c,new Date(u.getTime()+(p*1000*60*60*24)).toGMTString());
}
if(q){t.push(g,q);
}
if(r){t.push(f,r);
}
if(s){t.push(a);
}document.cookie=t.join(h);
},del:function(v,w,x){if(!qx.bom.Cookie.get(v)){return;
}var y=[v,i];

if(w){y.push(g,w);
}
if(x){y.push(f,x);
}y.push(e);
document.cookie=y.join(h);
}}});
})();
(function(){var f="mshtml",e="engine.name",d="pop.push.reverse.shift.sort.splice.unshift.join.slice",c="number",b="qx.type.BaseArray",a=".";
qx.Bootstrap.define(b,{extend:Array,construct:function(g){},members:{toArray:null,valueOf:null,pop:null,push:null,reverse:null,shift:null,sort:null,splice:null,unshift:null,concat:null,join:null,slice:null,toString:null,indexOf:null,lastIndexOf:null,forEach:null,filter:null,map:null,some:null,every:null}});
(function(){function k(l){if((qx.core.Environment.get(e)==f)){j.prototype={length:0,$$isArray:true};
var o=d.split(a);

for(var length=o.length;length;){j.prototype[o[--length]]=Array.prototype[o[length]];
}}var p=Array.prototype.slice;
j.prototype.concat=function(){var r=this.slice(0);

for(var i=0,length=arguments.length;i<length;i++){var q;

if(arguments[i] instanceof j){q=p.call(arguments[i],0);
}else if(arguments[i] instanceof Array){q=arguments[i];
}else{q=[arguments[i]];
}r.push.apply(r,q);
}return r;
};
j.prototype.toString=function(){return p.call(this,0).toString();
};
j.prototype.toLocaleString=function(){return p.call(this,0).toLocaleString();
};
j.prototype.constructor=j;
j.prototype.indexOf=qx.lang.Core.arrayIndexOf;
j.prototype.lastIndexOf=qx.lang.Core.arrayLastIndexOf;
j.prototype.forEach=qx.lang.Core.arrayForEach;
j.prototype.some=qx.lang.Core.arraySome;
j.prototype.every=qx.lang.Core.arrayEvery;
var m=qx.lang.Core.arrayFilter;
var n=qx.lang.Core.arrayMap;
j.prototype.filter=function(){var s=new this.constructor;
s.push.apply(s,m.apply(this,arguments));
return s;
};
j.prototype.map=function(){var t=new this.constructor;
t.push.apply(t,n.apply(this,arguments));
return t;
};
j.prototype.slice=function(){var u=new this.constructor;
u.push.apply(u,Array.prototype.slice.apply(this,arguments));
return u;
};
j.prototype.splice=function(){var v=new this.constructor;
v.push.apply(v,Array.prototype.splice.apply(this,arguments));
return v;
};
j.prototype.toArray=function(){return Array.prototype.slice.call(this,0);
};
j.prototype.valueOf=function(){return this.length;
};
return j;
}function j(length){if(arguments.length===1&&typeof length===c){this.length=-1<length&&length===length>>.5?length:this.push(length);
}else if(arguments.length){this.push.apply(this,arguments);
}}function h(){}h.prototype=[];
j.prototype=new h;
j.prototype.length=0;
qx.type.BaseArray=k(j);
})();
})();
(function(){var j="borderTopWidth",i="borderLeftWidth",h="engine.name",g="scroll",f="engine.version",e="marginTop",d="marginLeft",c="border-box",b="borderBottomWidth",a="borderRightWidth",E="auto",D="padding",C="browser.quirksmode",B="qx.bom.element.Location",A="paddingLeft",z="static",y="marginBottom",x="visible",w="BODY",v="opera",q="paddingBottom",r="paddingTop",o="gecko",p="marginRight",m="mshtml",n="position",k="margin",l="overflow",s="paddingRight",t="browser.documentmode",u="border";
qx.Bootstrap.define(B,{statics:{__lf:function(F,G){return qx.bom.element.Style.get(F,G,qx.bom.element.Style.COMPUTED_MODE,false);
},__lg:function(H,I){return parseInt(qx.bom.element.Style.get(H,I,qx.bom.element.Style.COMPUTED_MODE,false),10)||0;
},__lh:function(J){var M=0,top=0;
if(J.getBoundingClientRect&&qx.core.Environment.get(h)!=v){var L=qx.dom.Node.getWindow(J);
M-=qx.bom.Viewport.getScrollLeft(L);
top-=qx.bom.Viewport.getScrollTop(L);
}else{var K=qx.dom.Node.getDocument(J).body;
J=J.parentNode;
while(J&&J!=K){M+=J.scrollLeft;
top+=J.scrollTop;
J=J.parentNode;
}}return {left:M,top:top};
},__li:qx.core.Environment.select(h,{"mshtml":function(N){var P=qx.dom.Node.getDocument(N);
var O=P.body;
var Q=0;
var top=0;
Q-=O.clientLeft+P.documentElement.clientLeft;
top-=O.clientTop+P.documentElement.clientTop;

if(!qx.core.Environment.get(C)){Q+=this.__lg(O,i);
top+=this.__lg(O,j);
}return {left:Q,top:top};
},"webkit":function(R){var T=qx.dom.Node.getDocument(R);
var S=T.body;
var U=S.offsetLeft;
var top=S.offsetTop;
if(parseFloat(qx.core.Environment.get(f))<530.17){U+=this.__lg(S,i);
top+=this.__lg(S,j);
}return {left:U,top:top};
},"gecko":function(V){var W=qx.dom.Node.getDocument(V).body;
var X=W.offsetLeft;
var top=W.offsetTop;
if(parseFloat(qx.core.Environment.get(f))<1.9){X+=this.__lg(W,d);
top+=this.__lg(W,e);
}if(qx.bom.element.BoxSizing.get(W)!==c){X+=this.__lg(W,i);
top+=this.__lg(W,j);
}return {left:X,top:top};
},"default":function(Y){var ba=qx.dom.Node.getDocument(Y).body;
var bb=ba.offsetLeft;
var top=ba.offsetTop;
return {left:bb,top:top};
}}),__lj:qx.core.Environment.select(h,{"mshtml|webkit":function(bc){var be=qx.dom.Node.getDocument(bc);
if(bc.getBoundingClientRect){var bf=bc.getBoundingClientRect();
var bg=bf.left;
var top=bf.top;
}else{var bg=bc.offsetLeft;
var top=bc.offsetTop;
bc=bc.offsetParent;
var bd=be.body;
while(bc&&bc!=bd){bg+=bc.offsetLeft;
top+=bc.offsetTop;
bg+=this.__lg(bc,i);
top+=this.__lg(bc,j);
bc=bc.offsetParent;
}}return {left:bg,top:top};
},"gecko":function(bh){if(bh.getBoundingClientRect){var bk=bh.getBoundingClientRect();
var bl=Math.round(bk.left);
var top=Math.round(bk.top);
}else{var bl=0;
var top=0;
var bi=qx.dom.Node.getDocument(bh).body;
var bj=qx.bom.element.BoxSizing;

if(bj.get(bh)!==c){bl-=this.__lg(bh,i);
top-=this.__lg(bh,j);
}
while(bh&&bh!==bi){bl+=bh.offsetLeft;
top+=bh.offsetTop;
if(bj.get(bh)!==c){bl+=this.__lg(bh,i);
top+=this.__lg(bh,j);
}if(bh.parentNode&&this.__lf(bh.parentNode,l)!=x){bl+=this.__lg(bh.parentNode,i);
top+=this.__lg(bh.parentNode,j);
}bh=bh.offsetParent;
}}return {left:bl,top:top};
},"default":function(bm){var bo=0;
var top=0;
var bn=qx.dom.Node.getDocument(bm).body;
while(bm&&bm!==bn){bo+=bm.offsetLeft;
top+=bm.offsetTop;
bm=bm.offsetParent;
}return {left:bo,top:top};
}}),get:function(bp,bq){if(bp.tagName==w){var location=this.__lk(bp);
var bx=location.left;
var top=location.top;
}else{var br=this.__li(bp);
var bw=this.__lj(bp);
var scroll=this.__lh(bp);
var bx=bw.left+br.left-scroll.left;
var top=bw.top+br.top-scroll.top;
}var bs=bx+bp.offsetWidth;
var bt=top+bp.offsetHeight;

if(bq){if(bq==D||bq==g){var bu=qx.bom.element.Overflow.getX(bp);

if(bu==g||bu==E){bs+=bp.scrollWidth-bp.offsetWidth+this.__lg(bp,i)+this.__lg(bp,a);
}var bv=qx.bom.element.Overflow.getY(bp);

if(bv==g||bv==E){bt+=bp.scrollHeight-bp.offsetHeight+this.__lg(bp,j)+this.__lg(bp,b);
}}
switch(bq){case D:bx+=this.__lg(bp,A);
top+=this.__lg(bp,r);
bs-=this.__lg(bp,s);
bt-=this.__lg(bp,q);
case g:bx-=bp.scrollLeft;
top-=bp.scrollTop;
bs-=bp.scrollLeft;
bt-=bp.scrollTop;
case u:bx+=this.__lg(bp,i);
top+=this.__lg(bp,j);
bs-=this.__lg(bp,a);
bt-=this.__lg(bp,b);
break;
case k:bx-=this.__lg(bp,d);
top-=this.__lg(bp,e);
bs+=this.__lg(bp,p);
bt+=this.__lg(bp,y);
break;
}}return {left:bx,top:top,right:bs,bottom:bt};
},__lk:function(by){var top=by.offsetTop;
var bz=by.offsetLeft;

if(qx.core.Environment.get(h)!==m||!((parseFloat(qx.core.Environment.get(f))<8||qx.core.Environment.get(t)<8)&&!qx.core.Environment.get(C))){top+=this.__lg(by,e);
bz+=this.__lg(by,d);
}
if(qx.core.Environment.get(h)===o){top+=this.__lg(by,i);
bz+=this.__lg(by,j);
}return {left:bz,top:top};
},getLeft:function(bA,bB){return this.get(bA,bB).left;
},getTop:function(bC,bD){return this.get(bC,bD).top;
},getRight:function(bE,bF){return this.get(bE,bF).right;
},getBottom:function(bG,bH){return this.get(bG,bH).bottom;
},getRelative:function(bI,bJ,bK,bL){var bN=this.get(bI,bK);
var bM=this.get(bJ,bL);
return {left:bN.left-bM.left,top:bN.top-bM.top,right:bN.right-bM.right,bottom:bN.bottom-bM.bottom};
},getPosition:function(bO){return this.getRelative(bO,this.getOffsetParent(bO));
},getOffsetParent:function(bP){var bR=bP.offsetParent||document.body;
var bQ=qx.bom.element.Style;

while(bR&&(!/^body|html$/i.test(bR.tagName)&&bQ.get(bR,n)===z)){bR=bR.offsetParent;
}return bR;
}}});
})();
(function(){var m="get",k="set",h="reset",g=":not(",f="getValue",e="append",d=")",c="getPreviousSiblings",b="#",a="qx.bom.Collection",K="setValue",J="prepend",I="string",H="getAncestors",G="getOffsetParent",F="remove",E=">*",D="add",C="*",B="",t="addListener",u="has",r="toggle",s="getSiblings",p="replace",q="after",n="replaceWith",o="setCss",v="setStyles",w="before",y="getNextSiblings",x="getPosition",A="getCss",z="removeListener";
(function(){var M=function(N,O){return function(P,Q,R,S,T,U){var length=this.length;

if(length>0){var V=N[O];

for(var i=0;i<length;i++){if(this[i].nodeType===1){V.call(N,this[i],P,Q,R,S,T,U);
}}}return this;
};
};
var L=function(W,X){return function(Y,ba,bb,bc,bd,be){if(this.length>0){var bf=this[0].nodeType===1?W[X](this[0],Y,ba,bb,bc,bd,be):null;

if(bf&&bf.nodeType){return this.__wt([bf]);
}else{return bf;
}}return null;
};
};
qx.Class.define(a,{extend:qx.type.BaseArray,construct:function(bg){qx.type.BaseArray.apply(this,arguments);
},statics:{query:function(bh,bi){var bj=qx.bom.Selector.query(bh,bi);
return qx.lang.Array.cast(bj,qx.bom.Collection);
},id:function(bk){var bl=document.getElementById(bk);
if(bl&&bl.id!=bk){return qx.bom.Collection.query(b+bk);
}if(bl){return new qx.bom.Collection(bl);
}else{return new qx.bom.Collection();
}},html:function(bm,bn){var bo=qx.bom.Html.clean([bm],bn);
return qx.lang.Array.cast(bo,qx.bom.Collection);
},__wp:/^[^<]*(<(.|\s)+>)[^>]*$|^#([\w-]+)$/,create:function(bp,bq){var bs=qx.bom.Collection;
if(bp.nodeType){return new bs(bp);
}else if(typeof bp===I){var br=bs.__wp.exec(bp);

if(br){return br[1]?bs.html(br[1],bq):bs.id(br[3]);
}else{return bs.query(bp,bq);
}}else{return qx.lang.Array.cast(bp,qx.bom.Collection);
}}},members:{__wq:null,setAttribute:M(qx.bom.element.Attribute,k),resetAttribute:M(qx.bom.element.Attribute,h),getAttribute:L(qx.bom.element.Attribute,m),addClass:M(qx.bom.element.Class,D),getClass:L(qx.bom.element.Class,m),hasClass:L(qx.bom.element.Class,u),removeClass:M(qx.bom.element.Class,F),replaceClass:M(qx.bom.element.Class,p),toggleClass:M(qx.bom.element.Class,r),setValue:M(qx.bom.Input,K),getValue:L(qx.bom.Input,f),setStyle:M(qx.bom.element.Style,k),setStyles:M(qx.bom.element.Style,v),resetStyle:M(qx.bom.element.Style,h),getStyle:L(qx.bom.element.Style,m),setCss:M(qx.bom.element.Style,o),getCss:L(qx.bom.element.Style,A),getOffset:L(qx.bom.element.Location,m),getPosition:L(qx.bom.element.Location,x),getOffsetParent:L(qx.bom.element.Location,G),setScrollLeft:function(bt){var Node=qx.dom.Node;

for(var i=0,l=this.length,bu;i<l;i++){bu=this[i];

if(Node.isElement(bu)){bu.scrollLeft=bt;
}else if(Node.isWindow(bu)){bu.scrollTo(bt,this.getScrollTop(bu));
}else if(Node.isDocument(bu)){Node.getWindow(bu).scrollTo(bt,this.getScrollTop(bu));
}}return this;
},setScrollTop:function(bv){var Node=qx.dom.Node;

for(var i=0,l=this.length,bw;i<l;i++){bw=this[i];

if(Node.isElement(bw)){bw.scrollTop=bv;
}else if(Node.isWindow(bw)){bw.scrollTo(this.getScrollLeft(bw),bv);
}else if(Node.isDocument(bw)){Node.getWindow(bw).scrollTo(this.getScrollLeft(bw),bv);
}}return this;
},getScrollLeft:function(){var bx=this[0];

if(!bx){return null;
}var Node=qx.dom.Node;

if(Node.isWindow(bx)||Node.isDocument(bx)){return qx.bom.Viewport.getScrollLeft();
}return bx.scrollLeft;
},getScrollTop:function(){var by=this[0];

if(!by){return null;
}var Node=qx.dom.Node;

if(Node.isWindow(by)||Node.isDocument(by)){return qx.bom.Viewport.getScrollTop();
}return by.scrollTop;
},getWidth:function(){var bz=this[0];
var Node=qx.dom.Node;

if(bz){if(Node.isElement(bz)){return qx.bom.element.Dimension.getWidth(bz);
}else if(Node.isDocument(bz)){return qx.bom.Document.getWidth(Node.getWindow(bz));
}else if(Node.isWindow(bz)){return qx.bom.Viewport.getWidth(bz);
}}return null;
},getContentWidth:function(){var bA=this[0];

if(qx.dom.Node.isElement(bA)){return qx.bom.element.Dimension.getContentWidth(bA);
}return null;
},getHeight:function(){var bB=this[0];
var Node=qx.dom.Node;

if(bB){if(Node.isElement(bB)){return qx.bom.element.Dimension.getHeight(bB);
}else if(Node.isDocument(bB)){return qx.bom.Document.getHeight(Node.getWindow(bB));
}else if(Node.isWindow(bB)){return qx.bom.Viewport.getHeight(bB);
}}return null;
},getContentHeight:function(){var bC=this[0];

if(qx.dom.Node.isElement(bC)){return qx.bom.element.Dimension.getContentHeight(bC);
}return null;
},addListener:M(qx.bom.Element,t),removeListener:M(qx.bom.Element,z),eq:function(bD){return this.slice(bD,+bD+1);
},filter:function(bE,bF){var bG;

if(qx.lang.Type.isFunction(bE)){bG=qx.type.BaseArray.prototype.filter.call(this,bE,bF);
}else{bG=qx.bom.Selector.matches(bE,this);
}return this.__wt(bG);
},is:function(bH){return !!bH&&qx.bom.Selector.matches(bH,this).length>0;
},__wr:/^.[^:#\[\.,]*$/,not:function(bI){if(this.__wr.test(bI)){var bJ=qx.bom.Selector.matches(g+bI+d,this);
return this.__wt(bJ);
}var bJ=qx.bom.Selector.matches(bI,this);
return this.filter(function(bK){return bJ.indexOf(bK)===-1;
});
},add:function(bL,bM){var bN=qx.bom.Selector.query(bL,bM);
var bO=qx.lang.Array.unique(this.concat(bN));
return this.__wt(bO);
},children:function(bP){var bQ=[];

for(var i=0,l=this.length;i<l;i++){bQ.push.apply(bQ,qx.dom.Hierarchy.getChildElements(this[i]));
}
if(bP){bQ=qx.bom.Selector.matches(bP,bQ);
}return this.__wt(bQ);
},closest:function(bR){var bS=new qx.bom.Collection(1);
var bU=qx.bom.Selector;
var bT=this.map(function(bV){while(bV&&bV.ownerDocument){bS[0]=bV;

if(bU.matches(bR,bS).length>0){return bV;
}bV=bV.parentNode;
}});
return this.__wt(qx.lang.Array.unique(bT));
},contents:function(){var bX=[];
var bW=qx.lang.Array;

for(var i=0,l=this.length;i<l;i++){bX.push.apply(bX,bW.fromCollection(this[i].childNodes));
}return this.__wt(bX);
},find:function(bY){var cb=qx.bom.Selector;
if(this.length===1){return this.__wt(cb.query(bY,this[0]));
}else{var ca=[];

for(var i=0,l=this.length;i<l;i++){ca.push.apply(ca,cb.query(bY,this[i]));
}return this.__wt(qx.lang.Array.unique(ca));
}},next:function(cc){var cd=qx.dom.Hierarchy;
var ce=this.map(cd.getNextElementSibling,cd);
if(cc){ce=qx.bom.Selector.matches(cc,ce);
}return this.__wt(ce);
},nextAll:function(cf){return this.__ws(y,cf);
},prev:function(cg){var ch=qx.dom.Hierarchy;
var ci=this.map(ch.getPreviousElementSibling,ch);
if(cg){ci=qx.bom.Selector.matches(cg,ci);
}return this.__wt(ci);
},prevAll:function(cj){return this.__ws(c,cj);
},parent:function(ck){var Element=qx.dom.Element;
var cl=qx.lang.Array.unique(this.map(Element.getParentElement,Element));
if(ck){cl=qx.bom.Selector.matches(ck,cl);
}return this.__wt(cl);
},parents:function(cm){return this.__ws(H,cm);
},siblings:function(cn){return this.__ws(s,cn);
},__ws:function(co,cp){var cr=[];
var cq=qx.dom.Hierarchy;

for(var i=0,l=this.length;i<l;i++){cr.push.apply(cr,cq[co](this[i]));
}var cs=qx.lang.Array.unique(cr);
if(cp){cs=qx.bom.Selector.matches(cp,cs);
}return this.__wt(cs);
},__wt:function(ct){var cu=new qx.bom.Collection;
cu.__wq=this;
ct=Array.prototype.slice.call(ct,0);
cu.push.apply(cu,ct);
return cu;
},andSelf:function(){return this.add(this.__wq);
},end:function(){return this.__wq||new qx.bom.Collection();
},__wu:function(cv,cw){var cB=this[0];
var cA=cB.ownerDocument||cB;
var cz=cA.createDocumentFragment();
var cD=qx.bom.Html.clean(cv,cA,cz);
var cF=cz.firstChild;
if(cF){var cx=this.length-1;

for(var i=0,l=cx;i<l;i++){cw.call(this,this[i],cz.cloneNode(true));
}cw.call(this,this[cx],cz);
}if(cD){var cy;
var cE=qx.io.ScriptLoader;
var cC=qx.lang.Function;

for(var i=0,l=cD.length;i<l;i++){cy=cD[i];
if(cy.src){(new cE()).load(cy.src);
}else{cC.globalEval(cy.text||cy.textContent||cy.innerHTML||B);
}if(cy.parentNode){cy.parentNode.removeChild(cy);
}}}return this;
},__wv:function(cG,cH){var cJ=qx.bom.Selector;
var cI=qx.lang.Array;
var cL=[];

for(var i=0,l=cG.length;i<l;i++){cL.push.apply(cL,cJ.query(cG[i]));
}cL=cI.cast(cI.unique(cL),qx.bom.Collection);
for(var i=0,cK=this.length;i<cK;i++){cL[cH](this[i]);
}return this;
},append:function(cM){return this.__wu(arguments,this.__ww);
},prepend:function(cN){return this.__wu(arguments,this.__wx);
},__ww:function(cO,cP){cO.appendChild(cP);
},__wx:function(cQ,cR){cQ.insertBefore(cR,cQ.firstChild);
},appendTo:function(cS){return this.__wv(arguments,e);
},prependTo:function(cT){return this.__wv(arguments,J);
},before:function(cU){return this.__wu(arguments,this.__wy);
},after:function(cV){return this.__wu(arguments,this.__wz);
},__wy:function(cW,cX){cW.parentNode.insertBefore(cX,cW);
},__wz:function(cY,da){cY.parentNode.insertBefore(da,cY.nextSibling);
},insertBefore:function(db){return this.__wv(arguments,w);
},insertAfter:function(dc){return this.__wv(arguments,q);
},wrapAll:function(content){var de=this[0];

if(de){var dd=qx.bom.Collection.create(content,de.ownerDocument).clone();
if(de.parentNode){de.parentNode.insertBefore(dd[0],de);
}dd.map(this.__wA).append(this);
}return this;
},__wA:function(df){while(df.firstChild){df=df.firstChild;
}return df;
},wrapInner:function(content){var dg=new qx.bom.Collection(1);

for(var i=0,l=this.length;i<l;i++){dg[0]=this[i];
dg.contents().wrapAll(content);
}return this;
},wrap:function(content){var dh=new qx.bom.Collection(1);
for(var i=0,l=this.length;i<l;i++){dh[0]=this[i];
dh.wrapAll(content);
}return this;
},replaceWith:function(content){return this.after(content).remove();
},replaceAll:function(di){return this.__wv(arguments,n);
},remove:function(dj){var dl=this;

if(dj){dl=this.filter(dj);

if(dl.length==0){return this;
}}for(var i=0,dm=dl.length,dk;i<dm;i++){dk=dl[i];

if(dk.parentNode){dk.parentNode.removeChild(dk);
}}return dl;
},destroy:function(dn){if(this.length==0){return this;
}var dq=qx.bom.Selector;
var dt=this;

if(dn){dt=this.filter(dn);

if(dt.length==0){return this;
}}var ds=qx.event.Registration.getManager(this[0]);

for(var i=0,l=dt.length,dr,du;i<l;i++){dr=dt[i];
ds.removeAllListeners(dr);
du=dq.query(C,dr);

for(var j=0,dp=du.length;j<dp;j++){ds.removeAllListeners(du[j]);
}if(dr.parentNode){dr.parentNode.removeChild(dr);
}}if(dn){dt.end();
qx.lang.Array.exclude(this,dt);
}else{this.length=0;
}return this;
},empty:function(){var dv=qx.bom.Collection;

for(var i=0,l=this.length;i<l;i++){dv.query(E,this[i]).destroy();
while(this.firstChild){this.removeChild(this.firstChild);
}}return this;
},clone:function(dw){var Element=qx.bom.Element;
return dw?this.map(function(dx){return Element.clone(dx,true);
}):this.map(Element.clone,Element);
}},defer:function(dy){if(window.$==null){window.$=dy.create;
}}});
})();
})();
(function(){var m="string",k="script",h="<table>",g="engine.name",f="<fieldset>",e="<select multiple='multiple'>",d="</div>",c="</select>",b="</tr></tbody></table>",a="<col",J="div",I="<table><tbody><tr>",H=">",G="<table><tbody></tbody><colgroup>",F="<th",E="</tbody></table>",D="<td",C="</colgroup></table>",B="<opt",A="text/javascript",t="",u="</fieldset>",r="<table><tbody>",s="div<div>",p="<table",q="mshtml",n="qx.bom.Html",o="<leg",v="tbody",w="<tr",y="</table>",x="undefined",z="></";
qx.Bootstrap.define(n,{statics:{__wB:function(K,L,M){return M.match(/^(abbr|br|col|img|input|link|meta|param|hr|area|embed)$/i)?K:L+z+M+H;
},__wC:{opt:[1,e,c],leg:[1,f,u],table:[1,h,y],tr:[2,r,E],td:[3,I,b],col:[2,G,C],def:qx.core.Environment.select(g,{"mshtml":[1,s,d],"default":null})},__wD:function(N,O){var U=O.createElement(J);
N=N.replace(/(<(\w+)[^>]*?)\/>/g,this.__wB);
var Q=N.replace(/^\s+/,t).substring(0,5).toLowerCase();
var T,P=this.__wC;

if(!Q.indexOf(B)){T=P.opt;
}else if(!Q.indexOf(o)){T=P.leg;
}else if(Q.match(/^<(thead|tbody|tfoot|colg|cap)/)){T=P.table;
}else if(!Q.indexOf(w)){T=P.tr;
}else if(!Q.indexOf(D)||!Q.indexOf(F)){T=P.td;
}else if(!Q.indexOf(a)){T=P.col;
}else{T=P.def;
}if(T){U.innerHTML=T[1]+N+T[2];
var S=T[0];

while(S--){U=U.lastChild;
}}else{U.innerHTML=N;
}if((qx.core.Environment.get(g)==q)){var V=/<tbody/i.test(N);
var R=!Q.indexOf(p)&&!V?U.firstChild&&U.firstChild.childNodes:T[1]==h&&!V?U.childNodes:[];

for(var j=R.length-1;j>=0;--j){if(R[j].tagName.toLowerCase()===v&&!R[j].childNodes.length){R[j].parentNode.removeChild(R[j]);
}}if(/^\s/.test(N)){U.insertBefore(O.createTextNode(N.match(/^\s*/)[0]),U.firstChild);
}}return qx.lang.Array.fromCollection(U.childNodes);
},clean:function(W,X,Y){X=X||document;
if(typeof X.createElement===x){X=X.ownerDocument||X[0]&&X[0].ownerDocument||document;
}if(!Y&&W.length===1&&typeof W[0]===m){var bg=/^<(\w+)\s*\/?>$/.exec(W[0]);

if(bg){return [X.createElement(bg[1])];
}}var ba,bc=[];

for(var i=0,l=W.length;i<l;i++){ba=W[i];
if(typeof ba===m){ba=this.__wD(ba,X);
}if(ba.nodeType){bc.push(ba);
}else if(ba instanceof qx.type.BaseArray){bc.push.apply(bc,Array.prototype.slice.call(ba,0));
}else if(ba.toElement){bc.push(ba.toElement());
}else{bc.push.apply(bc,ba);
}}if(Y){var bf=[],be=qx.lang.Array,bd,bb;

for(var i=0;bc[i];i++){bd=bc[i];

if(bd.nodeType==1&&bd.tagName.toLowerCase()===k&&(!bd.type||bd.type.toLowerCase()===A)){if(bd.parentNode){bd.parentNode.removeChild(bc[i]);
}bf.push(bd);
}else{if(bd.nodeType===1){bb=be.fromCollection(bd.getElementsByTagName(k));
bc.splice.apply(bc,[i+1,0].concat(bb));
}Y.appendChild(bd);
}}return bf;
}return bc;
}}});
})();
(function(){var j="engine.name",i="0px",h="mshtml",g="engine.version",f="qx.bom.element.Dimension",e="paddingRight",d="paddingLeft",c="opera",b="paddingBottom",a="paddingTop";
qx.Bootstrap.define(f,{statics:{getWidth:qx.core.Environment.select(j,{"gecko":function(k){if(k.getBoundingClientRect){var l=k.getBoundingClientRect();
return Math.round(l.right)-Math.round(l.left);
}else{return k.offsetWidth;
}},"default":function(m){return m.offsetWidth;
}}),getHeight:qx.core.Environment.select(j,{"gecko":function(n){if(n.getBoundingClientRect){var o=n.getBoundingClientRect();
return Math.round(o.bottom)-Math.round(o.top);
}else{return n.offsetHeight;
}},"default":function(p){return p.offsetHeight;
}}),getSize:function(q){return {width:this.getWidth(q),height:this.getHeight(q)};
},__io:{visible:true,hidden:true},getContentWidth:function(r){var s=qx.bom.element.Style;
var t=qx.bom.element.Overflow.getX(r);
var u=parseInt(s.get(r,d)||i,10);
var x=parseInt(s.get(r,e)||i,10);

if(this.__io[t]){var w=r.clientWidth;

if((qx.core.Environment.get(j)==c)||qx.dom.Node.isBlockNode(r)){w=w-u-x;
}return w;
}else{if(r.clientWidth>=r.scrollWidth){return Math.max(r.clientWidth,r.scrollWidth)-u-x;
}else{var v=r.scrollWidth-u;
if(qx.core.Environment.get(j)==h&&qx.core.Environment.get(g)>=6){v-=x;
}return v;
}}},getContentHeight:function(y){var z=qx.bom.element.Style;
var C=qx.bom.element.Overflow.getY(y);
var B=parseInt(z.get(y,a)||i,10);
var A=parseInt(z.get(y,b)||i,10);

if(this.__io[C]){return y.clientHeight-B-A;
}else{if(y.clientHeight>=y.scrollHeight){return Math.max(y.clientHeight,y.scrollHeight)-B-A;
}else{var D=y.scrollHeight-B;
if(qx.core.Environment.get(j)==h&&qx.core.Environment.get(g)==6){D-=A;
}return D;
}}},getContentSize:function(E){return {width:this.getContentWidth(E),height:this.getContentHeight(E)};
}}});
})();
(function(){var p="success",o="fail",n="mshtml",m="complete",l="error",k="load",j="opera",i="loaded",h="readystatechange",g="head",c="webkit",f="script",d="qx.io.ScriptLoader",b="text/javascript",a="abort";
qx.Bootstrap.define(d,{construct:function(){this.__mK=qx.Bootstrap.bind(this.__mN,this);
this.__mL=document.createElement(f);
},statics:{TIMEOUT:15},members:{__mM:null,__mc:null,__eI:null,__eJ:null,__mK:null,__mL:null,load:function(q,r,s){if(this.__mM){throw new Error("Another request is still running!");
}this.__mM=true;
this.__mc=false;
var t=document.getElementsByTagName(g)[0];
var u=this.__mL;
this.__eI=r||null;
this.__eJ=s||window;
u.type=b;
u.onerror=u.onload=u.onreadystatechange=this.__mK;
var self=this;
if(qx.bom.client.Engine.getName()===j&&this._getTimeout()>0){setTimeout(function(){self.dispose(o);
},this._getTimeout()*1000);
}u.src=q;
setTimeout(function(){t.appendChild(u);
},0);
},abort:function(){if(this.__mM){this.dispose(a);
}},dispose:function(status){if(this.__mc){return;
}this.__mc=true;
var x=this.__mL;
x.onerror=x.onload=x.onreadystatechange=null;
var w=x.parentNode;

if(w){w.removeChild(x);
}delete this.__mM;
if(this.__eI){var v=qx.bom.client.Engine.getName();

if(v==n||v==c){var self=this;
setTimeout(qx.event.GlobalError.observeMethod(function(){self.__eI.call(self.__eJ,status);
delete self.__eI;
}),0);
}else{this.__eI.call(this.__eJ,status);
delete this.__eI;
}}},_getTimeout:function(){return qx.io.ScriptLoader.TIMEOUT;
},__mN:qx.event.GlobalError.observeMethod(function(e){var y=qx.bom.client.Engine.getName();
if(y==n){var z=this.__mL.readyState;

if(z==i){this.dispose(p);
}else if(z==m){this.dispose(p);
}else{return;
}}else if(y==j){if(qx.Bootstrap.isString(e)||e.type===l){return this.dispose(o);
}else if(e.type===k){return this.dispose(p);
}else{return;
}}else{if(qx.Bootstrap.isString(e)||e.type===l){this.dispose(o);
}else if(e.type===k){this.dispose(p);
}else if(e.type===h&&(e.target.readyState===m||e.target.readyState===i)){this.dispose(p);
}else{return;
}}})}});
})();
(function(){var n="",m="function",k="\n",j="g",h="^",g="#",f="IMPLICIT-ITERATOR",e=')',d="'",c=">",bp='.',bo="=",bn="object",bm='\\',bl="+",bk="&gt;",bj="render_tags",bi='[object Array]',bh='&#39;',bg="div",w=']',x="This implementation of mustache doesn't understand the '",u="unknown_partial '",v='|\\',q="%",t='&quot;',o="render_pragmas",p="<",C='(',D="!",L="^([\\s\\S]*?)",J="qx.bom.Template",T="\n*([\\s\\S]*?)",O='?',bc='*',Y="{",F='"',bf="{{",be='{',bd='g',E="(\\^|\\#)\\s*(.+)\\s*",H="render_section",I="&amp;",K="mustache.js",M="&lt;",P="&",V="}}",bb='\\$1',y="\\/\\s*\\3\\s*",z="(=|!|>|\\{|%)?([^\\/#\\^]+?)\\1?",G='/',S="%([\\w-]+) ?([\\w]+=[\\w]+)?",R='[',Q="' pragma",X="\\s*([\\s\\S]*)$",W=" ",N='(\\',U="0.4.0-dev",b=".",ba='|',A='}',B='+';
qx.Bootstrap.define(J,{statics:{version:null,toHtml:null,get:function(bq,br,bs){var bv=document.getElementById(bq);
var bu=bv.innerHTML;
bu=this.toHtml(bu,br,bs);
if(bu.search(/<|>/)===-1){return bu;
}var bt=document.createElement(bg);
bt.innerHTML=bu;
return bt.children[0];
}}});
(function(){var bw=function(){var bx={};
var by=function(){};
by.prototype={otag:bf,ctag:V,pragmas:{},buffer:[],pragmas_implemented:{"IMPLICIT-ITERATOR":true},context:{},render:function(bz,bA,bB,bC){if(!bC){this.context=bA;
this.buffer=[];
}if(!this.includes(n,bz)){if(bC){return bz;
}else{this.send(bz);
return;
}}bz=this.render_pragmas(bz);
var bD=this.render_section(bz,bA,bB);
if(bD===false){bD=this.render_tags(bz,bA,bB,bC);
}
if(bC){return bD;
}else{this.sendLines(bD);
}},send:function(bE){if(bE!==n){this.buffer.push(bE);
}},sendLines:function(bF){if(bF){var bG=bF.split(k);

for(var i=0;i<bG.length;i++){this.send(bG[i]);
}}},render_pragmas:function(bH){if(!this.includes(q,bH)){return bH;
}var bJ=this;
var bI=this.getCachedRegex(o,function(bK,bL){return new RegExp(bK+S+bL,j);
});
return bH.replace(bI,function(bM,bN,bO){if(!bJ.pragmas_implemented[bN]){throw ({message:x+bN+Q});
}bJ.pragmas[bN]={};

if(bO){var bP=bO.split(bo);
bJ.pragmas[bN][bP[0]]=bP[1];
}return n;
});
},render_partial:function(name,bQ,bR){name=this.trim(name);

if(!bR||bR[name]===undefined){throw ({message:u+name+d});
}
if(typeof (bQ[name])!=bn){return this.render(bR[name],bQ,bR,true);
}return this.render(bR[name],bQ[name],bR,true);
},render_section:function(bS,bT,bU){if(!this.includes(g,bS)&&!this.includes(h,bS)){return false;
}var bW=this;
var bV=this.getCachedRegex(H,function(bX,bY){return new RegExp(L+bX+E+bY+T+bX+y+bY+X,j);
});
return bS.replace(bV,function(ca,cb,cc,name,content,cd){var ce=cb?bW.render_tags(cb,bT,bU,true):n,cf=cd?bW.render(cd,bT,bU,true):n,cg,ch=bW.find(name,bT);

if(cc===h){if(!ch||bW.is_array(ch)&&ch.length===0){cg=bW.render(content,bT,bU,true);
}else{cg=n;
}}else if(cc===g){if(bW.is_array(ch)){cg=bW.map(ch,function(ci){return bW.render(content,bW.create_context(ci),bU,true);
}).join(n);
}else if(bW.is_object(ch)){cg=bW.render(content,bW.create_context(ch),bU,true);
}else if(typeof ch===m){cg=ch.call(bT,content,function(cj){return bW.render(cj,bT,bU,true);
});
}else if(ch){cg=bW.render(content,bT,bU,true);
}else{cg=n;
}}return ce+cg+cf;
});
},render_tags:function(ck,cl,cm,cn){var cp=this;
var cs=function(){return cp.getCachedRegex(bj,function(ct,cu){return new RegExp(ct+z+cu+bl,j);
});
};
var co=cs();
var cq=function(cv,cw,name){switch(cw){case D:return n;
case bo:cp.set_delimiters(name);
co=cs();
return n;
case c:return cp.render_partial(name,cl,cm);
case Y:return cp.find(name,cl);
default:return cp.escape(cp.find(name,cl));
}};
var cr=ck.split(k);

for(var i=0;i<cr.length;i++){cr[i]=cr[i].replace(co,cq,this);

if(!cn){this.send(cr[i]);
}}
if(cn){return cr.join(k);
}},set_delimiters:function(cx){var cy=cx.split(W);
this.otag=this.escape_regex(cy[0]);
this.ctag=this.escape_regex(cy[1]);
},escape_regex:function(cz){if(!arguments.callee.sRE){var cA=[G,bp,bc,B,O,ba,C,e,R,w,be,A,bm];
arguments.callee.sRE=new RegExp(N+cA.join(v)+e,bd);
}return cz.replace(arguments.callee.sRE,bb);
},find:function(name,cB){name=this.trim(name);
function cC(cF){return cF===false||cF===0||cF;
}var cD;
if(name.match(/([a-z_]+)\./ig)){var cE=this.walk_context(name,cB);

if(cC(cE)){cD=cE;
}}else{if(cC(cB[name])){cD=cB[name];
}else if(cC(this.context[name])){cD=this.context[name];
}}
if(typeof cD===m){return cD.apply(cB);
}
if(cD!==undefined){return cD;
}return n;
},walk_context:function(name,cG){var cH=name.split(bp);
var cI=(cG[cH[0]]!=undefined)?cG:this.context;
var cJ=cI[cH.shift()];

while(cJ!=undefined&&cH.length>0){cI=cJ;
cJ=cJ[cH.shift()];
}if(typeof cJ===m){return cJ.apply(cI);
}return cJ;
},includes:function(cK,cL){return cL.indexOf(this.otag+cK)!=-1;
},escape:function(s){s=String(s===null?n:s);
return s.replace(/&(?!\w+;)|["'<>\\]/g,function(s){switch(s){case P:return I;
case F:return t;
case d:return bh;
case p:return M;
case c:return bk;
default:return s;
}});
},create_context:function(cM){if(this.is_object(cM)){return cM;
}else{var cO=b;

if(this.pragmas[f]){cO=this.pragmas[f].iterator;
}var cN={};
cN[cO]=cM;
return cN;
}},is_object:function(a){return a&&typeof a==bn;
},is_array:function(a){return Object.prototype.toString.call(a)===bi;
},trim:function(s){return s.replace(/^\s*|\s*$/g,n);
},map:function(cP,cQ){if(typeof cP.map==m){return cP.map(cQ);
}else{var r=[];
var l=cP.length;

for(var i=0;i<l;i++){r.push(cQ(cP[i]));
}return r;
}},getCachedRegex:function(name,cR){var cU=bx[this.otag];

if(!cU){cU=bx[this.otag]={};
}var cS=cU[this.ctag];

if(!cS){cS=cU[this.ctag]={};
}var cT=cS[name];

if(!cT){cT=cS[name]=cR(this.otag,this.ctag);
}return cT;
}};
return ({name:K,version:U,to_html:function(cV,cW,cX,cY){var da=new by();

if(cY){da.send=cY;
}da.render(cV,cW||{},cX);

if(!cY){return da.buffer.join(k);
}}});
}();
qx.bom.Template.version=bw.version;
qx.bom.Template.toHtml=bw.to_html;
})();
})();
(function(){var o="String",n="execute",m="qx.ui.menu.Menu",l="_shortcut",k="changeEnabled",j="changeToolTipText",i="Boolean",h="qx.ui.core.Command",g="changeLabel",f="changeMenu",c="changeIcon",e="changeValue",d="_applyShortcut",b="_applyEnabled",a="qx.event.type.Data";
qx.Class.define(h,{extend:qx.core.Object,construct:function(p){qx.core.Object.call(this);
this._shortcut=new qx.bom.Shortcut(p);
this._shortcut.addListener(n,this.execute,this);
},events:{"execute":a},properties:{enabled:{init:true,check:i,event:k,apply:b},shortcut:{check:o,apply:d,nullable:true},label:{check:o,nullable:true,event:g},icon:{check:o,nullable:true,event:c},toolTipText:{check:o,nullable:true,event:j},value:{nullable:true,event:e},menu:{check:m,nullable:true,event:f}},members:{_shortcut:null,_applyEnabled:function(q){this._shortcut.setEnabled(q);
},_applyShortcut:function(r){this._shortcut.setShortcut(r);
},execute:function(s){this.fireDataEvent(n,s);
},toString:function(){return this._shortcut.toString();
}},destruct:function(){this._disposeObjects(l);
this.removeListener(n,this.execute,this);
}});
})();
(function(){var m="Unidentified",l="Boolean",k="+",j="short",h="keydown",g="",f="Control",d="keypress",c="-",b="PageUp",S="Escape",R="qx.event.type.Data",Q="_applyShortcut",P="PrintScreen",O="NumLock",N="5",M="8",L="execute",K="Meta",J="0",t="2",u="Shift",r="You can only specify one non modifier key!",s="3",p="/",q="Delete",n="String",o="changeEnabled",v="*",w="qx.bom.Shortcut",B="6",A="4",D="1",C="Alt",F="Not a valid key name for a shortcut: ",E="PageDown",y="Whitespaces are not allowed within shortcuts",I="_applyEnabled",H="7",G="a",x="z",z="9";
qx.Class.define(w,{extend:qx.core.Object,construct:function(T){qx.core.Object.call(this);
this.__ph={};
this.__pi=null;

if(T!=null){this.setShortcut(T);
}this.initEnabled();
},events:{"execute":R},properties:{enabled:{init:true,check:l,event:o,apply:I},shortcut:{check:n,apply:Q,nullable:true},autoRepeat:{check:l,init:false}},members:{__ph:g,__pi:g,execute:function(U){this.fireDataEvent(L,U);
},__pj:function(event){if(this.getEnabled()&&this.__pk(event)){if(!this.isAutoRepeat()){this.execute(event.getTarget());
}event.stop();
}},__dK:function(event){if(this.getEnabled()&&this.__pk(event)){if(this.isAutoRepeat()){this.execute(event.getTarget());
}event.stop();
}},_applyEnabled:function(V,W){if(V){qx.event.Registration.addListener(document.documentElement,h,this.__pj,this);
qx.event.Registration.addListener(document.documentElement,d,this.__dK,this);
}else{qx.event.Registration.removeListener(document.documentElement,h,this.__pj,this);
qx.event.Registration.removeListener(document.documentElement,d,this.__dK,this);
}},_applyShortcut:function(X,Y){if(X){if(X.search(/[\s]+/)!=-1){var bc=y;
this.error(bc);
throw new Error(bc);
}this.__ph={"Control":false,"Shift":false,"Meta":false,"Alt":false};
this.__pi=null;
var ba;
var a=[];

while(X.length>0&&ba!=-1){ba=X.search(/[-+]+/);
a.push((X.length==1||ba==-1)?X:X.substring(0,ba));
X=X.substring(ba+1);
}var bb=a.length;

for(var i=0;i<bb;i++){var bd=this.__pm(a[i]);

switch(bd){case f:case u:case K:case C:this.__ph[bd]=true;
break;
case m:var bc=F+a[i];
this.error(bc);
throw bc;
default:if(this.__pi){var bc=r;
this.error(bc);
throw bc;
}this.__pi=bd;
}}}return true;
},__pk:function(e){var be=this.__pi;

if(!be){return ;
}if((!this.__ph.Shift&&e.isShiftPressed())||(this.__ph.Shift&&!e.isShiftPressed())||(!this.__ph.Control&&e.isCtrlPressed())||(this.__ph.Control&&!e.isCtrlPressed())||(!this.__ph.Meta&&e.isMetaPressed())||(this.__ph.Meta&&!e.isMetaPressed())||(!this.__ph.Alt&&e.isAltPressed())||(this.__ph.Alt&&!e.isAltPressed())){return false;
}
if(be==e.getKeyIdentifier()){return true;
}return false;
},__pl:{esc:S,ctrl:f,print:P,del:q,pageup:b,pagedown:E,numlock:O,numpad_0:J,numpad_1:D,numpad_2:t,numpad_3:s,numpad_4:A,numpad_5:N,numpad_6:B,numpad_7:H,numpad_8:M,numpad_9:z,numpad_divide:p,numpad_multiply:v,numpad_minus:c,numpad_plus:k},__pm:function(bf){var bg=qx.event.handler.Keyboard;
var bh=m;

if(bg.isValidKeyIdentifier(bf)){return bf;
}
if(bf.length==1&&bf>=G&&bf<=x){return bf.toUpperCase();
}bf=bf.toLowerCase();
var bh=this.__pl[bf]||qx.lang.String.firstUp(bf);

if(bg.isValidKeyIdentifier(bh)){return bh;
}else{return m;
}},toString:function(){var bk=this.__pi;
var bj=[];

for(var bi in this.__ph){if(this.__ph[bi]){bj.push(qx.locale.Key.getKeyName(j,bi));
}}
if(bk){bj.push(qx.locale.Key.getKeyName(j,bk));
}return bj.join(k);
}},destruct:function(){this.setEnabled(false);
this.__ph=this.__pi=null;
}});
})();
(function(){var t="",s='indexOf',r='slice',q='concat',p='toLocaleLowerCase',o="qx.type.BaseString",n='match',m='toLocaleUpperCase',k='search',j='replace',c='toLowerCase',h='charCodeAt',f='split',b='substring',a='lastIndexOf',e='substr',d='toUpperCase',g='charAt';
qx.Class.define(o,{extend:Object,construct:function(u){var u=u||t;
this.__dF=u;
this.length=u.length;
},members:{$$isString:true,length:0,__dF:null,toString:function(){return this.__dF;
},charAt:null,valueOf:null,charCodeAt:null,concat:null,indexOf:null,lastIndexOf:null,match:null,replace:null,search:null,slice:null,split:null,substr:null,substring:null,toLowerCase:null,toUpperCase:null,toHashCode:function(){return qx.core.ObjectRegistry.toHashCode(this);
},toLocaleLowerCase:null,toLocaleUpperCase:null,base:function(v,w){return qx.core.Object.prototype.base.apply(this,arguments);
}},defer:function(x,y){var z=[g,h,q,s,a,n,j,k,r,f,e,b,c,d,p,m];
y.valueOf=y.toString;

if(new x(t).valueOf()==null){delete y.valueOf;
}
for(var i=0,l=z.length;i<l;i++){y[z[i]]=String.prototype[z[i]];
}}});
})();
(function(){var a="qx.locale.LocalizedString";
qx.Class.define(a,{extend:qx.type.BaseString,construct:function(b,c,d){qx.type.BaseString.call(this,b);
this.__hk=c;
this.__hl=d;
},members:{__hk:null,__hl:null,translate:function(){return qx.locale.Manager.getInstance().translate(this.__hk,this.__hl);
}}});
})();
(function(){var l="_",k="",j="locale",h="_applyLocale",g="changeLocale",f="C",e="locale.variant",d="qx.dynlocale",c="qx.locale.Manager",b="String",a="singleton";
qx.Class.define(c,{type:a,extend:qx.core.Object,construct:function(){qx.core.Object.call(this);
this.__hL=qx.$$translations||{};
this.__hM=qx.$$locales||{};
var m=qx.core.Environment.get(j);
var n=qx.core.Environment.get(e);

if(n!==k){m+=l+n;
}this.__hN=m;
this.setLocale(m||this.__hO);
},statics:{tr:function(o,p){var q=qx.lang.Array.fromArguments(arguments);
q.splice(0,1);
return qx.locale.Manager.getInstance().translate(o,q);
},trn:function(r,s,t,u){var v=qx.lang.Array.fromArguments(arguments);
v.splice(0,3);
if(t!=1){return qx.locale.Manager.getInstance().translate(s,v);
}else{return qx.locale.Manager.getInstance().translate(r,v);
}},trc:function(w,x,y){var z=qx.lang.Array.fromArguments(arguments);
z.splice(0,2);
return qx.locale.Manager.getInstance().translate(x,z);
},marktr:function(A){return A;
}},properties:{locale:{check:b,nullable:true,apply:h,event:g}},members:{__hO:f,__hP:null,__hQ:null,__hL:null,__hM:null,__hN:null,getLanguage:function(){return this.__hQ;
},getTerritory:function(){return this.getLocale().split(l)[1]||k;
},getAvailableLocales:function(B){var D=[];

for(var C in this.__hM){if(C!=this.__hO){if(this.__hM[C]===null&&!B){continue;
}D.push(C);
}}return D;
},__hR:function(E){var G;

if(E==null){return null;
}var F=E.indexOf(l);

if(F==-1){G=E;
}else{G=E.substring(0,F);
}return G;
},_applyLocale:function(H,I){this.__hP=H;
this.__hQ=this.__hR(H);
},addTranslation:function(J,K){var L=this.__hL;

if(L[J]){for(var M in K){L[J][M]=K[M];
}}else{L[J]=K;
}},addLocale:function(N,O){var P=this.__hM;

if(P[N]){for(var Q in O){P[N][Q]=O[Q];
}}else{P[N]=O;
}},translate:function(R,S,T){var U=this.__hL;
return this.__hS(U,R,S,T);
},localize:function(V,W,X){var Y=this.__hM;
return this.__hS(Y,V,W,X);
},__hS:function(ba,bb,bc,bd){var be;

if(!ba){return bb;
}
if(bd){var bg=this.__hR(bd);
}else{bd=this.__hP;
bg=this.__hQ;
}if(!be&&ba[bd]){be=ba[bd][bb];
}if(!be&&ba[bg]){be=ba[bg][bb];
}if(!be&&ba[this.__hO]){be=ba[this.__hO][bb];
}
if(!be){be=bb;
}
if(bc.length>0){var bf=[];

for(var i=0;i<bc.length;i++){var bh=bc[i];

if(bh&&bh.translate){bf[i]=bh.translate();
}else{bf[i]=bh;
}}be=qx.lang.String.format(be,bf);
}
if(qx.core.Environment.get(d)){be=new qx.locale.LocalizedString(be,bb,bc);
}return be;
}},destruct:function(){this.__hL=this.__hM=null;
}});
})();
(function(){var by="Control",bx="Left",bw="Meta",bv="Pause",bu="End",bt="Down",bs="Ctrl",br="Home",bq="Apps",bp="Win",be="Right",bd="Backspace",bc="Space",bb="Up",ba="Shift",Y="Enter",X="Scroll",W="Alt",V="Escape",U="key_full_Meta",bF="PrintScreen",bG="NumLock",bD="key_short_Alt",bE="key_short_Control_Mac",bB="key_short_Insert",bC="Del",bz="key_full_Enter",bA="key_full_Control",bH="qx.locale.Key",bI="Tabulator",bi="key_full_Space",bh="key_short_Meta",bk="key_short_PageUp",bj="key_short_Pause",bm="key_full_Down",bl="key_short_Apps",bo="key_short_Win",bn="key_full_Right",bg="os.name",bf="key_short_Up",a="key_full_PageDown",b="key_full_Alt",c="PgDn",d="Esc",e="key_full_Insert",f="osx",g="key_short_Space",h="key_short_Backspace",i="key_short_Home",j="key_short_Down",bM="PgUp",bL="_Mac",bK="key_short_CapsLock",bJ="PageUp",bQ="key_full_Up",bP="key_full_Home",bO="key_full_Backspace",bN="PageDown",bS="CapsLock",bR="Ins",E="key_short_PrintScreen",F="Tab",C="key_full_Apps",D="key_short_Tab",I="key_short_End",J="_",G="Caps",H="key_short_NumLock",A="Num",B="key_full_Scroll",r="key_short_Left",q="key_short_Scroll",t="key_",s="key_full_Pause",n="key_short_Right",m="key_full_PrintScreen",p="key_full_Win",o="key_full_Control_Mac",l="key_short_Shift",k="key_short_PageDown",O="key_short_Enter",P="key_short_Control",Q="Insert",R="key_short_Escape",K="key_full_Tab",L="Print",M="Delete",N="key_full_CapsLock",S="key_full_Escape",T="key_short_Delete",z="key_full_PageUp",y="key_full_Shift",x="key_full_NumLock",w="key_full_Delete",v="key_full_End",u="key_full_Left";
qx.Class.define(bH,{statics:{getKeyName:function(bT,bU,bV){var bX=t+bT+J+bU;
if(qx.core.Environment.get(bg)==f&&bU==by){bX+=bL;
}var bW=qx.locale.Manager.getInstance().translate(bX,[],bV);

if(bW==bX){return qx.locale.Key._keyNames[bX]||bU;
}else{return bW;
}}},defer:function(bY){var cb={};
var ca=qx.locale.Manager;
cb[ca.marktr(h)]=bd;
cb[ca.marktr(D)]=F;
cb[ca.marktr(g)]=bc;
cb[ca.marktr(O)]=Y;
cb[ca.marktr(l)]=ba;
cb[ca.marktr(P)]=bs;
cb[ca.marktr(bE)]=bs;
cb[ca.marktr(bD)]=W;
cb[ca.marktr(bK)]=G;
cb[ca.marktr(bh)]=bw;
cb[ca.marktr(R)]=d;
cb[ca.marktr(r)]=bx;
cb[ca.marktr(bf)]=bb;
cb[ca.marktr(n)]=be;
cb[ca.marktr(j)]=bt;
cb[ca.marktr(bk)]=bM;
cb[ca.marktr(k)]=c;
cb[ca.marktr(I)]=bu;
cb[ca.marktr(i)]=br;
cb[ca.marktr(bB)]=bR;
cb[ca.marktr(T)]=bC;
cb[ca.marktr(H)]=A;
cb[ca.marktr(E)]=L;
cb[ca.marktr(q)]=X;
cb[ca.marktr(bj)]=bv;
cb[ca.marktr(bo)]=bp;
cb[ca.marktr(bl)]=bq;
cb[ca.marktr(bO)]=bd;
cb[ca.marktr(K)]=bI;
cb[ca.marktr(bi)]=bc;
cb[ca.marktr(bz)]=Y;
cb[ca.marktr(y)]=ba;
cb[ca.marktr(bA)]=by;
cb[ca.marktr(o)]=by;
cb[ca.marktr(b)]=W;
cb[ca.marktr(N)]=bS;
cb[ca.marktr(U)]=bw;
cb[ca.marktr(S)]=V;
cb[ca.marktr(u)]=bx;
cb[ca.marktr(bQ)]=bb;
cb[ca.marktr(bn)]=be;
cb[ca.marktr(bm)]=bt;
cb[ca.marktr(z)]=bJ;
cb[ca.marktr(a)]=bN;
cb[ca.marktr(v)]=bu;
cb[ca.marktr(bP)]=br;
cb[ca.marktr(e)]=Q;
cb[ca.marktr(w)]=M;
cb[ca.marktr(x)]=bG;
cb[ca.marktr(m)]=bF;
cb[ca.marktr(B)]=X;
cb[ca.marktr(s)]=bv;
cb[ca.marktr(p)]=bp;
cb[ca.marktr(C)]=bq;
bY._keyNames=cb;
}});
})();


qx.$$loader.init();

