// Function to export the table to Excel
function exportTableToExcel(tableID, filename = '') {
    const tableSelect = document.getElementById(tableID);
    const tableHTML = tableSelect.outerHTML.replace(/ /g, '%20');

    const dataType = 'application/vnd.ms-excel';
    filename = filename ? filename + '.xls' : 'excel_data.xls';

    const downloadLink = document.createElement('a');
    document.body.appendChild(downloadLink);

    if (navigator.msSaveOrOpenBlob) {
        const blob = new Blob(['\ufeff', tableHTML], { type: dataType });
        navigator.msSaveOrOpenBlob(blob, filename);
    } else {
        downloadLink.href = 'data:' + dataType + ', ' + tableHTML;
        downloadLink.download = filename;
        downloadLink.click();
    }
}

// Function to fetch and display the problem table
async function fetchProblemData() {
    const response = await fetch('http://localhost:3000/api/ranked-data');
    const data = await response.json();

    // console.log("Data fetched:", data); // Log fetched data

    // Log the keys of the first few rows to understand the structure
    // for (let i = 0; i < Math.min(3, data.length); i++) {
    //     console.log(`Keys of row ${i + 1}:`, Object.keys(data[i]));
    // }

    // Create an object to store problem counts
    const problemCounts = {};

    // Loop through each row in the data
    data.forEach((row, rowIndex) => {
        // Loop through each problem column (assuming Problem 01 to Problem 40)
        for (let i = 1; i <= 40; i++) {
            const problemKey = `Problem ${String(i).padStart(2, '0')}`;
            const problemDescKey = `${problemKey} Desc`;
            const problem = row[problemKey];
            const problemDesc = row[problemDescKey];

            // console.log(`Row ${rowIndex + 1}, ${problemKey}: ${problem}, ${problemDescKey}: ${problemDesc}`); // Log each problem key and description

            if (problem && problem.trim() !== '') {
                if (!problemCounts[problem]) {
                    problemCounts[problem] = { description: problemDesc, count: 0 };
                }
                problemCounts[problem].count++;
            }
        }
    });

    // console.log("Problem counts:", problemCounts); // Log problem counts

    // Convert the problemCounts object to an array and sort it by count in descending order
    const sortedProblemCounts = Object.entries(problemCounts).map(([problem, { description, count }]) => ({ problem, description, count }))
        .sort((a, b) => b.count - a.count);

    // console.log("Sorted problem counts:", sortedProblemCounts); // Log sorted problem counts

    // Get the container element for the table
    const tableContainer = document.getElementById('problem-table-container');
    tableContainer.innerHTML = ""; // Clear previous content

    // Create the container for the buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.id = 'button-container';

    // Create the clear selection button
    const clearButton = document.createElement('button');
    clearButton.textContent = 'Clear Selection';
    clearButton.id = 'clear-selection-button';
    buttonContainer.appendChild(clearButton);

    // Create the export button
    const exportButton = document.createElement('button');
    exportButton.textContent = 'Export to Excel';
    exportButton.id = 'export-button';
    buttonContainer.appendChild(exportButton);

    // Append the button container to the table container
    tableContainer.appendChild(buttonContainer);

    // Create the table element
    const table = document.createElement('table');
    table.id = 'problemTable'; // Add an ID for the table to reference in the export function

    // Create the table header
    const headerRow = document.createElement('tr');
    const headers = ['Select', 'Problem', 'Problem Desc', 'Count'];
    headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // Add the problem rows to the table
    sortedProblemCounts.forEach(({ problem, description, count }) => {
        const row = document.createElement('tr');
        
        // Checkbox cell
        const checkboxCell = document.createElement('td');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.classList.add('problem-checkbox');
        checkbox.dataset.problem = problem;
        checkboxCell.appendChild(checkbox);
        row.appendChild(checkboxCell);
        
        // Problem cell
        const problemCell = document.createElement('td');
        problemCell.textContent = problem;
        row.appendChild(problemCell);

        const descriptionCell = document.createElement('td');
        descriptionCell.textContent = description;
        row.appendChild(descriptionCell);

        const countCell = document.createElement('td');
        countCell.textContent = count;
        row.appendChild(countCell);

        table.appendChild(row);
    });

    // Append the table to the container
    tableContainer.appendChild(table);

    // console.log("Table created and appended"); // Log table creation

    // Add click event listener to checkboxes
    document.querySelectorAll('.problem-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', (event) => {
            const selectedProblems = Array.from(document.querySelectorAll('.problem-checkbox:checked')).map(cb => cb.dataset.problem);
            changeImages(selectedProblems, data);
        });
    });

    // Add event listener to the clear selection button
    clearButton.addEventListener('click', function() {
        // Uncheck all checkboxes
        document.querySelectorAll('.problem-checkbox').forEach(cb => {
            cb.checked = false;
        });
        // Reset images
        changeImages([], data);
    });

    // Add event listener to the export button
    exportButton.addEventListener('click', function() {
        exportTableToExcel('problemTable', 'Problem_Data');
    });

    const backgroundContainer = document.getElementById('background-container');
    // Function to adjust the table position based on the background container height
    function adjustTablePosition() {
        const backgroundHeight = backgroundContainer.offsetHeight;
        const additionalMargin = backgroundHeight * 0.2; // 5% of the background container height
        tableContainer.style.marginTop = `${backgroundHeight + additionalMargin}px`;
    }

    // Add event listeners for load and resize
    window.addEventListener('load', adjustTablePosition);
    window.addEventListener('resize', adjustTablePosition);

    // Adjust the table position initially
    adjustTablePosition();
}

let previousProblems = [];
let previousImages = [];

// Function to change images based on the selected problems
function changeImages(problems, data) {
    // Revert previous images if any
    if (previousProblems.length > 0) {
        previousImages.forEach(img => {
            img.src = img.dataset.originalSrc;
        });
        previousImages = [];
    }

    previousProblems = problems;

    // Only change images if there are selected problems
    if (problems.length > 0) {
        // Loop through all rows in the data
        data.forEach(row => {
            // Loop through each problem column
            for (let i = 1; i <= 40; i++) {
                const problemKey = `Problem ${String(i).padStart(2, '0')}`;
                if (problems.includes(row[problemKey])) {
                    // Change the image for the matching problem
                    const groupNumber = row.GroupNumber;
                    const groupElement = document.querySelector(`.group-${groupNumber}`);
                    if (groupElement) {
                        groupElement.querySelectorAll('.data-photo').forEach(img => {
                            // Ensure the image belongs to the current row by checking src
                            if (img.src.includes(row.Photo) && img.dataset.rank == row.Rank) {
                                previousImages.push(img);
                                img.dataset.originalSrc = img.src;
                                img.src = 'images/blue.png';
                            }
                        });
                    }
                }
            }
        });
    }
  
}

// Call the function to fetch and display the problem data
fetchProblemData();

document.getElementById('floor-layout-option').addEventListener('click', () => {
    fetchProblemData();
    setInterval(fetchProblemData, 30000); // Fetch data every 30 seconds
});