/**
 * The table widget is one of the most powerful included in the framework.
 *
 * It behaves like a grid common in desktop applications.
 *
 * The table is orgnized in columns and rows. The first row contains the
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
 * of {@link qx.ui.table.model.Abstract}.
 *
 * *Selection*
 *
 * The selection of a table is managed by a {@link qx.ui.table.selection.Manager}.
 */
