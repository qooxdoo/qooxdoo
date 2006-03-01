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

function QxWidgetTheme(vId, vTitle)
{
  QxObject.call(this);

  if (QxUtil.isInvalidString(vId)) {
    throw new Error("Each instance of QxWidgetTheme need an unique ID!");
  };

  this.setId(vId);
  this.setTitle(QxUtil.isValidString(vTitle) ? vTitle : vId);

  try {
    QxImageManager.registerWidgetTheme(this);
  } catch(ex) {
    throw new Error("Could not register Theme: " + ex);
  };
};

QxWidgetTheme.extend(QxObject, "QxWidgetTheme");

QxWidgetTheme.addProperty({ name : "id", type : QxConst.TYPEOF_STRING, allowNull : false });
QxWidgetTheme.addProperty({ name : "title", type : QxConst.TYPEOF_STRING, allowNull : false, defaultValue : QxConst.CORE_EMPTY });
