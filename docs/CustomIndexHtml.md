# Custom index.html for your applications

By default, the compiler will output a standard `index.html` into the application's output directory; this creates a vanilla output whcih is suitable for many applications, but if you want to customise it further you can create a file called `boot/index.html` that will be used as
a template.  The `boot/index.html` is copied verbatim, with the exception that the application's `boot.js` script is inserted before the close `</body>` - you can add whatever scripts you like, but do not try to link to the `boot.js`.

If you just want to change the title of the application web page, the easier way to do it is set the title on the Application object - if you're using the compiler API, see the `title` property of `qxcompiler.app.Application`, but if you're using `qx` command line tool modify your `compile.json` to look like this:

```
`
{
    /** Applications */
    "applications": [
        {
            "class": "demoapp.Application",
            "theme": "demoapp.theme.Theme",
            "name": "demoapp",
            "title": "My Demo Application"
        }
    ],
```
