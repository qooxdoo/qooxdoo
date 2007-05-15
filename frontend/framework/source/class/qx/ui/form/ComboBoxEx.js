/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * David Perez Carmona (david-perez), based on qx.ui.form.ComboBox

************************************************************************ */

/* ************************************************************************

#module(ui_comboboxex)
#embed(qx.icontheme/16/actions/edit-find.png)
#embed(qx.icontheme/16/actions/dialog-ok.png)
#embed(qx.icontheme/16/actions/dialog-cancel.png)

************************************************************************ */

/**
 * An enhanced combo-box for qooxdoo.
 *
 * <p>Features:</p>
 * <ul>
 * <li>Editable text field</li>
 * <li>Complete key-navigation</li>
 * <li>Mouse wheel navigation</li>
 * <li>Multicolumn display in list</li>
 * <li>By default, if more than one column, headers are automatically shown</li>
 * <li>Can show the ID and/or description of each list item</li>
 * <li>Automatically calculating needed width</li>
 * <li>Popup list always shows full contents, and can be wider than text field</li>
 * <li>Search values through popup dialog</li>
 * <li>Internationalization support of messages</li>
 * <li>List resizeable by the end user both in width and height, by using the mouse</li>
 * <li>Lazy creation of the popup, sometimes in a form with a lot of combos,
 *     only a subset of them are used by the end user.</li>
 * <li>Quite configurable</li>
 * </ul>
 * <p>Pending features:</p>
 * <ul>
 * <li>Images inside the list</li>
 * <li>Autocomplete on key input</li>
 * </ul>
 *
 * @appearance combo-box-ex-list {qx.ui.table.Table}
 * @appearance combo-box-ex-popup {qx.ui.popup.Popup}
 * @appearance combo-box-ex-text-field {qx.ui.form.TextField}
 * @appearance combo-box-ex-button {qx.ui.basic.Atom}
 * @state pressed {combo-box-ex-button}
 */
qx.Class.define("qx.ui.form.ComboBoxEx",
{
  extend : qx.ui.layout.HorizontalBoxLayout,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    // Textfield
    var f = this._field = new qx.ui.form.TextField;
    f.setAppearance('combo-box-ex-text-field');
    f.addEventListener("input", this._oninput, this);
    this.add(f);
    this.setEditable(false);

    // Button
    // Use qx.ui.basic.Atom instead of qx.ui.form.Button here to omit the registration
    // of the unneeded and complex button events.
    var b = this._button = new qx.ui.basic.Atom();

    b.set(
    {
      appearance : "combo-box-ex-button",
      tabIndex   : -1,
      allowStretchY : true,
      height : null
    });

    this.add(b);

    // Events
    this.addEventListener("mousedown", this._onmousedown);
    this.addEventListener("mouseup", this._onmouseup);
    this.addEventListener("mousewheel", this._onmousewheel);

    this.addEventListener("dblclick", function()
    {
      if (this.getAllowSearch()) {
        this.openSearchDialog();
      }
    });

    this.addEventListener("keydown", this._onkeydown);
    this.addEventListener("keypress", this._onkeypress);
    this.addEventListener("beforeDisappear", this._closePopup);

    // Initialize properties
    this.initWidth();
    this.initHeight();
    this.initTabIndex();
  },




  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events: {
    "beforeInitialOpen" : "qx.event.type.Event"
  },



  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /*
    ---------------------------------------------------------------------------
      PROPERTIES
    ---------------------------------------------------------------------------
    */

    appearance :
    {
      refine : true,
      init : "combo-box-ex"
    },

    allowStretchY :
    {
      refine : true,
      init : false
    },

    height :
    {
      refine : true,
      init : "auto"
    },

    width :
    {
      refine : true,
      init : "auto"
    },

    tabIndex :
    {
      refine : true,
      init : 1
    },



    /**
     * Is the text field component editable or the user can only select
     * from the list?
     */
    editable :
    {
      check : "Boolean",
      apply : "_modifyEditable",
      event : "changeEditable"
    },

    /** 0 based. -1 means no selected index.  It retrieves always the value column of the selection, not the description. */
    value :
    {
      check : "String",
      nullable : true,
      apply : "_modifyValue",
      event : "changeValue"
    },

    /** How many items to transverse with PageUp and PageDn. */
    pagingInterval :
    {
      check : "Integer",
      init : 10
    },

    /** Show the ID column (column 0) of the selection data? */
    idColumnVisible :
    {
      check : "Boolean",
      init : false,
      apply : "_recreateList" //"_modifyIdColumnVisible"
    },

    /** Only used when editable is false.  It determines what to show in the text field of the combo box. */
    showOnTextField :
    {
      init : 'description',
      check : [ 'description', 'idAndDescription', 'id' ],
      apply : "_modifyShowOnTextField"
    },

    /** Only used when editable is false and showOnTextField=='idAndDescription'. */
    idDescriptionSeparator :
    {
      check : "String",
      init : '- ',
      apply : "_modifyIdDescriptionSeparator"
    },

    /** Ensures that always an item is selected (in case the selection isn't empty). Only used when editable is false. */
    ensureSomethingSelected :
    {
      check : "Boolean",
      init : true
    },

  /** Show column headers in the popup list?.  Default value is "Auto" and means to show headers if there is more than one visible column.*/
    showColumnHeaders :
    {
      check : [ "always", "never", "auto" ],
      init: "auto",
      apply : "_modifyShowColumnHeaders"
    },

    /** Allow the search dialog when double clicking the combo, or pressing special keys?. */
    allowSearch :
    {
      check : "Boolean",
      init : true
    },

    /** Maximum number of visible rows in the popup list. */
    maxVisibleRows :
    {
      check : "Integer",
      init : 10,
      apply : "_invalidateDimensions"  // Invalidate this._list.height
    },

    /** The header of each column in the list. */
    columnHeaders :
    {
        check: "Array",
        init: [ qx.locale.Manager.tr("ID"), qx.locale.Manager.tr("Description") ],
        apply: "_recreateList"
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
      UTILITIES
    ---------------------------------------------------------------------------
    */

    /**
     * Returns a reference to the popup component.
     *
     * @type member
     * @return {var} undefined if the popup component isn't created.  The popup is lazy created when displayed.
     */
    getPopup : function() {
      return this._popup;
    },


    /**
     * Returns a reference to the popup list.
     *
     * @type member
     * @return {qx.ui.table.Table} undefined if hasn't been created yet.  The list is lazy created when displayed.
     */
    getList : function() {
      return this._list;
    },


    /**
     * Returns a reference to the field.
     *
     * @type member
     * @return {qx.ui.core.Widget} label or textbox, depending if the combo is editable or not.
     */
    getField : function() {
      return this._field;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getButton : function() {
      return this._button;
    },


    /**
     * Gets the current selected row of the selection.
     *
     * @type member
     * @return {var} null if nothing selected or an array
     */
    getSelectedRow : function()
    {
      var ind = this.getSelectedIndex();
      return ind < 0 ? null : this.getSelection()[ind];
    },


    /**
     * Creates the list component.
     *
     * @type member
     * @param columns {var} TODOC
     * @return {void}
     */
    _createList : function()
    {
      if (!this._popup)
      {
        return;
      }
      var model = new qx.ui.table.SimpleTableModel;

      // Default column titles
      model.setColumns(this.getColumnHeaders());
      var l = this._list = new qx.ui.table.Table(model, {
        tableColumnModel : function(obj) {
          return new qx.ui.table.ResizeTableColumnModel(obj);
        }
      });
      l.setFocusedCell = function() {};
      l.setAppearance('combo-box-ex-list');
      l.setLocation(0, 0);
      l.setStatusBarVisible(false);
      l.setColumnVisibilityButtonVisible(false);
      //l.setKeepFirstVisibleRowComplete(false);

      var selMan = l._getSelectionManager();
      var oldHandle = selMan.handleMouseUp, me = this;

      selMan.handleMouseUp = function(vItem, e)
      {
        oldHandle.apply(selMan, arguments);

        if (e.isLeftButtonPressed()) {
          me._closePopup();
        }
      };

      this._modifyIdColumnVisible(this.getIdColumnVisible());
      this._manager = l.getSelectionModel();
      this._manager.addEventListener('changeSelection', this._onChangeSelection, this);

      // Avoid deselection from user
      this._manager.removeSelectionInterval = function() {};
      this._manager.setSelectionMode(qx.ui.table.SelectionModel.SINGLE_SELECTION);
      this._popup.add(l);

      this._invalidateDimensions();

      if (this._data)
      {
        this.setSelection(this._data);
      }
    },

    /**
     * Forces the list to be recreated next time.
     * @return {void}
     */
    _recreateList: function()
    {
      this._closePopup();
      this._popup && this._popup.removeAll();
      this._disposeObjects("_popup", "_list", "_manager");
    },

    /**Invalidate the calculated of dimensions
     * @return {void}*/
    _invalidateDimensions: function()
    {
      delete this._calcDimensions;
    },


    /*
    ---------------------------------------------------------------------------
      PSEUDO-PROPERTIES
    ---------------------------------------------------------------------------
    */

    /**
     * Sets the list of selectable items.
     *
     * @type member
     * @param data {var[][]} Array of values.  Its value is an array, with the following info:<ul>.
     *    <li>Column 0 represents the ID, i.e. the value that is stored internally and used by the app.</li>
     *    <li>Column 1 represents the description, the text that the end user normally sees.</li>
     *    <li>Columns > 1 will also be shown in the popup list, it you have set the appropiate column headers with the property {@link #columnHeaders}.</li>
     *    </ul>
     * @param newValue {String} optional, the new value to set.
     *                     If not specified or null, it will try to preserve the previous value.
     *                     Only used for non-editable combos
     * @return {void}
     */
    setSelection : function(data, newValue)
    {
      this._data = data;
      // Invalidate calculation of column widths
      this._invalidateDimensions();
      if (this._list)
      {
        this._list.getTableModel().setData(data);

        // Try to preserve currently selected value
        if (!this.getEditable())
        {
          if (newValue != null && newValue != this.getValue()) {
            this.setValue(newValue);
          }
          else
          {
            // Checks if the value is in the list, and recalculates the selected index
            this._modifyValue(this.getValue());
          }
        }
      }
    },


    /**
     * Getter for {@link #setSelection}.
     *
     * @type member
     * @return {Array} the list of selectable items.
     */
    getSelection : function() {
      return this._data || [];
    },


    /**
     * Sets the index of the currently selected item in the list.
     *
     * @type member
     * @param index {number} -1 means no selected index
     * @return {void}
     */
    setSelectedIndex : function(index)
    {
      var items = this.getSelection().length;

      if (items >= 0)
      {
        if (index < 0 && !this.getEditable() && this.getEnsureSomethingSelected())
        {
          index = 0;
        }

        if (index >= 0)
        {
          index = qx.lang.Number.limit(index, 0, items - 1);
          if (this._manager)
          {
            this._manager.setSelectionInterval(index, index);
            this._popup.isSeeable() && this._list.scrollCellVisible(0, index);
          }
          else
          {
            // List not created yet
            this._onChangeSelection(index);
          }
        }
        else
        {
          this._manager && this._manager.clearSelection();
        }
      }
    },


    /**
     * Getter for {@link #setSelectedIndex}.
     *
     * @type member
     * @return {number} -1 if nothing selected or >=0.
     */
    getSelectedIndex : function()
    {
      if (this._manager)
      {
        var index = this._manager.getAnchorSelectionIndex();
        return this._manager.isSelectedIndex(index) ? index : -1;
      }
      else
      {
        // List not created yet
        var data = this.getSelection(), val = this.getValue();
        for (var i = 0; i < data.length; i++)
        {
          if (data[i][0] == val)
          {
            return i;
          }
        }
        return -1;
      }
    },




    /*
    ---------------------------------------------------------------------------
      MODIFIER
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param propVal {var} TODOC
     * @return {Boolean} TODOC
     */
    _modifyShowOnTextField : function(propVal)
    {
      if (!this.getEditable())
      {
        this.setSelectedIndex(this.getSelectedIndex());
        this._invalidateDimensions(); // Invalidate this._neededTextFieldWidth
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @return {Boolean}
     */
    _checkIdDescriptionSeparator : function(propVal)
    {
      // For measuring widths, it is better to replace spaces with non-breakable spaces
      return String(propVal).replace(/ /g, '\u00A0');
    },


    /**
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @return {void}
     */
    _modifyIdDescriptionSeparator : function(propVal)
    {
      if (!this.getEditable() && this.getShowOnTextField() == 'idAndDescription')
      {
        this.setSelectedIndex(this.getSelectedIndex());
        this._invalidateDimensions(); // Invalidate this._neededTextFieldWidth
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @return {void}
     */
    _modifyIdColumnVisible : function(propVal)
    {
      if (this._list)
      {
        this._list.getTableColumnModel().setColumnVisible(0, propVal);
        this._invalidateDimensions();
      }
    },

    /**
     * Post-processing after property showColumnHeaders changes.
     *
     * @type member
     * @param propValue {var} Current value
     * @return {void}
     */
    _modifyShowColumnHeaders: function(propVal)
    {
      if (this._list)
      {
        this.hasHeaders = propVal == 'always' || propVal == 'auto' && this._list.getTableColumnModel().getVisibleColumnCount() > 1;
        this._list.getPaneScroller(0).getHeader().setHeight(this.hasHeaders ? 'auto' : 1);
      }
    },

    /**
     * Post-processing after property editable changes.
     *
     * @type member
     * @param propValue {var} Current value
     * @return {void}
     */
    _modifyEditable : function(propValue) /* , propOldValue, propData */
    {

      var f = this._field;
      f.setReadOnly(!propValue);
      f.setCursor(propValue ? null : "default");
      // When turning off editable, maybe the current value isn't valid
      /*if (!propValue && this._list)
      {
        this.setValue(this.getValue());
      }*/
    },


    /**
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @return {Boolean} TODOC
     */
    _modifyValue : function(propValue/*, propOldValue, propData */)
    {
      this._fromValue = true;
      try
      {
        var values = this.getSelection();
        var i = -1;

        if (propValue != null)
        {
          for (var i=0; i<values.length; i++)
          {
            if (propValue == values[i][0]) {
              break;
            }
          }
          if (i == values.length) {
            i = -1;
          }
        }
        if (this.getEditable()) {
          this._field.setValue(propValue);
        }
        // only do this if we called setValue separately
        // and not from the property "selected".
        if (!this._fromSelected) {
          this.setSelectedIndex(i);
        }
      }
      finally
      {
        // reset hint
        delete this._fromValue;
      }
    },




    /*
    ---------------------------------------------------------------------------
      POPUP HELPER
    ---------------------------------------------------------------------------
    */
    _oldSelected : null,

    /**
     * Creates the popup if necessary with its list.
     *
     * @type member
     * @return {void}
     */
    _createPopup: function()
    {
      var p = this._popup;
      if (!p)
      {
        var p = this._popup = new qx.ui.resizer.ResizeablePopup;
        p.auto();
        p.setAppearance('combo-box-ex-popup');
        p.addEventListener("appear", this._onpopupappear, this);
        this.createDispatchEvent("beforeInitialOpen");
      }
      if (!this._list)
      {
        this._createList();
      }
    },


    /**
     * Opens the popup (and creates it if necessary).
     *
     * @type member
     * @return {void}
     */
    _openPopup : function()
    {
      if (this.isSearchInProgress() || !this.getSelection().length)
      {
        return;
      }
      this._createPopup();
      var p = this._popup;
      var el = this.getElement();
      p.positionRelativeTo(el, 1, qx.html.Dimension.getBoxHeight(el));
      this._calculateDimensions();
      // For aesthetic purposes, make the list width at least the width of the combo.
      p.set({
        autoHide: false,
        minWidth : this.getWidthValue(),
        parent: this.getTopLevelWidget()
      });
      p.show();
      this._oldSelected = this.getSelectedIndex();

      window.setInterval(function() {
        p.setAutoHide(true);
      }, 0);
    },


    /**
     * Hide the popup list.
     *
     * @type member
     * @return {void}
     */
    _closePopup : function() {
      this._popup && this._popup.hide();
    },


    /**
     * Toggle the visibility of the popup list.
     *
     * @type member
     * @return {void}
     */
    _togglePopup : function() {
      this._popup && this._popup.isSeeable() ? this._closePopup() : this._openPopup();
    },




    /*
    ---------------------------------------------------------------------------
      DIMENSIONING
    ---------------------------------------------------------------------------
    */

    /**
     * Sizes the width of the text field component to the needed value to show any selection item.
     *
     * @type member
     * @return {void}
     */
    sizeTextFieldToContent : function()
    {
      this._createPopup();
      this._calculateDimensions();
      this._field.setWidth(this._neededTextFieldWidth);
    },


    /**
     * Calculates the needed dimensions for the text field and list components.
     * PRECONDITION: the _list must be created.
     * @type member
     * @return {void}
     */
    _calculateDimensions : function()
    {
      if (this._calcDimensions)
      {
        // Already calculated
        return;
      }
      var data = this.getSelection();
      var cols = this.getColumnHeaders(), nCols = cols.length;
      var columnWidths = [];
      this._neededTextFieldWidth = 0;
      columnWidths.length = cols.length;

      for (var col=0; col<cols.length; col++) {
        columnWidths[col] = 0;
      }

      for (var row=0, rows=Math.min(data.length, 50); row<rows; row++)
      {
        var r = data[row], wi0, wi1;

        for (col=0; col<nCols; col++)
        {
          var wi = this._getTextWidth(r[col]);

          if (col == 0) {
            wi0 = wi;
          } else if (col == 1) {
            wi1 = wi;
          }

          columnWidths[col] = Math.max(wi, columnWidths[col]);
        }

        var wi = 0;
        switch (this.getShowOnTextField())
        {
          case 'idAndDescription':
           wi = wi0+wi1;
           break;
          case 'id':
           wi = wi0;
           break;
          case 'description':
           wi = wi1;
           break;
          default:
            this.warn('unexpected '+this.getShowOnTextField());
        }
        this._neededTextFieldWidth = Math.max(this._neededTextFieldWidth, wi);
      }

      if (this.getShowOnTextField() == 'idAndDescription') {
        this._neededTextFieldWidth += this._getTextWidth(this.getIdDescriptionSeparator());
      }

      this._neededTextFieldWidth += 8; /* Extra margins */

      var maxRows = this.getMaxVisibleRows(),

      // Only assign room for the vertical scrollbar when needed
      width = data.length > maxRows ? (new qx.ui.core.ScrollBar)._getScrollBarWidth() : 0, colModel = this._list.getTableColumnModel();

      this._modifyShowColumnHeaders(this.getShowColumnHeaders());
      var beh = this._list.getTableColumnModel().getBehavior();

      // ##Size each column
      for (col=0; col<nCols; col++)
      {
        if (colModel.isColumnVisible(col))
        {
          var w = columnWidths[col];
          // Set by _modifyShowColumnHeaders
          if (this.hasHeaders)
          {
            w = Math.max(w, this._getTextWidth(cols[col]));
          }
          w += 8;
          beh.setWidth(col, w+'*');
          width += w;
        }
      }
      // ##Final width and height
      var borderObj = qx.manager.object.BorderManager.getInstance().resolveDynamic(this._popup.getBorder());
      this._popup.set({
          width : borderObj.getWidthLeft()+width+borderObj.getWidthRight(),
          height: this._getPopupHeight(maxRows),
          minHeight: this._getPopupHeight(1)
      });

      // This denotes dimensions are already calculated
      this._calcDimensions = true;
    },

    _getPopupHeight: function(rows)
    {
      var borderObj = qx.manager.object.BorderManager.getInstance().resolveDynamic(this._popup.getBorder());
      return borderObj.getWidthTop()+ this._list.getRowHeight() * Math.min(rows, (this.hasHeaders ? 1 : 0) + this.getSelection().length) +
         2 + (this.hasHeaders ? 2 : 0) + borderObj.getWidthBottom();
    },


    /**
     * Calculates the width of the given text.
     *  The default font is used.
     *
     * @type member
     * @param text {var} TODOC
     * @return {Integer} TODOC
     */
    _getTextWidth : function(text)
    {
      var lab = new qx.ui.basic.Label(text);
      var res = lab.getPreferredBoxWidth();
      lab.dispose();
      return res;
    },




    /*
    ---------------------------------------------------------------------------
      SEARCHING
    ---------------------------------------------------------------------------
    */

    /**
     * Does this combo have the searched dialog open?
     *
     * @type member
     * @return {Boolean}
     */
    isSearchInProgress : function() {
      return this._popup && this._list && !this._popup.contains(this._list);
    },


    /**
     * Searches the given text.  Called from the search dialog.
     *
     * @type member
     * @param startIndex {number} Start index, 0 based
     * @param txt {String} Text to find
     * @param caseSens {Boolean} Case sensivity flag.
     * @return {void}
     */
    _search : function(startIndex, txt, caseSens)
    {
      if (txt == null || !txt.length) {
        return;
      }
      startIndex = Math.max(startIndex, 0);
      var row = startIndex, nCols = this._list.getTableModel().getColumnCount(), nRows = this.getSelection().length, data = this.getSelection();

      if (!caseSens) {
        txt = txt.toLowerCase();
      }

      var colModel = this._list.getTableColumnModel();

      while (true)
      {
        var dataRow = data[row];

        if (dataRow)
        {
          for (var col=0; col<nCols; col++)
          {
            if (colModel.isColumnVisible(col))
            {
              var txtCol = dataRow[col];

              if (!caseSens) {
                txtCol = txtCol.toLowerCase();
              }

              if (txtCol.indexOf(txt) >= 0)
              {
                this._manager.setSelectionInterval(row, row);
                this._list.scrollCellVisible(1, row);
                return;
              }
            }
          }
        }

        row = (row + 1) % nRows;

        if (row == startIndex) {
          break;
        }
      }
    },


    /**
     * Opens a popup search dialog, useful when the combo has a lot of items.
     *  This dialog is triggered by double clicking the combo, pressing F3 or Ctrl+F.
     *
     * @type member
     * @return {void}
     */
    openSearchDialog : function()
    {
      var sel = this.getSelection();

      if (!sel || !sel.length || this.isSearchInProgress()) {
        return;
      }

      this._closePopup();
      // Force the list to be created
      this._createPopup();
      this._calculateDimensions();

      var me = this, oldSelectedIndex = this.getSelectedIndex(), startIndex = oldSelectedIndex;

      // ###searchField
      function search() {
        me._search(startIndex, searchField.getComputedValue(), checkCase.isChecked());
      }

      var searchField = new qx.ui.form.TextField;

      searchField.set(
      {
        minWidth : this._field.getWidth(),
        width    : '100%'
      });

      searchField.addEventListener("input", function() {
        search();
      });

      // ###checkCase
      var checkCase = new qx.ui.form.CheckBox(this.tr("Case sensitive"));

      checkCase.set(
      {
        horizontalAlign : 'center',
        marginBottom    : 4
      });

      // ###vbox
      var vbox = new qx.ui.layout.VerticalBoxLayout;

      vbox.set(
      {
        spacing                 : 6,
        horizontalChildrenAlign : 'center',
        height                  : '100%'
      });

      vbox.auto();
      vbox.add(searchField, checkCase);

      // ###list, we reuse the same list in the popup
      var newListSettings =
      {
        height : this._popup.getHeightValue(),
        width  : this._popup.getWidthValue(),
        border : "inset",
        parent : vbox
      };

      // Save old list settings
      var oldListSettings = {};

      for (var prop in newListSettings)
      {
        // TODO: Access to private member (bad style) - please correct
        oldListSettings[prop] = this._list[qx.core.LegacyProperty.getGetterName(prop)]();
      }

      this._list.set(newListSettings);

      // ###buttons
      var butNext = new qx.ui.form.Button('', 'icon/16/actions/edit-find.png');
      butNext.set({ toolTip : new qx.ui.popup.ToolTip(this.tr("Search next occurrence")) });

      butNext.addEventListener("execute", function()
      {
        startIndex = (this.getSelectedIndex() + 1) % sel.length;
        search();
      },
      this);

      var butOk = new qx.ui.form.Button('', 'icon/16/actions/dialog-ok.png');

      butOk.addEventListener('execute', function()
      {
        oldSelectedIndex = null;
        win.close();
      },
      this);

      var butCancel = new qx.ui.form.Button('', 'icon/16/actions/dialog-cancel.png');

      butCancel.addEventListener('execute', function() {
        win.close();
      }, this);

      var butBox = new qx.ui.layout.VerticalBoxLayout;
      butBox.auto();
      butBox.set({ spacing : 10 });
      butBox.add(butNext, butOk, butCancel);

      // ###hbox
      var hbox = new qx.ui.layout.BoxLayout;
      hbox.auto();
      hbox.setPadding(10);

      hbox.set(
      {
        spacing   : 8,
        minHeight : 'auto',
        height    : '100%'
      });

      hbox.add(vbox, butBox);

      // ###Window
      var win = new qx.ui.window.Window(this.tr("Search items in list"), 'icon/16/actions/edit-find.png');
      win.add(hbox);
      win.positionRelativeTo(this);

      win.set(
      {
        autoHide      : true,
        allowMaximize : false,
        showMaximize  : false,
        allowMinimize : false,
        showMinimize  : false
      });

      win.addEventListener("appear", function() {
        searchField.focus();
      });

      win.addEventListener("disappear", function()
      {
        if (oldSelectedIndex != null)
        {
          // Hit Cancel button
          this.setSelectedIndex(oldSelectedIndex);
        }

        this._list.set(oldListSettings);
        this.focus();
      },
      this);

      win.addEventListener("keydown", function(e)
      {
        switch(e.getKeyIdentifier())
        {
          case "Enter":
            butOk.createDispatchEvent('execute');
            break;

          case "Escape":
            butCancel.createDispatchEvent('execute');
            break;

          case "F3":
            butNext.createDispatchEvent('execute');
            break;

          default:
            return;
        }

        e.preventDefault();
      },
      this);

      win.auto();
      win.addToDocument();
      win.open();
    },




    /*
    ---------------------------------------------------------------------------
      OTHER EVENT HANDLER
    ---------------------------------------------------------------------------
    */

    /**
     * Event handler from changing the selected index.
     *
     * @type member
     * @param e {var} event or row index (when called from {@link #setSelectedIndex()}).
     * @return {void}
     */
    _onChangeSelection : function(e)
    {
      this._fromSelected = true;
      try
      {
        // only do this if we called setValue separately
        // and not from the event "input".
        if (!this._fromInput)
        {
          var index = typeof e == 'number' ? e:this.getSelectedIndex();

          if (index >= 0) {
            var row = this.getSelection()[index];
          }

          if (row || !this.getEditable()) {
            this.setValue(row && row[0]);
          }

          // In case of editable, this.setValue() already calls this._field.setValue()
          if (!this.getEditable())
          {
            var val = "";
            if (row)
            {
              switch (this.getShowOnTextField())
              {
                case 'idAndDescription':
                 val = row[0] + this.getIdDescriptionSeparator() + row[1];
                break;
                case 'id':
                 val = row[0];
                 break;
                case 'description':
                 val = row[1];
                 break;
                default:
                  this.warn('unexpected '+this.getShowOnTextField());
              }
            }
            this._field.setValue(val);
          }
        }
      }
      finally
      {
        // reset hint
        delete this._fromSelected;
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onpopupappear : function(e)
    {
      var index = this.getSelectedIndex();

      if (index >= 0) {
        this._list.scrollCellVisible(0, index);
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _oninput : function(e)
    {
      // Hint for modifier
      this._fromInput = true;
      this.setValue(this._field.getComputedValue());
      delete this._fromInput;
    },




    /*
    ---------------------------------------------------------------------------
      MOUSE EVENT HANDLER
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onmousedown : function(e)
    {
      switch(e.getTarget())
      {
        case this._field:
          if (this.getEditable()) {
            break;
          }

          // no break here

        case this._button:
          this._button.addState("pressed");
          this._togglePopup();

          // Assure we receive the mouse up event
          this.setCapture(true);
          break;
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onmouseup : function(e)
    {
      switch(e.getTarget())
      {
        case this._field:
          if (this.getEditable()) {
            break;
          }

          // no break here

        default:
          this._button.removeState("pressed");
          break;
      }

      this.setCapture(false);
    },


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onmousewheel : function(e)
    {
      if (!this._popup || !this._popup.isSeeable())
      {
        this.setSelectedIndex(Math.max(0, this.getSelectedIndex() + (e.getWheelDelta() < 0 ? -1 : 1)));
      }
    },




    /*
    ---------------------------------------------------------------------------
      KEY EVENT HANDLER
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onkeydown : function(e)
    {
      var vVisible = this._popup && this._popup.isSeeable();

      switch(e.getKeyIdentifier())
      {
        case "Enter":
          if (vVisible)
          {
            this._closePopup();
            this.setFocused(true);
          }
          else
          {
            this._openPopup();
          }

          break;

        case "Escape":
          if (vVisible)
          {
            this.setSelectedIndex(this._oldSelected);
            this._closePopup();
            this.setFocused(true);
          }

          break;

        case "Home":
          this.setSelectedIndex(0);
          break;

        case "End":
          var items = this.getSelection().length;

          if (items) {
            this.setSelectedIndex(items - 1);
          }

          break;

        case "Down":
          if (e.isAltPressed()) {
            this._togglePopup();
          }

          break;

        case "F3":
          if (this.getAllowSearch()) {
            this.openSearchDialog();
          }

          break;

        case "F":
          if (e.isCtrlPressed())
          {
            if (this.getAllowSearch()) {
              this.openSearchDialog();
            }

            break;
          }

          return;

        default:
          if (vVisible) {
            this._list.dispatchEvent(e);
          }

          return;
      }

      e.preventDefault();
    },


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onkeypress : function(e)
    {
      var vVisible = this._popup && this._popup.isSeeable();

      switch(e.getKeyIdentifier())
      {
        case "Up":
          this.setSelectedIndex(Math.max(0, this.getSelectedIndex() - 1));
          break;

        case "Down":
          this.setSelectedIndex(Math.max(0, this.getSelectedIndex() + 1));
          break;

        case "PageUp":
          this.setSelectedIndex(Math.max(0, this.getSelectedIndex() - this.getPagingInterval()));
          break;

        case "PageDown":
          this.setSelectedIndex(this.getSelectedIndex() + this.getPagingInterval());
          break;

        default:
          if (vVisible) {
            this._list.dispatchEvent(e);
          }

          return;
      }

      e.preventDefault();

      if (!this.isEditable() && this._list.isSeeable()) {
        this._list.dispatchEvent(e);
      }
    },




    /*
    ---------------------------------------------------------------------------
      FOCUS HANDLING
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @return {Boolean} TODOC
     */
    _visualizeBlur : function()
    {
      // Force blur, even if mouseFocus is not active because we
      // need to be sure that the previous focus rect gets removed.
      // But this only needs to be done, if there is no new focused element.
      if (qx.core.Variant.isSet("qx.client", "mshtml"))
      {
        if (this.getEnableElementFocus() && !this.getFocusRoot().getFocusedChild())
        {
          try
          {
            if (this.getEditable()) {
              this.getField().getElement().blur();
            } else {
              this.getElement().blur();
            }
          }
          catch(ex) {}
        }
      }
      else
      {
        if (this.getEnableElementFocus())
        {
          try
          {
            if (this.getEditable()) {
              this.getField().getElement().blur();
            } else if (!this.getFocusRoot().getFocusedChild()) {
              this.getElement().blur();
            }
          }
          catch(ex) {}
        }
      }

      this.removeState("focused");
      return true;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {Boolean} TODOC
     */
    _visualizeFocus : function()
    {
      if (!qx.event.handler.FocusHandler.mouseFocus && this.getEnableElementFocus())
      {
        try
        {
          if (this.getEditable())
          {
            this.getField().getElement().focus();
            this.getField()._ontabfocus();
          }
          else
          {
            this.getElement().focus();
          }
        }
        catch(ex) {}
      }

      this.addState("focused");
      return true;
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    // If this is not a page unload, we have to reset the parent. Otherwise,
    // disposing a ComboBox that was clicked at least once would mean that
    // the popup is still referenced by the parent. When an application
    // repeatedly creates and disposes ComboBoxes, this would mean a memleak
    // (and it would also mess with other things like focus management).
    if (this._popup && !qx.core.Object.inGlobalDispose()) {
      this._popup.setParent(null);
    }

    this._disposeObjects("_popup", "_list", "_manager", "_field", "_button");
  }
});
