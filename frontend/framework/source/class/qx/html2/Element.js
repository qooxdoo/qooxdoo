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




    addToQueue : function(item, job)
    {
      if (item.__queued)
      {
        if (item.__queued !== job) {
          throw new Error("Could not change job from " + item.__queued + " to " + job);
        }
      }
      else
      {
        console.debug("Add to queue element[" + item.toHashCode() + "]");

        this.__queue.push(item)
        item.__queued = job;
      }
    },

    removeFromQueue : function(item)
    {
      if (item.__queued)
      {
        console.debug("Remove from element[" + item.toHashCode() + "]");

        qx.lang.Array.remove(this.__queue, item);
        delete item.__queued;
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



      console.debug("Flush: " + queue.length + " items...");



      // == CREATE ==
      // create elements
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



      // == HIDDEN INSERT ==
      // insert children of not inserted parents
      for (var hc in parents)
      {
        parent = parents[hc];

        if (parent.__inserted) {
          continue;
        }

        console.debug("Process not inserted parent[" + parent.toHashCode() + "]");

        var children = parent.__children;
        var parentElement = parent.element();

        for (var i=0, l=children.length; i<l; i++)
        {
          child = children[i];

          if (true||child.__queued)
          {
            console.log("Append No: " + i + "[" + child.toHashCode() + "]");
            parentElement.appendChild(child.element());
          }
          else
          {
            console.log("Leave No: " + i + "[" + child.toHashCode() + "]");
          }
        }

        delete parents[hc];
      }




      // == VISIBLE INSERT ==
      // insert children of inserted parents (nearly identical to above loop)
      for (var hc in parents)
      {
        parent = parents[hc];

        console.debug("Process inserted parent[" + parent.toHashCode() + "]");

        var children = parent.__children;
        var parentElement = parent.element();

        for (var i=0, l=children.length; i<l; i++)
        {
          child = children[i];

          if (true||child.__queued)
          {
            console.log("Append No: " + i + "[" + child.toHashCode() + "]");
            parentElement.appendChild(child.element());
          }
          else
          {
            console.log("Leave No: " + i + "[" + child.toHashCode() + "]");
          }
        }

        delete parents[hc];
      }


      // == CLEANUP ==
      // cleanup queue and run-flag
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
      console.debug("Create element[" + this.toHashCode() + "]");

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
            children[i].__addToQueue("add");
          }
        }
      }

      this.__created = true;
    },

    __addToQueue : function(job) {
      this.self(arguments).addToQueue(this, job);
    },

    __removeFromQueue : function(job) {
      this.self(arguments).removeFromQueue(this, job);
    },








    __addChild : function(child)
    {
      if (child.__parent === this) {
        throw new Error("Already in: " + child);
      }

      child.__parent = this;

      if (this.__created && !child.__created) {
        child.__addToQueue("add");
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
      } else {
        child.__addToQueue("remove");
      }
    },

    __moveChild : function(child)
    {
      if (child.__parent !== this) {
        throw new Error("Has no child: " + child);
      }

      child.__addToQueue("move");
    },








    add : function(child)
    {
      this.__addChild(child);
      this.__children.push(child);

      return child;
    },

    addList : function(varargs)
    {
      for (var i=0, l=arguments.length; i<l; i++) {
        this.add(arguments[i]);
      }
    },

    insertAfter : function(child, rel)
    {
      this.__addChild(child);
      return qx.lang.Array.insertAfter(this.__children, child, rel);
    },

    insertBefore : function(child, rel)
    {
      this.__addChild(child);
      return qx.lang.Array.insertBefore(this.__children, child, rel);
    },

    insertAt : function(child, index)
    {
      this.__addChild(child);
      return qx.lang.Array.insertAt(this.__children, child, index);
    },






    remove : function(child)
    {
      this.__removeChild(child);
      qx.lang.Array.remove(this.__children, child);

      return child;
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





    moveTo : function(child, index)
    {
      this.__moveChild(child);

      var oldIndex = this.__children.indexOf(child);

      if (oldIndex === index) {
        throw new Error("Could not move to same index!");
      }

      if (oldIndex < index) {
        index++;
      }

      qx.lang.Array.removeAt(this.__children, oldIndex);
      qx.lang.Array.insertAt(this.__children, index);
    },

    moveBefore : function(child, rel) {
      this.moveTo(child, this.__children.indexOf(rel));
    },

    moveAfter : function(child, rel) {
      this.moveTo(child, this.__children.indexOf(rel)+1);
    },





    element : function()
    {
      if (!this.__created)
      {
        if (!this.__queued) {
          this.__addToQueue("create");
        }

        this.self(arguments).flushQueue();
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
