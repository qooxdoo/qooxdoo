.. _pages/tutorial_web_developers#Low-level_tutorial_for_web_developers:

Low-level tutorial for web developers
*************************************

.. _pages/tutorial_web_developers#Introduction:

Introduction
============

Developing web applications demands more and more skills, and, as they try to match the desktop apps or even outrun them, the HTML, CSS and JavaScript code gets more and more complex. Many libraries and frameworks come to the rescue. In this tutorial we will show how a web developer can benefit from using qooxdoo in his day to day work. We will cover several use cases that many of us encounter on a daily basis from simple to more complex, and we will show how it can be achieved in both ways , using plain HTML, CSS and JavaScript, and using qooxdoo. The use cases will cover the creation of a menu that opens when a button is clicked.

.. _pages/tutorial_web_developers#The_HTML:

The HTML
=========

Let's start with a piece of HTML that will host both the classical and the qooxdoo solution.

.. code-block:: html

  <body>
      <div id="container">
          <div id="qooxdoo">
              <div id="qx1">get the position of it</div>
          </div>
          <div id="classic">
              <div id="ex1">get the position of it</div>
          </div>
          <div class="clearer"></div>
      </div>
  </body>


As you can see, inside the ``#container`` DIV we have two further DIVs that will hold the experiments for the qooxdoo version and the classic way. Inside each of them we have a button, made of a DIV too, surrounded by a 2 pixel wide red border. The CSS is presented in the <HEAD> section of the HTML file so you can play with it.


.. code-block:: css

   <head>
     <style type="text/css">
     body {
       padding: 0px;
       margin: 0px;
     }
     #container {
       margin: 12px auto;
       padding: 4px 2px;
       width: 90%;
     }
     #qooxdoo {
       float: left;
       width: 45%;
       background-color: #e1e1e1;
       height: 750px;
       margin: 0px 10px;
     }
     #classic {
       float: left;
       width: 45%;
       background-color: #e1e1e1;
       height: 750px;
       margin: 0px 10px;
     }
     .clearer {
       clear: left;
     }
     #qx1 {
       border: solid 2px #ff0000;
     }
     #ex1 {
       border: solid 2px #ff0000;
     }
     </style>
   </head>


.. _pages/tutorial_web_developers#qooxdoo_initial_step:

qooxdoo initial step
====================

For qooxdoo we will start with creating the low-level skeleton application. This procedure will create a minimal application environment and JS file that contains the low-level qooxdoo library. The benefits are small for this particular demo but when you want to create a larger application, this comes in handy.  You can find more details about this operation in the :doc:`Setting up a low-level library <setup_a_low-level_library>` section.  We create the application with the following command:

::

$QOOXDOO_PATH/tool/bin/create-application.py -n $APPNAME -t bom -o $OUTPUT_DIR

``$QOOXDOO_PATH`` is the path to your qooxdoo SDK, ``$APPNAME`` specifies your chosen name for the application and ``$OUTPUT_DIR`` is the directory where you want the root folder of the application to be located. The ``-o bom`` option specifies the low-level application type.

Change to the application folder and you will find a Python script that builds our application:

::

./generate.py build

This can easily be automated, or integrated into your development environment. Now we have a ``qx-bom.js`` file in the current directory that we can use in the subsequent steps. You will also find a ``index.html`` file that you can use to paste the above HTML and CSS elements into.  


.. _pages/tutorial_web_developers#the_javascript_code:

The JavaScript code
====================

Now we will dive into events, positioning and location, and then creation and showing of an element.

Events
------

After creating the button, we must attach a ``click`` event to it, in order to know when to show the menu. It sounds easy to add the click event to the button, but even here there are differences between the browsers. IE has the method ``attachEvent()`` (IE9 supports the W3C standard, though) while the other browsers support the standard W3C method ``addEventListener()``. Also, the handler function of the event treats the ``this`` variable as the global window in IE and as the target element of the event in other browsers. First we fetch the HTML element into a JS variable:

::

 var positionedDiv = document.getElementById('ex1');

Now we attach the click event. The first version shows how to achieve this in the classical style:

::

  if(!window.addEventListener){
    positionedDiv.attachEvent('onclick', function(evt){
     // processing code here
    });
  }
  else {
    positionedDiv.addEventListener('click', function(evt){
     // processing code here
    }, false);
  }

Here is the qooxdoo version:

::

 var positionedDiv = document.getElementById('qx1');

 qx.bom.Element.addListener(positionedDiv,'click',function(){
  // processing code here
 },positionedDiv,false);



You don't have to worry about the browsers differences now, and it is a one-liner. qooxdoo is well namespaced, so you can safely use it in your webpage, it won't affect other libraries or the global objects, like Array, String ... . For the low-level things we present here, there are three packages of interest: ``qx.bom``, ``qx.dom`` and ``qx.html``. The above method used for adding the click-event listener on a DIV is a static method of the ``Element`` class, so one can use it  right away without instantiating objects. Most methods in these three namespaces are static.


Getting the position of a DIV
-----------------------------

Next, we need to get ``offsetTop`` and ``offsetLeft`` properties of the DIV node, in order to find out where we must position the menu. The qooxdoo version is simple, so we will write it first to get it out of the way:

::

 var location = qx.bom.element.Location.get(positionedDiv);

We call the ``get()`` static method on the Location class in the ``qx.bom.element`` namespace. You should `browse the docs <http://demo.qooxdoo.org/%{version}/apiviewer>`_ for these three namespaces to find your way when you need something. Calling ``get()`` will provide us with an object that has 4 properties, ``left``, ``top``, ``right`` and ``bottom``. Now we do the following:

::

 var offsetTop = location.top;
 var offsetLeft = location.left;

We will use these variable later.

The classic way is a bit more messy. In this case, the problem is not in the JavaScript differences, but in the CSS and layout. We use the ``offsetTop`` and ``offsetLeft`` element properties which are present in all major browsers. Computing the absolute top and left distance from the upper-left corner of the document is done in the event listener:

::

    var el = evt.srcElement;
    var height = el.offsetHeight;
    var offsetTop = 0;
	var offsetLeft = 0;
	while(el.tagName.toLowerCase()!='body'){
		offsetTop+=el.offsetTop;
		offsetLeft+=el.offsetLeft;
		el=el.offsetParent;
	}

The problem is, when running this code it gives different results on IE and FF. On IE , the border dimension is not taken into account when computing the position. So for IE we must have something like this below:

::

	var el = evt.srcElement;
	var height = el.offsetHeight;
	var offsetTop = 0;
	var offsetLeft = 0;
	while(el.tagName.toLowerCase()!='body'){
		var borderTopWidth = parseInt(el.currentStyle.borderTopWidth);
		var borderLeftWidth = parseInt(el.currentStyle.borderLeftWidth);
		offsetTop+=el.offsetTop+(isNaN(borderTopWidth) ? 0 : borderTopWidth);
		offsetLeft+=el.offsetLeft+(isNaN(borderLeftWidth) ? 0 : borderLeftWidth);
		el=el.offsetParent;
	}

Now we get the same result. This is not a difference in the JavaScript and DOM API as was the case for the event part, it is about the way CSS and layout are handled. This is internal to the two browser classes, both of which are unified in qooxdoo and the programmer is relieved of them.


Creating and showing the menu.
------------------------------

A class is already in place for the menu DIV , so all we are left to do is to create the element, position it at the right coordinates and show it.
We will show it right below the button, and left-aligned with it.

The classic way:

To get the bottom coordinate we will add to ``offsetTop`` variable in the click handler the button's ``offsetHeight`` value before calling the ``showMenu`` function.

::

 showMenu(offsetTop+height,offsetLeft);

where ``height`` variable is obtained earlier in the code fragments above. Now we are set to create and show the menu.

::

    var menuDiv = document.createElement('div');
    menuDiv.className = 'menu';
    menuDiv.style.top=top+'px';
    menuDiv.style.left=left+'px';
    menuDiv.innerHTML = 'menu1<br>------------<br>menu2';
    document.body.appendChild(menuDiv);


The qooxdoo way:

To get the bottom coordinate we will use ``location.bottom`` computed earlier.

::

    var menuDiv = qx.bom.Element.create('div',{'class': 'menu'});
    qx.bom.element.Style.setStyles(menuDiv,{
      'top': location.bottom+'px',
      'left': location.left+'px'
    });
    menuDiv.innerHTML = 'menu1<br>--------------<br>menu2';
    qx.dom.Element.insertEnd(menuDiv,document.body);

Creating an element comes along with specifying attributes, too, in a good JS manner by having the second argument as a object literal with attribute names and values. The same style is for the method `qx.bom.element.Style.setStyles() <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.bom.element.Style~setStyles>`__, where we specify in a single call all the styles we want for the element.

The menu gets hidden when we move the mouse out of it. Adding a ``mouseout`` event is similar to the click event, so we don't repeat it here because there aren't many differences between browsers.

This concludes the low-level tutorial, where we hoped to show some of the benefits you get when using qooxdoo in low-level applications.
