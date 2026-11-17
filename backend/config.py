import os
from dotenv import load_dotenv

load_dotenv()

# Centralized Model Configuration
# Change the default model by setting OPENAI_MODEL env var.
MODEL_CONFIG = {
    "default": os.getenv("OPENAI_MODEL", "gpt-5-mini"),
    "fallback": "gpt-5-mini",
    "temperature_default": 0.3,
    "temperature_creative": 0.7,
    "max_tokens_default": 1200,
    "max_retries": 2,
    "timeout_seconds": 30.0,
}

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
