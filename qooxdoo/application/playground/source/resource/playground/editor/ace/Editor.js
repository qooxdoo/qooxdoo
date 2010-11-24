/*
 RequireJS 0.14.5 Copyright (c) 2010, The Dojo Foundation All Rights Reserved.
 Available via the MIT or new BSD license.
 see: http://github.com/jrburke/requirejs for details
 RequireJS text Copyright (c) 2010, The Dojo Foundation All Rights Reserved.
 Available via the MIT or new BSD license.
 see: http://github.com/jrburke/requirejs for details
*/
var require, define;
(function() {
  function i(l) {
    return S.call(l) === "[object Function]"
  }
  function h(l, m, r) {
    var q = g.plugins.defined[l];
    if(q) {
      q[r.name].apply(null, r.args)
    }else {
      q = g.plugins.waiting[l] || (g.plugins.waiting[l] = []);
      q.push(r);
      u(["require/" + l], m.contextName)
    }
  }
  function e(l, m) {
    H.apply(u, l);
    m.loaded[l[0]] = true
  }
  function d(l, m, r) {
    var q, s, y;
    for(q = 0;y = m[q];q++) {
      y = typeof y === "string" ? {name:y} : y;
      s = y.location;
      if(r && (!s || s.indexOf("/") !== 0 && s.indexOf(":") === -1)) {
        y.location = r + "/" + (y.location || y.name)
      }y.location = y.location || y.name;
      y.lib = y.lib || "lib";
      y.main = y.main || "main";
      l[y.name] = y
    }
  }
  function j(l) {
    var m = true, r = l.config.priorityWait, q, s;
    if(r) {
      for(s = 0;q = r[s];s++) {
        if(!l.loaded[q]) {
          m = false;
          break
        }
      }m && delete l.config.priorityWait
    }return m
  }
  function c(l) {
    var m, r = g.paused;
    if(l.scriptCount <= 0) {
      for(l.scriptCount = 0;N.length;) {
        m = N.shift();
        m[0] === null ? u.onError(new Error("Mismatched anonymous require.def modules")) : e(m, l)
      }if(!(l.config.priorityWait && !j(l))) {
        if(r.length) {
          for(l = 0;m = r[l];l++) {
            u.checkDeps.apply(u, m)
          }
        }u.checkLoaded(g.ctxName)
      }
    }
  }
  function k(l, m) {
    var r = g.plugins.callbacks[l] = [];
    g.plugins[l] = function() {
      for(var q = 0, s;s = r[q];q++) {
        if(s.apply(null, arguments) === true && m) {
          return true
        }
      }return false
    }
  }
  function a(l, m) {
    if(!l.jQuery) {
      if((m = m || (typeof jQuery !== "undefined" ? jQuery : null)) && "readyWait" in m) {
        l.jQuery = m;
        if(!l.defined.jquery && !l.jQueryDef) {
          l.defined.jquery = m
        }if(l.scriptCount) {
          m.readyWait += 1;
          l.jQueryIncremented = true
        }
      }
    }
  }
  function f(l) {
    return function(m) {
      l.exports = m
    }
  }
  function n(l, m, r) {
    return function() {
      var q = [].concat(W.call(arguments, 0));
      q.push(m, r);
      return(l ? require[l] : require).apply(null, q)
    }
  }
  function p(l, m) {
    var r = l.contextName, q = n(null, r, m);
    u.mixin(q, {def:n("def", r, m), get:n("get", r, m), nameToUrl:n("nameToUrl", r, m), ready:u.ready, context:l, config:l.config, isBrowser:g.isBrowser});
    return q
  }
  var b = {}, g, v, t = [], o, w, x, B, E, F = {}, M, I = /(\/\*([\s\S]*?)\*\/|\/\/(.*)$)/mg, K = /require\(["']([\w\-_\.\/]+)["']\)/g, H, J = !!(typeof window !== "undefined" && navigator && document), T = !J && typeof importScripts !== "undefined", X = J && navigator.platform === "PLAYSTATION 3" ? /^complete$/ : /^(complete|loaded)$/, S = Object.prototype.toString, U = Array.prototype, W = U.slice, P, u, O, N = [], V = false, Q;
  if(typeof require !== "undefined") {
    if(i(require)) {
      return
    }else {
      F = require
    }
  }u = require = function(l, m, r, q, s) {
    var y;
    if(typeof l === "string" && !i(m)) {
      return require.get(l, m, r, q)
    }if(!require.isArray(l)) {
      y = l;
      if(require.isArray(m)) {
        l = m;
        m = r;
        r = q;
        q = s
      }else {
        l = []
      }
    }H(null, l, m, y, r, q);
    (l = g.contexts[r || y && y.context || g.ctxName]) && l.scriptCount === 0 && c(l)
  };
  u.onError = function(l) {
    throw l;
  };
  define = u.def = function(l, m, r, q) {
    var s, y, A = Q;
    if(typeof l !== "string") {
      q = r;
      r = m;
      m = l;
      l = null
    }if(!u.isArray(m)) {
      q = r;
      r = m;
      m = []
    }if(!l && !m.length && u.isFunction(r)) {
      r.toString().replace(I, "").replace(K, function(z, C) {
        m.push(C)
      });
      m = ["require", "exports", "module"].concat(m)
    }if(!l && V) {
      s = document.getElementsByTagName("script");
      for(l = s.length - 1;l > -1 && (y = s[l]);l--) {
        if(y.readyState === "interactive") {
          A = y;
          break
        }
      }A || u.onError(new Error("ERROR: No matching script interactive for " + r));
      l = A.getAttribute("data-requiremodule")
    }if(typeof l === "string") {
      g.contexts[g.ctxName].jQueryDef = l === "jquery"
    }N.push([l, m, r, null, q])
  };
  H = function(l, m, r, q, s, y) {
    var A, z, C, G, D;
    s = s ? s : q && q.context ? q.context : g.ctxName;
    A = g.contexts[s];
    if(l) {
      z = l.indexOf("!");
      if(z !== -1) {
        C = l.substring(0, z);
        l = l.substring(z + 1, l.length)
      }else {
        C = A.defPlugin[l]
      }z = A.waiting[l];
      if(A && (A.defined[l] || z && z !== U[l])) {
        return
      }
    }if(s !== g.ctxName) {
      z = g.contexts[g.ctxName] && g.contexts[g.ctxName].loaded;
      G = true;
      if(z) {
        for(D in z) {
          if(!(D in b)) {
            if(!z[D]) {
              G = false;
              break
            }
          }
        }
      }if(G) {
        g.ctxName = s
      }
    }if(!A) {
      A = {contextName:s, config:{waitSeconds:7, baseUrl:g.baseUrl || "./", paths:{}, packages:{}}, waiting:[], specified:{require:true, exports:true, module:true}, loaded:{}, scriptCount:0, urlFetched:{}, defPlugin:{}, defined:{}, modifiers:{}};
      g.plugins.newContext && g.plugins.newContext(A);
      A = g.contexts[s] = A
    }if(q) {
      if(q.baseUrl) {
        if(q.baseUrl.charAt(q.baseUrl.length - 1) !== "/") {
          q.baseUrl += "/"
        }
      }z = A.config.paths;
      s = A.config.packages;
      u.mixin(A.config, q, true);
      if(q.paths) {
        for(D in q.paths) {
          D in b || (z[D] = q.paths[D])
        }A.config.paths = z
      }if((z = q.packagePaths) || q.packages) {
        if(z) {
          for(D in z) {
            D in b || d(s, z[D], D)
          }
        }q.packages && d(s, q.packages);
        A.config.packages = s
      }if(q.priority) {
        u(q.priority);
        A.config.priorityWait = q.priority
      }if(q.deps || q.callback) {
        u(q.deps || [], q.callback)
      }q.ready && u.ready(q.ready);
      if(!m) {
        return
      }
    }if(m) {
      q = m;
      m = [];
      for(D = 0;D < q.length;D++) {
        m[D] = u.splitPrefix(q[D], l || y, A)
      }
    }y = A.waiting.push({name:l, deps:m, callback:r});
    if(l) {
      A.waiting[l] = y - 1;
      A.specified[l] = true
    }if(l && r && !u.isFunction(r)) {
      A.defined[l] = r
    }C && h(C, A, {name:"require", args:[l, m, r, A]});
    g.paused.push([C, l, m, A]);
    if(l) {
      A.loaded[l] = true;
      A.jQueryDef = l === "jquery"
    }
  };
  u.mixin = function(l, m, r) {
    for(var q in m) {
      if(!(q in b) && (!(q in l) || r)) {
        l[q] = m[q]
      }
    }return u
  };
  u.version = "0.14.5+";
  g = u.s = {ctxName:"_", contexts:{}, paused:[], plugins:{defined:{}, callbacks:{}, waiting:{}}, skipAsync:{}, isBrowser:J, isPageLoaded:!J, readyCalls:[], doc:J ? document : null};
  u.isBrowser = g.isBrowser;
  if(J) {
    g.head = document.getElementsByTagName("head")[0];
    if(O = document.getElementsByTagName("base")[0]) {
      g.head = O.parentNode
    }
  }u.plugin = function(l) {
    var m, r, q, s = l.prefix, y = g.plugins.callbacks, A = g.plugins.waiting[s], z;
    m = g.plugins.defined;
    q = g.contexts;
    if(m[s]) {
      return u
    }m[s] = l;
    z = ["newContext", "isWaiting", "orderDeps"];
    for(m = 0;r = z[m];m++) {
      g.plugins[r] || k(r, r === "isWaiting");
      y[r].push(l[r])
    }if(l.newContext) {
      for(r in q) {
        if(!(r in b)) {
          m = q[r];
          l.newContext(m)
        }
      }
    }if(A) {
      for(m = 0;q = A[m];m++) {
        l[q.name] && l[q.name].apply(null, q.args)
      }delete g.plugins.waiting[s]
    }return u
  };
  u.completeLoad = function(l, m) {
    for(var r;N.length;) {
      r = N.shift();
      if(r[0] === null) {
        r[0] = l;
        break
      }else {
        if(r[0] === l) {
          break
        }else {
          e(r, m)
        }
      }
    }r && e(r, m);
    m.loaded[l] = true;
    a(m);
    m.scriptCount -= 1;
    c(m)
  };
  u.pause = u.resume = function() {
  };
  u.checkDeps = function(l, m, r, q) {
    if(l) {
      h(l, q, {name:"checkDeps", args:[m, r, q]})
    }else {
      for(l = 0;m = r[l];l++) {
        if(!q.specified[m.fullName]) {
          q.specified[m.fullName] = true;
          q.startTime = (new Date).getTime();
          m.prefix ? h(m.prefix, q, {name:"load", args:[m.name, q.contextName]}) : u.load(m.name, q.contextName)
        }
      }
    }
  };
  u.isArray = function(l) {
    return S.call(l) === "[object Array]"
  };
  u.isFunction = i;
  u.get = function(l, m, r) {
    if(l === "require" || l === "exports" || l === "module") {
      u.onError(new Error("Explicit require of " + l + " is not allowed."))
    }m = m || g.ctxName;
    var q = g.contexts[m];
    l = u.normalizeName(l, r, q);
    r = q.defined[l];
    r === undefined && u.onError(new Error("require: module name '" + l + "' has not been loaded yet for context: " + m));
    return r
  };
  u.load = function(l, m) {
    var r = g.contexts[m], q = r.urlFetched, s = r.loaded;
    g.isDone = false;
    s[l] || (s[l] = false);
    if(m !== g.ctxName) {
      t.push(arguments)
    }else {
      s = u.nameToUrl(l, null, m);
      if(!q[s]) {
        r.scriptCount += 1;
        u.attach(s, m, l);
        q[s] = true;
        if(r.jQuery && !r.jQueryIncremented) {
          r.jQuery.readyWait += 1;
          r.jQueryIncremented = true
        }
      }
    }
  };
  u.jsExtRegExp = /^\/|:|\?|\.js$/;
  u.normalizeName = function(l, m, r) {
    if(l.charAt(0) === ".") {
      if(m) {
        if(r.config.packages[m]) {
          m = [m]
        }else {
          m = m.split("/");
          m = m.slice(0, m.length - 1)
        }l = m.concat(l.split("/"));
        for(v = 0;m = l[v];v++) {
          if(m === ".") {
            l.splice(v, 1);
            v -= 1
          }else {
            if(m === "..") {
              if(v === 1) {
                break
              }else {
                if(v > 1) {
                  l.splice(v - 1, 2);
                  v -= 2
                }
              }
            }
          }
        }l = l.join("/")
      }
    }return l
  };
  u.splitPrefix = function(l, m, r) {
    var q = l.indexOf("!"), s = null;
    if(q !== -1) {
      s = l.substring(0, q);
      l = l.substring(q + 1, l.length)
    }l = u.normalizeName(l, m, r);
    return{prefix:s, name:l, fullName:s ? s + "!" + l : l}
  };
  u.nameToUrl = function(l, m, r, q) {
    var s, y, A, z;
    z = g.contexts[r];
    r = z.config;
    l = u.normalizeName(l, q, z);
    if(u.jsExtRegExp.test(l)) {
      l = l + (m ? m : "")
    }else {
      s = r.paths;
      y = r.packages;
      q = l.split("/");
      for(z = q.length;z > 0;z--) {
        A = q.slice(0, z).join("/");
        if(s[A]) {
          q.splice(0, z, s[A]);
          break
        }else {
          if(A = y[A]) {
            s = A.location + "/" + A.lib;
            if(l === A.name) {
              s += "/" + A.main
            }q.splice(0, z, s);
            break
          }
        }
      }l = q.join("/") + (m || ".js");
      l = (l.charAt(0) === "/" || l.match(/^\w+:/) ? "" : r.baseUrl) + l
    }return r.urlArgs ? l + ((l.indexOf("?") === -1 ? "?" : "&") + r.urlArgs) : l
  };
  u.blockCheckLoaded = true;
  u.checkLoaded = function(l) {
    var m = g.contexts[l || g.ctxName], r = m.config.waitSeconds * 1E3, q = r && m.startTime + r < (new Date).getTime(), s, y = "", A = false, z = false, C, G = g.plugins.isWaiting, D = g.plugins.orderDeps;
    if(!m.isCheckLoaded) {
      if(m.config.priorityWait) {
        if(j(m)) {
          c(m)
        }else {
          return
        }
      }m.isCheckLoaded = u.blockCheckLoaded;
      r = m.waiting;
      s = m.loaded;
      for(C in s) {
        if(!(C in b)) {
          A = true;
          if(!s[C]) {
            if(q) {
              y += C + " "
            }else {
              z = true;
              break
            }
          }
        }
      }if(!A && !r.length && (!G || !G(m))) {
        m.isCheckLoaded = false
      }else {
        if(q && y) {
          s = new Error("require.js load timeout for modules: " + y);
          s.requireType = "timeout";
          s.requireModules = y;
          u.onError(s)
        }if(z) {
          m.isCheckLoaded = false;
          if(J || T) {
            setTimeout(function() {
              u.checkLoaded(l)
            }, 50)
          }
        }else {
          m.waiting = [];
          m.loaded = {};
          D && D(m);
          for(s = 0;y = r[s];s++) {
            u.exec(y, {}, r, m)
          }m.isCheckLoaded = false;
          if(m.waiting.length || G && G(m)) {
            u.checkLoaded(l)
          }else {
            if(t.length) {
              s = m.loaded;
              m = true;
              for(C in s) {
                if(!(C in b)) {
                  if(!s[C]) {
                    m = false;
                    break
                  }
                }
              }if(m) {
                g.ctxName = t[0][1];
                C = t;
                t = [];
                for(s = 0;m = C[s];s++) {
                  u.load.apply(u, m)
                }
              }
            }else {
              g.ctxName = "_";
              g.isDone = true;
              u.callReady && u.callReady()
            }
          }
        }
      }
    }
  };
  u.exec = function(l, m, r, q) {
    if(l) {
      var s = l.name, y = l.callback;
      y = l.deps;
      var A, z, C = q.defined, G, D = [], L, R = false;
      if(s) {
        if(m[s] || s in C) {
          return C[s]
        }m[s] = true
      }if(y) {
        for(A = 0;z = y[A];A++) {
          z = z.name;
          if(z === "require") {
            z = p(q, s)
          }else {
            if(z === "exports") {
              z = C[s] = {};
              R = true
            }else {
              if(z === "module") {
                L = z = {id:s, uri:s ? u.nameToUrl(s, null, q.contextName) : undefined};
                L.setExports = f(L)
              }else {
                z = z in C ? C[z] : m[z] ? undefined : u.exec(r[r[z]], m, r, q)
              }
            }
          }D.push(z)
        }
      }if((y = l.callback) && u.isFunction(y)) {
        G = u.execCb(s, y, D);
        if(s) {
          if(R && G === undefined && (!L || !("exports" in L))) {
            G = C[s]
          }else {
            if(L && "exports" in L) {
              G = C[s] = L.exports
            }else {
              s in C && !R && u.onError(new Error(s + " has already been defined"));
              C[s] = G
            }
          }
        }
      }return G
    }
  };
  u.execCb = function(l, m, r) {
    return m.apply(null, r)
  };
  u.onScriptLoad = function(l) {
    var m = l.currentTarget || l.srcElement, r;
    if(l.type === "load" || X.test(m.readyState)) {
      r = m.getAttribute("data-requirecontext");
      l = m.getAttribute("data-requiremodule");
      r = g.contexts[r];
      u.completeLoad(l, r);
      m.removeEventListener ? m.removeEventListener("load", u.onScriptLoad, false) : m.detachEvent("onreadystatechange", u.onScriptLoad)
    }
  };
  u.attach = function(l, m, r, q, s) {
    var y;
    if(J) {
      q = q || u.onScriptLoad;
      y = document.createElement("script");
      y.type = s || "text/javascript";
      y.charset = "utf-8";
      if(!g.skipAsync[l]) {
        y.async = true
      }y.setAttribute("data-requirecontext", m);
      y.setAttribute("data-requiremodule", r);
      if(y.addEventListener) {
        y.addEventListener("load", q, false)
      }else {
        V = true;
        y.attachEvent("onreadystatechange", q)
      }y.src = l;
      Q = y;
      O ? g.head.insertBefore(y, O) : g.head.appendChild(y);
      Q = null;
      return y
    }else {
      if(T) {
        q = g.contexts[m];
        m = q.loaded;
        m[r] = false;
        importScripts(l);
        u.completeLoad(r, q)
      }
    }return null
  };
  g.baseUrl = F.baseUrl;
  if(J && (!g.baseUrl || !g.head)) {
    o = document.getElementsByTagName("script");
    x = F.baseUrlMatch ? F.baseUrlMatch : /(allplugins-)?require\.js(\W|$)/i;
    for(v = o.length - 1;v > -1 && (w = o[v]);v--) {
      if(!g.head) {
        g.head = w.parentNode
      }if(!F.deps) {
        if(B = w.getAttribute("data-main")) {
          F.deps = [B]
        }
      }if((B = w.src) && !g.baseUrl) {
        if(E = B.match(x)) {
          g.baseUrl = B.substring(0, E.index);
          break
        }
      }
    }
  }u.pageLoaded = function() {
    if(!g.isPageLoaded) {
      g.isPageLoaded = true;
      P && clearInterval(P);
      if(M) {
        document.readyState = "complete"
      }u.callReady()
    }
  };
  u.callReady = function() {
    var l = g.readyCalls, m, r, q;
    if(g.isPageLoaded && g.isDone) {
      if(l.length) {
        g.readyCalls = [];
        for(m = 0;r = l[m];m++) {
          r()
        }
      }l = g.contexts;
      for(q in l) {
        if(!(q in b)) {
          m = l[q];
          if(m.jQueryIncremented) {
            m.jQuery.readyWait -= 1;
            m.jQueryIncremented = false
          }
        }
      }
    }
  };
  u.ready = function(l) {
    g.isPageLoaded && g.isDone ? l() : g.readyCalls.push(l);
    return u
  };
  if(J) {
    if(document.addEventListener) {
      document.addEventListener("DOMContentLoaded", u.pageLoaded, false);
      window.addEventListener("load", u.pageLoaded, false);
      if(!document.readyState) {
        M = true;
        document.readyState = "loading"
      }
    }else {
      if(window.attachEvent) {
        window.attachEvent("onload", u.pageLoaded);
        if(self === self.top) {
          P = setInterval(function() {
            try {
              if(document.body) {
                document.documentElement.doScroll("left");
                u.pageLoaded()
              }
            }catch(l) {
            }
          }, 30)
        }
      }
    }document.readyState === "complete" && u.pageLoaded()
  }u(F);
  typeof setTimeout !== "undefined" && setTimeout(function() {
    var l = g.contexts[F.context || "_"];
    a(l);
    c(l)
  }, 0)
})();
(function() {
  var i = ["Msxml2.XMLHTTP", "Microsoft.XMLHTTP", "Msxml2.XMLHTTP.4.0"], h = /^\s*<\?xml(\s)+version=[\'\"](\d)*.(\d)*[\'\"](\s)*\?>/im, e = /<body[^>]*>\s*([\s\S]+)\s*<\/body>/im;
  if(!require.textStrip) {
    require.textStrip = function(d) {
      if(d) {
        d = d.replace(h, "");
        var j = d.match(e);
        if(j) {
          d = j[1]
        }
      }else {
        d = ""
      }return d
    }
  }if(!require.getXhr) {
    require.getXhr = function() {
      var d, j, c;
      if(typeof XMLHttpRequest !== "undefined") {
        return new XMLHttpRequest
      }else {
        for(j = 0;j < 3;j++) {
          c = i[j];
          try {
            d = new ActiveXObject(c)
          }catch(k) {
          }if(d) {
            i = [c];
            break
          }
        }
      }if(!d) {
        throw new Error("require.getXhr(): XMLHttpRequest not available");
      }return d
    }
  }if(!require.fetchText) {
    require.fetchText = function(d, j) {
      var c = require.getXhr();
      c.open("GET", d, true);
      c.onreadystatechange = function() {
        c.readyState === 4 && j(c.responseText)
      };
      c.send(null)
    }
  }require.plugin({prefix:"text", require:function() {
  }, newContext:function(d) {
    require.mixin(d, {text:{}, textWaiting:[]})
  }, load:function(d, j) {
    var c = false, k = null, a, f = d.indexOf("."), n = d.substring(0, f), p = d.substring(f + 1, d.length), b = require.s.contexts[j], g = b.textWaiting;
    f = p.indexOf("!");
    if(f !== -1) {
      c = p.substring(f + 1, p.length);
      p = p.substring(0, f);
      f = c.indexOf("!");
      if(f !== -1 && c.substring(0, f) === "strip") {
        k = c.substring(f + 1, c.length);
        c = "strip"
      }else {
        if(c !== "strip") {
          k = c;
          c = null
        }
      }
    }a = n + "!" + p;
    f = c ? a + "!" + c : a;
    if(k !== null && !b.text[a]) {
      b.defined[d] = b.text[a] = k
    }else {
      if(!b.text[a] && !b.textWaiting[a] && !b.textWaiting[f]) {
        g[f] || (g[f] = g[g.push({name:d, key:a, fullKey:f, strip:!!c}) - 1]);
        j = require.nameToUrl(n, "." + p, j);
        b.loaded[d] = false;
        require.fetchText(j, function(v) {
          b.text[a] = v;
          b.loaded[d] = true
        })
      }
    }
  }, checkDeps:function() {
  }, isWaiting:function(d) {
    return!!d.textWaiting.length
  }, orderDeps:function(d) {
    var j, c, k, a = d.textWaiting;
    d.textWaiting = [];
    for(j = 0;c = a[j];j++) {
      k = d.text[c.key];
      d.defined[c.name] = c.strip ? require.textStrip(k) : k
    }
  }})
})();
define("ace/lib/oop", ["require", "exports", "module"], function() {
  var i = {};
  i.inherits = function(h, e) {
    var d = function() {
    };
    d.prototype = e.prototype;
    h.super_ = e.prototype;
    h.prototype = new d;
    h.prototype.constructor = h
  };
  i.mixin = function(h, e) {
    for(var d in e) {
      h[d] = e[d]
    }
  };
  i.implement = function(h, e) {
    i.mixin(h, e)
  };
  return i
});
define("ace/lib/core", ["require", "exports", "module"], function() {
  var i = {}, h = (navigator.platform.match(/mac|win|linux/i) || ["other"])[0].toLowerCase();
  i.isWin = h == "win";
  i.isMac = h == "mac";
  i.isLinux = h == "linux";
  i.isIE = !+"\u000b1";
  i.isGecko = window.controllers && window.navigator.product === "Gecko";
  i.provide = function(e) {
    e = e.split(".");
    for(var d = window, j = 0;j < e.length;j++) {
      var c = e[j];
      d[c] || (d[c] = {});
      d = d[c]
    }
  };
  return i
});
define("ace/lib/event", ["require", "exports", "module", "./core"], function(i) {
  var h = i("./core"), e = {};
  e.addListener = function(d, j, c) {
    if(d.addEventListener) {
      return d.addEventListener(j, c, false)
    }if(d.attachEvent) {
      var k = function() {
        c(window.event)
      };
      c.$$wrapper = k;
      d.attachEvent("on" + j, k)
    }
  };
  e.removeListener = function(d, j, c) {
    if(d.removeEventListener) {
      return d.removeEventListener(j, c, false)
    }if(d.detachEvent) {
      d.detachEvent("on" + j, c.$$wrapper || c)
    }
  };
  e.stopEvent = function(d) {
    e.stopPropagation(d);
    e.preventDefault(d);
    return false
  };
  e.stopPropagation = function(d) {
    if(d.stopPropagation) {
      d.stopPropagation()
    }else {
      d.cancelBubble = true
    }
  };
  e.preventDefault = function(d) {
    if(d.preventDefault) {
      d.preventDefault()
    }else {
      d.returnValue = false
    }
  };
  e.getDocumentX = function(d) {
    return d.clientX ? d.clientX + (document.documentElement.scrollLeft || document.body.scrollLeft) : d.pageX
  };
  e.getDocumentY = function(d) {
    return d.clientY ? d.clientY + (document.documentElement.scrollTop || document.body.scrollTop) : d.pageX
  };
  e.getButton = function(d) {
    return d.preventDefault ? d.button : Math.max(d.button - 1, 2)
  };
  e.capture = document.documentElement.setCapture ? function(d, j, c) {
    function k(a) {
      j && j(a);
      c && c();
      e.removeListener(d, "mousemove", j);
      e.removeListener(d, "mouseup", k);
      e.removeListener(d, "losecapture", k);
      d.releaseCapture()
    }
    e.addListener(d, "mousemove", j);
    e.addListener(d, "mouseup", k);
    e.addListener(d, "losecapture", k);
    d.setCapture()
  } : function(d, j, c) {
    function k(f) {
      j(f);
      f.stopPropagation()
    }
    function a(f) {
      j && j(f);
      c && c();
      document.removeEventListener("mousemove", k, true);
      document.removeEventListener("mouseup", a, true);
      f.stopPropagation()
    }
    document.addEventListener("mousemove", k, true);
    document.addEventListener("mouseup", a, true)
  };
  e.addMouseWheelListener = function(d, j) {
    var c = function(k) {
      if(k.wheelDelta !== undefined) {
        if(k.wheelDeltaX !== undefined) {
          k.wheelX = -k.wheelDeltaX / 8;
          k.wheelY = -k.wheelDeltaY / 8
        }else {
          k.wheelX = 0;
          k.wheelY = -k.wheelDelta / 8
        }
      }else {
        if(k.axis && k.axis == k.HORIZONTAL_AXIS) {
          k.wheelX = (k.detail || 0) * 5;
          k.wheelY = 0
        }else {
          k.wheelX = 0;
          k.wheelY = (k.detail || 0) * 5
        }
      }j(k)
    };
    e.addListener(d, "DOMMouseScroll", c);
    e.addListener(d, "mousewheel", c)
  };
  e.addMultiMouseDownListener = function(d, j, c, k, a) {
    var f = 0, n, p, b = function(g) {
      f += 1;
      if(f == 1) {
        n = g.clientX;
        p = g.clientY;
        setTimeout(function() {
          f = 0
        }, k || 600)
      }if(e.getButton(g) != j || Math.abs(g.clientX - n) > 5 || Math.abs(g.clientY - p) > 5) {
        f = 0
      }if(f == c) {
        f = 0;
        a(g)
      }return e.preventDefault(g)
    };
    e.addListener(d, "mousedown", b);
    h.isIE && e.addListener(d, "dblclick", b)
  };
  e.addKeyListener = function(d, j) {
    var c = null;
    e.addListener(d, "keydown", function(k) {
      c = k.keyIdentifier || k.keyCode;
      return j(k)
    });
    h.isMac && h.isGecko && e.addListener(d, "keypress", function(k) {
      if(c !== (k.keyIdentifier || k.keyCode)) {
        return j(k)
      }else {
        c = null
      }
    })
  };
  return e
});
define("ace/lib/lang", ["require", "exports", "module"], function() {
  var i = {};
  i.stringReverse = function(h) {
    return h.split("").reverse().join("")
  };
  i.stringRepeat = function(h, e) {
    return(new Array(e + 1)).join(h)
  };
  i.arrayIndexOf = Array.prototype.indexOf ? function(h, e) {
    return h.indexOf(e)
  } : function(h, e) {
    for(var d = 0;d < h.length;d++) {
      if(h[d] == e) {
        return d
      }
    }return-1
  };
  i.isArray = function(h) {
    return Object.prototype.toString.call(h) == "[object Array]"
  };
  i.copyObject = function(h) {
    var e = {};
    for(var d in h) {
      e[d] = h[d]
    }return e
  };
  i.arrayToMap = function(h) {
    for(var e = {}, d = 0;d < h.length;d++) {
      e[h[d]] = 1
    }return e
  };
  i.escapeRegExp = function(h) {
    return h.replace(/([.*+?^${}()|[\]\/\\])/g, "\\$1")
  };
  i.bind = function(h, e) {
    return function() {
      return h.apply(e, arguments)
    }
  };
  i.deferredCall = function(h) {
    var e = null, d = function() {
      e = null;
      h()
    };
    return{schedule:function() {
      e || (e = setTimeout(d, 0))
    }, call:function() {
      i.cancel();
      h()
    }, cancel:function() {
      clearTimeout(e);
      e = null
    }}
  };
  return i
});
define("ace/textinput", ["require", "exports", "module", "./lib/event"], function(i) {
  var h = i("./lib/event");
  return function(e, d) {
    function j() {
      if(!n) {
        var g = c.value;
        if(g) {
          if(g.charCodeAt(g.length - 1) == a.charCodeAt(0)) {
            (g = g.slice(0, -1)) && d.onTextInput(g)
          }else {
            d.onTextInput(g)
          }
        }
      }n = false;
      c.value = a;
      c.select()
    }
    var c = document.createElement("textarea"), k = c.style;
    k.position = "absolute";
    k.left = "-10000px";
    k.top = "-10000px";
    e.appendChild(c);
    var a = String.fromCharCode(0);
    j();
    var f = false, n = false, p = function() {
      setTimeout(function() {
        f || j()
      }, 0)
    }, b = function() {
      d.onCompositionUpdate(c.value)
    };
    h.addListener(c, "keypress", p);
    h.addListener(c, "textInput", p);
    h.addListener(c, "paste", p);
    h.addListener(c, "propertychange", p);
    h.addListener(c, "copy", function() {
      n = true;
      c.value = d.getCopyText();
      c.select();
      n = true;
      setTimeout(j, 0)
    });
    h.addListener(c, "cut", function() {
      n = true;
      c.value = d.getCopyText();
      d.onCut();
      c.select();
      setTimeout(j, 0)
    });
    h.addListener(c, "compositionstart", function() {
      f = true;
      j();
      c.value = "";
      d.onCompositionStart();
      setTimeout(b, 0)
    });
    h.addListener(c, "compositionupdate", b);
    h.addListener(c, "compositionend", function() {
      f = false;
      d.onCompositionEnd();
      p()
    });
    h.addListener(c, "blur", function() {
      d.onBlur()
    });
    h.addListener(c, "focus", function() {
      d.onFocus();
      c.select()
    });
    this.focus = function() {
      d.onFocus();
      c.select();
      c.focus()
    };
    this.blur = function() {
      c.blur()
    }
  }
});
define("ace/conf/keybindings/default_mac", ["require", "exports", "module"], function() {
  return{selectall:"Command-A", removeline:"Command-D", gotoline:"Command-L", togglecomment:"Command-7", findnext:"Command-K", findprevious:"Command-Shift-K", find:"Command-F", replace:"Command-R", undo:"Command-Z", redo:"Command-Shift-Z|Command-Y", overwrite:"Insert", copylinesup:"Command-Option-Up", movelinesup:"Option-Up", selecttostart:"Command-Shift-Up", gotostart:"Command-Home|Command-Up", selectup:"Shift-Up", golineup:"Up", copylinesdown:"Command-Option-Down", movelinesdown:"Option-Down", 
  selecttoend:"Command-Shift-Down", gotoend:"Command-End|Command-Down", selectdown:"Shift-Down", godown:"Down", selectwordleft:"Option-Shift-Left", gotowordleft:"Option-Left", selecttolinestart:"Command-Shift-Left", gotolinestart:"Command-Left|Home", selectleft:"Shift-Left", gotoleft:"Left", selectwordright:"Option-Shift-Right", gotowordright:"Option-Right", selecttolineend:"Command-Shift-Right", gotolineend:"Command-Right|End", selectright:"Shift-Right", gotoright:"Right", selectpagedown:"Shift-PageDown", 
  pagedown:"PageDown", selectpageup:"Shift-PageUp", pageup:"PageUp", selectlinestart:"Shift-Home", selectlineend:"Shift-End", del:"Delete", backspace:"Backspace", outdent:"Shift-Tab", indent:"Tab"}
});
define("ace/conf/keybindings/default_win", ["require", "exports", "module"], function() {
  return{selectall:"Ctrl-A", removeline:"Ctrl-D", gotoline:"Ctrl-L", togglecomment:"Ctrl-7", findnext:"Ctrl-K", findprevious:"Ctrl-Shift-K", find:"Ctrl-F", replace:"Ctrl-R", undo:"Ctrl-Z", redo:"Ctrl-Shift-Z|Ctrl-Y", overwrite:"Insert", copylinesup:"Ctrl-Alt-Up", movelinesup:"Alt-Up", selecttostart:"Alt-Shift-Up", gotostart:"Ctrl-Home|Ctrl-Up", selectup:"Shift-Up", golineup:"Up", copylinesdown:"Ctrl-Alt-Down", movelinesdown:"Alt-Down", selecttoend:"Alt-Shift-Down", gotoend:"Ctrl-End|Ctrl-Down", selectdown:"Shift-Down", 
  godown:"Down", selectwordleft:"Ctrl-Shift-Left", gotowordleft:"Ctrl-Left", selecttolinestart:"Alt-Shift-Left", gotolinestart:"Alt-Left|Home", selectleft:"Shift-Left", gotoleft:"Left", selectwordright:"Ctrl-Shift-Right", gotowordright:"Ctrl-Right", selecttolineend:"Alt-Shift-Right", gotolineend:"Alt-Right|End", selectright:"Shift-Right", gotoright:"Right", selectpagedown:"Shift-PageDown", pagedown:"PageDown", selectpageup:"Shift-PageUp", pageup:"PageUp", selectlinestart:"Shift-Home", selectlineend:"Shift-End", 
  del:"Delete", backspace:"Backspace", outdent:"Shift-Tab", indent:"Tab"}
});
define("ace/plugin_manager", ["require", "exports", "module"], function() {
  return{commands:{}, registerCommand:function(i, h) {
    this.commands[i] = h
  }}
});
define("ace/commands/default_commands", ["require", "exports", "module", "../plugin_manager"], function(i) {
  i = i("../plugin_manager");
  i.registerCommand("selectall", function(h, e) {
    e.selectAll()
  });
  i.registerCommand("removeline", function(h) {
    h.removeLines()
  });
  i.registerCommand("gotoline", function(h) {
    var e = parseInt(prompt("Enter line number:"));
    isNaN(e) || h.gotoLine(e)
  });
  i.registerCommand("togglecomment", function(h) {
    h.toggleCommentLines()
  });
  i.registerCommand("findnext", function(h) {
    h.findNext()
  });
  i.registerCommand("findprevious", function(h) {
    h.findPrevious()
  });
  i.registerCommand("find", function(h) {
    var e = prompt("Find:");
    h.find(e)
  });
  i.registerCommand("undo", function(h) {
    h.undo()
  });
  i.registerCommand("redo", function(h) {
    h.redo()
  });
  i.registerCommand("redo", function(h) {
    h.redo()
  });
  i.registerCommand("overwrite", function(h) {
    h.toggleOverwrite()
  });
  i.registerCommand("copylinesup", function(h) {
    h.copyLinesUp()
  });
  i.registerCommand("movelinesup", function(h) {
    h.moveLinesUp()
  });
  i.registerCommand("selecttostart", function(h, e) {
    e.selectFileStart()
  });
  i.registerCommand("gotostart", function(h) {
    h.navigateFileStart()
  });
  i.registerCommand("selectup", function(h, e) {
    e.selectUp()
  });
  i.registerCommand("golineup", function(h) {
    h.navigateUp()
  });
  i.registerCommand("copylinesdown", function(h) {
    h.copyLinesDown()
  });
  i.registerCommand("movelinesdown", function(h) {
    h.moveLinesDown()
  });
  i.registerCommand("selecttoend", function(h, e) {
    e.selectFileEnd()
  });
  i.registerCommand("gotoend", function(h) {
    h.navigateFileEnd()
  });
  i.registerCommand("selectdown", function(h, e) {
    e.selectDown()
  });
  i.registerCommand("godown", function(h) {
    h.navigateDown()
  });
  i.registerCommand("selectwordleft", function(h, e) {
    e.selectWordLeft()
  });
  i.registerCommand("gotowordleft", function(h) {
    h.navigateWordLeft()
  });
  i.registerCommand("selecttolinestart", function(h, e) {
    e.selectLineStart()
  });
  i.registerCommand("gotolinestart", function(h) {
    h.navigateLineStart()
  });
  i.registerCommand("selectleft", function(h, e) {
    e.selectLeft()
  });
  i.registerCommand("gotoleft", function(h) {
    h.navigateLeft()
  });
  i.registerCommand("selectwordright", function(h, e) {
    e.selectWordRight()
  });
  i.registerCommand("gotowordright", function(h) {
    h.navigateWordRight()
  });
  i.registerCommand("selecttolineend", function(h, e) {
    e.selectLineEnd()
  });
  i.registerCommand("gotolineend", function(h) {
    h.navigateLineEnd()
  });
  i.registerCommand("selectright", function(h, e) {
    e.selectRight()
  });
  i.registerCommand("gotoright", function(h) {
    h.navigateRight()
  });
  i.registerCommand("selectpagedown", function(h) {
    h.selectPageDown()
  });
  i.registerCommand("pagedown", function(h) {
    h.scrollPageDown()
  });
  i.registerCommand("gotopagedown", function(h) {
    h.gotoPageDown()
  });
  i.registerCommand("selectpageup", function(h) {
    h.selectPageUp()
  });
  i.registerCommand("pageup", function(h) {
    h.scrollPageUp()
  });
  i.registerCommand("gotopageup", function(h) {
    h.gotoPageUp()
  });
  i.registerCommand("selectlinestart", function(h, e) {
    e.selectLineStart()
  });
  i.registerCommand("gotolinestart", function(h) {
    h.navigateLineStart()
  });
  i.registerCommand("selectlineend", function(h, e) {
    e.selectLineEnd()
  });
  i.registerCommand("gotolineend", function(h) {
    h.navigateLineEnd()
  });
  i.registerCommand("del", function(h) {
    h.removeRight()
  });
  i.registerCommand("backspace", function(h) {
    h.removeLeft()
  });
  i.registerCommand("outdent", function(h) {
    h.blockOutdent()
  });
  i.registerCommand("indent", function(h) {
    h.indent()
  })
});
define("ace/keybinding", ["require", "exports", "module", "./lib/core", "./lib/event", "./conf/keybindings/default_mac", "./conf/keybindings/default_win", "./plugin_manager", "./commands/default_commands"], function(i) {
  var h = i("./lib/core"), e = i("./lib/event"), d = i("./conf/keybindings/default_mac"), j = i("./conf/keybindings/default_win"), c = i("./plugin_manager");
  i("./commands/default_commands");
  i = function(k, a, f) {
    this.setConfig(f);
    var n = this;
    e.addKeyListener(k, function(p) {
      var b = (n.config.reverse[0 | (p.ctrlKey ? 1 : 0) | (p.altKey ? 2 : 0) | (p.shiftKey ? 4 : 0) | (p.metaKey ? 8 : 0)] || {})[(n.keyNames[p.keyCode] || String.fromCharCode(p.keyCode)).toLowerCase()];
      if(b = c.commands[b]) {
        b(a, a.getSelection());
        return e.stopEvent(p)
      }
    })
  };
  (function() {
    function k(n, p, b, g) {
      return(g && n.toLowerCase() || n).replace(/(?:^\s+|\n|\s+$)/g, "").split(new RegExp("[\\s ]*" + p + "[\\s ]*", "g"), b || 999)
    }
    function a(n, p, b) {
      var g, v = 0;
      n = k(n, "\\-", null, true);
      for(var t = 0, o = n.length;t < o;++t) {
        if(this.keyMods[n[t]]) {
          v |= this.keyMods[n[t]]
        }else {
          g = n[t] || "-"
        }
      }(b[v] || (b[v] = {}))[g] = p;
      return b
    }
    function f(n, p) {
      var b, g, v, t, o = {};
      for(b in n) {
        t = n[b];
        if(p && typeof t == "string") {
          t = t.split(p);
          g = 0;
          for(v = t.length;g < v;++g) {
            a.call(this, t[g], b, o)
          }
        }else {
          a.call(this, t, b, o)
        }
      }return o
    }
    this.keyMods = {ctrl:1, alt:2, option:2, shift:4, meta:8, command:8};
    this.keyNames = {"8":"Backspace", "9":"Tab", "13":"Enter", "27":"Esc", "32":"Space", "33":"PageUp", "34":"PageDown", "35":"End", "36":"Home", "37":"Left", "38":"Up", "39":"Right", "40":"Down", "45":"Insert", "46":"Delete", "107":"+", "112":"F1", "113":"F2", "114":"F3", "115":"F4", "116":"F5", "117":"F6", "118":"F7", "119":"F8", "120":"F9", "121":"F10", "122":"F11", "123":"F12"};
    this.setConfig = function(n) {
      this.config = n || (h.isMac ? d : j);
      if(typeof this.config.reverse == "undefined") {
        this.config.reverse = f.call(this, this.config, "|")
      }
    }
  }).call(i.prototype);
  return i
});
define("ace/event_emitter", ["require", "exports", "module", "./lib/lang"], function(i) {
  var h = i("./lib/lang");
  i = {};
  i.$dispatchEvent = function(e, d) {
    this.$eventRegistry = this.$eventRegistry || {};
    var j = this.$eventRegistry[e];
    if(j && j.length) {
      d = d || {};
      d.type = e;
      for(e = 0;e < j.length;e++) {
        j[e](d)
      }
    }
  };
  i.on = i.addEventListener = function(e, d) {
    this.$eventRegistry = this.$eventRegistry || {};
    var j = this.$eventRegistry[e];
    j || (j = this.$eventRegistry[e] = []);
    h.arrayIndexOf(j, d) == -1 && j.push(d)
  };
  i.removeEventListener = function(e, d) {
    this.$eventRegistry = this.$eventRegistry || {};
    if(e = this.$eventRegistry[e]) {
      d = h.arrayIndexOf(e, d);
      d !== -1 && e.splice(d, 1)
    }
  };
  return i
});
define("ace/range", ["require", "exports", "module"], function() {
  var i = function(h, e, d, j) {
    this.start = {row:h, column:e};
    this.end = {row:d, column:j}
  };
  (function() {
    this.toString = function() {
      return"Range: [" + this.start.row + "/" + this.start.column + "] -> [" + this.end.row + "/" + this.end.column + "]"
    };
    this.contains = function(h, e) {
      return this.compare(h, e) == 0
    };
    this.compare = function(h, e) {
      if(!this.isMultiLine()) {
        if(h === this.start.row) {
          return e < this.start.column ? -1 : e > this.end.column ? 1 : 0
        }
      }if(h < this.start.row) {
        return-1
      }if(h > this.end.row) {
        return 1
      }if(this.start.row === h) {
        return e >= this.start.column ? 0 : -1
      }if(this.end.row === h) {
        return e <= this.end.column ? 0 : 1
      }return 0
    };
    this.clipRows = function(h, e) {
      if(this.end.row > e) {
        var d = {row:e + 1, column:0}
      }if(this.start.row > e) {
        var j = {row:e + 1, column:0}
      }if(this.start.row < h) {
        j = {row:h, column:0}
      }if(this.end.row < h) {
        d = {row:h, column:0}
      }return i.fromPoints(j || this.start, d || this.end)
    };
    this.extend = function(h, e) {
      var d = this.compare(h, e);
      if(d == 0) {
        return this
      }else {
        if(d == -1) {
          var j = {row:h, column:e}
        }else {
          var c = {row:h, column:e}
        }
      }return i.fromPoints(j || this.start, c || this.end)
    };
    this.isEmpty = function() {
      return this.start.row == this.end.row && this.start.column == this.end.column
    };
    this.isMultiLine = function() {
      return this.start.row !== this.end.row
    };
    this.clone = function() {
      return i.fromPoints(this.start, this.end)
    };
    this.toScreenRange = function(h) {
      return new i(this.start.row, h.documentToScreenColumn(this.start.row, this.start.column), this.end.row, h.documentToScreenColumn(this.end.row, this.end.column))
    }
  }).call(i.prototype);
  i.fromPoints = function(h, e) {
    return new i(h.row, h.column, e.row, e.column)
  };
  return i
});
define("ace/selection", ["require", "exports", "module", "./lib/oop", "./lib/lang", "./event_emitter", "./range"], function(i) {
  var h = i("./lib/oop"), e = i("./lib/lang"), d = i("./event_emitter"), j = i("./range");
  i = function(c) {
    this.doc = c;
    this.clearSelection();
    this.selectionLead = {row:0, column:0}
  };
  (function() {
    h.implement(this, d);
    this.isEmpty = function() {
      return!this.selectionAnchor || this.selectionAnchor.row == this.selectionLead.row && this.selectionAnchor.column == this.selectionLead.column
    };
    this.isMultiLine = function() {
      if(this.isEmpty()) {
        return false
      }return this.getRange().isMultiLine()
    };
    this.getCursor = function() {
      return this.selectionLead
    };
    this.setSelectionAnchor = function(c, k) {
      c = this.$clipPositionToDocument(c, k);
      if(this.selectionAnchor) {
        if(this.selectionAnchor.row !== c.row || this.selectionAnchor.column !== c.column) {
          this.selectionAnchor = c;
          this.$dispatchEvent("changeSelection", {})
        }
      }else {
        this.selectionAnchor = c;
        this.$dispatchEvent("changeSelection", {})
      }
    };
    this.getSelectionAnchor = function() {
      return this.selectionAnchor ? this.$clone(this.selectionAnchor) : this.$clone(this.selectionLead)
    };
    this.getSelectionLead = function() {
      return this.$clone(this.selectionLead)
    };
    this.shiftSelection = function(c) {
      if(this.isEmpty()) {
        this.moveCursorTo(this.selectionLead.row, this.selectionLead.column + c)
      }else {
        var k = this.getSelectionAnchor(), a = this.getSelectionLead(), f = this.isBackwards();
        if(!f || k.column !== 0) {
          this.setSelectionAnchor(k.row, k.column + c)
        }if(f || a.column !== 0) {
          this.$moveSelection(function() {
            this.moveCursorTo(a.row, a.column + c)
          })
        }
      }
    };
    this.isBackwards = function() {
      var c = this.selectionAnchor || this.selectionLead, k = this.selectionLead;
      return c.row > k.row || c.row == k.row && c.column > k.column
    };
    this.getRange = function() {
      var c = this.selectionAnchor || this.selectionLead, k = this.selectionLead;
      return this.isBackwards() ? j.fromPoints(k, c) : j.fromPoints(c, k)
    };
    this.clearSelection = function() {
      if(this.selectionAnchor) {
        this.selectionAnchor = null;
        this.$dispatchEvent("changeSelection", {})
      }
    };
    this.selectAll = function() {
      var c = this.doc.getLength() - 1;
      this.setSelectionAnchor(c, this.doc.getLine(c).length);
      this.$moveSelection(function() {
        this.moveCursorTo(0, 0)
      })
    };
    this.setSelectionRange = function(c, k) {
      if(k) {
        this.setSelectionAnchor(c.end.row, c.end.column);
        this.selectTo(c.start.row, c.start.column)
      }else {
        this.setSelectionAnchor(c.start.row, c.start.column);
        this.selectTo(c.end.row, c.end.column)
      }
    };
    this.$moveSelection = function(c) {
      var k = false;
      if(!this.selectionAnchor) {
        k = true;
        this.selectionAnchor = this.$clone(this.selectionLead)
      }var a = this.$clone(this.selectionLead);
      c.call(this);
      if(a.row !== this.selectionLead.row || a.column !== this.selectionLead.column) {
        k = true
      }k && this.$dispatchEvent("changeSelection", {})
    };
    this.selectTo = function(c, k) {
      this.$moveSelection(function() {
        this.moveCursorTo(c, k)
      })
    };
    this.selectToPosition = function(c) {
      this.$moveSelection(function() {
        this.moveCursorToPosition(c)
      })
    };
    this.selectUp = function() {
      this.$moveSelection(this.moveCursorUp)
    };
    this.selectDown = function() {
      this.$moveSelection(this.moveCursorDown)
    };
    this.selectRight = function() {
      this.$moveSelection(this.moveCursorRight)
    };
    this.selectLeft = function() {
      this.$moveSelection(this.moveCursorLeft)
    };
    this.selectLineStart = function() {
      this.$moveSelection(this.moveCursorLineStart)
    };
    this.selectLineEnd = function() {
      this.$moveSelection(this.moveCursorLineEnd)
    };
    this.selectFileEnd = function() {
      this.$moveSelection(this.moveCursorFileEnd)
    };
    this.selectFileStart = function() {
      this.$moveSelection(this.moveCursorFileStart)
    };
    this.selectWordRight = function() {
      this.$moveSelection(this.moveCursorWordRight)
    };
    this.selectWordLeft = function() {
      this.$moveSelection(this.moveCursorWordLeft)
    };
    this.selectWord = function() {
      var c = this.selectionLead;
      this.setSelectionRange(this.doc.getWordRange(c.row, c.column))
    };
    this.selectLine = function() {
      this.setSelectionAnchor(this.selectionLead.row, 0);
      this.$moveSelection(function() {
        this.moveCursorTo(this.selectionLead.row + 1, 0)
      })
    };
    this.moveCursorUp = function() {
      this.moveCursorBy(-1, 0)
    };
    this.moveCursorDown = function() {
      this.moveCursorBy(1, 0)
    };
    this.moveCursorLeft = function() {
      if(this.selectionLead.column == 0) {
        this.selectionLead.row > 0 && this.moveCursorTo(this.selectionLead.row - 1, this.doc.getLine(this.selectionLead.row - 1).length)
      }else {
        this.moveCursorBy(0, -1)
      }
    };
    this.moveCursorRight = function() {
      if(this.selectionLead.column == this.doc.getLine(this.selectionLead.row).length) {
        this.selectionLead.row < this.doc.getLength() - 1 && this.moveCursorTo(this.selectionLead.row + 1, 0)
      }else {
        this.moveCursorBy(0, 1)
      }
    };
    this.moveCursorLineStart = function() {
      var c = this.selectionLead.row, k = this.selectionLead.column, a = this.doc.getLine(c).slice(0, k).match(/^\s*/);
      if(a[0].length == 0) {
        this.moveCursorTo(c, this.doc.getLine(c).match(/^\s*/)[0].length)
      }else {
        a[0].length >= k ? this.moveCursorTo(c, 0) : this.moveCursorTo(c, a[0].length)
      }
    };
    this.moveCursorLineEnd = function() {
      this.moveCursorTo(this.selectionLead.row, this.doc.getLine(this.selectionLead.row).length)
    };
    this.moveCursorFileEnd = function() {
      var c = this.doc.getLength() - 1, k = this.doc.getLine(c).length;
      this.moveCursorTo(c, k)
    };
    this.moveCursorFileStart = function() {
      this.moveCursorTo(0, 0)
    };
    this.moveCursorWordRight = function() {
      var c = this.selectionLead.row, k = this.selectionLead.column, a = this.doc.getLine(c), f = a.substring(k);
      this.doc.nonTokenRe.lastIndex = 0;
      this.doc.tokenRe.lastIndex = 0;
      if(k == a.length) {
        this.moveCursorRight()
      }else {
        if(this.doc.nonTokenRe.exec(f)) {
          k += this.doc.nonTokenRe.lastIndex;
          this.doc.nonTokenRe.lastIndex = 0
        }else {
          if(this.doc.tokenRe.exec(f)) {
            k += this.doc.tokenRe.lastIndex;
            this.doc.tokenRe.lastIndex = 0
          }
        }this.moveCursorTo(c, k)
      }
    };
    this.moveCursorWordLeft = function() {
      var c = this.selectionLead.row, k = this.selectionLead.column, a = this.doc.getLine(c);
      a = e.stringReverse(a.substring(0, k));
      this.doc.nonTokenRe.lastIndex = 0;
      this.doc.tokenRe.lastIndex = 0;
      if(k == 0) {
        this.moveCursorLeft()
      }else {
        if(this.doc.nonTokenRe.exec(a)) {
          k -= this.doc.nonTokenRe.lastIndex;
          this.doc.nonTokenRe.lastIndex = 0
        }else {
          if(this.doc.tokenRe.exec(a)) {
            k -= this.doc.tokenRe.lastIndex;
            this.doc.tokenRe.lastIndex = 0
          }
        }this.moveCursorTo(c, k)
      }
    };
    this.moveCursorBy = function(c, k) {
      this.moveCursorTo(this.selectionLead.row + c, this.selectionLead.column + k)
    };
    this.moveCursorToPosition = function(c) {
      this.moveCursorTo(c.row, c.column)
    };
    this.moveCursorTo = function(c, k) {
      c = this.$clipPositionToDocument(c, k);
      if(c.row !== this.selectionLead.row || c.column !== this.selectionLead.column) {
        this.selectionLead = c;
        this.$dispatchEvent("changeCursor", {data:this.getCursor()})
      }
    };
    this.moveCursorUp = function() {
      this.moveCursorBy(-1, 0)
    };
    this.$clipPositionToDocument = function(c, k) {
      var a = {};
      if(c >= this.doc.getLength()) {
        a.row = Math.max(0, this.doc.getLength() - 1);
        a.column = this.doc.getLine(a.row).length
      }else {
        if(c < 0) {
          a.row = 0;
          a.column = 0
        }else {
          a.row = c;
          a.column = Math.min(this.doc.getLine(a.row).length, Math.max(0, k))
        }
      }return a
    };
    this.$clone = function(c) {
      return{row:c.row, column:c.column}
    }
  }).call(i.prototype);
  return i
});
define("ace/tokenizer", ["require", "exports", "module"], function() {
  var i = function(h) {
    this.rules = h;
    this.regExps = {};
    for(var e in this.rules) {
      h = this.rules[e];
      for(var d = [], j = 0;j < h.length;j++) {
        d.push(h[j].regex)
      }this.regExps[e] = new RegExp("(?:(" + d.join(")|(") + ")|(.))", "g")
    }
  };
  (function() {
    this.getLineTokens = function(h, e) {
      e = e;
      var d = this.rules[e], j = this.regExps[e];
      j.lastIndex = 0;
      for(var c, k = [], a = 0, f = {type:null, value:""};c = j.exec(h);) {
        var n = "text", p = c[0];
        if(j.lastIndex == a) {
          throw new Error("tokenizer error");
        }a = j.lastIndex;
        window.LOG && console.log(e, c);
        for(var b = 0;b < d.length;b++) {
          if(c[b + 1]) {
            n = typeof d[b].token == "function" ? d[b].token(c[0]) : d[b].token;
            if(d[b].next && d[b].next !== e) {
              e = d[b].next;
              d = this.rules[e];
              a = j.lastIndex;
              j = this.regExps[e];
              j.lastIndex = a
            }break
          }
        }if(f.type !== n) {
          f.type && k.push(f);
          f = {type:n, value:p}
        }else {
          f.value += p
        }
      }f.type && k.push(f);
      window.LOG && console.log(k, e);
      return{tokens:k, state:e}
    }
  }).call(i.prototype);
  return i
});
define("ace/mode/text_highlight_rules", ["require", "exports", "module"], function() {
  var i = function() {
    this.$rules = {start:[{token:"text", regex:".+"}]}
  };
  (function() {
    this.addRules = function(h, e) {
      for(var d in h) {
        for(var j = h[d], c = 0;c < j.length;c++) {
          var k = j[c];
          k.next = k.next ? e + k.next : e + d
        }this.$rules[e + d] = j
      }
    };
    this.getRules = function() {
      return this.$rules
    }
  }).call(i.prototype);
  return i
});
define("ace/mode/text", ["require", "exports", "module", "../tokenizer", "./text_highlight_rules"], function(i) {
  var h = i("../tokenizer"), e = i("./text_highlight_rules");
  i = function() {
    this.$tokenizer = new h((new e).getRules())
  };
  (function() {
    this.getTokenizer = function() {
      return this.$tokenizer
    };
    this.toggleCommentLines = function() {
      return 0
    };
    this.getNextLineIndent = function() {
      return""
    };
    this.checkOutdent = function() {
      return false
    };
    this.autoOutdent = function() {
    };
    this.$getIndent = function(d) {
      if(d = d.match(/^(\s+)/)) {
        return d[1]
      }return""
    }
  }).call(i.prototype);
  return i
});
define("ace/document", ["require", "exports", "module", "./lib/oop", "./lib/lang", "./event_emitter", "./selection", "./mode/text", "./range"], function(i) {
  var h = i("./lib/oop"), e = i("./lib/lang"), d = i("./event_emitter"), j = i("./selection"), c = i("./mode/text"), k = i("./range");
  i = function(a, f) {
    this.modified = true;
    this.lines = [];
    this.selection = new j(this);
    this.$breakpoints = [];
    this.listeners = [];
    f && this.setMode(f);
    e.isArray(a) ? this.$insertLines(0, a) : this.$insert({row:0, column:0}, a)
  };
  (function() {
    h.implement(this, d);
    this.$undoManager = null;
    this.$split = function(a) {
      return a.split(/\r\n|\r|\n/)
    };
    this.setValue = function(a) {
      var f = [0, this.lines.length];
      f.push.apply(f, this.$split(a));
      this.lines.splice.apply(this.lines, f);
      this.modified = true;
      this.fireChangeEvent(0)
    };
    this.toString = function() {
      return this.lines.join(this.$getNewLineCharacter())
    };
    this.getSelection = function() {
      return this.selection
    };
    this.fireChangeEvent = function(a, f) {
      this.$dispatchEvent("change", {data:{firstRow:a, lastRow:f}})
    };
    this.setUndoManager = function(a) {
      this.$undoManager = a;
      this.$deltas = [];
      this.$informUndoManager && this.$informUndoManager.cancel();
      if(a) {
        var f = this;
        this.$informUndoManager = e.deferredCall(function() {
          f.$deltas.length > 0 && a.execute({action:"aceupdate", args:[f.$deltas, f]});
          f.$deltas = []
        })
      }
    };
    this.$defaultUndoManager = {undo:function() {
    }, redo:function() {
    }};
    this.getUndoManager = function() {
      return this.$undoManager || this.$defaultUndoManager
    };
    this.getTabString = function() {
      return this.getUseSoftTabs() ? e.stringRepeat(" ", this.getTabSize()) : "\t"
    };
    this.$useSoftTabs = true;
    this.setUseSoftTabs = function(a) {
      if(this.$useSoftTabs !== a) {
        this.$useSoftTabs = a
      }
    };
    this.getUseSoftTabs = function() {
      return this.$useSoftTabs
    };
    this.$tabSize = 4;
    this.setTabSize = function(a) {
      if(!(isNaN(a) || this.$tabSize === a)) {
        this.modified = true;
        this.$tabSize = a;
        this.$dispatchEvent("changeTabSize")
      }
    };
    this.getTabSize = function() {
      return this.$tabSize
    };
    this.getBreakpoints = function() {
      return this.$breakpoints
    };
    this.setBreakpoints = function(a) {
      this.$breakpoints = [];
      for(var f = 0;f < a.length;f++) {
        this.$breakpoints[a[f]] = true
      }this.$dispatchEvent("changeBreakpoint", {})
    };
    this.clearBreakpoints = function() {
      this.$breakpoints = [];
      this.$dispatchEvent("changeBreakpoint", {})
    };
    this.setBreakpoint = function(a) {
      this.$breakpoints[a] = true;
      this.$dispatchEvent("changeBreakpoint", {})
    };
    this.clearBreakpoint = function(a) {
      delete this.$breakpoints[a];
      this.$dispatchEvent("changeBreakpoint", {})
    };
    this.$detectNewLine = function(a) {
      this.$autoNewLine = (a = a.match(/^.*?(\r?\n)/m)) ? a[1] : "\n"
    };
    this.tokenRe = /^[\w\d]+/g;
    this.nonTokenRe = /^[^\w\d]+/g;
    this.getWordRange = function(a, f) {
      var n = this.getLine(a), p = false;
      if(f > 0) {
        p = !!n.charAt(f - 1).match(this.tokenRe)
      }p || (p = !!n.charAt(f).match(this.tokenRe));
      p = p ? this.tokenRe : this.nonTokenRe;
      var b = f;
      if(b > 0) {
        do {
          b--
        }while(b >= 0 && n.charAt(b).match(p));
        b++
      }for(f = f;f < n.length && n.charAt(f).match(p);) {
        f++
      }return new k(a, b, a, f)
    };
    this.$getNewLineCharacter = function() {
      switch(this.$newLineMode) {
        case "windows":
          return"\r\n";
        case "unix":
          return"\n";
        case "auto":
          return this.$autoNewLine
      }
    };
    this.$autoNewLine = "\n";
    this.$newLineMode = "auto";
    this.setNewLineMode = function(a) {
      if(this.$newLineMode !== a) {
        this.$newLineMode = a
      }
    };
    this.getNewLineMode = function() {
      return this.$newLineMode
    };
    this.$mode = null;
    this.setMode = function(a) {
      if(this.$mode !== a) {
        this.$mode = a;
        this.$dispatchEvent("changeMode")
      }
    };
    this.getMode = function() {
      if(!this.$mode) {
        this.$mode = new c
      }return this.$mode
    };
    this.$scrollTop = 0;
    this.setScrollTopRow = function(a) {
      if(this.$scrollTop !== a) {
        this.$scrollTop = a;
        this.$dispatchEvent("changeScrollTop")
      }
    };
    this.getScrollTopRow = function() {
      return this.$scrollTop
    };
    this.getWidth = function() {
      this.$computeWidth();
      return this.width
    };
    this.getScreenWidth = function() {
      this.$computeWidth();
      return this.screenWith
    };
    this.$computeWidth = function() {
      if(this.modified) {
        this.modified = false;
        for(var a = this.lines, f = 0, n = 0, p = this.getTabSize(), b = 0;b < a.length;b++) {
          var g = a[b].length;
          f = Math.max(f, g);
          a[b].replace("\t", function(v) {
            g += p - 1;
            return v
          });
          n = Math.max(n, g)
        }this.width = f;
        this.screenWith = n
      }
    };
    this.getLine = function(a) {
      return this.lines[a] || ""
    };
    this.getDisplayLine = function(a) {
      var f = (new Array(this.getTabSize() + 1)).join(" ");
      return this.lines[a].replace(/\t/g, f)
    };
    this.getLines = function(a, f) {
      return this.lines.slice(a, f + 1)
    };
    this.getLength = function() {
      return this.lines.length
    };
    this.getTextRange = function(a) {
      if(a.start.row == a.end.row) {
        return this.lines[a.start.row].substring(a.start.column, a.end.column)
      }else {
        var f = [];
        f.push(this.lines[a.start.row].substring(a.start.column));
        f.push.apply(f, this.getLines(a.start.row + 1, a.end.row - 1));
        f.push(this.lines[a.end.row].substring(0, a.end.column));
        return f.join(this.$getNewLineCharacter())
      }
    };
    this.findMatchingBracket = function(a) {
      if(a.column == 0) {
        return null
      }var f = this.getLine(a.row).charAt(a.column - 1);
      if(f == "") {
        return null
      }f = f.match(/([\(\[\{])|([\)\]\}])/);
      if(!f) {
        return null
      }return f[1] ? this.$findClosingBracket(f[1], a) : this.$findOpeningBracket(f[2], a)
    };
    this.$brackets = {")":"(", "(":")", "]":"[", "[":"]", "{":"}", "}":"{"};
    this.$findOpeningBracket = function(a, f) {
      var n = this.$brackets[a], p = f.column - 2;
      f = f.row;
      for(var b = 1, g = this.getLine(f);;) {
        for(;p >= 0;) {
          var v = g.charAt(p);
          if(v == n) {
            b -= 1;
            if(b == 0) {
              return{row:f, column:p}
            }
          }else {
            if(v == a) {
              b += 1
            }
          }p -= 1
        }f -= 1;
        if(f < 0) {
          break
        }g = this.getLine(f);
        p = g.length - 1
      }return null
    };
    this.$findClosingBracket = function(a, f) {
      var n = this.$brackets[a], p = f.column;
      f = f.row;
      for(var b = 1, g = this.getLine(f), v = this.getLength();;) {
        for(;p < g.length;) {
          var t = g.charAt(p);
          if(t == n) {
            b -= 1;
            if(b == 0) {
              return{row:f, column:p}
            }
          }else {
            if(t == a) {
              b += 1
            }
          }p += 1
        }f += 1;
        if(f >= v) {
          break
        }g = this.getLine(f);
        p = 0
      }return null
    };
    this.insert = function(a, f, n) {
      f = this.$insert(a, f, n);
      this.fireChangeEvent(a.row, a.row == f.row ? a.row : undefined);
      return f
    };
    this.$insertLines = function(a, f, n) {
      if(f.length != 0) {
        var p = [a, 0];
        p.push.apply(p, f);
        this.lines.splice.apply(this.lines, p);
        if(!n && this.$undoManager) {
          n = this.$getNewLineCharacter();
          this.$deltas.push({action:"insertText", range:new k(a, 0, a + f.length, 0), text:f.join(n) + n});
          this.$informUndoManager.schedule()
        }
      }
    };
    this.$insert = function(a, f, n) {
      if(f.length == 0) {
        return a
      }this.modified = true;
      this.lines.length <= 1 && this.$detectNewLine(f);
      var p = this.$split(f);
      if(this.$isNewLine(f)) {
        var b = this.lines[a.row] || "";
        this.lines[a.row] = b.substring(0, a.column);
        this.lines.splice(a.row + 1, 0, b.substring(a.column));
        p = {row:a.row + 1, column:0}
      }else {
        if(p.length == 1) {
          b = this.lines[a.row] || "";
          this.lines[a.row] = b.substring(0, a.column) + f + b.substring(a.column);
          p = {row:a.row, column:a.column + f.length}
        }else {
          b = this.lines[a.row] || "";
          var g = b.substring(0, a.column) + p[0];
          b = p[p.length - 1] + b.substring(a.column);
          this.lines[a.row] = g;
          this.$insertLines(a.row + 1, [b], true);
          p.length > 2 && this.$insertLines(a.row + 1, p.slice(1, -1), true);
          p = {row:a.row + p.length - 1, column:p[p.length - 1].length}
        }
      }if(!n && this.$undoManager) {
        this.$deltas.push({action:"insertText", range:k.fromPoints(a, p), text:f});
        this.$informUndoManager.schedule()
      }return p
    };
    this.$isNewLine = function(a) {
      return a == "\r\n" || a == "\r" || a == "\n"
    };
    this.remove = function(a, f) {
      if(a.isEmpty()) {
        return a.start
      }this.$remove(a, f);
      this.fireChangeEvent(a.start.row, a.isMultiLine() ? undefined : a.start.row);
      return a.start
    };
    this.$remove = function(a, f) {
      if(!a.isEmpty()) {
        if(!f && this.$undoManager) {
          this.$getNewLineCharacter();
          this.$deltas.push({action:"removeText", range:a.clone(), text:this.getTextRange(a)});
          this.$informUndoManager.schedule()
        }this.modified = true;
        f = a.start.row;
        var n = a.end.row, p = this.getLine(f).substring(0, a.start.column) + this.getLine(n).substring(a.end.column);
        this.lines.splice(f, n - f + 1, p);
        return a.start
      }
    };
    this.undoChanges = function(a) {
      this.selection.clearSelection();
      for(var f = a.length - 1;f >= 0;f--) {
        var n = a[f];
        if(n.action == "insertText") {
          this.remove(n.range, true);
          this.selection.moveCursorToPosition(n.range.start)
        }else {
          this.insert(n.range.start, n.text, true);
          this.selection.clearSelection()
        }
      }
    };
    this.redoChanges = function(a) {
      this.selection.clearSelection();
      for(var f = 0;f < a.length;f++) {
        var n = a[f];
        if(n.action == "insertText") {
          this.insert(n.range.start, n.text, true);
          this.selection.setSelectionRange(n.range)
        }else {
          this.remove(n.range, true);
          this.selection.moveCursorToPosition(n.range.start)
        }
      }
    };
    this.replace = function(a, f) {
      this.$remove(a);
      f = f ? this.$insert(a.start, f) : a.start;
      var n = a.end.column == 0 ? a.end.column - 1 : a.end.column;
      this.fireChangeEvent(a.start.row, n == f.row ? n : undefined);
      return f
    };
    this.indentRows = function(a, f) {
      f.replace("\t", this.getTabString());
      for(var n = a.start.row;n <= a.end.row;n++) {
        this.$insert({row:n, column:0}, f)
      }this.fireChangeEvent(a.start.row, a.end.row);
      return f.length
    };
    this.outdentRows = function(a) {
      for(var f = new k(0, 0, 0, 0), n = this.getTabSize(), p = a.start.row;p <= a.end.row;++p) {
        var b = this.getLine(p);
        f.start.row = p;
        f.end.row = p;
        for(var g = 0;g < n;++g) {
          if(b.charAt(g) != " ") {
            break
          }
        }if(g < n && b.charAt(g) == "\t") {
          f.start.column = g;
          f.end.column = g + 1
        }else {
          f.start.column = 0;
          f.end.column = g
        }if(p == a.start.row) {
          a.start.column -= f.end.column - f.start.column
        }if(p == a.end.row) {
          a.end.column -= f.end.column - f.start.column
        }this.$remove(f)
      }this.fireChangeEvent(a.start.row, a.end.row);
      return a
    };
    this.moveLinesUp = function(a, f) {
      if(a <= 0) {
        return 0
      }var n = this.lines.slice(a, f + 1);
      this.$remove(new k(a, 0, f + 1, 0));
      this.$insertLines(a - 1, n);
      this.fireChangeEvent(a - 1, f);
      return-1
    };
    this.moveLinesDown = function(a, f) {
      if(f >= this.lines.length - 1) {
        return 0
      }var n = this.lines.slice(a, f + 1);
      this.$remove(new k(a, 0, f + 1, 0));
      this.$insertLines(a + 1, n);
      this.fireChangeEvent(a, f + 1);
      return 1
    };
    this.duplicateLines = function(a, f) {
      a = this.$clipRowToDocument(a);
      f = this.$clipRowToDocument(f);
      var n = this.getLines(a, f);
      this.$insertLines(a, n);
      f = f - a + 1;
      this.fireChangeEvent(a);
      return f
    };
    this.$clipRowToDocument = function(a) {
      return Math.max(0, Math.min(a, this.lines.length - 1))
    };
    this.documentToScreenColumn = function(a, f) {
      var n = this.getTabSize(), p = 0;
      f = f;
      a = this.getLine(a).split("\t");
      for(var b = 0;b < a.length;b++) {
        var g = a[b].length;
        if(f > g) {
          f -= g + 1;
          p += g + n
        }else {
          p += f;
          break
        }
      }return p
    };
    this.screenToDocumentColumn = function(a, f) {
      var n = this.getTabSize(), p = 0;
      f = f;
      a = this.getLine(a).split("\t");
      for(var b = 0;b < a.length;b++) {
        var g = a[b].length;
        if(f >= g + n) {
          f -= g + n;
          p += g + 1
        }else {
          p += f > g ? g : f;
          break
        }
      }return p
    }
  }).call(i.prototype);
  return i
});
define("ace/search", ["require", "exports", "module", "./lib/lang", "./lib/oop", "./range"], function(i) {
  var h = i("./lib/lang"), e = i("./lib/oop"), d = i("./range"), j = function() {
    this.$options = {needle:"", backwards:false, wrap:false, caseSensitive:false, wholeWord:false, scope:j.ALL, regExp:false}
  };
  j.ALL = 1;
  j.SELECTION = 2;
  (function() {
    this.set = function(c) {
      e.mixin(this.$options, c);
      return this
    };
    this.getOptions = function() {
      return h.copyObject(this.$options)
    };
    this.find = function(c) {
      if(!this.$options.needle) {
        return null
      }var k = null;
      (this.$options.backwards ? this.$backwardMatchIterator(c) : this.$forwardMatchIterator(c)).forEach(function(a) {
        k = a;
        return true
      });
      return k
    };
    this.findAll = function(c) {
      if(!this.$options.needle) {
        return[]
      }var k = [];
      (this.$options.backwards ? this.$backwardMatchIterator(c) : this.$forwardMatchIterator(c)).forEach(function(a) {
        k.push(a)
      });
      return k
    };
    this.replace = function(c, k) {
      var a = this.$assembleRegExp(), f = a.exec(c);
      return f && f[0].length == c.length ? this.$options.regExp ? c.replace(a, k) : k : null
    };
    this.$forwardMatchIterator = function(c) {
      var k = this.$assembleRegExp(), a = this;
      return{forEach:function(f) {
        a.$forwardLineIterator(c).forEach(function(n, p, b) {
          if(p) {
            n = n.substring(p)
          }var g = [];
          n.replace(k, function(t) {
            g.push({str:t, offset:p + arguments[arguments.length - 2]});
            return t
          });
          for(n = 0;n < g.length;n++) {
            var v = g[n];
            v = a.$rangeFromMatch(b, v.offset, v.str.length);
            if(f(v)) {
              return true
            }
          }
        })
      }}
    };
    this.$backwardMatchIterator = function(c) {
      var k = this.$assembleRegExp(), a = this;
      return{forEach:function(f) {
        a.$backwardLineIterator(c).forEach(function(n, p, b) {
          if(p) {
            n = n.substring(p)
          }var g = [];
          n.replace(k, function(t, o) {
            g.push({str:t, offset:p + o});
            return t
          });
          for(n = g.length - 1;n >= 0;n--) {
            var v = g[n];
            v = a.$rangeFromMatch(b, v.offset, v.str.length);
            if(f(v)) {
              return true
            }
          }
        })
      }}
    };
    this.$rangeFromMatch = function(c, k, a) {
      return new d(c, k, c, k + a)
    };
    this.$assembleRegExp = function() {
      var c = this.$options.regExp ? this.$options.needle : h.escapeRegExp(this.$options.needle);
      if(this.$options.wholeWord) {
        c = "\\b" + c + "\\b"
      }var k = "g";
      this.$options.caseSensitive || (k += "i");
      return new RegExp(c, k)
    };
    this.$forwardLineIterator = function(c) {
      function k(t) {
        var o = c.getLine(t);
        if(a && t == f.end.row) {
          o = o.substring(0, f.end.column)
        }return o
      }
      var a = this.$options.scope == j.SELECTION, f = c.getSelection().getRange(), n = c.getSelection().getCursor(), p = a ? f.start.row : 0, b = a ? f.start.column : 0, g = a ? f.end.row : c.getLength() - 1, v = this.$options.wrap;
      return{forEach:function(t) {
        for(var o = n.row, w = k(o), x = n.column, B = false;!t(w, x, o);) {
          if(B) {
            return
          }o++;
          x = 0;
          if(o > g) {
            if(v) {
              o = p;
              x = b
            }else {
              return
            }
          }if(o == n.row) {
            B = true
          }w = k(o)
        }
      }}
    };
    this.$backwardLineIterator = function(c) {
      var k = this.$options.scope == j.SELECTION, a = c.getSelection().getRange(), f = k ? a.end : a.start, n = k ? a.start.row : 0, p = k ? a.start.column : 0, b = k ? a.end.row : c.getLength() - 1, g = this.$options.wrap;
      return{forEach:function(v) {
        for(var t = f.row, o = c.getLine(t).substring(0, f.column), w = 0, x = false;!v(o, w, t);) {
          if(x) {
            return
          }t--;
          w = 0;
          if(t < n) {
            if(g) {
              t = b
            }else {
              return
            }
          }if(t == f.row) {
            x = true
          }o = c.getLine(t);
          if(k) {
            if(t == n) {
              w = p
            }else {
              if(t == b) {
                o = o.substring(0, a.end.column)
              }
            }
          }
        }
      }}
    }
  }).call(j.prototype);
  return j
});
define("ace/background_tokenizer", ["require", "exports", "module", "./lib/oop", "./event_emitter"], function(i) {
  var h = i("./lib/oop"), e = i("./event_emitter");
  i = function(d, j) {
    this.running = false;
    this.textLines = [];
    this.lines = [];
    this.currentLine = 0;
    this.tokenizer = d;
    var c = this;
    this.$worker = function() {
      if(c.running) {
        for(var k = new Date, a = c.currentLine, f = c.textLines, n = 0, p = j.getLastVisibleRow();c.currentLine < f.length;) {
          c.lines[c.currentLine] = c.$tokenizeRows(c.currentLine, c.currentLine)[0];
          c.currentLine++;
          n += 1;
          if(n % 5 == 0 && new Date - k > 20) {
            c.fireUpdateEvent(a, c.currentLine - 1);
            c.running = setTimeout(c.$worker, c.currentLine < p ? 20 : 100);
            return
          }
        }c.running = false;
        c.fireUpdateEvent(a, f.length - 1)
      }
    }
  };
  (function() {
    h.implement(this, e);
    this.setTokenizer = function(d) {
      this.tokenizer = d;
      this.lines = [];
      this.start(0)
    };
    this.setLines = function(d) {
      this.textLines = d;
      this.lines = [];
      this.stop()
    };
    this.fireUpdateEvent = function(d, j) {
      this.$dispatchEvent("update", {data:{first:d, last:j}})
    };
    this.start = function(d) {
      this.currentLine = Math.min(d || 0, this.currentLine, this.textLines.length);
      this.lines.splice(this.currentLine, this.lines.length);
      this.stop();
      this.running = setTimeout(this.$worker, 700)
    };
    this.stop = function() {
      this.running && clearTimeout(this.running);
      this.running = false
    };
    this.getTokens = function(d, j, c) {
      c(this.$tokenizeRows(d, j))
    };
    this.getState = function(d, j) {
      j(this.$tokenizeRows(d, d)[0].state)
    };
    this.$tokenizeRows = function(d, j) {
      var c = [], k = "start", a = false;
      if(d > 0 && this.lines[d - 1]) {
        k = this.lines[d - 1].state;
        a = true
      }for(d = d;d <= j;d++) {
        if(this.lines[d]) {
          f = this.lines[d];
          k = f.state;
          c.push(f)
        }else {
          var f = this.tokenizer.getLineTokens(this.textLines[d] || "", k);
          k = f.state;
          c.push(f);
          if(a) {
            this.lines[d] = f
          }
        }
      }return c
    }
  }).call(i.prototype);
  return i
});
define("ace/editor", ["require", "exports", "module", "./lib/oop", "./lib/event", "./lib/lang", "./textinput", "./keybinding", "./document", "./search", "./background_tokenizer", "./range", "./event_emitter"], function(i) {
  var h = i("./lib/oop"), e = i("./lib/event"), d = i("./lib/lang"), j = i("./textinput"), c = i("./keybinding"), k = i("./document"), a = i("./search"), f = i("./background_tokenizer"), n = i("./range"), p = i("./event_emitter");
  i = function(b, g) {
    var v = b.getContainerElement();
    this.container = v;
    this.renderer = b;
    this.textInput = new j(v, this);
    this.keyBinding = new c(v, this);
    var t = this;
    e.addListener(v, "mousedown", function(o) {
      setTimeout(function() {
        t.focus()
      });
      return e.preventDefault(o)
    });
    e.addListener(v, "selectstart", function(o) {
      return e.preventDefault(o)
    });
    b = b.getMouseEventTarget();
    e.addListener(b, "mousedown", d.bind(this.onMouseDown, this));
    e.addMultiMouseDownListener(b, 0, 2, 500, d.bind(this.onMouseDoubleClick, this));
    e.addMultiMouseDownListener(b, 0, 3, 600, d.bind(this.onMouseTripleClick, this));
    e.addMouseWheelListener(b, d.bind(this.onMouseWheel, this));
    this.$highlightLineMarker = this.$selectionMarker = null;
    this.$blockScrolling = false;
    this.$search = (new a).set({wrap:true});
    this.setDocument(g || new k(""));
    this.focus()
  };
  (function() {
    h.implement(this, p);
    this.$forwardEvents = {gutterclick:1, gutterdblclick:1};
    this.$originalAddEventListener = this.addEventListener;
    this.$originalRemoveEventListener = this.removeEventListener;
    this.addEventListener = function(b, g) {
      return this.$forwardEvents[b] ? this.renderer.addEventListener(b, g) : this.$originalAddEventListener(b, g)
    };
    this.removeEventListener = function(b, g) {
      return this.$forwardEvents[b] ? this.renderer.removeEventListener(b, g) : this.$originalRemoveEventListener(b, g)
    };
    this.setDocument = function(b) {
      if(this.doc != b) {
        if(this.doc) {
          this.doc.removeEventListener("change", this.$onDocumentChange);
          this.doc.removeEventListener("changeMode", this.$onDocumentModeChange);
          this.doc.removeEventListener("changeTabSize", this.$onDocumentChangeTabSize);
          this.doc.removeEventListener("changeBreakpoint", this.$onDocumentChangeBreakpoint);
          var g = this.doc.getSelection();
          g.removeEventListener("changeCursor", this.$onCursorChange);
          g.removeEventListener("changeSelection", this.$onSelectionChange);
          this.doc.setScrollTopRow(this.renderer.getScrollTopRow())
        }this.doc = b;
        this.$onDocumentChange = d.bind(this.onDocumentChange, this);
        b.addEventListener("change", this.$onDocumentChange);
        this.renderer.setDocument(b);
        this.$onDocumentModeChange = d.bind(this.onDocumentModeChange, this);
        b.addEventListener("changeMode", this.$onDocumentModeChange);
        this.$onDocumentChangeTabSize = d.bind(this.renderer.updateText, this.renderer);
        b.addEventListener("changeTabSize", this.$onDocumentChangeTabSize);
        this.$onDocumentChangeBreakpoint = d.bind(this.onDocumentChangeBreakpoint, this);
        this.doc.addEventListener("changeBreakpoint", this.$onDocumentChangeBreakpoint);
        this.selection = b.getSelection();
        this.$desiredColumn = 0;
        this.$onCursorChange = d.bind(this.onCursorChange, this);
        this.selection.addEventListener("changeCursor", this.$onCursorChange);
        this.$onSelectionChange = d.bind(this.onSelectionChange, this);
        this.selection.addEventListener("changeSelection", this.$onSelectionChange);
        this.onDocumentModeChange();
        this.bgTokenizer.setLines(this.doc.lines);
        this.bgTokenizer.start(0);
        this.onCursorChange();
        this.onSelectionChange();
        this.onDocumentChangeBreakpoint();
        this.renderer.scrollToRow(b.getScrollTopRow());
        this.renderer.updateFull()
      }
    };
    this.getDocument = function() {
      return this.doc
    };
    this.getSelection = function() {
      return this.selection
    };
    this.resize = function() {
      this.renderer.onResize()
    };
    this.setTheme = function(b) {
      this.renderer.setTheme(b)
    };
    this.$highlightBrackets = function() {
      if(this.$bracketHighlight) {
        this.renderer.removeMarker(this.$bracketHighlight);
        this.$bracketHighlight = null
      }if(!this.$highlightPending) {
        var b = this;
        this.$highlightPending = true;
        setTimeout(function() {
          b.$highlightPending = false;
          var g = b.doc.findMatchingBracket(b.getCursorPosition());
          if(g) {
            g = new n(g.row, g.column, g.row, g.column + 1);
            b.$bracketHighlight = b.renderer.addMarker(g, "ace_bracket")
          }
        }, 10)
      }
    };
    this.focus = function() {
      this.textInput.focus()
    };
    this.blur = function() {
      this.textInput.blur()
    };
    this.onFocus = function() {
      this.renderer.showCursor();
      this.renderer.visualizeFocus()
    };
    this.onBlur = function() {
      this.renderer.hideCursor();
      this.renderer.visualizeBlur()
    };
    this.onDocumentChange = function(b) {
      b = b.data;
      this.bgTokenizer.start(b.firstRow);
      this.renderer.updateLines(b.firstRow, b.lastRow);
      this.renderer.updateCursor(this.getCursorPosition(), this.$overwrite)
    };
    this.onTokenizerUpdate = function(b) {
      b = b.data;
      this.renderer.updateLines(b.first, b.last)
    };
    this.onCursorChange = function() {
      this.$highlightBrackets();
      this.renderer.updateCursor(this.getCursorPosition(), this.$overwrite);
      this.$blockScrolling || this.renderer.scrollCursorIntoView();
      this.$updateHighlightActiveLine()
    };
    this.$updateHighlightActiveLine = function() {
      this.$highlightLineMarker && this.renderer.removeMarker(this.$highlightLineMarker);
      this.$highlightLineMarker = null;
      if(this.getHighlightActiveLine() && (this.getSelectionStyle() != "line" || !this.selection.isMultiLine())) {
        var b = this.getCursorPosition();
        this.$highlightLineMarker = this.renderer.addMarker(new n(b.row, 0, b.row + 1, 0), "ace_active_line", "line")
      }
    };
    this.onSelectionChange = function() {
      this.$selectionMarker && this.renderer.removeMarker(this.$selectionMarker);
      this.$selectionMarker = null;
      if(!this.selection.isEmpty()) {
        var b = this.selection.getRange(), g = this.getSelectionStyle();
        this.$selectionMarker = this.renderer.addMarker(b, "ace_selection", g)
      }this.onCursorChange()
    };
    this.onDocumentChangeBreakpoint = function() {
      this.renderer.setBreakpoints(this.doc.getBreakpoints())
    };
    this.onDocumentModeChange = function() {
      var b = this.doc.getMode();
      if(this.mode != b) {
        this.mode = b;
        b = b.getTokenizer();
        if(this.bgTokenizer) {
          this.bgTokenizer.setTokenizer(b)
        }else {
          var g = d.bind(this.onTokenizerUpdate, this);
          this.bgTokenizer = new f(b, this);
          this.bgTokenizer.addEventListener("update", g)
        }this.renderer.setTokenizer(this.bgTokenizer)
      }
    };
    this.onMouseDown = function(b) {
      var g = e.getDocumentX(b), v = e.getDocumentY(b);
      g = this.renderer.screenToTextCoordinates(g, v);
      g.row = Math.max(0, Math.min(g.row, this.doc.getLength() - 1));
      if(e.getButton(b) != 0) {
        this.selection.isEmpty() && this.moveCursorToPosition(g)
      }else {
        if(b.shiftKey) {
          this.selection.selectToPosition(g)
        }else {
          this.moveCursorToPosition(g);
          this.$clickSelection || this.selection.clearSelection(g.row, g.column)
        }this.renderer.scrollCursorIntoView();
        var t = this, o, w;
        e.capture(this.container, function(B) {
          o = e.getDocumentX(B);
          w = e.getDocumentY(B)
        }, function() {
          clearInterval(x);
          t.$clickSelection = null
        });
        var x = setInterval(function() {
          if(!(o === undefined || w === undefined)) {
            var B = t.renderer.screenToTextCoordinates(o, w);
            B.row = Math.max(0, Math.min(B.row, t.doc.getLength() - 1));
            if(t.$clickSelection) {
              if(t.$clickSelection.contains(B.row, B.column)) {
                t.selection.setSelectionRange(t.$clickSelection)
              }else {
                var E = t.$clickSelection.compare(B.row, B.column) == -1 ? t.$clickSelection.end : t.$clickSelection.start;
                t.selection.setSelectionAnchor(E.row, E.column);
                t.selection.selectToPosition(B)
              }
            }else {
              t.selection.selectToPosition(B)
            }t.renderer.scrollCursorIntoView()
          }
        }, 20);
        return e.preventDefault(b)
      }
    };
    this.onMouseDoubleClick = function() {
      this.selection.selectWord();
      this.$clickSelection = this.getSelectionRange();
      this.$updateDesiredColumn()
    };
    this.onMouseTripleClick = function() {
      this.selection.selectLine();
      this.$clickSelection = this.getSelectionRange();
      this.$updateDesiredColumn()
    };
    this.onMouseWheel = function(b) {
      var g = this.$scrollSpeed * 2;
      this.renderer.scrollBy(b.wheelX * g, b.wheelY * g);
      return e.preventDefault(b)
    };
    this.getCopyText = function() {
      return this.selection.isEmpty() ? "" : this.doc.getTextRange(this.getSelectionRange())
    };
    this.onCut = function() {
      if(!this.$readOnly) {
        if(!this.selection.isEmpty()) {
          this.moveCursorToPosition(this.doc.remove(this.getSelectionRange()));
          this.clearSelection()
        }
      }
    };
    this.onTextInput = function(b) {
      if(!this.$readOnly) {
        var g = this.getCursorPosition();
        b = b.replace("\t", this.doc.getTabString());
        if(this.selection.isEmpty()) {
          if(this.$overwrite) {
            var v = new n.fromPoints(g, g);
            v.end.column += b.length;
            this.doc.remove(v)
          }
        }else {
          g = this.doc.remove(this.getSelectionRange());
          this.clearSelection()
        }this.clearSelection();
        var t = this;
        this.bgTokenizer.getState(g.row, function(o) {
          var w = t.mode.checkOutdent(o, t.doc.getLine(g.row), b), x = t.doc.getLine(g.row), B = t.mode.getNextLineIndent(o, x, t.doc.getTabString()), E = t.doc.insert(g, b);
          t.bgTokenizer.getState(g.row, function(F) {
            if(g.row !== E.row) {
              F = t.doc.getTabSize();
              for(var M = Number.MAX_VALUE, I = g.row + 1;I <= E.row;++I) {
                var K = 0;
                x = t.doc.getLine(I);
                for(var H = 0;H < x.length;++H) {
                  if(x.charAt(H) == "\t") {
                    K += F
                  }else {
                    if(x.charAt(H) == " ") {
                      K += 1
                    }else {
                      break
                    }
                  }
                }if(/[^\s]$/.test(x)) {
                  M = Math.min(K, M)
                }
              }for(I = g.row + 1;I <= E.row;++I) {
                K = M;
                x = t.doc.getLine(I);
                for(H = 0;H < x.length && K > 0;++H) {
                  if(x.charAt(H) == "\t") {
                    K -= F
                  }else {
                    if(x.charAt(H) == " ") {
                      K -= 1
                    }
                  }
                }t.doc.replace(new n(I, 0, I, x.length), x.substr(H))
              }E.column += t.doc.indentRows(new n(g.row + 1, 0, E.row, E.column), B)
            }else {
              if(w) {
                E.column += t.mode.autoOutdent(F, t.doc, g.row)
              }
            }t.moveCursorToPosition(E);
            t.renderer.scrollCursorIntoView()
          })
        })
      }
    };
    this.$overwrite = false;
    this.setOverwrite = function(b) {
      if(this.$overwrite != b) {
        this.$overwrite = b;
        this.$blockScrolling = true;
        this.onCursorChange();
        this.$blockScrolling = false;
        this.$dispatchEvent("changeOverwrite", {data:b})
      }
    };
    this.getOverwrite = function() {
      return this.$overwrite
    };
    this.toggleOverwrite = function() {
      this.setOverwrite(!this.$overwrite)
    };
    this.$scrollSpeed = 1;
    this.setScrollSpeed = function(b) {
      this.$scrollSpeed = b
    };
    this.getScrollSpeed = function() {
      return this.$scrollSpeed
    };
    this.$selectionStyle = "line";
    this.setSelectionStyle = function(b) {
      if(this.$selectionStyle != b) {
        this.$selectionStyle = b;
        this.onSelectionChange();
        this.$dispatchEvent("changeSelectionStyle", {data:b})
      }
    };
    this.getSelectionStyle = function() {
      return this.$selectionStyle
    };
    this.$highlightActiveLine = true;
    this.setHighlightActiveLine = function(b) {
      if(this.$highlightActiveLine != b) {
        this.$highlightActiveLine = b;
        this.$updateHighlightActiveLine()
      }
    };
    this.getHighlightActiveLine = function() {
      return this.$highlightActiveLine
    };
    this.setShowInvisibles = function(b) {
      this.getShowInvisibles() != b && this.renderer.setShowInvisibles(b)
    };
    this.getShowInvisibles = function() {
      return this.renderer.getShowInvisibles()
    };
    this.setShowPrintMargin = function(b) {
      this.renderer.setShowPrintMargin(b)
    };
    this.getShowPrintMargin = function() {
      return this.renderer.getShowPrintMargin()
    };
    this.setPrintMarginColumn = function(b) {
      this.renderer.setPrintMarginColumn(b)
    };
    this.getPrintMarginColumn = function() {
      return this.renderer.getPrintMarginColumn()
    };
    this.$readOnly = false;
    this.setReadOnly = function(b) {
      this.$readOnly = b
    };
    this.getReadOnly = function() {
      return this.$readOnly
    };
    this.removeRight = function() {
      if(!this.$readOnly) {
        this.selection.isEmpty() && this.selection.selectRight();
        this.moveCursorToPosition(this.doc.remove(this.getSelectionRange()));
        this.clearSelection()
      }
    };
    this.removeLeft = function() {
      if(!this.$readOnly) {
        this.selection.isEmpty() && this.selection.selectLeft();
        this.moveCursorToPosition(this.doc.remove(this.getSelectionRange()));
        this.clearSelection()
      }
    };
    this.indent = function() {
      if(!this.$readOnly) {
        var b = this.getSelectionRange();
        if(b.start.row < b.end.row || b.start.column < b.end.column) {
          b = this.doc.indentRows(this.getSelectionRange(), "\t");
          this.selection.shiftSelection(b)
        }else {
          if(this.doc.getUseSoftTabs()) {
            b = this.doc.getTabSize();
            b = b - this.getCursorPosition().column % b;
            b = d.stringRepeat(" ", b)
          }else {
            b = "\t"
          }return this.onTextInput(b)
        }
      }
    };
    this.blockOutdent = function() {
      if(!this.$readOnly) {
        var b = this.doc.getSelection(), g = this.doc.outdentRows(b.getRange());
        b.setSelectionRange(g, b.isBackwards());
        this.$updateDesiredColumn()
      }
    };
    this.toggleCommentLines = function() {
      if(!this.$readOnly) {
        var b = this.$getSelectedRows(), g = new n(b.first, 0, b.last, 0), v = this;
        this.bgTokenizer.getState(this.getCursorPosition().row, function(t) {
          t = v.mode.toggleCommentLines(t, v.doc, g);
          v.selection.shiftSelection(t)
        })
      }
    };
    this.removeLines = function() {
      if(!this.$readOnly) {
        var b = this.$getSelectedRows();
        this.selection.setSelectionAnchor(b.last + 1, 0);
        this.selection.selectTo(b.first, 0);
        this.doc.remove(this.getSelectionRange());
        this.clearSelection()
      }
    };
    this.moveLinesDown = function() {
      this.$readOnly || this.$moveLines(function(b, g) {
        return this.doc.moveLinesDown(b, g)
      })
    };
    this.moveLinesUp = function() {
      this.$readOnly || this.$moveLines(function(b, g) {
        return this.doc.moveLinesUp(b, g)
      })
    };
    this.copyLinesUp = function() {
      this.$readOnly || this.$moveLines(function(b, g) {
        this.doc.duplicateLines(b, g);
        return 0
      })
    };
    this.copyLinesDown = function() {
      this.$readOnly || this.$moveLines(function(b, g) {
        return this.doc.duplicateLines(b, g)
      })
    };
    this.$moveLines = function(b) {
      var g = this.$getSelectedRows(), v = b.call(this, g.first, g.last), t = this.selection;
      t.setSelectionAnchor(g.last + v + 1, 0);
      t.$moveSelection(function() {
        t.moveCursorTo(g.first + v, 0)
      })
    };
    this.$getSelectedRows = function() {
      var b = this.getSelectionRange(), g = b.start.row, v = b.end.row;
      if(b.end.column == 0 && b.start.row !== b.end.row) {
        v -= 1
      }return{first:g, last:v}
    };
    this.onCompositionStart = function() {
      this.renderer.showComposition(this.getCursorPosition())
    };
    this.onCompositionUpdate = function(b) {
      this.renderer.setCompositionText(b)
    };
    this.onCompositionEnd = function() {
      this.renderer.hideComposition()
    };
    this.getFirstVisibleRow = function() {
      return this.renderer.getFirstVisibleRow()
    };
    this.getLastVisibleRow = function() {
      return this.renderer.getLastVisibleRow()
    };
    this.isRowVisible = function(b) {
      return b >= this.getFirstVisibleRow() && b <= this.getLastVisibleRow()
    };
    this.getVisibleRowCount = function() {
      return this.getLastVisibleRow() - this.getFirstVisibleRow() + 1
    };
    this.getPageDownRow = function() {
      return this.renderer.getLastVisibleRow() - 1
    };
    this.getPageUpRow = function() {
      var b = this.renderer.getFirstVisibleRow(), g = this.renderer.getLastVisibleRow();
      return b - (g - b) + 1
    };
    this.selectPageDown = function() {
      var b = this.getPageDownRow() + Math.floor(this.getVisibleRowCount() / 2);
      this.scrollPageDown();
      var g = this.getSelection();
      g.$moveSelection(function() {
        g.moveCursorTo(b, g.getSelectionLead().column)
      })
    };
    this.selectPageUp = function() {
      var b = this.getLastVisibleRow() - this.getFirstVisibleRow(), g = this.getPageUpRow() + Math.round(b / 2);
      this.scrollPageUp();
      var v = this.getSelection();
      v.$moveSelection(function() {
        v.moveCursorTo(g, v.getSelectionLead().column)
      })
    };
    this.gotoPageDown = function() {
      var b = this.getPageDownRow(), g = Math.min(this.getCursorPosition().column, this.doc.getLine(b).length);
      this.scrollToRow(b);
      this.getSelection().moveCursorTo(b, g)
    };
    this.gotoPageUp = function() {
      var b = this.getPageUpRow(), g = Math.min(this.getCursorPosition().column, this.doc.getLine(b).length);
      this.scrollToRow(b);
      this.getSelection().moveCursorTo(b, g)
    };
    this.scrollPageDown = function() {
      this.scrollToRow(this.getPageDownRow())
    };
    this.scrollPageUp = function() {
      this.renderer.scrollToRow(this.getPageUpRow())
    };
    this.scrollToRow = function(b) {
      this.renderer.scrollToRow(b)
    };
    this.getCursorPosition = function() {
      return this.selection.getCursor()
    };
    this.getSelectionRange = function() {
      return this.selection.getRange()
    };
    this.clearSelection = function() {
      this.selection.clearSelection();
      this.$updateDesiredColumn()
    };
    this.moveCursorTo = function(b, g) {
      this.selection.moveCursorTo(b, g);
      this.$updateDesiredColumn()
    };
    this.moveCursorToPosition = function(b) {
      this.selection.moveCursorToPosition(b);
      this.$updateDesiredColumn()
    };
    this.gotoLine = function(b, g) {
      this.selection.clearSelection();
      this.$blockScrolling = true;
      this.moveCursorTo(b - 1, g || 0);
      this.$blockScrolling = false;
      this.isRowVisible(this.getCursorPosition().row) || this.scrollToRow(b - 1 - Math.floor(this.getVisibleRowCount() / 2))
    };
    this.navigateTo = function(b, g) {
      this.clearSelection();
      this.moveCursorTo(b, g);
      this.$updateDesiredColumn(g)
    };
    this.navigateUp = function() {
      this.selection.clearSelection();
      this.selection.moveCursorBy(-1, 0);
      if(this.$desiredColumn) {
        var b = this.getCursorPosition(), g = this.doc.screenToDocumentColumn(b.row, this.$desiredColumn);
        this.selection.moveCursorTo(b.row, g)
      }
    };
    this.navigateDown = function() {
      this.selection.clearSelection();
      this.selection.moveCursorBy(1, 0);
      if(this.$desiredColumn) {
        var b = this.getCursorPosition(), g = this.doc.screenToDocumentColumn(b.row, this.$desiredColumn);
        this.selection.moveCursorTo(b.row, g)
      }
    };
    this.$updateDesiredColumn = function() {
      var b = this.getCursorPosition();
      this.$desiredColumn = this.doc.documentToScreenColumn(b.row, b.column)
    };
    this.navigateLeft = function() {
      this.selection.isEmpty() ? this.selection.moveCursorLeft() : this.moveCursorToPosition(this.getSelectionRange().start);
      this.clearSelection()
    };
    this.navigateRight = function() {
      this.selection.isEmpty() ? this.selection.moveCursorRight() : this.moveCursorToPosition(this.getSelectionRange().end);
      this.clearSelection()
    };
    this.navigateLineStart = function() {
      this.selection.moveCursorLineStart();
      this.clearSelection()
    };
    this.navigateLineEnd = function() {
      this.selection.moveCursorLineEnd();
      this.clearSelection()
    };
    this.navigateFileEnd = function() {
      this.selection.moveCursorFileEnd();
      this.clearSelection()
    };
    this.navigateFileStart = function() {
      this.selection.moveCursorFileStart();
      this.clearSelection()
    };
    this.navigateWordRight = function() {
      this.selection.moveCursorWordRight();
      this.clearSelection()
    };
    this.navigateWordLeft = function() {
      this.selection.moveCursorWordLeft();
      this.clearSelection()
    };
    this.replace = function(b, g) {
      g && this.$search.set(g);
      g = this.$search.find(this.doc);
      this.$tryReplace(g, b);
      g !== null && this.selection.setSelectionRange(g);
      this.$updateDesiredColumn()
    };
    this.replaceAll = function(b, g) {
      g && this.$search.set(g);
      this.clearSelection();
      this.selection.moveCursorTo(0, 0);
      g = this.$search.findAll(this.doc);
      if(g.length) {
        for(var v = g.length - 1;v >= 0;--v) {
          this.$tryReplace(g[v], b)
        }g[0] !== null && this.selection.setSelectionRange(g[0]);
        this.$updateDesiredColumn()
      }
    };
    this.$tryReplace = function(b, g) {
      g = this.$search.replace(this.doc.getTextRange(b), g);
      if(g !== null) {
        b.end = this.doc.replace(b, g);
        return b
      }else {
        return null
      }
    };
    this.getLastSearchOptions = function() {
      return this.$search.getOptions()
    };
    this.find = function(b, g) {
      this.clearSelection();
      g = g || {};
      g.needle = b;
      this.$search.set(g);
      this.$find()
    };
    this.findNext = function(b) {
      b = b || {};
      if(typeof b.backwards == "undefined") {
        b.backwards = false
      }this.$search.set(b);
      this.$find()
    };
    this.findPrevious = function(b) {
      b = b || {};
      if(typeof b.backwards == "undefined") {
        b.backwards = true
      }this.$search.set(b);
      this.$find()
    };
    this.$find = function(b) {
      this.selection.isEmpty() || this.$search.set({needle:this.doc.getTextRange(this.getSelectionRange())});
      typeof b != "undefined" && this.$search.set({backwards:b});
      if(b = this.$search.find(this.doc)) {
        this.gotoLine(b.end.row + 1, b.end.column);
        this.$updateDesiredColumn();
        this.selection.setSelectionRange(b)
      }
    };
    this.undo = function() {
      this.doc.getUndoManager().undo()
    };
    this.redo = function() {
      this.doc.getUndoManager().redo()
    }
  }).call(i.prototype);
  return i
});
define("ace/undomanager", ["require", "exports", "module"], function() {
  var i = function() {
    this.$undoStack = [];
    this.$redoStack = []
  };
  (function() {
    this.execute = function(h) {
      var e = h.args[0];
      this.$doc = h.args[1];
      this.$undoStack.push(e)
    };
    this.undo = function() {
      var h = this.$undoStack.pop();
      if(h) {
        this.$doc.undoChanges(h);
        this.$redoStack.push(h)
      }
    };
    this.redo = function() {
      var h = this.$redoStack.pop();
      if(h) {
        this.$doc.redoChanges(h);
        this.$undoStack.push(h)
      }
    }
  }).call(i.prototype);
  return i
});
define("ace/layer/gutter", ["require", "exports", "module"], function() {
  var i = function(h) {
    this.element = document.createElement("div");
    this.element.className = "ace_layer ace_gutter-layer";
    h.appendChild(this.element);
    this.$breakpoints = [];
    this.$decorations = []
  };
  (function() {
    this.addGutterDecoration = function(h, e) {
      this.$decorations[h] || (this.$decorations[h] = "");
      this.$decorations[h] += " ace_" + e
    };
    this.removeGutterDecoration = function(h, e) {
      this.$decorations[h] = this.$decorations[h].replace(" ace_" + e, "")
    };
    this.setBreakpoints = function(h) {
      this.$breakpoints = h.concat()
    };
    this.update = function(h) {
      this.$config = h;
      for(var e = [], d = h.firstRow;d <= h.lastRow;d++) {
        e.push("<div class='ace_gutter-cell", this.$decorations[d] || "", this.$breakpoints[d] ? " ace_breakpoint" : "", "' style='height:", h.lineHeight, "px;'>", d + 1, "</div>");
        e.push("</div>")
      }this.element.innerHTML = e.join("");
      this.element.style.height = h.minHeight + "px"
    }
  }).call(i.prototype);
  return i
});
define("ace/layer/marker", ["require", "exports", "module", "../range"], function(i) {
  var h = i("../range");
  i = function(e) {
    this.element = document.createElement("div");
    this.element.className = "ace_layer ace_marker-layer";
    e.appendChild(this.element);
    this.markers = {};
    this.$markerId = 1
  };
  (function() {
    this.setDocument = function(e) {
      this.doc = e
    };
    this.addMarker = function(e, d, j) {
      var c = this.$markerId++;
      this.markers[c] = {range:e, type:j || "line", clazz:d};
      return c
    };
    this.removeMarker = function(e) {
      this.markers[e] && delete this.markers[e]
    };
    this.update = function(e) {
      if(e = e || this.config) {
        this.config = e;
        var d = [];
        for(var j in this.markers) {
          var c = this.markers[j], k = c.range.clipRows(e.firstRow, e.lastRow);
          if(!k.isEmpty()) {
            if(k.isMultiLine()) {
              c.type == "text" ? this.drawTextMarker(d, k, c.clazz, e) : this.drawMultiLineMarker(d, k, c.clazz, e)
            }else {
              this.drawSingleLineMarker(d, k, c.clazz, e)
            }
          }
        }this.element.innerHTML = d.join("")
      }
    };
    this.drawTextMarker = function(e, d, j, c) {
      var k = d.start.row, a = new h(k, d.start.column, k, this.doc.getLine(k).length);
      this.drawSingleLineMarker(e, a, j, c);
      k = d.end.row;
      a = new h(k, 0, k, d.end.column);
      this.drawSingleLineMarker(e, a, j, c);
      for(k = d.start.row + 1;k < d.end.row;k++) {
        a.start.row = k;
        a.end.row = k;
        a.end.column = this.doc.getLine(k).length;
        this.drawSingleLineMarker(e, a, j, c)
      }
    };
    this.drawMultiLineMarker = function(e, d, j, c) {
      d = d.toScreenRange(this.doc);
      var k = c.lineHeight, a = Math.round(c.width - d.start.column * c.characterWidth), f = (d.start.row - c.firstRow) * c.lineHeight, n = Math.round(d.start.column * c.characterWidth);
      e.push("<div class='", j, "' style='", "height:", k, "px;", "width:", a, "px;", "top:", f, "px;", "left:", n, "px;'></div>");
      f = (d.end.row - c.firstRow) * c.lineHeight;
      a = Math.round(d.end.column * c.characterWidth);
      e.push("<div class='", j, "' style='", "height:", k, "px;", "top:", f, "px;", "width:", a, "px;'></div>");
      k = (d.end.row - d.start.row - 1) * c.lineHeight;
      if(!(k < 0)) {
        f = (d.start.row + 1 - c.firstRow) * c.lineHeight;
        e.push("<div class='", j, "' style='", "height:", k, "px;", "width:", c.width, "px;", "top:", f, "px;'></div>")
      }
    };
    this.drawSingleLineMarker = function(e, d, j, c) {
      d = d.toScreenRange(this.doc);
      var k = c.lineHeight, a = Math.round((d.end.column - d.start.column) * c.characterWidth), f = (d.start.row - c.firstRow) * c.lineHeight;
      d = Math.round(d.start.column * c.characterWidth);
      e.push("<div class='", j, "' style='", "height:", k, "px;", "width:", a, "px;", "top:", f, "px;", "left:", d, "px;'></div>")
    }
  }).call(i.prototype);
  return i
});
define("ace/lib/dom", ["require", "exports", "module", "./lang"], function(i) {
  var h = i("./lang"), e = {};
  e.setText = function(d, j) {
    if(d.innerText !== undefined) {
      d.innerText = j
    }if(d.textContent !== undefined) {
      d.textContent = j
    }
  };
  e.hasCssClass = function(d, j) {
    d = d.className.split(/\s+/g);
    return h.arrayIndexOf(d, j) !== -1
  };
  e.addCssClass = function(d, j) {
    e.hasCssClass(d, j) || (d.className += " " + j)
  };
  e.removeCssClass = function(d, j) {
    for(var c = d.className.split(/\s+/g);;) {
      var k = h.arrayIndexOf(c, j);
      if(k == -1) {
        break
      }c.splice(k, 1)
    }d.className = c.join(" ")
  };
  e.importCssString = function(d, j) {
    j = j || document;
    if(j.createStyleSheet) {
      j.createStyleSheet().cssText = d
    }else {
      var c = j.createElement("style");
      c.appendChild(j.createTextNode(d));
      j.getElementsByTagName("head")[0].appendChild(c)
    }
  };
  e.getInnerWidth = function(d) {
    return parseInt(e.computedStyle(d, "paddingLeft")) + parseInt(e.computedStyle(d, "paddingRight")) + d.clientWidth
  };
  e.getInnerHeight = function(d) {
    return parseInt(e.computedStyle(d, "paddingTop")) + parseInt(e.computedStyle(d, "paddingBottom")) + d.clientHeight
  };
  e.computedStyle = function(d, j) {
    return window.getComputedStyle ? (window.getComputedStyle(d, "") || {})[j] || "" : d.currentStyle[j]
  };
  e.scrollbarWidth = function() {
    var d = document.createElement("p");
    d.style.width = "100%";
    d.style.height = "200px";
    var j = document.createElement("div"), c = j.style;
    c.position = "absolute";
    c.left = "-10000px";
    c.overflow = "hidden";
    c.width = "200px";
    c.height = "150px";
    j.appendChild(d);
    document.body.appendChild(j);
    var k = d.offsetWidth;
    c.overflow = "scroll";
    d = d.offsetWidth;
    if(k == d) {
      d = j.clientWidth
    }document.body.removeChild(j);
    return k - d
  };
  return e
});
define("ace/layer/text", ["require", "exports", "module", "../lib/oop", "../lib/dom", "../event_emitter"], function(i) {
  var h = i("../lib/oop"), e = i("../lib/dom"), d = i("../event_emitter");
  i = function(j) {
    this.element = document.createElement("div");
    this.element.className = "ace_layer ace_text-layer";
    j.appendChild(this.element);
    this.$characterSize = this.$measureSizes();
    this.$pollSizeChanges()
  };
  (function() {
    h.implement(this, d);
    this.EOF_CHAR = "&para;";
    this.EOL_CHAR = "&not;";
    this.TAB_CHAR = "&rarr;";
    this.SPACE_CHAR = "&middot;";
    this.setTokenizer = function(j) {
      this.tokenizer = j
    };
    this.getLineHeight = function() {
      return this.$characterSize.height || 1
    };
    this.getCharacterWidth = function() {
      return this.$characterSize.width || 1
    };
    this.$pollSizeChanges = function() {
      var j = this;
      setInterval(function() {
        var c = j.$measureSizes();
        if(j.$characterSize.width !== c.width || j.$characterSize.height !== c.height) {
          j.$characterSize = c;
          j.$dispatchEvent("changeCharaterSize", {data:c})
        }
      }, 500)
    };
    this.$fontStyles = {fontFamily:1, fontSize:1, fontWeight:1, fontStyle:1, lineHeight:1};
    this.$measureSizes = function() {
      var j = document.createElement("div"), c = j.style;
      c.width = c.height = "auto";
      c.left = c.top = "-1000px";
      c.visibility = "hidden";
      c.position = "absolute";
      c.overflow = "visible";
      for(var k in this.$fontStyles) {
        var a = e.computedStyle(this.element, k);
        c[k] = a
      }j.innerHTML = (new Array(1E3)).join("Xy");
      document.body.insertBefore(j, document.body.firstChild);
      c = {height:j.offsetHeight, width:j.offsetWidth / 2E3};
      document.body.removeChild(j);
      return c
    };
    this.setDocument = function(j) {
      this.doc = j
    };
    this.$showInvisibles = false;
    this.setShowInvisibles = function(j) {
      this.$showInvisibles = j
    };
    this.$computeTabString = function() {
      var j = this.doc.getTabSize();
      if(this.$showInvisibles) {
        j = j / 2;
        this.$tabString = "<span class='ace_invisible'>" + (new Array(Math.floor(j))).join("&nbsp;") + this.TAB_CHAR + (new Array(Math.ceil(j) + 1)).join("&nbsp;") + "</span>"
      }else {
        this.$tabString = (new Array(j + 1)).join("&nbsp;")
      }
    };
    this.updateLines = function(j, c, k) {
      this.$computeTabString();
      var a = Math.max(c, j.firstRow), f = Math.min(k, j.lastRow), n = this.element.childNodes, p = this;
      this.tokenizer.getTokens(a, f, function(b) {
        for(var g = a;g <= f;g++) {
          var v = n[g - j.firstRow];
          if(v) {
            var t = [];
            p.$renderLine(t, g, b[g - a].tokens);
            v.innerHTML = t.join("")
          }
        }
      })
    };
    this.scrollLines = function(j) {
      function c(b) {
        j.firstRow < f.firstRow ? a.$renderLinesFragment(j, j.firstRow, f.firstRow - 1, function(g) {
          n.firstChild ? n.insertBefore(g, n.firstChild) : n.appendChild(g);
          b()
        }) : b()
      }
      function k() {
        j.lastRow > f.lastRow && a.$renderLinesFragment(j, f.lastRow + 1, j.lastRow, function(b) {
          n.appendChild(b)
        })
      }
      var a = this;
      this.$computeTabString();
      var f = this.config;
      this.config = j;
      if(!f || f.lastRow < j.firstRow) {
        return this.update(j)
      }if(j.lastRow < f.firstRow) {
        return this.update(j)
      }var n = this.element;
      if(f.firstRow < j.firstRow) {
        for(var p = f.firstRow;p < j.firstRow;p++) {
          n.removeChild(n.firstChild)
        }
      }if(f.lastRow > j.lastRow) {
        for(p = j.lastRow + 1;p <= f.lastRow;p++) {
          n.removeChild(n.lastChild)
        }
      }c(k)
    };
    this.$renderLinesFragment = function(j, c, k, a) {
      var f = document.createDocumentFragment(), n = this;
      this.tokenizer.getTokens(c, k, function(p) {
        for(var b = c;b <= k;b++) {
          var g = document.createElement("div");
          g.className = "ace_line";
          var v = g.style;
          v.height = n.$characterSize.height + "px";
          v.width = j.width + "px";
          v = [];
          n.$renderLine(v, b, p[b - c].tokens);
          g.innerHTML = v.join("");
          f.appendChild(g)
        }a(f)
      })
    };
    this.update = function(j) {
      this.$computeTabString();
      var c = [], k = this;
      this.tokenizer.getTokens(j.firstRow, j.lastRow, function(a) {
        for(var f = j.firstRow;f <= j.lastRow;f++) {
          c.push("<div class='ace_line' style='height:" + k.$characterSize.height + "px;", "width:", j.width, "px'>");
          k.$renderLine(c, f, a[f - j.firstRow].tokens);
          c.push("</div>")
        }k.element.innerHTML = c.join("")
      })
    };
    this.$textToken = {text:true, rparen:true, lparen:true};
    this.$renderLine = function(j, c, k) {
      for(var a = /[\v\f \u00a0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000]/g, f = 0;f < k.length;f++) {
        var n = k[f], p = n.value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(a, "&nbsp;").replace(/\t/g, this.$tabString);
        if(this.$textToken[n.type]) {
          j.push(p)
        }else {
          n = "ace_" + n.type.replace(/\./g, " ace_");
          j.push("<span class='", n, "'>", p, "</span>")
        }
      }if(this.$showInvisibles) {
        c !== this.doc.getLength() - 1 ? j.push("<span class='ace_invisible'>" + this.EOL_CHAR + "</span>") : j.push("<span class='ace_invisible'>" + this.EOF_CHAR + "</span>")
      }
    }
  }).call(i.prototype);
  return i
});
define("ace/layer/cursor", ["require", "exports", "module", "../lib/dom"], function(i) {
  var h = i("../lib/dom");
  i = function(e) {
    this.element = document.createElement("div");
    this.element.className = "ace_layer ace_cursor-layer";
    e.appendChild(this.element);
    this.cursor = document.createElement("div");
    this.cursor.className = "ace_cursor";
    this.isVisible = false
  };
  (function() {
    this.setDocument = function(e) {
      this.doc = e
    };
    this.setCursor = function(e, d) {
      this.position = {row:e.row, column:this.doc.documentToScreenColumn(e.row, e.column)};
      d ? h.addCssClass(this.cursor, "ace_overwrite") : h.removeCssClass(this.cursor, "ace_overwrite")
    };
    this.hideCursor = function() {
      this.isVisible = false;
      this.cursor.parentNode && this.cursor.parentNode.removeChild(this.cursor);
      clearInterval(this.blinkId)
    };
    this.showCursor = function() {
      this.isVisible = true;
      this.element.appendChild(this.cursor);
      this.cursor.style.visibility = "visible";
      this.restartTimer()
    };
    this.restartTimer = function() {
      clearInterval(this.blinkId);
      if(this.isVisible) {
        var e = this.cursor;
        this.blinkId = setInterval(function() {
          e.style.visibility = "hidden";
          setTimeout(function() {
            e.style.visibility = "visible"
          }, 400)
        }, 1E3)
      }
    };
    this.getPixelPosition = function() {
      if(!this.config || !this.position) {
        return{left:0, top:0}
      }var e = this.position.row * this.config.lineHeight;
      return{left:Math.round(this.position.column * this.config.characterWidth), top:e}
    };
    this.update = function(e) {
      if(this.position) {
        this.config = e;
        var d = Math.round(this.position.column * e.characterWidth), j = this.position.row * e.lineHeight;
        this.pixelPos = {left:d, top:j};
        this.cursor.style.left = d + "px";
        this.cursor.style.top = j - e.firstRow * e.lineHeight + "px";
        this.cursor.style.width = e.characterWidth + "px";
        this.cursor.style.height = e.lineHeight + "px";
        this.isVisible && this.element.appendChild(this.cursor);
        this.restartTimer()
      }
    }
  }).call(i.prototype);
  return i
});
define("ace/scrollbar", ["require", "exports", "module", "./lib/oop", "./lib/lang", "./lib/dom", "./lib/event", "./event_emitter"], function(i) {
  var h = i("./lib/oop"), e = i("./lib/lang"), d = i("./lib/dom"), j = i("./lib/event"), c = i("./event_emitter");
  i = function(k) {
    this.element = document.createElement("div");
    this.element.className = "ace_sb";
    this.inner = document.createElement("div");
    this.element.appendChild(this.inner);
    k.appendChild(this.element);
    this.width = d.scrollbarWidth();
    this.element.style.width = this.width;
    j.addListener(this.element, "scroll", e.bind(this.onScroll, this))
  };
  (function() {
    h.implement(this, c);
    this.onScroll = function() {
      this.$dispatchEvent("scroll", {data:this.element.scrollTop})
    };
    this.getWidth = function() {
      return this.width
    };
    this.setHeight = function(k) {
      this.element.style.height = Math.max(0, k - this.width) + "px"
    };
    this.setInnerHeight = function(k) {
      this.inner.style.height = k + "px"
    };
    this.setScrollTop = function(k) {
      this.element.scrollTop = k
    }
  }).call(i.prototype);
  return i
});
define("ace/renderloop", ["require", "exports", "module", "./lib/event"], function(i) {
  var h = i("./lib/event");
  i = function(e) {
    this.onRender = e;
    this.pending = false;
    this.changes = 0
  };
  (function() {
    this.schedule = function(e) {
      this.changes |= e;
      if(!this.pending) {
        this.pending = true;
        var d = this;
        this.setTimeoutZero(function() {
          d.pending = false;
          d.onRender(d.changes);
          d.changes = 0
        })
      }
    };
    if(window.postMessage) {
      this.messageName = "zero-timeout-message";
      this.setTimeoutZero = function(e) {
        if(!this.attached) {
          var d = this;
          h.addListener(window, "message", function(j) {
            if(j.source == window && d.callback && j.data == d.messageName) {
              h.stopPropagation(j);
              d.callback()
            }
          });
          this.attached = true
        }this.callback = e;
        window.postMessage(this.messageName, "*")
      }
    }else {
      this.setTimeoutZero = function(e) {
        setTimeout(e, 0)
      }
    }
  }).call(i.prototype);
  return i
});
define("ace/virtual_renderer", ["require", "exports", "module", 'text!ace/css/editor.css!.ace_editor {\n  position: absolute;\n  overflow: hidden;\n\n  font-family: "Menlo", "Monaco", "Courier New", monospace;\n  font-size: 12px;  \n}\n\n.ace_scroller {\n  position: absolute;\n  overflow-x: scroll;\n  overflow-y: hidden;     \n}\n\n.ace_gutter {\n  position: absolute;\n  overflow-x: hidden;\n  overflow-y: hidden;\n  height: 100%;\n}\n\n.ace_editor .ace_sb {\n  position: absolute;\n  overflow-x: hidden;\n  overflow-y: scroll;\n  right: 0;\n}\n\n.ace_editor .ace_sb div {\n  position: absolute;\n  width: 1px;\n  left: 0px;\n}\n\n.ace_editor .ace_printMargin {\n  position: absolute;\n  height: 100%;\n}\n\n.ace_layer {\n  z-index: 0;\n  position: absolute;\n  overflow: hidden;  \n  white-space: nowrap;\n  height: 100%;\n}\n\n.ace_text-layer {\n  font-family: Monaco, "Courier New", monospace;\n  color: black;\n}\n\n.ace_cursor-layer {\n  cursor: text;\n}\n\n.ace_cursor {\n  z-index: 3;\n  position: absolute;\n}\n\n.ace_line {\n  white-space: nowrap;\n}\n\n.ace_marker-layer {\n}\n\n.ace_marker-layer .ace_step {\n  position: absolute;\n  z-index: 2;\n}\n\n.ace_marker-layer .ace_selection {\n  position: absolute;\n  z-index: 3;\n}\n\n.ace_marker-layer .ace_bracket {\n  position: absolute;\n  z-index: 4;\n}\n\n.ace_marker-layer .ace_active_line {\n  position: absolute;\n  z-index: 1;\n}', 
"./lib/oop", "./lib/oop", "./lib/event", "./layer/gutter", "./layer/marker", "./layer/text", "./layer/cursor", "./scrollbar", "./renderloop", "./event_emitter"], function(i, h, e, d) {
  var j = i("./lib/oop"), c = i("./lib/lang"), k = i("./lib/dom"), a = i("./lib/event"), f = i("./layer/gutter"), n = i("./layer/marker"), p = i("./layer/text"), b = i("./layer/cursor"), g = i("./scrollbar"), v = i("./renderloop"), t = i("./event_emitter");
  k.importCssString(d);
  h = function(o, w) {
    this.container = o;
    k.addCssClass(this.container, "ace_editor");
    this.setTheme(w);
    this.scroller = document.createElement("div");
    this.scroller.className = "ace_scroller";
    this.container.appendChild(this.scroller);
    this.$gutter = document.createElement("div");
    this.$gutter.className = "ace_gutter";
    this.container.appendChild(this.$gutter);
    this.content = document.createElement("div");
    this.content.style.position = "absolute";
    this.scroller.appendChild(this.content);
    this.$gutterLayer = new f(this.$gutter);
    this.$markerLayer = new n(this.content);
    var x = this.$textLayer = new p(this.content);
    this.canvas = x.element;
    this.characterWidth = x.getCharacterWidth();
    this.lineHeight = x.getLineHeight();
    this.$cursorLayer = new b(this.content);
    this.layers = [this.$markerLayer, x, this.$cursorLayer];
    this.scrollBar = new g(o);
    this.scrollBar.addEventListener("scroll", c.bind(this.onScroll, this));
    this.scrollTop = 0;
    this.cursorPos = {row:0, column:0};
    var B = this;
    this.$textLayer.addEventListener("changeCharaterSize", function() {
      B.characterWidth = x.getCharacterWidth();
      B.lineHeight = x.getLineHeight();
      B.$loop.schedule(B.CHANGE_FULL)
    });
    a.addListener(this.$gutter, "click", c.bind(this.$onGutterClick, this));
    a.addListener(this.$gutter, "dblclick", c.bind(this.$onGutterClick, this));
    this.$size = {width:0, height:0, scrollerHeight:0, scrollerWidth:0};
    this.$loop = new v(c.bind(this.$renderChanges, this));
    this.$loop.schedule(this.CHANGE_FULL);
    this.$updatePrintMargin();
    this.setPadding(4)
  };
  (function() {
    this.showGutter = true;
    this.CHANGE_CURSOR = 1;
    this.CHANGE_MARKER = 2;
    this.CHANGE_GUTTER = 4;
    this.CHANGE_SCROLL = 8;
    this.CHANGE_LINES = 16;
    this.CHANGE_TEXT = 32;
    this.CHANGE_SIZE = 64;
    this.CHANGE_FULL = 128;
    j.implement(this, t);
    this.setDocument = function(o) {
      this.lines = o.lines;
      this.doc = o;
      this.$cursorLayer.setDocument(o);
      this.$markerLayer.setDocument(o);
      this.$textLayer.setDocument(o);
      this.$loop.schedule(this.CHANGE_FULL)
    };
    this.updateLines = function(o, w) {
      if(w === undefined) {
        w = Infinity
      }if(this.$changedLines) {
        if(this.$changedLines.firstRow > o) {
          this.$changedLines.firstRow = o
        }if(this.$changedLines.lastRow < w) {
          this.$changedLines.lastRow = w
        }
      }else {
        this.$changedLines = {firstRow:o, lastRow:w}
      }this.$loop.schedule(this.CHANGE_LINES)
    };
    this.updateText = function() {
      this.$loop.schedule(this.CHANGE_TEXT)
    };
    this.updateFull = function() {
      this.$loop.schedule(this.CHANGE_FULL)
    };
    this.onResize = function() {
      this.$loop.schedule(this.CHANGE_SIZE);
      var o = k.getInnerHeight(this.container);
      if(this.$size.height != o) {
        this.$size.height = o;
        this.scroller.style.height = o + "px";
        this.scrollBar.setHeight(o);
        if(this.doc) {
          this.scrollToY(this.getScrollTop());
          this.$loop.schedule(this.CHANGE_FULL)
        }
      }o = k.getInnerWidth(this.container);
      if(this.$size.width != o) {
        this.$size.width = o;
        var w = this.showGutter ? this.$gutter.offsetWidth : 0;
        this.scroller.style.left = w + "px";
        this.scroller.style.width = Math.max(0, o - w - this.scrollBar.getWidth()) + "px"
      }this.$size.scrollerWidth = this.scroller.clientWidth;
      this.$size.scrollerHeight = this.scroller.clientHeight
    };
    this.setTokenizer = function(o) {
      this.$tokenizer = o;
      this.$textLayer.setTokenizer(o);
      this.$loop.schedule(this.CHANGE_TEXT)
    };
    this.$onGutterClick = function(o) {
      var w = a.getDocumentX(o), x = a.getDocumentY(o);
      this.$dispatchEvent("gutter" + o.type, {row:this.screenToTextCoordinates(w, x).row, htmlEvent:o})
    };
    this.$showInvisibles = true;
    this.setShowInvisibles = function(o) {
      this.$showInvisibles = o;
      this.$textLayer.setShowInvisibles(o);
      this.$loop.schedule(this.CHANGE_TEXT)
    };
    this.getShowInvisibles = function() {
      return this.$showInvisibles
    };
    this.$showPrintMargin = true;
    this.setShowPrintMargin = function(o) {
      this.$showPrintMargin = o;
      this.$updatePrintMargin()
    };
    this.getShowPrintMargin = function() {
      return this.$showPrintMargin
    };
    this.$printMarginColumn = 80;
    this.setPrintMarginColumn = function(o) {
      this.$printMarginColumn = o;
      this.$updatePrintMargin()
    };
    this.getPrintMarginColumn = function() {
      return this.$printMarginColumn
    };
    this.setShowGutter = function(o) {
      this.$gutter.style.display = o ? "block" : "none";
      this.showGutter = o;
      this.onResize()
    };
    this.$updatePrintMargin = function() {
      if(this.$showPrintMargin || this.$printMarginEl) {
        if(!this.$printMarginEl) {
          this.$printMarginEl = document.createElement("div");
          this.$printMarginEl.className = "ace_printMargin";
          this.content.insertBefore(this.$printMarginEl, this.$textLayer.element)
        }var o = this.$printMarginEl.style;
        o.left = this.characterWidth * this.$printMarginColumn + "px";
        o.visibility = this.$showPrintMargin ? "visible" : "hidden"
      }
    };
    this.getContainerElement = function() {
      return this.container
    };
    this.getMouseEventTarget = function() {
      return this.content
    };
    this.getFirstVisibleRow = function() {
      return(this.layerConfig || {}).firstRow || 0
    };
    this.getFirstFullyVisibleRow = function() {
      if(!this.layerConfig) {
        return 0
      }return this.layerConfig.firstRow + (this.layerConfig.offset == 0 ? 0 : 1)
    };
    this.getLastFullyVisibleRow = function() {
      if(!this.layerConfig) {
        return 0
      }return this.layerConfig.firstRow - 1 + Math.floor((this.layerConfig.height + this.layerConfig.offset) / this.layerConfig.lineHeight)
    };
    this.getLastVisibleRow = function() {
      return(this.layerConfig || {}).lastRow || 0
    };
    this.$padding = null;
    this.setPadding = function(o) {
      this.$padding = o;
      this.content.style.padding = "0 " + o + "px";
      this.$loop.schedule(this.CHANGE_FULL)
    };
    this.onScroll = function(o) {
      this.scrollToY(o.data)
    };
    this.$updateScrollBar = function() {
      this.scrollBar.setInnerHeight(this.doc.getLength() * this.lineHeight);
      this.scrollBar.setScrollTop(this.scrollTop)
    };
    this.$renderChanges = function(o) {
      if(!(!o || !this.doc || !this.$tokenizer)) {
        if(!this.layerConfig || o & this.CHANGE_FULL || o & this.CHANGE_SIZE || o & this.CHANGE_TEXT || o & this.CHANGE_LINES || o & this.CHANGE_SCROLL) {
          this.$computeLayerConfig()
        }if(o & this.CHANGE_FULL) {
          this.$textLayer.update(this.layerConfig);
          this.showGutter && this.$gutterLayer.update(this.layerConfig);
          this.$markerLayer.update(this.layerConfig);
          this.$cursorLayer.update(this.layerConfig);
          this.$updateScrollBar()
        }else {
          if(o & this.CHANGE_SCROLL) {
            o & this.CHANGE_TEXT || o & this.CHANGE_LINES ? this.$textLayer.scrollLines(this.layerConfig) : this.$textLayer.update(this.layerConfig);
            this.showGutter && this.$gutterLayer.update(this.layerConfig);
            this.$markerLayer.update(this.layerConfig);
            this.$cursorLayer.update(this.layerConfig);
            this.$updateScrollBar()
          }else {
            if(o & this.CHANGE_TEXT) {
              this.$textLayer.update(this.layerConfig);
              this.showGutter && this.$gutterLayer.update(this.layerConfig)
            }else {
              if(o & this.CHANGE_LINES) {
                this.$updateLines();
                this.$updateScrollBar()
              }else {
                if(o & this.CHANGE_SCROLL) {
                  this.$textLayer.scrollLines(this.layerConfig);
                  this.showGutter && this.$gutterLayer.update(this.layerConfig)
                }
              }
            }o & this.CHANGE_GUTTER && this.showGutter && this.$gutterLayer.update(this.layerConfig);
            o & this.CHANGE_CURSOR && this.$cursorLayer.update(this.layerConfig);
            o & this.CHANGE_MARKER && this.$markerLayer.update(this.layerConfig);
            o & this.CHANGE_SIZE && this.$updateScrollBar()
          }
        }
      }
    };
    this.$computeLayerConfig = function() {
      var o = this.scrollTop % this.lineHeight, w = this.$size.scrollerHeight + this.lineHeight, x = this.$getLongestLine(), B = !this.layerConfig ? true : this.layerConfig.width != x, E = Math.ceil(w / this.lineHeight), F = Math.max(0, Math.round((this.scrollTop - o) / this.lineHeight));
      E = Math.min(this.lines.length, F + E) - 1;
      this.layerConfig = {width:x, padding:this.$padding, firstRow:F, lastRow:E, lineHeight:this.lineHeight, characterWidth:this.characterWidth, minHeight:w, offset:o, height:this.$size.scrollerHeight};
      for(F = 0;F < this.layers.length;F++) {
        E = this.layers[F];
        if(B) {
          E.element.style.width = x + "px"
        }
      }this.$gutterLayer.element.style.marginTop = -o + "px";
      this.content.style.marginTop = -o + "px";
      this.content.style.width = x + "px";
      this.content.style.height = w + "px"
    };
    this.$updateLines = function() {
      var o = this.$changedLines.firstRow, w = this.$changedLines.lastRow;
      this.$changedLines = null;
      var x = this.layerConfig;
      if(x.width != this.$getLongestLine()) {
        return this.$textLayer.update(x)
      }if(!(o > x.lastRow + 1)) {
        if(!(w < x.firstRow)) {
          if(w === Infinity) {
            this.showGutter && this.$gutterLayer.update(x);
            this.$textLayer.update(x)
          }else {
            this.$textLayer.updateLines(x, o, w)
          }
        }
      }
    };
    this.$getLongestLine = function() {
      var o = this.doc.getScreenWidth();
      if(this.$showInvisibles) {
        o += 1
      }return Math.max(this.$size.scrollerWidth - this.$padding * 2, Math.round(o * this.characterWidth))
    };
    this.addMarker = function(o, w, x) {
      o = this.$markerLayer.addMarker(o, w, x);
      this.$loop.schedule(this.CHANGE_MARKER);
      return o
    };
    this.removeMarker = function(o) {
      this.$markerLayer.removeMarker(o);
      this.$loop.schedule(this.CHANGE_MARKER)
    };
    this.addGutterDecoration = function(o, w) {
      this.$gutterLayer.addGutterDecoration(o, w);
      this.$loop.schedule(this.CHANGE_GUTTER)
    };
    this.removeGutterDecoration = function(o, w) {
      this.$gutterLayer.removeGutterDecoration(o, w);
      this.$loop.schedule(this.CHANGE_GUTTER)
    };
    this.setBreakpoints = function(o) {
      this.$gutterLayer.setBreakpoints(o);
      this.$loop.schedule(this.CHANGE_GUTTER)
    };
    this.updateCursor = function(o, w) {
      this.$cursorLayer.setCursor(o, w);
      this.$loop.schedule(this.CHANGE_CURSOR)
    };
    this.hideCursor = function() {
      this.$cursorLayer.hideCursor()
    };
    this.showCursor = function() {
      this.$cursorLayer.showCursor()
    };
    this.scrollCursorIntoView = function() {
      var o = this.$cursorLayer.getPixelPosition(), w = o.left + this.$padding;
      o = o.top;
      this.getScrollTop() > o && this.scrollToY(o);
      this.getScrollTop() + this.$size.scrollerHeight < o + this.lineHeight && this.scrollToY(o + this.lineHeight - this.$size.scrollerHeight);
      this.scroller.scrollLeft > w && this.scrollToX(w);
      this.scroller.scrollLeft + this.$size.scrollerWidth < w + this.characterWidth && this.scrollToX(Math.round(w + this.characterWidth - this.$size.scrollerWidth))
    };
    this.getScrollTop = function() {
      return this.scrollTop
    };
    this.getScrollLeft = function() {
      return this.scroller.scrollLeft
    };
    this.getScrollTopRow = function() {
      return this.scrollTop / this.lineHeight
    };
    this.scrollToRow = function(o) {
      this.scrollToY(o * this.lineHeight)
    };
    this.scrollToY = function(o) {
      o = Math.max(0, Math.min(this.lines.length * this.lineHeight - this.$size.scrollerHeight, o));
      if(this.scrollTop !== o) {
        this.scrollTop = o;
        this.$loop.schedule(this.CHANGE_SCROLL)
      }
    };
    this.scrollToX = function(o) {
      if(o <= this.$padding) {
        o = 0
      }this.scroller.scrollLeft = o
    };
    this.scrollBy = function(o, w) {
      w && this.scrollToY(this.scrollTop + w);
      o && this.scrollToX(this.scroller.scrollLeft + o)
    };
    this.screenToTextCoordinates = function(o, w) {
      var x = this.scroller.getBoundingClientRect();
      o = Math.round((o + this.scroller.scrollLeft - x.left - this.$padding) / this.characterWidth);
      w = Math.floor((w + this.scrollTop - x.top) / this.lineHeight);
      return{row:w, column:this.doc.screenToDocumentColumn(Math.max(0, Math.min(w, this.doc.getLength() - 1)), o)}
    };
    this.textToScreenCoordinates = function(o, w) {
      var x = this.scroller.getBoundingClientRect();
      w = this.padding + Math.round(this.doc.documentToScreenColumn(o, w) * this.characterWidth);
      o = o * this.lineHeight;
      return{pageX:x.left + w - this.getScrollLeft(), pageY:x.top + o - this.getScrollTop()}
    };
    this.visualizeFocus = function() {
      k.addCssClass(this.container, "ace_focus")
    };
    this.visualizeBlur = function() {
      k.removeCssClass(this.container, "ace_focus")
    };
    this.showComposition = function() {
    };
    this.setCompositionText = function() {
    };
    this.hideComposition = function() {
    };
    this.setTheme = function(o) {
      function w(B) {
        x.$theme && k.removeCssClass(x.container, x.$theme);
        x.$theme = B ? B.cssClass : null;
        x.$theme && k.addCssClass(x.container, x.$theme);
        if(x.$size) {
          x.$size.width = 0;
          x.onResize()
        }
      }
      var x = this;
      if(!o || typeof o == "string") {
        o = o || "ace/theme/textmate";
        i([o], function(B) {
          w(B)
        })
      }else {
        w(o)
      }x = this
    }
  }).call(h.prototype);
  return h
});
define("ace/mode/doc_comment_highlight_rules", ["require", "exports", "module", "../lib/oop", "./text_highlight_rules"], function(i) {
  var h = i("../lib/oop");
  i = i("./text_highlight_rules");
  var e = function() {
    this.$rules = {start:[{token:"comment.doc", regex:"\\*\\/", next:"start"}, {token:"comment.doc.tag", regex:"@[\\w\\d_]+"}, {token:"comment.doc", regex:"s+"}, {token:"comment.doc", regex:"[^@\\*]+"}, {token:"comment.doc", regex:"."}]}
  };
  h.inherits(e, i);
  (function() {
    this.getStartRule = function(d) {
      return{token:"comment.doc", regex:"\\/\\*(?=\\*)", next:d}
    }
  }).call(e.prototype);
  return e
});
define("ace/mode/javascript_highlight_rules", ["require", "exports", "module", "../lib/oop", "../lib/lang", "./doc_comment_highlight_rules", "./text_highlight_rules"], function(i) {
  var h = i("../lib/oop"), e = i("../lib/lang"), d = i("./doc_comment_highlight_rules");
  i = i("./text_highlight_rules");
  JavaScriptHighlightRules = function() {
    var j = new d, c = e.arrayToMap("break|case|catch|continue|default|delete|do|else|finally|for|function|if|in|instanceof|new|return|switch|throw|try|typeof|var|while|with".split("|")), k = e.arrayToMap("true|false|null|undefined|Infinity|NaN|undefined".split("|")), a = e.arrayToMap("class|enum|extends|super|const|export|import|implements|let|private|public|yield|interface|package|protected|static".split("|"));
    this.$rules = {start:[{token:"comment", regex:"\\/\\/.*$"}, j.getStartRule("doc-start"), {token:"comment", regex:"\\/\\*", next:"comment"}, {token:"string.regexp", regex:"[/](?:(?:\\[(?:\\\\]|[^\\]])+\\])|(?:\\\\/|[^\\]/]))*[/][gimy]*\\s*(?=[).,;]|$)"}, {token:"string", regex:'["](?:(?:\\\\.)|(?:[^"\\\\]))*?["]'}, {token:"string", regex:'["].*\\\\$', next:"qqstring"}, {token:"string", regex:"['](?:(?:\\\\.)|(?:[^'\\\\]))*?[']"}, {token:"string", regex:"['].*\\\\$", next:"qstring"}, {token:"constant.numeric", 
    regex:"0[xX][0-9a-fA-F]+\\b"}, {token:"constant.numeric", regex:"[+-]?\\d+(?:(?:\\.\\d*)?(?:[eE][+-]?\\d+)?)?\\b"}, {token:function(f) {
      return f == "this" ? "variable.language" : c[f] ? "keyword" : k[f] ? "constant.language" : a[f] ? "invalid.illegal" : f == "debugger" ? "invalid.deprecated" : "identifier"
    }, regex:"[a-zA-Z_$][a-zA-Z0-9_$]*\\b"}, {token:"keyword.operator", regex:"!|\\$|%|&|\\*|\\-\\-|\\-|\\+\\+|\\+|~|===|==|=|!=|!==|<=|>=|<<=|>>=|>>>=|<>|<|>|!|&&|\\|\\||\\?\\:|\\*=|%=|\\+=|\\-=|&=|\\^=|\\b(in|instanceof|new|delete|typeof|void)"}, {token:"lparen", regex:"[\\[\\(\\{]"}, {token:"rparen", regex:"[\\]\\)\\}]"}, {token:"text", regex:"\\s+"}], comment:[{token:"comment", regex:".*?\\*\\/", next:"start"}, {token:"comment", regex:".+"}], qqstring:[{token:"string", regex:'(?:(?:\\\\.)|(?:[^"\\\\]))*?"', 
    next:"start"}, {token:"string", regex:".+"}], qstring:[{token:"string", regex:"(?:(?:\\\\.)|(?:[^'\\\\]))*?'", next:"start"}, {token:"string", regex:".+"}]};
    this.addRules(j.getRules(), "doc-");
    this.$rules["doc-start"][0].next = "start"
  };
  h.inherits(JavaScriptHighlightRules, i);
  return JavaScriptHighlightRules
});
define("ace/mode/matching_brace_outdent", ["require", "exports", "module", "../range"], function(i) {
  var h = i("../range");
  i = function() {
  };
  (function() {
    this.checkOutdent = function(e, d) {
      if(!/^\s+$/.test(e)) {
        return false
      }return/^\s*\}/.test(d)
    };
    this.autoOutdent = function(e, d) {
      var j = e.getLine(d).match(/^(\s*\})/);
      if(!j) {
        return 0
      }j = j[1].length;
      var c = e.findMatchingBracket({row:d, column:j});
      if(!c || c.row == d) {
        return 0
      }c = this.$getIndent(e.getLine(c.row));
      e.replace(new h(d, 0, d, j - 1), c);
      return c.length - (j - 1)
    };
    this.$getIndent = function(e) {
      if(e = e.match(/^(\s+)/)) {
        return e[1]
      }return""
    }
  }).call(i.prototype);
  return i
});
define("ace/mode/javascript", ["require", "exports", "module", "../lib/oop", "./text", "../tokenizer", "./javascript_highlight_rules", "./matching_brace_outdent", "../range"], function(i) {
  var h = i("../lib/oop"), e = i("./text"), d = i("../tokenizer"), j = i("./javascript_highlight_rules"), c = i("./matching_brace_outdent"), k = i("../range");
  i = function() {
    this.$tokenizer = new d((new j).getRules());
    this.$outdent = new c
  };
  h.inherits(i, e);
  (function() {
    this.toggleCommentLines = function(a, f, n) {
      var p = true;
      a = /^(\s*)\/\//;
      for(var b = n.start.row;b <= n.end.row;b++) {
        if(!a.test(f.getLine(b))) {
          p = false;
          break
        }
      }if(p) {
        p = new k(0, 0, 0, 0);
        for(b = n.start.row;b <= n.end.row;b++) {
          var g = f.getLine(b).replace(a, "$1");
          p.start.row = b;
          p.end.row = b;
          p.end.column = g.length + 2;
          f.replace(p, g)
        }return-2
      }else {
        return f.indentRows(n, "//")
      }
    };
    this.getNextLineIndent = function(a, f, n) {
      var p = this.$getIndent(f), b = this.$tokenizer.getLineTokens(f, a), g = b.tokens;
      b = b.state;
      if(g.length && g[g.length - 1].type == "comment") {
        return p
      }if(a == "start") {
        if(a = f.match(/^.*[\{\(\[]\s*$/)) {
          p += n
        }
      }else {
        if(a == "doc-start") {
          if(b == "start") {
            return""
          }if(a = f.match(/^\s*(\/?)\*/)) {
            if(a[1]) {
              p += " "
            }p += "* "
          }
        }
      }return p
    };
    this.checkOutdent = function(a, f, n) {
      return this.$outdent.checkOutdent(f, n)
    };
    this.autoOutdent = function(a, f, n) {
      return this.$outdent.autoOutdent(f, n)
    }
  }).call(i.prototype);
  return i
});
define("ace/theme/textmate", ["require", "exports", "module", "text!ace/theme/tm.css!.ace-tm .ace_editor {\n  border: 2px solid rgb(159, 159, 159);\n}\n\n.ace-tm .ace_editor.ace_focus {\n  border: 2px solid #327fbd;\n}\n\n.ace-tm .ace_gutter {\n  width: 50px;\n  background: #e8e8e8;\n  color: #333;\n  overflow : hidden;\n}\n\n.ace-tm .ace_gutter-layer {\n  width: 100%;\n  text-align: right;\n}\n\n.ace-tm .ace_gutter-layer .ace_gutter-cell {\n  padding-right: 6px;\n}\n\n.ace-tm .ace_editor .ace_printMargin {\n  width: 1px;\n  background: #e8e8e8;\n}\n\n.ace-tm .ace_text-layer {\n  cursor: text;\n}\n\n.ace-tm .ace_cursor {\n  border-left: 2px solid black;\n}\n\n.ace-tm .ace_cursor.ace_overwrite {\n  border-left: 0px;\n  border-bottom: 1px solid black;\n}\n        \n.ace-tm .ace_line .ace_invisible {\n  color: rgb(191, 191, 191);\n}\n\n.ace-tm .ace_line .ace_keyword {\n  color: blue;\n}\n\n.ace-tm .ace_line .ace_constant.ace_buildin {\n  color: rgb(88, 72, 246);\n}\n\n.ace-tm .ace_line .ace_constant.ace_library {\n  color: rgb(6, 150, 14);\n}\n\n.ace-tm .ace_line .ace_invalid {\n  background-color: rgb(153, 0, 0);\n  color: white;\n}\n\n.ace-tm .ace_line .ace_support.ace_function {\n  color: rgb(60, 76, 114);\n}\n\n.ace-tm .ace_line .ace_keyword.ace_operator {\n  color: rgb(104, 118, 135);\n}\n\n.ace-tm .ace_line .ace_string {\n  color: rgb(3, 106, 7);\n}\n\n.ace-tm .ace_line .ace_comment {\n  color: rgb(76, 136, 107);\n}\n\n.ace-tm .ace_line .ace_comment.ace_doc {\n  color: rgb(0, 102, 255);\n}\n\n.ace-tm .ace_line .ace_comment.ace_doc.ace_tag {\n  color: rgb(128, 159, 191);\n}\n\n.ace-tm .ace_line .ace_constant.ace_numeric {\n  color: rgb(0, 0, 205);\n}\n\n.ace-tm .ace_line .ace_variable {\n  color: rgb(49, 132, 149);\n}\n\n.ace-tm .ace_line .ace_xml_pe {\n  color: rgb(104, 104, 91);\n}\n\n.ace-tm .ace_marker-layer .ace_selection {\n  background: rgb(181, 213, 255);\n}\n\n.ace-tm .ace_marker-layer .ace_step {\n  background: rgb(252, 255, 0);\n}\n\n.ace-tm .ace_marker-layer .ace_stack {\n  background: rgb(164, 229, 101);\n}\n\n.ace-tm .ace_marker-layer .ace_bracket {\n  margin: -1px 0 0 -1px;\n  border: 1px solid rgb(192, 192, 192);\n}\n\n.ace-tm .ace_marker-layer .ace_active_line {\n  background: rgb(232, 242, 254);\n}\n\n.ace-tm .ace_string.ace_regex {\n  color: rgb(255, 0, 0)   \n}", 
"../lib/dom"], function(i, h, e, d) {
  i("../lib/dom").importCssString(d);
  return{cssClass:"ace-tm"}
});