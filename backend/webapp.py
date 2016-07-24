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
    
    
@app.route("/retrieve_locations", methods=["POST"])
def getPokemonLocations():
    """ Returns pokemon locations around a given location.
    Gets called when you move accross the map """
    data = json.loads(request.data)
    print(data)
    if "lat" not in data or not data["lat"] or "lng" not in data or not data["lng"]:
        return abort(404)

    lat = data["lat"]
    lng = data["lng"]
    
    pokemon_sightings = orm.Sighting.select(orm.Sighting).where( #Select pokemon sightings in a given radius
        (orm.Sighting.lat<=lat+0.04) & (orm.Sighting.lat>=lat-0.04) & # between lat-0.04 and lat+0.04
        (orm.Sighting.lng>=lng-0.04) & (orm.Sighting.lng<=lng+0.04)   # between lng-0.04 and lng+0.04
    )
    pokemon_sightings = [ {"id": sight.id, "pokemon": sight.pokemon.name, "lat": sight.lat, "lng":sight.lng} for sight in pokemon_sightings]
    print(pokemon_sightings)
    
    return json.dumps(pokemon_sightings)
    

@app.route("/pokemon_locations", methods=["POST"])
def savePokemonLocations():
    """ Saves pokemon sighting data """
    data = json.loads(request.data)
    print(data)
    #If no coordinates were provided, or no pokemon name was provided, abort
    if "lat" not in data or not data["lat"] or "lng" not in data or not data["lng"]\
    or "pokemon" not in data or not data["pokemon"] or "sighting_id" not in data or not data["sighting_id"]:
        return abort(400, "Missing sighting data")

    lat = data["lat"]
    lng = data["lng"]
    pokemon = data["pokemon"]
    sighting_id = data["sighting_id"]
    print(pokemon)
    
    sighted_pokemon = orm.Pokemon.get(name=pokemon.capitalize())
    print(sighted_pokemon.name)
    if not sighted_pokemon:
        return abort(400, "That Pokemon doesn't exist")
    
    orm.Sighting.create(lat=lat, lng=lng, pokemon=sighted_pokemon, id=sighting_id)
    return "ok"
    
    
@app.route('/js/<path>')
def send_js(path):
    return send_from_directory('static/js', path)
    
@app.route('/css/<path>')
def send_css(path):
    return send_from_directory('static/css', path)
    
@app.route('/icons/<path>')
def send_icon(path):
    print("static/icons/{}.png".format(path.lower()))
    return send_from_directory('static/icons', "{}.png".format(path.lower()))