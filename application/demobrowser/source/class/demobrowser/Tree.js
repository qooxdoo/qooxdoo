/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Thomas Herchenroeder (thron7)

************************************************************************ */

qx.Class.define("demobrowser.Tree",
{
  extend : qx.core.Object,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);
    
    this.label = arguments[0] || "";
    this.children = [];
    this.parent = null;
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * TODOC
     *
     * @return {Array | var} TODOC
     */
    pwd : function()  // aka 'dirname'
    {
      if (this.parent == null) {
        return [];
      } else {
        return this.parent.pwd().concat(this.parent.label);
      }
    },


    /**
     * TODOC
     *
     * @return {var} TODOC
     */
    hasChildren : function() {
      return this.children.length;
    },


    /**
     * TODOC
     *
     * @return {var} TODOC
     */
    getChildren : function() {
      return this.children;
    },


    /**
     * TODOC
     *
     * @param fun {var} TODOC
     * @param args {var} TODOC
     * @return {void}
     */
    map : function(fun, args)
    {
      var style = "depth";
      var curr = this;

      // apply to self
      var iter = this.getIterator(style);

      while (curr = iter()) {
        fun.apply(curr, args);
      }
    },


    /**
     * TODOC
     *
     * @return {void}
     */
    print : function()
    {
      this.map(function() {
        this.debug(this.label);
      }, []);
    },


    /**
     * returns an iterator function for the tree from this.
     * (implemented with Agenda Search)
     *
     * @param style {String} "depth"|"breadth" - traversal style
     * @return {Function} iterator {Function}
     */
    getIterator : function(style)  // returns an iterator function
    {
      var agenda = [ this ];
      var depthfirst = style == "depth" ? 1 : 0;

      function f()
      {
        var curr;

        if (agenda.length)
        {
          curr = agenda.shift();
          var children = curr.getChildren();

          if (children.length)  // expand container
          {
            if (depthfirst) {
              agenda = children.concat(agenda);  // depth-first
            } else {
              agenda = agenda.concat(children);  // breadth-first
            }
          }
        }
        else
        {
          curr = null;
        }

        return curr;
      }

      // f()
      return f;
    },


    /**
     * TODOC
     *
     * @return {var} TODOC
     */
    getPrevSibling : function() {
      return this.getSibling(-1);
    },


    /**
     * TODOC
     *
     * @return {var} TODOC
     */
    getNextSibling : function() {
      return this.getSibling(1);
    },


    /**
     * TODOC
     *
     * @param offset {var} TODOC
     * @return {var} TODOC
     */
    getSibling : function(offset)
    {
      var sibs = this.parent.getChildren();
      var myIndex = this.self(arguments).indexOf(sibs, this);
      var sibIndex = myIndex + offset;

      if (sibs[sibIndex]) {
        return sibs[sibIndex];
      }
    },


    /**
     * TODOC
     *
     * @param node {Node} TODOC
     * @return {void}
     */
    add : function(node)
    {
      this.children.push(node);
      node.parent = this;
    }
  },

  statics :
  {
    // compute the index of an array element
    /**
     * TODOC
     *
     * @param arr {Array} TODOC
     * @param obj {Object} TODOC
     * @return {var} TODOC
     */
    indexOf : function(arr, obj)
    {
      for (var i=0; i<arr.length; i++)
      {
        if (arr[i] == obj) {
          return i;
        }
      }
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this._disposeObjects("widgetLinkFull", "widgetLinkFlat", "parent");
    this._disposeArray("children");
  }
});
