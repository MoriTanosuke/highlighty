var http = require('http')
   ,url  = require('url')
   ,fs   = require('fs');
var port = process.env.PORT || 8888;
http.createServer(function (request, response) {
  var f = ".";
  if(request.url == "/") {
    f += "/index.html";
  } else {
    f += url.parse(request.url)['pathname'];
  }
  fs.readFile(f, function(err, data){
    if(err) {
      response.writeHead(500);
      return response.end();
    }
    header = {'Content-Type': 'text/html'};
    if(f.substring(f.length - 3) == ".js") {
      header['Content-Type'] = 'text/javascript';
    } else if(f.substring(f.length - 4) == ".css") {
      header['Content-Type'] = 'text/css';
    }
    response.writeHead(200, header);
    return response.end(data);
  });
}).listen(port);

console.log('Server running at http://127.0.0.1:8124/');

