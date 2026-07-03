from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)

# Konfigurasi Database SQLite
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'ckg_database.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# ==================== MODEL DATABASE ====================

# Model: Penyakit
class Penyakit(db.Model):
    __tablename__ = 'penyakit'
    id = db.Column(db.Integer, primary_key=True)
    nama = db.Column(db.String(200), nullable=False)
    kategori = db.Column(db.String(100))
    deskripsi = db.Column(db.Text)
    gambarUrl = db.Column(db.String(500))
    linkArtikel = db.Column(db.String(500))
    kode_icd = db.Column(db.String(50))
    tingkat_urgensi = db.Column(db.String(50), default='Normal')
    tindakan_medis = db.Column(db.Text)
    last_updated_by = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'nama': self.nama,
            'kategori': self.kategori,
            'deskripsi': self.deskripsi,
            'gambarUrl': self.gambarUrl,
            'linkArtikel': self.linkArtikel,
            'kode_icd': self.kode_icd,
            'tingkat_urgensi': self.tingkat_urgensi,
            'tindakan_medis': self.tindakan_medis,
            'last_updated_by': self.last_updated_by
        }

# Model: Data DMF-T per Wilayah
class DMFT(db.Model):
    __tablename__ = 'dmft'
    id = db.Column(db.Integer, primary_key=True)
    wilayah = db.Column(db.String(200), nullable=False, unique=True)
    dmft_index = db.Column(db.Float, default=0.0)
    decayed = db.Column(db.Float, default=0.0)
    missing = db.Column(db.Float, default=0.0)
    filled = db.Column(db.Float, default=0.0)
    jumlah_pasien = db.Column(db.Integer, default=0)
    kategori = db.Column(db.String(50))
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'dmft_index': self.dmft_index,
            'decayed': self.decayed,
            'missing': self.missing,
            'filled': self.filled,
            'jumlah_pasien': self.jumlah_pasien,
            'kategori': self.kategori
        }

# Model: Program Intervensi CKG
class ProgramCKG(db.Model):
    __tablename__ = 'program_ckg'
    id = db.Column(db.Integer, primary_key=True)
    nama_program = db.Column(db.String(300), nullable=False)
    wilayah_target = db.Column(db.String(200), nullable=False)
    status = db.Column(db.String(50), default='Berjalan')
    tanggal_mulai = db.Column(db.String(50))
    target_dmft = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'nama_program': self.nama_program,
            'wilayah_target': self.wilayah_target,
            'status': self.status,
            'tanggal_mulai': self.tanggal_mulai,
            'target_dmft': self.target_dmft
        }

# Model: Aktivitas Tim Kesehatan
class AktivitasTim(db.Model):
    __tablename__ = 'aktivitas_tim'
    id = db.Column(db.Integer, primary_key=True)
    tim = db.Column(db.String(200), nullable=False)
    kegiatan = db.Column(db.String(500), nullable=False)
    waktu = db.Column(db.String(50))
    jumlah_pasien = db.Column(db.Integer, default=0)
    wilayah = db.Column(db.String(200))
    tanggal = db.Column(db.Date, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'tim': self.tim,
            'kegiatan': self.kegiatan,
            'waktu': self.waktu,
            'jumlah_pasien': self.jumlah_pasien,
            'wilayah': self.wilayah
        }

# Model: Data Pasien
class Pasien(db.Model):
    __tablename__ = 'pasien'
    id = db.Column(db.Integer, primary_key=True)
    
    # Data Registrasi & Identitas
    nomor_registrasi = db.Column(db.String(100))
    nama = db.Column(db.String(200), nullable=False)
    nik = db.Column(db.String(16))
    nomor_hp = db.Column(db.String(20))
    umur = db.Column(db.Integer)
    jenis_kelamin = db.Column(db.String(20))
    gol_darah = db.Column(db.String(5))
    
    # Data Antropometri & Vital Sign
    tinggi = db.Column(db.Float)
    berat = db.Column(db.Float)
    imt_skor = db.Column(db.Float)
    status_gizi = db.Column(db.String(50))
    sistole = db.Column(db.Float)
    diastole = db.Column(db.Float)
    tekanan_darah = db.Column(db.String(20))
    gula_darah = db.Column(db.Float)
    
    # Data Geografis
    wilayah_id = db.Column(db.String(200))
    alamat = db.Column(db.Text)
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    
    # Data Diagnosis & Status
    penyakit_id = db.Column(db.String(200))
    status = db.Column(db.String(50), default='Perawatan')
    tanggal_input = db.Column(db.String(50))
    
    # Data Skrining & Riwayat
    riwayat_dm = db.Column(db.Boolean, default=False)
    riwayat_hipertensi = db.Column(db.Boolean, default=False)
    riwayat_jantung = db.Column(db.Boolean, default=False)
    riwayat_kanker = db.Column(db.Boolean, default=False)
    riwayat_stroke = db.Column(db.Boolean, default=False)
    merokok = db.Column(db.Boolean, default=False)
    konsumsi_alkohol = db.Column(db.Boolean, default=False)
    kurang_olahraga = db.Column(db.Boolean, default=False)
    pola_makan_tidak_sehat = db.Column(db.Boolean, default=False)
    riwayat_pribadi = db.Column(db.Text)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'nomor_registrasi': self.nomor_registrasi,
            'nama': self.nama,
            'nik': self.nik,
            'nomor_hp': self.nomor_hp,
            'umur': self.umur,
            'jenis_kelamin': self.jenis_kelamin,
            'gol_darah': self.gol_darah,
            'tinggi': self.tinggi,
            'berat': self.berat,
            'imt_skor': self.imt_skor,
            'status_gizi': self.status_gizi,
            'sistole': self.sistole,
            'diastole': self.diastole,
            'tekanan_darah': self.tekanan_darah,
            'gula_darah': self.gula_darah,
            'wilayah_id': self.wilayah_id,
            'alamat': self.alamat,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'penyakit_id': self.penyakit_id,
            'status': self.status,
            'tanggal_input': self.tanggal_input,
            'riwayat_dm': self.riwayat_dm,
            'riwayat_hipertensi': self.riwayat_hipertensi,
            'riwayat_jantung': self.riwayat_jantung,
            'riwayat_kanker': self.riwayat_kanker,
            'riwayat_stroke': self.riwayat_stroke,
            'merokok': self.merokok,
            'konsumsi_alkohol': self.konsumsi_alkohol,
            'kurang_olahraga': self.kurang_olahraga,
            'pola_makan_tidak_sehat': self.pola_makan_tidak_sehat,
            'riwayat_pribadi': self.riwayat_pribadi
        }

# Model: Log Aktivitas
class LogAktivitas(db.Model):
    __tablename__ = 'log_aktivitas'
    id = db.Column(db.Integer, primary_key=True)
    tipe = db.Column(db.String(100))
    deskripsi = db.Column(db.Text)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'tipe': self.tipe,
            'deskripsi': self.deskripsi,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None
        }

# Model: User untuk autentikasi
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    email = db.Column(db.String(200), unique=True, nullable=False)
    password = db.Column(db.String(500))  # Untuk login biasa (hashed) atau google_id
    role = db.Column(db.String(50), default='user')  # admin, user, tim kesehatan
    google_id = db.Column(db.String(200))  # ID dari Google OAuth
    picture = db.Column(db.String(500))  # URL foto profil dari Google
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role': self.role,
            'picture': self.picture
        }

# ==================== API ENDPOINTS ====================

# Health Check
@app.route('/')
def index():
    return jsonify({
        'status': 'Server CKG Backend Running',
        'version': '1.0',
        'timestamp': datetime.now().isoformat()
    })

# -------------------- PENYAKIT CRUD --------------------

# GET semua penyakit
@app.route('/api/penyakit', methods=['GET'])
def get_penyakit():
    try:
        penyakit_list = Penyakit.query.all()
        return jsonify([p.to_dict() for p in penyakit_list]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# POST tambah penyakit baru
@app.route('/api/penyakit', methods=['POST'])
def create_penyakit():
    try:
        data = request.json
        penyakit = Penyakit(
            nama=data.get('nama'),
            kategori=data.get('kategori'),
            deskripsi=data.get('deskripsi'),
            gambarUrl=data.get('gambarUrl'),
            linkArtikel=data.get('linkArtikel'),
            kode_icd=data.get('kode_icd'),
            tingkat_urgensi=data.get('tingkat_urgensi', 'Normal'),
            tindakan_medis=data.get('tindakan_medis'),
            last_updated_by=data.get('last_updated_by', 'Admin')
        )
        db.session.add(penyakit)
        db.session.commit()
        return jsonify(penyakit.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# PUT update penyakit
@app.route('/api/penyakit/<int:id>', methods=['PUT'])
def update_penyakit(id):
    try:
        penyakit = Penyakit.query.get(id)
        if not penyakit:
            return jsonify({'error': 'Penyakit tidak ditemukan'}), 404
        
        data = request.json
        penyakit.nama = data.get('nama', penyakit.nama)
        penyakit.kategori = data.get('kategori', penyakit.kategori)
        penyakit.deskripsi = data.get('deskripsi', penyakit.deskripsi)
        penyakit.gambarUrl = data.get('gambarUrl', penyakit.gambarUrl)
        penyakit.linkArtikel = data.get('linkArtikel', penyakit.linkArtikel)
        penyakit.kode_icd = data.get('kode_icd', penyakit.kode_icd)
        penyakit.tingkat_urgensi = data.get('tingkat_urgensi', penyakit.tingkat_urgensi)
        penyakit.tindakan_medis = data.get('tindakan_medis', penyakit.tindakan_medis)
        penyakit.last_updated_by = data.get('last_updated_by', penyakit.last_updated_by)
        penyakit.updated_at = datetime.utcnow()
        
        db.session.commit()
        return jsonify(penyakit.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# DELETE penyakit
@app.route('/api/penyakit/<int:id>', methods=['DELETE'])
def delete_penyakit(id):
    try:
        penyakit = Penyakit.query.get(id)
        if not penyakit:
            return jsonify({'error': 'Penyakit tidak ditemukan'}), 404
        
        db.session.delete(penyakit)
        db.session.commit()
        return jsonify({'message': 'Penyakit berhasil dihapus'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# -------------------- DMF-T DATA --------------------

# GET semua data DMF-T
@app.route('/api/dmft', methods=['GET'])
def get_dmft():
    try:
        dmft_list = DMFT.query.all()
        result = {}
        for dmft in dmft_list:
            result[dmft.wilayah] = dmft.to_dict()
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# POST/PUT update data DMF-T untuk wilayah tertentu
@app.route('/api/dmft', methods=['POST'])
def update_dmft():
    try:
        data = request.json
        wilayah = data.get('wilayah')
        
        dmft = DMFT.query.filter_by(wilayah=wilayah).first()
        
        if dmft:
            # Update existing
            dmft.dmft_index = data.get('dmft_index', dmft.dmft_index)
            dmft.decayed = data.get('decayed', dmft.decayed)
            dmft.missing = data.get('missing', dmft.missing)
            dmft.filled = data.get('filled', dmft.filled)
            dmft.jumlah_pasien = data.get('jumlah_pasien', dmft.jumlah_pasien)
            dmft.kategori = data.get('kategori', dmft.kategori)
            dmft.updated_at = datetime.utcnow()
        else:
            # Create new
            dmft = DMFT(
                wilayah=wilayah,
                dmft_index=data.get('dmft_index', 0.0),
                decayed=data.get('decayed', 0.0),
                missing=data.get('missing', 0.0),
                filled=data.get('filled', 0.0),
                jumlah_pasien=data.get('jumlah_pasien', 0),
                kategori=data.get('kategori', 'Normal')
            )
            db.session.add(dmft)
        
        db.session.commit()
        return jsonify({'message': 'Data DMF-T berhasil diupdate'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# -------------------- PROGRAM CKG --------------------

# GET semua program CKG
@app.route('/api/program-ckg', methods=['GET'])
def get_program_ckg():
    try:
        program_list = ProgramCKG.query.order_by(ProgramCKG.created_at.desc()).all()
        return jsonify([p.to_dict() for p in program_list]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# POST tambah program CKG baru
@app.route('/api/program-ckg', methods=['POST'])
def create_program_ckg():
    try:
        data = request.json
        program = ProgramCKG(
            nama_program=data.get('nama_program'),
            wilayah_target=data.get('wilayah_target'),
            status=data.get('status', 'Berjalan'),
            tanggal_mulai=data.get('tanggal_mulai'),
            target_dmft=data.get('target_dmft')
        )
        db.session.add(program)
        db.session.commit()
        return jsonify(program.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# -------------------- AKTIVITAS TIM --------------------

# GET aktivitas tim hari ini
@app.route('/api/aktivitas-tim', methods=['GET'])
def get_aktivitas_tim():
    try:
        today = datetime.utcnow().date()
        aktivitas_list = AktivitasTim.query.filter_by(tanggal=today).order_by(AktivitasTim.created_at.desc()).all()
        return jsonify([a.to_dict() for a in aktivitas_list]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# POST tambah aktivitas tim baru
@app.route('/api/aktivitas-tim', methods=['POST'])
def create_aktivitas_tim():
    try:
        data = request.json
        aktivitas = AktivitasTim(
            tim=data.get('tim'),
            kegiatan=data.get('kegiatan'),
            waktu=data.get('waktu'),
            jumlah_pasien=data.get('jumlah_pasien', 0),
            wilayah=data.get('wilayah')
        )
        db.session.add(aktivitas)
        db.session.commit()
        return jsonify(aktivitas.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# -------------------- FETCH METADATA ARTIKEL --------------------

@app.route('/api/fetch-metadata', methods=['POST'])
def fetch_metadata():
    try:
        data = request.json
        url = data.get('url')
        
        # Simple mock response - dalam produksi gunakan library seperti beautifulsoup4
        return jsonify({
            'title': 'Artikel Kesehatan',
            'description': 'Deskripsi artikel kesehatan',
            'image': ''
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# -------------------- PASIEN CRUD --------------------

# GET semua pasien
@app.route('/api/pasien', methods=['GET'])
def get_pasien():
    try:
        pasien_list = Pasien.query.all()
        return jsonify([p.to_dict() for p in pasien_list]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# POST tambah pasien baru
@app.route('/api/pasien', methods=['POST'])
def create_pasien():
    try:
        data = request.json
        pasien = Pasien(
            nomor_registrasi=data.get('nomor_registrasi'),
            nama=data.get('nama'),
            nik=data.get('nik'),
            nomor_hp=data.get('nomor_hp'),
            umur=data.get('umur'),
            jenis_kelamin=data.get('jenis_kelamin'),
            gol_darah=data.get('gol_darah'),
            tinggi=data.get('tinggi'),
            berat=data.get('berat'),
            imt_skor=data.get('imt_skor'),
            status_gizi=data.get('status_gizi'),
            sistole=data.get('sistole'),
            diastole=data.get('diastole'),
            tekanan_darah=data.get('tekanan_darah'),
            gula_darah=data.get('gula_darah'),
            wilayah_id=data.get('wilayah_id'),
            alamat=data.get('alamat'),
            latitude=data.get('latitude'),
            longitude=data.get('longitude'),
            penyakit_id=data.get('penyakit_id'),
            status=data.get('status', 'Perawatan'),
            tanggal_input=data.get('tanggal_input'),
            riwayat_dm=data.get('riwayat_dm', False),
            riwayat_hipertensi=data.get('riwayat_hipertensi', False),
            riwayat_jantung=data.get('riwayat_jantung', False),
            riwayat_kanker=data.get('riwayat_kanker', False),
            riwayat_stroke=data.get('riwayat_stroke', False),
            merokok=data.get('merokok', False),
            konsumsi_alkohol=data.get('konsumsi_alkohol', False),
            kurang_olahraga=data.get('kurang_olahraga', False),
            pola_makan_tidak_sehat=data.get('pola_makan_tidak_sehat', False),
            riwayat_pribadi=data.get('riwayat_pribadi')
        )
        db.session.add(pasien)
        db.session.commit()
        return jsonify(pasien.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# PUT update pasien
@app.route('/api/pasien/<int:id>', methods=['PUT'])
def update_pasien(id):
    try:
        pasien = Pasien.query.get(id)
        if not pasien:
            return jsonify({'error': 'Pasien tidak ditemukan'}), 404
        
        data = request.json
        pasien.nomor_registrasi = data.get('nomor_registrasi', pasien.nomor_registrasi)
        pasien.nama = data.get('nama', pasien.nama)
        pasien.nik = data.get('nik', pasien.nik)
        pasien.nomor_hp = data.get('nomor_hp', pasien.nomor_hp)
        pasien.umur = data.get('umur', pasien.umur)
        pasien.jenis_kelamin = data.get('jenis_kelamin', pasien.jenis_kelamin)
        pasien.gol_darah = data.get('gol_darah', pasien.gol_darah)
        pasien.tinggi = data.get('tinggi', pasien.tinggi)
        pasien.berat = data.get('berat', pasien.berat)
        pasien.imt_skor = data.get('imt_skor', pasien.imt_skor)
        pasien.status_gizi = data.get('status_gizi', pasien.status_gizi)
        pasien.sistole = data.get('sistole', pasien.sistole)
        pasien.diastole = data.get('diastole', pasien.diastole)
        pasien.tekanan_darah = data.get('tekanan_darah', pasien.tekanan_darah)
        pasien.gula_darah = data.get('gula_darah', pasien.gula_darah)
        pasien.wilayah_id = data.get('wilayah_id', pasien.wilayah_id)
        pasien.alamat = data.get('alamat', pasien.alamat)
        pasien.latitude = data.get('latitude', pasien.latitude)
        pasien.longitude = data.get('longitude', pasien.longitude)
        pasien.penyakit_id = data.get('penyakit_id', pasien.penyakit_id)
        pasien.status = data.get('status', pasien.status)
        pasien.tanggal_input = data.get('tanggal_input', pasien.tanggal_input)
        pasien.riwayat_dm = data.get('riwayat_dm', pasien.riwayat_dm)
        pasien.riwayat_hipertensi = data.get('riwayat_hipertensi', pasien.riwayat_hipertensi)
        pasien.riwayat_jantung = data.get('riwayat_jantung', pasien.riwayat_jantung)
        pasien.riwayat_kanker = data.get('riwayat_kanker', pasien.riwayat_kanker)
        pasien.riwayat_stroke = data.get('riwayat_stroke', pasien.riwayat_stroke)
        pasien.merokok = data.get('merokok', pasien.merokok)
        pasien.konsumsi_alkohol = data.get('konsumsi_alkohol', pasien.konsumsi_alkohol)
        pasien.kurang_olahraga = data.get('kurang_olahraga', pasien.kurang_olahraga)
        pasien.pola_makan_tidak_sehat = data.get('pola_makan_tidak_sehat', pasien.pola_makan_tidak_sehat)
        pasien.riwayat_pribadi = data.get('riwayat_pribadi', pasien.riwayat_pribadi)
        pasien.updated_at = datetime.utcnow()
        
        db.session.commit()
        return jsonify(pasien.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# DELETE pasien
@app.route('/api/pasien/<int:id>', methods=['DELETE'])
def delete_pasien(id):
    try:
        pasien = Pasien.query.get(id)
        if not pasien:
            return jsonify({'error': 'Pasien tidak ditemukan'}), 404
        
        db.session.delete(pasien)
        db.session.commit()
        return jsonify({'message': 'Pasien berhasil dihapus'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# -------------------- LOG AKTIVITAS --------------------

# GET semua log
@app.route('/api/logs', methods=['GET'])
def get_logs():
    try:
        logs = LogAktivitas.query.order_by(LogAktivitas.timestamp.desc()).limit(100).all()
        return jsonify([log.to_dict() for log in logs]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# POST tambah log baru
@app.route('/api/logs', methods=['POST'])
def create_log():
    try:
        data = request.json
        log = LogAktivitas(
            tipe=data.get('tipe'),
            deskripsi=data.get('deskripsi')
        )
        db.session.add(log)
        db.session.commit()
        return jsonify(log.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# -------------------- AUTENTIKASI --------------------

# POST login dengan email dan password
@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'success': False, 'message': 'Email dan password harus diisi'}), 400
        
        user = User.query.filter_by(email=email).first()
        
        if not user:
            return jsonify({'success': False, 'message': 'Email tidak terdaftar'}), 401
        
        # Simple password check (dalam production gunakan hashing seperti bcrypt)
        if user.password == password:
            return jsonify({
                'success': True,
                'role': user.role,
                'userName': user.name,
                'userId': user.id
            }), 200
        else:
            return jsonify({'success': False, 'message': 'Password salah'}), 401
            
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

# POST login dengan Google OAuth
@app.route('/api/google-login', methods=['POST'])
def google_login():
    try:
        data = request.json
        email = data.get('email')
        name = data.get('name')
        google_id = data.get('googleId')
        picture = data.get('picture')
        
        if not email or not google_id:
            return jsonify({'success': False, 'message': 'Data Google tidak lengkap'}), 400
        
        # Cek apakah user sudah ada di database
        user = User.query.filter_by(email=email).first()
        
        if user:
            # User sudah ada, update google_id dan picture jika belum ada
            if not user.google_id:
                user.google_id = google_id
            if picture:
                user.picture = picture
            db.session.commit()
            
            return jsonify({
                'success': True,
                'role': user.role,
                'userName': user.name,
                'userId': user.id
            }), 200
        else:
            # User baru, registrasi otomatis dengan role 'user'
            new_user = User(
                name=name,
                email=email,
                password=google_id,  # Gunakan google_id sebagai password placeholder
                role='user',
                google_id=google_id,
                picture=picture
            )
            db.session.add(new_user)
            db.session.commit()
            
            return jsonify({
                'success': True,
                'role': 'user',
                'userName': name,
                'userId': new_user.id
            }), 200
            
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

# GET audit logs
@app.route('/api/audit-logs', methods=['GET'])
def get_audit_logs():
    try:
        # Untuk saat ini return dummy data, nanti bisa dikembangkan dengan model AuditLog
        audit_logs = [
            {
                'timestamp': datetime.utcnow().isoformat(),
                'user': 'Admin User',
                'role': 'Admin',
                'aksi': 'LOGIN',
                'aktivitas': 'Login ke sistem',
                'status': 'Success',
                'ipAddress': '192.168.1.100',
                'lokasi': 'Madiun',
                'deskripsi': 'User berhasil login ke sistem monitoring'
            }
        ]
        return jsonify(audit_logs), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== INISIALISASI DATABASE ====================

def init_database():
    """Inisialisasi database dengan data sample"""
    with app.app_context():
        db.create_all()
        
        # Cek apakah sudah ada data
        if DMFT.query.count() == 0:
            # Data sample DMF-T
            sample_dmft = [
                DMFT(wilayah="Puskesmas Madiun Kota", dmft_index=2.8, decayed=1.2, missing=0.8, filled=0.8, jumlah_pasien=450, kategori="Rendah"),
                DMFT(wilayah="Puskesmas Taman", dmft_index=4.5, decayed=2.1, missing=1.5, filled=0.9, jumlah_pasien=320, kategori="Sedang"),
                DMFT(wilayah="Puskesmas Kartoharjo", dmft_index=6.2, decayed=3.5, missing=2.0, filled=0.7, jumlah_pasien=280, kategori="Tinggi"),
                DMFT(wilayah="Puskesmas Manguharjo", dmft_index=3.4, decayed=1.5, missing=1.0, filled=0.9, jumlah_pasien=390, kategori="Rendah"),
                DMFT(wilayah="Puskesmas Oro-Oro Ombo", dmft_index=5.1, decayed=2.8, missing=1.6, filled=0.7, jumlah_pasien=310, kategori="Sedang")
            ]
            db.session.add_all(sample_dmft)
            
            # Data sample Program CKG
            sample_program = [
                ProgramCKG(nama_program="Program Sikat Gigi Massal SD", wilayah_target="Puskesmas Madiun Kota", status="Berjalan", tanggal_mulai="2026-06-01", target_dmft="< 2.5"),
                ProgramCKG(nama_program="Edukasi Kesehatan Gigi Remaja", wilayah_target="Puskesmas Taman", status="Berjalan", tanggal_mulai="2026-06-15", target_dmft="< 4.0"),
                ProgramCKG(nama_program="Pemeriksaan Gigi Gratis Lansia", wilayah_target="Puskesmas Kartoharjo", status="Berjalan", tanggal_mulai="2026-06-10", target_dmft="< 5.5")
            ]
            db.session.add_all(sample_program)
            
            # Data sample Aktivitas Tim
            sample_aktivitas = [
                AktivitasTim(tim="Tim A - Dr. Siti", kegiatan="Pemeriksaan gigi siswa SD Negeri 1", waktu="08:30", jumlah_pasien=45, wilayah="Puskesmas Madiun Kota"),
                AktivitasTim(tim="Tim B - Drg. Budi", kegiatan="Penyuluhan kesehatan gigi ibu hamil", waktu="10:00", jumlah_pasien=20, wilayah="Puskesmas Kartoharjo"),
                AktivitasTim(tim="Tim C - Drg. Ani", kegiatan="Scaling dan pembersihan karang gigi", waktu="13:00", jumlah_pasien=15, wilayah="Puskesmas Taman")
            ]
            db.session.add_all(sample_aktivitas)
            
            db.session.commit()
            print("[OK] Database berhasil diinisialisasi dengan data sample!")
        
        # Tambahkan sample users jika belum ada
        if User.query.count() == 0:
            sample_users = [
                User(name="Admin User", email="admin@geodisease.com", password="admin123", role="admin"),
                User(name="Dinas Kesehatan", email="user@geodisease.com", password="user123", role="user"),
                User(name="Tim Kesehatan", email="tim@geodisease.com", password="tim123", role="tim kesehatan")
            ]
            db.session.add_all(sample_users)
            db.session.commit()
            print("[OK] Sample users berhasil ditambahkan!")
            print("     - Admin: admin@geodisease.com / admin123")
            print("     - User: user@geodisease.com / user123")
            print("     - Tim Kesehatan: tim@geodisease.com / tim123")

if __name__ == '__main__':
    init_database()
    print("[RUNNING] Server CKG Backend berjalan di http://127.0.0.1:5000")
    app.run(debug=True, host='127.0.0.1', port=5000)
