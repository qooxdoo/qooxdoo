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
 * // TODO: rename to toolbar
 */
qx.Class.define("qx.ui.mobile.tabbar.TabBar",
{
  extend : qx.ui.mobile.core.Widget,

  construct : function()
  {
    this.base(arguments);
    this._setLayout(new qx.ui.mobile.layout.HBox());
    this.addListener("tap", this._onTap, this);
    //this._setStyle("visibility" , "hidden");
    //this.addListener("domupdated", function() {
    //  this._setStyle("visibility" , "visible");
    //}, this);
  },


  properties :
  {
    cssClass :
    {
      refine : true,
      init : "tabBar"
    },


    selectedTab :
    {
      check : "qx.ui.mobile.tabbar.TabButton",
      nullable : false,
      init : null,
      apply : "_applySelectedTab",
      event : "changeSelectedTab"
    }
  },


  members :
  {
    __currentTab : null,

    _onTap : function(evt)
    {
      var target = evt.getTarget();
      if (target instanceof qx.ui.mobile.tabbar.TabButton) {
        this.setSelectedTab(target);
      }
    },


    _applySelectedTab : function(value, old)
    {
      if (old) {
        old.removeCssClass("selected");
      }
      value.addCssClass("selected");
    },


    add : function(button)
    {
      this._add(button, {flex:1});
      if (!this.getSelectedTab()) {
        this.setSelectedTab(button);
      }
    },


    remove : function(button)
    {
      this._remove(button);
    }
  },


  destruct : function()
  {
    this.removeListener("tap", this._onTap, this);
  }
});
