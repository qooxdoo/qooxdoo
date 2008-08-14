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

    __outerScaleEffect : null,
    __innerScaleEffect : null,
    __oldStyle : null,

    afterFinish : function()
    {
      var element = this._getElement();
      if ( (this.getModifyDisplay()) && (this.getMode() == "in") ) {
        qx.bom.element.Style.set(element, "display", "block");
      }
    },

    start : function()
    {
      if (!this.base(arguments)) {
        return;
      }
      var element = this._getElement();

      // Hack: the scale effects should be moved back to the constructor
      var self = this;

      this.__outerScaleEffect = new qx.fx.effect.core.Scale(element);
      this.__innerScaleEffect = new qx.fx.effect.core.Scale(element);

      this.__outerScaleEffect.afterFinishInternal = function() {
        self.__innerScaleEffect.start();
      };

      this.__innerScaleEffect.afterFinishInternal = function(){
        self._cleanUp();
      }


      this.__oldStyle = this._getStyle();
      qx.bom.element.Style.set(element, "overflow", "hidden");


      if(this.getMode() == "in")
      {

        this.__outerScaleEffect.set({
          scaleTo              : 5,
          scaleContent         : false,
          scaleX               : false,
          duration             : this.getDuration() / 2,
          scaleFrom            : 100,
          scaleFromCenter      : true,
          alternateDimensions  : []
        });

        this.__innerScaleEffect.set({
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

        this.__outerScaleEffect.set({
          scaleTo              : 100,
          scaleContent         : false,
          scaleY               : false,
          duration             : this.getDuration() / 2,
          scaleFrom            : 0,
          scaleFromCenter      : true,
          alternateDimensions  : [this.__oldStyle.width, this.__oldStyle.height]
        });

        this.__innerScaleEffect.set({
          scaleTo              : 100,
          scaleContent         : false,
          scaleX               : false,
          duration             : this.getDuration() / 2,
          scaleFrom            : 0,
          scaleFromCenter      : false,
          alternateDimensions  : [this.__oldStyle.width, this.__oldStyle.height]
        });

        qx.bom.element.Style.set(element, "display", "block");
        qx.bom.element.Style.set(element, "height", "0px");
        qx.bom.element.Style.set(element, "width", "0px");

      }

      this.__outerScaleEffect.start();
    },


    /**
     * Restores style properties of animated element
     * after effect has finished.
     */
    _cleanUp : function()
    {
      var value;
      var element = this._getElement();

      if ( (this.getMode() == "in") && (this.getModifyDisplay()) ) {
        qx.bom.element.Style.set(element, "display", "none");
      }

      for (var property in this.__oldStyle)
      {
        value = this.__oldStyle[property];
        if (property != "overflow") {
          value += "px";
        }
        qx.bom.element.Style.set(element, property, value);
      }
      qx.bom.element.Style.set(element, "overflow", "visible");
    },

    /**
     * Retrieves style properties from element.
     */
    _getStyle : function()
    {
      var element = this._getElement();
      var hidden = (qx.bom.element.Style.get(element, "display") ==  "none");

      if(hidden)
      {
        qx.bom.element.Style.set(element, "visiblity", "hidden");
        qx.bom.element.Style.set(element, "display", "block");
      }

      var style = {
        overflow : qx.bom.element.Style.get(element, "overflow"),
        top      : qx.bom.element.Location.getTop(element),
        left     : qx.bom.element.Location.getLeft(element),
        width    : qx.bom.element.Dimension.getWidth(element),
        height   : qx.bom.element.Dimension.getHeight(element)
      };

      if(hidden)
      {
        qx.bom.element.Style.set(element, "display", "none");
        qx.bom.element.Style.set(element, "visiblity", "visible");
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
     this._disposeObjects("__outerScaleEffect", "__innerScaleEffect");
   }

});
