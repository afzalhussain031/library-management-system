from __future__ import annotations

from typing import Any

from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import User

from apps.accounts.models import UserProfile
from seeding.constants import (
    DEFAULT_USER_PASSWORD,
    DEPARTMENTS,
    ROLE_WEIGHTS,
    SEED_EMAIL_DOMAIN,
    SEED_USERNAME_PREFIX,
)
from seeding.random_utils import pick_random, weighted_choice


def seed_users_and_profiles(*, count: int, faker: Any, seed: int) -> tuple[list[User], dict[str, int]]:
    """Create or update seeded users and ensure each one has a profile."""
    counters = {
        "users_created": 0,
        "users_updated": 0,
        "profiles_created": 0,
        "profiles_updated": 0,
    }

    if count <= 0:
        return [], counters

    usernames = [f"{SEED_USERNAME_PREFIX}{seed}_{idx:05d}" for idx in range(count)]
    existing_by_username = {
        user.username: user
        for user in User.objects.filter(username__in=usernames).only(
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "is_staff",
            "password",
        )
    }

    users_to_create: list[User] = []
    users_to_update: list[User] = []
    user_payload: dict[str, tuple[str, str, bool, str, str]] = {}

    for idx, username in enumerate(usernames):
        role = weighted_choice(ROLE_WEIGHTS)
        first_name = faker.first_name()
        last_name = faker.last_name()
        phone_number = faker.phone_number()[:20]
        email = f"{username}@{SEED_EMAIL_DOMAIN}"
        is_staff = role in {"staff", "librarian"}

        department = pick_random(DEPARTMENTS[role])
        student_id = ""
        if role == "student":
            entry_year = 2017 + (idx % 9)
            student_id = f"S{entry_year}{idx:06d}"

        user_payload[username] = (role, department, is_staff, student_id, phone_number)

        existing = existing_by_username.get(username)
        if existing is None:
            users_to_create.append(
                User(
                    username=username,
                    email=email,
                    first_name=first_name,
                    last_name=last_name,
                    is_staff=is_staff,
                    is_active=True,
                    password=make_password(DEFAULT_USER_PASSWORD),
                )
            )
            continue

        dirty = False
        if existing.email != email:
            existing.email = email
            dirty = True
        if existing.first_name != first_name:
            existing.first_name = first_name
            dirty = True
        if existing.last_name != last_name:
            existing.last_name = last_name
            dirty = True
        if existing.is_staff != is_staff:
            existing.is_staff = is_staff
            dirty = True

        if dirty:
            users_to_update.append(existing)

    if users_to_create:
        User.objects.bulk_create(users_to_create, batch_size=500)
        counters["users_created"] = len(users_to_create)

    if users_to_update:
        User.objects.bulk_update(
            users_to_update,
            fields=["email", "first_name", "last_name", "is_staff"],
            batch_size=500,
        )
        counters["users_updated"] = len(users_to_update)

    users = list(User.objects.filter(username__in=usernames).order_by("id"))
    profiles_by_user_id = {
        profile.user_id: profile
        for profile in UserProfile.objects.filter(user_id__in=[user.id for user in users])
    }

    profiles_to_create: list[UserProfile] = []
    profiles_to_update: list[UserProfile] = []

    for user in users:
        role, department, _, student_id, phone_number = user_payload[user.username]
        bio = f"Seeded {role} account for development data."
        profile = profiles_by_user_id.get(user.id)

        if profile is None:
            profiles_to_create.append(
                UserProfile(
                    user=user,
                    role=role,
                    bio=bio,
                    phone_number=phone_number,
                    department=department,
                    student_id=student_id,
                )
            )
            continue

        dirty = False
        if profile.role != role:
            profile.role = role
            dirty = True
        if profile.bio != bio:
            profile.bio = bio
            dirty = True
        if profile.department != department:
            profile.department = department
            dirty = True
        if profile.student_id != student_id:
            profile.student_id = student_id
            dirty = True
        if profile.phone_number != phone_number:
            profile.phone_number = phone_number
            dirty = True

        if dirty:
            profiles_to_update.append(profile)

    if profiles_to_create:
        UserProfile.objects.bulk_create(profiles_to_create, batch_size=500)
        counters["profiles_created"] = len(profiles_to_create)

    if profiles_to_update:
        UserProfile.objects.bulk_update(
            profiles_to_update,
            fields=["role", "bio", "phone_number", "department", "student_id"],
            batch_size=500,
        )
        counters["profiles_updated"] = len(profiles_to_update)

    users = list(User.objects.filter(username__in=usernames).order_by("id"))
    return users, counters
