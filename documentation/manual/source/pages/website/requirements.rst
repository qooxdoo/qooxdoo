.. _pages/website/requirements#requirements:

%{Website} Requirements
************************

Here are the requirements for developing and deploying with %{qooxdoo} %{Website}. You will usually include the %{Website} library on an HTML page and then write code that utilizes its API.

.. _pages/website/requirements#client:

Browsers
================

Code written against the %{Website} API will run in all major web browsers, particularly:

.. list-table::

   * - .. image:: /_static/logo_ie_24x24.png
     - Internet Explorer 8+
   * - .. image:: /_static/logo_firefox_24x24.png
     - Firefox 3.5+
   * - .. image:: /_static/logo_opera_24x24.png
     - Opera 15+
   * - .. image:: /_static/logo_safari_24x24.png
     - Safari 6+
   * - .. image:: /_static/logo_chrome_24x24.png
     - Chrome

%{Website} widgets are currently experimental and will not work in all browsers.



Installation and Setup
=======================

Download the %{Website} component from %{qooxdoo}'s `download page <http://%{qooxdoo}.org/downloads>`_ and place it in a suitable URI reachable from your development environment. Then include this URI with a ``<script>`` tag in the HTML page that you are developing.

.. code-block:: html

   <html>
   <head>
     <script href="<uri_of_%{Website}_download>"/>
     ...

That's it, you are ready to start working against the %{Website} API.
