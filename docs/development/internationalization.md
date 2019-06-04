Internationalization
====================

We define internationalization (a.k.a. *"I18N"*) as composed of two distinct areas:

**Localization**  
Adapting software to suit regional customs regarding date, time and number formatting, names for time units, countries, languages and so forth.

**Translation**  
Translating user-visible strings in software, like labels on buttons, pop-up messages, headings, help texts, and so forth.

Localization largely relies on approved standards that are in use in any given regional and/or cultural area, and can therefore take advantage of standardized data and information. Translation is much more application-specific, and the relevant strings of an application have to be translated in any target language individually.

Localization
------------

Localization is the effort of displaying data in a way that conforms to regional and/or cultural habits. This mostly affects data of everyday life: monetary currencies, names and display formats used in dates and time, number formats and naming conventions in general (e.g. names of countries and languages in the world), to list the most common use cases. Writing a date as 01/31/1970 rather than 1970/01/31, or starting the week with Sunday rather than Monday fall in this category.

A coherent set of these conventions taken together is usually referred to as a [locale](http://en.wikipedia.org/wiki/Locale), and they are signified by a country code or some derivative thereof. *en*, *en\_US* and *en\_UK* for example signify three distinct locales that are used in English speaking countries. The understanding is that there is a sort of inheritance relation between more general and more specific locales, so that e.g. *en\_US* only needs to specify the items in which it deviates from the more general *en* locale, and relies on the *en* settings for all other on which they agree. For historical reasons there is a common "ancestor" to all locales which is called *C*. If not specified all locale settings fall back to those given in *C* (which is mostly a copy of *en*). qooxdoo supports this fall-back chain of locale settings by looking up a specific item e.g first in *en\_US* (if that were the current locale), then *en* and then in *C*.

To support such regional settings, qooxdoo uses data from the CLDR project, the *"Common Locale Data Repository"*, which collects data for known locales in a set of XML files. See the project's [home page](http://cldr.unicode.org) and [terms of use](http://www.unicode.org/copyright.html).

Translation
-----------

While translating a sentence from one human language into another is still a task mostly done by humans, qooxdoo tries to provide tools to help in managing this process. This section describes how to translate either a new or an existing qooxdoo-based application. It shows how to *prepare* the application, *extract* the messages that shall be translated, and finally *update* and *run* the translated application.

### Prepare the Application

To translate an application, all translatable strings must be marked using one of the following functions:

-   `this.tr()`: translate a message
-   `this.trn()`: translate a message that supports a plural form
-   `this.trc()`: translate a message and providing a comment
-   `this.trnc()`: translate a message that supports a plural form and providing a comment
-   `this.marktr()`: mark a string for translation, but do not perform any translation

You can use these methods right away for your own classes if they are derived from `qx.ui.core.Widget` or `qx.application.AbstractGui`. If that's not the case you have to include the mixin `qx.locale.MTranslation` manually:

    qx.Class.define("custom.MyClass",
    {
      extend : qx.core.Object,
      include : [qx.locale.MTranslation],
      ...
    });

#### Example

Change original code like this:

    var button = new qx.ui.form.Button("Hello World");

to:

    var button = new qx.ui.form.Button(this.tr("Hello World"));

Following, the four methods are explained in more detail:

#### tr

Example:

    var button = new qx.ui.form.Button(this.tr("Hello World"));

*tr* marks the string `"Hello World"` for translation (This string is often referred to as the *message id*, as it serves as the lookup key for any provided translation). This means that the string itself will be extracted when the appropriate generator job is run (see further
\<pages/internationalization\#extract\_the\_messages\>). During application run time, *tr* returns the translation of the given string *under the current locale*. That means, the actual string you get at this point in time depends on the locale in effect. If, on the other hand, the environment setting qx.dynlocale \<pages/core/environment\#environment\> is set to "true", *tr* returns an instance of `qx.locale.LocalizedString`. The `toString()` method of the returned object performs the actual translation based on the current locale. This has the advantage that later changes to the locale (see further \<pages/internationalization\#run\_the\_translated\_application\>) are immediately reflected in the widgets using this object, as most know how to handle and re-evaluate LocalizedString's. But you only need that setting if you plan to support locale switching during run time.

If the string given to *tr* does not have a translation under the current locale, the string itself will be returned.

There is one exception to the simple rule that all strings can just be replaced by wrapping them in an appropriate `this.tr()` function call: If init values of dynamic properties \</pages/core/understanding\_properties\> are meant to be localizable, the init value has either to be set in the class constructor using `this.tr()`, or `qx.locale.Manager.tr()` has to be used inside the property declaration. See documentation on Defining an init value
\<pages/defining\_properties\#defining\_an\_init\_value\> for details.

#### trn

Example:

    var n = 2;
    var label = new qx.ui.basic.Label(this.trn("Copied one file.",
    "Copied %1 files.", n, n));

Like *tr*, translates a message but takes differences between singular and plural forms into account. The first argument represents the singular form while the second argument represents the plural form. If the third argument is 1 the singular form is chosen, if it is bigger than 1 the plural form is chosen. All remaining parameters are the inputs for the format string.

#### trc

Example:

    var label = new qx.ui.basic.Label(this.trc("Helpful comment for the
    translator", "Hello World"));

Translates the message as the *tr* method, but provides an additional comment which can be used to add some contextual information for the translator. This meaningful comment should help the translator to find the correct translation for the given string.

#### trnc

Example:

    var n = 2;
    var label = new qx.ui.basic.Label(this.trnc("Helpful comment for
    translator", "Copied one file.", "Copied %1 files.", n, n));

Combines *trc* with *trn*, i.e. same as *trn* but first argument is comment.

#### marktr

Sometimes it is necessary to mark a string for translation but not yet perform the translation. Example:

    var s = this.marktr("Hello");

Marks the string `Hello` for translation and returns the string unmodified.

#### Format Strings

Since sentences in different languages can have different structures, it is always better to prefer a format string over string concatenation to compose messages. This is why the methods above all support format strings like `Copied %1 files` as messages and a variable number of additional arguments. The additional arguments are converted to strings and inserted into the original message. `%` is used as an escape character and the number following `%` references the corresponding additional argument.

### Extract the Messages

After the source code has been prepared, the desired languages of the application may be specified in `config.json`, in the `LOCALES` macro within the global `let` section, for example

    "let" :
      {
        // ...
        "LOCALES"       : ["de", "fr"]
      },

This would add a German and a French translation to the project. For a more exhaustive list of available locales see [here](http://unicode.org/cldr/apps/survey).

A run of

    generate.py translation

will generate a `.po` file for each configured locale, with all translatable strings of the application (These files are usually stored in the `source/translation` folder of the application).

If a specified translation does not yet exist, a new translation file will be created. In this example two files, `source/translation/de.po` and `source/translation/fr.po`, would be created.

If such a file already exists, the newly extracted strings will be merged with this file, retaining all existing translations. Therefore, you can re-run `generate.py translation` as often as you want. You should re-run it at least whenever you introduced new translatable strings into the source code, so they will be added to the .po files (see further
\<pages/internationalization\#update\_the\_application\>).

### Translate the Messages

These `.po` files are the actual files you - or your translator ;-) - would have to edit. Since qooxdoo internally uses well-established tools and formats for internationalization ([GNU gettext](http://en.wikipedia.org/wiki/GNU_gettext) via [polib](http://pypi.python.org/pypi/polib)), any "po"-aware editor or even a simple text editor can be used.

Some of the programs that support manipulation of `.po` files are:

-   [Poedit](http://www.poedit.net/) (Windows, Mac OS X, Linux)
-   [LocFactory Editor](http://www.macupdate.com/app/mac/16246/locfactory-editor) (Mac OS X)
-   [Lokalize](http://l10n.kde.org/tools/) (Linux)
-   [Gtranslator](http://projects.gnome.org/gtranslator/) (Linux)

If you want to know more about the details of `.po` files, see pages/tool/translation/po\_format.

### Update the Application

After editing and saving the `.po` files, the next `generate.py source` run integrates the translations into your application's source version. To get the effect of the new translations it can simply be reloaded in your browser.

If the source code changes, e.g. by adding, removing or changing translatable strings, it can be merged with the existing translation files just by calling `generate.py translation` again. Moreover, each `generate.py source` - or `generate.py build` if you are about to deploy your application - will pick up all current translatable strings from the source files and will merge them on the fly with the information from the .po files, using the result for the corresponding build job. This way, the generated application always contains all current translatable strings (But of course only those from the .po files can have actual translations with them).

### Run the translated Application

By default qooxdoo tries to use the browser's default language as its locale. You can change the language of the application by using `qx.locale.Manager`. For example, the following sets the language of the application to French:

    qx.locale.Manager.getInstance().setLocale("fr");

The qooxdoo widgets are supposed to update their contents on a locale change. Custom widgets may have to be modified to allow for an update on locale change. To inform the application of a language change, qooxdoo fires a `changeLocale` event.

A widget that needs custom update logic may listen to this event:

    qx.locale.Manager.getInstance().addListener("changeLocale",
    this._update, this);
