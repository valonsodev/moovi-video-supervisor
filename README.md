

# Moovi-video-supervisor




Esta extension permite manejar las actividades h5p incrustadas de moovi.uvigo.gal a través de comandos de JavaScript y de DOM traversal.
Esta acompañada de una interfaz bastante sencillita que incluye botones para saltar a los puntos de la actividad que requieren interacción del usuario, un input para cambiar la velocidad de reproducción de las actividades y una lista organizada de las respuestas a las actividades extraidas de un script incrustado en la página.

## Instalación
LA INSTALACIÓN PREVIA ESTÁ OBSOLETA, AHORA EL MÉTODO DE INSTALACIÓN ES A TRAVÉS DE LA WEBSTORE DE CHROME : **[Aquí](https://chrome.google.com/webstore/detail/moovi-h5p-video-superviso/aehhcaibfbeclhheanemanndmebghopk)**


## GLOSSARY

| Term           | Definition|
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Interaction    | Each of the popups that appear during video play and have to be completed.                                                                                            |
| Seekbar        | Circular visual elements that display on top of each video's play bar that visually indicate starting time of each interaction                                        |
| DOM            | Document Object Model, interface that treats an  XML  or  HTML  document as a  tree structure  wherein each  node  is an  object representing a part of the document. |
| JQuery         | JavaScript library that eases traversal of web elements. Called in code as ```  $  ```.                                                                               |
| H5P            | HTML and JS package for creating rich HTML5 content, used for Moovi's interactive videos.                                                                             |
| Popup          | Window displayed when the extension button is clicked, has it's own script.                                                                                           |
| Content-script | JavaScript script that is embedded onto the webpage on load.                                                                                                          |
 
###### General knowledge:
It is important to note how HTML's *iframes* work in regards to DOM traversal.
```html
<iframe/>
```
In the context of a page a script cannot access the *iframe*'s inner elements by itself, as an *iframe* is an embedded webpage inside a webpage. To solve this problem that limits control over the innermost elements we first have to access the *iframe*'s **DOM** :
```js
document.querySelector("iframe").contentWindow.document //Using normal JS
$("iframe").contents() //Using JQuery

``` 
and then search inside said **DOM** :

```js
document.querySelector("iframe").contentWindow.document.querySelector("selector") //Using normal JS
$("iframe").contents().find("selector") //Using JQuery

``` 
since we have nested iframes we do it twice to find our main *video* element :

```js
$("iFrame").contents().find("iframe").contents().find("video")
```
###### Further explanation will be provided in each file's comments.

## El diablo:
```js

$.map($("iframe").contents().find("script"), function (script) {
    if (script.innerText && script.innerText.includes("var H5PIntegration")) {
        script_text = script.innerText.slice(script.innerText.indexOf("{", 0))

        return $.map(JSON.parse(Object.values(JSON.parse(script_text.slice(0, script_text.lastIndexOf(";"))).contents)[0].jsonContent).interactiveVideo.assets.interactions.sort(GetSortOrder("duration", "from")), function (interaction, index) {});
    }
})
```
### Créditos
A mi mismo porque la verdad es que no ayuda nadie.

![gatoooo](https://i.pinimg.com/originals/2c/ec/71/2cec71161268a2ef69288b5a4a210587.jpg)