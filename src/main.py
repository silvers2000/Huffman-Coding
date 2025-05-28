import os
from flask import Flask, render_template, request, jsonify, send_file
import io
from huffman import HuffmanCoding
import json

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload size

# Create uploads folder if it doesn't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/compress', methods=['POST'])
def compress():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    # Read file content
    content = file.read().decode('utf-8')
    
    # Compress using Huffman coding
    huffman = HuffmanCoding()
    compressed_data = huffman.compress(content)
    
    # Get compression statistics
    stats = huffman.get_compression_stats()
    
    # Get frequency dictionary for analysis
    freq_dict = huffman.get_frequency_dict()
    
    # Get Huffman codes for visualization
    codes = huffman.get_codes()
    
    # Get tree nodes for visualization
    tree_nodes = huffman.get_tree_nodes()
    
    # Save compressed file
    compressed_filename = os.path.splitext(file.filename)[0] + '.bin'
    compressed_path = os.path.join(app.config['UPLOAD_FOLDER'], compressed_filename)
    with open(compressed_path, 'wb') as f:
        f.write(compressed_data)
    
    return jsonify({
        'success': True,
        'stats': stats,
        'frequency': freq_dict,
        'codes': codes,
        'tree_nodes': tree_nodes,
        'compressed_filename': compressed_filename
    })

@app.route('/decompress', methods=['POST'])
def decompress():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    # Read compressed file content
    compressed_data = file.read()
    
    # Check if Huffman codes are provided
    if 'codes' not in request.form:
        return jsonify({'error': 'Huffman codes not provided'}), 400
    
    # Parse Huffman codes
    codes = json.loads(request.form['codes'])
    
    # Create Huffman coding instance
    huffman = HuffmanCoding()
    huffman._reversecode = {v: k for k, v in codes.items()}
    
    # Decompress data
    decompressed_text = huffman.decompress(compressed_data)
    
    # Save decompressed file
    decompressed_filename = os.path.splitext(file.filename)[0] + '_decompressed.txt'
    decompressed_path = os.path.join(app.config['UPLOAD_FOLDER'], decompressed_filename)
    with open(decompressed_path, 'w') as f:
        f.write(decompressed_text)
    
    return jsonify({
        'success': True,
        'decompressed_text': decompressed_text,
        'decompressed_filename': decompressed_filename
    })

@app.route('/download/<filename>')
def download_file(filename):
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    # Check if file exists
    if not os.path.exists(file_path):
        return jsonify({'error': 'File not found'}), 404
    
    # Use io.BytesIO to ensure binary file is properly sent
    with open(file_path, 'rb') as f:
        file_data = io.BytesIO(f.read())
    
    file_data.seek(0)
    return send_file(
        file_data,
        mimetype='application/octet-stream',
        as_attachment=True,
        download_name=filename
    )

@app.route('/update-todo', methods=['POST'])
def update_todo():
    data = request.json
    old_text = data.get('oldText')
    new_text = data.get('newText')
    
    # Update todo.md file
    todo_path = 'todo.md'
    if os.path.exists(todo_path):
        with open(todo_path, 'r') as f:
            content = f.read()
        
        content = content.replace(old_text, new_text)
        
        with open(todo_path, 'w') as f:
            f.write(content)
    
    return jsonify({'success': True})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
