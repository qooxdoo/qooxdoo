.. _pages/tool/grunt#grunt:

Grunt frontend
**************

.. note::
  experimental

There is experimental support for a `Grunt <http://gruntjs.com/>`_ "flavored"
tool chain, build on top of the Generator, acting as a frontend to
the known Generator jobs and living side-by-side to the existing Generator.

Applications created with :ref:`create-application.py
<pages/getting_started/helloworld#create_your_application>` do now contain a
file called `Gruntfile.js <http://gruntjs.com/sample-gruntfile>`_, which is the
entry point for Grunt.


What?
=====

Grunt is ... TODO


Why?
====

The aim is to make existing functionality available through the Grunt frontend,
and see which parts of the tool chain can be replaced by Grunt plugins, be they
from the npm registry or self-written. For everything else the existing
Python-based tool chain will be utilized. The old build system stays untouched
for the time being, so you don’t have to worry.

The eventual goal is to have a qooxdoo tool chain that builds on a generic JS
layer, is as powerful and sophisticated as before, but allows easier
integration with and extension through third-party code, to make it easier for
users to customize the tool chain in their applications, and to allow us to
focus more on the qooxdoo-specific functionality and less on generic
infrastructure and commodity tasks.


Node.js and Grunt CLI
=====================

The Grunt tool chain requires a `Node.js <http://www.nodejs.org>`_ installation
(v0.10.0 or above) and the `Grunt CLI <http://gruntjs.com/getting-started>`_
(v0.4.2 or above). However, being a frontend to the Generator you need its
requirements (i.e. Python) installed too, of course.

As a %{qooxdoo} user you currently do not need any Node.js (or `npm
<https://npmjs.org/doc/cli/npm.html>`_ - which gets installed along with
Node.js) knowledge, it is merely a technology used internally for the tools.
However, in order to harness the possibilities of Node.js and Grunt (embodied
as `Grunt Plugins <http://gruntjs.com/plugins>`_), it makes totally sense to
get more familiar with Node.js, `npm packages <https://npmjs.org/>`_ and Grunt.
So you only need to know as much as you want to. :)


Installing and Setup
====================

TODO


Running Grunt
=============

TODO


Gruntify existing apps
======================

TODO
