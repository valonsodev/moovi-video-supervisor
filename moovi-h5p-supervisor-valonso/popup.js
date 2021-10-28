"use strict"





chrome.tabs.query({
    active: true,
    currentWindow: true
}, function (tabs) {
    if (tabs[0].url.includes("https://moovi.uvigo.gal/mod/h5pactivity/")) {
        chrome.tabs.sendMessage(tabs[0].id, {
            action: "get_seekbar_array",
            current_url: tabs[0].url,

        }, function (result) {
            console.log(result)
            console.log(result.seekbar_array);
            document.querySelector("h1").remove()

            var input_number = document.createElement("input")
            input_number.type = "number"
            input_number.id = "input-number"
            input_number.placeholder = "0.07 < x < 16"
            input_number.min = 0.07
            input_number.max = 16
            input_number.step = 0.01


            document.body.appendChild(input_number)

            var button_form = document.createElement("button")
            button_form.type = "submit"
            button_form.id = "form_button"
            button_form.appendChild(document.createTextNode(`SetPlaybackRate`))
            document.body.appendChild(button_form)

            document.getElementById("form_button").onclick = function () {
                console.log(parseFloat(document.getElementById("input-number").value))

                var input = parseFloat(document.getElementById("input-number").value)
                if (0.07 <= input && input <= 16) {
                    chrome.tabs.sendMessage(tabs[0].id, {
                        action: "set_playback_rate",
                        current_url: tabs[0].url,
                        playbackRate: input
                    });
                } else {
                    document.getElementById("input-number").value = ""
                    document.getElementById("input-number").placeholder = "Null number"

                }
            }

            result.seekbar_array.map(function (seekbar_position, iteration) {
                var button = document.createElement("button")
                button.id = `button_${iteration}`
                button.appendChild(document.createTextNode(`Ir a la pregunta N\u00BA ${iteration+1}`))
                for (let i = 0; i < 2; i++) {
                    button.appendChild(document.createElement("span"))
                }



                document.body.appendChild(button)
                document.getElementById(`button_${iteration}`).onclick = function () {

                    if (tabs[0].url.includes("https://moovi.uvigo.gal/mod/h5pactivity/")) {
                        console.log("Enviando mensaje al content_script")
                        chrome.tabs.sendMessage(tabs[0].id, {
                            action: "change_current_time",
                            current_url: tabs[0].url,
                            seekbar_time_value: seekbar_position
                        });
                    }

                };


            })
        });
    }
})