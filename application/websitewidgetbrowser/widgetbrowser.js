/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2013 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)
     * Daniel Wagner (danielwagner)

************************************************************************ */
q.ready(function() {

  var demos = {
    accordion : ["Default", "Responsive"],
    button : ["Default"],
    calendar : ["Default", "Range Selection","Customized"],
    datepicker : ["Default", "Customized"],
    rating : ["Default", "Custom Length", "Custom Symbol", "Custom Styling"],
    slider : ["Default", "Customized"],
    tabs : ["Default", "Responsive"]
  };


  /**
   * Disable/enable all widgets on each tab
   */
  var disableWidgets = function() {
    var enabled = !q(".disable input").getAttribute("checked");
    q("#content > ul > .qx-tabs-button")._forEachElementWrapped(function(button) {
      var selector = button.getData("qx-tabs-page");
      var widgets = q(selector).find("*[data-qx-class]");
      if (widgets.length > 0) {
        widgets.setEnabled(enabled);
      }
    });
  };


  /**
   * Select the tab with the given title
   * @param title {String} Tab (button) title
   */
  var selectTab = function(title) {
    var tabs = q("#content > ul > .qx-tabs-button");
    var selectedTab = tabs.has("button:contains(" + title + ")");
    if (selectedTab.length > 0) {
      var index = tabs.indexOf(selectedTab);
      q("#content").select(index);
    }
  };


  var demosToLoad;
  var loadedDemos;
  var loadDemos = function(category) {
    loadedDemos = {};
    demosToLoad = 0;
    demos[category] && demos[category].forEach(function(title) {
      loadDemo(category, title);
    });
  };


  /**
   * Load the requested demo file and prepare the content
   * @param category {String} The demo's category (see the demos map)
   * @param title {String} The demo's title (see the demos map)
   */
  var loadDemo = function(category, title) {
    demosToLoad++;
    var url = "demo/" + category + "/" + title + ".html";
    q.io.xhr(url).on("load", function(xhr) {
      if (xhr.status == 200) {
        loadedDemos[title] = createDemoCell(title, xhr.responseText);
        demosToLoad--;
        if (demosToLoad === 0) {
          appendDemos(category);
        }
      }
      else {
        console && console.error("Could not load demo: ", xhr.status, xhr.statusText);
      }
    }).send();
  };


  /**
   * Append each previously loaded demo to the page and executes the
   * demo code
   * @param category {String} The category of the demos (see demos map)
   */
  var appendDemos = function(category) {
    var pageSelector = q("#content").find("> ul > .qx-tabs-button-active").getData("qxTabsPage");

    demos[category].forEach(function(title) {
      var demoCell = loadedDemos[title];
      q(pageSelector).getChildren(".demo-container").append(demoCell);
      var scripts = q.$$qx.bom.Html.extractScripts([demoCell[0]]);
      scripts.forEach(function(script) {
        eval(script.innerHTML);
      });
    });

    disableWidgets();
  };


  /**
   * Logs the given data to the events log.
   * @param data {var} The data given by the event.
   */
  var logEvent = function(type) {
    return (function(data) {
      var firstChild = q("#eventlog").getChildren().eq(0);
      var entry = q.create(q.template.get("eventlogtemplate", {name: type, data: data}));
      if (firstChild.length > 0) {
        entry.insertBefore(firstChild);
      } else {
        entry.appendTo("#eventlog");
      }
    });
  };


  var formatCode = function(code) {
    var lines = code.split("\n");

    lines = lines.filter(function(line, idx, lines) {
      if (line.length === 0) {
        // blank first or last line
        if (idx === 0 || idx === lines.length - 1 ||
          // consecutive blank lines
          (lines[idx + 1] !== undefined && lines[idx + 1].length === 0)) {
          return false;
        }
      }
      return true;
    });

    // remove the first line's indentation from all lines
    var ws = lines[0].match(/^(\s+)/);
    var indent = ws ? ws[1].length : 0;
    if (indent > 0) {
      var reg = new RegExp("^\\s{" + indent + "}");
      lines = lines.map(function(line) {
        return line.replace(reg, "");
      });
    }

    return lines.join("\n");
  };


  var stripTags = function(code) {
    // multiline strings are no fun
    code = code.replace(/\n/gm, "@br@");
    code = code.replace(/<script.*?<\/script>/g, "").replace(/<style.*?<\/style>/g, "");
    return code.split("@br@").join("\n");
  };

  /**
   * Create the DOM structure for a demo and the box showing the demo's code
   * @param demoTitle {String} The demo's title (see the demos map)
   * @param demoCode {String} The demo's JavaScript code
   */
  var createDemoCell = function(demoTitle, demoCode) {
    var legacyIe = (q.env.get("engine.name") === "mshtml" &&
      q.env.get("engine.version") < 9);

    demoHtml = legacyIe ? "_" + demoCode : demoCode;
    var demoCell = q.create("<div class='demo-cell'>").setHtml(demoHtml);
    if (legacyIe) {
      // IE 8 will ignore script tags when setting innerHTML unless they are
      // preceded by a "visible" node (i.e. containing text)
      demoCell[0].removeChild(demoCell[0].firstChild);
    }
    q.create("<h1>" + demoTitle + "</h1>").insertBefore(demoCell.getChildren().getFirst());

    var styles = demoCell.find("style");
    var scripts = demoCell.find("script");

    q.create("<p class='code-header'>HTML</p>").appendTo(demoCell);
    var pre = q.create("<pre class='demo-cell html'></pre>");
    demoCode = formatCode(stripTags(demoCode));
    q.create("<code>").appendTo(pre)[0].appendChild(document.createTextNode(demoCode));
    pre.appendTo(demoCell);
    if (!legacyIe) {
      hljs.highlightBlock(pre[0]);
    }

    if (styles.length > 0) {
      q.create("<p class='code-header'>CSS</p>").appendTo(demoCell);
    }
    styles._forEachElementWrapped(function(style) {
      var pre = q.create("<pre class='demo-cell css'></pre>");
      var code = formatCode(style.getHtml());
      q.create("<code>").appendTo(pre)[0].appendChild(document.createTextNode(code));
      pre.appendTo(demoCell);
      if (!legacyIe) {
        hljs.highlightBlock(pre[0]);
      }
    });

    if (scripts.length > 0) {
      q.create("<p class='code-header'>JavaScript</p>").appendTo(demoCell);
    }
    scripts._forEachElementWrapped(function(script) {
      var pre = q.create("<pre class='demo-cell javascript'></pre>");
      var code = formatCode(script.getHtml());
      q.create("<code>").appendTo(pre)[0].appendChild(document.createTextNode(code));
      pre.appendTo(demoCell);
      if (!legacyIe) {
        hljs.highlightBlock(pre[0]);
      }
    });

    return demoCell;
  };


  /**
   * Set the title of the tab with the given index as URL hash
   * @param index {Number} tab index
   */
  var onChangeSelected = function(index) {
    var button = q("#content > ul > .qx-tabs-button").eq(index);
    var buttonText = button.getChildren("button").getHtml();
    location.hash = buttonText;

    var demoPageSelector = button.getData("qxTabsPage");
    if (q(demoPageSelector).getChildren(".demo-container").getChildren().length > 0) {
      renderWidgets();
      return;
    }
    var demoName = demoPageSelector.match(/#(.*?)-/)[1];
    loadDemos(demoName);
  };

  var appName = "Widget Browser";
  var componentName = "qx.Website";
  var compVer = componentName;
  var version = q.$$qx.core.Environment.get("qx.version");
  if (version) {
    compVer = componentName + " " + version;
  }

  q("h1").setHtml(appName + "<span>" + compVer + "</span>");
  document.title = compVer + " " + appName;

  var toggleSideBar = function(e) {
    var target = q(e.getTarget());
    if ( !target.isChildOf(q("#sidebar .disable")) &&
      e.getTarget() !== q("#sizeSlider")[0] &&
      !target.isChildOf(q("#sizeSlider"))) {
      q("#sidebar").toggleClass("overlay");
    }
  };

  var onChangeWidth = function(mql) {
    if (mql.matches) {
      q("#sidebar").on("tap", toggleSideBar);
    } else {
      q("#sidebar").off("tap", toggleSideBar);
    }
  };

  var mql = q.matchMedia("(max-width: 920px)");
  onChangeWidth(mql);
  mql.on("change", onChangeWidth);

  qxWeb.initWidgets();

  q("#content")
  .on("changeSelected", onChangeSelected);

  q(".disable input").on("change", disableWidgets);

  /**
   * Re-renders all currently visible widgets (e.g. after the app scale
   * was changed)
   */
  var renderWidgets = q.func.debounce (function() {
    q("#content .qx-widget").filter(function(el) {
      return el.offsetWidth > 0;
    }).forEach(function (widget) {
      q(widget).render();
    });
  }, 100, false);

  q("#sizeSlider")
  .setTemplate("knobContent", "{{value}}%").render()
  .on("changeValue", function(value) {
    q("html").setStyle("font-size", value + "%");
    renderWidgets();
  });


  // select tab by URL hash or select the tabs widget's default
  setTimeout(function() {
    var selected;
    if (location.hash.length > 0) {
      selected = location.hash.substr(1);
    } else {
      selected = q("#content").tabs().find(".qx-tabs-button-active").getChildren("button").getHtml();
    }
    selectTab(selected);
  }, 100);

});
