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
 * Event object for data changes.
 */
qx.Class.define("qx.event.type.Data",
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
     * @param value {var} The event's new value
     * @param old {var} The event's old value
     * @return {qx.event.type.Data} the initialized instance.
     */
    init : function(value, old)
    {
      this.base(arguments, false, false);

      this._value = value;
      this._old = old;

      return this;
    },


    /**
     * Get a copy of this object
     *
     * @type member
     * @param embryo {qx.event.type.Data?null} Optional event class, which will
     *     be configured using the data of this event instance. The event must be
     *     an instance of this event class. If the value is <code>null</code>,
     *     a new pooled instance is created.
     * @return {qx.event.type.Data} a copy of this object
     */
    clone : function(embryo)
    {
      var clone = this.base(arguments, embryo);

      clone._value = this._value;
      clone._old = this._old;

      return clone;
    },


    /**
     * The new value of the event sending this change event.
     * The return data type is the same as the event data type.
     *
     * @type member
     * @return {var} The new value of the event
     */
    getValue : function() {
      return this._value;
    },
    
    
    /**
     * The new value of the event sending this change event.
     * The return data type is the same as the event data type.
     *
     * @type member
     * @deprecated
     * @return {var} The new value of the event
     */    
    getData : function() {
      return this._value;
    },


    /**
     * The old value of the event sending this change event.
     * The return data type is the same as the event data type.
     *
     * @type member
     * @return {var} The old value of the event
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
