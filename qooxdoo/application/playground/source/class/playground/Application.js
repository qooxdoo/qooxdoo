/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

#asset(qx/icon/${qx.icontheme}/*)
#asset(playground/*)

************************************************************************ */

/**
 * EXPERIMENTAL: This playground application is a minimal implementation,
 * that requires further improvements (object destruction, etc.)
 */
qx.Class.define("playground.Application",
{
  extend : qx.application.Standalone,



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * This method contains the initial application code and gets called
     * during startup of the application
     */
    main : function()
    {
      // Call super class
      this.base(arguments);

      // Enable logging in debug variant
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        // support native logging capabilities, e.g. Firebug for Firefox
        qx.log.appender.Native;
        // support additional cross-browser console. Press F7 to toggle visibility
        qx.log.appender.Console;
      }

      var doc = this.getRoot();

      var pane = new qx.ui.splitpane.Pane("horizontal");

//      var textarea = new qx.ui.form.TextArea('var button1 = new qx.ui.form.Button("First Button", "playground/test.png");\nthis.getRoot().add(button1, {left: 100, top: 50});');
      var textarea = new qx.ui.form.TextArea('var win = new qx.ui.window.Window("First Window", "icon/16/apps/office-calendar.png");\nwin.open();\nthis.getRoot().add(win, {left:20, top:20});');
      textarea.set({width: 600, wrap: false, font: "monospace"});

      var playarea = new qx.ui.container.Scroll;

      var dummy = new qx.ui.core.Widget;
      playarea.add(dummy);

      pane.add(textarea, 0);
      pane.add(playarea, 1);

      doc.add(pane, {left: 0, top: 60, right:0, bottom:0});


      qx.html.Element.flush();
      var rootEl = dummy.getContainerElement().getDomElement();
      var root = new qx.ui.root.Inline(rootEl);
      root._setLayout(new qx.ui.layout.Canvas());


      playarea.addListener("resize", function(e) {
        var data = e.getData();
        root.setMinWidth(data.width);
        root.setMinHeight(data.height);
      });

      var playApp = this.clone();
      playApp.getRoot = function() { return root; };

      root.addListener("resize", function(e) {
        var data = e.getData();
        dummy.set({minWidth:data.width, minHeight:data.height});
      });

      var button1 = new qx.ui.form.Button("Update", "playground/test.png");
      doc.add(button1, {left: 10, top: 10});

      button1.addListener("execute", function(e) {
        for( var i=0, ch=root.getChildren(), chl=ch.length; i<chl; i++) {
         if(ch[i]) {
          ch[i].destroy();
         }
        }

        this.code = textarea.getValue();

        try {
          this.fun = new Function(this.code);
           this.fun.call(playApp);
        } catch(ex) {
          this.error(ex);
          alert(this.tr("Sorry, invalid code!") + "\n\n" + ex);
        }

      }, this);
    }
  }
});
