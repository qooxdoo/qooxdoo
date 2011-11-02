/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2006-2009 Derrell Lipman

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Derrell Lipman (derrell)

************************************************************************ */

/**
 * This mixin allows easily adding handlers for context menus on table columns.
 */
qx.Mixin.define("qx.ui.table.MTableContextMenu",
{
  construct : function()
  {
    // Add an event listener to handle context menu events.  The actual menu
    // is built by a function registered with a call to
    // setContextMenuHandler(col, handler).
    this.addListener(
      "cellContextmenu",
      function(e)
      {
        var contextMenu = this.getContextMenu();

        // Dispose of any previously existing context menu
        if (contextMenu && ! contextMenu.isDisposed())
        {
          // Dispose of the context menu.
          contextMenu.hide();
          this.setContextMenu(null);
          this.getApplicationRoot().remove(contextMenu);
          contextMenu.dispose();
          contextMenu = null;
        }

        // Get the context menu handler for the column on which the context
        // menu request was issued.
        var col = e.getColumn();
        var contextMenuHandler = this.getContextMenuHandler(col);

        // If there's no context menu handler for this column, we have nothing
        // to do.
        if (typeof contextMenuHandler !== "function") {
          return;
        }

        // Get the context object for the handler function
        var handlerContext = this.__contextMenuHandlerContext[col];

        // Get the data model
        var tableModel = this.getTableModel();

        // Create a context menu for this tree.
        contextMenu = new qx.ui.menu.Menu();

        // Don't display context menus from the context menu
        contextMenu.addListener("contextmenu", function(e) {
          e.preventDefault();
        });

        // This prevents the display of context menu on table header cells
        contextMenu.addListenerOnce("disappear", function() {
          this.setContextMenu(null);
        }, this);

        // Call the context menu handler for this column.
        var bShowContextMenu = contextMenuHandler.call(handlerContext,
          col,
          e.getRow(),
          this,
          tableModel,
          contextMenu
        );

        // If we were told not to display the context menu...
        if (! bShowContextMenu)
        {
          // ... then we're all done here.
          contextMenu.dispose();
          return;
        }

        // Set the context menu
        this.setContextMenu(contextMenu);
      },
      this);

    // Provide an array in which context menu handlers will be stored.  The
    // array is indexed by column number.
    this.__contextMenuHandler = [ ];
    this.__contextMenuHandlerContext = [ ];
  },

  members :
  {
    __contextMenuHandler : null,
    __contextMenuHandlerContext : null,

    /**
     * Add a handler for a context menu which is initiated in a specific
     * column.
     *
     * @param col {Integer}
     *   The column number in which the context menu request originated
     *
     * @param handler {Function}
     *   The function to call when a context menu request originates in the
     *   specified column. The handler is called with the following arguments:
     *   <ul>
     *     <li>
     *       <b>column</b>: (Integer)
     *       The number of the column in which the right click was issued
     *     </li>
     *     <li>
     *       <b>row</b>: (Integer)
     *       The number of the row in which the right click was issued
     *     </li>
     *     <li>
     *       <b>table</b>: {@link qx.ui.table.Table}
     *       The table in which the right click was issued
     *     </li>
     *     <li>
     *       <b>dataModel</b>: {@link qx.ui.table.model.Abstract}
     *       Complete data model of the table
     *     </li>
     *     <li>
     *       <b>contextMenu</b>: {@link qx.ui.menu.Menu}
     *       Menu in which buttons can be added to implement this context menu
     *     </li>
     *   </ul>
     *   The function must return a (Boolean), indicating whether the context
     *   menu should be shown or not. The context menu will be shown when the
     *   handler function returns <code>true</code>. When the handler function
     *   returns <code>false</code> the context menu will <b>not</b> be shown.
     *
     * @param context {Object?this}
     *   Optional execution context for the callback (i.e. "this").
     *   If not provided, the {@link qx.ui.table.Table} object this mixin is
     *   applied to is used.
     *
     * @return {void}
     */
    setContextMenuHandler : function(col, handler, context)
    {
      this.__contextMenuHandler[col] = handler;
      this.__contextMenuHandlerContext[col] = context || this;
    },

    /**
     * Return the registered context menu handler for a column.
     *
     * @param col {Integer}
     *   The column number for which the context menu handler is requested
     *
     * @return {Function}
     *   The handler function which has been registered for the specified
     *   column. The arguments of the handler is documented in
     *   {@link #setContextMenuHandler}.
     */
    getContextMenuHandler : function(col)
    {
      return this.__contextMenuHandler[col];
    }
  },

  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this.__contextMenuHandler = null;
    this.__contextMenuHandlerContext = null;
  }
});
