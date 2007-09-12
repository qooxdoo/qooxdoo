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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#module(event)

************************************************************************ */

/**
 * This handler provides a "load" event for iframes
 */
qx.Class.define("qx.event.handler.Iframe",
{
  extend : qx.core.Object,
  implement : qx.event.IEventHandler,





  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /** {Integer} Priority of this handler */
    PRIORITY : qx.event.Manager.PRIORITY_FIRST,
        
    
    /**
     * Internal function called by iframes created using {@link qx.bom.Iframe}.
     *
     * @internal
     * @param type {String} Name of the event
     * @param target {Element} DOM element which is the target of this event
     * @return {void}
     */
    onevent : function(type, target)
    {
      var manager = qx.event.Manager.getManager(target);
      manager.createAndDispatchEvent(target, qx.event.type.Event, [type, false]);
    }
  },
  




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /*
    ---------------------------------------------------------------------------
      EVENT HANDLER INTERFACE
    ---------------------------------------------------------------------------
    */

    // interface implementation
    canHandleEvent : function(target, type)
    {
      return target.nodeType !== undefined && type === "load" &&
        target.tagName.toLowerCase() === "iframe";
    },


    // interface implementation
    registerEvent : function(target, type) {
      // Nothing needs to be done here
    },


    // interface implementation
    unregisterEvent : function(target, type) {
      // Nothing needs to be done here
    }
  },





  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer : function(statics) {
    qx.event.Manager.registerHandler(statics);
  }
});
