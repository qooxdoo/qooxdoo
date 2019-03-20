%{Website} Requirements
=======================

Here are the requirements for developing and deploying with %{qooxdoo} %{Website}. You will usually include the %{Website} library on an HTML page and then write code that utilizes its API.

Browsers
--------

Code written against the %{Website} API will run in all major web browsers, particularly:

%{Website} widgets are currently experimental and will not work in all browsers.

Installation and Setup
----------------------

Download the %{Website} component from %{qooxdoo}'s [download page](http://%{qooxdoo}.org/downloads) and place it in a suitable URI reachable from your development environment. Then include this URI with a `<script>` tag in the HTML page that you are developing.

``` {.sourceCode .html}
<html>
<head>
  <script href="<uri_of_%{Website}_download>"/>
  ...
```

That's it, you are ready to start working against the %{Website} API.
