qx.Class.define("qxunit.test.Property",
{
  extend: qxunit.TestCase,

  members :
  {
    testBasic : function()
    {
      this.debug("Exec: testBasic");

      this.assertNotUndefined(qx.core.Property);

      // Check instance
      var inst = new qxunit.test.PropertyHelper;
      this.assertNotUndefined(inst, "instance");

      // Public setter/getter etc.
      this.assertFunction(inst.setPublicProp, "public setter");
      this.assertFunction(inst.getPublicProp, "public getter");
      this.assertFunction(inst.resetPublicProp, "public reset");
      this.assertFunction(inst.computePublicProp, "public compute");
      this.assertUndefined(inst.togglePublicProp, "public toggler");
      this.assertUndefined(inst.stylePublicProp, "public style");

      // Protected setter/getter etc.
      this.assertFunction(inst._setProtectedProp, "protected setter");
      this.assertFunction(inst._getProtectedProp, "protected getter");
      this.assertFunction(inst._resetProtectedProp, "protected reset");
      this.assertFunction(inst._computeProtectedProp, "protected compute");
      this.assertUndefined(inst._toggleProtectedProp, "protected toggler");
      this.assertUndefined(inst._styleProtectedProp, "protected style");

      // Private setter/getter etc.
      this.assertFunction(inst.__setPrivateProp, "private setter");
      this.assertFunction(inst.__getPrivateProp, "private getter");
      this.assertFunction(inst.__resetPrivateProp, "private reset");
      this.assertFunction(inst.__computePrivateProp, "private compute");
      this.assertUndefined(inst.__togglePrivateProp, "private toggler");
      this.assertUndefined(inst.__stylePrivateProp, "private style");

      // Boolean property
      this.assertFunction(inst.toggleBooleanProp, "boolean toggler");

      this.debug("Done: testBasic");
    },





    testBuiltinTypes : function()
    {
      this.debug("Exec: testBuiltinTypes");

      this.assertNotUndefined(qx.core.Property);

      // Check instance
      var inst = new qxunit.test.PropertyHelper;
      this.assertNotUndefined(inst, "instance");

      // Type checks: String
      this.assertIndentical("Hello", inst.setStringProp("Hello"), "string property, set");
      this.assertIndentical("Hello", inst.getStringProp(), "string property, get");
      this.assertIndentical("Hello", inst.computeStringProp(), "string property, compute");

      // Type checks: Boolean, true
      this.assertIndentical(true, inst.setBooleanProp(true), "boolean property, set");
      this.assertIndentical(true, inst.getBooleanProp(), "boolean property, get");
      this.assertIndentical(true, inst.computeBooleanProp(), "boolean property, compute");

      // Type checks: Boolean, false
      this.assertIndentical(false, inst.setBooleanProp(false), "boolean property, set");
      this.assertIndentical(false, inst.getBooleanProp(), "boolean property, get");
      this.assertIndentical(false, inst.computeBooleanProp(), "boolean property, compute");

      // Type checks: Number, int
      this.assertIndentical(3, inst.setNumberProp(3), "number property, set");
      this.assertIndentical(3, inst.getNumberProp(), "number property, get");
      this.assertIndentical(3, inst.computeNumberProp(), "number property, compute");

      // Type checks: Number, float
      this.assertIndentical(3.14, inst.setNumberProp(3.14), "number property, set");
      this.assertIndentical(3.14, inst.getNumberProp(), "number property, get");
      this.assertIndentical(3.14, inst.computeNumberProp(), "number property, compute");

      // Type checks: Object, inline
      var obj = {};
      this.assertIndentical(obj, inst.setObjectProp(obj), "object property, set");
      this.assertIndentical(obj, inst.getObjectProp(), "object property, get");
      this.assertIndentical(obj, inst.computeObjectProp(), "object property, compute");

      // Type checks: Object, new
      var obj = new Object;
      this.assertIndentical(obj, inst.setObjectProp(obj), "object property, set");
      this.assertIndentical(obj, inst.getObjectProp(), "object property, get");
      this.assertIndentical(obj, inst.computeObjectProp(), "object property, compute");

      // Type checks: Array, inline
      var arr = [];
      this.assertIndentical(arr, inst.setArrayProp(arr), "array property, set");
      this.assertIndentical(arr, inst.getArrayProp(), "array property, get");
      this.assertIndentical(arr, inst.computeArrayProp(), "array property, compute");

      // Type checks: Array, new
      var arr = new Array;
      this.assertIndentical(arr, inst.setArrayProp(arr), "array property, set");
      this.assertIndentical(arr, inst.getArrayProp(), "array property, get");
      this.assertIndentical(arr, inst.computeArrayProp(), "array property, compute");

      this.debug("Done: testBuiltinTypes");
    },





    testMultiValues : function()
    {
      this.debug("Exec: testMultiValues");

      this.assertNotUndefined(qx.core.Property);

      // Check instance
      var inst = new qxunit.test.PropertyHelper;
      this.assertNotUndefined(inst, "instance");



      // TODO


      this.debug("Done: testMultiValues");
    },





    testInheritance : function()
    {
      this.debug("Exec: testInheritance");

      this.assertNotUndefined(qx.core.Property);

      var pa = new qxunit.test.Layout;
      var ch1 = new qxunit.test.Layout;
      var ch2 = new qxunit.test.Layout;
      var ch3 = new qxunit.test.Layout;
      var chh1 = new qxunit.test.Layout;
      var chh2 = new qxunit.test.Layout;
      var chh3 = new qxunit.test.Layout;

      pa.add(ch1, ch2, ch3);
      ch2.add(chh1, chh2, chh3);


      // Simple: Only inheritance, no local values
      this.assertTrue(pa._setEnabled(true));
      this.assertTrue(pa._getEnabled());
      this.assertTrue(pa._computeEnabled());

      this.assertUndefined(ch1._getEnabled());
      this.assertTrue(ch1._computeEnabled());

      this.assertUndefined(ch2._getEnabled());
      this.assertTrue(ch2._computeEnabled());

      this.assertUndefined(ch3._getEnabled());
      this.assertTrue(ch3._computeEnabled());

      this.assertUndefined(chh1._getEnabled());
      this.assertTrue(chh1._computeEnabled());

      this.assertUndefined(chh2._getEnabled());
      this.assertTrue(chh2._computeEnabled());

      this.assertUndefined(chh3._getEnabled());
      this.assertTrue(chh3._computeEnabled());


      // Enabling local value
      this.assertFalse(ch2._setEnabled(false));
      this.assertFalse(ch2._getEnabled());
      this.assertFalse(ch2._computeEnabled());

      this.assertUndefined(chh1._getEnabled());
      this.assertFalse(chh1._computeEnabled());

      this.assertUndefined(chh2._getEnabled());
      this.assertFalse(chh2._computeEnabled());

      this.assertUndefined(chh3._getEnabled());
      this.assertFalse(chh3._computeEnabled());


      // Reset local value
      ch2._resetEnabled();

      this.assertUndefined(ch2._getEnabled());
      this.assertTrue(ch2._computeEnabled());

      this.assertUndefined(chh1._getEnabled());
      this.assertTrue(chh1._computeEnabled());

      this.assertUndefined(chh2._getEnabled());
      this.assertTrue(chh2._computeEnabled());

      this.assertUndefined(chh3._getEnabled());
      this.assertTrue(chh3._computeEnabled());


      this.debug("Done: testInheritance");
    },





    testParent : function()
    {
      var pa = new qxunit.test.Layout;
      var ch1 = new qxunit.test.Layout;
      var ch2 = new qxunit.test.Layout;
      var ch3 = new qxunit.test.Layout;

      ch1.setParent(pa);

      this.assertTrue(pa._setEnabled(true), "t0-a"); // ch1 gets enabled, too
      this.assertFalse(ch3._setEnabled(false), "t0-b");

      this.assertTrue(pa._computeEnabled(), "t1-a");
      this.assertTrue(ch1._computeEnabled(), "t1-b");
      this.assertUndefined(ch2._computeEnabled(), "t1-c");
      this.assertFalse(ch3._computeEnabled(), "t1-d");

      ch2.setParent(pa); // make ch2 enabled through inheritance
      ch3.setParent(pa); // keep ch2 disabled, user value has higher priority

      this.assertTrue(pa._computeEnabled(), "t2-a");
      this.assertTrue(ch1._computeEnabled(), "t2-b");
      this.assertTrue(ch2._computeEnabled(), "t2-c");
      this.assertFalse(ch3._computeEnabled(), "t2-d");
    }
  }
});

qx.Class.define("qxunit.test.PropertyHelper",
{
  extend : qx.core.Target,

  properties :
  {
    // legacy
    legacyPure      : { _legacy : true },
    legacyString    : { _legacy : true, type : "string" },
    legacyArray     : { _legacy : true, type : "object", instance : "Array" },

    // protection
    publicProp      : { },
    _protectedProp  : { },
    __privateProp   : { },

    // types
    stringProp      : { check : "String" },
    booleanProp     : { check : "Boolean" },
    numberProp      : { check : "Number" },
    objectProp      : { check : "Object" },
    arrayProp       : { check : "Array" },
    mapProp         : { check : "Map" },

    // multi values
    initProp        : { init  : "foo" },
    appearanceProp  : { appearance : true },
    fullProp        : { init : 100, appearance : true }
  }
});

qx.Class.define("qxunit.test.Layout",
{
  extend : qx.ui.layout.CanvasLayout,

  properties :
  {
    _enabled : { inheritable : true },
    _width : { inheritable : true, appearance : true },
    _height : { inheritable : true, appearance : true },
    _left : { inheritable : true, appearance : true },
    _top : { inheritable : true, appearance : true }
  }
});
