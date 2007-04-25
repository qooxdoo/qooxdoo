
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
      root.setTextColor("red");

      var child1 = new qxunit.Node();
      var child2 = new qxunit.Node();

      child2.setParent(child1);
      child1.setParent(root);

      this.debug("child2: " + child1.getTextColor());
      this.debug("child1: " + child2.getTextColor());
      this.debug("root: " + root.getTextColor());

    }

  }

});