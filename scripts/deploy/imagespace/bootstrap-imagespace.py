# Licensed to the Apache Software Foundation (ASF) under one or more
# contributor license agreements.  See the NOTICE file distributed with
# this work for additional information regarding copyright ownership.
# The ASF licenses this file to You under the Apache License, Version 2.0
# (the "License"); you may not use this file except in compliance with
# the License.  You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
import json
import requests

API_URL = 'http://localhost:8080/api/v1'

user_exists = requests.get(API_URL + '/user/authentication', auth=('girder', 'girder'))

if user_exists.ok:
    token = user_exists.json()['authToken']['token']
else:
    user = requests.post(API_URL + '/user', data={
        'login': 'girder',
        'email': 'girder@girder.girder',
        'firstName': 'girder',
        'lastName': 'girder',
        'password': 'girder'})
    assert user.ok

    token = user.json()['authToken']['token']

assetstores = requests.get(API_URL + '/assetstore', headers={'Girder-Token': token})
assert assetstores.ok

if not len(assetstores.json()):
    set_assetstore = requests.post(API_URL + '/assetstore', data={
        'name': 'assetstore',
        'type': 0,
        'root': '/assetstore'}, headers={'Girder-Token': token})
    assert set_assetstore.ok

plugins_enabled = requests.get(API_URL + '/system/setting', params={
    'key': 'core.plugins_enabled'
    }, headers={'Girder-Token': token})
assert plugins_enabled.ok

if 'imagespace' not in plugins_enabled.json():
    enabled_plugins = set(plugins_enabled.json()) | set(['imagespace'])
    set_plugins = requests.put(API_URL + '/system/setting', data={
        'key': 'core.plugins_enabled',
        'value': json.dumps(list(enabled_plugins))}, headers={'Girder-Token': token})
    assert set_plugins.ok


requests.put(API_URL + '/system/restart', headers={'Girder-Token': token})
