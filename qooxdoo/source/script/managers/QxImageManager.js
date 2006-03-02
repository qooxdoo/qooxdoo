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
#require(QxConst)
#post(QxImagePreloader)
#post(QxUtil)
#post(QxWidgetTheme)
#post(QxIconTheme)

************************************************************************ */

/*!
  This singleton manage the global image path (prefix) and allowes themed icons.
*/
function QxImageManager()
{
  QxManager.call(this);

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
  this.setCorePath(QxSettings.imageCorePath);
  this.setLocalPath(QxSettings.imageLocalPath);
  this.setIconPath(QxSettings.imageIconPath);
  this.setWidgetPath(QxSettings.imageWidgetPath);
};

QxImageManager.extend(QxManager, "QxImageManager");




/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

QxImageManager.addProperty({ name : "corePath", type : QxConst.TYPEOF_STRING, impl : "coreAlias" });
QxImageManager.addProperty({ name : "localPath", type : QxConst.TYPEOF_STRING, impl : "localAlias" });

QxImageManager.addProperty({ name : "iconPath", type : QxConst.TYPEOF_STRING, impl : "iconAlias" });
QxImageManager.addProperty({ name : "iconTheme", type : QxConst.TYPEOF_STRING, impl : "iconAlias" });

QxImageManager.addProperty({ name : "widgetPath", type : QxConst.TYPEOF_STRING, impl : "widgetAlias" });
QxImageManager.addProperty({ name : "widgetTheme", type : QxConst.TYPEOF_STRING, impl : "widgetAlias" });







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

  if (QxUtil.isValidString(vIconPath) && QxUtil.isValidString(vIconTheme))
  {
    this.defineAlias("icons", vIconPath + QxConst.CORE_SLASH + vIconTheme);
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

  if (QxUtil.isValidString(vWidgetPath) && QxUtil.isValidString(vWidgetTheme))
  {
    this.defineAlias("widgets", vWidgetPath + QxConst.CORE_SLASH + vWidgetTheme);
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

  if (vForceUpdate || typeof vUri === QxConst.TYPEOF_UNDEFINED) {
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
    case QxConst.CORE_SLASH:
    case QxConst.CORE_DOT:
      return vPath;

    default:
      if (vPath.startsWith(QxConst.URI_HTTP) || vPath.startsWith(QxConst.URI_HTTPS) || vPath.startsWith(QxConst.URI_FILE)) {
        return vPath;
      };

      var vAlias = vPath.substring(0, vPath.indexOf(QxConst.CORE_SLASH));
      var vResolved = this._aliases[vAlias];

      if (QxUtil.isValidString(vResolved)) {
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
    vObject.setPreloader(QxImagePreloaderManager.create(this.buildUri(vObject.getSource(), true)));
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
  var vEvent = QxConst.EVENT_TYPE_EXECUTE;

  for (var vTheme in vThemes)
  {
    var vButton = new QxButton(vPrefix + vThemes[vTheme].getTitle(), vIcon);

    vButton.setLocation(xCor, yCor);
    vButton.addEventListener(vEvent, new Function("QxImageManager.setIconTheme('" + vTheme + "')"));

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

  return QxManager.prototype.dispose.call(this);
};









/*
---------------------------------------------------------------------------
  SINGLETON INSTANCE
---------------------------------------------------------------------------
*/

QxImageManager = new QxImageManager;
