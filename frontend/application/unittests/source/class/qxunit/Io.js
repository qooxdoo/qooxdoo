
qx.Clazz.define("qxunit.Io", { statics : {

  testIO: function() {
      assertNotUndefined(qx.io);
  },

  testJson: function() {
      assertEquals('{"test":123}', qx.io.Json.stringify({test:123}, false));
  }

}});