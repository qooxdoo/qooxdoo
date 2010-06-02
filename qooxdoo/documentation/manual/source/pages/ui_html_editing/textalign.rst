.. _pages/ui_html_editing/textalign#text_align:

Text align
**********

The text align of a selction can be modified using the following exec commands: ``JustifyLeft``, ``JustifyCenter``, ``JustifyRight`` and ``JustifyFull``.

.. _pages/ui_html_editing/textalign#browsers:

Browsers
========

* **IE**: Text align is applied on the paragraph which contains the selection.
* **Gecko** and **Opera**: Text align is applied on selection only. The selection gets surrounded by a ``<div>`` tag containing a ``text-align`` style attribute.
* **Webkit**: Applies ``text-align`` style attribute on every ``<div>`` element that is (partly) selected.

.. _pages/ui_html_editing/textalign#problems:

Problems
========

* If ``<br>`` tags are used for line breaks, the textalign will be applied on the ``<p>`` tag in IE, even if only a part of this ``<p>`` has been selected!
* If ``<p>`` tags are used for line breaks, all style settings set will be "lost" after entering an other ``<p>`` tag in FF. It is necessary to "save" these settings manually and apply them on the new paragraph.