/* ============================================
   MONITORING KELUHAN PELANGGAN (TICKETING HELPDEK)
   File: script.js
   
   Script ini berisi semua fungsi JavaScript
   untuk sistem ticketing helpdesk:
   - Menampilkan daftar tiket
   - Pencarian real-time
   - Filter berdasarkan status dan prioritas
   - Menambah tiket baru
   - Menampilkan detail tiket
   - Sistem komentar teknisi
   ============================================ */

// ============================================
// DATA TIKET AWAL (DUMMY DATA)
// ============================================
// Array untuk menyimpan data tiket.
// Data ini akan di-render ke dalam tabel di index.html.
// Masing-masing objek mewakili satu tiket dengan properti:
// - id: nomor ID tiket unik
// - reporter: nama orang yang melapor
// - title: judul/judul keluhan
// - priority: level prioritas (Critical, High, Normal)
// - status: status tiket (Open, In Progress, Closed)
// - date: tanggal pembuatan tiket
// - description: kronologi detail keluhan

let tickets = [
    {
        id: "001",
        reporter: "Budi Santoso",
        title: "Layanan Internet Sering Putus",
        priority: "High",
        status: "In Progress",
        date: "2026-04-25",
        description: "Pelanggan mengalami gangguan koneksi internet yang sering terputus-putus dalam beberapa hari terakhir. Gangguan terjadi terutama pada jam kerja (08.00-17.00). Pelanggan menggunakan layanan internet untuk bekerja dari rumah dan sangat memerlukan solusi cepat."
    },
    {
        id: "002",
        reporter: "Siti Rahayu",
        title: "Tagihan Bulan Ini Terlalu Tinggi",
        priority: "Critical",
        status: "Open",
        date: "2026-04-26",
        description: "Pelanggan mengajukan keberatan atas tagihan bulan April 2026 yang melonjak drastis dari biasanya. Tagihan biasanya sekitar Rp 500.000, namun bulan ini menjadi Rp 2.500.000. Pelanggan meminta investigasi dan penjelasan detail mengenai lonjakan tagihan tersebut."
    },
    {
        id: "003",
        reporter: "Ahmad Wijaya",
        title: "Permintaan Penambahan Channel TV",
        priority: "Normal",
        status: "Closed",
        date: "2026-04-20",
        description: "Pelanggan mengajukan permintaan penambahan channel TV premium ke dalam paket langganannya. Setelah koordinasi dengan tim terkait, permintaan telah disetujui dan channel telah ditambahkan ke akun pelanggan pada tanggal 22 April 2026."
    }
];

// ============================================
// VARIABEL UNTUK COUNTER ID TIKET
// ============================================
// variabel ini akan terus bertambah setiap kali
// pengguna menambah tiket baru, sehingga ID tiket
// akan unik dan berurutan (#001, #002, #003, dst)

let ticketCounter = 4; // Dimulai dari 4 karena sudah ada 3 data dummy

// ============================================
// FUNGSI UTAMA: RENDER TABEL TIKET
// ============================================
// Fungsi ini akan menampilkan semua tiket ke dalam tabel HTML.
// Setiap kali filter/search berubah, fungsi ini dipanggil ulang
// untuk memperbarui tampilan tabel.

function renderTicketTable(data = tickets) {
    // Dapatkan elemen tbody tabel dari DOM
    const tbody = document.getElementById("ticketBody");
    
    // Kosongkan isi tbody terlebih dahulu
    tbody.innerHTML = "";
    
    // Ambil elemen untuk pesan "tidak ada data"
    const noDataMessage = document.getElementById("noDataMessage");
    
    // Jika tidak ada tiket yang cocok dengan filter
    if (data.length === 0) {
        tbody.innerHTML = ""; // Kosongkan tabel
        noDataMessage.style.display = "block"; // Tampilkan pesan
        return; // Hentikan fungsi
    }
    
    // Sembunyikan pesan "tidak ada data"
    noDataMessage.style.display = "none";
    
    // Loop melalui setiap tiket dan buat baris tabel
    data.forEach(ticket => {
        // Buat elemen <tr> untuk baris baru
        const row = document.createElement("tr");
        
        // Buat badge class berdasarkan prioritas (untuk warna)
        const priorityClass = `badge-${ticket.priority.toLowerCase()}`;
        
        // Buat badge class berdasarkan status (untuk warna)
        const statusClass = getStatusBadgeClass(ticket.status);
        
        // Isi baris dengan data tiket menggunakan template literal
        // Template literal memungkinkan kita menyisipkan variabel langsung ke dalam HTML
        row.innerHTML = `
            <td>#${ticket.id}</td>
            <td>${ticket.reporter}</td>
            <td>${ticket.title}</td>
            <td><span class="badge ${priorityClass}">${ticket.priority}</span></td>
            <td><span class="badge ${statusClass}">${ticket.status}</span></td>
            <td>
                <a href="detail.html?id=${ticket.id}" class="btn-detail">
                    Detail
                </a>
            </td>
        `;
        
        // Tambahkan baris ke dalam tbody
        tbody.appendChild(row);
    });
}

// ============================================
// FUNGSI PENDUKUNG: GET STATUS BADGE CLASS
// ============================================
// Fungsi helper untuk mendapatkan nama class CSS
// berdasarkan status tiket. Berguna untuk styling warna.

function getStatusBadgeClass(status) {
    switch (status) {
        case "Open":
            return "badge-blue";       // Biru untuk Open
        case "In Progress":
            return "badge-yellow";   // Kuning untuk In Progress
        case "Closed":
            return "badge-gray";    // Abu-abu untuk Closed
        default:
            return "badge-blue";     // Default biru
    }
}

// ============================================
// FUNGSI: SEARCH REAL-TIME
// ============================================
// Fungsi ini memfilter tiket berdasarkan nama pelapor
// atau judul keluhan. Dipicu setiap kali pengguna
// mengetik di kotak pencarian (event 'input').

function handleSearch() {
    // Ambil nilai dari input search dan ubah ke huruf kecil
    // untuk pencarian case-insensitive (tidak case-sensitive)
    const searchTerm = document.getElementById("searchInput").value.toLowerCase();
    
    // Ambil nilai filter status dan prioritas
    const statusFilter = document.getElementById("filterStatus").value;
    const priorityFilter = document.getElementById("filterPriority").value;
    
    // Filter array tickets berdasarkan kriteria
    const filteredTickets = tickets.filter(ticket => {
        // Cek apakah nama pelapor atau judul mengandung kata pencarian
        const matchesSearch = ticket.reporter.toLowerCase().includes(searchTerm) || 
                             ticket.title.toLowerCase().includes(searchTerm);
        
        // Cek apakah status cocok dengan filter (jika filter tidak kosong)
        const matchesStatus = statusFilter === "" || ticket.status === statusFilter;
        
        // Cek apakah prioritas cocok dengan filter (jika filter tidak kosong)
        const matchesPriority = priorityFilter === "" || ticket.priority === priorityFilter;
        
        // Tiket ditampilkan jika memenuhi SEMUA kriteria
        return matchesSearch && matchesStatus && matchesPriority;
    });
    
    // Render ulang tabel dengan data yang sudah difilter
    renderTicketTable(filteredTickets);
}

// ============================================
// FUNGSI: FILTER DROPDOWN
// ============================================
// Fungsi untuk menangani perubahan pada dropdown filter.
// Fungsi ini juga dipanggil saat search berubah
// sehingga filter bisa dikombinasikan.

function handleFilter() {
    // Panggil fungsi search (yang sudah menangani semua filter)
    handleSearch();
}

// ============================================
// FUNGSI: MENAMBAH TIKET BARU
// ============================================
// Fungsi ini menambahkan tiket baru ke array tickets
// saat formulir submit. ID tiket dibuat otomatis
// menggunakan format #001, #002, dst.

function addTicket(event) {
    // Prevent default agar halaman tidak reload
    event.preventDefault();
    
    // Ambil nilai dari setiap field formulir
    const reporterName = document.getElementById("reporterName").value;
    const complaintTitle = document.getElementById("complaintTitle").value;
    const priority = document.getElementById("priority").value;
    const status = "Open"; // Status default saat membuat tiket baru
    
    // Generate ID tiket baru dengan format 3 digit
    const ticketId = String(ticketCounter).padStart(3, '0');
    
    // Buat objek tiket baru
    const newTicket = {
        id: ticketId,
        reporter: reporterName,
        title: complaintTitle,
        priority: priority,
        status: status,
        date: getCurrentDate(), // Tanggal saat ini
        description: `Keluhan baru dari ${reporterName}: "${complaintTitle}".`
    };
    
    // Tambahkan tiket baru ke array tickets (di awal array)
    tickets.unshift(newTicket);
    
    // Increment counter untuk ID berikutnya
    ticketCounter++;
    
    // Render ulang tabel dengan data terbaru
    renderTicketTable();
    
    // Tutup modal setelah sukses menambah tiket
    closeModal();
    
    // Reset formulir (kosongkan semua field)
    document.getElementById("ticketForm").reset();
    
    // Tampilkan alert sukses
    alert(`Tiket berhasil ditambahkan!\n\nID Tiket: #${ticketId}\nPelapor: ${reporterName}\nJudul: ${complaintTitle}`);
}

// ============================================
// FUNGSI: MENDAPATKAN TANGGAL HARI INI
// ============================================
// Fungsi helper untuk mendapatkan tanggal hari ini
// dalam format YYYY-MM-DD (format standar ISO).

function getCurrentDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// ============================================
// FUNGSI: MEMBUKA MODAL
// ============================================
// Fungsi untuk menampilkan modal tambah tiket.

function openModal() {
    const modal = document.getElementById("ticketModal");
    modal.style.display = "block";
}

// ============================================
// FUNGSI: MENUTUP MODAL
// ============================================
// Fungsi untuk menyembunyikan modal tambah tiket.

function closeModal() {
    const modal = document.getElementById("ticketModal");
    modal.style.display = "none";
}

// ============================================
// FUNGSI: INISIALISASI HALAMAN INDEX
// ============================================
// Fungsi yang dijalankan saat halaman index.html dimuat.
// Berguna untuk setup event listeners dan render awal.

function initIndexPage() {
    // Render tabel dengan data awal
    renderTicketTable();
    
    // Tambahkan event listener untuk search (real-time)
    document.getElementById("searchInput").addEventListener("input", handleSearch);
    
    // Tambahkan event listener untuk filter status
    document.getElementById("filterStatus").addEventListener("change", handleFilter);
    
    // Tambahkan event listener untuk filter prioritas
    document.getElementById("filterPriority").addEventListener("change", handleFilter);
    
    // Tambahkan event listener untuk tombol tambah tiket
    document.getElementById("btnAddTicket").addEventListener("click", openModal);
    
    // Tambahkan event listener untuk tombol close modal
    document.querySelector(".close").addEventListener("click", closeModal);
    
    // Tambahkan event listener untuk tombol cancel
    document.getElementById("btnCancel").addEventListener("click", closeModal);
    
    // Tambahkan event listener untuk form submit (tambah tiket)
    document.getElementById("ticketForm").addEventListener("submit", addTicket);
    
    // Tutup modal jika pengguna klik di luar modal (background)
    window.addEventListener("click", function(event) {
        const modal = document.getElementById("ticketModal");
        if (event.target === modal) {
            closeModal();
        }
    });
}

// ============================================
// FUNGSI: INISIALISASI HALAMAN DETAIL
// ============================================
// Fungsi yang dijalankan saat halaman detail.html dimuat.
// Menampilkan detail tiket berdasarkan ID dari URL.

function initDetailPage() {
    // Ambil parameter ID dari URL
    // URL contoh: detail.html?id=001
    const urlParams = new URLSearchParams(window.location.search);
    const ticketId = urlParams.get("id");
    
    // Cari tiket dengan ID yang cocok
    const ticket = tickets.find(t => t.id === ticketId);
    
    // Jika tiket ditemukan, tampilkan detailnya
    if (ticket) {
        document.getElementById("detailId").textContent = `Tiket #${ticket.id}`;
        document.getElementById("detailReporter").textContent = ticket.reporter;
        document.getElementById("detailTitle").textContent = ticket.title;
        document.getElementById("detailDate").textContent = formatDate(ticket.date);
        document.getElementById("detailDescription").textContent = ticket.description;
        
        // Set badge prioritas
        const priorityEl = document.getElementById("detailPriority");
        priorityEl.textContent = ticket.priority;
        priorityEl.className = `badge badge-${ticket.priority.toLowerCase()}`;
        
        // Set badge status
        const statusEl = document.getElementById("detailStatus");
        statusEl.textContent = ticket.status;
        statusEl.className = `badge ${getStatusBadgeClass(ticket.status)}`;
    } else {
        // Jika tiket tidak ditemukan, tampilkan pesan error
        document.querySelector(".detail-card").innerHTML = `
            <div style="padding: 50px; text-align: center;">
                <h2>❌ Tiket Tidak Ditemukan</h2>
                <p>Maaf, tiket dengan ID #${ticketId} tidak ditemukan.</p>
                <a href="index.html" class="btn btn-primary" style="margin-top: 20px; display: inline-block;">
                    ← Kembali ke Daftar Tiket
                </a>
            </div>
        `;
    }
    
    // Setup komentar teknisi
    setupComments();
}

// ============================================
// FUNGSI: FORMAT TANGGAL
// ============================================
// Fungsi helper untuk mengubah format tanggal
// dari YYYY-MM-DD menjadi format Indonesia
// (contoh: 25 April 2026).

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
}

// ============================================
// FUNGSI: SETUP SISTEM KOMENTAR
// ============================================
// Fungsi untuk setup sistem komentar teknisi
// pada halaman detail.

function setupComments() {
    const commentsContainer = document.getElementById("commentsContainer");
    const commentInput = document.getElementById("commentInput");
    const sendButton = document.getElementById("btnSendComment");
    
    // Array untuk menyimpan komentar (dummy data)
    let comments = [
        {
            author: "Tim Teknisi",
            date: "2026-04-26",
            text: "Tim kami sedang investigating masalah ini dan akan memberikan update secepat mungkin."
        }
    ];
    
    // Fungsi untuk merender semua komentar
    function renderComments() {
        if (comments.length === 0) {
            commentsContainer.innerHTML = '<p class="no-comments">Belum ada komentar</p>';
            return;
        }
        
        commentsContainer.innerHTML = comments.map(comment => `
            <div class="comment">
                <div class="comment-header">
                    <span class="comment-author">👨‍💻 ${comment.author}</span>
                    <span class="comment-date">${formatDate(comment.date)}</span>
                </div>
                <p class="comment-text">${comment.text}</p>
            </div>
        `).join('');
    }
    
    // Fungsi untuk mengirim komentar baru
    function sendComment() {
        const text = commentInput.value.trim();
        
        if (text === "") {
            alert("Silakan tulis komentar terlebih dahulu!");
            return;
        }
        
        // Buat objek komentar baru
        const newComment = {
            author: "Teknisi Anda",
            date: getCurrentDate(),
            text: text
        };
        
        // Tambahkan ke array komentar (di awal)
        comments.unshift(newComment);
        
        // Render ulang komentar
        renderComments();
        
        // Kosongkan textarea
        commentInput.value = "";
        
        // Tampilkan notifikasi
        alert("Komentar berhasil dikirim!");
    }
    
    // Event listener untuk tombol kirim
    sendButton.addEventListener("click", sendComment);
    
    // Render komentar awal
    renderComments();
}

// ============================================
// EVENT LISTENER UTAMA
// ============================================
// Saat dokumen HTML selesai dimuat, cek apakah
// kita berada di halaman index atau detail,
// lalu jalankan fungsi yang sesuai.

document.addEventListener("DOMContentLoaded", function() {
    // Cek apakah elemen ticketBody ada (halaman index)
    if (document.getElementById("ticketBody")) {
        initIndexPage();
    }
    
    // Cek apakah elemen detailId ada (halaman detail)
    if (document.getElementById("detailId")) {
        initDetailPage();
    }
});

// ============================================
// CATATAN UNTUK PEMBELAJARAN
// ============================================
/*
PENJELASAN SINGKAT ALUR KERJA:

1. INITIALISASI:
   - Saat halaman dimuat, JavaScript memeriksa elemen yang ada
   - Jika di index.html, tampilkan tabel dengan renderTicketTable()
   - Jika di detail.html, tampilkan detail tiket berdasarkan ID dari URL

2. PENAMBAHAN TIKET:
   - User klik tombol "Tambah Tiket" → openModal()
   - User mengisi formulir dan submit → addTicket()
   - Tiket baru ditambahkan ke array dan tabel di-render ulang

3. PENCARIAN & FILTER:
   - Saat user mengetik di search atau mengubah dropdown
   - Fungsi handleSearch() memfilter array tickets
   - Hanya tiket yang memenuhi kriteria yang ditampilkan

4. DETAIL TIKET:
   - Klik "Detail" di tabel → buka detail.html?id=xxx
   - Parameter ID diambil dari URL menggunakan URLSearchParams
   - Data tiket yang sesuai ditampilkan

5. KOMENTAR:
   - Sistem komentar hanya UI (tanpa backend)
   - Komentar disimpan di array lokal dan di-render ke HTML
   - Setiap kali komentar baru ditambahkan, array di-update dan di-render ulang

TIP:
- Gunakan console.log() untuk debugging
- Periksa array tickets di browser console untuk melihat data
- Modifikasi data dummy sesuai kebutuhan
*/