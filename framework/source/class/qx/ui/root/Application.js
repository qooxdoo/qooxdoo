/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#require(qx.event.handler.Window)

************************************************************************ */

/**
 * This is the root widget for qooxdoo applications with an
 * "application" like behaviour. The widget will span the whole viewport
 * and the document body will have no scrollbars.
 *
 * If you want to enhance HTML pages with qooxdoo widgets please use
 * {@link qx.ui.root.Page} eventually in combination with
 * {@link qx.ui.root.Inline} widgets.
 *
 * This class uses a {@link qx.ui.layout.Canvas} as fixed layout. The layout
 * cannot be changed.
 */
qx.Class.define("qx.ui.root.Application",
{
  extend : qx.ui.root.Abstract,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param doc {Document} Document to use
   */
  construct : function(doc)
  {
    // Symbolic links
    this._window = qx.dom.Node.getWindow(doc);
    this._doc = doc;

    // Base call
    this.base(arguments);

    // Resize handling
    qx.event.Registration.addListener(this._window, "resize", this._onResize, this);

    // Use a hard-coded canvas layout
    this._setLayout(new qx.ui.layout.Canvas());

    // Directly schedule layout for root element
    qx.ui.core.queue.Layout.add(this);

    // Register as root
    qx.ui.core.FocusHandler.getInstance().connectTo(this);
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    // overridden
    _createContainerElement : function()
    {
      var doc = this._doc;

      // Apply application layout
      var hstyle = doc.documentElement.style;
      var bstyle = doc.body.style;

      hstyle.overflow = bstyle.overflow = "hidden";
      hstyle.padding = hstyle.margin = bstyle.padding = bstyle.margin = "0px";
      hstyle.width = hstyle.height = bstyle.width = bstyle.height = "100%";

      var elem = doc.createElement("div");
      doc.body.appendChild(elem);

      var root = new qx.html.Root(elem);
      root.setStyle("position", "absolute");

      return root;
    },


    /**
     * Listener for window's resize event
     *
     * @param e {qx.type.Event} Event object
     * @return {void}
     */
    _onResize : function(e) {
      qx.ui.core.queue.Layout.add(this);
    },


    // overridden
    _computeSizeHint : function()
    {
      var width = qx.bom.Viewport.getWidth(this._window);
      var height = qx.bom.Viewport.getHeight(this._window);

      return {
        minWidth : width,
        width : width,
        maxWidth : width,
        minHeight : height,
        height : height,
        maxHeight : height
      };
    }
  },




  /*
  *****************************************************************************
     DESTRUCT
  *****************************************************************************
  */

  destruct : function() {
    this._disposeFields("_window", "_doc");
  }
});
