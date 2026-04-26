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

        // 1. SAPU BERSIH FILE MENTAHAN LAMA BIAR NGGAK BENTROK
        await Ax.exec(`rm -f /sdcard/Download/${baseName}*.gz /sdcard/Download/${baseName}*.crdownload`);

        // 2. TRIGGER DOWNLOAD BROWSER
        let uniqueFileName = baseName + "_" + Date.now() + ".gz"; // Bikin nama unik biar browser ga nanya "Download lagi?"
        let res = await fetch(dlUrl + "?nocache=" + Date.now(), { cache: 'no-store' });
        if (!res.ok) throw new Error("Gagal Download Config");
        let blob = await res.blob();
        
        let a = document.createElement("a");
        let url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = uniqueFileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        // 3. RADAR PINTAR AXERON (Nunggu sampai file 100% kelar)
        let cmd = `
            mkdir -p "${targetDir}" 2>/dev/null
            
            # Looping pantau folder Download (maksimal 60 detik)
            for i in $(seq 1 60); do
                # Cek apakah ada file download yang belum kelar (.crdownload)
                CR_FILE=$(ls /sdcard/Download/${baseName}*.crdownload 2>/dev/null)
                # Cek file .gz nya
                GZ_FILE=$(ls /sdcard/Download/${baseName}*.gz 2>/dev/null | head -n 1)
                
                # Kalau GZ ada DAN CR udah ga ada = DOWNLOAD 100% SELESAI!
                if [ -n "$GZ_FILE" ] && [ -z "$CR_FILE" ]; then
                    sleep 1 # Kasih napas 1 detik buat storage
                    
                    # EKSTRAK MUTLAK
                    toybox tar -xzf "$GZ_FILE" -O | toybox tar --touch -xf - --no-same-owner --no-same-permissions -C "${targetDir}" 2>/dev/null
                    
                    # Sapu bersih file mentahan
                    rm -f /sdcard/Download/${baseName}*.gz
                    pm trim-caches 999G >/dev/null 2>&1
                    
                    echo "BERHASIL"
                    exit 0
                fi
                sleep 1
            done
        `;
        
        await Ax.exec(cmd);
        Ax.toast(n + " Sukses Diinjeksi!");

    } catch(e) {
        Ax.toast("Download Error: " + e.message);
    }
})();
