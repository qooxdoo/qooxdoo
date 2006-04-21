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
#require(qx.Const)
#post(qx.io.image.ImagePreloader)
#post(QxUtil)
#post(qx.renderer.theme.WidgetTheme)
#post(qx.renderer.theme.IconTheme)

************************************************************************ */

/*!
  This singleton manage the global image path (prefix) and allowes themed icons.
*/
qx.manager.object.ImageManager = function()
{
  qx.manager.object.ObjectManager.call(this);

  // Contains available icon themes
  this._iconThemes = {};

  // Contains available widget themes
  this._widgetThemes = {};

  // Contains known image sources (all of them, if loaded or not)
  // The value is a number which represents the number of image
  // instances which use this source
  this._sources = {};

  // Full image URIs (working as a cache to reduce the _buildUri executions)
  this._uris = {};

  // Contains defined aliases (like icons/, widgets/, application/, ...)
  this._aliases = {};

  // Apply default pathes
  this.setCorePath(qx.core.Settings.imageCorePath);
  this.setLocalPath(qx.core.Settings.imageLocalPath);
  this.setIconPath(qx.core.Settings.imageIconPath);
  this.setWidgetPath(qx.core.Settings.imageWidgetPath);
};

qx.manager.object.ImageManager.extend(qx.manager.object.ObjectManager, "qx.manager.object.ImageManager");




/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

qx.manager.object.ImageManager.addProperty({ name : "corePath", type : qx.Const.TYPEOF_STRING, impl : "coreAlias" });
qx.manager.object.ImageManager.addProperty({ name : "localPath", type : qx.Const.TYPEOF_STRING, impl : "localAlias" });

qx.manager.object.ImageManager.addProperty({ name : "iconPath", type : qx.Const.TYPEOF_STRING, impl : "iconAlias" });
qx.manager.object.ImageManager.addProperty({ name : "iconTheme", type : qx.Const.TYPEOF_STRING, impl : "iconAlias" });

qx.manager.object.ImageManager.addProperty({ name : "widgetPath", type : qx.Const.TYPEOF_STRING, impl : "widgetAlias" });
qx.manager.object.ImageManager.addProperty({ name : "widgetTheme", type : qx.Const.TYPEOF_STRING, impl : "widgetAlias" });







/*
---------------------------------------------------------------------------
  MODIFIERS
---------------------------------------------------------------------------
*/

proto._modifyCoreAlias = function(propValue, propOldValue, propData)
{
  this.defineAlias("core", propValue);
  return true;
};

proto._modifyLocalAlias = function(propValue, propOldValue, propData)
{
  this.defineAlias("local", propValue);
  return true;
};

proto._modifyIconAlias = function(propValue, propOldValue, propData)
{
  var vIconPath = this.getIconPath();
  var vIconTheme = this.getIconTheme();

  if (qx.util.Validation.isValidString(vIconPath) && qx.util.Validation.isValidString(vIconTheme))
  {
    this.defineAlias("icons", vIconPath + qx.Const.CORE_SLASH + vIconTheme);
  }
  else
  {
    this.removeAlias("icons");
  };

  return true;
};

proto._modifyWidgetAlias = function(propValue, propOldValue, propData)
{
  var vWidgetPath = this.getWidgetPath();
  var vWidgetTheme = this.getWidgetTheme();

  if (qx.util.Validation.isValidString(vWidgetPath) && qx.util.Validation.isValidString(vWidgetTheme))
  {
    this.defineAlias("widgets", vWidgetPath + qx.Const.CORE_SLASH + vWidgetTheme);
  }
  else
  {
    this.removeAlias("widgets");
  };

  return true;
};






/*
---------------------------------------------------------------------------
  THEMES
---------------------------------------------------------------------------
*/

proto.registerIconTheme = function(vTheme)
{
  var vId = vTheme.getId();

  if (this._iconThemes[vId]) {
    throw new Error("A icon theme with this ID is already known");
  };

  this._iconThemes[vId] = vTheme;

  // Register first incoming theme as default
  if (this.getIconTheme() == null) {
    this.setIconTheme(vId);
  };
};


proto.registerWidgetTheme = function(vTheme)
{
  var vId = vTheme.getId();

  if (this._widgetThemes[vId]) {
    throw new Error("A widget theme with this ID is already known");
  };

  this._widgetThemes[vId] = vTheme;

  // Register first incoming theme as default
  if (this.getWidgetTheme() == null) {
    this.setWidgetTheme(vId);
  };
};







/*
---------------------------------------------------------------------------
  PRELOAD API
---------------------------------------------------------------------------
*/

proto.getPreloadImageList = function()
{
  var vPreload = {};

  for (var vSource in this._sources)
  {
    if (this._sources[vSource]) {
      vPreload[vSource] = true;
    };
  };

  return vPreload;
};

proto.getPostPreloadImageList = function()
{
  var vPreload = {};

  for (var vSource in this._sources)
  {
    if (!this._sources[vSource]) {
      vPreload[vSource] = true;
    };
  };

  return vPreload;
};









/*
---------------------------------------------------------------------------
  URI/ALIAS HANDLING
---------------------------------------------------------------------------
*/

proto.buildUri = function(vPath, vForceUpdate)
{
  var vUri = this._uris[vPath];

  if (vForceUpdate || typeof vUri === qx.Const.TYPEOF_UNDEFINED) {
    vUri = this._uris[vPath] = this._buildUri(vPath);
  };

  // this.debug("URI: " + vPath + " => " + vUri);
  return vUri;
};

proto.defineAlias = function(vPrefix, vPath)
{
  this._aliases[vPrefix] = vPath;
  this._updateImages();
};

proto.removeAlias = function(vPrefix) {
  delete this._aliases[vPrefix];
};










/*
---------------------------------------------------------------------------
  INTERNAL HELPER
---------------------------------------------------------------------------
*/

proto._buildUri = function(vPath, vForce)
{
  switch(vPath.charAt(0))
  {
    case qx.Const.CORE_SLASH:
    case qx.Const.CORE_DOT:
      return vPath;

    default:
      if (qx.lang.String.startsWith(vPath, qx.Const.URI_HTTP) || qx.lang.String.startsWith(vPath, qx.Const.URI_HTTPS) || qx.lang.String.startsWith(vPath, qx.Const.URI_FILE)) {
        return vPath;
      };

      var vAlias = vPath.substring(0, vPath.indexOf(qx.Const.CORE_SLASH));
      var vResolved = this._aliases[vAlias];

      if (qx.util.Validation.isValidString(vResolved)) {
        return vResolved + vPath.substring(vAlias.length);
      };

      return vPath;
  };
};

proto._updateImages = function()
{
  var vAll = this.getAll();
  var vObject;

  // Recreate preloader of affected images
  for (var vHashCode in vAll)
  {
    vObject = vAll[vHashCode];
    vObject.setPreloader(qx.manager.object.ImagePreloaderManager.create(this.buildUri(vObject.getSource(), true)));
  };

  return true;
};







/*
---------------------------------------------------------------------------
  UTILITY
---------------------------------------------------------------------------
*/

// TODO: rename to createIconThemeList
proto.createThemeList = function(vParent, xCor, yCor)
{
  var vButton;
  var vThemes = this._iconThemes;
  var vIcon = "icons/16/icons.png";
  var vPrefix = "Icon Theme: ";
  var vEvent = qx.Const.EVENT_TYPE_EXECUTE;

  for (var vTheme in vThemes)
  {
    var vButton = new qx.ui.form.Button(vPrefix + vThemes[vTheme].getTitle(), vIcon);

    vButton.setLocation(xCor, yCor);
    vButton.addEventListener(vEvent, new Function("qx.manager.object.ImageManager.setIconTheme('" + vTheme + "')"));

    vParent.add(vButton);

    yCor += 30;
  };
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

  this._iconThemes = null;
  this._widgetThemes = null;

  this._sources = null;
  this._uris = null;
  this._aliases = null;

  return qx.manager.object.ObjectManager.prototype.dispose.call(this);
};









/*
---------------------------------------------------------------------------
  SINGLETON INSTANCE
---------------------------------------------------------------------------
*/

qx.manager.object.ImageManager = new qx.manager.object.ImageManager;
