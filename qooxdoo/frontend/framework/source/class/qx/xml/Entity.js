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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * XML Entities
 */
qx.Class.define("qx.xml.Entity",
{
  statics :
  {

    /** Mapping of XML entity names to the corresponding char code */
    TO_CHARCODE :
    {
      "quot" : 34, // " - double-quote
      "amp"  : 38, // &
      "lt"   : 60, // <
      "gt"   : 62, // >
      "apos" : 39 // XML apostrophe
    },

    /** Mapping of char codes to XML entity names */
    FROM_CHARCODE :
    {
      34: "quot", // " - double-quote
      38: "amp",  // &
      60: "lt",   // <
      62: "gt",   // >
      39: "apos"  // XML apostrophe
    }
  }
});
