(function(){

if (!window.qx) window.qx = {};

qx.$$start = new Date();
  
if (!qx.$$environment) qx.$$environment = {};
var envinfo = {"qx.debug":false,"qx.optimization.basecalls":true,"qx.optimization.comments":true,"qx.optimization.privates":true,"qx.optimization.statics":true,"qx.optimization.strings":true,"qx.optimization.variables":true,"qx.optimization.variants":true,"qx.version":"2.0"};
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
  packages : {"0":{"uris":["__out__:q.8caee27c50f9.js"]}},
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
(function(){var m="toString",k=".",j="Object",h='"',g="Array",f="()",e=".prototype",d="function",c="Boolean",b="Error",G="constructor",F="default",E="hasOwnProperty",D="toLocaleString",C="RegExp",B='\", "',A="String",z="warn",y="BROKEN_IE",x="isPrototypeOf",t="Date",u="",r="qx.Bootstrap",s="Function",p="]",q="Class",n="[Class ",o="valueOf",v="Number",w="ES5";
if(!window.qx){window.qx={};
}qx.Bootstrap={genericToString:function(){return n+this.classname+p;
},createNamespace:function(name,H){var J=name.split(k);
var parent=window;
var I=J[0];

for(var i=0,K=J.length-1;i<K;i++,I=J[i]){if(!parent[I]){parent=parent[I]={};
}else{parent=parent[I];
}}parent[I]=H;
return I;
},setDisplayName:function(L,M,name){L.displayName=M+k+name+f;
},setDisplayNames:function(N,O){for(var name in N){var P=N[name];

if(P instanceof Function){P.displayName=O+k+name+f;
}}},define:function(name,Q){if(!Q){var Q={statics:{}};
}var V;
var T=null;
qx.Bootstrap.setDisplayNames(Q.statics,name);

if(Q.members||Q.extend){qx.Bootstrap.setDisplayNames(Q.members,name+e);
V=Q.construct||new Function;

if(Q.extend){this.extendClass(V,V,Q.extend,name,U);
}var R=Q.statics||{};
for(var i=0,W=qx.Bootstrap.getKeys(R),l=W.length;i<l;i++){var X=W[i];
V[X]=R[X];
}T=V.prototype;
var S=Q.members||{};
for(var i=0,W=qx.Bootstrap.getKeys(S),l=W.length;i<l;i++){var X=W[i];
T[X]=S[X];
}}else{V=Q.statics||{};
}var U=this.createNamespace(name,V);
V.name=V.classname=name;
V.basename=U;
V.$$type=q;
if(!V.hasOwnProperty(m)){V.toString=this.genericToString;
}if(Q.defer){Q.defer(V,T);
}qx.Bootstrap.$$registry[name]=V;
return V;
}};
qx.Bootstrap.define(r,{statics:{DEBUG:(function(){var Y=true;

if(qx.$$environment&&qx.$$environment["qx.debug"]===false){Y=false;
}return Y;
})(),createNamespace:qx.Bootstrap.createNamespace,define:qx.Bootstrap.define,setDisplayName:qx.Bootstrap.setDisplayName,setDisplayNames:qx.Bootstrap.setDisplayNames,genericToString:qx.Bootstrap.genericToString,extendClass:function(ba,bb,bc,name,bd){var bg=bc.prototype;
var bf=new Function;
bf.prototype=bg;
var be=new bf;
ba.prototype=be;
be.name=be.classname=name;
be.basename=bd;
bb.base=ba.superclass=bc;
bb.self=ba.constructor=be.constructor=ba;
},getByName:function(name){return qx.Bootstrap.$$registry[name];
},$$registry:{},__a:[x,E,D,m,o,G],getKeys:({"ES5":Object.keys,"BROKEN_IE":function(bh){var bi=[];
var bk=Object.prototype.hasOwnProperty;

for(var bl in bh){if(bk.call(bh,bl)){bi.push(bl);
}}var bj=qx.Bootstrap.__a;

for(var i=0,a=bj,l=a.length;i<l;i++){if(bk.call(bh,a[i])){bi.push(a[i]);
}}return bi;
},"default":function(bm){var bn=[];
var bo=Object.prototype.hasOwnProperty;

for(var bp in bm){if(bo.call(bm,bp)){bn.push(bp);
}}return bn;
}})[typeof (Object.keys)==d?w:(function(){for(var bq in {toString:1}){return bq;
}})()!==m?y:F],getKeysAsString:function(br){var bs=qx.Bootstrap.getKeys(br);

if(bs.length==0){return u;
}return h+bs.join(B)+h;
},__b:{"[object String]":A,"[object Array]":g,"[object Object]":j,"[object RegExp]":C,"[object Number]":v,"[object Boolean]":c,"[object Date]":t,"[object Function]":s,"[object Error]":b},bind:function(bt,self,bu){var bv=Array.prototype.slice.call(arguments,2,arguments.length);
return function(){var bw=Array.prototype.slice.call(arguments,0,arguments.length);
return bt.apply(self,bv.concat(bw));
};
},firstUp:function(bx){return bx.charAt(0).toUpperCase()+bx.substr(1);
},getClass:function(by){var bz=Object.prototype.toString.call(by);
return (qx.Bootstrap.__b[bz]||bz.slice(8,-1));
},isArray:function(bA){return (bA!==null&&(bA instanceof Array||(bA&&qx.data&&qx.data.IListData&&qx.util.OOUtil.hasInterface(bA.constructor,qx.data.IListData))||qx.Bootstrap.getClass(bA)==g||(!!bA&&!!bA.$$isArray)));
},isObject:function(bB){return (bB!==undefined&&bB!==null&&qx.Bootstrap.getClass(bB)==j);
},$$logs:[],warn:function(bC,bD){qx.Bootstrap.$$logs.push([z,arguments]);
},trace:function(bE){}}});
})();
(function(){var a="qx.q";
qx.Bootstrap.define(a,{});
(function(){qx.q=function(b,c){var d=qx.bom.Selector.query(b,c);
var e=qx.lang.Array.cast(d,qx.Collection);
return e;
};
qx.q.attach=function(f){for(var name in f){qx.Collection.prototype[name]=f[name];
}};
qx.q.attachStatic=function(g){for(var name in g){qx.q[name]=g[name];
}};
})();
})();
(function(){var c="qx.bom.Selector";
qx.Bootstrap.define(c,{statics:{query:null}});
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
(function(){var d="engine.name",c="mshtml",b="qx.lang.Array",a="[object Array]";
qx.Bootstrap.define(b,{statics:{cast:function(e,f,g){if(e.constructor===f){return e;
}
if(qx.data&&qx.data.IListData){if(qx.Class&&qx.Class.hasInterface(e,qx.data.IListData)){var e=e.toArray();
}}var h=new f;
if((qx.core.Environment.get(d)==c)){if(e.item){for(var i=g||0,l=e.length;i<l;i++){h.push(e[i]);
}return h;
}}if(Object.prototype.toString.call(e)===a&&g==null){h.push.apply(h,e);
}else{h.push.apply(h,Array.prototype.slice.call(e,g||0));
}return h;
},fromArguments:function(j,k){return Array.prototype.slice.call(j,k||0);
},fromCollection:function(m){if((qx.core.Environment.get(d)==c)){if(m.item){var n=[];

for(var i=0,l=m.length;i<l;i++){n[i]=m[i];
}return n;
}}return Array.prototype.slice.call(m,0);
}}});
})();
(function(){var cq="qx.bom.client.CssTransform.get3D",cp="default",co="|",cn="qx.allowUrlSettings",cm="qx.bom.client.Stylesheet.getInsertRule",cl="css.transform.3d",ck="qx.bom.client.Html.getDataset",cj="qx.bom.client.PhoneGap.getPhoneGap",ci="qx.bom.client.Html.getAudioAif",ch="qx.debug.dispose",bt="qx.bom.client.Xml.getAttributeNS",bs="qx.bom.client.Stylesheet.getRemoveImport",br="qx.bom.client.Css.getUserModify",bq="qx.bom.client.Css.getBoxShadow",bp="qx.bom.client.Event.getHashChange",bo="qx.bom.client.Plugin.getWindowsMedia",bn="qx.bom.client.Html.getVideo",bm="qx.bom.client.Device.getName",bl="qx.bom.client.Event.getTouch",bk="qx.optimization.strings",cx="qx.optimization.variables",cy="qx.bom.client.EcmaScript.getStackTrace",cv="qx.bom.client.EcmaScript.getObjectCount",cw="qx.bom.client.Xml.getSelectSingleNode",ct="css.gradient.linear",cu="qx.bom.client.Xml.getImplementation",cr="qx.bom.client.Html.getConsole",cs="qx.bom.client.Engine.getVersion",cz="qx.bom.client.Plugin.getQuicktime",cA="qx.propertyDebugLevel",bR="qx.bom.client.Html.getNaturalDimensions",bQ="qx.bom.client.Xml.getSelectNodes",bT="qx.bom.client.Xml.getElementsByTagNameNS",bS="qx.bom.client.Html.getDataUrl",bV="qx.bom.client.Flash.isAvailable",bU="qx.bom.client.Html.getCanvas",bX="qx.bom.client.Css.getBoxModel",bW="qx.bom.client.Plugin.getSilverlight",bP="qx.bom.client.Css.getUserSelect",bO="qx.bom.client.Css.getRadialGradient",a="module.property",b="qx.bom.client.Plugin.getWindowsMediaVersion",c="qx.bom.client.Stylesheet.getCreateStyleSheet",d="qx.bom.client.Locale.getLocale",e="module.events",f="module.databinding",g="qx.bom.client.Html.getFileReader",h="qx.bom.client.Css.getBorderImage",j="qx.bom.client.Stylesheet.getDeleteRule",k="qx.bom.client.Plugin.getDivXVersion",cE="qx.bom.client.Scroll.scrollBarOverlayed",cD="qx.bom.client.Plugin.getPdfVersion",cC=":",cB="qx.bom.client.Css.getLinearGradient",cI="qx.bom.client.Transport.getXmlHttpRequest",cH="qx.bom.client.Html.getClassList",cG="qx.bom.client.Event.getHelp",cF="qx.optimization.comments",cK="qx.bom.client.Locale.getVariant",cJ="qx.bom.client.Css.getBoxSizing",J="qx.bom.client.OperatingSystem.getName",K="module.logger",H="qx.bom.client.Css.getOverflowXY",I="qx.mobile.emulatetouch",N="qx.bom.client.Html.getAudioWav",O="qx.bom.client.Browser.getName",L="qx.bom.client.Css.getInlineBlock",M="qx.bom.client.Plugin.getPdf",F="qx.dynlocale",G="qx.bom.client.Html.getAudio",s="qx.core.Environment",r="qx.bom.client.CssTransform.getSupport",u="qx.bom.client.Html.getTextContent",t="qx.bom.client.Css.getPlaceholder",o="qx.bom.client.Css.getFloat",n="false",q="qx.bom.client.Html.getXul",p="qx.bom.client.Xml.getCreateNode",m="qxenv",l="qx.bom.client.Html.getSessionStorage",T="qx.bom.client.Html.getAudioAu",U="qx.bom.client.Css.getOpacity",V="qx.bom.client.Html.getVml",W="qx.bom.client.Css.getRgba",P="qx.bom.client.Transport.getMaxConcurrentRequestCount",Q="qx.bom.client.Css.getBorderRadius",R="qx.bom.client.Event.getPointer",S="qx.bom.client.Css.getGradients",X="qx.bom.client.Transport.getSsl",Y="qx.bom.client.Html.getWebWorker",C="qx.bom.client.Json.getJson",B="qx.bom.client.Browser.getQuirksMode",A="qx.bom.client.Css.getTextOverflow",z="qx.bom.client.Xml.getQualifiedItem",y="qx.bom.client.Html.getVideoOgg",x="&",w="qx.bom.client.Browser.getDocumentMode",v="qx.allowUrlVariants",E="qx.bom.client.Html.getContains",D="qx.bom.client.Plugin.getActiveX",ba=".",bb="qx.bom.client.Xml.getDomProperties",bc="qx.bom.client.CssAnimation.getSupport",bd="qx.debug.databinding",be="qx.optimization.basecalls",bf="qx.bom.client.Browser.getVersion",bg="qx.bom.client.Css.getUserSelectNone",bh="true",bi="qx.bom.client.Html.getSvg",bj="qx.optimization.privates",bx="qx.bom.client.Plugin.getDivX",bw="qx.bom.client.Runtime.getName",bv="qx.bom.client.Html.getLocalStorage",bu="qx.bom.client.Flash.getStrictSecurityModel",bB="qx.aspects",bA="qx.debug",bz="qx.dynamicmousewheel",by="qx.bom.client.Html.getAudioMp3",bD="qx.bom.client.Engine.getName",bC="qx.bom.client.Plugin.getGears",bK="qx.bom.client.Plugin.getQuicktimeVersion",bL="qx.bom.client.Html.getAudioOgg",bI="qx.bom.client.Plugin.getSilverlightVersion",bJ="qx.bom.client.Html.getCompareDocumentPosition",bG="qx.bom.client.Flash.getExpressInstall",bH="qx.bom.client.OperatingSystem.getVersion",bE="qx.bom.client.Html.getXPath",bF="qx.bom.client.Html.getGeoLocation",bM="qx.bom.client.Css.getAppearance",bN="qx.mobile.nativescroll",ca="qx.bom.client.Xml.getDomParser",bY="qx.bom.client.Stylesheet.getAddImport",cc="qx.optimization.variants",cb="qx.bom.client.Html.getVideoWebm",ce="qx.bom.client.Flash.getVersion",cd="qx.bom.client.PhoneGap.getNotification",cg="qx.bom.client.Html.getVideoH264",cf="qx.bom.client.Xml.getCreateElementNS";
qx.Bootstrap.define(s,{statics:{_checks:{},_asyncChecks:{},__e:{},_checksMap:{"engine.version":cs,"engine.name":bD,"browser.name":O,"browser.version":bf,"browser.documentmode":w,"browser.quirksmode":B,"runtime.name":bw,"device.name":bm,"locale":d,"locale.variant":cK,"os.name":J,"os.version":bH,"os.scrollBarOverlayed":cE,"plugin.gears":bC,"plugin.activex":D,"plugin.quicktime":cz,"plugin.quicktime.version":bK,"plugin.windowsmedia":bo,"plugin.windowsmedia.version":b,"plugin.divx":bx,"plugin.divx.version":k,"plugin.silverlight":bW,"plugin.silverlight.version":bI,"plugin.flash":bV,"plugin.flash.version":ce,"plugin.flash.express":bG,"plugin.flash.strictsecurity":bu,"plugin.pdf":M,"plugin.pdf.version":cD,"io.maxrequests":P,"io.ssl":X,"io.xhr":cI,"event.touch":bl,"event.pointer":R,"event.help":cG,"event.hashchange":bp,"ecmascript.objectcount":cv,"ecmascript.stacktrace":cy,"html.webworker":Y,"html.filereader":g,"html.geolocation":bF,"html.audio":G,"html.audio.ogg":bL,"html.audio.mp3":by,"html.audio.wav":N,"html.audio.au":T,"html.audio.aif":ci,"html.video":bn,"html.video.ogg":y,"html.video.h264":cg,"html.video.webm":cb,"html.storage.local":bv,"html.storage.session":l,"html.classlist":cH,"html.xpath":bE,"html.xul":q,"html.canvas":bU,"html.svg":bi,"html.vml":V,"html.dataset":ck,"html.dataurl":bS,"html.console":cr,"html.stylesheet.createstylesheet":c,"html.stylesheet.insertrule":cm,"html.stylesheet.deleterule":j,"html.stylesheet.addimport":bY,"html.stylesheet.removeimport":bs,"html.element.contains":E,"html.element.compareDocumentPosition":bJ,"html.element.textcontent":u,"html.image.naturaldimensions":bR,"json":C,"css.textoverflow":A,"css.placeholder":t,"css.borderradius":Q,"css.borderimage":h,"css.boxshadow":bq,"css.gradients":S,"css.gradient.linear":cB,"css.gradient.radial":bO,"css.boxmodel":bX,"css.rgba":W,"css.userselect":bP,"css.userselect.none":bg,"css.usermodify":br,"css.appearance":bM,"css.float":o,"css.boxsizing":cJ,"css.translate3d":cq,"css.animation":bc,"css.transform":r,"css.transform.3d":cq,"css.inlineblock":L,"css.opacity":U,"css.overflowxy":H,"phonegap":cj,"phonegap.notification":cd,"xml.implementation":cu,"xml.domparser":ca,"xml.selectsinglenode":cw,"xml.selectnodes":bQ,"xml.getelementsbytagnamens":bT,"xml.domproperties":bb,"xml.attributens":bt,"xml.createnode":p,"xml.getqualifieditem":z,"xml.createelementns":cf},get:function(cL){if(qx.Bootstrap.DEBUG){var cN={"css.translate3d":cl,"css.gradients":ct,"ecmascript.objectcount":null};

if(cL in cN){qx.Bootstrap.warn("The key '"+cL+"' is deprecated."+(cN[cL]?" Please use '"+cN[cL]+"' instead.":""));
}}if(this.__e[cL]!=undefined){return this.__e[cL];
}var cP=this._checks[cL];

if(cP){var cO=cP();
this.__e[cL]=cO;
return cO;
}var cM=this._getClassNameFromEnvKey(cL);

if(cM[0]!=undefined){var cQ=cM[0];
var cR=cM[1];
var cO=cQ[cR]();
this.__e[cL]=cO;
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
},select:function(da,db){return this.__f(this.get(da),db);
},__f:function(dc,dd){var df=dd[dc];

if(dd.hasOwnProperty(dc)){return df;
}for(var de in dd){if(de.indexOf(co)!=-1){var dg=de.split(co);

for(var i=0;i<dg.length;i++){if(dg[i]==dc){return dd[de];
}}}}
if(dd[cp]!==undefined){return dd[cp];
}
if(qx.Bootstrap.DEBUG){throw new Error('No match for variant "'+dc+'" ('+(typeof dc)+' type)'+' in variants ['+qx.Bootstrap.getKeysAsString(dd)+'] found, and no default ("default") given');
}},add:function(dh,di){if(this._checks[dh]==undefined){if(di instanceof Function){this._checks[dh]=di;
}else{this._checks[dh]=this.__i(di);
}}},addAsync:function(dj,dk){if(this._checks[dj]==undefined){this._asyncChecks[dj]=dk;
}},_initDefaultQxValues:function(){this.add(cn,function(){return false;
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
},__g:function(){if(qx&&qx.$$environment){for(var dm in qx.$$environment){var dl=qx.$$environment[dm];
this._checks[dm]=this.__i(dl);
}}},__h:function(){if(window.document&&window.document.location){var dn=window.document.location.search.slice(1).split(x);

for(var i=0;i<dn.length;i++){var dq=dn[i].split(cC);

if(dq.length!=3||dq[0]!=m){continue;
}var dr=dq[1];
var dp=decodeURIComponent(dq[2]);
if(dp==bh){dp=true;
}else if(dp==n){dp=false;
}else if(/^(\d|\.)+$/.test(dp)){dp=parseFloat(dp);
}this._checks[dr]=this.__i(dp);
}}},__i:function(ds){return qx.Bootstrap.bind(function(dt){return dt;
},null,ds);
}},defer:function(du){du._initDefaultQxValues();
du.__g();
if(du.get(cn)===true){du.__h();
}}});
})();
(function(){var u=".",t="function",s="",r="gecko",q="Maple",p="[object Opera]",o="mshtml",n="8.0",m="AppleWebKit/",l="9.0",e="[^\\.0-9]",k="Gecko",h="webkit",c="4.0",b="1.9.0.0",g="opera",f="Version/",i="5.0",a="engine.version",j="qx.bom.client.Engine",d="engine.name";
qx.Bootstrap.define(j,{statics:{getVersion:function(){var y=window.navigator.userAgent;
var w=s;

if(qx.bom.client.Engine.__bw()){if(/Opera[\s\/]([0-9]+)\.([0-9])([0-9]*)/.test(y)){if(y.indexOf(f)!=-1){var x=y.match(/Version\/(\d+)\.(\d+)/);
w=x[1]+u+x[2].charAt(0)+u+x[2].substring(1,x[2].length);
}else{w=RegExp.$1+u+RegExp.$2;

if(RegExp.$3!=s){w+=u+RegExp.$3;
}}}}else if(qx.bom.client.Engine.__bx()){if(/AppleWebKit\/([^ ]+)/.test(y)){w=RegExp.$1;
var z=RegExp(e).exec(w);

if(z){w=w.slice(0,z.index);
}}}else if(qx.bom.client.Engine.__bz()||qx.bom.client.Engine.__by()){if(/rv\:([^\);]+)(\)|;)/.test(y)){w=RegExp.$1;
}}else if(qx.bom.client.Engine.__bA()){if(/MSIE\s+([^\);]+)(\)|;)/.test(y)){w=RegExp.$1;
if(w<8&&/Trident\/([^\);]+)(\)|;)/.test(y)){if(RegExp.$1==c){w=n;
}else if(RegExp.$1==i){w=l;
}}}}else{var v=window.qxFail;

if(v&&typeof v===t){w=v().FULLVERSION;
}else{w=b;
qx.Bootstrap.warn("Unsupported client: "+y+"! Assumed gecko version 1.9.0.0 (Firefox 3.0).");
}}return w;
},getName:function(){var name;

if(qx.bom.client.Engine.__bw()){name=g;
}else if(qx.bom.client.Engine.__bx()){name=h;
}else if(qx.bom.client.Engine.__bz()||qx.bom.client.Engine.__by()){name=r;
}else if(qx.bom.client.Engine.__bA()){name=o;
}else{var A=window.qxFail;

if(A&&typeof A===t){name=A().NAME;
}else{name=r;
qx.Bootstrap.warn("Unsupported client: "+window.navigator.userAgent+"! Assumed gecko version 1.9.0.0 (Firefox 3.0).");
}}return name;
},__bw:function(){return window.opera&&Object.prototype.toString.call(window.opera)==p;
},__bx:function(){return window.navigator.userAgent.indexOf(m)!=-1;
},__by:function(){return window.navigator.userAgent.indexOf(q)!=-1;
},__bz:function(){return window.controllers&&window.navigator.product===k&&window.navigator.userAgent.indexOf(q)==-1;
},__bA:function(){return window.navigator.cpuClass&&/MSIE\s+([^\);]+)(\)|;)/.test(window.navigator.userAgent);
}},defer:function(B){qx.core.Environment.add(a,B.getVersion);
qx.core.Environment.add(d,B.getName);
}});
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
Error.prototype.toString=qx.lang.Core.errorToString;
Array.prototype.indexOf=qx.lang.Core.arrayIndexOf;
Array.prototype.lastIndexOf=qx.lang.Core.arrayLastIndexOf;
Array.prototype.forEach=qx.lang.Core.arrayForEach;
Array.prototype.filter=qx.lang.Core.arrayFilter;
Array.prototype.map=qx.lang.Core.arrayMap;
Array.prototype.some=qx.lang.Core.arraySome;
Array.prototype.every=qx.lang.Core.arrayEvery;
String.prototype.quote=qx.lang.Core.stringQuote;
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
}},defer:function(f){qx.q.attach({"setStyle":f.setStyle,"getStyle":f.getStyle,"setStyles":f.setStyles,"getStyles":f.getStyles,"addClass":f.addClass,"removeClass":f.removeClass,"hasClass":f.hasClass,"toggleClass":f.toggleClass});
}});
})();
(function(){var a="qx.lang.Function";
qx.Bootstrap.define(a,{statics:{create:function(b,c){if(!c){return b;
}if(!(c.self||c.args||c.delay!=null||c.periodical!=null||c.attempt)){return b;
}return function(event){var e=qx.lang.Array.fromArguments(arguments);
if(c.args){e=c.args.concat(e);
}
if(c.delay||c.periodical){var d=function(){return b.apply(c.self||this,e);
};

if(qx.event&&qx.event.GlobalError){d=qx.event.GlobalError.observeMethod(d);
}
if(c.delay){return window.setTimeout(d,c.delay);
}
if(c.periodical){return window.setInterval(d,c.periodical);
}}else if(c.attempt){var f=false;

try{f=b.apply(c.self||this,e);
}catch(g){}return f;
}else{return b.apply(c.self||this,e);
}};
},bind:function(h,self,i){return this.create(h,{self:self,args:arguments.length>2?qx.lang.Array.fromArguments(arguments,2):null});
}}});
})();
(function(){var p="css.overflowxy",o="-moz-scrollbars-none",n="hidden",m="",l="engine.name",k="gecko",j="engine.version",i="overflow",h="qx.bom.element.Overflow",g=";",c="overflow-x",f="overflow-y",e="overflow:",b=":",a="overflowX",d="overflowY";
qx.Bootstrap.define(h,{statics:{_compile:function(q,r){if(!qx.core.Environment.get(p)){q=e;

if(qx.core.Environment.get(l)===k&&r==n){r=o;
}}return q+b+r+g;
},compileX:function(s){return this._compile(c,s);
},compileY:function(t){return this._compile(f,t);
},getX:function(u,v){if(qx.core.Environment.get(p)){return qx.bom.element.Style.get(u,a,v,false);
}var w=qx.bom.element.Style.get(u,i,v,false);

if(w===o){w=n;
}return w;
},setX:function(x,y){if(qx.core.Environment.get(p)){x.style.overflowX=y;
}else{if(y===n&&qx.core.Environment.get(l)===k&&parseFloat(qx.core.Environment.get(j))<1.8){y=o;
}x.style.overflow=y;
}},resetX:function(z){if(qx.core.Environment.get(p)){z.style.overflowX=m;
}else{z.style.overflow=m;
}},getY:function(A,B){if(qx.core.Environment.get(p)){return qx.bom.element.Style.get(A,d,B,false);
}var C=qx.bom.element.Style.get(A,i,B,false);

if(C===o){C=n;
}return C;
},setY:function(D,E){if(qx.core.Environment.get(p)){D.style.overflowY=E;
}else{if(E===n&&qx.core.Environment.get(l)===k&&parseFloat(qx.core.Environment.get(j))<1.8){E=o;
}D.style.overflow=E;
}},resetY:function(F){if(qx.core.Environment.get(p)){F.style.overflowY=m;
}else{F.style.overflow=m;
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
(function(){var b="qx.lang.String",a='-';
qx.Bootstrap.define(b,{statics:{__bv:{},hyphenate:function(c){var d=this.__bv[c];

if(!d){d=c.replace(/[A-Z]/g,function(e){return (a+e.charAt(0).toLowerCase());
});
}return d;
},firstUp:qx.Bootstrap.firstUp}});
})();
(function(){var a="qx.lang.Type";
qx.Bootstrap.define(a,{statics:{isArray:qx.Bootstrap.isArray,isObject:qx.Bootstrap.isObject}});
})();
(function(){var a="qx.lang.Object";
qx.Bootstrap.define(a,{statics:{clone:function(b,c){if(qx.lang.Type.isObject(b)){var d={};

for(var e in b){if(c){d[e]=qx.lang.Object.clone(b[e],c);
}else{d[e]=b[e];
}}return d;
}else if(qx.lang.Type.isArray(b)){var d=[];

for(var i=0;i<b.length;i++){if(c){d[i]=qx.lang.Object.clone(b[i]);
}else{d[i]=b[i];
}}return d;
}return b;
},select:function(f,g){return g[f];
}}});
})();
(function(){var k="div",j="-moz-none",h="string",g="backgroundImage",f="inline-block",e="-moz-inline-box",d="color",c="span",b="css.float",a="css.inlineblock",Y="css.usermodify",X="boxSizing",W="css.borderradius",V="content",U="css.appearance",T="css.gradient.radial",S="borderImage",R="userSelect",Q="css.overflowxy",P="styleFloat",r="css.userselect",s="css.boxsizing",p="css.boxmodel",q="qx.bom.client.Css",n="appearance",o="placeholder",l="input",m="css.boxshadow",v="css.gradient.legacywebkit",w="linear-gradient(0deg, #fff, #000)",D="css.opacity",B="css.borderimage",H="rgba(1, 2, 3, 0.5)",F="radial-gradient(0px 0px, cover, red 50%, blue 100%)",L="rgba",J="css.gradients",y="borderRadius",O="css.gradient.linear",N="-webkit-gradient(linear,0% 0%,100% 100%,from(white), to(red))",M="mshtml",x="css.rgba",z="none",A="css.placeholder",C="css.userselect.none",E="css.textoverflow",G="textOverflow",I="userModify",K="boxShadow",t="cssFloat",u="border";
qx.Bootstrap.define(q,{statics:{__db:null,getBoxModel:function(){var content=qx.bom.client.Engine.getName()!==M||!qx.bom.client.Browser.getQuirksMode();
return content?V:u;
},getTextOverflow:function(){return qx.bom.Style.getPropertyName(G);
},getPlaceholder:function(){var i=document.createElement(l);
return o in i;
},getAppearance:function(){return qx.bom.Style.getPropertyName(n);
},getBorderRadius:function(){return qx.bom.Style.getPropertyName(y);
},getBoxShadow:function(){return qx.bom.Style.getPropertyName(K);
},getBorderImage:function(){return qx.bom.Style.getPropertyName(S);
},getUserSelect:function(){return qx.bom.Style.getPropertyName(R);
},getUserSelectNone:function(){var bb=qx.bom.client.Css.getUserSelect();

if(bb){var ba=document.createElement(c);
ba.style[bb]=j;
return ba.style[bb]===j?j:z;
}return null;
},getUserModify:function(){return qx.bom.Style.getPropertyName(I);
},getFloat:function(){var bc=document.documentElement.style;
return bc.cssFloat!==undefined?t:bc.styleFloat!==undefined?P:null;
},getGradients:function(){return !!(qx.bom.client.Css.getLinearGradient());
},getLinearGradient:function(){qx.bom.client.Css.__db=false;
var bg=w;
var bd=document.createElement(k);
var be=qx.bom.Style.getAppliedStyle(bd,g,bg);

if(!be){bg=N;
var be=qx.bom.Style.getAppliedStyle(bd,g,bg,false);

if(be){qx.bom.client.Css.__db=true;
}}if(!be){return null;
}var bf=/(.*?)\(/.exec(be);
return bf?bf[1]:null;
},getRadialGradient:function(){var bk=F;
var bh=document.createElement(k);
var bi=qx.bom.Style.getAppliedStyle(bh,g,bk);

if(!bi){return null;
}var bj=/(.*?)\(/.exec(bi);
return bj?bj[1]:null;
},getLegacyWebkitGradient:function(){if(qx.bom.client.Css.__db===null){qx.bom.client.Css.getLinearGradient();
}return qx.bom.client.Css.__db;
},getRgba:function(){var bl;

try{bl=document.createElement(k);
}catch(bm){bl=document.createElement();
}try{bl.style[d]=H;

if(bl.style[d].indexOf(L)!=-1){return true;
}}catch(bn){}return false;
},getBoxSizing:function(){return qx.bom.Style.getPropertyName(X);
},getInlineBlock:function(){var bo=document.createElement(c);
bo.style.display=f;

if(bo.style.display==f){return f;
}bo.style.display=e;

if(bo.style.display!==e){return e;
}return null;
},getOpacity:function(){return (typeof document.documentElement.style.opacity==h);
},getOverflowXY:function(){return (typeof document.documentElement.style.overflowX==h)&&(typeof document.documentElement.style.overflowY==h);
}},defer:function(bp){qx.core.Environment.add(E,bp.getTextOverflow);
qx.core.Environment.add(A,bp.getPlaceholder);
qx.core.Environment.add(W,bp.getBorderRadius);
qx.core.Environment.add(m,bp.getBoxShadow);
qx.core.Environment.add(J,bp.getGradients);
qx.core.Environment.add(O,bp.getLinearGradient);
qx.core.Environment.add(T,bp.getRadialGradient);
qx.core.Environment.add(v,bp.getLegacyWebkitGradient);
qx.core.Environment.add(p,bp.getBoxModel);
qx.core.Environment.add(x,bp.getRgba);
qx.core.Environment.add(B,bp.getBorderImage);
qx.core.Environment.add(Y,bp.getUserModify);
qx.core.Environment.add(r,bp.getUserSelect);
qx.core.Environment.add(C,bp.getUserSelectNone);
qx.core.Environment.add(U,bp.getAppearance);
qx.core.Environment.add(b,bp.getFloat);
qx.core.Environment.add(s,bp.getBoxSizing);
qx.core.Environment.add(a,bp.getInlineBlock);
qx.core.Environment.add(D,bp.getOpacity);
qx.core.Environment.add(Q,bp.getOverflowXY);
}});
})();
(function(){var j="",i="mshtml",h="msie",g="maple",f=")(/| )([0-9]+\.[0-9])",e="(",d="ce",c="CSS1Compat",b="android",a="operamini",H="gecko",G="browser.quirksmode",F="browser.name",E="mobile chrome",D="iemobile",C="prism|Fennec|Camino|Kmeleon|Galeon|Netscape|SeaMonkey|Namoroka|Firefox",B="opera mobi",A="Mobile Safari",z="Maple",y="operamobile",q="ie",r="mobile safari",o="IEMobile|Maxthon|MSIE",p="qx.bom.client.Browser",m="(Maple )([0-9]+\.[0-9]+\.[0-9]*)",n="opera mini",k="browser.version",l="opera",s="Opera Mini|Opera Mobi|Opera",t="AdobeAIR|Titanium|Fluid|Chrome|Android|Epiphany|Konqueror|iCab|OmniWeb|Maxthon|Pre|Mobile Safari|Safari",v="webkit",u="browser.documentmode",x="5.0",w="Mobile/";
qx.Bootstrap.define(p,{statics:{getName:function(){var L=navigator.userAgent;
var K=new RegExp(e+qx.bom.client.Browser.__dc+f);
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
var O=new RegExp(e+qx.bom.client.Browser.__dc+f);
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
}},__dc:{"webkit":t,"gecko":C,"mshtml":o,"opera":s}[qx.bom.client.Engine.getName()]},defer:function(Q){qx.core.Environment.add(F,Q.getName),qx.core.Environment.add(k,Q.getVersion),qx.core.Environment.add(u,Q.getDocumentMode),qx.core.Environment.add(G,Q.getQuirksMode);
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
},__dd:{"Windows NT 6.1":r,"Windows NT 6.0":O,"Windows NT 5.2":Y,"Windows NT 5.1":E,"Windows NT 5.0":b,"Windows 2000":b,"Windows NT 4.0":H,"Win 9x 4.90":D,"Windows CE":q,"Windows 98":c,"Win98":c,"Windows 95":e,"Win95":e,"Mac OS X 10_7":g,"Mac OS X 10.7":g,"Mac OS X 10_6":a,"Mac OS X 10.6":a,"Mac OS X 10_5":f,"Mac OS X 10.5":f,"Mac OS X 10_4":bd,"Mac OS X 10.4":bd,"Mac OS X 10_3":h,"Mac OS X 10.3":h,"Mac OS X 10_2":d,"Mac OS X 10.2":d,"Mac OS X 10_1":i,"Mac OS X 10.1":i,"Mac OS X 10_0":be,"Mac OS X 10.0":be},getVersion:function(){var bj=[];

for(var bi in qx.bom.client.OperatingSystem.__dd){bj.push(bi);
}var bk=new RegExp(T+bj.join(m).replace(/\./g,l)+X,P);
var bh=bk.exec(navigator.userAgent);

if(bh&&bh[1]){return qx.bom.client.OperatingSystem.__dd[bh[1]];
}return j;
}},defer:function(bl){qx.core.Environment.add(p,bl.getName);
qx.core.Environment.add(ba,bl.getVersion);
}});
})();
(function(){var a="qx.bom.element.Clip";
qx.Bootstrap.define(a,{statics:{}});
})();
(function(){var a="qx.bom.element.Opacity";
qx.Bootstrap.define(a,{statics:{SUPPORT_CSS3_OPACITY:false},defer:function(b){b.SUPPORT_CSS3_OPACITY=qx.core.Environment.get("css.opacity");
}});
})();
(function(){var a="qx.bom.element.BoxSizing";
qx.Bootstrap.define(a,{statics:{}});
})();
(function(){var a="qx.bom.element.Cursor";
qx.Bootstrap.define(a,{statics:{}});
})();
(function(){var r="",q="float",p="css.float",o="qx.bom.element.Style",n="css.borderimage",m="css.userselect",l="css.boxsizing",k="pixelLeft",j="css.textoverflow",i="pixelBottom",c="engine.name",h="pixelHeight",f="pixelWidth",b="css.appearance",a="pixelRight",e="css.usermodify",d="pixelTop",g="px";
qx.Bootstrap.define(o,{statics:{__dh:function(){var t={"appearance":qx.core.Environment.get(b),"userSelect":qx.core.Environment.get(m),"textOverflow":qx.core.Environment.get(j),"borderImage":qx.core.Environment.get(n),"float":qx.core.Environment.get(p),"userModify":qx.core.Environment.get(e),"boxSizing":qx.core.Environment.get(l)};
this.__di={};

for(var s in qx.lang.Object.clone(t)){if(!t[s]){delete t[s];
}else{this.__di[s]=s==q?q:qx.lang.String.hyphenate(t[s]);
}}this.__dj=t;
},__dk:{width:f,height:h,left:k,right:a,top:d,bottom:i},__dl:{clip:qx.bom.element.Clip,cursor:qx.bom.element.Cursor,opacity:qx.bom.element.Opacity,boxSizing:qx.bom.element.BoxSizing,overflowX:{set:qx.lang.Function.bind(qx.bom.element.Overflow.setX,qx.bom.element.Overflow),get:qx.lang.Function.bind(qx.bom.element.Overflow.getX,qx.bom.element.Overflow),reset:qx.lang.Function.bind(qx.bom.element.Overflow.resetX,qx.bom.element.Overflow),compile:qx.lang.Function.bind(qx.bom.element.Overflow.compileX,qx.bom.element.Overflow)},overflowY:{set:qx.lang.Function.bind(qx.bom.element.Overflow.setY,qx.bom.element.Overflow),get:qx.lang.Function.bind(qx.bom.element.Overflow.getY,qx.bom.element.Overflow),reset:qx.lang.Function.bind(qx.bom.element.Overflow.resetY,qx.bom.element.Overflow),compile:qx.lang.Function.bind(qx.bom.element.Overflow.compileY,qx.bom.element.Overflow)}},CASCADED_MODE:2,LOCAL_MODE:3,set:function(u,name,v,w){name=this.__dj[name]||name;
if(w!==false&&this.__dl[name]){return this.__dl[name].set(u,v);
}else{u.style[name]=v!==null?v:r;
}},get:qx.core.Environment.select(c,{"mshtml":function(x,name,y,z){name=this.__dj[name]||name;
if(z!==false&&this.__dl[name]){return this.__dl[name].get(x,y);
}if(!x.currentStyle){return x.style[name]||r;
}switch(y){case this.LOCAL_MODE:return x.style[name]||r;
case this.CASCADED_MODE:return x.currentStyle[name]||r;
default:var D=x.currentStyle[name]||r;
if(/^-?[\.\d]+(px)?$/i.test(D)){return D;
}var C=this.__dk[name];

if(C){var A=x.style[name];
x.style[name]=D||0;
var B=x.style[C]+g;
x.style[name]=A;
return B;
}if(/^-?[\.\d]+(em|pt|%)?$/i.test(D)){throw new Error("Untranslated computed property value: "+name+". Only pixel values work well across different clients.");
}return D;
}},"default":function(E,name,F,G){name=this.__dj[name]||name;
if(G!==false&&this.__dl[name]){return this.__dl[name].get(E,F);
}switch(F){case this.LOCAL_MODE:return E.style[name]||r;
case this.CASCADED_MODE:if(E.currentStyle){return E.currentStyle[name]||r;
}throw new Error("Cascaded styles are not supported in this browser!");
default:var H=qx.dom.Node.getDocument(E);
var I=H.defaultView.getComputedStyle(E,null);
return I?I[name]:r;
}}})},defer:function(J){J.__dh();
}});
})();
(function(){var c="qx.dom.Node",b="";
qx.Bootstrap.define(c,{statics:{DOCUMENT:9,getDocument:function(d){return d.nodeType===this.DOCUMENT?d:d.ownerDocument||d.document;
},getText:function(e){if(!e||!e.nodeType){return null;
}
switch(e.nodeType){case 1:var i,a=[],f=e.childNodes,length=f.length;

for(i=0;i<length;i++){a[i]=this.getText(f[i]);
}return a.join(b);
case 2:case 3:case 4:return e.nodeValue;
}return null;
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
(function(){var i="html.classlist",h="default",g="native",f="(^|\\s)",e="(\\s|$)",d="",c="qx.bom.element.Class",b=" ",a="$2";
qx.Bootstrap.define(c,{statics:{add:qx.lang.Object.select(qx.core.Environment.get(i)?g:h,{"native":function(j,name){j.classList.add(name);
return name;
},"default":function(k,name){if(!this.has(k,name)){k.className+=(k.className?b:d)+name;
}return name;
}}),has:qx.lang.Object.select(qx.core.Environment.get(i)?g:h,{"native":function(l,name){return l.classList.contains(name);
},"default":function(m,name){var n=new RegExp(f+name+e);
return n.test(m.className);
}}),remove:qx.lang.Object.select(qx.core.Environment.get(i)?g:h,{"native":function(o,name){o.classList.remove(name);
return name;
},"default":function(p,name){var q=new RegExp(f+name+e);
p.className=p.className.replace(q,a);
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
}},defer:function(m){qx.q.attach({"getHtml":m.getHtml,"setHtml":m.setHtml,"getAttribute":m.getAttribute,"setAttribute":m.setAttribute,"getAttributes":m.getAttributes,"setAttributes":m.setAttributes,"getProperty":m.getProperty,"setProperty":m.setProperty,"getProperties":m.getProperties,"setProperties":m.setProperties});
}});
})();
(function(){var j="",i="undefined",h="engine.name",g="readOnly",f="accessKey",e="qx.bom.element.Attribute",d="rowSpan",c="vAlign",b="className",a="textContent",y="htmlFor",x="longDesc",w="cellSpacing",v="frameBorder",u="useMap",t="innerText",s="innerHTML",r="tabIndex",q="dateTime",p="maxLength",n="html.element.textcontent",o="mshtml",l="cellPadding",m="browser.documentmode",k="colSpan";
qx.Bootstrap.define(e,{statics:{__ge:{names:{"class":b,"for":y,html:s,text:qx.core.Environment.get(n)?a:t,colspan:k,rowspan:d,valign:c,datetime:q,accesskey:f,tabindex:r,maxlength:p,readonly:g,longdesc:x,cellpadding:l,cellspacing:w,frameborder:v,usemap:u},runtime:{"html":1,"text":1},bools:{compact:1,nowrap:1,ismap:1,declare:1,noshade:1,checked:1,disabled:1,readOnly:1,multiple:1,selected:1,noresize:1,defer:1,allowTransparency:1},property:{$$html:1,$$widget:1,disabled:1,checked:1,readOnly:1,multiple:1,selected:1,value:1,maxLength:1,className:1,innerHTML:1,innerText:1,textContent:1,htmlFor:1,tabIndex:1},qxProperties:{$$widget:1,$$html:1},propertyDefault:{disabled:false,checked:false,readOnly:false,multiple:false,selected:false,value:j,className:j,innerHTML:j,innerText:j,textContent:j,htmlFor:j,tabIndex:0,maxLength:qx.core.Environment.select(h,{"mshtml":2147483647,"webkit":524288,"default":-1})},removeableProperties:{disabled:1,multiple:1,maxLength:1},original:{href:1,src:1,type:1}},get:function(z,name){var B=this.__ge;
var A;
name=B.names[name]||name;
if(qx.core.Environment.get(h)==o&&parseInt(qx.core.Environment.get(m),10)<8&&B.original[name]){A=z.getAttribute(name,2);
}else if(B.property[name]){A=z[name];

if(typeof B.propertyDefault[name]!==i&&A==B.propertyDefault[name]){if(typeof B.bools[name]===i){return null;
}else{return A;
}}}else{A=z.getAttribute(name);
}if(B.bools[name]){return !!A;
}return A;
},set:function(C,name,D){if(typeof D===i){return;
}var E=this.__ge;
name=E.names[name]||name;
if(E.bools[name]){D=!!D;
}if(E.property[name]&&(!(C[name]===undefined)||E.qxProperties[name])){if(D==null){if(E.removeableProperties[name]){C.removeAttribute(name);
return;
}else if(typeof E.propertyDefault[name]!==i){D=E.propertyDefault[name];
}}C[name]=D;
}else{if(D===true){C.setAttribute(name,name);
}else if(D===false||D===null){C.removeAttribute(name);
}else{C.setAttribute(name,D);
}}}}});
})();
(function(){var b="qx.module.Manipulating",a="";
qx.Bootstrap.define(b,{statics:{create:function(c){var d=qx.bom.Html.clean([c]);
return qx.lang.Array.cast(d,qx.Collection);
},wrap:function(e){if(!qx.lang.Type.isArray(e)){e=[e];
}return qx.lang.Array.cast(e,qx.Collection);
},appendTo:function(parent){for(var i=0;i<this.length;i++){qx.dom.Element.insertEnd(this[i],parent);
}},remove:function(){for(var i=0;i<this.length;i++){qx.dom.Element.remove(this[i]);
}},empty:function(){for(var i=0;i<this.length;i++){this[i].innerHTML=a;
}}},defer:function(f){qx.q.attachStatic({"create":f.create,"wrap":f.wrap});
qx.q.attach({"appendTo":f.appendTo,"remove":f.remove,"empty":f.empty});
}});
})();
(function(){var m="string",k="script",h="<table>",g="engine.name",f="<fieldset>",e="<select multiple='multiple'>",d="</div>",c="</select>",b="</tr></tbody></table>",a="<col",J="div",I="<table><tbody><tr>",H=">",G="<table><tbody></tbody><colgroup>",F="<th",E="</tbody></table>",D="<td",C="</colgroup></table>",B="<opt",A="text/javascript",t="",u="</fieldset>",r="<table><tbody>",s="div<div>",p="<table",q="mshtml",n="qx.bom.Html",o="<leg",v="tbody",w="<tr",y="</table>",x="undefined",z="></";
qx.Bootstrap.define(n,{statics:{__sa:function(K,L,M){return M.match(/^(abbr|br|col|img|input|link|meta|param|hr|area|embed)$/i)?K:L+z+M+H;
},__sb:{opt:[1,e,c],leg:[1,f,u],table:[1,h,y],tr:[2,r,E],td:[3,I,b],col:[2,G,C],def:qx.core.Environment.select(g,{"mshtml":[1,s,d],"default":null})},__sc:function(N,O){var U=O.createElement(J);
N=N.replace(/(<(\w+)[^>]*?)\/>/g,this.__sa);
var Q=N.replace(/^\s+/,t).substring(0,5).toLowerCase();
var T,P=this.__sb;

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
if(typeof ba===m){ba=this.__sc(ba,X);
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
qx.Bootstrap.define(a,{statics:{getParentElement:function(b){return b.parentNode;
},insertEnd:function(c,parent){parent.appendChild(c);
},remove:function(d){if(!d.parentNode){return false;
}d.parentNode.removeChild(d);
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
}},defer:function(p){qx.q.attach({"animate":p.animate,"fadeIn":p.fadeIn,"fadeOut":p.fadeOut});
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
(function(){var h="head",g="html.stylesheet.insertrule",f="}",e="html.stylesheet.createstylesheet",d="text/css",c="{",b="qx.bom.Stylesheet",a="style";
qx.Bootstrap.define(b,{statics:{createElement:function(i){if(qx.core.Environment.get(e)){var j=document.createStyleSheet();

if(i){j.cssText=i;
}return j;
}else{var k=document.createElement(a);
k.type=d;

if(i){k.appendChild(document.createTextNode(i));
}document.getElementsByTagName(h)[0].appendChild(k);
return k.sheet;
}},addRule:function(l,m,n){if(qx.core.Environment.get(g)){l.insertRule(m+c+n+f,l.cssRules.length);
}else{l.addRule(m,n);
}}}});
})();
(function(){var h="object",g="function",f="qx.bom.client.Stylesheet",e="html.stylesheet.deleterule",d="html.stylesheet.insertrule",c="html.stylesheet.createstylesheet",b="html.stylesheet.addimport",a="html.stylesheet.removeimport";
qx.Bootstrap.define(f,{statics:{__jj:function(){if(!qx.bom.client.Stylesheet.__jk){qx.bom.client.Stylesheet.__jk=qx.bom.Stylesheet.createElement();
}return qx.bom.client.Stylesheet.__jk;
},getCreateStyleSheet:function(){return typeof document.createStyleSheet===h;
},getInsertRule:function(){return typeof qx.bom.client.Stylesheet.__jj().insertRule===g;
},getDeleteRule:function(){return typeof qx.bom.client.Stylesheet.__jj().deleteRule===g;
},getAddImport:function(){return (typeof qx.bom.client.Stylesheet.__jj().addImport===h);
},getRemoveImport:function(){return (typeof qx.bom.client.Stylesheet.__jj().removeImport===h);
}},defer:function(i){qx.core.Environment.add(c,i.getCreateStyleSheet);
qx.core.Environment.add(d,i.getInsertRule);
qx.core.Environment.add(e,i.getDeleteRule);
qx.core.Environment.add(b,i.getAddImport);
qx.core.Environment.add(a,i.getRemoveImport);
}});
})();
(function(){var v="",u=" ",t="name",s="alternate",r="linear",q="reverse",p="css.animation",o="ms ",n="% {",m="origin",d="keep",l="timing",h="repeat",c="qx.bom.element.Animation",b=";",g="} ",f="Anni",j="keyframes",a=":",k="end-event";
qx.Bootstrap.define(c,{statics:{__sd:null,__se:f,__bU:0,__sf:{},__sg:{"scale":true,"rotate":true,"skew":true,"translate":true},__sh:qx.core.Environment.get(p),animate:function(w,x){this.__sk(x);

if(!this.__sd){this.__sd=qx.bom.Stylesheet.createElement();
}var B=x.keyFrames;
if(this.__sh!=null){var name=this.__sm(B,x.reverse);
var z=name+u+x.duration+o+x.repeat+u+x.timing+u+(x.alternate?s:v);
var y=this.__sh[k];
qx.bom.Event.addNativeListener(w,y,this.__si);
w.style[this.__sh[t]]=z;
}var A=new qx.bom.element.AnimationHandle();
A.desc=x;
A.el=w;
w.$$animation=A;
if(x.origin!=null){qx.bom.element.Transform.setOrigin(w,x.origin);
}if(this.__sh==null){window.setTimeout(function(){qx.bom.element.Animation.__si({target:w});
},0);
}return A;
},__si:function(e){var C=e.target;
var E=C.$$animation;
if(!E){return;
}var F=E.desc;

if(qx.bom.element.Animation.__sh!=null){C.style[qx.bom.element.Animation.__sh[t]]=v;
qx.bom.Event.removeNativeListener(C,qx.bom.element.Animation.__sh[t],qx.bom.element.Animation.__si);
}
if(F.origin!=null){qx.bom.element.Transform.setOrigin(C,v);
}
if(F.keep!=null){qx.bom.element.Animation.__sj(C,F.keyFrames[F.keep]);
}C.$$animation=null;
E.el=null;
E.ended=true;
var D=E.getOnEnd();

for(var i=0;i<D.length;i++){D[i].callback.call(D[i].ctx,C);
}},__sj:function(G,H){var J;

for(var I in H){if(I in qx.bom.element.Animation.__sg){if(!J){J={};
}J[I]=H[I];
}else{G.style[I]=H[I];
}}if(J){qx.bom.element.Transform.transform(G,J);
}},__sk:function(K){if(!K.hasOwnProperty(s)){K.alternate=false;
}
if(!K.hasOwnProperty(d)){K.keep=null;
}
if(!K.hasOwnProperty(q)){K.reverse=false;
}
if(!K.hasOwnProperty(h)){K.repeat=1;
}
if(!K.hasOwnProperty(l)){K.timing=r;
}
if(!K.hasOwnProperty(m)){K.origin=null;
}},__sm:function(frames,L){var O=v;
for(var R in frames){O+=(L?-(R-100):R)+n;
var N=frames[R];
var Q;
for(var M in N){if(M in this.__sg){if(!Q){Q={};
}Q[M]=N[M];
}else{O+=M+a+N[M]+b;
}}if(Q){O+=qx.bom.element.Transform.getCss(Q);
}O+=g;
}if(this.__sf[O]){return this.__sf[O];
}var name=this.__se+this.__bU++;
var P=this.__sh[j]+u+name;
qx.bom.Stylesheet.addRule(this.__sd,P,O);
this.__sf[O]=name;
return name;
}}});
})();
(function(){var f="on",d="function",c="undefined",b="qx.bom.Event",a="return;";
qx.Bootstrap.define(b,{statics:{addNativeListener:function(g,h,i,j){if(g.addEventListener){g.addEventListener(h,i,!!j);
}else if(g.attachEvent){g.attachEvent(f+h,i);
}else if(typeof g[f+h]!=c){g[f+h]=i;
}else{}},removeNativeListener:function(k,l,m,n){if(k.removeEventListener){k.removeEventListener(l,m,!!n);
}else if(k.detachEvent){try{k.detachEvent(f+l,m);
}catch(e){if(e.number!==-2146828218){throw e;
}}}else if(typeof k[f+l]!=c){k[f+l]=null;
}else{}},supportsEvent:function(o,p){var q=f+p;
var r=(q in o);

if(!r){r=typeof o[q]==d;

if(!r&&o.setAttribute){o.setAttribute(q,a);
r=typeof o[q]==d;
o.removeAttribute(q);
}}return r;
}}});
})();
(function(){var f="css.animation",e="",d="qx.bom.element.AnimationHandle",c="playstate",b="paused",a="running";
qx.Bootstrap.define(d,{extend:Object,construct:function(){var g=qx.core.Environment.get(f);
this.__sn=g&&g[c];
this.__so=[];
},members:{__sn:null,__sp:false,__sq:false,__so:null,onEnd:function(h,i){this.__so.push({ctx:i||this,callback:h});
},getOnEnd:function(){return this.__so;
},isPlaying:function(){return this.__sp;
},isEnded:function(){return this.__sq;
},pause:function(){if(this.el){this.el.style[this.__sn]=b;
this.el.$$animation.__sp=false;
}},play:function(){if(this.el){this.el.style[this.__sn]=a;
this.el.$$animation.__sp=true;
}},stop:function(){if(this.el){this.el.style[this.__sn]=e;
this.el.style[qx.core.Environment.get(f).name]=e;
this.el.$$animation.__sp=false;
this.el.$$animation.__sq=true;
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
(function(){var m="name",l="",k=") ",j="(",h="css.transform",g="qx.bom.element.Transform",f="Z",e=";",d="X",c="Y",a="origin",b=":";
qx.Bootstrap.define(g,{statics:{__sr:[d,c,f],__ss:qx.core.Environment.get(h),transform:function(n,o){var q=this.__st(o);

if(this.__ss!=null){var p=this.__ss[m];
n.style[p]=q;
}},getCss:function(r){var t=this.__st(r);

if(this.__ss!=null){var s=this.__ss[m];
return qx.lang.String.hyphenate(s)+b+t+e;
}return l;
},setOrigin:function(u,v){if(this.__ss!=null){u.style[this.__ss[a]]=v;
}},__st:function(w){var z=l;

for(var y in w){var x=w[y];
if(qx.Bootstrap.isArray(x)){for(var i=0;i<x.length;i++){if(x[i]==undefined){continue;
}z+=y+this.__sr[i]+j;
z+=x[i];
z+=k;
}}else{z+=y+j+w[y]+k;
}}return z;
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
}},defer:function(g){qx.q.attach({"add":g.add,"getChildren":g.getChildren,"forEach":g.forEach,"getParents":g.getParents});
}});
})();
(function(){var b="qx.dom.Hierarchy",a="nextSibling";
qx.Bootstrap.define(b,{statics:{getChildElements:function(c){c=c.firstChild;

if(!c){return [];
}var d=this.getNextSiblings(c);

if(c.nodeType===1){d.unshift(c);
}return d;
},getNextSiblings:function(e){return this._recursivelyCollect(e,a);
},_recursivelyCollect:function(f,g){var h=[];

while(f=f[g]){if(f.nodeType==1){h.push(f);
}}return h;
}}});
})();
(function(){var c="qx.module.Event",b="load",a="complete";
qx.Bootstrap.define(c,{statics:{on:function(d,e,f){for(var i=0;i<this.length;i++){var g=this[i];
if(qx.bom.Event.supportsEvent(g,d)){var h=qx.lang.Function.bind(e,f);
qx.bom.Event.addNativeListener(g,d,h);
g.__za=h;
}if(!g.__zb){g.__zb=new qx.event.Emitter();
}g.__zb.on(d,e,f);
}return this;
},off:function(k,l,m){for(var j=0;j<this.length;j++){var n=this[j];

if(n.__zb){n.__zb.off(k,l,m);
}if(qx.bom.Event.supportsEvent(n,k)){qx.bom.Event.removeNativeListener(n,k,n.__za);
delete n.__za;
}}return this;
},emit:function(o,p){for(var j=0;j<this.length;j++){var q=this[j];

if(q.__zb){q.__zb.emit(o,p);
}}return this;
},once:function(r,s,t){var self=this;
var u=function(v){s.call(this,v);
self.off(r,u,t);
};
this.on(r,u,t);
return this;
},ready:function(w){if(document.readyState===a){window.setTimeout(w,0);
return;
}qx.bom.Event.addNativeListener(window,b,w);
}},defer:function(x){qx.q.attach({"on":x.on,"off":x.off,"once":x.once,"emit":x.emit});
qx.q.attachStatic({"ready":x.ready});
}});
})();
(function(){var b="qx.event.Emitter",a="*";
qx.Bootstrap.define(b,{extend:Object,statics:{__xz:[]},members:{__yz:null,__yA:null,on:function(name,c,d){this.__yB(name).push({listener:c,ctx:d});
qx.event.Emitter.__xz.push({name:name,listener:c,ctx:d});
return qx.event.Emitter.__xz.length-1;
},once:function(name,e,f){this.__yB(name).push({listener:e,ctx:f,once:true});
qx.event.Emitter.__xz.push({name:name,listener:e,ctx:f});
return qx.event.Emitter.__xz.length-1;
},off:function(name,g,h){var k=this.__yB(name);

for(var i=k.length-1;i>=0;i--){var j=k[i];

if(j.listener==g&&j.ctx==h){k.splice(i,1);
}}},offById:function(l){var m=qx.event.Emitter.__xz[l];
this.off(m.name,m.listener,m.ctx);
},addListener:function(name,n,o){return this.on(name,n,o);
},addListenerOnce:function(name,p,q){return this.once(name,p,q);
},removeListener:function(name,r,s){this.off(name,r,s);
},removeListenerById:function(t){this.offById(t);
},emit:function(name,u){var w=this.__yB(name);

for(var i=w.length-1;i>=0;i--){var v=w[i];
v.listener.call(v.ctx,u);

if(v.once){w.splice(i,1);
}}w=this.__yB(a);

for(var i=w.length-1;i>=0;i--){var v=w[i];
v.listener.call(v.ctx,u);
}},__yB:function(name){if(this.__yz==null){this.__yz={};
}
if(this.__yz[name]==null){this.__yz[name]=[];
}return this.__yz[name];
}}});
})();
(function(){var a="qx.module.Template";
qx.Bootstrap.define(a,{statics:{get:function(b,c,d){var e=qx.bom.Template.get(b,c,d);
return qx.lang.Array.cast([e],qx.Collection);
},toHtml:function(f,g,h,i){return qx.bom.Template.toHtml(f,g,h,i);
}},defer:function(j){qx.q.attachStatic({"template":{get:j.get,toHtml:j.toHtml}});
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

