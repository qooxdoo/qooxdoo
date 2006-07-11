/* ************************************************************************

   qooxdoo - the new era of web development

   Copyright:
     2004-2006 by Schlund + Partner AG, Germany
     All rights reserved

   License:
     LGPL 2.1: http://creativecommons.org/licenses/LGPL/2.1/

   Internet:
     * http://qooxdoo.org

   Authors:
     * Sebastian Werner (wpbasti)
       <sw at schlund dot de>
     * Andreas Ecker (ecker)
       <ae at schlund dot de>

************************************************************************ */

/* ************************************************************************

#module(colorselector)
#use(qx.ui.layout.HorizontalBoxLayout)
#use(qx.ui.layout.VerticalBoxLayout)
#use(qx.ui.form.Button)
#use(qx.ui.basic.Image)
#use(qx.ui.groupbox.GroupBox)
#use(qx.ui.basic.Label)
#use(qx.renderer.color.ColorUtil)

************************************************************************ */

/*!
  A color popup
*/
qx.OO.defineClass("qx.ui.component.ColorPopup", qx.ui.popup.Popup,
function(colorTables)
{
  qx.ui.popup.Popup.call(this);

  this.setPadding(4);
  this.auto();
  this.setBorder(qx.renderer.border.BorderObject.presets.outset);
  this.setBackgroundColor("threedface");

  this._colorTables = colorTables;

  this._createLayout();
  this._createAutoBtn();
  this._createBoxes();
  this._createPreview();
  this._createSelectorBtn();

  this.addEventListener(qx.constant.Event.BEFOREAPPEAR, this._onBeforeAppear);
});

qx.OO.addProperty({ name : "value", type : qx.constant.Type.OBJECT, instance : "qx.renderer.color.Color" });

qx.OO.addProperty({ name : "red", type : qx.constant.Type.NUMBER, defaultValue : 0 });
qx.OO.addProperty({ name : "green", type : qx.constant.Type.NUMBER, defaultValue : 0 });
qx.OO.addProperty({ name : "blue", type : qx.constant.Type.NUMBER, defaultValue : 0 });

qx.Proto._minZIndex = 1e5;





/*
---------------------------------------------------------------------------
  CREATOR SUBS
---------------------------------------------------------------------------
*/

qx.Proto._createLayout = function()
{
  this._layout = new qx.ui.layout.VerticalBoxLayout;
  this._layout.setLocation(0, 0);
  this._layout.auto();
  this._layout.setSpacing(2);

  this.add(this._layout);
}

qx.Proto._createAutoBtn = function()
{
  this._automaticBtn = new qx.ui.form.Button("Automatic");
  this._automaticBtn.setWidth(null);
  this._automaticBtn.setAllowStretchX(true);
  this._automaticBtn.addEventListener(qx.constant.Event.EXECUTE, this._onAutomaticBtnExecute, this);
  this._layout.add(this._automaticBtn);
}

qx.Proto._createBoxes = function()
{
  this._boxes = {};

  var colorTables = this._colorTables;
  var table, box, boxLayout, field;
  for (var tableId in colorTables)
  {
    table = colorTables[tableId];

    box = new qx.ui.groupbox.GroupBox(table.label);
    box.setHeight(qx.constant.Core.AUTO);

    this._boxes[tableId] = box;
    this._layout.add(box);

    boxLayout = new qx.ui.layout.HorizontalBoxLayout;
    boxLayout.setLocation(0, 0);
    boxLayout.setSpacing(1);
    boxLayout.auto();
    box.add(boxLayout);

    for (var i=0; i<12; i++)
    {
      field = new qx.ui.basic.Terminator;
      field.setBorder(qx.renderer.border.BorderObject.presets.thinInset);
      field.setBackgroundColor(table.values[i] || null);
      field.setDimension(14, 14);

      field.addEventListener(qx.constant.Event.MOUSEDOWN, this._onFieldMouseDown, this);
      field.addEventListener(qx.constant.Event.MOUSEOVER, this._onFieldMouseOver, this);

      boxLayout.add(field);
    }
  }
}

qx.Proto._createPreview = function()
{
  this._previewBox = new qx.ui.groupbox.GroupBox("Preview (Old/New)");
  this._previewLayout = new qx.ui.layout.HorizontalBoxLayout;
  this._selectedPreview = new qx.ui.basic.Terminator;
  this._currentPreview = new qx.ui.basic.Terminator;

  this._previewLayout.setHeight(qx.constant.Core.AUTO);
  this._previewLayout.setWidth(qx.constant.Core.HUNDREDPERCENT);
  this._previewLayout.setSpacing(4);
  this._previewLayout.add(this._selectedPreview, this._currentPreview);
  this._previewBox.setHeight(qx.constant.Core.AUTO);
  this._previewBox.add(this._previewLayout);
  this._layout.add(this._previewBox);

  this._selectedPreview.setBorder(qx.renderer.border.BorderObject.presets.inset);
  this._selectedPreview.setWidth(qx.constant.Core.FLEX);
  this._selectedPreview.setHeight(24);
  this._currentPreview.setBorder(qx.renderer.border.BorderObject.presets.inset);
  this._currentPreview.setWidth(qx.constant.Core.FLEX);
  this._currentPreview.setHeight(24);
}

qx.Proto._createSelectorBtn = function()
{
  this._selectorButton = new qx.ui.form.Button("Open ColorSelector");
  this._selectorButton.setWidth(null);
  this._selectorButton.setAllowStretchX(true);
  this._selectorButton.addEventListener(qx.constant.Event.EXECUTE, this._onSelectorButtonExecute, this);
  this._layout.add(this._selectorButton);
}

qx.Proto._createColorSelector = function()
{
  if (this._colorSelector) {
    return;
  }

  this._colorSelectorWindow = new qx.ui.window.Window("Color Selector");
  this._colorSelectorWindow.setMinWidth(null);
  this._colorSelectorWindow.setMinHeight(null);
  this._colorSelectorWindow.setResizeable(false);
  this._colorSelectorWindow.auto();

  this._colorSelector = new qx.ui.component.ColorSelector;
  this._colorSelector.setBorder(null);
  this._colorSelector.setLocation(0, 0);
  this._colorSelector.addEventListener(qx.constant.Event.DIALOGOK, this._onColorSelectorOk, this);
  this._colorSelector.addEventListener(qx.constant.Event.DIALOGCANCEL, this._onColorSelectorCancel, this);

  this._colorSelectorWindow.add(this._colorSelector);

  var root = qx.core.Init.getComponent().getClientDocument();
  root.add(this._colorSelectorWindow);
}







/*
---------------------------------------------------------------------------
  MODIFIER
---------------------------------------------------------------------------
*/

qx.Proto._modifyValue = function(propValue, propOldValue, propData)
{
  if (propValue === null)
  {
    this.setRed(null);
    this.setGreen(null);
    this.setBlue(null);
  }
  else
  {
    this.setRed(propValue.getRed());
    this.setGreen(propValue.getGreen());
    this.setBlue(propValue.getBlue());
  };

  this._selectedPreview.setBackgroundColor(propValue);
  this._rotatePreviousColors();
  return true;
}

qx.Proto._rotatePreviousColors = function()
{


}






/*
---------------------------------------------------------------------------
  EVENT HANDLER
---------------------------------------------------------------------------
*/

qx.Proto._onFieldMouseDown = function(e) {
  this.setValue(this._currentPreview.getBackgroundColor());
}

qx.Proto._onFieldMouseOver = function(e) {
  this._currentPreview.setBackgroundColor(e.getTarget().getBackgroundColor());
}

qx.Proto._onAutomaticBtnExecute = function(e) {
  this.setValue(null);
}

qx.Proto._onSelectorButtonExecute = function(e)
{
  this._createColorSelector();

  this._colorSelectorWindow.setTop(qx.dom.DomLocation.getPageBoxTop(this._selectorButton.getElement()) + 10);
  this._colorSelectorWindow.setLeft(qx.dom.DomLocation.getPageBoxLeft(this._selectorButton.getElement()) + 100);
  this._colorSelectorWindow.open();
}

qx.Proto._onColorSelectorOk = function(e)
{
  var sel = this._colorSelector;
  this.setValue(qx.renderer.color.ColorCache([sel.getRed(), sel.getGreen(), sel.getBlue()]));
  this._colorSelectorWindow.close();
}

qx.Proto._onColorSelectorCancel = function(e) {
  this._colorSelectorWindow.close();
}

qx.Proto._onBeforeAppear = function(e) {
  this._currentPreview.setBackgroundColor(null);
}
