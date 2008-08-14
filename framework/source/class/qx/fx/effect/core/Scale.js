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
 * This effect scales the specified element (and its content, optionally)
 * by given percentages.
 */
qx.Class.define("qx.fx.effect.core.Scale",
{

  extend : qx.fx.Base,


  /*
   *****************************************************************************
      PROPERTIES
   *****************************************************************************
   */

  properties :
  {

    /**
     * Flag indicating if element's width should be scaled.
     */
    scaleX :
    {
      init : true,
      check : "Boolean"
    },

    /**
     * Flag indicating if element's height should be scaled.
     */
    scaleY :
    {
      init : true,
      check : "Boolean"
    },

    /**
     * Flag indicating if element's content (font size) should be scaled.
     */
    scaleContent :
    {
      init : true,
      check : "Boolean"
    },

    /**
     * Flag indicating if element should be scaled
     * from center (upper left corner otherwise).
     */
    scaleFromCenter :
    {
      init : true,
      check : "Boolean"
    },

    /**
     * Percentage the elements dimensions should be scaled from.
     */
    scaleFrom :
    {
      init : 100.0,
      check : "Number"
    },

    /**
     * Percentage the elements dimensions should be scaled to.
     */
    scaleTo :
    {
      init : 100,
      check : "Number"
    },

    /**
     * Flag indicating if element's original dimensions should be restored
     * after effect's runtime.
     */
    restoreAfterFinish :
    {
      init : false,
      check : "Boolean"
    },

    /**
     * Array containing sizes which will instead of element's dimensions, if filled.
     */
    alternateDimensions : {
      init : [],
      check : "Array"
    }

  },


  /*
   *****************************************************************************
      MEMBERS
   *****************************************************************************
   */

   members :
   {

     __elementPositioning : null,
     __originalTop : null,
     __originalLeft : null,
     __fontSize : null,
     __fontSizeType : null,
     __factor : null,
     __dims : null,

    __originalStyle :
    {
      'top'      : null,
      'left'     : null,
      'width'    : null,
      'height'   : null,
      'fontSize' : null
    },

    __fontTypes :
    {
      'em' : 'em',
      'px' : 'px',
      '%'  : '%',
      'pt' : 'pt'
    },

    setup : function()
    {
      this.base(arguments);
      var element = this._getElement();

      this.__elementPositioning = qx.bom.element.Style.get(element, "position");

      for (var property in this.__originalStyle) {
        this.__originalStyle[property] = element.style[property];
      }

      this.__originalTop = qx.bom.element.Location.getTop(element);
      this.__originalLeft = qx.bom.element.Location.getLeft(element);

      try {
        var fontSize = qx.bom.element.Style.get(element, "fontSize");
      } catch(e) {
        if(typeof(fontSize) != "string") {
          fontSize = (qx.bom.client.Engine.MSHTML) ? "12px" : "100%";
        }
      }

      for(var type in this.__fontTypes)
      {
        if (fontSize.indexOf(type) > 0)
        {
          this.__fontSize     = parseFloat(fontSize);
          this.__fontSizeType = type;

          break;
        }
      }

      this.__factor = (this.getScaleTo() - this.getScaleFrom()) / 100;

      var dims = this.getAlternateDimensions();

      if (dims.length == 0) {
        this.__dims = [element.offsetWidth, element.offsetHeight];
      } else {
        this.__dims = dims;
      }


    },


    update : function(position)
    {
      var element = this._getElement();
      this.base(arguments);

      var currentScale = (this.getScaleFrom() / 100.0) + (this.__factor * position);

      if (this.getScaleContent() && this.__fontSize) {
        qx.bom.element.Style.set(element, "fontSize", this.__fontSize * currentScale + this.__fontSizeType);
      }

      this._setDimensions(this.__dims[0] * currentScale, this.__dims[1] * currentScale);
    },

   finish : function()
   {
     this.base(arguments);
     var element = this._getElement();

     if (this.getRestoreAfterFinish())
     {
       for(var property in this.__originalStyle)
       {
         var value = this.__originalStyle[property];
         qx.bom.element.Style.set(element, property, value);
       }
     }
   },

   /**
    * Internal helper function which sets element's
    * dimensions to the given values and (optionally)
    * moves it to scale centered.
    * @param width {Number} Width in pixels
    * @param height {Number} Height in pixels
    */
   _setDimensions : function(width, height)
   {

     var d = { };
     var element = this._getElement();
     var scaleX = this.getScaleX();
     var scaleY = this.getScaleY()

     if (scaleX) {
       d.width = Math.round(width) + 'px';
     }

     if (scaleY) {
       d.height = Math.round(height) + 'px';
     }

     if (this.getScaleFromCenter())
     {

       var leftd = (width  - this.__dims[0]) / 2;
       var topd  = (height - this.__dims[1]) / 2;

       if (this.__elementPositioning == "absolute")
       {

         if (scaleY) {
           d.top = this.__originalTop-topd + 'px';
         }

         if (scaleX) {
           d.left = this.__originalLeft-leftd + 'px';
         }

       }
       else
       {

         if (scaleY) {
           d.top = -topd + 'px';
         }

         if (scaleX) {
           d.left = -leftd + 'px';
         }

       }
     }

     for(var property in d) {
       qx.bom.element.Style.set(element, property, d[property])
     }

   }

   },


   /*
   *****************************************************************************
      DESTRUCTOR
   *****************************************************************************
   */

   destruct : function()
   {
     this._disposeFields("__dims");
   }

});

