import os
from datetime import datetime
from typing import Optional

LOG_DIRECTORY = os.path.join(os.path.dirname(os.path.dirname(__file__)), "logs")
os.makedirs(LOG_DIRECTORY, exist_ok=True)
LOG_FILE_PATH = os.path.join(LOG_DIRECTORY, "transactions.log")

_log4_logger = None
_using_fallback_logger = False

try:
    import log4python  # type: ignore
except ImportError:  # pragma: no cover
    log4python = None  # type: ignore

if log4python is not None:  # pragma: no branch
    _factory_candidates = ("get_logger", "getLogger", "logger", "Logger", "log")
    for candidate in _factory_candidates:
        attr = getattr(log4python, candidate, None)
        if attr is None:
            continue
        if callable(attr):
            try:
                _log4_logger = attr("transactions")
                break
            except TypeError:
                try:
                    _log4_logger = attr(name="transactions")
                    break
                except TypeError:
                    continue
    if _log4_logger is None and hasattr(log4python, "Log4python"):
        manager = getattr(log4python, "Log4python")
        try:
            manager_instance = manager()
            if hasattr(manager_instance, "get_logger"):
                _log4_logger = manager_instance.get_logger("transactions")
        except Exception:
            _log4_logger = None

if _log4_logger is None:
    import logging

    _using_fallback_logger = True
    _log4_logger = logging.getLogger("transactions")
    _log4_logger.setLevel(logging.INFO)

    if not _log4_logger.handlers:
        handler = logging.FileHandler(LOG_FILE_PATH, encoding="utf-8")
        formatter = logging.Formatter("%(message)s")
        handler.setFormatter(formatter)
        _log4_logger.addHandler(handler)


def _write_to_file(entry: str) -> None:
    with open(LOG_FILE_PATH, "a", encoding="utf-8") as stream:
        stream.write(entry + "\n")


def log_endpoint_transaction(
    method: str,
    path: str,
    status_code: int,
    identity: Optional[str] = None,
    remote_addr: Optional[str] = None,
    endpoint: Optional[str] = None,
) -> None:
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    identity_repr = identity or "anonymous"

    fragments = [
        timestamp,
        f"method={method.upper()}",
        f"path={path}",
        f"status={status_code}",
        f"identity={identity_repr}",
    ]

    if remote_addr:
        fragments.append(f"ip={remote_addr}")
    if endpoint:
        fragments.append(f"endpoint={endpoint}")

    entry = " | ".join(fragments)

    try:
        _log4_logger.info(entry)
    except Exception:
        _write_to_file(entry)
        return

    if not _using_fallback_logger:
        _write_to_file(entry)
