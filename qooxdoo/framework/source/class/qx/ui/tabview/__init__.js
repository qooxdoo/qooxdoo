/**
 * The tab view stacks several pages above each other and allows to switch
 * between them by using a list of buttons.
 *
 * The buttons are positioned on one of the tab view's edges.
 *
 * *Example*
 *
 * Here is a little example of how to use the widget.
 *
 * <pre class='javascript'>
 *   var tabView = new qx.ui.tabview.TabView();
 *
 *   var page1 = new qx.ui.tabview.Page("Layout", "icon/16/apps/utilities-terminal.png");
 *   page1.setLayout(new qx.ui.layout.VBox());
 *   page1.add(new qx.ui.basic.Label("Page Content"));
 *   tabView.add(page1);
 *
 *   var page2 = new qx.ui.tabview.Page("Notes", "icon/16/apps/utilities-notes.png");
 *   tabView.add(page2);
 *
 *   this.getRoot().add(tabView);
 * </pre>
 *
 * This example builds a tab view with two pages called "Layout" and "Notes".
 * Each page is a container widget, which can contain any other widget. Note
 * that the pages need layout to render their children.
 *
 * *External Documentation*
 *
 * <a href='http://qooxdoo.org/documentation/0.8/widget/tabview' target='_blank'>
 * Documentation of this widget in the qooxdoo wiki.</a>
 */
