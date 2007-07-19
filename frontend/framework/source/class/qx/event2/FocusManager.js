qx.Class.define("qx.event2.FocusManager",
{
  extend : qx.core.Target,
  
  construct : function(win)
  {
    this.base(arguments);
    
    this._winFocused = false;
    
    this._element = win.document.documentElement;
    this._root = this._element;
    
    qx.event2.Manager.addListener(this._element, "mousedown", this.__onMouseDown, this);
    qx.event2.Manager.addListener(this._element, "keyup", this.__onKeyUp, this);
    
    qx.event2.Manager.addListener(window, "blur", this.__onWindowBlur, this);
    qx.event2.Manager.addListener(window, "focus", this.__onWindowFocus, this);
  },
  
  properties :
  {
    active : 
    {
      check : "Element",
      event : "changeActive",
      apply : "_applyActive"
    },
    
    focus : 
    {
      check : "Element",
      event : "changeFocus",
      apply : "_applyFocus"
    }
  },
  
  members : 
  {
    __onWindowBlur : function(e)
    {
      this.debug("Blur in...");
      
      if (this._winFocused)
      {
        this.debug("Win BLUR: " + (e._dom.target == e.getTarget()) + ", " + e.getTarget());
        this._winFocused = false;
      }
    },
    
    __onWindowFocus : function(e)
    {
      this.debug("Focus in...");
      
      if (!this._winFocused)
      {
        this.debug("Win FOCUS: " + (e._dom.target == e.getTarget()) + ", " + e.getTarget());
        this._winFocused = true;
      }
    },
    
    
    
    
    /**
     * onkeyup handler
     * 
     * in the keyup phase of the keyevent the new focus has already been
     * set by the browser
     *
     * @type member
     * @param e {Event}
     */
    __onKeyUp : function(e)
    {
      this.debug("KeyUp: " + e._dom.target);
      
      if (e.getKeyIdentifier() == "Tab") {
        this.focus(e.getTarget());
      }      
    },
    
    
    /**
     * onclick handler
     *
     * @type member
     * @param e {Event}
     */
    __onMouseDown : function(e) 
    {
      var node = e.getTarget();
      
      this.debug("MouseDown");
      
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
        this.__fire(old, "beforedeactivate");
      }
      
      if (value) {
        this.__fire(value, "beforeactivate");
      }      
      
      if (old) {
        this.__fire(old, "deactivate");
      }

      if (value) {
        this.__fire(value, "activate");
      }
    },
    
    
    _applyFocus : function(value, old)
    {
      if (old) {
        this.__fire(old, "focusout");
      }
      
      if (value) {
        this.__fire(value, "focusin"); 
      }
      
      if (old) {
        this.__fire(old, "blur");
      }
      
      if (value) {
        this.__fire(value, "focus"); 
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
    
    __fire : function(el, type)
    {
      //var id = el.id ? "'" + el.id + "'" : "'#" + qx.core.Object.toHashCode(el) + "'";
      //this.debug("Fire " + id + ": " + type);

      // TODO Use new central pooling here
      var event = new qx.event2.type.Event;
      event.setTarget(el);
      event.setType(type);
      
      qx.event2.Manager.getInstance().dispatchEvent(event);      
      event.dispose();
    }
  } 
});
