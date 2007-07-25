/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Alexander Back (aback)
   
************************************************************************ */

/* ************************************************************************
#require(qx.html2.element.Flash)

************************************************************************ */

/**
 * Flash Player embed.
 * 
 */
qx.Class.define("qx.ui.embed.Flash",
{
  extend : qx.ui.basic.Terminator,


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param vSource {String} Url of the SWF file to embed
   * @param vVersion {String} Flash version of the SWF file
   */
  construct : function(vSource, vVersion)
  {
    this.base(arguments);

    this.setFlashObject(new qx.html2.element.Flash(vSource, vVersion));
  },


  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */
  
  properties :
  {
    /** Underlying flash object */
    flashObject :
    {
       check    : "qx.html2.element.Flash",
       nullable : false 
    } 
  },


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Overwritten method of {@link qx.ui.core.Widget} to embed flash html
     *
     * @type member
     * @param el {Element} Given DOM element
     * @return {void}
     */
    _applyElementData : function(el)
    {
      this.base(arguments, el);

      if (this.getFlashObject().getHtml() != null)
      {
        el.innerHTML = this.getFlashObject().getHtml();
      }
      else
      {
         this.error("Unable to insert flash embed");
      }
    },


    /*
    ---------------------------------------------------------------------------
      OVERWRITE BACKGROUND COLOR HANDLING
    ---------------------------------------------------------------------------
    */

    /**
     * Overwritten from {@link qx.ui.core.Widget}. Sets the background color of
     * the flash object by calling the {@link #_setBackgroundProperty} method.
     *
     * @type member
     * @param value {var} Current value
     */
    _styleBackgroundColor : function(value)
    {
      if (value)
      {
        this._setBackgroundColorProperty(value);
      }
      else
      {
        this._resetBackgroundColorProperty();
      }
    },


    /**
     * Sets the background color of the flash object by passing it
     * the corresponding parameter (bgcolor).
     *
     * @type member
     * @param vNewValue {var} new background color value
     * @return {void}
     */
    _setBackgroundColorProperty : function(vNewValue) {
      this.getFlashObject().setParam("bgcolor", vNewValue);
    },


    /*
    ---------------------------------------------------------------------------
      METHODS TO GIVE THE LAYOUTERS INFORMATIONS
    ---------------------------------------------------------------------------
    */

    /**
     * Returns true
     * 
     * @signature function()
     * @return {Boolean}
     */
    _isWidthEssential : qx.lang.Function.returnTrue,

    /**
     * Returns true
     * 
     * @signature function()
     * @return {Boolean}
     */
    _isHeightEssential : qx.lang.Function.returnTrue,




    /*
    ---------------------------------------------------------------------------
      PREFERRED DIMENSIONS
    ---------------------------------------------------------------------------
    */

    /**
     * Returns zero
     * 
     * @signature function()
     * @return {Integer}
     */
    _computePreferredInnerWidth : qx.lang.Function.returnZero,

    /**
     * Returns zero
     * 
     * @signature function()
     * @return {Integer}
     */
    _computePreferredInnerHeight : qx.lang.Function.returnZero
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {}
});
