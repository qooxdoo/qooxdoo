/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Useful for application like layouts where top-level scrollbars
 * are not available (internal panes scroll however).
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

    this.invalidateLayout();
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    // overridden
    isLayoutRoot : function() {
      return true;
    },


    // overridden
    _createOuterElement : function()
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
      this.invalidateLayout();
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
