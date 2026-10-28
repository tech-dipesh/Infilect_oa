import subprocess
import sys

manage = [sys.executable, "manage.py"]


def run(*cmd):
    sys.exit(subprocess.call(cmd))


def dev():
    if subprocess.call([*manage, "migrate"]): sys.exit(1)
    run(*manage, "runserver")


def migrate():
    run(*manage, "migrate")


def generate():
    run(*manage, "makemigrations")


def lint():
    run(sys.executable, "-m", "ruff", "check", ".")


def seed():
    if subprocess.call([*manage, "migrate"]): sys.exit(1)
    run(*manage, "seed")
