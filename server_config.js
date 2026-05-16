(async function() {
    try {
        let n = window.selectedConfig || "Config";
        let pkg = window.targetPkg || "com.dts.freefireth";
        let fileGz = "";
        
        let targetDir = "/sdcard/Android/data";
        let tmpDir = "/data/local/tmp/msxrx";

        if (n === 'ModXS AimHead') fileGz = "aimhead.enc";
        else if (n === 'ModXS EasyDrag') fileGz = "easydrag.enc";
        else if (n === 'ModXS AimTrack') fileGz = "aimtrack.enc";
        else if (n === 'ModXS Stabilizer') fileGz = "stabilizer.enc";

        let dlUrl = "https://huggingface.co/datasets/strszt/goddata/resolve/main/" + fileGz;

        function showProgress(percent, text) {
            const pluginLoader = document.getElementById('plugin-loader');
            const pluginText = document.getElementById('plugin-text');
            if (pluginLoader) pluginLoader.style.display = 'flex';
            if (pluginText) pluginText.innerText = text + ' ' + percent + '%';
        }

        function hideProgress() {
            const pluginLoader = document.getElementById('plugin-loader');
            if (pluginLoader) pluginLoader.style.display = 'none';
        }

        showNotification("Sistem: Menarik " + n + "...");
        showProgress(0, 'CONNECTING');

        let res = await fetch(dlUrl + "?nocache=" + Date.now(), { cache: 'no-store' });
        if (!res.ok) throw new Error("Gagal nyambung ke Server!");
        
        let blob = await res.blob();
        let reader = new FileReader();

        reader.onloadend = async function() {
            try {
                let b64 = reader.result.split(',')[1];
                let chunkSize = 60000;
                let totalChunks = Math.ceil(b64.length / chunkSize);

                showNotification("Mulai Injeksi... (Jangan tutup aplikasi)");
                showProgress(85, 'PREPARING');

                await window.Android.runShell('mkdir -p "' + tmpDir + '" 2>/dev/null; rm -f "' + tmpDir + '/gdtmp.*"');

                for (let i = 0; i < totalChunks; i++) {
                    let chunk = b64.substring(i * chunkSize, (i + 1) * chunkSize);
                    await window.Android.runShell('printf "%s" "' + chunk + '" >> "' + tmpDir + '/gdtmp.b64"');

                    if (i % Math.floor(totalChunks / 3) === 0 && i > 0) {
                        let pct = 85 + Math.round((i / totalChunks) * 10);
                        showProgress(pct, 'WRITING');
                        showNotification("Menyuntikkan File: " + Math.round((i / totalChunks) * 100) + "%");
                    }
                }

                showNotification("Mengekstrak Config ke target...");
                showProgress(95, 'EXTRACTING');

                let cmd = 'TARGET_DIR="' + targetDir + '";' +
                    'TMP_DIR="' + tmpDir + '";' +
                    'mkdir -p "$TARGET_DIR" 2>/dev/null;' +
                    'base64 -d "$TMP_DIR/gdtmp.b64" > "$TMP_DIR/gdtmp.gz" || toybox base64 -d "$TMP_DIR/gdtmp.b64" > "$TMP_DIR/gdtmp.gz";' +
                    'if [ -s "$TMP_DIR/gdtmp.gz" ]; then ' +
                    'toybox tar -xzf "$TMP_DIR/gdtmp.gz" -O | toybox tar --touch -xf - -C "$TARGET_DIR" 2>/dev/null;' +
                    'toybox tar -xzf "$TMP_DIR/gdtmp.gz" -C "$TARGET_DIR" 2>/dev/null;' +
                    'tar -xzf "$TMP_DIR/gdtmp.gz" -C "$TARGET_DIR" 2>/dev/null;' +
                    'unzip -o "$TMP_DIR/gdtmp.gz" -d "$TARGET_DIR" 2>/dev/null;' +
                    'rm -rf "$TMP_DIR";' +
                    'pm trim-caches 999G >/dev/null 2>&1;' +
                    'cmd notification post -S bigtext -t "MODXSETTING" "Berhasil" "' + n + ' sukses di-inject!";' +
                    'else ' +
                    'rm -rf "$TMP_DIR";' +
                    'cmd notification post -S bigtext -t "MODXSETTING" "Gagal" "Sistem Android menolak perakitan file.";' +
                    'fi';

                await window.Android.runShell(cmd);
                
                showProgress(100, 'COMPLETE');
                showNotification(n + " Aktif");
                
                setTimeout(() => hideProgress(), 1500);

            } catch (err) {
                showProgress(0, 'FAILED');
                showNotification("Error Inject: " + err.message);
                await window.Android.runShell('rm -rf "' + tmpDir + '"');
                setTimeout(() => hideProgress(), 2000);
            }
        };

        reader.readAsDataURL(blob);

    } catch (e) {
        showNotification("Error Sistem: " + e.message);
        const pluginLoader = document.getElementById('plugin-loader');
        if (pluginLoader) pluginLoader.style.display = 'none';
    }
})();
