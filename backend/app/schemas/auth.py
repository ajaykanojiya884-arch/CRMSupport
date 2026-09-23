from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class AuthRequest(BaseModel):
    email: EmailStr


class AuthVerifyRequest(BaseModel):
    email: EmailStr
    code: str = Field(..., min_length=6, max_length=6)


class SessionResponse(BaseModel):
    token: str
    expires_at: datetime


class AuthenticatedUser(BaseModel):
    email: str
    is_authenticated: bool = True
