.. _pages/mobile/deployment#deployment:

Deployment 
**********

Deploy your %{Mobile} application
=================================

You developed a great %{Mobile} application, and want to use or test it on your mobile device.

For this purpose, we propose using `Apache Cordova`_.

It gives you the possibility to deploy native applications, that run the qooxdoo mobile JavaScript code in an wrapped native browser, in the App Stores or directly on your mobile device. A free distribution of Cordova is also available, it is called "PhoneGap". 

On Cordova website you find detailed tutorials available which describe the deployment on different mobile platforms:

`Cordova Getting Started Tutorial`_

Configure Cordova for deploying your %{Mobile} application
==========================================================

After you installed cordova, and followed the introductions of `Cordova Getting Started Tutorial`_, you are able  
to deploy your %{Mobile} application on your mobile device. 

Follow these steps:

#. Build your application with ``generate.py build``.

#. Duplicate content of your %{Mobile} build folder, into Cordova deploy folder ``assets/www`` including the ``index.html``.

#. Paste the following line in head part of ``assets/www/index.html``:

``<script type="text/javascript" charset="utf-8" src="cordova-1.6.0.js"></script>``

4. Cross-check the version of the "cordova.js" in script tag, against the version you use.

That should do the trick. Now Cordova can deploy your %{Mobile} application on the 
connected Mobile Device. For executing the deployment, have a look on `Cordova Getting Started Tutorial`_. 

Update application on your mobile device
========================================

If you want to update your %{Mobile} application, you just have
to copy the folders ``resource`` and ``script`` into Cordova's deploy folder ``assets/www/``. 
An update of the ``assets/www/index.html`` is not necessary.

.. _Apache Cordova: http://incubator.apache.org/cordova/
.. _Cordova Getting Started Tutorial: http://docs.phonegap.com/en/1.6.1/guide_getting-started_index.md.html#Getting%20Started%20Guides
