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
 * EXPERIMENTAL!
 *
 * Objects, which are used as delegates for a data binding store may
 * implement any of the methods described in this interface. The delegate does
 * not need implement all of the methods of this interface. If a method is not
 * implemented the store provides a default implementation.
 *
 * Note: This interface is meant to document the delegate but should not be
 * listed in the <code>implement</code> key of a class unless all methods are
 * really implemented.
 */
qx.Interface.define("qx.data.store.IStoreDelegate",
{
  members :
  {
    /**
     * Determinates the user defined class for the given properties string.
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
     *   will be returned, the store will create a class.
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
     * store and identified by the given properties string.
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
     * This method manipulates the data from the request and returns the 
     * manipulated data.
     * 
     * @param data {Object} The data received by the request.
     * @return {Object} The manipulated data.
     */
    manipulateData : function(data) {},
    
    
    /**
     * This method can change the settings on the used request by the store.
     * 
     * @param request {var} The created request, depending on the implementation
     *   of the data store.
     */
    configureRequest : function(request) {}
  }
});