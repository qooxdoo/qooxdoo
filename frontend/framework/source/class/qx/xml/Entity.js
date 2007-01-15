/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 by 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL 2.1: http://www.gnu.org/licenses/lgpl.html

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#require(qx.lang.Object)

************************************************************************ */

/**
 * XML Entities
 */
qx.OO.defineClass("qx.xml.Entity");


/** Mapping of XML entity names to the corresponding char code */
qx.Class.TO_CHARCODE = {
  "quot": 34, // " - double-quote
  "amp": 38, // &
  "lt": 60, // <
  "gt": 62, // >
  "apos": 39 // XML apostrophe
};


/** Mapping of char codes to XML entity names */
qx.Class.FROM_CHARCODE = qx.lang.Object.invert(qx.Class.TO_CHARCODE);
