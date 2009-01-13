/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2009 Sebastian Werner, http://sebastian-werner.net

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     
************************************************************************ */

var setter = function(clazz, method)
{
  return function(arg1, arg2, arg3, arg4, arg5, arg6)
  {
    var length = this.length;
    if (length > 0)
    {
      var ptn = clazz[method];
      for (var i=0; i<length; i++) {
        ptn.call(clazz, this[i], arg1, arg2, arg3, arg4, arg5, arg6);
      }          
    }
    
    return this;        
  };
}; 
     
qx.List.define("qx.bom.ElementCollection",
{
  members :
  {
    /**
     * Executes {@link qx.bom.element.Style.set} to modify the given style property
     * on all selected elements.
     *
     * @signature function(prop, value)
     * @param name {String} Name of the style attribute (js variant e.g. marginTop, wordSpacing)
     * @param value {var} The value for the given style
     * @return {ElementCollection} The collection is returned for chaining proposes
     */
     setStyle : setter(qx.bom.element.Style, "set"),     
     
    /**
     * Executes {@link qx.bom.element.Style.reset} to reset the given style property 
     * on all selected elements.
     *
     * @signature function(prop)
     * @param name {String} Name of the style attribute (js variant e.g. marginTop, wordSpacing)
     * @return {ElementCollection} The collection is returned for chaining proposes     
     */
     resetStyle : setter(qx.bom.element.Style, "reset"),     
    
    /**
     * Executes {@link qx.bom.element.Attribute.set} to modify the given attribute
     * on all selected elements.
     *
     * @signature function(prop, value)
     * @param name {String} Name of the attribute
     * @param value {var} New value of the attribute
     * @return {ElementCollection} The collection is returned for chaining proposes     
     */
     setAttribute : setter(qx.bom.element.Attribute, "set"),     
     
    /**
     * Executes {@link qx.bom.element.Attribute.reset} to reset the given attribute 
     * on all selected elements.
     *
     * @signature function(prop)
     * @param name {String} Name of the attribute
     * @return {ElementCollection} The collection is returned for chaining proposes     
     */
     resetAttribute : setter(qx.bom.element.Attribute, "reset")
  }
});
