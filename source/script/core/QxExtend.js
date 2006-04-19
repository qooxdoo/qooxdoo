/* ************************************************************************

   qooxdoo - the new era of web interface development

   Copyright:
     (C) 2004-2006 by Schlund + Partner AG, Germany
         All rights reserved

   License:
     LGPL 2.1: http://creativecommons.org/licenses/LGPL/2.1/

   Internet:
     * http://qooxdoo.oss.schlund.de

   Authors:
     * Sebastian Werner (wpbasti)
       <sebastian dot werner at 1und1 dot de>
     * Andreas Ecker (aecker)
       <andreas dot ecker at 1und1 dot de>

************************************************************************ */

/* ************************************************************************

#package(core)
#require(QxNative)
#require(QxMain)

************************************************************************ */



/*
---------------------------------------------------------------------------
  OBJECT EXTEND IMPLEMENTATION
---------------------------------------------------------------------------
*/

Function.prototype.extend = function(vSuper, vClassName)
{
  if (typeof vSuper !== QxConst.TYPEOF_FUNCTION) {
    throw new Error("Extend: Function/Constructor to extend from is not a function: " + vSuper);
  };

  if (typeof vClassName !== QxConst.TYPEOF_STRING) {
    throw new Error("Extend: Missing or malformed className: " + vClassName);
  };

  // build helper function
  // this omits the initial constructor call while inherit properties
  var f = new Function;
  f.prototype = vSuper.prototype;
  proto = this.prototype = new f;

  this.superclass = vSuper;

  proto.classname = this.classname = vClassName;
  proto.constructor = this;

  // Global storage
  QxMain.classes[vClassName] = this;

  return proto;
};





/*
---------------------------------------------------------------------------
  OBJECT PROPERTY EXTENSION
---------------------------------------------------------------------------
*/

Function.prototype.addFastProperty = function(vConfig)
{
  var vName = vConfig.name;
  var vUpName = vName.toFirstUp();

  var vStorageField = QxConst.INTERNAL_VALUE + vUpName;
  var vGetterName = QxConst.INTERNAL_GET + vUpName;
  var vSetterName = QxConst.INTERNAL_SET + vUpName;
  var vComputerName = QxConst.INTERNAL_COMPUTE + vUpName;

  proto[vStorageField] = typeof vConfig.defaultValue !== QxConst.TYPEOF_UNDEFINED ? vConfig.defaultValue : null;

  if (vConfig.noCompute)
  {
    proto[vGetterName] = function() {
      return this[vStorageField];
    };
  }
  else
  {
    proto[vGetterName] = function() {
      return this[vStorageField] == null ? this[vStorageField] = this[vComputerName]() : this[vStorageField];
    };
  };

  if (vConfig.setOnlyOnce)
  {
    proto[vSetterName] = function(vValue)
    {
      this[vStorageField] = vValue;
      this[vSetterName] = null;

      return vValue;
    };
  }
  else
  {
    proto[vSetterName] = function(vValue) {
      return this[vStorageField] = vValue;
    };
  };

  if (!vConfig.noCompute)
  {
    proto[vComputerName] = function() {
      return null;
    };
  };
};

Function.prototype.addCachedProperty = function(p)
{
  var vName = p.name;
  var vUpName = vName.toFirstUp();

  var vStorageField = QxConst.INTERNAL_CACHED + vUpName;
  var vComputerName = QxConst.INTERNAL_COMPUTE + vUpName;
  var vChangeName = QxConst.INTERNAL_PRIVATECHANGE + vUpName;

  if (typeof p.defaultValue !== QxConst.TYPEOF_UNDEFINED) {
    proto[vStorageField] = p.defaultValue;
  };

  proto[QxConst.INTERNAL_GET + vUpName] = function()
  {
    if (this[vStorageField] == null) {
      this[vStorageField] = this[vComputerName]();
    };

    return this[vStorageField];
  };

  proto[QxConst.INTERNAL_INVALIDATE + vUpName] = function()
  {
    if (this[vStorageField] != null)
    {
      this[vStorageField] = null;

      if (p.addToQueueRuntime) {
        this.addToQueueRuntime(p.name);
      };
    };
  };

  proto[QxConst.INTERNAL_RECOMPUTE + vUpName] = function()
  {
    var vOld = this[vStorageField];
    var vNew = this[vComputerName]();

    if (vNew != vOld)
    {
      this[vStorageField] = vNew;
      this[vChangeName](vNew, vOld);

      return true;
    };

    return false;
  };

  proto[vChangeName] = function(vNew, vOld) {};
  proto[vComputerName] = function() { return null; };
};

Function.prototype.addPropertyGroup = function(p)
{
  /* --------------------------------------------------------------------------------
      PRE-CHECKS
  -------------------------------------------------------------------------------- */
  if(typeof p !== QxConst.TYPEOF_OBJECT) {
    throw new Error("Param should be an object!");
  };

  if (QxUtil.isInvalid(p.name)) {
    throw new Error("Malformed input parameters: name needed!");
  };

  if (QxUtil.isInvalid(p.members)) {
    throw new Error("Malformed input parameters: members needed!");
  };

  p.method = p.name.toFirstUp();


  /* --------------------------------------------------------------------------------
      CACHING
  -------------------------------------------------------------------------------- */
  p.getter = [];
  p.setter = [];

  for (var i=0, l=p.members.length; i<l; i++) {
    p.setter.push(QxConst.INTERNAL_SET + p.members[i].toFirstUp());
  };

  for (var i=0, l=p.members.length; i<l; i++) {
    p.getter.push(QxConst.INTERNAL_GET + p.members[i].toFirstUp());
  };


  /* --------------------------------------------------------------------------------
      GETTER
  -------------------------------------------------------------------------------- */
  this.prototype[QxConst.INTERNAL_GET + p.method] = function()
  {
    var a = [];
    var g = p.getter;

    for (var i=0, l=g.length; i<l; i++) {
      a.push(this[g[i]]());
    };

    return a;
  };


  /* --------------------------------------------------------------------------------
      SETTER
  -------------------------------------------------------------------------------- */
  switch(p.mode)
  {
    case "shorthand":
      this.prototype[QxConst.INTERNAL_SET + p.method] = function()
      {
        if (arguments.length > 4 || arguments.length == 0) {
          throw new Error("Invalid number of arguments for property " + p.name + ": " + arguments);
        };

        try
        {
          var ret = QxUtil.convertShortHandToArray(arguments);
        }
        catch(ex)
        {
          throw new Error("Invalid shorthand values for property " + p.name + ": " + arguments + ": " + ex);
        };

        var s = p.setter;
        var l = s.length;

        for (var i=0; i<l; i++) {
          this[s[i]](ret[i]);
        };
      };
      break;

    default:
      this.prototype[QxConst.INTERNAL_SET + p.method] = function()
      {
        var s = p.setter;
        var l = s.length;

        if (arguments.length != l) {
          throw new Error("Invalid number of arguments (needs: " + l + ", is: " + arguments.length + ") for property " + p.name + ": " + QxUtil.convertArgumentsToArray(arguments).toString());
        };

        for (var i=0; i<l; i++) {
          this[s[i]](arguments[i]);
        };
      };
  };
};

Function.prototype.removeProperty = function(p)
{
  if (typeof this.prototype._properties !== QxConst.TYPEOF_STRING) {
    throw new Error("Has no properties!");
  };

  if(typeof p !== QxConst.TYPEOF_OBJECT) {
    throw new Error("Param should be an object!");
  };

  if (QxUtil.isInvalid(p.name)) {
    throw new Error("Malformed input parameters: name needed!");
  };

  // building shorter prototype access
  var pp = this.prototype;

  p.method = p.name.toFirstUp();
  p.implMethod = p.impl ? p.impl.toFirstUp() : p.method;

  var valueKey = QxConst.INTERNAL_VALUE + p.method;

  // Remove property from list
  pp._properties = pp._properties.remove(p.name);

  // Reset default value to null
  pp[valueKey] = null;

  // Reset methods
  pp[QxConst.INTERNAL_GET + p.method] = null;
  pp[QxConst.INTERNAL_SET + p.method] = null;
  pp[QxConst.INTERNAL_RESET + p.method] = null;
  pp[QxConst.INTERNAL_APPLY + p.method] = null;
  pp[QxConst.INTERNAL_FORCE + p.method] = null;
  pp[QxConst.INTERNAL_GETDEFAULT + p.method] = null;
  pp[QxConst.INTERNAL_SETDEFAULT + p.method] = null;
};

Function.prototype._createProperty = function(p)
{
  if(typeof p !== QxConst.TYPEOF_OBJECT) {
    throw new Error("AddProperty: Param should be an object!");
  };

  if (QxUtil.isInvalid(p.name)) {
    throw new Error("AddProperty: Malformed input parameters: name needed!");
  };

  // building shorter prototype access
  var pp = this.prototype;

  p.method = p.name.toFirstUp();
  p.implMethod = p.impl ? p.impl.toFirstUp() : p.method;

  if (QxUtil.isInvalid(p.defaultValue)) {
    p.defaultValue = null;
  };

  if (QxUtil.isInvalidBoolean(p.allowNull)) {
    p.allowNull = true;
  };

  if (QxUtil.isInvalidBoolean(p.allowMultipleArguments)) {
    p.allowMultipleArguments = false;
  };






  if (typeof p.type === QxConst.TYPEOF_STRING) {
    p.hasType = true;
  }
  else if (typeof p.type !== QxConst.TYPEOF_UNDEFINED) {
    throw new Error("AddProperty: Invalid type definition for property " + p.name + ": " + p.type);
  }
  else {
    p.hasType = false;
  };

  if (typeof p.instance === QxConst.TYPEOF_STRING) {
    p.hasInstance = true;
  }
  else if (typeof p.instance !== QxConst.TYPEOF_UNDEFINED) {
    throw new Error("AddProperty: Invalid instance definition for property " + p.name + ": " + p.instance);
  }
  else {
    p.hasInstance = false;
  };

  if (typeof p.classname === QxConst.TYPEOF_STRING) {
    p.hasClassName = true;
  }
  else if (typeof p.classname !== QxConst.TYPEOF_UNDEFINED) {
    throw new Error("AddProperty: Invalid classname definition for property " + p.name + ": " + p.classname);
  }
  else {
    p.hasClassName = false;
  };






  p.hasConvert = QxUtil.isValidFunction(p.convert);
  p.hasPossibleValues = QxUtil.isValidArray(p.possibleValues);
  p.hasUnitDetection = QxUtil.isValidString(p.unitDetection);

  p.addToQueue = p.addToQueue || false;
  p.addToQueueRuntime = p.addToQueueRuntime || false;

  // upper-case name
  p.up = p.name.toUpperCase();

  // register global uppercase name
  QxConst[QxConst.INTERNAL_GLOBALPROPERTYREF + p.up] = p.name;

  var valueKey = QxConst.INTERNAL_VALUE + p.method;
  var evalKey = QxConst.INTERNAL_EVAL + p.method;
  var changeKey = QxConst.INTERNAL_CHANGE + p.method;
  var modifyKey = QxConst.INTERNAL_MODIFY + p.implMethod;
  var checkKey = QxConst.INTERNAL_CHECK + p.implMethod;

  if (!QxMain.setter[p.name])
  {
    QxMain.setter[p.name] = QxConst.INTERNAL_SET + p.method;
    QxMain.getter[p.name] = QxConst.INTERNAL_GET + p.method;
    QxMain.resetter[p.name] = QxConst.INTERNAL_RESET + p.method;
    QxMain.values[p.name] = valueKey;
  };

  // unit detection support
  if (p.hasUnitDetection)
  {
    // computed unit
    var cu = QxConst.INTERNAL_COMPUTED + p.method;
    pp[cu + QxConst.INTERNAL_UNIT_VALUE] = null;
    pp[cu + QxConst.INTERNAL_UNIT_PARSED] = null;
    pp[cu + QxConst.INTERNAL_UNIT_TYPE] = null;
    pp[cu + QxConst.INTERNAL_UNIT_TYPE_NULL] = true;
    pp[cu + QxConst.INTERNAL_UNIT_TYPE_PIXEL] = false;
    pp[cu + QxConst.INTERNAL_UNIT_TYPE_PERCENT] = false;
    pp[cu + QxConst.INTERNAL_UNIT_TYPE_AUTO] = false;
    pp[cu + QxConst.INTERNAL_UNIT_TYPE_FLEX] = false;

    var unitDetectionKey = QxConst.INTERNAL_UNITDETECTION + p.unitDetection.toFirstUp();
  };

  // apply default value
  pp[valueKey] = p.defaultValue;

  // building getFoo(): Returns current stored value
  pp[QxConst.INTERNAL_GET + p.method] = function() {
    return this[valueKey];
  };

  // building forceFoo(): Set (override) without do anything else
  pp[QxConst.INTERNAL_FORCE + p.method] = function(newValue) {
    return this[valueKey] = newValue;
  };

  // building resetFoo(): Reset value to default value
  pp[QxConst.INTERNAL_RESET + p.method] = function() {
    return this[QxConst.INTERNAL_SET + p.method](p.defaultValue);
  };

  // building toggleFoo(): Switching between two boolean values
  if (p.type === QxConst.TYPEOF_BOOLEAN)
  {
    pp[QxConst.INTERNAL_TOGGLE + p.method] = function(newValue) {
      return this[QxConst.INTERNAL_SET + p.method](!this[valueKey]);
    };
  };

  if (p.allowMultipleArguments || p.hasConvert || p.hasInstance || p.hasClassName || p.hasPossibleValues || p.hasUnitDetection || p.addToQueue || p.addToQueueRuntime || p.addToStateQueue)
  {
    // building setFoo(): Setup new value, do type and change detection, converting types, call unit detection, ...
    pp[QxConst.INTERNAL_SET + p.method] = function(newValue)
    {
      // convert multiple arguments to array
      if (p.allowMultipleArguments && arguments.length > 1) {
        newValue = QxUtil.convertArgumentsToArray(arguments);
      };

      // support converter methods
      if (p.hasConvert)
      {
        try
        {
          newValue = p.convert.call(this, newValue, p);
        }
        catch(ex)
        {
          throw new Error("Attention! Could not convert new value for " + p.name + ": " + newValue + ": " + ex);
        };
      };

      var oldValue = this[valueKey];

      if (newValue === oldValue) {
        return newValue;
      };

      if (!(p.allowNull && newValue == null))
      {
        if (p.hasType && typeof newValue !== p.type) {
          return this.error("Attention! The value \"" + newValue + "\" is an invalid value for the property \"" + p.name + "\" which must be typeof \"" + p.type + "\" but is typeof \"" + typeof newValue + "\"!", QxConst.INTERNAL_SET + p.method);
        };

        if (p.hasInstance && !(newValue instanceof QxMain.classes[p.instance])) {
          return this.error("Attention! The value \"" + newValue + "\" is an invalid value for the property \"" + p.name + "\" which must be an instance of \"" + p.instance + "\"!", QxConst.INTERNAL_SET + p.method);
        };

        if (p.hasClassName && newValue.classname != p.classname) {
          return this.error("Attention! The value \"" + newValue + "\" is an invalid value for the property \"" + p.name + "\" which must be an object with the classname \"" + p.classname + "\"!", QxConst.INTERNAL_SET + p.method);
        };

        if (p.hasPossibleValues && newValue != null && !p.possibleValues.contains(newValue)) {
          return this.error("Failed to save value for " + p.name + ". '" + newValue + "' is not a possible value!", QxConst.INTERNAL_SET + p.method);
        };
      };

      // Allow to check and transform the new value before storage
      if (this[checkKey])
      {
        try
        {
          newValue = this[checkKey](newValue, p);

          // Don't do anything if new value is indentical to old value
          if (newValue === oldValue) {
            return newValue;
          };
        }
        catch(ex)
        {
          return this.error("Failed to check property " + p.name + ": " + ex, checkKey);
        };
      };

      // Store new value
      this[valueKey] = newValue;

      // Check if there is a modifier implementation
      if (this[modifyKey])
      {
        try
        {
          var r = this[modifyKey](newValue, oldValue, p);
          if (!r) {
            return this.error("Modification of property \"" + p.name + "\" failed without exception (" + r + ")", modifyKey);
          };
        }
        catch(ex)
        {
          return this.error("Modification of property \"" + p.name + "\" failed with exception (" + ex + ")", modifyKey);
        };
      };

      // Unit detection support
      if (p.hasUnitDetection) {
        this[unitDetectionKey](p, newValue);
      };

      // Auto queue addition support
      if (p.addToQueue) {
        this.addToQueue(p.name);
      }
      else if (p.addToQueueRuntime) {
        this.addToQueueRuntime(p.name);
      };

      // Auto state queue addition support
      if (p.addToStateQueue) {
        this.addToStateQueue();
      };

      // Create Event
      if (this.hasEventListeners && this.hasEventListeners(changeKey))
      {
        try
        {
          this.createDispatchDataEvent(changeKey, newValue);
        }
        catch(ex)
        {
          throw new Error("Property " + p.name + " modified: Failed to dispatch change event: " + ex);
        };
      };

      return newValue;
    };
  }
  else
  {
    // building setFoo(): Setup new value, do type and change detection, converting types, call unit detection, ...
    pp[QxConst.INTERNAL_SET + p.method] = function(newValue)
    {
      // this.debug("Fast Setter: " + p.name);

      var oldValue = this[valueKey];

      if (newValue === oldValue) {
        return newValue;
      };

      if (!(p.allowNull && newValue == null))
      {
        if (p.hasType && typeof newValue !== p.type) {
          return this.error("Attention! The value \"" + newValue + "\" is an invalid value for the property \"" + p.name + "\" which must be typeof \"" + p.type + "\" but is typeof \"" + typeof newValue + "\"!", QxConst.INTERNAL_SET + p.method);
        };
      };

      // Allow to check and transform the new value before storage
      if (this[checkKey])
      {
        try
        {
          newValue = this[checkKey](newValue, p);

          // Don't do anything if new value is indentical to old value
          if (newValue === oldValue) {
            return newValue;
          };
        }
        catch(ex)
        {
          return this.error("Failed to check property " + p.name + ": " + ex, checkKey);
        };
      };

      // Store new value
      this[valueKey] = newValue;

      // Check if there is a modifier implementation
      if (this[modifyKey])
      {
        try
        {
          var r = this[modifyKey](newValue, oldValue, p);
          if (!r) {
            return this.error("Modification of property \"" + p.name + "\" failed without exception (" + r + ")", modifyKey);
          };
        }
        catch(ex)
        {
          return this.error("Modification of property \"" + p.name + "\" failed with exception (" + ex + ")", modifyKey);
        };
      };

      // Create Event
      if (this.hasEventListeners && this.hasEventListeners(changeKey))
      {
        var vEvent = new QxDataEvent(changeKey, newValue, oldValue, false);

        vEvent.setTarget(this);

        try
        {
          this.dispatchEvent(vEvent, true);
        }
        catch(ex)
        {
          throw new Error("Property " + p.name + " modified: Failed to dispatch change event: " + ex);
        };
      };

      return newValue;
    };
  };

  // building user configured get alias for property
  if (typeof p.getAlias === QxConst.TYPEOF_STRING) {
    pp[p.getAlias] = pp[QxConst.INTERNAL_GET + p.method];
  };

  // building user configured set alias for property
  if (typeof p.setAlias === QxConst.TYPEOF_STRING) {
    pp[p.setAlias] = pp[QxConst.INTERNAL_SET + p.method];
  };
};

Function.prototype.changeProperty = Function.prototype._createProperty;

Function.prototype.addProperty = function(p)
{
  QxMain.propertyNumber++;

  this._createProperty(p);

  // add property to (all) property list
  if (typeof this.prototype._properties !== QxConst.TYPEOF_STRING) {
    this.prototype._properties = p.name;
  } else {
    this.prototype._properties += QxConst.CORE_COMMA + p.name;
  };

  // add property to object property list
  switch(p.type)
  {
    case undefined:
    case QxConst.TYPEOF_OBJECT:
    case QxConst.TYPEOF_FUNCTION:
      if (typeof this.prototype._objectproperties !== QxConst.TYPEOF_STRING) {
        this.prototype._objectproperties = p.name;
      } else {
        this.prototype._objectproperties += QxConst.CORE_COMMA + p.name;
      };
  };
};
