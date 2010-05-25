.. _pages/snippets/problems_with_this_in_event_handlers#problems_with_this_in_event_handlers:

Problems with "this" in event handlers
**************************************

How do I ensure that the correct "this" is referred to in an event handler? Say you have an event-handler within a custom widget which looks like this:

::

    _someHandler : function(e) {
    	alert(this);
    }

and then later within the same class definition, register a handler with another class instance:

::

    var anotherWidget = new AnotherWidget();
    anotherWidget.addEventListener("changeSomething", this._someHandler);

When the handler gets triggered by a "changeSomething" event, the alert of the handler is being called. However, there is a problem in that 'this' now refers to an object of class AnotherWidget and not to the instance of MyWidget. To solve this problem, use:

::

    anotherWidget.addEventListener("changeSomething", this._handler, this);

