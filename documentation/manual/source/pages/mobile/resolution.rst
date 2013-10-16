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

Application Scale Factor vs. Device Pixel Ratio
-----------------------------------------------

As mentioned in the theming chapter, %{Mobile} is able to adjust the scale factor of your application:

::

  qx.core.Init.getApplication().getRoot().setScaleFactor(2);


If you scale the application up, %{Mobile} detects which image has the best resolution according to the 
device pixel ratio and the used application scale factor.

Trigger for High Resolution Image Handling
------------------------------------------

The application calculates the optimal ratio for your display and application scale:

::
  
  var scaleFactor = qx.core.Init.getApplication().getRoot().getScaleFactor();
  var devicePixelRatio = qx.core.Environment.get("device.pixelRatio");

  var optimalRatio = scaleFactor * devicePixelRatio;


If the ``optimalRatio`` is above ``1``, the app searches for images in a higher resolution version.

Location and naming conventions
-------------------------------

The high resolution images are assumed to be located in the same folder as the 
medium resolution image, but annotated with the pixel ratio before the file extension: 

``<filename>@<devicePixelRatio>.<fileextension>``

Example
-------

Assume the following medium resolution image (mdpi) is part of your project's resources:
``source/resource/<APP_NAME>/icon/image.png``

Its higher pixel ratio versions are to be put into the same folder as the regular image and be named accordingly:

* hdpi: ``image@1.5x.png``
* xhdpi: ``image@2x.png``
* xxhdpi: ``image@3x.png``

If devicePixelRatio returns ``1.5`` and your application scale factor is ``2``, the
best image resolution would be ``3x``.

The application displays the source ``image@3x.png``.

Fallback
--------
%{Mobile} checks for 3 image resolution sizes:

* ``@3x``
* ``@2x`` 
* ``@1.5x``

You can adjust the pixel ratio checks by modifying this static array:

``qx.ui.mobile.basic.Image.PIXEL_RATIOS``

For the best visual result %{Mobile} uses a fallback logic:

1. The logic searches for an image with a higher resolution, which is the nearest to the optimal ratio. 

2. The logic searches for an image with a lower resolution, which is the nearest to to the optimal ratio.

3. If no high resolution image could be found, the medium resolution image is displayed.
