$(document).ready(load)
var map;
var user_center;
var infowindow;

    function load(){
        
    }
                        	
	function getCenter(){
	  //Returns a dictionary containing lat and long
	  return {
	    lat: map.center.lat(),
	    long: map.center.lng()
	  }
	}

    function initMap() {
        map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: parseFloat(12.1316416), lng: parseFloat(-86.2681935)},
            zoom: 15
            
        });
        
        user_center = getCenter();
        map.addListener("center_changed", getMoreData);
        
        map.addListener('rightclick', function(e) {
            addMarker(e.latLng.lat(), e.latLng.lng());
        });
      
    	  
	}
	
	function getMoreData(){
	  //If the user's movement was significate,updates the user center, and requests more data to the server
	  if(wasMovementSignificative()){
	    user_center = getCenter()
	    console.log("Pidiendo data...Nuevo centro: "+user_center["lat"]+" - "+user_center["long"]);
	  }
	}
	
	function wasMovementSignificative(){
	  //Decides if the user movement was significative enough to justify requesting more data
	  current_center = getCenter();
	  if(Math.abs(current_center["lat"] - user_center["lat"]) >= 0.04){
	    return true
	  }
	  if(Math.abs(current_center["long"] - user_center["long"]) >= 0.04){
	    return true
	  }
	  return false
	}
	
    function addMarker(lat, long){
        var myLatlng = {lat: lat, lng: long};
        var marker = new google.maps.Marker({
            position: myLatlng,
            map: map,
            title: 'Agregar Pokemon'
        });
        addDialogAddPokemon(marker);
    }
	
    function addDialogAddPokemon(the_marker){
        var contentString = $("#contenido").html();
        infowindow = new google.maps.InfoWindow({
        content: contentString
        
        });
        
        infowindow.open(map, the_marker);
        google.maps.event.addListener(infowindow,'closeclick',function(){
            the_marker.setMap(null); 
        });
        
        google.maps.event.addListener(infowindow, 'domready', function() {
           var pokemon = document.getElementsByClassName('cmbPokemon')[1].value;
           $(document).on('click', '.btnGuardar', function(){
               savePokemonLocation(infowindow,the_marker, pokemon);
               
           });
           
        });


     
    }
	
	function savePokemonLocation(the_infowindow,the_marker, the_pokemon){
	    
	    $.ajax({
	        url : '/pokemon_locations',
            type : 'post',
            data : JSON.stringify({
                lat:the_infowindow.position.lat(),
                lng:the_infowindow.position.lng(),
                pokemon: the_pokemon
            }),
            contentType: false,
            success: function(data) {
                infowindow.close();
                the_marker.setMap(null);
              alert(data);
              
            },
            error: function (XMLHttpRequest, estado, errorS) {
              var error = eval("(" + XMLHttpRequest.responseText + ")");
              console.log(error.Message);
              console.log(estado);
              console.log(errorS);
            },
            complete: function (jqXHR, estado) {
            }
	    });
	}

		
	