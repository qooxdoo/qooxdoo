var samples = {};

/**
 * Core
 */
samples["q"] = [];
samples["q"].push(function() {
  q("#myId"); // returns a collection containing the element with id 'myId'
})


/**
 * Events
 */
samples["q.ready"] = [];
samples["q.ready"].push(function() {
  q.ready(function() {
    // ready to go
  });
});