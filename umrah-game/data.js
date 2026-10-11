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

  return { KAABA, MIQAT, ASAL, SEKITAR, PANTAI, DOA, PERSIAPAN, LARANGAN, KUIS, LANGKAH };
})();
