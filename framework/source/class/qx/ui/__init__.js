/**
 * The qooxdoo GUI toolkit includes a large set of widgets and layouts to
 * create your application's user interface. This is what you want to look at if
 * you are building a GUI application.
 *
 * <h2>GUI Widgets and Facilities</h2>
 *
 * The <strong>qx.ui</strong> namespace contains classes to construct graphical user
 * interfaces. This is a rich and diverse namespace containing packages and
 * classes on varying levels of granularity, from component-like date chooser
 * and complex high-level tree widgets over primitive GUI elements (like atoms)
 * to various kinds of helper classes that make the widgets work. This package
 * description can only provide a coarse overview to give you a head start.
 * Follow the provided links to the individual packages and classes to get more
 * detailed information.
 * <p>
 * To <strong>build a GUI</strong> it is usually a good idea to start with one of the
 * <strong>qx.ui.container</strong> widgets, add a layout manager and then some functional
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
 * Make sure you also check the <a href="http://www.qooxdoo.org/docs/#/README?id=getting-started">"hello world" tutorial</a> for a minimal working application with GUI elements.
 *
 * Here is a <strong>topical grouping</strong> of useful widgets and packages for GUI creation:
 * <ul>
 *   <li><b>Laying the groundwork for your GUI:</b><br/>
 *     {@link container}</li>
 *
 *   <li><b>Organizing what's on the screen:</b><br/>
 *     {@link tabview}; {@link splitpane} (dividing the screen);
 *     {@link groupbox}, {@link embed}</li>
 *
 *   <li><b>Typical user interaction widgets:</b><br/>
 *     {@link qx.ui.basic.Label}, {@link qx.ui.form.Button}, {@link qx.ui.form.TextField}</li>
 *
 *   <li><b>Highly specialized interaction widgets:</b><br/>
 *     The classes of the <b>qx.ui.tree*</b> packages (like
 *     {@link qx.ui.tree.Tree}); {@link qx.ui.table}</li>
 *
 *   <li><b>Making it all work:</b><br/>
 *     {@link qx.event}; {@link qx.data}</li>
 *
 *   <li><b>The icing:</b> Here are some packages that are relevant for advanced
 *     features of your GUI app:<br/>
 *     {@link qx.theme}</li>
 * </ul>
 *
 * Following is a complete list of the available *qx.ui* packages:
 *
 */
