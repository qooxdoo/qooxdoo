.. _pages/tutorial_web_developers#Low-level_tutorial_for_web_developers:

Low-level tutorial for web developers
*************************************

.. _pages/tutorial_web_developers#Introduction:

Introduction
============

Developing web applications demands more and more skills, and, as they try to match the desktop apps or even outrun them, the html, css and javascript code gets more and more complex. Many libraries and frameworks come to the rescue, and among them is qooxdoo. In this tutorial I will present how a web developer can benefit from using qooxdoo in his day to day work. I will cover several use cases that many of us encounter on a daily basis from simple to more complex, and I will show how it can be achieved both ways , using plain html, css and javascript, and using qooxdoo. The use cases cover the creation of a menu, that appears when a button is clicked.

.. _pages/tutorial_web_developers#The_HTML:

The HTML:
=========

::

<div id="container">
<div id="qooxdoo">
<div id="qx1">get the position of it</div>
</div>
<div id="clasic">
<div id="ex1">get the position of it</div>
</div>
<div class="clearer"></div>
</div>


As you can see, inside the "#container" DIV we have 2 DIVs, that will hold the experiments for the qooxdoo version and the classic way. Inside each of them we have a button [made out of a div too] surrounded by a 2 wide red border. The css is presented in the <HEAD> section of the html file, so you can play with it.


::

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
 #clasic {
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

.. _pages/tutorial_web_developers#qooxdoo_initial_step:

qooxdoo initial step
====================

For qooxdoo , there is an initial step that must be done, and that is creating the low-level skeleton application.
This procedure will create the html, and the external js file where the qooxdoo library resides.
This can easily be automated with shell scripts, or integrated into your dev environment.
The benefits are small for this particular demo but when you want to do a big app, this comes in handy quite well.
You can find more detail about this operation :doc:`here <setup_a_low-level_library>`.
We create the app with the following command:

::

$QOOXDOO_PATH/tool/bin/create-application.py -n appName -t bom -o $OUTPUT-DIR

-n specifies the name of the app
-t the type of the qooxdoo app [bom means our low-level app type]
-o where we want it.

in the folder of the app, there is an already python script that builds our app.

::

./generate.py build

.. _pages/tutorial_web_developers#the_javascript_code:

The javascript code.
====================

I will dive into events , then positioning and location, and then creation and showing an element.

Events
------

After creating the button, we must attach a 'click' event to it, in order to know when to show the menu. It sounds easy to add the click event to the button, but there are differences even here in the browsers. IE has attachEvent [ie9 supports the W3C standard though] while the rest have a standard w3c implementation addEventListener. Also, the handler function of the event treats "this" variable as the global window in IE and as target element in the other browsers. First we get the element into a js variable:

::

 var positionedDiv = document.getElementById('ex1');

now we attach the click event:

plain version:

::

 if(!window.addEventListener){
  positionedDiv.attachEvent('onclick', function(evt){
   // work to do
  });
 }
 else {
  positionedDiv.addEventListener('click', function(evt){
   // work to do
  }, false);
 }

qooxdoo version:

::

 qx.bom.Element.addListener(positionedDiv,'click',function(){
  // work to do
 },positionedDiv,false);



You don't have to worry about the browsers differences now, and it is a 1 liner. qooxdoo is well namespaced, so you can safely use it in your webpage, it won't affect other libraries or the global objects: Array, String... for the low-level things i present here, there are 3 packages of interest: ``qx.bom``, ``qx.dom``, ``qx.html`` the above method used for adding click event on a div is a static method of the Event class, so one can use it  right away, without instantiating objects. Most methods in these 3 namespaces are static.

Getting the position of a div
-----------------------------

Next, we need to get offsetTop and offsetLeft properties of the div node in order to find out where we must position the menu. The qooxdoo version is simple, so i will write it first to get it out of the way:

::

 var location = qx.bom.element.Location.get(positionedDiv);

we call the get static method on the Location class in the ``qx.bom.element`` namespace - you should `browse the docs <http://demo.qooxdoo.org/current/apiviewer>`_ for these 3 namespaces to find your way when you need something. Calling "get" will provide us with an object that has 4 properties left, top, right, bottom. now we do:

::

 var offsetTop = location.top;
 var offsetLeft = location.left;

the classic way is a bit more messy. in this case , the problem is not the javascript differences but about css and layout.
we use offsetTop and offsetLeft element properties and they are present in all major browsers.
computing the absolute top and left distance from the upper-left corner of the document is easy:

::

	var offsetTop = 0;
	var offsetLeft = 0;
	while(el.tagName.toLowerCase()!='body'){
		offsetTop+=el.offsetTop;
		offsetLeft+=el.offsetLeft;
		el=el.offsetParent;
	}

problem is, when running this code gives different results on IE and FF.
on IE , border dimension is not taken into account when computing the position.
so, for IE we must have something like below:

::

	var offsetTop = 0;
	var offsetLeft = 0;
	while(el.tagName.toLowerCase()!='body'){
		var borderTopWidth = parseInt(el.currentStyle.borderTopWidth);
		var borderLeftWidth = parseInt(el.currentStyle.borderLeftWidth);
		offsetTop+=el.offsetTop+(isNaN(borderTopWidth) ? 0 : borderTopWidth);
		offsetLeft+=el.offsetLeft+(isNaN(borderLeftWidth) ? 0 : borderLeftWidth);
		el=el.offsetParent;
	}

now , we get the same result.
this is not a difference in the javascript and DOM API as was the case for the event part, it is about the way CSS and layout are handled
internally by the browser, both of which are unified in qooxdoo, and the programmer is relieved of them.

Creating and showing the menu.
------------------------------

A class is already in place for the menu DIV , so all we are left to do is to create the element, position it at the right coordinates and show it.

classic way:

::

    menuDiv = document.createElement('div');
    menuDiv.className = 'menu';
    menuDiv.style.top=top+'px';
    menuDiv.style.left=left+'px';
    menuDiv.innerHTML = 'menu1<br>------------<br>menu2';
    document.body.appendChild(menuDiv);


qooxdoo way:

::

          menuDiv = qx.bom.Element.create('div',{'class': 'menu'});
          qx.bom.element.Style.setStyles(menuDiv,{'top': location.top+'px','left': location.left+'px'});
          menuDiv.innerHTML = 'menu1<br>--------------<br>menu2';
          qx.dom.Element.insertEnd(menuDiv,document.body);


Creating an element comes along with specifying attributes too, in a good js manner by having the second argument as a object literal
with attribute names and values. The same style is for method `qx.bom.element.Style.setStyles <http://demo.qooxdoo.org/current/apiviewer/#qx.bom.element.Style~setStyles>`_ , where we specify in 1 call all the styles we want for the element.

Adding the mouseout event is similar to the click event, so i won't repeat it here.

I hope you find qooxdoo a great way to develop web apps too, and if you want to know more you can browse our documentation at
`qooxdoo API <http://qooxdoo.org/documentation>`_.

