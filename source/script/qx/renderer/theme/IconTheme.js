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

#package(color)
#require(qx.manager.object.ImageManager)

************************************************************************ */

qx.OO.defineClass("qx.renderer.theme.IconTheme", qx.core.Object, 
function(vId, vTitle)
{
  qx.core.Object.call(this);

  if (qx.util.Validation.isInvalidString(vId)) {
    throw new Error("Each instance of qx.renderer.theme.IconTheme need an unique ID!");
  };

  this.setId(vId);
  this.setTitle(qx.util.Validation.isValidString(vTitle) ? vTitle : vId);

  try {
    qx.manager.object.ImageManager.registerIconTheme(this);
  } catch(ex) {
    throw new Error("Could not register Theme: " + ex);
  };
});

qx.OO.addProperty({ name : "id", type : qx.Const.TYPEOF_STRING, allowNull : false });
qx.OO.addProperty({ name : "title", type : qx.Const.TYPEOF_STRING, allowNull : false, defaultValue : qx.Const.CORE_EMPTY });
