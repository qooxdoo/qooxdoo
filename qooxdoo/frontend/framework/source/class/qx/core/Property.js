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


    $$method :
    {
      set     : {},
      get     : {},
      init    : {},
      refresh : {},
      style   : {},
      compute : {},
      toggle  : {},
      reset   : {}
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

              widget[this.$$method.refresh[name]](parent.$$computedValues[name]);
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
      var prefix, postfix;

      while(clazz && !clazz.$$propertiesAttached)
      {
        properties = clazz.$$properties;

        if (properties)
        {
          for (name in properties)
          {
            config = properties[name];

            // Filter old properties and groups
            if (!config._legacy && !config._fast && !config._cached)
            {
              if (name.indexOf("__") == 0)
              {
                prefix = "__";
                postfix = qx.lang.String.toFirstUp(name.substring(2));
              }
              else if (name.indexOf("_") == 0)
              {
                prefix = "_";
                postfix = qx.lang.String.toFirstUp(name.substring(1));
              }
              else
              {
                prefix = "";
                postfix = qx.lang.String.toFirstUp(name);
              }

              // Attach methods
              config.group ? this.__attachGroupMethods(clazz, config, prefix, postfix) : this.__attachPropertyMethods(clazz, config, prefix, postfix);
            }
          }
        }

        clazz.$$propertiesAttached = true;
        clazz = clazz.superclass;
      }
    },


    /**
     * Attach group methods
     *
     * @type static
     * @internal
     * @param clazz {Class} Class to attach properties to
     * @param config {Map} Property configuration
     * @return {void}
     */
    __attachGroupMethods : function(clazz, config, prefix, postfix)
    {
      var members = clazz.prototype;
      var name = config.name;

      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (qx.core.Setting.get("qx.propertyDebugLevel") > 1) {
          console.debug("Generating property group: " + name);
        }
      }

      var code = new qx.util.StringBuilder;

      code.add("var a=arguments;")

      if (config.mode == "shorthand") {
        code.add("a=qx.lang.Array.fromShortHand(qx.lang.Array.fromArguments(a));")
      }

      for (var i=0, a=config.group, l=a.length; i<l; i++)
      {
        if (qx.core.Variant.isSet("qx.debug", "on"))
        {
          if (this.$$method.set[a[i]] === undefined)
          {
            throw new Error("Missing set method cache entry for: " + a[i]);
          }
        }

        code.add("this.", this.$$method.set[a[i]], "(a[", i, "]);");
      }

      // Attach setter
      this.$$method.set[name] = prefix + "set" + postfix;
      members[this.$$method.set[name]] = new Function(code.toString());

      // Output generate code
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (qx.core.Setting.get("qx.propertyDebugLevel") > 0) {
          console.debug("Code: " + code);
        }
      }

      // Dispose string builder
      code.dispose();
    },


    /**
     * Attach property methods
     *
     * @type static
     * @internal
     * @param clazz {Class} Class to attach properties to
     * @param config {Map} Property configuration
     * @return {void}
     */
    __attachPropertyMethods : function(clazz, config, prefix, postfix)
    {
      var members = clazz.prototype;
      var name = config.name;

      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (qx.core.Setting.get("qx.propertyDebugLevel") > 1) {
          console.debug("Generating property wrappers: " + name);
        }
      }

      var method = this.$$method;

      method.get[name] = prefix + "get" + postfix;
      members[method.get[name]] = function() {
        return this.$$userValues[name];
      }

      method.compute[name] = prefix + "compute" + postfix;
      members[method.compute[name]] = function() {
        return this.$$computedValues[name];
      }

      method.set[name] = prefix + "set" + postfix;
      members[method.set[name]] = function(value) {
        return qx.core.Property.executeOptimizedSetter(this, clazz, name, "set", value);
      }

      method.reset[name] = prefix + "reset" + postfix;
      members[method.reset[name]] = function() {
        return qx.core.Property.executeOptimizedSetter(this, clazz, name, "reset");
      }

      if (config.inheritable === true)
      {
        method.refresh[name] = prefix + "refresh" + postfix;
        members[method.refresh[name]] = function(value) {
          return qx.core.Property.executeOptimizedSetter(this, clazz, name, "refresh", value);
        }
      }

      if (config.appearance !== undefined)
      {
        method.style[name] = prefix + "style" + postfix;
        members[method.style[name]] = function(value) {
          return qx.core.Property.executeOptimizedSetter(this, clazz, name, "style", value);
        }
      }

      if (config.check === "Boolean")
      {
        method.toggle[name] = prefix + "toggle" + postfix;
        members[method.toggle[name]] = function() {
          return qx.core.Property.executeOptimizedSetter(this, clazz, name, "toggle");
        }
      }

      if (config.init !== undefined)
      {
        method.init[name] = prefix + "init" + postfix;
        members[method.init[name]] = function() {
          return qx.core.Property.executeOptimizedSetter(this, clazz, name, "init");
        }
      }
    },


    /**
     * Apply init values
     *
     * @type static
     * @internal
     */
    init : function(clazz, instance)
    {
      var properties = clazz.$$properties;
      var init = this.$$method.init;
      var name;

      if (properties)
      {
        for (name in properties)
        {
          if (properties[name].init !== undefined) {
            instance[init[name]]();
          }
        }
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
    executeOptimizedSetter : function(instance, clazz, name, variant, value)
    {
      var config = clazz.$$properties[name];
      var members = clazz.prototype;
      var code = new qx.util.StringBuilder;





      // [1] CHECKING & STORING INCOMING VALUE

      // Improve performance of db access
      code.add('var db=this.$$', variant === "style" ? 'styleValues;' : 'userValues;');

      if (variant === "set" || variant === "style")
      {
        // Undefined check
        code.add('if(value===undefined)');
        code.add('throw new Error("Undefined value for property ', name, '!");');

        // Old/new comparision
        code.add('if(', 'db.', name, '===value)return value;');

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
              code.add('if(!', clazz.classname, '.$$properties.', name);
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

            code.add('throw new Error("Invalid value for property ', name, ': " + value);');
          }
        }
      }
      else if (variant === "toggle")
      {
        // Toggle value (Replace eventually incoming value for setter etc.)
        code.add('value=!', 'db.', name, ';');
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
        code.add('db.', name, '=value;');
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
          code.add('if(this.$$userValues.', name, '!==undefined)');
          code.add('computed=this.$$userValues.', name, ';');
          hasComputeIf = true;
        }

        // Try to use appearance value when available
        if (config.appearance === true)
        {
          if (hasComputeIf) {
            code.add('else ');
          }

          code.add('if(this.$$styleValues.', name, '!==undefined)');
          code.add('computed=this.$$styleValues.', name, ';');
          hasComputeIf = true;
        }

        // Try to use initial value when available
        if (config.init !== undefined)
        {
          if (hasComputeIf) {
            code.add('else ');
          }

          code.add('computed=this.$$init', name, ';');
        }
      }

      // Use simple evaluation for set & toggle
      else
      {
        code.add('var computed=value;');
      }






      // [3] RESPECTING INHERITANCE

      // Require the parent/children interface

      if (members.getParent)
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
              code.add('var pa=this.getParent();if(pa)computed=pa.$$computedValues.', name, ';');
            }

            code.add('}');
          }
        }
      }

      // Hint: No toggle() here, toggle only allows true/false user value and no inherit
      // Hint: No init() here, init does not need to respect inheritance because there is no parent yet.






      // [4] STORING COMPUTED VALUE

      // Remember computed old value
      code.add('var old=this.$$computedValues.', name, ';');

      // Compare old/new computed value
      code.add('if(old===computed)return value;');

      // Store new computed value
      code.add('this.$$computedValues.', name, '=computed;');

      // Inform user
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (qx.core.Setting.get("qx.propertyDebugLevel") > 0) {
          code.add('this.debug("', name, ' changed: " + old + " => " + computed);');
        }
      }




      // [5] NOTIFYING DEPENDEND OBJECTS

      // Execute user configured setter
      if (config.apply)
      {
        code.add('try{');
        code.add('this.', config.apply, '(computed, old);');
        code.add('}catch(ex){this.error("Failed to execute apply of property ');
        code.add(name, ' defined by class ', clazz.classname, '!", ex);}');
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
        if (members.getChildren && config.inheritable === true)
        {
          code.add('for(var i=0,a=this.getChildren(),l=a.length;i<l;i++){');
          code.add('a[i].', this.$$method.refresh[name], '(computed);');
          code.add('}');
        }
      }






      // [6] RETURNING WITH ORIGINAL INCOMING VALUE

      // Return value
      code.add('return value;');





      // Output generate code
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (qx.core.Setting.get("qx.propertyDebugLevel") > 0) {
          console.debug("Code: " + code);
        }
      }



      // Overriding temporary wrapper
      members[this.$$method[variant][name]] = new Function("value", code.toString());

      // Disposing string builder
      code.dispose();

      // Executing new function
      return instance[this.$$method[variant][name]](value);
    }
  },





  /*
  *****************************************************************************
     SETTINGS
  *****************************************************************************
  */

  settings : {
    "qx.propertyDebugLevel" : 0
  }
});
