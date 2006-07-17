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
#require(qx.constant.Type)
#use(qx.constant.Core)
#use(qx.io.image.ImagePreloader)
#use(qx.util.Validation)
#use(qx.renderer.theme.WidgetTheme)
#use(qx.renderer.theme.IconTheme)

************************************************************************ */

/*!
  This singleton manage the global image path (prefix) and allowes themed icons.
*/
qx.OO.defineClass("qx.manager.object.ImageManager", qx.manager.object.ObjectManager,
function()
{
  qx.manager.object.ObjectManager.call(this);

  // Contains available icon themes
  this._iconThemes = {}

  // Contains available widget themes
  this._widgetThemes = {}

  // Contains known image sources (all of them, if loaded or not)
  // The value is a number which represents the number of image
  // instances which use this source
  this._sources = {}

  // Full image URIs (working as a cache to reduce the _buildUri executions)
  this._uris = {}

  // Contains defined aliases (like icons/, widgets/, application/, ...)
  this._aliases = {}

  // Apply default pathes
  this.setCorePath(qx.core.Settings.imageCorePath);
  this.setLocalPath(qx.core.Settings.imageLocalPath);
  this.setIconPath(qx.core.Settings.imageIconPath);
  this.setWidgetPath(qx.core.Settings.imageWidgetPath);
});

qx.Proto.BLANK = "core/blank.gif";




/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

qx.OO.addProperty({ name : "corePath", type : qx.constant.Type.STRING, impl : "coreAlias" });
qx.OO.addProperty({ name : "localPath", type : qx.constant.Type.STRING, impl : "localAlias" });

qx.OO.addProperty({ name : "iconPath", type : qx.constant.Type.STRING, impl : "iconAlias" });
qx.OO.addProperty({ name : "iconTheme", type : qx.constant.Type.STRING, impl : "iconAlias" });

qx.OO.addProperty({ name : "widgetPath", type : qx.constant.Type.STRING, impl : "widgetAlias" });
qx.OO.addProperty({ name : "widgetTheme", type : qx.constant.Type.STRING, impl : "widgetAlias" });







/*
---------------------------------------------------------------------------
  MODIFIERS
---------------------------------------------------------------------------
*/

qx.Proto._modifyCoreAlias = function(propValue, propOldValue, propData)
{
  this.defineAlias("core", propValue);
  return true;
}

qx.Proto._modifyLocalAlias = function(propValue, propOldValue, propData)
{
  this.defineAlias("local", propValue);
  return true;
}

qx.Proto._modifyIconAlias = function(propValue, propOldValue, propData)
{
  var vIconPath = this.getIconPath();
  var vIconTheme = this.getIconTheme();

  if (qx.util.Validation.isValidString(vIconPath) && qx.util.Validation.isValidString(vIconTheme))
  {
    this.defineAlias("icons", vIconPath + qx.constant.Core.SLASH + vIconTheme);
  }
  else
  {
    this.removeAlias("icons");
  }

  return true;
}

qx.Proto._modifyWidgetAlias = function(propValue, propOldValue, propData)
{
  var vWidgetPath = this.getWidgetPath();
  var vWidgetTheme = this.getWidgetTheme();

  if (qx.util.Validation.isValidString(vWidgetPath) && qx.util.Validation.isValidString(vWidgetTheme))
  {
    this.defineAlias("widgets", vWidgetPath + qx.constant.Core.SLASH + vWidgetTheme);
  }
  else
  {
    this.removeAlias("widgets");
  }

  return true;
}






/*
---------------------------------------------------------------------------
  THEMES
---------------------------------------------------------------------------
*/

qx.Proto.registerIconTheme = function(vTheme)
{
  var vId = vTheme.getId();

  if (this._iconThemes[vId]) {
    throw new Error("A icon theme with this ID is already known");
  }

  this._iconThemes[vId] = vTheme;

  // Register first incoming theme as default
  if (this.getIconTheme() == null) {
    this.setIconTheme(vId);
  }
}


qx.Proto.registerWidgetTheme = function(vTheme)
{
  var vId = vTheme.getId();

  if (this._widgetThemes[vId]) {
    throw new Error("A widget theme with this ID is already known");
  }

  this._widgetThemes[vId] = vTheme;

  // Register first incoming theme as default
  if (this.getWidgetTheme() == null) {
    this.setWidgetTheme(vId);
  }
}







/*
---------------------------------------------------------------------------
  PRELOAD API
---------------------------------------------------------------------------
*/

qx.Proto.getPreloadImageList = function()
{
  var vPreload = {}

  for (var vSource in this._sources)
  {
    if (this._sources[vSource]) {
      vPreload[vSource] = true;
    }
  }

  return vPreload;
}

qx.Proto.getPostPreloadImageList = function()
{
  var vPreload = {}

  for (var vSource in this._sources)
  {
    if (!this._sources[vSource]) {
      vPreload[vSource] = true;
    }
  }

  return vPreload;
}









/*
---------------------------------------------------------------------------
  URI/ALIAS HANDLING
---------------------------------------------------------------------------
*/

qx.Proto.buildUri = function(vPath, vForceUpdate)
{
  var vUri = this._uris[vPath];

  if (vForceUpdate || typeof vUri === qx.constant.Type.UNDEFINED) {
    vUri = this._uris[vPath] = this._buildUri(vPath);
  }

  // this.debug("URI: " + vPath + " => " + vUri);
  return vUri;
}

qx.Proto.defineAlias = function(vPrefix, vPath)
{
  this._aliases[vPrefix] = vPath;
  this._updateImages();
}

qx.Proto.removeAlias = function(vPrefix) {
  delete this._aliases[vPrefix];
}










/*
---------------------------------------------------------------------------
  INTERNAL HELPER
---------------------------------------------------------------------------
*/

qx.Proto._buildUri = function(vPath, vForce)
{
  switch(vPath.charAt(0))
  {
    case qx.constant.Core.SLASH:
    case qx.constant.Core.DOT:
      return vPath;

    default:
      if (qx.lang.String.startsWith(vPath, qx.constant.Net.URI_HTTP) || qx.lang.String.startsWith(vPath, qx.constant.Net.URI_HTTPS) || qx.lang.String.startsWith(vPath, qx.constant.Net.URI_FILE)) {
        return vPath;
      }

      var vAlias = vPath.substring(0, vPath.indexOf(qx.constant.Core.SLASH));
      var vResolved = this._aliases[vAlias];

      if (qx.util.Validation.isValidString(vResolved)) {
        return vResolved + vPath.substring(vAlias.length);
      }

      return vPath;
  }
}

qx.Proto._updateImages = function()
{
  var vAll = this.getAll();
  var vObject;

  // Recreate preloader of affected images
  for (var vHashCode in vAll)
  {
    vObject = vAll[vHashCode];
    vObject.setPreloader(qx.manager.object.ImagePreloaderManager.create(this.buildUri(vObject.getSource(), true)));
  }

  return true;
}







/*
---------------------------------------------------------------------------
  UTILITY
---------------------------------------------------------------------------
*/

// TODO: rename to createIconThemeList
qx.Proto.createThemeList = function(vParent, xCor, yCor)
{
  var vButton;
  var vThemes = this._iconThemes;
  var vIcon = "icons/16/icons.png";
  var vPrefix = "Icon Theme: ";
  var vEvent = qx.constant.Event.EXECUTE;

  for (var vTheme in vThemes)
  {
    var vButton = new qx.ui.form.Button(vPrefix + vThemes[vTheme].getTitle(), vIcon);

    vButton.setLocation(xCor, yCor);
    vButton.addEventListener(vEvent, new Function("qx.manager.object.ImageManager.setIconTheme('" + vTheme + "')"));

    vParent.add(vButton);

    yCor += 30;
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

  this._iconThemes = null;
  this._widgetThemes = null;

  this._sources = null;
  this._uris = null;
  this._aliases = null;

  return qx.manager.object.ObjectManager.prototype.dispose.call(this);
}









/*
---------------------------------------------------------------------------
  SINGLETON INSTANCE
---------------------------------------------------------------------------
*/

qx.manager.object.ImageManager = new qx.manager.object.ImageManager;
