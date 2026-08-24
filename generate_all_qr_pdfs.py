import os
import qrcode
from PIL import Image
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image as RLImage, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
QR_OUTPUT_DIR = os.path.join(BASE_DIR, "qr_codes")

CHECKPOINTS = {
    "Campus_Outdoor": {
        "title": "Main College Campus Grounds",
        "items": [
            {"code": "SW-CAMPUS-GATE1", "name": "College Main Entrance Gate", "floor": "Ground Floor", "zone": "South Perimeter", "type": "Campus Gate", "mapId": "campus", "nodeId": "ent-main"},
            {"code": "SW-CAMPUS-GATE2", "name": "Gate No. 2 (East)", "floor": "Ground Floor", "zone": "East Perimeter", "type": "Campus Gate", "mapId": "campus", "nodeId": "gate-2-destination"},
            {"code": "SW-CAMPUS-SAFE1", "name": "Playground Safe Assembly Area", "floor": "Ground Floor", "zone": "North Open Ground", "type": "Emergency Assembly", "mapId": "campus", "nodeId": "playground"},
            {"code": "SW-CAMPUS-SAFE2", "name": "Back Yard Safe Assembly Area", "floor": "Ground Floor", "zone": "West Open Ground", "type": "Emergency Assembly", "mapId": "campus", "nodeId": "ent-north"},
            {"code": "SW-CAMPUS-CAFE", "name": "Gauri Cafe & ATM Junction", "floor": "Ground Floor", "zone": "Central Circulation", "type": "Commercial / Amenity", "mapId": "campus", "nodeId": "reception"},
            {"code": "SW-CAMPUS-GARDEN", "name": "Garden, Pond & Mandir", "floor": "Ground Floor", "zone": "South-East Grounds", "type": "Landmark / Recreation", "mapId": "campus", "nodeId": "auditorium"},
            {"code": "SW-CAMPUS-JUNCTION", "name": "Campus Central Junction", "floor": "Ground Floor", "zone": "Main Pathway Crossway", "type": "Wayfinding Hub", "mapId": "campus", "nodeId": "lift-1"},
            {"code": "SW-CAMPUS-RAMAN", "name": "Ramanujan Block Front Entrance", "floor": "Ground Floor", "zone": "North Academic Wing", "type": "Building Gateway", "mapId": "campus", "nodeId": "admin"},
            {"code": "SW-CAMPUS-BHABHA", "name": "Bhabha Block Front Entrance", "floor": "Ground Floor", "zone": "South-West Academic Wing", "type": "Building Gateway", "mapId": "campus", "nodeId": "lobby"},
            {"code": "SW-CAMPUS-KALPANA", "name": "Kalpana Chawla Block Front Entrance", "floor": "Ground Floor", "zone": "North Academic Wing", "type": "Building Gateway", "mapId": "campus", "nodeId": "restroom-1"},
            {"code": "SW-CAMPUS-RAMANB", "name": "Raman Block Front Entrance", "floor": "Ground Floor", "zone": "North-East Academic Wing", "type": "Building Gateway", "mapId": "campus", "nodeId": "lab-101"},
            {"code": "SW-CAMPUS-ARYA", "name": "Aryabhatta Block Front Entrance", "floor": "Ground Floor", "zone": "South-East Academic Wing", "type": "Building Gateway", "mapId": "campus", "nodeId": "cafeteria"}
        ]
    },
    "Ramanujan_Block": {
        "title": "Ramanujan Block (Ground, 1F, Basement)",
        "items": [
            # Ground Floor
            {"code": "SW-RAM-G-R1", "name": "Classroom R1", "floor": "Ground Floor", "zone": "Ramanujan Block", "type": "Classroom", "mapId": "ramanujan-ground", "room": "R1"},
            {"code": "SW-RAM-G-R2", "name": "Classroom R2", "floor": "Ground Floor", "zone": "Ramanujan Block", "type": "Classroom", "mapId": "ramanujan-ground", "room": "R2"},
            {"code": "SW-RAM-G-R3", "name": "Classroom R3", "floor": "Ground Floor", "zone": "Ramanujan Block", "type": "Classroom", "mapId": "ramanujan-ground", "room": "R3"},
            {"code": "SW-RAM-G-R4", "name": "Classroom R4", "floor": "Ground Floor", "zone": "Ramanujan Block", "type": "Classroom", "mapId": "ramanujan-ground", "room": "R4"},
            {"code": "SW-RAM-G-R6", "name": "Classroom R6", "floor": "Ground Floor", "zone": "Ramanujan Block", "type": "Classroom", "mapId": "ramanujan-ground", "room": "R6"},
            {"code": "SW-RAM-G-R7", "name": "Classroom R7", "floor": "Ground Floor", "zone": "Ramanujan Block", "type": "Classroom", "mapId": "ramanujan-ground", "room": "R7"},
            {"code": "SW-RAM-G-R8", "name": "Classroom R8", "floor": "Ground Floor", "zone": "Ramanujan Block", "type": "Classroom", "mapId": "ramanujan-ground", "room": "R8"},
            {"code": "SW-RAM-G-R9", "name": "Classroom R9", "floor": "Ground Floor", "zone": "Ramanujan Block", "type": "Classroom", "mapId": "ramanujan-ground", "room": "R9"},
            {"code": "SW-RAM-G-R10", "name": "Classroom R10", "floor": "Ground Floor", "zone": "Ramanujan Block", "type": "Classroom", "mapId": "ramanujan-ground", "room": "R10"},
            {"code": "SW-RAM-G-R11", "name": "Classroom R11", "floor": "Ground Floor", "zone": "Ramanujan Block", "type": "Classroom", "mapId": "ramanujan-ground", "room": "R11"},
            {"code": "SW-RAM-G-R12", "name": "Classroom R12", "floor": "Ground Floor", "zone": "Ramanujan Block", "type": "Classroom", "mapId": "ramanujan-ground", "room": "R12"},
            {"code": "SW-RAM-G-W1", "name": "Washroom W1 (East)", "floor": "Ground Floor", "zone": "Ramanujan Block", "type": "Restroom", "mapId": "ramanujan-ground", "room": "W1"},
            {"code": "SW-RAM-G-W2", "name": "Washroom W2 (West)", "floor": "Ground Floor", "zone": "Ramanujan Block", "type": "Restroom", "mapId": "ramanujan-ground", "room": "W2"},
            {"code": "SW-RAM-G-COURT", "name": "Badminton Court", "floor": "Ground Floor", "zone": "Ramanujan Block", "type": "Sports Facility", "mapId": "ramanujan-ground", "room": "Badminton Court"},
            {"code": "SW-RAM-G-LIFT", "name": "Elevator Lobby (Ground)", "floor": "Ground Floor", "zone": "Ramanujan Block", "type": "Vertical Transit", "mapId": "ramanujan-ground", "room": "Lift"},
            {"code": "SW-RAM-G-ENT1", "name": "Entry / Exit 1 (Main Gate)", "floor": "Ground Floor", "zone": "Ramanujan Block", "type": "Main Exit Door", "mapId": "ramanujan-ground", "room": "Entry / Exit 1"},
            {"code": "SW-RAM-G-ENT2", "name": "Entry / Exit 2 (East)", "floor": "Ground Floor", "zone": "Ramanujan Block", "type": "Emergency Door", "mapId": "ramanujan-ground", "room": "Entry / Exit 2"},
            {"code": "SW-RAM-G-ENT3", "name": "Entry / Exit 3 (South)", "floor": "Ground Floor", "zone": "Ramanujan Block", "type": "Emergency Door", "mapId": "ramanujan-ground", "room": "Entry / Exit 3"},

            # First Floor
            {"code": "SW-RAM-1F-DRAWING", "name": "Drawing Laboratory", "floor": "First Floor (1F)", "zone": "Ramanujan Block", "type": "Engineering Lab", "mapId": "ramanujan-first", "room": "Drawing Lab"},
            {"code": "SW-RAM-1F-LT1", "name": "Lecture Theatre LT 1", "floor": "First Floor (1F)", "zone": "Ramanujan Block", "type": "Lecture Theatre", "mapId": "ramanujan-first", "room": "LT 1"},
            {"code": "SW-RAM-1F-LT2", "name": "Lecture Theatre LT 2", "floor": "First Floor (1F)", "zone": "Ramanujan Block", "type": "Lecture Theatre", "mapId": "ramanujan-first", "room": "LT 2"},
            {"code": "SW-RAM-1F-LT3", "name": "Lecture Theatre LT 3", "floor": "First Floor (1F)", "zone": "Ramanujan Block", "type": "Lecture Theatre", "mapId": "ramanujan-first", "room": "LT 3"},
            {"code": "SW-RAM-1F-LT4", "name": "Lecture Theatre LT 4", "floor": "First Floor (1F)", "zone": "Ramanujan Block", "type": "Lecture Theatre", "mapId": "ramanujan-first", "room": "LT 4"},
            {"code": "SW-RAM-1F-BOYSWC", "name": "Boys Washroom (1F)", "floor": "First Floor (1F)", "zone": "Ramanujan Block", "type": "Restroom", "mapId": "ramanujan-first", "room": "Boys W/C"},
            {"code": "SW-RAM-1F-GIRLSWC", "name": "Girls Washroom (1F)", "floor": "First Floor (1F)", "zone": "Ramanujan Block", "type": "Restroom", "mapId": "ramanujan-first", "room": "Girls W/C"},
            {"code": "SW-RAM-1F-LIFT", "name": "Elevator Lobby (1F)", "floor": "First Floor (1F)", "zone": "Ramanujan Block", "type": "Vertical Transit", "mapId": "ramanujan-first", "room": "Lift"},
            {"code": "SW-RAM-1F-STAIRS", "name": "East Stairwell (1F)", "floor": "First Floor (1F)", "zone": "Ramanujan Block", "type": "Stairway", "mapId": "ramanujan-first", "room": "Stairs"},
            {"code": "SW-RAM-1F-EXIT", "name": "First Floor Egress Gate", "floor": "First Floor (1F)", "zone": "Ramanujan Block", "type": "Floor Exit", "mapId": "ramanujan-first", "room": "Entry / Exit"},

            # Basement
            {"code": "SW-RAM-B-LAB1", "name": "Computer Lab 1 (Basement)", "floor": "Basement", "zone": "Ramanujan Block", "type": "Laboratory", "mapId": "ramanujan-basement", "room": "Lab 1"},
            {"code": "SW-RAM-B-LAB2", "name": "Computer Lab 2 (Basement)", "floor": "Basement", "zone": "Ramanujan Block", "type": "Laboratory", "mapId": "ramanujan-basement", "room": "Lab 2"},
            {"code": "SW-RAM-B-LAB3", "name": "Computer Lab 3 (Basement)", "floor": "Basement", "zone": "Ramanujan Block", "type": "Laboratory", "mapId": "ramanujan-basement", "room": "Lab 3"},
            {"code": "SW-RAM-B-LAB4", "name": "Computer Lab 4 (Basement)", "floor": "Basement", "zone": "Ramanujan Block", "type": "Laboratory", "mapId": "ramanujan-basement", "room": "Lab 4"},
            {"code": "SW-RAM-B-LAB5", "name": "Computer Lab 5 (Basement)", "floor": "Basement", "zone": "Ramanujan Block", "type": "Laboratory", "mapId": "ramanujan-basement", "room": "Lab 5"},
            {"code": "SW-RAM-B-LAB6", "name": "Computer Lab 6 (Basement)", "floor": "Basement", "zone": "Ramanujan Block", "type": "Laboratory", "mapId": "ramanujan-basement", "room": "Lab 6"},
            {"code": "SW-RAM-B-LIFT", "name": "Basement Elevator Lobby", "floor": "Basement", "zone": "Ramanujan Block", "type": "Vertical Transit", "mapId": "ramanujan-basement", "room": "Lift"},
            {"code": "SW-RAM-B-STAIR1", "name": "Stairs 1 (North Basement)", "floor": "Basement", "zone": "Ramanujan Block", "type": "Stairway", "mapId": "ramanujan-basement", "room": "Stairs 1"},
            {"code": "SW-RAM-B-STAIR2", "name": "Stairs 2 (South Basement)", "floor": "Basement", "zone": "Ramanujan Block", "type": "Stairway", "mapId": "ramanujan-basement", "room": "Stairs 2"},
            {"code": "SW-RAM-B-EXIT", "name": "Basement Emergency Egress", "floor": "Basement", "zone": "Ramanujan Block", "type": "Emergency Door", "mapId": "ramanujan-basement", "room": "Exit"}
        ]
    },
    "Bhabha_Block": {
        "title": "Bhabha Block (Ground, 1F, Basement)",
        "items": [
            # Ground Floor
            {"code": "SW-BHA-G-LH1", "name": "Lecture Hall 1", "floor": "Ground Floor", "zone": "Bhabha Block", "type": "Lecture Hall", "mapId": "bhabha-ground", "room": "Lecture Hall 1"},
            {"code": "SW-BHA-G-LH2", "name": "Lecture Hall 2", "floor": "Ground Floor", "zone": "Bhabha Block", "type": "Lecture Hall", "mapId": "bhabha-ground", "room": "Lecture Hall 2"},
            {"code": "SW-BHA-G-RECEPTION", "name": "Central Reception & Enquiries", "floor": "Ground Floor", "zone": "Bhabha Block", "type": "Administrative Office", "mapId": "bhabha-ground", "room": "Reception"},
            {"code": "SW-BHA-G-REGISTRAR", "name": "Registrar Office", "floor": "Ground Floor", "zone": "Bhabha Block", "type": "Administrative Office", "mapId": "bhabha-ground", "room": "Registrar"},
            {"code": "SW-BHA-G-DIRECTOR", "name": "Director Office", "floor": "Ground Floor", "zone": "Bhabha Block", "type": "Executive Office", "mapId": "bhabha-ground", "room": "Director Office"},
            {"code": "SW-BHA-G-ADMISSION", "name": "Admission Cell", "floor": "Ground Floor", "zone": "Bhabha Block", "type": "Student Services", "mapId": "bhabha-ground", "room": "Admission Cell"},
            {"code": "SW-BHA-G-SITTING", "name": "Main Sitting Hall", "floor": "Ground Floor", "zone": "Bhabha Block", "type": "Waiting Lounge", "mapId": "bhabha-ground", "room": "Sitting Hall"},
            {"code": "SW-BHA-G-WATER", "name": "Drinking Water Station", "floor": "Ground Floor", "zone": "Bhabha Block", "type": "Facility", "mapId": "bhabha-ground", "room": "Drinking Water"},
            {"code": "SW-BHA-G-STAIR1", "name": "Stairs 1 (West Wing)", "floor": "Ground Floor", "zone": "Bhabha Block", "type": "Stairway", "mapId": "bhabha-ground", "room": "Stairs 1"},
            {"code": "SW-BHA-G-STAIR2", "name": "Stairs 2 (East Wing)", "floor": "Ground Floor", "zone": "Bhabha Block", "type": "Stairway", "mapId": "bhabha-ground", "room": "Stairs 2"},
            {"code": "SW-BHA-G-ENTRY", "name": "Main Ground Entry", "floor": "Ground Floor", "zone": "Bhabha Block", "type": "Building Entry", "mapId": "bhabha-ground", "room": "Entry"},

            # First Floor
            {"code": "SW-BHA-1F-HODME", "name": "HOD Mechanical Engineering", "floor": "First Floor (1F)", "zone": "Bhabha Block", "type": "Department Office", "mapId": "bhabha-first", "room": "HOD ME"},
            {"code": "SW-BHA-1F-LT1", "name": "Lecture Theatre LT 1", "floor": "First Floor (1F)", "zone": "Bhabha Block", "type": "Lecture Theatre", "mapId": "bhabha-first", "room": "LT 1"},
            {"code": "SW-BHA-1F-LT2", "name": "Lecture Theatre LT 2", "floor": "First Floor (1F)", "zone": "Bhabha Block", "type": "Lecture Theatre", "mapId": "bhabha-first", "room": "LT 2"},
            {"code": "SW-BHA-1F-LT3", "name": "Lecture Theatre LT 3", "floor": "First Floor (1F)", "zone": "Bhabha Block", "type": "Lecture Theatre", "mapId": "bhabha-first", "room": "LT 3"},
            {"code": "SW-BHA-1F-FACULTY", "name": "Faculty Cabins", "floor": "First Floor (1F)", "zone": "Bhabha Block", "type": "Faculty Area", "mapId": "bhabha-first", "room": "Faculty Cabins"},
            {"code": "SW-BHA-1F-ECELAB", "name": "ECE Hardware Lab", "floor": "First Floor (1F)", "zone": "Bhabha Block", "type": "Laboratory", "mapId": "bhabha-first", "room": "ECE Lab"},
            {"code": "SW-BHA-1F-STAIRS", "name": "Central Stairs (1F)", "floor": "First Floor (1F)", "zone": "Bhabha Block", "type": "Stairway", "mapId": "bhabha-first", "room": "Stairs"},
            {"code": "SW-BHA-1F-EXIT1", "name": "First Floor Exit Door 1", "floor": "First Floor (1F)", "zone": "Bhabha Block", "type": "Floor Exit", "mapId": "bhabha-first", "room": "Entry / Exit 1"},

            # Basement
            {"code": "SW-BHA-B-DIGILIB", "name": "Digital Library & E-Resource Center", "floor": "Basement", "zone": "Bhabha Block", "type": "Library Facility", "mapId": "bhabha-basement", "room": "Digital Library"},
            {"code": "SW-BHA-B-LIBRARY", "name": "Reference Library", "floor": "Basement", "zone": "Bhabha Block", "type": "Library Facility", "mapId": "bhabha-basement", "room": "Library"},
            {"code": "SW-BHA-B-MAINLIB", "name": "Main Library Stack Hall", "floor": "Basement", "zone": "Bhabha Block", "type": "Library Facility", "mapId": "bhabha-basement", "room": "Main Library"},
            {"code": "SW-BHA-B-LOBBY", "name": "Library Corridor & Reading Lobby", "floor": "Basement", "zone": "Bhabha Block", "type": "Circulation", "mapId": "bhabha-basement", "room": "Lobby / Corridor"},
            {"code": "SW-BHA-B-ENTRY", "name": "Basement Library Entry Gate", "floor": "Basement", "zone": "Bhabha Block", "type": "Library Entry", "mapId": "bhabha-basement", "room": "Entry Gate"},
            {"code": "SW-BHA-B-EXIT", "name": "Basement Library Emergency Exit", "floor": "Basement", "zone": "Bhabha Block", "type": "Emergency Door", "mapId": "bhabha-basement", "room": "Exit"}
        ]
    },
    "Kalpana_Chawla_Block": {
        "title": "Kalpana Chawla Block (Ground, 1F, Basement)",
        "items": [
            # Ground Floor
            {"code": "SW-KAL-G-LT1", "name": "Lecture Theatre LT 1", "floor": "Ground Floor", "zone": "Kalpana Block", "type": "Lecture Theatre", "mapId": "kalpana-ground", "room": "LT 1"},
            {"code": "SW-KAL-G-LT2", "name": "Lecture Theatre LT 2", "floor": "Ground Floor", "zone": "Kalpana Block", "type": "Lecture Theatre", "mapId": "kalpana-ground", "room": "LT 2"},
            {"code": "SW-KAL-G-LT3", "name": "Lecture Theatre LT 3", "floor": "Ground Floor", "zone": "Kalpana Block", "type": "Lecture Theatre", "mapId": "kalpana-ground", "room": "LT 3"},
            {"code": "SW-KAL-G-CCPD1", "name": "CCPD Hall 1", "floor": "Ground Floor", "zone": "Kalpana Block", "type": "Training Center", "mapId": "kalpana-ground", "room": "CCPD 1"},
            {"code": "SW-KAL-G-CCPD2", "name": "CCPD Hall 2", "floor": "Ground Floor", "zone": "Kalpana Block", "type": "Training Center", "mapId": "kalpana-ground", "room": "CCPD 2"},
            {"code": "SW-KAL-G-COMPLAB1", "name": "Computer Lab 1", "floor": "Ground Floor", "zone": "Kalpana Block", "type": "Computer Lab", "mapId": "kalpana-ground", "room": "Computer Lab 1"},
            {"code": "SW-KAL-G-HODCSE", "name": "HOD Computer Science & Eng.", "floor": "Ground Floor", "zone": "Kalpana Block", "type": "Department Office", "mapId": "kalpana-ground", "room": "HOD CSE"},
            {"code": "SW-KAL-G-LIFT", "name": "Ground Elevator Lobby", "floor": "Ground Floor", "zone": "Kalpana Block", "type": "Vertical Transit", "mapId": "kalpana-ground", "room": "Lift"},
            {"code": "SW-KAL-G-STAIRS", "name": "Main Stairwell", "floor": "Ground Floor", "zone": "Kalpana Block", "type": "Stairway", "mapId": "kalpana-ground", "room": "Stairs"},
            {"code": "SW-KAL-G-ENTRY", "name": "South Main Entrance", "floor": "Ground Floor", "zone": "Kalpana Block", "type": "Building Entry", "mapId": "kalpana-ground", "room": "Entry"},
            {"code": "SW-KAL-G-EMERGENCY", "name": "North Emergency Exit Door", "floor": "Ground Floor", "zone": "Kalpana Block", "type": "Emergency Door", "mapId": "kalpana-ground", "room": "Emergency Exit"},

            # First Floor
            {"code": "SW-KAL-1F-TRAIN1", "name": "Training Hall 1", "floor": "First Floor (1F)", "zone": "Kalpana Block", "type": "Training Center", "mapId": "kalpana-first", "room": "Training Hall 1"},
            {"code": "SW-KAL-1F-TRAIN2", "name": "Training Hall 2", "floor": "First Floor (1F)", "zone": "Kalpana Block", "type": "Training Center", "mapId": "kalpana-first", "room": "Training Hall 2"},
            {"code": "SW-KAL-1F-CR1", "name": "Classroom 1", "floor": "First Floor (1F)", "zone": "Kalpana Block", "type": "Classroom", "mapId": "kalpana-first", "room": "Class Room 1"},
            {"code": "SW-KAL-1F-CR2", "name": "Classroom 2", "floor": "First Floor (1F)", "zone": "Kalpana Block", "type": "Classroom", "mapId": "kalpana-first", "room": "Class Room 2"},
            {"code": "SW-KAL-1F-CR3", "name": "Classroom 3", "floor": "First Floor (1F)", "zone": "Kalpana Block", "type": "Classroom", "mapId": "kalpana-first", "room": "Class Room 3"},
            {"code": "SW-KAL-1F-CR4", "name": "Classroom 4", "floor": "First Floor (1F)", "zone": "Kalpana Block", "type": "Classroom", "mapId": "kalpana-first", "room": "Class Room 4"},
            {"code": "SW-KAL-1F-STORE", "name": "Department Store Room", "floor": "First Floor (1F)", "zone": "Kalpana Block", "type": "Utility", "mapId": "kalpana-first", "room": "Store"},
            {"code": "SW-KAL-1F-STAIRS", "name": "West Stairwell (1F)", "floor": "First Floor (1F)", "zone": "Kalpana Block", "type": "Stairway", "mapId": "kalpana-first", "room": "Entry / Exit"},

            # Basement
            {"code": "SW-KAL-B-FLUIDLAB", "name": "Fluid Mechanics Lab", "floor": "Basement", "zone": "Kalpana Block", "type": "Engineering Lab", "mapId": "kalpana-basement", "room": "Fluid Mechanics Lab"},
            {"code": "SW-KAL-B-COMP1", "name": "Computer Lab 1 (Basement)", "floor": "Basement", "zone": "Kalpana Block", "type": "Computer Lab", "mapId": "kalpana-basement", "room": "Computer Lab 1"},
            {"code": "SW-KAL-B-COMP2", "name": "Computer Lab 2 (Basement)", "floor": "Basement", "zone": "Kalpana Block", "type": "Computer Lab", "mapId": "kalpana-basement", "room": "Computer Lab 2"},
            {"code": "SW-KAL-B-AUTOLAB", "name": "Automobile Engineering Lab", "floor": "Basement", "zone": "Kalpana Block", "type": "Engineering Lab", "mapId": "kalpana-basement", "room": "Automobile Lab"},
            {"code": "SW-KAL-B-STORE", "name": "Central Store Room", "floor": "Basement", "zone": "Kalpana Block", "type": "Utility", "mapId": "kalpana-basement", "room": "Store Room"},
            {"code": "SW-KAL-B-LIFT", "name": "Basement Elevator Lobby", "floor": "Basement", "zone": "Kalpana Block", "type": "Vertical Transit", "mapId": "kalpana-basement", "room": "Lift"},
            {"code": "SW-KAL-B-EXIT", "name": "Basement Main Exit Door", "floor": "Basement", "zone": "Kalpana Block", "type": "Emergency Door", "mapId": "kalpana-basement", "room": "Entry / Exit"}
        ]
    },
    "Raman_Block": {
        "title": "Raman Block (Ground, 1F)",
        "items": [
            # Ground Floor
            {"code": "SW-RAMAN-G-LH1", "name": "Lecture Hall 1", "floor": "Ground Floor", "zone": "Raman Block", "type": "Lecture Hall", "mapId": "raman-ground", "room": "Lecture Hall 1"},
            {"code": "SW-RAMAN-G-LH2", "name": "Lecture Hall 2", "floor": "Ground Floor", "zone": "Raman Block", "type": "Lecture Hall", "mapId": "raman-ground", "room": "Lecture Hall 2"},
            {"code": "SW-RAMAN-G-SAMVAAD", "name": "Samvaad Literary Club", "floor": "Ground Floor", "zone": "Raman Block", "type": "Student Activity Club", "mapId": "raman-ground", "room": "Samvaad Club"},
            {"code": "SW-RAMAN-G-KALAKRIT", "name": "Kalakrit Cultural Club", "floor": "Ground Floor", "zone": "Raman Block", "type": "Student Activity Club", "mapId": "raman-ground", "room": "Kalakrit Club"},
            {"code": "SW-RAMAN-G-MEDICAL", "name": "Campus Medical & First Aid Room", "floor": "Ground Floor", "zone": "Raman Block", "type": "Healthcare / Medical", "mapId": "raman-ground", "room": "Medical Room"},
            {"code": "SW-RAMAN-G-WATER", "name": "Drinking Water Point", "floor": "Ground Floor", "zone": "Raman Block", "type": "Facility", "mapId": "raman-ground", "room": "Drinking Water"},
            {"code": "SW-RAMAN-G-LIFT", "name": "Elevator Lobby", "floor": "Ground Floor", "zone": "Raman Block", "type": "Vertical Transit", "mapId": "raman-ground", "room": "Lift"},
            {"code": "SW-RAMAN-G-STAIRS", "name": "East Stairwell", "floor": "Ground Floor", "zone": "Raman Block", "type": "Stairway", "mapId": "raman-ground", "room": "Stairs"},
            {"code": "SW-RAMAN-G-EXIT1", "name": "Raman Main Exit Door 1", "floor": "Ground Floor", "zone": "Raman Block", "type": "Main Exit", "mapId": "raman-ground", "room": "Entry / Exit 1"},
            {"code": "SW-RAMAN-G-EXIT2", "name": "Raman East Exit Door 2", "floor": "Ground Floor", "zone": "Raman Block", "type": "Emergency Door", "mapId": "raman-ground", "room": "Entry / Exit 2"},

            # First Floor
            {"code": "SW-RAMAN-1F-AUDI", "name": "Grand Auditorium Hall", "floor": "First Floor (1F)", "zone": "Raman Block", "type": "Auditorium / Theatre", "mapId": "raman-first", "room": "Auditorium Hall"},
            {"code": "SW-RAMAN-1F-LH", "name": "Seminar Lecture Hall", "floor": "First Floor (1F)", "zone": "Raman Block", "type": "Lecture Hall", "mapId": "raman-first", "room": "Lecture Hall"},
            {"code": "SW-RAMAN-1F-WATER", "name": "Drinking Water Point (1F)", "floor": "First Floor (1F)", "zone": "Raman Block", "type": "Facility", "mapId": "raman-first", "room": "Drinking Water"},
            {"code": "SW-RAMAN-1F-LIFT", "name": "Elevator Lobby (1F)", "floor": "First Floor (1F)", "zone": "Raman Block", "type": "Vertical Transit", "mapId": "raman-first", "room": "Lift"},
            {"code": "SW-RAMAN-1F-STAIRS", "name": "Stairwell (1F)", "floor": "First Floor (1F)", "zone": "Raman Block", "type": "Stairway", "mapId": "raman-first", "room": "Stairs"},
            {"code": "SW-RAMAN-1F-EXIT1", "name": "Auditorium Exit 1", "floor": "First Floor (1F)", "zone": "Raman Block", "type": "Floor Exit", "mapId": "raman-first", "room": "Entry / Exit 1"}
        ]
    },
    "Aryabhatta_Block": {
        "title": "Aryabhatta Block (Ground, Basement)",
        "items": [
            # Ground Floor
            {"code": "SW-ARYA-G-LARGEROOM", "name": "Large Multipurpose Hall", "floor": "Ground Floor", "zone": "Aryabhatta Block", "type": "Seminar Hall", "mapId": "aryabhatta-ground", "room": "Large Room"},
            {"code": "SW-ARYA-G-CR1", "name": "Classroom 1", "floor": "Ground Floor", "zone": "Aryabhatta Block", "type": "Classroom", "mapId": "aryabhatta-ground", "room": "Room 1"},
            {"code": "SW-ARYA-G-CR2", "name": "Classroom 2", "floor": "Ground Floor", "zone": "Aryabhatta Block", "type": "Classroom", "mapId": "aryabhatta-ground", "room": "Room 2"},
            {"code": "SW-ARYA-G-CR3", "name": "Classroom 3", "floor": "Ground Floor", "zone": "Aryabhatta Block", "type": "Classroom", "mapId": "aryabhatta-ground", "room": "Room 3"},
            {"code": "SW-ARYA-G-CR4", "name": "Classroom 4", "floor": "Ground Floor", "zone": "Aryabhatta Block", "type": "Classroom", "mapId": "aryabhatta-ground", "room": "Room 4"},
            {"code": "SW-ARYA-G-CR5", "name": "Classroom 5", "floor": "Ground Floor", "zone": "Aryabhatta Block", "type": "Classroom", "mapId": "aryabhatta-ground", "room": "Room 5"},
            {"code": "SW-ARYA-G-LAB", "name": "Aryabhatta Physics Lab", "floor": "Ground Floor", "zone": "Aryabhatta Block", "type": "Laboratory", "mapId": "aryabhatta-ground", "room": "Lab"},
            {"code": "SW-ARYA-G-TEMPLE", "name": "Campus Temple & Meditation", "floor": "Ground Floor", "zone": "Aryabhatta Block", "type": "Sanctuary / Quiet Area", "mapId": "aryabhatta-ground", "room": "Temple"},
            {"code": "SW-ARYA-G-LIFT", "name": "Elevator Lobby", "floor": "Ground Floor", "zone": "Aryabhatta Block", "type": "Vertical Transit", "mapId": "aryabhatta-ground", "room": "Lift"},
            {"code": "SW-ARYA-G-STAIR1", "name": "North Stairs", "floor": "Ground Floor", "zone": "Aryabhatta Block", "type": "Stairway", "mapId": "aryabhatta-ground", "room": "Stairs 1"},
            {"code": "SW-ARYA-G-STAIR2", "name": "South Stairs", "floor": "Ground Floor", "zone": "Aryabhatta Block", "type": "Stairway", "mapId": "aryabhatta-ground", "room": "Stairs 2"},
            {"code": "SW-ARYA-G-ENTRY", "name": "Main Ground Entry / Exit", "floor": "Ground Floor", "zone": "Aryabhatta Block", "type": "Building Gateway", "mapId": "aryabhatta-ground", "room": "Entry / Exit"},

            # Basement
            {"code": "SW-ARYA-B-CR1", "name": "Classroom 1 (Basement)", "floor": "Basement", "zone": "Aryabhatta Block", "type": "Classroom", "mapId": "aryabhatta-basement", "room": "Classroom 1"},
            {"code": "SW-ARYA-B-CR2", "name": "Classroom 2 (Basement)", "floor": "Basement", "zone": "Aryabhatta Block", "type": "Classroom", "mapId": "aryabhatta-basement", "room": "Classroom 2"},
            {"code": "SW-ARYA-B-CR3", "name": "Classroom 3 (Basement)", "floor": "Basement", "zone": "Aryabhatta Block", "type": "Classroom", "mapId": "aryabhatta-basement", "room": "Classroom 3"},
            {"code": "SW-ARYA-B-LAB1", "name": "Research Lab 1", "floor": "Basement", "zone": "Aryabhatta Block", "type": "Research Lab", "mapId": "aryabhatta-basement", "room": "Lab 1"},
            {"code": "SW-ARYA-B-LAB2", "name": "Research Lab 2", "floor": "Basement", "zone": "Aryabhatta Block", "type": "Research Lab", "mapId": "aryabhatta-basement", "room": "Lab 2"},
            {"code": "SW-ARYA-B-LIFT", "name": "Basement Elevator Lobby", "floor": "Basement", "zone": "Aryabhatta Block", "type": "Vertical Transit", "mapId": "aryabhatta-basement", "room": "Lift"},
            {"code": "SW-ARYA-B-STAIR1", "name": "Stairwell 1", "floor": "Basement", "zone": "Aryabhatta Block", "type": "Stairway", "mapId": "aryabhatta-basement", "room": "Stairs 1"}
        ]
    }
}

def generate_qr_image(code_text, output_path):
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=12,
        border=2,
    )
    qr.add_data(code_text)
    qr.make(fit=True)
    img = qr.make_image(fill_color="#0f172a", back_color="#ffffff")
    img.save(output_path)

def create_single_checkpoint_pdf(item, block_name, block_title, qr_img_path, output_pdf_path):
    doc = SimpleDocTemplate(
        output_pdf_path,
        pagesize=A4,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )
    styles = getSampleStyleSheet()

    brand_style = ParagraphStyle(
        'AegisBrand',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=colors.HexColor('#4f46e5'),
        alignment=1
    )
    subtitle_style = ParagraphStyle(
        'AegisSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=14,
        textColor=colors.HexColor('#64748b'),
        alignment=1
    )
    title_style = ParagraphStyle(
        'CheckpointTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=colors.HexColor('#0f172a'),
        alignment=1
    )
    meta_style = ParagraphStyle(
        'MetaStyle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=15,
        textColor=colors.HexColor('#334155'),
        alignment=1
    )
    code_style = ParagraphStyle(
        'CodeStyle',
        parent=styles['Normal'],
        fontName='Courier-Bold',
        fontSize=14,
        leading=18,
        textColor=colors.HexColor('#1e1b4b'),
        alignment=1
    )
    inst_style = ParagraphStyle(
        'InstructionStyle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#059669'),
        alignment=1
    )

    story = []

    # Header Card
    story.append(Paragraph("AegisPath Intelligent Indoor Waypoint", brand_style))
    story.append(Paragraph("Smart India Hackathon • Real-Time Pedestrian Dead Reckoning & Evacuation System", subtitle_style))
    story.append(Spacer(1, 15))

    # Location Info
    story.append(Paragraph(f"<b>{item['name']}</b>", title_style))
    story.append(Spacer(1, 6))
    story.append(Paragraph(f"<b>Location:</b> {block_title} &bull; <b>Level:</b> {item['floor']} &bull; <b>Type:</b> {item['type']}", meta_style))
    story.append(Spacer(1, 15))

    # High-Res QR Image
    story.append(RLImage(qr_img_path, width=2.8*inch, height=2.8*inch))
    story.append(Spacer(1, 10))

    # Scannable Code String Box
    story.append(Paragraph(f"CHECKPOINT CODE: <b>{item['code']}</b>", code_style))
    story.append(Spacer(1, 12))

    # Scanning Instruction Banner
    story.append(Paragraph("SCAN WITH AEGISPATH MOBILE APP FOR INSTANT POSITIONING & EVACUATION", inst_style))
    story.append(Spacer(1, 6))
    story.append(Paragraph("Open <b>https://sih-two-iota.vercel.app/mobile</b> on any smartphone camera to synchronize your position.", subtitle_style))

    doc.build(story)

def create_block_master_booklet(block_name, block_data, qr_img_map, output_pdf_path):
    doc = SimpleDocTemplate(
        output_pdf_path,
        pagesize=A4,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )
    styles = getSampleStyleSheet()

    brand_style = ParagraphStyle(
        'AegisBrand',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#4f46e5'),
        alignment=1
    )
    subtitle_style = ParagraphStyle(
        'AegisSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=13,
        textColor=colors.HexColor('#64748b'),
        alignment=1
    )
    card_title_style = ParagraphStyle(
        'CardTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=16,
        textColor=colors.HexColor('#0f172a'),
        alignment=1
    )
    card_meta_style = ParagraphStyle(
        'CardMeta',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#475569'),
        alignment=1
    )
    card_code_style = ParagraphStyle(
        'CardCode',
        parent=styles['Normal'],
        fontName='Courier-Bold',
        fontSize=11,
        leading=14,
        textColor=colors.HexColor('#312e81'),
        alignment=1
    )

    story = []

    # Title Page / Header
    story.append(Paragraph(f"AegisPath — {block_data['title']}", brand_style))
    story.append(Paragraph("Complete Printable Waypoint QR Code Catalog & Wall Mounting Sheets", subtitle_style))
    story.append(Spacer(1, 15))

    items = block_data['items']
    for idx, item in enumerate(items):
        qr_path = qr_img_map[item['code']]
        
        # Build individual compact plaque card
        card_content = [
            Paragraph(f"<b>{item['name']}</b>", card_title_style),
            Spacer(1, 3),
            Paragraph(f"<b>Level:</b> {item['floor']} &bull; <b>Type:</b> {item['type']}", card_meta_style),
            Spacer(1, 6),
            RLImage(qr_path, width=2.2*inch, height=2.2*inch),
            Spacer(1, 4),
            Paragraph(f"CODE: <b>{item['code']}</b>", card_code_style),
            Spacer(1, 4),
            Paragraph("Scan with AegisPath Mobile App (sih-two-iota.vercel.app/mobile)", subtitle_style)
        ]

        table = Table([[card_content]], colWidths=[6.8*inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
            ('BOX', (0,0), (-1,-1), 1.5, colors.HexColor('#cbd5e1')),
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('TOPPADDING', (0,0), (-1,-1), 10),
            ('BOTTOMPADDING', (0,0), (-1,-1), 10),
        ]))

        story.append(table)
        story.append(Spacer(1, 12))

        # 2 cards per page for neat printable size
        if (idx + 1) % 2 == 0 and (idx + 1) < len(items):
            story.append(PageBreak())

    doc.build(story)

def main():
    os.makedirs(QR_OUTPUT_DIR, exist_ok=True)
    total_qrs = 0

    print("Starting AegisPath High-Resolution QR and PDF Generation...")

    for block_key, block_data in CHECKPOINTS.items():
        block_dir = os.path.join(QR_OUTPUT_DIR, block_key)
        qr_images_dir = os.path.join(block_dir, "images")
        individual_pdfs_dir = os.path.join(block_dir, "single_cards")
        os.makedirs(qr_images_dir, exist_ok=True)
        os.makedirs(individual_pdfs_dir, exist_ok=True)

        print(f"\nProcessing {block_key} ({len(block_data['items'])} checkpoints)...")
        qr_img_map = {}

        for item in block_data['items']:
            code = item['code']
            # 1. Generate PNG
            png_filename = f"{code}.png"
            png_path = os.path.join(qr_images_dir, png_filename)
            generate_qr_image(code, png_path)
            qr_img_map[code] = png_path

            # 2. Generate Single Checkpoint Printable PDF
            clean_name = item['name'].replace(' ', '_').replace('/', '_').replace('&', 'and')
            pdf_filename = f"{code}_{clean_name}.pdf"
            pdf_path = os.path.join(individual_pdfs_dir, pdf_filename)
            create_single_checkpoint_pdf(item, block_key, block_data['title'], png_path, pdf_path)
            total_qrs += 1

        # 3. Generate Block Master Printable Booklet
        master_booklet_path = os.path.join(block_dir, f"{block_key}_Complete_Printable_Booklet.pdf")
        create_block_master_booklet(block_key, block_data, qr_img_map, master_booklet_path)
        print(f"  [OK] Created Master Booklet: {os.path.basename(master_booklet_path)}")

    print(f"\nSuccessfully Generated {total_qrs} Checkpoint QR Codes and Complete PDF Booklets in '{QR_OUTPUT_DIR}'!")

if __name__ == "__main__":
    main()
