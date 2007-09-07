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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#module(event)

************************************************************************ */

/**
 * Common base class for all DOM events.
 */
qx.Class.define("qx.event.type.DomEvent",
{
  extend : qx.event.type.Event,

  members :
  {
    // overridden
    init : function(domEvent)
    {
      this.base(arguments, domEvent.type, domEvent.bubbles);
      
      this._target = domEvent.target || domEvent.srcElement;

      if (domEvent.timeStamp) {
        this._timeStamp = domEvent.timeStamp;
      }

      this._dom = domEvent;
      
      return this;
    },


    /**
     * Prevent browser default behaviour, e.g. opening the context menu, ...
     */
    preventDefault : function() 
    {
      if (this._dom.preventDefault) {
        this._dom.preventDefault();
      }
      
      this._dom.returnValue = false;
    },


    // overridden
    stopPropagation :  function()
    {
      if (this._dom.stopPropagation) {
        this._dom.stopPropagation();
      }

      // MSDN doccumantation http://msdn2.microsoft.com/en-us/library/ms533545.aspx
      this._dom.cancelBubble = true;
      this._stopPropagation = true;
    },


    /**
     * Returns whether the the ctrl key is pressed.
     *
     * @type member
     * @return {Boolean} whether the the ctrl key is pressed.
     */
    isCtrlPressed : function() {
      return this._dom.ctrlKey;
    },


    /**
     * Returns whether the the shift key is pressed.
     *
     * @type member
     * @return {Boolean} whether the the shift key is pressed.
     */
    isShiftPressed : function() {
      return this._dom.shiftKey;
    },


    /**
     * Returns whether the the alt key is pressed.
     *
     * @type member
     * @return {Boolean} whether the the alt key is pressed.
     */
    isAltPressed : function() {
      return this._dom.altKey;
    },


    /**
     * Returns whether the the meta key is pressed.
     *
     * @type member
     * @return {Boolean} whether the the meta key is pressed.
     */
    isMetaPressed : function() {
      return this._dom.metaKey;
    }
  },
  
  
  
  
  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeFields("_dom");
  } 
});

