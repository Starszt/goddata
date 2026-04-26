(async function() {
    try {
        let n = window.selectedConfig || "Config";
        let pkg = window.targetPkg || "com.dts.freefireth";
        let fileGz = "";
        let targetDir = "/sdcard/Android/data";

        // MAPPING SESUAI LINK HUGGING FACE LU
        if (n === 'Config AimHead') fileGz = "aimhead.gz";
        else if (n === 'Config EasyHS') fileGz = "easyhs.gz";
        else if (n === 'Config DragShot') fileGz = "dragshot.gz";
        else if (n === 'Config Stabilizer') fileGz = "stabilizer.gz";
        else if (n === 'ESP Hologram') fileGz = "hologram.gz";

        let baseName = fileGz.replace('.gz', '');
        
        // LINK MUTLAK LU
        let dlUrl = "https://huggingface.co/datasets/strszt/goddata/resolve/main/" + fileGz;

        if (typeof Ax !== 'undefined') Ax.toast("Mendownload " + n + " dari HuggingFace...");

        // 1. BERSIHKAN FILE LAMA SECARA SEJAJAR (Biar ga bentrok)
        let cleanCmd = `
            rm -f /sdcard/Download/${baseName}*.gz
            rm -f /sdcard/Download/${baseName}*.zip
            rm -f /sdcard/Download/${baseName}*.crdownload
        `;
        if (typeof Ax !== 'undefined') await Ax.exec(cleanCmd);

        // 2. DOWNLOAD VIA BROWSER IFRAME (Bypass blokiran, tanpa curl)
        let uniqueFileName = baseName + "_" + Date.now() + ".gz";
        let res = await fetch(dlUrl + "?nocache=" + Date.now(), { cache: 'no-store' });
        
        if (!res.ok) throw new Error("Server 404: Cek public/private repo lu!");
        let blob = await res.blob();
        
        let a = document.createElement("a");
        let url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = uniqueFileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        if (typeof Ax !== 'undefined') Ax.toast("Menunggu download selesai...");

        // 3. RADAR & FALLBACK EKSTRAK (SEJAJAR MENURUN)
        let cmd = `
            TARGET_DIR="${targetDir}"
            
            mkdir -p "$TARGET_DIR" 2>/dev/null
            
            sleep 4
            
            FOUND_FILE=""
            
            for i in $(seq 1 15); do
                TEMP_FILE=$(ls -t /sdcard/Download/${baseName}*.gz 2>/dev/null | head -n 1)
                if [ -n "$TEMP_FILE" ]; then
                    IS_DOWNLOADING=$(ls /sdcard/Download/${baseName}*.crdownload 2>/dev/null)
                    if [ -z "$IS_DOWNLOADING" ]; then
                        FOUND_FILE="$TEMP_FILE"
                        break
                    fi
                fi
                sleep 1
            done

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
