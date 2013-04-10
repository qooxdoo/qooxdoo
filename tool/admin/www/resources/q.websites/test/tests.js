/**
 * Test skeleton, based on the Portable Testrunner. Adapt to your needs.
 *
 * You need to run <code>generate.py test</code>, to obtain a working test
 * environment, then open test/index.html. For more information, see the manual
 * section about the Portable Testrunner.
 */
testrunner.globalSetup = function() {
  this.sandbox = q.create("<div id='sandbox'></div>");
  this.sandbox.appendTo(document.body);
};

testrunner.globalTeardown = function() {
  this.sandbox.remove();
};

/*
 * Adapt the test* methods in the remaining objects to test your custom code, and
 * add further <code>testrunner.define</code> calls to create more test objects.
 */

testrunner.define({
  classname: "Basic",

  testSimple : function()
  {
    this.assertEquals(4, 3+1, "This should never fail!");
    this.assertFalse(false, "Can false be true?!");
  }
});

testrunner.define({
  classname: "Advanced",

  setUp : testrunner.globalSetup,
  tearDown : testrunner.globalTeardown,

  testMore : function() {
    var test = document.createElement("div");
    test.id = "foo";
    document.getElementById("sandbox").appendChild(test);
    var collection = q("#foo");
    this.assertInstance(collection, Array);
    this.assertEquals(1, collection.length);
    this.assertEquals(document.getElementById("foo"), collection[0]);
  }
});

testrunner.define({
  className: "q.org.sticky",

  setUp: function() {
    this.sticky = new qx.org.Sticky(q("#sticky"), 10);
  },

  "test: new": function() {
    this.assertObject(this.sticky);
  }
});
