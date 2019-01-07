var checkValidation = function () {
    var success = true;
    var target = null;
    var reason = "";
    $("[data-validation=1]").each(function () {
        var item = $(this);
        if (item.val().trim() === "")
        {
            success = false;
            target = item;
            reason = `${item.attr("alt")} 비어있습니다.`;
        }
    });
    if (!success) {
        alert(reason);
        return false;
    }
    return true;
};