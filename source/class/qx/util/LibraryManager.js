/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Author:
     * Daniel Wagner (danielwagner)

************************************************************************ */

/**
 * Provides read/write access to library-specific information such as
 * source/resource URIs.
 */
qx.Class.define("qx.util.LibraryManager", {
  extend: qx.core.Object,

  type: "singleton",

  statics: {
    /** @type {Map} The libraries used by this application */
    __libs: qx.$$libraries || {}
  },

  members: {
    /**
     * Checks whether the library with the given namespace is known to the
     * application.
     * @param namespace {String} The library's namespace
     * @return {Boolean} <code>true</code> if the given library is known
     */
    has(namespace) {
      return !!qx.util.LibraryManager.__libs[namespace];
    },

    /**
     * The namespaces of all libraries known to the application
     *
     * @returns {String[]} the namespaces
     */
    getNamespaces() {
      return Object.keys(qx.util.LibraryManager.__libs);
    },

    /**
     * Returns the value of an attribute of the given library
     * @param namespace {String} The library's namespace
     * @param key {String} Name of the attribute
     * @return {var|null} The attribute's value or <code>null</code> if it's not defined
     */
    get(namespace, key) {
      return qx.util.LibraryManager.__libs[namespace][key]
        ? qx.util.LibraryManager.__libs[namespace][key]
        : null;
    },

    /**
     * Sets an attribute on the given library.
     *
     * @param namespace {String} The library's namespace
     * @param key {String} Name of the attribute
     * @param value {var} Value of the attribute
     */
    set(namespace, key, value) {
      qx.util.LibraryManager.__libs[namespace][key] = value;
    }
  }
});
