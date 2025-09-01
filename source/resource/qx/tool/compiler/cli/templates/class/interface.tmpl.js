${header}

/**
 * This is a qooxdoo interface
 */
qx.Interface.define("${classname}",
{
  //extend : my.extended.interface,  

  /**
   * Events that must be declared by this interface
   */
  events :
  {
    /** Fired when something happens */
    "changeSituation" : "qx.event.type.Data"
  },  

  /**
   * Methonds that must be declared by this interface
   */
  members :
  {
    /**
     * Interface method
     * @param foo {String} The foo parameter
     * @param foo {Number} The bar parameter
     * @return {String} The result of the method.
     */
    myMethod : function(foo, bar){}
  }
});