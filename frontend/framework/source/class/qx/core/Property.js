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
    /**
     * Inherit value, used to override defaults etc. to force inheritance
     * even if property value is not undefined (through multi-values)
     */
    INHERIT : "inherit",


    /**
     * Built-in checks
     * The keys could be used in the check of the properties
     */
    CHECKS :
    {
      "defined" : 'value !== undefined',
      "null"    : 'value === null',
      "String"  : 'typeof value === "string"',
      "Boolean" : 'typeof value === "boolean"',
      "Number"  : 'typeof value === "number" && !isNaN(value)',
      "Object"  : 'value !== null && typeof value === "object"',
      "Array"   : 'value instanceof Array',
      "Map"     : 'value !== null && typeof value === "object" && !(value instanceof Array) && !(value instanceof qx.core.Object)'
    },


    /**
     * Update widget and all children on parent change
     *
     * @type static
     * @internal
     * @param widget {qx.core.ui.Widget} The widget which parent has changed
     * @return {void}
     */
    updateParent : function(widget)
    {
      var clazz = widget.constructor;
      var parent = widget.getParent();
      var properties, config, value;

      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (qx.core.Setting.get("qx.propertyDebugLevel") > 0) {
          widget.debug("UpdateParent: " + widget);
        }
      }

      while(clazz)
      {
        properties = clazz.$$properties;

        if (properties)
        {
          for (name in properties)
          {
            config = properties[name];
            if (config.inheritable)
            {
              if (qx.core.Variant.isSet("qx.debug", "on"))
              {
                if (qx.core.Setting.get("qx.propertyDebugLevel") > 1) {
                  widget.debug("Updating property: " + config.name);
                }
              }

              widget[config.namePrefix + "refresh" + config.funcName](parent.$$computedValues[name]);
            }
          }
        }

        clazz = clazz.superclass;
      }
    },


    /**
     * Attach properties to class prototype
     *
     * @type static
     * @internal
     * @param clazz {Class} Class to attach properties to
     * @return {void}
     */
    attachProperties : function(clazz)
    {
      var config, properties, name;

      while(clazz && !clazz.$$propertiesAttached)
      {
        properties = clazz.$$properties;

        if (properties)
        {
          for (name in properties)
          {
            config = properties[name];

            // Filter old properties and groups
            if (!config._legacy && !config._fast && !config._cached) {
              this.__attachPropertyMethods(clazz, config);
            }
          }
        }

        clazz.$$propertiesAttached = true;
        clazz = clazz.superclass;
      }
    },


    /**
     * Add property methods
     *
     * @type static
     * @internal
     * @param clazz {Class} Class to attach properties to
     * @param config {Map} Property configuration
     * @return {void}
     */
    __attachPropertyMethods : function(clazz, config)
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
          return this.$$userValues[name];
        }

        // Computed getter
        members[namePrefix + "compute" + funcName] = function() {
          return this.$$computedValues[name];
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

        if (config.inheritable === true)
        {
          members[namePrefix + "refresh" + funcName] = function(value) {
            return qx.core.Property.executeOptimizedSetter(this, clazz, name, "refresh", value);
          }
        }

        if (config.appearance !== undefined)
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

        if (config.init !== undefined)
        {
          members[namePrefix + "init" + funcName] = function() {
            return qx.core.Property.executeOptimizedSetter(this, clazz, name, "init");
          }
        }
      }
    },


    /**
     * Apply init values
     *
     * @type static
     * @internal
     */
    applyInitValues : function(instance)
    {
      var config, properties, name;
      var clazz = instance.constructor;

      while(clazz)
      {
        properties = clazz.$$properties;

        if (properties)
        {
          for (name in properties)
          {
            config = properties[name];

            if (config.init !== undefined)
            {
              console.log("Initialize: " + name);
              instance[config.namePrefix + "init" + config.funcName]();
            }
          }
        }

        clazz = clazz.superclass;
      }
    },


    /**
     * Generates the optimized setter
     * Supported variants: set, reset, init, refresh, style and toggle
     *
     * @type static
     * @internal
     * @return {call} Execute return value of apply generated function, generally the incoming value
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





      // [1] CHECKING & STORING INCOMING VALUE

      // Improve performance of db access
      code.add('var db=this.$$', variant === "style" ? 'styleValues;' : 'userValues;');

      if (variant === "set" || variant === "style")
      {
        // Undefined check
        code.add('if(value===undefined)');
        code.add('throw new Error("Undefined value for property ', property, ': " + value);');

        // Old/new comparision
        code.add('if(', 'db.', property, '===value)return value;');

        if (variant === "set")
        {
          // Check value
          if (config.check !== undefined)
          {
            if (this.CHECKS[config.check] !== undefined)
            {
              code.add('if(!(', this.CHECKS[config.check], '))');
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

            code.add('throw new Error("Invalid value for property ', property, ': " + value);');
          }
        }
      }
      else if (variant === "toggle")
      {
        // Toggle value (Replace eventually incoming value for setter etc.)
        code.add('value=!', 'db.', property, ';');
      }
      else if (variant === "reset")
      {
        // Remove value
        code.add('value=undefined;');
      }

      // Hint: No refresh() here, the value of refresh is the parent value
      // Hint: No init() here, no incoming value

      // Store value
      // Hint: Not in refresh, it is not my value, but the value of my parent
      if (variant !== "refresh" && variant !== "init") {
        code.add('db.', property, '=value;');
      }





      // [2] GENERATING COMPUTED VALUE

      // In both variants, set and toggle, the value is always the user value and is
      // could not be undefined. This way we are sure we can use this value and don't
      // need a complex logic to find the usable value.

      // Use complex evaluation for reset, refresh, init and style
      if (variant === "refresh" || variant === "reset" || variant === "init" || variant === "style")
      {
        code.add('var computed;');

        var hasComputeIf = false;

        // Try to use user value when available
        // Hint: Always undefined in reset variant
        if (variant !== "reset")
        {
          code.add('if(this.$$userValues.', property, '!==undefined)');
          code.add('computed=this.$$userValues.', property, ';');
          hasComputeIf = true;
        }

        // Try to use appearance value when available
        if (config.appearance === true)
        {
          if (hasComputeIf) {
            code.add('else ');
          }

          code.add('if(this.$$styleValues.', property, '!==undefined)');
          code.add('computed=this.$$styleValues.', property, ';');
          hasComputeIf = true;
        }

        // Try to use initial value when available
        if (config.init !== undefined)
        {
          if (hasComputeIf) {
            code.add('else ');
          }

          code.add('computed=', clazz.classname);
          code.add('.$$properties.', property, '.init;');
        }
      }

      // Use simple evaluation for set & toggle
      else
      {
        code.add('var computed=value;');
      }






      // [3] RESPECTING INHERITANCE

      // Require the parent/children interface

      if (instance.getParent)
      {
        if (variant === "refresh" || variant === "style" || variant === "set" || variant == "reset")
        {
          if (config.inheritable === true)
          {
            code.add('if(computed===qx.core.Property.INHERIT||computed===undefined){');

            if (variant === "refresh")
            {
              code.add('computed=value;');
            }
            else
            {
              code.add('var pa=this.getParent();if(pa)computed=pa.$$computedValues.', property, ';');
            }

            code.add('}');
          }
        }
      }

      // Hint: No toggle() here, toggle only allows true/false user value and no inherit
      // Hint: No init() here, init does not need to respect inheritance because there is no parent yet.






      // [4] STORING COMPUTED VALUE

      // Remember computed old value
      code.add('var old=this.$$computedValues.', property, ';');

      // Compare old/new computed value
      code.add('if(old===computed)return value;');

      // Store new computed value
      code.add('this.$$computedValues.', property, '=computed;');

      // Inform user
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (qx.core.Setting.get("qx.propertyDebugLevel") > 0) {
          code.add('this.debug("' + property + ' changed: " + old + " => " + computed);');
        }
      }




      // [5] NOTIFYING DEPENDEND OBJECTS

      // Execute user configured setter
      if (config.apply)
      {
        code.add('try{');
        code.add(clazz.classname, '.$$properties.', property);
        code.add('.apply.call(this, computed, old);');
        code.add('}catch(ex){this.error("Failed to execute apply of property ');
        code.add(property, ' defined by class ', clazz.classname, '!", ex);}');
      }

      // Don't fire event and not update children in init().
      // There is no chance to attach an event listener or add children before.
      if (variant !== "init")
      {
        // Fire event
        if (config.event) {
          code.add('this.createDispatchDataEvent("', config.event, '", computed);');
        }

        // Refresh children
        // Require the parent/children interface
        if (instance.getChildren && config.inheritable === true)
        {
          code.add('var a=this.getChildren();if(a)for(var i=0,l=a.length;i<l;i++) {');
          code.add('a[i].', config.namePrefix, 'refresh', config.funcName, '(computed);');
          code.add('}');
        }
      }






      // [6] RETURNING WITH ORIGINAL INCOMING VALUE

      // Return value
      code.add('return value;');





      // Output generate code
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (qx.core.Setting.get("qx.propertyDebugLevel") > 2) {
          console.debug("Code: " + code);
        }
      }

      // Overriding temporary wrapper
      clazz.prototype[config.namePrefix + variant + config.funcName] = new Function("value", code.toString());

      // Disposing string builder
      code.dispose();

      // Executing new function
      return instance[config.namePrefix + variant + config.funcName](value);
    }
  },





  /*
  *****************************************************************************
     SETTINGS
  *****************************************************************************
  */

  settings : {
    "qx.propertyDebugLevel" : 3
  }
});
