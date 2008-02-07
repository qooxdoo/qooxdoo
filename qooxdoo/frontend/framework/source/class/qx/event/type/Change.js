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

/**
 * Event object for property changes.
 */
qx.Class.define("qx.event.type.Change",
{
  extend : qx.event.type.Event,




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Initializes an event onject.
     *
     * @type member
     * @param type {String} the type name of the event
     * @param value {var} The property's new value
     * @param old {var} The property's old value
     * @return {qx.event.type.Change} the initialized instance.
     */
    init : function(type, value, old)
    {
      this.base(arguments, type, false);

      this._value = value;
      this._old = old;

      return this;
    },


    /**
     * Get a copy of this object
     *
     * @type member
     * @return {qx.event.type.Change} a copy of this object
     */
    clone : function()
    {
      var clone = this.base(arguments);

      clone._value = this._value;
      clone._old = this._old;

      return clone;
    },


    /**
     * The new value of the property sending this change event.
     * The return data type is the same as the property data type.
     *
     * @type member
     * @return {var} The new value of the property
     */
    getValue : function() {
      return this._value;
    },


    /**
     * The old value of the property sending this change event.
     * The return data type is the same as the property data type.
     *
     * @type member
     * @return {var} The old value of the property
     */
    getOldValue : function() {
      return this._old;
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeFields("_value", "_old");
  }
});
