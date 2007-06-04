/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Thomas Herchenroeder (thron7)

************************************************************************ */

/* ************************************************************************

#module(demobrowser)

************************************************************************ */

qx.Class.define("demobrowser.Tree",
{
  extend : qx.core.Object,

  construct : function()
  {
    this.base(arguments);

    this.label    = arguments[0] || "";
    this.children = [];
    this.parent   = null;
  },


  destruct : function ()
  {
    this._disposeObjectDeep("children",1);
  },


  members : {

    pwd : function ()  // aka 'dirname'
    {
      if (this.parent == null)
      {
        return [];
      } else
      {
        return this.parent.pwd().concat(this.parent.label);
      }
    },


    hasChildren : function ()
    {
      return this.children.length;
    },


    getChildren : function ()
    {
      return this.children;
    },


    map : function (fun, args)
    {
      var style = "depth";
      var curr  = this;
      // apply to self
      var iter = this.getIterator(style);
      while (curr = iter())
      {
        fun.apply(curr,args);
      }
    },


    print : function ()
    {
      this.map(function () { this.debug(this.label); }, []);
    },


    /**
     * returns an iterator function for the tree from this.
     * (implemented with Agenda Search)
     *
     * @param style {String} "depth"|"breadth" - traversal style
     * @return iterator {Function}
     */
    getIterator : function (style)  // returns an iterator function
    {
      var agenda     = [this];
      var depthfirst = style == "depth" ? 1 : 0;

      function f ()
      {
        var curr;
        if (agenda.length)
        {
          curr = agenda.shift();
          var children = curr.getChildren();
          if ( children.length) // expand container
          {
            if (depthfirst)
            {
              agenda = children.concat(agenda);  // depth-first
            } else
            {
              agenda = agenda.concat(children);  // breadth-first
            }
          }
        } else {
          curr = null;
        }
        return curr;
      }; // f()

      return f;
    },


    add : function (node)
    {
      this.children.push(node);
      node.parent = this;
    }


  }
});

