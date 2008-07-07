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
     * @param data {var} The event's new data
     * @param old {var} The event's old data
     * @return {qx.event.type.Data} the initialized instance.
     */
    init : function(data, old)
    {
      this.base(arguments, false, false);

      this.__data = data;
      this.__old = old;

      return this;
    },


    /**
     * Get a copy of this object
     *
     * @type member
     * @param embryo {qx.event.type.Data?null} Optional event class, which will
     *     be configured using the data of this event instance. The event must be
     *     an instance of this event class. If the data is <code>null</code>,
     *     a new pooled instance is created.
     * @return {qx.event.type.Data} a copy of this object
     */
    clone : function(embryo)
    {
      var clone = this.base(arguments, embryo);

      clone.__data = this.__data;
      clone.__old = this.__old;

      return clone;
    },


    /**
     * The new data of the event sending this change event.
     * The return data type is the same as the event data type.
     *
     * @type member
     * @return {var} The new data of the event
     */    
    getData : function() {
      return this.__data;
    },
    
    
    /**
     * The new data of the event sending this change event.
     * The return data type is the same as the event data type.
     *
     * @type member
     * @deprecated
     * @return {var} The new data of the event
     */
    getValue : function() 
    {
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        this.debug("Deprecated method getValue() of qx.event.type.Data used!");
        this.trace();
      }
      
      return this.__data;
    },
    
    
    /**
     * The old data of the event sending this change event.
     * The return data type is the same as the event data type.
     *
     * @type member
     * @deprecated
     * @return {var} The old data of the event
     */
    getOldValue : function() 
    {
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        this.debug("Deprecated method getOldValue() of qx.event.type.Data used!");
        this.trace();
      }
            
      return this.__old;
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeFields("__data", "__old");
  }
});
