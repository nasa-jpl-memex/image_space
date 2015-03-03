import pickle

with open('/code/memex/data/color_2003.p') as dataFile:
    data = pickle.load(dataFile)

def run():
    return data
