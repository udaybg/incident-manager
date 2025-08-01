# Generated by Django 4.2.7 on 2025-07-22 18:04

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('incidents', '0003_add_test_incident_type'),
    ]

    operations = [
        migrations.CreateModel(
            name='IncidentUpdate',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('content', models.TextField(help_text='Update content/comment')),
                ('author', models.EmailField(help_text='Email of the person posting the update', max_length=254)),
                ('update_type', models.CharField(choices=[('update', 'Update'), ('mitigation', 'Mitigation'), ('resolution', 'Resolution'), ('note', 'Note')], default='update', help_text='Type of update', max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('created_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='incident_updates', to=settings.AUTH_USER_MODEL)),
                ('incident', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='updates', to='incidents.incident')),
            ],
            options={
                'verbose_name': 'Incident Update',
                'verbose_name_plural': 'Incident Updates',
                'ordering': ['-created_at'],
            },
        ),
    ]
