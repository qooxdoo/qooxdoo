/* ************************************************************************

   Copyright:
     2009-2010 Derrell Lipman

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Derrell Lipman (derrell)

************************************************************************ */

/**
 * Mixin to add a bindTo method to a class, making it easy to bind a function
 * to an object instance for use in lieu of calls to static method
 * qx.lang.Function.bind().
 *
 * The easiest (but not necessarily most efficient) way to use this mixin is
 * to include it in qx.core.Object by adding this line some place in the
 * application code (typically in main()):
 *
 * <pre>
 *   qx.Class.include(qx.core.Object, qx.core.MBindTo);
 * </pre>
 *
 * If object footprint (memory use) is of significant concern, that may be a
 * bit excessive since every object which is a descendent of qx.core.Object
 * will have the methods defined in the mixin. Instead, if a certain class
 * will have many functions bound to it (of particular use for callback
 * functions), qx.Class.include() could be used to include this mixin in that
 * class instead of in qx.core.Object.
 *
 * Alternatively, that class may be subclassed, and the 'include' key of the
 * class configuration could be used to always include this mixin in the
 * subclass. e.g.
 *
 * <pre>
 *   qx.Class.define("custom.Table",
 *   {
 *     extend  : qx.ui.table.Table,
 *     include : [ qx.core.MBindTo ]
 *   });
 * </pre>
 */
qx.Mixin.define("qx.core.MBindTo",
{
  members :
  {
    /**
     * Bind a function to this object
     *
     * @param func {Function}
     *   The function to be bound
     *
     * @param varargs {var?}
     *   Optional arguments to be passed to the function.
     *
     * @return {Function}
     *   A wrapped version of the function that binds 'this' to the
     *   user-provided function.
     */
    bindTo : function(func, varargs)
    {
      return qx.lang.Function.create(
        func,
        {
          self  : this,
          args  : (arguments.length > 1
                   ? qx.lang.Array.fromArguments(arguments, 1) :
                   null)
        });
    }
  }
});
