from __future__ import annotations

from collections.abc import Iterable

from seeding.types import ValidationReport


def render_summary(counters: dict[str, int], validation: ValidationReport, dry_run: bool) -> str:
    """Render a simple readable summary table for seeding output."""
    rows = [("Metric", "Value")]
    for key in sorted(counters.keys()):
        rows.append((key, str(counters[key])))

    lines = ["", _table(rows)]

    lines.append("\nValidation checks:")
    check_rows = [("Check", "Count")]
    for key in sorted(validation.checks.keys()):
        check_rows.append((key, str(validation.checks[key])))
    lines.append(_table(check_rows))

    if validation.warnings:
        lines.append("\nWarnings:")
        lines.extend(f"- {warning}" for warning in validation.warnings)

    if validation.critical_errors:
        lines.append("\nCritical errors:")
        lines.extend(f"- {error}" for error in validation.critical_errors)

    if dry_run:
        lines.append("\nDry-run mode enabled: all database writes were rolled back.")

    return "\n".join(lines)


def _table(rows: Iterable[tuple[str, str]]) -> str:
    normalized = list(rows)
    col_a = max(len(row[0]) for row in normalized)
    col_b = max(len(row[1]) for row in normalized)

    out: list[str] = []
    for idx, (left, right) in enumerate(normalized):
        out.append(f"{left.ljust(col_a)} | {right.ljust(col_b)}")
        if idx == 0:
            out.append(f"{'-' * col_a}-+-{'-' * col_b}")
    return "\n".join(out)
