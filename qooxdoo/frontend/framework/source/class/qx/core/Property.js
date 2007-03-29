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
      "Boolean"   : 'typeof value === "boolean"',
      "String"    : 'typeof value === "string"',

      "Number"    : '!isNaN(value)',
      "Integer"   : '!isNaN(value) && value%1 == 0',
      "Float"     : '!isNaN(value)',
      "Double"    : '!isNaN(value)',

      "Error"     : 'value instanceof Error',
      "RegExp"    : 'value instanceof RegExp',

      "Object"    : 'value !== null && typeof value === "object"',
      "Array"     : 'value instanceof Array',
      "Map"       : 'value !== null && typeof value === "object" && !(value instanceof Array) && !(value instanceof qx.core.Object)',

      "Function"  : 'value instanceof Function',
      "Date"      : 'value instanceof Data',
      "Node"      : 'value != null && value.nodeType !== undefined',
      "Element"   : 'value != null && value.nodeType === 1',
      "Document"  : 'value != null && value.nodeType === 9',
      "Window"    : 'value != null && window.document',
      "Event"     : 'value != null && value.type !== undefined',

      "Class"     : 'value != null && value.$$type === "Class"',
      "Mixin"     : 'value != null && value.$$type === "Mixin"',
      "Interface" : 'value != null && value.$$type === "Interface"',
      "Theme"     : 'value != null && value.$$type === "Theme"'
    },

    DISPOSE :
    {
      "Object" : true,
      "Array"  : true,
      "Map"    : true
    },

    $$store :
    {
      user     : {},
      style    : {},
      computed : {},
      init     : {}
    },

    $$method :
    {
      get     : {},
      set     : {},
      reset   : {},
      init    : {},
      refresh : {},
      style   : {},
      unstyle : {},
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
      var store = this.$$store.computed;
      var refresh = this.$$method.refresh;
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
            if (properties[name].inheritable)
            {
              value = parent[store[name]];

              if (qx.core.Variant.isSet("qx.debug", "on"))
              {
                if (qx.core.Setting.get("qx.propertyDebugLevel") > 2) {
                  widget.debug("Updating property: " + name + " to '" + value + "'");
                }
              }

              widget[refresh[name]](value);
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

            // Fill dispose value
            if (config.dispose === undefined && this.DISPOSE[config.check]) {
              config.dispose = true;
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

      var code = this.$$code;

      if (!code) {
        code = this.$$code = new qx.util.StringBuilder;
      }

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

      // Clearing string builder
      code.clear();
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
      var store = this.$$store;

      store.user[name] = "__user$" + name;
      store.init[name] = "__init$" + name;
      store.style[name] = "__style$" + name;
      store.computed[name] = "__computed$" + name;

      method.get[name] = prefix + "get" + postfix;
      members[method.get[name]] = function() {
        return qx.core.Property.executeOptimizedGetter(this, clazz, name, "get");
      }

      method.set[name] = prefix + "set" + postfix;
      members[method.set[name]] = function(value) {
        return qx.core.Property.executeOptimizedSetter(this, clazz, name, "set", value);
      }

      method.reset[name] = prefix + "reset" + postfix;
      members[method.reset[name]] = function() {
        return qx.core.Property.executeOptimizedSetter(this, clazz, name, "reset");
      }

      method.init[name] = prefix + "init" + postfix;
      members[method.init[name]] = function(value) {
        return qx.core.Property.executeOptimizedSetter(this, clazz, name, "init", value);
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

        method.unstyle[name] = prefix + "unstyle" + postfix;
        members[method.unstyle[name]] = function(value) {
          return qx.core.Property.executeOptimizedSetter(this, clazz, name, "unstyle", value);
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


    __unwrapFunctionFromCode : function(instance, members, name, variant, code, value)
    {
      // Output generate code
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (qx.core.Setting.get("qx.propertyDebugLevel") > 1) {
          console.debug("Code[" + this.$$method[variant][name] + "]: " + code);
        }
      }

      // Overriding temporary wrapper
      members[this.$$method[variant][name]] = new Function("value", code.toString());

      // Clearing string builder
      code.clear();

      // Executing new function
      return instance[this.$$method[variant][name]](value);
    },


    /**
     * Generates the optimized getter
     * Supported variants: get
     *
     * @type static
     * @internal
     * @return {var} Execute return value of apply generated function, generally the incoming value
     */
    executeOptimizedGetter : function(instance, clazz, name, variant)
    {
      var config = clazz.$$properties[name];
      var members = clazz.prototype;

      var code = this.$$code;
      if (!code) {
        code = this.$$code = new qx.util.StringBuilder;
      }

      code.add('if(this.', this.$$store.computed[name], '===undefined)');

      if (config.init !== undefined) {
        code.add('return this.', this.$$store.init[name], ';');
      } else if (config.inheritable) {
        code.add('return qx.core.Property.INHERIT;');
      } else if (config.nullable) {
        code.add('return null;');
      } else {
        code.add('throw new Error("Property ', name, ' of an instance of ', clazz.classname, ' is not (yet) ready!");');
      }

      code.add('return this.', this.$$store.computed[name], ';');

      return this.__unwrapFunctionFromCode(instance, members, name, variant, code);
    },


    /**
     * Generates the optimized setter
     * Supported variants: set, reset, init, refresh, style, unstyle, toggle
     *
     * @type static
     * @internal
     * @return {var} Execute return value of apply generated function, generally the incoming value
     */
    executeOptimizedSetter : function(instance, clazz, name, variant, value)
    {
      var config = clazz.$$properties[name];
      var members = clazz.prototype;

      var code = this.$$code;
      if (!code) {
        code = this.$$code = new qx.util.StringBuilder;
      }



      // [1] PRE CONDITIONS

      if (variant === "init") {
        code.add('if(this.$$initialized)throw new Error("Could not change or apply init value after constructing phase!");');
      }




      // [2] CHECKING & STORING INCOMING VALUE

      // Hint: No refresh() here, the value of refresh is the parent value
      if (variant === "set" || variant === "reset" || variant === "style" || variant === "unstyle" || variant === "toggle" || (variant === "init" && config.init === undefined))
      {
        if (variant === "style" || variant === "unstyle") {
          var store = this.$$store.style[name];
        } else if (variant === "init") {
          var store = this.$$store.init[name];
        } else {
          var store = this.$$store.user[name];
        }

        if (variant === "set" || variant === "style" || variant === "init")
        {
          // Undefined check
          // Must be above the comparision between old and new, because otherwise previously unset
          // values get not detected and will be quitely ignored which is a bad behavior.
          code.add('if(value===undefined)');
          code.add('throw new Error("Undefined value for property ', name, ' is not allowed!");');

          // Old/new comparision
          code.add('if(this.', store, '===value)return value;');

          // Enable checks in setter and in style and init method if debugging is enabled
          if (variant === "set" || (qx.core.Variant.isSet("qx.debug", "on") && (variant === "style" || variant === "init")))
          {
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
                code.add('.checkMap[value]===undefined');
              }
              else
              {
                throw new Error("Could not add check to property " + name + " of class " + clazz.classname);
              }

              code.add(')throw new Error("Invalid value for property ', name, ': " + value);');
            }
          }
        }
        else if (variant === "toggle")
        {
          // Toggle value (Replace eventually incoming value for setter etc.)
          code.add('value=!this.', this.$$store.computed[name], ';');
        }
        else if (variant === "reset" || variant === "unstyle")
        {
          // Remove value
          code.add('value=undefined;');
        }

        code.add('this.', store, '=value;');
      }
      else if (variant === "init" && qx.core.Variant.isSet("qx.debug", "on"))
      {
        // Additional debugging to block values for init() functions
        // which have a init value defined at property level
        code.add('if(value!==undefined)throw new Error("You are not able to change the init value of the property ', name,  ' by using ', this.$$method[variant][name], '()!");');
      }





      // [3] GENERATING COMPUTED VALUE

      // In both variants, set and toggle, the value is always the user value and is
      // could not be undefined. This way we are sure we can use this value and don't
      // need a complex logic to find the usable value. (See else case)

      // Use complex evaluation for reset, refresh and style
      if (variant === "refresh" || variant === "reset" || variant === "style" || variant === "unstyle" || variant === "init")
      {
        code.add('var computed;');

        var hasComputeIf = false;

        // Try to use user value when available
        // Hint: Always undefined in reset variant
        if (variant !== "reset")
        {
          code.add('if(this.', this.$$store.user[name], '!==undefined)');
          code.add('computed=this.', this.$$store.user[name], ';');
          hasComputeIf = true;
        }

        // Try to use appearance value when available
        if (config.appearance === true)
        {
          if (hasComputeIf) {
            code.add('else ');
          }

          code.add('if(this.', this.$$store.style[name], '!==undefined)');
          code.add('computed=this.', this.$$store.style[name], ';');
          hasComputeIf = true;
        }

        // Try to use initial value when available
        // Hint: This may also be available even if not defined at declaration time
        // because of the possibility to set the init value of properties
        // without init value at construction time (for complex values like arrays etc.)
        if (hasComputeIf) {
          code.add('else ');
        }

        code.add('computed=this.', this.$$store.init[name], ';');
      }

      // Use simple evaluation for set and toggle
      else
      {
        code.add('var computed=value;');
      }






      // [4] RESPECTING INHERITANCE

      // Require the parent/children interface

      if (members.getParent && config.inheritable === true)
      {
        if (variant === "set" || variant == "reset" || variant === "refresh" || variant === "style" || variant === "unstyle" || variant === "init")
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
            code.add('var pa=this.getParent();if(pa)computed=pa.', this.$$store.computed[name], ';');
          }

          code.add('}');
        }

        // Hint: No toggle() here, toggle only allows true/false user value and no inherit
      }






      // [5] NORMALIZING UNDEFINED

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





      // [6] STORING COMPUTED VALUE

      // Remember computed old value
      code.add('var old=this.', this.$$store.computed[name], ';');

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

      // Store new computed value
      code.add('this.', this.$$store.computed[name], '=computed;');






      // [7] NOTIFYING DEPENDEND OBJECTS

      // Execute user configured setter
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

      // Refresh children
      // Require the parent/children interface
      if (members.getChildren && config.inheritable === true)
      {
        code.add('for(var i=0,a=this.getChildren(),l=a.length;i<l;i++){');
        code.add('a[i].', this.$$method.refresh[name], '(computed);');
        code.add('}');
      }






      // [8] RETURNING WITH ORIGINAL INCOMING VALUE

      // Return value
      if (variant !== "reset" && variant !== "unstyle") {
        code.add('return value;');
      }






      return this.__unwrapFunctionFromCode(instance, members, name, variant, code, value);
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
