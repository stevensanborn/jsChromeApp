
define(['jquery','backbone','TweenMax','AppState'], function($,Backbone,TweenMax,AppState) {


	function IntroView(){

	}


	IntroView.prototype.render = function() {
			
		console.log("IntroView");
		
		$("#main-container").empty();

		$("#main-container").text("LANDING");

		var img=new Image();
		
		img.src="assets/main-bg.jpg";

		$("#main-container").append(img);

		TweenMax.from($("#container"),0.5,{opacity:0.0});

		

		

	};

	return IntroView;

});

