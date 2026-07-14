# Generated manually

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('billing', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='fine',
            name='waive_reason',
            field=models.TextField(blank=True, null=True),
        ),
    ]
