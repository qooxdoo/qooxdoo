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

qx.Bootstrap.define(
  "qx.Class",
  {
    type : "static",

    statics :
    {
      /**
       * Define a new class using the qooxdoo class system. This sets up the
       * namespace for the class and generates the class from the definition map.
       *
       * Example:
       * <pre class='javascript'>
       * qx.Class.define("name",
       * {
       *   extend : Object, // superclass
       *   implement : [Interfaces],
       *   include : [Mixins],
       *
       *   statics:
       *   {
       *     CONSTANT : 3.141,
       *
       *     publicMethod: function() {},
       *     _protectedMethod: function() {},
       *     __privateMethod: function() {}
       *   },
       *
       *   properties:
       *   {
       *     "tabIndex": { check: "Number", init : -1 }
       *   },
       *
       *   members:
       *   {
       *     publicField: "foo",
       *     publicMethod: function() {},
       *
       *     _protectedField: "bar",
       *     _protectedMethod: function() {},
       *
       *     __privateField: "baz",
       *     __privateMethod: function() {}
       *   }
       * });
       * </pre>
       *
       * @param name {String?null}
       *   Name of the class. If <code>null</code>, the class will not be
       *   added to any namespace which could be handy for testing.
       *
       * @param config {Map ? null}
       *   Class definition structure. The configuration map has the following
       *   keys:
       *     <table>
       *       <tr>
       *         <th>Name</th>
       *         <th>Type</th>
       *         <th>Description</th>
       *       </tr>
       *       <tr>
       *         <th>type</th>
       *         <td>String</td>
       *         <td>
       *           Type of the class. Valid types are "abstract",
       *           "static" and "singleton". If unset it defaults to a
       *           regular non-static class if an `extend` key is
       *           provided; otherwise, to a static class.
       *         </td>
       *       </tr>
       *       <tr>
       *         <th>extend</th>
       *         <td>Class</td>
       *         <td>The super class the current class inherits from.</td>
       *       </tr>
       *       <tr>
       *         <th>implement</th>
       *         <td>Interface | Interface[]</td>
       *         <td>Single interface or array of interfaces the class implements.</td>
       *       </tr>
       *       <tr>
       *         <th>include</th>
       *         <td>Mixin | Mixin[]</td>
       *         <td>
       *           Single mixin or array of mixins, which will be merged into
       *           the class.
       *         </td>
       *       </tr>
       *       <tr>
       *         <th>construct</th>
       *         <td>Function</td>
       *         <td>The constructor of the class.</td>
       *       </tr>
       *       <tr>
       *         <th>statics</th>
       *         <td>Map</td>
       *         <td>Map of static members of the class.</td>
       *       </tr>
       *       <tr>
       *         <th>properties</th>
       *         <td>Map</td>
       *         <td>
       *           Map of property definitions. For a description of the
       *           format of a property definition see {@link
       *           qx.core.Property}.
       *         </td>
       *       </tr>
       *       <tr>
       *         <th>members</th>
       *         <td>Map</td>
       *         <td>Map of instance members of the class.</td>
       *       </tr>
       *       <tr>
       *         <th>environment</th>
       *         <td>Map</td>
       *         <td>
       *           Map of environment settings for this class. For a
       *           description of the format of a setting see {@link
       *           qx.core.Environment}.
       *         </td>
       *       </tr>
       *       <tr>
       *         <th>events</th>
       *         <td>Map</td>
       *         <td>
       *           Map of events the class fires. The keys are the names of
       *           the events and the values are the corresponding event type
       *           class names.
       *         </td>
       *       </tr>
       *       <tr>
       *         <th>defer</th>
       *         <td>Function</td>
       *         <td>
       *           Function that is called at the end of processing the class
       *           declaration. It allows access to the declared statics,
       *           members and properties.
       *         </td>
       *       </tr>
       *       <tr>
       *         <th>destruct</th>
       *         <td>Function</td>
       *         <td>The destructor of the class.</td>
       *       </tr>
       *       <tr>
       *         <th>proxyHandler</th>
       *         <td>Map</td>
       *         <td>
       *           Special use-case handling of setters/getters. See the
       *           developer documentation.
       *         </td>
       *       </tr>
       *     </table>
       *
       * @return {Class}
       *   The defined class
       */
      define : qx.Bootstrap.define,

      /**
       * Removes a class from qooxdoo defined by {@link #define}
       *
       * @param name {String}
       *   Name of the class
       */
      undefine : qx.Bootstrap.undefine,

      /**
       * Include all features of the given mixin into the class. The
       * mixin must not include any methods or properties that are
       * already available in the class. This would only be possible
       * using the {@link #patch} method.
       *
       * @param clazz {Class}
       *   An existing class which should be augmented by including a mixin.
       *
       * @param mixin {Mixin}
       *   The mixin to be included.
       */
      include : function(clazz, mixin)
      {
        if (qx.core.Environment.get("qx.debug"))
        {
          if (! mixin) {
            throw new Error(
              `The mixin to include into class ${clazz.classname} ` +
                "is undefined or null");
          }

          qx.Mixin.isCompatible(mixin, clazz);
        }

        qx.Class.addMixin(clazz, mixin, false);
      },

      /**
       * Include all features of the given mixin into the class. The
       * mixin may include features, which are already defined in the
       * target class. Existing features of equal name will be
       * overwritten. Please keep in mind that this functionality is
       * not intended for regular use, but as a formalized way (and a
       * last resort) in order to patch existing classes.
       *
       * <b>WARNING</b>: You may break working classes and features.
       *
       * @param clazz {Class}
       *   An existing class which should be modified by including a mixin.
       *
       * @param mixin {Mixin}
       *   The mixin to be included.
       *
       * @return {Class}
       *   The new class definition
       */
      patch : function(clazz, mixin)
      {
        if (qx.core.Environment.get("qx.debug"))
        {
          if (! mixin) {
            throw new Error(
              `The mixin to patch class ${clazz.classname} ` +
                "is undefined or null");
          }

          qx.Mixin.isCompatible(mixin, clazz);
        }

        qx.Class.addMixin(clazz, mixin, true);
        return qx.Class.getByName(clazz.classname);
      },



      /**
       * Attach members to a class
       *
       * @param clazz {Class}
       *   Class to add members to
       *
       * @param members {Map}
       *   The map of members to attach
       *
       * @param patch {Boolean ? false}
       *   Enable patching
       */
      addMembers : qx.Bootstrap.addMembers,

      /**
       * Attach properties to classes
       *
       * @param clazz {Class}
       *   Class to add the properties to
       *
       * @param properties {Map}
       *   Map of properties
       *
       * @param patch {Boolean ? false}
       *   Overwrite property with the limitations of a property which means
       *   you are able to refine but not to replace (esp. for new properties)
       */
      addProperties : qx.Bootstrap.addProperties,

      /**
       * Attach events to the class
       *
       * @param clazz {Class}
       *   Class to add the events to
       *
       * @param events {Map}
       *   Map of event names the class fires
       *
       * @param patch {Boolean ? false}
       *   Enable redefinition of event type?
       */
      addEvents : qx.Bootstrap.addEvents,

      /**
       * Include all features of the mixin into the given class, recursively.
       *
       * @param clazz {Class}
       *   The class onto which the mixin should be attached
       *
       * @param mixin {Mixin}
       *   Include all features of this mixin
       *
       * @param patch {Boolean}
       *   Overwrite existing fields, functions and properties
       */
      addMixin : function(clazz, mixin, patch)
      {
        if (qx.core.Environment.get("qx.debug"))
        {
          if (! clazz || ! mixin)
          {
            throw new Error("Incomplete parameters!");
          }
        }

        if (this.hasMixin(clazz, mixin))
        {
          return;
        }

        // Attach content
        let list = qx.Mixin.flatten( [ mixin ] );
        list.forEach(
          (entry) =>
          {
            // Attach events
            if (entry.$$events)
            {
              this.addEvents(clazz, entry.$$events, patch);
            }

            // Attach properties
            if (entry.$$properties)
            {
              this.addProperties(clazz, entry.$$properties, patch);
            }

            // Attach members
            if (entry.$$members)
            {
              this.addMembers(clazz, entry.$$members, patch);
            }
          });

        // Store mixin reference
        if (clazz.$$includes)
        {
          clazz.$$includes.push(mixin);
          clazz.$$flatIncludes.push.apply(clazz.$$flatIncludes, list);
        }
        else
        {
          clazz.$$includes = [ mixin ];
          clazz.$$flatIncludes = list;
        }
      },

      /**
       * Add a single interface to a class
       *
       * @param clazz {Class} class to add interface to
       * @param iface {Interface} the Interface to add
       */
      addInterface : function(clazz, iface)
      {
        if (qx.core.Environment.get("qx.debug"))
        {
          if (! clazz || ! iface)
          {
            throw new Error("Incomplete parameters");
          }

          // This differs from mixins, we only check if the interface
          // is already directly used by this class. It is allowed
          // however, to have an interface included multiple times by
          // extends in the interfaces etc.
          if (this.hasOwnInterface(clazz, iface))
          {
            throw new Error(
              `Interface ${iface.name} is already used by ` +
                `Class ${clazz.classname}`);
          }

          // Check interface and wrap members
          if (clazz.$$classtype !== "abstract")
          {
            qx.Interface.assert(clazz, iface, true);
          }
        }

        // Store interface reference
        let list = qx.Interface.flatten([iface]);
        if (clazz.$$implements)
        {
          clazz.$$implements.push(iface);
          clazz.$$flatImplements.push.apply(clazz.$$flatImplements, list);
        }
        else
        {
          clazz.$$implements = [iface];
          clazz.$$flatImplements = list;
        }
      },

      /**
       * Validates the interfaces required by abstract base classes
       *
       * @signature function(clazz)
       *
       * @param clazz {Class}
       *   The configured class.
       */
      validateAbstractInterfaces : function(clazz)
      {
        let superclass = clazz.superclass;
        while (superclass)
        {
          if (superclass.$$classtype !== "abstract")
          {
            break;
          }

          var interfaces = superclass.$$implements;
          if (interfaces)
          {
            for (let i=0; i<interfaces.length; i++)
            {
              qx.Interface.assert(clazz, interfaces[i], true);
            }
          }
          superclass = superclass.superclass;
        }
      },

      /**
       * Find a class by its name
       *
       * @signature function(name)
       *
       * @param name {String}
       *   Class name to resolve
       *
       * @return {Class}
       *   The class
       */
      getByName : qx.Bootstrap.getByName,

      /**
       * Returns the class or one of its superclasses which contains the
       * declaration for the given mixin. Returns null if the mixin is not
       * specified anywhere.
       *
       * @param clazz {Class}
       *   Class to look for the mixin
       *
       * @param mixin {Mixin}
       *   Mixin to look for
       *
       * @return {Class | null}
       *   The class which directly includes the given mixin
       */
      getByMixin : function(clazz, mixin)
      {
        while (clazz)
        {
          if (clazz.$$includes)
          {
            let list = clazz.$$flatIncludes;

            for (let i = 0, l = list.length; i < l; i++)
            {
              if (list[i] === mixin)
              {
                return clazz;
              }
            }
          }

          clazz = clazz.superclass;
        }

        return null;
      },

      /**
       * Whether a given class or any of its superclasses includes a given mixin.
       *
       * @param clazz {Class}
       *   Class to check
       *
       * @param mixin {Mixin}
       *   The mixin to check for
       *
       * @return {Boolean}
       *   Whether the class includes the mixin.
       */
      hasMixin : function(clazz, mixin)
      {
        return !! this.getByMixin(clazz, mixin);
      },

      /**
       * Whether a given class directly includes an interface.
       *
       * This function will only return "true" if the interface was
       * defined in the class declaration ({@link qx.Class#define})
       * using the "implement" key.
       *
       * @param clazz {Class}
       *   Class or instance to check
       *
       * @param iface {Interface}
       *   The interface to check for
       *
       * @return {Boolean}
       *   Whether the class includes the mixin directly.
       */
      hasOwnInterface : function(clazz, iface)
      {
        return clazz.$$implements && clazz.$$implements.includes(iface);
      },


      /**
       * Returns the class or one of its super classes which contains the
       * declaration of the given interface. Returns null if the interface is
       * not specified anywhere.
       *
       * @signature function(clazz, iface)
       *
       * @param clazz {Class}
       *   Class to look for the interface
       *
       * @param iface {Interface}
       *   Interface to look for
       *
       * @return {Class | null}
       *   The class which directly implements the given interface
       */
      getByInterface : qx.util.OOUtil.getByInterface,


      /**
       * Returns a list of all interfaces a given class has to implement.
       *
       * @param clazz {Class}
       *   Class which should be inspected
       *
       * @return {Interface[]}
       *   Array of interfaces this class implements
       */
      getInterfaces : function(clazz)
      {
        let list = [];

        while (clazz)
        {
          if (clazz.$$implements)
          {
            list.push.apply(list, clazz.$$flatImplements);
          }

          clazz = clazz.superclass;
        }

        return list;
      },


      /**
       * Whether a given class or any of its super classes includes a
       * given interface.
       *
       * This function will return "true" if the interface was defined
       * in the class declaration ({@link qx.Class#define}) of the
       * class or any of its super classes using the "implement" key.
       *
       * @signature function(clazz, iface)
       *
       * @param clazz {Class}
       *   Class to check
       *
       * @param iface {Interface}
       *   The interface to check for
       *
       * @return {Boolean}
       *   Whether the class includes the interface.
       */
      hasInterface : qx.util.OOUtil.hasInterface,


      /**
       * Whether a given class complies to an interface.
       *
       * Checks whether all methods defined in the interface are
       * implemented. The class does not need to implement
       * the interface explicitly in the <code>extend</code> key.
       *
       * @param obj {Object}
       *   Class to check
       *
       * @param iface {Interface}
       *   The interface to check for
       *
       * @return {Boolean}
       *   Whether the class conforms to the interface.
       */
      implementsInterface : function(obj, iface)
      {
        let clazz = obj.constructor;

        if (this.hasInterface(clazz, iface))
        {
          return true;
        }

        if (qx.Interface.objectImplements(obj, iface))
        {
          return true;
        }

        if (qx.Interface.classImplements(clazz, iface))
        {
          return true;
        }

        return false;
      },

      /**
       * Whether the given class exists
       *
       * @signature function(name)
       * @param name {String} class name to check
       * @return {Boolean} true if class exists
       */
      isDefined: qx.util.OOUtil.classIsDefined,

      /**
       * Determine the total number of classes
       *
       * @return {Number} the total number of classes
       */
      getTotalNumber() {
        return qx.Bootstrap.objectGetLength(this.$$registry);
      }
    }
  });
