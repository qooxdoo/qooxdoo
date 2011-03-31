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
 * Base class for all list item renderer.
 */
qx.Class.define("qx.ui.mobile.list.renderer.Abstract",
{
  extend : qx.ui.mobile.core.Widget,
  type : "abstract",
  include : [ qx.ui.mobile.core.MChildrenHandling ],


 /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);
    this.initSelectable();
    this.initShowArrow();
  },




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
      init : "listItem"
    },


    // todo -> move selected / selectable to mixin
    /**
     * Whether the row is selected.
     */
    selected :
    {
      check : "Boolean",
      init : false,
      apply : "_applySelected"
    },


    /**
     * Whether the row is selectable.
     */
    selectable :
    {
      check : "Boolean",
      init : true,
      apply : "_applyAttribute"
    },


    /**
     * Whether to show an arrow in the row.
     */
    showArrow :
    {
      check : "Boolean",
      init : false,
      apply : "_applyShowArrow"
    }
  },




 /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    // abstract method
    /**
     * Resets all defined child widgets. Override this method in your custom
     * list item renderer and reset all widgets displaying data. Needed as the
     * renderer is used for every row and otherwise data of a different row
     * might be displayed, when not all data displaying widgets are used for the row.
     * Gets called automatically by the {@link qx.ui.mobile.list.provider.Provider}.
     *
     */
    reset : function() {
      if (qx.core.Environment.get("qx.debug")) {
        throw new Error("Abstract method call");
      }
    },

    // overridden
    _getTagName : function()
    {
      return "li";
    },


    // property apply
    _applyShowArrow : function(value, old)
    {
      if (value) {
        this.addCssClass("arrow");
      } else {
        this.removeCssClass("arrow");
      }
    },


    // property apply
    _applySelected : function(value, old)
    {
      if (value) {
        this.addCssClass("selected");
      } else {
        this.removeCssClass("selected");
      }
    }
  }
});