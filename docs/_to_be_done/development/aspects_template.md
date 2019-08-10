An Aspect Template Class
========================

Here is a code template which you may copy to your application namespace and adapt it to implement aspects in your qooxdoo application. For a far more advanced sample look at qx.dev.Profile.

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
     * To enable the use of your aspect class, some extra settings need to be done
     * in your configuration file.
     *  * Add a require of your aspects class to qx.Class
     *  * Set the environment setting qx.aspects to true
     *  * Set the environment setting qx.enableAspect to true
     *
     */

    /**
     *
     * @require(qx.core.Aspect)
     * @ignore(auto-require)
     */

    /** Adapt the name of the class */
    qx.Bootstrap.define("your.namespace.YourAspectClass", {

      /** The class definition may only contain a 'statics' and a 'defer' member */
      statics :
      {

        __counter : 0,  // Static vars are possible

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
          console.log("Entering "+fullName);  // Adapt this to your needs
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
          console.log("Leaving "+fullName);  // Adapt this to your needs
        }

      },

      defer : function(statics)
      {
        /**
         * Registering your static functions with the aspect registry. For more
         * information see the API documentation for qx.core.Aspect.
         *
         * @param fcn {Function} Function from this class to be called.
         * @param position {String} Where to inject the aspect ("before" or "after").
         * @param type {String} Which types to wrap (“member”, “static”, “constructor”, 
         *                       “destructor”, “property” or ”*”).
         * @param name {RegExp} Name(pattern) of the functions to wrap.
         */
        qx.core.Aspect.addAdvice(statics.atEnter, "before", "*", "your.namespace.*");
        qx.core.Aspect.addAdvice(statics.atExit, "after",  "*", "your.namespace.*");
      }

    });

A job in your configuration could look something like this:

    "source" : 
          {
            "require" :
            {
              "qx.Class" : ["aspects.Aop"]
            },

            "environment" :
            {
              "qx.aspects" : true,
              "qx.enableAspect" : true
            }
          }

If you need some more information on configuring the generator, take a look at the tool/generator/generator\_config\_ref.
