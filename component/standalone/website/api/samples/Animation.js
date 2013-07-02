addSample(".animate", function() {
  q('#someElement').animate({
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


addSample(".animateReverse", function() {
  q('#someElement').animateReverse({
    'duration': 150,
    'keyFrames': {
      0: { 'height': '250px' },
      100: { 'height': '120px' }
    }
  });
});

addSample(".fadeIn", {
  html: ['<div id="myId">',
         '  Test',
         '</div>'],
  javascript: function() {
    q("#myId").fadeIn();
  },
  executable: true
});

addSample(".fadeOut", {
  html: ['<div id="myId">',
         '  Test',
         '</div>'],
  javascript: function() {
    q("#myId").fadeOut();
  },
  executable: true
});

addSample(".isEnded", function() {
  q('#someElement').animate(desc);
  if (q('#someElement').isEnded()) { /* ... */}
});

addSample(".isPlaying", function() {
  q('#someElement').animate(desc);
  if (q('#someElement').isPlaying()) { /* ... */}
});

addSample(".pause", function() {
  q('#someElement').animate(desc);
  q('#pauseButton').on("click", function() {
    q('#someElement').pause();
  });
});

addSample(".play", function() {
  q('#someElement').animate(desc);
  q('#playButton').on("click", function() {
    q('#someElement').play();
  });
});

addSample(".stop", function() {
  q('#someElement').animate(desc);
  q('#stopButton').on("click", function() {
    q('#someElement').stop();
  });
});