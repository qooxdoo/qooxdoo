/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Keyboard input event object.
 *
 * the interface of this class is based on the DOM Level 3 keyboard event
 * interface: http://www.w3.org/TR/DOM-Level-3-Events/#events-keyboardevents
 */
qx.Class.define("qx.event.type.KeyInput",
{
  extend : qx.event.type.Dom,




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Initialize the fields of the event.
     *
     * @param domEvent {Event} DOM event
     * @param target {Object} The event target
     * @param charCode {Integer} the character code
     * @return {qx.event.type.KeyInput} The initialized key event instance
     */
    init : function(domEvent, target, charCode)
    {
      this.base(arguments, domEvent, target, null, true, true);

      this._charCode = charCode;

      return this;
    },


    // overridden
    clone : function(embryo)
    {
      var clone = this.base(arguments, embryo);

      clone._charCode = this._charCode;

      return clone;
    },


    /**
     * Unicode number of the pressed character.
     *
     * @return {Integer} Unicode number of the pressed character
     */
    getCharCode : function() {
      return this._charCode;
    },


    /**
     * Returns the pressed character
     *
     * @return {String} The character
     */
    getChar : function() {
      return String.fromCharCode(this._charCode);
    }
  }
});
