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
            },
            methods: {
                onClick: function(struggle_name) {
                    API.addStruggleEvent(struggle_name, app.session.session_key, function(res) {
                        alert("Sent!");
                    });
                }
            }
          });
        app.session.dropdown_vm = new Vue({
            el: "#manage_struggles_dropdown",
            data: {
                struggles: []
            },
            methods: {
                onClick: function(struggle_name) {
                    // alert(struggle_name);
                    var delStruggle = confirm("Delete " + struggle_name + "?");
                    if (delStruggle) {
                        app.session.struggle_list.remove(struggle_name);
                        API.removeStruggle(struggle_name, app.session.session_key, function(res) {
                            alert("Done!");
                        });
                    }
                }
            }
        });
        app.session.struggle_list = new StruggleList([app.session.vm, app.session.dropdown_vm]);

        app.session.waiting_partners_vm = new Vue({
            el: "#waiting_partners_table",
            data: {
                waiting_partners: []
            },
            methods: {
                confirm: function(other_user) {
                    API.confirmAccountabilityPartnerRequest(other_user, app.session.session_key, function(result) {
                        alert("Confirmed " + other_user); 
                    });
                }
            }
        })

        app.session.partners_list = {};

        app.session.acc_partners_vm = new Vue({
            el: "#acc_partners_table",
            "data": {
                partners: []
            },
            methods: {
                view: function(other_user) {
                    alert("View " + other_user.other_partner);
                    // console.log(other_user.relation)
                    console.log("usersssss")
                    console.log(other_user.other_partner.toString())
                    console.log(other_user.relation)
                    console.log(other_user)
                    // relation = {
                    //     "confirmed": other_user.relation.confirmed,
                    //     "id": other_user.relation.id,
                    //     "initiator_user_id": other_user.relation.initiator_user_id,
                    //     "responder_user_id": other_user.relation.responder_user_id
                    // };
                    console.log(relation)
                    // console.log(other_user.other_partner)
                    // console.log(app.session.partners_list);
                    // partner_relation = app.session.partners_list[other_user.other_partner];
                    API.viewAccountabilityPartner(other_user.other_partner, app.session.session_key, function(result) {
                        alert(result);
                        console.log(result);
                    })
                }
            }
        })

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

        $("#logout_btn").click(logout);

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
                var password = $("#login_password").val();
                var confirmPassword = $("#login_password_confirm").val();
                if (password.length < 6) {
                    console.log("password too small");
                    writeError("Password must be 6 or more chars!");
                }
                else if (password != confirmPassword) {
                    console.log("password match failed")
                    writeError("Passwords do not match!");
                }
                else {
                    console.log("password match")
                    API.register($("#login_user").val(), $("#login_password").val(), loggedIn);                                 
                }

            }
            else {
                console.log("logging in...");
                API.login($("#login_user").val(), $("#login_password").val(), loggedIn);
            }

            return false;
        });

        $("#add_accountability_partner_form").submit(function() {
            if ($("#add_acc_partner_username").val().length == 0) {
                alert("Must enter a username of an accountability partner");
            }
            else if ($("#add_acc_partner_username").val() == app.session.username) {
                alert("Cannot add yourself!");
            }
            else {
                API.sendAccountabilityPartnerRequest($("#add_acc_partner_username").val(), app.session.session_key, function(result) {
                    alert("Request sent.");
                    showMainScreen();
                });
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
            if (newStruggleName.length == 0) {
                alert("Struggle must have a name!!!");
            }
            else if (app.session.struggle_list.contains(newStruggleName)) {
                alert(newStruggleName + " already exists!!!");
            }
            else {
                API.addStruggle(
                    { "name": newStruggleName, "description": newStruggleDesc },
                    app.session.session_key,
                    showMainScreen
                );
            }
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

        $("#manage_struggles_scn_btn").on("click", function() {
            showManageStrugglesScreen();
        });

        $("#manage_struggles_back").on("click", function() {
            showMainScreen();
        });

        $("#add_acc_partner_back").on("click", function() {
            showMainScreen();
        });

        $("#add_new_acc_partner_scn").on("click", function() {
            showAddAccountabilityPartnerScreen();
        });

        // $("table tr").on("click", function() {
        //     showSendStruggleScreen();
        // });

  


        var sessionKey = window.localStorage.getItem("session_key");
        console.log("key:");
        console.log(sessionKey);
        if (sessionKey != null) {
            API.authCheck(sessionKey, function(result) {
                
                loggedIn(result);
            });
        }
        else {
            showLoginScreen();
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
    $("#manage_struggles_screen").addClass("hidden");
    $("#add_accountability_partner_screen").addClass("hidden");
}

function login(api_result) {
    
}

function showLoginScreen() {
    hideAll();
    $("#login_screen").removeClass("hidden");
}

function showMainScreen() {
    console.log("showMainScreen");
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

        // $("td").on("click", function() {
        //     alert("clicked!");
        //     console.log("clicked: ", this);
        //     console.log(" parent:", $(this).parent("tr").html());
        // });
        API.loadAccountabilityPartners(app.session.session_key, function(res) {
            app.session.waiting_partners_vm.waiting_partners = res["waiting_partners"];
            app.session.acc_partners_vm.partners = res["partners"];
            for (var partner in res["partners"]) {
                app.session.partners_list[partner.partner_name] = partner;
            }
            // app.session.partners_list = res["partners"];
            console.log("loadAccountabilityPartners");
            console.log(res);
            // alert(res);
            // alert("loaded");
        });
    });
}

function rowClicked() {
    alert("clicked!");
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
        loginFailed();
        showLoginScreen();
        writeError("Login or register Failed!");        
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

function showManageStrugglesScreen() {
    hideAll();
    $("#manage_struggles_screen").removeClass("hidden");
}

function showSendStruggleScreen() {
    hideAll();
    $("#send_struggle_screen").removeClass("hidden");
}

function showAddAccountabilityPartnerScreen() {
    hideAll();
    $("#add_accountability_partner_screen").removeClass("hidden");
}

function writeError(msg) {
    console.log("writeError:", msg);
    $("#error_box").text(msg);
}

function clearError() {
    console.log("clearError")
    $("#error_box").text("");
}

function logout() {
    window.localStorage.removeItem("session_key");
    app.session.username = null;
    app.session.session_key = null;
    showLoginScreen();
}