let paretoChart; // Declare a variable to store the Chart instance

// Function to fetch and display the Pareto chart
async function fetchAndDisplayParetoChart() {
    try {
        const response = await fetch('http://localhost:3000/api/ranked-data');
        const data = await response.json();

        // Create an object to store problem counts
        const problemCounts = {};

        // Loop through each row in the data
        data.forEach((row) => {
            // Loop through each problem column (assuming Problem 01 to Problem 40)
            for (let i = 1; i <= 40; i++) {
                const problemKey = `Problem ${String(i).padStart(2, '0')}`;
                const problem = row[problemKey];

                if (problem && problem.trim() !== '') {
                    if (!problemCounts[problem]) {
                        problemCounts[problem] = { count: 0 };
                    }
                    problemCounts[problem].count++;
                }
            }
        });

        // Convert the problemCounts object to an array and sort it by count in descending order
        const sortedProblemCounts = Object.entries(problemCounts).map(([problem, { count }]) => ({ problem, count }))
            .sort((a, b) => b.count - a.count);

        // Get the top 20 problems and aggregate the rest as "OTHERS"
        const top20Problems = sortedProblemCounts.slice(0, 20);
        const othersCount = sortedProblemCounts.slice(20).reduce((sum, item) => sum + item.count, 0);
        top20Problems.push({ problem: 'OTHERS', count: othersCount });

        // Prepare data for the Pareto chart
        const labels = top20Problems.map(item => item.problem);
        const counts = top20Problems.map(item => item.count);
        const cumulativeCounts = counts.map((sum => value => sum += value)(0));
        const cumulativePercentages = cumulativeCounts.map(count => ((count / cumulativeCounts[cumulativeCounts.length - 1]) * 100).toFixed(2));

        // Customize colors for the bars, making "OTHERS" yellow
        const barColors = labels.map(label => label === 'OTHERS' ? 'rgba(255, 206, 86, 0.2)' : 'rgba(54, 162, 235, 0.2)');
        const borderColors = labels.map(label => label === 'OTHERS' ? 'rgba(255, 206, 86, 1)' : 'rgba(54, 162, 235, 1)');

        // Get the chart context
        const ctx = document.getElementById('paretoChart').getContext('2d');

        // Destroy the existing Chart instance if it exists
        if (paretoChart) {
            paretoChart.destroy();
        }

        // Create the new Chart instance
        paretoChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Defect Count',
                    data: counts,
                    backgroundColor: barColors,
                    borderColor: borderColors,
                    borderWidth: 1,
                    yAxisID: 'y-axis-1'
                }, {
                    label: 'Cumulative Percentage',
                    data: cumulativePercentages,
                    type: 'line',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1,
                    yAxisID: 'y-axis-2'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false, // Allow the chart to adjust its size
                scales: {
                    'y-axis-1': {
                        type: 'linear',
                        position: 'left',
                        ticks: {
                            beginAtZero: true,
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        },
                        title: {
                            display: true,
                            text: 'Problem Count',
                            font: {
                                size: 16,
                                weight: 'bold'
                            }
                        },
                        grid: {
                            drawOnChartArea: false
                        }
                    },
                    'y-axis-2': {
                        type: 'linear',
                        position: 'right',
                        ticks: {
                            beginAtZero: true,
                            max: 100,
                            callback: function(value) {
                                return Math.round(value) + '%';
                            },
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        },
                        title: {
                            display: true,
                            text: 'Cumulative Percentage',
                            font: {
                                size: 16,
                                weight: 'bold'
                            }
                        },
                        grid: {
                            drawOnChartArea: false
                        }
                    },
                    x: {
                        ticks: {
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        },
                        grid: {
                            display: false
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        }
                    },
                    title: {
                        display: true,
                        text: 'Top 20 Current End of Line DACM Defects',
                        font: {
                            size: 18,
                            weight: 'bold'
                        }
                    },
                    datalabels: {
                        display: true,
                        align: 'top',
                        font: {
                            size: 14,
                            weight: 'bold'
                        },
                        formatter: (value, context) => {
                            if (context.dataset.label === 'Cumulative Percentage') {
                                return Math.round(value) + '%';
                            }
                            return '';
                        }
                    }
                }
            },
            plugins: [ChartDataLabels]
        });

        // Update the last refresh time
        const lastRefreshElement = document.getElementById('last-refresh');
        const now = new Date();
        const formattedTime = `${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        lastRefreshElement.innerHTML = `Last Refresh:<br>${formattedTime}`;

    } catch (error) {
        console.error("Error fetching or processing data:", error);
    }
}

// Function to save the chart as an image with higher resolution
function saveChartAsImage() {
    const canvas = document.getElementById('paretoChart');
    const link = document.createElement('a');

    // Create a new canvas to draw the high-resolution image
    const highResCanvas = document.createElement('canvas');
    const scaleFactor = 2; // Increase this for higher resolution
    highResCanvas.width = canvas.width * scaleFactor;
    highResCanvas.height = canvas.height * scaleFactor;
    const highResCtx = highResCanvas.getContext('2d');
    
    // Set the background color for better contrast
    highResCtx.fillStyle = '#ffffff'; // White background
    highResCtx.fillRect(0, 0, highResCanvas.width, highResCanvas.height);

    // Draw the original canvas onto the high-resolution canvas
    highResCtx.drawImage(canvas, 0, 0, highResCanvas.width, highResCanvas.height);

    link.href = highResCanvas.toDataURL('image/png');
    link.download = 'pareto_chart.png';
    link.click();
}

document.getElementById('pareto-option').addEventListener('click', () => {
    fetchAndDisplayParetoChart();
    setInterval(fetchAndDisplayParetoChart, 30000); // Fetch data every 30 seconds
});

document.getElementById('saveChartBtn').addEventListener('click', saveChartAsImage);

// Ensure the chart resizes when the window is resized
window.addEventListener('resize', () => {
    if (paretoChart) {
        paretoChart.resize();
    }
});
