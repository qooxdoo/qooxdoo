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
      var dockLayout = new qx.ui.layout.Dock();
      var dockLayoutComposite = new qx.ui.container.Composite(dockLayout);
      this.getRoot().add(dockLayoutComposite, {edge:0});

      // Create header
      this.__header = new tutorial.view.Header();
      dockLayoutComposite.add(this.__header, {edge: "north"});

      var description = new tutorial.view.Description();
      dockLayoutComposite.add(description, {edge: "west", width: "50%"});

      var actionArea = new qx.ui.container.Composite();
      actionArea.setLayout(new qx.ui.layout.VBox());

      this.__editor = new playground.view.Editor();
      actionArea.add(this.__editor, {height: "50%"});

      this.__playArea = new playground.view.RiaPlayArea();
      this.__playArea.addListener("appear", function() {
        this.__playArea.init();
      }, this);

      actionArea.add(this.__playArea, {height: "50%"});
      this.__playArea.updateCaption("Step 1");
      this.__playArea.addListener("toggleMaximize", function(e) {
        if (!this.__editor.isExcluded()) {
          this.__editor.exclude();
          description.exclude();
          actionArea.setLayoutProperties({"width": "100%"});
        } else {
          this.__editor.show();
          description.show();
          actionArea.setLayoutProperties({"width": "50%"});
        }
      });

      dockLayoutComposite.add(actionArea, {edge: "east", width: "50%"});
    },


    run : function() {
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

      console.log(exc);
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
        var loader = new qx.io.ScriptLoader();
        loader.load(uri, function() {
          load(list);
        });
      }
      load(resource);
    }
  }
});