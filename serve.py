"""Start the offline-capable PWA on localhost; standard library only."""
from pathlib import Path
from functools import partial
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
import webbrowser

app_root = Path(__file__).resolve().parent
handler = partial(SimpleHTTPRequestHandler, directory=str(app_root))
for port in range(8765, 8776):
    try:
        server = ThreadingHTTPServer(("127.0.0.1", port), handler)
        break
    except OSError:
        continue
else:
    raise SystemExit("No free local port in 8765-8775.")
url = f"http://localhost:{port}/index.html"
print(f"Bear Chronicle App: {url}\nKeep this window open. Ctrl+C to stop.")
webbrowser.open(url)
try:
    server.serve_forever()
except KeyboardInterrupt:
    pass
finally:
    server.server_close()
