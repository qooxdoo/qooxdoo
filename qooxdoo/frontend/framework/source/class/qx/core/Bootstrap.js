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
#ignore(auto-require)
#ignore(auto-use)
#use(qx.lang.Core)
#use(qx.lang.Generics)
#use(qx.lang.Object)
#use(qx.lang.String)
#use(qx.lang.Array)

************************************************************************ */

/**
 * Create namespace
 */
qx =
{
  /**
   * Bootstrap qx.Clazz to create myself later
   * This is needed for the API browser etc. to let them detect me
   */
  Clazz :
  {
    createNamespace : function(name, object)
    {
      var splits = name.split(".");
      var parent = window;
      var part = splits[0];

      for (var i=0, len=splits.length-1; i<len; i++, part=splits[i])
      {
        if (!parent[part]) {
          parent[part] = {};
        }

        parent = parent[part];
      }

      parent[part] = object;

      // return last part name (e.g. classname)
      return part;
    },

    define : function(name, config) {
      this.createNamespace(name, config.statics);
    }
  }
};

/**
 * Bootstrap helper class
 */
qx.Clazz.define("qx.core.Bootstrap",
{
  statics :
  {
    /** {Date} Timestamp of qooxdoo based application startup */
    LOADSTART : new Date,

    /**
     * Boot and unload time debug feature.
     *
     * @param msg {String} The message to print out
     */
    alert : function(msg)
    {
      // Firebug & Firebug light support
      if (window.console && console.log)
      {
        console.warn(msg);
      }

      // Other browsers
      else
      {
        alert(msg);
      }
    }
  }
});
