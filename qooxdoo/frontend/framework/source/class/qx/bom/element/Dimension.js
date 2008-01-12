/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)

************************************************************************ */

/* ************************************************************************

#module(bom)

************************************************************************ */

/**
 * Contains support for calculating dimensions of HTML elements.
 */
qx.Class.define("qx.bom.element.Dimension",
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
      QUERY
    ---------------------------------------------------------------------------
    */

    /**
     * Returns the (box) width of the given element.
     *
     * @type static
     * @param element {Element} DOM element to query
     * @return {Integer} width of the element
     */
    getWidth : function(element) {
      return element.offsetWidth;
    },

    /**
     * Returns the (box) height of the given element.
     *
     * @type static
     * @param element {Element} DOM element to query
     * @return {Integer} height of the element
     */
    getHeight : function(element) {
      return element.offsetHeight;
    },

    /**
     * Returns the client width of the given element.
     *
     * @type static
     * @param element {Element} DOM element to query
     * @return {Integer} inner width of the element
     */
    getClientWidth : function(element) {
      return element.clientWidth;
    },

    /**
     * Returns the client height of the given element.
     *
     * @type static
     * @param element {Element} DOM element to query
     * @return {Integer} inner height of the element
     */
    getClientHeight : function(element) {
      return element.clientHeight;
    },

    /**
     * Returns the scroll width of the given element.
     *
     * @type static
     * @param element {Element} DOM element to query
     * @return {Integer} scroll width of the element
     */
    getScrollWidth : function(element) {
      return element.scrollWidth;
    },

    /**
     * Returns the scroll height of the given element.
     *
     * @type static
     * @param element {Element} DOM element to query
     * @return {Integer} scroll height of the element
     */
    getScrollHeight : function(element) {
      return element.scrollHeight;
    },





    /*
    ---------------------------------------------------------------------------
      BOX SIZING
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
     * @signature function(element, sizing)
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
     * @signature function(element, sizing)
     * @param element {Element} DOM element to modify
     * @param sizing {String} "content-box" or "border-box"
     * @return {void}
     */
    getBoxSizing : qx.core.Variant.select("qx.client",
    {
      // Gecko properitary
      "gecko" : function(element) {
        return qx.bom.element.Style.get(element, "MozBoxSizing", qx.bom.element.Style.COMPUTED_MODE, false);
      },

      // Not directly supported in MSHTML, using render mode
      "mshtml" : function(element)
      {
        if (qx.bom.Document.isStandardMode(qx.dom.Node.getDocument(element)))
        {
          if (!this.__usesNativeBorderBox(element)) {
            return "content-box";
          }
        }

        return "border-box";
      },

      // Webkit & Opera
      "default" : function(element) {
        return qx.bom.element.Style.get(element, "boxSizing", qx.bom.element.Style.COMPUTED_MODE, false);
      }
    })
  }
});
