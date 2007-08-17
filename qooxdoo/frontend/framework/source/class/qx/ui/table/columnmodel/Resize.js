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

/* ************************************************************************

#module(table)
#embed(qx.icontheme/16/actions/view-refresh.png)

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
    this._bInProgress = false;

    // Track when the table has appeared.  We want to ignore resize events
    // until then since we won't be able to determine the available width
    // anyway.
    this._bAppeared = false;
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
    // Behavior modifier
    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyBehavior : function(value, old)
    {
      if (old != null)
      {
        old.dispose();
        old = null;
      }

      // Tell the new behavior how many columns there are
      this.getBehavior()._setNumColumns(this._columnDataArr.length);
    },


    /**
     * Initializes the column model.
     *
     * @type member
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
      if (this.getBehavior() == null)
      {
        this.setBehavior(new qx.ui.table.columnmodel.resizebehavior.Default());
      }

      // Save the table so we can get at its features, as necessary.
      this._table = table;

      // We'll do our column resizing when the table appears, ...
      table.addEventListener("appear", this._onappear, this);

      // ... when the inner width of the table changes, ...
      table.addEventListener("tableWidthChanged",
                             this._ontablewidthchanged,
                             this);

      // ... when a vertical scroll bar appears or disappears
      table.addEventListener("verticalScrollBarChanged",
                             this._onverticalscrollbarchanged,
                             this);

      // ... when columns are resized, ...
      this.addEventListener("widthChanged",
                            this._oncolumnwidthchanged,
                            this);

      // ... and when a column visibility changes.
      this.addEventListener("visibilityChanged",
                            this._onvisibilitychanged,
                            this);

      // We want to manipulate the button visibility menu
      this._table.addEventListener("columnVisibilityMenuCreateEnd",
                                   this._addResetColumnWidthButton,
                                   this);

      // Tell the behavior how many columns there are
      this.getBehavior()._setNumColumns(numColumns);
    },


    /**
     * Reset the column widths to their "onappear" defaults.
     *
     * @type member
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

      var Am = qx.io.Alias;
      var icon =
        Am.getInstance().resolve("icon/16/actions/view-refresh.png");

      // Add a separator between the column names and our reset button
      o = new qx.ui.menu.Separator();
      menu.add(o);

      // Add a button to reset the column widths
      o = new qx.ui.menu.Button("Reset column widths", icon);
      menu.add(o);
      o.addEventListener("execute", this._onappear, this);
    },


    /**
     * Event handler for the "appear" event.
     *
     * @type member
     *
     * @param event {qx.event.type.Event}
     *   The "onappear" event object.
     *
     * @return {void}
     */
    _onappear : function(event)
    {
      // Is this a recursive call?
      if (this._bInProgress)
      {
        // Yup.  Ignore it.
        return ;
      }

      this._bInProgress = true;

      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (qx.core.Setting.get("qx.tableResizeDebug"))
        {
          this.debug("onappear");
        }
      }

      this.getBehavior().onAppear(this, event);

      qx.client.Timer.once(function()
                           {
                             if (!this._table.getDisposed())
                             {
                               this._table._updateScrollerWidths();
                               this._table._updateScrollBarVisibility();
                             }
                           },
                           this,
                           0);

      this._bInProgress = false;

      this._bAppeared = true;
    },


    /**
     * Event handler for the "tableWidthChanged" event.
     *
     * @type member
     *
     * @param event {qx.event.type.Event}
     *   The "onwindowresize" event object.
     *
     * @return {void}
     */
    _ontablewidthchanged : function(event)
    {
      // Is this a recursive call or has the table not yet been rendered?
      if (this._bInProgress || !this._bAppeared)
      {
        // Yup.  Ignore it.
        return;
      }

      this._bInProgress = true;

      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (qx.core.Setting.get("qx.tableResizeDebug"))
        {
          this.debug("ontablewidthchanged");
        }
      }

      this.getBehavior().onTableWidthChanged(this, event);
      this._bInProgress = false;
    },


    /**
     * Event handler for the "verticalScrollBarChanged" event.
     *
     * @type member
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
      if (this._bInProgress || !this._bAppeared)
      {
        // Yup.  Ignore it.
        return;
      }

      this._bInProgress = true;

      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (qx.core.Setting.get("qx.tableResizeDebug"))
        {
          this.debug("onverticalscrollbarchanged");
        }
      }

      this.getBehavior().onVerticalScrollBarChanged(this, event);

      qx.client.Timer.once(function()
                           {
                             if (!this._table.getDisposed())
                             {
                               this._table._updateScrollerWidths();
                               this._table._updateScrollBarVisibility();
                             }
                           },
                           this,
                           0);

      this._bInProgress = false;
    },


    /**
     * Event handler for the "widthChanged" event.
     *
     * @type member
     *
     * @param event {qx.event.type.DataEvent}
     *   The "widthChanged" event object.
     *
     * @return {void}
     */
    _oncolumnwidthchanged : function(event)
    {
      // Is this a recursive call or has the table not yet been rendered?
      if (this._bInProgress || !this._bAppeared)
      {
        // Yup.  Ignore it.
        return;
      }

      this._bInProgress = true;

      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (qx.core.Setting.get("qx.tableResizeDebug"))
        {
          this.debug("oncolumnwidthchanged");
        }
      }

      this.getBehavior().onColumnWidthChanged(this, event);
      this._bInProgress = false;
    },


    /**
     * Event handler for the "visibilityChanged" event.
     *
     * @type member
     *
     * @param event {qx.event.type.DataEvent}
     *   The "visibilityChanged" event object.
     *
     * @return {void}
     */
    _onvisibilitychanged : function(event)
    {
      // Is this a recursive call or has the table not yet been rendered?
      if (this._bInProgress || !this._bAppeared)
      {
        // Yup.  Ignore it.
        return;
      }

      this._bInProgress = true;

      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (qx.core.Setting.get("qx.tableResizeDebug"))
        {
          this.debug("onvisibilitychanged");
        }
      }

      this.getBehavior().onVisibilityChanged(this, event);
      this._bInProgress = false;
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
    this._disposeFields("_table");
  }
});
