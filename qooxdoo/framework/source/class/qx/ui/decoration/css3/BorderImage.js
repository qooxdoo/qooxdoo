/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 */
qx.Class.define("qx.ui.decoration.css3.BorderImage",
{
  extend : qx.ui.decoration.Abstract,

  /**
   * @param borderImage {String} Base image to use
   * @param slice {Integer|Array} 
   */
  construct : function(borderImage, slice)
  {
    this.base(arguments);

    // Initialize properties
    if (borderImage != null) {
      this.setBorderImage(borderImage);
    }

    if (slice != null) {
      this.setSlice(slice);
    }
  },

  
  statics :
  {
    IS_SUPPORTED : qx.bom.element.Style.isPropertySupported("borderImage")
  },
  

  properties :
  {
    /**
     * Base image URL. 
     */
    borderImage :
    {
      check : "String",
      nullable : true,
      apply : "_applyStyle"
    },
    
    
    sliceTop : 
    {
      check : "Integer",
      init : 0,
      apply : "_applyStyle"
    },
    

    sliceRight : 
    {
      check : "Integer",
      init : 0,
      apply : "_applyStyle"
    },

    
    sliceBottom : 
    {
      check : "Integer",
      init : 0,
      apply : "_applyStyle"
    },
    
    
    sliceLeft : 
    {
      check : "Integer",
      init : 0,
      apply : "_applyStyle"
    },
    
    
    slice : 
    {
      group : [ "sliceTop", "sliceRight", "sliceBottom", "sliceLeft" ],
      mode : "shorthand"
    },
    
    
    repeatX : 
    {
      check : ["stretch", "repeat", "round"],
      init : ["stretch"],
      apply : "_applyStyle"
    },

    
    repeatY : 
    {
      check : ["stretch", "repeat", "round"],
      init : ["stretch"],
      apply : "_applyStyle"
    },
    
    
    repeat : 
    {
      group : ["repeatX", "repeatY"],
      mode : "shorthand"
    }
  },


  members :
  {
    __markup : null,


    // overridden
    _getDefaultInsets : function()
    {
      return {
        top : 0,
        right : 0,
        bottom : 0,
        left : 0
      };
    },


    // overridden
    _isInitialized: function() {
      return !!this.__markup;
    },


    /*
    ---------------------------------------------------------------------------
      INTERFACE IMPLEMENTATION
    ---------------------------------------------------------------------------
    */

    // interface implementation
    getMarkup : function()
    {
      if (this.__markup) {
        return this.__markup;
      }

      var source = this._resolveImageUrl(this.getBorderImage());
      var slice = [
        this.getSliceTop(), 
        this.getSliceRight(), 
        this.getSliceBottom(),
        this.getSliceLeft()
      ].join(" ");
      
      var repeat = [
        this.getRepeatX(),
        this.getRepeatY()
      ].join(" ")
      
      this.__markup = [
        "<div style='",
        qx.bom.element.Style.compile({
          "borderImage" : 'url("' + source + '") ' + slice + " stretch stretch",
          position: "absolute",
          lineHeight: 0,
          fontSize: 0,
          overflow: "hidden",
          boxSizing: "border-box"
        }),
        ";'></div>"
      ].join("");
      
      // Store
      return this.__markup;
    },


    // interface implementation
    resize : function(element, width, height)
    {
      element.style.width = width + "px";
      element.style.height = height + "px";
    },


    // interface implementation
    tint : function(element, bgcolor) {
      // not implemented
    },



    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY ROUTINES
    ---------------------------------------------------------------------------
    */


    // property apply
    _applyStyle : function()
    {
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (this._isInitialized()) {
          throw new Error("This decorator is already in-use. Modification is not possible anymore!");
        }
      }
    },


    /**
     * Resolve the url of the given image
     *
     * @param image {String} base image URL
     * @return {String} the resolved image URL
     */
    _resolveImageUrl : function(image) 
    {
      return qx.util.ResourceManager.getInstance().toUri(
        qx.util.AliasManager.getInstance().resolve(image)
      );
    }
  },


  destruct : function() {
    this.__markup = null;
  }
});
