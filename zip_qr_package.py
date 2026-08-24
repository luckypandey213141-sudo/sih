#!/usr/bin/env python3
import shutil
import os

root = r'c:\SIH_LATEST_V3'
src = os.path.join(root, 'SafeWay_QR_Codes')
zip_dst = os.path.join(root, 'SafeWay_Campus_QR_Codes_Package')

archive_path = shutil.make_archive(zip_dst, 'zip', src)
size_mb = os.path.getsize(archive_path) / (1024 * 1024)
print(f"[OK] Complete QR Code ZIP Package Created: {archive_path} ({size_mb:.2f} MB)")
