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
        // Stop any previously running timer
        if (this._contextMenuTimer)
        {
          this._contextMenuTimer.dispose();
          this._contextMenuTimer = null;
        }

        // Dispose of any previously existing context menu
        if (this._contextMenu)
        {
          // Dispose of the context menu.
          this._contextMenu.hide();
          this.setContextMenu(null);
          this.getApplicationRoot().remove(this._contextMenu);
          this._contextMenu.dispose();
          this._contextMenu = null;
        }

        // Get the context menu handler for the column on which the context
        // menu request was issued.
        var col = e.getColumn();
        var contextMenuHandler = this.getContextMenuHandler(col);

        // If there's no context menu handler for this column, we have nothing
        // to do.
        if (contextMenuHandler == null)
        {
          return;
        }

        // Get the data model
        var dm = this.getTableModel();

        // Create a context menu for this tree.
        this._contextMenu = new qx.ui.menu.Menu();

        // Don't display context menus from the context menu
        this._contextMenu.addListener("contextmenu",
                                      function(e)
                                      {
                                        e.preventDefault();
                                      });

        // Call the context menu handler for this column.
        var bShowContextMenu = contextMenuHandler(col,
                                              e.getRow(),
                                              this,
                                              dm,
                                              this._contextMenu);

        // If we were told not to display the context menu...
        if (! bShowContextMenu)
        {
          // ... then we're all done here.
          this._contextMenu.dispose();
          return;
        }

        // Set the context menu
        this.setContextMenu(this._contextMenu);
      },
      this);

    // Provide an array in which context menu handlers will be stored.  The
    // array is indexed by column number.
    this.__contextMenuHandler = [ ];
  },

  members :
  {
    __contextMenuHandler : null,

    /**
     * Add a handler for a context menu which is initiated in a specific
     * column.
     *
     * @param col {Integer}
     *   The column number in which the context menu request originated
     *
     * @param handler {Function}
     *   The function to call when a context menu request originates in the
     *   specified column.
     *
     * @return {void}
     */
    setContextMenuHandler : function(col, handler)
    {
      this.__contextMenuHandler[col] = handler;
    },

    /**
     * Return the registered context menu handler for a column.
     *
     * @param col {Integer}
     *   The column number for which the context menu handler is requested
     *
     * @return
     *   The handler function which has been registered for the specified
     *   column.
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

  destruct : function() {
    this.__contextMenuHandler = null;
  }
});
