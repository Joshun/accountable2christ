/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */


var app = {

    session: {
        "username": null,
        "session_key": null,
        "vm": null,
        "struggle_list": null
    },


    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {
        console.log("init.");

        app.session.vm = new Vue({
            el: "#struggles_table_body",
            data: {
                struggles: []
            }
          });
        app.session.struggle_list = new StruggleList(app.session.vm);

        // $.ajax({
        //     "url": "http://10.0.2.2:8000/register",
        //     "data": {
        //         "username": "jmoey",
        //         "password": "123"
        //     }
        // })


        // var values = struggleList.getList();

       


        // struggleList.add("Anger Management");
        // struggleList.add("Relationship Issues");

        // vm.data.struggles = struggleList.getList();
        // vm.struggles = struggleList.getList();

        $("#login_radio_lbl").click(function() {
            $("#login_password_confirm").addClass("hidden");
            console.log($("#login_radio:checked").val());
            console.log($("#register_radio:checked").val());
        });

        $("#register_radio_lbl").click(function() {
            $("#login_password_confirm").removeClass("hidden");
            console.log($("#login_radio:checked").val());
            console.log($("#register_radio:checked").val());
        })
       

        $("#login_form").submit(function() {
            // showMainScreen();
            // if ($("#register_radio:checked").val() != null) {
            if ($("#register_radio").is(":checked")) {
                console.log("registering user...");
                API.register($("#login_user").val(), $("#login_password").val(), loggedIn);                
            }
            else {
                console.log("logging in...");
                API.login($("#login_user").val(), $("#login_password").val(), loggedIn);
            }

            return false;
        });

        $("#add_new_struggle_scn_btn").on("click", function() {
            showAddStruggleScreen();
        });

        $("#add_new_struggle_form").submit(function() {
            var newStruggleName = $("#new_struggle_name").val();
            var newStruggleDesc = $("#new_struggle_desc").val();
            // sessionKey.struggle_list.add(newStruggleName);
            API.addStruggle(
                { "name": newStruggleName, "description": newStruggleDesc },
                app.session.session_key,
                showMainScreen
            );
            // showMainScreen();
            return false;
        });

        $("#cancel_add_new_struggle_btn").on("click", function() {
            showMainScreen();
        });

        $("#send-struggle-yes").on("click", function() {
            showMainScreen();
        });

        $("#send-struggle-no").on("click", function() {
            showMainScreen();
        });

        $("table tr").on("click", function() {
            showSendStruggleScreen();
        });

        var sessionKey = window.localStorage.getItem("session_key");
        console.log("key:");
        console.log(sessionKey);
        if (sessionKey != null) {
            API.authCheck(sessionKey, function(result) {
                
                loggedIn(result);
            });
        }
    

    }
};

app.initialize();

function hideAll() {
    clearError();
    $("#login_screen").addClass("hidden");
    $("#main_screen").addClass("hidden");
    $("#add_new_struggle_screen").addClass("hidden");
    $("#send_struggle_screen").addClass("hidden");
}

function login(api_result) {
    
}

function showMainScreen() {
    // window.localStorage.setItem("session_key", api_result);
    // console.log("result:");
    // console.log(api_result);
    $("#user_header").text("Welcome, " + app.session.username);

    API.loadStruggles(app.session.session_key, function(res) {
        console.log("loadStruggles:", res)
        // app.session.struggle_list.setList(res);
        app.session.struggle_list.clearAll();
        for (var k in res) {
            app.session.struggle_list.add(k, res[k]);
        }
        hideAll();        
        $("#main_screen").removeClass("hidden");
    });
}

// function showMainScreen(api_result) {
//     window.localStorage.setItem("session_key", api_result);
//     $("#user_header").text("Welcome, " + $("#login_user").val());

//     API.loadStruggles(api_result, function(res) {
//         hideAll();        
//         $("#main_screen").removeClass("hidden");
//     });
// }

function loggedIn(api_result) {
    console.log("loggedIn");
    console.log(api_result);
    if (api_result["result"] == "failure") {
        writeError("Login or register Failed!");
        loginFailed();
    }
    else {
        window.localStorage.setItem("session_key", api_result["key"]);
        app.session.username = api_result["user"];
        app.session.session_key = api_result["key"];
        showMainScreen();
    }
}

function loginFailed() {
    console.log("error logging in");
}

function showAddStruggleScreen() {
    hideAll();
    $("#add_new_struggle_screen").removeClass("hidden");
}

function showSendStruggleScreen() {
    hideAll();
    $("#send_struggle_screen").removeClass("hidden");
}

function writeError(msg) {
    console.log("writeError:", msg);
    $("#error_box").text(msg);
}

function clearError() {
    console.log("clearError")
    $("#error_box").text("");
}