/**
 *  An dieser Stelle wird das axe-core-Script ausgeführt.
 *  Dabei handelt es sich um eine umfrangreiche Bibliothek zur Überprüfung der Barrierefreiheitsregeln.
 *  Axe-core ist ein kostenloses Open-Source-Tool.
 *  Mehr Informationen unter: https://github.com/dequelabs/axe-core
 *  Die API-Referenz ist hier zu finden: https://github.com/dequelabs/axe-core/blob/develop/doc/API.md
 *  Unter Verwendung eines fetch-requests werden die Ergebnisse für das Speichern in die Datenbank abgefragt.
 */

axe.configure({
    //rules: [{ id: 'region', enabled: false }],
});

axe.getRules(['wcag2aa', 'wcag2a']);

axe.run({
    resultTypes: ['violations', 'incomplete', 'inapplicable'],
})
    .then((results) => {
        if (results.violations.length) {
            fetch('/wp-json/a11y-check-plugin/v1/save-results', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(results),
            })
                .then(function (response) {})
                .catch(function (error) {
                    console.error(
                        'Fetching data from /update did not work',
                        error.message
                    );
                });
        }
    })
    .catch((error) => {
        console.error('Running the axe test did not work: ', error.message);
    });
