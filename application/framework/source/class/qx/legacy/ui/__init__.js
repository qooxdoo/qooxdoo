/**
 * *GUI Widgets and Facilities*
 *
 * The *qx.legacy.ui* namespace contains classes to construct graphical user
 * interfaces. This is a rich and diverse namespace containing packages and
 * classes on varying levels of granularity, from component-like date chooser
 * and complex high-level tree widgets over primitive GUI elements (like atoms)
 * to various kinds of helper classes that make the widgets work. This package
 * description can only provide a coarse overview to give you a head start.
 * Follow the provided links to the individual packages and classes to get more
 * detailed information.
 *
 * To *build a GUI* it is usually a good idea to start with one of the
 * *qx.legacy.ui.layout* managers, and then add functional widgets to them. This helps
 * you to visually organize your application.
 * A minimal example for creating a user interface might look like this:
 *
 * <pre class='javascript'>
 * var h = new qx.legacy.ui.layout.HorizontalBoxLayout();
 * var b = new qx.legacy.ui.form.Button("Push me!");
 * h.add(b);
 * var l = new qx.legacy.ui.basic.Label("Don't push this button!");
 * h.add(l);
 * b.addListener("execute", function (e) {
 *    alert("Argh ... you did it!");
 * }, this);
 * </pre>
 *
 * Make sure you also check the <a href="http://qooxdoo.org/documentation/current/user_manual/skeleton">
 * skeleton</a> for a minimal working application with GUI elements.
 *
 * Here is a *topical grouping* of useful widgets and packages for GUI creation:
 *
 *   * <b>Laying the groundwork for your GUI:</b>
 *     {@link qx.legacy.ui.layout}, e.g. {@link qx.legacy.ui.layout.VerticalBoxLayout},
 *     {@link qx.legacy.ui.layout.HorizontalBoxLayout}, {@link qx.legacy.ui.layout.CanvasLayout}
 *
 *   * <b>Organising what's on the screen:</b>
 *     {@link qx.legacy.ui.pageview} (e.g. for tabs); {@link qx.legacy.ui.splitpane} (dividing the screen);
 *     {@link qx.legacy.ui.groupbox}, {@link qx.legacy.ui.embed}
 *
 *   * <b>Typical user interaction widgets:</b>
 *     {@link qx.legacy.ui.basic.Label}, {@link qx.legacy.ui.form.Button}, {@link qx.legacy.ui.form.TextField}
 *
 *   * <b>Highly specialised interaction widgets:</b>
 *     The classes of the <b>qx.legacy.ui.tree*</b> packages (like
 *     {@link qx.legacy.ui.tree.Tree}); {@link qx.legacy.ui.table}
 *
 *   * <b>Components:</b>
 *     {@link qx.legacy.ui.component}
 *
 *   * <b>Effects:</b>
 *     {@link qx.legacy.ui.animation}; {@link qx.legacy.ui.popup} (containing {@link qx.legacy.ui.popup.ToolTip ToolTips});
 *
 *   * <b>Making it all work:</b>
 *     Look at <b>*Manager</b> classes (like {@link qx.legacy.ui.tree.SelectionManager}) in the
 *     various *qx.legacy.ui* packages, which are important for event handling; in
 *     order to make your application work, you will also have to concern
 *     yourself with qooxdoo classes outside the *qx.legacy.ui* namespace, like
 *     {@link qx.legacy.event};
 *
 *   * <b>The icing:</b> Here are some packages that are relevant for advanced
 *     features of your GUI app:
 *     {@link qx.legacy.theme};
 *
 * Following is a complete list of the available *qx.legacy.ui* packages:
 *
 */
