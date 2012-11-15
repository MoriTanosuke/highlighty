var connect = require('connect')
   ,render = require('connect-render')
   ,urlrouter = require('urlrouter')
   ,redis = require('redis-url').connect(process.env.REDISTOGO_URL || "http://127.0.0.1:6379")
;

var port = process.env.PORT || 8888;

var app = connect(render({
		root: __dirname + '/views',
		layout: 'index.html',
		cache: false
	}))
	.use(connect.static('public'))
	.use(connect.favicon())
	.use(connect.bodyParser())
	.use(urlrouter(function(app) {
	app.post('/save', function(req, res, next) {
		redis.get('next.id', function(err, id) {
			if(err) {
				res.end('Something went wrong! <a href="/">Try again.</a>');
			} else {
				// remember used IDs for lookup
				redis.rpush('used.ids', id);
				redis.incr('next.id');
				// store the new paste
				redis.set(id + ':source', req.body.source);
				redis.set(id + ':brush', req.body.brush);
				res.end('<a href="/paste/' + id + '">click here to see your saved paste</a>');
			}
		});
	});
	app.get('/paste/:id', function(req, res, next) {
		var id = req.params.id;

		redis.get(id + ':source', function(err, source) {
			if(err) {
				//TODO display message if paste not found
				res.render('index.html', {msg: 'Not found!'});
			} else {
				redis.get(id + ':brush', function(err, brush) {
					redis.lrange('used.ids', -10, -1, function(err, data) {
						if(err) {
							res.render('index.html', {msg: err});
						} else {
							res.render('index.html', {source: source, brush: brush, pastes: data});
						}
					});
				});
			}
		});
	});
	}))
	.use(function(req, res) {
		redis.lrange('used.ids', -10, -1, function(err, data) {
			console.log('used.ids=' + data + "," + err);
			if(err) {
				res.render('index.html', {msg: err});
			} else {
				res.render('index.html', {source: '', brush: '', url: req.url, pastes: data});
			}
		});
	})
	.listen(port);
console.log('Server running at http://127.0.0.1:' + port);

