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
  implement : qx.ui.core.selection.IContainer,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(mode, horizontal)
  {
    this.base(arguments);

    // force boolean
    horizontal = !!horizontal;

    var content = new qx.ui.container.Composite();

    var layout = horizontal ? new qx.ui.layout.HBox : new qx.ui.layout.VBox;
    content.setLayout(layout);

    content.set({
      allowGrowX : !horizontal,
      allowGrowY : horizontal,
      allowShrinkX : false,
      allowShrinkY : false
    });

    if (horizontal) {
      this.setOrientation("horizontal");
    }

    this.setContent(content);

    this._manager = new qx.ui.core.selection.Widget(this);

    if (mode != null) {
      this.setSelectionMode(mode);
    }

    this.addListener("mousedown", this._onmousedown);
    this.addListener("mouseup", this._onmouseup);
    this.addListener("mousemove", this._onmousemove);
    this.addListener("losecapture", this._onlosecapture);
    this.addListener("keypress", this._onkeypress);
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

    selectionMode :
    {
      check : [ "single", "multi", "additive" ],
      init : "single",
      apply : "_applySelectionMode"
    },

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
      this._manager.setMode(value);
    },


    // property apply
    _applyOrientation : function(value, old) {
      // TODO
    },





    /*
    ---------------------------------------------------------------------------
      WIDGET API
    ---------------------------------------------------------------------------
    */

    getChildren : function() {
      return this.getContent().getChildren();
    },

    add : function(listItem) {
      this.getContent().add(listItem);
    },

    remove : function(listItem) {
      this.getContent().remove(listItem);
    },






    /*
    ---------------------------------------------------------------------------
      EVENT HANDLER
    ---------------------------------------------------------------------------
    */

    /**
     * Event listener for <code>mousedown</code> events.
     *
     * @type member
     * @param e {qx.event.type.Mouse} Mousedown event
     * @return {void}
     */
    _onmousedown : function(e) {
      this._manager.handleMouseDown(e);
    },


    /**
     * Event listener for <code>mouseup</code> events.
     *
     * @type member
     * @param e {qx.event.type.Mouse} Mousedown event
     * @return {void}
     */
    _onmouseup : function(e) {
      this._manager.handleMouseUp(e);
    },


    /**
     * Event listener for <code>mousemove</code> events.
     *
     * @type member
     * @param e {qx.event.type.Mouse} Mousedown event
     * @return {void}
     */
    _onmousemove : function(e) {
      this._manager.handleMouseMove(e);
    },


    /**
     * Event listener for <code>losecapture</code> events.
     *
     * @type member
     * @param e {qx.event.type.Mouse} Losecapture event
     * @return {void}
     */
    _onlosecapture : function(e) {
      this._manager.handleLoseCapture(e);
    },


    /**
     * Event listener for <code>keypress</code> events.
     *
     * @type member
     * @param e {qx.event.type.KeyEvent} keyPress event
     * @return {void}
     */
    _onkeypress : function(e)
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

      // Give control to selectionManager
      this._manager.handleKeyPress(e);
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeObjects("_manager");
  }
});
