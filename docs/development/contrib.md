%{qooxdoo}-contrib
==================

*%{qooxdoo}-contrib* is %{qooxdoo}'s infrastructure for third-party code that is useful for other users building %{qooxdoo} projects. A lot of those contributions take the form of %{qooxdoo} libraries ranging from small helper classes to full-blown and complex widgets and themes. But you may also find server-side implementations for RPC's, translation files or simple auxiliary stuff. It is community-provided content, and is also used as an incubator area for the framework itself. Some contributions are actively maintained, others are rather stale, so you may find there code of any stage of maturity (and consequently, immaturity).

Where to find what?
-------------------

This page deals with **how to use contributions** as well as what to bear in mind when **writing your own contributions**.

If you are interested in **what contributions are available** check out the [catalog website](http://qooxdoo.org/contrib/catalog), which makes finding a suitable contrib much easier.

If you want to **write and maintain contribs** read further to get an overview but then head over to the [qooxdoo-contrib GitHub organization](http://github.com/qooxdoo-contrib) and the [catalog repo](http://github.com/qooxdoo-contrib/catalog) there. Read the [Wiki-HowTos](http://github.com/qooxdoo-contrib/catalog/wiki) to get started.

### More context

With %{qooxdoo} 3.0 a new contribution infrastructure was introduced. The old contrib platform was *repository-based*, meaning that all contributions had to be in a certain source repository on SourceForge to be recognized as contributions. The new platform is *catalog-based*, meaning that it doesn't require that the contribution is in any particular data store or version control system. The catalog includes links where each specific contribution can be downloaded.

This page deals specifically with library-style contributions as they can be included in app development.

Library-style contributions
---------------------------

There are basically two aspects to contributions

-   the *user view*, meaning how to use a particular contribution in application development
-   the *maintainer view*, meaning how to provide and maintain a particular contribution

### User view

You can find contributions in the [catalog website](http://qooxdoo.org/contrib/catalog). On the detail page of a contrib, decide which version you want to use and click on it. In the corresponding *Manifest.json* file you will find where to get the code. This could be via archive download (*info/download*) or directly via Git or SVN (*info/download* or *info/homepage*). If its a contrib hosted by SourceForge and you don't want to install a SVN Client then download the whole [qooxdoo-contrib repo](http://sourceforge.net/p/qooxdoo-contrib/code/HEAD/tarball) (and use only the files you need).

Contributions can be included in a configuration like any other libraries: You add an appropriate entry in the `library` array of your configuration. Like other libraries, the contribution must provide a Manifest.json
\<pages/application\_structure/manifest\#manifest.json\> file with appropriate contents.

It's best practice to include the code of the contrib you are using within your project (e.g. within the top-level dir contribs). Putting it all together here is a sample *config.json* snippet:

    "jobs" : {
      "libraries" : {
        "library" : [{
          "manifest": "contribs/dialog/1.2/Manifest.json"
          }
        ]
      }
      ...
    }

(The wrapping in the predefined *libraries* includer job makes it easily available to build jobs).

### Maintainer view

The central piece of the contrib infrastructure is the catalog, it is like the index of known contributions. To make maintenance of the catalog simple and straight-forward, we decided to implement it as a Github repository.

-   the *contribution names* are top-level
-   beneath each contribution there is a set of directories with *version names*, and potentially a general readme file.
-   in each version directory is a *Manifest.json* file that applies to this particular version of the contribution

The Manifest.json file is exactly the Manifest file you know from qooxdoo libraries. The intent is that you can copy it straight over from your project to the catalog repo. You need to make sure, though, that all necessary fields in it will be filled, particularly the *info/download* field. A Generator job, pages/tool/generator/default\_jobs\_actions\#validate-manifest, will help you with that.

The actual contribution code, i.e. the code somebody would download and use, should be provided through the Manifest's *info/download* URL. The value should be a HTTP(S) URL to an archive (e.g. zip or tar.gz) ready to be downloaded.

The archive should contain a single root folder with arbitrary name, and beneath that the contents of the contribution. I.e. for a standard qooxdoo library the second level should contain its Manifest.json.

Here are the corresponding Manifest.json entries for some Github-hosted contribution:

    "info" : {
      "download" : "https://github.com/myuid/mycontrib/archive/master.tar.gz",
      ...
    }

If the contribution is still hosted at the old Sourceforge qooxdoo-contrib SVN repository use a standard SVN URL:

    "info" : {
      "download" : "http://svn.code.sf.net/p/qooxdoo-contrib/code/trunk/qooxdoo-contrib/SkeletonWidget/0.9/",
      ...
    }

### Maintainer's workflow

So the basic workflow for an author having a new revision of his contribution's version is:

-   Create an *archive* containing the contribution and put it *online*.
-   Edit the contribution's Manifest.json to contain the *download* location
-   Copy this Manifest.json to the appropriate path in the *catalog* repo.

For an author choosing Github to host his contribution all this can be quite easily achieved by maintaining contribution versions as Git *branches* and exploiting the archive downloads that Github offers. You just use an URL like

    https://github.com/<user>/<contrib>/archive/<branch_name><archive_suffix>

as the Manifest's download URL, with e.g. *branch\_name* being *master* and *suffix* being *.zip*.

See online [HowTo on Create or update a catalog entry](https://github.com/qooxdoo-contrib/catalog/wiki/Create-or-update-a-catalog-entry).
