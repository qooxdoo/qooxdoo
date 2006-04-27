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

#package(core)
#require(qx.OO)

************************************************************************ */

qx.OO.defineClass("qx.constant.Node",
{
  ELEMENT : 1,
  ATTRIBUTE : 2,
  TEXT : 3,
  CDATA_SECTION : 4,
  ENTITY_REFERENCE : 5,
  ENTITY : 6,
  PROCESSING_INSTRUCTION : 7,
  COMMENT : 8,
  DOCUMENT : 9,
  DOCUMENT_TYPE : 10,
  DOCUMENT_FRAGMENT : 11,
  NOTATION : 12,
});
