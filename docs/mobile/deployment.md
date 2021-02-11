# Deployment

## Deploy your Mobile application

You developed a great Mobile application, and want to use or test it on your
mobile device.

For this purpose, we propose using [Apache Cordova](https://cordova.apache.org/)
.

It gives you the possibility to deploy native applications, that run the Qooxdoo
mobile JavaScript code in an wrapped native browser directly on your mobile
device. Mobile applications, created with "Apache Cordova", can be published to
the various App Stores and Marketplaces. A free distribution of Cordova is also
available, it is called "PhoneGap".

On the Cordova website you find detailed tutorials which describe the deployment
on different mobile platforms:

[Cordova Getting Started Tutorial](https://cordova.apache.org/#getstarted)

## Configure Cordova for deploying your Mobile application

After you installed cordova, and followed the introductions of  
[Cordova Getting Started Tutorial](https://cordova.apache.org/#getstarted) , you
are able to deploy your Mobile application on your mobile device.

Follow these steps:

1.  Build your application with `qx compile —-target=build`.
2.  Duplicate content of your Mobile build folder, into Cordova deploy folder
    `assets/www` including the `index.html`.
3.  Paste the following line in head part of `assets/www/index.html`:

> `<script type="text/javascript" charset="utf-8" src="cordova-1.6.0.js"></script>`

1.  Cross-check the version of the "cordova.js" in script tag, against the
    version you use.

That should do the trick. Now Cordova can deploy your Mobile application on the
connected Mobile Device. For executing the deployment, have a look on
[Cordova Getting Started Tutorial](https://cordova.apache.org/#getstarted) .

## Update application on your mobile device

If you want to update your Mobile application, you just have to copy the folders
`resource` and `script` into Cordova's deploy folder `assets/www/`. An update of
the `assets/www/index.html` is not necessary.
