function QxImageManager()
{
  if (QxImageManager._instance) {
    return QxImageManager._instance;
  };
  
  // Add default icon themes
  this.addIconTheme("Crystal SVG", "crystalsvg");
  this.addIconTheme("Nuvola", "nuvola");
  
  // Add default widget themes
  this.addWidgetTheme("Windows", "windows");

  QxManager.call(this);
  
  QxImageManager._instance = this;  
};

QxImageManager.extend(QxManager, "QxImageManager");

QxImageManager.addProperty({ name : "path", type : String, defaultValue : "../../images/" });

QxImageManager.addProperty({ name : "iconTheme", type : String, defaultValue : "crystalsvg" });
QxImageManager.addProperty({ name : "widgetTheme", type : String, defaultValue : "windows" });

proto._iconThemes = {};
proto._widgetThemes = {};




/*
------------------------------------------------------------------------------------
  UTILITIES
------------------------------------------------------------------------------------
*/

proto.getBlank = function() {
  return this.getPath() + "core/blank.gif";
};

proto.buildURI = function(vPath)
{
  switch(vPath.charAt(0))
  {
    case "/":
    case ".":
      return vPath;
    
    default:
      switch(vPath.substring(0, vPath.indexOf(":")))
      {
        case "http":
        case "https":
        case "file":
          return vPath;
      };

      // Fix path for theme support      
      if (vPath.indexOf("icons") == 0) 
      {
        return this.getPath() + "icons/" + this.getIconTheme() + "/" + vPath.substring(6);
      }
      else if (vPath.indexOf("widgets") == 0) 
      {
        return this.getPath() + "widgets/" + this.getWidgetTheme() + "/" + vPath.substring(8);
      };

      return this.getPath() + vPath;
  };  
};

proto._updateImages = function()
{
  var o;

  for (var i in this._objects)
  {
    o = this._objects[i];
    o.setPreloader(new QxImagePreloader(this.buildURI(o.getSource())));
  };    
  
  return true;
};






/*
------------------------------------------------------------------------------------
  MODIFIER
------------------------------------------------------------------------------------
*/

proto._modifyPath = function(propValue, propOldValue, propName, uniqModIds) {
  return this._updateImages();  
};





/*
------------------------------------------------------------------------------------
  ICON THEME MANAGMENT
------------------------------------------------------------------------------------
*/

proto._checkIconTheme = function(propValue)
{
  if (this._iconThemes[propValue]) {
    return propValue;
  };
  
  for (var i in this._iconThemes) 
  {
    if (this._iconThemes[i].title == propValue) {
      return i;
    };
  };
  
  throw new Error("Invalid icon theme id/title: " + propValue + "!");
};

proto._modifyIconTheme = function(propValue, propOldValue, propName, uniqModIds) {
  return this._updateImages();  
};

proto.addIconTheme = function(vHash, vTitle, vId, vPath)
{
  if (isInvalidString(vTitle)) {
    throw new Error("Please define the title of the new icon theme.");
  };
  
  if (isInvalidString(vId)) {
    var vId = vTitle.toLowerCase();
  };
  
  if (this._iconThemes[vId]) {
    throw new Error("Theme is already defined: " + vId);
  };
  
  this._iconThemes[vId] = { title : vTitle, path : vPath ? vPath : vId };
};

proto.removeIconTheme = function(vHash, vTitle, vId)
{
  if (isInvalidString(vTitle)) {
    throw new Error("Please define the title of the icon theme which should be removed.");
  };
  
  if (isInvalidString(vId)) {
    var vId = vTitle.toLowerCase();
  };
  
  if (this.getDefaultIconTheme() == vId) {
    throw new Error("Could not remove default theme " + this.getDefaultIconTheme() + "!");
  };

  if (this.getIconTheme() == vId) {
    this.resetIconTheme();
  };
  
  delete this._iconThemes[vId];
};





/*
------------------------------------------------------------------------------------
  CORE THEME MANAGMENT
------------------------------------------------------------------------------------
*/

proto._checkWidgetTheme = function(propValue)
{
  if (this._widgetThemes[propValue]) {
    return propValue;
  };
  
  for (var i in this._widgetThemes) {
    if (this._widgetThemes[i].title == propValue) {
      return i;
    };
  };
  
  throw new Error("Invalid widget theme id/title: " + propValue + "!");
};

proto._modifyWidgetTheme = function(propValue, propOldValue, propName, uniqModIds) {
  return this._updateImages();  
};

proto.addWidgetTheme = function(vHash, vTitle, vId, vPath)
{
  if (isInvalidString(vTitle)) {
    throw new Error("Please define the title of the new widget theme.");
  };
  
  if (isInvalidString(vId)) {
    var vId = vTitle.toLowerCase();
  };
  
  if (this._widgetThemes[vId]) {
    throw new Error("Theme is already defined: " + vId);
  };
  
  this._widgetThemes[vId] = { title : vTitle, path : vPath ? vPath : vId };
};

proto.removeWidgetTheme = function(vHash, vTitle, vId)
{
  if (isInvalidString(vTitle)) {
    throw new Error("Please define the title of the widget theme which should be removed.");
  };
  
  if (isInvalidString(vId)) {
    var vId = vTitle.toLowerCase();
  };
  
  if (this.getDefaultWidgetTheme() == vId) {
    throw new Error("Could not remove default theme " + this.getDefaultWidgetTheme() + "!");
  };

  if (this.getWidgetTheme() == vId) {
    this.resetWidgetTheme();
  };
  
  delete this._widgetThemes[vId];
};
