/* ************************************************************************

   qooxdoo - the new era of web development

   Copyright:
     2004-2006 by 1&1 Internet AG, Germany
     http://www.1und1.de | http://www.1and1.com
     All rights reserved

   License:
     LGPL 2.1: http://creativecommons.org/licenses/LGPL/2.1/

   Internet:
     * http://qooxdoo.org

   Authors:
     * Sebastian Werner (wpbasti)
       <sebastian dot werner at 1und1 dot de>
     * Andreas Ecker (ecker)
       <andreas dot ecker at 1und1 dot de>

************************************************************************ */

/* ************************************************************************

#module(core)
#require(qx.OO)

************************************************************************ */

qx.OO.defineClass("qx.constant.Core",
{
  // Characters
  EMPTY : "",
  SPACE : " ",
  SLASH : "/",
  DOT : ".",
  ZERO : "0",
  QUOTE : "\"",
  NEWLINE : "\n",
  SINGLEQUOTE : "'",
  STAR : "*",
  PLUS : "+",
  MINUS : "-",
  COMMA : ",",
  DASH : "-",
  UNDERLINE : "_",
  SEMICOLON : ";",
  COLON : ":",
  EQUAL : "=",
  AMPERSAND : "&",
  QUESTIONMARK : "?",
  HASH : "#",
  SMALLER : "<",
  BIGGER : ">",

  // Units
  PERCENT : "%",
  PIXEL : "px",
  MILLISECONDS : "ms",

  // Values
  FLEX : "1*",
  ZEROPIXEL : "0px",
  HUNDREDPERCENT : "100%",

  // Strings
  YES : "yes",
  NO : "no",
  ON : "on",
  OFF : "off",
  SET : "set",
  GET : "get",
  DEFAULT : "default",
  AUTO : "auto",
  NONE : "none",
  DISABLED : "disabled",
  HIDDEN : "hidden"
});
