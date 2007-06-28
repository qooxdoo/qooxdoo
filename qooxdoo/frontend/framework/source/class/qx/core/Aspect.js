/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#module(core)
#require(qx.core.Bootstrap)
#ignore(auto-require)
#ignore(auto-use)

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
 * To enable profiling the class must be loaded <b>before</b> <code>qx.Class</code> is
 * loaded. This can be achieved by adding the parameter
 * <code>--add-require qx.Class:your.AspectClass</code> to the generator call building the
 * applications. Further more the variant <code>qx.aspect</code> must be set to
 * <code>on</code>.
 *
 * One example for a qooxdoo aspect if profiling ({@link qx.dev.Profile}).
 */
qx.Class.define("qx.core.Aspect",
{
  statics :
  {
    __registry : [],

    /**
     * This function is used by {@link qx.Class#define} to wrap all statics, members and
     * constructors.
     *
     * @param fullName {String} Full name of the function including the class name.
     * @param type {String} Type of the wrapped function. One of "member", "static" or "constructor".
     * @param fcn {Function} wrapped function.
     */
    wrap : function(fullName, type, fcn)
    {
      var pre = [];
      var post = [];

      for (var i=0; i<this.__registry.length; i++)
      {
        var aspect = this.__registry[i];

        if (fullName.match(aspect.re) && (type == aspect.type || aspect.type == "*"))
        {
          var pos = aspect.pos;

          if (pos == "pre") {
            pre.push(aspect.fcn);
          } else {
            post.push(aspect.fcn);
          }
        }
      }

      if (pre.length == 0 && post.length == 0) {
        return fcn;
      }

      var wrapper = function()
      {
        for (var i=0; i<pre.length; i++) {
          pre[i].call(this, fullName, fcn, arguments);
        }

        var ret = fcn.apply(this, arguments);

        for (var i=0; i<post.length; i++) {
          post[i].call(this, fullName, fcn, arguments, ret);
        }

        return ret;
      }

      if (type != "static")
      {
        wrapper.self = fcn.self;
        wrapper.base = fcn.base;
      }

      fcn.wrapper = wrapper;
      return wrapper;
    },


    /**
     * Register a function to be called just before or after each time
     * one of the selected functions is called.
     *
     * @param position {String} One of "pre" or "post". Whether the function
     *     should be called before or after the wrapped function.
     * @param type {String} Type of the wrapped function. One of "member",
     *     "static", "constructor" or "*".
     * @param nameRegExp {String|RegExp} Each function, with a full name matching
     *     this pattern (using <code>fullName.match(nameRegExp)</code>) will be
     *     wrapped.
     * @param fcn {Function} Function to be called just before or after any of the
     *     selected functions is called. If position is "pre" the functions
     *     supports the same signature as {@link qx.dev.Profile#profilePre}. If
     *     position is "post" it supports the same signature as
     *     {@link qx.dev.Profile#profilePost}.
     */
    register : function(position, type, nameRegExp, fcn)
    {
      if (position != "pre" && position != "post") {
        throw new Error("Unkown positions: '"+pos+"'");
      }

      this.__registry.push({
        pos: position,
        type: type,
        re: nameRegExp,
        fcn: fcn
      });
    }
  }
});
