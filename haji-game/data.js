/* Data konten Perjalanan Haji 3D — DRAF, belum ditinjau peninjau syariah.
   Susunan utama mengikuti mazhab Syafi'i (selaras bimbingan manasik Kemenag RI);
   titik perbedaan mazhab lain dicantumkan. Jarak dan koordinat bersifat perkiraan/skematis. */
window.DATA = (function () {
  const KAABA = { lat: 21.4225, lon: 39.8262 };

  /* ---------------- Miqat (sama dengan game Umrah) ---------------- */
  const MIQAT = [
    { id: 'hulaifah', nama: 'Dzul Hulaifah', alias: `Bir 'Ali / Abyar 'Ali`, lat: 24.4136, lon: 39.5448, untuk: 'Penduduk Madinah dan yang datang melalui Madinah', arah: 'Utara (Madinah)', cat: `Miqat terjauh dari Makkah, sekitar 410 km garis lurus. Di sini ada Masjid Dzul Hulaifah (Masjid Bir 'Ali). Jamaah Indonesia gelombang pertama yang ke Madinah dahulu berihram di sini.` },
    { id: 'juhfah', nama: 'Al-Juhfah', alias: 'Dekat Rabigh', lat: 22.7156, lon: 39.1469, untuk: 'Penduduk Syam, Mesir, dan Maghrib (Afrika Utara)', arah: 'Barat laut (pesisir Laut Merah)', cat: 'Kini jamaah biasanya berihram di Rabigh karena Al-Juhfah sudah tidak berpenghuni.' },
    { id: 'yalamlam', nama: 'Yalamlam', alias: `As-Sa'diyah`, lat: 20.5167, lon: 39.8667, untuk: 'Penduduk Yaman serta yang datang dari arah selatan: India, Asia Tenggara termasuk Indonesia', arah: 'Selatan', cat: 'Jamaah Indonesia yang langsung ke Jeddah/Makkah umumnya berihram saat pesawat sejajar Yalamlam atau dari asrama embarkasi; ikuti arahan pembimbing.' },
    { id: 'qarn', nama: 'Qarnul Manazil', alias: 'As-Sail al-Kabir', lat: 21.6333, lon: 40.4167, untuk: 'Penduduk Najd, Thaif, dan Riyadh', arah: 'Timur (dataran tinggi Najd)', cat: 'Terletak di jalur menuju Thaif; Wadi Mahram dekat situ.' },
    { id: 'irq', nama: `Dzatu 'Irq`, alias: 'Adh-Dhariibah', lat: 21.9333, lon: 40.4333, untuk: 'Penduduk Irak dan Iran serta yang datang dari arah timur laut', arah: 'Timur laut', cat: `Ulama berbeda pendapat apakah ditetapkan langsung oleh Nabi saw. atau oleh ijtihad 'Umar; jamaah sepakat sah berihram dari sini.` }
  ];
  const ASAL = [
    { id: 'madinah', label: 'Dari Madinah', sub: 'termasuk jamaah Indonesia yang ke Madinah dulu', miqat: 'hulaifah' },
    { id: 'syam', label: 'Dari Syam / Mesir / Maghrib', sub: 'jalur utara & barat laut', miqat: 'juhfah' },
    { id: 'selatan', label: 'Dari Yaman / India / Indonesia', sub: 'langsung ke Jeddah atau Makkah dari selatan', miqat: 'yalamlam' },
    { id: 'najd', label: 'Dari Najd / Riyadh / Thaif', sub: 'dataran tinggi timur', miqat: 'qarn' },
    { id: 'irak', label: 'Dari Irak / Iran', sub: 'jalur timur laut', miqat: 'irq' }
  ];
  const SEKITAR = [
    { nama: `Makkah (Ka'bah)`, lat: 21.4225, lon: 39.8262 },
    { nama: 'Jeddah (Bandara KAIA)', lat: 21.6796, lon: 39.1565 },
    { nama: 'Madinah', lat: 24.4672, lon: 39.6111 },
    { nama: 'Thaif', lat: 21.2703, lon: 40.4158 }
  ];
  const PANTAI = [[25.0, 37.3], [24.6, 37.7], [24.09, 38.06], [23.5, 38.6], [22.8, 39.03], [22.2, 39.1], [21.5, 39.15], [20.9, 39.35], [20.15, 40.27], [19.6, 40.9]];

  /* ---------------- Peta Makkah–Armuzna (skematis, koordinat perkiraan) ---------------- */
  const TITIK = {
    haram: { nama: 'Masjidil Haram', lat: 21.4225, lon: 39.8262 },
    tanim: { nama: `Tan'im (Masjid 'Aisyah)`, lat: 21.4650, lon: 39.7710 },
    mina: { nama: 'Mina (Jamarat)', lat: 21.4222, lon: 39.8733 },
    muzd: { nama: `Muzdalifah (Masy'aril Haram)`, lat: 21.3880, lon: 39.9216 },
    namirah: { nama: 'Masjid Namirah', lat: 21.3555, lon: 39.9605 },
    jabal: { nama: 'Jabal Rahmah (Arafah)', lat: 21.3548, lon: 39.9845 }
  };
  /* Tahap perjalanan antartitik: dipakai untuk menyorot rute pada peta. jarak = perkiraan jalan raya (km) */
  const RUTE = {
    makMina: { dari: 'haram', ke: 'mina', jarak: 6, nama: 'Makkah → Mina' },
    minaArafah: { dari: 'mina', ke: 'namirah', jarak: 14, nama: 'Mina → Arafah' },
    arafahMuzd: { dari: 'jabal', ke: 'muzd', jarak: 9, nama: 'Arafah → Muzdalifah' },
    muzdMina: { dari: 'muzd', ke: 'mina', jarak: 5, nama: 'Muzdalifah → Mina' },
    minaMak: { dari: 'mina', ke: 'haram', jarak: 6, nama: 'Mina → Makkah' },
    makTanim: { dari: 'haram', ke: 'tanim', jarak: 7, nama: `Makkah → Tan'im` }
  };

  /* ---------------- Jenis haji ---------------- */
  const MODE = {
    tamattu: {
      nama: `Haji Tamattu'`, ringkas: 'Umrah dulu, lalu haji', ikon: '①',
      alur: `Ihram umrah di miqat → thawaf + sa'i umrah → tahalul (boleh melepas ihram) → 8 Dzulhijjah ihram haji dari Makkah → Arafah → Muzdalifah → Mina → thawaf ifadhah + sa'i haji → wada'`,
      niat: 'niatTamattu', niatId: 'niatHajiId', ihram1: 'umrah', dam: true, tahalulAwal: true,
      ciri: [`Umrah dan haji dikerjakan terpisah dalam satu musim haji, dengan tahalul di antaranya.`, `Wajib dam nusuk (hadyu): seekor kambing atau ⅐ unta/sapi (QS. al-Baqarah 196).`, `Dua kali sa'i: sa'i umrah dan sa'i haji.`, `Paling ringan menjaga larangan ihram, karena ada masa bebas ihram setelah umrah. Banyak dipilih jamaah Indonesia; ikuti arahan Kemenag/pembimbing rombongan.`],
      mazhab: `Hanbali: paling utama (Nabi saw. mengisyaratkan, HR. al-Bukhari & Muslim dari Jabir). Syafi'i & Maliki: ifrad paling utama bila diikuti umrah pada tahun yang sama. Hanafi: qiran paling utama. Semua sah.`
    },
    ifrad: {
      nama: 'Haji Ifrad', ringkas: 'Haji dulu, lalu umrah (opsional)', ikon: '②',
      alur: `Ihram haji di miqat → thawaf qudum (+ sa'i haji) → tetap berihram sampai 10 Dzulhijjah → Armuzna → thawaf ifadhah → tasyriq → (umrah dari Tan'im, opsional) → wada'`,
      niat: 'niatHaji', niatId: 'niatHajiId', ihram1: 'haji', dam: false, tahalulAwal: false,
      ciri: [`Hanya berniat haji dari miqat; umrah, bila mau, dikerjakan setelah haji (misalnya dari Tan'im).`, `Tidak wajib dam nusuk (menyembelih qurban hanya sunnah).`, `Tetap berihram sejak miqat sampai tahalul awal pada 10 Dzulhijjah, sehingga larangan ihram dijaga lebih lama.`, `Thawaf qudum disunnahkan; sa'i haji boleh langsung dikerjakan setelahnya sehingga tidak diulang setelah thawaf ifadhah.`],
      mazhab: `Syafi'i & Maliki: paling utama bila umrah dikerjakan pada tahun yang sama. Hanbali memandang tamattu' lebih utama. Sah menurut kesepakatan ulama.`
    },
    qiran: {
      nama: 'Haji Qiran', ringkas: 'Umrah dan haji digabung', ikon: '③',
      alur: `Ihram umrah + haji sekaligus di miqat → thawaf qudum + sa'i (cukup satu untuk dua ibadah) → tetap berihram sampai 10 Dzulhijjah → Armuzna → thawaf ifadhah → tasyriq → wada'`,
      niat: 'niatQiran', niatId: 'niatQiranId', ihram1: 'qiran', dam: true, tahalulAwal: false,
      ciri: [`Satu niat ihram untuk umrah dan haji sekaligus: Labbaika 'umratan wa hajjan.`, `Wajib dam nusuk seperti tamattu'.`, `Satu thawaf (qudum) dan satu sa'i sudah mencukupi umrah dan haji menurut jumhur (Syafi'i, Maliki, Hanbali; HR. Muslim dari Jabir); Hanafi mewajibkan dua thawaf dan dua sa'i.`, `Tetap berihram dari miqat sampai 10 Dzulhijjah.`],
      mazhab: `Hanafi: paling utama. Mayoritas riwayat menyebut Nabi saw. menunaikan haji qiran (Ibnul Qayyim, Zadul Ma'ad), meski sahabat meriwayatkannya berbeda-beda (ifrad/tamattu'/qiran) karena sudut pandang masing-masing.`
    }
  };

  /* ---------------- Doa (tiga tingkat) ----------------
     lvl 1: Sederhana & umum — cukup dihafal semua jamaah
     lvl 2: Lazim, diketahui umum, dan berdalil sahih/hasan
     lvl 3: Lanjutan: atsar, lafal masyhur, atau doa yang derajatnya diperselisihkan (dicantumkan statusnya)
     st: q = Al-Qur'an, s = sahih, h = hasan, k = diperselisihkan, a = atsar/sahabat, l = lafal lazim (tanpa dalil khusus) */
  const ST = { q: `Al-Qur'an`, s: 'Hadits sahih', h: 'Hadits hasan', k: 'Derajat diperselisihkan', a: 'Atsar sahabat', l: 'Lafal lazim (tanpa dalil khusus)' };
  const DOA_LIST = [
    /* ---- Tingkat 1 ---- */
    { id: 'talbiyah', lvl: 1, kat: ['ihram', 'umum'], judul: 'Talbiyah', st: 's', ar: 'لَبَّيْكَ اللّٰهُمَّ لَبَّيْكَ، لَبَّيْكَ لَا شَرِيكَ لَكَ لَبَّيْكَ، إِنَّ الْحَمْدَ وَالنِّعْمَةَ لَكَ وَالْمُلْكَ، لَا شَرِيكَ لَكَ',
      lat: `Labbaikallāhumma labbaik, labbaika lā syarīka laka labbaik, innal hamda wan ni'mata laka wal mulk, lā syarīka lak.`,
      arti: 'Aku penuhi panggilan-Mu ya Allah, aku penuhi panggilan-Mu. Aku penuhi panggilan-Mu, tiada sekutu bagi-Mu, aku penuhi panggilan-Mu. Sesungguhnya segala puji, nikmat, dan kerajaan milik-Mu. Tiada sekutu bagi-Mu.',
      sumber: `HR. al-Bukhari dan Muslim dari Ibnu 'Umar. Dibaca sejak ihram; haji: sampai mulai melempar Jumrah 'Aqabah (HR. al-Bukhari dari Ibnu 'Abbas); umrah: sampai mulai thawaf.` },
    { id: 'niatUmrah', lvl: 1, kat: ['ihram'], judul: 'Niat umrah', st: 's', ar: 'لَبَّيْكَ اللّٰهُمَّ عُمْرَةً', lat: `Labbaikallāhumma 'umratan`, arti: 'Aku penuhi panggilan-Mu ya Allah untuk (mengerjakan) umrah.', sumber: 'HR. Muslim (menyebut jenis nusuk saat talbiyah)' },
    { id: 'niatHaji', lvl: 1, kat: ['ihram'], judul: 'Niat haji (ifrad)', st: 's', ar: 'لَبَّيْكَ اللّٰهُمَّ حَجًّا', lat: 'Labbaikallāhumma hajjan', arti: 'Aku penuhi panggilan-Mu ya Allah untuk (mengerjakan) haji.', sumber: 'HR. Muslim (menyebut jenis nusuk saat talbiyah)' },
    { id: 'niatQiran', lvl: 1, kat: ['ihram'], judul: 'Niat qiran', st: 's', ar: 'لَبَّيْكَ اللّٰهُمَّ عُمْرَةً وَحَجًّا', lat: `Labbaikallāhumma 'umratan wa hajjan`, arti: 'Aku penuhi panggilan-Mu ya Allah untuk umrah dan haji.', sumber: `HR. Muslim dari Anas bin Malik: "Labbaika 'umratan wa hajjan"` },
    { id: 'niatTamattu', lvl: 1, kat: ['ihram'], judul: `Niat umrah tamattu'`, st: 'l', ar: 'لَبَّيْكَ اللّٰهُمَّ عُمْرَةً مُتَمَتِّعًا بِهَا إِلَى الْحَجِّ', lat: `Labbaikallāhumma 'umratan mutamatti'an bihā ilal hajj`, arti: `Aku penuhi panggilan-Mu ya Allah untuk umrah dengan bertamattu' dari umrah itu sampai haji.`, sumber: `Lafal yang lazim dalam kitab-kitab manasik; pokoknya adalah menyebut umrah (HR. Muslim)` },
    { id: 'niatUmrahId', lvl: 1, kat: ['ihram'], judul: 'Lafal niat umrah (Indonesia)', st: 'l', ar: 'نَوَيْتُ الْعُمْرَةَ وَأَحْرَمْتُ بِهَا لِلّٰهِ تَعَالَى', lat: `Nawaitul 'umrata wa ahramtu bihā lillāhi ta'ālā`, arti: `Aku niat umrah dan berihram dengannya karena Allah Ta'ala.`, sumber: 'Lafal yang lazim di Indonesia (Kemenag RI). Niat itu pada hati; melafalkan hukumnya sunnah menurut Syafi\'i.' },
    { id: 'niatHajiId', lvl: 1, kat: ['ihram'], judul: 'Lafal niat haji (Indonesia)', st: 'l', ar: 'نَوَيْتُ الْحَجَّ وَأَحْرَمْتُ بِهِ لِلّٰهِ تَعَالَى', lat: `Nawaitul hajja wa ahramtu bihī lillāhi ta'ālā`, arti: `Aku niat haji dan berihram dengannya karena Allah Ta'ala.`, sumber: 'Lafal yang lazim di Indonesia (Kemenag RI)' },
    { id: 'niatQiranId', lvl: 1, kat: ['ihram'], judul: 'Lafal niat qiran (Indonesia)', st: 'l', ar: 'نَوَيْتُ الْحَجَّ وَالْعُمْرَةَ وَأَحْرَمْتُ بِهِمَا لِلّٰهِ تَعَالَى', lat: `Nawaitul hajja wal 'umrata wa ahramtu bihimā lillāhi ta'ālā`, arti: `Aku niat haji dan umrah dan berihram dengan keduanya karena Allah Ta'ala.`, sumber: 'Lafal yang lazim di Indonesia (Kemenag RI)' },
    { id: 'rabbana', lvl: 1, kat: ['thawaf', 'umum', 'jumrah'], judul: `Doa sapu jagat (Rukun Yamani – Hajar Aswad)`, st: 'q', ar: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ', lat: `Rabbanā ātinā fid dunyā hasanah wa fil ākhirati hasanah wa qinā 'adzāban nār`, arti: 'Ya Tuhan kami, berilah kami kebaikan di dunia dan kebaikan di akhirat, dan lindungilah kami dari azab neraka.', sumber: `QS. al-Baqarah 201; dibaca di antara Rukun Yamani dan Hajar Aswad (HR. Abu Dawud dan Ahmad, hasan)` },
    { id: 'takbir', lvl: 1, kat: ['umum', 'jumrah', 'thawaf'], judul: 'Takbir', st: 's', ar: 'اللّٰهُ أَكْبَرُ', lat: 'Allāhu akbar', arti: 'Allah Maha Besar.', sumber: 'Diucapkan setiap melempar jumrah (HR. Muslim, hadits Jabir) dan saat istilam Hajar Aswad (HR. al-Bukhari)' },
    { id: 'tasbih', lvl: 1, kat: ['umum', 'arafah', 'muzdalifah'], judul: 'Dzikir baku', st: 's', ar: 'سُبْحَانَ اللّٰهِ وَالْحَمْدُ لِلّٰهِ وَلَا إِلٰهَ إِلَّا اللّٰهُ وَاللّٰهُ أَكْبَرُ', lat: `Subhānallāh, wal hamdulillāh, wa lā ilāha illallāh, wallāhu akbar`, arti: 'Mahasuci Allah, segala puji bagi Allah, tiada Tuhan selain Allah, Allah Maha Besar.', sumber: 'HR. Muslim (kalimat yang paling dicintai Allah)' },
    { id: 'istighfar1', lvl: 1, kat: ['umum', 'arafah'], judul: 'Istighfar singkat', st: 's', ar: 'أَسْتَغْفِرُ اللّٰهَ الْعَظِيمَ الَّذِي لَا إِلٰهَ إِلَّا هُوَ الْحَيَّ الْقَيُّومَ وَأَتُوبُ إِلَيْهِ', lat: `Astaghfirullāhal 'azhīmal ladzī lā ilāha illā huwal hayyal qayyūma wa atūbu ilaih`, arti: 'Aku memohon ampun kepada Allah Yang Mahaagung, tiada Tuhan selain Dia Yang Mahahidup dan Mahaberdiri sendiri, dan aku bertobat kepada-Nya.', sumber: 'HR. Abu Dawud dan at-Tirmidzi (dihasankan al-Albani)' },
    { id: 'doaOrtu', lvl: 1, kat: ['umum', 'arafah'], judul: 'Doa untuk orang tua dan kaum mukmin', st: 'q', ar: 'رَبَّنَا اغْفِرْ لِي وَلِوَالِدَيَّ وَلِلْمُؤْمِنِينَ يَوْمَ يَقُومُ الْحِسَابُ', lat: `Rabbanagh-fir lī wa liwālidayya wa lil mu'minīna yauma yaqūmul hisāb`, arti: 'Ya Tuhan kami, ampunilah aku, kedua orang tuaku, dan seluruh kaum mukmin pada hari terjadinya perhitungan (hari kiamat).', sumber: 'QS. Ibrahim 41' },
    { id: 'taqabbal', lvl: 1, kat: ['umum', 'thawaf'], judul: 'Doa Ibrahim dan Ismail membangun Ka\'bah', st: 'q', ar: 'رَبَّنَا تَقَبَّلْ مِنَّا إِنَّكَ أَنْتَ السَّمِيعُ الْعَلِيمُ', lat: `Rabbanā taqabbal minnā, innaka antas samī'ul 'alīm`, arti: 'Ya Tuhan kami, terimalah (amal) dari kami. Sungguh Engkaulah Yang Maha Mendengar, Maha Mengetahui.', sumber: 'QS. al-Baqarah 127' },
    { id: 'zalamna', lvl: 1, kat: ['umum', 'arafah'], judul: 'Doa Adam: memohon ampun', st: 'q', ar: 'رَبَّنَا ظَلَمْنَا أَنْفُسَنَا وَإِنْ لَمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ الْخَاسِرِينَ', lat: `Rabbanā zhalamnā anfusanā wa in lam taghfir lanā wa tarhamnā lanakūnanna minal khāsirīn`, arti: 'Ya Tuhan kami, kami telah menzalimi diri kami sendiri. Jika Engkau tidak mengampuni kami dan merahmati kami, niscaya kami termasuk orang-orang yang rugi.', sumber: 'QS. al-A\'raf 23' },
    /* ---- Tingkat 2 ---- */
    { id: 'mahilli', lvl: 2, kat: ['ihram'], judul: `Isytirath (syarat ihram)`, st: 's', ar: 'اللّٰهُمَّ مَحِلِّي حَيْثُ حَبَسْتَنِي', lat: 'Allāhumma mahillī haitsu habastanī', arti: 'Ya Allah, tempat tahallulku adalah di mana Engkau menahanku. (Bila khawatir terhalang sakit.)', sumber: `HR. al-Bukhari dan Muslim, kisah Dhuba'ah bintu az-Zubair` },
    { id: 'masukMasjid', lvl: 2, kat: ['thawaf', 'umum'], judul: 'Masuk masjid', st: 's', ar: 'اللّٰهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ', lat: 'Allāhummaftah lī abwāba rahmatik', arti: 'Ya Allah, bukakanlah untukku pintu-pintu rahmat-Mu.', sumber: `HR. Muslim (Abu Humaid/Abu Usaid). Keluar masjid: "Allāhumma innī as-aluka min fadhlik" (HR. Muslim). Tambahan "Bismillāh wash shalātu was salāmu 'alā rasūlillāh" berasal dari riwayat Ibnu Majah/at-Tirmidzi yang dinilai hasan oleh sebagian ulama.` },
    { id: 'istilam', lvl: 2, kat: ['thawaf'], judul: 'Istilam Hajar Aswad', st: 's', ar: 'بِسْمِ اللّٰهِ وَاللّٰهُ أَكْبَرُ', lat: 'Bismillāhi wallāhu akbar', arti: 'Dengan nama Allah, Allah Maha Besar. (Menghadap Hajar Aswad, mengusap bila mampu, atau mengisyaratkan dengan tangan.)', sumber: `Atsar Ibnu 'Umar; HR. al-Bukhari (takbir saat istilam)` },
    { id: 'niatThawaf', lvl: 2, kat: ['thawaf'], judul: 'Niat thawaf', st: 'l', ar: 'نَوَيْتُ أَنْ أَطُوفَ بِالْبَيْتِ سَبْعَةَ أَشْوَاطٍ لِلّٰهِ تَعَالَى', lat: `Nawaitu an athūfa bil baiti sab'ata asywāthin lillāhi ta'ālā`, arti: 'Aku niat thawaf mengelilingi Baitullah tujuh putaran karena Allah Ta\'ala.', sumber: 'Lafal lazim (Kemenag RI); pokoknya niat dalam hati' },
    { id: 'maqam', lvl: 2, kat: ['thawaf'], judul: 'Shalat di belakang Maqam Ibrahim', st: 'q', ar: 'وَاتَّخِذُوا مِنْ مَقَامِ إِبْرَاهِيمَ مُصَلًّى', lat: 'Wattakhidzū min maqāmi ibrāhīma mushallā', arti: 'Jadikanlah sebagian Maqam Ibrahim sebagai tempat shalat. (Rakaat 1: al-Kafirun; rakaat 2: al-Ikhlas.)', sumber: 'QS. al-Baqarah 125; HR. Muslim (hadits Jabir)' },
    { id: 'safa', lvl: 2, kat: ['sai'], judul: `Mendekati Shafa`, st: 'q', ar: 'إِنَّ الصَّفَا وَالْمَرْوَةَ مِنْ شَعَائِرِ اللّٰهِ، أَبْدَأُ بِمَا بَدَأَ اللّٰهُ بِهِ', lat: `Innash shafā wal marwata min sya'ā-irillāh. Abda-u bimā bada-allāhu bih`, arti: 'Sesungguhnya Shafa dan Marwah adalah sebagian syiar Allah. Aku mulai dengan apa yang Allah mulai.', sumber: 'QS. al-Baqarah 158; HR. Muslim (hadits Jabir)' },
    { id: 'dzikirSafa', lvl: 2, kat: ['sai'], judul: 'Dzikir di Shafa dan Marwah', st: 's', ar: 'لَا إِلٰهَ إِلَّا اللّٰهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، لَا إِلٰهَ إِلَّا اللّٰهُ وَحْدَهُ، أَنْجَزَ وَعْدَهُ وَنَصَرَ عَبْدَهُ وَهَزَمَ الْأَحْزَابَ وَحْدَهُ', lat: `Lā ilāha illallāhu wahdahū lā syarīka lah, lahul mulku wa lahul hamdu wa huwa 'alā kulli syai-in qadīr. Lā ilāha illallāhu wahdah, anjaza wa'dah, wa nashara 'abdah, wa hazamal ahzāba wahdah.`, arti: 'Tiada Tuhan selain Allah semata, tiada sekutu bagi-Nya. Milik-Nya kerajaan dan pujian, dan Dia Mahakuasa atas segala sesuatu. Dia menepati janji-Nya, menolong hamba-Nya, dan mengalahkan golongan-golongan musuh sendirian.', sumber: 'HR. Muslim (hadits Jabir); dibaca tiga kali dengan doa di antaranya' },
    { id: 'arafah', lvl: 2, kat: ['arafah'], judul: 'Doa terbaik: hari Arafah', st: 'h', ar: 'لَا إِلٰهَ إِلَّا اللّٰهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ', lat: `Lā ilāha illallāhu wahdahū lā syarīka lah, lahul mulku wa lahul hamdu wa huwa 'alā kulli syai-in qadīr`, arti: 'Sebaik-baik doa adalah doa pada hari Arafah, dan sebaik-baik yang kuucapkan serta para nabi sebelumku ialah: tiada Tuhan selain Allah semata, tiada sekutu bagi-Nya...', sumber: `HR. at-Tirmidzi no. 3585 dan lainnya dari 'Amr bin Syu'aib; dinilai hasan karena penguat` },
    { id: 'sayyidul', lvl: 2, kat: ['arafah', 'umum'], judul: `Sayyidul istighfar`, st: 's', ar: 'اللّٰهُمَّ أَنْتَ رَبِّي لَا إِلٰهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ', lat: `Allāhumma anta rabbī lā ilāha illā anta, khalaqtanī wa anā 'abduka, wa anā 'alā 'ahdika wa wa'dika mastatha'tu, a'ūdzu bika min syarri mā shana'tu, abū-u laka bini'matika 'alayya wa abū-u bidzanbī faghfir lī fa innahū lā yaghfirudz dzunūba illā anta`, arti: 'Ya Allah, Engkau Tuhanku, tiada Tuhan selain Engkau. Engkau menciptakanku dan aku hamba-Mu; aku berpegang pada janji-Mu sekuat kemampuanku. Aku berlindung kepada-Mu dari keburukan perbuatanku. Aku mengakui nikmat-Mu atasku dan mengakui dosaku, maka ampunilah aku, sebab tiada yang mengampuni dosa selain Engkau.', sumber: 'HR. al-Bukhari dari Syaddad bin Aus' },
    { id: 'abubakar', lvl: 2, kat: ['arafah', 'umum'], judul: 'Doa Abu Bakar ash-Shiddiq', st: 's', ar: 'اللّٰهُمَّ إِنِّي ظَلَمْتُ نَفْسِي ظُلْمًا كَثِيرًا، وَلَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ، فَاغْفِرْ لِي مَغْفِرَةً مِنْ عِنْدِكَ وَارْحَمْنِي، إِنَّكَ أَنْتَ الْغَفُورُ الرَّحِيمُ', lat: `Allāhumma innī zhalamtu nafsī zhulman katsīran, wa lā yaghfirudz dzunūba illā anta, faghfir lī maghfiratan min 'indika warhamnī, innaka antal ghafūrur rahīm`, arti: 'Ya Allah, aku telah banyak menzalimi diriku, dan tiada yang mengampuni dosa selain Engkau. Maka ampunilah aku dengan ampunan dari sisi-Mu dan rahmatilah aku. Sungguh Engkau Maha Pengampun, Maha Penyayang.', sumber: 'HR. al-Bukhari dan Muslim' },
    { id: 'afwu', lvl: 2, kat: ['arafah', 'umum'], judul: `Memohon maaf`, st: 's', ar: 'اللّٰهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي', lat: `Allāhumma innaka 'afuwwun tuhibbul 'afwa fa'fu 'annī`, arti: 'Ya Allah, sungguh Engkau Maha Pemaaf, menyukai maaf, maka maafkanlah aku.', sumber: `HR. at-Tirmidzi dan Ibnu Majah dari 'Aisyah (sahih)` },
    { id: 'masyaril', lvl: 2, kat: ['muzdalifah'], judul: `Dzikir di Masy'aril Haram`, st: 'q', ar: 'فَإِذَا أَفَضْتُمْ مِنْ عَرَفَاتٍ فَاذْكُرُوا اللّٰهَ عِنْدَ الْمَشْعَرِ الْحَرَامِ وَاذْكُرُوهُ كَمَا هَدَاكُمْ', lat: `Fa idzā afadhtum min 'arafātin fadzkurullāha 'indal masy'aril harām, wadzkurūhu kamā hadākum`, arti: `Apabila kamu bertolak dari Arafah, berdzikirlah kepada Allah di Masy'aril Haram, dan berdzikirlah kepada-Nya sebagaimana Dia telah memberi petunjuk kepadamu.`, sumber: `QS. al-Baqarah 198. Nabi saw. menghadap kiblat, berdoa, bertakbir, bertahlil, dan bertauhid hingga langit sangat kuning (HR. Muslim, hadits Jabir).` },
    { id: 'jumrah', lvl: 2, kat: ['jumrah'], judul: 'Setiap lemparan jumrah', st: 's', ar: 'اللّٰهُ أَكْبَرُ', lat: 'Allāhu akbar', arti: 'Allah Maha Besar. (Setiap satu kerikil.)', sumber: 'HR. Muslim (hadits Jabir): Nabi saw. bertakbir pada setiap lemparan.' },
    { id: 'tsabbit', lvl: 2, kat: ['umum'], judul: 'Memohon keteguhan hati', st: 's', ar: 'يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَى دِينِكَ', lat: `Yā muqallibal qulūb, tsabbit qalbī 'alā dīnik`, arti: 'Wahai Zat yang membolak-balikkan hati, teguhkanlah hatiku di atas agama-Mu.', sumber: 'HR. at-Tirmidzi dari Anas (sahih)' },
    { id: 'huda', lvl: 2, kat: ['umum', 'arafah'], judul: 'Petunjuk, takwa, kecukupan', st: 's', ar: 'اللّٰهُمَّ إِنِّي أَسْأَلُكَ الْهُدَى وَالتُّقَى وَالْعَفَافَ وَالْغِنَى', lat: `Allāhumma innī as-alukal hudā wat tuqā wal 'afāfa wal ghinā`, arti: 'Ya Allah, aku memohon kepada-Mu petunjuk, takwa, kesucian diri, dan kecukupan.', sumber: `HR. Muslim dari Ibnu Mas'ud` },
    { id: 'safar', lvl: 2, kat: ['umum', 'ihram'], judul: 'Doa naik kendaraan / bus', st: 'q', ar: 'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هٰذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ، وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ', lat: `Subhānal ladzī sakhkhara lanā hādzā wa mā kunnā lahū muqrinīn, wa innā ilā rabbinā lamunqalibūn`, arti: 'Mahasuci Allah yang telah menundukkan (kendaraan) ini bagi kami, padahal kami sebelumnya tidak mampu menguasainya, dan sungguh kami akan kembali kepada Tuhan kami.', sumber: `QS. az-Zukhruf 13–14; HR. Muslim dari Ibnu 'Umar (didahului takbir tiga kali)` },
    /* ---- Tingkat 3 ---- */
    { id: 'zamzam', lvl: 3, kat: ['thawaf'], judul: 'Doa minum Zamzam', st: 'k', ar: 'اللّٰهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا وَرِزْقًا وَاسِعًا وَشِفَاءً مِنْ كُلِّ دَاءٍ', lat: `Allāhumma innī as-aluka 'ilman nāfi'an wa rizqan wāsi'an wa syifā-an min kulli dā'`, arti: 'Ya Allah, aku memohon kepada-Mu ilmu yang bermanfaat, rezeki yang luas, dan kesembuhan dari segala penyakit.', sumber: `Lafal masyhur; sanadnya diperselisihkan/dinilai lemah oleh sebagian ulama. Pokok keutamaan Zamzam: "makanan yang mengenyangkan" (HR. Muslim dari Abu Dzar). "Air Zamzam sesuai niat peminumnya" (HR. Ibnu Majah; derajatnya diperselisihkan). Boleh berdoa dengan doa apa pun yang baik.` },
    { id: 'umarKakbah', lvl: 3, kat: ['thawaf'], judul: `Saat pertama melihat Ka'bah`, st: 'a', ar: 'اللّٰهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، فَحَيِّنَا رَبَّنَا بِالسَّلَامِ', lat: `Allāhumma antas salām wa minkas salām, fa hayyinā rabbanā bis salām`, arti: 'Ya Allah, Engkau Maha Sejahtera dan dari-Mu kesejahteraan, hidupkanlah kami, wahai Tuhan kami, dengan kesejahteraan.', sumber: `Atsar 'Umar bin al-Khaththab riwayat al-Baihaqi; sanadnya diperselisihkan (terputus menurut sebagian). Tidak ada doa khusus yang sahih; berdoalah dengan doa terbaik Anda.` },
    { id: 'hajjMabrur', lvl: 3, kat: ['umum', 'jumrah'], judul: 'Haji mabrur', st: 'l', ar: 'اللّٰهُمَّ اجْعَلْهُ حَجًّا مَبْرُورًا وَسَعْيًا مَشْكُورًا وَذَنْبًا مَغْفُورًا', lat: `Allāhummaj'alhu hajjan mabrūran, wa sa'yan masykūran, wa dzanban maghfūran`, arti: 'Ya Allah, jadikanlah (ini) haji yang mabrur, usaha yang diterima, dan dosa yang diampuni.', sumber: `Doa lazim yang diriwayatkan sebagai atsar dari sebagian sahabat; bukan lafal wajib. Keutamaan haji mabrur: "tiada balasan baginya selain surga" (HR. al-Bukhari dan Muslim).` },
    { id: 'multazam', lvl: 3, kat: ['thawaf'], judul: 'Berdoa di Multazam', st: 'k', ar: 'اللّٰهُمَّ إِنَّ هٰذَا بَيْتُكَ وَأَنَا عَبْدُكَ، فَاغْفِرْ لِي وَارْحَمْنِي', lat: `Allāhumma inna hādzā baituka wa anā 'abduk, faghfir lī warhamnī`, arti: 'Ya Allah, ini rumah-Mu dan aku hamba-Mu. Ampunilah dan rahmatilah aku.', sumber: `Berdoa di Multazam (antara Hajar Aswad dan pintu Ka'bah) diriwayatkan dari sebagian sahabat (Ibnu 'Abbas; HR. Abu Dawud dan lainnya, diperselisihkan sanadnya). Lafal di sini hanya contoh sederhana, bukan lafal baku.` },
    { id: 'doaDam', lvl: 3, kat: ['jumrah'], judul: 'Menyembelih hadyu', st: 's', ar: 'بِسْمِ اللّٰهِ وَاللّٰهُ أَكْبَرُ', lat: 'Bismillāhi wallāhu akbar', arti: 'Dengan nama Allah, Allah Maha Besar.', sumber: 'HR. Muslim (Anas): Nabi saw. menyembelih sambil membaca basmalah dan takbir. Tambahan "Allāhumma minka wa laka" diriwayatkan Abu Dawud dengan sanad diperselisihkan.' },
    { id: 'talbiyahIbnuUmar', lvl: 3, kat: ['ihram'], judul: `Tambahan talbiyah Ibnu 'Umar`, st: 's', ar: 'لَبَّيْكَ لَبَّيْكَ وَسَعْدَيْكَ، وَالْخَيْرُ بِيَدَيْكَ، لَبَّيْكَ وَالرَّغْبَاءُ إِلَيْكَ وَالْعَمَلُ', lat: `Labbaika labbaika wa sa'daika, wal khairu biyadaik, labbaika war raghbā-u ilaika wal 'amal`, arti: 'Aku penuhi panggilan-Mu, aku patuh dan taat, segala kebaikan di tangan-Mu, aku penuhi panggilan-Mu, kepada-Mu segala harapan dan amal.', sumber: `Ibnu 'Umar menambah talbiyah dengan lafal ini (HR. Muslim). Boleh ditambahkan; yang pokok tetap talbiyah Nabi saw.` },
    { id: 'wadaDoa', lvl: 3, kat: ['wada'], judul: 'Doa perpisahan musafir', st: 's', ar: 'أَسْتَوْدِعُ اللّٰهَ دِينَكَ وَأَمَانَتَكَ وَخَوَاتِيمَ عَمَلِكَ', lat: `Astawdi'ullāha dīnaka wa amānataka wa khawātīma 'amalik`, arti: 'Aku titipkan agamamu, amanahmu, dan akhir amalmu kepada Allah.', sumber: `HR. at-Tirmidzi dan Ahmad (sahih). Untuk thawaf wada' tidak ada doa khusus yang sahih; berdoalah apa saja. Doa pulang: "Āyibūna tā-ibūna 'ābidūna lirabbinā hāmidūn" (HR. al-Bukhari dan Muslim).` },
    { id: 'pulang', lvl: 3, kat: ['wada', 'umum'], judul: 'Doa kembali dari safar', st: 's', ar: 'آيِبُونَ تَائِبُونَ عَابِدُونَ لِرَبِّنَا حَامِدُونَ', lat: `Āyibūna tā-ibūna 'ābidūna lirabbinā hāmidūn`, arti: 'Kami kembali, bertobat, beribadah, dan memuji Tuhan kami.', sumber: 'HR. al-Bukhari dan Muslim dari Ibnu \'Umar (setelah takbir tiga kali)' },
    { id: 'tahalul', lvl: 3, kat: ['ihram'], judul: 'Ucapan syukur selesai', st: 'l', ar: 'الْحَمْدُ لِلّٰهِ الَّذِي قَضَى عَنَّا نُسُكَنَا', lat: `Alhamdulillāhilladzī qadhā 'annā nusukanā`, arti: 'Segala puji bagi Allah yang telah menyempurnakan ibadah kami.', sumber: 'Ucapan syukur umum; bukan lafal wajib' },
    { id: 'masuk', lvl: 3, kat: ['thawaf'], judul: `Ucapan masuk Masjidil Haram`, st: 'h', ar: 'بِسْمِ اللّٰهِ وَالصَّلَاةُ وَالسَّلَامُ عَلَى رَسُولِ اللّٰهِ، اللّٰهُمَّ اغْفِرْ لِي ذُنُوبِي وَافْتَحْ لِي أَبْوَابَ رَحْمَتِكَ', lat: `Bismillāh, wash shalātu was salāmu 'alā rasūlillāh. Allāhummaghfir lī dzunūbī waftah lī abwāba rahmatik.`, arti: 'Dengan nama Allah, shalawat dan salam atas Rasulullah. Ya Allah, ampunilah dosaku dan bukakan untukku pintu-pintu rahmat-Mu.', sumber: `HR. at-Tirmidzi dan Ibnu Majah (dari Fathimah r.a.); derajat sanadnya diperselisihkan ulama` },
    { id: 'rabbighfir', lvl: 3, kat: ['sai'], judul: `Doa di zona hijau`, st: 'a', ar: 'رَبِّ اغْفِرْ وَارْحَمْ إِنَّكَ أَنْتَ الْأَعَزُّ الْأَكْرَمُ', lat: `Rabbighfir warham, innaka antal a'azzul akram`, arti: 'Ya Tuhanku, ampunilah dan rahmatilah, sesungguhnya Engkau Mahaperkasa dan Mahamulia.', sumber: `Atsar dari sebagian sahabat (Ibnu 'Umar, Ibnu Mas'ud) saat berlari kecil di antara dua lampu hijau; bukan lafal yang dibakukan Nabi saw.` }
  ];
  /* Rujukan surat:ayat untuk rekaman (EveryAyah) pada bacaan yang berupa ayat Al-Qur'an */
  const QUR = { rabbana: [[2, 201]], taqabbal: [[2, 127]], zalamna: [[7, 23]], doaOrtu: [[14, 41]], maqam: [[2, 125]], safa: [[2, 158]], masyaril: [[2, 198]] };
  const DOA = {}; DOA_LIST.forEach(d => { DOA[d.id] = d; if (QUR[d.id]) d.qur = QUR[d.id]; });
  const KAT_DOA = [['semua', 'Semua'], ['ihram', 'Ihram'], ['thawaf', 'Thawaf'], ['sai', `Sa'i`], ['arafah', 'Arafah'], ['muzdalifah', 'Muzdalifah'], ['jumrah', 'Jumrah & Mina'], ['wada', `Wada'`], ['umum', 'Umum']];
  const LVL_DOA = [[0, 'Semua tingkat'], [1, '1 · Sederhana & umum'], [2, '2 · Lazim & berdalil sahih'], [3, '3 · Lanjutan / atsar']];

  /* ---------------- Checklist ihram & larangan ---------------- */
  const PERSIAPAN = [
    { t: 'Mandi sunnah (ghusl) untuk ihram', ok: true, why: 'Sunnah mandi sebelum ihram (HR. at-Tirmidzi dari Zaid bin Tsabit, dihasankan).' },
    { t: 'Memotong kuku, merapikan kumis, mencabut bulu ketiak dan kemaluan', ok: true, why: 'Dikerjakan SEBELUM niat, sebab setelah berihram memotong kuku dan mencabut rambut termasuk larangan.' },
    { t: 'Memakai wangi-wangian pada badan sebelum niat', ok: true, why: `Sunnah pada badan sebelum ihram (HR. al-Bukhari dan Muslim dari 'Aisyah). Hindari mengoleskannya pada kain ihram.` },
    { t: 'Berwudhu dan mengenakan pakaian ihram', ok: true, dyn: 'pakaian', why: 'Pria: dua lembar kain putih tak berjahit (izar dan rida). Wanita: pakaian biasa yang menutup aurat; wajah dan telapak tangan terbuka.' },
    { t: 'Shalat sunnah ihram dua rakaat (bila tidak di waktu terlarang)', ok: true, why: 'Disunnahkan shalat dua rakaat sebelum niat ihram, lalu berniat.' },
    { t: 'Mencukur habis rambut kepala sebelum niat agar nanti langsung selesai', ok: false, why: 'Keliru: tahalul dilakukan dengan halq/taqshir pada waktunya. Rambut perlu ada pada saat itu.' },
    { t: 'Menyemprotkan parfum tebal ke kain ihram agar tahan lama', ok: false, why: 'Sebaiknya dihindari: wangi yang menempel dan terus dipakai setelah niat dapat menjadi pelanggaran larangan ihram.' },
    { t: 'Memakai sepatu tertutup dan kaus kaki (pria)', ok: false, dynGender: 'pria', why: 'Pria tidak boleh memakai sepatu/kaus kaki yang menutup mata kaki; pakai sandal.' },
    { t: 'Memakai cadar/niqab dan sarung tangan (wanita)', ok: false, dynGender: 'wanita', why: 'Wanita yang berihram tidak mengenakan cadar dan sarung tangan; wajah dan telapak tangan dibiarkan terbuka.' },
    { t: 'Melewati miqat dulu, baru berniat nanti di Jeddah', ok: false, why: 'Melewati miqat tanpa berihram (bagi yang berniat nusuk) mewajibkan kembali ke miqat atau membayar dam.' }
  ];
  const LARANGAN = [
    { q: 'Memotong kuku setelah niat ihram', ok: false, why: 'Dilarang. Pelanggaran menimbulkan fidyah (dam) menurut tingkatannya.' },
    { q: 'Mandi dan membersihkan badan dengan sabun tak berwangi', ok: true, why: 'Boleh. Yang dilarang adalah wewangian, bukan kebersihan.' },
    { q: 'Pria menutup kepala dengan topi atau peci', ok: false, why: 'Dilarang bagi pria. Payung dan atap kendaraan tidak termasuk menutup kepala.' },
    { q: 'Memakai payung untuk berteduh dari terik', ok: true, why: 'Boleh. Nabi saw. dinaungi kain saat melempar jumrah (HR. Muslim).' },
    { q: 'Memakai jam tangan, kacamata, atau cincin', ok: true, why: 'Boleh; ini bukan pakaian berjahit yang dilarang.' },
    { q: 'Memakai sabuk atau tas pinggang untuk menahan kain (pria)', ok: true, why: 'Boleh menurut jumhur ulama untuk menjaga kain dan menyimpan barang.' },
    { q: 'Memakai parfum pada badan setelah niat', ok: false, why: 'Dilarang bagi pria dan wanita yang berihram.' },
    { q: 'Memakai sabun, sampo, atau deodoran yang beraroma', ok: false, why: 'Gunakan produk tanpa pewangi (unscented) selama ihram.' },
    { q: 'Mencabut atau memotong tanaman hijau di tanah Haram', ok: false, why: 'Dilarang memotong tanaman hijau di tanah Haram (HR. al-Bukhari dan Muslim).' },
    { q: 'Berburu atau mengganggu hewan buruan darat', ok: false, why: 'Dilarang (QS. al-Maidah 95).' },
    { q: 'Akad nikah atau melamar', ok: false, why: `Dilarang selama ihram (HR. Muslim dari 'Utsman).` },
    { q: `Berdzikir dan membaca Al-Qur'an`, ok: true, why: 'Dianjurkan. Yang dilarang adalah rafats, fusuq, dan jidal (QS. al-Baqarah 197).' },
    { q: 'Minum air Zamzam dan makan makanan halal', ok: true, why: 'Boleh.' },
    { q: 'Wanita memakai cadar yang menempel pada wajah', ok: false, why: `Dilarang: "Wanita yang berihram tidak mengenakan cadar dan sarung tangan" (HR. al-Bukhari). Menutup wajah dari pria asing dengan kain yang tidak menempel boleh.` },
    { q: 'Pria memakai sandal yang terbuka bagian mata kakinya', ok: true, why: 'Boleh, bahkan itulah yang dianjurkan.' },
    { q: 'Berdebat sengit dan bertengkar dengan sesama jamaah', ok: false, why: 'Jidal dan fusuq dilarang selama haji (QS. al-Baqarah 197).' },
    { q: 'Berhubungan suami-istri sebelum tahalul awal', ok: false, why: 'Dilarang keras; merusak (membatalkan) haji dan wajib dam serta qadha menurut jumhur.' },
    { q: 'Mengganti pakaian ihram yang kotor dengan kain ihram lain (pria)', ok: true, why: 'Boleh; yang dilarang ialah pakaian berjahit.' }
  ];

  /* ---------------- Kalender harian ---------------- */
  /* k: r=rukun, w=wajib, s=sunnah, i=informasi/rukhsah; m = hanya untuk mode tertentu */
  const HARI = {
    pra: { id: 'pra', tgl: 'Sebelum 8 Dzulhijjah', nama: 'Kedatangan dan Ibadah Awal', leg: null, jam: 7,
      ringkas: `Berihram dari miqat dan, tergantung jenis haji, mengerjakan thawaf dan sa'i lebih dulu.`,
      item: [
        { w: 'Miqat', k: 'r', t: 'Berniat ihram dari miqat (atau sejajar miqat), memakai pakaian ihram, memperbanyak talbiyah.' },
        { w: 'Masuk Makkah', k: 's', t: `Masuk Masjidil Haram dengan kaki kanan, menuju Ka'bah.` },
        { w: 'Thawaf', k: 'r', m: ['tamattu'], t: `Tamattu': thawaf umrah 7 putaran → shalat 2 rakaat → sa'i 7 lintasan → tahalul (halq/taqshir) → bebas ihram sampai 8 Dzulhijjah.` },
        { w: 'Thawaf', k: 's', m: ['ifrad', 'qiran'], t: `Ifrad/Qiran: thawaf qudum 7 putaran (sunnah) → shalat 2 rakaat → sa'i 7 lintasan → TETAP berihram (tidak tahalul) sampai 10 Dzulhijjah.` }
      ], dalil: 'HR. Muslim (hadits Jabir) dan al-Bukhari (Kitab al-Hajj).' },
    d8: { id: 'd8', tgl: '8 Dzulhijjah', nama: 'Yaumut Tarwiyah', leg: 'makMina', jam: 6.5,
      ringkas: 'Berangkat ke Mina; shalat lima waktu di Mina dan bermalam.',
      item: [
        { w: 'Pagi', k: 'r', m: ['tamattu'], t: `Tamattu': berniat HAJI dari tempat menginap di Makkah (ihram haji): mandi, berpakaian ihram, shalat sunnah, lalu "Labbaika Allāhumma hajjan".` },
        { w: 'Dhuha', k: 's', t: 'Berangkat ke Mina sambil bertalbiyah (Nabi saw. berangkat setelah matahari terbit; HR. Muslim, Jabir).' },
        { w: 'Di Mina', k: 's', t: 'Shalat Dzuhur, Ashar, Maghrib, Isya, dan Subuh pada waktunya. Yang empat rakaat diqashar menjadi dua (musafir), tanpa jamak.' },
        { w: 'Malam', k: 's', t: 'Bermalam (mabit) di Mina malam 9 Dzulhijjah: sunnah menurut Syafi\'i (bukan wajib). Pada skema pemerintah Saudi tertentu jamaah dapat langsung diarahkan ke Arafah; ikuti arahan pembimbing.' },
        { w: 'Persiapan', k: 'i', t: 'Siapkan air, payung, obat, dan tenaga untuk Arafah. Jaga larangan ihram dan hindari jidal.' }
      ], dalil: 'HR. Muslim (hadits Jabir). Dinamai "tarwiyah" karena jamaah dahulu menyiapkan/membawa air (tarawwa) untuk perjalanan ke Arafah.' },
    d9: { id: 'd9', tgl: '9 Dzulhijjah', nama: 'Yaumul Arafah — Wukuf', leg: 'minaArafah', jam: 7,
      ringkas: 'Puncak haji: wukuf di Arafah dari zawal hingga terbenam matahari; malamnya ke Muzdalifah.',
      item: [
        { w: 'Setelah terbit matahari', k: 's', t: 'Berangkat dari Mina ke Arafah sambil bertalbiyah dan bertakbir.' },
        { w: 'Pagi–zawal', k: 's', t: `Singgah di Namirah hingga matahari tergelincir (zawal). Bagian barat Masjid Namirah berada di Wadi 'Uranah — di luar Arafah.` },
        { w: 'Zawal', k: 's', t: `Khutbah Arafah, lalu shalat Dzuhur dan Ashar dijamak taqdim dan diqashar, satu adzan dan dua iqamah (HR. Muslim, hadits Jabir).` },
        { w: 'Zawal–Maghrib', k: 'r', t: `WUKUF: hadir di Arafah (di dalam batas, bukan 'Uranah). Sah sejak zawal 9 Dzulhijjah hingga fajar 10 Dzulhijjah (Syafi'i). Berdoa menghadap kiblat, berdzikir, istighfar, membaca Al-Qur'an; Nabi saw. berbuka (tidak berpuasa) di Arafah.` },
        { w: 'Matahari terbenam', k: 'w', t: `Bertahan di Arafah sampai terbenam matahari (Hanafi, Maliki, Hanbali: wajib; Syafi'i: sunnah muakkad). Lalu bergerak ke Muzdalifah dengan tenang — TIDAK shalat Maghrib di Arafah.` }
      ], dalil: `"Al-hajju 'Arafah" (HR. Ahmad, Abu Dawud, at-Tirmidzi, an-Nasa'i, Ibnu Majah; sahih). "Tidak ada hari yang lebih banyak Allah membebaskan hamba dari neraka daripada hari Arafah" (HR. Muslim).` },
    n10: { id: 'n10', tgl: 'Malam 10 Dzulhijjah', nama: 'Mabit di Muzdalifah', leg: 'arafahMuzd', jam: 19,
      ringkas: 'Jamak Maghrib–Isya, mengambil kerikil, bermalam, Subuh, dan berdoa di Masy\'aril Haram.',
      item: [
        { w: 'Tiba', k: 's', t: `Shalat Maghrib dan Isya dijamak (taqdim atau ta'khir) dengan satu adzan dan dua iqamah, tanpa shalat sunnah di antaranya (HR. Muslim, Jabir).` },
        { w: 'Malam', k: 'w', t: `MABIT di Muzdalifah. Menurut Syafi'i cukup hadir pada separuh malam kedua walau sebentar; Maliki/Hanbali: sampai lewat tengah malam atau hingga fajar menurut perincian masing-masing.` },
        { w: 'Malam', k: 's', t: 'Mengambil kerikil: 7 untuk Jumrah \'Aqabah (10 Dzulhijjah); bila ingin sekaligus 21 per hari tasyriq (total 49 untuk nafar awal, 70 untuk nafar tsani). Boleh diambil dari mana saja; tidak harus di Muzdalifah.' },
        { w: 'Subuh', k: 's', t: `Shalat Subuh di awal waktu, lalu wukuf di Masy'aril Haram: menghadap kiblat, berdoa dan berdzikir hingga langit sangat kuning (isfar).` },
        { w: 'Sebelum matahari terbit', k: 's', t: `Berangkat ke Mina; mempercepat langkah di Wadi Muhassir (bukan bagian Muzdalifah).` },
        { w: 'Setelah tengah malam', k: 'i', t: `Rukhsah bagi yang lemah, wanita, lansia, dan pendampingnya: boleh meninggalkan Muzdalifah setelah tengah malam (HR. al-Bukhari dan Muslim, Ibnu 'Abbas dan Asma').` }
      ], dalil: 'HR. Muslim (hadits Jabir); QS. al-Baqarah 198.' },
    d10: { id: 'd10', tgl: '10 Dzulhijjah', nama: `Yaumun Nahr — Idul Adha`, leg: 'muzdMina', jam: 6.5,
      ringkas: `Hari paling padat: lempar Jumrah 'Aqabah, sembelih hadyu, cukur (tahalul awal), thawaf ifadhah, sa'i.`,
      item: [
        { w: 'Setelah terbit matahari', k: 'w', t: `Melempar Jumrah 'Aqabah: 7 kerikil, takbir pada setiap lemparan. Talbiyah dihentikan saat mulai melempar. Waktu utama: dhuha (Syafi'i: boleh sejak tengah malam).` },
        { w: 'Sesudahnya', k: 'w', m: ['tamattu', 'qiran'], t: `Menyembelih hadyu / dam nusuk (tamattu' dan qiran): 1 kambing atau ⅐ unta/sapi. Ifrad: qurban hanya sunnah.` },
        { w: 'Sesudahnya', k: 'r', t: 'Halq atau taqshir (mencukur / memotong rambut): TAHALUL AWAL setelah dua dari tiga: lempar \'Aqabah, halq/taqshir, thawaf ifadhah. Semua larangan ihram gugur kecuali hubungan suami-istri.' },
        { w: 'Makkah', k: 'r', t: `Thawaf ifadhah (rukun) 7 putaran → shalat 2 rakaat → sa\'i haji bila belum (tamattu', atau ifrad/qiran yang belum sa'i) → TAHALUL TSANI: semua larangan ihram berakhir.` },
        { w: 'Malam', k: 'w', t: 'Kembali ke Mina untuk mabit malam 11 Dzulhijjah.' },
        { w: 'Urutan', k: 'i', t: 'Urutan sunnah: lempar → sembelih → cukur → thawaf. Bila tertukar, "tidak mengapa" (HR. al-Bukhari dan Muslim, Abdullah bin Amr).' }
      ], dalil: 'HR. Muslim (hadits Jabir); al-Bukhari dan Muslim (Abdullah bin Amr).' },
    d11: { id: 'd11', tgl: '11 Dzulhijjah', nama: 'Hari Tasyriq Pertama', leg: 'makMina', jam: 9,
      ringkas: 'Mabit di Mina dan melempar tiga jumrah setelah zawal.',
      item: [
        { w: 'Setelah zawal', k: 'w', t: `Melempar tiga jumrah berurutan: Ula (Shughra) → Wustha → 'Aqabah (Kubra), masing-masing 7 kerikil dengan takbir.` },
        { w: 'Setelah Ula & Wustha', k: 's', t: 'Bergeser sedikit ke samping, menghadap kiblat, mengangkat tangan dan berdoa lama (HR. al-Bukhari, Ibnu \'Umar). Setelah \'Aqabah tidak berdoa.' },
        { w: 'Malam', k: 'w', t: 'Mabit di Mina malam 12 Dzulhijjah (lebih dari separuh malam).' }
      ], dalil: 'HR. al-Bukhari dan Muslim; "hari-hari tasyriq adalah hari makan, minum, dan dzikir kepada Allah" (HR. Muslim).' },
    d12: { id: 'd12', tgl: '12 Dzulhijjah', nama: 'Hari Tasyriq Kedua', leg: null, jam: 9,
      ringkas: 'Melempar tiga jumrah; pilih nafar awal atau tinggal untuk 13 Dzulhijjah.',
      item: [
        { w: 'Setelah zawal', k: 'w', t: 'Melempar tiga jumrah seperti kemarin.' },
        { w: 'Sebelum maghrib', k: 'i', t: `NAFAR AWAL: bila ingin cepat, keluar dari Mina sebelum matahari terbenam (QS. al-Baqarah 203). Bila matahari terbenam dan masih di Mina, menurut Syafi'i wajib mabit malam 13 dan melempar lagi.` },
        { w: 'Alternatif', k: 's', t: 'NAFAR TSANI (tinggal sampai 13) lebih utama.' }
      ], dalil: 'QS. al-Baqarah 203.' },
    d13: { id: 'd13', tgl: '13 Dzulhijjah', nama: 'Hari Tasyriq Ketiga — Nafar Tsani', leg: null, jam: 9,
      ringkas: 'Lempar tiga jumrah terakhir, lalu ke Makkah.',
      item: [
        { w: 'Setelah zawal', k: 'w', t: 'Melempar tiga jumrah (bagi yang memilih nafar tsani atau belum keluar sebelum maghrib 12 Dzulhijjah).' },
        { w: 'Setelah itu', k: 'i', t: `Kembali ke Makkah. Ibadah Armuzna selesai.` }
      ], dalil: 'QS. al-Baqarah 203.' },
    umrah2: { id: 'umrah2', tgl: 'Setelah haji', nama: `Umrah dari Tan'im (opsional)`, leg: 'makTanim', jam: 8,
      ringkas: `Jamaah ifrad boleh umrah setelah haji; penduduk Makkah berihram dari Tan'im / batas Haram terdekat.`,
      item: [
        { w: `Tan'im`, k: 'r', t: `Berihram umrah dari Tan'im (Masjid 'Aisyah), batas Haram terdekat di sisi barat laut Makkah. 'Aisyah r.a. diumrahkan dari sini (HR. al-Bukhari dan Muslim).` },
        { w: 'Masjidil Haram', k: 'r', t: `Thawaf 7 putaran, shalat 2 rakaat, sa'i 7 lintasan, lalu tahalul (halq/taqshir).` },
        { w: 'Catatan', k: 'i', t: `Mayoritas ulama (termasuk Syafi'i dan Hanbali) membolehkan umrah setelah haji; sebagian ulama salaf tidak menganjurkan berulang-ulang. Thawaf wada' dikerjakan sebagai penutup.` }
      ], dalil: `HR. al-Bukhari dan Muslim (kisah 'Aisyah dan Abdurrahman bin Abu Bakar di Tan'im).` },
    wada: { id: 'wada', tgl: 'Sebelum meninggalkan Makkah', nama: `Thawaf Wada'`, leg: null, jam: 17,
      ringkas: 'Penutup ibadah: thawaf perpisahan sebelum pulang.',
      item: [
        { w: 'Akhir', k: 'w', t: `Thawaf wada' 7 putaran, tanpa ramal dan idhtiba'. Wajib bagi yang akan meninggalkan Makkah (jumhur); gugur bagi wanita haid/nifas.` },
        { w: 'Sesudahnya', k: 's', t: `Shalat 2 rakaat, minum Zamzam, berdoa; jangan menunda berlama-lama di Makkah setelahnya.` }
      ], dalil: `"Hendaknya akhir urusan mereka di Baitullah, kecuali yang diberi keringanan bagi wanita haid" (HR. al-Bukhari dan Muslim dari Ibnu 'Abbas).` }
  };

  /* ---------------- Rukun, wajib, sunnah ---------------- */
  const RUKUN_HAJI = [
    { n: 'Ihram', d: 'Niat masuk ke dalam ibadah haji, dari miqat, pada bulan-bulan haji (Syawal, Dzulqa\'dah, dan 10 hari pertama Dzulhijjah).', m: 'Hanafi: ihram adalah syarat, bukan rukun.' },
    { n: 'Wukuf di Arafah', d: 'Hadir di Arafah (di luar Wadi \'Uranah) sejak zawal 9 Dzulhijjah sampai terbit fajar 10 Dzulhijjah, walau sesaat.', m: 'Hanbali: sejak fajar 9 Dzulhijjah. Maliki: harus mengambil sebagian malam. Hanafi: sejak zawal hingga fajar.' },
    { n: 'Thawaf ifadhah', d: `7 putaran mengelilingi Ka'bah. Waktu: setelah tengah malam 10 Dzulhijjah (Syafi'i); tidak ada batas akhir, tetapi disegerakan.`, m: 'Hanafi: cukup 4 putaran sebagai rukun, sisanya wajib.' },
    { n: `Sa'i`, d: `7 lintasan Shafa–Marwah, dikerjakan setelah thawaf (qudum atau ifadhah) yang sah.`, m: 'Hanafi: sa\'i wajib (dam bila ditinggal), bukan rukun.' },
    { n: 'Halq atau taqshir (tahalul)', d: 'Mencukur atau memotong rambut, minimal tiga helai.', m: 'Hanafi, Maliki, Hanbali: wajib (bukan rukun). Maliki dan Hanbali mensyaratkan seluruh atau sebagian besar kepala; Hanafi minimal seperempat.' },
    { n: 'Tertib', d: 'Berurutan: ihram, wukuf, thawaf ifadhah; sa\'i sesudah thawaf; halq sesudah wukuf.', m: 'Bagian dari 6 rukun menurut Syafi\'i/Kemenag RI.' }
  ];
  const WAJIB_HAJI = [
    { n: 'Ihram dari miqat', d: 'Miqat zamani (bulan haji) dan makani (lima miqat atau yang sejajar).', dam: 'Dam kambing bila melewati miqat tanpa ihram dan tidak kembali.' },
    { n: 'Mabit di Muzdalifah', d: 'Hadir pada sebagian malam 10 Dzulhijjah (setelah tengah malam, walau sesaat).', dam: 'Dam kambing bila tanpa uzur.' },
    { n: `Melempar Jumrah 'Aqabah (10 Dz)`, d: '7 kerikil, setelah tengah malam (utama setelah terbit matahari).', dam: 'Dam kambing bila ditinggalkan seluruhnya.' },
    { n: 'Melempar tiga jumrah hari tasyriq', d: `11, 12, (13) Dzulhijjah setelah zawal; 3 × 7 = 21 per hari, berurutan Ula → Wustha → 'Aqabah.`, dam: 'Satu batu: 1 mud; dua batu: 2 mud; tiga batu atau lebih (atau satu hari penuh): dam kambing.' },
    { n: 'Mabit di Mina malam tasyriq', d: 'Malam 11 dan 12 (dan 13 bagi nafar tsani), sebagian besar malam.', dam: 'Satu malam: 1 mud; dua malam: 2 mud; tiga malam: dam kambing.' },
    { n: `Thawaf wada'`, d: 'Bagi yang akan meninggalkan Makkah; gugur bagi wanita haid/nifas.', dam: 'Dam kambing bila ditinggalkan tanpa uzur dan tidak kembali.' },
    { n: 'Menjauhi larangan ihram', d: 'Selama berihram sampai tahalul.', dam: 'Fidyah/dam menurut jenis larangan (lihat tabel).' }
  ];
  const RUKUN_UMRAH = [
    { n: 'Ihram', d: 'Niat umrah dari miqat.' }, { n: 'Thawaf', d: '7 putaran.' }, { n: `Sa'i`, d: '7 lintasan Shafa–Marwah.' },
    { n: 'Halq atau taqshir', d: 'Tahalul.' }, { n: 'Tertib', d: 'Ihram → thawaf → sa\'i → tahalul.' }
  ];
  const WAJIB_UMRAH = [{ n: 'Ihram dari miqat', d: 'Dam kambing bila ditinggalkan.' }, { n: 'Menjauhi larangan ihram', d: 'Fidyah menurut jenisnya.' }];
  const SUNNAH_HAJI = ['Mandi, memakai wewangian pada badan, dan shalat sunnah sebelum ihram', 'Talbiyah sepanjang jalan', 'Thawaf qudum (ifrad/qiran)', 'Ramal dan idhtiba\' pada thawaf yang diikuti sa\'i (pria)', 'Menghadap kiblat dan berdoa lama di Arafah', 'Singgah di Namirah, mendengarkan khutbah Arafah', `Wukuf di Masy'aril Haram setelah Subuh`, 'Berdoa lama setelah jumrah Ula dan Wustha', 'Mabit di Mina malam 9 Dzulhijjah (tarwiyah)', 'Thawaf, shalat sunnah di Masjidil Haram, dan minum Zamzam'];

  /* ---------------- Dam & fidyah (Syafi'i, dengan catatan) ---------------- */
  /* Jenis dam:
     Tartib = urut (kambing → puasa 10 hari: 3 di haji + 7 setelah pulang)
     Takhyir = pilihan (kambing | puasa 3 hari | sedekah 3 sha' kepada 6 miskin)
     Mud = 1 mud makanan pokok (± 0,6–0,7 kg)
     Jaza' = padanan hewan buruan */
  const DAM = [
    { grup: 'Rukun yang terlewat — tidak cukup dengan dam', rows: [
      { x: 'Luput wukuf di Arafah (tidak sempat sebelum fajar 10 Dz)', j: 'Haji luput (fawat)', s: `Tahalul dengan amalan umrah (thawaf, sa'i, halq/taqshir); wajib qadha haji tahun berikutnya dan dam (hadyu).`, p: `Tidak ada pengganti selain qadha. Dasar: kisah Abu Ayyub dan 'Umar r.a. (Imam Malik, Muwaththa').`, b: 'Tidak bisa dibadalkan oleh orang lain; Anda sendiri yang wajib mengulang bila mampu.' },
      { x: 'Meninggalkan thawaf ifadhah', j: 'Rukun', s: 'Haji belum selesai/ belum tahalul tsani; wajib dikerjakan walau sudah pulang (kembali ke Makkah).', p: 'Tidak bisa diganti dam.', b: 'Tidak bisa diwakilkan; bila tak mampu berjalan, pakai kursi roda/digendong.' },
      { x: `Meninggalkan sa'i`, j: 'Rukun (Syafi\'i, Maliki, Hanbali)', s: 'Wajib dikerjakan walau sudah pulang.', p: 'Tidak bisa diganti dam (Hanafi: dam).', b: 'Tidak bisa diwakilkan.' },
      { x: 'Tidak halq/taqshir', j: 'Rukun (Syafi\'i)', s: 'Belum tahalul; wajib mencukur/memotong (boleh oleh orang lain).', p: 'Tidak bisa diganti dam.', b: 'Boleh dilakukan oleh tukang cukur/orang lain atas permintaan Anda.' },
      { x: 'Tidak berihram', j: 'Rukun', s: 'Ibadah tidak sah/ belum dimulai.', p: '—', b: '—' }
    ] },
    { grup: 'Wajib haji/umrah yang ditinggalkan — dam atau kafarat', rows: [
      { x: 'Melewati miqat tanpa ihram dan tidak kembali', j: 'Dam tartib', s: 'Dam: 1 kambing (atau ⅐ unta/sapi).', p: 'Tidak mampu: puasa 10 hari (3 hari saat haji, 7 hari setelah pulang). Kembali ke miqat sebelum memulai manasik menggugurkan dam.', b: 'Dapat diwakilkan penyembelihannya.' },
      { x: `Tamattu' atau qiran`, j: 'Dam nusuk (tartib)', s: 'Dam: 1 kambing / ⅐ unta atau sapi (QS. al-Baqarah 196). Dipotong di Mina/Makkah dan dibagikan kepada fakir miskin Haram.', p: 'Tidak mampu: puasa 3 hari dalam haji (sebelum 10 Dz, mis. 6–8 atau 7–9 Dz) + 7 hari setelah pulang.', b: 'Boleh diwakilkan (lembaga penyembelihan resmi). Gugur bagi penduduk Makkah/sekitar Masjidil Haram.' },
      { x: 'Tidak mabit di Muzdalifah', j: 'Dam tartib', s: 'Dam: 1 kambing bila tanpa uzur.', p: 'Tidak mampu: puasa 10 hari.', b: `Uzur (sakit, perawat sakit, wanita/lansia, atau terhalang): tidak berdosa, rukhsah meninggalkan setelah tengah malam; dam gugur bila mabit sekejap setelah tengah malam.` },
      { x: `Tidak mabit di Mina (malam tasyriq)`, j: 'Mud / dam', s: '1 malam: 1 mud makanan; 2 malam: 2 mud; 3 malam: dam kambing.', p: 'Tidak mampu: puasa sesuai (1 hari per mud).', b: `Rukhsah (tanpa dam) bagi petugas pemberi minum jamaah (siqayah), penggembala, dan yang sakit/merawat orang sakit (HR. al-Bukhari dan Muslim, 'Abbas). Pendapat lain (Maliki, Hanbali): dam kambing meski satu malam.` },
      { x: `Meninggalkan Jumrah 'Aqabah (10 Dz)`, j: 'Dam', s: '7 kerikil ditinggalkan seluruhnya: dam kambing.', p: 'Tidak mampu: puasa 10 hari.', b: 'Boleh diwakilkan bila uzur (wakil melempar untuk dirinya dulu).' },
      { x: 'Meninggalkan lempar hari tasyriq', j: 'Mud / dam', s: '1 batu: 1 mud; 2 batu: 2 mud; 3 batu atau lebih (atau satu hari penuh): dam kambing. Seluruh jumrah tasyriq: satu dam.', p: 'Sama seperti di atas.', b: 'Boleh diwakilkan bila uzur (sakit parah, hamil tua, lansia lemah, anak kecil); wakil harus melempar untuk dirinya dulu di tiap jumrah.' },
      { x: 'Meninggalkan Arafah sebelum matahari terbenam', j: 'Dam (sunnah di Syafi\'i)', s: `Syafi'i: disunnahkan dam kambing bila tidak kembali sebelum maghrib. Hanafi, Maliki, Hanbali: dam kambing wajib.`, p: '—', b: 'Berlaku bagi yang hadir pada siang hari.' },
      { x: `Meninggalkan thawaf wada'`, j: 'Dam', s: 'Dam kambing bila tanpa uzur dan tidak kembali sebelum mencapai jarak qashar dari Makkah.', p: 'Tidak mampu: puasa 10 hari.', b: 'Gugur bagi wanita haid/nifas dan yang punya uzur kuat (mis. terlambat pesawat darurat).' }
    ] },
    { grup: 'Larangan ihram yang dilanggar — fidyah/kafarat', rows: [
      { x: 'Mencukur/ mencabut rambut, memotong kuku, memakai wewangian, minyak rambut', j: 'Dam takhyir (pilihan)', s: `Pilihan: (1) sembelih 1 kambing, atau (2) puasa 3 hari, atau (3) sedekah 3 sha' makanan pokok kepada 6 orang miskin (masing-masing ½ sha'). Satu atau dua helai rambut/kuku: 1 mud / 2 mud. Dalil: QS. al-Baqarah 196; HR. al-Bukhari dan Muslim (Ka'b bin 'Ujrah).`, p: '—', b: 'Dengan uzur (sakit/ gangguan) tidak berdosa tetapi tetap fidyah.' },
      { x: 'Memakai pakaian berjahit atau menutup kepala (pria); cadar dan sarung tangan (wanita)', j: 'Dam takhyir', s: 'Sama seperti di atas, bila sengaja. Karena lupa atau tidak tahu hukum: tidak ada fidyah menurut Syafi\'i (qaul jadid) untuk pakaian dan wewangian.', p: '—', b: '—' },
      { x: 'Berburu/ membunuh hewan buruan darat', j: 'Dam jaza\'', s: `Pilihan: ternak padanannya (diputuskan dua orang adil), atau makanan senilai kepada fakir miskin, atau puasa (1 hari tiap 1 mud). Dalil: QS. al-Maidah 95.`, p: '—', b: '—' },
      { x: 'Memotong pohon/ tanaman hijau di tanah Haram', j: 'Dam (bagi yang berihram maupun tidak)', s: `Pohon besar: 1 sapi; pohon kecil: 1 kambing; rumput: nilainya (Syafi'i).`, p: '—', b: '—' },
      { x: 'Berhubungan suami-istri sebelum tahalul awal', j: 'Merusak haji/umrah', s: `Hajinya rusak (fasad): wajib dam berat (unta; jika tak ada sapi; lalu 7 kambing), menyempurnakan manasik yang sedang berjalan, dan mengulang (qadha) tahun depan. Antara tahalul awal dan tsani: haji tetap sah, dam kambing dan ihram ulang (rincian ke pembimbing).`, p: '—', b: 'Tidak bisa dibadalkan.' },
      { x: 'Bersentuhan syahwat tanpa jimak (mubasyarah)', j: 'Dam (kambing) bila keluar mani', s: 'Dam kambing; haji tetap sah.', p: '—', b: '—' },
      { x: 'Akad nikah atau melamar', j: 'Haram, akad tidak sah', s: 'Tidak ada dam; akad batal.', p: '—', b: '—' },
      { x: 'Terhalang menyempurnakan haji (sakit, dihalangi musuh) tanpa isytirath', j: 'Ihshar', s: 'Menyembelih 1 kambing di tempat terhalang, lalu halq/taqshir dan tahalul; haji wajib dikerjakan ulang.', p: 'Bila berisytirath ("mahilli haitsu habastani"): tahalul tanpa dam.', b: '—' }
    ] }
  ];
  const MUD_CAT = `1 mud ≈ 0,6–0,7 kg makanan pokok (beras); 1 sha' ≈ 4 mud ≈ 2,4–2,7 kg. Nilai pasti ditetapkan lembaga fatwa setempat. Dam disembelih di tanah Haram dan dagingnya untuk fakir miskin di sana; hadyu tamattu'/qiran boleh dimakan sebagian oleh pelaku, sedangkan dam kafarat tidak.`;

  /* ---------------- Badal & perwakilan ---------------- */
  const BADAL = [
    { x: 'Haji wajib bagi yang wafat sebelum sempat berhaji padahal mampu', b: 'Ya, dibadalkan', k: 'Ahli waris/orang lain yang sudah berhaji untuk dirinya sendiri berhaji atas namanya.', d: 'HR. al-Bukhari (wanita dari Juhainah: "Berhajilah untuknya... bukankah jika ibumu berhutang kau membayarnya?").' },
    { x: 'Haji wajib bagi yang masih hidup tetapi sakit permanen/ lansia lemah sehingga tak mampu naik kendaraan (ma\'dhub)', b: 'Ya, dibadalkan', k: 'Dengan izin/permintaan yang bersangkutan; biaya dari hartanya. Bila kelak sembuh total, Syafi\'i: wajib mengulang sendiri bila mampu (perincian ke pembimbing).', d: 'HR. al-Bukhari dan Muslim (wanita Khats\'am: "Ayahku wajib haji tetapi tidak sanggup duduk di atas kendaraan").' },
    { x: 'Haji sunnah/ ulangan bagi yang sehat dan mampu', b: 'Tidak', k: 'Orang sehat yang mampu mengerjakan sendiri tidak dibadalkan.', d: 'Pendapat jumhur; berbeda dengan Hanafi pada haji sunnah.' },
    { x: 'Syarat orang yang membadalkan', b: 'Wajib', k: 'Sudah berhaji untuk dirinya sendiri lebih dulu; muslim, baligh, berakal, mampu.', d: 'HR. Abu Dawud dan Ibnu Majah (kisah Syubrumah: "Berhajilah untuk dirimu, lalu untuk Syubrumah"); Syafi\'i dan Hanbali memegang ini.' },
    { x: 'Umrah', b: 'Ya, dibadalkan', k: 'Seperti haji (bagi yang wafat/ma\'dhub); wajib menurut Syafi\'i dan Hanbali.', d: 'HR. Abu Dawud, at-Tirmidzi, an-Nasa\'i (Abu Razin al-\'Uqayli: "Berhajilah dan berumrahlah untuk ayahmu").' },
    { x: 'Wukuf di Arafah bagi jamaah yang hadir tetapi sakit', b: 'Tidak bisa diwakilkan', k: 'Jamaah dibawa ke Arafah (mis. safari wukuf dengan ambulans/ kursi roda); bahkan dalam keadaan tidak sadar tetap sah selama hadir di Arafah pada waktunya.', d: 'Ijma\' ulama bahwa wukuf itu rukun badani; panduan Kemenag RI (safari wukuf).' },
    { x: `Thawaf dan sa'i bagi yang tak mampu berjalan`, b: 'Tidak bisa diwakilkan', k: 'Boleh dengan kursi roda, tandu, atau digendong; tetap sah.', d: 'HR. al-Bukhari dan Muslim (Nabi saw. thawaf di atas unta; Ummu Salamah thawaf sambil berkendara).' },
    { x: 'Melempar jumrah', b: 'Boleh diwakilkan bila uzur', k: 'Uzur: sakit, hamil tua, lansia lemah, anak kecil, atau tidak mungkin menahan desakan. Wakil melempar untuk dirinya lebih dulu pada tiap jumrah, kemudian untuk yang diwakili.', d: 'Atsar sahabat (Jabir: "Kami melempar untuk anak-anak", HR. Ibnu Majah, hasan). Dalam panduan Kemenag RI diperbolehkan.' },
    { x: 'Mabit di Muzdalifah dan Mina', b: 'Tidak diwakilkan; ada keringanan', k: 'Rukhsah meninggalkan karena uzur (sakit, merawat orang sakit, petugas, pemberi minum, penggembala). Tidak ada perwakilan.', d: 'HR. al-Bukhari dan Muslim (izin untuk al-\'Abbas); HR. Abu Dawud (penggembala).' },
    { x: 'Menyembelih hadyu / dam', b: 'Boleh diwakilkan', k: 'Boleh melalui wakil atau lembaga penyembelihan (di tanah Haram, pada waktunya); daging dibagikan kepada fakir miskin Haram.', d: 'HR. Muslim: Nabi saw. menyuruh \'Ali menyembelih sisa unta.' },
    { x: 'Halq / taqshir', b: 'Boleh dilakukan orang lain', k: 'Tukang cukur atau pendamping dapat mencukur/memotong; niat tetap pada jamaah.', d: 'HR. Muslim: Nabi saw. dicukur oleh Ma\'mar bin \'Abdullah.' },
    { x: `Thawaf wada' bagi wanita haid/nifas`, b: 'Gugur', k: 'Tidak wajib dan tidak ada dam. Thawaf ifadhah tetap rukun: tunggu suci (atau mintalah fatwa pembimbing dan dokter mengenai penundaan haid).', d: 'HR. al-Bukhari dan Muslim (Ibnu \'Abbas; kisah Shafiyyah binti Huyayy).' },
    { x: 'Puasa pengganti dam (3 + 7 hari)', b: 'Tidak diwakilkan', k: 'Dilakukan sendiri; puasa 7 hari setelah pulang ke tanah air.', d: 'QS. al-Baqarah 196.' }
  ];

  /* ---------------- Rujukan ---------------- */
  const RUJUKAN = [
    { g: 'Hadits dan syarahnya', r: [
      'Shahih al-Bukhari dan Shahih Muslim, Kitab al-Hajj (terutama hadits Jabir, Muslim no. 1218)', 'Sunan Abu Dawud, at-Tirmidzi, an-Nasa\'i, dan Ibnu Majah, Kitab/Abwab al-Manasik',
      'Fathul Bari — Ibnu Hajar al-\'Asqalani', 'Syarh Shahih Muslim — Imam an-Nawawi', 'Al-Muwaththa\' — Imam Malik' ] },
    { g: `Fiqih mazhab Syafi'i (utama)`, r: [
      `Al-Idhah fi Manasik al-Hajj wal-'Umrah — Imam an-Nawawi`, `Al-Majmu' Syarh al-Muhadzdzab (Kitab al-Hajj) — Imam an-Nawawi`, `Minhajuth Thalibin — Imam an-Nawawi`, `Fathul Mu'in dan I'anatuth Thalibin — Zainuddin al-Malibari / Sayyid Bakri Syatha`,
      `Kifayatul Akhyar — Taqiyuddin al-Hishni`, `Tuhfatul Muhtaj — Ibnu Hajar al-Haitami`, `Al-Umm — Imam asy-Syafi'i` ] },
    { g: 'Perbandingan mazhab', r: [
      'Bidayatul Mujtahid — Ibnu Rusyd', `Al-Mughni — Ibnu Qudamah (Hanbali)`, `Al-Fiqh 'alal Madzahib al-Arba'ah — Abdurrahman al-Jaziri`, 'Al-Fiqh al-Islami wa Adillatuhu — Wahbah az-Zuhaili', 'Fiqhus Sunnah — Sayyid Sabiq' ] },
    { g: 'Sirah dan sejarah haji Nabi saw.', r: [
      `Zadul Ma'ad — Ibnul Qayyim al-Jauziyyah`, 'Hajjatun Nabi saw. kama rawaha Jabir — Syaikh al-Albani', 'Ar-Rahiq al-Makhtum — Shafiyyurrahman al-Mubarakfuri' ] },
    { g: 'Fatwa ulama kontemporer', r: [
      `Majmu' Fatawa — Syaikh Ibnu Baz`, `Majmu' Fatawa wa Rasa'il dan Asy-Syarhul Mumti' — Syaikh Ibnu 'Utsaimin`, `Fatawa al-Lajnah ad-Da'imah (Saudi Arabia)`, 'Fatwa MUI tentang haji dan umrah', 'Himpunan Putusan Tarjih Muhammadiyah (Tuntunan Manasik Haji)', 'Keputusan Bahtsul Masail NU' ] },
    { g: 'Buku panduan di Indonesia', r: [
      'Buku Manasik Haji dan Umrah / Tuntunan Manasik — Kementerian Agama RI (Ditjen PHU), terbit tiap musim haji', 'Seri Fiqih Kehidupan: Haji dan Umrah — Ahmad Sarwat, Lc.', 'Haji dan Umrah bersama M. Quraish Shihab', `Ihya' 'Ulumiddin, Kitab Asrarul Hajj (makna batin haji) — al-Ghazali` ] }
  ];
  const RUJUKAN_CATATAN = 'Daftar ini adalah petunjuk bacaan, bukan jaminan kesesuaian setiap rincian dengan isi buku. Periksa edisi terbaru dan nomor hadits pada kitab aslinya. Untuk keputusan di lapangan, rujuk pembimbing resmi dan ketentuan Kementerian Haji dan Umrah serta pemerintah Arab Saudi yang dapat berubah tiap tahun.';

  /* ---------------- Kuis ---------------- */
  /* kat: mode, ihram, thawaf, sai, tarwiyah, arafah, muzd, mina, hadyu, tahalul, dam, badal, rukun, doa */
  const KUIS = [
    { kat: 'mode', q: 'Jenis haji manakah yang menggabungkan niat umrah dan haji dalam satu ihram?', o: [`Qiran`, `Tamattu'`, 'Ifrad'], a: 0, why: `Qiran: "Labbaika 'umratan wa hajjan" (HR. Muslim dari Anas). Wajib dam nusuk.` },
    { kat: 'mode', q: `Siapa yang wajib membayar dam nusuk (hadyu)?`, o: [`Pelaku tamattu' dan qiran yang bukan penduduk sekitar Masjidil Haram`, 'Hanya pelaku ifrad', 'Seluruh jamaah tanpa kecuali'], a: 0, why: `QS. al-Baqarah 196. Ifrad tidak wajib dam nusuk.` },
    { kat: 'mode', q: `Pada haji tamattu', kapan jamaah berihram untuk haji?`, o: ['Sekitar 8 Dzulhijjah dari tempat menginapnya di Makkah', 'Di miqat bersamaan dengan umrah', 'Setelah wukuf di Arafah'], a: 0, why: `Setelah tahalul umrah, ia bebas ihram; lalu berniat haji dari Makkah (HR. al-Bukhari dan Muslim: penduduk Makkah berihram dari Makkah).` },
    { kat: 'mode', q: `Pada haji ifrad, setelah thawaf qudum dan sa'i, jamaah...`, o: ['Tetap berihram sampai tahalul awal pada 10 Dzulhijjah', 'Boleh tahalul dan memakai pakaian biasa', 'Tahalul setelah wukuf saja'], a: 0, why: `Jamaah ifrad dan qiran tetap berihram sampai tahalul awal pada 10 Dzulhijjah; larangan ihram terus dijaga.` },
    { kat: 'mode', q: `Dalam haji qiran, berapa thawaf dan sa'i yang cukup menurut jumhur?`, o: [`Satu thawaf (qudum) dan satu sa'i untuk umrah dan haji`, `Dua thawaf dan dua sa'i`, `Tidak perlu sa'i`], a: 0, why: `Jumhur (Syafi'i, Maliki, Hanbali): cukup satu. Hanafi: dua thawaf dan dua sa'i.` },
    { kat: 'mode', q: 'Menurut Syafi\'i dan Maliki, jenis haji yang paling utama (bila umrah dilakukan pada tahun yang sama) ialah...', o: ['Ifrad', 'Qiran', 'Tamattu\''], a: 0, why: `Hanbali memilih tamattu', Hanafi memilih qiran. Semuanya sah.` },
    { kat: 'ihram', q: 'Apa rukun ihram?', o: ['Niat masuk ke dalam nusuk (haji/umrah)', 'Memakai dua kain putih tak berjahit', 'Mandi sunnah'], a: 0, why: 'Pakaian ihram dan mandi hanya sunnah/aturan; yang menjadi rukun ialah niat.' },
    { kat: 'ihram', q: `Waktu ihram haji (zamani) menurut QS. al-Baqarah 197:`, o: [`Syawal, Dzulqa'dah, dan 10 hari pertama Dzulhijjah`, 'Hanya bulan Dzulhijjah', 'Sepanjang tahun'], a: 0, why: '"Al-hajju asyhurun ma\'lumat" — bulan-bulan haji yang dikenal.' },
    { kat: 'ihram', q: `Dari mana penduduk Makkah berihram untuk haji?`, o: ['Dari Makkah (tempat tinggalnya)', 'Dari Dzul Hulaifah', 'Dari Yalamlam'], a: 0, why: 'HR. al-Bukhari dan Muslim dari Ibnu \'Abbas: "…dan penduduk Makkah, dari Makkah".' },
    { kat: 'ihram', q: 'Talbiyah pada haji dibaca hingga...', o: [`Mulai melempar Jumrah 'Aqabah pada 10 Dzulhijjah`, 'Wukuf di Arafah', 'Thawaf wada\''], a: 0, why: 'HR. al-Bukhari dari Ibnu \'Abbas. Pada umrah: sampai mulai thawaf.' },
    { kat: 'thawaf', q: 'Ramal dan idhtiba\' (khusus pria) disunnahkan pada...', o: ['Thawaf yang diikuti sa\'i (umrah, qudum)', 'Semua thawaf termasuk wada\'', 'Hanya thawaf wanita'], a: 0, why: 'Tidak pada thawaf wada\' dan ifadhah yang tidak diikuti sa\'i.' },
    { kat: 'thawaf', q: 'Ke arah mana thawaf dilakukan?', o: [`Berlawanan arah jarum jam, Ka'bah di sebelah kiri`, `Searah jarum jam, Ka'bah di sebelah kanan`, 'Bebas'], a: 0, why: `Ka'bah di sebelah kiri; dimulai dan diakhiri sejajar Hajar Aswad.` },
    { kat: 'thawaf', q: 'Thawaf ifadhah adalah...', o: ['Rukun haji', 'Hanya sunnah', 'Wajib yang bisa diganti dam'], a: 0, why: 'QS. al-Hajj 29: "walyaththawwafu bil baitil \'atiq".' },
    { kat: 'thawaf', q: `Siapa yang gugur kewajiban thawaf wada'?`, o: [`Wanita haid atau nifas`, 'Orang yang lelah', 'Yang sudah tahalul'], a: 0, why: `HR. al-Bukhari dan Muslim dari Ibnu 'Abbas: keringanan bagi wanita haid.` },
    { kat: 'thawaf', q: `Bagian bangunan mana yang tidak boleh dilewati (dipotong) saat thawaf?`, o: ['Hijr Ismail (thawaf harus di luar Hijr)', 'Zamzam', `Pintu Ka'bah`], a: 0, why: `Hijr Ismail termasuk bagian Baitullah.` },
    { kat: 'thawaf', q: 'Bacaan setelah al-Fatihah dalam dua rakaat setelah thawaf:', o: ['Al-Kafirun lalu al-Ikhlas', 'Al-Ikhlas lalu al-Falaq', 'Yasin'], a: 0, why: 'HR. Muslim (hadits Jabir).' },
    { kat: 'sai', q: `Sa'i haji dikerjakan setelah...`, o: [`Thawaf yang sah (qudum atau ifadhah)`, 'Wukuf', 'Lempar jumrah'], a: 0, why: `Sa'i tidak sah sebelum thawaf.` },
    { kat: 'sai', q: `Berapa sa'i yang dikerjakan jamaah tamattu'?`, o: [`Dua: sa'i umrah dan sa'i haji`, 'Satu', 'Tiga'], a: 0, why: `Sa'i umrah setelah thawaf umrah, sa'i haji setelah thawaf ifadhah.` },
    { kat: 'sai', q: 'Lintasan ke-7 sa\'i berakhir di...', o: ['Marwah', 'Shafa', 'Maqam Ibrahim'], a: 0, why: 'Shafa→Marwah = 1; berakhir di Marwah pada lintasan ke-7.' },
    { kat: 'tarwiyah', q: 'Di Mina pada hari Tarwiyah (8 Dz), shalat yang dikerjakan jamaah:', o: ['Pada waktunya, yang empat rakaat diqashar tanpa jamak', 'Dijamak dan diqashar sekaligus', 'Dikerjakan penuh empat rakaat'], a: 0, why: 'Nabi saw. shalat lima waktu di Mina pada waktunya (HR. Muslim, Jabir).' },
    { kat: 'tarwiyah', q: `Di mana pelaku tamattu' mengambil miqat untuk ihram haji pada 8 Dzulhijjah?`, o: ['Dari Makkah sendiri', 'Dari Tan\'im wajib', 'Dari Jeddah'], a: 0, why: 'Miqat penduduk Makkah ialah Makkah.' },
    { kat: 'arafah', q: 'Sabda Nabi saw.: "Al-hajju ..." (haji itu ...)', o: ['Arafah', 'Thawaf', 'Mina'], a: 0, why: 'HR. Ahmad dan Ashhabus Sunan (sahih). Tanpa wukuf, haji tidak sah.' },
    { kat: 'arafah', q: 'Rentang waktu wukuf menurut mazhab Syafi\'i:', o: ['Zawal 9 Dz sampai fajar 10 Dz', 'Maghrib 9 Dz sampai zawal 10 Dz', 'Hanya siang 9 Dz'], a: 0, why: 'Hanbali memulai sejak fajar 9; Maliki mewajibkan menyertakan sebagian malam. Hadir sesaat saja sah.' },
    { kat: 'arafah', q: `Bagaimana hukum wukuf di Wadi 'Uranah?`, o: ['Tidak sah: Wadi \'Uranah bukan bagian Arafah', 'Sah, bagian utama Arafah', 'Sah di waktu malam saja'], a: 0, why: `"Arafah seluruhnya tempat wukuf, kecuali Wadi 'Uranah" (HR. Ibnu Majah, sahih).` },
    { kat: 'arafah', q: 'Shalat di Namirah/Arafah pada 9 Dz:', o: ['Dzuhur+Ashar jamak taqdim dan qashar, satu adzan dua iqamah', 'Hanya Dzuhur', 'Masing-masing pada waktunya penuh'], a: 0, why: 'HR. Muslim (hadits Jabir).' },
    { kat: 'arafah', q: 'Setelah matahari terbenam 9 Dz, jamaah...', o: ['Berangkat ke Muzdalifah dan shalat Maghrib+Isya di sana', 'Shalat Maghrib di Arafah lalu bermalam', 'Kembali ke Makkah'], a: 0, why: 'Nabi saw. bersabda kepada Usamah: "Shalat itu ada di depanmu" (HR. al-Bukhari dan Muslim).' },
    { kat: 'arafah', q: 'Apakah dianjurkan berpuasa Arafah bagi jamaah yang sedang wukuf di Arafah?', o: ['Tidak; Nabi saw. berbuka di Arafah agar kuat berdoa', 'Ya, wajib', 'Ya, sunnah muakkad'], a: 0, why: `HR. al-Bukhari dan Muslim (Ummul Fadhl memberi susu). Puasa Arafah sunnah bagi yang tidak berhaji.` },
    { kat: 'arafah', q: 'Doa yang paling baik pada hari Arafah:', o: ['Lā ilāha illallāhu wahdahū... (tahlil dan tauhid)', 'Hanya istighfar', 'Doa tertentu yang dibakukan khusus'], a: 0, why: 'HR. at-Tirmidzi (hasan karena penguat).' },
    { kat: 'muzd', q: `Shalat Maghrib dan Isya di Muzdalifah:`, o: ['Dijamak dengan satu adzan dan dua iqamah', 'Masing-masing dengan adzan', 'Shalat Maghrib saja'], a: 0, why: 'HR. Muslim (hadits Jabir).' },
    { kat: 'muzd', q: `Mabit di Muzdalifah menurut Syafi'i dianggap sah dengan...`, o: [`Hadir sebagian malam, termasuk setelah tengah malam, walau sesaat`, 'Sepanjang malam penuh', 'Setelah Subuh saja'], a: 0, why: 'Tambahan rukhsah untuk yang lemah: berangkat setelah tengah malam.' },
    { kat: 'muzd', q: 'Orang lemah, wanita, dan pendampingnya:', o: [`Boleh meninggalkan Muzdalifah setelah tengah malam`, 'Wajib menunggu Subuh', 'Boleh berangkat sebelum Maghrib'], a: 0, why: `HR. al-Bukhari dan Muslim (Asma' dan Ibnu 'Abbas).` },
    { kat: 'muzd', q: 'Kerikil jumrah:', o: ['Boleh diambil dari mana saja; tidak wajib dari Muzdalifah', 'Wajib dari Muzdalifah', 'Wajib dari Mina'], a: 0, why: `Nabi saw. menyuruh Ibnu 'Abbas mengambilkan kerikil di pagi 'Aqabah (HR. Ahmad, an-Nasa'i, Ibnu Majah). Mengambil di Muzdalifah hanya kebiasaan.` },
    { kat: 'muzd', q: 'Ukuran kerikil jumrah:', o: ['Seperti biji kacang / ujung jari (kerikil lontar)', 'Sebesar kepalan tangan', 'Sebesar telur'], a: 0, why: 'HR. Muslim dan Ahmad dari Ibnu \'Abbas: "kerikil lontar"; jangan terlalu besar.' },
    { kat: 'muzd', q: 'Total kerikil untuk nafar awal dan nafar tsani:', o: ['49 dan 70', '21 dan 42', '7 dan 21'], a: 0, why: '7 (10 Dz) + 21×2 = 49; 7 + 21×3 = 70.' },
    { kat: 'muzd', q: 'Wadi Muhassir:', o: ['Bukan bagian Muzdalifah; jamaah mempercepat langkah melewatinya', 'Tempat wukuf utama', 'Batas Arafah'], a: 0, why: 'Nabi saw. mempercepat kendaraannya di sana (HR. Muslim, Jabir).' },
    { kat: 'muzd', q: 'Bagi yang sehat, waktu meninggalkan Muzdalifah:', o: ['Setelah Subuh dan wukuf di Masy\'aril Haram, sebelum terbit matahari', 'Sebelum Subuh', 'Setelah Dzuhur'], a: 0, why: 'HR. Muslim (hadits Jabir).' },
    { kat: 'mina', q: 'Pada 10 Dzulhijjah dilempar...', o: [`Jumrah 'Aqabah saja (7 kerikil)`, 'Ketiga jumrah', 'Jumrah Ula saja'], a: 0, why: `Tiga jumrah baru pada hari tasyriq.` },
    { kat: 'mina', q: 'Urutan melempar pada hari tasyriq:', o: [`Ula → Wustha → 'Aqabah`, `'Aqabah → Wustha → Ula`, 'Bebas'], a: 0, why: 'Urutan ini wajib (tertib).' },
    { kat: 'mina', q: 'Waktu melempar hari tasyriq:', o: [`Setelah zawal (matahari tergelincir)`, 'Sebelum Subuh', 'Setelah Isya saja'], a: 0, why: `Nabi saw. melempar setelah zawal (HR. Muslim, Jabir). Sebagian ulama kontemporer membolehkan sebelum zawal saat sangat padat; ikuti arahan pembimbing.` },
    { kat: 'mina', q: 'Cara melempar jumrah:', o: ['Satu per satu sambil bertakbir; kerikil harus jatuh di kolam (marma)', 'Sekaligus tujuh', 'Boleh melempar sandal'], a: 0, why: `HR. Muslim: setiap lemparan disertai takbir.` },
    { kat: 'mina', q: 'Setelah melempar Ula dan Wustha:', o: ['Menghadap kiblat dan berdoa lama', 'Langsung pergi', 'Thawaf sunnah'], a: 0, why: `HR. al-Bukhari (Ibnu 'Umar). Setelah 'Aqabah tidak berdoa.` },
    { kat: 'mina', q: `Posisi melempar Jumrah 'Aqabah menurut Ibnu Mas'ud:`, o: [`Ka'bah di sebelah kiri dan Mina di sebelah kanan`, `Ka'bah di kanan`, 'Menghadap Mina'], a: 0, why: `HR. al-Bukhari dan Muslim.` },
    { kat: 'mina', q: 'Nafar awal artinya:', o: ['Meninggalkan Mina sebelum terbenam matahari 12 Dzulhijjah setelah melempar', 'Keluar sebelum Subuh 11 Dz', 'Keluar tanpa melempar'], a: 0, why: 'QS. al-Baqarah 203; nafar tsani (sampai 13) lebih utama.' },
    { kat: 'mina', q: 'Jika matahari terbenam 12 Dz dan masih di Mina (Syafi\'i):', o: ['Wajib mabit malam 13 dan melempar lagi', 'Boleh keluar tanpa kewajiban', 'Harus membayar dam saja'], a: 0, why: 'Hanafi membolehkan keluar sebelum fajar 13.' },
    { kat: 'mina', q: `Mabit di Mina yang wajib menurut Syafi'i:`, o: ['Lebih dari separuh malam', 'Sepanjang malam penuh', 'Sebentar saja'], a: 0, why: 'Yaitu mayoritas malam pada malam 11 dan 12 (dan 13).' },
    { kat: 'hadyu', q: 'Hadyu tamattu\'/qiran:', o: ['1 kambing atau ⅐ unta/sapi, disembelih di tanah Haram', 'Boleh di daerah asal', 'Cukup sedekah uang'], a: 0, why: 'QS. al-Baqarah 196; QS. al-Hajj 33.' },
    { kat: 'hadyu', q: 'Bila tidak mampu hadyu:', o: ['Puasa 3 hari dalam haji + 7 hari setelah pulang', 'Gugur', 'Sedekah 10 mud'], a: 0, why: 'QS. al-Baqarah 196: "tiga hari dalam haji dan tujuh hari apabila kamu telah pulang".' },
    { kat: 'tahalul', q: 'Tahalul awal terjadi setelah...', o: ['Dua dari tiga: lempar \'Aqabah, halq/taqshir, thawaf ifadhah (+sa\'i)', 'Wukuf saja', 'Hari ke-13'], a: 0, why: 'Setelah tahalul awal, semua larangan ihram gugur kecuali hubungan suami-istri.' },
    { kat: 'tahalul', q: 'Setelah tahalul awal, masih dilarang:', o: ['Hubungan suami-istri', 'Memakai pakaian berjahit', 'Memakai wewangian'], a: 0, why: 'Tahalul tsani membebaskan semuanya.' },
    { kat: 'tahalul', q: 'Urutan 10 Dzulhijjah tertukar (mis. cukur dahulu):', o: ['Tidak mengapa', 'Haji tidak sah', 'Wajib dam'], a: 0, why: '"Lakukan, tidak mengapa" (HR. al-Bukhari dan Muslim, Abdullah bin Amr).' },
    { kat: 'tahalul', q: 'Minimal rambut yang dicukur/dipotong menurut Syafi\'i:', o: ['Tiga helai', 'Seluruh kepala', 'Seperempat kepala'], a: 0, why: 'Hanafi: seperempat. Maliki dan Hanbali: seluruh atau sebagian besar.' },
    { kat: 'tahalul', q: 'Halq bagi pria:', o: ['Lebih utama daripada taqshir', 'Wajib', 'Sama persis'], a: 0, why: 'Nabi mendoakan yang halq tiga kali dan yang taqshir sekali (HR. al-Bukhari dan Muslim).' },
    { kat: 'tahalul', q: 'Wanita bertahalul dengan...', o: ['Memotong ujung rambut sepanjang ujung jari', 'Mencukur gundul', 'Tidak perlu'], a: 0, why: 'HR. Abu Dawud: "tidak ada halq bagi wanita, hanya taqshir".' },
    { kat: 'dam', q: 'Meninggalkan satu malam mabit Mina (Syafi\'i):', o: ['1 mud makanan', 'Dam kambing', 'Tidak apa-apa'], a: 0, why: 'Tiga malam: dam kambing.' },
    { kat: 'dam', q: `Meninggalkan thawaf wada' tanpa uzur:`, o: ['Dam kambing', '1 mud', 'Tidak apa-apa'], a: 0, why: 'Diriwayatkan atsar Ibnu \'Abbas: "Siapa meninggalkan nusuk, hendaklah ia menyembelih dam" (Muwaththa\').' },
    { kat: 'dam', q: 'Melewati miqat tanpa ihram dan tidak kembali:', o: ['Dam kambing', 'Hajinya batal', 'Tidak ada dam'], a: 0, why: 'Kembali ke miqat sebelum memulai manasik menggugurkan dam.' },
    { kat: 'dam', q: 'Memotong kuku dengan sengaja (tiga kuku ke atas) saat ihram:', o: ['Dam takhyir: kambing / puasa 3 hari / sedekah 3 sha\' kepada 6 miskin', 'Hanya istighfar', 'Hajinya batal'], a: 0, why: 'QS. al-Baqarah 196; HR. al-Bukhari dan Muslim (Ka\'b bin \'Ujrah).' },
    { kat: 'dam', q: 'Jimak sebelum tahalul awal:', o: ['Haji rusak: dam berat, melanjutkan manasik, dan qadha', 'Hanya dosa', 'Dam 1 mud'], a: 0, why: 'Setelah tahalul awal sebelum tsani: haji sah tetapi wajib dam.' },
    { kat: 'dam', q: 'Meninggalkan satu kerikil jumrah:', o: ['1 mud makanan', 'Dam kambing', 'Hajinya batal'], a: 0, why: '2 kerikil: 2 mud; 3 atau lebih: dam kambing.' },
    { kat: 'dam', q: 'Luput wukuf (haji luput):', o: ['Tahalul dengan amalan umrah, dam, dan qadha haji', 'Cukup dam', 'Tidak ada akibat'], a: 0, why: 'Atsar \'Umar r.a. untuk Abu Ayyub (Muwaththa\').' },
    { kat: 'dam', q: 'Dam kafarat/wajib disembelih di...', o: ['Tanah Haram dan dagingnya untuk fakir miskin Haram', 'Di mana saja', 'Hanya di Indonesia'], a: 0, why: 'QS. al-Hajj 33: "tempat penyembelihannya ialah di sisi Baitul \'Atiq".' },
    { kat: 'dam', q: 'Yang tidak wajib dam tamattu\':', o: ['Penduduk Makkah/ sekitar Masjidil Haram', 'Orang Indonesia', 'Jamaah wanita'], a: 0, why: 'QS. al-Baqarah 196: "bagi orang yang keluarganya tidak berada di sekitar Masjidil Haram".' },
    { kat: 'badal', q: 'Orang tua lansia yang wajib haji tetapi sakit permanen:', o: ['Boleh dibadalkan', 'Tidak boleh', 'Gugur kewajiban'], a: 0, why: 'HR. al-Bukhari dan Muslim (wanita Khats\'am).' },
    { kat: 'badal', q: 'Syarat orang yang membadalkan:', o: ['Sudah berhaji untuk dirinya sendiri', 'Tidak ada syarat', 'Harus kerabat dekat'], a: 0, why: 'HR. Abu Dawud dan Ibnu Majah (kisah Syubrumah).' },
    { kat: 'badal', q: 'Jamaah sakit yang hadir di Arafah:', o: ['Dibawa ke Arafah (safari wukuf); tidak bisa diwakilkan', 'Wukufnya diwakilkan', 'Gugur'], a: 0, why: 'Wukuf rukun badani.' },
    { kat: 'badal', q: `Thawaf bagi yang tak mampu berjalan:`, o: ['Boleh kursi roda/digendong; tetap sah', 'Harus berjalan', 'Diwakilkan'], a: 0, why: 'Nabi saw. thawaf di atas unta (HR. al-Bukhari dan Muslim).' },
    { kat: 'badal', q: 'Melempar jumrah oleh orang yang uzur:', o: ['Boleh diwakilkan; wakil melempar untuk dirinya dulu', 'Tidak boleh sama sekali', 'Wakil langsung untuk orang lain'], a: 0, why: 'Atsar Jabir (HR. Ibnu Majah).' },
    { kat: 'rukun', q: `Jumlah rukun haji menurut Syafi'i/Kemenag RI:`, o: [`6: ihram, wukuf, thawaf ifadhah, sa'i, tahalul, tertib`, '4', '8'], a: 0, why: 'Pendapat lain: Hanafi 2 (wukuf dan thawaf ifadhah), Maliki dan Hanbali 4.' },
    { kat: 'rukun', q: 'Yang termasuk rukun haji:', o: ['Wukuf di Arafah', 'Mabit di Mina', 'Melempar jumrah'], a: 0, why: 'Mabit Mina dan jumrah adalah wajib haji.' },
    { kat: 'rukun', q: 'Yang termasuk wajib haji:', o: ['Mabit di Muzdalifah', 'Wukuf', "Sa'i"], a: 0, why: `Wukuf dan sa'i rukun (Syafi'i).` },
    { kat: 'rukun', q: 'Rukun umrah:', o: [`Ihram, thawaf, sa'i, tahalul, tertib`, 'Ihram, wukuf, thawaf', 'Hanya thawaf'], a: 0, why: 'Umrah tidak ada wukuf, mabit, atau jumrah.' },
    { kat: 'rukun', q: 'Perbedaan rukun dan wajib:', o: ['Rukun terlewat → haji tidak sah dan tak bisa diganti dam; wajib terlewat → sah dengan dam', 'Keduanya sama', 'Wajib lebih berat dari rukun'], a: 0, why: 'Inilah pokok pembeda dalam fikih manasik.' },
    { kat: 'doa', q: 'Bacaan setiap lemparan jumrah:', o: ['Allāhu akbar', 'Labbaik', 'Subhānallāh'], a: 0, why: 'HR. Muslim (hadits Jabir).' },
    { kat: 'doa', q: 'Di antara Rukun Yamani dan Hajar Aswad dibaca...', o: [`Rabbanā ātinā fid dunyā hasanah…`, 'Talbiyah', 'Al-Ikhlas'], a: 0, why: 'QS. al-Baqarah 201; HR. Abu Dawud dan Ahmad (hasan).' },
    { kat: 'doa', q: 'Setelah matahari terbenam di Arafah, jamaah sebaiknya...', o: ['Tenang dan teratur menuju Muzdalifah sambil bertalbiyah dan berdzikir', 'Berlomba mengejar bus', 'Shalat Maghrib di jalan'], a: 0, why: 'Nabi saw.: "Wahai manusia, tenang, tenang!" (HR. al-Bukhari dan Muslim).' }
  ];

  /* ---------------- Langkah/pill progress (10 fase) ---------------- */
  const FASE = ['Miqat', 'Ihram', 'Thawaf', '8 Dz', '9 Dz', 'Muzdalifah', '10 Dz', 'Ifadhah', 'Tasyriq', `Wada'`];

  return { KAABA, MIQAT, ASAL, SEKITAR, PANTAI, TITIK, RUTE, MODE, ST, DOA, DOA_LIST, KAT_DOA, LVL_DOA, PERSIAPAN, LARANGAN, HARI, RUKUN_HAJI, WAJIB_HAJI, RUKUN_UMRAH, WAJIB_UMRAH, SUNNAH_HAJI, DAM, MUD_CAT, BADAL, RUJUKAN, RUJUKAN_CATATAN, KUIS, FASE };
})();
