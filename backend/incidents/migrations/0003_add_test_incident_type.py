# Generated by Django 4.2.7 on 2025-07-19 18:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('incidents', '0002_alter_incident_status'),
    ]

    operations = [
        migrations.AlterField(
            model_name='incident',
            name='incident_type',
            field=models.CharField(choices=[('Planned', 'Planned'), ('Outage', 'Outage'), ('External', 'External'), ('Test', 'Test')], default='Planned', max_length=10),
        ),
    ]
