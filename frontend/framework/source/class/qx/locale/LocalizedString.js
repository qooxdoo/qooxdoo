qx.Class.define("qx.locale.LocalizedString",
{
  extend : qx.lang.BaseString,

  construct : function(translation, messageId, args)
  {
    this.base(arguments, translation);

    this.messageId = this.__messageId = messageId;
    this.args = this.__args = args;
  },

  members :
  {
    getMessageId : function() {
      return this.__messageId;
    },

    getArguments : function() {
      return this.__args;
    },

    translate : function() {
      return qx.locale.Manager.getInstance().translate(this.__messageId, this.__args);
    }
  }
})