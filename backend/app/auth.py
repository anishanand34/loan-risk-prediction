import hashlib
import hmac
import secrets

PBKDF2_ITERATIONS = 600_000
_PREFIX = "pbkdf2_sha256"


def hash_password(password: str) -> str:
    """Salted PBKDF2-HMAC-SHA256. Stored as: pbkdf2_sha256$iterations$salt$hash"""
    salt = secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac(
        "sha256", password.encode(), salt.encode(), PBKDF2_ITERATIONS
    ).hex()
    return f"{_PREFIX}${PBKDF2_ITERATIONS}${salt}${digest}"


def _is_legacy(hashed_password: str) -> bool:
    # Old accounts were stored as a plain unsalted SHA-256 hex string
    return not hashed_password.startswith(_PREFIX + "$")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    if _is_legacy(hashed_password):
        legacy = hashlib.sha256(plain_password.encode()).hexdigest()
        return hmac.compare_digest(legacy, hashed_password)

    try:
        _, iterations, salt, digest = hashed_password.split("$")
        candidate = hashlib.pbkdf2_hmac(
            "sha256", plain_password.encode(), salt.encode(), int(iterations)
        ).hex()
    except ValueError:
        return False

    return hmac.compare_digest(candidate, digest)


def needs_rehash(hashed_password: str) -> bool:
    """True for old SHA-256 hashes, so login can upgrade them automatically."""
    return _is_legacy(hashed_password)