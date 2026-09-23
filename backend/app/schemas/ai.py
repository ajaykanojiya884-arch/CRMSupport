from __future__ import annotations

from typing import Optional

from pydantic import AliasChoices, BaseModel, Field


class AIRequest(BaseModel):
    prompt: Optional[str] = Field(
        default=None,
        validation_alias=AliasChoices("prompt", "message"),
    )

    @property
    def message(self) -> Optional[str]:
        return self.prompt


class AIResult(BaseModel):
    summary: str = ""
    category: str = ""
    urgency: str = ""
    next_action: str = ""
    suggested_response: str = ""
    message: str = ""
