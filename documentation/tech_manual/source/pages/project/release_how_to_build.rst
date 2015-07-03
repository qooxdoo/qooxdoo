.. _pages/project/release_how_to_build.rst#how_to_build_a_release:

How to build a release
**********************

.. _pages/project/release_how_to_build.rst#preparations:

Preparations
============

.. _pages/project/release_how_to_build.rst#general:

General
-------

* Write draft of the `release notes <http://qooxdoo.org/project/release_notes>`_ (look at the git commits since the last release)
* Inform mailing list
* Sync top-level ``readme.rst`` text file with `About <http://qooxdoo.org/about>`_
* Prepare article for `qooxdoo news <http://news.qooxdoo.org/>`_

.. _pages/project/release_how_to_build.rst#customize_the_code_base:

Customize the code base
-----------------------

* Fix critical `open bugs <http://bugzilla.qooxdoo.org/buglist.cgi?query_format=specific&order=relevance+desc&bug_status=__open__&product=&contentf=>`_
* Remove unstable code or code for future releases.
* ``generate.py fix`` in framework, each application and component. This could be done with the release makefile and the ``fix`` job.
* Copy the .po files from the `Translation <http://qooxdoo.org/contrib/project/translation>`_ contrib to their designated places; ``generate.py translation``, commit .po files. (covered by this `bug <http://bugzilla.qooxdoo.org/show_bug.cgi?id=5429>`__).
* Set ``tool/pylib/generator/runtime/Cache.py:CACHE_REVISION`` to a unique value (e.g. a commit hash prefix); this ensures old caches of the users will be cleared.
* Set ``tool/grunt/lib/qx/tool/Cache.js:CACHE_REVISION`` to a unique value (e.g. a commit hash prefix); this ensures old caches of the users will be cleared.
* Run ``generate.py api-verify`` in framework, and fix problematic links.
* Run ``make linkcheck`` in the manual (documentation/manual), and fix problematic links where necessary.

.. _pages/project/release_how_to_build.rst#migration_data:

Migration data
--------------
* Migration data folder:

  * Change directory to ``tool/data/migration/``.
  * Create a new directory **major.minor.revision**.
  * Grep for deprecation tags in framework code.
  * Extract API changes from git diff against the previous release.
  * Add migration files and commit these to git (or the empty folder if there are no files needed).

* Code-change  ``tool/bin/migrator.py``:

  * Complete ``MIGRATION_ORDER`` with the newly created directories. (NB: This means to have the *new release version* in this list).
  * Change ``default_old_version`` to a previous (!) release number. Maybe that could be the latest version of the previous stable branch?

* (Testing of migration and migration data is covered by the release platform testing, see further).

.. _pages/project/release_how_to_build.rst#migrate_applications_and_components:

Migrate applications and components
-----------------------------------

In each of the standard applications/components that need it, run
::

    generate.py migration

Do not run the migration if it is not necessary, as running it on already migrated code can screw things up.

.. _pages/project/release_how_to_build.rst#adjust_version_number:

Adjust copyright header and version number
------------------------------------------

Edit the year of the copyright header

.. code-block:: bash

    $ tool/data/generator/copyright.include.js

Change relevant version strings by running the ``bumpqxversion.py`` script that does that. In the root directory, run

.. code-block:: bash

    $ ./tool/admin/bin/bumpqxversion.py <new-version-string>

But check the results before committing :-) . You can run the script multiple times with the same argument without causing any harm.

.. note::

    Don't try to do this by hand, as meanwhile the script does a bit more than just replacing simple version strings. If you're desperate to look at the file list that is being modified, see the *Customize section* in the script itself. If you squint a bit you can find out for each file entry which file locations it is trying to modify.


.. _pages/project/release_how_to_build.rst#update_bugzilla:

Update Bugzilla
---------------

*(bugzilla.qooxdoo.org)*

For the product *framework*:

* Add the new release version to `versions <http://bugzilla.qooxdoo.org/editversions.cgi?product=framework>`_.
* Add next possible release version(s) to `milestones <http://bugzilla.qooxdoo.org/editmilestones.cgi?product=framework>`_.

.. _pages/project/release_how_to_build.rst#build_release_kits:

Build Release Kits
==================

.. _pages/project/release_how_to_build.rst#create_a_clean_checkout:

Create a clean checkout
-----------------------

Idealy, use a fresh directory for a checkout, not your normal workspace. This assures you are not dealing with any cruft or artefacts in your workspace during the release process.

.. code-block:: bash

    $ git clone git://github.com/qooxdoo/qooxdoo.git
    # or
    $ git clean -d -x -f


If you are using your normal workspace, make at least sure to run a *distclean*.

.. code-block:: bash

    $ cd $qooxdoo
    $ make DO_RELEASE=1 -f tool/admin/release/Makefile.release distclean

.. _pages/project/release_how_to_build.rst#creating_demo_apps:

Creating demo apps
------------------

.. code-block:: bash

    $ make DO_RELEASE=1 -f tool/admin/release/Makefile.release publish-build

The ``publish-build`` target will create the standard apps as is regularly done for the online demos. This is usually what you want for the application and component tests.

.. _pages/project/release_how_to_build.rst#creating_release_archives:

Creating release archives
-------------------------

.. code-block:: bash

    $ make DO_RELEASE=1 -f tool/admin/release/Makefile.release release-sdk-sans-clean

This will create release kit(s) in the ``./release`` subdirectory.

The ``$qooxdoo`` root directory should be made available through a local web server so that testers can access both the applications and the archives.

.. _pages/project/release_how_to_build.rst#pre_publish_demos:

Pre-publish demos
------------------

Do a ``publish`` of the demos before testing starts. This assures that all links are working which are exercised during release testing. This includes links to the manual, Demobrowser and Playground, but also library links like ``q.min.js`` that are used in CodePen examples.

.. code-block:: bash

    $ make DO_RELEASE=1 -f tool/admin/release/Makefile.release publish

This means that the new version of the demos and manual will be online on our production machine, but the ``current`` link is not updated yet, and the version is not yet announced so there is little issue for confusion for the users.

.. _pages/project/release_how_to_build.rst#test:

Test
====

Release test plans:

#. `Application testing <https://github.com/qooxdoo/qooxdoo/blob/master/tool/admin/release/test_plans/applications.html>`_ : test standard applications (like Feedreader, Apiviewer, ...) in various browsers
#. `create-application.py / Toolchain testing <https://github.com/qooxdoo/qooxdoo/blob/master/tool/admin/release/test_plans/tool_chain.html>`_ : test ``create-application.py`` on various platforms
#. `Libraries testing <https://github.com/qooxdoo/qooxdoo/blob/master/tool/admin/release/test_plans/libraries.html>`_ : test stand-alone libraries (from *component/standalone*)
#. `Mobile application testing <https://github.com/qooxdoo/qooxdoo/blob/master/tool/admin/release/test_plans/mobile_apps.html>`_ : test mobile applications (MobileShowcase, Feedreader Mobile, ...) on iOS, Android, etc.

All test objects (applications, libraries, SDK) are usually made available from a build host (when doing the `Build Release Kits`_ step above), so testers don't have to build  test objects on their local machines.


.. _pages/project/release_how_to_build.rst#create_a_sourceforge_release:

Publish SDK at Sourceforge
============================

Release files are published to Sourceforge through their `File Manager <https://sourceforge.net/projects/qooxdoo/files/>`__ interface (`doc <https://sourceforge.net/apps/trac/sourceforge/wiki/Release%20files%20for%20download>`__).

.. _pages/project/release_how_to_build.rst#upload_files:

Upload files
------------

Use the controls on the File Manager view.

* Create a suitable sub-folder for the release. E.g. for a new stable release from master, create a sub-folder in the ``qooxdoo-current`` folder. Releases of a legacy branch of qooxdoo go into ``qooxdoo-legacy``, pre-finals (alpha, beta, ...) go into ``qooxdoo-test``
* Change to the new sub-folder and click ``Add File``.
* An upload dialog will lead you to uploading a release archive into the folder.
* *(Optional)* Make this file the default download:

  * By default, the latest uploaded file will be in the prominent (green) "Download" button shown on the `SF project home page <http://sourceforge.net/projects/qooxdoo/>`_.
  * If this is not the file you want, go again to the File Manager, select the desired file, and click on the ``i`` icon (tooltip "View details") to the right of it.
  * In the drop-down dialog, locate the ``Default Download For:`` section, and click ``Select all``. This will make this file the default download for all client platforms (as SF tries client OS detection).
  * Hit the ``Save`` button before leaving the form.
* Upload a ``readme.rst`` file into the same folder with the release version and the essential links (usually project/about, release notes and manual; see older releases). This will be displayed automatically when the page is rendered. (This feature is such that any file containing the string "readme" in its name (case-insensitive) will be used in this way. Sourceforge supports various `markup formats <https://sourceforge.net/p/forge/documentation/Files-Readme/>`_, among them *.rst* (but no HTML, and no binaries like PDF), so we can reuse our reST know-how here).


.. _pages/project/release_how_to_build.rst#publish_at_github:

Publish the SDK at Github
=============================

Currently, we also publish the SDK with Github. This should actually be done
after the `Tagging`_ (see further), as you want to have the git tag available to
refer to it.

* Go to Github's `release management
  <https://github.com/qooxdoo/qooxdoo/releases>`_. You need to be logged in to
  your Github account, with admin priviledges for this task. You should see the
  new release in the list with no description and only the .zip and .tar.gz
  source download links.
* Hit the ''Draft a new release'' button.
* In the *Tag version* text field enter the tag name (e.g. *"release_3_0_1"*).
* Enter the *Release title* (e.g. *"qooxdoo 3.0.1 release"*).
* In the *Describe this release* text area, reuse the release notes from
  Sourceforge (just converted to markdown), like:

  ::

    * Released: *20XX-XX-XX*
    * [Overview](http://manual.qooxdoo.org/3.0.1/pages/introduction/about.html)
    * [Release notes] (http://qooxdoo.org/project/release_notes/3.0.1)
    * [Manual] (http://manual.qooxdoo.org/3.0.1/)

* From a file explorer, drop the release SDK onto the *Attach binaries* zone.
* Hit the *Publish release* button.


.. _pages/project/release_how_to_build.rst#put_the_demos_online:

Put the Demos online
====================

Once the final build has been made, you can put the demos created in the above step online at *demo.qooxdoo.org/<version>*, using

.. code-block:: bash

    $ make DO_RELEASE=1 -f tool/admin/release/Makefile.release publish

This will create the appropriate *version* subdirectory on the *demo* web server, and copy all demos underneath it, together with an *index.html* in a suitable form.


.. _pages/project/release_how_to_build.rst#publish_the_qx-oo_package_with_npm:

Publish qx-oo at NPM
====================

As soon as you have built and tested the npm package, run ``npm publish`` to upload the version. Here are the steps to achieve all that:

* Make sure `Node.js <http://nodejs.org>`_ and `npm <npmjs.org>`_ is installed (tested to work with 0.6.4/1.1.13).
* Change to ``component/standalone/server``.
* Make sure the ``qx-oo.js`` has been built (in /script).
* Run ``generate.py npm-package-copy``.
* Run ``generate.py npm-package-publish`` (needs the qooxdoo user account).
* Check if it worked in the `online registry <http://npmjs.org/>`_.
* More details can be found in the `npm documentation <https://npmjs.org/doc/misc/npm-developers.html>`_.


.. _pages/project/release_how_to_build.rst#release_it_at_maven_central:

Publish SDK at Maven Central
============================

The final build should also be put at Maven Central. To release the new version
of the SDK you should follow the instructions of our `maven-central-integration
project <https://github.com/qooxdoo/maven-central-integration>`_ at GitHub and
the instructions on the internal server (look for the project's git checkout in
the workspace). It is necessary to release it using the internal server
infrastructure to make sure the artifacts are correctly signed.

.. _pages/project/release_how_to_build.rst#publish_qx_website_at_cdnjs:

Publish qx.Website at cdnjs
===========================

The minified and non minified version of qx.Website are on a CDN called `cdnjs <http://cdnjs.com/>`_. To update to a newer version, check out the documentation on the `github page <https://github.com/cdnjs/cdnjs>`_ on their repository.

The gist of it is:

* Clone `qooxdoo/cdnjs <https://github.com/qooxdoo/cdnjs>`_.
* Fetch from `cdnjs/cdnjs <https://github.com/cdnjs/cdnjs>`_, to have an up-to-date repo.
* Make changes to ``ajax/libs/qooxdoo``:

  * Add necessary version folder.
  * Add the ``q`` library, both minified and unminified, **without** version string
    in the name, to the version folder.
  * Update ``package.json``.
  * Create a single commit for all these changes (might involve squashing).
  * (opt.) Run ``npm test``.

* Push to *qooxdoo/cdnjs*.
* In the web GUI, create a **pull request** to *cdnjs/cdnjs*:

  * Use the single commit.
  * Use "Source taken from http://qooxdoo.org/download" as the pull description.
  * If you want to change two versions at the same time, it might be necessary
    that you create a branch for one, so you can create a pull request for each
    (Unclear if this is actually necessary).


.. _pages/project/release_how_to_build.rst#post_processing:

Post processing
===============

.. _pages/project/release_how_to_build.rst#tagging:

Tagging
-------

The final revision that is shipped has to be tagged in git. Suppose the release you publish is ``1.6`` and the revision hash of that release is ``asdf1234``. Then you could tag this release in git like so:

.. code-block:: bash

    $ git tag -am"1.6" release_1_6 asdf1234
    $ git push --tags

(The sparse comment with -m is due to its display in the "Tags" listing on Github).

.. _pages/project/release_how_to_build.rst#git_branching:

Git branching
-------------

Create a branch when expecting master to become the next major version.

.. code-block:: bash

    $ git checkout -b branch_1_6_x  # create branch from HEAD
    $ git push origin branch_1_6_x  # push branch to origin

After that, developers will receive the new branch with their next pull of the repository. They then need to set up a local tracking branch:

.. code-block:: bash

    $ git checkout --track -b branch_1_6_x origin/branch_1_6_x

.. _pages/project/release_how_to_build.rst#adjust_version_number1:

Adjust version number
---------------------

Adjust the qooxdoo version of master and branch to their respective next version, as described :ref:`earlier <pages/project/release_how_to_build.rst#adjust_version_number>`.

.. _pages/project/release_how_to_build.rst#update_online_site:

Update Online Site
------------------

(*demo.qooxdoo.org*)

* **/demo**

  * Adjust the appropriate ``<major>.<minor>.x`` and ``current`` symbolic links to link to the new version.
  * For a release of the current devel version, make a deep copy of the new version with the next devel target
    (e.g. with ``cp -R --preserve 4.0 4.1``), and link the ``devel`` symbolic link to it (so the next devel update doesn't overwrite the released version).

This means:

.. code-block:: bash

    $ cp -R --preserve <major>.<minor> <major>.<minor>   # 4.0 4.1
    $ rm current && ln -s <major>.<minor> current
    $ rm devel && ln -s <major>.<minor> devel
    $ rm <major>.<minor>.x && ln -s <major>.<minor>.x  <major>.<minor>

* **/manual**

    Same as for /demo.


.. _pages/project/release_how_to_build.rst#update_wiki:

Update Wiki
-----------

* Adjust the `Roadmap <http://qooxdoo.org/project/roadmap>`_.
* Adjust the `Documentation overview <http://qooxdoo.org/docs>`_.
* Adjust the `Demo overview <http://qooxdoo.org/demos>`_.
* Adjust the `Demo listing <http://qooxdoo.org/demos/all>`_.
* Adjust the `Download page <http://qooxdoo.org/downloads>`_.
* Adjust the `qx.Website Download page <http://qooxdoo.org/downloads/qx.website>`_.
* Adjust the `Start page <http://qooxdoo.org/>`_. (all 4 sections: download links)


.. _pages/project/release_how_to_build.rst#nightly_testing:

Nightly Testing
---------------

* Branch application tests: Update the maintenance branch name in the ``qooxdoo-git-update-patch`` job's Source Code Management and Execute Shell sections

.. _pages/project/release_how_to_build.rst#announcements:

Announcements
-------------

* `Release notes <http://qooxdoo.org/project/release_notes>`_ on the homepage
* `News <http://news.qooxdoo.org/wp-admin/post.php>`_
* Mailing list (qooxdoo-devel)
* `Freshmeat/Freecode <http://freecode.com/projects/qooxdoo>`_
* `Wikipedia <http://en.wikipedia.org/wiki/Qooxdoo>`_ version number update
* twitter / Facebook



