/**
 * The qooxdoo GUI toolkit includes a large set of widgets and layouts to 
 * create your application's user interface. This is what you want to look at if
 * you are building a GUI application.
 *
 * *GUI Widgets and Facilities*
 *
 * The *qx.ui* namespace contains classes to construct graphical user
 * interfaces. This is a rich and diverse namespace containing packages and
 * classes on varying levels of granularity, from component-like date chooser
 * and complex high-level tree widgets over primitive GUI elements (like atoms)
 * to various kinds of helper classes that make the widgets work. This package
 * description can only provide a coarse overview to give you a head start.
 * Follow the provided links to the individual packages and classes to get more
 * detailed information.
 *
 * To *build a GUI* it is usually a good idea to start with one of the
 * *qx.ui.container* widgets, add a layout manager and then some functional
 * widgets to it. This helps you to organize your application.  A
 * minimal example for creating a user interface might look like this:
 *
 * <pre class='javascript'>
 * var c = new qx.ui.container.Composite(new qx.ui.layout.Grow); // this adds the layout manager in one go
 * var b = new qx.ui.form.Button("Push me!");
 * c.add(b);
 * var l = new qx.ui.basic.Label("Don't push this button!");
 * c.add(l);
 * b.addListener("execute", function (e) {
 *    alert("Argh ... you did it!");
 * }, this);
 * </pre>
 *
 * Make sure you also check the <a href="http://qooxdoo.org/documentation/0.8/helloworld">
 * "hello world" tutorial</a> for a minimal working application with GUI elements.
 *
 * Here is a *topical grouping* of useful widgets and packages for GUI creation:
 *
 *   * <b>Laying the groundwork for your GUI:</b>
 *     {@link container}
 *
 *   * <b>Organising what's on the screen:</b>
 *     {@link tabview}; {@link splitpane} (dividing the screen);
 *     {@link groupbox}, {@link embed}
 *
 *   * <b>Typical user interaction widgets:</b>
 *     {@link qx.ui.basic.Label}, {@link qx.ui.form.Button}, {@link qx.ui.form.TextField}
 *
 *   * <b>Highly specialised interaction widgets:</b>
 *     The classes of the <b>qx.ui.tree*</b> packages (like
 *     {@link qx.ui.tree.Tree}); {@link qx.ui.table}
 *
 *   * <b>Effects:</b>
 *     {@link qx.fx qx.fx (outside this package)}; {@link popup} (containing {@link qx.ui.popup.ToolTip ToolTips});
 *
 *   * <b>Making it all work:</b>
 *     {@link qx.event};
 *
 *   * <b>The icing:</b> Here are some packages that are relevant for advanced
 *     features of your GUI app:
 *     {@link qx.theme};
 *
 * Following is a complete list of the available *qx.ui* packages:
 *
 */
