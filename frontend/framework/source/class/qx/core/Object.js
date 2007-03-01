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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#module(core)
#use(qx.core.Init)
#require(qx.core.LegacyProperty)
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
 */
qx.Class.define("qx.core.Object",
{
  extend : Object,
  include : [ qx.locale.MTranslation, qx.log.MLogging ],




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * Create a new instance
   *
   * @type constructor
   * @param vAutoDispose {Boolean} whether the object should be automatically disposed
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
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /** TODOC */
    __availableHashCode : 0,


    /** TODOC */
    __db : [],


    /** TODOC */
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

        if (vObject && vObject.__disposed === false) {
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

                    var name = "unknown object";

                    if (elem[key] instanceof qx.core.Object) {
                      name = elem[key].classname + "[" + elem[key].toHashCode() + "]";
                    }

                    qx.core.Bootstrap.alert("Disposer: Attribute '" + key + "' references " + name + " in DOM element: " + elem.tagName);
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

        if (vObject && vObject.__disposed === false)
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
    },


    /**
     * Returns whether a global dispose (page unload) is currently taking place.
     *
     * @type static
     * @return {Boolean} whether a global dispose is taking place.
     */
    inGlobalDispose : function()
    {
      return qx.core.Object.__disposeAll;
    }
  },




  /*
  *****************************************************************************
     PROPERTIES
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
      _legacy      : true,
      type         : "boolean",
      defaultValue : true,
      getAlias     : "isEnabled"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /*
    ---------------------------------------------------------------------------
      BASICS
    ---------------------------------------------------------------------------
    */

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
     * @type member
     * @param args {arguments} the arguments variable of the calling method
     * @param varags {var} TODOC
     * @return {var} the return value of the method of the base class.
     */
    base : function(args, varags)
    {
      if (arguments.length == 1) {
        return args.callee.base.call(this);
      } else {
        return args.callee.base.apply(this, Array.prototype.slice.call(arguments, 1));
      }
    },


    /**
     * Returns the static class (to access static members of this class)
     *
     * @type member
     * @param args {arguments} the arguments variable of the calling method
     * @return {var} the return value of the method of the base class.
     */
    self : function(args) {
      return args.callee.self;
    },


    /*
    ---------------------------------------------------------------------------
      PROPERTIES NG
    ---------------------------------------------------------------------------
    */

    /** Properties NG */
    _properties_ng : {},


    /** Properties NG */
    _properties_init_ng : [],


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
        throw new Error("Please use a valid hash of property key-values pairs. Incoming value was: '" + data + "'");
      }

      for (var prop in data)
      {
        try {
          this[qx.core.LegacyProperty.getSetterName(prop)](data[prop]);
        } catch(ex) {
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

    /** TODOC */
    __disposed : false,


    /**
     * Returns true if the object is disposed.
     *
     * @type member
     * @return {Boolean} wether the object has been disposed
     */
    getDisposed : function() {
      return this.__disposed;
    },


    /**
     * Returns true if the object is disposed.
     *
     * @type member
     * @return {Boolean} wether the object has been disposed
     */
    isDisposed : function() {
      return this.__disposed;
    },



    _disposeFields : function()
    {
      var name;

      for (var i=0, l=arguments.length; i<l; i++)
      {
        var name = arguments[i]

        if (this[name] == null) {
          continue;
        }

        if (!this.hasOwnProperty(name))
        {
          this.warn(this.classname + " has no own field " + name);
          continue;
        }

        this[name] = null;
      }
    },

    _disposeObjects : function()
    {
      var name;

      for (var i=0, l=arguments.length; i<l; i++)
      {
        var name = arguments[i]

        if (this[name] == null) {
          continue;
        }

        if (!this.hasOwnProperty(name))
        {
          this.warn(this.classname + " has no own field " + name);
          continue;
        }

        this[name].dispose();
        this[name] = null;
      }
    },

    _disposeDeep : function(name, deep)
    {
      var name;

      if (this[name] == null)
      {
        // this.warn("Ignore: " + name);
        return;
      }

      if (!this.hasOwnProperty(name))
      {
        this.warn(this.classname + " has no own field " + name);
        return;
      }

      // this.log("Dispose Deep: " + name);

      this.__disposeDeepRecurser(this[name], deep || 0);
      this[name] = null;

      // this.log("Dispose Deep: " + name + " DONE!!!!");
    },


    __disposeDeepRecurser : function(obj, deep)
    {
      // qooxdoo
      if (obj instanceof qx.core.Object)
      {
        obj.dispose();
      }

      // Array
      else if (obj instanceof Array)
      {
        for (var i=0, l=obj.length; i<l; i++)
        {
          var entry = obj[i];

          if (entry == null) {
            continue;
          }

          if (typeof entry == "object")
          {
            if (deep > 0)
            {
              // this.log("- Deep processing item '" + i + "'");
              this.__disposeObject(entry, deep-1);
            }

            // this.log("- Resetting key (object) '" + key + "'");
            obj[i] = null;
          }
          else if (typeof entry == "function")
          {
            // this.log("- Resetting key (function) '" + key + "'");
            obj[i] = null;
          }
        }
      }

      // Map
      else if (obj instanceof Object)
      {
        for (var key in obj)
        {
          if (obj[key] == null || !obj.hasOwnProperty(key)) {
            continue;
          }

          var entry = obj[key];

          if (typeof entry == "object")
          {
            if (deep > 0)
            {
              // this.log("- Deep processing key '" + key + "'");
              this.__disposeObject(entry, deep-1);
            }

            // this.log("- Resetting key (object) '" + key + "'");
            obj[key] = null;
          }
          else if (typeof entry == "function")
          {
            // this.log("- Resetting key (function) '" + key + "'");
            obj[key] = null;
          }
        }
      }
    },


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

      this.debug("Disposing...");

      var clazz = this.constructor;

      while (clazz != qx.core.Object)
      {
        if (clazz.destructor)
        {
          clazz.destructor.call(this);
        }

        if (clazz.$$includes)
        {
          for (var key in clazz.$$includes)
          {
            var mixin = clazz.$$includes[key];

            if (mixin.destructor)
            {
              mixin.destructor.call(this);
            }
          }
        }

        clazz = clazz.superclass;
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
      var disposeProps = this.$$objectproperties;

      // NextGen property stuff
      this._user_values_ng = null;
      this._appearance_values_ng = null;
      this._real_values_ng = null;
      this._properties_ng = null;
      this._properties_init_ng = null;

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
              qx.core.Bootstrap.alert("Missing destruct definition for '" + vKey + "' in " + this.classname);
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

        // this._hashCode = null;
        // this.__dbKey = null;
      }

      // Mark as disposed
      this.__disposed = true;
    }
  },




  /*
  *****************************************************************************
     SETTINGS
  *****************************************************************************
  */

  settings : { "qx.disposerDebugging" : false }
});
