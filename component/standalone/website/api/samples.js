var samples = {};

/**
 * Core
 */
samples["q"] = [];
samples["q"].push(function() {
  q("#myId"); // containing the element with the id 'myId'
});
samples["q"].push(function() {
  q(".myClass"); // finds all elements with the class 'myClass'
});
samples["q"].push(function() {
  q("li"); // finds all 'li' elements
});
samples["q"].push(function() {
  q(":header"); // finds all header elements (h1 to h6)
});
samples["q"].push(function() {
  q("#list :header"); // finds all header elements in the element with the id 'list'
});



samples["q.define"] = [];
samples["q.define"].push(function() {
  q.define("MyObject", {
    construct : function() {},
    members : {
      method : function() {}
    }
  });
});

samples["q.define"].push(function() {
  q.define("MyObject", {
    statics : {
      method : function() {}
    }
  });
});

samples["q.define"].push(function() {
  q.define("UNOUNO.WhatsLive.Matrix", {
    statics : {
      getWebappDetails: function(mavenCoords) {
        
        // some code
        
        // call another static method of this class
        
        this.renderWebappDependencies(data);
        
      }
    }
  });
});

/**
 * Events
 */
samples["q.ready"] = [];
samples["q.ready"].push(function() {
  q.ready(function() {
    // ready to go
  });
});

samples[".on"] = [];
samples[".on"].push(function() {
  // A common use case is to pass in some extra parameters to an event listener. 
  // This example uses the 'Function.bind' method to achieve that. It also 
  // demonstrates how the scope of the listener function can be changed.

  // Suppose you like to have two extra parameters besides your event instance
  var listenerFunction = function(firstArg, secondArg, event) {
    // outputs "foo"
    console.log("first argument: ", firstArg);

    // outputs "bar"
    console.log("second argument: ", secondArg);

    // outputs the event instance
    console.log("event: ", event);

    // 'this' points to 'myInstance'
    var baz = this.anyVariable;
  };

  // Suppose you have an instance named 'myInstance', which holds some variables 
  // you like to access within your 'listenerFunction'
  q("div#myTarget").on("click", listenerFunction.bind(myInstance, "foo", "bar"));
  
  // handle keyup event with scope correction
  
  q('#inp-add-filter-3').on('keyup', this.handleFilterInput, this);
  
  var handleFilterInput = function(ev) {
    
    // event object
    
    console.log(ev);
    
    // get input value
    
    var value = q(ev.getTarget()).getValue();
    
    // if target is a checkbox you could do something like this when handling the change event
    // q(ev.getTarget()).getAttribute('checked');
    
  };
  
});

/**
 * Messaging
 */
samples["q.messaging.on"] = [];
samples["q.messaging.on"].push(function() {
  q.messaging.on("get", "/address/{id}", function(data) {
    var id = data.params.id; // 1234
    // do something with the id...
  },this);
});
samples["q.messaging.onAny"] = [];
samples["q.messaging.onAny"].push(function() {
  q.messaging.onAny("/address/{id}", function(data) {
    var id = data.params.id; // 1234
    // do something with the id...
  },this);
});
samples["q.messaging.emit"] = [];
samples["q.messaging.emit"].push(function() {
  q.messaging.emit("get", "/address/1234"); // emit a message on the 'get' channel
});
samples["q.messaging.remove"] = [];
samples["q.messaging.remove"].push(function() {
  q.messaging.remove(id); // id must be the return of an 'on' call
});

samples["q.array"] = [];
samples["q.array.removeAll"].push(function() {
  q.array.removeAll(this.webappsDataFiltered); // this.webappsDataFiltered is an array
});

samples["q.cookie"] = [];
samples["q.cookie.set"].push(function() {
  q.cookie.set('wl-' + this.allInputIds[i], inputValue);
});

samples["q.cookie"] = [];
samples["q.cookie.get"].push(function() {
  var inputValue = q.cookie.get('wl-' + this.allInputIds[i]);
});

samples["q.io.xhr"] = [];
samples["q.io.xhr"].push(function() {
  
  var getWebappsData = function(callback) {

    var xmlhttp = q.io.xhr(this.baseRESTUrl + '/whatslive/', {
    
      header: {
      
        'Accept': 'application/json'
        
      }
    
    });
    
    xmlhttp.on('loadend', function(callback, xhr) {
    
      if (xhr.responseText) {
      
        // when there is a response, pass it back to the callback function and correct scope
      
        callback(this, JSON.parse(xhr.responseText));
      
      }
    
    }.bind(this, callback));
    
    // send request now
    
    xmlhttp.send();
    
  };
  
  // calling this function
  
  getWebappsData(function(that, whatsliveWebServiceData) {
  
    // handle response
  
    that.processWebappsData(whatsliveWebServiceData);
    
  });

});

samples[".addClass"] = [];

samples[".addClass"].push(function() {
  
  if (active) {
  
    // show loading indicator
  
    q('#dependency-loading-indicator').removeClass('hidden');
    
    // deactivate button
    
    q('#but-render-dependencies').setAttribute('disabled', 'disabled');
  
  } else {
  
    // hide loading indicator
  
    q('#dependency-loading-indicator').addClass('hidden');
  
    // activate button
    
    q('#but-render-dependencies').removeAttribute('disabled');
  
  }

});

samples["q.template.render"] = [];
samples["q.template.render"].push(function() {
  
  var entryTemplate, i, webappData;
  
  entryTemplate = '<li class="hidden" id="{{id}}" data-groupid="{{groupid}}" data-artefactid="{{artefactid}}">' +
                      '<span class="groupid">{{groupid}}</span>' +
                      '<span class="seperator">:</span>' +
                      '<span class="artefactid">{{artefactid}}</span>' +
                      '<span class="details" data-link="{{link}}">details</span>' +
                    '</li>';
  
  for (i = 0; i < this.webappsData.length; i += 1) {
  
    webappData = this.webappsData[i];
  
    q('#app-list').append(q.template.render(entryTemplate, {
    
      // temp solution
    
      // I would like to use data attributes
      // q chain needs data attribute support for that
    
      id: webappData.groupId + '-' + webappData.artefactId,
    
      groupid: webappData.groupId,
      
      artefactid: webappData.artefactId,
      
      link: webappData.detailLink
      
    }));
    
  }
  
});

samples[".find"] = [];
samples[".find"].push(function() {
  
  if (this.dontShowGroupId) {
  
    q('#app-list').find('.groupid').addClass('hidden');
  
    q('#app-list').find('.seperator').addClass('hidden');
  
  } else {
  
    q('#app-list').find('.groupid').removeClass('hidden');
  
    q('#app-list').find('.seperator').removeClass('hidden');
  
  }
  
});

samples[".append"] = [];
samples[".append"].push(function() {
  
  q('#app-details').append('<div id="loading-indicator"></div>');
  
});

samples[".animate"] = [];
samples[".animate"].push(function() {
  
  q('#app-list').animate({
    'duration': 150,
    'timing': 'ease-out',
    'keep': 100,
    'keyFrames': {
      0: { 'height': '250px' },
      100: { 'height': '120px' }
    },
    'repeat': 1,
    'alternate': false,
    'delay': 0
  });
  
});

samples[".getChildren"] = [];
samples[".getChildren"].push(function() {
  
  q('#app-details').getChildren().remove();
  
});
