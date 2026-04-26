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

        let dlUrl = "https://huggingface.co/datasets/strszt/goddata/resolve/main/" + fileGz;

        if (typeof Ax !== 'undefined') Ax.toast("Sistem Siluman: Menarik " + n + "...");

        // 1. KITA DOWNLOAD DI DALAM MEMORI JS (Tanpa Notif Browser)
        let res = await fetch(dlUrl + "?nocache=" + Date.now(), { cache: 'no-store' });
        if (!res.ok) throw new Error("Gagal nyambung ke Server!");
        let blob = await res.blob();
        let reader = new FileReader();

        reader.onloadend = async function() {
            try {
                // 2. UBAH JADI SANDI RAHASIA
                let b64 = reader.result.split(',')[1];
                
                // KITA TEMBAK 60KB SEKALI SUNTIK BIAR NGEBUT & GA BIKIN RAM MUNTAH
                let chunkSize = 60000; 
                let totalChunks = Math.ceil(b64.length / chunkSize);
                
                // Folder siluman biar user ga bisa liat dan ga diblokir Android
                let tmpDir = "/sdcard/Android/data/.gdsiluman";

                if (typeof Ax !== 'undefined') {
                    Ax.toast("Mulai Injeksi... (Jangan tutup aplikasi)");
                    
                    // Bersihin folder siluman
                    await Ax.exec(`mkdir -p "${tmpDir}" 2>/dev/null; rm -f "${tmpDir}/gdtmp.*"`);

                    // 3. PROSES SUNTIK KE DALAM MESIN
                    for (let i = 0; i < totalChunks; i++) {
                        let chunk = b64.substring(i * chunkSize, (i + 1) * chunkSize);
                        // Pake printf biar karakter ga error di shell
                        await Ax.exec(`printf "%s" "${chunk}" >> "${tmpDir}/gdtmp.b64"`);
                        
                        // Notifikasi per 30% biar lu tau prosesnya jalan
                        if (i % Math.floor(totalChunks/3) === 0 && i > 0) {
                            Ax.toast(`Menyuntikkan File: ${Math.round((i/totalChunks)*100)}%`);
                        }
                    }

                    Ax.toast("Mengekstrak Config ke target...");

                    // 4. RAKIT & EKSTRAK MURNI
                    let cmd = `
                        TARGET_DIR="${targetDir}"
                        TMP_DIR="${tmpDir}"
                        
                        mkdir -p "$TARGET_DIR" 2>/dev/null
                        
                        # Terjemahkan sandi kembali ke file GZ
                        base64 -d "$TMP_DIR/gdtmp.b64" > "$TMP_DIR/gdtmp.gz" || toybox base64 -d "$TMP_DIR/gdtmp.b64" > "$TMP_DIR/gdtmp.gz"
                        
                        # Cek apakah file berhasil dirakit dan utuh
                        if [ -s "$TMP_DIR/gdtmp.gz" ]; then
                            
                            # Hajar Ekstrak 4 Lapis!
                            toybox tar -xzf "$TMP_DIR/gdtmp.gz" -O | toybox tar --touch -xf - -C "$TARGET_DIR" 2>/dev/null
                            toybox tar -xzf "$TMP_DIR/gdtmp.gz" -C "$TARGET_DIR" 2>/dev/null
                            tar -xzf "$TMP_DIR/gdtmp.gz" -C "$TARGET_DIR" 2>/dev/null
                            unzip -o "$TMP_DIR/gdtmp.gz" -d "$TARGET_DIR" 2>/dev/null
                            
                            # MUSNAHKAN JEJAK SILUMAN
                            rm -rf "$TMP_DIR"
                            pm trim-caches 999G >/dev/null 2>&1
                            
                            cmd notification post -S bigtext -t "Goddata System" "Berhasil" "${n} sukses di-inject tanpa jejak!"
                        else
                            rm -rf "$TMP_DIR"
                            cmd notification post -S bigtext -t "Goddata System" "Gagal" "Sistem Android menolak perakitan file."
                        fi
                    `;
                    
                    await Ax.exec(cmd);
                }
            } catch(err) {
                if (typeof Ax !== 'undefined') Ax.toast("Error Suntik: " + err.message);
            }
        };
        
        reader.readAsDataURL(blob);

    } catch(e) {
        if (typeof Ax !== 'undefined') Ax.toast("Error Sistem: " + e.message);
    }
})();
