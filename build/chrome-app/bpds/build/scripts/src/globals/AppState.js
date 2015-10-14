define(['jquery'], function($) {


	var instance = null;

	function AppStateSingleton(){


		if(instance !== null){
            throw new Error("Cannot instantiate more than one AppStateSingleton, use AppStateSingleton.getInstance()");
        } 

        this.initialize();

	}


	AppStateSingleton.prototype = {
        
        initialize: function(){
            	
            console.log("intialize AppState");

            this.version=1;

            this.chromeApp=false;


            if($(document.body).hasClass("chrome-app")){
            	console.log("running chrome-app "+chrome.runtime.id);
            	this.chromeApp=true;
                
            }
            else{
            	console.log("running browser version");
            }
            
            
        }

    };


    AppStateSingleton.getInstance =function(){
    	
    	if(instance === null){
            instance = new AppStateSingleton();
        }

        
        return instance;

    };

   


	
	return AppStateSingleton.getInstance();

});