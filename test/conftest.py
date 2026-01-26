import os
import shutil
import tempfile

import pytest

from server import create_app
from database import db


@pytest.fixture
def app():
    temp_dir = tempfile.mkdtemp(prefix="lab-tests-")
    db_path = os.path.join(temp_dir, "test.db")

    os.environ["DATABASE_URL"] = f"sqlite:///{db_path}"
    os.environ["JWT_SECRET_KEY"] = "testing-secret-key"

    flask_app = create_app()
    flask_app.config.update(
        TESTING=True,
        SQLALCHEMY_DATABASE_URI=os.environ["DATABASE_URL"],
        JWT_ACCESS_TOKEN_EXPIRES=False,
    )

    with flask_app.app_context():
        db.create_all()

    yield flask_app

    with flask_app.app_context():
        db.session.remove()
        db.drop_all()

    shutil.rmtree(temp_dir, ignore_errors=True)
    os.environ.pop("DATABASE_URL", None)


@pytest.fixture
def client(app):
    return app.test_client()
