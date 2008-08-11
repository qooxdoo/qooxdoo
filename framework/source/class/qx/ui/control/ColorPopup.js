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

/** A color popup */
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
    appearance :
    {
      refine : true,
      init : "colorpopup"
    },

    value :
    {
      nullable : true,
      apply : "_applyValue",
      event : "changeValue"
    },

    red :
    {
      check : "Number",
      init : 0,
      nullable : true,
      event : "changeRed"
    },

    green :
    {
      check : "Number",
      init : 0,
      nullable : true,
      event : "changeGreen"
    },

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
    _minZIndex : 1e5,

    /*
    ---------------------------------------------------------------------------
      CREATOR SUBS
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _createAutoBtn : function()
    {
      this._automaticBtn = new qx.ui.form.Button(this.tr("Automatic"));
      this._automaticBtn.setAllowStretchX(true);
      this._automaticBtn.addListener("execute", this._onAutomaticBtnExecute, this);

      this.add(this._automaticBtn);
    },

    _recentTableId : "recent",
    _fieldNumber : 12,


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _createBoxes : function()
    {
      this._boxes = {};

      var tables = this._tables;
      var table, box, boxLayout, field;

      for (var tableId in tables)
      {
        table = tables[tableId];

        box = new qx.ui.groupbox.GroupBox(table.label);
        box.setLayout(new qx.ui.layout.HBox);

        this._boxes[tableId] = box;
        this.add(box);

        for (var i=0; i<this._fieldNumber; i++)
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
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _createPreview : function()
    {
      this._previewBox = new qx.ui.groupbox.GroupBox(this.tr("Preview (Old/New)"));
      this._previewBox.setLayout(new qx.ui.layout.HBox);

      this._selectedPreview = new qx.ui.container.Composite(new qx.ui.layout.Basic);
      this._currentPreview = new qx.ui.container.Composite(new qx.ui.layout.Basic);
      
      this._selectedPreview.set({
        appearance :"colorpopup/preview-pane",
        marginRight : 4
      });
        
      this._currentPreview.set({
        appearance :"colorpopup/preview-pane",
        marginLeft : 4
      });

      this._previewBox.add(this._selectedPreview, {flex : 1});
      this._previewBox.add(this._currentPreview, {flex : 1});

      this.add(this._previewBox);

    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _createSelectorBtn : function()
    {
      this._selectorButton = new qx.ui.form.Button(this.tr("Open ColorSelector"));
      this._selectorButton.addListener("execute", this._onSelectorButtonExecute, this);
      this.add(this._selectorButton);
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _createColorSelector : function()
    {
      if (this._colorSelector) {
        return;
      }

      var win = new qx.ui.window.Window(this.tr("Color Selector"));
      this._colorSelectorWindow = win;
      win.setLayout(new qx.ui.layout.VBox);
      win.setResizable(false);

      this._colorSelector = new qx.ui.control.ColorSelector;
      this._colorSelector.addListener("dialogok", this._onColorSelectorOk, this);
      this._colorSelector.addListener("dialogcancel", this._onColorSelectorCancel, this);

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
      }, this._colorSelector);

      var btnOk = new qx.ui.form.Button(this.tr("OK"), "icon/16/actions/dialog-ok.png"); 
      btnOk.addListener("execute", function(e){
         this.fireEvent("dialogok");
      }, this._colorSelector);

      buttonBar.add(btnCancel);
      buttonBar.add(btnOk);

      contentContainer.add(this._colorSelector);
    },

    /*
    ---------------------------------------------------------------------------
      APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     */
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

      this._selectedPreview.setBackgroundColor(value);
      this._rotatePreviousColors();
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _rotatePreviousColors : function()
    {
      
      if(!this._tables){
        return;
      }
      
      var vRecentTable = this._tables[this._recentTableId].values;
      var vRecentBox = this._boxes[this._recentTableId];

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
      } else if (vRecentTable.length == this._fieldNumber) {
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
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onFieldMouseDown : function(e)
    {
      var vValue = this._currentPreview.getBackgroundColor();
      this.setValue(vValue);

      if (vValue) {
        this.hide();
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onFieldMouseOver : function(e) {
      this._currentPreview.setBackgroundColor(e.getTarget().getBackgroundColor());
    },


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onAutomaticBtnExecute : function(e)
    {
      this.setValue(null);
      this.hide();
    },

    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onSelectorButtonExecute : function(e)
    {
      this._createColorSelector();
      
      var bounds = this._selectorButton.getBounds();

      this._colorSelectorWindow.show();

      this.exclude();
      this._colorSelectorWindow.open();
    },


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onColorSelectorOk : function(e)
    {
      var sel = this._colorSelector;
      this.setValue(qx.util.ColorUtil.rgbToRgbString([sel.getRed(), sel.getGreen(), sel.getBlue()]));
      this._colorSelectorWindow.close();
    },


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onColorSelectorCancel : function(e) {
      this._colorSelectorWindow.close();
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
    this._disposeObjects("_layout", "_automaticBtn", "_previewBox", "_previewLayout",
      "_selectedPreview", "_currentPreview", "_selectorButton", "_colorSelectorWindow",
      "_colorSelector");

    this._disposeFields("_tables", "_boxes");
  }
});
