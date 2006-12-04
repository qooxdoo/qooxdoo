/*
#id(qx.test.IPet)
#require(qx.Interface)
#require(qx.test.IHumanlike)
#require(qx.test.IPlayable)
*/

qx.Interface.define("qx.test.IPet",
{
  extend : [qx.test.IHumanlike, qx.test.IPlayable],

  members :
  {
    isFriendly : true,
    smooch : function() {}
  }
});
