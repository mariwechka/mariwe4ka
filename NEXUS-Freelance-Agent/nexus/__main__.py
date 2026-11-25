"""python -m nexus            → UI + API + background agents (one process)
python -m nexus worker     → background agents only (e.g. on a VPS next to a separate API process)"""
import os, sys, threading
from pathlib import Path


def load_env():
    """Minimal .env support (KEY=VALUE lines); real environment variables win. Runs before core reads its paths."""
    f = Path(__file__).resolve().parent.parent / ".env"
    if f.exists():
        for line in f.read_text().splitlines():
            k, sep, v = line.partition("=")
            if sep and not line.lstrip().startswith("#") and v.strip():
                os.environ.setdefault(k.strip(), v.strip().strip('"'))


def main():
    load_env()
    from . import core
    core.init_db()
    if len(sys.argv) > 1 and sys.argv[1] == "worker":
        from . import worker
        worker.start_background()
        threading.Event().wait()
        return
    import uvicorn
    host = os.environ.get("NEXUS_HOST", "127.0.0.1")
    port = int(os.environ.get("NEXUS_PORT", "8765"))
    # Docker publishes the port on the host's 127.0.0.1 only (see docker-compose.yml), so 0.0.0.0 inside it is fine.
    if host not in ("127.0.0.1", "localhost") and not os.environ.get("NEXUS_ACCESS_TOKEN") and not os.environ.get("NEXUS_IN_DOCKER"):
        sys.exit("Refusing to listen on a public interface without NEXUS_ACCESS_TOKEN")
    if "--open" in sys.argv:
        import webbrowser
        threading.Timer(2, webbrowser.open, [f"http://127.0.0.1:{port}"]).start()
    print(f"NEXUS running → http://127.0.0.1:{port}  (Ctrl+C to stop)")
    uvicorn.run("nexus.api:app", host=host, port=port, log_level="warning")


main()
