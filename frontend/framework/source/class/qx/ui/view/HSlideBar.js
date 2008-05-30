/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's left-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Preliminary test class for overflow handling. Could be used
 * for scrolling tab panes etc. in the future.
 */
qx.Class.define("qx.ui.view.HSlideBar",
{
  extend : qx.ui.core.Widget,


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    this._setLayout(new qx.ui.layout.HBox());

    this._leftButton = new qx.ui.form.Button("<");
    this._rightButton = new qx.ui.form.Button(">");

    this._leftButton.exclude();
    this._rightButton.exclude();

    this._leftButton.addListener("click", this._scrollRight, this);
    this._rightButton.addListener("click", this._scrollLeft, this);

    this._scrollPane = new qx.ui.core.ScrollPane();
    this._scrollPane.addListener("update", this._onResize, this);

    // Add children to layout
    this._add(this._leftButton);
    this._add(this._scrollPane, {flex: 1});
    this._add(this._rightButton);
  },





  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Sets the content of the scroll area.
     *
     * @type member
     * @param value {qx.ui.core.Widget} Widget to insert
     * @return {void}
     */
    add : function(value) {
      this._scrollPane.add(value);
    },


    /**
     * Listener for resize event. This event is fired after the
     * first flush of the element which leads to another queueing
     * when the changes modify the visibility of the scroll buttons.
     *
     * @type member
     * @param e {Event} Event object
     * @return {void}
     */
    _onResize : function(e)
    {
      var content = this._scrollPane.getChild();
      if (!content) {
        return;
      }

      // Compute the rendered inner width of this widget.
      var areaInsets = this.getInsets();
      var areaSize = this.getBounds().width - areaInsets.left - areaInsets.right;

      // The final rendered width of the content
      var contentSize = content.getBounds().width;

      if (contentSize > areaSize) {
        this._showArrows();
      } else {
        this._hideArrows();
      }
    },


    /**
     * Show the arrows (Called from resize event)
     *
     * @type member
     * @return {void}
     */
    _showArrows : function()
    {
      this._leftButton.show();
      this._rightButton.show();
    },


    /**
     * Hide the arrows (Called from resize event)
     *
     * @type member
     * @return {void}
     */
    _hideArrows : function()
    {
      this._leftButton.exclude();
      this._rightButton.exclude();

      this._scrollPane.scrollToX(0);
    },


    /**
     * Scroll handler for left scrolling
     *
     * @type member
     * @return {void}
     */
    _scrollLeft : function() {
      this._scrollPane.scrollByX(20);
    },


    /**
     * Scroll handler for right scrolling
     *
     * @type member
     * @return {void}
     */
    _scrollRight : function() {
      this._scrollPane.scrollByX(-20);
    }
  }
});
