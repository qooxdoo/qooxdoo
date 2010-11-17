.. _pages/application/playground#playground:

Playground
**********

.. image:: playground.png
           :target: http://demo.qooxdoo.org/%{version}/playground

The Playground application allows you to play with code in an edit pane, and see the result of running that code in a preview pane. It comes with a set of pre-defined code samples, but many more are available, e.g. from `github <http://gist.github.com/>`__. Code can also be bookmarked and the links saved and re-run, to re-create the sample you were working on. This allows for easy sharing of running code samples with others.

The scope of the code you can enter in the edit pane is restricted to what you can do in the ``main()`` method of a standard qooxdoo application class.

Bookmarklet
===========

.. note::
  experimental

.. code-block:: javascript

  javascript:(function(s){try{s=document.selection.createRange().text}catch(e){s=window.getSelection().getRangeAt(0).toString()};s=s.replace(/\r?\n/g,"%250D");window.open("http://demo.qooxdoo.org/%{version}/playground/#"+encodeURIComponent('{"code":"'+encodeURIComponent(s)+'"}'))})()

.. [This is an invisible comment]
   
   <a href='javascript:(function(s){try{s=document.selection.createRange().text}catch(e){s=window.getSelection().getRangeAt(0).toString()};s=s.replace(/\r?\n/g,"%0D");window.open("http://demo.qooxdoo.org/%{version}/playground/#"+encodeURIComponent(%27{"code":"%27+encodeURIComponent(s)+%27"}%27))})()'>.</a>

