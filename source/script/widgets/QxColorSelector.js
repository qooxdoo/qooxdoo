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

  this._controlbar = new QxHorizontalBoxLayout;
  this._controlbar.setHeight(QxConst.CORE_AUTO);
  this.add(this._controlbar);

  this._btnbar = new QxHorizontalBoxLayout;
  this._btnbar.setHeight(QxConst.CORE_AUTO);
  this._btnbar.setSpacing(4);
  this._btnbar.setHorizontalChildrenAlign(QxConst.ALIGN_RIGHT);
  this._btnbar.setPadding(2, 4);
  this.add(this._btnbar);

  this._btncancel = new QxButton("Cancel", "icons/16/button-cancel.png");
  this._btnok = new QxButton("OK", "icons/16/button-ok.png");

  this._btnbar.add(this._btncancel, this._btnok);






  this._controlPane = new QxVerticalBoxLayout;
  this._controlPane.setWidth("auto");
  this._controlPane.setPadding(4);
  this._controlPane.setPaddingBottom(7);

  this._hueSaturationPane = new QxCanvasLayout;
  this._hueSaturationPane.setWidth(QxConst.CORE_AUTO);
  this._hueSaturationPane.setPadding(6, 4);

  this._brightnessPane = new QxCanvasLayout;
  this._brightnessPane.setWidth(QxConst.CORE_AUTO);
  this._brightnessPane.setPadding(6, 4);

  this._controlbar.add(this._controlPane, this._hueSaturationPane, this._brightnessPane);

  this._hueSaturation = new QxImage("core/huesaturation-field.jpg");
  this._hueSaturation.setBorder(QxBorderObject.presets.thinInset);
  this._hueSaturation.setMargin(5, 2);
  this._hueSaturationPane.add(this._hueSaturation);

  this._brightness = new QxImage("core/brightness-field.jpg");
  this._brightness.setBorder(QxBorderObject.presets.thinInset);
  this._brightness.setMargin(5, 7);
  this._brightnessPane.add(this._brightness);

  this._brightnessHandle = new QxImage("core/brightness-handle.gif");
  this._brightnessHandle.setLocation(0, 0);
  this._brightnessPane.add(this._brightnessHandle);




  this._presetFieldSet = new QxFieldSet("Presets");
  this._presetFieldSet.setHeight(QxConst.CORE_AUTO);


  this._inputFieldSet = new QxFieldSet();
  this._inputFieldSet.setHeight(QxConst.CORE_FLEX);

  this._inputLayout = new QxVerticalBoxLayout;
  this._inputLayout.setHeight(QxConst.CORE_AUTO);
  this._inputLayout.setSpacing(10);
  this._inputFieldSet.add(this._inputLayout);

  this._controlPane.add(this._presetFieldSet, this._inputFieldSet);




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




  this._hexLayout = new QxHorizontalBoxLayout;
  this._hexLayout.setHeight(QxConst.CORE_AUTO);
  this._hexLayout.setSpacing(4);
  this._hexLayout.setVerticalChildrenAlign(QxConst.ALIGN_MIDDLE);
  this._inputLayout.add(this._hexLayout);

  this._hexLabel = new QxLabel("Hex");
  this._hexLabel.setWidth(25);
  this._hexLayout.add(this._hexLabel);

  this._hexHelper = new QxLabel("#");
  this._hexLayout.add(this._hexHelper);

  this._hexValue = new QxTextField("334455");
  this._hexValue.setWidth(50);
  this._hexValue.setFont('"Bitstream Vera Sans Mono", monospace');
  this._hexLayout.add(this._hexValue);





  this._rgbSpinLayout = new QxHorizontalBoxLayout;
  this._rgbSpinLayout.setHeight(QxConst.CORE_AUTO);
  this._rgbSpinLayout.setSpacing(4);
  this._rgbSpinLayout.setVerticalChildrenAlign(QxConst.ALIGN_MIDDLE);
  this._inputLayout.add(this._rgbSpinLayout);

  this._rgbSpinLabel = new QxLabel("RGB");
  this._rgbSpinLabel.setWidth(25);
  this._rgbSpinLayout.add(this._rgbSpinLabel);

  this._rgbSpinRed = new QxSpinner(0, 0, 255);
  this._rgbSpinRed.setWidth(50);

  this._rgbSpinGreen = new QxSpinner(0, 0, 255);
  this._rgbSpinGreen.setWidth(50);

  this._rgbSpinBlue = new QxSpinner(0, 0, 255);
  this._rgbSpinBlue.setWidth(50);

  this._rgbSpinLayout.add(this._rgbSpinRed, this._rgbSpinGreen, this._rgbSpinBlue);






  this._hsbSpinLayout = new QxHorizontalBoxLayout;
  this._hsbSpinLayout.setHeight(QxConst.CORE_AUTO);
  this._hsbSpinLayout.setSpacing(4);
  this._hsbSpinLayout.setVerticalChildrenAlign(QxConst.ALIGN_MIDDLE);
  this._inputLayout.add(this._hsbSpinLayout);

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









  function updateFromRgbSpinner() {
    this._hexValue.setValue(this._rgbSpinRed.getValue().toString(16).pad(2) + this._rgbSpinGreen.getValue().toString(16).pad(2) + this._rgbSpinBlue.getValue().toString(16).pad(2));
  };

  this._rgbSpinRed.addEventListener("change", updateFromRgbSpinner, this);
  this._rgbSpinGreen.addEventListener("change", updateFromRgbSpinner, this);
  this._rgbSpinBlue.addEventListener("change", updateFromRgbSpinner, this);






  this._brightnessHandle.addEventListener("mousedown", function(e) {
    this.setCapture(true);
  });

  this._brightnessHandle.addEventListener("mouseup", function(e) {
    this.setCapture(false);
  });

  this._brightnessHandle.addEventListener("mousemove", function(e)
  {
    if (!this.getCapture()) {
      return;
    };

    this.setTop( (e.getPageY()-QxDom.getComputedPageBoxTop(this.getParent().getElement())).limit(0, 255) );
  });






};

QxColorSelector.extend(QxVerticalBoxLayout, "QxColorSelector");

QxColorSelector.changeProperty({ name : "appearance", type : QxConst.TYPEOF_STRING, defaultValue : "colorselector" });

