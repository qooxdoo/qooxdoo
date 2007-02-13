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

#module(core)
#use(qx.core.Init)
#resource(static:static)

************************************************************************ */

/**
 * The qooxdoo root class. All other classes are direct or indirect subclasses of this one.
 *
 * This class contains methods for:
 * <ul>
 *   <li> object management (creation and destruction) </li>
 *   <li> logging & debugging </li>
 *   <li> generic getter/setter </li>
 *   <li> user data </li>
 *   <li> settings </li>
 *   <li> internationalization </li>
 * </ul>
 *
 * @param vAutoDispose {Boolean ? true} whether the object should be automatically disposed
 */
qx.OO.defineClass("qx.core.Object", Object,
function(vAutoDispose)
{
  this._hashCode = qx.core.Object._availableHashCode++;

  if (vAutoDispose !== false)
  {
    this._dbKey = qx.core.Object._db.length;
    qx.core.Object._db.push(this);
  }

  // Properties NG
  // Initialize data field for properties
  this._user_values_ng = {};
  this._appearance_values_ng = {};
  this._real_values_ng = {};

  // Properties NG
  // Apply default values
  if (this._properties_init_ng)
  {
    for (var i=0, a=this._properties_init_ng, l=a.length; i<l; i++)
    {
      var vName = a[i];
      var vEntry = this._properties_ng[vName];

      // We need to use the current function
      this["force" + vEntry.upname](vEntry.init);
    }
  }
});


/*
---------------------------------------------------------------------------
  DEFAULT SETTINGS
---------------------------------------------------------------------------
*/

qx.core.Setting.define("qx.disposerDebugging", false);





/* ************************************************************************
   Class data, properties and methods
************************************************************************ */

qx.Class._availableHashCode = 0;
qx.Class._db = [];
qx.Class._disposeAll = false;


/**
 * Returns an unique identifier for the given object. If such an identifier
 * does not yet exist, create it.
 *
 * @param o {Object} the Object to get the hashcode for
 * @return {Integer} unique identifier for the given object
 */
qx.Class.toHashCode = function(o)
{
  if(o._hashCode != null) {
    return o._hashCode;
  }

  return o._hashCode = qx.core.Object._availableHashCode++;
}


/**
 * Destructor. This method is called by qooxdoo on object destruction.
 *
 * Any class that holds resources like links to DOM nodes must overwrite
 * this method and free these resources.
 */
qx.Class.dispose = function()
{
  if (qx.core.Variant.isSet("qx.debug", "on"))
  {
    if (qx.core.Setting.get("qx.disposerDebugging"))
    {
      var disposeStart = new Date;
      qx.core.Bootstrap.alert("Disposing qooxdoo application...");
    }
  }

  // var vStart = (new Date).valueOf();
  qx.core.Object._disposeAll = true;
  var vObject;

  for (var i=qx.core.Object._db.length-1; i>=0; i--)
  {
    vObject = qx.core.Object._db[i];

    if (vObject && vObject._disposed === false) {
      vObject.dispose();
    }
  }

  if (qx.core.Variant.isSet("qx.debug", "on"))
  {
    if (qx.core.Setting.get("qx.disposerDebugging"))
    {
      // check dom
      var elems = qx.lang.Array.fromCollection(document.getElementsByTagName("*"));
      elems.push(window, document);

      qx.core.Bootstrap.alert("Disposer: Checking " + elems.length + " elements for object references...");

      for (var i=0, l=elems.length; i<l; i++)
      {
        var elem = elems[i];
        for (var key in elem)
        {
          try
          {
            if (typeof elem[key] == "object")
            {
              if (elem[key] instanceof qx.core.Object || elem[key] instanceof Array) {
                qx.core.Bootstrap.alert("Disposer: Found Object under key: " + key);
              }
            }
          }
          catch(ex)
          {
            qx.core.Bootstrap.alert("Disposer: Could not access key: " + key);
          };
        }
      }
    }
  }

  if (qx.core.Variant.isSet("qx.debug", "on"))
  {
    if (qx.core.Setting.get("qx.disposerDebugging")) {
      qx.core.Bootstrap.alert("Disposing qooxdoo done in " + (new Date() - disposeStart) + "ms");
    }
  }
}


/**
 * Summary of allocated objects
 *
 * @return {String} summary of allocated objects.
 */
qx.Class.summary = function()
{
  var vData = {};
  var vCounter = 0;
  var vObject;

  for (var i=qx.core.Object._db.length-1; i>=0; i--)
  {
    vObject = qx.core.Object._db[i];

    if (vObject && vObject._disposed === false)
    {
      if (vData[vObject.classname] == null)
      {
        vData[vObject.classname] = 1;
      }
      else
      {
        vData[vObject.classname]++;
      }

      vCounter++;
    }
  }

  var vArrData = [];

  for (var vClassName in vData) {
    vArrData.push({ classname : vClassName, number : vData[vClassName] });
  }

  vArrData.sort(function(a, b) {
    return b.number - a.number;
  });

  var vMsg = "Summary: (" + vCounter + " Objects)\n\n";

  for (var i=0; i<vArrData.length; i++) {
    vMsg += vArrData[i].number + ": " + vArrData[i].classname + "\n";
  }

  alert(vMsg);
};

/**
 * Enable or disable the Object.
 *
 * The actual semantic of this property depends on concrete subclass of qx.core.Object.
 */
qx.OO.addProperty({ name : "enabled", type : "boolean", defaultValue : true, getAlias : "isEnabled" });






/* ************************************************************************
   Instance data, properties and methods
************************************************************************ */

/*
---------------------------------------------------------------------------
  UTILITIES
---------------------------------------------------------------------------
*/

// Properties NG
qx.Proto._properties_ng = {};
qx.Proto._properties_init_ng = [];

/**
 * Returns a string represantation of the qooxdoo object.
 *
 * @return {String} string representation of the object
 */
qx.Proto.toString = function()
{
  if(this.classname) {
    return "[object " + this.classname + "]";
  }

  return "[object Object]";
}


/**
 * Return unique hash code of object
 *
 * @return {Integer} unique hash code of the object
 */
qx.Proto.toHashCode = function() {
  return this._hashCode;
}


/**
 * Returns true if the object is disposed.
 *
 * @return {Boolean} wether the object has been disposed
 */
qx.Proto.getDisposed = function() {
  return this._disposed;
}


/**
 * Returns true if the object is disposed.
 *
 * @return {Boolean} wether the object has been disposed
 */
qx.Proto.isDisposed = function() {
  return this._disposed;
}



/*
---------------------------------------------------------------------------
  I18N INTERFACE
---------------------------------------------------------------------------
*/

/**
 * Translate a message
 * Mark the message for translation.
 * @see qx.lang.String.format
 *
 * @param messageId {String} message id (may contain format strings)
 * @param varargs {Object} variable number of argumes applied to the format string
 * @return {qx.locale.LocalizedString}
 */
qx.Proto.tr = function(messageId, varargs) {
  var nlsManager = qx.locale.Manager;
  return nlsManager.tr.apply(nlsManager, arguments);
};


/**
 * Translate a plural message
 * Mark the messages for translation.
 *
 * Depending on the third argument the plursl or the singular form is chosen.
 *
 * @see qx.lang.String.format
 *
 * @param singularMessageId {String} message id of the singular form (may contain format strings)
 * @param pluralMessageId {String} message id of the plural form (may contain format strings)
 * @param count {Integer} if greater than 1 the plural form otherwhise the singular form is returned.
 * @param varargs {Object} variable number of argumes applied to the format string
 * @return {qx.locale.LocalizedString)
 */
qx.Proto.trn = function(singularMessageId, pluralMessageId, count, varargs) {
  var nlsManager = qx.locale.Manager;
  return nlsManager.trn.apply(nlsManager, arguments);
};


/**
 * Mark the message for translation but return the original message.
 *
 * @param messageId {String} the message ID
 * @return {String} messageId
 */
qx.Proto.marktr = function(messageId) {
  var nlsManager = qx.locale.Manager;
  return nlsManager.marktr.apply(nlsManager, arguments);
};

/*
---------------------------------------------------------------------------
  LOGGING INTERFACE
---------------------------------------------------------------------------
*/

/**
 * Returns the logger of this class.
 *
 * @return {qx.log.Logger} the logger of this class.
 */
qx.Proto.getLogger = function() {
  return qx.log.Logger.getClassLogger(this.constructor);
}


/**
 * Logs a debug message.
 *
 * @param msg {var} the message to log. If this is not a string, the
 *        object dump will be logged.
 * @param exc {var ? null} the exception to log.
 */
qx.Proto.debug = function(msg, exc) {
  this.getLogger().debug(msg, this._hashCode, exc);
}


/**
 * Logs an info message.
 *
 * @param msg {var} the message to log. If this is not a string, the
 *    object dump will be logged.
 * @param exc {var ? null} the exception to log.
 */
qx.Proto.info = function(msg, exc) {
  this.getLogger().info(msg, this._hashCode, exc);
}


/**
 * Logs a warning message.
 *
 * @param msg {var} the message to log. If this is not a string, the
 *    object dump will be logged.
 * @param exc {var ? null} the exception to log.
 */
qx.Proto.warn = function(msg, exc) {
  this.getLogger().warn(msg, this._hashCode, exc);
}


/**
 * Logs an error message.
 *
 * @param msg {var} the message to log. If this is not a string, the
 *    object dump will be logged.
 * @param exc {var ? null} the exception to log.
 */
qx.Proto.error = function(msg, exc) {
  this.getLogger().error(msg, this._hashCode, exc);
}




/*
---------------------------------------------------------------------------
  COMMON SETTER/GETTER SUPPORT
---------------------------------------------------------------------------
*/

/**
 * Sets multiple properties at once by using a property list
 *
 * @param propertyValues {Object} A hash of key-value pairs.
 */
qx.Proto.set = function(propertyValues)
{
  if (typeof propertyValues !== "object") {
    throw new Error("Please use a valid hash of property key-values pairs.");
  }

  for (var prop in propertyValues)
  {
    try
    {
      // TODO: Access to private member (bad style) - please correct
      this[qx.core.LegacyProperty.__setter[prop]](propertyValues[prop]);
    }
    catch(ex)
    {
      this.error("Setter of property '" + prop + "' returned with an error", ex);
    }
  }

  return this;
}

/**
 * Gets multiple properties at once by using a property list
 *
 * @param propertyNames {String | Array | Map} list of the properties to get
 * @param outputHint {String ? "array"} how should the values be returned. Possible values are "hash" and "array".
*/
qx.Proto.get = function(propertyNames, outputHint)
{
  switch(typeof propertyNames)
  {
    case "string":
      return this["get" + qx.lang.String.toFirstUp(propertyNames)]();

    case "object":
      if (typeof propertyNames.length === "number")
      {
        if (outputHint == "hash")
        {
          var h = {};

          propertyLength = propertyNames.length;
          for (var i=0; i<propertyLength; i++)
          {
            try{
              h[propertyNames[i]] = this["get" + qx.lang.String.toFirstUp(propertyNames[i])]();
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
              propertyNames[i] = this["get" + qx.lang.String.toFirstUp(propertyNames[i])]();
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
          propertyNames[i] = this["get" + qx.lang.String.toFirstUp(i)]();
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

/**
 * Store user defined data inside the object.
 *
 * @param vKey {String} the key
 * @param vValue {Object} the value of the user data
 */
qx.Proto.setUserData = function(vKey, vValue)
{
  if (!this._userData) {
    this._userData = {};
  }

  this._userData[vKey] = vValue;
}


/**
 * Load user defined data from the object
 *
 * @param vKey {String} the key
 * @return {Object} the user data
 */
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

/**
 * Dispose this object
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

  // Disposable properties
  disposeProps = this._objectproperties;

  // NextGen property stuff
  this._user_values_ng = null;
  this._appearance_values_ng = null;
  this._real_values_ng = null;
  this._properties_ng = null;
  this._properties_init_ng = null;

  // OldGen property stuff
  this._properties = null;
  this._objectproperties = null;

  // Finally cleanup properties
  if (disposeProps)
  {
    // TODO: Access to private member (bad style) - please correct
    var values = qx.core.LegacyProperty.__values;

    for (var name in disposeProps) {
      this[values[name]] = null;
    }
  }

  if (qx.core.Variant.isSet("qx.debug", "on"))
  {
    if (qx.core.Setting.get("qx.disposerDebugging"))
    {
      for (var vKey in this)
      {
        if (this[vKey] !== null && typeof this[vKey] === "object" && this.constructor.prototype[vKey] === undefined)
        {
          qx.core.Bootstrap.alert("Missing class implementation to dispose: " + vKey);
          delete this[vKey];
        }
      }
    }
  }

  // Delete Entry from Object DB
  if (this._dbKey != null)
  {
    if (qx.core.Object._disposeAll)
    {
      qx.core.Object._db[this._dbKey] = null;
    }
    else
    {
      delete qx.core.Object._db[this._dbKey];
    }
    this._hashCode = null;
    this._dbKey = null;
  }

  // Mark as disposed
  this._disposed = true;
}
