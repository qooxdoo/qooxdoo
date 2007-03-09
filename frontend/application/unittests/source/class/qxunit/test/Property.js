qx.Class.define("qxunit.test.Property",
{
  extend: qxunit.TestCase,

  members :
  {
    testBasic : function()
    {
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

    }
  }
});

qx.Class.define("qxunit.test.PropertyHelper",
{
  extend : qx.core.Target,

  properties :
  {
    publicProp : { },
    _protectedProp : { },
    __privateProp : { }




  }
});
