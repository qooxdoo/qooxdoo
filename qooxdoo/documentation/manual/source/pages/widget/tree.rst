.. _pages/widget/tree#tree:

Tree
****
The tree package contains classes that allow you to build up visual trees, like the ones you are familiar with e.g. for browsing your file system. Expanding and collapsing tree nodes is handled automatically by showing or hiding the contained subtree structure.

.. _pages/widget/tree#preview_image:

Preview Image
-------------

|widget/tree.png|

.. |widget/tree.png| image:: /pages/widget/tree.png

.. _pages/widget/tree#features:

Features
--------
* Different open and selection modes
* Toggle-able tree root

.. _pages/widget/tree#description:

Description
-----------
A ``Tree`` contains items in an hierarchically structure. The first item inside a ``Tree`` is called the root. A tree always contains one single ``TreeFolder`` as the root widget which itself can contain several other items. A ``TreeFolder`` (which is also called *node*) can contain ``TreeFolder`` widgets or ``TreeFile`` widgets. The ``TreeFile`` widget (also called *leaf*) consists of an icon and a label.

.. _pages/widget/tree#uml_diagram:

UML Diagram
-----------

|widget/tree_uml.png|

.. |widget/tree_uml.png| image:: /pages/widget/tree_uml.png

.. _pages/widget/tree#dependencies:

Dependencies
------------
|widget/tree_dependencies_uml.png|

.. |widget/tree_dependencies_uml.png| image:: /pages/widget/tree_dependencies_uml.png

.. _pages/widget/tree#demos:

Demos
-----
Here are some links that demonstrate the usage of the widget:

* `Complex demo which shows many features of the tree <http://demo.qooxdoo.org/%{version}/demobrowser/#widget~Tree.html>`_
* `A multi column tree <http://demo.qooxdoo.org/%{version}/demobrowser/#widget~Tree_Columns.html>`_

.. _pages/widget/tree#api:

API
---
| Here is a link to the API of the Widget:
| `qx.ui.tree <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.tree>`_

