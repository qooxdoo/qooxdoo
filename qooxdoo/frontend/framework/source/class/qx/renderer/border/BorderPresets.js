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

************************************************************************ */

/* ************************************************************************

#module(ui_core)

************************************************************************ */

/** Some common used border styles. */
qx.Class.define("qx.renderer.border.BorderPresets",
{
  statics : 
  {
    
    /**
     * initialize static class
     */
    __init : function()
    {
      this.black = new qx.renderer.border.Border(1, "solid", "black");
      this.white = new qx.renderer.border.Border(1, "solid", "white");
      this.none = new qx.renderer.border.Border(0, "none");
  
      this.inset = new qx.renderer.border.BorderObject(2, "inset");
      this.outset = new qx.renderer.border.BorderObject(2, "outset");
      this.groove = new qx.renderer.border.BorderObject(2, "groove");
      this.ridge = new qx.renderer.border.BorderObject(2, "ridge");
      this.thinInset = new qx.renderer.border.BorderObject(1, "inset");
      this.thinOutset = new qx.renderer.border.BorderObject(1, "outset");
  
      this.verticalDivider = new qx.renderer.border.BorderObject(1, "inset");
      this.verticalDivider.setLeftWidth(0);
      this.verticalDivider.setRightWidth(0);
  
      this.horizontalDivider = new qx.renderer.border.BorderObject(1, "inset");
      this.horizontalDivider.setTopWidth(0);
      this.horizontalDivider.setBottomWidth(0);
  
      this.shadow = new qx.renderer.border.BorderObject(1, "solid", "threedshadow");
      this.lightShadow = new qx.renderer.border.BorderObject(1, "solid", "threedlightshadow");
      this.info = new qx.renderer.border.BorderObject(1, "solid", "infotext");
    },

    /**
     * Returns a border with the following settings: 1px solid black
     * 
     * @return {Border} The border object
     */
    getBlack : function() {
      return this.black;
    },

    /**
     * Returns a border with the following settings: 1px solid white
     * 
     * @return {Border} The border object
     */
    getWhite : function() {
      return this.white;
    },

    /**
     * Returns a border with the following settings: 0px none
     * 
     * @return {Border} The border object
     */
    getNone : function() {
      return this.none;
    },


    /**
     * Returns a border with the following settings: 2px inset
     * 
     * @return {Border} The border object
     */
    getInset : function() {
      return this.inset;
    },


    /**
     * Returns a border with the following settings: 2px outset
     * 
     * @return {Border} The border object
     */
    getOutset : function() {
      return this.outset;
    },
    
    
    /**
     * Returns a border with the following settings: 2px groove
     * 
     * @return {Border} The border object
     */
    getGroove : function() {
      return this.groove;
    },    


    /**
     * Returns a border with the following settings: 2px ridge
     * 
     * @return {Border} The border object
     */
    getRidge : function() {
      return this.ridge;
    },


    /**
     * Returns a border with the following settings: 1px inset
     * 
     * @return {Border} The border object
     */
    getThinInset : function() {
      return this.thinInset;
    },


    /**
     * Returns a border with the following settings: 1px outset
     * 
     * @return {Border} The border object
     */
    getThinOutset : function() {
      return this.thinOutset;
    },       


    /**
     * Returns a border with the following settings: 1px inset
     * Only bottom and top border is set.
     * 
     * @return {Border} The border object
     */
    getVerticalDivider : function() {
      return this.verticalDivider;
    }, 
    
    
    /**
     * Returns a border with the following settings: 1px inset
     * Only left and right border is set.
     * 
     * @return {Border} The border object
     */
    getHorizontalDivider : function() {
      return this.horizontalDivider;
    }, 
    
    
    /**
     * Returns a border with the following settings: 1px solid threedshadow
     * 
     * @return {Border} The border object
     */
    getShadow : function() {
      return this.shadow;
    }, 
    
    
    /**
     * Returns a border with the following settings: 1px solid threedlightshadow
     * 
     * @return {Border} The border object
     */
    getLightShadow : function() {
      return this.lightShadow;
    }, 
    

    /**
     * Returns a border with the following settings: 1px solid infotext
     * 
     * @return {Border} The border object
     */
    getInfo : function() {
      return this.info;
    },                     

    
    /**
     * Returns a reference to the static class. This method is here
     * to ensure compatibility with the old singleton version of this class.
     * 
     * @deprecated
     * @return {BorderPresets}
     */
    getInstance : function() {
      return this;
    }
  
  },

  defer : function(clazz) {
    clazz.__init();
  }

});
