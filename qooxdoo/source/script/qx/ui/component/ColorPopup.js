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

  this._colorTables = colorTables;

  var borders = qx.renderer.border.BorderObject.presets;

  this.setPadding(4);
  this.auto();
  this.setAutoHide(false);
  this.setBorder(borders.outset);
  this.setBackgroundColor("threedface");

  this._layout = new qx.ui.layout.VerticalBoxLayout;
  this._layout.setLocation(0, 0);
  this._layout.auto();
  this._layout.setSpacing(2);
  this.add(this._layout);

  this._automaticBtn = new qx.ui.form.Button("Automatic");
  this._automaticBtn.setWidth(null);
  this._automaticBtn.setAllowStretchX(true);
  this._automaticBtn.addEventListener("execute", this._onAutomaticBtnExecute, this);
  this._layout.add(this._automaticBtn);

  this._boxes = {};

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
      field.setBorder(borders.thinInset);
      field.setBackgroundColor(table.values[i] || null);
      field.setDimension(14, 14);

      field.addEventListener(qx.constant.Event.MOUSEDOWN, this._onFieldMouseDown, this);
      field.addEventListener(qx.constant.Event.MOUSEOVER, this._onFieldMouseOver, this);

      boxLayout.add(field);
    }
  }

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

  this._selectedPreview.setBorder(borders.inset);
  this._selectedPreview.setWidth(qx.constant.Core.FLEX);
  this._selectedPreview.setHeight(24);
  this._currentPreview.setBorder(borders.inset);
  this._currentPreview.setWidth(qx.constant.Core.FLEX);
  this._currentPreview.setHeight(24);

  this._selectorButton = new qx.ui.form.Button("Open ColorSelector");
  this._selectorButton.setWidth(null);
  this._selectorButton.setAllowStretchX(true);
  this._selectorButton.addEventListener("execute", this._onSelectorButtonExecute, this);
  this._layout.add(this._selectorButton);
});

qx.OO.addProperty({ name : "value", type : qx.constant.Type.OBJECT, instance : "qx.renderer.color.Color" });

qx.OO.addProperty({ name : "red", type : qx.constant.Type.NUMBER, defaultValue : 0 });
qx.OO.addProperty({ name : "green", type : qx.constant.Type.NUMBER, defaultValue : 0 });
qx.OO.addProperty({ name : "blue", type : qx.constant.Type.NUMBER, defaultValue : 0 });

qx.Proto._onFieldMouseDown = function(e) {
  this.setValue(this._currentPreview.getBackgroundColor());
  this.hide();
}

qx.Proto._onFieldMouseOver = function(e) {
  this._currentPreview.setBackgroundColor(e.getTarget().getBackgroundColor());
}

qx.Proto._onAutomaticBtnExecute = function(e) {
  this.setValue(null);
  this.hide();
}

qx.Proto._onSelectorButtonExecute = function(e)
{
  this._createColorSelector();

  this._colorSelectorWindow.setTop(qx.dom.DomLocation.getPageBoxTop(this._selectorButton.getElement()));
  this._colorSelectorWindow.setLeft(qx.dom.DomLocation.getPageBoxLeft(this._selectorButton.getElement()));
  this._colorSelectorWindow.open();
}

qx.Proto._createColorSelector = function(e) {
  if (this._colorSelector) {
    return;
  }

  var root = qx.core.Init.getComponent().getClientDocument();

  this._colorSelectorWindow = new qx.ui.window.Window("Color Selector");
  this._colorSelectorWindow.setMinWidth(null);
  this._colorSelectorWindow.setMaxWidth(null);
  this._colorSelectorWindow.auto();
  root.add(this._colorSelectorWindow);

  this._colorSelector = new qx.ui.component.ColorSelector;
  this._colorSelector.setBorder(null);
  this._colorSelector.setLocation(0, 0);
  this._colorSelectorWindow.add(this._colorSelector);
}

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

  return true;
}

