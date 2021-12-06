# Qooxdoo on the Server

Qooxdoo applications are not just limited to use in a web browser or mobile, they 
can also be used in Node.JS and Rhino.

The only thing you need to do is edit your `compile.json` and add a new entry in the
`applications` array for your server app, and set the `type` to `"node"`.

In the example below, there are two applications - one for browser application, and 
one for running in node:

```json5
{
    /** Applications */
    "applications": [
        {
            "class": "demoapp.Application",
            "theme": "demoapp.theme.Theme",
            "name": "demoapp"
        },
        {
            "class": "demoapp.ServerApplication",
            "name": "serverapp",
            "type": "node"
        }
    ],
```

After successfully running `qx compile` you will be able to run `node ./compiled/source/serverapp/index.js`

That's all there is to it - you can use `require` and all the normal features of Node.JS, just with
the Qooxdoo framework automatically integrated.