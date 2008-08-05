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
     * Sebastian Werner (wpbasti)

************************************************************************ */

/**
 * Interface for packages created by the new generator.
 */
qx.Class.define("qx.core.Package",
{
  statics :
  {
    /**
     * Loads a package asynchronously as defined by the config file at build time.
     *
     * @param name {String} Name of the part
     * @param callback {Function} Function to execute on completetion
     * @param self {Object?window} Context to execute the given function
     * @return {void}
     */
    loadPart : function(name, callback, self) {
      window.qxloader.loadPart(name, callback, self);
    },


    /**
     * Loads any script file asynchronously.
     *
     * @param url {String} Complete URI of the script
     * @param callback {Function} Function to execute on completetion
     * @param self {Object?window} Context to execute the given function
     * @return {void}
     */
    loadScript : function(url, callback, self) {
      window.qxloader.loadScript(url, callback, self);
    }
  }
});
