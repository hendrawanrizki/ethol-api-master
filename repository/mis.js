module.exports = {
  agama: (conn) => {
    return conn
      .execute("select * from agama@mis order by nomor asc")
      .then((res) =>
        res.rows.map((item) => {
          return {
            nomor: item[0],
            agama: item[1],
          };
        })
      )
      .catch((err) => {
        console.log("ambilSemua agama : ", err);
        return [];
      });
  },
  hari: (conn) => {
    return conn
      .execute("select * from hari@mis")
      .then((res) =>
        res.rows.map((item) => {
          return {
            nomor: item[0],
            hari: item[1],
          };
        })
      )
      .catch((err) => {
        console.log("ambilSemua hari : ", err);
        return [];
      });
  },
  jam: (conn) => {
    return conn
      .execute(
        "select j.*, h.hari nama_hari, js.jenis_schema nama_jenis_schema, p.program nama_program, p.keterangan keterangan_nama_program  from jam@mis j " +
          "left join hari@mis h on h.nomor = j.hari " +
          "left join jenis_schema@mis js on js.nomor = j.jenis_schema " +
          "left join program@mis p on p.nomor = j.program "
      )
      .then((res) =>
        res.rows.map((item) => {
          return {
            nomor: item[0],
            khusus: item[1],
            program: item[2],
            hari: item[3],
            kode: item[4],
            jam: item[5],
            sore: item[6],
            jenis_schema: item[7],
            nama_hari: item[8],
            nama_jenis_schema: item[9],
            nama_program: item[10],
            keterangan_nama_program: item[11],
          };
        })
      )
      .catch((err) => {
        console.log("ambilSemua jam : ", err);
        return [];
      });
  },
  jamPjj: (conn) => {
    return conn
      .execute(
        "select jp.*, h.hari nama_hari, p.program nama_program, p.keterangan keterangan_nama_program from jam_pjj@mis jp " +
          "left join hari@mis h on h.nomor = jp.hari " +
          "left join program@mis p on p.nomor = jp.program "
      )
      .then((res) =>
        res.rows.map((item) => {
          return {
            nomor: item[0],
            khusus: item[1],
            program: item[2],
            hari: item[3],
            kode: item[4],
            jam: item[5],
            sore: item[6],
            jam_absen: item[7],
            jam_x_awal: item[8],
            jam_x_akhir: item[9],
            nama_hari: item[10],
            nama_program: item[11],
            keterangan_nama_program: item[12],
          };
        })
      )
      .catch((err) => {
        console.log("ambilSemua jamPjj : ", err);
        return [];
      });
  },
  jamPsdku: (conn) => {
    return conn
      .execute(
        "select jp.*, h.hari nama_hari, p.program nama_program, p.keterangan keterangan_nama_program from jam_ps@mis jp " +
          "left join hari@mis h on h.nomor = jp.hari " +
          "left join program@mis p on p.nomor = jp.program "
      )
      .then((res) =>
        res.rows.map((item) => {
          return {
            nomor: item[0],
            khusus: item[1],
            program: item[2],
            hari: item[3],
            kode: item[4],
            jam: item[5],
            sore: item[6],
            jam_absen: item[7],
            nama_hari: item[8],
            nama_program: item[9],
            keterangan_nama_program: item[10],
          };
        })
      )
      .catch((err) => {
        console.log("ambilSemua jamPsdku : ", err);
        return [];
      });
  },
  jamReg: (conn) => {
    return conn
      .execute(
        "select jr.*, h.hari nama_hari, p.program nama_program, p.keterangan keterangan_nama_program from jam_reg@mis jr " +
          "left join hari@mis h on h.nomor = jr.hari " +
          "left join program@mis p on p.nomor = jr.program "
      )
      .then((res) =>
        res.rows.map((item) => {
          return {
            nomor: item[0],
            khusus: item[1],
            program: item[2],
            hari: item[3],
            kode: item[4],
            jam: item[5],
            sore: item[6],
            nama_hari: item[7],
            nama_program: item[8],
            keterangan_nama_program: item[9],
          };
        })
      )
      .catch((err) => {
        console.log("ambilSemua jamReg : ", err);
        return [];
      });
  },
  jenisSchema: (conn) => {
    return conn
      .execute("select * from jenis_schema@mis")
      .then((res) =>
        res.rows.map((item) => {
          return {
            nomor: item[0],
            jenis_schema: item[1],
          };
        })
      )
      .catch((err) => {
        console.log("ambilSemua jenisSchema : ", err);
        return [];
      });
  },
  jurusan: (conn) => {
    return conn
      .execute("select j.* from jurusan@mis j  order by j.jurusan")
      .then((res) =>
        res.rows.map((item) => {
          return {
            nomor: item[0],
            jurusan: item[1],
            kajur: item[2],
            sekjur: item[3],
            alias: item[4],
            jurusan_inggris: item[5],
            jurusan_lengkap: item[6],
          };
        })
      )
      .catch((err) => {
        console.log("ambilSemua jurusan : ", err);
        return [];
      });
  },
  kelas: (conn) => {
    return conn
      .execute(
        "select k.*, p.program as nama_program, p.keterangan as keterangan_program, j.jurusan, peg.nip as nip_wali_kelas, peg.nama as nama_wali_kelas from kelas@mis k " +
          "left join program@mis p on p.nomor = k.program " +
          "left join jurusan@mis j on j.nomor = k.jurusan " +
          "left join pegawai@mis peg on peg.nomor = k.wali_kelas "
      )
      .then((res) =>
        res.rows.map((item) => {
          return {
            nomor: item[0],
            program: item[1],
            jurusan: item[2],
            kelas: item[3],
            pararel: item[4],
            kode: item[5],
            kode_kelas_absen: item[6],
            kode_epsbed: item[7],
            konsentrasi: item[8],
            wali_kelas: item[9],
            nama_program: item[10],
            keterangan_program: item[11],
            jurusan: item[12],
            nip_wali_kelas: item[13],
            nama_wali_kelas: item[14],
          };
        })
      )
      .catch((err) => {
        console.log("ambilSemua jurusan : ", err);
        return [];
      });
  },
  kuliah: (conn, semester, tahun, program, jurusan) => {
    return conn
      .execute(
        "select kul.*, m.matakuliah as nama_matakuliah, m.matakuliah_singkatan nama_matakuliah_singkatan, m.matakuliah_inggris nama_matakuliah_inggris, p.program nama_program, p.keterangan keterangan_nama_program, jur.jurusan, hr1.hari hari_1, j1.jam jam_1, r1.ruang ruang_1, r1.keterangan ket_ruang_1,  peg.nip as nip_dosen, peg.nama as nama_dosen, p.nomor nomor_program, jur.nomor nomor_jurusan, js.jenis_schema nama_jenis_schema  from kuliah@mis kul " +
          "left join matakuliah@mis m on m.nomor=kul.matakuliah and m.jenis_schema=kul.jenis_schema  " +
          "left join program@mis p on p.nomor = m.program " +
          "left join jurusan@mis jur on jur.nomor = m.jurusan " +
          "left join hari@mis hr1 on hr1.nomor = kul.hari " +
          "left join jam@mis j1 on j1.nomor = kul.jam " +
          "left join ruang_kuliah@mis r1 on r1.nomor = kul.ruang " +
          "left join pegawai@mis peg on peg.nomor = kul.dosen " +
          "left join jenis_schema@mis js on js.nomor = kul.jenis_schema " +
          "WHERE kul.semester=:0 and kul.tahun=:1 and p.nomor=:2 and jur.nomor=:3 ",
        [semester, tahun, program, jurusan]
      )
      .then((res) =>
        res.rows.map((item) => {
          return {
            nomor: item[0],
            tahun: item[1],
            semester: item[2],
            nomor_program: item[28],
            nomor_jurusan: item[29],
            matakuliah: item[3],
            hari: item[4],
            jam: item[5],
            ruang: item[6],
            hari_2: item[7],
            jam_2: item[8],
            ruang_2: item[9],
            dosen: item[10],
            asisten: item[11],
            teknisi: item[12],
            kode_kelas: item[13],
            pararel: item[14],
            jenis_schema: item[15],
            nama_matakuliah: item[16],
            nama_matakuliah_singkatan: item[17],
            nama_matakuliah_inggris: item[18],
            nama_program: item[19],
            keterangan_nama_program: item[20],
            jurusan: item[21],
            hari_1: item[22],
            jam_1: item[23],
            ruang_1: item[24],
            ket_ruang_1: item[25],
            nip_dosen: item[26],
            nama_dosen: item[27],
            nama_jenis_schema: item[30],
          };
        })
      )
      .catch((err) => {
        console.log("ambilSemua agama : ", err);
        return [];
      });
  },
  program: (conn) => {
    return conn
      .execute("select p.* from program@mis p order by p.program")
      .then((res) =>
        res.rows.map((item) => {
          return {
            nomor: item[0],
            program: item[1],
            keterangan: item[2],
            lama_studi: item[3],
            kode_epsbed: item[4],
            gelar: item[5],
            gelar_inggris: item[6],
            program_ijazah: item[7],
            program_ijazah_singkat: item[8],
            program_skpi: item[9],
            semester_maksimal: item[10],
            program_transkrip: item[11],
          };
        })
      )
      .catch((err) => {
        console.log("ambilSemua agama : ", err);
        return [];
      });
  },
  matakuliah: (conn, tahun, semester, program, jurusan) => {
    return conn
      .execute(
        "select mk.*, js.jenis_schema nama_jenis_schema from matakuliah@mis mk " +
          "left join jenis_schema@mis js on js.nomor = mk.jenis_schema " +
          "WHERE mk.semester=:0 and mk.tahun=:1 and mk.program=:2 and mk.jurusan=:3 " +
          "order by mk.matakuliah asc",
        [semester, tahun, program, jurusan]
      )
      .then((res) =>
        res.rows.map((item) => {
          return {
            nomor: item[0],
            program: item[1],
            jurusan: item[2],
            semester: item[3],
            kode: item[4],
            matakuliah: item[5],
            jam: item[6],
            sks: item[7],
            mk_group: item[8],
            mk_wajib: item[9],
            tahun: item[10],
            matakuliah_inggris: item[11],
            matakuliah_singkatan: item[12],
            subkampus: item[13],
            pilihan: item[14],
            jenis_schema: item[15],
            nama_jenis_schema: item[16],
          };
        })
      )
      .catch((err) => {
        console.log("ambilSemua matakuliah : ", err);
        return [];
      });
  },
  pegawai: (conn) => {
    return conn
      .execute("select * from pegawai@mis order by nomor asc")
      .then((res) =>
        res.rows.map((item) => {
          return {
            nomor: item[0],
            nip: item[1],
            noid: item[2],
            nama: item[3],
            staff: item[4],
            jurusan: item[5],
            homepage: item[6],
            // password: item[7],
            hak: item[8],
            username: item[9],
            jabatan: item[10],
            sex: item[11],
            agama: item[12],
            email: item[13],
            alamat: item[14],
            notelp: item[15],
            golawal: item[16],
            golakhir: item[17],
            tmtcpns: item[18],
            tmtpns: item[19],
            tmtfungsional: item[20],
            tmtakhir: item[21],
            fungsional: item[22],
            karpeg: item[23],
            masakerja_tahun: item[24],
            pendidikan: item[25],
            ruang: item[26],
            keterangan: item[27],
            tmplahir: item[28],
            tgllahir: item[29],
            shift: item[30],
            hp: item[31],
            goldarah: item[32],
            gelar_dpn: item[33],
            gelar_blk: item[34],
            kredit: item[35],
            kuma: item[36],
            kumb: item[37],
            kumc: item[38],
            kumd: item[39],
            rapat: item[40],
            status_kawin: item[41],
            kelurahan: item[42],
            kecamatan: item[43],
            kota: item[44],
            propinsi: item[45],
            tinggi: item[46],
            berat: item[47],
            rambut: item[48],
            muka: item[49],
            warna: item[50],
            ciri: item[51],
            cacat: item[52],
            hobby: item[53],
            alamat2: item[54],
            notelp2: item[55],
            alamat3: item[56],
            notelp3: item[57],
            manager: item[58],
            surat: item[59],
            status: item[60],
            askes: item[61],
            pangkat: item[62],
            rekening_bank: item[63],
            masakerja_bulan: item[64],
            level_mrc: item[65],
            jabatan_honorarium: item[66],
            status_karyawan: item[67],
            level_agenda: item[68],
            jabatan_khusus: item[69],
            perpus_kode_staff: item[70],
            dapat_uang_kinerja: item[71],
            dapat_uang_kehadiran: item[72],
            dapat_uang_makan: item[73],
            tmtstruktural: item[74],
            tmttugas_tambahan: item[75],
            jabatan_tugas_tambahan: item[76],
            kode_dosen_sk034: item[77],
            dosen_vedc: item[78],
            nip_baru: item[79],
            kode_smart_card: item[80],
            nip_lama: item[81],
            npwp: item[82],
            serdos: item[83],
            plp: item[84],
            edit_absen: item[85],
            fungsional_plp: item[86],
            kunci_ekios: item[87],
            kompetensi: item[88],
            pendidikan_terakhir: item[89],
            dapat_remunisasi: item[90],
            karis_karsu: item[91],
            program_studi: item[92],
            tmtserdos: item[93],
            key_qrcode: item[94],
            jenis_rekening: item[95],
            jenis_tm_dosen_lb: item[96],
            status_karyawan2: item[97],
          };
        })
      )
      .catch((err) => {
        console.log("ambilSemua pegawai : ", err);
        return [];
      });
  },
  ruangKuliah: (conn) => {
    return conn
      .execute(
        "select rk.*, p.nama nama_kepala, p.gelar_dpn gelar_dpn_kepala, p.gelar_blk gelar_blk_kepala, p2.nama nama_asisten, p2.gelar_dpn gelar_dpn_asisten, p2.gelar_blk gelar_blk_asisten, p3.nama nama_teknisi, p3.gelar_dpn gelar_dpn_teknisi, p3.gelar_blk gelar_blk_teknisi from ruang_kuliah@mis rk " +
          "left join pegawai@mis p on p.nomor = rk.kepala " +
          "left join pegawai@mis p2 on p2.nomor = rk.asisten " +
          "left join pegawai@mis p3 on p3.nomor = rk.teknisi "
      )
      .then((res) =>
        res.rows.map((item) => {
          return {
            nomor: item[0],
            ruang: item[1],
            keterangan: item[2],
            kepala: item[3],
            asisten: item[4],
            teknisi: item[5],
            jurusan: item[6],
            homepage: item[7],
            email: item[8],
            username: item[9],
            password: item[10],
            kode: item[11],
            telp: item[12],
            tender: item[13],
            is_ruang_kuliah: item[14],
            kapasitas_mahasiswa: item[15],
            pemakai: item[16],
            urut_ujian: item[17],
            is_ruang_rapat: item[18],
            pengelola: item[19],
            informasi: item[20],
            tanggal_awal_off: item[21],
            tanggal_akhir_off: item[22],
            qrcode: item[23],
            nama_kepala: item[24],
            gelar_dpn_kepala: item[25],
            gelar_blk_kepala: item[26],
            nama_asisten: item[27],
            gelar_dpn_asisten: item[28],
            gelar_blk_asisten: item[29],
            nama_teknisi: item[30],
            gelar_dpn_teknisi: item[31],
            gelar_blk_teknisi: item[32],
          };
        })
      )
      .catch((err) => {
        console.log("ambilSemua ruangKuliah : ", err);
        return [];
      });
  },
  soal: (conn, jenis, tahun, semester) => {
    return conn
      .execute(
        "select s.*, js.jenis_schema nama_jenis_schema, m.matakuliah as nama_matakuliah, m.matakuliah_singkatan nama_matakuliah_singkatan, m.matakuliah_inggris nama_matakuliah_inggris, p.program nama_program, p.keterangan keterangan_nama_program from soal@mis s " +
          "left join jenis_schema@mis js on js.nomor = s.jenis_schema " +
          "left join kuliah@mis kul on kul.nomor = s.kuliah and kul.jenis_schema=js.nomor " +
          "left join matakuliah@mis m on m.nomor=kul.matakuliah and m.jenis_schema=kul.jenis_schema  " +
          "left join program@mis p on p.nomor = m.program " +
          "where s.jenis=:0 and kul.tahun=:1 and kul.semester=:2 ",
        [jenis, tahun, semester]
      )
      .then((res) =>
        res.rows.map((item) => {
          return {
            nomor: item[0],
            kuliah: item[1],
            jenis: item[2],
            file_extension: item[3],
            jenis_schema: item[4],
            nama_jenis_schema: item[5],
            nama_matakuliah: item[6],
            nama_matakuliah_singkatan: item[7],
            nama_matakuliah_inggris: item[8],
            nama_program: item[9],
            keterangan_nama_program: item[10],
          };
        })
      )
      .catch((err) => {
        console.log("ambilSemua soal : ", err);
        return [];
      });
  },
  kuliahAgama: (conn) => {
    return conn
      .execute(
        "select ka.*, a.agama, p.nip, p.nama, p.gelar_dpn, p.gelar_blk, js.jenis_schema from kuliah_agama@mis ka " +
          "left join agama@mis a on a.nomor = ka.agama " +
          "left join pegawai@mis p on p.nomor = ka.dosen " +
          "left join jenis_schema@mis js on js.nomor = ka.jenis_schema "
      )
      .then((res) =>
        res.rows.map((item) => {
          return {
            nomor: item[0],
            agama: item[1],
            dosen: item[2],
            hari: item[3],
            jam: item[4],
            ruang: item[5],
            tahun: item[6],
            semester: item[7],
            durasi: item[8],
            jenis_schema: item[9],
            agama: item[10],
            nip: item[11],
            nama: item[12],
            gelar_dpn: item[13],
            gelar_blk: item[14],
            jenis_schema: item[15],
          };
        })
      )
      .catch((err) => {
        console.log("ambilSemua kuliah_agama : ", err);
        return [];
      });
  },
  kuliahAgamaMahasiswa: (conn) => {
    return conn
      .execute(
        "select kam.*, a.agama, mhs.nrp, mhs.nama nama_mahasiswa from kuliah_agama_mahasiswa@mis kam " +
          "left join  kuliah_agama@mis ka on ka.nomor = kam.kuliah_agama " +
          "left join agama@mis a on a.nomor = ka.agama " +
          "left join jenis_schema@mis js on js.nomor = ka.jenis_schema " +
          "left join (select m.nomor, m.nrp, m.nama from mahasiswa@mis m) mhs on mhs.nomor = kam.mahasiswa "
      )
      .then((res) =>
        res.rows.map((item) => {
          return {
            nomor: item[0],
            kuliah_agama: item[1],
            mahasiswa: item[2],
            agama: item[3],
            nrp: item[4],
            nama_mahasiswa: item[5],
          };
        })
      )
      .catch((err) => {
        console.log("ambilSemua kuliahAgamaMahasiswa : ", err);
        return [];
      });
  },
  mahasiswa: (conn, angkatan, program, jurusan) => {
    return conn
      .execute(
        "select m.nomor, m.nrp, m.nama, m.kelas, m.status, m.tgllahir, m.tmplahir, m.tglmasuk, m.jenis_kelamin, m.agama, m.alamat, m.notelp, m.notelp_ortu, m.darah, m.angkatan, m.semester_masuk, m.tahun_lulus, m.semester_lulus, k.jurusan jurusan_kelas, k.kode kode_kelas, p.program as nama_program, p.keterangan as keterangan_program, j.jurusan from mahasiswa@mis m " +
          "left join kelas k on k.nomor = m.kelas " +
          "left join program@mis p on p.nomor = k.program " +
          "left join jurusan@mis j on j.nomor = k.jurusan " +
          "where m.angkatan=:0 and k.program=:1 and k.jurusan=:2 ",
        [angkatan, program, jurusan]
      )
      .then((res) =>
        res.rows.map((item) => {
          return {
            nomor: item[0],
            nrp: item[1],
            nama: item[2],
            kelas: item[3],
            status: item[4],
            tgllahir: item[5],
            tmplahir: item[6],
            tglmasuk: item[7],
            jenis_kelamin: item[8],
            agama: item[9],
            alamat: item[10],
            notelp: item[11],
            notelp_ortu: item[12],
            darah: item[13],
            angkatan: item[14],
            semester_masuk: item[15],
            tahun_lulus: item[16],
            semester_lulus: item[17],
            jurusan_kelas: item[18],
            kode_kelas: item[19],
            nama_program: item[20],
            keterangan_program: item[21],
            jurusan: item[22],
          };
        })
      )
      .catch((err) => {
        console.log("ambilSemua mahasiswa : ", err);
        return [];
      });
  },
  soalAgama: (conn, jenis, tahun, semester) => {
    return conn
      .execute(
        "select sa.*, a.agama, js.jenis_schema nama_jenis_schema from soal_agama@mis sa " +
          "left join jenis_schema@mis js on js.nomor = sa.jenis_schema " +
          "left join kuliah_agama@mis kul on kul.nomor = sa.kuliah_agama " +
          "left join agama@mis a on a.nomor = kul.agama " +
          "where sa.jenis=:0 and kul.tahun=:1 and kul.semester=:2",
        [jenis, tahun, semester]
      )
      .then((res) =>
        res.rows.map((item) => {
          return {
            nomor: item[0],
            kuliah_agama: item[1],
            jenis: item[2],
            file_extension: item[3],
            jenis_schema: item[4],
            agama: item[5],
            nama_jenis_schema: item[6],
          };
        })
      )
      .catch((err) => {
        console.log("ambilSemua soal_agama : ", err);
        return [];
      });
  },
  kuliahPararel: (conn, hari, jenis_schema, tahun, semester) => {
    return conn
      .execute(
        "select kp.*, m.matakuliah, r1.ruang, r1.keterangan keterangan_ruang, p.nama nama_dosen, p.nip nip_dosen, p.gelar_dpn, p.gelar_blk, h.hari nama_hari, js.jenis_schema  from kuliah_pararel@mis kp " +
          "left join kuliah@mis k on k.nomor = kp.kuliah and k.jenis_schema = kp.jenis_schema " +
          "left join matakuliah@mis m on m.nomor=k.matakuliah and m.jenis_schema=k.jenis_schema  " +
          "left join pegawai@mis p on p.nomor = kp.dosen " +
          "left join hari@mis h on h.nomor = kp.hari " +
          "left join jenis_schema@mis js on js.nomor = kp.jenis_schema " +
          "left join ruang_kuliah@mis r1 on r1.nomor = k.ruang " +
          "where kp.hari=:0 and kp.jenis_schema=:1 and k.tahun=:2 and k.semester=:3 ",
        [hari, jenis_schema, tahun, semester]
      )
      .then((res) =>
        res.rows.map((item) => {
          return {
            nomor: item[0],
            kuliah: item[1],
            dosen: item[2],
            minggu: item[3],
            hari: item[4],
            asisten: item[5],
            teknisi: item[6],
            jenis_schema: item[7],
            matakuliah: item[8],
            ruang: item[9],
            keterangan_ruang: item[10],
            nama_dosen: item[11],
            nip_dosen: item[12],
            gelar_dpn: item[13],
            gelar_blk: item[14],
            nama_hari: item[15],
            jenis_schema: item[16],
          };
        })
      )
      .catch((err) => {
        console.log("ambilSemua kuliahPararel : ", err);
        return [];
      });
  },
  mahasiswaSemester: (conn, tahun, semester, program, jurusan) => {
    return conn
      .execute(
        "select k.nomor, k.jenis_schema, mk.matakuliah, k.kode_kelas, ms.jml_mhs, js.jenis_schema as nama_jenis_schema " +
          "from kuliah@mis k " +
          "left join matakuliah@mis mk on mk.nomor=k.matakuliah and k.jenis_schema=mk.jenis_schema " +
          "left join (select kuliah, jenis_schema, count(mahasiswa) as jml_mhs from mahasiswa_semester@mis group by kuliah, jenis_schema) ms on k.nomor=ms.kuliah and k.jenis_schema=ms.jenis_schema " +
          "left join jenis_schema@mis js on js.nomor = k.jenis_schema " +
          "where k.tahun=:0 and k.semester=:1 and mk.program=:2 and mk.jurusan=:3 " +
          "order by k.nomor",
        [tahun, semester, program, jurusan]
      )
      .then((res) =>
        res.rows.map((item) => {
          return {
            nomor: item[0],
            jenis_schema: item[1],
            matakuliah: item[2],
            kode_kelas: item[3],
            jml_mhs: item[4],
            nama_jenis_schema: item[5],
          };
        })
      )
      .catch((err) => {
        console.log("ambilSemua mahasiswSemester : ", err);
        return [];
      });
  },
  detailMahasiswaSemester: (conn, kuliah, jenis_schema) => {
    return conn
      .execute(
        "select m.nomor, m.nrp, m.nama from mahasiswa_semester@mis ms " +
          "left join kuliah@mis k on k.nomor=ms.kuliah and k.jenis_schema=ms.jenis_schema " +
          "left join mahasiswa@mis m on ms.mahasiswa=m.nomor " +
          "where k.nomor=:0 and k.jenis_schema=:1 ",
        [kuliah, jenis_schema]
      )
      .then((res) =>
        res.rows.map((item) => {
          return {
            nomor: item[0],
            nrp: item[1],
            nama_mahasiswa: item[2],
          };
        })
      )
      .catch((err) => {
        console.log("ambilSemua detailMahasiswaSemester : ", err);
        return [];
      });
  },
};
