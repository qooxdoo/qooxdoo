.. _pages/mobile/resolution#resolution:

Handling devices with a high pixel density
******************************************

%{Mobile} applications are able to adapt to device displays with a high pixel density.
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

You can adjust the scale factor of your %{Mobile} application.
This feature lets you adapt your application to the usability needs of your target audience, and
makes it possible to scale it to the display specifications of your target devices.

You justify the value through the method ``setScaleFactor`` on ``qx.ui.mobile.core.Root``:

::

  qx.core.Init.getApplication().getRoot().setScaleFactor(2);

First image shows a scale factor set to value ``0.5`` and second set to ``1.5``:

.. image:: resolution-50.png
    :scale: 50%


.. image:: resolution-150.png
    :scale: 50%

Trigger for High Resolution Image Handling
------------------------------------------

The application calculates the best image resolution (the optimal ratio) for your display and the used application scale factor:

::

  optimalRatio = scaleFactor * devicePixelRatio


If the ``optimalRatio`` is above ``1``, %{Mobile} searches for high resolution images and calculates which resolution fits the best.

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
%{Mobile} checks for the most common image resolution sizes:

* ``@3x``
* ``@2x`` 
* ``@1.5x``

You can adjust the pixel ratio checks by modifying this static array:

``qx.ui.mobile.basic.Image.PIXEL_RATIOS``

For the best visual result %{Mobile} uses a fallback logic:

1. The logic searches for an image with a higher resolution, which is the nearest to the optimal ratio. 

2. The logic searches for an image with a lower resolution, which is the nearest to to the optimal ratio.

3. If no high resolution image could be found, the medium resolution image is displayed.
