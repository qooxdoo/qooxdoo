onmessage = function (e) {
  if (e.data == "error") throw "error";
  postMessage(e.data);
};
