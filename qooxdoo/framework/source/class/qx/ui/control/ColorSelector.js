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
qx.Class.define("qx.ui.control.ColorSelector",
{
  extend : qx.ui.core.Widget,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(vPreviousRed, vPreviousGreen, vPreviousBlue)
  {
    this.base(arguments);
    
    // add the basic layout
    this._setLayout(new qx.ui.layout.VBox());
    
    this.setDecorator("outset");
    
    // 1. Base Structure (Vertical Split)
    this._createChildControl("control-bar");
    this._createChildControl("button-bar");

    // 2. Panes (Horizontal Split)
/*
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
*/    
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
          control = new qx.ui.container.Composite(new qx.ui.layout.HBox());
                    
          control.add(this._getChildControl("control-pane"));
          control.add(this._getChildControl("hue-saturation-pane"));
          control.add(this._getChildControl("brightness-pane"));
          
          this._add(control);
          break;
          
        case "button-bar":
          control = new qx.ui.container.Composite(new qx.ui.layout.HBox(4, "right"));      
          control.setPadding(2, 4);
          this._add(control);
    
          control.add(this._getChildControl("cancle-button"));
          control.add(this._getChildControl("ok-button"));
          break;
          
        case "cancle-button":
          control = new qx.ui.form.Button(this.tr("Cancel"), "icon/16/actions/dialog-cancel.png"); 
          control.addListener("execute", this._onButtonCancelExecute, this);
          break;
          
        case "ok-button":
          control = new qx.ui.form.Button(this.tr("OK"), "icon/16/actions/dialog-ok.png"); 
          control.addListener("execute", this._onButtonOkExecute, this);
          break;   
          
          
        /*
        ---------------------------------------------------------------------------
          CREATE #2: PANES
        ---------------------------------------------------------------------------
        */
        case "control-pane":
          control = new qx.ui.container.Composite(new qx.ui.layout.VBox());
          control.setPadding(4);
          control.setPaddingBottom(7);
          
          control.add(this._getChildControl("preset-field-set"));
          control.add(this._getChildControl("input-field-set"));
          control.add(this._getChildControl("preview-field-set"), {flex: 1});
          break;
          
        case "hue-saturation-pane":
          control = new qx.ui.container.Composite(new qx.ui.layout.Canvas());
          control.setPadding(6, 4);
          control.addListener("mousewheel", this._onHueSaturationPaneMouseWheel, this);
          control.add(this._getChildControl("hue-saturation-field"));      
          control.add(this._getChildControl("hue-saturation-handle"), {left: 0, top: 256});
          break;
          
        case "hue-saturation-field":
            control = new qx.ui.basic.Image("decoration/colorselector/huesaturation-field.jpg");
            control.setDecorator("inset-thin");
            control.setMargin(5);      
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
          control.setPadding(6, 4);          
          control.addListener("mousewheel", this._onBrightnessPaneMouseWheel, this);            
          control.add(this._getChildControl("brightness-field"));
          control.add(this._getChildControl("brightness-handle"));
          break;
          
        case "brightness-field":
            control = new qx.ui.basic.Image("decoration/colorselector/brightness-field.jpg");
            control.setDecorator("inset-thin");
            control.setMargin(5, 7);      
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
          controlLayout = new qx.ui.layout.Grid(2, 2);
          control = new qx.ui.container.Composite(controlLayout);
          for (var i = 0; i < 10; i++) {
            controlLayout.setColumnWidth(i, 18);            
          }
          controlLayout.setRowHeight(0, 16);
          controlLayout.setRowHeight(1, 16);
    
          this._presetTable = [ "maroon", "red", "orange", "yellow", "olive", "purple", "fuchsia", "lime", "green", "navy", "blue", "aqua", "teal", "black", "#333", "#666", "#999", "#BBB", "#EEE", "white" ];
    
          var colorField;
    
          for (var i=0; i<2; i++)
          {
            for (var j=0; j<10; j++)
            {
              colorField = new qx.ui.core.Widget();
              colorField.setDecorator("inset-thin");
              colorField.setBackgroundColor(this._presetTable[i * 10 + j]);
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
          var controlLayout = new qx.ui.layout.HBox();
          controlLayout.setSpacing(10);
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
          control = new qx.ui.container.Composite(new qx.ui.layout.HBox(4));
    
          var hexLabel = new qx.ui.basic.Label(this.tr("Hex"));
          hexLabel.setWidth(25);
          control.add(hexLabel);
    
          var hexHelper = new qx.ui.basic.Label("#");
          control.add(hexHelper);
    
          control.add(this._getChildControl("hex-field"));
          break;   
        
        case "hex-field":
          control = new qx.ui.form.TextField("FFFFFF");
          control.setWidth(50);
          control.addListener("changeValue", this._onHexFieldChange, this);        
          break;
          
        case "rgb-spinner-composite":
          control = new qx.ui.container.Composite(new qx.ui.layout.HBox(4));
    
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
          control.addListener("change", this._setRedFromSpinner, this);
          break;
          
        case "rgb-spinner-green":
          control = new qx.ui.form.Spinner(0, 255, 255);
          control.setWidth(50);
          control.addListener("change", this._setGreenFromSpinner, this);
          break;
        
        case "rgb-spinner-blue":
          control = new qx.ui.form.Spinner(0, 255, 255);
          control.setWidth(50);
          control.addListener("change", this._setBlueFromSpinner, this);   
          break;        
       
        case "hsb-spinner-composite":
          control = new qx.ui.container.Composite(new qx.ui.layout.HBox(4)); 
    
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
          control.addListener("change", this._setHueFromSpinner, this);
          break;
          
        case "hsb-spinner-saturation":
          control = new qx.ui.form.Spinner(0, 0, 100);
          control.setWidth(50);
          control.addListener("change", this._setSaturationFromSpinner, this);
          break;
          
        case "hsb-spinner-brightness":
          control = new qx.ui.form.Spinner(0, 100, 100);
          control.setWidth(50);
          control.addListener("change", this._setBrightnessFromSpinner, this);
          break;
          
          
        /*
        ---------------------------------------------------------------------------
          CREATE #5: PREVIEW CONTENT
        ---------------------------------------------------------------------------
        */
        case "preview-content-old":
          control = new qx.ui.core.Widget();
          control.setDecorator("inset-thin");
          break;
      
        case "preview-content-new":
          control = new qx.ui.core.Widget();
          control.setDecorator("inset-thin");
          control.setBackgroundColor("white");
          break;
      }
      
      return control || this.base(arguments, id);
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
        this._getChildControl("rgb-spinner-red").setValue(value);
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
        this._getChildControl("rgb-spinner-green").setValue(value);
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
        this._getChildControl("rgb-spinner-blue").setValue(value);
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
        this._getChildControl("hsb-spinner-hue").setValue(value);
      }

      if (this._updateContext !== "hueSaturationField")
      {
        if (this._getChildControl("hue-saturation-handle").getBounds()) {          
          this._getChildControl("hue-saturation-handle").setDomLeft(Math.round(value / 1.40625) + this._getChildControl("hue-saturation-pane").getPaddingLeft());
        } else {
          this._getChildControl("hue-saturation-handle").setLeft(Math.round(value / 1.40625));
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
        this._getChildControl("hsb-spinner-saturation").setValue(value);
      }

      if (this._updateContext !== "hueSaturationField")
      {
        if (this._getChildControl("hue-saturation-handle").getBounds()) {
          this._getChildControl("hue-saturation-handle").setDomTop(256 - Math.round(value * 2.56) + this._getChildControl("hue-saturation-pane").getPaddingTop());
        } else {
          this._getChildControl("hue-saturation-handle").setTop(256 - Math.round(value * 2.56));
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
        this._getChildControl("hsb-spinner-brightness").setValue(value);
      }

      if (this._updateContext !== "brightnessField")
      {
        var topValue = 256 - Math.round(value * 2.56);

        if (this._getChildControl("brightness-handle").getBounds()) {
          this._getChildControl("brightness-handle").setDomTop(topValue + this._getChildControl("brightness-pane").getPaddingTop());
        } else {
          this._getChildControl("brightness-handle").setTop(topValue);
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
      this._getChildControl("brightness-handle").capture();
      this._capture = "brightness-handle";

      // Calculate subtract: Position of Brightness Field - Current Mouse Offset
      var locationBrightnessField = this._getChildControl("brightness-field").getContainerLocation();
      var locationBrightnessHandle = this._getChildControl("brightness-handle").getContainerLocation();

      this._brightnessSubtract = locationBrightnessField.top +
        (e.getDocumentTop() - locationBrightnessHandle.top);

      // Block field event handling
      e.stopPropagation();
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
      this._getChildControl("brightness-handle").releaseCapture();
      this._capture = null;
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
      if (this._capture === "brightness-handle") {
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
      var location  = this._getChildControl("brightness-field").getContainerLocation();
      var bounds = this._getChildControl("brightness-handle").getBounds();
      this._brightnessSubtract = location.top + (bounds.height / 2);

      // Update
      this._setBrightnessOnFieldEvent(e);

      // Afterwards: Activate Capturing for handle
      this._getChildControl("brightness-handle").capture();
      this._capture = "brightness-handle";
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
      var value = qx.lang.Number.limit(e.getDocumentTop() - this._brightnessSubtract, 0, 256);

      this._updateContext = "brightnessField";

      if (this._getChildControl("brightness-handle").getBounds()) {
        this._getChildControl("brightness-handle").setDomTop(value + this._getChildControl("brightness-pane").getPaddingTop());
      } else {
        this._getChildControl("brightness-handle").setTop(value);
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
      this.fireEvent("dialogok");
    },


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onButtonCancelExecute : function(e) {
      this.fireEvent("dialogcancel");
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
      this._getChildControl("hue-saturation-handle").capture();
      this._capture = "hue-saturation-handle";

      // Calculate subtract: Position of HueSaturation Field - Current Mouse Offset
      var location = this._getChildControl("hue-saturation-field").getContainerLocation();
      var bounds = this._getChildControl("hue-saturation-handle").getBounds();

      this._hueSaturationSubtractTop = location.top + (e.getDocumentTop() - bounds.top);
      this._hueSaturationSubtractLeft = location.left + (e.getDocumentLeft() - bounds.left);

      // Block field event handling
      e.stopPropagation();
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
      this._getChildControl("hue-saturation-handle").releaseCapture();
      this._capture = null;
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
      if (this._capture === "hue-saturation-handle") {
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
      var location = this._getChildControl("hue-saturation-field").getContainerLocation();
      var bounds = this._getChildControl("hue-saturation-handle").getBounds();
      this._hueSaturationSubtractTop = location.top + (bounds.height / 2);
      this._hueSaturationSubtractLeft = location.left + (bounds.width / 2);

      // Update
      this._setHueSaturationOnFieldEvent(e);

      // Afterwards: Activate Capturing for handle
      this._getChildControl("hue-saturation-handle").capture();
      this._capture = "hue-saturation-handle";
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
      var vTop = qx.lang.Number.limit(e.getDocumentTop() - this._hueSaturationSubtractTop, 0, 256);
      var vLeft = qx.lang.Number.limit(e.getDocumentLeft() - this._hueSaturationSubtractLeft, 0, 256);

      if (this._getChildControl("hue-saturation-handle").getBounds()) {
        this._getChildControl("hue-saturation-handle").setDomPosition(vLeft, vTop);        
      } else {
        this._getChildControl("hue-saturation-handle").setLayoutProperties({top: vTop, left: vLeft});        
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
      this._getChildControl("preview-content-new").setBackgroundColor(qx.util.ColorUtil.rgbToRgbString([this.getRed(), this.getGreen(), this.getBlue()]));
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
