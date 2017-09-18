
function API() {
    
};

API.host = "10.0.2.2";
API.port = "8000";
API.url = "http://" + API.host + ":" + API.port;
console.log(API.url)

API.register = function(username, password, callback) {
    $.ajax({
        "url": API.url + "/register",
        "method": "POST",
        "data": {
            "username": username,
            "password": password
        },
        "success": function(result) {
            callback(result);
        }
    });
};

API.addStruggle = function(struggle, api_key, callback) {
    print(api_key);
    $.ajax({
        "url": API.url + "/struggles/new",
        "method": "POST",
        "data": {
            "name": struggle["name"],
            "description": struggle["description"]
        },
        "headers": {
            "Session-Key": api_key
        },
        "success": function(result) {
            callback(result);
        }
    });
};

API.loadStruggles = function(api_key, callback) {
    print(api_key);
    $.ajax({
        "url": API.url + "/struggles",
        "method": "GET",
        "headers": {
            "Session-Key": api_key
        },
        "success": function(result) {
            callback(result);
        }
    });
};

API.login = function(username, password, callback) {
    $.ajax({
        "url": API.url + "/login",
        "method": "POST",
        "data": {
            "username": username,
            "password": password
        },
        "success": function(result) {
            callback(result);
        }
    });
};

API.authCheck = function(api_key, callback) {
    $.ajax({
        "url": API.url + "/authcheck",
        "method": "GET",
        "headers": {
            "Session-Key": api_key
        },
        "success": function(result) {
            callback(result);
        }
    });
};