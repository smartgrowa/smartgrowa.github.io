/* iot-mode.js
  Fitur: Menampilkan Grafik Realtime & Autofill Sensor Form
  Update: Support Dark Mode/Light Mode, UI Profesional, 6 Parameter
*/

const iotApp = {
  liveData: null,
  charts: {},
  listenerUnsubscribe: null,

  // 1. Inisialisasi
  init: function () {
    console.log("IoT Module Initialized (Dark/Light Mode Supported)...");
    this.injectDashboardUI();
    this.injectAutoFillButton();
    this.startListener();
  },

  // 2. Tampilan Dashboard Modern (Adaptive Theme)
  injectDashboardUI: function () {
    const dashboard = document.getElementById("dashboard");
    const statsGrid = dashboard.querySelector(".stats-grid");

    // Container IoT
    const iotContainer = document.createElement("div");
    iotContainer.className = "iot-wrapper";

    // Style CSS Injeksi (Menggunakan var(--...) untuk support Dark Mode)
    const style = document.createElement("style");
    style.innerHTML = `
      .iot-card-wrapper {
        background: var(--bg-card);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-sm);
        border: 1px solid var(--border);
        padding: 1.5rem;
        margin-bottom: 2rem;
        animation: fadeIn 0.5s ease-in-out;
        transition: background 0.3s, border-color 0.3s;
      }
      .iot-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
        border-bottom: 1px solid var(--border);
        padding-bottom: 1rem;
      }
      .iot-header h3 {
        color: var(--text-main);
        font-weight: 700;
      }
      .iot-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
        gap: 1rem;
        margin-bottom: 2rem;
      }
      .sensor-card {
        background: var(--bg-surface); /* Adaptive background */
        border-radius: 12px;
        padding: 1rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s, box-shadow 0.2s, border-color 0.3s;
        border: 1px solid var(--border);
        position: relative;
        overflow: hidden;
      }
      .sensor-card:hover {
        transform: translateY(-3px);
        box-shadow: var(--shadow-md);
        border-color: var(--primary);
      }
      .sensor-icon {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.1rem;
        margin-bottom: 0.5rem;
        /* Icon background tetap terang/pastel agar kontras dengan icon */
        box-shadow: 0 2px 5px rgba(0,0,0,0.05);
      }
      .sensor-val {
        font-size: 1.3rem;
        font-weight: 800;
        color: var(--text-main); /* Adaptive text */
        margin-bottom: 0.2rem;
      }
      .sensor-label {
        font-size: 0.75rem;
        color: var(--text-muted); /* Adaptive text */
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        text-align: center;
      }
      .status-dot {
        height: 8px;
        width: 8px;
        background-color: var(--text-muted);
        border-radius: 50%;
        display: inline-block;
        margin-right: 6px;
      }
      .status-online { background-color: #10b981; box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2); }
      
      /* Chart Container Adjustment */
      .chart-wrapper {
        position: relative; 
        height: 300px; 
        width: 100%;
      }
    `;
    document.head.appendChild(style);

    iotContainer.innerHTML = `
      <div class="iot-card-wrapper">
        <div class="iot-header">
          <div>
            <h3 style="margin:0; display:flex; align-items:center; gap:10px;">
              <i class="fa-solid fa-tower-broadcast" style="color:var(--primary);"></i> 
              Live Monitor
            </h3>
            <p style="margin:0; font-size:0.85rem; color:var(--text-muted); margin-top:4px;">
              Data Sensor Realtime
            </p>
          </div>
          <div id="iotBadge" style="font-size:0.8rem; background:var(--bg-surface); border: 1px solid var(--border); padding:6px 12px; border-radius:20px; color:var(--text-muted); font-weight:600; display:flex; align-items:center;">
            <span class="status-dot" id="iotDot"></span> <span id="iotText">Connecting...</span>
          </div>
        </div>
        
        <div class="iot-grid">
          <div class="sensor-card">
            <div class="sensor-icon" style="background:#fee2e2; color:#ef4444;">
              <i class="fa-solid fa-temperature-high"></i>
            </div>
            <div class="sensor-val" id="live_temp">--</div>
            <div class="sensor-label">Udara (°C)</div>
          </div>
          
          <div class="sensor-card">
            <div class="sensor-icon" style="background:#e0f2fe; color:#0ea5e9;">
              <i class="fa-solid fa-droplet"></i>
            </div>
            <div class="sensor-val" id="live_hum">--</div>
            <div class="sensor-label">RH (%)</div>
          </div>

          <div class="sensor-card">
            <div class="sensor-icon" style="background:#cffafe; color:#06b6d4;">
              <i class="fa-solid fa-water"></i>
            </div>
            <div class="sensor-val" id="live_watertemp">--</div>
            <div class="sensor-label">Air (°C)</div>
          </div>

          <div class="sensor-card">
            <div class="sensor-icon" style="background:#f3e8ff; color:#a855f7;">
              <i class="fa-solid fa-flask"></i>
            </div>
            <div class="sensor-val" id="live_ph">--</div>
            <div class="sensor-label">pH</div>
          </div>

          <div class="sensor-card">
            <div class="sensor-icon" style="background:#ffedd5; color:#f97316;">
              <i class="fa-solid fa-cubes-stacked"></i>
            </div>
            <div class="sensor-val" id="live_tds">--</div>
            <div class="sensor-label">TDS (ppm)</div>
          </div>

          <div class="sensor-card">
            <div class="sensor-icon" style="background:#fef9c3; color:#eab308;">
              <i class="fa-regular fa-sun"></i>
            </div>
            <div class="sensor-val" id="live_lux">--</div>
            <div class="sensor-label">Cahaya (Lx)</div>
          </div>
        </div>

        <div class="chart-wrapper">
          <canvas id="iotRealtimeChart"></canvas>
        </div>
      </div>
    `;

    // Sisipkan SETELAH stats-grid yang ada
    statsGrid.parentNode.insertBefore(iotContainer, statsGrid.nextSibling);

    // Setup Chart.js
    // Tips: Gunakan warna grid yang transparan agar cocok di Dark & Light mode
    Chart.defaults.color = "#94a3b8"; // Text color (slate-400) neutral
    Chart.defaults.borderColor = "rgba(128, 128, 128, 0.1)"; // Grid lines neutral

    const ctx = document.getElementById("iotRealtimeChart").getContext("2d");
    this.charts.live = new Chart(ctx, {
      type: "line",
      data: {
        labels: [],
        datasets: [
          {
            label: "Suhu Udara (°C)",
            data: [],
            borderColor: "#ef4444", // Merah
            borderWidth: 2,
            tension: 0.4,
            pointRadius: 0,
            yAxisID: "y",
          },
          {
            label: "Kelembaban (%)",
            data: [],
            borderColor: "#0ea5e9", // Biru Langit
            borderWidth: 2,
            tension: 0.4,
            pointRadius: 0,
            borderDash: [5, 5],
            yAxisID: "y",
          },
          {
            label: "pH Air",
            data: [],
            borderColor: "#a855f7", // Ungu
            borderWidth: 2,
            tension: 0.4,
            pointRadius: 2,
            yAxisID: "y_ph",
          },
          {
            label: "TDS (ppm)",
            data: [],
            borderColor: "#f97316", // Orange
            borderWidth: 2,
            tension: 0.4,
            pointRadius: 0,
            yAxisID: "y_tds",
          },
          {
            label: "Suhu Air (°C)",
            data: [],
            borderColor: "#06b6d4", // Cyan
            borderWidth: 2,
            tension: 0.4,
            pointRadius: 0,
            hidden: false,
            yAxisID: "y",
          },
          {
            label: "Cahaya (Lux)",
            data: [],
            borderColor: "#eab308", // Kuning
            borderWidth: 2,
            tension: 0.4,
            pointRadius: 0,
            hidden: false,
            yAxisID: "y_lux",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: "index",
          intersect: false,
        },
        plugins: {
          legend: {
            position: "bottom",
            labels: { usePointStyle: true, boxWidth: 6 },
          },
          tooltip: {
            mode: "index",
            intersect: false,
            backgroundColor: "rgba(15, 23, 42, 0.9)", // Dark tooltip always
            titleColor: "#f8fafc",
            bodyColor: "#f8fafc",
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { maxTicksLimit: 6 },
          },
          // Sumbu Y Kiri (Utama): Suhu & Kelembaban
          y: {
            type: "linear",
            display: true,
            position: "left",
            suggestedMin: 0,
            title: { display: true, text: "TDS (PPM)" },
            suggestedMax: 2000,
          },
          // Sumbu Y Kanan 1: pH (0-14)
          y_ph: {
            type: "linear",
            display: true,
            position: "right",
            min: 0,
            max: 14,
            grid: { drawOnChartArea: false },
            title: { display: true, text: "pH" },
          },
          // Sumbu Y Kanan 2: TDS (Hidden Grid)
          y_tds: {
            type: "linear",
            display: false,
            grid: { drawOnChartArea: false },
            suggestedMin: 0,
            suggestedMax: 1500,
          },
          // Sumbu Y Kanan 3: Lux (Hidden Grid)
          y_lux: {
            type: "linear",
            display: false,
            grid: { drawOnChartArea: false },
            suggestedMin: 0,
          },
        },
      },
    });
  },

  // 3. Tombol Autofill di Form Sensor (Menggunakan class btn-primary)
  injectAutoFillButton: function () {
    const btnRow = document.querySelector(
      "#sensorModal .btn-secondary"
    ).parentNode;

    // Cek jika tombol sudah ada agar tidak duplikat
    if (btnRow.querySelector("#btnAutoFillIoT")) return;

    const autoBtn = document.createElement("button");
    autoBtn.id = "btnAutoFillIoT";
    autoBtn.type = "button";
    autoBtn.className = "btn"; // Gunakan class btn standar aplikasi
    // Styling manual agar menonjol tapi tetap rapi
    autoBtn.style.background =
      "linear-gradient(135deg, var(--primary) 0%, #047857 100%)";
    autoBtn.style.color = "white";
    autoBtn.style.marginBottom = "15px";
    autoBtn.style.width = "100%";
    autoBtn.style.border = "none";
    autoBtn.style.boxShadow = "var(--shadow-md)";
    autoBtn.innerHTML =
      '<i class="fa-solid fa-satellite-dish"></i> Ambil Data Realtime';

    autoBtn.onclick = () => this.autoFillForm();

    // Masukkan tombol di atas tombol aksi
    btnRow.parentNode.insertBefore(autoBtn, btnRow);
  },

  // 4. Listener Data Firebase
  startListener: function () {
    if (!window.app.user) return;

    const uid = window.app.user.uid;
    // Pastikan path ini sesuai dengan Arduino Anda
    const docRef = window.fbOps.doc(
      window.db,
      "users",
      uid,
      "iot_device",
      "live_data"
    );

    window.fbOps.onSnapshot(docRef, (doc) => {
      const badgeText = document.getElementById("iotText");
      const badgeDot = document.getElementById("iotDot");

      if (doc.exists()) {
        const data = doc.data();
        this.liveData = data;
        this.updateDashboard(data);

        if (badgeText) {
          badgeText.innerText = "Online";
          badgeDot.classList.add("status-online");
        }
      } else {
        if (badgeText) {
          badgeText.innerText = "Offline";
          badgeDot.classList.remove("status-online");
        }
      }
    });
  },

  // 5. Update UI & Grafik
  updateDashboard: function (data) {
    const safeVal = (v, f = 1) =>
      v !== undefined && v !== null ? Number(v).toFixed(f) : "--";

    // Update Angka di Kartu
    const elTemp = document.getElementById("live_temp");
    if (elTemp) elTemp.innerText = safeVal(data.temp, 1);

    const elHum = document.getElementById("live_hum");
    if (elHum) elHum.innerText = safeVal(data.hum, 0);

    const elTds = document.getElementById("live_tds");
    if (elTds) elTds.innerText = safeVal(data.tds, 0);

    const elPh = document.getElementById("live_ph");
    if (elPh) elPh.innerText = safeVal(data.ph, 1);

    const elWater = document.getElementById("live_watertemp");
    if (elWater) elWater.innerText = safeVal(data.waterTemp, 1);

    const elLux = document.getElementById("live_lux");
    if (elLux) elLux.innerText = safeVal(data.lux, 0);

    // Update Grafik
    if (this.charts.live) {
      const chart = this.charts.live;
      const timeLabel = new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      // Batasi data maksimal 20 titik agar performa lancar
      if (chart.data.labels.length > 20) {
        chart.data.labels.shift();
        chart.data.datasets.forEach((ds) => ds.data.shift());
      }

      chart.data.labels.push(timeLabel);

      // Push data ke dataset (urutan sesuai definisi di atas)
      chart.data.datasets[0].data.push(data.temp || 0); // Suhu Udara
      chart.data.datasets[1].data.push(data.hum || 0); // Kelembaban
      chart.data.datasets[2].data.push(data.ph || 0); // pH
      chart.data.datasets[3].data.push(data.tds || 0); // TDS
      chart.data.datasets[4].data.push(data.waterTemp || 0); // Suhu Air
      chart.data.datasets[5].data.push(data.lux || 0); // Lux

      chart.update("none"); // Update mode 'none' agar animasi smooth
    }
  },

  // 6. Autofill Form Sensor (Cerdas mengisi Tab Soil & Hydro)
  autoFillForm: function () {
    if (!this.liveData) {
      Swal.fire("Gagal", "Belum ada data dari alat IoT.", "error");
      return;
    }

    const d = this.liveData;

    // Helper untuk set value
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val;
    };

    // 1. Parameter Lingkungan (Shared)
    setVal("sTemp", d.temp);
    setVal("sHum", d.hum);
    setVal("sLux", d.lux);

    // 2. Parameter Hidroponik
    setVal("sPhHydro", d.ph);
    setVal("sEc", d.tds ? d.tds * 2 : 0); // Konversi kasar TDS ke EC (x2)
    setVal("sTempWater", d.waterTemp);

    // 3. Parameter Tanah (Mapping)
    // Asumsi: pH sensor juga bisa dipakai untuk tanah, TDS untuk EC tanah
    setVal("sPh", d.ph);
    setVal("sEcSoil", d.tds ? d.tds * 2 : 0);
    // Moisture tidak ada di list sensor IoT Anda (kecuali pakai pin terpisah),
    // jadi biarkan kosong atau mapping jika ada sensor capacitive soil.

    // Otomatis pindah tab jika data pH valid (>0) & lebih cenderung ke hidroponik
    // (Anda bisa sesuaikan logika ini)
    if (d.ph > 0 && d.waterTemp > 0) {
      if (window.app.switchSensorTab) window.app.switchSensorTab("hydro");
    }

    // Feedback Visual pada Tombol
    const btn = document.getElementById("btnAutoFillIoT");
    if (btn) {
      const oriHTML = btn.innerHTML;
      btn.innerHTML = '<i class="fa-solid fa-check-circle"></i> Data Terisi!';

      setTimeout(() => {
        btn.innerHTML = oriHTML;
      }, 1500);
    }
  },
};

// Start IoT App setelah User Load
const originalLoad = window.app.loadUserData;
window.app.loadUserData = async function () {
  await originalLoad.apply(window.app);
  iotApp.init();
};
