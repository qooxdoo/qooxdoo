.. _pages/development/simulator_platforms#simulator_platforms:

Running Simulator tests against different browsers and platforms
================================================================

General
-------

Since the Simulator uses Selenium RC to start the browser and run tests, the relevant sections from the `Selenium documentation <http://seleniumhq.org/docs/05_selenium_rc.html>`_ apply. Due to the special nature of qooxdoo applications, however, some browsers require additional configuration steps before they can be tested.

Firefox
-------

The 3.x line of Mozilla Firefox is usually the most reliable option for Simulator tests. Firefox 3.0, 3.5 and 3.6 are all known to work on Windows XP and 7 as well as Linux and OS X.

Firefox 4 is not supported by Selenium 1.0.3 out of the box, but it can be used for testing by starting it with a custom profile. These are the necessary steps:

* Start Firefox 4 with the -P option to bring up the Profile Manager
* Create a new profile, naming it e.g. "FF4-selenium"
* Under Options -> Advanced -> Network -> Settings, select Manual Proxy Configuration and enter the host name or IP address and port number of your Selenium server
* In your application's config.json, use the *\*custom* browser launcher followed by the full path to the Firefox executable and the name of the profile:

::

  "simulation-run" :
  {
    "environment" :
    {
      "simulator.testBrowser" : "*custom C:/Program Files/Mozilla Firefox/firefox.exe -P FF4-selenium",
      [...]
    }
  }

Internet Explorer 6, 7, 8 and 9
-------------------------------

Starting the server
___________________

When testing with IE, the Selenium server **must** be started with the *-singleWindow* option so the AUT will be loaded in an iframe. This is deactivated by default so two separate windows are opened for Selenium and the AUT. IE restricts cross-window JavaScript object access, causing the tests to fail.

::

  java -jar selenium-server.jar -singleWindow -userExtension [...]


Launching the browser
_____________________

To launch IE, the *\*iexploreproxy* launcher should be used. The *\*iexplore* launcher starts the embedded version of IE which in some ways behaves differently from the full-blown browser.

::

  "simulation-run" :
  {
    "environment" :
    {
      "simulator.testBrowser" : "*iexploreproxy",
      [...]
    }
  }
  
