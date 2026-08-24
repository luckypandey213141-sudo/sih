#!/usr/bin/env python3
"""
SafeWay / AegisPath V3 - Comprehensive QR Code & PDF Generator
Creates a structured folder hierarchy with subfolders for each building block and generates:
1. Individual high-resolution QR Signage PDFs for every checkpoint.
2. Consolidated multi-page PDF booklets for each block & floor.
3. Master All-Campus QR Signage Handbook PDF.
4. PNG QR Code assets for digital use.
"""

import os
import sys
import qrcode
from PIL import Image

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Image as RLImage, Table, TableStyle, PageBreak
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.pdfgen import canvas

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_ROOT = os.path.join(BASE_DIR, "SafeWay_QR_Codes")

# Comprehensive Checkpoint Registry
CHECKPOINTS_DATA = [
    # 00. Campus Outdoor Waypoints
    {
        "block_folder": "00_Campus_Outdoor",
        "block_title": "Campus Outdoor Grounds",
        "floor_name": "Outdoor Ground Level",
        "checkpoints": [
            {
                "code": "SW-CAMPUS-GATE1",
                "alt_key": "campus:ent-main",
                "name": "Main Entrance Gate (QR 1)",
                "category": "Main Gate / Access",
                "zone": "Perimeter South",
                "desc": "Primary campus vehicle and pedestrian gateway on South boundary."
            },
            {
                "code": "SW-CAMPUS-CENTRAL",
                "alt_key": "campus:lift-1",
                "name": "Central Campus Junction (QR 2)",
                "category": "Arterial Junction",
                "zone": "Central Plaza",
                "desc": "Main crossroads connecting Bhabha, Ramanujan, and Aryabhatta blocks."
            },
            {
                "code": "SW-CAMPUS-CAFE",
                "alt_key": "campus:reception",
                "name": "Gauri Cafe & ATM (QR 3)",
                "category": "Dining / Services",
                "zone": "Central Plaza",
                "desc": "Campus cafe corner, seating pavilion, and banking ATM kiosk."
            },
            {
                "code": "SW-CAMPUS-BHABHA",
                "alt_key": "campus:lobby",
                "name": "Bhabha Block South Entrance (QR 4)",
                "category": "Building Entry",
                "zone": "West Quad",
                "desc": "Primary ground entrance to Bhabha Engineering & Administration Block."
            },
            {
                "code": "SW-CAMPUS-RAMAN",
                "alt_key": "campus:admin",
                "name": "Ramanujan Block South Entrance (QR 5)",
                "category": "Building Entry",
                "zone": "North-West Wing",
                "desc": "Main entrance foyer to Ramanujan Academic & Computing Block."
            },
            {
                "code": "SW-CAMPUS-SAFE2",
                "alt_key": "campus:assembly-b",
                "name": "Back Yard Safe Area (QR 6)",
                "category": "Emergency Assembly",
                "zone": "North-West Yard",
                "desc": "Designated Open-Air Safe Assembly Area B behind Ramanujan block."
            },
            {
                "code": "SW-CAMPUS-SAFE1",
                "alt_key": "campus:assembly-a",
                "name": "Playground Entry 1 (QR 7)",
                "category": "Emergency Assembly",
                "zone": "North Playfield",
                "desc": "Designated Open-Air Safe Assembly Area A via West Sports Field gate."
            },
            {
                "code": "SW-CAMPUS-KALPANA",
                "alt_key": "campus:restroom-1",
                "name": "Kalpana Chawla Block South Door (QR 8)",
                "category": "Building Entry",
                "zone": "North-Central Wing",
                "desc": "Main ground foyer entrance to Kalpana Chawla Technology Block."
            },
            {
                "code": "SW-CAMPUS-SAFE1-B",
                "alt_key": "campus:playground",
                "name": "Playground Entry 2 (QR 9)",
                "category": "Emergency Assembly",
                "zone": "North Playfield",
                "desc": "Secondary Safe Assembly gate between Kalpana and Raman blocks."
            },
            {
                "code": "SW-CAMPUS-RAMANB",
                "alt_key": "campus:lab-101",
                "name": "Raman Block South Entrance (QR 10)",
                "category": "Building Entry",
                "zone": "North-East Wing",
                "desc": "Main ground foyer entrance to Raman Block & Auditorium."
            },
            {
                "code": "SW-CAMPUS-ARYA-W",
                "alt_key": "campus:campus-ary-left",
                "name": "Aryabhatta Block West Stairs (QR 11)",
                "category": "Building Entry / Stair",
                "zone": "East Quad",
                "desc": "West perimeter stairwell access into Aryabhatta Academic Block."
            },
            {
                "code": "SW-CAMPUS-ARYA",
                "alt_key": "campus:cafeteria",
                "name": "Aryabhatta Block South Door (QR 12)",
                "category": "Building Entry",
                "zone": "East Quad",
                "desc": "Main entrance foyer to Aryabhatta Block and Central Dining Hall."
            },
            {
                "code": "SW-CAMPUS-GATE2",
                "alt_key": "campus:gate-2-destination",
                "name": "Gate No. 2 (East Perimeter) (QR 13)",
                "category": "Emergency Exit / Gate",
                "zone": "East Perimeter",
                "desc": "Secondary campus vehicle and emergency evacuation gate on East boundary."
            }
        ]
    },

    # 01. Ramanujan Block
    {
        "block_folder": "01_Ramanujan_Block",
        "block_title": "Ramanujan Block",
        "floor_name": "Basement",
        "checkpoints": [
            {"code": "SW-RAM-B-LAB1", "alt_key": "ramanujan-basement:Lab 1", "name": "Computer Lab 1", "category": "Lab", "zone": "Zone B", "desc": "Basement Computing Lab 1 workstation room."},
            {"code": "SW-RAM-B-LAB2", "alt_key": "ramanujan-basement:Lab 2", "name": "Computer Lab 2", "category": "Lab", "zone": "Zone B", "desc": "Basement Computing Lab 2 workstation room."},
            {"code": "SW-RAM-B-LAB3", "alt_key": "ramanujan-basement:Lab 3", "name": "Computer Lab 3", "category": "Lab", "zone": "Zone B", "desc": "Basement Computing Lab 3 research lab."},
            {"code": "SW-RAM-B-LAB4", "alt_key": "ramanujan-basement:Lab 4", "name": "Hardware Lab 4", "category": "Lab", "zone": "Zone B", "desc": "Basement Hardware & IoT Systems Lab 4."},
            {"code": "SW-RAM-B-LAB5", "alt_key": "ramanujan-basement:Lab 5", "name": "Networks Lab 5", "category": "Lab", "zone": "Zone B", "desc": "Basement Network Systems Lab 5."},
            {"code": "SW-RAM-B-LAB6", "alt_key": "ramanujan-basement:Lab 6", "name": "Electronics Lab 6", "category": "Lab", "zone": "Zone B", "desc": "Basement Embedded Systems Lab 6."},
            {"code": "SW-RAM-B-LIFT", "alt_key": "ramanujan-basement:Lift", "name": "Basement Lift Lobby", "category": "Vertical Transit", "zone": "Zone A", "desc": "Basement central elevator lobby."},
            {"code": "SW-RAM-B-STAIR1", "alt_key": "ramanujan-basement:Stairs 1", "name": "North Stairwell 1", "category": "Stairwell", "zone": "Zone A", "desc": "North stairwell leading to Ground and First floors."},
            {"code": "SW-RAM-B-STAIR2", "alt_key": "ramanujan-basement:Stairs 2", "name": "East Stairwell 2", "category": "Stairwell", "zone": "Zone B", "desc": "East stairwell leading to Ground Floor fire exits."},
            {"code": "SW-RAM-B-EXIT", "alt_key": "ramanujan-basement:Exit", "name": "Basement Emergency Exit", "category": "Emergency Exit", "zone": "Zone B", "desc": "Direct emergency egress ramp to exterior quad."}
        ]
    },
    {
        "block_folder": "01_Ramanujan_Block",
        "block_title": "Ramanujan Block",
        "floor_name": "Ground Floor",
        "checkpoints": [
            {"code": "SW-RAM-G-ENT1", "alt_key": "ramanujan-ground:Entry / Exit 1", "name": "Main Entrance / Exit 1", "category": "Main Entrance", "zone": "Zone A", "desc": "Primary Ground Floor entrance foyer and reception."},
            {"code": "SW-RAM-G-ENT2", "alt_key": "ramanujan-ground:Entry / Exit 2", "name": "East Fire Exit 2", "category": "Emergency Exit", "zone": "Zone B", "desc": "East fire exit door opening to campus arterial pathway."},
            {"code": "SW-RAM-G-ENT3", "alt_key": "ramanujan-ground:Entry / Exit 3", "name": "South Exit 3", "category": "Emergency Exit", "zone": "Zone C", "desc": "South exit door connecting to Central Campus Plaza."},
            {"code": "SW-RAM-G-LIFT", "alt_key": "ramanujan-ground:Lift", "name": "Central Elevator Lobby", "category": "Vertical Transit", "zone": "Zone C", "desc": "Ground Floor central lift lobby with accessible ramps."},
            {"code": "SW-RAM-G-COURT", "alt_key": "ramanujan-ground:Badminton Court", "name": "Badminton Court Atrium", "category": "Sports / Atrium", "zone": "Zone C", "desc": "Open indoor sports court and central recreation atrium."},
            {"code": "SW-RAM-G-R1", "alt_key": "ramanujan-ground:R1", "name": "Classroom R1", "category": "Classroom", "zone": "Zone A", "desc": "Lecture Room R1 (Capacity 60 students)."},
            {"code": "SW-RAM-G-R2", "alt_key": "ramanujan-ground:R2", "name": "Classroom R2", "category": "Classroom", "zone": "Zone A", "desc": "Lecture Room R2 (Capacity 60 students)."},
            {"code": "SW-RAM-G-R3", "alt_key": "ramanujan-ground:R3", "name": "Classroom R3", "category": "Classroom", "zone": "Zone A", "desc": "Lecture Room R3 (Capacity 60 students)."},
            {"code": "SW-RAM-G-R4", "alt_key": "ramanujan-ground:R4", "name": "Classroom R4", "category": "Classroom", "zone": "Zone A", "desc": "Lecture Room R4 (Capacity 60 students)."},
            {"code": "SW-RAM-G-R6", "alt_key": "ramanujan-ground:R6", "name": "Classroom R6", "category": "Classroom", "zone": "Zone B", "desc": "Lecture Room R6 (Capacity 60 students)."},
            {"code": "SW-RAM-G-R7", "alt_key": "ramanujan-ground:R7", "name": "Classroom R7", "category": "Classroom", "zone": "Zone B", "desc": "Lecture Room R7 (Capacity 60 students)."},
            {"code": "SW-RAM-G-R8", "alt_key": "ramanujan-ground:R8", "name": "Classroom R8", "category": "Classroom", "zone": "Zone A", "desc": "Faculty Room R8 & Tutorial Class."},
            {"code": "SW-RAM-G-R9", "alt_key": "ramanujan-ground:R9", "name": "Classroom R9", "category": "Classroom", "zone": "Zone A", "desc": "Faculty Room R9 & Tutorial Class."},
            {"code": "SW-RAM-G-R10", "alt_key": "ramanujan-ground:R10", "name": "Classroom R10", "category": "Classroom", "zone": "Zone A", "desc": "Seminar Room R10."},
            {"code": "SW-RAM-G-R11", "alt_key": "ramanujan-ground:R11", "name": "Classroom R11", "category": "Classroom", "zone": "Zone E", "desc": "Advanced Study Hall R11."},
            {"code": "SW-RAM-G-R12", "alt_key": "ramanujan-ground:R12", "name": "Classroom R12", "category": "Classroom", "zone": "Zone E", "desc": "Conference Room R12."},
            {"code": "SW-RAM-G-W1", "alt_key": "ramanujan-ground:W1", "name": "East Washrooms (W1)", "category": "Restroom", "zone": "Zone C", "desc": "East corridor washrooms and sanitation facility."},
            {"code": "SW-RAM-G-W2", "alt_key": "ramanujan-ground:W2", "name": "West Washrooms (W2)", "category": "Restroom", "zone": "Zone E", "desc": "West corridor washrooms and sanitation facility."}
        ]
    },
    {
        "block_folder": "01_Ramanujan_Block",
        "block_title": "Ramanujan Block",
        "floor_name": "First Floor",
        "checkpoints": [
            {"code": "SW-RAM-1-DRAW", "alt_key": "ramanujan-first:Drawing Lab", "name": "Engineering Drawing Lab", "category": "Lab", "zone": "Zone D", "desc": "First Floor Engineering Drawing and CAD studio."},
            {"code": "SW-RAM-1-LT1", "alt_key": "ramanujan-first:LT 1", "name": "Lecture Theatre LT 1", "category": "Lecture Hall", "zone": "Zone D", "desc": "Tiered Lecture Theatre LT 1 (Capacity 120 students)."},
            {"code": "SW-RAM-1-LT2", "alt_key": "ramanujan-first:LT 2", "name": "Lecture Theatre LT 2", "category": "Lecture Hall", "zone": "Zone D", "desc": "Tiered Lecture Theatre LT 2 (Capacity 120 students)."},
            {"code": "SW-RAM-1-LT3", "alt_key": "ramanujan-first:LT 3", "name": "Lecture Theatre LT 3", "category": "Lecture Hall", "zone": "Zone D", "desc": "Tiered Lecture Theatre LT 3 (Capacity 120 students)."},
            {"code": "SW-RAM-1-LT4", "alt_key": "ramanujan-first:LT 4", "name": "Lecture Theatre LT 4", "category": "Lecture Hall", "zone": "Zone D", "desc": "Tiered Lecture Theatre LT 4 (Capacity 120 students)."},
            {"code": "SW-RAM-1-BWC", "alt_key": "ramanujan-first:Boys W/C", "name": "Boys Restroom 1F", "category": "Restroom", "zone": "Zone E", "desc": "First floor boys washroom facilities."},
            {"code": "SW-RAM-1-GWC", "alt_key": "ramanujan-first:Girls W/C", "name": "Girls Restroom 1F", "category": "Restroom", "zone": "Zone E", "desc": "First floor girls washroom facilities."},
            {"code": "SW-RAM-1-LIFT", "alt_key": "ramanujan-first:Lift", "name": "First Floor Lift Lobby", "category": "Vertical Transit", "zone": "Zone D", "desc": "Central elevator station at Upper Level."},
            {"code": "SW-RAM-1-STAIR", "alt_key": "ramanujan-first:Stairs", "name": "East Stairwell Landing", "category": "Stairwell", "zone": "Zone E", "desc": "Primary fire stairwell leading to ground exit."},
            {"code": "SW-RAM-1-EXIT", "alt_key": "ramanujan-first:Entry / Exit", "name": "Upper Corridor Exit", "category": "Exit", "zone": "Zone E", "desc": "Upper bridge connection and emergency stairwell foyer."}
        ]
    },

    # 02. Bhabha Block
    {
        "block_folder": "02_Bhabha_Block",
        "block_title": "Bhabha Block",
        "floor_name": "Basement",
        "checkpoints": [
            {"code": "SW-BHAB-B-DIGILIB", "alt_key": "bhabha-basement:Digital Library", "name": "Digital Library e-Resource Center", "category": "Library", "zone": "Zone A", "desc": "Digital catalog, research stations, and internet access hub."},
            {"code": "SW-BHAB-B-LIB", "alt_key": "bhabha-basement:Library", "name": "Reference Section Library", "category": "Library", "zone": "Zone A", "desc": "Core engineering journals, archives, and reference collections."},
            {"code": "SW-BHAB-B-MAINLIB", "alt_key": "bhabha-basement:Main Library", "name": "Central Main Library", "category": "Library", "zone": "Zone B", "desc": "Main book lending collection and reading rooms."},
            {"code": "SW-BHAB-B-LOBBY", "alt_key": "bhabha-basement:Lobby / Corridor", "name": "Library Grand Lobby", "category": "Lobby", "zone": "Zone A", "desc": "Circulation desk, issue counter, and reading lobby."},
            {"code": "SW-BHAB-B-GATE", "alt_key": "bhabha-basement:Entry Gate", "name": "Library Main Gate", "category": "Entrance", "zone": "Zone A", "desc": "Primary entrance turnstiles to Central Library."},
            {"code": "SW-BHAB-B-EXIT", "alt_key": "bhabha-basement:Exit", "name": "Library Emergency Fire Exit", "category": "Emergency Exit", "zone": "Zone B", "desc": "Direct emergency egress door from stack rooms."}
        ]
    },
    {
        "block_folder": "02_Bhabha_Block",
        "block_title": "Bhabha Block",
        "floor_name": "Ground Floor",
        "checkpoints": [
            {"code": "SW-BHAB-G-ENTRY", "alt_key": "bhabha-ground:Entry", "name": "Bhabha Main Foyer Entry", "category": "Main Entrance", "zone": "Zone A", "desc": "Primary Ground Floor ceremonial entrance and lobby."},
            {"code": "SW-BHAB-G-LH1", "alt_key": "bhabha-ground:Lecture Hall 1", "name": "Lecture Hall LH 1", "category": "Lecture Hall", "zone": "Zone A", "desc": "Ground Floor multimedia lecture theatre 1."},
            {"code": "SW-BHAB-G-LH2", "alt_key": "bhabha-ground:Lecture Hall 2", "name": "Lecture Hall LH 2", "category": "Lecture Hall", "zone": "Zone B", "desc": "Ground Floor multimedia lecture theatre 2."},
            {"code": "SW-BHAB-G-RECEP", "alt_key": "bhabha-ground:Reception", "name": "Central Reception & Helpdesk", "category": "Admin", "zone": "Zone A", "desc": "Visitor reception, information helpdesk, and security."},
            {"code": "SW-BHAB-G-REGISTRAR", "alt_key": "bhabha-ground:Registrar", "name": "Registrar Office", "category": "Admin", "zone": "Zone B", "desc": "Academic records, examinations, and registrar office."},
            {"code": "SW-BHAB-G-DIRECTOR", "alt_key": "bhabha-ground:Director Office", "name": "Director Secretariat", "category": "Executive", "zone": "Zone A", "desc": "Director executive chamber and conference boardroom."},
            {"code": "SW-BHAB-G-ADMISSION", "alt_key": "bhabha-ground:Admission Cell", "name": "Admission & Counselling Cell", "category": "Admin", "zone": "Zone B", "desc": "Student admission desk, fees office, and counseling rooms."},
            {"code": "SW-BHAB-G-SITTING", "alt_key": "bhabha-ground:Sitting Hall", "name": "Visitor Sitting Lounge", "category": "Lounge", "zone": "Zone B", "desc": "Spacious guest reception lounge and waiting area."},
            {"code": "SW-BHAB-G-WATER", "alt_key": "bhabha-ground:Drinking Water", "name": "Drinking Water Kiosk", "category": "Facility", "zone": "Zone B", "desc": "Filtered drinking water station and chiller unit."},
            {"code": "SW-BHAB-G-BWC", "alt_key": "bhabha-ground:Boys W/C", "name": "Boys Restrooms 1F", "category": "Restroom", "zone": "Zone A", "desc": "Ground floor male washroom facility."},
            {"code": "SW-BHAB-G-GWC", "alt_key": "bhabha-ground:Girls W/C", "name": "Girls Restrooms 1F", "category": "Restroom", "zone": "Zone B", "desc": "Ground floor female washroom facility."},
            {"code": "SW-BHAB-G-STAIR1", "alt_key": "bhabha-ground:Stairs 1", "name": "West Stairwell (Stairs 1)", "category": "Stairwell", "zone": "Zone A", "desc": "West wing stairwell leading to Upper Floors and Basement."},
            {"code": "SW-BHAB-G-STAIR2", "alt_key": "bhabha-ground:Stairs 2", "name": "East Stairwell (Stairs 2)", "category": "Stairwell", "zone": "Zone B", "desc": "East wing stairwell leading to Upper Floors and Library."}
        ]
    },
    {
        "block_folder": "02_Bhabha_Block",
        "block_title": "Bhabha Block",
        "floor_name": "First Floor",
        "checkpoints": [
            {"code": "SW-BHAB-1-HODME", "alt_key": "bhabha-first:HOD ME", "name": "Head of Dept Mechanical Eng", "category": "Faculty", "zone": "Zone D", "desc": "Mechanical Engineering Department HOD office."},
            {"code": "SW-BHAB-1-LT1", "alt_key": "bhabha-first:LT 1", "name": "Lecture Theatre LT 1", "category": "Lecture Hall", "zone": "Zone D", "desc": "Upper Level tiered lecture classroom 1."},
            {"code": "SW-BHAB-1-LT2", "alt_key": "bhabha-first:LT 2", "name": "Lecture Theatre LT 2", "category": "Lecture Hall", "zone": "Zone D", "desc": "Upper Level tiered lecture classroom 2."},
            {"code": "SW-BHAB-1-LT3", "alt_key": "bhabha-first:LT 3", "name": "Lecture Theatre LT 3", "category": "Lecture Hall", "zone": "Zone E", "desc": "Upper Level tiered lecture classroom 3."},
            {"code": "SW-BHAB-1-FACULTY", "alt_key": "bhabha-first:Faculty Cabins", "name": "Faculty Cabins & Staff Room", "category": "Faculty", "zone": "Zone D", "desc": "Professor faculty workstations and meeting cabins."},
            {"code": "SW-BHAB-1-ECELAB", "alt_key": "bhabha-first:ECE Lab", "name": "Electronics & Comm (ECE) Lab", "category": "Lab", "zone": "Zone E", "desc": "VLSI design, circuits, and communication systems lab."},
            {"code": "SW-BHAB-1-BWC", "alt_key": "bhabha-first:Boys W/C", "name": "Boys Washrooms 2F", "category": "Restroom", "zone": "Zone D", "desc": "First floor male washroom facility."},
            {"code": "SW-BHAB-1-GWC", "alt_key": "bhabha-first:Girls W/C", "name": "Girls Washrooms 2F", "category": "Restroom", "zone": "Zone E", "desc": "First floor female washroom facility."},
            {"code": "SW-BHAB-1-STAIR", "alt_key": "bhabha-first:Stairs", "name": "Central Stairwell Landing", "category": "Stairwell", "zone": "Zone E", "desc": "Primary descent stairwell to ground exit."},
            {"code": "SW-BHAB-1-EXIT1", "alt_key": "bhabha-first:Entry / Exit 1", "name": "Upper Corridor Exit 1", "category": "Exit", "zone": "Zone D", "desc": "North corridor emergency stairwell egress door."},
            {"code": "SW-BHAB-1-EXIT2", "alt_key": "bhabha-first:Entry / Exit 2", "name": "Upper Corridor Exit 2", "category": "Exit", "zone": "Zone E", "desc": "East bridge connection to adjacent Academic Wing."}
        ]
    },

    # 03. Kalpana Block
    {
        "block_folder": "03_Kalpana_Block",
        "block_title": "Kalpana Chawla Block",
        "floor_name": "Basement",
        "checkpoints": [
            {"code": "SW-KAL-B-FLUID", "alt_key": "kalpana-basement:Fluid Mechanics Lab", "name": "Fluid Mechanics Laboratory", "category": "Lab", "zone": "Zone A", "desc": "Hydraulics, pumps, and fluid mechanics test lab."},
            {"code": "SW-KAL-B-CS1", "alt_key": "kalpana-basement:Computer Lab 1", "name": "Advanced Computing Lab 1", "category": "Lab", "zone": "Zone A", "desc": "AI & High-Performance Computing workstation lab."},
            {"code": "SW-KAL-B-CS2", "alt_key": "kalpana-basement:Computer Lab 2", "name": "Advanced Computing Lab 2", "category": "Lab", "zone": "Zone B", "desc": "Cloud computing and database systems lab."},
            {"code": "SW-KAL-B-AUTO", "alt_key": "kalpana-basement:Automobile Lab", "name": "Automobile Engineering Lab", "category": "Lab", "zone": "Zone A", "desc": "IC engines, chassis, and automotive mechanics bay."},
            {"code": "SW-KAL-B-STORE", "alt_key": "kalpana-basement:Store Room", "name": "Central Equipment Store", "category": "Facility", "zone": "Zone B", "desc": "Laboratory supplies, inventory, and spares store."},
            {"code": "SW-KAL-B-LIFT", "alt_key": "kalpana-basement:Lift", "name": "Basement Elevator Lobby", "category": "Vertical Transit", "zone": "Zone A", "desc": "Basement elevator station."},
            {"code": "SW-KAL-B-STAIR1", "alt_key": "kalpana-basement:Stair 1", "name": "North Stairwell 1", "category": "Stairwell", "zone": "Zone A", "desc": "North stairwell to ground level."},
            {"code": "SW-KAL-B-STAIR2", "alt_key": "kalpana-basement:Stair 2", "name": "South Stairwell 2", "category": "Stairwell", "zone": "Zone B", "desc": "South fire stairwell to exterior."},
            {"code": "SW-KAL-B-EXIT", "alt_key": "kalpana-basement:Entry / Exit", "name": "Basement Ramp Exit", "category": "Emergency Exit", "zone": "Zone B", "desc": "Emergency equipment ramp to ground."}
        ]
    },
    {
        "block_folder": "03_Kalpana_Block",
        "block_title": "Kalpana Chawla Block",
        "floor_name": "Ground Floor",
        "checkpoints": [
            {"code": "SW-KAL-G-ENTRY", "alt_key": "kalpana-ground:Entry", "name": "Kalpana Block Main Entry", "category": "Main Entrance", "zone": "Zone A", "desc": "Ground Floor main entrance foyer from campus arterial road."},
            {"code": "SW-KAL-G-LT1", "alt_key": "kalpana-ground:LT 1", "name": "Lecture Theatre LT 1", "category": "Lecture Hall", "zone": "Zone B", "desc": "Smart lecture theatre 1 with digital podium."},
            {"code": "SW-KAL-G-LT2", "alt_key": "kalpana-ground:LT 2", "name": "Lecture Theatre LT 2", "category": "Lecture Hall", "zone": "Zone A", "desc": "Smart lecture theatre 2 with acoustic panels."},
            {"code": "SW-KAL-G-LT3", "alt_key": "kalpana-ground:LT 3", "name": "Lecture Theatre LT 3", "category": "Lecture Hall", "zone": "Zone A", "desc": "Smart lecture theatre 3 with multimedia projector."},
            {"code": "SW-KAL-G-CCPD1", "alt_key": "kalpana-ground:CCPD 1", "name": "Career & Placement Center (CCPD 1)", "category": "Placement", "zone": "Zone A", "desc": "Corporate interview suites and placement cell 1."},
            {"code": "SW-KAL-G-CCPD2", "alt_key": "kalpana-ground:CCPD 2", "name": "Career & Placement Center (CCPD 2)", "category": "Placement", "zone": "Zone B", "desc": "Group discussion room and career counseling desk."},
            {"code": "SW-KAL-G-CS1", "alt_key": "kalpana-ground:Computer Lab 1", "name": "Software Engineering Lab", "category": "Lab", "zone": "Zone B", "desc": "Software systems, compilers, and coding lab."},
            {"code": "SW-KAL-G-HODCSE", "alt_key": "kalpana-ground:HOD CSE", "name": "Head of Dept Computer Science", "category": "Faculty", "zone": "Zone A", "desc": "CSE Department Head office and conference desk."},
            {"code": "SW-KAL-G-BWC", "alt_key": "kalpana-ground:Boys W/C", "name": "Boys Restrooms 1F", "category": "Restroom", "zone": "Zone A", "desc": "Ground Floor male sanitation facility."},
            {"code": "SW-KAL-G-GWC", "alt_key": "kalpana-ground:Girls W/C", "name": "Girls Restrooms 1F", "category": "Restroom", "zone": "Zone B", "desc": "Ground Floor female sanitation facility."},
            {"code": "SW-KAL-G-LIFT", "alt_key": "kalpana-ground:Lift", "name": "Ground Floor Elevator Lobby", "category": "Vertical Transit", "zone": "Zone A", "desc": "Central passenger elevator station."},
            {"code": "SW-KAL-G-STAIR", "alt_key": "kalpana-ground:Stairs", "name": "Central Stairwell 1F", "category": "Stairwell", "zone": "Zone A", "desc": "Central stairwell connecting all 3 levels."},
            {"code": "SW-KAL-G-EMERG", "alt_key": "kalpana-ground:Emergency Exit", "name": "North Emergency Fire Exit", "category": "Emergency Exit", "zone": "Zone B", "desc": "Direct outward opening fire egress door to Safe Playground Area."}
        ]
    },
    {
        "block_folder": "03_Kalpana_Block",
        "block_title": "Kalpana Chawla Block",
        "floor_name": "First Floor",
        "checkpoints": [
            {"code": "SW-KAL-1-TH1", "alt_key": "kalpana-first:Training Hall 1", "name": "Corporate Training Hall 1", "category": "Seminar", "zone": "Zone D", "desc": "Large conference training room for workshops."},
            {"code": "SW-KAL-1-TH2", "alt_key": "kalpana-first:Training Hall 2", "name": "Corporate Training Hall 2", "category": "Seminar", "zone": "Zone D", "desc": "Executive seminar and guest lecture hall."},
            {"code": "SW-KAL-1-CR1", "alt_key": "kalpana-first:Class Room 1", "name": "Classroom CR 1", "category": "Classroom", "zone": "Zone D", "desc": "First Floor tutorial classroom 1."},
            {"code": "SW-KAL-1-CR2", "alt_key": "kalpana-first:Class Room 2", "name": "Classroom CR 2", "category": "Classroom", "zone": "Zone E", "desc": "First Floor tutorial classroom 2."},
            {"code": "SW-KAL-1-CR3", "alt_key": "kalpana-first:Class Room 3", "name": "Classroom CR 3", "category": "Classroom", "zone": "Zone D", "desc": "First Floor tutorial classroom 3."},
            {"code": "SW-KAL-1-CR4", "alt_key": "kalpana-first:Class Room 4", "name": "Classroom CR 4", "category": "Classroom", "zone": "Zone E", "desc": "First Floor tutorial classroom 4."},
            {"code": "SW-KAL-1-STORE", "alt_key": "kalpana-first:Store", "name": "Departmental Archives & Store", "category": "Facility", "zone": "Zone E", "desc": "Academic records, exam archives, and stationary store."},
            {"code": "SW-KAL-1-BWC", "alt_key": "kalpana-first:Boys W/C", "name": "Boys Washrooms 2F", "category": "Restroom", "zone": "Zone D", "desc": "Upper level male washroom facility."},
            {"code": "SW-KAL-1-GWC", "alt_key": "kalpana-first:Girls W/C", "name": "Girls Washrooms 2F", "category": "Restroom", "zone": "Zone E", "desc": "Upper level female washroom facility."},
            {"code": "SW-KAL-1-EXIT", "alt_key": "kalpana-first:Entry / Exit", "name": "West Stairway Exit", "category": "Exit", "zone": "Zone D", "desc": "West wing stairwell connection to ground exit."},
            {"code": "SW-KAL-1-EMERG", "alt_key": "kalpana-first:Emergency Exit", "name": "Upper Fire Escape Door", "category": "Emergency Exit", "zone": "Zone D", "desc": "External fire escape stair tower access door."}
        ]
    },

    # 04. Raman Block
    {
        "block_folder": "04_Raman_Block",
        "block_title": "Raman Block",
        "floor_name": "Ground Floor",
        "checkpoints": [
            {"code": "SW-RAMAN-G-EXIT1", "alt_key": "raman-ground:Entry / Exit 1", "name": "Raman Main Entrance / Exit 1", "category": "Main Entrance", "zone": "Zone A", "desc": "Ground Floor main foyer entry from campus road."},
            {"code": "SW-RAMAN-G-EXIT2", "alt_key": "raman-ground:Entry / Exit 2", "name": "East Fire Exit 2", "category": "Emergency Exit", "zone": "Zone B", "desc": "East perimeter fire escape exit door to Gate 2 path."},
            {"code": "SW-RAMAN-G-LH1", "alt_key": "raman-ground:Lecture Hall 1", "name": "Lecture Hall LH 1", "category": "Lecture Hall", "zone": "Zone A", "desc": "Multimedia physics & science lecture hall 1."},
            {"code": "SW-RAMAN-G-LH2", "alt_key": "raman-ground:Lecture Hall 2", "name": "Lecture Hall LH 2", "category": "Lecture Hall", "zone": "Zone A", "desc": "Multimedia chemistry & materials lecture hall 2."},
            {"code": "SW-RAMAN-G-SAMVAAD", "alt_key": "raman-ground:Samvaad Club", "name": "Samvaad Literary & Debate Club", "category": "Club / Activity", "zone": "Zone B", "desc": "Student union debate room and literary society hub."},
            {"code": "SW-RAMAN-G-KALAKRIT", "alt_key": "raman-ground:Kalakrit Club", "name": "Kalakrit Fine Arts & Music Club", "category": "Club / Activity", "zone": "Zone A", "desc": "Cultural society studio, instruments room, and art space."},
            {"code": "SW-RAMAN-G-MED", "alt_key": "raman-ground:Medical Room", "name": "Campus Medical Center & First Aid", "category": "Medical / Health", "zone": "Zone B", "desc": "Emergency medical room, nurse station, and first-aid beds."},
            {"code": "SW-RAMAN-G-WATER", "alt_key": "raman-ground:Drinking Water", "name": "RO Drinking Water Hub", "category": "Facility", "zone": "Zone B", "desc": "Purified water station and dispenser."},
            {"code": "SW-RAMAN-G-BWC", "alt_key": "raman-ground:Boys W/C", "name": "Boys Restrooms 1F", "category": "Restroom", "zone": "Zone A", "desc": "Ground Floor male sanitation facility."},
            {"code": "SW-RAMAN-G-GWC", "alt_key": "raman-ground:Girls W/C", "name": "Girls Restrooms 1F", "category": "Restroom", "zone": "Zone B", "desc": "Ground Floor female sanitation facility."},
            {"code": "SW-RAMAN-G-LIFT", "alt_key": "raman-ground:Lift", "name": "Central Elevator Station", "category": "Vertical Transit", "zone": "Zone A", "desc": "Ground floor passenger elevator station."},
            {"code": "SW-RAMAN-G-STAIR", "alt_key": "raman-ground:Stairs", "name": "East Stairwell", "category": "Stairwell", "zone": "Zone B", "desc": "Staircase leading to First Floor Auditorium."}
        ]
    },
    {
        "block_folder": "04_Raman_Block",
        "block_title": "Raman Block",
        "floor_name": "First Floor",
        "checkpoints": [
            {"code": "SW-RAMAN-1-AUD", "alt_key": "raman-first:Auditorium Hall", "name": "Grand Campus Auditorium", "category": "Auditorium", "zone": "Zone D", "desc": "500-seat multi-purpose auditorium, stage, and AV control room."},
            {"code": "SW-RAMAN-1-LH", "alt_key": "raman-first:Lecture Hall", "name": "Executive Seminar Hall", "category": "Lecture Hall", "zone": "Zone E", "desc": "Executive symposium hall with video conferencing."},
            {"code": "SW-RAMAN-1-WATER", "alt_key": "raman-first:Drinking Water", "name": "Drinking Water Hub 2F", "category": "Facility", "zone": "Zone E", "desc": "Upper Level drinking water kiosk."},
            {"code": "SW-RAMAN-1-BWC", "alt_key": "raman-first:Boys W/C", "name": "Boys Washrooms 2F", "category": "Restroom", "zone": "Zone D", "desc": "Auditorium foyer male washroom."},
            {"code": "SW-RAMAN-1-GWC", "alt_key": "raman-first:Girls W/C", "name": "Girls Washrooms 2F", "category": "Restroom", "zone": "Zone E", "desc": "Auditorium foyer female washroom."},
            {"code": "SW-RAMAN-1-LIFT", "alt_key": "raman-first:Lift", "name": "Upper Elevator Lobby", "category": "Vertical Transit", "zone": "Zone D", "desc": "First Floor elevator lobby with accessible ramp."},
            {"code": "SW-RAMAN-1-STAIR", "alt_key": "raman-first:Stairs", "name": "Auditorium Grand Staircase", "category": "Stairwell", "zone": "Zone E", "desc": "Wide egress stairwell leading to ground exit."},
            {"code": "SW-RAMAN-1-EXIT1", "alt_key": "raman-first:Entry / Exit 1", "name": "Auditorium Main Portal", "category": "Main Entrance", "zone": "Zone D", "desc": "Double doors into the auditorium seating hall."},
            {"code": "SW-RAMAN-1-EXIT2", "alt_key": "raman-first:Entry / Exit 2", "name": "Auditorium Fire Escape Exit", "category": "Emergency Exit", "zone": "Zone E", "desc": "Direct emergency fire escape route to exterior stairs."}
        ]
    },

    # 05. Aryabhatta Block
    {
        "block_folder": "05_Aryabhatta_Block",
        "block_title": "Aryabhatta Block",
        "floor_name": "Basement",
        "checkpoints": [
            {"code": "SW-ARYA-B-CR1", "alt_key": "aryabhatta-basement:Classroom 1", "name": "Classroom CR 1", "category": "Classroom", "zone": "Zone A", "desc": "Basement tutorial classroom 1."},
            {"code": "SW-ARYA-B-CR2", "alt_key": "aryabhatta-basement:Classroom 2", "name": "Classroom CR 2", "category": "Classroom", "zone": "Zone A", "desc": "Basement tutorial classroom 2."},
            {"code": "SW-ARYA-B-CR3", "alt_key": "aryabhatta-basement:Classroom 3", "name": "Classroom CR 3", "category": "Classroom", "zone": "Zone B", "desc": "Basement tutorial classroom 3."},
            {"code": "SW-ARYA-B-LAB1", "alt_key": "aryabhatta-basement:Lab 1", "name": "Applied Physics Lab", "category": "Lab", "zone": "Zone A", "desc": "Optics, mechanics, and quantum physics lab."},
            {"code": "SW-ARYA-B-LAB2", "alt_key": "aryabhatta-basement:Lab 2", "name": "Applied Chemistry Lab", "category": "Lab", "zone": "Zone B", "desc": "Inorganic analysis and chemical synthesis lab."},
            {"code": "SW-ARYA-B-ROOM", "alt_key": "aryabhatta-basement:Room", "name": "Faculty & Scholars Study Room", "category": "Faculty", "zone": "Zone B", "desc": "Research scholar cubicles and quiet study space."},
            {"code": "SW-ARYA-B-LIFT", "alt_key": "aryabhatta-basement:Lift", "name": "Basement Lift Lobby", "category": "Vertical Transit", "zone": "Zone A", "desc": "Basement elevator station."},
            {"code": "SW-ARYA-B-STAIR1", "alt_key": "aryabhatta-basement:Stairs 1", "name": "Stairwell 1 (West)", "category": "Stairwell", "zone": "Zone A", "desc": "West stairwell connecting to ground floor lobby."}
        ]
    },
    {
        "block_folder": "05_Aryabhatta_Block",
        "block_title": "Aryabhatta Block",
        "floor_name": "Ground Floor",
        "checkpoints": [
            {"code": "SW-ARYA-G-EXIT", "alt_key": "aryabhatta-ground:Entry / Exit", "name": "Aryabhatta Main Entry / Exit", "category": "Main Entrance", "zone": "Zone A", "desc": "Primary Ground Floor lobby entrance from East Campus Loop."},
            {"code": "SW-ARYA-G-LARGEROOM", "alt_key": "aryabhatta-ground:Large Room", "name": "Central Conference Hall", "category": "Conference", "zone": "Zone A", "desc": "Executive multi-purpose conference and presentation hall."},
            {"code": "SW-ARYA-G-R1", "alt_key": "aryabhatta-ground:Room 1", "name": "Classroom R1", "category": "Classroom", "zone": "Zone A", "desc": "Ground Floor classroom R1."},
            {"code": "SW-ARYA-G-R2", "alt_key": "aryabhatta-ground:Room 2", "name": "Classroom R2", "category": "Classroom", "zone": "Zone A", "desc": "Ground Floor classroom R2."},
            {"code": "SW-ARYA-G-R3", "alt_key": "aryabhatta-ground:Room 3", "name": "Classroom R3", "category": "Classroom", "zone": "Zone B", "desc": "Ground Floor classroom R3."},
            {"code": "SW-ARYA-G-R4", "alt_key": "aryabhatta-ground:Room 4", "name": "Classroom R4", "category": "Classroom", "zone": "Zone A", "desc": "Ground Floor classroom R4."},
            {"code": "SW-ARYA-G-R5", "alt_key": "aryabhatta-ground:Room 5", "name": "Classroom R5", "category": "Classroom", "zone": "Zone A", "desc": "Ground Floor classroom R5."},
            {"code": "SW-ARYA-G-LAB", "alt_key": "aryabhatta-ground:Lab", "name": "Robotics & Automation Lab", "category": "Lab", "zone": "Zone B", "desc": "Mechatronics, drone testing, and robotics arena."},
            {"code": "SW-ARYA-G-TEMPLE", "alt_key": "aryabhatta-ground:Temple", "name": "Campus Garden & Temple Pavilion", "category": "Cultural", "zone": "Zone B", "desc": "Tranquil outdoor courtyard, pond, and prayer pavilion."},
            {"code": "SW-ARYA-G-BWC", "alt_key": "aryabhatta-ground:Boys Washroom", "name": "Boys Washrooms 1F", "category": "Restroom", "zone": "Zone A", "desc": "Ground floor male sanitation facilities."},
            {"code": "SW-ARYA-G-GWC", "alt_key": "aryabhatta-ground:Girls Washroom", "name": "Girls Washrooms 1F", "category": "Restroom", "zone": "Zone B", "desc": "Ground floor female sanitation facilities."},
            {"code": "SW-ARYA-G-LIFT", "alt_key": "aryabhatta-ground:Lift", "name": "Central Elevator Station", "category": "Vertical Transit", "zone": "Zone A", "desc": "Ground Floor passenger elevator lobby."},
            {"code": "SW-ARYA-G-STAIR1", "alt_key": "aryabhatta-ground:Stairs 1", "name": "Stairwell 1 (South)", "category": "Stairwell", "zone": "Zone A", "desc": "South wing stairwell leading to upper floors."},
            {"code": "SW-ARYA-G-STAIR2", "alt_key": "aryabhatta-ground:Stairs 2", "name": "Stairwell 2 (North)", "category": "Stairwell", "zone": "Zone B", "desc": "North wing stairwell leading to upper floors."}
        ]
    },

    # 06. Standard Building Graph Facility Checkpoints
    {
        "block_folder": "06_BuildingGraph_Facility_Checkpoints",
        "block_title": "Virtual Facility Nodes",
        "floor_name": "Level 1 & Level 2",
        "checkpoints": [
            {"code": "SW-ENT-MAIN", "alt_key": "campus:ent-main", "name": "Main Entrance Gate (1F)", "category": "Entrance", "zone": "Zone A", "desc": "College Main Gate entrance portal."},
            {"code": "SW-ENT-NORTH", "alt_key": "campus:ent-north", "name": "North Entrance / Back Yard (1F)", "category": "Entrance", "zone": "Zone A", "desc": "North garden gateway to Back Yard safe area."},
            {"code": "SW-LOBBY", "alt_key": "campus:lobby", "name": "Grand Lobby (1F)", "category": "Lobby", "zone": "Zone A", "desc": "West wing main lobby at Bhabha block."},
            {"code": "SW-RECEPTION", "alt_key": "campus:reception", "name": "Reception Desk & Cafe (1F)", "category": "Admin", "zone": "Zone A", "desc": "Visitor reception desk and Gauri Cafe."},
            {"code": "SW-ADMIN", "alt_key": "campus:admin", "name": "Admin Office & Ramanujan Wing (1F)", "category": "Admin", "zone": "Zone A", "desc": "Central administration building entrance."},
            {"code": "SW-CAFE", "alt_key": "campus:cafeteria", "name": "Central Dining Cafeteria (1F)", "category": "Dining", "zone": "Zone C", "desc": "Central dining hall at Aryabhatta block."},
            {"code": "SW-AUDITORIUM", "alt_key": "campus:auditorium", "name": "Campus Auditorium (1F)", "category": "Auditorium", "zone": "Zone C", "desc": "Main assembly auditorium and garden pavilion."},
            {"code": "SW-LAB101", "alt_key": "campus:lab-101", "name": "Lab 101 Physics & Raman Entry (1F)", "category": "Lab", "zone": "Zone B", "desc": "East Wing science lab 101 and Raman entry."},
            {"code": "SW-LAB102", "alt_key": "campus:lab-102", "name": "Lab 102 Robotics & Generator (1F)", "category": "Lab", "zone": "Zone B", "desc": "East Wing robotics lab and backup power facility."},
            {"code": "SW-LIFT1", "alt_key": "campus:lift-1", "name": "Campus Central Junction & Lift (1F)", "category": "Vertical Transit", "zone": "Zone C", "desc": "Central campus intersection elevator hub."},
            {"code": "SW-STAIRA1", "alt_key": "campus:stair-a-1", "name": "Stairwell A / Gate 2 Path (1F)", "category": "Stairwell", "zone": "Zone B", "desc": "East perimeter stairwell leading to 2F East Wing."},
            {"code": "SW-STAIRB1", "alt_key": "campus:stair-b-1", "name": "Stairwell B / Bhabha Path (1F)", "category": "Stairwell", "zone": "Zone A", "desc": "West wing stairwell leading to 2F West Wing."},
            {"code": "SW-RESTROOM1", "alt_key": "campus:restroom-1", "name": "Restrooms 1F / Kalpana Wing (1F)", "category": "Restroom", "zone": "Zone C", "desc": "Level 1 central restroom complex."},
            {"code": "SW-ROOM201", "alt_key": "campus:room-201", "name": "Room 201 Lecture Hall (2F)", "category": "Classroom", "zone": "Zone D", "desc": "West Wing 2F primary lecture hall."},
            {"code": "SW-ROOM202", "alt_key": "campus:room-202", "name": "Room 202 Computer Lab (2F)", "category": "Lab", "zone": "Zone D", "desc": "West Wing 2F computer lab facility."},
            {"code": "SW-ROOM203", "alt_key": "campus:room-203", "name": "Room 203 Conference Hall (2F)", "category": "Conference", "zone": "Zone D", "desc": "Central 2F academic conference hall."},
            {"code": "SW-ROOM204", "alt_key": "campus:room-204", "name": "Room 204 Faculty Lounge (2F)", "category": "Lounge", "zone": "Zone D", "desc": "Faculty lounge and collaborative study room."},
            {"code": "SW-LIBRARY", "alt_key": "campus:library", "name": "Central Library (2F)", "category": "Library", "zone": "Zone E", "desc": "East Wing 2F central library and stack rooms."},
            {"code": "SW-BOARDROOM", "alt_key": "campus:boardroom", "name": "Executive Boardroom (2F)", "category": "Executive", "zone": "Zone E", "desc": "Upper Level executive boardroom."},
            {"code": "SW-STUDY", "alt_key": "campus:study-lounge", "name": "Quiet Study Lounge (2F)", "category": "Study", "zone": "Zone E", "desc": "East Wing quiet study and reading lounge."},
            {"code": "SW-LIFT2", "alt_key": "campus:lift-2", "name": "Central Elevator (2F)", "category": "Vertical Transit", "zone": "Zone D", "desc": "Upper Level central passenger elevator station."},
            {"code": "SW-STAIRA2", "alt_key": "campus:stair-a-2", "name": "Stairwell A (2F)", "category": "Stairwell", "zone": "Zone E", "desc": "East Wing fire descent stairwell."},
            {"code": "SW-STAIRB2", "alt_key": "campus:stair-b-2", "name": "Stairwell B (2F)", "category": "Stairwell", "zone": "Zone D", "desc": "West Wing fire descent stairwell."},
            {"code": "SW-REFUGE2A", "alt_key": "campus:refuge-2a", "name": "Area of Refuge 2F (East)", "category": "Fire Refuge", "zone": "Zone E", "desc": "2-hour fire rated rescue assistance refuge with intercom."},
            {"code": "SW-REFUGE2B", "alt_key": "campus:refuge-2b", "name": "Area of Refuge 2F (West)", "category": "Fire Refuge", "zone": "Zone D", "desc": "2-hour fire rated rescue assistance refuge with intercom."}
        ]
    }
]

def make_qr_image(payload_str, output_png_path):
    """Generates a high quality QR Code PNG image."""
    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=12,
        border=3,
    )
    qr.add_data(payload_str)
    qr.make(fit=True)
    img = qr.make_image(fill_color="#0f172a", back_color="#ffffff")
    img.save(output_png_path)
    return output_png_path


class NumberedCanvas(canvas.Canvas):
    """Canvas that adds clean header/footer and page numbers to multi-page PDFs."""
    def __init__(self, *args, **kwargs):
        canvas.Canvas.__init__(self, *args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#64748b"))
        
        # Header banner line
        self.setStrokeColor(colors.HexColor("#cbd5e1"))
        self.setLineWidth(0.75)
        self.line(40, 745, 570, 745)
        self.drawString(40, 750, "SAFEWAY V3 / AEGISPATH - OFFICIAL INDOOR WAYPOINT SIGNAGE")
        self.drawRightString(570, 750, "SMART INDIA HACKATHON")

        # Footer line
        self.line(40, 45, 570, 45)
        self.setFont("Helvetica", 8)
        self.drawString(40, 32, "Scan with SafeWay Mobile App or Camera for Instant Positioning & Evacuation Route.")
        self.drawRightString(570, 32, f"Page {self._pageNumber} of {page_count}")
        self.restoreState()


def build_signage_elements(block_title, floor_name, cp, qr_img_path, is_single_page=False):
    """Builds the flowable elements for one checkpoint signage page."""
    elements = []
    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'CheckpointTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=colors.HexColor('#0f172a'),
        alignment=TA_CENTER,
        spaceAfter=4
    )
    block_style = ParagraphStyle(
        'BlockSub',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=colors.HexColor('#2563eb'),
        alignment=TA_CENTER,
        spaceAfter=10
    )
    desc_style = ParagraphStyle(
        'Desc',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13,
        textColor=colors.HexColor('#334155'),
        alignment=TA_CENTER,
        spaceAfter=8
    )
    code_style = ParagraphStyle(
        'CodeStr',
        parent=styles['Normal'],
        fontName='Courier-Bold',
        fontSize=12,
        leading=15,
        textColor=colors.HexColor('#1e293b'),
        alignment=TA_CENTER
    )
    alt_style = ParagraphStyle(
        'AltKey',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor('#64748b'),
        alignment=TA_CENTER
    )
    instruction_style = ParagraphStyle(
        'Instruct',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor('#1e40af'),
        alignment=TA_CENTER
    )

    elements.append(Spacer(1, 5))

    # Decorative Block Banner Box
    banner_data = [
        [
            Paragraph(f"<b>{block_title.upper()}</b>", ParagraphStyle('H1', fontName='Helvetica-Bold', fontSize=13, textColor=colors.white, alignment=TA_CENTER)),
        ],
        [
            Paragraph(f"<b>FLOOR: {floor_name.upper()} &nbsp;|&nbsp; ZONE: {cp['zone'].upper()}</b>", ParagraphStyle('H2', fontName='Helvetica-Bold', fontSize=9.5, textColor=colors.HexColor('#93c5fd'), alignment=TA_CENTER))
        ]
    ]
    banner_table = Table(banner_data, colWidths=[510])
    banner_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#1e3a8a')),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('ROUNDEDCORNERS', [6, 6, 6, 6]),
    ]))
    elements.append(banner_table)
    elements.append(Spacer(1, 10))

    # Checkpoint Title & Category
    clean_title = cp['name'].replace("&", "&amp;")
    elements.append(Paragraph(f"CHECKPOINT: <b>{clean_title}</b>", title_style))
    elements.append(Paragraph(f"CATEGORY: <b>{cp['category']}</b> &nbsp;&bull;&nbsp; ZONE: <b>{cp['zone']}</b>", block_style))
    elements.append(Paragraph(cp['desc'], desc_style))
    elements.append(Spacer(1, 6))

    # QR Code Frame Table
    qr_rl_img = RLImage(qr_img_path, width=2.7*inch, height=2.7*inch)
    qr_frame_data = [
        [qr_rl_img],
        [Paragraph(f"CHECKPOINT CODE: <b>{cp['code']}</b>", code_style)],
        [Paragraph(f"Positioning URI: {cp['alt_key']}", alt_style)]
    ]
    qr_frame_table = Table(qr_frame_data, colWidths=[310])
    qr_frame_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
        ('BOX', (0,0), (-1,-1), 2, colors.HexColor('#2563eb')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('ROUNDEDCORNERS', [10, 10, 10, 10])
    ]))
    elements.append(qr_frame_table)
    elements.append(Spacer(1, 10))

    # Scan & Emergency Instructions Box
    instructions_data = [
        [
            Paragraph(
                "<b>[HOW TO SCAN]</b> Open SafeWay / AegisPath Mobile App &gt; Tap <b>QR Scan</b> &gt; Point camera at code.<br/>"
                "<b>[EMERGENCY EVACUATION]</b> Scanning instantly re-computes your safest hazard-free exit route.",
                instruction_style
            )
        ]
    ]
    inst_table = Table(instructions_data, colWidths=[510])
    inst_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#eff6ff')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#bfdbfe')),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 12),
        ('RIGHTPADDING', (0,0), (-1,-1), 12),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('ROUNDEDCORNERS', [6, 6, 6, 6])
    ]))
    elements.append(inst_table)

    return elements


def generate_all_qr_and_pdfs():
    """Generates all folders, images, individual PDFs, and consolidated booklets."""
    os.makedirs(OUTPUT_ROOT, exist_ok=True)
    print(f"[*] Starting QR Code generation in: {OUTPUT_ROOT}")

    all_master_checkpoints = []

    # Iterate over blocks and floors
    for group in CHECKPOINTS_DATA:
        folder_name = group["block_folder"]
        block_title = group["block_title"]
        floor_name = group["floor_name"]
        checkpoints = group["checkpoints"]

        group_dir = os.path.join(OUTPUT_ROOT, folder_name)
        qr_images_dir = os.path.join(group_dir, "qr_images")
        individual_pdf_dir = os.path.join(group_dir, "individual_pdfs")
        os.makedirs(qr_images_dir, exist_ok=True)
        os.makedirs(individual_pdf_dir, exist_ok=True)

        print(f"\n[+] Processing Block: {block_title} - {floor_name} ({len(checkpoints)} checkpoints)")

        group_story_elements = []

        for idx, cp in enumerate(checkpoints, 1):
            safe_name = "".join(c if c.isalnum() or c in ("-", "_") else "_" for c in cp['name'])
            qr_filename = f"{cp['code']}_{safe_name}.png"
            qr_path = os.path.join(qr_images_dir, qr_filename)
            
            # Generate QR Code image (payload is canonical code string)
            make_qr_image(cp["code"], qr_path)

            # Generate individual 1-page PDF
            single_pdf_path = os.path.join(individual_pdf_dir, f"QR_{idx:02d}_{safe_name}.pdf")
            doc = SimpleDocTemplate(
                single_pdf_path,
                pagesize=letter,
                leftMargin=35,
                rightMargin=35,
                topMargin=45,
                bottomMargin=45
            )
            single_story = build_signage_elements(block_title, floor_name, cp, qr_path, is_single_page=True)
            doc.build(single_story, canvasmaker=NumberedCanvas)

            # Accumulate for multi-page floor / block PDF
            group_story_elements.extend(build_signage_elements(block_title, floor_name, cp, qr_path))
            group_story_elements.append(PageBreak())

            # For master handbook
            all_master_checkpoints.append({
                "block_title": block_title,
                "floor_name": floor_name,
                "cp": cp,
                "qr_path": qr_path
            })

        # Generate Floor / Block Consolidated PDF Booklet
        floor_safe = "".join(c if c.isalnum() else "_" for c in floor_name)
        block_safe = "".join(c if c.isalnum() else "_" for c in block_title)
        floor_booklet_path = os.path.join(group_dir, f"{block_safe}_{floor_safe}_QR_Signage_Booklet.pdf")
        
        # Strip trailing PageBreak
        if group_story_elements and isinstance(group_story_elements[-1], PageBreak):
            group_story_elements.pop()

        doc_group = SimpleDocTemplate(
            floor_booklet_path,
            pagesize=letter,
            leftMargin=35,
            rightMargin=35,
            topMargin=45,
            bottomMargin=45
        )
        doc_group.build(group_story_elements, canvasmaker=NumberedCanvas)
        print(f"    [OK] Created Floor Booklet: {os.path.basename(floor_booklet_path)}")

    # Generate Combined Block-Level Booklets for blocks with multiple floors
    block_groups = {}
    for item in all_master_checkpoints:
        b = item["block_title"]
        block_groups.setdefault(b, []).append(item)

    for block_title, items in block_groups.items():
        matched_folder = None
        for g in CHECKPOINTS_DATA:
            if g["block_title"] == block_title:
                matched_folder = g["block_folder"]
                break
        
        if matched_folder:
            block_dir = os.path.join(OUTPUT_ROOT, matched_folder)
            block_safe = "".join(c if c.isalnum() else "_" for c in block_title)
            combined_block_pdf = os.path.join(block_dir, f"{block_safe}_Complete_All_Floors_QR_Booklet.pdf")
            
            combined_story = []
            for item in items:
                combined_story.extend(build_signage_elements(item["block_title"], item["floor_name"], item["cp"], item["qr_path"]))
                combined_story.append(PageBreak())
            if combined_story and isinstance(combined_story[-1], PageBreak):
                combined_story.pop()

            doc_combined = SimpleDocTemplate(
                combined_block_pdf,
                pagesize=letter,
                leftMargin=35,
                rightMargin=35,
                topMargin=45,
                bottomMargin=45
            )
            doc_combined.build(combined_story, canvasmaker=NumberedCanvas)
            print(f"[OK] Created Complete Block Booklet: {os.path.basename(combined_block_pdf)}")

    # Generate Master All-Campus Handbook PDF
    master_pdf_path = os.path.join(OUTPUT_ROOT, "SafeWay_Master_All_Campus_QR_Handbook.pdf")
    master_story = []
    
    # Title Cover Page
    styles = getSampleStyleSheet()
    cover_title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=26,
        leading=32,
        textColor=colors.HexColor('#1e3a8a'),
        alignment=TA_CENTER,
        spaceAfter=12
    )
    cover_sub_style = ParagraphStyle(
        'CoverSub',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=13,
        leading=17,
        textColor=colors.HexColor('#475569'),
        alignment=TA_CENTER,
        spaceAfter=25
    )
    master_story.append(Spacer(1, 80))
    master_story.append(Paragraph("SAFEWAY V3 / AEGISPATH", cover_title_style))
    master_story.append(Paragraph("<b>Complete College Campus QR Checkpoint Handbook</b>", ParagraphStyle('H2', fontName='Helvetica-Bold', fontSize=16, leading=20, textColor=colors.HexColor('#0f172a'), alignment=TA_CENTER, spaceAfter=12)))
    master_story.append(Paragraph("Comprehensive Printable Signage &amp; Emergency Waypoints for All Academic Blocks, Labs, Classrooms &amp; Evacuation Exits", cover_sub_style))
    master_story.append(Spacer(1, 30))

    meta_table_data = [
        [Paragraph("<b>Total Checkpoints Registered:</b>", styles['Normal']), Paragraph(f"<b>{len(all_master_checkpoints)} QR Waypoints</b>", styles['Normal'])],
        [Paragraph("<b>Covered Blocks:</b>", styles['Normal']), Paragraph("Campus Outdoor, Ramanujan Block, Bhabha Block, Kalpana Chawla Block, Raman Block, Aryabhatta Block, Virtual Facility Nodes", styles['Normal'])],
        [Paragraph("<b>Target System:</b>", styles['Normal']), Paragraph("SafeWay Indoor Navigation &amp; Crowd-Aware Evacuation Platform (SIH)", styles['Normal'])],
        [Paragraph("<b>Print Recommendation:</b>", styles['Normal']), Paragraph("A4 / Letter Color Laminate, mount at eye-level (1.5m) beside doorways &amp; junctions", styles['Normal'])]
    ]
    meta_table = Table(meta_table_data, colWidths=[180, 330])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f1f5f9')),
        ('BOX', (0,0), (-1,-1), 1.5, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('PADDING', (0,0), (-1,-1), 8),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('ROUNDEDCORNERS', [8, 8, 8, 8])
    ]))
    master_story.append(meta_table)
    master_story.append(PageBreak())

    # Append all checkpoints to master
    for item in all_master_checkpoints:
        master_story.extend(build_signage_elements(item["block_title"], item["floor_name"], item["cp"], item["qr_path"]))
        master_story.append(PageBreak())
    
    if master_story and isinstance(master_story[-1], PageBreak):
        master_story.pop()

    doc_master = SimpleDocTemplate(
        master_pdf_path,
        pagesize=letter,
        leftMargin=35,
        rightMargin=35,
        topMargin=45,
        bottomMargin=45
    )
    doc_master.build(master_story, canvasmaker=NumberedCanvas)
    print(f"\n[DONE] Master All-Campus Handbook Generated: {master_pdf_path} ({len(all_master_checkpoints)} Checkpoints)")

    return len(all_master_checkpoints)

if __name__ == "__main__":
    count = generate_all_qr_and_pdfs()
    print(f"\n[SUCCESS] Generated {count} QR Codes and PDFs.")
