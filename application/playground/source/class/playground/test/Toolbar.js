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
     * Martin Wittemann (martinwittemann)

************************************************************************ */
qx.Class.define("playground.test.Toolbar",
{
  extend : qx.test.ui.LayoutTestCase,

  members :
  {
    __toolbar : null,

    setUp : function()
    {
      this.__toolbar = new playground.view.Toolbar(["one", "two", "three"]);
      this.getRoot().add(this.__toolbar);
    },


    tearDown : function() {
      this.__toolbar.destroy();
    },


    testEvents : function()
    {
      var self = this;
      // test run event
      this.assertEventFired(this.__toolbar, "run", function() {
        self.__toolbar.getChildren()[0].execute();
      }, function() {});

      // test highlithing event
      this.assertEventFired(this.__toolbar, "changeHighlight", function() {
        self.__toolbar.getChildren()[2].execute();
      }, function() {});

      // test log event
      this.assertEventFired(this.__toolbar, "changeLog", function() {
        self.__toolbar.getChildren()[5].execute();
      }, function() {});

      // test shorten event
      this.assertEventFired(this.__toolbar, "shortenUrl", function() {
        self.__toolbar.getChildren()[6].execute();
      }, function() {});

      // test api event
      this.assertEventFired(this.__toolbar, "openApi", function() {
        self.__toolbar.getChildren()[7].execute();
      }, function() {});

      // test manual event
      this.assertEventFired(this.__toolbar, "openManual", function() {
        self.__toolbar.getChildren()[8].execute();
      }, function() {});
    },


    testExampleMenu : function()
    {
      var menuButton = this.__toolbar.getChildren()[1];
      var menu = menuButton.getMenu();
      this.assertEquals(menu.getChildren()[0].getLabel(), "one");
      this.assertEquals(menu.getChildren()[1].getLabel(), "two");
      this.assertEquals(menu.getChildren()[2].getLabel(), "three");
    },


    testGistMenu : function() {
      var menuButton = this.__toolbar.getChildren()[3];
      var menu = menuButton.getMenu();
      var self = this;

      // test newGist event
      this.assertEventFired(this.__toolbar, "newGist", function() {
        menu.getChildren()[2].execute();
      }, function() {});

      // test invalid gist
      this.__toolbar.invalidGist(true, "affe");
      this.assertFalse(menu.getChildren()[0]._getChildren()[1].isValid());
      this.assertEquals("affe", menu.getChildren()[0]._getChildren()[1].getInvalidMessage());

      // test show gists
      this.__toolbar.updateGists(["one [qx]", "two"], ["eins", "zwei"], [1, 2]);
      this.assertEquals("one [qx]", menu.getChildren()[4].getLabel());
      // switch filter
      menu.getChildren()[1].setValue(false);
      this.assertEquals("two", menu.getChildren()[5].getLabel());

      // test changeGist event
      this.assertEventFired(this.__toolbar, "changeGist", function() {
        menu.getChildren()[4].execute();
      }, function(e) {
        self.assertEquals(e.getData().code, "eins");
        self.assertEquals(e.getData().name, "one [qx]");
      });
    }
  }
});
