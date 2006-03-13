/* ************************************************************************

   qooxdoo - the new era of web interface development

   Copyright:
     (C) 2004-2006 by Schlund + Partner AG, Germany
         All rights reserved

   License:
     LGPL 2.1: http://creativecommons.org/licenses/LGPL/2.1/

   Internet:
     * http://qooxdoo.oss.schlund.de

   Authors:
     * Sebastian Werner (wpbasti)
       <sebastian dot werner at 1und1 dot de>
     * Andreas Ecker (aecker)
       <andreas dot ecker at 1und1 dot de>

************************************************************************ */

/* ************************************************************************

#package(dom)

************************************************************************ */

/*!
  Removes whitespace-only text node children
*/
QxDom.cleanElementWhitespace = function(vElement)
{
  for (var i=0; i<vElement.childNodes.length; i++)
  {
    var node = vElement.childNodes[i];

    if (node.nodeType == 3 && !/\S/.test(node.nodeValue)) {
      vElement.removeChild(node);
    };
  };
};

/*!
  Checks if a element has no content
*/
QxDom.isElementEmpty = function(vElement) {
  return vElement.innerHTML.match(/^\s*$/);
};
