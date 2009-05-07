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
     * Christian Schmidt (chris_schmidt)

************************************************************************ */

/* ************************************************************************

#asset(demobrowser/demo/flash/fo_tester.swf)

************************************************************************ */
qx.Class.define("demobrowser.demo.widget.Flash",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var variables = {
        flashVarText: "this is passed in via FlashVars"
      };
      
      var flash = new qx.ui.embed.Flash("demobrowser/demo/flash/fo_tester.swf").set({
        scale: "noscale",
        variables : variables,
        backgroundColor : "#FF6600"
      });

      var doc = this.getRoot();
      doc.add(flash, {left: 10, top: 10, right: 10, bottom: 10});
    }
  }
});
