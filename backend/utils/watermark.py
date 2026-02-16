"""PDF Watermarking Utility for Studio Portal Documents"""
import io
from datetime import datetime, timezone
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.colors import Color
from pypdf import PdfReader, PdfWriter


def create_watermark_overlay(user_name: str, user_email: str = None, company: str = None) -> io.BytesIO:
    """Create a transparent PDF overlay with a single, subtle diagonal watermark"""
    packet = io.BytesIO()
    can = canvas.Canvas(packet, pagesize=letter)
    page_width, page_height = letter
    
    # Single, large, subtle diagonal watermark (8% opacity - very readable)
    watermark_color = Color(0.5, 0.5, 0.5, alpha=0.08)
    can.setFillColor(watermark_color)
    can.setFont("Helvetica-Bold", 60)
    
    can.saveState()
    can.translate(page_width / 2, page_height / 2)
    can.rotate(45)
    
    # Single centered watermark with user name
    can.drawCentredString(0, 0, user_name.upper())
    
    can.restoreState()
    can.save()
    packet.seek(0)
    return packet


def watermark_pdf(pdf_bytes: bytes, user_name: str, user_email: str = None, company: str = None) -> bytes:
    """Apply single diagonal watermark to all pages of a PDF"""
    try:
        # Create watermark
        watermark_packet = create_watermark_overlay(user_name, user_email, company)
        watermark_reader = PdfReader(watermark_packet)
        watermark_page = watermark_reader.pages[0]
        
        # Read original PDF
        original_reader = PdfReader(io.BytesIO(pdf_bytes))
        writer = PdfWriter()
        
        # Apply watermark to each page
        for page in original_reader.pages:
            page.merge_page(watermark_page)
            writer.add_page(page)
        
        # Write output
        output = io.BytesIO()
        writer.write(output)
        output.seek(0)
        return output.read()
        
    except Exception as e:
        print(f"Watermarking failed: {e}")
        # Return original if watermarking fails
        return pdf_bytes


def watermark_pdf_from_path(pdf_path: str, user_name: str, user_email: str = None, company: str = None) -> bytes:
    """Read PDF from path and apply watermark"""
    with open(pdf_path, 'rb') as f:
        pdf_bytes = f.read()
    return watermark_pdf(pdf_bytes, user_name, user_email, company)
