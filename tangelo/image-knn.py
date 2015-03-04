import pickle
import os

def run():
    with open(os.path.join(os.environ['IMAGE_SPACE_SIMILARITY_DIR'], 'color_knn.p')) as file:
        data = pickle.load(file)

    nodes = []
    links = []
    nodeMap = {}
    for image in data.keys():
        nodeMap[image] = len(nodes)
        nodes.append({'file': image})

    for image, nearest in data.iteritems():
        for (i, other) in enumerate(nearest):
            dist = other[0]
            # if i > 0 and i < 2:
            if i == 1 or dist > 0.5:
                links.append({
                    'source': nodeMap[image],
                    'target': nodeMap[other[1]],
                    'distance': dist
                })

    return {
        'nodes': nodes,
        'links': links
    }
