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
#asset(inspector/images/close.png)
#asset(inspector/images/open.png)
#asset(inspector/images/null.png)
#asset(inspector/images/shell/errorIcon.png)
#asset(qx/icon/Tango/16/actions/go-next.png)
************************************************************************ */
/**
 * The class is a implementation of the abstract {@link inspector.propertyEditor.PropertyList}
 * class.
 *
 * It implements all functions and makes the displayed properties accessible to the user.
 * This includes an easy to use interface for all types of properties like boolean, colors
 * or strings
 */
qx.Class.define("inspector.property.PropertyList", {

  extend : inspector.property.AbstractPropertyList,

  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */
  /**
   * Creates an instance of a full property list.
   * @param controller {inspector.propertyEditor.IPropertyListController} The used controller.
   */
  construct : function(controller) {
    // call the constructor of the superclass
    this.base(arguments, controller);
    // create a object to store the currently available property columns
    this._propertyRows = {};
    // create the array for storing the combobox popups
    this._comboBoxPopups = [];
    // create the color popup
    this._createColorPopup();

    var arrow = new qx.ui.basic.Image("icon/16/actions/go-next.png");
    arrow.setPaddingLeft(8);

    this._arrow = {arrow : arrow, container : null, row : null};
  },


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */
  members : {
    /*
    *********************************
       ATTRIBUTES
    *********************************
    */
    // to store the currently displayed properties
    _propertyRows: null,

    // reference to all combobox popups
    _comboBoxPopups: null,

    // color picker stuff
    _colorPopup: null,
    _colorFields: null,
    _currentColorProperty: null,

    _arrow : null,

    /*
    *********************************
       PUBLIC
    *********************************
    */
    /**
     * Invokes a reload of the view, if a widget is available.
     */
    build: function() {
      // if there is a widget selected
      if (this._controller.getQxObject() != null) {
        this._reloadPropertyListFull();
      }
    },


    /**
     * Updates the given property.
     * @param key {String} The name of the property.
     * @param classname {String} The classname of the properties class.
     */
    update: function(key, classname) {
      this._setPropertyValueFull(key, classname);
    },


    /**
     * This function hides or shows the inherited properties of the current
     * displayed object.
     */
    switchInheritedStatus: function() {
      var children = this.getChildren();
      for (var i = 0; i < children.length; i++)
      {
        /*
         * If the child is marked as inherited.
         * Set the current showInherited status to the widgets
         */
        if (children[i].getUserData("inherited"))
        {
          if (this._controller.getInheritedStatus()) {
            children[i].setVisibility("visible");
          } else {
            children[i].setVisibility("excluded");
          }
        }
      }
    },

    /**
     * Returns a boolean weather the given property is in the current view or not.
     * @param key {String} The name of the property.
     * @param classname {String} The classname of the properties class.
     * @return {boolean} True, if the given property is in the view.
     */
    containsProperty: function(key, classname) {
      return this._propertyRows[classname + "." + key] == null ? false : true;
    },

    /*
    *********************************
       PROTECTED
    *********************************
    */
    /**
     * This function reloads the full property list. It uses recycling to
     * speed up the loading process for new properties.
     * It also uses a cache for already seen classes to get more performance.
     * <br>
     * The function first of all reads all properties of the current selected
     * widget and stores them into a separate array. The next step is to go
     * backwards threw the array and check if the currently displayed properties
     * are the same as these of the selected widget. If that is the case the
     * function keeps going to the subclass of the widget. Otherwise the current
     * displayed properties which are not equivalent to the properties of the
     * widget will be deleted and the properties of the new classes will be added.
     * If the new properties are not in the cache, they will be created and
     * added. Otherwise the old ones out of the cache will be added.
     * At the end of the creating process the function invokes the reloading
     * of the values of all properties.
     */
    _reloadPropertyListFull: function() {
      // variable to signal if the rest of the list should be replaced
      var replace = false;
      // variable to signal if the not needed list items are deleted
      var oldremoved = true;

      // get the data
      var data = this._getData(this._controller.getQxObject());
      // store the data in variables
      var groupNames = data.names;
      var properties = data.props;
      var classnames = data.classes;

      // if the class hierarchy is enabled
      if (!this._controller.getGroupStatus()) {
        // remove those groups which are more than in the current widget
        this._removeUnnecessaryClasses(groupNames);
      }

      // go backwards threw the property arrays
      for(var i = properties.length - 1; i > 0 ; i--) {
        // if the class based view is enabled
        if (!this._controller.getGroupStatus()) {
            var currentListChildren = this.getChildren();
            // if there are children in the list
            if (!replace && currentListChildren.length > 0) {
              // get the classname of the displayed class in the list
              var x = currentListChildren.length - 1 - 2 * (properties.length - i - 1);
              // if the new element is a subclass of the former element
              if (x > 0) {
                var classnameInList = currentListChildren[x].getUserData("name");
                // if the classname is not the requested class
                if (classnameInList != groupNames[i]) {
                  // mark the rest of the classes to delete
                  var deleteTo = groupNames[i + 1];
                  // mark that the rest of the classes should be replaces
                  replace = true;
                }
              } else {
                // mark that the classes should be replaces
                replace = true;
                // mark that nothing is there to remove
                oldremoved = false;
              }
            // if no children in the list
            } else {
              // mark that the classes should be replaces
              replace = true;
              // mark that nothing is there to remove
              oldremoved = false;
            }
        // if the group based view is enabled
        } else {
            // replace everything
            replace =  true;
            // at the first time
            if (oldremoved) {
                this._clearList();
                // dont remove anything else
                oldremoved = false;
            }
        }

        // if list items should be replaced / added
        if (replace) {
          // remove the old elements
          if (oldremoved) {
            this._removeOld(deleteTo);
            // mark the classes as deleted
            oldremoved = false;
          }

          // create the atom for the group and add it
          var groupNameAtom = new qx.ui.basic.Atom("<b>" + groupNames[i] + "</b>", "inspector/images/close.png");
          groupNameAtom.setUserData("name", groupNames[i]);
          groupNameAtom.setRich(true);
          this.addAt(groupNameAtom, 0);

          // create a new layout for the group
          var groupLayout = new qx.ui.container.Composite(new qx.ui.layout.Grid(6, 6));
          groupLayout.getLayout().setColumnWidth(0, 25);
          groupLayout.setUserData("name", groupNames[i]);

          // mark all but the first property group as inherited if the inherited view is enabled
          if (!this._controller.getGroupStatus()) {
            if (i == 1) {
              groupLayout.setUserData("inherited", false);
              groupNameAtom.setUserData("inherited", false);
            } else {
              groupLayout.setUserData("inherited", true);
              groupNameAtom.setUserData("inherited", true);
            }
          }

          // register the handler to open and collapse the groups
          groupNameAtom.addListener("click", function(e) {
            if(this.isVisible()) {
                this.setVisibility("excluded");
                e.getTarget().setIcon("inspector/images/open.png");
            } else {
                this.setVisibility("visible");
                e.getTarget().setIcon("inspector/images/close.png");
            }
          }, groupLayout);

          // add the group of properties to the property list
          this.addAfter(groupLayout, groupNameAtom);

          // go threw all properties in the current group
          var row = 0;
          for (var key in properties[i]) {
            // ignore the property groups
            if (properties[i][key].group == null) {
              // create and add the label for the property name
              var labelName = new qx.ui.basic.Label(key + ":");
              // save the classname as additional user data as a unique key in combination with the label
              labelName.setUserData("classname", classnames[i][key]);
              labelName.setUserData("key", key);
              labelName.setUserData("row", row);
              groupLayout.add(labelName, {row: row, column: 1});

              // add the item to change the value
              var propertyValue = null;
              try {
                propertyValue = this._getPropertyWidgetFull(properties[i][key], key, classnames[i][key]);
              } catch(ex) {
                propertyValue = new qx.ui.basic.Label("");
              }
              propertyValue.setUserData("classname", classnames[i][key]);
              propertyValue.setUserData("key", key);
              propertyValue.setUserData("row", row);
              groupLayout.add(propertyValue, {row: row, column: 2});

              // add the image to signal the null value
              var nullImage = new qx.ui.basic.Image("inspector/images/null.png");
              nullImage.setUserData("classname", classnames[i][key]);
              nullImage.setUserData("key", key);
              nullImage.setUserData("row", row);
              groupLayout.add(nullImage, {row: row, column: 3});

              // add the property row to the reference array
              this._propertyRows[classnames[i][key] + "." + key] = {container: groupLayout, row: row};

              // layout
              groupLayout.getLayout().setRowAlign(row, "left", "middle");
              groupLayout.getLayout().setRowMinHeight(row, 20);

               // handle the clicks
              labelName.addListener("click", this.__onPropertyClick, this);
              propertyValue.addListener("click", this.__onPropertyClick, this);
              propertyValue.addListener("activate", this.__onPropertyClick, this);
              nullImage.addListener("click", this.__onPropertyClick, this);

              row++;
            }
          }
        }
      }
      // show or hide the inherited classes
      this.switchInheritedStatus();
      // load all values of the properties
      this._refillPropertyListFull();
    },


    /**
     * Removes all groups form the list that count is higher than the
     * count of the classes in the current object. This function should
     * only be invokes if the class based view is enabled.
     * @param classnames {String[]} The classnames array.
     */
    _removeUnnecessaryClasses: function(classnames) {
      // remove all classes from the list which are definitely not in the current widget
      for (;(classnames.length  - 1) * 2 < this.getChildren().length;) {
        // remove the first item (the name of the class) the list and dispose is
        var temp = this.getChildren()[0];
        this.removeAt(0);
        temp.dispose();

        // get the layouts which hold the properties
        var children = this.getChildren()[0].getChildren();
        // go threw all layouts of this class
        for (var currentIndex = 0; currentIndex < children.length; currentIndex++) {
          if (children[currentIndex].classname == "qx.ui.basic.Label") {
            // generate the classname.key string
            var classKey = children[currentIndex].getUserData("classname") +
              "." + children[currentIndex].getUserData("key");
            // delete the layout from the property row
            delete this._propertyRows[classKey];
          }
        }
        // remove the first item in the list
        this.removeAt(0);
      }
    },


    /**
     * This function removes all old classes from the list to the
     * given classname in the deleteTo parameter.
     * @param deleteTo {String} Classname.
     */
    _removeOld: function(deleteTo) {
      // if no deleteTo classname is given
      if (deleteTo == null) {
        // delete everything
        this._clearList();
        return;
      }

      // remove all until the marked class is reached
      while(true) {
        var child = this.getChildren()[0];
        // get the classname of the current selected item in the list
        var removedClassName = child.getUserData("name");
        // stop deleting if the class is marked not to delete
        if (removedClassName == deleteTo) {
          break;
        } else {
          // store the reference in the pool before deleting
          if (child.classname == "qx.ui.container.Composite") {
            var children = child.getChildren();
            // go threw all properties
            for (var currentIndex = 0; currentIndex < children.length; currentIndex++) {
              if (children[currentIndex].classname == "qx.ui.basic.Label") {
                // generate the classname.key string
                var classKey = children[currentIndex].getUserData("classname") +
                               "." + children[currentIndex].getUserData("key");
                // delete the layout from the property row
                delete this._propertyRows[classKey];
              }
            }
          }
          // remove the first item in the list
          this.removeAt(0);
        }
      }
    },


    /**
     * Removes all properties in the list and caches the references in the pool.
     */
    _clearList: function() {
      for (var key in this._porpertyColumns) {
        delete this._porpertyColumns[key];
      }
      // remove all in the list
      this.removeAll();
    },


    /**
     * This function creates, dependent on the type of property, a new widget
     * which represents the value of the widget in the property list e.g.
     * a checkbox for a boolean value.<br>
     * The handler for changing the values of the property will also be added
     * after the creation process.
     *
     * @lint ignoreDeprecated(alert)
     * @param propertySet {Map} The array containing the property values.
     * @param key {String} The name of the property.
     * @param classname {String} The classname of the properties class.
     */
    _getPropertyWidgetFull: function(propertySet, key, classname) {
      // read value
      var getterName = "get" + qx.lang.String.firstUp(key);
      try {
        /*
         * Fix for IE.
         *
         * The "this._controller.getQxObject()[getterName]();"
         * could throw an exception, but the IE doesn't catch the exception.
         *
         * TODO Find a solution why IE doesn't catch this exception.
         */
        if (getterName === "getActiveWindow") {
          throw new Error("Property activeWindow of an instance of qx.ui.root.Abstract is not (yet) ready!");
        } else {
          var value = this._controller.getQxObject()[getterName]();

          // Special handling for appearance
          if (getterName === "getAppearance") {
            return new qx.ui.basic.Label();
          }
        }
      } catch (ex) {
        return new qx.ui.basic.Label();
      }

      // call the function to handle the right type
      if (propertySet.check !== null) {

        // Checkbox
        if (propertySet.check == "Boolean") {
          // create the checkbox
          var checkBox = new qx.ui.form.CheckBox();

          var checkBoxHandler = function(e) {
            var value = this._controller.getQxObject()[getterName].call(this._controller.getQxObject());
            if (e.getData() != value) {
              // get the setter name
              var setterName = "set" + qx.lang.String.firstUp(key);
              // try to invoke the setter
              try {
                // set the new value
                this._controller.getQxObject()[setterName].call(this._controller.getQxObject(), e.getData());
                // reload the property view of the current column
                this._setPropertyValueFull(key, classname, true);
              } catch (ex) {
                // alert the user if the sett could not be executed
                alert(ex + " [" + setterName + "]");
                checkBox.setValue(!value);
              }
            }
          };

          // register the handler for changing the checkbox
          checkBox.addListener("changeValue", checkBoxHandler, this);
          return checkBox;

        // ComboBox
        } else if (propertySet.check instanceof Array) {
          var box = new qx.ui.form.ComboBox();
          var values = propertySet.check;
          // go threw all possible values
          for (var i = 0; i < values.length; i++) {
            // create an combobox item
            var item = new qx.ui.form.ListItem(values[i]);
            // add the item to the combobox
            box.add(item);
          }
          box.addListener("changeValue", function(e) {
            // set the new value to null
            var newValue = null;
            // if the selection is not null
            if (e.getTarget().getValue() != null) {
              // get the new selected value
              var newValue = e.getTarget().getValue();
            }
            // invoke the setter only if the value has changed
            if (newValue != value) {
                // get the setter name
                var setterName = "set" + qx.lang.String.firstUp(key);
                // try to invoke the setter
                try {
                  this._controller.getQxObject()[setterName].call(this._controller.getQxObject(), newValue);
                  // get the new value
                  value = this._controller.getQxObject()[getterName].call(this._controller.getQxObject());
                  // reload the property view of the current column
                  this._setPropertyValueFull(key, classname, true);
                  // save the new value
                  value = this._controller.getQxObject()[getterName].call(this._controller.getQxObject());
                } catch (ex) {
                  // alert the user if the set could not be executed
                  alert(ex);
                }
              }
          }, this);

          return box;

        // text field
        } else if (propertySet.check == "Integer" ||
                   propertySet.check == "String" ||
                   propertySet.check == "NonEmptyString" ||
                   propertySet.check == "Label" ||
                   propertySet.check == "Float" ||
                   propertySet.check == "Double" ||
                   propertySet.check == "Number") {
          // create new text field
          var textField = new qx.ui.form.TextField();

          var textFieldHandler = function(e) {
            // check which type of event triggered the function
            if (e.classname == "qx.event.type.KeySequence") {
              // do nothing if it is not the return key
              if (e.getKeyIdentifier() != "Enter") {
                return;
              }
              // otherwise go on
            } else if (e.classname == "qx.event.type.Focus") {
              // go on
            } else {
              // do nothing if it is an unknown event
              return;
            }

            // get the setter name
            var setterName = "set" + qx.lang.String.firstUp(key);
            // try to invoke the setter
            try {
              // parse the value to float if a number is expected
              var newValue = textField.getValue();
              // get the current set value
              value = this._controller.getQxObject()[getterName].call(this._controller.getQxObject());
              // stop further processing if the representation is null
              if (e.classname == "qx.event.type.Focus") {
                if (newValue == "" && value == null) {
                  return;
                }
              }
              // try to parse
              if (propertySet.check == "Integer" || propertySet.check == "Number") {
                newValue = parseFloat(newValue);
              }
              this._controller.getQxObject()[setterName].call(this._controller.getQxObject(), newValue);
              // reload the property view of the current column
              this._setPropertyValueFull(key, classname, true);
              // save the new value
              value = this._controller.getQxObject()[getterName].call(this._controller.getQxObject());
            } catch (ex) {
              // alert the user if the sett could not be executed
              alert(ex);
              // set the field to the former value
              textField.setValue(value + "");
            }
          };
          // add the listener to the blur and keypress event
          textField.addListener("blur", textFieldHandler, this);
          textField.addListener("keypress", textFieldHandler, this);

          return textField;

        // color
        } else if (propertySet.check == "Color") {
          // create the layout which holds the color field and the choose button
          var layout = new qx.ui.container.Composite(new qx.ui.layout.HBox(6));
          layout.getLayout().setAlignY("middle");
          // create the color field and set the initial color
          var colorField = new qx.ui.core.Widget();
          colorField.setDecorator(new qx.ui.decoration.Single(1, "solid", "#969696"));
          colorField.setBackgroundColor("white");
          colorField.setHeight(20);
          colorField.setWidth(20);
          colorField.setAllowGrowX(false);
          colorField.setAllowGrowY(false);
          layout.add(colorField);
          // save the color field in the color field array
          this._colorFields[classname + "." + key] = colorField;
          // create the button to choose the colors
          var button = new qx.ui.form.Button("Choose Color");
          layout.add(button);

          // handle the execution of the button (show the color popup
          button.addListener("mousedown", function(e)
          {
            this._colorPopup.setValue(colorField.getBackgroundColor());

            this._currentColorProperty = classname + "." + key;

            this._colorPopup.placeToMouse(e)
            this._colorPopup.show();
          }, this);
          button.addListener("execute", this.__onPropertyClick, this);
          button.addListener("activate", this.__onPropertyClick, this);

          return layout;

        // widget
        } else if (propertySet.ckeck == "qx.ui.core.Widget") {
          var widgetLabel = new qx.ui.basic.Label();
          return widgetLabel;

        // rest
        } else {
          var unknownLabel = new qx.ui.basic.Label();
          return unknownLabel;
        }

      } else {
        var unknownLabel = new qx.ui.basic.Label();
        return unknownLabel;
      }
    },


    /**
     * Reloads all values of the currently shown properties.
     */
    _refillPropertyListFull: function() {
      // go threw all stored property columns
      for (var index in this._propertyRows) {
        try {
          // get the key and the classname
          var key = index.substr(index.lastIndexOf(".") + 1);
          var classname = index.substring(0, index.lastIndexOf("."));
          // set the new value for all
          this._setPropertyValueFull(key, classname);
        } catch(ex) {}
      }
    },


    /**
     * This function sets the value of the given property.
     * It first reads the current value of the property. If the value
     * is null, the null label will be displayed.<br>
     * The next step is to check the kind of widget which represents the value
     * of the property. According to the type of widget, the right value will
     * be set.
     * @param key {String} The name of the property.
     * @param classname {String} The classname of the properties class.
     */
    _setPropertyValueFull: function(key, classname, keepArrow) {
      // get the layout containing the property
      var iFrameWindow = qx.core.Init.getApplication().getIframeWindowObject();
      var layout = this._propertyRows[classname + "." + key].container.getLayout();
      var row = this._propertyRows[classname + "." + key].row;

      if (!keepArrow && layout.getCellWidget(row, 0)) {
        this._arrow.container.remove(this._arrow.arrow);
        this._arrow.container = null;
        this._arrow.row = null;
      }

      // read value
      var getterName = "get" + qx.lang.String.firstUp(key);
      try {
        /*
         * Fix for IE.
         *
         * The "this._controller.getQxObject()[getterName]();"
         * could throw an exception, but the IE doesn't catch the exception.
         *
         * TODO Find a solution why IE doesn't catch this exception.
         */
        if (getterName === "getActiveWindow") {
          throw new Error("Property activeWindow of an instance of qx.ui.root.Abstract is not (yet) ready!");
        } else {
          var value = this._controller.getQxObject()[getterName]();

          // convert appearance id
          if (getterName === "getAppearance") {
            var obj = this._controller.getQxObject();
            var id = [];

            do {
              id.push(obj.$$subcontrol||obj.getAppearance());
            } while (obj = obj.$$subparent);

            // Combine parent control IDs, add top level appearance, filter result
            // to not include positioning information anymore (e.g. #3)
            value = id.reverse().join("/").replace(/#[0-9]+/g, "");
          }
        }
      } catch (ex) {
        layout.getCellWidget(row, 3).setVisibility("visible");
        layout.getCellWidget(row, 3).setSource("inspector/images/shell/errorIcon.png");

        var tooltip = layout.getCellWidget(row, 3).getToolTip();
        if (!tooltip) {
          tooltip = new qx.ui.tooltip.ToolTip(ex + "", "inspector/images/shell/errorIcon.png");
        } else {
          tooltip.setLabel(ex + "");
          tooltip.setIcon("inspector/images/shell/errorIcon.png");
        }
        layout.getCellWidget(row, 3).setToolTip(tooltip);

        return;
      }

      // show or hide the null label
      if (value == null) {
        layout.getCellWidget(row, 3).setVisibility("visible");
        layout.getCellWidget(row, 3).setSource("inspector/images/null.png");
        layout.getCellWidget(row, 3).resetToolTip();
      } else {
        layout.getCellWidget(row, 3).setVisibility("hidden");
      }

      try {
        // handle the inheritance of the properties
        var parent = this._controller.getQxObject();
        while (value == "inherit") {
          parent = parent.getLayoutParent();
          value = parent[getterName].call(parent);
        }
      } catch (ex) {
        layout.getCellWidget(row, 3).setVisibility("visible");
        layout.getCellWidget(row, 3).setSource("inspector/images/shell/errorIcon.png");

        var tooltip = layout.getCellWidget(row, 3).getToolTip();
        if (!tooltip) {
          tooltip = new qx.ui.tooltip.ToolTip(ex + "", "inspector/images/shell/errorIcon.png");
        } else {
          tooltip.setLabel(ex + "");
          tooltip.setIcon("inspector/images/shell/errorIcon.png");
        }
        layout.getCellWidget(row, 3).setToolTip(tooltip);
        return;
      }

      // check box
      if (layout.getCellWidget(row, 2).classname == "qx.ui.form.CheckBox") {
        if (value == null) {
          layout.getCellWidget(row, 2).setValue(false);
        } else {
          layout.getCellWidget(row, 2).setValue(value);
        }

      // labels
      } else if (layout.getCellWidget(row, 2).classname == "qx.ui.basic.Label") {
        if (value != null) {
          var properties = iFrameWindow.qx.Class.getByName(classname).$$properties;
          var property = properties[key];
          // if it is an array
          if (value instanceof Array) {
            layout.getCellWidget(row, 2).setValue(value.length + " objects");

          // if it is a widget and not the client document
          } else if ((property.check == "qx.ui.core.Widget")&&
              (this._controller.getQxObject() instanceof qx.application.AbstractGui)) {

            // create the link to the widget
            layout.getCellWidget(row, 2).setValue("<u>" + value.classname + " [" + value.toHashCode() + "]</u>");
            layout.getCellWidget(row, 2).setStyleProperty("cursor", "pointer");

            // add only a event listener the first time
            if (layout.getCellWidget(row, 2).hasListeners("click") === undefined) {

              // register the click handler
              layout.getCellWidget(row, 2).addListener("click", function(e) {

                if (this._controller.getSelectedProperty() != null) {
                  // disable the selection of current selected property
                  this._controller.getSelectedProperty().setBackgroundColor(null);
                }
                // save the new property
                this._controller.setSelectedProperty(layout.getCellWidget(row, 1));
                // tell the controller to go to the new widget
                this._controller.gotoSelectedWidget();
              }, this);
            }

          // fonts
          } else if(property.check == "Font") {
            // set the font of the label
            layout.getCellWidget(row, 2).setFont(value);
            layout.getCellWidget(row, 2).setValue(value + "");

          } else {
            layout.getCellWidget(row, 2).setValue(value + "");
          }
        // reset the label if the value is set null
        } else {
          layout.getCellWidget(row, 2).setValue("");
        }

      // text fields
      } else if (layout.getCellWidget(row, 2).classname == "qx.ui.form.TextField") {
        // set the current value
        if (value != null) {
          layout.getCellWidget(row, 2).setValue(value + "");
        } else {
          layout.getCellWidget(row, 2).setValue("");
        }

      // ComboBox
      } else if (layout.getCellWidget(row, 2).classname == "qx.ui.form.ComboBox") {

        // get the current ComboBox
        var box = layout.getCellWidget(row, 2);

        // it the value is null
        if (value == null) {
          // delete the selection of the combobox
          box.resetSelection();
        } else {
          // search for the selected item
          for (var i = 0; i < box.getChildren().length; i++) {
            // if the item is found
            if (value == box.getChildren()[i].getLabel()) {
              // set the item as selected
              if (value) {
                box.setValue(value);
              }
            }
          }
        }

      // color
      } else if (layout.getCellWidget(row, 2).classname == "qx.ui.container.Composite") {
        try {
          var color = iFrameWindow.qx.theme.manager.Color.getInstance().resolve(value);
          layout.getCellWidget(row, 2).getChildren()[0].setBackgroundColor(color);
        } catch (ex) {
          layout.getCellWidget(row, 2).getChildren()[0].setBackgroundColor("#FFFFFF");
        }
      }
    },


    /*
    *********************************
       CONSTRUCTOR HELPERS
    *********************************
    */
    /**
     * Creates the color popup which is needed to set colors.
     *
     * @lint ignoreDeprecated(alert)
     */
    _createColorPopup: function() {
      // create a instance of color popup
      this._colorPopup = new qx.ui.control.ColorPopup();

      var inspactor = qx.core.Init.getApplication();
      inspactor.getRoot().add(this._colorPopup);

      // create the object so save the color fields in the property editor
      this._colorFields = {};

      // handler to set the selected colors
      this._colorPopup.addListener("changeValue", function(e) {
        // do not invoke the setter if the color has been changed without a property
        if (this._currentColorProperty != null) {
          var colorKey = this._currentColorProperty.substr(this._currentColorProperty.lastIndexOf(".") + 1);
          var colorClassname = this._currentColorProperty.substring(0, this._currentColorProperty.lastIndexOf("."));
          // get the setter name
          var setterName = "set" + qx.lang.String.firstUp(colorKey);
          // try to invoke the setter
          try {
            this._controller.getQxObject()[setterName].call(this._controller.getQxObject(), e.getData());
            // set the selected color of the color field
            this._colorFields[this._currentColorProperty].setBackgroundColor(e.getData());
            // reload the property view of the current column
            this._setPropertyValueFull(colorKey, colorClassname, true);
          } catch (ex) {
            // alert the user if the sett could not be executed
            alert(ex);
          }
          // reset the current color property to "not selected"
          this._currentColorProperty = null;
        }
      }, this);
    },

    __onPropertyClick : function(e) {
      var target = e.getTarget();

      while(target.getUserData("key") == null) {
        target = target.getLayoutParent();
      }

      // get the currently clicked property name
      var classKey = target.getUserData("classname") + "." + target.getUserData("key");
      // reset the background color of the former selected property
      if (this._arrow.container != null) {
        this._arrow.container.remove(this._arrow.arrow);
        this._arrow.container = null;
        this._arrow.row = null;
      }

      // if the property is still available
      if (this._propertyRows[classKey] != undefined) {
        this._arrow.container = this._propertyRows[classKey].container
        this._arrow.row = target.getUserData("row");
        this._arrow.container.add(this._arrow.arrow, {row: this._arrow.row, column: 0});

        this._controller.setSelectedProperty(target);
      } else {
        // reset the selected property if it is no longer available
        this._controller.setSelectedProperty(null);
      }
    }
  },

  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */
  destruct : function() {
    this._propertyRows = this._comboBoxPopups = this._colorPopup =
      this._colorFields = this._oldPropertyListPool = null;
    this._disposeObjects("_arrow");
  }
});
