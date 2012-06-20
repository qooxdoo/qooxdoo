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
* `Documentation <http://www-archive.mozilla.org/editor/midas-spec.html>`__
* `DOM Client Object Cross-Reference <http://developer.mozilla.org/en/docs/DOM_Client_Object_Cross-Reference>`_

.. _pages/ui_html_editing/html_editing_in_general#ie_html_edit:

IE ("HTML Edit")
^^^^^^^^^^^^^^^^

* `MSDN Overview and tutorials <http://msdn2.microsoft.com/en-us/library/aa770039(VS.85).aspx>`_
* `Documentation <http://www.asp.net/ajaxLibrary/AjaxControlToolkitSampleSite/HtmlEditorExtender/HTMLEditorExtender.aspx>`__
* `Overview of Command Identifiers <http://msdn.microsoft.com/en-us/library/ms533049(v=vs.85).aspx>`_
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

Overview of existing WYSIWYG editors
=====================================

Here is an overview table:

.. list-table::
   :header-rows: 1

   * - Editor
     - License
     - Pro/Con

   * - `YUI RTE <http://developer.yahoo.com/yui/editor/>`__
     - BSD
     - **Pro**: works with all well-known browsers ( IE / Gecko / Opera / Safari / Konquerer ); **Con**: Still in Beta (although the final release version should be out soon). 

   * - `Xinha <http://xinha.org/>`__
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

   * - `dojo <http://dojotoolkit.org/reference-guide/dijit/Editor.html>`__
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
     -  x 
     -  x 
     -  x 
     -  x 


   * - Italic 
     -  x 
     -  x 
     -  x 
     -  x 

   * - Underline 
     -  x 
     -  x 
     -  x 
     -  x 

   * - Strikethrough 
     -  x 
     -  x 
     -  x 
     -  x 

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
     -  x 
     -  x 
     -  x 
     -  x 

   * - ForeColor 
     -  x 
     -  x 
     -  x 
     -  x 

   * - HiliteColor 
     -  x 
     -  
     -  
     -  x 

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
     -  x 
     -  x 
     -  x 
     -  x 

   * - FontSize 
     -  x 
     -  x 
     -  x 
     -  x 

   * - IncreaseFontSize 
     -  x 
     -  
     -  x 
     -  

   * - DecreaseFontSize 
     -  x 
     -  
     -  x 
     -  

   * - Subscript 
     -  x 
     -  x 
     -  x 
     -  x 

   * - Superscript 
     -  x 
     -  x 
     -  x 
     -  x 

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
     -  x 
     -  
     -  x 
     -  

   * - StyleWidthCSS 
     -  x 
     -  
     -  
     -  

   * - UseCSS 
     -  x 
     -  
     -  x 
     -  

   * - RemoveFormat 
     -  x 
     -  x 
     -  x 
     -  x 

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
     -  x 
     -  x 
     -  
     -  x 

   * - Paste 
     -  x 
     -  x 
     -  
     -  x 

   * - Cut 
     -  x 
     -  x 
     -  x 
     -  x 

   * - Delete 
     -  x 
     -  x 
     -  x 
     -  x 

   * - Undo 
     -  
     -  x 
     -  x 
     -  x 

   * - Redo 
     -  
     -  x 
     -  x 
     -  x 

   * - Print 
     -  
     -  x 
     -  
     -  x 

   * - SaveAs 
     -  
     -  x 
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
     -  x 
     -  x 
     -  x 
     -  x 

   * - JustifyCenter 
     -  x 
     -  x 
     -  x 
     -  x 

   * - JustifyRight 
     -  x 
     -  x 
     -  x 
     -  x 

   * - JustifyFull 
     -  x 
     -  
     -  x 
     -  x 

   * - Indent 
     -  x 
     -  x 
     -  
     -  x 

   * - Outdent 
     -  x 
     -  x 
     -  
     -  x 

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
     -  x 
     -  x 
     -  x 
     -  x 

   * - Unlink 
     -  x 
     -  x 
     -  x 
     -  x 

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
     -  x 
     -  x 
     -  x 
     -  x 

   * - InsertUnorderedList 
     -  x 
     -  x 
     -  x 
     -  x 

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
     -  x 
     -  x 
     -  x 
     -  x 

   * - Heading 
     -  x 
     -  
     -  
     -  

   * - InsertParagraph 
     -  x 
     -  x 
     -  x 
     -  x 

   * - InsertImage 
     -  x 
     -  x 
     -  x 
     -  x 

   * - InsertButton 
     -  
     -  x 
     -  
     -  

   * - InsertFieldset 
     -  
     -  x 
     -  
     -  

   * - InsertHorizontalRule 
     -  
     -  x 
     -  x 
     -  x 

   * - InsertHTML 
     -  x 
     -  
     -  x 
     -  x 

   * - InsertIFrame 
     -  
     -  x 
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
     -  x 
     -  
     -  

   * - InsertInputCheckbox 
     -  
     -  x 
     -  
     -  

   * - InsertInputFileUpload 
     -  
     -  x 
     -  
     -  

   * - InsertInputHidden 
     -  
     -  x 
     -  
     -  

   * - InsertInputImage 
     -  
     -  x 
     -  
     -  

   * - InsertInputPassword 
     -  
     -  x 
     -  
     -  

   * - InsertInputRadio 
     -  
     -  x 
     -  
     -  

   * - InsertInputReset 
     -  
     -  x 
     -  
     -  

   * - InsertInputSubmit 
     -  
     -  x 
     -  
     -  

   * - InsertInputText 
     -  
     -  x 
     -  
     -  

   * - InsertSelectDropdown 
     -  
     -  x 
     -  
     -  

   * - InsertSelectListbox 
     -  
     -  x 
     -  
     -  

   * - InsertTextArea 
     -  
     -  x 
     -  
     -  

   * - InsertMarquee 
     -  
     -  x 
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
     -  x 
     -  
     -  

   * - UnBookmark 
     -  
     -  x 
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
     -  x 
     -  x 
     -  x 
     -  x 

   * - Unselect 
     -  
     -  x 
     -  x 
     -  x 

   * - MultipleSelection 
     -  
     -  x 
     -  
     -  

   * - Overwrite 
     -  
     -  x 
     -  
     -  

   * - Refresh 
     -  
     -  x 
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
     -  x 
     -  
     -  

   * - AbsolutePosition 
     -  
     -  x 
     -  
     -  

   * - LiveResize 
     -  
     -  x 
     -  
     -  

   * - gethtml 
     -  x 
     -  
     -  
     -  

   * - contentReadOnly 
     -  x 
     -  
     -  
     -  

   * - insertBrOnReturn 
     -  x 
     -  
     -  
     -  

   * - enableObjectResizing 
     -  x 
     -  
     -  
     -  

   * - enableInlineTableEditing
     -  x 
     -  
     -  
     -  
