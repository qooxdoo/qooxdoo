.. _pages/widget/toolbar#toolbar:

Toolbar
*******
The ToolBar widget is responsible for displaying a toolbar in the application. Therefore it is a container for Buttons, RadioButtons, CheckBoxes and Separators.

XXX
===

.. _pages/widget/toolbar#preview_image:

Preview Image
-------------
|widget/toolbar.jpg|

.. |widget/toolbar.jpg| image:: widget/toolbar.jpg

.. _pages/widget/toolbar#features:

Features
--------
  * Buttons
    * Regular
    * Radio
    * Toggle
    * Menu
  * Icons and / or labels for all buttons
  * Separation into parts
  * Separator handles

.. _pages/widget/toolbar#description:

Description
-----------
The qx.ui.toolbar package, which contains all stuff needed for the toolbar widget, has the main class called ToolBar. The ToolBar class is the main container for the rest of the classes. 
If you want to group your buttons in the toolbar, you can do this with parts. The parts class acts as a subelement of the toolbar with almost the same functionality. To a part you can add buttons. There are some kinds of buttons in the toolbar package:
  * Buttons
  * Radio buttons
  * CheckBox buttons
  * MenuButtons
  * SplitButtons
This buttons can also be added directly to the toolbar if no parts are needed.
For further structuring the toolbar, a Separator is available in the package which can be added.

.. _pages/widget/toolbar#diagram:

Diagram
-------
<graphviz !0_8_toolbar_uml>
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

        ToolBar [
            label = "{ToolBar}"
        ]

        Part [
            label = "{Part}"
        ]

        PartHandle [
            label = "{PartHandle }"
        ]

        Button [
            label = "{Button}"
        ]

         RadioButton [
            label = "{RadioButton}"
        ]

        CheckBox [
            label = "{CheckBox}"
        ]

        Separator [
            label = "{Separator }"
        ]              

        edge [
          arrowtail = "ediamond"
          arrowhead = "none"

          labeldistance = 1.5
          labelangle = 10

          headlabel = "*"
        ]

        ToolBar -> Part
        ToolBar -> CheckBox
        ToolBar -> RadioButton
        ToolBar -> Button
        ToolBar -> Separator

        Part -> CheckBox
        Part -> Button
        Part -> Separator
        Part -> RadioButton

        edge [
          arrowtail = "ediamond"
          arrowhead = "none"

          headlabel = "1"
        ]

        Part -> PartHandle

}
</graphviz>

.. _pages/widget/toolbar#demos:

Demos
-----
Here are some links that demonstrate the usage of the widget:\\
  * `Toolbar with all features <http://demo.qooxdoo.org/1.2.x/demobrowser/#widget~ToolBar.html>`_
  * `Toolbar in a browser demo <http://demo.qooxdoo.org/1.2.x/demobrowser/#showcase~Browser.html>`_
  * `Toolbar with other menus <http://demo.qooxdoo.org/1.2.x/demobrowser/#widget~Menu.html>`_

.. _pages/widget/toolbar#api:

API
---
Here is a link to the API of the Widget:\\
`qx.ui.toolbar <http://demo.qooxdoo.org/1.2.x/apiviewer/index.html#qx.ui.toolbar>`_

