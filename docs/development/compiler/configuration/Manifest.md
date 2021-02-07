# Manifest.json

Qooxdoo's [Manifest files](http://en.wikipedia.org/wiki/Manifest_file) serve to
provide meta information for a library in a structured way. Their syntax is in
JSON and they can be validated against a
[JSON schema](https://github.com/qooxdoo/qooxdoo-compiler/tree/master/source/resource/qx/tool/schema)
. They have a more informational part (keyed `info`), which is more interesting
for human readers, a technical part (named `provides` ) that is used in the
processing of generator configurations, and a part named `externalResources` to
include CSS and Javascript files. Here is a brief sample with all the possible
keys:

Manifest files are referenced in application's _config.json_ files (in the
library), to identify the library they stand for.

## Reference

This is a sample file:

```json
{
  "info": {
    "name": "Custom Application",

    "summary": "Custom Application",
    "description": "This is a skeleton for a custom application with Qooxdoo.",

    "keywords": ["custom"],
    "homepage": "http://some.homepage.url/",

    "license": "SomeLicense",
    "authors": [
      {
        "name": "First Author (uid)",
        "email": "first.author@some.domain"
      }
    ],
    "version": "trunk",
    "sourceViewUri": "https://github.com/someuser/custom/blob/master/source/class/%{classFilePath}#L%{lineNumber}"
  },

  "provides": {
    "namespace": "custom",
    "encoding": "utf-8",
    "class": "source/class",
    "resource": "source/resource",
    "translation": "source/translation",
    "type": "application",
    "environmentChecks": {},
    "application": {
      "class": "qxl.apiviewer.Application",
      "theme": "qxl.apiviewer.Theme",
      "name": "apiviewer",
      "title": "Qooxdoo API Viewer"
    }
  },
  "externalResources": {
    "script": ["js/customscript.js"],
    "css": ["styles/style.css"]
  },
  "requires": {
    "@qooxdoo/framework": "^6.0.0-alpha",
    "@qooxdoo/compiler": "^0.2.40",
    "qooxdoo/contrib": "^0.1.1"
  }
}
```

## Description of Keys

- **info**: All entries in this section are optional.

  - **name**: Name of the library.
  - **summary**: Short summary of its purpose.
  - **description**: Descriptive text.
  - **keywords**: List of keywords, tags.
  - **homepage**: Homepage URL of the library.
  - **license**: License name(s) of the library.
  - **authors**: Author(s) of the library. A list of maps, each map containing
    the following fields:
    - **name** : Author name.
    - **email** : Author email address.
  - **version**: Version of the library.
  - **Qooxdoo-versions**: List of versions of the Qooxdoo framework this library
    is compatible with.
  - **sourceViewUri**: URL to view the library's class code online. This URL
    will be used in generated API documentation. It has a special syntax and
    allows for placeholders (e.g. for the class name and the source line
    number).

- **provides**: Entries in this section are mandatory.

  - **namespace**: Library namespace (i.e. the namespace elements all class
    names in this library are prefixed with, e.g. `foo` for a main application
    class with name `foo.Application`).
  - **encoding**: File encoding of source code files (should be utf-8).
  - **class**: Path to the library's class code relative to the Manifest.json
    file, up to but not including the root namespace folder (e.g.
    `source/class`).
  - **resource**: Path to the library's resources relative to the Manifest.json
    file, up to but not including the root namespace folder (e.g.
    `source/resource`).
  - **translation**: Path to the library's translation files relative to the
    Manifest.json file (e.g. `source/translation`).
  - [**webfonts**]&#x3A; [see here](../development/howto/icon_fonts.md)
  - **type**: One of [`library`, `application`, `add-in`,`contribution`] .
  - **application**: An application description block as described in  
    [compiler.json](./compile.md). This block will copied to `applications`
    section in `compile.json` during installation of the contrib.
  - **environmentChecks**: Provides mappings between short environment keys
    (such as `browser.name`) and the class that implements it; the key name
    can be specified with a wildcard, eg `browser.*`

- **externalResources**: Static Javascript and CSS files that shall be always
  included without further processing by Qooxdoo. All paths are relative to the
  resource folder stated in the "provides" section.
  - **script**: Array of javascript files.
  - **css**: Array of css files.
  
  See [Using non-Qooxdoo, third-party libraries](../../howto/using_non_qx_libs.md)
  for how to use **externalResources** to include a browserified Node module in
  an app.

* **requires**: a list of of needed libraries and [packages](../cli/packages.md)
  . Format is `package_uri`: `needed_version` where `needed_version` is a semver
  compatible version description. Special handling for:
  - @qooxdoo/framework: This checks the version of the used Qooxdoo framework
    NPM package.
  - @qooxdoo/compiler: This checks the version of the used Qooxdoo compiler NPM
    package.
