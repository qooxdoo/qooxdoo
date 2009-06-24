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

qx.Class.define("qx.test.core.Property",
{
  extend : qx.dev.unit.TestCase,

  members :
  {


    testInherited : function()
    {
      qx.Class.define("qx.Node",
      {
        extend : qx.core.Object,

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
           * @param parent {var} TODOC
           * @return {void}
           */
          applyParent : function(parent)
          {
            parent._children.push(this);
            qx.core.Property.refresh(this);
          },


          getLayoutParent : function() {
            return this.getParent();
          },


          /**
           * TODOC
           *
           * @return {var} TODOC
           */
          getChildren : function() {
            return this._children;
          }
        }
      });

      var root = new qx.Node();
      root.setColor("red");

      var child1 = new qx.Node();
      var child2 = new qx.Node();

      child2.setParent(child1);
      child1.setParent(root);

      this.debug("child2: " + child1.getColor());
      this.debug("child1: " + child2.getColor());
      this.debug("root: " + root.getColor());
    },


    testRecursive : function()
    {
      qx.Class.define("qx.Node",
      {
        extend : qx.core.Object,

        construct : function() {
          this._min = 0;
        },

        properties :
        {
          value : { apply : "applyValue" }
        },

        members :
        {

          applyValue: function(value, old) {
            if (value < this._min) {
              this.setValue(this._min);
            }
          }
        }
      });

      var root = new qx.Node();

      root.setValue(100);
      this.assertEquals(100, root.getValue());

      root.setValue(-100);
      this.assertEquals(0, root.getValue());

    },
    
    
    __testEventWithInitOldData: function() {
      // create any form widget
      var widget = new qx.ui.form.TextField(); 
      
      // test for the default (false)
      this.assertFalse(widget.getRequired(), "Default required state is wrong.");

      // check for the event
      var self = this;
      this.assertEventFired(widget, "changeRequired", function () {
        // change the required property (init value is false)
        widget.setRequired(true);
      }, function(e) {
        self.assertTrue(e.getData(), "Wrong data in the event!");
        self.assertFalse(e.getOldData(), "Wrong old data in the event!");        
      }, "Change event not fired!");      
    }
  }
});
