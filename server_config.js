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

        if (typeof Ax !== 'undefined') Ax.toast("Menarik data " + n + " dari Server...");

        // INI SCRIPT SHELL MURNI (KAGAK BAKAL CRASH "INCOUDION" LAGI)
        let cmd = `
            TARGET_DIR="${targetDir}"
            TMP_FILE="/sdcard/Download/gdtmp_goddata.gz"
            
            # Bikin folder target dan hapus file temp sisaan
            mkdir -p "$TARGET_DIR" 2>/dev/null
            rm -f "$TMP_FILE"
            
            # Coba download pakai curl atau wget, sikat habis!
            curl -sL "${dlUrl}" -o "$TMP_FILE" || wget -qO "$TMP_FILE" "${dlUrl}" --no-check-certificate || toybox wget -qO "$TMP_FILE" "${dlUrl}"
            
            # CEK MUTLAK: Apakah file berhasil didownload dan ga kosong?
            if [ -s "$TMP_FILE" ]; then
                # Hajar ekstrak pake single pipe lu!
                toybox tar -xzf "$TMP_FILE" -O | toybox tar --touch -xf - --no-same-owner --no-same-permissions -C "$TARGET_DIR" 2>/dev/null
                
                # Sapu bersih file mentahan
                rm -f "$TMP_FILE"
                pm trim-caches 999G >/dev/null 2>&1
                
                # Keluarin Notifikasi Android kalau sukses
                cmd notification post -S bigtext -t "Goddata System" "Berhasil" "${n} sukses di-inject!"
            else
                rm -f "$TMP_FILE"
                # Keluarin Notifikasi Android kalau gagal
                cmd notification post -S bigtext -t "Goddata System" "Gagal" "Gagal narik config. Cek sinyal atau link HuggingFace lu."
            fi
        `;
        
        // Hajar langsung ke mesin Axeron tanpa ngebaca return hasil JS!
        if (typeof Ax !== 'undefined') {
            await Ax.exec(cmd);
        }

    } catch(e) {
        if (typeof Ax !== 'undefined') Ax.toast("Error Sistem: " + e.message);
    }
})();
