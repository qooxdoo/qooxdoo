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
    
    
    
    


    __computeScroll : function(elem)
    {
      var left = 0;
      var top = 0;
      
      // Find body element
      var body = qx.html2.element.Node.getDocument(elem).body;

      // Only the parents are influencing the scroll position
      elem = elem.parentNode;
      
      // Get scroll offsets 
      // (stop at the body => the body scroll position is irrelevant)
      while (elem && elem != body)
      {
        left += elem.scrollLeft;
        top += elem.scrollTop;

        // One level up (children hierarchy)
        elem = elem.parentNode;
      }
      
      return {
        left : left,
        top : top
      };    
    },
    
        
    
    
    
    __computeBody : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(elem)
      {
        // Find body element
        var body = qx.html2.element.Node.getDocument(elem).body;
        
        // Start with the offset
        var left = body.offsetLeft;
        var top = body.offsetTop;   
        
        // Substract the body border        
        left -= this.__num(body, "borderLeftWidth");
        top -= this.__num(body, "borderTopWidth");
                  
        // Add the margin when running in standard mode
        if (qx.html2.element.Node.getDocument(elem).compatMode === "CSS1Compat")
        {
          left += this.__num(body, "marginLeft");
          top += this.__num(body, "marginTop");                  
        }
        
        return { 
          left : left, 
          top : top 
        };
      },
      
      "webkit" : function(elem)
      {
        // Find body element
        var body = qx.html2.element.Node.getDocument(elem).body;
        
        // Start with the offset
        var left = body.offsetLeft;
        var top = body.offsetTop;   
        
        // Add the margin when running in standard mode
        if (qx.html2.element.Node.getDocument(elem).compatMode === "CSS1Compat")
        {
          left += this.__num(body, "marginLeft");
          top += this.__num(body, "marginTop");                  
        }
        
        return { 
          left : left, 
          top : top 
        };
      },    
      
      "gecko" : function(elem)
      {
        // Find body element
        var body = qx.html2.element.Node.getDocument(elem).body;
              
        // Start with the offset
        var left = body.offsetLeft;
        var top = body.offsetTop;
        
        // Correct substracted border (only in content-box mode)
        if (qx.html2.element.Util.getBoxSizing(body) !== "border-box") 
        {          
          left += this.__num(body, "borderLeftWidth");
          top += this.__num(body, "borderTopWidth"); 
                      
          // For some unknown reason we must add the border two times
          // when there is no absolute positioned element in the DOM tree
          if (!this.__hasAbsolute(elem))
          {
            left += this.__num(body, "borderLeftWidth");
            top += this.__num(body, "borderTopWidth");          
          }
        }
        
        return { 
          left : left, 
          top : top 
        };
      },
      
              
      // At the moment only correctly supported by Opera
      "default" : function(elem)
      {
        // Find body element
        var body = qx.html2.element.Node.getDocument(elem).body;

        // Start with the offset
        var left = body.offsetLeft;
        var top = body.offsetTop;
        
        return { 
          left : left, 
          top : top 
        };
      }      
    }),
    
    
    
    
    
    __hasAbsolute : qx.core.Variant.select("qx.client",
    {
      "gecko" : function(elem)
      {
        while (elem)
        {
          if (qx.html2.element.Style.get(elem, "position") === "absolute" || qx.html2.element.Style.get(elem, "position") === "fixed") {
            return true; 
          } 
         
          elem = elem.offsetParent; 
        }
        
        return false;
      },
      
      "default" : null
    }),
    
    
    
    
    __computeOffset : qx.core.Variant.select("qx.client",
    {
      "mshtml|webkit" : function(elem)
      {
        var left = elem.offsetLeft;
        var top = elem.offsetTop;
        
        elem = elem.offsetParent;
        
        while (elem && elem.nodeType === 1)
        {
          // Add node offsets
          left += elem.offsetLeft;
          top += elem.offsetTop;
          
          // Fix missing border
          left += this.__num(elem, "borderLeftWidth");
          top += this.__num(elem, "borderTopWidth");
          
          // One level up (offset hierarchy)
          elem = elem.offsetParent;
        }
        
        return {
          left : left,
          top : top 
        }
      },
      
      "gecko" : function(elem)
      {
        var left = 0;
        var top = 0;
        
        if (qx.html2.element.Util.getBoxSizing(elem) !== "border-box") 
        { 
          left -= this.__num(elem, "borderLeftWidth");
          top -= this.__num(elem, "borderTopWidth");
        }
        
        while (elem && elem.nodeType === 1)
        {
          // Add node offsets
          left += elem.offsetLeft;
          top += elem.offsetTop;
          
          // Mozilla do not add the border add borders to offset 
          // when using box-sizing=content-box
          if (qx.html2.element.Util.getBoxSizing(elem) !== "border-box") 
          {          
            left += this.__num(elem, "borderLeftWidth");
            top += this.__num(elem, "borderTopWidth");
          }
          
          // Mozilla does not add the border for a parent that has 
          // overflow set to anything but visible
          if (elem.parentNode && this.__style(elem.parentNode, "overflow") != "visible")
          {
            left += this.__num(elem.parentNode, "borderLeftWidth");
            top += this.__num(elem.parentNode, "borderTopWidth");
          }          
          
          // One level up (offset hierarchy)
          elem = elem.offsetParent;
        }
        
        return {
          left : left,
          top : top 
        }
      },      
      
      // At the moment only correctly supported by Opera
      "default" : function(elem)
      {
        var left = 0;
        var top = 0;
        
        // Add all offsets of parent hierarchy, do not include
        // body element. This element is processed separately by
        // __computeBody()
        while (elem  && elem.nodeType === 1)
        {
          // Add node offsets
          left += elem.offsetLeft;
          top += elem.offsetTop;
          
          // One level up (offset hierarchy)
          elem = elem.offsetParent;          
        }
        
        return {
          left : left,
          top : top 
        }        
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
    get : function(elem, mode)
    {
      var offset = this.__computeOffset(elem);
      var body = this.__computeBody(elem);
      var scroll = this.__computeScroll(elem);
      
      var left = offset.left + body.left - scroll.left;
      var top = offset.top + body.top - scroll.top;
      
      if (mode)
      {
        switch(mode)
        {
          case "margin":
            left -= this.__num(elem, "marginLeft");
            top -= this.__num(elem, "marginTop");
            break;

          case "content":
            left += this.__num(elem, "paddingLeft");
            top += this.__num(elem, "paddingTop");            
            // no break here
          
          case "border":
            left += this.__num(elem, "borderLeftWidth");
            top += this.__num(elem, "borderTopWidth");            
            break;
        }
      }
      
      return {
        left : left,
        top : top
      };
    }
  }
});
