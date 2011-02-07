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

/* ************************************************************************

#use(widgetbrowser.pages.Tree)
#use(widgetbrowser.pages.List)
#use(widgetbrowser.pages.Table)
#use(widgetbrowser.pages.Form)
#use(widgetbrowser.pages.ToolBar)
#use(widgetbrowser.pages.Window)
#use(widgetbrowser.pages.Control)
#use(widgetbrowser.pages.TreeVirtual)
#use(widgetbrowser.pages.SplitPane)
#use(widgetbrowser.pages.Embed)
#use(widgetbrowser.pages.EmbedFrame)
#use(widgetbrowser.pages.Basic)
#use(widgetbrowser.pages.Misc)

************************************************************************ */

qx.Class.define("widgetbrowser.view.TabPage",
{
  extend: qx.ui.tabview.Page,

  include: widgetbrowser.MControls,

  construct: function(label, classname, controls)
  {
    this.base(arguments);

    this.setLabel(label);
    this.setLayout(new qx.ui.layout.Canvas());

    // Load content of tab on "appear"
    this.addListener("appear", function() {

      // Require part
      var part = classname.split(".").pop().toLowerCase();
      qx.Part.require(part, function() {

        // Finally, instantiate class
        var clazz = qx.Class.getByName(classname);
        var pageContent = new clazz();

        // Add to page
        this.add(pageContent, {top: 40, edge: 0});

        // Init controls for widgets of page
        this.initControls(pageContent.getWidgets(), controls);

      }, this);
    }, this);
  },

  members :
  {
  }
});