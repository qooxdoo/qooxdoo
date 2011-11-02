.. _pages/ui_html_editing/recommendations#recommendations:

Recommendations
***************

This page should help developers using the HtmlArea to stick with some recommendations to avoid known issues or to call attention how to use a specific feature.

.. _pages/ui_html_editing/recommendations#common_font_families:

Common Font Families
====================

Since the HtmlArea *"only"* is a editing component it does not offer a complete toolbar or other features which an full-blown Html Editor might offer.
So if you setup an own toolbar and decide to offer the user a possibility to change the default font family you should be careful not to use a font family which is not widely available. If the client computer does not has the listed font family installed it will certainly fall back to the systems default. The user will be irritated by different choices which end up with the same result if he applies them to his written content. 

To avoid this problem you should play safe and offer the following font families:

* Arial
* Arial Black
* Verdana
* Courier New
* Courier
* Georgia
* Impact
* Comic Sans MS
* Tahoma
* Lucida Console

A nice list of the most common font families is listed at `CodeStyle.org <http://www.codestyle.org/css/font-family/sampler-CombinedResults.shtml>`_

.. _pages/ui_html_editing/recommendations#inserthtml_command:

InsertHtml Command
==================

This command lets you insert you HTML code directly into the component's document. It is powerful and can be an easy way to accomplish your goals, but you should keep in mind that this method should only be used if there is no other possibility offered. 

If you e.g. want to insert an image into the document use the dedicated ``insertImage`` command instead of putting your HTML code together.

.. _pages/ui_html_editing/recommendations#avoid_div_elements_with_fixed_width_or_height:

Avoid DIV elements with fixed width or height
=============================================

The problem with DIV elements which have *width* or *height* set with CSS styles is that IE offers for those DIV elements resize/move handles. This is in the most cases not desired. So better use *margin*, *padding* or *top|left|right|bottom* to position your DIV element.

Additionally if you set a width of 600px to a DIV element users with a small resolution (like 800 x 600 ) might end up with horizontal scrollbars.