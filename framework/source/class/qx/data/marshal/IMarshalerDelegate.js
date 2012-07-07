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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Objects, which are used as delegates for a data binding marshaler may
 * implement any of the methods described in this interface. The delegate does
 * not need implement all of the methods of this interface. If a method is not
 * implemented the marshaler provides a default implementation.
 *
 * Note: This interface is meant to document the delegate but should not be
 * listed in the <code>implement</code> key of a class unless all methods are
 * really implemented.
 */
qx.Interface.define("qx.data.marshal.IMarshalerDelegate",
{
  members :
  {
    /**
     * Gives the possibility to change the names given in the data to convert
     * to something different.
     *
     * @param property {String} The name of the property from the data source.
     * @param properties {String} A sorted order of propertynames
     *   separated by ".
     * @return {String} The new which should be used for that property in
     *   the model.
     */
    getPropertyMapping : function(property, properties) {},


    /**
     * Determines the user defined class for the given properties string.
     * This class could contain additional methods but needs to have the
     * properties with the given names. Also every property needs to have a
     * change event.
     *
     * If this method is implemented, you have to add the superclass and mixins
     * yourself to the returned class. This means that the methods
     * {@link #getModelSuperClass} and {@link #getModelMixins} will not be
     * called for the corresponding class.
     *
     * @param properties {String} A sorted order of propertynames
     *   separated by ".
     * @return {Class|null} Returns the class containing the properties
     *   corresponding to the given hash of the properties. If <code>null</code>
     *   will be returned, the marshaler will create a class.
     */
    getModelClass : function(properties) {},


    /**
     * Returns the class which the created model class uses as superclass.
     *
     * @param properties {String} A sorted order of propertynames
     *   separated by ".
     * @return {Class|null} Returns the class which should be used as superclass
     *   corresponding to the given hash of the properties. If <code>null</code>
     *   will be returned, {@link qx.core.Object} will be used as superclass.
     */
    getModelSuperClass : function(properties) {},


    /**
     * Returns the mixins which should be included to the class, created by the
     * marshaler and identified by the given properties string.
     *
     * @param properties {String} A sorted order of propertynames
     *   separated by ".
     * @return {Array|Mixin|null} Returns an array of mixins or a single mixin which
     *   will be included into the given class identified by the properties
     *   given in the parameter. If <code>null</code> will be returned, no mixin
     *   will be included.
     */
    getModelMixins : function(properties) {},


    /**
     * Returns the validation rules which should be added to the created class
     * for the given property. This method will be called for every property.
     *
     * @param properties {String} A sorted order of propertynames
     *   separated by ".
     * @param propertyName {String} The name of the current property.
     * @return {Function|null} If you want to have a validation rule for the
     *   current property, you should return a validation function which will
     *   be included into the property definition as validator.
     *   {@link qx.core.Property} for more details.
     */
    getValidationRule : function(properties, propertyName) {}
  }
});