/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top_-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("qx.test.Property",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    /**
     * TODOC
     *
     * @return {void}
     */
    testBasic : function()
    {
      this.debug("Exec: testBasic");

      this.assertNotUndefined(qx.core.Property);

      // Check instance
      var inst = new qx.test.PropertyHelper;
      this.assertNotUndefined(inst, "instance");

      // Public setter/getter etc.
      this.assertFunction(inst.setPublicProp, "public setter");
      this.assertFunction(inst.getPublicProp, "public getter");
      this.assertFunction(inst.resetPublicProp, "public reset");
      this.assertUndefined(inst.togglePublicProp, "public toggler");
      this.assertUndefined(inst.setThemedPublicProp, "public themed");

      // Boolean property
      this.assertFunction(inst.toggleBooleanProp, "boolean toggler");

      this.debug("Done: testBasic");
    },


    /**
     * TODOC
     *
     * @return {void}
     */
    testBuiltinTypes : function()
    {
      this.debug("Exec: testBuiltinTypes");

      this.assertNotUndefined(qx.core.Property);

      // Check instance
      var inst = new qx.test.PropertyHelper;
      this.assertNotUndefined(inst, "instance");

      // Type checks: String
      this.assertIdentical("Hello", inst.setStringProp("Hello"), "string property, set");
      this.assertIdentical("Hello", inst.getStringProp(), "string property, get");

      // Type checks: Boolean, true
      this.assertIdentical(true, inst.setBooleanProp(true), "boolean property, set");
      this.assertIdentical(true, inst.getBooleanProp(), "boolean property, get");

      // Type checks: Boolean, false
      this.assertIdentical(false, inst.setBooleanProp(false), "boolean property, set");
      this.assertIdentical(false, inst.getBooleanProp(), "boolean property, get");

      // Type checks: Number, int
      this.assertIdentical(3, inst.setNumberProp(3), "number property, set");
      this.assertIdentical(3, inst.getNumberProp(), "number property, get");

      // Type checks: Number, float
      this.assertIdentical(3.14, inst.setNumberProp(3.14), "number property, set");
      this.assertIdentical(3.14, inst.getNumberProp(), "number property, get");

      // Type checks: Object, inline
      var obj = {};
      this.assertIdentical(obj, inst.setObjectProp(obj), "object property, set");
      this.assertIdentical(obj, inst.getObjectProp(), "object property, get");

      // Type checks: Object, new
      var obj = new Object;
      this.assertIdentical(obj, inst.setObjectProp(obj), "object property, set");
      this.assertIdentical(obj, inst.getObjectProp(), "object property, get");

      // Type checks: Array, inline
      var arr = [];
      this.assertIdentical(arr, inst.setArrayProp(arr), "array property, set");
      this.assertIdentical(arr, inst.getArrayProp(), "array property, get");

      // Type checks: Array, new
      var arr = new Array;
      this.assertIdentical(arr, inst.setArrayProp(arr), "array property, set");
      this.assertIdentical(arr, inst.getArrayProp(), "array property, get");

      this.debug("Done: testBuiltinTypes");
    },


    /**
     * TODOC
     *
     * @return {void}
     */
    testInheritance : function()
    {
      this.debug("Exec: testInheritance");

      this.assertNotUndefined(qx.core.Property);

      var pa = new qx.test.Layout;
      var ch1 = new qx.test.Layout;
      var ch2 = new qx.test.Layout;
      var ch3 = new qx.test.Layout;
      var chh1 = new qx.test.Layout;
      var chh2 = new qx.test.Layout;
      var chh3 = new qx.test.Layout;

      pa.add(ch1)
      pa.add(ch2);
      pa.add(ch3);
      ch2.add(chh1);
      ch2.add(chh2);
      ch2.add(chh3);

      // Simple: Only inheritance, no local values
      this.assertTrue(pa.setEnabled_(true), "a1");
      this.assertTrue(pa.getEnabled_(), "a2");
      this.assertTrue(ch1.getEnabled_(), "a3");
      this.assertTrue(ch2.getEnabled_(), "a4");
      this.assertTrue(ch3.getEnabled_(), "a5");
      this.assertTrue(chh1.getEnabled_(), "a6");
      this.assertTrue(chh2.getEnabled_(), "a7");
      this.assertTrue(chh3.getEnabled_(), "a8");

      // Enabling local value
      this.assertFalse(ch2.setEnabled_(false), "b1");
      this.assertFalse(ch2.getEnabled_(), "b2");
      this.assertFalse(chh1.getEnabled_(), "b3");
      this.assertFalse(chh2.getEnabled_(), "b4");
      this.assertFalse(chh3.getEnabled_(), "b5");

      // Reset local value
      this.assertUndefined(ch2.resetEnabled_(), "c1");
      this.assertTrue(ch2.getEnabled_(), "c2");
      this.assertTrue(chh1.getEnabled_(), "c3");
      this.assertTrue(chh2.getEnabled_(), "c4");
      this.assertTrue(chh3.getEnabled_(), "c5");

      this.debug("Done: testInheritance");
    },


    /**
     * TODOC
     *
     * @return {void}
     */
    testParent : function()
    {
      var pa = new qx.test.Layout;
      var ch1 = new qx.test.Layout;
      var ch2 = new qx.test.Layout;
      var ch3 = new qx.test.Layout;

      this.assertIdentical(pa.getEnabled_(), null, "d1");
      this.assertIdentical(ch1.getEnabled_(), null, "d2");
      this.assertIdentical(ch2.getEnabled_(), null, "d3");
      this.assertIdentical(ch3.getEnabled_(), null, "d4");

      pa.add(ch1);

      this.assertTrue(pa.setEnabled_(true), "a1");  // ch1 gets enabled_, too
      this.assertFalse(ch3.setEnabled_(false), "a2");

      this.assertTrue(pa.getEnabled_(), "b1");
      this.assertTrue(ch1.getEnabled_(), "b2");
      this.assertIdentical(ch2.getEnabled_(), null, "b3");
      this.assertFalse(ch3.getEnabled_(), "b4");

      pa.add(ch2);  // make ch2 enabled_ through inheritance
      pa.add(ch3);  // keep ch2 disabled, user value has higher priority

      this.assertTrue(pa.getEnabled_(), "c1");
      this.assertTrue(ch1.getEnabled_(), "c2");
      this.assertTrue(ch2.getEnabled_(), "c3");
      this.assertFalse(ch3.getEnabled_(), "c4");
    },


    /**
     * TODOC
     *
     * @return {void}
     */
    testMultiValues : function()
    {
      this.debug("Exec: testMultiValues");

      this.assertNotUndefined(qx.core.Property);

      // Check instance
      var inst = new qx.test.PropertyHelper;
      this.assertNotUndefined(inst, "instance");

      // Check init value
      this.assertIdentical(inst.getInitProp(), "foo", "a1");
      this.assertIdentical(inst.setInitProp("hello"), "hello", "a2");
      this.assertIdentical(inst.getInitProp(), "hello", "a3");
      this.assertIdentical(inst.resetInitProp(), undefined, "a4");
      this.assertIdentical(inst.getInitProp(), "foo", "a5");

      // Check null value
      this.assertIdentical(inst.getNullProp(), "bar", "b1");
      this.assertIdentical(inst.setNullProp("hello"), "hello", "b2");
      this.assertIdentical(inst.getNullProp(), "hello", "b3");
      this.assertIdentical(inst.setNullProp(null), null, "b4");
      this.assertIdentical(inst.getNullProp(), null, "b5");
      this.assertIdentical(inst.resetNullProp(), undefined, "b6");
      this.assertIdentical(inst.getNullProp(), "bar", "b7");

      // Check appearance value
      this.assertIdentical(inst.setThemedAppearanceProp("black"), "black", "c1");
      this.assertIdentical(inst.getAppearanceProp(), "black", "c2");
      this.assertIdentical(inst.setAppearanceProp("white"), "white", "c3");
      this.assertIdentical(inst.getAppearanceProp(), "white", "c4");
      this.assertIdentical(inst.resetAppearanceProp(), undefined, "c5");
      this.assertIdentical(inst.getAppearanceProp(), "black", "c6");

      // No prop
      this.assertIdentical(inst.getNoProp(), null, "c1");

      this.debug("Done: testMultiValues");
    },

    testInitApply : function()
    {
      var inst = new qx.test.PropertyHelper;
      this.assertNotUndefined(inst, "instance");

      this.assertUndefined(inst.lastApply);
      inst.setInitApplyProp1("juhu"); //set to init value
      this.assertJsonEquals(["juhu", "juhu"], inst.lastApply);
      inst.lastApply = undefined;

      inst.setInitApplyProp1("juhu"); // set to same value
      this.assertUndefined(inst.lastApply); // apply must not be called
      inst.lastApply = undefined;

      inst.setInitApplyProp1("kinners"); // set to new value
      this.assertJsonEquals(["kinners", "juhu"], inst.lastApply);
      inst.lastApply = undefined;

      this.assertUndefined(inst.lastApply);
      inst.setInitApplyProp2(null); //set to init value
      this.assertJsonEquals([null, null], inst.lastApply);
      inst.lastApply = undefined;
    },

    testInit : function()
    {
      // now test the init functions
      var self = this;
      var inst = new qx.test.PropertyHelper(function(inst) {

        inst.initInitApplyProp1();
        self.assertJsonEquals(["juhu", null], inst.lastApply);
        inst.lastApply = undefined;

        inst.initInitApplyProp2();
        self.assertJsonEquals([null, null], inst.lastApply);
        inst.lastApply = undefined;
      });
      this.assertNotUndefined(inst, "instance");
    },

    testDefinesThanSubClassWithInterface : function()
    {
      // see bug #2162 for details
      delete qx.test.A;
      delete qx.test.B;
      delete qx.test.IForm;

      qx.Class.define("qx.test.A",
      {
        extend : qx.core.Object,

        properties : {
          enabled : {}
        }
      });

      a = new qx.test.A();

      qx.Interface.define("qx.test.IForm",
      {
        members : {
          setEnabled : function(value) {}
        }
      });

      qx.Class.define("qx.test.B",
      {
        extend : qx.test.A,
        implement : qx.test.IForm
      });

      b = new qx.test.B();
      b.setEnabled(true);
    },
    
    
    testPropertyNamedClassname : function() 
    {
      qx.Class.define("qx.test.clName", {
        extend : qx.core.Object,
        properties : {
          classname : {}
        }
      });
      
      delete qx.test.clName;
    },
    
    
    testWrongPropertyDefinitions : function() 
    { 
      if (qx.core.Variant.isSet("qx.debug", "on")) {
        // date
        this.assertException(function() {
          qx.Class.define("qx.test.clName", {
            extend : qx.core.Object,
            properties : new Date()
          });
        }, Error, new RegExp(".*Invalid.*"), "123");
        delete qx.test.clName;
              
        // array
        this.assertException(function() {
          qx.Class.define("qx.test.clName", {
            extend : qx.core.Object,
            properties : [1,2,3]
          });
        }, Error, new RegExp(".*Invalid.*"), "123");
        delete qx.test.clName;
                
        // qooxdoo class
        this.assertException(function() {
          qx.Class.define("qx.test.clName", {
            extend : qx.core.Object,
            properties : new qx.core.Object()
          });
        }, Error, new RegExp(".*Invalid.*"), "123");
        delete qx.test.clName;
      
        // RegExp
        this.assertException(function() {
          qx.Class.define("qx.test.clName", {
            extend : qx.core.Object,
            properties : new RegExp()
          });
        }, Error, new RegExp(".*Invalid.*"), "123");
        delete qx.test.clName;
        
        // null
        this.assertException(function() {
          qx.Class.define("qx.test.clName", {
            extend : qx.core.Object,
            properties : null
          });
        }, Error, new RegExp(".*Invalid.*"), "123");
        delete qx.test.clName;
        
        // boolean
        this.assertException(function() {
          qx.Class.define("qx.test.clName", {
            extend : qx.core.Object,
            properties : true
          });
        }, Error, new RegExp(".*Invalid.*"), "123");
        delete qx.test.clName;
        
        // number
        this.assertException(function() {
          qx.Class.define("qx.test.clName", {
            extend : qx.core.Object,
            properties : 123
          });
        }, Error, new RegExp(".*Invalid.*"), "123");
        delete qx.test.clName;
      } 
    }
  }
});

qx.Class.define("qx.test.PropertyHelper",
{
  extend : qx.core.Object,

  construct : function(delegate) {
    this.base(arguments);

    if (delegate) {
      delegate(this);
    }
  },

  properties :
  {

    // protection
    publicProp : { nullable : true },

    // types
    stringProp :
    {
      check    : "String",
      nullable : true
    },

    booleanProp :
    {
      check    : "Boolean",
      nullable : true
    },

    numberProp :
    {
      check    : "Number",
      nullable : true
    },

    objectProp :
    {
      check    : "Object",
      nullable : true
    },

    arrayProp :
    {
      check    : "Array",
      nullable : true
    },

    mapProp :
    {
      check    : "Map",
      nullable : true
    },

    // multi values
    noProp :
    {
      check    : "String",
      nullable : true
    },

    initProp : { init : "foo" },

    initApplyProp1 :
    {
      check : "String",
      init : "juhu",
      apply : "_applyInitApplyProp"
    },

    initApplyProp2 :
    {
      check : "String",
      init : null,
      nullable : true,
      apply : "_applyInitApplyProp"
    },

    nullProp :
    {
      init     : "bar",
      nullable : true
    },

    appearanceProp :
    {
      themeable : true,
      nullable  : true
    },

    fullProp :
    {
      init      : 100,
      themeable : true
    }
  },

  members :
  {
    _applyInitApplyProp : function(value, old) {
      this.lastApply = [value, old];
    }
  }
});

qx.Class.define("qx.test.Layout",
{
  extend : qx.ui.container.Composite,

  properties :
  {
    enabled_ : { inheritable : true },

    width_ :
    {
      inheritable : true,
      themeable   : true
    },

    height_ :
    {
      inheritable : true,
      themeable   : true
    },

    left_ :
    {
      inheritable : true,
      themeable   : true
    },

    top_ :
    {
      inheritable : true,
      themeable   : true
    }
  }
});
