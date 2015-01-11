# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('board', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Task',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=250)),
                ('description', models.TextField(default=b'', blank=True)),
                ('status', models.SmallIntegerField(default=1, choices=[(1, b'Not started'), (2, b'In progress'), (3, b'Testing'), (4, b'Done')])),
                ('order', models.SmallIntegerField(default=0)),
                ('started', models.DateField(null=True, blank=True)),
                ('due', models.DateField(null=True, blank=True)),
                ('completed', models.DateField(null=True, blank=True)),
                ('assigned', models.ForeignKey(blank=True, to=settings.AUTH_USER_MODEL, null=True)),
                ('sprint', models.ForeignKey(blank=True, to='board.Sprint', null=True)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.RemoveField(
            model_name='tesk',
            name='assigned',
        ),
        migrations.RemoveField(
            model_name='tesk',
            name='sprint',
        ),
        migrations.DeleteModel(
            name='Tesk',
        ),
    ]
