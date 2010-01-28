/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2006 STZ-IDA, Germany, http://www.stz-ida.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Til Schneider (til132)
     * Carsten Lergenmueller (carstenl)

************************************************************************ */

/**
 * A data cell renderer for boolean values.
 */
qx.Class.define("qx.ui.table.cellrenderer.Boolean",
{
  extend : qx.ui.table.cellrenderer.AbstractImage,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    this.__aliasManager = qx.util.AliasManager.getInstance();

    this.initIconTrue();
    this.initIconFalse();
  },


  /*
   *****************************************************************************
     PROPERTIES
   *****************************************************************************
   */

  properties :
  {
    /**
     * The icon used to indicate the true state
     */
    iconTrue :
    {
      check : "String",
      init : "decoration/table/boolean-true.png",
      apply : "_applyIconTrue"
    },

    /**
    * The icon used to indicate the false state
    */
    iconFalse :
    {
      check : "String",
      init : "decoration/table/boolean-false.png",
      apply : "_applyIconFalse"
    }
  },


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __iconUrlTrue : null,
    __iconUrlFalse : false,
    __aliasManager : null,


    // property apply
    _applyIconTrue : function(value) {
      this.__iconUrlTrue = this.__aliasManager.resolve(value);
    },


    // property apply
    _applyIconFalse : function(value) {
      this.__iconUrlFalse = this.__aliasManager.resolve(value);
    },


    // overridden
    _insetY : 5,

    // overridden
    _getCellStyle : function(cellInfo) {
      return this.base(arguments, cellInfo) + ";padding-top:4px;";
    },


    // overridden
    _identifyImage : function(cellInfo)
    {
      var imageHints =
      {
        imageWidth  : 11,
        imageHeight : 11
      };

      switch(cellInfo.value)
      {
        case true:
          imageHints.url = this.__iconUrlTrue;
          break;

        case false:
          imageHints.url = this.__iconUrlFalse;
          break;

        default:
          imageHints.url = null;
          break;
      }

      return imageHints;
    }
  },

  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this.__aliasManager = null;
  }
});
