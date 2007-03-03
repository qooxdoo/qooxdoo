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
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /*
    ---------------------------------------------------------------------------
       PROPERTY GROUPS
    ---------------------------------------------------------------------------
    */

    /**
     * Add new properties:
     *
     * In the default mode it generates a setter/getter pair for a named property.
     *
     * In the group mode it generates a single setter for multiple setters e.g. 
     * margin for marginLeft, -Right, -Top and -Bottom.
     *
     * @type static
     * @param config {Map} Configuration map
     * @param proto {Object} Object where the setter should be attached
     * @return {void}
     */
    addProperty : function(config, proto)
    {
      var upName = qx.lang.String.toFirstUp(config.name);
      
      if (config.group) 
      {
        var code = new qx.util.StringBuilder;
      
        code.add("var a=arguments;")
      
        if (config.mode == "shorthand") {
          code.add("a=qx.lang.Array.fromShortHand(qx.lang.Array.fromArguments(a));")
        }
      
        for (var i=0, a=config.group, l=a.length; i<l; i++) {
          code.add("this.set", qx.lang.String.toFirstUp(a[i]), "(a[", i, "]);");        
        }
      
        proto["set" + upName] = new Function(code.toString());
      }
      else
      {
        throw new Error("New properties are not yet implemented!")        
      }
    },
    
    validation :
    {
      "defined" : 'newValue != undefined',
      "null"    : 'newValue === null',
      "string"  : 'typeof newValue == "string"',
      "boolean" : 'typeof newValue == "boolean"',
      "number"  : 'typeof newValue == "number" && !isNaN(newValue)',
      "object"  : 'newValue != null && typeof newValue == "object"',
      "array"   : 'newValue instanceof Array'
    },

    getterFieldOrder : [ "_user_values_ng", "_appearance_values_ng" ],


    /**
     * TODOC
     *
     * @type static
     * @param obj {var} TODOC
     * @param name {var} TODOC
     * @return {call} TODOC
     */
    generateGetter : function(obj, name)
    {
      var config = obj._properties_ng[name];
      var proto = config.proto;

      proto.debug("Creating real getter for " + name);

      // Starting code generation
      var code = new qx.util.StringBuilder;

      // Including user and appearance values
      for (var i=0, a=this.getterFieldOrder, l=a.length; i<l; i++)
      {
        code.add("if(this.");
        code.add(a[i]);
        code.add(".");
        code.add(name);
        code.add("!==undefined)return this.");
        code.add(a[i]);
        code.add(".");
        code.add(name);
        code.add(";");
      }

      // Including code for default value
      code.add("return this._properties_ng.");
      code.add(name);
      code.add(".init");

      // Output generate code
      // alert("Code:\n\n" + code);
      // Generate new function from code
      var vGetter = new Function("newValue", code.toString());

      // Overriding temporary setter
      proto["get" + config.upname] = vGetter;

      // Executing new setter
      return obj["get" + config.upname]();
    },


    /**
     * TODOC
     *
     * @type static
     * @param obj {var} TODOC
     * @param mode {var} TODOC
     * @param name {var} TODOC
     * @param vValue {var} TODOC
     * @return {call} TODOC
     */
    generateSetter : function(obj, mode, name, vValue)
    {
      var config = obj._properties_ng[name];
      var proto = config.proto;

      proto.debug("Creating setter for " + mode + "/" + name);

      // Starting code generation
      var code = new qx.util.StringBuilder;

      // Debug output
      // code.add("this.debug('Property: " + name + ": ' + newValue);");
      // Validation and value compare should only be used in the real setter
      if (mode === "set")
      {
        // Read oldValue value
        code.add("var oldValue=this._user_values_ng.");
        code.add(name);
        code.add(";");

        // Check value change
        code.add("if(oldValue===newValue)return;");

        // TODO: Implement check()
        // Validation code
        if (config.validation != undefined)
        {
          if (qx.Class.isDefined(config.validation))
          {
            code.add("if(!(newValue instanceof ");
            code.add(config.validation);
            code.add("))this.error('Invalid value for property ");
            code.add(name);
            code.add(": ' + newValue);");
          }
          else if (config.validation in this.validation)
          {
            code.add("if(!(");
            code.add(this.validation[config.validation]);
            code.add("))this.error('Invalid value for property ");
            code.add(name);
            code.add(": ' + newValue);");
          }
          else
          {
            this.error("Could not add validation to property " + name + ". Invalid method.");
          }
        }
      }

      if (mode === "toggle")
      {
        // Toggle current value
        code.add("this._user_values_ng.");
        code.add(name);
        code.add("=!this._user_values_ng.");
        code.add(name);
        code.add(";");
      }
      else
      {
        // Store new value
        code.add("this._user_values_ng.");
        code.add(name);
        code.add("=newValue;");
      }

      // TODO: Implement modifier()
      // Add event dispatcher
      if (mode === "set")
      {
        // Needs to be fired if
        // * the value was configured (also null is OK) and was reconfigured now (no additional check)
        // * the value was undefined and is configured now (compare real value with oldValue value first)
        if (config.fire !== false && proto.createDispatchDataEvent)
        {
          code.add("this.createDispatchDataEvent('change");
          code.add(config.upname);
          code.add("', newValue, oldValue);");
        }
      }

      // Output generate code
      // alert("Code:\n\n" + code);
      // Generate new function from code
      var setter = new Function("newValue", code.toString());

      // Overriding temporary setter
      proto[mode + config.upname] = setter;

      // Executing new setter
      return obj[mode + config.upname](vValue);
    }
  }
});
