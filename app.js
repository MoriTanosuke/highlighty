var connect = require('connect')
   //,redis  = require('redis').connect(process.env.REDISTOGO_URL)
;

var port = process.env.PORT || 8888;

var app = connect()
	.use(connect.logger())
	.use(connect.static('public'))
	.listen(port);
console.log('Server running at http://127.0.0.1:' + port);

