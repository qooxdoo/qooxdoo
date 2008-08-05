qx.Class.define("qx.util.Template",
{
  extend : qx.core.Object,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param content {String} The source content
   */
  construct : function(content)
  {
    this.base(arguments);

    if (content != null) {
      this.setContent(content);
    }
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** The source of the template */
    content :
    {
      check : "String",
      nullable : true,
      apply : "_applyContent"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyContent : function(value, old) {
      this.run = new Function("values", "return ['" + value.replace(this.__reg, this.__replace) + "'].join('')");
    },




    /*
    ---------------------------------------------------------------------------
      PUBLIC API
    ---------------------------------------------------------------------------
    */

    /**
     * Returns the result string
     *
     * @param values {Map|Array} Supports both, arrays, when using numeric
     *   identifiers or keys when using maps.
     * @return {String} The result
     */
    run : function(values) {
      throw new Error("Please define any content first!");
    },




    /*
    ---------------------------------------------------------------------------
      INTERNAL HELPER
    ---------------------------------------------------------------------------
    */


    /**
     * Callback for replace method to precompile templates
     *
     * @param match {String} Original match
     * @param name {String} The variable name to replace
     * @return {String} The compiled entry
     */
    __replace : function(match, name) {
      return "',(values." + name + " === undefined ? '' : values." + name + "),'";
    },


    /**
     * {RegExp} This is used to match the expression blocks
     */
    __reg : /\{([\w-]+)}/g
  }
});
