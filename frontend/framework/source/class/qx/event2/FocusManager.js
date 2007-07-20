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
    this._root = win.document.documentElement;


    // Native listeners
    this.__onNativeWindowFocus = qx.lang.Function.bind(this._onNativeWindowFocus, this);
    this.__onNativeWindowBlur = qx.lang.Function.bind(this._onNativeWindowBlur, this);


    // Capturing is needed for gecko to correctly handle focus of input and textarea fields
    if (window.addEventListener)
    {
      window.addEventListener("focus", this.__onNativeWindowFocus, true);
      window.addEventListener("blur", this.__onNativeWindowBlur, true);
    }
    else
    {
      qx.event2.Manager.addNativeListener(window, "focus", this.__onNativeWindowFocus);
      qx.event2.Manager.addNativeListener(window, "blur", this.__onNativeWindowBlur);
    }
    
    
    // Normalized Listeners
    qx.event2.Manager.addListener(this._root, "mousedown", this._onMouseDown, this);
    qx.event2.Manager.addListener(win, "focus", this._onWindowFocus, this);
    qx.event2.Manager.addListener(win, "blur", this._onWindowBlur, this);
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
    
    _onNativeWindowBlur : function(e)
    {
      var target = e.target || window.event.srcElement;

      switch(target)
      {
        case this._window:
        case this._document:
          // Omit doubled blur events
          // which is a common behavior at least for gecko based clients
          if (this._windowFocussed)
          {
            this._windowFocussed = false;
            this.__fireCustom(this._window, "blur");
          }

          break;
      }
    },
    
    _onNativeWindowFocus : function(e)
    {
      var target = e.target || window.event.srcElement;
      
      switch(target)
      {
        case this._window:
        case this._document:
          // Omit doubled focus events
          // which is a common behavior at least for gecko based clients
          if (!this._windowFocussed)
          {
            this._windowFocussed = true;
            this.__fireCustom(this._window, "focus");
          }

          break;
          
        default:
          // If focus is already correct, don't configure both
          // This is the case for all mousedown events normally
          if (this.getFocus() !== target)
          {
            this.setActive(target);
            this.setFocus(target);
          }
      }     
    },
    
    _onWindowBlur : function(e)
    {
      this.debug("Window blurred");
      
      this.resetActive();
      this.resetFocus();
    },
    
    _onWindowFocus : function(e)
    {
      this.debug("Window focussed");
    },
    




    
    
    /**
     * onclick handler
     *
     * @type member
     * @param e {Event}
     */
    _onMouseDown : function(e) 
    {
      var node = e.getTarget();

      this.setActive(node);
      
      // find first node with a valid tabindex
      while (node) 
      {
        if (node.tabIndex !== undefined && node.tabIndex >= 0) 
        {
          this.setFocus(node);
          return;
        }
        
        node = node.parentNode;
      }
      
      this.setFocus(this._root);
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
