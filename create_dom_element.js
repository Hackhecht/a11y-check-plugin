window.onload = function addDiv() {
    // Ein neues Div-Element erstellen
    var newDiv = document.createElement("div");
    newDiv.classList.add("success-stamp-container");

    // Den Textinhalt des Divs festlegen
    newDiv.textContent = "Accessibility checked successfully";

    // Das Logo mit innerHTML einfügen
    newDiv.innerHTML = `
    <svg
    version="1.1"
    id="Ebene_1"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    x="0px"
    y="0px"
    viewBox="0 0 226.8 226.8"
    style="enable-background: new 0 0 226.8 226.8, height:100px; width:100px"
    xml:space="preserve"
>
    <g>
        <g class="st0">
            <path
                class="st1"
                d="M61.2,134.2H44.1l-2.8,8H28.6l17.5-46.1h13.1l17.5,46.1H64L61.2,134.2z M58.1,125.1l-5.4-15.3l-5.4,15.3H58.1z"
            />
        </g>
        <g class="st0">
            <path class="st1" d="M94.3,90.7h-7.5V76.1h20.8v66H94.3V90.7z" />
            <path
                class="st1"
                d="M131.3,90.7h-7.5V76.1h20.8v66h-13.3V90.7z"
            />
        </g>
        <g class="st0">
            <path
                class="st1"
                d="M181.7,137.9l-15.2-27.1h12.8l8.4,16.1l8.1-16.1h12.7l-25.2,47H171L181.7,137.9z"
            />
        </g>
        <path
            class="st2"
            d="M16.8,111.8c0.9-48.1,37.7-89,86.8-93.9c37.7-3.7,72.5,14.8,91.3,44.9l17-4.7c-21.4-38-63.8-61.8-110-57.2C42.4,6.8-1.7,57.6-0.3,116.4L16.8,111.8z"
        />
        <path
            class="st2"
            d="M209.3,109.2c2.5,50.9-35.5,95.4-86.8,100.4c-40.4,4-77.4-17.6-95-51.6l-16.7,4.5c20,41.9,64.6,68.9,113.4,64c61.6-6.1,106.8-60.4,101.9-121.9L209.3,109.2z"
        />
    </g>
</svg>
    Accessibility checked succsessfully!`;

    // CSS-Style festlegen
    newDiv.style.backgroundColor = "white";
    newDiv.style.color = "black";
    newDiv.style.padding = "20px";
    newDiv.style.border = "1px solid black";
    newDiv.style.zIndex = "3000";
    newDiv.style.position = "fixed"; // Position auf "fixed" ändern
    newDiv.style.top = "50%";
    newDiv.style.left = "50%";
    newDiv.style.transform = "translate(-50%, -50%)";
    newDiv.style.opacity = "1";
    newDiv.style.transition = "opacity 1s"; // Übergangswirkung für Opazität
    newDiv.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.5)"; // Schatten nach außen

    // Das Div-Element der Seite hinzufügen
    document.body.appendChild(newDiv);

    // Timer, um das Div nach 3 Sekunden auszublenden
    setTimeout(function() {
        newDiv.style.opacity = "0"; // Opazität langsam auf 0 setzen
        setTimeout(function() {
            document.body.removeChild(newDiv);
        }, 1000); // Warte 1 Sekunde, bevor das Element entfernt wird
    }, 3000); // Warte 3 Sekunden, bevor die Opazität auf 0 gesetzt wird
}

