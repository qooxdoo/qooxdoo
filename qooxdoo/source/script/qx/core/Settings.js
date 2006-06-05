/* ************************************************************************

   qooxdoo - the new era of web development

   Copyright:
     (C) 2004-2006 by Schlund + Partner AG, Germany
         All rights reserved

   License:
     LGPL 2.1: http://creativecommons.org/licenses/LGPL/2.1/

   Internet:
     * http://qooxdoo.org

   Authors:
     * Sebastian Werner (wpbasti)
       <sebastian dot werner at 1und1 dot de>
     * Andreas Ecker (aecker)
       <andreas dot ecker at 1und1 dot de>

************************************************************************ */

/* ************************************************************************

#package(core)
#require(qx.OO)
#require(qx.core.DefaultSettings)

************************************************************************ */

qx.OO.defineClass("qx.core.Settings");

// hide from global scope
(function() {

// merge settings from default settings
for (var vKey in qx.core.DefaultSettings)
{
  if (typeof qx.core.Settings[vKey] === "undefined") {
    qx.core.Settings[vKey] = qx.core.DefaultSettings[vKey];
  };
};

// hide from global scope
})();
