qx.Class.define("classIssue10727",
{
  extend: qx.core.Object,

  members: {
    // Test case from issue #10727: JavaScript labels should not generate
    // "Unresolved use of symbol" warnings when used with continue/break statements
    labeledLoop() {
      $outer: for (let x = 0; x < 10; x++) {
        for (let y = 0; y < 10; y++) {
          if (x ** y > 100000) {
            continue $outer;
          }
        }
      }
    },

    // Additional test cases for label handling
    labeledLoopWithBreak() {
      outerLoop: for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
          if (i * j > 10) {
            break outerLoop;
          }
        }
      }
    },

    // Test with while loop
    labeledWhile() {
      myLabel: while (true) {
        let count = 0;
        while (count < 10) {
          count++;
          if (count === 5) {
            break myLabel;
          }
        }
      }
    }
  }
});
