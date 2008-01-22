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

/* ************************************************************************

#module(core)

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
    options = {
      scaleX : true,
      scaleY : true,
      scaleContent : true,
      scaleFromCenter : false,
      scaleMode : 'box',        // 'box' or 'contents' or { } with provided values
      scaleFrom : 100.0,
      scaleTo :   percent
    };

    this.base(arguments, element, options);

    
    //this.start(options);

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
      'top' : null,
      'left' : null,
      'width' : null,
      'height' : null,
      'fontSize' : null
    },

    _originalTop  : null,
    _originalLeft : null,
    _fontSize : null,
    _fontSizeType : null,
    _factor : null,
    _dims : [],
    _elementPositioning : null,

    setup : function()
    {
    
      this.restoreAfterFinish = this._options.restoreAfterFinish || false;
      //this._elementPositioning = this._element.getStyle('position');
      this._elementPositioning = qx.bom.element.Style.get(this._element, "position");
      
      /*
      ['top','left','width','height','fontSize'].each( function(k) {
        this._originalStyle[k] = this._element.style[k];
      }.bind(this));
      */
      for(var property in this._originalStyle)
      {
        this._originalStyle[property] = this._element.style[property];
      }
        
      this._originalTop  = this._element.offsetTop;
      this._originalLeft = this._element.offsetLeft;

      
      //var fontSize = this._element.getStyle('font-size') || '100%';
      var fontSize = qx.bom.element.Style.get(this._element, "font-size");
      if(fontSize == "")
      {
        fontSize = "100%";
      }
            
      
/*
      var fontSize = this._element.getStyle('font-size') || '100%';
      ['em','px','%','pt'].each( function(fontSizeType) {
        if (fontSize.indexOf(fontSizeType)>0) {
          this._fontSize     = parseFloat(fontSize);
          this._fontSizeType = fontSizeType;
        }
      }.bind(this));
*/

      this.factor = (this._options.scaleTo - this._options.scaleFrom) / 100;
      
      if (this._options.scaleMode=='box')
      {
        this._dims = [this._element.offsetHeight, this._element.offsetWidth];
      }

/*
      if (/^content/.test(this._options.scaleMode))
      {
        this._dims = [this._element.scrollHeight, this._element.scrollWidth];
      }
*/
      if (!this._dims) {
        this._dims = [this._options.scaleMode.originalHeight,
                     this._options.scaleMode.originalWidth];
      }
      
    },


    update : function(position)
    {
      var currentScale = (this._options.scaleFrom/100.0) + (this.factor * position);

      if(this._options.scaleContent && this._fontSize)
      {
        this._element.setStyle({fontSize: this._fontSize * currentScale + this._fontSizeType });
      }

      this.setDimensions(this._dims[0] * currentScale, this._dims[1] * currentScale);
    },
    
   finish : function(position)
   {
     if (this.restoreAfterFinish) this._element.setStyle(this._originalStyle);
   },

   setDimensions : function(height, width)
   {

     var d = { };

     if (this._options.scaleX)
     {
       d.width = Math.round(width) + 'px';
     }

     if (this._options.scaleY)
     {
       d.height = Math.round(height) + 'px';
     }

     if (this._options.scaleFromCenter)
     {

       var topd  = (height - this._dims[0])/2;
       var leftd = (width  - this._dims[1])/2;

       if (this._elementPositioning == 'absolute')
       {
         if (this._options.scaleY) d.top = this._originalTop-topd + 'px';
         if (this._options.scaleX) d.left = this._originalLeft-leftd + 'px';
       }
         else
       {
         if (this._options.scaleY) d.top = -topd + 'px';
         if (this._options.scaleX) d.left = -leftd + 'px';
       }
     }

     //this._element.setStyle(d);
     var cssText = '';
     for(var property in d)
     {
       //cssText += property + ":" + d[property] + ";";
       qx.bom.element.Style.set(this._element, property, d[property])
     }
     //console.warn(cssText)
     //qx.bom.element.Style.setCss(this._element, cssText)
     
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
