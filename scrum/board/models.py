from django.db import models
from django.conf import settings


class Sprint(models.Model):
    """ a Dev iteration period """

    name = models.CharField(max_length=100, blank=True, default='')
    description = models.TextField(blank=True, default='')
    end = models.DateField()

    def __str__(self):
        if self.name != '':
            return "<Sprint: %s>" % self.name
        return '<Sprint ending %s>' % self.end


class Task(models.Model):
    """ a dev task """

    STATUS_TODO = 1
    STATUS_IN_PROGRESS = 2
    STATUS_TESTING = 3
    STATUS_DONE = 4

    STATUS_CHOICES = (
        (STATUS_TODO, 'Not started'),
        (STATUS_IN_PROGRESS, 'In progress'),
        (STATUS_TESTING, 'Testing'),
        (STATUS_DONE, 'Done'),
    )

    name = models.CharField(max_length=250)
    description = models.TextField(blank=True, default='')
    sprint = models.ForeignKey(Sprint, blank=True, null=True)
    status = models.SmallIntegerField(choices=STATUS_CHOICES, default=STATUS_TODO)
    order = models.SmallIntegerField(default=0)
    assigned = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True)
    started = models.DateField(blank=True, null=True)
    due = models.DateField(blank=True, null=True)
    completed = models.DateField(blank=True, null=True)

    def __str__(self):
        return "<Task: %s>" % self.name

