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

  var legacyIe = (q.env.get("engine.name") === "mshtml" &&
    q.env.get("engine.version") < 11);

  // remove the warning
  q("#warning").setStyle("display", "none");

  if (legacyIe) {
    var loading = q.create("<div class='loading'>loading...</div>").appendTo(document.body);
    var width = Math.round(q(document).getWidth() / 2);
    var height = Math.round(q(document).getHeight() / 2);
    var left = width - (Math.round(loading.getWidth() / 2));
    var top = height - (Math.round(loading.getHeight() / 2));
    var zIndex = 10000;
    loading.setStyles({
      top: top + "px",
      left: left + "px",
      zIndex: zIndex + 10
    });
    q(document).block("black", 0.8, zIndex);
  }

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
  q("h1#headline").setHtml(title);
  document.title = docTitle;

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

  var searchPopupShown = false;
  var onFilterInput = function() {
    var value = filterField.getValue();

    if (!value) {
      clearInterval(debouncedHideFiltered.intervalId);
      delete debouncedHideFiltered.intervalId;
      q("#list .qx-tabs-button")._forEachElementWrapped(function(button) {
        button.setData("results", "");
        if (q.env.get("engine.name") == "mshtml") {
          // IE won't re-apply the element's styles (which use the data
          // attribute) if element.dataset is used
          button.setAttribute("data-results", "");
        }
      });
      q("#list .qx-tabs-page ul").show();
      q("#list .qx-tabs-page li").show();
      q("#list .qx-tabs-page > a").show();
      q("#list .qx-tabs-button").removeClass("no-matches").setAttribute("disabled", false); // allow click on every group button
      q("#list").render();
      return;
    }

    debouncedHideFiltered(value);
  };

  if (q.env.get("os.name") == "osx") {
    q("#searchcmd").setHtml("cmd");
  }

  var showSearchPopup = function () {
    q("#searchpopup")
      .placeTo(q(".filter")[0], "right-top", {left: 2, top: -5})
      .show();
  };

  var hideSearchPopup = function () {
    q("#searchpopup").hide();
  };

  var toggleSearchPopup = function() {
    if (!q.localStorage.getItem("qx-got-search")) {
      var results = q('#list').getAttribute('data-results') || 0;
      if (parseInt(results) > 0) {
        hideSearchPopup();
      } else {
        showSearchPopup();
      }
    }
  };

  q("#gotsearch").on("tap", function() {
    q.localStorage.setItem("qx-got-search", true);
  });

  var filterField = q(".filter input");
  filterField.on("input", onFilterInput)
    .on("focus", toggleSearchPopup)
    .on("blur", function() {
      window.setTimeout(function() {
        hideSearchPopup();
      }, 200);
    });

  var debouncedHideFiltered = q.func.debounce(function(value) {
    hideFiltered(value);
  }, 500);

  var hideFiltered = function(query) {
    q("#list .qx-tabs-page > a").hide(); // module headers
    q("#list .qx-tabs-page ul").hide(); // method lists
    q("#list .qx-tabs-page li").hide(); // method items
    q("#list .qx-tabs-button").removeClass("no-matches").setAttribute("disabled", false); // allow click on every group button
    var regEx = new RegExp(query, "i");

    var totalResults = 0;

    q("#list .qx-tabs-button").forEach(function(groupButton) {
      var groupResults = 0;
      groupButton = q(groupButton);
      var groupPage = groupButton.getNext();

      // use the method names together with the navigation headers as source for filtering
      // e.g. if the developer filters for "css" all methods for the module are listed
      var searchItems = groupPage.find('> a').concat(groupPage.find('> ul > li'));
      searchItems.forEach(function(item) {

        var isHeader = q.getNodeName(item) === 'a';
        item = q(item);

        var itemName = isHeader ? item.getChildren('h2').getHtml() : item.getChildren("a").getHtml();
        if (regEx.exec(itemName)) {

          if (isHeader) {
            // the count of the methods is the group result
            groupResults += item.getNext().getChildren().length;

            item.show(); // header
            item.getNext().show(); // method list container
            item.getNext().getChildren().show(); // methods

          } else {

            // only count the methods if they are not already shown
            // this might happen if the module header is part of the filter result
            // otherwise the count of the result is doubled
            if (item.getStyle('display') === 'none') {

              groupResults++;

              item.show(); // method item
              item.getParents().show(); // method lists
              item.getParents().getPrev().show(); // module headers
            }
          }
        }
      });
      totalResults += groupResults;
      groupButton.setData("results", groupResults);
      if (q.env.get("engine.name") == "mshtml") {
        // IE won't re-apply the element's styles (which use the data
        // attribute) if element.dataset is used
        groupButton.setAttribute("data-results", groupResults);
      }
      if (groupResults == 0) {
        groupButton.addClass("no-matches").setAttribute("disabled", true);
      }
    });

    q("#list").setAttribute('data-results', totalResults);
    q("#list").render();
    toggleSearchPopup();
  };


  q("html").on("tap", function(ev) {
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


  /**
   * LIST
   * @lint ignoreUndefined(q)
   */
  var renderList = function(data) {
    var keys = data.getKeys();
    for (var i = 0; i < keys.length; i++) {
      var moduleName = keys[i];
      var module = data.getModule(moduleName);
      renderListModule(moduleName, module);
    }
  };


  var renderListModule = function(id, data) {
    var name = id.replace(/_/g, " ");
    var checkMissing = q.$$qx.core.Environment.get("apiviewer.check.missingmethods");

    var factoryName;
    var ul = q.create("<ul></ul>");
    data["static"].forEach(function(methodAst) {
      var methodName = Data.getMethodName(methodAst, data.prefix);
      var missing = false;
      if (checkMissing !== false) {
        missing = isMethodMissing(methodName, data.classname);
      }

      var deprecated = data.deprecated;
      if (deprecated !== true) {
        var deprecatedStatus = Data.getByType(methodAst, "deprecated");
        if (deprecatedStatus.children.length > 0) {
          deprecated = true;
        }
      }

      q.template.get("list-item", {
        name: methodName + "()",
        classname: convertNameToCssClass(methodName, "nav-"),
        missing: missing,
        link: methodName,
        plugin: methodAst.attributes.plugin,
        deprecated: deprecated
      }).appendTo(ul);
    });

    data["member"].forEach(function(methodAst) {
      var methodName = Data.getMethodName(methodAst, data.prefix);
      var methodIsFactory = Data.isFactory(methodAst, name);
      factoryName = methodIsFactory ? methodName + "()": factoryName;
      if (methodIsFactory) {
        return;
      }
      var missing = isMethodMissing(methodName, data.classname);

      var deprecated = data.deprecated;
      if (deprecated !== true) {
        var deprecatedStatus = Data.getByType(methodAst, "deprecated");
        if (deprecatedStatus.children.length > 0) {
          deprecated = true;
        }
      }

      q.template.get("list-item", {
        name: methodName + "()",
        classname: convertNameToCssClass(methodName, "nav-"),
        missing: missing,
        link: methodName,
        plugin: methodAst.attributes.plugin,
        deprecated: deprecated
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
      var button = q.create("<li " + groupIcon + " data-qx-tabs-page='#" + groupId + "' class='qx-tabs-button'>" + group.replace("_", " ") + "</li>")
        .appendTo("#list > ul");
      groupPage = q.create("<li class='qx-tabs-page' id='" + groupId + "'></li>").appendTo("#list > ul");
    }

    if (name !== "Core") {
      var headerText = factoryName || name;
      var deprecatedClass = data.deprecated ? ' class-deprecated' : '';
      var header = q.create('<h2 class="nav-' + id + deprecatedClass + '">' + headerText + '</h2>');
      groupPage.append(q.create('<a href="#' + id + '"></a>').append(header));
      qxWeb.messaging.emit('apiviewer', 'moduleRendered', null, {id : id, data : data, header : header});
    }

    groupPage.append(ul);
  };


  var sortList = function() {
    var groups = {};
    q("#list").find(">ul > .qx-tabs-button").forEach(function(li) {
      li = q(li);
      var groupName = li.getData("qxTabsPage").replace("#list-group-", "");
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


  /**
   * CONTENT
   */
  renderContent = function(data) {
    var keys = data.getKeys();
    for (var i = 0; i < keys.length; i++) {
      var moduleName = keys[i];
      var module = data.getModule(moduleName);
      renderModule(keys[i], module);
    }
  };


  var renderModule = function(name, data) {
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

    var deprecatedClass = data.deprecated ? 'class-deprecated' : '';
    var module = q.create("<div class='module'>").appendTo(groupEl);
    module.append(q.create("<h1 " + groupIcon + "id='" + name + "' class='" + deprecatedClass + "'>" + name.replace(/_/g, " ") + "</h1>"));

    if (data.superClass) {
      var newName = data.superClass.split(".");
      newName = newName[newName.length -1];
      var ignore = Data.IGNORE_TYPES.indexOf(newName) != -1 ||
                   Data.MDC_LINKS[data.superClass] !== undefined;
      var link = newName;
      if (newName == "qxWeb") {
        link = "Core";
        newName = "q";
        ignore = false;
      }

      var superClass = ignore ? newName :
      "<span> extends <a href='#" + link + "'>" + newName + "</a></span>";
      module.getChildren("h1").append(q.create(superClass));
    }

    if (data.desc) {
      module.append(q.create("<div>").setHtml(parse(data.desc)));
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
      var idPrefix = name.toLowerCase() + '-';
      var typesEl = renderTypes(idPrefix, types);
      module.append(typesEl);
    }

    if (data.templates) {
      renderWidgetSettings(data, module, "templates", "#widget.setTemplate");
    }

    if (data.config) {
      renderWidgetSettings(data, module, "config");
    }

    data["static"].forEach(function(method) {
      method.deprecated = data.deprecated;
      method.deprecatedMessage = data.deprecatedMessage;
      module.append(renderMethod(method, data.prefix));
    });
    data["member"].forEach(function(method) {
      method.deprecated = data.deprecated;
      method.deprecatedMessage = data.deprecatedMessage;
      var methodDoc = renderMethod(method, data.prefix);
      if (Data.isFactory(method, name)) {
        methodDoc.addClass("factory");
        module.append(q.create("<h2>Factory Method</h2>"));
      }
      module.append(methodDoc);
    });
  };

  var getItemParent = function(itemName) {
    var parent = null;
    var ns = itemName.split(".");
    if (ns.length > 1) {
      ns.pop();
      parent = ns.join(".");
    }
    return parent;
  };


  var renderMethod = function(method, prefix) {
    // add the name
    var data = {name: Data.getMethodName(method, prefix)};

    // module
    data.module = Data.getModuleName(method.attributes.sourceClass);

    // add the description
    var parent = getItemParent(data.name);
    data.desc = parse(Data.getByType(method, "desc").attributes.text || "", parent);

    // add link to overridden method
    if (data.desc == "" && method.attributes.docFrom) {
      var moduleName = Data.getModuleNameFromClassName(method.attributes.docFrom);
      var link = q.string.firstLow(moduleName) + "." + method.attributes.name;
      data.desc = "<p>Overrides method <a href='#" + link + "'>" + link + "</a></p>";
    }

    // add the return type
    var returnType = Data.getByType(method, "return");
    if (returnType) {
      data.returns = {desc: parse(Data.getByType(returnType, "desc").attributes.text || "", parent)};
      data.returns.types = [];
      Data.getByType(returnType, "types").children.forEach(function(item) {
        var type = item.attributes.type;
        data.returns.types.push(type);
      });
    }
    data.returns.printTypes = printTypes.bind(null, data);

    // add the parameters
    data.params = [];
    var params = Data.getByType(method, "params");
    for (var j=0; j < params.children.length; j++) {
      var param = params.children[j];
      var paramData = {
        name: param.attributes.name,
        optional: param.attributes.optional
      };
      paramData.desc = parse(Data.getByType(param, "desc").attributes.text || "", parent);
      if (param.attributes.defaultValue) {
        paramData.defaultValue = param.attributes.defaultValue;
      }
      paramData.types = [];
      var types = Data.getByType(param, "types");
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

    data.plugin = method.attributes.plugin;
    if (data.plugin) {
      data.icon = icons["Plugin_API"];
      data.title = "Plugin API";
    }

    // add deprecated status
    data.deprecated = method.deprecated;
    data.deprecatedMessage = method.deprecatedMessage;

    if (data.deprecated !== true) {
      var deprecatedStatus = Data.getByType(method, "deprecated");
      if (deprecatedStatus.children.length > 0) {
        var deprecatedDescription = Data.getByType(deprecatedStatus, "desc");
        var deprecatedMessage = deprecatedDescription.attributes.text;
        data.deprecated = true;
        data.deprecatedMessage = deprecatedMessage.length > 0 ? deprecatedMessage : '<p>Deprecated</p>';
      }
    }

    return q.template.get("method", data);
  };


  var renderEvents = function(events) {
    if (events.length == 0) {
      return null;
    }
    events.forEach(function(ev) {
      if (ev.type) {
        ev.type = addTypeLink(ev.type);
      }
    });
    return q.template.get("events", {events: events});
  };


  var renderTypes = function(idPrefix, types) {
    return q.template.get("types", {
        idPrefix: idPrefix,
        types: types
    });
  };


  var printParams = function() {
    var params = "";
    for (var i = 0; i < this.params.length; i++) {
      params += this.params[i].name;
      if (this.params[i].optional) {
        params += "?";
      }
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


  var renderWidgetSettings = function(data, module, type, linkTarget) {
    var upperType = q.string.firstUp(type);
    if (!linkTarget) {
      linkTarget = "#widget.set" + upperType;
    }
    module.append(q.create("<h2>" + upperType + " <a title='More information on " + type + "' class='info' href='" + linkTarget + "'>i</a></h2>"));
    var parent = data.fileName.split(".");
    parent = parent.pop().toLowerCase();
    var desc = parse(data[type], parent);
    module.append(q.create("<div>").setHtml(desc).addClass("widget-settings"));
  };


  /**
   * PARSER
   */
  var parse = function(text, parent) {
    if (!text) {
      return;
    }

    if (!parent) {
      parent = "";
    }

    // @links: internal (within module)
    text = text.replace(/\{@link\s+#(.*?)\}/g, "<code><a href='#" + parent + ".$1'>" + parent + ".$1()</a></code>");

    // @links: methods
    text = text.replace(/\{@link .*?#(.*?)\}/g, "<code><a href='#.$1'>.$1()</a></code>");
    // @links: core
    text = text.replace(/\{@link q\}/g, "<a href='#Core'>Core</a>");
    // @links: modules
    var links;
    var regexp = /\{@link (.*?)\}/g;
    while ((links = regexp.exec(text)) != null) {
      var name = Data.getModuleName(links[1]);
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
  // no highlighting for IE < 9
  var useHighlighter = !(q.env.get("engine.name") == "mshtml" && q.env.get("browser.documentmode") < 9);

  // setup variables to use them within the callbacks
  var acc = null;
  var buttonTops = null;
  var requestAnimationFrame = qxWeb.$$qx.bom.AnimationFrame.request;

  var onContentReady = function() {
    renderList(this);
    sortList();

    acc = q("#list").tabs(null, null, "vertical").render();

    // decouple the creation of the content by using the next possible AnimationFrame
    requestAnimationFrame(delayedRenderContent, this);

    // wait for the tab pages to be measured
    var listOffset = q("#list").getPosition().top;

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

    if (q(".filter input").getValue()) {
      setTimeout(onFilterInput, 200);
    }
    window.onhashchange = highlightNavItem;

    if (legacyIe) {
      setTimeout(function() {
        q(".loading").remove();
        q(document).unblock();
      }, 1000);
    }
  };

  var highlightNavItem = function() {
    var hash = window.location.hash,
        navItems = q("."+convertNameToCssClass(hash, "nav-"));
    q("#list .qx-tabs-page ul > li").removeClass("selected");
    navItems.addClass("selected");
  };

  var delayedRenderContent = function() {
    renderContent(this);

    requestAnimationFrame(delayedAccordionFadeIn, this);
  };

  var delayedAccordionFadeIn = function() {
    acc.fadeIn(200);
    buttonTops = [];
    acc.find(".qx-tabs-button").forEach(function(button, index) {
      buttonTops[index] = (q(button).getPosition().top);
    });

    requestAnimationFrame(delayedLoadSamples, this);
  };

  var delayedLoadSamples = function() {
    loadSamples();

    // enable syntax highlighting
    if (useHighlighter) {
      window.setTimeout(highLightCodeBlocks, 2000);
    }
  };


  var codeBlocks = null;
  var highLightCodeBlocks = function() {
    codeBlocks = q('pre');

    var content = q('div#content');
    content.on('scroll', qxWeb.func.debounce(highLightOnScroll.bind(content), 500));

    // highlight the current viewport at startup once
    highLightOnScroll.call(content);
  };

  var highLightOnScroll = function() {

    var height = parseInt(this.getHeight(), 10);

    var toRemove = [];
    codeBlocks.every(function(item, index) {

      var boundingRect = item.getBoundingClientRect();

      // code element is above us -> skip it
      if (parseInt(boundingRect.top, 10) < 0) {
        return true;
      }

      // candidate for highlighting
      if ((parseInt(boundingRect.top, 10) >= 0 && parseInt(boundingRect.top, 10) < height) ||
          (parseInt(boundingRect.bottom, 10) >= 0 && parseInt(boundingRect.bottom, 10) < height)) {

        hljs.highlightBlock(item);

        toRemove.push(index);
        return true;
      }

      // fast check if the code element is out of viewport (further down)
      // -> we can stop here
      if (parseInt(boundingRect.top, 10) > height) {
        return false;
      }

    });

    toRemove.reverse().forEach(function(item) {
      codeBlocks.splice(item, 1);
    });
  };

  var loadSamples = function() {
    q.io.script("script/samples.js").send();
  };


  var addTypeLink = function(type) {
    // special case for pseudo typed arrays
    if (type.indexOf("[]") != -1) {
      return "<a target='_blank' href='" + Data.MDC_LINKS["Array"] + "'>" + type + "</a>";
    }
    if (type == "qxWeb") {
      return "<a href='#Core'>q</a>";
    } else if (Data.MDC_LINKS[type]) {
      return "<a target='_blank' href='" + Data.MDC_LINKS[type] + "'>" + type + "</a>";
    } else if (Data.IGNORE_TYPES.indexOf(type) == -1) {
      var name = type.split(".");
      name = name[name.length -1];
      if (Data.IGNORE_TYPES.indexOf(name) == -1) {
        return "<a href='#" + name + "'>" + name + "</a>";
      }
    }
    return type;
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

    addMethodLinks(jsEl, header.getParents().getAttribute("id"));

    if (!legacyIe && sample.executable) {
      createCodepenButton(sample).appendTo(sampleEl);
    }

    // Add the created DOM elements at the end to minimize DOM access
    var precedingSamples = header.getSiblings(".sample");
    if (precedingSamples.length > 0) {
      sampleEl.insertAfter(precedingSamples.eq(precedingSamples.length - 1));
    }
    else {
      sampleEl.insertAfter(header);
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

  var createCodepenButton = function (sample) {
    var data = {
      js_external: qUrl,
      css_external: indigoUrl
    };

    if (sample.javascript) {
      data.js = sample.javascript;
    }

    if (sample.css) {
      data.css = sample.css;
    }

    if (sample.html) {
      data.html = sample.html;
    }

    var hiddenField = q.create('<input type="hidden" name="data" value="" />');
    hiddenField.setValue(JSON.stringify(data));

    var form = q.create('<form action="http://codepen.io/pen/define" method="POST" target="_blank">' +
      '<input class="button-codepen" type="submit" value="Edit/run on CodePen">' +
      '</form>'
    );

    return form.append(hiddenField);
  };

  var scrollContentIntoView = q.func.debounce(function() {
    var el = q(location.hash.replace(".", "\\.").replace("$", "\\$"));
    if (el.length > 0) {
      el[0].scrollIntoView();

      var listSelector = el[0].id ? ".nav-" + el[0].id.replace(".", "").replace("$", "") : null;
      if (listSelector) {
        var page = q(listSelector).getAncestors(".qx-tabs-page");
        var index = q("#list .qx-tabs-page").indexOf(page);
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


  var markupSamples = {};

  var appendWidgetMarkup = function() {
    var markupHeader = this.getParents().find(".widget-markup");
    var sampleId = markupHeader.getProperty("sampleId");
    var sample = markupSamples[sampleId];

    var pen = q("#playpen");
    if (sample.html) {
      pen.setHtml(sample.html);
    }
    (new Function(sample.javascript))();
    var html = pen.getHtml();
    var textNode = document.createTextNode(html);
    var codeEl = q.create('<code>');
    codeEl[0].appendChild(textNode);

    var tabs = q.template.get("widget-dom", {
      title: "Expand",
      pageId: sampleId
    })
    .insertAfter(markupHeader);
    var pre = tabs.find("pre").append(codeEl);
    tabs.tabs();

    if (useHighlighter) {
      hljs.highlightBlock(pre[0]);
    }

    pen.find(".qx-widget").dispose();
    pen.setHtml("");
    this.allOff().remove();
  };


  var storeWidgetMarkup = function(methodName, sample) {
    if (!sample.showMarkup) {
      return;
    }
    var moduleName = q.string.firstUp(methodName.substr(1));
    var markupHeader = q("#" + moduleName).getParents().find(".widget-markup");
    var id = "sample-" + Date.now();
    markupHeader.setProperty("sampleId", id);
    markupSamples[id] = sample;
    q.create('<div class="widget-dom"><button></button></div>').insertAfter(markupHeader)
    .on("tap", appendWidgetMarkup);
    return;
  };


  /**
   * Adds sample code to a method's documentation. Code can be supplied wrapped in
   * a function or as a map with one or more of the keys js, css and html.
   * Additionally, a key named executable is supported: If the value is true, a
   * button will be created that posts the sample's code to CodePen for live
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
    method.show();

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

    appendSample(sampleMap, headerElement);
    storeWidgetMarkup(methodName, sampleMap);
    scrollContentIntoView();
  };

  var configReplacements = q.$$qx.core.Environment.get("apiviewer.modulenamereplacements");
  var replacements = [];
  for (var exp in configReplacements) {
    replacements.push({
      regExp: new RegExp(exp),
      replacement: configReplacements[exp]
    });
  }

  Data.MODULE_NAME_REPLACEMENTS = replacements;
  var data = new Data();
  data.on("ready", onContentReady, data);
  data.on("loadingFailed", function() {
    q("#warning").setStyle("display", "block");
    if (isFileProtocol()) {
      q("#warning em").setHtml("File protocol not supported. Please load the application via HTTP.");
    }
  });
});
