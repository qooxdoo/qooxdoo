.. _pages/tool/translation/po_format:

The Format of PO Files
======================= 

This is a condensed (and rather %{qooxdoo}-slanted) version of the official `PO file format <http://www.gnu.org/software/gettext/manual/gettext.html#PO-Files>`__ description. Not all features described here are tested to work with current %{qooxdoo}.

.po files are made up of entries. The first entry is usually used to maintain meta-data, the other entries contain message id's and their translations.

A simple example:

::

    # A simple .po file
    msgid ""
    msgstr ""
    "Project-Id-Version: 1.0\n"
    "Report-Msgid-Bugs-To: you@your.org\n"
    "POT-Creation-Date: 2012-08-28 17:19+0100\n"
    "PO-Revision-Date: 2012-08-28 17:19+0100\n"
    "Last-Translator: you <you@your.org>\n"
    "Language-Team: Team <yourteam@your.org>\n"
    "MIME-Version: 1.0\n"
    "Content-Type: text/plain; charset=utf-8\n"
    "Content-Transfer-Encoding: 8bit\n"

    msgid "This field is required."
    msgstr "Este campo es obligatorio."


Each entry has the following structure::

     #  translator-comments
     #. extracted-comments
     #: reference...
     #, flag...
     #| msgid previous-untranslated-string
     msgctxt context
     msgid untranslated-string
     msgstr translated-string

or

::

     # an entry with plural forms
     #, range: 0..10
     msgid untranslated-string-singular
     msgid_plural untranslated-string-plural
     msgstr[0] translated-string-case-0
     ...
     msgstr[N] translated-string-case-n

White-space and all comments are optional. Dangling white space or comments (after the last entry) should be avoided. Explanations of the various lines:

* **'# '** : (``#`` and at least one white space). Comments like this are usually maintained by the person editing the po file, e.g the translator.

* **'#.'**: These are comments provided by developers in source code, usually aimed at the translator, and are automatically extracted by tools into the po file. (All comments starting with ``#`` and some non-white character are considered "automatic comments" which are in some way manipulated by tools).

* **'#:'**: Here appear comma-separated occurrences of this msgid in source code, e.g. like ``#: src/msgcmp.c:338 src/po-lex.c:699``; extracted by tools.

* **'#,'**: *flag...* is a comma-separated list of a number of pre-defined keywords, like ``fuzzy, range, c-format, no-python-format, ...``. These flags can both be provided by humans as well as tools, and inform further tool processing (e.g. when checking validity of msgid and translations).

* **'#|'** : Comments starting with this indicator keep previous values of this entry, e.g. ``"#| msgid previous-untranslated-entry"`` or ``"#| msgctxt previous-context"``. Only provided by tools under certain circumstances (e.g. fuzzy matching).

* **'msgid'** : The message id, the key for this entry. *msgid* and one of the *msgstr* forms are the only mandatory lines for each entry. *msgid*'s are extracted from source files by tools. 

  For the untranslated-string the following constraints apply (the same holds for the translated-strings, e.g. with ``msgstr``):

  * The string follows C syntax. It has to start on the same line as the *msgid* keyword.
  * It is enclosed by double quotes.
  * It allows embedded escape ("control") sequences: ``\n, \t, \\, \"``
  * The string can optionally be broken across multiple lines. These parts are concatenated without space to make up the actual value. The line with *msgid* must at least contain an empty part. This is independent of embedded ``\n`` escapes. Example::
    
      msgid ""
      "This is the start "
      "and this is the end."

* **'msgid_plural'** : The plural form of the message id.

* **'msgstr'** : The translation of the message id. 

* **'msgstr[<num>]'** : Translations depending on singular/plural forms (some languages differentiate if the plural is actually exactly 2, 3, or more concrete numbers of the involved entities; e.g. the translation for "two houses" might differ from the translation of "three houses"). *msgstr[0]* represents the singular translation. The source code needs to provide the desired number to pick the right translation at runtime. For these kinds of plural forms the ``"#, range: min..max"`` flag can be used to instruct the translator how big *N* can be.

* **'msgctxt'** : A context word for the msgid, e.g. a module/package/component name. This is used to disambiguate entries with *the same msgid* within a single .po file. An empty string for *context* is different from a missing *msgctxt*  line. Has to be provided by the developer of the source code. *(This entry introduces extra complexity, so try to avoid)*.

