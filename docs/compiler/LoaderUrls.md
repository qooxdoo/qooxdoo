# Loader URLs

The application loader in `qooxdoo-compiler` will run automatically without any additional parameters, but there are some query parameters which you can add to adjust the boot process.

They are:
- `qooxdoo:add-no-cache` - if set to "true", then the "nocache=..." query string will be added to each of the script URLs to avoid browser caching; any other value will turn it off
- `qooxdoo:load-parallel` - if set to "true", scripts will always be loaded in parallel, any other value will turn it off; by default, this is auto-detected based on browser type.  Note that on older browsers, turning this on may break the load.
- `qooxdoo:load-chunked` - if set to "true", then scripts will be chunked (see [SplashScreens.md](https://github.com/qooxdoo/qooxdoo-compiler/blob/master/docs/CustomAppStartup.md#splash-screens)); by default this is ignored parallel is off or when there is no splash screen detected
- `qooxdoo:splashscreen-disable` - if set to "true", then any splash screen will be ignored

For all of the parameters, if you do not provide a value then "true" is assumed, for example these are equivalent:

```
http://localhost:8080/demoapp/index.html?qooxdoo:splashscreen-disable=true
http://localhost:8080/demoapp/index.html?qooxdoo:splashscreen-disable
```

