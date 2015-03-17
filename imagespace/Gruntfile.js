/**
 * Copyright 2014 Kitware Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

module.exports = function (grunt) {

    var fs = require('fs');
    var defaultTasks = [];

    // Since this is an external web app in a plugin,
    // it handles building itself
    //
    // It is not included in the plugins being built by virtue of
    // the web client not living in web_client, but rather web_external
    var configureImageSpace = function () {
        var pluginName = "imagespace";
        var pluginDir = "plugins/imagespace";
        var staticDir = 'clients/web/static/built/plugins/' + pluginName;
        var sourceDir = "web_external";

        if (!fs.existsSync(staticDir)) {
            fs.mkdirSync(staticDir);
        }

        var jadeDir = pluginDir + '/' + sourceDir + '/templates';
        if (fs.existsSync(jadeDir)) {
            var files = {};
            files[staticDir + '/templates.js'] = [jadeDir + '/**/*.jade'];
            grunt.config.set('jade.' + pluginName, {
                files: files
            });
            grunt.config.set('jade.' + pluginName + '.options', {
                namespace: 'imagespace.templates'
            });
            grunt.config.set('watch.jade_' + pluginName, {
                files: [jadeDir + '/**/*.jade'],
                tasks: ['jade:' + pluginName, 'uglify:' + pluginName]
            });
            defaultTasks.push('jade:' + pluginName);
        }

        var cssDir = pluginDir + '/' + sourceDir + '/stylesheets';
        if (fs.existsSync(cssDir)) {
            var files = {};
            files[staticDir + '/imagespace.min.css'] = [cssDir + '/**/*.styl'];
            grunt.config.set('stylus.' + pluginName, {
                files: files
            });
            grunt.config.set('watch.stylus_' + pluginName, {
                files: [cssDir + '/**/*.styl'],
                tasks: ['stylus:' + pluginName]
            });
            defaultTasks.push('stylus:' + pluginName);
        }

        var jsDir = pluginDir + '/' + sourceDir + '/js';
        if (fs.existsSync(jsDir)) {
            var files = {};
            // name this imagespace.min.js instead of plugin.min.js
            // so that girder app won't load imagespace, which
            // should only be loaded as a separate web app running as imagespace
            files[staticDir + '/imagespace.min.js'] = [
                jsDir + '/init.js',
                staticDir + '/templates.js',
                jsDir + '/imagespace-version.js',
                jsDir + '/view.js',
                jsDir + '/app.js',
                jsDir + '/utilities.js',
                jsDir + '/models/**/*.js',
                jsDir + '/collections/**/*.js',
                jsDir + '/views/**/*.js'
            ];
            files[staticDir + '/main.min.js'] = [
                jsDir + '/main.js'
            ];
            grunt.config.set('uglify.' + pluginName, {
                files: files
            });
            grunt.config.set('watch.js_' + pluginName, {
                files: [jsDir + '/**/*.js'],
                tasks: ['uglify:' + pluginName]
            });
            defaultTasks.push('uglify:' + pluginName);
        }

        var extraDir = pluginDir + '/' + sourceDir + '/extra';
        if (fs.existsSync(extraDir)) {
            grunt.config.set('copy.' + pluginName, {
                expand: true,
                cwd: pluginDir + '/' + sourceDir,
                src: ['extra/**'],
                dest: staticDir
            });
            grunt.config.set('watch.copy_' + pluginName, {
                files: [extraDir + '/**/*'],
                tasks: ['copy:' + pluginName]
            });
            defaultTasks.push('copy:' + pluginName);
        }
    };

    configureCovalic();
    grunt.registerTask('imagespace-web', defaultTasks);
};
