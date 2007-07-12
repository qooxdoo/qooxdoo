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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

************************************************************************ */

/**
 * This class provides a unified mouse event handler for Internet Explorer,
 * Firefox, Opera and Safari
 *
 * @internal
 */
qx.Class.define("qx.html2.event.MouseEventHandler",
{
  extend : qx.html2.event.AbstractEventHandler,

  implement : qx.html2.event.IEventHandler,


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(eventCallBack)
  {
    this.base(arguments, eventCallBack);

    this.__mouseButtonListenerCount = 0;

    var buttonHandler = qx.lang.Function.bind(this.onMouseButtonEvent, this);

    this.__mouseButtonHandler =
    {
      "mousedown"   : buttonHandler,
      "mouseup"     : buttonHandler,
      "click"       : buttonHandler,
      "dblclick"    : buttonHandler,
      "contextmenu" : buttonHandler
    };
  },

  members :
  {
    /**
     * TODOC
     *
     * @type member
     * @param type {var} TODOC
     * @return {boolean} TODOC
     */
    canHandleEvent : function(type) {
      return this.__mouseButtonHandler[type];
    },


    registerEvent : function(type)
    {
      if (this.__mouseButtonHandler[type])
      {
        // handle key events
        this.__mouseButtonListenerCount += 1;

        if (this.__mouseButtonListenerCount == 1) {
          this.attachEvents(
            window.document.documentElement,
            this.__mouseButtonHandler
          );
        }
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param type {var} TODOC
     * @return {void}
     */
    unregisterEvent : function(type)
    {
      if (this.__mouseButtonHandler[type])
      {
        // handle key events
        this.__mouseButtonListenerCount -= 1;

        if (this.__mouseButtonListenerCount == 0) {
          this.detachEvents(
            window.document.documentElement,
            this.__mouseButtonHandler
          );
        }
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param domEvent {var} TODOC
     * @return {void}
     */
    onMouseButtonEvent : function(domEvent)
    {
      var event = qx.html2.event.MouseEvent.getInstance(-1, domEvent, domEvent.type);
      this._callback(event);
    },


    /**
     * TODOC
     *
     * @type member
     * @param event {var} TODOC
     * @return {void}
     */
    onMouseEvent : function(event) {}
  }
});
