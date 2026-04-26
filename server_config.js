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

        let dlUrl = "https://huggingface.co/datasets/strszt/goddata/resolve/main/" + fileGz;

        if (typeof Ax !== 'undefined') Ax.toast("Menganalisa " + n + " dari Server...");

        // SCRIPT CCTV: Semua command sejajar menurun, catat semua error ke GD_LOG.txt!
        let cmd = `
LOG_FILE="/sdcard/GD_LOG.txt"
TARGET_DIR="${targetDir}"
TMP_FILE="/data/local/tmp/gdtmp.gz"

echo "=== LOG GODDATA V8 ===" > "$LOG_FILE"
echo "Config: ${n}" >> "$LOG_FILE"

echo "1. Mempersiapkan folder..." >> "$LOG_FILE"
mkdir -p "$TARGET_DIR" 2>>"$LOG_FILE"

echo "2. Menghapus sisa file temp..." >> "$LOG_FILE"
rm -f "$TMP_FILE" 2>>"$LOG_FILE"

echo "3. Mencoba download dari Server..." >> "$LOG_FILE"
if command -v curl >/dev/null 2>&1; then
    echo "Menggunakan CURL" >> "$LOG_FILE"
    curl -skL "$dlUrl" -o "$TMP_FILE" 2>>"$LOG_FILE"
elif command -v wget >/dev/null 2>&1; then
    echo "Menggunakan WGET" >> "$LOG_FILE"
    wget -qO "$TMP_FILE" --no-check-certificate "$dlUrl" 2>>"$LOG_FILE"
else
    echo "FATAL: Tidak ada curl atau wget di executor ini!" >> "$LOG_FILE"
fi

echo "4. Mengecek hasil download..." >> "$LOG_FILE"
if [ -s "$TMP_FILE" ]; then
    echo "File berhasil ditarik. Mulai ekstrak..." >> "$LOG_FILE"
    
    toybox tar -xzf "$TMP_FILE" -O | toybox tar --touch -xf - --no-same-owner --no-same-permissions -C "$TARGET_DIR" 2>>"$LOG_FILE"
    
    echo "Ekstrak Selesai." >> "$LOG_FILE"
    rm -f "$TMP_FILE"
    pm trim-caches 999G >/dev/null 2>&1
    
    cmd notification post -S bigtext -t "Goddata System" "Berhasil" "${n} sukses di-inject!"
else
    echo "GAGAL: File kosong atau link ditolak." >> "$LOG_FILE"
    cmd notification post -S bigtext -t "Goddata System" "Gagal" "Buka file /sdcard/GD_LOG.txt buat liat errornya!"
fi
        `;
        
        if (typeof Ax !== 'undefined') {
            await Ax.exec(cmd);
            Ax.toast("Cek notifikasi atau buka file GD_LOG.txt di memori internal lu!");
        }

    } catch(e) {
        if (typeof Ax !== 'undefined') Ax.toast("Error JS: " + e.message);
    }
})();
                            
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
