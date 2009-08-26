/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * The blocker element is used to block interaction with the application.
 * 
 * It is usually transparent or semi-transparent and blocks all events from
 * the underlying elements.
 */
qx.Class.define("qx.html.Blocker",
{
  extend : qx.html.Element,
  
  /**
   * @param backgroundColor {Color?null} the blocker's background color. This 
   *    color can be themed and will be resolved by the blocker.
   * @param opacity {Number?0} The blocker's opacity
   */
  construct : function(backgroundColor, opacity) 
  {
    this.base(arguments);
    
    var backgroundColor = backgroundColor ? 
        qx.theme.manager.Color.getInstance().resolve(backgroundColor) : null;        
    var opacity = opacity || 0;
    
    this.__blockerInstance = new qx.bom.Blocker;
    this.__blockerInstance.setBlockerColor(backgroundColor);
    this.__blockerInstance.setBlockerOpacity(opacity);    
  },
  
  
  members :
  {
    __blockerInstance : null,
    
    // overwritten
    _createDomElement : function() {
      return this.__blockerInstance.getBlockerElement();
    },
    
    
    /**
     * Sets the background color of the blocker element
     *
     * @param color {String} CSS color value
     * @return {void}
     */
    setBlockerColor : function(color) {
      this.__blockerInstance.setBlockerColor(color);
    },
    
    /**
     * Returns the background color of the blocker element
     *
     * @return {String} CSS color value
     */
    getBlockerColor : function(color) {
      this.__blockerInstance.getBlockerColor();
    },    
    
    /**
     * Sets the opacity of the blocker element
     *
     * @param opacity {Number} CSS opacity value
     * @return {void}
     */
    setBlockerOpacity : function(opacity) {
      this.__blockerInstance.setBlockerOpacity(opacity);
    },
    
    
    /**
     * Returns the opacity of the blocker element
     *
     * @return opacity {Number} CSS opacity value
     */
    getBlockerOpacity : function(opacity) {
      this.__blockerInstance.getBlockerOpacity();
    },
    
    /**
     * Sets the zIndex of the blocker element
     *
     * @param zIndex {Number} CSS zIndex value
     * @return {void}
     */
    setBlockerZIndex : function(zIndex) {
      this.__blockerInstance.setBlockerZIndex(zIndex);
    },
    
    /**
     * Returns the zIndex of the blocker element
     *
     * @return {Number} CSS zIndex value
     */
    getBlockerZIndex : function() {
      this.__blockerInstance.getBlockerZIndex();
    },
    
    
    /**
     * Blocks the whole document or the given element.
     *
     * @param element {Element?null} DOM element to block or null to block the 
     *                               whole document
     * @return {void}
     */
    block : function(element) {
      this.__blockerInstance.block(element);
    },
    
    /**
     * Release the blocker
     * 
     * @return {void}
     */
    unblock : function() {
      this.__blockerInstance.unblock();
    }
  }
});