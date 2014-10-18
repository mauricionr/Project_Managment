
/*
 * GET home page.
 */


var BSON = require('mongodb').BSONPure;
var ImEnabled = false;

exports.index = function(req, res){
	req.session.curRecord = {};
	console.log(req.session.currentUser);
	if (req.session.currentUser!=undefined) {
  		res.render('buttons', 
  			{ 
  				title: req.session.currentUser.username, 
  				currentUser : req.session.currentUser
  			}
  		);
  	} else {
  		req.session.currentUser = {};
  		res.render('login', { title: 'Welcome to the Project Manager' });
  	}
};

exports.dashboard = function(db){
	return function(req, res){
		req.session.curRecord = {};
		var collection = db.get('accounts');
		var collection1 = db.get('Projects');
		var collection2 = db.get('Tasks');
		var collection3 = db.get('Timesheets');
		
		collection.find({},{}, function(e, docs){
			collection1.find({},{}, function(e,proj){
				collection2.find({}, {}, function(e, task) {
				collection3.find({}, {}, function(e, timesheet) {
						res.render('dashboard', {
							"dashboard": docs,
							"projectlist": proj,
							"tasklist": task,
							"timesheetlist" : timesheet,
							currentUser : req.session.currentUser
						});
					});
				});
			});
		});
	};
};


