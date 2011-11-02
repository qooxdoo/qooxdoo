/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

/**
 * The model for the objects view. The model is responsible for the current
 * inspected object ({@link #getInspected}) and the registered objects from the
 * inspected application ({@link #getObjects}).
 */
qx.Class.define("inspector.objects.Model",
{
  extend : qx.core.Object,

  /**
   * Construct the model.
   *
   * @param model {inspector.components.IInspectorModel} instance to the
   *   inspector model
   */
  construct : function(model)
  {
    this.base(arguments);

    this.__model = model;
    model.addListener("changeApplication", this.__onChangeApplication, this);
    model.addListener("changeInspected", this.__onChangeInspected, this);
  },

  events :
  {
    /**
     * Fires event when the registered objects changed.
     */
    "changeObjects" : "qx.event.type.Event",

    /**
     * Fires event when the inspected object changed.
     */
    "changeInspected": "qx.event.type.Data"
  },

  members :
  {
    /**
     * {inspector.components.IInspectorModel} the inspector model instance.
     */
    __model : null,

    /**
     * {Integer} indicates the current size from the object registry.
     */
    __registrySize : 0,

    /**
     * Returns the registered objects from the inspected application.
     *
     * @return {Array} Returns all registered objects from the inspected
     *   application with the hash code as key.
     */
    getObjects : function() {
      return this.__model.getObjects();
    },

    /**
     * Returns the object from the object registry with the passed hash code.
     *
     * @param hashCode {String} the hash code from the looking object.
     * @return {qx.core.Object|null} the object with the hash code, or <code>null</code>
     *   if no object exist with the hash code.
     */
    getObjectFromHashCode : function(hashCode) {
      var objectRegistry = this.__model.getObjectRegistry();
      return objectRegistry.fromHashCode(hashCode);
    },

    /**
     * Returns the inspected object.
     *
     * @return {qx.core.Object|null} Returns the current inspected object.
     */
    getInspected : function() {
      return this.__model.getInspected();
    },

    /**
     * Sets the inspected object.
     *
     * @param object {qx.core.Object} instance from the inspected object.
     */
    setInspected : function(object) {
      this.__model.setInspected(object);
    },

    /**
     * Event listener for the <code>changeApplication</code> event from the
     * inspector model.
     *
     * @param event {qx.event.type.Event} the event.
     */
    __onChangeApplication : function(event)
    {
      this.__registrySize = this.__getRegistrySize();

      this.fireEvent("changeObjects");
    },

    /**
     * Event listener for the <code>changeInspected</code> event from the
     * inspector model.
     *
     * @param event {qx.event.type.Data} the event.
     */
    __onChangeInspected : function(event)
    {
      var currentSize = this.__getRegistrySize();
      if (currentSize != this.__registrySize)
      {
        this.__registrySize = currentSize;
        this.fireEvent("changeObjects");
      }

      this.fireDataEvent("changeInspected", event.getData(), event.getOldData());
    },

    /**
     * Returns the current size from the object registry.
     *
     * @return {Integer} current size from the object registry.
     */
    __getRegistrySize : function()
    {
      var objectRegistry = this.__model.getObjectRegistry();
      if (objectRegistry != null) {
        return qx.lang.Object.getLength(objectRegistry.getRegistry());
      } else {
        return 0;
      }
    }
  },

  destruct : function() {
    this.__model.removeListener("changeApplication", this.__onChangeApplication, this);
    this.__model.removeListener("changeInspected", this.__onChangeInspected, this);
    this.__model = null;
  }
});