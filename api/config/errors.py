from rest_framework.views import exception_handler


def handler(exc, ctx):
    res = exception_handler(exc, ctx)
    if res is None: return res
    detail = res.data.get("detail") if isinstance(res.data, dict) else None
    res.data = {"error": str(detail) if detail else res.data}
    return res
