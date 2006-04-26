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
  qx.manager.object.ObjectManager.call(this);

  this.setCurrentLocale(QxLocale.DEFAULT_LOCALE);
});


qx.OO.addProperty({ name : "currentLocale", type : qx.Const.TYPEOF_OBJECT });

/*
---------------------------------------------------------------------------
  MODIFIER
---------------------------------------------------------------------------
*/

qx.Proto._modifyCurrentLocale = function(propValue, propOldValue, propData)
{
  qx.ui.core.Widget.flushGlobalQueues();

  return true;
};

/*
---------------------------------------------------------------------------
  DISPOSER
---------------------------------------------------------------------------
*/

qx.Proto.dispose = function()
{
  if (this.getDisposed()) {
    return;
  };

  qx.core.Object.prototype.dispose.call(this);
};

/*
---------------------------------------------------------------------------
  SINGLETON INSTANCE
---------------------------------------------------------------------------
*/

QxLocaleManager = new QxLocaleManager();
