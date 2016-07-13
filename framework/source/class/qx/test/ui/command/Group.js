/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)
     * Mustafa Sak (msak)

************************************************************************ */
qx.Class.define("qx.test.ui.command.Group",
{
  extend : qx.dev.unit.TestCase,
  include : qx.dev.unit.MMock,

  members :
  {
    testAddingAndActivating : function()
    {
      var handler = this.spy();
      var group = new qx.ui.command.Group();
      var cmd = new qx.ui.command.Command("Meta+T");

      cmd.addListener("execute", handler);
      this.assertTrue(group.add("test", cmd));

      group.setActive(false);
      cmd.execute();
      this.assertCallCount(handler, 0);

      group.setActive(true);
      cmd.execute();
      this.assertCallCount(handler, 1);
    },


    testHasCommand : function()
    {
      var handler = this.spy();
      var group = new qx.ui.command.Group();
      var cmd = new qx.ui.command.Command("Meta+T");

      this.assertTrue(group.add("test", cmd));

      this.assertTrue(group.has("test"), "The command added with key 'test' must be registered.");
      this.assertFalse(group.has("foo"), "The command 'foo' must not be registered.");
    },


    testRemoveCommand : function()
    {
      var group = new qx.ui.command.Group();
      var cmd = new qx.ui.command.Command("Meta+T");

      this.assertTrue(group.add("test", cmd));
      this.assertInstance(group.get("test"), qx.ui.command.Command,
        "Returned value is not an instance of qx.ui.command.Command."
      );

      this.assertInstance(group.remove("test"), qx.ui.command.Command);

      this.assertNull(group.get("test"),
        "The returned value is not null. We expected null after removing " +
        "the command from group."
      );
    }
  }
});
