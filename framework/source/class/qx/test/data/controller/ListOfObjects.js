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
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * @ignore(qx.demo.Kid, qx.demo.Parent)
 */

qx.Class.define("qx.test.data.controller.ListOfObjects",
{
  extend : qx.test.ui.LayoutTestCase,
  include : qx.dev.unit.MMock,

  members :
  {

    __list: null,
    __controller: null,
    __data: null,
    __model : null,

    setUp : function()
    {
      // prevent the icon laod error with this stub
      this.stub(qx.io.ImageLoader, "load");

      this.__list = new qx.ui.form.List();
    },


    tearDown : function()
    {
      this.__controller ? this.__controller.dispose() : null;
      this.__model ? this.__model.dispose() : null;
      for (var i=0; i<this.__list.getChildren().length; i++) {
        this.__list.getChildren()[i].destroy();
      }
      this.__list.destroy();
      this.flush();
      this.__controller = null;
      this.__model = null;
      this.__data = null;
      this.base(arguments);
      // clear the stub
      this.getSandbox().restore();
    },


    testBug1947: function() {
      qx.Class.define("qx.demo.Kid",
      {
        extend : qx.core.Object,

        properties :
        {
          name :
          {
            check : "String",
            event : "changeName",
            init : null
          }
        }
      });

      var kid = new qx.demo.Kid();
      qx.Class.define("qx.demo.Parent",
      {
        extend : qx.core.Object,
        construct : function()
        {
          this.base(arguments);
          this.setKid(kid);
        },

        properties :
        {
          name :
          {
            check : "String",
            event : "changeName",
            init : null
          },
          kid :
          {
            check : "qx.demo.Kid",
            event : "changeKid"
          }
        }
      });

      var parentA = new qx.demo.Parent();
      parentA.setName("parentA");
      parentA.getKid().setName("kidA");
      var parentB = new qx.demo.Parent();
      parentB.setName("parentB");
      parentB.getKid().setName("kidB");
      var parents = new qx.data.Array();
      parents.push(parentA);
      parents.push(parentB);

      var list = new qx.ui.form.List();
      var ctrl = new qx.data.controller.ListOfObjects(parents, list, "name");

      var label = new qx.ui.basic.Label();
      label.setDecorator("main");

      ctrl.bind("selection[0].Kid.Name", label, "value");

      ctrl.getSelection().push(parentA);

      parentA.dispose();
      parentB.dispose();
      kid.dispose();
      list.dispose();
      ctrl.dispose();
      label.dispose();
      parents.dispose();
    },


    testBug1988: function() {
      qx.Class.define("qx.demo.Kid",
      {
        extend : qx.core.Object,

        properties :
        {
          name :
          {
            check : "String",
            event : "changeName",
            init : null,
            nullable : true
          }
        }
      });

      //var kid = new qx.demo.Kid();
      qx.Class.define("qx.demo.Parent",
      {
        extend : qx.core.Object,
        construct : function()
        {
          this.base(arguments);
          this.setKid(new qx.demo.Kid());
        },

        properties :
        {
          name :
          {
            check : "String",
            event : "changeName",
            init : null
          },
          kid :
          {
            check : "qx.demo.Kid",
            event : "changeKid"
          }
        }
      });

      var parentA = new qx.demo.Parent();
      parentA.setName("parentA");
      parentA.getKid().setName("kidA");


      var parentB = new qx.demo.Parent();
      parentB.setName("parentB");
      //parentB.getKid().setName("kidB");


      var parents = new qx.data.Array();
      parents.push(parentA);
      parents.push(parentB);

      var list = new qx.ui.form.List();
      var ctrl = new qx.data.controller.ListOfObjects(parents, list, "name");

      var label = new qx.ui.basic.Label();

      ctrl.bind("selection[0].kid.name", label, "value");

      // select the first child of the list
      list.addToSelection(list.getChildren()[0]);
      // check the label
      this.assertEquals("kidA", label.getValue(), "Wrong name in the label.");

      // select the second label
      list.addToSelection(list.getChildren()[1]);
      this.assertNull(label.getValue(), "Label has not been reseted.");

      parentA.getKid().dispose();
      parentA.dispose();
      parentB.getKid().dispose();
      parentB.dispose();
      list.dispose();
      ctrl.dispose();
      label.dispose();
      parents.dispose();
    }
  }
});
