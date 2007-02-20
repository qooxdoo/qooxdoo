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
#optional(qx.event.type.DataEvent)

************************************************************************ */

qx.Clazz.define("qx.OO",
{
  /*
  *****************************************************************************
  **** STATICS ****************************************************************
  *****************************************************************************
  */

  statics :
  {
    /** {Map} Available classes created by defineClass */
    classes : {},


    /*
    ---------------------------------------------------------------------------
      DEFINE CLASS IMPLEMENTATION
    ---------------------------------------------------------------------------
    */

    /**
     * define a new qooxdoo class
     * All classes should be defined in this way.
     *
     * @deprecated Please switch to new qx.Clazz.define ASAP. This will be removed in qooxdoo 0.7
     * @type static
     * @name defineClass
     * @access public
     * @param vClassName {String} fully qualified class name (e.g. "qx.ui.form.Button")
     * @param vSuper {Object} super class
     * @param vConstructor {Function} the constructor of the new class
     * @return {void}
     * @throws TODOC
     */
    defineClass : function(vClassName, vSuper, vConstructor)
    {
      var vSplitName = vClassName.split(".");
      var vNameLength = vSplitName.length - 1;
      var vTempObject = window;

      // Setting up namespace
      for (var i=0; i<vNameLength; i++)
      {
        if (typeof vTempObject[vSplitName[i]] === "undefined") {
          vTempObject[vSplitName[i]] = {};
        }

        vTempObject = vTempObject[vSplitName[i]];
      }

      // Instantiate objects/inheritance
      if (typeof vSuper === "undefined")
      {
        if (typeof vConstructor !== "undefined") {
          throw new Error("SuperClass is undefined, but constructor was given for class: " + vClassName);
        }

        qx.Class = vTempObject[vSplitName[i]] = {};
        qx.Proto = null;
        qx.Super = null;
      }
      else if (typeof vConstructor === "undefined")
      {
        qx.Class = vTempObject[vSplitName[i]] = vSuper;
        qx.Proto = null;
        qx.Super = vSuper;
      }
      else
      {
        qx.Class = vTempObject[vSplitName[i]] = vConstructor;

        // build helper function
        // this omits the initial constructor call while inherit properties
        var vHelperConstructor = function() {};

        vHelperConstructor.prototype = vSuper.prototype;

        qx.Proto = vConstructor.prototype = new vHelperConstructor;
        qx.Super = vConstructor.superclass = vSuper;

        qx.Proto.classname = vConstructor.classname = vClassName;
        qx.Proto.constructor = vConstructor;

        // Copy property lists
        if (vSuper.prototype.$$properties) {
          qx.Proto.$$properties = qx.lang.Object.copy(vSuper.prototype.$$properties);
        }

        if (vSuper.prototype.$$objectproperties) {
          qx.Proto.$$objectproperties = qx.lang.Object.copy(vSuper.prototype.$$objectproperties);
        }
      }

      // Store reference to global classname registry
      qx.OO.classes[vClassName] = qx.Class;
    },

    /**
     * Returns if a class which is created by defineClass is available.
     *
     * @deprecated Please switch to new qx.Clazz.define ASAP. This will be removed in qooxdoo 0.7
     * @type static
     * @name isAvailable
     * @access public
     * @param vClassName {var} TODOC
     * @return {var} TODOC
     */
    isAvailable : function(vClassName) {
      return qx.OO.classes[vClassName] != null;
    },

    /**
     * Legacy property handling
     *
     * @deprecated: will be removed in qooxdoo 0.7
     * @param config {Map} Configuration map
     */
    addFastProperty : function(config)
    {
      if (qx.core.Variant.isSet("qx.debug", "on")) {
        //qx.core.Bootstrap.alert(qx.Class.classname + ": Use of old addFastProperty implementation for property " + config.name);
      }

      return qx.core.LegacyProperty.addFastProperty(config, qx.Proto);
    },

    /**
     * Legacy property handling
     *
     * @deprecated: will be removed in qooxdoo 0.7
     * @param config {Map} Configuration map
     */
    addCachedProperty : function(config)
    {
      if (qx.core.Variant.isSet("qx.debug", "on")) {
        //qx.core.Bootstrap.alert(qx.Class.classname + ": Use of old addCachedProperty implementation for property " + config.name);
      }

      return qx.core.LegacyProperty.addCachedProperty(config, qx.Proto);
    },

    /**
     * Legacy property handling
     *
     * @deprecated: will be removed in qooxdoo 0.7
     * @param config {Map} Configuration map
     */
    addPropertyGroup : function(config)
    {
      if (qx.core.Variant.isSet("qx.debug", "on")) {
        //qx.core.Bootstrap.alert(qx.Class.classname + ": Use of old addPropertyGroup implementation for property " + config.name);
      }

      return qx.core.LegacyProperty.addPropertyGroup(config, qx.Proto);
    },

    /**
     * Legacy property handling
     *
     * @deprecated: will be removed in qooxdoo 0.7
     * @param config {Map} Configuration map
     */
    removeProperty : function(config)
    {
      if (qx.core.Variant.isSet("qx.debug", "on")) {
        //qx.core.Bootstrap.alert(qx.Class.classname + ": Use of old removeProperty implementation for property " + config.name);
      }

      return qx.core.LegacyProperty.removeProperty(config, qx.Proto);
    },

    /**
     * Legacy property handling
     *
     * @deprecated: will be removed in qooxdoo 0.7
     * @param config {Map} Configuration map
     */
    changeProperty : function(config)
    {
      if (qx.core.Variant.isSet("qx.debug", "on")) {
        //qx.core.Bootstrap.alert(qx.Class.classname + ": Use of old changeProperty implementation for property " + config.name);
      }

      return qx.core.LegacyProperty.addProperty(config, qx.Proto);
    },

    /**
     * Legacy property handling
     *
     * @deprecated: will be removed in qooxdoo 0.7
     * @param config {Map} Configuration map
     */
    addProperty : function(config)
    {
      if (qx.core.Variant.isSet("qx.debug", "on")) {
        //qx.core.Bootstrap.alert(qx.Class.classname + ": Use of old addProperty implementation for property " + config.name);
      }

      return qx.core.LegacyProperty.addProperty(config, qx.Proto);
    }
  }
});
