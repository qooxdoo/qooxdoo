Migration Data
==============

*(status: Draft)*

This section deals with creating and maintaining migration data, usually
found under `tool/data/migration`.

Folder Structure
----------------

Here is a representation of the folder structure of the migration data.
Under the root folder for the migration data there are version folders
for specific %{qooxdoo} releases. Each version folder contains `info`
and `patches` subdirectories, which in turn contain data files for
regex-base reporting or replacing. Additionally, there might be Python
scripts `patch.py` or `config.py` for tree-based code transformation and
configuration file migration, respectively. The meaning of the different
files and folders are explained in the remainder of this document. Most
of them are optional.

``` {.sourceCode .text}
tool/data/migration/
  +- 2.1.1/                   [version number]
    +- info/
      +- 01-main.dat          [name arbitrary, but must end with .dat]
    +- patches/
      +- 01-main.dat          [name arbitrary, but must end with .dat]
    +- test/
      +- Manifest.json        [typically a test skeleton application]
      +- config.json
      +- ...
    +- patch.py
    +- config.py
```

-   It is not mandatory to add a migration folder for any given release.
    If there is no migration necessary for a release, there is no need
    to add a folder with its version string.
-   But for every version you add you need to adapt
    `tool/bin/migrator.py`, the script that actually preforms the
    migration. Add the new version to its list of known %{qooxdoo}
    versions, in the order they should be performed. You might also want
    to adjust the default old version.

Regex Targeting %{JS} Code
--------------------------

The most common actions migrating one version to another are
regex-based. Files in the `info` folder are to provide helpful messages
based on a match of their regular expressions. They only produce log
output. This is helpful if we cannot provide automatic migration, e.g.
when the meaning of a method parameter has changed and the user needs to
check whether he passes the correct values when calling the method.

Files in the `patches` folder are to replace matches with new strings.
They actually change class code. This is helpful for string-based
replacements in the code, e.g. when a framework class has gotten a new
name while retaining all its old methods and semantics, like
`qx.foo.OldName` -\> `qx.bar.NewName`.

### Info Files

#### How they are processed

The patterns from all info files are applied to each class file that is
to be migrated. If a pattern matches, its associated message is logged.

#### File syntax

Each info file consists of a number of lines. Each line consists of a
regular expression pattern, a `=`, and a message string. If a `=` is
part of the pattern, it has to be escaped like `\=`. The first
occurrence of an unescaped `=` will be used to split the line, so
subsequent unescaped `=` in the message do no harm. Example:

    \bqx\.bom\.Collection\b='qx.bom.Collection' is deprecated. Please check out the class qxWeb instead.

### Patch Files

#### How they are processed

The patterns from all patch files are applied to each class file that is
to be migrated. If a pattern matches, the matched source string is
replaced by the pattern's associated replacement string. The changed
content is written to the class file, replacing its original content.

#### File syntax

Each patch file consists of a number of lines. Each line consists of a
regular expression pattern, a `=`, and a replacement string. If a `=` is
part of the pattern, it has to be escaped like `\=`. The first
occurrence of an unescaped `=` will be used to split the line, so
subsequent unescaped `=` in the replacement do no harm. In the
replacement you can use capture groups from the pattern matching with
`\1`, `\2` asf. Example:

    \bqx\.lang\.Array\.toArray\((.*?)\)=qx.lang.Array.cast(\1, Array)

Python Script Targeting %{JS} Code
----------------------------------

There is the possibility to use a Python script that works on the syntax
tree of a source file, in order to obtain more complicated rewrites than
could be achieved with regex's. (One example would be working on an
argument of a method call, in between parentheses, that is itself an
expression containing parentheses. In such a case it is not possible to
match the closing parenthesis of the method call with a regex reliably.)

The script's file name has to be `patch.py`. It must contain a method
`patch(fileId, parseTree)` which takes a file id and a syntax tree, and
must change the syntax tree in place. It must return `True` or `False`
depending on whether the tree has been changed. During the migration
process tree-based transformations, if available, are applied *before*
regex-based transformations. The changed tree is written to disk using
the Generator's pretty-printing feature, in place of the original file
content.

### Caveats

-   An important thing to note is that although the `patch.py` module of
    a specific %{qooxdoo} version is written against the tool chain *as
    it were at that time*, the module is actually run with the tool
    chain *of the target version*. That means that migrating from, say,
    version 2.0 to 2.3, a `patch.py` in the 2.1 version is run with the
    2.3 SDK.
-   That means that changes in the tool chain after the introduction of
    a specific `patch.py` (changed syntax tree, changed interface
    between *migrator.py* and *patch.py* etc.) will most likely break
    the patch.py module.
-   It would be ideal to run each `patch.py` with the tool chain it was
    created with. But that would require the user to download all
    intervening SDKs :-(.
-   So if compatibility with older `patch.py` modules breaks, one
    possibility is to require the user to first migrate to the last
    version which is known to work with those patch files (needing this
    particular intervening SDK), and then migrate to the final version.
    (We did something before, probably for other reasons, for
    applications being migrated from a version lower than 0.8 to
    something greater than 0.8, requiring an intermediate migration to
    0.8.2.)

### How to do it

-   Create a file `patch.py` in the version folder of the migration
    data, i.e. at the same level as the `info` and `patch` folders.
-   Add a function `def patch(fileId, parseTree)` to the file that will
    be passed the syntax tree of a class file and may make arbitrary
    changes to the tree.
-   The function has to return `True/False` to indicate whether it has
    made changes to the tree. Example of a correct do-nothing patch
    function:

    ``` {.sourceCode .python}
    def patch(fileId, parseTree):
        return False
    ```

Python Script Targeting Configuration Files
-------------------------------------------

-   The basic logic for migrating configuration files is implemented.
-   The main missing thing is the handling of `=` (don't overwrite)
    sigils in config keys, like `{"=foo" : {"bar":1}}`. It is unclear
    how they should be handled in a concrete config if the corresponding
    key is to be moved or renamed.

### How to do it

-   Copy `config.py` from `tool/data/migration/1.6` folder to the
    current version folder. If unchanged, it does nothing so the copy is
    harmless.
-   Read the comments in the file and fill out the indicated data
    structures and functions. Only then will the script be active when a
    `generate.py migration` is run.

