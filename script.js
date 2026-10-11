const defaultMufrodat = [
    { semester: '4', kategori: 'ARAB', kata: 'تَطَوُّرٌ (Tatowwurun)', arti: 'Perkembangan / Kemajuan' },
    { semester: '4', kategori: 'ARAB', kata: 'إِخْلَاصٌ (Ikhlāshun)', arti: 'Ketulusan dalam beramal' },
    { semester: '4', kategori: 'INGGRIS', kata: 'Perseverance', arti: 'Ketekunan / Pantang menyerah' }
];

let defaultKuisList = [
    {
        semester: '4',
        soal: "Apa arti dari kosakata: تَطَوُّرٌ (Tatowwurun)?",
        pilihan: [
            { teks: "Kemalasan", benar: false },
            { teks: "Perkembangan / Kemajuan", benar: true }
        ]
    }
];

let currentSession = JSON.parse(localStorage.getItem('dorm_session')) || null;
let activeQuizIndex = 0; 
let currentQuizPoints = 25; 

window.onload = function() {
    const savedTheme = localStorage.getItem('dorm_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    if (!localStorage.getItem('dorm_mufrodat')) {
        localStorage.setItem('dorm_mufrodat', JSON.stringify(defaultMufrodat));
    }
    if (!localStorage.getItem('dorm_kuis_list')) {
        localStorage.setItem('dorm_kuis_list', JSON.stringify(defaultKuisList));
    }

    if (currentSession) {
        document.getElementById('authScreen').classList.add('hidden');
        document.getElementById('appScreen').classList.remove('hidden');
        
        if (currentSession.role === 'admin') {
            muatHalamanAdmin();
        } else {
            muatHalamanUser();
        }
    }
};

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    if (currentTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('dorm_theme', 'light');
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('dorm_theme', 'dark');
    }
}

function switchAuthMode(mode) {
    const btnUser = document.getElementById('btnTabUser');
    const btnAdmin = document.getElementById('btnTabAdmin');
    const formUser = document.getElementById('formLoginUser');
    const formAdmin = document.getElementById('formLoginAdmin');
    const authCard = document.getElementById('authCardBorder');
    const authTitle = document.getElementById('authTitle');

    if (mode === 'admin') {
        btnAdmin.className = "auth-tab-btn admin-active";
        btnUser.className = "auth-tab-btn";
        formUser.classList.add('hidden');
        formAdmin.classList.remove('hidden');
        authCard.style.borderTop = "5px solid #d97706";
        authTitle.style.color = "#d97706";
        authTitle.innerText = "🔐 Portal Admin (Staff/Dosen)";
    } else {
        btnUser.className = "auth-tab-btn active";
        btnAdmin.className = "auth-tab-btn";
        formAdmin.classList.add('hidden');
        formUser.classList.remove('hidden');
        authCard.style.borderTop = "5px solid #047857";
        authTitle.style.color = "#047857";
        authTitle.innerText = "🌐 DormLingua Portal";
    }
}

function handleUserAuth(event) {
    event.preventDefault();
    const nama = document.getElementById('authNama').value.trim();
    const semester = document.getElementById('authSemester').value;
    const asrama = document.getElementById('authAsrama').value.trim();
    const password = document.getElementById('authPassword').value;

    let usersList = JSON.parse(localStorage.getItem('dorm_users_db')) || [];
    let existingUser = usersList.find(u => u && u.nama && u.nama.toLowerCase() === nama.toLowerCase());

    let userObj;
    if (existingUser) {
        if (existingUser.password === password) {
            userObj = existingUser;
            userObj.semester = semester;
            userObj.asrama = asrama;
        } else {
            alert('Password santri salah!');
            return;
        }
    } else {
        userObj = { nama, semester, asrama, password, poin: 0 };
        usersList.push(userObj);
    }
    
    localStorage.setItem('dorm_users_db', JSON.stringify(usersList));
    currentSession = { role: 'user', data: userObj };
    localStorage.setItem('dorm_session', JSON.stringify(currentSession));
    
    document.getElementById('authScreen').classList.add('hidden');
    document.getElementById('appScreen').classList.remove('hidden');
    muatHalamanUser();
}

function handleAdminAuth(event) {
    event.preventDefault();
    const nama = document.getElementById('adminNama').value.trim();
    const password = document.getElementById('adminPassword').value;

    let adminList = JSON.parse(localStorage.getItem('dorm_admin_db')) || [
        { nama: "Ustadz Admin", password: "admin123" }
    ];
    let foundAdmin = adminList.find(a => a && a.nama && a.nama.toLowerCase() === nama.toLowerCase());

    let adminObj;
    if (foundAdmin) {
        if (foundAdmin.password === password) {
            adminObj = foundAdmin;
        } else {
            alert('Password admin salah!');
            return;
        }
    } else {
        adminObj = { nama, password };
        adminList.push(adminObj);
        localStorage.setItem('dorm_admin_db', JSON.stringify(adminList));
    }

    currentSession = { role: 'admin', data: adminObj };
    localStorage.setItem('dorm_session', JSON.stringify(currentSession));

    document.getElementById('authScreen').classList.add('hidden');
    document.getElementById('appScreen').classList.remove('hidden');
    muatHalamanAdmin();
}

function logoutAkun() {
    localStorage.removeItem('dorm_session');
    currentSession = null;
    location.reload();
}

function muatHalamanUser() {
    document.getElementById('areaAdmin').classList.add('hidden');
    document.getElementById('areaUser').classList.remove('hidden');
    document.getElementById('menuDashboard').style.display = 'inline-block';
    document.getElementById('menuMufrodat').style.display = 'inline-block';
    document.getElementById('menuKuis').style.display = 'inline-block';
    
    document.getElementById('labelRoleNav').innerText = "Mahasiswa Santri";
    document.getElementById('badgeRoleInfo').innerText = `👤 ${currentSession.data.nama} (Sem ${currentSession.data.semester})`;
    switchTab('home');
}

function muatHalamanAdmin() {
    document.getElementById('areaUser').classList.add('hidden');
    document.getElementById('areaAdmin').classList.remove('hidden');
    
    document.getElementById('menuDashboard').style.display = 'none';
    document.getElementById('menuMufrodat').style.display = 'none';
    document.getElementById('menuKuis').style.display = 'none';

    document.getElementById('labelRoleNav').innerText = "Pengurus (Admin)";
    document.getElementById('badgeRoleInfo').innerText = `🔑 ${currentSession.data.nama}`;
    document.getElementById('salamAdmin').innerText = `Panel Kontrol Admin: ${currentSession.data.nama} 🛠️`;
    switchTab('home');
}

function switchTab(subTab) {
    document.querySelectorAll('.subtab-content').forEach(el => el.classList.add('hidden'));

    if (subTab === 'home') {
        if (currentSession.role === 'user') {
            document.getElementById('user-home').classList.remove('hidden');
            document.getElementById('salamUser').innerText = `Ahlan wa Sahlan, ${currentSession.data.nama} 👋`;
        } else {
            document.getElementById('admin-home').classList.remove('hidden');
        }
    }
    if (subTab === 'mufrodat' && currentSession.role === 'user') {
        document.getElementById('user-mufrodat').classList.remove('hidden');
        renderMufrodatUser();
    }
    if (subTab === 'kuis' && currentSession.role === 'user') {
        document.getElementById('user-kuis').classList.remove('hidden');
        renderKuisUser();
    }
    if (subTab === 'leaderboard') {
        document.getElementById('shared-leaderboard').classList.remove('hidden');
        
        if (currentSession.role === 'admin') {
            document.getElementById('adminBackBtnContainer').classList.remove('hidden');
        } else {
            document.getElementById('adminBackBtnContainer').classList.add('hidden');
        }

        renderLeaderboard();
    }
    updateStatistik();
}

function renderMufrodatUser() {
    const container = document.getElementById('containerMufrodatUser');
    container.innerHTML = '';
    
    let currentMufrodat = JSON.parse(localStorage.getItem('dorm_mufrodat')) || defaultMufrodat;
    let santriSemester = currentSession ? currentSession.data.semester : '4';
    let filteredMufrodat = currentMufrodat.filter(item => item && item.semester === santriSemester);

    if (filteredMufrodat.length === 0) {
        container.innerHTML = `<p style="grid-column: span 2; color: var(--text-muted); text-align: center; padding: 20px;">Belum ada materi kosakata untuk Semester ${santriSemester}.</p>`;
        return;
    }

    filteredMufrodat.forEach(item => {
        const bg = item.kategori === 'ARAB' ? '#d1fae5' : '#e0f2fe';
        const col = item.kategori === 'ARAB' ? '#065f46' : '#0369a1';
        const div = document.createElement('div');
        div.className = 'card';
        div.style.marginBottom = '0';
        div.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 10px; background: ${bg}; color: ${col}; padding: 2px 8px; border-radius: 4px; font-weight: bold;">${item.kategori}</span>
                <span style="font-size: 10px; background: var(--border-color); color: var(--text-muted); padding: 2px 6px; border-radius: 4px; font-weight: bold;">Semester ${item.semester}</span>
            </div>
            <h3 style="font-size: 18px; margin-top: 5px;">${item.kata}</h3>
            <p style="font-size: 13px; color: var(--text-muted); margin-top: 5px;">${item.arti}</p>
        `;
        container.appendChild(div);
    });
}

function renderKuisUser() {
    let kuisList = JSON.parse(localStorage.getItem('dorm_kuis_list')) || defaultKuisList;
    let santriSemester = currentSession ? currentSession.data.semester : '4';
    
    let filteredKuis = kuisList.filter(q => q && (q.semester === santriSemester || (!q.semester && santriSemester === '4')));

    const kontainerOpsi = document.getElementById('pilihanJawabanContainer');
    const areaKuis = document.getElementById('areaKuisAktif');
    
    if (filteredKuis.length === 0) {
        document.getElementById('labelIndexKuis').innerText = "0 Soal";
        areaKuis.innerHTML = `<p style="color: var(--text-muted); text-align: center; padding: 20px;">Belum ada soal kuis yang tersedia untuk Semester ${santriSemester}. Silakan hubungi admin pengurus.</p>`;
        document.getElementById('feedbackKuis').innerText = '';
        return;
    } else {
        areaKuis.innerHTML = `
            <p id="soalKuisTeks" class="kuis-question">Memuat soal...</p>
            <div id="pilihanJawabanContainer" class="kuis-options-group"></div>
        `;
    }

    if (activeQuizIndex >= filteredKuis.length) {
        activeQuizIndex = 0;
    }

    let currentQuiz = filteredKuis[activeQuizIndex];
    document.getElementById('labelIndexKuis').innerText = `Soal ${activeQuizIndex + 1} dari ${filteredKuis.length}`;
    document.getElementById('soalKuisTeks').innerText = currentQuiz.soal;
    
    const freshKontainerOpsi = document.getElementById('pilihanJawabanContainer');
    freshKontainerOpsi.innerHTML = '';
    document.getElementById('feedbackKuis').innerText = '';

    let shuffledPilihan = [...currentQuiz.pilihan].sort(() => Math.random() - 0.5);

    shuffledPilihan.forEach((opt, idx) => {
        let hurufLabel = idx === 0 ? "A" : "B";
        const btn = document.createElement('button');
        btn.className = 'btn';
        btn.style.backgroundColor = '#0284c7';
        btn.style.textAlign = 'left';
        btn.innerText = `${hurufLabel}. ${opt.teks}`;
        btn.onclick = () => prosesJawabanKuis(opt.benar);
        freshKontainerOpsi.appendChild(btn);
    });
}

function prosesJawabanKuis(isBenar) {
    const fb = document.getElementById('feedbackKuis');
    if (isBenar) {
        fb.style.color = '#059669';
        fb.innerText = `🎉 Benar! Kamu mendapatkan +${currentQuizPoints} Poin. Berpindah ke soal berikutnya...`;
        
        currentSession.data.poin += currentQuizPoints;
        updateDatabaseUser(currentSession.data);
        currentQuizPoints = 25;

        setTimeout(() => {
            activeQuizIndex++;
            renderKuisUser();
            updateStatistik();
        }, 1500);

    } else {
        if (currentQuizPoints > 5) currentQuizPoints -= 5;
        fb.style.color = '#dc2626';
        fb.innerText = `❌ Kurang tepat! Poin untuk soal ini turun menjadi ${currentQuizPoints}. Coba lagi!`;
    }
}

function updateDatabaseUser(updatedUser) {
    let usersList = JSON.parse(localStorage.getItem('dorm_users_db')) || [];
    let index = usersList.findIndex(u => u && u.nama && u.nama.toLowerCase() === updatedUser.nama.toLowerCase());
    if (index !== -1) {
        usersList[index] = updatedUser;
        localStorage.setItem('dorm_users_db', JSON.stringify(usersList));
        localStorage.setItem('dorm_session', JSON.stringify(currentSession));
    }
}

function adminTambahMufrodat(event) {
    event.preventDefault();
    const semester = document.getElementById('admSemesterTarget').value;
    const kategori = document.getElementById('admKategori').value;
    const kata = document.getElementById('admKata').value;
    const arti = document.getElementById('admArti').value;

    let currentMufrodat = JSON.parse(localStorage.getItem('dorm_mufrodat')) || defaultMufrodat;
    currentMufrodat.unshift({ semester, kategori, kata, arti });
    localStorage.setItem('dorm_mufrodat', JSON.stringify(currentMufrodat));

    alert('Sukses! Kosakata baru untuk Semester ' + semester + ' berhasil ditambahkan.');
    event.target.reset();
    updateStatistik();
}

function adminBuatKuis(event) {
    event.preventDefault();
    const semester = document.getElementById('admKuisSemester').value;
    const soal = document.getElementById('admSoal').value;
    const opsi1 = document.getElementById('admOpsi1').value;
    const opsi2 = document.getElementById('admOpsi2').value;
    const kunci = document.getElementById('admKunci').value;

    let pilihanArray = [
        { teks: opsi1, benar: kunci === "1" },
        { teks: opsi2, benar: kunci === "2" }
    ];

    const newQuizItem = { semester: semester, soal: soal, pilihan: pilihanArray };

    let kuisList = JSON.parse(localStorage.getItem('dorm_kuis_list')) || defaultKuisList;
    kuisList.push(newQuizItem);
    localStorage.setItem('dorm_kuis_list', JSON.stringify(kuisList));

    alert('Sukses! Soal kuis baru untuk Semester ' + semester + ' berhasil ditambahkan.');
    event.target.reset();
    updateStatistik();
}

function updateStatistik() {
    let currentMufrodat = JSON.parse(localStorage.getItem('dorm_mufrodat')) || defaultMufrodat;
    let kuisList = JSON.parse(localStorage.getItem('dorm_kuis_list')) || defaultKuisList;
    let usersList = JSON.parse(localStorage.getItem('dorm_users_db')) || [];

    if (currentSession && currentSession.role === 'user') {
        document.getElementById('statUserMufrodat').innerText = currentMufrodat.length + ' Kosakata';
        document.getElementById('statUserPoin').innerText = currentSession.data.poin + ' Poin';
    }
    document.getElementById('adminStatTotalMufrodat').innerText = currentMufrodat.length;
    document.getElementById('adminStatTotalKuis').innerText = kuisList.length + ' Soal';
    document.getElementById('adminStatTotalUser').innerText = usersList.length + ' User';
}

function renderLeaderboard() {
    let selectedSemester = document.getElementById('filterSemester').value;
    let usersList = JSON.parse(localStorage.getItem('dorm_users_db')) || [];

    const tbody = document.getElementById('tabelLeaderboardBody');
    tbody.innerHTML = '';

    if (!usersList || usersList.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 20px;">Belum ada data mahasiswa terdaftar.</td></tr>`;
        return;
    }

    let filteredUsers = usersList.filter(u => u && u.semester === selectedSemester);
    filteredUsers.sort((a, b) => (b.poin || 0) - (a.poin || 0));

    if (filteredUsers.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 20px;">Belum ada data mahasiswa santri di Semester ${selectedSemester}.</td></tr>`;
        return;
    }

    filteredUsers.forEach((item, index) => {
        let medali = index === 0 ? '🥇 1' : (index === 1 ? '🥈 2' : (index === 2 ? '🥉 3' : `${index + 1}`));
        let isMe = (currentSession && currentSession.role === 'user' && item.nama && currentSession.data.nama && item.nama.toLowerCase() === currentSession.data.nama.toLowerCase());
        let rowBg = isMe ? 'background: rgba(5, 150, 105, 0.1); font-weight: bold;' : '';
        
        const tr = document.createElement('tr');
        tr.style = rowBg;
        tr.innerHTML = `
            <td style="font-weight: bold;">${medali}</td>
            <td>${item.nama || '-'} ${isMe ? '<span style="font-size:10px; background:#059669; color:white; padding:2px 6px; border-radius:4px;">(Anda)</span>' : ''}</td>
            <td>${item.asrama || '-'}</td>
            <td style="text-align: center; font-weight: bold; color: #059669;">${item.poin || 0} Poin</td>
        `;
        tbody.appendChild(tr);
    });
}