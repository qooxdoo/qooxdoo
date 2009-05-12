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
     * Martin Wittemann (martinwittemann)

************************************************************************ */
qx.Class.define("qx.test.ui.form.Date",
{
  extend : qx.test.ui.LayoutTestCase,

  members :
  {
    __test: function(widget) {
      // check if the interface is implemented
      this.assertTrue(qx.Class.hasInterface(widget.constructor, qx.ui.form.IDateForm), "Interface is not implemented.");
      
      // just check if the method is available
      widget.resetValue();
      
      // check the getter and setter
      var date = new Date(1981, 1, 10);
      widget.setValue(date);
      this.assertEquals(date.toString(), widget.getValue().toString(), "Set or get does not work.");
      
      var self = this;
      var date2 = new Date(2009, 4, 1);
      this.assertEventFired(widget, "changeValue", function() {
        widget.setValue(date2);
      }, function(e) {
        self.assertEquals("May 1, 2009", e.getData().toString(), "Not the right data in the event.");
      }, "Event is wrong!");      
    },
    
    testDateField: function() {
     this.__test(new qx.ui.form.DateField()); 
    }
    
  }
});