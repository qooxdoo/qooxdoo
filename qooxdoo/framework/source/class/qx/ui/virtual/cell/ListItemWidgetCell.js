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
      var label = data.label ? data.label : null;
      var icon = data.icon ? data.icon : null;

      widget.setLabel(label);
      widget.setIcon(icon);
    }
  }
});