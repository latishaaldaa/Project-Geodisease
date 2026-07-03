"""
Script untuk testing API endpoints
Pastikan server backend sudah berjalan di http://127.0.0.1:5000
"""

import requests
import json

BASE_URL = "http://127.0.0.1:5000"

def test_health_check():
    """Test server health check"""
    print("\n[TEST 1] Health Check Server...")
    try:
        response = requests.get(f"{BASE_URL}/")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_get_dmft():
    """Test GET data DMF-T"""
    print("\n[TEST 2] GET Data DMF-T...")
    try:
        response = requests.get(f"{BASE_URL}/api/dmft")
        print(f"Status: {response.status_code}")
        data = response.json()
        print(f"Jumlah Wilayah: {len(data)}")
        for wilayah, info in list(data.items())[:2]:
            print(f"  - {wilayah}: DMF-T {info['dmft_index']}, Kategori {info['kategori']}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_get_program_ckg():
    """Test GET program CKG"""
    print("\n[TEST 3] GET Program CKG...")
    try:
        response = requests.get(f"{BASE_URL}/api/program-ckg")
        print(f"Status: {response.status_code}")
        data = response.json()
        print(f"Jumlah Program: {len(data)}")
        for program in data[:2]:
            print(f"  - {program['nama_program']} ({program['wilayah_target']})")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_get_aktivitas_tim():
    """Test GET aktivitas tim"""
    print("\n[TEST 4] GET Aktivitas Tim...")
    try:
        response = requests.get(f"{BASE_URL}/api/aktivitas-tim")
        print(f"Status: {response.status_code}")
        data = response.json()
        print(f"Jumlah Aktivitas Hari Ini: {len(data)}")
        for aktivitas in data[:2]:
            print(f"  - {aktivitas['tim']}: {aktivitas['kegiatan']} ({aktivitas['jumlah_pasien']} pasien)")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_get_penyakit():
    """Test GET penyakit"""
    print("\n[TEST 5] GET Data Penyakit...")
    try:
        response = requests.get(f"{BASE_URL}/api/penyakit")
        print(f"Status: {response.status_code}")
        data = response.json()
        print(f"Jumlah Penyakit: {len(data)}")
        for penyakit in data[:2]:
            print(f"  - {penyakit['nama']} (ICD: {penyakit['kode_icd']})")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_create_penyakit():
    """Test POST penyakit baru"""
    print("\n[TEST 6] POST Penyakit Baru...")
    try:
        payload = {
            "nama": "Test Penyakit API",
            "kategori": "Test",
            "deskripsi": "Deskripsi test",
            "kode_icd": "TEST01",
            "tingkat_urgensi": "Normal",
            "tindakan_medis": "Test tindakan"
        }
        response = requests.post(f"{BASE_URL}/api/penyakit", json=payload)
        print(f"Status: {response.status_code}")
        if response.status_code == 201:
            data = response.json()
            print(f"Penyakit berhasil ditambahkan: {data['nama']} (ID: {data['id']})")
            return True
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == '__main__':
    print("="*60)
    print("   TESTING API BACKEND CKG GEODISEASE")
    print("="*60)
    print("\nPastikan server backend sudah berjalan!")
    print("Jalankan: python app.py\n")
    
    input("Tekan ENTER untuk mulai testing...")
    
    results = []
    results.append(("Health Check", test_health_check()))
    results.append(("GET DMF-T", test_get_dmft()))
    results.append(("GET Program CKG", test_get_program_ckg()))
    results.append(("GET Aktivitas Tim", test_get_aktivitas_tim()))
    results.append(("GET Penyakit", test_get_penyakit()))
    results.append(("POST Penyakit", test_create_penyakit()))
    
    print("\n" + "="*60)
    print("   HASIL TESTING")
    print("="*60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{test_name:25} {status}")
    
    print("\n" + "="*60)
    print(f"   TOTAL: {passed}/{total} tests passed")
    print("="*60 + "\n")
    
    if passed == total:
        print("🎉 Semua test berhasil! Backend siap digunakan.")
    else:
        print("⚠️ Beberapa test gagal. Periksa konfigurasi backend.")
