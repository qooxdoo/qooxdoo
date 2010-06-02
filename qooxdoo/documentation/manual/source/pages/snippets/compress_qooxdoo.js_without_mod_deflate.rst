.. _pages/snippets/compress_qooxdoo.js_without_mod_deflate#compress_qooxdoo_without_mod_deflate:

Compress qooxdoo without mod_deflate
************************************

This explains how to enable a gzipped qooxdoo.js without having this possibility directly built in to your webserver.

If you have php at the server, you can write in your html file:

::

    <script type="text/javascript" src="<<path>>/qooxdoo.php"></script>

Then you create a file called qooxdoo.php with this content:

.. code-block:: php

    <?php
       /**
       * @author     Oliver Vogel <o.vogel@muv.com>
       * @since      05.03.2006
       */
       $encodings = array();
       if (isset($_SERVER['HTTP_ACCEPT_ENCODING']))
       {
           // Get all available encodings
           $encodings = explode(',', strtolower(preg_replace("/\s+/", "", $_SERVER['HTTP_ACCEPT_ENCODING'])));
             // Check for gzip header
           if (in_array('gzip', $encodings))
           {
               // found: send the zip-ed file
               header("Content-Encoding: gzip");
               echo file_get_contents(getenv('DOCUMENT_ROOT') . '<<path>>/qooxdoo.js.gz');
               die;
           }
       }

       // Encoding not found or gzip not accepted -> send "normal" file
       echo file_get_contents(getenv('DOCUMENT_ROOT') . '<<path>>/qooxdoo.js');
       die;
    ?>

This page checks if the browser supports gzip. If this is true, the server sends the gzip file to the client. This solution needs no gzip-support at the server-side!

Also, if you are writing your own webserver it is trivial to include this feature directly.

I know, it is NOT JavaScript but maybe it is a good idea to add this to the qooxdoo distribution (and it may be a good idea if one with Python or Perl or other experience ports this script to another server-side programming language).

Contributed by `Oliver Vogel <http://www.nabble.com/speed-up-loading-time-of-qooxdoo-t1234762.html>`_.
