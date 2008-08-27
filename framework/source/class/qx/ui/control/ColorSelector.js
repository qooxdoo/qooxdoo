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
     * Jonathan Rass (jonathan_rass)
     * Matthew Gregory

************************************************************************ */

/**
 * A typical color selector as known from native applications.
 *
 * Includes support for RGB and HSB color areas.
 *
 * @appearance colorselector
 */
qx.Class.define("qx.ui.control.ColorSelector",
{
  extend : qx.ui.core.Widget,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * Creates a ColorSelector.
   */
  construct : function()
  {
    this.base(arguments);

    // add the basic layout
    this._setLayout(new qx.ui.layout.VBox());

    this._createChildControl("control-bar");
  },




  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events:
  {
    /** Fired when the "OK" button is clicked. */
    "dialogok"     : "qx.event.type.Event",

    /** Fired when the "Cancel" button is clicked. */
    "dialogcancel" : "qx.event.type.Event"
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    // overridden
    appearance :
    {
      refine : true,
      init : "colorselector"
    },

    /** The numeric red value of the selected color. */
    red :
    {
      check : "Integer",
      init : 255,
      apply : "_applyRed"
    },

    /** The numeric green value of the selected color. */
    green :
    {
      check : "Integer",
      init : 255,
      apply : "_applyGreen"
    },

    /** The numeric blue value of the selected color. */
    blue :
    {
      check : "Integer",
      init :  255,
      apply : "_applyBlue"
    },

    /** The numeric hue value. */
    hue :
    {
      check : "Number",
      init : 0,
      apply : "_applyHue"
    },

    /** The numeric saturation value. */
    saturation :
    {
      check : "Number",
      init : 0,
      apply : "_applySaturation"
    },

    /** The numeric brightness value. */
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

    /**
     * {String} The context in which an update has occured.
     */
    __updateContext : null,

    /**
     * {Array} Map containing the preset colors.
     */
    __presetTable : [ "maroon", "red", "orange", "yellow", "olive", "purple",
      "fuchsia", "lime", "green", "navy", "blue", "aqua", "teal", "black",
      "#333", "#666", "#999", "#BBB", "#EEE", "white" ],

    /**
     * {String} Name of child control which is captured.
     */
    __capture : "",

    /**
     * {Number} Numeric brightness value
     */
    __brightnessSubtract : 0,

    /**
     * {Integer} HueSaturation's X coordinate
     */
    __hueSaturationSubtractTop : 0,

    /**
     * {Integer} HueSaturation's Y coordinate
     */
    __hueSaturationSubtractLeft : 0,



    // overridden
    _createChildControlImpl : function(id)
    {
      var control;

      switch(id)
      {
        /*
        ---------------------------------------------------------------------------
          CREATE #1: BASE STRUCTURE
        ---------------------------------------------------------------------------
        */
        case "control-bar":
          control = new qx.ui.container.Composite(new qx.ui.layout.HBox(10));

          control.add(this._getChildControl("control-pane"));
          control.add(this._getChildControl("visual-pane"));

          this._add(control);
          break;

        /*
        ---------------------------------------------------------------------------
          CREATE #2: PANES
        ---------------------------------------------------------------------------
        */

        case "visual-pane":
          control = new qx.ui.groupbox.GroupBox(this.tr("Visual"));
          control.setLayout(new qx.ui.layout.HBox(10));
          control.add(this._getChildControl("hue-saturation-pane"));
          control.add(this._getChildControl("brightness-pane"));
          break;

        case "control-pane":
          control = new qx.ui.container.Composite(new qx.ui.layout.VBox(12));
          control.add(this._getChildControl("preset-field-set"));
          control.add(this._getChildControl("input-field-set"));
          control.add(this._getChildControl("preview-field-set"), {flex: 1});
          break;

        case "hue-saturation-pane":
          control = new qx.ui.container.Composite(new qx.ui.layout.Canvas());
          control.setAllowGrowY(false);
          control.addListener("mouseup", this._onHueSaturationPaneMouseWheel, this);
          control.add(this._getChildControl("hue-saturation-field"));
          control.add(this._getChildControl("hue-saturation-handle"), {left: 0, top: 256});
          break;

        case "hue-saturation-field":
          control = new qx.ui.basic.Image("decoration/colorselector/huesaturation-field.jpg");
          control.addListener("mousedown", this._onHueSaturationFieldMouseDown, this);
          break;

        case "hue-saturation-handle":
          control = new qx.ui.basic.Image("decoration/colorselector/huesaturation-handle.gif");
          control.addListener("mousedown", this._onHueSaturationHandleMouseDown, this);
          control.addListener("mouseup", this._onHueSaturationHandleMouseUp, this);
          control.addListener("mousemove", this._onHueSaturationHandleMouseMove, this);
          break;

        case "brightness-pane":
          control = new qx.ui.container.Composite(new qx.ui.layout.Canvas());
          control.setAllowGrowY(false);
          control.addListener("mousewheel", this._onBrightnessPaneMouseWheel, this);
          control.add(this._getChildControl("brightness-field"));
          control.add(this._getChildControl("brightness-handle"));
          break;

        case "brightness-field":
          control = new qx.ui.basic.Image("decoration/colorselector/brightness-field.png");
          control.addListener("mousedown", this._onBrightnessFieldMouseDown, this);
          break;

        case "brightness-handle":
          control = new qx.ui.basic.Image("decoration/colorselector/brightness-handle.gif");
          control.addListener("mousedown", this._onBrightnessHandleMouseDown, this);
          control.addListener("mouseup", this._onBrightnessHandleMouseUp, this);
          control.addListener("mousemove", this._onBrightnessHandleMouseMove, this);
          break;


        /*
        ---------------------------------------------------------------------------
          CREATE #3: CONTROL PANE CONTENT
        ---------------------------------------------------------------------------
        */
        case "preset-field-set":
          control = new qx.ui.groupbox.GroupBox(this.tr("Presets"));
          control.setLayout(new qx.ui.layout.Grow());
          control.add(this._getChildControl("preset-grid"));
          break;

        case "preset-grid":
          controlLayout = new qx.ui.layout.Grid(3, 3);
          control = new qx.ui.container.Composite(controlLayout);

          var colorField;

          for (var i=0; i<2; i++)
          {
            for (var j=0; j<10; j++)
            {
              colorField = new qx.ui.core.Widget();
              colorField.setAppearance("colorselector-colorbucket");
              colorField.setBackgroundColor(this.__presetTable[i * 10 + j]);
              colorField.addListener("mousedown", this._onColorFieldClick, this);

              control.add(colorField, {column: j, row: i});
            }
          }
          break;

        case "input-field-set":
          control = new qx.ui.groupbox.GroupBox(this.tr("Details"));
          var controlLayout = new qx.ui.layout.VBox();
          controlLayout.setSpacing(10);
          control.setLayout(controlLayout);

          control.add(this._getChildControl("hex-field-composite"));
          control.add(this._getChildControl("rgb-spinner-composite"));
          control.add(this._getChildControl("hsb-spinner-composite"));
          break;

        case "preview-field-set":
          control = new qx.ui.groupbox.GroupBox(this.tr("Preview (Old/New)"));
          var controlLayout = new qx.ui.layout.HBox(10);
          control.setLayout(controlLayout);

          control.add(this._getChildControl("preview-content-old"), {flex: 1});
          control.add(this._getChildControl("preview-content-new"), {flex: 1});
          break;

        /*
        ---------------------------------------------------------------------------
          CREATE #4: INPUT FIELDSET CONTENT
        ---------------------------------------------------------------------------
        */
        case "hex-field-composite":
          var layout = new qx.ui.layout.HBox(4);
          layout.setAlignY("middle");
          control = new qx.ui.container.Composite(layout);

          var hexLabel = new qx.ui.basic.Label(this.tr("Hex"));
          control.add(hexLabel);

          var hexHelper = new qx.ui.basic.Label("#");
          control.add(hexHelper);

          control.add(this._getChildControl("hex-field"));
          break;

        case "hex-field":
          control = new qx.ui.form.TextField("FFFFFF");
          control.setWidth(55);
          control.addListener("changeValue", this._onHexFieldChange, this);
          break;

        case "rgb-spinner-composite":
          var layout = new qx.ui.layout.HBox(4);
          layout.setAlignY("middle");
          control = new qx.ui.container.Composite(layout);

          var rgbSpinLabel = new qx.ui.basic.Label(this.tr("RGB"));
          rgbSpinLabel.setWidth(25);
          control.add(rgbSpinLabel);

          control.add(this._getChildControl("rgb-spinner-red"));
          control.add(this._getChildControl("rgb-spinner-green"));
          control.add(this._getChildControl("rgb-spinner-blue"));
          break;

        case "rgb-spinner-red":
          control = new qx.ui.form.Spinner(0, 255, 255);
          control.setWidth(50);
          control.addListener("changeValue", this._setRedFromSpinner, this);
          break;

        case "rgb-spinner-green":
          control = new qx.ui.form.Spinner(0, 255, 255);
          control.setWidth(50);
          control.addListener("changeValue", this._setGreenFromSpinner, this);
          break;

        case "rgb-spinner-blue":
          control = new qx.ui.form.Spinner(0, 255, 255);
          control.setWidth(50);
          control.addListener("changeValue", this._setBlueFromSpinner, this);
          break;

        case "hsb-spinner-composite":
          var layout = new qx.ui.layout.HBox(4);
          layout.setAlignY("middle");
          control = new qx.ui.container.Composite(layout);

          var hsbSpinLabel = new qx.ui.basic.Label(this.tr("HSB"));
          hsbSpinLabel.setWidth(25);
          control.add(hsbSpinLabel);

          control.add(this._getChildControl("hsb-spinner-hue"));
          control.add(this._getChildControl("hsb-spinner-saturation"));
          control.add(this._getChildControl("hsb-spinner-brightness"));
          break;

        case "hsb-spinner-hue":
          control = new qx.ui.form.Spinner(0, 0, 360);
          control.setWidth(50);
          control.addListener("changeValue", this._setHueFromSpinner, this);
          break;

        case "hsb-spinner-saturation":
          control = new qx.ui.form.Spinner(0, 0, 100);
          control.setWidth(50);
          control.addListener("changeValue", this._setSaturationFromSpinner, this);
          break;

        case "hsb-spinner-brightness":
          control = new qx.ui.form.Spinner(0, 100, 100);
          control.setWidth(50);
          control.addListener("changeValue", this._setBrightnessFromSpinner, this);
          break;


        /*
        ---------------------------------------------------------------------------
          CREATE #5: PREVIEW CONTENT
        ---------------------------------------------------------------------------
        */
        case "preview-content-old":
          control = new qx.ui.core.Widget();
          break;

        case "preview-content-new":
          control = new qx.ui.core.Widget();
          break;
      }

      return control || this.base(arguments, id);
    },







    /*
    ---------------------------------------------------------------------------
      RGB MODIFIER
    ---------------------------------------------------------------------------
    */


    // property apply
    _applyRed : function(value, old)
    {
      if (this.__updateContext === null) {
        this.__updateContext = "redModifier";
      }

      if (this.__updateContext !== "rgbSpinner") {
        this._getChildControl("rgb-spinner-red").setValue(value);
      }

      if (this.__updateContext !== "hexField") {
        this._setHexFromRgb();
      }

      switch(this.__updateContext)
      {
        case "rgbSpinner":
        case "hexField":
        case "redModifier":
          this._setHueFromRgb();
      }

      this._setPreviewFromRgb();

      if (this.__updateContext === "redModifier") {
        this.__updateContext = null;
      }
    },


    // property apply
    _applyGreen : function(value, old)
    {
      if (this.__updateContext === null) {
        this.__updateContext = "greenModifier";
      }

      if (this.__updateContext !== "rgbSpinner") {
        this._getChildControl("rgb-spinner-green").setValue(value);
      }

      if (this.__updateContext !== "hexField") {
        this._setHexFromRgb();
      }

      switch(this.__updateContext)
      {
        case "rgbSpinner":
        case "hexField":
        case "greenModifier":
          this._setHueFromRgb();
      }

      this._setPreviewFromRgb();

      if (this.__updateContext === "greenModifier") {
        this.__updateContext = null;
      }
    },


    // property apply
    _applyBlue : function(value, old)
    {
      if (this.__updateContext === null) {
        this.__updateContext = "blueModifier";
      }

      if (this.__updateContext !== "rgbSpinner") {
        this._getChildControl("rgb-spinner-blue").setValue(value);
      }

      if (this.__updateContext !== "hexField") {
        this._setHexFromRgb();
      }

      switch(this.__updateContext)
      {
        case "rgbSpinner":
        case "hexField":
        case "blueModifier":
          this._setHueFromRgb();
      }

      this._setPreviewFromRgb();

      if (this.__updateContext === "blueModifier") {
        this.__updateContext = null;
      }
    },




    /*
    ---------------------------------------------------------------------------
      HSB MODIFIER
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyHue : function(value, old)
    {
      if (this.__updateContext === null) {
        this.__updateContext = "hueModifier";
      }

      if (this.__updateContext !== "hsbSpinner") {
        this._getChildControl("hsb-spinner-hue").setValue(value);
      }

      if (this.__updateContext !== "hueSaturationField")
      {
        if (this._getChildControl("hue-saturation-handle").getBounds()) {
          this._getChildControl("hue-saturation-handle").setDomLeft(Math.round(value / 1.40625) + this._getChildControl("hue-saturation-pane").getPaddingLeft());
        } else {
          this._getChildControl("hue-saturation-handle").setLayoutProperties({ left : Math.round(value / 1.40625) });
        }
      }

      switch(this.__updateContext)
      {
        case "hsbSpinner":
        case "hueSaturationField":
        case "hueModifier":
          this._setRgbFromHue();
      }

      if (this.__updateContext === "hueModifier") {
        this.__updateContext = null;
      }
    },


    // property apply
    _applySaturation : function(value, old)
    {
      if (this.__updateContext === null) {
        this.__updateContext = "saturationModifier";
      }

      if (this.__updateContext !== "hsbSpinner") {
        this._getChildControl("hsb-spinner-saturation").setValue(value);
      }

      if (this.__updateContext !== "hueSaturationField")
      {
        if (this._getChildControl("hue-saturation-handle").getBounds()) {
          this._getChildControl("hue-saturation-handle").setDomTop(256 - Math.round(value * 2.56) + this._getChildControl("hue-saturation-pane").getPaddingTop());
        } else {
          this._getChildControl("hue-saturation-handle").setLayoutProperties({ top : 256 - Math.round(value * 2.56)});
        }
      }

      switch(this.__updateContext)
      {
        case "hsbSpinner":
        case "hueSaturationField":
        case "saturationModifier":
          this._setRgbFromHue();
      }

      if (this.__updateContext === "saturationModifier") {
        this.__updateContext = null;
      }
    },


    // property apply
    _applyBrightness : function(value, old)
    {
      if (this.__updateContext === null) {
        this.__updateContext = "brightnessModifier";
      }

      if (this.__updateContext !== "hsbSpinner") {
        this._getChildControl("hsb-spinner-brightness").setValue(value);
      }

      if (this.__updateContext !== "brightnessField")
      {
        var topValue = 256 - Math.round(value * 2.56);

        if (this._getChildControl("brightness-handle").getBounds()) {
          this._getChildControl("brightness-handle").setDomTop(topValue + this._getChildControl("brightness-pane").getPaddingTop());
        } else {
          this._getChildControl("brightness-handle").setLayoutProperties({ top : topValue });
        }
      }

      switch(this.__updateContext)
      {
        case "hsbSpinner":
        case "brightnessField":
        case "brightnessModifier":
          this._setRgbFromHue();
      }

      if (this.__updateContext === "brightnessModifier") {
        this.__updateContext = null;
      }
    },




    /*
    ---------------------------------------------------------------------------
      BRIGHTNESS IMPLEMENTATION
    ---------------------------------------------------------------------------
    */

    /**
     * Listener of mousedown event on the brightness handle.
     * Adjusts the color by changing the brightness.
     *
     * @param e {qx.event.type.Mouse} Incoming event object
     */
    _onBrightnessHandleMouseDown : function(e)
    {
      // Activate Capturing
      this._getChildControl("brightness-handle").capture();
      this.__capture = "brightness-handle";

      // Calculate subtract: Position of Brightness Field - Current Mouse Offset
      var locationBrightnessField = this._getChildControl("brightness-field").getContainerLocation();
      var locationBrightnessHandle = this._getChildControl("brightness-handle").getContainerLocation();
      var fieldBounds = this._getChildControl("brightness-field").getBounds();

      this.__brightnessSubtract = locationBrightnessField.top +
        (e.getDocumentTop() - locationBrightnessHandle.top) - fieldBounds.top;

      // Block field event handling
      e.stopPropagation();
    },


    /**
     * Listener of mouseup event on the brightness handle.
     * Releases the capture.
     *
     * @param e {qx.event.type.Mouse} Incoming event object
     */
    _onBrightnessHandleMouseUp : function(e)
    {
      // Disabling capturing
      this._getChildControl("brightness-handle").releaseCapture();
      this.__capture = null;
    },


    /**
     * Listener of mousemove event on the brightness handle.
     * Forwards the event to _setBrightnessOnFieldEvent().
     *
     * @param e {qx.event.type.Mouse} Incoming event object
     */
    _onBrightnessHandleMouseMove : function(e)
    {
      // Update if captured currently (through previous mousedown)
      if (this.__capture === "brightness-handle") {
        this._setBrightnessOnFieldEvent(e);
      }
    },


    /**
     * Listener of mousedown event on the brightness field.
     * Adjusts the color by changing the brightness.
     *
     * @param e {qx.event.type.Mouse} Incoming event object
     */
    _onBrightnessFieldMouseDown : function(e)
    {
      // Calculate substract: Half height of handler
      var location  = this._getChildControl("brightness-field").getContainerLocation();
      var bounds = this._getChildControl("brightness-handle").getBounds();
      this.__brightnessSubtract = location.top + (bounds.height / 2);

      // Update
      this._setBrightnessOnFieldEvent(e);

      // Afterwards: Activate Capturing for handle
      this._getChildControl("brightness-handle").capture();
      this.__capture = "brightness-handle";
    },


    /**
     * Listener of mousewheel event on the brightness pane.
     * Adjusts the color by changing the brightness.
     *
     * @param e {qx.event.type.Mouse} Incoming event object
     */
    _onBrightnessPaneMouseWheel : function(e) {
      this.setBrightness(qx.lang.Number.limit(this.getBrightness() + e.getWheelDelta(), 0, 100));
    },


    /**
     * Sets the brightness and moves the brightness handle.
     *
     * @param e {qx.event.type.Mouse} Incomingming event object
     */
    _setBrightnessOnFieldEvent : function(e)
    {
      var value = qx.lang.Number.limit(e.getDocumentTop() - this.__brightnessSubtract, 0, 256);

      this.__updateContext = "brightnessField";

      if (this._getChildControl("brightness-handle").getBounds()) {
        this._getChildControl("brightness-handle").setDomTop(value);
      } else {
        this._getChildControl("brightness-handle").setLayoutProperties({ top : value });
      }

      this.setBrightness(100 - Math.round(value / 2.56));

      this.__updateContext = null;
    },

    /*
    ---------------------------------------------------------------------------
      HUE/SATURATION IMPLEMENTATION
    ---------------------------------------------------------------------------
    */


    /**
     * Listener of mousedown event on the saturation handle.
     * Sets mouse capture.
     *
     * @param e {qx.event.type.Mouse} Incoming event object
     */
    _onHueSaturationHandleMouseDown : function(e)
    {
      // Activate Capturing
      this._getChildControl("hue-saturation-handle").capture();
      this.__capture = "hue-saturation-handle";

      // Block field event handling
      e.stopPropagation();
    },


    /**
     * Listener of mouseup event on the saturation handle.
     * Releases mouse capture.
     *
     * @param e {qx.event.type.Mouse} Incoming event object
     */
    _onHueSaturationHandleMouseUp : function(e)
    {
      // Disabling capturing
      this._getChildControl("hue-saturation-handle").releaseCapture();
      this.__capture = null;
    },


    /**
     * Listener of mousemove event on the saturation handle.
     * Forwards the event to _onHueSaturationHandleMouseMove().
     *
     * @param e {qx.event.type.Mouse} Incoming event object
     */
    _onHueSaturationHandleMouseMove : function(e)
    {
      // Update if captured currently (through previous mousedown)
      if (this.__capture === "hue-saturation-handle") {
        this._setHueSaturationOnFieldEvent(e);
      }
    },


    /**
     * Listener of mousedown event on the saturation field.
     * Adjusts the color by changing the saturation.
     * Sets mouse capture.
     *
     * @param e {qx.event.type.Mouse} Incoming event object
     */
    _onHueSaturationFieldMouseDown : function(e)
    {
      // Calculate substract: Half width/height of handler
      var location = this._getChildControl("hue-saturation-field").getContainerLocation();
      var handleBounds = this._getChildControl("hue-saturation-handle").getBounds();
      var fieldBounds = this._getChildControl("hue-saturation-field").getBounds();

      this.__hueSaturationSubtractTop = location.top + (handleBounds.height / 2) - fieldBounds.top;
      this.__hueSaturationSubtractLeft = location.left + (handleBounds.width / 2) - fieldBounds.left;

      // Update
      this._setHueSaturationOnFieldEvent(e);

      // Afterwards: Activate Capturing for handle
      this._getChildControl("hue-saturation-handle").capture();
      this.__capture = "hue-saturation-handle";
    },


    /**
     * Listener of mousewheel event on the saturation pane.
     * Adjusts the color by changing the saturation.
     *
     * @param e {qx.event.type.Mouse} Incoming event object
     */
    _onHueSaturationPaneMouseWheel : function(e) {
      this.setSaturation(qx.lang.Number.limit(this.getSaturation() + e.getWheelDelta(), 0, 100));
    },


    /**
     * Sets the saturation and moves the saturation handle.
     *
     * @param e {qx.event.type.Mouse} Incoming event object
     */
    _setHueSaturationOnFieldEvent : function(e)
    {
      var vTop = qx.lang.Number.limit(e.getDocumentTop() - this.__hueSaturationSubtractTop, 0, 256);
      var vLeft = qx.lang.Number.limit(e.getDocumentLeft() - this.__hueSaturationSubtractLeft, 0, 256);

      if (this._getChildControl("hue-saturation-handle").getBounds()) {
        this._getChildControl("hue-saturation-handle").setDomPosition(vLeft, vTop);
      } else {
        this._getChildControl("hue-saturation-handle").setLayoutProperties({top: vTop, left: vLeft});
      }

      this.__updateContext = "hueSaturationField";

      this.setSaturation(100 - Math.round(vTop / 2.56));
      this.setHue(Math.round(vLeft * 1.40625));

      this.__updateContext = null;
    },




    /*
    ---------------------------------------------------------------------------
      RGB SPINNER
    ---------------------------------------------------------------------------
    */

    /**
     * Sets widget's red value to spinner's value.
     */
    _setRedFromSpinner : function()
    {
      if (this.__updateContext !== null) {
        return;
      }

      this.__updateContext = "rgbSpinner";
      this.setRed(this._getChildControl("rgb-spinner-red").getValue());
      this.__updateContext = null;
    },


    /**
     * Sets widget's green value to spinner's value.
     */
    _setGreenFromSpinner : function()
    {
      if (this.__updateContext !== null) {
        return;
      }

      this.__updateContext = "rgbSpinner";
      this.setGreen(this._getChildControl("rgb-spinner-green").getValue());
      this.__updateContext = null;
    },


    /**
     * Sets widget's blue value to spinner's value.
     */
    _setBlueFromSpinner : function()
    {
      if (this.__updateContext !== null) {
        return;
      }

      this.__updateContext = "rgbSpinner";
      this.setBlue(this._getChildControl("rgb-spinner-blue").getValue());
      this.__updateContext = null;
    },




    /*
    ---------------------------------------------------------------------------
      HSB SPINNER
    ---------------------------------------------------------------------------
    */

    /**
     * Sets widget's hue value to spinner's value.
     */
    _setHueFromSpinner : function()
    {
      if (this.__updateContext !== null) {
        return;
      }

      this.__updateContext = "hsbSpinner";
      this.setHue(this._getChildControl("hsb-spinner-hue").getValue());
      this.__updateContext = null;
    },


    /**
     * Sets widget's saturation value to spinner's value.
     */
    _setSaturationFromSpinner : function()
    {
      if (this.__updateContext !== null) {
        return;
      }

      this.__updateContext = "hsbSpinner";
      this.setSaturation(this._getChildControl("hsb-spinner-saturation").getValue());
      this.__updateContext = null;
    },


    /**
     * Sets widget's brightness value to spinner's value.
     */
    _setBrightnessFromSpinner : function()
    {
      if (this.__updateContext !== null) {
        return;
      }

      this.__updateContext = "hsbSpinner";
      this.setBrightness(this._getChildControl("hsb-spinner-brightness").getValue());
      this.__updateContext = null;
    },




    /*
    ---------------------------------------------------------------------------
      HEX FIELD
    ---------------------------------------------------------------------------
    */

    /**
     * Changes red, green and blue value to the corresponding hexfield value.
     * @param e {qx.event.type.Data} Incoming event object
     */
    _onHexFieldChange : function(e)
    {
      if (this.__updateContext !== null) {
        return;
      }

      try {
        var rgb = qx.util.ColorUtil.hexStringToRgb("#" + this._hexField.getValue());
      } catch(ex) {
        return;
      };

      this.__updateContext = "hexField";
      this.setRed(rgb[0]);
      this.setGreen(rgb[1]);
      this.setBlue(rgb[2]);
      this.__updateContext = null;
    },


    /**
     * Sets hexfield value to it's corresponding red, green and blue value.
     */
    _setHexFromRgb : function() {
      this._getChildControl("hex-field").setValue(
        qx.util.ColorUtil.rgbToHexString([this.getRed(),this.getGreen(),this.getBlue()])
      );
    },




    /*
    ---------------------------------------------------------------------------
      COLOR FIELD
    ---------------------------------------------------------------------------
    */

    /**
     * Listener of click event on the color field.
     * Sets red, green and blue values to clicked color field's background color.
     *
     * @param e {qx.event.type.Mouse} Incoming event object
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
     * Sets hue value to it's corresponding red, green and blue value.
     */
    _setHueFromRgb : function()
    {
      switch(this.__updateContext)
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
     * Sets red, green and blue value to corresponding hue value.
     */
    _setRgbFromHue : function()
    {
      switch(this.__updateContext)
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
     * Sets preview pane's background color to corresponding red, green and blue color values.
     */
    _setPreviewFromRgb : function()
    {
      var ColorUtil = qx.util.ColorUtil;

      var rgbString = ColorUtil.rgbToRgbString([this.getRed(), this.getGreen(), this.getBlue()]);
      this._getChildControl("preview-content-new").setBackgroundColor(rgbString);

      var helpRgb = ColorUtil.hsbToRgb([this.getHue(), this.getSaturation(), 255]);
      var helpRgbString = ColorUtil.rgbToRgbString([helpRgb.red, helpRgb.green, helpRgb.blue])
      this._getChildControl("brightness-field").setBackgroundColor(helpRgbString);
    },


    /**
     * Sets previous color's to given values.
     *
     * @param vRed {Number} Red color value.
     * @param vGreen {Number} Green color value.
     * @param vBlue {Number} Blue color value.
     */
    setPreviousColor : function(vRed, vGreen, vBlue)
    {
      this._oldColorPreview.setBackgroundImage(null);
      this._oldColorPreview.setBackgroundColor(qx.util.ColorUtil.rgbToRgbString([ vRed, vGreen, vBlue ]));

      this.setRed(vRed);
      this.setGreen(vGreen);
      this.setBlue(vBlue);
    }
  }
});
