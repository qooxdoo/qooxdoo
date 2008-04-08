/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's left-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * The scroll layout is used internally by the scroll pane. Is is similar to
 * the {@link qx.ui.layout.Basic} layout with only one child and the possibility
 * to shrink the content to its min size.
 *
 * @internal
 */
qx.Class.define("qx.ui.layout.Scroll",
{
  extend : qx.ui.layout.Abstract,

  properties :
  {
    /**
     * The content widget of the scroll layout.
     */
    content :
    {
      check : "qx.ui.core.Widget",
      apply : "_applyContent",
      nullable : true
    }
  },

  members :
  {
    // property apply
    _applyContent : function(value, old)
    {
      if (old)
      {
        qx.lang.Array.remove(this._children, old);
        this._removeHelper(old);
      }

      if (value)
      {
        this._children.push(value);
        this._addHelper(value);
      }
    },

    // overridden
    _computeSizeHint : function()
    {
      var hint = this.getContent().getSizeHint();

      return {
        width : hint.width,
        height : hint.height
      };
    },

    // overridden
    renderLayout : function(availWidth, availHeight)
    {
      var content = this.getContent();
      var hint = content.getSizeHint();

      var width = Math.min(hint.width, Math.max(availWidth, hint.minWidth));
      var height = Math.min(hint.height, Math.max(availHeight, hint.minHeight));

      content.renderLayout(0, 0, width, height);
    }
  }
});
