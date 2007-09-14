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
 * This handler provides "input" event for input elements
 */
qx.Class.define("qx.event.handler.Input",
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
    PRIORITY : qx.event.Registration.PRIORITY_FIRST,
    
    // Hints:
    // Normally a "change" event should occour on blur of the element
    // (http://www.w3.org/TR/DOM-Level-2-Events/events.html)
    // However this is not true for "file" upload fields
    // And this is also not true for checkboxes and radiofields (Gecko + Webkit)
    // And this is also not true for select boxes where the selections 
    // happens in the opened popup (Gecko + Webkit)
    
    // Normalized behavior:
    
    // Change on blur for textfields, textareas and file (when using dialog)
    // Instant change event on checkboxes, radiobuttons and file (when using keyboard)
    // File elements using keyboard are always instant in mshtml.
    
    // Select field differ when using keyboard: 
    // mshtml,opera=instant; mozilla,safari=onblur
    // when using popup: identical = instant (on select)
    
    // Input event for textareas does not work in Safari 3 beta (WIN)
    // Safari 3 beta (WIN) repeats changed event for select box onblur when selected using popup
    
    // TODO: Normalize file and select when possible
    
    /**
     * Internal function called by input elements created using {@link qx.bom.Input}.
     *
     * @internal
     * @param target {Element} DOM element which is the target of this event
     * @return {void}
     */
    oninputevent : function(target) {
      qx.event.Registration.fireEvent(target, qx.event.type.Data, ["input", target.value]);
    },
    
    
    /**
     * Internal function called by input elements created using {@link qx.bom.Input}.
     *
     * @internal
     * @param target {Element} DOM element which is the target of this event
     * @return {void}
     */    
    onchangevalueevent : function(target) {
      qx.event.Registration.fireEvent(target, qx.event.type.Data, ["change", target.value]);
    },
    
    
    /**
     * Internal function called by input elements created using {@link qx.bom.Input}.
     *
     * @internal
     * @param target {Element} DOM element which is the target of this event
     * @return {void}
     */    
    onchangecheckedevent : function(target) {
      qx.event.Registration.fireEvent(target, qx.event.type.Data, ["change", target.checked]);
    },
    
    
    /**
     * Internal function called by input elements created using {@link qx.bom.Input}.
     *
     * @internal
     * @param target {Element} DOM element which is the target of this event
     * @return {void}
     */
    onpropertyevent : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(target) 
      {
        var prop = window.event.propertyName;
        
        if (prop === "value" && (target.type === "text" || target.tagName.toLowerCase() === "textarea"))
        {
          if (!target.__inValueSet) {
            qx.event.Registration.fireEvent(target, qx.event.type.Data, ["input", target.value]);
          }
        }
        else if (prop === "value" && target.type === "file") 
        {
          qx.event.Registration.fireEvent(target, qx.event.type.Data, ["change", target.value]);
        }
        else if (prop === "checked")
        {
          qx.event.Registration.fireEvent(target, qx.event.type.Data, ["change", target.checked]);
        }
        else if (prop === "selectedIndex") 
        {
          qx.event.Registration.fireEvent(target, qx.event.type.Data, ["change", target.value]);
        }
      },
      
      "default" : null
    })
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
      if (target.nodeType === undefined) {
        return false;
      }
      
      var lower = target.tagName.toLowerCase();
      
      if (type === "input" && (lower === "input" || lower === "textarea")) {
        return true; 
      }
      
      if (type === "change" && (lower === "input" || lower === "textarea" || lower === "select")) {
        return true; 
      }
      
      return false;
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
    qx.event.Registration.addHandler(statics);
  }
});
