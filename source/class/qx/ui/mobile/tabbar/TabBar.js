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

************************************************************************ */

/**
 * This widget displays a tab bar.
 *
 * *Example*
 *
 * Here is a little example of how to use the widget.
 *
 * <pre class='javascript'>
 *   var tabBar = new qx.ui.mobile.tabbar.TabBar();
 *   var tabButton1 = new qx.ui.mobile.tabbar.TabButton("Tab 1");
 *   tabButton1.setView(view1);
 *   tabBar.add(tabButton1);
 *   var tabButton2 = new qx.ui.mobile.tabbar.TabButton("Tab 2");
 *   tabButton2.setView(view2);
 *   tabBar.add(tabButton2);
 *
 *   this.getRoot.add(tabBar);
 * </pre>
 *
 * This example creates a tab bar and adds two tab buttons to it.
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
    defaultCssClass :
    {
      refine : true,
      init : "tabBar"
    },


    /**
     * Sets the selected tab.
     */
    selection :
    {
      check : "qx.ui.mobile.tabbar.TabButton",
      nullable : true,
      init : null,
      apply : "_applySelection",
      event : "changeSelection"
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
     * Event handler. Called when a tab event occurs.
     *
     * @param evt {qx.event.type.Tap} The event object
     */
    _onTap: function(evt) {
      var target = evt.getTarget();

      while (!(target instanceof qx.ui.mobile.tabbar.TabButton)) {
        if (target.getLayoutParent) {
          var layoutParent = target.getLayoutParent();
          if (layoutParent == null || layoutParent instanceof qx.ui.mobile.tabbar.TabBar) {
            target = null;
            break;
          }
          target = layoutParent;
        } else {
          target = null;
          break;
        }
      }
      if (target !== null) {
        this.setSelection(target);
      }
    },


    // property apply
    _applySelection : function(value, old)
    {
      if (old) {
        old.removeCssClass("selected");
        if (old.getView()) {
          old.getView().exclude();
        }
      }
      if (value) {
        value.addCssClass("selected");
        if (value.getView()) {
          value.getView().show();
        }
      }
    },


    /**
     * Adds a tab button to the tab bar.
     *
     * @param button {qx.ui.mobile.tabbar.TabButton} The button to add
     */
    add : function(button)
    {
      this._add(button, {flex:1});
      if (!this.getSelection()) {
        this.setSelection(button);
      }
      button.addListener("changeView", this._onChangeView, this);
    },


    /**
     * Event handler. Called when the view was changed.
     *
     * @param evt {qx.event.type.Data} The event
     */
    _onChangeView : function(evt)
    {
      if (this.getSelection() == evt.getTarget()) {
        evt.getData().show();
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
      if (this.getSelection() == button) {
        this.setSelection(null);
      }
      button.removeListener("changeView", this._onChangeView, this);
    }
  },


  destruct : function()
  {
    this.removeListener("tap", this._onTap, this);
  }
});
