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

#module(color)
#use(qx.renderer.theme.ColorTheme)

************************************************************************ */

qx.OO.defineClass("qx.manager.object.ColorManager", qx.manager.object.ObjectManager,
function()
{
  qx.manager.object.ObjectManager.call(this);

  // Contains the qx.renderer.theme.ColorTheme instances
  this._themes = {};

  // Contains the qx.renderer.color.ColorObjects which
  // represent a themed color.
  this._dependentObjects = {};
});





/*
---------------------------------------------------------------------------
  DEFAULT SETTINGS
---------------------------------------------------------------------------
*/

qx.Settings.setDefaultSetting("theme", "qx.theme.color.WindowsRoyaleColorTheme");




/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

qx.OO.addProperty({ name : "theme", type : qx.constant.Type.OBJECT, allowNull : false });







/*
---------------------------------------------------------------------------
  PUBLIC METHODS FOR qx.renderer.color.ColorOBJECTS
---------------------------------------------------------------------------
*/

qx.Proto.add = function(oObject)
{
  var vValue = oObject.getValue();

  this._objects[vValue] = oObject;

  if (oObject.isThemedColor()) {
    this._dependentObjects[vValue] = oObject;
  }
}

qx.Proto.remove = function(oObject)
{
  var vValue = oObject.getValue();

  delete this._objects[vValue];
  delete this._dependentObjects[vValue];
}

qx.Proto.has = function(vValue) {
  return this._objects[vValue] != null;
}

qx.Proto.get = function(vValue) {
  return this._objects[vValue];
}






/*
---------------------------------------------------------------------------
  PUBLIC METHODS FOR qx.renderer.theme.ColorThemeS
---------------------------------------------------------------------------
*/

qx.Proto.registerTheme = function(vTheme)
{
  var vId = vTheme.classname;

  this._themes[vId] = vTheme;

  if (vId === this.getSetting("theme") && this.getTheme() === null) {
    this.setTheme(vTheme);
  }
}

qx.Proto.setThemeById = function(vId) {
  return this.setTheme(this._themes[vId]);
}






/*
---------------------------------------------------------------------------
  MODIFIER
---------------------------------------------------------------------------
*/

qx.Proto._modifyTheme = function(propValue, propOldValue, propData)
{
  propValue.compile();

  for (var i in this._dependentObjects) {
    this._dependentObjects[i]._updateTheme(propValue);
  }

  return true;
}








/*
---------------------------------------------------------------------------
  UTILITY
---------------------------------------------------------------------------
*/

qx.Proto.createThemeList = function(vParent, xCor, yCor)
{
  var vButton;
  var vThemes = this._themes;
  var vIcon = "icon/16/colors.png";
  var vPrefix = "Color Theme: ";
  var vEvent = qx.constant.Event.EXECUTE;

  for (var vId in vThemes)
  {
    var vButton = new qx.ui.form.Button(vPrefix + vThemes[vId].getTitle(), vIcon);

    vButton.setLocation(xCor, yCor);
    vButton.addEventListener(vEvent, new Function("qx.manager.object.ColorManager.setThemeById('" + vId + "')"));

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

  if (this._themes)
  {
    for (var vTheme in this._themes)
    {
      this._themes[vTheme].dispose();
      this._themes[vTheme] = null;
    }

    this._themes = null;
  }

  for (var i in this._dependentObjects) {
    delete this._dependentObjects[i];
  }

  delete this._dependentObjects;

  return qx.manager.object.ObjectManager.prototype.dispose.call(this);
}







/*
---------------------------------------------------------------------------
  SINGLETON INSTANCE
---------------------------------------------------------------------------
*/

qx.manager.object.ColorManager = new qx.manager.object.ColorManager;
