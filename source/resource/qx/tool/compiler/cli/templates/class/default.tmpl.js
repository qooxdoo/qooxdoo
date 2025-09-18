${header}

/**
 * This is a qooxdoo class
 */
qx.Class.define("${classname}",
{
  
  extend : ${extend},
  //include : [ Mixin1, Mixin2 ],

  /**
   * Constructor
   */
  construct : function() {
    // If you want to call the parent constructor, use
    // this.base(arguments);
  },

  /**
   * The properties of the class which can be accessed by getters and setters
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
   * Static properties of the class itself
   */
  statics :
  {
    /** The foo static property of the class object */
    FOO : "bar"
  },  
  /**
   * The methods and simple properties of this class
   */
  members :
  {
    /**
     * First method
     *
     * @param {String} foo The foo parameter
     * @param {number} bar The bar parameter
     * @return The result of the method.
     */
    myMethod : function(foo, bar) {
      //
    },

    /** 
     * Applies the foo property 
     *
     * @param {string} value new value
     * @param {string} old the old value
     */
    _applyFoo : function(value, old) {
      //
    }

  },
  
  /**
   * Use for disposing objects created by class instances
   */
  destruct : function() {
    //
  }  
});
