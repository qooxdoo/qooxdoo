/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2008-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
/* ************************************************************************

#asset(inspector/*)
#asset(qx/icon/Tango/16/actions/view-refresh.png)
#ignore(qxinspector.local)

************************************************************************ */

/**
 * This is the main application class of your custom application "inspector"
 */
qx.Class.define("inspector.Application",
{
  extend : qx.application.Standalone,

  construct : function()
  {
    this.base(arguments);

    qx.bom.Stylesheet.includeFile("inspector/css/domview.css");
    qx.bom.Stylesheet.includeFile("inspector/css/consoleview.css");
    qx.bom.Stylesheet.includeFile("inspector/css/sourceview.css");
    qx.bom.Stylesheet.includeFile("inspector/css/propertylisthtml.css");
  },

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __checkCount : null,

    /*
     * Toolbar
     */
    _toolbar : null,
    _objectsButton : null,
    _widgetsButton : null,
    _consoleButton : null,
    _propertyButton : null,
    _inspectButton : null,
    _selectedWidgetLabel : null,
    _urlTextField : null,
    _reloadButton : null,

    /*
     * Windows
     */
    _objectsWindow : null,
    _widgetsWindow : null,
    _consoleWindow : null,
    _propertyWindow : null,

    /*
     * Inspector
     */
    _container : null,
    _iFrame : null,
    _loading : null,
    _selector : null,
    _loadedWindow : null,


    __inspectorModel : null,
    __state : null,

    /**
     * This method contains the initial application code and gets called
     * during startup of the application
     *
     * @lint ignoreUndefined(qxinspector)
     */
    main : function()
    {
      // Call super class
      this.base(arguments);

      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        qx.log.appender.Native;
        qx.log.appender.Console;
      }

      this.__inspectorModel = new inspector.components.InspectorModel(this);
      this.__state = new inspector.components.State();

      this._container = new qx.ui.container.Composite(new qx.ui.layout.VBox());
      this.getRoot().add(this._container, {edge : 0});

      this.__createToolbar();
      this.__setEnabledToolbar(false);

      var startUrl = "..";
      var cookieUrl = qx.bom.Cookie.get("url");
      if (cookieUrl == undefined || cookieUrl == "") {
        cookieUrl = startUrl;
      }

      if (window.qxinspector != undefined && qxinspector.local)
      {
        this._urlTextField.setVisibility("hidden");
        startUrl = "index.html";
      }
      else {
        startUrl = cookieUrl;
      }

      // create the iFrame
      this._loading = true;
      this._iFrame = new qx.ui.embed.Iframe(startUrl);
      this._iFrame.setDecorator(null);
      this._container.add(this._iFrame, {flex : 1});

      this._iFrame.addListener("load", this.__onLoad, this);
      this._urlTextField.setValue(startUrl);
    },

    __onLoad : function() {
      this.__checkCount = 0;
      this.__initInspector();

      var iFrameSource = this._iFrame.getSource();
      try {
        iFrameSource = this._iFrame.getWindow().location.pathname;
      } catch (ex) {}

      if (window.qxinspector == undefined) {
        this._urlTextField.setValue(iFrameSource);
      }

      // save the url in a cookie
      qx.bom.Cookie.set("url", iFrameSource, 7);
    },

    __initInspector : function()
    {
      this._loadedWindow = this._iFrame.getContentElement().getWindow();

      this.__setEnabledToolbar(false);
      // check if the app is loaded correctly
      if (!this.__checkWorking()) {
        return;
      }
      this.__setEnabledToolbar(true);

      // check for the selector
      if (!this._selector) {
        this._selector = new inspector.components.Selector(this._loadedWindow);
      } else {
        this._selector.setJSWindow(this._loadedWindow);
      }

      // select the root app
      this._selector.addListener("changeSelection", this._changeSelection, this);
      this._selector.setSelection(this._loadedWindow.qx.core.Init.getApplication());

      this._loading = false;

      this.__checkForReload();

      // select the root of the new app
      this.__inspectorModel.setObjectRegistry(this._loadedWindow.qx.core.ObjectRegistry);
      this.select(this._loadedWindow.qx.core.Init.getApplication().getRoot());

      // check for the cookies
      this.__state.restoreState();
      this.__checkCookies();
    },

    /*
    -------------------------------------------------------------------------
      Initialize helper
    -------------------------------------------------------------------------
    */

    __checkForReload: function() {
      // check if the objects window is open
      if (this._objectsWindow != null && this._objectsWindow.isVisible()) {
        this._objectsWindow.load(this._loadedWindow);
      }

      // check if the widgets window is open
      if (this._widgetsWindow != null && this._widgetsWindow.isVisible()) {
        this._widgetsWindow.load(this._loadedWindow);
      }
    },


    __checkCookieFor: function(winRef, button, name) {
      // if the open cookie is set
      var cookie = qx.bom.Cookie.get(name + "Open");
      if (cookie == "true" || cookie === null) {
        button.setValue(true);

        // check the position
        var top = parseInt(qx.bom.Cookie.get(name + "Top"));
        var left = parseInt(qx.bom.Cookie.get(name + "Left"));
        if (!isNaN(top) && !isNaN(left)) {
          this[winRef].moveTo(left, top);
        }
        // check the size
        var width = parseInt(qx.bom.Cookie.get(name + "Width"));
        var height =   parseInt(qx.bom.Cookie.get(name + "Height"));
        if (!isNaN(height)) {
          this[winRef].setHeight(height);
        }
        if (!isNaN(width)) {
          this[winRef].setWidth(width);
        }
      }
    },


    __checkCookies: function() {
      // check the objects window
      //this.__checkCookieFor("_objectsWindow", this._objectsButton, "objects");
      // check the widgets window
      this.__checkCookieFor("_widgetsWindow", this._widgetsButton, "widgets");
      // check the console window
      this.__checkCookieFor("_consoleWindow", this._consoleButton, "console");
      // check the property window
      this.__checkCookieFor("_propertyWindow", this._propertyButton, "property");
    },


    __checkWorking: function() {
      // try to access the javascript objects in the iframe
      try {
        this.__checkCount++;

        // also break if its undefined
        if (this.__checkCount > 20) {
          throw new Error("qooxdoo not found!");
        }
        try {
          // try to get the root element of the application
          this._loadedWindow.qx.core.Init.getApplication().getRoot();

          return true;
        } catch (ex) {
          qx.event.Timer.once(this.__initInspector, this, 500);
          throw new Error("qooxdoo isn't ready at the moment!");
        }
      } catch (ex) {
        // signal that the inspector is not working
        this._selectedWidgetLabel.setValue(
          " Can not access the javascript in the iframe!"
        );
        return false;
      }
    },


    /*
    -------------------------------------------------------------------------
      Create helper
    -------------------------------------------------------------------------
    */
    __createToolbar: function() {
      // create the toolbar itself
      this._toolbar = new qx.ui.toolbar.ToolBar();
      this._toolbar.setDecorator("myToolbar");
      this._toolbar._getLayout().setAlignY("middle");
      this._container.add(this._toolbar);

      // create the headline label
      var inspectorLabel = new qx.ui.basic.Label("qooxdoo Inspector");
      inspectorLabel.setPaddingLeft(10);
      inspectorLabel.setPaddingRight(5);
      var font = new qx.bom.Font(12, ["Lucida Grande"])
      font.setBold(true);
      font.setItalic(true);
      inspectorLabel.setFont(font);
      this._toolbar.add(inspectorLabel);

      // add a separator
      this._toolbar.add(new qx.ui.toolbar.Separator());

      // Objects window
      var objectWindow2 = new inspector.objects2.Window("Objects", this.__inspectorModel);
      this.__state.add(objectWindow2, "objects");

      this._objectsButton = new qx.ui.toolbar.CheckBox("Objects");
      this._toolbar.add(this._objectsButton);
      this._objectsButton.addListener("changeValue", function(e) {
        e.getData() ? objectWindow2.open() : objectWindow2.close();
      }, this);
      objectWindow2.addListener("open", function(e) {
        this._objectsButton.setValue(true);
      }, this);
      objectWindow2.addListener("close", function(e) {
        this._objectsButton.setValue(false);
      }, this);


      // Widgets window
      this.__createWindow(
        "_widgetsButton", "Widgets", "_widgetsWindow",
        inspector.widgets.WidgetsWindow, "widgets",
        function() {
          this._widgetsWindow.load();
        }
      );

      // Property Window
      this.__createWindow(
        "_propertyButton", "Properties", "_propertyWindow",
        inspector.property.PropertyWindow, "property",
        function() {
          this._propertyWindow.select(this._selector.getSelection());
        }
      );

      // Console window
      this.__createWindow(
        "_consoleButton", "Console", "_consoleWindow",
        inspector.console.ConsoleWindow, "console",
        function() {
        }
      );

      // add the third separator
      this._toolbar.add(new qx.ui.toolbar.Separator());

      // create the find button
      this._inspectButton = new qx.ui.toolbar.CheckBox("Inspect widget", "inspector/images/icons/edit-find.png");
      this._inspectButton.setAppearance("toolbar-button-bold");
      this._toolbar.add(this._inspectButton);
      this._inspectButton.addListener("changeValue", function(e) {
        if (e.getData()) {
          this._selector.start();
        } else {
          this._selector.end();
        }
      }, this);

      // add the second separator
//      this._toolbar.add(new qx.ui.toolbar.Separator());

      // Lable showing the selected widget
      this._selectedWidgetLabel = new qx.ui.basic.Label();
      this._selectedWidgetLabel.setRich(true);
      this._toolbar.add(this._selectedWidgetLabel);

      // add a spacer to seperate the url
      this._toolbar.addSpacer();

      // add the url textfield
      this._urlTextField = new qx.ui.form.TextField();
      this._urlTextField.setMarginRight(5);
      this._urlTextField.setWidth(300);
      this._toolbar.add(this._urlTextField);
      this._urlTextField.addListener("changeValue", this._reloadIframe, this);

      // reload button
      this._reloadButton = new qx.ui.toolbar.Button(null, "icon/16/actions/view-refresh.png");
      this._toolbar.add(this._reloadButton);
      this._reloadButton.addListener("execute", this._reloadIframe, this);
    },


    _reloadIframe: function(e) {
      this._loading = true;

      var iFrameSource = this._iFrame.getSource();
      try {
        iFrameSource = this._iFrame.getWindow().location.pathname;
      } catch (ex) {}

      if (iFrameSource != this._urlTextField.getValue()) {
        this._iFrame.setSource(this._urlTextField.getValue());
      }
      else
      {
        if (e.getType() == "execute") {
          if (this._iFrame.getSource != iFrameSource) {
            this._iFrame.setSource(iFrameSource);
          } else {
            this._iFrame.reload();
          }
        }
      }
    },


    __createWindow: function(buttonRef, buttonName, winRef, winClass, name, loadFunc) {
      this[buttonRef] = new qx.ui.toolbar.CheckBox(buttonName);
      this._toolbar.add(this[buttonRef]);
      var wasOpen = false;
      this[buttonRef].addListener("changeValue", function(e) {
        if (!wasOpen) {
          // create and add an instance
          this[winRef] = new winClass();
          this.getRoot().add(this[winRef]);

          this[winRef].setInitSizeAndPosition();

          // add the listeners to the window
          this.__addWindowListener(this[winRef], this[buttonRef], name);
        }
        // open the window
        e.getData() ? this[winRef].open() : this[winRef].close();

        // call the load functio
        loadFunc.call(this)

        wasOpen = true;

        // store the open status in a cookie
        qx.bom.Cookie.set(name + "Open", e.getData(), 7);
      }, this);
    },


    __addWindowListener: function(win, button, name) {
      // add a close listener
      win.addListener("close", function() {
        button.setValue(false);
      }, this);
      // add a move listener
      win.addListener("move", function(e) {
        qx.bom.Cookie.set(name + "Left", e.getData().left, 7);
        qx.bom.Cookie.set(name + "Top", e.getData().top, 7);
      }, this);
      // add a resize listener
      win.addListener("resize", function(e) {
        qx.bom.Cookie.set(name + "Width", e.getData().width, 7);
        qx.bom.Cookie.set(name + "Height", e.getData().height, 7);
      }, this);
    },


    __setEnabledToolbar : function(value)
    {
      this._objectsButton.setEnabled(value);
      this._widgetsButton.setEnabled(value);
      this._consoleButton.setEnabled(value);
      this._propertyButton.setEnabled(value);
      this._inspectButton.setEnabled(value);
      this._selectedWidgetLabel.setEnabled(value);
    },


    /*
    -------------------------------------------------------------------------
      Selection functions
    -------------------------------------------------------------------------
    */
    _changeSelection: function(e) {
      this._inspectButton.setValue(false);
      this.select(e.getData(), this._selector);
    },


    getSelectedObject : function() {
      return this._selector.getSelection();
    },


    setWidgetByHash : function(hash, initiator) {
      // check the initiator
      if (initiator == "console") {
        initiator = this._consoleWindow;
        // tell the console to go to the default view
        this._consoleWindow.goToDefaultView();
      }
      var object = this._loadedWindow.qx.core.ObjectRegistry.fromHashCode(hash);
      this.select(object, initiator);
    },


    inspectObjectByDomSelecet: function(index, key) {
      if (this._consoleWindow != null) {
          this._consoleWindow.inspectObjectByDomSelecet(index, key);
      }
    },


    inspectObjectByInternalId: function(id) {
      // if the console exists
      if (this._consoleWindow != null) {
        // tell the consol to do the rest
        this._consoleWindow.inspectObjectByInternalId(id);
      }
    },


    select: function(object, initiator) {
      // if its currently loaiding, do nothing
      if (this._loading || !object) {
        return;
      }
      // show the selected widget in the inspector bar
      this._selectedWidgetLabel.setValue("<tt>" + object.toString() + "</tt>");

      if (initiator != this._selector) {
        if (object !== this._selector.getSelection()) {
          this._selector.setSelection(object);
        }
      }

      if (this._objectsWindow != null && initiator != this._objectsWindow) {
        if (object != this._objectsWindow.getSelection()) {
          this._objectsWindow.select(object, true);
        }
      }

      if (this._widgetsWindow != null && initiator != this._widgetsWindow) {
        if (object != this._widgetsWindow.getSelection()) {
          this._widgetsWindow.select(object, true);
        }
      }

      if (this._propertyWindow != null && initiator != this._propertyWindow) {
        if (object != this._propertyWindow.getSelection() &&
            this._propertyWindow.getMode() != "minimized") {
          this._propertyWindow.select(object, true);
        }
      }

      this.__inspectorModel.setInspected(object);

      this._selector.highlightFor(object, 1000);
    },


    /*
    -------------------------------------------------------------------------
      Internal stuff
    -------------------------------------------------------------------------
    */
    getIframeWindowObject : function() {
      return this._loadedWindow;
    },


    getExcludes: function() {
      if (this._selector != null) {
        return this._selector.getAddedWidgets();
      } else {
        return [];
      }
    }
  },

  destruct : function()
  {
    this._loadedWindow = null;
    this._disposeObjects("_container", "_toolbar", "_objectsButton",
      "_widgetsButton", "_propertyButton", "_consoleButton",
      "_inspectButton", "_selectedWidgetLabel", "_urlTextField",
      "_reloadButton", "_iFrame", "_selector", "_objectsWindow",
      "_widgetsWindow", "_consoleWindow", "_propertyWindow");
  }
});
