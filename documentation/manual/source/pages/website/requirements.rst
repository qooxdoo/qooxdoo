.. _pages/website/requirements#requirements:

%{Website} Requirements
************************

Here are the requirements for developing and deploying with %{qooxdoo} %{Website}. You will usually include the %{Website} library on an HTML page and then write code that utilizes its API.

.. _pages/website/requirements#client:

Browsers
================

Code written against the %{Website} API will run in all major web browsers, particularly:

.. list-table::

   * - .. image:: /_static/ie.png 
     - Internet Explorer 6+
   * - .. image:: /_static/ff.png 
     - Firefox 2+
   * - .. image:: /_static/opera.png 
     - Opera 9+
   * - .. image:: /_static/safari.png 
     - Safari 3+
   * - .. image:: /_static/chrome.png 
     - Chrome 2+


Installation and Setup
=======================

Download the %{Website} component from %{qooxdoo}'s `download page <http://%{qooxdoo}.org/downloads>`_ and place it in a suitable URI reachable from your development environment. Then include this URI with a ``<script>`` tag in the HTML page that you are developing.

.. code-block:: html

   <html>
   <head>
     <script href="<uri_of_%{Website}_download>"/>
     ...

That's it, you are ready to start working against the %{Website} API.
