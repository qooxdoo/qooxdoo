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
 * Demonstrates (...):
 *
 * Iframe
 * ThemedIframe
 */

qx.Class.define("demobrowser.demo.ui.overview.pages.EmbedFrame",
{
  extend: qx.ui.tabview.Page,

  include : demobrowser.demo.ui.overview.MControls,

  construct: function()
  {
    this.base(arguments);

    this.setLabel("EmbedFrame");
    this.setLayout(new qx.ui.layout.Canvas());

    this.__container = new qx.ui.container.Composite(new qx.ui.layout.Canvas(10));
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
      var label;

      // Iframe
      label = new qx.ui.basic.Label("Iframe");
      var iFrame = new qx.ui.embed.Iframe().set({
        source: "http://www.w3.org/",
        width: 300,
        height: 200
      });
      widgets.push(iFrame);
      this.__container.add(label, {top: 0, left: 0});
      this.__container.add(iFrame, {top: 20, left: 0});

      // ThemedIframe
      label = new qx.ui.basic.Label("ThemedIframe");
      var themedIFrame = new qx.ui.embed.ThemedIframe().set({
        source: "../welcome.html",
        width: 300,
        height: 200
      });
      widgets.push(themedIFrame);
      this.__container.add(label, {top: 0, left: 350});
      this.__container.add(themedIFrame, {top: 20, left: 350});
    }
  }
});