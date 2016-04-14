qx.Class.define("qx.test.data.controller.DummyTargetItem", {
  extend: qx.core.Object,
  
  properties: {
    title: {
      init: null,
      nullable: true,
      check: "String",
      event: "changeTitle"
    },
    
    alpha: {
      init: null,
      nullable: true,
      check: "String",
      event: "changeAlpha"
    },
    
    bravo: {
      init: null,
      nullable: true,
      check: "String",
      event: "changeBravo"
    },
    
    model: {
      init: null,
      nullable: true,
      check: "qx.test.data.controller.DummyModelItem",
      event: "changeModel"
    }
  }
});

