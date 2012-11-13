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

  statics : {
    mobileSupported : function() {
      var engine = qx.core.Environment.get("engine.name");

      // all webkits are ok
      if (engine == "webkit") {
        return true;
      }
      // ie > 10 is ok
      if (engine == "mshtml" && parseInt(qx.core.Environment.get("browser.documentmode")) >= 10) {
        return true;
      }
      // ff > 10 is ok
      if (engine == "gecko" && parseInt(qx.core.Environment.get("engine.version")) >= 10) {
        return true;
      }
      return false;
    },


    allowFade : function() {
      return !(qx.core.Environment.get("engine.name") == "mshtml" &&
        parseInt(qx.core.Environment.get("browser.documentmode")) < 9);
    }
  },

  members :
  {
    __header : null,
    __playArea : null,
    __editor : null,
    __description : null,
    __selectionWindow : null,
    __actionArea : null,

    __desktopTutorials : null,
    __mobileTutorials : null,

    __confirmWindow : null,

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

      // Tutorials List
      this.__desktopTutorials = {
        "Hello_World" : "Basic usage of a button",
        "Form" : "Simple login form with validation",
        "Single_Value_Binding" : "Binding of simple values"
      };
      this.__mobileTutorials = {
        "Hello_World" : "One page showing a button",
        "Pages" : "App featuring two pages"
      };

      // Create main layout
      var mainComposite = new qx.ui.container.Composite(new qx.ui.layout.VBox());
      this.getRoot().add(mainComposite, {edge:0});

      // Create header
      this.__header = new tutorial.view.Header();
      this.__header.addListener("selectTutorial", this.openSelectionWindow, this);
      mainComposite.add(this.__header);

      // create the content
      var content = new qx.ui.splitpane.Pane();
      content.setAppearance("app-splitpane");
      content.setPaddingTop(10);
      mainComposite.add(content, {flex: 1});

      this.__description = new tutorial.view.Description();
      this.__description.addListener("run", this.run, this);
      this.__description.addListener("update", this.updateEditor, this);

      content.add(this.__description, 1);

      var actionArea = new qx.ui.splitpane.Pane();
      this.__actionArea = actionArea;
      this.__editor = new playground.view.Editor();
      actionArea.add(this.__editor);
      playground.view.Editor.loadAce(function() {
        this.__editor.init();
      }, this);

      this.__playArea = new playground.view.PlayArea();
      this.__playArea.setBackgroundColor("white");

      actionArea.add(this.__playArea);
      this.__playArea.updateCaption("");
      this.__playArea.addListener("toggleMaximize", function(e) {
        if (!this.__editor.isExcluded()) {
          this.__editor.exclude();
          this.__description.exclude();
        } else {
          this.__editor.show();
          this.__description.show();
        }
      }, this);

      content.add(actionArea, 3);

      // set the blocker color
      this.getRoot().setBlockerColor("rgba(0, 0, 0, 0.35)")
    },

    // overridden
    finalize: function() {
      var state = qx.bom.History.getInstance().getState();
      if (state == "") {
        // use the hello world desktop as default
        this.loadTutorial("Hello_World", "desktop");
      } else {
        state = state.split("~");
        if (state[0] == "desktop") {
          this.loadTutorial(state[1], state[0]);
        } else if ((tutorial.Application.mobileSupported())) {
          this.loadTutorial(state[1], state[0]);
        } else {
          // use the hello world desktop as default
          this.loadTutorial("Hello_World", "desktop");
        }
      }

    },


    openSelectionWindow : function() {
      if (!this.__selectionWindow) {
        this.__selectionWindow = new tutorial.view.SelectionWindow(
          this.__desktopTutorials,
          this.__mobileTutorials
        );
        this.__selectionWindow.addListener("changeTutorial", this.__onChangeTutorial, this);
      }

      this.__selectionWindow.open();
      this.render();  // make sure the DOM object is available for the fade
      if (tutorial.Application.allowFade()) {
        this.__selectionWindow.fadeIn(300);
      } else {
        this.__selectionWindow.show();
      }

    },


    __onChangeTutorial : function(e) {
      var type = e.getData().type;
      var name = e.getData().name;
      this.loadTutorial(name, type);
      this.__editor.setCode("");
      this.__editor.setError();
      this.__playArea.reset();
      qx.bom.History.getInstance().setState(type + "~" + name);
    },


    updateEditor : function(e) {
      var code = e.getData().toString();
      this.confirm("This will replace the current code in the editor.", function(ok) {
        if (ok.getData()) {
          this.__editor.setCode(code);
          this.run();
        }
      }, this);
    },


    confirm : function(text, callback, ctx) {
      if (!this.__confirmWindow) {
        this.__confirmWindow = new tutorial.view.Confirm();
      }
      if (this.__confirmWindow.getIgnore()) {
        callback.call(ctx, {getData : function() {return true;}});
        return;
      }
      this.__confirmWindow.setMessage(text);
      this.__confirmWindow.open();
      this.render();
      if (tutorial.Application.allowFade()) {
        this.__confirmWindow.fadeIn(300);
      } else {
        this.__confirmWindow.show();
      }
      this.__confirmWindow.addListenerOnce("confirm", callback, ctx);
    },


    run : function() {
      var code = this.__editor.getCode();

      // don't run if we have no code
      if (code == "") {
        return;
      }

      // reset the play area
      this.__playArea.reset({}, {});

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
        this.__editor.setError(exc);
        this.error(exc);
      } else {
        this.__editor.setError();
        this.__editor.setBackgroundColor("white");
      }
    },


    /**
     * @lint ignoreDeprecated(alert)
     */
    loadTutorial : function(name, type) {
      var htmlFileName = qx.util.ResourceManager.getInstance().toUri(
        "tutorial/" + type + "/" + name + ".html"
      );
      var req = new qx.io.request.Xhr(htmlFileName);
      req.addListener("success", function(e) {
        var req = e.getTarget();
        var tutorial = this.parseTutorial(name, type, req.getResponse());
        this.__description.setTutorial(tutorial);
        this.__playArea.updateCaption(name.replace(/_/g, " ") + " (" + type + ")");
        this.__playArea.setMode(type !== "desktop" ? "mobile" : "ria")
        this.__actionArea.setOrientation(type == "desktop" ? "vertical" : "horizontal");
      }, this);
      req.send();

      req.addListener("fail",  function(evt) {
        this.error("Couldn't load file: " + htmlFileName);
        if (window.location.protocol == "file:") {
          alert("Failed to load the tutorials from the file system.\n\n" +
                "The security settings of your browser may prohibit AJAX " +
                "when using the file protocol. Please try the http protocol " +
                "instead.");
        }
      }, this);
    },


    parseTutorial : function(name, type, html) {
      var tut = {
        name : name,
        type : type,
        steps : [],
        code : []
      };
      var div = q.create("<div>").setHtml(html);
      div.getChildren().forEach(function(item) {
        var script = q(item).getChildren("script");
        tut.code.push(script.getHtml());
        script.remove();
        tut.steps.push(q(item).getHtml());
      });
      return tut;
    }
  }
});