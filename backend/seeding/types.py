from __future__ import annotations

from dataclasses import dataclass, field


@dataclass
class ValidationReport:
    critical_errors: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)
    checks: dict[str, int] = field(default_factory=dict)


@dataclass
class SeedExecutionResult:
    counters: dict[str, int]
    validation: ValidationReport
