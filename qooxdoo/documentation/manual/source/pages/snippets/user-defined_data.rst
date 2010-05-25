.. _pages/snippets/user-defined_data#user-defined_data:

User-defined data
*****************

Storing any arbitrary value in a qooxdoo object.

You can store arbitrary user-defined data in any qooxdoo object using the ``setUserData`` and ``getUserData`` methods. These are guaranteed not to conflict with qooxdoo or javascript properties of the object. Note that as qooxdoo events are derived from ``qx.event.type.Event`` which extends ``qx.core.Object``, you can store user-defined data in events as well.

For example:

::

    MyObject.setUserData("MyData", "123");
    MyObject.debug("MyData = " + MyObject.getUserData("MyData"));

