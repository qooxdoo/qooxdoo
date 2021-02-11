/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * This mixin is included by all widgets which supports native overflowing.
 */
qx.Mixin.define("qx.ui.core.MNativeOverflow",
{
  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /**
     * Whether the widget should have horizontal scrollbars.
     */
    overflowX :
    {
      check : ["hidden", "visible", "scroll", "auto"],
      nullable : true,
      apply : "_applyOverflowX"
    },

    /**
     * Whether the widget should have vertical scrollbars.
     */
    overflowY :
    {
      check : ["hidden", "visible", "scroll", "auto"],
      nullable : true,
      apply : "_applyOverflowY"
    },

    /**
     * Overflow group property
     */
    overflow : {
      group : [ "overflowX", "overflowY" ]
    }
  },





  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    // property apply
    _applyOverflowX : function(value) {
      this.getContentElement().setStyle("overflowX", value);
    },


    // property apply
    _applyOverflowY : function(value) {
      this.getContentElement().setStyle("overflowY", value);
    }
  }
});