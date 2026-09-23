from __future__ import annotations

from openai import OpenAI, OpenAIError

from app.core.config import settings

_openai_client: OpenAI | None = None


def get_openai_client() -> OpenAI:
    global _openai_client

    if settings.ai_provider.lower() not in {"enabled", "openai"}:
        raise RuntimeError("AI provider is disabled. Set AI_PROVIDER=openai and OPENAI_API_KEY to enable OpenAI integration.")

    api_key = settings.openai_api_key.strip()
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is missing. Add it to backend/.env before starting the app.")

    if _openai_client is None:
        try:
            _openai_client = OpenAI(api_key=api_key)
        except OpenAIError as exc:
            raise RuntimeError("OpenAI configuration is invalid or the API key is not usable. Verify OPENAI_API_KEY in backend/.env.") from exc

    return _openai_client
