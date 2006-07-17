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

#module(image)
#use(qx.io.image.ImagePreloader)

************************************************************************ */

qx.OO.defineClass("qx.io.image.ImagePreloaderSystem", qx.core.Target,
function(vPreloadList, vCallBack, vCallBackScope)
{
  qx.core.Target.call(this);

  this._list = vPreloadList;

  // If we use the compact syntax, automatically add an event listeners and start the loading process
  if (vCallBack)
  {
    this.addEventListener(qx.constant.Event.COMPLETED, vCallBack, vCallBackScope || null);
    this.start();
  }
});




/*
---------------------------------------------------------------------------
  USER ACCESS
---------------------------------------------------------------------------
*/

qx.Proto.start = function()
{
  for (var vSource in this._list)
  {
    var vPreloader = qx.manager.object.ImagePreloaderManager.create(qx.manager.object.ImageManager.buildUri(vSource));

    if (vPreloader.isErroneous() || vPreloader.isLoaded())
    {
      delete this._list[vSource];
    }
    else
    {
      vPreloader._origSource = vSource;

      vPreloader.addEventListener(qx.constant.Event.LOAD, this._onload, this);
      vPreloader.addEventListener(qx.constant.Event.ERROR, this._onerror, this);
    }
  }

  this._check();
}





/*
---------------------------------------------------------------------------
  EVENT LISTENERS
---------------------------------------------------------------------------
*/

qx.Proto._onload = function(e)
{
  delete this._list[e.getTarget()._origSource];
  this._check();
}

qx.Proto._onerror = function(e)
{
  delete this._list[e.getTarget()._origSource];
  this._check();
}






/*
---------------------------------------------------------------------------
  CHECK
---------------------------------------------------------------------------
*/

qx.Proto._check = function()
{
  // this.debug("Check: " + qx.lang.Object.getKeysAsString(this._list));

  if (qx.lang.Object.isEmpty(this._list)) {
    this.createDispatchEvent(qx.constant.Event.COMPLETED);
  }
}






/*
---------------------------------------------------------------------------
  DISPOSER
---------------------------------------------------------------------------
*/

qx.Proto.dispose = function()
{
  if (this.getDisposed()) {
    return true;
  }

  this._list = null;
  delete this._list;

  return qx.core.Target.prototype.dispose.call(this);
}
