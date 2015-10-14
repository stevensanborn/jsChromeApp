


define(['jquery','backbone','AppState','scripts/src/views/landing','scripts/src/views/intro'],function($,Backbone,AppState,Landing,Intro){


	//ROUTER
	var Router= Backbone.Router.extend({
		
		routes:{
			'':'landing',
			'intro':'intro'

		}
	});

	var router= new Router();

	router.on('route:landing',function(){
		(new Landing()).render();
	});

	router.on('route:intro',function(){
		
		(new Intro()).render();
	});

	$(document).ready(function(){

		
		if(AppState.bChromeApp){
			console.log("chrome app");
		}


	});

	return router;

});
