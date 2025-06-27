const {modules} = require('../config/moduleConfig');

module.exports = function (app) {
    modules.forEach(element => {
        if (element.status && element.route) {
            let path = require('../modules/' + element.type);
            let middlewares = [];
            if (element.middlewares) {
                element.middlewares.forEach(middlewareName => {
                    const middleware = require('../middleware/authentication')[middlewareName];
                    middlewares.push(middleware);
                })
                app.use('/api/' + element.apiVersion + '/' + element.routeName, middlewares, path);

            }else{
                app.use('/api/' + element.apiVersion + '/' + element.routeName, path);
            }
        }
    });

};