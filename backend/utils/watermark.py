"""PDF Watermarking Utility for Investor Documents"""
import io
from datetime import datetime, timezone
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.colors import Color
from pypdf import PdfReader, PdfWriter


def create_watermark_overlay(investor_name: str, investor_email: str = None, company: str = None) -> io.BytesIO:
    """Create a transparent PDF overlay with watermark text"""
    packet = io.BytesIO()
    can = canvas.Canvas(packet, pagesize=letter)
    
    # Semi-transparent gray
    watermark_color = Color(0.5, 0.5, 0.5, alpha=0.15)
    can.setFillColor(watermark_color)
    can.setFont("Helvetica", 10)
    
    # Build watermark text
    timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    lines = [
        f"CONFIDENTIAL - {investor_name}",
        f"Downloaded: {timestamp}"
    ]
    if company:
        lines.insert(1, f"Company: {company}")
    if investor_email:
        lines.append(f"Email: {investor_email}")
    
    watermark_text = " | ".join(lines)
    
    # Draw diagonal watermark across page
    page_width, page_height = letter
    can.saveState()
    can.translate(page_width / 2, page_height / 2)
    can.rotate(45)
    
    # Draw multiple lines of watermark
    can.setFont("Helvetica", 8)
    for i in range(-10, 11, 2):
        can.drawCentredString(0, i * 50, watermark_text)
    
    can.restoreState()
    
    # Footer watermark (more visible)
    can.setFillColor(Color(0.3, 0.3, 0.3, alpha=0.3))
    can.setFont("Helvetica", 7)
    footer_text = f"Provided to: {investor_name}"
    if company:
        footer_text += f" ({company})"
    footer_text += f" | {timestamp}"
    can.drawString(20, 15, footer_text)
    
    can.save()
    packet.seek(0)
    return packet


def watermark_pdf(pdf_bytes: bytes, investor_name: str, investor_email: str = None, company: str = None) -> bytes:
    """Apply watermark to all pages of a PDF"""
    try:
        # Create watermark
        watermark_packet = create_watermark_overlay(investor_name, investor_email, company)
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


def watermark_pdf_from_path(pdf_path: str, investor_name: str, investor_email: str = None, company: str = None) -> bytes:
    """Read PDF from path and apply watermark"""
    with open(pdf_path, 'rb') as f:
        pdf_bytes = f.read()
    return watermark_pdf(pdf_bytes, investor_name, investor_email, company)
