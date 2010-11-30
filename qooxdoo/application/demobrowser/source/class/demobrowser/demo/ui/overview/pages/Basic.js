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

#asset(qx/icon/${qx.icontheme}/32/status/dialog-information.png)

************************************************************************ */

/**
 * Demonstrates qx.ui.basic(...):
 *
 * Label, Image, Atom
 *
 */

qx.Class.define("demobrowser.demo.ui.overview.pages.Basic",
{
  extend: qx.ui.tabview.Page,

  include : demobrowser.demo.ui.overview.MControls,

  construct: function()
  {
    this.base(arguments);

    this.setLabel("Basic");
    this.setLayout(new qx.ui.layout.Canvas());

    // Work-around to vertically align HBox at the top
    this.__container = new qx.ui.container.Composite(new qx.ui.layout.HBox(10));
    this.add(this.__container, {top: 40});

    this._initWidgets();
    this._initControls(this.__widgets, {disabled: true});
  },

  members :
  {
    __widgets: null,

    __container: null,

    _initWidgets: function()
    {
      var widgets = this.__widgets = new qx.type.Array();

      // Label
      var label = new qx.ui.basic.Label("Label").set({alignY: "middle"});
      widgets.push(label);
      this.__container.add(label);

      // Image
      var image = new qx.ui.basic.Atom("Image", "icon/32/status/dialog-information.png");
      widgets.push(image);
      this.__container.add(image);

      // Atom
      var atom = new qx.ui.basic.Atom("Atom", "icon/32/status/dialog-information.png");
      widgets.push(atom);
      this.__container.add(atom);
    }
  }
});