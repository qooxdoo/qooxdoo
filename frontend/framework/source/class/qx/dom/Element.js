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
     * Andreas Ecker (ecker)

************************************************************************ */

/**
 * Crossbrowser operations on DOM Elements
 */
qx.Clazz.define("qx.dom.Element",
{
  statics :
  {
    /**
     * Removes whitespace-only text node children
     *
     * @type static
     * @param vElement {Element} DOM element
     * @return {void}
     */
    cleanWhitespace : function(vElement)
    {
      for (var i=0; i<vElement.childNodes.length; i++)
      {
        var node = vElement.childNodes[i];

        if (node.nodeType == qx.dom.Node.TEXT && !/\S/.test(node.nodeValue)) {
          vElement.removeChild(node);
        }
      }
    },


    /**
     * Checks if a element has no content
     *
     * @type static
     * @param vElement {Element} DOM element
     * @return {var} TODOC
     */
    isEmpty : function(vElement) {
      return vElement.innerHTML.match(/^\s*$/);
    },


    /**
     * Returns the text content of a DOM element
     * http://developer.mozilla.org/en/docs/DOM:element.textContent
     *
     * @type static
     * @param element {Element} DOM element
     * @return {String} TODOC
     */
    getTextContent : function(element)
    {
      var text = "";
      var childNodes = element.childNodes;

      for (var i=0; i<childNodes.length; i++)
      {
        var node = childNodes[i];

        if (node.nodeType == qx.dom.Node.TEXT || node.nodeType == qx.dom.Node.CDATA_SECTION) {
          text += node.nodeValue;
        }
      }

      return text;
    },


    /**
     * Sets the textValue of the given DOM element (http://www.w3.org/TR/2004/REC-DOM-Level-3-Core-20040407/core.html#Node3-textContent).
     * Wrapper for element.innerText and element.textContent.
     *
     * @type static
     * @param el {Element} DOM element
     * @param val {String} the value
     * @return {void}
     */
    setTextContent : qx.lang.Object.select(qx.core.Client.getInstance().supportsTextContent() ? "textContent" : qx.core.Client.getInstance().supportsInnerText() ? "innerText" : "none",
    {
      "innerText" : function(el, val) {
        el.innerText = val;
      },

      "textContent" : function(el, val) {
        el.textContent = val;
      },

      "none" : function() {
        throw new Error("This browser does not support any form of text content handling!");
      }
    })
  }
});
