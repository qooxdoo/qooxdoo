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
qx.Class.define("qx.dom.Element",
{
  statics :
  {
    /**
     * Removes whitespace-only text node children
     *
     * @type static
     * @param el {Element} DOM el
     * @return {void}
     */
    cleanWhitespace : function(el)
    {
      for (var i=0; i<el.childNodes.length; i++)
      {
        var node = el.childNodes[i];

        if (node.nodeType == qx.dom.Node.TEXT && !/\S/.test(node.nodeValue)) {
          el.removeChild(node);
        }
      }
    },


    /**
     * Checks if a el has no content
     *
     * @type static
     * @param el {Element} DOM el
     * @return {var} TODOC
     */
    isEmpty : function(el) {
      return el.innerHTML.match(/^\s*$/);
    },


    /**
     * Returns the text content of a DOM element
     *
     * @type static
     * @param el {Element} DOM element
     * @return {String} The text content of the element
     * @signature function(el)
     */
    getTextContent : qx.lang.Object.select(qx.core.Client.getInstance().supportsTextContent() ? "textContent" : qx.core.Client.getInstance().supportsInnerText() ? "innerText" : "default",
    {
      innerText : function(el) {
        return el.innerText;
      },

      textContent : function(el) {
        return el.textContent;
      },

      "default" : function() {
        throw new Error("This browser does not support any form of text content handling!");
      }
    }),


    /**
     * Sets the textValue of the given DOM el (http://www.w3.org/TR/2004/REC-DOM-Level-3-Core-20040407/core.html#Node3-textContent).
     * Wrapper for el.innerText and el.textContent.
     *
     * @type static
     * @param el {Element} DOM element
     * @param val {String} the new text content of the element
     * @return {void}
     * @signature function(el, val)
     */
    setTextContent : qx.lang.Object.select(qx.core.Client.getInstance().supportsTextContent() ? "textContent" : qx.core.Client.getInstance().supportsInnerText() ? "innerText" : "default",
    {
      innerText : function(el, val) {
        el.innerText = val;
      },

      textContent : function(el, val) {
        el.textContent = val;
      },

      "default" : function() {
        throw new Error("This browser does not support any form of text content handling!");
      }
    })
  }
});
