
/*
 * GET users listing.
 */
var BSON = require('mongodb').BSONPure,
	tableName = 'accounts';

exports.list = function(db){
	return function(req, res){
		var collection = db.get(tableName);
		var collection1 = db.get('Tasks');
		var collection2 = db.get('Projects');
		var collection3 = db.get('Timesheets');
		
		collection.find({},{}, function(e, account) {
			collection1.find({},{}, function(e, task) {
				collection2.find({}, {}, function(e, proj) {
					collection3.find({}, {}, function(e, timesheet) {
						res.render('users', {
							"users": account,
							"tasklist": task,
							"projectlist": proj,
							"timesheetlist" : timesheet,
							"currentUser": req.session.currentUser
						});
					});
				});
			});
		});
	};
};

exports.record = function(db){
	return function(req, res){
		var obj_id = BSON.ObjectID.createFromHexString(req.query._id),
			collection = db.get(tableName);
			collection1 = db.get('Timesheets'),
			collection2 = db.get('Tasks'),
			collection3 = db.get('Projects')
		collection.find({_id: obj_id},{}, function(e, account){
			console.log('account search for:', req.query._id);
			req.session.curRecord = { "table": tableName, Record: account }
			collection1.find({"user": req.query._id},{}, function(e, timesheet){
				var filter = [];
				for (var rec in timesheet)
					filter.push(BSON.ObjectID.createFromHexString(timesheet[rec].Task));
				collection2.find({_id: {$in: filter}}, {}, function(e, task) {
					var filter = [];
					for (var t in task)
						filter.push(BSON.ObjectID.createFromHexString(task[t].Project));
					collection3.find({_id: {$in: filter}}, {}, function(e, proj) {
						req.session.oldValues = account;
						res.render('viewuser', {
							"userlist": account, 
							"timesheetlist" : timesheet,
							"tasklist": task,
							"projectlist": proj,
							"IsEnabled": false,
							"currentUser": req.session.currentUser
						});
					});
				});
			});
		});
	};
};

exports.add = function(db){
	return function(req, res){
		//req.assert('userName', 'User Name is  required').notEmpty();           
    	//req.assert('userEmail', 'User Email is required').notEmpty();
    	//req.assert('userPassword', 'Password is required').notEmpty();
		//req.assert('status', 'Status Detail is required').notEmpty();
		//req.assert('endtime', 'End Date is required').notEmpty(); 	
	    //req.assert('role', 'Role is required').notEmpty(); 
		
		//var errors = req.validationErrors(); 
		//console.log(errors);
    	//if( !errors) {   //Display errors to 
		var collection =db.get(tableName),
			thisUser = {
				'_id': req.session.currentUser._id,
				'username': req.session.currentUser.username
			},
			record = {
				"username": req.body.username,
				"email": req.body.useremail,
				"password": req.body.userpassword,
				"status" : req.body.status,
				"Role" : req.body.role,
				"EnteredOn": new Date(),
				"CreatedBy": thisUser
			}
		collection.insert(record, function(err, doc) {
			if(err){
				res.send("Psh what database");
			}
			else {
				if (req.session.currentUser && req.session.currentUser.length>0) {
					res.render('buttons', 
						{ 
							title: currentUser.username, 
							'currentUser' : req.session.currentUser
						}
					);
				} else {
					res.render('login', { title: 'Welcome to the Project Manager' });
				}
			}
		});
		//} else {
		//	res.render('newuser', { errors: errors, messges:errors });		
		//}
	}
}

exports.edit = function(db){
	return function(req, res){
		console.log('exports.edit');
		var collection =db.get(tableName);
		if (req.body['delete']==='') {
			console.log('going to delete');
			var project = { _id : BSON.ObjectID.createFromHexString(req.query._id) };
			collection.remove(project, function(err, doc) {
				if(err){
					res.send("Psh what database");
				}
				else {
					console.log("Record deleted successful");
					res.location("dashboard");
					res.redirect("dashboard");
				}
			});
		} else if (req.body['edit']==='') {
			var filter = { _id : BSON.ObjectID.createFromHexString(req.query._id) };
			console.log('req.sessions.oldValues\n', req.session.oldValues);
			console.log('req.session.req.body\n', req.body);
			var updateList = {}
			var oldRecord = req.session.oldValues[0],
				updateList = {};
			if (oldRecord.username!=req.body.username)
			{
				updateList['username'] = req.body.username;
			}
			if (oldRecord['email']!=req.body.useremail)
			{
				updateList['email'] = req.body.useremail;
			}	
			if (oldRecord['password']!=req.body.userpassword)
			{
				updateList['password'] = req.body.userpassword;
			}				
			if (oldRecord['status']!=req.body.status)
			{
				updateList['status'] = req.body.status;
			}				
			if (oldRecord.Role!=req.body.role)
			{
				updateList['Role'] = req.body.role;
			}			
			console.log("updateList\n", updateList);
			collection.update(filter, {$set: updateList}, {}, function(err, doc) {
				if(err){
					res.send("Psh what database");
				}
				else {
					console.log("Record updated successful");
					res.location("dashboard");
					res.redirect("dashboard");
				}
			});
		} else {
			
			console.log('exports.edit', req.query._id!=null ? req.query._id: "no value");
			var obj_id = BSON.ObjectID.createFromHexString(req.query._id),
				collection1 = db.get('Timesheets'),
				collection2 = db.get('Tasks'),
				collection3 = db.get('Projects');
			if (req.body['enabler']==='') {
				console.log("Enabled");
				IsEnabled = true;
			} else {
				console.log("Not Enabled");
				IsEnabled = 'Disabled';
			}
			console.log('IsEnabled', IsEnabled);
			collection.find({_id : obj_id},{}, function(e, account){
				collection1.find({"user": req.query._id},{}, function(e, timesheet){
					var filter = [];
					for (var rec in timesheet)
						filter.push(BSON.ObjectID.createFromHexString(timesheet[rec].Task));
					collection2.find({_id: {$in: filter}}, {}, function(e, task) {
						var filter = [];
						for (var t in task)
							filter.push(BSON.ObjectID.createFromHexString(task[t].Project));
						collection3.find({_id: {$in: filter}}, {}, function(e, proj) {
							res.render('viewuser', {
								"userlist": account, 
								"timesheetlist" : timesheet,
								"tasklist": task,
								"projectlist": proj,
								"IsEnabled": IsEnabled,
								"currentUser": req.session.currentUser
							});
						});
					});
				});
			});
		}
	};
};
exports.callNew = function(req, res){
	res.render('newuser', 
		{
			title: "Add a New User",
			"currentUser": req.session.currentUser
		}
	);
};

exports.login=function(req,res){
	res.render('login',{title:"User Login"});
};

exports.checklogin = function(db, next){
	return function(req, res, next){
		
		var userName = req.body.username;
		var userPassword = req.body.userpassword;
		var collection =db.get(tableName);
		console.log(collection);
		var currentUser = {
			"username": userName,
			"password": userPassword
		}
		collection.findOne(currentUser, function(err, doc) {
			if(err){
				console.log(err);
				res.send("Psh what database");
			} else if(doc === null){
				console.log("User name and password not found");
				res.render("login", {
					title: "Incorrect Login",
					reason: "No account matched credentials entered.  Try again."
					}
				);
			} else {
				console.log("user record found\n", doc);
				req.session.currentUser = doc
				res.render('buttons', 
					{ 
						title: currentUser.username, 
						'currentUser' : req.session.currentUser
					}
				);
			}
			
		});
	}
}
