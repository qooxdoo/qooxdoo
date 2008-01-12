/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

#embed(qx.widgettheme/colorselector/*)
#embed(qx.icontheme/16/actions/dialog-cancel.png)
#embed(qx.icontheme/16/actions/dialog-ok.png)
#embed(qx.static/image/dotted_white.gif)

************************************************************************ */

/**
 * A typical color selector as known from native applications.
 *
 * Includes support for RGB and HSB color areas.
 *
 * @appearance colorselector
 */
qx.Class.define("qx.ui.component.ColorSelector",
{
  extend : qx.ui.layout.VerticalBoxLayout,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(vPreviousRed, vPreviousGreen, vPreviousBlue)
  {
    this.base(arguments);

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
    this._createPreviewFieldSet();

    // 4. Input FieldSet Content
    this._createHexField();
    this._createRgbSpinner();
    this._createHsbSpinner();

    // 5. Preview FieldSet Content
    this._createPreviewContent();

    // Apply colors
    if (arguments.length == 3) {
      this.setPreviousColor(vPreviousRed, vPreviousGreen, vPreviousBlue);
    }

    // Initialize properties
    this.initWidth();
    this.initHeight();
  },




  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events: {
    "dialogok"     : "qx.event.type.Event",
    "dialogcancel" : "qx.event.type.Event"
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    appearance :
    {
      refine : true,
      init : "colorselector"
    },

    width :
    {
      refine : true,
      init : "auto"
    },

    height :
    {
      refine : true,
      init : "auto"
    },

    red :
    {
      check : "Integer",
      init : 255,
      apply : "_applyRed"
    },

    green :
    {
      check : "Integer",
      init : 255,
      apply : "_applyGreen"
    },

    blue :
    {
      check : "Integer",
      init :  255,
      apply : "_applyBlue"
    },

    hue :
    {
      check : "Number",
      init : 0,
      apply : "_applyHue"
    },

    saturation :
    {
      check : "Number",
      init : 0,
      apply : "_applySaturation"
    },

    brightness :
    {
      check : "Number",
      init : 100,
      apply : "_applyBrightness"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /*
    ---------------------------------------------------------------------------
      CONTEXT HANDLING
    ---------------------------------------------------------------------------
    */

    _updateContext : null,




    /*
    ---------------------------------------------------------------------------
      CREATE #1: BASE STRUCTURE
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _createControlBar : function()
    {
      this._controlBar = new qx.ui.layout.HorizontalBoxLayout;
      this._controlBar.setHeight("auto");
      this._controlBar.setParent(this);
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _createButtonBar : function()
    {
      this._btnbar = new qx.ui.layout.HorizontalBoxLayout;
      this._btnbar.setHeight("auto");
      this._btnbar.setSpacing(4);
      this._btnbar.setHorizontalChildrenAlign("right");
      this._btnbar.setPadding(2, 4);
      this.add(this._btnbar);

      this._btncancel = new qx.ui.form.Button(this.tr("Cancel"), "icon/16/actions/dialog-cancel.png");
      this._btnok = new qx.ui.form.Button(this.tr("OK"), "icon/16/actions/dialog-ok.png");

      this._btncancel.addEventListener("execute", this._onButtonCancelExecute, this);
      this._btnok.addEventListener("execute", this._onButtonOkExecute, this);

      this._btnbar.add(this._btncancel, this._btnok);
    },




    /*
    ---------------------------------------------------------------------------
      CREATE #2: PANES
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _createControlPane : function()
    {
      this._controlPane = new qx.ui.layout.VerticalBoxLayout;
      this._controlPane.setWidth("auto");
      this._controlPane.setPadding(4);
      this._controlPane.setPaddingBottom(7);
      this._controlPane.setParent(this._controlBar);
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _createHueSaturationPane : function()
    {
      this._hueSaturationPane = new qx.ui.layout.CanvasLayout;
      this._hueSaturationPane.setWidth("auto");
      this._hueSaturationPane.setPadding(6, 4);
      this._hueSaturationPane.setParent(this._controlBar);

      this._hueSaturationPane.addEventListener("mousewheel", this._onHueSaturationPaneMouseWheel, this);

      this._hueSaturationField = new qx.ui.basic.Image("widget/colorselector/huesaturation-field.jpg");
      this._hueSaturationField.setBorder("inset-thin");
      this._hueSaturationField.setMargin(5);
      this._hueSaturationField.setParent(this._hueSaturationPane);

      this._hueSaturationField.addEventListener("mousedown", this._onHueSaturationFieldMouseDown, this);

      this._hueSaturationHandle = new qx.ui.basic.Image("widget/colorselector/huesaturation-handle.gif");
      this._hueSaturationHandle.setLocation(0, 256);
      this._hueSaturationHandle.setParent(this._hueSaturationPane);

      this._hueSaturationHandle.addEventListener("mousedown", this._onHueSaturationHandleMouseDown, this);
      this._hueSaturationHandle.addEventListener("mouseup", this._onHueSaturationHandleMouseUp, this);
      this._hueSaturationHandle.addEventListener("mousemove", this._onHueSaturationHandleMouseMove, this);
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _createBrightnessPane : function()
    {
      this._brightnessPane = new qx.ui.layout.CanvasLayout;
      this._brightnessPane.setWidth("auto");
      this._brightnessPane.setPadding(6, 4);
      this._brightnessPane.setParent(this._controlBar);

      this._brightnessPane.addEventListener("mousewheel", this._onBrightnessPaneMouseWheel, this);

      this._brightnessField = new qx.ui.basic.Image("widget/colorselector/brightness-field.jpg");
      this._brightnessField.setBorder("inset-thin");
      this._brightnessField.setMargin(5, 7);
      this._brightnessField.setParent(this._brightnessPane);

      this._brightnessField.addEventListener("mousedown", this._onBrightnessFieldMouseDown, this);

      this._brightnessHandle = new qx.ui.basic.Image("widget/colorselector/brightness-handle.gif");
      this._brightnessHandle.setLocation(0, 0);
      this._brightnessHandle.setParent(this._brightnessPane);

      this._brightnessHandle.addEventListener("mousedown", this._onBrightnessHandleMouseDown, this);
      this._brightnessHandle.addEventListener("mouseup", this._onBrightnessHandleMouseUp, this);
      this._brightnessHandle.addEventListener("mousemove", this._onBrightnessHandleMouseMove, this);
    },




    /*
    ---------------------------------------------------------------------------
      CREATE #3: CONTROL PANE CONTENT
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _createPresetFieldSet : function()
    {
      this._presetFieldSet = new qx.ui.groupbox.GroupBox(this.tr("Presets"));
      this._presetFieldSet.setHeight("auto");
      this._presetFieldSet.setParent(this._controlPane);

      this._presetGrid = new qx.ui.layout.GridLayout;
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
          colorField = new qx.ui.basic.Terminator;
          colorField.setBorder("inset-thin");
          colorField.setBackgroundColor(this._presetTable[i * 10 + j]);
          colorField.addEventListener("mousedown", this._onColorFieldClick, this);

          this._presetGrid.add(colorField, j, i);
        }
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _createInputFieldSet : function()
    {
      this._inputFieldSet = new qx.ui.groupbox.GroupBox(this.tr("Details"));
      this._inputFieldSet.setHeight("auto");
      this._inputFieldSet.setParent(this._controlPane);

      this._inputLayout = new qx.ui.layout.VerticalBoxLayout;
      this._inputLayout.setHeight("auto");
      this._inputLayout.setSpacing(10);
      this._inputLayout.setParent(this._inputFieldSet.getFrameObject());
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _createPreviewFieldSet : function()
    {
      this._previewFieldSet = new qx.ui.groupbox.GroupBox(this.tr("Preview (Old/New)"));
      this._previewFieldSet.setHeight("1*");
      this._previewFieldSet.setParent(this._controlPane);

      this._previewLayout = new qx.ui.layout.HorizontalBoxLayout;
      this._previewLayout.setHeight("100%");
      this._previewLayout.setLocation(0, 0);
      this._previewLayout.setRight(0);
      this._previewLayout.setSpacing(10);
      this._previewLayout.setParent(this._previewFieldSet.getFrameObject());
    },




    /*
    ---------------------------------------------------------------------------
      CREATE #4: INPUT FIELDSET CONTENT
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _createHexField : function()
    {
      this._hexLayout = new qx.ui.layout.HorizontalBoxLayout;
      this._hexLayout.setHeight("auto");
      this._hexLayout.setSpacing(4);
      this._hexLayout.setVerticalChildrenAlign("middle");
      this._hexLayout.setParent(this._inputLayout);

      this._hexLabel = new qx.ui.basic.Label(this.tr("Hex"));
      this._hexLabel.setWidth(25);
      this._hexLabel.setParent(this._hexLayout);

      this._hexHelper = new qx.ui.basic.Label("#");
      this._hexHelper.setParent(this._hexLayout);

      this._hexField = new qx.ui.form.TextField("FFFFFF");
      this._hexField.setWidth(50);
      this._hexField.setParent(this._hexLayout);

      this._hexField.addEventListener("changeValue", this._onHexFieldChange, this);
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _createRgbSpinner : function()
    {
      this._rgbSpinLayout = new qx.ui.layout.HorizontalBoxLayout;
      this._rgbSpinLayout.setHeight("auto");
      this._rgbSpinLayout.setSpacing(4);
      this._rgbSpinLayout.setVerticalChildrenAlign("middle");
      this._rgbSpinLayout.setParent(this._inputLayout);

      this._rgbSpinLabel = new qx.ui.basic.Label(this.tr("RGB"));
      this._rgbSpinLabel.setWidth(25);
      this._rgbSpinLabel.setParent(this._rgbSpinLayout);

      this._rgbSpinRed = new qx.ui.form.Spinner(0, 255, 255);
      this._rgbSpinRed.setWidth(50);

      this._rgbSpinGreen = new qx.ui.form.Spinner(0, 255, 255);
      this._rgbSpinGreen.setWidth(50);

      this._rgbSpinBlue = new qx.ui.form.Spinner(0, 255, 255);
      this._rgbSpinBlue.setWidth(50);

      this._rgbSpinLayout.add(this._rgbSpinRed, this._rgbSpinGreen, this._rgbSpinBlue);

      this._rgbSpinRed.addEventListener("change", this._setRedFromSpinner, this);
      this._rgbSpinGreen.addEventListener("change", this._setGreenFromSpinner, this);
      this._rgbSpinBlue.addEventListener("change", this._setBlueFromSpinner, this);
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _createHsbSpinner : function()
    {
      this._hsbSpinLayout = new qx.ui.layout.HorizontalBoxLayout;
      this._hsbSpinLayout.setHeight("auto");
      this._hsbSpinLayout.setSpacing(4);
      this._hsbSpinLayout.setVerticalChildrenAlign("middle");
      this._hsbSpinLayout.setParent(this._inputLayout);

      this._hsbSpinLabel = new qx.ui.basic.Label(this.tr("HSB"));
      this._hsbSpinLabel.setWidth(25);
      this._hsbSpinLayout.add(this._hsbSpinLabel);

      this._hsbSpinHue = new qx.ui.form.Spinner(0, 0, 360);
      this._hsbSpinHue.setWidth(50);

      this._hsbSpinSaturation = new qx.ui.form.Spinner(0, 0, 100);
      this._hsbSpinSaturation.setWidth(50);

      this._hsbSpinBrightness = new qx.ui.form.Spinner(0, 100, 100);
      this._hsbSpinBrightness.setWidth(50);

      this._hsbSpinLayout.add(this._hsbSpinHue, this._hsbSpinSaturation, this._hsbSpinBrightness);

      this._hsbSpinHue.addEventListener("change", this._setHueFromSpinner, this);
      this._hsbSpinSaturation.addEventListener("change", this._setSaturationFromSpinner, this);
      this._hsbSpinBrightness.addEventListener("change", this._setBrightnessFromSpinner, this);
    },




    /*
    ---------------------------------------------------------------------------
      CREATE #5: PREVIEW CONTENT
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _createPreviewContent : function()
    {
      this._oldColorPreview = new qx.ui.basic.Terminator;
      this._oldColorPreview.setBorder("inset-thin");
      this._oldColorPreview.setWidth("1*");
      this._oldColorPreview.setBackgroundImage("static/image/dotted_white.gif");
      this._oldColorPreview.setParent(this._previewLayout);

      this._newColorPreview = new qx.ui.basic.Terminator;
      this._newColorPreview.setBorder("inset-thin");
      this._newColorPreview.setWidth("1*");
      this._newColorPreview.setBackgroundColor("white");
      this._newColorPreview.setParent(this._previewLayout);
    },




    /*
    ---------------------------------------------------------------------------
      RGB MODIFIER
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyRed : function(value, old)
    {
      if (this._updateContext === null) {
        this._updateContext = "redModifier";
      }

      if (this._updateContext !== "rgbSpinner") {
        this._rgbSpinRed.setValue(value);
      }

      if (this._updateContext !== "hexField") {
        this._setHexFromRgb();
      }

      switch(this._updateContext)
      {
        case "rgbSpinner":
        case "hexField":
        case "redModifier":
          this._setHueFromRgb();
      }

      this._setPreviewFromRgb();

      if (this._updateContext === "redModifier") {
        this._updateContext = null;
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyGreen : function(value, old)
    {
      if (this._updateContext === null) {
        this._updateContext = "greenModifier";
      }

      if (this._updateContext !== "rgbSpinner") {
        this._rgbSpinGreen.setValue(value);
      }

      if (this._updateContext !== "hexField") {
        this._setHexFromRgb();
      }

      switch(this._updateContext)
      {
        case "rgbSpinner":
        case "hexField":
        case "greenModifier":
          this._setHueFromRgb();
      }

      this._setPreviewFromRgb();

      if (this._updateContext === "greenModifier") {
        this._updateContext = null;
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyBlue : function(value, old)
    {
      if (this._updateContext === null) {
        this._updateContext = "blueModifier";
      }

      if (this._updateContext !== "rgbSpinner") {
        this._rgbSpinBlue.setValue(value);
      }

      if (this._updateContext !== "hexField") {
        this._setHexFromRgb();
      }

      switch(this._updateContext)
      {
        case "rgbSpinner":
        case "hexField":
        case "blueModifier":
          this._setHueFromRgb();
      }

      this._setPreviewFromRgb();

      if (this._updateContext === "blueModifier") {
        this._updateContext = null;
      }
    },




    /*
    ---------------------------------------------------------------------------
      HSB MODIFIER
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyHue : function(value, old)
    {
      if (this._updateContext === null) {
        this._updateContext = "hueModifier";
      }

      if (this._updateContext !== "hsbSpinner") {
        this._hsbSpinHue.setValue(value);
      }

      if (this._updateContext !== "hueSaturationField")
      {
        if (this._hueSaturationHandle.isCreated()) {
          this._hueSaturationHandle._renderRuntimeLeft(Math.round(value / 1.40625) + this._hueSaturationPane.getPaddingLeft());
        } else {
          this._hueSaturationHandle.setLeft(Math.round(value / 1.40625));
        }
      }

      switch(this._updateContext)
      {
        case "hsbSpinner":
        case "hueSaturationField":
        case "hueModifier":
          this._setRgbFromHue();
      }

      if (this._updateContext === "hueModifier") {
        this._updateContext = null;
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applySaturation : function(value, old)
    {
      if (this._updateContext === null) {
        this._updateContext = "saturationModifier";
      }

      if (this._updateContext !== "hsbSpinner") {
        this._hsbSpinSaturation.setValue(value);
      }

      if (this._updateContext !== "hueSaturationField")
      {
        if (this._hueSaturationHandle.isCreated()) {
          this._hueSaturationHandle._renderRuntimeTop(256 - Math.round(value * 2.56) + this._hueSaturationPane.getPaddingTop());
        } else {
          this._hueSaturationHandle.setTop(256 - Math.round(value * 2.56));
        }
      }

      switch(this._updateContext)
      {
        case "hsbSpinner":
        case "hueSaturationField":
        case "saturationModifier":
          this._setRgbFromHue();
      }

      if (this._updateContext === "saturationModifier") {
        this._updateContext = null;
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyBrightness : function(value, old)
    {
      if (this._updateContext === null) {
        this._updateContext = "brightnessModifier";
      }

      if (this._updateContext !== "hsbSpinner") {
        this._hsbSpinBrightness.setValue(value);
      }

      if (this._updateContext !== "brightnessField")
      {
        var topValue = 256 - Math.round(value * 2.56);

        if (this._brightnessHandle.isCreated()) {
          this._brightnessHandle._renderRuntimeTop(topValue + this._brightnessPane.getPaddingTop());
        } else {
          this._brightnessHandle.setTop(topValue);
        }
      }

      switch(this._updateContext)
      {
        case "hsbSpinner":
        case "brightnessField":
        case "brightnessModifier":
          this._setRgbFromHue();
      }

      if (this._updateContext === "brightnessModifier") {
        this._updateContext = null;
      }
    },




    /*
    ---------------------------------------------------------------------------
      BRIGHTNESS IMPLEMENTATION
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onBrightnessHandleMouseDown : function(e)
    {
      // Activate Capturing
      this._brightnessHandle.setCapture(true);

      // Calculate subtract: Position of Brightness Field - Current Mouse Offset
      this._brightnessSubtract =
        qx.bom.element.Location.getTop(this._brightnessField.getElement()) +
        (e.getPageY() - qx.bom.element.Location.getTop(this._brightnessHandle.getElement()));

      // Block field event handling
      e.setPropagationStopped(true);
    },


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onBrightnessHandleMouseUp : function(e)
    {
      // Disabling capturing
      this._brightnessHandle.setCapture(false);
    },


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onBrightnessHandleMouseMove : function(e)
    {
      // Update if captured currently (through previous mousedown)
      if (this._brightnessHandle.getCapture()) {
        this._setBrightnessOnFieldEvent(e);
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onBrightnessFieldMouseDown : function(e)
    {
      // Calculate substract: Half height of handler
      this._brightnessSubtract =
        qx.bom.element.Location.getTop(this._brightnessField.getElement(), "margin") +
        Math.round(qx.bom.element.Dimension.getHeight(this._brightnessHandle.getElement()) / 2);

      // Update
      this._setBrightnessOnFieldEvent(e);

      // Afterwards: Activate Capturing for handle
      this._brightnessHandle.setCapture(true);
    },


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onBrightnessPaneMouseWheel : function(e) {
      this.setBrightness(qx.lang.Number.limit(this.getBrightness() + e.getWheelDelta(), 0, 100));
    },


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _setBrightnessOnFieldEvent : function(e)
    {
      var value = qx.lang.Number.limit(e.getPageY() - this._brightnessSubtract, 0, 256);

      this._updateContext = "brightnessField";

      if (this._brightnessHandle.isCreated()) {
        this._brightnessHandle._renderRuntimeTop(value + this._brightnessPane.getPaddingTop());
      } else {
        this._brightnessHandle.setTop(value);
      }

      this.setBrightness(100 - Math.round(value / 2.56));

      this._updateContext = null;
    },


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onButtonOkExecute : function(e) {
      this.createDispatchEvent("dialogok");
    },


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onButtonCancelExecute : function(e) {
      this.createDispatchEvent("dialogcancel");
    },




    /*
    ---------------------------------------------------------------------------
      HUE/SATURATION IMPLEMENTATION
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onHueSaturationHandleMouseDown : function(e)
    {
      // Activate Capturing
      this._hueSaturationHandle.setCapture(true);

      // Calculate subtract: Position of HueSaturation Field - Current Mouse Offset
      this._hueSaturationSubtractTop =
        qx.bom.element.Location.getTop(this._hueSaturationField.getElement(), "margin") +
        (e.getPageY() - qx.bom.element.Location.getTop(this._hueSaturationHandle.getElement()));

      this._hueSaturationSubtractLeft =
        qx.bom.element.Location.getLeft(this._hueSaturationField.getElement(), "margin") +
        (e.getPageX() - qx.bom.element.Location.getLeft(this._hueSaturationHandle.getElement()));

      // Block field event handling
      e.setPropagationStopped(true);
    },


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onHueSaturationHandleMouseUp : function(e)
    {
      // Disabling capturing
      this._hueSaturationHandle.setCapture(false);
    },


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onHueSaturationHandleMouseMove : function(e)
    {
      // Update if captured currently (through previous mousedown)
      if (this._hueSaturationHandle.getCapture()) {
        this._setHueSaturationOnFieldEvent(e);
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onHueSaturationFieldMouseDown : function(e)
    {
      // Calculate substract: Half width/height of handler
      this._hueSaturationSubtractTop =
        qx.bom.element.Location.getTop(this._hueSaturationField.getElement(), "margin") +
        Math.round(qx.bom.element.Dimension.getHeight(this._hueSaturationHandle.getElement()) / 2);

      this._hueSaturationSubtractLeft =
        qx.bom.element.Location.getLeft(this._hueSaturationField.getElement(), "margin") +
        Math.round(qx.bom.element.Dimension.getWidth(this._hueSaturationHandle.getElement()) / 2);

      // Update
      this._setHueSaturationOnFieldEvent(e);

      // Afterwards: Activate Capturing for handle
      this._hueSaturationHandle.setCapture(true);
    },


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onHueSaturationPaneMouseWheel : function(e) {
      this.setSaturation(qx.lang.Number.limit(this.getSaturation() + e.getWheelDelta(), 0, 100));
    },


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _setHueSaturationOnFieldEvent : function(e)
    {
      var vTop = qx.lang.Number.limit(e.getPageY() - this._hueSaturationSubtractTop, 0, 256);
      var vLeft = qx.lang.Number.limit(e.getPageX() - this._hueSaturationSubtractLeft, 0, 256);

      if (this._hueSaturationHandle.isCreated())
      {
        this._hueSaturationHandle._renderRuntimeTop(vTop + this._hueSaturationPane.getPaddingTop());
        this._hueSaturationHandle._renderRuntimeLeft(vLeft + this._hueSaturationPane.getPaddingLeft());
      }
      else
      {
        this._hueSaturationHandle.setTop(vTop);
        this._hueSaturationHandle.setLeft(vLeft);
      }

      this._updateContext = "hueSaturationField";

      this.setSaturation(100 - Math.round(vTop / 2.56));
      this.setHue(Math.round(vLeft * 1.40625));

      this._updateContext = null;
    },




    /*
    ---------------------------------------------------------------------------
      RGB SPINNER
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _setRedFromSpinner : function()
    {
      if (this._updateContext !== null) {
        return;
      }

      this._updateContext = "rgbSpinner";
      this.setRed(this._rgbSpinRed.getValue());
      this._updateContext = null;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _setGreenFromSpinner : function()
    {
      if (this._updateContext !== null) {
        return;
      }

      this._updateContext = "rgbSpinner";
      this.setGreen(this._rgbSpinGreen.getValue());
      this._updateContext = null;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _setBlueFromSpinner : function()
    {
      if (this._updateContext !== null) {
        return;
      }

      this._updateContext = "rgbSpinner";
      this.setBlue(this._rgbSpinBlue.getValue());
      this._updateContext = null;
    },




    /*
    ---------------------------------------------------------------------------
      HSB SPINNER
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _setHueFromSpinner : function()
    {
      if (this._updateContext !== null) {
        return;
      }

      this._updateContext = "hsbSpinner";
      this.setHue(this._hsbSpinHue.getValue());
      this._updateContext = null;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _setSaturationFromSpinner : function()
    {
      if (this._updateContext !== null) {
        return;
      }

      this._updateContext = "hsbSpinner";
      this.setSaturation(this._hsbSpinSaturation.getValue());
      this._updateContext = null;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _setBrightnessFromSpinner : function()
    {
      if (this._updateContext !== null) {
        return;
      }

      this._updateContext = "hsbSpinner";
      this.setBrightness(this._hsbSpinBrightness.getValue());
      this._updateContext = null;
    },




    /*
    ---------------------------------------------------------------------------
      HEX FIELD
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void | Boolean} TODOC
     */
    _onHexFieldChange : function(e)
    {
      if (this._updateContext !== null) {
        return;
      }

      try {
        var rgb = qx.util.ColorUtil.hexStringToRgb("#" + this._hexField.getValue());
      } catch(ex) {
        return;
      };

      this._updateContext = "hexField";
      this.setRed(rgb[0]);
      this.setGreen(rgb[1]);
      this.setBlue(rgb[2]);
      this._updateContext = null;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _setHexFromRgb : function() {
      this._hexField.setValue(
        qx.util.ColorUtil.rgbToHexString([this.getRed(),this.getGreen(),this.getBlue()])
      );
    },




    /*
    ---------------------------------------------------------------------------
      COLOR FIELD
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {var} TODOC
     */
    _onColorFieldClick : function(e)
    {
      var vColor = e.getTarget().getBackgroundColor();

      if (!vColor) {
        return this.error("Missing backgroundColor value for field: " + e.getTarget());
      }

      var rgb = qx.util.ColorUtil.stringToRgb(vColor);

      this.setRed(rgb[0]);
      this.setGreen(rgb[1]);
      this.setBlue(rgb[2]);
    },




    /*
    ---------------------------------------------------------------------------
      RGB/HSB SYNC
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _setHueFromRgb : function()
    {
      switch(this._updateContext)
      {
        case "hsbSpinner":
        case "hueSaturationField":
        case "brightnessField":
          break;

        default:
          var hsb = qx.util.ColorUtil.rgbToHsb([this.getRed(), this.getGreen(), this.getBlue()]);

          this.setHue(hsb[0]);
          this.setSaturation(hsb[1]);
          this.setBrightness(hsb[2]);
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _setRgbFromHue : function()
    {
      switch(this._updateContext)
      {
        case "rgbSpinner":
        case "hexField":
          break;

        default:
          var vRgb = qx.util.ColorUtil.hsbToRgb([this.getHue(), this.getSaturation(), this.getBrightness()]);

          this.setRed(vRgb.red);
          this.setGreen(vRgb.green);
          this.setBlue(vRgb.blue);
      }
    },




    /*
    ---------------------------------------------------------------------------
      PREVIEW SYNC
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _setPreviewFromRgb : function() {
      this._newColorPreview.setBackgroundColor(qx.util.ColorUtil.rgbToRgbString([this.getRed(), this.getGreen(), this.getBlue()]));
    },


    /**
     * TODOC
     *
     * @type member
     * @param vRed {var} TODOC
     * @param vGreen {var} TODOC
     * @param vBlue {var} TODOC
     * @return {void}
     */
    setPreviousColor : function(vRed, vGreen, vBlue)
    {
      this._oldColorPreview.setBackgroundImage(null);
      this._oldColorPreview.setBackgroundColor(qx.util.ColorUtil.rgbToRgbString([ vRed, vGreen, vBlue ]));

      this.setRed(vRed);
      this.setGreen(vGreen);
      this.setBlue(vBlue);
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this._disposeObjects("_controlBar", "_btnbar", "_btncancel", "_btnok", "_controlPane", "_hueSaturationPane",
      "_hueSaturationField", "_hueSaturationHandle", "_brightnessPane", "_brightnessField",
      "_brightnessHandle", "_presetFieldSet", "_presetGrid", "_inputFieldSet", "_inputLayout",
      "_previewFieldSet", "_previewLayout", "_hexLayout", "_hexLabel", "_hexHelper",
      "_hexField", "_rgbSpinLayout", "_rgbSpinLabel", "_rgbSpinRed", "_rgbSpinGreen",
      "_rgbSpinBlue", "_hsbSpinLayout", "_hsbSpinLabel", "_hsbSpinHue", "_hsbSpinSaturation",
      "_hsbSpinBrightness", "_oldColorPreview", "_newColorPreview");

    this._disposeFields("_presetTable");
  }
});
