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
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */

/* ************************************************************************
#require(qx.bom.Stylesheet)
************************************************************************ */

qx.Class.define("qx.ui.virtual.cell.Abstract", 
{
  type : "abstract",
  extend : qx.core.Object,
  implement : qx.ui.virtual.cell.ICell,

  construct : function()
  {
    this.base(arguments);
    
    // initialize stylesheet
    qx.ui.virtual.cell.CellStylesheet.getInstance();
  },

  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {

    insetX :
    {
      init : 0,
      check : "Number"
    },


    insetY :
    {
      init : 0,
      check : "Number"
    }

  },



  members :
  {
    _getCssClasses : function(value, states) {
      return "qx-cell";
    },

    _getAttributes : function(value, states) {
      return "";
    },

    _getStyles: function(value, states) {
      return "";
    },

    _getInsets : function(value, states) {
      return [this.getInsetX(), this.getInsetY()];
    },

    _getValue : function(value, states) {
      return value;
    },

    getCellProperties : function(value, states)
    {
      return {
        classes : this._getCssClasses(value, states),
        style : this._getStyles(value, states),
        attributes : this._getAttributes(value, states),
        content : this._getValue(value, states),
        insets : this._getInsets(value, states)
      };
    }
  }
});