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
* `Documentation <http://lxr.mozilla.org/seamonkey/source/editor/docs/midas-spec.html>`__
* `Source code (see list under MidasCommand in nsHTMLDocument.cpp) <http://lxr.mozilla.org/seamonkey/ident?i=MidasCommand>`_
* `DOM Client Object Cross-Reference <http://developer.mozilla.org/en/docs/DOM_Client_Object_Cross-Reference>`_

.. _pages/ui_html_editing/html_editing_in_general#ie_html_edit:

IE ("HTML Edit")
^^^^^^^^^^^^^^^^

* `MSDN Overview and tutorials <http://msdn2.microsoft.com/en-us/library/aa770039(VS.85).aspx>`_
* `Documentation <http://msdn.microsoft.com/workshop/author/editing/tutorials/html_editor.asp>`__
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

.. list-table::
   :header-rows: 1

   * - Editor
     - License
     - Pro/Con

   * - `YUI RTE <http://developer.yahoo.com/yui/editor/>`__
     - BSD
     - **Pro**: works with all well-known browsers ( IE / Gecko / Opera / Safari / Konquerer ); **Con**: Still in Beta (although the final release version should be out soon). 

   * - `Xinha <http://xinha.python-hosting.com/>`__
     - HTMLArea (BSD based)
     -

   * - `RTE <http://www.kevinroth.com/rte/>`__
     - Creative Commons
     - 

   * - `RTEF <http://www.rtef.info/>`__
     - MIT
     - **Pro**: works with all well-known browsers ( IE / Gecko / Opera / Safari / Konquerer ); **Con**: no user-feedback e.g. which font or size is currently used. 

   * - `WYMEditor <http://www.wymeditor.org/en/>`__
     - MIT/GPL
     - **Pro**: produces XHTML, uses CSS; **Con**: currently only available for IE and Gecko.

   * - `dojo <http://dojotoolkit.org/docs/rich_text.html>`__
     - BSD
     - 

   * - `TinyMCE <http://tinymce.moxiecode.com/>`__
     - LGPL
     - 

   * - `FCKEdit <http://www.fckeditor.net/demo/default.html>`__
     - GPL, LGPL and MPL
     - 

   * - `Solmetra <http://www.solmetra.com/en/>`__
     - GPL
     - 

   * - `FreeRTE <http://www.freerichtexteditor.com/>`__
     - Creative Commons
     - 

   * - `CMSimple <http://www.cmsimple.dk/>`__
     - AGPL
     - 

   * - `XStandard lite <http://www.xstandard.com>`__
     - Freeware
     - 

   * - `Loki <http://apps.carleton.edu/opensource/loki/>`__
     - GPL
     - 

   * - `Whizzywig <http://www.unverse.net/>`__
     - 
     - 


.. _pages/ui_html_editing/html_editing_in_general#browser-specific_overview_of_execcommand:

Browser-specific overview of "execCommand"
==========================================

.. list-table::
   :header-rows: 1

   * - command 
     - Mozilla 
     - IE 
     - Opera 
     - Safari 

   * - Bold 
     -  - 
     -  - 
     -  - 
     -  - 


   * - Italic 
     -  - 
     -  - 
     -  - 
     -  - 

   * - Underline 
     -  - 
     -  - 
     -  - 
     -  - 

   * - Strikethrough 
     -  - 
     -  - 
     -  - 
     -  - 

   * -  
     -   
     -   
     -   
     -   

   * - **Color**
     -   
     -   
     -   
     -   

   * - BackColor 
     -  - 
     -  - 
     -  - 
     -  - 

   * - ForeColor 
     -  - 
     -  - 
     -  - 
     -  - 

   * - HiliteColor 
     -  - 
     -  
     -  
     -  - 

   * -  
     -   
     -   
     -   
     -   

   * - **Font Handling**
     -   
     -   
     -   
     -  

   * - FontName 
     -  - 
     -  - 
     -  - 
     -  - 

   * - FontSize 
     -  - 
     -  - 
     -  - 
     -  - 

   * - IncreaseFontSize 
     -  - 
     -  
     -  - 
     -  

   * - DecreaseFontSize 
     -  - 
     -  
     -  - 
     -  

   * - Subscript 
     -  - 
     -  - 
     -  - 
     -  - 

   * - Superscript 
     -  - 
     -  - 
     -  - 
     -  - 

   * -  
     -   
     -   
     -   
     -   

   * - **Formatting and CSS**
     -   
     -   
     -   
     -   

   * - ContentReadOnly 
     -  - 
     -  
     -  - 
     -  

   * - StyleWidthCSS 
     -  - 
     -  
     -  
     -  

   * - UseCSS 
     -  - 
     -  
     -  - 
     -  

   * - RemoveFormat 
     -  - 
     -  - 
     -  - 
     -  - 

   * -  
     -   
     -   
     -   
     -   

   * - **User actions**
     -   
     -   
     -   
     -   

   * - Copy 
     -  - 
     -  - 
     -  
     -  - 

   * - Paste 
     -  - 
     -  - 
     -  
     -  - 

   * - Cut 
     -  - 
     -  - 
     -  - 
     -  - 

   * - Delete 
     -  - 
     -  - 
     -  - 
     -  - 

   * - Undo 
     -  
     -  - 
     -  - 
     -  - 

   * - Redo 
     -  
     -  - 
     -  - 
     -  - 

   * - Print 
     -  
     -  - 
     -  
     -  - 

   * - SaveAs 
     -  
     -  - 
     -  
     -  

   * -  
     -   
     -   
     -   
     -   

   * - **Alignment**
     -   
     -   
     -   
     -   

   * - JustifyLeft 
     -  - 
     -  - 
     -  - 
     -  - 

   * - JustifyCenter 
     -  - 
     -  - 
     -  - 
     -  - 

   * - JustifyRight 
     -  - 
     -  - 
     -  - 
     -  - 

   * - JustifyFull 
     -  - 
     -  
     -  - 
     -  - 

   * - Indent 
     -  - 
     -  - 
     -  
     -  - 

   * - Outdent 
     -  - 
     -  - 
     -  
     -  - 

   * -  
     -   
     -   
     -   
     -   

   * - **Hyperlinks**
     -   
     -   
     -   
     -   

   * - CreateLink 
     -  - 
     -  - 
     -  - 
     -  - 

   * - Unlink 
     -  - 
     -  - 
     -  - 
     -  - 

   * -  
     -   
     -   
     -   
     -   

   * - **Lists**
     -   
     -   
     -   
     -   

   * - InsertOrderedList 
     -  - 
     -  - 
     -  - 
     -  - 

   * - InsertUnorderedList 
     -  - 
     -  - 
     -  - 
     -  - 

   * -  
     -   
     -   
     -   
     -  

   * - **Basic (formatting) elements**
     -   
     -   
     -   
     -   

   * - FormatBlock 
     -  - 
     -  - 
     -  - 
     -  - 

   * - Heading 
     -  - 
     -  
     -  
     -  

   * - InsertParagraph 
     -  - 
     -  - 
     -  - 
     -  - 

   * - InsertImage 
     -  - 
     -  - 
     -  - 
     -  - 

   * - InsertButton 
     -  
     -  - 
     -  
     -  

   * - InsertFieldset 
     -  
     -  - 
     -  
     -  

   * - InsertHorizontalRule 
     -  
     -  - 
     -  - 
     -  - 

   * - InsertHTML 
     -  - 
     -  
     -  - 
     -  - 

   * - InsertIFrame 
     -  
     -  - 
     -  
     -  

   * -  
     -   
     -   
     -   
     -   

   * - **Form elements**
     -   
     -   
     -   
     -   

   * - InsertInputButton 
     -  
     -  - 
     -  
     -  

   * - InsertInputCheckbox 
     -  
     -  - 
     -  
     -  

   * - InsertInputFileUpload 
     -  
     -  - 
     -  
     -  

   * - InsertInputHidden 
     -  
     -  - 
     -  
     -  

   * - InsertInputImage 
     -  
     -  - 
     -  
     -  

   * - InsertInputPassword 
     -  
     -  - 
     -  
     -  

   * - InsertInputRadio 
     -  
     -  - 
     -  
     -  

   * - InsertInputReset 
     -  
     -  - 
     -  
     -  

   * - InsertInputSubmit 
     -  
     -  - 
     -  
     -  

   * - InsertInputText 
     -  
     -  - 
     -  
     -  

   * - InsertSelectDropdown 
     -  
     -  - 
     -  
     -  

   * - InsertSelectListbox 
     -  
     -  - 
     -  
     -  

   * - InsertTextArea 
     -  
     -  - 
     -  
     -  

   * - InsertMarquee 
     -  
     -  - 
     -  
     -  

   * -  
     -   
     -   
     -   
     -   

   * - **Bookmarking**
     -   
     -   
     -   
     -   

   * - CreateBookmark 
     -  
     -  - 
     -  
     -  

   * - UnBookmark 
     -  
     -  - 
     -  
     -  

   * -  
     -   
     -   
     -   
     -   

   * - **Selection and status handling**
     -   
     -   
     -   
     -   

   * - SelectAll 
     -  - 
     -  - 
     -  - 
     -  - 

   * - Unselect 
     -  
     -  - 
     -  - 
     -  - 

   * - MultipleSelection 
     -  
     -  - 
     -  
     -  

   * - Overwrite 
     -  
     -  - 
     -  
     -  

   * - Refresh 
     -  
     -  - 
     -  
     -  

   * -  
     -   
     -   
     -   
     -   

   * - **Misc**
     -   
     -   
     -   
     -   

   * - 2D-Position 
     -  
     -  - 
     -  
     -  

   * - AbsolutePosition 
     -  
     -  - 
     -  
     -  

   * - LiveResize 
     -  
     -  - 
     -  
     -  

   * - gethtml 
     -  - 
     -  
     -  
     -  

   * - contentReadOnly 
     -  - 
     -  
     -  
     -  

   * - insertBrOnReturn 
     -  - 
     -  
     -  
     -  

   * - enableObjectResizing 
     -  - 
     -  
     -  
     -  

   * - enableInlineTableEditing
     -  - 
     -  
     -  
     -  
