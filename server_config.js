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

        Ax.toast("Menarik data " + n + " dari Server...");

        // SCRIPT DETEKTIF: Download, Nyamar jadi Browser, dan Cetak Error Asli!
        let cmd = `
            TARGET_DIR="${targetDir}"
            TMP_DIR="/sdcard/GDX_TMP"
            
            mkdir -p "$TMP_DIR" 2>/dev/null
            TMP_FILE="$TMP_DIR/${fileGz}"
            rm -f "$TMP_FILE"
            
            # Coba download pakai identitas palsu biar HuggingFace ga curiga
            if command -v curl >/dev/null 2>&1; then
                ERR=$(curl -skL -A "Mozilla/5.0 (Android)" "${dlUrl}" -o "$TMP_FILE" 2>&1)
            elif command -v wget >/dev/null 2>&1; then
                ERR=$(wget -qO "$TMP_FILE" --user-agent="Mozilla/5.0 (Android)" --no-check-certificate "${dlUrl}" 2>&1)
            else
                ERR=$(toybox wget -qO "$TMP_FILE" "${dlUrl}" 2>&1)
            fi
            
            # Cek apakah file sukses masuk dan ga kosong (-s)
            if [ -s "$TMP_FILE" ]; then
                mkdir -p "$TARGET_DIR" 2>/dev/null
                toybox tar -xzf "$TMP_FILE" -O | toybox tar --touch -xf - --no-same-owner --no-same-permissions -C "$TARGET_DIR" 2>/dev/null
                
                # Hapus folder sampah
                rm -rf "$TMP_DIR"
                pm trim-caches 999G >/dev/null 2>&1
                
                echo "SUKSES"
            else
                rm -rf "$TMP_DIR"
                echo "ERR_ASLI: $ERR"
            fi
        `;
        
        let hasil = await Ax.exec(cmd);
        
        // BACA HASIL DARI MESIN ANDROID LU
        if (hasil && hasil.includes("SUKSES")) {
            Ax.toast(n + " Sukses Diinjeksi!");
        } else if (hasil && hasil.includes("ERR_ASLI:")) {
            // Bakal ngasih tau lu error aslinya apa! (contoh: curl not found, 404, dll)
            let pesanError = hasil.split("ERR_ASLI:")[1].trim().substring(0, 40); 
            Ax.toast("Gagal: " + pesanError);
        } else {
            Ax.toast("Gagal: Mesin tidak merespon.");
        }

    } catch(e) {
        Ax.toast("Error Sistem JS: " + e.message);
    }
})();
