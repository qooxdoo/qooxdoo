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

/**
 * This class is the root widget for qooxdoo applications with an
 * "application" like behaviour. The widget will span the whole viewport
 * and the document body will have no scrollbars.
 *
 * If you want to enhance HTML pages with qooxdoo widgets please use
 * {@link qx.ui2.root.Page} in combination with {@link qx.ui2.root.Inline}
 * widgets.
 *
 * This class uses a {@link qx.ui2.layout.Canvas} as fixed layout. The layout
 * cannot be changed.
 */
qx.Class.define("qx.ui2.root.Application",
{
  extend : qx.ui2.core.Widget,



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

    this.setLayout(new qx.ui2.layout.Canvas());
    this.scheduleLayoutUpdate();
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Adds a widget to the application using the application's canvas layout.
     *
     * @type member
     * @param widget {qx.ui2.core.Widget} the widget to add
     * @return {qx.ui2.root.Application} This object (for chaining support)
     */
    add : function(widget, options)
    {
      this.getLayout().add(widget, options);
      return this;
    },


    // overridden
    _isRootWidget : true,


    // overridden
    isLayoutRoot : function() {
      return true;
    },


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
     * @type member
     * @param e {qx.type.Event} Event object
     * @return {void}
     */
    _onResize : function(e) {
      this.scheduleLayoutUpdate();
    },


    // overridden
    _applyLayout : function(value, old)
    {
      if (old) {
        throw new Error("You cannot change the layout of qx.ui2.root.Application!");
      }

      this.base(arguments, value, old);
    },


    // overridden
    getSizeHint : function()
    {
      if (this._sizeHint) {
        return this._sizeHint;
      }

      var width = qx.bom.Viewport.getWidth(this._window);
      var height = qx.bom.Viewport.getHeight(this._window);

      var hint = {
        minWidth : width,
        width : width,
        maxWidth : width,
        minHeight : height,
        height : height,
        maxHeight : height
      };

      this._sizeHint = hint;
      this.debug("Compute size hint: ", hint);

      return hint;
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
