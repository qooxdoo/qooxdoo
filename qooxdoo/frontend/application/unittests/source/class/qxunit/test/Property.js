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

    testPerformance : function()
    {
      this.debug("Exec: testPerformance");

      this.assertNotUndefined(qx.core.Property);

      // Check instance
      var inst = new qxunit.test.PropertyHelper;
      this.assertNotUndefined(inst, "instance");

      var values = [ "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z" ];
      qx.lang.Array.append(values, values);
      qx.lang.Array.append(values, values);
      qx.lang.Array.append(values, values);
      qx.lang.Array.append(values, values);
      qx.lang.Array.append(values, values);
      qx.lang.Array.append(values, values);
      qx.lang.Array.append(values, values);
      qx.lang.Array.append(values, values);
      qx.lang.Array.append(values, values);

      var len = values.length;
      this.debug("Testing: " + len + " iterations");



      var d = new Date();
      for (var i=0; i<len; i++) {
        inst.setLegacyPure(values[i]);
      }
      this.debug("Legacy properties (pure) " + (new Date - d) + "ms");

      var d = new Date();
      for (var i=0; i<len; i++) {
        inst.setLegacyString(values[i]);
      }
      this.debug("Legacy properties (string) " + (new Date - d) + "ms");

      var d = new Date();
      for (var i=0; i<len; i++) {
        inst.setLegacyPure([]);
      }
      this.debug("Legacy properties (array) " + (new Date - d) + "ms");



      var d = new Date();
      for (var i=0; i<len; i++) {
        inst.setPublicProp(values[i]);
      }
      this.debug("New properties (pure) " + (new Date - d) + "ms");

      var d = new Date();
      for (var i=0; i<len; i++) {
        inst.setStringProp(values[i]);
      }
      this.debug("New properties (string) " + (new Date - d) + "ms");

      var d = new Date();
      for (var i=0; i<len; i++) {
        inst.setArrayProp([]);
      }
      this.debug("New properties (array) " + (new Date - d) + "ms");



      // To keep the debug console...
      if (qx.core.Client.getInstance().isMshtml()) {
        confirm("test log");
      }



      this.debug("Done: testPerformance");
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
