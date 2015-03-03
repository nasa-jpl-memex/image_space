import pickle

def run():
    with open('similarity/color_knn.p') as file:
        data = pickle.load(file)

    nodes = []
    links = []
    nodeMap = {}
    for image in data.keys():
        nodeMap[image] = len(nodes)
        nodes.append({'file': image})

    for image, nearest in data.iteritems():
        for (i, other) in enumerate(nearest):
            if i < 2:
                links.append({
                    'source': nodeMap[image],
                    'target': nodeMap[other[1]],
                    'distance': other[0]
                })

    return {
        'nodes': nodes,
        'links': links
    }
