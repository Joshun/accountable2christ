
function API() {

}

API.register = function(username, password, callback) {
    $.ajax({
        "url": "http://10.0.2.2:8000/register",
        "method": "POST",
        "data": {
            "username": username,
            "password": password
        },
        "success": function(result) {
            callback(result);
        }
    })
}

API.addStruggle = function(struggle, api_key, callback) {
    print(api_key);
    $.ajax({
        "url": "http://10.0.2.2:8000/struggles/new",
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
    })
}

API.loadStruggles = function(api_key, callback) {
    print(api_key);
    $.ajax({
        "url": "http://10.0.2.2:8000/struggles",
        "method": "GET",
        "headers": {
            "Session-Key": api_key
        },
        "success": function(result) {
            callback(result);
        }
    })
}

API.login = function(username, password, callback) {
    $.ajax({
        "url": "http://10.0.2.2:8000/login",
        "method": "POST",
        "data": {
            "username": username,
            "password": password
        },
        "success": function(result) {
            callback(result);
        }
    })
}

API.authCheck = function(api_key, callback) {
    $.ajax({
        "url": "http://10.0.2.2:8000/authcheck",
        "method": "GET",
        "headers": {
            "Session-Key": api_key
        },
        "success": function(result) {
            callback(result);
        }
    })
}