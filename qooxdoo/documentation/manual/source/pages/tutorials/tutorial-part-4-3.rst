.. _pages/tutorials/tutorial-part-4-3#tutorial_part_4.3:_translation:

Tutorial Part 4.3: Translation
******************************

We have covered quite some topics of qooxdoo to get to this point. In this tutorial, we want to internationalize the twitter client. Additionally, we want to add a preferences dialog to change the language on runtime. Adding a window containing a form should be familiar to you if you read the :doc:`form handling tutorial <tutorial-part-4-1>`

.. _pages/tutorials/tutorial-part-4-3#the_plan:

The plan
========
The first step is to get the application aware of localization. We need to identify all the strings which need to change on a language change. After that, we need to create a translation for our initial string set. After that is done, we can add a window containing all a radio group with all available language options.

.. _pages/tutorials/tutorial-part-4-3#identifying_string_to_translation:

Identifying strings to translate
================================

Now we can benefit from out good setup of our application. We pul all the view code in our main window which means thats the spot we need to look for strings. In here we can identify the following strings:

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
  
qooxdoo offers a handy way to tell both, the JavaScript code and the generator, which strings need to be translated. Wrapping the strings with ``this.tr()`` will mark them as translatable string. That should be an easy task:

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


.. _pages/tutorials/tutorial-part-4-3#generating_the_translation_files:

Generating the translation files
================================

As next step, we need to tell the generator, what languages we want to support. But why does the generator or the tool chain in general care about that? The tool chain will help us and generate the files necessary for the translation. So we should edit the config.json file located at the root folder of your application, which is the configuration file for the tool chain. As you can see, this is a plain JSON file which holds some predefined configuration data for the tool chain. You will find a ``let`` section holding a ``LOCALES`` key. This key has an array as value holding exactly one locale named ``en``, right? In this example, I add a translation set for german so i need to add ``de`` to this array.

::
  
  "LOCALES"      : [ "en" , "de" ],
  
Now we are set up to generate out translation files. For that, just invoke the generator with its translation job.

::

  ./generate.py translation

This will take all necessary steps to generate the translation files. But what are translation files anyway? Take a look at the folder ``source/translation``. There you see the created fils and you see that the files end with ``.po``. You may know that file format from `GNU gettext <http://en.wikipedia.org/wiki/GNU_gettext>`_ which is quite common.

You should see two files, one for the default langue, english (``en.po``), and one for your added language, in my case german (``de.po``). For now, we just need to file for our alternative language because the english is already used in the application so this should work right out of the box. Opening the second file will show you at the top of the document some details about the file. The important part starts with the following part.

::

  #: twitter/MainWindow.js:30
  msgid "Reload"
  msgstr ""
  
The first line of that is a comment, which is a hint to the line and class where the string is used. the second line holds the identifier we used in our application. The third line holds currently an empty string. This is the place where the translation should go for that specific string.

You may have already realized the the rest of the file is a list of blocks similar to the one just explained. Now you should translate all strings and add them in the right spots.

.. _pages/tutorials/tutorial-part-4-3#give_it_a_try:

Give it a try
=============

After adding these translation, we should rebuild the application using ``./generate.py source`` and load it in a browser of your choice. If you browser has the locale you added set by default, you should already see the application in the new language. If not, just tell the locale manager of qooxdoo to switch the local in, for example, the console of firebug.

:: 

  qx.locale.Manager.getInstance().setLocale("de"); // or the locale you added
  
If you have a language like german which has in most cases different word length, you may recognize that we did a mistake in out main window. ``postButton.setWidth(60);`` may cut off the text in the button because we set the width explicitly. Changing that to ``postButton.setMinWidth(60);`` will keep the layout flexible for different content sizes.


.. _pages/tutorials/tutorial-part-4-3#adding_the_preferences_window:

Adding the preferences window
=============================

As you should already be familiar with creating new classes and subclassing a window from the :doc:`form handling tutorial <tutorial-part-4-1>`, we don't go into detail about that again. Just add a new class, subclass the window and the constructor

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
  
As you see here, we added another string, the caption of the window, which should be translated as well. Keep in mind that you have to use ``this.tr()`` on every string you add and want to have in your translation file.

As next step, we need to fill the window with controls. As in the form example, we use a basic layout, a form and some form elements. Add the following line to your constructor.

:: 

  this.setLayout(new qx.ui.layout.Basic());
  
  var form = new qx.ui.form.Form();
  var radioGroup = new qx.ui.form.RadioButtonGroup();
  form.add(radioGroup, this.tr("Language"));

  // TODO: create a radio button for every available locale
  
  var renderer = new qx.ui.form.renderer.Single(form);
  this.add(renderer);
  
This code should be familiar to you except of the ``RadioButtonGroup``, which is a container for radio buttons. It also takes care that only one of the buttons is selected at once. So we don't need to take care of that. Again, we used a translated string as label for the radio buttons.

The next step is to access all available locales and the current set locale. For that, qooxdoo offers a locale manager, as you see in the following code part.

:: 

  var localeManager = qx.locale.Manager.getInstance();
  var locales = localeManager.getAvailableLocales();
  var currentLocale = localeManager.getLocale();
  
It is pretty easy to get these kind of information. You sure know how you would continue but before that, I show you a little trick. We want to have the name of the language we can select in the translation file itself. Thats a good place to keep that string because otherwise, we would need a mapping from the locale (e.g. en) to its human readable name (e.g. English). For that, we add a special translation key to our application.

::
  
  // mark this for translation (should hold the langauge name)
  this.marktr("$$languagename");
  
We will use that key as label for our radio buttons and continue now, as you would have expected, with a loop for all available locales.

:: 

  // create a radio button for every available locale
  for (var i = 0; i < locales.length; i++) {
    var locale = locales[i];     
    var languageName = localeManager.translate("$$languagename", [], locale);
    var localeButton = new qx.ui.form.RadioButton(languageName.toString());
    // save the local as model
    localeButton.setModel(locale);
    radioGroup.add(localeButton);
    
    // preselect the current locale
    if (currentLocale == locale) {
      localeButton.setValue(true);
    }    
  };
  
This code contains the rest of the trick. But lets take a look in detail what we are doing here. The first line of the look just stores the current locale we ant to process. Keep in mind that we need exactly this value to change the locale later. The second line tells the locale manager to translate the special id we set for the language name using the current locale. This will return a ``LocalizedString`` which is important to know because these Strings change its content on locale switch. But thats not what we want because otherwise, every language will have the same name. Thats why we use the ``toString()`` method to get the plain string of the current translated value as label for the new radio button. With that, we exclude the labels for the radio buttons from being translated. The next two tasks are pretty easy: 1) we store the locale as model of the radio button and 2) we add the radio button to the radio group. Preselecting the current set locale is really easy as well.

The last thing missing in the window is changing the locale if the user selects a new radio button. For that, we stored the locales in the model property. We can now use the ``modelSelection`` of the radio button group to react on changes.

:: 

  // get the model selection and listen to its change
  radioGroup.getModelSelection().addListener("change", function(e) {
    // selection is the first item of the data array
    var newLocale = radioGroup.getModelSelection().getItem(0);
    localeManager.setLocale(newLocale);
  }, this);
  
We first get the model selection array, which is a data array and has a change event for every change in the array. The new locale is always the first element of the selection array itself, as you see in the second line. You might have noticed that we need to access the item with a special method and not with the brackets you may used to using arrays? Thats a special method you have to use when its a data array. The third line is just giving the new locale to the manager, which will take care of all the changes to happen.

.. _pages/tutorials/tutorial-part-4-3#accessing_the_preferences:

Accessing the preferences
=========================

With that, we are done with the window for the preferences but we currently can not access it. We should add a button to the main windows toolbar. Add this code right after you added the reload button.

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
  
The first thing we do is adding a spacer to align the preferences button right. This should be the only new thing you haven't seen before so we don't go into details here.

.. _pages/tutorials/tutorial-part-4-3#final_steps:

Final steps
===========

Now we have created some now code containing new strings to translate. It it obvious that we need to add the translations for these new strings as well. Just run the generator again and let it add the new strings to our ``po`` files.

::

  ./generate.py translation
  
Now you can edit the ``po`` files again and add the new translations. Don't forget to add the translation for our special ``$$languagename`` key in the english ``po`` file as well.

After another generation of the source version of the application you should be set up for testing and all should run as expected.

I hope you enjoyed that little exercise and gained an idea how easy it is to internationalize an application using qooxdoos help. As always, you can find the whole `code on GitHub <http://github.com/wittemann/qooxdoo-tutorial/tree/Step4-3-Translation>`_. With that, I want to encourage you to send me pull requests containing alternative translations we could add. It could be interesting to have the twitter app in some languages. Really looking forward to your feedback and pull requests!