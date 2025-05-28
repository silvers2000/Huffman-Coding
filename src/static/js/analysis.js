// Analysis tab functionality
function initAnalysis() {
    // This function will be called when the page loads
    // The actual data will be populated after compression
}

// Update frequency table with data
function updateFrequencyTable(frequencyData, huffmanCodes) {
    const tableBody = document.querySelector('#frequency-table tbody');
    tableBody.innerHTML = '';
    
    // Calculate total frequency for percentage calculation
    const totalFrequency = Object.values(frequencyData).reduce((sum, freq) => sum + freq, 0);
    
    // Sort characters by frequency (descending)
    const sortedEntries = Object.entries(frequencyData).sort((a, b) => b[1] - a[1]);
    
    sortedEntries.forEach(([char, freq]) => {
        const row = document.createElement('tr');
        
        // Character cell (with special handling for whitespace characters)
        const charCell = document.createElement('td');
        if (char === ' ') {
            charCell.textContent = '(space)';
        } else if (char === '\n') {
            charCell.textContent = '(newline)';
        } else if (char === '\t') {
            charCell.textContent = '(tab)';
        } else {
            charCell.textContent = char;
        }
        
        // Frequency cell
        const freqCell = document.createElement('td');
        freqCell.textContent = freq;
        
        // Percentage cell
        const percentCell = document.createElement('td');
        const percentage = ((freq / totalFrequency) * 100).toFixed(2);
        percentCell.textContent = `${percentage}%`;
        
        // Huffman code cell
        const codeCell = document.createElement('td');
        const code = huffmanCodes[char] || 'N/A';
        codeCell.textContent = code;
        
        // Add visual indicator of code length
        if (code !== 'N/A') {
            const codeLength = code.length;
            const indicator = document.createElement('span');
            indicator.className = 'code-indicator';
            indicator.style.width = `${codeLength * 10}px`;
            indicator.style.height = '10px';
            indicator.style.backgroundColor = `hsl(${240 - codeLength * 10}, 70%, 60%)`;
            indicator.style.display = 'inline-block';
            indicator.style.marginLeft = '10px';
            indicator.style.borderRadius = '2px';
            codeCell.appendChild(indicator);
        }
        
        row.appendChild(charCell);
        row.appendChild(freqCell);
        row.appendChild(percentCell);
        row.appendChild(codeCell);
        
        tableBody.appendChild(row);
    });
}

// Create frequency histogram
function createFrequencyHistogram(frequencyData) {
    const canvas = document.getElementById('frequency-chart');
    
    // Clear any existing chart
    if (window.frequencyChart) {
        window.frequencyChart.destroy();
    }
    
    // Sort data by frequency (descending)
    const sortedEntries = Object.entries(frequencyData).sort((a, b) => b[1] - a[1]);
    
    // Limit to top 30 characters for readability
    const topEntries = sortedEntries.slice(0, 30);
    
    // Prepare data for Chart.js
    const labels = topEntries.map(([char, _]) => {
        if (char === ' ') return '(space)';
        if (char === '\n') return '(newline)';
        if (char === '\t') return '(tab)';
        return char;
    });
    
    const data = topEntries.map(([_, freq]) => freq);
    
    // Generate colors based on frequency
    const maxFreq = Math.max(...data);
    const colors = data.map(freq => {
        const hue = 240 - (freq / maxFreq) * 120; // Blue to red gradient
        return `hsl(${hue}, 70%, 60%)`;
    });
    
    // Create chart
    window.frequencyChart = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Character Frequency',
                data: data,
                backgroundColor: colors,
                borderColor: colors.map(color => color.replace('60%', '50%')),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const index = context.dataIndex;
                            const char = labels[index];
                            const freq = data[index];
                            const code = appState.huffmanCodes[sortedEntries[index][0]] || 'N/A';
                            return [
                                `Frequency: ${freq}`,
                                `Huffman Code: ${code}`
                            ];
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Frequency'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Character'
                    }
                }
            },
            animation: {
                duration: 1500,
                easing: 'easeOutQuart'
            }
        }
    });
}

// Update analysis tab with compression data
function updateAnalysisTab(frequencyData, huffmanCodes) {
    // Store data in app state
    appState.frequencyData = frequencyData;
    appState.huffmanCodes = huffmanCodes;
    
    // Update frequency table
    updateFrequencyTable(frequencyData, huffmanCodes);
    
    // Create frequency histogram
    createFrequencyHistogram(frequencyData);
    
    // Removed automatic tab switching to keep dashboard active
}
