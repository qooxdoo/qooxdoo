BAT - qooxdoo Build And Test environment
========================================

This directory contains (contrary to its name) all components of qooxdoo's
nascent automated build and test environment, i.e. server and client components
for the test communication, as well as build and workpack components.

The aim is to have a suite of tools to

  o create and maintain continuously various qooxdoo release packets on a 
    server (think "continuum server"), and
  o provide a client-server platform for test clients to download, unpack, build
    and run those packets, and send reports back to the server (think "qooxdoo @
    home")

and provide all of this in a highly automated fashion.

Here is an overview of the files and their purposes:

- readme.txt      -- this file

- batbuild.py     -- implements a simple continuous integration server that
                     checks for changes in qooxdoo's SVN repository, checks
                     out the latest version, and runs some build targets on
                     it. It is self-contained and can be run on its own.
                     
- batserver.py    -- the server part of a simple client-server network communi-
                     cation. Its purpose is to distribute work information to
                     clients that run jobs on the local platform and send back
                     the results. Runs stand-alone, but only makes sense when
                     used with batclients.
                     
- batclient.py    -- the client side of the "qooxdoo@home" protocol. Contacts
                     a batserver, retrieves work information and passes back
                     results.
                     
- workpack1.py    -- a sample (and currently only) workpackage that can be 
                     distributed by a batserver to a batclient that is willing
                     to do a job. This one just downloads qooxdoo SDK's, unpacks
                     them and optionally runs some build targets on them. Could
                     be easily extended to do more testing on the SDK.
