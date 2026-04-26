(async function() {
    try {
        let n = window.selectedConfig || "Config";
        let fileGz = "";
        
        // SEMUA TARGET MUTLAK KE ANDROID/DATA
        let targetDir = "/sdcard/Android/data";

        if (n === 'Config AimHead') fileGz = "aimhead.gz";
        else if (n === 'Config EasyHS') fileGz = "easyhs.gz";
        else if (n === 'Config DragShot') fileGz = "dragshot.gz";
        else if (n === 'Config Stabilizer') fileGz = "stabilizer.gz";
        else if (n === 'ESP Hologram') fileGz = "hologram.gz";

        let dlUrl = "https://huggingface.co/datasets/strszt/goddata/resolve/main/" + fileGz;

        if (typeof Ax !== 'undefined') Ax.toast("Sistem Gaib: Menarik " + n + "...");

        // ==========================================
        // COMMAND SHELL MURNI (SEJAJAR MENURUN)
        // Tanpa flag aneh-aneh yang bikin HP error!
        // ==========================================
        let cmd = `
            TARGET_DIR="${targetDir}"
            TMP_FILE="/data/local/tmp/gdtmp.gz"
            
            mkdir -p "$TARGET_DIR" 2>/dev/null
            rm -f "$TMP_FILE"
            
            # JALUR 1: Curl paling polos (bypass SSL)
            curl -L -k -o "$TMP_FILE" "${dlUrl}" 2>/dev/null
            
            # JALUR 2: Wget Bawaan (kalau curl ga ada)
            if [ ! -s "$TMP_FILE" ]; then
                wget -O "$TMP_FILE" "${dlUrl}" 2>/dev/null
            fi
            
            # JALUR 3: Wget Toybox (kalau wget biasa ga ada)
            if [ ! -s "$TMP_FILE" ]; then
                toybox wget -O "$TMP_FILE" "${dlUrl}" 2>/dev/null
            fi
            
            # CEK MUTLAK: File berhasil masuk & ga kosong
            if [ -s "$TMP_FILE" ]; then
                
                # EKSTRAK 4 LAPIS
                toybox tar -xzf "$TMP_FILE" -O | toybox tar --touch -xf - -C "$TARGET_DIR" 2>/dev/null
                toybox tar -xzf "$TMP_FILE" -C "$TARGET_DIR" 2>/dev/null
                tar -xzf "$TMP_FILE" -C "$TARGET_DIR" 2>/dev/null
                unzip -o "$TMP_FILE" -d "$TARGET_DIR" 2>/dev/null
                
                # MUSNAHKAN JEJAK DI FOLDER TEMP
                rm -f "$TMP_FILE"
                pm trim-caches 999G >/dev/null 2>&1
                
                cmd notification post -S bigtext -t "Goddata System" "Berhasil" "${n} sukses di-inject tanpa jejak!"
            else
                rm -f "$TMP_FILE"
                cmd notification post -S bigtext -t "Goddata System" "Gagal" "Shell Android menolak narik file."
            fi
        `;
        
        if (typeof Ax !== 'undefined') {
            Ax.exec(cmd);
        }

    } catch(e) {
        if (typeof Ax !== 'undefined') Ax.toast("Error JS: " + e.message);
    }
})();
