/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tristan Koch (tristankoch)

************************************************************************ */

qx.Class.define("demobrowser.demo.ui.WidgetOverview",
{
  extend : qx.application.Standalone,


  construct: function()
  {
    this.base(arguments);

  },

  members:
  {
    main: function()
    {
      this.base(arguments);

      // Enable logging in debug variant
      if (qx.core.Variant.isSet("qx.debug", "on")) {
        // support native logging capabilities, e.g. Firebug for Firefox
        qx.log.appender.Native;
        // support additional cross-browser console. Press F7 to toggle visibility
        qx.log.appender.Console;
      }

      var doc = this.getRoot();
      var scroll = new qx.ui.container.Scroll();
      doc.add(scroll, {edge: 0});

      var tabView = new demobrowser.demo.ui.overview.TabView();
      tabView.set({
        minWidth: 800,
        minHeight: 800
      })
      scroll.add(tabView);

    }
  }
});
