.. _pages/ui_html_editing/copy_and_paste#copy_and_paste:

Copy and Paste
**************

For a HTML editor component it is important to get along with external content which is inserted with a ``Copy and Paste`` operation. This is especially important if any filter for the external content should be applied before the content is actually inserted in the editor.

However it is quite difficult to implement this across all major browsers. This short article should give a short overview about the existing events in the different browsers.

To get the detailed overview on this topic check out the section at `quirksmode.org <http://www.quirksmode.org/dom/events/cutcopypaste.html>`_

.. _pages/ui_html_editing/copy_and_paste#ie:

IE
==
This browser offers the most events. Besides ``onpaste`` and ``oncopy`` there are also events  like ``beforepaste``, ``beforecopy`` and ``beforecut``. 
Additionally all events are stoppable and are bubbling up the DOM hierarchy.

.. _pages/ui_html_editing/copy_and_paste#safari:

Safari
======
Follows almost the implementation of IE and goes partly beyond it. Safari offers a wide range of events to detect a ``Copy and Paste`` operation, but has currently no implementation at image elements.

.. _pages/ui_html_editing/copy_and_paste#gecko:

Gecko
=====
In Firefox 2 there is no support for any event to detect a ``Copy and Paste`` operation directly. One can detect the pressed shortcuts, but if the user paste some text via the menu/contextmenu there is possibility to catch that.
With the upcoming release of Firefox 3 this situation will improve. This version will have some support for such events like `onpaste <http://developer.mozilla.org/en/docs/DOM:element.onpaste>`_ or `oncopy <http://developer.mozilla.org/en/docs/DOM:element.oncopy>`_

.. _pages/ui_html_editing/copy_and_paste#opera:

Opera
=====
Same situation as Firefox 2: no working implementation for ``copy`` or ``paste`` events.