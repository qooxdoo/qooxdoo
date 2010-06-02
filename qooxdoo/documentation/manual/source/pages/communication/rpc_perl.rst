.. _pages/rpc_perl#rpc_with_a_perl_server:

RPC with a Perl server
**********************

*qooxdoo includes an advanced RPC mechanism for direct calls to server-side methods. It allows you to write true client/server applications without having to worry about the communication details.* 

As described in the :doc:`RPC overview <rpc>`, qooxdoo RPC is based on `JSON-RPC <http://json-rpc.org/>`_ as the serialization and method call protocol. This page describes how to set up and implement a Perl-based server.

.. _pages/rpc_perl#setup:

Setup
=====

Get a copy of the qooxdoo perl backend (``Qooxdoo::JSONRPC``) from our sourceforge `download area <https://sourceforge.net/project/showfiles.php?group_id=190279>`__. In the archive you will find a ``README.txt`` file as well as a ``README.CONFIGURE`` which contains details of how to set up the server. The steps involved are:

* First, make sure that you have the Perl ``JSON`` module installed. This can be found on CPAN, and if you can't get it prepackaged, can be installed with

  ::

    # perl -MCPAN -e 'install JSON'

* If you care for performance at all, you may want to make sure that you have the ``FCGI`` module installed as well as mod_fcgid in your apache server.

  ::

    # perl -MCPAN -e 'install FCGI'

* The ``JSONRPC`` module requires a module to take care of the session handling. You can either use the ``SessionLite`` module included with RpcPerl or you can get ``CGI::Session`` from CPAN.

* Next you'll need to configure a list of places to look for modules and services: Open ``jsonrpc.pl`` and add as many (space-separated) directories as you need to the lib list. Usually this need only contain the full path to wherever you have put your ``Qxoodoo::JSONRPC`` module.

  It does however mean that services can be spread across different directories for different projects. These are searched for as ``<path>/Qooxdoo/Services/<service name>``, and should have package names such as ``Qooxdoo::Services::qooxdoo::test`` (which corresponds to ``<path>/Qooxdoo/Services/qooxdoo/test.pm``).

  The harness will obviously be run as the user that the web server is configured to run as, so needs access to the perl backend files.

* Test that the script has all its dependencies, and can find the runtime module:

  ::

      $ ./jsonrpc.pl
      Content-Type: text/html; charset=ISO-8859-1

      Your HTTP Client is not using the JSON-RPC protocol

  If you get "Can't locate Qooxdoo/JSONRPC.pm in @INC" then you didn't get you library path right.

* Now you have a few choices, depending on how you plan to integrate with your web server. The quickest way to get going is to simply copy ``jsonrpc.pl`` into you ``cgi-bin`` directory.

* You can now point your web browser at the following address, and confirm that you get the JSON-RPC protocol error shown above.

  ::

      http://localhost/cgi-bin/jsonrpc.pl

.. _pages/rpc_perl#writing_your_own_services:

Writing your own services
=========================

Let's start by writing our own first service which will add its arguments up. The service will be called example.wiki and have a method called add.

To do this, we create a package called Qooxdoo::Services::example::wiki which will live in a file ``Qooxdoo/Services/example/wiki.pm``. It doesn't matter where this file lives, but it will be searched for using the path(s) that you specified in the jsonrpc.pl harness. For this example you can create the new file under ``backend/perl/Qooxdoo/Services/example``. Our service contains:

.. code-block:: perl

    package Qooxdoo::Services::example::wiki;

    use strict;

    use Qooxdoo::JSONRPC;

    sub method_add
    {
        my $error  = shift;
        my @params = @_;

        my $count  = 1+$#params;

        if ($count != 1)
        {
            $error->set_error (Qooxdoo::JSONRPC::JsonRpcError_ParameterMismatch,
                               "Expected 1 parameter, but got $count");
            return $error;
        }

        my @numbers = split (/\s+/, $params[0]);

        my $total = 0;
        $total += $_ foreach (@numbers);

        return $total;
    }

    1;

The service is just a Perl package containing functions called method_* which are exposed through RPC. When called, the first argument will always be an error object, and subsequent ones will be supplied by the calling Javascript. In this example we just add the numbers in the first argument, which is space separated. [In practice we would probably pass each number as a separate argument, but doing it this way allows us to use ``RPC_1.html`` for testing]

You can also see how the method has done a check on the supplied parameters, and raised an exception which will be raised in the client.

Now, let's give it a try using the ``RPC_1.html`` test harness. Change the URL to be the address of jsonrpc.pl, for example /cgi-bin/jsonrpc.pl, the service to be example.wiki and the method to be add. Finally, supply a list of numbers in the final field and click 'Send to server' to see a result.

If you get an error, particularly a server error, have a look in Apache's error_log to see if there is an error recorded. There is also a debug flag in ``JSONRPC.pm`` which can be enabled. All being well, you should receive a popup with the result.

.. _pages/rpc_perl#a_more_advanced_example:

A more advanced example
=======================

Let's write something that's a little more "real world" -- an address book! We'll use the ``NDBM`` database backend as I believe you should have it with Perl. We'll provide a couple of helper functions which open and close the database, as well as methods which list the database keys, fetch a record and store a record. These routines can be added to ``wiki.pm``.

.. code-block:: perl

    use Fcntl;
    use NDBM_File;

    use vars qw(%database);

    sub open_database
    {
        # Please choose a better database path on a public system
        tie %database, 'NDBM_File', '/tmp/database', O_RDWR|O_CREAT, 0666;
    }

    sub close_database
    {
        untie %database;
    }

    sub method_get_record_ids
    {
        my $error  = shift;

        open_database ();
        my @k = keys %database;
        close_database ();

        return \@k;
    }

    sub method_get_record
    {
        my $error = shift;
        my $id    = shift;

        open_database ();
        my $record = $database{$id};
        close_database ();

        return $record;
    }

    sub method_set_record
    {
        my $error  = shift;
        my $id     = shift;
        my $record = shift;

        open_database ();
        $database{$id} = $record;
        close_database ();

        return $record;
    }

Now to implement the front-end. Bear with me for a mo while I write it....
