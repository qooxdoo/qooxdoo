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

#module(event2)

************************************************************************ */

/**
 * This handler handles "load" and "unload" events of iframes
 *
 * @internal
 */
qx.Class.define("qx.event.handler.IframeEventHandler",
{
  extend : qx.event.handler.AbstractEventHandler,



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  statics :
  {
    /**
     * Internal function called by iframes created using {@link qx.bom.Iframe}.
     * @internal
     *
     * @param target {var} The target to, which the event handler should
     *     be attached
     * @param type {String} event type
     */
    onevent : function(target, type)
    {
      var manager = qx.event.Manager.getManager(target);
      manager.createAndDispatchEvent(target, qx.event.type.Event, [type]);
    }
  },



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __eventTypes :
    {
      load : true,
      unbeforeunload : true,
      unload : true,
      onreadystatechange : true
    },


    // overridden
    canHandleEvent : function(target, type)
    {
      return target.nodeType !== undefined &&
        target.tagName.toLowerCase() === "iframe" &&
        this.__eventTypes[type];
    }
  },



  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer : function(statics)
  {
    var manager = qx.event.Manager;
    manager.registerEventHandler(statics, manager.PRIORITY_FIRST);
  }
});
