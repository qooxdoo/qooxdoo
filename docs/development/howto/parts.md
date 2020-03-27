# Parts and Source Code Packages Overview

## Motivation

Source Code Packages (as opposed to [package libraries](../cli/packages.md) are
a concept that allows you to partition your application physically. The idea
is to spread the entire application over multiple JavaScript files, in order
to optimize download and startup behaviour. On page load only the essential
first part of the application is loaded (commonly called the *boot* part),
while others remain on the server and will only be loaded on demand. As a
consequence, the initial code part is smaller, so it's faster to download,
consumes less bandwidth and starts up faster in the browser. Other parts are
then loaded on demand during the user session. This incurs a bit of latency
when the user enters a certain application path for the first time and the
corresponding part has to be loaded. On the other side, parts that pertain
to a certain application path (e.g. an options dialogue) never have to be
downloaded if this application path is not entered during the running session.

## Development Model

In order to realize this concept, you have the option to specify
*parts* of your application, while the build process takes care of
mapping these (logical) parts to physical packages that are eventually
written to disk. At run time of your application, the initial
package will contain loader logic that knows about the other parts.

There are two different but related terms here: You as the developer define
**parts** of your application. These are logical or visual related elements,
like all elements that make up a complex dialogue, or the contents of an
interactive tab pane. The build process then figures out all the dependencies
of these parts and collects them into **packages**, which eventually map to
physical files on disk. Since some parts might have overlapping dependencies,
these are optimized so that they are not included twice in different packages.
Also, you might want to specify which parts should be collapsed into as few
packages as possible, how small a package might be, and so forth. So you
define the logical partitioning of your application and specify some further
constraints, and the build process will take care of the rest, producing
the best physical split of the entire app under the given constraints.

In your application code, you then load the defined parts at suitable
situations, e.g. when the user opens a dialogue defined as a part,
using qooxdoo's [PartLoader](apps://apiviewer/#qx.io.PartLoader)
API. The PartLoader keeps track of which parts have already been
loaded, and provides some further housekeeping. But it is your
responsibility to "draw in" a given part at the right moment.

Consequently, the configuration of your application allows you to specify
those logical parts of your application, by giving a suitable name to
each and listing the top-level classes or class patterns for each. You
are using these part names with the PartLoader in your application code.
Further config keys allow you tailor more specifics, as mentioned above.

## Generating parts 

See [here](../configuration/compile.md#parts) on how to generate the parts using
the compiler configuration.

### Add Part Loading to your Class Code

Next, you have to add code to your application to load any part other than the
boot part. Carrying on with our example, at a suitable spot in your application
code, you have to load the *settings* part, e.g. when some "Open Settings
Dialog" button is pressed which is available from your main application class.
We put the loading action in the tap event listener of the button:

```javascript
var settingsButton = new qx.ui.toolbar.Button("Open Settings Dialog");

settingsButton.addListener("execute", function(e)
{
  qx.io.PartLoader.require(["settings"], function()
  {
    // if the window is not created
    if (!this.__settingsWindow)
    {
      // create it
      this.__settingsWindow = new custom.Settings();
      this.getRoot().add(this.__settingsWindow);
    }

    // open the window
    this.__settingsWindow.center();
    this.__settingsWindow.open();
  }, this);

}, this);
```

The main thing to note here is that upon pressing the "Open Settings Dialog"
button *qx.io.PartLoader.require* is invoked to make sure the *settings*
part will be loaded (It doesn't hurt to invoke this method multiple
times, as the PartLoader knows which parts have been loaded already).

The first argument to the *require* method is a list containing the
parts you want to be loaded (just *"settings"* in our example).
The second argument specifies the code that should be run once the
part is successfully loaded. As you can see, the *custom.Settings*
class which is loaded with this part is being instantiated.

This section also shows that you cannot run the same application with
and without parts. In order to use parts, you have to "instrument" your
application code with calls to *qx.io.PartLoader.require*, and currently
there is no way these calls can fail gracefully. You have to make a decision.
