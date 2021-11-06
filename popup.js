"use strict"



chrome.tabs.query({
    active: true,
    currentWindow: true
}, function (tabs) {

    if (tabs[0].url && !(tabs[0].url.includes("chrome://"))) {
        console.log(tabs)
        if (tabs && tabs[0].url.includes("moovi.uvigo.gal")) {
            if (tabs[0].url.includes("h5p")) {
                chrome.tabs.sendMessage(tabs[0].id, {
                        action: "popup_construct",
                        current_url: tabs[0].url,

                    }, function (result) {
                        if (chrome.runtime.lastError) {
                            var unvalid_h1 = document.createElement("h1")

                            unvalid_h1.className = "unvalid"
                            unvalid_h1.style = "white-space: pre-line"

                            unvalid_h1.appendChild(document.createTextNode(`Error de conexión con el script. \n Prueba a recargar la página.`))
                            document.body.appendChild(unvalid_h1)
                            console.log("Message connection error")
                        } else {
                            if (!result.loaded) {
                                var unvalid_h1 = document.createElement("h1")

                                unvalid_h1.className = "unvalid"
                                unvalid_h1.appendChild(document.createTextNode(`El script aún no cargó, espera un momento.`))
                                document.body.appendChild(unvalid_h1)
                                console.log("Unloaded script error")
                                setTimeout(function () {
                                    location.reload()
                                }, 1000);

                            } else {
                                console.log(result)
                                var playback_div = document.createElement("div")
                                playback_div.id = "playback_div"
                                var input_number = document.createElement("input")
                                input_number.type = "number"
                                input_number.id = "input-number"
                                input_number.placeholder = "0.07 < x < 16"
                                input_number.min = 0.07
                                input_number.max = 16
                                input_number.step = 0.01
                                playback_div.appendChild(input_number)



                                var button_form = document.createElement("button")
                                button_form.type = "submit"
                                button_form.id = "form_button"
                                button_form.appendChild(document.createTextNode(`SetSpeed`))
                                playback_div.appendChild(button_form)
                                document.getElementById("interface_wrapper").appendChild(playback_div)

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


                                result.seekbar_array.map(function (seekbar_time_value, iteration) {
                                    var button = document.createElement("button")
                                    button.id = `button_${iteration+1}`
                                    button.appendChild(document.createTextNode(`Ir a la pregunta N\u00BA ${iteration+1}`))
                                    for (let i = 0; i < 2; i++) {
                                        button.appendChild(document.createElement("span"))
                                    }



                                    document.getElementById("interface_wrapper").appendChild(button)
                                    document.getElementById(`button_${iteration+1}`).onclick = function () {

                                        if (tabs[0].url.includes("h5p")) {
                                            console.log("Sending time change petition to content script")
                                            chrome.tabs.sendMessage(tabs[0].id, {
                                                action: "change_current_time",
                                                current_url: tabs[0].url,
                                                seekbar_time_value: seekbar_time_value
                                            });
                                        }

                                    };


                                })











                                var link_div = document.createElement("div")
                                link_div.id = "link_div"
                                var button = document.createElement("button")
                                button.id = "video_link"
                                button.className = "link_button"
                                button.appendChild(document.createTextNode(`V\u00CDdeo`))
                                for (let i = 0; i < 4; i++) {
                                    button.appendChild(document.createElement("span"))
                                }
                                link_div.appendChild(button)

                                var button = document.createElement("button")
                                button.id = "answers_button"
                                button.className = "link_button"
                                button.appendChild(document.createTextNode(`Respuestas`))
                                for (let i = 0; i < 4; i++) {
                                    button.appendChild(document.createElement("span"))
                                }
                                link_div.appendChild(button)
                                document.getElementById("interface_wrapper").appendChild(link_div)

                                document.getElementById(`video_link`).onclick = function () {
                                    window.open(result.video_url)


                                }
                                document.getElementById(`answers_button`).onclick = function () {
                                    Array.from(document.getElementsByClassName("question_div")).map(function (div) {
                                        div.classList.add('shaking');
                                    })
                                    setTimeout(function () {
                                        Array.from(document.getElementsByClassName("question_div")).map(function (div) {
                                            div.classList.remove('shaking')
                                        })
                                    }, 1000);


                                }

                                result.answers.map(function (question, iteration) {
                                    var question_div = document.createElement("div")
                                    question_div.className = "question_div"
                                    question_div.id = `question_div`

                                    var question_type = document.createElement("h1")
                                    question_type.className = "question_type"

                                    question_type.appendChild(document.createTextNode(`Pregunta ${iteration+1}: ${question.type}`))
                                    question_div.appendChild(question_type)
                                    var question_answer = document.createElement("span")
                                    question_answer.className = "question_answer"

                                    question_answer.id = `answer_${iteration+1}`

                                    if (question.type == "true_false") {

                                        var ul_answer = document.createElement("li")
                                        ul_answer.appendChild(document.createTextNode(question.answer))
                                        question_answer.appendChild(ul_answer)


                                    } else if (question.type == "blank_fill" || question.type == "multiple_choice") {
                                        var answer_list = document.createElement("ul")
                                        answer_list.className = "question_answer"
                                        question.answer.map(function (ans, iteration) {
                                            var ul_answer = document.createElement("li")
                                            ul_answer.appendChild(document.createTextNode(ans))
                                            answer_list.appendChild(ul_answer)
                                        })
                                        question_div.appendChild(answer_list)


                                    } else {
                                        question_answer.appendChild(document.createTextNode("Invalid question type"))
                                    }
                                    question_div.appendChild(question_answer)
                                    document.getElementById("interface_wrapper").appendChild(question_div)



                                })
                                var span = document.createElement("span")
                                span.className = "filler"
                                document.getElementById("interface_wrapper").appendChild(span)




                            }
                        }
                    }

                );


            } else {
                var unvalid_h1 = document.createElement("h1")

                unvalid_h1.className = "unvalid"
                unvalid_h1.style = "white-space: pre-line"
                unvalid_h1.appendChild(document.createTextNode(`Estás en moovi pero no en una actividad h5p... \n Si crees que esto es un error mandame un correo :P`))
                document.body.appendChild(unvalid_h1)

                var unvalid_a = document.createElement("a")
                unvalid_a.className = "unvalid"
                unvalid_a.href = `mailto:valonsodev@gmail.com`
                unvalid_a.appendChild(document.createTextNode(`valonsodev@gmail.com`))
                document.body.appendChild(unvalid_a)

                console.log("Your url doesn't have h5p in it")
            }
        } else {
            var unvalid_h1 = document.createElement("h1")

            unvalid_h1.className = "unvalid"
            unvalid_h1.appendChild(document.createTextNode(`ESTÁS EN UN DOMINIO INCORRECTO`))
            document.body.appendChild(unvalid_h1)
            console.log("You are in the wrong domain")
        }
    } else {


        var unvalid_h1 = document.createElement("h1")
        unvalid_h1.className = "unvalid"
        unvalid_h1.appendChild(document.createTextNode(`Estas en un dominio chrome://`))
        document.body.appendChild(unvalid_h1)
        console.log("Estas en un dominio privado de chrome")

    }
})