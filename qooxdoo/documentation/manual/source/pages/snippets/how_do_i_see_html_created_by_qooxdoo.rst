How do I see HTML created by qooxdoo?
*************************************

Sometimes you want to see the HTML created by qooxdoo to solve layout problems or track down bugs in qooxdoo.

In Firefox you can use the `Firebug extension <http://getfirebug.com>`_. "Inspect Element" allows you to click on any part of the page and see the XML and CSS that generated the element.

Otherwise this link will work in all browsers to show the XML tree for the current page:

::

    javascript:if (window.document.body.outerHTML != undefined){'<xmp>'+window.document.body.outerHTML+'</xmp>'} else if (document.getElementsByTagName("html")[0].innerHTML != undefined){'<xmp>'+document.getElementsByTagName("html")[0].innerHTML+'</xmp>'} else if (window.document.documentElement.outerHTML != undefined){'<xmp>'+window.document.documentElement.outerHTML+'</xmp>'} else { alert('Your browser does not support this functionality') };

There is also a simpler form for IE that will open up the XML in a new window:

::

    javascript:void(window.open("javascript:'<xmp>'+opener.window.document.documentElement.outerHTML+'</xmp>'"));

You can create a shortcut for this on the toolbar.

:doc:`See this Ajaxian article for the original source <Ajaxian>ie-tip-cheeky-way-to-see-the-current-state-of-the-page>`.