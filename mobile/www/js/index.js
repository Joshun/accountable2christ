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

        var struggleList = new StruggleList();
        struggleList.add("Anger Management");
        struggleList.add("Relationship Issues");


        var values = struggleList.getList();
      
        var vm = new Vue({
            el: "#struggles_table_body",
            data: {
                struggles: values
            }
           
        });


        $("#login_form").submit(function() {
            showMainScreen();
            return false;
        });

        $("#add_new_struggle_scn_btn").on("click", function() {
            showAddStruggleScreen();
        });

        $("#add_new_struggle_form").submit(function() {
            showMainScreen();
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

    }

};

app.initialize();

function hideAll() {
    $("#login_screen").addClass("hidden");
    $("#main_screen").addClass("hidden");
    $("#add_new_struggle_screen").addClass("hidden");
    $("#send_struggle_screen").addClass("hidden");
}

function showMainScreen() {
    hideAll();
    $("#main_screen").removeClass("hidden");
}

function showAddStruggleScreen() {
    hideAll();
    $("#add_new_struggle_screen").removeClass("hidden");
}

function showSendStruggleScreen() {
    hideAll();
    $("#send_struggle_screen").removeClass("hidden");
}

