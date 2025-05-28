// Dashboard tab functionality
function initDashboard() {
    const fileInput = document.getElementById('file-input');
    const dropArea = document.getElementById('drop-area');
    const selectedFileInfo = document.getElementById('selected-file-info');
    const compressBtn = document.getElementById('compress-btn');
    const decompressBtn = document.getElementById('decompress-btn');
    const browseBtn = document.getElementById('browse-btn');
    const downloadBtn = document.getElementById('download-btn');
    const compressionResults = document.getElementById('compression-results');
    
    let selectedFile = null;
    
    // Browse button click handler
    browseBtn.addEventListener('click', () => {
        fileInput.click();
    });
    
    // File input change handler
    fileInput.addEventListener('change', (e) => {
        handleFileSelection(e.target.files[0]);
    });
    
    // Drag and drop handlers
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight() {
        dropArea.classList.add('dragover');
    }
    
    function unhighlight() {
        dropArea.classList.remove('dragover');
    }
    
    dropArea.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const file = dt.files[0];
        handleFileSelection(file);
    });
    
    // Handle file selection
    function handleFileSelection(file) {
        if (!file) return;
        
        // Check if file is a text file or binary file
        const fileExtension = file.name.split('.').pop().toLowerCase();
        const isTextFile = fileExtension === 'txt';
        const isBinaryFile = fileExtension === 'bin';
        
        if (!isTextFile && !isBinaryFile) {
            alert('Please select a .txt file for compression or a .bin file for decompression.');
            return;
        }
        
        selectedFile = file;
        
        // Update UI
        selectedFileInfo.innerHTML = `
            <div class="file-details">
                <i class="fas ${isTextFile ? 'fa-file-alt' : 'fa-file-archive'}"></i>
                <div>
                    <p><strong>${file.name}</strong></p>
                    <p>${formatSize(file.size)}</p>
                </div>
            </div>
            <button class="btn btn-danger" id="remove-file-btn">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Enable appropriate button
        compressBtn.disabled = !isTextFile;
        decompressBtn.disabled = !isBinaryFile;
        
        // Add remove file button handler
        document.getElementById('remove-file-btn').addEventListener('click', () => {
            selectedFile = null;
            fileInput.value = '';
            selectedFileInfo.innerHTML = '<p>No file selected</p>';
            compressBtn.disabled = true;
            decompressBtn.disabled = true;
            compressionResults.style.display = 'none';
        });
    }
    
    // Compress button click handler
    compressBtn.addEventListener('click', () => {
        if (!selectedFile) return;
        
        showLoading('Compressing file...');
        
        const formData = new FormData();
        formData.append('file', selectedFile);
        
        fetch('/compress', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Store data in app state
                appState.frequencyData = data.frequency;
                appState.huffmanCodes = data.codes;
                appState.treeNodes = data.tree_nodes;
                appState.compressedFilename = data.compressed_filename;
                appState.compressionStats = data.stats;
                
                // Update compression results
                updateCompressionResults(data.stats);
                
                // Update analysis tab
                updateAnalysisTab(data.frequency, data.codes);
                
                // Visualization tab removed
                
                // Show compression results
                compressionResults.style.display = 'block';
            } else {
                alert('Error: ' + data.error);
            }
            hideLoading();
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred during compression.');
            hideLoading();
        });
    });
    
    // Decompress button click handler
    decompressBtn.addEventListener('click', () => {
        if (!selectedFile) return;
        
        showLoading('Decompressing file...');
        
        const formData = new FormData();
        formData.append('file', selectedFile);
        
        // If we have Huffman codes from previous compression, include them
        if (Object.keys(appState.huffmanCodes).length > 0) {
            formData.append('codes', JSON.stringify(appState.huffmanCodes));
        } else {
            alert('Huffman codes not available. Please compress a file first.');
            hideLoading();
            return;
        }
        
        fetch('/decompress', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert(`File decompressed successfully! Saved as ${data.decompressed_filename}`);
            } else {
                alert('Error: ' + data.error);
            }
            hideLoading();
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred during decompression.');
            hideLoading();
        });
    });
    
    // Download button click handler
    downloadBtn.addEventListener('click', () => {
        if (appState.compressedFilename) {
            window.location.href = `/download/${appState.compressedFilename}`;
        }
    });
}

// Update compression results
function updateCompressionResults(stats) {
    document.getElementById('original-size').textContent = formatSize(stats.original_size / 8); // Convert bits to bytes
    document.getElementById('compressed-size').textContent = formatSize(stats.compressed_size / 8); // Convert bits to bytes
    document.getElementById('compression-ratio').textContent = stats.compression_ratio.toFixed(2) + '%';
    
    // Update progress bar
    const progressBar = document.getElementById('compression-progress-bar');
    const compressionPercentage = document.getElementById('compression-percentage');
    
    progressBar.style.width = stats.compression_ratio + '%';
    compressionPercentage.textContent = stats.compression_ratio.toFixed(2) + '%';
}
