/*
 * This is just extracting a common structure that is used by various test
 * classes to initialize qx.Part()
 */
qx.Bootstrap.define("qx.test.io.part.MockLoader",
{
  construct : function() {},
  members :
  {
    uris: [[]],
    boot: "b",
    parts:{"b":[0]},
    packageHashes:{"0":"0"}
  }
});