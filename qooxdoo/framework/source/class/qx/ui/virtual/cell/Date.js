/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2006 STZ-IDA, Germany, http://www.stz-ida.de
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */

/**
 * EXPERIMENTAL!
 */
qx.Class.define("qx.ui.virtual.cell.Date",
{
  extend : qx.ui.virtual.cell.Cell,

  construct : function(dateFormat)
  {
    this.base(arguments);

    if (dateFormat) {
      this.setDateFormat(dateFormat);
    } else {
      this.initDateFormat(qx.util.format.DateFormat.getDateTimeInstance());
    }

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
      init : "cell-date"
    },

    dateFormat:
    {
      check : "qx.util.format.DateFormat",
      deferredInit : true
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
      return value ? this.getDateFormat().format(value): "";
    }

  }

});