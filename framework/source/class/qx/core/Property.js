/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

#optional(qx.Interface)
#use(qx.event.type.Data)
#use(qx.event.dispatch.Direct)

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
 *       <li>a name of an interface the value must implement</li>
 *       <li>an array of all valid values</li>
 *       <li>one of the predefined checks: Boolean, String, Number, Integer, Float, Double,
 *           Object, Array, Map, Class, Mixin, Interface, Theme, Error, RegExp, Function,
 *           Date, Node, Element, Document, Window, Event
 *       </li>
 *     <ul>
 *   </td></tr>
 *   <tr><th>init</th><td>var</td><td>
 *     Sets the default/initial value of the property. If no property value is set or the property
 *     gets reset, the getter will return the <code>init</code> value.
 *   </td></tr>
 *   <tr><th>apply</th><td>String</td><td>
 *     On change of the property value the method of the specified name will be called. The signature of
 *     the method is <code>function(newValue, oldValue)</code>.
 *   </td></tr>
 *   <tr><th>event</th><td>String</td><td>
 *     On change of the property value an event with the given name will be dispached. The event type is
 *     {@link qx.event.type.Data}.
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
 *   <tr><th>transform</th><td>String</td><td>
 *     On setting of the property value the method of the specified name will
 *     be called. The signature of the method is <code>function(value)</code>.
 *     The parameter <code>value</code> is the value passed to the setter.
 *     The function must return the modified or unmodified value.
 *     Transformation occurs before the check function, so both may be
 *     specified if desired.  Alternatively, the transform function may throw
 *     an error if the value passed to it is invalid.
 *   </td></tr>
 * </table>
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
     */
    __checks :
    {
      "Boolean"   : 'qx.core.Assert.assertBoolean(value, msg) || true',
      "String"    : 'qx.core.Assert.assertString(value, msg) || true',

      "Number"    : 'qx.core.Assert.assertNumber(value, msg) || true',
      "Integer"   : 'qx.core.Assert.assertInteger(value, msg) || true',
      "PositiveNumber" : 'qx.core.Assert.assertPositiveNumber(value, msg) || true',
      "PositiveInteger" : 'qx.core.Assert.assertPositiveInteger(value, msg) || true',

      "Error"     : 'qx.core.Assert.assertInstance(value, Error, msg) || true',
      "RegExp"    : 'qx.core.Assert.assertInstance(value, RegExp, msg) || true',

      "Object"    : 'qx.core.Assert.assertObject(value, msg) || true',
      "Array"     : 'qx.core.Assert.assertArray(value, msg) || true',
      "Map"       : 'qx.core.Assert.assertMap(value, msg) || true',

      "Function"  : 'qx.core.Assert.assertFunction(value, msg) || true',
      "Date"      : 'qx.core.Assert.assertInstance(value, Date, msg) || true',
      "Node"      : 'value !== null && value.nodeType !== undefined',
      "Element"   : 'value !== null && value.nodeType === 1 && value.attributes',
      "Document"  : 'value !== null && value.nodeType === 9 && value.documentElement',
      "Window"    : 'value !== null && value.document',
      "Event"     : 'value !== null && value.type !== undefined',

      "Class"     : 'value !== null && value.$$type === "Class"',
      "Mixin"     : 'value !== null && value.$$type === "Mixin"',
      "Interface" : 'value !== null && value.$$type === "Interface"',
      "Theme"     : 'value !== null && value.$$type === "Theme"',

      "Color"     : '(typeof value === "string" || value instanceof String) && qx.util.ColorUtil.isValidPropertyValue(value)',
      "Decorator" : 'value !== null && qx.theme.manager.Decoration.getInstance().isValidPropertyValue(value)',
      "Font"      : 'value !== null && qx.theme.manager.Font.getInstance().isDynamic(value)'
    },


    /**
     * Contains types from {@link #__checks} list which need to be disposed
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
      "Theme"     : true,
      "Font"      : true,
      "Decorator" : true
    },


    /**
     * Inherit value, used to override defaults etc. to force inheritance
     * even if property value is not undefined (through multi-values)
     *
     * @internal
     */
    $$inherit : "inherit",


    /**
     * Caching field names for each property created
     *
     * @internal
     */
    $$store :
    {
      runtime : {},
      user    : {},
      theme   : {},
      inherit : {},
      init    : {},
      useinit : {}
    },


    /**
     * Caching function names for each property created
     *
     * @internal
     */
    $$method :
    {
      get          : {},
      set          : {},
      reset        : {},
      init         : {},
      refresh      : {},
      setRuntime   : {},
      resetRuntime : {},
      setThemed    : {},
      resetThemed  : {}
    },


    /**
     * Supported keys for property defintions
     *
     * @internal
     */
    $$allowedKeys :
    {
      name         : "string",   // String
      dispose      : "boolean",  // Boolean
      inheritable  : "boolean",  // Boolean
      nullable     : "boolean",  // Boolean
      themeable    : "boolean",  // Boolean
      refine       : "boolean",  // Boolean
      init         : null,       // var
      apply        : "string",   // String
      event        : "string",   // String
      check        : null,       // Array, String, Function
      transform    : "string",   // String
      deferredInit : "boolean"   // Boolean
    },


    /**
     * Supported keys for property group definitions
     *
     * @internal
     */
    $$allowedGroupKeys :
    {
      name      : "string",   // String
      group     : "object",   // Array
      mode      : "string",   // String
      themeable : "boolean"   // Boolean
    },


    /** Contains names of inheritable properties, filled by {@link qx.Class.define} */
    $$inheritable : {},


    /**
     * Refreshes widget whose parent has changed (including the children)
     *
     * @param widget {qx.ui.core.Widget} the widget
     * @return {void}
     */
    refresh : function(widget)
    {
      var parent = widget.getLayoutParent();

      if (parent)
      {
        var clazz = widget.constructor;
        var inherit = this.$$store.inherit;
        var init = this.$$store.init;
        var refresh = this.$$method.refresh;
        var properties;
        var value;

        if (qx.core.Variant.isSet("qx.debug", "on"))
        {
          if (qx.core.Setting.get("qx.propertyDebugLevel") > 1) {
            widget.debug("Update property inheritance");
          }
        }

        while(clazz)
        {
          properties = clazz.$$properties;

          if (properties)
          {
            for (var name in this.$$inheritable)
            {
              // Whether the property is available in this class
              // and whether it is inheritable in this class as well
              if (properties[name] && widget[refresh[name]])
              {
                value = parent[inherit[name]];

                if (value === undefined) {
                  value = parent[init[name]];
                }

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
      }
    },


    /**
     * Attach properties to class prototype
     *
     * @param clazz {Class} Class to attach properties to
     * @return {void}
     */
    attach : function(clazz)
    {
      var properties = clazz.$$properties;

      if (properties)
      {
        for (var name in properties) {
          this.attachMethods(clazz, name, properties[name]);
        }
      }

      clazz.$$propertiesAttached = true;
    },


    /**
     * Attach one property to class
     *
     * @param clazz {Class} Class to attach properties to
     * @param name {String} Name of property
     * @param config {Map} Configuration map of property
     * @return {void}
     */
    attachMethods : function(clazz, name, config)
    {
      // Divide groups from "normal" properties
      config.group ?
        this.__attachGroupMethods(clazz, config, name) :
        this.__attachPropertyMethods(clazz, config, name);
    },


    /**
     * Attach group methods
     *
     * @param clazz {Class} Class to attach properties to
     * @param config {Map} Property configuration
     * @param name {String} Name of the property
     * @return {void}
     */
    __attachGroupMethods : function(clazz, config, name)
    {
      var upname = qx.lang.String.firstUp(name);
      var members = clazz.prototype;
      var themeable = config.themeable === true;

      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (qx.core.Setting.get("qx.propertyDebugLevel") > 1) {
          qx.log.Logger.debug("Generating property group: " + name);
        }
      }

      var setter = [];
      var resetter = [];

      if (themeable)
      {
        var styler = [];
        var unstyler = [];
      }

      var argHandler = "var a=arguments[0] instanceof Array?arguments[0]:arguments;";

      setter.push(argHandler);

      if (themeable) {
        styler.push(argHandler);
      }

      if (config.mode == "shorthand")
      {
        var shorthand = "a=qx.lang.Array.fromShortHand(qx.lang.Array.fromArguments(a));";
        setter.push(shorthand);

        if (themeable) {
          styler.push(shorthand);
        }
      }

      for (var i=0, a=config.group, l=a.length; i<l; i++)
      {
        if (qx.core.Variant.isSet("qx.debug", "on"))
        {
          if (!this.$$method.set[a[i]]||!this.$$method.reset[a[i]]) {
            throw new Error("Cannot create property group '" + name + "' including non-existing property '" + a[i] + "'!");
          }
        }

        setter.push("this.", this.$$method.set[a[i]], "(a[", i, "]);");
        resetter.push("this.", this.$$method.reset[a[i]], "();");

        if (themeable)
        {
          if (qx.core.Variant.isSet("qx.debug", "on"))
          {
            if (!this.$$method.setThemed[a[i]]) {
              throw new Error("Cannot add the non themable property '" + a[i] + "' to the themable property group '"+ name +"'");
            }
          }

          styler.push("this.", this.$$method.setThemed[a[i]], "(a[", i, "]);");
          unstyler.push("this.", this.$$method.resetThemed[a[i]], "();");
        }
      }

      // Attach setter
      this.$$method.set[name] = "set" + upname;
      members[this.$$method.set[name]] = new Function(setter.join(""));

      // Attach resetter
      this.$$method.reset[name] = "reset" + upname;
      members[this.$$method.reset[name]] = new Function(resetter.join(""));

      if (themeable)
      {
        // Attach styler
        this.$$method.setThemed[name] = "setThemed" + upname;
        members[this.$$method.setThemed[name]] = new Function(styler.join(""));

        // Attach unstyler
        this.$$method.resetThemed[name] = "resetThemed" + upname;
        members[this.$$method.resetThemed[name]] = new Function(unstyler.join(""));
      }
    },


    /**
     * Attach property methods
     *
     * @param clazz {Class} Class to attach properties to
     * @param config {Map} Property configuration
     * @param name {String} Name of the property
     * @return {void}
     */
    __attachPropertyMethods : function(clazz, config, name)
    {
      var upname = qx.lang.String.firstUp(name);
      var members = clazz.prototype;

      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (qx.core.Setting.get("qx.propertyDebugLevel") > 1) {
          qx.log.Logger.debug("Generating property wrappers: " + name);
        }
      }

      // Fill dispose value
      if (config.dispose === undefined && typeof config.check === "string") {
        config.dispose = this.__dispose[config.check] || qx.Class.isDefined(config.check) || qx.Interface.isDefined(config.check);
      }

      var method = this.$$method;
      var store = this.$$store;

      store.runtime[name] = "$$runtime_" + name;
      store.user[name] = "$$user_" + name;
      store.theme[name] = "$$theme_" + name;
      store.init[name] = "$$init_" + name;
      store.inherit[name] = "$$inherit_" + name;
      store.useinit[name] = "$$useinit_" + name;

      method.get[name] = "get" + upname;
      members[method.get[name]] = function() {
        return qx.core.Property.executeOptimizedGetter(this, clazz, name, "get");
      }

      method.set[name] = "set" + upname;
      members[method.set[name]] = function(value) {
        return qx.core.Property.executeOptimizedSetter(this, clazz, name, "set", arguments);
      }

      method.reset[name] = "reset" + upname;
      members[method.reset[name]] = function() {
        return qx.core.Property.executeOptimizedSetter(this, clazz, name, "reset");
      }

      if (config.inheritable || config.apply || config.event || config.deferredInit)
      {
        method.init[name] = "init" + upname;
        members[method.init[name]] = function(value) {
          return qx.core.Property.executeOptimizedSetter(this, clazz, name, "init", arguments);
        }
      }

      if (config.inheritable)
      {
        method.refresh[name] = "refresh" + upname;
        members[method.refresh[name]] = function(value) {
          return qx.core.Property.executeOptimizedSetter(this, clazz, name, "refresh", arguments);
        }
      }

      method.setRuntime[name] = "setRuntime" + upname;
      members[method.setRuntime[name]] = function(value) {
        return qx.core.Property.executeOptimizedSetter(this, clazz, name, "setRuntime", arguments);
      }

      method.resetRuntime[name] = "resetRuntime" + upname;
      members[method.resetRuntime[name]] = function() {
        return qx.core.Property.executeOptimizedSetter(this, clazz, name, "resetRuntime");
      }

      if (config.themeable)
      {
        method.setThemed[name] = "setThemed" + upname;
        members[method.setThemed[name]] = function(value) {
          return qx.core.Property.executeOptimizedSetter(this, clazz, name, "setThemed", arguments);
        }

        method.resetThemed[name] = "resetThemed" + upname;
        members[method.resetThemed[name]] = function() {
          return qx.core.Property.executeOptimizedSetter(this, clazz, name, "resetThemed");
        }
      }

      if (config.check === "Boolean")
      {
        members["toggle" + upname] = new Function("return this." + method.set[name] + "(!this." + method.get[name] + "())");
        members["is" + upname] = new Function("return this." + method.get[name] + "()");
      }
    },


    /** {Map} Internal data field for error messages used by {@link #error} */
    __errors :
    {
      0 : 'Could not change or apply init value after constructing phase!',
      1 : 'Requires exactly one argument!',
      2 : 'Undefined value is not allowed!',
      3 : 'Does not allow any arguments!',
      4 : 'Null value is not allowed!',
      5 : 'Is invalid!'
    },


    /**
     * Error method used by the property system to report errors.
     *
     * @param obj {qx.core.Object} Any qooxdoo object
     * @param id {Integer} Numeric error identifier
     * @param property {String} Name of the property
     * @param variant {String} Name of the method variant e.g. "set", "reset", ...
     * @param value {var} Incoming value
     */
    error : function(obj, id, property, variant, value)
    {
      var classname = obj.constructor.classname;
      var msg = "Error in property " + property + " of class " + classname +
        " in method " + this.$$method[variant][property] + " with incoming value '" + value + "': ";

      throw new Error(msg + (this.__errors[id] || "Unknown reason: " + id));
    },


    /**
     * Compiles a string builder object to a function, executes the function and
     * returns the return value.
     *
     * @param instance {Object} Instance which have called the original method
     * @param members {Object} Prototype members map where the new function should be stored
     * @param name {String} Name of the property
     * @param variant {String} Function variant e.g. get, set, reset, ...
     * @param code {Array} Array which contains the code
     * @param args {arguments} Incoming arguments of wrapper method
     * @return {var} Return value of the generated function
     */
    __unwrapFunctionFromCode : function(instance, members, name, variant, code, args)
    {
      var store = this.$$method[variant][name];

      // Output generate code
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (qx.core.Setting.get("qx.propertyDebugLevel") > 1) {
          qx.log.Logger.debug("Code[" + this.$$method[variant][name] + "]: " + code.join(""));
        }

        // Overriding temporary wrapper
        try{
          members[store] = new Function("value", code.join(""));
        } catch(ex) {
          alert("Malformed generated code to unwrap method: " + this.$$method[variant][name] + "\n" + code.join(""));
        }
      }
      else
      {
        members[store] = new Function("value", code.join(""));
      }

      // Enable profiling code
      if (qx.core.Variant.isSet("qx.aspects", "on")) {
        members[store] = qx.core.Aspect.wrap(instance.classname + "." + store, members[store], "property");
      }

      // Executing new function
      if (args === undefined) {
        return instance[store]();
      } else if (qx.core.Variant.isSet("qx.debug", "on")) {
        return instance[store].apply(instance, args);
      } else {
        return instance[store](args[0]);
      }
    },


    /**
     * Generates the optimized getter
     * Supported variants: get
     *
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
      var code = [];
      var store = this.$$store;

      code.push('if(this.', store.runtime[name], '!==undefined)');
      code.push('return this.', store.runtime[name], ';');

      if (config.inheritable)
      {
        code.push('else if(this.', store.inherit[name], '!==undefined)');
        code.push('return this.', store.inherit[name], ';');
        code.push('else ');
      }

      code.push('if(this.', store.user[name], '!==undefined)');
      code.push('return this.', store.user[name], ';');

      if (config.themeable)
      {
        code.push('else if(this.', store.theme[name], '!==undefined)');
        code.push('return this.', store.theme[name], ';');
      }

      if (config.deferredInit && config.init === undefined)
      {
        code.push('else if(this.', store.init[name], '!==undefined)');
        code.push('return this.', store.init[name], ';');
      }

      code.push('else ');

      if (config.init !== undefined)
      {
        if (config.inheritable)
        {
          code.push('var init=this.', store.init[name], ';');

          if (config.nullable) {
            code.push('if(init==qx.core.Property.$$inherit)init=null;');
          } else if (config.init !== undefined) {
            code.push('return this.', store.init[name], ';');
          } else {
            code.push('if(init==qx.core.Property.$$inherit)throw new Error("Inheritable property ', name, ' of an instance of ', clazz.classname, ' is not (yet) ready!");');
          }

          code.push('return init;');
        }
        else
        {
          code.push('return this.', store.init[name], ';');
        }
      }
      else if (config.inheritable || config.nullable) {
        code.push('return null;');
      } else {
        code.push('throw new Error("Property ', name, ' of an instance of ', clazz.classname, ' is not (yet) ready!");');
      }

      return this.__unwrapFunctionFromCode(instance, members, name, variant, code);
    },


    /**
     * Generates the optimized setter
     * Supported variants: set, reset, init, refresh, style, unstyle
     *
     * @param instance {Object} the instance which calls the method
     * @param clazz {Class} the class which originally defined the property
     * @param name {String} name of the property
     * @param variant {String} Method variant.
     * @param args {arguments} Incoming arguments of wrapper method
     * @return {var} Execute return value of apply generated function, generally the incoming value
     */
    executeOptimizedSetter : function(instance, clazz, name, variant, args)
    {
      var config = clazz.$$properties[name];
      var members = clazz.prototype;
      var code = [];

      var incomingValue = variant === "set" || variant === "setThemed" || variant === "setRuntime" || (variant === "init" && config.init === undefined);
      var resetValue = variant === "reset" || variant === "resetThemed" || variant === "resetRuntime";
      var hasCallback = config.apply || config.event || config.inheritable;

      if (variant === "setRuntime" || variant === "resetRuntime") {
        var store = this.$$store.runtime[name];
      } else if (variant === "setThemed" || variant === "resetThemed") {
        var store = this.$$store.theme[name];
      } else if (variant === "init") {
        var store = this.$$store.init[name];
      } else {
        var store = this.$$store.user[name];
      }






      // [2] PRE CONDITIONS

      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        code.push('var prop=qx.core.Property;');

        if (variant === "init") {
          code.push('if(this.$$initialized)prop.error(this,0,"', name, '","', variant, '",value);');
        }

        if (variant === "refresh")
        {
          // do nothing
          // refresh() is internal => no arguments test
          // also note that refresh() supports "undefined" values
        }
        else if (incomingValue)
        {
          // Check argument length
          code.push('if(arguments.length!==1)prop.error(this,1,"', name, '","', variant, '",value);');

          // Undefined check
          code.push('if(value===undefined)prop.error(this,2,"', name, '","', variant, '",value);');
        }
        else
        {
          // Check argument length
          code.push('if(arguments.length!==0)prop.error(this,3,"', name, '","', variant, '",value);');
        }
      }
      else
      {
        if (!config.nullable || config.check || config.inheritable) {
          code.push('var prop=qx.core.Property;');
        }

        // Undefined check
        if (variant === "set") {
          code.push('if(value===undefined)prop.error(this,2,"', name, '","', variant, '",value);');
        }
      }





      // [3] PREPROCESSING INCOMING VALUE

      if (incomingValue)
      {
        // Call user-provided transform method, if one is provided.  Transform
        // method should either throw an error or return the new value.
        if (config.transform) {
          code.push('value=this.', config.transform, '(value);');
        }
      }






      // [4] COMPARING (LOCAL) NEW AND OLD VALUE

      // Old/new comparision
      if (hasCallback)
      {
        if (incomingValue) {
          code.push('if(this.', store, '===value)return value;');
        } else if (resetValue) {
          code.push('if(this.', store, '===undefined)return;');
        }
      }






      // [5] CHECKING VALUE

      if (config.inheritable) {
        code.push('var inherit=prop.$$inherit;');
      }

      // Enable checks in debugging mode or then generating the setter

      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (incomingValue)
        {
          // Null check
          if (!config.nullable) {
            code.push('if(value===null)prop.error(this,4,"', name, '","', variant, '",value);');
          }

          // Processing check definition
          if (config.check !== undefined)
          {
            code.push('var msg = "Invalid incoming value for property \''+name+'\' of class \'' + clazz.classname + '\'";');

            // Accept "null"
            if (config.nullable) {
              code.push('if(value!==null)');
            }

            // Inheritable properties always accept "inherit" as value
            if (config.inheritable) {
              code.push('if(value!==inherit)');
            }

            code.push('if(');

            if (this.__checks[config.check] !== undefined)
            {
              code.push('!(', this.__checks[config.check], ')');
            }
            else if (qx.Class.isDefined(config.check))
            {
              code.push('qx.core.Assert.assertInstance(value, qx.Class.getByName("', config.check, '"), msg)');
            }
            else if (qx.Interface && qx.Interface.isDefined(config.check))
            {
              code.push('qx.core.Assert.assertInterface(value, qx.Interface.getByName("', config.check, '"), msg)');
            }
            else if (typeof config.check === "function")
            {
              code.push('!', clazz.classname, '.$$properties.', name);
              code.push('.check.call(this, value)');
            }
            else if (typeof config.check === "string")
            {
              code.push('!(', config.check, ')');
            }
            else if (config.check instanceof Array)
            {
              code.push('qx.core.Assert.assertInArray(value, ', clazz.classname, '.$$properties.', name, '.check, msg)');
            }
            else
            {
              throw new Error("Could not add check to property " + name + " of class " + clazz.classname);
            }

            code.push(')prop.error(this,5,"', name, '","', variant, '",value);');
          }
        }
      }











      if (!hasCallback)
      {
        if (variant === "setRuntime")
        {
          code.push('this.', this.$$store.runtime[name], '=value;');
        }
        else if (variant === "resetRuntime")
        {
          code.push('if(this.', this.$$store.runtime[name], '!==undefined)');
          code.push('delete this.', this.$$store.runtime[name], ';');
        }
        else if (variant === "set")
        {
          code.push('this.', this.$$store.user[name], '=value;');
        }
        else if (variant === "reset")
        {
          code.push('if(this.', this.$$store.user[name], '!==undefined)');
          code.push('delete this.', this.$$store.user[name], ';');
        }
        else if (variant === "setThemed")
        {
          code.push('this.', this.$$store.theme[name], '=value;');
        }
        else if (variant === "resetThemed")
        {
          code.push('if(this.', this.$$store.theme[name], '!==undefined)');
          code.push('delete this.', this.$$store.theme[name], ';');
        }
        else if (variant === "init" && incomingValue)
        {
          code.push('this.', this.$$store.init[name], '=value;');
        }
      }
      else
      {
        if (config.inheritable)
        {
          code.push('var computed, old=this.', this.$$store.inherit[name], ';');
        }
        else
        {
          code.push('var computed, old;');
        }




        // OLD = RUNTIME VALUE

        code.push('if(this.', this.$$store.runtime[name], '!==undefined){');

        if (variant === "setRuntime")
        {
          // Replace it with new value
          code.push('computed=this.', this.$$store.runtime[name], '=value;');
        }
        else if (variant === "resetRuntime")
        {
          // Delete field
          code.push('delete this.', this.$$store.runtime[name], ';');

          // Complex compution of new value
          code.push('if(this.', this.$$store.user[name], '!==undefined)')
          code.push('computed=this.', this.$$store.user[name], ';');
          code.push('else if(this.', this.$$store.theme[name], '!==undefined)');
          code.push('computed=this.', this.$$store.theme[name], ';');
          code.push('else if(this.', this.$$store.init[name], '!==undefined){');
          code.push('computed=this.', this.$$store.init[name], ';');
          code.push('this.', this.$$store.useinit[name], '=true;');
          code.push('}');
        }
        else
        {
          // Use runtime value as it has higher priority
          code.push('old=computed=this.', this.$$store.runtime[name], ';');

          // Store incoming value
          if (variant === "set")
          {
            code.push('this.', this.$$store.user[name], '=value;');
          }
          else if (variant === "reset")
          {
            code.push('delete this.', this.$$store.user[name], ';');
          }
          else if (variant === "setThemed")
          {
            code.push('this.', this.$$store.theme[name], '=value;');
          }
          else if (variant === "resetThemed")
          {
            code.push('delete this.', this.$$store.theme[name], ';');
          }
          else if (variant === "init" && incomingValue)
          {
            code.push('this.', this.$$store.init[name], '=value;');
          }
        }

        code.push('}');




        // OLD = USER VALUE

        code.push('else if(this.', this.$$store.user[name], '!==undefined){');

        if (variant === "set")
        {
          if (!config.inheritable)
          {
            // Remember old value
            code.push('old=this.', this.$$store.user[name], ';');
          }

          // Replace it with new value
          code.push('computed=this.', this.$$store.user[name], '=value;');
        }
        else if (variant === "reset")
        {
          if (!config.inheritable)
          {
            // Remember old value
            code.push('old=this.', this.$$store.user[name], ';');
          }

          // Delete field
          code.push('delete this.', this.$$store.user[name], ';');

          // Complex compution of new value
          code.push('if(this.', this.$$store.runtime[name], '!==undefined)')
          code.push('computed=this.', this.$$store.runtime[name], ';');
          code.push('if(this.', this.$$store.theme[name], '!==undefined)');
          code.push('computed=this.', this.$$store.theme[name], ';');
          code.push('else if(this.', this.$$store.init[name], '!==undefined){');
          code.push('computed=this.', this.$$store.init[name], ';');
          code.push('this.', this.$$store.useinit[name], '=true;');
          code.push('}');
        }
        else
        {
          if (variant === "setRuntime")
          {
            // Use runtime value where it has higher priority
            code.push('computed=this.', this.$$store.runtime[name], '=value;');
          }
          else if (config.inheritable)
          {
            // Use user value where it has higher priority
            code.push('computed=this.', this.$$store.user[name], ';');
          }
          else
          {
            // Use user value where it has higher priority
            code.push('old=computed=this.', this.$$store.user[name], ';');
          }

          // Store incoming value
          if (variant === "setThemed")
          {
            code.push('this.', this.$$store.theme[name], '=value;');
          }
          else if (variant === "resetThemed")
          {
            code.push('delete this.', this.$$store.theme[name], ';');
          }
          else if (variant === "init" && incomingValue)
          {
            code.push('this.', this.$$store.init[name], '=value;');
          }
        }

        code.push('}');





        // OLD = THEMED VALUE

        if (config.themeable)
        {
          code.push('else if(this.', this.$$store.theme[name], '!==undefined){');

          if (!config.inheritable)
          {
            code.push('old=this.', this.$$store.theme[name], ';');
          }

          if (variant === "setRuntime")
          {
            code.push('computed=this.', this.$$store.runtime[name], '=value;');
          }

          else if (variant === "set")
          {
            code.push('computed=this.', this.$$store.user[name], '=value;');
          }

          // reset() is impossible, because the user has higher priority than
          // the themed value, so the themed value has no chance to ever get used,
          // when there is a user value, too.

          else if (variant === "setThemed")
          {
            code.push('computed=this.', this.$$store.theme[name], '=value;');
          }
          else if (variant === "resetThemed")
          {
            // Delete entry
            code.push('delete this.', this.$$store.theme[name], ';');

            // Fallback to init value
            code.push('if(this.', this.$$store.init[name], '!==undefined){');
              code.push('computed=this.', this.$$store.init[name], ';');
              code.push('this.', this.$$store.useinit[name], '=true;');
            code.push('}');
          }
          else if (variant === "init")
          {
            if (incomingValue) {
              code.push('this.', this.$$store.init[name], '=value;');
            }

            code.push('computed=this.', this.$$store.theme[name], ';');
          }
          else if (variant === "refresh")
          {
            code.push('computed=this.', this.$$store.theme[name], ';');
          }

          code.push('}');
        }




        // OLD = INIT VALUE

        code.push('else if(this.', this.$$store.useinit[name], '){');

        if (!config.inheritable) {
          code.push('old=this.', this.$$store.init[name], ';');
        }

        if (variant === "init")
        {
          if (incomingValue) {
            code.push('computed=this.', this.$$store.init[name], '=value;');
          } else {
            code.push('computed=this.', this.$$store.init[name], ';');
          }

          // useinit flag is already initialized
        }

        // reset(), resetRuntime() and resetStyle() are impossible, because the user and themed values have a
        // higher priority than the init value, so the init value has no chance to ever get used,
        // when there is a user or themed value, too.

        else if (variant === "set" || variant === "setRuntime" || variant === "setThemed" || variant === "refresh")
        {
          code.push('delete this.', this.$$store.useinit[name], ';');

          if (variant === "setRuntime") {
            code.push('computed=this.', this.$$store.runtime[name], '=value;');
          } else if (variant === "set") {
            code.push('computed=this.', this.$$store.user[name], '=value;');
          } else if (variant === "setThemed") {
            code.push('computed=this.', this.$$store.theme[name], '=value;');
          } else if (variant === "refresh") {
            code.push('computed=this.', this.$$store.init[name], ';');
          }
        }

        code.push('}');






        // OLD = NONE

        // reset(), resetRuntime() and resetStyle() are impossible because otherwise there
        // is already an old value

        if (variant === "set" || variant === "setRuntime" || variant === "setThemed" || variant === "init")
        {
          code.push('else{');

          if (variant === "setRuntime")
          {
            code.push('computed=this.', this.$$store.runtime[name], '=value;');
          }

          else if (variant === "set")
          {
            code.push('computed=this.', this.$$store.user[name], '=value;');
          }

          else if (variant === "setThemed")
          {
            code.push('computed=this.', this.$$store.theme[name], '=value;');
          }

          else if (variant === "init")
          {
            if (incomingValue) {
              code.push('computed=this.', this.$$store.init[name], '=value;');
            } else {
              code.push('computed=this.', this.$$store.init[name], ';');
            }

            code.push('this.', this.$$store.useinit[name], '=true;');
          }

          // refresh() will work with the undefined value, later

          code.push('}');
        }
      }








      if (config.inheritable)
      {
        code.push('if(computed===undefined||computed===inherit){');

          if (variant === "refresh") {
            code.push('computed=value;');
          } else {
            code.push('var pa=this.getLayoutParent();if(pa)computed=pa.', this.$$store.inherit[name], ';');
          }

          // Fallback to init value if inheritance was unsuccessful
          code.push('if((computed===undefined||computed===inherit)&&');
          code.push('this.', this.$$store.init[name], '!==undefined&&');
          code.push('this.', this.$$store.init[name], '!==inherit){');
            code.push('computed=this.', this.$$store.init[name], ';');
            code.push('this.', this.$$store.useinit[name], '=true;');
          code.push('}else{');
          code.push('delete this.', this.$$store.useinit[name], ';}');

        code.push('}');

        // Compare old/new computed value
        code.push('if(old===computed)return value;');

        // Note: At this point computed can be "inherit" or "undefined".

        // Normalize "inherit" to undefined and delete inherited value
        code.push('if(computed===inherit){');
        code.push('computed=undefined;delete this.', this.$$store.inherit[name], ';');
        code.push('}');

        // Only delete inherited value
        code.push('else if(computed===undefined)');
        code.push('delete this.', this.$$store.inherit[name], ';');

        // Store inherited value
        code.push('else this.', this.$$store.inherit[name], '=computed;');

        // Protect against normalization
        code.push('var backup=computed;');

        // After storage finally normalize computed and old value
        code.push('if(old===undefined)old=null;');
        code.push('if(computed===undefined||computed==inherit)computed=null;');
      }
      else if (hasCallback)
      {
        // Properties which are not inheritable have no possiblity to get
        // undefined at this position. (Hint: set(), setRuntime() and setThemed() only allow non undefined values)
        if (variant !== "set" && variant !== "setRuntime" && variant !== "setThemed") {
          code.push('if(computed===undefined)computed=null;');
        }

        // Compare old/new computed value
        code.push('if(old===computed)return value;');

        // Normalize old value
        code.push('if(old===undefined)old=null;');
      }








      // [12] NOTIFYING DEPENDEND OBJECTS

      if (hasCallback)
      {
        // Execute user configured setter
        if (config.apply) {
          code.push('this.', config.apply, '(computed, old, "', name, '");');
        }

        // Fire event
        if (config.event) {
          code.push(
            "var reg=qx.event.Registration;",
            "if(reg.hasListener(this, '", config.event, "')){",
            "reg.fireEvent(this, '", config.event, "', qx.event.type.Data, [computed, old]", ")}"
          );
        }

        // Refresh children
        // Require the parent/children interface
        if (config.inheritable && members._getChildren)
        {
          code.push('var a=this._getChildren();if(a)for(var i=0,l=a.length;i<l;i++){');
          code.push('if(a[i].', this.$$method.refresh[name], ')a[i].', this.$$method.refresh[name], '(backup);');
          code.push('}');
        }
      }






      // [13] RETURNING WITH ORIGINAL INCOMING VALUE

      // Return value
      if (incomingValue) {
        code.push('return value;');
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
