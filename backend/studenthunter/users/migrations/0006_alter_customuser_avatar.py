# Generated by Django 5.2 on 2025-04-14 17:45

import users.storage
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0005_alter_customuser_company_alter_customuser_last_login_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='customuser',
            name='avatar',
            field=models.ImageField(blank=True, help_text='Profile picture', null=True, storage=users.storage.AvatarStorage(), upload_to='avatars/'),
        ),
    ]
