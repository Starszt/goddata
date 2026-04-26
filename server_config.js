(async function() {
    try {
        // Nerima variabel dari HTML V8.0
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

        let dlUrl = "https://github.com/Starszt/goddata/releases/download/goddata/" + fileGz;
        Ax.toast("Memproses " + n + " dari Server...");

        // 1. DOWNLOAD VIA JAVASCRIPT BROWSER (BYPASS CURL)
        let res = await fetch(dlUrl);
        if (!res.ok) throw new Error("Gagal Download Config");
        let blob = await res.blob();
        let reader = new FileReader();

        reader.onloadend = async function() {
            Ax.toast("Menyuntikkan File ke Sistem...");
            await Ax.exec("rm -f /data/local/tmp/b64.txt /data/local/tmp/dl.gz");
            
            // 2. CONVERT JADI BASE64 TEXT
            let b64 = reader.result.split(',')[1];
            let chunkSize = 60000; // Pecah biar shell Android ngga bengong
            
            for (let i = 0; i < b64.length; i += chunkSize) {
                let chunk = b64.substring(i, i + chunkSize);
                await Ax.exec(`echo -n "${chunk}" >> /data/local/tmp/b64.txt`);
            }

            // 3. COMPILE & EXTRACT MURNI DI DALEM SHELL!
            let cmd = `
                mkdir -p "${targetDir}" 2>/dev/null
                base64 -d /data/local/tmp/b64.txt > /data/local/tmp/dl.gz
                toybox tar -xzf /data/local/tmp/dl.gz -O | toybox tar --touch -xf - --no-same-owner --no-same-permissions -C "${targetDir}" 2>/dev/null
                rm -f /data/local/tmp/b64.txt /data/local/tmp/dl.gz
                pm trim-caches 999G >/dev/null 2>&1
            `;
            
            await Ax.exec(cmd);
            Ax.toast(n + " Sukses Diinjeksi!");
        };
        
        reader.readAsDataURL(blob);

    } catch(e) {
        Ax.toast("Download Error: " + e.message);
    }
})();
