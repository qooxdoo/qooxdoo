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

************************************************************************ */

/* ************************************************************************
#asset(tutorial/*)
#require(qx.module.Manipulating)
#require(qx.module.Attribute)
#require(qx.module.Traversing)
************************************************************************ */

/**
 * This is the main application class of your custom application "tutorial"
 */
qx.Class.define("tutorial.Application",
{
  extend : qx.application.Standalone,


  members :
  {
    __header : null,
    __playArea : null,
    __editor : null,

    tutorials_desktop : ["Hello_World"],

    main : function()
    {
      // Call super class
      this.base(arguments);

      // Enable logging in debug variant
      if (qx.core.Environment.get("qx.debug"))
      {
        // support native logging capabilities, e.g. Firebug for Firefox
        qx.log.appender.Native;
        // support additional cross-browser console. Press F7 to toggle visibility
        qx.log.appender.Console;
      }

      this.loadAce(function() {
        this.__editor.init();
      }, this);

      // Create main layout
      var mainComposite = new qx.ui.container.Composite(new qx.ui.layout.VBox());
      this.getRoot().add(mainComposite, {edge:0});

      // Create header
      this.__header = new tutorial.view.Header();
      mainComposite.add(this.__header);

      // create the content
      var content = new qx.ui.container.Composite(new qx.ui.layout.HBox(10));
      content.setAppearance("app-splitpane");
      content.setPaddingTop(10);
      mainComposite.add(content, {flex: 1});

      this.__description = new tutorial.view.Description();
      this.__description.addListener("run", this.run, this);
      this.__description.addListener("update", this.updateEditor, this);
      content.add(this.__description, {width: "50%"});

      var actionArea = new qx.ui.container.Composite();
      actionArea.setLayout(new qx.ui.layout.VBox(10));

      this.__editor = new playground.view.Editor();
      actionArea.add(this.__editor, {height: "50%"});

      this.__playArea = new playground.view.RiaPlayArea();
      this.__playArea.setBackgroundColor("white");
      this.__playArea.addListener("appear", function() {
        this.__playArea.init();
      }, this);

      actionArea.add(this.__playArea, {flex: 1});
      this.__playArea.updateCaption("Step 1");
      this.__playArea.addListener("toggleMaximize", function(e) {
        if (!this.__editor.isExcluded()) {
          this.__editor.exclude();
          this.__description.exclude();
        } else {
          this.__editor.show();
          this.__description.show();
        }
      }, this);

      content.add(actionArea, {flex: 1});

      // load initial tutorial
      this.loadTutorial("Hello_World", "desktop");
    },

    updateEditor : function(e) {
      var code = e.getData().toString();
      code = code.substring(5, code.length -3);
      code = code.replace(/ {4}/g, "");
      this.__editor.setCode(code);
      this.run();
    },

    run : function() {
      // reset the play area
      this.__playArea.reset({}, {});

      var code = this.__editor.getCode();
      // try to create a function
      try {
        this.fun = new Function(code);
      } catch(ex) {
        var exc = ex;
      }
      // run the code
      try {
        // run the application
        this.fun.call(this.__playArea.getApp());
      } catch(ex) {
        var exc = ex;
      }
      if (exc) {
        this.__editor.setBackgroundColor("#FFF0F0");
        this.error(exc);
      } else {
        this.__editor.setBackgroundColor("white");
      }
    },


    loadTutorial : function(name, type) {
      var htmlFileName = qx.util.ResourceManager.getInstance().toUri(
        "tutorial/" + type + "/" + name + ".html"
      );
      var req = new qx.io.request.Xhr(htmlFileName);
      req.addListener("success", function(e) {
        var req = e.getTarget();
        var tutorial = this.parseTutorial(name, type, req.getResponse());
        this.__description.setTutorial(tutorial);
      }, this);
      req.send();
    },


    parseTutorial : function(name, type, html) {
      var tutorial = {
        name : name,
        type : type,
        steps : [],
        code : []
      };
      var div = q.create("<div>").setHtml(html);
      div.getChildren().forEach(function(item) {
        tutorial.steps.push(q(item).getHtml());
        tutorial.code.push(q(item).getChildren("[class=sample]").getHtml());
      });
      return tutorial;
    },

    loadAce : function(clb, ctx) {
      var resource = [
        "playground/editor/ace.js", 
        "playground/editor/theme-eclipse.js", 
        "playground/editor/mode-javascript.js"
      ];
      var load = function(list) {
        if (list.length == 0) {
          clb.call(ctx);
          return;
        }
        var res = list.shift();
        var uri = qx.util.ResourceManager.getInstance().toUri(res);
        var loader = new qx.bom.request.Script();
        loader.onload = function() {
          load(list);
        };
        loader.open("GET", uri);
        loader.send();
      }
      load(resource);
    }
  }
});