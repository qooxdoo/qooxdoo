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

/* ************************************************************************


************************************************************************ */

qx.OO.defineClass("qx.dom.DomElement");

/*!
  Removes whitespace-only text node children
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

/*!
  Checks if a element has no content
*/
qx.dom.DomElement.isEmpty = function(vElement) {
  return vElement.innerHTML.match(/^\s*$/);
}
