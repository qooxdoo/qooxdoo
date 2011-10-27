.. _pages/ui_html_editing/default_paragraph_handling#default_paragraph_handling:

Default Paragraph Handling
**************************

This section describes how browsers and other applications react on different keys to enter line breaks or paragraphs.

**P** = paragraph (``<p>`` tag)

**LB** = line break  (``<br />`` tag)

.. _pages/ui_html_editing/default_paragraph_handling#browsers:

Browsers
========

.. list-table::
   :header-rows: 1
 
   * - 
     - Firefox
     - MSIE
     - Opera
     - Webkit
   * - <enter>
     - LB
     - P
     - LB
     - <div>
   * - <shift> + <enter>
     - LB
     - LB
     - LB
     - <div>
   * - <strg> + <enter>
     - ---
     - ---
     - ---
     - ---
    
.. _pages/ui_html_editing/default_paragraph_handling#word_processors_/_e-mail_clients:

Word processors / E-mail clients
================================

.. list-table::
   :header-rows: 1
 
   * - 
     - MS Word
     - OO Writer
     - Outlook
     - Thunderbird
   * - <enter>
     - P
     - P
     - P
     - LB
   * - <shift> + <enter>
     - LB
     - LB
     - LB
     - LB
   * - <strg> + <enter>
     - Page break
     - P
     - ---
     - LB
