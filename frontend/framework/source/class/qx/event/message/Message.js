/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007 Christian Boulanger

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Boulanger

************************************************************************ */

/* ************************************************************************

#module(event.message)

************************************************************************ */

/**
 * A message to be dispatched on the message bus.
 */
qx.Class.define("qx.event.message.Message",
{
  extend : qx.core.Object,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(vName, vData)
  {
    this.base(arguments);

    this.setName(vName);
    this.setData(vData);
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /**
     * Event name of the message. Based on this name the message is dispatched
     * to the event listeners.
     */
    name :
    {
      _fast       : true,
      setOnlyOnce : true,
      check       : "String"
    },

    /**
     * Any data the sender wants to pass with the event.
     */
    data : { _fast : true },

    /**
     * A reference to the sending object.
     */
    sender :
    {
      _fast       : true,
      setOnlyOnce : true,
      check       : "Object"
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeFields("_valueData", "_valueSender");
  }
});
