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
 * TODO
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

    scaleX :
    {
      init : true,
      check : "Boolean"
    },

    scaleY :
    {
      init : true,
      check : "Boolean"
    },

    scaleContent :
    {
      init : true,
      check : "Boolean"
    },

    scaleFromCenter :
    {
      init : true,
      check : "Boolean"
    },

    scaleFrom :
    {
      init : 100.0,
      check : "Number"
    },

    scaleTo :
    {
      init : 100,
      check : "Number"
    },

    scaleMode :
    {
      init : "box"
    },

    restoreAfterFinish :
    {
      init : false,
      check : "Boolean"
    }

  },


  /*
   *****************************************************************************
      MEMBERS
   *****************************************************************************
   */

   members :
   {

    _originalStyle :
    {
      'top'      : null,
      'left'     : null,
      'width'    : null,
      'height'   : null,
      'fontSize' : null
    },

    _fontTypes :
    {
      'em' : 'em',
      'px' : 'px',
      '%'  : '%',
      'pt' : 'pt'
    },

    _originalTop        : null,
    _originalLeft       : null,
    _fontSize           : null,
    _fontSizeType       : null,
    _factor             : null,
    _dims               : [],
    _elementPositioning : null,

    setup : function()
    {
      this.base(arguments);

      this._elementPositioning = qx.bom.element.Style.get(this._element, "position");

      for (var property in this._originalStyle) {
        this._originalStyle[property] = this._element.style[property];
      }

      this._originalTop = qx.bom.element.Location.getTop(this._element, "scroll"),
      this._originalLeft = qx.bom.element.Location.getLeft(this._element, "scroll")

      try {
        var fontSize = qx.bom.element.Style.get(this._element, "fontSize");
      } catch(e) {
        if(typeof(fontSize) != "string") {
          fontSize = (qx.bom.client.Engine.MSHTML) ? "12px" : "100%";
        }
      }

      for(var type in this._fontTypes)
      {
        if (fontSize.indexOf(type) > 0)
        {
          this._fontSize     = parseFloat(fontSize);
          this._fontSizeType = type;

          break;
        }
      }

      this._factor = (this.getScaleTo() - this.getScaleFrom()) / 100;

      if (this.getScaleMode() == "box") {
        this._dims = [this._element.offsetHeight, this._element.offsetWidth];
      }else if (this.getScaleMode() == "contents") {
        this._dims = [this._element.scrollHeight, this._element.scrollWidth];
      } else {
        this._dims = [this.getScaleMode().originalHeight, this.getScaleMode().originalWidth];
      }

    },


    update : function(position)
    {
      this.base(arguments);

      var currentScale = (this.getScaleFrom() / 100.0) + (this._factor * position);

      if (this.getScaleContent() && this._fontSize) {
        qx.bom.element.Style.set(this._element, "fontSize", this._fontSize * currentScale + this._fontSizeType);
      }

      this._setDimensions(this._dims[0] * currentScale, this._dims[1] * currentScale);
    },

   finish : function(position)
   {
     this.base(arguments);

     if (this.getRestoreAfterFinish())
     {
       for(var property in this._originalStyle) {
         qx.bom.element.Style.set(this._element, property, this._originalStyle[property]);
       }
     }
   },

   _setDimensions : function(height, width)
   {

     var d = { };
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

       var topd  = (height - this._dims[0]) / 2;
       var leftd = (width  - this._dims[1]) / 2;

       if (this._elementPositioning == "absolute")
       {

         if (scaleY) {
           d.top = this._originalTop-topd + 'px';
         }

         if (scaleX) {
           d.left = this._originalLeft-leftd + 'px';
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

     for(var property in d)
     {
       qx.bom.element.Style.set(this._element, property, d[property])
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
     this._disposeFields("_dims");
   }
   
});

