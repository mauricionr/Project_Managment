
var BSON = require('mongodb').BSONPure,
	tableName = 'Projects';

exports.add = function(db) {
	return function(req, res){

		var userInfo = {
				username: req.session.currentUser.username, 
				_id: req.session.currentUser._id
			},
			project = { 
				"Name" : req.body.projname,
				"Description" : req.body.description,
				"StartDate" : req.body.startdate,
				"Status" : req.body.status,
				"Estimated Duration" : req.body.duration,
				"EnteredOn": new Date(),
				"CreatedBy": userInfo,
			}
		
		console.log("project\n", project);
		var collection =db.get(tableName);
		collection.insert(project, function(err, doc) {
			if(err){
				res.send("Psh what database");
			}
			else {
				console.log("Project inserted successful");
				res.location("dashboard");
				res.redirect("dashboard");
			}
			
		});
	}
}

exports.edit = function(db){
	return function(req, res){
		IsEnabled = false;
		var collection =db.get(tableName);
		if (req.body['delete']==='') {
			var project = { _id : BSON.ObjectID.createFromHexString(req.query._id) }
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
			var oldRecord = req.session.oldValues[0];
			var updateList = {}
			if (oldRecord.Name!=req.body.projname)
			{
				updateList['Name'] = req.body.projname;
			}
			if (oldRecord.Description!=req.body.description)
			{
				updateList['Description'] = req.body.description;
			}
			if (oldRecord.StartDate!=req.body.startdate)
			{
				updateList['StartDate'] = req.body.startdate;
			}			
			if (oldRecord.Status!=req.body.status)
			{
				updateList['Status'] = req.body.status;
			}				
			if (oldRecord['Estimated Duration']!=req.body.duration)
			{
				updateList['Estimated Duration'] = req.body.duration;
			}				
			console.log("here are the changes\n", updateList)
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
			console.log('exports.project', req.query._id!=null ? req.query._id: "no value");
			console.log('req.body\n', req.body);
			var p_id = BSON.ObjectID.createFromHexString(req.query._id);
			var collection = db.get(tableName);
			var collection1 = db.get('Tasks');
			var collection2 = db.get('timesheets');
			var collection3 = db.get('accounts');
			if (req.body['enabler']==='') {
				console.log("Enabled");
				console.log(req.session.curRecord);
				IsEnabled = true;
			} 
			console.log('IsEnabled', IsEnabled);
			collection.find({_id: p_id},{}, function(e, proj){
				collection1.find({Project: req.query._id},{}, function(e,task){
					var filter = [];
					for (var t in task)
						filter.push(task[t]._id);
					console.log('task filter', filter);		
					collection2.find({Task: {$in: filter}}, {}, function(e, timesheet) {
						filter = [];
						for (var t in timesheet)
							filter.push(BSON.ObjectID.createFromHexString(timesheet[t].user));
						console.log('user filter', filter);		
						collection3.find({_id: {$in: filter}}, {}, function(e, account) {
							res.render('viewproject', {
								"projectlist": proj,
								"userlist": account,
								"tasklist": task,
								"timesheetlist" : timesheet,
								"IsEnabled" : IsEnabled,
								"currentUser": req.session.currentUser
							});
						});
					});			
				});
			});
		}
	};
};

exports.list = function(db){
	return function(req, res){
		var collection = db.get(tableName),
			collection1 = db.get('accounts'),
			collection2 = db.get('Tasks'),
			collection3 = db.get('Timesheets'),
			filter = {};
		
		collection.find({},{}, function(e, proj){
			collection1.find({},{}, function(e,account){
				collection2.find({}, {}, function(e, task) {
					collection3.find({}, {}, function(e, timesheet) {
						res.render('projects', {
							"projectlist": proj,
							"userlist": account,
							"tasklist": task,
							"timesheetlist" : timesheet,
							"currentUser": req.session.currentUser
						});
					});
				});
			});
		});
	};
};

exports.callNew = function(req, res){
	res.render('newproject', 
		{
			title: "Add a New Project",
			"currentUser": req.session.currentUser
		}
	);
};

exports.record = function(db){
	return function(req, res){
		console.log('project.record', req.query._id);
		var p_id = BSON.ObjectID.createFromHexString(req.query._id),
	 		collection = db.get(tableName),
			collection1 = db.get('Tasks'),
			collection2 = db.get('Timesheets'),
			collection3 = db.get('accounts');
		collection.find({_id: p_id},{}, function(e, proj){
			collection1.find({"Project._id": req.query._id},{}, function(e,task){
				var filter = [];
				for (var t in task)
					filter.push(task[t]._id);
					console.log("filter tasks", filter);
				collection2.find({Task: {$in: filter}}, {}, function(e, timesheet) {
					filter = [];
					for (var t in timesheet)
						filter.push(BSON.ObjectID.createFromHexString(timesheet[t].user));				
					collection3.find({_id: {$in: filter}}, {}, function(e, account) {
						req.session.oldValues = proj;
						req.session.curRecord = { "table": tableName, "Record": proj }
						console.log('req.session.curRecord\n', req.session.curRecord);
						res.render('viewproject', {
							"projectlist": proj,
							"tasklist": task,
							"timesheetlist" : timesheet,
							"userlist": account,
							"IsEnabled": false,
							"currentUser": req.session.currentUser
						});
					});
				});			
			});
		});
	};
};