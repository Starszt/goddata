(async function() {
    try {
        let n = window.selectedConfig || "Config";
        let pkg = window.targetPkg || "com.dts.freefireth";
        let fileGz = "";
        let targetDir = "/sdcard/Android/data";

        if (n === 'Config AimHead') fileGz = "aimhead.gz";
        else if (n === 'Config EasyHS') fileGz = "easyhs.gz";
        else if (n === 'Config DragShot') fileGz = "dragshot.gz";
        else if (n === 'Config Stabilizer') fileGz = "stabilizer.gz";
        else if (n === 'ESP Hologram') {
            fileGz = "hologram.gz";
            targetDir = "/sdcard/Android/data/" + pkg + "/files/contentcache/Optional/android/gameassetbundles";
        }

        let baseName = fileGz.replace('.gz', '');
        let dlUrl = "https://huggingface.co/datasets/strszt/goddata/resolve/main/" + fileGz;

        if (typeof Ax !== 'undefined') Ax.toast("Memulai Injeksi " + n + "...");

        // 1. SAPU BERSIH SISA DOWNLOAD LAMA VIA SHELL (Biar ga numpuk)
        await Ax.exec(`rm -f /sdcard/Download/${baseName}*.gz /sdcard/Download/${baseName}*.crdownload`);

        // 2. DOWNLOAD LEWAT IFRAME (Bypass Axeron yang ga bisa curl)
        // Pasti jalan walau diklik 100x karena lewat pintu belakang browser
        let iframe = document.createElement("iframe");
        iframe.style.display = "none";
        iframe.src = dlUrl + "?t=" + Date.now();
        document.body.appendChild(iframe);
        
        setTimeout(() => { document.body.removeChild(iframe); }, 5000);

        if (typeof Ax !== 'undefined') Ax.toast("Mengunduh data (Mohon tunggu)...");

        // 3. RADAR AXERON (Pantau Folder Download & Langsung Ekstrak)
        let cmd = `
            TARGET_DIR="${targetDir}"
            mkdir -p "$TARGET_DIR" 2>/dev/null
            
            # Looping melototin folder Download (Tunggu sampai max 90 detik)
            for i in $(seq 1 90); do
                # Cari file mentahan dari Chrome
                CR_FILE=$(ls /sdcard/Download/${baseName}*.crdownload 2>/dev/null)
                # Cari file utuh
                GZ_FILE=$(ls /sdcard/Download/${baseName}*.gz 2>/dev/null | head -n 1)
                
                # Kalau file .gz ada DAN file .crdownload udah hilang (Download Kelar 100%)
                if [ -n "$GZ_FILE" ] && [ -z "$CR_FILE" ]; then
                    sleep 2 # Jeda napas storage
                    
                    # HAJAR EKSTRAK PAKE JURUS LU!
                    toybox tar -xzf "$GZ_FILE" -O | toybox tar --touch -xf - --no-same-owner --no-same-permissions -C "$TARGET_DIR" 2>/dev/null
                    
                    # Hapus file zip/gz biar HP user ga penuh
                    rm -f /sdcard/Download/${baseName}*.gz
                    pm trim-caches 999G >/dev/null 2>&1
                    
                    # Keluarin Notif Berhasil
                    cmd notification post -S bigtext -t "Goddata System" "Berhasil" "${n} sukses di-inject!"
                    exit 0
                fi
                sleep 2
            done
            
            # Kalau lebih dari 90 detik ga kelar (Internet Lemot / Batal)
            cmd notification post -S bigtext -t "Goddata System" "Gagal" "Waktu habis. Download config gagal / dibatalkan."
        `;
        
        // Jalanin radar secara gaib (fire and forget), ga usah nungguin balasan JS!
        if (typeof Ax !== 'undefined') {
            Ax.exec(cmd);
        }

    } catch(e) {
        if (typeof Ax !== 'undefined') Ax.toast("Error JS: " + e.message);
    }
})();
