/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)
     * Daniel Wagner (danielwagner)

************************************************************************ */
/**
 * @lint ignoreUndefined(q, qxWeb, samples, hljs)
 */
q.ready(function() {
  FastClick.attach(document.body);

  // remove the warning
  q("#warning").setStyle("display", "none");

  var title, docTitle;
  var customTitle = q.$$qx.core.Environment.get("apiviewer.title");
  if (customTitle) {
    title = customTitle;
    docTitle = title;
  }
  else {
    var version = q.$$qx.core.Environment.get("qx.version");
    if (version) {
      title = "API Documentation <span>qx.Website " + version + "</span>";
      docTitle = "qx.Website " + version + " API Documentation";
    }
  }
  q("h1").setHtml(title);
  document.title = docTitle;

  // global storage for the method index
  var data = {};
  var icons = {
    "Core": "&#xF0C7;",
    "Extras": "&#xF01D;",
    "Polyfill": "&#xF0DA;",
    "Widget": "&#xF124;",
    "IO": "&#xF0BB;",
    "Event_Normalization": "&#xF076;",
    "Utilities": "&#xF04E;",
    "Plugin_API": "&#xF063;"
  };

  var listOrder = [
    "Core",
    "Extras",
    "IO",
    "Event_Normalization",
    "Utilities",
    "Polyfill",
    "Widget",
    "Plugin_API"
  ];

  var configReplacements = q.$$qx.core.Environment.get("apiviewer.modulenamereplacements");
  var replacements = [];
  for (var exp in configReplacements) {
    replacements.push({
      regExp: new RegExp(exp),
      replacement: configReplacements[exp]
    });
  }

  var onFilterInput = function() {
    var value = filterField.getValue();

    if (!value) {
      clearInterval(debouncedHideFiltered.intervalId);
      delete debouncedHideFiltered.intervalId;
      q("#list .qx-accordion-button")._forEachElementWrapped(function(button) {
        button.setData("results", "");
        if (q.env.get("engine.name") == "mshtml") {
          // IE won't re-apply the element's styles (which use the data
          // attribute) if element.dataset is used
          button.setAttribute("data-results", "");
        }
      });
      q("#list .qx-accordion-page ul").show();
      q("#list .qx-accordion-page li").show();
      q("#list .qx-accordion-page > a").show();
      q("#list .qx-accordion-button").removeClass("no-matches"); // allow click on every group button
      q("#list").render();
      return;
    }

    debouncedHideFiltered(value);
  };

  var filterField = q(".filter input");
  filterField.on("input", onFilterInput);

  var debouncedHideFiltered = q.func.debounce(function(value) {
    hideFiltered(value);
  }, 500);

  var hideFiltered = function(query) {
    q("#list .qx-accordion-page > a").hide(); // module headers
    q("#list .qx-accordion-page ul").hide(); // method lists
    q("#list .qx-accordion-page li").hide(); // method items
    q("#list .qx-accordion-button").removeClass("no-matches"); // allow click on every group button
    var regEx = new RegExp(query, "i");

    q("#list .qx-accordion-button").forEach(function(groupButton) {
      var groupResults = 0;
      groupButton = q(groupButton);
      var groupPage = groupButton.getNext();
      groupPage.find("> ul > li").forEach(function(item) {
        item = q(item);
        var methodName = item.getChildren("a").getHtml();
        if (regEx.exec(methodName)) {
          groupResults++;
          item.show(); // method items
          item.getParents().show(); // method lists
          item.getParents().getPrev().show(); // module headers
        }
      });
      groupButton.setData("results", groupResults);
      if (q.env.get("engine.name") == "mshtml") {
        // IE won't re-apply the element's styles (which use the data
        // attribute) if element.dataset is used
        groupButton.setAttribute("data-results", groupResults);
      }
      if (groupResults == 0) {
        groupButton.addClass("no-matches");
      }
    });

    q("#list").render();
  };


  q("html").on("click", function(ev) {
    var showNav = q("#showNav");
    var value = parseInt(showNav.getValue());
    if (value == 1 && q("#navContainer").contains(ev.getTarget()).length == 0) {
      q("#navContainer").setStyle("left", "");
      showNav.setValue(0);
    }

    else if (value == 0 && showNav[0] == ev.getTarget()) {
      q("#navContainer").setStyle("left", "0px");
      showNav.setValue(1);
    }
  });

  q.matchMedia("(max-width: 800px), (orientation:portrait)").on("change", function(e) {
    if (!e.matches) {
      // reset the left property (menu is open and query changes)
      q("#navContainer").setStyle("left", "");
    }
  });


  // load API data of q
  q.io.xhr("script/qxWeb.json").on("loadend", function(xhr) {
    var handleSuccess = function() {
      var ast = JSON.parse(xhr.responseText);

      // constructor
      var construct = getByType(ast, "constructor");
      data["Core"] = {"static" : [], "member": []};
      data["Core"]["static"].push(getByType(construct, "method"));

      createData(ast);
      loadEventNorm();
      loadPolyfills();
      onContentReady();
    };

    var isFileProtocol = function() {
      return (location.protocol.indexOf("file") === 0);
    };

    if (xhr.readyState == 4 && xhr.status >= 200 && xhr.status < 400) {
      if (q.env.get("engine.name") == "mshtml" && isFileProtocol()) {
        // postpone data processing in IE when using file protocol
        // to prevent rendering no module doc at all
        window.setTimeout(handleSuccess, 0);
      } else {
        handleSuccess();
      }
    } else {
      q("#warning").setStyle("display", "block");
      if (isFileProtocol()) {
        q("#warning em").setHtml("File protocol not supported. Please load the application via HTTP.");
      }
    }
  }).send();


  var loadEventNorm = function() {
    var norm = q.env.get("q.eventtypes");
    if (norm) {
      norm = norm.split(",");
      norm.forEach(function(name) {
        loading++;
        q.io.xhr("script/" + name + ".json").on("loadend", function(xhr) {
          loading--;
          if (xhr.readyState == 4 && xhr.status >= 200 && xhr.status < 400) {
            var ast = JSON.parse(xhr.responseText);
            var name = ast.attributes.name;
            data[name] = {
              type: "class",
              prefix: "event.",
              ast : ast
            };
          } else {
            console && console.warn("Event normalization '" + name + "' could not be loaded.");
          }
          onContentReady();
        }).send();
      });
    }
  };


  polyfillClasses = [];
  var loadPolyfills = function() {
    if (!(q.$$qx.module.Polyfill && q.$$qx.lang.normalize) ) {
      return;
    }

    polyfillClasses = Object.keys(q.$$qx.lang.normalize);
    for (var clazz in q.$$qx.lang.normalize) {
      loading++;
      q.io.xhr("script/qx.lang.normalize." + clazz + ".json").on("loadend", function(xhr) {
        loading--;
        if (xhr.readyState == 4 && xhr.status >= 200 && xhr.status < 400) {
          var ast = JSON.parse(xhr.responseText);
          var name = ast.attributes.name;
          data[name] = {
            type: "class",
            prefix: "normalize.",
            ast : ast
          };
        } else {
          console && console.warn("Polyfill '" + clazz + "' could not be loaded.");
        }
        onContentReady();
      }).send();
    }
  };


  var loadedClasses = [];
  var loadClass = function(name) {
    if (loadedClasses.indexOf(name) != -1) {
      return;
    }
    // ignore the q class
    if (name == "q") {
      return;
    }

    loadedClasses.push(name);
    loading++;
    q.io.xhr("script/" + name + ".json").on("loadend", function(xhr) {
      loading--;
      if (xhr.readyState == 4 && xhr.status >= 200 && xhr.status < 400) {
        var ast = JSON.parse(xhr.responseText);
        var moduleName = ast.attributes.name;
        getByType(ast, "methods-static").children = [];
        if (data[moduleName]) {
          data[moduleName].member.forEach(function(method) {
            var attach = getByType(method, "attach");
            var prefix = attach.attributes.targetClass == "qxWeb" ? "" : attach.attributes.targetClass;
            prefix += "." + method.attributes.name;
            method.attributes.prefixedMethodName = prefix;
            getByType(ast, "methods").children.unshift(method);
          });
        }
        data[moduleName] = {
          type: "class",
          ast : ast,
          prefix: ""
        };
      } else {
        name = getModuleNameFromClassName(name);
        q("#content").append(
          q.create("<h1>" + name + "</h1><p style='color: #C00F00'><em>Failed to load " + name + " documentation!</em></p>")
        );
      }
      onContentReady();
    }).send();
  };


  var loadReturnTypes = function(method) {
    var returnType = getByType(method, "return");
    if (returnType) {
      getByType(returnType, "types").children.forEach(function(item) {
        var type = item.attributes.type;
        if (IGNORE_TYPES.indexOf(type) == -1 && MDC_LINKS[type] === undefined) {
          loadClass(type);
        }
      });
    }
  };


  /**
   * DATA PROCESSING
   */
  var desc = "";
  var createData = function(ast) {
    desc = getByType(ast, "desc").attributes.text;
    attachData(getByType(ast, "methods-static"), "static");
    attachData(getByType(ast, "methods"), "member");
    // sort all methods
    for (var module in data) {
      data[module]["static"].sort(sortMethods);
      data[module]["member"].sort(sortMethods);
      data[module]["static"].forEach(loadReturnTypes);
      data[module]["member"].forEach(loadReturnTypes);
    }

    var setGroup = function(method) {
      method.attributes.group = "Core";
    };

    data["Core"]["static"].forEach(setGroup);
    data["Core"]["member"].forEach(setGroup);

    for (var moduleName in data) {
      var group = data[moduleName].group;
      if (!group && data[moduleName].member.length > 0) {
        group = data[moduleName].member[0].attributes.group;
      }
      if (!group && data[moduleName].static.length > 0) {
        group = data[moduleName].static[0].attributes.group;
      }
      if (!group) {
        group = "Extras";
      }
      data[moduleName].group = group;
    }
  };


  var attachData = function(ast, type) {
    ast && ast.children.forEach(function(item) {
      // skip internal methods
      if (isInternal(item)) {
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
    return getMethodName(a) > getMethodName(b) ? 1 : -1;
  };


  /**
   * LIST
   * @lint ignoreUndefined(q)
   */
  var renderList = function() {
    var keys = getDataKeys();
    for (var i = 0; i < keys.length; i++) {
      var module = keys[i];
      if (data[module].type == "class") {
        renderClass(data[module].ast, data[module].prefix, true);
      } else {
        renderListModule(module, data[module]);
      }
    }
  };


  var renderListModule = function(id, data, prefix) {
    var name = id.replace(/_/g, " ");
    var checkMissing = q.$$qx.core.Environment.get("apiviewer.check.missingmethods");
    var className = convertNameToCssClass(id, "nav-");

    var factoryName;
    var ul = q.create("<ul></ul>");
    data["static"].forEach(function(ast) {
      var methodName = getMethodName(ast, prefix);
      var missing = false;
      if (checkMissing !== false) {
        missing = isMethodMissing(methodName, data.classname);
      }
      q.template.get("list-item", {
        name: methodName + "()",
        classname: convertNameToCssClass(methodName, "nav-"),
        missing: missing,
        link: methodName,
        plugin: isPluginMethod(methodName)
      }).appendTo(ul);
    });
    data["member"].forEach(function(ast) {
      var methodName = getMethodName(ast, prefix);
      var methodIsFactory = isFactory(ast, name);
      factoryName = methodIsFactory ? methodName + "()": factoryName;
      if (methodIsFactory) {
        return;
      }

      var missing = isMethodMissing(methodName, data.classname);
      q.template.get("list-item", {
        name: methodName + "()",
        classname: convertNameToCssClass(methodName, "nav-"),
        missing: missing,
        link: methodName,
        plugin: isPluginMethod(methodName)
      }).appendTo(ul);
    });

    var group = data.group;
    var groupId = "list-group-" + group;

    var groupPage = q("#list").find("> ul > #" + groupId);
    if (groupPage.length == 0) {
      var groupIcon = icons[group];
      if (groupIcon) {
        groupIcon = "data-icon='" + groupIcon + "'";
      }
      var button = q.create("<li " + groupIcon + " data-qx-accordion-page='#" + groupId + "' class='qx-accordion-button'>" + group.replace("_", " ") + "</li>")
        .appendTo("#list > ul");
      groupPage = q.create("<li class='qx-accordion-page' id='" + groupId + "'></li>").appendTo("#list > ul");
    }

    if (name !== "Core") {
      var headerText = factoryName || name;
      var header = q.create('<h2 class="nav-' + id + '">' + headerText + '</h2>');
      groupPage.append(q.create('<a href="#' + id + '"></a>').append(header));
    }

    groupPage.append(ul);
  };


  var sortList = function() {
    var groups = {};
    q("#list").find(">ul > .qx-accordion-button").forEach(function(li) {
      li = q(li);
      var groupName = li.getData("qxAccordionPage").replace("#list-group-", "");
      var next = li.getNext()[0];
      li.remove();
      next.parentNode.removeChild(next);
      groups[groupName] = [
        li[0],
        next
      ];
    });

    listOrder.forEach(function(groupName) {
      q("#list >ul").append(groups[groupName]);
      delete groups[groupName];
    });

    for (var groupName in groups) {
      q("#list >ul").append(groups[groupName]);
    }
  };

  var isFactory = function(ast, moduleName) {
    var type;
    var returnType = getByType(ast, "return");
    returnType && getByType(returnType, "types").children.forEach(function(item) {
      type = item.attributes.type;
    });
    if (type) {
      var returnModuleName = getModuleNameFromClassName(type);
      var attach = getByType(ast, "attach");
      if (!attach.attributes.targetClass) {
        attach = getByType(ast, "attachStatic");
      }
      return returnModuleName == moduleName && attach.attributes.targetClass == "qxWeb";
    }
    return false;
  };

  var isMethodMissing = function(name, classname) {
    var checkMissing = q.$$qx.core.Environment.get("apiviewer.check.missingmethods");
    if (checkMissing === false) {
      return false;
    }
    name = name.split(".");
    // static methods attached to q
    if (name[0] == "q") {
      var parent = window;
      for (var i=0; i < name.length; i++) {
        if (i == name.length - 1) {
          return q.type.get(parent[name[i]]) !== "Function";
        }
        parent = parent[name[i]];
      }
    }
    // member methods of q
    if (name[0] == "") {
      return q.type.get(q.create("<div>")[name[1]]) !== "Function";
    }
    // additional qooxdoo classes
    if (classname) {
      classname = classname.split(".");
      var parent = q.$$qx;
      for (var i=1; i < classname.length; i++) {
        if (i == classname.length - 1) {
          var missing = q.type.get(parent[classname[i]][name[1]]) !== "Function";
          if (missing && parent[classname[i]].prototype) {
            missing = q.type.get(parent[classname[i]].prototype[name[1]]) !== "Function";
          }
          return missing;
        }
        parent = parent[classname[i]];
      }
    }
    return false;
  };

  var extractPluginApi = function() {
    for (var moduleName in data) {
      var moduleData = data[moduleName];
      if (moduleData.static) {
        var pluginModuleName;
        for (var i=moduleData.static.length - 1; i>=0; i--) {
          var method = moduleData.static[i];
          if (method.attributes.name.indexOf("$") === 0) {
            pluginModuleName = moduleName + "_Plugin_API";
            if (!data[pluginModuleName]) {
              data[pluginModuleName] = {
                member: [],
                static: [],
                group: "Plugin_API"
              };
            }
            method.attributes.group = "Plugin_API";
            data[pluginModuleName].static.push(method);
            moduleData.static.splice(i, 1);
          }
        }
        if (pluginModuleName) {
          data[pluginModuleName].static.sort(sortMethods);
        }
      }
    }
  };

  /**
   * Move methods that return a class instance to the documentation
   * of that class
   */
  var moveMethodsToReturnTypes = function() {
    var removeMethods = [];
    forEachMethodList(function(methods, groupName) {
      methods.forEach(function(method) {
        var returnType = getByType(method, "return");
        if (returnType) {
          var type;
          getByType(returnType, "types").children.forEach(function(item) {
            type = item.attributes.type;
          });
          // if we have a return type
          if (type) {
            var module = getModuleNameFromClassName(type);
            // if we have docs for the return type
            if (data[module] && data[module].type == "class" &&
                type == data[module].ast.attributes.fullName) {

              var attach = getByType(method, "attach");
              var attachStatic = getByType(method, "attachStatic");
              var isAttachStatic = attachStatic.type == "attachStatic";
              var returnTypeMethods = getByType(data[module].ast, "methods");

              // ignore attached methods of returned types
              if (returnTypeMethods.children.indexOf(method) == -1) {
                var prefix;
                if (isAttachStatic) {
                  prefix = attachStatic.attributes.targetClass == "qxWeb" ? "q" : attachStatic.attributes.targetClass;
                  prefix += "." + attachStatic.attributes.targetMethod;
                } else {
                  prefix = attach.attributes.targetClass == "qxWeb" ? "" : attach.attributes.targetClass;
                  prefix += "." + method.attributes.name;
                }
                method.attributes.prefixedMethodName = prefix;

                returnTypeMethods.children.unshift(method);
                removeMethods.push({method: method, parent: methods});
              }
            }
          }
        }
      });
    });

    removeMethods.forEach(function(obj) {
      // remove the methods from the former parents
      obj.parent.splice(obj.parent.indexOf(obj.method), 1);
      // get the name for the old module / class
      var sourceModuleName = getModuleName(obj.method.attributes.sourceClass);
      var sourceModule = data[sourceModuleName];
      // if the old module / class is empty, remove it
      if (sourceModule.static.length == 0 && sourceModule.member.length == 0) {
        delete data[sourceModuleName];
      }
    });
  };

  /**
   * CONTENT
   */
  renderContent = function() {
    var keys = getDataKeys();
    for (var i = 0; i < keys.length; i++) {
      if (data[keys[i]].ast) {
        renderClass(data[keys[i]].ast, data[keys[i]].prefix);
      } else {
        renderModule(keys[i], data[keys[i]]);
      }
    }
  };


  var renderModule = function(name, data, prefix) {
    // render module desc
    var group = data.group;
    if (!group) {
      if (data.static[0]) {
        group = data.static[0].attributes.group;
      }
    }
    if (!group) {
      if (data.member[0]) {
        group = data.member[0].attributes.group;
      }
    }
    if (!group) {
      group = "Extras";
    }
    var groupIcon = icons[group];
    if (groupIcon) {
      groupIcon = "data-icon='" + groupIcon + "'";
    }

    var groupEl = q("#content #group_" + group);
    if (groupEl.length === 0) {
      groupEl = q.create('<div id="group_' + group + '"></div>').appendTo("#content");
    }

    var module = q.create("<div class='module'>").appendTo(groupEl);
    module.append(q.create("<h1 " + groupIcon + "id='" + name + "'>" + name.replace(/_/g, " ") + "</h1>"));

    if (data.superclass) {
      var newName = data.superclass.split(".");
      newName = newName[newName.length -1];
      var ignore = IGNORE_TYPES.indexOf(newName) != -1 ||
                   MDC_LINKS[data.superclass] !== undefined;
      var link = newName;
      if (newName == "qxWeb") {
        link = "Core";
        newName = "q";
        ignore = false;
      }

      var superClass = ignore ? newName :
      "<span> extends <a href='#" + link + "'>" + newName + "</a></span>";
      module.getChildren("h1").append(q.create(superClass));

      if (!ignore) {
        loadClass(data.superclass);
      }
    }

    if (data.fileName) {
      addClassDoc(data.fileName, module);
    } else if (data.desc) {
      module.append(q.create("<div>").setHtml(parse(data.desc)));

    } else if (name == "Core") {
      module.append(q.create("<div>").setHtml(parse(desc)));
    }

    if (data.events) {
      var eventsEl = renderEvents(data.events);
      if (eventsEl) {
        module.append(eventsEl);
      }
    }

    if (data.types) {
      var types = JSON.parse(data.types);
      for (var i=0; i < types.length; i++) {
        if (types[i] == "*") {
          types[i] = "all";
        }
      }
      var typesEl = renderTypes(types);
      module.append(typesEl);
    }

    if (data.templates && data.templates.desc) {
      renderWidgetSettings(data, module, "templates", "#widget.setTemplate");
    }

    if (data.config && data.config.desc) {
      renderWidgetSettings(data, module, "config");
    }

    data["static"].forEach(function(method) {
      module.append(renderMethod(method, prefix));
    });
    data["member"].forEach(function(method) {
      var methodDoc = renderMethod(method, prefix);
      if (isFactory(method, name)) {
        methodDoc.addClass("factory");
        module.append(q.create("<h2>Factory Method</h2>"));
      }
      module.append(methodDoc);
    });
  };


  var renderMethod = function(method, prefix) {
    // skip internal methods
    if (isInternal(method)) {
      return;
    }
    // add the name
    var data = {name: getMethodName(method, prefix)};

    // module
    data.module = getModuleName(method.attributes.sourceClass);

    // add the description
    data.desc = parse(getByType(method, "desc").attributes.text) || "";

    // add link to overridden method
    if (data.desc == "" && method.attributes.docFrom) {
      var moduleName = getModuleNameFromClassName(method.attributes.docFrom);
      var link = q.string.firstLow(moduleName) + "." + method.attributes.name;
      data.desc = "<p>Overrides method <a href='#" + link + "'>" + link + "</a></p>";
    }

    // add the return type
    var returnType = getByType(method, "return");
    if (returnType) {
      data.returns = {desc: parse(getByType(returnType, "desc").attributes.text || "")};
      data.returns.types = [];
      getByType(returnType, "types").children.forEach(function(item) {
        var type = item.attributes.type;
        data.returns.types.push(type);
      });
    }
    data.returns.printTypes = printTypes.bind(null, data);

    // add the parameters
    data.params = [];
    var params = getByType(method, "params");
    for (var j=0; j < params.children.length; j++) {
      var param = params.children[j];
      var paramData = {name: param.attributes.name};
      paramData.desc = parse(getByType(param, "desc").attributes.text || "");
      if (param.attributes.defaultValue) {
        paramData.defaultValue = param.attributes.defaultValue;
      }
      paramData.types = [];
      var types = getByType(param, "types");
      for (var k=0; k < types.children.length; k++) {
        var type = types.children[k];
        var typeString = type.attributes.type;
        if (type.attributes.dimensions > 0) {
          for (var i=0; i < type.attributes.dimensions; i++) {
            typeString += "[]";
          }
        }
        paramData.types.push(typeString);
      }
      paramData.printTypes = printTypes.bind(null, paramData);
      data.params.push(paramData);
    }
    data.printParams = printParams;
    data.paramsExist = data.params.length > 0;

    data.plugin = isPluginMethod(data.name);
    if (data.plugin) {
      data.icon = icons["Plugin_API"];
      data.title = "Plugin API";
    }

    return q.template.get("method", data);
  };


  var addClassDoc = function(name, parent) {
    if (name) {
      name = name.split("#")[0];
    } else {
      parent.append(desc);
      return;
    }

    loading++;
    q.io.xhr("script/" + name + ".json").on("loadend", function(xhr) {
      loading--;
      if (xhr.readyState == 4 && xhr.status >= 200 && xhr.status < 400) {
        var ast = JSON.parse(xhr.responseText);
        // class doc
        var desc = getByType(ast, "desc");
        var classDoc;
        if (desc && desc.attributes && desc.attributes.text) {
          classDoc = q.create(parse(desc.attributes.text));
          classDoc.insertAfter(parent.find("h1"));
        }

        var eventsEl = renderEvents(getEvents(ast));
        if (eventsEl) {
          if (classDoc) {
            eventsEl.insertAfter(classDoc.getLast());
          } else {
            eventsEl.insertAfter(parent.find("h1"));
          }
        }
      } else {
        parent.append(
          q.create("<p style='color: #C00F00'><em>Failed to load module documentation!</em></p>")
        );
      }
      onContentReady();
    }).send();
  };


  var getEvents = function(ast) {
    var events = getByType(ast, "events");
    var data = [];
    events.children.forEach(function(event) {
      var name = event.attributes.name;
      var desc = getByType(event, "desc").attributes.text;
      var type = getByType(event, "types").children[0].attributes.type;
      // ignore undefined as type
      type = type == "undefined" ? "" : addTypeLink(type);
      data.push({name: name, type: type, desc: desc});
    });
    return data;
  };


  var renderEvents = function(events) {
    if (events.length == 0) {
      return null;
    }
    return q.template.get("events", {events: events});
  };


  var renderTypes = function(types) {
    return q.template.get("types", {types: types});
  };


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

  var printTypes = function(data) {
    var params = "";
    var types = data.types || data.returns.types;
    for (var i = 0; i < types.length; i++) {
      params += addTypeLink(types[i]);
      if (i < types.length - 1) {
        params += ", ";
      }
    }
    return params;
  };


  var renderClass = function(ast, prefix, inList) {
    var module = {"member": [], "static": [], "templates": {}, "config": {}};

    getByType(ast, "methods").children.forEach(function(method) {
      // skip internal methods
      if (isInternal(method)) {
        return;
      }
      module.member.push(method);
    });

    // classes are always return types so their static members are
    // not accessible - ignore them

    var name = ast.attributes.name;

    // event normalization types
    var constants = getByType(ast, "constants");
    for (var i=0; i < constants.children.length; i++) {
      var constant = constants.children[i];
      var constName = constant.attributes.name;
      if (constName == "TYPES") {
        module.types = constant.attributes.value;
        continue;
      } else {
        if (constName == "_templates" || constName == "_config") {
          var desc = getByType(constant, "desc");
          module[constName.replace("_", "")].desc = desc.attributes.text;
        }
      }
    }

    module.desc = getByType(ast, "desc").attributes.text || "";
    module.events = getEvents(ast);
    module.classname = ast.attributes.fullName;
    module.superclass= ast.attributes.superClass;
    module.group = ast.attributes.group || "Extras";

    if (inList) {
      renderListModule(name, module, prefix || name + ".");
    } else {
      renderModule(name, module, prefix || name + ".");
    }
  };


  var renderWidgetSettings = function(data, module, type, linkTarget) {
    var upperType = q.string.firstUp(type);
    if (!linkTarget) {
      linkTarget = "#widget.set" + upperType;
    }
    module.append(q.create("<h2>" + upperType + " <a title='More information on " + type + "' class='info' href='" + linkTarget + "'>i</a></h2>"));
    var desc = parse(data[type].desc);
    module.append(q.create("<div>").setHtml(desc).addClass("widget-settings"));
  };


  /**
   * PARSER
   */
  var parse = function(text) {
    if (!text) {
      return;
    }

    // @links: methods
    text = text.replace(/\{@link .*?#(.*?)\}/g, "<code><a href='#.$1'>.$1()</a></code>");
    // @links: core
    text = text.replace(/\{@link q\}/g, "<a href='#Core'>Core</a>");
    // @links: modules
    var links;
    var regexp = /\{@link (.*?)\}/g;
    while ((links = regexp.exec(text)) != null) {
      var name = getModuleName(links[1]);
      text = text.replace(links[0], "<a href='#" + name + "'>" + name + "</a>");
    }

    // escape all html tags in pre tags
    var blocks = text.split(/<pre.*?>/g);
    blocks.forEach(function(block, i) {
      var innerBlock = block.split("</pre>");
      if (innerBlock.length <= 1) {
        return;
      }
      innerBlock[0] = q.string.escapeHtml(innerBlock[0]);
      blocks[i] = innerBlock.join("</code></pre>");
    });
    text = blocks.join("<pre><code>");

    // replace experimental text
    text = text.replace(/\b(experimental)\b/gi, function(exp) {
      return "<span class='warning'>" + exp + "</span>";
    });

    return text;
  };


  /**
   * FINALIZE
   */
  var loading = 0;
  // no highlighting for IE < 9
  var useHighlighter = !(q.env.get("engine.name") == "mshtml" && q.env.get("browser.documentmode") < 9);

  var onContentReady = function() {
    if (loading > 0) {
      return;
    }

    var listRendered = q("#list").find("> ul > li").length > 0;
    if (!listRendered) {
      extractPluginApi();
      moveMethodsToReturnTypes();
      renderList();
      sortList();
      renderContent();
      loadSamples();
      var acc = q("#list").accordion();

      // wait for the accordion pages to be measured
      var buttonTops;
      var listOffset = q("#list").getPosition().top;
      setTimeout(function() {
        acc.fadeIn(200);
        buttonTops = [];
        acc.find(".qx-accordion-button").forEach(function(button, index) {
          buttonTops[index] = (q(button).getPosition().top);
        });
      }, 200);


      acc.on("changeSelected", function(index) {
        var buttonTop = buttonTops[index] - listOffset;
        var scrollTop = q("#navContainer").getProperty("scrollTop");
        q("#navContainer").animate({
          duration: 500,
          keep: 100,
          timing: "linear",
          keyFrames: {
            0: {scrollTop: scrollTop},
            100: {scrollTop: buttonTop}
          }
        });
      });
    } else {
      // enable syntax highlighting
      if (useHighlighter) {
        q('pre').forEach(function(el) {hljs.highlightBlock(el);});
      }

      fixInternalLinks();
      setTimeout(onFilterInput, 200);
      window.onhashchange = highlightNavItem;
    }
  };

  var fixLinks = true;
  // replace links to qx classes with internal targets, e.g.
  // #qx.bom.rest.Resource -> #Resource
  var fixInternalLinks = q.func.debounce(function() {
    q("a").forEach(function(lnk) {
      var href = lnk.getAttribute("href");
      if (href.indexOf("#qx") === 0) {
        // target is a qx class
        var target = href.substr(1);
        var tmp = href.split(".");
        href = "#" + tmp[tmp.length - 1];
        lnk.setAttribute("href", href);
        lnk.innerHTML = lnk.innerHTML.replace(target, href.substr(1));
      } else if (href.indexOf("#") === 0) {
        // relative method link (within module namespace)
        var selector = href.replace(/\./g, "\\.").replace(/\$/g, "\\$");
        if (q(selector).length === 0) {
          lnk = q(lnk);
          var redir;
          var parentModule = lnk.getAncestors(".module");
          parentModule.find(".method").forEach(function(meth) {
            var methodName = meth.id.split(".");
            methodName = methodName[methodName.length - 1];
            if (methodName == href.substring(2)) {
              redir = meth.id;
            }
          });

          if (redir) {
            lnk.setAttribute("href", "#" + redir);
          } else {
            // no redirect found
            lnk.setAttribute("href", "");
          }
        }
      }
    });
  }, 200);

  var highlightNavItem = function() {
    var hash = window.location.hash,
        navItems = q("."+convertNameToCssClass(hash, "nav-"));
    q("#list .qx-accordion-page ul > li").removeClass("selected");
    navItems.addClass("selected");
  };


  var loadSamples = function() {
    q.io.script("script/samples.js").send();
  };


  /**
   * HELPERS
   */
   var getDataKeys = function() {
     var keys = [];
     for (var key in data) {
       keys.push(key);
     }
     keys.sort(function(a, b) {
       if (a == "Core") {
         return -1;
       }
       if (b == "Core") {
         return 1;
       }
       return a < b ? -1 : +1;
     });
     return keys;
   };


  var getByType = function(ast, type) {
    if (ast.children) {
      for (var i=0; i < ast.children.length; i++) {
        var item = ast.children[i];
        if (item.type == type) {
          return item;
        }
      }
    }
    return {attributes: {}, children: []};
  };


  var getModuleName = function(attach) {
   if (!attach) {
     return "Core";
   }

   replacements.forEach(function(map) {
    attach = attach.replace(map.regExp, map.replacement);
   });
   return attach;
  };

  var getModuleNameFromClassName = function(name) {
    name = name.split(".");
    return name[name.length -1];
  };

  var isInternal = function(item) {
    return item.attributes.isInternal ||
      item.attributes.access == "private" ||
      item.attributes.access == "protected";
  };


  var isPluginMethod = function(name) {
    return name.indexOf(".$") != -1;
  };


  var getMethodName = function(item, prefix) {
    if (item.attributes.prefixedMethodName) {
      return item.attributes.prefixedMethodName;
    }

    var attachData = getByType(item, "attachStatic");
    if (prefix) {
      if (item.attributes.prefix) {
        prefix = item.attributes.prefix;
      }
      if (!item.attributes.isStatic) {
        prefix = prefix.toLowerCase();
      }
      return prefix + item.attributes.name;
    } else if (item.attributes.name == "ctor") {
      return "q";
    } else if (item.attributes.isStatic) {
      return "q." + (attachData.attributes.targetMethod || item.attributes.name);
    } else {
      return "." + item.attributes.name;
    }
  };


  var addTypeLink = function(type) {
    // special case for pseudo typed arrays
    if (type.indexOf("[]") != -1) {
      return "<a target='_blank' href='" + MDC_LINKS["Array"] + "'>" + type + "</a>";
    }
    if (type == "qxWeb") {
      return "<a href='#Core'>q</a>";
    } else if (MDC_LINKS[type]) {
      return "<a target='_blank' href='" + MDC_LINKS[type] + "'>" + type + "</a>";
    } else if (IGNORE_TYPES.indexOf(type) == -1) {
      var name = type.split(".");
      name = name[name.length -1];
      if (IGNORE_TYPES.indexOf(name) == -1) {
        return "<a href='#" + name + "'>" + name + "</a>";
      }
    }
    return type;
  };

  var IGNORE_TYPES = ["qxWeb", "var", "null", "Emitter", "Class"];

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
    "Map" : "https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object",
    "RegExp" : "https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/RegExp",
    "Error" : "https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Error",
    "Number" : "https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Number",
    "Integer" : "https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Number",
    "Boolean" : "https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Boolean",
    "String" : "https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/String",
    "undefined" : "https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/undefined",
    "arguments" : "https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/arguments",
    "Font" : "https://developer.mozilla.org/en/CSS/font",
    "Color" : "https://developer.mozilla.org/en/CSS/color"
  };

  // mobile support
  if (q.env.get("device.type") != "desktop") {
    q("#list").setStyles({position: "absolute", bottom: "auto", marginTop: "10px"});
    q(".filter").setStyle("position", "static");
    q("#navContainer").addClass("mobile-navContainer");
  }

  var outdentWhitespace = function (snippet) {
    var firstNonWhitespacePos = snippet.search(/\S/);
    if (firstNonWhitespacePos !== -1) {
      var outdentRegex = new RegExp("^ {"+(firstNonWhitespacePos-1)+"}", "mg");
      return snippet.replace(outdentRegex, "");
    }
    return snippet;
  };

  var formatJavascript = function(snippet) {
    snippet = snippet.toString().replace(/^function.*?\{/, "");
    snippet = snippet.substr(0, snippet.length - 1);
    snippet = outdentWhitespace(snippet);
    snippet = snippet.replace(/\n/, "").replace(/[\s]+$/, "");
    return snippet;
  };

  var appendSample = function(sample, header) {
    if (!header[0]) {
      console && console.warn("Sample could not be attached for '", method, "'.");
      return;
    }

    // container element
    var sampleEl = q.create("<div class='sample'></div>");
    var pre,
        htmlEl,
        cssEl,
        jsEl;

    var precedingSamples = header.getSiblings(".sample");
    if (precedingSamples.length > 0) {
      sampleEl.insertAfter(precedingSamples.eq(precedingSamples.length - 1));
    }
    else {
      sampleEl.insertAfter(header);
    }

    var codeContainer = q.create("<div class='samplecode'></div>").appendTo(sampleEl);

    var stringifyArraySnippet = function (snippet) {
        // allow multiline array code snippets like:
        // ["<ul>",
        //  "  <li>item 1</li>",
        //  "  <li>item 2</li>",
        //  "</ul>"],

        var isArray = q.$$qx.Bootstrap.isArray;
        if (isArray && isArray(snippet)) {
            return snippet.join('\n');
        }
        return snippet;
    };

    // HTML
    if (sample.html) {
      sample.html = stringifyArraySnippet(sample.html);
      pre = q.create("<pre class='html'></pre>");
      q.create("<code>").appendTo(pre)[0].appendChild(document.createTextNode(sample.html));
      htmlEl = pre[0];
      codeContainer.append(htmlEl);
    }

    // CSS
    if (sample.css) {
      sample.css = stringifyArraySnippet(sample.css);
      pre = q.create("<pre class='css'></pre>");
      q.create("<code>").appendTo(pre)[0].appendChild(document.createTextNode(sample.css));
      cssEl = pre[0];
      codeContainer.append(cssEl);
    }

    // JavaScript
    if (sample.javascript) {
      pre = q.create("<pre class='javascript'></pre>");
      sample.javascript = formatJavascript(sample.javascript);
      q.create("<code>").appendTo(pre)[0].appendChild(document.createTextNode(sample.javascript));
      jsEl = pre[0];
      codeContainer.append(jsEl);
    }

    if (useHighlighter) {
      htmlEl && hljs.highlightBlock(htmlEl);
      cssEl && hljs.highlightBlock(cssEl);
      jsEl && hljs.highlightBlock(jsEl);
    }

    addMethodLinks(jsEl, header.getParents().getAttribute("id"));

    if (sample.executable && q.env.get("engine.name") != "mshtml" && q.env.get("device.type") == "desktop") {
      createFiddleButton(sample).appendTo(sampleEl);
    }
  };

  /**
   * wrap method names in the JS sample code with links to the method's documentation
   * @param jsEl {Element} DOM element containing the code
   * @param parentMethod {String} Name of the method the sample is attached to.
   * No links will be added to this method
   */
  var addMethodLinks = function(jsEl, parentMethod) {
    var methodNames = jsEl.innerHTML.replace(/\n/g, "").match(/(q?\.[a-z]+)/gi);
    if (methodNames) {
      q.array.unique(methodNames).forEach(function(methodName) {
        if (methodName !== parentMethod) {
          var method = q("#" + methodName.replace(/\./g, "\\.").replace(/\$/g, "\\$"));
          if (method.length > 0) {
            var codeEl = q(jsEl).find("code")[0];
            var escapedMethod = methodName.replace(".", "\\.");
            codeEl.innerHTML = codeEl.innerHTML.replace(new RegExp(escapedMethod + '\\b'),
              '<a href="#' + methodName + '">' + methodName + '</a>');
          }
        }
      });
    }
  };

  var qVersion = q.env.get("qx.version");
  var qUrl = "http://demo.qooxdoo.org/" + qVersion + "/framework/q-" +
    qVersion + ".min.js";
  var indigoUrl = "http://demo.qooxdoo.org/" + qVersion + "/framework/indigo-" +
      qVersion + ".css";
  var qScript = '<script type="text/javascript" src="' + qUrl + '"></script>';
  var indigoLink = '<link rel="stylesheet" type="text/css" href="' + indigoUrl + '"/>';

  var createFiddleButton = function(sample) {
    return q.create("<button class='fiddlebutton'>Edit/run on jsFiddle</button>").on("click", function() {
      var iframeBody = q(q("#fiddleframe")[0].contentWindow.document.body);

      if (sample.javascript) {
        iframeBody.find("#js").setAttribute("value", sample.javascript);
      }

      if (sample.css) {
        iframeBody.find("#css").setAttribute("value", sample.css);
      }

      if (sample.html) {
        iframeBody.find("#html").setAttribute("value", sample.html);
        iframeBody.find("#html").setAttribute("value", qScript + '\n' + indigoLink + '\n' + sample.html);
      }
      else {
        iframeBody.find("#html").setAttribute("value", qScript);
      }

      iframeBody.find("form")[0].submit();
    });
  };

  var scrollContentIntoView = q.func.debounce(function() {
    var el = q(location.hash.replace(".", "\\.").replace("$", "\\$"));
    if (el.length > 0) {
      el[0].scrollIntoView();

      var listSelector = el[0].id ? ".nav-" + el[0].id.replace(".", "").replace("$", "") : null;
      if (listSelector) {
        var page = q(listSelector).getAncestors(".qx-accordion-page");
        var index = q("#list .qx-accordion-page").indexOf(page);
        q("#list").select(index);
      }
    }

    highlightNavItem();

  }, 300);


  var isElementInViewport = function(el, diffBoundingRectContainer) {
    var rect = el.getOffset(),
        diffRect = diffBoundingRectContainer.getOffset(),
        viewportHeight = window.innerHeight || document.documentElement.clientHeight,
        viewportWidth = window.innerWidth || document.documentElement.clientWidth;

    return (rect.top - diffRect.top >= 0 &&
            rect.left - diffRect.left >= 0 &&
            rect.bottom < diffRect.bottom && rect.bottom <= viewportHeight &&
            rect.right < diffRect.right && rect.right <= viewportWidth);
  };

  var convertNameToCssClass = function(name, prefix) {
    return (prefix || "")+name.replace(/(\.|\$|#)*/g, "");
  };


  var forEachMethodList = function(callback) {
    for (var moduleName in data) {
      var moduleData = data[moduleName];
      if (moduleData.member) {
        callback(moduleData.member, moduleData.group);
      }
      if (moduleData.static) {
        callback(moduleData.static, moduleData.group);
      }
      if (moduleData.ast && moduleData.ast.children) {
        for (var i=0, l=moduleData.ast.children.length; i<l; i++) {
          var childNode = moduleData.ast.children[i];
          if (childNode.type &&
              childNode.type.indexOf("methods") === 0 &&
              childNode.children)
          {
            callback(childNode.children, moduleData.ast.attributes.group);
          }
        }
      }
    }
  };


  var appendWidgetMarkup = function(methodName, sample) {
    if (!sample.showMarkup) {
      return;
    }
    var moduleName = q.string.firstUp(methodName.substr(1));
    var markupHeader = q("#" + moduleName).getParents().find(".widget-markup");
    var pen = q("#playpen");
    if (sample.html) {
      pen.setHtml(sample.html.join("\n"));
    }
    sample.javascript();
    var html = pen.getHtml();
    var textNode = document.createTextNode(html);
    var codeEl = q.create('<code>');
    codeEl[0].appendChild(textNode);

    var accordion = q.template.get("widget-dom", {
      title: "Expand",
      pageId: "widget-dom-" + methodName.replace(".", "")
    })
    .insertAfter(markupHeader);
    //markupHeader.remove();
    var pre = accordion.find("pre").append(codeEl);
    accordion.accordion();

    if (useHighlighter) {
      hljs.highlightBlock(pre[0]);
    }

    pen.find(".qx-widget").dispose();
    pen.setHtml("");
  };


  /**
   * Adds sample code to a method's documentation. Code can be supplied wrapped in
   * a function or as a map with one or more of the keys js, css and html.
   * Additionally, a key named executable is supported: If the value is true, a
   * button will be created that posts the sample's code to jsFiddle for live
   * editing.
   *
   * @param methodName {String} Name of the method, e.g. ".before" or "q.create"
   * @param sample {Function|Map} Sample code.
   */
  window.addSample = function(methodName, sample) {
    // Find the doc element for the method
    var method = q("#" + methodName.replace(/\./g, "\\.").replace(/\$/g, "\\$"));
    if (method.length === 0) {
      console && console.warn("Unable to add sample: No doc element found for method", methodName);
      return;
    }

    var sampleMap;
    if (typeof sample == "object" && sample.javascript) {
      sampleMap = sample;
    }
    else if (typeof sample === "function") {
      sampleMap = {
        javascript: sample
      };
    }

    if (!sampleMap.javascript) {
      return;
    }

    // Find existing "Examples" heading
    var headerElement = null;
    var subHeaders = method.getChildren("h4");
    for (var i=0, l=subHeaders.length; i<l; i++) {
      var header = subHeaders.eq(i);
      if (header.getHtml() == "Examples") {
        headerElement = header;
        break;
      }
    }
    // No heading found, create one
    if (!headerElement) {
      headerElement = q.create("<h4>Examples</h4>");
      method.append(headerElement);
    }

    appendWidgetMarkup(methodName, sampleMap);
    appendSample(sampleMap, headerElement);
    scrollContentIntoView();
  };
});
