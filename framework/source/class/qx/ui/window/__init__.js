/**
 * An internal window, similar to Windows' MDI child windows, based on qooxdoo widgets.
 *
 * *Example*
 *
 * Here is a little example of how to use the widget.
 *
 * <pre class='javascript'>
 * var win = new qx.ui.window.Window(
 *   "First Window",
 *   "icon/16/categories/internet.png"
 * );
 *
 * win.setPadding(10);
 * win.setLayout(new qx.ui.layout.VBox(10));
 * win.add(new qx.ui.form.Button("Hello World"));
 *
 * win.open();
 *</pre>
 *
 * This example creates a new window and adds a button to the window pane. The
 * window itself is autosized.
 *
 * Note that the parent widget must have a {@link qx.ui.layout.Basic} or
 * {@link qx.ui.layout.Canvas} layout.
 *
 * *External Documentation*
 *
 * <a href='http://qooxdoo.org/docs/#desktop/widget/window.md' target='_blank'>
 * Documentation of this widget in the qooxdoo manual.</a>
 */
