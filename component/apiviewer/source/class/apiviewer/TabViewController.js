/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

/**
 * Implements the dynamic behavior of the API viewer.
 * The GUI is defined in {@link Viewer}.
 */
qx.Class.define("apiviewer.TabViewController",
{
  extend : qx.core.Object,

  construct : function(widgetRegistry)
  {
    this.base(arguments);

    apiviewer.TabViewController.instance = this;

    this._tabView = widgetRegistry.getWidgetById("tabView");
    this._tabView.addListener("changeSelection", this.__onChangeSelection, this);
  },


  events :
  {
    /** This event if dispatched if one of the internal links is clicked */
    "classLinkClicked" : "qx.event.type.Data",

    "changeSelection" : "qx.event.type.Data"
  },


  members :
  {
    showTabView : function() {
      this._tabView.show();
    },

    /**
     * Callback for internal links to other classes/items.
     * This code is called directly from the generated HTML of the
     * class viewer.
     */
    onSelectItem : function(itemName) {
      this.fireDataEvent("classLinkClicked", itemName);
    },

    showItem : function(itemName) {
      qx.ui.core.queue.Manager.flush();

      var page = this._tabView.getSelection()[0];
      page.setUserData("itemName", itemName);

      return page.getChildren()[0].showItem(itemName);
    },

    openPackage : function(classNode, newTab)
    {
      this.__open(classNode, apiviewer.ui.tabview.PackagePage, newTab);
    },

    openClass : function(classNode, newTab) {
      this.__open(classNode, apiviewer.ui.tabview.ClassPage, newTab);
    },

    __open : function(classNode, clazz, newTab)
    {
      var currentPage = this._tabView.getSelection()[0];

      if (newTab == true || currentPage == null) {
        this.__createAndAdd(clazz, classNode);
      }
      else
      {
        if (currentPage instanceof clazz) {
          currentPage.setClassNode(classNode);
          currentPage.setUserData("itemName", null);
        }
        else
        {
          this.__createAndAdd(clazz, classNode);
          this.__destroyAndRemove(currentPage);
        }
      }
      apiviewer.LoadingIndicator.getInstance().hide();
    },

    __createAndAdd : function(clazz, classNode) {
      var page = new clazz(classNode);
      this._tabView.add(page);
      this._tabView.setSelection([page]);
    },

    __destroyAndRemove : function(page) {
      this._tabView.remove(page);
      page.destroy();
    },

    __onChangeSelection : function(event)
    {
      var oldData = event.getOldData();
      var data = event.getData();
      this.fireDataEvent("changeSelection", data, oldData);
    },

    __createAndStopEvent : function(nativeEvent, target)
    {
      var qxEvent = new qx.event.type.Mouse();
      qxEvent.init(nativeEvent, target, null, true, true);
      qxEvent.stop();
      return qxEvent;
    }
  },

  destruct : function()
  {
    this._tabView.destroy();
    this._tabView = null;
  }
});
