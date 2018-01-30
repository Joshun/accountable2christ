
function API() {
    
};

// API.host = "10.0.2.2";
// API.port = "8000";
// API.url = "https://" + API.host + ":" + API.port;

// use https (requires nginx setup)
API.host = "app.jmoey.com";
API.url = "https://" + API.host;
console.log(API.url);

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

API.removeStruggle = function(struggle_name, api_key, callback) {
    $.ajax({
        "url": API.url + "/struggles/" + struggle_name,
        // "method": "DELETE",
        "type": "DELETE",
        "headers": {
            "Session-Key": api_key
        },
        "success": function(result) {
            callback(result);
        }
    })
};

API.addStruggleEvent = function(struggle_name, api_key, callback) {
    $.ajax({
        "url": API.url + "/struggles/" + struggle_name + "/new_event",
        "method": "POST",
        "headers": {
            "Session-Key": api_key
        },
        "data": {
            "timestamp": new Date().toISOString()
        },
        "success": function(result) {
            callback(result);
        }
    })
}

API.sendAccountabilityPartnerRequest = function(partner_name, api_key, callback) {
    $.ajax({
        "url": API.url + "/partners/new",
        "method": "POST",
        "headers": {
            "Session-Key": api_key
        },
        "data": {
            "accountability_partner_username": partner_name
        },
        "success": function(result) {
            callback(result);
        }
    })
}

API.loadAccountabilityPartners = function(api_key, callback) {
    $.ajax({
        "url": API.url + "/partners",
        "method": "GET",
        "headers": {
            "Session-Key": api_key
        },
        "success": function(result) {
            callback(result);
        }
    })
}

API.confirmAccountabilityPartnerRequest = function(partner_name, api_key, callback) {
    $.ajax({
        "url": API.url + "/partners/confirm",
        "method": "POST",
        "data": {
            "accountability_partner": partner_name
        },
        "headers": {
            "Session-Key": api_key
        },
        "success": function(result) {
            callback(result);
        }
    })
}

API.viewAccountabilityPartner = function(partner_name, api_key, callback) {
    $.ajax({
        "url": API.url + "/partners/view",
        "method": "GET",
        "data": {
            "accountability_partner": partner_name,
            // "partner_relation": partner_relation
        // },
        },
        "headers": {
            "Session-Key": api_key
        },
        "success": function(result) {
            callback(result);
        }
    })

}