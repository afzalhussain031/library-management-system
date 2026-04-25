#!/usr/bin/env python
import os
import sys
from pathlib import Path


def _ensure_project_venv_python():
    """Re-exec into the local .venv interpreter when available.

    This keeps `python manage.py ...` working even if `python` points to a
    global interpreter that does not have project dependencies installed.
    """

    if os.environ.get("DJANGO_VENV_REEXEC") == "1":
        return

    backend_dir = Path(__file__).resolve().parent
    venv_python = backend_dir.parent / ".venv" / "Scripts" / "python.exe"
    current_python = Path(sys.executable).resolve()

    if venv_python.exists() and current_python != venv_python.resolve():
        os.environ["DJANGO_VENV_REEXEC"] = "1"
        os.execv(str(venv_python), [str(venv_python), *sys.argv])

def main():
    _ensure_project_venv_python()
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)

if __name__ == '__main__':
    main()