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
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */
/* ************************************************************************

#asset(inspector/*)
#asset(qx/icon/Tango/16/actions/view-refresh.png)
#ignore(qxinspector)

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
    __frameUnsafeAttempt : null,

    /*
     * Toolbar
     */
    _toolbar : null,
    _objectsButton : null,
    _widgetsButton : null,
    _consoleButton : null,
    _propertyButton : null,
    _seleniumButton : null,
    _inspectButton : null,
    _selectedWidgetLabel : null,
    _urlTextField : null,
    _reloadButton : null,

    /*
     * Windows
     */
    _consoleWindow : null,

    /*
     * Inspector
     */
    _container : null,
    _iFrame : null,
    _loading : null,
    __selector : null,
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
      this.__inspectorModel.addListener("changeInspected", this.__changeInspected, this);

      this.__selector = new inspector.components.Selector(this.__inspectorModel);

      this.__state = new inspector.components.State();
      this.__state.setIgnoreChanges(true);

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
      this.__inspectorModel.setWindow(null);
      this.__inspectorModel.setInspected(null);
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

      this._loading = false;

      // select the root of the new app
      this.__inspectorModel.setWindow(this._loadedWindow);
      this.__inspectorModel.setInspected(this._loadedWindow.qx.core.Init.getApplication().getRoot());

      // check for the cookies
      this.__state.setIgnoreChanges(false);
      this.__state.restoreState();
    },

    /*
    -------------------------------------------------------------------------
      Initialize helper
    -------------------------------------------------------------------------
    */

    __checkWorking: function() {
      // try to access the javascript objects in the iframe
      try {
        this.__checkCount++;

        // also break if its undefined
        if (this.__checkCount > 30) {
          throw new Error("No qooxdoo application root found!");
        }
        try {
          // try to get the root element of the application
          this._loadedWindow.qx.core.Init.getApplication().getRoot();

          return true;
        } catch (ex) {
          qx.event.Timer.once(this.__initInspector, this, 500);

          // check if inspect fails because of security restrictions
          try {
            // check if we can access the iframe
            this._loadedWindow.document;

            // if we get here, there are no security restrictions - try again
            return false;

          } catch(ex) {
            if (window.location.protocol == "file:" && !this.__frameUnsafeAttempt) {
              alert("Failed to inspect application loaded from the file system.\n\n" +
                    "The security settings of your browser may prohibit to access " +
                    "frames loaded using the file protocol. Please try the http " +
                    "protocol instead.");

              // prohibit the alert from being shown again
              this.__frameUnsafeAttempt = true;
            }
          }

        }
      } catch (ex) {
        // signal that the inspector is not working
        this._selectedWidgetLabel.setValue(
          " Can not access the javascript in the iframe!"
        );
        this.__inspectorModel.setWindow(null);
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
      this.__createWindow("Objects", inspector.objects.Window, "_objectsButton");

      // Widgets window
      this.__createWindow("Widgets", inspector.widgets.WidgetsWindow, "_widgetsButton");

      // Property Window
      this.__createWindow("Properties", inspector.property.PropertyWindow, "_propertyButton");

      // Console window
      this._consoleWindow = this.__createWindow("Console", inspector.console.ConsoleWindow, "_consoleButton");

      // Selenium window
      this.__createWindow("Selenium", inspector.selenium.SeleniumWindow, "_seleniumButton");

      // add the third separator
      this._toolbar.add(new qx.ui.toolbar.Separator());

      // create the find button
      this._inspectButton = new qx.ui.toolbar.CheckBox("Inspect widget", "inspector/images/icons/edit-find.png");
      this._inspectButton.setAppearance("toolbar-button-bold");
      this._toolbar.add(this._inspectButton);
      this._inspectButton.addListener("changeValue", function(e) {
        if (e.getData()) {
          this.__selector.start();
        } else {
          this.__selector.stop();
        }
      }, this);

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


    __createWindow : function(name, clazz, buttonRef)
    {
      var win = new clazz(name, this.__inspectorModel);
      this.__state.add(win, name.toLowerCase());

      var button = this[buttonRef] = new qx.ui.toolbar.CheckBox(name);
      this._toolbar.add(button);

      button.addListener("changeValue", function(e) {
        e.getData() ? win.open() : win.close();
      }, this);

      button.addListener("changeEnabled", function(e) {
        if (e.getData() == false) {
          win.hide();
        }
      }, this);

      win.addListener("open", function(e) {
        button.setValue(true);
      }, this);

      win.addListener("close", function(e) {
        button.setValue(false);
      }, this);

      return win;
    },

    __setEnabledToolbar : function(value)
    {
      this._objectsButton.setEnabled(value);
      this._widgetsButton.setEnabled(value);
      this._consoleButton.setEnabled(value);
      this._propertyButton.setEnabled(value);
      this._seleniumButton.setEnabled(value);
      this._inspectButton.setEnabled(value);
      this._selectedWidgetLabel.setEnabled(value);
    },


    /*
    -------------------------------------------------------------------------
      Selection functions
    -------------------------------------------------------------------------
    */
    __changeInspected: function(e) {
      this._inspectButton.setValue(false);

      var object = e.getData();
      if (object != null) {
        this._selectedWidgetLabel.setValue("<tt>" + object.classname + "[" +
          object.toHashCode() + "]</tt>");
      }
    },


    getSelectedObject : function() {
      return this.__inspectorModel.getInspected();
    },


    setWidgetByHash : function(hash, initiator) {
      // check the initiator
      if (initiator == "console") {
        initiator = this._consoleWindow;
        // tell the console to go to the default view
        this._consoleWindow.goToDefaultView();
      }
      var object = this._loadedWindow.qx.core.ObjectRegistry.fromHashCode(hash);
      this.__inspectorModel.setInspected(object);
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
      qx.log.Logger.deprecatedMethodWarning(arguments.callee);
      // if its currently loaiding, do nothing
      if (this._loading || !object) {
        return;
      }
      this.__inspectorModel.setInspected(object);
    },


    /*
    -------------------------------------------------------------------------
      Internal stuff
    -------------------------------------------------------------------------
    */
    getIframeWindowObject : function() {
      return this._loadedWindow;
    }
  },

  destruct : function()
  {
    this._loadedWindow = null;
    this._disposeObjects("_container", "_toolbar", "_objectsButton",
      "_widgetsButton", "_propertyButton", "_consoleButton", "_seleniumButton",
      "_inspectButton", "_selectedWidgetLabel", "_urlTextField",
      "_reloadButton", "_iFrame", "__selector", "_consoleWindow");
  }
});
