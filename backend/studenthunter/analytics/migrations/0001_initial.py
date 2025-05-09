# Generated by Django 5.2 on 2025-04-14 18:57

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('applications', '0001_initial'),
        ('jobs', '0003_rename_applications_job_application_count_and_more'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='EmployerMetrics',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('total_jobs', models.IntegerField(default=0)),
                ('total_applications', models.IntegerField(default=0)),
                ('total_interviews', models.IntegerField(default=0)),
                ('total_hires', models.IntegerField(default=0)),
                ('average_time_to_hire', models.IntegerField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('employer', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='metrics', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-updated_at'],
                'indexes': [models.Index(fields=['employer', 'created_at'], name='analytics_e_employe_6d9e9a_idx')],
            },
        ),
        migrations.CreateModel(
            name='JobApplicationMetrics',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('source', models.CharField(blank=True, max_length=50, null=True)),
                ('status', models.CharField(max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('application', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='metrics', to='applications.application')),
                ('job', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='application_metrics', to='jobs.job')),
            ],
            options={
                'ordering': ['-created_at'],
                'indexes': [models.Index(fields=['job', 'status'], name='analytics_j_job_id_bab90f_idx'), models.Index(fields=['created_at'], name='analytics_j_created_838b9b_idx')],
            },
        ),
        migrations.CreateModel(
            name='JobView',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('ip_address', models.GenericIPAddressField()),
                ('viewed_at', models.DateTimeField(auto_now_add=True)),
                ('duration', models.IntegerField(blank=True, null=True)),
                ('job', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='job_views', to='jobs.job')),
                ('viewer', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-viewed_at'],
                'indexes': [models.Index(fields=['job', 'viewed_at'], name='analytics_j_job_id_48fac2_idx'), models.Index(fields=['ip_address', 'viewed_at'], name='analytics_j_ip_addr_417dd6_idx')],
            },
        ),
    ]
