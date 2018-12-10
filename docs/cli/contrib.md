# qooxdoo-contrib

<!-- TOC -->

- [qooxdoo-contrib](#qooxdoo-contrib)
    - [Introduction](#introduction)
    - [Discover and install libraries](#discover-and-install-libraries)
        - [Update the cache](#update-the-cache)
        - [List and install available libraries](#list-and-install-available-libraries)
        - [Remove a contrib library](#remove-a-contrib-library)
    - [Create a new contrib library project](#create-a-new-contrib-library-project)
    - [Publish new versions of contrib libraries](#publish-new-versions-of-contrib-libraries)
    - [How to list get your contrib repository listed with `qx contrib list`](#how-to-list-get-your-contrib-repository-listed-with-qx-contrib-list)
        - [qooxdoo.json](#qooxdoojson)
        - [Contribution compatibility management](#contribution-compatibility-management)

<!-- /TOC -->

## Introduction

A qooxdoo application is composed of classes that are part of libraries
identified by top-level namespaces. The main application is a library, the
qooxdoo framework itself is a library (qx), and any other resuable code that you
might want to include usually comes from a qooxdoo library. The qooxdoo contrib
system allows to create and share these libraries, providing a convenient way to
reuse and collectively maintain "contributions" (thus the short name "contrib").
It is qooxdoo's "plugin architecture".

Since the compiler is an NPM module, one might ask why we aren't using NPM for
qooxdoo contribs. Why create an additional module system? qooxdoo-contrib is
similar to NPM, but works a bit different. It is based directly on GitHub
because that is where most qooxdoo code is developed and published, and doesn't
require NPM as an additional layer with a very different use case: NPM is for
managing _dependencies_, whereas the qooxdoo contrib tools mainly check
_compatibility_. Finally, since each qooxdoo library already has a manifest file
with metadata, having to maintain another metadata container such as
`package.json` seemed redundant.

qooxdoo-contrib basically works like this:

1. A qooxdoo library is maintained as public repository on GitHub with the
[GitHub topic](https://help.github.com/articles/about-topics/) `qooxdoo-contrib`

2. The library author/maintainer [creates a release of the library](https://help.github.com/articles/creating-releases/) 
(usually from the master branch, although experimental releases could also from 
other branches).

3. Using the CLI, library consumers download daily updated data of published
contribs from GitHub (the list can be manually updated more frequently), query
that data for contrib libraries they want to use, and install those libraries.
The CLI checks the compatibility of the published libraries with the qooxdoo
version used by the library consumer. 

4. For library authors, the CLI offers commands to easily create and publish 
contrib libraries.

## Discover and install libraries

### Update the cache

The first step is always to update the local cache of available contrib
libraries. For this, simply execute `qx contrib update`. The command has the
following options:

```
qx contrib update [repository]

Options:
  --file, -f     Output result to a file
  --search, -S   Search GitHub for repos (as opposed to using the cached nightly
                 data)
  --verbose, -v  Verbose logging
  --quiet, -q    No output
```

Without any arguments, `qx contrib update` will download the cache of GitHub
data which is generated nightly; this is great for speed but will mean that the
database is slightly out of date, and if you're developing your own contrib this
is not ideal.

To have a completely up to date version of the contrib database, use the
`--search` option - this takes longer because it searches the whole of GitHub
for contribs which are suitable; you can speed this up by specifying the name of
the repositories you want to search for.

To search GitHub, it's necessary for `qx` to have an API token from your account
at GitHub; if you have not previously provided one, `qx contrib update` will
prompt you for a token and save it, so that future calls use the same token. 
You can obtain a token from https://github.com/settings/tokens - you don't need
to add any permissions because this will only be used read only.

### List and install available libraries

The next step is to execute `qx contrib list` in the root of your project. This
command needs to be executed inside your project folder, since it expects
`Manifest.json` and `compile.json` to be in the current working directory. `qx
contrib list` retrieves the version of the qooxdoo framework that the current
project depends on and filters the list of available contributions accordingly.
The list displays the names of the repositories and the names of the contained
contrib libraries that will be installed.

You can then install any contrib library from this list by executing `qx contrib
install <repository name>`. Note that you that the installation happens at the
_repository level_, i.e. you can only install all the libraries from that
repository at once, although you may manually disable individual ones in the
`contrib.json file` by deleting their entry.

Sometimes, especially when using qooxdoo master, you might get very few hits, if
any at all. This might be because the contrib library authors have not yet
created a release of their library that indicates its compatibility with that
qooxdoo version, even though technically, they are compatible. In order to
install these contributions, you need to do the following:

```
qx contrib list --all # this will list all available contribs, regardless of compatibility
qx contrib install <repo name> --release <name of the most recent/selected release tag>
```

### Remove a contrib library

If you no longer need a contrib library, simply execute `qx contrib remove <repo
name>`. Please note again that this affects _all_ the libraries contained in
this repository.

## Create a new contrib library project

If you are starting a new qooxdoo project and you plan on publishing it as a
contrib library, the CLI is there to help you. Please proceed as follows:

1. Create a new empty repository on GitHub (it shouldn't contain a readme).
 
2. Clone that repository to your local machine, open a terminal and `cd` into
the repository's folder

3. Execute `qx create <library namespace> --type contrib`. You will be asked for
more information on the contrib library.

4. Work on the library and, if possible, provide a running demo application in
the `demo/default` folder.

5. When ready, publish your new contrib (see below).

## Publish new versions of contrib libraries

The CLI makes it really easy to publish releases of your contrib library. Say
you have a local clone of the GitHub repository of your contrib library. After
committing all changes to your code and pushing them to the master branch of
your repo, you can execute `qx contrib publish`. The command has the following
options:

```   
  --type, -t            Set the release type
           [string] [choices: "major", "premajor", "minor", "preminor", "patch",
                                    "prepatch", "prerelease"] [default: "patch"]
  --noninteractive, -I  Do not prompt user
  --version, -V         Use given version number
  --quiet, -q           No output
  --message, -m         Set commit/release message
  --dryrun              Show result only, do not publish to GitHub
  --verbose, -v         Verbose logging
```

You need to supply a valid GitHub token which has permissions to publish your
repo - if you're provided one before it will have been stored, and you can find
out what the token is and set a new one with these commands:

```
   $ qx config set github.token 0123456789abcdef0123456789abcdef0123456789abcdef
   $ qx config get github.token
   github.token=0123456789abcdef0123456789abcdef0123456789abcdef
   $
```

The command takes care of incrementing the version of your application. By
default, the patch version number is increased, but you can choose among the
release types stated above. The command will then commit the version bump and
push it to the master branch before releasing the new version.

## How to get your contrib repository listed with `qx contrib list`

- The repository **must** have a [GitHub topic](https://help.github.com/articles/about-topics/) 
`qooxdoo-contrib` in order to be found and listed.
  
- The tool will only show **[releases](https://help.github.com/articles/about-releases/)** 
not branches. The releases (tags) **should** be named in  [semver-compatible format](http://semver.org/) 
(X.Y.Z). They **can** start with a "v" (for "version").

- In order to be installable, the library manifests must be placed in the
repository in one of the following ways:
  
  a) If the repository contains just **one single library**, its `Manifest.json`
  file must be placed in the repository's root directory (unless you use
  `qoodoo.json`, see below)
  
  b) If you ship **several libraries** in one repository, or you want to place
  the `Manifest.json` file outside of the root directory, you must provide a
  `qooxdoo.json` file in the root dir (see below)

- Make sure to keep the "qooxdoo-version" key up to date.

### qooxdoo.json

It is recommended, but not mandatory, to include a `qooxdoo.json` file in the
root of the repository. This metadata file allows the discovery of libraries and
applications/demos in a repository. It has the  following syntax:
     
```
{
  "libraries": [
   { "path":"relative-path/to/dir-containing-manifest1" },
   { "path":"relative-path/to/dir-containing-manifest2" },
   ...
 ],
  "applications": [
	  { "path": "relative-path/to/demo1"},
    ...
	]
}
``` 

If you do not include the file, the following paths are assumed (for a contrib):

```
{
	"libraries": [
		{ "path": "." }
	],
	"applications": [
		{ "path": "demo/default"}
	]
}
```

### Contribution compatibility and dependency management

The contrib system uses [semver](http://semver.org) and [semver
ranges](https://github.com/npm/node-semver#ranges) to manage dependencies and
compatibilites. The main dependeny is between the qooxdoo framework used by the
application under development and the contribution (which has been also been
developed with a particular qooxdoo version).

The qooxdoo framework version can be found in the [top level `version.txt`
file](https://github.com/qooxdoo/qooxdoo/blob/master/version.txt). The contrib
declares its compatibility with qooxdoo versions using the `qooxdoo-versions` OR
`qooxdoo-range` entries in `Manifest.json` (See [this
example](https://github.com/cboulanger/qx-contrib-Dialog/blob/master/Manifest.json#L21)).
`qooxdoo-versions` takes an array of version numbers. You need to specify each
and every version that you want to support, and any new qooxdoo version will
break compatibility. This is part of the original, now defunct contrib system.
It will be supported for some time, but might be deprecated in the future.

We strongly suggest to use the `qooxdoo-range` key instead, which takes a
[semver range string](https://github.com/npm/node-semver#ranges). This allows
for a much more flexible and automated dependency management. You can, for
example, declare that the contrib will be compatible with qooxdoo versions
starting with 5.02 up until version 6, i.e. as long as there is no breaking
change (which is guaranteed by the semver specs), using `5.0.2 - 6.x` as the
`qooxdoo-range`. The `qx contrib` commands handle the compatibility data
generated by semver strictly, and the compiler will enforce these compatibility
restraints (TBD).

In future versions, contribs can also declare their *dependencies* on other
contribs (TBD). Currently, all necessary contribs will have to be declared in the
application's `contrib.json` by first installing them with `qx contrib install
<repo/name>`and then committing `contrib.json` to the project's repository. When
a project is first compiled, you need to run `qx contrib install` (with no
further arguments) to download the contribs from GitHub.

*A note on NPM*: Under normal circumstances, a contrib does not need to use NPM
or maintain a `package.json` file. In particular, neither the `qxcompiler` nor
the `qooxdoo-sdk` npm packages should be NPM dependencies of the contrib.
Instead, they are installed either at the level of the application or globally
(see the [docs on installation](../../README.md#installation)). You might want
to use NPM for development-time task such as transpiling your code, but all
NPM-related information in the contrib will be ignored by the compiler.

## Contribs as Applications

While Contribs are historically just libraries of code and resources, you can
also identify a contrib as providing an Application which can be added to a
user's project. Two examples of this are the [Qooxdoo API
Viewer](https://github.com/qooxdoo/qooxdoo-api-viewer) and the Qooxdoo Test
Runner (TBD).  When these contribs are added to a project, the `qx` command will
automatically add a new application to the `compile.json` and the `qx serve`
command can be used to run both applications.

To declare that a contrib provides an application, add an `application` key to
the `Manifest.json` - for example:

```
    "provides": {
        "namespace": "apiviewer",
        "encoding": "utf-8",
        "class": "source/class",
        "resource": "source/resource",
        "translation": "source/translation",
        "type": "add-in",
        "application": {
            "class": "apiviewer.Application",
            "theme": "apiviewer.Theme",
            "name": "apiviewer",
            "title": "Qooxdoo API Viewer",
            "outputPath": "apiviewer",
            "include": [ "qx.*" ],
            "exclude": [ "qx.test.*", "qx.module.Blocker", "qx.module.Placement" ]
        }
    }
```

That `application` is copied into the `compile.json`'s `applications` key as a
new entry (or overwriting the old one)