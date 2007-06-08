/**
 * High performance DOM Element creation
 *
 *
 */
qx.Class.define("qx.html2.Element",
{
  extend : qx.core.Object,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(el)
  {
    this.base(arguments);

    this.__children = [];
    this.__attribCache = {};
    this.__styleCache = {};

    if (el)
    {
      this.__element = el;
      this.__nodeName = el.tagName.toLowerCase();
      this.__created = true;
      this.__inserted = true; // not 100% correct (bubble up?)
    }
  },




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

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
            } else {
              item.__sync();
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




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __nodeName : "div",
    __element : null,
    __created : false,
    __inserted : false,

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
      for (key in cache) {
        el[key] = cache[key];
      }

      cache = this.__styleCache;
      for (key in cache) {
        style[key] = cache[key];
      }

      if (html)
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
      else
      {
        for (var i=0, l=children.length; i<l; i++)
        {
          child = children[i];
          if (!child.__created) {
            children[i].__addToQueue();
          }
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







    __addChild : function(child)
    {
      if (child.__parent === this) {
        throw new Error("Already in: " + child);
      }

      child.__parent = this;

      if (this.__created && !child.__created) {
        child.__addToQueue();
      }
    },

    __removeChild : function(child)
    {
      if (child.__parent !== this) {
        throw new Error("Has no child: " + child);
      }

      delete child.__parent;

      if (!child.__created) {
        child.__removeFromQueue();
      }
    },








    add : function(child)
    {
      this.__addChild(child);
      this.__children.push(child);
    },

    addList : function(varargs)
    {
      for (var i=0, l=arguments.length; i<l; i++) {
        this.add(arguments[i]);
      }
    },

    insertAfter : function()
    {


      return qx.lang.Array.insertAfter(this.__children, child, rel);
    },

    insertBefore : function(child, rel)
    {

      return qx.lang.Array.insertBefore(this.__children, child, rel);
    },

    insertAt : function(child, index)
    {

      return qx.lang.Array.insertAt(this.__children, child, index);
    },

    remove : function(child)
    {
      this.__removeChild(child);
      qx.lang.Array.remove(this.__children, item);
    },

    removeAt : function(index)
    {
      this.__removeChild(child);
      return qx.lang.Array.removeAt(this.__children, index);
    },

    removeList : function(varargs)
    {
      for (var i=0, l=arguments.length; i<l; i++) {
        this.remove(arguments[i]);
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






    __mshtmlPixels :
    {
      "width" : "pixelWidth",
      "height" : "pixelHeight",
      "left" : "pixelLeft",
      "top" : "pixelTop",
      "right" : "pixelRight",
      "bottom" : "pixelBottom"
    },

    pixel : function(key, value)
    {
      if (qx.core.Variant.isSet("qx.client", "mshtml"))
      {
        if (this.__mshtmlPixels[key])
        {
          key = this.__mshtmlPixels[key];
        }
        else
        {
          value += "px";
        }
      }
      else
      {
        value += "px";
      }

      return this.style(key, value);
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
