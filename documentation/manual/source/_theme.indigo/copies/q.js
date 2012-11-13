(function(){
if (!window.qx) window.qx = {};
var qx = window.qx;

if (!qx.$$environment) qx.$$environment = {};
var envinfo = {"qx.application":"library.Application","qx.debug":false,"qx.debug.databinding":false,"qx.debug.dispose":false,"qx.optimization.variants":true,"qx.revision":"","qx.theme":"qx.theme.Modern","qx.version":"2.0"};
for (var k in envinfo) qx.$$environment[k] = envinfo[k];

qx.$$packageData = {};

qx.$$packageData['0']={"locales":{},"resources":{},"translations":{}};
if(!window.qx){
  window.qx = {
  };
};
qx.Bootstrap = {
  genericToString : function(){
    return "[Class " + this.classname + "]";
  },
  createNamespace : function(name, object){
    var splits = name.split(".");
    var parent = window;
    var part = splits[0];
    for(var i = 0,len = splits.length - 1;i < len;i++,part = splits[i]){
      if(!parent[part]){
        parent = parent[part] = {
        };
      } else {
        parent = parent[part];
      };
    };
    parent[part] = object;
    return part;
  },
  setDisplayName : function(fcn, classname, name){
    fcn.displayName = classname + "." + name + "()";
  },
  setDisplayNames : function(functionMap, classname){
    for(var name in functionMap){
      var value = functionMap[name];
      if(value instanceof Function){
        value.displayName = classname + "." + name + "()";
      };
    };
  },
  define : function(name, config){
    if(!config){
      var config = {
        statics : {
        }
      };
    };
    var clazz;
    var proto = null;
    qx.Bootstrap.setDisplayNames(config.statics, name);
    if(config.members || config.extend){
      qx.Bootstrap.setDisplayNames(config.members, name + ".prototype");
      clazz = config.construct || new Function;
      if(config.extend){
        this.extendClass(clazz, clazz, config.extend, name, basename);
      };
      var statics = config.statics || {
      };
      for(var i = 0,keys = qx.Bootstrap.getKeys(statics),l = keys.length;i < l;i++){
        var key = keys[i];
        clazz[key] = statics[key];
      };
      proto = clazz.prototype;
      var members = config.members || {
      };
      for(var i = 0,keys = qx.Bootstrap.getKeys(members),l = keys.length;i < l;i++){
        var key = keys[i];
        proto[key] = members[key];
      };
    } else {
      clazz = config.statics || {
      };
    };
    var basename = name ? this.createNamespace(name, clazz) : "";
    clazz.name = clazz.classname = name;
    clazz.basename = basename;
    clazz.$$type = "Class";
    if(!clazz.hasOwnProperty("toString")){
      clazz.toString = this.genericToString;
    };
    if(config.defer){
      config.defer(clazz, proto);
    };
    qx.Bootstrap.$$registry[name] = clazz;
    return clazz;
  }
};
qx.Bootstrap.define("qx.Bootstrap", {
  statics : {
    LOADSTART : qx.$$start || new Date(),
    DEBUG : (function(){
      var debug = true;
      if(qx.$$environment && qx.$$environment["qx.debug"] === false){
        debug = false;
      };
      return debug;
    })(),
    getEnvironmentSetting : function(key){
      if(qx.$$environment){
        return qx.$$environment[key];
      };
    },
    setEnvironmentSetting : function(key, value){
      if(!qx.$$environment){
        qx.$$environment = {
        };
      };
      if(qx.$$environment[key] === undefined){
        qx.$$environment[key] = value;
      };
    },
    createNamespace : qx.Bootstrap.createNamespace,
    define : qx.Bootstrap.define,
    setDisplayName : qx.Bootstrap.setDisplayName,
    setDisplayNames : qx.Bootstrap.setDisplayNames,
    genericToString : qx.Bootstrap.genericToString,
    extendClass : function(clazz, construct, superClass, name, basename){
      var superproto = superClass.prototype;
      var helper = new Function;
      helper.prototype = superproto;
      var proto = new helper;
      clazz.prototype = proto;
      proto.name = proto.classname = name;
      proto.basename = basename;
      construct.base = clazz.superclass = superClass;
      construct.self = clazz.constructor = proto.constructor = clazz;
    },
    getByName : function(name){
      return qx.Bootstrap.$$registry[name];
    },
    $$registry : {
    },
    objectGetLength : function(map){
      var length = 0;
      for(var key in map){
        length++;
      };
      return length;
    },
    objectMergeWith : function(target, source, overwrite){
      if(overwrite === undefined){
        overwrite = true;
      };
      for(var key in source){
        if(overwrite || target[key] === undefined){
          target[key] = source[key];
        };
      };
      return target;
    },
    __shadowedKeys : ["isPrototypeOf", "hasOwnProperty", "toLocaleString", "toString", "valueOf", "constructor"],
    getKeys : ({
      "ES5" : Object.keys,
      "BROKEN_IE" : function(map){
        var arr = [];
        var hasOwnProperty = Object.prototype.hasOwnProperty;
        for(var key in map){
          if(hasOwnProperty.call(map, key)){
            arr.push(key);
          };
        };
        var shadowedKeys = qx.Bootstrap.__shadowedKeys;
        for(var i = 0,a = shadowedKeys,l = a.length;i < l;i++){
          if(hasOwnProperty.call(map, a[i])){
            arr.push(a[i]);
          };
        };
        return arr;
      },
      "default" : function(map){
        var arr = [];
        var hasOwnProperty = Object.prototype.hasOwnProperty;
        for(var key in map){
          if(hasOwnProperty.call(map, key)){
            arr.push(key);
          };
        };
        return arr;
      }
    })[typeof (Object.keys) == "function" ? "ES5" : (function(){
      for(var key in {
        toString : 1
      }){
        return key;
      };
    })() !== "toString" ? "BROKEN_IE" : "default"],
    getKeysAsString : function(map){
      var keys = qx.Bootstrap.getKeys(map);
      if(keys.length == 0){
        return "";
      };
      return '"' + keys.join('\", "') + '"';
    },
    __classToTypeMap : {
      "[object String]" : "String",
      "[object Array]" : "Array",
      "[object Object]" : "Object",
      "[object RegExp]" : "RegExp",
      "[object Number]" : "Number",
      "[object Boolean]" : "Boolean",
      "[object Date]" : "Date",
      "[object Function]" : "Function",
      "[object Error]" : "Error"
    },
    bind : function(func, self, varargs){
      var fixedArgs = Array.prototype.slice.call(arguments, 2, arguments.length);
      return function(){
        var args = Array.prototype.slice.call(arguments, 0, arguments.length);
        return func.apply(self, fixedArgs.concat(args));
      };
    },
    firstUp : function(str){
      return str.charAt(0).toUpperCase() + str.substr(1);
    },
    firstLow : function(str){
      return str.charAt(0).toLowerCase() + str.substr(1);
    },
    getClass : function(value){
      var classString = Object.prototype.toString.call(value);
      return (qx.Bootstrap.__classToTypeMap[classString] || classString.slice(8, -1));
    },
    isString : function(value){
      return (value !== null && (typeof value === "string" || qx.Bootstrap.getClass(value) == "String" || value instanceof String || (!!value && !!value.$$isString)));
    },
    isArray : function(value){
      return (value !== null && (value instanceof Array || (value && qx.data && qx.data.IListData && qx.util.OOUtil.hasInterface(value.constructor, qx.data.IListData)) || qx.Bootstrap.getClass(value) == "Array" || (!!value && !!value.$$isArray)));
    },
    isObject : function(value){
      return (value !== undefined && value !== null && qx.Bootstrap.getClass(value) == "Object");
    },
    isFunction : function(value){
      return qx.Bootstrap.getClass(value) == "Function";
    },
    $$logs : [],
    debug : function(object, message){
      qx.Bootstrap.$$logs.push(["debug", arguments]);
    },
    info : function(object, message){
      qx.Bootstrap.$$logs.push(["info", arguments]);
    },
    warn : function(object, message){
      qx.Bootstrap.$$logs.push(["warn", arguments]);
    },
    error : function(object, message){
      qx.Bootstrap.$$logs.push(["error", arguments]);
    },
    trace : function(object){
    }
  }
});
qx.Bootstrap.define("q", {
  statics : {
    init : null,
    attach : null,
    attachStatic : null,
    attachInit : null,
    define : null
  }
});
(function(){
  q = function(selector, context){
    return q.init(qx.bom.Selector.query(selector, context));
  };
  q.__init = [];
  q.init = function(arg){
    var col = qx.lang.Array.cast(arg, qx.Collection);
    for(var i = 0;i < q.__init.length;i++){
      q.__init[i].call(col);
    };
    return col;
  };
  q.attach = function(module){
    for(var name in module){
      {
      };
      qx.Collection.prototype[name] = module[name];
    };
  };
  q.attachStatic = function(module){
    for(var name in module){
      {
      };
      q[name] = module[name];
    };
  };
  q.attachInit = function(init){
    this.__init.push(init);
  };
  q.define = function(name, config){
    if(config == undefined){
      config = name;
      name = null;
    };
    return qx.Bootstrap.define.call(qx.Bootstrap, name, config);
  };
})();
qx.Bootstrap.define("qx.bom.Selector", {
  statics : {
    query : null,
    matches : null
  }
});
(function(){
  var chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,done = 0,toString = Object.prototype.toString,hasDuplicate = false,baseHasDuplicate = true,rBackslash = /\\/g,rNonWord = /\W/;
  [0, 0].sort(function(){
    baseHasDuplicate = false;
    return 0;
  });
  var Sizzle = function(selector, context, results, seed){
    results = results || [];
    context = context || document;
    var origContext = context;
    if(context.nodeType !== 1 && context.nodeType !== 9){
      return [];
    };
    if(!selector || typeof selector !== "string"){
      return results;
    };
    var m,set,checkSet,extra,ret,cur,pop,i,prune = true,contextXML = Sizzle.isXML(context),parts = [],soFar = selector;
    do {
      chunker.exec("");
      m = chunker.exec(soFar);
      if(m){
        soFar = m[3];
        parts.push(m[1]);
        if(m[2]){
          extra = m[3];
          break;
        };
      };
    }while(m);
    if(parts.length > 1 && origPOS.exec(selector)){
      if(parts.length === 2 && Expr.relative[parts[0]]){
        set = posProcess(parts[0] + parts[1], context);
      } else {
        set = Expr.relative[parts[0]] ? [context] : Sizzle(parts.shift(), context);
        while(parts.length){
          selector = parts.shift();
          if(Expr.relative[selector]){
            selector += parts.shift();
          };
          set = posProcess(selector, set);
        };
      };
    } else {
      if(!seed && parts.length > 1 && context.nodeType === 9 && !contextXML && Expr.match.ID.test(parts[0]) && !Expr.match.ID.test(parts[parts.length - 1])){
        ret = Sizzle.find(parts.shift(), context, contextXML);
        context = ret.expr ? Sizzle.filter(ret.expr, ret.set)[0] : ret.set[0];
      };
      if(context){
        ret = seed ? {
          expr : parts.pop(),
          set : makeArray(seed)
        } : Sizzle.find(parts.pop(), parts.length === 1 && (parts[0] === "~" || parts[0] === "+") && context.parentNode ? context.parentNode : context, contextXML);
        set = ret.expr ? Sizzle.filter(ret.expr, ret.set) : ret.set;
        if(parts.length > 0){
          checkSet = makeArray(set);
        } else {
          prune = false;
        };
        while(parts.length){
          cur = parts.pop();
          pop = cur;
          if(!Expr.relative[cur]){
            cur = "";
          } else {
            pop = parts.pop();
          };
          if(pop == null){
            pop = context;
          };
          Expr.relative[cur](checkSet, pop, contextXML);
        };
      } else {
        checkSet = parts = [];
      };
    };
    if(!checkSet){
      checkSet = set;
    };
    if(!checkSet){
      Sizzle.error(cur || selector);
    };
    if(toString.call(checkSet) === "[object Array]"){
      if(!prune){
        results.push.apply(results, checkSet);
      } else if(context && context.nodeType === 1){
        for(i = 0;checkSet[i] != null;i++){
          if(checkSet[i] && (checkSet[i] === true || checkSet[i].nodeType === 1 && Sizzle.contains(context, checkSet[i]))){
            results.push(set[i]);
          };
        };
      } else {
        for(i = 0;checkSet[i] != null;i++){
          if(checkSet[i] && checkSet[i].nodeType === 1){
            results.push(set[i]);
          };
        };
      };
    } else {
      makeArray(checkSet, results);
    };
    if(extra){
      Sizzle(extra, origContext, results, seed);
      Sizzle.uniqueSort(results);
    };
    return results;
  };
  Sizzle.uniqueSort = function(results){
    if(sortOrder){
      hasDuplicate = baseHasDuplicate;
      results.sort(sortOrder);
      if(hasDuplicate){
        for(var i = 1;i < results.length;i++){
          if(results[i] === results[i - 1]){
            results.splice(i--, 1);
          };
        };
      };
    };
    return results;
  };
  Sizzle.matches = function(expr, set){
    return Sizzle(expr, null, null, set);
  };
  Sizzle.matchesSelector = function(node, expr){
    return Sizzle(expr, null, null, [node]).length > 0;
  };
  Sizzle.find = function(expr, context, isXML){
    var set;
    if(!expr){
      return [];
    };
    for(var i = 0,l = Expr.order.length;i < l;i++){
      var match,type = Expr.order[i];
      if((match = Expr.leftMatch[type].exec(expr))){
        var left = match[1];
        match.splice(1, 1);
        if(left.substr(left.length - 1) !== "\\"){
          match[1] = (match[1] || "").replace(rBackslash, "");
          set = Expr.find[type](match, context, isXML);
          if(set != null){
            expr = expr.replace(Expr.match[type], "");
            break;
          };
        };
      };
    };
    if(!set){
      set = typeof context.getElementsByTagName !== "undefined" ? context.getElementsByTagName("*") : [];
    };
    return {
      set : set,
      expr : expr
    };
  };
  Sizzle.filter = function(expr, set, inplace, not){
    var match,anyFound,old = expr,result = [],curLoop = set,isXMLFilter = set && set[0] && Sizzle.isXML(set[0]);
    while(expr && set.length){
      for(var type in Expr.filter){
        if((match = Expr.leftMatch[type].exec(expr)) != null && match[2]){
          var found,item,filter = Expr.filter[type],left = match[1];
          anyFound = false;
          match.splice(1, 1);
          if(left.substr(left.length - 1) === "\\"){
            continue;
          };
          if(curLoop === result){
            result = [];
          };
          if(Expr.preFilter[type]){
            match = Expr.preFilter[type](match, curLoop, inplace, result, not, isXMLFilter);
            if(!match){
              anyFound = found = true;
            } else if(match === true){
              continue;
            };
          };
          if(match){
            for(var i = 0;(item = curLoop[i]) != null;i++){
              if(item){
                found = filter(item, match, i, curLoop);
                var pass = not ^ !!found;
                if(inplace && found != null){
                  if(pass){
                    anyFound = true;
                  } else {
                    curLoop[i] = false;
                  };
                } else if(pass){
                  result.push(item);
                  anyFound = true;
                };
              };
            };
          };
          if(found !== undefined){
            if(!inplace){
              curLoop = result;
            };
            expr = expr.replace(Expr.match[type], "");
            if(!anyFound){
              return [];
            };
            break;
          };
        };
      };
      if(expr === old){
        if(anyFound == null){
          Sizzle.error(expr);
        } else {
          break;
        };
      };
      old = expr;
    };
    return curLoop;
  };
  Sizzle.error = function(msg){
    throw "Syntax error, unrecognized expression: " + msg;
  };
  var Expr = Sizzle.selectors = {
    order : ["ID", "NAME", "TAG"],
    match : {
      ID : /#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
      CLASS : /\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
      NAME : /\[name=['"]*((?:[\w\u00c0-\uFFFF\-]|\\.)+)['"]*\]/,
      ATTR : /\[\s*((?:[\w\u00c0-\uFFFF\-]|\\.)+)\s*(?:(\S?=)\s*(?:(['"])(.*?)\3|(#?(?:[\w\u00c0-\uFFFF\-]|\\.)*)|)|)\s*\]/,
      TAG : /^((?:[\w\u00c0-\uFFFF\*\-]|\\.)+)/,
      CHILD : /:(only|nth|last|first)-child(?:\(\s*(even|odd|(?:[+\-]?\d+|(?:[+\-]?\d*)?n\s*(?:[+\-]\s*\d+)?))\s*\))?/,
      POS : /:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^\-]|$)/,
      PSEUDO : /:((?:[\w\u00c0-\uFFFF\-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/
    },
    leftMatch : {
    },
    attrMap : {
      "class" : "className",
      "for" : "htmlFor"
    },
    attrHandle : {
      href : function(elem){
        return elem.getAttribute("href");
      },
      type : function(elem){
        return elem.getAttribute("type");
      }
    },
    relative : {
      "+" : function(checkSet, part){
        var isPartStr = typeof part === "string",isTag = isPartStr && !rNonWord.test(part),isPartStrNotTag = isPartStr && !isTag;
        if(isTag){
          part = part.toLowerCase();
        };
        for(var i = 0,l = checkSet.length,elem;i < l;i++){
          if((elem = checkSet[i])){
            while((elem = elem.previousSibling) && elem.nodeType !== 1){
            };
            checkSet[i] = isPartStrNotTag || elem && elem.nodeName.toLowerCase() === part ? elem || false : elem === part;
          };
        };
        if(isPartStrNotTag){
          Sizzle.filter(part, checkSet, true);
        };
      },
      ">" : function(checkSet, part){
        var elem,isPartStr = typeof part === "string",i = 0,l = checkSet.length;
        if(isPartStr && !rNonWord.test(part)){
          part = part.toLowerCase();
          for(;i < l;i++){
            elem = checkSet[i];
            if(elem){
              var parent = elem.parentNode;
              checkSet[i] = parent.nodeName.toLowerCase() === part ? parent : false;
            };
          };
        } else {
          for(;i < l;i++){
            elem = checkSet[i];
            if(elem){
              checkSet[i] = isPartStr ? elem.parentNode : elem.parentNode === part;
            };
          };
          if(isPartStr){
            Sizzle.filter(part, checkSet, true);
          };
        };
      },
      "" : function(checkSet, part, isXML){
        var nodeCheck,doneName = done++,checkFn = dirCheck;
        if(typeof part === "string" && !rNonWord.test(part)){
          part = part.toLowerCase();
          nodeCheck = part;
          checkFn = dirNodeCheck;
        };
        checkFn("parentNode", part, doneName, checkSet, nodeCheck, isXML);
      },
      "~" : function(checkSet, part, isXML){
        var nodeCheck,doneName = done++,checkFn = dirCheck;
        if(typeof part === "string" && !rNonWord.test(part)){
          part = part.toLowerCase();
          nodeCheck = part;
          checkFn = dirNodeCheck;
        };
        checkFn("previousSibling", part, doneName, checkSet, nodeCheck, isXML);
      }
    },
    find : {
      ID : function(match, context, isXML){
        if(typeof context.getElementById !== "undefined" && !isXML){
          var m = context.getElementById(match[1]);
          return m && m.parentNode ? [m] : [];
        };
      },
      NAME : function(match, context){
        if(typeof context.getElementsByName !== "undefined"){
          var ret = [],results = context.getElementsByName(match[1]);
          for(var i = 0,l = results.length;i < l;i++){
            if(results[i].getAttribute("name") === match[1]){
              ret.push(results[i]);
            };
          };
          return ret.length === 0 ? null : ret;
        };
      },
      TAG : function(match, context){
        if(typeof context.getElementsByTagName !== "undefined"){
          return context.getElementsByTagName(match[1]);
        };
      }
    },
    preFilter : {
      CLASS : function(match, curLoop, inplace, result, not, isXML){
        match = " " + match[1].replace(rBackslash, "") + " ";
        if(isXML){
          return match;
        };
        for(var i = 0,elem;(elem = curLoop[i]) != null;i++){
          if(elem){
            if(not ^ (elem.className && (" " + elem.className + " ").replace(/[\t\n\r]/g, " ").indexOf(match) >= 0)){
              if(!inplace){
                result.push(elem);
              };
            } else if(inplace){
              curLoop[i] = false;
            };
          };
        };
        return false;
      },
      ID : function(match){
        return match[1].replace(rBackslash, "");
      },
      TAG : function(match, curLoop){
        return match[1].replace(rBackslash, "").toLowerCase();
      },
      CHILD : function(match){
        if(match[1] === "nth"){
          if(!match[2]){
            Sizzle.error(match[0]);
          };
          match[2] = match[2].replace(/^\+|\s*/g, '');
          var test = /(-?)(\d*)(?:n([+\-]?\d*))?/.exec(match[2] === "even" && "2n" || match[2] === "odd" && "2n+1" || !/\D/.test(match[2]) && "0n+" + match[2] || match[2]);
          match[2] = (test[1] + (test[2] || 1)) - 0;
          match[3] = test[3] - 0;
        } else if(match[2]){
          Sizzle.error(match[0]);
        };
        match[0] = done++;
        return match;
      },
      ATTR : function(match, curLoop, inplace, result, not, isXML){
        var name = match[1] = match[1].replace(rBackslash, "");
        if(!isXML && Expr.attrMap[name]){
          match[1] = Expr.attrMap[name];
        };
        match[4] = (match[4] || match[5] || "").replace(rBackslash, "");
        if(match[2] === "~="){
          match[4] = " " + match[4] + " ";
        };
        return match;
      },
      PSEUDO : function(match, curLoop, inplace, result, not){
        if(match[1] === "not"){
          if((chunker.exec(match[3]) || "").length > 1 || /^\w/.test(match[3])){
            match[3] = Sizzle(match[3], null, null, curLoop);
          } else {
            var ret = Sizzle.filter(match[3], curLoop, inplace, true ^ not);
            if(!inplace){
              result.push.apply(result, ret);
            };
            return false;
          };
        } else if(Expr.match.POS.test(match[0]) || Expr.match.CHILD.test(match[0])){
          return true;
        };
        return match;
      },
      POS : function(match){
        match.unshift(true);
        return match;
      }
    },
    filters : {
      enabled : function(elem){
        return elem.disabled === false && elem.type !== "hidden";
      },
      disabled : function(elem){
        return elem.disabled === true;
      },
      checked : function(elem){
        return elem.checked === true;
      },
      selected : function(elem){
        if(elem.parentNode){
          elem.parentNode.selectedIndex;
        };
        return elem.selected === true;
      },
      parent : function(elem){
        return !!elem.firstChild;
      },
      empty : function(elem){
        return !elem.firstChild;
      },
      has : function(elem, i, match){
        return !!Sizzle(match[3], elem).length;
      },
      header : function(elem){
        return (/h\d/i).test(elem.nodeName);
      },
      text : function(elem){
        return "text" === elem.getAttribute('type');
      },
      radio : function(elem){
        return "radio" === elem.type;
      },
      checkbox : function(elem){
        return "checkbox" === elem.type;
      },
      file : function(elem){
        return "file" === elem.type;
      },
      password : function(elem){
        return "password" === elem.type;
      },
      submit : function(elem){
        return "submit" === elem.type;
      },
      image : function(elem){
        return "image" === elem.type;
      },
      reset : function(elem){
        return "reset" === elem.type;
      },
      button : function(elem){
        return "button" === elem.type || elem.nodeName.toLowerCase() === "button";
      },
      input : function(elem){
        return (/input|select|textarea|button/i).test(elem.nodeName);
      }
    },
    setFilters : {
      first : function(elem, i){
        return i === 0;
      },
      last : function(elem, i, match, array){
        return i === array.length - 1;
      },
      even : function(elem, i){
        return i % 2 === 0;
      },
      odd : function(elem, i){
        return i % 2 === 1;
      },
      lt : function(elem, i, match){
        return i < match[3] - 0;
      },
      gt : function(elem, i, match){
        return i > match[3] - 0;
      },
      nth : function(elem, i, match){
        return match[3] - 0 === i;
      },
      eq : function(elem, i, match){
        return match[3] - 0 === i;
      }
    },
    filter : {
      PSEUDO : function(elem, match, i, array){
        var name = match[1],filter = Expr.filters[name];
        if(filter){
          return filter(elem, i, match, array);
        } else if(name === "contains"){
          return (elem.textContent || elem.innerText || Sizzle.getText([elem]) || "").indexOf(match[3]) >= 0;
        } else if(name === "not"){
          var not = match[3];
          for(var j = 0,l = not.length;j < l;j++){
            if(not[j] === elem){
              return false;
            };
          };
          return true;
        } else {
          Sizzle.error(name);
        };;
      },
      CHILD : function(elem, match){
        var type = match[1],node = elem;
        switch(type){case "only":case "first":        while((node = node.previousSibling)){
          if(node.nodeType === 1){
            return false;
          };
        };
        if(type === "first"){
          return true;
        };
        node = elem;case "last":        while((node = node.nextSibling)){
          if(node.nodeType === 1){
            return false;
          };
        };
        return true;case "nth":        var first = match[2],last = match[3];
        if(first === 1 && last === 0){
          return true;
        };
        var doneName = match[0],parent = elem.parentNode;
        if(parent && (parent.sizcache !== doneName || !elem.nodeIndex)){
          var count = 0;
          for(node = parent.firstChild;node;node = node.nextSibling){
            if(node.nodeType === 1){
              node.nodeIndex = ++count;
            };
          };
          parent.sizcache = doneName;
        };
        var diff = elem.nodeIndex - last;
        if(first === 0){
          return diff === 0;
        } else {
          return (diff % first === 0 && diff / first >= 0);
        };};
      },
      ID : function(elem, match){
        return elem.nodeType === 1 && elem.getAttribute("id") === match;
      },
      TAG : function(elem, match){
        return (match === "*" && elem.nodeType === 1) || elem.nodeName.toLowerCase() === match;
      },
      CLASS : function(elem, match){
        return (" " + (elem.className || elem.getAttribute("class")) + " ").indexOf(match) > -1;
      },
      ATTR : function(elem, match){
        var name = match[1],result = Expr.attrHandle[name] ? Expr.attrHandle[name](elem) : elem[name] != null ? elem[name] : elem.getAttribute(name),value = result + "",type = match[2],check = match[4];
        return result == null ? type === "!=" : type === "=" ? value === check : type === "*=" ? value.indexOf(check) >= 0 : type === "~=" ? (" " + value + " ").indexOf(check) >= 0 : !check ? value && result !== false : type === "!=" ? value !== check : type === "^=" ? value.indexOf(check) === 0 : type === "$=" ? value.substr(value.length - check.length) === check : type === "|=" ? value === check || value.substr(0, check.length + 1) === check + "-" : false;
      },
      POS : function(elem, match, i, array){
        var name = match[2],filter = Expr.setFilters[name];
        if(filter){
          return filter(elem, i, match, array);
        };
      }
    }
  };
  var origPOS = Expr.match.POS,fescape = function(all, num){
    return "\\" + (num - 0 + 1);
  };
  for(var type in Expr.match){
    Expr.match[type] = new RegExp(Expr.match[type].source + (/(?![^\[]*\])(?![^\(]*\))/.source));
    Expr.leftMatch[type] = new RegExp(/(^(?:.|\r|\n)*?)/.source + Expr.match[type].source.replace(/\\(\d+)/g, fescape));
  };
  var makeArray = function(array, results){
    array = Array.prototype.slice.call(array, 0);
    if(results){
      results.push.apply(results, array);
      return results;
    };
    return array;
  };
  try{
    Array.prototype.slice.call(document.documentElement.childNodes, 0)[0].nodeType;
  } catch(e) {
    makeArray = function(array, results){
      var i = 0,ret = results || [];
      if(toString.call(array) === "[object Array]"){
        Array.prototype.push.apply(ret, array);
      } else {
        if(typeof array.length === "number"){
          for(var l = array.length;i < l;i++){
            ret.push(array[i]);
          };
        } else {
          for(;array[i];i++){
            ret.push(array[i]);
          };
        };
      };
      return ret;
    };
  };
  var sortOrder,siblingCheck;
  if(document.documentElement.compareDocumentPosition){
    sortOrder = function(a, b){
      if(a === b){
        hasDuplicate = true;
        return 0;
      };
      if(!a.compareDocumentPosition || !b.compareDocumentPosition){
        return a.compareDocumentPosition ? -1 : 1;
      };
      return a.compareDocumentPosition(b) & 4 ? -1 : 1;
    };
  } else {
    sortOrder = function(a, b){
      var al,bl,ap = [],bp = [],aup = a.parentNode,bup = b.parentNode,cur = aup;
      if(a === b){
        hasDuplicate = true;
        return 0;
      } else if(aup === bup){
        return siblingCheck(a, b);
      } else if(!aup){
        return -1;
      } else if(!bup){
        return 1;
      };;;
      while(cur){
        ap.unshift(cur);
        cur = cur.parentNode;
      };
      cur = bup;
      while(cur){
        bp.unshift(cur);
        cur = cur.parentNode;
      };
      al = ap.length;
      bl = bp.length;
      for(var i = 0;i < al && i < bl;i++){
        if(ap[i] !== bp[i]){
          return siblingCheck(ap[i], bp[i]);
        };
      };
      return i === al ? siblingCheck(a, bp[i], -1) : siblingCheck(ap[i], b, 1);
    };
    siblingCheck = function(a, b, ret){
      if(a === b){
        return ret;
      };
      var cur = a.nextSibling;
      while(cur){
        if(cur === b){
          return -1;
        };
        cur = cur.nextSibling;
      };
      return 1;
    };
  };
  Sizzle.getText = function(elems){
    var ret = "",elem;
    for(var i = 0;elems[i];i++){
      elem = elems[i];
      if(elem.nodeType === 3 || elem.nodeType === 4){
        ret += elem.nodeValue;
      } else if(elem.nodeType !== 8){
        ret += Sizzle.getText(elem.childNodes);
      };
    };
    return ret;
  };
  (function(){
    var form = document.createElement("div"),id = "script" + (new Date()).getTime(),root = document.documentElement;
    form.innerHTML = "<a name='" + id + "'/>";
    root.insertBefore(form, root.firstChild);
    if(document.getElementById(id)){
      Expr.find.ID = function(match, context, isXML){
        if(typeof context.getElementById !== "undefined" && !isXML){
          var m = context.getElementById(match[1]);
          return m ? m.id === match[1] || typeof m.getAttributeNode !== "undefined" && m.getAttributeNode("id").nodeValue === match[1] ? [m] : undefined : [];
        };
      };
      Expr.filter.ID = function(elem, match){
        var node = typeof elem.getAttributeNode !== "undefined" && elem.getAttributeNode("id");
        return elem.nodeType === 1 && node && node.nodeValue === match;
      };
    };
    root.removeChild(form);
    root = form = null;
  })();
  (function(){
    var div = document.createElement("div");
    div.appendChild(document.createComment(""));
    if(div.getElementsByTagName("*").length > 0){
      Expr.find.TAG = function(match, context){
        var results = context.getElementsByTagName(match[1]);
        if(match[1] === "*"){
          var tmp = [];
          for(var i = 0;results[i];i++){
            if(results[i].nodeType === 1){
              tmp.push(results[i]);
            };
          };
          results = tmp;
        };
        return results;
      };
    };
    div.innerHTML = "<a href='#'></a>";
    if(div.firstChild && typeof div.firstChild.getAttribute !== "undefined" && div.firstChild.getAttribute("href") !== "#"){
      Expr.attrHandle.href = function(elem){
        return elem.getAttribute("href", 2);
      };
    };
    div = null;
  })();
  if(document.querySelectorAll){
    (function(){
      var oldSizzle = Sizzle,div = document.createElement("div"),id = "__sizzle__";
      div.innerHTML = "<p class='TEST'></p>";
      if(div.querySelectorAll && div.querySelectorAll(".TEST").length === 0){
        return;
      };
      Sizzle = function(query, context, extra, seed){
        context = context || document;
        if(!seed && !Sizzle.isXML(context)){
          var match = /^(\w+$)|^\.([\w\-]+$)|^#([\w\-]+$)/.exec(query);
          if(match && (context.nodeType === 1 || context.nodeType === 9)){
            if(match[1]){
              return makeArray(context.getElementsByTagName(query), extra);
            } else if(match[2] && Expr.find.CLASS && context.getElementsByClassName){
              return makeArray(context.getElementsByClassName(match[2]), extra);
            };
          };
          if(context.nodeType === 9){
            if(query === "body" && context.body){
              return makeArray([context.body], extra);
            } else if(match && match[3]){
              var elem = context.getElementById(match[3]);
              if(elem && elem.parentNode){
                if(elem.id === match[3]){
                  return makeArray([elem], extra);
                };
              } else {
                return makeArray([], extra);
              };
            };
            try{
              return makeArray(context.querySelectorAll(query), extra);
            } catch(qsaError) {
            };
          } else if(context.nodeType === 1 && context.nodeName.toLowerCase() !== "object"){
            var oldContext = context,old = context.getAttribute("id"),nid = old || id,hasParent = context.parentNode,relativeHierarchySelector = /^\s*[+~]/.test(query);
            if(!old){
              context.setAttribute("id", nid);
            } else {
              nid = nid.replace(/'/g, "\\$&");
            };
            if(relativeHierarchySelector && hasParent){
              context = context.parentNode;
            };
            try{
              if(!relativeHierarchySelector || hasParent){
                return makeArray(context.querySelectorAll("[id='" + nid + "'] " + query), extra);
              };
            } catch(pseudoError) {
            }finally{
              if(!old){
                oldContext.removeAttribute("id");
              };
            };
          };
        };
        return oldSizzle(query, context, extra, seed);
      };
      for(var prop in oldSizzle){
        Sizzle[prop] = oldSizzle[prop];
      };
      div = null;
    })();
  };
  (function(){
    var html = document.documentElement,matches = html.matchesSelector || html.mozMatchesSelector || html.webkitMatchesSelector || html.msMatchesSelector,pseudoWorks = false;
    try{
      matches.call(document.documentElement, "[test!='']:sizzle");
    } catch(pseudoError) {
      pseudoWorks = true;
    };
    if(matches){
      Sizzle.matchesSelector = function(node, expr){
        expr = expr.replace(/\=\s*([^'"\]]*)\s*\]/g, "='$1']");
        if(!Sizzle.isXML(node)){
          try{
            if(pseudoWorks || !Expr.match.PSEUDO.test(expr) && !/!=/.test(expr)){
              return matches.call(node, expr);
            };
          } catch(e) {
          };
        };
        return Sizzle(expr, null, null, [node]).length > 0;
      };
    };
  })();
  (function(){
    var div = document.createElement("div");
    div.innerHTML = "<div class='test e'></div><div class='test'></div>";
    if(!div.getElementsByClassName || div.getElementsByClassName("e").length === 0){
      return;
    };
    div.lastChild.className = "e";
    if(div.getElementsByClassName("e").length === 1){
      return;
    };
    Expr.order.splice(1, 0, "CLASS");
    Expr.find.CLASS = function(match, context, isXML){
      if(typeof context.getElementsByClassName !== "undefined" && !isXML){
        return context.getElementsByClassName(match[1]);
      };
    };
    div = null;
  })();
  function dirNodeCheck(dir, cur, doneName, checkSet, nodeCheck, isXML){
    for(var i = 0,l = checkSet.length;i < l;i++){
      var elem = checkSet[i];
      if(elem){
        var match = false;
        elem = elem[dir];
        while(elem){
          if(elem.sizcache === doneName){
            match = checkSet[elem.sizset];
            break;
          };
          if(elem.nodeType === 1 && !isXML){
            elem.sizcache = doneName;
            elem.sizset = i;
          };
          if(elem.nodeName.toLowerCase() === cur){
            match = elem;
            break;
          };
          elem = elem[dir];
        };
        checkSet[i] = match;
      };
    };
  };
  function dirCheck(dir, cur, doneName, checkSet, nodeCheck, isXML){
    for(var i = 0,l = checkSet.length;i < l;i++){
      var elem = checkSet[i];
      if(elem){
        var match = false;
        elem = elem[dir];
        while(elem){
          if(elem.sizcache === doneName){
            match = checkSet[elem.sizset];
            break;
          };
          if(elem.nodeType === 1){
            if(!isXML){
              elem.sizcache = doneName;
              elem.sizset = i;
            };
            if(typeof cur !== "string"){
              if(elem === cur){
                match = true;
                break;
              };
            } else if(Sizzle.filter(cur, [elem]).length > 0){
              match = elem;
              break;
            };
          };
          elem = elem[dir];
        };
        checkSet[i] = match;
      };
    };
  };
  if(document.documentElement.contains){
    Sizzle.contains = function(a, b){
      return a !== b && (a.contains ? a.contains(b) : true);
    };
  } else if(document.documentElement.compareDocumentPosition){
    Sizzle.contains = function(a, b){
      return !!(a.compareDocumentPosition(b) & 16);
    };
  } else {
    Sizzle.contains = function(){
      return false;
    };
  };
  Sizzle.isXML = function(elem){
    var documentElement = (elem ? elem.ownerDocument || elem : 0).documentElement;
    return documentElement ? documentElement.nodeName !== "HTML" : false;
  };
  var posProcess = function(selector, context){
    var match,tmpSet = [],later = "",root = context.nodeType ? [context] : context;
    while((match = Expr.match.PSEUDO.exec(selector))){
      later += match[0];
      selector = selector.replace(Expr.match.PSEUDO, "");
    };
    selector = Expr.relative[selector] ? selector + "*" : selector;
    for(var i = 0,l = root.length;i < l;i++){
      Sizzle(selector, root[i], tmpSet);
    };
    return Sizzle.filter(later, tmpSet);
  };
  var Selector = qx.bom.Selector;
  Selector.query = function(selector, context){
    return Sizzle(selector, context);
  };
  Selector.matches = function(selector, set){
    return Sizzle(selector, null, null, set);
  };
})();
qx.Bootstrap.define("qx.lang.Array", {
  statics : {
    toArray : function(object, offset){
      return this.cast(object, Array, offset);
    },
    cast : function(object, constructor, offset){
      if(object.constructor === constructor){
        return object;
      };
      if(qx.data && qx.data.IListData){
        if(qx.Class && qx.Class.hasInterface(object, qx.data.IListData)){
          var object = object.toArray();
        };
      };
      var ret = new constructor;
      if((qx.core.Environment.get("engine.name") == "mshtml")){
        if(object.item){
          for(var i = offset || 0,l = object.length;i < l;i++){
            ret.push(object[i]);
          };
          return ret;
        };
      };
      if(Object.prototype.toString.call(object) === "[object Array]" && offset == null){
        ret.push.apply(ret, object);
      } else {
        ret.push.apply(ret, Array.prototype.slice.call(object, offset || 0));
      };
      return ret;
    },
    fromArguments : function(args, offset){
      return Array.prototype.slice.call(args, offset || 0);
    },
    fromCollection : function(coll){
      if((qx.core.Environment.get("engine.name") == "mshtml")){
        if(coll.item){
          var arr = [];
          for(var i = 0,l = coll.length;i < l;i++){
            arr[i] = coll[i];
          };
          return arr;
        };
      };
      return Array.prototype.slice.call(coll, 0);
    },
    fromShortHand : function(input){
      var len = input.length;
      var result = qx.lang.Array.clone(input);
      switch(len){case 1:      result[1] = result[2] = result[3] = result[0];
      break;case 2:      result[2] = result[0];case 3:      result[3] = result[1];};
      return result;
    },
    clone : function(arr){
      return arr.concat();
    },
    insertAt : function(arr, obj, i){
      arr.splice(i, 0, obj);
      return arr;
    },
    insertBefore : function(arr, obj, obj2){
      var i = arr.indexOf(obj2);
      if(i == -1){
        arr.push(obj);
      } else {
        arr.splice(i, 0, obj);
      };
      return arr;
    },
    insertAfter : function(arr, obj, obj2){
      var i = arr.indexOf(obj2);
      if(i == -1 || i == (arr.length - 1)){
        arr.push(obj);
      } else {
        arr.splice(i + 1, 0, obj);
      };
      return arr;
    },
    removeAt : function(arr, i){
      return arr.splice(i, 1)[0];
    },
    removeAll : function(arr){
      arr.length = 0;
      return this;
    },
    append : function(arr1, arr2){
      {
      };
      Array.prototype.push.apply(arr1, arr2);
      return arr1;
    },
    exclude : function(arr1, arr2){
      {
      };
      for(var i = 0,il = arr2.length,index;i < il;i++){
        index = arr1.indexOf(arr2[i]);
        if(index != -1){
          arr1.splice(index, 1);
        };
      };
      return arr1;
    },
    remove : function(arr, obj){
      var i = arr.indexOf(obj);
      if(i != -1){
        arr.splice(i, 1);
        return obj;
      };
    },
    contains : function(arr, obj){
      return arr.indexOf(obj) !== -1;
    },
    equals : function(arr1, arr2){
      var length = arr1.length;
      if(length !== arr2.length){
        return false;
      };
      for(var i = 0;i < length;i++){
        if(arr1[i] !== arr2[i]){
          return false;
        };
      };
      return true;
    },
    sum : function(arr){
      var result = 0;
      for(var i = 0,l = arr.length;i < l;i++){
        result += arr[i];
      };
      return result;
    },
    max : function(arr){
      {
      };
      var i,len = arr.length,result = arr[0];
      for(i = 1;i < len;i++){
        if(arr[i] > result){
          result = arr[i];
        };
      };
      return result === undefined ? null : result;
    },
    min : function(arr){
      {
      };
      var i,len = arr.length,result = arr[0];
      for(i = 1;i < len;i++){
        if(arr[i] < result){
          result = arr[i];
        };
      };
      return result === undefined ? null : result;
    },
    unique : function(arr){
      var ret = [],doneStrings = {
      },doneNumbers = {
      },doneObjects = {
      };
      var value,count = 0;
      var key = "qx" + qx.lang.Date.now();
      var hasNull = false,hasFalse = false,hasTrue = false;
      for(var i = 0,len = arr.length;i < len;i++){
        value = arr[i];
        if(value === null){
          if(!hasNull){
            hasNull = true;
            ret.push(value);
          };
        } else if(value === undefined){
        } else if(value === false){
          if(!hasFalse){
            hasFalse = true;
            ret.push(value);
          };
        } else if(value === true){
          if(!hasTrue){
            hasTrue = true;
            ret.push(value);
          };
        } else if(typeof value === "string"){
          if(!doneStrings[value]){
            doneStrings[value] = 1;
            ret.push(value);
          };
        } else if(typeof value === "number"){
          if(!doneNumbers[value]){
            doneNumbers[value] = 1;
            ret.push(value);
          };
        } else {
          var hash = value[key];
          if(hash == null){
            hash = value[key] = count++;
          };
          if(!doneObjects[hash]){
            doneObjects[hash] = value;
            ret.push(value);
          };
        };;;;;
      };
      for(var hash in doneObjects){
        try{
          delete doneObjects[hash][key];
        } catch(ex) {
          try{
            doneObjects[hash][key] = null;
          } catch(ex) {
            throw new Error("Cannot clean-up map entry doneObjects[" + hash + "][" + key + "]");
          };
        };
      };
      return ret;
    }
  }
});
qx.Bootstrap.define("qx.core.Environment", {
  statics : {
    _checks : {
    },
    _asyncChecks : {
    },
    __cache : {
    },
    _checksMap : {
      "engine.version" : "qx.bom.client.Engine.getVersion",
      "engine.name" : "qx.bom.client.Engine.getName",
      "browser.name" : "qx.bom.client.Browser.getName",
      "browser.version" : "qx.bom.client.Browser.getVersion",
      "browser.documentmode" : "qx.bom.client.Browser.getDocumentMode",
      "browser.quirksmode" : "qx.bom.client.Browser.getQuirksMode",
      "runtime.name" : "qx.bom.client.Runtime.getName",
      "device.name" : "qx.bom.client.Device.getName",
      "locale" : "qx.bom.client.Locale.getLocale",
      "locale.variant" : "qx.bom.client.Locale.getVariant",
      "os.name" : "qx.bom.client.OperatingSystem.getName",
      "os.version" : "qx.bom.client.OperatingSystem.getVersion",
      "os.scrollBarOverlayed" : "qx.bom.client.Scroll.scrollBarOverlayed",
      "plugin.gears" : "qx.bom.client.Plugin.getGears",
      "plugin.activex" : "qx.bom.client.Plugin.getActiveX",
      "plugin.quicktime" : "qx.bom.client.Plugin.getQuicktime",
      "plugin.quicktime.version" : "qx.bom.client.Plugin.getQuicktimeVersion",
      "plugin.windowsmedia" : "qx.bom.client.Plugin.getWindowsMedia",
      "plugin.windowsmedia.version" : "qx.bom.client.Plugin.getWindowsMediaVersion",
      "plugin.divx" : "qx.bom.client.Plugin.getDivX",
      "plugin.divx.version" : "qx.bom.client.Plugin.getDivXVersion",
      "plugin.silverlight" : "qx.bom.client.Plugin.getSilverlight",
      "plugin.silverlight.version" : "qx.bom.client.Plugin.getSilverlightVersion",
      "plugin.flash" : "qx.bom.client.Flash.isAvailable",
      "plugin.flash.version" : "qx.bom.client.Flash.getVersion",
      "plugin.flash.express" : "qx.bom.client.Flash.getExpressInstall",
      "plugin.flash.strictsecurity" : "qx.bom.client.Flash.getStrictSecurityModel",
      "plugin.pdf" : "qx.bom.client.Plugin.getPdf",
      "plugin.pdf.version" : "qx.bom.client.Plugin.getPdfVersion",
      "io.maxrequests" : "qx.bom.client.Transport.getMaxConcurrentRequestCount",
      "io.ssl" : "qx.bom.client.Transport.getSsl",
      "io.xhr" : "qx.bom.client.Transport.getXmlHttpRequest",
      "event.touch" : "qx.bom.client.Event.getTouch",
      "event.pointer" : "qx.bom.client.Event.getPointer",
      "event.help" : "qx.bom.client.Event.getHelp",
      "event.hashchange" : "qx.bom.client.Event.getHashChange",
      "ecmascript.stacktrace" : "qx.bom.client.EcmaScript.getStackTrace",
      "html.webworker" : "qx.bom.client.Html.getWebWorker",
      "html.filereader" : "qx.bom.client.Html.getFileReader",
      "html.geolocation" : "qx.bom.client.Html.getGeoLocation",
      "html.audio" : "qx.bom.client.Html.getAudio",
      "html.audio.ogg" : "qx.bom.client.Html.getAudioOgg",
      "html.audio.mp3" : "qx.bom.client.Html.getAudioMp3",
      "html.audio.wav" : "qx.bom.client.Html.getAudioWav",
      "html.audio.au" : "qx.bom.client.Html.getAudioAu",
      "html.audio.aif" : "qx.bom.client.Html.getAudioAif",
      "html.video" : "qx.bom.client.Html.getVideo",
      "html.video.ogg" : "qx.bom.client.Html.getVideoOgg",
      "html.video.h264" : "qx.bom.client.Html.getVideoH264",
      "html.video.webm" : "qx.bom.client.Html.getVideoWebm",
      "html.storage.local" : "qx.bom.client.Html.getLocalStorage",
      "html.storage.session" : "qx.bom.client.Html.getSessionStorage",
      "html.storage.userdata" : "qx.bom.client.Html.getUserDataStorage",
      "html.classlist" : "qx.bom.client.Html.getClassList",
      "html.xpath" : "qx.bom.client.Html.getXPath",
      "html.xul" : "qx.bom.client.Html.getXul",
      "html.canvas" : "qx.bom.client.Html.getCanvas",
      "html.svg" : "qx.bom.client.Html.getSvg",
      "html.vml" : "qx.bom.client.Html.getVml",
      "html.dataset" : "qx.bom.client.Html.getDataset",
      "html.dataurl" : "qx.bom.client.Html.getDataUrl",
      "html.console" : "qx.bom.client.Html.getConsole",
      "html.stylesheet.createstylesheet" : "qx.bom.client.Stylesheet.getCreateStyleSheet",
      "html.stylesheet.insertrule" : "qx.bom.client.Stylesheet.getInsertRule",
      "html.stylesheet.deleterule" : "qx.bom.client.Stylesheet.getDeleteRule",
      "html.stylesheet.addimport" : "qx.bom.client.Stylesheet.getAddImport",
      "html.stylesheet.removeimport" : "qx.bom.client.Stylesheet.getRemoveImport",
      "html.element.contains" : "qx.bom.client.Html.getContains",
      "html.element.compareDocumentPosition" : "qx.bom.client.Html.getCompareDocumentPosition",
      "html.element.textcontent" : "qx.bom.client.Html.getTextContent",
      "html.image.naturaldimensions" : "qx.bom.client.Html.getNaturalDimensions",
      "json" : "qx.bom.client.Json.getJson",
      "css.textoverflow" : "qx.bom.client.Css.getTextOverflow",
      "css.placeholder" : "qx.bom.client.Css.getPlaceholder",
      "css.borderradius" : "qx.bom.client.Css.getBorderRadius",
      "css.borderimage" : "qx.bom.client.Css.getBorderImage",
      "css.borderimage.standardsyntax" : "qx.bom.client.Css.getBorderImageSyntax",
      "css.boxshadow" : "qx.bom.client.Css.getBoxShadow",
      "css.gradient.linear" : "qx.bom.client.Css.getLinearGradient",
      "css.gradient.filter" : "qx.bom.client.Css.getFilterGradient",
      "css.gradient.radial" : "qx.bom.client.Css.getRadialGradient",
      "css.gradient.legacywebkit" : "qx.bom.client.Css.getLegacyWebkitGradient",
      "css.boxmodel" : "qx.bom.client.Css.getBoxModel",
      "css.rgba" : "qx.bom.client.Css.getRgba",
      "css.userselect" : "qx.bom.client.Css.getUserSelect",
      "css.userselect.none" : "qx.bom.client.Css.getUserSelectNone",
      "css.usermodify" : "qx.bom.client.Css.getUserModify",
      "css.appearance" : "qx.bom.client.Css.getAppearance",
      "css.float" : "qx.bom.client.Css.getFloat",
      "css.boxsizing" : "qx.bom.client.Css.getBoxSizing",
      "css.animation" : "qx.bom.client.CssAnimation.getSupport",
      "css.transform" : "qx.bom.client.CssTransform.getSupport",
      "css.transform.3d" : "qx.bom.client.CssTransform.get3D",
      "css.inlineblock" : "qx.bom.client.Css.getInlineBlock",
      "css.opacity" : "qx.bom.client.Css.getOpacity",
      "css.overflowxy" : "qx.bom.client.Css.getOverflowXY",
      "css.textShadow" : "qx.bom.client.Css.getTextShadow",
      "css.textShadow.filter" : "qx.bom.client.Css.getFilterTextShadow",
      "phonegap" : "qx.bom.client.PhoneGap.getPhoneGap",
      "phonegap.notification" : "qx.bom.client.PhoneGap.getNotification",
      "xml.implementation" : "qx.bom.client.Xml.getImplementation",
      "xml.domparser" : "qx.bom.client.Xml.getDomParser",
      "xml.selectsinglenode" : "qx.bom.client.Xml.getSelectSingleNode",
      "xml.selectnodes" : "qx.bom.client.Xml.getSelectNodes",
      "xml.getelementsbytagnamens" : "qx.bom.client.Xml.getElementsByTagNameNS",
      "xml.domproperties" : "qx.bom.client.Xml.getDomProperties",
      "xml.attributens" : "qx.bom.client.Xml.getAttributeNS",
      "xml.createnode" : "qx.bom.client.Xml.getCreateNode",
      "xml.getqualifieditem" : "qx.bom.client.Xml.getQualifiedItem",
      "xml.createelementns" : "qx.bom.client.Xml.getCreateElementNS"
    },
    get : function(key){
      if(this.__cache[key] != undefined){
        return this.__cache[key];
      };
      var check = this._checks[key];
      if(check){
        var value = check();
        this.__cache[key] = value;
        return value;
      };
      var classAndMethod = this._getClassNameFromEnvKey(key);
      if(classAndMethod[0] != undefined){
        var clazz = classAndMethod[0];
        var method = classAndMethod[1];
        var value = clazz[method]();
        this.__cache[key] = value;
        return value;
      };
      if(qx.Bootstrap.DEBUG){
        qx.Bootstrap.warn(key + " is not a valid key. Please see the API-doc of " + "qx.core.Environment for a list of predefined keys.");
        qx.Bootstrap.trace(this);
      };
    },
    _getClassNameFromEnvKey : function(key){
      var envmappings = this._checksMap;
      if(envmappings[key] != undefined){
        var implementation = envmappings[key];
        var lastdot = implementation.lastIndexOf(".");
        if(lastdot > -1){
          var classname = implementation.slice(0, lastdot);
          var methodname = implementation.slice(lastdot + 1);
          var clazz = qx.Bootstrap.getByName(classname);
          if(clazz != undefined){
            return [clazz, methodname];
          };
        };
      };
      return [undefined, undefined];
    },
    getAsync : function(key, callback, self){
      var env = this;
      if(this.__cache[key] != undefined){
        window.setTimeout(function(){
          callback.call(self, env.__cache[key]);
        }, 0);
        return;
      };
      var check = this._asyncChecks[key];
      if(check){
        check(function(result){
          env.__cache[key] = result;
          callback.call(self, result);
        });
        return;
      };
      var classAndMethod = this._getClassNameFromEnvKey(key);
      if(classAndMethod[0] != undefined){
        var clazz = classAndMethod[0];
        var method = classAndMethod[1];
        clazz[method](function(result){
          env.__cache[key] = result;
          callback.call(self, result);
        });
        return;
      };
      if(qx.Bootstrap.DEBUG){
        qx.Bootstrap.warn(key + " is not a valid key. Please see the API-doc of " + "qx.core.Environment for a list of predefined keys.");
        qx.Bootstrap.trace(this);
      };
    },
    select : function(key, values){
      return this.__pickFromValues(this.get(key), values);
    },
    selectAsync : function(key, values, self){
      this.getAsync(key, function(result){
        var value = this.__pickFromValues(key, values);
        value.call(self, result);
      }, this);
    },
    __pickFromValues : function(key, values){
      var value = values[key];
      if(values.hasOwnProperty(key)){
        return value;
      };
      for(var id in values){
        if(id.indexOf("|") != -1){
          var ids = id.split("|");
          for(var i = 0;i < ids.length;i++){
            if(ids[i] == key){
              return values[id];
            };
          };
        };
      };
      if(values["default"] !== undefined){
        return values["default"];
      };
      if(qx.Bootstrap.DEBUG){
        throw new Error('No match for variant "' + key + '" (' + (typeof key) + ' type)' + ' in variants [' + qx.Bootstrap.getKeysAsString(values) + '] found, and no default ("default") given');
      };
    },
    filter : function(map){
      var returnArray = [];
      for(var check in map){
        if(this.get(check)){
          returnArray.push(map[check]);
        };
      };
      return returnArray;
    },
    invalidateCacheKey : function(key){
      delete this.__cache[key];
    },
    add : function(key, check){
      if(this._checks[key] == undefined){
        if(check instanceof Function){
          this._checks[key] = check;
        } else {
          this._checks[key] = this.__createCheck(check);
        };
      };
    },
    addAsync : function(key, check){
      if(this._checks[key] == undefined){
        this._asyncChecks[key] = check;
      };
    },
    getChecks : function(){
      return this._checks;
    },
    getAsyncChecks : function(){
      return this._asyncChecks;
    },
    _initDefaultQxValues : function(){
      this.add("qx.allowUrlSettings", function(){
        return false;
      });
      this.add("qx.allowUrlVariants", function(){
        return false;
      });
      this.add("qx.propertyDebugLevel", function(){
        return 0;
      });
      this.add("qx.debug", function(){
        return true;
      });
      this.add("qx.aspects", function(){
        return false;
      });
      this.add("qx.dynlocale", function(){
        return true;
      });
      this.add("qx.mobile.emulatetouch", function(){
        return false;
      });
      this.add("qx.mobile.nativescroll", function(){
        return false;
      });
      this.add("qx.dynamicmousewheel", function(){
        return true;
      });
      this.add("qx.debug.databinding", function(){
        return false;
      });
      this.add("qx.debug.dispose", function(){
        return false;
      });
      this.add("qx.optimization.basecalls", function(){
        return false;
      });
      this.add("qx.optimization.comments", function(){
        return false;
      });
      this.add("qx.optimization.privates", function(){
        return false;
      });
      this.add("qx.optimization.strings", function(){
        return false;
      });
      this.add("qx.optimization.variables", function(){
        return false;
      });
      this.add("qx.optimization.variants", function(){
        return false;
      });
      this.add("module.databinding", function(){
        return true;
      });
      this.add("module.logger", function(){
        return true;
      });
      this.add("module.property", function(){
        return true;
      });
      this.add("module.events", function(){
        return true;
      });
    },
    __importFromGenerator : function(){
      if(qx && qx.$$environment){
        for(var key in qx.$$environment){
          var value = qx.$$environment[key];
          this._checks[key] = this.__createCheck(value);
        };
      };
    },
    __importFromUrl : function(){
      if(window.document && window.document.location){
        var urlChecks = window.document.location.search.slice(1).split("&");
        for(var i = 0;i < urlChecks.length;i++){
          var check = urlChecks[i].split(":");
          if(check.length != 3 || check[0] != "qxenv"){
            continue;
          };
          var key = check[1];
          var value = decodeURIComponent(check[2]);
          if(value == "true"){
            value = true;
          } else if(value == "false"){
            value = false;
          } else if(/^(\d|\.)+$/.test(value)){
            value = parseFloat(value);
          };;
          this._checks[key] = this.__createCheck(value);
        };
      };
    },
    __createCheck : function(value){
      return qx.Bootstrap.bind(function(value){
        return value;
      }, null, value);
    }
  },
  defer : function(statics){
    statics._initDefaultQxValues();
    statics.__importFromGenerator();
    if(statics.get("qx.allowUrlSettings") === true){
      statics.__importFromUrl();
    };
  }
});
qx.Bootstrap.define("qx.bom.client.Engine", {
  statics : {
    getVersion : function(){
      var agent = window.navigator.userAgent;
      var version = "";
      if(qx.bom.client.Engine.__isOpera()){
        if(/Opera[\s\/]([0-9]+)\.([0-9])([0-9]*)/.test(agent)){
          if(agent.indexOf("Version/") != -1){
            var match = agent.match(/Version\/(\d+)\.(\d+)/);
            version = match[1] + "." + match[2].charAt(0) + "." + match[2].substring(1, match[2].length);
          } else {
            version = RegExp.$1 + "." + RegExp.$2;
            if(RegExp.$3 != ""){
              version += "." + RegExp.$3;
            };
          };
        };
      } else if(qx.bom.client.Engine.__isWebkit()){
        if(/AppleWebKit\/([^ ]+)/.test(agent)){
          version = RegExp.$1;
          var invalidCharacter = RegExp("[^\\.0-9]").exec(version);
          if(invalidCharacter){
            version = version.slice(0, invalidCharacter.index);
          };
        };
      } else if(qx.bom.client.Engine.__isGecko() || qx.bom.client.Engine.__isMaple()){
        if(/rv\:([^\);]+)(\)|;)/.test(agent)){
          version = RegExp.$1;
        };
      } else if(qx.bom.client.Engine.__isMshtml()){
        if(/MSIE\s+([^\);]+)(\)|;)/.test(agent)){
          version = RegExp.$1;
          if(version < 8 && /Trident\/([^\);]+)(\)|;)/.test(agent)){
            if(RegExp.$1 == "4.0"){
              version = "8.0";
            } else if(RegExp.$1 == "5.0"){
              version = "9.0";
            };
          };
        };
      } else {
        var failFunction = window.qxFail;
        if(failFunction && typeof failFunction === "function"){
          version = failFunction().FULLVERSION;
        } else {
          version = "1.9.0.0";
          qx.Bootstrap.warn("Unsupported client: " + agent + "! Assumed gecko version 1.9.0.0 (Firefox 3.0).");
        };
      };;;
      return version;
    },
    getName : function(){
      var name;
      if(qx.bom.client.Engine.__isOpera()){
        name = "opera";
      } else if(qx.bom.client.Engine.__isWebkit()){
        name = "webkit";
      } else if(qx.bom.client.Engine.__isGecko() || qx.bom.client.Engine.__isMaple()){
        name = "gecko";
      } else if(qx.bom.client.Engine.__isMshtml()){
        name = "mshtml";
      } else {
        var failFunction = window.qxFail;
        if(failFunction && typeof failFunction === "function"){
          name = failFunction().NAME;
        } else {
          name = "gecko";
          qx.Bootstrap.warn("Unsupported client: " + window.navigator.userAgent + "! Assumed gecko version 1.9.0.0 (Firefox 3.0).");
        };
      };;;
      return name;
    },
    __isOpera : function(){
      return window.opera && Object.prototype.toString.call(window.opera) == "[object Opera]";
    },
    __isWebkit : function(){
      return window.navigator.userAgent.indexOf("AppleWebKit/") != -1;
    },
    __isMaple : function(){
      return window.navigator.userAgent.indexOf("Maple") != -1;
    },
    __isGecko : function(){
      return window.controllers && window.navigator.product === "Gecko" && window.navigator.userAgent.indexOf("Maple") == -1;
    },
    __isMshtml : function(){
      return window.navigator.cpuClass && /MSIE\s+([^\);]+)(\)|;)/.test(window.navigator.userAgent);
    }
  },
  defer : function(statics){
    qx.core.Environment.add("engine.version", statics.getVersion);
    qx.core.Environment.add("engine.name", statics.getName);
  }
});
qx.Bootstrap.define("qx.lang.Date", {
  statics : {
    now : function(){
      return +new Date;
    }
  }
});
qx.Bootstrap.define("qx.lang.Core", {
  statics : {
    errorToString : {
      "native" : Error.prototype.toString,
      "emulated" : function(){
        return this.message;
      }
    }[(!Error.prototype.toString || Error.prototype.toString() == "[object Error]") ? "emulated" : "native"],
    arrayIndexOf : {
      "native" : Array.prototype.indexOf,
      "emulated" : function(searchElement, fromIndex){
        if(fromIndex == null){
          fromIndex = 0;
        } else if(fromIndex < 0){
          fromIndex = Math.max(0, this.length + fromIndex);
        };
        for(var i = fromIndex;i < this.length;i++){
          if(this[i] === searchElement){
            return i;
          };
        };
        return -1;
      }
    }[Array.prototype.indexOf ? "native" : "emulated"],
    arrayLastIndexOf : {
      "native" : Array.prototype.lastIndexOf,
      "emulated" : function(searchElement, fromIndex){
        if(fromIndex == null){
          fromIndex = this.length - 1;
        } else if(fromIndex < 0){
          fromIndex = Math.max(0, this.length + fromIndex);
        };
        for(var i = fromIndex;i >= 0;i--){
          if(this[i] === searchElement){
            return i;
          };
        };
        return -1;
      }
    }[Array.prototype.lastIndexOf ? "native" : "emulated"],
    arrayForEach : {
      "native" : Array.prototype.forEach,
      "emulated" : function(callback, obj){
        var l = this.length;
        for(var i = 0;i < l;i++){
          var value = this[i];
          if(value !== undefined){
            callback.call(obj || window, value, i, this);
          };
        };
      }
    }[Array.prototype.forEach ? "native" : "emulated"],
    arrayFilter : {
      "native" : Array.prototype.filter,
      "emulated" : function(callback, obj){
        var res = [];
        var l = this.length;
        for(var i = 0;i < l;i++){
          var value = this[i];
          if(value !== undefined){
            if(callback.call(obj || window, value, i, this)){
              res.push(this[i]);
            };
          };
        };
        return res;
      }
    }[Array.prototype.filter ? "native" : "emulated"],
    arrayMap : {
      "native" : Array.prototype.map,
      "emulated" : function(callback, obj){
        var res = [];
        var l = this.length;
        for(var i = 0;i < l;i++){
          var value = this[i];
          if(value !== undefined){
            res[i] = callback.call(obj || window, value, i, this);
          };
        };
        return res;
      }
    }[Array.prototype.map ? "native" : "emulated"],
    arraySome : {
      "native" : Array.prototype.some,
      "emulated" : function(callback, obj){
        var l = this.length;
        for(var i = 0;i < l;i++){
          var value = this[i];
          if(value !== undefined){
            if(callback.call(obj || window, value, i, this)){
              return true;
            };
          };
        };
        return false;
      }
    }[Array.prototype.some ? "native" : "emulated"],
    arrayEvery : {
      "native" : Array.prototype.every,
      "emulated" : function(callback, obj){
        var l = this.length;
        for(var i = 0;i < l;i++){
          var value = this[i];
          if(value !== undefined){
            if(!callback.call(obj || window, value, i, this)){
              return false;
            };
          };
        };
        return true;
      }
    }[Array.prototype.every ? "native" : "emulated"],
    stringQuote : {
      "native" : String.prototype.quote,
      "emulated" : function(){
        return '"' + this.replace(/\\/g, "\\\\").replace(/\"/g, "\\\"") + '"';
      }
    }[String.prototype.quote ? "native" : "emulated"]
  }
});
if(!Error.prototype.toString || Error.prototype.toString() == "[object Error]"){
  Error.prototype.toString = qx.lang.Core.errorToString;
};
if(!Array.prototype.indexOf){
  Array.prototype.indexOf = qx.lang.Core.arrayIndexOf;
};
if(!Array.prototype.lastIndexOf){
  Array.prototype.lastIndexOf = qx.lang.Core.arrayLastIndexOf;
};
if(!Array.prototype.forEach){
  Array.prototype.forEach = qx.lang.Core.arrayForEach;
};
if(!Array.prototype.filter){
  Array.prototype.filter = qx.lang.Core.arrayFilter;
};
if(!Array.prototype.map){
  Array.prototype.map = qx.lang.Core.arrayMap;
};
if(!Array.prototype.some){
  Array.prototype.some = qx.lang.Core.arraySome;
};
if(!Array.prototype.every){
  Array.prototype.every = qx.lang.Core.arrayEvery;
};
if(!String.prototype.quote){
  String.prototype.quote = qx.lang.Core.stringQuote;
};
qx.Bootstrap.define("qx.type.BaseArray", {
  extend : Array,
  construct : function(length_or_items){
  },
  members : {
    toArray : null,
    valueOf : null,
    pop : null,
    push : null,
    reverse : null,
    shift : null,
    sort : null,
    splice : null,
    unshift : null,
    concat : null,
    join : null,
    slice : null,
    toString : null,
    indexOf : null,
    lastIndexOf : null,
    forEach : null,
    filter : null,
    map : null,
    some : null,
    every : null
  }
});
(function(){
  function createStackConstructor(stack){
    if((qx.core.Environment.get("engine.name") == "mshtml")){
      Stack.prototype = {
        length : 0,
        $$isArray : true
      };
      var args = "pop.push.reverse.shift.sort.splice.unshift.join.slice".split(".");
      for(var length = args.length;length;){
        Stack.prototype[args[--length]] = Array.prototype[args[length]];
      };
    };
    var slice = Array.prototype.slice;
    Stack.prototype.concat = function(){
      var constructor = this.slice(0);
      for(var i = 0,length = arguments.length;i < length;i++){
        var copy;
        if(arguments[i] instanceof Stack){
          copy = slice.call(arguments[i], 0);
        } else if(arguments[i] instanceof Array){
          copy = arguments[i];
        } else {
          copy = [arguments[i]];
        };
        constructor.push.apply(constructor, copy);
      };
      return constructor;
    };
    Stack.prototype.toString = function(){
      return slice.call(this, 0).toString();
    };
    Stack.prototype.toLocaleString = function(){
      return slice.call(this, 0).toLocaleString();
    };
    Stack.prototype.constructor = Stack;
    Stack.prototype.indexOf = qx.lang.Core.arrayIndexOf;
    Stack.prototype.lastIndexOf = qx.lang.Core.arrayLastIndexOf;
    Stack.prototype.forEach = qx.lang.Core.arrayForEach;
    Stack.prototype.some = qx.lang.Core.arraySome;
    Stack.prototype.every = qx.lang.Core.arrayEvery;
    var filter = qx.lang.Core.arrayFilter;
    var map = qx.lang.Core.arrayMap;
    Stack.prototype.filter = function(){
      var ret = new this.constructor;
      ret.push.apply(ret, filter.apply(this, arguments));
      return ret;
    };
    Stack.prototype.map = function(){
      var ret = new this.constructor;
      ret.push.apply(ret, map.apply(this, arguments));
      return ret;
    };
    Stack.prototype.slice = function(){
      var ret = new this.constructor;
      ret.push.apply(ret, Array.prototype.slice.apply(this, arguments));
      return ret;
    };
    Stack.prototype.splice = function(){
      var ret = new this.constructor;
      ret.push.apply(ret, Array.prototype.splice.apply(this, arguments));
      return ret;
    };
    Stack.prototype.toArray = function(){
      return Array.prototype.slice.call(this, 0);
    };
    Stack.prototype.valueOf = function(){
      return this.length;
    };
    return Stack;
  };
  function Stack(length){
    if(arguments.length === 1 && typeof length === "number"){
      this.length = -1 < length && length === length >> .5 ? length : this.push(length);
    } else if(arguments.length){
      this.push.apply(this, arguments);
    };
  };
  function PseudoArray(){
  };
  PseudoArray.prototype = [];
  Stack.prototype = new PseudoArray;
  Stack.prototype.length = 0;
  qx.type.BaseArray = createStackConstructor(Stack);
})();
qx.Bootstrap.define("qx.Collection", {
  extend : qx.type.BaseArray,
  members : {
  }
});
qx.Bootstrap.define("qx.module.Css", {
  statics : {
    setStyle : function(name, value){
      if(/\w-\w/.test(name)){
        name = qx.lang.String.camelCase(name);
      };
      for(var i = 0;i < this.length;i++){
        qx.bom.element.Style.set(this[i], name, value);
      };
      return this;
    },
    getStyle : function(name){
      if(this[0]){
        if(/\w-\w/.test(name)){
          name = qx.lang.String.camelCase(name);
        };
        return qx.bom.element.Style.get(this[0], name);
      };
      return null;
    },
    setStyles : function(styles){
      for(var name in styles){
        this.setStyle(name, styles[name]);
      };
      return this;
    },
    getStyles : function(names){
      var styles = {
      };
      for(var i = 0;i < names.length;i++){
        styles[names[i]] = this.getStyle(names[i]);
      };
      return styles;
    },
    addClass : function(name){
      for(var i = 0;i < this.length;i++){
        qx.bom.element.Class.add(this[i], name);
      };
      return this;
    },
    addClasses : function(names){
      for(var i = 0;i < this.length;i++){
        qx.bom.element.Class.addClasses(this[i], names);
      };
      return this;
    },
    removeClass : function(name){
      for(var i = 0;i < this.length;i++){
        qx.bom.element.Class.remove(this[i], name);
      };
      return this;
    },
    removeClasses : function(names){
      for(var i = 0;i < this.length;i++){
        qx.bom.element.Class.removeClasses(this[i], names);
      };
      return this;
    },
    hasClass : function(name){
      if(!this[0]){
        return false;
      };
      return qx.bom.element.Class.has(this[0], name);
    },
    getClass : function(){
      if(!this[0]){
        return "";
      };
      return qx.bom.element.Class.get(this[0]);
    },
    toggleClass : function(name){
      var bCls = qx.bom.element.Class;
      for(var i = 0,l = this.length;i < l;i++){
        bCls.has(this[i], name) ? bCls.remove(this[i], name) : bCls.add(this[i], name);
      };
      return this;
    },
    toggleClasses : function(names){
      for(var i = 0,l = names.length;i < l;i++){
        this.toggleClass(names[i]);
      };
      return this;
    },
    replaceClass : function(oldName, newName){
      for(var i = 0,l = this.length;i < l;i++){
        qx.bom.element.Class.replace(this[i], oldName, newName);
      };
      return this;
    },
    getHeight : function(){
      var elem = this[0];
      if(elem){
        if(qx.dom.Node.isElement(elem)){
          return qx.bom.element.Dimension.getHeight(elem);
        } else if(qx.dom.Node.isDocument(elem)){
          return qx.bom.Document.getHeight(qx.dom.Node.getWindow(elem));
        } else if(qx.dom.Node.isWindow(elem)){
          return qx.bom.Viewport.getHeight(elem);
        };;
      };
      return null;
    },
    getWidth : function(){
      var elem = this[0];
      if(elem){
        if(qx.dom.Node.isElement(elem)){
          return qx.bom.element.Dimension.getWidth(elem);
        } else if(qx.dom.Node.isDocument(elem)){
          return qx.bom.Document.getWidth(qx.dom.Node.getWindow(elem));
        } else if(qx.dom.Node.isWindow(elem)){
          return qx.bom.Viewport.getWidth(elem);
        };;
      };
      return null;
    },
    getOffset : function(){
      var elem = this[0];
      if(elem){
        return qx.bom.element.Location.get(elem);
      };
      return null;
    },
    getContentHeight : function(){
      var obj = this[0];
      if(qx.dom.Node.isElement(obj)){
        return qx.bom.element.Dimension.getContentHeight(obj);
      };
      return null;
    },
    getContentWidth : function(){
      var obj = this[0];
      if(qx.dom.Node.isElement(obj)){
        return qx.bom.element.Dimension.getContentWidth(obj);
      };
      return null;
    },
    getPosition : function(){
      var obj = this[0];
      if(qx.dom.Node.isElement(obj)){
        return qx.bom.element.Location.getPosition(obj);
      };
      return null;
    },
    includeStylesheet : function(uri, doc){
      qx.bom.Stylesheet.includeFile(uri, doc);
    }
  },
  defer : function(statics){
    q.attach({
      "setStyle" : statics.setStyle,
      "getStyle" : statics.getStyle,
      "setStyles" : statics.setStyles,
      "getStyles" : statics.getStyles,
      "addClass" : statics.addClass,
      "addClasses" : statics.addClasses,
      "removeClass" : statics.removeClass,
      "removeClasses" : statics.removeClasses,
      "hasClass" : statics.hasClass,
      "getClass" : statics.getClass,
      "toggleClass" : statics.toggleClass,
      "toggleClasses" : statics.toggleClasses,
      "replaceClass" : statics.replaceClass,
      "getHeight" : statics.getHeight,
      "getWidth" : statics.getWidth,
      "getOffset" : statics.getOffset,
      "getContentHeight" : statics.getContentHeight,
      "getContentWidth" : statics.getContentWidth,
      "getPosition" : statics.getPosition
    });
    q.attachStatic({
      "includeStylesheet" : statics.includeStylesheet
    });
  }
});
qx.Bootstrap.define("qx.lang.String", {
  statics : {
    __unicodeLetters : "0041-005A0061-007A00AA00B500BA00C0-00D600D8-00F600F8-02C102C6-02D102E0-02E402EC02EE0370-037403760377037A-037D03860388-038A038C038E-03A103A3-03F503F7-0481048A-05250531-055605590561-058705D0-05EA05F0-05F20621-064A066E066F0671-06D306D506E506E606EE06EF06FA-06FC06FF07100712-072F074D-07A507B107CA-07EA07F407F507FA0800-0815081A082408280904-0939093D09500958-0961097109720979-097F0985-098C098F09900993-09A809AA-09B009B209B6-09B909BD09CE09DC09DD09DF-09E109F009F10A05-0A0A0A0F0A100A13-0A280A2A-0A300A320A330A350A360A380A390A59-0A5C0A5E0A72-0A740A85-0A8D0A8F-0A910A93-0AA80AAA-0AB00AB20AB30AB5-0AB90ABD0AD00AE00AE10B05-0B0C0B0F0B100B13-0B280B2A-0B300B320B330B35-0B390B3D0B5C0B5D0B5F-0B610B710B830B85-0B8A0B8E-0B900B92-0B950B990B9A0B9C0B9E0B9F0BA30BA40BA8-0BAA0BAE-0BB90BD00C05-0C0C0C0E-0C100C12-0C280C2A-0C330C35-0C390C3D0C580C590C600C610C85-0C8C0C8E-0C900C92-0CA80CAA-0CB30CB5-0CB90CBD0CDE0CE00CE10D05-0D0C0D0E-0D100D12-0D280D2A-0D390D3D0D600D610D7A-0D7F0D85-0D960D9A-0DB10DB3-0DBB0DBD0DC0-0DC60E01-0E300E320E330E40-0E460E810E820E840E870E880E8A0E8D0E94-0E970E99-0E9F0EA1-0EA30EA50EA70EAA0EAB0EAD-0EB00EB20EB30EBD0EC0-0EC40EC60EDC0EDD0F000F40-0F470F49-0F6C0F88-0F8B1000-102A103F1050-1055105A-105D106110651066106E-10701075-1081108E10A0-10C510D0-10FA10FC1100-1248124A-124D1250-12561258125A-125D1260-1288128A-128D1290-12B012B2-12B512B8-12BE12C012C2-12C512C8-12D612D8-13101312-13151318-135A1380-138F13A0-13F41401-166C166F-167F1681-169A16A0-16EA1700-170C170E-17111720-17311740-17511760-176C176E-17701780-17B317D717DC1820-18771880-18A818AA18B0-18F51900-191C1950-196D1970-19741980-19AB19C1-19C71A00-1A161A20-1A541AA71B05-1B331B45-1B4B1B83-1BA01BAE1BAF1C00-1C231C4D-1C4F1C5A-1C7D1CE9-1CEC1CEE-1CF11D00-1DBF1E00-1F151F18-1F1D1F20-1F451F48-1F4D1F50-1F571F591F5B1F5D1F5F-1F7D1F80-1FB41FB6-1FBC1FBE1FC2-1FC41FC6-1FCC1FD0-1FD31FD6-1FDB1FE0-1FEC1FF2-1FF41FF6-1FFC2071207F2090-209421022107210A-211321152119-211D212421262128212A-212D212F-2139213C-213F2145-2149214E218321842C00-2C2E2C30-2C5E2C60-2CE42CEB-2CEE2D00-2D252D30-2D652D6F2D80-2D962DA0-2DA62DA8-2DAE2DB0-2DB62DB8-2DBE2DC0-2DC62DC8-2DCE2DD0-2DD62DD8-2DDE2E2F300530063031-3035303B303C3041-3096309D-309F30A1-30FA30FC-30FF3105-312D3131-318E31A0-31B731F0-31FF3400-4DB54E00-9FCBA000-A48CA4D0-A4FDA500-A60CA610-A61FA62AA62BA640-A65FA662-A66EA67F-A697A6A0-A6E5A717-A71FA722-A788A78BA78CA7FB-A801A803-A805A807-A80AA80C-A822A840-A873A882-A8B3A8F2-A8F7A8FBA90A-A925A930-A946A960-A97CA984-A9B2A9CFAA00-AA28AA40-AA42AA44-AA4BAA60-AA76AA7AAA80-AAAFAAB1AAB5AAB6AAB9-AABDAAC0AAC2AADB-AADDABC0-ABE2AC00-D7A3D7B0-D7C6D7CB-D7FBF900-FA2DFA30-FA6DFA70-FAD9FB00-FB06FB13-FB17FB1DFB1F-FB28FB2A-FB36FB38-FB3CFB3EFB40FB41FB43FB44FB46-FBB1FBD3-FD3DFD50-FD8FFD92-FDC7FDF0-FDFBFE70-FE74FE76-FEFCFF21-FF3AFF41-FF5AFF66-FFBEFFC2-FFC7FFCA-FFCFFFD2-FFD7FFDA-FFDC",
    __unicodeFirstLetterInWordRegexp : null,
    __stringsMap : {
    },
    camelCase : function(str){
      var result = this.__stringsMap[str];
      if(!result){
        result = str.replace(/\-([a-z])/g, function(match, chr){
          return chr.toUpperCase();
        });
      };
      return result;
    },
    hyphenate : function(str){
      var result = this.__stringsMap[str];
      if(!result){
        result = str.replace(/[A-Z]/g, function(match){
          return ('-' + match.charAt(0).toLowerCase());
        });
      };
      return result;
    },
    capitalize : function(str){
      if(this.__unicodeFirstLetterInWordRegexp === null){
        var unicodeEscapePrefix = '\\u';
        this.__unicodeFirstLetterInWordRegexp = new RegExp("(^|[^" + this.__unicodeLetters.replace(/[0-9A-F]{4}/g, function(match){
          return unicodeEscapePrefix + match;
        }) + "])[" + this.__unicodeLetters.replace(/[0-9A-F]{4}/g, function(match){
          return unicodeEscapePrefix + match;
        }) + "]", "g");
      };
      return str.replace(this.__unicodeFirstLetterInWordRegexp, function(match){
        return match.toUpperCase();
      });
    },
    clean : function(str){
      return this.trim(str.replace(/\s+/g, ' '));
    },
    trimLeft : function(str){
      return str.replace(/^\s+/, "");
    },
    trimRight : function(str){
      return str.replace(/\s+$/, "");
    },
    trim : function(str){
      return str.replace(/^\s+|\s+$/g, "");
    },
    startsWith : function(fullstr, substr){
      return fullstr.indexOf(substr) === 0;
    },
    endsWith : function(fullstr, substr){
      return fullstr.substring(fullstr.length - substr.length, fullstr.length) === substr;
    },
    repeat : function(str, times){
      return str.length > 0 ? new Array(times + 1).join(str) : "";
    },
    pad : function(str, length, ch){
      var padLength = length - str.length;
      if(padLength > 0){
        if(typeof ch === "undefined"){
          ch = "0";
        };
        return this.repeat(ch, padLength) + str;
      } else {
        return str;
      };
    },
    firstUp : qx.Bootstrap.firstUp,
    firstLow : qx.Bootstrap.firstLow,
    contains : function(str, substring){
      return str.indexOf(substring) != -1;
    },
    format : function(pattern, args){
      var str = pattern;
      var i = args.length;
      while(i--){
        str = str.replace(new RegExp("%" + (i + 1), "g"), args[i] + "");
      };
      return str;
    },
    escapeRegexpChars : function(str){
      return str.replace(/([.*+?^${}()|[\]\/\\])/g, '\\$1');
    },
    toArray : function(str){
      return str.split(/\B|\b/g);
    },
    stripTags : function(str){
      return str.replace(/<\/?[^>]+>/gi, "");
    },
    stripScripts : function(str, exec){
      var scripts = "";
      var text = str.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, function(){
        scripts += arguments[1] + '\n';
        return "";
      });
      if(exec === true){
        qx.lang.Function.globalEval(scripts);
      };
      return text;
    }
  }
});
qx.Bootstrap.define("qx.lang.Function", {
  statics : {
    getCaller : function(args){
      return args.caller ? args.caller.callee : args.callee.caller;
    },
    getName : function(fcn){
      if(fcn.displayName){
        return fcn.displayName;
      };
      if(fcn.$$original || fcn.wrapper || fcn.classname){
        return fcn.classname + ".constructor()";
      };
      if(fcn.$$mixin){
        for(var key in fcn.$$mixin.$$members){
          if(fcn.$$mixin.$$members[key] == fcn){
            return fcn.$$mixin.name + ".prototype." + key + "()";
          };
        };
        for(var key in fcn.$$mixin){
          if(fcn.$$mixin[key] == fcn){
            return fcn.$$mixin.name + "." + key + "()";
          };
        };
      };
      if(fcn.self){
        var clazz = fcn.self.constructor;
        if(clazz){
          for(var key in clazz.prototype){
            if(clazz.prototype[key] == fcn){
              return clazz.classname + ".prototype." + key + "()";
            };
          };
          for(var key in clazz){
            if(clazz[key] == fcn){
              return clazz.classname + "." + key + "()";
            };
          };
        };
      };
      var fcnReResult = fcn.toString().match(/function\s*(\w*)\s*\(.*/);
      if(fcnReResult && fcnReResult.length >= 1 && fcnReResult[1]){
        return fcnReResult[1] + "()";
      };
      return 'anonymous()';
    },
    globalEval : function(data){
      if(window.execScript){
        return window.execScript(data);
      } else {
        return eval.call(window, data);
      };
    },
    empty : function(){
    },
    returnTrue : function(){
      return true;
    },
    returnFalse : function(){
      return false;
    },
    returnNull : function(){
      return null;
    },
    returnThis : function(){
      return this;
    },
    returnZero : function(){
      return 0;
    },
    create : function(func, options){
      {
      };
      if(!options){
        return func;
      };
      if(!(options.self || options.args || options.delay != null || options.periodical != null || options.attempt)){
        return func;
      };
      return function(event){
        {
        };
        var args = qx.lang.Array.fromArguments(arguments);
        if(options.args){
          args = options.args.concat(args);
        };
        if(options.delay || options.periodical){
          var returns = function(){
            return func.apply(options.self || this, args);
          };
          if(qx.core.Environment.get("qx.globalErrorHandling")){
            returns = qx.event.GlobalError.observeMethod(returns);
          };
          if(options.delay){
            return window.setTimeout(returns, options.delay);
          };
          if(options.periodical){
            return window.setInterval(returns, options.periodical);
          };
        } else if(options.attempt){
          var ret = false;
          try{
            ret = func.apply(options.self || this, args);
          } catch(ex) {
          };
          return ret;
        } else {
          return func.apply(options.self || this, args);
        };
      };
    },
    bind : function(func, self, varargs){
      return this.create(func, {
        self : self,
        args : arguments.length > 2 ? qx.lang.Array.fromArguments(arguments, 2) : null
      });
    },
    curry : function(func, varargs){
      return this.create(func, {
        args : arguments.length > 1 ? qx.lang.Array.fromArguments(arguments, 1) : null
      });
    },
    listener : function(func, self, varargs){
      if(arguments.length < 3){
        return function(event){
          return func.call(self || this, event || window.event);
        };
      } else {
        var optargs = qx.lang.Array.fromArguments(arguments, 2);
        return function(event){
          var args = [event || window.event];
          args.push.apply(args, optargs);
          func.apply(self || this, args);
        };
      };
    },
    attempt : function(func, self, varargs){
      return this.create(func, {
        self : self,
        attempt : true,
        args : arguments.length > 2 ? qx.lang.Array.fromArguments(arguments, 2) : null
      })();
    },
    delay : function(func, delay, self, varargs){
      return this.create(func, {
        delay : delay,
        self : self,
        args : arguments.length > 3 ? qx.lang.Array.fromArguments(arguments, 3) : null
      })();
    },
    periodical : function(func, interval, self, varargs){
      return this.create(func, {
        periodical : interval,
        self : self,
        args : arguments.length > 3 ? qx.lang.Array.fromArguments(arguments, 3) : null
      })();
    }
  }
});
qx.Bootstrap.define("qx.bom.element.Clip", {
  statics : {
    compile : function(map){
      if(!map){
        return "clip:auto;";
      };
      var left = map.left;
      var top = map.top;
      var width = map.width;
      var height = map.height;
      var right,bottom;
      if(left == null){
        right = (width == null ? "auto" : width + "px");
        left = "auto";
      } else {
        right = (width == null ? "auto" : left + width + "px");
        left = left + "px";
      };
      if(top == null){
        bottom = (height == null ? "auto" : height + "px");
        top = "auto";
      } else {
        bottom = (height == null ? "auto" : top + height + "px");
        top = top + "px";
      };
      return "clip:rect(" + top + "," + right + "," + bottom + "," + left + ");";
    },
    get : function(element, mode){
      var clip = qx.bom.element.Style.get(element, "clip", mode, false);
      var left,top,width,height;
      var right,bottom;
      if(typeof clip === "string" && clip !== "auto" && clip !== ""){
        clip = qx.lang.String.trim(clip);
        if(/\((.*)\)/.test(clip)){
          var result = RegExp.$1;
          if(/,/.test(result)){
            var split = result.split(",");
          } else {
            var split = result.split(" ");
          };
          top = qx.lang.String.trim(split[0]);
          right = qx.lang.String.trim(split[1]);
          bottom = qx.lang.String.trim(split[2]);
          left = qx.lang.String.trim(split[3]);
          if(left === "auto"){
            left = null;
          };
          if(top === "auto"){
            top = null;
          };
          if(right === "auto"){
            right = null;
          };
          if(bottom === "auto"){
            bottom = null;
          };
          if(top != null){
            top = parseInt(top, 10);
          };
          if(right != null){
            right = parseInt(right, 10);
          };
          if(bottom != null){
            bottom = parseInt(bottom, 10);
          };
          if(left != null){
            left = parseInt(left, 10);
          };
          if(right != null && left != null){
            width = right - left;
          } else if(right != null){
            width = right;
          };
          if(bottom != null && top != null){
            height = bottom - top;
          } else if(bottom != null){
            height = bottom;
          };
        } else {
          throw new Error("Could not parse clip string: " + clip);
        };
      };
      return {
        left : left || null,
        top : top || null,
        width : width || null,
        height : height || null
      };
    },
    set : function(element, map){
      if(!map){
        element.style.clip = "rect(auto,auto,auto,auto)";
        return;
      };
      var left = map.left;
      var top = map.top;
      var width = map.width;
      var height = map.height;
      var right,bottom;
      if(left == null){
        right = (width == null ? "auto" : width + "px");
        left = "auto";
      } else {
        right = (width == null ? "auto" : left + width + "px");
        left = left + "px";
      };
      if(top == null){
        bottom = (height == null ? "auto" : height + "px");
        top = "auto";
      } else {
        bottom = (height == null ? "auto" : top + height + "px");
        top = top + "px";
      };
      element.style.clip = "rect(" + top + "," + right + "," + bottom + "," + left + ")";
    },
    reset : function(element){
      element.style.clip = "rect(auto, auto, auto, auto)";
    }
  }
});
qx.Bootstrap.define("qx.bom.Style", {
  statics : {
    VENDOR_PREFIXES : ["Webkit", "Moz", "O", "ms", "Khtml"],
    getPropertyName : function(propertyName){
      var style = document.documentElement.style;
      if(style[propertyName] !== undefined){
        return propertyName;
      };
      for(var i = 0,l = this.VENDOR_PREFIXES.length;i < l;i++){
        var prefixedProp = this.VENDOR_PREFIXES[i] + qx.lang.String.firstUp(propertyName);
        if(style[prefixedProp] !== undefined){
          return prefixedProp;
        };
      };
      return null;
    },
    getAppliedStyle : function(element, propertyName, value, prefixed){
      var vendorPrefixes = (prefixed !== false) ? [null].concat(this.VENDOR_PREFIXES) : [null];
      for(var i = 0,l = vendorPrefixes.length;i < l;i++){
        var prefixedVal = vendorPrefixes[i] ? "-" + vendorPrefixes[i].toLowerCase() + "-" + value : value;
        try{
          element.style[propertyName] = prefixedVal;
          if(typeof element.style[propertyName] == "string" && element.style[propertyName] !== ""){
            return prefixedVal;
          };
        } catch(ex) {
        };
      };
      return null;
    }
  }
});
qx.Bootstrap.define("qx.bom.element.BoxSizing", {
  statics : {
    __nativeBorderBox : {
      tags : {
        button : true,
        select : true
      },
      types : {
        search : true,
        button : true,
        submit : true,
        reset : true,
        checkbox : true,
        radio : true
      }
    },
    __usesNativeBorderBox : function(element){
      var map = this.__nativeBorderBox;
      return map.tags[element.tagName.toLowerCase()] || map.types[element.type];
    },
    compile : function(value){
      if(qx.core.Environment.get("css.boxsizing")){
        var prop = qx.lang.String.hyphenate(qx.core.Environment.get("css.boxsizing"));
        return prop + ":" + value + ";";
      } else {
        {
        };
      };
    },
    get : function(element){
      if(qx.core.Environment.get("css.boxsizing")){
        return qx.bom.element.Style.get(element, "boxSizing", null, false) || "";
      };
      if(qx.bom.Document.isStandardMode(qx.dom.Node.getWindow(element))){
        if(!this.__usesNativeBorderBox(element)){
          return "content-box";
        };
      };
      return "border-box";
    },
    set : function(element, value){
      if(qx.core.Environment.get("css.boxsizing")){
        try{
          element.style[qx.core.Environment.get("css.boxsizing")] = value;
        } catch(ex) {
          {
          };
        };
      } else {
        {
        };
      };
    },
    reset : function(element){
      this.set(element, "");
    }
  }
});
qx.Bootstrap.define("qx.bom.client.Css", {
  statics : {
    __WEBKIT_LEGACY_GRADIENT : null,
    getBoxModel : function(){
      var content = qx.bom.client.Engine.getName() !== "mshtml" || !qx.bom.client.Browser.getQuirksMode();
      return content ? "content" : "border";
    },
    getTextOverflow : function(){
      return qx.bom.Style.getPropertyName("textOverflow");
    },
    getPlaceholder : function(){
      var i = document.createElement("input");
      return "placeholder" in i;
    },
    getAppearance : function(){
      return qx.bom.Style.getPropertyName("appearance");
    },
    getBorderRadius : function(){
      return qx.bom.Style.getPropertyName("borderRadius");
    },
    getBoxShadow : function(){
      return qx.bom.Style.getPropertyName("boxShadow");
    },
    getBorderImage : function(){
      return qx.bom.Style.getPropertyName("borderImage");
    },
    getBorderImageSyntax : function(){
      var styleName = qx.bom.client.Css.getBorderImage();
      if(!styleName){
        return null;
      };
      var variants = [{
        standard : true,
        syntax : 'url("foo.png") 4 4 4 4 fill stretch',
        regEx : /foo\.png.*?4.*?fill.*?stretch/
      }, {
        standard : false,
        syntax : 'url("foo.png") 4 4 4 4 stretch',
        regEx : /foo\.png.*?4 4 4 4 stretch/
      }];
      for(var i = 0,l = variants.length;i < l;i++){
        var el = document.createElement("div");
        el.style[styleName] = variants[i].syntax;
        if(variants[i].regEx.exec(el.style[styleName]) || el.style.borderImageSlice && el.style.borderImageSlice == "4 fill"){
          return variants[i].standard;
        };
      };
      return null;
    },
    getUserSelect : function(){
      return qx.bom.Style.getPropertyName("userSelect");
    },
    getUserSelectNone : function(){
      var styleProperty = qx.bom.client.Css.getUserSelect();
      if(styleProperty){
        var el = document.createElement("span");
        el.style[styleProperty] = "-moz-none";
        return el.style[styleProperty] === "-moz-none" ? "-moz-none" : "none";
      };
      return null;
    },
    getUserModify : function(){
      return qx.bom.Style.getPropertyName("userModify");
    },
    getFloat : function(){
      var style = document.documentElement.style;
      return style.cssFloat !== undefined ? "cssFloat" : style.styleFloat !== undefined ? "styleFloat" : null;
    },
    getTranslate3d : function(){
      return 'WebKitCSSMatrix' in window && 'm11' in new WebKitCSSMatrix();
    },
    getLinearGradient : function(){
      qx.bom.client.Css.__WEBKIT_LEGACY_GRADIENT = false;
      var value = "linear-gradient(0deg, #fff, #000)";
      var el = document.createElement("div");
      var style = qx.bom.Style.getAppliedStyle(el, "backgroundImage", value);
      if(!style){
        value = "-webkit-gradient(linear,0% 0%,100% 100%,from(white), to(red))";
        var style = qx.bom.Style.getAppliedStyle(el, "backgroundImage", value, false);
        if(style){
          qx.bom.client.Css.__WEBKIT_LEGACY_GRADIENT = true;
        };
      };
      if(!style){
        return null;
      };
      var match = /(.*?)\(/.exec(style);
      return match ? match[1] : null;
    },
    getFilterGradient : function(){
      var value = "progid:DXImageTransform.Microsoft.gradient(" + "startColorStr=#550000FF, endColorStr=#55FFFF00)";
      var el = document.createElement("div");
      el.style.filter = value;
      return el.style.filter == value;
    },
    getRadialGradient : function(){
      var value = "radial-gradient(0px 0px, cover, red 50%, blue 100%)";
      var el = document.createElement("div");
      var style = qx.bom.Style.getAppliedStyle(el, "backgroundImage", value);
      if(!style){
        return null;
      };
      var match = /(.*?)\(/.exec(style);
      return match ? match[1] : null;
    },
    getLegacyWebkitGradient : function(){
      if(qx.bom.client.Css.__WEBKIT_LEGACY_GRADIENT === null){
        qx.bom.client.Css.getLinearGradient();
      };
      return qx.bom.client.Css.__WEBKIT_LEGACY_GRADIENT;
    },
    getRgba : function(){
      var el;
      try{
        el = document.createElement("div");
      } catch(ex) {
        el = document.createElement();
      };
      try{
        el.style["color"] = "rgba(1, 2, 3, 0.5)";
        if(el.style["color"].indexOf("rgba") != -1){
          return true;
        };
      } catch(ex) {
      };
      return false;
    },
    getBoxSizing : function(){
      return qx.bom.Style.getPropertyName("boxSizing");
    },
    getInlineBlock : function(){
      var el = document.createElement("span");
      el.style.display = "inline-block";
      if(el.style.display == "inline-block"){
        return "inline-block";
      };
      el.style.display = "-moz-inline-box";
      if(el.style.display !== "-moz-inline-box"){
        return "-moz-inline-box";
      };
      return null;
    },
    getOpacity : function(){
      return (typeof document.documentElement.style.opacity == "string");
    },
    getOverflowXY : function(){
      return (typeof document.documentElement.style.overflowX == "string") && (typeof document.documentElement.style.overflowY == "string");
    },
    getTextShadow : function(){
      var value = "red 1px 1px 3px";
      var el = document.createElement("div");
      var style = qx.bom.Style.getAppliedStyle(el, "textShadow", value);
      return !style;
    },
    getFilterTextShadow : function(){
      var value = "progid:DXImageTransform.Microsoft.Shadow(color=#666666,direction=45);";
      var el = document.createElement("div");
      el.style.filter = value;
      return el.style.filter == value;
    }
  },
  defer : function(statics){
    qx.core.Environment.add("css.textoverflow", statics.getTextOverflow);
    qx.core.Environment.add("css.placeholder", statics.getPlaceholder);
    qx.core.Environment.add("css.borderradius", statics.getBorderRadius);
    qx.core.Environment.add("css.boxshadow", statics.getBoxShadow);
    qx.core.Environment.add("css.gradient.linear", statics.getLinearGradient);
    qx.core.Environment.add("css.gradient.filter", statics.getFilterGradient);
    qx.core.Environment.add("css.gradient.radial", statics.getRadialGradient);
    qx.core.Environment.add("css.gradient.legacywebkit", statics.getLegacyWebkitGradient);
    qx.core.Environment.add("css.boxmodel", statics.getBoxModel);
    qx.core.Environment.add("css.rgba", statics.getRgba);
    qx.core.Environment.add("css.borderimage", statics.getBorderImage);
    qx.core.Environment.add("css.borderimage.standardsyntax", statics.getBorderImageSyntax);
    qx.core.Environment.add("css.usermodify", statics.getUserModify);
    qx.core.Environment.add("css.userselect", statics.getUserSelect);
    qx.core.Environment.add("css.userselect.none", statics.getUserSelectNone);
    qx.core.Environment.add("css.appearance", statics.getAppearance);
    qx.core.Environment.add("css.float", statics.getFloat);
    qx.core.Environment.add("css.boxsizing", statics.getBoxSizing);
    qx.core.Environment.add("css.inlineblock", statics.getInlineBlock);
    qx.core.Environment.add("css.opacity", statics.getOpacity);
    qx.core.Environment.add("css.overflowxy", statics.getOverflowXY);
    qx.core.Environment.add("css.textShadow", statics.getTextShadow);
    qx.core.Environment.add("css.textShadow.filter", statics.getFilterTextShadow);
  }
});
qx.Bootstrap.define("qx.bom.client.Browser", {
  statics : {
    getName : function(){
      var agent = navigator.userAgent;
      var reg = new RegExp("(" + qx.bom.client.Browser.__agents + ")(/| )([0-9]+\.[0-9])");
      var match = agent.match(reg);
      if(!match){
        return "";
      };
      var name = match[1].toLowerCase();
      var engine = qx.bom.client.Engine.getName();
      if(engine === "webkit"){
        if(name === "android"){
          name = "mobile chrome";
        } else if(agent.indexOf("Mobile Safari") !== -1 || agent.indexOf("Mobile/") !== -1){
          name = "mobile safari";
        };
      } else if(engine === "mshtml"){
        if(name === "msie"){
          name = "ie";
          if(qx.bom.client.OperatingSystem.getVersion() === "ce"){
            name = "iemobile";
          };
        };
      } else if(engine === "opera"){
        if(name === "opera mobi"){
          name = "operamobile";
        } else if(name === "opera mini"){
          name = "operamini";
        };
      } else if(engine === "gecko"){
        if(agent.indexOf("Maple") !== -1){
          name = "maple";
        };
      };;;
      return name;
    },
    getVersion : function(){
      var agent = navigator.userAgent;
      var reg = new RegExp("(" + qx.bom.client.Browser.__agents + ")(/| )([0-9]+\.[0-9])");
      var match = agent.match(reg);
      if(!match){
        return "";
      };
      var name = match[1].toLowerCase();
      var version = match[3];
      if(agent.match(/Version(\/| )([0-9]+\.[0-9])/)){
        version = RegExp.$2;
      };
      if(qx.bom.client.Engine.getName() == "mshtml"){
        version = qx.bom.client.Engine.getVersion();
        if(name === "msie" && qx.bom.client.OperatingSystem.getVersion() == "ce"){
          version = "5.0";
        };
      };
      if(qx.bom.client.Browser.getName() == "maple"){
        reg = new RegExp("(Maple )([0-9]+\.[0-9]+\.[0-9]*)");
        match = agent.match(reg);
        if(!match){
          return "";
        };
        version = match[2];
      };
      return version;
    },
    getDocumentMode : function(){
      if(document.documentMode){
        return document.documentMode;
      };
      return 0;
    },
    getQuirksMode : function(){
      if(qx.bom.client.Engine.getName() == "mshtml" && parseFloat(qx.bom.client.Engine.getVersion()) >= 8){
        return qx.bom.client.Engine.DOCUMENT_MODE === 5;
      } else {
        return document.compatMode !== "CSS1Compat";
      };
    },
    __agents : {
      "webkit" : "AdobeAIR|Titanium|Fluid|Chrome|Android|Epiphany|Konqueror|iCab|OmniWeb|Maxthon|Pre|Mobile Safari|Safari",
      "gecko" : "prism|Fennec|Camino|Kmeleon|Galeon|Netscape|SeaMonkey|Namoroka|Firefox",
      "mshtml" : "IEMobile|Maxthon|MSIE",
      "opera" : "Opera Mini|Opera Mobi|Opera"
    }[qx.bom.client.Engine.getName()]
  },
  defer : function(statics){
    qx.core.Environment.add("browser.name", statics.getName),qx.core.Environment.add("browser.version", statics.getVersion),qx.core.Environment.add("browser.documentmode", statics.getDocumentMode),qx.core.Environment.add("browser.quirksmode", statics.getQuirksMode);
  }
});
qx.Bootstrap.define("qx.bom.client.OperatingSystem", {
  statics : {
    getName : function(){
      if(!navigator){
        return "";
      };
      var input = navigator.platform || "";
      var agent = navigator.userAgent || "";
      if(input.indexOf("Windows") != -1 || input.indexOf("Win32") != -1 || input.indexOf("Win64") != -1){
        return "win";
      } else if(input.indexOf("Macintosh") != -1 || input.indexOf("MacPPC") != -1 || input.indexOf("MacIntel") != -1 || input.indexOf("Mac OS X") != -1){
        return "osx";
      } else if(agent.indexOf("RIM Tablet OS") != -1){
        return "rim_tabletos";
      } else if(agent.indexOf("webOS") != -1){
        return "webos";
      } else if(input.indexOf("iPod") != -1 || input.indexOf("iPhone") != -1 || input.indexOf("iPad") != -1){
        return "ios";
      } else if(agent.indexOf("Android") != -1){
        return "android";
      } else if(input.indexOf("Linux") != -1){
        return "linux";
      } else if(input.indexOf("X11") != -1 || input.indexOf("BSD") != -1 || input.indexOf("Darwin") != -1){
        return "unix";
      } else if(input.indexOf("SymbianOS") != -1){
        return "symbian";
      } else if(input.indexOf("BlackBerry") != -1){
        return "blackberry";
      };;;;;;;;;
      return "";
    },
    __ids : {
      "Windows NT 6.2" : "8",
      "Windows NT 6.1" : "7",
      "Windows NT 6.0" : "vista",
      "Windows NT 5.2" : "2003",
      "Windows NT 5.1" : "xp",
      "Windows NT 5.0" : "2000",
      "Windows 2000" : "2000",
      "Windows NT 4.0" : "nt4",
      "Win 9x 4.90" : "me",
      "Windows CE" : "ce",
      "Windows 98" : "98",
      "Win98" : "98",
      "Windows 95" : "95",
      "Win95" : "95",
      "Mac OS X 10_7" : "10.7",
      "Mac OS X 10.7" : "10.7",
      "Mac OS X 10_6" : "10.6",
      "Mac OS X 10.6" : "10.6",
      "Mac OS X 10_5" : "10.5",
      "Mac OS X 10.5" : "10.5",
      "Mac OS X 10_4" : "10.4",
      "Mac OS X 10.4" : "10.4",
      "Mac OS X 10_3" : "10.3",
      "Mac OS X 10.3" : "10.3",
      "Mac OS X 10_2" : "10.2",
      "Mac OS X 10.2" : "10.2",
      "Mac OS X 10_1" : "10.1",
      "Mac OS X 10.1" : "10.1",
      "Mac OS X 10_0" : "10.0",
      "Mac OS X 10.0" : "10.0"
    },
    getVersion : function(){
      var str = [];
      for(var key in qx.bom.client.OperatingSystem.__ids){
        str.push(key);
      };
      var reg = new RegExp("(" + str.join("|").replace(/\./g, "\.") + ")", "g");
      var match = reg.exec(navigator.userAgent);
      if(match && match[1]){
        return qx.bom.client.OperatingSystem.__ids[match[1]];
      };
      return "";
    }
  },
  defer : function(statics){
    qx.core.Environment.add("os.name", statics.getName);
    qx.core.Environment.add("os.version", statics.getVersion);
  }
});
qx.Bootstrap.define("qx.bom.element.Cursor", {
  statics : {
    __map : qx.core.Environment.select("engine.name", {
      "mshtml" : {
        "cursor" : "hand",
        "ew-resize" : "e-resize",
        "ns-resize" : "n-resize",
        "nesw-resize" : "ne-resize",
        "nwse-resize" : "nw-resize"
      },
      "opera" : {
        "col-resize" : "e-resize",
        "row-resize" : "n-resize",
        "ew-resize" : "e-resize",
        "ns-resize" : "n-resize",
        "nesw-resize" : "ne-resize",
        "nwse-resize" : "nw-resize"
      },
      "default" : {
      }
    }),
    compile : function(cursor){
      return "cursor:" + (this.__map[cursor] || cursor) + ";";
    },
    get : function(element, mode){
      return qx.bom.element.Style.get(element, "cursor", mode, false);
    },
    set : function(element, value){
      element.style.cursor = this.__map[value] || value;
    },
    reset : function(element){
      element.style.cursor = "";
    }
  }
});
qx.Bootstrap.define("qx.lang.Object", {
  statics : {
    empty : function(map){
      {
      };
      for(var key in map){
        if(map.hasOwnProperty(key)){
          delete map[key];
        };
      };
    },
    isEmpty : function(map){
      {
      };
      for(var key in map){
        return false;
      };
      return true;
    },
    hasMinLength : function(map, minLength){
      {
      };
      if(minLength <= 0){
        return true;
      };
      var length = 0;
      for(var key in map){
        if((++length) >= minLength){
          return true;
        };
      };
      return false;
    },
    getLength : qx.Bootstrap.objectGetLength,
    getKeys : qx.Bootstrap.getKeys,
    getKeysAsString : qx.Bootstrap.getKeysAsString,
    getValues : function(map){
      {
      };
      var arr = [];
      var keys = this.getKeys(map);
      for(var i = 0,l = keys.length;i < l;i++){
        arr.push(map[keys[i]]);
      };
      return arr;
    },
    mergeWith : qx.Bootstrap.objectMergeWith,
    carefullyMergeWith : function(target, source){
      {
      };
      return qx.lang.Object.mergeWith(target, source, false);
    },
    merge : function(target, varargs){
      {
      };
      var len = arguments.length;
      for(var i = 1;i < len;i++){
        qx.lang.Object.mergeWith(target, arguments[i]);
      };
      return target;
    },
    clone : function(source, deep){
      if(qx.lang.Type.isObject(source)){
        var clone = {
        };
        for(var key in source){
          if(deep){
            clone[key] = qx.lang.Object.clone(source[key], deep);
          } else {
            clone[key] = source[key];
          };
        };
        return clone;
      } else if(qx.lang.Type.isArray(source)){
        var clone = [];
        for(var i = 0;i < source.length;i++){
          if(deep){
            clone[i] = qx.lang.Object.clone(source[i]);
          } else {
            clone[i] = source[i];
          };
        };
        return clone;
      };
      return source;
    },
    invert : function(map){
      {
      };
      var result = {
      };
      for(var key in map){
        result[map[key].toString()] = key;
      };
      return result;
    },
    getKeyFromValue : function(map, value){
      {
      };
      for(var key in map){
        if(map.hasOwnProperty(key) && map[key] === value){
          return key;
        };
      };
      return null;
    },
    contains : function(map, value){
      {
      };
      return this.getKeyFromValue(map, value) !== null;
    },
    select : function(key, map){
      {
      };
      return map[key];
    },
    fromArray : function(array){
      {
      };
      var obj = {
      };
      for(var i = 0,l = array.length;i < l;i++){
        {
        };
        obj[array[i].toString()] = true;
      };
      return obj;
    },
    toUriParameter : function(obj, post){
      var key,parts = [];
      for(key in obj){
        if(obj.hasOwnProperty(key)){
          var value = obj[key];
          if(value instanceof Array){
            for(var i = 0;i < value.length;i++){
              this.__toUriParameter(key, value[i], parts, post);
            };
          } else {
            this.__toUriParameter(key, value, parts, post);
          };
        };
      };
      return parts.join("&");
    },
    __toUriParameter : function(key, value, parts, post){
      var encode = window.encodeURIComponent;
      if(post){
        parts.push(encode(key).replace(/%20/g, "+") + "=" + encode(value).replace(/%20/g, "+"));
      } else {
        parts.push(encode(key) + "=" + encode(value));
      };
    }
  }
});
qx.Bootstrap.define("qx.lang.Type", {
  statics : {
    getClass : qx.Bootstrap.getClass,
    isString : qx.Bootstrap.isString,
    isArray : qx.Bootstrap.isArray,
    isObject : qx.Bootstrap.isObject,
    isFunction : qx.Bootstrap.isFunction,
    isRegExp : function(value){
      return this.getClass(value) == "RegExp";
    },
    isNumber : function(value){
      return (value !== null && (this.getClass(value) == "Number" || value instanceof Number));
    },
    isBoolean : function(value){
      return (value !== null && (this.getClass(value) == "Boolean" || value instanceof Boolean));
    },
    isDate : function(value){
      return (value !== null && (this.getClass(value) == "Date" || value instanceof Date));
    },
    isError : function(value){
      return (value !== null && (this.getClass(value) == "Error" || value instanceof Error));
    }
  }
});
qx.Bootstrap.define("qx.bom.element.Overflow", {
  statics : {
    DEFAULT_SCROLLBAR_WIDTH : 14,
    __scrollbarSize : null,
    getScrollbarWidth : function(){
      if(this.__scrollbarSize !== null){
        return this.__scrollbarSize;
      };
      var Style = qx.bom.element.Style;
      var getStyleSize = function(el, propertyName){
        return parseInt(Style.get(el, propertyName), 10) || 0;
      };
      var getBorderRight = function(el){
        return (Style.get(el, "borderRightStyle") == "none" ? 0 : getStyleSize(el, "borderRightWidth"));
      };
      var getBorderLeft = function(el){
        return (Style.get(el, "borderLeftStyle") == "none" ? 0 : getStyleSize(el, "borderLeftWidth"));
      };
      var getInsetRight = qx.core.Environment.select("engine.name", {
        "mshtml" : function(el){
          if(Style.get(el, "overflowY") == "hidden" || el.clientWidth == 0){
            return getBorderRight(el);
          };
          return Math.max(0, el.offsetWidth - el.clientLeft - el.clientWidth);
        },
        "default" : function(el){
          if(el.clientWidth == 0){
            var ov = Style.get(el, "overflow");
            var sbv = (ov == "scroll" || ov == "-moz-scrollbars-vertical" ? 16 : 0);
            return Math.max(0, getBorderRight(el) + sbv);
          };
          return Math.max(0, (el.offsetWidth - el.clientWidth - getBorderLeft(el)));
        }
      });
      var getScrollBarSizeRight = function(el){
        return getInsetRight(el) - getBorderRight(el);
      };
      var t = document.createElement("div");
      var s = t.style;
      s.height = s.width = "100px";
      s.overflow = "scroll";
      document.body.appendChild(t);
      var c = getScrollBarSizeRight(t);
      this.__scrollbarSize = c;
      document.body.removeChild(t);
      return this.__scrollbarSize;
    },
    _compile : function(prop, value){
      if(!qx.core.Environment.get("css.overflowxy")){
        prop = "overflow:";
        if(qx.core.Environment.get("engine.name") === "gecko" && value == "hidden"){
          value = "-moz-scrollbars-none";
        };
      };
      return prop + ":" + value + ";";
    },
    compileX : function(value){
      return this._compile("overflow-x", value);
    },
    compileY : function(value){
      return this._compile("overflow-y", value);
    },
    getX : function(element, mode){
      if(qx.core.Environment.get("css.overflowxy")){
        return qx.bom.element.Style.get(element, "overflowX", mode, false);
      };
      var overflow = qx.bom.element.Style.get(element, "overflow", mode, false);
      if(overflow === "-moz-scrollbars-none"){
        overflow = "hidden";
      };
      return overflow;
    },
    setX : function(element, value){
      if(qx.core.Environment.get("css.overflowxy")){
        element.style.overflowX = value;
      } else {
        if(value === "hidden" && qx.core.Environment.get("engine.name") === "gecko" && parseFloat(qx.core.Environment.get("engine.version")) < 1.8){
          value = "-moz-scrollbars-none";
        };
        element.style.overflow = value;
      };
    },
    resetX : function(element){
      if(qx.core.Environment.get("css.overflowxy")){
        element.style.overflowX = "";
      } else {
        element.style.overflow = "";
      };
    },
    getY : function(element, mode){
      if(qx.core.Environment.get("css.overflowxy")){
        return qx.bom.element.Style.get(element, "overflowY", mode, false);
      };
      var overflow = qx.bom.element.Style.get(element, "overflow", mode, false);
      if(overflow === "-moz-scrollbars-none"){
        overflow = "hidden";
      };
      return overflow;
    },
    setY : function(element, value){
      if(qx.core.Environment.get("css.overflowxy")){
        element.style.overflowY = value;
      } else {
        if(value === "hidden" && qx.core.Environment.get("engine.name") === "gecko" && parseFloat(qx.core.Environment.get("engine.version")) < 1.8){
          value = "-moz-scrollbars-none";
        };
        element.style.overflow = value;
      };
    },
    resetY : function(element){
      if(qx.core.Environment.get("css.overflowxy")){
        element.style.overflowY = "";
      } else {
        element.style.overflow = "";
      };
    }
  }
});
qx.Bootstrap.define("qx.bom.element.Opacity", {
  statics : {
    SUPPORT_CSS3_OPACITY : false,
    compile : qx.core.Environment.select("engine.name", {
      "mshtml" : function(opacity){
        if(opacity >= 1){
          opacity = 1;
        };
        if(opacity < 0.00001){
          opacity = 0;
        };
        if(qx.bom.element.Opacity.SUPPORT_CSS3_OPACITY){
          return "opacity:" + opacity + ";";
        } else {
          return "zoom:1;filter:alpha(opacity=" + (opacity * 100) + ");";
        };
      },
      "gecko" : function(opacity){
        if(opacity >= 1){
          opacity = 0.999999;
        };
        return "opacity:" + opacity + ";";
      },
      "default" : function(opacity){
        if(opacity >= 1){
          return "";
        };
        return "opacity:" + opacity + ";";
      }
    }),
    set : qx.core.Environment.select("engine.name", {
      "mshtml" : function(element, opacity){
        if(qx.bom.element.Opacity.SUPPORT_CSS3_OPACITY){
          if(opacity >= 1){
            opacity = "";
          };
          element.style.opacity = opacity;
        } else {
          var filter = qx.bom.element.Style.get(element, "filter", qx.bom.element.Style.COMPUTED_MODE, false);
          if(opacity >= 1){
            opacity = 1;
          };
          if(opacity < 0.00001){
            opacity = 0;
          };
          if(!element.currentStyle || !element.currentStyle.hasLayout){
            element.style.zoom = 1;
          };
          element.style.filter = filter.replace(/alpha\([^\)]*\)/gi, "") + "alpha(opacity=" + opacity * 100 + ")";
        };
      },
      "gecko" : function(element, opacity){
        if(opacity >= 1){
          opacity = 0.999999;
        };
        if(!qx.bom.element.Opacity.SUPPORT_CSS3_OPACITY){
          element.style.MozOpacity = opacity;
        } else {
          element.style.opacity = opacity;
        };
      },
      "default" : function(element, opacity){
        if(opacity >= 1){
          opacity = "";
        };
        element.style.opacity = opacity;
      }
    }),
    reset : qx.core.Environment.select("engine.name", {
      "mshtml" : function(element){
        if(qx.bom.element.Opacity.SUPPORT_CSS3_OPACITY){
          element.style.opacity = "";
        } else {
          var filter = qx.bom.element.Style.get(element, "filter", qx.bom.element.Style.COMPUTED_MODE, false);
          element.style.filter = filter.replace(/alpha\([^\)]*\)/gi, "");
        };
      },
      "gecko" : function(element){
        if(!qx.bom.element.Opacity.SUPPORT_CSS3_OPACITY){
          element.style.MozOpacity = "";
        } else {
          element.style.opacity = "";
        };
      },
      "default" : function(element){
        element.style.opacity = "";
      }
    }),
    get : qx.core.Environment.select("engine.name", {
      "mshtml" : function(element, mode){
        if(qx.bom.element.Opacity.SUPPORT_CSS3_OPACITY){
          var opacity = qx.bom.element.Style.get(element, "opacity", mode, false);
          if(opacity != null){
            return parseFloat(opacity);
          };
          return 1.0;
        } else {
          var filter = qx.bom.element.Style.get(element, "filter", mode, false);
          if(filter){
            var opacity = filter.match(/alpha\(opacity=(.*)\)/);
            if(opacity && opacity[1]){
              return parseFloat(opacity[1]) / 100;
            };
          };
          return 1.0;
        };
      },
      "gecko" : function(element, mode){
        var opacity = qx.bom.element.Style.get(element, !qx.bom.element.Opacity.SUPPORT_CSS3_OPACITY ? "MozOpacity" : "opacity", mode, false);
        if(opacity == 0.999999){
          opacity = 1.0;
        };
        if(opacity != null){
          return parseFloat(opacity);
        };
        return 1.0;
      },
      "default" : function(element, mode){
        var opacity = qx.bom.element.Style.get(element, "opacity", mode, false);
        if(opacity != null){
          return parseFloat(opacity);
        };
        return 1.0;
      }
    })
  },
  defer : function(statics){
    statics.SUPPORT_CSS3_OPACITY = qx.core.Environment.get("css.opacity");
  }
});
qx.Bootstrap.define("qx.bom.element.Style", {
  statics : {
    __detectVendorProperties : function(){
      var styleNames = {
        "appearance" : qx.core.Environment.get("css.appearance"),
        "userSelect" : qx.core.Environment.get("css.userselect"),
        "textOverflow" : qx.core.Environment.get("css.textoverflow"),
        "borderImage" : qx.core.Environment.get("css.borderimage"),
        "float" : qx.core.Environment.get("css.float"),
        "userModify" : qx.core.Environment.get("css.usermodify"),
        "boxSizing" : qx.core.Environment.get("css.boxsizing")
      };
      this.__cssNames = {
      };
      for(var key in qx.lang.Object.clone(styleNames)){
        if(!styleNames[key]){
          delete styleNames[key];
        } else {
          this.__cssNames[key] = key == "float" ? "float" : qx.lang.String.hyphenate(styleNames[key]);
        };
      };
      this.__styleNames = styleNames;
    },
    __getStyleName : function(name){
      var styleName = qx.bom.Style.getPropertyName(name);
      if(styleName){
        this.__styleNames[name] = styleName;
      };
      return styleName;
    },
    __mshtmlPixel : {
      width : "pixelWidth",
      height : "pixelHeight",
      left : "pixelLeft",
      right : "pixelRight",
      top : "pixelTop",
      bottom : "pixelBottom"
    },
    __special : {
      clip : qx.bom.element.Clip,
      cursor : qx.bom.element.Cursor,
      opacity : qx.bom.element.Opacity,
      boxSizing : qx.bom.element.BoxSizing,
      overflowX : {
        set : qx.lang.Function.bind(qx.bom.element.Overflow.setX, qx.bom.element.Overflow),
        get : qx.lang.Function.bind(qx.bom.element.Overflow.getX, qx.bom.element.Overflow),
        reset : qx.lang.Function.bind(qx.bom.element.Overflow.resetX, qx.bom.element.Overflow),
        compile : qx.lang.Function.bind(qx.bom.element.Overflow.compileX, qx.bom.element.Overflow)
      },
      overflowY : {
        set : qx.lang.Function.bind(qx.bom.element.Overflow.setY, qx.bom.element.Overflow),
        get : qx.lang.Function.bind(qx.bom.element.Overflow.getY, qx.bom.element.Overflow),
        reset : qx.lang.Function.bind(qx.bom.element.Overflow.resetY, qx.bom.element.Overflow),
        compile : qx.lang.Function.bind(qx.bom.element.Overflow.compileY, qx.bom.element.Overflow)
      }
    },
    compile : function(map){
      var html = [];
      var special = this.__special;
      var names = this.__cssNames;
      var name,value;
      for(name in map){
        value = map[name];
        if(value == null){
          continue;
        };
        name = names[name] || name;
        if(special[name]){
          html.push(special[name].compile(value));
        } else {
          html.push(qx.lang.String.hyphenate(name), ":", value, ";");
        };
      };
      return html.join("");
    },
    setCss : function(element, value){
      if(qx.core.Environment.get("engine.name") === "mshtml" && parseInt(qx.core.Environment.get("browser.documentmode"), 10) < 8){
        element.style.cssText = value;
      } else {
        element.setAttribute("style", value);
      };
    },
    getCss : function(element){
      if(qx.core.Environment.get("engine.name") === "mshtml" && parseInt(qx.core.Environment.get("browser.documentmode"), 10) < 8){
        return element.style.cssText.toLowerCase();
      } else {
        return element.getAttribute("style");
      };
    },
    isPropertySupported : function(propertyName){
      return (this.__special[propertyName] || this.__styleNames[propertyName] || propertyName in document.documentElement.style);
    },
    COMPUTED_MODE : 1,
    CASCADED_MODE : 2,
    LOCAL_MODE : 3,
    set : function(element, name, value, smart){
      {
      };
      name = this.__styleNames[name] || this.__getStyleName(name) || name;
      if(smart !== false && this.__special[name]){
        return this.__special[name].set(element, value);
      } else {
        element.style[name] = value !== null ? value : "";
      };
    },
    setStyles : function(element, styles, smart){
      {
      };
      var styleNames = this.__styleNames;
      var special = this.__special;
      var style = element.style;
      for(var key in styles){
        var value = styles[key];
        var name = styleNames[key] || this.__getStyleName(key) || key;
        if(value === undefined){
          if(smart !== false && special[name]){
            special[name].reset(element);
          } else {
            style[name] = "";
          };
        } else {
          if(smart !== false && special[name]){
            special[name].set(element, value);
          } else {
            style[name] = value !== null ? value : "";
          };
        };
      };
    },
    reset : function(element, name, smart){
      name = this.__styleNames[name] || this.__getStyleName(name) || name;
      if(smart !== false && this.__special[name]){
        return this.__special[name].reset(element);
      } else {
        element.style[name] = "";
      };
    },
    get : qx.core.Environment.select("engine.name", {
      "mshtml" : function(element, name, mode, smart){
        name = this.__styleNames[name] || this.__getStyleName(name) || name;
        if(smart !== false && this.__special[name]){
          return this.__special[name].get(element, mode);
        };
        if(!element.currentStyle){
          return element.style[name] || "";
        };
        switch(mode){case this.LOCAL_MODE:        return element.style[name] || "";case this.CASCADED_MODE:        return element.currentStyle[name] || "";default:        var currentStyle = element.currentStyle[name] || "";
        if(/^-?[\.\d]+(px)?$/i.test(currentStyle)){
          return currentStyle;
        };
        var pixel = this.__mshtmlPixel[name];
        if(pixel){
          var localStyle = element.style[name];
          element.style[name] = currentStyle || 0;
          var value = element.style[pixel] + "px";
          element.style[name] = localStyle;
          return value;
        };
        if(/^-?[\.\d]+(em|pt|%)?$/i.test(currentStyle)){
          throw new Error("Untranslated computed property value: " + name + ". Only pixel values work well across different clients.");
        };
        return currentStyle;};
      },
      "default" : function(element, name, mode, smart){
        name = this.__styleNames[name] || this.__getStyleName(name) || name;
        if(smart !== false && this.__special[name]){
          return this.__special[name].get(element, mode);
        };
        switch(mode){case this.LOCAL_MODE:        return element.style[name] || "";case this.CASCADED_MODE:        if(element.currentStyle){
          return element.currentStyle[name] || "";
        };
        throw new Error("Cascaded styles are not supported in this browser!");default:        var doc = qx.dom.Node.getDocument(element);
        var computed = doc.defaultView.getComputedStyle(element, null);
        return computed ? computed[name] : "";};
      }
    })
  },
  defer : function(statics){
    statics.__detectVendorProperties();
  }
});
qx.Bootstrap.define("qx.dom.Node", {
  statics : {
    ELEMENT : 1,
    ATTRIBUTE : 2,
    TEXT : 3,
    CDATA_SECTION : 4,
    ENTITY_REFERENCE : 5,
    ENTITY : 6,
    PROCESSING_INSTRUCTION : 7,
    COMMENT : 8,
    DOCUMENT : 9,
    DOCUMENT_TYPE : 10,
    DOCUMENT_FRAGMENT : 11,
    NOTATION : 12,
    getDocument : function(node){
      return node.nodeType === this.DOCUMENT ? node : node.ownerDocument || node.document;
    },
    getWindow : function(node){
      if(node.nodeType == null){
        return node;
      };
      if(node.nodeType !== this.DOCUMENT){
        node = node.ownerDocument;
      };
      return node.defaultView || node.parentWindow;
    },
    getDocumentElement : function(node){
      return this.getDocument(node).documentElement;
    },
    getBodyElement : function(node){
      return this.getDocument(node).body;
    },
    isNode : function(node){
      return !!(node && node.nodeType != null);
    },
    isElement : function(node){
      return !!(node && node.nodeType === this.ELEMENT);
    },
    isDocument : function(node){
      return !!(node && node.nodeType === this.DOCUMENT);
    },
    isText : function(node){
      return !!(node && node.nodeType === this.TEXT);
    },
    isWindow : function(obj){
      return !!(obj && obj.history && obj.location && obj.document);
    },
    isNodeName : function(node, nodeName){
      if(!nodeName || !node || !node.nodeName){
        return false;
      };
      return nodeName.toLowerCase() == qx.dom.Node.getName(node);
    },
    getName : function(node){
      if(!node || !node.nodeName){
        return null;
      };
      return node.nodeName.toLowerCase();
    },
    getText : function(node){
      if(!node || !node.nodeType){
        return null;
      };
      switch(node.nodeType){case 1:      var i,a = [],nodes = node.childNodes,length = nodes.length;
      for(i = 0;i < length;i++){
        a[i] = this.getText(nodes[i]);
      };
      return a.join("");case 2:case 3:case 4:      return node.nodeValue;};
      return null;
    },
    isBlockNode : function(node){
      if(!qx.dom.Node.isElement(node)){
        return false;
      };
      node = qx.dom.Node.getName(node);
      return /^(body|form|textarea|fieldset|ul|ol|dl|dt|dd|li|div|hr|p|h[1-6]|quote|pre|table|thead|tbody|tfoot|tr|td|th|iframe|address|blockquote)$/.test(node);
    }
  }
});
qx.Bootstrap.define("qx.bom.Document", {
  statics : {
    isQuirksMode : qx.core.Environment.select("engine.name", {
      "mshtml" : function(win){
        if(qx.core.Environment.get("engine.version") >= 8){
          return (win || window).document.documentMode === 5;
        } else {
          return (win || window).document.compatMode !== "CSS1Compat";
        };
      },
      "webkit" : function(win){
        if(document.compatMode === undefined){
          var el = (win || window).document.createElement("div");
          el.style.cssText = "position:absolute;width:0;height:0;width:1";
          return el.style.width === "1px" ? true : false;
        } else {
          return (win || window).document.compatMode !== "CSS1Compat";
        };
      },
      "default" : function(win){
        return (win || window).document.compatMode !== "CSS1Compat";
      }
    }),
    isStandardMode : function(win){
      return !this.isQuirksMode(win);
    },
    getWidth : function(win){
      var doc = (win || window).document;
      var view = qx.bom.Viewport.getWidth(win);
      var scroll = this.isStandardMode(win) ? doc.documentElement.scrollWidth : doc.body.scrollWidth;
      return Math.max(scroll, view);
    },
    getHeight : function(win){
      var doc = (win || window).document;
      var view = qx.bom.Viewport.getHeight(win);
      var scroll = this.isStandardMode(win) ? doc.documentElement.scrollHeight : doc.body.scrollHeight;
      return Math.max(scroll, view);
    }
  }
});
qx.Bootstrap.define("qx.bom.Viewport", {
  statics : {
    getWidth : function(win){
      var win = win || window;
      var doc = win.document;
      return qx.bom.Document.isStandardMode(win) ? doc.documentElement.clientWidth : doc.body.clientWidth;
    },
    getHeight : function(win){
      var win = win || window;
      var doc = win.document;
      return qx.bom.Document.isStandardMode(win) ? doc.documentElement.clientHeight : doc.body.clientHeight;
    },
    getScrollLeft : function(win){
      var doc = (win || window).document;
      return (win || window).pageXOffset || doc.documentElement.scrollLeft || doc.body.scrollLeft;
    },
    getScrollTop : function(win){
      var doc = (win || window).document;
      return (win || window).pageYOffset || doc.documentElement.scrollTop || doc.body.scrollTop;
    },
    __getOrientationNormalizer : function(){
      var currentOrientation = this.getWidth() > this.getHeight() ? 90 : 0;
      var deviceOrientation = window.orientation;
      if(deviceOrientation == null || Math.abs(deviceOrientation % 180) == currentOrientation){
        return {
          "-270" : 90,
          "-180" : 180,
          "-90" : -90,
          "0" : 0,
          "90" : 90,
          "180" : 180,
          "270" : -90
        };
      } else {
        return {
          "-270" : 180,
          "-180" : -90,
          "-90" : 0,
          "0" : 90,
          "90" : 180,
          "180" : -90,
          "270" : 0
        };
      };
    },
    __orientationNormalizer : null,
    getOrientation : function(win){
      var orientation = (win || window).orientation;
      if(orientation == null){
        orientation = this.getWidth(win) > this.getHeight(win) ? 90 : 0;
      } else {
        orientation = this.__orientationNormalizer[orientation];
      };
      return orientation;
    },
    isLandscape : function(win){
      return Math.abs(this.getOrientation(win)) == 90;
    },
    isPortrait : function(win){
      return Math.abs(this.getOrientation(win)) !== 90;
    }
  },
  defer : function(statics){
    statics.__orientationNormalizer = statics.__getOrientationNormalizer();
  }
});
qx.Bootstrap.define("qx.bom.client.Html", {
  statics : {
    getWebWorker : function(){
      return window.Worker != null;
    },
    getFileReader : function(){
      return window.FileReader != null;
    },
    getGeoLocation : function(){
      return navigator.geolocation != null;
    },
    getAudio : function(){
      return !!document.createElement('audio').canPlayType;
    },
    getAudioOgg : function(){
      if(!qx.bom.client.Html.getAudio()){
        return "";
      };
      var a = document.createElement("audio");
      return a.canPlayType("audio/ogg");
    },
    getAudioMp3 : function(){
      if(!qx.bom.client.Html.getAudio()){
        return "";
      };
      var a = document.createElement("audio");
      return a.canPlayType("audio/mpeg");
    },
    getAudioWav : function(){
      if(!qx.bom.client.Html.getAudio()){
        return "";
      };
      var a = document.createElement("audio");
      return a.canPlayType("audio/x-wav");
    },
    getAudioAu : function(){
      if(!qx.bom.client.Html.getAudio()){
        return "";
      };
      var a = document.createElement("audio");
      return a.canPlayType("audio/basic");
    },
    getAudioAif : function(){
      if(!qx.bom.client.Html.getAudio()){
        return "";
      };
      var a = document.createElement("audio");
      return a.canPlayType("audio/x-aiff");
    },
    getVideo : function(){
      return !!document.createElement('video').canPlayType;
    },
    getVideoOgg : function(){
      if(!qx.bom.client.Html.getVideo()){
        return "";
      };
      var v = document.createElement("video");
      return v.canPlayType('video/ogg; codecs="theora, vorbis"');
    },
    getVideoH264 : function(){
      if(!qx.bom.client.Html.getVideo()){
        return "";
      };
      var v = document.createElement("video");
      return v.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"');
    },
    getVideoWebm : function(){
      if(!qx.bom.client.Html.getVideo()){
        return "";
      };
      var v = document.createElement("video");
      return v.canPlayType('video/webm; codecs="vp8, vorbis"');
    },
    getLocalStorage : function(){
      try{
        return window.localStorage != null;
      } catch(exc) {
        return false;
      };
    },
    getSessionStorage : function(){
      try{
        return window.sessionStorage != null;
      } catch(exc) {
        return false;
      };
    },
    getUserDataStorage : function(){
      var el = document.createElement("div");
      el.style["display"] = "none";
      document.getElementsByTagName("head")[0].appendChild(el);
      var supported = false;
      try{
        el.addBehavior("#default#userdata");
        el.load("qxtest");
        supported = true;
      } catch(e) {
      };
      document.getElementsByTagName("head")[0].removeChild(el);
      return supported;
    },
    getClassList : function(){
      return !!(document.documentElement.classList && qx.Bootstrap.getClass(document.documentElement.classList) === "DOMTokenList");
    },
    getXPath : function(){
      return !!document.evaluate;
    },
    getXul : function(){
      try{
        document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "label");
        return true;
      } catch(e) {
        return false;
      };
    },
    getSvg : function(){
      return document.implementation && document.implementation.hasFeature && (document.implementation.hasFeature("org.w3c.dom.svg", "1.0") || document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1"));
    },
    getVml : function(){
      return qx.bom.client.Engine.getName() == "mshtml";
    },
    getCanvas : function(){
      return !!window.CanvasRenderingContext2D;
    },
    getDataUrl : function(callback){
      var data = new Image();
      data.onload = data.onerror = function(){
        window.setTimeout(function(){
          callback.call(null, (data.width == 1 && data.height == 1));
        }, 0);
      };
      data.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
    },
    getDataset : function(){
      return !!document.documentElement.dataset;
    },
    getContains : function(){
      return (typeof document.documentElement.contains !== "undefined");
    },
    getCompareDocumentPosition : function(){
      return (typeof document.documentElement.compareDocumentPosition === "function");
    },
    getTextContent : function(){
      var el = document.createElement("span");
      return (typeof el.textContent !== "undefined");
    },
    getConsole : function(){
      return typeof window.console !== "undefined";
    },
    getNaturalDimensions : function(){
      var img = document.createElement("img");
      return typeof img.naturalHeight === "number" && typeof img.naturalWidth === "number";
    }
  },
  defer : function(statics){
    qx.core.Environment.add("html.webworker", statics.getWebWorker);
    qx.core.Environment.add("html.filereader", statics.getFileReader);
    qx.core.Environment.add("html.geolocation", statics.getGeoLocation);
    qx.core.Environment.add("html.audio", statics.getAudio);
    qx.core.Environment.add("html.audio.ogg", statics.getAudioOgg);
    qx.core.Environment.add("html.audio.mp3", statics.getAudioMp3);
    qx.core.Environment.add("html.audio.wav", statics.getAudioWav);
    qx.core.Environment.add("html.audio.au", statics.getAudioAu);
    qx.core.Environment.add("html.audio.aif", statics.getAudioAif);
    qx.core.Environment.add("html.video", statics.getVideo);
    qx.core.Environment.add("html.video.ogg", statics.getVideoOgg);
    qx.core.Environment.add("html.video.h264", statics.getVideoH264);
    qx.core.Environment.add("html.video.webm", statics.getVideoWebm);
    qx.core.Environment.add("html.storage.local", statics.getLocalStorage);
    qx.core.Environment.add("html.storage.session", statics.getSessionStorage);
    qx.core.Environment.add("html.storage.userdata", statics.getUserDataStorage);
    qx.core.Environment.add("html.classlist", statics.getClassList);
    qx.core.Environment.add("html.xpath", statics.getXPath);
    qx.core.Environment.add("html.xul", statics.getXul);
    qx.core.Environment.add("html.canvas", statics.getCanvas);
    qx.core.Environment.add("html.svg", statics.getSvg);
    qx.core.Environment.add("html.vml", statics.getVml);
    qx.core.Environment.add("html.dataset", statics.getDataset);
    qx.core.Environment.addAsync("html.dataurl", statics.getDataUrl);
    qx.core.Environment.add("html.element.contains", statics.getContains);
    qx.core.Environment.add("html.element.compareDocumentPosition", statics.getCompareDocumentPosition);
    qx.core.Environment.add("html.element.textcontent", statics.getTextContent);
    qx.core.Environment.add("html.console", statics.getConsole);
    qx.core.Environment.add("html.image.naturaldimensions", statics.getNaturalDimensions);
  }
});
qx.Bootstrap.define("qx.bom.element.Class", {
  statics : {
    __splitter : /\s+/g,
    __trim : /^\s+|\s+$/g,
    add : qx.lang.Object.select(qx.core.Environment.get("html.classlist") ? "native" : "default", {
      "native" : function(element, name){
        element.classList.add(name);
        return name;
      },
      "default" : function(element, name){
        if(!this.has(element, name)){
          element.className += (element.className ? " " : "") + name;
        };
        return name;
      }
    }),
    addClasses : qx.lang.Object.select(qx.core.Environment.get("html.classlist") ? "native" : "default", {
      "native" : function(element, classes){
        for(var i = 0;i < classes.length;i++){
          element.classList.add(classes[i]);
        };
        return element.className;
      },
      "default" : function(element, classes){
        var keys = {
        };
        var result;
        var old = element.className;
        if(old){
          result = old.split(this.__splitter);
          for(var i = 0,l = result.length;i < l;i++){
            keys[result[i]] = true;
          };
          for(var i = 0,l = classes.length;i < l;i++){
            if(!keys[classes[i]]){
              result.push(classes[i]);
            };
          };
        } else {
          result = classes;
        };
        return element.className = result.join(" ");
      }
    }),
    get : function(element){
      var className = element.className;
      if(typeof className.split !== 'function'){
        if(typeof className === 'object'){
          if(qx.Bootstrap.getClass(className) == 'SVGAnimatedString'){
            className = className.baseVal;
          } else {
            {
            };
            className = '';
          };
        };
        if(typeof className === 'undefined'){
          {
          };
          className = '';
        };
      };
      return className;
    },
    has : qx.lang.Object.select(qx.core.Environment.get("html.classlist") ? "native" : "default", {
      "native" : function(element, name){
        return element.classList.contains(name);
      },
      "default" : function(element, name){
        var regexp = new RegExp("(^|\\s)" + name + "(\\s|$)");
        return regexp.test(element.className);
      }
    }),
    remove : qx.lang.Object.select(qx.core.Environment.get("html.classlist") ? "native" : "default", {
      "native" : function(element, name){
        element.classList.remove(name);
        return name;
      },
      "default" : function(element, name){
        var regexp = new RegExp("(^|\\s)" + name + "(\\s|$)");
        element.className = element.className.replace(regexp, "$2");
        return name;
      }
    }),
    removeClasses : qx.lang.Object.select(qx.core.Environment.get("html.classlist") ? "native" : "default", {
      "native" : function(element, classes){
        for(var i = 0;i < classes.length;i++){
          element.classList.remove(classes[i]);
        };
        return element.className;
      },
      "default" : function(element, classes){
        var reg = new RegExp("\\b" + classes.join("\\b|\\b") + "\\b", "g");
        return element.className = element.className.replace(reg, "").replace(this.__trim, "").replace(this.__splitter, " ");
      }
    }),
    replace : function(element, oldName, newName){
      this.remove(element, oldName);
      return this.add(element, newName);
    },
    toggle : qx.lang.Object.select(qx.core.Environment.get("html.classlist") ? "native" : "default", {
      "native" : function(element, name, toggle){
        if(toggle === undefined){
          element.classList.toggle(name);
        } else {
          toggle ? this.add(element, name) : this.remove(element, name);
        };
        return name;
      },
      "default" : function(element, name, toggle){
        if(toggle == null){
          toggle = !this.has(element, name);
        };
        toggle ? this.add(element, name) : this.remove(element, name);
        return name;
      }
    })
  }
});
qx.Bootstrap.define("qx.bom.element.Dimension", {
  statics : {
    getWidth : qx.core.Environment.select("engine.name", {
      "gecko" : function(element){
        if(element.getBoundingClientRect){
          var rect = element.getBoundingClientRect();
          return Math.round(rect.right) - Math.round(rect.left);
        } else {
          return element.offsetWidth;
        };
      },
      "default" : function(element){
        return element.offsetWidth;
      }
    }),
    getHeight : qx.core.Environment.select("engine.name", {
      "gecko" : function(element){
        if(element.getBoundingClientRect){
          var rect = element.getBoundingClientRect();
          return Math.round(rect.bottom) - Math.round(rect.top);
        } else {
          return element.offsetHeight;
        };
      },
      "default" : function(element){
        return element.offsetHeight;
      }
    }),
    getSize : function(element){
      return {
        width : this.getWidth(element),
        height : this.getHeight(element)
      };
    },
    __hiddenScrollbars : {
      visible : true,
      hidden : true
    },
    getContentWidth : function(element){
      var Style = qx.bom.element.Style;
      var overflowX = qx.bom.element.Overflow.getX(element);
      var paddingLeft = parseInt(Style.get(element, "paddingLeft") || "0px", 10);
      var paddingRight = parseInt(Style.get(element, "paddingRight") || "0px", 10);
      if(this.__hiddenScrollbars[overflowX]){
        var contentWidth = element.clientWidth;
        if((qx.core.Environment.get("engine.name") == "opera") || qx.dom.Node.isBlockNode(element)){
          contentWidth = contentWidth - paddingLeft - paddingRight;
        };
        return contentWidth;
      } else {
        if(element.clientWidth >= element.scrollWidth){
          return Math.max(element.clientWidth, element.scrollWidth) - paddingLeft - paddingRight;
        } else {
          var width = element.scrollWidth - paddingLeft;
          if(qx.core.Environment.get("engine.name") == "mshtml" && qx.core.Environment.get("engine.version") >= 6){
            width -= paddingRight;
          };
          return width;
        };
      };
    },
    getContentHeight : function(element){
      var Style = qx.bom.element.Style;
      var overflowY = qx.bom.element.Overflow.getY(element);
      var paddingTop = parseInt(Style.get(element, "paddingTop") || "0px", 10);
      var paddingBottom = parseInt(Style.get(element, "paddingBottom") || "0px", 10);
      if(this.__hiddenScrollbars[overflowY]){
        return element.clientHeight - paddingTop - paddingBottom;
      } else {
        if(element.clientHeight >= element.scrollHeight){
          return Math.max(element.clientHeight, element.scrollHeight) - paddingTop - paddingBottom;
        } else {
          var height = element.scrollHeight - paddingTop;
          if(qx.core.Environment.get("engine.name") == "mshtml" && qx.core.Environment.get("engine.version") == 6){
            height -= paddingBottom;
          };
          return height;
        };
      };
    },
    getContentSize : function(element){
      return {
        width : this.getContentWidth(element),
        height : this.getContentHeight(element)
      };
    }
  }
});
qx.Bootstrap.define("qx.bom.element.Location", {
  statics : {
    __style : function(elem, style){
      return qx.bom.element.Style.get(elem, style, qx.bom.element.Style.COMPUTED_MODE, false);
    },
    __num : function(elem, style){
      return parseInt(qx.bom.element.Style.get(elem, style, qx.bom.element.Style.COMPUTED_MODE, false), 10) || 0;
    },
    __computeScroll : function(elem){
      var left = 0,top = 0;
      var win = qx.dom.Node.getWindow(elem);
      left -= qx.bom.Viewport.getScrollLeft(win);
      top -= qx.bom.Viewport.getScrollTop(win);
      return {
        left : left,
        top : top
      };
    },
    __computeBody : qx.core.Environment.select("engine.name", {
      "mshtml" : function(elem){
        var doc = qx.dom.Node.getDocument(elem);
        var body = doc.body;
        var left = 0;
        var top = 0;
        left -= body.clientLeft + doc.documentElement.clientLeft;
        top -= body.clientTop + doc.documentElement.clientTop;
        if(!qx.core.Environment.get("browser.quirksmode")){
          left += this.__num(body, "borderLeftWidth");
          top += this.__num(body, "borderTopWidth");
        };
        return {
          left : left,
          top : top
        };
      },
      "webkit" : function(elem){
        var doc = qx.dom.Node.getDocument(elem);
        var body = doc.body;
        var left = body.offsetLeft;
        var top = body.offsetTop;
        if(parseFloat(qx.core.Environment.get("engine.version")) < 530.17){
          left += this.__num(body, "borderLeftWidth");
          top += this.__num(body, "borderTopWidth");
        };
        return {
          left : left,
          top : top
        };
      },
      "gecko" : function(elem){
        var body = qx.dom.Node.getDocument(elem).body;
        var left = body.offsetLeft;
        var top = body.offsetTop;
        if(parseFloat(qx.core.Environment.get("engine.version")) < 1.9){
          left += this.__num(body, "marginLeft");
          top += this.__num(body, "marginTop");
        };
        if(qx.bom.element.BoxSizing.get(body) !== "border-box"){
          left += this.__num(body, "borderLeftWidth");
          top += this.__num(body, "borderTopWidth");
        };
        return {
          left : left,
          top : top
        };
      },
      "default" : function(elem){
        var body = qx.dom.Node.getDocument(elem).body;
        var left = body.offsetLeft;
        var top = body.offsetTop;
        return {
          left : left,
          top : top
        };
      }
    }),
    __computeOffset : qx.core.Environment.select("engine.name", {
      "gecko" : function(elem){
        if(elem.getBoundingClientRect){
          var rect = elem.getBoundingClientRect();
          var left = Math.round(rect.left);
          var top = Math.round(rect.top);
        } else {
          var left = 0;
          var top = 0;
          var body = qx.dom.Node.getDocument(elem).body;
          var box = qx.bom.element.BoxSizing;
          if(box.get(elem) !== "border-box"){
            left -= this.__num(elem, "borderLeftWidth");
            top -= this.__num(elem, "borderTopWidth");
          };
          while(elem && elem !== body){
            left += elem.offsetLeft;
            top += elem.offsetTop;
            if(box.get(elem) !== "border-box"){
              left += this.__num(elem, "borderLeftWidth");
              top += this.__num(elem, "borderTopWidth");
            };
            if(elem.parentNode && this.__style(elem.parentNode, "overflow") != "visible"){
              left += this.__num(elem.parentNode, "borderLeftWidth");
              top += this.__num(elem.parentNode, "borderTopWidth");
            };
            elem = elem.offsetParent;
          };
        };
        return {
          left : left,
          top : top
        };
      },
      "default" : function(elem){
        var doc = qx.dom.Node.getDocument(elem);
        if(elem.getBoundingClientRect){
          var rect = elem.getBoundingClientRect();
          var left = rect.left;
          var top = rect.top;
        } else {
          var left = elem.offsetLeft;
          var top = elem.offsetTop;
          elem = elem.offsetParent;
          var body = doc.body;
          while(elem && elem != body){
            left += elem.offsetLeft;
            top += elem.offsetTop;
            left += this.__num(elem, "borderLeftWidth");
            top += this.__num(elem, "borderTopWidth");
            elem = elem.offsetParent;
          };
        };
        return {
          left : left,
          top : top
        };
      }
    }),
    get : function(elem, mode){
      if(elem.tagName == "BODY"){
        var location = this.__getBodyLocation(elem);
        var left = location.left;
        var top = location.top;
      } else {
        var body = this.__computeBody(elem);
        var offset = this.__computeOffset(elem);
        var scroll = this.__computeScroll(elem);
        var left = offset.left + body.left - scroll.left;
        var top = offset.top + body.top - scroll.top;
      };
      var right = left + elem.offsetWidth;
      var bottom = top + elem.offsetHeight;
      if(mode){
        if(mode == "padding" || mode == "scroll"){
          var overX = qx.bom.element.Overflow.getX(elem);
          if(overX == "scroll" || overX == "auto"){
            right += elem.scrollWidth - elem.offsetWidth + this.__num(elem, "borderLeftWidth") + this.__num(elem, "borderRightWidth");
          };
          var overY = qx.bom.element.Overflow.getY(elem);
          if(overY == "scroll" || overY == "auto"){
            bottom += elem.scrollHeight - elem.offsetHeight + this.__num(elem, "borderTopWidth") + this.__num(elem, "borderBottomWidth");
          };
        };
        switch(mode){case "padding":        left += this.__num(elem, "paddingLeft");
        top += this.__num(elem, "paddingTop");
        right -= this.__num(elem, "paddingRight");
        bottom -= this.__num(elem, "paddingBottom");case "scroll":        left -= elem.scrollLeft;
        top -= elem.scrollTop;
        right -= elem.scrollLeft;
        bottom -= elem.scrollTop;case "border":        left += this.__num(elem, "borderLeftWidth");
        top += this.__num(elem, "borderTopWidth");
        right -= this.__num(elem, "borderRightWidth");
        bottom -= this.__num(elem, "borderBottomWidth");
        break;case "margin":        left -= this.__num(elem, "marginLeft");
        top -= this.__num(elem, "marginTop");
        right += this.__num(elem, "marginRight");
        bottom += this.__num(elem, "marginBottom");
        break;};
      };
      return {
        left : left,
        top : top,
        right : right,
        bottom : bottom
      };
    },
    __getBodyLocation : function(body){
      var top = body.offsetTop;
      var left = body.offsetLeft;
      if(qx.core.Environment.get("engine.name") !== "mshtml" || !((parseFloat(qx.core.Environment.get("engine.version")) < 8 || qx.core.Environment.get("browser.documentmode") < 8) && !qx.core.Environment.get("browser.quirksmode"))){
        top += this.__num(body, "marginTop");
        left += this.__num(body, "marginLeft");
      };
      if(qx.core.Environment.get("engine.name") === "gecko"){
        top += this.__num(body, "borderLeftWidth");
        left += this.__num(body, "borderTopWidth");
      };
      return {
        left : left,
        top : top
      };
    },
    getLeft : function(elem, mode){
      return this.get(elem, mode).left;
    },
    getTop : function(elem, mode){
      return this.get(elem, mode).top;
    },
    getRight : function(elem, mode){
      return this.get(elem, mode).right;
    },
    getBottom : function(elem, mode){
      return this.get(elem, mode).bottom;
    },
    getRelative : function(elem1, elem2, mode1, mode2){
      var loc1 = this.get(elem1, mode1);
      var loc2 = this.get(elem2, mode2);
      return {
        left : loc1.left - loc2.left,
        top : loc1.top - loc2.top,
        right : loc1.right - loc2.right,
        bottom : loc1.bottom - loc2.bottom
      };
    },
    getPosition : function(elem){
      return this.getRelative(elem, this.getOffsetParent(elem));
    },
    getOffsetParent : function(element){
      var offsetParent = element.offsetParent || document.body;
      var Style = qx.bom.element.Style;
      while(offsetParent && (!/^body|html$/i.test(offsetParent.tagName) && Style.get(offsetParent, "position") === "static")){
        offsetParent = offsetParent.offsetParent;
      };
      return offsetParent;
    }
  }
});
qx.Bootstrap.define("qx.bom.Stylesheet", {
  statics : {
    includeFile : function(href, doc){
      if(!doc){
        doc = document;
      };
      var el = doc.createElement("link");
      el.type = "text/css";
      el.rel = "stylesheet";
      el.href = href;
      var head = doc.getElementsByTagName("head")[0];
      head.appendChild(el);
    },
    createElement : function(text){
      if(qx.core.Environment.get("html.stylesheet.createstylesheet")){
        var sheet = document.createStyleSheet();
        if(text){
          sheet.cssText = text;
        };
        return sheet;
      } else {
        var elem = document.createElement("style");
        elem.type = "text/css";
        if(text){
          elem.appendChild(document.createTextNode(text));
        };
        document.getElementsByTagName("head")[0].appendChild(elem);
        return elem.sheet;
      };
    },
    addRule : function(sheet, selector, entry){
      if(qx.core.Environment.get("html.stylesheet.insertrule")){
        sheet.insertRule(selector + "{" + entry + "}", sheet.cssRules.length);
      } else {
        sheet.addRule(selector, entry);
      };
    },
    removeRule : function(sheet, selector){
      if(qx.core.Environment.get("html.stylesheet.deleterule")){
        var rules = sheet.cssRules;
        var len = rules.length;
        for(var i = len - 1;i >= 0;--i){
          if(rules[i].selectorText == selector){
            sheet.deleteRule(i);
          };
        };
      } else {
        var rules = sheet.rules;
        var len = rules.length;
        for(var i = len - 1;i >= 0;--i){
          if(rules[i].selectorText == selector){
            sheet.removeRule(i);
          };
        };
      };
    },
    removeAllRules : function(sheet){
      if(qx.core.Environment.get("html.stylesheet.deleterule")){
        var rules = sheet.cssRules;
        var len = rules.length;
        for(var i = len - 1;i >= 0;i--){
          sheet.deleteRule(i);
        };
      } else {
        var rules = sheet.rules;
        var len = rules.length;
        for(var i = len - 1;i >= 0;i--){
          sheet.removeRule(i);
        };
      };
    },
    addImport : function(sheet, url){
      if(qx.core.Environment.get("html.stylesheet.addimport")){
        sheet.addImport(url);
      } else {
        sheet.insertRule('@import "' + url + '";', sheet.cssRules.length);
      };
    },
    removeImport : function(sheet, url){
      if(qx.core.Environment.get("html.stylesheet.removeimport")){
        var imports = sheet.imports;
        var len = imports.length;
        for(var i = len - 1;i >= 0;i--){
          if(imports[i].href == url || imports[i].href == qx.util.Uri.getAbsolute(url)){
            sheet.removeImport(i);
          };
        };
      } else {
        var rules = sheet.cssRules;
        var len = rules.length;
        for(var i = len - 1;i >= 0;i--){
          if(rules[i].href == url){
            sheet.deleteRule(i);
          };
        };
      };
    },
    removeAllImports : function(sheet){
      if(qx.core.Environment.get("html.stylesheet.removeimport")){
        var imports = sheet.imports;
        var len = imports.length;
        for(var i = len - 1;i >= 0;i--){
          sheet.removeImport(i);
        };
      } else {
        var rules = sheet.cssRules;
        var len = rules.length;
        for(var i = len - 1;i >= 0;i--){
          if(rules[i].type == rules[i].IMPORT_RULE){
            sheet.deleteRule(i);
          };
        };
      };
    }
  }
});
qx.Bootstrap.define("qx.bom.client.Stylesheet", {
  statics : {
    __getStylesheet : function(){
      if(!qx.bom.client.Stylesheet.__stylesheet){
        qx.bom.client.Stylesheet.__stylesheet = qx.bom.Stylesheet.createElement();
      };
      return qx.bom.client.Stylesheet.__stylesheet;
    },
    getCreateStyleSheet : function(){
      return typeof document.createStyleSheet === "object";
    },
    getInsertRule : function(){
      return typeof qx.bom.client.Stylesheet.__getStylesheet().insertRule === "function";
    },
    getDeleteRule : function(){
      return typeof qx.bom.client.Stylesheet.__getStylesheet().deleteRule === "function";
    },
    getAddImport : function(){
      return (typeof qx.bom.client.Stylesheet.__getStylesheet().addImport === "object");
    },
    getRemoveImport : function(){
      return (typeof qx.bom.client.Stylesheet.__getStylesheet().removeImport === "object");
    }
  },
  defer : function(statics){
    qx.core.Environment.add("html.stylesheet.createstylesheet", statics.getCreateStyleSheet);
    qx.core.Environment.add("html.stylesheet.insertrule", statics.getInsertRule);
    qx.core.Environment.add("html.stylesheet.deleterule", statics.getDeleteRule);
    qx.core.Environment.add("html.stylesheet.addimport", statics.getAddImport);
    qx.core.Environment.add("html.stylesheet.removeimport", statics.getRemoveImport);
  }
});
qx.Bootstrap.define("qx.util.Uri", {
  statics : {
    parseUri : function(str, strict){
      var options = {
        key : ["source", "protocol", "authority", "userInfo", "user", "password", "host", "port", "relative", "path", "directory", "file", "query", "anchor"],
        q : {
          name : "queryKey",
          parser : /(?:^|&)([^&=]*)=?([^&]*)/g
        },
        parser : {
          strict : /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
          loose : /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
        }
      };
      var o = options,m = options.parser[strict ? "strict" : "loose"].exec(str),uri = {
      },i = 14;
      while(i--){
        uri[o.key[i]] = m[i] || "";
      };
      uri[o.q.name] = {
      };
      uri[o.key[12]].replace(o.q.parser, function($0, $1, $2){
        if($1){
          uri[o.q.name][$1] = $2;
        };
      });
      return uri;
    },
    appendParamsToUrl : function(url, params){
      if(params === undefined){
        return url;
      };
      {
      };
      if(qx.lang.Type.isObject(params)){
        params = qx.lang.Object.toUriParameter(params);
      };
      if(!params){
        return url;
      };
      return url += (/\?/).test(url) ? "&" + params : "?" + params;
    },
    getAbsolute : function(uri){
      var div = document.createElement("div");
      div.innerHTML = '<a href="' + uri + '">0</a>';
      return div.firstChild.href;
    }
  }
});
qx.Bootstrap.define("qx.module.Attribute", {
  statics : {
    getHtml : function(){
      if(this[0]){
        return qx.bom.element.Attribute.get(this[0], "html");
      };
      return null;
    },
    setHtml : function(html){
      for(var i = 0;i < this.length;i++){
        qx.bom.element.Attribute.set(this[i], "html", html);
      };
      return this;
    },
    setAttribute : function(name, value){
      for(var i = 0;i < this.length;i++){
        qx.bom.element.Attribute.set(this[i], name, value);
      };
      return this;
    },
    getAttribute : function(name){
      if(this[0]){
        return qx.bom.element.Attribute.get(this[0], name);
      };
      return null;
    },
    removeAttribute : function(name){
      for(var i = 0;i < this.length;i++){
        qx.bom.element.Attribute.set(this[i], name, null);
      };
      return this;
    },
    setAttributes : function(attributes){
      for(var name in attributes){
        this.setAttribute(name, attributes[name]);
      };
      return this;
    },
    getAttributes : function(names){
      var attributes = {
      };
      for(var i = 0;i < names.length;i++){
        attributes[names[i]] = this.getAttribute(names[i]);
      };
      return attributes;
    },
    removeAttributes : function(attributes){
      for(var i = 0,l = attributes.length;i < l;i++){
        this.removeAttribute(attributes[i]);
      };
      return this;
    },
    setProperty : function(name, value){
      for(var i = 0;i < this.length;i++){
        this[i][name] = value;
      };
      return this;
    },
    getProperty : function(name){
      if(this[0]){
        return this[0][name];
      };
      return null;
    },
    setProperties : function(properties){
      for(var name in properties){
        this.setProperty(name, properties[name]);
      };
      return this;
    },
    getProperties : function(names){
      var properties = {
      };
      for(var i = 0;i < names.length;i++){
        properties[names[i]] = this.getProperty(names[i]);
      };
      return properties;
    },
    getValue : function(){
      if(this[0]){
        return qx.bom.Input.getValue(this[0]);
      };
      return null;
    },
    setValue : function(value){
      for(var i = 0,l = this.length;i < l;i++){
        qx.bom.Input.setValue(this[i], value);
      };
      return this;
    }
  },
  defer : function(statics){
    q.attach({
      "getHtml" : statics.getHtml,
      "setHtml" : statics.setHtml,
      "getAttribute" : statics.getAttribute,
      "setAttribute" : statics.setAttribute,
      "removeAttribute" : statics.removeAttribute,
      "getAttributes" : statics.getAttributes,
      "setAttributes" : statics.setAttributes,
      "removeAttributes" : statics.removeAttributes,
      "getProperty" : statics.getProperty,
      "setProperty" : statics.setProperty,
      "getProperties" : statics.getProperties,
      "setProperties" : statics.setProperties,
      "getValue" : statics.getValue,
      "setValue" : statics.setValue
    });
  }
});
qx.Bootstrap.define("qx.bom.element.Attribute", {
  statics : {
    __hints : {
      names : {
        "class" : "className",
        "for" : "htmlFor",
        html : "innerHTML",
        text : qx.core.Environment.get("html.element.textcontent") ? "textContent" : "innerText",
        colspan : "colSpan",
        rowspan : "rowSpan",
        valign : "vAlign",
        datetime : "dateTime",
        accesskey : "accessKey",
        tabindex : "tabIndex",
        maxlength : "maxLength",
        readonly : "readOnly",
        longdesc : "longDesc",
        cellpadding : "cellPadding",
        cellspacing : "cellSpacing",
        frameborder : "frameBorder",
        usemap : "useMap"
      },
      runtime : {
        "html" : 1,
        "text" : 1
      },
      bools : {
        compact : 1,
        nowrap : 1,
        ismap : 1,
        declare : 1,
        noshade : 1,
        checked : 1,
        disabled : 1,
        readOnly : 1,
        multiple : 1,
        selected : 1,
        noresize : 1,
        defer : 1,
        allowTransparency : 1
      },
      property : {
        $$html : 1,
        $$widget : 1,
        disabled : 1,
        checked : 1,
        readOnly : 1,
        multiple : 1,
        selected : 1,
        value : 1,
        maxLength : 1,
        className : 1,
        innerHTML : 1,
        innerText : 1,
        textContent : 1,
        htmlFor : 1,
        tabIndex : 1
      },
      qxProperties : {
        $$widget : 1,
        $$html : 1
      },
      propertyDefault : {
        disabled : false,
        checked : false,
        readOnly : false,
        multiple : false,
        selected : false,
        value : "",
        className : "",
        innerHTML : "",
        innerText : "",
        textContent : "",
        htmlFor : "",
        tabIndex : 0,
        maxLength : qx.core.Environment.select("engine.name", {
          "mshtml" : 2147483647,
          "webkit" : 524288,
          "default" : -1
        })
      },
      removeableProperties : {
        disabled : 1,
        multiple : 1,
        maxLength : 1
      },
      original : {
        href : 1,
        src : 1,
        type : 1
      }
    },
    compile : function(map){
      var html = [];
      var runtime = this.__hints.runtime;
      for(var key in map){
        if(!runtime[key]){
          html.push(key, "='", map[key], "'");
        };
      };
      return html.join("");
    },
    get : function(element, name){
      var hints = this.__hints;
      var value;
      name = hints.names[name] || name;
      if(qx.core.Environment.get("engine.name") == "mshtml" && parseInt(qx.core.Environment.get("browser.documentmode"), 10) < 8 && hints.original[name]){
        value = element.getAttribute(name, 2);
      } else if(hints.property[name]){
        value = element[name];
        if(typeof hints.propertyDefault[name] !== "undefined" && value == hints.propertyDefault[name]){
          if(typeof hints.bools[name] === "undefined"){
            return null;
          } else {
            return value;
          };
        };
      } else {
        value = element.getAttribute(name);
      };
      if(hints.bools[name]){
        return !!value;
      };
      return value;
    },
    set : function(element, name, value){
      if(typeof value === "undefined"){
        return;
      };
      var hints = this.__hints;
      name = hints.names[name] || name;
      if(hints.bools[name]){
        value = !!value;
      };
      if(hints.property[name] && (!(element[name] === undefined) || hints.qxProperties[name])){
        if(value == null){
          if(hints.removeableProperties[name]){
            element.removeAttribute(name);
            return;
          } else if(typeof hints.propertyDefault[name] !== "undefined"){
            value = hints.propertyDefault[name];
          };
        };
        element[name] = value;
      } else {
        if(value === true){
          element.setAttribute(name, name);
        } else if(value === false || value === null){
          element.removeAttribute(name);
        } else {
          element.setAttribute(name, value);
        };
      };
    },
    reset : function(element, name){
      this.set(element, name, null);
    }
  }
});
qx.Bootstrap.define("qx.bom.Input", {
  statics : {
    __types : {
      text : 1,
      textarea : 1,
      select : 1,
      checkbox : 1,
      radio : 1,
      password : 1,
      hidden : 1,
      submit : 1,
      image : 1,
      file : 1,
      search : 1,
      reset : 1,
      button : 1
    },
    create : function(type, attributes, win){
      {
      };
      var attributes = attributes ? qx.lang.Object.clone(attributes) : {
      };
      var tag;
      if(type === "textarea" || type === "select"){
        tag = type;
      } else {
        tag = "input";
        attributes.type = type;
      };
      return qx.dom.Element.create(tag, attributes, win);
    },
    setValue : function(element, value){
      var tag = element.nodeName.toLowerCase();
      var type = element.type;
      var Array = qx.lang.Array;
      var Type = qx.lang.Type;
      if(typeof value === "number"){
        value += "";
      };
      if((type === "checkbox" || type === "radio")){
        if(Type.isArray(value)){
          element.checked = Array.contains(value, element.value);
        } else {
          element.checked = element.value == value;
        };
      } else if(tag === "select"){
        var isArray = Type.isArray(value);
        var options = element.options;
        var subel,subval;
        for(var i = 0,l = options.length;i < l;i++){
          subel = options[i];
          subval = subel.getAttribute("value");
          if(subval == null){
            subval = subel.text;
          };
          subel.selected = isArray ? Array.contains(value, subval) : value == subval;
        };
        if(isArray && value.length == 0){
          element.selectedIndex = -1;
        };
      } else if((type === "text" || type === "textarea") && (qx.core.Environment.get("engine.name") == "mshtml")){
        element.$$inValueSet = true;
        element.value = value;
        element.$$inValueSet = null;
      } else {
        element.value = value;
      };;
    },
    getValue : function(element){
      var tag = element.nodeName.toLowerCase();
      if(tag === "option"){
        return (element.attributes.value || {
        }).specified ? element.value : element.text;
      };
      if(tag === "select"){
        var index = element.selectedIndex;
        if(index < 0){
          return null;
        };
        var values = [];
        var options = element.options;
        var one = element.type == "select-one";
        var clazz = qx.bom.Input;
        var value;
        for(var i = one ? index : 0,max = one ? index + 1 : options.length;i < max;i++){
          var option = options[i];
          if(option.selected){
            value = clazz.getValue(option);
            if(one){
              return value;
            };
            values.push(value);
          };
        };
        return values;
      } else {
        return (element.value || "").replace(/\r/g, "");
      };
    },
    setWrap : qx.core.Environment.select("engine.name", {
      "mshtml" : function(element, wrap){
        var wrapValue = wrap ? "soft" : "off";
        var styleValue = wrap ? "auto" : "";
        element.wrap = wrapValue;
        element.style.overflowY = styleValue;
      },
      "gecko|webkit" : function(element, wrap){
        var wrapValue = wrap ? "soft" : "off";
        var styleValue = wrap ? "" : "auto";
        element.setAttribute("wrap", wrapValue);
        element.style.overflow = styleValue;
      },
      "default" : function(element, wrap){
        element.style.whiteSpace = wrap ? "normal" : "nowrap";
      }
    })
  }
});
qx.Bootstrap.define("qx.dom.Element", {
  statics : {
    __initialAttributes : {
      "onload" : true,
      "onpropertychange" : true,
      "oninput" : true,
      "onchange" : true,
      "name" : true,
      "type" : true,
      "checked" : true,
      "disabled" : true
    },
    hasChild : function(parent, child){
      return child.parentNode === parent;
    },
    hasChildren : function(element){
      return !!element.firstChild;
    },
    hasChildElements : function(element){
      element = element.firstChild;
      while(element){
        if(element.nodeType === 1){
          return true;
        };
        element = element.nextSibling;
      };
      return false;
    },
    getParentElement : function(element){
      return element.parentNode;
    },
    isInDom : function(element, win){
      if(!win){
        win = window;
      };
      var domElements = win.document.getElementsByTagName(element.nodeName);
      for(var i = 0,l = domElements.length;i < l;i++){
        if(domElements[i] === element){
          return true;
        };
      };
      return false;
    },
    insertAt : function(node, parent, index){
      var ref = parent.childNodes[index];
      if(ref){
        parent.insertBefore(node, ref);
      } else {
        parent.appendChild(node);
      };
      return true;
    },
    insertBegin : function(node, parent){
      if(parent.firstChild){
        this.insertBefore(node, parent.firstChild);
      } else {
        parent.appendChild(node);
      };
    },
    insertEnd : function(node, parent){
      parent.appendChild(node);
    },
    insertBefore : function(node, ref){
      ref.parentNode.insertBefore(node, ref);
      return true;
    },
    insertAfter : function(node, ref){
      var parent = ref.parentNode;
      if(ref == parent.lastChild){
        parent.appendChild(node);
      } else {
        return this.insertBefore(node, ref.nextSibling);
      };
      return true;
    },
    remove : function(node){
      if(!node.parentNode){
        return false;
      };
      node.parentNode.removeChild(node);
      return true;
    },
    removeChild : function(node, parent){
      if(node.parentNode !== parent){
        return false;
      };
      parent.removeChild(node);
      return true;
    },
    removeChildAt : function(index, parent){
      var child = parent.childNodes[index];
      if(!child){
        return false;
      };
      parent.removeChild(child);
      return true;
    },
    replaceChild : function(newNode, oldNode){
      if(!oldNode.parentNode){
        return false;
      };
      oldNode.parentNode.replaceChild(newNode, oldNode);
      return true;
    },
    replaceAt : function(newNode, index, parent){
      var oldNode = parent.childNodes[index];
      if(!oldNode){
        return false;
      };
      parent.replaceChild(newNode, oldNode);
      return true;
    },
    __helperElement : {
    },
    __allowMarkup : {
    },
    _allowCreationWithMarkup : function(win){
      if(!win){
        win = window;
      };
      var key = win.location.href;
      if(qx.dom.Element.__allowMarkup[key] == undefined){
        try{
          win.document.createElement("<INPUT TYPE='RADIO' NAME='RADIOTEST' VALUE='Second Choice'>");
          qx.dom.Element.__allowMarkup[key] = true;
        } catch(e) {
          qx.dom.Element.__allowMarkup[key] = false;
        };
      };
      return qx.dom.Element.__allowMarkup[key];
    },
    getHelperElement : function(win){
      if(!win){
        win = window;
      };
      var key = win.location.href;
      if(!qx.dom.Element.__helperElement[key]){
        var helper = qx.dom.Element.__helperElement[key] = win.document.createElement("div");
        if(qx.core.Environment.get("engine.name") == "webkit"){
          helper.style.display = "none";
          win.document.body.appendChild(helper);
        };
      };
      return qx.dom.Element.__helperElement[key];
    },
    create : function(name, attributes, win){
      if(!win){
        win = window;
      };
      if(!name){
        throw new Error("The tag name is missing!");
      };
      var initial = this.__initialAttributes;
      var attributesHtml = "";
      for(var key in attributes){
        if(initial[key]){
          attributesHtml += key + "='" + attributes[key] + "' ";
        };
      };
      var element;
      if(attributesHtml != ""){
        if(qx.dom.Element._allowCreationWithMarkup(win)){
          element = win.document.createElement("<" + name + " " + attributesHtml + ">");
        } else {
          var helper = qx.dom.Element.getHelperElement(win);
          helper.innerHTML = "<" + name + " " + attributesHtml + "></" + name + ">";
          element = helper.firstChild;
        };
      } else {
        element = win.document.createElement(name);
      };
      for(var key in attributes){
        if(!initial[key]){
          qx.bom.element.Attribute.set(element, key, attributes[key]);
        };
      };
      return element;
    },
    empty : function(element){
      return element.innerHTML = "";
    }
  }
});
qx.Bootstrap.define("qx.module.Manipulating", {
  statics : {
    create : function(html){
      return q.init(qx.bom.Html.clean([html]));
    },
    wrap : function(el){
      if(!qx.lang.Type.isArray(el)){
        el = [el];
      };
      return q.init(el);
    },
    clone : function(events){
      var clones = [];
      for(var i = 0;i < this.length;i++){
        clones.push(this[i].cloneNode(true));
      };
      if(events === true){
        this.copyEventsTo(clones);
      };
      return q.wrap(clones);
    },
    append : function(html){
      var arr = qx.bom.Html.clean([html]);
      var children = qx.lang.Array.cast(arr, qx.Collection);
      for(var i = 0,l = this.length;i < l;i++){
        for(var j = 0,m = children.length;j < m;j++){
          if(i == 0){
            qx.dom.Element.insertEnd(children[j], this[i]);
          } else {
            qx.dom.Element.insertEnd(children[j].cloneNode(true), this[i]);
          };
        };
      };
      return this;
    },
    appendTo : function(parent){
      if(!qx.lang.Type.isArray(parent)){
        var fromSelector = q(parent);
        parent = fromSelector.length > 0 ? fromSelector : [parent];
      };
      for(var i = 0,l = parent.length;i < l;i++){
        for(var j = 0,m = this.length;j < m;j++){
          if(i == 0){
            qx.dom.Element.insertEnd(this[j], parent[i]);
          } else {
            qx.dom.Element.insertEnd(this[j].cloneNode(true), parent[i]);
          };
        };
      };
      return this;
    },
    remove : function(){
      for(var i = 0;i < this.length;i++){
        qx.dom.Element.remove(this[i]);
      };
      return this;
    },
    empty : function(){
      for(var i = 0;i < this.length;i++){
        this[i].innerHTML = "";
      };
      return this;
    },
    before : function(args){
      if(!qx.lang.Type.isArray(args)){
        args = [args];
      };
      var fragment = document.createDocumentFragment();
      qx.bom.Html.clean(args, document, fragment);
      this.forEach(function(item, index){
        var kids = qx.lang.Array.cast(fragment.childNodes, Array);
        for(var i = 0,l = kids.length;i < l;i++){
          var child;
          if(index < this.length - 1){
            child = kids[i].cloneNode(true);
          } else {
            child = kids[i];
          };
          item.parentNode.insertBefore(child, item);
        };
      }, this);
      return this;
    },
    after : function(args){
      if(!qx.lang.Type.isArray(args)){
        args = [args];
      };
      var fragment = document.createDocumentFragment();
      qx.bom.Html.clean(args, document, fragment);
      this.forEach(function(item, index){
        var kids = qx.lang.Array.cast(fragment.childNodes, Array);
        for(var i = kids.length - 1;i >= 0;i--){
          var child;
          if(index < this.length - 1){
            child = kids[i].cloneNode(true);
          } else {
            child = kids[i];
          };
          item.parentNode.insertBefore(child, item.nextSibling);
        };
      }, this);
      return this;
    },
    getScrollLeft : function(){
      var obj = this[0];
      if(!obj){
        return null;
      };
      var Node = qx.dom.Node;
      if(Node.isWindow(obj) || Node.isDocument(obj)){
        return qx.bom.Viewport.getScrollLeft();
      };
      return obj.scrollLeft;
    },
    getScrollTop : function(){
      var obj = this[0];
      if(!obj){
        return null;
      };
      var Node = qx.dom.Node;
      if(Node.isWindow(obj) || Node.isDocument(obj)){
        return qx.bom.Viewport.getScrollTop();
      };
      return obj.scrollTop;
    },
    setScrollLeft : function(value){
      var Node = qx.dom.Node;
      for(var i = 0,l = this.length,obj;i < l;i++){
        obj = this[i];
        if(Node.isElement(obj)){
          obj.scrollLeft = value;
        } else if(Node.isWindow(obj)){
          obj.scrollTo(value, this.getScrollTop(obj));
        } else if(Node.isDocument(obj)){
          Node.getWindow(obj).scrollTo(value, this.getScrollTop(obj));
        };;
      };
      return this;
    },
    setScrollTop : function(value){
      var Node = qx.dom.Node;
      for(var i = 0,l = this.length,obj;i < l;i++){
        obj = this[i];
        if(Node.isElement(obj)){
          obj.scrollTop = value;
        } else if(Node.isWindow(obj)){
          obj.scrollTo(this.getScrollLeft(obj), value);
        } else if(Node.isDocument(obj)){
          Node.getWindow(obj).scrollTo(this.getScrollLeft(obj), value);
        };;
      };
      return this;
    },
    focus : function(){
      try{
        this[0].focus();
      } catch(ex) {
      };
      return this;
    },
    blur : function(){
      this.forEach(function(item, index){
        try{
          item.blur();
        } catch(ex) {
        };
      });
      return this;
    }
  },
  defer : function(statics){
    q.attachStatic({
      "create" : statics.create,
      "wrap" : statics.wrap
    });
    q.attach({
      "append" : statics.append,
      "appendTo" : statics.appendTo,
      "remove" : statics.remove,
      "empty" : statics.empty,
      "before" : statics.before,
      "after" : statics.after,
      "clone" : statics.clone,
      "getScrollLeft" : statics.getScrollLeft,
      "setScrollLeft" : statics.setScrollLeft,
      "getScrollTop" : statics.getScrollTop,
      "setScrollTop" : statics.setScrollTop,
      "focus" : statics.focus,
      "blur" : statics.blur
    });
  }
});
qx.Bootstrap.define("qx.bom.Html", {
  statics : {
    __fixNonDirectlyClosableHelper : function(all, front, tag){
      return tag.match(/^(abbr|br|col|img|input|link|meta|param|hr|area|embed)$/i) ? all : front + "></" + tag + ">";
    },
    __convertMap : {
      opt : [1, "<select multiple='multiple'>", "</select>"],
      leg : [1, "<fieldset>", "</fieldset>"],
      table : [1, "<table>", "</table>"],
      tr : [2, "<table><tbody>", "</tbody></table>"],
      td : [3, "<table><tbody><tr>", "</tr></tbody></table>"],
      col : [2, "<table><tbody></tbody><colgroup>", "</colgroup></table>"],
      def : qx.core.Environment.select("engine.name", {
        "mshtml" : [1, "div<div>", "</div>"],
        "default" : null
      })
    },
    __convertHtmlString : function(html, context){
      var div = context.createElement("div");
      html = html.replace(/(<(\w+)[^>]*?)\/>/g, this.__fixNonDirectlyClosableHelper);
      var tags = html.replace(/^\s+/, "").substring(0, 5).toLowerCase();
      var wrap,map = this.__convertMap;
      if(!tags.indexOf("<opt")){
        wrap = map.opt;
      } else if(!tags.indexOf("<leg")){
        wrap = map.leg;
      } else if(tags.match(/^<(thead|tbody|tfoot|colg|cap)/)){
        wrap = map.table;
      } else if(!tags.indexOf("<tr")){
        wrap = map.tr;
      } else if(!tags.indexOf("<td") || !tags.indexOf("<th")){
        wrap = map.td;
      } else if(!tags.indexOf("<col")){
        wrap = map.col;
      } else {
        wrap = map.def;
      };;;;;
      if(wrap){
        div.innerHTML = wrap[1] + html + wrap[2];
        var depth = wrap[0];
        while(depth--){
          div = div.lastChild;
        };
      } else {
        div.innerHTML = html;
      };
      if((qx.core.Environment.get("engine.name") == "mshtml")){
        var hasBody = /<tbody/i.test(html);
        var tbody = !tags.indexOf("<table") && !hasBody ? div.firstChild && div.firstChild.childNodes : wrap[1] == "<table>" && !hasBody ? div.childNodes : [];
        for(var j = tbody.length - 1;j >= 0;--j){
          if(tbody[j].tagName.toLowerCase() === "tbody" && !tbody[j].childNodes.length){
            tbody[j].parentNode.removeChild(tbody[j]);
          };
        };
        if(/^\s/.test(html)){
          div.insertBefore(context.createTextNode(html.match(/^\s*/)[0]), div.firstChild);
        };
      };
      return qx.lang.Array.fromCollection(div.childNodes);
    },
    clean : function(objs, context, fragment){
      context = context || document;
      if(typeof context.createElement === "undefined"){
        context = context.ownerDocument || context[0] && context[0].ownerDocument || document;
      };
      if(!fragment && objs.length === 1 && typeof objs[0] === "string"){
        var match = /^<(\w+)\s*\/?>$/.exec(objs[0]);
        if(match){
          return [context.createElement(match[1])];
        };
      };
      var obj,ret = [];
      for(var i = 0,l = objs.length;i < l;i++){
        obj = objs[i];
        if(typeof obj === "string"){
          obj = this.__convertHtmlString(obj, context);
        };
        if(obj.nodeType){
          ret.push(obj);
        } else if(obj instanceof qx.type.BaseArray){
          ret.push.apply(ret, Array.prototype.slice.call(obj, 0));
        } else if(obj.toElement){
          ret.push(obj.toElement());
        } else {
          ret.push.apply(ret, obj);
        };;
      };
      if(fragment){
        var scripts = [],LArray = qx.lang.Array,elem,temp;
        for(var i = 0;ret[i];i++){
          elem = ret[i];
          if(elem.nodeType == 1 && elem.tagName.toLowerCase() === "script" && (!elem.type || elem.type.toLowerCase() === "text/javascript")){
            if(elem.parentNode){
              elem.parentNode.removeChild(ret[i]);
            };
            scripts.push(elem);
          } else {
            if(elem.nodeType === 1){
              temp = LArray.fromCollection(elem.getElementsByTagName("script"));
              ret.splice.apply(ret, [i + 1, 0].concat(temp));
            };
            fragment.appendChild(elem);
          };
        };
        return scripts;
      };
      return ret;
    }
  }
});
qx.Bootstrap.define("qx.module.Animation", {
  events : {
    "animationEnd" : undefined
  },
  statics : {
    init : function(){
      this.__animationHandles = [];
    },
    _fadeOut : {
      duration : 700,
      timing : "ease-out",
      keep : 100,
      keyFrames : {
        '0' : {
          opacity : 1
        },
        '100' : {
          opacity : 0,
          display : "none"
        }
      }
    },
    _fadeIn : {
      duration : 700,
      timing : "ease-in",
      keep : 100,
      keyFrames : {
        '0' : {
          opacity : 0
        },
        '100' : {
          opacity : 1
        }
      }
    },
    __setStyle : function(el, name, value){
      name = qx.lang.String.camelCase(name);
      if(qx && qx.bom && qx.bom.element && qx.bom.element.Style){
        qx.bom.element.Style.set(el, name, value);
      } else {
        el.style[name] = value;
      };
    },
    animate : function(desc, duration){
      this.__animate(desc, duration, false);
      return this;
    },
    animateReverese : function(desc, duration){
      this.__animate(desc, duration, true);
      return this;
    },
    __animate : function(desc, duration, reverse){
      if(this.__animationHandles.length > 0){
        throw new Error("Only one animation at a time.");
      };
      for(var i = 0;i < this.length;i++){
        if(reverse){
          var handle = qx.bom.element.Animation.animateReverse(this[i], desc, duration);
        } else {
          var handle = qx.bom.element.Animation.animate(this[i], desc, duration);
        };
        var self = this;
        handle.on("end", function(){
          var handles = self.__animationHandles;
          handles.splice(self.indexOf(handle), 1);
          if(handles.length == 0){
            self.emit("end");
          };
        }, handle);
        this.__animationHandles.push(handle);
      };
      return this;
    },
    play : function(){
      for(var i = 0;i < this.__animationHandles.length;i++){
        this.__animationHandles[i].play();
      };
      return this;
    },
    pause : function(){
      for(var i = 0;i < this.__animationHandles.length;i++){
        this.__animationHandles[i].pause();
      };
      return this;
    },
    stop : function(){
      for(var i = 0;i < this.__animationHandles.length;i++){
        this.__animationHandles[i].stop();
      };
      this.__animationHandles = [];
      return this;
    },
    isPlaying : function(){
      for(var i = 0;i < this.__animationHandles.length;i++){
        if(this.__animationHandles[i].isPlaying()){
          return true;
        };
      };
      return false;
    },
    isEnded : function(){
      for(var i = 0;i < this.__animationHandles.length;i++){
        if(!this.__animationHandles[i].isEnded()){
          return false;
        };
      };
      return true;
    },
    fadeIn : function(duration){
      return this.animate(qx.module.Animation._fadeIn, duration);
    },
    fadeOut : function(duration){
      return this.animate(qx.module.Animation._fadeOut, duration);
    }
  },
  defer : function(statics){
    q.attach({
      "animate" : statics.animate,
      "fadeIn" : statics.fadeIn,
      "fadeOut" : statics.fadeOut,
      "play" : statics.play,
      "pause" : statics.pause,
      "stop" : statics.stop,
      "isEnded" : statics.isEnded,
      "isPlaying" : statics.isPlaying
    });
    q.attachInit(statics.init);
  }
});
qx.Bootstrap.define("qx.bom.element.Animation", {
  statics : {
    animate : function(el, desc, duration){
      if(qx.core.Environment.get("css.animation")){
        return qx.bom.element.AnimationCss.animate(el, desc, duration);
      } else {
        return qx.bom.element.AnimationJs.animate(el, desc, duration);
      };
    },
    animateReverse : function(el, desc, duration){
      if(qx.core.Environment.get("css.animation")){
        return qx.bom.element.AnimationCss.animateReverse(el, desc, duration);
      } else {
        return qx.bom.element.AnimationJs.animateReverse(el, desc, duration);
      };
    }
  }
});
qx.Bootstrap.define("qx.bom.client.CssAnimation", {
  statics : {
    getSupport : function(){
      var name = qx.bom.client.CssAnimation.getName();
      if(name != null){
        return {
          "name" : name,
          "play-state" : qx.bom.client.CssAnimation.getPlayState(),
          "end-event" : qx.bom.client.CssAnimation.getAnimationEnd(),
          "keyframes" : qx.bom.client.CssAnimation.getKeyFrames()
        };
      };
      return null;
    },
    getPlayState : function(){
      return qx.bom.Style.getPropertyName("AnimationPlayState");
    },
    getName : function(){
      return qx.bom.Style.getPropertyName("animation");
    },
    getAnimationEnd : function(){
      var mapping = {
        "MsAnimation" : "MSAnimationEnd",
        "WebkitAnimation" : "webkitAnimationEnd",
        "MozAnimation" : "animationend",
        "OAnimation" : "oAnimationEnd"
      };
      return mapping[this.getName()];
    },
    getKeyFrames : function(){
      var prefixes = qx.bom.Style.VENDOR_PREFIXES;
      var keyFrames = [];
      for(var i = 0;i < prefixes.length;i++){
        keyFrames.push("@" + qx.lang.String.hyphenate(prefixes[i]) + "-keyframes");
      };
      keyFrames.unshift("@keyframes");
      var sheet = qx.bom.Stylesheet.createElement();
      for(var i = 0;i < keyFrames.length;i++){
        try{
          qx.bom.Stylesheet.addRule(sheet, keyFrames[i] + " name", "");
          return keyFrames[i];
        } catch(e) {
        };
      };
      return null;
    }
  },
  defer : function(statics){
    qx.core.Environment.add("css.animation", statics.getSupport);
  }
});
qx.Bootstrap.define("qx.bom.element.AnimationCss", {
  statics : {
    __sheet : null,
    __rulePrefix : "Anni",
    __id : 0,
    __rules : {
    },
    __transitionKeys : {
      "scale" : true,
      "rotate" : true,
      "skew" : true,
      "translate" : true
    },
    __cssAnimationKeys : qx.core.Environment.get("css.animation"),
    animateReverse : function(el, desc, duration){
      return this._animate(el, desc, duration, true);
    },
    animate : function(el, desc, duration){
      return this._animate(el, desc, duration, false);
    },
    _animate : function(el, desc, duration, reverse){
      this.__normalizeDesc(desc);
      if(desc.hasOwnProperty("reverse")){
        reverse = desc.reverse;
        {
        };
      };
      {
      };
      if(!this.__sheet){
        this.__sheet = qx.bom.Stylesheet.createElement();
      };
      var keyFrames = desc.keyFrames;
      if(duration == undefined){
        duration = desc.duration;
      };
      if(this.__cssAnimationKeys != null){
        var name = this.__addKeyFrames(keyFrames, reverse);
        var style = name + " " + duration + "ms " + desc.repeat + " " + desc.timing + " " + (desc.alternate ? "alternate" : "");
        var eventName = this.__cssAnimationKeys["end-event"];
        qx.bom.Event.addNativeListener(el, eventName, this.__onAnimationEnd);
        el.style[qx.lang.String.camelCase(this.__cssAnimationKeys["name"])] = style;
      };
      var animation = new qx.bom.element.AnimationHandle();
      animation.desc = desc;
      animation.el = el;
      el.$$animation = animation;
      if(desc.origin != null){
        qx.bom.element.Transform.setOrigin(el, desc.origin);
      };
      if(this.__cssAnimationKeys == null){
        window.setTimeout(function(){
          qx.bom.element.AnimationCss.__onAnimationEnd({
            target : el
          });
        }, 0);
      };
      return animation;
    },
    __onAnimationEnd : function(e){
      var el = e.target;
      var animation = el.$$animation;
      if(!animation){
        return;
      };
      var desc = animation.desc;
      if(qx.bom.element.AnimationCss.__cssAnimationKeys != null){
        var key = qx.lang.String.camelCase(qx.bom.element.AnimationCss.__cssAnimationKeys["name"]);
        el.style[key] = "";
        qx.bom.Event.removeNativeListener(el, qx.bom.element.AnimationCss.__cssAnimationKeys["name"], qx.bom.element.AnimationCss.__onAnimationEnd);
      };
      if(desc.origin != null){
        qx.bom.element.Transform.setOrigin(el, "");
      };
      if(desc.keep != null){
        qx.bom.element.AnimationCss.__keepFrame(el, desc.keyFrames[desc.keep]);
      };
      el.$$animation = null;
      animation.el = null;
      animation.ended = true;
      animation.emit("end", el);
    },
    __keepFrame : function(el, endFrame){
      var transforms;
      for(var style in endFrame){
        if(style in qx.bom.element.AnimationCss.__transitionKeys){
          if(!transforms){
            transforms = {
            };
          };
          transforms[style] = endFrame[style];
        } else {
          el.style[qx.lang.String.camelCase(style)] = endFrame[style];
        };
      };
      if(transforms){
        qx.bom.element.Transform.transform(el, transforms);
      };
    },
    __normalizeDesc : function(desc){
      if(!desc.hasOwnProperty("alternate")){
        desc.alternate = false;
      };
      if(!desc.hasOwnProperty("keep")){
        desc.keep = null;
      };
      if(!desc.hasOwnProperty("repeat")){
        desc.repeat = 1;
      };
      if(!desc.hasOwnProperty("timing")){
        desc.timing = "linear";
      };
      if(!desc.hasOwnProperty("origin")){
        desc.origin = null;
      };
    },
    __validateDesc : null,
    __addKeyFrames : function(frames, reverse){
      var rule = "";
      for(var position in frames){
        rule += (reverse ? -(position - 100) : position) + "% {";
        var frame = frames[position];
        var transforms;
        for(var style in frame){
          if(style in this.__transitionKeys){
            if(!transforms){
              transforms = {
              };
            };
            transforms[style] = frame[style];
          } else {
            rule += style + ":" + frame[style] + ";";
          };
        };
        if(transforms){
          rule += qx.bom.element.Transform.getCss(transforms);
        };
        rule += "} ";
      };
      if(this.__rules[rule]){
        return this.__rules[rule];
      };
      var name = this.__rulePrefix + this.__id++;
      var selector = this.__cssAnimationKeys["keyframes"] + " " + name;
      qx.bom.Stylesheet.addRule(this.__sheet, selector, rule);
      this.__rules[rule] = name;
      return name;
    }
  }
});
qx.Bootstrap.define("qx.bom.Event", {
  statics : {
    addNativeListener : function(target, type, listener, useCapture){
      if(target.addEventListener){
        target.addEventListener(type, listener, !!useCapture);
      } else if(target.attachEvent){
        target.attachEvent("on" + type, listener);
      } else if(typeof target["on" + type] != "undefined"){
        target["on" + type] = listener;
      } else {
        {
        };
      };;
    },
    removeNativeListener : function(target, type, listener, useCapture){
      if(target.removeEventListener){
        target.removeEventListener(type, listener, !!useCapture);
      } else if(target.detachEvent){
        try{
          target.detachEvent("on" + type, listener);
        } catch(e) {
          if(e.number !== -2146828218){
            throw e;
          };
        };
      } else if(typeof target["on" + type] != "undefined"){
        target["on" + type] = null;
      } else {
        {
        };
      };;
    },
    getTarget : function(e){
      return e.target || e.srcElement;
    },
    getRelatedTarget : function(e){
      if(e.relatedTarget !== undefined){
        if((qx.core.Environment.get("engine.name") == "gecko")){
          try{
            e.relatedTarget && e.relatedTarget.nodeType;
          } catch(e) {
            return null;
          };
        };
        return e.relatedTarget;
      } else if(e.fromElement !== undefined && e.type === "mouseover"){
        return e.fromElement;
      } else if(e.toElement !== undefined){
        return e.toElement;
      } else {
        return null;
      };;
    },
    preventDefault : function(e){
      if(e.preventDefault){
        e.preventDefault();
      } else {
        try{
          e.keyCode = 0;
        } catch(ex) {
        };
        e.returnValue = false;
      };
    },
    stopPropagation : function(e){
      if(e.stopPropagation){
        e.stopPropagation();
      } else {
        e.cancelBubble = true;
      };
    },
    fire : function(target, type){
      if(document.createEvent){
        var evt = document.createEvent("HTMLEvents");
        evt.initEvent(type, true, true);
        return !target.dispatchEvent(evt);
      } else {
        var evt = document.createEventObject();
        return target.fireEvent("on" + type, evt);
      };
    },
    supportsEvent : function(target, type){
      var eventName = "on" + type;
      var supportsEvent = (eventName in target);
      if(!supportsEvent){
        supportsEvent = typeof target[eventName] == "function";
        if(!supportsEvent && target.setAttribute){
          target.setAttribute(eventName, "return;");
          supportsEvent = typeof target[eventName] == "function";
          target.removeAttribute(eventName);
        };
      };
      return supportsEvent;
    }
  }
});
qx.Bootstrap.define("qx.event.Emitter", {
  extend : Object,
  statics : {
    __storage : []
  },
  members : {
    __listener : null,
    __any : null,
    on : function(name, listener, ctx){
      this.__getStorage(name).push({
        listener : listener,
        ctx : ctx
      });
      qx.event.Emitter.__storage.push({
        name : name,
        listener : listener,
        ctx : ctx
      });
      return qx.event.Emitter.__storage.length - 1;
    },
    once : function(name, listener, ctx){
      this.__getStorage(name).push({
        listener : listener,
        ctx : ctx,
        once : true
      });
      qx.event.Emitter.__storage.push({
        name : name,
        listener : listener,
        ctx : ctx
      });
      return qx.event.Emitter.__storage.length - 1;
    },
    off : function(name, listener, ctx){
      var storage = this.__getStorage(name);
      for(var i = storage.length - 1;i >= 0;i--){
        var entry = storage[i];
        if(entry.listener == listener && entry.ctx == ctx){
          storage.splice(i, 1);
          return i;
        };
      };
      return null;
    },
    offById : function(id){
      var entry = qx.event.Emitter.__storage[id];
      this.off(entry.name, entry.listener, entry.ctx);
    },
    addListener : function(name, listener, ctx){
      return this.on(name, listener, ctx);
    },
    addListenerOnce : function(name, listener, ctx){
      return this.once(name, listener, ctx);
    },
    removeListener : function(name, listener, ctx){
      this.off(name, listener, ctx);
    },
    removeListenerById : function(id){
      this.offById(id);
    },
    emit : function(name, data){
      var storage = this.__getStorage(name);
      for(var i = storage.length - 1;i >= 0;i--){
        var entry = storage[i];
        entry.listener.call(entry.ctx, data);
        if(entry.once){
          storage.splice(i, 1);
        };
      };
      storage = this.__getStorage("*");
      for(var i = storage.length - 1;i >= 0;i--){
        var entry = storage[i];
        entry.listener.call(entry.ctx, data);
      };
    },
    getListeners : function(){
      return this.__listener;
    },
    __getStorage : function(name){
      if(this.__listener == null){
        this.__listener = {
        };
      };
      if(this.__listener[name] == null){
        this.__listener[name] = [];
      };
      return this.__listener[name];
    }
  }
});
qx.Bootstrap.define("qx.bom.element.AnimationHandle", {
  extend : qx.event.Emitter,
  construct : function(){
    var css = qx.core.Environment.get("css.animation");
    this.__playState = css && css["play-state"];
    this.__playing = true;
  },
  events : {
    "end" : "Element"
  },
  members : {
    __playState : null,
    __playing : false,
    __ended : false,
    isPlaying : function(){
      return this.__playing;
    },
    isEnded : function(){
      return this.__ended;
    },
    pause : function(){
      if(this.el){
        this.el.style[this.__playState] = "paused";
        this.el.$$animation.__playing = false;
        if(this.animationId && qx.bom.element.AnimationJs){
          qx.bom.element.AnimationJs.pause(this);
        };
      };
    },
    play : function(){
      if(this.el){
        this.el.style[this.__playState] = "running";
        this.el.$$animation.__playing = true;
        if(this.i != undefined && qx.bom.element.AnimationJs){
          qx.bom.element.AnimationJs.play(this);
        };
      };
    },
    stop : function(){
      if(this.el && qx.core.Environment.get("css.animation")){
        this.el.style[this.__playState] = "";
        this.el.style[qx.core.Environment.get("css.animation").name] = "";
        this.el.$$animation.__playing = false;
        this.el.$$animation.__ended = true;
      };
      if(this.animationId && qx.bom.element.AnimationJs){
        qx.bom.element.AnimationJs.stop(this);
      };
    }
  }
});
qx.Bootstrap.define("qx.bom.client.CssTransform", {
  statics : {
    getSupport : function(){
      var name = qx.bom.client.CssTransform.getName();
      if(name != null){
        return {
          "name" : name,
          "style" : qx.bom.client.CssTransform.getStyle(),
          "origin" : qx.bom.client.CssTransform.getOrigin(),
          "3d" : qx.bom.client.CssTransform.get3D(),
          "perspective" : qx.bom.client.CssTransform.getPerspective(),
          "perspective-origin" : qx.bom.client.CssTransform.getPerspectiveOrigin(),
          "backface-visibility" : qx.bom.client.CssTransform.getBackFaceVisibility()
        };
      };
      return null;
    },
    getStyle : function(){
      return qx.bom.Style.getPropertyName("TransformStyle");
    },
    getPerspective : function(){
      return qx.bom.Style.getPropertyName("Perspective");
    },
    getPerspectiveOrigin : function(){
      return qx.bom.Style.getPropertyName("PerspectiveOrigin");
    },
    getBackFaceVisibility : function(){
      return qx.bom.Style.getPropertyName("BackfaceVisibility");
    },
    getOrigin : function(){
      return qx.bom.Style.getPropertyName("TransformOrigin");
    },
    getName : function(){
      return qx.bom.Style.getPropertyName("Transform");
    },
    get3D : function(){
      var div = document.createElement('div');
      var ret = false;
      var properties = ["perspectiveProperty", "WebkitPerspective", "MozPerspective"];
      for(var i = properties.length - 1;i >= 0;i--){
        ret = ret ? ret : div.style[properties[i]] != undefined;
      };
      return ret;
    }
  },
  defer : function(statics){
    qx.core.Environment.add("css.transform", statics.getSupport);
    qx.core.Environment.add("css.transform.3d", statics.get3D);
  }
});
qx.Bootstrap.define("qx.bom.element.Transform", {
  statics : {
    __dimensions : ["X", "Y", "Z"],
    __cssKeys : qx.core.Environment.get("css.transform"),
    transform : function(el, transforms){
      var transformCss = this.__mapToCss(transforms);
      if(this.__cssKeys != null){
        var style = this.__cssKeys["name"];
        el.style[style] = transformCss;
      };
    },
    translate : function(el, value){
      this.transform(el, {
        translate : value
      });
    },
    scale : function(el, value){
      this.transform(el, {
        scale : value
      });
    },
    rotate : function(el, value){
      this.transform(el, {
        rotate : value
      });
    },
    skew : function(el, value){
      this.transform(el, {
        skew : value
      });
    },
    getCss : function(transforms){
      var transformCss = this.__mapToCss(transforms);
      if(this.__cssKeys != null){
        var style = this.__cssKeys["name"];
        return qx.lang.String.hyphenate(style) + ":" + transformCss + ";";
      };
      return "";
    },
    setOrigin : function(el, value){
      if(this.__cssKeys != null){
        el.style[this.__cssKeys["origin"]] = value;
      };
    },
    getOrigin : function(el){
      if(this.__cssKeys != null){
        return el.style[this.__cssKeys["origin"]];
      };
      return "";
    },
    setStyle : function(el, value){
      if(this.__cssKeys != null){
        el.style[this.__cssKeys["style"]] = value;
      };
    },
    getStyle : function(el){
      if(this.__cssKeys != null){
        return el.style[this.__cssKeys["style"]];
      };
      return "";
    },
    setPerspective : function(el, value){
      if(this.__cssKeys != null){
        el.style[this.__cssKeys["perspective"]] = value;
      };
    },
    getPerspective : function(el){
      if(this.__cssKeys != null){
        return el.style[this.__cssKeys["perspective"]];
      };
      return "";
    },
    setPerspectiveOrigin : function(el, value){
      if(this.__cssKeys != null){
        el.style[this.__cssKeys["perspective-origin"]] = value;
      };
    },
    getPerspectiveOrigin : function(el){
      if(this.__cssKeys != null){
        return el.style[this.__cssKeys["perspective-origin"]];
      };
      return "";
    },
    setBackfaceVisibility : function(el, value){
      if(this.__cssKeys != null){
        el.style[this.__cssKeys["backface-visibility"]] = value ? "visible" : "hidden";
      };
    },
    getBackfaceVisibility : function(el){
      if(this.__cssKeys != null){
        return el.style[this.__cssKeys["backface-visibility"]] == "visible";
      };
      return true;
    },
    __mapToCss : function(transforms){
      var value = "";
      for(var func in transforms){
        var params = transforms[func];
        if(qx.Bootstrap.isArray(params)){
          for(var i = 0;i < params.length;i++){
            if(params[i] == undefined){
              continue;
            };
            value += func + this.__dimensions[i] + "(";
            value += params[i];
            value += ") ";
          };
        } else {
          value += func + "(" + transforms[func] + ") ";
        };
      };
      return value;
    }
  }
});
qx.Bootstrap.define("qx.bom.element.AnimationJs", {
  statics : {
    __maxStepTime : 30,
    __units : ["%", "in", "cm", "mm", "em", "ex", "pt", "pc", "px"],
    animate : function(el, desc, duration){
      return this._animate(el, desc, duration, false);
    },
    animateReverse : function(el, desc, duration){
      return this._animate(el, desc, duration, true);
    },
    _animate : function(el, desc, duration, reverse){
      if(el.$$animation){
        return;
      };
      if(desc.hasOwnProperty("reverse")){
        reverse = desc.reverse;
        {
        };
      };
      if(duration == undefined){
        duration = desc.duration;
      };
      var keyFrames = desc.keyFrames;
      var keys = this.__getOrderedKeys(keyFrames);
      var stepTime = this.__getStepTime(duration, keys);
      var steps = parseInt(duration / stepTime, 10);
      this.__normalizeKeyFrames(keyFrames, el);
      var delta = this.__calculateDelta(steps, stepTime, keys, keyFrames, duration, desc.timing);
      if(reverse){
        delta.reverse();
      };
      var handle = new qx.bom.element.AnimationHandle();
      handle.desc = desc;
      handle.el = el;
      handle.delta = delta;
      handle.stepTime = stepTime;
      handle.steps = steps;
      el.$$animation = handle;
      handle.i = 0;
      handle.initValues = {
      };
      handle.repeatSteps = this.__applyRepeat(steps, desc.repeat);
      return this.play(handle);
    },
    __normalizeKeyFrames : function(keyFrames, el){
      var units = [];
      for(var percent in keyFrames){
        for(var name in keyFrames[percent]){
          if(units[name] == undefined){
            var item = keyFrames[percent][name];
            if(typeof item == "string"){
              units[name] = item.substring((parseInt(item, 10) + "").length, item.length);
            } else {
              units[name] = "";
            };
          };
        };
      };
      for(var percent in keyFrames){
        var frame = keyFrames[percent];
        for(var name in units){
          if(frame[name] == undefined){
            if(window.getComputedStyle){
              frame[name] = getComputedStyle(el)[name];
            } else {
              frame[name] = el.style[name];
            };
            if(frame[name] == "" && this.__units.indexOf(units[name]) != -1){
              frame[name] = "0" + units[name];
            };
          };
        };
      };
    },
    __calculateDelta : function(steps, stepTime, keys, keyFrames, duration, timing){
      var delta = new Array(steps);
      var keyIndex = 1;
      delta[0] = keyFrames[0];
      var last = keyFrames[0];
      var next = keyFrames[keys[keyIndex]];
      for(var i = 1;i < delta.length;i++){
        if(i * stepTime / duration * 100 > keys[keyIndex]){
          last = next;
          keyIndex++;
          next = keyFrames[keys[keyIndex]];
        };
        delta[i] = {
        };
        for(var name in next){
          var nItem = next[name] + "";
          if(nItem.charAt(0) == "#"){
            var value0 = qx.util.ColorUtil.cssStringToRgb(last[name]);
            var value1 = qx.util.ColorUtil.cssStringToRgb(nItem);
            var stepValue = [];
            for(var j = 0;j < value0.length;j++){
              var range = value0[j] - value1[j];
              stepValue[j] = parseInt(value0[j] - range * this.__calculateTiming(timing, i / steps));
            };
            delta[i][name] = "#" + qx.util.ColorUtil.rgbToHexString(stepValue);
          } else {
            var unit = nItem.substring((parseInt(nItem, 10) + "").length, nItem.length);
            var range = parseFloat(nItem, 10) - parseFloat(last[name], 10);
            delta[i][name] = (parseFloat(last[name]) + range * this.__calculateTiming(timing, i / steps)) + unit;
          };
        };
      };
      delta[delta.length - 1] = keyFrames[100];
      return delta;
    },
    play : function(handle){
      var id = window.setInterval(function(){
        handle.repeatSteps--;
        var values = handle.delta[handle.i % handle.steps];
        if(handle.i == 0){
          for(var name in values){
            if(handle.initValues[name] == undefined){
              if(qx.bom.element.Style){
                handle.initValues[name] = qx.bom.element.Style.get(handle.el, qx.lang.String.camelCase(name));
              } else {
                handle.initValues[name] = handle.el.style[qx.lang.String.camelCase(name)];
              };
            };
          };
        };
        qx.bom.element.AnimationJs.__applyStyles(handle.el, values);
        handle.i++;
        if(handle.i % handle.steps == 0){
          if(handle.desc.alternate){
            handle.delta.reverse();
          };
        };
        if(handle.repeatSteps < 0){
          qx.bom.element.AnimationJs.stop(handle);
        };
      }, handle.stepTime);
      handle.animationId = id;
      return handle;
    },
    pause : function(handle){
      window.clearInterval(handle.animationId);
      handle.animationId = null;
    },
    stop : function(handle){
      var desc = handle.desc;
      var el = handle.el;
      var initValues = handle.initValues;
      window.clearInterval(handle.animationId);
      if(desc.keep != undefined){
        this.__applyStyles(el, desc.keyFrames[desc.keep]);
      } else {
        this.__applyStyles(el, initValues);
      };
      el.$$animation = null;
      handle.el = null;
      handle.ended = true;
      handle.animationId = null;
      handle.emit("end", el);
    },
    __calculateTiming : function(func, x){
      if(func == "ease-in"){
        var a = [3.1223e-7, 0.0757, 1.2646, -0.167, -0.4387, 0.2654];
      } else if(func == "ease-out"){
        var a = [-7.0198e-8, 1.652, -0.551, -0.0458, 0.1255, -0.1807];
      } else if(func == "linear"){
        return x;
      } else if(func == "ease-in-out"){
        var a = [2.482e-7, -0.2289, 3.3466, -1.0857, -1.7354, 0.7034];
      } else {
        var a = [-0.0021, 0.2472, 9.8054, -21.6869, 17.7611, -5.1226];
      };;;
      var y = 0;
      for(var i = 0;i < a.length;i++){
        y += a[i] * Math.pow(x, i);
      };
      return y;
    },
    __applyRepeat : function(steps, repeat){
      if(repeat == undefined){
        return steps;
      };
      if(repeat == "infinite"){
        return Number.MAX_VALUE;
      };
      return steps * repeat;
    },
    __applyStyles : function(el, styles){
      for(var name in styles){
        name = qx.lang.String.camelCase(name);
        if(qx.bom.element.Style){
          qx.bom.element.Style.set(el, name, styles[name]);
        } else {
          el.style[name] = styles[name];
        };
      };
    },
    __getStepTime : function(duration, keys){
      var minDiff = 100;
      for(var i = 0;i < keys.length - 1;i++){
        minDiff = Math.min(minDiff, keys[i + 1] - keys[i]);
      };
      var stepTime = duration * minDiff / 100;
      while(stepTime > this.__maxStepTime){
        stepTime = stepTime / 2;
      };
      return Math.round(stepTime);
    },
    __getOrderedKeys : function(keyFrames){
      var keys = qx.Bootstrap.getKeys(keyFrames);
      for(var i = 0;i < keys.length;i++){
        keys[i] = parseInt(keys[i], 10);
      };
      keys.sort(function(a, b){
        return a - b;
      });
      return keys;
    }
  }
});
qx.Bootstrap.define("qx.util.ColorUtil", {
  statics : {
    REGEXP : {
      hex3 : /^#([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
      hex6 : /^#([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
      rgb : /^rgb\(\s*([0-9]{1,3}\.{0,1}[0-9]*)\s*,\s*([0-9]{1,3}\.{0,1}[0-9]*)\s*,\s*([0-9]{1,3}\.{0,1}[0-9]*)\s*\)$/,
      rgba : /^rgba\(\s*([0-9]{1,3}\.{0,1}[0-9]*)\s*,\s*([0-9]{1,3}\.{0,1}[0-9]*)\s*,\s*([0-9]{1,3}\.{0,1}[0-9]*)\s*,\s*([0-9]{1,3}\.{0,1}[0-9]*)\s*\)$/
    },
    SYSTEM : {
      activeborder : true,
      activecaption : true,
      appworkspace : true,
      background : true,
      buttonface : true,
      buttonhighlight : true,
      buttonshadow : true,
      buttontext : true,
      captiontext : true,
      graytext : true,
      highlight : true,
      highlighttext : true,
      inactiveborder : true,
      inactivecaption : true,
      inactivecaptiontext : true,
      infobackground : true,
      infotext : true,
      menu : true,
      menutext : true,
      scrollbar : true,
      threeddarkshadow : true,
      threedface : true,
      threedhighlight : true,
      threedlightshadow : true,
      threedshadow : true,
      window : true,
      windowframe : true,
      windowtext : true
    },
    NAMED : {
      black : [0, 0, 0],
      silver : [192, 192, 192],
      gray : [128, 128, 128],
      white : [255, 255, 255],
      maroon : [128, 0, 0],
      red : [255, 0, 0],
      purple : [128, 0, 128],
      fuchsia : [255, 0, 255],
      green : [0, 128, 0],
      lime : [0, 255, 0],
      olive : [128, 128, 0],
      yellow : [255, 255, 0],
      navy : [0, 0, 128],
      blue : [0, 0, 255],
      teal : [0, 128, 128],
      aqua : [0, 255, 255],
      transparent : [-1, -1, -1],
      magenta : [255, 0, 255],
      orange : [255, 165, 0],
      brown : [165, 42, 42]
    },
    isNamedColor : function(value){
      return this.NAMED[value] !== undefined;
    },
    isSystemColor : function(value){
      return this.SYSTEM[value] !== undefined;
    },
    supportsThemes : function(){
      if(qx.Class){
        return qx.Class.isDefined("qx.theme.manager.Color");
      };
      return false;
    },
    isThemedColor : function(value){
      if(!this.supportsThemes()){
        return false;
      };
      if(qx.theme && qx.theme.manager && qx.theme.manager.Color){
        return qx.theme.manager.Color.getInstance().isDynamic(value);
      };
      return false;
    },
    stringToRgb : function(str){
      if(this.supportsThemes() && this.isThemedColor(str)){
        var str = qx.theme.manager.Color.getInstance().resolveDynamic(str);
      };
      if(this.isNamedColor(str)){
        return this.NAMED[str];
      } else if(this.isSystemColor(str)){
        throw new Error("Could not convert system colors to RGB: " + str);
      } else if(this.isRgbString(str)){
        return this.__rgbStringToRgb();
      } else if(this.isHex3String(str)){
        return this.__hex3StringToRgb();
      } else if(this.isHex6String(str)){
        return this.__hex6StringToRgb();
      };;;;
      throw new Error("Could not parse color: " + str);
    },
    cssStringToRgb : function(str){
      if(this.isNamedColor(str)){
        return this.NAMED[str];
      } else if(this.isSystemColor(str)){
        throw new Error("Could not convert system colors to RGB: " + str);
      } else if(this.isRgbString(str)){
        return this.__rgbStringToRgb();
      } else if(this.isRgbaString(str)){
        return this.__rgbaStringToRgb();
      } else if(this.isHex3String(str)){
        return this.__hex3StringToRgb();
      } else if(this.isHex6String(str)){
        return this.__hex6StringToRgb();
      };;;;;
      throw new Error("Could not parse color: " + str);
    },
    stringToRgbString : function(str){
      return this.rgbToRgbString(this.stringToRgb(str));
    },
    rgbToRgbString : function(rgb){
      return "rgb(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ")";
    },
    rgbToHexString : function(rgb){
      return (qx.lang.String.pad(rgb[0].toString(16).toUpperCase(), 2) + qx.lang.String.pad(rgb[1].toString(16).toUpperCase(), 2) + qx.lang.String.pad(rgb[2].toString(16).toUpperCase(), 2));
    },
    isValidPropertyValue : function(str){
      return (this.isThemedColor(str) || this.isNamedColor(str) || this.isHex3String(str) || this.isHex6String(str) || this.isRgbString(str) || this.isRgbaString(str));
    },
    isCssString : function(str){
      return (this.isSystemColor(str) || this.isNamedColor(str) || this.isHex3String(str) || this.isHex6String(str) || this.isRgbString(str) || this.isRgbaString(str));
    },
    isHex3String : function(str){
      return this.REGEXP.hex3.test(str);
    },
    isHex6String : function(str){
      return this.REGEXP.hex6.test(str);
    },
    isRgbString : function(str){
      return this.REGEXP.rgb.test(str);
    },
    isRgbaString : function(str){
      return this.REGEXP.rgba.test(str);
    },
    __rgbStringToRgb : function(){
      var red = parseInt(RegExp.$1, 10);
      var green = parseInt(RegExp.$2, 10);
      var blue = parseInt(RegExp.$3, 10);
      return [red, green, blue];
    },
    __rgbaStringToRgb : function(){
      var red = parseInt(RegExp.$1, 10);
      var green = parseInt(RegExp.$2, 10);
      var blue = parseInt(RegExp.$3, 10);
      return [red, green, blue];
    },
    __hex3StringToRgb : function(){
      var red = parseInt(RegExp.$1, 16) * 17;
      var green = parseInt(RegExp.$2, 16) * 17;
      var blue = parseInt(RegExp.$3, 16) * 17;
      return [red, green, blue];
    },
    __hex6StringToRgb : function(){
      var red = (parseInt(RegExp.$1, 16) * 16) + parseInt(RegExp.$2, 16);
      var green = (parseInt(RegExp.$3, 16) * 16) + parseInt(RegExp.$4, 16);
      var blue = (parseInt(RegExp.$5, 16) * 16) + parseInt(RegExp.$6, 16);
      return [red, green, blue];
    },
    hex3StringToRgb : function(value){
      if(this.isHex3String(value)){
        return this.__hex3StringToRgb(value);
      };
      throw new Error("Invalid hex3 value: " + value);
    },
    hex6StringToRgb : function(value){
      if(this.isHex6String(value)){
        return this.__hex6StringToRgb(value);
      };
      throw new Error("Invalid hex6 value: " + value);
    },
    hexStringToRgb : function(value){
      if(this.isHex3String(value)){
        return this.__hex3StringToRgb(value);
      };
      if(this.isHex6String(value)){
        return this.__hex6StringToRgb(value);
      };
      throw new Error("Invalid hex value: " + value);
    },
    rgbToHsb : function(rgb){
      var hue,saturation,brightness;
      var red = rgb[0];
      var green = rgb[1];
      var blue = rgb[2];
      var cmax = (red > green) ? red : green;
      if(blue > cmax){
        cmax = blue;
      };
      var cmin = (red < green) ? red : green;
      if(blue < cmin){
        cmin = blue;
      };
      brightness = cmax / 255.0;
      if(cmax != 0){
        saturation = (cmax - cmin) / cmax;
      } else {
        saturation = 0;
      };
      if(saturation == 0){
        hue = 0;
      } else {
        var redc = (cmax - red) / (cmax - cmin);
        var greenc = (cmax - green) / (cmax - cmin);
        var bluec = (cmax - blue) / (cmax - cmin);
        if(red == cmax){
          hue = bluec - greenc;
        } else if(green == cmax){
          hue = 2.0 + redc - bluec;
        } else {
          hue = 4.0 + greenc - redc;
        };
        hue = hue / 6.0;
        if(hue < 0){
          hue = hue + 1.0;
        };
      };
      return [Math.round(hue * 360), Math.round(saturation * 100), Math.round(brightness * 100)];
    },
    hsbToRgb : function(hsb){
      var i,f,p,q,t;
      var hue = hsb[0] / 360;
      var saturation = hsb[1] / 100;
      var brightness = hsb[2] / 100;
      if(hue >= 1.0){
        hue %= 1.0;
      };
      if(saturation > 1.0){
        saturation = 1.0;
      };
      if(brightness > 1.0){
        brightness = 1.0;
      };
      var tov = Math.floor(255 * brightness);
      var rgb = {
      };
      if(saturation == 0.0){
        rgb.red = rgb.green = rgb.blue = tov;
      } else {
        hue *= 6.0;
        i = Math.floor(hue);
        f = hue - i;
        p = Math.floor(tov * (1.0 - saturation));
        q = Math.floor(tov * (1.0 - (saturation * f)));
        t = Math.floor(tov * (1.0 - (saturation * (1.0 - f))));
        switch(i){case 0:        rgb.red = tov;
        rgb.green = t;
        rgb.blue = p;
        break;case 1:        rgb.red = q;
        rgb.green = tov;
        rgb.blue = p;
        break;case 2:        rgb.red = p;
        rgb.green = tov;
        rgb.blue = t;
        break;case 3:        rgb.red = p;
        rgb.green = q;
        rgb.blue = tov;
        break;case 4:        rgb.red = t;
        rgb.green = p;
        rgb.blue = tov;
        break;case 5:        rgb.red = tov;
        rgb.green = p;
        rgb.blue = q;
        break;};
      };
      return [rgb.red, rgb.green, rgb.blue];
    },
    randomColor : function(){
      var r = Math.round(Math.random() * 255);
      var g = Math.round(Math.random() * 255);
      var b = Math.round(Math.random() * 255);
      return this.rgbToRgbString([r, g, b]);
    }
  }
});
qx.Bootstrap.define("qx.module.Traversing", {
  statics : {
    add : function(el){
      this.push(el);
      return this;
    },
    getChildren : function(selector){
      var children = [];
      for(var i = 0;i < this.length;i++){
        var found = qx.dom.Hierarchy.getChildElements(this[i]);
        if(selector){
          found = qx.bom.Selector.matches(selector, found);
        };
        children = children.concat(found);
      };
      return qx.lang.Array.cast(children, qx.Collection);
    },
    forEach : function(fn, ctx){
      for(var i = 0;i < this.length;i++){
        fn.call(ctx, this[i], i, this);
      };
      return this;
    },
    getParents : function(selector){
      var parents = [];
      for(var i = 0;i < this.length;i++){
        var found = qx.dom.Element.getParentElement(this[i]);
        if(selector){
          found = qx.bom.Selector.matches(selector, [found]);
        };
        parents = parents.concat(found);
      };
      return qx.lang.Array.cast(parents, qx.Collection);
    },
    getAncestors : function(filter){
      return this.__getAncestors(null, filter);
    },
    getAncestorsUntil : function(selector, filter){
      return this.__getAncestors(selector, filter);
    },
    __getAncestors : function(selector, filter){
      var ancestors = [];
      for(var i = 0;i < this.length;i++){
        var parent = qx.dom.Element.getParentElement(this[i]);
        while(parent){
          var found = [parent];
          if(selector && qx.bom.Selector.matches(selector, found).length > 0){
            break;
          };
          if(filter){
            found = qx.bom.Selector.matches(filter, found);
          };
          ancestors = ancestors.concat(found);
          parent = qx.dom.Element.getParentElement(parent);
        };
      };
      return qx.lang.Array.cast(ancestors, qx.Collection);
    },
    getClosest : function(selector){
      var closest = [];
      var findClosest = function findClosest(current){
        var found = qx.bom.Selector.matches(selector, current);
        if(found.length){
          closest.push(found[0]);
        } else {
          current = current.getParents();
          if(current[0] && current[0].parentNode){
            findClosest(current);
          };
        };
      };
      for(var i = 0;i < this.length;i++){
        findClosest(q.wrap(this[i]));
      };
      return qx.lang.Array.cast(closest, qx.Collection);
    },
    find : function(selector){
      var found = [];
      for(var i = 0;i < this.length;i++){
        found = found.concat(qx.bom.Selector.query(selector, this[i]));
      };
      return qx.lang.Array.cast(found, qx.Collection);
    },
    filter : function(selector){
      if(qx.lang.Type.isFunction(selector)){
        return qx.type.BaseArray.prototype.filter.call(this, selector);
      };
      return qx.lang.Array.cast(qx.bom.Selector.matches(selector, this), qx.Collection);
    },
    getContents : function(){
      var found = [];
      for(var i = 0;i < this.length;i++){
        found = found.concat(qx.lang.Array.fromCollection(this[i].childNodes));
      };
      return qx.lang.Array.cast(found, qx.Collection);
    },
    is : function(selector){
      if(qx.lang.Type.isFunction(selector)){
        return this.filter(selector).length > 0;
      };
      return !!selector && qx.bom.Selector.matches(selector, this).length > 0;
    },
    eq : function(index){
      return this.slice(index, +index + 1);
    },
    getFirst : function(){
      return this.slice(0, 1);
    },
    getLast : function(){
      return this.slice(this.length - 1);
    },
    has : function(selector){
      var found = [];
      for(var i = 0;i < this.length;i++){
        var descendants = qx.bom.Selector.matches(selector, this.eq(i).getContents());
        if(descendants.length > 0){
          found.push(this[i]);
        };
      };
      return qx.lang.Array.cast(found, qx.Collection);
    },
    getNext : function(selector){
      var Hierarchy = qx.dom.Hierarchy;
      var found = this.map(Hierarchy.getNextElementSibling, Hierarchy);
      if(selector){
        found = qx.bom.Selector.matches(selector, found);
      };
      return found;
    },
    getNextAll : function(selector){
      var ret = qx.module.Traversing.__hierarchyHelper(this, "getNextSiblings", selector);
      return qx.lang.Array.cast(ret, qx.Collection);
    },
    getNextUntil : function(selector){
      var found = [];
      this.forEach(function(item, index){
        var nextSiblings = qx.dom.Hierarchy.getNextSiblings(item);
        for(var i = 0,l = nextSiblings.length;i < l;i++){
          if(qx.bom.Selector.matches(selector, [nextSiblings[i]]).length > 0){
            break;
          };
          found.push(nextSiblings[i]);
        };
      });
      return qx.lang.Array.cast(found, qx.Collection);
    },
    getPrev : function(selector){
      var Hierarchy = qx.dom.Hierarchy;
      var found = this.map(Hierarchy.getPreviousElementSibling, Hierarchy);
      if(selector){
        found = qx.bom.Selector.matches(selector, found);
      };
      return found;
    },
    getPrevAll : function(selector){
      var ret = qx.module.Traversing.__hierarchyHelper(this, "getPreviousSiblings", selector);
      return qx.lang.Array.cast(ret, qx.Collection);
    },
    getPrevUntil : function(selector){
      var found = [];
      this.forEach(function(item, index){
        var previousSiblings = qx.dom.Hierarchy.getPreviousSiblings(item);
        for(var i = 0,l = previousSiblings.length;i < l;i++){
          if(qx.bom.Selector.matches(selector, [previousSiblings[i]]).length > 0){
            break;
          };
          found.push(previousSiblings[i]);
        };
      });
      return qx.lang.Array.cast(found, qx.Collection);
    },
    getSiblings : function(selector){
      var ret = qx.module.Traversing.__hierarchyHelper(this, "getSiblings", selector);
      return qx.lang.Array.cast(ret, qx.Collection);
    },
    not : function(selector){
      if(qx.lang.Type.isFunction(selector)){
        return this.filter(function(item, index, obj){
          return !selector(item, index, obj);
        });
      };
      var res = qx.bom.Selector.matches(selector, this);
      return this.filter(function(value){
        return res.indexOf(value) === -1;
      });
    },
    getOffsetParent : function(){
      return this.map(qx.bom.element.Location.getOffsetParent);
    },
    isElement : function(element){
      return qx.dom.Node.isElement(element);
    },
    isNode : function(node){
      return qx.dom.Node.isNode(node);
    },
    isDocument : function(node){
      return qx.dom.Node.isDocument(node);
    },
    getWindow : function(node){
      return qx.dom.Node.getWindow(node);
    },
    __hierarchyHelper : function(collection, method, selector){
      var all = [];
      var Hierarchy = qx.dom.Hierarchy;
      for(var i = 0,l = collection.length;i < l;i++){
        all.push.apply(all, Hierarchy[method](collection[i]));
      };
      var ret = qx.lang.Array.unique(all);
      if(selector){
        ret = qx.bom.Selector.matches(selector, ret);
      };
      return ret;
    }
  },
  defer : function(statics){
    q.attach({
      "add" : statics.add,
      "getChildren" : statics.getChildren,
      "forEach" : statics.forEach,
      "getParents" : statics.getParents,
      "getAncestors" : statics.getAncestors,
      "getAncestorsUntil" : statics.getAncestorsUntil,
      "__getAncestors" : statics.__getAncestors,
      "getClosest" : statics.getClosest,
      "find" : statics.find,
      "filter" : statics.filter,
      "getContents" : statics.getContents,
      "is" : statics.is,
      "eq" : statics.eq,
      "getFirst" : statics.getFirst,
      "getLast" : statics.getLast,
      "has" : statics.has,
      "getNext" : statics.getNext,
      "getNextAll" : statics.getNextAll,
      "getNextUntil" : statics.getNextUntil,
      "getPrev" : statics.getPrev,
      "getPrevAll" : statics.getPrevAll,
      "getPrevUntil" : statics.getPrevUntil,
      "getSiblings" : statics.getSiblings,
      "not" : statics.not,
      "getOffsetParent" : statics.getOffsetParent
    });
    q.attachStatic({
      "isElement" : statics.isElement,
      "isNode" : statics.isNode,
      "isDocument" : statics.isDocument,
      "getWindow" : statics.getWindow
    });
  }
});
qx.Bootstrap.define("qx.dom.Hierarchy", {
  statics : {
    getNodeIndex : function(node){
      var index = 0;
      while(node && (node = node.previousSibling)){
        index++;
      };
      return index;
    },
    getElementIndex : function(element){
      var index = 0;
      var type = qx.dom.Node.ELEMENT;
      while(element && (element = element.previousSibling)){
        if(element.nodeType == type){
          index++;
        };
      };
      return index;
    },
    getNextElementSibling : function(element){
      while(element && (element = element.nextSibling) && !qx.dom.Node.isElement(element)){
        continue;
      };
      return element || null;
    },
    getPreviousElementSibling : function(element){
      while(element && (element = element.previousSibling) && !qx.dom.Node.isElement(element)){
        continue;
      };
      return element || null;
    },
    contains : function(element, target){
      if(qx.core.Environment.get("html.element.contains")){
        if(qx.dom.Node.isDocument(element)){
          var doc = qx.dom.Node.getDocument(target);
          return element && doc == element;
        } else if(qx.dom.Node.isDocument(target)){
          return false;
        } else {
          return element.contains(target);
        };
      } else if(qx.core.Environment.get("html.element.compareDocumentPosition")){
        return !!(element.compareDocumentPosition(target) & 16);
      } else {
        while(target){
          if(element == target){
            return true;
          };
          target = target.parentNode;
        };
        return false;
      };
    },
    isRendered : function(element){
      var doc = element.ownerDocument || element.document;
      if(qx.core.Environment.get("html.element.contains")){
        if(!element.parentNode || !element.offsetParent){
          return false;
        };
        return doc.body.contains(element);
      } else if(qx.core.Environment.get("html.element.compareDocumentPosition")){
        return !!(doc.compareDocumentPosition(element) & 16);
      } else {
        while(element){
          if(element == doc.body){
            return true;
          };
          element = element.parentNode;
        };
        return false;
      };
    },
    isDescendantOf : function(element, ancestor){
      return this.contains(ancestor, element);
    },
    getCommonParent : function(element1, element2){
      if(element1 === element2){
        return element1;
      };
      if(qx.core.Environment.get("html.element.contains")){
        while(element1 && qx.dom.Node.isElement(element1)){
          if(element1.contains(element2)){
            return element1;
          };
          element1 = element1.parentNode;
        };
        return null;
      } else {
        var known = [];
        while(element1 || element2){
          if(element1){
            if(qx.lang.Array.contains(known, element1)){
              return element1;
            };
            known.push(element1);
            element1 = element1.parentNode;
          };
          if(element2){
            if(qx.lang.Array.contains(known, element2)){
              return element2;
            };
            known.push(element2);
            element2 = element2.parentNode;
          };
        };
        return null;
      };
    },
    getAncestors : function(element){
      return this._recursivelyCollect(element, "parentNode");
    },
    getChildElements : function(element){
      element = element.firstChild;
      if(!element){
        return [];
      };
      var arr = this.getNextSiblings(element);
      if(element.nodeType === 1){
        arr.unshift(element);
      };
      return arr;
    },
    getDescendants : function(element){
      return qx.lang.Array.fromCollection(element.getElementsByTagName("*"));
    },
    getFirstDescendant : function(element){
      element = element.firstChild;
      while(element && element.nodeType != 1){
        element = element.nextSibling;
      };
      return element;
    },
    getLastDescendant : function(element){
      element = element.lastChild;
      while(element && element.nodeType != 1){
        element = element.previousSibling;
      };
      return element;
    },
    getPreviousSiblings : function(element){
      return this._recursivelyCollect(element, "previousSibling");
    },
    getNextSiblings : function(element){
      return this._recursivelyCollect(element, "nextSibling");
    },
    _recursivelyCollect : function(element, property){
      var list = [];
      while(element = element[property]){
        if(element.nodeType == 1){
          list.push(element);
        };
      };
      return list;
    },
    getSiblings : function(element){
      return this.getPreviousSiblings(element).reverse().concat(this.getNextSiblings(element));
    },
    isEmpty : function(element){
      element = element.firstChild;
      while(element){
        if(element.nodeType === qx.dom.Node.ELEMENT || element.nodeType === qx.dom.Node.TEXT){
          return false;
        };
        element = element.nextSibling;
      };
      return true;
    },
    cleanWhitespace : function(element){
      var node = element.firstChild;
      while(node){
        var nextNode = node.nextSibling;
        if(node.nodeType == 3 && !/\S/.test(node.nodeValue)){
          element.removeChild(node);
        };
        node = nextNode;
      };
    }
  }
});
qx.Bootstrap.define("qx.module.Event", {
  statics : {
    __normalizations : {
    },
    on : function(type, listener, context){
      for(var i = 0;i < this.length;i++){
        var el = this[i];
        var ctx = context || q.wrap(el);
        var bound;
        if(qx.bom.Event.supportsEvent(el, type)){
          bound = function(event){
            var registry = qx.module.Event.__normalizations;
            var normalizations = registry["*"] || [];
            if(registry[type]){
              normalizations = normalizations.concat(registry[type]);
            };
            for(var x = 0,y = normalizations.length;x < y;x++){
              event = normalizations[x](event, el);
            };
            listener.apply(ctx, [event]);
          };
          bound.original = listener;
          qx.bom.Event.addNativeListener(el, type, bound);
        };
        if(!el.__emitter){
          el.__emitter = new qx.event.Emitter();
        };
        var id = el.__emitter.on(type, bound || listener, ctx);
        if(typeof id == "number" && bound){
          if(!el.__bound){
            el.__bound = {
            };
          };
          el.__bound[id] = bound;
        };
        if(!context){
          if(!el.__ctx){
            el.__ctx = {
            };
          };
          el.__ctx[id] = ctx;
        };
      };
      return this;
    },
    off : function(type, listener, context){
      for(var j = 0;j < this.length;j++){
        var el = this[j];
        if(!el.__bound){
          el.__emitter.off(type, listener, context);
        } else {
          for(var id in el.__bound){
            if(el.__bound[id].original == listener){
              if(!context && typeof el.__ctx !== "undefined" && el.__ctx[id]){
                context = el.__ctx[id];
              };
              el.__emitter.off(type, el.__bound[id], context);
              qx.bom.Event.removeNativeListener(el, type, el.__bound[id]);
              delete el.__bound[id];
              if(el.__ctx[id]){
                delete el.__ctx[id];
              };
            };
          };
        };
      };
      return this;
    },
    emit : function(type, data){
      for(var j = 0;j < this.length;j++){
        var el = this[j];
        if(el.__emitter){
          el.__emitter.emit(type, data);
        };
      };
      return this;
    },
    once : function(type, listener, context){
      var self = this;
      var wrappedListener = function(data){
        listener.call(this, data);
        self.off(type, wrappedListener, context);
      };
      this.on(type, wrappedListener, context);
      return this;
    },
    hasListener : function(type){
      if(!this[0] || !this[0].__emitter || !this[0].__emitter.getListeners()[type]){
        return false;
      };
      return this[0].__emitter.getListeners()[type].length > 0;
    },
    copyEventsTo : function(target){
      var source = this;
      for(var i = source.length - 1;i >= 0;i--){
        var descendants = source[i].getElementsByTagName("*");
        for(var j = 0;j < descendants.length;j++){
          source.push(descendants[j]);
        };
      };
      for(var i = target.length - 1;i >= 0;i--){
        var descendants = target[i].getElementsByTagName("*");
        for(var j = 0;j < descendants.length;j++){
          target.push(descendants[j]);
        };
      };
      for(var i = 0;i < source.length;i++){
        var el = source[i];
        if(!el.__emitter){
          continue;
        };
        var storage = el.__emitter.getListeners();
        for(var name in storage){
          for(var j = 0;j < storage[name].length;j++){
            var listener = storage[name][j].listener;
            if(listener.original){
              listener = listener.original;
            };
            q.wrap(target[i]).on(name, listener, storage[name][j].ctx);
          };
        };
      };
    },
    ready : function(callback){
      if(document.readyState === "complete"){
        window.setTimeout(callback, 0);
        return;
      };
      qx.bom.Event.addNativeListener(window, "load", callback);
    },
    registerNormalization : function(types, normalizer){
      if(!qx.lang.Type.isArray(types)){
        types = [types];
      };
      var registry = qx.module.Event.__normalizations;
      for(var i = 0,l = types.length;i < l;i++){
        var type = types[i];
        if(qx.lang.Type.isFunction(normalizer)){
          if(!registry[type]){
            registry[type] = [];
          };
          registry[type].push(normalizer);
        };
      };
    },
    unregisterNormalization : function(types, normalizer){
      if(!qx.lang.Type.isArray(types)){
        types = [types];
      };
      var registry = qx.module.Event.__normalizations;
      for(var i = 0,l = types.length;i < l;i++){
        var type = types[i];
        if(registry[type]){
          qx.lang.Array.remove(registry[type], normalizer);
        };
      };
    },
    getRegistry : function(){
      return qx.module.Event.__normalizations;
    }
  },
  defer : function(statics){
    q.attach({
      "on" : statics.on,
      "off" : statics.off,
      "once" : statics.once,
      "emit" : statics.emit,
      "hasListener" : statics.hasListener,
      "copyEventsTo" : statics.copyEventsTo
    });
    q.attachStatic({
      "ready" : statics.ready,
      "registerEventNormalization" : statics.registerNormalization,
      "unregisterEventNormalization" : statics.unregisterNormalization,
      "getEventNormalizationRegistry" : statics.getRegistry
    });
  }
});
qx.Bootstrap.define("qx.module.event.Native", {
  statics : {
    FORWARD_METHODS : ["getTarget", "getRelatedTarget"],
    BIND_METHODS : ["preventDefault", "stopPropagation"],
    preventDefault : function(){
      try{
        this.keyCode = 0;
      } catch(ex) {
      };
      this.returnValue = false;
    },
    stopPropagation : function(){
      this.cancelBubble = true;
    },
    normalize : function(event, element){
      if(!event){
        return event;
      };
      var fwdMethods = qx.module.event.Native.FORWARD_METHODS;
      for(var i = 0,l = fwdMethods.length;i < l;i++){
        event[fwdMethods[i]] = qx.lang.Function.curry(qx.bom.Event[fwdMethods[i]], event);
      };
      var bindMethods = qx.module.event.Native.BIND_METHODS;
      for(var i = 0,l = bindMethods.length;i < l;i++){
        if(typeof event[bindMethods[i]] != "function"){
          event[bindMethods[i]] = qx.module.event.Native[bindMethods[i]].bind(event);
        };
      };
      event.getCurrentTarget = function(){
        return event.currentTarget || element;
      };
      return event;
    }
  },
  defer : function(statics){
    q.registerEventNormalization("*", statics.normalize);
  }
});
qx.Bootstrap.define("qx.module.event.Mouse", {
  statics : {
    TYPES : ["click", "dblclick", "mousedown", "mouseup", "mouseover", "mousemove", "mouseout"],
    BIND_METHODS : ["getButton", "getViewportLeft", "getViewportTop", "getDocumentLeft", "getDocumentTop", "getScreenLeft", "getScreenTop"],
    BUTTONS_DOM2 : {
      '0' : "left",
      '2' : "right",
      '1' : "middle"
    },
    BUTTONS_MSHTML : {
      '1' : "left",
      '2' : "right",
      '4' : "middle"
    },
    getButton : function(){
      switch(this.type){case "contextmenu":      return "right";case "click":      if(qx.core.Environment.get("browser.name") === "ie" && qx.core.Environment.get("browser.documentmode") < 9){
        return "left";
      };default:      if(this.target !== undefined){
        return qx.module.event.Mouse.BUTTONS_DOM2[this.button] || "none";
      } else {
        return qx.module.event.Mouse.BUTTONS_MSHTML[this.button] || "none";
      };};
    },
    getViewportLeft : function(){
      return this.clientX;
    },
    getViewportTop : function(){
      return this.clientY;
    },
    getDocumentLeft : function(){
      if(this.pageX !== undefined){
        return this.pageX;
      } else {
        var win = qx.dom.Node.getWindow(this.srcElement);
        return this.clientX + qx.bom.Viewport.getScrollLeft(win);
      };
    },
    getDocumentTop : function(){
      if(this.pageY !== undefined){
        return this.pageY;
      } else {
        var win = qx.dom.Node.getWindow(this.srcElement);
        return this.clientY + qx.bom.Viewport.getScrollTop(win);
      };
    },
    getScreenLeft : function(){
      return this.screenX;
    },
    getScreenTop : function(){
      return this.screenY;
    },
    normalize : function(event, element){
      if(!event){
        return event;
      };
      var bindMethods = qx.module.event.Mouse.BIND_METHODS;
      for(var i = 0,l = bindMethods.length;i < l;i++){
        if(typeof event[bindMethods[i]] != "function"){
          event[bindMethods[i]] = qx.module.event.Mouse[bindMethods[i]].bind(event);
        };
      };
      return event;
    }
  },
  defer : function(statics){
    q.registerEventNormalization(qx.module.event.Mouse.TYPES, statics.normalize);
  }
});
qx.Bootstrap.define("qx.module.event.Keyboard", {
  statics : {
    TYPES : ["keydown", "keypress", "keyup"],
    BIND_METHODS : ["getKeyIdentifier"],
    getKeyIdentifier : function(){
      return qx.event.util.Keyboard.keyCodeToIdentifier(this.keyCode);
    },
    normalize : function(event, element){
      if(!event){
        return event;
      };
      var bindMethods = qx.module.event.Keyboard.BIND_METHODS;
      for(var i = 0,l = bindMethods.length;i < l;i++){
        if(typeof event[bindMethods[i]] != "function"){
          event[bindMethods[i]] = qx.module.event.Keyboard[bindMethods[i]].bind(event);
        };
      };
      return event;
    }
  },
  defer : function(statics){
    q.registerEventNormalization(qx.module.event.Keyboard.TYPES, statics.normalize);
  }
});
qx.Bootstrap.define("qx.event.util.Keyboard", {
  statics : {
    specialCharCodeMap : {
      '8' : "Backspace",
      '9' : "Tab",
      '13' : "Enter",
      '27' : "Escape",
      '32' : "Space"
    },
    numpadToCharCode : {
      '96' : "0".charCodeAt(0),
      '97' : "1".charCodeAt(0),
      '98' : "2".charCodeAt(0),
      '99' : "3".charCodeAt(0),
      '100' : "4".charCodeAt(0),
      '101' : "5".charCodeAt(0),
      '102' : "6".charCodeAt(0),
      '103' : "7".charCodeAt(0),
      '104' : "8".charCodeAt(0),
      '105' : "9".charCodeAt(0),
      '106' : "*".charCodeAt(0),
      '107' : "+".charCodeAt(0),
      '109' : "-".charCodeAt(0),
      '110' : ",".charCodeAt(0),
      '111' : "/".charCodeAt(0)
    },
    keyCodeToIdentifierMap : {
      '16' : "Shift",
      '17' : "Control",
      '18' : "Alt",
      '20' : "CapsLock",
      '224' : "Meta",
      '37' : "Left",
      '38' : "Up",
      '39' : "Right",
      '40' : "Down",
      '33' : "PageUp",
      '34' : "PageDown",
      '35' : "End",
      '36' : "Home",
      '45' : "Insert",
      '46' : "Delete",
      '112' : "F1",
      '113' : "F2",
      '114' : "F3",
      '115' : "F4",
      '116' : "F5",
      '117' : "F6",
      '118' : "F7",
      '119' : "F8",
      '120' : "F9",
      '121' : "F10",
      '122' : "F11",
      '123' : "F12",
      '144' : "NumLock",
      '44' : "PrintScreen",
      '145' : "Scroll",
      '19' : "Pause",
      '91' : qx.core.Environment.get("os.name") == "osx" ? "cmd" : "Win",
      '92' : "Win",
      '93' : qx.core.Environment.get("os.name") == "osx" ? "cmd" : "Apps"
    },
    charCodeA : "A".charCodeAt(0),
    charCodeZ : "Z".charCodeAt(0),
    charCode0 : "0".charCodeAt(0),
    charCode9 : "9".charCodeAt(0),
    keyCodeToIdentifier : function(keyCode){
      if(this.isIdentifiableKeyCode(keyCode)){
        var numPadKeyCode = this.numpadToCharCode[keyCode];
        if(numPadKeyCode){
          return String.fromCharCode(numPadKeyCode);
        };
        return (this.keyCodeToIdentifierMap[keyCode] || this.specialCharCodeMap[keyCode] || String.fromCharCode(keyCode));
      } else {
        return "Unidentified";
      };
    },
    charCodeToIdentifier : function(charCode){
      return this.specialCharCodeMap[charCode] || String.fromCharCode(charCode).toUpperCase();
    },
    isIdentifiableKeyCode : function(keyCode){
      if(keyCode >= this.charCodeA && keyCode <= this.charCodeZ){
        return true;
      };
      if(keyCode >= this.charCode0 && keyCode <= this.charCode9){
        return true;
      };
      if(this.specialCharCodeMap[keyCode]){
        return true;
      };
      if(this.numpadToCharCode[keyCode]){
        return true;
      };
      if(this.isNonPrintableKeyCode(keyCode)){
        return true;
      };
      return false;
    },
    isNonPrintableKeyCode : function(keyCode){
      return this.keyCodeToIdentifierMap[keyCode] ? true : false;
    },
    isValidKeyIdentifier : function(keyIdentifier){
      if(this.identifierToKeyCodeMap[keyIdentifier]){
        return true;
      };
      if(keyIdentifier.length != 1){
        return false;
      };
      if(keyIdentifier >= "0" && keyIdentifier <= "9"){
        return true;
      };
      if(keyIdentifier >= "A" && keyIdentifier <= "Z"){
        return true;
      };
      switch(keyIdentifier){case "+":case "-":case "*":case "/":      return true;default:      return false;};
    },
    isPrintableKeyIdentifier : function(keyIdentifier){
      if(keyIdentifier === "Space"){
        return true;
      } else {
        return this.identifierToKeyCodeMap[keyIdentifier] ? false : true;
      };
    }
  },
  defer : function(statics, members){
    if(!statics.identifierToKeyCodeMap){
      statics.identifierToKeyCodeMap = {
      };
      for(var key in statics.keyCodeToIdentifierMap){
        statics.identifierToKeyCodeMap[statics.keyCodeToIdentifierMap[key]] = parseInt(key, 10);
      };
      for(var key in statics.specialCharCodeMap){
        statics.identifierToKeyCodeMap[statics.specialCharCodeMap[key]] = parseInt(key, 10);
      };
    };
  }
});
qx.Bootstrap.define("qx.module.Template", {
  statics : {
    get : function(id, view, partials){
      var el = qx.bom.Template.get(id, view, partials);
      return qx.lang.Array.cast([el], qx.Collection);
    },
    toHtml : function(template, view, partials, send_fun){
      return qx.bom.Template.toHtml(template, view, partials, send_fun);
    }
  },
  defer : function(statics){
    q.attachStatic({
      "template" : {
        get : statics.get,
        toHtml : statics.toHtml
      }
    });
  }
});
qx.Bootstrap.define("qx.bom.Template", {
  statics : {
    version : null,
    toHtml : null,
    get : function(id, view, partials){
      var template = document.getElementById(id);
      var inner = template.innerHTML;
      inner = this.toHtml(inner, view, partials);
      if(inner.search(/<|>/) === -1){
        return inner;
      };
      var helper = document.createElement("div");
      helper.innerHTML = inner;
      return helper.children[0];
    }
  }
});
(function(){
  var Mustache = function(){
    var regexCache = {
    };
    var Renderer = function(){
    };
    Renderer.prototype = {
      otag : "{{",
      ctag : "}}",
      pragmas : {
      },
      buffer : [],
      pragmas_implemented : {
        "IMPLICIT-ITERATOR" : true
      },
      context : {
      },
      render : function(template, context, partials, in_recursion){
        if(!in_recursion){
          this.context = context;
          this.buffer = [];
        };
        if(!this.includes("", template)){
          if(in_recursion){
            return template;
          } else {
            this.send(template);
            return;
          };
        };
        template = this.render_pragmas(template);
        var html = this.render_section(template, context, partials);
        if(html === false){
          html = this.render_tags(template, context, partials, in_recursion);
        };
        if(in_recursion){
          return html;
        } else {
          this.sendLines(html);
        };
      },
      send : function(line){
        if(line !== ""){
          this.buffer.push(line);
        };
      },
      sendLines : function(text){
        if(text){
          var lines = text.split("\n");
          for(var i = 0;i < lines.length;i++){
            this.send(lines[i]);
          };
        };
      },
      render_pragmas : function(template){
        if(!this.includes("%", template)){
          return template;
        };
        var that = this;
        var regex = this.getCachedRegex("render_pragmas", function(otag, ctag){
          return new RegExp(otag + "%([\\w-]+) ?([\\w]+=[\\w]+)?" + ctag, "g");
        });
        return template.replace(regex, function(match, pragma, options){
          if(!that.pragmas_implemented[pragma]){
            throw ({
              message : "This implementation of mustache doesn't understand the '" + pragma + "' pragma"
            });
          };
          that.pragmas[pragma] = {
          };
          if(options){
            var opts = options.split("=");
            that.pragmas[pragma][opts[0]] = opts[1];
          };
          return "";
        });
      },
      render_partial : function(name, context, partials){
        name = this.trim(name);
        if(!partials || partials[name] === undefined){
          throw ({
            message : "unknown_partial '" + name + "'"
          });
        };
        if(typeof (context[name]) != "object"){
          return this.render(partials[name], context, partials, true);
        };
        return this.render(partials[name], context[name], partials, true);
      },
      render_section : function(template, context, partials){
        if(!this.includes("#", template) && !this.includes("^", template)){
          return false;
        };
        var that = this;
        var regex = this.getCachedRegex("render_section", function(otag, ctag){
          return new RegExp("^([\\s\\S]*?)" + otag + "(\\^|\\#)\\s*(.+)\\s*" + ctag + "\n*([\\s\\S]*?)" + otag + "\\/\\s*\\3\\s*" + ctag + "\\s*([\\s\\S]*)$", "g");
        });
        return template.replace(regex, function(match, before, type, name, content, after){
          var renderedBefore = before ? that.render_tags(before, context, partials, true) : "",renderedAfter = after ? that.render(after, context, partials, true) : "",renderedContent,value = that.find(name, context);
          if(type === "^"){
            if(!value || that.is_array(value) && value.length === 0){
              renderedContent = that.render(content, context, partials, true);
            } else {
              renderedContent = "";
            };
          } else if(type === "#"){
            if(that.is_array(value)){
              renderedContent = that.map(value, function(row){
                return that.render(content, that.create_context(row), partials, true);
              }).join("");
            } else if(that.is_object(value)){
              renderedContent = that.render(content, that.create_context(value), partials, true);
            } else if(typeof value === "function"){
              renderedContent = value.call(context, content, function(text){
                return that.render(text, context, partials, true);
              });
            } else if(value){
              renderedContent = that.render(content, context, partials, true);
            } else {
              renderedContent = "";
            };;;
          };
          return renderedBefore + renderedContent + renderedAfter;
        });
      },
      render_tags : function(template, context, partials, in_recursion){
        var that = this;
        var new_regex = function(){
          return that.getCachedRegex("render_tags", function(otag, ctag){
            return new RegExp(otag + "(=|!|>|\\{|%)?([^\\/#\\^]+?)\\1?" + ctag + "+", "g");
          });
        };
        var regex = new_regex();
        var tag_replace_callback = function(match, operator, name){
          switch(operator){case "!":          return "";case "=":          that.set_delimiters(name);
          regex = new_regex();
          return "";case ">":          return that.render_partial(name, context, partials);case "{":          return that.find(name, context);default:          return that.escape(that.find(name, context));};
        };
        var lines = template.split("\n");
        for(var i = 0;i < lines.length;i++){
          lines[i] = lines[i].replace(regex, tag_replace_callback, this);
          if(!in_recursion){
            this.send(lines[i]);
          };
        };
        if(in_recursion){
          return lines.join("\n");
        };
      },
      set_delimiters : function(delimiters){
        var dels = delimiters.split(" ");
        this.otag = this.escape_regex(dels[0]);
        this.ctag = this.escape_regex(dels[1]);
      },
      escape_regex : function(text){
        if(!arguments.callee.sRE){
          var specials = ['/', '.', '*', '+', '?', '|', '(', ')', '[', ']', '{', '}', '\\'];
          arguments.callee.sRE = new RegExp('(\\' + specials.join('|\\') + ')', 'g');
        };
        return text.replace(arguments.callee.sRE, '\\$1');
      },
      find : function(name, context){
        name = this.trim(name);
        function is_kinda_truthy(bool){
          return bool === false || bool === 0 || bool;
        };
        var value;
        if(name.match(/([a-z_]+)\./ig)){
          var childValue = this.walk_context(name, context);
          if(is_kinda_truthy(childValue)){
            value = childValue;
          };
        } else {
          if(is_kinda_truthy(context[name])){
            value = context[name];
          } else if(is_kinda_truthy(this.context[name])){
            value = this.context[name];
          };
        };
        if(typeof value === "function"){
          return value.apply(context);
        };
        if(value !== undefined){
          return value;
        };
        return "";
      },
      walk_context : function(name, context){
        var path = name.split('.');
        var value_context = (context[path[0]] != undefined) ? context : this.context;
        var value = value_context[path.shift()];
        while(value != undefined && path.length > 0){
          value_context = value;
          value = value[path.shift()];
        };
        if(typeof value === "function"){
          return value.apply(value_context);
        };
        return value;
      },
      includes : function(needle, haystack){
        return haystack.indexOf(this.otag + needle) != -1;
      },
      escape : function(s){
        s = String(s === null ? "" : s);
        return s.replace(/&(?!\w+;)|["'<>\\]/g, function(s){
          switch(s){case "&":          return "&amp;";case '"':          return '&quot;';case "'":          return '&#39;';case "<":          return "&lt;";case ">":          return "&gt;";default:          return s;};
        });
      },
      create_context : function(_context){
        if(this.is_object(_context)){
          return _context;
        } else {
          var iterator = ".";
          if(this.pragmas["IMPLICIT-ITERATOR"]){
            iterator = this.pragmas["IMPLICIT-ITERATOR"].iterator;
          };
          var ctx = {
          };
          ctx[iterator] = _context;
          return ctx;
        };
      },
      is_object : function(a){
        return a && typeof a == "object";
      },
      is_array : function(a){
        return Object.prototype.toString.call(a) === '[object Array]';
      },
      trim : function(s){
        return s.replace(/^\s*|\s*$/g, "");
      },
      map : function(array, fn){
        if(typeof array.map == "function"){
          return array.map(fn);
        } else {
          var r = [];
          var l = array.length;
          for(var i = 0;i < l;i++){
            r.push(fn(array[i]));
          };
          return r;
        };
      },
      getCachedRegex : function(name, generator){
        var byOtag = regexCache[this.otag];
        if(!byOtag){
          byOtag = regexCache[this.otag] = {
          };
        };
        var byCtag = byOtag[this.ctag];
        if(!byCtag){
          byCtag = byOtag[this.ctag] = {
          };
        };
        var regex = byCtag[name];
        if(!regex){
          regex = byCtag[name] = generator(this.otag, this.ctag);
        };
        return regex;
      }
    };
    return ({
      name : "mustache.js",
      version : "0.4.0-dev",
      to_html : function(template, view, partials, send_fun){
        var renderer = new Renderer();
        if(send_fun){
          renderer.send = send_fun;
        };
        renderer.render(template, view || {
        }, partials);
        if(!send_fun){
          return renderer.buffer.join("\n");
        };
      }
    });
  }();
  qx.bom.Template.version = Mustache.version;
  qx.bom.Template.toHtml = Mustache.to_html;
})();
qx.Bootstrap.define("qx.module.Polyfill", {
  statics : {
    functionBind : function(){
      if(typeof Function.prototype.bind !== "function"){
        Function.prototype.bind = function(context){
          var args = Array.prototype.slice.call(arguments, 1);
          return qx.Bootstrap.bind.apply(null, [this, context].concat(args));
        };
      };
    },
    stringTrim : function(){
      if(typeof String.prototype.trim !== "function"){
        String.prototype.trim = function(context){
          return this.replace(/^\s+|\s+$/g, '');
        };
      };
      if(typeof String.prototype.trimLeft !== "function"){
        String.prototype.trimLeft = function(context){
          return this.replace(/^\s+/g, '');
        };
      };
      if(typeof String.prototype.trimRight !== "function"){
        String.prototype.trimRight = function(context){
          return this.replace(/\s+$/g, '');
        };
      };
    }
  },
  defer : function(statics){
    statics.functionBind();
    statics.stringTrim();
  }
});
qx.Bootstrap.define("qx.util.placement.AbstractAxis", {
  extend : Object,
  statics : {
    computeStart : function(size, target, offsets, areaSize, position){
      throw new Error("abstract method call!");
    },
    _moveToEdgeAndAlign : function(size, target, offsets, position){
      switch(position){case "edge-start":      return target.start - offsets.end - size;case "edge-end":      return target.end + offsets.start;case "align-start":      return target.start + offsets.start;case "align-end":      return target.end - offsets.end - size;};
    },
    _isInRange : function(start, size, areaSize){
      return start >= 0 && start + size <= areaSize;
    }
  }
});
qx.Bootstrap.define("qx.util.placement.DirectAxis", {
  statics : {
    _moveToEdgeAndAlign : qx.util.placement.AbstractAxis._moveToEdgeAndAlign,
    computeStart : function(size, target, offsets, areaSize, position){
      return this._moveToEdgeAndAlign(size, target, offsets, position);
    }
  }
});
qx.Bootstrap.define("qx.util.placement.KeepAlignAxis", {
  statics : {
    _moveToEdgeAndAlign : qx.util.placement.AbstractAxis._moveToEdgeAndAlign,
    _isInRange : qx.util.placement.AbstractAxis._isInRange,
    computeStart : function(size, target, offsets, areaSize, position){
      var start = this._moveToEdgeAndAlign(size, target, offsets, position);
      var range1End,range2Start;
      if(this._isInRange(start, size, areaSize)){
        return start;
      };
      if(position == "edge-start" || position == "edge-end"){
        range1End = target.start - offsets.end;
        range2Start = target.end + offsets.start;
      } else {
        range1End = target.end - offsets.end;
        range2Start = target.start + offsets.start;
      };
      if(range1End > areaSize - range2Start){
        start = range1End - size;
      } else {
        start = range2Start;
      };
      return start;
    }
  }
});
qx.Bootstrap.define("qx.util.placement.BestFitAxis", {
  statics : {
    _isInRange : qx.util.placement.AbstractAxis._isInRange,
    _moveToEdgeAndAlign : qx.util.placement.AbstractAxis._moveToEdgeAndAlign,
    computeStart : function(size, target, offsets, areaSize, position){
      var start = this._moveToEdgeAndAlign(size, target, offsets, position);
      if(this._isInRange(start, size, areaSize)){
        return start;
      };
      if(start < 0){
        start = Math.min(0, areaSize - size);
      };
      if(start + size > areaSize){
        start = Math.max(0, areaSize - size);
      };
      return start;
    }
  }
});
qx.Bootstrap.define("qx.module.Placement", {
  statics : {
    placeTo : function(target, position, offsets, modeX, modeY){
      if(!this[0]){
        return null;
      };
      var axes = {
        x : qx.module.Placement._getAxis(modeX),
        y : qx.module.Placement._getAxis(modeY)
      };
      var size = {
        width : this.getWidth(),
        height : this.getHeight()
      };
      var parent = this.getParents();
      var area = {
        width : parent.getWidth(),
        height : parent.getHeight()
      };
      var target = q.wrap(target).getOffset();
      var offsets = offsets || {
        top : 0,
        right : 0,
        bottom : 0,
        left : 0
      };
      var splitted = position.split("-");
      var edge = splitted[0];
      var align = splitted[1];
      var position = {
        x : qx.module.Placement._getPositionX(edge, align),
        y : qx.module.Placement._getPositionY(edge, align)
      };
      var newLocation = qx.module.Placement._computePlacement(axes, size, area, target, offsets, position);
      this.setStyles({
        position : "absolute",
        left : newLocation.left + "px",
        top : newLocation.top + "px"
      });
      return this;
    },
    _getAxis : function(mode){
      switch(mode){case "keep-align":      return qx.util.placement.KeepAlignAxis;case "best-fit":      return qx.util.placement.BestFitAxis;case "direct":default:      return qx.util.placement.DirectAxis;};
    },
    _computePlacement : function(axes, size, area, target, offsets, position){
      var left = axes.x.computeStart(size.width, {
        start : target.left,
        end : target.right
      }, {
        start : offsets.left,
        end : offsets.right
      }, area.width, position.x);
      var top = axes.y.computeStart(size.height, {
        start : target.top,
        end : target.bottom
      }, {
        start : offsets.top,
        end : offsets.bottom
      }, area.height, position.y);
      return {
        left : left,
        top : top
      };
    },
    _getPositionX : function(edge, align){
      if(edge == "left"){
        return "edge-start";
      } else if(edge == "right"){
        return "edge-end";
      } else if(align == "left"){
        return "align-start";
      } else if(align == "right"){
        return "align-end";
      };;;
    },
    _getPositionY : function(edge, align){
      if(edge == "top"){
        return "edge-start";
      } else if(edge == "bottom"){
        return "edge-end";
      } else if(align == "top"){
        return "align-start";
      } else if(align == "bottom"){
        return "align-end";
      };;;
    }
  },
  defer : function(statics){
    q.attach({
      "placeTo" : statics.placeTo
    });
  }
});
qx.Bootstrap.define("qx.module.Blocker", {
  statics : {
    __attachBlocker : function(item, color, opacity, zIndex){
      var win = q.getWindow(item);
      var isDocument = q.isDocument(item);
      if(!item.__blocker){
        item.__blocker = {
          div : q.create("<div/>")
        };
        if((qx.core.Environment.get("engine.name") == "mshtml")){
          item.__blocker.iframe = qx.module.Blocker.__getIframeElement(win);
        };
      };
      qx.module.Blocker.__styleBlocker(item, color, opacity, zIndex, isDocument);
      item.__blocker.div.appendTo(win.document.body);
      if(item.__blocker.iframe){
        item.__blocker.iframe.appendTo(win.document.body);
      };
      if(isDocument){
        q.wrap(win).on("resize", qx.module.Blocker.__onWindowResize);
      };
    },
    __styleBlocker : function(item, color, opacity, zIndex, isDocument){
      var qItem = q.wrap(item);
      var styles = {
        "zIndex" : zIndex,
        "display" : "block",
        "position" : "absolute",
        "backgroundColor" : color,
        "opacity" : opacity,
        "width" : qItem.getWidth() + "px",
        "height" : qItem.getHeight() + "px"
      };
      if(isDocument){
        styles.top = 0 + "px";
        styles.left = 0 + "px";
      } else {
        var pos = qItem.getOffset();
        styles.top = pos.top + "px";
        styles.left = pos.left + "px";
      };
      item.__blocker.div.setStyles(styles);
      if(item.__blocker.iframe){
        styles.zIndex = styles.zIndex - 1;
        styles.backgroundColor = "transparent";
        styles.opacity = 0;
        item.__blocker.iframe.setStyles(styles);
      };
    },
    __getIframeElement : function(win){
      var iframe = q.create('<iframe></iframe>');
      iframe.setAttributes({
        frameBorder : 0,
        frameSpacing : 0,
        marginWidth : 0,
        marginHeight : 0,
        hspace : 0,
        vspace : 0,
        border : 0,
        allowTransparency : false,
        src : "javascript:false"
      });
      return iframe;
    },
    __onWindowResize : function(ev){
      var win = this[0];
      var size = {
        width : this.getWidth() + "px",
        height : this.getHeight() + "px"
      };
      q.wrap(win.document.__blocker.div).setStyles(size);
      if(win.document.__blocker.iframe){
        q.wrap(win.document.__blocker.iframe).setStyles(size);
      };
    },
    __detachBlocker : function(item, index){
      if(!item.__blocker){
        return;
      };
      item.__blocker.div.remove();
      if(item.__blocker.iframe){
        item.__blocker.iframe.remove();
      };
      if(q.isDocument(item)){
        q.wrap(q.getWindow(item)).off("resize", qx.module.Blocker.__onWindowResize);
      };
    },
    block : function(color, opacity, zIndex){
      if(!this[0]){
        return this;
      };
      color = color || "transparent";
      opacity = opacity || 0;
      zIndex = zIndex || 10000;
      this.forEach(function(item, index){
        qx.module.Blocker.__attachBlocker(item, color, opacity, zIndex);
      });
      return this;
    },
    unblock : function(){
      if(!this[0]){
        return this;
      };
      this.forEach(qx.module.Blocker.__detachBlocker);
      return this;
    }
  },
  defer : function(statics){
    q.attach({
      "block" : statics.block,
      "unblock" : statics.unblock
    });
  }
});
qx.Bootstrap.define("qx.module.util.String", {
  statics : {
    camelCase : function(str){
      return qx.lang.String.camelCase.call(qx.lang.String, str);
    },
    hyphenate : function(str){
      return qx.lang.String.hyphenate.call(qx.lang.String, str);
    },
    firstUp : qx.lang.String.firstUp,
    firstLow : qx.lang.String.firstLow,
    startsWith : qx.lang.String.startsWith,
    endsWith : qx.lang.String.endsWith,
    escapeRegexpChars : qx.lang.String.escapeRegexpChars
  },
  defer : function(statics){
    q.attachStatic({
      string : {
        camelCase : statics.camelCase,
        hyphenate : statics.hyphenate,
        firstUp : statics.firstUp,
        firstLow : statics.firstLow,
        startsWith : statics.startsWith,
        endsWith : statics.endsWith,
        escapeRegexpChars : statics.escapeRegexpChars
      }
    });
  }
});
qx.Bootstrap.define("qx.module.Environment", {
  statics : {
    get : function(key){
      return qx.core.Environment.get(key);
    },
    add : function(key, value){
      qx.core.Environment.add(key, value);
      return this;
    }
  },
  defer : function(statics){
    qx.core.Environment.get("browser.name");
    qx.core.Environment.get("browser.version");
    qx.core.Environment.get("browser.quirksmode");
    qx.core.Environment.get("browser.documentmode");
    qx.core.Environment.get("engine.name");
    qx.core.Environment.get("engine.version");
    q.attachStatic({
      "env" : {
        get : statics.get,
        add : statics.add
      }
    });
  }
});
qx.Bootstrap.define("qx.module.util.Type", {
  statics : {
    get : qx.Bootstrap.getClass
  },
  defer : function(statics){
    q.attachStatic({
      type : {
        get : statics.get
      }
    });
  }
});


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

window[qx] = undefined;
try {
  delete window.qx;
} catch(e) {}

})();