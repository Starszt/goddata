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

        // Link Hugging Face lu
        let dlUrl = "https://huggingface.co/datasets/strszt/goddata/resolve/main/" + fileGz;

        if (typeof Ax !== 'undefined') Ax.toast("Mengunduh " + n + " dari Server...");

        // 1. TARIK DATA MURNI KE DALAM MEMORI (Anti blokir Browser/Spam)
        let res = await fetch(dlUrl + "?nocache=" + Date.now(), { cache: 'no-store' });
        if (!res.ok) throw new Error("Server HuggingFace tidak merespon");
        
        let blob = await res.blob();
        let reader = new FileReader();
        
        reader.onloadend = async function() {
            try {
                // 2. UBAH JADI TEKS RAHASIA (BASE64)
                let b64 = reader.result.split(',')[1];
                let chunkSize = 15000; // Dipotong kecil-kecil biar mesin Android ga muntah
                let chunks = [];
                for (let i = 0; i < b64.length; i += chunkSize) {
                    chunks.push(b64.substring(i, i + chunkSize));
                }

                if (typeof Ax !== 'undefined') {
                    Ax.toast("Menyuntikkan File ke Sistem: 0%");
                    await Ax.exec("rm -f /data/local/tmp/gdtmp.b64 /data/local/tmp/gdtmp.gz");

                    // 3. SUNTIK TEKS KE DALAM MESIN ANDROID (Pake printf anti error)
                    for (let i = 0; i < chunks.length; i++) {
                        await Ax.exec(`printf "%s" "${chunks[i]}" >> /data/local/tmp/gdtmp.b64`);
                        // Kasih tau progress setiap beberapa suntikan
                        if (i % 30 === 0 && i > 0) {
                            Ax.toast(`Menyuntikkan File: ${Math.round((i/chunks.length)*100)}%`);
                        }
                    }

                    Ax.toast("Mengekstrak " + n + " (Mohon Tunggu)...");

                    // 4. COMPILE ULANG & EKSTRAK MURNI DI SHELL LU!
                    let cmd = `
                        mkdir -p "${targetDir}" 2>/dev/null
                        
                        # Ubah balik dari Teks ke File ZIP
                        base64 -d /data/local/tmp/gdtmp.b64 > /data/local/tmp/gdtmp.gz || toybox base64 -d /data/local/tmp/gdtmp.b64 > /data/local/tmp/gdtmp.gz
                        
                        # Cek mutlak, filenya jadi apa enggak?
                        if [ -s /data/local/tmp/gdtmp.gz ]; then
                            # Hajar pake command ekstrak andalan lu!
                            toybox tar -xzf /data/local/tmp/gdtmp.gz -O | toybox tar --touch -xf - --no-same-owner --no-same-permissions -C "${targetDir}" 2>/dev/null
                            
                            # Sapu bersih file sementara
                            rm -f /data/local/tmp/gdtmp.b64 /data/local/tmp/gdtmp.gz
                            pm trim-caches 999G >/dev/null 2>&1
                            
                            cmd notification post -S bigtext -t "Goddata System" "Berhasil" "${n} sukses di-inject!"
                        else
                            cmd notification post -S bigtext -t "Goddata System" "Gagal" "File gagal dirakit di mesin."
                        fi
                    `;
                    
                    await Ax.exec(cmd);
                    Ax.toast("Selesai! Silakan cek notifikasi HP lu.");
                }
            } catch(err) {
                if (typeof Ax !== 'undefined') Ax.toast("Error Suntik: " + err.message);
            }
        };
        
        // Mulai proses baca memori
        reader.readAsDataURL(blob);

    } catch(e) {
        if (typeof Ax !== 'undefined') Ax.toast("Error Server: " + e.message);
    }
})();
