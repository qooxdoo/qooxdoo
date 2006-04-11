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
#require(QxImageManager)

************************************************************************ */

qx.renderer.theme.IconTheme = function(vId, vTitle)
{
  qx.core.Object.call(this);

  if (qx.util.validator.isInvalidString(vId)) {
    throw new Error("Each instance of qx.renderer.theme.IconTheme need an unique ID!");
  };

  this.setId(vId);
  this.setTitle(qx.util.validator.isValidString(vTitle) ? vTitle : vId);

  try {
    QxImageManager.registerIconTheme(this);
  } catch(ex) {
    throw new Error("Could not register Theme: " + ex);
  };
};

qx.renderer.theme.IconTheme.extend(qx.core.Object, "qx.renderer.theme.IconTheme");

qx.renderer.theme.IconTheme.addProperty({ name : "id", type : QxConst.TYPEOF_STRING, allowNull : false });
qx.renderer.theme.IconTheme.addProperty({ name : "title", type : QxConst.TYPEOF_STRING, allowNull : false, defaultValue : QxConst.CORE_EMPTY });
