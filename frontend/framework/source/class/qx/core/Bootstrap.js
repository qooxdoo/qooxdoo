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

************************************************************************ */

/**
 * Create namespace
 */
qx = { core : {}, lang : {} };

/**
 * Bootstrap qx.Clazz to create myself
 * This is needed for the API browser etc. to let them detect me
 */
qx.Clazz =
{
  define : function(name, config)
  {
    switch(name)
    {
      case "qx.core.Bootstrap":
        qx.core.Bootstrap = config.statics;
        break;

      case "qx.lang.Generics":
        qx.lang.Generics = config.statics;
        break;

      case "qx.lang.Core":
        qx.lang.Core = config.statics;
        break;

      case "qx.core.Variant":
        qx.core.Variant = config.statics;
        break;

      case "qx.core.Setting":
        qx.core.Setting = config.statics;
        break;

      case "qx.Clazz":
        qx.Clazz = config.statics;
        break;

      default:
        throw new Error("Bootstrap: Could not create class: " + name);
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
    LOADSTART : new Date
  }
});
