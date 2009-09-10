/**
 * This Progressive widget "renders" tasks progressively, i.e. it returns
 * control to the browser periodically possibly allowing user interaction
 * prior to completion of the full task..
 *
 * The concept "render" is used quite loosely, in that it could be building
 * part of a GUI or it could be loading the next successive portion of a table,
 * or it could be doing any partial task which requires periodically returning
 * control to the browser to allow user interaction.
 *
 * This is a general purpose widget that happens to come packaged with some
 * useful renderers:
 *
 *   - A progressive loader, that periodically shows the GUI state as more of
 *     the gui is being built;
 *
 *   - A table renderer that produces a table very similar in appearance to
 *     qx.ui.table.Table but with a different set of features.  In particular,
 *     this table allows variable row height.
 */
