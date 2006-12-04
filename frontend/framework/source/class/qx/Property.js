/*
#module(newproperties)
#require(qx.type.StringBuilder)
#require(qx.lang.Object)
*/

qx.OO.defineClass("qx.Property",
{
  validation :
  {
    "defined" : 'vNew != undefined',
    "null" : 'vNew === null',
    "string" : 'typeof vNew == "string"',
    "boolean" : 'typeof vNew == "boolean"',
    "number" : 'typeof vNew == "number" && !isNaN(vNew)',
    "object" : 'vNew != null && typeof vNew == "object"',
    "array" : 'vNew instanceof Array'
  },





  getterFieldOrder : [ "_user_values_ng", "_appearance_values_ng" ],

  generateGetter : function(vObject, vName)
  {
    var vConf = vObject._properties_ng[vName];
    var vProto = vConf.proto;

    vProto.debug("Creating real getter for " + vName);

    // Starting code generation
    var vCode = new qx.type.StringBuilder;

    // Including user and appearance values
    for (var i=0, a=this.getterFieldOrder, l=a.length; i<l; i++)
    {
      vCode.add("if(this.");
      vCode.add(a[i]);
      vCode.add(".");
      vCode.add(vName);
      vCode.add("!==undefined)return this.");
      vCode.add(a[i]);
      vCode.add(".")
      vCode.add(vName);
      vCode.add(";");
    }

    // Including code for default value
    vCode.add("return this._properties_ng.");
    vCode.add(vName);
    vCode.add(".init");

    // Output generate code
    // alert("Code:\n\n" + vCode);

    // Generate new function from code
    var vGetter = new Function("vNew", vCode.toString());

    // Overriding temporary setter
    vProto["get" + vConf.upname] = vGetter;

    // Executing new setter
    return vObject["get" + vConf.upname]();
  },






  generateSetter : function(vObject, vMode, vName, vValue)
  {
    var vConf = vObject._properties_ng[vName];
    var vProto = vConf.proto;

    vProto.debug("Creating setter for " + vMode + "/" + vName);





    // Starting code generation
    var vCode = new qx.type.StringBuilder;

    // Debug output
    // vCode.add("this.debug('Property: " + vName + ": ' + vNew);");

    // Validation and value compare should only be used in the real setter
    if (vMode === "set")
    {
      // Read old value
      vCode.add("var vOld=this._user_values_ng.");
      vCode.add(vName);
      vCode.add(";");

      // Check value change
      vCode.add("if(vOld===vNew)return;");

      // TODO: Implement check()

      // Validation code
      if (vConf.validation != undefined)
      {
        // TODO: Replace with new registry
        if (vConf.validation in qx.OO.classes)
        {
          vCode.add("if(!(vNew instanceof ");
          vCode.add(vConf.validation)
          vCode.add("))this.error('Invalid value for property ");
          vCode.add(vName);
          vCode.add(": ' + vNew);");
        }
        else if (vConf.validation in this.validation)
        {
          vCode.add("if(!(");
          vCode.add(this.validation[vConf.validation])
          vCode.add("))this.error('Invalid value for property ");
          vCode.add(vName);
          vCode.add(": ' + vNew);");
        }
        else
        {
          this.error("Could not add validation to property " + vName + ". Invalid method.");
        }
      }
    }

    if (vMode === "toggle")
    {
      // Toggle current value
      vCode.add("this._user_values_ng.");
      vCode.add(vName);
      vCode.add("=!this._user_values_ng.");
      vCode.add(vName);
      vCode.add(";");
    }
    else
    {
      // Store new value
      vCode.add("this._user_values_ng.");
      vCode.add(vName);
      vCode.add("=vNew;");
    }


    // TODO: Implement modifier()




    // Add event dispatcher
    if (vMode === "set")
    {
      // Needs to be fired if
      // * the value was configured (also null is OK) and was reconfigured now (no additional check)
      // * the value was undefined and is configured now (compare real value with old value first)

      if (vConf.fire !== false && vProto.createDispatchDataEvent)
      {
        vCode.add("this.createDispatchDataEvent('change");
        vCode.add(vConf.upname);
        vCode.add("', vNew, vOld);");
      }
    }






    // Output generate code
    // alert("Code:\n\n" + vCode);

    // Generate new function from code
    var vSetter = new Function("vNew", vCode.toString());

    // Overriding temporary setter
    vProto[vMode + vConf.upname] = vSetter;

    // Executing new setter
    return vObject[vMode + vConf.upname](vValue);
  }
});
