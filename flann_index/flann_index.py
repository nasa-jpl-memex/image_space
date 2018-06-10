import cv2
import numpy as np
import json
import random
import os
import pickle

if 'IMAGE_SPACE_IMAGE_FILES' in os.environ and 'IMAGE_SPACE_IMAGE_MAP' in os.environ:
    image_files = pickle.load(open(os.environ['IMAGE_SPACE_IMAGE_FILES']))
    image_map = pickle.load(open(os.environ['IMAGE_SPACE_IMAGE_MAP']))
else:
    image_files = []
    image_map = {}

    random.seed(0)

    count = 0

    with open(os.environ['IMAGE_SPACE_LISTS']) as lists:
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
                image_map[path_fname] = hist

                if count % 1000 == 0:
                    print listing.strip(), count, path_fname

                count += 1

    pickle.dump(image_map, open('image_map.pickle', 'wb'))
    pickle.dump(image_files, open('image_files.pickle', 'wb'))
    #NOTE: This is under the assumption that the user does not pre compute the pickle files before starting the flann index #server
    # exporting the environment variables so they are not computed every time the flann index is hit.
    os.environ['IMAGE_SPACE_IMAGE_FILES'] = 'image_files.pickle'
    os.environ['IMAGE_SPACE_IMAGE_MAP'] = 'image_map.pickle'

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

    return images
