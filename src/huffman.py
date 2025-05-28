import heapq
import os

class BinaryTree:
    def __init__(self, value, freq):
        self.value = value
        self.freq = freq
        self.left = None
        self.right = None
    
    def __lt__(self, other):
        return self.freq < other.freq
    
    def __eq__(self, other):
        return self.freq == other.freq

class HuffmanCoding:
    def __init__(self):
        self._heap = []
        self._code = {}
        self._reversecode = {}
        self.frequency_dict = {}
        self.encoded_text = ""
        self.decoded_text = ""
        self.compression_ratio = 0
        self.original_size = 0
        self.compressed_size = 0
        self.tree_nodes = []  # For visualization
    
    def _frequency_from_text(self, text):
        """Calculate frequency of each character in the text"""
        freq_dict = {}
        for char in text:
            if char not in freq_dict:
                freq_dict[char] = 0
            freq_dict[char] += 1
        self.frequency_dict = freq_dict
        return freq_dict
    
    def _build_heap(self, frequency_dict):
        """Build a min heap from the frequency dictionary"""
        self._heap = []
        for key in frequency_dict:
            frequency = frequency_dict[key]
            binary_tree_node = BinaryTree(key, frequency)
            heapq.heappush(self._heap, binary_tree_node)
            # Store node for visualization
            self.tree_nodes.append({
                'value': key,
                'freq': frequency,
                'isLeaf': True
            })
    
    def _build_binary_tree(self):
        """Build the Huffman tree"""
        while len(self._heap) > 1:
            binary_tree_node_1 = heapq.heappop(self._heap)
            binary_tree_node_2 = heapq.heappop(self._heap)
            
            sum_of_freq = binary_tree_node_1.freq + binary_tree_node_2.freq
            newnode = BinaryTree(None, sum_of_freq)
            newnode.left = binary_tree_node_1
            newnode.right = binary_tree_node_2
            
            heapq.heappush(self._heap, newnode)
            
            # Store node for visualization
            self.tree_nodes.append({
                'value': None,
                'freq': sum_of_freq,
                'isLeaf': False,
                'left': binary_tree_node_1.value,
                'right': binary_tree_node_2.value
            })
    
    def _build_tree_code_helper(self, root, curr_bits):
        """Helper function to build the Huffman code"""
        if root is None:
            return
        
        if root.value is not None:
            self._code[root.value] = curr_bits
            self._reversecode[curr_bits] = root.value
            return
        
        self._build_tree_code_helper(root.left, curr_bits + '0')
        self._build_tree_code_helper(root.right, curr_bits + '1')
    
    def _build_tree_code(self):
        """Build the Huffman code for each character"""
        root = heapq.heappop(self._heap)
        self._build_tree_code_helper(root, '')
    
    def _build_encoded_text(self, text):
        """Build the encoded text using the Huffman code"""
        encoded_text = ""
        for char in text:
            encoded_text += self._code[char]
        self.encoded_text = encoded_text
        return encoded_text
    
    def _build_padded_text(self, encoded_text):
        """Add padding to make the encoded text length a multiple of 8"""
        padding_value = 8 - (len(encoded_text) % 8)
        for i in range(padding_value):
            encoded_text += '0'
        
        padded_info = "{0:08b}".format(padding_value)
        padded_encoded_text = padded_info + encoded_text
        return padded_encoded_text
    
    def _build_byte_array(self, padded_text):
        """Convert the padded text to a byte array"""
        array = []
        for i in range(0, len(padded_text), 8):
            byte = padded_text[i:i+8]
            array.append(int(byte, 2))
        return array
    
    def compress(self, text):
        """Compress the input text using Huffman coding"""
        self.original_size = len(text) * 8  # Size in bits
        
        # Get frequency of each character
        frequency_dict = self._frequency_from_text(text)
        
        # Build min heap
        self._build_heap(frequency_dict)
        
        # Build Huffman tree
        self._build_binary_tree()
        
        # Build Huffman codes
        self._build_tree_code()
        
        # Build encoded text
        encoded_text = self._build_encoded_text(text)
        
        # Add padding to encoded text
        padded_encoded_text = self._build_padded_text(encoded_text)
        
        # Convert to bytes
        bytes_array = self._build_byte_array(padded_encoded_text)
        
        # Calculate compression ratio
        self.compressed_size = len(bytes_array) * 8  # Size in bits
        if self.original_size > 0:
            self.compression_ratio = (1 - (self.compressed_size / self.original_size)) * 100
        
        return bytes(bytes_array)
    
    def _remove_padding(self, text):
        """Remove padding from the encoded text"""
        padded_info = text[:8]
        extra_padding = int(padded_info, 2)
        text = text[8:]
        padding_removed_text = text[:-extra_padding] if extra_padding > 0 else text
        return padding_removed_text
    
    def _decode_text(self, text):
        """Decode the encoded text using the reverse Huffman code"""
        decoded_text = ""
        current_bits = ""
        
        for bit in text:
            current_bits += bit
            if current_bits in self._reversecode:
                character = self._reversecode[current_bits]
                decoded_text += character
                current_bits = ""
        
        self.decoded_text = decoded_text
        return decoded_text
    
    def decompress(self, byte_data):
        """Decompress the byte data using Huffman coding"""
        bit_string = ""
        
        # Convert bytes to binary string
        for byte in byte_data:
            binary = bin(byte)[2:].rjust(8, '0')
            bit_string += binary
        
        # Remove padding
        actual_text = self._remove_padding(bit_string)
        
        # Decode text
        decompressed_text = self._decode_text(actual_text)
        
        return decompressed_text
    
    def get_codes(self):
        """Get the Huffman codes for each character"""
        return self._code
    
    def get_frequency_dict(self):
        """Get the frequency dictionary"""
        return self.frequency_dict
    
    def get_tree_nodes(self):
        """Get the tree nodes for visualization"""
        return self.tree_nodes
    
    def get_compression_stats(self):
        """Get compression statistics"""
        return {
            'original_size': self.original_size,
            'compressed_size': self.compressed_size,
            'compression_ratio': self.compression_ratio
        }
