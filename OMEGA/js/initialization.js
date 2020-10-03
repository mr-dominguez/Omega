// Resize images as page gets resized
function resizeGrid() {
    var images = document.getElementsByClassName("menu_img");
    var columns = document.getElementsByClassName("col");
    var i;
    for (i = 0; i < images.length; i++) {
        var newSize = window.innerWidth/3.05;
        images[i].width = newSize;
    }
}

window.onscroll = function() { stickyFunction() };

// Get the header
var header = document.getElementById("header");

//Get the offset position of the navbar
var sticky = header.offsetTop;

//Add the sticky class to the header when you reach its scroll position. Remove "sticky" when you leave the scroll position
function stickyFunction() {
    if (window.pageYOffset > sticky) {
        header.classList.add("sticky");
    } else {
        header.classList.remove("sticky");
    }
}