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
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * This mixin is included by all widgets, which support an 'execute' like
 * buttons or menu entries.
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
     * Whether the iframe's should have vertical scroll bars.
     */
    overflowX :
    {
      check : ["hidden", "visible", "scroll"],
      init  : "hidden",
      apply : "_applyOverflowX"
    },

    /**
     * Whether the iframe's should have horizontal scroll bars.
     */
    overflowY :
    {
      check : ["hidden", "visible", "scroll"],
      init  : "hidden",
      apply : "_applyOverflowY"
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
    _applyOverflowX : function(value, old)
    {
      this.getContentElement().setStyle("overflowX", value);
    },

    // property apply
    _applyOverflowY : function(value, old)
    {
      this.getContentElement().setStyle("overflowY", value);
    }
  }
});