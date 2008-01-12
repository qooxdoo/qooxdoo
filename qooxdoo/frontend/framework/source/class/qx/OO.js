/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

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

if (qx.core.Variant.isSet("qx.compatibility", "on"))
{
  /**
   * Defines a qooxdoo class.
   *
   * WARNING: This class is deprecated an will be removed in qooxdoo 0.7! Please
   * use {@link qx.Class} instead.
   *
   * @deprecated
   */
  qx.Class.define("qx.OO",
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
       * @deprecated Please switch to new qx.Class.define ASAP. This will be removed in qooxdoo 0.7
       * @type static
       * @name defineClass
       * @param vClassName {String} fully qualified class name (e.g. "qx.ui.form.Button")
       * @param vSuper {Object} super class
       * @param vConstructor {Function} the constructor of the new class
       * @return {void}
       * @throws TODOC
       */
      defineClass : function(vClassName, vSuper, vConstructor)
      {
        qx.log.Logger.deprecatedMethodWarning(arguments.callee, "Use qx.Class.define instead");

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

          qx.Clazz = vTempObject[vSplitName[i]] = {};
          qx.Proto = null;
          qx.Super = null;
        }
        else if (typeof vConstructor === "undefined")
        {
          qx.Clazz = vTempObject[vSplitName[i]] = vSuper;
          qx.Proto = null;
          qx.Super = vSuper;
        }
        else
        {
          qx.Clazz = vTempObject[vSplitName[i]] = vConstructor;

          // build helper function
          // this omits the initial constructor call while inherit properties
          var vHelperConstructor = function() {};

          vHelperConstructor.prototype = vSuper.prototype;

          qx.Proto = vConstructor.prototype = new vHelperConstructor;
          qx.Super = vConstructor.superclass = vSuper;

          qx.Proto.classname = vConstructor.classname = vClassName;
          qx.Proto.constructor = vConstructor;
        }

        // Store reference to global classname registry
        qx.OO.classes[vClassName] = qx.Class;
      },

      /**
       * Returns if a class which is created by defineClass is available.
       *
       * @deprecated Please switch to new qx.Class.define ASAP. This will be removed in qooxdoo 0.7
       * @type static
       * @param vClassName {String} Name of the class to look for
       * @return {Boolean} Whether the class is available
       */
      isAvailable : function(vClassName) {
        qx.log.Logger.deprecatedMethodWarning(arguments.callee);
        return qx.OO.classes[vClassName] != null;
      },

      /**
       * Legacy property handling
       *
       * @deprecated will be removed in qooxdoo 0.7
       * @param config {Map} Configuration map
       */
      addFastProperty : function(config)
      {
        if (qx.core.Variant.isSet("qx.debug", "on")) {
          //console.debug(qx.Class.classname + ": Use of old addFastProperty implementation for property " + config.name);
        }

        return qx.core.LegacyProperty.addFastProperty(config, qx.Proto);
      },

      /**
       * Legacy property handling
       *
       * @deprecated will be removed in qooxdoo 0.7
       * @param config {Map} Configuration map
       */
      addCachedProperty : function(config)
      {
        if (qx.core.Variant.isSet("qx.debug", "on")) {
          //console.debug(qx.Class.classname + ": Use of old addCachedProperty implementation for property " + config.name);
        }

        return qx.core.LegacyProperty.addCachedProperty(config, qx.Proto);
      },

      /**
       * Legacy property handling
       *
       * @deprecated will be removed in qooxdoo 0.7
       * @param config {Map} Configuration map
       */
      addPropertyGroup : function(config)
      {
        if (qx.core.Variant.isSet("qx.debug", "on")) {
          //console.debug(qx.Class.classname + ": Use of old addPropertyGroup implementation for property " + config.name);
        }

        return qx.Class.addPropertyGroup(config, qx.Proto);
      },

      /**
       * Legacy property handling
       *
       * @deprecated will be removed in qooxdoo 0.7
       * @param config {Map} Configuration map
       */
      removeProperty : function(config)
      {
        if (qx.core.Variant.isSet("qx.debug", "on")) {
          //console.debug(qx.Class.classname + ": Use of old removeProperty implementation for property " + config.name);
        }

        return qx.core.LegacyProperty.removeProperty(config, qx.Proto);
      },

      /**
       * Legacy property handling
       *
       * @deprecated will be removed in qooxdoo 0.7
       * @param config {Map} Configuration map
       */
      changeProperty : function(config)
      {
        qx.log.Logger.deprecatedMethodWarning(arguments.callee);
        return qx.core.LegacyProperty.addProperty(config, qx.Proto);
      },

      /**
       * Legacy property handling
       *
       * @deprecated will be removed in qooxdoo 0.7
       * @param config {Map} Configuration map
       */
      addProperty : function(config)
      {
        qx.log.Logger.deprecatedMethodWarning(arguments.callee);
        return qx.core.LegacyProperty.addProperty(config, qx.Proto);
      }
    }
  });
}
