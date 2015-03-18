module.exports = function (grunt) {
    var fs = require('fs');
    var defaultTasks = [];
    var pluginName = 'imagespace';
    var pluginDir = 'plugins/imagespace';
    var staticDir = 'clients/web/static/built/plugins/' + pluginName;
    var sourceDir = 'web_external';

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
            namespace: pluginName + '.templates'
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
        files[staticDir + '/' + pluginName + '.min.css'] = [cssDir + '/**/*.styl'];
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
        files[staticDir + '/' + pluginName + '.min.js'] = [
            jsDir + '/init.js',
            staticDir + '/templates.js',
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

    grunt.registerTask('imagespace', defaultTasks);
};
