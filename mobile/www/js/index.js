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
        "struggle_list": null,
        "struggles_chart": null
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

        window.resolveLocalFileSystemURL(cordova.file.applicationDirectory + "www/pages.md", gotFile, fail);
        

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
                        showMainScreen();
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
                    // console.log(other_user.relation)
                    console.log("usersssss")
                    // console.log(other_user.other_partner.toString())
                    // console.log(other_user.relation)
                    console.log(other_user)
                    // relation = {
                    //     "confirmed": other_user.relation.confirmed,
                    //     "id": other_user.relation.id,
                    //     "initiator_user_id": other_user.relation.initiator_user_id,
                    //     "responder_user_id": other_user.relation.responder_user_id
                    // };
                    // console.log(relation)
                    // console.log(other_user.other_partner)
                    // console.log(app.session.partners_list);
                    // partner_relation = app.session.partners_list[other_user.other_partner];
                    app.session.partner_struggles_for_chart = [];
                    
                    API.viewAccountabilityPartner(other_user.other_partner, app.session.session_key, function(result) {
                        // alert(result);
                        // console.log(result);
                        // console.log(result);
                        // alert(extractStruggleEvents(result));
                        console.log("result::")
                        console.log(result)
                        // console.log(extractStruggleEvents(result.partner_data));

                        if (result["result"] == "failure") {
                            alert("view partner failed!");
                        }
                        else {
                            // app.session.partner_struggles_vm = [];
                            var struggles = [];
                            for (k in result.partner_data.struggles) {
                                struggles.push(k);
                            }
                            app.session.partner_struggles_vm.struggles = struggles;

                            // app.session.partner_struggles_for_chart = extractStruggleEvents(result);
                            app.session.partner_struggles_for_chart = result.partner_data;

                            showViewAccountabilityPartnerScreen(other_user.other_partner);

                            }
                    });
                }
            }
        });

        app.session.partner_struggles_vm = new Vue({
            el: "#partner_struggles_menu",
            data: {
                "struggles": []
            },
            methods: {
                plotChart: function(struggle) {
                    doPlotChart(app.session.partner_struggles_for_chart.struggles[struggle].struggle_events, struggle);
                }
            }
        });

        app.session.partner_struggles_for_chart = {};

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

        $("#show_pages_screen_btn").on("click", function() {
            showViewPagesScreen();
        })

        $("#viewer_back_btn").on("click", function() {
            showMainScreen();
        })

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

        $("#view_partner_back").on("click", function() {
            showMainScreen();
        })

        $("#viewer_back_btn").on("click", function() {
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
    $("#view_accountability_partner_screen").addClass("hidden");
    $("#view_pages_screen").addClass("hidden");
}

function login(api_result) {
    
}

function showViewPagesScreen() {
    hideAll();
    $("#view_pages_screen").removeClass("hidden");
}

function showLoginScreen() {
    $("#login_password").val("");
    $("#login_password_confirm").val("");
    $("#login_user").val("");
    hideAll();
    $("#login_screen").removeClass("hidden");
}

function showViewAccountabilityPartnerScreen(partner_name) {
    if (app.session.struggles_chart != null) {
        app.session.struggles_chart.destroy();
    }

    hideAll();
    $("#partner_name_heading").text(partner_name);
    $("#view_accountability_partner_screen").removeClass("hidden");
}

function showMainScreen() {
    console.log("showMainScreen");
    // window.localStorage.setItem("session_key", api_result);
    // console.log("result:");
    // console.log(api_result);
    $("#user_header").text("Welcome, " + app.session.username);

    API.loadStruggles(app.session.session_key, function(res) {
        if (res["result"] == "failure") {
            alert("failed to load struggles!");
        }
        else {
            console.log("loadStruggles:", res)
            // app.session.struggle_list.setList(res);
            app.session.struggle_list.clearAll();
            for (var k in res.struggles) {
                app.session.struggle_list.add(k, res.struggles[k]);
            }
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

function extractStruggleEvents(partner_data) {
    console.log(partner_data);
    struggles_list = {};
    // console.log(partner_data["partner_name"]);
    var struggles = partner_data["struggles"];
    // console.log(partner_data["struggles"]);
    for (var struggle in struggles) {
        // console.log(struggle);
        struggle_events = partner_data.struggles[struggle].struggle_events;
        var events = [];
        for (var e in struggle_events) {
            // console.log(e);
            events.push(struggle_events[e].timestamp);
        }
        struggles_list[struggle] = events;
    }
    return struggles_list;
}

function splitDataPoints(struggle_data_points) {
    var dates = [];
    var counts = [];
    for (var p in struggle_data_points) {
        print(p);
        counts.push(struggle_data_points[p][0]);
        dates.push(struggle_data_points[p][1]);
    }

    var retval = { "dates": dates, "counts": counts};
    return retval;
}

function doPlotChart(struggle_data_points, struggle_name) {
    console.log("plot:");
    console.log(struggle_data_points);
    console.log(splitDataPoints(struggle_data_points));
    var split_points = splitDataPoints(struggle_data_points);
    // var ctx = $("#struggle_freq_chart").getContext("2d");
    var ctx = document.getElementById("struggle_freq_chart").getContext("2d");
    console.log(split_points.counts);
    var myChart = new Chart(ctx, {
        type: 'line',
        // datasets: struggle_data_points
        data: {
            labels: split_points.dates,
            datasets: [{
                label: struggle_name,
                data: split_points.counts
                // borderColor: "rgba(220,20,20,1)",
                // backgroundColor: "rgba(220,20,20,0.5)"
            }]
        },
        options: {
            scales: {
              xAxes: [{
                type: "time",
                time: {
                  unit: 'hour',
                  round: 'hour',
                  displayFormats: {
                    // day: 'MMM D'
                    // hour: 'MMM D HH:00'
                    hour: 'DD/MM HH:00 '
                  }
                }
              }],
              yAxes: [{
                ticks: {
                  beginAtZero: true
                }
              }]
            }
          }
    });
    app.session.struggles_chart = myChart;
}

function gotFile(fileEntry) {
    fileEntry.file(function(file) {
        var reader = new FileReader();

        reader.onloadend = function(e) {
            // console.log("Text is: "+this.result);
            console.log("File loaded.");
            // document.querySelector("#textArea").innerHTML = this.result;
            var converter = new showdown.Converter();
            var html = converter.makeHtml(this.result);
            // document.write(html);
            $("#viewer_container").html(html);
        }

        reader.readAsText(file);
    });
}

function fail(e) {
    console.log("FileSystem Error");
    console.dir(e);
}