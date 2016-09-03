/*
 * This is just extracting a common structure that is used by various test
 * classes to initialize qx.Part()
 */
qx.Bootstrap.define("qx.test.io.part.MockLoader",
{
  construct : function() {
    this.parts = {"b":["b"]};
    this.packages = {"b" : {uris: []}};
    this.boot = "b";
  },
  members :
  {
    parts: null,
    packages : null,
    boot: null
  }
});
