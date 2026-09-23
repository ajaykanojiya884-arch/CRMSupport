from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class TicketCreate(BaseModel):
    customer_name: str = Field(..., min_length=2, max_length=255)
    customer_email: EmailStr
    subject: str = Field(..., min_length=3, max_length=255)
    description: str = Field(..., min_length=10, max_length=2000)

    model_config = ConfigDict(str_strip_whitespace=True)


class TicketUpdate(BaseModel):
    status: Optional[str] = Field(default=None, pattern=r"^(Open|In Progress|Closed)$")
    notes: Optional[str] = Field(default=None, min_length=1, max_length=2000)


class TicketListItem(BaseModel):
    ticket_id: str
    customer_name: str
    customer_email: str
    subject: str
    status: str
    created_at: datetime
    updated_at: datetime


class TicketDetail(TicketListItem):
    description: str
    notes: List[dict]


class TicketUpdateResponse(BaseModel):
    success: bool
    updated_at: datetime
    ticket_id: str


class TicketListResponse(BaseModel):
    items: List[TicketListItem]
    total: int
    page: int
    page_size: int
    total_pages: int
