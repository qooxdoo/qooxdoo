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
 * A stack layout. Arranges children on top of each other where only
 * one is visible. The sizing policy is determined by the properts
 * {@link #resizeToSelected}.
 */
qx.Class.define("qx.ui2.layout.Stack",
{
  extend : qx.ui2.layout.Abstract,

  properties :
  {
    /**
     * The current visible top widget.
     */
    selected :
    {
      check : "qx.ui2.core.Widget",
      nullable : true,
      apply : "_applySelected"
    },


    /**
     * If <code>true</code> the layout's preferred size is determined only by
     * the size of the selected widget. Otherwise the layout's preferred size is
     * computed from all widgets in the stack.
     */
    resizeToSelected :
    {
      check : "Boolean",
      init : false,
      apply : "_applyLayoutChange"
    }
  },

  members :
  {
    // overridden
    add : function(widget, options)
    {
      this.base(arguments, widget, options);
      this.setSelected(widget);
    },


    // property apply
    _applySelected : function(value, old)
    {
      if (old) {
        old.setLayoutVisible(false);
      }

      value.setLayoutVisible(true);

      this.scheduleWidgetLayoutUpdate();
    },




    /*
    ---------------------------------------------------------------------------
      LAYOUT INTERFACE
    ---------------------------------------------------------------------------
    */

    // overridden
    invalidateLayoutCache : function()
    {
      if (this._sizeHint)
      {
        // this.debug("Clear layout cache");
        this._sizeHint = null;
      }
    },

    // overridden
    renderLayout : function(width, height)
    {
      var selectedChild = this.getSelected();
      if (!selectedChild) {
        return;
      }
      selectedChild.renderLayout(0, 0, width, height);
    },


    // overridden
    _computeSizeHint : function()
    {
      if (this.getResizeToSelected())
      {
        // return the size hint of the selected widget
        return this.getSelected().getSizeHint();
      }
      else
      {
        // compute combined size hint.

        // default size hint
        var hint = {
          minWidth : 0,
          width : 0,
          maxWidth : Infinity,
          minHeight : 0,
          height : 0,
          maxHeight : Infinity
        };

        var children = this.getLayoutChildren();
        for (var i=0, l=children.length; i<l; i++)
        {
          var child = children[i];
          var childHint = child.getSizeHint();
          hint.minWidth = Math.max(hint.minWidth, childHint.minWidth);
          hint.width = Math.max(hint.width, childHint.width);
          hint.maxWidth = Math.min(hint.maxWidth, childHint.maxWidth);
          hint.minHeight = Math.max(hint.minHeight, childHint.minHeight);
          hint.height = Math.max(hint.height, childHint.height);
          hint.maxHeight = Math.min(hint.maxHeight, childHint.maxHeight);
        }
        return hint;
      }
    }
  }
});
