/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

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
qx.Class.define("qx.ui.virtual.cell.Boolean",
{
  extend : qx.ui.virtual.cell.AbstractImage,

  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    this.__imageTrue = this._aliasManager.resolve("decoration/table/boolean-true.png");
    this.__imageFalse = this._aliasManager.resolve("decoration/table/boolean-false.png");
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
      init : "cell-boolean"
    }
  },



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __imageTrue : null,
    __imageFalse : null,

    // overridden
    _identifyImage : function(value) {
      return value == true ? this.__imageTrue : this.__imageFalse;
    }
  }
});
