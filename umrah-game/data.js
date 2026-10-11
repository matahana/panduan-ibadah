/* Data konten Perjalanan Umrah 3D — DRAF, belum ditinjau peninjau syariah.
   Susunan mengikuti mazhab Syafi'i (sejalan dengan bimbingan manasik Kemenag RI). */
window.DATA = (function () {
  const KAABA = { lat: 21.4225, lon: 39.8262 };

  /* Koordinat miqat bersifat PERKIRAAN (skematis); gunakan papan penanda resmi di lapangan. */
  const MIQAT = [
    { id: 'hulaifah', nama: 'Dzul Hulaifah', alias: "Bir 'Ali / Abyar 'Ali", lat: 24.4136, lon: 39.5448,
      untuk: 'Penduduk Madinah dan yang datang melalui Madinah', arah: 'Utara (Madinah)',
      cat: 'Miqat terjauh dari Makkah, sekitar 410 km garis lurus. Di sini ada Masjid Dzul Hulaifah (Masjid Bir \'Ali).' },
    { id: 'juhfah', nama: 'Al-Juhfah', alias: 'Dekat Rabigh', lat: 22.7156, lon: 39.1469,
      untuk: "Penduduk Syam, Mesir, dan Maghrib (Afrika Utara)", arah: 'Barat laut (pesisir Laut Merah)',
      cat: 'Kini jamaah biasanya berihram di Rabigh karena Al-Juhfah sudah tidak berpenghuni.' },
    { id: 'yalamlam', nama: 'Yalamlam', alias: "As-Sa'diyah", lat: 20.5167, lon: 39.8667,
      untuk: 'Penduduk Yaman serta yang datang dari arah selatan: India, Asia Tenggara termasuk Indonesia', arah: 'Selatan',
      cat: 'Jamaah Indonesia yang langsung ke Makkah umumnya berihram saat pesawat sejajar Yalamlam atau dari asrama embarkasi; ikuti arahan pembimbing.' },
    { id: 'qarn', nama: 'Qarnul Manazil', alias: 'As-Sail al-Kabir', lat: 21.6333, lon: 40.4167,
      untuk: 'Penduduk Najd, Thaif, dan Riyadh', arah: 'Timur (dataran tinggi Najd)',
      cat: 'Terletak di jalur menuju Thaif; Wadi Mahram dekat situ.' },
    { id: 'irq', nama: "Dzatu 'Irq", alias: "Adh-Dhariibah", lat: 21.9333, lon: 40.4333,
      untuk: 'Penduduk Irak dan Iran serta yang datang dari arah timur laut', arah: 'Timur laut',
      cat: "Ulama berbeda pendapat apakah ditetapkan langsung oleh Nabi saw. atau oleh ijtihad 'Umar; jamaah sepakat sah berihram dari sini." }
  ];

  const ASAL = [
    { id: 'madinah', label: 'Dari Madinah', sub: 'termasuk jamaah Indonesia yang ke Madinah dulu', miqat: 'hulaifah' },
    { id: 'syam', label: 'Dari Syam / Mesir / Maghrib', sub: 'jalur utara & barat laut', miqat: 'juhfah' },
    { id: 'selatan', label: 'Dari Yaman / India / Indonesia', sub: 'langsung ke Jeddah atau Makkah dari selatan', miqat: 'yalamlam' },
    { id: 'najd', label: 'Dari Najd / Riyadh / Thaif', sub: 'dataran tinggi timur', miqat: 'qarn' },
    { id: 'irak', label: 'Dari Irak / Iran', sub: 'jalur timur laut', miqat: 'irq' }
  ];

  const SEKITAR = [
    { nama: 'Makkah (Ka\'bah)', lat: 21.4225, lon: 39.8262, tipe: 'kota' },
    { nama: 'Jeddah (Bandara KAIA)', lat: 21.6796, lon: 39.1565, tipe: 'kota' },
    { nama: 'Madinah', lat: 24.4672, lon: 39.6111, tipe: 'kota' },
    { nama: 'Thaif', lat: 21.2703, lon: 40.4158, tipe: 'kota' }
  ];

  /* Garis pantai Laut Merah — skematis, bukan data survei */
  const PANTAI = [[25.0, 37.3], [24.6, 37.7], [24.09, 38.06], [23.5, 38.6], [22.8, 39.03], [22.2, 39.1], [21.5, 39.15], [20.9, 39.35], [20.15, 40.27], [19.6, 40.9]];

  const DOA = {
    niatUmrah: { ar: 'لَبَّيْكَ اللّٰهُمَّ عُمْرَةً', lat: "Labbaikallahumma 'umratan", arti: "Aku penuhi panggilan-Mu ya Allah untuk (mengerjakan) umrah." },
    niatId: { ar: 'نَوَيْتُ الْعُمْرَةَ وَأَحْرَمْتُ بِهَا لِلّٰهِ تَعَالَى', lat: "Nawaitul 'umrata wa ahramtu bihā lillāhi ta'ālā", arti: "Aku niat umrah dan berihram dengannya karena Allah Ta'ala (lafal yang lazim di Indonesia)." },
    talbiyah: { ar: 'لَبَّيْكَ اللّٰهُمَّ لَبَّيْكَ، لَبَّيْكَ لَا شَرِيكَ لَكَ لَبَّيْكَ، إِنَّ الْحَمْدَ وَالنِّعْمَةَ لَكَ وَالْمُلْكَ، لَا شَرِيكَ لَكَ',
      lat: "Labbaikallāhumma labbaik, labbaika lā syarīka laka labbaik, innal hamda wan ni'mata laka wal mulk, lā syarīka lak.",
      arti: 'Aku penuhi panggilan-Mu ya Allah, aku penuhi panggilan-Mu. Aku penuhi panggilan-Mu, tiada sekutu bagi-Mu, aku penuhi panggilan-Mu. Sesungguhnya segala puji, nikmat, dan kerajaan milik-Mu. Tiada sekutu bagi-Mu.',
      sumber: 'HR. al-Bukhari dan Muslim dari Ibnu \'Umar' },
    mahilli: { ar: 'اللّٰهُمَّ مَحِلِّي حَيْثُ حَبَسْتَنِي', lat: 'Allāhumma mahillī haitsu habastanī', arti: 'Ya Allah, tempat tahallulku adalah di mana Engkau menahanku. (Disyaratkan bila khawatir terhalang sakit.)', sumber: 'HR. al-Bukhari dan Muslim, kisah Dhuba\'ah bintu az-Zubair' },
    masukHaram: { ar: 'بِسْمِ اللّٰهِ وَالصَّلَاةُ وَالسَّلَامُ عَلَى رَسُولِ اللّٰهِ، اللّٰهُمَّ اغْفِرْ لِي ذُنُوبِي وَافْتَحْ لِي أَبْوَابَ رَحْمَتِكَ',
      lat: "Bismillāh, wash shalātu was salāmu 'alā rasūlillāh. Allāhummaghfir lī dzunūbī waftah lī abwāba rahmatik.",
      arti: 'Dengan nama Allah, shalawat dan salam atas Rasulullah. Ya Allah, ampunilah dosaku dan bukakan untukku pintu-pintu rahmat-Mu.',
      sumber: 'Diriwayatkan at-Tirmidzi dan Ibnu Majah; derajat sanadnya diperselisihkan ulama' },
    istilam: { ar: 'بِسْمِ اللّٰهِ وَاللّٰهُ أَكْبَرُ', lat: 'Bismillāhi wallāhu akbar', arti: 'Dengan nama Allah, Allah Maha Besar. (Diucapkan saat istilam, menghadap atau mengusap/mengisyaratkan ke Hajar Aswad.)', sumber: 'Atsar Ibnu \'Umar; HR. al-Bukhari (istilam dan takbir)' },
    niatThawaf: { ar: 'نَوَيْتُ أَنْ أَطُوفَ بِالْبَيْتِ سَبْعَةَ أَشْوَاطٍ لِلّٰهِ تَعَالَى', lat: "Nawaitu an athūfa bil baiti sab'ata asywāthin lillāhi ta'ālā", arti: 'Aku niat thawaf mengelilingi Baitullah tujuh putaran karena Allah Ta\'ala.' },
    rabbana: { ar: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ', lat: "Rabbanā ātinā fid dunyā hasanah wa fil ākhirati hasanah wa qinā 'adzāban nār", arti: 'Ya Tuhan kami, berilah kami kebaikan di dunia dan kebaikan di akhirat, dan lindungilah kami dari azab neraka.', sumber: 'QS. al-Baqarah 201; dibaca di antara Rukun Yamani dan Hajar Aswad (HR. Abu Dawud, Ahmad)' },
    maqam: { ar: 'وَاتَّخِذُوا مِنْ مَقَامِ إِبْرَاهِيمَ مُصَلًّى', lat: 'Wattakhidzū min maqāmi ibrāhīma mushallā', arti: 'Jadikanlah sebagian Maqam Ibrahim sebagai tempat shalat.', sumber: 'QS. al-Baqarah 125; HR. Muslim (hadits Jabir)' },
    zamzam: { ar: 'اللّٰهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا وَرِزْقًا وَاسِعًا وَشِفَاءً مِنْ كُلِّ دَاءٍ', lat: "Allāhumma innī as-aluka 'ilman nāfi'an wa rizqan wāsi'an wa syifā-an min kulli dā'", arti: 'Ya Allah, aku memohon kepada-Mu ilmu yang bermanfaat, rezeki yang luas, dan kesembuhan dari segala penyakit.', sumber: 'Doa yang masyhur; sanad riwayatnya diperselisihkan. Minum Zamzam: HR. Muslim (Abu Dzar: "ia berkah, makanan yang mengenyangkan")' },
    safa: { ar: 'إِنَّ الصَّفَا وَالْمَرْوَةَ مِنْ شَعَائِرِ اللّٰهِ، أَبْدَأُ بِمَا بَدَأَ اللّٰهُ بِهِ', lat: "Innash shafā wal marwata min sya'ā-irillāh. Abda-u bimā bada-allāhu bih", arti: 'Sesungguhnya Shafa dan Marwah adalah sebagian syiar Allah. Aku mulai dengan apa yang Allah mulai.', sumber: 'QS. al-Baqarah 158; HR. Muslim (hadits Jabir)' },
    dzikirSafa: { ar: 'لَا إِلٰهَ إِلَّا اللّٰهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، لَا إِلٰهَ إِلَّا اللّٰهُ وَحْدَهُ، أَنْجَزَ وَعْدَهُ وَنَصَرَ عَبْدَهُ وَهَزَمَ الْأَحْزَابَ وَحْدَهُ', lat: "Lā ilāha illallāhu wahdahū lā syarīka lah, lahul mulku wa lahul hamdu wa huwa 'alā kulli syai-in qadīr. Lā ilāha illallāhu wahdah, anjaza wa'dah, wa nashara 'abdah, wa hazamal ahzāba wahdah.", arti: 'Tiada Tuhan selain Allah semata, tiada sekutu bagi-Nya. Milik-Nya kerajaan dan pujian, dan Dia Mahakuasa atas segala sesuatu. Dia menepati janji-Nya, menolong hamba-Nya, dan mengalahkan golongan-golongan musuh sendirian.', sumber: 'HR. Muslim (hadits Jabir); dibaca tiga kali dengan doa di antaranya' },
    rabbighfir: { ar: 'رَبِّ اغْفِرْ وَارْحَمْ إِنَّكَ أَنْتَ الْأَعَزُّ الْأَكْرَمُ', lat: "Rabbighfir warham, innaka antal a'azzul akram", arti: 'Ya Tuhanku, ampunilah dan rahmatilah, sesungguhnya Engkau Mahaperkasa dan Mahamulia.', sumber: 'Atsar dari sebagian sahabat (Ibnu \'Umar, Ibnu Mas\'ud); dibaca di zona hijau' },
    tahalul: { ar: 'الْحَمْدُ لِلّٰهِ الَّذِي قَضَى عَنَّا نُسُكَنَا', lat: "Alhamdulillāhilladzī qadhā 'annā nusukanā", arti: 'Segala puji bagi Allah yang telah menyempurnakan ibadah kami.', sumber: 'Ucapan syukur umum; bukan lafal wajib' }
  };

  /* Checklist persiapan ihram. ok:true = dilakukan sebelum niat; ok:false = jebakan. */
  const PERSIAPAN = [
    { t: 'Mandi sunnah (ghusl) untuk ihram', ok: true, why: 'Sunnah mandi sebelum ihram (HR. at-Tirmidzi dari Zaid bin Tsabit, dihasankan).' },
    { t: 'Memotong kuku, merapikan kumis, mencabut bulu ketiak dan kemaluan', ok: true, why: 'Dikerjakan SEBELUM niat, sebab setelah berihram memotong kuku dan mencabut rambut termasuk larangan.' },
    { t: 'Memakai wangi-wangian pada badan sebelum niat', ok: true, why: "Sunnah pada badan sebelum ihram (HR. al-Bukhari dan Muslim dari 'Aisyah). Hindari mengoleskannya pada kain ihram." },
    { t: 'Berwudhu dan mengenakan pakaian ihram', ok: true, dyn: 'pakaian', why: 'Pria: dua lembar kain putih tak berjahit (izar dan rida). Wanita: pakaian biasa yang menutup aurat; wajah dan telapak tangan terbuka.' },
    { t: 'Shalat sunnah ihram dua rakaat (bila tidak di waktu terlarang)', ok: true, why: 'Disunnahkan shalat dua rakaat sebelum niat ihram, lalu berniat.' },
    { t: 'Mencukur habis rambut kepala sebelum niat agar nanti langsung selesai', ok: false, why: 'Keliru: tahalul di akhir umrah dilakukan dengan halq/taqshir. Rambut perlu ada pada saat itu.' },
    { t: 'Menyemprotkan parfum tebal ke kain ihram agar tahan lama', ok: false, why: 'Sebaiknya dihindari: wangi yang menempel dan terus dipakai setelah niat dapat menjadi pelanggaran larangan ihram.' },
    { t: 'Memakai sepatu tertutup dan kaus kaki (pria)', ok: false, dynGender: 'pria', why: 'Pria tidak boleh memakai sepatu/kaus kaki yang menutup mata kaki; pakai sandal.' },
    { t: 'Memakai cadar/niqab dan sarung tangan (wanita)', ok: false, dynGender: 'wanita', why: 'Wanita yang berihram tidak mengenakan cadar dan sarung tangan; wajah dan telapak tangan dibiarkan terbuka.' },
    { t: 'Melewati miqat dulu, baru berniat nanti di Jeddah', ok: false, why: 'Melewati miqat tanpa berihram (bagi yang berniat umrah) mewajibkan kembali ke miqat atau membayar dam.' }
  ];

  const LARANGAN = [
    { q: 'Memotong kuku setelah niat ihram', ok: false, why: 'Dilarang. Pelanggaran menimbulkan fidyah (dam) menurut tingkatannya.' },
    { q: 'Mandi dan membersihkan badan dengan sabun tak berwangi', ok: true, why: 'Boleh. Yang dilarang adalah wewangian, bukan kebersihan.' },
    { q: 'Pria menutup kepala dengan topi atau peci', ok: false, why: 'Dilarang bagi pria (ihram). Payung dan atap kendaraan tidak termasuk menutup kepala.' },
    { q: 'Memakai payung untuk berteduh dari terik', ok: true, why: 'Boleh. Nabi saw. pernah dinaungi dengan kain saat melempar jumrah (HR. Muslim).' },
    { q: 'Memakai jam tangan, kacamata, atau cincin', ok: true, why: 'Boleh; ini bukan pakaian berjahit yang dilarang.' },
    { q: 'Memakai sabuk/ikat pinggang atau tas pinggang untuk menahan kain (pria)', ok: true, why: 'Boleh menurut jumhur ulama untuk menjaga kain dan menyimpan barang.' },
    { q: 'Memakai parfum pada badan setelah niat', ok: false, why: 'Dilarang bagi pria dan wanita yang berihram.' },
    { q: 'Memakai sabun, sampo, atau deodoran yang beraroma', ok: false, why: 'Gunakan produk tanpa pewangi (unscented) selama ihram.' },
    { q: 'Mencabut atau memotong tanaman rumput di tanah Haram', ok: false, why: 'Dilarang memotong tanaman hijau di tanah Haram (HR. al-Bukhari dan Muslim).' },
    { q: 'Berburu atau mengganggu hewan buruan darat', ok: false, why: 'Dilarang (QS. al-Maidah 95).' },
    { q: 'Akad nikah atau melamar', ok: false, why: 'Dilarang selama ihram (HR. Muslim dari \'Utsman).' },
    { q: 'Bercakap-cakap yang baik, berzikir, dan membaca Al-Qur\'an', ok: true, why: 'Dianjurkan. Yang dilarang adalah rafats, fusuq, dan jidal (QS. al-Baqarah 197).' },
    { q: 'Minum air Zamzam dan makan makanan halal', ok: true, why: 'Boleh.' },
    { q: 'Wanita memakai cadar yang menempel pada wajah', ok: false, why: 'Dilarang menurut hadits: "Wanita yang berihram tidak mengenakan cadar dan sarung tangan" (HR. al-Bukhari). Menutup wajah dari pria asing dengan kain yang tidak menempel boleh.' },
    { q: 'Pria memakai sandal yang terbuka bagian mata kakinya', ok: true, why: 'Boleh, bahkan itulah yang dianjurkan.' }
  ];

  const KUIS = {
    thawaf: [
      { q: 'Ke arah mana thawaf dilakukan?', o: ["Berlawanan arah jarum jam, Ka'bah di sebelah kiri", "Searah jarum jam, Ka'bah di sebelah kanan", 'Bebas, boleh ke mana saja'], a: 0, why: "Ka'bah berada di sebelah kiri jamaah." },
      { q: 'Dari mana thawaf dimulai dan diakhiri?', o: ['Hijr Ismail', 'Hajar Aswad', 'Maqam Ibrahim'], a: 1, why: 'Dimulai dan berakhir sejajar Hajar Aswad; tujuh putaran.' },
      { q: "Bagian bangunan mana yang tidak boleh dipotong jalurnya saat thawaf?", o: ['Hijr Ismail (thawaf harus di luar Hijr)', "Zamzam", 'Pintu Ka\'bah'], a: 0, why: "Hijr Ismail termasuk bagian Baitullah; thawaf harus mengelilinginya dari luar." },
      { q: 'Apa idhtiba\' dan ramal (khusus pria)?', o: ['Membuka bahu kanan; ramal: langkah cepat dan pendek pada 3 putaran pertama', 'Menutup kepala; berlari penuh tujuh putaran', 'Membuka kedua bahu; berjalan mundur'], a: 0, why: 'Keduanya sunnah khusus pria pada thawaf qudum/umrah.' }
    ],
    sai: [
      { q: "Berapa kali lintasan sa'i, dan di mana berakhir?", o: ['7 lintasan, berakhir di Marwah', '7 lintasan, berakhir di Shafa', '3 lintasan, berakhir di Marwah'], a: 0, why: 'Shafa ke Marwah dihitung 1, Marwah ke Shafa 2, dan seterusnya; lintasan ke-7 berakhir di Marwah.' },
      { q: 'Apa yang dilakukan pria di antara dua lampu hijau?', o: ['Berlari kecil (sa\'i)', 'Berhenti dan berdoa', 'Jalan mundur'], a: 0, why: 'Wanita tetap berjalan biasa.' },
      { q: "Sa'i dilakukan setelah apa?", o: ['Thawaf yang sah', 'Tahalul', 'Wukuf di Arafah'], a: 0, why: "Sa'i umrah dikerjakan setelah thawaf." }
    ],
    tahalul: [
      { q: 'Bagaimana tahalul umrah dilakukan?', o: ['Halq (mencukur) atau taqshir (memotong sedikit rambut)', 'Mandi dan berganti baju saja', 'Thawaf tambahan'], a: 0, why: 'Minimal memotong tiga helai rambut menurut mazhab Syafi\'i.' },
      { q: 'Bagi wanita, tahalul cukup dengan:', o: ['Memotong rambut sepanjang ujung jari (± satu ruas)', 'Mencukur gundul', 'Tidak perlu apa pun'], a: 0, why: 'Wanita tidak mencukur gundul.' },
      { q: 'Setelah tahalul, larangan ihram...', o: ['Gugur seluruhnya (bagi umrah)', 'Tetap berlaku sampai pulang', 'Berlaku sebagian'], a: 0, why: 'Pada umrah, tahalul membebaskan semua larangan ihram.' }
    ]
  };

  const LANGKAH = [
    { id: 'map', nama: 'Miqat' }, { id: 'miqat', nama: 'Ihram' }, { id: 'niat', nama: 'Niat' },
    { id: 'haram', nama: 'Haram' }, { id: 'thawaf', nama: 'Thawaf' }, { id: 'sai', nama: "Sa'i" }, { id: 'tahalul', nama: 'Tahalul' }
  ];

  /* Pustaka doa per momen. g: sahih | hasan | atsar | masyhur (urut dari paling kuat).
     Penomoran hadits dapat berbeda antar cetakan; periksa kembali pada kitab asalnya. */
  const GRADE = {
    sahih: { t: 'Sahih', d: "Al-Qur'an atau hadits sahih" },
    hasan: { t: 'Hasan', d: 'Hadits hasan / diterima sebagian besar ulama' },
    atsar: { t: 'Atsar sahabat', d: 'Dari sahabat, bukan sabda Nabi saw.' },
    masyhur: { t: 'Masyhur · sanad lemah', d: 'Banyak dikutip, tetapi sanadnya lemah (dha\'if/mursal) menurut banyak ulama hadits' }
  };
  const PUSTAKA = [
    { id: 'safar', judul: 'Perjalanan ke Makkah', cat: 'Dibaca ketika naik kendaraan (pesawat, bus, mobil) menuju Makkah.', items: [
      { id: 'safar1', t: 'Doa naik kendaraan', g: 'sahih', ar: 'اللّٰهُ أَكْبَرُ، اللّٰهُ أَكْبَرُ، اللّٰهُ أَكْبَرُ، سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ، وَإِنَّا إِلَىٰ رَبِّنَا لَمُنْقَلِبُونَ', lat: "Allāhu akbar (3x). Subhānalladzī sakhkhara lanā hādzā wa mā kunnā lahū muqrinīn, wa innā ilā rabbinā lamunqalibūn.", arti: 'Allah Mahabesar (3x). Mahasuci Allah yang menundukkan kendaraan ini bagi kami padahal kami tidak mampu menguasainya, dan sesungguhnya kepada Tuhan kami kami akan kembali.', sumber: "HR. Muslim 1342 (Ibnu 'Umar); ayatnya QS. az-Zukhruf 13–14" }
    ] },
    { id: 'ihram', judul: 'Niat dan talbiyah', cat: 'Niat di miqat, lalu perbanyak talbiyah sampai mulai thawaf. Pria mengeraskan suara, wanita melirihkan.', items: [
      { id: 'talbiyah', t: 'Talbiyah', g: 'sahih', ar: DOA.talbiyah.ar, lat: DOA.talbiyah.lat, arti: 'Aku penuhi panggilan-Mu ya Allah, aku penuhi panggilan-Mu. Aku penuhi panggilan-Mu, tiada sekutu bagi-Mu, aku penuhi panggilan-Mu. Sesungguhnya segala puji, nikmat, dan kerajaan milik-Mu. Tiada sekutu bagi-Mu.', sumber: "HR. al-Bukhari 1549 dan Muslim 1184 (Ibnu 'Umar)" },
      { id: 'niat', t: 'Niat umrah (lafal talbiyah niat)', g: 'sahih', ar: 'لَبَّيْكَ اللّٰهُمَّ عُمْرَةً', lat: "Labbaikallāhumma 'umratan", arti: "Aku penuhi panggilan-Mu ya Allah untuk umrah.", sumber: "Semakna dengan HR. Muslim 1251 (Anas bin Malik: Nabi saw. menyebut 'labbaika bi'umratin wa hajjatin' pada haji qiran)" },
      { id: 'isytirath', t: 'Syarat bila terhalang (opsional)', g: 'sahih', ar: 'اللّٰهُمَّ مَحِلِّي حَيْثُ حَبَسْتَنِي', lat: 'Allāhumma mahillī haitsu habastanī', arti: 'Ya Allah, tempat tahallulku adalah di mana Engkau menahanku.', sumber: "HR. al-Bukhari 5089 dan Muslim 1207 (kisah Dhuba'ah bintu az-Zubair)" },
      { id: 'ibnumar', t: "Tambahan talbiyah Ibnu 'Umar", g: 'atsar', ar: 'لَبَّيْكَ لَبَّيْكَ وَسَعْدَيْكَ، وَالْخَيْرُ بِيَدَيْكَ، وَالرَّغْبَاءُ إِلَيْكَ وَالْعَمَلُ', lat: "Labbaika labbaika wa sa'daik, wal khairu biyadaik, war raghbā-u ilaika wal 'amal", arti: 'Aku penuhi panggilan-Mu, aku penuhi panggilan-Mu, kebahagiaan di sisi-Mu; segala kebaikan di tangan-Mu; harapan dan amal hanya kepada-Mu.', sumber: "Perbuatan Ibnu 'Umar, diriwayatkan Muslim 1184 (tambahan setelah talbiyah Nabi saw.)" }
    ] },
    { id: 'masuk', judul: 'Masuk Masjidil Haram', cat: 'Masuk dengan kaki kanan. Doa masuk masjid berlaku umum untuk semua masjid.', items: [
      { id: 'masuk1', t: 'Doa masuk masjid', g: 'sahih', ar: 'اللّٰهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ', lat: 'Allāhummaftah lī abwāba rahmatik', arti: 'Ya Allah, bukakan untukku pintu-pintu rahmat-Mu.', sumber: "HR. Muslim 713 (Abu Humaid/Abu Usaid)" },
      { id: 'masuk2', t: "Perlindungan dari setan (a'udzu)", g: 'hasan', ar: 'أَعُوذُ بِاللّٰهِ الْعَظِيمِ وَبِوَجْهِهِ الْكَرِيمِ وَسُلْطَانِهِ الْقَدِيمِ مِنَ الشَّيْطَانِ الرَّجِيمِ', lat: "A'ūdzu billāhil 'azhīm, wa biwajhihil karīm, wa sulthānihil qadīm, minasy syaithānir rajīm", arti: 'Aku berlindung kepada Allah Yang Mahaagung, dengan wajah-Nya yang mulia dan kekuasaan-Nya yang kekal, dari setan yang terkutuk.', sumber: "HR. Abu Dawud 466 ('Abdullah bin 'Amr); dihasankan an-Nawawi, disahihkan al-Albani" },
      { id: 'masuk3', t: 'Shalawat dan salam saat masuk', g: 'hasan', ar: 'بِسْمِ اللّٰهِ وَالصَّلَاةُ وَالسَّلَامُ عَلَىٰ رَسُولِ اللّٰهِ، اللّٰهُمَّ اغْفِرْ لِي ذُنُوبِي وَافْتَحْ لِي أَبْوَابَ رَحْمَتِكَ', lat: "Bismillāh, wash shalātu was salāmu 'alā rasūlillāh. Allāhummaghfir lī dzunūbī waftah lī abwāba rahmatik", arti: 'Dengan nama Allah, shalawat dan salam atas Rasulullah. Ya Allah, ampunilah dosaku dan bukakan untukku pintu-pintu rahmat-Mu.', sumber: "HR. Ibnu Majah 771 dan at-Tirmidzi (Fathimah ra.); derajat diperselisihkan, dihasankan karena penguat" }
    ] },
    { id: 'kabah', judul: "Pertama melihat Ka'bah", cat: "Menghadaplah ke Ka'bah. Tidak ada doa khusus yang sahih dari Nabi saw. ketika pertama melihat Ka'bah (demikian penjelasan sebagian ulama, mis. Ibnu 'Utsaimin); boleh berdoa dengan doa apa saja yang baik. Berikut yang paling kuat sampai yang masyhur.", items: [
      { id: 'kabah1', t: 'Doa Ibrahim dan Isma\'il saat membangun Ka\'bah', g: 'sahih', ar: 'رَبَّنَا تَقَبَّلْ مِنَّا إِنَّكَ أَنْتَ السَّمِيعُ الْعَلِيمُ', lat: "Rabbanā taqabbal minnā, innaka antas samī'ul 'alīm", arti: 'Ya Tuhan kami, terimalah dari kami (amal kami); sesungguhnya Engkaulah Yang Maha Mendengar lagi Maha Mengetahui.', sumber: "QS. al-Baqarah 127", qur: [[2, 127]] },
      { id: 'kabah2', t: 'Doa umum: pujian dan permohonan bebas', g: 'sahih', ar: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ', lat: "Rabbanā ātinā fid dunyā hasanah wa fil ākhirati hasanah wa qinā 'adzāban nār", arti: 'Ya Tuhan kami, berilah kami kebaikan di dunia dan kebaikan di akhirat, dan lindungilah kami dari azab neraka.', sumber: "QS. al-Baqarah 201; doa yang paling sering dibaca Nabi saw. (HR. al-Bukhari 4522 dan Muslim 2690, Anas)", qur: [[2, 201]] },
      { id: 'kabah3', t: "Salam kepada Ka'bah (atsar 'Umar)", g: 'atsar', ar: 'اللّٰهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ فَحَيِّنَا رَبَّنَا بِالسَّلَامِ', lat: "Allāhumma antas salām, wa minkas salām, fahayyinā rabbanā bis salām", arti: 'Ya Allah, Engkau Mahasejahtera, dari-Mu kesejahteraan; maka hidupkanlah kami, ya Tuhan kami, dengan kesejahteraan.', sumber: "Diucapkan 'Umar bin al-Khaththab ra. (al-Baihaqi); sanadnya dinilai sahih oleh sebagian ulama (mis. al-Albani), tetapi bukan sabda Nabi saw." },
      { id: 'kabah4', t: "Menambah kemuliaan Baitullah", g: 'masyhur', ar: 'اللّٰهُمَّ زِدْ هَذَا الْبَيْتَ تَشْرِيفًا وَتَعْظِيمًا وَتَكْرِيمًا وَمَهَابَةً، وَزِدْ مَنْ شَرَّفَهُ وَكَرَّمَهُ مِمَّنْ حَجَّهُ أَوِ اعْتَمَرَهُ تَشْرِيفًا وَتَكْرِيمًا وَتَعْظِيمًا وَبِرًّا', lat: "Allāhumma zid hādzal baita tasyrīfan wa ta'zhīman wa takrīman wa mahābah, wa zid man syarrafahū wa karramahū mimman hajjahū awi'tamarahū tasyrīfan wa takrīman wa ta'zhīman wa birrā", arti: 'Ya Allah, tambahkanlah kemuliaan, keagungan, penghormatan, dan kewibawaan Rumah ini, dan tambahkan pula bagi orang yang memuliakannya dari mereka yang berhaji atau berumrah: kemuliaan, penghormatan, keagungan, dan kebaikan.', sumber: "Al-Baihaqi dari Sa'id bin al-Musayyib (mursal) dan Ibnu Juraij; dilemahkan banyak ulama hadits; dikutip asy-Syafi'i dan an-Nawawi sebagai doa, bukan sebagai sunnah yang pasti" }
    ] },
    { id: 'thawaf', judul: 'Thawaf', cat: "Ka'bah di sebelah kiri. Berhenti membaca talbiyah ketika mulai thawaf. Selebihnya berdzikir, berdoa, atau membaca Al-Qur'an dengan bebas; tidak ada bacaan khusus yang sahih untuk setiap putaran (bacaan per putaran dalam buku-buku manasik populer tidak berdasar hadits sahih).", items: [
      { id: 'th1', t: 'Takbir ketika sejajar Hajar Aswad', g: 'sahih', ar: 'اللّٰهُ أَكْبَرُ', lat: 'Allāhu akbar', arti: 'Allah Mahabesar. (Sambil mengisyaratkan tangan ke Hajar Aswad bila tidak bisa menyentuh.)', sumber: "HR. al-Bukhari 1613 (Ibnu 'Abbas)" },
      { id: 'th2', t: 'Antara Rukun Yamani dan Hajar Aswad', g: 'hasan', ar: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ', lat: "Rabbanā ātinā fid dunyā hasanah wa fil ākhirati hasanah wa qinā 'adzāban nār", arti: 'Ya Tuhan kami, berilah kami kebaikan di dunia dan kebaikan di akhirat, dan lindungilah kami dari azab neraka.', sumber: "QS. al-Baqarah 201; dibaca di antara dua rukun: HR. Abu Dawud 1892 dan Ahmad ('Abdullah bin as-Sa'ib), dihasankan", qur: [[2, 201]] },
      { id: 'th3', t: 'Istilam dengan basmalah', g: 'atsar', ar: 'بِسْمِ اللّٰهِ وَاللّٰهُ أَكْبَرُ', lat: 'Bismillāhi wallāhu akbar', arti: 'Dengan nama Allah, Allah Mahabesar.', sumber: "Atsar Ibnu 'Umar (al-Baihaqi); sanadnya dinilai sahih oleh sebagian ulama" }
    ] },
    { id: 'maqam', judul: 'Maqam Ibrahim dan shalat thawaf', cat: "Shalat dua rakaat setelah thawaf, sebaiknya di belakang Maqam bila tidak mengganggu. Tidak ada doa khusus yang sahih di Multazam; berdoalah bebas (riwayat doa tertentu di Multazam lemah).", items: [
      { id: 'mq1', t: 'Ayat Maqam Ibrahim', g: 'sahih', ar: 'وَاتَّخِذُوا مِنْ مَقَامِ إِبْرَاهِيمَ مُصَلًّى', lat: "Wattakhidzū min maqāmi ibrāhīma mushallā", arti: 'Jadikanlah sebagian Maqam Ibrahim itu tempat shalat.', sumber: "QS. al-Baqarah 125; dibaca Nabi saw. mendekati Maqam (HR. Muslim 1218, Jabir)", qur: [[2, 125]] },
      { id: 'mq2', t: 'Rakaat pertama: al-Kafirun', g: 'sahih', ar: 'قُلْ يَا أَيُّهَا الْكَافِرُونَ، لَا أَعْبُدُ مَا تَعْبُدُونَ، وَلَا أَنْتُمْ عَابِدُونَ مَا أَعْبُدُ، وَلَا أَنَا عَابِدٌ مَا عَبَدْتُمْ، وَلَا أَنْتُمْ عَابِدُونَ مَا أَعْبُدُ، لَكُمْ دِينُكُمْ وَلِيَ دِينِ', lat: "Qul yā ayyuhal kāfirūn, lā a'budu mā ta'budūn, wa lā antum 'ābidūna mā a'bud, wa lā ana 'ābidun mā 'abattum, wa lā antum 'ābidūna mā a'bud, lakum dīnukum wa liya dīn", arti: 'Katakanlah: wahai orang-orang kafir, aku tidak menyembah apa yang kamu sembah... untukmu agamamu dan untukku agamaku.', sumber: "QS. al-Kafirun; HR. Muslim 1218", qur: [[109, 1], [109, 2], [109, 3], [109, 4], [109, 5], [109, 6]] },
      { id: 'mq3', t: 'Rakaat kedua: al-Ikhlas', g: 'sahih', ar: 'قُلْ هُوَ اللّٰهُ أَحَدٌ، اللّٰهُ الصَّمَدُ، لَمْ يَلِدْ وَلَمْ يُولَدْ، وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ', lat: "Qul huwallāhu ahad, allāhush shamad, lam yalid wa lam yūlad, wa lam yakul lahū kufuwan ahad", arti: 'Katakanlah: Dialah Allah Yang Maha Esa. Allah tempat bergantung segala sesuatu. Dia tidak beranak dan tidak diperanakkan, dan tidak ada sesuatu pun yang setara dengan-Nya.', sumber: "QS. al-Ikhlas; HR. Muslim 1218", qur: [[112, 1], [112, 2], [112, 3], [112, 4]] }
    ] },
    { id: 'zamzam', judul: 'Minum air Zamzam', cat: "Adab: menyebut nama Allah (bismillah), minum sampai puas, bernapas di luar gelas (tiga kali), lalu memuji Allah. Nabi saw. pernah meminumnya sambil berdiri (HR. al-Bukhari 1637, Muslim 2027). Menghadap kiblat diriwayatkan dalam atsar Ibnu 'Abbas dan diamalkan banyak ulama sebagai adab berdoa; sanadnya diperselisihkan.", items: [
      { id: 'zz1', t: 'Zamzam adalah air yang diberkahi dan mengenyangkan', g: 'sahih', ar: 'إِنَّهَا مُبَارَكَةٌ، إِنَّهَا طَعَامُ طُعْمٍ', lat: "Innahā mubārakah, innahā tha'āmu thu'm", arti: 'Sesungguhnya ia (air Zamzam) diberkahi, ia adalah makanan yang mengenyangkan.', sumber: "HR. Muslim 2473 (Abu Dzar)" },
      { id: 'zz2', t: 'Zamzam sesuai niat peminumnya', g: 'hasan', ar: 'مَاءُ زَمْزَمَ لِمَا شُرِبَ لَهُ', lat: "Mā-u zamzama limā syuriba lah", arti: 'Air Zamzam itu sesuai dengan tujuan orang yang meminumnya.', sumber: "HR. Ibnu Majah 3062 dan Ahmad (Jabir); dihasankan banyak ulama, sebagian melemahkannya. Maknanya: berniat dan berdoa dengan baik ketika meminumnya" },
      { id: 'zz3', t: 'Doa ketika minum Zamzam (Ibnu \'Abbas)', g: 'masyhur', ar: 'اللّٰهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا وَرِزْقًا وَاسِعًا وَشِفَاءً مِنْ كُلِّ دَاءٍ', lat: "Allāhumma innī as-aluka 'ilman nāfi'an wa rizqan wāsi'an wa syifā-an min kulli dā'", arti: 'Ya Allah, aku memohon kepada-Mu ilmu yang bermanfaat, rezeki yang luas, dan kesembuhan dari segala penyakit.', sumber: "Ad-Daruquthni dan al-Hakim dari Ibnu 'Abbas; sanadnya dilemahkan banyak ulama. Boleh dibaca sebagai doa biasa tanpa meyakininya sebagai sunnah khusus" }
    ] },
    { id: 'sai', judul: "Sa'i: Shafa dan Marwah", cat: "Di Shafa dan Marwah menghadap Ka'bah, mengangkat tangan, berdzikir dan berdoa. Hadits Jabir (HR. Muslim 1218) mencatat bacaan di Shafa; di Marwah dilakukan sama seperti di Shafa.", items: [
      { id: 'sa1', t: 'Ayat Shafa dan Marwah', g: 'sahih', ar: 'إِنَّ الصَّفَا وَالْمَرْوَةَ مِنْ شَعَائِرِ اللّٰهِ، أَبْدَأُ بِمَا بَدَأَ اللّٰهُ بِهِ', lat: "Innash shafā wal marwata min sya'ā-irillāh. Abda-u bimā bada-allāhu bih", arti: 'Sesungguhnya Shafa dan Marwah termasuk syiar Allah. Aku mulai dengan apa yang Allah mulai.', sumber: "QS. al-Baqarah 158; HR. Muslim 1218 (Jabir) — dibaca sekali ketika mendekati Shafa", qur: [[2, 158]] },
      { id: 'sa2', t: 'Tahlil di Shafa/Marwah (3 kali dengan doa di antaranya)', g: 'sahih', ar: 'اللّٰهُ أَكْبَرُ، اللّٰهُ أَكْبَرُ، اللّٰهُ أَكْبَرُ. لَا إِلٰهَ إِلَّا اللّٰهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ، لَا إِلٰهَ إِلَّا اللّٰهُ وَحْدَهُ، أَنْجَزَ وَعْدَهُ، وَنَصَرَ عَبْدَهُ، وَهَزَمَ الْأَحْزَابَ وَحْدَهُ', lat: "Allāhu akbar (3x). Lā ilāha illallāhu wahdahū lā syarīka lah, lahul mulku wa lahul hamdu wa huwa 'alā kulli syai-in qadīr. Lā ilāha illallāhu wahdah, anjaza wa'dah, wa nashara 'abdah, wa hazamal ahzāba wahdah", arti: 'Allah Mahabesar (3x). Tiada Tuhan selain Allah semata, tiada sekutu bagi-Nya; milik-Nya kerajaan dan pujian, dan Dia Mahakuasa atas segala sesuatu. Dia menepati janji-Nya, menolong hamba-Nya, dan mengalahkan golongan-golongan musuh sendirian.', sumber: "HR. Muslim 1218 (Jabir); dibaca tiga kali, berdoa di antaranya" }
    ] },
    { id: 'hijau', judul: "Berlari kecil di lampu hijau", cat: "Di antara dua tanda lampu hijau, pria berlari kecil (sa'i); wanita berjalan biasa namun boleh membaca doa yang sama. Tidak ada doa khusus dari Nabi saw. yang sahih untuk zona hijau (tidak ada dalam hadits Jabir); yang ada hanyalah atsar sahabat dan dzikir umum, sehingga bagian ini tidak boleh diyakini sebagai sunnah khusus.", items: [
      { id: 'hj1', t: 'Dzikir umum yang paling dicintai Allah (boleh kapan saja)', g: 'sahih', ar: 'سُبْحَانَ اللّٰهِ وَالْحَمْدُ لِلّٰهِ وَلَا إِلٰهَ إِلَّا اللّٰهُ وَاللّٰهُ أَكْبَرُ', lat: "Subhānallāh, walhamdulillāh, wa lā ilāha illallāh, wallāhu akbar", arti: 'Mahasuci Allah, segala puji bagi Allah, tiada Tuhan selain Allah, Allah Mahabesar.', sumber: "HR. Muslim 2137 (Samurah bin Jundub): kalimat yang paling dicintai Allah. Dzikir umum, bukan khusus zona hijau" },
      { id: 'hj2', t: 'Doa maghfirah di zona hijau (atsar)', g: 'atsar', ar: 'رَبِّ اغْفِرْ وَارْحَمْ إِنَّكَ أَنْتَ الْأَعَزُّ الْأَكْرَمُ', lat: "Rabbighfir warham, innaka antal a'azzul akram", arti: 'Ya Tuhanku, ampunilah dan rahmatilah, sesungguhnya Engkau Mahaperkasa lagi Mahamulia.', sumber: "Diucapkan Ibnu Mas'ud dan Ibnu 'Umar ra. saat melewati lembah/zona hijau (riwayat Ibnu Abi Syaibah dan al-Baihaqi); sebagian ulama menilai sanadnya sahih sampai sahabat, bukan sabda Nabi saw." },
      { id: 'hj3', t: 'Versi lebih panjang yang masyhur', g: 'masyhur', ar: 'رَبِّ اغْفِرْ وَارْحَمْ وَاعْفُ وَتَكَرَّمْ وَتَجَاوَزْ عَمَّا تَعْلَمُ، إِنَّكَ تَعْلَمُ مَا لَا نَعْلَمُ، إِنَّكَ أَنْتَ اللّٰهُ الْأَعَزُّ الْأَكْرَمُ', lat: "Rabbighfir warham wa'fu wa takarram wa tajāwaz 'ammā ta'lam, innaka ta'lamu mā lā na'lam, innaka antallāhul a'azzul akram", arti: 'Ya Tuhanku, ampuni, rahmati, maafkan, dan muliakanlah, lewatkanlah apa yang Engkau ketahui; sesungguhnya Engkau mengetahui apa yang tidak kami ketahui; Engkaulah Allah Yang Mahaperkasa lagi Mahamulia.', sumber: "Tambahan yang banyak dikutip dalam buku manasik; riwayat marfu\'-nya tidak sahih, hanya dikenal sebagai bacaan masyhur" }
    ] },
    { id: 'tahalul', judul: 'Tahalul', cat: 'Tahalul menutup umrah; tidak ada bacaan wajib. Boleh mengucap syukur dan berdoa.', items: [
      { id: 'tl1', t: 'Doa Nabi saw. bagi yang bertahalul', g: 'sahih', ar: 'اللّٰهُمَّ ارْحَمِ الْمُحَلِّقِينَ', lat: 'Allāhummarhamil muhalliqīn', arti: 'Ya Allah, rahmatilah orang-orang yang mencukur rambutnya. (Nabi saw. mendoakan juga yang memendekkan.)', sumber: "HR. al-Bukhari 1727 dan Muslim 1301 (Ibnu 'Umar)" },
      { id: 'tl2', t: 'Ucapan syukur penyelesaian manasik', g: 'masyhur', ar: 'الْحَمْدُ لِلّٰهِ الَّذِي قَضَىٰ عَنَّا نُسُكَنَا', lat: "Alhamdulillāhilladzī qadhā 'annā nusukanā", arti: 'Segala puji bagi Allah yang telah menyempurnakan ibadah kami.', sumber: "Ucapan syukur umum yang lazim; tidak ada riwayat sahih sebagai bacaan khusus tahalul" }
    ] },
    { id: 'pulang', judul: 'Setelah umrah / pulang', cat: 'Dibaca ketika kembali dari safar.', items: [
      { id: 'pl1', t: 'Doa pulang dari safar', g: 'sahih', ar: 'آيِبُونَ تَائِبُونَ عَابِدُونَ لِرَبِّنَا حَامِدُونَ', lat: "Āyibūn tā-ibūn 'ābidūn li rabbinā hāmidūn", arti: 'Kami kembali, bertobat, beribadah, dan memuji Tuhan kami.', sumber: "HR. al-Bukhari 1797 dan Muslim 1344 (Ibnu 'Umar)" }
    ] }
  ];

  return { PUSTAKA, GRADE, KAABA, MIQAT, ASAL, SEKITAR, PANTAI, DOA, PERSIAPAN, LARANGAN, KUIS, LANGKAH };
})();
