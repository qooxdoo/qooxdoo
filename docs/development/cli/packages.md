# The Qooxdoo package system

## Overview

Qooxdoo's "plugin architecture" is called Qooxdoo package system. It does not
only allow to extend one's own application with useful functionality such as
file uploads, dialog widgets, vector graphics, themes, and much more, it also
hosts components that have previously shipped with the framework, such as the
API viewer or the playground. You can distribute whole Qooxdoo applications this
way.

You can view a list of currently available packages in the
[online catalog](https://qooxdoo.org/package-cache/) or browse
the available packages with a GUI application, using the [Qooxdoo
package viewer](http://www.qooxdoo.org/qxl.packagebrowser).

The CLI supports the use, creation and maintenance of packages with the
`qx package` subcommands.

```bash
Commands:
  install [uri[@release_tag]]  installs the latest compatible release of package
                               (as per Manifest.json). Use "-r <release tag>" or
                               @<release tag> to install a particular release.
                               examples:
                               * qx contrib install name: Install latest published version
                               * qx contrib install name@v0.0.2: Install version 0.0.2,
                               * qx contrib install name@master: Install current master branch from github

  list [repository]            if no repository name is given, lists all
                               available packages that are compatible with the
                               project's Qooxdoo version ("--all" lists
                               incompatible ones as well). Otherwise, list all
                               compatible packages.
  publish                      publishes a new release of the package on GitHub.
                               Requires a GitHub access token. By default, makes
                               a patch release.
  remove [uri]                 removes a package from the configuration.
  update [repository]          updates information on packages from github. Has
                               to be called before the other commands. If a
                               package URI is supplied, only update information
                               on that package
  upgrade [library_uri]        if no library URI is given, upgrades all
                               available libraries to the latest compatible
                               version, otherwise upgrade only the package
                               identified by the URI.

```

## Architecture

A Qooxdoo application is composed of classes that are part of libraries
identified by top-level namespaces. The main application is a library, the
Qooxdoo framework itself is a library (qx), and any other reusable code that you
might want to include usually comes from a Qooxdoo library.

The Qooxdoo package system allows to create and share these libraries, providing
a convenient way to reuse and collectively maintain reusable components or whole
applications.

The package system works like this:

1.  A Qooxdoo library is maintained as public repository on GitHub with the
    [GitHub topic](https://help.github.com/articles/about-topics/)
    `qooxdoo-package` (see [other repos with that topic](https://github.com/topics/qooxdoo-package)).

2.  The library author/maintainer
    [creates a release of the library](https://help.github.com/articles/creating-releases/)
    (usually from the master branch, although experimental releases could also
    from other branches).

3.  Using the CLI, library consumers download daily updated data of published
    packages from GitHub (the list can be manually updated more frequently),
    query that data for library packages they want to use, and install those
    packages. The CLI checks the compatibility of the published libraries with
    the Qooxdoo version used by the library consumer.

4.  For library authors, the CLI offers commands to easily create and publish
    packages.

## Discover and install libraries

### Update the cache

The first step is always to update the local cache of available packages
libraries. For this, simply execute `qx package update`. The command has the
following options:

```bash
qx package update [repository]

Options:
  --version           Show version number                              [boolean]
  --help              Show help                                        [boolean]
  --file, -f          Output result to a file
  --search, -S        Search GitHub for repos (as opposed to using the cached
                      nightly data)
  --all-versions, -a  Retrieve all releases (as opposed to the latest
                      minor/patch release of each major release)
  --prereleases, -p   Include prereleases
```

Without any arguments, `qx package update` will download the cache of GitHub
data which is generated nightly; this is great for speed but will mean that the
database is slightly out of date, and if you're developing your own package this
is not ideal.

To have a completely up-to-date version of the package database, use the
`--search` option - this takes longer because it searches the whole of GitHub
for packages which are suitable; you can speed this up by specifying the name of
the repositories you want to search for.

To search GitHub, it's necessary for `qx` to have an API token from your account
at GitHub; if you have not previously provided one, `qx package update` will
prompt you for a token and save it, so that future calls use the same token. You
can obtain a token from  
<https://github.com/settings/tokens> - you don't need to add any permissions
because this will only be used read only.

### List available libraries

The next step is to execute `qx package list` in the root of your project. This
command needs to be executed inside your project folder, since it expects
`Manifest.json` and `compile.json` to be in the current working directory.
`qx package list` retrieves the version of the Qooxdoo framework that the
current project depends on and filters the list of available packages
accordingly. The list displays the names of the repositories and the names of
the contained packages that will be installed. It has the following options:

Here are the most relevant options (execute `qx pkg list --help` for a 
complete list):

```bash
  --all, -a              Show all versions, including incompatible ones
  --json, -j             Output list as JSON literal
  --installed, -i        Show only installed libraries
  --namespace, -n        Display library namespace
  --match, -m            Filter by regular expression (case-insensitive)
  --libraries, -l        List libraries only (no repositories)
  --short, -s            Omit title and description to make list more compact
  --noheaders, -H        Omit header and footer
  --prereleases, -p      Include prereleases into latest compatible releases
  --uris-only, -u        Output only the GitHub URIs of the packages which are
                         used to install the packages. Implies --noheaders and
                         --libraries.
  --qx-version           A semver string. If given, the qooxdoo version for
                         which to generate the listings
```

### Install a library

You can then install any package from this list by executing
`qx package install <URI>`. Its most relevant options are:

```bash
  --release, -r          Use a specific release tag instead of the tag of the
                         latest compatible release                      [string]
  --ignore, -i           Ignore unmatch of qooxdoo
  --save, -s             Save the libraries as permanent dependencies
                                                                 [default: true]
  --from-path, -p        Install a library/the given library from a local path
  --qx-version           A semver string. If given, the maximum qooxdoo version
                         for which to install a package
```

The URI takes the form `github_user/repository[/path]`: the first part is the
name of a repository on GitHub, which is enough if the `Manifest.json` of the
library is in the root of the repository. Otherwise, the path to the manifest
within the repository is appended. In the case that a repository contains
several libraries (see below) _all_ of them will be installed if the URI points
to the root of a repository. This might not be what you want.

If you do not specify any release, `qx package install` will install the latest
version compatible with your Qooxdoo version. If you want to install a specific
version (or in fact, any
["tree-ish" expression](https://stackoverflow.com/questions/4044368/what-does-tree-ish-mean-in-git)
that GitHub supports, you can use the `--release` parameter or add the version
with an '@' sign like so:

```bash
qx pkg install qooxdoo/qxl.apiviewer --release v1.1.0
qx pkg install qooxdoo/qxl.apiviewer@v1.1.0
qx pkg install qooxdoo/qxl.apiviewer@eef00cba2dd72ff73dc88f9786aa3d9a0ed4ff6d
qx pkg install qooxdoo/qxl.apiviewer@master
```

The prefix "v" is mandatory for releases. You can even use branch names like
"master" but referencing a moving target is obviously a bad idea except in
special cases since your code can break any time.

As noted, `qx package list` shows only the packages that are compatible with the
Qooxdoo framework version used as per the semver range in the
`require.@qooxdoo/framework` key in their `Manifest.json` . To install libraries
that are not listed for this reason anyway, do the following:

```bash
qx package list --all # this will list all available packages, regardless of compatibility
qx package install <URI>@<release_tag>
```

It is also possible to install a library from a local path, for example, during
development, if you work with a local git repository. If the library is  
published using the Qooxdoo package registry, but you wish to use a locally
stored version of it, you can use

```bash
qx package install owner/library --from-path ../path/to/the/library
```

Otherwise, you can install it "anonymously" with

```bash
qx package install --from-path ../path/to/the/library
```

If you want to install the package as an optional dependency, use the  
`--save=0` option. This will save the dependency in `qx-lock.json` (see below),
but not in the Manifest file. This is useful, for example, if you want to use
one of the [Qooxdoo apps](../../apps.md) such as the API viewer in your local build
without requiring it as a dependency in other applications that use your package.

### Lockfile "qx-lock.json"

When you install a package, its version, origin, and location on your local
hard drive will be saved to a lockfile with the name `qx-lock.json` in the root
dir of your project, which is roughly (but not completely) similar in function
to `package-lock.json` file in NPM. It allows to recreate the exact set of
dependencies via `qx package install` (without arguments).

### Upgrade your dependencies

You can upgrade the packages listed in the lockfile to the latest available
release compatible with your Qooxdoo version with `qx package upgrade`. Its 
most relevant options are: 

```bash
  --releases-only, -r    Upgrade regular releases only (this leaves versions
                         based on branches, commits etc. untouched)
                                                                 [default: true]
  --reinstall, -R        Do not upgrade, reinstall current version
  --prereleases, -p      Use prereleases if available
  --dry-run, -d          Show result only, do not actually upgrade
  --qx-version           A semver string. If given, the qooxdoo version for
                         which to upgrade the package
```

If you only want to upgrade one of the libraries, use

```bash
qx package upgrade <library uri>
```

### Remove a package

If you no longer need a package library, simply execute
`qx package remove <URI>`. Please note that this affects _all_ the libraries
contained in a repository, unless you specify the directory path to a particular
`Manifest.json`.

## Create a new package

If you are starting a new Qooxdoo project and you plan on publishing it as a
package, the CLI is there to help you. Please proceed as follows:

1.  Choose a **namespace** under which you put your library classes. We suggest
    to use a namespace with unique global variable name, under which you put all
    your libraries. Our recommendation is to use the following pattern:
    `<github user name>.<repo name>`, i.e. for example, `janedoe.helloworld`.
    But you can also use a name that identifies your organization, or any other
    top-level namespace. The namespace must not conflict with an existing
    namespace unless you are working on a drop-in replacement (such as a fork).

2.  Create a new empty repository on GitHub (it shouldn't contain a readme).
    Using the example from 1), user "janedoe" would create the repo "helloworld"
    for the package with the name/namespace `janedoe.helloworld`.

3.  Clone that repository to your local machine, open a terminal and `cd` into
    the repository's folder

4.  Execute `qx create <namespace> --type package`. You will be asked for more
    information on the package. When asked to provide the output directory for
    the application content, enter "." (dot) so that no subdirectory is created.
    `Manifest.json` and the `source` folder should be at the top level of the
    repository.

5.  Work on the library and, if possible, provide a running demo application. In
    our example, the demo app is in `source/class/janedoe/helloworld/demo`
    folder.

6.  When ready, publish your new package (see below).

### Libraries as Applications

You can identify a library as providing an Application which can be added to a
user's project. Two examples of this are the
[Qooxdoo API Viewer](https://github.com/qooxdoo/qooxdoo-api-viewer) and the
Qooxdoo Test Runner (TBD). When these libraries are added to a project, the `qx`
command will automatically add a new application to the `compile.json` and the
`qx serve` command can be used to run both applications.

To declare that a library provides an application, add an `application` key to
the `Manifest.json` - for example:

```json5
{
  provides: {
    namespace: "apiviewer",
    encoding: "utf-8",
    class: "source/class",
    resource: "source/resource",
    translation: "source/translation",
    application: {
      class: "apiviewer.Application",
      theme: "apiviewer.Theme",
      name: "apiviewer",
      title: "Qooxdoo API Viewer",
      outputPath: "apiviewer",
      include: ["qx.*"],
      exclude: ["qx.test.*", "qx.module.Blocker", "qx.module.Placement"]
    }
  }
}
```

That `application` is copied into the `compile.json`'s `applications` key as a
new entry (or overwriting the old one)

### Publish new versions of packages

The CLI makes it really easy to publish releases of your package. Say you have a
local clone of the GitHub repository of your package. After committing all
changes to your code and pushing them to the master branch of your repo, you can
execute `qx package publish`. The command has the following options:

```bash
  --type, -t             Set the release type
           [string] [choices: "major", "premajor", "minor", "preminor", "patch",
                                    "prepatch", "prerelease"] [default: "patch"]
  --noninteractive, -I   Do not prompt user                            [boolean]
  --use-version, -V      Use given version number                       [string]
  --prerelease, -p       Publish as a prerelease (as opposed to a stable
                         release)                                      [boolean]
  --message, -m          Set commit/release message                     [string]
  --dry-run, -d           Show result only, do not publish to GitHub    [boolean]
  --create-index, -i     Create an index file (qooxdoo.json) with paths to
                         Manifest.json files                           [boolean]
  --qx-version           A semver string. If given, the qooxdoo version for
                         which to publish the package                   [string]
  --breaking             Do not create a backwards-compatible release, i.e.
                         allow compatibility with current version only [boolean]
  --qx-version-range     A semver range. If given, it overrides --qx-version and
                         --breaking and sets this specific version range[string]
```

You need to supply a valid GitHub token which has permissions to publish your
repo - if you're provided one before it will have been stored, and you can find
out what the token is and set a new one with these commands:

```bash
$ qx config set github.token 0123456789abcdef0123456789abcdef0123456789abcdef
$ qx config get github.token
github.token=0123456789abcdef0123456789abcdef0123456789abcdef
```

Please **make sure to [run `qx lint`](commands.md#lint) before publishing your
package**. This insures code quality and lets you spot small bugs that might
otherwise go unnoticed.

The command takes care of incrementing the version of your application. By
default, the "patch" version number is increased. If you add a new feature,
use `--type=minor`, if your code is backwards-incompatible because of a
breaking change, use `--type=major`. The command will figure out the correct
next version, commit the version bump and push it to the master branch
before releasing the new version. However, you can also override this
mechanism and determine the version manually, by using `--use-version=x.y.z`.

The command is interactive: it will prompt you to enter the
necessary information and will ask for a confirmation before
doing anything definitive. To be absolutely sure, you can also do a `--dry-run`
first. In contrast, if you know what you are doing, you can provide all necessary
information on the command line and tell the command to be `--noninteractive`.

> Before releasing a package, it is important to think about compatibility
with previous qooxdoo versions. If you upgrade your qooxdoo version to a new
breaking (major) release, for example from 7.1.3 to 8.0.0, and this dependency
is simply copied into the `requires.@qooxdoo/framework` key of `Manifest.json`,
`qx package list` will no longer show this package to applications that use
previous versions of qooxdoo, because it is considered incompatible. This
is why, by default, `qx package publish` will add the new major version
to the range rather than replace the previous one. However, if your package
relies on a new feature or has been modified to work with a breaking change
in the new qooxdoo version, making it incompatible with a previous one,
you need to add the `--breaking` option. This will make the new qooxdoo version a 
strict dependency and remove the compatibility with earlier versions. 


### How to get your package listed

- The repository **must** have a
  [GitHub topic](https://help.github.com/articles/about-topics/)
  `qooxdoo-package` in order to be found and listed.

- The tool will only show
  **[releases](https://help.github.com/articles/about-releases/)** . The
  releases (tags) **should** be named in  
  [semver-compatible format](http://semver.org/) (X.Y.Z). They **must** start
  with a "v" so that it can be automatically be recognized as a published
  version.

- In order to be installable, the library manifests must be placed in the
  repository in one of the following ways: a) If the repository contains just
  **one single library**, its `Manifest.json` file must be placed in the
  repository's root directory (unless you use `qooxdoo.json`, see below) b) If
  you ship **several libraries** in one repository, or you want to place the
  `Manifest.json` file outside of the root directory, you must provide a
  `Qooxdoo.json` file in the root dir (see below)

### Multi-library repositories

It is possible to put more than one library into a repository, by putting an
index file into the root of the repository with the name "Qooxdoo.json". It
allows the package system to auto-discover the contained libraries. It has the
following syntax:

```json5
{
  libraries: [
    { path: "relative-path/to/dir-containing-manifest1" },
    { path: "relative-path/to/dir-containing-manifest2", main: true }
    //...
  ]
}
```

The first library will be treated as the main library, unless you specify the
main library by adding a truthy `main` property (see above).

You can (re)generate the `Qooxdoo.json` file by using
`qx package publish --create-index`. The command will automatically search for
all `Manifest.json` files in the repository and ask you to select the main
library if you have more than one.

Note that all libraries in the repository must have the same version number,
because dependencies are managed and checked on the level of the repository, not
of the library. When you `qx package publish` the repository, the versions of
all libraries will be set to the one of the main library.

### How to hide your library from being listed

If you delete the package repository on GitHub, it will be removed from the
package registry when the registry is regenerated nightly. However, there might
be situations in which you want the library to be accessible without showing up
in `qx list`, for example, when you rename or deprecate a library, or if you
create a fork that your application depends on, but which you don't want others
to use.

To achieve this, simply add `(unlisted)` or `(deprecated)` (with the brackets)
to the description of the repository on GitHub (the one below the name of the
repository). This way, the library will not be listed unless `--all` is passed
to `qx list`.

### Install packages automatically

When you install packages for your projects, they will be saved in the
`qx-lock.json` file. If you commit this file, anyone who checks out the source
code can then automatically install all the packages in the specific version
using `qx package install` (without arguments). This is also useful in
installation or build scripts.

## Library compatibility and dependency management

The package system uses [semver](http://semver.org) and
[semver ranges](https://github.com/npm/node-semver#ranges) to manage
dependencies and compatibilities. The main dependency is between the Qooxdoo
framework used by the application under development and the package libraries
(which have been also been developed with a particular Qooxdoo version).

The Qooxdoo framework version can be found in the `package.json` file and
additionally in the top level `version.txt` file. The package declares its
compatibility with Qooxdoo versions using the `requires.@qooxdoo/framework`
entries in `Manifest.json` (See
[this example](https://github.com/qooxdoo/qxl.widgetbrowser/blob/master/Manifest.json#L47)
), which takes a
[semver range string](https://github.com/npm/node-semver#ranges) . You can, for
example, declare that the package will be compatible with Qooxdoo versions
starting with 5.02 up until version 6, i.e. as long as there is no breaking
change (which is guaranteed by the semver specs), using `5.0.2 - 6.x` as the
`requires.@qooxdoo/framework`. The `qx package` commands handle the
compatibility data generated by semver strictly, and the compiler will enforce
these compatibility restraints.

The easiest way to keep the "requires.@qooxdoo/framework" key in `Manifest.json`
up to date is to prepend the Qooxdoo version that the library depends on with an
"^" which indicates that the package will work with that version upwards until
the version with a breaking change (which increments the major version). For
example, a package that depends on `"@qooxdoo/framework":"^6.0.0-alpha"` will be
considered compatible with all 6.x versions, but not with v7.x.

### qx package and NPM

There are two ways in which the package system and the NPM
package manager relate to each other: a) the general question why
packages aren't distributed as NPM packages, as the compiler is,
and b) how NPM-specific information is handled by the compiler.

a) Since the compiler is an NPM module, one might ask why we aren't using
NPM for Qooxdoo packages. Why create an additional package system? Qooxdoo
packages work similarly to NPM, but without storing releases in a centralized
repository. They are (currently) downloaded directly from GitHub releases
because that is where most Qooxdoo code is developed and published.

b) Under normal circumstances, a package does not need to use NPM or
maintain a `package.json` file. In particular, the `@qooxdoo/framework`
npm package should not be NPM dependency of the package, unless the
package contains a standalone application. You might want to use
NPM for development-time task such as transpiling your code, but all
NPM-related information in the package will be ignored by the compiler.
