/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2008 Bill Adams, http://mywebserve.com
     2009 Derrell Lipman

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Bill Adams (badams)
     * Derrell Lipman (derrell)

************************************************************************ */

/**
 * ColumnMenu
 *
 * Column Visibility Popup Menu for Table
 * 
 */
qx.Class.define("qx.ui.table.columnmenu.grid.Menu",
{
  extend    : qx.ui.popup.Popup,


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param table {qx.ui.table.Table}
   */  	
  construct : function(table)
  {
    this.base(arguments);
    this.__table = table;
    this.__numRows = 0;
    this.setLayout(new qx.ui.layout.Grid);

    // Listen for menu creation staring so we can create our two columns
    table.addListener("columnVisibilityMenuCreateStart",
                      function(e)
                      {
                        this.__numRows = 0;

                        var visible = new qx.ui.basic.Atom("Visible");
                        visible.set(
                          {
                            center : true
                          });
                        this.add(visible, { row: this.__numRows, column: 0 });

                        var hidden = new qx.ui.basic.Atom("Hidden");
                        hidden.set(
                          {
                            center: true
                          });
                        this.add(hidden, { row: this.__numRows, column: 1 });
                        this.__numRows++;

                        var props =
                          {
                            selectionMode : "additive",
                            draggable     : true,
                            droppable     : true
                          };

                        this.__showList = new qx.ui.form.List();
                        this.__showList.set(props);
                        this.__hideList = new qx.ui.form.List();
                        this.__hideList.set(props);

                        this.add(this.__showList,
                                 {
                                   row: this.__numRows,
                                   column: 0
                                 });
                        this.add(this.__hideList,
                                 {
                                   row: this.__numRows,
                                   column: 1
                                 });

                        this.__numRows++;
                        
                        this.__showList.addListener("dragstart",
                                                    this._dragstart);
                        this.__hideList.addListener("dragstart",
                                                    this._dragstart)
                        this.__hideList.addListener("drop",
                                                    this._hide,
                                                    this);
                        this.__showList.addListener("drop",
                                                    this._show,
                                                    this);
        
                        table.addListener(
                          "resize", function(e)
                          {
                            var height =
                              Math.round(table.getBounds().height * 0.8);
                            
                            this.__showList.set(
                              {
                                height: height
                              });
                            
                            this.__hideList.set(
                              {
                                height: height
                              });
                          },
                          this);
                      },
                      this);

  },



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __table : null,
    __showList : null,
    __hideList : null,
    __inSetColumnVisible : false,
    
    /**
     * Return the showList object
     */
    getShowList : function()
    {
      return this.__showList;
    },

    /**
     * Return the hideList object
     */
    getHideList : function()
    {
      return this.__hideList;
    },

    /**
     * Add a widget to the menu
     * 
     * @param {qx.ui.core.Widget} widget
     * @param {Map} options
     */
    add : function(widget, options)
    {
      if (options === undefined || options == null)
      {
        // Add widget in a new row
        var props =
          {
            row     : this.__numRows,
            column  : 0,
            colSpan : 2				
          }; 			
        this.__numRows++;
      }
      else
      {
        var props = options;
      }
        
      this.base(arguments, widget, props);
    },

    
    /**
     * Enable dragging a showList or hideList item
     */
    _dragstart : function(e)
    {
      // disable dropping on myself - re-enable during drop event
      e.getTarget().set({droppable: false});
      e.addType("items");
      e.addAction("move");
    },


    /**
     * Handle drop event on the column hideList
     */
    _hide : function(e)
    {
      this.__showList.set({droppable: true});  // re-enable after dragstart
      this._setVisibility(false, this.__showList, this.__hideList);
    },

    
    /**
     * Handle drop event on the column showList
     */
    _show : function(e)
    {
      this.__hideList.set({droppable: true});  // re-enable after dragstart
      this._setVisibility(true, this.__hideList, this.__showList);
    },


    /**
     * Process one column visibility change and schedule next change, if any.
     * The event handlers can deal with only one change at a time.
     */
    _setVisibility : function(value, fromList, toList)
    {
      // Ignore recursive calls via setColumnVisible()
      if (this.__inSetColumnVisible)
      {
        return;
      }
      var selection = fromList.getSelection();
      var col = selection[0].getValue();
      var columnModel = this.__table.getTableColumnModel();

      this.__inSetColumnVisible = true;
      columnModel.setColumnVisible(col, value);
      this.__inSetColumnVisible = false;

      fromList.remove(selection[0]);
        
      // Preserve column order in lists
      var children = toList.getChildren();
      for (var i=0; i<children.length; i++)
      {
        var childCol = children[i].getValue();
        if (childCol > col)
        {
          break;
        }
      }
        
      if (i < children.length)
      {
        toList.addBefore(selection[0], children[i]);
      }
      else
      {
        toList.add(selection[0]);
      }
        
      if (selection.length > 1)
      {
        // Allow time to process this event before triggering next event
        if (value)
        {
          qx.event.Timer.once(this._show, this, 10);
        }
        else
        {
          qx.event.Timer.once(this._hide, this, 10);
        }
      }
    }
  }
});
