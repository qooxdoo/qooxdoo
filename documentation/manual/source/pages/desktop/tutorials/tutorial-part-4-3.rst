.. _pages/desktop/tutorials/tutorial-part-4-3#tutorial_part_4.3:_translation:

Tutorial Part 4.3: Translation
******************************

We've already covered quite a few of qooxdoo's features to get to this point. In this tutorial, we want to :doc:`internationalize </pages/development/internationalization>` the twitter client. Additionally, we want to add a preferences dialog allowing users to change the language during runtime. Adding a window containing a form should be familiar to you if you've read the :doc:`form handling tutorial <tutorial-part-4-1>`

.. _pages/desktop/tutorials/tutorial-part-4-3#the_plan:

The plan
========
The first step is to make the application aware of localization. We need to identify all the strings which need to change on a language change. After that, we need to create translations for our initial string set. After that is done, we can add a window containing a radio group with all available language options.

.. _pages/desktop/tutorials/tutorial-part-4-3#identifying_string_to_translation:

Identifying strings to translate
================================

Now we can benefit from the good design of our application. We put all the view code in our main window which means that's the spot we need to look for strings. Here we can identify the following strings:

::

  var reloadButton = new qx.ui.toolbar.Button("Reload");
  // ...
  reloadButton.setToolTipText("Reload the tweets.");
  // ...
  this.__textarea.setPlaceholder("Enter your message here...");
  // ...  
  var postButton = new qx.ui.form.Button("Post");
  // ...  
  postButton.setToolTipText("Post this message on twitter.");
  
qooxdoo offers a handy way to tell both the JavaScript code and the generator which strings need to be translated. Wrapping the strings with ``this.tr()`` will mark them as translatable strings. That should be an easy task:

::

  var reloadButton = new qx.ui.toolbar.Button(this.tr("Reload"));
  // ...
  reloadButton.setToolTipText(this.tr("Reload the tweets."));
  // ...
  this.__textarea.setPlaceholder(this.tr("Enter your message here...");)
  // ...  
  var postButton = new qx.ui.form.Button(this.tr("Post"));
  // ...  
  postButton.setToolTipText(this.tr("Post this message on twitter."));


.. _pages/desktop/tutorials/tutorial-part-4-3#generating_the_translation_files:

Generating the translation files
================================

For the next step, we need to tell the generator what languages we want to support. But why does the generator or the tool chain in general care about that? The tool chain will help us by generating the files necessary for the translation. So we need to edit the config.json file located at the root folder of our application, which is the configuration file for the tool chain. As you can see, this is a plain JSON file which holds some predefined configuration data for the tool chain. You will find a ``let`` section holding a ``LOCALES`` key. This key has an array as value holding exactly one locale named ``en``, right? In this example, I want to add a translation set for German so I need to add ``de`` to this array.

::
  
  "LOCALES"      : [ "en" , "de" ],
  
Now we are set up to generate our translation files. For that, just invoke the generator with its translation job.

::

  ./generate.py translation

This will go through all the steps necessary to generate the translation files. But what are translation files anyway? Take a look at the folder ``source/translation``. There you'll find the created files which as you'll see end with ``.po``. You may be familiar with that file format from `GNU gettext <http://en.wikipedia.org/wiki/GNU_gettext>`_ which is quite popular.

You should see two files, one for the default language, English (``en.po``), and one for the language you added, in my case German (``de.po``). For now, we just need the file for our alternative language because English is already used in the application so this should work right out of the box. Opening the second file, you'll notice some details about it at the top of the document. The important part starts with the following text.

::

  #: twitter/MainWindow.js:30
  msgid "Reload"
  msgstr ""
  
The first line is a comment, which is a hint containing the class file and line number where the string is used. The second line holds the identifier we used in our application. The third line currently holds an empty string. This is the place where the translation should go for that specific string.

You may have already realized that the rest of the file is a list of blocks similar to this one. Now you should translate all strings and add them in the right spots.

.. _pages/desktop/tutorials/tutorial-part-4-3#give_it_a_try:

Give it a try
=============

After adding these translations, we should rebuild the application using ``./generate.py`` and load it in any browser. If your browser uses the locale you added by default, you should already see the application in the new language. If not, just tell qooxdoo's locale manager to switch the locale using e.g. the Firebug console.

:: 

  qx.locale.Manager.getInstance().setLocale("de"); // or the locale you added
  
If you added a language like German in which most words are longer than in English, you may recognize that we made a mistake in our main window. ``postButton.setWidth(60);`` may cut off the text in the button because we set the width explicitly. Changing that to ``postButton.setMinWidth(60);`` will keep the layout flexible for different content sizes.


.. _pages/desktop/tutorials/tutorial-part-4-3#adding_the_preferences_window:

Adding the preferences window
=============================

As you should already be familiar with creating new classes and subclassing a window from the :doc:`form handling tutorial <tutorial-part-4-1>`, we won't go into any detail about that again. Just add a new class, subclass the window and override the constructor.

:: 

  qx.Class.define("twitter.SettingsWindow", 
  {
    extend : qx.ui.window.Window,
  
    construct : function()
    {
      this.base(arguments, this.tr("Preferences"));
      // ... more to come
    }
  });
  
As you can see here, we added another string: The window's caption, which should be translated as well. Keep in mind that you have to use ``this.tr()`` on every string you add and want to have in your translation file.

For the next step, we need to fill the window with controls. As in the form example, we use a basic layout, a form and some form elements. Add the following line to your constructor.

:: 

  this.setLayout(new qx.ui.layout.Basic());
  
  var form = new qx.ui.form.Form();
  var radioGroup = new qx.ui.form.RadioButtonGroup();
  form.add(radioGroup, this.tr("Language"));

  // TODO: create a radio button for every available locale
  
  var renderer = new qx.ui.form.renderer.Single(form);
  this.add(renderer);
  
This code should be familiar to you except for the ``RadioButtonGroup``, which is a container for radio buttons. It also makes sure that only one of the buttons is selected at any time. So we don't need to take care of that ourselves. Again, we use a translated string as the label for the radio buttons.

The next step is to access all available locales and the currently set locale. For that, qooxdoo offers a locale manager, as you'll see in the following code part.

:: 

  var localeManager = qx.locale.Manager.getInstance();
  var locales = localeManager.getAvailableLocales();
  var currentLocale = localeManager.getLocale();
  
It is pretty easy to get this kind of information. You surely know how to continue from here, but before that, I'll show you a little trick. We want to keep the name of the selectable language in the translation file itself. That's a good place to keep that string because otherwise, we would need a mapping from the locale (e.g. en) to its human readable name (e.g. English). Instead we'll, add a special translation key to our application.

::
  
  // mark this for translation (should hold the langauge name)
  this.marktr("$$languagename");
  
We will use this key as the label for our radio buttons and then go on, as you would have expected, with a loop for all available locales.

:: 

  // create a radio button for every available locale
  for (var i = 0; i < locales.length; i++) {
    var locale = locales[i];     
    var languageName = localeManager.translate("$$languagename", [], locale);
    var localeButton = new qx.ui.form.RadioButton(languageName.toString());
    // save the locale as model
    localeButton.setModel(locale);
    radioGroup.add(localeButton);
    
    // preselect the current locale
    if (currentLocale == locale) {
      localeButton.setValue(true);
    }    
  };
  
This code contains the rest of the trick. But let's take a detailed look at what we're doing here. The first line of the loop just stores the current locale we want to process. Keep in mind that this is the exact value we need to change the locale later. The second line tells the locale manager to translate the special id we set for the language name using the current locale. This will return a ``LocalizedString`` which is important to know because these strings update their content on locale switch. But that's not what we want because otherwise, every language will have the same name. Thats why we use the ``toString()`` method to get the plain string of the current translated value as the label for the new radio button. With that, we exclude the labels for the radio buttons from being translated. The next two tasks are pretty easy: 1) we store the locale as the model of the radio button and 2) we add the radio button to the radio group. Preselecting the currently set locale is really easy as well.

The last thing missing in the window is changing the locale if the user selects a new radio button. For that, we stored the locales in the model property. We can now use the ``modelSelection`` of the radio button group to react on changes.

:: 

  // get the model selection and listen to its change
  radioGroup.getModelSelection().addListener("change", function(e) {
    // selection is the first item of the data array
    var newLocale = radioGroup.getModelSelection().getItem(0);
    localeManager.setLocale(newLocale);
  }, this);
  
First, we get the model selection array, which is a data array and has a change event for every change in the array. The new locale is always the first element of the selection array itself, as you can see in the second line. You might have noticed that we need to access the item with a special method instead of the bracket notation normally used with arrays. That's a special method you have to use for data arrays. The third line simply hands the new locale to the manager, which will take care of all the necessary changes.

.. _pages/desktop/tutorials/tutorial-part-4-3#accessing_the_preferences:

Accessing the preferences
=========================

With that, we are done with the preferences window, but we can't access it yet. We should add a button to the main window's toolbar. Add this code right after where you added the reload button.

:: 

  // spacer
  toolbar.addSpacer();
  
  // settings button
  var settingsWindow = null;
  var settingsButton = new qx.ui.toolbar.Button(this.tr("Preferences"));
  toolbar.add(settingsButton);
  settingsButton.setToolTipText(this.tr("Change the applications settings."));
  settingsButton.addListener("execute", function() {
    if (!settingsWindow) {
      settingsWindow = new twitter.SettingsWindow();
      settingsWindow.moveTo(320,30);
    }
    settingsWindow.open();
  }, this);
  
The first thing we do is to add a spacer to attach the preferences button to the right side of the toolbar. This should be the only new thing you haven't seen before, so we won't go into details here.

.. _pages/desktop/tutorials/tutorial-part-4-3#final_steps:

Final steps
===========

Now we have created some new code containing new strings to translate. Obviously, we need to add translations for these as well. Just run the generator again and let it add the new strings to your ``po`` files.

::

  ./generate.py translation
  
Now you can edit the ``po`` files again and add the new translations. Don't forget to add the translation for the special ``$$languagename`` key in the english ``po`` file as well.

After generating the source version of the application again you should be set up for testing and all should run as expected.

I hope you enjoyed this little exercise and gained an idea how easy it is to internationalize an application using qooxdoo's help. As always, you can find the entire `code on GitHub <https://github.com/qooxdoo/qooxdoo/tree/%{release_tag}/component/tutorials/twitter/step4.3>`_. With that said, I want to encourage you to send me pull requests containing alternative translations we could add. It would be interesting to have the twitter app in many different languages. Really looking forward to your feedback and pull requests!