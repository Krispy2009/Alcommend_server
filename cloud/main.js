
// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.define("hello", function(request, response) {
  response.success("Hello world!");
});


Parse.Cloud.define("getDrinks", function(request, response) {
  var query = new Parse.Query("Drink");
  query.equalTo("Type", request.params.Type);
  query.find({
    success: function(results) {
      
      response.success(results);
    },
    error: function() {
      response.error("Cannot find Drink: "+request.params.name);
    }
  });
});



Parse.Cloud.define("getDrinkRecord", function(request, response) {
  var query = new Parse.Query("DrinkRecord");
  query.equalTo("objectId", request.params.id);
  query.find({
    success: function(results) {
      
      response.success(results);
    },
    error: function() {
      response.error("Cannot find DrinkRecord: "+ request.params.id);
    }
  });
});




Parse.Cloud.define("getDrinkGroup", function(request, response) {
  var query = new Parse.Query("DrinkGroup");

  query.equalTo("objectId", request.params.id);
  query.include("userId")
  query.find({
    success: function(results) {
      
      response.success(results);
    },
    error: function() {
      response.error("Cannot find DrinkGroup: "+request.params.id);
    }
  });
});



Parse.Cloud.define("getSuggestions", function(request, response){
	dummy_data = {
	
		'KQ2iIoiAu6': {
			'Bqdc1BluVR' : 3,
			'UsTJPjDrkl' : 4,
			'wSYzPlT3St' : 3,
			'rvCfdcSqoh' : 2,
			'OtkxZ3CGGP' : 3,
			'fWDkDfmLHJ' : 4,
		},
		'NByQ8EDssz': {
			'Bqdc1BluVR' : 1,
			'UsTJPjDrkl' : 2,
			'wSYzPlT3St' : 2,
			'rvCfdcSqoh' : 1,
			'ZxqG6QZoFG' : 1,
			'IUBBXxgob9' : 1,
			'OtkxZ3CGGP' : 3,
			'fWDkDfmLHJ' : 1,

		},

	}
	response.success(dummy_data[request.params.userId]);
});





Parse.Cloud.define("getUnitsPerGroup", function(request,response) {
	var query = new Parse.Query("DrinkRecord");
	console.log(request.params)
	query.equalTo("groupId", request.params);



	query.find({
		
		success: function(results){


			var result_array = [];
			var adList = [];
			var queries = [];
			var drinks =[];
			var suggested = [];
			var feeling = getFeeling(request.params.id);
            for (var i=0; i<results.length; i++){
            	var pointer = results[i].get('drinkId')
                var query2 = new Parse.Query("Drink");
                query2.equalTo("objectId",pointer.id);

                var ad = [];
                ad.push(results[i].get('Type'));
                ad.push(results[i].id);
                adList.push(ad);
                queries.push(query2);
            }
            function getFeeling(groupId){	
				var groupQuery = new Parse.Query('DrinkGroup');
				groupQuery.equalTo("objectId", groupId);
				groupQuery.first({
 			 success: function(object) {
    			// Successfully retrieved the object.
    	
  			},
  			error: function(error) {
    		alert("Error: " + error.code + " " + error.message);
  			}
		});

	}
            var totalLength = results.length;
            var total_units = 0;
            	  function calcSuggestedUnits(units, feeling){

            	  	//the worse they feel the less units they should have.
            	  	if(feeling > 1){
            	  		units = units /feeling;
            	  	}

            	  	if (units<= 0) {
            	  		return 0;

            	  	} else if(units >100) {
            	  	
            	  		return calcSuggestedUnits(20);
            	  	} else {

            	  			a = (8-0)/(19-1)
            	  			b = 8 - a*19
            	  			num = a * units + b

            	  		return (Math.round( num * 10 ) / 10).toFixed(1);

            	  	}
            	  
            	  };

            	  function getDrinksList(allowedUnits, drinks){
            	  	currUnits = 0;
            	  	counts = {}

            	  	for(var i=0; i<drinks.length; i++){
      
            	  		if(counts[drinks[i].get('Type')]){
            	  			counts[drinks[i].get('Type')][0] += 1;
            	  			counts[drinks[i].get('Type')].push(drinks[i].get('name'))
            	  		} else {
            	  			counts[drinks[i].get('Type')] =[];
            	  			counts[drinks[i].get('Type')][0] = 1;
            	  			counts[drinks[i].get('Type')].push(drinks[i].get('name'))
            	  		}


            	  	}

            	  	var max_num=0;
            	  	for (c in counts){
            	  		if (counts[c][0] > max_num){
            	  			max_num = counts[c][0];
            	  			drinkType = c
            	  		}
            	  	}

            	  	var drinkQuery = new Parse.Query("Drink");
            	  	drinkQuery.equalTo("Type", drinkType);


            	  	console.log('==============');
            	  	console.log(drinkType);
            	  	
            	  	//for(var name in counts[drinkType]){
            	  	//	drinksQuery.notEqualTo(name)
            	  	//}

            	  	//if (drinksQuery.find().length < 1) {
            	  	//	var drinksQuery = new Parse.Query('Drink');
            	  	//	drinksQuery.notEqualTo("Type", drinkType)
            	  	//};

            	  	drinkQuery.find({
            	  		success: function(suggestedDrinks){
            	  			console.log('helloooooo');
            	  			console.log(suggestedDrinks);
            	  			suggested = suggestedDrinks;
            	  			      response.success(results);

            	  		},

            	  		error: function(){

            	  			response.error("Error retrieving drinks list")
            	  		}
            	  	});

            	  }


       		 	  function makeQueries(qs){
       		 	      qs.shift().first({
       		 	          success: function(currentResult) {
       		 	              // do stuff with currentResult

       		 	              	total_units += currentResult.get('unitPerServing');
       		 	              	drinks.push(currentResult)
       		 	               	result_array.push(currentResult);

       		 	               	console.log(currentResult)



       		 	              if(qs.length){
       		 	                  makeQueries(qs);
       		 	              } else {
       		 	                  
       		 	                  allowed_units = calcSuggestedUnits(total_units,feeling)
       		 	                  
       		 	                										

       		 	                  res = {
       		 	                  	'groupId' : request.params.groupId,
       		 	                  	'units' : total_units,
       		 	                  	'drinks' : drinks,
       		 	                  	'suggestedUnits' : allowed_units,
       		 	                  	'drinksList' : getDrinksList(allowed_units, drinks),
       		 	                  	'suggestedDrinks' : suggested
       		 	                  	
       		 	                  }





       		 	                  response.success(res);
       		 	              }
       		 	          },
       		 	          error: function() {
       		 	              response.error('Error in inner queries nº' + totalLength - qs.length)
       		 	          }
       		 	      });
       		 	  }
       		 	  makeQueries(queries);



			
			},
			error: function() {
			response.error("Cannot calculate units");

			}
	})

  var re = Parse.Cloud.run("getDrinks", {'Type' : drinkType}, {
	success: function(result){
		//response.success(result);
		return result
	},
	error: function(){
		response.error('Error retrieving Drinks')
	}
	});

  console.log(re);






});




Parse.Cloud.define("suggestUnits", function(request,response) {

	var req = request.params
	Parse.Cloud.run("getUnitsPerGroup", req, {

		success: function(result){
			console.log(result)
			response.success(result);
		},
		error: function(error){
			console.log(error)
		}





	}); 

})