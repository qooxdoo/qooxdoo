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
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * EXPERIMENTAL!!!
 */
qx.Mixin.define("qx.data.MBinding", 
{
  members :
  {
    
    /**
     * The bind method delegates the call to the 
     * {@link qx.data.SingleValueBinding#bind} function. As source, the current
     * object (this) will be used.
     * 
     * @param sourcePropertyChain {String} The property chain which represents 
     *   the source property.
     * @param targetObject {qx.core.Object} The object which the source should 
     *   be bind to.
     * @param targetProperty {String} The property name of the target object.
     * @param options {Map} A map containing the options. See 
     *   {@link qx.data.SingleValueBinding#bindEventToProperty} for more 
     *   information.
     * 
     * @return {id} Returns the internal id for that binding. This can be used 
     *   for referencing the binding e.g. for removing. This is not an atomic 
     *   id so you can't you use it as a hash-map index.
     * 
     * @throws {qx.core.AssertionError} If the event is no data event or 
     *   there is no property definition for object and property (source and 
     *   target).
     */
    bind : function(sourcePropertyChain, targetObject, targetProperty, options) {
      return qx.data.SingleValueBinding.bind(this, sourcePropertyChain, targetObject, targetProperty, options);
    },
    
    
    /**
     * The method is equals the {@link #bind} function. It maps the call to 
     * {@link qx.data.SingleValueBinding#bind}. The difference is that 'this' is
     * the target object and not the source object.
     * 
     * @param sourceObject {qx.core.Object} The source of the binding.
     * @param sourcePropertyChain {String} The property chain which represents 
     *   the source property.
     * @param targetProperty {String} The property name of the target object.
     * @param options {Map} A map containing the options. See 
     *   {@link qx.data.SingleValueBinding#bindEventToProperty} for more 
     *   information.
     * 
     * @return {id} Returns the internal id for that binding. This can be used 
     *   for referencing the binding or e.g. for removing. This is not an atomic 
     *   id so you can't you use it as a hash-map index.
     * 
     * @throws {qx.core.AssertionError} If the event is no data event or 
     *   there is no property definition for object and property (source and 
     *   target).
     */
    bindToObject : function(sourceObject, sourcePropertyChain, targetProperty, options) {
      return qx.data.SingleValueBinding.bind(sourceObject, sourcePropertyChain, this, targetProperty, options);      
    },
    
    
    /**
     * This method binds a {@link qx.event.type.Data} event to the given target.
     * Therefore it just maps the method call to the static 
     * {@link qx.data.SingleValueBinding#bindEventToProperty}. 
     * 
     * @param sourceEvent {String} The event of the source object which chould 
     *   be the change event in common but has to be an 
     *   {@link qx.event.type.Data} event.
     * @param targetObject {qx.core.Object} The object which the source should 
     *   be bind to.
     * @param targetProperty {String} The property name of the target object.
     * @param options {Map} A map containing the options. See 
     *   {@link qx.data.SingleValueBinding#bindEventToProperty} for more 
     *   information.
     * 
     * @return {id} Returns the internal id for that binding. This can be used 
     *   for referencing the binding or e.g. for removing. This is not an atomic 
     *   id so you can't you use it as a hash-map index. It's the id which will
     *   be returned b< the {@link qx.core.Object#addListener} method.
     * 
     * @throws {qx.core.AssertionError} If the event is no data event or 
     *   there is no property definition for the target object and target 
     *   property.
     */
    bindToEvent: function(sourceEvent, targetObject, targetProperty, options){
      return qx.data.SingleValueBinding.bindEventToProperty(this, sourceEvent, targetObject, targetProperty, options);      
    },
    
    

    /**
     * Removes the binding with the given id from the current object. The 
     * id hast to be the id returned by any of the bind functions.
     * 
     * @param id {id} The id of the binding.
     * @throws {Error} If the binding could not be found.
     */
    removeBinding: function(id){
      qx.data.SingleValueBinding.removeBindingFromObject(this, id);
    },
    
    
    /**
     * Removes all bindings from the object.
     * 
     * @throws {qx.core.AssertionErrro} If the object is not in the internal 
     *   registry of the bindings.
     * @throws {Error} If one of the bindings listed internally can not be 
     *   removed.
     */    
    removeAllBindings: function() {
      qx.data.SingleValueBinding.removeAllBindingsForObject(this);
    },
    
    
    /**
     * Returns an array which lists all bindings for the object. 
     * 
     * @return {Array} An array of binding informations. Every binding 
     *   information is an array itself containing id, sourceObject, sourceEvent,
     *   targetObject and targetProperty in that order.
     */    
    getBindings: function() {
      return qx.data.SingleValueBinding.getAllBindingsForObject(this);
    }
  }
});
