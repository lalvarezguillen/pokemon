try:
    from orm import *
except:
    from .orm import *
    
try:
    from webapp import app
except:
    from .webapp import app