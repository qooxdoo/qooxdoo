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
 * Generic event object for data transfers.
 */
qx.Class.define("qx.event.type.DataEvent",
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
     * The data field attached to this object. The data type and format are
     * defined by the sender.
     *
     * @type member
     * @return {var}
     */
    getData : function() {
      return this._data;
    },
    
    

   /**
    * Initializes an event onject.
    *
    * @type member
    * @param vType {String} the type name of the event
    * @param vData {var} additional data which should be passed to the event listener
    * @return {qx.event.type.DataEvent} the initialized instance.
    */
    init : function(type, data)
    {
      this.base(arguments, type, false);
      
      this._data = data;
      
      return this;
    },
  
  
    /**
     * Get a copy of this object
     *
     * @type member
     * @return {qx.event.type.DataEvent} a copy of this object
     */
    clone : function()
    {
      var clone = this.base(arguments);
      
      clone._data = this._data;
      
      return clone;
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
