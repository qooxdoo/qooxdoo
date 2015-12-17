Getting Started with %{qooxdoo} %{Website}
*******************************************

It's easy to start using %{Website}. Create an HTML page and ``<script>``-include the `%{Website} library file(s) <http://qooxdoo.org/downloads/qx.website>`__, then add code that uses its API. Here is a simple example:

.. code-block:: html

   <html>
     <head>
       <script src="<uri_to_%{Website}_file>"/>
     </head>
   <body>
     <div>
       Hello World!
     </div>
     <script>
       alert(%{Q}("div").getHtml());
     </script>
   </body>
   </html>


