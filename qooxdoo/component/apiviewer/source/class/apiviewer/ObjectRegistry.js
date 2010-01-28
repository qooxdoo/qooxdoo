
qx.Class.define("apiviewer.ObjectRegistry",
{
  statics :
  {
    __objectDb : {},

    register : function(object)
    {
      var hash = qx.core.ObjectRegistry.toHashCode(object);
      this.__objectDb[hash] = object;
    },

    getObjectFromHashCode : function(hashCode) {
      return this.__objectDb[hashCode];
    }
  }

});
