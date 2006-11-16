/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2006 by 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL 2.1: http://www.gnu.org/licenses/lgpl.html

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/**
 * Crossbrowser operations on DOM Nodes
 */
qx.OO.defineClass("qx.dom.DomElement");


/**
 * Removes whitespace-only text node children
 *
 * @param vElement {Element} DOM element
 */
qx.dom.DomElement.cleanWhitespace = function(vElement)
{
  for (var i=0; i<vElement.childNodes.length; i++)
  {
    var node = vElement.childNodes[i];

    if (node.nodeType == 3 && !/\S/.test(node.nodeValue)) {
      vElement.removeChild(node);
    }
  }
}


/**
 * Checks if a element has no content
 *
 * @param vElement {Element} DOM element
 */
qx.dom.DomElement.isEmpty = function(vElement) {
  return vElement.innerHTML.match(/^\s*$/);
}


/**
 * Sets the textValue of the given DOM element.
 * Wrapper for element.innerText and element.textContent.
 *
 * @param vElement {Element} DOM node
 * @param sValue {string}
 */
qx.dom.DomElement.setTextContent = function(vElement, sValue) {};

if (qx.sys.Client.getInstance().supportsTextContent()) {
  qx.dom.DomElement.setTextContent = function(vElement, sValue) {
    vElement.textContent = sValue;
  };
} else if (qx.sys.Client.getInstance().supportsInnerText()) {
  qx.dom.DomElement.setTextContent = function(vElement, sValue) {
    vElement.innerText = sValue;
  };
} else {
  qx.dom.DomElement.setTextContent = function(vElement, sValue) {
    vElement.innerHTML = sValue;
  };
}
