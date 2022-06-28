/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2022 Derrell Lipman

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Derrell Lipman (derrell)

************************************************************************ */

qx.Class.define(
  "qx.core.PropertyDescriptorRegistry",
  {
    extend : Object,

    construct : function()
    {
      // Initialize the registry of property descriptors
      this.__registry = {};
    },

    statics :
    {
      /**
       * A global registry of property descriptors which can be queried by
       * class name. Each key is a fully qualified class name. The value is
       * a map keyed by property name whose value is that class' property's
       * property descriptor.
       */
      __globalRegistry : {},

      /**
       * Remove a class' property descriptors from the global registry. This
       * is done when a class is `undefine()`d.
       */
      unregister : function(className)
      {
        delete qx.core.PropertyDescriptorRegistry.__globalRegistry[className];
      },

      /**
       * Obtain a reference to the global registry
       *
       * @return {Object}
       *   The global registry map
       */
      getRegistry : function()
      {
        return qx.core.PropertyDescriptorRegistry.__globalRegistry;
      },

      /**
       * Obtain all properties' property descriptors for the specified class
       *
       * @param className {String}
       *   The name of the class for which all properties' property
       *   descriptors are requested
       *
       * @return {Object}
       *   A map where Each key is a fully qualified class name. The value is
       *   a map keyed by property name whose value is that class' property's
       *   property descriptor.
       *
       *   Note that unlike the `get` member method, the returned property
       *   descriptors do not have their functions bound to any particular
       *   object.
       */
      getClassProperties : function(className)
      {
        return qx.core.PropertyDescriptorRegistry.__globalRegistry[className];
      },

      /**
       * Obtain a single property's property descriptors from a specified
       * class
       *
       * @param className {String}
       *   The name of the class for which all properties' property
       *   descriptors are requested
       *
       * @param propertyName {String}
       *   The name of the property in the specified class, for which property
       *   descriptors are requested
       *
       * @return {Object}
       *   A property descriptor containing keys `definition`, `get`, `set`,
       *   etc., as described in #__registry
       *
       *   Note that unlike the `get` member method, the returned property
       *   descriptor does not have its functions bound to any particular
       *   object.
       */
      getClassProperty :function(className, propertyName)
      {
        const           globalRegistry =
              qx.core.PropertyDescriptorRegistry.__globalRegistry;

        if (! globalRegistry[className])
        {
          return undefined;
        }

        return globalRegistry[className][propertyName];
      }
    },

    members :
    {
      /**
       * The registry of property descriptors
       *
       * The keys are property names.
       *
       * The values are property descriptor maps. Each property descriptor map
       * contains:
       *  - definition :
       *      The property definition from the configuration passed to
       *      qx.Class.define(), possibly munged slightly to add some detail
       *      used internally
       *
       *  - get
       *  - set
       *  - reset
       *  - refresh
       *  - setThemed
       *  - resetThemed
       *  - init
       *  - is
       *  - toggle
       *  - isAsyncSetActive
       *  - getAsync
       *  - setAsync
       *      Each is the function for obtaining information from the
       *      property, or manipulating the property. When the property
       *      descriptor is registered via `register`, these functions
       *      are bound to the `context` provided to the constructor.
       */
      __registry : null,

      /**
       * Register a property descriptor
       *
       * @param className {String}
       *   The name of the class that the property belongs to
       *
       * @param propertyName {String}
       *   The name of the property to which the property descriptor applies
       *
       * @param propertyDescriptor {Object}
       *   @see #__registry for the layout of a property descriptor
       */
      register : function(className, propertyName, propertyDescriptor)
      {
        let             globalRegistry =
            qx.core.PropertyDescriptorRegistry.__globalRegistry;

        // Save it to the local registry.
        this.__registry[propertyName] = propertyDescriptor;

        // Also add it to the gloal registry
        if (! (className in globalRegistry))
        {
          globalRegistry[className] = {};
        }

        globalRegistry[className][propertyName] = propertyDescriptor;
      },

      /**
       * Obtain a property's property descriptor, and bind the functions
       * within that descriptor to a specified object.
       *
       * @param context {Object}
       *   The object to which the functions in the property descriptor are to
       *   be bound
       *
       * @param propertyName {String}
       *   The name of the property in the specified class, for which property
       *   descriptors are requested
       *
       * @return {Object}
       *   A property descriptor containing keys `definition`, `get`, `set`,
       *   etc., as described in #__registry. All functions within the
       *   property descriptor are bound to the specified `context` object.
       */
      get : function(context, propertyName)
      {
        let       propertyDescriptor = this.__registry[propertyName];
        let       boundPropertyDescriptor = {};

        if (! propertyDescriptor)
        {
          return null;
        }

        // Clone it so user can't muck with our copy
        propertyDescriptor = Object.assign(propertyDescriptor);

        for (let key in propertyDescriptor)
        {
          // If this is not a function...
          if (typeof propertyDescriptor[key] != "function")
          {
            // ... then just copy it as is
            boundPropertyDescriptor[key] = propertyDescriptor[key];
            continue;
          }

          // Bind this function
          boundPropertyDescriptor[key] =
            propertyDescriptor[key].bind(context);
        }

        // Freeze the object so users can't accidentally modify it
        Object.freeze(boundPropertyDescriptor);

        return boundPropertyDescriptor;
      }
    }
  });
