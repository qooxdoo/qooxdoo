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
#require(qx.OO)
#require(qx.Const)
#require(qx.core.Settings)
#require(qx.util.Validation)
#use(qx.sys.Client)
#use(qx.dev.Debug)

************************************************************************ */

/*!
  The qooxdoo basic object. All qooxdoo classes extends this one
*/
qx.OO.defineClass("qx.core.Object", Object, 
function(vAutoDispose)
{
  this._hashCode = qx.core.ObjectCounter++;

  if (vAutoDispose !== false) {
    qx.core.ObjectDataBase.push(this);
  };
});




/* ************************************************************************
   Class data, properties and methods
************************************************************************ */

qx.core.ObjectCounter = 0;
qx.core.ObjectDataBase = [];

qx.core.ObjectUnload = function()
{
  qx.core.Object.dispose();
  qx.dom.DomEventRegistration.removeEventListener(window, qx.Const.EVENT_TYPE_UNLOAD, qx.core.ObjectUnload);
};

qx.dom.DomEventRegistration.addEventListener(window, qx.Const.EVENT_TYPE_UNLOAD, qx.core.ObjectUnload);

qx.core.Object.toHashCode = function(o)
{
  if(o._hashCode != null) {
    return o._hashCode;
  };

  return o._hashCode = qx.core.ObjectCounter++;
};

qx.core.Object.dispose = function()
{
  // qx.dev.Debug("qx.core.Object", "Disposing Application");

  var vStart = (new Date).valueOf();
  var vObject;

  for (var i=qx.core.ObjectDataBase.length-1; i>=0; i--)
  {
    vObject = qx.core.ObjectDataBase[i];

    if (vObject != null)
    {
      // qx.dev.Debug("qx.core.Object", "Disposing: " + vObject);
      vObject.dispose();
      qx.core.ObjectDataBase[i] = null;
    };
  };

  // qx.dev.Debug("qx.core.Object", "Done in: " + ((new Date).valueOf() - vStart) + "ms");
};

qx.OO.addProperty({ name : "enabled", type : qx.Const.TYPEOF_BOOLEAN, defaultValue : true, getAlias : "isEnabled" });

qx.core.Object.DEBUG_MSG_BEFORE = "[HASHCODE:";
qx.core.Object.DEBUG_MSG_AFTER = "]";
qx.core.Object.DEBUG_FUNCERRORPRE = "Failed to execute \"";
qx.core.Object.DEBUG_FUNCERRORPOST = "()\": ";






/* ************************************************************************
   Instance data, properties and methods
************************************************************************ */

/*
---------------------------------------------------------------------------
  UTILITIES
---------------------------------------------------------------------------
*/

/*!
  Returns a string represantation of the qooxdoo object.
*/
qx.Proto.toString = function()
{
  if(this.classname) {
    return "[object " + this.classname + "]";
  };

  return "[object Object]";
};

/*!
  Return unique hash code of object
*/
qx.Proto.toHashCode = function() {
  return this._hashCode;
};

/*!
  Returns true if the object is disposed.
*/
qx.Proto.getDisposed = function() {
  return this._disposed;
};

/*!
  Returns true if the object is disposed.
*/
qx.Proto.isDisposed = function() {
  return this._disposed;
};






/*
---------------------------------------------------------------------------
  DEBUGGING INTERFACE
---------------------------------------------------------------------------
*/

/*!
  Print out a debug message to the qooxdoo debug console.
*/
qx.Proto.debug = function(m, c) {
  qx.dev.Debug(this.classname + qx.core.Object.DEBUG_MSG_BEFORE + this._hashCode + qx.core.Object.DEBUG_MSG_AFTER, m, c);
};

/*!
  Print out an info message info to the qooxdoo debug console.
*/
qx.Proto.info = function(m, c) {
  this.debug(m, "info");
};

/*!
  Print out an warning to the qooxdoo debug console.
*/
qx.Proto.warn = function(m, c) {
  this.debug(m, "warning");
};

/*!
  Print out an error to the qooxdoo debug console.
*/
qx.Proto.error = function(m, f)
{
  if (qx.util.Validation.isValidString(f))
  {
    this.debug(qx.core.Object.DEBUG_FUNCERRORPRE + f + qx.core.Object.DEBUG_FUNCERRORPOST + m, qx.Const.EVENT_TYPE_ERROR);
  }
  else
  {
    this.debug(m, qx.Const.EVENT_TYPE_ERROR);
  };
};






/*
---------------------------------------------------------------------------
  COMMON SETTER/GETTER SUPPORT
---------------------------------------------------------------------------
*/

/*!
Sets multiple properties at once by using a property list

#param propertyValues[Property List]: A hash of key-value pairs.
*/
qx.Proto.set = function(propertyValues)
{
  if (typeof propertyValues !== qx.Const.TYPEOF_OBJECT) {
    throw new Error("Please use a valid hash of property key-values pairs.");
  };

  for (var prop in propertyValues)
  {
    try
    {
      this[qx.OO.setter[prop]](propertyValues[prop]);
    }
    catch(ex)
    {
      this.error("Setter of property " + prop + " returned with an error: " + ex, "set");
    };
  };

  return this;
};

/*!

*/
qx.Proto.get = function(propertyNames, outputHint)
{
  switch(typeof propertyNames)
  {
    case qx.Const.TYPEOF_STRING:
      return this[qx.Const.CORE_GET + qx.lang.String.toFirstUp(propertyNames)]();

    case qx.Const.TYPEOF_OBJECT:
      if (typeof propertyNames.length === qx.Const.TYPEOF_NUMBER)
      {
        if (outputHint == "hash")
        {
          var h = {};

          propertyLength = propertyNames.length;
          for (var i=0; i<propertyLength; i++)
          {
            try{
              h[propertyNames[i]] = this[qx.Const.CORE_GET + qx.lang.String.toFirstUp(propertyNames[i])]();
            }
            catch(ex)
            {
              throw new Error("Could not get a valid value from property: " + propertyNames[i] + "! Is the property existing? (" + ex + ")");
            };
          };

          return h;
        }
        else
        {
          propertyLength = propertyNames.length;
          for (var i=0; i<propertyLength; i++)
          {
            try{
              propertyNames[i] = this[qx.Const.CORE_GET + qx.lang.String.toFirstUp(propertyNames[i])]();
            }
            catch(ex)
            {
              throw new Error("Could not get a valid value from property: " + propertyNames[i] + "! Is the property existing? (" + ex + ")");
            };
          };

          return propertyNames;
        };
      }
      else
      {
        for (var i in propertyNames) {
          propertyNames[i] = this[qx.Const.CORE_GET + qx.lang.String.toFirstUp(i)]();
        };

        return propertyNames;
      };

    default:
      throw new Error("Please use a valid array, hash or string as parameter!");
  };
};





/*
---------------------------------------------------------------------------
  USER DATA
---------------------------------------------------------------------------
*/

qx.Proto.setUserData = function(vKey, vValue)
{
  if (!this._userData) {
    this._userData = {};
  };

  this._userData[vKey] = vValue;
};

qx.Proto.getUserData = function(vKey)
{
  if (!this._userData) {
    return null;
  };

  return this._userData[vKey];
};






/*
---------------------------------------------------------------------------
  DISPOSER
---------------------------------------------------------------------------
*/

qx.Proto._disposed = false;

/*!
  Dispose this object
*/
qx.Proto.dispose = function()
{
  if (this.getDisposed()) {
    return;
  };

  // Dispose user data
  if (this._userData)
  {
    for(var vKey in this._userData) {
      this._userData[vKey] = null;
    };

    this._userData = null;
  };

  // Finally cleanup properties
  if (this._objectproperties)
  {
    var a = this._objectproperties.split(qx.Const.CORE_COMMA);
    for (var i=0, l=a.length; i<l; i++) {
      delete this[qx.OO.values[a[i]]];
    };

    delete this._objectproperties;
  };

  if (qx.core.Settings.enableDisposerDebug)
  {
    for (var vKey in this)
    {
      if (this[vKey] !== null && typeof this[vKey] === qx.Const.TYPEOF_OBJECT)
      {
        this.debug("Missing class implementation to dispose: " + vKey);
        delete this[vKey];
      };
    };
  };

  /*
  if (typeof CollectGarbage === qx.Const.TYPEOF_FUNCTION) {
    CollectGarbage();
  };
  */

  // Delete Entry from Object DB
  qx.core.ObjectDataBase[this._hashCode] = null;
  delete qx.core.ObjectDataBase[this._hashCode];

  // Mark as disposed
  this._disposed = true;
};
