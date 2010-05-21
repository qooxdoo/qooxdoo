Feature List
************

This page aims to describe the features of the HtmlArea component. *Aims* because there are for sure features which are missing or considered as *must-have* to not enter the feature list as own entry.

This page should get you a good overview of what you can expect from this HTML editing component.

End-User Features
=================

Text Formatting
---------------

  * **Bold**
  * *Italic*
  * Underline

  * <del>Strikethrough</del>
  * Text Color

  * Background Color

  * Font Size

  * Font Family

Alignment
---------

  * This demonstration text is left aligned and covers more than one
line to show the line-breaking behaviour

  * This demonstration text is center aligned

  * This demonstration text is right aligned

  * This demonstration text is justify aligned and covers more than one
line to show the line-breaking behaviour

Lists
-----

<html>
  <ul>
    <li>Unordered</li>
    <li>lists</li>
  </ul>
</html>

<html>
  <ol>
    <li>Ordered</li>
    <li>lists</li>
  </ol>
</html>

Inserting
---------

  * Tables
  * Images
  * Horizontal rulers
  * `Hyperlink <#>`_

  * HTML code

Document Wide Formatting
------------------------

  * Background Image
  * Background Color

Additional Features
-------------------

  * Removing format
  * Select the whole content
  * Indent / Outdent
  * Undo / Redo

Developer Features
==================

Events
------

  * Load / LoadingError and Ready
  * Current cursor context
  * Contextmenu
  * Focus / Focus out

Content Manipulation
--------------------

  * Content as HTML output
  * Post-process HTML output
  * Current selected HTML 
  * Reset content
  * Context Information of current focused node (e.g. to update a toolbar widget)

Advanced Paragraph-Handling
---------------------------

  * Keeps formatting across multiple paragraphs
  * Type of line-break adjustable (new paragraph or new line)
  * Support for ``Shift+Enter`` and ``Ctrl+Enter`` to insert single line-break

Additional Features
-------------------

  * Hotkey Support
  * Set own CSS for content at startup
  * Access to content document and content body
  * Access to editable iframe element