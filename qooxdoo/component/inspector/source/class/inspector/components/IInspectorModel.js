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
     * Christian Schmidt (chris_schmidt)

************************************************************************ */

/**
 * Interface for the inspector model.
 */
qx.Interface.define("inspector.components.IInspectorModel",
{

  events :
  {
    /**
     * Fired event when the object registry changed.
     */
    "changeObjects" : "qx.event.type.Event",

    /**
     * Fired event when the inspected object changed.
     */
    "changeInspected": "qx.event.type.Data"
  },

  members :
  {
    /**
     * Returns the complete registered objects, also the objects which are added
     * from the inspector, e.q. all objects which are created for the objects
     * inspection visualization.
     *
     * @return {qx.core.ObjectRegistry|null} Returns the object regestry from the
     *   inspected application.
     */
    getObjectRegistry : function() {
      return true;
    },

    /**
     * Sets the object registry.
     *
     * @param objectRegistry {qx.core.ObjectRegistry} the new object registry
     *   from the inspected application.
     */
    setObjectRegistry : function(objectRegistry) {
      return arguments.length == 1;
    },

    /**
     * Returns the inspector application.
     *
     * @return {inspector.Application} Returns the instance from the inspector
     *   application.
     */
    getApplication : function() {
      return true;
    },

    /**
     * Sets the inspector application.
     *
     * @param application {inspector.Application} instance from the inspector
     *   application to set.
     */
    setApplication : function(application) {
      return arguments.length == 1;
    },

    /**
     * Returns the registered objects from the inspected application. The
     * different to {@link #getObjectRegistry} is that this method only returns
     * the objects from the inspected application. All objects which are added
     * form the inspector are excluded.
     *
     * @return {Array} Returns all registered objects from the inspected
     *   application with the hash code as key.
     */
    getObjects : function() {
      return true;
    },

    /**
     * Returns the inspected object.
     *
     * @return {qx.core.Object|null} Returns the current inspected object.
     */
    getInspected : function() {
      return true;
    },

    /**
     * Sets the inspected object.
     *
     * @param object {qx.core.Object} instance from the inspected object.
     */
    setInspected : function(object) {
      return arguments.length == 1;
    }
  }
});