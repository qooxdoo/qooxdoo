qx.Class.define("showcase.PageDescription",
{
  extend : qx.core.Object,
  
  properties :
  {
    name : {
      check: "String",
      event: "changeName"
    },
    
    icon : {
      check: "String",
      event: "changeIcon"
    },
    
    part : {
      check: "String"
    },

    description : {
      check: "String",
      event: "changeDescription"
    },
    
    contentClass : {
    },
    
    controlClass : {
      nullable: true
    }
  }
});