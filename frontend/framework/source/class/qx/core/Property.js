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

        getter.add('return qx.core.Property.executeOptimizedGetter(this,',
          clazz.classname, ',"', name, '")');
        setter.add('return qx.core.Property.executeOptimizedSetter(this,',
          clazz.classname, ',"', name, '","set",value)');
        resetter.add('return qx.core.Property.executeOptimizedSetter(this,',
          clazz.classname, ',"', name, '","reset")');

        members[namePrefix + "get" + funcName] = new Function(getter.toString());
        members[namePrefix + "set" + funcName] = new Function("value", setter.toString());
        members[namePrefix + "reset" + funcName] = new Function(resetter.toString());
      }
    },

    validation :
    {
      "defined" : 'value != undefined',
      "null"    : 'value === null',
      "string"  : 'typeof value == "string"',
      "boolean" : 'typeof value == "boolean"',
      "number"  : 'typeof value == "number" && !isNaN(value)',
      "object"  : 'value != null && typeof value == "object"',
      "array"   : 'value instanceof Array'
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




      var config = clazz.$$properties[property];

      // Starting code generation
      var code = new qx.util.StringBuilder;

      // Debug output
      // code.add("this.debug('Property: " + name + ": ' + value);");
      // Validation and value compare should only be used in the real setter
      if (variant === "set")
      {
        // TODO: Implement check()
        // Validation code
        if (config.validation != undefined)
        {
          if (qx.Class.isDefined(config.validation))
          {
            code.add('if(!(value instanceof ', config.validation);
            code.add('))this.error("Invalid value for property ');
            code.add(property, ': " + value);');
          }
          else if (config.validation in this.validation)
          {
            code.add('if(!(', this.validation[config.validation]);
            code.add('))this.error("Invalid value for property ');
            code.add(property, ': " + value);');
          }
          else
          {
            this.error("Could not add validation to property " + name + ". Invalid method.");
          }
        }

        // Store value
        code.add('this.__userValues.', property, '=value;');
      }
      else if (variant === "toggle")
      {
        // Toggle value
        code.add('this.__userValues.', property);
        code.add('=!this.__userValues.', property, ';');
      }
      else if (variant === "reset")
      {
        // Remove value
        code.add('delete this.__userValues.' + property, ';');
      }


      // TODO: property setter/modifier
      // TODO: check for modifications
      // TODO: event dispatch


      code.add('var computed;');


      if (!config.inheritable)
      {
        code.add('if(computed==="inherit")');
        code.add('this.error("The property ', property, ' does not support inheritance");');
      }


      // TODO: Convert this to code.add statements...
      /*
      if (value == "inherit" || (value === undefined && config.inheritable))
      {
        var parent = this.getParent();

        while (parent)
        {
          value = getParent().getProperty();

          if (value !== "inherit") {
            break;
          }

          parent = parent.getParent();
        }
      }
      */








      // Output generate code
      console.debug("SETTER: " + code);

      // Overriding temporary setter
      clazz.prototype[config.namePrefix + variant + config.funcName] = new Function("value", code.toString());

      // Executing new setter
      return instance[config.namePrefix + variant + config.funcName](value);
    }
  }
});
