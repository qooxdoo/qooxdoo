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
      "Number"  : '!isNaN(value)',
      "Object"  : 'value !== null && typeof value === "object"',
      "Array"   : 'value instanceof Array',
      "Map"     : 'value !== null && typeof value === "object" && !(value instanceof Array) && !(value instanceof qx.core.Object)'
    },


    $$method :
    {
      get     : {},
      set     : {},
      reset   : {},
      init    : {},
      prepare : {},
      refresh : {},
      style   : {},
      compute : {},
      toggle  : {}
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
        if (qx.core.Setting.get("qx.propertyDebugLevel") > 1) {
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
              value = parent["__computed$" + name];

              if (qx.core.Variant.isSet("qx.debug", "on"))
              {
                if (qx.core.Setting.get("qx.propertyDebugLevel") > 2) {
                  widget.debug("Updating property: " + config.name + " to '" + value + "'");
                }
              }

              widget[this.$$method.refresh[name]](value);
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
    attach : function(clazz)
    {
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (qx.core.Setting.get("qx.propertyDebugLevel") > 1) {
          console.debug("Generating property wrappers: " + name);
        }
      }

      var config, name, prefix, postfix;
      var properties = clazz.$$properties;

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
          if (this.$$method.set[a[i]] === undefined) {
            throw new Error("Missing set method cache entry for: " + a[i]);
          }
        }

        code.add("this.", this.$$method.set[a[i]], "(a[", i, "]);");
      }

      // Attach setter
      this.$$method.set[name] = prefix + "set" + postfix;
      members[this.$$method.set[name]] = new Function(code.toString());

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
      members[method.get[name]] = new Function("return this.__computed$" + name + ";");

      method.set[name] = prefix + "set" + postfix;
      members[method.set[name]] = function(value) {
        return qx.core.Property.executeOptimizedSetter(this, clazz, name, "set", value);
      }

      method.reset[name] = prefix + "reset" + postfix;
      members[method.reset[name]] = function() {
        return qx.core.Property.executeOptimizedSetter(this, clazz, name, "reset");
      }

      if (config.init !== undefined)
      {
        method.init[name] = prefix + "init" + postfix;
        members[method.init[name]] = function() {
          return qx.core.Property.executeOptimizedSetter(this, clazz, name, "init");
        }
      }
      else if (config.inheritable || config.nullable)
      {
        method.prepare[name] = prefix + "prepare" + postfix;
        members[method.prepare[name]] = function() {
          return qx.core.Property.executeOptimizedSetter(this, clazz, name, "prepare");
        }
      }

      if (config.inheritable === true)
      {
        method.refresh[name] = prefix + "refresh" + postfix;
        members[method.refresh[name]] = function(value) {
          return qx.core.Property.executeOptimizedSetter(this, clazz, name, "refresh", value);
        }
      }

      if (config.appearance === true)
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
      var prepare = this.$$method.prepare;
      var name, config;

      if (properties)
      {
        for (name in properties)
        {
          config = properties[name];

          if (config.init !== undefined)
          {
            instance[init[name]]();
          }
          else if (config.inheritable || config.nullable)
          {
            instance[prepare[name]]();
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

      var userKey = "this.__user$" + name;
      var styleKey = "this.__style$" + name;
      var computedKey = "this.__computed$" + name;
      var computedBase = ".__computed$" + name;
      var initKey = "this.__init$" + name;







      // [1] CHECKING & STORING INCOMING VALUE

      // Hint: No refresh() here, the value of refresh is the parent value
      // Hint: No init() or prepare() here, no incoming value
      if (variant === "set" || variant === "reset" || variant === "style" || variant === "toggle")
      {
        var storeKey = variant === "style" ? styleKey : userKey;

        if (variant === "set" || variant === "style")
        {
          // Old/new comparision
          code.add('if(', storeKey, '===value)return value;');

          if (variant === "set" || (qx.core.Variant.isSet("qx.debug", "on") && variant === "style"))
          {
            // Undefined check
            code.add('if(value===undefined)');
            code.add('throw new Error("Undefined value for property ', name, ' is not allowed!");');

            // Null check
            if (!config.nullable)
            {
              code.add('if(value===null)');
              code.add('throw new Error("Null value for property ', name, ' is not allowed!");');
            }

            // Check value
            if (config.check !== undefined)
            {
              code.add('if(');

              if (this.CHECKS[config.check] !== undefined)
              {
                code.add('!(', this.CHECKS[config.check], ')');
              }
              else if (qx.Class.isDefined(config.check))
              {
                code.add('!(value instanceof ', config.check, ')');
              }
              else if (typeof config.check === "function")
              {
                code.add('!', clazz.classname, '.$$properties.', name);
                code.add('.check.call(this, value)');
              }
              else if (typeof config.check === "string")
              {
                code.add('!(', config.check, ')');
              }
              else if (config.check instanceof Array)
              {
                // reconfigure for faster access trough map usage
                config.checkMap = qx.lang.Object.fromArray(config.check);

                code.add(clazz.classname, '.$$properties.', name);
                code.add('.checkMap[value]!==undefined');
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
          code.add('value=!', computedKey, ';');
        }
        else if (variant === "reset")
        {
          // Remove value
          code.add('value=undefined;');
        }

        code.add(storeKey, '=value;');
      }





      // [2] GENERATING COMPUTED VALUE

      // In both variants, set and toggle, the value is always the user value and is
      // could not be undefined. This way we are sure we can use this value and don't
      // need a complex logic to find the usable value.

      // Use complex evaluation for init and prepare
      if (variant === "init" || variant === "prepare")
      {
        code.add('if(', userKey, '!==undefined)return;');

        if (config.appearance === true) {
          code.add('else if(', styleKey, '!==undefined)return;');
        }

        if (config.init !== undefined) {
          code.add('else{var computed=', initKey, ';}');
        } else {
          code.add('var computed;');
        }
      }

      // Use complex evaluation for reset, refresh and style
      else if (variant === "refresh" || variant === "reset" || variant === "style")
      {
        code.add('var computed;');

        var hasComputeIf = false;

        // Try to use user value when available
        // Hint: Always undefined in reset variant
        if (variant !== "reset")
        {
          code.add('if(', userKey, '!==undefined)');
          code.add('computed=', userKey, ';');
          hasComputeIf = true;
        }

        // Try to use appearance value when available
        if (config.appearance === true)
        {
          if (hasComputeIf) {
            code.add('else ');
          }

          code.add('if(', styleKey, '!==undefined)');
          code.add('computed=', styleKey, ';');
          hasComputeIf = true;
        }

        // Try to use initial value when available
        if (config.init !== undefined)
        {
          if (hasComputeIf) {
            code.add('else ');
          }

          code.add('computed=', initKey, ';');
        }
      }

      // Use simple evaluation for set and toggle
      else
      {
        code.add('var computed=value;');
      }






      // [3] RESPECTING INHERITANCE

      // Require the parent/children interface

      if (members.getParent && config.inheritable === true)
      {
        if (variant === "refresh" || variant === "style" || variant === "set" || variant == "reset")
        {
          code.add('if(computed===qx.core.Property.INHERIT||computed===undefined){');

          if (variant === "refresh")
          {
            code.add('computed=value;');
          }
          else
          {
            // TODO: when "parent" is a new style property we can replace
            // getParent with the faster __computed$parent
            code.add('var pa=this.getParent();if(pa)computed=pa', computedBase, ';');
          }

          code.add('}');
        }
      }

      // Hint: No toggle() here, toggle only allows true/false user value and no inherit
      // Hint: No init() or prepare() here, they do not need to respect inheritance because there is no parent yet.





      // [4] NORMALIZING UNDEFINED

      if (config.inheritable === true)
      {
        // Normalize 'undefined' to 'inherit' in inheritable properties
        code.add('if(computed===undefined)computed=qx.core.Property.INHERIT;');
      }
      else
      {
        // Normalize 'undefined' to 'null'
        code.add('if(computed===undefined)computed=null;');
      }





      // [5] STORING COMPUTED VALUE

      if (variant !== "init" && variant !== "prepare")
      {
        // Remember computed old value
        code.add('var old=', computedKey, ';');

        // Normalize 'undefined' to 'null'
        // Could only be undefined in cases when the setter was never executed before
        // Because of this we can do the following old/new check in an else case to optimize performance
        code.add('if(old===undefined)old=null;');

        // Compare old/new computed value
        code.add('else if(old===computed)return value;');

        // Inform user
        if (qx.core.Variant.isSet("qx.debug", "on"))
        {
          if (qx.core.Setting.get("qx.propertyDebugLevel") > 0) {
            code.add('this.debug("', name, ' changed: " + old + " => " + computed + " [' + variant + ']");');
          }
        }
      }

      // Store new computed value
      code.add(computedKey, '=computed;');






      // [6] NOTIFYING DEPENDEND OBJECTS

      // Execute user configured setter
      if (variant !== "prepare")
      {
        if (config.apply)
        {
          if (!(variant === "init" && config.applyInit === false))
          {
            if (variant === "init")
            {
              code.add('this.', config.apply, '(computed, null);');
            }
            else
            {
              code.add('this.', config.apply, '(computed, old);');
            }
          }
        }

        // Fire event
        if (config.event)
        {
          code.add('if(this.hasEventListeners("', config.event, '"))');
          code.add('this.dispatchEvent(new qx.event.type.ChangeEvent("', config.event, '", computed, old), true);');
        }

        // Don't fire event and not update children in init().
        // There is no chance to attach an event listener or add children before.
        if (variant !== "init")
        {
          // Refresh children
          // Require the parent/children interface
          if (members.getChildren && config.inheritable === true)
          {
            code.add('for(var i=0,a=this.getChildren(),l=a.length;i<l;i++){');
            code.add('a[i].', this.$$method.refresh[name], '(computed);');
            code.add('}');
          }
        }
      }






      // [7] RETURNING WITH ORIGINAL INCOMING VALUE

      // Return value
      if (variant !== "init" && variant !== "prepare") {
        code.add('return value;');
      }






      // Output generate code
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (qx.core.Setting.get("qx.propertyDebugLevel") > -1) {
          console.debug("Code[" + this.$$method[variant][name] + "]: " + code);
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
