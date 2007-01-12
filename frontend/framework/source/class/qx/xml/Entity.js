/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2006 by STZ-IDA, Germany, http://www.stz-ida.de

   License:
     LGPL 2.1: http://www.gnu.org/licenses/lgpl.html

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#require(qx.lang.Object)

************************************************************************ */

/**
 * A Collection of utility functions to escape and unescape strings.
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
