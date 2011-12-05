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

#asset(widgetbrowser/blank.html)

************************************************************************ */

/**
 * Demonstrates (...):
 *
 * Iframe
 * ThemedIframe
 */

qx.Class.define("widgetbrowser.pages.EmbedFrame",
{
  extend: widgetbrowser.pages.AbstractPage,

  construct: function()
  {
    this.base(arguments);

    this.setLayout(new qx.ui.layout.Canvas(10));
    this.initWidgets();
  },

  members :
  {

    initWidgets: function()
    {
      var widgets = this._widgets;
      var label, left, right;
      var url = qx.util.ResourceManager.getInstance().toUri("widgetbrowser/blank.html");

      var splitPane = new qx.ui.splitpane.Pane("horizontal");
      // remove the background color for a better look
      splitPane.getChildControl("splitter").setBackgroundColor(null);
      this.add(splitPane);

      // Iframe
      label = new qx.ui.basic.Label("Iframe");
      left = new qx.ui.container.Composite(new qx.ui.layout.Canvas());
      var iFrame = new qx.ui.embed.Iframe().set({
        source: url,
        width: 300,
        height: 200
      });
      widgets.push(iFrame);
      left.add(label, {top: 0, left: 5});
      left.add(iFrame, {top: 20, left: 0, right: 0});

      // ThemedIframe
      label = new qx.ui.basic.Label("ThemedIframe");
      right = new qx.ui.container.Composite(new qx.ui.layout.Canvas());

      var themedIFrame = new qx.ui.embed.ThemedIframe().set({
        source: url,
        width: 300,
        height: 200
      });
      widgets.push(themedIFrame);
      right.add(label, {top: 0, left: 5});
      right.add(themedIFrame, {top: 20, left: 0, right: 0});

      splitPane.add(left);
      splitPane.add(right);

    }
  }
});