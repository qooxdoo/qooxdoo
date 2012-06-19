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
     * Til Schneider (til132)
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Fabian Jakobs (fjakobs)
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */

/**
 * Implements the dynamic behavior of the API viewer.
 * The GUI is defined in {@link Viewer}.
 */
qx.Class.define("apiviewer.Controller",
{
  extend : qx.core.Object,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param widgetRegistry {Viewer} the GUI
   */
  construct : function(widgetRegistry)
  {
    this.base(arguments);

    this._widgetRegistry = apiviewer.MWidgetRegistry;

    this._titlePrefix = "API Documentation";
    document.title = this._titlePrefix;

    this._classLoader = new apiviewer.ClassLoader("./script");

    this._detailLoader = this._widgetRegistry.getWidgetById("detail_loader");
    this._tabViewController = new apiviewer.TabViewController(this._widgetRegistry);
    this.__bindTabViewController();

    this._tree = this._widgetRegistry.getWidgetById("tree");
    this.__bindTree();

    this.__bindToolbar();

    var btn_inherited = this._widgetRegistry.getWidgetById("btn_inherited");
    var btn_included = this._widgetRegistry.getWidgetById("btn_included");

    btn_inherited.addListener("changeValue", this.__syncMenuButton, this);
    btn_included.addListener("changeValue", this.__syncMenuButton, this);


    this._history = qx.bom.History.getInstance();
    this.__bindHistory();

    qx.core.Init.getApplication().getRoot().addListener("mousedown", function(e) {
        this.__openInNewTab = e.isShiftPressed() || e.isCtrlOrCommandPressed();
    }, this, true);
  },


  members :
  {
    __openInNewTab : false,

    // overridden
    $$logCategory : "application",

    /**
     * Loads the API doc tree from a URL. The URL must point to a JSON encoded
     * doc tree.
     *
     * @lint ignoreDeprecated(eval,alert)
     * @param url {String} the URL.
     */
    load : function(url)
    {
      var req = new qx.io.remote.Request(url);

      req.setTimeout(180000);
      req.setProhibitCaching(false);

      req.addListener("completed", function(evt)
      {
        var loadEnd = new Date();

        if (qx.core.Environment.get("qx.debug")) {
          this.debug("Time to load data from server: " + (loadEnd.getTime() - loadStart.getTime()) + "ms");
        }

        var content = evt.getContent();

        var start = new Date();
        var treeData = eval("(" + content + ")");
        var end = new Date();

        if (qx.core.Environment.get("qx.debug")) {
          this.debug("Time to eval tree data: " + (end.getTime() - start.getTime()) + "ms");
        }

        // give the browser a chance to update its UI before doing more
        qx.event.Timer.once(function() {
          this.__setDocTree(treeData);

          qx.event.Timer.once(function()
          {
            // Handle bookmarks
            var state = this._history.getState();
            if (state)
            {
              this.__selectItem(this.__decodeState(state));
            }
            else
            {
              // Load the first package if nothing is selected.
              var firstPackage = this.__getFirstPackage(treeData);
              var fullName = firstPackage.attributes.fullName;
              this.__selectItem(fullName);
            }
          }, this, 0);

        }, this, 0);
      }, this);

      var failed = function(evt) {
        this.error("Couldn't load file: " + url);
        if (window.location.protocol == "file:") {
          alert("Failed to load API data from the file system.\n\n" +
                "The security settings of your browser may prohibit AJAX " +
                "when using the file protocol. Please try the http protocol " +
                "instead.");
        }
      };

      req.addListener("failed", failed, this);
      req.addListener("aborted", failed, this);

      var loadStart = new Date();
      req.send();
    },


    /**
     * binds the events of the TabView controller
     */
    __bindTabViewController : function()
    {
      this._tabViewController.addListener("classLinkClicked", function(evt) {
          this._updateHistory(evt.getData());
      }, this);

      this._tabViewController.addListener("changeSelection", function(evt) {
        var page = evt.getData()[0];

        if (this._ignoreTabViewSelection == true) {
          return;
        }

        if (page && page.getUserData("nodeName")) {
          var nodeName = page.getUserData("nodeName");
          var itemName = page.getUserData("itemName");

          if (itemName != null) {
            this._updateHistory(nodeName + "#" + itemName);
          } else {
            this._updateHistory(nodeName);
          }
        } else {
          this._tree.resetSelection();
        }
      }, this);
    },


    /**
     * binds the selection event of the package tree.
     */
    __bindTree : function()
    {
      this._tree.addListener("changeSelection", function(evt) {
        var treeNode = evt.getData()[0];
        if (treeNode && treeNode.getUserData("nodeName") && !this._ignoreTreeSelection)
        {
          var nodeName = treeNode.getUserData("nodeName");

          // the history update will cause _selectClass to be called.
          this._updateHistory(nodeName);
        }
      }, this);
    },


    /**
     * binds the actions of the toolbar buttons.
     */
    __bindToolbar : function()
    {
      var uiModel = apiviewer.UiModel.getInstance();

      var btn_inherited = this._widgetRegistry.getWidgetById("btn_inherited");
      btn_inherited.bind("value", uiModel, "showInherited");
      uiModel.bind("showInherited", btn_inherited, "value");

      var btn_included = this._widgetRegistry.getWidgetById("btn_included");
      btn_included.bind("value", uiModel, "showIncluded");
      uiModel.bind("showIncluded", btn_included, "value");

      var btn_expand = this._widgetRegistry.getWidgetById("btn_expand");
      btn_expand.bind("value", uiModel, "expandProperties");
      uiModel.bind("expandProperties", btn_expand, "value");

      var btn_protected = this._widgetRegistry.getWidgetById("btn_protected");
      btn_protected.bind("value", uiModel, "showProtected");
      uiModel.bind("showProtected", btn_protected, "value");

      var btn_private = this._widgetRegistry.getWidgetById("btn_private");
      btn_private.bind("value", uiModel, "showPrivate");
      uiModel.bind("showPrivate", btn_private, "value");

      var btn_internal = this._widgetRegistry.getWidgetById("btn_internal");
      btn_internal.bind("value", uiModel, "showInternal");
      uiModel.bind("showInternal", btn_internal, "value");
    },


    /**
     * Keeps the icon of the menubutton in sync with the menu checkboxes of inherited and mixin includes.
     *
     */
    __syncMenuButton : function()
    {
      var menuButton = this._widgetRegistry.getWidgetById("menubtn_includes");
      var btn_inherited = this._widgetRegistry.getWidgetById("btn_inherited");
      var btn_included = this._widgetRegistry.getWidgetById("btn_included");
      var showInherited = btn_inherited.getValue();
      var showMixins = btn_included.getValue();
      if(showMixins && showInherited)
      {
        menuButton.setIcon('apiviewer/image/inherited_and_mixins_included.gif');
      }
      if(showInherited && !showMixins)
      {
        menuButton.setIcon('apiviewer/image/method_public_inherited18.gif');
      }
      if(!showInherited && showMixins)
      {
        menuButton.setIcon('apiviewer/image/overlay_mixin18.gif');
      }
      if(!showInherited && !showMixins)
      {
        menuButton.setIcon('apiviewer/image/includes.gif');
      }

    },

    /**
     * bind history events
     */
    __bindHistory : function()
    {
      this._history.addListener("changeState", function(evt) {
        var item = this.__decodeState(evt.getData());
        if (item) {
          this.__selectItem(item);
        }
      }, this);
    },


    /**
     * Loads the documentation tree.
     *
     * @param docTree {apiviewer.dao.Package} root node of the documentation tree
     */
    __setDocTree : function(docTree)
    {
      var start = new Date();
      var rootPackage = new apiviewer.dao.Package(docTree);
      var end = new Date();

      if (qx.core.Environment.get("qx.debug")) {
        this.debug("Time to build data tree: " + (end.getTime() - start.getTime()) + "ms");
      }

      var start = new Date();
      this._tree.setTreeData(rootPackage);
      var end = new Date();

      if (qx.core.Environment.get("qx.debug")) {
        this.debug("Time to update tree: " + (end.getTime() - start.getTime()) + "ms");
      }

      return true;
    },


    /**
     * Push the class to the browser history
     *
     * @param className {String} name of the class
     */
    _updateHistory : function(className)
    {
      var newTitle = className + " - " + this._titlePrefix;
      qx.bom.History.getInstance().addToHistory(this.__encodeState(className), newTitle);
    },


    /**
     * Display information about a class
     *
     * @param classNode {apiviewer.dao.Class} class node to display
     */
    _selectClass : function(classNode, callback, self)
    {
      this._detailLoader.exclude();
      this._tabViewController.showTabView();

      var cb = callback ? qx.lang.Function.bind(callback, self) : function() {};

      if (classNode instanceof apiviewer.dao.Class)
      {
        this._classLoader.classLoadDependendClasses(classNode, function(cls)
        {
          this._tabViewController.openClass(cls, this.__openInNewTab);
          cb();
        }, this);
      }
      else
      {
        this._classLoader.packageLoadDependendClasses(classNode, function()
        {
          this._tabViewController.openPackage(classNode, this.__openInNewTab);
          cb();
        }, this);
      }
    },


    /**
     * Selects an item (class, property, method or constant).
     *
     * @param fullItemName {String} the full name of the item to select.
     *          (e.g. "qx.mypackage.MyClass" or "qx.mypackage.MyClass#myProperty")
     *
     * @lint ignoreDeprecated(alert)
     */
    __selectItem : function(fullItemName)
    {
      apiviewer.LoadingIndicator.getInstance().show();
      var className = fullItemName;
      var itemName = null;
      var hashPos = fullItemName.indexOf("#");

      if (hashPos != -1)
      {
        className = fullItemName.substring(0, hashPos);
        itemName = fullItemName.substring(hashPos + 1);

        var parenPos = itemName.indexOf("(");

        if (parenPos != -1) {
          itemName = qx.lang.String.trim(itemName.substring(0, parenPos));
        }
      }

      // ignore changeSelection events
      this._ignoreTreeSelection = true;
      var couldSelectTreeNode = this._tree.selectTreeNodeByClassName(className);
      this._ignoreTreeSelection = false;

      if (!couldSelectTreeNode) {
        this.error("Unknown class: " + className);
        alert("Unknown class: " + className);
        apiviewer.LoadingIndicator.getInstance().hide();
        return;
      }

      var nodeName = this._tree.getSelection()[0].getUserData("nodeName") || className;

      /**
       * @lint ignoreDeprecated(alert)
       */
      this._ignoreTabViewSelection = true;
      this._selectClass(apiviewer.dao.Class.getClassByName(nodeName), function()
      {
        if (itemName)
        {
          if (!this._tabViewController.showItem(itemName))
          {
            this.error("Unknown item of class '"+ className +"': " + itemName);
            alert("Unknown item of class '"+ className +"': " + itemName);
            apiviewer.LoadingIndicator.getInstance().hide();

            this._updateHistory(className);
            this._ignoreTabViewSelection = false;
            return;
          }
        }
        this._updateHistory(fullItemName);
        this._ignoreTabViewSelection = false;
      }, this);

    },


    __encodeState : function(state) {
      return state.replace(/(.*)#(.*)/g, "$1~$2")
    },

    __decodeState : function(encodedState) {
      return encodedState.replace(/(.*)~(.*)/g, "$1#$2")
    },

    /**
     * Gets the first package in the documentation tree.
     *
     * @param docTree {apiviewer.dao.Package} root node of the documentation
     * tree
     * @return {apiviewer.dao.Package} First package.
     */
    __getFirstPackage : function(tree)
    {
      for (var i=0, l=tree.children.length; i<l; i++) {
        var child = tree.children[i];
        if(child.type && child.type == "package") {
           return child;
        } else {
           return this.__getFirstPackage(child);
        }
      }
    }

  },



  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this._widgetRegistry = null;
    this._disposeObjects("_detailLoader", "_classLoader", "_tree", "_history", "_tabViewController");
  }
});
