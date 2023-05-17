from django.db import models

class JavaScriptFile(models.Model):
    file = models.FileField(upload_to="files")
    slug = models.SlugField(max_length=100, unique=True)

    
