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
     * Andreas Ecker (ecker)

************************************************************************ */

/**
 * @appearance list
 */
qx.Class.define("qx.ui.form.List",
{
  extend : qx.ui.core.ScrollArea,
  include : [ qx.ui.core.MRemoteChildrenHandling ],




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param mode {String?"single"} The selection mode to use ({@link #selectionMode})
   * @param horizontal {Boolean?false} Whether the list should be horizontal.
   */
  construct : function(mode, horizontal)
  {
    this.base(arguments);

    // Create content
    this.__content = new qx.ui.container.Composite();
    this.__content.setAllowShrinkX(false);
    this.__content.setAllowShrinkY(false);

    // Add to scrollpane
    this._scrollPane.setContent(this.__content);

    // Apply orientation
    if (!!horizontal) {
      this.setOrientation("horizontal");
    } else {
      this.initOrientation();
    }

    // Create selection manager
    this.__manager = new qx.ui.core.selection.ScrollArea(this);
    this.__manager.addListener("change", this._onSelectionChange, this);

    // Apply selection mode
    if (mode != null) {
      this.setSelectionMode(mode);
    }

    // Add event listeners
    this.addListener("mousedown", this._onMouseDown);
    this.addListener("mouseup", this._onMouseUp);
    this.addListener("mousemove", this._onMouseMove);
    this.addListener("losecapture", this._onLoseCapture);
    this.addListener("keypress", this._onKeyPress);
  },





  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events :
  {
    /** Fires after the selection was modified */
    change : "qx.event.type.Event"
  },





  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    // overridden
    appearance :
    {
      refine : true,
      init : "list"
    },

    // overridden
    focusable :
    {
      refine : true,
      init : true
    },


    /**
     * The selection mode to use.
     *
     * For further details please have a look at:
     * {@link qx.ui.core.selection.Abstract#mode}
     */
    selectionMode :
    {
      check : [ "single", "multi", "additive" ],
      init : "single",
      apply : "_applySelectionMode"
    },


    /**
     * Whether the list should be rendered horizontal or vertical.
     */
    orientation :
    {
      check : ["horizontal", "vertical"],
      init : "vertical",
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
    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    // property apply
    _applySelectionMode : function(value, old) {
      this.__manager.setMode(value);
    },


    // property apply
    _applyOrientation : function(value, old)
    {
      var horizontal = value === "horizontal";

      // Create new layout
      var layout = horizontal ? new qx.ui.layout.HBox : new qx.ui.layout.VBox;

      // Replace layout
      this.__content.setLayout(layout);

      // Reconfigure content
      this.__content.setAllowGrowX(!horizontal);
      this.__content.setAllowGrowY(horizontal);
    },





    /*
    ---------------------------------------------------------------------------
      WIDGET API
    ---------------------------------------------------------------------------
    */

    // overridden
    getChildrenContainer : function() {
      return this.__content;
    },





    /*
    ---------------------------------------------------------------------------
      EVENT HANDLER
    ---------------------------------------------------------------------------
    */

    /**
     * Event listener for <code>change</code> event on selection manager.
     *
     * @type member
     * @param e {qx.event.type.Data} Data event
     * @return {void}
     */
    _onSelectionChange : function(e)
    {
      // Fire an identically configured event again
      this.fireDataEvent("change", e.getData());
    },


    /**
     * Event listener for <code>mousedown</code> events.
     *
     * @type member
     * @param e {qx.event.type.Mouse} Mousedown event
     * @return {void}
     */
    _onMouseDown : function(e) {
      this.__manager.handleMouseDown(e);
    },


    /**
     * Event listener for <code>mouseup</code> events.
     *
     * @type member
     * @param e {qx.event.type.Mouse} Mousedown event
     * @return {void}
     */
    _onMouseUp : function(e) {
      this.__manager.handleMouseUp(e);
    },


    /**
     * Event listener for <code>mousemove</code> events.
     *
     * @type member
     * @param e {qx.event.type.Mouse} Mousedown event
     * @return {void}
     */
    _onMouseMove : function(e) {
      this.__manager.handleMouseMove(e);
    },


    /**
     * Event listener for <code>losecapture</code> events.
     *
     * @type member
     * @param e {qx.event.type.Mouse} Losecapture event
     * @return {void}
     */
    _onLoseCapture : function(e) {
      this.__manager.handleLoseCapture(e);
    },


    /**
     * Event listener for <code>keypress</code> events.
     *
     * @type member
     * @param e {qx.event.type.KeyEvent} keyPress event
     * @return {void}
     */
    _onKeyPress : function(e)
    {
      // Execute action on press <ENTER>
      if (e.getKeyIdentifier() == "Enter" && !e.isAltPressed())
      {
        var items = this.__manager.getSelectedItems();
        for (var i=0; i<items.length; i++) {
          items[i].fireEvent("action");
        }

        return;
      }

      // Give control to selectionManager
      this.__manager.handleKeyPress(e);
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeObjects("__manager", "__content");
  }
});
