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

   ======================================================================

   This class contains code based on the following work:

   * jQuery Dimension Plugin
       http://jquery.com/
       Version 1.1.3

     Copyright:
       (c) 2007, Paul Bakaus & Brandon Aaron

     License:
       MIT: http://www.opensource.org/licenses/mit-license.php
       
     Authors:
       Paul Bakaus
       Brandon Aaron


************************************************************************ */

isGecko = qx.html2.client.Engine.GECKO;
isMshtml = qx.html2.client.Engine.MSHTML;
isWebkit = qx.html2.client.Engine.WEBKIT;
isOpera = qx.html2.client.Engine.OPERA;

qx.Class.define("qx.html2.Location",
{
  statics :
  {
    style : function(elem, style) {
      return qx.html2.element.Style.get(elem, style);
    },
    
    num : function(elem, style) {
      return parseInt(qx.html2.element.Style.get(elem, style)) || 0;
    },
    
    offsetBody : qx.core.Variant.select("qx.client",
    {
      "gecko" : function(elem, options)
      {
        // Mozilla ignores margin and subtracts border from body element
        var left = elem.offsetLeft + this.num(elem, "marginLeft") + (this.num(elem, "borderLeftWidth") * 2);
        var top = elem.offsetTop + this.num(elem, "marginTop") + (this.num(elem, "borderTopWidth") * 2);
        
        return { left : left, top : top };   
      },
      
      "opera" : function(elem, options)
      {
        // Opera ignores margin
        var left = elem.offsetLeft + this.num(elem, "marginLeft");
        var top = elem.offsetTop + this.num(elem, "marginTop");        
        
        return { left : left, top : top };
      },
      
      "mshtml" : function(elem, options)
      {
        var left = elem.offsetLeft;
        var top = elem.offsetTop;        

        // IE does not add the border in Standards Mode
        if (qx.html2.element.Node.getDocument(elem).compatMode === "CSS1Compat")
        {
          left += this.num(elem, "borderLeftWidth");
          top += this.num(elem, "borderTopWidth");
        }
        
        return { left : left, top : top };
      },
      
      // Safari is the only one to get offsetLeft and offsetTop properties of the body "correct"
      // Except they all mess up when the body is positioned absolute or relative
      "default" : function(elem, options)
      {
        var left = elem.offsetLeft;
        var top = elem.offsetTop;        
        
        return { left : left, top : top };
      }
    }),
    
    offsetElement : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(elem, options)
      {
        var x = 0, y = 0;
        var sl = 0, st = 0;
        
        var parent = elem;
        var op;
        var elemPos = this.style(elem, "position");        
        var relparent = false;
        var stdMode = qx.html2.element.Node.getDocument(elem).compatMode === "CSS1Compat";
        
        do
        {
          x += parent.offsetLeft;
          y += parent.offsetTop;
  
          // IE does not add the border, fix it
          x += this.num(parent, "borderLeftWidth");
          y += this.num(parent, "borderTopWidth");
  
          // IE does not include the border on the body if an 
          // element is position static and without an absolute or relative parent
          if (this.style(parent, "position") == "relative") {
            relparent = true;
          }
  
          op = parent.offsetParent;
  
          if (options.scroll)
          {
            do
            {
              // get scroll offsets
              sl += parent.scrollLeft;
              st += parent.scrollTop;
  
              parent = parent.parentNode;
            }
            while (parent != op);
          }
  
          parent = op;
  
          // Exit the loop if we are at the relativeTo option but not if it is the body or html tag
          if (parent == options.relativeTo && !(parent.tagName == "BODY" || parent.tagName == "HTML")) {
            break;
          }
  
          if (parent.tagName == "BODY" || parent.tagName == "HTML")
          {
            // IE Standards Mode doesn't add the body margin 
            // for elments positioned with static or relative
            if (stdMode && elemPos != "absolute" && elemPos != "fixed")
            {
              x += this.num(parent, "marginLeft");
              y += this.num(parent, "marginTop");
            }
  
            // IE does not include the border on the body if an element 
            // is positioned static and without an absolute or relative parent
            if (elemPos == "static" && !relparent)
            {
              x += this.num(parent, "borderLeftWidth");
              y += this.num(parent, "borderTopWidth");
            }
  
            // Exit the loop
            break; 
          }
        }
        while (parent);
        
        return {
          left : x,
          top : y,
          scrollLeft : sl,
          scrollTop : st 
        };        
      },     
      
      "gecko" : function(elem, options)
      {
        var x = 0, y = 0;
        var sl = 0, st = 0;
        
        var parent = elem;
        
        var op;
        var parPos;
        var elemPos = this.style(elem, "position");
        
        var absparent = false; 
        var relparent = false;
        
        var stdMode = qx.html2.element.Node.getDocument(elem).compatMode === "CSS1Compat";
        
        do
        {
          parPos = this.style(parent, "position");
  
          x += parent.offsetLeft;
          y += parent.offsetTop;
  
          // Mozilla do not add the border
          // add borders to offset
          x += this.num(parent, "borderLeftWidth");
          y += this.num(parent, "borderTopWidth");

          // Mozilla does not include the border on body if an element 
          // isn't positioned absolute and is without an absolute parent
          if (parPos == "absolute") absparent = true;
  
          op = parent.offsetParent;
  
          do
          {
            if (options.scroll)
            {
              // get scroll offsets
              sl += parent.scrollLeft;
              st += parent.scrollTop;
            }

            // Mozilla does not add the border for a parent that has 
            // overflow set to anything but visible
            if (parent != elem && this.style(parent, "overflow") != "visible")
            {
              x += this.num(parent, "borderLeftWidth");
              y += this.num(parent, "borderTopWidth");
            }

            parent = parent.parentNode;
          }
          while (parent != op);
  
          parent = op;
  
          // Exit the loop if we are at the relativeTo option but not 
          // if it is the body or html tag
          if (parent == options.relativeTo && !(parent.tagName == "BODY" || parent.tagName == "HTML"))
          {
            // Mozilla does not add the border for a parent that has overflow 
            // set to anything but visible
            if (parent != elem && this.style(parent, "overflow") != "visible")
            {
              x += this.num(parent, "borderLeftWidth");
              y += this.num(parent, "borderTopWidth");
            }
  
            break;
          }
  
          if (parent.tagName == "BODY" || parent.tagName == "HTML")
          {
            // Mozilla does not include the border on body if an element 
            // isn't positioned absolute and is without an absolute parent
            if (!absparent && elemPos != "fixed")
            {
              x += this.num(parent, "borderLeftWidth");
              y += this.num(parent, "borderTopWidth");
            }
  
            // Exit the loop
            break;
          }
        }
        while (parent);
        
        return {
          left : x,
          top : y,
          scrollLeft : sl,
          scrollTop : st 
        };
      },
      
      "opera" : function(elem, options)
      {
        var x = 0, y = 0;
        var sl = 0, st = 0;
        
        var parent = elem;
        
        var op;
        var parPos;
        var elemPos = this.style(elem, "position");
        
        var absparent = false; 
        var relparent = false;
        
        var stdMode = qx.html2.element.Node.getDocument(elem).compatMode === "CSS1Compat";
        
        do
        {
          parPos = this.style(parent, "position");
  
          x += parent.offsetLeft;
          y += parent.offsetTop;
  
          op = parent.offsetParent;
  
          if (options.scroll)
          {
            do
            {
              // Get scroll offsets
              sl += parent.scrollLeft;
              st += parent.scrollTop;
  
              parent = parent.parentNode;
            }
            while (parent != op);
          }
  
          parent = op;
  
          // Exit the loop if we are at the relativeTo option but not if it is the body or html tag
          if (parent == options.relativeTo && !(parent.tagName == "BODY" || parent.tagName == "HTML"))
          {
            // Opera includes border on positioned parents
            if (this.style(op, "position") != "static")
            {
              x -= this.num(op, "borderLeftWidth");
              y -= this.num(op, "borderTopWidth");
            }
  
            break;
          }
  
          // Exit the loop
          if (parent.tagName == "BODY" || parent.tagName == "HTML") {
            break; 
          }
        }
        while (parent);
        
        return {
          left : x,
          top : y,
          scrollLeft : sl,
          scrollTop : st 
        };   
      },
      
      "webkit" : function(elem, options)
      {
        var x = 0, y = 0;
        var sl = 0, st = 0;
        
        var parent = elem;
        
        var op;
        var parPos;
        var elemPos = this.style(elem, "position");
        
        var absparent = false; 
        var relparent = false;
        
        var stdMode = qx.html2.element.Node.getDocument(elem).compatMode === "CSS1Compat";
        
        do
        {
          parPos = this.style(parent, "position");
  
          x += parent.offsetLeft;
          y += parent.offsetTop;
  
          op = parent.offsetParent;
  
          if (options.scroll)
          {
            do
            {
              // get scroll offsets
              sl += parent.scrollLeft;
              st += parent.scrollTop;
  
              parent = parent.parentNode;
            }
            while (parent != op);
          }
  
          parent = op;
  
          // Exit the loop if we are at the relativeTo option but not if it is the body or html tag
          if (parent == options.relativeTo && !(parent.tagName == "BODY" || parent.tagName == "HTML"))
          {
            // Safari includes border on positioned parents
            if (this.style(op, "position") != "static")
            {
              x -= this.num(op, "borderLeftWidth");
              y -= this.num(op, "borderTopWidth");
            }
  
            break;
          }
  
          if (parent.tagName == "BODY" || parent.tagName == "HTML")
          {
            // Safari doesn't add the body margin for elments positioned with static or relative
            if (isWebkit && elemPos != "absolute" && elemPos != "fixed")
            {
              x += this.num(parent, "marginLeft");
              y += this.num(parent, "marginTop");
            }
  
            // Exit the loop
            break;
          }
        }
        while (parent);
        
        return {
          left : x,
          top : y,
          scrollLeft : sl,
          scrollTop : st 
        };        
      }
    }),
    

    /**
     * TODOC
     *
     * @type static
     * @param options {var} TODOC
     * @param returnObject {var} TODOC
     * @return {var} TODOC
     */
    offset : function(elem, options)
    {
      options = 
      qx.lang.Object.mergeWith({
        margin     : true,
        border     : false,
        padding    : false,
        scroll     : true,
        relativeTo : document.body        
      }, options);
      
      console.debug("Options: Margin=" + options.margin + ", Border=" + options.border + ", Padding=" + options.padding + ", Scroll=" + options.scroll);
      
      var coord = elem.tagName == "BODY" ? this.offsetBody(elem, options) : this.offsetElement(elem, options);
      var returnValue = this.handleOffsetReturn(elem, coord, options);

      return returnValue;
    },


    /**
     * Handles the return value of the offset and offsetLite methods.
     *
     * @type static
     * @param elem {Element} TODOC
     * @param options {var} TODOC
     * @param x {var} TODOC
     * @param y {var} TODOC
     * @param sl {var} TODOC
     * @param st {var} TODOC
     * @return {var} TODOC
     */
    handleOffsetReturn : function(elem, coord, options)
    {
      var x = coord.left;
      var y = coord.top;
      var sl = coord.scrollLeft;
      var st = coord.scrollTop;
      
      if (!options.margin)
      {
        x -= this.num(elem, "marginLeft");
        y -= this.num(elem, "marginTop");
      }

      // Safari and Opera do not add the border for the element
      if (options.border && (isWebkit || isOpera))
      {
        x += this.num(elem, "borderLeftWidth");
        y += this.num(elem, "borderTopWidth");
      }
      else if (!options.border && !(isWebkit || isOpera))
      {
        x -= this.num(elem, "borderLeftWidth");
        y -= this.num(elem, "borderTopWidth");
      }

      if (options.padding)
      {
        x += this.num(elem, "paddingLeft");
        y += this.num(elem, "paddingTop");
      }

      // do not include scroll offset on the element
      if (options.scroll)
      {
        sl -= elem.scrollLeft;
        st -= elem.scrollTop;
      }

      return options.scroll ?

      {
        top        : y - st,
        left       : x - sl,
        scrollTop  : st,
        scrollLeft : sl
      } :

      {
        top  : y,
        left : x
      };
    }
  }
});
