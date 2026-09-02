import sys
import os
import importlib.util

backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "Backend")
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# Load Backend/app.py cleanly avoiding self-import recursion
backend_app_path = os.path.join(backend_dir, "app.py")
spec = importlib.util.spec_from_file_location("backend_app", backend_app_path)
backend_app = importlib.util.module_from_spec(spec)
sys.modules["backend_app"] = backend_app
spec.loader.exec_module(backend_app)

app = backend_app.app

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    print(f"[RENDER DEPLOYMENT] Starting AOTMS WhatsApp CRM API on port {port}...")
    uvicorn.run(app, host="0.0.0.0", port=port, reload=False)
