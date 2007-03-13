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
    CHECKS :
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
     * Update widget and all children on parent change
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

        if (config.inheritable)
        {
          members[namePrefix + "refresh" + funcName] = function(value) {
            return qx.core.Property.executeOptimizedSetter(this, clazz, name, "refresh", value);
          }
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





      // [1] CHECKING & STORING INCOMING VALUE

      // Improve performance of db access
      code.add('var db=this.__', variant === "style" ? 'styleValues;' : 'userValues;');

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

      // Store value
      // Hint: Not in refresh, it is not my value, but the value of my parent
      if (variant !== "refresh") {
        code.add('db.', property, '=value;');
      }





      // [2] GENERATING COMPUTED VALUE

      // In both variants, set and toggle, the value is always the user value and is
      // could not be undefined. This way we are sure we can use this value and don't
      // need a complex logic to find the usable value.

      // Use complex evaluation for reset, refresh and style
      if (variant === "refresh" || variant === "reset" || variant === "style")
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

      if (config.inheritable === true)
      {
        code.add('if(computed===qx.core.Property.INHERIT||computed===undefined){');

        if (variant == "refresh")
        {
          code.add('computed=value;');
        }
        else if (variant === "style" || variant === "set" || variant == "reset")
        {
          code.add('computed=this.getParent().$$computedValues.', property, ';');
        }

        // Hint: No toggle here, toggle only allows true/false and no inherit value

        code.add('}');
      }






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

      // Refresh children
      if (config.inheritable === true)
      {
        code.add('for(var i=0,a=this.getChildren(),l=a.length;i<l;i++) {');
        code.add('a[i].', config.namePrefix, 'refresh', config.funcName, '(computed);');
        code.add('}');
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

      // Overriding temporary setter
      clazz.prototype[config.namePrefix + variant + config.funcName] = new Function("value", code.toString());

      // Executing new setter
      return instance[config.namePrefix + variant + config.funcName](value);
    }
  },

  settings :
  {
    "qx.propertyDebugLevel" : 1
  }
});
