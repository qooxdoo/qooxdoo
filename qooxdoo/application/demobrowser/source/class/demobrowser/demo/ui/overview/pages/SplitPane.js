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

/**
 * Demonstrates qx.ui.splitpane(...):
 *
 * Pane, Slider, Splitter
 *
 */

qx.Class.define("demobrowser.demo.ui.overview.pages.SplitPane",
{
  extend: qx.ui.tabview.Page,

  include : demobrowser.demo.ui.overview.MControls,

  construct: function()
  {
    this.base(arguments);

    this.setLabel("SplitPane");
    this.setLayout(new qx.ui.layout.Canvas());

    this.__container = new qx.ui.container.Composite(new qx.ui.layout.Canvas());
    this.add(this.__container, {top: 40});

    this._initWidgets();
    this._initControls(this.__widgets, {});
  },

  members :
  {
    __widgets: null,

    __container: null,

    _initWidgets: function()
    {
      var widgets = this.__widgets = new qx.type.Array();

      var splitPane = new qx.ui.splitpane.Pane("horizontal");
      widgets.push(splitPane);
      this.__container.add(splitPane);

      splitPane.add(new qx.ui.core.Widget().set({width: 200, height: 200}));
      splitPane.add(new qx.ui.core.Widget().set({width: 300, height: 200}));
    }
  }
});