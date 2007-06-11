
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
      this.__inserted = true;  // not 100% correct (bubble up?)
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


    /**
     * TODOC
     *
     * @type static
     * @param item {var} TODOC
     * @param job {var} TODOC
     * @return {void}
     * @throws TODOC
     */
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

        this.__queue.push(item);
        item.__queued = job;
      }
    },


    /**
     * TODOC
     *
     * @type static
     * @param item {var} TODOC
     * @return {void}
     */
    removeFromQueue : function(item)
    {
      if (item.__queued)
      {
        console.debug("Remove from element[" + item.toHashCode() + "]");

        qx.lang.Array.remove(this.__queue, item);
        delete item.__queued;
      }
    },


    /**
     * TODOC
     *
     * @type static
     * @return {void}
     */
    flushQueue : function()
    {
      if (this.__inFlushQueue) {
        return;
      }

      this.__inFlushQueue = true;

      var queue = this.__queue;
      var item;
      var parent;
      var i = 0;

      var parents = {};

      console.debug("Flush: " + queue.length + " items...");

      // == CREATE ==
      // create elements
      while (queue.length > i)
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

          console.log("Append No: " + i + "[" + child.toHashCode() + "]");
          parentElement.appendChild(child.element());
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

          console.log("Append No: " + i + "[" + child.toHashCode() + "]");
          parentElement.appendChild(child.element());
        }

        delete parents[hc];
      }

      // == CLEANUP ==
      // cleanup queue and run-flag
      for (var i=0, l=queue.length; i<l; i++) {
        delete queue[i].__queued;
      }

      queue.length = 0;

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


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    __create : function()
    {
      console.debug("Create element[" + this.toHashCode() + "]");

      var el = this.__element = document.createElement(this.__nodeName);
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
        if (el.textContent !== undefined) {
          el.textContent = text;
        } else {
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


    /**
     * TODOC
     *
     * @type member
     * @param job {var} TODOC
     * @return {void}
     */
    __addToQueue : function(job) {
      this.self(arguments).addToQueue(this, job);
    },


    /**
     * TODOC
     *
     * @type member
     * @param job {var} TODOC
     * @return {void}
     */
    __removeFromQueue : function(job) {
      this.self(arguments).removeFromQueue(this, job);
    },


    /**
     * TODOC
     *
     * @type member
     * @param child {var} TODOC
     * @return {void}
     * @throws TODOC
     */
    __addChildHelper : function(child)
    {
      if (child.__parent === this) {
        throw new Error("Already in: " + child);
      }

      if (child.__parent) {
        child.__parent.__children.remove(child);
      }

      child.__parent = this;

      if (this.__created && !child.__created) {
        child.__addToQueue("add");
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param child {var} TODOC
     * @return {void}
     * @throws TODOC
     */
    __removeChildHelper : function(child)
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


    /**
     * TODOC
     *
     * @type member
     * @param child {var} TODOC
     * @return {var} TODOC
     */
    add : function(child)
    {
      this.__addChildHelper(child);
      this.__children.push(child);

      return child;
    },


    /**
     * TODOC
     *
     * @type member
     * @param varargs {var} TODOC
     * @return {void}
     */
    addList : function(varargs)
    {
      for (var i=0, l=arguments.length; i<l; i++) {
        this.add(arguments[i]);
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param child {var} TODOC
     * @param rel {var} TODOC
     * @return {var} TODOC
     */
    insertAfter : function(child, rel)
    {
      this.__addChildHelper(child);
      return qx.lang.Array.insertAfter(this.__children, child, rel);
    },


    /**
     * TODOC
     *
     * @type member
     * @param child {var} TODOC
     * @param rel {var} TODOC
     * @return {var} TODOC
     */
    insertBefore : function(child, rel)
    {
      this.__addChildHelper(child);
      return qx.lang.Array.insertBefore(this.__children, child, rel);
    },


    /**
     * TODOC
     *
     * @type member
     * @param child {var} TODOC
     * @param index {var} TODOC
     * @return {var} TODOC
     */
    insertAt : function(child, index)
    {
      this.__addChildHelper(child);
      return qx.lang.Array.insertAt(this.__children, child, index);
    },


    /**
     * TODOC
     *
     * @type member
     * @param child {var} TODOC
     * @return {var} TODOC
     */
    remove : function(child)
    {
      this.__removeChildHelper(child);
      qx.lang.Array.remove(this.__children, child);

      return child;
    },


    /**
     * TODOC
     *
     * @type member
     * @param index {var} TODOC
     * @return {var} TODOC
     */
    removeAt : function(index)
    {
      this.__removeChildHelper(child);
      return qx.lang.Array.removeAt(this.__children, index);
    },


    /**
     * TODOC
     *
     * @type member
     * @param varargs {var} TODOC
     * @return {void}
     */
    removeList : function(varargs)
    {
      for (var i=0, l=arguments.length; i<l; i++) {
        this.remove(arguments[i]);
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param child {var} TODOC
     * @param index {var} TODOC
     * @return {void}
     * @throws TODOC
     */
    moveTo : function(child, index)
    {
      if (child.__parent !== this) {
        throw new Error("Has no child: " + child);
      }

      child.__addToQueue("move");

      var oldIndex = this.__children.indexOf(child);

      if (oldIndex === index) {
        throw new Error("Could not move to same index!");
      }

      if (oldIndex < index) {
        index--;
      }

      qx.lang.Array.removeAt(this.__children, oldIndex);
      qx.lang.Array.insertAt(this.__children, child, index);
    },


    /**
     * TODOC
     *
     * @type member
     * @param child {var} TODOC
     * @param rel {var} TODOC
     * @return {void}
     */
    moveBefore : function(child, rel) {
      this.moveTo(child, this.__children.indexOf(rel));
    },


    /**
     * TODOC
     *
     * @type member
     * @param child {var} TODOC
     * @param rel {var} TODOC
     * @return {void}
     */
    moveAfter : function(child, rel) {
      this.moveTo(child, this.__children.indexOf(rel) + 1);
    },


    __printChildren : function()
    {
      for (var i=0, a=this.__children, l=a.length; i<l; i++) {
        console.log("Child[" + i + "]: " + a[i].toHashCode());
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
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
      "width"  : "pixelWidth",
      "height" : "pixelHeight",
      "left"   : "pixelLeft",
      "top"    : "pixelTop",
      "right"  : "pixelRight",
      "bottom" : "pixelBottom"
    },


    /**
     * TODOC
     *
     * @type member
     * @param key {var} TODOC
     * @param value {var} TODOC
     * @return {var} TODOC
     */
    pixel : function(key, value)
    {
      if (qx.core.Variant.isSet("qx.client", "mshtml"))
      {
        if (this.__mshtmlPixels[key]) {
          key = this.__mshtmlPixels[key];
        } else {
          value += "px";
        }
      }
      else
      {
        value += "px";
      }

      return this.style(key, value);
    },


    /**
     * TODOC
     *
     * @type member
     * @param key {var} TODOC
     * @param value {var} TODOC
     * @return {var} TODOC
     */
    style : function(key, value)
    {
      this.__styleCache[key] = value;

      if (this.__created) {
        this.__style[key] = value;
      }

      return this;
    },


    /**
     * TODOC
     *
     * @type member
     * @param key {var} TODOC
     * @param value {var} TODOC
     * @return {var} TODOC
     */
    attrib : function(key, value)
    {
      this.__attribCache[key] = value;

      if (this.__created) {
        this.__element[key] = value;
      }

      return this;
    },


    /**
     * TODOC
     *
     * @type member
     * @param html {var} TODOC
     * @return {var} TODOC
     */
    html : function(html)
    {
      this.__html = html;
      return this;
    },


    /**
     * TODOC
     *
     * @type member
     * @param text {var} TODOC
     * @return {var} TODOC
     */
    text : function(text)
    {
      this.__text = text;
      return this;
    }
  }
});
