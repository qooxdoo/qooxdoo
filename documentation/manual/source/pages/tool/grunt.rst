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

`Grunt`_ is a task runner or build tool (comparable for example with Make,
Apache Maven, Apache Ant, Rake etc.). It enables you to configure tasks which
then automate common working steps for you like e.g. building, linting, testing
or deploying your project. It's probably the most popular build tool in the
`Node.js <http://www.nodejs.org>`_ environment right now.

Tasks are configured in a JavaScript file called `Gruntfile.js`_ which makes
it really easy to get started (everybody working with qooxdoo should be familiar
with JS - right?!) and enables all possibilities of JS itself (dynamic creation of
configuration, use of variables and so on).

Why?
====

The aim is to make existing functionality available through the Grunt frontend,
and see which parts of the tool chain can be replaced by Grunt plugins, be they
from the npm registry or self-written. For everything else the existing
Python-based tool chain will be utilized. The old build system stays untouched
for the time being, so you don't have to worry.

The eventual goal is to have a qooxdoo tool chain that builds on a generic JS
layer, is as powerful and sophisticated as before, but allows easier
integration with and extension through third-party code, to make it easier for
users to customize the tool chain in their applications, and to allow us to
focus more on the qooxdoo-specific functionality and less on generic
infrastructure and commodity tasks.


Installing Node.js and the Grunt CLI
====================================

The Grunt frontend requires a `Node.js`_ installation (v0.10.0 or above) and
the `Grunt CLI <http://gruntjs.com/getting-started>`_ (v0.4.2 or above).
However, being a frontend to the Generator you need its requirements (i.e.
Python) installed too, of course.

As a %{qooxdoo} user you currently do not need any Node.js (or `npm
<https://npmjs.org/doc/cli/npm.html>`_ - which gets installed along with
Node.js) knowledge, it is merely a technology used internally for the tools.
However, in order to harness the possibilities of Node.js and Grunt (embodied
as `Grunt Plugins <http://gruntjs.com/plugins>`_), it makes total sense to
get more familiar with Node.js, `npm packages <https://npmjs.org/>`_ and Grunt.
So you only need to know as much as you want to. :)


Verifying Grunt works
=====================

Running ``grunt --version`` in a random directory should print:

.. code-block:: bash

   $ grunt --version
   grunt-cli v0.1.11

In a directory containing a ``Gruntfile.js`` it should also print the Grunt version:

.. code-block:: bash

   $ grunt --version
   grunt-cli v0.1.11
   grunt v0.4.2

Learn what's the `difference between the grunt-cli and grunt itself
<http://gruntjs.com/getting-started>`_.


Setup the qooxdoo Grunt toolchain
=================================

The toolchain itself needs a setup where all required npm packages are installed
and the qooxdoo packages are wired together. You have to run:

.. code-block:: bash

   $ npm install
   $ grunt setup

.. note::
  For Windows Users: You need a cmd prompt run as administrator when executing
  'grunt setup' because the setup will create symlinks (i.e. symbolic links)!


Using the Generator through Grunt
=================================

Every job (i.e. *source*, *build* ...) you know from the Generator can also be
run through the Grunt frontend (in Grunt lingo those are called **tasks**
then) via ``grunt generate:{oldJobName}``. This ensures that you are still able to use
all the Generator functionality already available.

See also the FAQ below for important differences between Grunt
and the Generator.


Grunt Plugins
=============

Nearly all functionality Grunt offers is implemented as plugin. `Grunt
Plugins`_ are basically regular npm packages with the keyword ``gruntplugin``,
which are distributed via `npmjs.org <https://npmjs.org/>`_. A common
convention is to prefix them with ``"grunt-"``.

Use them to accomplish custom goals or even `write your own ones
<http://gruntjs.com/creating-tasks>`_.


The Gruntfile in detail
=======================

This is how a Gruntfile might look like after creating a new qooxdoo app:

.. code-block:: javascript

    // requires
    var util = require('util');
    var qx = require("${REL_QOOXDOO_PATH}/tool/grunt");

    // grunt
    module.exports = function(grunt) {
      var config = {

        generator_config: {
          let: {
          }
        },

        common: {
          "APPLICATION" : "${Namespace}",
          "QOOXDOO_PATH" : "${REL_QOOXDOO_PATH}",
          "LOCALES": ["en"],
          "QXTHEME": "${Namespace}.theme.Theme"
        }

        /*
        myTask: {
          options: {},
          myTarget: {
            options: {}
          }
        }
        */
      };

      var mergedConf = qx.config.mergeConfig(config);
      // console.log(util.inspect(mergedConf, false, null));
      grunt.initConfig(mergedConf);

      qx.task.registerTasks(grunt);

      // grunt.loadNpmTasks('grunt-my-plugin');
    };

The only parts specific to qooxdoo are:

  #. merging your config with qooxdoo's
  #. registering qooxdoo tasks

This will register a task for each Generator job (under the same name). The
tasks may be written in Python (from the Generator) or in JavaScript. After
``qxTasks.registerTasks()`` you are free to include the Grunt plugins
you like to use (custom or 3rd party).


Gruntify existing apps
======================

Basically you don't need very much to make your existing project
Grunt compatible. You need:

  * Node.js and the Grunt-CLI installed as stated above.
  * a current version of the SDK, which means qooxdoo 3.5 or above.
  * a Gruntfile (file called ``Gruntfile.js``)
  * a file called ``package.json``

In order to get the last two files and Grunt (locally) installed:

  #. Create a new app of the same type as your existing app (via
     :ref:`create-application.py
     <pages/getting_started/helloworld#create_your_application>`)
     and then copy those two files over to your project's root dir.
  #. Run ``npm install`` in your project's root dir which installs Grunt locally
     to your project (this will create a dir called ``node_modules``).

Now try ``grunt info`` - it should run ``generate.py info``.


FAQ
===

Which tasks are available?
    Run ``grunt --help`` to see all registered tasks.

Will Grunt also register my newly added (and exported!) jobs from my config.json?
    Yes it should, otherwise it's a bug.

How do I provide Generator options like ``-v``?
    You have to use ``--gargs``. For example ``generate.py lint -v``
    translates to ``grunt lint --gargs="-v"``
