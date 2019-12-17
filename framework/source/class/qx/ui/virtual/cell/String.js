/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2006 STZ-IDA, Germany, http://www.stz-ida.de
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */
qx.Class.define("qx.ui.virtual.cell.String",
{
  extend : qx.ui.virtual.cell.Cell,

  construct : function()
  {
    this.base(arguments);
  },


  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    appearance:
    {
      refine : true,
      init : "cell-string"
    }
  },


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */


  members :
  {
    /*
    ---------------------------------------------------------------------------
      IMPLEMENT CELL API
    ---------------------------------------------------------------------------
    */

    getContent : function(value, states) {
      return value ? qx.bom.String.escape(value) : "";
    }
  }

});