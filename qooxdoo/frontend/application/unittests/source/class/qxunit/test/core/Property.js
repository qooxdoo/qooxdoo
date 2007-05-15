/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("qxunit.test.core.Property", {

  extend: qxunit.TestCase,

  members: {

    testInherited : function()
    {

      qx.Class.define("qxunit.Node", {
        extend : qx.core.Target,

        construct : function() {
          this._children = [];
        },


        properties : {
          parent : { apply : "applyParent"},
          color : { inheritable: true }
        },

        members : {

          applyParent : function(parent)
          {
            parent._children.push(this);
            qx.core.Property.refresh(this);
          },

          getChildren : function() {
            return this._children;
          }

        }
      });

      var root = new qxunit.Node();
      root.setColor("red");

      var child1 = new qxunit.Node();
      var child2 = new qxunit.Node();

      child2.setParent(child1);
      child1.setParent(root);

      this.debug("child2: " + child1.getColor());
      this.debug("child1: " + child2.getColor());
      this.debug("root: " + root.getColor());

    }

  }

});