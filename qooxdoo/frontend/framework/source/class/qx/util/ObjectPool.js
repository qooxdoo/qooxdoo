/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     Simon Bull

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Simon Bull (sbull)

************************************************************************ */

/**
 * This singleton manages pooled Object instances.
 *
 * It exists mainly to minimise the amount of browser memory usage by reusing
 * window instances after they have been closed.  However, it could equally be
 * used to pool instances of any type of Object (expect singletons).
 *
 * It is the client's responsibility to ensure that pooled objects are not
 * referenced or used from anywhere else in the application.
 */
qx.Class.define("qx.util.ObjectPool",
{
  extend : qx.core.Object,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    this.__pool = {};
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
    poolSize :
    {
      check : "Number",
      init : null,
      nullable : true
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
      IMPL
    ---------------------------------------------------------------------------
    */

    /**
     * Get the number of instance of type classname that are currently
     * pooled.
     *
     * @param classname {String} The name of the Object type to count.
     *
     * @return {Integer} The number of instance of type classname that are currently
     *         pooled.
     */
    countObjectsOfType : function(classname)
    {
      // this.debug("countObjectsOfType() classname=" + classname );
      // this.debug("countObjectsOfType() this.__pool["+classname+"]=" + this.__pool[classname]);
      var count = 0;

      if (this.__pool[classname]) {
        count = this.__pool[classname].length;
      }

      return count;
    },


    /**
     * This method finds and returns an instance of a requested type in the pool,
     * if there is one.  Note that the pool determines which instance (if any) to
     * return to the client.  The client cannot get a specific instance from the
     * pool.
     *
     * @param classname {String} The name of the Object type to return.
     *
     * @return {Object} An instance of the requested type, or null if no such instance
     *         exists in the pool.
     */
    getObjectOfType : function(classname)
    {
      var obj = null;

      if (this.__pool[classname]) {
        obj = this.__pool[classname].pop() || null;
      }

      return obj;
    },


    /**
     * This method places an Object in a pool of Objects of its type.  Note that
     * once an instance has been pooled, there is no means to get that exact
     * instance back.  The instance may be discarded for garbage collection if
     * the pool of its type is already full.
     *
     * It is assumed that no other references exist to this Object, and that it will
     * not be used at all while it is pooled.
     *
     * @param obj {Object} An Object instance to pool.
     */
    poolObject : function(obj)
    {
      var classname = obj.classname;

      this._ensurePoolOfType(classname);

      // Check to see whether this instance is already in the pool
      //
      // Note that iterating over this.__pool[classname].length only works because
      // there are never any empty Array elements in the pool.
      var pooled = false;

      for (i=0, l=this.__pool[classname].length; i<l; i++)
      {
        if (this.__pool[classname][i] == obj)
        {
          //this.warn("poolObject() Cannot pool " + obj + " because it is already in the pool.");
          pooled = true;
          break;
        }
      }

      // Check to see whether the pool for this type is already full
      var full = this._isPoolFull(classname);

      if (full) {
        //this.warn("poolObject() Cannot pool " + obj + " because the pool is already full.");
      }

      // Pool instance if possible
      if (!pooled && !full) {
        this.__pool[classname].push(obj);
      } else {
        //this.warn("poolObject() Cannot pool " + obj + "; lost an instance of type " + classname);
      }
    },




    /*
    ---------------------------------------------------------------------------
      IMPL HELPERS
    ---------------------------------------------------------------------------
    */

    /**
     * This method checks whether the pool for a given class of Objects is
     * already full.  As a side-effect of calling this method a pool will
     * be created if it does not already exist.
     *
     * @param classname {String} The name of a type of Object.
     *
     * @return {Boolean} True if the pool is already full, otherwise false.  Note
     *         that is no upper limit is defined for the type, this method will
     *         always return false.
     */
    _isPoolFull : function(classname)
    {
      this._ensurePoolOfType(classname);

      var isPoolFull = false;

      if (this.getPoolSize() != null) {
        isPoolFull = this.__pool[classname].length >= this.getPoolSize();
      }

      return isPoolFull;
    },


    /**
     * This method ensures that there is a pool for Objects of a given type.  If a
     * pool doesn't already exist, this method will create it.
     *
     * @param classname {String} The name of a type of Object.
     */
    _ensurePoolOfType : function(classname)
    {
      if (!this.__pool[classname]) {
        this.__pool[classname] = [];
      }
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
    var i, l;

    for (var classname in pool)
    {
      list = pool[classname];
      for (i=0, l=list.length; i<l; i++) {
        list[i].dispose();
      }
    }

    this.__pool = null;
  }
});
