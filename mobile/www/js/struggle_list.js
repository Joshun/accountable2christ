
function StruggleList(struggles) {
    this.struggles = (struggles == null) ? [] : struggles;
}

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

    return iconDiv;

    // $("#test_cell").append(iconDiv);

    // console.log("created icon with iconText", iconText, "and bg color", colors[randColorIndex]);
}