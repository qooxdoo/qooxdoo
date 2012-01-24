(function(){

if (!window.qx) window.qx = {};

qx.$$start = new Date();
  
if (!qx.$$environment) qx.$$environment = {};
var envinfo = {"qx.debug":false,"qx.optimization.basecalls":true,"qx.optimization.comments":true,"qx.optimization.privates":true,"qx.optimization.strings":true,"qx.optimization.variables":true,"qx.optimization.variants":true,"qx.version":"2.0"};
for (var k in envinfo) qx.$$environment[k] = envinfo[k];

if (!qx.$$libraries) qx.$$libraries = {};
var libinfo = {"__out__":{"sourceUri":"script"},"qx":{"resourceUri":"resource","sourceUri":"script"}};
for (var k in libinfo) qx.$$libraries[k] = libinfo[k];

qx.$$resources = {};
qx.$$translations = {"C":null,"en":null};
qx.$$locales = {"C":null,"en":null};
qx.$$packageData = {};

qx.$$loader = {
  parts : {"boot":[0]},
  packages : {"0":{"uris":["__out__:q.ddc0c4eb4685.js"]}},
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

qx.$$packageData['0']={"locales":{},"resources":{},"translations":{}};
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
},__a:[r,F,D,m,y,I],getKeys:({"ES5":Object.keys,"BROKEN_IE":function(bu){var bv=[];
var bx=Object.prototype.hasOwnProperty;

for(var by in bu){if(bx.call(bu,by)){bv.push(by);
}}var bw=qx.Bootstrap.__a;

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
},__b:{"[object String]":e,"[object Array]":g,"[object Object]":j,"[object RegExp]":C,"[object Number]":x,"[object Boolean]":K,"[object Date]":s,"[object Function]":d,"[object Error]":J},bind:function(bG,self,bH){var bI=Array.prototype.slice.call(arguments,2,arguments.length);
return function(){var bJ=Array.prototype.slice.call(arguments,0,arguments.length);
return bG.apply(self,bI.concat(bJ));
};
},firstUp:function(bK){return bK.charAt(0).toUpperCase()+bK.substr(1);
},firstLow:function(bL){return bL.charAt(0).toLowerCase()+bL.substr(1);
},getClass:function(bM){var bN=Object.prototype.toString.call(bM);
return (qx.Bootstrap.__b[bN]||bN.slice(8,-1));
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
(function(){var a="q";
qx.Bootstrap.define(a,{});
(function(){q=function(b,c){var d=qx.bom.Selector.query(b,c);
var e=qx.lang.Array.cast(d,qx.Collection);
return e;
};
q.attach=function(f){for(var name in f){qx.Collection.prototype[name]=f[name];
}};
q.attachStatic=function(g){for(var name in g){q[name]=g[name];
}};
})();
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
(function(){var cq="qx.bom.client.CssTransform.get3D",cp="default",co="|",cn="qx.allowUrlSettings",cm="qx.bom.client.Stylesheet.getInsertRule",cl="css.transform.3d",ck="qx.bom.client.Html.getDataset",cj="qx.bom.client.PhoneGap.getPhoneGap",ci="qx.bom.client.Html.getAudioAif",ch="qx.debug.dispose",bt="qx.bom.client.Xml.getAttributeNS",bs="qx.bom.client.Stylesheet.getRemoveImport",br="qx.bom.client.Css.getUserModify",bq="qx.bom.client.Css.getBoxShadow",bp="qx.bom.client.Event.getHashChange",bo="qx.bom.client.Plugin.getWindowsMedia",bn="qx.bom.client.Html.getVideo",bm="qx.bom.client.Device.getName",bl="qx.bom.client.Event.getTouch",bk="qx.optimization.strings",cx="qx.optimization.variables",cy="qx.bom.client.EcmaScript.getStackTrace",cv="qx.bom.client.EcmaScript.getObjectCount",cw="qx.bom.client.Xml.getSelectSingleNode",ct="css.gradient.linear",cu="qx.bom.client.Xml.getImplementation",cr="qx.bom.client.Html.getConsole",cs="qx.bom.client.Engine.getVersion",cz="qx.bom.client.Plugin.getQuicktime",cA="qx.propertyDebugLevel",bR="qx.bom.client.Html.getNaturalDimensions",bQ="qx.bom.client.Xml.getSelectNodes",bT="qx.bom.client.Xml.getElementsByTagNameNS",bS="qx.bom.client.Html.getDataUrl",bV="qx.bom.client.Flash.isAvailable",bU="qx.bom.client.Html.getCanvas",bX="qx.bom.client.Css.getBoxModel",bW="qx.bom.client.Plugin.getSilverlight",bP="qx.bom.client.Css.getUserSelect",bO="qx.bom.client.Css.getRadialGradient",a="module.property",b="qx.bom.client.Plugin.getWindowsMediaVersion",c="qx.bom.client.Stylesheet.getCreateStyleSheet",d="qx.bom.client.Locale.getLocale",e="module.events",f="module.databinding",g="qx.bom.client.Html.getFileReader",h="qx.bom.client.Css.getBorderImage",j="qx.bom.client.Stylesheet.getDeleteRule",k="qx.bom.client.Plugin.getDivXVersion",cE="qx.bom.client.Scroll.scrollBarOverlayed",cD="qx.bom.client.Plugin.getPdfVersion",cC=":",cB="qx.bom.client.Css.getLinearGradient",cI="qx.bom.client.Transport.getXmlHttpRequest",cH="qx.bom.client.Html.getClassList",cG="qx.bom.client.Event.getHelp",cF="qx.optimization.comments",cK="qx.bom.client.Locale.getVariant",cJ="qx.bom.client.Css.getBoxSizing",J="qx.bom.client.OperatingSystem.getName",K="module.logger",H="qx.bom.client.Css.getOverflowXY",I="qx.mobile.emulatetouch",N="qx.bom.client.Html.getAudioWav",O="qx.bom.client.Browser.getName",L="qx.bom.client.Css.getInlineBlock",M="qx.bom.client.Plugin.getPdf",F="qx.dynlocale",G="qx.bom.client.Html.getAudio",s="qx.core.Environment",r="qx.bom.client.CssTransform.getSupport",u="qx.bom.client.Html.getTextContent",t="qx.bom.client.Css.getPlaceholder",o="qx.bom.client.Css.getFloat",n="false",q="qx.bom.client.Html.getXul",p="qx.bom.client.Xml.getCreateNode",m="qxenv",l="qx.bom.client.Html.getSessionStorage",T="qx.bom.client.Html.getAudioAu",U="qx.bom.client.Css.getOpacity",V="qx.bom.client.Html.getVml",W="qx.bom.client.Css.getRgba",P="qx.bom.client.Transport.getMaxConcurrentRequestCount",Q="qx.bom.client.Css.getBorderRadius",R="qx.bom.client.Event.getPointer",S="qx.bom.client.Css.getGradients",X="qx.bom.client.Transport.getSsl",Y="qx.bom.client.Html.getWebWorker",C="qx.bom.client.Json.getJson",B="qx.bom.client.Browser.getQuirksMode",A="qx.bom.client.Css.getTextOverflow",z="qx.bom.client.Xml.getQualifiedItem",y="qx.bom.client.Html.getVideoOgg",x="&",w="qx.bom.client.Browser.getDocumentMode",v="qx.allowUrlVariants",E="qx.bom.client.Html.getContains",D="qx.bom.client.Plugin.getActiveX",ba=".",bb="qx.bom.client.Xml.getDomProperties",bc="qx.bom.client.CssAnimation.getSupport",bd="qx.debug.databinding",be="qx.optimization.basecalls",bf="qx.bom.client.Browser.getVersion",bg="qx.bom.client.Css.getUserSelectNone",bh="true",bi="qx.bom.client.Html.getSvg",bj="qx.optimization.privates",bx="qx.bom.client.Plugin.getDivX",bw="qx.bom.client.Runtime.getName",bv="qx.bom.client.Html.getLocalStorage",bu="qx.bom.client.Flash.getStrictSecurityModel",bB="qx.aspects",bA="qx.debug",bz="qx.dynamicmousewheel",by="qx.bom.client.Html.getAudioMp3",bD="qx.bom.client.Engine.getName",bC="qx.bom.client.Plugin.getGears",bK="qx.bom.client.Plugin.getQuicktimeVersion",bL="qx.bom.client.Html.getAudioOgg",bI="qx.bom.client.Plugin.getSilverlightVersion",bJ="qx.bom.client.Html.getCompareDocumentPosition",bG="qx.bom.client.Flash.getExpressInstall",bH="qx.bom.client.OperatingSystem.getVersion",bE="qx.bom.client.Html.getXPath",bF="qx.bom.client.Html.getGeoLocation",bM="qx.bom.client.Css.getAppearance",bN="qx.mobile.nativescroll",ca="qx.bom.client.Xml.getDomParser",bY="qx.bom.client.Stylesheet.getAddImport",cc="qx.optimization.variants",cb="qx.bom.client.Html.getVideoWebm",ce="qx.bom.client.Flash.getVersion",cd="qx.bom.client.PhoneGap.getNotification",cg="qx.bom.client.Html.getVideoH264",cf="qx.bom.client.Xml.getCreateElementNS";
qx.Bootstrap.define(s,{statics:{_checks:{},_asyncChecks:{},__c:{},_checksMap:{"engine.version":cs,"engine.name":bD,"browser.name":O,"browser.version":bf,"browser.documentmode":w,"browser.quirksmode":B,"runtime.name":bw,"device.name":bm,"locale":d,"locale.variant":cK,"os.name":J,"os.version":bH,"os.scrollBarOverlayed":cE,"plugin.gears":bC,"plugin.activex":D,"plugin.quicktime":cz,"plugin.quicktime.version":bK,"plugin.windowsmedia":bo,"plugin.windowsmedia.version":b,"plugin.divx":bx,"plugin.divx.version":k,"plugin.silverlight":bW,"plugin.silverlight.version":bI,"plugin.flash":bV,"plugin.flash.version":ce,"plugin.flash.express":bG,"plugin.flash.strictsecurity":bu,"plugin.pdf":M,"plugin.pdf.version":cD,"io.maxrequests":P,"io.ssl":X,"io.xhr":cI,"event.touch":bl,"event.pointer":R,"event.help":cG,"event.hashchange":bp,"ecmascript.objectcount":cv,"ecmascript.stacktrace":cy,"html.webworker":Y,"html.filereader":g,"html.geolocation":bF,"html.audio":G,"html.audio.ogg":bL,"html.audio.mp3":by,"html.audio.wav":N,"html.audio.au":T,"html.audio.aif":ci,"html.video":bn,"html.video.ogg":y,"html.video.h264":cg,"html.video.webm":cb,"html.storage.local":bv,"html.storage.session":l,"html.classlist":cH,"html.xpath":bE,"html.xul":q,"html.canvas":bU,"html.svg":bi,"html.vml":V,"html.dataset":ck,"html.dataurl":bS,"html.console":cr,"html.stylesheet.createstylesheet":c,"html.stylesheet.insertrule":cm,"html.stylesheet.deleterule":j,"html.stylesheet.addimport":bY,"html.stylesheet.removeimport":bs,"html.element.contains":E,"html.element.compareDocumentPosition":bJ,"html.element.textcontent":u,"html.image.naturaldimensions":bR,"json":C,"css.textoverflow":A,"css.placeholder":t,"css.borderradius":Q,"css.borderimage":h,"css.boxshadow":bq,"css.gradients":S,"css.gradient.linear":cB,"css.gradient.radial":bO,"css.boxmodel":bX,"css.rgba":W,"css.userselect":bP,"css.userselect.none":bg,"css.usermodify":br,"css.appearance":bM,"css.float":o,"css.boxsizing":cJ,"css.translate3d":cq,"css.animation":bc,"css.transform":r,"css.transform.3d":cq,"css.inlineblock":L,"css.opacity":U,"css.overflowxy":H,"phonegap":cj,"phonegap.notification":cd,"xml.implementation":cu,"xml.domparser":ca,"xml.selectsinglenode":cw,"xml.selectnodes":bQ,"xml.getelementsbytagnamens":bT,"xml.domproperties":bb,"xml.attributens":bt,"xml.createnode":p,"xml.getqualifieditem":z,"xml.createelementns":cf},get:function(cL){if(qx.Bootstrap.DEBUG){var cN={"css.translate3d":cl,"css.gradients":ct,"ecmascript.objectcount":null};

if(cL in cN){qx.Bootstrap.warn("The key '"+cL+"' is deprecated."+(cN[cL]?" Please use '"+cN[cL]+"' instead.":""));
}}if(this.__c[cL]!=undefined){return this.__c[cL];
}var cP=this._checks[cL];

if(cP){var cO=cP();
this.__c[cL]=cO;
return cO;
}var cM=this._getClassNameFromEnvKey(cL);

if(cM[0]!=undefined){var cQ=cM[0];
var cR=cM[1];
var cO=cQ[cR]();
this.__c[cL]=cO;
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

if(this.__c[da]!=undefined){window.setTimeout(function(){db.call(self,df.__c[da]);
},0);
return;
}var de=this._asyncChecks[da];

if(de){de(function(dh){df.__c[da]=dh;
db.call(self,dh);
});
return;
}var dd=this._getClassNameFromEnvKey(da);

if(dd[0]!=undefined){var dg=dd[0];
var dc=dd[1];
dg[dc](function(di){df.__c[da]=di;
db.call(self,di);
});
return;
}if(qx.Bootstrap.DEBUG){qx.Bootstrap.warn(da+" is not a valid key. Please see the API-doc of "+"qx.core.Environment for a list of predefined keys.");
qx.Bootstrap.trace(this);
}},select:function(dj,dk){return this.__d(this.get(dj),dk);
},selectAsync:function(dl,dm,self){this.getAsync(dl,function(dn){var dp=this.__d(dl,dm);
dp.call(self,dn);
},this);
},__d:function(dq,dr){var dt=dr[dq];

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
},invalidateCacheKey:function(dy){delete this.__c[dy];
},add:function(dz,dA){if(this._checks[dz]==undefined){if(dA instanceof Function){this._checks[dz]=dA;
}else{this._checks[dz]=this.__g(dA);
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
},__e:function(){if(qx&&qx.$$environment){for(var dE in qx.$$environment){var dD=qx.$$environment[dE];
this._checks[dE]=this.__g(dD);
}}},__f:function(){if(window.document&&window.document.location){var dF=window.document.location.search.slice(1).split(x);

for(var i=0;i<dF.length;i++){var dH=dF[i].split(cC);

if(dH.length!=3||dH[0]!=m){continue;
}var dI=dH[1];
var dG=decodeURIComponent(dH[2]);
if(dG==bh){dG=true;
}else if(dG==n){dG=false;
}else if(/^(\d|\.)+$/.test(dG)){dG=parseFloat(dG);
}this._checks[dI]=this.__g(dG);
}}},__g:function(dJ){return qx.Bootstrap.bind(function(dK){return dK;
},null,dJ);
}},defer:function(dL){dL._initDefaultQxValues();
dL.__e();
if(dL.get(cn)===true){dL.__f();
}}});
})();
(function(){var u=".",t="function",s="",r="gecko",q="Maple",p="[object Opera]",o="mshtml",n="8.0",m="AppleWebKit/",l="9.0",e="[^\\.0-9]",k="Gecko",h="webkit",c="4.0",b="1.9.0.0",g="opera",f="Version/",i="5.0",a="engine.version",j="qx.bom.client.Engine",d="engine.name";
qx.Bootstrap.define(j,{statics:{getVersion:function(){var y=window.navigator.userAgent;
var w=s;

if(qx.bom.client.Engine.__h()){if(/Opera[\s\/]([0-9]+)\.([0-9])([0-9]*)/.test(y)){if(y.indexOf(f)!=-1){var x=y.match(/Version\/(\d+)\.(\d+)/);
w=x[1]+u+x[2].charAt(0)+u+x[2].substring(1,x[2].length);
}else{w=RegExp.$1+u+RegExp.$2;

if(RegExp.$3!=s){w+=u+RegExp.$3;
}}}}else if(qx.bom.client.Engine.__i()){if(/AppleWebKit\/([^ ]+)/.test(y)){w=RegExp.$1;
var z=RegExp(e).exec(w);

if(z){w=w.slice(0,z.index);
}}}else if(qx.bom.client.Engine.__k()||qx.bom.client.Engine.__j()){if(/rv\:([^\);]+)(\)|;)/.test(y)){w=RegExp.$1;
}}else if(qx.bom.client.Engine.__l()){if(/MSIE\s+([^\);]+)(\)|;)/.test(y)){w=RegExp.$1;
if(w<8&&/Trident\/([^\);]+)(\)|;)/.test(y)){if(RegExp.$1==c){w=n;
}else if(RegExp.$1==i){w=l;
}}}}else{var v=window.qxFail;

if(v&&typeof v===t){w=v().FULLVERSION;
}else{w=b;
qx.Bootstrap.warn("Unsupported client: "+y+"! Assumed gecko version 1.9.0.0 (Firefox 3.0).");
}}return w;
},getName:function(){var name;

if(qx.bom.client.Engine.__h()){name=g;
}else if(qx.bom.client.Engine.__i()){name=h;
}else if(qx.bom.client.Engine.__k()||qx.bom.client.Engine.__j()){name=r;
}else if(qx.bom.client.Engine.__l()){name=o;
}else{var A=window.qxFail;

if(A&&typeof A===t){name=A().NAME;
}else{name=r;
qx.Bootstrap.warn("Unsupported client: "+window.navigator.userAgent+"! Assumed gecko version 1.9.0.0 (Firefox 3.0).");
}}return name;
},__h:function(){return window.opera&&Object.prototype.toString.call(window.opera)==p;
},__i:function(){return window.navigator.userAgent.indexOf(m)!=-1;
},__j:function(){return window.navigator.userAgent.indexOf(q)!=-1;
},__k:function(){return window.controllers&&window.navigator.product===k&&window.navigator.userAgent.indexOf(q)==-1;
},__l:function(){return window.navigator.cpuClass&&/MSIE\s+([^\);]+)(\)|;)/.test(window.navigator.userAgent);
}},defer:function(B){qx.core.Environment.add(a,B.getVersion);
qx.core.Environment.add(d,B.getName);
}});
})();
(function(){var a="qx.lang.Date";
qx.Bootstrap.define(a,{statics:{now:function(){return +new Date;
}}});
})();
(function(){var g="emulated",f="native",e='"',d="qx.lang.Core",c="\\\\",b="\\\"",a="[object Error]";
qx.Bootstrap.define(d,{statics:{errorToString:{"native":Error.prototype.toString,"emulated":function(){return this.message;
}}[(!Error.prototype.toString||Error.prototype.toString()==a)?g:f],arrayIndexOf:{"native":Array.prototype.indexOf,"emulated":function(h,j){if(j==null){j=0;
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
}}[Array.prototype.every?f:g],stringQuote:{"native":String.prototype.quote,"emulated":function(){return e+this.replace(/\\/g,c).replace(/\"/g,b)+e;
}}[String.prototype.quote?f:g]}});
if(!Error.prototype.toString){Error.prototype.toString=qx.lang.Core.errorToString;
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
(function(){var a="qx.Collection";
qx.Bootstrap.define(a,{extend:qx.type.BaseArray,members:{}});
})();
(function(){var a="qx.module.Css";
qx.Bootstrap.define(a,{statics:{setStyle:function(name,b){for(var i=0;i<this.length;i++){qx.bom.element.Style.set(this[i],name,b);
}return this;
},getStyle:function(name){if(this[0]){return qx.bom.element.Style.get(this[0],name);
}return null;
},setStyles:function(c){for(var name in c){this.setStyle(name,c[name]);
}return this;
},getStyles:function(d){var e={};

for(var i=0;i<d.length;i++){e[d[i]]=this.getStyle(d[i]);
}return e;
},addClass:function(name){for(var i=0;i<this.length;i++){qx.bom.element.Class.add(this[i],name);
}return this;
},removeClass:function(name){for(var i=0;i<this.length;i++){qx.bom.element.Class.remove(this[i],name);
}return this;
},hasClass:function(name){if(!this[0]){return false;
}return qx.bom.element.Class.has(this[0],name);
},toggleClass:function(name){this.hasClass(name)?this.removeClass(name):this.addClass(name);
return this;
}},defer:function(f){q.attach({"setStyle":f.setStyle,"getStyle":f.getStyle,"setStyles":f.setStyles,"getStyles":f.getStyles,"addClass":f.addClass,"removeClass":f.removeClass,"hasClass":f.hasClass,"toggleClass":f.toggleClass});
}});
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
(function(){var k="css.overflowxy",j="hidden",i="-moz-scrollbars-none",h="",g="engine.name",f="gecko",e="overflow",d="overflowY",b="engine.version",a="none",B="scroll",A="borderLeftStyle",z="borderRightStyle",y="div",x="borderRightWidth",w="overflow-y",v="borderLeftWidth",u="-moz-scrollbars-vertical",r=":",q="100px",o="overflow:",p="qx.bom.element.Overflow",m="overflow-x",n="overflowX",l=";";
qx.Bootstrap.define(p,{statics:{DEFAULT_SCROLLBAR_WIDTH:14,__Y:null,getScrollbarWidth:function(){if(this.__Y!==null){return this.__Y;
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
this.__Y=c;
document.body.removeChild(t);
return this.__Y;
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
(function(){var p="",o="g",n="]",m='\\u',l="undefined",k='\\$1',j="0041-005A0061-007A00AA00B500BA00C0-00D600D8-00F600F8-02C102C6-02D102E0-02E402EC02EE0370-037403760377037A-037D03860388-038A038C038E-03A103A3-03F503F7-0481048A-05250531-055605590561-058705D0-05EA05F0-05F20621-064A066E066F0671-06D306D506E506E606EE06EF06FA-06FC06FF07100712-072F074D-07A507B107CA-07EA07F407F507FA0800-0815081A082408280904-0939093D09500958-0961097109720979-097F0985-098C098F09900993-09A809AA-09B009B209B6-09B909BD09CE09DC09DD09DF-09E109F009F10A05-0A0A0A0F0A100A13-0A280A2A-0A300A320A330A350A360A380A390A59-0A5C0A5E0A72-0A740A85-0A8D0A8F-0A910A93-0AA80AAA-0AB00AB20AB30AB5-0AB90ABD0AD00AE00AE10B05-0B0C0B0F0B100B13-0B280B2A-0B300B320B330B35-0B390B3D0B5C0B5D0B5F-0B610B710B830B85-0B8A0B8E-0B900B92-0B950B990B9A0B9C0B9E0B9F0BA30BA40BA8-0BAA0BAE-0BB90BD00C05-0C0C0C0E-0C100C12-0C280C2A-0C330C35-0C390C3D0C580C590C600C610C85-0C8C0C8E-0C900C92-0CA80CAA-0CB30CB5-0CB90CBD0CDE0CE00CE10D05-0D0C0D0E-0D100D12-0D280D2A-0D390D3D0D600D610D7A-0D7F0D85-0D960D9A-0DB10DB3-0DBB0DBD0DC0-0DC60E01-0E300E320E330E40-0E460E810E820E840E870E880E8A0E8D0E94-0E970E99-0E9F0EA1-0EA30EA50EA70EAA0EAB0EAD-0EB00EB20EB30EBD0EC0-0EC40EC60EDC0EDD0F000F40-0F470F49-0F6C0F88-0F8B1000-102A103F1050-1055105A-105D106110651066106E-10701075-1081108E10A0-10C510D0-10FA10FC1100-1248124A-124D1250-12561258125A-125D1260-1288128A-128D1290-12B012B2-12B512B8-12BE12C012C2-12C512C8-12D612D8-13101312-13151318-135A1380-138F13A0-13F41401-166C166F-167F1681-169A16A0-16EA1700-170C170E-17111720-17311740-17511760-176C176E-17701780-17B317D717DC1820-18771880-18A818AA18B0-18F51900-191C1950-196D1970-19741980-19AB19C1-19C71A00-1A161A20-1A541AA71B05-1B331B45-1B4B1B83-1BA01BAE1BAF1C00-1C231C4D-1C4F1C5A-1C7D1CE9-1CEC1CEE-1CF11D00-1DBF1E00-1F151F18-1F1D1F20-1F451F48-1F4D1F50-1F571F591F5B1F5D1F5F-1F7D1F80-1FB41FB6-1FBC1FBE1FC2-1FC41FC6-1FCC1FD0-1FD31FD6-1FDB1FE0-1FEC1FF2-1FF41FF6-1FFC2071207F2090-209421022107210A-211321152119-211D212421262128212A-212D212F-2139213C-213F2145-2149214E218321842C00-2C2E2C30-2C5E2C60-2CE42CEB-2CEE2D00-2D252D30-2D652D6F2D80-2D962DA0-2DA62DA8-2DAE2DB0-2DB62DB8-2DBE2DC0-2DC62DC8-2DCE2DD0-2DD62DD8-2DDE2E2F300530063031-3035303B303C3041-3096309D-309F30A1-30FA30FC-30FF3105-312D3131-318E31A0-31B731F0-31FF3400-4DB54E00-9FCBA000-A48CA4D0-A4FDA500-A60CA610-A61FA62AA62BA640-A65FA662-A66EA67F-A697A6A0-A6E5A717-A71FA722-A788A78BA78CA7FB-A801A803-A805A807-A80AA80C-A822A840-A873A882-A8B3A8F2-A8F7A8FBA90A-A925A930-A946A960-A97CA984-A9B2A9CFAA00-AA28AA40-AA42AA44-AA4BAA60-AA76AA7AAA80-AAAFAAB1AAB5AAB6AAB9-AABDAAC0AAC2AADB-AADDABC0-ABE2AC00-D7A3D7B0-D7C6D7CB-D7FBF900-FA2DFA30-FA6DFA70-FAD9FB00-FB06FB13-FB17FB1DFB1F-FB28FB2A-FB36FB38-FB3CFB3EFB40FB41FB43FB44FB46-FBB1FBD3-FD3DFD50-FD8FFD92-FDC7FDF0-FDFBFE70-FE74FE76-FEFCFF21-FF3AFF41-FF5AFF66-FFBEFFC2-FFC7FFCA-FFCFFFD2-FFD7FFDA-FFDC",h='-',g="qx.lang.String",f="(^|[^",c="0",e="%",d=' ',b='\n',a="])[";
qx.Bootstrap.define(g,{statics:{__ba:j,__bb:null,__m:{},camelCase:function(q){var r=this.__m[q];

if(!r){r=q.replace(/\-([a-z])/g,function(s,t){return t.toUpperCase();
});
}return r;
},hyphenate:function(u){var v=this.__m[u];

if(!v){v=u.replace(/[A-Z]/g,function(w){return (h+w.charAt(0).toLowerCase());
});
}return v;
},capitalize:function(x){if(this.__bb===null){var y=m;
this.__bb=new RegExp(f+this.__ba.replace(/[0-9A-F]{4}/g,function(z){return y+z;
})+a+this.__ba.replace(/[0-9A-F]{4}/g,function(A){return y+A;
})+n,o);
}return x.replace(this.__bb,function(B){return B.toUpperCase();
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
(function(){var f="qx.lang.Type",e="Error",d="RegExp",c="Date",b="Number",a="Boolean";
qx.Bootstrap.define(f,{statics:{getClass:qx.Bootstrap.getClass,isString:qx.Bootstrap.isString,isArray:qx.Bootstrap.isArray,isObject:qx.Bootstrap.isObject,isFunction:qx.Bootstrap.isFunction,isRegExp:function(g){return this.getClass(g)==d;
},isNumber:function(h){return (h!==null&&(this.getClass(h)==b||h instanceof Number));
},isBoolean:function(i){return (i!==null&&(this.getClass(i)==a||i instanceof Boolean));
},isDate:function(j){return (j!==null&&(this.getClass(j)==c||j instanceof Date));
},isError:function(k){return (k!==null&&(this.getClass(k)==e||k instanceof Error));
}}});
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

if(O instanceof Array){for(var i=0;i<O.length;i++){this.__bc(P,O[i],N,M);
}}else{this.__bc(P,O,N,M);
}}}return N.join(b);
},__bc:function(Q,R,S,T){var U=window.encodeURIComponent;

if(T){S.push(U(Q).replace(/%20/g,c)+d+U(R).replace(/%20/g,c));
}else{S.push(U(Q)+d+U(R));
}}}});
})();
(function(){var k="div",j="-moz-none",h="string",g="backgroundImage",f="inline-block",e="-moz-inline-box",d="span",c="color",b="css.float",a="css.inlineblock",bb="css.usermodify",ba="boxSizing",Y="placeholder",X="content",W="css.appearance",V="css.gradient.radial",U="borderImage",T="userSelect",S="css.overflowxy",R="styleFloat",r="css.userselect",s="css.boxsizing",p="css.boxmodel",q="qx.bom.client.Css",n="appearance",o='m11',l="input",m="css.boxshadow",v="css.gradient.legacywebkit",w="css.borderradius",E="linear-gradient(0deg, #fff, #000)",C="css.opacity",J="css.borderimage",G="rgba(1, 2, 3, 0.5)",N="radial-gradient(0px 0px, cover, red 50%, blue 100%)",L="rgba",y="css.gradients",Q="borderRadius",P="css.gradient.linear",O='WebKitCSSMatrix',x="-webkit-gradient(linear,0% 0%,100% 100%,from(white), to(red))",A="mshtml",B="css.rgba",D="none",F="css.placeholder",H="css.userselect.none",K="css.textoverflow",M="textOverflow",t="userModify",u="boxShadow",z="cssFloat",I="border";
qx.Bootstrap.define(q,{statics:{__n:null,getBoxModel:function(){var content=qx.bom.client.Engine.getName()!==A||!qx.bom.client.Browser.getQuirksMode();
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
},getLinearGradient:function(){qx.bom.client.Css.__n=false;
var bi=E;
var bf=document.createElement(k);
var bg=qx.bom.Style.getAppliedStyle(bf,g,bi);

if(!bg){bi=x;
var bg=qx.bom.Style.getAppliedStyle(bf,g,bi,false);

if(bg){qx.bom.client.Css.__n=true;
}}if(!bg){return null;
}var bh=/(.*?)\(/.exec(bg);
return bh?bh[1]:null;
},getRadialGradient:function(){var bm=N;
var bj=document.createElement(k);
var bk=qx.bom.Style.getAppliedStyle(bj,g,bm);

if(!bk){return null;
}var bl=/(.*?)\(/.exec(bk);
return bl?bl[1]:null;
},getLegacyWebkitGradient:function(){if(qx.bom.client.Css.__n===null){qx.bom.client.Css.getLinearGradient();
}return qx.bom.client.Css.__n;
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
(function(){var j="",i="mshtml",h="msie",g="maple",f=")(/| )([0-9]+\.[0-9])",e="(",d="ce",c="CSS1Compat",b="android",a="operamini",H="gecko",G="browser.quirksmode",F="browser.name",E="mobile chrome",D="iemobile",C="prism|Fennec|Camino|Kmeleon|Galeon|Netscape|SeaMonkey|Namoroka|Firefox",B="opera mobi",A="Mobile Safari",z="Maple",y="operamobile",q="ie",r="mobile safari",o="IEMobile|Maxthon|MSIE",p="qx.bom.client.Browser",m="(Maple )([0-9]+\.[0-9]+\.[0-9]*)",n="opera mini",k="browser.version",l="opera",s="Opera Mini|Opera Mobi|Opera",t="AdobeAIR|Titanium|Fluid|Chrome|Android|Epiphany|Konqueror|iCab|OmniWeb|Maxthon|Pre|Mobile Safari|Safari",v="webkit",u="browser.documentmode",x="5.0",w="Mobile/";
qx.Bootstrap.define(p,{statics:{getName:function(){var L=navigator.userAgent;
var K=new RegExp(e+qx.bom.client.Browser.__o+f);
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
var O=new RegExp(e+qx.bom.client.Browser.__o+f);
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
}},__o:{"webkit":t,"gecko":C,"mshtml":o,"opera":s}[qx.bom.client.Engine.getName()]},defer:function(Q){qx.core.Environment.add(F,Q.getName),qx.core.Environment.add(k,Q.getVersion),qx.core.Environment.add(u,Q.getDocumentMode),qx.core.Environment.add(G,Q.getQuirksMode);
}});
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
},__p:{"Windows NT 6.1":r,"Windows NT 6.0":O,"Windows NT 5.2":Y,"Windows NT 5.1":E,"Windows NT 5.0":b,"Windows 2000":b,"Windows NT 4.0":H,"Win 9x 4.90":D,"Windows CE":q,"Windows 98":c,"Win98":c,"Windows 95":e,"Win95":e,"Mac OS X 10_7":g,"Mac OS X 10.7":g,"Mac OS X 10_6":a,"Mac OS X 10.6":a,"Mac OS X 10_5":f,"Mac OS X 10.5":f,"Mac OS X 10_4":bd,"Mac OS X 10.4":bd,"Mac OS X 10_3":h,"Mac OS X 10.3":h,"Mac OS X 10_2":d,"Mac OS X 10.2":d,"Mac OS X 10_1":i,"Mac OS X 10.1":i,"Mac OS X 10_0":be,"Mac OS X 10.0":be},getVersion:function(){var bj=[];

for(var bi in qx.bom.client.OperatingSystem.__p){bj.push(bi);
}var bk=new RegExp(T+bj.join(m).replace(/\./g,l)+X,P);
var bh=bk.exec(navigator.userAgent);

if(bh&&bh[1]){return qx.bom.client.OperatingSystem.__p[bh[1]];
}return j;
}},defer:function(bl){qx.core.Environment.add(p,bl.getName);
qx.core.Environment.add(ba,bl.getVersion);
}});
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
(function(){var h="css.boxsizing",g="",f="border-box",e="qx.bom.element.BoxSizing",d="boxSizing",c="content-box",b=":",a=";";
qx.Bootstrap.define(e,{statics:{__bd:{tags:{button:true,select:true},types:{search:true,button:true,submit:true,reset:true,checkbox:true,radio:true}},__be:function(i){var j=this.__bd;
return j.tags[i.tagName.toLowerCase()]||j.types[i.type];
},compile:function(k){if(qx.core.Environment.get(h)){var l=qx.lang.String.hyphenate(qx.core.Environment.get(h));
return l+b+k+a;
}else{}},get:function(m){if(qx.core.Environment.get(h)){return qx.bom.element.Style.get(m,d,null,false)||g;
}
if(qx.bom.Document.isStandardMode(qx.dom.Node.getWindow(m))){if(!this.__be(m)){return c;
}}return f;
},set:function(n,o){if(qx.core.Environment.get(h)){try{n.style[qx.core.Environment.get(h)]=o;
}catch(p){}}else{}},reset:function(q){this.set(q,g);
}}});
})();
(function(){var k="n-resize",j="e-resize",i="nw-resize",h="ne-resize",g="engine.name",f="",e="cursor:",d=";",c="qx.bom.element.Cursor",b="cursor",a="hand";
qx.Bootstrap.define(c,{statics:{__bf:qx.core.Environment.select(g,{"mshtml":{"cursor":a,"ew-resize":j,"ns-resize":k,"nesw-resize":h,"nwse-resize":i},"opera":{"col-resize":j,"row-resize":k,"ew-resize":j,"ns-resize":k,"nesw-resize":h,"nwse-resize":i},"default":{}}),compile:function(l){return e+(this.__bf[l]||l)+d;
},get:function(m,n){return qx.bom.element.Style.get(m,b,n,false);
},set:function(o,p){o.style.cursor=this.__bf[p]||p;
},reset:function(q){q.style.cursor=f;
}}});
})();
(function(){var j="",i="engine.name",h="float",g="browser.documentmode",f="mshtml",e="style",d="css.float",c="px",b="css.appearance",a="pixelRight",w="css.userselect",v="css.boxsizing",u="css.textoverflow",t="pixelHeight",s=":",r="pixelTop",q="css.borderimage",p="pixelLeft",o="css.usermodify",n="qx.bom.element.Style",l="pixelBottom",m="pixelWidth",k=";";
qx.Bootstrap.define(n,{statics:{__q:function(){var y={"appearance":qx.core.Environment.get(b),"userSelect":qx.core.Environment.get(w),"textOverflow":qx.core.Environment.get(u),"borderImage":qx.core.Environment.get(q),"float":qx.core.Environment.get(d),"userModify":qx.core.Environment.get(o),"boxSizing":qx.core.Environment.get(v)};
this.__r={};

for(var x in qx.lang.Object.clone(y)){if(!y[x]){delete y[x];
}else{this.__r[x]=x==h?h:qx.lang.String.hyphenate(y[x]);
}}this.__s=y;
},__t:{width:m,height:t,left:p,right:a,top:r,bottom:l},__u:{clip:qx.bom.element.Clip,cursor:qx.bom.element.Cursor,opacity:qx.bom.element.Opacity,boxSizing:qx.bom.element.BoxSizing,overflowX:{set:qx.lang.Function.bind(qx.bom.element.Overflow.setX,qx.bom.element.Overflow),get:qx.lang.Function.bind(qx.bom.element.Overflow.getX,qx.bom.element.Overflow),reset:qx.lang.Function.bind(qx.bom.element.Overflow.resetX,qx.bom.element.Overflow),compile:qx.lang.Function.bind(qx.bom.element.Overflow.compileX,qx.bom.element.Overflow)},overflowY:{set:qx.lang.Function.bind(qx.bom.element.Overflow.setY,qx.bom.element.Overflow),get:qx.lang.Function.bind(qx.bom.element.Overflow.getY,qx.bom.element.Overflow),reset:qx.lang.Function.bind(qx.bom.element.Overflow.resetY,qx.bom.element.Overflow),compile:qx.lang.Function.bind(qx.bom.element.Overflow.compileY,qx.bom.element.Overflow)}},compile:function(z){var B=[];
var D=this.__u;
var C=this.__r;
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
}},isPropertySupported:function(H){return (this.__u[H]||this.__s[H]||H in document.documentElement.style);
},COMPUTED_MODE:1,CASCADED_MODE:2,LOCAL_MODE:3,set:function(I,name,J,K){name=this.__s[name]||name;
if(K!==false&&this.__u[name]){return this.__u[name].set(I,J);
}else{I.style[name]=J!==null?J:j;
}},setStyles:function(L,M,N){var Q=this.__s;
var S=this.__u;
var O=L.style;

for(var R in M){var P=M[R];
var name=Q[R]||R;

if(P===undefined){if(N!==false&&S[name]){S[name].reset(L);
}else{O[name]=j;
}}else{if(N!==false&&S[name]){S[name].set(L,P);
}else{O[name]=P!==null?P:j;
}}}},reset:function(T,name,U){name=this.__s[name]||name;
if(U!==false&&this.__u[name]){return this.__u[name].reset(T);
}else{T.style[name]=j;
}},get:qx.core.Environment.select(i,{"mshtml":function(V,name,W,X){name=this.__s[name]||name;
if(X!==false&&this.__u[name]){return this.__u[name].get(V,W);
}if(!V.currentStyle){return V.style[name]||j;
}switch(W){case this.LOCAL_MODE:return V.style[name]||j;
case this.CASCADED_MODE:return V.currentStyle[name]||j;
default:var bc=V.currentStyle[name]||j;
if(/^-?[\.\d]+(px)?$/i.test(bc)){return bc;
}var bb=this.__t[name];

if(bb){var Y=V.style[name];
V.style[name]=bc||0;
var ba=V.style[bb]+c;
V.style[name]=Y;
return ba;
}if(/^-?[\.\d]+(em|pt|%)?$/i.test(bc)){throw new Error("Untranslated computed property value: "+name+". Only pixel values work well across different clients.");
}return bc;
}},"default":function(bd,name,be,bf){name=this.__s[name]||name;
if(bf!==false&&this.__u[name]){return this.__u[name].get(bd,be);
}switch(be){case this.LOCAL_MODE:return bd.style[name]||j;
case this.CASCADED_MODE:if(bd.currentStyle){return bd.currentStyle[name]||j;
}throw new Error("Cascaded styles are not supported in this browser!");
default:var bg=qx.dom.Node.getDocument(bd);
var bh=bg.defaultView.getComputedStyle(bd,null);
return bh?bh[name]:j;
}}})},defer:function(bi){bi.__q();
}});
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
},__bg:function(){var t=this.getWidth()>this.getHeight()?90:0;
var u=window.orientation;

if(u==null||Math.abs(u%180)==t){return {"-270":90,"-180":180,"-90":-90,"0":0,"90":90,"180":180,"270":-90};
}else{return {"-270":180,"-180":-90,"-90":0,"0":90,"90":180,"180":-90,"270":0};
}},__bh:null,getOrientation:function(v){var w=(v||window).orientation;

if(w==null){w=this.getWidth(v)>this.getHeight(v)?90:0;
}else{w=this.__bh[w];
}return w;
},isLandscape:function(x){return Math.abs(this.getOrientation(x))==90;
},isPortrait:function(y){return Math.abs(this.getOrientation(y))!==90;
}},defer:function(z){z.__bh=z.__bg();
}});
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
qx.Bootstrap.define(f,{statics:{__bi:/\s+/g,__bj:/^\s+|\s+$/g,add:qx.lang.Object.select(qx.core.Environment.get(s)?q:r,{"native":function(t,name){t.classList.add(name);
return name;
},"default":function(u,name){if(!this.has(u,name)){u.className+=(u.className?o:p)+name;
}return name;
}}),addClasses:qx.lang.Object.select(qx.core.Environment.get(s)?q:r,{"native":function(v,w){for(var i=0;i<w.length;i++){v.classList.add(w[i]);
}return v.className;
},"default":function(x,y){var z={};
var B;
var A=x.className;

if(A){B=A.split(this.__bi);

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
return M.className=M.className.replace(O,p).replace(this.__bj,p).replace(this.__bi,o);
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
(function(){var b="html",a="qx.module.Attribute";
qx.Bootstrap.define(a,{statics:{getHtml:function(){if(this[0]){return qx.bom.element.Attribute.get(this[0],b);
}return null;
},setHtml:function(c){for(var i=0;i<this.length;i++){qx.bom.element.Attribute.set(this[i],b,c);
}return this;
},setAttribute:function(name,d){for(var i=0;i<this.length;i++){qx.bom.element.Attribute.set(this[i],name,d);
}return this;
},getAttribute:function(name){if(this[0]){return qx.bom.element.Attribute.get(this[0],name);
}return null;
},setAttributes:function(e){for(var name in e){this.setAttribute(name,e[name]);
}return this;
},getAttributes:function(f){var g={};

for(var i=0;i<f.length;i++){g[f[i]]=this.getAttribute(f[i]);
}return g;
},setProperty:function(name,h){for(var i=0;i<this.length;i++){this[i][name]=h;
}return this;
},getProperty:function(name){if(this[0]){return this[0][name];
}return null;
},setProperties:function(j){for(var name in j){this.setProperty(name,j[name]);
}return this;
},getProperties:function(k){var l={};

for(var i=0;i<k.length;i++){l[k[i]]=this.getProperty(k[i]);
}return l;
}},defer:function(m){q.attach({"getHtml":m.getHtml,"setHtml":m.setHtml,"getAttribute":m.getAttribute,"setAttribute":m.setAttribute,"getAttributes":m.getAttributes,"setAttributes":m.setAttributes,"getProperty":m.getProperty,"setProperty":m.setProperty,"getProperties":m.getProperties,"setProperties":m.setProperties});
}});
})();
(function(){var j="",i="undefined",h="engine.name",g="readOnly",f="accessKey",e="qx.bom.element.Attribute",d="rowSpan",c="vAlign",b="className",a="textContent",A="'",z="htmlFor",y="longDesc",x="cellSpacing",w="frameBorder",v="='",u="useMap",t="innerText",s="innerHTML",r="tabIndex",p="dateTime",q="maxLength",n="html.element.textcontent",o="mshtml",l="cellPadding",m="browser.documentmode",k="colSpan";
qx.Bootstrap.define(e,{statics:{__v:{names:{"class":b,"for":z,html:s,text:qx.core.Environment.get(n)?a:t,colspan:k,rowspan:d,valign:c,datetime:p,accesskey:f,tabindex:r,maxlength:q,readonly:g,longdesc:y,cellpadding:l,cellspacing:x,frameborder:w,usemap:u},runtime:{"html":1,"text":1},bools:{compact:1,nowrap:1,ismap:1,declare:1,noshade:1,checked:1,disabled:1,readOnly:1,multiple:1,selected:1,noresize:1,defer:1,allowTransparency:1},property:{$$html:1,$$widget:1,disabled:1,checked:1,readOnly:1,multiple:1,selected:1,value:1,maxLength:1,className:1,innerHTML:1,innerText:1,textContent:1,htmlFor:1,tabIndex:1},qxProperties:{$$widget:1,$$html:1},propertyDefault:{disabled:false,checked:false,readOnly:false,multiple:false,selected:false,value:j,className:j,innerHTML:j,innerText:j,textContent:j,htmlFor:j,tabIndex:0,maxLength:qx.core.Environment.select(h,{"mshtml":2147483647,"webkit":524288,"default":-1})},removeableProperties:{disabled:1,multiple:1,maxLength:1},original:{href:1,src:1,type:1}},compile:function(B){var C=[];
var E=this.__v.runtime;

for(var D in B){if(!E[D]){C.push(D,v,B[D],A);
}}return C.join(j);
},get:function(F,name){var H=this.__v;
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
}var K=this.__v;
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
(function(){var b="qx.module.Manipulating",a="";
qx.Bootstrap.define(b,{statics:{create:function(c){var d=qx.bom.Html.clean([c]);
return qx.lang.Array.cast(d,qx.Collection);
},wrap:function(e){if(!qx.lang.Type.isArray(e)){e=[e];
}return qx.lang.Array.cast(e,qx.Collection);
},appendTo:function(parent){for(var i=0;i<this.length;i++){qx.dom.Element.insertEnd(this[i],parent);
}},remove:function(){for(var i=0;i<this.length;i++){qx.dom.Element.remove(this[i]);
}},empty:function(){for(var i=0;i<this.length;i++){this[i].innerHTML=a;
}}},defer:function(f){q.attachStatic({"create":f.create,"wrap":f.wrap});
q.attach({"appendTo":f.appendTo,"remove":f.remove,"empty":f.empty});
}});
})();
(function(){var m="string",k="script",h="<table>",g="engine.name",f="<fieldset>",e="<select multiple='multiple'>",d="</div>",c="</select>",b="</tr></tbody></table>",a="<col",J="div",I="<table><tbody><tr>",H=">",G="<table><tbody></tbody><colgroup>",F="<th",E="</tbody></table>",D="<td",C="</colgroup></table>",B="<opt",A="text/javascript",t="",u="</fieldset>",r="<table><tbody>",s="div<div>",p="<table",q="mshtml",n="qx.bom.Html",o="<leg",v="tbody",w="<tr",y="</table>",x="undefined",z="></";
qx.Bootstrap.define(n,{statics:{__w:function(K,L,M){return M.match(/^(abbr|br|col|img|input|link|meta|param|hr|area|embed)$/i)?K:L+z+M+H;
},__x:{opt:[1,e,c],leg:[1,f,u],table:[1,h,y],tr:[2,r,E],td:[3,I,b],col:[2,G,C],def:qx.core.Environment.select(g,{"mshtml":[1,s,d],"default":null})},__y:function(N,O){var U=O.createElement(J);
N=N.replace(/(<(\w+)[^>]*?)\/>/g,this.__w);
var Q=N.replace(/^\s+/,t).substring(0,5).toLowerCase();
var T,P=this.__x;

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
if(typeof ba===m){ba=this.__y(ba,X);
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
(function(){var e="opacity",d="display",c="none",b="qx.module.Animation",a="";
qx.Bootstrap.define(b,{statics:{_fadeOut:{duration:1000,keyFrames:{0:{opacity:1},100:{opacity:0}}},_fadeIn:{duration:1000,keyFrames:{0:{opacity:0},100:{opacity:1}}},animate:function(f){var h;

for(var i=0;i<this.length;i++){var g=qx.bom.element.Animation.animate(this[i],f);

if(i===0){h=g;
}}return h;
},fadeIn:function(){var k;

for(var i=0;i<this.length;i++){this[i].style[e]=0;
this[i].style[d]=a;
var j=qx.bom.element.Animation.animate(this[i],qx.module.Animation._fadeIn);
j.onEnd(function(l){l.style[e]=1;
});

if(i===0){k=j;
}}return k;
},fadeOut:function(){var n;

for(var i=0;i<this.length;i++){var m=qx.bom.element.Animation.animate(this[i],qx.module.Animation._fadeOut);
m.onEnd(function(o){o.style[d]=c;
});

if(i===0){n=m;
}}return m;
}},defer:function(p){q.attach({"animate":p.animate,"fadeIn":p.fadeIn,"fadeOut":p.fadeOut});
}});
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
qx.Bootstrap.define(f,{statics:{__z:function(){if(!qx.bom.client.Stylesheet.__A){qx.bom.client.Stylesheet.__A=qx.bom.Stylesheet.createElement();
}return qx.bom.client.Stylesheet.__A;
},getCreateStyleSheet:function(){return typeof document.createStyleSheet===h;
},getInsertRule:function(){return typeof qx.bom.client.Stylesheet.__z().insertRule===g;
},getDeleteRule:function(){return typeof qx.bom.client.Stylesheet.__z().deleteRule===g;
},getAddImport:function(){return (typeof qx.bom.client.Stylesheet.__z().addImport===h);
},getRemoveImport:function(){return (typeof qx.bom.client.Stylesheet.__z().removeImport===h);
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
(function(){var h=" ",g="name",f="ms ",d="",c="alternate",b="qx.bom.element.Animation",a="end-event";
qx.Bootstrap.define(b,{statics:{__B:null,__C:"Anni",__D:0,__E:{},__F:{"scale":true,"rotate":true,"skew":true,"translate":true},__G:qx.core.Environment.get("css.animation"),animate:function(j,k){this.__J(k);

if(!this.__B){this.__B=qx.bom.Stylesheet.createElement();
}var o=k.keyFrames;
if(this.__G!=null){var name=this.__K(o,k.reverse);
var m=name+h+k.duration+f+k.repeat+h+k.timing+h+(k.alternate?c:d);
var l=this.__G[a];
qx.bom.Event.addNativeListener(j,l,this.__H);
j.style[this.__G[g]]=m;
}var n=new qx.bom.element.AnimationHandle();
n.desc=k;
n.el=j;
j.$$animation=n;
if(k.origin!=null){qx.bom.element.Transform.setOrigin(j,k.origin);
}if(this.__G==null){window.setTimeout(function(){qx.bom.element.Animation.__H({target:j});
},0);
}return n;
},__H:function(e){var p=e.target;
var r=p.$$animation;
if(!r){return;
}var s=r.desc;

if(qx.bom.element.Animation.__G!=null){p.style[qx.bom.element.Animation.__G["name"]]="";
qx.bom.Event.removeNativeListener(p,qx.bom.element.Animation.__G["name"],qx.bom.element.Animation.__H);
}
if(s.origin!=null){qx.bom.element.Transform.setOrigin(p,"");
}
if(s.keep!=null){qx.bom.element.Animation.__I(p,s.keyFrames[s.keep]);
}p.$$animation=null;
r.el=null;
r.ended=true;
var q=r.getOnEnd();

for(var i=0;i<q.length;i++){q[i].callback.call(q[i].ctx,p);
}},__I:function(t,u){var w;

for(var v in u){if(v in qx.bom.element.Animation.__F){if(!w){w={};
}w[v]=u[v];
}else{t.style[v]=u[v];
}}if(w){qx.bom.element.Transform.transform(t,w);
}},__J:function(x){if(!x.hasOwnProperty("alternate")){x.alternate=false;
}
if(!x.hasOwnProperty("keep")){x.keep=null;
}
if(!x.hasOwnProperty("reverse")){x.reverse=false;
}
if(!x.hasOwnProperty("repeat")){x.repeat=1;
}
if(!x.hasOwnProperty("timing")){x.timing="linear";
}
if(!x.hasOwnProperty("origin")){x.origin=null;
}},__bk:null,__K:function(frames,y){var B="";
for(var E in frames){B+=(y?-(E-100):E)+"% {";
var A=frames[E];
var D;
for(var z in A){if(z in this.__F){if(!D){D={};
}D[z]=A[z];
}else{B+=z+":"+A[z]+";";
}}if(D){B+=qx.bom.element.Transform.getCss(D);
}B+="} ";
}if(this.__E[B]){return this.__E[B];
}var name=this.__C+this.__D++;
var C=this.__G["keyframes"]+" "+name;
qx.bom.Stylesheet.addRule(this.__B,C,B);
this.__E[B]=name;
return name;
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
(function(){var e="",d="css.animation",c="qx.bom.element.AnimationHandle",b="running",a="paused";
qx.Bootstrap.define(c,{extend:Object,construct:function(){var f=qx.core.Environment.get(d);
this.__L=f&&f["playstate"];
this.__M=[];
},members:{__L:null,__N:false,__O:false,__M:null,onEnd:function(g,h){this.__M.push({ctx:h||this,callback:g});
},getOnEnd:function(){return this.__M;
},isPlaying:function(){return this.__N;
},isEnded:function(){return this.__O;
},pause:function(){if(this.el){this.el.style[this.__L]=a;
this.el.$$animation.__N=false;
}},play:function(){if(this.el){this.el.style[this.__L]=b;
this.el.$$animation.__N=true;
}},stop:function(){if(this.el){this.el.style[this.__L]=e;
this.el.style[qx.core.Environment.get(d).name]=e;
this.el.$$animation.__N=false;
this.el.$$animation.__O=true;
}}}});
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
(function(){var m="",l="backface-visibility",k="name",j="visible",h="origin",g="perspective-origin",f="perspective",e="style",d="qx.bom.element.Transform",c="hidden",a=":",b=";";
qx.Bootstrap.define(d,{statics:{__P:["X","Y","Z"],__Q:qx.core.Environment.get("css.transform"),transform:function(n,o){var q=this.__R(o);

if(this.__Q!=null){var p=this.__Q[k];
n.style[p]=q;
}},translate:function(r,s){this.transform(r,{translate:s});
},scale:function(t,u){this.transform(t,{scale:u});
},rotate:function(v,w){this.transform(v,{rotate:w});
},skew:function(x,y){this.transform(x,{skew:y});
},getCss:function(z){var B=this.__R(z);

if(this.__Q!=null){var A=this.__Q[k];
return qx.lang.String.hyphenate(A)+a+B+b;
}return m;
},setOrigin:function(C,D){if(this.__Q!=null){C.style[this.__Q[h]]=D;
}},getOrigin:function(E){if(this.__Q!=null){return E.style[this.__Q[h]];
}return m;
},setStyle:function(F,G){if(this.__Q!=null){F.style[this.__Q[e]]=G;
}},getStyle:function(H){if(this.__Q!=null){return H.style[this.__Q[e]];
}return m;
},setPerspective:function(I,J){if(this.__Q!=null){I.style[this.__Q[f]]=J;
}},getPerspective:function(K){if(this.__Q!=null){return K.style[this.__Q[f]];
}return m;
},setPerspectiveOrigin:function(L,M){if(this.__Q!=null){L.style[this.__Q[g]]=M;
}},getPerspectiveOrigin:function(N){if(this.__Q!=null){return N.style[this.__Q[g]];
}return m;
},setBackfaceVisibility:function(O,P){if(this.__Q!=null){O.style[this.__Q[l]]=P?j:c;
}},getBackfaceVisibility:function(Q){if(this.__Q!=null){return Q.style[this.__Q[l]]==j;
}return true;
},__R:function(R){var U="";

for(var T in R){var S=R[T];
if(qx.Bootstrap.isArray(S)){for(var i=0;i<S.length;i++){if(S[i]==undefined){continue;
}U+=T+this.__P[i]+"(";
U+=S[i];
U+=") ";
}}else{U+=T+"("+R[T]+") ";
}}return U;
}}});
})();
(function(){var a="qx.module.Traversing";
qx.Bootstrap.define(a,{statics:{add:function(b){this.push(b);
return this;
},getChildren:function(){var c=[];

for(var i=0;i<this.length;i++){c=c.concat(qx.dom.Hierarchy.getChildElements(this[i]));
}return qx.lang.Array.cast(c,qx.Collection);
},forEach:function(d,e){for(var i=0;i<this.length;i++){d.call(e,this[i],i,this);
}return this;
},getParents:function(){var f=[];

for(var i=0;i<this.length;i++){f=f.concat(qx.dom.Element.getParentElement(this[i]));
}return qx.lang.Array.cast(f,qx.Collection);
}},defer:function(g){q.attach({"add":g.add,"getChildren":g.getChildren,"forEach":g.forEach,"getParents":g.getParents});
}});
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
(function(){var c="qx.module.Event",b="load",a="complete";
qx.Bootstrap.define(c,{statics:{on:function(d,e,f){for(var i=0;i<this.length;i++){var g=this[i];
if(qx.bom.Event.supportsEvent(g,d)){var h=qx.lang.Function.bind(e,f);
qx.bom.Event.addNativeListener(g,d,h);
g.__S=h;
}if(!g.__T){g.__T=new qx.event.Emitter();
}g.__T.on(d,e,f);
}return this;
},off:function(k,l,m){for(var j=0;j<this.length;j++){var n=this[j];

if(n.__T){n.__T.off(k,l,m);
}if(qx.bom.Event.supportsEvent(n,k)){qx.bom.Event.removeNativeListener(n,k,n.__S);
delete n.__S;
}}return this;
},emit:function(o,p){for(var j=0;j<this.length;j++){var r=this[j];

if(r.__T){r.__T.emit(o,p);
}}return this;
},once:function(s,t,u){var self=this;
var v=function(w){t.call(this,w);
self.off(s,v,u);
};
this.on(s,v,u);
return this;
},ready:function(x){if(document.readyState===a){window.setTimeout(x,0);
return;
}qx.bom.Event.addNativeListener(window,b,x);
}},defer:function(y){q.attach({"on":y.on,"off":y.off,"once":y.once,"emit":y.emit});
q.attachStatic({"ready":y.ready});
}});
})();
(function(){var b="qx.event.Emitter",a="*";
qx.Bootstrap.define(b,{extend:Object,statics:{__U:[]},members:{__V:null,__W:null,on:function(name,c,d){this.__X(name).push({listener:c,ctx:d});
qx.event.Emitter.__U.push({name:name,listener:c,ctx:d});
return qx.event.Emitter.__U.length-1;
},once:function(name,e,f){this.__X(name).push({listener:e,ctx:f,once:true});
qx.event.Emitter.__U.push({name:name,listener:e,ctx:f});
return qx.event.Emitter.__U.length-1;
},off:function(name,g,h){var k=this.__X(name);

for(var i=k.length-1;i>=0;i--){var j=k[i];

if(j.listener==g&&j.ctx==h){k.splice(i,1);
}}},offById:function(l){var m=qx.event.Emitter.__U[l];
this.off(m.name,m.listener,m.ctx);
},addListener:function(name,n,o){return this.on(name,n,o);
},addListenerOnce:function(name,p,q){return this.once(name,p,q);
},removeListener:function(name,r,s){this.off(name,r,s);
},removeListenerById:function(t){this.offById(t);
},emit:function(name,u){var w=this.__X(name);

for(var i=w.length-1;i>=0;i--){var v=w[i];
v.listener.call(v.ctx,u);

if(v.once){w.splice(i,1);
}}w=this.__X(a);

for(var i=w.length-1;i>=0;i--){var v=w[i];
v.listener.call(v.ctx,u);
}},__X:function(name){if(this.__V==null){this.__V={};
}
if(this.__V[name]==null){this.__V[name]=[];
}return this.__V[name];
}}});
})();
(function(){var a="qx.module.Template";
qx.Bootstrap.define(a,{statics:{get:function(b,c,d){var e=qx.bom.Template.get(b,c,d);
return qx.lang.Array.cast([e],qx.Collection);
},toHtml:function(f,g,h,i){return qx.bom.Template.toHtml(f,g,h,i);
}},defer:function(j){q.attachStatic({"template":{get:j.get,toHtml:j.toHtml}});
}});
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


qx.$$loader.init();

