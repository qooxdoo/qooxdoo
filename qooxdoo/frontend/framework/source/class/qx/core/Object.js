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
qx.Clazz.define("qx.core.Object",
{
  extend : Object,

  /*
  *****************************************************************************
  **** CONSTRUCTOR ************************************************************
  *****************************************************************************
  */

  /**
   * TODOC
   *
   * @type constructor
   * @param vAutoDispose {var} TODOC
   */
  construct : function(vAutoDispose)
  {
    this._hashCode = qx.core.Object.__availableHashCode++;

    if (vAutoDispose !== false)
    {
      this.__dbKey = qx.core.Object.__db.length;
      qx.core.Object.__db.push(this);
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
  },








  /*
  *****************************************************************************
  **** SETTINGS ***************************************************************
  *****************************************************************************
  */

  settings : { "qx.disposerDebugging" : false },








  /*
  *****************************************************************************
  **** PROPERTIES *************************************************************
  *****************************************************************************
  */

  properties :
  {
    /**
     * Enable or disable the Object.
     *
     * The actual semantic of this property depends on concrete subclass of qx.core.Object.
     */
    enabled :
    {
      compat       : true,
      type         : "boolean",
      defaultValue : true,
      getAlias     : "isEnabled"
    }
  },








  /*
  *****************************************************************************
  **** MEMBERS ****************************************************************
  *****************************************************************************
  */

  members :
  {
    /* ************************************************************************
       Instance data, properties and methods
    ************************************************************************ */

    /*
    ---------------------------------------------------------------------------
      UTILITIES
    ---------------------------------------------------------------------------
    */

    // Properties NG
    /** {var} TODOC */
    _properties_ng : {},

    /** {var} TODOC */
    _properties_init_ng : [],

    /**
     * Returns a string represantation of the qooxdoo object.
     *
     * @type member
     * @return {String} string representation of the object
     */
    toString : function()
    {
      if (this.classname) {
        return "[object " + this.classname + "]";
      }

      return "[object Object]";
    },

    /**
     * Call the same method of the super class.
     *
     * @param args {arguments} the arguments variable of the calling method
     * @param varargs {var} variable arguments which are passed as arguments to
     *   the method of the base class.
     * @return {var} the return value of the method of the base class.
     */
    base : function(args, varags)
    {
      if (arguments[1] == undefined) {
        return args.callee.base.call(this);
      } else {
        return args.callee.base.apply(this, Array.prototype.slice.call(arguments, 1));
      }
    },

    /**
     * Returns the static class (to access static members of this class)
     *
     * @param args {arguments} the arguments variable of the calling method
     * @return {var} the return value of the method of the base class.
     */
    self : function(args) {
      return args.callee.self;
    },

    /**
     * Return unique hash code of object
     *
     * @type member
     * @return {Integer} unique hash code of the object
     */
    toHashCode : function() {
      return this._hashCode;
    },

    /**
     * Returns true if the object is disposed.
     *
     * @type member
     * @return {Boolean} wether the object has been disposed
     */
    getDisposed : function() {
      return this._disposed;
    },

    /**
     * Returns true if the object is disposed.
     *
     * @type member
     * @return {Boolean} wether the object has been disposed
     */
    isDisposed : function() {
      return this._disposed;
    },




    /*
    ---------------------------------------------------------------------------
      I18N INTERFACE
    ---------------------------------------------------------------------------
    */

    /**
     * Translate a message
     * Mark the message for translation.
     *
     * @type member
     * @param messageId {String} message id (may contain format strings)
     * @param varargs {Object} variable number of argumes applied to the format string
     * @return {qx.locale.LocalizedString} TODOC
     */
    tr : function(messageId, varargs)
    {
      var nlsManager = qx.locale.Manager;
      return nlsManager.tr.apply(nlsManager, arguments);
    },

    /**
     * Translate a plural message
     * Mark the messages for translation.
     *
     * Depending on the third argument the plursl or the singular form is chosen.
     *
     * @type member
     * @param singularMessageId {String} message id of the singular form (may contain format strings)
     * @param pluralMessageId {String} message id of the plural form (may contain format strings)
     * @param count {Integer} if greater than 1 the plural form otherwhise the singular form is returned.
     * @param varargs {Object} variable number of argumes applied to the format string
     * @return {call} {qx.locale.LocalizedString)
     */
    trn : function(singularMessageId, pluralMessageId, count, varargs)
    {
      var nlsManager = qx.locale.Manager;
      return nlsManager.trn.apply(nlsManager, arguments);
    },

    /**
     * Mark the message for translation but return the original message.
     *
     * @type member
     * @param messageId {String} the message ID
     * @return {String} messageId
     */
    marktr : function(messageId)
    {
      var nlsManager = qx.locale.Manager;
      return nlsManager.marktr.apply(nlsManager, arguments);
    },




    /*
    ---------------------------------------------------------------------------
      LOGGING INTERFACE
    ---------------------------------------------------------------------------
    */

    /**
     * Returns the logger of this class.
     *
     * @type member
     * @return {qx.log.Logger} the logger of this class.
     */
    getLogger : function() {
      return qx.log.Logger.getClassLogger(this.constructor);
    },

    /**
     * Logs a debug message.
     *
     * @type member
     * @param msg {var} the message to log. If this is not a string, the
     *          object dump will be logged.
     * @param exc {var} the exception to log.
     * @return {void}
     */
    debug : function(msg, exc) {
      this.getLogger().debug(msg, this._hashCode, exc);
    },

    /**
     * Logs an info message.
     *
     * @type member
     * @param msg {var} the message to log. If this is not a string, the
     *      object dump will be logged.
     * @param exc {var} the exception to log.
     * @return {void}
     */
    info : function(msg, exc) {
      this.getLogger().info(msg, this._hashCode, exc);
    },

    /**
     * Logs a warning message.
     *
     * @type member
     * @param msg {var} the message to log. If this is not a string, the
     *      object dump will be logged.
     * @param exc {var} the exception to log.
     * @return {void}
     */
    warn : function(msg, exc) {
      this.getLogger().warn(msg, this._hashCode, exc);
    },

    /**
     * Logs an error message.
     *
     * @type member
     * @param msg {var} the message to log. If this is not a string, the
     *      object dump will be logged.
     * @param exc {var} the exception to log.
     * @return {void}
     */
    error : function(msg, exc) {
      this.getLogger().error(msg, this._hashCode, exc);
    },




    /*
    ---------------------------------------------------------------------------
      COMMON SETTER SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Sets multiple properties at once by using a property list
     *
     * @type member
     * @param data {Map} a map of property values. The key is the name of the property.
     * @return {Object} this instance.
     * @throws an error if the incoming data field is not a map.
     */
    set : function(data)
    {
      if (typeof data !== "object") {
        throw new Error("Please use a valid hash of property key-values pairs.");
      }

      for (var prop in data)
      {
        try
        {
          this[qx.core.LegacyProperty.getSetterName(prop)](data[prop]);
        }
        catch(ex)
        {
          this.error("Setter of property '" + prop + "' returned with an error", ex);
        }
      }

      return this;
    },






    /*
    ---------------------------------------------------------------------------
      USER DATA
    ---------------------------------------------------------------------------
    */

    /**
     * Store user defined data inside the object.
     *
     * @type member
     * @param vKey {String} the key
     * @param vValue {Object} the value of the user data
     * @return {void}
     */
    setUserData : function(vKey, vValue)
    {
      if (!this._userData) {
        this._userData = {};
      }

      this._userData[vKey] = vValue;
    },

    /**
     * Load user defined data from the object
     *
     * @type member
     * @param vKey {String} the key
     * @return {Object} the user data
     */
    getUserData : function(vKey)
    {
      if (!this._userData) {
        return null;
      }

      return this._userData[vKey];
    },




    /*
    ---------------------------------------------------------------------------
      DISPOSER
    ---------------------------------------------------------------------------
    */

    /** {var} TODOC */
    _disposed : false,

    /**
     * Dispose this object
     *
     * @type member
     * @return {void}
     */
    dispose : function()
    {
      if (this.getDisposed()) {
        return;
      }

      // Dispose user data
      if (this._userData)
      {
        for (var vKey in this._userData) {
          this._userData[vKey] = null;
        }

        this._userData = null;
      }

      // Disposable properties
      var disposeProps = this._objectproperties;

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
        for (var name in disposeProps) {
          this[qx.core.LegacyProperty.getValueName(name)] = null;
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
      if (this.__dbKey != null)
      {
        if (qx.core.Object.__disposeAll) {
          qx.core.Object.__db[this.__dbKey] = null;
        } else {
          delete qx.core.Object.__db[this.__dbKey];
        }

        this._hashCode = null;
        this.__dbKey = null;
      }

      // Mark as disposed
      this._disposed = true;
    }
  },








  /*
  *****************************************************************************
  **** STATICS ****************************************************************
  *****************************************************************************
  */

  statics :
  {
    /* ************************************************************************
       Class data, properties and methods
    ************************************************************************ */

    /** {var} TODOC */
    __availableHashCode : 0,

    /** {var} TODOC */
    __db : [],

    /** {var} TODOC */
    __disposeAll : false,

    /**
     * Returns an unique identifier for the given object. If such an identifier
     * does not yet exist, create it.
     *
     * @type static
     * @param o {Object} the Object to get the hashcode for
     * @return {Integer} unique identifier for the given object
     */
    toHashCode : function(o)
    {
      if (o._hashCode != null) {
        return o._hashCode;
      }

      return o._hashCode = qx.core.Object.__availableHashCode++;
    },

    /**
     * Destructor. This method is called by qooxdoo on object destruction.
     *
     * Any class that holds resources like links to DOM nodes must overwrite
     * this method and free these resources.
     *
     * @type static
     * @return {void}
     */
    dispose : function()
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
      qx.core.Object.__disposeAll = true;
      var vObject;

      for (var i=qx.core.Object.__db.length - 1; i>=0; i--)
      {
        vObject = qx.core.Object.__db[i];

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
              }
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
    },

    /**
     * Summary of allocated objects
     *
     * @type static
     * @return {String} summary of allocated objects.
     */
    summary : function()
    {
      var vData = {};
      var vCounter = 0;
      var vObject;

      for (var i=qx.core.Object.__db.length - 1; i>=0; i--)
      {
        vObject = qx.core.Object.__db[i];

        if (vObject && vObject._disposed === false)
        {
          if (vData[vObject.classname] == null) {
            vData[vObject.classname] = 1;
          } else {
            vData[vObject.classname]++;
          }

          vCounter++;
        }
      }

      var vArrData = [];

      for (var vClassName in vData)
      {
        vArrData.push(
        {
          classname : vClassName,
          number    : vData[vClassName]
        });
      }

      vArrData.sort(function(a, b) {
        return b.number - a.number;
      });

      var vMsg = "Summary: (" + vCounter + " Objects)\n\n";

      for (var i=0; i<vArrData.length; i++) {
        vMsg += vArrData[i].number + ": " + vArrData[i].classname + "\n";
      }

      return vMsg;
    }
  }
});