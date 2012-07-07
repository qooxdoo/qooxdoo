.. only:: html

  ====================
  Table of Contents
  ====================

.. toctree::
   :maxdepth: 3

   pages/introduction


.. core

.. ifconfig:: qxcomponents in ('all', 'gui', 'mobile', 'website', 'core')

  .. toctree::
    :maxdepth: 3

    pages/core


.. website

.. ifconfig:: qxcomponents in ('all', 'gui', 'mobile', 'website')

  .. toctree::
    :maxdepth: 3

    pages/website.rst


.. gui

.. ifconfig:: qxcomponents in ('all', 'gui')

  .. toctree::
    :maxdepth: 3

    pages/desktop

.. mobile

.. ifconfig:: qxcomponents in ('all', 'mobile')

  .. toctree::
    :maxdepth: 3

    pages/mobile.rst

.. server

.. ifconfig:: qxcomponents in ('all', 'server')

  .. toctree::
     :maxdepth: 3

     pages/server


.. io

.. ifconfig:: qxcomponents in ('all', 'mobile', 'gui', 'website')

  .. toctree::
     :maxdepth: 3

     pages/communication

.. development

.. toctree::
   :maxdepth: 3

   pages/development

.. standard apps

.. toctree::
   :maxdepth: 3

   pages/application

.. tooling

.. toctree::
   :maxdepth: 3

   pages/tool

.. migration

.. toctree::
   :maxdepth: 3

   pages/migration

.. toctree::
   :maxdepth: 3

   pages/references
