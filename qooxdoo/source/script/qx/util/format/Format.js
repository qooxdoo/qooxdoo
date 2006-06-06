/* ************************************************************************

   qooxdoo - the new era of web development

   Copyright:
     2004-2006 by Schlund + Partner AG, Germany
     All rights reserved

   License:
     LGPL 2.1: http://creativecommons.org/licenses/LGPL/2.1/

   Internet:
     * http://qooxdoo.org

   Authors:
     * Sebastian Werner (wpbasti)
       <sw at schlund dot de>
     * Andreas Ecker (ecker)
       <ae at schlund dot de>
     * Til Schneider (til132)
       <tilman dot schneider at stz-ida dot de>

************************************************************************ */

/* ************************************************************************

#require(qx.core.Object)

************************************************************************ */

/**
 * Superclass for formatters and parsers.
 */
qx.OO.defineClass("qx.util.format.Format", qx.core.Object,
function() {
  qx.core.Object.call(this);
});


/**
 * Formats an object.
 *
 * @param obj {var} The object to format.
 * @return {string} the formatted object.
 */
qx.Proto.format = function(obj) {
  throw new Error("format is abstract");
};


/**
 * Parses an object.
 *
 * @param str {string} the string to parse.
 * @return {var} the parsed object.
 */
qx.Proto.parse = function(str) {
  throw new Error("parse is abstract");
};
