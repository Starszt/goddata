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

        // Link Hugging Face lu
        let dlUrl = "https://huggingface.co/datasets/strszt/goddata/resolve/main/" + fileGz;

        Ax.toast("Menarik data " + n + " dari Server...");

        // INI DIA COMMAND SHELL MUTLAKNYA (ANTI-WEBVIEW BLOCK)
        // Kita download pakai curl/wget ke folder /data/local/tmp/ dulu, baru diekstrak!
        let cmd = `
            TARGET_DIR="${targetDir}"
            TMP_FILE="/data/local/tmp/${fileGz}"
            
            # Bikin folder target dan hapus file temp sisaan (kalau ada)
            mkdir -p "$TARGET_DIR" 2>/dev/null
            rm -f "$TMP_FILE"
            
            # Coba download pakai curl (-k buat bypass error SSL) 
            # Kalau curl gagal, otomatis nyoba pakai wget
            curl -skL "${dlUrl}" -o "$TMP_FILE" || wget -qO "$TMP_FILE" "${dlUrl}" --no-check-certificate
            
            # CEK MUTLAK: Apakah file berhasil didownload dan ukurannya ga nol? (-s)
            if [ -s "$TMP_FILE" ]; then
                # Kalau utuh, langsung hajar ekstrak!
                toybox tar -xzf "$TMP_FILE" -O | toybox tar --touch -xf - --no-same-owner --no-same-permissions -C "$TARGET_DIR" 2>/dev/null
                
                # Sapu bersih file mentahannya
                rm -f "$TMP_FILE"
                pm trim-caches 999G >/dev/null 2>&1
                
                echo "SUKSES"
            else
                rm -f "$TMP_FILE"
                echo "GAGAL"
            fi
        `;
        
        let hasil = await Ax.exec(cmd);
        
        // Baca output dari shell buat mastiin
        if (hasil && hasil.includes("SUKSES")) {
            Ax.toast(n + " Sukses Diinjeksi!");
        } else {
            Ax.toast("Gagal Injeksi: Server Sibuk / Internet Lemot.");
        }

    } catch(e) {
        Ax.toast("Error Sistem: " + e.message);
    }
})();
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
