/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2011-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)
     * Daniel Wagner (danielwagner)

************************************************************************ */

/**
 * Attribute/Property handling for DOM elements.
 * @group (Core)
 */
qx.Bootstrap.define("qx.module.Attribute", {

  members :
  {
    /**
     * Returns the HTML content of the first item in the collection
     * @attach {qxWeb}
     * @return {String|null} HTML content or null if the collection is empty
     */
    getHtml : function() {
      if (this[0] && this[0].nodeType === 1) {
        return qx.bom.element.Attribute.get(this[0], "html");
      }
      return null;
    },


    /**
     * Sets the HTML content of each item in the collection
     *
     * @attach {qxWeb}
     * @param html {String} HTML string
     * @return {qxWeb} The collection for chaining
     */
    setHtml : function(html) {
      html = qx.bom.Html.fixEmptyTags(html);
      this._forEachElement(function(item) {
        qx.bom.element.Attribute.set(item, "html", html);
      });
      return this;
    },


    /**
     * Sets an HTML attribute on each item in the collection
     *
     * @attach {qxWeb}
     * @param name {String} Attribute name
     * @param value {var} Attribute value
     * @return {qxWeb} The collection for chaining
     */
    setAttribute : function(name, value) {
      this._forEachElement(function(item) {
        qx.bom.element.Attribute.set(item, name, value);
      });
      return this;
    },


    /**
     * Returns the value of the given attribute for the first item in the
     * collection.
     *
     * @attach {qxWeb}
     * @param name {String} Attribute name
     * @return {var} Attribute value
     */
    getAttribute : function(name) {
      if (this[0] && this[0].nodeType === 1) {
        return qx.bom.element.Attribute.get(this[0], name);
      }
      return null;
    },


    /**
     * Removes the given attribute from all elements in the collection
     *
     * @attach {qxWeb}
     * @param name {String} Attribute name
     * @return {qxWeb} The collection for chaining
     */
    removeAttribute : function(name) {
      this._forEachElement(function(item) {
        qx.bom.element.Attribute.set(item, name, null);
      });
      return this;
    },


    /**
     * Sets multiple attributes for each item in the collection.
     *
     * @attach {qxWeb}
     * @param attributes {Map} A map of attribute name/value pairs
     * @return {qxWeb} The collection for chaining
     */
    setAttributes : function(attributes) {
      for (var name in attributes) {
        this.setAttribute(name, attributes[name]);
      }
      return this;
    },


    /**
     * Returns the values of multiple attributes for the first item in the collection
     *
     * @attach {qxWeb}
     * @param names {String[]} List of attribute names
     * @return {Map} Map of attribute name/value pairs
     */
    getAttributes : function(names) {
      var attributes = {};
      for (var i=0; i < names.length; i++) {
        attributes[names[i]] = this.getAttribute(names[i]);
      }
      return attributes;
    },


    /**
     * Removes multiple attributes from each item in the collection.
     *
     * @attach {qxWeb}
     * @param attributes {String[]} List of attribute names
     * @return {qxWeb} The collection for chaining
     */
    removeAttributes : function(attributes) {
      for (var i=0, l=attributes.length; i<l; i++) {
        this.removeAttribute(attributes[i]);
      }
      return this;
    },


    /**
     * Sets a property on each item in the collection
     *
     * @attach {qxWeb}
     * @param name {String} Property name
     * @param value {var} Property value
     * @return {qxWeb} The collection for chaining
     */
    setProperty : function(name, value) {
      for (var i=0; i < this.length; i++) {
        this[i][name] = value;
      }
      return this;
    },


    /**
     * Returns the value of the given property for the first item in the
     * collection
     *
     * @attach {qxWeb}
     * @param name {String} Property name
     * @return {var} Property value
     */
    getProperty : function(name) {
      if (this[0]) {
        return this[0][name];
      }
      return null;
    },


    /**
     * Sets multiple properties for each item in the collection.
     *
     * @attach {qxWeb}
     * @param properties {Map} A map of property name/value pairs
     * @return {qxWeb} The collection for chaining
     */
    setProperties : function(properties) {
      for (var name in properties) {
        this.setProperty(name, properties[name]);
      }
      return this;
    },


    /**
     * Removes multiple properties for each item in the collection.
     *
     * @attach {qxWeb}
     * @param properties {String[]} An array of property names
     * @return {qxWeb} The collection for chaining
     */
    removeProperties : function(properties) {
      for (var i=0; i<properties.length; i++) {
        this.removeProperty(properties[i]);
      }
      return this;
    },


    /**
     * Returns the values of multiple properties for the first item in the collection
     *
     * @attach {qxWeb}
     * @param names {String[]} List of property names
     * @return {Map} Map of property name/value pairs
     */
    getProperties : function(names) {
      var properties = {};
      for (var i=0; i < names.length; i++) {
        properties[names[i]] = this.getProperty(names[i]);
      }
      return properties;
    },


    /**
     * Deletes a property from each item in the collection
     *
     * @attach {qxWeb}
     * @param name {String} Property name
     * @return {qxWeb} The collection for chaining
     */
    removeProperty : function(name) {
      if (this[0]) {
        this[0][name] = undefined;
      }
      return this;
    },


    /**
     * Returns the currently configured value for the first item in the collection.
     * Works with simple input fields as well as with select boxes or option
     * elements. Returns an array for select boxes with multi selection. In all
     * other cases, a string is returned.
     *
     * @attach {qxWeb}
     * @return {String|String[]} String value or Array of string values (for multiselect)
     */
    getValue : function() {
      if (this[0] && this[0].nodeType === 1) {
        return qx.bom.Input.getValue(this[0]);
      }
      return null;
    },


    /**
     * Applies the given value to each element in the collection.
     * Normally the value is given as a string/number value and applied to the
     * field content (textfield, textarea) or used to detect whether the field
     * is checked (checkbox, radiobutton).
     * Supports array values for selectboxes (multiple selection) and checkboxes
     * or radiobuttons (for convenience).
     *
     * Please note: To modify the value attribute of a checkbox or radiobutton
     * use {@link #setAttribute} instead and manipulate the <code>checked</code> attribute.
     *
     * @attach {qxWeb}
     * @param value {String|Number|Array} The value to apply
     * @return {qxWeb} The collection for chaining
     */
    setValue : function(value)
    {
      this._forEachElement(function(item) {
        qx.bom.Input.setValue(item, value);
      });

      return this;
    }
  },


  defer : function(statics) {
    qxWeb.$attachAll(this);
  }
});
