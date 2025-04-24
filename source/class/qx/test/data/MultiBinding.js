qx.Class.define("qx.test.data.MultiBinding", {
  extend: qx.core.Object,

  properties: {
    child: {
      check: "qx.test.data.MultiBinding",
      event: "changeChild",
      nullable: true
    },

    childWithout: {
      check: "qx.test.data.MultiBinding",
      nullable: true
    },

    name: {
      check: "String",
      nullable: true,
      init: "Juhu",
      event: "changeName"
    },

    array: {
      init: null,
      event: "changeArray"
    },

    lab: {
      event: "changeLable"
    }
  },

  destruct() {
    if (this.getLab()) {
      this.getLab().dispose();
    }
    if (this.getArray()) {
      this.getArray().dispose();
    }
  }
});
