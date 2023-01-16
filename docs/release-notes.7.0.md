# Qooxdoo Release Notes
## New features in v7.5
- add Indigo dark theme to qooxdoo
For a full list of changes see https://github.com/qooxdoo/qooxdoo/commits/master?branch=master&qualified_name=refs%2Fheads%2Fmaster&since=2022-11-27&until==2023-01-16

## New features in v7.4
- compile.json: localModules can now be used in the root of the file. So you can address the modules for all applications.
                Application modules will be merged with global ones.
- browserifying the npm modules: Browserify of the used npm modules is a time-consuming process. Now it's checked whether it's really neccesary.
It's neccesary when:
    - commonjs-browserify.js does not exits
    - The list of modules has changed
    - One or more of the localModules are newer compared to the last run                

- localModules are now detected by the watch process    
For a full list of changes see https://github.com/qooxdoo/qooxdoo/commits/master?branch=master&qualified_name=refs%2Fheads%2Fmaster&since=2022-10-26&until=2022-11-26
 
## New features in v7.3
- Core: add min and max values to DateChooser  (#10462)
- Core: allows toolbars to be given a different layout (#10452)
- Core: allows tabview pages to be scrollable (adds ScrollablePage) (#10448)

- Compiler: adding support for proxy classes (#10446)

For a full list of changes see https://github.com/qooxdoo/qooxdoo/commits/master?branch=master&qualified_name=refs%2Fheads%2Fmaster&since=2022-07-11&until=2022-10-26


## Noteable changes in v7.2
 - To supplement the ability to bundle CommonJS modules that was added
in v7.1, it is now additionally possible to bundle local (in the local
tree vs. in `node_modules`) CommonJS or ES6 modules as well, as
documented [here](development/compiler/configuration/README.md).
 - We introduce 2 new widgets: qx.ui.form.FileSelectorButton and qx.ui.toolbar.FileSelectorButton.
 


## New features and fixes in v7.1
 - Browser-based applications may now make Node-style requests to `require` a CommonJS module, and the compiler will automatically create a bundle containing the required modules and inject it into the application so those modules are available for use. Documentation is found [here](development/compiler/configuration/README.md).




## Noteable changes and new features in v7.0
 - qx es6ify
 - allow super()
 - new High-Level-Communication API, including support for JSON-RPC and GraphQL (experimental)". Documention is found [here](communication/README.md)
 - Accessibility is an important topic in modern web development in order to allow assistive technologies to better help people with disabilities. Qooxdoo now supports better integration of [WAI-ARIA](https://www.w3.org/TR/wai-aria-1.1/) and more keyboard accessibility.
Documentation is found [here](development/howto/accessibility.md)




## Breaking changes in v7.0

- The `qx.library` config setting is no longer used by the
compiler. If you want to override the path to the framework
source, add the path to `compile.json`'s `libraries` array.

- `qx.ui.form.Slider` now works correctly in vertical orientation.
The maximum value is at the top of the slider and the minimal value
at the bottom. Before that, the 2 values were reversed 

- all flash supporting classes are removed - flash is dead since January 2020.

- `qx.ui.command.Group` fixed a bug where new `qx.ui.command.Command` added did
not set the `active` status of the group, thus staying active even if the group
was inactive.

-  Namespace `qx.io.remote` has  been removed from the framework and put into 
the package [`deprecated.qx.io.remote`](https://github.com/qooxdoo/deprecated.qx.io.remote).
You can reinstall it by executing `npx qx pkg install qooxdoo/deprecated.qx.io.remote`.
  

## Licensing and Open Source Ownership

As a team, we are a small group of experienced developers based around the world who use
Qooxdoo every day and have a vested interest in maintaining the project and keeping it strong.

All code is available at GitHub [https://github.com/qooxdoo](https://github.com/qooxdoo),
where we have published policies and rules on contributing; We actively encourage anyone to
submit Pull Requests to contribute to the project.

We chat in public on [Gitter](https://gitter.im/qooxdoo/qooxdoo) and answer questions
on [StackOverflow](https://stackoverflow.com/questions/tagged/qooxdoo)

And we have [exciting plans for the future](http://qooxdoo.org/documentation/#/roadmap)!

[Documentation](https://qooxdoo.org/documentation/#/development/contribute)



