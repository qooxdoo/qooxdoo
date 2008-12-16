/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("demobrowser.demo.ui.ScrollContainer_ResizeMatch",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      scrollContainer = new qx.ui.container.Scroll();
      scrollContainer.set({
        width: 200,
        height: 200
      });

      this.getRoot().add(scrollContainer, {left: 10, top: 10});
      scrollContainer.add(this.generateBox());

      var toggle = new qx.ui.form.Button("Toggle size");

      var grow = true;
      toggle.addListener("execute", function()
      {
        scrollContainer.setWidth(grow ? 300 : 200);
        scrollContainer.setHeight(grow ? 300 : 200);
        grow = !grow;
      });

      this.getRoot().add(toggle, {left: 10, top: 400});
    },

    generateBox : function()
    {
      var box = new qx.ui.basic.Label("Content size: 300x300").set({
        width: 300,
        height: 300,
        allowShrinkX: false,
        allowShrinkY: false,
        backgroundColor: "brown",
        textColor: "white",
        padding: 10
      });
      return box;
    }
  }
});
