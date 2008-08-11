/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007 Derrell Lipman

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Derrell Lipman (derrell)

************************************************************************ */

/**
 * A table column model that automagically resizes columns based on a
 * selected behavior.
 *
 * @see qx.ui.table.columnmodel.Basic
 */
qx.Class.define("qx.ui.table.columnmodel.Resize",
{
  extend : qx.ui.table.columnmodel.Basic,
  include : qx.locale.MTranslation,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    // We don't want to recursively call ourself based on our resetting of
    // column sizes.  Track when we're resizing.
    this.__bInProgress = false;

    // Track when the table has appeared.  We want to ignore resize events
    // until then since we won't be able to determine the available width
    // anyway.
    this.__bAppeared = false;
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /**
     * The behavior to use.
     *
     * The provided behavior must extend {link @qx.ui.table.columnmodel.resizebehavior.Abstract} and
     * implement the <i>onAppear</i>, <i>onTableWidthChanged</i>,
     * <i>onColumnWidthChanged</i> and <i>onVisibilityChanged</i>methods.
     */
    behavior :
    {
      check : "qx.ui.table.columnmodel.resizebehavior.Abstract",
      init : null,
      nullable : true,
      apply : "_applyBehavior",
      event : "changeBehavior"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __bAppeared : null,
    __bInProgress : null,
    __table : null,


    // Behavior modifier
    _applyBehavior : function(value, old)
    {
      if (old != null)
      {
        old.dispose();
        old = null;
      }

      // Tell the new behavior how many columns there are
      value._setNumColumns(this.getOverallColumnCount());
    },


    /**
     * Initializes the column model.
     *
     * @param numColumns {var} the number of columns the model should have.
     *
     * @param table {qx.ui.table.Table}
     *   The table which this model is used for.  This allows us access to
     *   other aspects of the table, as the <i>behavior</i> sees fit.
     *
     * @return {void}
     */
    init : function(numColumns, table)
    {
      // Call our superclass
      this.base(arguments, numColumns);

      // Set the initial resize behavior
      if (this.getBehavior() == null) {
        this.setBehavior(new qx.ui.table.columnmodel.resizebehavior.Default());
      }

      // Save the table so we can get at its features, as necessary.
      this.__table = table;

      // We'll do our column resizing when the table appears, ...
      table.addListener("appear", this._onappear, this);

      // ... when the inner width of the table changes, ...
      table.addListener(
        "tableWidthChanged",
        this._onTableWidthChanged,
        this
      );

      // ... when a vertical scroll bar appears or disappears
      table.addListener(
        "verticalScrollBarChanged",
        this._onverticalscrollbarchanged,
        this
      );

      // ... when columns are resized, ...
      this.addListener(
        "widthChanged",
        this._oncolumnwidthchanged,
        this
      );

      // ... and when a column visibility changes.
      this.addListener(
        "visibilityChanged",
        this._onvisibilitychanged,
        this
      );

      // We want to manipulate the button visibility menu
      this.__table.addListener(
        "columnVisibilityMenuCreateEnd",
        this._addResetColumnWidthButton,
        this
      );

      // Tell the behavior how many columns there are
      this.getBehavior()._setNumColumns(numColumns);
    },


    /**
     * Get the table widget
     *
     * @return {qx.ui.table.Table} the table widget
     */
    getTable : function() {
      return this.__table;
    },


    /**
     * Reset the column widths to their "onappear" defaults.
     *
     * @param event {qx.event.type.DataEvent}
     *   The "columnVisibilityMenuCreateEnd" event indicating that the menu is
     *   being generated.  The data is a map containing propeties <i>table</i>
     *   and <i>menu</i>.
     *
     * @return {void}
     */
    _addResetColumnWidthButton : function(event)
    {
      var data = event.getData();
      var menu = data.menu;
      var o;

      // Add a separator between the column names and our reset button
      o = new qx.ui.menu.Separator();
      menu.add(o);

      // Add a button to reset the column widths
      o = new qx.ui.menu.Button(this.tr("Reset column widths")).set({
        appearance: "table-column-reset-button"
      });
      menu.add(o);
      o.addListener("execute", this._onappear, this);
    },


    /**
     * Event handler for the "appear" event.
     *
     * @param event {qx.event.type.Event}
     *   The "onappear" event object.
     *
     * @return {void}
     */
    _onappear : function(event)
    {
      // Is this a recursive call?
      if (this.__bInProgress)
      {
        // Yup.  Ignore it.
        return ;
      }

      this.__bInProgress = true;

      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (qx.core.Setting.get("qx.tableResizeDebug"))
        {
          this.debug("onappear");
        }
      }

      // this handler is also called by the "execute" event of the menu button
      this.getBehavior().onAppear(this, event, event.getType() !== "appear");

      this.__table._updateScrollerWidths();
      this.__table._updateScrollBarVisibility();

      this.__bInProgress = false;

      this.__bAppeared = true;
    },


    /**
     * Event handler for the "tableWidthChanged" event.
     *
     * @param event {qx.event.type.Event}
     *   The "onwindowresize" event object.
     *
     * @return {void}
     */
    _onTableWidthChanged : function(event)
    {
      // Is this a recursive call or has the table not yet been rendered?
      if (this.__bInProgress || !this.__bAppeared)
      {
        // Yup.  Ignore it.
        return;
      }

      this.__bInProgress = true;

      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (qx.core.Setting.get("qx.tableResizeDebug"))
        {
          this.debug("ontablewidthchanged");
        }
      }

      this.getBehavior().onTableWidthChanged(this, event);
      this.__bInProgress = false;
    },


    /**
     * Event handler for the "verticalScrollBarChanged" event.
     *
     * @param event {qx.event.type.DataEvent}
     *   The "verticalScrollBarChanged" event object.  The data is a boolean
     *   indicating whether a vertical scroll bar is now present.
     *
     * @return {void}
     */
    _onverticalscrollbarchanged : function(event)
    {
      // Is this a recursive call or has the table not yet been rendered?
      if (this.__bInProgress || !this.__bAppeared)
      {
        // Yup.  Ignore it.
        return;
      }

      this.__bInProgress = true;

      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (qx.core.Setting.get("qx.tableResizeDebug"))
        {
          this.debug("onverticalscrollbarchanged");
        }
      }

      this.getBehavior().onVerticalScrollBarChanged(this, event);

      qx.event.Timer.once(function()
      {
        if (this.__table && !this.__table.isDisposed())
        {
          this.__table._updateScrollerWidths();
          this.__table._updateScrollBarVisibility();
        }
      }, this, 0);

      this.__bInProgress = false;
    },


    /**
     * Event handler for the "widthChanged" event.
     *
     * @param event {qx.event.type.DataEvent}
     *   The "widthChanged" event object.
     *
     * @return {void}
     */
    _oncolumnwidthchanged : function(event)
    {
      // Is this a recursive call or has the table not yet been rendered?
      if (this.__bInProgress || !this.__bAppeared)
      {
        // Yup.  Ignore it.
        return;
      }

      this.__bInProgress = true;

      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (qx.core.Setting.get("qx.tableResizeDebug"))
        {
          this.debug("oncolumnwidthchanged");
        }
      }

      this.getBehavior().onColumnWidthChanged(this, event);
      this.__bInProgress = false;
    },


    /**
     * Event handler for the "visibilityChanged" event.
     *
     * @param event {qx.event.type.DataEvent}
     *   The "visibilityChanged" event object.
     *
     * @return {void}
     */
    _onvisibilitychanged : function(event)
    {
      // Is this a recursive call or has the table not yet been rendered?
      if (this.__bInProgress || !this.__bAppeared)
      {
        // Yup.  Ignore it.
        return;
      }

      this.__bInProgress = true;

      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (qx.core.Setting.get("qx.tableResizeDebug"))
        {
          this.debug("onvisibilitychanged");
        }
      }

      this.getBehavior().onVisibilityChanged(this, event);
      this.__bInProgress = false;
    }
  },


  settings :
  {
    "qx.tableResizeDebug" : false
  },


 /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this._disposeFields("__table");
  }
});
