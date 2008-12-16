/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("demobrowser.demo.test.Destructor",
{
  extend : qx.application.Standalone,

  members :
  {
    __data : [],

    main : function()
    {
      // Call super class
      this.base(arguments);

      // Test labels
      // this.currentTest = this.testLabels;
      this.currentTest = this.testWindows;

      // Init rounds
      this.__round = 0;

      // Init timer
      this.__timer = new qx.event.Timer(1000);
      this.__timer.addListener("interval", this.runTest, this);
      this.__timer.start();

      // Make global for demo use
      timer = this.__timer;
    },

    runTest : function()
    {
      // Debug
      this.__round++;
      var len = qx.lang.Object.getLength(qx.core.ObjectRegistry.getRegistry());
      this.debug("Round: " + this.__round + " (Registry: " + len + ")");

      // Test labels
      this.currentTest();

      // Render content
      qx.ui.core.queue.Manager.flush();

      // Clear
      var data = this.__data;
      for (var i=0, l=data.length; i<l; i++) {
        data[i].destroy();
      }
      data.length = 0;

      // Clear content
      qx.ui.core.queue.Manager.flush();

      // Debug
      var len = qx.lang.Object.getLength(qx.core.ObjectRegistry.getRegistry());
      this.debug("Done! (Registry: " + len + ")");
    },

    testLabels: function()
    {
      for ( var i=0; i<250; i++)
      {
        var label = new qx.ui.basic.Label("Label: " + i);

        this.getRoot().add(label, {
          left : 50,
          top : 50 + i*20
        });

        this.__data.push(label);
      }
    },

    testWindows : function()
    {
      for ( var i=0; i<5; i++)
      {
        var win = new qx.ui.window.Window("Window: " + i);
        win.open();

        this.__data.push(win);
      }
    }
  }
});
