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
#require(QxMain)
#require(QxExtend)
#require(QxConst)
#require(QxUtil)
#require(QxSettings)
#post(QxObjectCore)
#post(QxClient)
#post(QxDebug)

************************************************************************ */

/*!
  The qooxdoo basic object. All qooxdoo classes extends this one
*/
function QxObject(vAutoDispose)
{
  this._hashCode = QxObjectCounter++;

  if (vAutoDispose !== false) {
    QxObjectDataBase.push(this);
  };
};

QxObject.extend(Object, "QxObject");





/*
---------------------------------------------------------------------------
  UTILITIES
---------------------------------------------------------------------------
*/

/*!
  Returns a string represantation of the qooxdoo object.
*/
proto.toString = function()
{
  if(this.classname) {
    return "[object " + this.classname + "]";
  };

  return "[object Object]";
};

/*!
  Return unique hash code of object
*/
proto.toHashCode = function() {
  return this._hashCode;
};

/*!
  Returns true if the object is disposed.
*/
proto.getDisposed = function() {
  return this._disposed;
};

/*!
  Returns true if the object is disposed.
*/
proto.isDisposed = function() {
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
proto.debug = function(m, c) {
  QxDebug(this.classname + QxObject.DEBUG_MSG_BEFORE + this._hashCode + QxObject.DEBUG_MSG_AFTER, m, c);
};

/*!
  Print out an info message info to the qooxdoo debug console.
*/
proto.info = function(m, c) {
  this.debug(m, "info");
};

/*!
  Print out an warning to the qooxdoo debug console.
*/
proto.warn = function(m, c) {
  this.debug(m, "warning");
};

/*!
  Print out an error to the qooxdoo debug console.
*/
proto.error = function(m, f)
{
  if (QxUtil.isValidString(f))
  {
    this.debug(QxObject.DEBUG_FUNCERRORPRE + f + QxObject.DEBUG_FUNCERRORPOST + m, QxConst.EVENT_TYPE_ERROR);
  }
  else
  {
    this.debug(m, QxConst.EVENT_TYPE_ERROR);
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
proto.set = function(propertyValues)
{
  if (typeof propertyValues !== QxConst.TYPEOF_OBJECT) {
    throw new Error("Please use a valid hash of property key-values pairs.");
  };

  for (var prop in propertyValues)
  {
    try
    {
      this[QxMain.setter[prop]](propertyValues[prop]);
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
proto.get = function(propertyNames, outputHint)
{
  switch(typeof propertyNames)
  {
    case QxConst.TYPEOF_STRING:
      return this[QxConst.INTERNAL_GET + propertyNames.toFirstUp()]();

    case QxConst.TYPEOF_OBJECT:
      if (typeof propertyNames.length === QxConst.TYPEOF_NUMBER)
      {
        if (outputHint == "hash")
        {
          var h = {};

          propertyLength = propertyNames.length;
          for (var i=0; i<propertyLength; i++)
          {
            try{
              h[propertyNames[i]] = this[QxConst.INTERNAL_GET + propertyNames[i].toFirstUp()]();
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
              propertyNames[i] = this[QxConst.INTERNAL_GET + propertyNames[i].toFirstUp()]();
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
          propertyNames[i] = this[QxConst.INTERNAL_GET + i.toFirstUp()]();
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

proto.setUserData = function(vKey, vValue)
{
  if (!this._userData) {
    this._userData = {};
  };

  this._userData[vKey] = vValue;
};

proto.getUserData = function(vKey)
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

proto._disposed = false;

/*!
  Dispose this object
*/
proto.dispose = function()
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
    var a = this._objectproperties.split(QxConst.CORE_COMMA);
    for (var i=0, l=a.length; i<l; i++) {
      delete this[QxMain.values[a[i]]];
    };

    delete this._objectproperties;
  };

  if (QxSettings.enableDisposerDebug)
  {
    for (var vKey in this)
    {
      if (this[vKey] !== null && typeof this[vKey] === QxConst.TYPEOF_OBJECT)
      {
        this.debug("Missing class implementation to dispose: " + vKey);
        delete this[vKey];
      };
    };
  };

  /*
  if (typeof CollectGarbage === QxConst.TYPEOF_FUNCTION) {
    CollectGarbage();
  };
  */

  // Delete Entry from Object DB
  QxObjectDataBase[this._hashCode] = null;
  delete QxObjectDataBase[this._hashCode];

  // Mark as disposed
  this._disposed = true;
};
