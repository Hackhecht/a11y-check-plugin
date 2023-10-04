function get_axe() {
    fetch('/wp-json/a11y-check-plugin/v1/get-results', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then((response) => response.json())

        .then((data) => {
            for (var i = 0; i < data.database_entry.length; i++) {
                const resultRow = document.createElement('tr');
                resultRow.className = 'test-result-row ' + i;
                const testResultTableBody = document.getElementById(
                    'test-result-table-body'
                );
                testResultTableBody.appendChild(resultRow);

                const testId = data.database_entry[i].id;
                const testUrl = new URL(data.database_entry[i].page_url);
                const pageSlug = testUrl.pathname.replace(/\//g, '');

                const timeStamp = data.database_entry[i].time_stamp;
                const date = new Date(timeStamp);
                const options = {
                    year: 'numeric',
                    month: 'numeric',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                    second: 'numeric',
                };
                const formattedDate = new Intl.DateTimeFormat(
                    'de-DE',
                    options
                ).format(date);

                const idCell = document.createElement('td');
                idCell.setAttribute('data-th', 'Test Id');
                resultRow.appendChild(idCell);
                const resultCell = document.createElement('td');
                resultCell.setAttribute('data-th', 'Test Result');
                resultRow.appendChild(resultCell);
                const dateCell = document.createElement('td');
                dateCell.setAttribute('data-th', 'Date');
                resultRow.appendChild(dateCell);
                const pageNameCell = document.createElement('td');
                pageNameCell.setAttribute('data-th', 'Page Name');
                resultRow.appendChild(pageNameCell);
                const testDepthCell = document.createElement('td');
                resultRow.appendChild(testDepthCell);

                idCell.textContent = testId;
                dateCell.textContent = formattedDate;
                pageNameCell.textContent = pageSlug;
                testDepthCell.textContent = 'WCAG 2: Level A & AA';

                const testContent = JSON.parse(data.database_entry[i].axe_test);
                const violations = testContent.violations;
                const incomplete = testContent.incomplete;

                /** Der Event-Listener 'toggleIssues' wird an jede Zeile der Tabelle mit den Test-Ergebnissen gehangen,
                 *  damit bei einem Klick auf diese entsprechende Violations- und Incomplete-Zeilen eingeblendet werden.
                 *  Der Index des jeweiligen Tests wird durch das .bind() bei Laufzeit übergeben, damit der Index trotz
                 *  asynchronen Aufrufs von addEventListener richtig übergeben wird.
                 */

                const resultRowElement =
                    document.getElementsByClassName('test-result-row');
                resultRowElement[i].addEventListener(
                    'click',
                    toggleIssues.bind(null, i)
                );

                if (violations.length == 0 && incomplete.length == 0) {
                    resultCell.textContent = 'No issues found.';
                }

                const incompleteImpactArray = [];
                let testResultText = '';

                for (var j = 0; j < incomplete.length; j++) {
                    const incompleteType = incomplete[j].id;
                    const incompleteDescription = incomplete[j].description;
                    const incompleteHelp = incomplete[j].help;
                    const incompleteRow = document.createElement('tr');
                    incompleteRow.className = 'incomplete-result-row ' + i;
                    incompleteRow.setAttribute('id', 'incomplete-element ' + j);
                    const issueResultTableBody =
                        document.getElementById('issue-table-body');
                    issueResultTableBody.appendChild(incompleteRow);
                    const issueCell = document.createElement('td');
                    issueCell.setAttribute('data-th', 'Issue');
                    incompleteRow.appendChild(issueCell);
                    const descriptionCell = document.createElement('td');
                    descriptionCell.setAttribute('data-th', 'Description');
                    incompleteRow.appendChild(descriptionCell);
                    const helpCell = document.createElement('td');
                    helpCell.setAttribute('data-th', 'Help');
                    incompleteRow.appendChild(helpCell);

                    issueCell.textContent = incompleteType;
                    descriptionCell.textContent = incompleteDescription;
                    helpCell.textContent = incompleteHelp;

                    const incompleteImpact = incomplete[j].impact;
                    incompleteImpactArray.push(incompleteImpact);

                    const incompleteRows = document.getElementsByClassName(
                        'incomplete-result-row ' + i
                    );

                    if (incompleteRows.length > 0) {
                        const incompleteRowElement = Array.from(incompleteRows);

                        incompleteRowElement[j].addEventListener(
                            'click',
                            toggleIncompleteNodes.bind(null, j, i)
                        );
                    }

                    for (var x = 0; x < incomplete[j].nodes.length; x++) {
                        const incompleteNodes = incomplete[j].nodes[x].html;
                        const nodeFixAdvice =
                            incomplete[j].nodes[x].failureSummary;
                        const helpUrl = incomplete[j].helpUrl;
                        const incompleteNodesRow = document.createElement('tr');
                        incompleteNodesRow.className =
                            'incomplete-nodes-row ' + i;
                        incompleteNodesRow.setAttribute(
                            'data-id',
                            'incomplete-id ' + j
                        );
                        incompleteNodesRow.setAttribute(
                            'id',
                            'incomplete-node-element ' + x
                        );
                        const nodesTableBody =
                            document.getElementById('nodes-table-body');
                        nodesTableBody.appendChild(incompleteNodesRow);
                        const incompleteNodesCell =
                            document.createElement('td');
                        incompleteNodesCell.setAttribute(
                            'data-th',
                            'Concerned Elements'
                        );
                        incompleteNodesRow.appendChild(incompleteNodesCell);
                        const adviceCell = document.createElement('td');
                        adviceCell.setAttribute('data-th', 'Fix Advice');
                        incompleteNodesRow.appendChild(adviceCell);
                        const helpUrlCell = document.createElement('td');
                        helpUrlCell.setAttribute('data-th', 'Help-Page');
                        incompleteNodesRow.appendChild(helpUrlCell);

                        incompleteNodesCell.textContent = incompleteNodes;
                        adviceCell.textContent = nodeFixAdvice;
                        helpUrlCell.textContent = helpUrl;
                    }
                }

                if (incomplete.length > 0) {
                    if (incomplete.length == 1) {
                        testResultText = `There is one issue of type 'incomplete' which needs to be reviewed.`;
                    } else {
                        testResultText = `There are ${incomplete.length} issues of type 'incomplete' which need to be reviewed.`;
                    }
                }

                if (
                    incompleteImpactArray.includes('serious') ||
                    incompleteImpactArray.includes('moderate') ||
                    (incompleteImpactArray.includes('serious') &&
                        incompleteImpactArray.includes('moderate'))
                ) {
                    const numOfSeriousIncompletes =
                        incompleteImpactArray.filter(
                            (x) => x === 'serious'
                        ).length;
                    const numOfModerateIncompletes =
                        incompleteImpactArray.filter(
                            (x) => x === 'moderate'
                        ).length;
                    if (numOfSeriousIncompletes > 0) {
                        numOfSeriousIncompletes == 1
                            ? (testResultText += ` One has <span style="color:#FFFFFF;background-color: #F00000;> serious </span> impact.`)
                            : (testResultText += ` ${numOfSeriousIncompletes} of them have <span style="color:#FFFFFF;background-color: #F00000;"> serious </span> impact.`);
                    }
                    if (numOfModerateIncompletes > 0) {
                        numOfModerateIncompletes == 1
                            ? (testResultText += ` One has <span style="color:#FFFFFF;background-color: #B35F00;"> moderate </span> impact.`)
                            : (testResultText += ` ${numOfModerateIncompletes} of them have <span style="color:#FFFFFF;background-color: #B35F00;"> moderate </span> impact.`);
                    }
                }

                const violationsImpactArray = [];

                for (var k = 0; k < violations.length; k++) {
                    const violationType = violations[k].id;
                    const violationDescription = violations[k].description;
                    const violationHelp = violations[k].help;
                    const violationsRow = document.createElement('tr');
                    violationsRow.className = 'violations-result-row ' + i;
                    violationsRow.setAttribute('id', 'violation-element ' + k);
                    const issueResultTableBody =
                        document.getElementById('issue-table-body');
                    issueResultTableBody.appendChild(violationsRow);
                    const issueCell = document.createElement('td');
                    issueCell.setAttribute('data-th', 'Issue');
                    violationsRow.appendChild(issueCell);
                    const descriptionCell = document.createElement('td');
                    descriptionCell.setAttribute('data-th', 'Description');
                    violationsRow.appendChild(descriptionCell);
                    const helpCell = document.createElement('td');
                    helpCell.setAttribute('data-th', 'Help');
                    violationsRow.appendChild(helpCell);

                    issueCell.textContent = violationType;
                    descriptionCell.textContent = violationDescription;
                    helpCell.textContent = violationHelp;

                    const violationsImpact = violations[k].impact;
                    violationsImpactArray.push(violationsImpact);

                    const violationsRows = document.getElementsByClassName(
                        'violations-result-row ' + i
                    );

                    if (violationsRows.length > 0) {
                        const violationRowElement = Array.from(violationsRows);

                        violationRowElement[k].addEventListener(
                            'click',
                            toggleViolationNodes.bind(null, k, i)
                        );
                    }

                    for (var l = 0; l < violations[k].nodes.length; l++) {
                        const violationsNodes = violations[k].nodes[l].html;
                        const nodeFixAdvice =
                            violations[k].nodes[l].failureSummary;
                        const helpUrl = violations[k].helpUrl;
                        const violationsNodesRow = document.createElement('tr');
                        violationsNodesRow.className =
                            'violations-nodes-row ' + i;
                        violationsNodesRow.setAttribute(
                            'data-id',
                            'violations-id ' + k
                        );
                        violationsNodesRow.setAttribute(
                            'id',
                            'violations-node-element ' + l
                        );
                        const nodesTableBody =
                            document.getElementById('nodes-table-body');
                        nodesTableBody.appendChild(violationsNodesRow);
                        const violationsNodesCell =
                            document.createElement('td');
                        violationsNodesCell.setAttribute(
                            'data-th',
                            'Concerned Elements'
                        );
                        violationsNodesRow.appendChild(violationsNodesCell);
                        const adviceCell = document.createElement('td');
                        adviceCell.setAttribute('data-th', 'Fix Advice');
                        violationsNodesRow.appendChild(adviceCell);
                        const helpUrlCell = document.createElement('td');
                        helpUrlCell.setAttribute('data-th', 'Help-Page');
                        violationsNodesRow.appendChild(helpUrlCell);

                        violationsNodesCell.textContent = violationsNodes;
                        adviceCell.textContent = nodeFixAdvice;
                        helpUrlCell.textContent = helpUrl;
                    }
                }

                if (violations.length > 0) {
                    if (violations.length == 1) {
                        testResultText += ` Also, there is one issue of type 'violation' which needs to be double checked.`;
                    } else {
                        testResultText += ` Also, there are ${violations.length} issues of type 'violation' which need to be double checked.`;
                    }
                }

                if (
                    violationsImpactArray.includes('serious') ||
                    violationsImpactArray.includes('moderate') ||
                    (violationsImpactArray.includes('serious') &&
                        violationsImpactArray.includes('moderate'))
                ) {
                    const numOfSeriousViolations = violationsImpactArray.filter(
                        (x) => x === 'serious'
                    ).length;
                    const numOfModerateViolations =
                        violationsImpactArray.filter(
                            (x) => x === 'moderate'
                        ).length;
                    if (numOfSeriousViolations > 0) {
                        numOfSeriousViolations == 1
                            ? (testResultText += ` One has <span style="color:#FFFFFF;background-color: #F00000;"> serious </span>impact.`)
                            : (testResultText += ` ${numOfSeriousViolations} of them have <span style="color:#FFFFFF;background-color: #F00000;"> serious </span> impact.`);
                    }
                    if (numOfModerateViolations > 0) {
                        numOfModerateViolations == 1
                            ? (testResultText += ` One has <span style="color:#FFFFFF;background-color: #B35F00;"> moderate </span> impact.`)
                            : (testResultText += ` ${numOfModerateViolations} of them have <span style="color:#FFFFFF;background-color: #B35F00;"> moderate </span> impact.`);
                    }
                }

                resultCell.innerHTML = testResultText;

                function toggleIssues(i) {
                    const focusedTestRow =
                        document.getElementsByClassName('focused');

                    if (focusedTestRow.length > 0) {
                        Array.from(focusedTestRow).forEach((row) =>
                            row.classList.remove('focused')
                        );
                    }

                    const clickedTestRow = document.getElementsByClassName(
                        'test-result-row ' + i
                    );

                    if (clickedTestRow.length > 0) {
                        Array.from(clickedTestRow).forEach((testRow) =>
                            testRow.classList.add('focused')
                        );
                    }

                    const activeElements =
                        document.getElementsByClassName('active');

                    if (activeElements.length > 0) {
                        Array.from(activeElements).forEach((activeElement) =>
                            activeElement.classList.remove('active')
                        );
                    }

                    const incompleteRowElements =
                        document.getElementsByClassName(
                            'incomplete-result-row ' + i
                        );

                    const violationsRowElements =
                        document.getElementsByClassName(
                            'violations-result-row ' + i
                        );

                    if (incompleteRowElements.length > 0) {
                        Array.from(incompleteRowElements).forEach(
                            (incompleteRowElement) =>
                                incompleteRowElement.classList.add('active')
                        );
                    }

                    if (violationsRowElements.length > 0) {
                        Array.from(violationsRowElements).forEach(
                            (violationRowElement) =>
                                violationRowElement.classList.add('active')
                        );
                    }
                }

                function toggleIncompleteNodes(j, i) {
                    const focusedIssueRow =
                        document.getElementsByClassName('focused-issue');

                    if (focusedIssueRow.length > 0) {
                        Array.from(focusedIssueRow).forEach((row) =>
                            row.classList.remove('focused-issue')
                        );
                    }

                    const clickedIncompleteRow =
                        document.getElementsByClassName(
                            'incomplete-result-row ' + i
                        );

                    if (clickedIncompleteRow.length > 0) {
                        const clickedIncompleteRowElement =
                            Array.from(clickedIncompleteRow);

                        clickedIncompleteRowElement[j].classList.add(
                            'focused-issue'
                        );
                    }

                    const activeNodeElements =
                        document.getElementsByClassName('nodes-active');

                    if (activeNodeElements.length > 0) {
                        Array.from(activeNodeElements).forEach(
                            (activeNodeElement) =>
                                activeNodeElement.classList.remove(
                                    'nodes-active'
                                )
                        );
                    }

                    const nodesFromOneTest = document.getElementsByClassName(
                        'incomplete-nodes-row ' + i
                    );

                    const incompleteIdentifier = `[data-id='incomplete-id ${j}']`;

                    const nodesPerIncomplete = Array.from(
                        nodesFromOneTest
                    ).filter(function (element) {
                        return element.matches(incompleteIdentifier);
                    });

                    if (nodesPerIncomplete.length > 0) {
                        nodesPerIncomplete.forEach((node) =>
                            node.classList.add('nodes-active')
                        );
                    }
                }

                function toggleViolationNodes(k, i) {
                    const focusedViolationRow =
                        document.getElementsByClassName('focused-issue');

                    if (focusedViolationRow.length > 0) {
                        Array.from(focusedViolationRow).forEach((row) =>
                            row.classList.remove('focused-issue')
                        );
                    }

                    const clickedViolationRow = document.getElementsByClassName(
                        'violations-result-row ' + i
                    );

                    if (clickedViolationRow.length > 0) {
                        const clickedViolationRowElement =
                            Array.from(clickedViolationRow);

                        clickedViolationRowElement[k].classList.add(
                            'focused-issue'
                        );
                    }

                    const activeNodeElements =
                        document.getElementsByClassName('nodes-active');

                    if (activeNodeElements.length > 0) {
                        Array.from(activeNodeElements).forEach(
                            (activeNodeElement) =>
                                activeNodeElement.classList.remove(
                                    'nodes-active'
                                )
                        );
                    }

                    const nodesFromOneTest = document.getElementsByClassName(
                        'violations-nodes-row ' + i
                    );

                    const violationsIdentifier = `[data-id='violations-id ${k}']`;

                    const nodesPerViolation = Array.from(
                        nodesFromOneTest
                    ).filter(function (element) {
                        return element.matches(violationsIdentifier);
                    });

                    if (nodesPerViolation.length > 0) {
                        nodesPerViolation.forEach((node) =>
                            node.classList.add('nodes-active')
                        );
                    }
                }
            }
        })
        .catch(function (error) {
            console.log(
                'Fetching data from /get-results did not work',
                error.message
            );
        });
}
