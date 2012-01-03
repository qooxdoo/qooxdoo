Use cases of the collection class
*********************************

.. note::

  Please note that this list is currently under development. More example use cases will follow to get a more complete overview.

This page lists all popular use cases for web developers with the use of the collection class of the qooxdoo framework. The functionality of the collection class is comparable to jQuery.


Selecting DOM elements
======================

This is most common use case: select DOM elements and start further operations on those collection of elements.

Using a CSS selector
^^^^^^^^^^^^^^^^^^^^

qooxdoo uses exactly the same powerful `Sizzle <http://sizzlejs.org>`_ engine as jQuery. You can safely use all CSS selectors you already know from jQuery. You can even use the well-known ``$`` shortcut to select your DOM elements.

::

  // query for all 'h1' and 'h2' elements
  var headers = qx.bom.Collection.query("h1,h2");

  // short form for query for all 'h1' and 'h2' elements
  var headers = $("h1,h2");

  // query for all 'li' elements - starting from the second 'ul' element
  var listItems = $("li", $("ul")[1]);


Using a known element ID
^^^^^^^^^^^^^^^^^^^^^^^^

If you know the ID of the element you like to select you use this ID directly. The advantage to the ``document.getElementById`` method is that you e.g. can chain methods directly after the selector without checking the existence of the element. If the element does not exist the chained method does work on an empty collection which simply leads to no results.

The difference between the ``query`` method is that you can leave out the ``#`` notation and only use the ID value of the element you like to select.

::

  // select the element with 'myId'
  var element = qx.bom.Collection.id("myId");
  
  // exactly the same result using the 'query' method
  var element = qx.bom.Collection.query("#myId");


Manipulating DOM elements
=========================

Once the needed elements are selected the next step may be to manipulate those elements by e.g. adding a CSS class or changing a CSS style attribtue. With the built-in chaining support you are able to select the DOM elements and manipulate them right away by chaining the specific method to the returned collection.


Working with CSS classes
^^^^^^^^^^^^^^^^^^^^^^^^

The ``Collection`` class has support for retrieving, adding, removing, toggling and replacing CSS classes. The support for adding and removing multiple CSS classes is planned for the next release.

::

  // retrieve a CSS class
  var cssClass = $("#myBox").getClass();
  
  // simple adding and removing of a 'highlight' CSS class
  $("#myBox").addClass("highlight");
  $("#myBox").removeClass("highlight");

  // toggling a CSS class - alternative for the use of 'add' and 'remove'
  $("#myBox").toggleClass("highlight");
  
  // replacing an existing class with a new one
  $("#myBox").replaceClass("oldClass", "newClass");


Manipulating CSS styles
^^^^^^^^^^^^^^^^^^^^^^^^

Instead of changing whole CSS classes you can also simply change one or multiple CSS styles to manipulate elements. Setting and getting the whole style attribute of an element is also supported. 
If multiple elements are within a collection the getter methods are returning the value of the first element of the collection.

::

  // hiding an element
  $("#myBox").setStyle("display", "none");
  
  // change multiple styles at once
  var styles = { backgroundColor: 'red', border: '1px solid orange' };
  $("#myBox").setStyles(styles);
  
  // reset one specific style to its default value
  $("#myBox").resetStyle("border");
  
  // getting the value of the 'style' attribute
  var current = $("#myBox").getCss();
  
  // setting the value of the 'style' attribute
  $("#myBox").setCss("background-color:red; border: 2px dotted yellow;");


Adding event listeners
^^^^^^^^^^^^^^^^^^^^^^

Getting information about user interaction through browser events is an important part of creating a dynamic web page and good user experience. It is very easy to work with events with the elements of a collection.

::

  // sample listener
  var listener = function(e) {
    alert(e.getTarget());
    
    // 'this' refers to the target in this case
    alert(this.id);
  };

  // simple 'click' listener at all elements of the collection
  $("#myBox").addListener("click", listener);
  
  
  // sample listener with different scope
  var listenerWithDifferentScope = function(e) {
    alert(e.getTarget());
    
    // 'this' refers to the 'window' object
    alert(this.location.href);
  };
  
  // simple 'click' listener at all elements of the collection
  // with different scope
  $("#myBox").addListener("click", listenerWithDifferentScope, window);