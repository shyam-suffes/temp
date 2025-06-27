const modules = [
    {
        "type": "user",
        "apiVersion": "v1",
        "status": true,
        "route": true,
        "routeName": "users",
    },
    {
        "type": "admin",
        "apiVersion": "v1",
        "status": true,
        "route": true,
        "routeName": "admin",
    },
    {
        "type": "image",
        "apiVersion": "v1",
        "status": true,
        "route": true,
        "routeName": "image",
    }
]

module.exports = { modules };