async function fetchAndDisplayProductionData() {
    try {
        const response = await fetch('http://localhost:3000/api/db2-data');
        const data = await response.json();

        console.log("Fetched data:", data);

        const container = document.getElementById('production-table-container');
        container.innerHTML = ''; // Clear previous content

        const pivotData = pivotProductionData(data); // Use distinct function for production data
        const columnTotals = calculateColumnTotals(pivotData);

        // Drop columns 11 and 12
        delete columnTotals['11'];
        delete columnTotals['12'];
        pivotData.forEach(row => {
            delete row.data['11'];
            delete row.data['12'];
        });

        // Blank out the values where the totals are all 0 and drop columns 11 and 12
        pivotData.forEach(row => {
            Object.keys(row.data).forEach(key => {
                if (columnTotals[key] === 0 || key === '11' || key === '12') {
                    row.data[key] = '';
                }
            });
        });

        // Calculate row totals
        const rowTotals = pivotData.map(row => {
            return Object.values(row.data).reduce((sum, value) => sum + (value || 0), 0);
        });

        // Sort pivotData to be in the order: Framer, Color, Final
        const sortedPivotData = pivotData.sort((a, b) => {
            const order = ['E', 'FK + FL', 'I'];
            return order.indexOf(a.C_STATUS) - order.indexOf(b.C_STATUS);
        });

        const table = document.createElement('table');
        table.id = 'productionTable'; // Assign an ID to the table for export purposes

        // Create the first header row for "Gross JPH", "Net JPH", "Area", "Status", "Production Shift", and "Total"
        const firstHeaderRow = document.createElement('tr');
        const thGrossJPH = document.createElement('th');
        thGrossJPH.textContent = 'Gross JPH';
        thGrossJPH.rowSpan = 2;
        thGrossJPH.style.textAlign = 'center'; // Center the text
        thGrossJPH.style.color = 'blue'; // Make the text blue
        thGrossJPH.style.fontWeight = 'bold'; 
        firstHeaderRow.appendChild(thGrossJPH);

        const thNetJPH = document.createElement('th');
        thNetJPH.textContent = 'Net JPH';
        thNetJPH.rowSpan = 2;
        thNetJPH.style.textAlign = 'center'; // Center the text
        thNetJPH.style.fontWeight= 'bolder' 
        firstHeaderRow.appendChild(thNetJPH);

        const thArea = document.createElement('th');
        thArea.textContent = 'Area';
        thArea.rowSpan = 2;
        thArea.style.textAlign = 'center'; // Center the text
        thArea.style.fontWeight = 'bold'; 
        firstHeaderRow.appendChild(thArea);

        const thStatus = document.createElement('th');
        thStatus.textContent = 'Status';
        thStatus.rowSpan = 2;
        thStatus.style.textAlign = 'center'; // Center the text
        thStatus.style.fontWeight = 'bold'; 
        firstHeaderRow.appendChild(thStatus);

        const thProductionShift = document.createElement('th');
        thProductionShift.textContent = 'Production Shift';
        thProductionShift.colSpan = Object.keys(columnTotals).length;
        thProductionShift.style.textAlign = 'center'; // Center the text
        firstHeaderRow.appendChild(thProductionShift);

        const thTotal = document.createElement('th');
        thTotal.textContent = 'Total';
        thTotal.rowSpan = 2;
        thTotal.style.textAlign = 'center'; // Center the text
        thTotal.style.fontWeight = 'bold'; 
        firstHeaderRow.appendChild(thTotal);

        table.appendChild(firstHeaderRow);

        // Create the second header row for individual hours
        const secondHeaderRow = document.createElement('tr');
        const headers = Object.keys(columnTotals);
        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            th.style.borderRight = 'none'; // Remove right border for header cells
            th.style.textAlign = 'center'; // Center the text
            secondHeaderRow.appendChild(th);
        });
        table.appendChild(secondHeaderRow);

        // Add the data rows with Gross JPH, Net JPH values, and row totals
        sortedPivotData.forEach((row, rowIndex) => {
            const tr = document.createElement('tr');

            const tdGrossJPH = document.createElement('td');
            tdGrossJPH.textContent = getGrossJPH(row.C_STATUS); // Set Gross JPH value based on Status
            tdGrossJPH.style.textAlign = 'center'; // Center the text
            tdGrossJPH.style.color = 'blue'; // Make the text blue
            tr.appendChild(tdGrossJPH);

            const tdNetJPH = document.createElement('td');
            tdNetJPH.textContent = getNetJPH(row.C_STATUS); // Set Net JPH value based on Status
            tdNetJPH.style.textAlign = 'center'; // Center the text
            tr.appendChild(tdNetJPH);

            const tdArea = document.createElement('td');
            tdArea.textContent = getAreaByStatus(row.C_STATUS); // Set Area based on Status
            tdArea.style.textAlign = 'center'; // Center the text
            tr.appendChild(tdArea);

            const tdStatus = document.createElement('td');
            tdStatus.textContent = row.C_STATUS;
            tdStatus.style.borderRight = 'none'; // Remove right border for status cells
            tdStatus.style.textAlign = 'center'; // Center the text
            tr.appendChild(tdStatus);

            Object.entries(row.data).forEach(([key, value]) => {
                const td = document.createElement('td');
                const shiftConstant = getShiftConstant(key);
                const netJPH = getNetJPH(row.C_STATUS);
                const grossJPH = getGrossJPH(row.C_STATUS);
                const threshold1 = netJPH * shiftConstant;
                const threshold2 = 0.95 * grossJPH * shiftConstant;

                td.textContent = value || ''; // Set value for data cells, blank out zeros
                td.style.borderRight = 'none'; // Remove right border for data cells
                td.style.textAlign = 'center'; // Center the text

                if (['3', '5', '7'].includes(key)) {
                    td.style.backgroundColor = 'lightgrey'; // Highlight specific production shifts
                }

                if (value < threshold1) {
                    td.style.color = 'red';
                } else if (value >= threshold1 && value < threshold2) {
                    td.style.color = 'green';
                } else if (value >= threshold2) {
                    td.style.color = 'blue';
                }

                tr.appendChild(td);
            });

            // Add the total column
            const tdTotal = document.createElement('td');
            tdTotal.textContent = rowTotals[rowIndex];
            tdTotal.style.textAlign = 'center'; // Center the text
            tr.appendChild(tdTotal);

            table.appendChild(tr);
        });

        container.appendChild(table);

        // Highlight the most recent column
        const latestColumn = Object.keys(columnTotals).reverse().find(col => columnTotals[col] !== 0);
        table.querySelectorAll(`td:nth-child(${headers.indexOf(latestColumn) + 5})`).forEach(td => { // Adjusted index due to added columns
            td.style.fontWeight = 'bold'; // Highlight the latest column
            td.style.color = 'black'; // Highlight the latest column
        });

        // Update the last refresh time
        const lastRefreshElement = document.getElementById('last-refresh');
        const now = new Date();
        const formattedTime = `${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        lastRefreshElement.innerHTML = `Last Refresh:<br>${formattedTime}`;

        // Add the export to Excel button
        const exportBtn = document.createElement('button');
        exportBtn.id = 'exportToExcelBtn';
        exportBtn.textContent = 'Export to Excel';
        exportBtn.classList.add('export-button'); // Add the CSS class to the button
        container.appendChild(exportBtn);

        exportBtn.addEventListener('click', () => {
            exportTableToExcel('productionTable', 'ProductionData');
        });

        // Adjust table and font size dynamically to fit within 80vh
        //adjustFontSize(container, table);
        //window.addEventListener('resize', () => adjustFontSize(container, table));
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function pivotProductionData(data) {
    const validStatuses = ['I', 'FK', 'FL', 'E'];
    const pivot = {};
    const combinedColorData = {};

    console.log("Raw data:", data);

    data.forEach(row => {
        const trimmedStatus = row.C_STATUS.trim();
        if (validStatuses.includes(trimmedStatus)) {
            if (trimmedStatus === 'FK' || trimmedStatus === 'FL') {
                if (!combinedColorData['FK + FL']) {
                    combinedColorData['FK + FL'] = {};
                }
                const hourKey = row.I_PROD_HR_REPTD;
                combinedColorData['FK + FL'][hourKey] = (combinedColorData['FK + FL'][hourKey] || 0) + row.I_OCC_CNT;
            } else {
                if (!pivot[trimmedStatus]) {
                    pivot[trimmedStatus] = {};
                }
                const hourKey = row.I_PROD_HR_REPTD;
                pivot[trimmedStatus][hourKey] = row.I_OCC_CNT;
            }
        }
    });

    console.log("Combined Color Data:", combinedColorData);
    console.log("Pivot Data before combining:", pivot);

    // Add combined FK + FL data to pivot
    if (Object.keys(combinedColorData).length > 0) {
        pivot['FK + FL'] = combinedColorData['FK + FL'];
    }

    console.log("Pivot Data after combining:", pivot);

    const pivotArray = Object.keys(pivot).map(key => ({
        C_STATUS: key,
        data: pivot[key]
    }));

    console.log("Pivot Array:", pivotArray);

    return pivotArray;
}

function calculateColumnTotals(pivotData) {
    const totals = {};

    pivotData.forEach(row => {
        Object.entries(row.data).forEach(([key, value]) => {
            if (!totals[key]) {
                totals[key] = 0;
            }
            totals[key] += value;
        });
    });

    return totals;
}

function getAreaByStatus(status) {
    switch (status.trim()) {
        case 'I':
            return 'Final';
        case 'FK':
        case 'FL':
        case 'FK + FL':
            return 'Color';
        case 'E':
            return 'Framer';
        default:
            return '';
    }
}

let jphData = [];
let defaultJPHNetGA = 48;

async function fetchJPHData() {
    try {
        const response = await fetch('http://localhost:3000/api/jph-data');
        const text = await response.text(); // Read response as text for debugging
        console.log('Raw response:', text); // Log raw response
        const data = JSON.parse(text); // Parse the text to JSON
        jphData = data;
        const gaCenter = jphData.find(center => center.Center === 'GA');
        if (gaCenter && gaCenter.JPHNet !== null) {
            defaultJPHNetGA = gaCenter.JPHNet;
        }
    } catch (error) {
        console.error('Error fetching JPH data:', error.message); // Log error message
    }
}

function getGrossJPH(status) {
    const trimmedStatus = status.trim();
    let center;

    switch (trimmedStatus) {
        case 'I':
            center = jphData.find(center => center.Center === 'GA');
            break;
        case 'FK + FL':
            center = jphData.find(center => center.Center === 'PAINT');
            break;
        case 'E':
            center = jphData.find(center => center.Center === 'BIW');
            break;
        default:
            return '';
    }

    return center ? center.Design_Gross : '';
}

function getNetJPH(status) {
    const trimmedStatus = status.trim();
    let center;

    switch (trimmedStatus) {
        case 'I':
            center = jphData.find(center => center.Center === 'GA');
            break;
        case 'FK + FL':
            center = jphData.find(center => center.Center === 'PAINT');
            break;
        case 'E':
            center = jphData.find(center => center.Center === 'BIW');
            break;
        default:
            return '';
    }

    return center && center.JPHNet !== null ? center.JPHNet : defaultJPHNetGA;
}

function getShiftConstant(shift) {
    switch (shift) {
        case '3':
            return 5 / 6;
        case '5':
            return 2 / 3;
        case '7':
            return 5 / 6;
        default:
            return 1;
    }
}

function adjustFontSize(container, table) {
    if (!container || !table) return;
    const containerHeight = container.clientHeight;
    console.log(`Container height: ${containerHeight}px`); // Debugging log

    // Ensure the container height is set
    if (containerHeight > 0) {
        table.style.fontSize = `${containerHeight / 15}px`; // Adjust font size based on container height
    } else {
        console.warn('Container height is 0, cannot adjust font size.');
    }
}

// Fetch JPH data when the script loads
fetchJPHData();

// Call this function when the Production option is clicked
document.getElementById('production-option').addEventListener('click', () => {
    fetchAndDisplayProductionData();
    setInterval(fetchAndDisplayProductionData, 30000); // Fetch data every 30 seconds
});

function exportTableToExcel(tableId, filename = '') {
    const table = document.getElementById(tableId);
    const wb = XLSX.utils.table_to_book(table, { sheet: "Sheet JS" });
    return XLSX.writeFile(wb, filename ? `${filename}.xlsx` : 'excel_data.xlsx');
}
