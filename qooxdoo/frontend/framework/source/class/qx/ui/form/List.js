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

  construct : function(mode)
  {
    this.base(arguments);

    var content = new qx.ui.core.Widget;
    var layout = new qx.ui.layout.VBox;

    content.set({
      layout : layout,
      allowGrowY : false,
      allowShrinkX : false,
      allowShrinkY : false
    });

    this.setContent(content);

    this._manager = new qx.ui.core.selection2.Widget(this);

    if (mode != null) {
      this.setSelectionMode(mode);
    }

    this.addListener("mousedown", this._onmousedown, this);
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
    getItems : function()
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
    getItemRange : function(item1, item2)
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
    getFirstItem : function()
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
    getLastItem : function()
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
    getItemAbove : function(item)
    {
      var layout = this.getContent().getLayout();
      var prev = item;

      do {
        prev = layout.getPreviousSibling(prev);
      } while (prev && !prev.isEnabled());

      return prev || null;
    },


    // interface implementation
    getItemUnder : function(item)
    {
      var layout = this.getContent().getLayout();
      var next = item;

      do {
        next = layout.getNextSibling(next);
      } while (next && !next.isEnabled());

      return next || null;
    },


    // interface implementation
    getItemLeft : function(rel) {
      return this.getItemAbove(rel);
    },


    // interface implementation
    getItemRight : function(rel) {
      return this.getItemUnder(rel);
    },


    getItemPageUp : function(rel) {
      this.warn("Missing implementation: PageUp Key");
    },


    getItemPageDown : function(rel) {
      this.warn("Missing implementation: PageDown Key");
    },







    // interface implementation
    getInnerWidth : function() {
      // unused
    },


    // interface implementation
    getInnerHeight : function()
    {
      var computed = this.getContent().getComputedInnerSize();
      return computed ? computed.height : 0;
    },


    // interface implementation
    getItemOffsetLeft : function(item) {
      // unused
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
    getItemWidth : function(item) {
      // unused
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
      EVENT HANDLER
    ---------------------------------------------------------------------------
    */

    /**
     * Delegates the event to the selection manager if a list item could be
     * resolved out of the event target.
     *
     * @type member
     * @param e {qx.event.type.Mouse} Mousedown event
     * @return {void}
     */
    _onmousedown : function(e)
    {
      var target = e.getTarget();
      if (target instanceof qx.ui.form.ListItem) {
        this._manager.handleMouseDown(target, e);
      }
    },


    /**
     * Delegates the control of the event to selection manager
     *
     * @type member
     * @param e {qx.event.type.KeyEvent} keyPress event
     * @return {void}
     */
    _onkeypress : function(e)
    {
      var target = e.getTarget();

      // Execute action on press <ENTER>
      if (e.getKeyIdentifier() == "Enter" && !e.isAltPressed())
      {
        var items = this._manager.getSelectedItems();
        for (var i=0; i<items.length; i++) {
          items[i].fireEvent("action");
        }
      }

      // Give control to selectionManager
      else {
        this._manager.handleKeyPress(target, e);
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
