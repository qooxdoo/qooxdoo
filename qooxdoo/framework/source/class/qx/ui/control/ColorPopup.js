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


************************************************************************ */

/* ************************************************************************

#asset(qx/icon/${qx.icontheme}/16/actions/dialog-cancel.png)
#asset(qx/icon/${qx.icontheme}/16/actions/dialog-ok.png)

************************************************************************ */


/**
 * A popup which contains paletts of colors and the possibility to open the
 * Colorselector to choose a color.
 */
qx.Class.define("qx.ui.control.ColorPopup",
{
  extend : qx.ui.popup.Popup,

  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);
    
    this.setLayout(new qx.ui.layout.VBox(5));

    this._createAutoBtn();
    this._createBoxes();

    this._createPreview();
    this._createSelectorBtn();
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
      init : 0,
      nullable : true,
      event : "changeRed"
    },

    /** The numeric green value of the selected color. */
    green :
    {
      check : "Number",
      init : 0,
      nullable : true,
      event : "changeGreen"
    },

    /** The numeric blue value of the selected color. */
    blue :
    {
      check : "Number",
      init : 0,
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
    __automaticBtn : null,
    __boxes : null,
    __previewBox : null,
    __selectedPreview : null,
    __currentPreview : null,
    __selectorButton : null,
    __colorSelectorWindow : null,
    __colorSelector : null,
    __recentTableId : "recent",
    __fieldNumber : 12,
        

    /*
    ---------------------------------------------------------------------------
      CREATOR SUBS
    ---------------------------------------------------------------------------
    */

    /**
     * Creates the button labeled "Automatic"
     */
    _createAutoBtn : function()
    {
      this.__automaticBtn = new qx.ui.form.Button(this.tr("Automatic"));
      this.__automaticBtn.setAllowStretchX(true);
      this.__automaticBtn.addListener("execute", this._onAutomaticBtnExecute, this);

      this.add(this.__automaticBtn);
    },


    /**
     * Creates the GroupBoxes containing the colored fields.
     */
    _createBoxes : function()
    {
      this.__boxes = {};

      var tables = this._tables;
      var table, box, field;

      for (var tableId in tables)
      {
        table = tables[tableId];

        box = new qx.ui.groupbox.GroupBox(table.label);
        box.setLayout(new qx.ui.layout.HBox);

        this.__boxes[tableId] = box;
        this.add(box);

        for (var i=0; i<this.__fieldNumber; i++)
        {
          field = new qx.ui.container.Composite(new qx.ui.layout.Basic);

          field.set({
            appearance : "colorpopup/field",
            backgroundColor : table.values[i] || "white"
          });

          field.addListener("mousedown", this._onFieldMouseDown, this);
          field.addListener("mouseover", this._onFieldMouseOver, this);

          box.add(field);
        }
      }
    },


    /**
     * Creates the GroupBox containing the panes for the old and current color.
     */
    _createPreview : function()
    {
      this.__previewBox = new qx.ui.groupbox.GroupBox(this.tr("Preview (Old/New)"));
      this.__previewBox.setLayout(new qx.ui.layout.HBox);

      this.__selectedPreview = new qx.ui.container.Composite(new qx.ui.layout.Basic);
      this.__currentPreview = new qx.ui.container.Composite(new qx.ui.layout.Basic);
      
      this.__selectedPreview.set({
        appearance :"colorpopup/preview-pane",
        marginRight : 4
      });
        
      this.__currentPreview.set({
        appearance :"colorpopup/preview-pane",
        marginLeft : 4
      });

      this.__previewBox.add(this.__selectedPreview, {flex : 1});
      this.__previewBox.add(this.__currentPreview, {flex : 1});

      this.add(this.__previewBox);

    },


    /**
     * Creates the GroupBox containing the panes for the old and current color.
     */
    _createSelectorBtn : function()
    {
      this.__selectorButton = new qx.ui.form.Button(this.tr("Open ColorSelector"));
      this.__selectorButton.addListener("execute", this._onSelectorButtonExecute, this);
      this.add(this.__selectorButton);
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
      win.setLayout(new qx.ui.layout.VBox);
      win.setResizable(false);

      this.__colorSelector = new qx.ui.control.ColorSelector;
      this.__colorSelector.addListener("dialogok", this._onColorSelectorOk, this);
      this.__colorSelector.addListener("dialogcancel", this._onColorSelectorCancel, this);

      // Add container for content
      var contentContainer = new qx.ui.container.Composite(new qx.ui.layout.VBox(20));
      contentContainer.set({
        appearance : "window-pane-content"
      });
      win.add(contentContainer, {flex:1});
      
      var buttonBar = new qx.ui.container.Composite(new qx.ui.layout.HBox(4, "right"));      
      buttonBar.setPaddingTop(3);
      win.add(buttonBar);

      var btnCancel = new qx.ui.form.Button(this.tr("Cancel"), "icon/16/actions/dialog-cancel.png"); 
      btnCancel.addListener("execute", function(e){
         this.fireEvent("dialogcancel");
      }, this.__colorSelector);

      var btnOk = new qx.ui.form.Button(this.tr("OK"), "icon/16/actions/dialog-ok.png"); 
      btnOk.addListener("execute", function(e){
         this.fireEvent("dialogok");
      }, this.__colorSelector);

      buttonBar.add(btnCancel);
      buttonBar.add(btnOk);

      contentContainer.add(this.__colorSelector);
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

      this.__selectedPreview.setBackgroundColor(value);
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
     * Listener of mousedown event on a color field. Sets the ColorPoup's value
     * to field's color value and paint the preview pane.
     *
     * @param e {qx.event.type.Mouse} Incoming event object
     */
    _onFieldMouseDown : function(e)
    {
      var vValue = this.__currentPreview.getBackgroundColor();
      this.setValue(vValue);

      if (vValue) {
        this.hide();
      }
    },


    /**
     * Listener of mousemove event on a color field. Sets preview pane's
     * background color to the field's color value.
     *
     * @param e {qx.event.type.Mouse} Incoming event object
     */
    _onFieldMouseOver : function(e) {
      this.__currentPreview.setBackgroundColor(e.getTarget().getBackgroundColor());
    },

    /**
     * Listener of execute event on the "cancel" button.
     * Hides the ColorPopup and resets it's color value.
     *
     * @param e {qx.event.Command} Incoming event object
     */
    _onAutomaticBtnExecute : function(e)
    {
      this.setValue(null);
      this.hide();
    },


    /**
     * Listener of execute event on the "Open ColorSelector" button.
     * Opens a ColorSelector widget and hides the ColorPopup.
     *
     * @param e {qx.event.Command} Incoming event object
     */
    _onSelectorButtonExecute : function(e)
    {
      this._createColorSelector();

      this.__colorSelectorWindow.show();

      this.exclude();
      this.__colorSelectorWindow.open();
    },


    /**
     * Listener of execute event on the "OK" button.
     * Hides the ColorPopup and sets it's color value to the selected color.
     *
     * @param e {qx.event.Command} Incoming event object
     */
    _onColorSelectorOk : function(e)
    {
      var sel = this.__colorSelector;
      this.setValue(qx.util.ColorUtil.rgbToRgbString([sel.getRed(), sel.getGreen(), sel.getBlue()]));
      this.__colorSelectorWindow.close();
    },


    /**
     * Listener of execute event on the "Cancel" button.
     * Hides the ColorPopup.
     *
     * @param e {qx.event.Command} Incoming event object
     */
    _onColorSelectorCancel : function(e) {
      this.__colorSelectorWindow.close();
    },

    _tables :
    {
      core :
      {
        label : "Basic Colors",
        values : [ "#000", "#333", "#666", "#999", "#CCC", "#FFF", "red", "green", "blue", "yellow", "teal", "maroon" ]
      },

      recent :
      {
        label : "Recent Colors",
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
    this._disposeObjects("_layout", "__automaticBtn", "__previewBox", "_previewLayout",
      "__selectedPreview", "__currentPreview", "__selectorButton", "__colorSelectorWindow",
      "__colorSelector");

    this._disposeFields("_tables", "__boxes");
  }
});
