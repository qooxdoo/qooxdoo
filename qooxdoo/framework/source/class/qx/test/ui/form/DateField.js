/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tristan Koch (tristankoch)

************************************************************************ */

qx.Class.define("qx.test.ui.form.DateField",
{
  extend: qx.test.ui.LayoutTestCase,

  members:
  {
    setUp: function() {
      this.__datefield = new qx.ui.form.DateField();
      this.getRoot().add(this.__datefield);
    },

    tearDown: function() {
      this.__datefield.destroy();
      this.base(arguments);
    },

    "test: setting value sets date of chooser": function() {
      var datefield = this.__datefield,
          chooser = datefield.getChildControl("list"),
          date = new Date();

      datefield.setValue(date);
      this.assertEquals(date, chooser.getValue());
    },

    "test: choosing date fills in formatted date": function() {
      var datefield = this.__datefield,
          textfield = datefield.getChildControl("textfield"),
          chooser =  datefield.getChildControl("list"),
          date = new Date(),
          dateStr = this.formatDate(date);

      chooser.setValue(date);

      // Fake "execute" on calendar popup
      datefield._onChangeDate();

      this.assertEquals(dateStr, textfield.getValue());
    },

    formatDate: function(date) {
      return this.__datefield.getDateFormat().format(date);
    },

    skip: function(msg) {
      throw new qx.dev.unit.RequirementError(null, msg);
    }

  }
});