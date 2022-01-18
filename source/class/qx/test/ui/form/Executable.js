/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
qx.Class.define("qx.test.ui.form.Executable", {
  extend: qx.test.ui.LayoutTestCase,

  members: {
    __test(widget) {
      // check if the interface is implemented
      this.assertTrue(
        qx.Class.hasInterface(widget.constructor, qx.ui.form.IExecutable),
        "Interface is not implemented."
      );

      var command = new qx.ui.command.Command();

      // check if the setter works
      widget.setCommand(command);
      this.assertEquals(
        command,
        widget.getCommand(),
        "Setter / Getter not working."
      );

      // check the event and execute method
      this.assertEventFired(
        widget,
        "execute",
        function () {
          widget.execute();
        },
        function (e) {
          // do nothing
        },
        "Execute event on the widget is wrong! (1)"
      );

      this.assertEventFired(
        command,
        "execute",
        function () {
          widget.execute();
        },
        function (e) {
          // do nothing
        },
        "Execute event on the command is wrong! (2)"
      );

      this.assertEventFired(
        command,
        "execute",
        function () {
          command.execute();
        },
        function (e) {
          // do nothing
        },
        "Execute event on the command is wrong! (3)"
      );

      this.assertEventFired(
        widget,
        "execute",
        function () {
          command.execute();
        },
        function (e) {
          // do nothing
        },
        "Execute event on the widget is wrong! (4)"
      );

      // test removing of the command
      widget.setCommand(null);

      // check if the listener has been removed
      this.assertEventNotFired(
        widget,
        "execute",
        function () {
          command.execute();
        },
        function (e) {
          // do nothing
        },
        "Execute event on the widget is wrong! (5)"
      );

      command.dispose();
      widget.destroy();
    },

    testToggleButton() {
      this.__test(new qx.ui.form.ToggleButton());
    },

    testCheckBox() {
      this.__test(new qx.ui.form.CheckBox());
    },

    testButton() {
      this.__test(new qx.ui.form.Button());
    },

    testRepeatButton() {
      this.__test(new qx.ui.form.RepeatButton());
    },

    testMenuButton() {
      this.__test(new qx.ui.form.MenuButton());
    },

    testRadioButton() {
      this.__test(new qx.ui.form.RadioButton());
    },

    testToolbarButton() {
      this.__test(new qx.ui.toolbar.Button());
    },

    testSplitButton() {
      this.__test(new qx.ui.toolbar.SplitButton());
    },

    testMenuCheckBox() {
      this.__test(new qx.ui.menu.CheckBox());
    },

    testMenuRadioButton() {
      this.__test(new qx.ui.menu.RadioButton());
    },

    testButtonInMenu() {
      this.__test(new qx.ui.menu.Button());
    },

    testCheckGroupBox() {
      this.__test(new qx.ui.groupbox.CheckGroupBox());
    },

    testRadioGroupBox() {
      this.__test(new qx.ui.groupbox.RadioGroupBox());
    },

    testDateChooser() {
      this.__test(new qx.ui.control.DateChooser());
    }
  }
});
