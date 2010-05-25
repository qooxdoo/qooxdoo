.. _pages/ui_html_editing/html_editing_in_general#html_editing_in_general:

HTML Editing In General
***********************

.. _pages/ui_html_editing/html_editing_in_general#external_information:

External Information
====================

.. _pages/ui_html_editing/html_editing_in_general#general_infos:

General infos
-------------

    * `Rich HTML editing - Part 1 <http://dev.opera.com/articles/view/rich-html-editing-in-the-browser-part-1/>`_

.. _pages/ui_html_editing/html_editing_in_general#browsers:

Browsers
--------

.. _pages/ui_html_editing/html_editing_in_general#mozilla_midas:

Mozilla ("Midas")
^^^^^^^^^^^^^^^^^

    * `Midas specification <http://www.mozilla.org/editor/midas-spec.html>`_
    * `Demo <http://www.mozilla.org/editor/midasdemo/>`_
    * `Migrationguide IE -> Gecko <http://www.mozilla.org/editor/ie2midas.html>`_
    * `Documentation <http://lxr.mozilla.org/seamonkey/source/editor/docs/midas-spec.html>`_
    * `Source code (see list under MidasCommand in nsHTMLDocument.cpp) <http://lxr.mozilla.org/seamonkey/ident?i=MidasCommand>`_
    * `DOM Client Object Cross-Reference <http://developer.mozilla.org/en/docs/DOM_Client_Object_Cross-Reference>`_

.. _pages/ui_html_editing/html_editing_in_general#ie_html_edit:

IE ("HTML Edit")
^^^^^^^^^^^^^^^^

    * `MSDN Overview and tutorials <http://msdn2.microsoft.com/en-us/library/aa770039(VS.85).aspx>`_
    * `Documentation <http://msdn.microsoft.com/workshop/author/editing/tutorials/html_editor.asp>`_
    * `Overview of Command Identifiers <http://msdn.microsoft.com/workshop/author/dhtml/reference/commandids.asp>`_
   * `A Note about the DHTML Editing Control in IE7+ <http://blogs.msdn.com/ie/archive/2006/06/27/648850.aspx>`_

.. _pages/ui_html_editing/html_editing_in_general#opera:

Opera
^^^^^

    * `Opera Browser Wiki <http://operawiki.info/TextAreaEditor/>`_

.. _pages/ui_html_editing/html_editing_in_general#safari:

Safari
^^^^^^

    * `WebKit: HTML Editing <http://webkit.org/projects/editing/index.html>`_
    * `Quietly, Safari Finally Gains WYSIWYG Editing Powers <http://www.musingsfrommars.org/2007/03/quietly-safaris-rendering-engine-gains-wysiwyg-editing-powers.html>`_
    * `execCommand list <http://lists.apple.com/archives/Webcore-dev/2005/May/msg00013.html>`_
    * `WYSIWYG comes to Safari 1.3 <http://allforces.com/2005/04/19/wysiwyg-comes-to-safari-13/>`_

.. _pages/ui_html_editing/html_editing_in_general#compatibility:

Compatibility
-------------

    * `The Mozile project <http://mozile.mozdev.org/0.8/doc/jsdoc/>`_ contains code which adapts Internet Explorer's Selection object to an interface like Mozilla's.
    * `Converting your app from IE to Midas <http://www.mozilla.org/editor/ie2midas.html>`_
    * `execCommand compatibility <http://www.quirksmode.org/dom/execCommand.html>`_

.. _pages/ui_html_editing/html_editing_in_general#general:

General
-------

    * `htmlarea.com <http://www.htmlarea.com>`_
    * `cmsreview.com <http://www.cmsreview.com/WYSIWYG/OpenSource/directory.html>`_
    * `geniisoft.com <http://www.geniisoft.com/showcase.nsf/WebEditors>`_
    * `Web-Based Rich Text Editors Compared <http://bulletproofbox.com/web-based-rich-text-editors-compared>`_

.. _pages/ui_html_editing/html_editing_in_general#overview_of_exisiting_wysiwyg_editors:

Overview of exisiting WYSIWYG editors
=====================================
^ Editor   ^ License    ^ Pro/Con ^
| `YUI RTE <http://developer.yahoo.com/yui/editor/>`_ | BSD | **Pro**works with all well-known browsers ( IE / Gecko / Opera / Safari / Konquerer )**Con**Still in Beta (although the final release version should be out soon). |
|  |  |  |
| `Xinha <http://xinha.python-hosting.com/>`_ | HTMLArea (BSD based) | |
|  |  |  |
| `RTE <http://www.kevinroth.com/rte/>`_ | Creative Commons | |
|  |  |  |
| `RTEF <http://www.rtef.info/>`_ | MIT | **Pro**works with all well-known browsers ( IE / Gecko / Opera / Safari / Konquerer )**Con**no user-feedback e.g. which font or size is currently used |
|  |  |  |
| `WYMEditor <http://www.wymeditor.org/en/>`_ | MIT/GPL | **Pro**produces XHTML, uses CSS**Con**currently only available for IE and Gecko |
|  |  |  |
| `dojo <http://dojotoolkit.org/docs/rich_text.html>`_ | BSD | |
|  |  |  |
| `TinyMCE <http://tinymce.moxiecode.com/>`_ | LGPL | |
|  |  |  |
| `FCKEdit <http://www.fckeditor.net/demo/default.html>`_ | GPL, LGPL and MPL | |
|  |  |  |
| `Solmetra <http://www.solmetra.com/en/>`_ | GPL | |
|  |  |  |
| `FreeRTE <http://www.freerichtexteditor.com/>`_ | Creative Commons | |
|  |  |  |
| `CMSimple <http://www.cmsimple.dk/>`_ | AGPL | |
|  |  |  |
| `XStandard lite <http://www.xstandard.com>`_ | Freeware | |
|  |  |  |
| `Loki <http://apps.carleton.edu/opensource/loki/>`_ | GPL | |
|  |  |  |
| `Whizzywig <http://www.unverse.net/>`_ | - | | 

.. _pages/ui_html_editing/html_editing_in_general#browser-specific_overview_of_execcommand:

Browser-specific overview of "execCommand"
==========================================
^ command ^ Mozilla ^ IE ^ Opera ^ Safari ^
| Bold | X | X | X | X |
| Italic | X | X | X | X |
| Underline | X | X | X | X |
| Strikethrough | X | X | X | X |
|  |  |  |  |  | 
| **Color**
 |  |  |  |  | 
| BackColor | X | X | X | X |
| ForeColor | X | X | X | X |
| HiliteColor | X | - | - | X |
|  |  |  |  |  | 
| **Font Handling**
 |  |  |  |  | 
| FontName | X | X | X | X |
| FontSize | X | X | X | X |
| IncreaseFontSize | X | - | X | - |
| DecreaseFontSize | X | - | X | - |
| Subscript | X | X | X | X |
| Superscript | X | X | X | X |
|  |  |  |  |  |
| **Formatting and CSS**
 |  |  |  |  | 
| ContentReadOnly | X | - | X | - |
| StyleWidthCSS | X | - | - | - |
| UseCSS | X | - | X | - |
| RemoveFormat | X | X | X | X |
|  |  |  |  |  |
| **User actions**
 |  |  |  |  | 
| Copy | X | X | - | X |
| Paste | X | X | - | X |
| Cut | X | X | X | X |
| Delete | X | X | X | X |
| Undo | - | X | X | X |
| Redo | - | X | X | X |
| Print | - | X | - | X |
| SaveAs | - | X | - | - |
|  |  |  |  |  | 
| **Alignment**
 |  |  |  |  | 
| JustifyLeft | X | X | X | X |
| JustifyCenter | X | X | X | X |
| JustifyRight | X | X | X | X |
| JustifyFull | X | - | X | X |
| Indent | X | X | - | X |
| Outdent | X | X | - | X |
|  |  |  |  |  | 
| **Hyperlinks**
 |  |  |  |  | 
| CreateLink | X | X | X | X |
| Unlink | X | X | X | X |
|  |  |  |  |  | 
| **Lists**
 |  |  |  |  | 
| InsertOrderedList | X | X | X | X |
| InsertUnorderedList | X | X | X | X |
|  |  |  |  |  | 
| **Basic (formatting) elements**
 |  |  |  |  | 
| FormatBlock | X | X | X | X |
| Heading | X | - | - | - |
| InsertParagraph | X | X | X | X |
| InsertImage | X | X | X | X |
| InsertButton | - | X | - | - |
| InsertFieldset | - | X | - | - |
| InsertHorizontalRule | - | X | X | X |
| InsertHTML | X | - | X | X |
| InsertIFrame | - | X | - | - |
|  |  |  |  |  | 
| **Form elements**
 |  |  |  |  | 
| InsertInputButton | - | X | - | - |
| InsertInputCheckbox | - | X | - | - |
| InsertInputFileUpload | - | X | - | - |
| InsertInputHidden | - | X | - | - |
| InsertInputImage | - | X | - | - |
| InsertInputPassword | - | X | - | - |
| InsertInputRadio | - | X | - | - |
| InsertInputReset | - | X | - | - |
| InsertInputSubmit | - | X | - | - |
| InsertInputText | - | X | - | - |
| InsertSelectDropdown | - | X | - | - |
| InsertSelectListbox | - | X | - | - |
| InsertTextArea | - | X | - | - |
| InsertMarquee | - | X | - | - |
|  |  |  |  |  | 
| **Bookmarking**
 |  |  |  |  | 
| CreateBookmark | - | X | - | - |
| UnBookmark | - | X | - | - |
|  |  |  |  |  | 
| **Selection and status handling**
 |  |  |  |  | 
| SelectAll | X | X | X | X |
| Unselect | - | X | X | X |
| MultipleSelection | - | X | - | - |
| Overwrite | - | X | - | - |
| Refresh | - | X | - | - |
|  |  |  |  |  | 
| **Misc**
 |  |  |  |  | 
| 2D-Position | - | X | - | - |
| AbsolutePosition | - | X | - | - |
| LiveResize | - | X | - | - |
| gethtml | X | - | - | - |
| contentReadOnly | X | - | - | - |
| insertBrOnReturn | X | - | - | - |
| enableObjectResizing | X | - | - | - |
| enableInlineTableEditing| X | - | - | - |