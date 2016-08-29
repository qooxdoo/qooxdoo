````
qx.Class.define("mypackage.MyBaseClass", {
  extend: qx.core.Object,

  construct: function() {
    this.base(arguments);
    this.__state = "base";
  },

  members: {
    init: function() {
      this.doStuff();
    },

    doStuff: function() {
      /* ... snip ... */
    }
  }
});
qx.Class.define("mypackage.MyDerivedClass", {
  extend: mypackage.MyBaseClass,

  construct: function() {
    this.base(arguments);
    this.__state = "derived";
  },

  members: {
    doStuff: function() {
      console.log(this.__state);
    }
  }
});

new MyDerivedClass().init();
````
