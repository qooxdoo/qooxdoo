# Tree

The tree package contains classes that allow you to build up visual trees, like
the ones you are familiar with e.g. for browsing your file system. Expanding and
collapsing tree nodes is handled automatically by showing or hiding the
contained subtree structure.

## Preview Image

![tree.png](tree.png)

## Features

- Different open and selection modes
- Toggle-able tree root

## Description

A `Tree` contains items in a hierarchical structure. The first item inside a
`Tree` is called the root. A tree always contains one single `TreeFolder` as the
root widget which itself can contain several other items. A `TreeFolder` (which
is also called _node_) can contain `TreeFolder` widgets or `TreeFile` widgets.
The `TreeFile` widget (also called _leaf_) consists of an icon and a label.

## UML Diagram

![tree_uml.png](tree_uml.png)

## Dependencies

![tree_dependencies_uml.png](tree_dependencies_uml.png)

## Demos

Here are some links that demonstrate the usage of the widget:

- [Complex demo which shows many features of the tree](apps://demobrowser/#widget~Tree.html)
- [A multi column tree](apps://demobrowser/#widget~Tree_Columns.html)

## API

Here is a link to the API of the Widget:
[qx.ui.tree](apps://apiviewer/#qx.ui.tree)
