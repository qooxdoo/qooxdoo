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

qx.Class.define("testrunner.test.core.Property",
{
  extend : testrunner.TestCase,

  members :
  {
    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    testInherited : function()
    {
      qx.Class.define("testrunner.Node",
      {
        extend : qx.core.Target,

        construct : function() {
          this._children = [];
        },

        properties :
        {
          parent : { apply : "applyParent" },
          color  : { inheritable : true }
        },

        members :
        {
          /**
           * TODOC
           *
           * @type member
           * @param parent {var} TODOC
           * @return {void}
           */
          applyParent : function(parent)
          {
            parent._children.push(this);
            qx.core.Property.refresh(this);
          },


          /**
           * TODOC
           *
           * @type member
           * @return {var} TODOC
           */
          getChildren : function() {
            return this._children;
          }
        }
      });

      var root = new testrunner.Node();
      root.setColor("red");

      var child1 = new testrunner.Node();
      var child2 = new testrunner.Node();

      child2.setParent(child1);
      child1.setParent(root);

      this.debug("child2: " + child1.getColor());
      this.debug("child1: " + child2.getColor());
      this.debug("root: " + root.getColor());
    }
  }
});
