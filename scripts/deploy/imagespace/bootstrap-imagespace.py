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
