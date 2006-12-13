/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2006 by 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL 2.1: http://www.gnu.org/licenses/lgpl.html

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

#module(core)
#require(qx.Clazz)

************************************************************************ */

qx.Clazz.define("qx.Locale",
{
  statics :
  {
    /** {var} TODOC */
    _registry : {},

    /**
     * Locale definition
     * 
     * Example:
     * <pre><code>
     * qx.Locale.define("fullname",
     * {
     *   "msgId": "msgText",
     *   ...
     * });
     * </code></pre>
     *
     * @type static
     * @name define
     * @access public
     * @param fullname {String} name of the mixin
     * @param definition {Map} definition structure
     * @return {void} 
     */
    define : function(fullname, definition) 
    {
      /*
      ---------------------------------------------------------------------------
        Setting up namespace
      ---------------------------------------------------------------------------
      */
    
      var vSplitName = fullname.split(".");
      var vLength = vSplitName.length;
      var vParentPackage = window;
      var vPartName = vSplitName[0];
    
      for (var i=0, l=vSplitName.length - 1; i<l; i++)
      {
        if (!vParentPackage[vPartName]) {
          vParentPackage[vPartName] = {};
        }
    
        vParentPackage = vParentPackage[vPartName];
        vPartName = vSplitName[i + 1];
      }
  
      vParentPackage[vPartName] = definition;
      qx.locale.manager.Manager.getInstance().addTranslation(vPartName, definition);      
      
      arguments.callee.statics._registry[fullname] = definition;
    },

    /**
     * Returns a locale by name
     *
     * @type static
     * @name byName
     * @access public
     * @param fullname {String} locale name to check
     * @return {Object | void} locale object
     */
    byName : function(fullname) {
      return arguments.callee.statics._registry[fullname];
    },

    /**
     * Determine if locale exists
     *
     * @type static
     * @name isDefined
     * @access public
     * @param fullname {String} locale name to check
     * @return {Boolean} true if locale exists
     */
    isDefined : function(fullname) {
      return arguments.callee.statics.byName(fullname) !== undefined;
    }
  }
});
