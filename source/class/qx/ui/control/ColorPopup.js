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


************************************************************************ */

/**
 * A popup which contains palettes of colors and the possibility to open the
 * Colorselector to choose a color.
 *
 * @childControl field {qx.ui.core.Widget} shows preset colors
 * @childControl auto-button {qx.ui.form.Button} automatic button
 * @childControl selector-button {qx.ui.form.Button} button to open the color selector
 * @childControl preview-pane {qx.ui.groupbox.GroupBox} group box to show the old and the new color
 * @childControl selected-preview {qx.ui.container.Composite} show the selected color
 * @childControl current-preview {qx.ui.container.Composite} show the current color
 * @childControl colorselector-okbutton {qx.ui.form.Button} button of the colorselector
 * @childControl colorselector-cancelbutton {qx.ui.form.Button} button of the colorselector
 */
qx.Class.define("qx.ui.control.ColorPopup",
{
  extend : qx.ui.popup.Popup,
  implement : [qx.ui.form.IColorForm],

  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    this.setLayout(new qx.ui.layout.VBox(5));

    this._createChildControl("auto-button");
    this._createBoxes();
    this._createChildControl("preview-pane");
    this._createChildControl("selector-button");

    this.addListener("changeVisibility", this._onChangeVisibility, this);
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
      init : "colorpopup"
    },

    /** The hex value of the selected color. */
    value :
    {
      nullable : true,
      apply : "_applyValue",
      event : "changeValue"
    },

    /** The numeric red value of the selected color. */
    red :
    {
      check : "Number",
      init : null,
      nullable : true,
      event : "changeRed"
    },

    /** The numeric green value of the selected color. */
    green :
    {
      check : "Number",
      init : null,
      nullable : true,
      event : "changeGreen"
    },

    /** The numeric blue value of the selected color. */
    blue :
    {
      check : "Number",
      init : null,
      nullable : true,
      event : "changeBlue"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __minZIndex : 1e5,
    __boxes : null,
    __colorSelectorWindow : null,
    __colorSelector : null,
    __buttonBar : null,
    __recentTableId : "recent",
    __fieldNumber : 12,


    // overridden
    _createChildControlImpl : function(id, hash)
    {
      var control;

      switch(id)
      {
        case "field":
          control = new qx.ui.core.Widget;
          control.addListener("pointerdown", this._onFieldPointerDown, this);
          control.addListener("pointerover", this._onFieldPointerOver, this);
          control.addListener("pointerout", this._onFieldPointerOut, this);
          break;

        case "auto-button":
          control = new qx.ui.form.Button(this.tr("Automatic"));
          control.setAllowStretchX(true);
          control.addListener("execute", this._onAutomaticBtnExecute, this);

          this.add(control);
          break;

        case "selector-button":
          control = new qx.ui.form.Button(this.tr("Open ColorSelector"));
          control.addListener("execute", this._onSelectorButtonExecute, this);

          this.add(control);
          break;

        case "preview-pane":
          control = new qx.ui.groupbox.GroupBox(this.tr("Preview (Old/New)"));
          control.setLayout(new qx.ui.layout.HBox);

          control.add(this._createChildControl("selected-preview", true), {flex : 1});
          control.add(this._createChildControl("current-preview", true), {flex : 1});

          this.add(control);
          break;

        case "selected-preview":
          control = new qx.ui.container.Composite(new qx.ui.layout.Basic);
          break;

        case "current-preview":
          control = new qx.ui.container.Composite(new qx.ui.layout.Basic);
          break;

        case "colorselector-okbutton":
          control = new qx.ui.form.Button(this.tr("OK"));
          control.addListener("execute", this._onColorSelectorOk, this);
          break;

        case "colorselector-cancelbutton":
          control = new qx.ui.form.Button(this.tr("Cancel"));
          control.addListener("execute", this._onColorSelectorCancel, this);
          break;
      }

      return control || this.base(arguments, id);
    },




    /*
    ---------------------------------------------------------------------------
      CREATOR SUBS
    ---------------------------------------------------------------------------
    */

    /**
     * Creates the GroupBoxes containing the colored fields.
     */
    _createBoxes : function()
    {
      this.__boxes = {};

      var tables = this._tables;
      var table, box, field;
      var j=0;

      for (var tableId in tables)
      {
        table = tables[tableId];

        box = new qx.ui.groupbox.GroupBox(table.label);
        box.setLayout(new qx.ui.layout.HBox);

        this.__boxes[tableId] = box;
        this.add(box);

        for (var i=0; i<this.__fieldNumber; i++)
        {
          field = this.getChildControl("field#" + (j++));
          field.setBackgroundColor(table.values[i] || null);
          box.add(field);
        }
      }
    },


    /**
     * Creates the ColorSelector and adds buttons.
     */
    _createColorSelector : function()
    {
      if (this.__colorSelector) {
        return;
      }

      var win = new qx.ui.window.Window(this.tr("Color Selector"));
      this.__colorSelectorWindow = win;
      win.setLayout(new qx.ui.layout.VBox(16));
      win.setResizable(false);
      win.moveTo(20, 20);

      this.__colorSelector = new qx.ui.control.ColorSelector();
      win.add(this.__colorSelector);

      this.__buttonBar = new qx.ui.container.Composite(new qx.ui.layout.HBox(8, "right"));
      win.add(this.__buttonBar);

      var btnCancel = this._createChildControl("colorselector-cancelbutton");
      var btnOk = this._createChildControl("colorselector-okbutton");

      this.__buttonBar.add(btnCancel);
      this.__buttonBar.add(btnOk);
    },





    /*
    ---------------------------------------------------------------------------
      APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    // Property apply
    _applyValue : function(value, old)
    {
      if (value === null)
      {
        this.setRed(null);
        this.setGreen(null);
        this.setBlue(null);
      }
      else
      {
        var rgb = qx.util.ColorUtil.stringToRgb(value);
        this.setRed(rgb[0]);
        this.setGreen(rgb[1]);
        this.setBlue(rgb[2]);
      }

      this.getChildControl("selected-preview").setBackgroundColor(value);
      this._rotatePreviousColors();
    },


    /**
     * Adds the most recent selected color to the "Recent colors" list.
     * If this list is full, the first color will be removed before inserting
     * the new one.
     */
    _rotatePreviousColors : function()
    {
      if(!this._tables){
        return;
      }

      var vRecentTable = this._tables[this.__recentTableId].values;
      var vRecentBox = this.__boxes[this.__recentTableId];

      if (!vRecentTable) {
        return;
      }

      var newValue = this.getValue();

      if (!newValue) {
        return;
      }

      // Modifying incoming table
      var vIndex = vRecentTable.indexOf(newValue);

      if (vIndex != -1) {
        qx.lang.Array.removeAt(vRecentTable, vIndex);
      } else if (vRecentTable.length == this.__fieldNumber) {
        vRecentTable.shift();
      }

      vRecentTable.push(newValue);

      // Sync to visible fields
      var vFields = vRecentBox.getChildren();

      for (var i=0; i<vFields.length; i++) {
        vFields[i].setBackgroundColor(vRecentTable[i] || null);
      }
    },



    /*
    ---------------------------------------------------------------------------
      EVENT HANDLER
    ---------------------------------------------------------------------------
    */

    /**
     * Listener of pointerdown event on a color field. Sets the ColorPoup's value
     * to field's color value and paint the preview pane.
     *
     * @param e {qx.event.type.Pointer} Incoming event object
     */
    _onFieldPointerDown : function(e)
    {
      var vValue = this.getChildControl("current-preview").getBackgroundColor();
      this.setValue(vValue);

      if (vValue) {
        this.hide();
      }
    },


    /**
     * Listener of pointermove event on a color field. Sets preview pane's
     * background color to the field's color value.
     *
     * @param e {qx.event.type.Pointer} Incoming event object
     */
    _onFieldPointerOver : function(e) {
      this.getChildControl("current-preview").setBackgroundColor(e.getTarget().getBackgroundColor());
    },

    /**
     * Listener of pointerout event on a color field. Reset the preview pane's
     * background color to the old color value.
     *
     * @param e {qx.event.type.Pointer} Incoming event object
     */
    _onFieldPointerOut : function(e) {
      var red = this.getRed();
      var green = this.getGreen();
      var blue = this.getBlue();
      var color = null;

      if (red !== null || green !== null || blue !== null) {
        color = qx.util.ColorUtil.rgbToRgbString([red, green, blue]);
      }

      this.getChildControl("current-preview").setBackgroundColor(color);
    },

    /**
     * Listener of execute event on the "cancel" button.
     * Hides the ColorPopup and resets it's color value.
     */
    _onAutomaticBtnExecute : function()
    {
      this.setValue(null);
      this.hide();
    },


    /**
     * Listener of execute event on the "Open ColorSelector" button.
     * Opens a ColorSelector widget and hides the ColorPopup.
     */
    _onSelectorButtonExecute : function()
    {
      this._createColorSelector();

      this.exclude();

      var red = this.getRed();
      var green = this.getGreen();
      var blue = this.getBlue();

      if (red === null || green === null || blue === null)
      {
        red = 255;
        green = 255;
        blue = 255;
      }

      this.__colorSelector.setRed(red);
      this.__colorSelector.setGreen(green);
      this.__colorSelector.setBlue(blue);

      this.__colorSelectorWindow.open();
    },


    /**
     * Listener of execute event on the "OK" button.
     * Hides the ColorPopup and sets it's color value to the selected color.
     */
    _onColorSelectorOk : function()
    {
      var sel = this.__colorSelector;
      this.setValue(qx.util.ColorUtil.rgbToRgbString([sel.getRed(), sel.getGreen(), sel.getBlue()]));
      this.__colorSelectorWindow.close();
    },


    /**
     * Listener of execute event on the "Cancel" button.
     * Hides the ColorPopup.
     */
    _onColorSelectorCancel : function() {
      this.__colorSelectorWindow.close();
    },

    /**
     * Listener for visibility changes.
     * Sets preview pane's background color to the current color,
     * when the popup is visible.
     *
     * @param e {qx.event.type.Data} Incoming event object
     */
    _onChangeVisibility : function(e) {
      if (this.getVisibility() == "visible")
      {
        var red = this.getRed();
        var green = this.getGreen();
        var blue = this.getBlue();
        var color = null;

        if (red !== null || green !== null || blue !== null) {
          color = qx.util.ColorUtil.rgbToRgbString([red, green, blue]);
        }

        this.getChildControl("selected-preview").setBackgroundColor(color);
        this.getChildControl("current-preview").setBackgroundColor(color);
      }
    },

    /**
     * @lint ignoreReferenceField(_tables)
     */
    _tables :
    {
      core :
      {
        label : qx.locale.Manager.tr("Basic Colors"),
        values : [ "#000", "#333", "#666", "#999", "#CCC", "#FFF", "red", "green", "blue", "yellow", "teal", "maroon" ]
      },

      recent :
      {
        label : qx.locale.Manager.tr("Recent Colors"),
        values : [ ]
      }
    }
  },


  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    if (this.__colorSelectorWindow) {
      this.__colorSelectorWindow.destroy();
      this.__colorSelector.destroy();
      this.__buttonBar.destroy();
    }
    this._tables = this.__boxes = null;
  }
});
