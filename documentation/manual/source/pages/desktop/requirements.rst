.. _pages/desktop/requirements#requirements:

%{Desktop} Requirements
************************

Here are the requirements for developing and deploying with %{Desktop}. Applications built with it run in a web browser, so you need at least one of the supported browsers to check your work. During development time you will also need the tools from %{qooxdoo}'s SDK to create runnable versions of your application. But these tools are not necessary once you have deployed it.

The cross-browser abstraction of %{qooxdoo} not only benefits the users of your application, it allows also you as a developer to pick your preferred development platform, i.e. combination of browser and operating system, and be confident that the result will run on all other platforms. 

%{qooxdoo} %{Desktop} does not enforce any specific backend components, any server that is reachable through its I/O layer should be fine. During development, loading your application from the file system should suffice, as long as your application logic doesn't enforce a server connection. Developers should note, though, that with some browsers, such as Chrome and Firefox, there is a known constraint when loading reasonably complex %{qooxdoo} applications (such as the APIviewer or the Demobrowser) via the ``file://`` protocol. Either consult your browser's documentation (usually there is a command-line option to change this), or use the HTTP protocol during development. In the latter case be sure to read and understand this `FAQ entry <http://%{qooxdoo}.org/docs/general/snippets#running_a_source_version_from_a_web_server>`__.



.. _pages/desktop/requirements#client:

Browsers
================

An application comprising of the %{qooxdoo} runtime and custom code written against its API runs across all major web browsers, unaltered, and with identical look & feel:

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

.. _pages/desktop/requirements#tools:

SDK
=====

Working with %{Desktop} requires from you that you download and use %{qooxdoo}'s SDK. See here for the :doc:`SDK's requirements </pages/tool/sdk_requirements>`, and follow its *Installation and Setup* section. This requirement applies to the development phase only, the final app is independent of the SDK.


