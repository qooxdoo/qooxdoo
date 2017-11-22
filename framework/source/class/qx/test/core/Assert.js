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
     * Fabian Jakobs (fjakobs)

************************************************************************ */
qx.Class.define("qx.test.core.Assert",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    testQxWidget : function()
    {
      // working widget
      var widget = new qx.ui.core.Widget();
      this.assertQxWidget(widget);
      widget.dispose();

      var comp = new qx.ui.container.Composite();
      this.assertQxWidget(comp);
      comp.dispose();

      // not working
      this.assertException(function() {
        qx.core.Assert.assertQxWidget(true);
      }, qx.core.AssertionError, null, "1");

      this.assertException(function() {
        qx.core.Assert.assertQxWidget({});
      }, qx.core.AssertionError, null, "2");

      var o = new qx.core.Object();
      this.assertException(function() {
        qx.core.Assert.assertQxWidget(o);
      }, qx.core.AssertionError, null, "3");
      o.dispose();
    },


    testQxObject : function()
    {
      // working widget
      var o = new qx.core.Object();
      this.assertQxObject(o);
      o.dispose();

      var widget = new qx.ui.core.Widget();
      this.assertQxObject(widget);
      widget.dispose();

      // not working
      this.assertException(function() {
        qx.core.Assert.assertQxObject(true);
      }, qx.core.AssertionError, null, "1");

      this.assertException(function() {
        qx.core.Assert.assertQxObject({});
      }, qx.core.AssertionError, null, "2");

      this.assertException(function() {
        qx.core.Assert.assertQxObject(new qx.type.BaseString());
      }, qx.core.AssertionError, null, "2");
    },


    testCSSColor : function()
    {
      // working
      this.assertCssColor("red", "red");
      this.assertCssColor("black", "black");
      this.assertCssColor("aqua", "rgb(0,255,255)");
      this.assertCssColor("rgb(159,123,147)", "rgb(159,123,147)");

      // not working
      this.assertException(function() {
        qx.core.Assert.assertCssColor("red", true);
      }, qx.core.AssertionError, null, "1");

      this.assertException(function() {
        qx.core.Assert.assertCssColor("red", "reed");
      }, qx.core.AssertionError, null, "2");

      this.assertException(function() {
        qx.core.Assert.assertCssColor("red", "rgb(15,45,56)");
      }, qx.core.AssertionError, null, "3");

      // non existing color
      this.assertException(function() {
        qx.core.Assert.assertCssColor("grey", "grey");
      }, Error, null, "4");
    },


    testAssertElement : function()
    {
      // working
      this.assertElement(document.body);
      this.assertElement(document.createElement("div"));

      // not working
      this.assertException(function() {
        qx.core.Assert.assertElement("test");
      }, qx.core.AssertionError, null, "1");

      this.assertException(function() {
        qx.core.Assert.assertElement({});
      }, qx.core.AssertionError, null, "2");

      this.assertException(function() {
        qx.core.Assert.assertElement(true);
      }, qx.core.AssertionError, null, "2");

      this.assertException(function() {
        qx.core.Assert.assertElement(window);
      }, qx.core.AssertionError, null, "4");

    },

    testAssertArgumentsCount : function() {
      this.assertException(function() {
        var f = function(a, b) {
          qx.core.Assert.assertArgumentsCount(arguments, 2, 2);
        };
        f("1", "2", "3", "4", "5");
      }, qx.core.AssertionError, /but found '5' arguments\./g);
    },


    testAssertEventFired : function()
    {
      //  assertEventFired : function(obj, event, invokeFunc, listenerFunc, msg)
      var obj = new qx.core.Object();

      this.assertEventFired(obj, "xyz", function() {
        this.fireEvent("xyz");
      });

      this.assertException(function() {
        qx.core.Assert.assertEventFired(obj, "xyz", function() {
          this.fireEvent("xyz1");
        });
      }, qx.core.AssertionError);
    },

    testAssertEqualsFloat : function()
    {
      this.assertEqualsFloat(1.0, 1.0);
      this.assertEqualsFloat(0.3, 0.1 + 0.2);

      this.assertException(function() {
        qx.core.Assert.assertEqualsFloat(1.0, 1.0000001);
      }, qx.core.AssertionError);

      this.assertException(function() {
        qx.core.Assert.assertEqualsFloat(1.0, 0.0000009);
      }, qx.core.AssertionError);

      // test error message
      this.assertException(function() {
          qx.core.Assert.assertEqualsFloat(1.5, 1.6);
        }, qx.core.AssertionError,
        "Expected '1.5' to be equal with '1.6'!"
      );
    },

    testAssertNotEqualsFloat : function()
    {
      this.assertNotEqualsFloat(1.0, 1.0000001);
      this.assertNotEqualsFloat(1.5, 1.6);
      this.assertNotEqualsFloat(1.0, 0.0000009);

      this.assertException(function() {
        qx.core.Assert.assertNotEqualsFloat(1.0, 1.0);
      }, qx.core.AssertionError);

      this.assertException(function() {
        qx.core.Assert.assertNotEqualsFloat(0.3, 0.1 + 0.2);
      }, qx.core.AssertionError);

      // test error message
      this.assertException(function() {
        qx.core.Assert.assertNotEqualsFloat(1.5, 1.5);
        }, qx.core.AssertionError,
        "Expected '1.5' to be not equal with '1.5'!"
      );
    }
  }
});
