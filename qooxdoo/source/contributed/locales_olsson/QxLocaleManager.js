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
     * Kent Olsson (kols)
       <kent dot olsson at chello dot se>

************************************************************************ */

/* ************************************************************************

#package(locale)

************************************************************************ */

/*!
  This singleton manages multiple instances of QxLocale.
*/
function QxLocaleManager(){
  QxManager.call(this);

  this.setCurrentLocale(QxLocale.DEFAULT_LOCALE);
};

QxLocaleManager.extend(QxManager, "QxLocaleManager");


QxLocaleManager.addProperty({ name : "currentLocale", type : QxConst.TYPEOF_OBJECT });

/*
---------------------------------------------------------------------------
  MODIFIER
---------------------------------------------------------------------------
*/

proto._modifyCurrentLocale = function(propValue, propOldValue, propData)
{
  QxWidget.flushGlobalQueues();

  return true;
};

/*
---------------------------------------------------------------------------
  DISPOSER
---------------------------------------------------------------------------
*/

proto.dispose = function()
{
  if (this.getDisposed()) {
    return;
  };

  QxObject.prototype.dispose.call(this);
};

/*
---------------------------------------------------------------------------
  SINGLETON INSTANCE
---------------------------------------------------------------------------
*/

QxLocaleManager = new QxLocaleManager();
