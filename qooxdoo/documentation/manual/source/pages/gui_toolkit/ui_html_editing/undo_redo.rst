.. _pages/ui_html_editing/undo_redo#undo_and_redo:

Undo and Redo
*************

.. _pages/ui_html_editing/undo_redo#limitations:

Limitations
===========
The implementation of undo/redo in the HtmlArea has some limitations you should be aware of. 
It is possible to ``undo`` all of your steps but ``redo`` is only possible when no other action occured between the undo and the redo action. If you undo several steps and e.g. enter some text you **can not** execute redo anymore.

.. note::

  If you use the Undo/Redo functionality you have to make sure you are not manipulating the content of the HtmlArea by using the ``innerHTML`` property of an element.

  **This will break Undo/Redo functionality!**

.. _pages/ui_html_editing/undo_redo#implementation:_description_on_a_high-level:

Implementation: Description on a high-level
===========================================
The implementation is split up into two different approaches.

For Internet Explorer the ``execCommand`` approach can't be used anymore. The internal undo / redo stack gets broken on every DOM manipulation. So, if any qooxdoo decorator is used this approach is a dead end. Instead an own implementation using ``innerHTML`` is used for IE browsers.

For all other browsers the base of the Undo/Redo functionality is to use the ``execCommand`` method to manipulate the content **whenever** possible. Each change which is performed with a call of ``execCommand`` is easy to undo/redo. For any manipulation which cannot be achieved using the built-in ``execCommand`` a special implementation for each browser is necessary (e.g. changing the background color of the whole document).

.. _pages/ui_html_editing/undo_redo#using_the_decorator_pattern:

Using the Decorator Pattern
---------------------------
To easily integrate the undo/redo management with the commands of the HtmlArea the ``UndoManager`` class is a decorator of the ``CommandManager`` class. It takes the method calls from the HtmlArea class, collects the info for undo the action and calls the decorated ``commandManager`` class to actually perform the requested action. This keeps both implementations clean and separated.

.. _pages/ui_html_editing/undo_redo#tracking_changes_using_stacks:

Tracking changes using stacks
-----------------------------
Two stacks keep track of the changes which are done to the content: an **undo stack** and the corresponding **redo stack**. Currently each stack holds four different types of changes:

* Command
* Content-block
* Custom
* Internal

Each entry in the stacks is represented by an object which holds additional info (the type above is among this info). 

.. _pages/ui_html_editing/undo_redo#command:

Command
^^^^^^^
Every change which is performed with the ``execCommand`` method is equipped with this type. These changes are the easiest to track and to undo/redo.

.. _pages/ui_html_editing/undo_redo#content-block:

Content-block
^^^^^^^^^^^^^
Each keypress event is observed to determine changes in the content and to mark a set of content changes as an own block which is capable for an undo/redo step. For example IE and Gecko do both recognize text changes as a content block if the text changes occured between two calls of ``execCommand``.

.. _pages/ui_html_editing/undo_redo#custom:

Custom
^^^^^^
These changes are the ones which cannot be handled with the built-in ``execCommand`` method. For example changing the background color of the whole document is a custom undo/redo step which needs to be handled in a special way by each browser.

.. _pages/ui_html_editing/undo_redo#internal:

Internal
^^^^^^^^
These steps are included to keep the stacks intact if the user e.g. resizes an images with the handles provided by the browsers. It is possible to undo/redo these internal changes with the common ``execCommand`` method. The primary task here is to record these changes and add them to the stack(s).