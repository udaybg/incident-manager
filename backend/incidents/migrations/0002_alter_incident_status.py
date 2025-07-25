# Generated by Django 4.2.7 on 2025-07-19 18:40

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('incidents', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='incident',
            name='status',
            field=models.CharField(choices=[('reported', 'Reported'), ('mitigating', 'Mitigating'), ('resolved', 'Resolved'), ('postmortem', 'Postmortem'), ('closed', 'Closed')], default='reported', max_length=15),
        ),
    ]
