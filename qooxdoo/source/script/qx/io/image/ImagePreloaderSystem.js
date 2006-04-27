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

#package(image)
#use(qx.io.image.ImagePreloader)

************************************************************************ */

qx.OO.defineClass("qx.io.image.ImagePreloaderSystem", qx.core.Target, 
function(vPreloadList)
{
  qx.core.Target.call(this);

  this._list = vPreloadList;
});




/*
---------------------------------------------------------------------------
  USER ACCESS
---------------------------------------------------------------------------
*/

qx.Proto.start = function()
{
  for (vSource in this._list)
  {
    vPreloader = qx.manager.object.ImagePreloaderManager.create(qx.manager.object.ImageManager.buildUri(vSource));

    if (vPreloader.isErroneous() || vPreloader.isLoaded())
    {
      delete this._list[vSource];
    }
    else
    {
      vPreloader._origSource = vSource;

      vPreloader.addEventListener(qx.Const.EVENT_TYPE_LOAD, this._onload, this);
      vPreloader.addEventListener(qx.Const.EVENT_TYPE_ERROR, this._onerror, this);
    };
  };

  this._check();
};





/*
---------------------------------------------------------------------------
  EVENT LISTENERS
---------------------------------------------------------------------------
*/

qx.Proto._onload = function(e)
{
  delete this._list[e.getTarget()._origSource];
  this._check();
};

qx.Proto._onerror = function(e)
{
  delete this._list[e.getTarget()._origSource];
  this._check();
};






/*
---------------------------------------------------------------------------
  CHECK
---------------------------------------------------------------------------
*/

qx.Proto._check = function()
{
  // this.debug("Check: " + qx.lang.Object.getKeysAsString(this._list));

  if (qx.lang.Object.isEmpty(this._list)) {
    this.createDispatchEvent(qx.Const.EVENT_TYPE_COMPLETED);
  };
};






/*
---------------------------------------------------------------------------
  DISPOSER
---------------------------------------------------------------------------
*/

qx.Proto.dispose = function()
{
  if (this.getDisposed()) {
    return true;
  };

  this._list = null;
  delete this._list;

  return qx.core.Target.prototype.dispose.call(this);
};
