/**
 * SplitPane is used to divide two Widgets. These widgets can be resized using by clicking the splitter widget and moving the slider.
 * The orientation property states if the widgets should be aligned horizontally or vertically.
 *
 * *Example*
 *
 * Here is a little example of how to use the widget.
 *
 * <pre class='javascript'>
 * var pane = new qx.ui.splitpane.Pane("vertical");
 * var leftWidget = new qx.ui.form.TextArea("Fixed");
 * leftWidget.setWidth(100);
 * leftWidget.setWrap(true);
 * var rightWidget = new qx.ui.form.TextArea("Flex")
 *
 * pane.add(leftWidget, 0);
 * pane.add(rightWidget, 1);
 *
 * container.add(pane, {left: 10, top: 10});
 *</pre>
 *
 * This example creates a new horizontal SplitPane and adds two TextArea widgets. The
 * first TextArea has a static (flex value 0) size of 100px, the second one will use the
 * available space (flex value 1) for its width.
 *
 * *External Documentation*
 *
 * <a href='http://qooxdoo.org/documentation/0.8/ui/splitpane' target='_blank'>
 * Documentation of this widget in the qooxdoo wiki.</a>
 */
