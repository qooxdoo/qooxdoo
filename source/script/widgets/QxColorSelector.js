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
#post(QxColorUtil)

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

QxColorSelector.addProperty({ name : "red", type : QxConst.TYPEOF_NUMBER, defaultValue : 0 });
QxColorSelector.addProperty({ name : "green", type : QxConst.TYPEOF_NUMBER, defaultValue : 0 });
QxColorSelector.addProperty({ name : "blue", type : QxConst.TYPEOF_NUMBER, defaultValue : 0 });

QxColorSelector.addProperty({ name : "hue", type : QxConst.TYPEOF_NUMBER, defaultValue : 0 });
QxColorSelector.addProperty({ name : "saturation", type : QxConst.TYPEOF_NUMBER, defaultValue : 0 });
QxColorSelector.addProperty({ name : "brightness", type : QxConst.TYPEOF_NUMBER, defaultValue : 0 });

proto._updateContext = null;








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

  this._hueSaturationPane.addEventListener(QxConst.EVENT_TYPE_MOUSEWHEEL, this._onHueSaturationPaneMouseWheel, this);

  this._hueSaturationField = new QxImage("core/huesaturation-field.jpg");
  this._hueSaturationField.setBorder(QxBorderObject.presets.thinInset);
  this._hueSaturationField.setMargin(5);
  this._hueSaturationField.setParent(this._hueSaturationPane);

  this._hueSaturationField.addEventListener(QxConst.EVENT_TYPE_MOUSEDOWN, this._onHueSaturationFieldMouseDown, this);

  this._hueSaturationHandle = new QxImage("core/huesaturation-handle.gif");
  this._hueSaturationHandle.setLocation(0, 256);
  this._hueSaturationHandle.setParent(this._hueSaturationPane);

  this._hueSaturationHandle.addEventListener(QxConst.EVENT_TYPE_MOUSEDOWN, this._onHueSaturationHandleMouseDown, this);
  this._hueSaturationHandle.addEventListener(QxConst.EVENT_TYPE_MOUSEUP, this._onHueSaturationHandleMouseUp, this);
  this._hueSaturationHandle.addEventListener(QxConst.EVENT_TYPE_MOUSEMOVE, this._onHueSaturationHandleMouseMove, this);
};

proto._createBrightnessPane = function()
{
  this._brightnessPane = new QxCanvasLayout;
  this._brightnessPane.setWidth(QxConst.CORE_AUTO);
  this._brightnessPane.setPadding(6, 4);
  this._brightnessPane.setParent(this._controlBar);

  this._brightnessPane.addEventListener(QxConst.EVENT_TYPE_MOUSEWHEEL, this._onBrightnessPaneMouseWheel, this);

  this._brightnessField = new QxImage("core/brightness-field.jpg");
  this._brightnessField.setBorder(QxBorderObject.presets.thinInset);
  this._brightnessField.setMargin(5, 7);
  this._brightnessField.setParent(this._brightnessPane);

  this._brightnessField.addEventListener(QxConst.EVENT_TYPE_MOUSEDOWN, this._onBrightnessFieldMouseDown, this);

  this._brightnessHandle = new QxImage("core/brightness-handle.gif");
  this._brightnessHandle.setLocation(0, 256);
  this._brightnessHandle.setParent(this._brightnessPane);

  this._brightnessHandle.addEventListener(QxConst.EVENT_TYPE_MOUSEDOWN, this._onBrightnessHandleMouseDown, this);
  this._brightnessHandle.addEventListener(QxConst.EVENT_TYPE_MOUSEUP, this._onBrightnessHandleMouseUp, this);
  this._brightnessHandle.addEventListener(QxConst.EVENT_TYPE_MOUSEMOVE, this._onBrightnessHandleMouseMove, this);
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
      colorField.addEventListener(QxConst.EVENT_TYPE_MOUSEDOWN, this._onColorFieldClick, this);

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

  this._hexField = new QxTextField("000000");
  this._hexField.setWidth(50);
  this._hexField.setFont('11px "Bitstream Vera Sans Mono", monospace');
  this._hexField.setParent(this._hexLayout);

  this._hexField.addEventListener("changeValue", this._onHexFieldChange, this);
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

  this._rgbSpinRed.addEventListener("change", this._setRedFromSpinner, this);
  this._rgbSpinGreen.addEventListener("change", this._setGreenFromSpinner, this);
  this._rgbSpinBlue.addEventListener("change", this._setBlueFromSpinner, this);
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

  this._hsbSpinHue.addEventListener("change", this._setHueFromSpinner, this);
  this._hsbSpinSaturation.addEventListener("change", this._setSaturationFromSpinner, this);
  this._hsbSpinBrightness.addEventListener("change", this._setBrightnessFromSpinner, this);
};









/*
---------------------------------------------------------------------------
  RGB MODIFIER
---------------------------------------------------------------------------
*/

proto._modifyRed = function(propValue, propOldValue, propData)
{
  if (this._updateContext === null) {
    this._updateContext = "redModifier";
  };

  if (this._updateContext !== "rgbSpinner") {
    this._rgbSpinRed.setValue(propValue);
  };

  if (this._updateContext !== "hexField") {
    this._setHexFromRgb();
  };

  switch(this._updateContext)
  {
    case "rgbSpinner":
    case "hexField":
    case "redModifier":
      this._setHueFromRgb();
  };

  if (this._updateContext === "redModifier") {
    this._updateContext = null;
  };

  return true;
};

proto._modifyGreen = function(propValue, propOldValue, propData)
{
  if (this._updateContext === null) {
    this._updateContext = "greenModifier";
  };

  if (this._updateContext !== "rgbSpinner") {
    this._rgbSpinGreen.setValue(propValue);
  };

  if (this._updateContext !== "hexField") {
    this._setHexFromRgb();
  };

  switch(this._updateContext)
  {
    case "rgbSpinner":
    case "hexField":
    case "greenModifier":
      this._setHueFromRgb();
  };

  if (this._updateContext === "greenModifier") {
    this._updateContext = null;
  };

  return true;
};

proto._modifyBlue = function(propValue, propOldValue, propData)
{
  if (this._updateContext === null) {
    this._updateContext = "blueModifier";
  };

  if (this._updateContext !== "rgbSpinner") {
    this._rgbSpinBlue.setValue(propValue);
  };

  if (this._updateContext !== "hexField") {
    this._setHexFromRgb();
  };

  switch(this._updateContext)
  {
    case "rgbSpinner":
    case "hexField":
    case "blueModifier":
      this._setHueFromRgb();
  };

  if (this._updateContext === "blueModifier") {
    this._updateContext = null;
  };

  return true;
};







/*
---------------------------------------------------------------------------
  HSB MODIFIER
---------------------------------------------------------------------------
*/

proto._modifyHue = function(propValue, propOldValue, propData)
{
  if (this._updateContext === null) {
    this._updateContext = "hueModifier";
  };

  if (this._updateContext !== "hsbSpinner") {
    this._hsbSpinHue.setValue(propValue);
  };

  if (this._updateContext !== "hueSaturationField") {
    this._hueSaturationHandle.setLeft(Math.round(propValue / 1.40625));
  };

  switch(this._updateContext)
  {
    case "hsbSpinner":
    case "hueSaturationField":
    case "hueModifier":
      this._setRgbFromHue();
  };

  if (this._updateContext === "hueModifier") {
    this._updateContext = null;
  };

  return true;
};

proto._modifySaturation = function(propValue, propOldValue, propData)
{
  if (this._updateContext === null) {
    this._updateContext = "saturationModifier";
  };

  if (this._updateContext !== "hsbSpinner") {
    this._hsbSpinSaturation.setValue(propValue);
  };

  if (this._updateContext !== "hueSaturationField") {
    this._hueSaturationHandle.setTop(256 - Math.round(propValue * 2.56));
  };

  switch(this._updateContext)
  {
    case "hsbSpinner":
    case "hueSaturationField":
    case "saturationModifier":
      this._setRgbFromHue();
  };

  if (this._updateContext === "saturationModifier") {
    this._updateContext = null;
  };

  return true;
};

proto._modifyBrightness = function(propValue, propOldValue, propData)
{
  if (this._updateContext === null) {
    this._updateContext = "brightnessModifier";
  };

  if (this._updateContext !== "hsbSpinner") {
    this._hsbSpinBrightness.setValue(propValue);
  };

  if (this._updateContext !== "brightnessField") {
    this._brightnessHandle.setTop(256-Math.round(propValue * 2.56));
  };

  switch(this._updateContext)
  {
    case "hsbSpinner":
    case "brightnessField":
    case "brightnessModifier":
      this._setRgbFromHue();
  };

  if (this._updateContext === "brightnessModifier") {
    this._updateContext = null;
  };

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

  this._updateContext = "brightnessField";

  this._brightnessHandle.setTop(vValue);
  this.setBrightness(Math.round(vValue / 2.56));

  this._updateContext = null;
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

  this._updateContext = "hueSaturationField";

  this.setSaturation(100-Math.round(vTop / 2.56));
  this.setHue(Math.round(vLeft * 1.40625));

  this._updateContext = null;
};










/*
---------------------------------------------------------------------------
  RGB SPINNER
---------------------------------------------------------------------------
*/

proto._setRedFromSpinner = function()
{
  if (this._updateContext !== null) {
    return;
  };

  this._updateContext = "rgbSpinner";
  this.setRed(this._rgbSpinRed.getValue());
  this._updateContext = null;
};

proto._setGreenFromSpinner = function()
{
  if (this._updateContext !== null) {
    return;
  };

  this._updateContext = "rgbSpinner";
  this.setGreen(this._rgbSpinGreen.getValue());
  this._updateContext = null;
};

proto._setBlueFromSpinner = function()
{
  if (this._updateContext !== null) {
    return;
  };

  this._updateContext = "rgbSpinner";
  this.setBlue(this._rgbSpinBlue.getValue());
  this._updateContext = null;
};










/*
---------------------------------------------------------------------------
  HSB SPINNER
---------------------------------------------------------------------------
*/

proto._setHueFromSpinner = function()
{
  if (this._updateContext !== null) {
    return;
  };

  this._updateContext = "hsbSpinner";
  this.setHue(this._hsbSpinHue.getValue());
  this._updateContext = null;
};

proto._setSaturationFromSpinner = function()
{
  if (this._updateContext !== null) {
    return;
  };

  this._updateContext = "hsbSpinner";
  this.setSaturation(this._hsbSpinSaturation.getValue());
  this._updateContext = null;
};

proto._setBrightnessFromSpinner = function()
{
  if (this._updateContext !== null) {
    return;
  };

  this._updateContext = "hsbSpinner";
  this.setBrightness(this._hsbSpinBrightness.getValue());
  this._updateContext = null;
};








/*
---------------------------------------------------------------------------
  HEX FIELD
---------------------------------------------------------------------------
*/

proto._onHexFieldChange = function(e)
{
  if (this._updateContext !== null) {
    return;
  };

  var vValue = this._hexField.getValue().toLowerCase();

  var vRed = 0;
  var vGreen = 0;
  var vBlue = 0;

  switch(vValue.length)
  {
    case 3:
      vRed = QxColor.m_rgb[vValue.charAt(0)];
      vGreen = QxColor.m_rgb[vValue.charAt(1)];
      vBlue = QxColor.m_rgb[vValue.charAt(2)];

      vRed = (vRed * 16) + vRed;
      vGreen = (vGreen * 16) + vGreen;
      vBlue = (vBlue * 16) + vBlue;

      break;

    case 6:
      vRed = (QxColor.m_rgb[vValue.charAt(0)] * 16) + QxColor.m_rgb[vValue.charAt(1)];
      vGreen = (QxColor.m_rgb[vValue.charAt(2)] * 16) + QxColor.m_rgb[vValue.charAt(3)];
      vBlue = (QxColor.m_rgb[vValue.charAt(4)] * 16) + QxColor.m_rgb[vValue.charAt(5)];

      break;

    default:
      return false;
  };

  this._updateContext = "hexField";

  this.setRed(vRed);
  this.setGreen(vGreen);
  this.setBlue(vBlue);

  this._updateContext = null;
};

proto._setHexFromRgb = function() {
  this._hexField.setValue(this.getRed().toString(16).pad(2) + this.getGreen().toString(16).pad(2) + this.getBlue().toString(16).pad(2));
};








/*
---------------------------------------------------------------------------
  COLOR FIELD
---------------------------------------------------------------------------
*/

proto._onColorFieldClick = function(e)
{
  var vColor = e.getTarget().getBackgroundColor();

  if (!vColor) {
    return this.error("Missing backgroundColor value for field: " + e.getTarget());
  };

  this.setRed(vColor.getRed());
  this.setGreen(vColor.getGreen());
  this.setBlue(vColor.getBlue());
};








/*
---------------------------------------------------------------------------
  RGB/HSB SYNC
---------------------------------------------------------------------------
*/

proto._setHueFromRgb = function()
{
  switch(this._updateContext)
  {
    case "hsbSpinner":
    case "hueSaturationField":
    case "brightnessField":
      break;

    default:
      var vHsb = QxColorUtil.rgb2hsb(this.getRed(), this.getGreen(), this.getBlue());

      this.setHue(vHsb.hue);
      this.setSaturation(vHsb.saturation);
      this.setBrightness(vHsb.brightness);
  };
};

proto._setRgbFromHue = function()
{
  switch(this._updateContext)
  {
    case "rgbSpinner":
    case "hexField":
      break;

    default:
      var vRgb = QxColorUtil.hsb2rgb(this.getHue(), this.getSaturation(), this.getBrightness());

      this.setRed(vRgb.red);
      this.setGreen(vRgb.green);
      this.setBlue(vRgb.blue);
  };
};
