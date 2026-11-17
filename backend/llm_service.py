import json
import logging
import re
from typing import Any, Dict, List, Optional, Type, TypeVar
from pydantic import BaseModel, ValidationError
from openai import OpenAI, OpenAIError, RateLimitError, AuthenticationError, APIConnectionError, APITimeoutError

from config import MODEL_CONFIG, OPENAI_API_KEY

logger = logging.getLogger(__name__)

T = TypeVar("T", bound=BaseModel)


class LLMServiceError(Exception):
    """Custom exception raised when LLM generation fails."""
    def __init__(self, message: str, error_type: str = "unknown", status_code: Optional[int] = None):
        super().__init__(message)
        self.error_type = error_type
        self.status_code = status_code


def _clean_json_text(text: str) -> str:
    """Strip markdown code fences and extraneous text around JSON content."""
    text = text.strip()
    if text.startswith("```"):
        # Match ```json ... ``` or ``` ... ```
        match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
        if match:
            text = match.group(1).strip()
        else:
            text = text.strip("`").strip()
    return text


class LLMService:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key if api_key is not None else OPENAI_API_KEY
        self.client: Optional[OpenAI] = None
        if self.api_key and self.api_key.strip():
            try:
                self.client = OpenAI(
                    api_key=self.api_key,
                    timeout=MODEL_CONFIG.get("timeout_seconds", 30.0),
                )
            except Exception as e:
                logger.warning(f"Failed to initialize OpenAI client: {e}")
                self.client = None

    def is_available(self) -> bool:
        """Returns True if client is configured with an API key."""
        return self.client is not None and bool(self.api_key)

    def generate(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
    ) -> str:
        """Generate raw text response from OpenAI."""
        if not self.is_available():
            raise LLMServiceError("OpenAI API key is missing or client is not initialized.", error_type="missing_key")

        selected_model = model or MODEL_CONFIG.get("default", "gpt-4o-mini")
        selected_temp = temperature if temperature is not None else MODEL_CONFIG.get("temperature_default", 0.3)
        selected_max_tokens = max_tokens or MODEL_CONFIG.get("max_tokens_default", 1200)

        try:
            response = self.client.chat.completions.create(
                model=selected_model,
                messages=messages,
                temperature=selected_temp,
                max_tokens=selected_max_tokens,
            )
            content = response.choices[0].message.content
            return content.strip() if content else ""
        except RateLimitError as e:
            logger.warning(f"OpenAI rate limit / quota exhausted: {e}")
            raise LLMServiceError(f"OpenAI quota or rate limit exceeded: {e}", error_type="rate_limit", status_code=429)
        except AuthenticationError as e:
            logger.warning(f"OpenAI authentication error: {e}")
            raise LLMServiceError("Invalid OpenAI API key.", error_type="auth_error", status_code=401)
        except (APIConnectionError, APITimeoutError) as e:
            logger.warning(f"OpenAI network/timeout error: {e}")
            raise LLMServiceError(f"OpenAI network error: {e}", error_type="network_error")
        except OpenAIError as e:
            logger.warning(f"OpenAI API error: {e}")
            raise LLMServiceError(f"OpenAI API error: {e}", error_type="api_error")
        except Exception as e:
            logger.error(f"Unexpected error calling OpenAI: {e}")
            raise LLMServiceError(f"Unexpected LLM error: {e}", error_type="unknown")

    def generate_structured(
        self,
        messages: List[Dict[str, str]],
        schema: Type[T],
        model: Optional[str] = None,
        temperature: Optional[float] = None,
    ) -> T:
        """
        Generate structured output validated against a Pydantic schema.
        Includes automatic retry for invalid JSON or schema mismatches.
        """
        max_retries = MODEL_CONFIG.get("max_retries", 2)
        current_messages = list(messages)

        last_error = None
        for attempt in range(max_retries + 1):
            raw_text = self.generate(
                messages=current_messages,
                model=model,
                temperature=temperature,
            )

            cleaned_text = _clean_json_text(raw_text)
            try:
                data = json.loads(cleaned_text)
                validated = schema.model_validate(data)
                return validated
            except (json.JSONDecodeError, ValidationError) as e:
                last_error = e
                logger.warning(f"Structured output validation failed (attempt {attempt + 1}/{max_retries + 1}): {e}")
                if attempt < max_retries:
                    # Append retry instruction to fix the output
                    current_messages.append({"role": "assistant", "content": raw_text})
                    current_messages.append({
                        "role": "user",
                        "content": (
                            f"The output had a formatting/validation error: {e}.\n"
                            f"Please return ONLY valid JSON matching this schema exactly with no markdown wrapper or extra text."
                        ),
                    })

        raise LLMServiceError(
            f"Failed to obtain valid structured output for {schema.__name__} after retries: {last_error}",
            error_type="validation_error",
        )


# Global singleton instance
llm_service = LLMService()
