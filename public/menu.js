document.addEventListener('DOMContentLoaded', function() {
    const floorLayoutOption = document.getElementById('floor-layout-option');
    const paretoOption = document.getElementById('pareto-option');
    const productionOption = document.getElementById('production-option');
    const statusOption = document.getElementById('status-option');
    const backgroundContainer = document.getElementById('background-container');
    const paretoChartContainer = document.getElementById('pareto-chart-container');
    const problemTableContainer = document.getElementById('problem-table-container');
    const vinTableContainer = document.getElementById('vin-table-container');
    const iStatusTableContainer = document.getElementById('istatus-table-container');
    const prodTableContainer = document.getElementById('production-table-container');
    const prodTableLegend = document.getElementById('legend-container');

    function hideAllContainers() {
        backgroundContainer.style.display = 'none';
        paretoChartContainer.style.display = 'none';
        problemTableContainer.style.display = 'none';
        vinTableContainer.style.display = 'none';
        iStatusTableContainer.style.display = 'none';
        prodTableContainer.style.display = 'none';
        prodTableLegend.style.display = 'none';
        // Hide other containers if added in the future
    }

    floorLayoutOption.addEventListener('click', () => {
        hideAllContainers();
        backgroundContainer.style.display = 'block';
        problemTableContainer.style.display = 'block';
        vinTableContainer.style.display = 'block';
    });

    paretoOption.addEventListener('click', () => {
        hideAllContainers();
        paretoChartContainer.style.display = 'flex';
    });

    statusOption.addEventListener('click', () => {
        hideAllContainers();
        iStatusTableContainer.style.display = 'block';
    });

    productionOption.addEventListener('click', () => {
        hideAllContainers();
        prodTableContainer.style.display = 'block';
        prodTableLegend.style.display = 'block';
    });

    // Set Floor Layout as the default view when the page loads
    floorLayoutOption.click();
});
