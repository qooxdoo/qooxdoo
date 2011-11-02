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

qx.Class.define("widgetbrowser.pages.Basic",
{
  extend: widgetbrowser.pages.AbstractPage,

  construct: function()
  {
    this.base(arguments);

    var hbox = this.__hbox = new qx.ui.container.Composite(new qx.ui.layout.HBox(10));
    this.add(hbox, {top: 0});

    this.initWidgets();
  },

  members :
  {

    __hbox: null,

    initWidgets: function()
    {
      var widgets = this._widgets;

      // Label
      var label = new qx.ui.basic.Label("Label").set({alignY: "middle"});
      widgets.push(label);
      this.__hbox.add(label);

      // Image
      var image = new qx.ui.basic.Atom("Image", "icon/32/status/dialog-information.png");
      widgets.push(image);
      this.__hbox.add(image);

      // Atom
      var atom = new qx.ui.basic.Atom("Atom", "icon/32/status/dialog-information.png");
      widgets.push(atom);
      this.__hbox.add(atom);
    }
  }
});