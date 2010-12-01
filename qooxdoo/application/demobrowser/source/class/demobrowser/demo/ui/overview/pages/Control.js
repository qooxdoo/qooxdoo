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
 * Demonstrates qx.ui.control(...):
 *
 * ColorSelector
 * ColorPopup
 * DateChooser
 *
 */

qx.Class.define("demobrowser.demo.ui.overview.pages.Control",
{
  extend: qx.ui.tabview.Page,

  include: demobrowser.demo.ui.overview.MControls,

  construct: function()
  {
    this.base(arguments);

    this.setLabel("Control");
    this.setLayout(new qx.ui.layout.Canvas());

    this.__container = new qx.ui.container.Composite(new qx.ui.layout.VBox(20));
    this.add(this.__container, {top: 40});

    this._initWidgets();
    this._initControls(this.__widgets, {disabled: true})
  },

  members:
  {
    __widgets: null,

    __container: null,

    _initWidgets: function() {
      var widgets = this.__widgets = new qx.type.Array();
      var label;

      // ColorSelector
      label = new qx.ui.basic.Label("ColorSelector");
      var colorSelector = new qx.ui.control.ColorSelector();
      widgets.push(colorSelector);
      this.__container.add(label);
      this.__container.add(colorSelector);

      // ColorPopup
      label = new qx.ui.basic.Label("ColorPopup");
      var colorPopup = new qx.ui.control.ColorPopup();
      colorPopup.exclude();

      var openColorPopup = new qx.ui.form.Button("Open Color Popup").set({maxWidth: 150});
      widgets.push(openColorPopup);
      this.__container.add(label);
      this.__container.add(openColorPopup);
      openColorPopup.addListener("execute", function()
      {
        colorPopup.placeToWidget(openColorPopup);
        colorPopup.show();
      });

      // DateChooser
      var dateChooser = new qx.ui.control.DateChooser().set({maxWidth: 200});
      label = new qx.ui.basic.Label("DateChooser");
      widgets.push(dateChooser);
      this.__container.add(label);
      this.__container.add(dateChooser);

    }
  }
});
