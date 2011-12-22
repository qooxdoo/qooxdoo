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

      // test samples event
      this.assertEventFired(this.__toolbar, "changeSample", function() {
        self.__toolbar.getChildren()[1].execute();
      }, function() {});

      // test highlithing event
      this.assertEventFired(this.__toolbar, "changeHighlight", function() {
        self.__toolbar.getChildren()[2].execute();
      }, function() {});

      // test log event
      this.assertEventFired(this.__toolbar, "changeLog", function() {
        self.__toolbar.getChildren()[4].execute();
      }, function() {});

      // test shorten event
      this.assertEventFired(this.__toolbar, "shortenUrl", function() {
        self.__toolbar.getChildren()[5].execute();
      }, function() {});

      // test api event
      this.assertEventFired(this.__toolbar, "openApi", function() {
        self.__toolbar.getChildren()[6].execute();
      }, function() {});

      // test manual event
      this.assertEventFired(this.__toolbar, "openManual", function() {
        self.__toolbar.getChildren()[7].execute();
      }, function() {});
    }
  }
});
