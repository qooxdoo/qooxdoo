${header}

/**
 * This is a qooxdoo mixin
 */
qx.Mixin.define("${classname}",
{
  include : [],

  /**
   * Properties provided by this mixin
   */
  properties :
  {
    /** The foo property of the object */
    foo :
    {
      apply : "_applyFoo",
      nullable : true,
      check : "String",
      event : "changeFoo"
    }
  },

  /**
   * Events provided by this mixin 
   */
  events :
  {
    /** Fired when something happens */
    "changeSituation" : "qx.event.type.Data"
  },  

  /**
   * Methods provided by this mixin
   */
  members :
  {
    /**
     * Mixin method method
     * @param {String} foo The foo parameter
     * @param {Number} bar The bar parameter
     * @return {String} The result of the method.
     */
    myMethod : function(foo, bar)
    {
      //
    },

    /** Applies the foo property */
    _applyFoo : function(value, old)
    {
      //
    }
  }
});