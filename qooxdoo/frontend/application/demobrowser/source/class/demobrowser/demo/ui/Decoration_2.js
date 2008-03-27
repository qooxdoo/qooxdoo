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

qx.Class.define("demobrowser.demo.ui.Decoration_2",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);
      qx.theme.manager.Meta.getInstance().setTheme(qx.theme.Modern);

      var containerLayout = new qx.ui.layout.HBox();
      containerLayout.setSpacing(10);

      var container = new qx.ui.core.Widget();
      container.setPadding(20);
      container.setLayout(containerLayout);

      this.getRoot().add(container, 0, 0);


      // Grid 1
      var deco1 = new qx.ui.decoration.Grid("decoration/form/button.png");

      var widget1 = new qx.ui.core.Widget();
      widget1.setWidth(200);
      widget1.setHeight(50);
      widget1.setDecorator(deco1);
      containerLayout.add(widget1);

      var button1 = new qx.ui.form.Button("Juhu");
      button1.setDecorator(deco1);
      button1.setTextColor("white");
      button1.setAllowGrowY(false);
      containerLayout.add(button1);


      // Beveled 1
      var deco2 = new qx.ui.decoration.Beveled("#2D405A", "white");
      deco2.setBackgroundImage("decoration/form/button-c.png");
      deco2.setInnerOpacity(0.15);

      var widget2 = new qx.ui.core.Widget;
      widget2.setWidth(200);
      widget2.setHeight(50);
      widget2.setDecorator(deco2);
      containerLayout.add(widget2);


      // Beveled 2
      var deco3Normal = new qx.ui.decoration.Beveled("#2D405A", "black");
      deco3Normal.setInnerOpacity(0.15);

      var deco3Focus = new qx.ui.decoration.Beveled("#2D405A", "#92B1DC");
      deco3Focus.setInnerOpacity(1);

      var widget3 = new qx.ui.form.TextField;
      widget3.setAllowGrowY(false);
      widget3.setBackgroundColor("white");
      widget3.setDecorator(deco3Normal);
      widget3.setWidth(140);
      containerLayout.add(widget3);

      var widget4 = new qx.ui.form.TextField;
      widget4.setAllowGrowY(false);
      widget4.setBackgroundColor("white");
      widget4.setDecorator(deco3Normal);
      widget4.setWidth(140);
      containerLayout.add(widget4);

      widget3.addListener("click", function() {
        this.setDecorator(this.getDecorator() == deco3Normal ? deco3Focus : deco3Normal);
      });

    }
  }
});
