 /**
 * Popups are widgets which can be placed on top of the application.
  *
  * *Example*
  *
  * Here is a little example of how to use the widget.
  *
  * <pre class='javascript'>
  * var button = new qx.ui.form.Button("Open Popup #1");
  * var popup = new qx.ui.popup.Popup(new qx.ui.layout.Canvas()).set({
  *   backgroundColor: "#FFFAD3",
  *   padding: [2, 4],
  *   offset : 3,
  *   offsetBottom : 20
  * });
  *
  * popup.add(new qx.ui.basic.Atom("Hello World #1", "icon/32/apps/media-photo-album.png"));
  *
  * button.addListener("click", function(e)
  * {
  *   popup.placeToMouse(e);
  *   popup.show();
  * }, this);
  * </pre>
  *
  * This example creates a ToolTip and assigns it to a button. When the user hovers the
  * button the tooltip is shown.
  *
  * *External Documentation*
  *
  * <a href='http://manual.qooxdoo.org/${qxversion}/pages/widget/popup.html' target='_blank'>
  * Documentation of this widget in the qooxdoo manual.</a>
  */
