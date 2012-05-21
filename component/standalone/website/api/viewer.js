/**
 * @lint ignoreUndefined(q, samples, hljs)
 */
q.ready(function() {
  // global storage for the method index
  var data = {};

  // load API data of q
  q.io.xhr("script/q.json").send().on("loadend", function(xhr) {
    if (xhr.readyState == 4) {
      var ast = JSON.parse(xhr.responseText);
      createData(ast);
      renderList();
      renderContent()
      onContentReady();
    } else {
      console.log("ERROR!"); // TODO
    }
  });


  /**
   * DATA PROCESSING
   */
  var desc = "";
  var createData = function(ast) {
    desc = ast.attributes.desc || "";
    attachData(getByType(ast, "methods-static"), "static");
    attachData(getByType(ast, "methods"), "member");
    // sort all methods
    for (var module in data) {
      data[module]["static"].sort(sortMethods);
      data[module]["member"].sort(sortMethods);
    }
  };


  var attachData = function(ast, type) {
    ast && ast.children.forEach(function(item) {
      // skip internal methods
      if (item.attributes.isInternal) {
        return;
      }
      var module = getModuleName(item.attributes.sourceClass);
      if (!data[module]) {
        data[module] = {"static": [], "member": [], fileName: item.attributes.sourceClass};
      }
      data[module][type].push(item);
    });
  };


  var sortMethods = function(a, b) {
    return a.attributes.name > b.attributes.name;
  };


  /**
   * LIST
   */
  var renderList = function() {
    var list = q("#list");
    var keys = getDataKeys();
    for (var i = 0; i < keys.length; i++) {
      var module = keys[i];
      list.append(q.create("<a href='#" + module + "'><h2>" + module + "</h2></a>"));
      var ul = q.create("<ul></ul>").appendTo(list);
      data[module]["static"].forEach(function(ast) {
        var name = getMethodName(ast);
        q.template.get("list-item", {name: name + "()", link: name}).appendTo(ul);
      });
      data[module]["member"].forEach(function(ast) {
        var name = getMethodName(ast);
        q.template.get("list-item", {name: name + "()", link: name}).appendTo(ul);
      });
    }
  };


  /**
   * CONTENT
   */
   var renderContent = function() {
     var keys = getDataKeys();
     for (var i = 0; i < keys.length; i++) {
       renderModule(keys[i], data[keys[i]]);
     }
   };


   var renderModule = function(name, data, fileName) {
     // render module desc
     var module = q.create("<div class='module'>").appendTo("#content");
     module.append(q.create("<h1 id='" + name + "'>" + name + "</h1>"));
     addClassDoc(data.fileName, module);

     data["static"].forEach(renderMethod);
     data["member"].forEach(renderMethod);
   };


  var renderMethod = function(method) {
    // skip internal methods
    if (method.attributes.isInternal) {
      return;
    }
    // add the name
    var data = {name: getMethodName(method)};

    // module
    data.module = getModuleName(method.attributes.sourceClass);

    // add the description
    data.desc = parse(getByType(method, "desc").attributes.text) || "";

    // add the return type
    var returnType = getByType(method, "return");
    if (returnType) {
      data.returns = {desc: parse(getByType(returnType, "desc").attributes.text || "")};
      data.returns.types = [];
      getByType(returnType, "types").children.forEach(function(item) {
        data.returns.types.push(item.attributes.type);
      });
    }
    data.returns.printTypes = printTypes;

    // add the parameters
    data.params = [];
    var params = getByType(method, "params");
    for (var j=0; j < params.children.length; j++) {
      var param = params.children[j];
      var paramData = {name: param.attributes.name};
      paramData.desc = parse(getByType(param, "desc").attributes.text || "");
      paramData.types = [];
      var types = getByType(param, "types");
      for (var k=0; k < types.children.length; k++) {
        var type = types.children[k];
        paramData.types.push(type.attributes.type);
      };
      paramData.printTypes = printTypes;
      data.params.push(paramData);
    };
    data.printParams = printParams;

    q("#content").append(q.template.get("method", data));
  }


  var addClassDoc = function(name, parent) {
    if (name) {
      name = name.split("#")[0];
    } else {
      parent.append(desc);
      return;
    }
    loading++;
    q.io.xhr("script/" + name + ".json").send().on("loadend", function(xhr) {
      loading--;
      onContentReady();
      if (xhr.readyState == 4) {
        var ast = JSON.parse(xhr.responseText);
        var desc = getByType(ast, "desc");
        parent.append(parse(desc.attributes.text || ""));
      } else {
        console.log("ERROR!"); // TODO
      }
    });
  }

  var printParams = function() {
    var params = "";
    for (var i = 0; i < this.params.length; i++) {
      params += this.params[i].name;
      if (i < this.params.length - 1) {
        params += ", ";
      }
    }
    return params;
  };

  var printTypes = function() {
    var params = "";
    for (var i = 0; i < this.types.length; i++) {
      params += addTypeLink(this.types[i]);
      if (i < this.types.length - 1) {
        params += ", ";
      }
    }
    return params;
  };


  /**
   * PARSER
   */
   var parse = function(text) {
     if (!text) {
       return;
     }
     // @links: methods
     text = text.replace(/\{@link .*#(.*?)\}/g, "<code><a href='#.$1'>.$1()</a></code>");
     // @links: core
     text = text.replace(/\{@link q\}/g, "<a href='#Core'>Core</a>");
     // @links: modules
     var links;
     var regexp = /\{@link (.*?)\}/g;
     while ((links = regexp.exec(text)) != null) {
       var name = getModuleName(links[1]);
       text = text.replace(links[0], "<a href='#" + name + "'>" + name + "</a>");
     }
     return text;
   };


  /**
   * FINALIZE
   */
  var loading = 0;
  var onContentReady = function() {
    if (loading > 0) {
      return;
    }
    // jump to the selected item
    if (location.hash) {
      location.href = location.href;
    }
    // enable syntax highlighting
    q('pre').forEach(function(el) {hljs.highlightBlock(el)});

    loadSamples();
  }


  var loadSamples = function() {
    q.io.script("samples.js").send().on("loadend", function() {
      for (var method in samples) {
        var selector = "#" + method.replace(".", "\\.");
        q(selector).append(q.create("<h4>Examples</h4>"));
        for (var i=0; i < samples[method].length; i++) {
          var sample = samples[method][i].toString();
          sample = sample.substring(sample.indexOf("\n") + 1, sample.length - 2);
          var sampleElement = q(selector);
          if (sampleElement[0]) {
            hljs.highlightBlock(q.create("<pre>").appendTo(sampleElement).setHtml(sample)[0]);
          } else {
            console && console.warn("Sample could not be attached for '", method, "'.")
          }
        };
      }
    });
  };

  /**
   * HELPERS
   */
   var getDataKeys = function() {
     var keys = Object.keys(data);
     keys.sort(function(a, b) {
       if (a == "Core") {
         return -1;
       }
       return a < b ? -1 : +1;
     });
     return keys;
   };


  var getByType = function(ast, type) {
    for (var i=0; i < ast.children.length; i++) {
      var item = ast.children[i];
      if (item.type == type) {
        return item;
      }
    };
    return {attributes: {}, children: []};
  };


  var getModuleName = function(attach) {
   if (!attach) {
     return "Core";
   }
   attach = attach.replace("qx.module.", "");
   return attach;
  };


  var getMethodName = function(item) {
    var attachData = getByType(item, "attachStatic");
    if (item.attributes.isStatic) {
      return "q." + (attachData.attributes.targetMethod || item.attributes.name);
    } else {
      return "." + item.attributes.name;
    }
  };


  var addTypeLink = function(type) {
    if (type == "q") {
      return "<a href='#Core'>q</a>";
    }
    if (!MDC_LINKS[type]) {
      return type;
    }
    return "<a target='_blank' href='" + MDC_LINKS[type] + "'>" + type + "</a>";
  };


  var MDC_LINKS = {
    "Event" : "https://developer.mozilla.org/en/DOM/event",
    "Window" : "https://developer.mozilla.org/en/DOM/window",
    "Document" : "https://developer.mozilla.org/en/DOM/document",
    "Element" : "https://developer.mozilla.org/en/DOM/element",
    "Node" : "https://developer.mozilla.org/en/DOM/node",
    "Date" : "https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Date",
    "Function" : "https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function",
    "Array" : "https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array",
    "Object" : "https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object",
    "RegExp" : "https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/RegExp",
    "Error" : "https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Error",
    "Number" : "https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Number",
    "Boolean" : "https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Boolean",
    "String" : "https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/String",
    "undefined" : "https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/undefined",
    "arguments" : "https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/arguments",
    "Font" : "https://developer.mozilla.org/en/CSS/font",
    "Color" : "https://developer.mozilla.org/en/CSS/color"
  };

});