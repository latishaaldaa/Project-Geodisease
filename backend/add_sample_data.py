"""
Script untuk menambahkan data sample ke database
Jalankan jika ingin menambah data testing
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import app, db, Penyakit, DMFT, ProgramCKG, AktivitasTim
from datetime import datetime

def add_sample_penyakit():
    """Tambah data sample penyakit gigi"""
    sample_penyakit = [
        {
            'nama': 'Karies Gigi',
            'kategori': 'Gigi',
            'deskripsi': 'Kerusakan struktur gigi yang disebabkan oleh asam dari bakteri',
            'kode_icd': 'K02',
            'tingkat_urgensi': 'Normal',
            'tindakan_medis': 'Tambal gigi atau pencabutan jika sudah parah',
            'last_updated_by': 'Dr. Siti'
        },
        {
            'nama': 'Gingivitis',
            'kategori': 'Gusi',
            'deskripsi': 'Peradangan pada gusi yang menyebabkan pembengkakan dan pendarahan',
            'kode_icd': 'K05.0',
            'tingkat_urgensi': 'Sedang',
            'tindakan_medis': 'Pembersihan karang gigi dan menjaga kebersihan mulut',
            'last_updated_by': 'Drg. Budi'
        },
        {
            'nama': 'Periodontitis',
            'kategori': 'Gusi',
            'deskripsi': 'Infeksi serius pada gusi yang merusak jaringan lunak dan tulang',
            'kode_icd': 'K05.3',
            'tingkat_urgensi': 'Tinggi',
            'tindakan_medis': 'Scaling root planing dan kemungkinan operasi',
            'last_updated_by': 'Drg. Ani'
        },
        {
            'nama': 'Stomatitis',
            'kategori': 'Mulut',
            'deskripsi': 'Peradangan pada mukosa mulut yang menyebabkan sariawan',
            'kode_icd': 'K12',
            'tingkat_urgensi': 'Normal',
            'tindakan_medis': 'Obat kumur antiseptik dan menjaga kebersihan mulut',
            'last_updated_by': 'Dr. Siti'
        }
    ]
    
    for data in sample_penyakit:
        penyakit = Penyakit(**data)
        db.session.add(penyakit)
    
    db.session.commit()
    print(f"✅ Berhasil menambahkan {len(sample_penyakit)} data penyakit sample")

def update_dmft_data():
    """Update data DMF-T dengan nilai terbaru"""
    updates = [
        {
            'wilayah': 'Puskesmas Madiun Kota',
            'dmft_index': 2.6,
            'decayed': 1.1,
            'missing': 0.7,
            'filled': 0.8,
            'jumlah_pasien': 470,
            'kategori': 'Rendah'
        },
        {
            'wilayah': 'Puskesmas Taman',
            'dmft_index': 4.3,
            'decayed': 2.0,
            'missing': 1.4,
            'filled': 0.9,
            'jumlah_pasien': 335,
            'kategori': 'Sedang'
        }
    ]
    
    for data in updates:
        dmft = DMFT.query.filter_by(wilayah=data['wilayah']).first()
        if dmft:
            for key, value in data.items():
                if key != 'wilayah':
                    setattr(dmft, key, value)
            dmft.updated_at = datetime.utcnow()
    
    db.session.commit()
    print(f"✅ Berhasil update {len(updates)} data DMF-T")

def add_new_program():
    """Tambah program CKG baru"""
    new_program = ProgramCKG(
        nama_program='Kampanye Sikat Gigi 2x Sehari',
        wilayah_target='Puskesmas Oro-Oro Ombo',
        status='Berjalan',
        tanggal_mulai='2026-06-20',
        target_dmft='< 4.5'
    )
    db.session.add(new_program)
    db.session.commit()
    print("✅ Berhasil menambahkan program CKG baru")

def add_today_activities():
    """Tambah aktivitas tim hari ini"""
    activities = [
        {
            'tim': 'Tim D - Drg. Rina',
            'kegiatan': 'Screening kesehatan gigi TK',
            'waktu': '09:00',
            'jumlah_pasien': 30,
            'wilayah': 'Puskesmas Manguharjo'
        },
        {
            'tim': 'Tim E - Dr. Hadi',
            'kegiatan': 'Edukasi menyikat gigi yang benar',
            'waktu': '11:00',
            'jumlah_pasien': 25,
            'wilayah': 'Puskesmas Oro-Oro Ombo'
        }
    ]
    
    for data in activities:
        aktivitas = AktivitasTim(**data)
        db.session.add(aktivitas)
    
    db.session.commit()
    print(f"✅ Berhasil menambahkan {len(activities)} aktivitas tim hari ini")

if __name__ == '__main__':
    with app.app_context():
        print("\n" + "="*50)
        print("   MENAMBAHKAN DATA SAMPLE KE DATABASE")
        print("="*50 + "\n")
        
        # Pilih data yang ingin ditambahkan
        print("Pilih data yang ingin ditambahkan:")
        print("1. Data Penyakit Sample")
        print("2. Update Data DMF-T")
        print("3. Program CKG Baru")
        print("4. Aktivitas Tim Hari Ini")
        print("5. Semua Data di Atas")
        print()
        
        choice = input("Masukkan pilihan (1-5): ").strip()
        print()
        
        if choice == '1':
            add_sample_penyakit()
        elif choice == '2':
            update_dmft_data()
        elif choice == '3':
            add_new_program()
        elif choice == '4':
            add_today_activities()
        elif choice == '5':
            add_sample_penyakit()
            update_dmft_data()
            add_new_program()
            add_today_activities()
        else:
            print("❌ Pilihan tidak valid!")
        
        print("\n" + "="*50)
        print("   SELESAI")
        print("="*50 + "\n")
