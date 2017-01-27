/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * This mixin is forwarding the static methods of
 * {@link qx.data.SingleValueBinding} to the instance including the mixin.
 * The source object will be <code>this</code>.
 */
qx.Mixin.define("qx.data.MBinding",
{
  construct : function() {
    // store the hash code for disposing object won't have a hash code after dispose.
    this.__objectHash = this.toHashCode();
  },


  members :
  {
    __objectHash : null,

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
     *   {@link qx.data.SingleValueBinding#bind} for more
     *   information.
     *
     * @return {var} Returns the internal id for that binding. This can be used
     *   for referencing the binding e.g. for removing. This is not an atomic
     *   id so you can't you use it as a hash-map index.
     *
     * @throws {qx.core.AssertionError} If the event is no data event or
     *   there is no property definition for object and property (source and
     *   target).
     */
    bind : function(sourcePropertyChain, targetObject, targetProperty, options)
    {
      return qx.data.SingleValueBinding.bind(
        this, sourcePropertyChain, targetObject, targetProperty, options
      );
    },


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
     *   {@link qx.data.SingleValueBinding#bind} for more
     *   information.
     *
     * @return {qx.Promise} A promise which is resolved when the initial value
     * 	 has been set on the target.  Note that this does NOT resolve when subsequent
     *   values are returned.  The promise value is the internal id for that binding. 
     *   The id can be used for referencing the binding e.g. for removing. This is not 
     *   an atomic id so you can't you use it as a hash-map index.
     *
     * @throws {qx.core.AssertionError} If the event is no data event or
     *   there is no property definition for object and property (source and
     *   target).
     */
    bindAsync : function(sourcePropertyChain, targetObject, targetProperty, options)
    {
      var id = qx.data.SingleValueBinding.bind(
        this, sourcePropertyChain, targetObject, targetProperty, options
      );
      if (id.initialPromise) {
      	return id.initialPromise.then(function() {
      		id.initialPromise = null;
      		return id;
      	});
      } else {
      	return qx.Promise.resolve(id);
      }
    },


    /**
     * Removes the binding with the given id from the current object. The
     * id has to be the id returned by any of the bind functions.
     *
     * @param id {var} The id of the binding.
     * @throws {Error} If the binding could not be found.
     */
    removeBinding: function(id){
      qx.data.SingleValueBinding.removeBindingFromObject(this, id);
    },


    /**
     * Removes all bindings between the object and the related one.
     *
     * @param relatedObject {qx.core.Object} The object of which related
     *   bindings should be removed.
     * @throws {Error} If one of the bindings listed internally can not be
     *   removed.
     */
    removeRelatedBindings : function(relatedObject) {
      qx.data.SingleValueBinding.removeRelatedBindings(this, relatedObject);
    },


    /**
     * Removes all bindings from the object.
     *
     * @throws {qx.core.AssertionError} If the object is not in the internal
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
  },


  destruct : function() {
    // restore the object hash for disposing the bindings
    this.$$hash = this.__objectHash;
    this.removeAllBindings();
    delete this.$$hash;
  }
});
