/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

/* ************************************************************************
#asset(qx/icon/Tango/22/actions/view-refresh.png)
#asset(inspector/images/icons/api.png)
#asset(inspector/images/icons/setnull.png)
#asset(inspector/images/icons/setinit.png)
#asset(inspector/images/icons/highlight.png)
#asset(inspector/images/icons/goto.png)
************************************************************************ */

qx.Class.define("inspector.property.View",
{
  extend : inspector.components.AbstractView,
  implement : inspector.property.IPropertyListController,

  /**
   * Creates a new instance of a view.
   */
  construct : function()
  {
    this.base(arguments);

    this._filter = new inspector.property.Filter();

    this._addToolbarButtons();
    this._createMainElement();
  },

  statics :
  {
    RELOAD_BUTTON_TOOLTIP_TEXT : "Reload the window.",
    SHOW_API_BUTTON_TOOLTIP_TEXT : "Show the API of the selected object or property.",
    SET_NULL_BUTTON_TOOLTIP_TEXT : "Set the currently selected property to null.",
    SET_DEFAULT_BUTTON_TOOLTIP_TEXT: "Set the currently selected property to its initial value.",
    HIGHLIGHT_SELECTED_PROPERTY_BUTTON_TOOLTIP_TEXT: "Highlight the currently selected property.",
    GOTO_SELECTED_PROPERTY_BUTTON_TOOLTIP_TEXT: "Go to the currently selected property."
  },

  members :
  {
    /*
    *********************************
       ATTRIBUTES
    *********************************
    */
    // the window components
    _propertyList: null,
    _propertyListFull: null,
    _propertyListHtmlTable: null,

    // reload buttons
    _reloadButton: null,
    _reloadToolTip: null,
    // api button
    _apiButtonToolTip: null,
    // set null button
    _setNullButton: null,
    _setNullTooltip: null,
    // init button
    _setPropertyToDefaultButton: null,
    _setPropertyToDefaultTooltip: null,
    // highlight current property button
    _highlightCurrentPropertyButton: null,
    _highlightCurrentPropertyTooltip: null,
    // go to selected property button
    _gotoSelectedPropertyButton: null,
    _gotoSelectedPropertyTooltip: null,

    _menu: null,

    // the currently selected property
    _currentlySelectedProperty: null,
    // the currently selected qooxdoo object
    _qxObject: null,

    // flag to signal that the inherited properties should be displayed
    _showInherited: false,

    // timer for the reload interval
    _reloadTimer: null,

    // filter to sort the properties into groups
    _filter: null,

    /*
     * OLD
     */
    /**
     * Sets a new object. This new object is shown in the property editor.
     * @param object {qx.core.Object} The new qooxdoo object to set.
     */
    select: function(object) {
      // only set the widget if it is a new one
      if (this._qxObject == object) {
        return;
      }

      // save a reference to the current widget
      this._qxObject = object;
      // save the this reference for the timeout function
      var self = this;
      // to the reload of the list after a timeout (after the loading is shown)
      window.setTimeout(function() {
        // initialize the reload of the properties
        self._propertyList.build();
        // reload the button configuration for the property buttons
        if (self._currentlySelectedProperty != null) {
          // get the key and classname of the former selected property
          var key = self._currentlySelectedProperty.getUserData("key");
          var classname = self._currentlySelectedProperty.getUserData("classname");
          // if the property does exist in the new selected widget
          if (self._propertyList.containsProperty(key, classname)) {
            // reload the button configuration
            self._switchPropertyButtons();
          } else {
            // reset the current selected property
            self._currentlySelectedProperty = null;
            // enable all buttons
            self._setNullButton.setEnabled(false);
            self._setPropertyToDefaultButton.setEnabled(false);
            self._highlightCurrentPropertyButton.setEnabled(false);
            self._gotoSelectedPropertyButton.setEnabled(false);
          }
        }
      }, 0);
    },

    getSelection : function() {
      return this._qxObject;
    },

    /**
     * Returns the current selected object.
     * @return {qx.core.Object} The currently selected object.
     */
    getQxObject: function() {
      return this._qxObject;
    },


    setSelectedProperty: function(layout) {
      this._currentlySelectedProperty = layout;
      this._switchPropertyButtons();
    },


    /**
     * Returns the layout holding the current selected property.
     * @internal
     * @return {qx.ui.layout.HorizontalBoxLayout} The selected property.
     */
    getSelectedProperty: function() {
      return this._currentlySelectedProperty;
    },


    /**
     * Returns the status of the inheritance checkbox.
     * @return {boolean} True, if the inherited properties should be shown.
     */
    getInheritedStatus: function() {
      return this._showInherited;
    },


    /**
     * Returns the status of the group button.
     * @return {boolean} True, if the properties should be grouped.
     */
    getGroupStatus: function() {
      return this._groupButton.getValue();
    },


    /**
     * Invokes a selection of the current selected property as a object.
     */
    gotoSelectedWidget: function() {
      this._gotoSelectedPropertyButtonEventListener();
    },


    /**
     * Returns the Filter used for grouping the properties.
     * @return {inspector.propertyEditor.IFilter} The current used filter.
     */
    getFilter: function() {
      return this._filter;
    },



     /**
     * Creates the two views for the editor and adds the full view as default view.
     */
    _createMainElement : function()
    {
      // create the inner layouts to hold the property lists
      this._propertyList = new inspector.property.PropertyList(this);

      // add the list to the layout
      var scroller = new qx.ui.container.Scroll();
      this.add(scroller, {flex: 1});
      scroller.add(this._propertyList);
    },


    /**
     * Creates and adds the toolbar buttons.
     */
    _addToolbarButtons : function()
    {
      // create the menu
      this._createMenu();

      // add the menu button
      var menuButton = new qx.ui.toolbar.MenuButton("View", null, this._menu);
      this._toolbar.add(menuButton);

      // add a separator
      this._toolbar.addSeparator();

      // create and add the reload button
      this._reloadButton = new qx.ui.toolbar.Button(null,
        "icon/22/actions/view-refresh.png");
      this._reloadButton.setToolTipText(
        this.self(arguments).RELOAD_BUTTON_TOOLTIP_TEXT
      );
      this._reloadButton.addListener("execute", function() {
        this._propertyList.build();
      }, this);
      this._toolbar.add(this._reloadButton);

      // add a separator
      this._toolbar.addSeparator();

      // create the API button
      var apiButton = new qx.ui.toolbar.Button(null,
        "inspector/images/icons/api.png");
      apiButton.setToolTipText(
        this.self(arguments).SHOW_API_BUTTON_TOOLTIP_TEXT
      );
      apiButton.addListener("execute", this._onOpenApiWindow, this);
      this._toolbar.add(apiButton);

      // add a spacer to keep the property relevant buttons on the right
      this._toolbar.addSpacer();

      // set null button
      this._setNullButton = new qx.ui.toolbar.Button(null,
        "inspector/images/icons/setnull.png");
      this._setNullButton.setToolTipText(
        this.self(arguments).SET_NULL_BUTTON_TOOLTIP_TEXT
      );
      this._setNullButton.addListener("execute", this._setNullButtonEventListener, this);
      this._setNullButton.setEnabled(false);
      this._toolbar.add(this._setNullButton);

      // set to initial value button
      this._setPropertyToDefaultButton = new qx.ui.toolbar.Button(null,
        "inspector/images/icons/setinit.png");
      this._setPropertyToDefaultButton.setToolTipText(
        this.self(arguments).SET_DEFAULT_BUTTON_TOOLTIP_TEXT
      );
      this._setPropertyToDefaultButton.addListener("execute", this._setPropertyToDefaultButtonEventListener, this);
      this._setPropertyToDefaultButton.setEnabled(false);
      this._toolbar.add(this._setPropertyToDefaultButton);

      // highlight property button
      this._highlightCurrentPropertyButton = new qx.ui.toolbar.Button(null,
        "inspector/images/icons/highlight.png");
      this._highlightCurrentPropertyButton.setToolTipText(
        this.self(arguments).HIGHLIGHT_SELECTED_PROPERTY_BUTTON_TOOLTIP_TEXT
      );
      this._highlightCurrentPropertyButton.addListener("execute", this._highlightCurrentPropertyButtonEventListener, this);
      this._highlightCurrentPropertyButton.setEnabled(false);
      // TODO this._toolbar.add(this._highlightCurrentPropertyButton);

      // go to property button
      this._gotoSelectedPropertyButton = new qx.ui.toolbar.Button(null,
        "inspector/images/icons/goto.png");
      this._gotoSelectedPropertyButton.setToolTipText(
        this.self(arguments).GOTO_SELECTED_PROPERTY_BUTTON_TOOLTIP_TEXT
      );
      this._gotoSelectedPropertyButton.addListener("execute", this._gotoSelectedPropertyButtonEventListener, this);
      this._gotoSelectedPropertyButton.setEnabled(false);
     // TODO this._toolbar.add(this._gotoSelectedPropertyButton);
    },


    /**
     * Creates the view menu including the buttons and handlers
     * for the menu.
     */
    _createMenu : function()
    {
      // create the menu
      this._menu = new qx.ui.menu.Menu();

      // inherited checkbox
      this._inheritedButton = new qx.ui.menu.CheckBox("Show Inherited Porperties");
      this._inheritedButton.addListener("changeValue", this._switchInheritedStatus, this);
      this._inheritedButton.setValue(true);
      this._menu.add(this._inheritedButton);

      // separator
      this._menu.addSeparator();

      // non group radio button
      var nonGroupButton = new qx.ui.menu.RadioButton("Group by inheritance");
      nonGroupButton.addListener("changeValue", function(e) {
        if (this._qxObject != null) {
          // reload the view
          this._propertyList.build();
        }
        // enable the inheritance button
        this._inheritedButton.setEnabled(true);
      }, this);
      nonGroupButton.setValue(true);
      this._menu.add(nonGroupButton);

      // group radio button
      this._groupButton = new qx.ui.menu.RadioButton("Group by category");
      this._groupButton.addListener("changeValue", function(e) {
        if (this._qxObject != null) {
          // reload the view
          this._propertyList.build();
        }
        // disable the inheritance button
        this._inheritedButton.setEnabled(false);
      }, this);
      this._menu.add(this._groupButton);

      // group radio manager
      new qx.ui.form.RadioGroup(nonGroupButton, this._groupButton);
    },


    /*
    **********************
     EVENT HANDLER
    **********************
    */

    /*
    *********************************
       PROTECTED
    *********************************
    */
    /**
     * This method is responsible for enabling and disabling the property
     * relevant buttons like "set null".
     *
     * @lint ignoreDeprecated(alert)
     */
    _switchPropertyButtons: function() {
      // check if a property is set
      if (this._currentlySelectedProperty == null) {
        // disabled all buttons
        this._setNullButton.setEnabled(false);
        this._setPropertyToDefaultButton.setEnabled(false);
        this._highlightCurrentPropertyButton.setEnabled(false);
        this._gotoSelectedPropertyButton.setEnabled(false);
        // end the function
        return;
      }
      // get the classname of the currently selected property
      var classname = this._currentlySelectedProperty.getUserData("classname");
      // get the name of the currently selected property
      var key = this._currentlySelectedProperty.getUserData("key");
      // get the properties array of the selected class
      var iFrameWindow = qx.core.Init.getApplication().getIframeWindowObject();
      var properties = iFrameWindow.qx.Class.getByName(classname).$$properties;
      // get the property array of the currently selected property
      var property = properties[key];

      // handle the null button
      if (property.nullable) {
        this._setNullButton.setEnabled(true);
      } else {
        this._setNullButton.setEnabled(false);
      }

      // handle the init button
      if (property.init) {
        this._setPropertyToDefaultButton.setEnabled(true);
      } else {
        this._setPropertyToDefaultButton.setEnabled(false);
      }

      // handle the go to and highlight buttons
      if (key != undefined) {
        try {
          // create the getter name for the property
          var getterName = "get" + qx.lang.String.firstUp(key);

          // if the function is not available an the object
          if (this._qxObject[getterName] == undefined) {
            // disabled all buttons
            this._setNullButton.setEnabled(false);
            this._setPropertyToDefaultButton.setEnabled(false);
            this._highlightCurrentPropertyButton.setEnabled(false);
            this._gotoSelectedPropertyButton.setEnabled(false);
            // return and ignore the call
            return;
          }

          // get the current value
          var value = this._qxObject[getterName].call(this._qxObject);
          // if the check constraint is widget or parent and the selected widget is not the client document
          if ((property.check == "qx.ui.core.Widget" || property.check == "qx.ui.core.Parent")&&
              (this._qxObject.classname != "qx.ui.core.ClientDocument") && (value != null)){
            this._highlightCurrentPropertyButton.setEnabled(true);
            this._gotoSelectedPropertyButton.setEnabled(true);
          } else {
            this._highlightCurrentPropertyButton.setEnabled(false);
            this._gotoSelectedPropertyButton.setEnabled(false);
          }
        } catch (ex) {
          // signal the user that something went wrong
          alert("Error during reading the selected Property: " + ex);
          // mark the property that something went wrong while reading
          this._currentlySelectedProperty.setBackgroundColor(null);
          // reset the current selected property
          this._currentlySelectedProperty = null;
          this._highlightCurrentPropertyButton.setEnabled(false);
          this._gotoSelectedPropertyButton.setEnabled(false);
        }
      }
    },


    /**
     * This method opens the api viewer via the inspector and shows the api
     * to the current selected object or property if something is selected.
     */
    _onOpenApiWindow: function() {
      // if a object is selected
      if (this._qxObject != null) {
        // if a property is selected
        if (this._currentlySelectedProperty != null) {
          // get the classname and the property name
          var classname = this._currentlySelectedProperty.getUserData("classname");
          var propertyname = this._currentlySelectedProperty.getUserData("key");
          // open the api window to that property
          this._openApiWindow(classname, propertyname);
        } else {
          // open the api window to the class of the current selected property
          this._openApiWindow(this._qxObject.classname);
        }
      // if no object is selected
      } else {
        // open just the api viewer
        this._openApiWindow();
      }
    },

    _openApiWindow: function(classname, propertyname) {

      var version = qx.core.Init.getApplication()._loadedWindow.qx.core.Environment.get("qx.version");
      var urlString = "http://demo.qooxdoo.org/" + (version || "current") + "/apiviewer/";

      if (classname != null) {
        urlString += "#" + classname;
        // if a property name is given
        if (propertyname != null) {
          urlString += "~" + propertyname;
        }
      }

      var apiViewer = window.open(urlString);
      apiViewer.focus();
    },


    /*
    *********************************
       AUTORELOAD STUFF
    *********************************
    */

    /*
    *********************************
       BUTTON HANDLERS
    *********************************
    */
    /**
     * Handler function to handle the execution on the "set null" button.
     * The function tries to set the current selected property of the widget
     * to null. If that fails, an alert shows the exception message.
     *
     * @lint ignoreDeprecated(alert)
     */
    _setNullButtonEventListener: function () {
      // get the corresponding classname of the currently selected property
      var classname = this._currentlySelectedProperty.getUserData("classname");
      // get the name of the property
      var key = this._currentlySelectedProperty.getUserData("key");
      // get the setter name
      var setterName = "set" + qx.lang.String.firstUp(key);
      // try to invoke the setter
      try {
        this._qxObject[setterName].call(this._qxObject, null);
        // reload the property view of the current column
        var classname = this._currentlySelectedProperty.getUserData("classname");
        var key = this._currentlySelectedProperty.getUserData("key");
        this._propertyList.update(key, classname);
        this._switchPropertyButtons();
      } catch (e) {
        // alert the user if the sett could not be executed
        alert(e);
      }
    },


    /**
     * Handler function to handle the execution of the "init" button. The
     * function resets the selected property to its initial value given in
     * the property declaration. If that fails, the exception message will
     * be shown to the user in an alert.
     *
     * @lint ignoreDeprecated(alert)
     */
    _setPropertyToDefaultButtonEventListener: function () {
      // get the corresponding classname of the currently selected property
      var classname = this._currentlySelectedProperty.getUserData("classname");
      // get the name of the property
      var key = this._currentlySelectedProperty.getUserData("key");
      // get the property array of the selected property
      var iFrameWindow = qx.core.Init.getApplication().getIframeWindowObject();
      var properties = iFrameWindow.qx.Class.getByName(classname).$$properties;
      var property = properties[key];
      // get the setter name
      var setterName = "set" + qx.lang.String.firstUp(key);
      // try to invoke the setter
      try {
        this._qxObject[setterName].call(this._qxObject, property.init);
        // reload the property view of the current column
        var classname = this._currentlySelectedProperty.getUserData("classname");
        var key = this._currentlySelectedProperty.getUserData("key");
        this._propertyList.update(key, classname);
      } catch (e) {
        // alert the user if the sett could not be executed
        alert(e);
      }
    },


    /**
     * Handler function to handle the execution of the "highlight property"
     * button. The function reads the value of the property which is a
     * widget and dedicates the highlighting task to the inspector class.
     */
    _highlightCurrentPropertyButtonEventListener: function() {
      /* TODO reimplement old feature
      // get the name of the property
      var key = this._currentlySelectedProperty.getUserData("key");
      // build the name of the getter
      var getterName = "get" + qx.lang.String.firstUp(key);
      try {
        // tell the document tree to highlight the new widget
        // TODO: the following line appears to be old 0.7 code
        // this._inspector.highlightWidget(this._qxObject[getterName].call(this._qxObject));
      } catch (e) {
        alert("Error during highlighting the currently selected property widget: " + e);
      }
      */
    },


    /**
     * Handler function to handle the execution of the "go to property" button.
     * The function reads the value of the currently selected property which is
     * a widget and selects the new widget.
     */
    _gotoSelectedPropertyButtonEventListener: function() {
      /* TODO reimplement old feature
      // go only to the parent if the widget is not the client document (root)
      if (this._qxObject.classname != "qx.ui.core.ClientDocument") {
        // get the name of the property
        var key = this._currentlySelectedProperty.getUserData("key");
        // build the name of the getter function
        var getterName = "get" + qx.lang.String.firstUp(key);

        try {
          // tell the document tree to select the new widget
          // TODO: the following line appears to be old 0.7 code
          // this._inspector.setWidget(this._qxObject[getterName].call(this._qxObject), this);
          // reload the configuration for the property buttons
          this._switchPropertyButtons();
        } catch (e) {
          alert("Error during selecting the property widget: " + e);
        }
      }
      */
    },


    /**
     * Handler function to handle the execution of the inherited button.
     * @param e {Event} Event created by a checkbox.
     */
    _switchInheritedStatus: function(e) {
      this._showInherited = e.getCurrentTarget().getValue();
      if (this._propertyList) {
        this._propertyList.switchInheritedStatus(this._showInherited);
      }
    }
  },

  destruct : function()
  {
    this._qxObject = null;
    this._disposeObjects("_filter", "_menu", "_inheritedButton",
      "_groupButton", "_reloadButton", "_setNullButton",
      "_setPropertyToDefaultButton", "_highlightCurrentPropertyButton",
      "_gotoSelectedPropertyButton", "_propertyList");
  }
});
