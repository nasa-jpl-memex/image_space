import cv2
import numpy as np
import json
import random

FLANN_INDEX_KDTREE = 0
index_params = dict(algorithm = FLANN_INDEX_KDTREE, trees = 5)
search_params = dict(checks=50)
flann = cv2.FlannBasedMatcher(index_params,search_params)

image_files = []
image_map = {}

random.seed(0)

count = 0

with open('lists.txt') as lists:
    for listing in lists:
        f = open(listing.strip())

        # loop over all images
        for fname in f:
            path_fname = fname.strip()

            # if random.random() > 0.01:
            #     continue

            # read in image
            image = cv2.imread( path_fname );

            if image is None:
                print path_fname + " : fail to read"
                continue

            image_files.append(path_fname)

            if image.shape[2] == 1:
                image = cv2.cvtColor(image, cv2.COLOR_GRAY2RGB)

            v = cv2.calcHist([image], [0, 1, 2], None, [8, 8, 8], [0, 256, 0, 256, 0, 256])
            v = v.flatten()
            hist = v / sum(v)
            flann.add(hist.reshape(1, 512))
            image_map[path_fname] = hist

            if count % 1000 == 0:
                print listing.strip(), count, path_fname

            count += 1

flann.train()
vec = np.ones((1, 512), dtype=np.float32) / 512
matches = flann.knnMatch(vec, k=10)

def run(query, k=10, mode='bruteforce'):
    if query.startswith('['):
        vec = json.loads(query)
        vec = np.array(vec, dtype=np.float32).reshape(1, 512)
    elif query in image_map:
        vec = image_map[query].reshape(1, 512)
    else:
        return {'error': 'Could not find data for image: ' + query}

    images = []
    if mode == 'bruteforce':
        hist = vec.reshape(512)
        dists = []
        for (i, file) in enumerate(image_files):
            dist = cv2.compareHist(hist, image_map[file], cv2.cv.CV_COMP_INTERSECT)
            dists.append((dist, i))

        top = sorted(dists, reverse=True)[:int(k)]

        for distance, index in top:
            images.append({
                'id': image_files[index],
                'features': image_map[image_files[index]].tolist(),
                'distance': distance
            })
    elif mode == 'flann':
        matches = flann.knnMatch(vec, k=int(k))
        for dm in matches[0]:
            file_id = image_files[dm.imgIdx]
            images.append({
                'id': file_id,
                'features': image_map[file_id].tolist(),
                'distance': dm.distance
            })

    print images
    return images
