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
 * This classes could be used to insert qooxdoo islands into existing
 * web pages. You can use the isles to place any qooxdoo powered widgets
 * inside a layout made using traditional HTML markup and CSS.
 *
 * This class uses a {@link qx.ui2.layout.Basic} as fixed layout. The layout
 * cannot be changed.
 *
 * To position popups and tooltips please have a look at {@link qx.ui2.layout.Page}.
 */
qx.Class.define("qx.ui2.root.Inline",
{
  extend : qx.ui2.core.Widget,






  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param el {Element} DOM element to use as isle for qooxdoo content. Please
   *   note that existing content gets removed on the first layout flush.
   */
  construct : function(el)
  {
    // Symbolic links
    this._elem = el;

    // Base call
    this.base(arguments);

    // Make relative
    el.style.position = "relative";

    this.setLayout(new qx.ui2.layout.Basic());
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
     * Adds a widget to the isle using a basic layout.
     *
     * Please have a look at the {@link qx.ui2.layout.Basic#add} for further
     * argument details.
     *
     * @type member
     * @param widget {qx.ui2.core.Widget} the widget to add
     * @param left {Integer} left position on the page
     * @param top {Integer} top position on the page
     * @param options {Map?null} Optional layout data for widget.
     * @return {qx.ui2.root.Inline} This object (for chaining support)
     */
    add : function(widget, left, top, options)
    {
      this.getLayout().add(widget, left, top, options);

      // Chaining support
      return this;
    },


    // overridden
    isRootWidget : function() {
      return true;
    },


    // overridden
    isLayoutRoot : function() {
      return true;
    },


    // overridden
    _createContainerElement : function()
    {
      var root = new qx.html.Root(this._elem);
      delete this._elem;

      return root;
    }
  },




  /*
  *****************************************************************************
     DESTRUCT
  *****************************************************************************
  */

  destruct : function() {
    this._disposeFields("_elem");
  }
});
