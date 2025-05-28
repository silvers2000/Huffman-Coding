# Huffman Coding Project - README

This is a web-based implementation of the Huffman Coding algorithm with a professional UI that includes Dashboard, Analysis, and Visualization features.

## Features

1. **Dashboard**
   - File upload for compression/decompression
   - Compression statistics display
   - Download compressed files

2. **Analysis**
   - Character frequency table
   - Frequency histogram visualization
   - Huffman code display

## How to Run

### Option 1: Using the run.py script (Recommended)
1. Make sure you have Python 3.6+ installed
2. Install the required dependencies:
   ```
   pip install flask
   ```
3. Run the application using the provided script:
   ```
   python src/main.py
   ```
4. Open your browser and navigate to:
   ```
   http://localhost:5000
   ```

### Option 2: Using Flask directly
1. Make sure you have Python 3.6+ installed
2. Install the required dependencies:
   ```
   pip install flask
   ```
3. Run the application with Flask:
   ```
   cd huffman_coding_project
   python -m flask run --host=0.0.0.0 --port=5000
   ```
4. Open your browser and navigate to:
   ```
   http://localhost:5000
   ```

## Project Structure

- `src/` - Backend Python code
  - `huffman.py` - Huffman coding algorithm implementation
  - `main.py` - Flask application and API endpoints
- `static/` - Frontend assets
  - `css/` - Stylesheets
  - `js/` - JavaScript files
  - `images/` - Image assets
- `templates/` - HTML templates
- `uploads/` - Directory for uploaded and processed files
- `run.py` - Cross-platform script to run the application

## Usage Instructions

1. **Compression**:
   - Go to the Dashboard tab
   - Upload a text file using the file upload area
   - Click the "Compress" button
   - View compression statistics
   - Download the compressed file

2. **Analysis**:
   - After compression, navigate to the Analysis tab
   - View the frequency table of characters
   - Examine the histogram visualization

## Troubleshooting

If you encounter any import errors:
- Make sure you're running the application using the provided `run.py` script
- Ensure you have Flask installed (`pip install flask`)
- If running from the src directory directly, use relative imports

Enhanced with a professional web UI for the DSA project presentation.
