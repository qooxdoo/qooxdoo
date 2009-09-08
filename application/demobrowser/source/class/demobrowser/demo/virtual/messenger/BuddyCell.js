/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
   * Fabian Jakobs (fjakobs)
   * Jonathan Weiß (jonathan_rass)

************************************************************************ */

qx.Class.define("demobrowser.demo.virtual.messenger.BuddyCell",
{
  extend : qx.ui.virtual.cell.AbstractWidget,

  members :
  {
    _createWidget : function() {
      return new demobrowser.demo.virtual.messenger.Buddy();
    },


    updateData : function(widget, data)
    {
      widget.label.setValue(data.getName());
      widget.icon.setSource(data.getAvatar());
      widget.statusIcon.setSource("demobrowser/demo/icons/imicons/status_" + data.getStatus() + ".png");
    },


    updateStates : function(widget, states)
    {
      if (states.selected)
      {
        widget.setTextColor("text-selected");
        widget.setDecorator("selected");
      }
      else
      {
        widget.resetTextColor();
        widget.resetDecorator();
      }
    }
  }
});