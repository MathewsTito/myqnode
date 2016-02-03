/*************************************************************************************
/* NodeJS Module to control Chamberlain's MyQ Garage Door. The 
/* api methods all return es-6 Promises
/*
/* NOTE: To find your deviceId, run the getDevices() method and log
/*       the respObj. (See included example.js file to see how). In 
/*       the output that is logged, look for a device with attribute 
/*       MyQDeviceTypeName: 'GarageDoorOpener' or TypeId: 47. Use 
/*       the corresponding 'DeviceId' attribute as the deviceId.
/* 
/* 10/02/2014 - Tito Mathews 			- Initial Coding
/*
/*************************************************************************************/


var https = require("https");
var http = require("http");
var Promise = require('es6-promise').Promise;

var myQ = (function() {

	
	
	var myQImpl = {

		doorstates: ["Undefined","Open","Closed","Undefined","Opening","Closing"], // 1= Open, 2=Closed, 4=Opening, 5=Closing
		
		appKey : "Vj8pQggXLhLy0WHahglCD4N1nAkkXQtGYpq2HrHD7H1nvmbT55KqtN6RSF4ILB%2fi",
		secToken : 'null',
		options : {},

		getConnection : function(username, password) {
			that = this;
			if (this.secToken === 'null') {
				return this.authenticate(username, password).then(
						function(respObj) {
							return that.getDeviceList();
						});

			} else {
				return that.getDeviceList();
			}
		},



		getDeviceStatus : function(deviceId) {
			this.options = {
				path : '/Device/getDeviceAttribute?appId=<%appId%>&securityToken=<%secToken%>&devId=<%deviceId%>&name=doorstate',
				method : 'GET',
			};

			this.options.path = this.options.path.replace("<%deviceId%>",
					deviceId);

			that = this;
			p = new Promise(this.invokeService).then(function(respObj) {
				if (respObj.ReturnCode !== '0'){
					throw new Error("getDeviceStatus returned"+respObj.ReturnCode);	
				}
				return respObj;
			});

			return p;

		},



		setDeviceStatus : function(deviceId,newState) {
			this.options = {
				path : '/Device/setDeviceAttribute',
				method : 'PUT',
			};

			var body = {};
  			body.DeviceId =deviceId,
   			body.ApplicationId =this.appKey,
			body.AttributeName ='desireddoorstate',
      			body.AttributeValue =newState,
      			body.securityToken =this.secToken					
			
			this.options.body = body;

			that = this;
			p = new Promise(this.invokeService).then(function(respObj) {
				if (respObj.ReturnCode !== '0'){
					throw new Error("setDeviceStatus returned"+respObj.ReturnCode);	
				}
				return respObj;
			});

			return p;

		},



		authenticate : function(username, password) {
			this.options = {
				path : '/api/user/validatewithculture?appId=<%appId%>&username=<%username%>&password=<%password%>&culture=en',
				method : 'GET',
			};

			this.options.path = this.options.path.replace("<%username%>",
					username);
			this.options.path = this.options.path.replace("<%password%>",
					password);

			that = this;
			p = new Promise(this.invokeService).then(function(respObj) {
				//console.log(respObj);
				that.secToken = respObj.SecurityToken;
			});

			return p;

		},



		getDeviceList : function() {
			this.options = {
				path : '/api/userdevicedetails?appId=<%appId%>&securityToken=<%secToken%>',
				method : 'GET',
			};

			that = this;

			return new Promise(this.invokeService).then(function(respObj) {
				//console.log(respObj);	
				if (respObj.ReturnCode !== '0'){
					throw new Error("getDeviceList returned"+respObj.ReturnCode);	
				}
				return respObj;
			});

		},



		invokeService : function(resolve, reject) {

			that.options.port = 443;
			that.options.host = 'myqexternal.myqdevice.com';
			that.options.headers = {
				'Content-Type' : 'application/json'
			};

			that.options.path = that.options.path.replace("<%appId%>",
					that.appKey);
			that.options.path = that.options.path.replace("<%secToken%>",
					that.secToken);

			var protocol = that.options.port == 443 ? https : http;

			var request = protocol.request(that.options, function(response) {
				var output = '';
				//console.log(that.options.host + ':' + response.statusCode);
				response.setEncoding('utf8');

				response.on('data', function(chunk) {
					output += chunk;
				});

				response.on('end', function() {
					var obj = JSON.parse(output);
					resolve(obj);
				});

			});
			request.on('error', function(err) {
				console.log("Error" + err);
				reject(new Error(err));
			});

			if (that.options.method === 'PUT'){
				request.write(JSON.stringify(that.options.body));
			}

			request.end();

		}

	};

	return {

		//below are the various api methods..all methods return es6-promise objects.

    		//Returns devices on your account 
		getDevices : function(username,password) {
			return myQImpl.getConnection(username, password).then(function(respObj){
				return myQImpl.getDeviceList()
			});		
		},

		//Returns the status of the Garage door opener with the the given deviceId
		getDoorStatus : function(username, password, deviceId) {
			return myQImpl.getConnection(username, password).then(function(respObj){
				return myQImpl.getDeviceStatus(deviceId)
			}).then(function(respObj){
				return myQImpl.doorstates[respObj.AttributeValue];
			});
		},

		//Opens the garage door with the given deviceId
		openDoor : function(username, password, deviceId) {
			return myQImpl.getConnection(username, password).then(function(respObj){
				return myQImpl.setDeviceStatus(deviceId,1);
			}).then(function(respObj){
				//console.log(respObj);	
				return respObj.ReturnCode;
			});
		},

		//Closes the garage door with the given device id.
		closeDoor : function(username, password, deviceId) {
			return myQImpl.getConnection(username, password).then(function(respObj){
				return myQImpl.setDeviceStatus(deviceId,0);
			}).then(function(respObj){
				return respObj.ReturnCode;
			});
		},

		//Elapsed time since the current state of the given device id
		elapsedTime : function(){
				return Promise.reject(new Error("Not implemented"));
		}

	};

})();

exports.myQ = myQ;
