# Getting Started with Qooxdoo Mobile

Working with Mobile requires downloading and using Qooxdoo's compiler tolchain. See
here for the [Qooxdoo requirements](../README.md), and
follow its *Installation and Setup* section. This requirement applies
to the development phase only, the final app is independent of the SDK.

The first step is to create a mobile skeleton:

    qx create helloworld  -type mobile -I 

A new folder "helloworld" will be created next to the qooxdoo folder,
containing the mobile skeleton application. Right now the application is
pretty useless, until we create the `source` version of it. Navigate to the
created folder and call the qooxdoo compiler with the following command:

    qx compile

After a few seconds the generator has analyzed all class dependencies and
created a source version of the application. You can test the application by
opening the `source/index.html` file in your Chrome / Safari browser. You should
see a page "Page 1" with a button "Next Page". When you tap on the button, the
next page "Page 2", with a "Back" button in the upper left corner, is displayed.

**Congratulations, you have just created your first qooxdoo mobile application!**

Now it is your turn. Just open `source/class/helloworld/Application.js`
and enhance your cross-platform mobile application.

If you need a more detailed tutorial, please
have a look at our mobiletweets tutorial:

[Mobile Tweets Client Tutorial](tutorial.md)
