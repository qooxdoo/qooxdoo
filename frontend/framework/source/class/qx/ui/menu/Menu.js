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
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("qx.ui.menu.Menu",
{
  extend : qx.ui.popup.Popup,

  construct : function()
  {
    this.base(arguments);

    this.setAutoHide(false);

    // use hard coded layout
    this._setLayout(new qx.ui.layout.Menu);
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    appearance :
    {
      refine : true,
      init : "menu"
    },

    allowGrowX :
    {
     refine : true,
     init: false
    },

    allowGrowY :
    {
     refine : true,
     init: false
    },

    spacingX :
    {
      check : "Integer",
      apply : "_applySpacingX",
      init : 0,
      themeable : true
    },

    spacingY :
    {
      check : "Integer",
      apply : "_applySpacingY",
      init : 0,
      themeable : true
    }
  },



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Returns the column sizes detected during the pre-layout phase
     *
     * @return {Array} List of all column widths
     */
    getColumnSizes : function() {
      return this._getLayout().getColumnSizes();
    },


    // apply routine
    _applySpacingX : function(value, old) {
      this._getLayout().setColumnSpacing(value);
    },


    // apply routine
    _applySpacingY : function(value, old) {
      this._getLayout().setSpacing(value);
    }
  }
});
