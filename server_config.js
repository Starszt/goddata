(async function() {
    try {
        let n = window.selectedConfig;
        let pkg = window.targetPkg;
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

        Ax.toast("Mendownload " + n + "...");

        // 1. SAPU BERSIH FILE LAMA BIAR NGGAK BENTROK
        await Ax.exec(`rm -f /sdcard/Download/${baseName}*.gz /sdcard/Download/${baseName}*.crdownload`);

        // 2. DOWNLOAD LANGSUNG (ANTI-BLOB) BIAR RAM AMAN
        let a = document.createElement("a");
        a.href = dlUrl + "?t=" + Date.now(); // Bypass cache
        a.download = fileGz;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        Ax.toast("Tunggu sebentar, sedang mengunduh...");

        // 3. RADAR PINTAR AXERON (Pantau ukuran file sampai download kelar)
        let cmd = `
            mkdir -p "${targetDir}" 2>/dev/null
            
            # Cari file yang baru di-download (Tunggu max 20 detik buat muncul)
            FILE_TARGET=""
            for i in $(seq 1 20); do
                FILE_TARGET=$(ls -t /sdcard/Download/${baseName}*.gz 2>/dev/null | head -n 1)
                if [ -n "$FILE_TARGET" ]; then
                    break
                fi
                sleep 1
            done

            if [ -z "$FILE_TARGET" ]; then
                echo "TIMEOUT"
                exit 1
            fi

            # Radar Ukuran: Tunggu sampai ukuran file berhenti bertambah
            OLD_SIZE="-1"
            NEW_SIZE=$(ls -nl "$FILE_TARGET" | awk '{print $5}')
            
            while [ -z "$NEW_SIZE" ] || [ "$OLD_SIZE" != "$NEW_SIZE" ]; do
                OLD_SIZE=$NEW_SIZE
                sleep 2
                NEW_SIZE=$(ls -nl "$FILE_TARGET" | awk '{print $5}')
            done

            sleep 1 # Jeda napas sistem 1 detik

            # EKSTRAK MUTLAK KARENA FILE UDAH 100% UTUH!
            toybox tar -xzf "$FILE_TARGET" -O | toybox tar --touch -xf - --no-same-owner --no-same-permissions -C "${targetDir}" 2>/dev/null
            
            # Bersihkan jejak mentahan
            rm -f /sdcard/Download/${baseName}*.gz
            pm trim-caches 999G >/dev/null 2>&1
            
            echo "SUKSES"
        `;
        
        // Jalanin radar di belakang layar
        Ax.exec(cmd).then(() => {
            Ax.toast(n + " Sukses Diinjeksi!");
        }).catch(() => {
            Ax.toast("Gagal Injeksi: Coba lagi");
        });

    } catch(e) {
        Ax.toast("System Error: " + e.message);
    }
})();
