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

  construct : function(eventCallBack)
  {
    this.base(arguments, eventCallBack);

    this.__mouseButtonListenerCount = {};
    this.__mouseMoveListenerCount = {};
    this.__elementRegistry = {};

    var buttonHandler = qx.lang.Function.bind(this.onMouseButtonEvent, this);
    
    this.__mouseButtonHandler =
    {
      "mousedown"   : buttonHandler,
      "mouseup"     : buttonHandler,
      "click"       : buttonHandler,
      "dblclick"    : buttonHandler,
      "contextmenu" : buttonHandler
    };

    var moveHandler = qx.lang.Function.bind(this.__fireEvent, this);
    this.__mouseMoveHandler = 
    {
      "mousemove" : {
        count: 0,
        handler: moveHandler
      },
      "mouseover" : {
        count: 0,
        handler: moveHandler
      },
      "mouseout" : {
        count: 0,
        handler: moveHandler
      }
    }

    this.__lastMouseDownTarget = null;
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

    canHandleEvent : function(type) {
      return this.__mouseButtonHandler[type] || this.__mouseMoveHandler[type];
    },


    registerEvent : function(element, type)
    {
      var elementId = qx.core.Object.toHashCode(element);

      if (this.__mouseButtonHandler[type])
      {
        if (!this.__mouseButtonListenerCount[elementId]) {
          this.__mouseButtonListenerCount[elementId] = 0;
          this.__elementRegistry[elementId] = element;
        }

        // handle key events
        this.__mouseButtonListenerCount[elementId] += 1;

        if (this.__mouseButtonListenerCount[elementId] == 1) {
          this._attachEvents(
            element,
            this.__mouseButtonHandler
          );
        }
      }
      else if (this.__mouseMoveHandler[type])
      {
        if (!this.__mouseMoveListenerCount[elementId]) {
          this.__mouseMoveListenerCount[elementId] = {};
          this.__elementRegistry[elementId] = element;
        }
        if (!this.__mouseMoveListenerCount[elementId][type]) {
          this.__mouseMoveListenerCount[elementId][type] = 0;
        }

        this.__mouseMoveListenerCount[elementId][type] += 1;
        if (this.__mouseMoveListenerCount[elementId][type] == 1)
        {
          qx.event2.Manager.addNativeListener(
            element,
            type,
            this.__mouseMoveHandler[type].handler
          );
        }
      }
    },


    unregisterEvent : function(element, type)
    {
      var elementId = qx.core.Object.toHashCode(element);

      if (!this.__mouseButtonListenerCount[elementId]) {
        this.__mouseButtonListenerCount[elementId] = 0;
      }

      if (this.__mouseButtonHandler[type])
      {
        // handle key events
        this.__mouseButtonListenerCount[elementId] -= 1;

        if (this.__mouseButtonListenerCount[elementId] == 0) {
          this._detachEvents(element, this.__mouseButtonHandler);
        }
      }
      else if (this.__mouseMoveHandler[type])
      {
        if (!this.__mouseMoveListenerCount[elementId]) {
          this.__mouseMoveListenerCount[elementId] = {};
        }
        
        if (!this.__mouseMoveListenerCount[elementId][type]) {
          this.__mouseMoveListenerCount[elementId][type] = 0;
        }

        this.__mouseMoveListenerCount[elementId][type] -= 1;
        
        if (this.__mouseMoveListenerCount[elementId][type] == 0)
        {
          qx.event2.Manager.addNativeListener(
            element, type, this.__mouseMoveHandler[type].handler
          );
        }
      }
    },


    removeAllListenersFromDocument : function(documentElement)
    {
      this._detachEvents(
        documentElement,
        this.__mouseButtonHandler
      );

      var documentId = qx.core.Object.toHashCode(documentElement);
      
      if (!this.__mouseMoveListenerCount || !this.__mouseMoveListenerCount[documentId]) {
        return;
      }
      
      for (var type in this.__mouseMoveListenerCount[documentId]) 
      {
        qx.event2.Manager.addNativeListener(
          documentElement, type, this.__mouseMoveHandler[type].handler
        );
      }
      delete(this.__mouseMoveListenerCount[documentId]);
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
      var event = qx.event2.type.MouseEvent.getInstance(domEvent);
      
      event.setType(type);
      event.setTarget(target);
      
      this._callback(event);
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
      // TODO: MouseEvent.getInstance() has only one parameter
      var event = qx.event2.type.MouseEvent.getInstance(domEvent, domEvent.type);
      var type = event.getType();
      var target = event.getTarget();

      if (this.__rightClickFixPre) {
        this.__rightClickFixPre(domEvent, type, target);
      }
      
      if (this.__doubleClickFixPre) {
        this.__doubleClickFixPre(domEvent, type, target);
      }

      this.__fireEvent(domEvent, type, target);

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
     * If the mousup event happens on a different target than the corresponding
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
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {

    for (var documentId in this.__mouseButtonListenerCount)
    {
      var documentElement = this.__elementRegistry[documentId];
      this.removeAllListenersFromDocument(documentElement);
    }

    for (var documentId in this.__mouseMoveListenerCount)
    {
      var documentElement = this.__elementRegistry[documentId];
      this.removeAllListenersFromDocument(documentElement);
    }

    this._disposeFields(
      "__mouseMoveHandler",
      "__lastMouseDownTarget",
      "__mouseButtonListenerCount",
      "__mouseMoveListenerCount",
      "__elementRegistry"
    );
  }
});
