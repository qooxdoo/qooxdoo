/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)
     * Andreas Ecker (ecker)

************************************************************************ */

/**
 * Basis for Aspect Oriented features in qooxdoo.
 *
 * This class makes it possible to attach functions (aspects) before or
 * after each function call of any function defined in {@link qx.Class#define}.
 *
 * Classes, which define own aspects must add an explicit require to ths class
 * in the header comment using the following code:
 *
 * <pre>
 * &#35;require(qx.core.Aspect)
 * &#35;ignore(auto-require)
 * </pre>
 *
 * One example for a qooxdoo aspect is profiling ({@link qx.dev.Profile}).
 */
qx.Bootstrap.define("qx.core.Aspect",
{
  statics :
  {
    /** {Array} Registry for all known aspect wishes */
    __registry : [],


    /**
     * This function is used by {@link qx.Class#define} to wrap all statics, members and
     * constructors.
     *
     * @param fullName {String} Full name of the function including the class name.
     * @param fcn {Function} function to wrap.
     * @param type {String} Type of the wrapped function. One of "member", "static",
     *          "constructor", "destructor" or "property".
     *
     * @return {Function} wrapped function
     */
    wrap : function(fullName, fcn, type)
    {
      var before = [];
      var after = [];
      var reg = this.__registry;
      var entry;

      for (var i=0; i<reg.length; i++)
      {
        entry = reg[i];

        if ((entry.type == null || type == entry.type || entry.type == "*") && (entry.name == null || fullName.match(entry.name))) {
          entry.pos == -1 ? before.push(entry.fcn) : after.push(entry.fcn);
        }
      }

      if (before.length === 0 && after.length === 0) {
        return fcn;
      }

      var wrapper = function()
      {
        for (var i=0; i<before.length; i++) {
          before[i].call(this, fullName, fcn, type, arguments);
        }

        var ret = fcn.apply(this, arguments);

        for (var i=0; i<after.length; i++) {
          after[i].call(this, fullName, fcn, type, arguments, ret);
        }

        return ret;
      }

      if (type !== "static")
      {
        wrapper.self = fcn.self;
        wrapper.base = fcn.base;
      }

      fcn.wrapper = wrapper
      wrapper.original = fcn;

      return wrapper;
    },


    /**
     * Register a function to be called just before or after each time
     * one of the selected functions is called.
     *
     * @param fcn {Function} Function to be called just before or after any of the
     *     selected functions is called. If position is "before" the functions
     *     supports the same signature as {@link qx.dev.Profile#profileBefore}. If
     *     position is "after" it supports the same signature as
     *     {@link qx.dev.Profile#profileAfter}.
     * @param position {String?"after"} One of "before" or "after". Whether the function
     *     should be called before or after the wrapped function.
     * @param type {String?null} Type of the wrapped function. One of "member",
     *     "static", "constructor", "destructor", "property" or "*". <code>null</code>
     *     is handled identical to "*".
     * @param name {String|RegExp?null} Each function, with a full name matching
     *     this pattern (using <code>fullName.match(name)</code>) will be
     *     wrapped.
     */
    addAdvice : function(fcn, position, type, name)
    {
      this.__registry.push(
      {
        fcn: fcn,
        pos: position === "before" ? -1 : 1,
        type: type,
        name: name
      });
    }
  }
});
