/**
 * High performance DOM element creation and flush
 *
 *
 */
qx.Class.define("qx.html2.Element",
{
  extend : qx.core.Object,
  
  construct : function(el)
  {
    this.base(arguments);
    
    this.__element = el || null;
    this.__nodeName = el ? el.tagName.toLowerCase() : "div";
    this.__created = !!el;
    this.__inserted = !!el; // not 100% correct (bubble up?)

    this.__attribCache = {};
    this.__styleCache = {}; 
    this.__children = [];   
  },
  
  statics : 
  {
    __queue : [],
    
    addToQueue : function(item) 
    {
      if (!item.__queued) 
      {
        this.__queue.push(item)
        item.__queued = true;
      }
    },
    
    removeFromQueue : function(item) 
    {
      if (item.__queued) 
      {
        qx.lang.Array.remove(this.__queue, item);
        item.__queued = undefined;
      }
    },
    
    flushQueue : function()
    {
      if (this.__inFlushQueue) {
        return;
      }
      
      this.__inFlushQueue = true;
      
      var queue = this.__queue;
      var item;
      var parent;
      var i=0;
      
      var parents = {};

      // create item
      while(queue.length > i)      
      {
        for (l=queue.length; i<l; i++)
        {
          item = queue[i];
          parent = item.__parent;

          if (parent) 
          {
            if (!item.__created) {
              item.__create();        
            }
            
            parents[parent.toHashCode()] = parent;
          }
        }
      }
      
      var parent;
      var child;
      
      // insert children of not inserted parents
      for (var hc in parents)
      {
        parent = parents[hc];
        
        if (parent.__inserted) {
          continue; 
        }
        
        console.debug("Process not inserted parent: " + parent.element());
        
        var children = parent.__children;
        var parentElement = parent.element();
          
        for (var i=0, l=children.length; i<l; i++) 
        {
          console.log("Append: " + children[i].element() + " to " + parentElement);            
          parentElement.appendChild(children[i].element());
        }
          
        delete parents[hc];
      }
      
      // insert children of inserted parents (nearly identical to above loop)
      for (var hc in parents)
      {
        parent = parents[hc];
        
        console.debug("Process inserted parent: " + parent.element());        
        
        var children = parent.__children;
        var parentElement = parent.element();
      
        for (var i=0, l=children.length; i<l; i++) 
        {
          console.log("Append: " + children[i].element() + " to " + parentElement);
          parentElement.appendChild(children[i].element());
        }
        
        delete parents[hc];
      }
      
      for (var i=0, l=queue.length; i<l; i++) 
      {
        item = queue[i];
        delete item.__queued;
      }
      
      delete this.__inFlushQueue;
    }
  },
  
  members : 
  {
    addToQueue : function() {
      this.self(arguments).addToQueue(this);
    },
    
    removeFromQueue : function() {
      this.self(arguments).removeFromQueue(this);
    },
    
    add : function() 
    {
      var child;
      
      for (var i=0, l=arguments.length; i<l; i++) 
      {
        child = arguments[i];

        if (child.__parent === this) {
          continue;
        }

        this.__children.push(child);
        child.__parent = this;
    
        if (this.__created && !child.__created) {
          this.self(arguments).addToQueue(child);
        }      
      }
    },
    
    remove : function() 
    {
      var child;
      
      for (var i=0, l=arguments.length; i<l; i++) 
      {
        child = arguments[i];
        
        if (child.__parent !== this) {
          continue;
        }
      
        qx.lang.Array.remove(this.__children, item);
        delete child.__parent;
      
        if (!child.__created) {
          this.self(arguments).removeFromQueue(child);
        }
      }
    },
    
    __create : function()
    {
      console.log("Create", this);
      
      var el = this.__element = document.createElement(this.__nodeName)
      var style = this.__style = el.style;
            
      var cache = this.__attribCache;
      for (key in cache) {
        el[key] = cache[key];
      }

      var cache = this.__styleCache;
      for (key in cache) {
        style[key] = cache[key];
      }
      
      var children = this.__children;
      var child;
      
      for (var i=0, l=children.length; i<l; i++) 
      {
        child = children[i];
        if (!child.__created) {
          children[i].addToQueue();
        }
      }
      
      this.__created = true;
    },
    
    element : function()
    {
      if (!this.__created) 
      {
        this.addToQueue();
        this.self(arguments).flush();
      }
      
      return this.__element;      
    },
  
    style : function(key, value)
    {
      this.__styleCache[key] = value;
      
      if (this.__created) {
        this.__style[key] = value;
      }
      
      return this;
    },

    attrib : function(key, value)    
    {
      this.__attribCache[key] = value;
      
      if (this.__created) {
        this.__element[key] = value;
      }
      
      return this;
    }   
  }
});
