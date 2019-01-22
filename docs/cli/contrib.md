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
    - [Install contribs automatically](#install-contribs-automatically)
    - [Contribution compatibility management](#contribution-compatibility-management)
    - [qx contrib and NPM](#qx-contrib-and-NPM)
<!-- /TOC -->

## Introduction

A qooxdoo application is composed of classes that are part of libraries
identified by top-level namespaces. The main application is a library, the
qooxdoo framework itself is a library (qx), and any other resuable code that you
might want to include usually comes from a qooxdoo library. The qooxdoo contrib
system allows to create and share these libraries, providing a convenient way to
reuse and collectively maintain "contributions" (thus the short name "contrib").
It is qooxdoo's "plugin architecture".

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
install <URI>`. The URI takes the form `github_user/repository[/path]`: the first
part is the name of a repository on GitHub, which is enough if the `Manifest.json`
of the library is in the root of the repository. Otherwise, the path to the 
manifest within the repository is appended. In the case that a repository contains
several libraries (see below) all of them will be installed if the URI points to 
the root of a repository. 

As noted, `qx contrib list` shows only the contribs that are compatible with the
qooxdoo framework version used as per the semver range in the `require.qooxdoo-sdk`
key in their `Manifest.json`. To install libraries that are not listed for this 
reason anyways, do the following:

```
qx contrib list --all # this will list all available contribs, regardless of compatibility
qx contrib install <URI@release_tag> 
```

### Remove a contrib library

If you no longer need a contrib library, simply execute `qx contrib remove <URI>`. 
Please note that this affects _all_ the libraries contained in  a repository, 
unless you specify the directory path to a particular `Manifest.json`.

## Create a new contrib library project

If you are starting a new qooxdoo project and you plan on publishing it as a
contrib library, the CLI is there to help you. Please proceed as follows:

1. Choose a name for your contribution, which should be identical to the 
namespace under which you put your library classes. We suggest to use a namespace
with unique global variable name, under which you put all your contributions. Our
recommendation is to use the following pattern: `<github user name>.<repo
name>`, i.e. for example, `janedoe.helloworld`. But you can also use a 
name that identifies your organization, or any other top-level namespace.

2. Create a new empty repository on GitHub (it shouldn't contain a readme).
Using the example from 1), user "janedoe" would create the repo "helloworld" for
the contrib with the name/namespace `janedoe.helloworld`.

3. Clone that repository to your local machine, open a terminal and `cd` into 
the repository's folder 

4. Execute `qx create <namespace> --type contrib`. You will be asked 
for more information on the contrib library. When asked to provide the output 
directory for the application content, enter "." (dot) so that no subdirectory
is created. `Manifest.json` and the `source` folder should be at the top 
level of the repository.

5. Work on the library and, if possible, provide a running demo application. In 
our example, the demo app is in `source/class/janedoe/helloworld/demo` folder. 

6. When ready, publish your new contrib (see below). 

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

```bash
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
  
- The tool will only show **[releases](https://help.github.com/articles/about-releases/)**. 
The releases (tags) **should** be named in  [semver-compatible format](http://semver.org/) 
(X.Y.Z). They **can** start with a "v" (for "version").

- In order to be installable, the library manifests must be placed in the
repository in one of the following ways:
  
  a) If the repository contains just **one single library**, its `Manifest.json`
  file must be placed in the repository's root directory (unless you use
  `qoodoo.json`, see below)
  
  b) If you ship **several libraries** in one repository, or you want to place
  the `Manifest.json` file outside of the root directory, you must provide a
  `qooxdoo.json` file in the root dir (see below)

### qooxdoo.json

This file in the root of the repository allows the inclusion and discovery of 
multiple libraries in this repo. It has the  following syntax:
     
````json5
{
  "libraries": [
   { "path":"relative-path/to/dir-containing-manifest1" },
   { "path":"relative-path/to/dir-containing-manifest2" },
   //...
 ]
}
````

## Install contribs automatically

When you install contribs for your projects, they will be saved in the
`contrib.json` file. If you commit this file, anyone who checks out the source
code can then automatically install all the contribs in the specific version
using `qx contrib install` (without arguments). This is also useful in
installation or build scripts.

## Contribution compatibility and dependency management

The contrib system uses [semver](http://semver.org) and [semver
ranges](https://github.com/npm/node-semver#ranges) to manage dependencies and
compatibilites. The main dependeny is between the qooxdoo framework used by the
application under development and the contribution (which has been also been
developed with a particular qooxdoo version).

The qooxdoo framework version can be found in the [top level `version.txt`
file](https://github.com/qooxdoo/qooxdoo/blob/master/version.txt). The contrib
declares its compatibility with qooxdoo versions using the `qooxdoo-versions` OR
`requires.qooxdoo-sdk` entries in `Manifest.json` (See [this
example](https://github.com/qooxdoo/qxl.widgetbrowser/blob/master/Manifest.json#L47)).
`qooxdoo-versions` takes an array of version numbers. You need to specify each
and every version that you want to support, and any new qooxdoo version will
break compatibility. This is part of the original, now defunct contrib system.
It will be supported for version 6, but will be removed in version 7.

We strongly suggest to use the `requires.qooxdoo-sdk` key instead, which takes a
[semver range string](https://github.com/npm/node-semver#ranges). This allows
for a much more flexible and automated dependency management. You can, for
example, declare that the contrib will be compatible with qooxdoo versions
starting with 5.02 up until version 6, i.e. as long as there is no breaking
change (which is guaranteed by the semver specs), using `5.0.2 - 6.x` as the
`requires.qooxdoo-sdk`. The `qx contrib` commands handle the compatibility data
generated by semver strictly, and the compiler will enforce these compatibility
restraints.

The easiest way to keep the "requires.qooxdoo-sdk" key in `Manifest.json` up to 
date is to prepend the qooxdoo version that the library depends on
with an "^" which indicates that the contrib will work with that version upwards
until the version with a breaking change (which increments the major version). 
For example, a contrib that depends on `"qooxdoo-sdk":"^6.0.0-alpha"` will be 
considered compatible with all 6.x versions, but not with v7.x.

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

```json5
{
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
}
```

That `application` is copied into the `compile.json`'s `applications` key as a
new entry (or overwriting the old one)

## qx contrib and NPM 

There are two ways in which the contrib system and the NPM package manager relate
to each other: a) the general question why contribs aren't distributed as NPM
packages, as the compiler is, and b) how NPM-specific information is handled by
the compiler.

a) Since the compiler is an NPM module, one might ask why we aren't using NPM
for qooxdoo contribs. Why create an additional module system? qooxdoo-contrib is
similar to NPM, but works different. It is based directly on GitHub releases
because that is where most qooxdoo code is developed and published. It is planned
to support other repository providers in the future.

b) Under normal circumstances, a contrib does not need to use NPM
or maintain a `package.json` file. In particular, neither the `qxcompiler` nor
the `qooxdoo-sdk` npm packages should be NPM dependencies of the contrib.
Instead, they are installed either at the level of the application or globally
(see the [docs on installation](../../README.md#installation)). You might want
to use NPM for development-time task such as transpiling your code, but all
NPM-related information in the contrib will be ignored by the compiler.
