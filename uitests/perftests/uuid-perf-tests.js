function createUuidV4(a) {
  return a           // if the placeholder was passed, return
    ? (              // a random number from 0 to 15
      a ^            // unless b is 8,
      Math.random()  // in which case
      * 16           // a random number from
      >> a/4         // 8 to 11
      ).toString(16) // in hexadecimal
    : (              // or otherwise a concatenated string:
      [1e7] +        // 10000000 +
      -1e3 +         // -1000 +
      -4e3 +         // -4000 +
      -8e3 +         // -80000000 +
      -1e11          // -100000000000,
      ).replace(     // replacing
        /[018]/g,    // zeroes, ones, and eights with
        createUuidV4 // random hex digits
      )
}

function runTest(title, fn) {
  console.log(title);
  for (let i = 0; i < 10; i++) {
    console.log(`  Sample ${i+1}: ${fn()}`);
  }
  let start = performance.now();
  for (let i = 0; i < 100000; i++)
    fn();
  let ms = performance.now() - start;
  console.log(`100,000 entries took ${ms}\n`);
}        

async function runAllTests(){
  // 59ms
  let uuid = require("uuid-random");
  runTest("https://github.com/jchook/uuid-random", uuid);
  
  // 141ms
  let flakeIdgen = new (require("flake-idgen"))();
  let intformat = require('biguint-format');
  runTest("flake-idgen", () => intformat(flakeIdgen.next(), 'hex', { prefix: '0x' }));
  
  // 227ms
  let nanoid = require("nanoid"); 
  runTest("nanoid", nanoid);
  
  // 338ms
  runTest("https://gist.github.com/jed/982883 createUuid", createUuidV4);
  
  // 515ms
  let cuid = require('cuid');
  runTest("cuid", cuid);
}
runAllTests();
