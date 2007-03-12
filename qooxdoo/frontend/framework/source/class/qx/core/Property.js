/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

************************************************************************ */

qx.Class.define("qx.core.Property",
{
  statics :
  {
    INHERIT : "inherit",

    /**
     *
     *
     */
    CHECKPRESETS :
    {
      "defined" : 'value != undefined',
      "null"    : 'value === null',
      "String"  : 'typeof value == "string"',
      "Boolean" : 'typeof value == "boolean"',
      "Number"  : 'typeof value == "number" && !isNaN(value)',
      "Object"  : 'value != null && typeof value == "object"',
      "Array"   : 'value instanceof Array',
      "Map"     : 'value !== null && typeof value === "object" && !(value instanceof Array)'
    },


    /**
     * Add property methods (used exclusively from qx.core.Object)
     *
     * @type static
     * @param config {Map} Configuration map
     * @param proto {Object} Object where the setter should be attached
     * @return {void}
     */
    attachPropertyMethods : function(clazz, config)
    {
      var members = clazz.prototype;
      var name = config.name;
      var namePrefix;

      if (name.indexOf("__") == 0)
      {
        access = "private";
        namePrefix = "__";
        propName = name.substring(2);
      }
      else if (name.indexOf("_") == 0)
      {
        access = "protected";
        namePrefix = "_";
        propName = name.substring(1);
      }
      else
      {
        access = "public";
        namePrefix = "";
        propName = name;
      }

      var funcName = qx.lang.String.toFirstUp(propName);

      // Complete property configuration
      config.propName = propName;
      config.funcName = funcName;
      config.namePrefix = namePrefix;
      config.access = access;

      // Processing property groups
      if (config.group)
      {
        if (qx.core.Variant.isSet("qx.debug", "on"))
        {
          if (qx.core.Setting.get("qx.propertyDebugLevel") > 1) {
            console.debug("Generating property group: " + name + " (" + access + ")");
          }
        }


        var setter = new qx.util.StringBuilder;

        setter.add("var a=arguments;")

        if (config.mode == "shorthand") {
          setter.add("a=qx.lang.Array.fromShortHand(qx.lang.Array.fromArguments(a));")
        }

        for (var i=0, a=config.group, l=a.length; i<l; i++)
        {
          // TODO: Support private, protected, etc. in setters
          setter.add("this.set", qx.lang.String.toFirstUp(a[i]), "(a[", i, "]);");
        }

        members[namePrefix + "set" + funcName] = new Function(setter.toString());
      }

      // Processing properties
      else
      {
        if (qx.core.Variant.isSet("qx.debug", "on"))
        {
          if (qx.core.Setting.get("qx.propertyDebugLevel") > 1) {
            console.debug("Generating property wrappers: " + name + " (" + access + ")");
          }
        }



        /**
         * GETTER
         */

        // Methods used by the user
        members[namePrefix + "get" + funcName] = function() {
          return this.__userValues[name];
        }

        // Computed getter
        members[namePrefix + "compute" + funcName] = function() {
          return this.__computedValues[name];
        }

        /**
         * SETTER
         */

        members[namePrefix + "set" + funcName] = function(value) {
          return qx.core.Property.executeOptimizedSetter(this, clazz, name, "set", value);
        }

        members[namePrefix + "reset" + funcName] = function() {
          return qx.core.Property.executeOptimizedSetter(this, clazz, name, "reset");
        }

        members[namePrefix + "refresh" + funcName] = function() {
          return qx.core.Property.executeOptimizedSetter(this, clazz, name, "refresh");
        }

        if (config.appearance)
        {
          members[namePrefix + "style" + funcName] = function(value) {
            return qx.core.Property.executeOptimizedSetter(this, clazz, name, "style", value);
          }
        }

        if (config.check === "Boolean")
        {
          members[namePrefix + "toggle" + funcName] = function() {
            return qx.core.Property.executeOptimizedSetter(this, clazz, name, "toggle");
          }
        }
      }
    },


    /**
     * TODOC
     *
     * @type static
     * @param clazz {var} TODOC
     * @param mode {var} TODOC
     * @param name {var} TODOC
     * @param value {var} TODOC
     * @return {call} TODOC
     */
    executeOptimizedSetter : function(instance, clazz, property, variant, value)
    {
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (qx.core.Setting.get("qx.propertyDebugLevel") > 1) {
          console.debug("Finalize " + variant + "() of " + property + " in class " + clazz.classname);
        }
      }



      var config = clazz.$$properties[property];
      var code = new qx.util.StringBuilder;




      // Improve performance of db access
      code.add('var db=this.__', variant === "style" ? 'styleValues;' : 'userValues;');

      // Validate setter and if in debug mode the styler, too
      var enableChecks = false;

      if (variant == "set")
      {
        enableChecks = true;
      }
      else if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (variant == "style") {
          enableChecks = true;
        }
      }


      // Checks
      if (enableChecks)
      {
        // Undefined check
        code.add('if(value===undefined)');
        code.add('this.warn("Undefined value for property ', property, ': " + value); return value;');

        // Old/new comparision
        code.add('if(', 'db.', property, '===value)return value;');

        // Check value
        if (config.check !== undefined)
        {
          if (this.CHECKPRESETS[config.check] !== undefined)
          {
            code.add('if(!(', this.CHECKPRESETS[config.check], '))');
          }
          else if (qx.Class.isDefined(config.check))
          {
            code.add('if(!(value instanceof ', config.check, '))');
          }
          else if (typeof config.check === "function")
          {
            code.add('if(!', clazz.classname, '.$$properties.', property);
            code.add('.check.call(this, value))');
          }
          else if (typeof config.check === "string")
          {
            code.add('if(!(', config.check, '))');
          }
          else
          {
            throw new Error("Could not add check to property " + name + " of class " + clazz.classname);
          }

          code.add('this.warn("Invalid value for property ', property, ': " + value); return value;');
        }

        // Store value
        code.add('db.', property, '=value;');
      }
      else if (variant === "toggle")
      {
        // Toggle value (Replace eventually incoming value for setter etc.)
        code.add('value=!(', 'db.', property, '||false);');

        // Store value
        code.add('db.', property, '=value;');
      }
      else if (variant === "reset")
      {
        // Remove value
        code.add('db.', property, '=value=undefined;');
      }



      // TODO: Normally we only need this now if:
      //   * we have children to inform
      //   * we have events to dispatch
      //   * we have a setter/modify method to execute
      // Otherwise invalidation would be maybe enough. Is this really relevant?



      // Generated "computed" value
      //
      // In both variants, set and toggle, the value is always the user value and is
      // could not be undefined. This way we are sure we can use this value and don't
      // need a complex logic to find the usable value.
      //
      // Otherwise: If there is no appearance support and no initial value, the only
      // available value is the user value. We can then simply use this value to,
      // defined or not.
      if (variant === "set" || variant === "toggle" || (config.appearance !== true && config.init === undefined))
      {
        code.add('var computed=value;');
      }
      else
      {
        code.add('var computed;');
        code.add('if(this.__userValues.', property, '!==undefined)computed=this.__userValues.', property, ';');

        if (config.appearance === true) {
          code.add('else if(this.__styleValues.', property, '!==undefined)computed=this.__styleValues.', property, ';');
        }

        if (config.init !== undefined) {
          code.add('else computed=', clazz.classname, '.$$properties.', property, '.init;');
        }
      }








      if (config.inheritable === true)
      {
        // Search for inheritance
        code.add('if(computed===qx.core.Property.INHERIT||(computed===undefined&&config.inheritable)){');
        code.add('var parent=this.getParent();');
        code.add('while(parent){computed=getParent().compute', config.funcName, '();');
        code.add('if(computed!==qx.core.Property.INHERIT)break;');
        code.add('parent=parent.getParent();}}');
      }
      else if (enableChecks)
      {
        code.add('if(computed===qx.core.Property.INHERIT)');
        code.add('this.warn("The property ', property, ' of ');
        code.add(clazz.classname, ' does not support inheritance!"); return value;');
      }



      // Remember old value
      code.add('var old=this.__computedValues.', property, ';');

      // Check old/new value
      code.add('if(old===computed)return value;');

      // Store new computed value
      code.add('this.__computedValues.', property, '=computed;');


      // Inform user
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (qx.core.Setting.get("qx.propertyDebugLevel") > 0) {
          code.add('this.debug("' + property + ' changed: " + old + " => " + computed);');
        }
      }

      // Execute user configured setter
      if (config.setter)
      {
        code.add('try{');
        code.add(clazz.classname, '.$$properties.', property);
        code.add('.setter.call(this, computed, old);');
        code.add('}catch(ex){this.error("Failed to execute setter of property ');
        code.add(property, ' defined by class ', clazz.classname, '!", ex);}');
      }

      // Fire event
      if (config.event) {
        code.add('this.createDispatchDataEvent("', config.event, '", computed);');
      }



      // Return value
      code.add('return value;');





      // Output generate code
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (qx.core.Setting.get("qx.propertyDebugLevel") > 2) {
          console.debug("Code: " + code);
        }
      }

      // Overriding temporary setter
      clazz.prototype[config.namePrefix + variant + config.funcName] = new Function("value", code.toString());

      // Executing new setter
      return instance[config.namePrefix + variant + config.funcName](value);
    }
  },

  settings :
  {
    "qx.propertyDebugLevel" : 3
  }
});
