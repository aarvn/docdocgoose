// HEADER SCRIPTS START
$(window).on("scroll", function() {
    if($(window).scrollTop() > 200) {
        $("header").addClass("header-active");
    } else {
        $("header").removeClass("header-active");
        $("header").removeClass("header-black");
        $("header").removeClass("header-white");
    }
});

var y=0
function burgerToggle() {
    y += 1
    var x = document.getElementById('burger');
    x.classList.toggle("burger-active");
    $("#mobile-navigation-overlay").toggleClass("mobile-navigation-overlay-active");
    if(y%2!=0){
        $('body').css("overflow","hidden");
        $("header").addClass("header-active");
        $("#mobile-navigation-overlay").css("opacity","1");
        $("header").removeClass("header-black");
        $("header").addClass("header-white");
    }
    else{
        $("header").removeClass("header-black");
        $("header").removeClass("header-white");
        
        $('body').css("overflow","visible");
        if($(window).scrollTop() < 200){
            $("header").removeClass("header-active");
            
        }
        setTimeout(function(){
            $("#mobile-navigation-overlay").css("opacity","0");
        }, 850);
    }
}
//HEADER SCRIPTS END

