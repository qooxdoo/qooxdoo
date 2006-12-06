/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2006 by 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL 2.1: http://www.gnu.org/licenses/lgpl.html

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

#id(qx.Clazz)
#module(core)
#load(qx.Mixin)
#load(qx.Interface)
#load(qx.Settings)
#load(qx.Locale)
#load(qx.lang.Object)

************************************************************************ */

/*
 * Bootstrapping needed to let qx.Clazz create itself
 */
qx.Clazz = {};

/** registers all defined classes */
qx.Clazz._registry = { "qx.Clazz": qx.Clazz };

/**
 * Class definition
 *
 * Example:
 * qx.Clazz.define("fullname",
 * {
 *   "extend": SuperClass,
 *   "implement": [Interfaces],
 *   "include" : [Mixins],
 *
 *   "statics":
 *   {
 *     static_property1: 3.141,
 *     static_method1: function() {}
 *   },
 *
 *   "properties":
 *   {
 *     "tabIndex": {type: "number", init: -1}
 *   },
 *
 *   "members":
 *   {
 *     public_property1: 3.141,
 *     public_method1: function() {},
 *
 *     _protected_property: 3.141,
 *     _protected_method1: function() {},
 *   }
 * });
 *
 * @param fullname {String} class name
 * @param definition {Map,null} definition structure
 * @param definition.extend {Class,null} super class
 * @param definition.implement {List,null} list of interfaces that need to be implemented
 * @param definition.include {List,null} list of mixins to include
 * @param definition.settings {Map,null} hash of settings for this class
 * @param definition.init {Function,null} constructor method to run on each initialization
 * @param definition.statics {Map,null} hash of static properties and methods ("class members")
 * @param definition.properties {Map,null} hash of properties with generated setters and getters
 * @param definition.properties_ng {Map,null} hash of next-gen properties with generated setters and getters
 * @param definition.members {Map,null} hash of regular properties and methods ("instance members")
 */
qx.Clazz.define = function(fullname, definition)
{

  /*
  ---------------------------------------------------------------------------
    Setting up namespace
  ---------------------------------------------------------------------------
  */

  var vSplitName = fullname.split(".");
  var vLength = vSplitName.length;
  var vParentPackage = window;
  var vPartName = vSplitName[0];

  for (var i=0, l=vSplitName.length-1; i<l; i++)
  {
    if (!vParentPackage[vPartName]) {
      vParentPackage[vPartName] = {};
    }

    vParentPackage = vParentPackage[vPartName];
    vPartName = vSplitName[i+1];
  }






  /*
  ---------------------------------------------------------------------------
    Read in configuration map
  ---------------------------------------------------------------------------
  */

  var vSuperClass, vInterfaces, vMixins, vSettings, vConstructor, vStatics, vProperties, vPropertiesNg, vMembers;
  var vKey, vValue;

  for (vKey in definition)
  {
    vValue = definition[vKey];

    if (!vValue) {
      throw new Error("Invalid key '" + vKey + "' in class '" + fullname + "'! Value is undefined!");
    }

    switch(vKey)
    {
      case "extend":
        vSuperClass = vValue;
        break;

      case "implement":
        vInterfaces = vValue;
        break;

      case "include":
        vMixins = vValue;
        break;

      case "settings":
        vSettings = vValue;
        break;

      case "init":
        vConstructor = vValue;
        break;

      case "statics":
        vStatics = vValue;
        break;

      // Next generation property implementation
      // Will be ready for 0.8
      case "properties_ng":
        vPropertiesNg = vValue;
        break;

      // Compatibility to 0.6.x style properties
      case "properties":
        vProperties = vValue;
        break;

      case "members":
        vMembers = vValue;
        break;

      default:
        throw new Error("Invalid key '" + vKey + "' in class '" + fullname + "'! Key is not allowed!");
    }
  }





  /*
  ---------------------------------------------------------------------------
    Create static classes
  ---------------------------------------------------------------------------
  */

  if (!vSuperClass)
  {
    if (vConstructor) {
      throw new Error("SuperClass is undefined, but constructor was given for class: " + fullname);
    }

    // Create empty/non-empty class
    var vClass = vMembers || {};

    // Store class into namespace
    vParentPackage[vPartName] = vClass;

    // Store class name
    vClass.classname = fullname;
    vClass.basename = vPartName;

    // Compatibility to 0.6.x
    qx.Proto = null;
    qx.Class = vClass;

    // Store class reference in global class registry
    this._registry[fullname] = vClass;

    // Quit here
    return;
  }






  /*
  ---------------------------------------------------------------------------
    Basic inheritance
  ---------------------------------------------------------------------------
  */

  if (!vConstructor) {
    throw new Error("Constructor missing for class " + fullname);
  }

  // Store class pointer
  var vClass = vConstructor;

  // Store class into namespace
  vParentPackage[vPartName] = vClass;

  // Use helper function/class to save the unnecessary constructor call while
  // setting up inheritance. Safari does not support "new Function"
  var vHelperClass = function() {};
  vHelperClass.prototype = vSuperClass.prototype;
  var vPrototype = new vHelperClass;

  // Apply prototype to new helper instance
  vClass.prototype = vPrototype;

  // Store own class and base name
  vClass.classname = vPrototype.classname = fullname;
  vClass.basename = vPrototype.basename = vPartName;

  // Store reference to super class
  vClass.superclass = vPrototype.superclass = vSuperClass;

  // Store base constructor to constructor
  vConstructor.base = vSuperClass;

  // Store correct constructor
  vClass.constructor = vPrototype.constructor = vConstructor;

  // Register class into registry
  this._registry[fullname] = vClass;

  // Compatibility to 0.6.x
  qx.Proto = vPrototype;
  qx.Class = vClass;






  /*
  ---------------------------------------------------------------------------
    Settings
  ---------------------------------------------------------------------------
  */

  if (vSettings)
  {
    for (var vKey in vSettings) {
      qx.Settings.setDefault(vKey, vSettings[vKey]);
    }
  }






  /*
  ---------------------------------------------------------------------------
    Attach class members
  ---------------------------------------------------------------------------
  */

  if (vStatics)
  {
    for(var vProp in vStatics) 
    {
      vClass[vProp] = vStatics[vProp];
      
      // Added helper stuff to functions
      if (typeof vStatics[vProp] == "function")
      {
        // Configure class
        vClass[vProp].statics = vClass;
      }
    }
  }






  /*
  ---------------------------------------------------------------------------
    Merge in the mixins
  ---------------------------------------------------------------------------
  */

  if (vMixins)
  {
    var vMixinMembers;

    if (vMixins instanceof Array)
    {
      for (i=0, l=vMixins.length; i<l; i++)
      {
        if (!vMixins[i]) {
          throw new Error("Invalid mixin at position " + i);
        }

        // Attach members
        vMixinMembers = vMixins[i]._members;
        for (var vProp in vMixinMembers) {
          vPrototype[vProp] = vMixinMembers[vProp];
        }
      }
    }
    else
    {
      // Attach members
      vMixinMembers = vMixins._members;
      for (var vProp in vMixinMembers) {
        vPrototype[vProp] = vMixinMembers[vProp];
      }
    }
  }






  /*
  ---------------------------------------------------------------------------
    Attach properties
  ---------------------------------------------------------------------------
  */

  if (vProperties)
  {
    var vProperty;

    for (var i=0,l=vProperties.length;i<l;i++)
    {
      vProperty = vProperties[i];

      if (vProperty.fast) {
        qx.OO.addFastProperty(vProperty);
      } else if (vProperty.cached) {
        qx.OO.addCachedProperty(vProperty);
      } else {
        qx.OO.addProperty(vProperty);
      }
    }
  }

  if (vPropertiesNg)
  {
    var vClassProperties = vPrototype._properties_ng;

    // Copy property databases from superclass
    if (vClassProperties === vSuperClass.prototype._properties_ng)
    {
      vClassProperties = vPrototype._properties_ng = qx.lang.Object.copy(vSuperClass.prototype._properties_ng);
      vInitClassProperties = vPrototype._properties_init_ng = qx.lang.Array.copy(vSuperClass.prototype._properties_init_ng);
    }

    // Create stuff for each property in definition
    for (var vName in vPropertiesNg)
    {
      // Store entry inside local variable
      var vEntry = vPropertiesNg[vName];

      // Fill in the inherited stuff from the superclass
      if (vClassProperties[vName])
      {
        var vSuperEntry = vPrototype._properties_ng[vName];

        for (var vKey in vSuperEntry)
        {
          if (!(vKey in vEntry)) {
            vEntry[vKey] = vSuperEntry[vKey];
          }
        }
      }

      // Update prototype relation (needed to apply the optimized setter pairs to the correct prototype)
      vEntry.proto = vPrototype;

      // Store/Replace reference to new data field
      vClassProperties[vName] = vEntry;

      // If this property has a default/init value, we need to remember it
      vInitClassProperties.push(vName);

      // Store generated uppercase name
      var vUpName = vEntry.upname = vName.charAt(0).toUpperCase() + vName.substr(1);

      // Generate getter methods
      vPrototype["get" + vUpName] = new Function("return this._user_values_ng." + vName);
      vPrototype["getInit" + vUpName] = new Function("return this._properties_ng." + vName + ".init");
      vPrototype["getAppearance" + vUpName] = new Function("return this._appearance_values_ng." + vName);
      vPrototype["getReal" + vUpName] = new Function("return qx.Property.generateGetter(this, '" + vName + "');");

      // Generate wrapper methods (real code generation is lazy)
      vPrototype["set" + vUpName] = new Function("vNew", "return qx.Property.generateSetter(this, 'set', '" + vName + "', vNew);");
      vPrototype["force" + vUpName] = new Function("vNew", "return qx.Property.generateSetter(this, 'force', '" + vName + "', vNew);");
      vPrototype["reset" + vUpName] = new Function("vNew", "return qx.Property.generateSetter(this, 'reset', '" + vName + "', vNew);");

      // Generate toggle feature for boolean values
      if (vEntry.validation === "boolean") {
        vPrototype["toggle" + vUpName] = new Function("vNew", "return qx.Property.generateSetter(this, 'toggle', '" + vName + "', vNew);");
      }
    }
  }






  /*
  ---------------------------------------------------------------------------
    Attach instance members
  ---------------------------------------------------------------------------
  */

  if (vMembers)
  {
    var vSuperProto = vSuperClass.prototype;

    for(var vProp in vMembers)
    {
      // Attach member
      vPrototype[vProp] = vMembers[vProp];

      // Added helper stuff to functions
      if (typeof vMembers[vProp] == "function")
      {
        // Configure superclass (named base here)
        vPrototype[vProp].base = vSuperProto[vProp];
  
        // Configure class
        vPrototype[vProp].statics = vClass;
      }
    }
  }







  /*
  ---------------------------------------------------------------------------
    Check interface implementation
  ---------------------------------------------------------------------------
  */

  if (vInterfaces)
  {
    if (vInterfaces instanceof Array)
    {
      var vTotal = vInterfaces.length;

      var vInterfaceMembers;

      for (i=0; i<vTotal; i++)
      {
        if (typeof vInterfaces[i] === "undefined" || !vInterfaces[i].isInterface) {
          throw new Error("Interface no. " + (i+1) + " to extend from is invalid.");
        }

        vInterfaceMembers = vInterfaces[i]._members;

        for (vProp in vInterfaceMembers) {

          if (typeof vInterfaceMembers[vProp] === "function")
          {
            if (typeof vPrototype[vProp] === "undefined") {
              throw new Error("Implementation of method " + vProp + "() missing in class " + fullname + " required by interface " + vInterfaces[i].name);
            }
          } else if (typeof vClass[vProp] !== "undefined")
          {
            throw new Error("Existing property " + vProp + " in class " + fullname + " conflicts with interface " + vInterfaces[i].name);
          }
          else
          {
            // attach as class member. TODO: Does this make sense??
            vClass[vProp] = vInterfaceMembers[vProp];
          }
        }
      }
    }
    else
    {
      // TODO
    }
  }
};


/**
 * Determine if class exists
 * @param fullname {String} class name to check
 * @return {Boolean} true if class exists
 */
qx.Clazz.isDefined = function(fullname) {
  return this._registry[fullname] != null;
};


/**
 * Includes a mixin into an already define class
 * @param vClass {Function} class to extend
 * @param vMixin {Function} mixin to include
 * @return {Boolean} true if was successful
 */
qx.Clazz.include = function(vClass, vMixin)
{
  var vPrototype = vClass.prototype;

  // Attach members
  var vMixinMembers = vMixins._members;
  for (var vProp in vMixinMembers) {
    vPrototype[vProp] = vMixinMembers[vProp];
  }

  // Attach properties
  // TODO: Implementation

  return true;
}
