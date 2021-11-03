    console.log("Starting content-script")
    var video = undefined;
    var seekbar_array = []
    $('iframe').on('load', async function () {
        console.log("IFRAME HAS LOADED")

    });


    chrome.runtime.onMessage.addListener(
        function (request, sender, sendResponse) {
            if (request.current_url.includes("https://moovi.uvigo.gal/mod/h5pactivity/")) {
                if (request.action == "popup_construct" && $("iFrame").contents().find("iframe").length) {
                    console.log("Returning array of seekbars")



                    sendResponse({
                        answers: $.map($("iframe").contents().find("script"), function (script) {

                                if (script.innerText && script.innerText.includes("var H5PIntegration")) {
                                    script_text = script.innerText.slice(script.innerText.indexOf("{", 0))


                                    return $.map(JSON.parse($.map((JSON.parse(script_text.slice(0, script_text.lastIndexOf(";"))).contents), function (c, index) {
                                        if (c.hasOwnProperty("jsonContent")) {
                                            return c.jsonContent;
                                        }
                                    })).interactiveVideo.assets.interactions.sort((a, b) =>
                                        /*  
                                        Function that returns a JSON object ordered based on a nested property.
                                        In this case ["duration"]["from"] which refers to the first second of each interaction.
                                        */
                                        {
                                            if (a.duration.from > b.duration.from) {
                                                return 1;
                                            } else if (a.duration.from < b.duration.from) {
                                                return -1;
                                            }
                                            return 0;
                                        }), function (interaction, index) {
                                        if (interaction.libraryTitle == "True/False Question") {
                                            true_answer = interaction.action.params.correct
                                            if (true_answer == "true") {
                                                true_answer = "Verdadero"
                                            } else {
                                                true_answer = "Falso"
                                            }
                                            return {
                                                "question_number": index,
                                                "type": "true_false",
                                                "answer": true_answer
                                            }


                                        } else if (interaction.libraryTitle == "Multiple Choice") {
                                            return {
                                                "question_number": index,
                                                "type": "multiple_choice",
                                                "answer": $.map(interaction.action.params.answers, function (answer) {
                                                    if (answer.correct) {
                                                        return answer.text.slice(answer.text.indexOf(">") + 1, answer.text.lastIndexOf("<"))
                                                    }
                                                })
                                            }
                                        } else if (interaction.libraryTitle == "Fill in the Blanks") { //   /\*\S*\*/g
                                            return {
                                                "question_number": index,
                                                "type": "blank_fill",
                                                "answer": $.map(interaction.action.params.questions, function (question) {
                                                    return question.match(/\*\S*\*/g).map(function (str) {
                                                        return str.slice(1, -1)
                                                    })
                                                })
                                            }


                                        }

                                    });
                                }
                            }


                        ),
                        video_url: $("iFrame").contents().find("iframe").contents().find("video")[0].src,
                        seekbar_array: Array.from($("iFrame").contents().find("iframe").contents().find(".h5p-seekbar-interaction").map(function (index, seekbar) {
                            return seekbar.style.cssText.match(/[+-]?\d+(\.\d+)?/g).map(function (v) {
                                return parseFloat(v);
                            })[0]
                        }))
                    });


                } else if (request.action == "change_current_time" && request.seekbar_time_value) {
                    try {
                        var video = $("iFrame").contents().find("iframe").contents().find("video")[0];
                        $("iFrame").contents().find("iframe").contents().find(".h5p-dialog")[0].style.display = "inherit"
                        $("iFrame").contents().find("iframe").contents().find(".h5p-dialog-wrapper")[0].style.display = "none"
                        $("iFrame").contents().find("iframe").contents().find(".h5p-dialog-wrapper").removeClass("h5p-hidden")

                        var current_interaction_type = $("iFrame").contents().find("iframe").contents().find(".h5p-iv-interactions-announcer")[0].innerText
                        if (current_interaction_type.includes("True/False")) {
                            console.log("Closing True/False interaction")
                            if ($("iFrame").contents().find("iframe").contents().find(".h5p-interaction")[0]) {
                                $("iFrame").contents().find("iframe").contents().find(".h5p-interaction")[0].remove()

                            }

                        } else if (current_interaction_type.includes("Fill in the Blanks")) {
                            console.log("Closing Fill in the Blanks interaction")
                            if ($("iFrame").contents().find("iframe").contents().find(".h5p-interaction")[0]) {
                                $("iFrame").contents().find("iframe").contents().find(".h5p-interaction")[0].remove()
                                // $("iFrame").contents().find("iframe").contents().find(".h5p-dialog")[0].style.display = "block"

                            }
                        } else if (current_interaction_type.includes("Multiple Choice")) {
                            console.log("Closing Multiple Choice interaction")

                        } else {
                            console.log("Closing Unknown Type interaction")
                            console.log("Cerrando el fill the blank")
                            // $("iFrame").contents().find("iframe").contents().find(".h5p-dialog")[0].style.display = "none"

                        }








                        video.currentTime = video.duration / 100 * request.seekbar_time_value - 0.5

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
                } else if (request.action == "end_video") {
                    try {
                        var video = $("iFrame").contents().find("iframe").contents().find("video")[0];
                        video.currentTime = video.duration - 3

                    } catch (e) {
                        console.log(e)
                    }

                }

            }
        }
    )