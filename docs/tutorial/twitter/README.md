Tutorial: Tweets App
======================

This tutorial covers many practical aspects of developing desktop-like qooxdoo apps.

As the headline of this tutorial says, we are building a simple tweets application. 

[Twitter](http://twitter.com) itself made its authorization scheme more complex, as it started requiring OAuth even to read public tweets. For this basic tutorial it would be too complex to handle such advanced authorization. If your are interested in OAuth, check out how you could handle that in a qooxdoo app by looking at the [Github demo](apps://demobrowser/#data~Github.html).

So we decided to provide a simple example which dellivers some static text.

```javascript
callback([
  {
    text: "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore", 
    user: {profile_image_url : "http://www.gravatar.com/avatar/7c366401a0b7a57c50e5c38913ddc135.png"},
    created_at: 1373541470150
  },
  {
    text: "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam", 
    user: {profile_image_url : "http://www.gravatar.com/avatar/00000000000000000000000000000000.png"},
    created_at: 1373541361356
  },
  {
    text: "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor", 
    user: {profile_image_url : "http://www.gravatar.com/avatar/74e78850f9d01ddce817dd5f83f3ac0d.png"},
    created_at: 1373541270150
  }
]);
```


The following mockup shows you how the application should look at the end.

![image](identicamockup1.png)

If you take a closer look at the mockup, you see a window  containing a toolbar, a list, a text area and a button to post messages. This should cover some common scenarios of a typical qooxdoo application.

In the first part you'll learn how to create a new application and how to build a part of the main UI.

1. [Getting Started](tutorial-part-1.md)
2. [Finishing the UI](tutorial-part-2.md)
3. [Talking to the Server](tutorial-part-3.md)
4. [Handling Forms](tutorial-part-4.md)
5. [Creating Custom Widgets](tutorial-part-5.md)
6. [Theming Widgets](tutorial-part-6.md)
7. [Translations](tutorial-part-7.md)
8. [Unit Testing](tutorial-part-8.md)
9. [Virtual Lists](tutorial-part-9.md)
