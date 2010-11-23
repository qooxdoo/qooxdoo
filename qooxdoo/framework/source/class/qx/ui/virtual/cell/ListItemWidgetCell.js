/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

/**
 * EXPERIMENTAL!
 *
 * Cell renderer for {@link qx.ui.form.ListItem}.
 *
 * Use {@link #updateData} to update label and icon. Just use a <code>Map</code>
 * with <code>label</code> and <code>icon</code> as key.
 */
qx.Class.define("qx.ui.virtual.cell.ListItemWidgetCell",
{
  extend : qx.ui.virtual.cell.AbstractWidget,

  members :
  {
    // overridden
    _createWidget : function() {
      return new qx.ui.form.ListItem();
    },

    // overridden
    updateData : function(widget, data) {
      for (var key in data)
      {
        if (qx.Class.hasProperty(widget.constructor, key)) {
          qx.util.PropertyUtil.setUserValue(widget, key, data[key]);
        } else {
          throw new Error("Can't update data! The key '" + key + "' is not a Property!")
        }
      }
    }
  }
});