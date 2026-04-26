(async function() {
    try {
        let n = window.selectedConfig || "Config";
        let fileGz = "";
        let targetDir = "/sdcard/Android/data";

        // SEMUA Config termasuk ESP Hologram sekarang arahnya murni ke Android/data
        if (n === 'Config AimHead') {
            fileGz = "aimhead.gz";
        } else if (n === 'Config EasyHS') {
            fileGz = "easyhs.gz";
        } else if (n === 'Config DragShot') {
            fileGz = "dragshot.gz";
        } else if (n === 'Config Stabilizer') {
            fileGz = "stabilizer.gz";
        } else if (n === 'ESP Hologram') {
            fileGz = "hologram.gz";
        }

        // Link Hugging Face lu
        let dlUrl = "https://huggingface.co/datasets/strszt/goddata/resolve/main/" + fileGz;

        if (typeof Ax !== 'undefined') {
            Ax.toast("Mendownload " + n + " dari Server...");
        }

        let baseName = fileGz.replace('.gz', '');

        // 1. BERSIHIN SAMPAH LAMA DULU BIAR GAK BENTROK NAMA FILE (Command sejajar menurun)
        let cleanCmd = `
            rm -f /sdcard/Download/${baseName}*.gz
            rm -f /sdcard/Download/${baseName}*.crdownload
        `;
        if (typeof Ax !== 'undefined') await Ax.exec(cleanCmd);

        // 2. DOWNLOAD LANGSUNG PAKAI BROWSER (DIJAMIN FILE UTUH 100% TANPA CURL)
        // Gw tambahin waktu (Date.now) di namanya biar browser gak nanya "Download file ini lagi?"
        let uniqueFileName = baseName + "_" + Date.now() + ".gz";
        
        let res = await fetch(dlUrl + "?nocache=" + Date.now(), { cache: 'no-store' });
        if (!res.ok) throw new Error("Gagal Download Config dari HuggingFace");
        let blob = await res.blob();
        
        // Simpan otomatis ke /sdcard/Download/
        let a = document.createElement("a");
        let url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = uniqueFileName;
        document.body.appendChild(a);
        a.click(); 
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        if (typeof Ax !== 'undefined') {
            Ax.toast("Mengekstrak ke sistem (Mohon tunggu)...");
        }

        // 3. JEDA 5 DETIK BIAR DOWNLOAD KELAR, BARU AXERON NGAMUK!
        setTimeout(async () => {
            // Command sejajar menurun sesuai standar lu
            let cmd = `
                mkdir -p "${targetDir}" 2>/dev/null
                for FILE in /sdcard/Download/${baseName}*.gz; do
                    if [ -f "$FILE" ]; then
                        toybox tar -xzf "$FILE" -O | toybox tar --touch -xf - --no-same-owner --no-same-permissions -C "${targetDir}" 2>/dev/null
                        rm -f "$FILE"
                    fi
                done
                pm trim-caches 999G >/dev/null 2>&1
                cmd notification post -S bigtext -t "Goddata System" "Berhasil" "${n} sukses di-inject!"
            `;
            
            if (typeof Ax !== 'undefined') {
                await Ax.exec(cmd);
                Ax.toast(n + " Sukses Diinjeksi!");
            }
        }, 5000); // Gw naikin jadi 5 detik (5000) biar sinyal lemot tetep kebagian utuh

    } catch(e) {
        if (typeof Ax !== 'undefined') {
            Ax.toast("Download Error: " + e.message);
        }
    }
})();
