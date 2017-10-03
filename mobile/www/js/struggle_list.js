var seed;

var loadedSeed = window.localStorage.getItem("icon_color_rng_seed");
if (loadedSeed == null) {
    console.log("seed null");
    seed = new Date().getTime();
    window.localStorage.setItem("icon_color_rng_seed", seed.toString());
}
else {
    seed = parseInt(loadedSeed);
    console.log("loaded", seed.toString())
}

var rng = new RNG(seed);

function StruggleList(vms) {
    this.struggles = {}
    // this.struggles = (struggles == null) ? {} : struggles;
    this.usedColors = [];
    this.vms = vms;

    // this.rng = new RNG(seed);
    // rng.resetState();
    // rng = new RNG(seed);
}

StruggleList.prototype.add = function(name, description) {
    this.struggles[name] = {
        icon: createIcon(summariseText(name), this.usedColors),
        name: name,
        description: description
    };

    for (var i=0; i<this.vms.length; i++) {
        this.vms[i].struggles = this.getList();
    }
};

StruggleList.prototype.contains = function(name) {
    for (var k in this.struggles) {
        if (k == name) {
            return true;
        }
    }
    return false;
}

StruggleList.prototype.clearAll = function() {
    rng.resetState();
    // rng = new RNG(seed);
    
    this.struggles = {};
    this.usedColors = [];
    for (var i=0; i<this.vms.length; i++) {
        this.vms[i].struggles = this.getList();
    }
}

StruggleList.prototype.setList = function(l) {
    this.struggles = l;
    for (var i=0; i<this.vms.length; i++) {
        this.vms[i].struggles = this.getList();
    } // this.add("testing")
}

StruggleList.prototype.remove = function(text) {
    if (text in this.struggles) {
        delete this.struggles[text];
    }
    for (var i=0; i<this.vms.length; i++) {
        this.vms[i].struggles = this.getList();
    }
}

StruggleList.prototype.getList = function() {
    var l = [];
    for (struggle in this.struggles) {
        l.push(this.struggles[struggle]);
    }
    return l;
};

function createIconText(text) {
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

function createIcon(iconText, usedColors) {
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

    var randColorIndex;
    tries = 0;
    do {
      randColorIndex = rng.nextRange(0, colorPairs.length);
      console.log("err")
      tries++;
    } while (($.inArray(randColorIndex, usedColors) != -1 || usedColors.length >= 5) && tries < 5);
    usedColors.push(randColorIndex);

    iconDiv.css("background-color", colorPairs[randColorIndex][0]);
    iconTextSpan.css("color", colorPairs[randColorIndex][1]);

    return iconDiv.prop("outerHTML");

    // $("#test_cell").append(iconDiv);

    // console.log("created icon with iconText", iconText, "and bg color", colors[randColorIndex]);
}



function RNG(seed) {
  console.log("create RNG");
  // LCG using GCC's constants
  this.m = 0x80000000; // 2**31;
  this.a = 1103515245;
  this.c = 12345;

  this.state = seed ? seed : Math.floor(Math.random() * (this.m-1));
  this.origState = this.state;
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
RNG.prototype.resetState = function() {
    this.state = this.origState;
}
