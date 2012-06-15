/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)
     * Daniel Wagner (danielwagner)

************************************************************************ */

/**
 * Adds JavaScript features that may not be supported by all clients.
 */
qx.Bootstrap.define("qx.module.Polyfill", {

  statics: {

    /**
     * Wraps the given function so that it will be executed in the given context
     */
    functionBind : function() {
      if (typeof Function.prototype.bind !== "function") {
        Function.prototype.bind = function(context) {
          var args = Array.prototype.slice.call(arguments, 1);
          return qx.Bootstrap.bind.apply(null, [this, context].concat(args));
        };
      }
    },


    /**
     * Removes white space from the left and right sides of a string
     */
    stringTrim : function() {
      if (typeof String.prototype.trim !== "function") {
        String.prototype.trim = function(context) {
          return this.replace(/^\s+|\s+$/g,'');
        };
      }


      /**
       * Removes white space from the left side of a string
       */
      if (typeof String.prototype.trimLeft !== "function") {
        String.prototype.trimLeft = function(context) {
          return this.replace(/^\s+/g,'');
        };
      }

      /**
       * Removes white space from the right side of a string
       */
      if (typeof String.prototype.trimRight !== "function") {
        String.prototype.trimRight = function(context) {
          return this.replace(/\s+$/g,'');
        };
      }
    }
  },

  defer : function(statics)
  {
    statics.functionBind();
    statics.stringTrim();
  }
});