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
 * Generic event object for data transfers.
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
     * @param data {var} Data to attach to the event
     * @return {qx.event.type.Data} the initialized instance.
     */
    init : function(data)
    {
      this.base(arguments, false, false);

      this._data = data;

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

      clone._data = this._data;

      return clone;
    },


    /**
     * The data field attached to this object. The data type and format are
     * defined by the sender.
     *
     * @type member
     * @return {var} Attached data
     */
    getData : function() {
      return this._data;
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeFields("_data");
  }
});
