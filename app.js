var http   = require('http')
   ,url    = require('url')
   ,querystring = require('querystring')
   //,redis  = require('redis').connect(process.env.REDISTOGO_URL)
   ,fs     = require('fs');


var port = process.env.PORT || 8888;
http.createServer(function (request, response) {
  var f = ".";
  if((request.url == "/" || request.url == "/index.html")
	 && request.method == "GET") {
    f += "/index.html";
  } else if((request.url == "/" || request.url == "/index.html")
	 && request.method == "POST") {
    var body = '';
    request.on('data', function(chunk) {
      body += chunk.toString();
    });
    request.on('end', function() {
      var decodedBody = querystring.parse(body);
      console.log('source=' + decodedBody['source']);
      console.log('brush=' + decodedBody['brush']);
      //TODO write to redis
    });
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

console.log('Server running at http://127.0.0.1:' + port);

