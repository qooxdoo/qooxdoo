%{qooxdoo}-contrib
********************

*%{qooxdoo}-contrib* is %{qooxdoo}'s infrastructure for third-party code that is
useful for other users building %{qooxdoo} projects. A lot of those contributions take
the form of %{qooxdoo} libraries ranging from small helper classes to full-blown
and complex widgets and themes. But you may also find server-side
implementations for RPC's, translation files or simple auxiliary stuff. It is
community-provided content, and is also used as an incubator area for the
framework itself. Some contributions are actively maintained, others are rather
stale, so you may find there code of any stage of maturity (and consequently,
immaturity).

With %{qooxdoo} 3.0 a new contribution infrastructure was introduced. The old
contrib platform was *repository-based*, meaning that all contributions had to
be in a certain source repository on SourceForge to be recognized as
contributions. The new platform is *catalog-based*, meaning that it doesn't
require that the contribution is in any particular data store or version control
system.  The catalog includes links where each specific contribution can be
downloaded.

This page deals specifically with library-style contributions as they can be
included in app development.

.. _pages/development/contrib#library-style-contributions:

Library-style Contributions
============================

There are basically two aspects to contributions

* the *maintainer view*, meaning how to provide and maintain a particular
  contribution
* the *user view*, meaning how to use a particular contribution in application
  development

User View
------------

The user view is easy. Using %{qooxdoo} library-style contributions in a custom
application is directly supported by the Generator. You just have to edit your
``config.json`` configuration file.  You integrate a contribution by giving it
an entry in the :ref:`pages/tool/generator/generator_config_ref#library`
configuration key, preferably in the context of the :ref:`pages/tool/generator/generator_default_jobs#libraries` includer job. The value of
the corresponding *manifest* property for a contribution has to start with the
``contrib://`` URL pseudo-scheme, followed by the name of the contribution,
followed by the version you want to use, followed by the Manifest file name of
this library, resulting for example in something like
``contrib://UploadMgr/0.2/Manifest.json``.

With running a compile job (e.g. *source*, *build*) the Generator will now query the
catalog for that version of the contribution, evaluate the corresponding Json
file, and access the download value. The corresponding contribution will be
downloaded to the local disk and used as a library as usual.

When re-running the build job, the Generator will check if the contribution has
changed, and will re-load it if that is the case. 

Putting it all together here is an sample *config.json* snippet:

::

  "jobs" : {
    "libraries" : {
      "library" : [{
        "manifest": "contrib://UploadMgr/0.5/Manifest.json"
        }
      ]
    }
    ...
  }

(The wrapping in the predefined *libraries* includer job makes it easily
available to build jobs).

The remainder of this chapter now details the maintainer view, or how to provide
a contribution.


The Catalog - A Github Repo
=============================

The central piece of the contrib infrastructure is the catalog, it is like the
index of known contributions. To make maintenance of the catalog simple and
straight-forward, we decided to implement it as a Github repository. It will
have the same top-level directory structure you might know from the Sourceforge
%{qooxdoo}-contrib repo, namely

* the *contribution names* are top-level
* beneath each contribution there is a set of directories with *version names*,
  and potentially a general readme file.
* in each version directory is a *Manifest.json* file that applies to this particular
  version of the contribution

The Manifest.json file is exactly the Manifest file you know from qooxdoo
libraries. The intent is that you can copy it straight over from your project to
the catalog repo. You need to make sure, though, that all necessary fields in it
will be filled, particularly the *info/download* field. A Generator job,
:ref:`pages/tool/generator/default_jobs_actions#validate-manifest`, will help you
with that.

In practice that means that maintaining your contribution in the catalog will
require you to fork the `catalog repo`_, make suitable changes like adding
or updating the information about a contribution, and then issue a pull request.
(This obviously also means you will need a Github account to be a contribution
maintainer, but we hope this requirement to be trivial.) As soon as the
request is merged into the main repo, using your contribution from an
application's config.json will work.

.. _catalog repo: https://github.com/qooxdoo/contrib-catalog

Providing a Contribution
==========================

This was the general approach, now to the nitty-gritty.

Contributions come as Archives
--------------------------------

The actual contribution code, i.e. the code somebody would download and use,
needs to be provided through the Manifest's *info/download* URL. The value should be
a HTTP(S) URL to an archive (like zip or tar.gz) ready to be downloaded. 

The archive should contain a single root folder with arbitrary name, and beneath
that the contents of the contribution. I.e. for a standard qooxdoo library the
second level should contain its Manifest.json.

A Sha1 checksum must then be calculated over the archive file, and the result be
entered in the catalog's *Manifest.json/info/checksum* field (At this point the
catalog's and the contrib's Manifest.json necessarily deviate from each other).
This checksum is used to verify the downloaded archive later on the client side,
and also to check for updates of the contribution.

Here are the corresponding Manifest.json entries for some Github-hosted
contribution::

  "info" : {
    "download" : "https://github.com/myuid/mycontrib/archive/master.tar.gz",
    "checksum" : "e3241b1e1c44c3620b07972411a15cf3f05cfa4c"
    ...
  }

Supported Archive Formats
~~~~~~~~~~~~~~~~~~~~~~~~~~

The following archive formats are supported:

* .zip
* .tar
* .tar.gz
* .tar.bz2

Sourceforge-based Contributions
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

For the time being we will support an exception from the above. If the
contribution is still hosted at the old Sourceforge qooxdoo-contrib SVN
repository, the download URL need not end in an archive name, but in the standard
SVN URL for this contribution's version. (The current Sourceforge SVN interface
doesn't support archive downloads anymore). The Generator will then use the old
Web spidering to download the contribution to the client side. Here is an
example::

  "info" : {
    "download" : "http://svn.code.sf.net/p/qooxdoo-contrib/code/trunk/qooxdoo-contrib/SkeletonWidget/0.9/",
    ...
  }

The *checksum* for such a contribution is not used. Rather, the SVN revision
number from SourceForge will be used to detect updates.

Maintainer's Workflow
-----------------------

So the basic workflow for an author having a new revision of his contribution’s
version is: 

* Create an *archive* containing the contribution and put it *online*.
* Edit the contribution’s Manifest.json to contain the *download* location and a
  Sha1 *checksum* over the archive.  
* Copy this Manifest.json to the appropriate path in the *catalog* repo.  
* Send a *pull request* for the catalog.

For an author choosing Github to host his contribution all this can be quite
easily achieved (except for the checksum thing) by maintaining contribution
versions as Git *branches* and exploiting the archive downloads that Github
offers. You just use an URL like

::

  https://github.com/<user>/<contrib>/archive/<branch_name><archive_suffix> 
  
as the Manifest’s download URL, with e.g. *branch_name* being *master* and *suffix*
being *.zip*.


Future Work: Web Interface to the Catalog
============================================

We're planning to also have a web interface to the catalog that
might be a bit nicer than using Github's code browsing facility, maybe together
with searching and sorting capabilities.

