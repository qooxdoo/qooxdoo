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
        if (qx.html2.Document.isStandardMode(qx.html2.node.Util.getDocument(element)))
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
