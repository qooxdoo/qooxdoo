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

#asset(qx/icon/${qx.icontheme}/32/apps/media-photo-album.png)

************************************************************************ */

/**
 * Demonstrates qx.ui(...):
 *
 * indicator.ProgressBar
 * popup.Popup
 *
 */

qx.Class.define("demobrowser.demo.ui.overview.pages.Misc",
{
  extend: qx.ui.tabview.Page,

  include : demobrowser.demo.ui.overview.MControls,

  construct: function()
  {
    this.base(arguments);

    this.setLabel("Misc");
    this.setLayout(new qx.ui.layout.Canvas());

    this.__container = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));
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

      // ProgressBar
      var label = new qx.ui.basic.Label("ProgressBar");
      var pb = new qx.ui.indicator.ProgressBar(0, 100).set({value: 50});
      widgets.push(pb);
      this.__container.add(label);
      this.__container.add(pb);

      // Pop-Up
      var label = new qx.ui.basic.Label("Pop-Up");
      var popup = new qx.ui.popup.Popup(new qx.ui.layout.Canvas()).set({
        backgroundColor: "#FFFAD3",
        padding: [2, 4],
        offset : 3,
        offsetBottom : 20
      });
      popup.set({
        allowStretchX: false,
        autoHide: false
      });
      popup.add(new qx.ui.basic.Atom("Pop-Up", "icon/32/apps/media-photo-album.png"));
      widgets.push(popup);
      this.__container.add(label);
      this.__container.add(popup);
      popup.show();

    }
  }
});