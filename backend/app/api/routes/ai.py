from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from openai import OpenAIError
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.openai_client import get_openai_client
from app.db.database import get_db
from app.models.ticket import Ticket
from app.schemas.ai import AIRequest, AIResult

router = APIRouter()


def _ensure_ai_ready() -> None:
    if settings.ai_provider.lower() not in {"enabled", "openai"}:
        raise HTTPException(status_code=503, detail="AI provider is disabled. Set AI_PROVIDER=openai and OPENAI_API_KEY in backend/.env to enable it.")
    try:
        get_openai_client()
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


def _generate_result(ticket: Ticket, action: str) -> AIResult:
    client = get_openai_client()
    prompt = f"""Analyze this support ticket for the requested action: {action}.
Return only a JSON object with these optional string fields:
summary, category, urgency, next_action, suggested_response, message.
Ticket ID: {ticket.ticket_id}
Customer: {ticket.customer_name} ({ticket.customer_email})
Subject: {ticket.subject}
Description: {ticket.description}
Status: {ticket.status}
"""
    try:
        completion = client.chat.completions.create(
            model=settings.openai_model,
            temperature=0.2,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": "You are a concise customer-support operations assistant."},
                {"role": "user", "content": prompt},
            ],
        )
    except OpenAIError as exc:
        raise HTTPException(status_code=502, detail="The AI provider could not complete the request. Check the OpenAI configuration and try again.") from exc

    content = completion.choices[0].message.content
    if not content:
        raise HTTPException(status_code=502, detail="The AI provider returned an empty response.")
    try:
        return AIResult.model_validate_json(content)
    except ValueError as exc:
        raise HTTPException(status_code=502, detail="The AI provider returned an invalid response.") from exc


def _get_ticket(ticket_id: str, db: Session) -> Ticket:
    _ensure_ai_ready()
    ticket = db.scalar(select(Ticket).where(Ticket.ticket_id == ticket_id))
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found.")
    return ticket


@router.post("/chat")
async def chat_with_ai(payload: AIRequest) -> dict:
    _ensure_ai_ready()
    message = (payload.prompt or "").strip()
    if not message:
        raise HTTPException(status_code=400, detail="A message is required.")

    client = get_openai_client()
    try:
        completion = client.chat.completions.create(
            model=settings.openai_model,
            temperature=0.7,
            messages=[
                {"role": "system", "content": "You are a helpful support operations assistant. Keep answers concise and actionable."},
                {"role": "user", "content": message},
            ],
        )
    except OpenAIError as exc:
        raise HTTPException(status_code=502, detail="The AI provider could not complete the request. Check the OpenAI configuration and try again.") from exc

    content = completion.choices[0].message.content
    if not content:
        raise HTTPException(status_code=502, detail="The AI provider returned an empty response.")

    return {"reply": content.strip()}


@router.post("/tickets/{ticket_id}/summarize")
async def summarize_ticket(ticket_id: str, db: Session = Depends(get_db)) -> AIResult:
    return _generate_result(_get_ticket(ticket_id, db), "summarize")


@router.post("/tickets/{ticket_id}/classify")
async def classify_ticket(ticket_id: str, db: Session = Depends(get_db)) -> AIResult:
    return _generate_result(_get_ticket(ticket_id, db), "classify")


@router.post("/tickets/{ticket_id}/suggest-response")
async def suggest_response(ticket_id: str, db: Session = Depends(get_db)) -> AIResult:
    return _generate_result(_get_ticket(ticket_id, db), "suggest a customer response")


@router.post("/tickets/{ticket_id}/next-action")
async def next_action(ticket_id: str, db: Session = Depends(get_db)) -> AIResult:
    return _generate_result(_get_ticket(ticket_id, db), "recommend the next support action")
