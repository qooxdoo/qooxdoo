/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Schmidt (chris_schmidt)

************************************************************************ */
qx.Class.define("qx.test.ui.core.Blocker",
{
  extend : qx.test.ui.LayoutTestCase,

  members :
  {
    __blocker : null,

    setUp : function() {
      this.base(arguments);

      this.__blocker = new qx.ui.core.Blocker(this.getRoot());
    },

    tearDown : function() {
      this.base(arguments);

      this.__blocker.dispose();
    },

    testBlocker : function()
    {
      this.__blocker.block();
      this.flush();
      this.assertTrue(this.__blocker.isBlocked());

      this.__blocker.unblock();
      this.flush();
      this.assertFalse(this.__blocker.isBlocked());
    },

    testBlockerTwice : function()
    {
      this.__blocker.block();
      this.flush();
      this.assertTrue(this.__blocker.isBlocked());

      this.__blocker.block();
      this.flush();
      this.assertTrue(this.__blocker.isBlocked());

      this.__blocker.unblock();
      this.flush();
      this.assertTrue(this.__blocker.isBlocked());

      this.__blocker.unblock();
      this.flush();
      this.assertFalse(this.__blocker.isBlocked());
    },

    testForceUnblock : function()
    {
      this.__blocker.block();
      this.flush();
      this.assertTrue(this.__blocker.isBlocked());

      this.__blocker.block();
      this.flush();
      this.assertTrue(this.__blocker.isBlocked());

      this.__blocker.forceUnblock();
      this.flush();
      this.assertFalse(this.__blocker.isBlocked());
    },

    testContentBlocker : function()
    {
      this.__blocker.blockContent(100);
      this.flush();
      this.assertTrue(this.__blocker.isContentBlocked());

      this.__blocker.unblockContent();
      this.flush();
      this.assertFalse(this.__blocker.isContentBlocked());
    },

    testContentBlockerTwice : function()
    {
      this.__blocker.blockContent(100);
      this.flush();
      this.assertTrue(this.__blocker.isContentBlocked());

      this.__blocker.blockContent(100);
      this.flush();
      this.assertTrue(this.__blocker.isContentBlocked());

      this.__blocker.unblockContent();
      this.flush();
      this.assertTrue(this.__blocker.isContentBlocked());

      this.__blocker.unblockContent();
      this.flush();
      this.assertFalse(this.__blocker.isContentBlocked());
    },

    testForceUnblockContent : function()
    {
      this.__blocker.blockContent(100);
      this.flush();
      this.assertTrue(this.__blocker.isContentBlocked());

      this.__blocker.blockContent(100);
      this.flush();
      this.assertTrue(this.__blocker.isContentBlocked());

      this.__blocker.forceUnblockContent();
      this.flush();
      this.assertFalse(this.__blocker.isContentBlocked());
    }
  }
});