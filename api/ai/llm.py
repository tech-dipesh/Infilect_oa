import logging

from groq import Groq, GroqError
from rest_framework.exceptions import APIException

from config import env

log = logging.getLogger(__name__)
client = Groq(api_key=env.GROQ_KEY, timeout=8, max_retries=1) if env.GROQ_KEY else None


class AIUnavailable(APIException):
    status_code = 503
    default_detail = "AI is not available right now, please try again later"


def ask(system: str, prompt: str, json_mode: bool = False, max_tokens: int = 300) -> str:
    if not client: raise AIUnavailable("AI is not configured, set GROQ_KEY on the server")
    try:
        res = client.chat.completions.create(
            model=env.MODEL,
            messages=[{"role": "system", "content": system}, {"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=max_tokens,
            response_format={"type": "json_object"} if json_mode else None,
        )
    except GroqError as err:
        log.warning("groq call failed: %s", err)
        raise AIUnavailable from err
    return (res.choices[0].message.content or "").strip()
