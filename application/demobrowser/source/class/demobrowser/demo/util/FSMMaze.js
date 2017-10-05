/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007 Derrell Lipman
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Derrell Lipman (derrell)
     * Tristan Koch (tristankoch)

************************************************************************ */

qx.Class.define("demobrowser.demo.util.FSMMaze",
{
  extend : qx.ui.container.Composite,

  statics :
  {
    Direction :
    {
      WEST  : 0x8,
      SOUTH : 0x4,
      EAST  : 0x2,
      NORTH : 0x1
    }
  },

  construct : function(rows, columns, x, y, cellSize)
  {
    this.base(arguments);
    this.setLayout(new qx.ui.layout.Grid());

    this.numRows  = (rows === undefined     ? 10 : rows);
    this.numCols  = (columns === undefined  ? 10 : columns);
    this.x        = (x === undefined        ? 50 : x);
    this.y        = (y === undefined        ? 50 : y);
    this.cellSize = (cellSize === undefined ? 50 : cellSize);

    this.totalHeight = this.numRows * this.cellSize;
    this.totalWidth = this.numCols * this.cellSize;

    this.setWidth(this.totalWidth);
    this.setHeight(this.totalHeight);

    for (var row = 0; row < this.numRows; row++)
    {
      this.getLayout().setRowHeight(row, this.cellSize);
    }

    for (var col = 0; col < this.numCols; col++)
    {
      this.getLayout().setColumnWidth(col, this.cellSize);
    }

    // Initialize the cells and walls arrays.  Walls are Border objects;
    // Cells are HorizontalBoxLayout objects.
    this.cells = [];

    // Each element of mazeInfo is a bitmap of walls
    // (demobrowser.demo.util.FSMMaze.Direction.*)
    this.mazeInfo = [];

    // Build a grid with all walls of all cells intact
    for (row = 0; row < this.numRows; row++)
    {
      this.cells[row] = [];
      this.mazeInfo[row] = [];

      for (col = 0; col < this.numCols; col++)
      {

        // Instantiate this cell
        this.cells[row][col] = new qx.ui.container.Composite();
        this.cells[row][col].setLayout(new qx.ui.layout.HBox());
        this.add(this.cells[row][col], {row: row, column: col});

        // Apply the border on the cell
        this.cells[row][col].setDecorator(new qx.ui.decoration.Decorator().set({
          width: 1,
          style: "solid",
          color: "black"
        }));

        // We're starting with all walls intact.  Note that.
        // See // demobrowser.demo.util.FSMMaze.Direction.* for the bit field values.
        this.mazeInfo[row][col] = 0xf;
      }
    }

    //
    // Build a "perfect" maze using the depth-first search algorithm described
    // at http://www.mazeworks.com/mazegen/mazetut/index.htm
    //

    var cellStack = [];
    var visitedCells = 1;
    var totalCells = this.numRows * this.numCols;
    var currentCell;
    var neighbors;
    var neighbor;

    // Start with some random cell
    currentCell =
      {
        row : Math.floor(Math.random() * this.numRows),
        col : Math.floor(Math.random() * this.numCols)
      };

    while (visitedCells < totalCells)
    {
      // Initialize neighbors of current cell array
      neighbors = [];

      // See if there's a west neighbor with all walls intact
      if (currentCell.col > 0 &&
          (this.mazeInfo[currentCell.row][currentCell.col - 1] == 0xf))
      {
        neighbors.push(
          {
            row             : currentCell.row,
            col             : currentCell.col - 1,
            currentCellWall : demobrowser.demo.util.FSMMaze.Direction.WEST,
            neighborWall    : demobrowser.demo.util.FSMMaze.Direction.EAST
          });
      }

      // See if there's a south neighbor with all walls intact
      if (currentCell.row < this.numRows - 1 &&
          (this.mazeInfo[currentCell.row + 1][currentCell.col] == 0xf))
      {
        neighbors.push(
          {
            row             : currentCell.row + 1,
            col             : currentCell.col,
            currentCellWall : demobrowser.demo.util.FSMMaze.Direction.SOUTH,
            neighborWall    : demobrowser.demo.util.FSMMaze.Direction.NORTH
          });
      }

      // See if there's an east neighbor with all walls intact
      if (currentCell.col < this.numCols - 1 &&
          (this.mazeInfo[currentCell.row][currentCell.col + 1] == 0xf))
      {
        neighbors.push(
          {
            row             : currentCell.row,
            col             : currentCell.col + 1,
            currentCellWall : demobrowser.demo.util.FSMMaze.Direction.EAST,
            neighborWall    : demobrowser.demo.util.FSMMaze.Direction.WEST
          });
      }

      // See if there's a north neighbor with all walls intact
      if (currentCell.row > 0 &&
          (this.mazeInfo[currentCell.row - 1][currentCell.col] == 0xf))
      {
        neighbors.push(
          {
            row             : currentCell.row - 1,
            col             : currentCell.col,
            currentCellWall : demobrowser.demo.util.FSMMaze.Direction.NORTH,
            neighborWall    : demobrowser.demo.util.FSMMaze.Direction.SOUTH
          });
      }

      // Did we find any neighbors with all walls intact?
      if (neighbors.length > 0)
      {
        // Yup.  Choose one at random
        var r = Math.floor(Math.random() * neighbors.length);
        neighbor = neighbors[r];

        // Knock down the wall between it and currentCell.  This is a
        // multiple-step process:

        // Step 1: Remove the wall flag on the current cell
        this.mazeInfo[currentCell.row][currentCell.col] &=
          ~neighbor.currentCellWall;

        // Step 2; Remove the wall flag on the neighbor cell
        this.mazeInfo[neighbor.row][neighbor.col] &=
          ~neighbor.neighborWall;

        // Step 3: Actually remove the wall on the current cell
        var currentWall = new qx.ui.decoration.Decorator().set({
          width: 1,
          style: "solid",
          color: "black"
        });
        var previousWall = this.cells[currentCell.row][currentCell.col].getDecorator();
        currentWall.set({
          widthLeft: previousWall.getWidthLeft(),
          widthBottom: previousWall.getWidthBottom(),
          widthRight: previousWall.getWidthRight(),
          widthTop: previousWall.getWidthTop()
        });
        switch(neighbor.currentCellWall)
        {
        case demobrowser.demo.util.FSMMaze.Direction.WEST:
          currentWall.setWidthLeft(0);
          break;

        case demobrowser.demo.util.FSMMaze.Direction.SOUTH:
          currentWall.setWidthBottom(0);
          break;

        case demobrowser.demo.util.FSMMaze.Direction.EAST:
          currentWall.setWidthRight(0);
          break;

        case demobrowser.demo.util.FSMMaze.Direction.NORTH:
          currentWall.setWidthTop(0);
          break;
        }
        this.cells[currentCell.row][currentCell.col].setDecorator(currentWall);

        // Step 4: Actually remove the wall on the neighbor cell
        var neighborWall = new qx.ui.decoration.Decorator().set({
          width: 1,
          style: "solid",
          color: "black"
        });
        var previousNeighborWall = this.cells[neighbor.row][neighbor.col].getDecorator();
        neighborWall.set({
          widthLeft: previousNeighborWall.getWidthLeft(),
          widthBottom: previousNeighborWall.getWidthBottom(),
          widthRight: previousNeighborWall.getWidthRight(),
          widthTop: previousNeighborWall.getWidthTop()
        });
        switch(neighbor.neighborWall)
        {
        case demobrowser.demo.util.FSMMaze.Direction.WEST:
          neighborWall.setWidthLeft(0);
          break;

        case demobrowser.demo.util.FSMMaze.Direction.SOUTH:
          neighborWall.setWidthBottom(0);
          break;

        case demobrowser.demo.util.FSMMaze.Direction.EAST:
          neighborWall.setWidthRight(0);
          break;

        case demobrowser.demo.util.FSMMaze.Direction.NORTH:
          neighborWall.setWidthTop(0);
          break;
        }
        this.cells[neighbor.row][neighbor.col].setDecorator(neighborWall);

        // Push currentCell onto the cell stack
        cellStack.push({ row : currentCell.row, col : currentCell.col });

        // The neighbor becomes our new current cell
        currentCell = { row : neighbor.row, col : neighbor.col };

        // We've visited one more cell
        visitedCells++;
      }
      else
      {
        // Pop the most recent cell from the cell stack
        var cell = cellStack.pop();
        currentCell = { row : cell.row, col : cell.col };
      }
    }

    // Determine the starting cell
    this.startCell =
      {
        row : Math.floor(Math.random() * this.numRows),
        col : Math.floor(Math.random() * this.numCols)
      }

    // Show the starting cell
    var startCell = this.cells[this.startCell.row][this.startCell.col];
    startCell.setBackgroundColor("#b0ffb0");

    // Determine the ending cell, not too close to the starting cell
    do
    {
      this.endCell =
        {
          row : Math.floor(Math.random() * this.numRows),
          col : Math.floor(Math.random() * this.numCols)
        }
    } while ((Math.abs(this.startCell.row - this.endCell.row) <
              this.numRows / 2) ||
             (Math.abs(this.startCell.col - this.endCell.col) <
              this.numCols / 2));

    // Show the ending cell
    var endCell = this.cells[this.endCell.row][this.endCell.col];
    endCell.setBackgroundColor("#ffb0b0");
  },

  members :
  {
    /**
     * Get the size of each cell.
     */
    getCellSize : function()
    {
      return this.cellSize;
    },

    /**
     * Get the starting cell.
     *
     * @return {Object}
     *   The returned object contains two members: row and col.
     */
    getStartCell : function()
    {
      return this.startCell;
    },

    /**
     * Get the ending cell.
     *
     * @return {Object}
     *   The returned object contains two members: row and col.
     */
    getEndCell : function()
    {
      return this.endCell;
    },

    /**
     * Get the position of the specified cell.
     *
     * @param cell {Object}
     *   The cell for which the position is desired.  This object contains two
     *   members: row and col.
     *
     * @return {Object}
     *   The returned object contains two members: top and left.
     */
    getCellTopLeft : function(cell)
    {
      return(
        {
          top  : this.y + (this.cellSize * cell.row),
          left : this.x + (this.cellSize * cell.col)
        });
    },

    /**
     * Get the neighbor cell to the specified cell's west.
     *
     * @param cell {Object}
     *   The cell for which the neighbor is desired.  This object contains two
     *   members: row and col.
     *
     * @return {Object|null}
     *   The returned object contains two members: row and col.
     *   If there is no such neighbor, null is returned.
     */
    getWestCell : function(cell)
    {
      var dir = demobrowser.demo.util.FSMMaze.Direction.WEST;
      if (cell.col > 0 &&
          ((this.mazeInfo[cell.row][cell.col] & dir) == 0))
      {
        return(
          {
            row : cell.row,
            col : cell.col - 1
          });
      }

      return null;
    },

    /**
     * Get the neighbor cell to the specified cell's south.
     *
     * @param cell {Object}
     *   The cell for which the neighbor is desired.  This object contains two
     *   members: row and col.
     *
     * @return {Object|null}
     *   The returned object contains two members: row and col.
     *   If there is no such neighbor, null is returned.
     */
    getSouthCell : function(cell)
    {
      var dir = demobrowser.demo.util.FSMMaze.Direction.SOUTH;
      if (cell.row <  this.numRows - 1 &&
          ((this.mazeInfo[cell.row][cell.col] & dir) == 0))
      {
        return(
          {
            row : cell.row + 1,
            col : cell.col
          });
      }

      return null;
    },

    /**
     * Get the neighbor cell to the specified cell's east.
     *
     * @param cell {Object}
     *   The cell for which the neighbor is desired.  This object contains two
     *   members: row and col.
     *
     * @return {Object|null}
     *   The returned object contains two members: row and col.
     *   If there is no such neighbor, null is returned.
     */
    getEastCell : function(cell)
    {
      var dir = demobrowser.demo.util.FSMMaze.Direction.EAST;
      if (cell.col < this.numCols - 1 &&
          ((this.mazeInfo[cell.row][cell.col] & dir) == 0))
      {
        return(
          {
            row : cell.row,
            col : cell.col + 1
          });
      }

      return null;
    },

    /**
     * Get the neighbor cell to the specified cell's north.
     *
     * @param cell {Object}
     *   The cell for which the neighbor is desired.  This object contains two
     *   members: row and col.
     *
     * @return {Object|null}
     *   The returned object contains two members: row and col.
     *   If there is no such neighbor, null is returned.
     */
    getNorthCell : function(cell)
    {
      var dir = demobrowser.demo.util.FSMMaze.Direction.NORTH;
      if (cell.row > 0 &&
          ((this.mazeInfo[cell.row][cell.col] & dir) == 0))
      {
        return(
          {
            row : cell.row - 1,
            col : cell.col
          });
      }

      return null;
    },

    /**
     * Mark the specified cell as part of the final backtrace.
     *
     * @param cell {Object}
     *   The cell to be marked.  This object contains two members: row and
     *   col.
     *
     * @return {Void}
     */
    markCell : function(cell)
    {
      var size = Math.ceil(this.cellSize / 5);
      var o = new qx.ui.basic.Label("&bull;", null, "html");
      o.set(
        {
          height : size,
          width : size,
          paddingTop : (this.cellSize - size) / 2,
          paddingLeft : (this.cellSize - size) / 2,
          rich : true
        });
      // {top: (this.cellSize - size) / 2, left: (this.cellSize - size) / 2}
      this.cells[cell.row][cell.col].add(o);
    }
  }
});
