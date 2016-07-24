import datetime
from peewee import *
__all__ = ["Sighting", "Pokemon"]

db = SqliteDatabase('pokemon.db')


class Pokemon(Model):
    """ Represents Pokemons """
    name = CharField()
    
    class Meta:
        database = db
        

class Sighting(Model):
    """ Represents pokemon sightings """
    id = CharField()
    lat = FloatField()
    lng = FloatField()
    pokemon = ForeignKeyField(Pokemon, related_name='sightings')
    #combat_power = IntField()
    date = DateField(default=datetime.datetime.now)

    class Meta:
        database = db
        
        
db.connect()
db.create_tables([Sighting, Pokemon], safe=True)