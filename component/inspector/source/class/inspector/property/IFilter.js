/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
/**
 * This interface describes a filter for properties.
 *
 * The right way to use the filter is to create a instance of it and
 * sort all properties in ({@link #sortIn}). After all properties are sorted in
 * which needed to be filtered / sorted, the {@link #getResult} method returns
 * a object containing the sorted / filtered properties.
 *
 * <pre class='javascript'>
 * var filter = new your.Filter();
 * for (var i in allProperties) {
 *   filter.sortIn(name, propertyArray, classname);
 * }
 * var result = filter.getResult();
 * </pre>
 */
qx.Interface.define("inspector.property.IFilter", {
  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */
  members : {
    /**
     * This method should sort in the given property in the
     * implementing filter according to its schema. This can be
     * add a sorting and / or a filtering of the properties.
     * After all properties are sorted in, the result of the
     * filtering / sorting can be accessed with the
     * {@link #getResult} function.
     * @param propertyName {String} The name of the property.
     * @param property {Map} The property array itself.
     * @param classname {String} The name of the properties class.
     */
    sortIn: function(propertyName, property, classname) {
      return true;
    },


    /**
     * Returns the result as an object containing three array.<br>
     * <li>names: An array containing the names of the categories.</li>
     * <li>props: An array containing the properties of the corresponding category.</li>
     * <li>classes: An array containing arrays of classnames corresponding to the props array.</li>
     * The array begins with the index 1. The three array cooperate with their indices,
     * e.g. the category[1] contains the category name of the properties found at
     * position 1 in the properties array.
     *
     * @return {Object} An object containing three array:
     *     <li>categories - An array containing the categories</li>
     *     <li>props      - An array containing arrays of properties</li>
     *     <li>classes    - An array containing arrays of classnames</li>
     */
    getResult: function() {
      return true;
    },


    /**
     * Empties the filter which means that the filter can be reused.
     */
    empty: function() {
      return true;
    }
  }
});