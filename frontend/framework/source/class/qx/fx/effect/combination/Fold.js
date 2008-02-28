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
     * Jonathan Rass (jonathan_rass)

   ======================================================================

   This class contains code based on the following work:

   * script.aculo.us
       http://script.aculo.us/
       Version 1.8.1

     Copyright:
       (c) 2008 Thomas Fuchs

     License:
       MIT: http://www.opensource.org/licenses/mit-license.php

     Author:
       Thomas Fuchs

************************************************************************ */

/**
 * Combination effect "Fold"
 *
 * The specified element will shrink in width and height and become invisible.
 */

qx.Class.define("qx.fx.effect.combination.Fold",
{

  extend : qx.fx.Base,

  /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
  */

  /**
   * @param element {Object} The DOM element
   */
  construct : function(element)
  {
    this.base(arguments, element);

  },


  /*
   *****************************************************************************
      PROPERTIES
   *****************************************************************************
   */

   properties :
   {
      /**
       * Flag indicating if the CSS attribute "display"
       * should be modified by effect
       */
      modifyDisplay :
      {
        init : true,
        check : "Boolean"
      },

      /**
       * String indicating if element should fold in or out
       */
      mode : 
      {
        init : "in",
        check : [ "in", "out" ]
      }

   },

  /*
   *****************************************************************************
      MEMBERS
   *****************************************************************************
   */

  members :
  {

    afterFinish : function()
    {
      if ( (this.getModifyDisplay()) && (this.getMode() == "in") ) {
        qx.bom.element.Style.set(this._element, "display", "block");
      }
    },
    
    start : function()
    {
      this.base(arguments);

      // Hack: the scale effects should be moved back to the constructor
      var self = this;

      this._outerScaleEffect = new qx.fx.effect.core.Scale(this._element);
      this._innerScaleEffect = new qx.fx.effect.core.Scale(this._element);

      this._outerScaleEffect.afterFinishInternal = function() {
        self._innerScaleEffect.start();
      };

      this._innerScaleEffect.afterFinishInternal = function(){
        self._cleanUp();
      }
      
      
      this._oldStyle = this._getStyle();
      qx.bom.element.Style.set(this._element, "overflow", "hidden");
       
      
      if(this.getMode() == "in")
      {

        this._outerScaleEffect.set({
          scaleTo              : 5,
          scaleContent         : false,
          scaleX               : false,
          duration             : this.getDuration() / 2,
          scaleFrom            : 100,
          scaleFromCenter      : true,
          alternateDimensions  : []
        });
        
        this._innerScaleEffect.set({
          scaleTo              : 5,
          scaleContent         : false,
          scaleY               : false,
          duration             : this.getDuration() / 2,
          scaleFrom            : 100,
          scaleFromCenter      : true,
          alternateDimensions  : []
        });

      }
      else
      {

        this._outerScaleEffect.set({
          scaleTo              : 100,
          scaleContent         : false,
          scaleY               : false,
          duration             : this.getDuration() / 2,
          scaleFrom            : 0,
          scaleFromCenter      : true,
          alternateDimensions  : [this._oldStyle.width, this._oldStyle.height]
        });
        
        this._innerScaleEffect.set({
          scaleTo              : 100,
          scaleContent         : false,
          scaleX               : false,
          duration             : this.getDuration() / 2,
          scaleFrom            : 0,
          scaleFromCenter      : false,
          alternateDimensions  : [this._oldStyle.width, this._oldStyle.height]
        });

        qx.bom.element.Style.set(this._element, "display", "block");
        qx.bom.element.Style.set(this._element, "height", "0px");
        qx.bom.element.Style.set(this._element, "width", "0px");

      }

      this._outerScaleEffect.start();
    },


    /**
     * Restores style properties of animated element
     * after effect has finished.
     */
    _cleanUp : function()
    {
      if ( (this.getMode() == "in") && (this.getModifyDisplay()) ) {
        qx.bom.element.Style.set(this._element, "display", "none");
      }

      for (var property in this._oldStyle) {
        qx.bom.element.Style.set(this._element, property, this._oldStyle[property]);
      }
      qx.bom.element.Style.set(this._element, "overflow", "visible");
    },
    
    /**
     * Retrieves style properties from element.
     */
    _getStyle : function()
    {
      var hidden = (qx.bom.element.Style.get(this._element, "display") ==  "none");

      if(hidden)
      {
        qx.bom.element.Style.set(this._element, "visiblity", "hidden");
        qx.bom.element.Style.set(this._element, "display", "block");
      }

      var style = {
        overflow : qx.bom.element.Style.get(this._element, "overflow"),
        top      : qx.bom.element.Location.getTop(this._element),
        left     : qx.bom.element.Location.getLeft(this._element),
        width    : qx.bom.element.Dimension.getWidth(this._element),
        height   : qx.bom.element.Dimension.getHeight(this._element)
      };

      if(hidden)
      {
        qx.bom.element.Style.set(this._element, "display", "none");
        qx.bom.element.Style.set(this._element, "visiblity", "visible");
      }

      return style;
    }


   },


   /*
   *****************************************************************************
      DESTRUCTOR
   *****************************************************************************
   */

   destruct : function()
   {
     this._disposeObjects("_outerScaleEffect", "_innerScaleEffect");
   }

});
