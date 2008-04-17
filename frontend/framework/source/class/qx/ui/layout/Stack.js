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
qx.Class.define("qx.ui.layout.Stack",
{
  extend : qx.ui.layout.Abstract,

  properties :
  {
    /**
     * The current visible top widget.
     */
    selected :
    {
      check : "qx.ui.core.Widget",
      nullable : true,
      apply : "_applySelected",
      event : "change"
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
    invalidateChildrenCache : function(child)
    {
      var children = this._getLayoutChildren();
      var selected = this.getSelected();

      for (var i=0, l=children.length; i<l; i++)
      {
        child = children[i];

        if (child !== selected) {
          child.layoutVisibilityModified(false);
        }
      }
    },


    // property apply
    _applySelected : function(value, old)
    {
      if (old) {
        old.layoutVisibilityModified(false);
      }

      if (value) {
        value.layoutVisibilityModified(true);
      }

      // Update layout
      this._applyLayoutChange();
    },




    /*
    ---------------------------------------------------------------------------
      LAYOUT INTERFACE
    ---------------------------------------------------------------------------
    */

    // overridden
    renderLayout : function(availWidth, availHeight)
    {
      var selected = this.getSelected();

      if (!selected) {
        throw new Error("Please select the widget to show!");
      }

      var hint = selected.getSizeHint();
      var width = Math.min(hint.maxWidth, Math.max(hint.minWidth, availWidth));
      var height = Math.min(hint.maxHeight, Math.max(hint.minHeight, availHeight));

      selected.renderLayout(0, 0, width, height);
    },


    // overridden
    _computeSizeHint : function()
    {
      var selected = this.getSelected();
      if (!selected) {
        throw new Error("Please select the widget to show!");
      }

      if (this.getResizeToSelected())
      {
        var orig = selected.getSizeHint();

        // return the size hint of the selected widget
        return {
          minWidth : orig.minWidth,
          width : orig.width,
          minHeight : orig.minHeight,
          height : orig.height
        };
      }
      else
      {
        var children = this._getLayoutChildren();
        var minWidth=0, width=0, minHeight=0, height=0;
        var hint;

        for (var i=0, l=children.length; i<l; i++)
        {
          hint = children[i].getSizeHint();

          minWidth = Math.max(minWidth, hint.minWidth);
          width = Math.max(width, hint.width);
          minHeight = Math.max(minHeight, hint.minHeight);
          height = Math.max(height, hint.height);
        }

        return {
          minWidth : minWidth,
          width : width,
          minHeight : minHeight,
          height : height
        };
      }
    }
  }
});
