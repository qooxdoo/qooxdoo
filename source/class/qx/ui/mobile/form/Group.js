/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tino Butz (tbtz)
     * Christopher Zuendorf (czuendorf)

************************************************************************ */

/**
 * A group widget arranges several widgets visual.
 *
 * *Example*
 *
 * Here is a little example of how to use the widget.
 *
 * <pre class='javascript'>
 *   var title = new qx.ui.mobile.form.Title("Group");
 *   var list = new qx.ui.mobile.list.List();
 *   var group = new qx.ui.mobile.form.Group([list]);
 *
 *   this.getRoot.add(title);
 *   this.getRoot.add(group);
 * </pre>
 *
 * This example creates a group and adds a list to it.
 */
qx.Class.define("qx.ui.mobile.form.Group",
{
  extend : qx.ui.mobile.container.Composite,


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param widgets {qx.ui.mobile.core.Widget[]}
   * @param showBorder {Boolean?} initial value of the property showBorder.
   */
  construct : function(widgets, showBorder)
  {
    this.base(arguments);

    this.addCssClass("bordered");

    if(showBorder != null) {
      this.setShowBorder(showBorder);
    }

    // Convenience: Add all widgets of array to group.
    if(widgets) {
      for(var i = 0; i < widgets.length; i++) {
        this.add(widgets[i]);
      }
    }

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
      init : "group"
    },


    /**
     * Defines whether a border should drawn around the group.
     */
    showBorder :
    {
      check : "Boolean",
      init : true,
      apply : "_onChangeShowBorder"
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
     * Reacts on change of showBorder property.
     */
    _onChangeShowBorder : function() {

      if(this.isShowBorder()==true) {
        this.addCssClass("bordered");
      } else {
        this.removeCssClass("bordered");
      }
    }
  }
});
