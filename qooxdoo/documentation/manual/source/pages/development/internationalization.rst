.. _pages/internationalization#internationalization:

Internationalization
********************

This page describes how to translate either a new or an existing qooxdoo-based application. It shows how to *prepare* the application, *extract* and *translate* the messages and finally *update* and *run* the translated application.

.. _pages/internationalization#prepare_the_application:

Prepare the Application
=======================

To translate an application, all translatable strings must be marked using one of the following functions:

* ``this.tr()``: translate a message
* ``this.trn()``: translate a message that supports a plural form
* ``this.trc()``: translate a message and providing a comment
* ``this.marktr()``: mark a string for translation, but do not perform any translation

You can use these methods right away for your own classes if they are derived from ``qx.ui.core.Widget`` or ``qx.application.AbstractGui``. If that's not the case you have to include the mixin qx.locale.MTranslation manually:

::

    qx.Class.define("custom.MyClass",
    {
      extend : qx.core.Object,
      include : [qx.locale.MTranslation],
      ...
    });

.. note::

    You can also use ``self`` instead of ``this`` when you use the translation features inside a closure e.g. ``self.tr()``. See `using self for closures <http://qooxdoo.org/documentation/general/javascript_best_practises#using_self_for_closures>`_ for details using ``self`` as a local variable name.

.. _pages/internationalization#example:

Example
"""""""
Change original code like this:

::

    var button = new qx.ui.form.Button("Hello World");

to:

::

    var button = new qx.ui.form.Button(this.tr("Hello World"));

In the following, the four methods are explained in more detail:

.. _pages/internationalization#tr:

tr
^^

::

    var button = new qx.ui.form.Button(this.tr("Hello World"));

Marks the string ``Hello World`` for translation and returns an instance of ``qx.locale.LocalizedString``. The ``toString()`` method of the returned object performs the actual translation based on the current locale.

There is one *exception* to the simple rule that all strings can just be replaced by wrapping them in an appropriate ``this.tr()`` function call: if init values of :doc:`dynamic properties </pages/core/understanding_properties>` are meant to be localizable, the init value has either to be set in the class constructor using ``this.tr()``, or ``qx.locale.Manager.tr()`` has to be used inside the property declaration. See documentation on :ref:`Defining an init value <pages/defining_properties#defining_an_init_value>` for details.

.. _pages/internationalization#trn:

trn
^^^

::

    var n = 2;
    var label = new qx.ui.basic.Label(this.trn("Copied one file.", "Copied %1 files.", n, n));

Translate a message but take differences between singular and plural forms into account. The first argument represents the singular form, while the second argument represents the plural form. If the third argument is 1 the singular form is chosen, if it is bigger than 1 the plural form is chosen. All remaining parameters are the inputs for the format string. 

.. _pages/internationalization#trc:

trc
^^^

::

    var n = 2;
    var label = new qx.ui.basic.Label(this.trc("Helpful comment for the translator", "Hello World"));

Translate the message as the ``tr`` method, but providing an additional comment which can be used to add some contextual information for the translator. This meanigful comment hopefully helps the translator at its work to find the correct translation for the given string.

.. _pages/internationalization#marktr:

marktr
^^^^^^

Sometimes it is necessary to mark a string for translation but not yet perform the translation.

::

    var s = this.marktr("Hello");

Marks the string ``Hello`` for translation and returns the string unmodified.

.. _pages/internationalization#format_strings:

Format Strings
^^^^^^^^^^^^^^

Since sentences in different languages can have different structures, it is always better to prefer a format string over string concatenation to compose messages. This is why the methods above all support format strings like ``Copied %1 files`` as messages and a variable number of additional arguments. The additional arguments are converted to strings and inserted into the original message. ``%`` is used as an escape character and the number following ``%`` references the corresponding additional argument.

.. _pages/internationalization#extract_the_messages:

Extract the Messages
====================

After the source code has been prepared, the desired languages of the application may be specified in ``config.json``, in the ``LOCALES`` macro within the global ``let`` section, for example

::

    "let" :
      {
        // ...
        "LOCALES"       : ["de", "fr"]
      },

This would add a German and a French translation to the project. For a more exhaustive list of available locales see `here <http://unicode.org/cldr/apps/survey>`_.

A run of 

::

    generate.py translation

will generate a ``.po`` file for each configured locale, with all translatable strings of the application (These files are usually stored in the ``source/translation`` folder of the application). 

If a specified translation does not yet exist, a new translation file will be created. In this example two files ``source/translation/de.po`` and ``source/translation/fr.po`` would be created. 

If such a file already exists, the newly extracted strings will be merged with this file, retaining all existing translations. 

Therefore, you can re-run ``generate.py translation`` as often as you want. You should re-run it at least whenever you introduced new translatable strings into the source code, so they will be added to the .po files (s. further :ref:`down <pages/internationalization#update_the_application>`).

.. _pages/internationalization#translate_the_messages:

Translate the Messages
======================

These ``.po`` files are the actual files you - or your translator ;-) - would have to edit. Since qooxdoo internally uses well-established tools and formats for internationalization (`"gettext" <http://www.gnu.org/software/gettext/>`_ via `polib <http://pypi.python.org/pypi/polib>`_), any "po"-aware editor or even a simple text editor can be used.  

Some of the programs that support manipulation of ``.po`` files are:

* `Poedit <http://www.poedit.net/>`_ (Windows, Mac OS X, Linux)
* `LocFactory Editor <http://www.triplespin.com/en/products/locfactoryeditor.html>`_ (Mac OS X)
* `KBabel <http://kbabel.kde.org/>`_ (Linux)

.. _pages/internationalization#update_the_application:

Update the Application
======================

After editing and saving the ``.po`` files, the next ``generate.py source`` run integrates the translations into your application's source version. To get the effect of the new translations it can simply be reloaded in your browser.

If the source code changes, e.g. by adding, removing or changing translatable strings, it can be merged with the existing translation files just by calling ``generate.py translation`` again. Moreover, each ``generate.py source`` - or ``generate.py build`` if you are about to deploy your application - will pick up all current translatable strings from the source files and will merge them on the fly with the information from the .po files, using the result for the corresponding build job. This way, the generated application always contains all current translatable strings (But of course only those from the .po files can have actual translations with them).

.. _pages/internationalization#run_the_translated_application:

Run the translated Application
==============================

By default the application tries to use the browser's default language. You can change the language of the application by using ``qx.locale.Manager``. For example, the following sets the language of the application to French:

::

    qx.locale.Manager.getInstance().setLocale("fr");

The qooxdoo widgets are supposed to update their contents on a locale change. Custom widgets may have to be modified to allow for an update on locale change. To inform the application of a language change, qooxdoo fires a ``changeLocale`` event.

A widget that needs custom update logic may listen to this event:

::

    qx.locale.Manager.getInstance().addListener("changeLocale", this._update, this);

