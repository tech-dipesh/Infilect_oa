def msgs(name: str):
    ask = f"Please enter a {name}"
    return {"required": ask, "blank": ask, "null": ask, "invalid": f"Please enter a valid {name}"}
