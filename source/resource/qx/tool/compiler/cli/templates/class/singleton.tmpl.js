${header}

/**
 * This is a qooxdoo singleton class
 *
 */
qx.Class.define("${classname}",
{
  
  extend : ${extend},
  include : [],
  type : "singleton",

  /**
   * Create a the singleton
   */
  construct() {
    super();
  },

  /**
   * The properties of the singleton
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
   * Declaration of events fired by class instances in addition
   * to the property change events
   */  
  events :
  {
    /** Fired when something happens */
    "changeSituation" : "qx.event.type.Data"
  },    
  
  /**
   * Methods and simple properties of the singleton
   */
  members :
  {
    /**
     * Singleton method
     * @param {String} foo The foo parameter
     * @param {Number} bar The bar parameter
     * @return {void} The result of the method.
     */
    myMethod(foo, bar)
    {
      //
    },

    /** Applies the foo property */
    _applyFoo(value, old)
    {
      //
    }
  }
});