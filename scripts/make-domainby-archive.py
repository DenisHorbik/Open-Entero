from __future__ import annotations

import hashlib
import json
from pathlib import Path
import shutil
import zipfile


root = Path(__file__).resolve().parents[1]
stage = root / ".domainby-release"
output = root / "entero-open-domainby-linux.zip"

if stage.exists():
    shutil.rmtree(stage)
stage.mkdir()

for directory in ("dist", "server"):
    shutil.copytree(root / directory, stage / directory)

(stage / "server.js").write_text(
    """import { existsSync } from "node:fs";

const envFile = new URL("./crm-config.txt", import.meta.url);

if (existsSync(envFile)) {
  process.loadEnvFile(envFile);
}

await import("./server/index.mjs");
""",
    encoding="utf-8",
)
(stage / "package.json").write_text(
    json.dumps(
        {
            "name": "open.entero.by",
            "version": "1.0.0",
            "private": True,
            "type": "module",
            "main": "server.js",
            "engines": {"node": ">=22.13.0"},
            "scripts": {"start": "node server.js"},
        },
        ensure_ascii=False,
        indent=2,
    )
    + "\n",
    encoding="utf-8",
)

files = sorted(path for path in stage.rglob("*") if path.is_file())
manifest = {
    "domain": "open.entero.by",
    "entrypoint": "server.js",
    "start": "npm start",
    "port_env": "PORT",
    "file_count": len(files),
    "files": {
        path.relative_to(stage).as_posix(): {
            "bytes": path.stat().st_size,
            "sha256": hashlib.sha256(path.read_bytes()).hexdigest(),
        }
        for path in files
    },
}
(stage / "DEPLOY_MANIFEST.json").write_text(
    json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
)

if output.exists():
    output.unlink()

with zipfile.ZipFile(output, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
    for path in sorted(stage.rglob("*"), key=lambda p: p.as_posix()):
        relative = path.relative_to(stage).as_posix()
        if path.is_dir():
            info = zipfile.ZipInfo(relative.rstrip("/") + "/")
            info.create_system = 3
            info.external_attr = (0o40755 << 16) | 0x10
            archive.writestr(info, b"")
        else:
            info = zipfile.ZipInfo(relative)
            info.create_system = 3
            info.external_attr = 0o100644 << 16
            info.compress_type = zipfile.ZIP_DEFLATED
            archive.writestr(info, path.read_bytes())

with zipfile.ZipFile(output) as archive:
    bad_directories = [
        info.filename
        for info in archive.infolist()
        if info.is_dir() and ((info.external_attr >> 16) & 0o777) != 0o755
    ]
    if bad_directories:
        raise RuntimeError(f"Invalid directory permissions: {bad_directories}")

print(output)
print(f"payload files: {len(files) + 1}")
print(f"archive bytes: {output.stat().st_size}")
