qx.Class.define("qx.test.core.EventEmitterDummy",
{
  extend    : qx.core.Object,
  events : {
    "plain" : "qx.event.type.Event",
    "error" : "qx.__12345__",
    "data" : "qx.event.type.Data",
    "eventName" : "qx.event.type.Data"
  }
});
