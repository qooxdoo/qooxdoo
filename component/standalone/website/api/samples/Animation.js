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
