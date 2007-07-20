/**
 *
 * Notes:
 * 
 * Webkit does not support tabIndex for all elements:
 * http://bugs.webkit.org/show_bug.cgi?id=7138
 *
 *
 */
qx.Class.define("qx.event2.FocusManager",
{
  extend : qx.core.Target,
  
  construct : function(win)
  {
    this.base(arguments);


    // Shorthands    
    this._window = win;
    this._document = win.document;
    this._root = this._document.documentElement;
    this._body = this._document.body;


    // Native listeners
    this.__onNativeFocus = qx.lang.Function.bind(this._onNativeFocus, this);
    this.__onNativeBlur = qx.lang.Function.bind(this._onNativeBlur, this);
    this.__onNativeFocusIn = qx.lang.Function.bind(this._onNativeFocusIn, this);
    this.__onNativeFocusOut = qx.lang.Function.bind(this._onNativeFocusOut, this);
    this.__onNativeMouseDown = qx.lang.Function.bind(this._onNativeMouseDown, this);


    this._document.onmousedown = this.__onNativeMouseDown;

    // Capturing is needed for gecko to correctly handle focus of input and textarea fields
    if (this._window.addEventListener)
    {
      this._window.addEventListener("focus", this.__onNativeFocus, true);
      this._window.addEventListener("blur", this.__onNativeBlur, true);
    }
    else
    {
      qx.event2.Manager.addNativeListener(this._document, "focusin", this.__onNativeFocusIn);
      qx.event2.Manager.addNativeListener(this._document, "focusout", this.__onNativeFocusOut);
    }
  },
  
  properties :
  {
    active : 
    {
      check : "Element",
      event : "changeActive",
      apply : "_applyActive",
      nullable : true
    },
    
    focus : 
    {
      check : "Element",
      event : "changeFocus",
      apply : "_applyFocus",
      nullable : true
    }
  },
  
  members : 
  {
    _windowFocussed : false,
    
    _doWindowBlur : function()
    {
      // Omit doubled blur events
      // which is a common behavior at least for gecko based clients
      if (this._windowFocussed)
      {
        this._windowFocussed = false;

        this.resetActive();
        this.resetFocus();
        
        this.debug("Window blurred");
        this.__fireCustom(this._window, "blur");
      }        
    },
    
    _doWindowFocus : function()
    {
      // Omit doubled focus events
      // which is a common behavior at least for gecko based clients
      if (!this._windowFocussed)
      {
        this._windowFocussed = true;
        
        this.debug("Window focussed");
        this.__fireCustom(this._window, "focus");
      }    
    },
    
    _doElementFocus : function(element)
    {
      // If focus is already correct, don't configure both
      // This is the case for all mousedown events normally
      if (element && this.getFocus() !== element)
      {
        /*
        var oldActive = this.getActive() ? this.getActive().tagName : "none";
        var oldFocus = this.getFocus() ? this.getFocus().tagName : "none";
        
        this.debug("Focus: " + element.tagName);
        this.debug("OLD: " + oldActive + " :: " + oldFocus);
        */
        
        this.setActive(element);
        this.setFocus(element);
      }    
    },
    
    
    
    
    
    
    _onNativeFocusOut : function(e)
    {
      if (!e) {
        e = window.event; 
      }
      
      // this.debug("FocusOut");
      
      var target = e.target || e.srcElement;
      var related = e.relatedTarget || e.toElement;
      
      if (!related) {
        this._doWindowBlur();
      }
    },    
    
    _onNativeFocusIn : function(e)
    {
      if (!e) {
        e = window.event; 
      }
      
      // this.debug("FocusIn");
      
      var target = e.target || e.srcElement;
      var related = e.relatedTarget || e.toElement;
      
      if (!related) {     
        this._doWindowFocus();
      }

      this._doElementFocus(target);
    },
        
    _onNativeBlur : function(e)
    {
      if (!e) {
        e = window.event; 
      }
      
      var target = e.target || e.srcElement;

      if (target)
      {
        switch(target)
        {
          case this._window:
          case this._document:
            this._doWindowBlur();
            break;
        }
      }
    },
    
    _onNativeFocus : function(e)
    {
      if (!e) {
        e = window.event; 
      }
      
      var target = e.target || e.srcElement;
      
      if (target)
      {      
        switch(target)
        {
          case this._window:
          case this._document:
            this._doWindowFocus();
            break;
            
          default:
            this._doElementFocus(target);
        }
      }
    },

    



    __findFocusNode : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(node)
      {
        while (node) 
        {
          // The last one is needed for MSHTML, where every node
          // in document normally returns tabIndex=0 even if not set up
          // this way. The unmodified value return 32768 for unconfigured nodes
          if (node.tabIndex !== undefined && node.tabIndex >= 0 && node.getAttribute("tabIndex", 2) !== 32768) {
            return node;
          }
          
          node = node.parentNode;
        }
        
        // This should be identical to the one which is selected when
        // clicking into an empty page area. In mshtml this must be
        // the body of the document.
        return this._body;        
      },
      
      "default" : function(node)
      {
        while (node) 
        {
          if (node.tabIndex !== undefined && node.tabIndex >= 0) {
            return node;
          }
          
          node = node.parentNode;
        }
        
        // This should be identical to the one which is selected when
        // clicking into an empty page area. In mshtml this must be
        // the body of the document.
        return this._body;
      }
    }),
    
    
    /**
     * onclick handler
     *
     * @type member
     * @param e {Event}
     */
    _onNativeMouseDown : function(e) 
    {
      if (!e) {
        e = window.event; 
      }
      
      var target = e.target || e.srcElement;      
      
      // this.debug("MouseDown: " + target.tagName);

      this.setActive(target);
      this.setFocus(this.__findFocusNode(target));
    },    

    
    _applyActive : function(value, old)
    {
      if (old) {
        this.__fireCustom(old, "beforedeactivate");
      }
      
      if (value) {
        this.__fireCustom(value, "beforeactivate");
      }      
      
      if (old) {
        this.__fireCustom(old, "deactivate");
      }

      if (value) {
        this.__fireCustom(value, "activate");
      }
    },
    
    
    _applyFocus : function(value, old)
    {
      if (old) {
        this.__fireCustom(old, "focusout");
      }
      
      if (value) {
        this.__fireCustom(value, "focusin"); 
      }
      
      if (old) {
        this.__fireCustom(old, "blur");
      }
      
      if (value) {
        this.__fireCustom(value, "focus"); 
      }
    },
    
    focus : function(el) 
    {
      this.setActive(el);
      this.setFocus(el);
    },
    
    activate : function(el) {
      this.setActive(el);      
    },
    
    
    
    
    
    __fireCustom : function(target, type)
    {
      // TODO Use new central pooling here
      var event = new qx.event2.type.Event();
      
      if (target) {
        event.setTarget(target);
      }
      
      if (type) {
        event.setType(type);
      }
      
      qx.event2.Manager.getInstance().dispatchEvent(event);      
      event.dispose();
    }
  } 
});
