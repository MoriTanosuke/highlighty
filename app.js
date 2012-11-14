var connect = require('connect')
   ,redis   = require('redis-url').connect(process.env.REDISTOGO_URL || "http://127.0.0.1:6379")
;

var port = process.env.PORT || 8888;

var app = connect()
	.use(connect.static('public'))
	.use(connect.favicon())
	.use(connect.bodyParser())
	.use(function(req, res) {
		redis.get('next.id', function(err, id) {
			redis.incr('next.id');
			redis.set(id + ':source', req.body.source);
			redis.set(id + ':brush', req.body.brush);
			res.end('<a href="/' + id + '">click here to continue</a>');
		});
	})
	.listen(port);
console.log('Server running at http://127.0.0.1:' + port);

