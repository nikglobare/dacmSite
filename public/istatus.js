async function fetchAndDisplayIStatusData() {
    try {
        const response = await fetch('http://localhost:3000/api/db2-data');
        const data = await response.json();

        // Filter data where C_STATUS starts with "I"
        const filteredData = data.filter(row => row.C_STATUS.startsWith('I'));

        const container = document.getElementById('istatus-table-container');
        container.innerHTML = ''; // Clear previous content

        const pivotData = pivotIStatusData(filteredData); // Use distinct function for istatus data
        const columnTotals = calculateColumnTotals(pivotData);

        // Drop columns 11 and 12
        delete columnTotals['11'];
        delete columnTotals['12'];
        pivotData.forEach(row => {
            delete row.data['11'];
            delete row.data['12'];
        });

        // Identify columns where all values are zero
        const zeroColumns = Object.keys(columnTotals).filter(header => columnTotals[header] === 0);

        // Sort the pivotData based on the latest non-blank column
        const sortedPivotData = sortPivotData(pivotData, columnTotals);

        const table = document.createElement('table');

        // Create the first header row for "C_STATUS" and "Production Shift"
        const firstHeaderRow = document.createElement('tr');
        const thStatus = document.createElement('th');
        thStatus.textContent = 'Status';
        thStatus.rowSpan = 2;
        thStatus.style.textAlign = 'center'; // Center the text
        firstHeaderRow.appendChild(thStatus);

        const thProductionShift = document.createElement('th');
        thProductionShift.textContent = 'Production Shift';
        thProductionShift.colSpan = Object.keys(pivotData[0].data).length;
        thProductionShift.style.textAlign = 'center'; // Center the text
        firstHeaderRow.appendChild(thProductionShift);

        table.appendChild(firstHeaderRow);

        // Create the second header row for individual hours
        const secondHeaderRow = document.createElement('tr');
        const headers = Object.keys(pivotData[0].data);
        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            th.style.borderRight = 'none'; // Remove right border for header cells
            th.style.textAlign = 'center'; // Center the text
            secondHeaderRow.appendChild(th);
        });
        table.appendChild(secondHeaderRow);

        // Add the data rows
        sortedPivotData.forEach(row => {
            const tr = document.createElement('tr');
            const tdStatus = document.createElement('td');
            tdStatus.textContent = row.C_STATUS;
            tdStatus.style.borderRight = 'none'; // Remove right border for status cells
            tdStatus.style.textAlign = 'center'; // Center the text
            tr.appendChild(tdStatus);

            Object.entries(row.data).forEach(([key, value]) => {
                const td = document.createElement('td');
                td.textContent = zeroColumns.includes(key) ? '' : value; // Blank out zeros for columns where all values are zero
                td.style.borderRight = 'none'; // Remove right border for data cells
                td.style.textAlign = 'center'; // Center the text
                tr.appendChild(td);
            });

            table.appendChild(tr);
        });

        // Add total row with thick borders
        const totalRow = document.createElement('tr');
        const totalLabelCell = document.createElement('td');
        totalLabelCell.textContent = 'Total';
        totalLabelCell.style.fontWeight = 'bold'; // Make the total label bold
        totalLabelCell.style.borderRight = 'none'; // Remove right border for total label cell
        totalLabelCell.style.textAlign = 'center'; // Center the text
        totalRow.appendChild(totalLabelCell);

        headers.forEach(header => {
            const td = document.createElement('td');
            td.textContent = columnTotals[header] === 0 ? '' : columnTotals[header]; // Blank out zeros for columns with total zero
            td.style.border = '2px solid black'; // Add thick border to each total cell
            td.style.borderRight = 'none'; // Remove right border for total cells
            td.style.textAlign = 'center'; // Center the text
            totalRow.appendChild(td);
        });

        totalRow.style.borderTop = '2px solid black'; // Add thick top border
        totalRow.style.borderBottom = '2px solid black'; // Add thick bottom border
        table.appendChild(totalRow);

        container.appendChild(table);

        // Highlight the most recent column
        const latestColumn = Object.keys(columnTotals).reverse().find(col => columnTotals[col] !== 0);
        table.querySelectorAll(`td:nth-child(${headers.indexOf(latestColumn) + 2})`).forEach(td => {
            td.style.backgroundColor = 'lightgrey'; // Highlight the latest column
            td.style.fontWeight = 'bold'; // Highlight the latest column
        });

        // Add the export to Excel button
        const exportBtn = document.createElement('button');
        exportBtn.id = 'exportToExcelBtn';
        exportBtn.textContent = 'Export to Excel';
        exportBtn.style.position = 'absolute';
        exportBtn.style.top = '10px';
        exportBtn.style.left = '10px';
        container.appendChild(exportBtn);

        exportBtn.addEventListener('click', () => {
            exportTableToExcel('istatus-table-container', 'IStatusData');
        });

        // Adjust table and font size dynamically to fit within 80vh
        // adjustFontSize(container, table);
        // window.addEventListener('resize', () => adjustFontSize(container, table));

        // Update the last refresh time
        const lastRefreshElement = document.getElementById('last-refresh');
        const now = new Date();
        const formattedTime = `${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        lastRefreshElement.innerHTML = `Last Refresh:<br>${formattedTime}`;

    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function pivotIStatusData(data) {
    const pivot = {};

    data.forEach(row => {
        if (!pivot[row.C_STATUS]) {
            pivot[row.C_STATUS] = {};
        }
        pivot[row.C_STATUS][row.I_PROD_HR_REPTD] = row.I_OCC_CNT;
    });

    const pivotArray = Object.keys(pivot).map(key => ({
        C_STATUS: key,
        data: pivot[key]
    }));

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

function sortPivotData(pivotData, columnTotals) {
    const latestColumn = Object.keys(columnTotals).reverse().find(col => columnTotals[col] !== 0);

    return pivotData.sort((a, b) => {
        const aValue = a.data[latestColumn] || 0;
        const bValue = b.data[latestColumn] || 0;
        return bValue - aValue;
    });
}

function exportTableToExcel(tableId, filename = '') {
    const table = document.getElementById(tableId);
    const wb = XLSX.utils.table_to_book(table, { sheet: "Sheet JS" });
    return XLSX.writeFile(wb, filename ? `${filename}.xlsx` : 'excel_data.xlsx');
}

// Call this function when the I-Status option is clicked
document.getElementById('status-option').addEventListener('click', () => {
    fetchAndDisplayIStatusData();
    setInterval(fetchAndDisplayIStatusData, 30000); // Fetch data every 30 seconds
});
