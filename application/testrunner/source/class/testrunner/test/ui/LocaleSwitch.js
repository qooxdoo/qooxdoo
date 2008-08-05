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

qx.Class.define("testrunner.test.ui.LocaleSwitch",
{
  extend : testrunner.test.ui.LayoutTestCase,
  include : qx.locale.MTranslation,


  construct : function()
  {
    var manager = qx.locale.Manager.getInstance();

    // add dummy translations
    manager.addTranslation("en_QX", {
      "one": "one",
      "two": "two",
      "Hello %1!": "Hello %1!",
      "Jony": "Jony",
      "One car": "One car",
      "%1 cars": "%1 cars"
    });
    manager.addTranslation("de_QX", {
      "one": "Eins",
      "two": "Zwei",
      "Hello %1!": "Servus %1!",
      "Jony": "Jonathan",
      "One car": "One car",
      "%1 cars": "%1 cars"
    });
    manager.setLocale("en_QX");
  },


  members :
  {
    testLabel : function()
    {
      var manager = qx.locale.Manager.getInstance();

      var label = new qx.ui.basic.Label(this.tr("one"));
      this.getRoot().add(label);

      this.assertEquals("one", label.getContent());
      manager.setLocale("de_QX");
      this.assertEquals("Eins", label.getContent());
      manager.setLocale("en_QX");

      label.setContent(this.tr("Hello %1!", this.tr("Jony")));
      this.assertEquals("Hello Jony!", label.getContent());
      manager.setLocale("de_QX");
      this.assertEquals("Servus Jonathan!", label.getContent());

      // de -> en
      label.setContent(this.tr("two"));
      this.assertEquals("Zwei", label.getContent());
      manager.setLocale("en_QX");
      this.assertEquals("two", label.getContent());

      this.getRoot().remove(label);
      label.dispose();
    }
  }
});
