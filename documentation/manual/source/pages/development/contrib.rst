:orphan:

%{qooxdoo}-contrib
********************

%{qooxdoo}-contrib is %{qooxdoo}'s infrastructure for third-party code that is
useful for other users building %{qooxdoo} projects. A lot of those contributions take
the form of %{qooxdoo} libraries ranging from small helper classes to full-blown
and complex widgets and themes. But you may also find server-side
implementations for RPC's, translation files or simple auxiliary stuff. It is
community-provided content, and is also used as an incubator area for the
framework itself. Some contributions are actively maintained, others are rather
stale, so you may find there code of any stage of maturity (and consequently,
immaturity).

Using %{qooxdoo} library-style contributions in a custom application is
supported by the Generator, via the
:ref:`pages/tool/generator/generator_config_ref#library` configuration keyword
that allows referencing a particular contribution in a particular version. The
code would then be downloaded by the Generator in the background, and kept
up-to-date with further enhancements of the contribution.

The old contrib platform was *repository-based*, meaning that all contributions
had to be in a certain source repository on SourceForge to be recognized as
contributions. There was also a dedicated page in the %{qooxdoo} homepage that
listed the available contributions and provided further links to documentation
etc. Maintaining a contribution basically meant getting a SourceForge account,
checking out the %{qooxdoo}-contrib repository, adding or updating a particular
contribution, and commiting to SourceForge again. The contribution web page was
maintained manually and independently.

The new platform is *catalog-based*, meaning that it doesn't require that the
contribution is in any particular data store or version control system.
Contributers just need to update the information in the catalog which includes a
link where the specific contribution can be downloaded. The remainder of this
chapter describes the new platform.

The Catalog - A Github Repo
=============================

The central piece of the contrib infrastructure is the catalog, it is like the
index of known contributions. To make maintenance of the catalog simple and
straight-forward, we decided to implement it as a Github repository. It will
have the same top-level directory structure you might know from the Sourceforge
%{qooxdoo}-contrib repo, namely

* the contribution names are top-level
* beneath each contribution there is a set of directories with version names
* in each version directory is a Manifest.json file that describes this particular
  version of the contribution

The Manifest.json file is exactly the Manifest file you know from qooxdoo
libraries. The intent is that you can copy it straight over from your project to
the catalog repo. You need to make sure, though, that all necessary fields in it will be
filled, particularly the *info/download* field. A Generator job
\:ref:`validate-manifest <pages/tool/generator/default_jobs_actions#validate-manifest>` will help
you with that.

In practice that means that if you want to maintain a contribution, you need a Github
account, then fork the %{qooxdoo}-contrib repo, make suitable changes like
adding or updating the information about a contribution, and then issue a pull
request. As soon as the request is merged into the main repo using your
contribution from an application's config.json will work.

Web Interface to the Catalog
=============================

We're planning to have also a web interface to the catalog that
might be a bit nicer than using Github's code browsing facility, maybe together
with searching and sorting capabilities.

Providing Contributions
==========================

The actual contribution code, i.e. the code somebody would download and use,
needs to be provided through the Manifest's *info/download*. The value should be
a HTTP URL to an archive (zip or tar.gz) ready to be downloaded. The archive
should contain a single root folder with arbitrary name, and beneath that the
contents of the contribution. I.e. for a standard qooxdoo library the second
level should contain its Manifest.json.

Adding a revision.txt file
---------------------------

TBD.

Using Contributions
====================

As a user of contributions you just have to edit your ``config.json``
configuration file.
You integrate a library by giving them an entry in
the ``libraries/library`` job key, starting with the ``contrib://`` URL
pseudo-scheme, followed by the name of the contribution, followed by the version
you want to use, followed by the Manifest file name of this library, for example
``contrib://UploadMgr/0.2/Manifest.json``.

With running a compile job (*source*, *build*) the Generator will now query the
catalog for that version of the contribution, evaluate the corresponding Json
file, and access the download value. The corresponding contribution will be
downloaded to the local disk and used as a library as usual.

When re-running the build job, the Generator will check if the contribution has
changed, and will re-load it if that is the case. It will use the top-level
``revision.txt`` file which we mandate every contribution author has to maintain in
his contributions.
