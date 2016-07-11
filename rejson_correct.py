# -*- coding: utf-8 -*-
from json import *
from pprint import pprint

jstr = open('test.py', 'r')
file_out = open('test_out', 'w')


request = ''.join([line.strip() for line in jstr])

obj = loads(request)

#pprint(obj)
balloonContentBody = str(obj['comment'])#.encode('UTF-8')#.decode('UTF-8')
balloonContentFooter = str(obj['url'])
balloonContentHeader = str(obj['title'])
hintContent = str(obj['coord']['comment'])
first_coordinate = obj['coord']['lat']
second_coordinate = obj['coord']['long']
coordinates = [first_coordinate, second_coordinate]
dictionary = {"type": "Feature", "id": 0, "geometry": {"type": "Point", "coordinates": coordinates}, 
              "properties": {"balloonContentBody": balloonContentBody, "balloonContentHeader": balloonContentHeader,
                             "balloonContentFooter": balloonContentFooter, "hintContent": hintContent}}

raw_json = dumps(dictionary, ensure_ascii = False)
#print(dictionary, file = file_out)

print(raw_json)
print(raw_json, file=file_out)
#print(raw_json, file=file_out)
file_out.close()