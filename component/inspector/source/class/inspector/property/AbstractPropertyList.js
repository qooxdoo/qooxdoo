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
/**
 * The abstract class is the base class for property lists.
 *
 * All common methods used in the property lists are defined in
 * this class. It also acts as interface which holds a couple of methods
 * needed by the controller.
 */
qx.Class.define("inspector.property.AbstractPropertyList", {

  extend : qx.ui.container.Composite,
  type : "abstract",

  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */
  /**
   * The constructors stores the reference to the controller and initializes
   * the basic layout of every list.
   * @param controller {inspector.propertyEditor.IPropertyListController} The needed controller.
   */
  construct : function(controller) {
    // call the constructor of the superclass
    this.base(arguments);

    // configure the basic layout
    this.setLayout(new qx.ui.layout.VBox(8));

    // save the reference to the controller
    this._controller = controller;
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
    _controller: null,
    _filter: null,


    /*
    *********************************
       PUBLIC
    *********************************
    */
    /**
     * Interface declaration of a build function for all property lists.
     * This method should get the current widget from the controller und
     * build a new list containing the properties of this widget.
     */
    build: function() {
      // throw an exception if the method is called on the abstract class
      throw new Error("Abstract method call (build) in 'PropertyList'!");
    },


    /**
     * Interface declaration of a update function.
     * This method should update the value of the given property in the current
     * displayed view of the properties.
     * @param key {String} The name of the property.
     * @param classname {String} The classname of the properties class.
     */
    update: function(key, classname) {
      // throw an exception if the method is called on the abstract class
      throw new Error("Abstract method call (update) in 'PropertyList'!");
    },


    /**
     * Interface declaration of a method which should return all
     * objects used by that view which should not appear in the
     * widget finder objects tree.
     * @return {qx.core.Object[]} A array of the used qooxdoo objects.
     */
    getComponents: function() {
      // throw an exception if the method is called on the abstract class
      throw new Error("Abstract method call (getComponents) in 'PropertyList'!");
    },


    /**
     * Interface declaration of a method used to check for the availability of a
     * property.
     * @param key {String} The name of the searched property.
     * @param classname {String} The classname of the searched properties class.
     * @return {boolean} True, if the view contains that property.
     */
    containsProperty: function(key, classname) {
      // throw an exception if the method is called on the abstract class
      throw new Error("Abstract method call (containsProperty) in 'PropertyList'!");
    },


    /**
     * Interface declaration which should toggle the visibility of all
     * inherited properties.
     */
    switchInheritedStatus: function() {
      // throw an exception if the method is called on the abstract class
      throw new Error("Abstract method call (switchInheritedStatus) in 'PropertyList'!");
    },


    /**
     * Interface declaration which should recalculate the layout e.g. on changes of
     * the theme.
     */
    recalculateLayout: function() {
      // throw an exception if the method is called on the abstract class
      throw new Error("Abstract method call (recalculateLayout) in 'PropertyList'!");
    },


    /*
    *********************************
       PROTECTED
    *********************************
    */
    /**
     * This function walks threw all superclasses of the given object and stores
     * the properties in an object.
     * @param qxObject {qx.core.Object} The object to get the data from.
     * @return {Map} An object containing tree values
     *    <li>names   - An array of names of the categories (in this case the classnames)</li>
     *    <li>props   - An array of array of properties.</li>
     *    <li>classes - An array of array of classnames.</li>
     */
    _getDataInherited: function(qxObject) {
      // the first superclass is the class of the selected widget
      var superclass = qxObject;

      var iFrameWindow = qx.core.Init.getApplication().getIframeWindowObject();

      // create new properties array to store the property of a class
      var properties = [];
      // create new classnames array to store the classnames
      var classnames = [];
      // create new groupNames array to store the names of the groups
      var groupNames = [];

      // go threw the inheritance of the selected widget
      for (var i = 1; ; i++) {
        // store the properties and classnames in separate array
        properties[i] = iFrameWindow.qx.Class.getByName(superclass.classname).$$properties;
        // sorte the classname in the groupnames array
        groupNames[i] = superclass.classname;
        // create an array for the classes for the property
        classnames[i] = [];
        // go threw all properties in the class and save the classname
        for (var j in properties[i]) {
          classnames[i][j] = superclass.classname;
        }
        // go threw all classes to the qx.core.Object class
        if(iFrameWindow.qx.Class.getByName("qx.core.Object") == superclass) {
          break;
        }
        // set the new class
        superclass = iFrameWindow.qx.Class.getByName(superclass.classname).superclass;
      }
      // return the data as an object
      return {names: groupNames, props: properties, classes: classnames};
    },


    /**
     * Uses the {@link inspector.propertEditor.PropertyList#_getDataInherited} function
     * to get the data. Additionally filters the data using the filter
     * (see {@link inspector.propertEditor.IFilter}) and returns
     * an object similar to the object from the
     * {@link inspector.propertEditor.PropertyList#_getDataInherited} method.
     * @param qxObject {Object} The qooxdoo object to get the properties from.
     * @return {Map} An object containing tree values
     *    <li>names   - An array of names of the categories (in this case the group names)</li>
     *    <li>props   - An array of array of properties.</li>
     *    <li>classes - An array of array of classnames.</li>
     */
    _getDataGrouped: function(qxObject) {
      // get all properties
      var data = this._getDataInherited(qxObject);
      var allProperties = data.props;
      // get the filter
      var filter = this._controller.getFilter();
      // empty the filter
      filter.empty();
      // go threw all properties an insert them into the filter
      for (var index = 0; index < allProperties.length; index++) {
        var classname = data.names[index];
        for (var propertyName in allProperties[index]) {
          filter.sortIn(propertyName, allProperties[index][propertyName], classname);
        }
      }
      // return the data as an object
      return filter.getResult();
    },


    /**
     * Returns the grouped or inherited in subject to the
     * status of the grouped status in the controller.
     * @param qxObject {qx.core.Object} The object to get the properties from.
     * @return {Map} An object containing tree values
     *    <li>names   - An array of names of the categories</li>
     *    <li>props   - An array of array of properties.</li>
     *    <li>classes - An array of array of classnames.</li>
     */
    _getData: function(qxObject) {
      // check for the status of the groupButton
      if (this._controller.getGroupStatus()) {
        return this._getDataGrouped(qxObject);
      } else {
        return this._getDataInherited(qxObject);
      }
    }
  },

  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */
  destruct : function() {
    this._controller = this._filter = null;
  }
});

