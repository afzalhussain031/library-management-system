# Development Seeding Guide

This project ships with a modular seeding system for realistic, deterministic development data.

## Command

Run from the backend directory:

```powershell
python manage.py seed_data --profile small
```

The command is owned by the neutral `ops` app:

- `apps/ops/management/commands/seed_data.py`: command entrypoint
- `apps/seeding/`: modular seeding engine used by the command

## Options

- `--users`: Override user count
- `--books`: Override book count
- `--copies-per-book`: Override copy count per book
- `--seed`: Deterministic random seed (default: `20260426`)
- `--reset`: Remove seeded data before reseeding
- `--dry-run`: Execute all logic and rollback writes
- `--profile`: `small`, `medium`, `large`
- `--with-fines-percent`: Chance (%) that overdue returned loans produce a fine
- `--with-overdue-percent`: Chance (%) that generated loans are overdue

## Profile Presets

- `small`: 30 users, 40 books, 2 copies/book
- `medium`: 120 users, 200 books, 3 copies/book
- `large`: 350 users, 1200 books, 4 copies/book

Percent defaults for fines/overdue are also profile-based and can be overridden.

## Deterministic Behavior

The seeder initializes both `random.seed(...)` and `Faker.seed(...)`, so using the same `--seed` and options creates repeatable records.

## Seeded Marker Strategy (No Schema Changes)

Seeded records are identified using deterministic prefixes:

- Users: `username` starts with `seed_u_`
- Categories: `name` starts with `SEED-CAT:`
- Publishers: `name` starts with `SEED-PUB:`
- Books: `title` starts with `SEED-BOOK:`
- Copies: `accession_number` starts with `SEED-ACC-`

Loans, reservations, and fines are identified through these seeded relationships.

## Environment Guidance

This seeder is designed for repeatable development and staging data.

- Development: use `--profile small` or `--profile medium` with `--reset` when you need a clean local dataset.
- Staging: use a fixed `--seed` value so test runs stay deterministic across deploys.
- Production: avoid running the full synthetic data generator against live data; use a dedicated bootstrap/fixture flow for reference tables instead.

## Reset Safety

`--reset` deletes only seeded records in reverse dependency order:

1. fines
2. reservations
3. loans
4. copies
5. books
6. categories/publishers
7. profiles/users

Non-seeded users, superusers, and real production-like admin data are preserved by default.

## Data Assumptions and Invariants

The seeder enforces:

- Active loans keep `BookCopy.status = loaned`
- Returned loans set `BookCopy.status = available`
- `Loan.due_at > Loan.issued_at`
- Returned loans satisfy `returned_at >= issued_at`
- Fines are created only for loans where `returned_at > due_at`
- One fine per loan (model-level OneToOne)
- Every seeded non-superuser has a `UserProfile`
- Open reservation duplicates (`pending`/`ready`) per user-book pair are prevented

## Internal Validation

After seeding, validation checks run automatically and report:

- orphan checks
- status consistency
- date coherence
- reservation duplication sanity
- fine-date coherence

Critical integrity failures cause the command to fail fast.

## Module Layout

- `apps/seeding/constants.py`: shared defaults and policy constants
- `apps/seeding/random_utils.py`: deterministic random/Faker helpers
- `apps/seeding/generators/users.py`: users and profiles
- `apps/seeding/generators/catalog.py`: categories and publishers
- `apps/seeding/generators/books.py`: books
- `apps/seeding/generators/copies.py`: inventory copies
- `apps/seeding/generators/circulation.py`: loans
- `apps/seeding/generators/reservations.py`: reservations
- `apps/seeding/generators/fines.py`: fines
- `apps/seeding/cleanup.py`: safe reset
- `apps/seeding/validators.py`: validation and integrity checks
- `apps/seeding/orchestrator.py`: relationship-aware orchestration
- `apps/ops/management/commands/seed_data.py`: command entrypoint

## Extending with a New Domain

1. Add a generator module under `apps/seeding/generators/`.
2. Keep seeded marker conventions deterministic in unique fields.
3. Return domain counters from generator functions.
4. Wire creation order in `SeedOrchestrator.run(...)`.
5. Add reset hooks in `cleanup.py` if your domain owns rows.
6. Add validation checks in `validators.py` for new invariants.
7. Add or extend tests in `backend/tests/test_seed_data_command.py`.
