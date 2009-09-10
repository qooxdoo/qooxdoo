/**
 * The general idea behind the pageviews is to have multiple pages stacked upon
 * each other. Each page can contain further elements, like widgets, text, etc.
 * One page is always "on top" i.e. visible, the others are "beneath" it i.e.
 * obscured. You can switch between the different pages, making one visible at
 * any one time. All of the time the pageview occupies constant space in your
 * GUI.
 *
 * Technically, a pageview is divided into the <b>bar</b> that holds the
 * controls to switch between different pages, and the <b>pane</b> which is the
 * area where the actual page contents is displayed. Obviously, there has to be
 * a link between the navigational controls and the pages, so the pageview knows
 * what to display when you select a control.
 *
 * The different incarnations of the pageview differentiate themselves by how
 * you switch between pages, i.e. the controls in the pageview bar. So it is
 * basically a matter of preference whether you choose a {@link
 * qx.legacy.ui.pageview.buttonview.ButtonView ButtonView}, a {@link
 * qx.legacy.ui.pageview.radioview.RadioView RadioView} or a {@link
 * qx.legacy.ui.pageview.tabview.TabView TabView}.
 *
 * After creating the basic pageview widget you add buttons to the bar (using
 * pageview.getBar()) and pages to the pane (using pageview.getPane()), which
 * take a button as a constructor argument. A brief example:
 *
 * <pre class='javascript'>
 * var pv = new qx.legacy.ui.pageview.buttonview.ButtonView();
 * var b1 = new qx.legacy.ui.pageview.buttonview.Button("A");
 * var p1 = new qx.legacy.ui.pageview.buttonview.Page(b1);
 * pv.getBar().add(b1);
 * pv.getPane().add(p1);
 * </pre>
 */
