/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tristan Koch (tristankoch)

************************************************************************ */

qx.Class.define("qx.test.ui.form.ToggleButton",
{
  extend : qx.test.ui.LayoutTestCase,

  members :
  {
    __button : null,

    setUp : function()
    {
      var button = this.__button = new qx.ui.form.ToggleButton;
      this.getRoot().add(button);
      this.flush();
    },

    //
    // 2-state button
    //

    testInitial: function(){
      var button = this.__button;

      this.assertNotState(button, "checked");
    },

    testCheck: function(){
      var button = this.__button;
      button.setValue(true);

      this.assertState(button, "checked");
    },

    testUncheck: function() {
      var button = this.__button;
      button.setValue(false);

      this.assertNotState(button, "checked");
    },

    //
    // 3-state button
    //

    testImplicitCheckTri: function() {
      var button = this.__button;
      button.setTriState(true);
      button.setValue(null);

      // [x] checked
      // [v] undetermined
      this.assertNotState(button, "checked");
      this.assertState(button, "undetermined");
    },

    testImplicitCheckTriLater: function() {
      var button = this.__button;
      button.setValue(null);
      button.setTriState(true);

      // [x] checked
      // [v] undetermined
      this.assertNotState(button, "checked");
      this.assertState(button, "undetermined");
    },

    testCheckTri: function(){
      var button = this.__button;
      button.setTriState(true);
      button.setValue(null);
      button.setValue(true);

      // [v] checked
      // [x] undetermined
      this.assertState(button, "checked");
      this.assertNotState(button, "undetermined");
    },

    testUncheckTri: function(){
      var button = this.__button;
      button.setTriState(true);
      button.setValue(null);
      button.setValue(false);

      // [x] checked
      // [x] undetermined
      this.assertNotState(button, "checked");
      this.assertNotState(button, "undetermined");
    },

    //
    // Helper methods
    //

    assertState: function(widget, state) {
      this.assertTrue(widget.hasState(state), "State " + state + " not set");
    },

    assertNotState: function(widget, state) {
      this.assertFalse(widget.hasState(state), "State " + state + " is set");
    },

    executeOn: function(widget) {
      var that = this;
      window.setTimeout(function() {
        that.immediateExecuteOn(widget);
      })
    },

    immediateExecuteOn : function(widget) {
      widget.fireEvent("execute", qx.event.type.Event, [false, true]);
    },

    tearDown : function()
    {
      this.base(arguments);
      this.__button.destroy();
    }
  }
});
