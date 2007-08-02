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
qx.Class.define("qx.event2.handler.MouseEventHandler",
{
  extend : qx.event2.handler.AbstractEventHandler,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(manager)
  {
    this.base(arguments, manager);

    this._documentElement = manager.getWindow().document.documentElement;

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

    this.__mouseMoveHandler = qx.lang.Function.bind(this.__fireEvent, this);

    this.__lastMouseDownTarget = null;
  },



  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this._disposeFields(
      "__mouseMoveHandler",
      "__lastMouseDownTarget",
      "__mouseButtonListenerCount"
    );
  },



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {

    __mouseMoveEvents :
    {
      "mousemove" : 1,
      "mouseover" : 1,
      "mouseout" : 1,
      "mousewheel" : 1
    },


    /*
    ---------------------------------------------------------------------------
      EVENT HANDLER INTERFACE
    ---------------------------------------------------------------------------
    */

    canHandleEvent : function(element, type) {
      return this.__mouseButtonHandler[type] || this.__mouseMoveEvents[type];
    },


    registerEvent : function(element, type)
    {
      if (this.__mouseButtonHandler[type])
      {
        this.__mouseButtonListenerCount += 1;

        if (this.__mouseButtonListenerCount == 1) {
          this._attachEvents(this._documentElement, this.__mouseButtonHandler);
        }
      }
      else if (this.__mouseMoveEvents[type])
      {
        this._managedAddNativeListener(this._documentElement, type, this.__mouseMoveHandler);
      }
    },


    unregisterEvent : function(element, type)
    {
      if (this.__mouseButtonHandler[type])
      {
        this.__mouseButtonListenerCount -= 1;

        if (this.__mouseButtonListenerCount == 0) {
          this._detachEvents(this._documentElement, this.__mouseButtonHandler);
        }
      }
      else if (this.__mouseMoveEvents[type])
      {
        this._managedRemoveNativeListener(this._documentElement, type, this.__mouseMoveHandler);
      }
    },



    /*
    ---------------------------------------------------------------------------
      EVENT-HANDLER
    ---------------------------------------------------------------------------
    */

    /**
     * Fire a mouse event with the given parameters
     *
     * @param domEvent {Event} DOM event
     * @param type {String} type og the event
     * @param target {Element} event target
     */
    __fireEvent : function(domEvent, type, target)
    {
      var event = this._eventPool.getEventInstance("qx.event2.type.MouseEvent").init(domEvent);

      if (type) {
        event.setType(type);
      }
      if (target) {
        event.setTarget(target);
      }

      this._manager.dispatchEvent(this._context, event);

      this._eventPool.release(event);
    },


    /**
     * Global handler for all mouse button relates events like "mouseup",
     * "mousedown", "click", "dblclick" and "contextmenu".
     *
     * @type member
     * @param domEvent {Event} DOM event
     */
    onMouseButtonEvent : function(domEvent)
    {
      var event = this._eventPool.getEventInstance("qx.event2.type.MouseEvent").init(domEvent);
      var type = event.getType();
      var target = event.getTarget();

      if (this.__rightClickFixPre) {
        this.__rightClickFixPre(domEvent, type, target);
      }

      if (this.__doubleClickFixPre) {
        this.__doubleClickFixPre(domEvent, type, target);
      }

      this.__fireEvent(domEvent, type, target);
      this._eventPool.release(event);

      if (this.__rightClickFixPost) {
        this.__rightClickFixPost(domEvent, type, target);
      }

      if (this.__differentTargetClickFixPost) {
        this.__differentTargetClickFixPost(domEvent, type, target);
      }

      this._lastEventType = type;
    },



    /**
     * Normalizes the click sequence of right click events in Webkit and Opera.
     * The normalized sequence is:
     *
     *  1. mousedown  <- not fired by Webkit
     *  2. mouseup  <- not fired by Webkit
     *  3. contextmenu <- not fired by Opera
     *
     * @param domEvent {Event} original DOM event
     * @param type {String} event type
     * @param target {Elment} event target of the DOM event.
     *
     * @signature function(domEvent, type, target)
     */
    __rightClickFixPre : qx.core.Variant.select("qx.client",
    {
      "webkit" : function(domEvent, type, target)
      {
        if (type == "contextmenu")
        {
          this.__fireEvent(domEvent, "mousedown", target);
          this.__fireEvent(domEvent, "mouseup", target);
        }
      },

      "default" : null
    }),


    /**
     * Normalizes the click sequence of right click events in Webkit and Opera.
     * The normalized sequence is:
     *
     *  1. mousedown  <- not fired by Webkit
     *  2. mouseup  <- not fired by Webkit
     *  3. contextmenu <- not fired by Opera
     *
     * @param domEvent {Event} original DOM event
     * @param type {String} event type
     * @param target {Elment} event target of the DOM event.
     *
     * @signature function(domEvent, type, target)
     */
    __rightClickFixPost : qx.core.Variant.select("qx.client",
    {
      "opera" : function(domEvent, type, target)
      {
        if (type =="mouseup" && domEvent.button == 2) {
          this.__fireEvent(domEvent, "contextmenu", target);
        }
      },

      "default" : null
    }),


    /**
     * Normalizes the click sequence of double click event in the Internet
     * Explorer. The normalized sequence is:
     *
     *  1. mousedown
     *  2. mouseup
     *  3. click
     *  4. mousedown  <- not fired by IE
     *  5. mouseup
     *  6. click  <- not fired by IE
     *  7. dblclick
     *
     * @param domEvent {Event} original DOM event
     * @param type {String} event type
     * @param target {Elment} event target of the DOM event.
     *
     * @signature function(domEvent, type, target)
     */
    __doubleClickFixPre : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(domEvent, type, target)
      {
        if (type == "mouseup" && this._lastEventType == "click") {
          this.__fireEvent(domEvent, "mousedown", target);
        } else if (type == "dblclick") {
          this.__fireEvent(domEvent, "click", target);
        }
      },

      "default" : null
    }),


    /**
     * If the mouseup event happens on a different target than the corresponding
     * mousedown event the internet explorer dispatches a click event on the
     * first common ancestor of both targets. The presence of this click event
     * is essential for the qooxdoo widget system. All other browsers don't fire
     * the click event so it must be emulated.
     *
     * @param domEvent {Event} original DOM event
     * @param type {String} event type
     * @param target {Elment} event target of the DOM event.
     *
     * @signature function(domEvent, type, target)
     */
    __differentTargetClickFixPost : qx.core.Variant.select("qx.client",
    {
      "mshtml" : null,

      "default" : function(domEvent, type, target)
      {
        switch (type)
        {
          case "mousedown":
            this.__lastMouseDownTarget = target;
            break;

          case "mouseup":
            if (target !== this.__lastMouseDownTarget)
            {
              commonParent = qx.html2.element.Tree.getCommonParent(target, this.__lastMouseDownTarget);
              this.__fireEvent(domEvent, "click", commonParent);
            }
        }
      }
    })
  },



  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer : function(statics)
  {
    var manager = qx.event2.Manager;
    manager.registerEventHandler(statics, manager.PRIORITY_NORMAL);
  }

});
