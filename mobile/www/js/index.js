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

var rng;

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

        rng = new RNG(new Date().getTime());

        // $("#test_cell_1").append(createIcon(summariseText("Relationship Issues")));
        // $("#test_cell_2").append(createIcon(summariseText("Anger Management")));

        var values = [];
        values.push({icon: createIcon(summariseText("Relationship Issues")), description: "Relationship Issues"});
        values.push({icon: createIcon(summariseText("Anger Management")), description: "Anger Management"});

        // var icons = [];
        // icons.push(createIcon(summariseText("Relationship Issues")));
        // icons.push(createIcon(summariseText("Anger Management")));

        // var descriptions = [ "Relationship Issues", "Anger Management" ];

        var vm = new Vue({
            el: "#struggles_table_body",
            data: {
                struggles: values
            }
            // data: {
            //     icons: icons,
            //     descriptions: descriptions
            // }
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

function summariseText(text) {
    if (text == null || text == "") {
        return null;
    }

    var words = text.split(" ");

    console.log("words ", words);

    if (words.length == 1) {
        return words[0][0].toUpperCase();
    }
    else {
        return words[0][0].toUpperCase() + words[words.length-1][0].toUpperCase();
    }
}

function createIcon(iconText) {
    console.log(createIcon);
    var iconDiv = $("<div>");
    var iconTextSpan = $("<span>").text(iconText);
    iconDiv.append(iconTextSpan);
    iconDiv.addClass("icon");
    iconDiv.html = iconText;

    // list of [backgroundColor, textColor]
    var colorPairs = [ ["red", "black"], ["blue", "white"], ["green", "white"], ["orange", "black"], ["pink", "black" ]];

    // https://stackoverflow.com/questions/1527803/generating-random-whole-numbers-in-javascript-in-a-specific-range
    // var randColorIndex = Math.floor(Math.random() * (colors.length-1));
    var randColorIndex = rng.nextRange(0, colorPairs.length);

    iconDiv.css("background-color", colorPairs[randColorIndex][0]);
    iconTextSpan.css("color", colorPairs[randColorIndex][1]);

    return iconDiv.prop("outerHTML");

    // $("#test_cell").append(iconDiv);

    // console.log("created icon with iconText", iconText, "and bg color", colors[randColorIndex]);
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Random generator
// https://stackoverflow.com/questions/424292/seedable-javascript-random-number-generator

function RNG(seed) {
  // LCG using GCC's constants
  this.m = 0x80000000; // 2**31;
  this.a = 1103515245;
  this.c = 12345;

  this.state = seed ? seed : Math.floor(Math.random() * (this.m-1));
}
RNG.prototype.nextInt = function() {
  this.state = (this.a * this.state + this.c) % this.m;
  return this.state;
};
RNG.prototype.nextFloat = function() {
  // returns in range [0,1]
  return this.nextInt() / (this.m - 1);
};
RNG.prototype.nextRange = function(start, end) {
  // returns in range [start, end): including start, excluding end
  // can't modulu nextInt because of weak randomness in lower bits
  var rangeSize = end - start;
  var randomUnder1 = this.nextInt() / this.m;
  return start + Math.floor(randomUnder1 * rangeSize);
};
RNG.prototype.choice = function(array) {
  return array[this.nextRange(0, array.length)];
};
