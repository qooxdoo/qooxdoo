# Splash Screens
Splash screens are an optional feature of the application loader in `qooxdoo-compiler`; it will slow down your application loading slightly, but on the other hand it will give attractive feedback with a progress bar all the way through your application's startup.

By default, the loader does not provide any splash screen or progress bar; to add one, you need to replace the application's `.html` file with your own, and provide a global function called `QOOXDOO_LOADING_FEEDBACK` that the boot loader can call during the boot process.

## Example
For a working example, take a look at [qooxdoo-compiler/demos/boot/](https://github.com/qooxdoo/qooxdoo-compiler/tree/master/demos/boot/) - if you add this folder to your application's `source` folder and re-run `qx compile`, it will have a splash screen with loading progress bar.

## Chunking
Previously, the only option for loading scripts was either asynchronously (also called "parallel" loading) or not.  Asynchronous loading queues all scripts to be loaded by the browser (which could be hundreds thousands) and allows the browser to go ahead and load as fast as possible.  For splash screens this is not ideal because the browser is working so hard at loading scripts that it does not redraw the display with any updated progress information, so from the point of view of the user the progress bar will be stuck at a low number until the application is suddenly running.

To solve this, chunking (enabled by default *only if* there a `QOOXDOO_LOADING_FEEDBACK` function) divides the list of scripts to load into "chunks" and adds a small 1ms timeout between each chunk to allow the browser to redraw the screen.  This slows the loading because of the 1ms delay and the time it takes to redraw, but on the other hand your user will get feedback all the way through the load.

By default the chunks are 20% of the total number of scripts, but you can override this with the `get-settings` command in the API.

## API

`QOOXDOO_LOADING_FEEDBACK` looks like this:
```
  window.QOOXDOO_LOADING_FEEDBACK = function(options, cb) {
    switch(options.command) {
    case "script-loaded":
      /* ... provide feedback ... */
      return cb && cb();
      
    case "load-complete":
      /* ... perhaps hide the splash screen ... */
      return cb && cb();
      
    case "get-settings":
      /* ... optionally provide settings back to the boot loader ... */
      return null;
    }
  }

```

The `options` parameter has a `command` property (e.g. `"script-loaded"`) that determines what the other properties of the object will be.

### `command === "script-loaded"`
This is fired every time a script completes loading, and adds these properties to `options`:
- `numScripts` - total number of scripts to load
- `numScriptsLoaded` - number of scripts fully loaded so far
- `numScriptsLoading` - number of scripts in progress

### `command === "load-complete"`
This is fired when all scripts are loaded and the application is about to startup

### `command === "get-settings"`
This is called once before any scripts are loaded to allow the loader to override default settings.  The result can be null, or an object which has these properties:
- `isLoadChunked` - (**optional**) whether to load scripts in "chunks"
- `loadChunkSize` - (**optional**) if loading with chunks, how big each chunk should be (default is 20% of the number of scripts)

