/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * Internal class for handling of dynamic properties. Should only be used
 * through the methods provided by {@link qx.Class}.
 *
 * For a complete documentation of properties take a look at
 * http://manual.qooxdoo.org/${qxversion}/pages/core.html#properties.
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
 *     The check is used to check the type the incoming value of a property. This will only
 *     be executed in the source version. The build version will not contain the checks.
 *     The check can be:
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
 *     the method is <code>function(newValue, oldValue, propertyName)</code>. It is conventional to name
 *     the callback <code>_apply</code> + <i>PropertyName</i>, with the property name camel-cased (e.g.
 *     "<i>_applyFooBar</i>" for a property <i>fooBar</i>).
 *   </td></tr>
 *   <tr><th>event</th><td>String</td><td>
 *     On change of the property value an event with the given name will be dispatched. The event type is
 *     {@link qx.event.type.Data}.
 *   </td></tr>
 *   <tr><th>themeable</th><td>Boolean</td><td>
 *     Whether this property can be set using themes.
 *   </td></tr>
 *   <tr><th>inheritable</th><td>Boolean</td><td>
 *     Whether the property value should be inheritable. If the property does not have an user defined or an
 *     init value, the property will try to get the value from the parent of the current object.
 *   </td></tr>
 *   <tr><th>nullable</th><td>Boolean</td><td>
 *     Whether <code>null</code> is an allowed value of the property. This is complementary to the check
 *     defined using the <code>check</code> key.
 *   </td></tr>
 *   <tr><th>refine</th><td>Boolean</td><td>
 *     Whether the property definition is a refinement of a property in one of the super classes of the class.
 *     Only the <code>init</code> value can be changed using refine.
 *   </td></tr>
 *   <tr><th>transform</th><td>String</td><td>
 *     On setting of the property value the method of the specified name will
 *     be called. The signature of the method is <code>function(value, oldValue)</code>.
 *     The parameter <code>value</code> is the value passed to the setter, the
 *     parameter <code>oldValue</code> is the current value, or undefined if no value
 *     has been set previously.
 *     The function must return the modified or unmodified value.
 *     Transformation occurs before the check function, so both may be
 *     specified if desired.  Alternatively, the transform function may throw
 *     an error if the value passed to it is invalid.
 *   </td></tr>
 *   <tr><th>validate</th><td>Function, String</td><td>
 *     On setting of the property value the method of the specified name will
 *     be called. The signature of the method is <code>function(value)</code>.
 *     The parameter <code>value</code> is the value passed to the setter.
 *     If the validation fails, an <code>qx.core.ValidationError</code> should
 *     be thrown by the validation function. Otherwise, just do nothing in the
 *     function.<br>
 *     If a string is given, the string should hold a reference to a member
 *     method.<br>
 *     <code>"<i>methodname</i>"</code> for example
 *     <code>"__validateProperty"</code><br>
 *     There are some default validators in the {@link qx.util.Validate} class.
 *     See this documentation for usage examples.
 *   </td></tr>
 *   <tr><th>dereference</th><td>Boolean</td><td>
 *     By default, the references to the values (current, init, ...) of the
 *     property will be stored as references on the object. When disposing
 *     this object, the references will not be deleted. Setting the
 *     dereference key to true tells the property system to delete all
 *     connections made by this property on dispose. This can be necessary for
 *     disconnecting DOM objects to allow the garbage collector to work
 *     properly.
 *   </td></tr>
 *   <tr><th>deferredInit</th><td>Boolean</td><td>
 *     Allow for a deferred initialization for reference types. Defaults to false.
 *   </td></tr>
 *   <tr><th>isEqual</th><td>Function, String</td><td>
 *     On setting of the property value the method of the specified name will
 *     be called to test if two values are equal. These checks for equality are
 *     performed by the Property-System to decide whether further actions (like
 *     e.g. calling applier methods or firing of events) are needed.
 *     The signature of the method is <code>function(valueA, valueB)</code>.
 *     <br/>
 *     The <i>isEqual</i>-value can be:
 *     <ul>
 *       <li>a custom check function.
 *           The function takes two values as parameter and must return a
 *           boolean value to indicate whether the values are considered
 *           equal e.g. <code>function (a, b) { return Object.is(a, b); }</code>.</li>
 *       <li>inline check code as a string
 *           which will be invoked with two parameters <code>a</code> and
 *           <code>b</code> and results in a boolean value to indicate whether
 *           the values are equal e.g. <code>"a.length() == b.length()"</code>.</li>
 *       <li>reference to a member method as string
 *           <code>"<i>methodname</i>"</code> which will be invoked with two
 *           parameters and returns a boolean value indicating whether the two
 *           values are considered equal for example <code>"__areTheSame"</code>.</li>
 *     </ul>
 *     The default implementation (if this key is undefined) will check the
 *     equality by using the <i>identity</i> operator (===) as if defined like
 *     <code>"a===b"</code>.
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
 *     A list of property names which should be set using the property group.
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
 * @ignore(qx.Interface)
 */
qx.Bootstrap.define("qx.core.Property",
{
  statics :
  {
    /**
     * This is a method which does nothing than gathering dependencies for the
     * module system. Calling this method is useless because it does nothing.
     */
    __gatherDependency : function() {
      if (qx.core.Environment.get("module.events")) {
        qx.event.type.Data;
        qx.event.dispatch.Direct;
      }
      if (qx.core.Environment.get("qx.promise")) {
        qx.Promise;
      }
    },


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

      "Color"     : 'qx.lang.Type.isString(value) && qx.util.ColorUtil.isValidPropertyValue(value)',
      "Decorator" : 'value !== null && qx.theme.manager.Decoration.getInstance().isValidPropertyValue(value)',
      "Font"      : 'value !== null && qx.theme.manager.Font.getInstance().isDynamic(value)'
    },


    /**
     * Contains types from {@link #__checks} list which need to be dereferenced
     */
    __dereference :
    {
      "Node"      : true,
      "Element"   : true,
      "Document"  : true,
      "Window"    : true,
      "Event"     : true
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
      getAsync     : {},
      set          : {},
      setImpl      : {},
      setAsync     : {},
      reset        : {},
      init         : {},
      refresh      : {},
      setRuntime   : {},
      resetRuntime : {},
      setThemed    : {},
      resetThemed  : {}
    },


    /**
     * Supported keys for property definitions
     *
     * @internal
     */
    $$allowedKeys :
    {
      "@"          : "object",   // Anything
      name         : "string",   // String
      dereference  : "boolean",  // Boolean
      inheritable  : "boolean",  // Boolean
      nullable     : "boolean",  // Boolean
      themeable    : "boolean",  // Boolean
      refine       : "boolean",  // Boolean
      init         : null,       // var
      apply        : "string",   // String
      event        : "string",   // String
      check        : null,       // Array, String, Function
      transform    : "string",   // String
      async        : "boolean",  // Boolean
      deferredInit : "boolean",  // Boolean
      validate     : null,       // String, Function
      isEqual      : null        // String, Function
    },


    /**
     * Supported keys for property group definitions
     *
     * @internal
     */
    $$allowedGroupKeys :
    {
      "@"       : "object",   // Anything
      name      : "string",   // String
      group     : "object",   // Array
      mode      : "string",   // String
      themeable : "boolean"   // Boolean
    },


    /** Contains names of inheritable properties, filled by {@link qx.Class.define} */
    $$inheritable : {},


    /**
     * Generate optimized refresh method and  attach it to the class' prototype
     *
     * @param clazz {Class} clazz to which the refresher should be added
     */
    __executeOptimizedRefresh : function(clazz)
    {
      var inheritables = this.__getInheritablesOfClass(clazz);

      if (!inheritables.length) {
        var refresher = function () {};
      } else {
        refresher = this.__createRefresher(inheritables);
      }

      clazz.prototype.$$refreshInheritables = refresher;
    },


    /**
     * Get the names of all inheritable properties of the given class
     *
     * @param clazz {Class} class to get the inheritable properties of
     * @return {String[]} List of property names
     */
    __getInheritablesOfClass : function(clazz)
    {
      var inheritable = [];

      while(clazz)
      {
        var properties = clazz.$$properties;

        if (properties)
        {
          for (var name in this.$$inheritable)
          {
            // Whether the property is available in this class
            // and whether it is inheritable in this class as well
            if (properties[name] && properties[name].inheritable)
            {
              inheritable.push(name);
            }
          }
        }

        clazz = clazz.superclass;
      }

      return inheritable;
    },


    /**
     * Assemble the refresher code and return the generated function
     *
     * @param inheritables {String[]} list of inheritable properties
     * @return {Function} refresher function
     */
    __createRefresher : function(inheritables)
    {
      var inherit = this.$$store.inherit;
      var init = this.$$store.init;
      var refresh = this.$$method.refresh;

      var code = [
        "var parent = this.getLayoutParent();",
        "if (!parent) return;"
      ];

      for (var i=0, l=inheritables.length; i<l; i++)
      {
        var name = inheritables[i];
        code.push(
          "var value = parent.", inherit[name],";",
          "if (value===undefined) value = parent.", init[name], ";",
          "this.", refresh[name], "(value);"
        );
      }

      return new Function(code.join(""));
    },


    /**
     * Attach $$refreshInheritables method stub to the given class
     *
     * @param clazz {Class} clazz to which the refresher should be added
     */
    attachRefreshInheritables : function(clazz)
    {
      clazz.prototype.$$refreshInheritables = function()
      {
        qx.core.Property.__executeOptimizedRefresh(clazz);
        return this.$$refreshInheritables();
      };
    },


    /**
     * Attach one property to class
     *
     * @param clazz {Class} Class to attach properties to
     * @param name {String} Name of property
     * @param config {Map} Configuration map of property
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
     */
    __attachGroupMethods : function(clazz, config, name)
    {
      var upname = qx.Bootstrap.firstUp(name);
      var members = clazz.prototype;
      var themeable = config.themeable === true;

      if (qx.core.Environment.get("qx.debug"))
      {
        if (qx.core.Environment.get("qx.debug.property.level") > 1) {
          qx.Bootstrap.debug("Generating property group: " + name);
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
        if (qx.core.Environment.get("qx.debug"))
        {
          if (!this.$$method.set[a[i]]||!this.$$method.reset[a[i]]) {
            throw new Error("Cannot create property group '" + name + "' including non-existing property '" + a[i] + "'!");
          }
        }

        setter.push("this.", this.$$method.set[a[i]], "(a[", i, "]);");
        resetter.push("this.", this.$$method.reset[a[i]], "();");

        if (themeable)
        {
          if (qx.core.Environment.get("qx.debug"))
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
     */
    __attachPropertyMethods : function(clazz, config, name)
    {
      var upname = qx.Bootstrap.firstUp(name);
      var members = clazz.prototype;

      if (qx.core.Environment.get("qx.debug"))
      {
        if (qx.core.Environment.get("qx.debug.property.level") > 1) {
          qx.Bootstrap.debug("Generating property wrappers: " + name);
        }
      }

      // Fill dispose value
      if (config.dereference === undefined && typeof config.check === "string") {
        config.dereference = this.__shouldBeDereferenced(config.check);
      }

      if (!qx.core.Environment.get("qx.promise")) {
        if (config.async) {
          this.warn("Asynchronous property " + clazz.classname +"." + name + " is switched to synchronous because qx.promise==false");
          config.async = false;
        }
        if (config.check == "qx.Promise") {
          this.error("Cannot implement check for property " + clazz.classname +"." + name + " because qx.promise==false");
          delete config.check;
        }
      }
      
      // Check for method name conflicts
      if (qx.core.Environment.get("qx.debug")) {
      	// Exclude qx.data.model.* because that's from marshalling and will cause conflicts to be reported
      	if (clazz.classname && !clazz.classname.match(/^qx.data.model/)) {
		      var allNames = [ "get" + upname, "set" + upname, "reset" + upname, "setRuntime" + upname, "resetRuntime" + upname ];
		      if (config.async) {
		      	allNames.push("get" + upname + "Async");
		      	allNames.push("set" + upname + "Async");
		      }
		      if (config.inheritable || config.apply || config.event || config.deferredInit) {
		      	allNames.push("init" + upname);
		      }
		      if (config.inheritable) {
		      	allNames.push("refresh" + upname);
		      }
		      if (config.themeable) {
		      	allNames.push("getThemed" + upname);
		      	allNames.push("setThemed" + upname);
		      	allNames.push("resetThemed" + upname);
		      }
		      if (config.check === "Boolean") {
		      	allNames.push("is" + upname);
		      	allNames.push("toggle" + upname);
		      }
          allNames.forEach(function(name) {
            if (clazz.superclass.prototype[name] !== undefined) {
              var conflictingClass = null;
              for (var tmp = clazz.superclass; tmp && tmp != qx.core.Object; tmp = tmp.superclass) {
                if (tmp.superclass.prototype[name] === undefined) {
                  conflictingClass = tmp;
                  break;
                }
              }
              if (conflictingClass) {
                qx.log.Logger.warn("Conflicting property method " + clazz.classname + "." + name + " with " + conflictingClass.classname);
              }
            }
          });
      	}
      }

      var method = this.$$method;
      var store = this.$$store;

      store.runtime[name] = "$$runtime_" + name;
      store.user[name] = "$$user_" + name;
      store.theme[name] = "$$theme_" + name;
      store.init[name] = "$$init_" + name;
      store.inherit[name] = "$$inherit_" + name;
      store.useinit[name] = "$$useinit_" + name;

      var getName = method.get[name] = "get" + upname;
      members[method.get[name]] = new Function(
          "this." + getName + ".$$install && this." + getName + ".$$install();" +
          "return this." + getName + ".apply(this, arguments);"); 
      if (config.async) {
        
      	if (qx.core.Environment.get("qx.debug")) {
      		if (members.hasOwnProperty(getName + "Async")) {
      			this.error("Asynchronous property " + clazz.classname +"." + name + " is replacing " + getName + "Async() method in same class");
      		} else if (members[getName + "Async"] !== undefined) {
      			this.warn("Asynchronous property " + clazz.classname +"." + name + " is overriding " + getName + "Async() method");
      		}
      	}
	      method.getAsync[name] = getName + "Async";
	      members[method.getAsync[name]] = new Function(
	          "this." + getName + ".$$install && this." + getName + ".$$install.call(this);" +
	          "return this." + getName + "Async.apply(this, arguments);");
      }
      members[method.get[name]].$$install = function() {
        qx.core.Property.__installOptimizedGetter(clazz, name, "get", arguments);
        if (config.async) {
        	qx.core.Property.__installOptimizedGetter(clazz, name, "getAsync", arguments);
        }
      };

      var setName = method.set[name] = "set" + upname;
      members[setName] = new Function(
          "this." + setName + ".$$install && this." + setName + ".$$install.call(this);" +
          "return this." + setName + ".apply(this, arguments);");
      method.setAsync[name] = "set" + upname + "Async";
      if (config.async) {
      	if (qx.core.Environment.get("qx.debug")) {
      		if (members.hasOwnProperty(setName + "Async")) {
      			this.error("Asynchronous property " + clazz.classname +"." + name + " is replacing " + setName + "Async() method in same class");
      		} else if (members[setName + "Async"] !== undefined) {
      			this.warn("Asynchronous property " + clazz.classname +"." + name + " is overriding " + setName + "Async() method");
      		}
      	}
        members[setName + "Async"] = new Function(
            "this." + setName + ".$$install && this." + setName + ".$$install.call(this);" +
            "return this." + setName + "Async.apply(this, arguments);");
      }
      method.setImpl[name] = "$$set" + upname + "Impl";
      members[setName].$$install = function() {
        qx.core.Property.__installOptimizedSetter(clazz, name, "set");
        qx.core.Property.__installOptimizedSetter(clazz, name, "setImpl");
        if (config.async) {
          qx.core.Property.__installOptimizedSetter(clazz, name, "setAsync");
        }
      };

      method.reset[name] = "reset" + upname;
      members[method.reset[name]] = function() {
        return qx.core.Property.executeOptimizedSetter(this, clazz, name, "reset");
      };
      members[method.reset[name]].$$install = function() {
        qx.core.Property.__installOptimizedSetter(clazz, name, "reset");
      };

      if (config.inheritable || config.apply || config.event || config.deferredInit)
      {
        method.init[name] = "init" + upname;
        members[method.init[name]] = function(value) {
          return qx.core.Property.executeOptimizedSetter(this, clazz, name, "init", arguments);
        };
        if (qx.core.Environment.get("qx.debug")) {
          members[method.init[name]].$$propertyMethod = true;
        }
      }

      if (config.inheritable)
      {
        method.refresh[name] = "refresh" + upname;
        members[method.refresh[name]] = function(value) {
          return qx.core.Property.executeOptimizedSetter(this, clazz, name, "refresh", arguments);
        };
        if (qx.core.Environment.get("qx.debug")) {
          members[method.refresh[name]].$$propertyMethod = true;
        }
      }

      method.setRuntime[name] = "setRuntime" + upname;
      members[method.setRuntime[name]] = function(value) {
        return qx.core.Property.executeOptimizedSetter(this, clazz, name, "setRuntime", arguments);
      };

      method.resetRuntime[name] = "resetRuntime" + upname;
      members[method.resetRuntime[name]] = function() {
        return qx.core.Property.executeOptimizedSetter(this, clazz, name, "resetRuntime");
      };

      if (config.themeable)
      {
        method.setThemed[name] = "setThemed" + upname;
        members[method.setThemed[name]] = function(value) {
          return qx.core.Property.executeOptimizedSetter(this, clazz, name, "setThemed", arguments);
        };

        method.resetThemed[name] = "resetThemed" + upname;
        members[method.resetThemed[name]] = function() {
          return qx.core.Property.executeOptimizedSetter(this, clazz, name, "resetThemed");
        };
        if (qx.core.Environment.get("qx.debug")) {
          members[method.setThemed[name]].$$propertyMethod = true;
          members[method.resetThemed[name]].$$propertyMethod = true;
        }
      }

      if (config.check === "Boolean")
      {
        members["toggle" + upname] = new Function("return this." + method.set[name] + "(!this." + method.get[name] + "())");
        members["is" + upname] = new Function("return this." + method.get[name] + "()");

        if (qx.core.Environment.get("qx.debug")) {
          members["toggle" + upname].$$propertyMethod = true;
          members["is" + upname].$$propertyMethod = true;
        }
      }

      // attach a flag to make generated property methods
      if (qx.core.Environment.get("qx.debug")) {
        members[method.get[name]].$$propertyMethod = true;
        members[method.set[name]].$$propertyMethod = true;
        members[method.reset[name]].$$propertyMethod = true;
        members[method.setRuntime[name]].$$propertyMethod = true;
        members[method.resetRuntime[name]].$$propertyMethod = true;
      }
    },


    /**
     * Returns if the reference for the given property check should be removed
     * on dispose.
     *
     * @param check {var} The check of the property definition.
     * @return {Boolean} If the dereference key should be set.
     */
    __shouldBeDereferenced :  function(check) {
      return !!this.__dereference[check];
    },


    /** @type {Map} Internal data field for error messages used by {@link #error} */
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
    	var fn = this.__installFunctionFromCode(instance.constructor, name, variant, code, args);

      // Executing new function
      if (args === undefined) {
        return fn.call(instance);
      } else if (qx.core.Environment.get("qx.debug")) {
        return fn.apply(instance, args);
      } else {
        return fn.call(instance, args[0]);
      }
    },

    
    /**
     * Takes a string builder object, converts it into a function, and installs it as
     * a property accessor
     *
     * @param clazz {Class} Class to install the method into
     * @param name {String} Name of the property
     * @param variant {String} Function variant e.g. get, set, reset, ...
     * @param code {Array} Array which contains the code
     * @param args {arguments} Incoming arguments of wrapper method
     * @return {var} Return value of the generated function
     */
    __installFunctionFromCode : function(clazz, name, variant, code, args)
    {
      var store = this.$$method[variant][name];

      // Output generate code
      if (qx.core.Environment.get("qx.debug"))
      {
        if (qx.core.Environment.get("qx.debug.property.level") > 1) {
          qx.Bootstrap.debug("Code[" + this.$$method[variant][name] + "]: " + code.join(""));
        }

        // Overriding temporary wrapper
        try{
          clazz.prototype[store] =  new Function("value", code.join(""));
        } catch(ex) {
          throw new Error("Malformed generated code to unwrap method: " + this.$$method[variant][name] + "\n" + code.join(""));
        }
      }
      else
      {
        clazz.prototype[store] =  new Function("value", code.join(""));
      }

      // Enable profiling code
      if (qx.core.Environment.get("qx.aspects")) {
        clazz.prototype[store] = qx.core.Aspect.wrap(clazz.classname + "." + store, clazz.prototype[store], "property");
      }

      qx.Bootstrap.setDisplayName(clazz.prototype[store], clazz.classname + ".prototype", store);
      return clazz.prototype[store];
    },


    /**
     * Generates the optimized getter, installs it into the class prototype, and executes it
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
      var code = this.__compileGetter(clazz, name, variant);
      var members = clazz.prototype;
      return this.__unwrapFunctionFromCode(instance, members, name, variant, code);
    },
    
    
    /**
     * Installs a getter into the class prototype, without executing it
     * Supported variants: get
     *
     * @param clazz {Class} the class which originally defined the property
     * @param name {String} name of the property
     * @param variant {String} Method variant.
     */
    __installOptimizedGetter : function(clazz, name, variant)
    {
      var code = this.__compileGetter(clazz, name, variant);
      this.__installFunctionFromCode(clazz, name, variant, code);
    },
    
    
    /**
     * Compiles a getter into a string builder array
     * Supported variants: get
     *
     * @param clazz {Class} the class which originally defined the property
     * @param name {String} name of the property
     * @param variant {String} Method variant.
     * @return {String[]} the string builder array
     */
    __compileGetter: function(clazz, name, variant)
    {
      var config = clazz.$$properties[name];
      var code = [];
      var store = this.$$store;
      
      if (variant == "getAsync") {
      	code.push("return qx.Promise.resolve(this." + this.$$method.get[name] + "());");
      	return code;
      }

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

      return code;
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
    	var code = this.__compileSetter(clazz, name, variant);
      var members = clazz.prototype;
      return this.__unwrapFunctionFromCode(instance, members, name, variant, code, args);
    },
    
    
    /**
     * Installs a setter into the class prototype, without executing it
     * Supported variants: set
     *
     * @param clazz {Class} the class which originally defined the property
     * @param name {String} name of the property
     * @param variant {String} Method variant.
     * @return {var} Return value of the generated function
     */
    __installOptimizedSetter : function(clazz, name, variant)
    {
    	var code = this.__compileSetter(clazz, name, variant);
      return this.__installFunctionFromCode(clazz, name, variant, code);
    },
    
    
    /**
     * Compiles a setter into a string builder array
     * Supported variants: set, setThemed, setRuntime, init
     *
     * @param instance {Object} the instance which calls the method
     * @param clazz {Class} the class which originally defined the property
     * @param name {String} name of the property
     * @param variant {String} Method variant.
     * @return {String[]} the string builder array
     */
    __compileSetter: function(clazz, name, variant) {
      var config = clazz.$$properties[name];
      var members = clazz.prototype;
      var code = [];
      
      var upname = qx.lang.String.firstUp(name);
      if (variant == "setAsync") {
        code.push('return qx.Promise.resolve(this.$$set' + upname + "Impl.apply(this, arguments));");
        return code;
        
      } else if (variant == "set") {
        code.push(
            'this.$$set' + upname + "Impl.apply(this, arguments);",
            'return value;');
        return code;
        
      }
      
      var incomingValue = 
        variant === "setImpl" ||
        variant === "setThemed" || 
        variant === "setRuntime" || 
        (variant === "init" && config.init === undefined);
      var hasCallback = config.apply || config.event || config.inheritable;


      var store = this.__getStore(variant, name);

      this.__emitIsEqualFunction(code, clazz, config, name);

      this.__emitSetterPreConditions(code, config, name, variant, incomingValue);
      
      if (incomingValue || hasCallback) {
        this.__emitOldValue(code, config, name);
      }

      if (incomingValue) {
        this.__emitIncomingValueTransformation(code, clazz, config, name);
      }

      if (hasCallback) {
        this.__emitOldNewComparison(code, incomingValue, store, variant);
      }

      if (config.inheritable) {
        code.push('var inherit=prop.$$inherit;');
      }

      if (qx.core.Environment.get("qx.debug"))
      {
        if (incomingValue) {
          this.__emitIncomingValueValidation(code, config, clazz, name, variant);
        }
      }

      if (!hasCallback) {
        this.__emitStoreValue(code, name, variant, incomingValue);
      } else {
        this.__emitStoreComputedValue(code, config, name, variant, incomingValue);
      }

      if (config.inheritable) {
        this.__emitStoreInheritedPropertyValue(code, config, name, variant);
      } else if (hasCallback) {
        this.__emitNormalizeUndefinedValues(code, config, name, variant);
      }

      if (hasCallback)
      {
        // Emit callback and event firing; Refreshing children (5th parameter) requires the parent/children interface
        this.__emitCallCallback(code, config, name, variant, !!(config.inheritable && members._getChildren));
      }

      // Return value
      if (incomingValue) {
        code.unshift('function set(value){');
        code.push('}');
        if (qx.core.Environment.get("qx.promise") && (!config.check || config.check != "qx.Promise")) {
          code.push(
              'var promise;',
              'if (value instanceof qx.Promise) ',
                'promise = value.then(set.bind(this));',
              'else ',
                'promise = set.apply(this, arguments);');
          if (variant == "setImpl") {
            code.push("return promise;");
          } else {
            code.push('return value;');
          }
        } else {
          code.push(
              'set.apply(this, arguments);',
              'return value;');
        }
      }
      
      return code;
    },


    /**
     * Get the object to store the value for the given variant
     *
     * @param variant {String} Method variant.
     * @param name {String} name of the property
     *
     * @return {Object} the value store
     */
    __getStore : function(variant, name)
    {
      if (variant === "setRuntime" || variant === "resetRuntime") {
        var store = this.$$store.runtime[name];
      } else if (variant === "setThemed" || variant === "resetThemed") {
        store = this.$$store.theme[name];
      } else if (variant === "init") {
        store = this.$$store.init[name];
      } else {
        store = this.$$store.user[name];
      }

      return store;
    },


    /**
     * Emit code for the equality check evaluation
     *
     * @param code {String[]} String array to append the code to
     * @param clazz {Class} the class which originally defined the property
     * @param config {Object} The property configuration map
     * @param name {String} name of the property
     */
    __emitIsEqualFunction : function (code, clazz, config, name)
    {
      code.push('var equ=');

      if (typeof config.isEqual === "function")
      {
        code.push('function(a,b){return !!', clazz.classname, '.$$properties.',
                  name, '.isEqual.call(this,a,b);};');
      }
      else if (typeof config.isEqual === "string")
      {
        var members = clazz.prototype;
        // Name of member?
        if (members[config.isEqual]!==undefined)
        {
          code.push('this.', config.isEqual, ';');
        }
        else // 'inline' code
        {
          code.push('function(a,b){return !!(', config.isEqual, ');};');
        }
      }
      else if (typeof config.isEqual === "undefined")
      {
        code.push('function(a,b){return a===b;};');
      }
      else
      {
        throw new Error( "Invalid type for 'isEqual' attribute " +
          "of property '" + name + "' in class '" + clazz.classname + "'" );
      }
    },


    /**
     * Emit code to check the arguments preconditions
     *
     * @param code {String[]} String array to append the code to
     * @param config {Object} The property configuration map
     * @param name {String} name of the property
     * @param variant {String} Method variant.
     * @param incomingValue {Boolean} Whether the setter has an incoming value
     */
    __emitSetterPreConditions : function(code, config, name, variant, incomingValue)
    {
      if (qx.core.Environment.get("qx.debug"))
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
        if (variant === "setImpl") {
          code.push('if(value===undefined)prop.error(this,2,"', name, '","', variant, '",value);');
        }
      }
    },


    /**
     * Emit code to apply the "validate" and "transform" config keys.
     *
     * @param code {String[]} String array to append the code to
     * @param clazz {Class} the class which originally defined the property
     * @param config {Object} The property configuration map
     * @param name {String} name of the property
     */
    __emitIncomingValueTransformation : function(code, clazz, config, name)
    {
      // Call user-provided transform method, if one is provided.  Transform
      // method should either throw an error or return the new value.
      if (config.transform) {
        code.push('value=this.', config.transform, '(value, old);');
      }

      // Call user-provided validate method, if one is provided.  Validate
      // method should either throw an error or do nothing.
      if (config.validate) {
        // if it is a string
        if (typeof config.validate === "string") {
          code.push('this.', config.validate, '(value);');
        // if its a function otherwise
        } else if (config.validate instanceof Function) {
          code.push(clazz.classname, '.$$properties.', name);
          code.push('.validate.call(this, value);');
        }
      }
    },


    /**
     * Emit code, which returns if the incoming value equals the current value.
     *
     * @param code {String[]} String array to append the code to
     * @param incomingValue {Boolean} Whether the setter has an incoming value
     * @param store {Object} The data store to use for the incoming value
     * @param variant {String} Method variant.
     */
    __emitOldNewComparison : function(code, incomingValue, store, variant)
    {
      var resetValue = (
        variant === "reset" ||
        variant === "resetThemed" ||
        variant === "resetRuntime"
      );

      if (incomingValue) {
        code.push('if(equ.call(this,this.',store,',value))return value;');
      } else if (resetValue) {
        code.push('if(this.', store, '===undefined)return;');
      }
    },


    /**
     * Emit code, which performs validation of the incoming value according to
     * the "nullable", "check" and "inheritable" config keys.
     *
     * @signature function(code, config, clazz, name, variant)
     * @param code {String[]} String array to append the code to
     * @param config {Object} The property configuration map
     * @param clazz {Class} the class which originally defined the property
     * @param name {String} name of the property
     * @param variant {String} Method variant.
     */
    __emitIncomingValueValidation : qx.core.Environment.select("qx.debug",
    {
      "true" : function(code, config, clazz, name, variant)
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
      },

      "false" : undefined
    }),


    /**
     * Emit code to store the incoming value
     *
     * @param code {String[]} String array to append the code to
     * @param name {String} name of the property
     * @param variant {String} Method variant.
     * @param incomingValue {Boolean} Whether the setter has an incoming value
     */
    __emitStoreValue : function(code, name, variant, incomingValue)
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
      else if (variant === "setImpl")
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
    },


    /**
     * Emit code to store the incoming value and compute the "old" and "computed"
     * values.
     *
     * @param code {String[]} String array to append the code to
     * @param config {Object} The property configuration map
     * @param name {String} name of the property
     * @param variant {String} Method variant.
     * @param incomingValue {Boolean} Whether the setter has an incoming value
     */
    __emitStoreComputedValue : function(code, config, name, variant, incomingValue)
    {
      code.push('var computed;');


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

        // Complex computation of new value
        code.push('if(this.', this.$$store.user[name], '!==undefined)');
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
        code.push('computed=this.', this.$$store.runtime[name], ';');

        // Store incoming value
        if (variant === "setImpl")
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

      if (variant === "setImpl")
      {
        // Replace it with new value
        code.push('computed=this.', this.$$store.user[name], '=value;');
      }
      else if (variant === "reset")
      {
        // Delete field
        code.push('delete this.', this.$$store.user[name], ';');

        // Complex computation of new value
        code.push('if(this.', this.$$store.runtime[name], '!==undefined)');
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
          code.push('computed=this.', this.$$store.user[name], ';');
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

        if (variant === "setRuntime")
        {
          code.push('computed=this.', this.$$store.runtime[name], '=value;');
        }

        else if (variant === "setImpl")
        {
          code.push('computed=this.', this.$$store.user[name], '=value;');
        }

        // reset() is impossible, because the user has higher priority than
        // the themed value, so the themed value has no chance to ever get used,
        // when there is an user value, too.

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
      // when there is an user or themed value, too.

      else if (variant === "setImpl" || variant === "setRuntime" || variant === "setThemed" || variant === "refresh")
      {
        code.push('delete this.', this.$$store.useinit[name], ';');

        if (variant === "setRuntime") {
          code.push('computed=this.', this.$$store.runtime[name], '=value;');
        } else if (variant === "setImpl") {
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
      if (variant === "setImpl" || variant === "setRuntime" || variant === "setThemed" || variant === "init")
      {
        code.push('else{');

        if (variant === "setRuntime")
        {
          code.push('computed=this.', this.$$store.runtime[name], '=value;');
        }

        else if (variant === "setImpl")
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
    },


    /**
     * Emit code to compute the "old" value.
     *
     * @param code {String[]} String array to append the code to
     * @param config {Object} The property configuration map
     * @param name {String} name of the property
     */
    __emitOldValue : function(code, config, name)
    {
      if (config.inheritable) {
        code.push('var old=this.', this.$$store.inherit[name], ';');
      } else {
        code.push('var old;');
      }

      // OLD = RUNTIME VALUE
      code.push('if(this.', this.$$store.runtime[name], '!==undefined){');
      code.push('old=this.', this.$$store.runtime[name], ';');
      code.push('}');

      // OLD = USER VALUE
      if (!config.inheritable) {
        code.push('else if(this.', this.$$store.user[name], '!==undefined){');
        code.push('old=this.', this.$$store.user[name], ';');
        code.push('}');
        
        // OLD = THEMED VALUE
        if (config.themeable) {
          code.push('else if(this.', this.$$store.theme[name], '!==undefined){');
          code.push('old=this.', this.$$store.theme[name], ';');
          code.push('}');
        }
        
        // OLD = INIT VALUE
        code.push('else if(this.', this.$$store.useinit[name], '){');
        code.push('old=this.', this.$$store.init[name], ';');
        code.push('}');
      }
    },


    /**
     * Emit code to store the value of an inheritable property
     *
     * @param code {String[]} String array to append the code to
     * @param config {Object} The property configuration map
     * @param name {String} name of the property
     * @param variant {String} Method variant.
     */
    __emitStoreInheritedPropertyValue : function(code, config, name, variant)
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
      code.push('if(equ.call(this,old,computed))return value;');

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
      if (config.init !== undefined && variant !== "init") {
        code.push('if(old===undefined)old=this.', this.$$store.init[name], ";");
      } else {
        code.push('if(old===undefined)old=null;');
      }
      code.push('if(computed===undefined||computed==inherit)computed=null;');
    },


    /**
     * Emit code to normalize the old and incoming values from undefined to
     * <code>null</code>.
     *
     * @param code {String[]} String array to append the code to
     * @param config {Object} The property configuration map
     * @param name {String} name of the property
     * @param variant {String} Method variant.
     */
    __emitNormalizeUndefinedValues : function(code, config, name, variant)
    {
      // Properties which are not inheritable have no possibility to get
      // undefined at this position. (Hint: set(), setRuntime() and setThemed() only allow non undefined values)
      if (variant !== "setImpl" && variant !== "setRuntime" && variant !== "setThemed") {
        code.push('if(computed===undefined)computed=null;');
      }

      // Compare old/new computed value
      code.push('if(equ.call(this,old,computed))return value;');

      // Normalize old value
      if (config.init !== undefined && variant !== "init") {
        code.push('if(old===undefined)old=this.', this.$$store.init[name], ";");
      } else {
        code.push('if(old===undefined)old=null;');
      }
    },


    /**
     * Emit code to call the apply method and fire the change event
     *
     * @param code {String[]} String array to append the code to
     * @param config {Object} The property configuration map
     * @param name {String} name of the property
     * @param variant {String} variant of the method e.g. setThemed
     * @param refresh {Boolean} if true, emit code to update the inherited values of child objects
     */
    __emitCallCallback : function(code, config, name, variant, refresh)
    {
      // Execute user configured setter
      code.push('var promise;');
      if (config.apply) {
        code.push('promise = this.', config.apply, '(computed, old, "', name, '", "', variant, '");');
      }
      
      if (config.async) {
        code.push(
        		"function fire() {",
              "var promiseData = qx.Promise.resolve(computed);",
              "var promise = promiseData;"
        		);
        
        // Fire event
        if (config.event) {
          code.push(
              "var reg=qx.event.Registration;",
              "if(reg.hasListener(this, '", config.event, "')) {",
                "promise = reg.fireEventAsync(this, '", config.event, "', qx.event.type.Data, [computed, old]", ");",
                "promise = promise.then(function() { return computed; });",
              "}",
              "if(reg.hasListener(this, '", config.event, "Async'))",
                "promise = promise.then(function() {",
                    "return reg.fireEventAsync(this, '", config.event, "Async', qx.event.type.Data, [promiseData, old]", ");",
                  "}, this);"
              );
        }
        
        // Emit code to update the inherited values of child objects
        if (refresh) {
          code.push(
            'var a=this._getChildren();',
            'if(a)',
              'for(var i=0,l=a.length;i<l;i++){',
                'if(a[i].', this.$$method.refresh[name], ')',
                  'a[i].', this.$$method.refresh[name], '(backup);',
              '}');
        }
        
        code.push(
            "return promise;",
          "}");
      } else {
        code.push(
          "function fire() {");
            
        // Fire event
        if (config.event) {
          code.push(
              "var reg=qx.event.Registration;",
              
              "if(reg.hasListener(this, '", config.event, "'))",
                "reg.fireEvent(this, '", config.event, "', qx.event.type.Data, [computed, old]", ");");
          if (qx.core.Environment.get("qx.promise")) {
            code.push(
                "if(reg.hasListener(this, '", config.event, "Async'))",
                  "reg.fireEventAsync(this, '", config.event, "Async', qx.event.type.Data, [qx.Promise.resolve(computed), old]", ");"
                );
          }
        }
        // Emit code to update the inherited values of child objects
        if (refresh) {
          code.push(
            'var a=this._getChildren();',
            'if(a)',
              'for(var i=0,l=a.length;i<l;i++){',
                'if(a[i].', this.$$method.refresh[name], ')',
                  'a[i].', this.$$method.refresh[name], '(backup);',
              '}');
        }
        
        code.push(
            "return computed;",
          "}");
      }
      
      if (qx.core.Environment.get("qx.promise")) {
        code.push(
            "if(promise instanceof qx.Promise) " +
              "return promise.then(fire, this); "
          );
      }
      code.push(
        "return fire.call(this);"
      );
    }
  }
});
