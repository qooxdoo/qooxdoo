/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2006 by 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL 2.1: http://www.gnu.org/licenses/lgpl.html

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

#module(appearance)

************************************************************************ */

qx.OO.defineClass("qx.renderer.theme.AppearanceTheme", qx.core.Object,
function(vTitle)
{
  qx.core.Object.call(this);

  this.setTitle(vTitle);
  this._register();
});




/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

qx.OO.addProperty({ name : "title", type : qx.constant.Type.STRING, allowNull : false, defaultValue : qx.constant.Core.EMPTY });





/*
---------------------------------------------------------------------------
  DATA
---------------------------------------------------------------------------
*/

qx.Proto._appearances = {};





/*
---------------------------------------------------------------------------
  CORE METHODS
---------------------------------------------------------------------------
*/

qx.Proto.registerAppearance = function(vId, vData) {
  this._appearances[vId] = vData;
}

qx.Proto.getAppearance = function(vId) {
  return this._appearances[vId];
}

qx.Proto.setupAppearance = function(vAppearance)
{
  if (!vAppearance._setupDone)
  {
    if (vAppearance.setup) {
      vAppearance.setup();
    }

    vAppearance._setupDone = true;
  }
}

qx.Proto._register = function() {
  qx.manager.object.AppearanceManager.registerTheme(this);
}







/*
---------------------------------------------------------------------------
  WIDGET METHODS
---------------------------------------------------------------------------
*/

qx.Proto.initialFrom = function(vWidget, vId)
{
  var vAppearance = this.getAppearance(vId);
  if (vAppearance)
  {
    this.setupAppearance(vAppearance);

    try
    {
      return vAppearance.initial ? vAppearance.initial(vWidget, this) : {}
    }
    catch(ex)
    {
      this.error("Couldn't apply initial appearance", ex);
    }
  }
  else
  {
    return this.error("Missing appearance: " + vId);
  }
}

qx.Proto.stateFrom = function(vWidget, vId)
{
  var vAppearance = this.getAppearance(vId);
  if (vAppearance)
  {
    this.setupAppearance(vAppearance);

    try
    {
      return vAppearance.state ? vAppearance.state(vWidget, this, vWidget._states) : {}
    }
    catch(ex)
    {
      this.error("Couldn't apply state appearance", ex);
    }
  }
  else
  {
    return this.error("Missing appearance: " + vId);
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
    return;
  }

  this._appearances = null;

  return qx.core.Object.prototype.dispose.call(this);
}
