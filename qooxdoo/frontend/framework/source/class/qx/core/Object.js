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

#module(core)

************************************************************************ */

/*!
  The qooxdoo basic object. All qooxdoo classes extends this one
*/
qx.OO.defineClass("qx.core.Object", Object,
function(vAutoDispose)
{
  this._hashCode = qx.core.Object._counter++;

  if (vAutoDispose !== false) {
    qx.core.Object._db.push(this);
  }
});


/*
---------------------------------------------------------------------------
  DEFAULT SETTINGS
---------------------------------------------------------------------------
*/

qx.Settings.setDefault("enableDisposerDebug", false);





/* ************************************************************************
   Class data, properties and methods
************************************************************************ */

qx.Class._counter = 0;
qx.Class._db = [];

qx.Class.toHashCode = function(o)
{
  if(o._hashCode != null) {
    return o._hashCode;
  }

  return o._hashCode = qx.core.Object._counter++;
}

qx.Class.dispose = function()
{
  // var logger = qx.dev.log.Logger.getClassLogger(qx.core.Object);
  // logger.debug("Disposing Application");

  // var vStart = (new Date).valueOf();
  var vObject;

  for (var i=qx.core.Object._db.length-1; i>=0; i--)
  {
    vObject = qx.core.Object._db[i];

    if (vObject && vObject._disposed === false)
    {
      // logger.debug("Disposing: " + vObject);
      vObject.dispose();
    }
  }

  // logger.debug("Done in: " + ((new Date).valueOf() - vStart) + "ms");
}

qx.OO.addProperty({ name : "enabled", type : qx.constant.Type.BOOLEAN, defaultValue : true, getAlias : "isEnabled" });






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
  }

  return "[object Object]";
}

/*!
  Return unique hash code of object
*/
qx.Proto.toHashCode = function() {
  return this._hashCode;
}

/*!
  Returns true if the object is disposed.
*/
qx.Proto.getDisposed = function() {
  return this._disposed;
}

/*!
  Returns true if the object is disposed.
*/
qx.Proto.isDisposed = function() {
  return this._disposed;
}

/*!
  Returns a settings from global setting definition
*/
qx.Proto.getSetting = function(vKey) {
  return qx.Settings.getValueOfClass(this.classname, vKey);
}




/*
---------------------------------------------------------------------------
  LOGGING INTERFACE
---------------------------------------------------------------------------
*/


/**
 * Returns the logger of this class.
 *
 * @return {qx.dev.log.Logger} the logger of this class.
 */
qx.Proto.getLogger = function() {
  return qx.dev.log.Logger.getClassLogger(this.constructor);
}


/**
 * Logs a debug message.
 *
 * @param msg {var} the message to log. If this is not a string, the
 *        object dump will be logged.
 * @param exc {var,null} the exception to log.
 */
qx.Proto.debug = function(msg, exc) {
  this.getLogger().debug(msg, this._hashCode, exc);
}


/**
 * Logs an info message.
 *
 * @param msg {var} the message to log. If this is not a string, the
 *    object dump will be logged.
 * @param exc {var,null} the exception to log.
 */
qx.Proto.info = function(msg, exc) {
  this.getLogger().info(msg, this._hashCode, exc);
}


/**
 * Logs a warning message.
 *
 * @param msg {var} the message to log. If this is not a string, the
 *    object dump will be logged.
 * @param exc {var,null} the exception to log.
 */
qx.Proto.warn = function(msg, exc) {
  this.getLogger().warn(msg, this._hashCode, exc);
}


/**
 * Logs an error message.
 *
 * @param msg {var} the message to log. If this is not a string, the
 *    object dump will be logged.
 * @param exc {var,null} the exception to log.
 */
qx.Proto.error = function(msg, exc) {
  this.getLogger().error(msg, this._hashCode, exc);
}




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
  if (typeof propertyValues !== qx.constant.Type.OBJECT) {
    throw new Error("Please use a valid hash of property key-values pairs.");
  }

  for (var prop in propertyValues)
  {
    try
    {
      this[qx.OO.setter[prop]](propertyValues[prop]);
    }
    catch(ex)
    {
      this.error("Setter of property " + prop + " returned with an error", ex);
    }
  }

  return this;
}

/*!

*/
qx.Proto.get = function(propertyNames, outputHint)
{
  switch(typeof propertyNames)
  {
    case qx.constant.Type.STRING:
      return this[qx.constant.Core.GET + qx.lang.String.toFirstUp(propertyNames)]();

    case qx.constant.Type.OBJECT:
      if (typeof propertyNames.length === qx.constant.Type.NUMBER)
      {
        if (outputHint == "hash")
        {
          var h = {};

          propertyLength = propertyNames.length;
          for (var i=0; i<propertyLength; i++)
          {
            try{
              h[propertyNames[i]] = this[qx.constant.Core.GET + qx.lang.String.toFirstUp(propertyNames[i])]();
            }
            catch(ex)
            {
              throw new Error("Could not get a valid value from property: " + propertyNames[i] + "! Is the property existing? (" + ex + ")");
            }
          }

          return h;
        }
        else
        {
          propertyLength = propertyNames.length;
          for (var i=0; i<propertyLength; i++)
          {
            try{
              propertyNames[i] = this[qx.constant.Core.GET + qx.lang.String.toFirstUp(propertyNames[i])]();
            }
            catch(ex)
            {
              throw new Error("Could not get a valid value from property: " + propertyNames[i] + "! Is the property existing? (" + ex + ")");
            }
          }

          return propertyNames;
        }
      }
      else
      {
        for (var i in propertyNames) {
          propertyNames[i] = this[qx.constant.Core.GET + qx.lang.String.toFirstUp(i)]();
        }

        return propertyNames;
      }

    default:
      throw new Error("Please use a valid array, hash or string as parameter!");
  }
}





/*
---------------------------------------------------------------------------
  USER DATA
---------------------------------------------------------------------------
*/

qx.Proto.setUserData = function(vKey, vValue)
{
  if (!this._userData) {
    this._userData = {};
  }

  this._userData[vKey] = vValue;
}

qx.Proto.getUserData = function(vKey)
{
  if (!this._userData) {
    return null;
  }

  return this._userData[vKey];
}






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
  }

  // Dispose user data
  if (this._userData)
  {
    for(var vKey in this._userData) {
      this._userData[vKey] = null;
    }

    this._userData = null;
  }

  // Finally cleanup properties
  if (this._objectproperties)
  {
    var a = this._objectproperties.split(qx.constant.Core.COMMA);
    var d = qx.OO.values;

    for (var i=0, l=a.length; i<l; i++) {
      this[d[a[i]]] = null;
    }

    this._objectproperties = null;
  }

  if (this.getSetting("enableDisposerDebug"))
  {
    for (var vKey in this)
    {
      if (this[vKey] !== null && typeof this[vKey] === qx.constant.Type.OBJECT)
      {
        this.debug("Missing class implementation to dispose: " + vKey);
        delete this[vKey];
      }
    }
  }

  /*
  if (typeof CollectGarbage === qx.constant.Type.FUNCTION) {
    CollectGarbage();
  }
  */

  // Delete Entry from Object DB
  qx.core.Object._db[this._hashCode] = null;

  // Mark as disposed
  this._disposed = true;
}
