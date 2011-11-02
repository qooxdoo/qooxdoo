/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tino Butz (tbtz)

************************************************************************ */


/**
 * EXPERIMENTAL - NOT READY FOR PRODUCTION
 *
 * Root widget for the mobile application.
 */
qx.Class.define("qx.ui.mobile.core.Root",
{
  extend : qx.ui.mobile.core.Widget,

  include : [ qx.ui.mobile.core.MChildrenHandling],


  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    // overridden
    defaultCssClass :
    {
      refine : true,
      init : "root"
    },


    /**
     * Whether the native scrollbar should be shown or not.
     */
    showScrollbarY :
    {
      check : "Boolean",
      init : true,
      apply : "_applyShowScrollbarY"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    // overridden
    _createContainerElement : function() {
      return document.body;
    },


    // property apply
    _applyShowScrollbarY : function(value, old) {
      this._setStyle("overflow-y", value ? "auto" : "hidden");
    }
  },




  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer : function(statics, members)
  {
    qx.ui.mobile.core.MChildrenHandling.remap(members);
  }
});
