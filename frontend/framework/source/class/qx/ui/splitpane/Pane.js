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
   * @appearance splitpane
   * @param orientation {String} The orientation of the splitpane control. Allowed values are "horizontal" (default) and "vertical". This is the same type as used in {@link qx.legacy.ui.layout.BoxLayout#orientation}.
   */
  construct : function(orientation)
  {
    this.base(arguments);

    // Create and add slider
    this._slider = new qx.ui.splitpane.Slider(this);
    this._slider.exclude();
    this._add(this._slider, {type : "slider"});

    // Create splitter
    this._splitter = new qx.ui.splitpane.Splitter(this);
    this._add(this._splitter, {type : "splitter"});

    // Initialize orientation
    if (orientation) {
      this.setOrientation(orientation);
    } else {
      this.initOrientation();
    }




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
    },


    orientation :
    {
      check : [ "horizontal", "vertical" ],
      apply : "_applyOrientation"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    _applyOrientation : function(value, old)
    {
      this._setLayout(value === "vertical" ? new qx.ui.layout.VSplit : new qx.ui.layout.HSplit);
      this.debug("Use layout: " + this._getLayout());

      var splitter = this._splitter;
      var slider = this._slider;

      if (old)
      {
        splitter.removeState(old);
        slider.removeState(old);
      }

      if (value)
      {
        splitter.addState(value);
        slider.addState(value);
      }
    },




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
