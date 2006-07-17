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
     * Kent Olsson (kols)
       <kent dot olsson at chello dot se>

************************************************************************ */

/* ************************************************************************

#module(locale)

************************************************************************ */

/*!
  This singleton manages multiple instances of QxLocale.
*/
function QxLocaleManager(){
  qx.manager.object.ObjectManager.call(this);

  this.setCurrentLocale(QxLocale.DEFAULT_LOCALE);
});


qx.OO.addProperty({ name : "currentLocale", type : qx.constant.Type.OBJECT });

/*
---------------------------------------------------------------------------
  MODIFIER
---------------------------------------------------------------------------
*/

qx.Proto._modifyCurrentLocale = function(propValue, propOldValue, propData)
{
  qx.ui.core.Widget.flushGlobalQueues();

  return true;
}

/*
---------------------------------------------------------------------------
  DISPOSER
---------------------------------------------------------------------------
*/

qx.Proto.dispose = function()
{
  if (this.getDisposed()) {
    return;
  }

  qx.core.Object.prototype.dispose.call(this);
}

/*
---------------------------------------------------------------------------
  SINGLETON INSTANCE
---------------------------------------------------------------------------
*/

QxLocaleManager = new QxLocaleManager();
