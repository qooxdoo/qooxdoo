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

  /**
   * @param name {String} The name of the message
   * @param data {var} Any type of data to attach
   */
  construct : function(name, data)
  {
    this.base(arguments);

    if (name != null) {
      this.setName(name);
    }

    if (data != null) {
      this.setData(data);
    }
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
      check       : "String"
    },

    /**
     * Any data the sender wants to pass with the event.
     */
    data : {},

    /**
     * A reference to the sending object.
     */
    sender :
    {
      check       : "Object"
    }
  }
});
