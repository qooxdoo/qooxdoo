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
    /*
    ---------------------------------------------------------------------------
      QUEUE MANAGMENT
    ---------------------------------------------------------------------------
    */

    __queue : [],


    /**
     * TODOC
     *
     * @type static
     * @param item {var} TODOC
     * @return {void}
     */
    addToQueue : function(item)
    {
      if (!item.__queued)
      {
        console.debug("Add to queue element[" + item.toHashCode() + "]");

        this.__queue.push(item);
        item.__queued = true;
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





    /*
    ---------------------------------------------------------------------------
      PARENT FLUSH
    ---------------------------------------------------------------------------
    */

    flushParent : function(parent)
    {
      /*
      if (qx.core.Variant.isSet("qx.debug", "on")) {
        console.debug("Flush parent[" + parent.toHashCode() + "]");
      }
      */

      // Store offsets which are a result of element moves
      var offsets = [];

      // Collect all element nodes of the children data
      var target = [];
      for (var i=0, a=parent.__children, l=a.length; i<l; i++) {
        target.push(a[i].getElement());
      }

      var parentElement = parent.getElement();
      var source = parentElement.childNodes;
      var operations = qx.util.EditDistance.getEditOperations(source, target);

      /*
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        // We need to convert the collection to an array otherwise
        // FireBug sometimes will display a live view of the DOM and not the
        // the snapshot at this moment.
        source = qx.lang.Array.fromCollection(source);

        console.log("Source: ", source.length + ": ", source);
        console.log("Target: ", target.length + ": ", target);
        console.log("Operations: ", operations);
      }
      */

      var job;
      var domOperations = 0;

      for (var i=0, l=operations.length; i<l; i++)
      {
        job = operations[i];

        if (offsets[job.pos] !== undefined)
        {
          job.pos -= offsets[job.pos];

          // We need to be sure that we don't get negative indexes.
          // This will otherwise break array/collection index access.
          if (job.pos < 0) {
            job.pos = 0;
          }
        }

        if (job.operation === qx.util.EditDistance.OPERATION_DELETE)
        {
          // Ignore elements which are not placed at their original position anymore.
          if (parentElement.childNodes[job.pos] === job.old)
          {
            // console.log("Remove: ", job.old);
            parentElement.removeChild(job.old);
          }
        }
        else
        {
          // Operations: insert and replace

          // ******************************************************************
          // Offset calculation
          // ******************************************************************

          // Element will be moved around in the same parent
          // We use the element on its old position and scan
          // to the begin. A counter will increment on each
          // step.
          //
          // This way we get the index of the element
          // from the beginning.
          //
          // After this we increment the offset of all affected
          // children (the following ones) until we reached the
          // current position in our operation queue. The reason
          // we stop at this point is that the following
          // childrens should already be placed correctly through
          // the operation method from the end to begin of the
          // edit distance algorithm.
          if (job.value.parentNode === parentElement)
          {
            // find the position/index where the element is stored currently
            previousIndex = -1;
            iterator = job.value;

            do
            {
              previousIndex++;
              iterator = iterator.previousSibling;
            }
            while (iterator);

            // increment all affected offsets
            for (var j=previousIndex+1; j<=job.pos; j++)
            {
              if (offsets[j] === undefined) {
                offsets[j] = 1;
              } else {
                offsets[j]++;
              }
            }
          }



          // ******************************************************************
          // The real DOM work
          // ******************************************************************

          if (job.operation === qx.util.EditDistance.OPERATION_REPLACE)
          {
            if (parentElement.childNodes[job.pos] === job.old)
            {
              // console.log("Replace: ", job.old, " with ", job.value);
              domOperations++;
              parentElement.replaceChild(job.value, job.old);
            }
            else
            {
              // console.log("Pseudo replace: ", job.old, " with ", job.value);
              job.operation = qx.util.EditDistance.OPERATION_INSERT;
            }
          }

          if (job.operation === qx.util.EditDistance.OPERATION_INSERT)
          {
            var before = parentElement.childNodes[job.pos];

            if (before)
            {
              // console.log("Insert: ", job.value, " at: ", job.pos);
              parentElement.insertBefore(job.value, before);
              domOperations++;
            }
            else
            {
              // console.log("Append: ", job.value);
              parentElement.appendChild(job.value);
              domOperations++;
            }
          }
        }
      }

      console.info("Done: " + domOperations + " operations");
    },





    /*
    ---------------------------------------------------------------------------
      QUEUE FLUSH
    ---------------------------------------------------------------------------
    */

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

      var i, l;
      var item;
      var child;
      var parent;
      var parents = {};
      var queue = this.__queue;

      console.info("Flush: " + queue.length + " children...");






      // **********************************************************************
      // Create & remove elements
      // **********************************************************************

      i = 0;

      while (queue.length > i)
      {
        for (l=queue.length; i<l; i++)
        {
          item = queue[i];

          if (item.__oldParent)
          {
            item.__oldParent.getElement().removeChild(item.getElement());
            delete item.__oldParent;
          }

          if (item.__parent)
          {
            if (!item.__created) {
              item.__create();
            }

            parents[item.__parent.toHashCode()] = item.__parent;
          }
        }
      }




      // **********************************************************************
      // Apply DOM structure
      // **********************************************************************

      for (var hc in parents)
      {
        parent = parents[hc];

        if (!parent.__inserted)
        {
          this.flushParent(parent);
          delete parents[hc];
        }
      }

      for (var hc in parents)
      {
        parent = parents[hc];

        this.flushParent(parent);
        delete parents[hc];
      }




      // **********************************************************************
      // Cleanup queue
      // **********************************************************************

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

      if (html) {
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
            children[i].__addToQueue();
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
      this.self(arguments).addToQueue(this);
    },


    /**
     * TODOC
     *
     * @type member
     * @param job {var} TODOC
     * @return {void}
     */
    __removeFromQueue : function(job) {
      this.self(arguments).removeFromQueue(this);
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

      if (this.__created) {
        child.__addToQueue();
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

      if (child.__created)
      {
        if (child.__parent && !child.__oldParent)
        {
          child.__oldParent = child.__parent;
          child.__addToQueue();
        }
      }
      else
      {
        child.__removeFromQueue();
      }

      delete child.__parent;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getChildren : function()
    {
      // protect structure using a copy
      return qx.lang.Array.copy(this.__children);
    },


    /**
     * TODOC
     *
     * @type member
     * @param child {var} TODOC
     * @return {var} TODOC
     */
    indexOf : function(child) {
      return this.__children.indexOf(child);
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

      if (child.__created) {
        child.__addToQueue();
      }

      var oldIndex = this.__children.indexOf(child);

      if (oldIndex === index) {
        throw new Error("Could not move to same index!");
      } else if (oldIndex < index) {
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


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
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
    getElement : function()
    {
      if (!this.__created)
      {
        if (!this.__queued) {
          this.__addToQueue();
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
    setPixelStyle : function(key, value)
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

      return this.setStyle(key, value);
    },


    /**
     * TODOC
     *
     * @type member
     * @param key {var} TODOC
     * @return {var} TODOC
     */
    getPixelStyle : function(key)
    {
      if (qx.core.Variant.isSet("qx.client", "mshtml"))
      {
        if (this.__mshtmlPixels[key]) {
          key = this.__mshtmlPixels[key];
        }
      }

      var value = this.getStyle(key);
      return value !== undefined ? parseInt(value) : null;
    },


    /**
     * TODOC
     *
     * @type member
     * @param key {var} TODOC
     * @param value {var} TODOC
     * @return {var} TODOC
     */
    setStyle : function(key, value)
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
     * @return {var} TODOC
     */
    getStyle : function(key) {
      return this.__styleCache[key];
    },


    /**
     * TODOC
     *
     * @type member
     * @param key {var} TODOC
     * @param value {var} TODOC
     * @return {var} TODOC
     */
    setAttribute : function(key, value)
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
     * @param key {var} TODOC
     * @return {var} TODOC
     */
    getAttribute : function(key) {
      return this.__attribCache[key];
    },


    /**
     * TODOC
     *
     * @type member
     * @param html {var} TODOC
     * @return {var} TODOC
     */
    setHtml : function(html)
    {
      this.__html = html;
      return this;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getHtml : function() {
      return this.__html;
    },


    /**
     * TODOC
     *
     * @type member
     * @param text {var} TODOC
     * @return {var} TODOC
     */
    setText : function(text)
    {
      this.__text = text;
      return this;
    },


    /**
     * TODOC
     *
     * @type member
     * @param text {var} TODOC
     * @return {var} TODOC
     */
    getText : function(text) {
      return this.__text;
    }
  }
});
