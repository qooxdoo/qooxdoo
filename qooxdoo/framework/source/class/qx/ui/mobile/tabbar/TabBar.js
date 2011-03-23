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
 * This widget displays a tab bar.
 */
qx.Class.define("qx.ui.mobile.tabbar.TabBar",
{
  extend : qx.ui.mobile.core.Widget,


 /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);
    this._setLayout(new qx.ui.mobile.layout.HBox());
    this.addListener("tap", this._onTap, this);
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
      init : "tabBar"
    },


    /**
     * Sets the selected tab.
     */
    selectedTab :
    {
      check : "qx.ui.mobile.core.Widget",
      nullable : false,
      init : null,
      apply : "_applySelectedTab",
      event : "changeSelectedTab"
    }
  },




 /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __currentTab : null,

    /**
     * Event handler. Called when a tab event occurs.
     *
     * @param evt {qx.event.type.Tap} The event object
     */
    _onTap : function(evt)
    {
      var target = evt.getTarget();
      if (target instanceof qx.ui.mobile.tabbar.TabButton) {
        this.setSelectedTab(target);
      }
    },


    // property apply
    _applySelectedTab : function(value, old)
    {
      if (old) {
        old.removeCssClass("selected");
      }
      value.addCssClass("selected");
    },


    /**
     * Adds a tab button to the tab bar.
     *
     * @param button {qx.ui.mobile.tabbar.TabButton} The button to add
     */
    add : function(button)
    {
      this._add(button, {flex:1});
      if (!this.getSelectedTab()) {
        this.setSelectedTab(button);
      }
    },


    /**
     * Removes a tab button from the tab bar.
     *
     * @param button {qx.ui.mobile.tabbar.TabButton} The button to remove
     */
    remove : function(button)
    {
      this._remove(button);
    }
  },




 /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this.removeListener("tap", this._onTap, this);
  }
});
