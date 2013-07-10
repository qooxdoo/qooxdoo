.. _pages/mobile/resolution#resolution:

Handling High Resolution Images 
*******************************

%{Mobile} is able to handle device displays with different pixel densities.
The following device pixel ratios are common on mobile devices:

* iOS
    * 1
    * 2 ("Retina") 
* Android
    * 1 (mdpi)
    * 1.5 (hdpi)
    * 2 (xhdpi)
    * 3 (xxhdpi) 

When you use ``qx.ui.mobile.basic.Image`` and %{Mobile} detects that your app is running 
on a device with a device pixel ratio greater than 1, the app searches for images in a high resolution.

The high resolution images are assumed to be located in the same folder as the 
medium resolution image, but annotated with the pixel ratio before the file extension: 

``<filename>@<devicePixelRatio><fileextension>``

Example
-------

Assumed the medium resolution image (mdpi) is located in the folder:
``/<APP_NAME>/client/source/resource/<APP_NAME>/icon/image.png``

The higher pixel ratio versions are expected to be placed in the same folder and named like this:

* hdpi: ``image@1.5x.png``
* xhdpi: ``image@2x.png``
* xxhdpi: ``image@3x.png``

Fallback
--------

For the best visual result possible %{Mobile} uses this fallback 
logic:

1. The logic first checks if there is an image available with the pixel ratio
   the environment variable ``device.pixelRatio`` returns.

2. If no image is available it checks the pixel ratio versions in the following order: 

``@3x``, ``@2x``, ``@1.5x``

3. If there is no high resolution image available, the medium resolution image will be shown.
