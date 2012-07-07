
.. _pages/project/release_how_to_build.rst#how_to_build_a_release:

How to build a release
**********************

.. _pages/project/release_how_to_build.rst#preparations:

Preparations
============

.. _pages/project/release_how_to_build.rst#general:

General
-------

* Write draft of the `release notes <http://qooxdoo.org/about/release_notes>`_ (look at the git commits since the last release)
* Inform mailing list
* Sync top-level ``readme.rst`` text file with `About <http://qooxdoo.org/about>`_
* Prepare article for `qooxdoo news <http://news.qooxdoo.org/>`_
* Prepare text for `<http://freshmeat.net>`_ (short; no marketing buzz)

.. _pages/project/release_how_to_build.rst#customize_the_code_base:

Customize the code base
-----------------------

* Fix critical `open bugs <http://bugzilla.qooxdoo.org/buglist.cgi?query_format=specific&order=relevance+desc&bug_status=__open__&product=&contentf=>`_
* Remove unstable code or code for future releases.
* ``generate.py fix`` in framework, each application and component (covered by this `bug <http://bugzilla.qooxdoo.org/show_bug.cgi?id=5428>`__).
* Copy the .po files from the `Translation <http://qooxdoo.org/contrib/project/translation>`_ contrib to their designated places; ``generate.py translation``, commit .po files. (covered by this `bug <http://bugzilla.qooxdoo.org/show_bug.cgi?id=5429>`__).
* Set ``tool/pylib/generator/runtime/Cache.py:CACHE_REVISION`` a unique value (e.g. a commit hash prefix); this ensures old caches of the users will be cleared.
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

Adjust version number
---------------------

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

If you are using your normal workspace, make at least sure to run a *distclean*.

.. code-block:: bash

    $ cd $qooxdoo
    $ make DO_RELEASE=1 -f tool/admin/release/Makefile.release distclean

.. _pages/project/release_how_to_build.rst#creating_demo_apps:

Creating demo apps
------------------

.. code-block:: bash

    $ cd $qooxdoo
    $ make DO_RELEASE=1 -f tool/admin/release/Makefile.release publish-build

The ``publish-build`` target will create the standard apps as is regularly done for the online demos. This is usually what you want for the application and component tests.

.. _pages/project/release_how_to_build.rst#creating_release_archives:

Creating release archives
-------------------------

.. code-block:: bash

    $ cd $qooxdoo
    $ make DO_RELEASE=1 -f tool/admin/release/Makefile.release release-sdk-sans-clean

This will create release kit(s) in the ``./release`` subdirectory.

The ``$qooxdoo`` root directory should be made available through a local web server so that testers can access both the applications and the archives.

.. _pages/project/release_how_to_build.rst#test:

Test
====

Release test plans:

#. `Application testing <https://github.com/qooxdoo/qooxdoo/tree/master/tool/admin/release/release-test-matrix-applications.html>`_ : test standard applications (like Feedreader, Apiviewer, ...) in various browsers
#. `create-application.py/Platform testing <https://github.com/qooxdoo/qooxdoo/tree/master/tool/admin/release/release-test-matrix-create_application.html>`_ : test ``create-application.py`` on various platforms

Both the standard apps for 1. as well as an SDK for 2. are usually made available from a build host. For instructions on what to do *there*, in order to proivde them, see further.


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
* *(Optional)* You can upload a ``*readme*`` file into the same folder which will be displayed automatically when the page is rendered. It doesn't matter if the file name is upper or lower case, and what the extension is as long as it contains the string "readme". SF supports various `markup formats <https://sourceforge.net/p/forge/documentation/Files-Readme/>`_, among them *.rst* (but no HTML, and no binaries like PDF), so we can reuse our manual know-how here.

.. _pages/project/release_how_to_build.rst#put_the_demos_online:

Put the Demos online
====================

Once the final build has been made, you can put the demos created in the above step online at *demo.qooxdoo.org/<version>*, using

.. code-block:: bash

    $ cd $qooxdoo
    $ make DO_RELEASE=1 -f tool/admin/release/Makefile.release publish

This will create the appropriate *version* subdirectory on the *demo* web server, and copy all demos underneath it, together with an *index.html* in a suitable form.


.. _pages/project/release_how_to_build.rst#publish_the_qx-oo_package_with_npm:

Publish qx-oo at NPM
==================================

As soon as you have built and tested the npm package, run ``npm publish`` to upload the version. Here are the steps to achieve all that:

* Make sure `node <http://nodejs.org>`_ and `npm <npmjs.org>`_ is installed (tested to work with 0.6.4/1.1.13).
* Change to ``component/standalone/server``.
* Make sure the ``qx-oo.js`` has been built (in /script).
* Run ``generate.py npm-package-copy``.
* Run ``generate.py npm-package-publish`` (needs the qooxdoo user account).
* Check if it worked in the `online registry <http://search.npmjs.org/>`_.
* More details can be found in the `npm documentation <https://github.com/isaacs/npm/blob/master/doc/developers.md>`_.


.. _pages/project/release_how_to_build.rst#release_it_at_maven_central:

Publish SDK at Maven Central
============================

The final build should also be put at Maven Central. To release the new version of the SDK you should follow the instructions of our `maven-central-integration project <https://github.com/qooxdoo/maven-central-integration>`_ at GitHub and the instructions on the internal server (look for the project's git checkout in the workspace). It is necessary to release it using the internal server infrastructure to make sure the artifacts are correctly signed.

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
  * For a release of the current devel version, make a deep copy of the new version with the next devel target (e.g. with ``cp -R --preserve 1.6 1.7``), and link the ``devel`` symbolic link to it (so the next devel update doesn't overwrite the released version).
* **/manual**
  
  * Adjust the appropriate ``<major>.<minor>.x`` and ``current`` symbolic links to link to the new version.
  * For a release of the current devel version, make a deep copy of the new version with the next devel target (e.g. with ``cp -R --preserve 1.6 1.7``), and link the ``devel`` symbolic link to it (so the next devel update doesn't overwrite the released version).
* **/wiki**
  
  * Adjust ``wiki/inc/html.php#html_search``, which will add the new version to the drop-down menu on the search web page (in the .php file look for the string ``'Homepage only'``).

.. _pages/project/release_how_to_build.rst#update_wiki:

Update Wiki
-----------

* Adjust the `Roadmap <http://qooxdoo.org/about/roadmap>`_.
* Adjust the `Documentation overview <http://qooxdoo.org/documentation>`_.
* Adjust the `Demo overview <http://qooxdoo.org/demo>`_.
* Adjust the `Download page <http://qooxdoo.org/download>`_.

.. _pages/project/release_how_to_build.rst#update_contrib:

Update Contrib
--------------

(*workspace on internal server*)

* Adjust the symlinks in qooxdoo.contrib/trunk/qooxdoo.
* Update the *qxPatchReleases* map in ``tool/admin/bin/repository.py`` (near the top of the file).
* Simulator contrib: Add a tag corresponding to the qx patch release.

.. _pages/project/release_how_to_build.rst#nightly_testing:

Nightly Testing
--------------- 

* Contribution skeleton test: Create a symlink to the qx git repo as expected by the demo's config.json ("../../../../qooxdoo/${QXVERSION}")
* Branch application tests: Create a remote tracking branch for the maintenance branch and update the test config accordingly

.. _pages/project/release_how_to_build.rst#announcements:

Announcements
-------------

* `Release notes <http://qooxdoo.org/about/release_notes>`_ on the homepage
* `News <http://news.qooxdoo.org/wp-admin/post.php>`_
* Mailing list (qooxdoo-devel)
* `Freshmeat <http://freshmeat.net/add-release/53996/>`_
* `Wikipedia <http://en.wikipedia.org/wiki/Qooxdoo>`_ version number update
* `Email to FunctionSource?! <tips@functionsource.com>`_


