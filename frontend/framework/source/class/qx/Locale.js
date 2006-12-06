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

************************************************************************ */

qx.Clazz.define("qx.Locale", 
{
  statics :
  {
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
     * @param fullname {String} name of the mixin
     * @param definition {Map ? null} definition structure
     */      
    define : function(fullname, definition)
    {
      
      
    },
    
    
    /**
     * Returns a locale by name
     * @param fullname {String} locale name to check
     * @return {Object|void} locale object
     */
    byName : function(fullname) {
      return arguments.callee.statics._registry[fullname];
    },
    
    
    /**
     * Determine if locale exists
     * @param fullname {String} locale name to check
     * @return {Boolean} true if locale exists
     */
    isDefined : function(fullname) {
      return arguments.callee.statics.byName(fullname) !== undefined;
    }
  }
});
