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
