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

        let baseName = fileGz.replace('.gz', '');
        let dlUrl = "https://huggingface.co/datasets/strszt/goddata/resolve/main/" + fileGz;

        if (typeof Ax !== 'undefined') Ax.toast("Bypass Sistem: Menyiapkan " + n + "...");

        // INI DIA COMMAND SHELL JALAN PINTAS MUTLAK (TANPA JS FETCH, TANPA CURL)
        // Command sejajar menurun sesuai standar
        let cmd = `
            TARGET_DIR="${targetDir}"
            
            # 1. Sapu bersih file lama
            rm -f /sdcard/Download/${baseName}*.gz
            rm -f /sdcard/Download/${baseName}*.crdownload
            rm -f /sdcard/Download/${baseName}*.zip
            
            # 2. JALAN PINTAS 1: Coba pakai toybox wget bawaan executor (kalau ada)
            toybox wget -qO /sdcard/Download/${baseName}_tmp.gz "${dlUrl}" 2>/dev/null
            
            # 3. JALAN PINTAS 2 (FALLBACK MUTLAK): Kalau gagal, paksa Browser Android yg Download!
            # Ini 1000% tembus karena Chrome kebal sama blokiran CORS HuggingFace
            if [ ! -s /sdcard/Download/${baseName}_tmp.gz ]; then
                am start -a android.intent.action.VIEW -d "${dlUrl}" >/dev/null 2>&1
            fi
            
            # 4. RADAR PINTAR: Nunggu file masuk ke folder Download (Max 25 detik)
            FOUND_FILE=""
            for i in $(seq 1 25); do
                TEMP_FILE=$(ls -t /sdcard/Download/${baseName}*.gz 2>/dev/null | head -n 1)
                
                # Cek apakah file .gz udah muncul
                if [ -n "$TEMP_FILE" ]; then
                    # Pastiin proses download dari Chrome udah selesai (file .crdownload hilang)
                    IS_DOWNLOADING=$(ls /sdcard/Download/${baseName}*.crdownload 2>/dev/null)
                    if [ -z "$IS_DOWNLOADING" ]; then
                        # Jeda 2 detik biar memori HP selesai nyimpen file
                        sleep 2
                        FOUND_FILE="$TEMP_FILE"
                        break
                    fi
                fi
                sleep 1
            done
            
            # 5. EKSTRAKSI 4 LAPIS JIKA FILE KETEMU
            if [ -n "$FOUND_FILE" ]; then
                mkdir -p "$TARGET_DIR" 2>/dev/null
                
                # Fallback 1: Double Tar
                toybox tar -xzf "$FOUND_FILE" -O | toybox tar --touch -xf - --no-same-owner --no-same-permissions -C "$TARGET_DIR" 2>/dev/null
                
                # Fallback 2: Tar Biasa
                toybox tar -xzf "$FOUND_FILE" -C "$TARGET_DIR" 2>/dev/null
                
                # Fallback 3: Unzip
                unzip -o "$FOUND_FILE" -d "$TARGET_DIR" 2>/dev/null
                
                # Fallback 4: Tar Bawaan Sistem
                tar -xzf "$FOUND_FILE" -C "$TARGET_DIR" 2>/dev/null
                
                # Bersihkan jejak sampah biar HP ga penuh
                rm -f /sdcard/Download/${baseName}*.gz
                pm trim-caches 999G >/dev/null 2>&1
                
                # Notifikasi ke layar
                cmd notification post -S bigtext -t "Goddata System" "Berhasil" "${n} sukses diekstrak!"
            else
                cmd notification post -S bigtext -t "Goddata System" "Gagal" "Internet lemot atau file tidak ditemukan."
            fi
        `;
        
        if (typeof Ax !== 'undefined') {
            Ax.exec(cmd);
            Ax.toast("Tunggu sebentar... (Cek bar notifikasi lu!)");
        }

    } catch(e) {
        if (typeof Ax !== 'undefined') Ax.toast("Error Sistem: " + e.message);
    }
})();

            if [ -n "$FOUND_FILE" ]; then
                
                # JURUS 1: Double Tar
                toybox tar -xzf "$FOUND_FILE" -O | toybox tar --touch -xf - --no-same-owner --no-same-permissions -C "$TARGET_DIR" 2>/dev/null
                
                # JURUS 2: Tar Normal
                toybox tar -xzf "$FOUND_FILE" -C "$TARGET_DIR" 2>/dev/null
                
                # JURUS 3: Unzip
                unzip -o "$FOUND_FILE" -d "$TARGET_DIR" 2>/dev/null
                
                # JURUS 4: Tar Bawaan
                tar -xzf "$FOUND_FILE" -C "$TARGET_DIR" 2>/dev/null
                
                rm -f /sdcard/Download/${baseName}*.gz
                pm trim-caches 999G >/dev/null 2>&1
                
                cmd notification post -S bigtext -t "Goddata System" "Berhasil" "${n} sukses diekstrak ke Android/data!"
            else
                cmd notification post -S bigtext -t "Goddata System" "Gagal" "File gagal ditarik atau timeout!"
            fi
        `;
        
        if (typeof Ax !== 'undefined') {
            Ax.exec(cmd);
        }

    } catch(e) {
        if (typeof Ax !== 'undefined') Ax.toast("Error: " + e.message);
    }
})();
