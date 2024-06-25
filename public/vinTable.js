async function fetchAndDisplayVinIssues(vin, data) {
    console.log(`Fetching issues for VIN: ${vin}`);
    const vinIssues = data.filter(row => row.VIN === vin);
    const problemList = {};

    vinIssues.forEach(row => {
        for (let i = 1; i <= 40; i++) {
            const problemKey = `Problem ${String(i).padStart(2, '0')}`;
            const problemDescKey = `${problemKey} Desc`;
            const problem = row[problemKey];
            const problemDesc = row[problemDescKey];

            if (problem && problem.trim() !== '') {
                if (!problemList[problem]) {
                    problemList[problem] = problemDesc;
                }
            }
        }
    });

    const vinTableContainer = document.getElementById('vin-table-container');
    vinTableContainer.innerHTML = ""; // Clear previous content

    // Create the clear selection button
    const clearButton = document.createElement('button');
    clearButton.textContent = 'Clear Selection';
    clearButton.id = 'clear-selection-button';
    vinTableContainer.appendChild(clearButton);

    // Create the table element
    const table = document.createElement('table');

    // Create the table header
    const headerRow = document.createElement('tr');
    const problemHeader = document.createElement('th');
    problemHeader.textContent = 'Problem';
    const descHeader = document.createElement('th');
    descHeader.textContent = `Problem Desc - For VIN ${vin}`;
    headerRow.appendChild(problemHeader);
    headerRow.appendChild(descHeader);
    table.appendChild(headerRow);

    // Add the problem rows to the table
    Object.keys(problemList).forEach(problem => {
        const row = document.createElement('tr');

        const problemCell = document.createElement('td');
        problemCell.textContent = problem;
        row.appendChild(problemCell);

        const descriptionCell = document.createElement('td');
        descriptionCell.textContent = problemList[problem];
        row.appendChild(descriptionCell);

        table.appendChild(row);
    });

    // Append the table to the container
    vinTableContainer.appendChild(table);

    console.log("VIN issues table created and appended"); // Log table creation

    // Show the vinTableContainer
    vinTableContainer.style.display = 'block';

    const backgroundContainer = document.getElementById('background-container');

    // Function to adjust the table position based on the background container height
    function adjustvinTablePosition() {
        const backgroundHeight = backgroundContainer.offsetHeight;
        const additionalMargin = backgroundHeight * 0.2; // 5% of the background container height
        vinTableContainer.style.marginTop = `${backgroundHeight + additionalMargin}px`;
    }

    // Add event listeners for load and resize
    window.addEventListener('load', adjustvinTablePosition);
    window.addEventListener('resize', adjustvinTablePosition);

    // Adjust the table position initially
    adjustvinTablePosition();

    // Add event listener to the clear selection button
    clearButton.addEventListener('click', function() {
        vinTableContainer.innerHTML = ""; // Clear the table content
    });


}

// Add event listeners to the photos (in your script.js or where you handle the photo click events)
document.querySelectorAll('.data-photo').forEach(photo => {
    photo.addEventListener('click', function () {
        const vin = this.dataset.vin; // Assuming you have a data-vin attribute
        fetchAndDisplayVinIssues(vin, data); // Call your function to fetch and display issues for the clicked VIN
    });
});

