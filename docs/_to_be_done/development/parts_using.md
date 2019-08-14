Using Parts
===========

> Generating parts has changed, see [here](../configuration/compile.md#parts)


### Add Part Loading to your Class Code

Next, you have to add code to your application to load any part other than the
boot part. Carrying on with our example, at a suitable spot in your application
code, you have to load the *settings* part, e.g. when some "Open Settings
Dialog" button is pressed which is available from your main application class.
We put the loading action in the tap event listener of the button:

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

The main thing to note here is that upon pressing the "Open Settings Dialog"
button *qx.io.PartLoader.require* is invoked to make sure the *settings* part
will be loaded (It doesn't hurt to invoke this method multiple times, as the
PartLoader knows which parts have been loaded already).

The first argument to the *require* method is a list containing the parts you
want to be loaded (just *"settings"* in our example). The second argument
specifies the code that should be run once the part is successfully loaded. As
you can see, the *custom.Settings* class which is loaded with this part is being
instantiated.

This section also shows that you cannot run the same application with and
without parts. In order to use parts, you have to "instrument" your application
code with calls to *qx.io.PartLoader.require*, and currently there is no way
these calls can fail gracefully. You have to make a decision.

