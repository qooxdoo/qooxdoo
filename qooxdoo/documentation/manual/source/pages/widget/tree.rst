Tree
****
The tree package contains classes that allow you to build up visual trees, like the ones you are familiar with e.g. for browsing your file system. Expanding and collapsing tree nodes is handled automatically by showing or hiding the contained subtree structure.

XXX
===

Preview Image
-------------
|pages/widget/tree.png|

.. |pages/widget/tree.png| image:: /pages/widget/tree.png

Features
--------
  * Different open and selection modes
  * Toggle-able tree root

Description
-----------
A ``Tree`` contains items in an hierarchically structure. The first item inside a ``Tree`` is called the root. A tree always contains one single ``TreeFolder`` as the root widget which itself can contain several other items. A ``TreeFolder`` (which is also called *node*) can contain ``TreeFolder`` widgets or ``TreeFile`` widgets. The ``TreeFile`` widget (also called *leaf*) consists of an icon and a label.

UML Diagram
-----------
<graphviz !0_8_tree_uml>
digraph G {
        fontname = "Bitstream Vera Sans"
        fontsize = 8
        center = true

        node [
            fontname = "Bitstream Vera Sans"
            fontsize = 8
            shape = "record"
        ]

        Tree [
            label = "{Tree}"
        ]

        Abstract_Tree_Item [
            label = "{\<\<Abstract\>\>\nAbstractTreeItem}"
        ]

        TreeFolder [
            label = "{TreeFolder}"
        ]

        TreeFile [
            label = "{TreeFile}"
        ]

        edge [
            fontname = "Bitstream Vera Sans"
            fontsize = 8
            arrowtail = "odiamond"
            arrowhead = "none"
            label = " root"
            headlabel = "     0..1"
        ]
        Tree -> Abstract_Tree_Item

        edge [
            fontname = "Bitstream Vera Sans"
            fontsize = 8
            arrowtail = "odiamond"
            arrowhead = "none"
            label = " parent"
            headlabel = "0..1"
        ]
        Abstract_Tree_Item -> Abstract_Tree_Item

         edge [
            fontname = "Bitstream Vera Sans"
            fontsize = 8
            arrowtail = "odiamond"
            arrowhead = "none"
            label = "  children"
            headlabel = "*"
        ]
        Abstract_Tree_Item -> Abstract_Tree_Item

        edge [
            fontname = "Bitstream Vera Sans"
            fontsize = 8
            arrowtail = "empty"
            arrowhead = "none"
            label = ""
            headlabel = ""
        ]

        Abstract_Tree_Item -> TreeFolder
        Abstract_Tree_Item -> TreeFile        
}
</graphviz>

Dependences
-----------
<graphviz !0_8_tree_dependences>
digraph G {
        fontname = "Bitstream Vera Sans"
        fontsize = 8

        node [
            fontname = "Bitstream Vera Sans"
            fontsize = 8
            shape = "record"
        ]

        edge [
            fontname = "Bitstream Vera Sans"
            fontsize = 8
        ]

        Tree [
            label = "{Tree}"
        ]

        Root [
            label = "{TreeFolder (set as root)}"
        ]

        Folder1 [
            label = "{TreeFolder 1}"
        ]

        Folder2 [
            label = "{TreeFolder 2}"
        ]

        FolderN [
            label = "{TreeFolder N}"
        ]

        Node1 [
            label = "{TreeFile 1}"
        ]

        Node2 [
            label = "{TreeFile 2}"
        ]

        NodeN [
            label = "{TreeFile N}"
        ]

        Tree -> Root

        Root -> Folder1
        Root -> Folder2
        Root -> FolderN

        Folder1 -> Node1
        Folder1 -> Node2
        Folder1 -> NodeN

}
</graphviz>

Demos
-----
Here are some links that demonstrate the usage of the widget:\\
  * `Complex demo which shows many features of the tree <http://demo.qooxdoo.org/1.2.x/demobrowser/#widget-Tree.html>`_
  * `A multi column tree <http://demo.qooxdoo.org/1.2.x/demobrowser/#widget-Tree_Columns.html>`_

API
---
Here is a link to the API of the Widget:\\

`complete package and classname <http://demo.qooxdoo.org/1.2.x/apiviewer/#qx.ui.tree>`_

