/**
 * The table can be used to display tabular data in a grid.
 *
 * The table is a very powerful widget. It is "virtual" in that the table
 * data can be of any length (e.g. hundreds of thousands of rows or more) yet
 * only the rows which are actually being viewed are rendered. As the user
 * scrolls up or down, the rendered rows are removed and the newly visible rows
 * are rendered in their place. Rendering a large amount of data is a very, very
 * slow operation, so being able to render only the visible rows has HUGE
 * benefits. You'll sometimes hear qx.ui.table.* referred to as simply "Table"
 * and sometimes as "Virtual Table". Those terms reference the same widget in
 * qooxdoo.
 *
 * The data supplied to (and displayed by) the Table widget can be entirely
 * resident in memory at the browser {@link qx.ui.table.model.Simple} or can be
 * fetched from a "backend" (web server) as it is needed to be displayed
 * {@link qx.ui.table.model.Remote} (and some can be pre-fetched too).
 * The data model you choose determines where and how the data is retrieved from.
 * {@link qx.ui.table.model.Simple} provides a simple model in which all of the
 * table data resides in memory at the browser; i.e. the whole data set is
 * resident as an array of arrays in the Simple data model. Alternatively,
 * {@link qx.ui.table.model.Remote} allows the data to be fetched from the
 * backend as it is needed. {@link qx.ui.table.model.Remote} is an abstract
 * class that you can extend by providing the actual communication to your
 * backend.
 *
 * The table is organized in columns and rows. The first row contains the
 * **column headers**. Column headers contain the title of the column and
 * allow to change its width, position (by drag and drop) and sorting.
 *
 * *Meta-columns*
 *
 * A **meta-column** combines one or more columns that should be
 * horizontally scrolled together. This way you can define for example
 * fixed columns that stay always visible on the left (or right) while the
 * other columns can be scrolled away.
 *
 * Take the demo http://demo.qooxdoo.org/current/demobrowser/html/example/Table_1.html
 * as example: If you make your browser window
 * very small (or make one of the columns very wide) so the table needs
 * horizontal scrolling, then the left column stays always visible. This is
 * because the left column is one meta-column and the other columns are in
 * another.
 *
 * *Model*
 *
 * The model represents the data of the grid.  It is implemented by a subclass
 * of {@link qx.ui.table.ITableModel}.
 *
 * *Selection*
 *
 * The selection of a table is managed by {@link qx.ui.table.selection.Manager}.
 *
 * *Example*
 *
 * *External Documentation*
 *
 * <a href='http://qooxdoo.org/documentation/0.8/widget/table' target='_blank'>
 * Documentation of this widget in the qooxdoo wiki.</a>
 */
