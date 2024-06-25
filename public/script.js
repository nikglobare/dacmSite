async function fetchData() {
    const response = await fetch('http://localhost:3000/api/ranked-data');
    const data = await response.json();
    const backgroundContainer = document.getElementById('background-container');
    
    // Clear only the group containers
    const existingGroups = backgroundContainer.querySelectorAll('.group-container');
    existingGroups.forEach(group => group.remove());
    
    const groups = {};

    // Calculate DRR
    const totalVehicles = 220;
    const vehiclesWithDefects = data.filter(row => row['Problem Count'] > 0).length;
    const drr = ((totalVehicles - vehiclesWithDefects) / totalVehicles) * 100;

    // Create DRR element
    const drrElement = document.createElement('div');
    drrElement.innerHTML = ` Current DRR <br>${drr.toFixed(1)}%`;
    drrElement.id = 'drr-display';
    backgroundContainer.appendChild(drrElement);


    data.forEach(row => {
        if (!groups[row.GroupNumber]) {
            groups[row.GroupNumber] = [];
        }
        groups[row.GroupNumber].push(row);
    });

    for (const groupNumber in groups) {
        const groupContainer = document.createElement('div');
        groupContainer.classList.add('group-container', `group-${groupNumber}`);
        groupContainer.style.position = 'absolute';

        const groupTitle = document.createElement('h2');
        groupContainer.appendChild(groupTitle);

        // Reverse the rows within each group
        const reversedRows = groups[groupNumber].slice().reverse();

        reversedRows.forEach(row => {
            const rowElement = document.createElement('div');
            rowElement.classList.add('row');
            rowElement.style.position = 'relative';

            const textImageContainer = document.createElement('div');
            textImageContainer.classList.add('text-image-container');
            textImageContainer.style.position = 'relative';

            const textElement = document.createElement('div');
            textElement.classList.add('text-element');

            // Format DateTime
            const dateTime = new Date(row.DateTime);
            const options = {
                month: 'numeric',
                day: 'numeric',
                year: '2-digit',
                hour: 'numeric',
                minute: 'numeric',
                hour12: true
            };
            const formattedDateTime = dateTime.toLocaleString('en-US', options).replace(/, /g, ' ');

            textElement.innerHTML = `VIN: ${row.VIN}<br>Model: ${row.Model}<br>Date: ${formattedDateTime}<br>Defect Count: ${row['Problem Count']}`;
            textElement.style.position = 'absolute';
            textElement.style.zIndex = '1'; /* Ensure the text element is in front of other elements */
            textElement.style.marginTop = '35px';

            const imageElement = document.createElement('img');
            imageElement.src = `images/${row.Photo}`;
            imageElement.alt = `Photo for Rank ${row.Rank}`;
            imageElement.classList.add('data-photo');
            imageElement.dataset.rank = row.Rank;  // Add this line to set the data-rank attribute
            imageElement.dataset.vin = row.VIN; // Add data-vin attribute
            imageElement.style.position = 'relative';

            // Add click event listener to the image element
            imageElement.addEventListener('click', () => {
                fetchAndDisplayVinIssues(row.VIN, data);
            });

            textImageContainer.appendChild(imageElement);
            textImageContainer.appendChild(textElement);
            rowElement.appendChild(textImageContainer);
            groupContainer.appendChild(rowElement);
        });

        backgroundContainer.appendChild(groupContainer);
    }

    const adjustBackgroundContainerHeight = () => {
        const backgroundPhoto = document.querySelector('.background-photo');
        if (backgroundPhoto) {
            backgroundContainer.style.height = `${backgroundPhoto.clientHeight}px`;
        }
    };

    const adjustBackgroundContainerWidth = () => {
        const backgroundPhoto = document.querySelector('.background-photo');
        if (backgroundPhoto) {
            backgroundContainer.style.width = `${backgroundPhoto.clientWidth}px`;
        }
    };

    const adjustGroupPositions = () => {
        const backgroundPhoto = document.querySelector('.background-photo');
        if (!backgroundPhoto) return;

        const positions = [
            { group: 'group-1', top: 0.84, left: 0.25 },
            { group: 'group-2', top: 0.722, left: 0.28 },
            { group: 'group-3', top: 0.67, left: 0.575 },
            { group: 'group-4', top: 0.641 },
            { group: 'group-5', top: 0.581 },
            { group: 'group-6', top: 0.528 },
            { group: 'group-7', top: 0.465 },
            { group: 'group-8', top: 0.41 },
            { group: 'group-9', top: 0.342 },
            { group: 'group-10', top: 0.27 },
            { group: 'group-11', top: 0.205 },
        ];

        positions.forEach(pos => {
            const group = document.querySelector(`.${pos.group}`);
            if (group) {
                group.style.top = `${backgroundPhoto.clientHeight * pos.top}px`;
                if (pos.left !== undefined) {
                    group.style.left = `${backgroundPhoto.clientWidth * pos.left}px`;
                }
            }
        });
    };

    window.addEventListener('resize', () => {
        adjustBackgroundContainerHeight();
        adjustBackgroundContainerWidth();
        adjustGroupPositions();
    });

    adjustBackgroundContainerHeight();
    adjustBackgroundContainerWidth();
    adjustGroupPositions();

    // Update the last refresh time
    const lastRefreshElement = document.getElementById('last-refresh');
    const now = new Date();
    const formattedTime = `${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    lastRefreshElement.innerHTML = `Last Refresh:<br>${formattedTime}`;

}

fetchData();

document.getElementById('floor-layout-option').addEventListener('click', () => {
    fetchData();
    setInterval(fetchData, 30000); // Fetch data every 30 seconds
});