.. only:: html

  ====================
  Table of Contents
  ====================

.. toctree::
   :maxdepth: 3

   pages/introduction
   pages/getting_started


.. core

.. ifconfig:: qxcomponents in ('all', 'gui', 'mobile', 'website', 'core')

  .. toctree::
    :maxdepth: 3

    pages/core


.. website

.. ifconfig:: qxcomponents in ('all', 'gui', 'mobile', 'website')

  .. toctree::
    :maxdepth: 3

    pages/low_level.rst


.. gui

.. ifconfig:: qxcomponents in ('all', 'gui')

  .. toctree::
    :maxdepth: 3

    pages/gui_toolkit

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


.. toctree::
   :maxdepth: 3

   pages/development
   pages/tool
   pages/application

.. toctree::
   :maxdepth: 3

   pages/migration
   pages/references
