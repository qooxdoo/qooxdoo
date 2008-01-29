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
qx.Class.define("qx.fx.Scale",
{

  extend : qx.fx.Base,
  
  /*
    *****************************************************************************
       CONSTRUCTOR
    *****************************************************************************
  */

  construct : function(element, percent, options)
  {
    var effectSpecificOptions = {
      scaleX : true,
      scaleY : true,
      scaleContent : true,
      scaleFromCenter : false,
      scaleMode : 'box',        // 'box' or 'contents' or { } with provided values
      scaleFrom : 100.0,
      scaleTo :   percent
    };

    for(var i in effectSpecificOptions)
    {
      if (!options[i]) {
        options[i] = effectSpecificOptions[i];
      }
    }


    this.base(arguments, element, options);

  },

  
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
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
    _restoreAfterFinish : false,

    setup : function()
    {
    
      this._restoreAfterFinish = (this._options.restoreAfterFinish == true) ? true : false;
      this._elementPositioning = qx.bom.element.Style.get(this._element, "position");

      for (var property in this._originalStyle) {
        this._originalStyle[property] = this._element.style[property];
      }
        
      this._originalTop  = this._element.offsetTop;
      this._originalLeft = this._element.offsetLeft;

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

      this._factor = (this._options.scaleTo - this._options.scaleFrom) / 100;
      
      if (this._options.scaleMode == "box") {
        this._dims = [this._element.offsetHeight, this._element.offsetWidth];
      }else if (this._options.scaleMode == "contents") {
        this._dims = [this._element.scrollHeight, this._element.scrollWidth];
      }

      if (!this._dims) {
        this._dims = [this._options.scaleMode.originalHeight, this._options.scaleMode.originalWidth];
      }
      
    },


    update : function(position)
    {
      var currentScale = (this._options.scaleFrom / 100.0) + (this._factor * position);

      if (this._options.scaleContent && this._fontSize) {
        qx.bom.element.Style.set(this._element, "fontSize", this._fontSize * currentScale + this._fontSizeType);
      }

      this._setDimensions(this._dims[0] * currentScale, this._dims[1] * currentScale);
    },
    
   finish : function(position)
   {
     if (this._restoreAfterFinish)
     {
       for(var property in this._originalStyle) {
         this.debug("Scale: " + property + ": " + this._originalStyle[property])
       }
     }
   },

   _setDimensions : function(height, width)
   {

     var d = { };

     if (this._options.scaleX) {
       d.width = Math.round(width) + 'px';
     }

     if (this._options.scaleY) {
       d.height = Math.round(height) + 'px';
     }

     if (this._options.scaleFromCenter)
     {

       var topd  = (height - this._dims[0]) / 2;
       var leftd = (width  - this._dims[1]) / 2;

       if (this._elementPositioning == "absolute")
       {

         if (this._options.scaleY) {
           d.top = this._originalTop-topd + 'px';
         }

         if (this._options.scaleX) {
           d.left = this._originalLeft-leftd + 'px';
         }

       }
       else
       {

         if (this._options.scaleY) {
           d.top = -topd + 'px';
         }

         if (this._options.scaleX) {
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
     DEFER
  *****************************************************************************
  */

  defer : function(statics) {
    
  }
});
