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

#package(colorselector)
#post(QxHorizontalBoxLayout)
#post(QxButton)
#post(QxCanvasLayout)
#post(QxImage)
#post(QxBorderObjectPresets)
#post(QxFieldSet)
#post(QxLabel)
#post(QxSpinner)
#post(QxTextField)

************************************************************************ */

/*!
  A typical color selector as known from native applications.

  Includes support for RGB and HSB color areas.
*/
function QxColorSelector()
{
  QxVerticalBoxLayout.call(this);

  // 1. Base Structure (Vertical Split)
  this._createControlBar();
  this._createButtonBar();

  // 2. Panes (Horizontal Split)
  this._createControlPane();
  this._createHueSaturationPane();
  this._createBrightnessPane();

  // 3. Control Pane Content
  this._createPresetFieldSet();
  this._createInputFieldSet();

  // 4. Input FieldSet Content
  this._createHexField();
  this._createRgbSpinner();
  this._createHsbSpinner();
};

QxColorSelector.extend(QxVerticalBoxLayout, "QxColorSelector");

QxColorSelector.changeProperty({ name : "appearance", type : QxConst.TYPEOF_STRING, defaultValue : "colorselector" });

QxColorSelector.addProperty({ name : "red", type : QxConst.TYPEOF_NUMBER });
QxColorSelector.addProperty({ name : "green", type : QxConst.TYPEOF_NUMBER });
QxColorSelector.addProperty({ name : "blue", type : QxConst.TYPEOF_NUMBER });

QxColorSelector.addProperty({ name : "hue", type : QxConst.TYPEOF_NUMBER });
QxColorSelector.addProperty({ name : "saturation", type : QxConst.TYPEOF_NUMBER });
QxColorSelector.addProperty({ name : "brightness", type : QxConst.TYPEOF_NUMBER });









/*
---------------------------------------------------------------------------
  CREATE #1: BASE STRUCTURE
---------------------------------------------------------------------------
*/

proto._createControlBar = function()
{
  this._controlBar = new QxHorizontalBoxLayout;
  this._controlBar.setHeight(QxConst.CORE_AUTO);
  this._controlBar.setParent(this);
};

proto._createButtonBar = function()
{
  this._btnbar = new QxHorizontalBoxLayout;
  this._btnbar.setHeight(QxConst.CORE_AUTO);
  this._btnbar.setSpacing(4);
  this._btnbar.setHorizontalChildrenAlign(QxConst.ALIGN_RIGHT);
  this._btnbar.setPadding(2, 4);
  this.add(this._btnbar);

  this._btncancel = new QxButton("Cancel", "icons/16/button-cancel.png");
  this._btnok = new QxButton("OK", "icons/16/button-ok.png");

  this._btnbar.add(this._btncancel, this._btnok);
};









/*
---------------------------------------------------------------------------
  CREATE #2: PANES
---------------------------------------------------------------------------
*/

proto._createControlPane = function()
{
  this._controlPane = new QxVerticalBoxLayout;
  this._controlPane.setWidth("auto");
  this._controlPane.setPadding(4);
  this._controlPane.setPaddingBottom(7);
  this._controlPane.setParent(this._controlBar);
};

proto._createHueSaturationPane = function()
{
  this._hueSaturationPane = new QxCanvasLayout;
  this._hueSaturationPane.setWidth(QxConst.CORE_AUTO);
  this._hueSaturationPane.setPadding(6, 4);
  this._hueSaturationPane.setParent(this._controlBar);

  this._hueSaturationPane.addEventListener("mousewheel", this._onHueSaturationPaneMouseWheel, this);

  this._hueSaturationField = new QxImage("core/huesaturation-field.jpg");
  this._hueSaturationField.setBorder(QxBorderObject.presets.thinInset);
  this._hueSaturationField.setMargin(5);
  this._hueSaturationField.setParent(this._hueSaturationPane);

  this._hueSaturationField.addEventListener("mousedown", this._onHueSaturationFieldMouseDown, this);

  this._hueSaturationHandle = new QxImage("core/huesaturation-handle.gif");
  this._hueSaturationHandle.setLocation(0, 0);
  this._hueSaturationHandle.setParent(this._hueSaturationPane);

  this._hueSaturationHandle.addEventListener("mousedown", this._onHueSaturationHandleMouseDown, this);
  this._hueSaturationHandle.addEventListener("mouseup", this._onHueSaturationHandleMouseUp, this);
  this._hueSaturationHandle.addEventListener("mousemove", this._onHueSaturationHandleMouseMove, this);
};

proto._createBrightnessPane = function()
{
  this._brightnessPane = new QxCanvasLayout;
  this._brightnessPane.setWidth(QxConst.CORE_AUTO);
  this._brightnessPane.setPadding(6, 4);
  this._brightnessPane.setParent(this._controlBar);

  this._brightnessPane.addEventListener("mousewheel", this._onBrightnessPaneMouseWheel, this);

  this._brightnessField = new QxImage("core/brightness-field.jpg");
  this._brightnessField.setBorder(QxBorderObject.presets.thinInset);
  this._brightnessField.setMargin(5, 7);
  this._brightnessField.setParent(this._brightnessPane);

  this._brightnessField.addEventListener("mousedown", this._onBrightnessFieldMouseDown, this);

  this._brightnessHandle = new QxImage("core/brightness-handle.gif");
  this._brightnessHandle.setLocation(0, 0);
  this._brightnessHandle.setParent(this._brightnessPane);

  this._brightnessHandle.addEventListener("mousedown", this._onBrightnessHandleMouseDown, this);
  this._brightnessHandle.addEventListener("mouseup", this._onBrightnessHandleMouseUp, this);
  this._brightnessHandle.addEventListener("mousemove", this._onBrightnessHandleMouseMove, this);
};









/*
---------------------------------------------------------------------------
  CREATE #3: CONTROL PANE CONTENT
---------------------------------------------------------------------------
*/

proto._createPresetFieldSet = function()
{
  this._presetFieldSet = new QxFieldSet("Presets");
  this._presetFieldSet.setHeight(QxConst.CORE_AUTO);
  this._presetFieldSet.setParent(this._controlPane);

  this._presetGrid = new QxGridLayout;
  this._presetGrid.setHorizontalSpacing(2);
  this._presetGrid.setVerticalSpacing(2);
  this._presetGrid.setColumnCount(11);
  this._presetGrid.setRowCount(4);
  this._presetGrid.setColumnWidth(0, 18);
  this._presetGrid.setColumnWidth(1, 18);
  this._presetGrid.setColumnWidth(2, 18);
  this._presetGrid.setColumnWidth(3, 18);
  this._presetGrid.setColumnWidth(4, 18);
  this._presetGrid.setColumnWidth(5, 18);
  this._presetGrid.setColumnWidth(6, 18);
  this._presetGrid.setColumnWidth(7, 18);
  this._presetGrid.setColumnWidth(8, 18);
  this._presetGrid.setColumnWidth(9, 18);

  this._presetGrid.setRowHeight(0, 16);
  this._presetGrid.setRowHeight(1, 16);
  this._presetFieldSet.add(this._presetGrid);

  this._presetTable = [ "maroon", "red", "orange", "yellow", "olive", "purple", "fuchsia", "lime", "green", "navy", "blue", "aqua", "teal", "black", "#333", "#666", "#999", "#BBB", "#EEE", "white" ];

  var colorField;

  for (var i=0; i<2; i++)
  {
    for (var j=0; j<10; j++)
    {
      colorField = new QxTerminator;
      colorField.setBorder(QxBorderObject.presets.thinInset);
      colorField.setBackgroundColor(this._presetTable[i*10+j]);

      this._presetGrid.add(colorField, j, i);
    };
  };
};

proto._createInputFieldSet = function()
{
  this._inputFieldSet = new QxFieldSet();
  this._inputFieldSet.setHeight(QxConst.CORE_FLEX);
  this._inputFieldSet.setParent(this._controlPane);

  this._inputLayout = new QxVerticalBoxLayout;
  this._inputLayout.setHeight(QxConst.CORE_AUTO);
  this._inputLayout.setSpacing(10);
  this._inputLayout.setParent(this._inputFieldSet.getFrameObject());
};









/*
---------------------------------------------------------------------------
  CREATE #4: INPUT FIELDSET CONTENT
---------------------------------------------------------------------------
*/

proto._createHexField = function()
{
  this._hexLayout = new QxHorizontalBoxLayout;
  this._hexLayout.setHeight(QxConst.CORE_AUTO);
  this._hexLayout.setSpacing(4);
  this._hexLayout.setVerticalChildrenAlign(QxConst.ALIGN_MIDDLE);
  this._hexLayout.setParent(this._inputLayout);

  this._hexLabel = new QxLabel("Hex");
  this._hexLabel.setWidth(25);
  this._hexLabel.setParent(this._hexLayout);

  this._hexHelper = new QxLabel("#");
  this._hexHelper.setParent(this._hexLayout);

  this._hexValue = new QxTextField("334455");
  this._hexValue.setWidth(50);
  this._hexValue.setFont('"Bitstream Vera Sans Mono", monospace');
  this._hexValue.setParent(this._hexLayout);
};

proto._createRgbSpinner = function()
{
  this._rgbSpinLayout = new QxHorizontalBoxLayout;
  this._rgbSpinLayout.setHeight(QxConst.CORE_AUTO);
  this._rgbSpinLayout.setSpacing(4);
  this._rgbSpinLayout.setVerticalChildrenAlign(QxConst.ALIGN_MIDDLE);
  this._rgbSpinLayout.setParent(this._inputLayout);

  this._rgbSpinLabel = new QxLabel("RGB");
  this._rgbSpinLabel.setWidth(25);
  this._rgbSpinLabel.setParent(this._rgbSpinLayout);

  this._rgbSpinRed = new QxSpinner(0, 0, 255);
  this._rgbSpinRed.setWidth(50);

  this._rgbSpinGreen = new QxSpinner(0, 0, 255);
  this._rgbSpinGreen.setWidth(50);

  this._rgbSpinBlue = new QxSpinner(0, 0, 255);
  this._rgbSpinBlue.setWidth(50);

  this._rgbSpinLayout.add(this._rgbSpinRed, this._rgbSpinGreen, this._rgbSpinBlue);

  function updateFromRgbSpinner() {
    this._hexValue.setValue(this._rgbSpinRed.getValue().toString(16).pad(2) + this._rgbSpinGreen.getValue().toString(16).pad(2) + this._rgbSpinBlue.getValue().toString(16).pad(2));
  };

  this._rgbSpinRed.addEventListener("change", updateFromRgbSpinner, this);
  this._rgbSpinGreen.addEventListener("change", updateFromRgbSpinner, this);
  this._rgbSpinBlue.addEventListener("change", updateFromRgbSpinner, this);
};

proto._createHsbSpinner = function()
{
  this._hsbSpinLayout = new QxHorizontalBoxLayout;
  this._hsbSpinLayout.setHeight(QxConst.CORE_AUTO);
  this._hsbSpinLayout.setSpacing(4);
  this._hsbSpinLayout.setVerticalChildrenAlign(QxConst.ALIGN_MIDDLE);
  this._hsbSpinLayout.setParent(this._inputLayout);

  this._hsbSpinLabel = new QxLabel("HSB");
  this._hsbSpinLabel.setWidth(25);
  this._hsbSpinLayout.add(this._hsbSpinLabel);

  this._hsbSpinHue = new QxSpinner(0, 0, 360);
  this._hsbSpinHue.setWidth(50);

  this._hsbSpinSaturation = new QxSpinner(0, 0, 100);
  this._hsbSpinSaturation.setWidth(50);

  this._hsbSpinBrightness = new QxSpinner(0, 0, 100);
  this._hsbSpinBrightness.setWidth(50);

  this._hsbSpinLayout.add(this._hsbSpinHue, this._hsbSpinSaturation, this._hsbSpinBrightness);
};









/*
---------------------------------------------------------------------------
  RGB MODIFIER
---------------------------------------------------------------------------
*/

proto._modifyRed = function(propValue, propOldValue, propData)
{
  this._hsbSpinRed.setValue(propValue);
  return true;
};

proto._modifyGreen = function(propValue, propOldValue, propData)
{
  this._hsbSpinGreen.setValue(propValue);
  return true;
};

proto._modifyBlue = function(propValue, propOldValue, propData)
{
  this._hsbSpinBlue.setValue(propValue);
  return true;
};







/*
---------------------------------------------------------------------------
  HSB MODIFIER
---------------------------------------------------------------------------
*/

proto._modifyHue = function(propValue, propOldValue, propData)
{
  this._hsbSpinHue.setValue(propValue);
  return true;
};

proto._modifySaturation = function(propValue, propOldValue, propData)
{
  this._hsbSpinSaturation.setValue(propValue);
  return true;
};

proto._modifyBrightness = function(propValue, propOldValue, propData)
{
  this._hsbSpinBrightness.setValue(propValue);
  return true;
};








/*
---------------------------------------------------------------------------
  BRIGHTNESS IMPLEMENTATION
---------------------------------------------------------------------------
*/

proto._onBrightnessHandleMouseDown = function(e)
{
  // Activate Capturing
  this._brightnessHandle.setCapture(true);

  // Calculate subtract: Position of Brightness Field - Current Mouse Offset
  this._brightnessSubtract = QxDom.getComputedPageOuterTop(this._brightnessField.getElement()) + (e.getPageY() - QxDom.getComputedPageBoxTop(this._brightnessHandle.getElement()));

  // Block field event handling
  e.setPropagationStopped(true);
};

proto._onBrightnessHandleMouseUp = function(e)
{
  // Disabling capturing
  this._brightnessHandle.setCapture(false);
};

proto._onBrightnessHandleMouseMove = function(e)
{
  // Update if captured currently (through previous mousedown)
  if (this._brightnessHandle.getCapture()) {
    this._setBrightnessOnFieldEvent(e);
  };
};

proto._onBrightnessFieldMouseDown = function(e)
{
  // Calculate substract: Half height of handler
  this._brightnessSubtract = QxDom.getComputedPageOuterTop(this._brightnessField.getElement()) + Math.round(QxDom.getComputedBoxHeight(this._brightnessHandle.getElement()) / 2);

  // Update
  this._setBrightnessOnFieldEvent(e);

  // Afterwards: Activate Capturing for handle
  this._brightnessHandle.setCapture(true);
};

proto._onBrightnessPaneMouseWheel = function(e) {
  this.setBrightness((this.getBrightness() + e.getWheelDelta()).limit(0, 100));
};

proto._setBrightnessOnFieldEvent = function(e)
{
  var vValue = (e.getPageY() - this._brightnessSubtract).limit(0, 256);

  this._brightnessHandle.setTop(vValue);
  this.setBrightness(Math.round(vValue / 2.56));
};






/*
---------------------------------------------------------------------------
  HUE/SATURATION IMPLEMENTATION
---------------------------------------------------------------------------
*/

proto._onHueSaturationHandleMouseDown = function(e)
{
  // Activate Capturing
  this._hueSaturationHandle.setCapture(true);

  // Calculate subtract: Position of HueSaturation Field - Current Mouse Offset
  this._hueSaturationSubtractTop = QxDom.getComputedPageOuterTop(this._hueSaturationField.getElement()) + (e.getPageY() - QxDom.getComputedPageBoxTop(this._hueSaturationHandle.getElement()));
  this._hueSaturationSubtractLeft = QxDom.getComputedPageOuterLeft(this._hueSaturationField.getElement()) + (e.getPageX() - QxDom.getComputedPageBoxLeft(this._hueSaturationHandle.getElement()));

  // Block field event handling
  e.setPropagationStopped(true);
};

proto._onHueSaturationHandleMouseUp = function(e)
{
  // Disabling capturing
  this._hueSaturationHandle.setCapture(false);
};

proto._onHueSaturationHandleMouseMove = function(e)
{
  // Update if captured currently (through previous mousedown)
  if (this._hueSaturationHandle.getCapture()) {
    this._setHueSaturationOnFieldEvent(e);
  };
};

proto._onHueSaturationFieldMouseDown = function(e)
{
  // Calculate substract: Half width/height of handler
  this._hueSaturationSubtractTop = QxDom.getComputedPageOuterTop(this._hueSaturationField.getElement()) + Math.round(QxDom.getComputedBoxHeight(this._hueSaturationHandle.getElement()) / 2);
  this._hueSaturationSubtractLeft = QxDom.getComputedPageOuterLeft(this._hueSaturationField.getElement()) + Math.round(QxDom.getComputedBoxWidth(this._hueSaturationHandle.getElement()) / 2);

  // Update
  this._setHueSaturationOnFieldEvent(e);

  // Afterwards: Activate Capturing for handle
  this._hueSaturationHandle.setCapture(true);
};

proto._onHueSaturationPaneMouseWheel = function(e) {
  this.setSaturation((this.getSaturation() + e.getWheelDelta()).limit(0, 100));
};

proto._setHueSaturationOnFieldEvent = function(e)
{
  var vTop = (e.getPageY() - this._hueSaturationSubtractTop).limit(0, 256);
  var vLeft = (e.getPageX() - this._hueSaturationSubtractLeft).limit(0, 256);

  this._hueSaturationHandle.setTop(vTop);
  this._hueSaturationHandle.setLeft(vLeft);

  this.setSaturation(Math.round(vTop / 2.56));
  this.setHue(Math.round(vLeft * 1.40625));
};
