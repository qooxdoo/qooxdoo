/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (danielwagner)

************************************************************************ */

/*
#require qx.locale.data.de_DE
#require qx.locale.data.C
*/

qx.Class.define("qx.test.mobile.LocaleSwitch",
{
  extend : qx.test.mobile.MobileTestCase,
  include : qx.locale.MTranslation,


  construct : function()
  {
    this.base(arguments);
    var manager = this.manager = qx.locale.Manager.getInstance();

    // add dummy translations
    manager.addTranslation("en_QX", {
      "test one": "test one",
      "test two": "test two",
      "test Hello %1!": "test Hello %1!",
      "test Jonny": "test Jonny"
    });
    manager.addTranslation("de_QX", {
      "test one": "Eins",
      "test two": "Zwei",
      "test Hello %1!": "Servus %1!",
      "test Jonny": "Jonathan"
    });
  },



  members :
  {
    setUp : function() {
      this.manager.setLocale("en_QX");
    },


    testLabel : function()
    {
      var manager = qx.locale.Manager.getInstance();

      var label = new qx.ui.mobile.basic.Label(this.tr("test one"));
      this.getRoot().add(label);

      this.assertEquals("test one", label.getValue());
      manager.setLocale("de_QX");
      this.assertEquals("Eins", label.getValue());
      manager.setLocale("en_QX");

      label.setValue(this.tr("test Hello %1!", this.tr("test Jonny")));
      this.assertEquals("test Hello test Jonny!", label.getValue());
      manager.setLocale("de_QX");
      this.assertEquals("Servus Jonathan!", label.getValue());

      // de -> en
      label.setValue(this.tr("test two"));
      this.assertEquals("Zwei", label.getValue());
      manager.setLocale("en_QX");
      this.assertEquals("test two", label.getValue());

      label.destroy();
    }
  }
});
