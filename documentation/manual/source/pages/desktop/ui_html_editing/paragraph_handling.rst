.. _pages/ui_html_editing/paragraph_handling#paragraph_handling:

Paragraph Handling
******************

The aim of the component is to facade all the browser differences concerning the behaviour when the user hits the ``Enter``, the ``Shift+Enter`` or the ``Control+Enter`` combination. And this is by far not an easy task since the differences between the browsers are enormous.

.. _pages/ui_html_editing/paragraph_handling#formatting_across_multiple_paragraphs:

Formatting across multiple paragraphs
=====================================

Every formatting infos like *underline*, *bold*, *text color*, *text size* etc. are transferred to the new paragraph. It is likely that the user expects to write on with the same configuration/modifications he applied to the former paragraph.

.. _pages/ui_html_editing/paragraph_handling#alignment:

Alignment
=========

A paragraph in always aligned completely - the way a word processor also work. This *can* be irritating at the first time of use if e.g. a paragraph contains multiple lines of text each separated by normal line-breaks, but concerning alignment the paragraph is treated only as whole. So every line of the paragraph (=the whole paragraph) is aligned and not only the line the cursor is currently located.

.. _pages/ui_html_editing/paragraph_handling#customization:

Customization
=============

The HtmlArea offers you two properties to customize the paragraph handling globally and thus customize the behaviour of the component.

.. _pages/ui_html_editing/paragraph_handling#insertparagraphonlinebreak:

insertParagraphOnLinebreak
--------------------------

The default value of this property is ``true``. It controls whether a new paragraph or a normal line-break is inserted when hitting the ``Enter`` key. Since the default behaviour of all word processors is to insert a new paragraph it is recommended to leave this property value with its default.

.. note::

  As every word processor the HtmlArea also supports inserting a normal line-break by using the key combination ``Shift+Enter``

.. _pages/ui_html_editing/paragraph_handling#insertlinebreakonctrlenter:

insertLinebreakOnCtrlEnter
--------------------------

This property also has a default value of ``true``. Since some users are familiar with the key combination ``Control+Enter`` to insert a normal line-break the HtmlArea component does support this. So in the default setup ``Control+Enter`` and ``Shift+Enter`` will end up with the same result.

.. _pages/ui_html_editing/paragraph_handling#technical_background:

Technical Background
====================

.. _pages/ui_html_editing/paragraph_handling#paragraph-handling_in_firefox:

Paragraph-Handling in Firefox
-----------------------------

.. _pages/ui_html_editing/paragraph_handling#browser_control:

Browser control
^^^^^^^^^^^^^^^

Currently the HtmlArea does only take control and manage the paragraphs on its own if

* SHIFT and CTRL keys are not pressed
* caret is not within a word
* focus node is not an element (current line is not empty)
* the focus is inside a list

.. _pages/ui_html_editing/paragraph_handling#htmlarea_control:

HtmlArea control
^^^^^^^^^^^^^^^^

If the HtmlArea with its paragraph handling takes control, the following actions are taken.

.. _pages/ui_html_editing/paragraph_handling#phase_1:_collecting_styles:

Phase 1: Collecting styles
""""""""""""""""""""""""""

* computed styles of the focus node are collected
* these styles are grouped in the correct order (e.g. special handling for text-decoration because the text-decoration is linked to the elements color value)

.. _pages/ui_html_editing/paragraph_handling#phase_2:_style_string_creation:

Phase 2: Style string creation
""""""""""""""""""""""""""""""

* a ``style`` attribute based on the computed styles is generated for the paragraph element -> only ``margin``, ``padding`` and ``text-align`` can be applied at paragraph-level. All other styles need to be applied at span elements (=child elements)
* a string with nested ``span`` / ``font`` element string is created. This element string is applied to the paragraph element. The nested structure is necessary because some styles need to be applied in the right order

.. _pages/ui_html_editing/paragraph_handling#phase_3:_nodes_creation:

Phase 3: Nodes creation
"""""""""""""""""""""""
The following string is applied with the "insertHtml" command

* an empty ``span`` element with an ID
* a ``p`` element with the paragraph style
* the nested ``span`` / ``font`` string to reflect the formatting which can't be applied at paragraph level

.. _pages/ui_html_editing/paragraph_handling#phase_4:_cleanup:

Phase 4: Cleanup
""""""""""""""""

* Gecko inserts a ``p`` element on his own even if we intercept. This element gets removed afterwards by selecting this paragragph and inserting an empty DIV element at the selection
* the ID of the empty ``span`` is removed (Gecko will remove an empty ``span`` then automatically)
* if an empty paragraph is detected it will be removed to avoid rendering problems

.. _pages/ui_html_editing/paragraph_handling#reasons_for_own_paragraph_handling:

Reasons for own paragraph handling
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

* support to keep formatting across multiple paragraphs or lists
* keep the caret always inside a ``p`` element
* keep control of the kind of line-breaking which is inserted
* normalize line-breaking
* act like MS Word

.. _pages/ui_html_editing/paragraph_handling#issues:

Issues
^^^^^^

* DOM manipulations **can** break Undo/Redo since Gecko is expecting a DOM node which does not exist anymore
* edge cases can occur which are not targeted yet
* future browser implementation can change and mess up the current implementation
* MS Word behaviour can not be achieved in a browser, yet