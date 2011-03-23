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
 * The list item widget represents an list entry.
 */
qx.Class.define("qx.ui.mobile.list.ListItem",
{
  extend : qx.ui.mobile.core.Widget,
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
    cssClass :
    {
      refine : true,
      init : "listItem"
    },


    data :
    {
      apply : "_applyData",
      event : "dataChange"
    },


    // todo -> move selected / selectable to mixin
    selected :
    {
      check : "Boolean",
      init : false,
      apply : "_applySelected"
    },


    selectable :
    {
      check : "Boolean",
      init : true,
      apply : "_applyAttribute"
    },


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
    // overridden
    _getTagName : function()
    {
      return "li";
    },


    // property apply
    _applyData : function(value, old) {

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
