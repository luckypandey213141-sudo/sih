#!/usr/bin/env python3
"""
Generates a structured folder hierarchy for all QR codes:
Campus_QR_Codes_Hierarchical/
  ├── 00_Campus_Outdoor/
  │   └── Outdoor_Ground_Level/
  │       ├── Main_Entrance_Gate/
  │       │   └── Main_Entrance_Gate_SW-CAMPUS-GATE1.png
  │       ├── Central_Campus_Junction/
  │       │   └── Central_Campus_Junction_SW-CAMPUS-CENTRAL.png
  │       └── ...
  ├── 01_Ramanujan_Block/
  │   ├── Basement/
  │   │   ├── Computer_Lab_1/
  │   │   │   └── Computer_Lab_1_SW-RAM-B-LAB1.png
  │   │   └── ...
  │   ├── Ground_Floor/
  │   │   ├── Classroom_R1/
  │   │   │   └── Classroom_R1_SW-RAM-G-R1.png
  │   │   └── ...
  │   └── First_Floor/
  │       ├── Drawing_Lab/
  │       │   └── Drawing_Lab_SW-RAM-1-DRAW.png
  │       └── ...
  ├── 02_Bhabha_Block/
  │   ├── Basement/
  │   ├── Ground_Floor/
  │   └── First_Floor/
  ├── 03_Kalpana_Chawla_Block/
  │   ├── Basement/
  │   ├── Ground_Floor/
  │   └── First_Floor/
  ├── 04_Raman_Block/
  │   ├── Ground_Floor/
  │   └── First_Floor/
  ├── 05_Aryabhatta_Block/
  │   ├── Basement/
  │   └── Ground_Floor/
  └── 06_Facility_Waypoints/
      ├── Level_1/
      └── Level_2/
"""

import os
import shutil
import qrcode
from PIL import Image, ImageDraw, ImageFont

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_ROOT = os.path.join(BASE_DIR, "Campus_QR_Codes_Hierarchical")

from generate_qr_packages import CHECKPOINTS_DATA

def sanitize(name):
    clean = "".join(c if c.isalnum() or c in ("-", "_") else "_" for c in name)
    return "_".join(filter(None, clean.split("_")))

def make_styled_qr_png(code, name, alt_key, floor_str, zone_str, output_path):
    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=16,
        border=3,
    )
    qr.add_data(code)
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color="#0f172a", back_color="#ffffff").convert("RGBA")
    
    # Create canvas with title header & footer details
    qr_w, qr_h = qr_img.size
    canvas_w = qr_w + 60
    canvas_h = qr_h + 160
    
    canvas = Image.new("RGBA", (canvas_w, canvas_h), "#ffffff")
    draw = ImageDraw.Draw(canvas)
    
    # Border
    draw.rectangle([(2, 2), (canvas_w - 3, canvas_h - 3)], outline="#2563eb", width=3)
    
    # Top banner
    draw.rectangle([(2, 2), (canvas_w - 3, 50)], fill="#1e3a8a")
    
    # Default PIL Font
    try:
        font_header = ImageFont.truetype("arialbd.ttf", 18)
        font_sub = ImageFont.truetype("arial.ttf", 13)
        font_code = ImageFont.truetype("courbd.ttf", 17)
        font_uri = ImageFont.truetype("cour.ttf", 12)
    except:
        font_header = ImageFont.load_default()
        font_sub = ImageFont.load_default()
        font_code = ImageFont.load_default()
        font_uri = ImageFont.load_default()
        
    # Header text
    draw.text((canvas_w // 2, 25), f"SAFEWAY INDOOR WAYPOINT", fill="#ffffff", anchor="mm", font=font_header)
    
    # Paste QR Code in center
    canvas.paste(qr_img, (30, 60))
    
    # Footer details
    draw.rectangle([(10, canvas_h - 90), (canvas_w - 10, canvas_h - 10)], fill="#f1f5f9", outline="#cbd5e1", width=1)
    draw.text((canvas_w // 2, canvas_h - 72), f"CHECKPOINT: {name}", fill="#0f172a", anchor="mm", font=font_sub)
    draw.text((canvas_w // 2, canvas_h - 50), f"CODE: {code}", fill="#1e40af", anchor="mm", font=font_code)
    draw.text((canvas_w // 2, canvas_h - 28), f"URI: {alt_key} | {zone_str}", fill="#475569", anchor="mm", font=font_uri)
    
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    canvas.save(output_path, "PNG")
    return output_path

def main():
    if os.path.exists(OUTPUT_ROOT):
        shutil.rmtree(OUTPUT_ROOT)
    os.makedirs(OUTPUT_ROOT, exist_ok=True)
    
    total_qrs = 0
    
    for group in CHECKPOINTS_DATA:
        block_folder = group["block_folder"]
        block_title = group["block_title"]
        floor_name = group["floor_name"]
        
        # Determine clean floor subfolder name
        floor_clean = sanitize(floor_name)
        if "basement" in floor_name.lower():
            floor_folder = "00_Basement"
        elif "ground" in floor_name.lower():
            floor_folder = "01_Ground_Floor"
        elif "first" in floor_name.lower():
            floor_folder = "02_First_Floor"
        elif "outdoor" in floor_name.lower():
            floor_folder = "01_Outdoor_Ground"
        elif "level 1" in floor_name.lower():
            floor_folder = "01_Level_1"
        elif "level 2" in floor_name.lower():
            floor_folder = "02_Level_2"
        else:
            floor_folder = floor_clean
            
        for cp in group["checkpoints"]:
            code = cp["code"]
            alt_key = cp["alt_key"]
            name = cp["name"]
            zone = cp.get("zone", "Zone A")
            
            room_clean = sanitize(name)
            
            # Subfolder per room
            room_dir = os.path.join(OUTPUT_ROOT, block_folder, floor_folder, room_clean)
            os.makedirs(room_dir, exist_ok=True)
            
            # File name inside room subfolder
            png_filename = f"{code}_{room_clean}.png"
            png_path = os.path.join(room_dir, png_filename)
            
            # Also save raw QR in floor folder for quick browsing
            floor_dir = os.path.join(OUTPUT_ROOT, block_folder, floor_folder)
            flat_png_path = os.path.join(floor_dir, f"{code}_{room_clean}_SIGN.png")
            
            # Generate styled PNG
            make_styled_qr_png(code, name, alt_key, floor_name, zone, png_path)
            make_styled_qr_png(code, name, alt_key, floor_name, zone, flat_png_path)
            
            # Write a README.txt inside the room subfolder with location metadata
            readme_path = os.path.join(room_dir, "LOCATION_INFO.txt")
            with open(readme_path, "w", encoding="utf-8") as f:
                f.write(f"SafeWay V3 Dedicated Indoor Waypoint\n")
                f.write(f"====================================\n")
                f.write(f"Checkpoint Name : {name}\n")
                f.write(f"Canonical Code  : {code}\n")
                f.write(f"Positioning URI : {alt_key}\n")
                f.write(f"Block / Area    : {block_title}\n")
                f.write(f"Floor Level     : {floor_name}\n")
                f.write(f"Zone            : {zone}\n")
                f.write(f"Category        : {cp.get('category', 'Standard Room')}\n")
                f.write(f"Description     : {cp.get('desc', '')}\n")
                f.write(f"\nScanning this QR code immediately places the user's live position beacon on this exact room.\n")
                
            total_qrs += 1
            
    # Also create a comprehensive ZIP package
    zip_dst = os.path.join(BASE_DIR, "SafeWay_Hierarchical_QR_PNGs_Package")
    shutil.make_archive(zip_dst, 'zip', OUTPUT_ROOT)
    zip_file = zip_dst + ".zip"
    zip_size_mb = os.path.getsize(zip_file) / (1024 * 1024)
    
    print(f"[OK] Generated {total_qrs} QR checkpoints across Campus -> Block -> Floors -> Rooms hierarchy!")
    print(f"[OK] Root Directory: {OUTPUT_ROOT}")
    print(f"[OK] Zip Archive: {zip_file} ({zip_size_mb:.2f} MB)")

if __name__ == "__main__":
    main()
