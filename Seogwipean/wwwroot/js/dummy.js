<div id="imageBox" style="display: none;">
    <img id="img1" src="~/building/day2.jpg" />
    <img id="img2" src="~/building/day3.jpg" />
    <img id="img3" src="~/building/night2.jpg" />
    <img id="img4" src="~/building/night3.jpg" />
</div>


//사진 전환
function fnRepeat() {
    setTimeout(function () {
        fnRepeat();
    }, 4000);
    var $img1 = $("#img1").attr("src");
    var $img2 = $("#img2").attr("src");
    var $img3 = $("#img3").attr("src");
    var $img4 = $("#img4").attr("src");
    if (screen.width <= 425) {
        switch (backgroundCnt) {
            case 0: { $("body").css("background", `url(${$img1}) 35% 0 no-repeat`); break; }
            case 1: { $("body").css("background", `url(${$img2}) 25% 20% no-repeat`); break; }
            case 2: { $("body").css("background", `url(${$img3}) 0 20% no-repeat`); break; }
            case 3: { $("body").css("background", `url(${$img4}) 28% 20% no-repeat`); backgroundCnt = 0; break; }
        }
    } else {
        switch (backgroundCnt) {
            case 0: { $("body").css("background", `url(${$img1}) 0 40% no-repeat`); break; }
            case 1: { $("body").css("background", `url(${$img2}) 0 35% no-repeat`); break; }
            case 2: { $("body").css("background", `url(${$img3}) 0 30% no-repeat`); break; }
            case 3: { $("body").css("background", `url(${$img4}) 0 25% no-repeat`); backgroundCnt = 0; break; }
        }
    }
    backgroundCnt++;
    $("body").css("background-size", "cover");
}



function randomInt(min, max) {
    return min + Math.floor((max - min) * Math.random());
}

function fnAutoBat() {
    $("#bet-price").val(1000);
    var _rand = randomInt(1, 4);
    switch (_rand) {
        case 1: {
            $("[data-pick-name='홀언더']").click();
            break;
        } case 2: {
            $("[data-pick-name='홀오버']").click();
            break;
        } case 3: {
            $("[data-pick-name='짝오버']").click();
            break;
        } case 4: {
            $("[data-pick-name='짝언더']").click();
            break;
        }
    }
    betGo();
    setTimeout(function () { $("#confirmModal .btn-confirm-ok").click(); }, 1000);
    setTimeout(function () { $("#confirmModal .btn-confirm-ok").click(); }, 4000);
};