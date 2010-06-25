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
     * Christian Schmidt (chris_schmidt)

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

    this._tabView = widgetRegistry.getWidgetById("tabView");
    this.__pages = [];

    apiviewer.TabViewController.instance = this;

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
    __pages : null,

    showTabView : function() {
      this._tabView.show();
    },

    /**
     * Callback for internal links to other classes/items.
     * This code is called directly from the generated HTML of the
     * class viewer.
     *
     * @param itemName {String} the name of the item.
     * @see Controller#selectItem
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

    openPackage : function(classNode)
    {
      var page = this.__getPageFor(classNode, this.__createPageForPackage);
      page.setUserData("nodeName", classNode.getFullName());
      this.__open(page);
    },

    openClass : function(classNode)
    {
      var page = this.__getPageFor(classNode, this.__createPageForClass);
      page.setUserData("nodeName", classNode.getFullName());
      this.__open(page);
    },

    __open : function(page)
    {
      if (!qx.lang.Array.contains(this._tabView.getChildren(), page)) {
        this._tabView.add(page);
      }
      this._tabView.setSelection([page]);
    },

    __getPageFor : function(classNode, createFunction) {
      var id = classNode.getFullName();

      if (!this.__isPageCreated(id)) {
        createFunction = qx.lang.Function.bind(createFunction, this);
        var page = createFunction(classNode);
        this.__registerPage(id, page);
      }

      return this.__getPage(id);
    },

    __isPageCreated : function(id) {
      return this.__pages[id] != null
    },

    __getPage : function(id) {
      return this.__pages[id];
    },

    __registerPage : function(id, page) {
      this.__pages[id] = page;
    },

    __createPageForPackage : function(classNode)
    {
      var packageViewer = new apiviewer.ui.PackageViewer();
      packageViewer.setDocNode(classNode);
      this.__bindViewer(packageViewer);

      var title = classNode.getFullName();
      var image = apiviewer.TreeUtil.getIconUrl(classNode)
      return this.__createPage(title, image, packageViewer);
    },

    __createPageForClass : function(classNode)
    {
      var classViewer = new apiviewer.ui.ClassViewer();
      classViewer.setDocNode(classNode);
      this.__bindViewer(classViewer);

      var title = classNode.getFullName();
      var image = apiviewer.TreeUtil.getIconUrl(classNode)
      return this.__createPage(title, image, classViewer);
    },

    __createPage : function(name, image, content)
    {
      var page = new qx.ui.tabview.Page(name, image);
      page.setShowCloseButton(true);
      page.setLayout(new qx.ui.layout.Canvas());
      page.add(content, {edge : 0});

      return page;
    },

    __bindViewer : function(viewer)
    {
      var uiModel = apiviewer.UiModel.getInstance();
      uiModel.bind("showInherited", viewer, "showInherited");
      uiModel.bind("expandProperties", viewer, "expandProperties");
      uiModel.bind("showProtected", viewer, "showProtected");
      uiModel.bind("showPrivate", viewer, "showPrivate");
    },

    __onChangeSelection : function(event)
    {
      var oldData = event.getOldData();
      var data = event.getData();
      this.fireDataEvent("changeSelection", data, oldData);
    }
  },

  destruct : function() {
    this._tabView = this.__pages = null;
  }
});
