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
    add : function(child, options)
    {
      this.base(arguments, child, options);

      // Select first incoming child
      if (!this.getSelected()) {
        this.setSelected(child);
      } else {
        child.layoutVisibilityModified(false);
      }
    },


    // property apply
    _applySelected : function(value, old)
    {
      if (old) {
        old.layoutVisibilityModified(false);
      }

      value.layoutVisibilityModified(true);
      this.scheduleWidgetLayoutUpdate();
    },




    /*
    ---------------------------------------------------------------------------
      LAYOUT INTERFACE
    ---------------------------------------------------------------------------
    */

    // overridden
    renderLayout : function(availWidth, availHeight)
    {
      var selectedChild = this.getSelected();
      if (!selectedChild) {
        return;
      }

      var hint = selectedChild.getSizeHint();
      var width = Math.min(hint.maxWidth, Math.max(hint.minWidth, availWidth));
      var height = Math.min(hint.maxHeight, Math.max(hint.minHeight, availHeight));

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
        var children = this.getLayoutChildren();
        var hint;
        var minWidth=0, width=0, minHeight=0, height=0;

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
          maxWidth : Infinity,
          minHeight : minHeight,
          height : height,
          maxHeight : Infinity
        };
      }
    }
  }
});
