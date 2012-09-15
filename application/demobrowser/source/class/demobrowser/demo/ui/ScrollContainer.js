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

qx.Class.define("demobrowser.demo.ui.ScrollContainer",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var scrollContainer = new qx.ui.container.Scroll();
      scrollContainer.set({
        width: 300,
        height: 200
      });

      scrollContainer.add(this.generateBoxes());
      this.getRoot().add(scrollContainer, {left: 10, top: 50});

      var toggle = new qx.ui.form.Button("Toggle size");
      var grow = true;
      toggle.addListener("execute", function() {
        scrollContainer.setWidth(grow ? 800 : 300);
        grow = !grow;
      });
      this.getRoot().add(toggle, {left: 10, top: 10});

      // scroll button
      var scroll = new qx.ui.form.Button("Scroll down");
      scroll.addListener("execute", function() {
        scrollContainer.scrollByY(150);
      });
      this.getRoot().add(scroll, {left: 110, top: 10});


      // animate button
      var ani = new qx.ui.form.Button("Animate down");
      ani.addListener("execute", function() {
        scrollContainer.scrollByY(150, 300);
        ani.setEnabled(false);
      });
      this.getRoot().add(ani, {left: 210, top: 10});
      scrollContainer.addListener("scrollAnimationYEnd", function() {
        ani.setEnabled(true);
      });

    },

    generateBoxes : function()
    {
      var box = new qx.ui.container.Composite(new qx.ui.layout.Grid());

      for (var y=0; y<20; y++)
      {
        for (var x=0; x<10; x++)
        {
          box.add((new qx.ui.core.Widget()).set({
            backgroundColor : ((x+y) % 2 == 0) ? "red" : "blue",
            width : 60,
            allowShrinkY : false,
            allowShrinkX : false,
            height : 60
          }), {column: x, row: y});
        }
      }

      return box;
    }
  }
});
