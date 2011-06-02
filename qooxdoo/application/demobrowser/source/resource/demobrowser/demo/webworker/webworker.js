function fib(n) {
  if (n <= 2) {
    return 1;
  } else {
    return fib(n-1) + fib(n-2);
  }
}

onmessage = function(e) {
  var n = parseInt(e.data);
  for(var i=1; i<=n; i++) {
    postMessage(fib(i));
  }
};
