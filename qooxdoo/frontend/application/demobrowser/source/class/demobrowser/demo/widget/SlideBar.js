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

qx.Class.define("demobrowser.demo.widget.SlideBar",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      slideBar = new qx.ui.view.HSlideBar();
      slideBar.set({
        width: 300,
        backgroundColor : "yellow",
        padding : 10
      });

      slideBar.add(this.generateBoxes());

      var toggle = new qx.ui.basic.Label("Toggle size").set({
        padding : 5,
        backgroundColor: "orange"
      });

      var grow = true;
      toggle.addListener("click", function()
      {
        slideBar.setWidth(grow ? 800 : 300);
        grow = !grow;
      });

      this.getRoot().add(toggle, {left:10, top:100});
      this.getRoot().add(slideBar, {left:10, top:10});
    },

    generateBoxes : function()
    {
      var box = new qx.ui.container.Composite(new qx.ui.layout.HBox());

      for (var i=0; i<10; i++)
      {
        box.add((new qx.ui.core.Widget()).set({
          backgroundColor : (i % 2 == 0) ? "red" : "blue",
          width : 60,
          minWidth : 40
        }), {flex: 1});
      }

      return box;
    }
  }
});
