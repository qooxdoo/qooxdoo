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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Event object class for drag events
 */
qx.Class.define("qx.event.type.Drag",
{
  extend : qx.event.type.Mouse,


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __getManager : function() {
      return qx.event.Registration.getManager(this.getTarget()).getHandler(qx.event.handler.DragDrop);
    },

    addData : function(type, data) {
      this.__getManager().addData(type, data);
    },

    addAction : function(type) {
      this.__getManager().addAction(type);
    },

    supportsType : function(type) {
      return this.__getManager().supportsType(type);
    },

    supportsAction : function(action) {
      return this.__getManager().supportsAction(action);
    },

    getData : function(type) {
      return this.__getManager().getData(type);
    },

    getAction : function() {
      return this.__getManager().getAction();
    }
  }
});
