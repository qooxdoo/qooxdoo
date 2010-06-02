.. _pages/migration_notes_from_07#migration_notes_from_0.7.x:

Migration Notes (from 0.7.x)
****************************

Some notes about the things to be careful during the migration of the widgets for qooxdoo 1.2.

XXX
===

.. _pages/migration_notes_from_07#simple_renamings:

Simple Renamings
----------------

* ``addEventListener()`` => ``addListener()``
* ``HorizontalBoxLayout`` => ``HBox``
* ``VerticalBoxLayout`` => ``VBox``
* ``qx.ui.core.Border`` => ``qx.ui.decoration.Single``
* ``qx.ui.widget.Iframe.getContentDocument()`` => ``qx.ui.widget.Iframe.getDocument()``
* ``createDispatchEvent()`` => ``fireEvent()``
* ``createDispatchDataEvent()`` => ``fireDataEvent()``
* ``qx.event.type.DataEvent`` => ``qx.event.type.Data``
* ``qx.core.Object.dispose()`` => ``qx.core.ObjectRegistry.shutdown()``
* ``getParent()`` => ``getLayoutParent()``
* ``qx.io.Alias`` => ``qx.util.AliasManager``
* ``qx.ui.embed.Iframe.getContentDocument()`` => ``qx.ui.embed.Iframe.getDocument()``
* ``qx.ui.embed.Iframe.getContentWindow()`` => ``qx.ui.embed.Iframe.getWindow()``
* ``qx.ui.basic.Label.setText()`` => ``qx.ui.basic.Label.setContent()``
* ``#embed`` => ``#asset``
* ``qx.application.???._postload()`` => ``qx.application.???.finalize()``
* ``qx.ui.selection.RadioManager`` => ``qx.ui.form.RadioGroup``
* ``beforeAppear`` => ``appear``

.. _pages/migration_notes_from_07#more_elaborate_changes:

More Elaborate Changes
----------------------

* ``border`` => ``decorator``
* Layout handling
* ``edge`` => ``left``, ``top``, ``right``, ``bottom``
* User agent handling

  * ``qx.core.Client.getInstance().getEngine()`` => ``qx.bom.client.Engine.NAME``

* Event handling:

  * ``qx.html.EventRegistration`` => ``qx.event.Manager``
  * ``this.dispatchEvent(new qx.event.type.DataEvent("name", eventData), true)`` => ``this.fireDataEvent("name", eventData)``

* mouse capture:

  * ``setCapture(true)`` => ``capture()``
  * ``setCapture(false)`` => ``releaseCapture()``

* ``getElement`` => ``getContainerElement().getDomElement()``
* Layout properties

 * ``_renderRuntimeXXX()`` => ``setUserBounds()`` or ``setLayoutProperties({left: 10, top: 10})``
 * ``setLeft(12)`` => ``setLayoutProperties({left: 12})`` (in Canvas and Basic layouts)
 * ``setTop(12)`` => ``setLayoutProperties({top: 12})`` (in Canvas and Basic layouts)
 * ``setRight(12)`` => ``setLayoutProperties({right: 12})`` (in Canvas and Basic layouts)
 * ``setBottom(12)`` => ``setLayoutProperties({bottom: 12})`` (in Canvas and Basic layouts)

* Tree does not generate a root folder by default anymore
* SplitPane

   * ``addLeft()``, ``addTop()``, ``addRight()``, ``addBottom()`` are removed. Use ``setFirst()`` and ``setSecond()`` to set widgets into the SplitView. The position of first and last is set by the SplitPane's orientation property.
   * ``getLeftArea()``, ``getTopArea()``, ``getRightArea()`` and ``getBottomArea()`` are removed. Use ``getFirstArea()`` and ``getSecondArea()`` instead.

*  Appearance: Some states were renamed: 

  * ``over`` => ``hovered``
  * ``focus`` => ``focused``

.. _pages/migration_notes_from_07#deprecated:

Deprecated
----------

* Positions in the appearance
* ``ClientDocument``. Use ``this.getRoot()`` in ``qx.application.Standalone`` instead.
* ``qx.util.Mime``. Use strings explicitly
* ``addToDocument()``. Use ``application.getRoot()`` instead
* ``qx.ui.SplitPaneKnob``: style Splitter and Slider to show a knob
* ``qx.ui.core.Widget.isMaterialized`` => not needed any longer
* ``qx.ui.core.ClientDocument.isMaterialized`` => not needed any longer
* ``qx.core.Version`` no longer exists

.. _pages/migration_notes_from_07#missing:

Missing
-------

* ``qx.io.local.CookieApi`` missing in 0.8 and 0.8.1 => Use native cookie handling. Releases 0.8.2 and beyong include (again) cookie handling.

