/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     Simon Bull

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Simon Bull (sbull)
     * Sebastian Werner (wpbasti)

************************************************************************ */

/**
 * This class manages pooled Object instances.
 *
 * It exists mainly to minimize the amount of browser memory usage by reusing
 * window instances after they have been closed.  However, it could equally be
 * used to pool instances of any type of Object (expect singletons).
 *
 * It is the client's responsibility to ensure that pooled objects are not
 * referenced or used from anywhere else in the application.
 */
qx.Class.define("qx.util.ObjectPool",
{
  extend : qx.core.Object,
  implement : [ qx.core.IDisposable ],




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param size {Integer} Size of each class pool
   */
  construct : function(size)
  {
    this.base(arguments);

    this.__pool = {};

    if (size != null) {
      this.setSize(size);
    }
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /*
    ---------------------------------------------------------------------------
      PROPERTIES
    ---------------------------------------------------------------------------
    */

    /**
     * Number of objects of each class, which are pooled.
     *
     * A size of "null" represents an unlimited pool.
     */
    size :
    {
      check : "Integer",
      init : Infinity
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /** @type {Map} Stores arrays of instances for all managed classes */
    __pool : null,


    /*
    ---------------------------------------------------------------------------
      IMPL
    ---------------------------------------------------------------------------
    */

    /**
     * This method finds and returns an instance of a requested type in the pool,
     * if there is one.  Note that the pool determines which instance (if any) to
     * return to the client.  The client cannot get a specific instance from the
     * pool.
     *
     * @param clazz {Class} A reference to a class from which an instance should be created.
     * @return {Object} An instance of the requested type. If non existed in the pool a new
     *   one is transparently created and returned.
     */
    getObject : function(clazz)
    {
      if (this.$$disposed) {
        return new clazz;
      }

      if (!clazz) {
        throw new Error("Class needs to be defined!");
      }

      var obj = null;
      var pool = this.__pool[clazz.classname];

      if (pool) {
        obj = pool.pop();
      }

      if (obj) {
        obj.$$pooled = false;
      } else {
        obj = new clazz;
      }

      return obj;
    },


    /**
     * This method places an Object in a pool of Objects of its type. Note that
     * once an instance has been pooled, there is no means to get that exact
     * instance back. The instance may be discarded for garbage collection if
     * the pool of its type is already full.
     *
     * It is assumed that no other references exist to this Object, and that it will
     * not be used at all while it is pooled.
     *
     * @param obj {Object} An Object instance to pool.
     */
    poolObject : function(obj)
    {
      // Dispose check
      if (!this.__pool) {
        return;
      }

      var classname = obj.classname;
      var pool = this.__pool[classname];

      if (obj.$$pooled) {
        throw new Error("Object is already pooled: " + obj);
      }

      if (!pool) {
        this.__pool[classname] = pool = [];
      }

      // Check to see whether the pool for this type is already full
      if (pool.length > this.getSize())
      {
        // Use enhanced destroy() method instead of simple dispose
        // when available to work together with queues etc.
        if (obj.destroy) {
          obj.destroy();
        } else {
          obj.dispose();
        }

        return;
      }

      obj.$$pooled = true;
      pool.push(obj);
    }
  },






  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    var pool = this.__pool;
    var classname, list, i, l;

    for (classname in pool)
    {
      list = pool[classname];
      for (i=0, l=list.length; i<l; i++) {
        list[i].dispose();
      }
    }

    delete this.__pool;
  }
});
