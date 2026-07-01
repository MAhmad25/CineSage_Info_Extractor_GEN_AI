import shutil
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
FRONTEND_DIR = ROOT / "frontend"
DIST_DIR = FRONTEND_DIR / "dist"


def build_frontend() -> bool:
    if DIST_DIR.exists():
        return True

    npm_cmd = shutil.which("npm")
    if not npm_cmd:
        print("npm was not found; skipping frontend build.", file=sys.stderr)
        return False

    try:
        subprocess.run([npm_cmd, "install"], cwd=FRONTEND_DIR, check=True)
        subprocess.run([npm_cmd, "run", "build"], cwd=FRONTEND_DIR, check=True)
    except subprocess.CalledProcessError as exc:
        print(
            f"Frontend build failed with exit code {exc.returncode}", file=sys.stderr)
        return False

    return DIST_DIR.exists()


if __name__ == "__main__":
    if build_frontend():
        print(f"Frontend built successfully at {DIST_DIR}")
    else:
        raise SystemExit(1)
