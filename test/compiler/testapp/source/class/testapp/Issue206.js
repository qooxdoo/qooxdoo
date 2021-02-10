qx.Class.define("testapp.Issue206", {
  extend: qx.core.Object,
  
  properties: {
    minimum: {
      init: Number.MAX_VALUE * -1
    },
    maximum: {
      init: Number.MAX_VALUE
    },
    value: {
      init: new Date().getMonth()+1
    }
  }
});
