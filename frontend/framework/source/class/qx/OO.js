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
    /** {var} TODOC */
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
      }

      // Store reference to global classname registry
      qx.OO.classes[vClassName] = qx.Class;
    },

    /**
     * TODOC
     *
     * @type static
     * @name inheritField
     * @access public
     * @param vField {var} TODOC
     * @param vData {var} TODOC
     * @return {void}
     */
    inheritField : function(vField, vData)
    {
      qx.lang.Object.carefullyMergeWith(vData, qx.Super.prototype[vField]);
      qx.Proto[vField] = vData;
    },

    /**
     * TODOC
     *
     * @type static
     * @name isAvailable
     * @access public
     * @param vClassName {var} TODOC
     * @return {var} TODOC
     */
    isAvailable : function(vClassName) {
      return qx.OO.classes[vClassName] != null;
    },

    // qooxdoo 0.6.x emulation
    addFastProperty : function(config) {
      return qx.core.LegacyProperty.addFastProperty(config, qx.Proto);
    },
    addCachedProperty : function(config) {
      return qx.core.LegacyProperty.addCachedProperty(config, qx.Proto);
    },
    addPropertyGroup : function(config) {
      return qx.core.LegacyProperty.addPropertyGroup(config, qx.Proto);
    },
    removeProperty : function(config) {
      return qx.core.LegacyProperty.removeProperty(config, qx.Proto);
    },
    _createProperty : function(config) {
      return qx.core.LegacyProperty._createProperty(config, qx.Proto);
    },
    changeProperty : function(config) {
      return qx.core.LegacyProperty.changeProperty(config, qx.Proto);
    },
    addProperty : function(config) {
      return qx.core.LegacyProperty.addProperty(config, qx.Proto);
    },

    setter : qx.core.LegacyProperty.setter,
    resetter : qx.core.LegacyProperty.resetter,
    getter : qx.core.LegacyProperty.getter,
    values : qx.core.LegacyProperty.values
  }
});
