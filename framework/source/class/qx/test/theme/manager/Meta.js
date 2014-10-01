/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2014 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Mustafa Sak (msak)

************************************************************************ */

qx.Class.define("qx.test.theme.manager.Meta",
{
  extend : qx.test.ui.LayoutTestCase,

  construct : function()
  {
    this.base(arguments);

    qx.Theme.define("qx.test.theme.manager.MockAll",
    {
      title : "Mock all theme manager",

      meta :
      {
        color : qx.test.theme.manager.mock.Color,
        decoration : qx.test.theme.manager.mock.Decoration,
        font : qx.test.theme.manager.mock.Font,
        appearance : qx.test.theme.manager.mock.Appearance,
        icon : qx.theme.icon.Tango
      }
    });


    qx.Theme.define("qx.test.theme.manager.MockAppearance",
    {
      title : "Mock only appearance manager",

      meta :
      {
        appearance : qx.test.theme.manager.mock.Appearance,

        decoration : qx.theme.manager.Decoration.getInstance().getTheme(),
        color : qx.theme.manager.Color.getInstance().getTheme(),
        font : qx.theme.manager.Font.getInstance().getTheme(),
        icon : qx.theme.icon.Tango
      }
    });


    qx.Theme.define("qx.test.theme.manager.MockDecoration",
    {
      title : "Mock only decorator manager",

      meta :
      {
        decoration : qx.test.theme.manager.mock.Decoration,

        color : qx.theme.manager.Color.getInstance().getTheme(),
        font : qx.theme.manager.Font.getInstance().getTheme(),
        appearance : qx.theme.manager.Appearance.getInstance().getTheme(),
        icon : qx.theme.icon.Tango
      }
    });


    qx.Theme.define("qx.test.theme.manager.MockColor",
    {
      title : "Mock only color manager",

      meta :
      {
        color : qx.test.theme.manager.mock.Color,

        decoration : qx.theme.manager.Decoration.getInstance().getTheme(),
        font : qx.theme.manager.Font.getInstance().getTheme(),
        appearance : qx.theme.manager.Appearance.getInstance().getTheme(),
        icon : qx.theme.icon.Tango
      }
    });
  },


  members :
  {
    __formerTheme : null,

    setUp : function() {
      this.manager = qx.theme.manager.Meta.getInstance();
      this.__formerTheme = this.manager.getTheme();

      // add a theme able widget
      this.__button = new qx.ui.form.Button("Foo");
      this.getRoot().add(this.__button);
      qx.ui.core.queue.Manager.flush();
    },


    tearDown : function()
    {
      this.__button.destroy();


      this.manager.setTheme(this.__formerTheme);
      this.__formerTheme = null;
    },


    testAllThemeManagerChanged : function()
    {
      qx.theme.manager.Meta.getInstance().setTheme(qx.test.theme.manager.MockAll);
      qx.ui.core.queue.Manager.flush();


      // button element
      var elem = this.__button.getContentElement().getDomElement();

      // mocked appearance theme defines a padding with 30px 80px
      this.assertEquals(qx.bom.element.Style.get(elem, "padding"), "30px 80px");

      // mocked color theme defines a gradient with 'orange' and 'yellow'
      this.assertNotNull(qx.bom.element.Style.get(elem, "background-image").match(/orange.*yellow/));

      // mocked decoration theme defines a border radius of 10 pixel
      this.assertEquals(qx.bom.element.Style.get(elem, "borderTopLeftRadius"), "10px");


      // button label element
      elem = this.__button.getChildControl("label").getContentElement().getDomElement();

      // mocked color theme defines red text color for button labels
      this.assertEquals(qx.bom.element.Style.get(elem, "color"), "rgb(255, 0, 0)");
    },


    testColorThemeManagerChanged : function()
    {
      qx.theme.manager.Meta.getInstance().setTheme(qx.test.theme.manager.MockColor);
      qx.ui.core.queue.Manager.flush();

      // mocked color theme defines a gradient with 'orange' and 'yellow'
      var elem = this.__button.getContentElement().getDomElement();
      this.assertNotNull(qx.bom.element.Style.get(elem, "background-image").match(/orange.*yellow/));
    },


    testDecoratorThemeManagerChanged : function()
    {
      qx.theme.manager.Meta.getInstance().setTheme(qx.test.theme.manager.MockDecoration);
      qx.ui.core.queue.Manager.flush();

      // mocked decoration theme defines a border radius of 10 pixel
      var elem = this.__button.getContentElement().getDomElement();
      this.assertEquals(qx.bom.element.Style.get(elem, "borderTopLeftRadius"), "10px");
    },


    testAppearanceThemeManagerChanged : function()
    {
      qx.theme.manager.Meta.getInstance().setTheme(qx.test.theme.manager.MockAppearance);
      qx.ui.core.queue.Manager.flush();

      // mocked appearance theme defines a padding with 30px 80px
      var elem = this.__button.getContentElement().getDomElement();
      this.assertEquals(qx.bom.element.Style.get(elem, "padding"), "30px 80px");
    }
  },

  destruct : function()
  {

  }
});
