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

/**
 * Internal class for handling of dynamic properties. Should only be used
 * through the methods provided by {@link qx.Class}.
 *
 * For a complete documentation of properties take a
 * look at http://qooxdoo.org/documentation/developer_manual/properties.
 *
 *
 * *Normal properties*
 *
 * The <code>properties</code> key in the class definition map of {@link qx.Class#define}
 * is used to generate the properties.
 *
 * Valid keys of a property definition are:
 *
 * <table>
 *   <tr><th>Name</th><th>Type</th><th>Description</th></tr>
 *   <tr><th>check</th><td>Array, String, Function</td><td>
 *     The check is used to validate the incoming value of a property. The check can be:
 *     <ul>
 *       <li>a custom check function. The function takes the incoming value as a parameter and must
 *           return a boolean value to indicate whether the values is valid.
 *       </li>
 *       <li>inline check code as a string e.g. <code>"value &gt; 0 && value &lt; 100"</code></li>
 *       <li>a class name e.g. <code>qx.ui.form.Button</code></li>
 *       <li>a name of an interface the value must implement, e.g. <code>qx.application.IAplpication</code></li>
 *       <li>an array of all valid values</li>
 *       <li>one of the predefined checks: Boolean, String, Number, Integer, Float, Double,
 *           Object, Array, Map, Class, Mixin, Interface, Theme, Error, RegExp, Function,
 *           Date, Node, Element, Document, Window, Event
 *       </li>
 *     <ul>
 *   </td></tr>
 *   <tr><th>init</th><td>var</td><td>
 *     Sets the default/inittial value of the property. If no property value is set or the property
 *     gets resetteed, the getter will return the <code>init</code> value.
 *   </td></tr>
 *   <tr><th>apply</th><td>String</td><td>
 *     On change of the property value the method of the specified name will be called. The signature of
 *     the method is <code>function(newValue, oldValue)</code>.
 *   </td></tr>
 *   <tr><th>event</th><td>String</td><td>
 *     On change of the property value an event with the given name will be dispached. The event type is
 *     {@link qx.event.type.ChangeEvent}.
 *   </td></tr>
 *   <tr><th>themeable</th><td>Boolean</td><td>
 *     Whether this property can be set using themes.
 *   </td></tr>
 *   <tr><th>inheritable</th><td>Boolean</td><td>
 *     Whether the property value should be inheritable. If the property does not have a user defined or an
 *     init value, the property will try to get the value from the parent of the current object.
 *   </td></tr>
 *   <tr><th>nullable</th><td>Boolean</td><td>
 *     Whether <code>null</code> is an allowed value of the property. This is complemental to the check
 *     defined using the <code>check</code> key.
 *   </td></tr>
 *   <tr><th>refine</th><td>Boolean</td><td>
 *     Whether the property definition is a refinemnet of a property in one of the super classes of the class.
 *     Only the <code>init</code> value can be changed using refine.
 *   </td></tr>
 * </table>
 *
 *
 * *Property groups*
 *
 * Property groups are defined in a similar way but support a different set of keys:
 *
 * <table>
 *   <tr><th>Name</th><th>Type</th><th>Description</th></tr>
 *   <tr><th>group</th><td>String[]</td><td>
 *     A list of property names which should be set using the propery group.
 *   </td></tr>
 *   <tr><th>mode</th><td>String</td><td>
 *     If mode is set to <code>"shorthand"</code>, the properties can be set using a CSS like shorthand mode.
 *   </td></tr>
 *   <tr><th>themeable</th><td>Boolean</td><td>
 *     Whether this property can be set using themes.
 *   </td></tr>
 * </table>
 *
 * @internal
 */
qx.Class.define("qx.core.Property",
{
  statics :
  {
    /**
     * Built-in checks
     * The keys could be used in the check of the properties
     *
     * @internal
     */
    __checks :
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
      "Date"      : 'value instanceof Date',
      "Node"      : 'value != null && value.nodeType !== undefined',
      "Element"   : 'value != null && value.nodeType === 1',
      "Document"  : 'value != null && value.nodeType === 9',
      "Window"    : 'value != null && window.document',
      "Event"     : 'value != null && value.type !== undefined',

      "Class"     : 'value != null && value.$$type === "Class"',
      "Mixin"     : 'value != null && value.$$type === "Mixin"',
      "Interface" : 'value != null && value.$$type === "Interface"',
      "Theme"     : 'value != null && value.$$type === "Theme"',

      "Color"     : 'typeof value === "string" && qx.util.ColorUtil.stringToRgb(value)',
      "Border"    : 'value != null && (qx.manager.object.BorderManager.getInstance().isDynamic(value) || value instanceof qx.renderer.border.Border)',
      "Font"      : 'value != null && (qx.manager.object.FontManager.getInstance().isDynamic(value) || value instanceof qx.renderer.font.Font)'
    },


    /**
     * Contains types from {@link #__checks} list which need to be disposed
     *
     * @internal
     */
    __dispose :
    {
      "Object"    : true,
      "Array"     : true,
      "Map"       : true,
      "Function"  : true,
      "Date"      : true,
      "Node"      : true,
      "Element"   : true,
      "Document"  : true,
      "Window"    : true,
      "Event"     : true,
      "Class"     : true,
      "Mixin"     : true,
      "Interface" : true,
      "Theme"     : true
    },


    /**
     * Inherit value, used to override defaults etc. to force inheritance
     * even if property value is not undefined (through multi-values)
     *
     * @internal
     */
    $$inherit : "inherit",


    /**
     * Undefined value, used to unstyle a property
     *
     * @internal
     */
    $$undefined : "undefined",


    /**
     * Caching field names for each property created
     *
     * @internal
     */
    $$store :
    {
      user     : {},
      theme    : {},
      computed : {},
      init     : {}
    },


    /**
     * Caching function names for each property created
     *
     * @internal
     */
    $$method :
    {
      get     : {},
      set     : {},
      reset   : {},
      init    : {},
      refresh : {},
      style   : {},
      unstyle : {},
      toggle  : {},
      is      : {}
    },


    /**
     * Supported keys for property defintions
     *
     * @internal
     */
    $$allowedKeys :
    {
      name        : "string",   // String
      inheritable : "boolean",  // Boolean
      nullable    : "boolean",  // Boolean
      themeable   : "boolean",  // Boolean
      refine      : "boolean",  // Boolean
      init        : null,       // var
      apply       : "string",   // String
      event       : "string",   // String
      check       : null        // Array, String, Function
    },

    $$allowedGroupKeys :
    {
      name        : "string",   // String
      group       : "object",   // Array
      mode        : "string",   // String
      themeable   : "boolean"   // Boolean
    },


    /**
     * Refreshes widget whose parent has changed (including the children)
     *
     * @type static
     * @internal
     * @param widget {qx.core.ui.Widget} the widget
     * @return {void}
     */
    refresh : function(widget)
    {
      var clazz = widget.constructor;
      var parent = widget.getParent();
      var get = this.$$method.get;
      var refresh = this.$$method.refresh;
      var properties;

      if (parent)
      {
        if (qx.core.Variant.isSet("qx.debug", "on"))
        {
          if (qx.core.Setting.get("qx.propertyDebugLevel") > 1) {
            widget.debug("Update widget: " + widget);
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
                if (qx.core.Variant.isSet("qx.debug", "on"))
                {
                  if (qx.core.Setting.get("qx.propertyDebugLevel") > 2) {
                    widget.debug("Updating property: " + name + " to '" + parent[get[name]]() + "'");
                  }
                }

                if (parent[get[name]]) {
                  widget[refresh[name]](parent[get[name]]());
                }
              }
            }
          }

          clazz = clazz.superclass;
        }
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
            if (config.dispose === undefined && typeof config.check === "string") {
              config.dispose = this.__dispose[config.check] || qx.Class.isDefined(config.check);
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
      var themeable = config.themeable === true;

      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (qx.core.Setting.get("qx.propertyDebugLevel") > 1) {
          console.debug("Generating property group: " + name);
        }
      }

      var setter = new qx.util.StringBuilder;
      var resetter = new qx.util.StringBuilder;

      if (themeable)
      {
        var styler = new qx.util.StringBuilder;
        var unstyler = new qx.util.StringBuilder;
      }

      var argHandler = "var a=arguments[0] instanceof Array?arguments[0]:arguments;";

      setter.add(argHandler);
      resetter.add(argHandler);

      if (themeable)
      {
        styler.add(argHandler);
        unstyler.add(argHandler);
      }

      if (config.mode == "shorthand")
      {
        var shorthand = "a=qx.lang.Array.fromShortHand(qx.lang.Array.fromArguments(a));";
        setter.add(shorthand);

        if (themeable) {
          styler.add(shorthand);
        }
      }

      for (var i=0, a=config.group, l=a.length; i<l; i++)
      {
        setter.add("this.", this.$$method.set[a[i]], "(a[", i, "]);");
        resetter.add("this.", this.$$method.reset[a[i]], "(a[", i, "]);");

        if (themeable)
        {
          styler.add("this.", this.$$method.style[a[i]], "(a[", i, "]);");
          unstyler.add("this.", this.$$method.unstyle[a[i]], "(a[", i, "]);");
        }
      }

      // Attach setter
      this.$$method.set[name] = prefix + "set" + postfix;
      members[this.$$method.set[name]] = new Function(setter.get());

      // Attach resetter
      this.$$method.reset[name] = prefix + "reset" + postfix;
      members[this.$$method.reset[name]] = new Function(resetter.get());

      if (themeable)
      {
        // Attach styler
        this.$$method.style[name] = prefix + "style" + postfix;
        members[this.$$method.style[name]] = new Function(styler.get());

        // Attach unstyler
        this.$$method.unstyle[name] = prefix + "unstyle" + postfix;
        members[this.$$method.unstyle[name]] = new Function(unstyler.get());
      }
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
      store.theme[name] = "__theme$" + name;
      store.computed[name] = "__computed$" + name;

      method.get[name] = prefix + "get" + postfix;
      members[method.get[name]] = function() {
        return qx.core.Property.executeOptimizedGetter(this, clazz, name, "get");
      }

      method.set[name] = prefix + "set" + postfix;
      members[method.set[name]] = function(value) {
        return qx.core.Property.executeOptimizedSetter(this, clazz, name, "set", arguments);
      }

      method.reset[name] = prefix + "reset" + postfix;
      members[method.reset[name]] = function() {
        return qx.core.Property.executeOptimizedSetter(this, clazz, name, "reset");
      }

      method.init[name] = prefix + "init" + postfix;
      members[method.init[name]] = function(value) {
        return qx.core.Property.executeOptimizedSetter(this, clazz, name, "init", arguments);
      }

      if (config.inheritable === true)
      {
        method.refresh[name] = prefix + "refresh" + postfix;
        members[method.refresh[name]] = function(value) {
          return qx.core.Property.executeOptimizedSetter(this, clazz, name, "refresh", arguments);
        }
      }

      if (config.themeable === true)
      {
        method.style[name] = prefix + "style" + postfix;
        members[method.style[name]] = function(value) {
          return qx.core.Property.executeOptimizedSetter(this, clazz, name, "style", arguments);
        }

        method.unstyle[name] = prefix + "unstyle" + postfix;
        members[method.unstyle[name]] = function(value) {
          return qx.core.Property.executeOptimizedSetter(this, clazz, name, "unstyle", arguments);
        }
      }

      if (config.check === "Boolean")
      {
        method.toggle[name] = prefix + "toggle" + postfix;
        members[method.toggle[name]] = function() {
          return qx.core.Property.executeOptimizedSetter(this, clazz, name, "toggle");
        }

        method.is[name] = prefix + "is" + postfix;
        members[method.is[name]] = function() {
          return qx.core.Property.executeOptimizedGetter(this, clazz, name, "is");
        }
      }
    },


    /**
     * Compiles a string builder object to a function, executes the function and
     * returns the return value.
     *
     * @type static
     * @internal
     * @param instance {Object} Instance which have called the original method
     * @param members {Object} Prototype members map where the new function should be stored
     * @param name {String} Name of the property
     * @param variant {String} Function variant e.g. get, set, reset, ...
     * @param code {qx.util.StringBuilder} string builder instance which contains the code
     * @param value {var ? null} Optional value to call function with
     * @return {var} Return value of the generated function
     */
    __unwrapFunctionFromCode : function(instance, members, name, variant, code, args)
    {
      // Output generate code
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (qx.core.Setting.get("qx.propertyDebugLevel") > 1) {
          console.debug("Code[" + this.$$method[variant][name] + "]: " + code);
        }
      }

      // Overriding temporary wrapper
      try{
        members[this.$$method[variant][name]] = new Function("value", code.toString());
      } catch(ex) {
        alert("Malformed generated code to unwrap method: " + this.$$method[variant][name] + "\n" + code);
      }

      // Clearing string builder
      code.clear();

      // Executing new function
      if (args === undefined) {
        return instance[this.$$method[variant][name]]();
      } else if (qx.core.Variant.isSet("qx.debug", "on")) {
        return instance[this.$$method[variant][name]].apply(instance, args);
      } else {
        return instance[this.$$method[variant][name]](args[0]);
      }
    },


    /**
     * Generates the optimized getter
     * Supported variants: get
     *
     * @type static
     * @internal
     * @param instance {Object} the instance which calls the method
     * @param clazz {Class} the class which originally defined the property
     * @param name {String} name of the property
     * @param variant {String} Method variant.
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
        code.add('return qx.core.Property.$$inherit;');
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
     * @param instance {Object} the instance which calls the method
     * @param clazz {Class} the class which originally defined the property
     * @param name {String} name of the property
     * @param variant {String} Method variant.
     * @param value {var ? null} Optional value to send to newly created method
     * @return {var} Execute return value of apply generated function, generally the incoming value
     */
    executeOptimizedSetter : function(instance, clazz, name, variant, args)
    {
      var config = clazz.$$properties[name];
      var members = clazz.prototype;
      var value = args ? args[0] : undefined;

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
          var store = this.$$store.theme[name];
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

          // Check argument length
          if (qx.core.Variant.isSet("qx.debug", "on")) {
            code.add('if(arguments.length!==1)throw new Error("The method of the property ', name,  ' by using ', this.$$method[variant][name], '() requires exactly one argument!");');
          }

          // Allow to unstyle themeable properties by explicit "undefined" string value
          if (variant === "style") {
            code.add('if(value===qx.core.Property.$$undefined)value=undefined;');
          }
          
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
              if (config.nullable) 
              {
                if (variant === "style") {
                  code.add('if(value!=null)'); // allow both undefined and null
                } else {
                  code.add('if(value!==null)') // allow null
                }
              }
              else if (variant === "style")
              {
                code.add('if(value!==undefined)'); // allow undefined
              }

              // Inheritable properties always accept "inherit" as value
              if (config.inheritable) {
                code.add('if(value!==qx.core.Property.$$inherit)');
              }

              code.add('if(');

              if (this.__checks[config.check] !== undefined)
              {
                code.add('!(', this.__checks[config.check], ')');
              }
              else if (qx.Class.isDefined(config.check))
              {
                code.add('!(value instanceof ', config.check, ')');
              }
              else if (qx.Interface.isDefined(config.check))
              {
                code.add('!(value && qx.Class.hasInterface(value.constructor, ', config.check, '))');
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
      else if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (variant === "init")
        {
          // Additional debugging to block values for init() functions
          // which have a init value defined at property level
          code.add('if(arguments.length!==0)throw new Error("You are not able to change the init value of the property ', name,  ' by using ', this.$$method[variant][name], '()!");');
        }
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

        // Try to use themeable value when available
        if (config.themeable === true)
        {
          if (hasComputeIf) {
            code.add('else ');
          }

          code.add('if(this.', this.$$store.theme[name], '!==undefined)');
          code.add('computed=this.', this.$$store.theme[name], ';');
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
          code.add('if(computed===qx.core.Property.$$inherit||computed===undefined){');

          if (variant === "refresh")
          {
            code.add('computed=value;');
          }
          else
          {
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
        code.add('if(computed===undefined)computed=qx.core.Property.$$inherit;');
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
        code.add('var a=this.getChildren();if(a)for(var i=0,l=a.length;i<l;i++){');
        code.add('if(a[i].', this.$$method.refresh[name], ')a[i].', this.$$method.refresh[name], '(computed);');
        code.add('}');
      }






      // [8] RETURNING WITH ORIGINAL INCOMING VALUE

      // Return value
      if (variant !== "reset" && variant !== "unstyle") {
        code.add('return value;');
      }






      return this.__unwrapFunctionFromCode(instance, members, name, variant, code, args);
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
