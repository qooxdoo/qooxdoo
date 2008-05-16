qx.Class.define("feedreader.model.Article",
{
  extend : qx.core.Object,

  properties :
  {
    title :
    {
      check : "String",
      event : "change"
    },

    author  :
    {
      check : "String",
      nullable : true,
      event : "change"
    },

    date :
    {
      check : "Date",
      event : "change"
    },

    content :
    {
      check : "String",
      event : "change"
    },

    link :
    {
      check : "String",
      event : "change"
    },

    id :
    {
      check : "Integer",
      event : "change"
    }
  }
});