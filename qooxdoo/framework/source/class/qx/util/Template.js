/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)

************************************************************************ */

/**
 * Class to process string content with placeholders into a resulting string.
 * This is especially interesting to use in combination with database
 * driven creation of HTML markup etc.
 */
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
     * @param values {Map} Map of keys used in the template
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
