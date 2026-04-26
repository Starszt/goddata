(async function() {
    try {
        let n = window.selectedConfig || "Config";
        let fileGz = "";
        let targetDir = "/sdcard/Android/data";

        if (n === 'Config AimHead') fileGz = "aimhead.gz";
        else if (n === 'Config EasyHS') fileGz = "easyhs.gz";
        else if (n === 'Config DragShot') fileGz = "dragshot.gz";
        else if (n === 'Config Stabilizer') fileGz = "stabilizer.gz";
        else if (n === 'ESP Hologram') fileGz = "hologram.gz";

        let dlUrl = "https://huggingface.co/datasets/strszt/goddata/resolve/main/" + fileGz;

        if (typeof Ax !== 'undefined') Ax.toast("Sistem Siluman: Menarik " + n + "...");

        // INI COMMAND SHELL SILUMAN MUTLAK (Tanpa Browser, Tanpa Jejak User)
        let cmd = `
            TARGET_DIR="${targetDir}"
            TMP_FILE="/data/local/tmp/gdsiluman.gz"
            
            mkdir -p "$TARGET_DIR" 2>/dev/null
            rm -f "$TMP_FILE"
            
            # JURUS PENYAMARAN: Pura-pura jadi Browser biar ga diblokir HuggingFace
            # Kita paksa cari curl dan wget di dalam sistem akar (/system/bin/)
            /system/bin/curl -sL -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" "${dlUrl}" -o "$TMP_FILE" 2>/dev/null
            
            if [ ! -s "$TMP_FILE" ]; then
                /system/bin/wget -qU "Mozilla/5.0" -O "$TMP_FILE" "${dlUrl}" 2>/dev/null
            fi
            
            if [ ! -s "$TMP_FILE" ]; then
                toybox wget -qU "Mozilla/5.0" -O "$TMP_FILE" "${dlUrl}" 2>/dev/null
            fi
            
            # CEK FILE: Kalau berhasil ditarik dan ga kosong, LANGSUNG BANTAI!
            if [ -s "$TMP_FILE" ]; then
                
                # EKSTRAKSI 4 LAPIS (FALLBACK)
                toybox tar -xzf "$TMP_FILE" -O | toybox tar --touch -xf - --no-same-owner --no-same-permissions -C "$TARGET_DIR" 2>/dev/null
                toybox tar -xzf "$TMP_FILE" -C "$TARGET_DIR" 2>/dev/null
                unzip -o "$TMP_FILE" -d "$TARGET_DIR" 2>/dev/null
                tar -xzf "$TMP_FILE" -C "$TARGET_DIR" 2>/dev/null
                
                # MUSNAHKAN JEJAK DI FOLDER TEMP (User ga bakal bisa nyolong config lu)
                rm -f "$TMP_FILE"
                pm trim-caches 999G >/dev/null 2>&1
                
                cmd notification post -S bigtext -t "Goddata System" "Berhasil" "${n} sukses di-inject tanpa jejak!"
            else
                cmd notification post -S bigtext -t "Goddata System" "Gagal" "Koneksi ke server ditolak."
            fi
        `;
        
        // Hajar di belakang layar, user cuma tau beres doang!
        if (typeof Ax !== 'undefined') {
            Ax.exec(cmd);
        }

    } catch(e) {
        if (typeof Ax !== 'undefined') Ax.toast("Error Sistem: " + e.message);
    }
})();
