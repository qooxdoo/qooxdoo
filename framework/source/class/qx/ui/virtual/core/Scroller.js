/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's left-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * The ScrollArea provides a container widget with on demand scroll bars
 * if the content size exceeds the size of the container.
 */
qx.Class.define("qx.ui.virtual.core.Scroller",
{
  extend : qx.ui.core.AbstractScrollArea,


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(rowCount, columnCount, cellHeight, cellWidth)
  {
    this.base(arguments);

    this.pane = new qx.ui.virtual.core.Pane(rowCount, columnCount, cellHeight, cellWidth);
    this.pane.addListener("update", this._computeScrollbars, this);  
    this.pane.addListener("scrollX", this._onScrollPaneX, this);
    this.pane.addListener("scrollY", this._onScrollPaneY, this);

    this._add(this.pane, {row: 0, column: 0});    
  },


  /*
   *****************************************************************************
      PROPERTIES
   *****************************************************************************
   */

   properties :
   {
     // overridden
     width :
     {
       refine : true,
       init : null
     },


     // overridden
     height :
     {
       refine : true,
       init : null
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
      CHILD CONTROL SUPPORT
    ---------------------------------------------------------------------------
    */

    // overridden
    _createChildControlImpl : function(id)
    {
      var control;

      if (id == "pane") {
        return this.pane;
      } else {
        return this.base(arguments, id); 
      }
    },


    /*
    ---------------------------------------------------------------------------
      ITEM LOCATION SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Returns the top offset of the given item in relation to the
     * inner height of this widget.
     *
     * @param item {qx.ui.core.Widget} Item to query
     * @return {Integer} Top offset
     */
    getItemTop : function(item) {
      // TODO
    },


    /**
     * Returns the top offset of the end of the given item in relation to the
     * inner height of this widget.
     *
     * @param item {qx.ui.core.Widget} Item to query
     * @return {Integer} Top offset
     */
    getItemBottom : function(item) {
      // TODO
    },


    /**
     * Returns the left offset of the given item in relation to the
     * inner width of this widget.
     *
     * @param item {qx.ui.core.Widget} Item to query
     * @return {Integer} Top offset
     */
    getItemLeft : function(item) {
      // TODO
    },


    /**
     * Returns the left offset of the end of the given item in relation to the
     * inner width of this widget.
     *
     * @param item {qx.ui.core.Widget} Item to query
     * @return {Integer} Right offset
     */
    getItemRight : function(item) {
      // TODO
    },
    
    /*
    ---------------------------------------------------------------------------
      EVENT LISTENERS
    ---------------------------------------------------------------------------
    */

    // overridden
    _onScrollBarX : function(e) {
      this.getChildControl("pane").setScrollX(e.getData());
    },


    // overridden
    _onScrollBarY : function(e) {
      this.getChildControl("pane").setScrollY(e.getData());
    }    
  }
});
