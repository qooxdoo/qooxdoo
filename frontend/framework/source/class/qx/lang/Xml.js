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

qx.OO.defineClass("qx.lang.Xml");

// Create an XML dom node
qx.lang.Xml.createXmlDom = function()
{
  // Mozilla style
  if (document.implementation && document.implementation.createDocument) {
    return document.implementation.createDocument("", "", null);
  }

  // Microsoft style
  if (window.ActiveXObject) {
    return new ActiveXObject("Microsoft.XMLDOM");
  }

  throw new Error("This browser does not support xml dom creation.");
};

