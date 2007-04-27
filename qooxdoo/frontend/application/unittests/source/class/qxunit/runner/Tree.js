/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Thomas Herchenroeder (thron7)

************************************************************************ */

/* ************************************************************************

#module(qxunit)
#resource(css:css)
#resource(image:image)

************************************************************************ */

qx.Class.define("qxunit.runner.Tree",
{
  extend : qx.core.Object,

  construct : function()
  {
    this.base(arguments);

    this.label    = arguments[0];
    this.children = [];
  },

  members : {

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
     * (Implemented with agenda search)
     *
     * @param style {String} "depth"|"width" - traversal style
     * @return iterator {Function}
     */
    getIterator : function (style)  // returns an iterator function
    {
      var agenda = [this];
      function f () 
      {
        var curr;
        if (agenda.length)
        {
          curr = agenda.shift();
          var children = curr.getChildren();
          if ( children.length) // expand container
          {
            agenda = agenda.concat(children);
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
    }
  }
});

