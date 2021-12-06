var injected_h5p_setter = `
var h5p_tries = 0;
function seth5p(){
h5p_tries += 1
if (window && h5p_tries<=30) {
        if (window.h5player.H5PIntegration) {
            document.dispatchEvent(new CustomEvent('h5p_updated', { detail: JSON.stringify(window.h5player.H5PIntegration) }));
            setTimeout(seth5p, 500);

        }
        else{
            console.log("No se ha encontrado un objeto h5p válido")
            setTimeout(seth5p, 500);
        }
}}
seth5p();
`;

var script = document.createElement('script');
script.textContent = injected_h5p_setter;
(document.head || document.documentElement).appendChild(script);
script.remove();

var prueba = "test"
var video = undefined;
var seekbar_array = []
var h5p_interactions;
var h5p_content;
var loaded = false
var h5p_jsoncontent;


document.addEventListener('h5p_updated', function (e) {
    h5p_integration_json = JSON.parse(e.detail)

    h5p_content = $.map(h5p_integration_json.contents, function (c, index) {
        if (c.hasOwnProperty("jsonContent")) {
            return c;
        }
    })[0]
    h5p_jsoncontent = JSON.parse(h5p_content.jsonContent)
    h5p_interactions = h5p_jsoncontent.interactiveVideo.assets.interactions.sort((a, b) =>
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
        })
    if (h5p_jsoncontent.interactiveVideo.video.files[0].mime == 'video/mp4') {
        video = $(window.h5player[0].frameElement.contentDocument.body).find("video")[0]
    } else if (h5p_jsoncontent.interactiveVideo.video.files[0].mime == 'video/YouTube') {
        video = $(window.h5player[0].frameElement.contentDocument.body).find("iframe")[0].contents().find("video")[0]
    }
    loaded = true
});
chrome.runtime.onMessage.addListener(

    function (request, sender, sendResponse) {

        if (request.current_url.includes("https://moovi.uvigo.gal/mod/h5pactivity/")) {
            if (request.action == "popup_construct") {
                console.log("Constructing popup...")
                if (!loaded) {
                    sendResponse({
                        loaded: loaded
                    })
                } else {

                    sendResponse({
                        loaded: loaded,
                        answers: $.map(h5p_interactions, function (interaction, index) {
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

                            } else if (interaction.libraryTitle == "Single Choice Set") {
                                return {
                                    "question_number": index,
                                    "type": "single_choice",
                                    "answer": interaction.action.params.questions[0]
                                }


                            } else {
                                return {
                                    "question_number": index,
                                    "type": `UNKNOWN_QUESTION_TYPE_${interaction.libraryTitle}`,
                                    "answer": `Send me this text at valonsodev@gmail.com with subject NEW QUESTION TYPE or to whatsapp --> ${interaction.action} / libraryTitle(${interaction.libraryTitle})`
                                }

                            }


                        }),
                        video_url: `${h5p_content.contentUrl}/${h5p_jsoncontent.interactiveVideo.video.files[0].path}`,
                        seekbar_array: $.map(h5p_interactions, function (interaction) {

                            return interaction.duration.from

                        })
                    });


                }
            } else if (request.action == "change_current_time" && request.seekbar_time_value) {
                try {
                    $(window.h5player[0].frameElement.contentDocument.body).find(".h5p-dialog")[0].style.display = "inherit"
                    $(window.h5player[0].frameElement.contentDocument.body).find(".h5p-dialog-wrapper")[0].style.display = "none"
                    $(window.h5player[0].frameElement.contentDocument.body).find(".h5p-dialog-wrapper").removeClass("h5p-hidden")

                    var current_interaction_type = $(window.h5player[0].frameElement.contentDocument.body).find(".h5p-iv-interactions-announcer")[0].innerText
                    if (current_interaction_type.includes("True/False")) {
                        console.log("Closing True/False interaction")
                        if ($(window.h5player[0].frameElement.contentDocument.body).find(".h5p-interaction")[0]) {
                            $(window.h5player[0].frameElement.contentDocument.body).find(".h5p-interaction")[0].remove()

                        }

                    } else if (current_interaction_type.includes("Fill in the Blanks")) {
                        console.log("Closing Fill in the Blanks interaction")
                        if ($(window.h5player[0].frameElement.contentDocument.body).find(".h5p-interaction")[0]) {
                            $(window.h5player[0].frameElement.contentDocument.body).find(".h5p-interaction")[0].remove()
                            // $(window.h5player[0].frameElement.contentDocument.body).find(".h5p-dialog")[0].style.display = "block"

                        }
                    } else if (current_interaction_type.includes("Multiple Choice")) {
                        console.log("Closing Multiple Choice interaction")

                    } else {
                        console.log("Closing Unknown Type interaction")
                        // $(window.h5player[0].frameElement.contentDocument.body).find(".h5p-dialog")[0].style.display = "none"

                    }
                    video.currentTime = request.seekbar_time_value - 0.3

                    video.play()


                } catch (e) {
                    console.log(e)
                }
            } else if (request.action == "set_playback_rate" && request.playbackRate) {
                try {
                    console.log("Cambiando el playback rate")
                    video.playbackRate = request.playbackRate

                } catch (e) {
                    console.log(e)
                }
            } else if (request.action == "end_video") {
                try {
                    video.currentTime = video.duration - 3

                } catch (e) {
                    console.log(e)
                }

            }

        }
    }
)