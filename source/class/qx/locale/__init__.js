/**
 * This package provides support for internationalization (*I18N*) and
 * localization (*L10N*).
 *
 * I18N is usually concerned with providing an application in multiple
 * languages, i.e. a key point is to provide translations for user visible
 * strings (labels, messages, help texts, ...) and select the right set of
 * strings for a given language.
 *
 * L10N is concerned with adapting the visual display of common units (calendar
 * items like day and month names, date formatting, number formatting, keyboard
 * key names, ...) to regional preferences.
 *
 * There is a coupling between the two, hence <i>locale</i> names usually
 * consist of a language part and a region part, as e.g. in <code>en_US</code>
 * or <code>de_AT</code>. qooxdoo's locale system is oriented towards the
 * Unicode.org <a href="http://cldr.unicode.org">CLDR</a> system, so both I18N
 * and L10N data is organized according to locales.  That means selecting a
 * certain locale in an application will try to pick a corresponding set of
 * translations as well as regional settings.
 *
 * <h3> Translations </h3>
 *
 * The important step in providing multiple translations for an application is
 * marking strings in the code for translation. This is easily done by wrapping
 * those strings in one of several translation marker calls like {@link
 * qx.locale.MTranslation#tr .tr()}. Those are available e.g. on each class that
 * extends from {@link qx.ui.core.Widget Widget} or {@link
 * qx.application.AbstractGui AbstractGui} (via {@link qx.locale.MTranslation
 * MTranslation}), so you can use them on your application classes right away.
 *
 * <pre class='javascript'>
 * var label = new qx.ui.basic.Label(this.tr("News * section"));
 * </pre>
 *
 * In the simple case calls like <code>this.tr()</code> above will return the
 * translation of the argument according to the currently selected locale if
 * available. If the <code>qx.dynlocale</code> {@link qx.core.Environment
 * Environment} setting has value *true* such calls will return an instance of
 * {@link qx.locale.LocalizedString LocalizedString} instead. LocalizedString
 * behaves like a string in many situations, but allows switching to yet another
 * locale at a later time (normal strings are fixed once returned from the
 * *this.tr()* call).
 *
 * The {@link qx.locale.Manager Manager} class allows switching between locales.
 *
 * <h3> Localization </h3>
 *
 * The other classes in this namespace, like {@link qx.locale.Date Date}, {@link
 * qx.locale.Key Key} or {@link qx.locale.Number Number}, encapsulate regional
 * preferences for formatting and other properties with regard to such data.
 *
 * For more information about how to deploy I18N and L10N in qooxdoo
 * applications see the corresponding
 * <a href="http://qooxdoo.org/docs/#development/howto/internationalization.md">
 * manual section</a>.
 */
