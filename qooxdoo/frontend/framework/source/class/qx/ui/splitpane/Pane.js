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
     * Jonathan Rass (jonathan_rass)

 ************************************************************************ */

qx.Class.define("qx.ui.splitpane.Pane",
{
  extend : qx.ui.core.Widget,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * Creates a new instance of a SplitPane. It allows the user to dynamically resize
   * the areas dropping the border between.
   *
   * new qx.ui.splitpane.SplitPane(orientation)
   * new qx.ui.splitpane.SplitPane(orientation, firstSize, secondSize)
   *
   * @appearance splitpane
   *
   * @param orientation {String} The orientation of the splitpane control. Allowed values are "horizontal" (default) and "vertical". This is the same type as used in {@link qx.legacy.ui.layout.BoxLayout#orientation}.
   * @param firstSize {String} The size of the left (top) pane. Allowed values are any by {@link qx.ui.core.Widget} supported unit.
   * @param secondSize {String} The size of the right (bottom) pane. Allowed values are any by {@link qx.ui.core.Widget} supported unit.
   */
  construct : function(orientation, firstSize, secondSize)
  {
    this.base(arguments);

    this.__orientation = orientation == "vertical" ? "vertical" : "horizontal";
    this.__minSplitterSize = 5;
    this.__sizes = {};

    // Create and add container
    this._setLayout(new qx.ui.layout.Split(this.__orientation));

    // Create and add slider
    this._slider = new qx.ui.splitpane.Slider(this);
    this._slider.exclude();
    this._add(this._slider, {type : "slider"});

    // Create splitter
    this._splitter = new qx.ui.splitpane.Splitter(this);
    this._add(this._splitter, {type : "splitter"});

    /*
     * Add events to widgets
     */

    /*
     * Note that mouseUp and mouseDown events are added to the widget itself because
     * if the splitter is smaller than 5 pixels in length or height it is difficult
     * to click on it.
     * By adding events to the widget the splitter can be activated if the cursor is
     * near to the splitter widget.
     */
     /*
    this.addListener("mousedown", this.__mouseDown, this);

    this.addListener("mouseup", this.__mouseUp, this);
    this.addListener("losecapture", this.__mouseUp, this);

    this.addListener("mousemove", this.__mouseMove, this);
    */
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /**
     * Appearance change
     */
    appearance :
    {
      refine : true,
      init : "splitpane"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /*
    ---------------------------------------------------------------------------
      PUBLIC METHODS
    ---------------------------------------------------------------------------
    */

    add : function(widget, flex)
    {
      if (flex == null) {
        this._add(widget);
      } else {
        this._add(widget, {flex : flex});
      }
    },

    remove : function(widget) {
      this._remove(widget);
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    // TODO
  }
});
