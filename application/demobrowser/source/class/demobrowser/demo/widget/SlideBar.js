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

      slideBar = new qx.ui.container.SlideBar();
      slideBar.set({
        width: 300
      });

      slideBar.setLayout(new qx.ui.layout.HBox());

      for (var i=0; i<10; i++)
      {
        slideBar.add((new qx.ui.core.Widget()).set({
          backgroundColor : (i % 2 == 0) ? "red" : "blue",
          width : 60,
          minWidth : 40
        }), {flex: 1});
      }


      var toggle = new qx.ui.form.ToggleButton("Toggle size");

      toggle.addListener("changeChecked", function(e) {
        slideBar.setWidth(e.getData() ? 800 : 300);
      });

      this.getRoot().add(toggle, {left:20, top:80});
      this.getRoot().add(slideBar, {left:20, top:20});
    }
  }
});
