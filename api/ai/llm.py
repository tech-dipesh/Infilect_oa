import logging

from openai import OpenAI, OpenAIError
from rest_framework.exceptions import APIException

from config import env

log = logging.getLogger(__name__)
groq_url = "https://api.groq.com/openai/v1"
groq_model = "llama-3.3-70b-versatile"
configured = env.LLM_URL or env.GROQ_KEY
settings = {"base_url": env.LLM_URL or groq_url, "api_key": env.GROQ_KEY or "local", "timeout": 30 if env.LLM_URL else 8, "max_retries": 1}
client = OpenAI(**settings) if configured else None
model = env.MODEL if env.LLM_URL else groq_model


class AIUnavailable(APIException):
    status_code = 503
    default_detail = "AI is not available right now, please try again later"


def ask(system: str, prompt: str, json_mode: bool = False, max_tokens: int = 300) -> str:
    if not client: raise AIUnavailable("AI is not configured, set GROQ_KEY (or LLM_URL and MODEL) on the server")
    extra = {"response_format": {"type": "json_object"}} if json_mode else {}
    messages = [{"role": "system", "content": system}, {"role": "user", "content": prompt}]
    try:
        res = client.chat.completions.create(model=model, messages=messages, temperature=0.3, max_tokens=max_tokens, **extra)
    except OpenAIError as err:
        log.warning("llm call failed: %s", err)
        raise AIUnavailable(f"AI call failed: {err}" if env.DEBUG else None) from err
    return (res.choices[0].message.content or "").strip()
