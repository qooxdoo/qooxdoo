function QxImageManager()
{
  if (QxImageManager._instance) {
    return QxImageManager._instance;
  };
  
  // Add default icon themes
  this.addIconTheme("Crystal SVG", "crystalsvg");
  this.addIconTheme("Nuvola", "nuvola");
  
  // Add default cursor themes
  this.addCursorTheme("Windows", "windows");

  QxManager.call(this);
  
  QxImageManager._instance = this;  
};

QxImageManager.extend(QxManager, "QxImageManager");

QxImageManager.addProperty({ name : "path", type : String, defaultValue : "../../images/" });
QxImageManager.addProperty({ name : "iconTheme", type : String, defaultValue : "crystalsvg" });
QxImageManager.addProperty({ name : "cursorTheme", type : String, defaultValue : "windows" });

proto._iconThemes = {};
proto._cursorThemes = {};




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
      
      if (vPath.substring(0, 5) == "icons") {
        return this.getPath() + "icons/" + this.getIconTheme() + "/" + vPath.substring(6);
      };

      if (vPath.substring(0, 7) == "cursors") {
        return this.getPath() + "cursors/" + this.getCursorTheme() + "/" + vPath.substring(8);
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
  
  for (var i in this._themes) 
  {
    if (this._iconThemes.title == propValue) {
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
  CURSOR THEME MANAGMENT
------------------------------------------------------------------------------------
*/

proto._checkCursorTheme = function(propValue)
{
  if (this._cursorThemes[propValue]) {
    return propValue;
  };
  
  for (var i in this._themes) {
    if (this._cursorThemes.title == propValue) {
      return i;
    };
  };
  
  throw new Error("Invalid cursor theme id/title: " + propValue + "!");
};

proto._modifyCursorTheme = function(propValue, propOldValue, propName, uniqModIds) {
  return this._updateImages();  
};

proto.addCursorTheme = function(vHash, vTitle, vId, vPath)
{
  if (isInvalidString(vTitle)) {
    throw new Error("Please define the title of the new cursor theme.");
  };
  
  if (isInvalidString(vId)) {
    var vId = vTitle.toLowerCase();
  };
  
  if (this._cursorThemes[vId]) {
    throw new Error("Theme is already defined: " + vId);
  };
  
  this._cursorThemes[vId] = { title : vTitle, path : vPath ? vPath : vId };
};

proto.removeCursorTheme = function(vHash, vTitle, vId)
{
  if (isInvalidString(vTitle)) {
    throw new Error("Please define the title of the cursor theme which should be removed.");
  };
  
  if (isInvalidString(vId)) {
    var vId = vTitle.toLowerCase();
  };
  
  if (this.getDefaultCursorTheme() == vId) {
    throw new Error("Could not remove default theme " + this.getDefaultCursorTheme() + "!");
  };

  if (this.getCursorTheme() == vId) {
    this.resetCursorTheme();
  };
  
  delete this._cursorThemes[vId];
};
