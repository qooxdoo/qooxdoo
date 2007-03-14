qx.Class.define("qx.test.BigKitty",
{
  extend : qx.test.Kitty,

  statics :
  {
    foo : "bar"
  },

  properties :
  {
    width : { refine : true, init : 250 },
    height : { refine : true, init : 70 }
  },

  members :
  {
    // This produces an exception because of a missing function from the IPet interface.
    /*
    smooch : null
    */
  }
});