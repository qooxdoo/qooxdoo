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

    // Add keypress listener
    this.addListener("keypress", this._onKeyPress);
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



    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

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
      EVENT HANDLER
    ---------------------------------------------------------------------------
    */

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
        var items = this._manager.getSelectedItems();
        for (var i=0; i<items.length; i++) {
          items[i].fireEvent("action");
        }

        return;
      }
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
