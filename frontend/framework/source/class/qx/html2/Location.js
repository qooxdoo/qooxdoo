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

qx.Class.define("qx.html2.Location",
{
  statics :
  {
    __style : function(elem, style) {
      return qx.html2.element.Style.get(elem, style);
    },
    
    __num : function(elem, style) {
      return parseInt(qx.html2.element.Style.get(elem, style)) || 0;
    },
    
    __processBody : qx.core.Variant.select("qx.client",
    {
      "gecko" : function(elem, options)
      {
        // Mozilla ignores margin and subtracts border from body element
        var left = elem.offsetLeft + this.__num(elem, "marginLeft") + (this.__num(elem, "borderLeftWidth") * 2);
        var top = elem.offsetTop + this.__num(elem, "marginTop") + (this.__num(elem, "borderTopWidth") * 2);
        
        return { 
          left : left, 
          top : top 
        };
      },
      
      "opera" : function(elem, options)
      {
        // Opera ignores margin
        var left = elem.offsetLeft + this.__num(elem, "marginLeft");
        var top = elem.offsetTop + this.__num(elem, "marginTop");        
        
        return { 
          left : left, 
          top : top 
        };
      },
      
      "mshtml" : function(elem, options)
      {
        var left = elem.offsetLeft;
        var top = elem.offsetTop;        

        // IE does not add the border in Standards Mode
        if (qx.html2.element.Node.getDocument(elem).compatMode === "CSS1Compat")
        {
          left += this.__num(elem, "borderLeftWidth");
          top += this.__num(elem, "borderTopWidth");
        }
        
        return { 
          left : left, 
          top : top 
        };
      },
      
      // Ideal implementation. Currently only supported by Safari>=3
      "default" : function(elem, options)
      {
        var left = elem.offsetLeft;
        var top = elem.offsetTop;        
        
        return { 
          left : left, 
          top : top 
        };
      }
    }),
    
    __processElement : qx.core.Variant.select("qx.client",
    {
      "--gecko|--mshtml" : function(elem, options)
      {
        rect = elem.getBoundingClientRect();
        
        //alert("RECT: " + rect.left + "x" + rect.top)
        
        return {
          left : Math.round(rect.left),
          top : Math.round(rect.top),
          scrollLeft : 0,
          scrollTop : 0
        };        
      },      
      
      "mshtml|webkit" : function(elem, options)
      {
        var left = 0, top = 0;
        var scrollLeft = 0, scrollTop = 0;
        
        var parent = elem;
        var offsetParent;
        var elemPos = this.__style(elem, "position");        
        var relparent = false;
        var stdMode = qx.html2.element.Node.getDocument(elem).compatMode === "CSS1Compat";
        
        do
        {
          left += parent.offsetLeft;
          top += parent.offsetTop;
  
          // IE & Webkit do not add the border, fix it
          left += this.__num(parent, "borderLeftWidth");
          top += this.__num(parent, "borderTopWidth");
  
          // IE & Webkit do not include the border on the body if an 
          // element is position static and without an absolute or relative parent
          if (this.__style(parent, "position") == "relative") {
            relparent = true;
          }
  
          offsetParent = parent.offsetParent;
  
          // Get scroll offsets
          if (options.scroll)
          {
            do
            {
              scrollLeft += parent.scrollLeft;
              scrollTop += parent.scrollTop;
  
              parent = parent.parentNode;
            }
            while (parent != offsetParent);
          }
  
          parent = offsetParent;
  
          // Exit the loop if we are at the relativeTo option but not if it is the body or html tag
          if (parent == options.relativeTo && !(parent.tagName == "BODY" || parent.tagName == "HTML")) {
            break;
          }
  
          if (parent.tagName == "BODY" || parent.tagName == "HTML")
          {
            // IE and Webkit in Standards Mode do not add the body margin 
            // for elments positioned with static or relative
            if (stdMode && elemPos != "absolute" && elemPos != "fixed")
            {
              left += this.__num(parent, "marginLeft");
              top += this.__num(parent, "marginTop");
            }
  
            // IE and webkit do not include the border on the body if an element 
            // is positioned static and without an absolute or relative parent
            if (elemPos == "static" && !relparent)
            {
              left += this.__num(parent, "borderLeftWidth");
              top += this.__num(parent, "borderTopWidth");
            }
  
            // Exit the loop
            break; 
          }
        }
        while (parent);
        
        return {
          left : left,
          top : top,
          scrollLeft : scrollLeft,
          scrollTop : scrollTop 
        };        
      },     
      
      "gecko" : function(elem, options)
      {
        var left = 0, top = 0;
        var scrollLeft = 0, scrollTop = 0;
        
        var parent = elem;
        
        var offsetParent;
        var parPos;
        var elemPos = this.__style(elem, "position");
        
        var absparent = false; 
        
        do
        {
          parPos = this.__style(parent, "position");
  
          left += parent.offsetLeft;
          top += parent.offsetTop;
  
          // Mozilla do not add the border
          // add borders to offset when using
          // box-sizing=content-box
          if (qx.html2.element.Util.getBoxSizing(parent) !== "border-box") 
          {
            left += this.__num(parent, "borderLeftWidth");
            top += this.__num(parent, "borderTopWidth");
          }

          // Mozilla does not include the border on body if an element 
          // isn't positioned absolute and is without an absolute parent
          if (parPos == "absolute") {
            absparent = true;
          }
  
          offsetParent = parent.offsetParent;
  
          do
          {
            if (options.scroll)
            {
              // get scroll offsets
              scrollLeft += parent.scrollLeft;
              scrollTop += parent.scrollTop;
            }

            // Mozilla does not add the border for a parent that has 
            // overflow set to anything but visible
            if (parent != elem && this.__style(parent, "overflow") != "visible")
            {
              left += this.__num(parent, "borderLeftWidth");
              top += this.__num(parent, "borderTopWidth");
            }

            parent = parent.parentNode;
          }
          while (parent != offsetParent);
  
          parent = offsetParent;
  
          // Exit the loop if we are at the relativeTo option but not 
          // if it is the body or html tag
          if (parent == options.relativeTo && !(parent.tagName == "BODY" || parent.tagName == "HTML"))
          {
            // Mozilla does not add the border for a parent that has overflow 
            // set to anything but visible
            if (parent != elem && this.__style(parent, "overflow") != "visible")
            {
              left += this.__num(parent, "borderLeftWidth");
              top += this.__num(parent, "borderTopWidth");
            }
  
            break;
          }
  
          if (parent.tagName == "BODY" || parent.tagName == "HTML")
          {
            // Mozilla does not include the border on body if an element 
            // isn't positioned absolute and is without an absolute parent
            if (!absparent && elemPos != "fixed")
            {
              left += this.__num(parent, "borderLeftWidth");
              top += this.__num(parent, "borderTopWidth");
            }
  
            // Exit the loop
            break;
          }
        }
        while (parent);
        
        return {
          left : left,
          top : top,
          scrollLeft : scrollLeft,
          scrollTop : scrollTop 
        };
      },
      
      "opera" : function(elem, options)
      {
        var left = 0, top = 0;
        var scrollLeft = 0, scrollTop = 0;
        
        var parent = elem;
        
        var offsetParent;
        var parPos;
        var elemPos = this.__style(elem, "position");
        
        do
        {
          parPos = this.__style(parent, "position");
  
          left += parent.offsetLeft;
          top += parent.offsetTop;
  
          offsetParent = parent.offsetParent;
  
          if (options.scroll)
          {
            do
            {
              // Get scroll offsets
              scrollLeft += parent.scrollLeft;
              scrollTop += parent.scrollTop;
  
              parent = parent.parentNode;
            }
            while (parent != offsetParent);
          }
  
          parent = offsetParent;
  
          // Exit the loop if we are at the relativeTo option but not if it is the body or html tag
          if (parent == options.relativeTo && !(parent.tagName == "BODY" || parent.tagName == "HTML"))
          {
            // Opera includes border on positioned parents
            if (this.__style(offsetParent, "position") != "static")
            {
              left -= this.__num(offsetParent, "borderLeftWidth");
              top -= this.__num(offsetParent, "borderTopWidth");
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
          left : left,
          top : top,
          scrollLeft : scrollLeft,
          scrollTop : scrollTop 
        };   
      },
      
      // Ideal handler
      "default" : function(elem, options)
      {
        var left = 0, top = 0;
        var scrollLeft = 0, scrollTop = 0;
        var parent = elem;
        var offsetParent;
        
        do
        {
          left += parent.offsetLeft;
          top += parent.offsetTop;
  
          offsetParent = parent.offsetParent;
  
          // offsetParent can jump over elements in node hierarchy, but
          // for scrolling support we must respect every node, even if 
          // it do not affect the offsets
          if (options.scroll)
          {
            do
            {
              // Get scroll offsets
              scrollLeft += parent.scrollLeft;
              scrollTop += parent.scrollTop;
  
              parent = parent.parentNode;
            }
            while (parent != offsetParent);
          }
  
          parent = offsetParent;
  
          // Exit the loop
          if (parent == options.relativeTo || parent.tagName == "BODY" || parent.tagName == "HTML") {
            break; 
          }
        }
        while (parent);
        
        return {
          left : left,
          top : top,
          scrollLeft : scrollLeft,
          scrollTop : scrollTop 
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
    get : function(elem, options)
    {
      options = 
      qx.lang.Object.mergeWith({
        margin     : true,
        border     : false,
        padding    : false,
        scroll     : true,
        relativeTo : document.body        
      }, options);
      
      // console.debug("Options: Margin=" + options.margin + ", Border=" + options.border + ", Padding=" + options.padding + ", Scroll=" + options.scroll);
      
      var coord = elem.tagName == "BODY" ? 
        this.__processBody(elem, options) : 
        this.__processElement(elem, options);

      return this.__finalize(elem, coord, options);
    },


    /**
     * Handles the return value of the offset and offsetLite methods.
     *
     * @type static
     * @param elem {Element} TODOC
     * @param options {var} TODOC
     * @param left {var} TODOC
     * @param top {var} TODOC
     * @param scrollLeft {var} TODOC
     * @param scrollTop {var} TODOC
     * @return {var} TODOC
     */
    __finalize : function(elem, coord, options)
    {
      var isGecko = qx.html2.client.Engine.GECKO;
      var isOpera = qx.html2.client.Engine.OPERA;
      
      var left = coord.left;
      var top = coord.top;
      var scrollLeft = coord.scrollLeft;
      var scrollTop = coord.scrollTop;
      
      if (!options.margin)
      {
        left -= this.__num(elem, "marginLeft");
        top -= this.__num(elem, "marginTop");
      }

      // Opera do not add the border for the element
      if (options.border && isOpera)
      {
        left += this.__num(elem, "borderLeftWidth");
        top += this.__num(elem, "borderTopWidth");
      }
      else if (!options.border && !isOpera)
      {
        left -= this.__num(elem, "borderLeftWidth");
        top -= this.__num(elem, "borderTopWidth");
      }
      
      // Gecko content-box
      if (isGecko && (qx.html2.element.Util.getBoxSizing(elem) === "border-box"))
      {
        left += this.__num(elem, "borderLeftWidth");
        top += this.__num(elem, "borderTopWidth");      
      }

      if (options.padding)
      {
        left += this.__num(elem, "paddingLeft");
        top += this.__num(elem, "paddingTop");
      }

      // Do not include scroll offset on the element
      if (options.scroll)
      {
        scrollLeft -= elem.scrollLeft;
        scrollTop -= elem.scrollTop;
      }

      return options.scroll ?

      {
        top        : top - scrollTop,
        left       : left - scrollLeft,
        scrollTop  : scrollTop,
        scrollLeft : scrollLeft
      } :

      {
        top  : top,
        left : left
      };
    }
  }
});
