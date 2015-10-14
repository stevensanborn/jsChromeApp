
define(['jquery','backbone','TweenMax','AppState','JSZip'], function($,Backbone,TweenMax,AppState,JSZip) {


	function LandingView(){

	}


	LandingView.prototype.getFS=function(callback){

		window.webkitRequestFileSystem( PERSISTENT, 1024 * 1024 * 1024,
		        function(fs) { callback( fs) });
	}

	LandingView.prototype.removeFile=function(file,callback){
		
		var that =this;

		this.getFS(function(fs){

			fs.root.getFile(file, {create: false}, function(fileEntry) {
		    
			    fileEntry.remove(function() {

			      console.log('File removed.');
			      callback();

			    }, function(e ){console.log("error removing gile"+e);});

			},function(e){  callback();});

		},this.errorHandler);
	}

	LandingView.prototype.writeFSFile=function(file,callback){

		//remove file
		var that=this;

		
		this.getFS(function(fs){
			
			console.log("get file create");

	    	fs.root.getFile( file, {create: true, exclusive: true},
	        	
	        	function(fileEntry) {
	        		
	        		console.log("File "+fileEntry);

		        	fileEntry.createWriter(function(fileWriter) {
		                console.log('fileWriter: ' + fileWriter);
		                fileWriter.onwriteend = function(e) {
		                  console.log('Write completed.');
		               };

		                fileWriter.onerror = function(e) {
		                  console.log('Write failed: ' + e.toString());
		                };

		                var text=""
			            for (var i = 0; i < 1; i++) {
			            	
			            	text+='01234567890123456789012345678901234567890123456789';
			                //bb.append('01234567890123456789012345678901234567890123456789');

			            }
			            var blob = new Blob([text], {type: 'text/plain'});
		                
			        	
			        	fileWriter.write(blob);

	        		});

	    	},that.errorHandler);
			
		});

	}

	LandingView.prototype.runTest=function(){

		var that=this;


		$("#btnTest").text("Downloading...");

       var xhr = new XMLHttpRequest();
					xhr.open('GET', 'https://brookfield-ipad-content.s3.amazonaws.com/development%20builds/Assets.zip', true);
					xhr.responseType = 'blob';

		xhr.onload = function(e) {
		  if (this.status == 200) {
		  	console.log("downloaded ...");
		  
		  	var response=this.response;
		    $("#btnTest").text("Installing...");
		    that.cleanAssetsDirectory(function(){
			    that.unzip(	response);
		    });

		  }
		};

		xhr.send();
	

	}

	LandingView.prototype.genAssetsDirectory=function(callback){
		that =this;

		this.getFS(function(fs){

			fs.root.getDirectory("assets/",{create:true},function(dirEntry){
				console.log("created new assets directory");
				callback();

			},function(e){
				console.log("error making assets directory");
				that.errorHandler(e);
			});

		},this.errorHandler);

	}

	LandingView.prototype.cleanAssetsDirectory=function(callback){


		var that = this;
			
		this.getFS(function(fs){

			//remove old assets folder
			fs.root.getDirectory("assets/",{create:false},function(dirEntry){

				dirEntry.removeRecursively(function() {
					console.log("removed old assets folder");
					that.genAssetsDirectory(callback);
			});

			},function(error){
				console.log("error");
				//recreate the file
				that.genAssetsDirectory(callback);

			});

		});

	}

	LandingView.prototype.createDir=function(rootDirEntry, folders,index,callback){
		
		var that=this;
		
		
		if(folders==null || folders.length==0 || index>=folders.length ){
			callback();
			//console.log("complete folder "+folders);
			return;
		}

			var strDir=folders.slice(0,index+1).join("/");

		  rootDirEntry.getDirectory(strDir, {create: true}, function(dirEntry) {
		    // Recursively add the new subfolder (if we still have another to create).
		    //console.log("created folder "+strDir);

		      that.createDir(rootDirEntry, folders,index+1,callback);
		   		
		  }, function(e){
		  	//this.errorHandler(e);
		  	console.log("error folder:"+strDir);
		  });



	}

	LandingView.prototype.unzip=function(data){

		var that = this;
		
		//grab a file system
		this.getFS(function(fs){


			var fileReader= new FileReader();
			
			fileReader.onload = function(theFile) {


				//console.log("loaded file "+theFile.name);

				var count_loaded=0;

				var zip = new JSZip();
				
				zip.load(theFile.target.result);
				
				var count_total=Object.keys(zip.files).length;
				
				$.each(zip.files, function (index, zipEntry) {
					var buffer = zipEntry.asArrayBuffer();
					//console.log(buffer.byteLength);
					//console.log(zipEntry.name);
				//	console.log(zipEntry.name);
								
					var blob = new Blob([buffer]);

						//create the file
						var arrFolders=("assets/"+zipEntry.name).split('/');
						arrFolders.pop();
						that.createDir(fs.root,arrFolders,0
							,function(){
									//console.log("finished");
									fs.root.getFile( "assets/"+zipEntry.name, {create: true, exclusive: true},
										
										function(fileEntry) {
											fileEntry.createWriter(function(fileWriter) {
							                fileWriter.onwriteend = function(e) {
							                  //console.log('Write completed. '+zipEntry.name);
							                
							                  	count_loaded++;
							                  	$("#btnTest").text("Installation"+count_loaded+"/"+count_total);
							                  	if(count_loaded==count_total){
							                  		$("#btnTest").text("Installation Complete");

							                  		fs.root.getFile("assets/Assets/ui/main/main-bg.jpg",{},function(fileEntry) {

							                  			$("#main-container").css({'background-image':'url('+ fileEntry.toURL()+')','background-size':'cover'});

							                  		});
							                  	}
							               	};

							                fileWriter.onerror = function(e) {
							                  console.log('Write failed: ' + e.toString());
							                  count++;
							                };

							                fileWriter.write(blob);

										},function(e){count_loaded++;that.errorHandler(e);});

								},function(e){count_loaded++;that.errorHandler(e);});

					},function(e){count_loaded++;that.errorHandler(e);});

				});

			};
			console.log(data);
			fileReader.readAsArrayBuffer(data);
		//

		});
	}

	LandingView.prototype.errorHandler =function (e) {
		  var msg = '';

		  // switch (e.code) {
		  //   case FileError.QUOTA_EXCEEDED_ERR:
		  //     msg = 'QUOTA_EXCEEDED_ERR';
		  //     break;
		  //   case FileError.NOT_FOUND_ERR:
		  //     msg = 'NOT_FOUND_ERR';
		  //     break;
		  //   case FileError.SECURITY_ERR:
		  //     msg = 'SECURITY_ERR';
		  //     break;
		  //   case FileError.INVALID_MODIFICATION_ERR:
		  //     msg = 'INVALID_MODIFICATION_ERR';
		  //     break;
		  //   case FileError.INVALID_STATE_ERR:
		  //     msg = 'INVALID_STATE_ERR';
		  //     break;
		  //   default:
		  //     msg = 'Unknown Error';
		  //     break;
		  // };

		  console.log('Error: ' + e.name+" "+e.message);
	}


	LandingView.prototype.render = function() {
		var that =this;

		console.log("render "+that);

		var btn=$("<div>");

		btn.addClass("btn intro-btn");
		
		btn.text("Start");
		
		btn.one('click',function(){
			
			var el = document.body;
				// Supports most browsers and their versions.
			  var requestMethod = el.requestFullScreen || el.webkitRequestFullScreen  || el.mozRequestFullScreen || el.msRequestFullScreen;

			  if (requestMethod) {

			    // Native full screen.
			    requestMethod.call(el);

			  } else if (typeof window.ActiveXObject !== "undefined") {

			    // Older IE.
			    var wscript = new ActiveXObject("WScript.Shell");

			    if (wscript !== null) {
			      wscript.SendKeys("{F11}");
			    }

			  }

			require("router").navigate('intro',{trigger:true,replace:true});

		});

		$("#main-container").append(btn);

		if(AppState.chromeApp){

			console.log("render chrome" );

			var btnTest=$("<div>");
			btnTest.text("Chrome test");
			btnTest.on('click',function(){that.runTest()});
			btnTest.attr('id',"btnTest");
			btnTest.addClass("btn intro-btn");
			$("#main-container").append(btnTest);
		}


		TweenMax.from($("#main-container"),0.5,{opacity:0});
	};

	return LandingView;

});

