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

#package(color)
#post(QxColorTheme)

************************************************************************ */

function QxColorManager()
{
  QxManager.call(this);

  // Contains the QxColorTheme instances
  this._themes = {};

  // Contains the QxColorObjects which
  // represent a themed color.
  this._dependentObjects = {};
};

QxColorManager.extend(QxManager, "QxColorManager");


/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

QxColorManager.addProperty({ name : "theme", type : QxConst.TYPEOF_STRING });




/*
---------------------------------------------------------------------------
  COMMON PUBLIC METHODS
---------------------------------------------------------------------------
*/

proto.getThemeObject = function() {
  return this._themes[this.getTheme()];
};






/*
---------------------------------------------------------------------------
  PUBLIC METHODS FOR QXCOLOROBJECTS
---------------------------------------------------------------------------
*/

proto.add = function(oObject)
{
  var vValue = oObject.getValue();

  this._objects[vValue] = oObject;

  if (oObject.isThemedColor()) {
    this._dependentObjects[vValue] = oObject;
  };
};

proto.remove = function(oObject)
{
  var vValue = oObject.getValue();

  delete this._objects[vValue];
  delete this._dependentObjects[vValue];
};

proto.has = function(vValue) {
  return this._objects[vValue] != null;
};

proto.get = function(vValue) {
  return this._objects[vValue];
};






/*
---------------------------------------------------------------------------
  PUBLIC METHODS FOR QXCOLORTHEMES
---------------------------------------------------------------------------
*/

proto.registerTheme = function(vTheme)
{
  var vId = vTheme.getId();

  if (this._themes[vId]) {
    throw new Error("A theme with this ID is already known");
  };

  this._themes[vId] = vTheme;
  
  // Register first incoming theme as default
  if (this.getTheme() == null) {
    this.setTheme(vId);
  };
};







/*
---------------------------------------------------------------------------
  MODIFIER
---------------------------------------------------------------------------
*/

proto._modifyTheme = function(propValue, propOldValue, propData)
{
  var vTheme = this.getThemeObject();
  
  vTheme.compile();

  for (var i in this._dependentObjects) {
    this._dependentObjects[i]._updateTheme(vTheme);
  };

  return true;
};






/*
---------------------------------------------------------------------------
  UTILITY
---------------------------------------------------------------------------
*/

proto.createThemeList = function(vParent, xCor, yCor)
{
  var vButton;
  var vThemes = this._themes;
  var vIcon = "icons/16/colors.png";
  var vPrefix = "Color Theme: ";
  var vEvent = QxConst.EVENT_TYPE_EXECUTE;

  for (var vId in vThemes)
  {
    var vButton = new QxButton(vPrefix + vThemes[vId].getTitle(), vIcon);

    vButton.setLocation(xCor, yCor);
    vButton.addEventListener(vEvent, new Function("QxColorManager.setTheme('" + vId + "')"));

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

  for (var i in this._themes) {
    delete this._themes[i];
  };

  delete this._themes;

  for (var i in this._dependentObjects) {
    delete this._dependentObjects[i];
  };

  delete this._dependentObjects;

  return QxManager.prototype.dispose.call(this);
};







/*
---------------------------------------------------------------------------
  SINGLETON INSTANCE
---------------------------------------------------------------------------
*/

QxColorManager = new QxColorManager;
