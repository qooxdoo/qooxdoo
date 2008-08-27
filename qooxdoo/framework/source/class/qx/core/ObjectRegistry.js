/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (swerner)

************************************************************************ */

/* ************************************************************************

#use(qx.event.handler.Application)

************************************************************************ */

/**
 * Registration for all instances of qooxdoo classes. Mainly
 * used to manage them for the final shutdown sequence and to
 * use weak references when connecting widgets to DOM nodes etc.
 */
qx.Bootstrap.define("qx.core.ObjectRegistry",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /** {Map} Internal data structure to store objects */
    __registry : {},

    /** {Integer} Next new hash code. */
    __nextHash : 0,

    /** {Boolean} Whether the application is in the shutdown phase */
    inShutDown : false,

    /** {Array} List of all free hash codes */
    __freeHashes : [],


    /**
     * Registers an object into the database. This adds a hashcode
     * to the object (if not already done before) and stores it under
     * this hashcode. You can access this object later using the hashcode
     * by calling {@link #fromHashCode}.
     *
     * All registered objects are automatically disposed on application
     * shutdown. Each registered object must at least have a method
     * called <code>dispose</code>.
     *
     * @param obj {Object} Any object with a dispose() method
     * @return {void}
     */
    register : function(obj)
    {
      var registry = this.__registry;
      if (!registry) {
        return;
      }

      var hash = obj.$$hash;
      if (hash == null)
      {
        // Create new hash code
        var cache = this.__freeHashes;
        if (cache.length > 0) {
          hash = cache.pop();
        } else {
          hash = (this.__nextHash++).toString(36);
        }

        // Store hash code
        obj.$$hash = hash;
      }

      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (!obj.dispose) {
          throw new Error("Invalid object: " + obj);
        }
      }

      registry[hash] = obj;
    },


    /**
     * Removes the given object from the database.
     *
     * @param obj {Object} Any previously registered object
     * @return {void}
     */
    unregister : function(obj)
    {
      var hash = obj.$$hash;
      if (hash == null) {
        return;
      }

      var registry = this.__registry;
      if (registry && registry[hash])
      {
        delete registry[hash];
        this.__freeHashes.push(hash);
      }
    },


    /**
     * Returns an unique identifier for the given object. If such an identifier
     * does not yet exist, create it.
     *
     * @param obj {Object} the Object to get the hashcode for
     * @return {Integer} unique identifier for the given object
     */
    toHashCode : function(obj)
    {
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (obj == null)
        {
          qx.log.Logger.trace(this);
          throw new Error("Invalid object: " + obj);
        }
      }

      var hash = obj.$$hash;
      if (hash != null) {
        return hash;
      }

      // Create new hash code
      var cache = this.__freeHashes;
      if (cache.length > 0) {
        hash = cache.pop();
      } else {
        hash = (this.__nextHash++).toString(36);
      }

      // Store
      return obj.$$hash = hash;
    },


    /**
     * Get a object instance by its hash code as returned by {@link #toHashCode}.
     * If the object is already disposed or the hashCode is invalid,
     * <code>null</code> is returned.
     *
     * @param hash {Integer} The object's hash code.
     * @return {qx.core.Object} The corresponding object or <code>null</code>.
     */
    fromHashCode : function(hash) {
      return this.__registry[hash] || null;
    },


    /**
     * Disposing all registered object and cleaning up registry. This is
     * automatically executed at application shutdown.
     *
     * @return {void}
     */
    shutdown : function()
    {
      this.inShutDown = true;

      var registry = this.__registry;
      var hashes = [];

      for (var hash in registry) {
        hashes.push(hash);
      }

      hashes.sort(function(a, b) {
        return parseInt(b, 36)-parseInt(a, 36);
      });

      var obj, i=0, l=hashes.length;
      while(true)
      {
        try
        {
          for (; i<l; i++)
          {
            hash = hashes[i];
            obj = registry[hash];

            if (obj && obj.dispose) {
              obj.dispose();
            }
          }
        }
        catch(ex)
        {
          qx.log.Logger.error(this, "Could not dispose object " + obj.toString() + ": " + ex);

          if (i !== 0) {
            continue;
          }
        }

        break;
      }

      qx.log.Logger.debug(this, "Disposed " + l + " objects");

      delete this.__registry;
    },

    /**
     * Returns the object registry.
     *
     * @return {Object} The registry
     */
    getRegistry : function() {
      return this.__registry;
    }
  }
});
