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

/*
 * The next is to inform resource copying
 #asset(widgetbrowser/helper.js)
 */

qx.Class.define("widgetbrowser.Application",
{
  extend : qx.application.Standalone,


  construct: function()
  {
    this.base(arguments);

  },

  members:
  {
    __header: null,

    __tabs: null,

    __scroll: null,

    main: function()
    {
      this.base(arguments);

      // Enable logging in debug variant
      if (qx.core.Environment.get("qx.debug")) {
        // support native logging capabilities, e.g. Firebug for Firefox
        qx.log.appender.Native;
        // support additional cross-browser console. Press F7 to toggle visibility
        qx.log.appender.Console;
      }

      var doc = this.getRoot();
      var dockLayout = new qx.ui.layout.Dock();
      var dockLayoutComposite = new qx.ui.container.Composite(dockLayout);
      doc.add(dockLayoutComposite, {edge:0});

      this.__header = new widgetbrowser.view.Header();
      dockLayoutComposite.add(this.__header, {edge: "north"});

      var scroll = this.__scroll = new qx.ui.container.Scroll();
      dockLayoutComposite.add(scroll);

      this.__tabs = this._createTabView();
      this.__tabs.set({
        minWidth: 800,
        padding: 15
      });
      scroll.add(this.__tabs);

    },

    _createTabView: function()
    {
      this.__tabs = new widgetbrowser.view.TabView();
      return this.__tabs;
    },

    getScroll: function()
    {
      return this.__scroll;
    },

    getThemes: function() {
      return ([
        {"Indigo" : "qx.theme.Indigo"},
        {"Modern" : "qx.theme.Modern"},
        {"Simple" : "qx.theme.Simple"},
        {"Classic" : "qx.theme.Classic"}
      ]);
    }
  }
});
