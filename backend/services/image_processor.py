"""
Image Processing Service
Handles image compression and WebP conversion for all uploaded images.
"""
from PIL import Image
from pathlib import Path
from typing import Tuple, Optional
import io
import os
import uuid

# Quality settings
JPEG_QUALITY = 85
WEBP_QUALITY = 80
PNG_COMPRESSION = 6
MAX_DIMENSION = 2000  # Maximum width/height for uploaded images

# Image formats that can be converted to WebP
CONVERTIBLE_FORMATS = {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff'}
# Formats we don't convert (already optimized or special)
SKIP_CONVERSION = {'.webp', '.svg', '.ico'}


def get_image_format(ext: str) -> str:
    """Map file extension to PIL format string."""
    format_map = {
        '.jpg': 'JPEG',
        '.jpeg': 'JPEG',
        '.png': 'PNG',
        '.gif': 'GIF',
        '.webp': 'WEBP',
        '.bmp': 'BMP',
        '.tiff': 'TIFF'
    }
    return format_map.get(ext.lower(), 'JPEG')


def resize_if_needed(img: Image.Image, max_dim: int = MAX_DIMENSION) -> Image.Image:
    """Resize image if either dimension exceeds max_dim, preserving aspect ratio."""
    width, height = img.size
    
    if width <= max_dim and height <= max_dim:
        return img
    
    # Calculate new dimensions
    if width > height:
        new_width = max_dim
        new_height = int(height * (max_dim / width))
    else:
        new_height = max_dim
        new_width = int(width * (max_dim / height))
    
    return img.resize((new_width, new_height), Image.Resampling.LANCZOS)


def compress_image(
    content: bytes,
    original_ext: str,
    convert_to_webp: bool = True
) -> Tuple[bytes, str, str]:
    """
    Compress an image and optionally convert to WebP.
    
    Args:
        content: Original image bytes
        original_ext: Original file extension (e.g., '.jpg')
        convert_to_webp: Whether to convert to WebP format
        
    Returns:
        Tuple of (compressed_bytes, new_extension, mime_type)
    """
    ext = original_ext.lower()
    
    # Skip processing for SVG and ICO
    if ext in SKIP_CONVERSION:
        mime = 'image/webp' if ext == '.webp' else 'image/x-icon' if ext == '.ico' else 'image/svg+xml'
        return content, ext, mime
    
    try:
        img = Image.open(io.BytesIO(content))
        
        # Handle animated GIFs - don't convert, just optimize
        if ext == '.gif' and hasattr(img, 'n_frames') and img.n_frames > 1:
            output = io.BytesIO()
            img.save(output, format='GIF', optimize=True)
            return output.getvalue(), '.gif', 'image/gif'
        
        # Convert to RGB if necessary (for JPEG/WebP compatibility)
        if img.mode in ('RGBA', 'LA', 'P'):
            if convert_to_webp or ext in ('.jpg', '.jpeg'):
                # WebP and JPEG can handle RGBA, but let's handle transparency
                if img.mode == 'P':
                    img = img.convert('RGBA')
        elif img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Resize if too large
        img = resize_if_needed(img)
        
        output = io.BytesIO()
        
        if convert_to_webp and ext in CONVERTIBLE_FORMATS:
            # Convert to WebP
            if img.mode == 'RGBA':
                img.save(output, format='WEBP', quality=WEBP_QUALITY, method=4)
            else:
                img.save(output, format='WEBP', quality=WEBP_QUALITY, method=4)
            return output.getvalue(), '.webp', 'image/webp'
        
        # Otherwise, compress in original format
        if ext in ('.jpg', '.jpeg'):
            if img.mode == 'RGBA':
                img = img.convert('RGB')
            img.save(output, format='JPEG', quality=JPEG_QUALITY, optimize=True)
            return output.getvalue(), ext, 'image/jpeg'
        
        elif ext == '.png':
            img.save(output, format='PNG', compress_level=PNG_COMPRESSION, optimize=True)
            return output.getvalue(), '.png', 'image/png'
        
        elif ext == '.webp':
            img.save(output, format='WEBP', quality=WEBP_QUALITY, method=4)
            return output.getvalue(), '.webp', 'image/webp'
        
        else:
            # Default: convert to JPEG
            if img.mode == 'RGBA':
                img = img.convert('RGB')
            img.save(output, format='JPEG', quality=JPEG_QUALITY, optimize=True)
            return output.getvalue(), '.jpg', 'image/jpeg'
            
    except Exception as e:
        # If processing fails, return original content
        print(f"Image processing failed: {e}")
        mime_map = {
            '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
            '.png': 'image/png', '.gif': 'image/gif',
            '.webp': 'image/webp'
        }
        return content, ext, mime_map.get(ext, 'image/jpeg')


def process_upload(
    content: bytes,
    original_filename: str,
    upload_dir: Path,
    convert_to_webp: bool = True
) -> Tuple[str, str, int, str]:
    """
    Process an uploaded image file.
    
    Args:
        content: Raw uploaded bytes
        original_filename: Original filename from upload
        upload_dir: Directory to save processed file
        convert_to_webp: Whether to convert to WebP
        
    Returns:
        Tuple of (saved_filename, file_url, file_size, mime_type)
    """
    original_ext = Path(original_filename).suffix.lower()
    
    # Check if this is an image that should be processed
    image_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff'}
    
    if original_ext in image_extensions:
        # Process the image
        processed_content, new_ext, mime_type = compress_image(
            content, original_ext, convert_to_webp
        )
        
        # Generate unique filename with new extension
        unique_filename = f"{uuid.uuid4()}{new_ext}"
        file_path = upload_dir / unique_filename
        
        # Save the processed image
        with open(file_path, 'wb') as f:
            f.write(processed_content)
        
        file_url = f"/api/upload/images/{unique_filename}"
        
        return unique_filename, file_url, len(processed_content), mime_type
    
    else:
        # Non-image file, save as-is
        unique_filename = f"{uuid.uuid4()}{original_ext}"
        file_path = upload_dir / unique_filename
        
        with open(file_path, 'wb') as f:
            f.write(content)
        
        file_url = f"/api/upload/files/{unique_filename}"
        
        return unique_filename, file_url, len(content), 'application/octet-stream'


def get_compression_stats(original_size: int, compressed_size: int) -> dict:
    """Calculate compression statistics."""
    if original_size == 0:
        return {"original_size": 0, "compressed_size": 0, "savings_percent": 0}
    
    savings = original_size - compressed_size
    savings_percent = (savings / original_size) * 100
    
    return {
        "original_size": original_size,
        "compressed_size": compressed_size,
        "savings_bytes": savings,
        "savings_percent": round(savings_percent, 1)
    }
