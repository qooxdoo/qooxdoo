/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2006 STZ-IDA, Germany, http://www.stz-ida.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Til Schneider (til132)
     * Fabian Jakobs (fjakobs)
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */

/**
 * Table
 *
 * A detailed description can be found in the package description
 * {@link qx.ui.table}.
 *
 * @childControl statusbar {qx.ui.basic.Label} label to show the status of the table
 * @childControl column-button {qx.ui.table.columnmenu.Button} button to open the column menu
 */
qx.Class.define("qx.ui.table.Table",
{
  extend : qx.ui.core.Widget,
  include : qx.ui.core.MDragDropScrolling,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param tableModel {qx.ui.table.ITableModel ? null}
   *   The table model to read the data from.
   *
   * @param custom {Map ? null}
   *   A map provided to override the various supplemental classes allocated
   *   within this constructor.  Each property must be a function which
   *   returns an object instance, as indicated by shown the defaults listed
   *   here:
   *
   *   <dl>
   *     <dt>initiallyHiddenColumns</dt>
   *       <dd>
   *         {Array?}
   *         A list of column numbers that should be initially invisible. Any
   *         column not mentioned will be initially visible, and if no array
   *         is provided, all columns will be initially visible.
   *       </dd>
   *     <dt>selectionManager</dt>
   *       <dd><pre class='javascript'>
   *         function(obj)
   *         {
   *           return new qx.ui.table.selection.Manager(obj);
   *         }
   *       </pre></dd>
   *     <dt>selectionModel</dt>
   *       <dd><pre class='javascript'>
   *         function(obj)
   *         {
   *           return new qx.ui.table.selection.Model(obj);
   *         }
   *       </pre></dd>
   *     <dt>tableColumnModel</dt>
   *       <dd><pre class='javascript'>
   *         function(obj)
   *         {
   *           return new qx.ui.table.columnmodel.Basic(obj);
   *         }
   *       </pre></dd>
   *     <dt>tablePaneModel</dt>
   *       <dd><pre class='javascript'>
   *         function(obj)
   *         {
   *           return new qx.ui.table.pane.Model(obj);
   *         }
   *       </pre></dd>
   *     <dt>tablePane</dt>
   *       <dd><pre class='javascript'>
   *         function(obj)
   *         {
   *           return new qx.ui.table.pane.Pane(obj);
   *         }
   *       </pre></dd>
   *     <dt>tablePaneHeader</dt>
   *       <dd><pre class='javascript'>
   *         function(obj)
   *         {
   *           return new qx.ui.table.pane.Header(obj);
   *         }
   *       </pre></dd>
   *     <dt>tablePaneScroller</dt>
   *       <dd><pre class='javascript'>
   *         function(obj)
   *         {
   *           return new qx.ui.table.pane.Scroller(obj);
   *         }
   *       </pre></dd>
   *     <dt>tablePaneModel</dt>
   *       <dd><pre class='javascript'>
   *         function(obj)
   *         {
   *           return new qx.ui.table.pane.Model(obj);
   *         }
   *       </pre></dd>
   *     <dt>columnMenu</dt>
   *       <dd><pre class='javascript'>
   *         function()
   *         {
   *           return new qx.ui.table.columnmenu.Button();
   *         }
   *       </pre></dd>
   *   </dl>
   */
  construct : function(tableModel, custom)
  {
    this.base(arguments);
    //
    // Use default objects if custom objects are not specified
    //
    if (!custom) {
      custom = { };
    }

    if (custom.initiallyHiddenColumns) {
      this.setInitiallyHiddenColumns(custom.initiallyHiddenColumns);
    }

    if (custom.selectionManager) {
      this.setNewSelectionManager(custom.selectionManager);
    }

    if (custom.selectionModel) {
      this.setNewSelectionModel(custom.selectionModel);
    }

    if (custom.tableColumnModel) {
      this.setNewTableColumnModel(custom.tableColumnModel);
    }

    if (custom.tablePane) {
      this.setNewTablePane(custom.tablePane);
    }

    if (custom.tablePaneHeader) {
      this.setNewTablePaneHeader(custom.tablePaneHeader);
    }

    if (custom.tablePaneScroller) {
      this.setNewTablePaneScroller(custom.tablePaneScroller);
    }

    if (custom.tablePaneModel) {
      this.setNewTablePaneModel(custom.tablePaneModel);
    }

    if (custom.columnMenu) {
      this.setNewColumnMenu(custom.columnMenu);
    }

    this._setLayout(new qx.ui.layout.VBox());

    // Create the child widgets
    this.__scrollerParent = new qx.ui.container.Composite(new qx.ui.layout.HBox());
    this._add(this.__scrollerParent, {flex: 1});

    // Allocate a default data row renderer
    this.setDataRowRenderer(new qx.ui.table.rowrenderer.Default(this));

    // Create the models
    this.__selectionManager = this.getNewSelectionManager()(this);
    this.setSelectionModel(this.getNewSelectionModel()(this));
    this.setTableModel(tableModel || this.getEmptyTableModel());

    // create the main meta column
    this.setMetaColumnCounts([ -1 ]);

    // Make focusable
    this.setTabIndex(1);
    this.addListener("keydown", this._onKeyDown);
    this.addListener("focus", this._onFocusChanged);
    this.addListener("blur", this._onFocusChanged);

    // attach the resize listener to the last child of the layout. This
    // ensures that all other children are laid out before
    var spacer = new qx.ui.core.Widget().set({
      height: 0
    });
    this._add(spacer);
    spacer.addListener("resize", this._onResize, this);

    this.__focusedCol = null;
    this.__focusedRow = null;

    // add an event listener which updates the table content on locale change
    if (qx.core.Environment.get("qx.dynlocale")) {
      qx.locale.Manager.getInstance().addListener("changeLocale", this._onChangeLocale, this);
    }

    this.initStatusBarVisible();

    // If the table model has an init() method...
    tableModel = this.getTableModel();
    if (tableModel.init && typeof(tableModel.init) == "function")
    {
      // ... then call it now to allow the table model to affect table
      // properties.
      tableModel.init(this);
    }
  },




  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events :
  {
    /**
     * Dispatched before adding the column list to the column visibility menu.
     * The event data is a map with two properties: table and menu.  Listeners
     * may add additional items to the menu, which appear at the top of the
     * menu.
     */
    "columnVisibilityMenuCreateStart" : "qx.event.type.Data",

    /**
     * Dispatched after adding the column list to the column visibility menu.
     * The event data is a map with two properties: table and menu.  Listeners
     * may add additional items to the menu, which appear at the bottom of the
     * menu.
     */
    "columnVisibilityMenuCreateEnd" : "qx.event.type.Data",

     /**
      * Dispatched when the width of the table has changed.
      */
    "tableWidthChanged" : "qx.event.type.Event",

    /**
     * Dispatched when updating scrollbars discovers that a vertical scrollbar
     * is needed when it previously was not, or vice versa.  The data is a
     * boolean indicating whether a vertical scrollbar is now being used.
     */
    "verticalScrollBarChanged" : "qx.event.type.Data",

    /**
     * Dispatched when a data cell has been tapped.
     */
    "cellTap" : "qx.ui.table.pane.CellEvent",

    /**
     * Dispatched when a data cell has been tapped.
     */
    "cellDbltap" : "qx.ui.table.pane.CellEvent",

    /**
     * Dispatched when the context menu is needed in a data cell
     */
    "cellContextmenu" : "qx.ui.table.pane.CellEvent",

    /**
     * Dispatched after a cell editor is flushed.
     *
     * The data is a map containing this properties:
     * <ul>
     *   <li>row</li>
     *   <li>col</li>
     *   <li>value</li>
     *   <li>oldValue</li>
     * </ul>
     */
    "dataEdited" : "qx.event.type.Data"
  },



  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /** Events that must be redirected to the scrollers. */
    __redirectEvents : { cellTap: 1, cellDbltap: 1, cellContextmenu: 1 }
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
      init : "table"
    },


    focusable :
    {
      refine : true,
      init : true
    },


    minWidth :
    {
      refine : true,
      init : 50
    },

    /**
     * The list of columns that are initially hidden. This property is set by
     * the constructor, from the value received in
     * custom.initiallyHiddenColumns, and is only used when a column model is
     * initialized. It can be of great benefit in tables with numerous columns
     * where most are not initially visible. The process of creating the
     * headers for all of the columns, only to have those columns discarded
     * shortly thereafter when setColumnVisibility(false) is called, is a
     * waste of (significant, in some browsers) time. Specifying the
     * non-visible columns at constructor time can therefore avoid the initial
     * creation of all of those superfluous widgets.
     */
    initiallyHiddenColumns :
    {
      init : null
    },

    /**
     * Whether the widget contains content which may be selected by the user.
     *
     * If the value set to <code>true</code> the native browser selection can
     * be used for text selection. But it is normally useful for
     * forms fields, longer texts/documents, editors, etc.
     *
     * Note: This has no effect on Table!
     */
    selectable :
    {
      refine : true,
      init : false
    },


    /** The selection model. */
    selectionModel :
    {
      check : "qx.ui.table.selection.Model",
      apply : "_applySelectionModel",
      event : "changeSelectionModel"
    },


    /** The table model. */
    tableModel :
    {
      check : "qx.ui.table.ITableModel",
      apply : "_applyTableModel",
      event : "changeTableModel"
    },


    /** The height of the table rows. */
    rowHeight :
    {
      check : "Number",
      init : 20,
      apply : "_applyRowHeight",
      event : "changeRowHeight",
      themeable : true
    },


    /**
     * Force line height to match row height.  May be disabled if cell
     * renderers being used wish to render multiple lines of data within a
     * cell.  (With the default setting, all but the first of multiple lines
     * of data will not be visible.)
     */
    forceLineHeight :
    {
      check : "Boolean",
      init  : true
    },


    /**
     *  Whether the header cells are visible. When setting this to false,
     *  you'll likely also want to set the {#columnVisibilityButtonVisible}
     *  property to false as well, to entirely remove the header row.
     */
    headerCellsVisible :
    {
      check : "Boolean",
      init : true,
      apply : "_applyHeaderCellsVisible",
      themeable : true
    },


    /** The height of the header cells. */
    headerCellHeight :
    {
      check : "Integer",
      init : 16,
      apply : "_applyHeaderCellHeight",
      event : "changeHeaderCellHeight",
      nullable : true,
      themeable : true
    },


    /** Whether to show the status bar */
    statusBarVisible :
    {
      check : "Boolean",
      init : true,
      apply : "_applyStatusBarVisible"
    },


    /** The Statusbartext, set it, if you want some more Information */
    additionalStatusBarText :
    {
      nullable : true,
      init : null,
      apply : "_applyAdditionalStatusBarText"
    },


    /** Whether to show the column visibility button */
    columnVisibilityButtonVisible :
    {
      check : "Boolean",
      init : true,
      apply : "_applyColumnVisibilityButtonVisible",
      themeable : true
    },


    /**
     * @type {Integer[]} The number of columns per meta column. If the last array entry is -1,
     * this meta column will get the remaining columns.
     */
    metaColumnCounts :
    {
      check : "Object",
      apply : "_applyMetaColumnCounts"
    },


    /**
     * Whether the focus should moved when the pointer is moved over a cell. If false
     * the focus is only moved on pointer taps.
     */
    focusCellOnPointerMove :
    {
      check : "Boolean",
      init : false,
      apply : "_applyFocusCellOnPointerMove"
    },

    /**
     * Whether row focus change by keyboard also modifies selection
     */
    rowFocusChangeModifiesSelection :
    {
      check : "Boolean",
      init : true
    },

    /**
     * Whether the cell focus indicator should be shown
     */
    showCellFocusIndicator :
    {
      check : "Boolean",
      init : true,
      apply : "_applyShowCellFocusIndicator"
    },

    /**
     * By default, the "cellContextmenu" event is fired only when a data cell
     * is right-clicked. It is not fired when a right-click occurs in the
     * empty area of the table below the last data row. By turning on this
     * property, "cellContextMenu" events will also be generated when a
     * right-click occurs in that empty area. In such a case, row identifier
     * in the event data will be null, so event handlers can check (row ===
     * null) to handle this case.
     */
    contextMenuFromDataCellsOnly :
    {
      check : "Boolean",
      init : true,
      apply : "_applyContextMenuFromDataCellsOnly"
    },

    /**
     * Whether the table should keep the first visible row complete. If set to false,
     * the first row may be rendered partial, depending on the vertical scroll value.
     */
    keepFirstVisibleRowComplete :
    {
      check : "Boolean",
      init : true,
      apply : "_applyKeepFirstVisibleRowComplete"
    },


    /**
     * Whether the table cells should be updated when only the selection or the
     * focus changed. This slows down the table update but allows to react on a
     * changed selection or a changed focus in a cell renderer.
     */
    alwaysUpdateCells :
    {
      check : "Boolean",
      init : false
    },


    /**
     * Whether to reset the selection when a header cell is tapped. Since
     * most data models do not have provisions to retain a selection after
     * sorting, the default is to reset the selection in this case. Some data
     * models, however, do have the capability to retain the selection, so
     * when using those, this property should be set to false.
     */
    resetSelectionOnHeaderTap :
    {
      check : "Boolean",
      init : true,
      apply : "_applyResetSelectionOnHeaderTap"
    },


    /** The renderer to use for styling the rows. */
    dataRowRenderer :
    {
      check : "qx.ui.table.IRowRenderer",
      init : null,
      nullable : true,
      event : "changeDataRowRenderer"
    },


    /**
     * A function to call when before modal cell editor is opened.
     *
     * @signature function(cellEditor, cellInfo)
     *
     * @param cellEditor {qx.ui.window.Window}
     *   The modal window which has been created for this cell editor
     *
     * @param cellInfo {Map}
     *   Information about the cell for which this cell editor was created.
     *   It contains the following properties:
     *       col, row, xPos, value
     *
     */
    modalCellEditorPreOpenFunction :
    {
      check : "Function",
      init : null,
      nullable : true
    },


    /**
     * A function to instantiate a new column menu button.
     */
    newColumnMenu :
    {
      check : "Function",
      init  : function() {
        return new qx.ui.table.columnmenu.Button();
      }
    },


    /**
     * A function to instantiate a selection manager.  this allows subclasses of
     * Table to subclass this internal class.  To take effect, this property must
     * be set before calling the Table constructor.
     */
    newSelectionManager :
    {
      check : "Function",
      init : function(obj) {
        return new qx.ui.table.selection.Manager(obj);
      }
    },


    /**
     * A function to instantiate a selection model.  this allows subclasses of
     * Table to subclass this internal class.  To take effect, this property must
     * be set before calling the Table constructor.
     */
    newSelectionModel :
    {
      check : "Function",
      init : function(obj) {
        return new qx.ui.table.selection.Model(obj);
      }
    },


    /**
     * A function to instantiate a table column model.  This allows subclasses
     * of Table to subclass this internal class.  To take effect, this
     * property must be set before calling the Table constructor.
     */
    newTableColumnModel :
    {
      check : "Function",
      init : function(table) {
        return new qx.ui.table.columnmodel.Basic(table);
      }
    },


    /**
     * A function to instantiate a table pane.  this allows subclasses of
     * Table to subclass this internal class.  To take effect, this property
     * must be set before calling the Table constructor.
     */
    newTablePane :
    {
      check : "Function",
      init : function(obj) {
        return new qx.ui.table.pane.Pane(obj);
      }
    },


    /**
     * A function to instantiate a table pane.  this allows subclasses of
     * Table to subclass this internal class.  To take effect, this property
     * must be set before calling the Table constructor.
     */
    newTablePaneHeader :
    {
      check : "Function",
      init : function(obj) {
        return new qx.ui.table.pane.Header(obj);
      }
    },


    /**
     * A function to instantiate a table pane scroller.  this allows
     * subclasses of Table to subclass this internal class.  To take effect,
     * this property must be set before calling the Table constructor.
     */
    newTablePaneScroller :
    {
      check : "Function",
      init : function(obj) {
        return new qx.ui.table.pane.Scroller(obj);
      }
    },


    /**
     * A function to instantiate a table pane model.  this allows subclasses
     * of Table to subclass this internal class.  To take effect, this
     * property must be set before calling the Table constructor.
     */
    newTablePaneModel :
    {
      check : "Function",
      init : function(columnModel) {
        return new qx.ui.table.pane.Model(columnModel);
      }
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __focusedCol : null,
    __focusedRow : null,

    __scrollerParent : null,

    __selectionManager : null,

    __additionalStatusBarText : null,
    __lastRowCount : null,
    __internalChange : null,

    __columnMenuButtons : null,
    __columnModel : null,
    __emptyTableModel : null,

    __hadVerticalScrollBar : null,

    __timer : null,


    // overridden
    _createChildControlImpl : function(id, hash)
    {
      var control;

      switch(id)
      {
      case "statusbar":
        control = new qx.ui.basic.Label();
        control.set(
          {
            allowGrowX: true
          });
        this._add(control);
        break;

      case "column-button":
        control = this.getNewColumnMenu()();
        control.set({
          focusable : false
        });

        // Create the initial menu too
        var menu = control.factory("menu", { table : this });

        // Add a listener to initialize the column menu when it becomes visible
        menu.addListener(
          "appear",
          this._initColumnMenu,
          this
        );

        break;
      }

      return control || this.base(arguments, id);
    },



    // property modifier
    _applySelectionModel : function(value, old)
    {
      this.__selectionManager.setSelectionModel(value);

      if (old != null) {
        old.removeListener("changeSelection", this._onSelectionChanged, this);
      }

      value.addListener("changeSelection", this._onSelectionChanged, this);
    },


    // property modifier
    _applyRowHeight : function(value, old)
    {
      var scrollerArr = this._getPaneScrollerArr();

      for (var i=0; i<scrollerArr.length; i++) {
        scrollerArr[i].updateVerScrollBarMaximum();
      }
    },


    // property modifier
    _applyHeaderCellsVisible : function(value, old)
    {
      var scrollerArr = this._getPaneScrollerArr();

      for (var i=0; i<scrollerArr.length; i++) {
        if (value) {
          scrollerArr[i]._showChildControl("header");
        } else {
          scrollerArr[i]._excludeChildControl("header");
        }
      }
      // also hide the column visibility button
      if(this.getColumnVisibilityButtonVisible()) {
        this._applyColumnVisibilityButtonVisible(value);
      }
    },


    // property modifier
    _applyHeaderCellHeight : function(value, old)
    {
      var scrollerArr = this._getPaneScrollerArr();

      for (var i=0; i<scrollerArr.length; i++) {
        scrollerArr[i].getHeader().setHeight(value);
      }
    },


    /**
     * Get an empty table model instance to use for this table. Use this table
     * to configure the table with no table model.
     *
     * @return {qx.ui.table.ITableModel} The empty table model
     */
    getEmptyTableModel : function()
    {
      if (!this.__emptyTableModel)
      {
        this.__emptyTableModel = new qx.ui.table.model.Simple();
        this.__emptyTableModel.setColumns([]);
        this.__emptyTableModel.setData([]);
      }
      return this.__emptyTableModel;
    },


    // property modifier
    _applyTableModel : function(value, old)
    {
      this.getTableColumnModel().init(value.getColumnCount(), this);

      if (old != null)
      {
        old.removeListener(
          "metaDataChanged",
          this._onTableModelMetaDataChanged, this
        );

        old.removeListener(
          "dataChanged",
          this._onTableModelDataChanged,
          this);
      }

      value.addListener(
        "metaDataChanged",
        this._onTableModelMetaDataChanged, this
      );

      value.addListener(
        "dataChanged",
        this._onTableModelDataChanged,
        this);

      // Update the status bar
      this._updateStatusBar();

      this._updateTableData(
        0, value.getRowCount(),
        0, value.getColumnCount()
      );
      this._onTableModelMetaDataChanged();

      // If the table model has an init() method, call it. We don't, however,
      // call it if this is the initial setting of the table model, as the
      // scrollers are not yet initialized. In that case, the init method is
      // called explicitly by the Table constructor.
      if (old && value.init && typeof(value.init) == "function")
      {
        value.init(this);
      }
    },


    /**
     * Get the The table column model.
     *
     * @return {qx.ui.table.columnmodel.Basic} The table's column model
     */
    getTableColumnModel : function()
    {
      if (!this.__columnModel)
      {
        var columnModel = this.__columnModel = this.getNewTableColumnModel()(this);

        columnModel.addListener("visibilityChanged", this._onColVisibilityChanged, this);
        columnModel.addListener("widthChanged", this._onColWidthChanged, this);
        columnModel.addListener("orderChanged", this._onColOrderChanged, this);

        // Get the current table model
        var tableModel = this.getTableModel();
        columnModel.init(tableModel.getColumnCount(), this);

        // Reset the table column model in each table pane model
        var scrollerArr = this._getPaneScrollerArr();

        for (var i=0; i<scrollerArr.length; i++)
        {
          var paneScroller = scrollerArr[i];
          var paneModel = paneScroller.getTablePaneModel();
          paneModel.setTableColumnModel(columnModel);
        }
      }
      return this.__columnModel;
    },


    // property modifier
    _applyStatusBarVisible : function(value, old)
    {
      if (value) {
        this._showChildControl("statusbar");
      } else {
        this._excludeChildControl("statusbar");
      }

      if (value) {
        this._updateStatusBar();
      }
    },


    // property modifier
    _applyAdditionalStatusBarText : function(value, old)
    {
      this.__additionalStatusBarText = value;
      this._updateStatusBar();
    },


    // property modifier
    _applyColumnVisibilityButtonVisible : function(value, old)
    {
      if (value) {
        this._showChildControl("column-button");
      } else {
        this._excludeChildControl("column-button");
      }
    },


    // property modifier
    _applyMetaColumnCounts : function(value, old)
    {
      var metaColumnCounts = value;
      var scrollerArr = this._getPaneScrollerArr();
      var handlers = { };

      if (value > old)
      {
        // Save event listeners on the redirected events so we can re-apply
        // them to new scrollers.
        var manager = qx.event.Registration.getManager(scrollerArr[0]);
        for (var evName in qx.ui.table.Table.__redirectEvents)
        {
          handlers[evName] = { };
          handlers[evName].capture = manager.getListeners(scrollerArr[0],
                                                          evName,
                                                          true);
          handlers[evName].bubble = manager.getListeners(scrollerArr[0],
                                                         evName,
                                                         false);
        }
      }

      // Remove the panes not needed any more
      this._cleanUpMetaColumns(metaColumnCounts.length);

      // Update the old panes
      var leftX = 0;

      for (var i=0; i<scrollerArr.length; i++)
      {
        var paneScroller = scrollerArr[i];
        var paneModel = paneScroller.getTablePaneModel();
        paneModel.setFirstColumnX(leftX);
        paneModel.setMaxColumnCount(metaColumnCounts[i]);
        leftX += metaColumnCounts[i];
      }

      // Add the new panes
      if (metaColumnCounts.length > scrollerArr.length)
      {
        var columnModel = this.getTableColumnModel();

        for (var i=scrollerArr.length; i<metaColumnCounts.length; i++)
        {
          var paneModel = this.getNewTablePaneModel()(columnModel);
          paneModel.setFirstColumnX(leftX);
          paneModel.setMaxColumnCount(metaColumnCounts[i]);
          leftX += metaColumnCounts[i];

          var paneScroller = this.getNewTablePaneScroller()(this);
          paneScroller.setTablePaneModel(paneModel);

          // Register event listener for vertical scrolling
          paneScroller.addListener("changeScrollY", this._onScrollY, this);

          // Apply redirected events to this new scroller
          for (evName in qx.ui.table.Table.__redirectEvents)
          {
            // On first setting of meta columns (constructing phase), there
            // are no handlers to deal with yet.
            if (! handlers[evName])
            {
              break;
            }

            if (handlers[evName].capture &&
                handlers[evName].capture.length > 0)
            {
              var capture = handlers[evName].capture;
              for (var j = 0; j < capture.length; j++)
              {
                // Determine what context to use.  If the context does not
                // exist, we assume that the context is this table.  If it
                // does exist and it equals the first pane scroller (from
                // which we retrieved the listeners) then set the context
                // to be this new pane scroller.  Otherwise leave the context
                // as it was set.
                var context = capture[j].context;
                if (! context)
                {
                  context = this;
                }
                else if (context == scrollerArr[0])
                {
                  context = paneScroller;
                }

                paneScroller.addListener(
                  evName,
                  capture[j].handler,
                  context,
                  true);
              }
            }

            if (handlers[evName].bubble &&
                handlers[evName].bubble.length > 0)
            {
              var bubble = handlers[evName].bubble;
              for (var j = 0; j < bubble.length; j++)
              {
                // Determine what context to use.  If the context does not
                // exist, we assume that the context is this table.  If it
                // does exist and it equals the first pane scroller (from
                // which we retrieved the listeners) then set the context
                // to be this new pane scroller.  Otherwise leave the context
                // as it was set.
                var context = bubble[j].context;
                if (! context)
                {
                  context = this;
                }
                else if (context == scrollerArr[0])
                {
                  context = paneScroller;
                }

                paneScroller.addListener(
                  evName,
                  bubble[j].handler,
                  context,
                  false);
              }
            }
          }

          // last meta column is flexible
          var flex = (i == metaColumnCounts.length - 1) ? 1 : 0;
          this.__scrollerParent.add(paneScroller, {flex: flex});
          scrollerArr = this._getPaneScrollerArr();
        }
      }

      // Update all meta columns
      for (var i=0; i<scrollerArr.length; i++)
      {
        var paneScroller = scrollerArr[i];
        var isLast = (i == (scrollerArr.length - 1));

        // Set the right header height
        paneScroller.getHeader().setHeight(this.getHeaderCellHeight());

        // Put the column visibility button in the top right corner of the last meta column
        paneScroller.setTopRightWidget(isLast ? this.getChildControl("column-button") : null);
      }

      if (!this.isColumnVisibilityButtonVisible()) {
        this._excludeChildControl("column-button");
      }

      this._updateScrollerWidths();
      this._updateScrollBarVisibility();
    },


    // property modifier
    _applyFocusCellOnPointerMove : function(value, old)
    {
      var scrollerArr = this._getPaneScrollerArr();

      for (var i=0; i<scrollerArr.length; i++) {
        scrollerArr[i].setFocusCellOnPointerMove(value);
      }
    },


    // property modifier
    _applyShowCellFocusIndicator : function(value, old)
    {
      var scrollerArr = this._getPaneScrollerArr();

      for (var i=0; i<scrollerArr.length; i++) {
        scrollerArr[i].setShowCellFocusIndicator(value);
      }
    },


    // property modifier
    _applyContextMenuFromDataCellsOnly : function(value, old)
    {
      var scrollerArr = this._getPaneScrollerArr();

      for (var i=0; i<scrollerArr.length; i++) {
        scrollerArr[i].setContextMenuFromDataCellsOnly(value);
      }
    },


    // property modifier
    _applyKeepFirstVisibleRowComplete : function(value, old)
    {
      var scrollerArr = this._getPaneScrollerArr();

      for (var i=0; i<scrollerArr.length; i++) {
        scrollerArr[i].onKeepFirstVisibleRowCompleteChanged();
      }
    },


    // property modifier
    _applyResetSelectionOnHeaderTap : function(value, old)
    {
      var scrollerArr = this._getPaneScrollerArr();

      for (var i=0; i<scrollerArr.length; i++) {
        scrollerArr[i].setResetSelectionOnHeaderTap(value);
      }
    },


    /**
     * Returns the selection manager.
     *
     * @return {qx.ui.table.selection.Manager} the selection manager.
     */
    getSelectionManager : function() {
      return this.__selectionManager;
    },


    /**
     * Returns an array containing all TablePaneScrollers in this table.
     *
     * @return {qx.ui.table.pane.Scroller[]} all TablePaneScrollers in this table.
     */
    _getPaneScrollerArr : function() {
      return this.__scrollerParent.getChildren();
    },


    /**
     * Returns a TablePaneScroller of this table.
     *
     * @param metaColumn {Integer} the meta column to get the TablePaneScroller for.
     * @return {qx.ui.table.pane.Scroller} the qx.ui.table.pane.Scroller.
     */
    getPaneScroller : function(metaColumn) {
      return this._getPaneScrollerArr()[metaColumn];
    },


    /**
     * Cleans up the meta columns.
     *
     * @param fromMetaColumn {Integer} the first meta column to clean up. All following
     *      meta columns will be cleaned up, too. All previous meta columns will
     *      stay unchanged. If 0 all meta columns will be cleaned up.
     */
    _cleanUpMetaColumns : function(fromMetaColumn)
    {
      var scrollerArr = this._getPaneScrollerArr();

      if (scrollerArr != null)
      {
        for (var i=scrollerArr.length-1; i>=fromMetaColumn; i--)
        {
          scrollerArr[i].destroy();
        }
      }
    },


    /**
     * Event handler. Called when the locale has changed.
     *
     * @param evt {Event} the event.
     */
    _onChangeLocale : function(evt)
    {
      this.updateContent();
      this._updateStatusBar();
    },


    // overridden
    _onChangeTheme : function() {
      this.base(arguments);

      this.getDataRowRenderer().initThemeValues();
      this.updateContent();
      this._updateStatusBar();
    },


    /**
     * Event handler. Called when the selection has changed.
     *
     * @param evt {Map} the event.
     */
    _onSelectionChanged : function(evt)
    {
      var scrollerArr = this._getPaneScrollerArr();

      for (var i=0; i<scrollerArr.length; i++) {
        scrollerArr[i].onSelectionChanged();
      }

      this._updateStatusBar();
    },


    /**
     * Event handler. Called when the table model meta data has changed.
     *
     * @param evt {Map} the event.
     */
    _onTableModelMetaDataChanged : function(evt)
    {
      var scrollerArr = this._getPaneScrollerArr();

      for (var i=0; i<scrollerArr.length; i++) {
        scrollerArr[i].onTableModelMetaDataChanged();
      }

      this._updateStatusBar();
    },


    /**
     * Event handler. Called when the table model data has changed.
     *
     * @param evt {Map} the event.
     */
    _onTableModelDataChanged : function(evt)
    {
      var data = evt.getData();

      this._updateTableData(
        data.firstRow, data.lastRow,
        data.firstColumn, data.lastColumn,
        data.removeStart, data.removeCount
      );
    },


    // overridden
    _onContextMenuOpen : function(e)
    {
      // This is Widget's context menu handler which typically retrieves
      // and displays the menu as soon as it receives a "contextmenu" event.
      // We want to allow the cellContextmenu handler to create the menu,
      // so we'll override this method with a null one, and do the menu
      // placement and display handling in our _onContextMenu method.
    },


    /**
     * To update the table if the table model has changed and remove selection.
     *
     * @param firstRow {Integer} The index of the first row that has changed.
     * @param lastRow {Integer} The index of the last row that has changed.
     * @param firstColumn {Integer} The model index of the first column that has changed.
     * @param lastColumn {Integer} The model index of the last column that has changed.
     * @param removeStart {Integer ? null} The first index of the interval (including), to remove selection.
     * @param removeCount {Integer ? null} The count of the interval, to remove selection.
     */
    _updateTableData : function(firstRow, lastRow, firstColumn, lastColumn, removeStart, removeCount)
    {
      var scrollerArr = this._getPaneScrollerArr();

      // update selection if rows were removed
      if (removeCount) {
        this.getSelectionModel().removeSelectionInterval(removeStart, removeStart + removeCount);
        // remove focus if the focused row has been removed
        if (this.__focusedRow >= removeStart && this.__focusedRow < (removeStart + removeCount)) {
          this.setFocusedCell();
        }
      }

      for (var i=0; i<scrollerArr.length; i++)
      {
        scrollerArr[i].onTableModelDataChanged(
          firstRow, lastRow,
          firstColumn, lastColumn
        );
      }

      var rowCount = this.getTableModel().getRowCount();

      if (rowCount != this.__lastRowCount)
      {
        this.__lastRowCount = rowCount;

        this._updateScrollBarVisibility();
        this._updateStatusBar();
      }
    },


    /**
     * Event handler. Called when a TablePaneScroller has been scrolled vertically.
     *
     * @param evt {Map} the event.
     */
    _onScrollY : function(evt)
    {
      if (!this.__internalChange)
      {
        this.__internalChange = true;

        // Set the same scroll position to all meta columns
        var scrollerArr = this._getPaneScrollerArr();

        for (var i=0; i<scrollerArr.length; i++) {
          scrollerArr[i].setScrollY(evt.getData());
        }

        this.__internalChange = false;
      }
    },


    /**
     * Event handler. Called when a key was pressed.
     *
     * @param evt {qx.event.type.KeySequence} the event.
     * @deprecated {6.0} please use _onKeyDown instead!
     */
    _onKeyPress : function(evt)
    {
 -     qx.log.Logger.deprecatedMethodWarning(arguments.callee,"The method '_onKeyPress()' is deprecated. Please use '_onKeyDown()' instead.");
 -     qx.log.Logger.deprecateMethodOverriding(this, qx.ui.table.Table, "_onKeyPress", "The method '_onKeyPress()' is deprecated. Please use '_onKeyDown()' instead.");
       this._onKeyDown(evt);
    },
    /**
     * Event handler. Called when on key down event
     *
     * @param evt {qx.event.type.KeySequence} the event.
     */
    _onKeyDown : function(evt)
    {
      if (!this.getEnabled()) {
        return;
      }

      // No editing mode
      var oldFocusedRow = this.__focusedRow;
      var consumed = false;

      // Handle keys that are independent from the modifiers
      var identifier = evt.getKeyIdentifier();

      if (this.isEditing())
      {
        // Editing mode
        if (evt.getModifiers() == 0)
        {
          switch(identifier)
          {
            case "Enter":
              this.stopEditing();
              var oldFocusedRow = this.__focusedRow;
              this.moveFocusedCell(0, 1);

              if (this.__focusedRow != oldFocusedRow) {
                consumed = this.startEditing();
              }

              break;

            case "Escape":
              this.cancelEditing();
              this.focus();
              break;

            default:
              consumed = false;
              break;
          }
        }

      }
      else
      {
        consumed = true;
        // No editing mode
        if (evt.isCtrlPressed())
        {
          // Handle keys that depend on modifiers

          switch(identifier)
          {
            case "A": // Ctrl + A
              var rowCount = this.getTableModel().getRowCount();

              if (rowCount > 0) {
                this.getSelectionModel().setSelectionInterval(0, rowCount - 1);
              }

              break;

            default:
              consumed = false;
              break;
          }
        }
        else
        {
          // Handle keys that are independent from the modifiers
          switch(identifier)
          {
            case "Space":
              this.__selectionManager.handleSelectKeyDown(this.__focusedRow, evt);
              break;

            case "F2":
            case "Enter":
              this.startEditing();
              consumed = true;
              break;

            case "Home":
              this.setFocusedCell(this.__focusedCol, 0, true);
              break;

            case "End":
              var rowCount = this.getTableModel().getRowCount();
              this.setFocusedCell(this.__focusedCol, rowCount - 1, true);
              break;

            case "Left":
              this.moveFocusedCell(-1, 0);
              break;

            case "Right":
              this.moveFocusedCell(1, 0);
              break;

            case "Up":
              this.moveFocusedCell(0, -1);
              break;

            case "Down":
              this.moveFocusedCell(0, 1);
              break;

            case "PageUp":
            case "PageDown":
              var scroller = this.getPaneScroller(0);
              var pane = scroller.getTablePane();
              var rowHeight = this.getRowHeight();
              var direction = (identifier == "PageUp") ? -1 : 1;
              rowCount = pane.getVisibleRowCount() - 1;
              scroller.setScrollY(scroller.getScrollY() + direction * rowCount * rowHeight);
              this.moveFocusedCell(0, direction * rowCount);
              break;

            default:
              consumed = false;
          }
        }
      }

      if (oldFocusedRow != this.__focusedRow &&
          this.getRowFocusChangeModifiesSelection())
      {
        // The focus moved -> Let the selection manager handle this event
        this.__selectionManager.handleMoveKeyDown(this.__focusedRow, evt);
      }

      if (consumed)
      {
        evt.preventDefault();
        evt.stopPropagation();
      }
    },


    /**
     * Event handler. Called when the table gets the focus.
     *
     * @param evt {Map} the event.
     */
    _onFocusChanged : function(evt)
    {
      var scrollerArr = this._getPaneScrollerArr();

      for (var i=0; i<scrollerArr.length; i++) {
        scrollerArr[i].onFocusChanged();
      }
    },


    /**
     * Event handler. Called when the visibility of a column has changed.
     *
     * @param evt {Map} the event.
     */
    _onColVisibilityChanged : function(evt)
    {
      var scrollerArr = this._getPaneScrollerArr();

      for (var i=0; i<scrollerArr.length; i++) {
        scrollerArr[i].onColVisibilityChanged();
      }

      var data = evt.getData();
      if (this.__columnMenuButtons != null && data.col != null &&
          data.visible != null) {
        this.__columnMenuButtons[data.col].setColumnVisible(data.visible);
      }

      this._updateScrollerWidths();
      this._updateScrollBarVisibility();
    },


    /**
     * Event handler. Called when the width of a column has changed.
     *
     * @param evt {Map} the event.
     */
    _onColWidthChanged : function(evt)
    {
      var scrollerArr = this._getPaneScrollerArr();

      for (var i=0; i<scrollerArr.length; i++)
      {
        var data = evt.getData();
        scrollerArr[i].setColumnWidth(data.col, data.newWidth);
      }

      this._updateScrollerWidths();
      this._updateScrollBarVisibility();
    },


    /**
     * Event handler. Called when the column order has changed.
     *
     * @param evt {Map} the event.
     */
    _onColOrderChanged : function(evt)
    {
      var scrollerArr = this._getPaneScrollerArr();

      for (var i=0; i<scrollerArr.length; i++) {
        scrollerArr[i].onColOrderChanged();
      }

      // A column may have been moved between meta columns
      this._updateScrollerWidths();
      this._updateScrollBarVisibility();
    },


    /**
     * Gets the TablePaneScroller at a certain x position in the page. If there is
     * no TablePaneScroller at this position, null is returned.
     *
     * @param pageX {Integer} the position in the page to check (in pixels).
     * @return {qx.ui.table.pane.Scroller} the TablePaneScroller or null.
     */
    getTablePaneScrollerAtPageX : function(pageX)
    {
      var metaCol = this._getMetaColumnAtPageX(pageX);
      return (metaCol != -1) ? this.getPaneScroller(metaCol) : null;
    },


    /**
     * Sets the currently focused cell. A value of <code>null</code> hides the
     * focus cell.
     *
     * @param col {Integer?null} the model index of the focused cell's column.
     * @param row {Integer?null} the model index of the focused cell's row.
     * @param scrollVisible {Boolean ? false} whether to scroll the new focused cell
     *          visible.
     */
    setFocusedCell : function(col, row, scrollVisible)
    {
      if (!this.isEditing() && (col != this.__focusedCol || row != this.__focusedRow))
      {
        if (col === null) {
          col = 0;
        }

        this.__focusedCol = col;
        this.__focusedRow = row;

        var scrollerArr = this._getPaneScrollerArr();

        for (var i=0; i<scrollerArr.length; i++) {
          scrollerArr[i].setFocusedCell(col, row);
        }

        if (col != null && scrollVisible) {
          this.scrollCellVisible(col, row);
        }
      }
    },


    /**
     * Resets (clears) the current selection
     */
    resetSelection : function() {
      this.getSelectionModel().resetSelection();
    },


    /**
     * Resets the focused cell.
     */
    resetCellFocus : function() {
      this.setFocusedCell(null, null, false);
    },


    /**
     * Returns the column of the currently focused cell.
     *
     * @return {Integer} the model index of the focused cell's column.
     */
    getFocusedColumn : function() {
      return this.__focusedCol;
    },


    /**
     * Returns the row of the currently focused cell.
     *
     * @return {Integer} the model index of the focused cell's column.
     */
    getFocusedRow : function() {
      return this.__focusedRow;
    },


    /**
     * Select whether the focused row is highlighted
     *
     * @param bHighlight {Boolean}
     *   Flag indicating whether the focused row should be highlighted.
     *
     */
    highlightFocusedRow : function(bHighlight)
    {
      this.getDataRowRenderer().setHighlightFocusRow(bHighlight);
    },


    /**
     * Remove the highlighting of the current focus row.
     *
     * This is used to temporarily remove the highlighting of the currently
     * focused row, and is expected to be used most typically by adding a
     * listener on the "pointerout" event, so that the focus highlighting is
     * suspended when the pointer leaves the table:
     *
     *     table.addListener("pointerout", table.clearFocusedRowHighlight);
     *
     * @param evt {qx.event.type.Pointer} Incoming pointer event
     */
    clearFocusedRowHighlight : function(evt)
    {
      if(evt)
      {
        var relatedTarget = evt.getRelatedTarget();
        if (
          relatedTarget instanceof qx.ui.table.pane.Pane ||
          relatedTarget instanceof qx.ui.table.pane.FocusIndicator
         ) {
           return ;
         }
      }

      // Remove focus from any cell that has it
      this.resetCellFocus();

      // Now, for each pane scroller...
      var scrollerArr = this._getPaneScrollerArr();
      for (var i=0; i<scrollerArr.length; i++)
      {
        // ... repaint without focus.
        scrollerArr[i].onFocusChanged();
      }
    },


    /**
     * Moves the focus.
     *
     * @param deltaX {Integer} The delta by which the focus should be moved on the x axis.
     * @param deltaY {Integer} The delta by which the focus should be moved on the y axis.
     */
    moveFocusedCell : function(deltaX, deltaY)
    {
      var col = this.__focusedCol;
      var row = this.__focusedRow;

      // could also be undefined [BUG #4676]
      if (col == null || row == null) {
        return;
      }

      if (deltaX != 0)
      {
        var columnModel = this.getTableColumnModel();
        var x = columnModel.getVisibleX(col);
        var colCount = columnModel.getVisibleColumnCount();
        x = qx.lang.Number.limit(x + deltaX, 0, colCount - 1);
        col = columnModel.getVisibleColumnAtX(x);
      }

      if (deltaY != 0)
      {
        var tableModel = this.getTableModel();
        row = qx.lang.Number.limit(row + deltaY, 0, tableModel.getRowCount() - 1);
      }

      this.setFocusedCell(col, row, true);
    },


    /**
     * Scrolls a cell visible.
     *
     * @param col {Integer} the model index of the column the cell belongs to.
     * @param row {Integer} the model index of the row the cell belongs to.
     */
    scrollCellVisible : function(col, row)
    {
      // get the dom element
      var elem = this.getContentElement().getDomElement();
      // if the dom element is not available, the table hasn't been rendered
      if (!elem) {
        // postpone the scroll until the table has appeared
        this.addListenerOnce("appear", function() {
          this.scrollCellVisible(col, row);
        }, this);
      }

      var columnModel = this.getTableColumnModel();
      var x = columnModel.getVisibleX(col);

      var metaColumn = this._getMetaColumnAtColumnX(x);

      if (metaColumn != -1) {
        this.getPaneScroller(metaColumn).scrollCellVisible(col, row);
      }
    },


    /**
     * Returns whether currently a cell is editing.
     *
     * @return {var} whether currently a cell is editing.
     */
    isEditing : function()
    {
      if (this.__focusedCol != null)
      {
        var x = this.getTableColumnModel().getVisibleX(this.__focusedCol);
        var metaColumn = this._getMetaColumnAtColumnX(x);
        return this.getPaneScroller(metaColumn).isEditing();
      }
      return false;
    },


    /**
     * Starts editing the currently focused cell. Does nothing if already editing
     * or if the column is not editable.
     *
     * @return {Boolean} whether editing was started
     */
    startEditing : function()
    {
      if (this.__focusedCol != null)
      {
        var x = this.getTableColumnModel().getVisibleX(this.__focusedCol);
        var metaColumn = this._getMetaColumnAtColumnX(x);
        var started = this.getPaneScroller(metaColumn).startEditing();
        return started;
      }

      return false;
    },


    /**
     * Stops editing and writes the editor's value to the model.
     */
    stopEditing : function()
    {
      if (this.__focusedCol != null)
      {
        var x = this.getTableColumnModel().getVisibleX(this.__focusedCol);
        var metaColumn = this._getMetaColumnAtColumnX(x);
        this.getPaneScroller(metaColumn).stopEditing();
      }
    },


    /**
     * Stops editing without writing the editor's value to the model.
     */
    cancelEditing : function()
    {
      if (this.__focusedCol != null)
      {
        var x = this.getTableColumnModel().getVisibleX(this.__focusedCol);
        var metaColumn = this._getMetaColumnAtColumnX(x);
        this.getPaneScroller(metaColumn).cancelEditing();
      }
    },


    /**
     * Update the table content of every attached table pane.
     */
    updateContent : function() {
      var scrollerArr = this._getPaneScrollerArr();
      for (var i=0; i<scrollerArr.length; i++) {
        scrollerArr[i].getTablePane().updateContent(true);
      }
    },

    /**
     * Activates the blocker widgets on all column headers and the
     * column button
     */
    blockHeaderElements : function()
    {
      var scrollerArr = this._getPaneScrollerArr();
      for (var i=0; i<scrollerArr.length; i++) {
        scrollerArr[i].getHeader().getBlocker().blockContent(20);
      }
      this.getChildControl("column-button").getBlocker().blockContent(20);
    },


    /**
     * Deactivates the blocker widgets on all column headers and the
     * column button
     */
    unblockHeaderElements : function()
    {
      var scrollerArr = this._getPaneScrollerArr();
      for (var i=0; i<scrollerArr.length; i++) {
        scrollerArr[i].getHeader().getBlocker().unblock();
      }
      this.getChildControl("column-button").getBlocker().unblock();
    },

    /**
     * Gets the meta column at a certain x position in the page. If there is no
     * meta column at this position, -1 is returned.
     *
     * @param pageX {Integer} the position in the page to check (in pixels).
     * @return {Integer} the index of the meta column or -1.
     */
    _getMetaColumnAtPageX : function(pageX)
    {
      var scrollerArr = this._getPaneScrollerArr();

      for (var i=0; i<scrollerArr.length; i++)
      {
        var pos = scrollerArr[i].getContentLocation();

        if (pageX >= pos.left && pageX <= pos.right) {
          return i;
        }
      }

      return -1;
    },


    /**
     * Returns the meta column a column is shown in. If the column is not shown at
     * all, -1 is returned.
     *
     * @param visXPos {Integer} the visible x position of the column.
     * @return {Integer} the meta column the column is shown in.
     */
    _getMetaColumnAtColumnX : function(visXPos)
    {
      var metaColumnCounts = this.getMetaColumnCounts();
      var rightXPos = 0;

      for (var i=0; i<metaColumnCounts.length; i++)
      {
        var counts = metaColumnCounts[i];
        rightXPos += counts;

        if (counts == -1 || visXPos < rightXPos) {
          return i;
        }
      }

      return -1;
    },


    /**
     * Updates the text shown in the status bar.
     */
    _updateStatusBar : function()
    {
      var tableModel = this.getTableModel();

      if (this.getStatusBarVisible())
      {
        var selectedRowCount = this.getSelectionModel().getSelectedCount();
        var rowCount = tableModel.getRowCount();

        var text;

        if (rowCount >= 0)
        {
          if (selectedRowCount == 0) {
            text = this.trn("one row", "%1 rows", rowCount, rowCount);
          } else {
            text = this.trn("one of one row", "%1 of %2 rows", rowCount, selectedRowCount, rowCount);
          }
        }

        if (this.__additionalStatusBarText)
        {
          if (text) {
            text += this.__additionalStatusBarText;
          } else {
            text = this.__additionalStatusBarText;
          }
        }

        if (text) {
          this.getChildControl("statusbar").setValue(text);
        }
      }
    },


    /**
     * Updates the widths of all scrollers.
     */
    _updateScrollerWidths : function()
    {
      // Give all scrollers except for the last one the wanted width
      // (The last one has a flex with)
      var scrollerArr = this._getPaneScrollerArr();

      for (var i=0; i<scrollerArr.length; i++)
      {
        var isLast = (i == (scrollerArr.length - 1));
        var width = scrollerArr[i].getTablePaneModel().getTotalWidth();
        scrollerArr[i].setPaneWidth(width);

        var flex = isLast ? 1 : 0;
        scrollerArr[i].setLayoutProperties({flex: flex});
      }
    },


    /**
     * Updates the visibility of the scrollbars in the meta columns.
     */
    _updateScrollBarVisibility : function()
    {
      if (!this.getBounds()) {
        return;
      }

      var horBar = qx.ui.table.pane.Scroller.HORIZONTAL_SCROLLBAR;
      var verBar = qx.ui.table.pane.Scroller.VERTICAL_SCROLLBAR;
      var scrollerArr = this._getPaneScrollerArr();

      // Check which scroll bars are needed
      var horNeeded = false;
      var verNeeded = false;

      for (var i=0; i<scrollerArr.length; i++)
      {
        var isLast = (i == (scrollerArr.length - 1));

        // Only show the last vertical scrollbar
        var bars = scrollerArr[i].getNeededScrollBars(horNeeded, !isLast);

        if (bars & horBar) {
          horNeeded = true;
        }

        if (isLast && (bars & verBar)) {
          verNeeded = true;
        }
      }

      // Set the needed scrollbars
      for (var i=0; i<scrollerArr.length; i++)
      {
        var isLast = (i == (scrollerArr.length - 1));

        // Only show the last vertical scrollbar
        scrollerArr[i].setHorizontalScrollBarVisible(horNeeded);

        // If this is the last meta-column...
        if (isLast)
        {
          // ... then get the current (old) use of vertical scroll bar
          if (this.__hadVerticalScrollBar == null) {
            this.__hadVerticalScrollBar = scrollerArr[i].getVerticalScrollBarVisible();
            this.__timer = qx.event.Timer.once(function()
            {
              // reset the last visible state of the vertical scroll bar
              // in a timeout to prevent infinite loops.
              this.__hadVerticalScrollBar = null;
              this.__timer = null;
            }, this, 0);
          }
        }

        scrollerArr[i].setVerticalScrollBarVisible(isLast && verNeeded);

        // If this is the last meta-column and the use of a vertical scroll bar
        // has changed...
        if (isLast && verNeeded != this.__hadVerticalScrollBar)
        {
          // ... then dispatch an event to any awaiting listeners
          this.fireDataEvent("verticalScrollBarChanged", verNeeded);
        }
      }
    },


    /**
     * Initialize the column menu
     */
    _initColumnMenu : function()
    {
      var tableModel = this.getTableModel();
      var columnModel = this.getTableColumnModel();

      var columnButton = this.getChildControl("column-button");

      // Remove all items from the menu. We'll rebuild it here.
      columnButton.empty();

      // Inform listeners who may want to insert menu items at the beginning
      var menu = columnButton.getMenu();
      var data =
      {
        table        : this,
        menu         : menu,
        columnButton : columnButton
      };
      this.fireDataEvent("columnVisibilityMenuCreateStart", data);

      this.__columnMenuButtons = {};
      for (var col=0, l=tableModel.getColumnCount(); col<l; col++)
      {
        var menuButton =
          columnButton.factory("menu-button",
                               {
                                 text     : tableModel.getColumnName(col),
                                 column   : col,
                                 bVisible : columnModel.isColumnVisible(col)
                               });

        qx.core.Assert.assertInterface(menuButton,
                                       qx.ui.table.IColumnMenuItem);

        menuButton.addListener(
          "changeColumnVisible",
          this._createColumnVisibilityCheckBoxHandler(col), this);
        this.__columnMenuButtons[col] = menuButton;
      }

      // Inform listeners who may want to insert menu items at the end
      data =
      {
        table        : this,
        menu         : menu,
        columnButton : columnButton
      };
      this.fireDataEvent("columnVisibilityMenuCreateEnd", data);
    },





    /**
     * Creates a handler for a check box of the column visibility menu.
     *
     * @param col {Integer} the model index of column to create the handler for.
     * @return {Function} The created event handler.
     */
    _createColumnVisibilityCheckBoxHandler : function(col)
    {
      return function(evt)
      {
        var columnModel = this.getTableColumnModel();
        columnModel.setColumnVisible(col, evt.getData());
      };
    },


    /**
     * Sets the width of a column.
     *
     * @param col {Integer} the model index of column.
     * @param width {Integer} the new width in pixels.
     */
    setColumnWidth : function(col, width) {
      this.getTableColumnModel().setColumnWidth(col, width);
    },


    /**
     * Resize event handler
     */
    _onResize : function()
    {
      this.fireEvent("tableWidthChanged");
      this._updateScrollerWidths();
      this._updateScrollBarVisibility();
    },


    // overridden
    addListener : function(type, listener, self, capture)
    {
      if (this.self(arguments).__redirectEvents[type])
      {
        // start the id with the type (needed for removing)
        var id = [type];
        for (var i = 0, arr = this._getPaneScrollerArr(); i < arr.length; i++)
        {
          id.push(arr[i].addListener.apply(arr[i], arguments));
        }
        // join the id's of every event with "
        return id.join('"');
      }
      else
      {
        return this.base(arguments, type, listener, self, capture);
      }
    },


    // overridden
    removeListener : function(type, listener, self, capture)
    {
      if (this.self(arguments).__redirectEvents[type])
      {
        for (var i = 0, arr = this._getPaneScrollerArr(); i < arr.length; i++)
        {
          arr[i].removeListener.apply(arr[i], arguments);
        }
      }
      else
      {
        this.base(arguments, type, listener, self, capture);
      }
    },


    // overridden
    removeListenerById : function(id) {
      var ids = id.split('"');
      // type is the first entry of the connected id
      var type = ids.shift();
      if (this.self(arguments).__redirectEvents[type])
      {
        var removed = true;
        for (var i = 0, arr = this._getPaneScrollerArr(); i < arr.length; i++)
        {
          removed = arr[i].removeListenerById.call(arr[i], ids[i]) && removed;
        }
        return removed;
      }
      else
      {
        return this.base(arguments, id);
      }
    },


    destroy : function()
    {
      this.getChildControl("column-button").getMenu().destroy();
      this.base(arguments);
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    // remove the event listener which handled the locale change
    if (qx.core.Environment.get("qx.dynlocale")) {
      qx.locale.Manager.getInstance().removeListener("changeLocale", this._onChangeLocale, this);
    }

    // we allocated these objects on init so we have to clean them up.
    var selectionModel = this.getSelectionModel();
    if (selectionModel) {
      selectionModel.dispose();
    }

    var dataRowRenderer = this.getDataRowRenderer();
    if (dataRowRenderer) {
      dataRowRenderer.dispose();
    }

    this._cleanUpMetaColumns(0);
    this.getTableColumnModel().dispose();
    this._disposeObjects(
      "__selectionManager", "__scrollerParent",
      "__emptyTableModel", "__emptyTableModel",
      "__columnModel", "__timer"
    );
    this._disposeMap("__columnMenuButtons");
  }
});
