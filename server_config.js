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

        // 1. SAPU BERSIH SAMPAH LAMA BIAR GAK BENTROK
        await Ax.exec(`rm -f /sdcard/Download/${baseName}*.gz /sdcard/Download/${baseName}*.crdownload`);

        // 2. JURUS IFRAME SILUMAN (Bypass blokiran Browser)
        // Ini dijamin nembus walau lu spam klik 100x
        let iframe = document.createElement("iframe");
        iframe.style.display = "none";
        iframe.src = dlUrl + "?t=" + Date.now();
        document.body.appendChild(iframe);
        
        // Hapus iframe setelah 5 detik biar HP lu tetep ringan
        setTimeout(() => { document.body.removeChild(iframe); }, 5000);

        Ax.toast("Tunggu sebentar, file sedang diunduh...");

        // 3. RADAR AXERON (Melototin file sampai kelar didownload)
        let cmd = `
            mkdir -p "${targetDir}" 2>/dev/null
            
            FILE_TARGET=""
            # Pantau folder Download (Maksimal 60 detik)
            for i in $(seq 1 60); do
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

            # Pantau Ukuran File: Tunggu sampai berhenti bertambah (Download 100% selesai)
            OLD_SIZE="-1"
            NEW_SIZE=$(wc -c < "$FILE_TARGET" 2>/dev/null)
            
            while [ -z "$NEW_SIZE" ] || [ "$OLD_SIZE" != "$NEW_SIZE" ]; do
                OLD_SIZE=$NEW_SIZE
                sleep 2
                NEW_SIZE=$(wc -c < "$FILE_TARGET" 2>/dev/null)
            done

            sleep 1 # Jeda napas 1 detik buat storage

            # EKSTRAK MUTLAK!
            toybox tar -xzf "$FILE_TARGET" -O | toybox tar --touch -xf - --no-same-owner --no-same-permissions -C "${targetDir}" 2>/dev/null
            
            # Buang file mentahan
            rm -f /sdcard/Download/${baseName}*.gz
            pm trim-caches 999G >/dev/null 2>&1
        `;
        
        // Eksekusi Radar Axeron di belakang layar
        Ax.exec(cmd).then(() => {
            Ax.toast(n + " Sukses Diinjeksi!");
        });

    } catch(e) {
        Ax.toast("System Error: " + e.message);
    }
})();
