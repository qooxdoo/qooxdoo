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

qx.Class.define("qx.ui.virtual.layer.WidgetCell",
{
  extend : qx.ui.virtual.layer.AbstractWidget,
   
  construct : function(widgetCellProvider)
  {
    this.base(arguments);
    this._cellProvider = widgetCellProvider;
  },
  
  
  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */
 
  members :
  {       
    _getWidget : function(row, column) {
      return this._cellProvider.getCellWidget(row, column);
    },

    _poolWidget: function(widget) {
      return this._cellProvider.poolCellWidget(widget);
    },
    
    _configureWidget : function(widget, row, column) {}
  }
});
