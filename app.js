var connect = require('connect')
   ,urlrouter = require('urlrouter')
   ,redis   = require('redis-url').connect(process.env.REDISTOGO_URL || "http://127.0.0.1:6379")
;

var port = process.env.PORT || 8888;

var app = connect()
	.use(connect.static('public'))
	.use(connect.favicon())
	.use(connect.bodyParser())
	.use(urlrouter(function(app) {
	app.post('/save', function(req, res, next) {
		redis.get('next.id', function(err, id) {
			redis.incr('next.id');
			redis.set(id + ':source', req.body.source);
			redis.set(id + ':brush', req.body.brush);
			res.end('<a href="/' + id + '">click here to continue</a>');
		});
	});
	app.get('/:id', function(req, res, next) {
	var id = req.params.id;
	redis.get(id + ':source', function(err, source) {
		redis.get(id + ':brush', function(err, brush) {
			console.log("source=" + source);
			console.log("brush=" + brush);
			res.end(source);
		});
	});
  });
}))
	.listen(port);
console.log('Server running at http://127.0.0.1:' + port);

