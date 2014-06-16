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

Where to find what?
===================

This page deals with **how to use contributions** as well as what to bear in mind
when **writing your own contributions**. If you are interested in **what contributions
are available** check out the `catalog website <http://qooxdoo.org/contrib/catalog>`__,
which makes finding a suitable contrib much easier.


More Context
------------

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

* the *user view*, meaning how to use a particular contribution in application
  development
* the *maintainer view*, meaning how to provide and maintain a particular
  contribution

.. _pages/tool/generator/generator_config_articles#contrib_libraries:

User View
------------

Contributions can be included in a configuration like any other libraries: You
add an appropriate entry in the ``library`` array of your configuration. Like
other libraries, the contribution must provide a :ref:`Manifest.json
<pages/application_structure/manifest#manifest.json>` file with appropriate
contents.

If the contribution resides on your local file system, there is actually no
difference to any other library. Specify the relative path to its Manifest file
and you're basically set.

The really new part comes when the contribution resides online, and needs to be
downloaded to be used. This is directly supported by the Generator.  With
running a compile job (e.g. *source*, *build*) the Generator will now query the
catalog for that version of the contribution, evaluate the corresponding Json
file, and access the download value. The corresponding contribution will be
downloaded to the local disk and used as a library as usual.

In such a case you use a special syntax to specify the location a catalog
Manifest file that pertains to the contrib's particular version. It is URL-like
with a ``contrib`` scheme and will usually look like this:

::

    contrib://<ContributionName>/<Version>/<ManifestFile>

The contribution source tree will then be downloaded from the repository, the
generator will adjust to the local path, and the contribution is then used just
like a local library. The local path where the contribution is placed is a
subdirectory of the :ref:`cache/downloads <pages/tool/generator/generator_config_ref#cache>`
config key, which you can adapt.

When re-running the build job, the Generator will check if the contribution has
changed, and will re-download it if that is the case.

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

Mind that this is **not** the Manifest file that is part of the library, but the
catalog entry. Though they can be almost identical, the catalog Manifest will
only be searched for the *info/download* key, and a few others related to downloading
the contribution. The Manifest in the actual contribution library is then
searched for e.g the *provides/class* key, to find the class path in the
library.


contrib:// URIs and Internet Access
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

As contrib libraries are downloaded from an online location you need Internet
access to use them. Here are some tips on how to address offline usage and
Internet proxies.


Avoiding Online Access
++++++++++++++++++++++

If you need to work with a contrib offline, it is best to download it to your
hard disk, and then use it like any local qooxdoo library. The simplest way to
do this to download it using its *contrib://* URL once, then move the entire
contribution from the download cache (use *generate.py info* to locate this) to
some other path, and then adjust your *config.json* to match the new local path
on disk. Moving it away from the download cache is so that it is not deleted
when you run *generate.py distclean*.

Alternatively, you can download the archive directly. To find its download URL
you go to the catalog repo, locate the catalog Manifest for the contrib's
version, and pick the *info/download* URL from it. Then download and unpack the
archive on your local disk, and adjust the *config.json* to reflect its path.

In any case you are now using the contribution like a local library.  The only
thing you are missing this way is the automatic online check for updates, where
a newer version of the contrib would be detected and downloaded.  You need to do
this by hand, re-checking when you can, and re-downloading a newer version if
there is one.


Accessing Online from behind a Proxy
++++++++++++++++++++++++++++++++++++

If you are sitting behind a proxy, here is what you can do. The generator uses
the *urllib* module of Python to access web-based resources. This module honors
proxies:

* It checks for a *http_proxy* environment variable in the shell running the
  generator. On Bash-like shells you can set it like this::

    http_proxy="http://www.someproxy.com:3128"; export http_proxy

* If there is no such shell setting on Windows, the registry is queried for the
  Internet Options.
* On MacOS, the Internet Config is queried in this case.
* See the `module documentation
  <http://docs.python.org/2/library/urllib.html>`__ for more
  details.

The remainder of this chapter now details the maintainer view, or how to provide
a contribution.


The Catalog - A Github Repo
=============================

The central piece of the contrib infrastructure is the catalog, it is like the
index of known contributions. To make maintenance of the catalog simple and
straight-forward, we decided to implement it as a Github repository. It will
basically have the same directory structure you might know from the Sourceforge
%{qooxdoo}-contrib repo. Under a root path,

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

A SHA-1 checksum must then be calculated over the archive file, and the result be
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

The following archive formats/extensions are supported:

* .zip
* .tar
* .tar.gz
* .tgz
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

Further manual keys
-------------------

We added a *info/category* field to the Manifest file which allows you
to label your contrib with one or more of these supported categories:

* theme
* widget
* drawing
* tool
* backend
* utility

We will use this information to categorize the contribs in a future
web interface. If you provide more than one category, the first one
will be regarded as primary category.

So an example would be::

  "info" : {
    "category" : ["theme"],
    ...
  }


Maintainer's Workflow
-----------------------

So the basic workflow for an author having a new revision of his contribution's
version is:

* Create an *archive* containing the contribution and put it *online*.
* Edit the contribution's Manifest.json to contain the *download* location and a
  SHA-1 *checksum* over the archive.
* Copy this Manifest.json to the appropriate path in the *catalog* repo.
* Send a *pull request* for the catalog.

For an author choosing Github to host his contribution all this can be quite
easily achieved (except for the checksum thing) by maintaining contribution
versions as Git *branches* and exploiting the archive downloads that Github
offers. You just use an URL like

::

  https://github.com/<user>/<contrib>/archive/<branch_name><archive_suffix>

as the Manifest's download URL, with e.g. *branch_name* being *master* and *suffix*
being *.zip*.


Pull Request Maintenance
========================

This list should ease validating pull requests:

* Check pull request manually - is something obvious missing?
* Review the changes on your machine in a *contrib-catalog* clone:

  * `Merge it locally <https://help.github.com/articles/merging-a-pull-request>`__ e.g. by
    ``curl https://github.com/qooxdoo/contrib-catalog/pull/{n}.patch | git am``
  * Validate the Manifest: ``./generate.py validate-manifest ../path/to/catalog/Manifest.json``
  * Is an (optional) archive download (e.g. *\*.zip/\*.tar.gz*) provided? Then a
    valid SHA1 checksum has to be provided too or the contrib can't be used.
  * The SHA1 checksum can be checked like this:

    * ``curl -LO https://github.com/{user}/{contrib}/archive/master.(zip|tar.gz)``

    * ``shasum master.(zip|tar.gz)`` XOR ``openssl dgst -sha1 master.(zip|tar.gz)``

  * You can also try out the catalog changes locally (not always needed):

    * Adapt the *CONTRIB_CATALOG_BASEURL* setting of the *base.json* within your
      qooxdoo clone to let it point to your own contrib-catalog repo and
      then create a new app which uses the new contrib -
      is the contrib downloaded correctly?

* If everything is okay use the *"Merge pull request"* button from GitHub.

If there are merge conflicts or something is wrong/missing just point out the
issues and ask the author of the pull request for improvement. If the pull
request was created `like GitHub recommends it
<https://help.github.com/articles/using-pull-requests>`__ there is no need for
another pull request:

  "After your pull request is sent, any new commits pushed to your branch will
  automatically be added to the pull request. This is especially useful if you
  need to make more changes."
