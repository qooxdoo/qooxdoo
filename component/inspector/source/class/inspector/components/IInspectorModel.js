/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

/**
 * Interface for the inspector model.
 */
qx.Interface.define("inspector.components.IInspectorModel",
{
  events :
  {
    /**
     * Fired event when the inspected application changed.
     */
    "changeApplication" : "qx.event.type.Event",

    /**
     * Fired event when the inspected object changed.
     */
    "changeInspected": "qx.event.type.Data"
  },

  members :
  {
    /**
     * Returns the instance from the inspected application.
     *
     * @return {qx.application.AbstractGui|null} Returns the instance from the inspected
     *   application.
     */
    getApplication : function() {
      return true;
    },

    /**
     * Sets the DOM window object from the inspected application.
     *
     * @param win {Window|null} the new DOM window object from the inspected application.
     */
    setWindow : function(win) {
      return arguments.length == 1;
    },

    /**
     * Returns the DOM window object from the inspected application.
     *
     * @return {Window|null} the current DOM window object from the inspected application.
     */
    getWindow : function() {
      return true;
    },

    /**
     * Returns all roots from the inspected application. A standalone application has
     * only one root which is returned from {@link qx.application.AbstractGui~getRoot},
     * but a inline application can also have a arbitrary number of {@link qx.ui.root.Inline} island.
     *
     * @return {qx.ui.root.Abstract[]} All roots from the inspected application.
     */
    getRoots : function() {
      return true;
    },

    /**
     * Added the passed object to the excludes list. The excludes are respected by
     * the {@link #getObjects} method.
     *
     * @param object {qx.core.Object} Object to add to excludes list.
     */
    addToExcludes : function(object) {
      return arguments.length == 1;
    },

    /**
     * Returns the excludes list.
     *
     * @return {qx.core.Object[]} a list with all excludes.
     */
    getExcludes : function() {
      return true;
    },

    /**
     * Returns the object registry from the inspected application. This means that also
     * objects which are created from the inspector in the context from the inspected
     * application are included. For e.q. all objects which are created for the objects
     * inspection visualization.
     *
     * @return {qx.core.ObjectRegistry|null} Returns the object registry from the
     *   inspected application.
     */
    getObjectRegistry : function() {
      return true;
    },

    /**
     * Returns the registered objects from the inspected application. The
     * different to {@link #getObjectRegistry} is that this method only returns
     * the objects which are not included in the excludes list. This means that
     * all objects which are added with {@link #addToExcludes} are ignored.
     *
     * @return {qx.core.Object[]} Returns all registered objects from the inspected
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