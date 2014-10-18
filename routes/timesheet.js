var BSON = require('mongodb').BSONPure,
	tableName = 'Timesheets';
	
exports.newtimesheet = function(req, res){
	console.log("calling newtimesheet");
	res.render("newtimesheet", 
		{
			title: "Add a New Timesheet",
			"currentUser": req.session.currentUser
		}
	);
};

exports.record = function(db){
	return function(req, res){
		var obj_id = BSON.ObjectID.createFromHexString(req.query._id),
			collection = db.get(tableName);
			collection1 = db.get('Tasks');
			collection2 = db.get('accounts');
			collection3 = db.get('Project');
		console.log('req.session.curRecord', req.session.curRecord);
		collection.find({_id: obj_id},{}, function(e, timesheet){
			req.session.curRecord = {
				"table": tableName, "_id" : obj_id, "Name": timesheet.Name
			}		
			console.log('timesheet search for:', req.query._id);
			collection1.find({_id: obj_id},{}, function(e, task){
				var filter = [];
				for (var t in task)
					filter.push(BSON.ObjectID.createFromHexString(task[t].Project));
				collection3.find({_id: {$in: filter}}, {}, function(e, proj) {
					req.session.oldValues = timesheet;
					res.render('viewtimesheet', {
						"timesheetlist" : timesheet,
						"tasklist": task,
						"projectlist": proj,
						"IsEnabled": false,
						"currentUser": req.session.currentUser
					});
				});
			});
		});
	};
};

exports.add = function(db) {
	return function(req, res){
		console.log('req.body\n', req.body);
			var start = req.body.starttime,
				end = req.body.endtime,
				workDescription = req.body.description,
				Status = req.body.status,
				task = {};
			if (req.session.curRecord && req.session.curRecord['table']==='Tasks'){
				console.log("getting value from req.session.curRecord", req.session.curRecord);
				task['_id'] = req.session.curRecord.Record[0]._id
				task['Name'] = req.session.curRecord.Record[0].Name
				console.log('getting val from curRecord', req.session.curRecord.Record[0].Name);
			} else {
				console.log("getting value from req.body.Task", req.body.Task);
				task['_id'] = req.body.Task;
				task['Name'] = 'Not Acquired';
			}	
			console.log(req.session.currentUser);
			var thisuser = {
				_id: req.session.currentUser._id,
				username: req.session.currentUser.username
			},
				timesheet = {
					"Name" : req.body.timesheetname,
					"Work Description" : workDescription,
					"Start Time" : start,
					"End Time" : end,
					"Status" : "Initialized",
					"Task" : task,
					"user" : thisuser,
					"EnteredOn": new Date(),
					"CreatedBy": thisuser
				}
		console.log("timesheet\n", timesheet);
		var collection =db.get(tableName);
		collection.insert(timesheet, function(err, doc) {
			if(err){
				res.send("Psh what database");
			}
			else {
				console.log("Timesheet inserted successful");
				res.location("dashboard");
				res.redirect("dashboard");
			}
			
		});
	}
}

exports.callNew = function(db){
	return function(req, res){
		console.log('timesheet.callNew');
		console.log('currentUser', req.session.currentUser);
		console.log('req.session.curRecord\n', req.session.curRecord);
		var collection = db.get('Tasks')
		collection.find({},{}, function(e, task){
			res.render('newtimesheet', {
				"tasklist": task,
				title: "Add a New timesheet",
				curRecord: (req.session.curRecord != null) 
					? req.session.curRecord: undefined,
				"currentUser": req.session.currentUser
			});
		});
	};
};


exports.list = function(db){
	return function(req, res){
		var collection = db.get(tableName);
		var collection1 = db.get('accounts');
		var collection2 = db.get('Projects');
		var collection3 = db.get('Tasks');
		
		collection.find({},{}, function(e, timesheet){
			collection1.find({},{}, function(e,account){
				collection2.find({}, {}, function(e, proj) {
				collection3.find({}, {}, function(e, task) {
						console.log('dataset to display\n', timesheet);
						res.render('timesheets', {
							"timesheetlist" : timesheet,
							"userlist": account,
							"projectlist": proj,
							"tasklist": task,
							"currentUser": req.session.currentUser
						});
					});
				});
			});
		});
	};
};

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
			if (oldRecord.Name!=req.body.timesheetname)
			{
				updateList['Name'] = req.body.timesheetname;
			}
			if (oldRecord['Work Description']!=req.body.description)
			{
				updateList['Work Description'] = req.body.description;
			}	
			if (oldRecord['Start Time']!=req.body.start)
			{
				updateList['Start Time'] = req.body.start;
			}				
			if (oldRecord['End Time']!=req.body.end)
			{
				updateList['End Time'] = req.body.end;
			}				
			if (oldRecord.Status!=req.body.status)
			{
				updateList['Status'] = req.body.status;
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
				collection1 = db.get('accounts'),
				collection2 = db.get('Projects'),
				collection3 = db.get('Tasks');
			if (req.body['enabler']==='') {
				console.log("Enabled");
				console.log(req);
				IsEnabled = true;
			} else {
				console.log("Not Enabled");
				IsEnabled = 'Disabled';
			}
			console.log('IsEnabled', IsEnabled);
			console.log(req.session.curRecord);
			collection.find({_id: obj_id},{}, function(e, timesheet){
				collection1.find({},{}, function(e,account){
					collection2.find({}, {}, function(e, proj) {
						collection3.find({Task: req.query._id}, {}, function(e, task) {
							res.render('viewtimesheet', {
								"timesheetlist" : timesheet,
								"userlist": account,
								"projectlist": proj,
								"tasklist": task,
								"currentUser": req.session.currentUser
							});
						});
					});
				});
			});
		}
	};
};