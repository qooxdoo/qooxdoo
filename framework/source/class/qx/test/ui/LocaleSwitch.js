/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/*
#require qx.locale.data.de_DE
#require qx.locale.data.C
*/

qx.Class.define("qx.test.ui.LocaleSwitch",
{
  extend : qx.test.ui.LayoutTestCase,
  include : qx.locale.MTranslation,


  construct : function()
  {
    var manager = qx.locale.Manager.getInstance();

    // add dummy translations
    manager.addTranslation("en_QX", {
      "test one": "test one",
      "test two": "test two",
      "test Hello %1!": "test Hello %1!",
      "test Jonny": "test Jonny",
      "test One car": "test One car",
      "test %1 cars": "test %1 cars"
    });
    manager.addTranslation("de_QX", {
      "test one": "Eins",
      "test two": "Zwei",
      "test Hello %1!": "Servus %1!",
      "test Jonny": "Jonathan",
      "test One car": "Ein Auto",
      "test %1 cars": "%1 Autos"
    });
    manager.setLocale("en_QX");
  },


  members :
  {
    testLabel : function()
    {
      var manager = qx.locale.Manager.getInstance();

      var label = new qx.ui.basic.Label(this.tr("test one"));
      this.getRoot().add(label);

      this.assertEquals("test one", label.getContent());
      manager.setLocale("de_QX");
      this.assertEquals("Eins", label.getContent());
      manager.setLocale("en_QX");

      label.setContent(this.tr("test Hello %1!", this.tr("test Jonny")));
      this.assertEquals("test Hello test Jonny!", label.getContent());
      manager.setLocale("de_QX");
      this.assertEquals("Servus Jonathan!", label.getContent());

      // de -> en
      label.setContent(this.tr("test two"));
      this.assertEquals("Zwei", label.getContent());
      manager.setLocale("en_QX");
      this.assertEquals("test two", label.getContent());

      this.getRoot().remove(label);
      label.dispose();
    }
  }
});
