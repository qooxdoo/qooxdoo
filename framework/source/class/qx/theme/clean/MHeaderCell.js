/* ************************************************************************

   SQville Software

   http://sqville.com

   Copyright:
     None

   License:
     MIT

   Authors:
     * Chris Eskew (chris.eskew@sqville.com)

************************************************************************ */

/**
 * A mixin that enables the font property, and thus, font handling abilities to the Image object
 * This mixin is needed to enable font icons to show up using the Font object
 */
qx.Mixin.define("qx.theme.clean.MHeaderCell",
{
  
  
  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */
 
  properties :
  {
  	/** Control the text alignment */
    sortIconProps :
    {
      check : "Map",
      nullable : true,
      themeable : true,
      apply : "_applySortIconProps"
    }
  	
  },

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
  	
  	// property apply
    _applySortIconProps : function(value, old) {
      this.getChildControl("sort-icon").set(value);
    }
  }
});