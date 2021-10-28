var video;
var seekbar_array = []
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.current_url.includes("https://moovi.uvigo.gal/mod/h5pactivity/")) {
            if (request.action == "get_seekbar_array" && $("iFrame").contents().find("iframe").length) {
                console.log("Returning array of seekbars")
                seekbar_array = Array.from($("iFrame").contents().find("iframe").contents().find(".h5p-seekbar-interaction").map(function (index, seekbar) {
                    return seekbar.style.cssText.match(/[+-]?\d+(\.\d+)?/g).map(function (v) {
                        return parseFloat(v);
                    })[0]
                }))


                sendResponse({
                    seekbar_array: seekbar_array
                });


            } else if (request.action == "change_current_time" && request.seekbar_time_value) {
                try {
                    var video = $("iFrame").contents().find("iframe").contents().find("video")[0];
                    console.log("Cambiando el tiempo del video")
                    if ($("iFrame").contents().find("iframe").contents().find(".h5p-dialog-wrapper")[0].style.display == "block") {
                        $("iFrame").contents().find("iframe").contents().find(".h5p-dialog-wrapper")[0].style.display = "none"
                    }
                    video.currentTime = video.duration / 100 * request.seekbar_time_value - 0.5
                    console.log(video.currentTime)
                    video.play()

                } catch (e) {
                    console.log(e)
                }
            } else if (request.action == "set_playback_rate" && request.playbackRate) {
                try {
                    var video = $("iFrame").contents().find("iframe").contents().find("video")[0];
                    console.log("Cambiando el playback rate")
                    video.playbackRate = request.playbackRate

                } catch (e) {
                    console.log(e)
                }

            }

        }
    }
);