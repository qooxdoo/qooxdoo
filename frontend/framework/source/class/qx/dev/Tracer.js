/**
 * AspectTemplate.js -- template class to use qooxdoo aspects
 *
 * This is a minimal class template to show how to deploy aspects in qooxdoo
 * applications. For more information on the aspect infrastructure see the API
 * documentation for qx.core.Aspect.
 *
 * You should copy this template to your application namespace and adapt it to
 * your needs. See the comments in the code for further hints.
 *
 * To enable the use of your aspect class, some extra arguments have to be
 * passed to qooxdoo's generator, e.g. through a Makefile variable like so:
 *
 * APPLICATION_ADDITIONAL_SOURCE_OPTIONS = --add-require \
 *   qx.Class:your.namespace.YourAspectClass --use-variant=qx.aspects:on \
 *   --use-setting=qx.enableAspect:true
 *
 */


/** Adapt the name of the class */
qx.Bootstrap.define("qx.dev.Tracer", {

  /** The class definition may only contain a 'statics' and a 'defer' member */
  statics :
  {

    __counter : 0,  // Static vars are possible
    __max : 0,
    last : null,
    stack : [],

    /**
     * This function will be called before each function call.
     *
     * @param fullname {String} Full name of the function including the class name.
     * @param fcn {Function} Wrapped function.
     * @param type {String} The type of the wrapped function (static, member, ...)
     * @param args {Arguments} The arguments passed to the wrapped function.
     */
    atEnter: function(fullName, fcn, type, args)
    {
      var cls = qx.dev.Tracer;

      cls.__counter += 1;
      cls.stack.push(fullName);

      if (cls.__counter > cls.__max)
      {
        //console.log("Entering ", fullName, type, " Depth: ", cls.__counter);
        cls.last = "Depth: " + cls.__counter + "\n\n" + cls.stack.join("\n ");
        cls.__max = cls.__counter;
      }
    },


    /**
     * This function will be called after each function call.
     *
     * @param fullname {String} Full name of the function including the class name.
     * @param fcn {Function} Wrapped function.
     * @param type {String} The type of the wrapped function (static, member, ...)
     * @param args {Arguments} The arguments passed to the wrapped function.
     * @param returnValue {var} return value of the wrapped function.
     */
    atExit: function(fullName, fcn, type, args, returnValue)
    {
      var cls = qx.dev.Tracer;
      cls.__counter -= 1;
      cls.stack.pop();
    }

  },


  defer : function(statics)
  {
    /**
     * Registering your static functions with the aspect registry. For more
     * information see the API documentation for qx.core.Aspect.
     *
     * @param position {String} Where to inject the aspect ("before" or "after").
     * @param type {String} Which types to wrap (“member”, “static”, “constructor”,
     *                       “destructor”, “property” or ”*”).
     * @param name {RegExp} Name(pattern) of the functions to wrap.
     * @param fcn {Function} Function from this class to be called.
     */
    qx.core.Aspect.addAdvice(statics.atEnter, "before", "*", "qx.*");
    qx.core.Aspect.addAdvice(statics.atExit, "after", "*", "qx.*");
  }
});