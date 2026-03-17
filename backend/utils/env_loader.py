from pathlib import Path
from typing import Optional

from dotenv import load_dotenv


def load_shared_env(anchor_file: str, override: bool = False) -> Optional[Path]:
    """Load environment variables from docker/.env by walking up parent dirs."""
    anchor = Path(anchor_file).resolve()

    for parent in [anchor.parent, *anchor.parents]:
        docker_env = parent / "docker" / ".env"
        if docker_env.exists():
            load_dotenv(dotenv_path=docker_env, override=override)
            return docker_env

    for parent in [anchor.parent, *anchor.parents]:
        local_env = parent / ".env"
        if local_env.exists():
            load_dotenv(dotenv_path=local_env, override=override)
            return local_env

    load_dotenv(override=override)
    return None
