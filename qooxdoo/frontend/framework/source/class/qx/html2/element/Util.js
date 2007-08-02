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

   * Prototype JS
     http://www.prototypejs.org/
     Version 1.5

     Copyright:
       (c) 2006-2007, Prototype Core Team

     License:
       MIT: http://www.opensource.org/licenses/mit-license.php

     Authors:
       * Prototype Core Team


************************************************************************ */

/* ************************************************************************

#module(html2)

************************************************************************ */

/**
 * Contains miscellaneous utilities to operate on HTML elements.
 */
qx.Class.define("qx.html2.element.Util",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /*
    ---------------------------------------------------------------------------
      STRING HELPERS
    ---------------------------------------------------------------------------
    */

    /**
     * Converts a script style property name to the CSS variant e.g. marginTop => margin-top
     *
     * @type static
     * @param name {String} Name of the style attribute (CSS variant e.g. marginTop, wordSpacing)
     * @return {String} the CSS style name e.g. margin-top, word-spacing
     */
    toCssStyle : function(name) {
      return name.replace(/([A-Z])/g, '-$1').toLowerCase();
    },


    /**
     * Converts a CSS style property name to the script variant e.g. margin-top => marginTop
     *
     * @type static
     * @param name {String} Name of the style attribute (CSS variant e.g. margin-top, word-spacing)
     * @return {String} the script style name e.g. marginTop, wordSpacing
     */
    toScriptStyle : function(name)
    {
      return name.replace(/\-([a-z])/g, function(match, chr) {
        return chr.toUpperCase();
      });
    },



    
    
    
    
    /*
    ---------------------------------------------------------------------------
      ELEMENT CLIP
    ---------------------------------------------------------------------------
    */
    
        
    
    
    
    /*
    ---------------------------------------------------------------------------
      ELEMENT CURSOR
    ---------------------------------------------------------------------------
    */    
    
    __cursorMap : qx.core.Variant.select("qx.client",
    {
      "mshtml" :
      {
        "cursor" : "hand",
        "ew-resize" : "e-resize",
        "ns-resize" : "n-resize",
        "nesw-resize" : "ne-resize",
        "nwse-resize" : "nw-resize"
      },
      
      "opera" :
      {
        "col-resize" : "e-resize",
        "row-resize" : "n-resize",
        "ew-resize" : "e-resize",
        "ns-resize" : "n-resize",
        "nesw-resize" : "ne-resize",
        "nwse-resize" : "nw-resize"
      },
      
      "default" : {}
    }),    
    
    getCursor : function(element) {
      return qx.html2.element.Style.getComputed(element, "cursor");
    },
    
    setCursor : function(element, value) 
    {
      qx.html2.element.Style.set(element, this.__cursorMap[value] || value);
      return value;
    },
    




    /*
    ---------------------------------------------------------------------------
      ELEMENT CSS
    ---------------------------------------------------------------------------
    */

    /**
     * Set the full CSS content of the style attribute
     *
     * @type static
     * @param element {Element} The DOM element to modify
     * @param value {String} The full CSS string
     * @signature function(element, value)
     * @return {void}
     */
    setCss : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(element, value) {
        element.style.cssText = value;
      },

      "default" : function(element, value) {
        element.setAttribute("style", value);
      }
    }),


    /**
     * Returns the full content of the style attribute.
     *
     * @type static
     * @param element {Element} The DOM element to query
     * @return {String} the full CSS string
     * @signature function(element)
     */
    getCss : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(element) {
        return element.style.cssText.toLowerCase();
      },

      "default" : function(element) {
        return element.getAttribute("style");
      }
    }),




    /*
    ---------------------------------------------------------------------------
      SCROLL POSITION
    ---------------------------------------------------------------------------
    */

    /**
     * Scrolls the given element to the given X-position (distance from left edge)
     *
     * @type static
     * @param element {Element} The element which should be modified
     * @param x {var} New X-position
     * @return {void}
     */
    setScrollX : function(element, x) {
      element.scrollLeft = x;
    },


    /**
     * Scrolls the given element to the given Y-position (distance from top edge)
     *
     * @type static
     * @param element {Element} The element which should be modified
     * @param y {var} New Y-position
     * @return {void}
     */
    setScrollY : function(element, y) {
      element.scrollTop = y;
    },
    
    
    /**
     * Returns the scroll position of the X-axis of the given element.
     *
     * @type static
     * @param element {Element} The element which should be queried
     * @return {Integer} current X-position (distance from left edge)
     */
    getScrollX : function(element) {
      return parseInt(element.scrollLeft);
    },


    /**
     * Returns the scroll position of the Y-axis of the given element.
     *
     * @type static
     * @param element {Element} The element which should be queried
     * @return {Integer} current Y-position (distance from top edge)
     */
    getScrollY : function(element) {
      return parseInt(element.scrollTop);
    },    
    
    




    /*
    ---------------------------------------------------------------------------
      ELEMENT VISIBILITY
    ---------------------------------------------------------------------------
    */

    /**
     * Shows the given element
     *
     * @type static
     * @param element {Element} DOM element to show
     * @return {void}
     */
    show : function(element) {
      element.style.visibility = "visible";
    },


    /**
     * Hides the given element
     *
     * @type static
     * @param element {Element} DOM element to hide
     * @return {void}
     */
    hide : function(element) {
      element.style.visibility = "hidden";
    },


    /**
     * Toggle the visibility of the given element
     *
     * @type static
     * @param element {Element} DOM element to show
     * @return {void}
     */
    toggle : function(element) {
      element.style.visibility = this.isHidden(element) ? "visible" : "hidden";
    },


    /**
     * Whether the given element is visible
     *
     * @type static
     * @param element {Element} DOM element to query
     * @return {Boolean} true when the element is visible
     */
    isVisible : function(element) {
      return !this.isHidden(element);
    },


    /**
     * Whether the given element is hidden
     *
     * @type static
     * @param element {Element} DOM element to query
     * @return {Boolean} true when the element is hidden
     */
    isHidden : function(element) {
      return qx.html2.element.Style.getComputed(element, "visibility") === "hidden";
    },
    
    
    
    
    
    /*
    ---------------------------------------------------------------------------
      ELEMENT BOX SIZING
    ---------------------------------------------------------------------------
    */
    
    /** Internal data structure for __usesNativeBorderBox() */
    __nativeBorderBox : 
    {
      tags :
      {
        button : true,
        select : true
      },
      
      types : 
      {
        search : true,
        button : true,
        submit : true,
        reset : true,
        checkbox : true,
        radio : true 
      }
    },
    
    
    /**
     * Whether the given elements defaults to the "border-box" Microsoft model in all cases.
     * 
     * @param element {Element} DOM element to query
     * @return {Boolean} true when the element uses "border-box" independently from the doctype
     */
    __usesNativeBorderBox : function(element)
    {
      var map = this.__nativeBorderBox;
      return map.tags[element.tagName.toLowerCase()] || map.types[element.type];
    },  
    
    
    /**
     * Modifies the box sizing of the given element. Please note that this 
     * is not possible in MSHTML. There is no exception or warning in this case.
     *
     * Allowed values:
     *
     * * "content-box" = W3C model (dimensions are content specific)
     * * "border-box" = Microsoft model (dimensions are box specific incl. border and padding)
     *
     * @type static
     * @param element {Element} DOM element to modify
     * @param sizing {String} "content-box" or "border-box"
     * @return {void}
     */    
    setBoxSizing : qx.core.Variant.select("qx.client",
    {
      // Gecko properitary
      "gecko" : function(element, sizing) {
        element.style.MozBoxSizing = sizing || "";
      },

      // Not supported in MSHTML 
      "mshtml" : function(element, sizing) {
      },

      // Webkit & Opera
      "default" : function(element, sizing) {
        element.style.boxSizing = sizing || "";
      }
    }),
    
    
    /**
     * Query the used box sizing of the given element. Please note that
     * this is not dynamically modifyable at element level in MSHTML.
     * The query is a result of the document standard/quirks mode then.
     *
     * Allowed values:
     *
     * * "content-box" = W3C model (dimensions are content specific)
     * * "border-box" = Microsoft model (dimensions are box specific incl. border and padding)
     *
     * @type static
     * @param element {Element} DOM element to modify
     * @param sizing {String} "content-box" or "border-box"
     * @return {void}
     */      
    getBoxSizing : qx.core.Variant.select("qx.client",
    {
      // Gecko properitary
      "gecko" : function(element) {
        return qx.html2.element.Style.getComputed(element, "MozBoxSizing");
      },

      // Not directly supported in MSHTML, using render mode
      "mshtml" : function(element) 
      {
        if (qx.html2.Document.isStandardMode(qx.html2.element.Node.getDocument(element)))
        {
          if (!this.__usesNativeBorderBox(element)) {
            return "content-box";    
          }
        }
        
        return "border-box";
      },

      // Webkit & Opera
      "default" : function(element) {
        return qx.html2.element.Style.getComputed(element, "boxSizing");
      }      
    })    
  }
});
