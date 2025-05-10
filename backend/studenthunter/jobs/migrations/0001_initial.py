

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Job',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=255)),
                ('company', models.CharField(max_length=255)),
                ('company_id', models.CharField(max_length=255)),
                ('location', models.CharField(max_length=255)),
                ('type', models.CharField(max_length=50)),
                ('salary', models.CharField(max_length=50)),
                ('description', models.TextField(blank=True, null=True)),
                ('requirements', models.JSONField(blank=True, null=True)),
                ('responsibilities', models.JSONField(blank=True, null=True)),
                ('benefits', models.JSONField(blank=True, null=True)),
                ('posted_date', models.DateTimeField(auto_now_add=True)),
                ('deadline', models.DateTimeField(blank=True, null=True)),
                ('featured', models.BooleanField(default=False)),
                ('logo', models.ImageField(blank=True, null=True, upload_to='job_logos/')),
                ('industry', models.CharField(blank=True, max_length=255, null=True)),
                ('view_count', models.IntegerField(default=0)),
                ('application_count', models.IntegerField(default=0)),
                ('status', models.CharField(default='active', max_length=50)),
                ('is_active', models.BooleanField(default=True)),
            ],
        ),
    ]
