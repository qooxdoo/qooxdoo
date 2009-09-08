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

/**
 * EXPERIMENTAL!
 */

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


  members :
  {
    getCssClasses : function(value, states) {
      return "qx-cell";
    },

    getAttributes : function(value, states) {
      return "";
    },

    getStyles: function(value, states) {
      return "";
    },

    getInsets : function(value, states) {
      return [0, 0];
    },

    getContent : function(value, states) {
      return value;
    },

    getCellProperties : function(value, states)
    {
      return {
        classes : this.getCssClasses(value, states),
        style : this.getStyles(value, states),
        attributes : this.getAttributes(value, states),
        content : this.getContent(value, states),
        insets : this.getInsets(value, states)
      };
    }
  }
});
