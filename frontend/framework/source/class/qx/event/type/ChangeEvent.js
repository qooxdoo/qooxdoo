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

************************************************************************ */

/**
 * Event object for property changes.
 */
qx.Class.define("qx.event.type.ChangeEvent",
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
     * The value field attached to this object. The type and format are
     * defined by the sender. Normally this is the same type as the property
     * type itself is.
     *
     * @type member
     * @return {var} The current property value
     */
    getValue : function() {
      return this._value;
    },


    /**
     * The old value field attached to this object. The type and format are
     * defined by the sender. Normally this is the same type as the property
     * type itself is.
     *
     * @type member
     * @return {var} The old property value
     */
    getOldValue : function() {
      return this._old;
    },


    /**
     * Initializes an event onject.
     *
     * @type member
     * @param type {String} the type name of the event
     * @param value {var} current property value
     * @param old {var} old property value
     * @return {qx.event.type.ChangeEvent} the initialized instance.
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
     * @return {qx.event.type.ChangeEvent} a copy of this object
     */
    clone : function()
    {
      var clone = this.base(arguments);

      clone._value = this._value;
      clone._old = this._old;

      return clone;
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
