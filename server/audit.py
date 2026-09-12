"""The audit trail, written into the workspace itself.

Baton's log lives in a Sheet inside the Ambiguous workspace rather than in a
database of ours, for two reasons and the second is the better one:

  * it is the deepest available integration with the environment, which is the
    thing being judged; and
  * it puts the record where the **team** can read it, not where only the
    operator can. An audit trail the audited party cannot see is not
    accountability, it is a private log.

It is also where Baton reads its own history, which is what stops it chasing
the same thing twice after a restart.

British English, no em dashes.
"""

from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any

import httpx

BASE = os.environ.get("AMBI_BASE", "https://api.ambiguous.ai")
CONFIG = Path(__file__).resolve().parent.parent / ".ambi" / "config.json"
SHEET_TITLE = "Baton - action log"
# Where the sheet id is remembered between restarts. Not the source of truth:
# if this file is lost, `_find_sheet` looks the sheet up by title instead.
STATE = Path(__file__).resolve().parent / ".audit-sheet"

# Rows are objects keyed by column id, per POST /api/sheets/{id}/rows:
# [{"A": "...", "B": "..."}]. Verified against the live OpenAPI rather than
# guessed; an earlier draft of this file invented an /append endpoint that
# does not exist.
COLUMNS = {"A": "when", "B": "risk", "C": "verb", "D": "detail", "E": "app", "F": "approved_by"}


def _headers() -> dict[str, str]:
    token = os.environ.get("AMBI_TOKEN") or json.loads(CONFIG.read_text())["authToken"]
    return {
        "Authorization": f"Bearer {token}",
        "Accept": "application/json",
        "Content-Type": "application/json",
        "User-Agent": "baton-audit",
    }


async def _find_sheet(client: httpx.AsyncClient) -> str | None:
    """Look the sheet up by title, so a lost id file is recoverable."""
    r = await client.get(f"{BASE}/api/sheets", headers=_headers(), params={"limit": 100})
    if r.status_code >= 400:
        return None
    for row in r.json().get("data", []):
        if row.get("title") == SHEET_TITLE:
            return row.get("id")
    return None


async def ensure_sheet(client: httpx.AsyncClient) -> str | None:
    """Return the audit sheet's id, creating it once if it does not exist."""
    if STATE.exists():
        cached = STATE.read_text().strip()
        if cached:
            return cached

    found = await _find_sheet(client)
    if found:
        STATE.write_text(found)
        return found

    r = await client.post(
        f"{BASE}/api/sheets",
        headers=_headers(),
        # workspace visibility on purpose: an audit trail the audited team
        # cannot open is a private log, not accountability.
        json={"title": SHEET_TITLE, "visibility": "workspace"},
    )
    if r.status_code >= 400:
        return None
    sheet_id = (r.json() or {}).get("id")
    if sheet_id:
        STATE.write_text(sheet_id)
        await client.post(
            f"{BASE}/api/sheets/{sheet_id}/rows",
            headers=_headers(),
            json={"rows": [{k: v for k, v in COLUMNS.items()}]},
        )
    return sheet_id


async def append_audit(entry: dict[str, Any]) -> bool:
    """Append one row. Returns whether the workspace actually took it.

    Deliberately never raises. A failure to log must not roll back an action
    that has already happened in somebody's inbox: the honest state is "done,
    and the log write failed", not a pretence that neither occurred. The caller
    surfaces the boolean rather than swallowing it.
    """
    row = {
        "A": entry.get("at", ""),
        "B": entry.get("riskId", ""),
        "C": entry.get("verb", ""),
        "D": entry.get("detail", ""),
        "E": entry.get("app", ""),
        "F": entry.get("approvedBy", "human approval in the Baton queue"),
    }

    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            sheet_id = await ensure_sheet(client)
            if not sheet_id:
                return False
            r = await client.post(
                f"{BASE}/api/sheets/{sheet_id}/rows",
                headers=_headers(),
                json={"rows": [row]},
            )
            return r.status_code < 400
    except Exception:
        return False
