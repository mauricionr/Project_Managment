
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var project = require('./routes/project');
var task = require('./routes/task');
var timesheet = require('./routes/timesheet');

var http = require('http');
var path = require('path');
var BSON = require('mongodb').BSONPure;
var validator = require('express-validator');
var app = express();

//db aacess
var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/proj1')

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(validator());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// Asynchronous
var auth = express.basicAuth(function(user, pass, callback) {
	
 var result = (user === 'testUser' && pass === 'testPass');
 callback(null /* error */, result);
});


//app.get('/', routes.index);
app.get('/', routes.index);
app.get('/users', user.list(db));
app.get('/newuser', user.callNew);   //trying to get autehntication working
app.get('/newproject', project.callNew);
app.get('/newtask', task.callNew(db));
app.get('/newtimesheet', timesheet.callNew(db));

app.get('/dashboard', routes.dashboard(db));
app.get('/projects', project.list(db));
app.get('/timesheets', timesheet.list(db));
app.get('/tasks', task.list(db));
app.get('/viewproject', project.record(db));
app.get('/viewuser', user.record(db));
app.get('/viewtask', task.record(db));
app.get('/viewtimesheet', timesheet.record(db));
app.get('/editproject', project.record(db));
app.get('/login', user.login);
app.get('/logout', function (req, res) {
  delete req.session.authStatus;
  res.send([
    'You are now logged out.',
    '&lt;br/>',
    '<a href="./login">Return to the login page. You will have to log in again.</a>',
  ].join(''));
});

app.post('/adduser', user.add(db));
app.post('/login', user.checklogin(db));
app.post('/addproject', project.add(db));
app.post('/addtask', task.add(db));
app.post('/addtimesheet', timesheet.add(db));
app.post('/editproject', project.edit(db));
app.post('/edituser', user.edit(db));
app.post('/edittask', task.edit(db));
app.post('/edittimesheet', timesheet.edit(db));

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
