qx.Clazz.define("qx.test.BigKitty",
{
  extend : qx.test.Kitty,
  statics :
  {
    foo : "bar"
  },
  members :
  {
    // This produces an exception because of a missing function from the IPet interface.
    /*
    smooch : null
    */
  }
});