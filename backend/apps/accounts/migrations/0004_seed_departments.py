# Generated data migration to seed default departments

from django.db import migrations


def seed_departments(apps, schema_editor):
    Department = apps.get_model('accounts', 'Department')
    default_depts = [
        "Civil",
        "Computer Science",
        "Electrical",
        "Electronics",
        "Information Technology",
        "Mechanical",
        "Other",
    ]
    for name in default_depts:
        Department.objects.get_or_create(name=name)


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0003_department_alter_customuser_user_id'),
    ]

    operations = [
        migrations.RunPython(seed_departments, reverse_code=migrations.RunPython.noop),
    ]
