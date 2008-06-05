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
  include : [ qx.ui.core.MRemoteChildrenHandling, qx.ui.core.MSelectionHandling ],




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param horizontal {Boolean?false} Whether the list should be horizontal.
   */
  construct : function(horizontal)
  {
    this.base(arguments);

    // Create content
    this.__content = new qx.ui.container.Composite();
    
    
    //this.__content.addListener("addChild", this._onAddChild, this);
    //this.__content.addListener("removeChild", this._onRemoveChild, this);
    // this.__content.defineChildAddCallback(this, this._onAddChild);

    // Add to scrollpane
    this._getChildControl("pane").add(this.__content);

    // Apply orientation
    horizontal ? this.setOrientation("horizontal") : this.initOrientation();

    // Add keypress listener
    this.addListener("keypress", this._onKeyPress);
  },



  events : 
  {
    "addItem" : "qx.event.type.Data",
    "removeItem" : "qx.event.type.Data"
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
     * Whether the list should be rendered horizontal or vertical.
     */
    orientation :
    {
      check : ["horizontal", "vertical"],
      init : "vertical",
      apply : "_applyOrientation"
    },


    /** Spacing between the items */
    spacing :
    {
      check : "Integer",
      init : 0,
      apply : "_applySpacing",
      themeable : true
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
      SELECTION API
    ---------------------------------------------------------------------------
    */

    /** {Class} Pointer to the selection manager to use */
    SELECTION_MANAGER : qx.ui.core.selection.ScrollArea,




    /*
    ---------------------------------------------------------------------------
      WIDGET API
    ---------------------------------------------------------------------------
    */

    // overridden
    getChildrenContainer : function() {
      return this.__content;
    },



    _onAddChild : function(e) {
      this.fireDataEvent("addItem", e.getData()); 
    },

    _onRemoveChild : function(e) {
      this.fireDataEvent("removeItem", e.getData()); 
    },

    

    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyOrientation : function(value, old)
    {
      // Create new layout
      var horizontal = value === "horizontal";
      var layout = horizontal ? new qx.ui.layout.HBox() : new qx.ui.layout.VBox();

      // Configure content
      var content = this.__content;
      content.setLayout(layout);
      content.setAllowGrowX(!horizontal);
      content.setAllowGrowY(horizontal);

      // Configure spacing
      this._applySpacing(this.getSpacing());
    },


    // property apply
    _applySpacing : function(value, old) {
      this.__content.getLayout().setSpacing(value);
    },





    /*
    ---------------------------------------------------------------------------
      EVENT HANDLER
    ---------------------------------------------------------------------------
    */

    /**
     * Used to route external <code>keypress</code> events to the list
     * handling (in fact the manager of the list)
     *
     * @type member
     * @param e {qx.event.type.KeyEvent} KeyPress event
     * @return {void}
     */
    handleKeyPress : function(e)
    {
      if (!this._onKeyPress(e)) {
        this._getManager().handleKeyPress(e);
      }
    },


    /**
     * Event listener for <code>keypress</code> events.
     *
     * @type member
     * @param e {qx.event.type.KeyEvent} KeyPress event
     * @return {Boolean} Whether the event was processed
     */
    _onKeyPress : function(e)
    {
      // Execute action on press <ENTER>
      if (e.getKeyIdentifier() == "Enter" && !e.isAltPressed())
      {
        var items = this.getSelection();
        for (var i=0; i<items.length; i++) {
          items[i].fireEvent("action");
        }

        return true;
      }

      return false;
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeObjects("__content");
  }
});
