/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Jonathan Weiß (jonathan_rass)
     * Matthew Gregory

************************************************************************ */

/**
 * A typical color selector as known from native applications.
 *
 * Includes support for RGB and HSB color areas.
 *
 * @childControl control-bar {qx.ui.container.Composite} container which holds the control-pane and visual-pane
 * @childControl visual-pane {qx.ui.groupbox.GroupBox} pane shows the hue-saturation-pane and the brightness-pane
 * @childControl hue-saturation-pane {qx.ui.container.Composite} shows the hue saturation and the handle to select
 * @childControl hue-saturation-field {qx.ui.basic.Image} hue saturation image which shows all available colors
 * @childControl hue-saturation-handle {qx.ui.basic.Image} handle to select the color using the pointer
 * @childControl brightness-pane {qx.ui.container.Composite} shows the brightness field and the handle to select
 * @childControl brightness-field {qx.ui.basic.Image} brightness image which shows all brightness steps
 * @childControl brightness-handle {qx.ui.basic.Image} brightness handle to select the brightness using the pointer
 * @childControl preset-field-set {qx.ui.groupbox.GroupBox} groupbox holding all preset colors
 * @childControl colorbucket {qx.ui.core.Widget} color bucket
 * @childControl preset-grid {qx.ui.container.Composite} container for all color presets
 * @childControl input-field-set {qx.ui.groupbox.GroupBox} groupbox holding different input elements
 * @childControl preview-field-set {qx.ui.groupbox.GroupBox} groupbox holding the two preview fields
 * @childControl hex-field-composite {qx.ui.container.Composite} container for the hex field
 * @childControl hex-field {qx.ui.form.TextField} textfield to input a hex value
 * @childControl rgb-spinner-composite {qx.ui.container.Composite} container for the rgb spinner
 * @childControl rgb-spinner-red {qx.ui.form.Spinner} spinner control for the red hex value
 * @childControl rgb-spinner-green {qx.ui.form.Spinner} spinner control for the green hex value
 * @childControl rgb-spinner-blue {qx.ui.form.Spinner} spinner control for the blue hex value
 * @childControl hsb-spinner-composite {qx.ui.container.Composite} container for the hsb spinners
 * @childControl hsb-spinner-hue {qx.ui.form.Spinner} spinner control for the huevalue
 * @childControl hsb-spinner-saturation {qx.ui.form.Spinner} spinner control for the saturation value
 * @childControl hsb-spinner-brightness {qx.ui.form.Spinner} spinner control for the brightness value
 * @childControl preview-content-old {qx.ui.core.Widget} preview of the old color
 * @childControl preview-content-new {qx.ui.core.Widget} preview of the new color
 */
qx.Class.define("qx.ui.control.ColorSelector",
{
  extend : qx.ui.core.Widget,
  implement : [qx.ui.form.IColorForm],




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

    this.addListener("appear", this._onAppear, this);
  },




  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events:
  {
    /** Fired when the "OK" button is tapped. */
    "dialogok"     : "qx.event.type.Event",

    /** Fired when the "Cancel" button is tapped. */
    "dialogcancel" : "qx.event.type.Event",

    /** Fired when the value changes */
    "changeValue" : "qx.event.type.Data"
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
     * @type {String} The context in which an update has occurred.
     */
    __updateContext : null,

    /**
     * @type {Array} Map containing the preset colors.
     * @lint ignoreReferenceField(__presetTable)
     */
    __presetTable : [ "maroon", "red", "orange", "yellow", "olive", "purple",
      "fuchsia", "lime", "green", "navy", "blue", "aqua", "teal", "black",
      "#333", "#666", "#999", "#BBB", "#EEE", "white" ],

    /**
     * @type {String} Name of child control which is captured.
     */
    __capture : "",

    /**
     * @type {Number} Numeric brightness value
     */
    __brightnessSubtract : 0,

    /**
     * @type {Integer} HueSaturation's X coordinate
     */
    __hueSaturationSubtractTop : 0,

    /**
     * @type {Integer} HueSaturation's Y coordinate
     */
    __hueSaturationSubtractLeft : 0,

    // internal boolean flag to signal, that the value is set to null
    __nullValue : true,

    // internal mutex to prevent the changeValue event to be fired too often
    __preventChangeValueEvent : false,


    // overridden
    _createChildControlImpl : function(id, hash)
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

          control.add(this.getChildControl("control-pane"));
          control.add(this.getChildControl("visual-pane"));

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
          control.add(this.getChildControl("hue-saturation-pane"));
          control.add(this.getChildControl("brightness-pane"));
          break;

        case "control-pane":
          control = new qx.ui.container.Composite(new qx.ui.layout.VBox(0));
          control.add(this.getChildControl("preset-field-set"));
          control.add(this.getChildControl("input-field-set"));
          control.add(this.getChildControl("preview-field-set"), {flex: 1});
          break;

        case "hue-saturation-pane":
          control = new qx.ui.container.Composite(new qx.ui.layout.Canvas());
          control.setAllowGrowY(false);
          control.addListener("roll", this._onHueSaturationPaneRoll, this);
          control.add(this.getChildControl("hue-saturation-field"));
          control.add(this.getChildControl("hue-saturation-handle"), {left: 0, top: 256});
          break;

        case "hue-saturation-field":
          control = new qx.ui.basic.Image("decoration/colorselector/huesaturation-field.jpg");
          control.addListener("pointerdown", this._onHueSaturationFieldPointerDown, this);
          break;

        case "hue-saturation-handle":
          control = new qx.ui.basic.Image("decoration/colorselector/huesaturation-handle.gif");
          control.addListener("pointerdown", this._onHueSaturationFieldPointerDown, this);
          control.addListener("pointerup", this._onHueSaturationHandlePointerUp, this);
          control.addListener("pointermove", this._onHueSaturationHandlePointerMove, this);
          break;

        case "brightness-pane":
          control = new qx.ui.container.Composite(new qx.ui.layout.Canvas());
          control.setAllowGrowY(false);
          control.addListener("roll", this._onBrightnessPaneRoll, this);
          control.add(this.getChildControl("brightness-field"));
          control.add(this.getChildControl("brightness-handle"));
          break;

        case "brightness-field":
          control = new qx.ui.basic.Image("decoration/colorselector/brightness-field.png");
          control.addListener("pointerdown", this._onBrightnessFieldPointerDown, this);
          break;

        case "brightness-handle":
          control = new qx.ui.basic.Image("decoration/colorselector/brightness-handle.gif");
          control.addListener("pointerdown", this._onBrightnessHandlePointerDown, this);
          control.addListener("pointerup", this._onBrightnessHandlePointerUp, this);
          control.addListener("pointermove", this._onBrightnessHandlePointerMove, this);
          break;


        /*
        ---------------------------------------------------------------------------
          CREATE #3: CONTROL PANE CONTENT
        ---------------------------------------------------------------------------
        */
        case "preset-field-set":
          control = new qx.ui.groupbox.GroupBox(this.tr("Presets"));
          control.setLayout(new qx.ui.layout.Grow());
          control.add(this.getChildControl("preset-grid"));
          break;

        case "colorbucket":
          control = new qx.ui.core.Widget();
          control.addListener("pointerdown", this._onColorFieldTap, this);
          break;

        case "preset-grid":
          controlLayout = new qx.ui.layout.Grid(3, 3);
          control = new qx.ui.container.Composite(controlLayout);

          var colorField;
          var colorPos;

          for (var i=0; i<2; i++)
          {
            for (var j=0; j<10; j++)
            {
              colorPos = i * 10 + j;
              colorField = this.getChildControl("colorbucket#" + colorPos);
              colorField.setBackgroundColor(this.__presetTable[colorPos]);

              control.add(colorField, {column: j, row: i});
            }
          }
          break;

        case "input-field-set":
          control = new qx.ui.groupbox.GroupBox(this.tr("Details"));
          var controlLayout = new qx.ui.layout.VBox();
          controlLayout.setSpacing(10);
          control.setLayout(controlLayout);

          control.add(this.getChildControl("hex-field-composite"));
          control.add(this.getChildControl("rgb-spinner-composite"));
          control.add(this.getChildControl("hsb-spinner-composite"));
          break;

        case "preview-field-set":
          control = new qx.ui.groupbox.GroupBox(this.tr("Preview (Old/New)"));
          var controlLayout = new qx.ui.layout.HBox(10);
          control.setLayout(controlLayout);

          control.add(this.getChildControl("preview-content-old"), {flex: 1});
          control.add(this.getChildControl("preview-content-new"), {flex: 1});
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
          hexLabel.setWidth(30);
          control.add(hexLabel);

          var hexHelper = new qx.ui.basic.Label("#");
          control.add(hexHelper);

          control.add(this.getChildControl("hex-field"));
          break;

        case "hex-field":
          control = new qx.ui.form.TextField("FFFFFF");
          control.setMaxLength(6);
          control.setFilter(/[0-9A-Fa-f]/);
          control.setWidth(55);
          control.addListener("changeValue", this._onHexFieldChange, this);
          break;

        case "rgb-spinner-composite":
          var layout = new qx.ui.layout.HBox(4);
          layout.setAlignY("middle");
          control = new qx.ui.container.Composite(layout);

          var rgbSpinLabel = new qx.ui.basic.Label(this.tr("RGB"));
          rgbSpinLabel.setWidth(30);
          control.add(rgbSpinLabel);

          control.add(this.getChildControl("rgb-spinner-red"));
          control.add(this.getChildControl("rgb-spinner-green"));
          control.add(this.getChildControl("rgb-spinner-blue"));
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
          hsbSpinLabel.setWidth(30);
          control.add(hsbSpinLabel);

          control.add(this.getChildControl("hsb-spinner-hue"));
          control.add(this.getChildControl("hsb-spinner-saturation"));
          control.add(this.getChildControl("hsb-spinner-brightness"));
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


    /**
     * The value of the ColorSelector is a string containing the HEX value of
     * the currently selected color. Take a look at
     * {@link qx.util.ColorUtil#stringToRgb} to see what kind of input the
     * method can handle.
     *
     * @param value {String} The value of a color.
     */
    setValue: function(value)
    {
      var rgb;

      if (value == null)
      {
        this.__nullValue = true;
        rgb = [255, 255, 255];
      }
      else
      {
        rgb = qx.util.ColorUtil.stringToRgb(value);
        this.__nullValue = false;
      }

      // block the first tow events
      this.__preventChangeValueEvent = true;
      this.setRed(rgb[0]);
      this.setGreen(rgb[1]);
      // only allow the final change event
      this.__preventChangeValueEvent = false;
      this.setBlue(rgb[2]);
    },


    /**
     * Returns the currently selected color.
     *
     * @return {String | null} The HEX value of the color of if not color
     *   is set, null.
     */
    getValue: function()
    {
      return this.__nullValue ? null : qx.util.ColorUtil.rgbToHexString(
        [this.getRed(), this.getGreen(), this.getBlue()]
      );
    },

    /**
     * Resets the color to null.
     */
    resetValue: function()
    {
      this.__nullValue = true;
      this.__preventChangeValueEvent = true;
      this.setRed(255);
      this.setGreen(255);
      this.__preventChangeValueEvent = false;
      this.setBlue(255);
    },


    /**
     * Helper for firing the changeValue event and checking for the mutex.
     */
    __fireChangeValueEvent: function()
    {
      if (!this.__preventChangeValueEvent)
      {
        this.__nullValue = false;
        this.fireDataEvent("changeValue", this.getValue());
      }
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
        this.getChildControl("rgb-spinner-red").setValue(value);
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
      this.__fireChangeValueEvent();

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
        this.getChildControl("rgb-spinner-green").setValue(value);
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
      this.__fireChangeValueEvent();

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
        this.getChildControl("rgb-spinner-blue").setValue(value);
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
      this.__fireChangeValueEvent();

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
        this.getChildControl("hsb-spinner-hue").setValue(value);
      }

      if (this.__updateContext !== "hueSaturationField")
      {
        if (this.getChildControl("hue-saturation-handle").getBounds()) {
          this.getChildControl("hue-saturation-handle").setDomLeft(Math.round(value / 1.40625) + this.getChildControl("hue-saturation-pane").getPaddingLeft());
        } else {
          this.getChildControl("hue-saturation-handle").setLayoutProperties({ left : Math.round(value / 1.40625) });
        }
      }

      switch(this.__updateContext)
      {
        case "hsbSpinner":
        case "hueSaturationField":
        case "hueModifier":
          this._setRgbFromHue();
      }
      this._setBrightnessGradiant();
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
        this.getChildControl("hsb-spinner-saturation").setValue(value);
      }

      if (this.__updateContext !== "hueSaturationField")
      {
        this._setBrightnessGradiant();
        if (this.getChildControl("hue-saturation-handle").getBounds()) {
          this.getChildControl("hue-saturation-handle").setDomTop(256 - Math.round(value * 2.56) + this.getChildControl("hue-saturation-pane").getPaddingTop());
        } else {
          this.getChildControl("hue-saturation-handle").setLayoutProperties({ top : 256 - Math.round(value * 2.56)});
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
        this.getChildControl("hsb-spinner-brightness").setValue(value);
      }

      if (this.__updateContext !== "brightnessField")
      {
        var topValue = 256 - Math.round(value * 2.56);

        if (this.getChildControl("brightness-handle").getBounds()) {
          this.getChildControl("brightness-handle").setDomTop(topValue + this.getChildControl("brightness-pane").getPaddingTop());
        } else {
          this.getChildControl("brightness-handle").setLayoutProperties({ top : topValue });
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
     * Listener of pointerdown event on the brightness handle.
     * Adjusts the color by changing the brightness.
     *
     * @param e {qx.event.type.Pointer} Incoming event object
     */
    _onBrightnessHandlePointerDown : function(e)
    {
      // Activate Capturing
      this.getChildControl("brightness-handle").capture();
      this.__capture = "brightness-handle";

      // Calculate subtract: Position of Brightness Field - Current Pointer Offset
      var locationBrightnessField = this.getChildControl("brightness-field").getContentLocation();
      var locationBrightnessHandle = this.getChildControl("brightness-handle").getContentLocation();
      var fieldBounds = this.getChildControl("brightness-field").getBounds();

      this.__brightnessSubtract = locationBrightnessField.top +
        (e.getDocumentTop() - locationBrightnessHandle.top) - fieldBounds.top;

      // Block field event handling
      e.stopPropagation();
    },


    /**
     * Listener of pointerup event on the brightness handle.
     * Releases the capture.
     *
     * @param e {qx.event.type.Pointer} Incoming event object
     */
    _onBrightnessHandlePointerUp : function(e)
    {
      // Disabling capturing
      this.getChildControl("brightness-handle").releaseCapture();
      this.__capture = null;
    },


    /**
     * Listener of pointermove event on the brightness handle.
     * Forwards the event to _setBrightnessOnFieldEvent().
     *
     * @param e {qx.event.type.Pointer} Incoming event object
     */
    _onBrightnessHandlePointerMove : function(e)
    {
      // Update if captured currently (through previous pointerdown)
      if (this.__capture === "brightness-handle") {
        this._setBrightnessOnFieldEvent(e);
        e.stopPropagation();
      }
    },


    /**
     * Listener of pointerdown event on the brightness field.
     * Adjusts the color by changing the brightness.
     *
     * @param e {qx.event.type.Pointer} Incoming event object
     */
    _onBrightnessFieldPointerDown : function(e)
    {
      // Calculate substract: Half height of handler
      var location  = this.getChildControl("brightness-field").getContentLocation();
      var bounds = this.getChildControl("brightness-handle").getBounds();
      this.__brightnessSubtract = location.top + (bounds.height / 2);

      // Update
      this._setBrightnessOnFieldEvent(e);

      // Afterwards: Activate Capturing for handle
      this.getChildControl("brightness-handle").capture();
      this.__capture = "brightness-handle";
    },


    /**
     * Listener of roll event on the brightness pane.
     * Adjusts the color by changing the brightness.
     *
     * @param e {qx.event.type.Roll} Incoming event object
     */
    _onBrightnessPaneRoll : function(e)
    {
      e.stop();

      // only wheel
      if (e.getPointerType() != "wheel") {
        return;
      }

      this.setBrightness(qx.lang.Number.limit((this.getBrightness() - (e.getDelta().y / 10)), 0, 100));
    },


    /**
     * Sets the brightness and moves the brightness handle.
     *
     * @param e {qx.event.type.Pointer} Incoming event object
     */
    _setBrightnessOnFieldEvent : function(e)
    {
      var value = qx.lang.Number.limit(e.getDocumentTop() - this.__brightnessSubtract, 0, 256);

      this.__updateContext = "brightnessField";

      if (this.getChildControl("brightness-handle").getBounds()) {
        this.getChildControl("brightness-handle").setDomTop(value);
      } else {
        this.getChildControl("brightness-handle").setLayoutProperties({ top : value });
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
     * Listener of pointerup event on the saturation handle.
     * Releases pointer capture.
     *
     * @param e {qx.event.type.Pointer} Incoming event object
     */
    _onHueSaturationHandlePointerUp : function(e)
    {
      // Disabling capturing
      if (this.__capture)
      {
        e.stopPropagation();
        this.getChildControl("hue-saturation-handle").releaseCapture();
        this.__capture = null;
      }
    },


    /**
     * Listener of pointermove event on the saturation handle.
     * Forwards the event to _onHueSaturationHandlePointerMove().
     *
     * @param e {qx.event.type.Pointer} Incoming event object
     */
    _onHueSaturationHandlePointerMove : function(e)
    {

      // Update if captured currently (through previous pointerdown)
      if (this.__capture === "hue-saturation-handle")
      {
        this._setHueSaturationOnFieldEvent(e);
        e.stopPropagation();
      }
    },


    /**
     * Listener of pointerdown event on the saturation field.
     * Adjusts the color by changing the saturation.
     * Sets pointer capture.
     *
     * @param e {qx.event.type.Pointer} Incoming event object
     */
    _onHueSaturationFieldPointerDown : function(e)
    {
      // Calculate substract: Half width/height of handler
      var location = this.getChildControl("hue-saturation-field").getContentLocation();
      var handleBounds = this.getChildControl("hue-saturation-handle").getBounds();
      var fieldBounds = this.getChildControl("hue-saturation-field").getBounds();

      this.__hueSaturationSubtractTop = location.top + (handleBounds.height / 2) - fieldBounds.top;
      this.__hueSaturationSubtractLeft = location.left + (handleBounds.width / 2) - fieldBounds.left;

      // Update
      this._setHueSaturationOnFieldEvent(e);

      // Afterwards: Activate Capturing for handle
      this.getChildControl("hue-saturation-handle").capture();
      this.__capture = "hue-saturation-handle";
    },


    /**
     * Listener of roll event on the saturation pane.
     * Adjusts the color by changing the saturation.
     *
     * @param e {qx.event.type.Roll} Incoming event object
     */
    _onHueSaturationPaneRoll : function(e)
    {
      e.stop();

      // only wheel
      if (e.getPointerType() != "wheel") {
        return;
      }

      var delta = e.getDelta();
      this.setSaturation(qx.lang.Number.limit(this.getSaturation() - delta.y / 10, 0, 100));
      this.setHue(qx.lang.Number.limit(this.getHue() + delta.x / 10, 0, 360));
    },


    /**
     * Sets the saturation and moves the saturation handle.
     *
     * @param e {qx.event.type.Pointer} Incoming event object
     */
    _setHueSaturationOnFieldEvent : function(e)
    {
      var vTop = qx.lang.Number.limit(e.getDocumentTop() - this.__hueSaturationSubtractTop, 0, 256);
      var vLeft = qx.lang.Number.limit(e.getDocumentLeft() - this.__hueSaturationSubtractLeft, 0, 256);

      this.getChildControl("hue-saturation-handle").setDomPosition(vLeft, vTop);

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
      this.setRed(this.getChildControl("rgb-spinner-red").getValue());
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
      this.setGreen(this.getChildControl("rgb-spinner-green").getValue());
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
      this.setBlue(this.getChildControl("rgb-spinner-blue").getValue());
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
      this.setHue(this.getChildControl("hsb-spinner-hue").getValue());
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
      this.setSaturation(this.getChildControl("hsb-spinner-saturation").getValue());
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
      this.setBrightness(this.getChildControl("hsb-spinner-brightness").getValue());
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

      try
      {
        var hexField = this.getChildControl("hex-field");
        var rgb = qx.util.ColorUtil.hexStringToRgb("#" + hexField.getValue());
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
    _setHexFromRgb : function()
    {
      var value = qx.util.ColorUtil.rgbToHexString(
        [this.getRed(),this.getGreen(),this.getBlue()]
      );

      // get rid of the starting '#'
      value = value.substring(1, value.length);

      this.getChildControl("hex-field").setValue(value);
    },




    /*
    ---------------------------------------------------------------------------
      COLOR FIELD
    ---------------------------------------------------------------------------
    */

    /**
     * Listener of tap event on the color field.
     * Sets red, green and blue values to tapped color field's background color.
     *
     * @param e {qx.event.type.Pointer} Incoming event object
     */
    _onColorFieldTap : function(e)
    {
      var vColor = e.getTarget().getBackgroundColor();

      if (!vColor) {
        this.error("Missing backgroundColor value for field: " + e.getTarget());
        return;
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

          this.setRed(vRgb[0]);
          this.setGreen(vRgb[1]);
          this.setBlue(vRgb[2]);
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
      var rgbString = qx.util.ColorUtil.rgbToRgbString([this.getRed(), this.getGreen(), this.getBlue()]);
      this.getChildControl("preview-content-new").setBackgroundColor(rgbString);
    },


    /**
     * Sets previous color's to given values.
     *
     * @param red {Number} Red color value.
     * @param green {Number} Green color value.
     * @param blue {Number} Blue color value.
     */
    setPreviousColor : function(red, green, blue)
    {
      var color = qx.util.ColorUtil.rgbToRgbString([red, green, blue]);
      this.getChildControl("preview-content-old").setBackgroundColor(color);

      this.setRed(red);
      this.setGreen(green);
      this.setBlue(blue);
    },

    /**
     * Updates the background of the brightness field to give a nicer gradient
     */
    _setBrightnessGradiant : function()
    {
      var ColorUtil = qx.util.ColorUtil;
      var helpRgb = ColorUtil.hsbToRgb([this.getHue(), this.getSaturation(), 255]);
      var helpRgbString = ColorUtil.rgbToRgbString(helpRgb);
      this.getChildControl("brightness-field").setBackgroundColor(helpRgbString);
    },

    /**
     * Listener for appear.
     * Sets preview pane's background color to the current color.
     *
     * @param e {qx.event.type.Data} Incoming event object
     */
    _onAppear : function(e)
    {
      var color = qx.util.ColorUtil.rgbToRgbString([this.getRed(),
      this.getGreen(), this.getBlue()]);

      this.getChildControl("preview-content-old").setBackgroundColor(color);
      this.getChildControl("preview-content-new").setBackgroundColor(color);
    }
  }
});
