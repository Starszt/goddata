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

        Ax.toast("Mendownload " + n + " dari Server...");

        // 1. DOWNLOAD LANGSUNG PAKAI BROWSER (DIJAMIN FILE UTUH 100%)
        let res = await fetch(dlUrl + "?nocache=" + new Date().getTime(), { cache: 'no-store' });
        if (!res.ok) throw new Error("Gagal Download Config");
        let blob = await res.blob();
        
        // 2. SIMPAN OTOMATIS KE FOLDER /sdcard/Download/
        let a = document.createElement("a");
        let url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = fileGz;
        document.body.appendChild(a);
        a.click(); // Ngetrigger download
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        Ax.toast("Mengekstrak ke sistem...");

        // 3. KASIH JEDA 3 DETIK, BARU AXERON NGAMUK!
        setTimeout(async () => {
            let cmd = `
                mkdir -p "${targetDir}" 2>/dev/null
                
                # Ekstrak dari folder Download ke folder Game
                # Pakai wildcard (*) jaga-jaga kalau namanya kerename jadi aimhead(1).gz
                for FILE in /sdcard/Download/${fileGz.replace('.gz', '')}*.gz; do
                    if [ -f "$FILE" ]; then
                        toybox tar -xzf "$FILE" -O | toybox tar --touch -xf - --no-same-owner --no-same-permissions -C "${targetDir}" 2>/dev/null
                        # Hapus mentahan setelah diekstrak
                        rm -f "$FILE"
                    fi
                done
                
                pm trim-caches 999G >/dev/null 2>&1
                echo "SUKSES"
            `;
            
            let result = await Ax.exec(cmd);
            Ax.toast(n + " Sukses Diinjeksi!");
        }, 3000); // 3000 = 3 detik. Bisa lu gedein jadi 5000 kalau internet lemot.

    } catch(e) {
        Ax.toast("Download Error: " + e.message);
    }
})();
