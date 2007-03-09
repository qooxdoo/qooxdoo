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
    /*
    ---------------------------------------------------------------------------
       PROPERTY GROUPS
    ---------------------------------------------------------------------------
    */

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
        console.debug("Generating property group: " + name + " (" + access + ")");

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
        console.debug("Generating property wrappers: " + name + " (" + access + ")");

        var getter = new qx.util.StringBuilder;
        var setter = new qx.util.StringBuilder;
        var resetter = new qx.util.StringBuilder;
        var toggler = new qx.util.StringBuilder;

        getter.add('return qx.core.Property.executeOptimizedGetter(this,',
          clazz.classname, ',"', name, '")');
        setter.add('return qx.core.Property.executeOptimizedSetter(this,',
          clazz.classname, ',"', name, '","set",value)');
        resetter.add('return qx.core.Property.executeOptimizedSetter(this,',
          clazz.classname, ',"', name, '","reset")');
        toggler.add('return qx.core.Property.executeOptimizedSetter(this,',
          clazz.classname, ',"', name, '","reset")');

        members[namePrefix + "get" + funcName] = new Function(getter.toString());
        members[namePrefix + "set" + funcName] = new Function("value", setter.toString());
        members[namePrefix + "reset" + funcName] = new Function(resetter.toString());
        members[namePrefix + "toggle" + funcName] = new Function(toggler.toString());
      }
    },

    validation :
    {
      "defined" : 'value != undefined',
      "null"    : 'value === null',
      "String"  : 'typeof value == "string"',
      "Boolean" : 'typeof value == "boolean"',
      "Number"  : 'typeof value == "number" && !isNaN(value)',
      "Object"  : 'value != null && typeof value == "object"',
      "Array"   : 'value instanceof Array'
    },

    /**
     * TODOC
     *
     * @type static
     * @param clazz {var} TODOC
     * @param name {var} TODOC
     * @return {call} TODOC
     */
    executeOptimizedGetter : function(instance, clazz, property)
    {
      console.debug("Finalize get() of " + property + " in class " + clazz.classname);




      var config = clazz.$$properties[property];

      // Starting code generation
      var code = new qx.util.StringBuilder;

      // Including user values
      code.add('if(this.__userValues.', property, '!==undefined)');
      code.add('return this.__userValues.', property, ';');

      // TODO: Appearance value
      // TODO: Inherited value

      // Including code for default value
      code.add('return ', clazz.classname, '.$$properties.', property, '.init');




      // Output generate code
      console.debug("GETTER: " + code.toString());

      // Overriding temporary setter
      clazz.prototype[config.namePrefix + "get" + config.funcName] = new Function(code.toString());

      // Executing new setter
      return instance[config.namePrefix + "get" + config.funcName]();
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
      console.debug("Finalize " + variant + "() of " + property + " in class " + clazz.classname);

      var field = variant === "appearance" ? "this.__appearanceValues." + property : "this.__userValues." + property;
      var config = clazz.$$properties[property];
      var code = new qx.util.StringBuilder;



      // Simple old/new check
      code.add('if(', field, '===value)return value;');

      // Validation
      if (variant === "set")
      {
        // Validation code
        if (config.validation != undefined)
        {
          if (config.validation in this.validation)
          {
            code.add('if(!(', this.validation[config.validation], '))');
          }
          else if (typeof config.validation === "function")
          {
            code.add('if(!', clazz.classname, '.$$properties.', property);
            code.add('.validation.call(this, value))');
          }
          else if (qx.Class.isDefined(config.validation))
          {
            code.add('if(!(value instanceof ', config.validation, '))');
          }
          else
          {
            throw new Error("Could not add validation to property " + name + " of class " + clazz.classname);
          }

          code.add('return this.warn("Invalid value for property ', property, ': " + value);');
        }

        // Store value
        code.add(field, '=value;');
      }
      else if (variant === "toggle")
      {
        // Toggle value
        code.add('var value=!', field, ';');

        // Store value
        code.add(field, '=value;');
      }
      else if (variant === "reset")
      {
        // TODO: Has someone ever tested the performance impact comparing
        // "delete something" with something=undefined?

        // Remove value
        code.add('delete ', field, ';');
      }



      // TODO: Normally we only need this now if:
      //   * we have children to inform
      //   * we have events to dispatch
      //   * we have a setter/modify method to execute
      // Otherwise invalidation would be maybe enough. Is this really relevant?

      code.add('var computed;');

      code.add('if(this.__userValues.', property, '!==undefined)computed=this.__userValues.', property, ';');

      if (config.appearance === true) {
        code.add('else if(this.__appearanceValues.', property, '!==undefined)computed=this.__appearanceValues.', property, ';');
      }

      if (config.init !== undefined) {
        code.add('else computed=', clazz.classname, '.$$properties.', property, '.init;');
      }

      if (config.inheritable === true)
      {
        // TODO: Convert this to code.add statements...
        /*
        if (computed == "inherit" || (computed === undefined && config.inheritable))
        {
          var parent = this.getParent();

          while (parent)
          {
            computed = getParent().getProperty();

            if (value !== "inherit") {
              break;
            }

            parent = parent.getParent();
          }
        }
        */
      }
      else
      {
        code.add('if(computed==="inherit")');
        code.add('return this.error("The property ', property, ' of ');
        code.add(clazz.classname, ' does not support inheritance!");');
      }





      // Remember old value
      code.add('var old=this.__computedValues.', property, ';');

      // Check old/new value
      code.add('if(old===computed)return value;');

      // Store new computed value
      code.add('this.__computedValues.', property, '=computed;');

      // Execute user configured setter
      if (config.setter)
      {
        code.add('if(!', clazz.classname, '.$$properties.', property);
        code.add('.setter.call(this, computed, old))');
      }

      // Fire event
      if (config.event) {
        code.add('this.createDispatchDataEvent("', config.event, '", computed);');
      }







      // Output generate code
      console.debug("SETTER: " + code);

      // Overriding temporary setter
      clazz.prototype[config.namePrefix + variant + config.funcName] = new Function("value", code.toString());

      // Executing new setter
      return instance[config.namePrefix + variant + config.funcName](value);
    }
  }
});
