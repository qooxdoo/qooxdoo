/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Viktor Ferenczi (python@cx.hu)
     * Thomas Herchenroeder (thron7)

************************************************************************ */

/* ************************************************************************

#module(buildtool)

************************************************************************ */

qx.Class.define("buildtool.FileSystemService",
{
  //extend : qx.ui.basic.Terminator,
  //extend : qx.core.Target,
  extend : qx.ui.tree.Tree,

  construct : function(rpc)
  {
    this.base(arguments, "Qooxdoo");

    this.rpc = rpc;
    this.mycall = null;

    this.set(
    {
      rootOpenClose : true,
      alwaysShowPlusMinusSymbol : true,
      useTreeLines    : true           // display tree lines
    });

    /*
     * All subtrees will use this root node's event listeners.  Create an
     * event listener for an open while empty.
     */
    this.addEventListener("treeOpenWhileEmpty", this.__treeOpenWhileEmpty, this);
    //this.getManager().addEventListener("changeSelection", alert('in constructor'), this);
    //this.getManager().addEventListener("changeSelection", function(){alert('in constructor')}, this);

  },

  members : {

    __treeOpenWhileEmpty : function(e)
    {
        var parent = e.getData();
        var hierarchy = parent.getHierarchy(new Array());
        var that = this;

        parent.debug("Requesting children...");

        // Strip off the root node
        hierarchy.shift();

        this.mycall = this.rpc.callAsync(
            function(result, ex, id)
            {
                that.mycall = null;
                if (ex == null) {
                    parent.debug("Children obtained.  Rendering...");
                    that.__addChildren(parent, result);
                    parent.debug("Rendering complete.");
                } else {
                    alert("Async(" + id + ") exception: " + ex);
                }
            },
            "fss.readDirEntries",
            hierarchy,
            true);
    },


    __addChildren : function(parent, children)
    {
        var t;
        var trs;
        var child;
        var obj;

        if (children.length > 0) {
          parent.setAlwaysShowPlusMinusSymbol(false);
        }

        for (i = 0; i < children.length; i++)
        {
            child = children[i];

            trs = qx.ui.tree.TreeRowStructure.getInstance().newRow();

            // Here's our indentation and tree-lines
            trs.addIndent();

            // If not a file or directory, change the icon
            var bIsDirectory = ((child.mode & 0040000) != 0);
            var bIsFile = ((child.mode & 0100000) != 0);
            if (! bIsDirectory && ! bIsFile)
            {
                trs.addIcon("icon/16/places/user-desktop.png",
                            "icon/16/apps/accessories-dictionary.png");
            }
            else
            {
                trs.addIcon();
            }

            // The label
            trs.addLabel(child.name);

            // All else should be right justified
            obj = new qx.ui.basic.HorizontalSpacer;
            trs.addObject(obj, true);

            // Add the permissions
            mode = "";
            mode = ((child.mode & 0001) ? "x" : "-") + mode;
            mode = ((child.mode & 0002) ? "w" : "-") + mode;
            mode = ((child.mode & 0004) ? "r" : "-") + mode;
            mode = ((child.mode & 0010) ? "x" : "-") + mode;
            mode = ((child.mode & 0020) ? "w" : "-") + mode;
            mode = ((child.mode & 0040) ? "r" : "-") + mode;
            mode = ((child.mode & 0100) ? "x" : "-") + mode;
            mode = ((child.mode & 0200) ? "w" : "-") + mode;
            mode = ((child.mode & 0400) ? "r" : "-") + mode;
            obj = new qx.ui.basic.Label(mode);
            obj.setWidth(80);
            obj.setStyleProperty("fontFamily", "monospace");
            trs.addObject(obj, true);

            // Add a file size, date and mode
            obj = new qx.ui.basic.Label(child.size + "");
            obj.setWidth(50);
            obj.setStyleProperty("fontFamily", "monospace");
            trs.addObject(obj, true);

            var d = new Date();
            d.setTime(child.mtime * 1000);
            obj = new qx.ui.basic.Label(d.toString().slice(0,33));
            obj.setWidth(200);
            obj.setStyleProperty("fontFamily", "monospace");
            trs.addObject(obj, true);

            if (bIsDirectory)
            {
                t = new qx.ui.tree.TreeFolder(trs);
                t.setAlwaysShowPlusMinusSymbol(true);
            }
            else
            {
                t = new qx.ui.tree.TreeFile(trs);
            }
            parent.add(t);
        }
    }
  }
});


