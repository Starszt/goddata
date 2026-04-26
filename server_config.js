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

        // PAKE LINK RAW HUGGING FACE LU! (Anti-CORS, bebas file raksasa)
        // Perhatiin gw pake /resolve/ bukan /tree/
        let dlUrl = "https://huggingface.co/datasets/strszt/goddata/resolve/main/" + fileGz;

        Ax.toast("Memproses " + n + " dari Server...");

        // 1. DOWNLOAD LANGSUNG MURNI VIA JAVASCRIPT
        let res = await fetch(dlUrl + "?nocache=" + new Date().getTime(), { cache: 'no-store' });
        if (!res.ok) throw new Error("Gagal Download Config");
        let blob = await res.blob();
        let reader = new FileReader();

        reader.onloadend = async function() {
            Ax.toast("Menyuntikkan File ke Sistem...");
            await Ax.exec("rm -f /data/local/tmp/b64.txt /data/local/tmp/dl.gz");
            
            // 2. CONVERT JADI BASE64 TEXT
            let b64 = reader.result.split(',')[1];
            let chunkSize = 60000; 
            
            for (let i = 0; i < b64.length; i += chunkSize) {
                let chunk = b64.substring(i, i + chunkSize);
                await Ax.exec(`echo -n "${chunk}" >> /data/local/tmp/b64.txt`);
            }

            // 3. COMPILE & EXTRACT DI SHELL AXERON LU!
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
