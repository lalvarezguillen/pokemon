var map;
var user_center;
var i;

function initMap() {
    //Initializes the map, and some events
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: parseFloat(12.1316416), lng: parseFloat(-86.2681935)},
        zoom: 15
        
    });
    
    user_center = getCenter();
    map.addListener("center_changed", getMoreData);
    
    map.addListener('rightclick', function(e) {
        var pokemon_sighting = new PokemonSighting(e.latLng.lat(), e.latLng.lng());
    });
      
}

function getCenter(){
	//Returns a dictionary containing lat and long
	return {
	   lat: map.center.lat(),
	   long: map.center.lng()
	}
}

function getMoreData(){
	//If the user's movement was significate,updates the user center, and requests more data to the server
	if(wasMovementSignificative()){
	   user_center = getCenter()
	   console.log("Pidiendo data...Nuevo centro: "+user_center["lat"]+" - "+user_center["long"]);
	}
}

function getPokemonLocations(){
    $.ajax({
        url : '/pokemon_locations',
        type : 'post',
        data : JSON.stringify({
            lat:this.infowindow.position.lat(),
            lng:this.infowindow.position.lng(),
        }),
        contentType: "application/json",
        success: function(data) {
            _self.infowindow.close();
            //this.marker.setMap(null);
            alert(data);
        },
        error: function (XMLHttpRequest, estado, errorS) {
            var error = eval("(" + XMLHttpRequest.responseText + ")");
            console.log(error.Message);
            console.log(estado);
            console.log(errorS);
        },
        complete: function (jqXHR, estado) {
            console.log(estado);
        }
    });
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


class PokemonSighting{
    constructor(lat, lng){
        var _self = this; //Alias this, to be used within callbacks
        this.lat = lat;
        this.lng = lng;
        
        this.generateUniqueId = function(){
            //Generates a unique ID for the sighting
            this.date = new Date();
            var unique_id = Math.abs(lat).toString().replace(".", "") + Math.abs(lng).toString().replace() +
            this.date.getFullYear().toString() + (this.date.getMonth()-1).toString() + this.date.getDate().toString() +
            parseInt(Math.random()*999999999).toString();
            
            return unique_id;
        }
        
        this.generateMarker = function (){
            this.myLatlng = {lat: this.lat, lng: this.lng};
            this.marker = new google.maps.Marker({
                position: this.myLatlng,
                map: map,
                title: 'Agregar Pokemon'
            });
            this.addDialogAddPokemon();
        }
        
        this.addDialogAddPokemon = function(){
            var contentString = localStorage["infowindow_content"]; 
            this.infowindow = new google.maps.InfoWindow({
                content: $.parseHTML(contentString)[0]
            });
            
            this.infowindow.open(map, this.marker);
            i = this.infowindow;
            google.maps.event.addListener(this.infowindow,'closeclick',function(){
                this.marker.setMap(null); 
            });
            
           
            _self.infowindow.content.getElementsByClassName('btnGuardar')[0].addEventListener(
                'click',
                function(){
                    _self.pokemon = _self.infowindow.content.getElementsByClassName("cmbPokemon")[0].value;
                    _self.savePokemonLocation();
                }
            );
               
        }
        
        this.savePokemonLocation = function(){
            $.ajax({
    	        url : '/pokemon_locations',
                type : 'post',
                data : JSON.stringify({
                    lat:this.infowindow.position.lat(),
                    lng:this.infowindow.position.lng(),
                    pokemon: this.pokemon,
                    sighting_id: this.id
                }),
                contentType: "application/json",
                success: function(data) {
                    _self.infowindow.close();
                    //this.marker.setMap(null);
                    alert(data);
                },
                error: function (XMLHttpRequest, estado, errorS) {
                  var error = eval("(" + XMLHttpRequest.responseText + ")");
                  console.log(error.Message);
                  console.log(estado);
                  console.log(errorS);
                },
                complete: function (jqXHR, estado) {
                    console.log(estado);
                }
    	    });
        }

    this.id = this.generateUniqueId();
    this.generateMarker();
    }
    
    
}