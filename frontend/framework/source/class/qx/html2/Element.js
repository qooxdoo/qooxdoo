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
    __create : function()
    {
      console.debug("Create: " + this.toHashCode());

      var el = this.__element = document.createElement(this.__nodeName)
      var style = this.__style = el.style;

      var children = this.__children;
      var html = this.__html;
      var text = this.__text;
      var child;
      var cache;

      cache = this.__attribCache;
      if (cache)
      {
        for (key in cache) {
          el[key] = cache[key];
        }
      }

      cache = this.__styleCache;
      if (cache)
      {
        for (key in cache) {
          style[key] = cache[key];
        }
      }

      if (children)
      {
        for (var i=0, l=children.length; i<l; i++)
        {
          child = children[i];
          if (!child.__created) {
            children[i].__addToQueue();
          }
        }
      }
      else if (html)
      {
        el.innerHTML = html;
      }
      else if (text)
      {
        if (el.textContent !== undefined)
        {
          el.textContent = text;
        }
        else
        {
          el.innerText = text;
        }
      }

      this.__created = true;
    },

    __addToQueue : function() {
      this.self(arguments).addToQueue(this);
    },

    __removeFromQueue : function() {
      this.self(arguments).removeFromQueue(this);
    },






    add : function()
    {
      if (!this.__children) {
        this.__children = [];
      }

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
          child.__addToQueue();
        }
      }
    },

    remove : function()
    {
      if (!this.__children) {
        return;
      }

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
          child.__removeFromQueue();
        }
      }
    },

    element : function()
    {
      if (!this.__created)
      {
        this.__addToQueue();
        this.self(arguments).flush();
      }

      return this.__element;
    },

    style : function(key, value)
    {
      if (!this.__styleCache) {
        this.__styleCache = {};
      }

      this.__styleCache[key] = value;

      if (this.__created) {
        this.__style[key] = value;
      }

      return this;
    },

    pixel : function(key, value)
    {

    },

    attrib : function(key, value)
    {
      if (!this.__attribCache) {
        this.__attribCache = {};
      }

      this.__attribCache[key] = value;

      if (this.__created) {
        this.__element[key] = value;
      }

      return this;
    },

    html : function(html)
    {
      this.__html = html;
      return this;
    },

    text : function(text)
    {
      this.__text = text;
      return this;
    }
  }
});
