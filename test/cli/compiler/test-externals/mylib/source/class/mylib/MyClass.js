/**
 * This is the main application class of "mylib"
 *
 * @external(mylib/a.js)
 */
qx.Class.define("mylib.MyClass", {
  extend: qx.core.Object,

  members: {
    /**
     * @external(mylib/b.js)
     */
    doSomething: function() {
      console.log("Hello World");
    }
  }
});