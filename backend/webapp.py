from flask import Flask, request, abort, render_template, send_from_directory
import json

try:
    import orm
except:
    from . import orm

app = Flask(__name__)


@app.route("/")
def renderMap():
    """ Renders the map """
    return render_template("map.html", pokemon_names = [pokemon.name for pokemon in orm.Pokemon.select()] )
    #return render_template("map.html", pokemon_names = ["pikachu", "charmander", "snorlax"])
    
    
@app.route("/pokemon_locations/{lat}/{lng}", methods=["GET"])
def getPokemonLocations(lat, lng):
    """ Returns pokemon locations around a given location.
    Gets called when you move accross the map """

    pokemon_sightings = orm.Sighting.select().where( #Select pokemon sightings in a given radius
        (orm.Sighting.lat<=lat+0.04) & (orm.Sighting.lat>=lat-0.04) & # between lat-0.04 and lat+0.04
        (orm.Sighting.lng>=lng-0.04) & (orm.Sighting.lng<=lng+0.04)   # between lng-0.04 and lng+0.04
    )
    
    return pokemon_sightings
    

@app.route("/pokemon_locations", methods=["POST"])
def savePokemonLocations():
    """ Saves pokemon sighting data """
    data = json.loads(request.data)
    print(data)
    #If no coordinates were provided, or no pokemon name was provided, abort
    if "lat" not in data or not data["lat"]\
    or "lng" not in data or not data["lng"]\
    or "pokemon" not in data or not data["pokemon"]: #If no pokemon name was provided, abort
        abort(400, "Missing sighting data")

    lat = data["lat"]
    lng = data["lng"]
    pokemon = data["pokemon"]
    print(pokemon)
    
    sighted_pokemon = orm.Pokemon.get(name=pokemon.capitalize())
    print(sighted_pokemon.name)
    if not sighted_pokemon:
        abort(400, "That Pokemon doesn't exist")
    
    orm.Sighting.create(lat=lat, lng=lng, pokemon=sighted_pokemon)
    return "ok"
    
    
@app.route('/js/<path>')
def send_js(path):
    return send_from_directory('static/js', path)
    
@app.route('/css/<path>')
def send_css(path):
    return send_from_directory('static/css', path)