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
  implement : qx.ui.core.selection2.IContainer,




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

    var content = new qx.ui.core.Widget;
    var layout = horizontal ? new qx.ui.layout.HBox : new qx.ui.layout.VBox;

    content.set({
      layout : layout,
      allowGrowX : !horizontal,
      allowGrowY : horizontal,
      allowShrinkX : false,
      allowShrinkY : false
    });

    if (horizontal) {
      this.setOrientation("horizontal");
    }

    this.setContent(content);

    this._manager = new qx.ui.core.selection2.Widget(this);

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
      return this.getContent().getLayoutChildren();
    },

    add : function(listItem) {
      this.getContent().getLayout().add(listItem);
    },

    remove : function(listItem) {
      this.getContent().getLayout().remove(listItem);
    },





    /*
    ---------------------------------------------------------------------------
      SELECTION MANAGER INTERFACE
    ---------------------------------------------------------------------------
    */

    // interface implementation
    isSelectable : function(item) {
      return (item instanceof qx.ui.form.ListItem) && item.getLayoutParent() === this.getContent();
    },


    // interface implementation
    getSelectables : function()
    {
      var children = this.getContent().getLayoutChildren();
      var result = [];
      var child;

      for (var i=0, l=children.length; i<l; i++)
      {
        child = children[i];

        if (child.isEnabled()) {
          result.push(child);
        }
      }

      return result;
    },


    // interface implementation
    getSelectableRange : function(item1, item2)
    {
      // Fast path for identical items
      if (item1 === item2) {
        return [item1];
      }

      // Iterate over children and collect all items
      // between the given two (including them)
      var children = this.getContent().getLayoutChildren();
      var result = [];
      var active = false;
      var child;

      for (var i=0, l=children.length; i<l; i++)
      {
        child = children[i];

        if (child === item1 || child === item2)
        {
          if (active)
          {
            result.push(child);
            break;
          }
          else
          {
            active = true;
          }
        }

        if (active && child.isEnabled()) {
          result.push(child);
        }
      }

      return result;
    },


    // interface implementation
    getFirstSelectable : function()
    {
      var children = this.getContent().getLayoutChildren();
      for (var i=0, l=children.length; i<l; i++)
      {
        if (children[i].isEnabled()) {
          return children[i];
        }
      }

      return null;
    },


    // interface implementation
    getLastSelectable : function()
    {
      var children = this.getContent().getLayoutChildren();
      for (var i=children.length-1; i>0; i--)
      {
        if (children[i].isEnabled()) {
          return children[i];
        }
      }

      return null;
    },


    // interface implementation
    getRelatedSelectable : function(item, relation)
    {
      var vertical = this.getOrientation() === "vertical";

      if ((vertical && relation === "above") || (!vertical && relation === "left")) {
        return this._getPreviousItem(item);
      } else if ((vertical && relation === "under") || (!vertical && relation === "right")) {
        return this._getNextItem(item);
      }

      return null;
    },







    // interface implementation
    getInnerWidth : function()
    {
      var computed = this._scrollPane.getComputedInnerSize();
      return computed ? computed.width : 0;
    },


    // interface implementation
    getInnerHeight : function()
    {
      var computed = this._scrollPane.getComputedInnerSize();
      return computed ? computed.height : 0;
    },


    // interface implementation
    getItemOffsetLeft : function(item)
    {
      var computed = item.getComputedLayout();
      if (computed) {
        return computed.left;
      }

      return 0;
    },


    // interface implementation
    getItemOffsetTop : function(item)
    {
      var computed = item.getComputedLayout();
      if (computed) {
        return computed.top;
      }

      return 0;
    },


    // interface implementation
    getItemWidth : function(item)
    {
      var computed = item.getComputedLayout();
      if (computed) {
        return computed.width;
      }

      return 0;
    },


    // interface implementation
    getItemHeight : function(item)
    {
      var computed = item.getComputedLayout();
      if (computed) {
        return computed.height;
      }

      return 0;
    },





    /*
    ---------------------------------------------------------------------------
      HELPER METHODS
    ---------------------------------------------------------------------------
    */

    /**
     * Returns the previous selectable item from the children list.
     *
     * @type member
     * @param rel {qx.ui.form.ListItem} Widget from where the lookup should start (relative item)
     * @return {qx.ui.form.ListItem} The previous selectable list item
     */
    _getPreviousItem : function(rel)
    {
      var layout = this.getContent().getLayout();
      var prev = rel;

      do {
        prev = layout.getPreviousSibling(prev);
      } while (prev && !prev.isEnabled());

      return prev || null;
    },


    /**
     * Returns the next selectable item from the children list.
     *
     * @type member
     * @param rel {qx.ui.form.ListItem} Widget from where the lookup should start (relative item)
     * @return {qx.ui.form.ListItem} The next selectable list item
     */
    _getNextItem : function(rel)
    {
      var layout = this.getContent().getLayout();
      var next = rel;

      do {
        next = layout.getNextSibling(next);
      } while (next && !next.isEnabled());

      return next || null;
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
      }

      // Give control to selectionManager
      else
      {
        this._manager.handleKeyPress(e);
      }
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
