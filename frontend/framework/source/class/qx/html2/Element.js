/**
 * High performance DOM element creation
 *
 * Includes support for HTML and style attributes. Allows to
 * add children or to apply text or HTML content.
 *
 * Processes DOM insertion and modification based on the concept
 * of edit distance in an optimal way. This means that operations
 * on visible DOM nodes will be reduced at all needs.
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

    this.__attribJobs = [];
    this.__styleJobs = [];

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
     STATICS
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
        console.debug("Add to queue object[" + item.toHashCode() + "]");

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
        console.debug("Remove from queue object[" + item.toHashCode() + "]");

        this.__queue.remove(item);
        delete item.__queued;
      }
    },







    /*
    ---------------------------------------------------------------------------
      CONTENT FLUSH
    ---------------------------------------------------------------------------
    */

    __flushContent : function(entry)
    {
      if (entry.__text) {
        this.__flushText(entry);
      } else if (entry.__html) {
        this.__flushHtml(entry);
      } else {
        this.__flushChildren(entry);
      }
    },

    __flushText : function(entry)
    {
      // MSHTML does not support textContent (DOM3), but the
      // properitary innerText attribute
      if (entry.__element.textContent !== undefined)
      {
        entry.__element.textContent = entry.__text;
      }
      else
      {
        entry.__element.innerText = entry.__text;
      }
    },

    __flushHtml : function(entry)
    {
      entry.__element.innerHTML = entry.__html;
    },

    __flushChildren : function(entry)
    {
      // **********************************************************************
      //   Compute needed operations
      // **********************************************************************

      // Collect all element nodes of the children data
      var target = [];
      for (var i=0, a=entry.__children, l=a.length; i<l; i++)
      {
        if (!a[i].__created) {
          a[i].__create();
        }

        target.push(a[i].__element);
      }

      var parentElement = entry.__element;
      var source = parentElement.childNodes;

      // Compute edit operations
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





      // **********************************************************************
      //   Process operations
      // **********************************************************************

      var job;
      var domOperations = 0;

      // Store offsets which are a result of element moves
      var offsets = [];

      for (var i=0, l=operations.length; i<l; i++)
      {
        job = operations[i];

        // ********************************************************************
        //   Apply offset
        // ********************************************************************

        if (offsets[job.pos] !== undefined)
        {
          job.pos -= offsets[job.pos];

          // We need to be sure that we don't get negative indexes.
          // This will otherwise break array/collection index access.
          if (job.pos < 0) {
            job.pos = 0;
          }
        }


        // ********************************************************************
        //   Process DOM
        // ********************************************************************

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
          //   Offset calculation
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
          //   The real DOM work
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

      var queue = this.__queue;
      var entry, child, a, i, l;


      console.info("Process: " + queue.length + " entries...");




      // **********************************************************************
      //   Create DOM elements
      // **********************************************************************

      // Creating DOM nodes could modify the queue again
      // because the generated children will also be added
      // to the queue

      i=0;

      while(queue.length > i)
      {
        for (l=queue.length; i<l; i++)
        {
          entry = queue[i];

          if(!entry.__created) {
            entry.__create();
          }

          for (var j=0, a=entry.__children, lj=a.length; j<lj; j++)
          {
            child = a[j];

            if(!child.__queued)
            {
              queue.push(child);
              child.__queued = true;
            }
          }
        }
      }






      // **********************************************************************
      //   Apply content
      // **********************************************************************

      l = queue.length;

      console.info("Flush: " + l + " entries...");

      for (i=0; i<l; i++)
      {
        entry = queue[i];

        // the invisible items
        if (!entry.__inserted)
        {
          this.__flushContent(entry);
          delete entry.__queued;
        }
      }

      for (i=0; i<l; i++)
      {
        entry = queue[i];

        // the remaining items
        if (entry.__queued)
        {
          this.__flushContent(entry);
          delete entry.__queued;
        }
      }





      // **********************************************************************
      //   Cleanup
      // **********************************************************************

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

      for (var i=0, l=children.length; i<l; i++)
      {
        child = children[i];

        if (!child.__created) {
          child.__create();
        }
      }

      this.__created = true;
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

      // If this element is created
      if (this.__created) {
        this.self(arguments).addToQueue(this);
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

      if (this.__created && child.__created)
      {
        // If the DOM element is really inserted, we need to remove it
        if (child.__element.parentNode === this.__element) {
          this.self(arguments).addToQueue(this);
        }
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

      if (this.__created) {
        this.self(arguments).addToQueue(this);
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
     * Returns the DOM element (if created). Please don't use this.
     * Better to use the alternatives like setText, setHtml and all
     * the children functions.
     *
     * @throws an error if the element was not yet created
     * @return {Element} the DOM element node
     */
    getElement : function()
    {
      if (!this.__created) {
        throw new Error("Element is not yet created!");
      }

      return this.__element;
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

      if (this.__created) {
        this.self(arguments).addToQueue(this);
      }

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

      if (this.__created) {
        this.self(arguments).addToQueue(this);
      }

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
