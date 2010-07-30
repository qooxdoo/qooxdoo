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

qx.Class.define("demobrowser.demo.virtual.cell.CheckBoxWidgetCell",
{
  extend : qx.ui.virtual.cell.AbstractWidget,

  events :
  {
    /** Fired when a new <code>CheckBox</code> is created. */
    "created" : "qx.event.type.Data"
  },

  members :
  {
    // overridden
    _createWidget : function() {
      var widget = new qx.ui.form.CheckBox();
      this.fireDataEvent("created", widget);

      return widget;
    },

    // overridden
    updateData : function(widget, data) {
      var label = data && data.label ? data.label : null;
      var value = data && data.value ? data.value : null;

      widget.setLabel(label);
      widget.setValue(value);
    }
  }
});